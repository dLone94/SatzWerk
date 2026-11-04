import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type ColorRepresentation,
  type Material,
  type Object3D,
  type WebGLRenderTarget,
} from 'three';
import { Kit } from './kit.ts';
import { seeded } from './motion.ts';

export type Mood = 'day' | 'evening';

export interface SpawnOptions {
  count?: number;
  color?: ColorRepresentation;
  opacity?: number;
  additive?: boolean;
  up?: number;
  speed?: number;
  life?: number;
  size?: number;
  grow?: number;
  gravity?: number;
}

/** One puff or burst of sparkles: its particles share one material and fade together. */
interface Burst {
  material: SpriteMaterial;
  age: number;
  life: number;
  base: number;
  left: number;
}

interface Particle {
  sprite: Sprite;
  burst: Burst;
  v: Vector3;
  life: number;
  age: number;
  size: number;
  grow: number;
  gravity: number;
}

export interface StageOptions {
  mood: Mood;
  /** Draw the finished pose once and never loop: reduced motion. */
  still: boolean;
  /** The first frame is on the canvas. */
  onReady: () => void;
  /** The browser took the WebGL context away. */
  onLost: () => void;
  /** Build the scene again in a fresh canvas: its slot changed shape past what its layout allows. */
  rebuild?: () => void;
}

/*
 * Lights. Since three r155 lights are physically based, and an intensity
 * that looked right under the old model reads about π times too dim. The
 * prototype's values are kept here as written and scaled once, so they can
 * be compared with it and tuned in one place.
 */
const PHYSICAL = Math.PI;

/** Once the scene's story is told, the ambient motion is drawn at most this often. */
const AMBIENT_FPS = 30;
/**
 * Seconds of ambient motion after the story, and after the last thing that
 * happened (the pointer, typing, "Show again"), before the loop rests on
 * its last frame. A picture that has settled costs no battery; the pointer
 * or the next keystroke wakes it.
 */
const SETTLE_AFTER = 5;

/** A soft studio surround for the lacquer to reflect: warm by day, blue at dusk. */
function environment(renderer: WebGLRenderer, mood: Mood): WebGLRenderTarget {
  const room = new Scene();
  const evening = mood === 'evening';
  const geometry = new SphereGeometry(10, 32, 16);
  const colours: number[] = [];
  const position = geometry.attributes.position!;
  const top = new Color(evening ? 0x2a3350 : 0x6e6252);
  const bottom = new Color(evening ? 0x120d0a : 0x2c241c);
  for (let i = 0; i < position.count; i++) {
    const k = (position.getY(i) / 10 + 1) / 2;
    const c = bottom.clone().lerp(top, k);
    colours.push(c.r, c.g, c.b);
  }
  geometry.setAttribute('color', new Float32BufferAttribute(colours, 3));
  const sky = new MeshBasicMaterial({ vertexColors: true, side: BackSide });
  room.add(new Mesh(geometry, sky));
  const panels: Array<[number, number, number, number, number]> = [
    [4, 6, 3, 2.4, 0xfff4e0],
    [-6, 3, -2, 1.6, evening ? 0xffa64a : 0xffe8c0],
  ];
  const disposables: Array<{ dispose(): void }> = [geometry, sky];
  for (const [x, y, z, size, colour] of panels) {
    const plane = new PlaneGeometry(size, size);
    const material = new MeshBasicMaterial({ color: colour, side: DoubleSide });
    const panel = new Mesh(plane, material);
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    room.add(panel);
    disposables.push(plane, material);
  }
  const generator = new PMREMGenerator(renderer);
  const target = generator.fromScene(room, 0.03);
  generator.dispose();
  disposables.forEach((item) => item.dispose());
  return target;
}

export type FrameFn = (t: number, dt: number) => void;

export class Stage {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(32, 1, 0.1, 120);
  readonly renderer: WebGLRenderer;
  readonly kit: Kit;
  readonly rand: () => number;
  /** Drawn in its finished pose only: reduced motion, from the start or since `settle`. */
  still: boolean;
  readonly cam = { pos: new Vector3(0, 3, 8), look: new Vector3(0, 0.5, 0), parallax: 0.35 };
  /** The moment of the scene drawn under reduced motion: its finished pose. */
  stillTime = 6;

  private readonly frames: FrameFn[] = [];
  private particles: Particle[] = [];
  private readonly framers: Array<() => void> = [];
  private readonly settlers: Array<() => void> = [];
  /** The scene's clock when something last happened that is worth watching. */
  private stirredAt = 0;
  private fired = new Set<string>();
  private readonly pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private readonly envTarget: WebGLRenderTarget;
  private raf = 0;
  private t = 0;
  private last = 0;
  private alive = true;
  private ready = false;
  private onScreen = true;
  private started = false;
  private readonly cleanups: Array<() => void> = [];

