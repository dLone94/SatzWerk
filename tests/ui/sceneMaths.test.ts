import { PerspectiveCamera, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { PER_GAP, TOWER_ROOM, boardPlan, pawnAt, pawnMove } from '../../src/ui/three/boardPlan.ts';
import { frameView } from '../../src/ui/three/engine/framing.ts';
import type { Station } from '../../src/ui/three/sceneData.ts';
import { BLOCK_HEIGHT, BLOCK_WIDTH, ONE_LINE, labelLines, towerBlockWidth, towerLayout } from '../../src/ui/three/tower.ts';

/**
 * The scenes' arithmetic, without WebGL: where the board's fields lie, when
 * the pawn may hop, how the camera frames what it must, and how a tower's
 * lettering is laid out. three's maths runs anywhere; only drawing needs a
 * GPU.
 */

describe('the pawn\'s move', () => {
  const done: Station = 'done';
  it('hops the three fields from a finished lesson to the one it stands on', () => {
    expect(pawnMove([done, 'current', 'todo'], 1)).toEqual({ roll: PER_GAP, from: 0, to: PER_GAP });
    // Every lesson done: on to the checkpoint.
    expect(pawnMove([done, done, done], 3)).toEqual({ roll: PER_GAP, from: 2 * PER_GAP, to: 3 * PER_GAP });
  });

  it('stands still on the first lesson, and after one left undone', () => {
    expect(pawnMove(['current', 'todo', 'todo'], 0)).toEqual({ roll: 0, from: 0, to: 0 });
    // Lesson 2 is next, but lesson 1 was skipped: no hop is earned.
    expect(pawnMove(['todo', 'current', 'todo'], 1)).toEqual({ roll: 0, from: PER_GAP, to: PER_GAP });
    expect(pawnMove(['planned', 'current'], 1).roll).toBe(0);
  });

  it('steps field by field while it hops, and rests on its station after', () => {
    const move = pawnMove([done, 'current'], 1);
    const start = 1;
    const hop = 0.5;
    expect(pawnAt(0, move, start, hop)).toEqual({ a: 0, b: 0, within: 0, hopping: false });
    expect(pawnAt(1.25, move, start, hop)).toMatchObject({ a: 0, b: 1, hopping: true });
    expect(pawnAt(1.25, move, start, hop).within).toBeCloseTo(0.5);
    expect(pawnAt(2.2, move, start, hop)).toMatchObject({ a: 2, b: 3, hopping: true });
    expect(pawnAt(2.5, move, start, hop)).toEqual({ a: 3, b: 3, within: 1, hopping: false });
    expect(pawnAt(99, move, start, hop)).toEqual({ a: 3, b: 3, within: 1, hopping: false });
  });

  it('never moves at all without a roll', () => {
    const move = pawnMove(['current', 'todo'], 0);
    for (const t of [0, 0.5, 2, 10]) expect(pawnAt(t, move, 0.3, 0.42)).toEqual({ a: 0, b: 0, within: 1, hopping: false });
  });
});

describe('the board\'s layout', () => {
  it('has a station every three fields, the checkpoint last', () => {
    for (const count of [2, 3, 4, 6, 8]) {
      const plan = boardPlan(count, 1.45);
      expect(plan.fields).toHaveLength(count * PER_GAP + 1);
    }
  });

  it('lays a unit of three lessons out as a board game\'s square: two rows of two', () => {
    const plan = boardPlan(3, 1.41);
    expect(plan.rows).toBe(2);
    expect(plan.upright).toBe(false);
    const stations = [0, 1, 2, 3].map((i) => plan.fields[i * PER_GAP]!);
    // Along the far row, then back along the near one.
    expect(stations[0]!.z).toBe(stations[1]!.z);
    expect(stations[2]!.z).toBe(stations[3]!.z);
    expect(stations[2]!.z).toBeGreaterThan(stations[0]!.z);
    expect(stations[1]!.x).toBeGreaterThan(stations[0]!.x);
    expect(stations[3]!.x).toBeLessThan(stations[2]!.x);
  });

  it('keeps every field apart from the next, so no two discs overlap', () => {
    for (const [count, aspect] of [[2, 1.4], [3, 1.4], [4, 1.5], [8, 1.45], [3, 0.8], [6, 2.4]] as const) {
      const { fields } = boardPlan(count, aspect);
      for (let i = 1; i < fields.length; i++) {
        const gap = Math.hypot(fields[i]!.x - fields[i - 1]!.x, fields[i]!.z - fields[i - 1]!.z);
        // A station's disc is 0.5 across from its centre, a field's 0.18.
        expect(gap, `${count} lessons at ${aspect}, field ${i}`).toBeGreaterThan(0.5 + 0.18 - 0.05);
      }
    }
  });

  it('keeps the road, the tower and the trees on the board', () => {
    for (const [count, aspect] of [[2, 1.4], [3, 1.4], [4, 1.5], [8, 1.45], [3, 0.8]] as const) {
      const { fields, tower, trees, bounds } = boardPlan(count, aspect);
      for (const spot of [...fields, tower, ...trees]) {
        expect(spot.x).toBeGreaterThan(bounds.minX);
        expect(spot.x).toBeLessThan(bounds.maxX);
        expect(spot.z).toBeGreaterThan(bounds.minZ);
        expect(spot.z).toBeLessThan(bounds.maxZ);
      }
      // Trees stand clear of the road.
      for (const tree of trees) for (const field of fields) expect(Math.hypot(tree.x - field.x, tree.z - field.z)).toBeGreaterThan(0.7);
    }
  });

  /* In a unit of three or four lessons the checkpoint's red roof hung over the board's rim. */
  it('leaves room round the checkpoint\'s house for its height', () => {
    for (const [count, aspect] of [[2, 1.4], [3, 1.4], [3, 1.5], [4, 1.5], [8, 1.45], [3, 0.8], [4, 0.75]] as const) {
      const { tower, bounds } = boardPlan(count, aspect);
      const room = Math.min(tower.x - bounds.minX, bounds.maxX - tower.x, tower.z - bounds.minZ, bounds.maxZ - tower.z);
      expect(room, `${count} lessons at ${aspect}`).toBeGreaterThanOrEqual(TOWER_ROOM - 1e-9);
    }
  });

  /* The board was a long strip in a short slot: a third of it in view and sand round it. */
  it('takes the slot\'s shape: wide for a wide slot, tall for a tall one', () => {
    const shapeOf = (count: number, aspect: number) => {
      // As the camera sees it: the board's depth runs away from it, and looks shorter.
      const { bounds } = boardPlan(count, aspect);
      return (bounds.maxX - bounds.minX) / ((bounds.maxZ - bounds.minZ) * 0.8);
    };
    for (const count of [3, 4, 6]) {
      expect(shapeOf(count, 1.45), `${count} wide`).toBeGreaterThan(1);
      expect(shapeOf(count, 0.75), `${count} tall`).toBeLessThan(1);
    }
    expect(boardPlan(3, 0.75).upright).toBe(true);
    // A long unit winds through more rows than a short one.
    expect(boardPlan(8, 1.45).rows).toBeGreaterThan(boardPlan(2, 1.45).rows - 1);
  });
});

describe('the camera\'s framing', () => {
  const corners = (w: number, d: number, h = 0) => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sz) => [new Vector3(sx * w / 2, 0, sz * d / 2), new Vector3(sx * w / 2, h, sz * d / 2)]));

  /** Where each point lands on the screen, -1 to 1 either way. */
  function onScreen(aspect: number, points: Vector3[], tilt: Vector3, fill: number) {
    const camera = new PerspectiveCamera(32, aspect, 0.1, 120);
    const { look, pos } = frameView(camera, points, tilt, fill);
    camera.position.copy(pos);
    camera.lookAt(look);
    camera.updateMatrixWorld(true);
    return points.map((point) => point.clone().project(camera));
  }

  it.each([[1.41], [1.49], [0.8], [2.0]])('keeps everything in view and fills a %s slot to the margin', (aspect) => {
    const points = corners(6, 4, 1);
    const fill = 0.94;
    const seen = onScreen(aspect, points, new Vector3(0, 1, 0.62), fill);
    for (const p of seen) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(1);
    }
    const xs = seen.map((p) => p.x);
    const ys = seen.map((p) => p.y);
    const extent = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
    expect(extent).toBeCloseTo(fill, 1);
    // Centred: as much room either side.
    expect(Math.max(...xs) + Math.min(...xs)).toBeCloseTo(0, 1);
    expect(Math.max(...ys) + Math.min(...ys)).toBeCloseTo(0, 1);
  });

  it('frames a thing off the origin where it is', () => {
    const points = corners(2, 2).map((p) => p.add(new Vector3(5, 0, -3)));
    for (const p of onScreen(1.5, points, new Vector3(0, 0.2, 1), 0.9)) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(1);
    }
  });
});

