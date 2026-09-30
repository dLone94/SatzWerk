import { describe, expect, it } from 'vitest';
import { PASS_SHARE, placementResult, type PlacementAnswer } from '../../src/core/progress/placement.ts';
import type { CefrLevel } from '../../src/content/types.ts';
import {
  LEXICON,
  PLACEMENT_CHECKPOINT,
  allCheckpoints,
  availableLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

const LEVELS: CefrLevel[] = ['pre-a1', 'a1', 'a2', 'b1', 'b2'];

/** n answers at one level, `right` of them correct. */
function band(level: CefrLevel, asked: number, right: number): PlacementAnswer[] {
  return Array.from({ length: asked }, (_, index) => ({
    stepId: `${level}-${index}`,
    level,
    correct: index < right,
  }));
}

describe('placement scoring', () => {
  it('starts a complete beginner at the bottom', () => {
    const answers = LEVELS.flatMap((level) => band(level, 4, 0));
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('pre-a1');
    expect(result.highestPassed).toBeNull();
    expect(result.toppedOut).toBe(false);
  });

  it('starts at the first level that was not passed', () => {
    const answers = [
      ...band('pre-a1', 4, 4),
      ...band('a1', 4, 4),
      ...band('a2', 4, 1),
      ...band('b1', 4, 0),
      ...band('b2', 4, 0),
    ];
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('a2');
    expect(result.highestPassed).toBe('a1');
  });

  it('recommends the first gap rather than the level above the best band', () => {
    /*
     * Somebody who picked German up by ear: fluent-ish sentences at B1, no
     * article table at A2. Sending them to B2 on the strength of the good band
     * would skip the thing they came for.
     */
    const answers = [
      ...band('pre-a1', 4, 4),
      ...band('a1', 4, 4),
      ...band('a2', 4, 1),
      ...band('b1', 4, 4),
      ...band('b2', 4, 0),
    ];
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('a2');
    expect(result.highestPassed).toBe('b1');
  });

  it('tops out when every band passes, and points at the last level', () => {
    const answers = LEVELS.flatMap((level) => band(level, 4, 4));
    const result = placementResult(answers, LEVELS);
    expect(result.toppedOut).toBe(true);
    expect(result.startAt).toBe('b2');
    expect(result.highestPassed).toBe('b2');
  });

  it('passes a band at exactly the threshold and fails it just below', () => {
    expect(placementResult(band('a1', 3, 2), ['a1']).bands[0]!.passed).toBe(true);
    expect(placementResult(band('a1', 3, 1), ['a1']).bands[0]!.passed).toBe(false);
    expect(placementResult(band('a1', 4, 3), ['a1']).bands[0]!.passed).toBe(true);
    expect(placementResult(band('a1', 4, 2), ['a1']).bands[0]!.passed).toBe(false);
    expect(PASS_SHARE).toBeGreaterThan(0.5);
  });

  it('never counts a level it did not ask about as passed', () => {
    // Only A1 was asked. B1 must not be treated as known just because nothing
    // contradicted it.
    const result = placementResult(band('a1', 4, 4), LEVELS);
    expect(result.bands.find((entry) => entry.level === 'b1')).toMatchObject({
      asked: 0,
      right: 0,
      passed: false,
    });
    // Asked only about A1 and passed it: the honest next step is the level
    // above the highest one it actually tested, and it must not claim to have
    // topped out when it never asked a B2 question.
    expect(result.startAt).toBe('a2');
    expect(result.toppedOut).toBe(false);
  });

  it('reports the bands in course order whatever order the answers arrive in', () => {
    const shuffled = [...band('b1', 2, 2), ...band('pre-a1', 2, 2), ...band('a2', 2, 0)];
    const result = placementResult(shuffled, ['b1', 'pre-a1', 'a2']);
    expect(result.bands.map((entry) => entry.level)).toEqual(['pre-a1', 'a2', 'b1']);
  });

  it('counts the totals it was given', () => {
    const result = placementResult([...band('a1', 4, 3), ...band('a2', 4, 1)], LEVELS);
    expect(result.asked).toBe(8);
    expect(result.right).toBe(4);
  });

  it('falls back to the bottom when it was asked nothing at all', () => {
    const result = placementResult([], LEVELS);
    expect(result.startAt).toBe('pre-a1');
    expect(result.toppedOut).toBe(false);
    expect(result.highestPassed).toBeNull();
  });
});

/*
 * The questions themselves.
 *
 * The placement check used to have one answer per question and needs three
 * of four right per level, so a learner who wrote correct German in another
 * ordinary way was placed a level too low. Twenty correct answers came out as
 * "Start at B1": "Ich lebe in Hamburg." was a vocabulary mistake, "Weil ich
 * krank bin, bleibe ich zu Hause." a word-order mistake, "Ich hätte gerne
 * einen Termin." a spelling slip, and for "Er sagt, dass er keine Zeit habe."
 * the feedback said German does not need "dass" here.
 */
describe('the placement questions', () => {
  const opts = { lexicon: LEXICON };
  const steps = PLACEMENT_CHECKPOINT.exercises.flatMap((exercise) =>
    exercise.steps.map((step) => ({ level: exercise.level, step })),
  );
  const stepById = (id: string) => steps.find((entry) => entry.step.id === id)!.step;

  /** The same rule the exercise player uses to count a first try as right. */
  function isRight(given: string, id: string): boolean {
    const result = validateAnswer(given, stepById(id).answer, opts);
    return (
      result.verdict === 'correct' ||
      result.verdict === 'accepted-variant' ||
      (result.verdict === 'accepted-with-note' && !result.requireRetype)
    );
  }

  const CORRECT_GERMAN: Record<string, string[]> = {
    'pl-pre-a1-4': ['Ich lebe in Hamburg.'],
    'pl-a1-1': ['Heute arbeite ich zuhause.'],
    'pl-a2-1': ['Gestern kaufte ich Brot.', 'Ich kaufte gestern Brot.'],
    'pl-a2-2': ['Weil ich krank bin, bleibe ich zu Hause.', 'Ich bleibe zuhause, weil ich krank bin.'],
    'pl-b1-1': [
      'Ich hätte gerne einen Termin.',
      'Ich würde gerne einen Termin vereinbaren.',
      'Ich möchte einen Termin machen.',
    ],
    'pl-b1-2': [
      'Ich glaube, dass die Miete zu hoch ist.',
      'Ich meine, dass die Miete zu hoch ist.',
      'Ich finde, die Miete ist zu hoch.',
    ],
    'pl-b1-3': [
      'Ich komme mit, wenn ich Zeit habe.',
      'Wenn ich Zeit habe, werde ich mitkommen.',
      'Falls ich Zeit habe, komme ich mit.',
    ],
    'pl-b1-4': ['Könnten Sie das bitte noch einmal wiederholen?'],
    'pl-b2-1': ['Gestern wurde der Bericht eingereicht.', 'Der Bericht ist gestern eingereicht worden.'],
    'pl-b2-2': ['Er sagt, dass er keine Zeit habe.'],
  };

  it('accepts ordinary correct German, not only the one sentence it had in mind', () => {
    for (const [id, answers] of Object.entries(CORRECT_GERMAN)) {
      for (const answer of answers) expect(isRight(answer, id), `${id}: ${answer}`).toBe(true);
    }
  });

  it('accepts every sentence a lesson accepts for the same German', () => {
    // Where a lesson teaches the very sentence a placement question asks for,
    // the placement check must not be stricter than the lesson was.
    const lessonSteps = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ].flatMap((exercise) => exercise.steps);
    let compared = 0;
    for (const { step } of steps) {
      const target = step.answer.accepted[0]!;
      for (const lesson of lessonSteps.filter((entry) => entry.answer.accepted.includes(target))) {
        for (const answer of [...lesson.answer.accepted, ...(lesson.answer.alternatives ?? [])]) {
          compared += 1;
          expect(isRight(answer, step.id), `${step.id} rejects ${answer} (accepted by ${lesson.id})`).toBe(true);
        }
      }
    }
    expect(compared).toBeGreaterThan(0);
  });

  it('places somebody who answers everything with the taught sentences at the top', () => {
    const answers: PlacementAnswer[] = steps.map(({ level, step }) => ({
      stepId: step.id,
      level,
      correct: isRight(step.answer.accepted[0]!, step.id),
    }));
    const result = placementResult(answers, LEVELS);
    expect(result.toppedOut).toBe(true);
    expect(result.startAt).toBe('b2');
  });

  it('marks the register where only one form of address is right', () => {
    // "Could you repeat that?" is as informal as it is formal in English; only
    // the Sie form is accepted, so the prompt has to say so, as pl-a1-3 does.
    const step = stepById('pl-b1-4');
    expect(step.prompt!.en).toContain('(formal)');
    expect(step.prompt!.bg).toContain('(официално)');
  });
});
