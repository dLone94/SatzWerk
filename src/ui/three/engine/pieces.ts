import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Shape,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
} from 'three';
import { C, inkFor, type LacquerOptions } from './kit.ts';
import type { Stage } from './stage.ts';

export function roundedRect(w: number, h: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** The soft contact shadow under a piece. */
export function blob(stage: Stage, w: number, d: number, strength = 0.7): Mesh {
  const m = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: stage.kit.blob(), transparent: true, depthWrite: false, opacity: strength }));
  m.rotation.x = -Math.PI / 2;
  m.scale.set(w, d, 1);
  m.renderOrder = -1;
  return m;
}

export interface Block {
  group: Group;
  /** Squash and stretch happen about this, at the block's base. */
  pivot: Group;
  body: Mesh<ExtrudeGeometry, Material>;
  face?: Mesh<PlaneGeometry, MeshStandardMaterial>;
  w: number;
  h: number;
  d: number;
}

export interface BlockOptions {
  w?: number;
  h?: number;
  d?: number;
  ink?: string;
  noShadowBlob?: boolean;
  material?: Material;
  mat?: LacquerOptions;
}

/** The width a block needs for its word. */
export function blockWidth(label: string | null): number {
  return Math.max(0.95, 0.25 * (label ? label.length : 2) + 0.6);
}

/** A painted wooden block; its group's origin sits at the bottom centre. */
export function block(stage: Stage, label: string | null, color: number, o: BlockOptions = {}): Block {
  const h = o.h ?? 0.8;
  const d = o.d ?? 0.8;
  const w = o.w ?? blockWidth(label);
  const bev = Math.min(0.11, h * 0.14);
  const geometry = new ExtrudeGeometry(roundedRect(w - 2 * bev, h - 2 * bev, Math.min(0.1, h * 0.12)), {
    depth: d - 2 * bev,
    bevelEnabled: true,
    bevelThickness: bev,
    bevelSize: bev,
    bevelSegments: 5,
    curveSegments: 8,
  });
  geometry.center();
  const material = o.material ?? stage.kit.lacquer(color, o.mat);
  const body = new Mesh(geometry, material);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  const group = new Group();
  const pivot = new Group();
  pivot.add(body);
  group.add(pivot);
  const out: Block = { group, pivot, body, w, h, d };
  if (label) {
    const ink = o.ink ?? inkFor(color);
    const face = new Mesh(
      new PlaneGeometry(w * 0.94, h * 0.84),
      new MeshStandardMaterial({ map: stage.kit.label(label, w, h, ink), transparent: true, depthWrite: false, roughness: 0.5 }),
    );
    face.position.set(0, h / 2, d / 2 + 0.004);
    pivot.add(face);
    out.face = face;
  }
  if (!o.noShadowBlob) {
    const b = blob(stage, w * 1.5, d * 1.6, 0.55);
    b.position.y = 0.005;
    group.add(b);
  }
  return out;
}

/** Squash-and-stretch about the block's base. */
export function setSquash(b: Block, s: number): void {
  b.pivot.scale.set(1 + (1 - s) * 0.6, s, 1 + (1 - s) * 0.6);
}

function windowPane(): { group: Group; pane: MeshStandardMaterial } {
  const group = new Group();
  const pane = new MeshStandardMaterial({ color: 0x3a4660, emissive: 0xffb84a, emissiveIntensity: 0, roughness: 0.3 });
  group.add(new Mesh(new PlaneGeometry(0.2, 0.24), pane));
  const bar = new MeshStandardMaterial({ color: 0xf6eedd, roughness: 0.6 });
  const v = new Mesh(new PlaneGeometry(0.025, 0.24), bar);
  v.position.z = 0.002;
  group.add(v);
  const hb = new Mesh(new PlaneGeometry(0.2, 0.025), bar);
  hb.position.z = 0.002;
  group.add(hb);
  const frame = new Mesh(new PlaneGeometry(0.25, 0.29), bar);
  frame.position.z = -0.001;
  group.add(frame);
  return { group, pane };
}

export interface House {
  group: Group;
  windows: MeshStandardMaterial[];
  chimneyTop: Vector3;
  w: number;
  h: number;
}

