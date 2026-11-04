import {
  AdditiveBlending,
  BoxGeometry,
  CylinderGeometry,
  Float32BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  Points,
  PointsMaterial,
  RingGeometry,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
} from 'three';
import type { SceneSpec } from '../../sceneData.ts';
import { C } from '../kit.ts';
import { clamp01, easeOutBack } from '../motion.ts';
import { block, figure, house, lantern, motes, pretzel, train, tree } from '../pieces.ts';
import type { Stage } from '../stage.ts';

/**
 * Today: a little wooden town at dusk. The building of today's step glows,
 * with a ring at its door and the dog's greeting above it; once the day is
 * done every window is lit.
 */
export function today(s: Stage, spec: Extract<SceneSpec, { scene: 'today' }>): void {
  s.stillTime = 4.2;
  const town = new Group();
  s.scene.add(town);
  const rimRing = new Mesh(new CylinderGeometry(3.55, 3.7, 0.42, 96), s.kit.lacquer(C.walnut, { clearcoat: 0.8 }));
  rimRing.position.y = 0.21;
  rimRing.castShadow = true;
  rimRing.receiveShadow = true;
  town.add(rimRing);
  const felt = new Mesh(new CylinderGeometry(3.42, 3.42, 0.05, 96), new MeshStandardMaterial({ color: C.felt, roughness: 0.95 }));
  felt.position.y = 0.43;
  felt.receiveShadow = true;
  town.add(felt);
  const road = new Mesh(new RingGeometry(1.25, 1.75, 96), new MeshStandardMaterial({ color: 0xd6bf98, roughness: 0.85 }));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.457;
  road.receiveShadow = true;
  town.add(road);
  const rails = new Mesh(new TorusGeometry(1.5, 0.02, 6, 120), s.kit.lacquer(0x6b5a4a, { noGrain: true }));
  rails.rotation.x = Math.PI / 2;
  rails.position.y = 0.47;
  town.add(rails);
  const Y0 = 0.455;
  const spots = [
    { a: 0, body: 0xf2c14e, roof: C.roofRed, w: 1.2, h: 0.98, windows: 2 },
    { a: 1.25, body: 0xf4e3c3, roof: C.roofBlue, w: 1.0, h: 0.98, windows: 2 },
    { a: 2.45, body: 0xcfe0d6, roof: C.roofGreen, w: 1.55, h: 1.15, windows: 3 },
    { a: 3.7, body: 0xe9d4b0, roof: C.roofBrown, w: 0.95, h: 1.35, windows: 2 },
    { a: 4.95, body: 0xf6dccb, roof: C.roofRed, w: 1.05, h: 0.98, windows: 2 },
  ];
  const houses = spots.map((spot, i) => {
    const h = house(s, spot.body, spot.roof, { w: spot.w, h: spot.h, windows: spot.windows });
    const r = 2.55;
    h.group.position.set(Math.sin(spot.a) * r, Y0, Math.cos(spot.a) * r);
    h.group.rotation.y = spot.a;
    h.group.scale.set(1, 0.001, 1);
    town.add(h.group);
    return { ...h, delay: 0.1 + i * 0.13, active: i === 0, lightAt: 1.5 + i * 0.18 };
  });
  const active = houses[0]!;
  let sign: Mesh | undefined;
  if (spec.sign === 'bakery') {
    const bracket = new Mesh(new BoxGeometry(0.04, 0.04, 0.42), s.kit.lacquer(C.ink, { noGrain: true }));
    bracket.position.set(-0.44, 0.86, 0.68);
    active.group.add(bracket);
    sign = pretzel(s);
    sign.scale.setScalar(0.17);
    sign.position.set(-0.44, 0.66, 0.86);
    active.group.add(sign);
  }
  const trees: Array<{ group: Group; delay: number }> = [];
  [0.62, 1.86, 3.08, 4.32, 5.6, 0.95, 4.65].forEach((a, i) => {
    const r = i < 5 ? 2.95 : 2.2;
    const t = tree(s, 0.78 + (i % 3) * 0.16, i % 2 ? C.leafDark : C.leaf);
    t.position.set(Math.sin(a) * r, Y0, Math.cos(a) * r);
    t.scale.setScalar(0.001);
    town.add(t);
    trees.push({ group: t, delay: 0.6 + i * 0.07 });
  });
  for (let k = 0; k < 3; k++) {
    const t = tree(s, 0.62, C.leafDark);
    const a = 0.5 + k * 2.1;
    t.position.set(Math.sin(a) * 0.6, Y0, Math.cos(a) * 0.6);
    t.scale.setScalar(0.001);
    town.add(t);
    trees.push({ group: t, delay: 0.9 + k * 0.06 });
  }
  const lanterns = [0.32, 1.55, 2.95, 4.2, 5.35].map((a) => {
    const l = lantern(s);
    l.group.position.set(Math.sin(a) * 1.95, Y0, Math.cos(a) * 1.95);
    town.add(l.group);
    return l;
  });
  const people = ([[0.45, 2.0, C.der, C.ink], [-0.5, 2.05, C.die, C.walnut], [2.0, 1.15, C.das, C.ink]] as const).map(([x, z, coat, hat], i) => {
    const f = figure(s, coat, hat);
    f.position.set(x, Y0, z);
    f.rotation.y = s.rand() * 6;
    town.add(f);
    return { group: f, phase: i * 1.7 };
  });
  const toy = train(s);
  town.add(toy.group);
  // Physically based since r155: candela, not the old unitless intensity.
  const glow = new PointLight(0xffb850, 0, 4.5, 2);
  glow.position.copy(active.group.position).add(new Vector3(0, 0.9, 0.6));
  town.add(glow);
  const bubble = block(s, spec.bubble, 0xffffff, { h: 0.62, d: 0.26, w: Math.max(1.4, 0.22 * spec.bubble.length + 0.5), ink: '#1E1B17', noShadowBlob: true, mat: { clearcoat: 1 } });
  bubble.group.position.copy(active.group.position).add(new Vector3(0, 2.3, 0));
  bubble.group.scale.setScalar(0.001);
  town.add(bubble.group);
  const markerMaterial = new MeshBasicMaterial({ color: C.verb, transparent: true, opacity: 0.8, depthWrite: false });
  const marker = new Mesh(new RingGeometry(0.9, 1.0, 64), markerMaterial);
  marker.rotation.x = -Math.PI / 2;
  marker.position.copy(active.group.position).setY(Y0 + 0.01);
  marker.visible = !spec.done;
  town.add(marker);
  const starPositions: number[] = [];
  for (let i = 0; i < 160; i++) {
    const th = s.rand() * Math.PI * 2;
    const ph = 0.15 + s.rand() * 0.9;
    starPositions.push(Math.cos(th) * 30 * Math.cos(ph), 4 + Math.sin(ph) * 18, -18 - s.rand() * 10);
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute('position', new Float32BufferAttribute(starPositions, 3));
  s.scene.add(new Points(starGeometry, new PointsMaterial({ map: s.kit.glow(), color: 0xfff4d8, size: 0.35, transparent: true, depthWrite: false, blending: AdditiveBlending })));
  const moon = new Mesh(new SphereGeometry(0.9, 32, 20), new MeshBasicMaterial({ color: 0xfff1cc }));
  moon.position.set(-7, 9, -20);
  s.scene.add(moon);
  const moonGlow = new Sprite(new SpriteMaterial({ map: s.kit.glow(), color: 0xffe6a8, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.5 }));
  moonGlow.scale.set(6, 6, 1);
  moonGlow.position.copy(moon.position);
  s.scene.add(moonGlow);
  motes(s, 70, [8, 4, 6], 0xffd48a);

  // The whole town in view, whatever the shape of the slot.
  // The whole town in view whatever the slot's shape, with the sky above
  // it left for the label chip.
  const base = new Vector3(0, 5.1, 9.6);
  const k = Math.max(1.06, s.fit(8.6) / base.length());
  s.cam.pos.copy(base).multiplyScalar(k);
  s.cam.look.set(0, 1.15, 0);
  s.cam.parallax = 0.6;

  let smokeClock = 0;
  s.onFrame((t, dt) => {
    for (const h of houses) {
      h.group.scale.set(1, Math.max(0.001, easeOutBack(clamp01((t - h.delay) / 0.6))), 1);
      const lit = clamp01((t - h.lightAt) / 0.35);
      const flick = h.active && !spec.done ? 1.25 + Math.sin(t * 3) * 0.25 : 0.85 + Math.sin(t * 1.3 + h.delay * 9) * 0.05;
      for (const w of h.windows) w.emissiveIntensity = lit * flick;
    }
    for (const tr of trees) tr.group.scale.setScalar(Math.max(0.001, easeOutBack(clamp01((t - tr.delay) / 0.5))));
    lanterns.forEach((l, i) => {
      const on = clamp01((t - 1.9 - i * 0.12) / 0.3);
      l.lamp.emissiveIntensity = 1.8 * on;
      l.halo.opacity = 0.85 * on;
    });
    for (const p of people) {
      p.group.rotation.z = Math.sin(t * 1.6 + p.phase) * 0.05;
      p.group.position.y = Y0 + Math.abs(Math.sin(t * 3.2 + p.phase)) * 0.02;
    }
    glow.intensity = clamp01((t - 1.5) / 0.4) * (1.4 + Math.sin(t * 3) * 0.3) * Math.PI;
    const tr = clamp01((t - 1.2) / 0.8);
    const ang = t * 0.35;
    for (const { part, offset } of toy.parts) {
      const a = ang - offset / 1.5;
      part.position.set(Math.sin(a) * 1.5, Y0 + 0.02, Math.cos(a) * 1.5);
      part.rotation.y = a + Math.PI / 2;
      part.scale.setScalar(Math.max(0.001, tr));
    }
    smokeClock += dt;
    if (smokeClock > 0.32 && t > 1.6) {
      smokeClock = 0;
      const top = active.chimneyTop.clone();
      active.group.localToWorld(top);
      s.spawn(top, { count: 1, color: 0xf3ece2, opacity: 0.6, size: 0.22, grow: 3, life: 2.4, speed: 0.12, up: 3 });
      const st = toy.stackTop.clone();
      toy.engine.localToWorld(st);
      s.spawn(st, { count: 1, color: 0xffffff, opacity: 0.5, size: 0.14, grow: 2.5, life: 1.3, speed: 0.1, up: 3 });
    }
    bubble.group.scale.setScalar(Math.max(0.001, easeOutBack(clamp01((t - 1.8) / 0.5))));
    bubble.group.position.y = Y0 + 2.25 + Math.sin(t * 2.2) * 0.08;
    bubble.group.rotation.y = -town.rotation.y;
    if (sign) sign.rotation.z = Math.sin(t * 1.8) * 0.12;
    const p = (t * 0.55) % 1;
    marker.scale.setScalar(1 + p * 0.45);
    markerMaterial.opacity = 0.75 * (1 - p) * clamp01((t - 1.5) / 0.4);
    town.rotation.y = -0.15 + Math.sin(t * 0.18) * 0.3;
  });
}