describe('a tower block\'s lettering', () => {
  it('keeps a word on one line, and breaks a long phrase where the lines come out even', () => {
    expect(labelLines('Deutschland')).toEqual(['Deutschland']);
    expect(labelLines('Guten Tag')).toEqual(['Guten Tag']);
    expect(labelLines('Woher kommst du?')).toEqual(['Woher', 'kommst du?']);
    expect(labelLines('Wo wohnst du?')).toEqual(['Wo wohnst', 'du?']);
    expect(labelLines('Entschuldigung')).toEqual(['Entschuldigung']);
    for (const text of ['Wie heißen Sie?', 'Ich komme aus Bulgarien.', 'Auf Wiedersehen']) {
      const lines = labelLines(text);
      expect(lines.join(' ')).toBe(text);
      expect(Math.max(...lines.map((line) => line.length))).toBeLessThanOrEqual(Math.max(ONE_LINE, Math.ceil(text.length / 2) + 6));
    }
  });

  it('widens a block for its longest line, within bounds', () => {
    expect(towerBlockWidth('Hallo')).toBe(BLOCK_WIDTH.min);
    expect(towerBlockWidth('Deutschland')).toBeGreaterThan(towerBlockWidth('kommen'));
    expect(towerBlockWidth('Ein sehr langes Wort hier')).toBeLessThanOrEqual(BLOCK_WIDTH.max);
    expect(towerBlockWidth('Woher kommst du?')).toBe(towerBlockWidth('kommst du?'));
  });

  it('stacks the widest blocks lowest, taller in a row with a phrase on two lines', () => {
    const words = ['kommen', 'Woher kommst du?', 'leben', 'Deutschland', 'wohnen', 'Wo wohnst du?'].map((text) => ({ text }));
    const { rows, widths, heights } = towerLayout(words);
    expect(rows.map((row) => row.length)).toEqual([3, 2, 1]);
    expect(rows.flat().sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(rows[0]!.map((index) => words[index]!.text).sort()).toEqual(['Deutschland', 'Wo wohnst du?', 'Woher kommst du?']);
    expect(widths[0]).toBeGreaterThan(widths[1]!);
    expect(widths[1]).toBeGreaterThan(widths[2]!);
    expect(heights).toEqual([BLOCK_HEIGHT.two, BLOCK_HEIGHT.one, BLOCK_HEIGHT.one]);
  });
});
