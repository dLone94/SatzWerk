/**
 * The board game's layout and the pawn's moves, as plain numbers.
 *
 * Nothing here draws or imports three: where every field lies on the table,
 * how the board fills a slot of a given shape, and when the pawn may hop
 * are decided here, so they can be tested where there is no WebGL, and the
 * path scene only draws what this says.
 */
import type { Station } from './sceneData.ts';

/** Fields from one lesson's station to the next. The die shows this many. */
export const PER_GAP = 3;

export interface Spot {
  x: number;
  z: number;
}

export interface BoardPlan {
  /**
   * Every field the pawn can stand on, in order. Field `i * PER_GAP` is
   * lesson i's station; the last one is the checkpoint.
   */
  fields: Spot[];
  /** How many rows the road winds through; the stations snake along them. */
  rows: number;
  /** The rows run along z rather than x: a slot taller than it is wide. */
  upright: boolean;
  /** Where the checkpoint's tower stands, beside the last field. */
  tower: Spot;
  /** The board's top, round everything on it. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Spots on the board's edge for a tree each, clear of the road. */
  trees: Spot[];
}

/** Between two stations' centres in a row, at least and at most. */
const STEP = { min: 2.1, max: 3.0 } as const;
/** Between two rows' centres, at least and at most. */
const ROW_GAP = { min: 2.2, max: 3.4 } as const;
/** Board left round the road and the tower: room for the trees. */
const MARGIN = 0.85;
/** How much shorter the board looks than it is, seen from the camera's tilt. */
const FORESHORTEN = 0.8;
/** How far a turn between rows bulges out past the last station. */
const BULGE = 0.6;

/**
 * Lay out `count` lessons and the checkpoint for a slot of `aspect` (width
 * over height), so the board fills it: the road snakes through as many rows
 * as make the board's shape, seen from above at the camera's tilt, closest
 * to the slot's, and the stations are spread along the rows to take up what
 * is left. A unit of three lessons is two rows of two, a board game's square;
 * a long one winds through three.
 */
export function boardPlan(count: number, aspect: number): BoardPlan {
  const n = Math.max(1, count) + 1;
  const upright = aspect < 1;
  // Across the slot's long side and along its short one.
  const long = upright ? 1 / aspect : aspect;
  let best: { rows: number; cols: number; step: number; gap: number; miss: number } = { rows: 1, cols: n, step: STEP.min, gap: ROW_GAP.min, miss: Infinity };
  // As seen: the axis running away from the camera looks shorter.
  const across = upright ? FORESHORTEN : 1;
  const away = upright ? 1 : FORESHORTEN;
  for (let rows = 1; rows <= Math.min(4, n); rows++) {
    const cols = Math.ceil(n / rows);
    if (rows > 1 && cols * (rows - 1) >= n) continue;
    // A full last row ends at the board's edge, and the tower stands past it.
    const bulge = (rows > 1 ? BULGE : 0) + (n % cols === 0 ? 0.95 : 0);
    const widthAt = (step: number) => ((cols - 1) * step + 2 * MARGIN + bulge) * across;
    const depthAt = (gap: number) => ((rows - 1) * gap + 2 * MARGIN) * away;
    // Spread the stations along the rows, or the rows apart, towards the slot's shape.
    let gap: number = ROW_GAP.min;
    const wanted = (long * depthAt(gap)) / across - 2 * MARGIN - bulge;
    const step = cols > 1 ? Math.min(STEP.max, Math.max(STEP.min, wanted / (cols - 1))) : STEP.min;
    if (rows > 1 && widthAt(step) / depthAt(gap) > long) {
      gap = Math.min(ROW_GAP.max, Math.max(ROW_GAP.min, (widthAt(step) / long / away - 2 * MARGIN) / (rows - 1)));
    }
    const miss = Math.abs(Math.log(widthAt(step) / depthAt(gap) / long));
    if (miss < best.miss - 1e-9) best = { rows, cols, step, gap, miss };
  }
  const { rows, cols, step, gap } = best;
  // In the plan's own terms: u along a row, v from row to row (away to near).
  const station = (i: number): Spot => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const along = row % 2 === 0 ? col : cols - 1 - col;
    return { x: (along - (cols - 1) / 2) * step, z: (row - (rows - 1) / 2) * gap };
  };
  const planned: Spot[] = [];
  for (let i = 0; i < n; i++) {
    const a = station(i);
    planned.push(a);
    if (i === n - 1) break;
    const b = station(i + 1);
    for (let k = 1; k < PER_GAP; k++) {
      const f = k / PER_GAP;
      if (a.z === b.z) {
        planned.push({ x: a.x + (b.x - a.x) * f, z: a.z });
      } else {
        // Round the end of the row, bulging outwards, to the next one.
        const angle = Math.PI * f;
        const side = a.x >= 0 ? 1 : -1;
        planned.push({ x: a.x + side * Math.sin(angle) * BULGE, z: a.z + (b.z - a.z) * (1 - Math.cos(angle)) / 2 });
      }
    }
  }
  const lastRow = Math.floor((n - 1) / cols);
  const end = planned[planned.length - 1]!;
  // The tower stands one step on from the checkpoint, along its row.
  const onward = cols > 1 ? (lastRow % 2 === 0 ? 1 : -1) : 1;
  const towerSpot: Spot = { x: end.x + onward * 0.95, z: end.z - 0.1 };
  const turn = (spot: Spot): Spot => (upright ? { x: spot.z, z: spot.x } : spot);
  const fields = planned.map(turn);
  const tower = turn(towerSpot);
  const xs = [...fields.map((f) => f.x), tower.x];
  const zs = [...fields.map((f) => f.z), tower.z];
  const bounds = {
    minX: Math.min(...xs) - MARGIN,
    maxX: Math.max(...xs) + MARGIN,
    minZ: Math.min(...zs) - MARGIN,
    maxZ: Math.max(...zs) + MARGIN,
  };
  return { fields, rows, upright, tower, bounds, trees: treeSpots(bounds, fields, tower) };
}

