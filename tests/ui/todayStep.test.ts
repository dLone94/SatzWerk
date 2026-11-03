import { describe, expect, it } from 'vitest';
import { allCheckpoints, allUnits, availableLessons, lessonsInOrder } from '../../src/content/index.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import type { DailyRun } from '../../src/core/progress/daily.ts';
import type { LessonProgress, StepOutcome } from '../../src/core/progress/lesson.ts';
import { createReviewItem, type ReviewItem } from '../../src/core/srs/scheduler.ts';
import type { CheckpointResult } from '../../src/services/api/client.ts';
import { REVIEW_BACKLOG, todayStep, type TodayInput } from '../../src/ui/selectors.ts';

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