/** An Erzgebirge-style house: block body, overhanging prism roof, chimney, lit windows. */
export function house(stage: Stage, body: number, roof: number, o: { w?: number; h?: number; d?: number; roofH?: number; windows?: number } = {}): House {
  const w = o.w ?? 1.1;
  const h = o.h ?? 0.95;
  const d = o.d ?? 0.95;
  const group = new Group();
  group.add(block(stage, null, body, { w, h, d, noShadowBlob: true, mat: { clearcoat: 0.55 } }).group);
  const rh = o.roofH ?? 0.66;
  const tri = new Shape();
  tri.moveTo(-w / 2 - 0.12, -0.02);
  tri.lineTo(w / 2 + 0.12, -0.02);
  tri.lineTo(0, rh);
  tri.lineTo(-w / 2 - 0.12, -0.02);
  const rg = new ExtrudeGeometry(tri, { depth: d + 0.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
  rg.translate(0, 0, -(d + 0.2) / 2);
  const r = new Mesh(rg, stage.kit.lacquer(roof, { clearcoat: 0.6 }));
  r.position.y = h;
  r.castShadow = true;
  r.receiveShadow = true;
  group.add(r);
  const ch = new Mesh(new BoxGeometry(0.16, 0.42, 0.16), stage.kit.lacquer(0x8a5a3c, { clearcoat: 0.3 }));
  ch.position.set(w * 0.24, h + rh * 0.55, -d * 0.12);
  ch.castShadow = true;
  group.add(ch);
  const windows: MeshStandardMaterial[] = [];
  const cols = o.windows ?? 2;
  for (let i = 0; i < cols; i++) {
    const wp = windowPane();
    wp.group.position.set((i - (cols - 1) / 2) * (w / cols) * 0.95, h * 0.62, d / 2 + 0.006);
    group.add(wp.group);
    windows.push(wp.pane);
  }
  const door = new Mesh(new PlaneGeometry(0.22, 0.36), stage.kit.lacquer(0x5a3a24, { clearcoat: 0.5 }));
  door.position.set(0, 0.18, d / 2 + 0.007);
  group.add(door);
  const bl = blob(stage, w * 1.8, d * 1.9, 0.6);
  bl.position.y = 0.004;
  group.add(bl);
  return { group, windows, chimneyTop: new Vector3(w * 0.24, h + rh * 0.55 + 0.24, -d * 0.12), w, h };
}

export function tree(stage: Stage, scale = 1, tint: number = C.leaf): Group {
  const g = new Group();
  const s = scale;
  const trunk = new Mesh(new CylinderGeometry(0.06 * s, 0.075 * s, 0.26 * s, 10), stage.kit.raw(C.walnut));
  trunk.position.y = 0.13 * s;
  trunk.castShadow = true;
  g.add(trunk);
  const leaf = stage.kit.lacquer(tint, { clearcoat: 0.5 });
  for (const [r, h, y] of [[0.44, 0.52, 0.44], [0.35, 0.44, 0.74], [0.24, 0.36, 1.0], [0.12, 0.22, 1.2]] as const) {
    const cone = new Mesh(new ConeGeometry(r * s, h * s, 14), leaf);
    cone.position.y = y * s;
    cone.castShadow = true;
    g.add(cone);
  }
  const bl = blob(stage, 1.0 * s, 1.0 * s, 0.5);
  bl.position.y = 0.004;
  g.add(bl);
  return g;
}

/** A peg-doll villager, the kind turned on a lathe. */
export function figure(stage: Stage, coat: number, hat: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(0.1, 0.15, 0.36, 18), stage.kit.lacquer(coat));
  body.position.y = 0.18;
  body.castShadow = true;
  g.add(body);
  const head = new Mesh(new SphereGeometry(0.1, 20, 14), stage.kit.lacquer(0xf3d2b3, { clearcoat: 0.5 }));
  head.position.y = 0.45;
  head.castShadow = true;
  g.add(head);
  const hatMaterial = stage.kit.lacquer(hat);
  const brim = new Mesh(new CylinderGeometry(0.13, 0.13, 0.02, 18), hatMaterial);
  brim.position.y = 0.52;
  g.add(brim);
  const top = new Mesh(new CylinderGeometry(0.075, 0.085, 0.12, 18), hatMaterial);
  top.position.y = 0.59;
  top.castShadow = true;
  g.add(top);
  const bl = blob(stage, 0.45, 0.45, 0.55);
  bl.position.y = 0.004;
  g.add(bl);
  return g;
}

/** The learner's piece: a "Mensch ärgere Dich nicht" pawn. */
export function pawn(stage: Stage, color: number): Group {
  const g = new Group();
  const m = stage.kit.lacquer(color, { noGrain: true, roughness: 0.25, clearcoat: 1 });
  const profile = [[0, 0], [0.3, 0], [0.31, 0.04], [0.27, 0.12], [0.2, 0.18], [0.13, 0.42], [0.11, 0.6], [0.17, 0.63], [0.17, 0.67], [0.09, 0.7]]
    .map(([x, y]) => new Vector2(x, y));
  const body = new Mesh(new LatheGeometry(profile, 40), m);
  body.castShadow = true;
  g.add(body);
  const head = new Mesh(new SphereGeometry(0.17, 32, 20), m);
  head.position.y = 0.84;
  head.castShadow = true;
  g.add(head);
  const bl = blob(stage, 0.9, 0.9, 0.6);
  bl.position.y = 0.004;
  g.add(bl);
  return g;
}

/** A pretzel — the bakers' guild sign. */
export function pretzel(stage: Stage): Mesh {
  const pts = [[-0.15, -0.95, 0.06], [-0.55, -0.55, 0], [-0.95, 0.15, 0], [-0.75, 0.82, 0], [-0.2, 0.85, 0], [0.12, 0.35, 0.06], [0.0, -0.1, 0.12],
    [-0.12, 0.35, -0.06], [0.2, 0.85, 0], [0.75, 0.82, 0], [0.95, 0.15, 0], [0.55, -0.55, 0], [0.15, -0.95, -0.06]];
  const curve = new CatmullRomCurve3(pts.map(([x, y, z]) => new Vector3(x, y, z)));
  const m = new Mesh(new TubeGeometry(curve, 120, 0.12, 12, false), stage.kit.lacquer(0xb06a2c, { clearcoat: 0.9, roughness: 0.35 }));
  m.castShadow = true;
  const salt = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  for (let i = 0; i < 14; i++) {
    const p = curve.getPointAt(stage.rand());
    const s = new Mesh(new BoxGeometry(0.035, 0.035, 0.035), salt);
    s.position.set(p.x, p.y, p.z + 0.11);
    s.rotation.set(stage.rand() * 3, stage.rand() * 3, 0);
    m.add(s);
  }
  return m;
}

export interface Train {
  group: Group;
  parts: Array<{ part: Group; offset: number }>;
  engine: Group;
  stackTop: Vector3;
}

/** A small Erzgebirge toy train: engine and two wagons. */
export function train(stage: Stage): Train {
  const g = new Group();
  const black = stage.kit.lacquer(C.ink, { noGrain: true });
  const wheelGeometry = new CylinderGeometry(0.07, 0.07, 0.04, 16);
  const wheels = (parent: Group, n: number, len: number) => {
    for (let i = 0; i < n; i++) {
      for (const z of [-0.17, 0.17]) {
        const w = new Mesh(wheelGeometry, black);
        w.rotation.x = Math.PI / 2;
        w.position.set((i - (n - 1) / 2) * len, 0.07, z);
        parent.add(w);
      }
    }
  };
  const engine = new Group();
  const boiler = new Mesh(new CylinderGeometry(0.13, 0.13, 0.42, 20), stage.kit.lacquer(C.die));
  boiler.rotation.z = Math.PI / 2;
  boiler.position.set(0.12, 0.24, 0);
  boiler.castShadow = true;
  engine.add(boiler);
  const cab = new Mesh(new BoxGeometry(0.24, 0.3, 0.3), stage.kit.lacquer(C.der));
  cab.position.set(-0.16, 0.27, 0);
  cab.castShadow = true;
  engine.add(cab);
  const roof = new Mesh(new BoxGeometry(0.3, 0.04, 0.36), stage.kit.lacquer(C.ink));
  roof.position.set(-0.16, 0.44, 0);
  engine.add(roof);
  const stack = new Mesh(new CylinderGeometry(0.05, 0.035, 0.16, 12), stage.kit.lacquer(C.ink));
  stack.position.set(0.26, 0.42, 0);
  engine.add(stack);
  const base = new Mesh(new BoxGeometry(0.62, 0.06, 0.32), black);
  base.position.set(0, 0.11, 0);
  engine.add(base);
  wheels(engine, 3, 0.2);
  g.add(engine);
  const parts: Train['parts'] = [{ part: engine, offset: 0 }];
  [C.verb, C.das].forEach((colour, i) => {
    const car = new Group();
    const b = new Mesh(new BoxGeometry(0.42, 0.2, 0.3), stage.kit.lacquer(colour));
    b.position.y = 0.22;
    b.castShadow = true;
    car.add(b);
    const ba = new Mesh(new BoxGeometry(0.46, 0.05, 0.32), black);
    ba.position.y = 0.1;
    car.add(ba);
    wheels(car, 2, 0.24);
    g.add(car);
    parts.push({ part: car, offset: (i + 1) * 0.55 });
  });
  return { group: g, parts, engine, stackTop: new Vector3(0.26, 0.52, 0) };
}

export function lantern(stage: Stage): { group: Group; lamp: MeshStandardMaterial; halo: SpriteMaterial } {
  const g = new Group();
  const black = stage.kit.lacquer(C.ink, { noGrain: true });
  const post = new Mesh(new CylinderGeometry(0.025, 0.035, 0.8, 10), black);
  post.position.y = 0.4;
  post.castShadow = true;
  g.add(post);
  const cap = new Mesh(new ConeGeometry(0.09, 0.08, 6), black);
  cap.position.y = 0.92;
  g.add(cap);
  const lamp = new MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffc35a, emissiveIntensity: 1.6 });
  const bulb = new Mesh(new SphereGeometry(0.06, 14, 10), lamp);
  bulb.position.y = 0.84;
  g.add(bulb);
  const halo = new SpriteMaterial({ map: stage.kit.glow(), color: 0xffbf5a, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.85 });
  const sprite = new Sprite(halo);
  sprite.scale.set(0.7, 0.7, 1);
  sprite.position.y = 0.84;
  g.add(sprite);
  return { group: g, lamp, halo };
}

