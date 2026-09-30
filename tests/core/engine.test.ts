import { describe, expect, it } from 'vitest';
import {
  LEXICON,
  PLACEMENT_CHECKPOINT,
  allCheckpoints,
  availableLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import type { Exercise } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/*
 * Checks that run the whole course through the validator, for mistakes in
 * the engine that only show up on particular authored answers.
 */

const opts = { lexicon: LEXICON };

function allExercises(): Exercise[] {
  const out: Exercise[] = [];
  for (const lesson of availableLessons()) out.push(...lessonExercises(lesson));
  for (const checkpoint of allCheckpoints()) out.push(...checkpoint.exercises);
  out.push(...PLACEMENT_CHECKPOINT.exercises);
  return out;
}

/*
 * A trap that differs from the answer only by a comma or an apostrophe used
 * to catch the correct answer typed without its full stop.
 */
describe('no trap catches a correct answer', () => {
  it('leaves every accepted answer and alternative alone without its final full stop', () => {
    const failures: string[] = [];
    for (const exercise of allExercises()) {
      for (const step of exercise.steps) {
        if (!step.answer.trapAnswers?.length) continue;
        for (const answer of [...step.answer.accepted, ...(step.answer.alternatives ?? [])]) {
          const bare = answer.replace(/[.!?]+$/, '');
          const result = validateAnswer(bare, step.answer, opts);
          if (result.trapFeedback) failures.push(`${step.id}: "${bare}" hit a trap`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
