import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  InstancedMesh,
  Mesh,
  Object3D,
  Shape,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import type { SceneSpec } from '../../sceneData.ts';
import { towerRows } from '../../tower.ts';
import { C } from '../kit.ts';
import { bounce, clamp01, easeInOut, easeOutBack, easeOutCubic, squash } from '../motion.ts';
import { block, layoutRow, setSquash, toneColour, type Block } from '../pieces.ts';
import type { Stage } from '../stage.ts';

const ROW = 0.8;

/**
 * The session's new words tumble into a tower, a gold star crowns it, and
 * wooden chips rain down. The chips are the confetti: the page's paper one
 * is not shown as well. Under reduced motion the tower stands finished,
 * with no chips.
 */
export function complete(s: Stage, spec: Extract<SceneSpec, { scene: 'complete' }>): void {
  const rows = towerRows(spec.words.length);
  const widest = Math.max(...rows) * 1.75 + (Math.max(...rows) - 1) * 0.08;
  const radius = Math.max(1.7, widest / 2 + 0.55);
  const plinth = new Mesh(new CylinderGeometry(radius - 0.2, radius, 0.3, 80), s.kit.lacquer(C.walnut));
  plinth.position.y = 0.15;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  s.scene.add(plinth);
  const Y0 = 0.3;
  const placed: Array<{ b: Block; y: number; delay: number; landAt: number; spin: number }> = [];
  let next = 0;
  rows.forEach((count, ri) => {
    const bs = spec.words.slice(next, next + count).map((word) => block(s, word.text, toneColour(word.tone), { w: 1.75, h: 0.78 }));
    next += count;
    const xs = layoutRow(bs.map((b) => b.w), 0.08);
    bs.forEach((b, j) => {
      const delay = 0.15 + placed.length * 0.2;
      b.group.position.set(xs[j]!, 10, 0);
      s.scene.add(b.group);
      placed.push({ b, y: Y0 + ri * ROW, delay, landAt: delay + 0.3, spin: (s.rand() - 0.5) * 2 });
    });
  });
  const starShape = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.24 : 0.55;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i) starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const starGeometry = new ExtrudeGeometry(starShape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 4 });
  starGeometry.center();
  const star = new Mesh(starGeometry, s.kit.lacquer(C.gold, { noGrain: true, metalness: 0.55, roughness: 0.25, clearcoat: 1, env: 1.6 }));
  star.castShadow = true;
  const starY = Y0 + rows.length * ROW + 0.6;
  star.position.set(0, 12, 0);
  s.scene.add(star);
  const haloMaterial = new SpriteMaterial({ map: s.kit.glow(), color: 0xffd36a, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 });
  const halo = new Sprite(haloMaterial);
  halo.scale.set(2.4, 2.4, 1);
  s.scene.add(halo);

  // The camera frames the tower it has, short or tall, on its plinth.
  const height = starY + 0.65;
  const frame: Vector3[] = [];
  for (const x of [-widest / 2, widest / 2]) for (const y of [0.3, height]) for (const z of [-0.4, 0.4]) frame.push(new Vector3(x, y, z));
  for (const x of [-radius, radius]) frame.push(new Vector3(x, 0, 0), new Vector3(x, 0.3, 0));
  frame.push(new Vector3(0, 0, radius));
  let view = { look: new Vector3(), pos: new Vector3() };
  let toward = new Vector3();
  s.framing(() => {
    view = s.frame(frame, new Vector3(0, 0.22, 1), 0.92);
    s.cam.look.copy(view.look);
    s.cam.pos.copy(view.pos);
    toward = view.look.clone().sub(view.pos);
  });
  s.cam.parallax = 0.5;
  s.stillTime = 3.4;

  const N = 180;
  const chipColours = [C.der, C.die, C.das, C.verb, C.birchDark, 0xffffff];
  const chips = s.still ? [] : [
    new InstancedMesh(new BoxGeometry(0.14, 0.05, 0.14), s.kit.lacquer(0xffffff, { noGrain: true }), N),
    new InstancedMesh(new CylinderGeometry(0.07, 0.07, 0.05, 12), s.kit.lacquer(0xffffff, { noGrain: true }), N),
  ];
  const seeds: Array<{ x: number; z: number; v: number; r: number; d: number; w: number }> = [];
  for (let i = 0; i < N; i++) {
    seeds.push({ x: (s.rand() - 0.5) * 9, z: (s.rand() - 0.5) * 4, v: 1.2 + s.rand() * 1.4, r: s.rand() * 6, d: s.rand() * 1.5, w: 1 + s.rand() * 2 });
  }
  // Reduced motion asked for mid-scene: the tower stands, the chips are gone.
  s.onSettle(() => chips.forEach((im) => { im.visible = false; }));
  chips.forEach((im, j) => {
    // No shadows: forty chips' shadows on the table read as dirt, not confetti.
    im.castShadow = false;
    for (let i = 0; i < N; i++) im.setColorAt(i, new Color(chipColours[(i + j) % chipColours.length]!));
    s.scene.add(im);
  });
  const dummy = new Object3D();
  s.onFrame((t) => {
    placed.forEach(({ b, y, delay, landAt, spin }, i) => {
      const k = clamp01((t - delay) / 0.8);
      b.group.position.y = y + (1 - bounce(k)) * 9;
      b.group.rotation.z = (1 - easeOutCubic(k)) * spin;
      setSquash(b, squash(t, landAt));
      s.once(`l${i}`, t, landAt, () => {
        s.spawn(new Vector3(b.group.position.x, y + 0.05, 0.4), { count: 6, color: 0xe8d6b6, opacity: 0.6, size: 0.15, grow: 2, life: 0.6, speed: 0.8, up: 0.2 });
      });
    });
    const starAt = 0.35 + placed.length * 0.2;
    const ks = clamp01((t - starAt) / 0.8);
    star.position.y = starY + (1 - easeOutBack(ks)) * 7;
    // A slow turn either way: a star seen edge on is a stick.
    star.rotation.y = Math.sin(t * 1.1) * 0.7;
    star.rotation.z = Math.sin(t * 2) * 0.08;
    halo.position.copy(star.position);
    haloMaterial.opacity = clamp01((t - starAt - 0.55) / 0.5) * (0.35 + Math.sin(t * 3) * 0.1);
    s.once('burst', t, starAt + 0.7, () => {
      s.spawn(star.position.clone(), { count: 40, color: C.gold, additive: true, opacity: 1, size: 0.15, grow: 0.3, life: 1.3, speed: 3, up: 1, gravity: 2 });
    });
    if (chips.length) {
      for (let i = 0; i < N; i++) {
        const sd = seeds[i]!;
        const tt = t - starAt - 0.45 - sd.d;
        const y = tt < 0 ? 14 : 9 - ((tt * sd.v) % 10);
        chips.forEach((im, j) => {
          dummy.position.set(sd.x + Math.sin(tt * sd.w + sd.r + j) * 0.35 + j * 0.2, y + j * 0.6, sd.z - j * 0.3);
          dummy.rotation.set(tt * 2.5 + sd.r, tt * 1.7 * sd.w, sd.r + Math.sin(tt * 3) * 0.6);
          dummy.updateMatrix();
          im.setMatrixAt(i, dummy.matrix);
        });
      }
      chips.forEach((im) => { im.instanceMatrix.needsUpdate = true; });
    }
    s.cam.pos.copy(view.pos).addScaledVector(toward, easeInOut(clamp01(t / 3)) * 0.06);
    s.scene.rotation.y = Math.sin(t * 0.28) * 0.2;
  });
}
