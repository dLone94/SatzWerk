import {
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RingGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector3,
  type Texture,
} from 'three';
import { PER_GAP, boardPlan, pawnAt, pawnMove } from '../../boardPlan.ts';
import type { SceneSpec, Station } from '../../sceneData.ts';
import type { Kit } from '../kit.ts';
import { C } from '../kit.ts';
import { clamp01, easeInOut, easeOutBack, easeOutCubic } from '../motion.ts';
import { block, die, house, motes, pawn, tree } from '../pieces.ts';
import type { Stage } from '../stage.ts';

/**
 * How each station reads at a glance: done is a full green with a tick,
 * the pawn's a gold one, one still ahead is cream with its number, one not
 * written yet sinks into the board, small and grey.
 */
const LOOK: Record<Station | 'gate', { colour: number; radius: number; height: number; ink: string }> = {
  done: { colour: C.das, radius: 0.46, height: 0.16, ink: '#FFFFFF' },
  current: { colour: C.verb, radius: 0.5, height: 0.18, ink: '#1E1B17' },
  todo: { colour: 0xfbf3e2, radius: 0.46, height: 0.16, ink: '#3D372F' },
  planned: { colour: 0xcfc4b0, radius: 0.36, height: 0.07, ink: '#8C8170' },
  gate: { colour: C.birchDark, radius: 0.5, height: 0.18, ink: '#1E1B17' },
};

/** A station's number, painted to lie on its top. */
function numberTexture(kit: Kit, n: number, ink: string): Texture {
  return kit.canvasTexture(`station-${n}-${ink}`, 128, 128, (g, W) => {
    g.clearRect(0, 0, W, W);
    g.fillStyle = ink;
    g.font = `900 ${Math.round(W * 0.62)}px "Nunito", "Onest", system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(n), W / 2, W / 2 + W * 0.04);
  });
}

/** The pawn's badge: its lesson's number on a gold tile, always facing the camera. */
function badgeTexture(kit: Kit, n: number): Texture {
  return kit.canvasTexture(`badge-${n}`, 128, 128, (g, W) => {
    g.clearRect(0, 0, W, W);
    const r = W * 0.2;
    const x = W * 0.08;
    const s = W * 0.84;
    g.fillStyle = 'rgba(30,27,23,0.25)';
    g.beginPath();
    g.roundRect(x, x + W * 0.05, s, s - W * 0.02, r);
    g.fill();
    g.fillStyle = '#F2B630';
    g.beginPath();
    g.roundRect(x, x, s, s - W * 0.04, r);
    g.fill();
    g.fillStyle = '#1E1B17';
    g.font = `900 ${Math.round(W * 0.56)}px "Nunito", "Onest", system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(n), W / 2, W / 2 + W * 0.01);
  });
}

/**
 * The unit as a wooden board game: one numbered station per lesson, green
 * with a tick when done, then the checkpoint's tower at the end. The die
 * rolls the three fields from the last station, and the pawn hops them to
 * the lesson the course says is next, where a gold tile shows its number.
 * The road winds through as many rows as fill the slot (see boardPlan),
 * and the camera frames the whole board.
 */
