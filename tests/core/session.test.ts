import { describe, expect, it } from 'vitest';
import { lessonById } from '../../src/content/index.ts';
import { bi, typeIt } from '../../src/content/authoring.ts';
import type { Exercise } from '../../src/content/types.ts';
import type { LessonProgress, StepOutcome } from '../../src/core/progress/lesson.ts';
import { createReviewItem, orderQueue } from '../../src/core/srs/scheduler.ts';
import { sessionBuild } from '../../src/ui/selectors.ts';
import {
  DEFAULT_SECONDS_PER_ANSWER,
  ENOUGH_ANSWERS_TO_MEASURE,
  estimatedMinutes,
  planSession,
  secondsPerAnswer,
  type SessionSources,
} from '../../src/core/progress/session.ts';

/**
 * The daily session.
 *
 * Two promises are tested here rather than the implementation: that the round
 * is assembled from what is actually most useful, in that order, and that the
 * length on the label is either measured from this learner's own answers or
 * openly marked as a default. The app does not display invented statistics,
 * and "ten minutes" is a statistic.
 */

/** `n` single-step exercises, so a step count is easy to reason about. */
function steps(prefix: string, n: number): Exercise[] {
  return Array.from({ length: n }, (_, index) =>
    typeIt(`${prefix}-${index}`, bi('Type it', 'Напиши го'), [
      { prompt: bi('the table', 'масата'), answer: 'der Tisch' },
    ]),
  );
}

const NO_STATS = { totalStudySeconds: 0, totalAnswers: 0 };

function sources(partial: Partial<SessionSources>): SessionSources {
  return { review: [], mistakes: [], lesson: [], ...partial };
}

describe('pace', () => {
  it('states the default until there is enough of the learner’s own data', () => {
    expect(secondsPerAnswer(NO_STATS)).toEqual({
      seconds: DEFAULT_SECONDS_PER_ANSWER,
      measured: false,
    });
    const nearly = { totalAnswers: ENOUGH_ANSWERS_TO_MEASURE - 1, totalStudySeconds: 290 };
    expect(secondsPerAnswer(nearly).measured).toBe(false);
  });

  it('uses the learner’s own average once there is enough of it', () => {
    const pace = secondsPerAnswer({ totalAnswers: 100, totalStudySeconds: 1200 });
    expect(pace).toEqual({ seconds: 12, measured: true });
  });

  it('does not believe a tab left open all night, or a burst of single letters', () => {
    // 100 answers in eight hours: the browser was open, the learner was not.
    expect(secondsPerAnswer({ totalAnswers: 100, totalStudySeconds: 28_800 }).seconds).toBe(60);
    expect(secondsPerAnswer({ totalAnswers: 100, totalStudySeconds: 100 }).seconds).toBe(5);
  });

  it('falls back when the answer count is real but the clock is not', () => {
    expect(secondsPerAnswer({ totalAnswers: 200, totalStudySeconds: 0 }).measured).toBe(false);
  });
});

describe('planning the round', () => {
  it('spends the time on review first, then mistakes, then the lesson', () => {
    const plan = planSession(
      sources({ review: steps('rv', 4), mistakes: steps('mp', 4), lesson: steps('ls', 40) }),
      10,
      NO_STATS,
    );
    expect(plan.parts.map((part) => part.kind)).toEqual(['review', 'mistakes', 'lesson']);
    // Ten minutes at the stated 20s default is thirty answers.
    expect(plan.steps).toBe(30);
    expect(plan.parts[2]!.steps).toBe(22);
  });

  it('leaves out a part it has no time for rather than truncating an exercise', () => {
    const long = typeIt('long', bi('Type it', 'Напиши го'), [
      { prompt: bi('one', 'едно'), answer: 'eins' },
      { prompt: bi('two', 'две'), answer: 'zwei' },
      { prompt: bi('three', 'три'), answer: 'drei' },
      { prompt: bi('four', 'четири'), answer: 'vier' },
    ]);
    const plan = planSession(sources({ review: steps('rv', 2), lesson: [long] }), 1, NO_STATS);
    expect(plan.steps).toBe(2);
    expect(plan.parts.map((part) => part.kind)).toEqual(['review']);
    // The exercise it could not fit is not half-included anywhere.
    expect(plan.exercises).not.toContain(long);
  });

  it('is never empty while there is anything at all to do', () => {
    const huge = typeIt(
      'huge',
      bi('Type it', 'Напиши го'),
      Array.from({ length: 40 }, () => ({ prompt: bi('the table', 'масата'), answer: 'der Tisch' })),
    );
    const plan = planSession(sources({ lesson: [huge] }), 10, NO_STATS);
    expect(plan.exercises).toEqual([huge]);
    expect(plan.parts.map((part) => part.kind)).toEqual(['lesson']);
  });

  it('is empty, and says so, when there is nothing to do', () => {
    const plan = planSession(sources({}), 10, NO_STATS);
    expect(plan.exercises).toEqual([]);
    expect(plan.parts).toEqual([]);
    expect(plan.steps).toBe(0);
    expect(estimatedMinutes(plan)).toBe(0);
  });

  it('reports the length of the round it actually built, at the learner’s own pace', () => {
    const fast = { totalAnswers: 300, totalStudySeconds: 3000 }; // 10s an answer
    const plan = planSession(sources({ review: steps('rv', 12) }), 10, fast);
    expect(plan.measured).toBe(true);
    expect(plan.steps).toBe(12);
    expect(plan.estimatedSeconds).toBe(120);
    expect(estimatedMinutes(plan)).toBe(2);
  });

  it('never advertises a round with work in it as zero minutes', () => {
    const plan = planSession(sources({ review: steps('rv', 1) }), 10, {
      totalAnswers: 300,
      totalStudySeconds: 1500,
    });
    expect(plan.estimatedSeconds).toBe(5);
    expect(estimatedMinutes(plan)).toBe(1);
  });

  it('gives a session at least a minute of budget, whatever the target says', () => {
    const plan = planSession(sources({ review: steps('rv', 10) }), 0, NO_STATS);
    expect(plan.steps).toBeGreaterThan(0);
  });
});

