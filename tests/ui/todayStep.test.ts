import { describe, expect, it } from 'vitest';
import { VOCABULARY, allCheckpoints, allUnits, availableLessons, lessonsInOrder } from '../../src/content/index.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import type { DailyRun } from '../../src/core/progress/daily.ts';
import type { LessonProgress, StepOutcome } from '../../src/core/progress/lesson.ts';
import { createReviewItem, type ReviewItem } from '../../src/core/srs/scheduler.ts';
import type { CheckpointResult } from '../../src/services/api/client.ts';
import { CATCH_UP_SIZE, REVIEW_BACKLOG, catchUpExercises, todayStep, type TodayInput } from '../../src/ui/selectors.ts';

/**
 * The one thing Today puts first. It used to be four starts of equal weight —
 * daily practice, the lesson, the round and early review — and a daily card
 * that said "Start today" whatever had been done. Each case here is a real
 * state a learner reaches, and the one step it should lead to.
 */

const now = new Date('2026-11-03T10:00:00');
const today = todayHere(now);
const yesterday = todayHere(new Date('2026-11-02T10:00:00'));

function outcome(stepId: string): StepOutcome {
  return { stepId, attempts: 1, firstTryCorrect: true, bestCredit: 1, resolved: true, hintsUsed: 0, revealed: false };
}

function completed(lessonId: string): LessonProgress {
  const lesson = lessonsInOrder().find((candidate) => candidate.id === lessonId)!;
  return {
    lessonId,
    sectionsSeen: lesson.sections.map((section) => section.id),
    practice: Object.fromEntries(
      lesson.exercises.flatMap((exercise) => exercise.steps.map((step) => [step.id, outcome(step.id)])),
    ),
    mastery: { attempts: 1, bestAccuracy: 1, passed: true },
    recoveryRounds: 0,
    completedAt: '2026-01-01T00:00:00.000Z',
  };
}

function opened(lessonId: string): LessonProgress {
  const lesson = lessonsInOrder().find((candidate) => candidate.id === lessonId)!;
  return { lessonId, sectionsSeen: [lesson.sections[0]!.id], practice: {}, mastery: { attempts: 0, bestAccuracy: 0, passed: false }, recoveryRounds: 0 };
}

function run(stage: number, day = today): DailyRun {
  return { id: `run-${day}-${stage}`, day, scriptId: 'sc-bakery-pre-a1', goal: 'everyday', stage, total: 4, firstTryCorrect: 3,
    listeningCompleted: stage === 5, updatedAt: `${day}T09:00:00.000Z` };
}

function due(count: number): ReviewItem[] {
  return Array.from({ length: count }, (_, index) =>
    createReviewItem({ id: `r${index}`, kind: 'vocab', refId: `v-${index}`, level: 'pre-a1', now: new Date('2026-11-01T09:00:00') }));
}

function state(extra: Partial<TodayInput> = {}): TodayInput {
  return { lessons: {}, reviewItems: [], mistakes: [], onboarded: true, checkpointResults: [], dailyRuns: [],
    minutesToday: 0, targetMinutes: 20, now, ...extra };
}

const first = lessonsInOrder().find((lesson) => availableLessons().includes(lesson))!;

