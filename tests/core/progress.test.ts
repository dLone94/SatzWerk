import { describe, expect, it } from 'vitest';
import { lessonById } from '../../src/content/index.ts';
import {
  PRACTICE_MIN_ACCURACY,
  allStepIds,
  completeLesson,
  emptyLessonProgress,
  isLessonComplete,
  lessonRequirements,
  markSectionSeen,
  needsRecovery,
  practiceAccuracy,
  recordMasteryAttempt,
  recordStepOutcome,
  recoveryStepIds,
  type LessonProgress,
} from '../../src/core/progress/lesson.ts';
import { adapt, initialAdaptation, presentationFor } from '../../src/core/progress/adaptation.ts';

const lesson = lessonById('pre-a1-u2-l1')!;

function answerAll(progress: LessonProgress, correct: (index: number) => boolean): LessonProgress {
  let next = progress;
  allStepIds(lesson).forEach((stepId, index) => {
    const ok = correct(index);
    next = recordStepOutcome(next, {
      stepId,
      verdict: ok ? 'correct' : 'incorrect',
      credit: ok ? 1 : 0,
      hintsUsed: 0,
      revealed: false,
      resolved: ok,
    });
    if (!ok) {
      // A wrong answer is followed by the mandatory retyping, which resolves
      // the step without repairing the first-try record.
      next = recordStepOutcome(next, {
        stepId,
        verdict: 'correct',
        credit: 1,
        hintsUsed: 0,
        revealed: false,
        resolved: true,
      });
    }
  });
  return next;
}

function readAllSections(progress: LessonProgress): LessonProgress {
  let next = progress;
  for (const section of lesson.sections) next = markSectionSeen(next, section.id);
  return next;
}

describe('lesson completion rules', () => {
  it('starts with nothing satisfied', () => {
    const requirements = lessonRequirements(lesson, emptyLessonProgress(lesson.id));
    expect(requirements.length).toBeGreaterThanOrEqual(4);
    expect(requirements.every((requirement) => !requirement.satisfied)).toBe(true);
    expect(isLessonComplete(lesson, emptyLessonProgress(lesson.id))).toBe(false);
  });

  it('cannot be completed by reading alone', () => {
    const progress = readAllSections(emptyLessonProgress(lesson.id));
    const requirements = lessonRequirements(lesson, progress);
    expect(requirements.find((requirement) => requirement.id === 'sections')?.satisfied).toBe(true);
    expect(requirements.find((requirement) => requirement.id === 'exercises')?.satisfied).toBe(false);
    expect(isLessonComplete(lesson, progress)).toBe(false);
  });

  it('cannot be completed without passing the mastery check', () => {
    let progress = readAllSections(emptyLessonProgress(lesson.id));
    progress = answerAll(progress, () => true);
    const requirements = lessonRequirements(lesson, progress);
    expect(requirements.find((requirement) => requirement.id === 'exercises')?.satisfied).toBe(true);
    expect(requirements.find((requirement) => requirement.id === 'accuracy')?.satisfied).toBe(true);
    expect(requirements.find((requirement) => requirement.id === 'mastery')?.satisfied).toBe(false);
    expect(isLessonComplete(lesson, progress)).toBe(false);
  });

  it('completes once every requirement including mastery is met', () => {
    let progress = readAllSections(emptyLessonProgress(lesson.id));
    progress = answerAll(progress, () => true);
    progress = recordMasteryAttempt(progress, 0.9, lesson.mastery.passAccuracy);
    expect(isLessonComplete(lesson, progress)).toBe(true);
    progress = completeLesson(progress);
    expect(progress.completedAt).toBeTruthy();
  });

  it('holds the lesson back when first-try accuracy is too low', () => {
    let progress = readAllSections(emptyLessonProgress(lesson.id));
    // Every third answer right.
    progress = answerAll(progress, (index) => index % 3 === 0);
    expect(practiceAccuracy(progress)).toBeLessThan(PRACTICE_MIN_ACCURACY);
    const accuracy = lessonRequirements(lesson, progress).find((r) => r.id === 'accuracy');
    expect(accuracy?.satisfied).toBe(false);
    // The exercises are all resolved, because each mistake was retyped.
    expect(lessonRequirements(lesson, progress).find((r) => r.id === 'exercises')?.satisfied).toBe(true);
  });

  it('does not let a retyping count as a first-try success', () => {
    let progress = emptyLessonProgress(lesson.id);
    const stepId = allStepIds(lesson)[0]!;
    progress = recordStepOutcome(progress, {
      stepId,
      verdict: 'incorrect',
      credit: 0,
      hintsUsed: 0,
      revealed: false,
      resolved: false,
    });
    progress = recordStepOutcome(progress, {
      stepId,
      verdict: 'correct',
      credit: 1,
      hintsUsed: 0,
      revealed: false,
      resolved: true,
    });
    const outcome = progress.practice[stepId]!;
    expect(outcome.resolved).toBe(true);
    expect(outcome.firstTryCorrect).toBe(false);
    expect(practiceAccuracy(progress)).toBe(0);
  });

  it('does not count a hinted answer as a clean first try', () => {
    let progress = emptyLessonProgress(lesson.id);
    const stepId = allStepIds(lesson)[0]!;
    progress = recordStepOutcome(progress, {
      stepId,
      verdict: 'correct',
      credit: 0.85,
      hintsUsed: 1,
      revealed: false,
      resolved: true,
    });
    expect(progress.practice[stepId]!.firstTryCorrect).toBe(false);
  });
});