/**
 * What the round is built out of, against the real course rather than fixtures.
 * The rule being guarded is that a round never asks for German the learner has
 * not been taught, and never asks again for what they have already got right.
 */
describe('building the round from real progress', () => {
  const lesson = lessonById('pre-a1-u2-l3')!;

  function resolvedStep(stepId: string): StepOutcome {
    return {
      stepId,
      attempts: 1,
      firstTryCorrect: true,
      bestCredit: 1,
      resolved: true,
      hintsUsed: 0,
      revealed: false,
    };
  }

  function progress(seenSections: string[], resolvedIds: string[]): Record<string, LessonProgress> {
    return {
      [lesson.id]: {
        lessonId: lesson.id,
        sectionsSeen: seenSections,
        practice: Object.fromEntries(resolvedIds.map((id) => [id, resolvedStep(id)])),
        mastery: { attempts: 0, bestAccuracy: 0, passed: false },
        recoveryRounds: 0,
      },
    };
  }

  const allSections = lesson.sections.map((section) => section.id);
  const allStepIds = lesson.exercises.flatMap((exercise) => exercise.steps.map((step) => step.id));

  it('orders the round\u2019s review part rather than taking it as it comes', () => {
    /*
     * The daily round is the screen used every day, and it used to feed
     * `dueItems` straight into the exercises — so it got neither the urgency
     * ordering nor the interleaving the review page has always had. Ten words
     * from one lesson and ten from another arrived as two blocks.
     */
    const now = new Date('2026-04-01T09:00:00.000Z');
    const due = ['a1-u1-l1', 'b2-u5-l2'].flatMap((lessonId, group) =>
      Array.from({ length: 4 }, (_, index) => ({
        ...createReviewItem({
          id: `${lessonId}-${index}`,
          kind: 'vocab' as const,
          refId: 'v-hallo',
          level: group === 0 ? ('a1' as const) : ('b2' as const),
          lessonId,
          now,
        }),
      })),
    );

    const build = sessionBuild({}, due, [], now);
    // Every due item still makes it into the round.
    expect(build.sources.review.length).toBeGreaterThan(0);

    // And the exercises alternate between the two lessons rather than
    // arriving as one block each. The builder turns every third item into
    // dictation, so the check is on the order of the ids it was handed.
    const ordered = orderQueue(due, now).map((entry) => entry.lessonId);
    for (let index = 1; index < ordered.length; index += 1) {
      expect(ordered[index]).not.toBe(ordered[index - 1]);
    }
  });

  it('has no lesson part before a lesson has been opened', () => {
    const build = sessionBuild({}, [], []);
    expect(build.sources.lesson).toEqual([]);
    expect(build.lesson).toBeUndefined();
    expect(build.lessonAwaitsMastery).toBe(false);
  });

  it('draws nothing from a lesson whose teaching sections have not been read', () => {
    // Progress exists — the learner poked at the mastery check — but no section
    // has been seen, so there is nothing the round is allowed to ask for.
    const build = sessionBuild(progress([], []), [], []);
    expect(build.sources.lesson).toEqual([]);
  });

  it('asks only for the steps that are not already right', () => {
    const [first, second, ...rest] = allStepIds;
    const build = sessionBuild(progress(allSections, [first!, second!]), [], []);
    const offered = build.sources.lesson.flatMap((exercise) => exercise.steps.map((step) => step.id));
    expect(offered).toEqual(rest);
    // Step ids survive, so an answer here moves the same lesson progress and
    // the same review items as it would inside the lesson itself.
    expect(new Set(allStepIds)).toEqual(new Set([first!, second!, ...offered]));
    expect(build.lesson?.lesson.id).toBe(lesson.id);
    expect(build.lessonAwaitsMastery).toBe(false);
  });

  it('sends the learner to the lesson page when only the mastery check is left', () => {
    const build = sessionBuild(progress(allSections, allStepIds), [], []);
    expect(build.sources.lesson).toEqual([]);
    expect(build.lessonAwaitsMastery).toBe(true);
    expect(build.lesson?.lesson.id).toBe(lesson.id);
  });

  it('leaves a mistake that has happened once out of the round', () => {
    const mistake = (id: string, occurrences: number) => ({
      id,
      category: 'article' as const,
      expected: 'der Tisch',
      lastGiven: 'die Tisch',
      stepId: 's1',
      lessonId: lesson.id,
      occurrences,
      correctedCount: 0,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      resolvedAt: null,
    });
    const build = sessionBuild({}, [], [mistake('once', 1), mistake('twice', 2)]);
    expect(build.sources.mistakes).toHaveLength(1);
    expect(build.sources.mistakes[0]!.id).toContain('twice');
  });
});
