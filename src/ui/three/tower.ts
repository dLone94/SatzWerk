/** The finished session's tower: which words, in which rows. */
import type { SceneSpec } from './sceneData.ts';

/** The most words the finished tower stacks: three, two, one. */
export const MAX_TOWER_WORDS = 6;

/** A word as the course teaches it. */
export interface TowerWord {
  display: string;
  article?: 'der' | 'die' | 'das';
}

/**
 * The finished session's new words, as a tower: at most six, in the order
 * they were taught, each noun in its gender's colour when the course gives
 * it one. Returns the blocks and how many words there were in all, so a
 * capped tower can say so. No words, no tower.
 */
export function completeTower(words: TowerWord[]): { spec: Extract<SceneSpec, { scene: 'complete' }>; total: number } | null {
  const seen = new Set<string>();
  const unique = words.filter((word) => {
    const key = word.display.toLowerCase();
    if (!word.display.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (unique.length === 0) return null;
  const shown = unique.slice(0, MAX_TOWER_WORDS);
  return {
    spec: { scene: 'complete', words: shown.map((word) => ({ text: word.display, tone: word.article ?? 'birch' })) },
    total: unique.length,
  };
}

/** The rows of the tower, bottom first, for `n` blocks. */
export function towerRows(n: number): number[] {
  switch (Math.max(0, Math.min(MAX_TOWER_WORDS, n))) {
    case 0: return [];
    case 1: return [1];
    case 2: return [2];
    case 3: return [2, 1];
    case 4: return [2, 2];
    case 5: return [3, 2];
    default: return [3, 2, 1];
  }
}

/** The longest label a block carries on one line; a longer phrase is broken in two. */
export const ONE_LINE = 11;

/**
 * A block's lettering, in lines. A single word stays whole; a phrase longer
 * than ONE_LINE ("Woher kommst du?") breaks at the space that leaves the two
 * lines most even, so each line's letters can be twice the size one line
 * would allow on a phone. Nothing is cut: the block shows what was taught.
 */
export function labelLines(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= ONE_LINE || !trimmed.includes(' ')) return [trimmed];
  let best = [trimmed];
  let longest = Infinity;
  for (let at = trimmed.indexOf(' '); at !== -1; at = trimmed.indexOf(' ', at + 1)) {
    const lines = [trimmed.slice(0, at), trimmed.slice(at + 1)];
    const width = Math.max(...lines.map((line) => line.length));
    if (width < longest) {
      longest = width;
      best = lines;
    }
  }
  return best;
}

/** The narrowest and widest a tower's block may be, in the scene's units. */
export const BLOCK_WIDTH = { min: 1.75, max: 2.7 } as const;

/**
 * A tower block's width for its lettering: as wide as its longest line
 * needs, between BLOCK_WIDTH's bounds. The tower is drawn in a wide, short
 * slot, where its height decides the scale: a wider block costs no size, and
 * gives a long word letters as tall as a short one's.
 */
export function towerBlockWidth(text: string): number {
  const longest = Math.max(...labelLines(text).map((line) => line.length));
  return Math.min(BLOCK_WIDTH.max, Math.max(BLOCK_WIDTH.min, 0.2 * longest + 0.45));
}

/** The gap between two blocks in a row. */
export const TOWER_GAP = 0.08;

/**
 * Which block goes in which row, bottom first: the widest at the bottom so
 * the tower narrows as it rises, whatever order the words were taught in.
 * Returns indices into `words`, and each row's width and height.
 */
/** A block's height: one line of lettering, or two, which need the room to be read on a phone. */
export const BLOCK_HEIGHT = { one: 0.78, two: 1.08 } as const;
/** Between one row's top and the next row's bottom. */
export const ROW_GAP = 0.02;

export function towerLayout(words: ReadonlyArray<{ text: string }>): { rows: number[][]; widths: number[]; heights: number[] } {
  const order = words.map((word, index) => ({ index, w: towerBlockWidth(word.text) }))
    .sort((a, b) => b.w - a.w || a.index - b.index);
  const rows: number[][] = [];
  let next = 0;
  for (const count of towerRows(words.length)) {
    rows.push(order.slice(next, next + count).map((entry) => entry.index));
    next += count;
  }
  const widths = rows.map((row) => row.reduce((sum, index) => sum + towerBlockWidth(words[index]!.text), 0) + TOWER_GAP * Math.max(0, row.length - 1));
  // A row with a phrase on two lines is taller, every block in it alike.
  const heights = rows.map((row) => (row.some((index) => labelLines(words[index]!.text).length > 1) ? BLOCK_HEIGHT.two : BLOCK_HEIGHT.one));
  return { rows, widths, heights };
}