describe('the one step Today puts first', () => {
  it('asks a first-run learner the one setup question before anything else', () => {
    expect(todayStep(state({ onboarded: false }))).toMatchObject({ kind: 'onboard', to: '/welcome' });
  });

  it('leads a total beginner straight into German: today\'s practice, then lesson 1', () => {
    const step = todayStep(state());
    expect(step).toMatchObject({ kind: 'daily', to: '/daily', practice: 'todo', then: 'course' });
    expect(step.course).toMatchObject({ kind: 'start-lesson', to: `/lesson/${first.id}` });
  });

  it('continues a practice begun today before anything else, and says how far it got', () => {
    const open = run(2);
    const step = todayStep(state({ dailyRuns: [open], lessons: { [first.id]: opened(first.id) } }));
    expect(step).toMatchObject({ kind: 'continue-daily', to: '/daily', practice: 'open', run: open });
  });

  it('does not continue yesterday\'s unfinished practice as today\'s', () => {
    expect(todayStep(state({ dailyRuns: [run(3, yesterday)] }))).toMatchObject({ kind: 'daily', practice: 'todo' });
  });

  it('starts a new practice, as the practice page does, when the one begun no longer fits the plan', () => {
    // A goal chosen since the practice began: the practice page leads with the
    // new plan, so Today must not say "Continue your practice".
    const open = run(2);
    const step = todayStep(state({ dailyRuns: [open], fitsPlan: () => false }));
    expect(step).toMatchObject({ kind: 'daily', practice: 'todo' });
    expect(step.run).toBeUndefined();
    expect(todayStep(state({ dailyRuns: [open], fitsPlan: (candidate) => candidate.id === open.id })).kind).toBe('continue-daily');
    // Nor one whose conversation is no longer in the course.
    expect(todayStep(state({ dailyRuns: [{ ...open, scriptId: 'sc-gone' }] })).kind).toBe('daily');
  });

  it('finishes a lesson already started, with today\'s practice offered after it', () => {
    const step = todayStep(state({ lessons: { [first.id]: opened(first.id) } }));
    expect(step).toMatchObject({ kind: 'continue-lesson', to: `/lesson/${first.id}`, then: 'daily' });
  });

  it('offers the checkpoint a learner has just earned at the end of a unit', () => {
    const unit = allUnits().find((candidate) => candidate.checkpoint?.status === 'available')!;
    const lessons = Object.fromEntries(unit.lessons.map((lesson) => [lesson.id, completed(lesson.id)]));
    expect(todayStep(state({ lessons }))).toMatchObject({ kind: 'checkpoint', to: `/checkpoint/${unit.checkpoint!.id}` });
  });

  it('clears a review backlog before new material, but not a handful the practice reviews itself', () => {
    expect(todayStep(state({ reviewItems: due(REVIEW_BACKLOG) }))).toMatchObject({ kind: 'review', to: '/review', due: REVIEW_BACKLOG, then: 'daily' });
    expect(todayStep(state({ reviewItems: due(REVIEW_BACKLOG - 1) })).kind).toBe('daily');
  });

  it('goes on to the course once today\'s practice is done', () => {
    const step = todayStep(state({ dailyRuns: [run(5)] }));
    expect(step).toMatchObject({ kind: 'start-lesson', to: `/lesson/${first.id}`, practice: 'done' });
    // Nothing to send the learner back to: the practice is done.
    expect(step.then).toBeUndefined();
  });

  describe('once the daily goal is met', () => {
    it('is done for today, with today\'s practice as an optional way to keep going', () => {
      const step = todayStep(state({ minutesToday: 20, lessons: { [first.id]: opened(first.id) } }));
      expect(step).toMatchObject({ kind: 'done', goalMet: true, then: 'daily' });
    });

    it('offers the course to keep going once the practice is done too', () => {
      const step = todayStep(state({ minutesToday: 25, dailyRuns: [run(5)] }));
      expect(step).toMatchObject({ kind: 'done', then: 'course' });
      expect(step.course.kind).toBe('start-lesson');
    });

    it('is not pushed aside by a backlog or a lesson in progress', () => {
      const step = todayStep(state({ minutesToday: 30, reviewItems: due(40), lessons: { [first.id]: opened(first.id) } }));
      expect(step.kind).toBe('done');
    });
  });

  it('is done for today when the practice is finished and the course has nothing waiting', () => {
    const everything = Object.fromEntries(availableLessons().map((lesson) => [lesson.id, completed(lesson.id)]));
    const passed = allCheckpoints().map((checkpoint): CheckpointResult => ({
      checkpointId: checkpoint.id, accuracy: 1, passed: true, createdAt: '2026-01-01T00:00:00.000Z',
    }));
    const step = todayStep(state({ lessons: everything, checkpointResults: passed, dailyRuns: [run(5)] }));
    expect(step).toMatchObject({ kind: 'done', goalMet: false, practice: 'done' });
    expect(step.then).toBeUndefined();
    // Before the practice, the practice is the day's one step.
    expect(todayStep(state({ lessons: everything, checkpointResults: passed })).kind).toBe('daily');
  });
});

/*
 * Coming back after a break. A learner five days away met the same Today as
 * on any other day: the lesson left six days ago first, thirty-seven reviews
 * below the fold, and the run of days they had built simply gone. Now the
 * first thing is a short warm-up of the items most at risk, and then the day
 * goes on as usual: the rest of the backlog waits for the days after, and new
 * material is not held back behind it.
 */
