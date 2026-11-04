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
