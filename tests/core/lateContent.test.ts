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

describe('A2 accepts what it teaches', () => {
  /*
   * The future lesson teaches "Ich werde Deutsch lernen" and then marked
   * "Morgen werde ich Deutsch lernen." as a vocabulary mistake, in the final
   * check and the unit checkpoint too. The same "I think that …" needed
   * glaube in one step and denke in the next, each rejecting the other,
   * although the lesson teaches both. And "Du solltest viel Tee trinken.",
   * the ordinary way to give advice, was wrong everywhere, the level
   * checkpoint included.
   */
  it('takes the werden future, either verb of thinking, and solltest', () => {
    expect(
      rejected({
        'a2u3l3-ex1-s1': ['Morgen werde ich Deutsch lernen.', 'Ich werde morgen Deutsch lernen.'],
        'a2u3l3-m1-s1': ['Morgen werde ich Deutsch lernen.'],
        'cp-a2u3-3-s3': ['Morgen werde ich Deutsch lernen.'],
        'a2u3l1-ex2-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'a2u3l1-ex2-s2': ['Ich glaube, dass das gut ist.'],
        'a2u3l1-m1-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'cp-a2u3-1-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'a2-lcp-2-s2': ['Ich denke, dass Deutsch schwer ist.'],
        'a2u4l2-ex2-s1': ['Du solltest viel Tee trinken.'],
        'a2u4l2-m1-s1': ['Du solltest viel Tee trinken.'],
        'cp-a2u4-2-s1': ['Du solltest viel Tee trinken.'],
        'a2-lcp-4-s3': ['Du solltest viel Tee trinken.'],
        'a2u4l3-ex2-s3': ['Sie sollten sich ausruhen.'],
      }),
    ).toEqual([]);
  });
});

describe('the same prompt, the same answers', () => {
  /*
   * A lesson, its final check, the unit checkpoint and the level checkpoint
   * often ask the very same question. When one of them accepts a sentence
   * and another rejects it, the learner is marked wrong for what the course
   * taught them a page earlier. Typed steps with the same English prompt must
   * accept each other's answers. (The placement check is left out: it
   * measures rather than teaches, so it is deliberately the more generous.)
   */
  it('holds across A2, B1 and B2', () => {
    const byPrompt = new Map<string, ExerciseStep[]>();
    const typed = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
    ].filter(
      (exercise) =>
        ['a2', 'b1', 'b2'].includes(exercise.level) &&
        !['multipleChoice', 'listenChoose', 'dictation', 'freeWriting', 'wordOrder', 'sentenceBuild'].includes(exercise.kind),
    );
    for (const exercise of typed) {
      for (const entry of exercise.steps) {
        if (!entry.prompt || entry.scaffold || entry.wordBank) continue;
        const key = entry.prompt.en.toLowerCase().replace(/[^a-z ]/g, '').trim();
        byPrompt.set(key, [...(byPrompt.get(key) ?? []), entry]);
      }
    }
    const out: string[] = [];
    for (const group of byPrompt.values()) {
      for (const a of group) {
        for (const b of group) {
          if (a === b) continue;
          for (const answer of [...b.answer.accepted, ...(b.answer.alternatives ?? [])]) {
            if (!isRight(answer, a.id)) out.push(`${a.id} rejects "${answer}" (right in ${b.id})`);
          }
        }
      }
    }
    expect([...new Set(out)]).toEqual([]);
  });
});

describe('the Bulgarian prompt asks for the register the answer is in', () => {
  /*
   * Six B1 steps, one of them in a unit checkpoint, said "ти" in Bulgarian
   * ("За специалиста ти трябва направление.") while only the Sie form was
   * accepted, so a Bulgarian-path learner who translated faithfully wrote du
   * and was marked wrong. English "you" is neutral; Bulgarian is not.
   */
  it('never says ти where only Sie is accepted', () => {
    const informal = /(?<!\p{L})(ти|твой|твоя|твое|твоите|имаш|можеш|искаш|знаеш)(?!\p{L})/iu;
    const formal = /(^|[^.!?]\s)(Sie|Ihnen|Ihr\w*)\b|^(Können|Könnten|Würden|Haben|Sind|Möchten|Brauchen)\s+Sie\b/;
    const du = /\b(du|dich|dir|dein\w*)\b/i;
    const out: string[] = [];
    const exercises = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ].filter((exercise) => ['a2', 'b1', 'b2'].includes(exercise.level) && exercise.kind !== 'freeWriting');
    for (const exercise of exercises) {
      for (const entry of exercise.steps) {
        if (!entry.prompt?.bg) continue;
        const answers = [...entry.answer.accepted, ...(entry.answer.alternatives ?? [])];
        const onlySie = answers.some((answer) => formal.test(answer)) && !answers.some((answer) => du.test(answer));
        if (onlySie && informal.test(entry.prompt.bg)) out.push(`${entry.id}: ${entry.prompt.bg}`);
      }
    }
    expect(out).toEqual([]);
  });
});