/** A die with `top` uppermost. */
export function die(stage: Stage, top: number): Mesh {
  const pipMap: Record<number, Array<[number, number]>> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]],
  };
  // +x, -x, +y, -y, +z, -z; `top` ends up on +y.
  let order = [2, 5, top, 7 - top, 1, 6];
  if (top === 1 || top === 6) order = [2, 5, top, 7 - top, 3, 4];
  if (top === 2 || top === 5) order = [1, 6, top, 7 - top, 3, 4];
  const faces = order.map((n) => new MeshPhysicalMaterial({
    map: stage.kit.canvasTexture(`die${n}`, 256, 256, (g, W) => {
      g.fillStyle = '#fbf6ec';
      g.fillRect(0, 0, W, W);
      g.strokeStyle = 'rgba(30,27,23,0.12)';
      g.lineWidth = 10;
      g.strokeRect(5, 5, W - 10, W - 10);
      for (const [x, y] of pipMap[n] ?? []) {
        g.fillStyle = '#1e1b17';
        g.beginPath();
        g.arc(x * W, y * W, W * 0.085, 0, 7);
        g.fill();
      }
    }),
    roughness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.2,
  }));
  const m = new Mesh(new BoxGeometry(0.62, 0.62, 0.62), faces);
  m.castShadow = true;
  return m;
}