export function path(s: Stage, spec: Extract<SceneSpec, { scene: 'path' }>): void {
  const count = spec.stations.length;
  const current = Math.max(0, Math.min(count, spec.current));
  const plan = boardPlan(count, s.aspect);
  const shape = `${plan.rows}${plan.upright}`;
  const board = new Group();
  s.scene.add(board);
  const { minX, maxX, minZ, maxZ } = plan.bounds;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const top = block(s, null, 0xe8d3a8, { w: maxX - minX, h: 0.3, d: maxZ - minZ, noShadowBlob: true, mat: { clearcoat: 0.9 } });
  top.group.position.set(cx, -0.3, cz);
  board.add(top.group);
  const edge = block(s, null, C.walnut, { w: maxX - minX + 0.36, h: 0.2, d: maxZ - minZ + 0.36, noShadowBlob: true });
  edge.group.position.set(cx, -0.46, cz);
  board.add(edge.group);

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
  const fields: Vector3[] = [];
  const move = pawnMove(spec.stations, current);
  const stepMaterial = s.kit.lacquer(0xf6ead2, { noGrain: true, clearcoat: 1 });
  const walkedMaterial = s.kit.lacquer(0x8fd0a6, { noGrain: true, clearcoat: 1 });
  const stepGeometry = new CylinderGeometry(0.17, 0.18, 0.07, 32);
  const topPlane = new PlaneGeometry(1, 1);
  plan.fields.forEach((spot, f) => {
    const isStation = f % PER_GAP === 0;
    const index = f / PER_GAP;
    if (isStation) {
      const state: Station | 'gate' = index === count ? 'gate' : index === current ? 'current' : spec.stations[index]!;
      const look = LOOK[state];
      const disc = new Mesh(new CylinderGeometry(look.radius, look.radius + 0.03, look.height, 48),
        s.kit.lacquer(look.colour, { clearcoat: 1, noGrain: state !== 'todo' && state !== 'gate' }));
      disc.position.set(spot.x, look.height / 2, spot.z);
      disc.castShadow = state !== 'planned';
      disc.receiveShadow = true;
      board.add(disc);
      if (state === 'gate') {
        // The checkpoint's gate: a gold rim round the disc.
        const rim = new Mesh(new TorusGeometry(look.radius + 0.02, 0.05, 12, 48), s.kit.lacquer(C.gold, { noGrain: true, metalness: 0.4, roughness: 0.3 }));
        rim.rotation.x = -Math.PI / 2;
        rim.position.set(spot.x, look.height, spot.z);
        board.add(rim);
      }
      // Done: a tick. Ahead or not written yet: its number. The pawn's own
      // number is on its badge, where the pawn does not hide it.
      const face = state === 'done' ? tick : state === 'todo' || state === 'planned' ? numberTexture(s.kit, index + 1, look.ink) : null;
      if (face) {
        const mark = new Mesh(topPlane, new MeshBasicMaterial({ map: face, transparent: true, depthWrite: false }));
        mark.rotation.x = -Math.PI / 2;
        const size = look.radius * (state === 'done' ? 1.25 : 1.45);
        mark.scale.set(size, size, 1);
        mark.position.set(spot.x, look.height + 0.004, spot.z);
        board.add(mark);
      }
      fields.push(new Vector3(spot.x, look.height, spot.z));
    } else {
      // Walked: on from a lesson that is done, up to the pawn.
      const from = Math.floor(f / PER_GAP);
      const walked = f < move.to && spec.stations[from] === 'done';
      const disc = new Mesh(stepGeometry, walked ? walkedMaterial : stepMaterial);
      disc.position.set(spot.x, 0.035, spot.z);
      disc.castShadow = true;
      disc.receiveShadow = true;
      board.add(disc);
      fields.push(new Vector3(spot.x, 0.07, spot.z));
    }
  });

  // The checkpoint's tower, with its flag.
  const tower = house(s, 0xf6ecd8, C.roofRed, { w: 0.7, h: 1.0, d: 0.7, roofH: 0.5, windows: 1 });
  tower.group.position.set(plan.tower.x, 0, plan.tower.z);
  for (const w of tower.windows) w.emissiveIntensity = 0.9;
  board.add(tower.group);
  const flagPole = new Mesh(new CylinderGeometry(0.02, 0.02, 0.62, 8), s.kit.lacquer(C.ink, { noGrain: true }));
  flagPole.position.set(plan.tower.x, 1.72, plan.tower.z);
  board.add(flagPole);
  const flag = new Mesh(new PlaneGeometry(0.34, 0.2, 8, 2), new MeshStandardMaterial({ color: C.verb, side: DoubleSide }));
  flag.position.set(plan.tower.x + 0.17, 1.92, plan.tower.z);
  board.add(flag);
  plan.trees.forEach((spot, j) => {
    const t = tree(s, 0.55 + (j % 3) * 0.08, j % 2 ? C.leafDark : C.leaf);
    t.position.set(spot.x, 0, spot.z);
    board.add(t);
  });

  const me = pawn(s, C.der);
  me.scale.setScalar(0.92);
  board.add(me);
  const haloMaterial = new MeshBasicMaterial({ color: C.verb, transparent: true, opacity: 0, depthWrite: false });
  const halo = new Mesh(new RingGeometry(0.56, 0.68, 64), haloMaterial);
  halo.rotation.x = -Math.PI / 2;
  board.add(halo);
  // The lesson's number over the pawn, once it has arrived. None at the
  // checkpoint: the tower says where it stands.
  const badgeMaterial = current < count ? new SpriteMaterial({ map: badgeTexture(s.kit, current + 1), transparent: true, depthWrite: false, opacity: 0 }) : null;
  const badge = badgeMaterial ? new Sprite(badgeMaterial) : null;
  if (badge) {
    badge.scale.set(0.64, 0.64, 1);
    board.add(badge);
  }

  const cube = move.roll > 0 ? die(s, move.roll) : undefined;
  if (cube) board.add(cube);
  const rollT0 = 0.3;
  const rollDur = 1.3;
  const hopT0 = move.roll > 0 ? rollT0 + rollDur + 0.25 : 0.3;
  const hopDur = 0.42;
  const spin = new Vector3(9.4, 6.3, 7.9);
  // The die comes to rest beside the pawn, on the near side.
  const restAt = fields[move.to]!.clone().add(new Vector3(0.72, 0, 0.55));
  restAt.y = 0;
  s.stillTime = hopT0 + hopDur * Math.max(1, move.roll) + 1.2;
  s.cam.parallax = 0.35;
  motes(s, 30, [maxX - minX, 3, maxZ - minZ]);

  /*
   * Framing: the whole board, its corners and what stands tallest on it,
   * filling the slot. The board is laid out for the slot's shape; past the
   * point where another layout fits better, it is laid out again.
   */
  const framed: Vector3[] = [];
  for (const x of [minX - 0.18, maxX + 0.18]) for (const z of [minZ - 0.18, maxZ + 0.18]) framed.push(new Vector3(x, -0.36, z));
  for (const spot of plan.trees) framed.push(new Vector3(spot.x, 0.85, spot.z));
  framed.push(new Vector3(plan.tower.x, 2.05, plan.tower.z), new Vector3(plan.tower.x + 0.4, 2.05, plan.tower.z));
  if (badge) framed.push(new Vector3(fields[move.to]!.x, 1.85, fields[move.to]!.z));
  const camBase = new Vector3();
  s.framing(() => {
    const now = boardPlan(count, s.aspect);
    if (`${now.rows}${now.upright}` !== shape) {
      s.rebuild();
      return;
    }
    const { look, pos } = s.frame(framed, new Vector3(0, 1, 0.62), 0.96);
    s.cam.look.copy(look);
    s.cam.pos.copy(pos);
    camBase.copy(pos);
  });
  s.onFrame((t) => {
    if (cube) {
      const r = clamp01((t - rollT0) / rollDur);
      const lift = r < 1 ? Math.abs(Math.sin(r * Math.PI * 3.2)) * (1 - r) * 1.6 : 0;
      const e = easeOutCubic(r);
      cube.position.set(restAt.x + (1 - r) * 1.2, 0.31 + lift + (t < rollT0 ? 3 : 0), restAt.z + (1 - r) * 1.4);
      cube.rotation.set(spin.x * (1 - e), spin.y * (1 - e), spin.z * (1 - e));
      s.once('dieland', t, rollT0 + rollDur * 0.32, () => {
        s.spawn(cube.position.clone().setY(0.05), { count: 8, color: 0xe8d6b6, opacity: 0.6, size: 0.16, grow: 2, life: 0.6, speed: 0.8, up: 0.2 });
      });
    }
    const at = pawnAt(t, move, hopT0, hopDur);
    const a = fields[at.a]!;
    const b = fields[at.b]!;
    const x = a.x + (b.x - a.x) * easeInOut(at.within);
    const z = a.z + (b.z - a.z) * easeInOut(at.within);
    const y = Math.max(a.y, b.y) + (at.hopping ? Math.sin(at.within * Math.PI) * 0.7 : 0);
    const rested = !at.hopping && at.a === move.to;
    const idle = rested && !s.still ? Math.abs(Math.sin((t - hopT0 - hopDur * move.roll) * 2.4)) * 0.08 : 0;
    me.position.set(x, y + idle, z);
    const ms = at.hopping ? 1 - Math.sin(at.within * Math.PI * 2) * 0.06 : 1;
    me.scale.set(0.92 / Math.sqrt(ms), 0.92 * ms, 0.92 / Math.sqrt(ms));
    for (let k = 1; k <= move.roll; k++) {
      s.once(`hop${k}`, t, hopT0 + hopDur * k, () => {
        const f = fields[move.from + k]!.clone();
        s.spawn(f.add(new Vector3(0, 0.05, 0)), k === move.roll
          ? { count: 22, color: C.gold, additive: true, opacity: 1, size: 0.13, grow: 0.3, life: 1, speed: 2, up: 1.2, gravity: 2.5 }
          : { count: 5, color: 0xe8d6b6, opacity: 0.6, size: 0.12, grow: 2, life: 0.5, speed: 0.6, up: 0.2 });
      });
    }
    const here = fields[move.to]!;
    const arrived = clamp01((t - (hopT0 + hopDur * move.roll)) / 0.4);
    const hp = s.still ? 0.25 : (t * 0.6) % 1;
    halo.position.set(here.x, here.y + 0.01, here.z);
    haloMaterial.opacity = rested ? 0.85 * (1 - hp) : 0;
    halo.scale.setScalar(1 + hp * 0.5);
    if (badge && badgeMaterial) {
      badge.position.set(here.x, 1.5 + (1 - easeOutBack(arrived)) * 0.3 + idle, here.z);
      badgeMaterial.opacity = rested ? arrived : 0;
    }
    const verts = flag.geometry.attributes.position!;
    for (let vi = 0; vi < verts.count; vi++) {
      const vx = verts.getX(vi);
      verts.setZ(vi, Math.sin(vx * 14 + t * 6) * 0.03 * (vx + 0.17));
    }
    verts.needsUpdate = true;
    // A slow sway, so the board reads as a thing on a table.
    s.cam.pos.x = camBase.x + Math.sin(t * 0.2) * 0.2;
  });
}