  constructor(readonly canvas: HTMLCanvasElement, private readonly options: StageOptions) {
    this.still = options.still;
    this.rand = seeded(7);
    // Lettering repainted once the app's typeface has loaded is drawn again.
    this.kit = new Kit(this.rand, () => this.redraw());
    // The default GPU, not the fast one: on a laptop with two, decoration is
    // no reason to wake the one that drains the battery. A renderer that
    // would draw in software fails here, and the picture stays.
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, failIfMajorPerformanceCaveat: true });
    // Two device pixels per CSS pixel is as sharp as a phone shows; three
    // would cost more than twice the work for nothing anyone sees.
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    const evening = options.mood === 'evening';
    this.renderer.toneMappingExposure = evening ? 1.05 : 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;

    this.envTarget = environment(this.renderer, options.mood);
    this.scene.environment = this.envTarget.texture;

    this.scene.add(new HemisphereLight(evening ? 0x9fb0e0 : 0xfff3df, evening ? 0x3b2a1e : 0xc8ae86, (evening ? 0.35 : 0.5) * PHYSICAL));
    const key = new DirectionalLight(evening ? 0xffd6a0 : 0xfff1dc, (evening ? 0.7 : 1.35) * PHYSICAL);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 4;
    const sc = key.shadow.camera;
    sc.left = -7; sc.right = 7; sc.top = 7; sc.bottom = -7; sc.near = 1; sc.far = 30;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);
    const rim = new DirectionalLight(evening ? 0x7f9cff : 0xcfe2ff, (evening ? 0.55 : 0.4) * PHYSICAL);
    rim.position.set(-6, 4, -7);
    this.scene.add(rim);
    const ground = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: evening ? 0.3 : 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.listen(canvas, 'webglcontextlost', () => {
      if (this.alive) this.options.onLost();
    });
    // The parallax is decoration only: the scene reacts, nothing is clicked.
    if (!this.still) {
      this.listen(canvas, 'pointermove', (event) => {
        const e = event as PointerEvent;
        const r = canvas.getBoundingClientRect();
        this.pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
        this.pointer.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
        this.stir();
      });
      this.listen(canvas, 'pointerleave', () => {
        this.pointer.tx = 0;
        this.pointer.ty = 0;
        this.stir();
      });
      // Nothing is drawn while the tab is hidden or the canvas is scrolled away.
      this.listen(document, 'visibilitychange', () => this.wake());
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver((entries) => {
          this.onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
          this.wake();
        });
        io.observe(canvas);
        this.cleanups.push(() => io.disconnect());
      }
    }
    if (typeof ResizeObserver !== 'undefined') {
      // A window resized, a tablet turned, a split screen: the scene is
      // framed again for its slot's new shape, not left cropped.
      const ro = new ResizeObserver(() => {
        if (!this.size()) return;
        for (const framer of this.framers) framer();
        this.invalidate();
      });
      ro.observe(canvas);
      this.cleanups.push(() => ro.disconnect());
    }
    if (!this.size()) {
      // Not laid out (yet): a stand-in shape, never drawn at, until the
      // ResizeObserver reports the real one.
      this.renderer.setSize(390, 300, false);
      this.camera.aspect = 390 / 300;
      this.camera.updateProjectionMatrix();
    }
  }

  private listen(target: EventTarget, type: string, fn: (event: Event) => void): void {
    target.addEventListener(type, fn);
    this.cleanups.push(() => target.removeEventListener(type, fn));
  }

  /** Match the canvas's laid-out size. False, and nothing changed, while it has none. */
  private size(): boolean {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return false;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    return true;
  }

  /**
   * Point the camera for the slot's shape: run now, and again whenever the
   * slot is resized. A scene frames itself with this, never once only.
   */
  framing(fn: () => void): void {
    this.framers.push(fn);
    fn();
  }

  /** Ask for the scene to be built again in a fresh canvas (see StageOptions.rebuild). */
  rebuild(): void {
    if (this.alive) this.options.rebuild?.();
  }

  get aspect(): number {
    return this.camera.aspect;
  }

  onFrame(fn: FrameFn): void {
    this.frames.push(fn);
  }

  /** What to put away when the scene settles mid-way (see `settle`): drifting dust, falling chips. */
  onSettle(fn: () => void): void {
    this.settlers.push(fn);
  }

  /** The distance at which a width `w` fills the view. */
  fit(w: number): number {
    const v = MathUtils.degToRad(this.camera.fov / 2);
    const hf = Math.atan(Math.tan(v) * this.camera.aspect);
    return w / 2 / Math.tan(hf);
  }

  /** The distance at which a height `h` fills the view. */
  fitHeight(h: number): number {
    return h / 2 / Math.tan(MathUtils.degToRad(this.camera.fov / 2));
  }

  /**
   * Where to put the camera, looking along `tilt` (from the target towards
   * the camera), so that every point is in view with a margin, centred.
   * Worked out by trying: perspective makes the near side larger than the
   * far, and a box drawn on the table does not say how it will look on a
   * slot of this shape.
   */
  frame(points: Vector3[], tilt: Vector3, fill = 0.86): { look: Vector3; pos: Vector3 } {
    const camera = this.camera.clone();
    const look = points.reduce((sum, p) => sum.add(p), new Vector3()).multiplyScalar(1 / points.length);
    const dir = tilt.clone().normalize();
    let distance = 10;
    const right = new Vector3();
    const up = new Vector3();
    const ndc = new Vector3();
    for (let i = 0; i < 40; i++) {
      camera.position.copy(look).addScaledVector(dir, distance);
      camera.lookAt(look);
      camera.updateMatrixWorld(true);
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const p of points) {
        ndc.copy(p).project(camera);
        minX = Math.min(minX, ndc.x);
        maxX = Math.max(maxX, ndc.x);
        minY = Math.min(minY, ndc.y);
        maxY = Math.max(maxY, ndc.y);
      }
      const extent = Math.max(maxX - minX, maxY - minY) / 2;
      const halfH = distance * Math.tan(MathUtils.degToRad(camera.fov / 2));
      const halfW = halfH * camera.aspect;
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      look.addScaledVector(right, ((minX + maxX) / 2) * halfW * 0.8);
      look.addScaledVector(up, ((minY + maxY) / 2) * halfH * 0.8);
      distance *= 0.3 + 0.7 * (extent / fill);
    }
    return { look, pos: look.clone().addScaledVector(dir, distance) };
  }

  /** Runs `fn` once when the clock passes `at`; `restart` re-arms it. */
  once(key: string, t: number, at: number, fn: () => void): void {
    if (t >= at && !this.fired.has(key)) {
      this.fired.add(key);
      fn();
    }
  }

  /** Short-lived dust puffs and sparkles. None at all under reduced motion. */
  spawn(at: Vector3, o: SpawnOptions): void {
    if (this.still) return;
    const count = o.count ?? 10;
    const life = o.life ?? 0.8;
    // One material for the whole burst: its particles fade together.
    const burst: Burst = {
      material: new SpriteMaterial({
        map: this.kit.glow(),
        color: o.color ?? 0xffffff,
        transparent: true,
        depthWrite: false,
        opacity: o.opacity ?? 0.8,
        blending: o.additive ? AdditiveBlending : NormalBlending,
      }),
      age: 0,
      life: life * 1.3,
      base: o.opacity ?? 0.8,
      left: count,
    };
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(burst.material);
      const a = this.rand() * Math.PI * 2;
      const up = o.up ?? 0.6;
      const speed = (o.speed ?? 1) * (0.5 + this.rand());
      sprite.position.copy(at);
      this.scene.add(sprite);
      this.particles.push({
        sprite,
        burst,
        v: new Vector3(Math.cos(a) * speed, up * (0.5 + this.rand()) * (o.speed ?? 1), Math.sin(a) * speed * 0.6),
        life: life * (0.7 + this.rand() * 0.6),
        age: 0,
        size: (o.size ?? 0.25) * (0.6 + this.rand() * 0.8),
        grow: o.grow ?? 1.5,
        gravity: o.gravity ?? 0,
      });
    }
  }

  private stepParticles(dt: number): void {
    const bursts = new Set<Burst>();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) {
        this.scene.remove(p.sprite);
        if (--p.burst.left === 0) p.burst.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      bursts.add(p.burst);
      p.v.y -= p.gravity * dt;
      p.v.multiplyScalar(1 - dt * 1.8);
      p.sprite.position.addScaledVector(p.v, dt);
      const s = p.size * (1 + k * p.grow);
      p.sprite.scale.set(s, s, 1);
    }
    for (const burst of bursts) {
      burst.age += dt;
      const k = Math.min(1, burst.age / burst.life);
      burst.material.opacity = burst.base * (1 - k) * (1 - k);
    }
  }

  private clearParticles(): void {
    const materials = new Set<SpriteMaterial>();
    for (const p of this.particles) {
      this.scene.remove(p.sprite);
      materials.add(p.burst.material);
    }
    materials.forEach((material) => material.dispose());
    this.particles = [];
  }

  private draw(t: number, dt: number): void {
    const ease = Math.min(1, dt * 3);
    this.pointer.x += (this.pointer.tx - this.pointer.x) * ease;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * ease;
    for (const frame of this.frames) frame(t, dt);
    this.stepParticles(dt);
    const { pos, look, parallax } = this.cam;
    this.camera.position.set(pos.x + this.pointer.x * parallax, pos.y - this.pointer.y * parallax * 0.5, pos.z);
    this.camera.lookAt(look);
    this.renderer.render(this.scene, this.camera);
    if (!this.ready) {
      this.ready = true;
      this.options.onReady();
    }
  }

  private running(): boolean {
    return this.alive && !this.still && this.onScreen && !document.hidden;
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (!this.running()) return;
    const elapsed = this.last ? (now - this.last) / 1000 : 0;
    // The story is drawn at the display's rate; the ambient motion after it
    // at most AMBIENT_FPS, which looks the same and costs half or less.
    if (this.last && this.t > this.stillTime && elapsed < 1 / AMBIENT_FPS - 0.004) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    this.last = now;
    // The story keeps to the clock on a slow phone, a quarter of a second at
    // most per frame; dust and sparkles step at most a twentieth.
    this.t += Math.min(0.25, elapsed);
    if (this.t - Math.max(this.stillTime, this.stirredAt) > SETTLE_AFTER) {
      // Settled: the last frame stays on the canvas, without dust in mid-air,
      // and nothing is drawn until something happens.
      this.clearParticles();
      this.draw(this.t, 0);
      return;
    }
    this.draw(this.t, Math.min(0.05, elapsed));
    this.raf = requestAnimationFrame(this.tick);
  };

  /** Start the loop again if it may run and is not running. */
  private wake(): void {
    if (!this.started || this.raf || !this.running()) return;
    // The clock carries on from where it stopped, not from the wall clock.
    this.last = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  /** Something happened worth watching: keep moving a while longer, or start again. */
  private stir(): void {
    this.stirredAt = this.t;
    this.wake();
  }

  /** The slot changed: show it now, whether or not the loop is running. */
  private invalidate(): void {
    if (!this.started || !this.alive) return;
    if (this.still) this.draw(this.stillTime, 0);
    else if (!this.raf) this.draw(this.t, 0);
  }


  start(): void {
    this.started = true;
    if (this.still) {
      this.draw(this.stillTime, 0);
      return;
    }
    // The first frame is drawn at once, so the scene is never a blank box.
    this.draw(0, 0);
    this.wake();
  }

  /** Something in the scene changed: draw it, once under reduced motion, else by waking the loop. */
  redraw(): void {
    if (!this.started || !this.alive) return;
    if (this.still) this.draw(this.stillTime, 0);
    else this.stir();
  }

  /**
   * Reduced motion was asked for while the scene runs: stop the loop and
   * draw the finished pose, once, as if it had been drawn still from the
   * start. It stays still for the rest of its life; the next scene asks
   * the browser afresh.
   */
  settle(): void {
    if (this.still || !this.alive) return;
    this.still = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.clearParticles();
    for (const fn of this.settlers) fn();
    if (this.started) this.draw(this.stillTime, 0);
  }

  /** Play the scene from the start. */
  restart(): void {
    this.fired = new Set();
    this.clearParticles();
    this.t = 0;
    this.last = 0;
    this.stirredAt = 0;
    this.redraw();
  }

  dispose(): void {
    if (!this.alive) return;
    this.alive = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    for (const cleanup of this.cleanups.splice(0)) cleanup();
    this.clearParticles();
    const materials = new Set<Material>();
    this.scene.traverse((object: Object3D) => {
      const mesh = object as Partial<Mesh>;
      mesh.geometry?.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) material.forEach((m) => materials.add(m));
      else if (material) materials.add(material);
    });
    materials.forEach((material) => material.dispose());
    this.kit.dispose();
    this.envTarget.dispose();
    this.scene.environment = null;
    this.renderer.dispose();
    // Give the context back now, not whenever the garbage collector gets to
    // it: a browser holds only about sixteen, and a learner moving quickly
    // between pages would otherwise run through them. A context the browser
    // already took has nothing left to give.
    if (!this.renderer.getContext().isContextLost()) this.renderer.forceContextLoss();
  }
}
