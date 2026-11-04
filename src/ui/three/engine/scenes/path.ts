import {
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  Vector3,
} from 'three';
import type { SceneSpec, Station } from '../../sceneData.ts';
import { C } from '../kit.ts';
import { clamp01, easeInOut, easeOutCubic } from '../motion.ts';
import { block, cloud, die, house, motes, pawn, tree } from '../pieces.ts';
import type { Stage } from '../stage.ts';

/** Fields between one lesson's station and the next. The die shows this many. */
const PER_GAP = 3;

const STATION_COLOUR: Record<Station | 'gate', number> = {
  done: C.das,
  current: C.der,
  todo: 0xf6ecd8,
  planned: 0xd8cdb9,
  gate: C.birch,
};

/**
 * The unit as a wooden board game: one station per lesson, green when done,
 * then the checkpoint's little tower at the end. The die rolls the three
 * fields from the last station, and the pawn hops them to the lesson the
 * course says is next. On a wide slot the board lies across the view.
 */
export function path(s: Stage, spec: Extract<SceneSpec, { scene: 'path' }>): void {
  const count = spec.stations.length;
  const current = Math.max(0, Math.min(count, spec.current));
  const landscape = s.aspect >= 1.6;
  const board = new Group();
  // Laid across a wide view, the path runs left to right.
  if (landscape) board.rotation.y = -Math.PI / 2;
  s.scene.add(board);
  const curve = new CatmullRomCurve3(
    [[-1.4, 4.6], [0.9, 3.6], [1.6, 1.9], [-0.2, 0.9], [-1.7, -0.6], [-0.3, -2.0], [1.5, -2.9], [0.6, -4.6], [-1.3, -5.9]]
      .map(([x, z]) => new Vector3(x, 0, z)),
  );
  const top = block(s, null, 0xe4cfa6, { w: 6.6, h: 0.32, d: 14.2, noShadowBlob: true, mat: { clearcoat: 0.9 } });
  top.group.position.set(0, -0.32, -0.65);
  board.add(top.group);
  const edge = block(s, null, C.walnut, { w: 7.0, h: 0.2, d: 14.6, noShadowBlob: true });
  edge.group.position.set(0, -0.5, -0.65);
  board.add(edge.group);
  const river = new Mesh(new PlaneGeometry(6.6, 0.7), new MeshPhysicalMaterial({ color: 0x5fa4d6, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92 }));
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.005, -1.35);
  board.add(river);
  const bridge = block(s, null, C.walnut, { w: 0.9, h: 0.12, d: 1.0, noShadowBlob: true });
  bridge.group.position.set(-1.0, 0, -1.35);
  board.add(bridge.group);

  const tick = s.kit.canvasTexture('tick', 128, 128, (g, W) => {
    g.strokeStyle = '#ffffff';
    g.lineWidth = W * 0.13;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(W * 0.27, W * 0.53);
    g.lineTo(W * 0.43, W * 0.68);
    g.lineTo(W * 0.74, W * 0.35);
    g.stroke();
  });
  // Lesson stations with small stepping fields between them; the last
  // station is the checkpoint.
  const fields: Vector3[] = [];
  const total = count * PER_GAP;
  // A short unit takes the first part of the winding road, not all of it
  // stretched thin: stations stay a few fields apart whatever the count.
  const span = Math.max(count, 6) * PER_GAP;
  const walked = current * PER_GAP;
  const stepMaterial = s.kit.lacquer(0xf3e6cd, { noGrain: true, clearcoat: 1 });
  const walkedMaterial = s.kit.lacquer(0xbfe0c9, { noGrain: true, clearcoat: 1 });
  const stepGeometry = new CylinderGeometry(0.2, 0.21, 0.08, 40);
  const stationGeometry = new CylinderGeometry(0.42, 0.44, 0.14, 40);
  const tickGeometry = new PlaneGeometry(0.5, 0.5);
  for (let f = 0; f <= total; f++) {
    const p = curve.getPointAt(f / span);
    const station = f % PER_GAP === 0;
    const index = f / PER_GAP;
    let disc: Mesh;
    if (station) {
      const state: Station | 'gate' = index === count ? 'gate' : index === current ? 'current' : spec.stations[index]!;
      disc = new Mesh(stationGeometry, s.kit.lacquer(STATION_COLOUR[state], { clearcoat: 1, noGrain: state === 'planned' }));
      if (state === 'done') {
        const mark = new Mesh(tickGeometry, new MeshBasicMaterial({ map: tick, transparent: true, depthWrite: false }));
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(p.x, 0.145, p.z);
        board.add(mark);
      }
    } else {
      disc = new Mesh(stepGeometry, f < walked ? walkedMaterial : stepMaterial);
    }
    disc.position.set(p.x, station ? 0.07 : 0.04, p.z);
    disc.castShadow = true;
    disc.receiveShadow = true;
    board.add(disc);
    fields.push(new Vector3(p.x, station ? 0.14 : 0.08, p.z));
  }
  const end = fields[fields.length - 1]!;
  const tower = house(s, 0xf6ecd8, C.roofRed, { w: 0.75, h: 1.05, d: 0.75, roofH: 0.55, windows: 1 });
  tower.group.position.set(end.x + 0.9, 0, end.z);
  for (const w of tower.windows) w.emissiveIntensity = 0.9;
  board.add(tower.group);
  const flagPole = new Mesh(new CylinderGeometry(0.02, 0.02, 0.7, 8), s.kit.lacquer(C.ink, { noGrain: true }));
  flagPole.position.set(end.x + 0.9, 1.9, end.z);
  board.add(flagPole);
  const flag = new Mesh(new PlaneGeometry(0.36, 0.22, 8, 2), new MeshStandardMaterial({ color: C.verb, side: DoubleSide }));
  flag.position.set(end.x + 1.08, 2.12, end.z);
  board.add(flag);
  ([[2.5, 3.4], [-2.6, 2.2], [2.6, -0.4], [-2.5, -3.4], [2.4, -5.3], [-2.6, 5.2], [2.7, 5.6], [-2.7, -5.8], [0.4, 5.9]] as const).forEach(([x, z], j) => {
    const t = tree(s, 0.75 + (j % 3) * 0.15, j % 2 ? C.leafDark : C.leaf);
    t.position.set(x, 0, z);
    board.add(t);
  });
  // A cottage by the road, unless the checkpoint's tower stands there.
  if (Math.hypot(end.x + 0.9 - 2.3, end.z - 1.0) > 2.2) {
    const cottage = house(s, 0xf4e3c3, C.roofBlue, { w: 0.9, h: 0.8 });
    cottage.group.position.set(2.3, 0, 1.0);
    cottage.group.rotation.y = -0.6;
    board.add(cottage.group);
  }
  // Clouds drift over a tall board seen from high up; close to the board, or
  // across a wide one, they would hang in front of it.
  const clouds = (landscape || s.aspect > 0.7 ? [] : [[-1.5, 3.4, 2.0], [1.8, 3.8, -2.5], [-0.4, 4.2, -6.0]])
    .map(([x, y, z]) => {
      const c = cloud();
      c.position.set(x!, y!, z!);
      board.add(c);
      return c;
    });
  [C.die, C.das, C.verb].forEach((colour, i) => {
    const home = pawn(s, colour);
    home.scale.setScalar(0.62);
    home.position.set(2.0 + (i % 2) * 0.5, 0, 4.9 + Math.floor(i / 2) * 0.5);
    board.add(home);
  });
  const me = pawn(s, C.der);
  board.add(me);
  const haloMaterial = new MeshBasicMaterial({ color: C.verb, transparent: true, opacity: 0, depthWrite: false });
  const halo = new Mesh(new RingGeometry(0.55, 0.66, 64), haloMaterial);
  halo.rotation.x = -Math.PI / 2;
  board.add(halo);

  // A hop needs a station behind it: on the first lesson the pawn just stands at the start.
  const roll = current > 0 ? PER_GAP : 0;
  const target = current * PER_GAP;
  const startField = target - roll;
  const cube = roll > 0 ? die(s, roll) : undefined;
  if (cube) board.add(cube);
  const rollT0 = 0.3;
  const rollDur = 1.3;
  const hopT0 = roll > 0 ? rollT0 + rollDur + 0.25 : 0.3;
  const hopDur = 0.42;
  const hopsTotal = Math.max(1, roll);
  const spin = new Vector3(9.4, 6.3, 7.9);
  // The die comes to rest beside the pawn, on the side away from the tower.
  const restAt = fields[target]!.clone().add(target === total ? new Vector3(-0.9, 0, 0.9) : new Vector3(0.95, 0, 0.75));
  s.stillTime = hopT0 + hopDur * hopsTotal + 1.2;
  s.cam.parallax = 0.5;
  motes(s, 50, landscape ? [14, 4, 7] : [7, 4, 14]);

  /*
   * Framing. A wide slot shows the whole unit; a narrower one the stretch
   * around the pawn: the station behind it and two ahead (the tower, when
   * it is that close). Each field counts with room for what
   * stands on it.
   */
  board.updateMatrixWorld(true);
  const from = landscape ? 0 : Math.max(0, (current - 1) * PER_GAP);
  const to = landscape ? total : Math.min(total, (current + 2) * PER_GAP);
  const framed: Vector3[] = [];
  for (const f of fields.slice(from, to + 1)) {
    for (const [dx, dz] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]] as const) {
      framed.push(board.localToWorld(new Vector3(f.x + dx, 0.1, f.z + dz)), board.localToWorld(new Vector3(f.x + dx, 1.1, f.z + dz)));
    }
  }
  if (to === total) framed.push(board.localToWorld(new Vector3(end.x + 0.9, 2.4, end.z)), board.localToWorld(new Vector3(end.x + 1.4, 0, end.z + 0.5)));
  const { look, pos } = s.frame(framed, new Vector3(0, 0.8, 0.6));
  s.cam.look.copy(look);
  s.cam.pos.copy(pos);
  const camBase = s.cam.pos.clone();
  s.onFrame((t) => {
    if (cube) {
      const r = clamp01((t - rollT0) / rollDur);
      const lift = r < 1 ? Math.abs(Math.sin(r * Math.PI * 3.2)) * (1 - r) * 1.6 : 0;
      const e = easeOutCubic(r);
      cube.position.set(restAt.x + (1 - r) * 1.2, 0.31 + lift + (t < rollT0 ? 3 : 0), restAt.z + (1 - r) * 2.0);
      cube.rotation.set(spin.x * (1 - e), spin.y * (1 - e), spin.z * (1 - e));
      s.once('dieland', t, rollT0 + rollDur * 0.32, () => {
        const at = cube.position.clone().setY(0.05);
        board.localToWorld(at);
        s.spawn(at, { count: 8, color: 0xe8d6b6, opacity: 0.6, size: 0.16, grow: 2, life: 0.6, speed: 0.8, up: 0.2 });
      });
    }
    const hops = roll > 0 ? clamp01((t - hopT0) / (hopDur * roll)) : 1;
    const hf = hops * roll;
    const step = Math.min(Math.max(0, roll - 1), Math.floor(hf));
    let within = hf - step;
    let a = fields[startField + step]!;
    let b = fields[Math.min(target, startField + step + 1)]!;
    if (hops >= 1) {
      a = b = fields[target]!;
      within = 1;
    }
    const x = a.x + (b.x - a.x) * easeInOut(within);
    const z = a.z + (b.z - a.z) * easeInOut(within);
    const y = Math.max(a.y, b.y) + Math.sin(within * Math.PI) * 0.7 * (hops < 1 ? 1 : 0);
    const idle = hops >= 1 && !s.still ? Math.abs(Math.sin((t - hopT0 - hopDur * roll) * 2.4)) * 0.1 : 0;
    me.position.set(x, y + idle, z);
    const ms = hops < 1 ? 1 - Math.sin(within * Math.PI * 2) * 0.06 : 1;
    me.scale.set(1 / Math.sqrt(ms), ms, 1 / Math.sqrt(ms));
    for (let k = 1; k <= roll; k++) {
      s.once(`hop${k}`, t, hopT0 + hopDur * k, () => {
        const f = fields[startField + k]!.clone();
        board.localToWorld(f);
        s.spawn(f.add(new Vector3(0, 0.05, 0)), k === roll
          ? { count: 22, color: C.gold, additive: true, opacity: 1, size: 0.13, grow: 0.3, life: 1, speed: 2, up: 1.2, gravity: 2.5 }
          : { count: 5, color: 0xe8d6b6, opacity: 0.6, size: 0.12, grow: 2, life: 0.5, speed: 0.6, up: 0.2 });
      });
    }
    const here = fields[target]!;
    const hp = (t * 0.6) % 1;
    halo.position.set(here.x, here.y + 0.01, here.z);
    haloMaterial.opacity = hops >= 1 ? 0.8 * (1 - hp) : 0;
    halo.scale.setScalar(1 + hp * 0.6);
    clouds.forEach((c, i) => {
      if (s.still) return;
      if (landscape) {
        // Along the board, which runs across the view.
        c.position.z -= 0.004 * (i + 1);
        if (c.position.z < -7.5) c.position.z += 15;
      } else {
        c.position.x = ((c.position.x + 0.004 * (i + 1) + 4) % 8) - 4;
      }
    });
    const verts = flag.geometry.attributes.position!;
    for (let vi = 0; vi < verts.count; vi++) {
      const vx = verts.getX(vi);
      verts.setZ(vi, Math.sin(vx * 14 + t * 6) * 0.03 * (vx + 0.18));
    }
    verts.needsUpdate = true;
    // A slow sway, so the board reads as a thing on a table.
    s.cam.pos.x = camBase.x + Math.sin(t * 0.2) * 0.3;
  });
}