/** Corners and edges of the board, wherever a tree is clear of the road and the tower. */
function treeSpots(bounds: BoardPlan['bounds'], fields: Spot[], tower: Spot): Spot[] {
  const inset = 0.42;
  const xs = [bounds.minX + inset, (bounds.minX + bounds.maxX) / 2, bounds.maxX - inset];
  const zs = [bounds.minZ + inset, (bounds.minZ + bounds.maxZ) / 2, bounds.maxZ - inset];
  const candidates: Spot[] = [];
  for (const z of zs) for (const x of xs) if (z !== zs[1] || x !== xs[1]) candidates.push({ x, z });
  const clear = (spot: Spot) => fields.every((f) => Math.hypot(f.x - spot.x, f.z - spot.z) > 0.75)
    && Math.hypot(tower.x - spot.x, tower.z - spot.z) > 0.9;
  return candidates.filter(clear).slice(0, 6);
}

/**
 * The pawn's move onto the station it stands on now: three fields hopped
 * from the station before, after a roll of the die — but only from a lesson
 * that is finished. On the first lesson, or after one left undone, it just
 * stands where it is: a hop has to be earned.
 */
export function pawnMove(stations: Station[], current: number): { roll: number; from: number; to: number } {
  const at = Math.max(0, Math.min(stations.length, current));
  const roll = at > 0 && stations[at - 1] === 'done' ? PER_GAP : 0;
  const to = at * PER_GAP;
  return { roll, from: to - roll, to };
}

/**
 * Where the pawn is at time `t` of a move: between field `a` and field `b`,
 * `within` of the way, still hopping or come to rest. A move without a roll
 * is at rest from the start.
 */
export function pawnAt(t: number, move: { roll: number; from: number; to: number }, start: number, hop: number):
  { a: number; b: number; within: number; hopping: boolean } {
  if (move.roll === 0 || t >= start + hop * move.roll) return { a: move.to, b: move.to, within: 1, hopping: false };
  if (t <= start) return { a: move.from, b: move.from, within: 0, hopping: false };
  const hf = ((t - start) / hop);
  const step = Math.min(move.roll - 1, Math.floor(hf));
  return { a: move.from + step, b: move.from + step + 1, within: hf - step, hopping: true };
}