export function cloud(): Group {
  const g = new Group();
  const m = new MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
  for (const [x, y, z, r] of [[0, 0, 0, 0.42], [0.42, -0.06, 0.05, 0.32], [-0.4, -0.08, 0, 0.3], [0.15, 0.2, 0, 0.3]] as const) {
    const s = new Mesh(new SphereGeometry(r, 20, 14), m);
    s.position.set(x, y, z);
    s.castShadow = true;
    g.add(s);
  }
  return g;
}

/** Warm sawdust drifting slowly through the light. Not drawn under reduced motion. */
export function motes(stage: Stage, n: number, box: [number, number, number], color = 0xffe2a8): void {
  if (stage.still) return;
  const geometry = new BufferGeometry();
  const arr = new Float32Array(n * 3);
  const seed: number[] = [];
  for (let i = 0; i < n; i++) {
    arr[i * 3] = (stage.rand() - 0.5) * box[0];
    arr[i * 3 + 1] = stage.rand() * box[1];
    arr[i * 3 + 2] = (stage.rand() - 0.5) * box[2];
    seed.push(stage.rand() * 10);
  }
  const attribute = new Float32BufferAttribute(arr, 3);
  geometry.setAttribute('position', attribute);
  const points = new Points(geometry, new PointsMaterial({
    map: stage.kit.glow(), color, size: 0.09, transparent: true, opacity: 0.75, depthWrite: false, blending: AdditiveBlending, sizeAttenuation: true,
  }));
  stage.scene.add(points);
  // Reduced motion asked for mid-scene: the dust goes with the motion.
  stage.onSettle(() => { points.visible = false; });
  stage.onFrame((t, dt) => {
    for (let i = 0; i < n; i++) {
      let y = arr[i * 3 + 1]! + dt * (0.08 + (seed[i]! % 1) * 0.1);
      if (y > box[1]) y = 0;
      arr[i * 3 + 1] = y;
      arr[i * 3] = arr[i * 3]! + Math.sin(t * 0.6 + seed[i]!) * dt * 0.06;
    }
    attribute.needsUpdate = true;
  });
}

