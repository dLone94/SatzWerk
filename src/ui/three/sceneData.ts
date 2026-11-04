/**
 * What each wooden scene shows, worked out from the learner's real data.
 *
 * Nothing here draws, and nothing here imports three: these are the plain
 * decisions — which words become blocks, which lesson the pawn stands on,
 * which two words swap places — so they can be tested where there is no
 * WebGL, and so the scenes themselves can never make anything up. A scene is
 * handed one of these specs and draws exactly what it says.
 *
 * The types and Today's town live here; the rails (rails.ts), the tower
 * (tower.ts) and the board (board.ts) live beside it, each with the page
 * that needs it, so the first screen carries only the town.
 */

/** A block's paint. Gender colours only where the sentence already shows the gender. */
export type BlockTone = 'birch' | 'der' | 'die' | 'das';

export interface WoodBlock {
  text: string;
  tone: BlockTone;
}

/** The building the town lights up for today's step. */
export type TownSign = 'bakery' | 'house';

/** One lesson on the board: done, where the pawn stands, still ahead, or not written yet. */
export type Station = 'done' | 'current' | 'todo' | 'planned';

export type SceneSpec =
  | { scene: 'today'; bubble: string; sign: TownSign; done: boolean }
  | { scene: 'question'; before: WoodBlock[]; after: WoodBlock[]; tail: string }
  | { scene: 'feedback'; before: WoodBlock[]; wrong: string; right: string; after: WoodBlock[] }
  | { scene: 'complete'; words: WoodBlock[] }
  | { scene: 'path'; stations: Station[]; current: number };

export type SceneName = SceneSpec['scene'];

/**
 * Today's town: the building that is lit is today's step. The daily
 * practice at the bakery hangs out its pretzel; any other step is a lit
 * house, because the town has no honest building for it. Once the day is
 * done, every window is lit and the dog says it is done.
 */
export function todayTown(input: { step: string; scenarioId?: string }): Extract<SceneSpec, { scene: 'today' }> {
  const practising = input.step === 'daily' || input.step === 'continue-daily';
  const done = input.step === 'done';
  return {
    scene: 'today',
    bubble: done ? 'Geschafft!' : 'Hallo!',
    sign: practising && input.scenarioId === 'sc-bakery' ? 'bakery' : 'house',
    done,
  };
}
