import { LEVEL_OUTLINES } from '../outline/levelOutlines.ts';
import type { CefrLevel, Checkpoint, Level, Unit } from '../types.ts';

export function defineLevel(id: Exclude<CefrLevel, 'c1' | 'c2'>, units: Unit[], checkpoint: Checkpoint): Level {
  const outline = LEVEL_OUTLINES[id];
  return { id, label: outline.label, title: outline.title, description: outline.description,
    status: 'available', outcomes: outline.outcomes, units, checkpoint,
    outline: { topics: outline.topics, grammar: outline.grammar } };
}