/** Centres of a row of widths with a gap between them, centred on 0. */
export function layoutRow(widths: number[], gap: number): number[] {
  const total = widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, widths.length - 1);
  let x = -total / 2;
  return widths.map((w) => {
    const centre = x + w / 2;
    x += w + gap;
    return centre;
  });
}

/** The workbench: a walnut top with a birch rail and a numbered token per place. Returns the rail's top. */
export function workbench(stage: Stage, total: number, xs: number[]): number {
  const top = block(stage, null, C.walnut, { w: total + 2.4, h: 0.3, d: 3.2, noShadowBlob: true, mat: { clearcoat: 0.55 } });
  top.group.position.set(0, -0.3, 0.2);
  stage.scene.add(top.group);
  const rail = block(stage, null, C.birchDark, { w: total + 0.7, h: 0.18, d: 1.2, noShadowBlob: true });
  stage.scene.add(rail.group);
  const tokenMaterial = stage.kit.lacquer(C.cream);
  const tokenGeometry = new CylinderGeometry(0.17, 0.17, 0.06, 28);
  xs.forEach((x, i) => {
    const token = new Mesh(tokenGeometry, tokenMaterial);
    token.position.set(x, 0.21, 0.82);
    token.castShadow = true;
    stage.scene.add(token);
    const num = new Mesh(new PlaneGeometry(0.3, 0.3), new MeshBasicMaterial({ map: stage.kit.label(String(i + 1), 1, 1, '#1E1B17'), transparent: true, depthWrite: false }));
    num.rotation.x = -Math.PI / 2;
    num.position.set(x, 0.245, 0.82);
    stage.scene.add(num);
  });
  return 0.18;
}

/** The colour of a block's paint. */
export function toneColour(tone: 'birch' | 'der' | 'die' | 'das'): number {
  return tone === 'birch' ? C.birch : C[tone];
}

/**
 * Frame a rail of width `total` with its blocks standing on it, for the
 * slot's shape, and again whenever that changes.
 *
 * A wide slot (a desktop) is limited by its height and shows the bench
 * round the blocks. A phone's slot is limited by its width, where every
 * pixel of bench is a pixel less of lettering: there the blocks themselves
 * fill it, seen from lower down, and the bench runs off the edges.
 */
export function railView(stage: Stage, total: number): void {
  stage.framing(() => {
    const narrow = stage.aspect < 2.4;
    const half = narrow ? total / 2 + 0.02 : total / 2 + 0.25;
    const ys = narrow ? [0.18, 0.98] : [0.05, 1.0];
    const zs = narrow ? [-0.4, 0.42] : [-0.45, 0.6];
    const points: Vector3[] = [];
    for (const x of [-half, half]) {
      for (const y of ys) for (const z of zs) points.push(new Vector3(x, y, z));
    }
    const { look, pos } = stage.frame(points, narrow ? new Vector3(0, 0.36, 0.9) : new Vector3(0, 0.5, 0.9), narrow ? 0.95 : 0.9);
    stage.cam.look.copy(look);
    stage.cam.pos.copy(pos);
  });
}