describe('coming back after a break', () => {
  const DAY = 86_400_000;
  const ago = (days: number) => todayHere(new Date(now.getTime() - days * DAY));
  /** Days of study, each `days` ago: a dozen answers today, thirty on the others. */
  const studied = (...days: number[]) => days.map((back) => ({ day: ago(back), answers: back === 0 ? 12 : 30 }));
  /** Words that are due and can be asked: the warm-up is made of these. */
  const waiting = (count: number): ReviewItem[] =>
    VOCABULARY.slice(0, count).map((entry) =>
      createReviewItem({ id: `vocab:${entry.id}`, kind: 'vocab', refId: entry.id, level: entry.level, now: new Date('2026-11-01T09:00:00') }));

  it('opens on a warm-up after three days or more away, says how long, and how long the run before was', () => {
    const step = todayStep(state({ studyDays: studied(5, 6, 7, 8), reviewItems: waiting(37), lessons: { [first.id]: opened(first.id) } }));
    expect(step).toMatchObject({ kind: 'welcome-back', to: '/review?catch-up', due: 37, welcome: { days: 5, run: 4, warmUp: CATCH_UP_SIZE } });
    // Then the lesson left part-done, by name, not the review pile.
    expect(step.then).toBe('course');
    expect(step.course).toMatchObject({ kind: 'continue-lesson', to: `/lesson/${first.id}` });
    expect(todayStep(state({ studyDays: studied(3), reviewItems: waiting(4) }))).toMatchObject({ kind: 'welcome-back', welcome: { days: 3, run: 1 } });
  });

  it('warms up with everything when little is waiting, and hands over to today\'s practice when no lesson is open', () => {
    const step = todayStep(state({ studyDays: studied(6), reviewItems: waiting(3) }));
    expect(step).toMatchObject({ kind: 'welcome-back', welcome: { warmUp: 3 }, then: 'daily' });
  });

  it('is an ordinary day after one or two days off', () => {
    expect(todayStep(state({ studyDays: studied(2, 3), reviewItems: waiting(37) })).kind).toBe('review');
    expect(todayStep(state({ studyDays: studied(2), lessons: { [first.id]: opened(first.id) }, reviewItems: waiting(37) })).kind)
      .toBe('continue-lesson');
  });

  it('does not welcome back a learner who has not studied before, or one with nothing to refresh', () => {
    expect(todayStep(state({ reviewItems: waiting(12) })).kind).toBe('review');
    expect(todayStep(state({ studyDays: studied(9) })).kind).toBe('daily');
    // Nothing due that can be asked: no warm-up to offer, so the day as usual.
    expect(todayStep(state({ studyDays: studied(9), reviewItems: due(12) })).kind).toBe('review');
    // A day with minutes on the clock and no answers is not a study day.
    expect(todayStep(state({ studyDays: [{ day: ago(1), answers: 0 }, ...studied(6)], reviewItems: waiting(12) })).kind)
      .toBe('welcome-back');
  });

  it('lets the rest of the backlog wait once the warm-up is done: today\'s practice, then new material', () => {
    // Answered today after five days away, twenty-five still due, nothing part-done.
    const after = state({ studyDays: studied(0, 5, 6), reviewItems: waiting(25) });
    const step = todayStep(after);
    expect(step).toMatchObject({ kind: 'daily', due: 25, then: 'course' });
    expect(step.welcome).toBeUndefined();
    expect(step.course).toMatchObject({ kind: 'start-lesson', to: `/lesson/${first.id}` });
    // Practice done: the next lesson, not the review pile.
    expect(todayStep({ ...after, dailyRuns: [run(5)] })).toMatchObject({ kind: 'start-lesson', to: `/lesson/${first.id}` });
    // A lesson left part-done is finished first.
    expect(todayStep({ ...after, lessons: { [first.id]: opened(first.id) } }).kind).toBe('continue-lesson');
  });

  it('brings the backlog back the next day, a round at a time, ahead of new material', () => {
    // Yesterday was the day back; today is an ordinary day with a backlog.
    const step = todayStep(state({ studyDays: studied(1, 6, 7), reviewItems: waiting(25) }));
    expect(step).toMatchObject({ kind: 'review', to: '/review', then: 'daily' });
  });

  it('continues a practice begun today, and is done once the goal is met, break or not', () => {
    expect(todayStep(state({ studyDays: studied(0, 5), reviewItems: waiting(30), dailyRuns: [run(2)] })).kind).toBe('continue-daily');
    expect(todayStep(state({ studyDays: studied(0, 5), reviewItems: waiting(30), minutesToday: 20 })).kind).toBe('done');
    expect(todayStep(state({ studyDays: studied(5), reviewItems: waiting(30), minutesToday: 20 })).kind).toBe('done');
  });
});

describe('the warm-up', () => {
  const item = (id: string, state: ReviewItem['state'], dueDaysAgo: number): ReviewItem => ({
    ...createReviewItem({ id: `vocab:${id}`, kind: 'vocab', refId: id, level: 'pre-a1', now: new Date(now.getTime() - 9 * 86_400_000) }),
    state, intervalDays: state === 'known' ? 5 : 2, successCount: 2,
    dueAt: new Date(now.getTime() - dueDaysAgo * 86_400_000).toISOString(),
  });

  it('takes the forgotten first, then what is still being learnt, and a warm-up\'s worth at most', () => {
    const words = VOCABULARY.filter((entry) => entry.level === 'pre-a1').slice(0, 20);
    const items = words.map((entry, index) =>
      item(entry.id, index < 2 ? 'known' : index < 4 ? 'lapsed' : index < 8 ? 'learning' : 'known', 1 + (index % 4)));
    const warmUp = catchUpExercises(items, 'en', now);
    expect(warmUp).toHaveLength(CATCH_UP_SIZE);
    const asked = warmUp.map((exercise) => exercise.steps[0]!.reviewTargets![0]);
    expect(asked.slice(0, 2).sort()).toEqual([words[2]!.id, words[3]!.id].sort());
    expect(asked.slice(2, 6).sort()).toEqual(words.slice(4, 8).map((entry) => entry.id).sort());
    expect(catchUpExercises(items.slice(0, 5), 'en', now)).toHaveLength(5);
    expect(catchUpExercises([], 'en', now)).toEqual([]);
  });
});