describe('recovery round', () => {
  it('is offered once when the practice went badly, and only then', () => {
    let progress = readAllSections(emptyLessonProgress(lesson.id));
    progress = answerAll(progress, (index) => index % 3 === 0);
    expect(needsRecovery(lesson, progress)).toBe(true);

    const steps = recoveryStepIds(lesson, progress);
    expect(steps.length).toBeGreaterThan(0);
    // Only the steps that were not recalled cleanly come back.
    expect(steps.length).toBeLessThan(allStepIds(lesson).length);

    const afterRound: LessonProgress = { ...progress, recoveryRounds: 1 };
    expect(needsRecovery(lesson, afterRound)).toBe(false);
  });

  it('is not offered before the practice phase is finished', () => {
    let progress = emptyLessonProgress(lesson.id);
    progress = recordStepOutcome(progress, {
      stepId: allStepIds(lesson)[0]!,
      verdict: 'incorrect',
      credit: 0,
      hintsUsed: 0,
      revealed: false,
      resolved: false,
    });
    expect(needsRecovery(lesson, progress)).toBe(false);
  });

  it('is not offered when the practice went well', () => {
    let progress = readAllSections(emptyLessonProgress(lesson.id));
    progress = answerAll(progress, () => true);
    expect(needsRecovery(lesson, progress)).toBe(false);
  });
});

describe('mastery attempts', () => {
  it('keeps the best accuracy and never un-passes a pass', () => {
    let progress = emptyLessonProgress(lesson.id);
    progress = recordMasteryAttempt(progress, 0.4, 0.7);
    expect(progress.mastery.passed).toBe(false);
    progress = recordMasteryAttempt(progress, 0.95, 0.7);
    expect(progress.mastery.passed).toBe(true);
    progress = recordMasteryAttempt(progress, 0.1, 0.7);
    expect(progress.mastery.passed).toBe(true);
    expect(progress.mastery.bestAccuracy).toBeCloseTo(0.95);
    expect(progress.mastery.attempts).toBe(3);
  });
});

describe('difficulty adaptation', () => {
  it('leaves support alone after a single mistake', () => {
    const state = adapt(initialAdaptation(), 'wrong');
    expect(state.support).toBe('full-production');
    expect(state.wrongStreak).toBe(1);
  });

  it('adds support after two mistakes in a row', () => {
    let state = adapt(initialAdaptation(), 'wrong');
    state = adapt(state, 'wrong');
    expect(state.support).toBe('first-word');
    state = adapt(state, 'wrong');
    state = adapt(state, 'wrong');
    expect(state.support).toBe('first-letters');
  });

  it('withdraws support again after two clean answers', () => {
    let state = adapt(adapt(initialAdaptation(), 'wrong'), 'wrong');
    expect(state.support).toBe('first-word');
    state = adapt(state, 'clean');
    expect(state.support).toBe('first-word');
    state = adapt(state, 'clean');
    expect(state.support).toBe('full-production');
  });

  it('walks the whole ladder down and never past the end', () => {
    let state = initialAdaptation();
    for (let i = 0; i < 40; i += 1) state = adapt(state, 'wrong');
    expect(state.support).toBe('defer');
    expect(presentationFor(state.support).deferred).toBe(true);
  });

  it('shows no scaffolding at full production', () => {
    const presentation = presentationFor('full-production');
    expect(presentation).toMatchObject({
      showWordBank: false,
      showScaffold: false,
      showFirstWord: false,
      hintsUnlocked: 0,
    });
  });
});
