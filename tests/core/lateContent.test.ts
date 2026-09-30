import { describe, expect, it } from 'vitest';
import {
  LEXICON,
  SCENARIO_SCRIPTS,
  allCheckpoints,
  availableLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import type { ExerciseStep } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * A2, B1 and B2 content that used to grade correct German as a mistake.
 *
 * Each block below names what went wrong. The answers are typed into the real
 * validator, and "right" means what the exercise player counts as a first
 * try right: correct, an accepted variant, or a note that asks for no retype.
 */

const opts = { lexicon: LEXICON };

const STEPS = new Map<string, ExerciseStep>();
for (const exercise of [
  ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
  ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
  ...SCENARIO_SCRIPTS.flatMap((script) =>
    script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : [])),
  ),
]) {
  for (const step of exercise.steps) STEPS.set(step.id, step);
}

function step(id: string): ExerciseStep {
  const found = STEPS.get(id);
  if (!found) throw new Error(`no step ${id}`);
  return found;
}

function isRight(given: string, id: string): boolean {
  const result = validateAnswer(given, step(id).answer, opts);
  return (
    result.verdict === 'correct' ||
    result.verdict === 'accepted-variant' ||
    (result.verdict === 'accepted-with-note' && !result.requireRetype)
  );
}

/** Every [step, answer] pair that is not right, for one readable failure. */
function rejected(cases: Record<string, string[]>): string[] {
  const out: string[] = [];
  for (const [id, answers] of Object.entries(cases)) {
    for (const answer of answers) if (!isRight(answer, id)) out.push(`${id}: ${answer}`);
  }
  return out;
}

describe('traps that call correct German correct', () => {
  /*
   * A2 Unit 1 Lesson 2 teaches "Ich bin in Berlin gewesen" as the model for
   * the sein verbs; the next lesson gave the same sentence no credit as a
   * verb-tense mistake and said "Not wrong, but nobody says it". B1 marked
   * "Ich hoffe, dass ich bald einen Termin bekomme." as a word-order mistake
   * while its own feedback said "Grammatically correct", and the final check
   * rejected it too. "Pfand zurückbekommen" is ordinary German and was an
   * extra word.
   */
  it('credits them, and still shows the form being taught', () => {
    expect(
      rejected({
        'a2u1l3-ex2-s1': [
          'Letztes Wochenende bin ich in Berlin gewesen.',
          'Ich bin letztes Wochenende in Berlin gewesen.',
        ],
        'b1u2l2-ex2-s1': ['Ich hoffe, dass ich bald einen Termin bekomme.'],
        'b1u2l2-m1-s1': ['Ich hoffe, dass ich bald einen Termin bekomme.'],
        'sc-supermarket-a2-t2-s1': [
          'Bekomme ich für diese Flaschen Pfand zurück?',
          'Bekomme ich für diese Flaschen das Pfand zurück?',
        ],
      }),
    ).toEqual([]);
    const result = validateAnswer('Ich bin letztes Wochenende in Berlin gewesen.', step('a2u1l3-ex2-s1').answer, opts);
    expect(result.target).toBe('Letztes Wochenende war ich in Berlin.');
  });

  it('keeps a trap that admits the German is correct only where it means something else here', () => {
    // Each of these was read on purpose: the sentence is real German, but for
    // another meaning (ist ausgefüllt), another register (von + dative in a
    // written application) or another move (naming a culprit).
    const reviewed = new Set(['b1u2l1-ex3-s1', 'b1u4l1-ex2-s1', 'sc-bakery-b1-t1-s1']);
    const admitting = /not wrong|grammatically correct|correct german/i;
    const found: string[] = [];
    for (const [id, entry] of STEPS) {
      for (const trap of entry.answer.trapAnswers ?? []) {
        if (admitting.test(trap.feedback.en) && !reviewed.has(id)) found.push(`${id}: ${trap.answer}`);
      }
    }
    expect(found).toEqual([]);
  });
});
