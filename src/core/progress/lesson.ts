import type { Bilingual, Lesson } from '../../content/types.ts';
import type { Verdict } from '../validation/validate.ts';

/**
 * Lesson mastery rules.
 *
 * A lesson is never completed by scrolling. `lessonRequirements` returns the
 * exact list of conditions with their live state, so the UI can show the learner
 * what is still missing instead of an opaque progress bar.
 */

export interface StepOutcome {
  stepId: string;
  attempts: number;
  /** Correct (or an accepted variant) on the very first try, without hints. */
  firstTryCorrect: boolean;
  /** Best credit earned, after the hint penalty. */
  bestCredit: number;
  /** The learner ended this step on the correct German, possibly after retyping. */
  resolved: boolean;
  hintsUsed: number;
  revealed: boolean;
}

export interface MasteryProgress {
  attempts: number;
  bestAccuracy: number;
  passed: boolean;
}

export interface LessonProgress {
  lessonId: string;
  sectionsSeen: string[];
  /** Keyed by step id. */
  practice: Record<string, StepOutcome>;
  mastery: MasteryProgress;
  recoveryRounds: number;
  startedAt?: string;
  completedAt?: string;
  lastActiveAt?: string;
}

/** Minimum first-try accuracy across the practice phase. */
export const PRACTICE_MIN_ACCURACY = 0.6;
/** Below this, a short recovery round is inserted before the mastery check. */
export const RECOVERY_THRESHOLD = 0.7;

export function emptyLessonProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}

export interface RecordInput {
  stepId: string;
  verdict: Verdict;
  /** Credit after the hint penalty has been applied. */
  credit: number;
  hintsUsed: number;
  revealed: boolean;
  /** True once the learner has produced the correct German for this step. */
  resolved: boolean;
  now?: string;
}

const FULL_CREDIT_VERDICTS: ReadonlySet<Verdict> = new Set<Verdict>(['correct', 'accepted-variant']);

export function recordStepOutcome(progress: LessonProgress, input: RecordInput): LessonProgress {
  const prior = progress.practice[input.stepId];
  const isFirstAttempt = !prior;
  const firstTryCorrect = isFirstAttempt
    ? FULL_CREDIT_VERDICTS.has(input.verdict) && input.hintsUsed === 0 && !input.revealed
    : (prior?.firstTryCorrect ?? false);

  const outcome: StepOutcome = {
    stepId: input.stepId,
    attempts: (prior?.attempts ?? 0) + 1,
    firstTryCorrect,
    bestCredit: Math.max(prior?.bestCredit ?? 0, input.credit),
    resolved: (prior?.resolved ?? false) || input.resolved,
    hintsUsed: Math.max(prior?.hintsUsed ?? 0, input.hintsUsed),
    revealed: (prior?.revealed ?? false) || input.revealed,
  };

  return {
    ...progress,
    startedAt: progress.startedAt ?? input.now ?? new Date().toISOString(),
    lastActiveAt: input.now ?? new Date().toISOString(),
    practice: { ...progress.practice, [input.stepId]: outcome },
  };
}

export function markSectionSeen(progress: LessonProgress, sectionId: string): LessonProgress {
  if (progress.sectionsSeen.includes(sectionId)) return progress;
  return { ...progress, sectionsSeen: [...progress.sectionsSeen, sectionId] };
}

/** First-try accuracy over every practice step the learner has attempted. */
export function practiceAccuracy(progress: LessonProgress): number {
  const outcomes = Object.values(progress.practice);
  if (outcomes.length === 0) return 0;
  const correct = outcomes.filter((o) => o.firstTryCorrect).length;
  return correct / outcomes.length;
}

/** Average credit earned, which is what feeds the dashboard accuracy figure. */
export function practiceCredit(progress: LessonProgress): number {
  const outcomes = Object.values(progress.practice);
  if (outcomes.length === 0) return 0;
  return outcomes.reduce((sum, o) => sum + o.bestCredit, 0) / outcomes.length;
}

export function allStepIds(lesson: Lesson): string[] {
  return lesson.exercises.flatMap((ex) => ex.steps.map((s) => s.id));
}

export function masteryStepIds(lesson: Lesson): string[] {
  return lesson.mastery.exercises.flatMap((ex) => ex.steps.map((s) => s.id));
}

/** Steps that make the learner produce a whole German sentence. */
function sentenceStepIds(lesson: Lesson): string[] {
  return lesson.exercises
    .filter((ex) => ex.kind === 'type' || ex.kind === 'sentenceBuild' || ex.kind === 'wordOrder' || ex.kind === 'dictation')
    .flatMap((ex) => ex.steps.filter((s) => s.answer.shape === 'sentence').map((s) => s.id));
}

/** Steps that drill an individual word or a noun with its article. */
function wordStepIds(lesson: Lesson): string[] {
  return lesson.exercises
    .filter((ex) => ex.kind === 'nounWithArticle' || ex.kind === 'articleRecall' || ex.kind === 'conjugation')
    .flatMap((ex) => ex.steps.map((s) => s.id))
    .concat(
      lesson.exercises
        .flatMap((ex) => ex.steps)
        .filter((s) => s.answer.shape === 'word' || s.answer.shape === 'phrase')
        .map((s) => s.id),
    );
}

export interface Requirement {
  id: string;
  label: Bilingual;
  satisfied: boolean;
  /** "3 of 7" style progress, when it makes sense. */
  done?: number;
  total?: number;
}

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

export function lessonRequirements(lesson: Lesson, progress: LessonProgress): Requirement[] {
  const sectionIds = lesson.sections.map((s) => s.id);
  const seen = sectionIds.filter((id) => progress.sectionsSeen.includes(id)).length;

  const practiceIds = allStepIds(lesson);
  const resolved = practiceIds.filter((id) => progress.practice[id]?.resolved).length;

  const words = unique(wordStepIds(lesson));
  const wordsResolved = words.filter((id) => progress.practice[id]?.resolved).length;

  const sentences = unique(sentenceStepIds(lesson));
  const sentencesResolved = sentences.filter((id) => progress.practice[id]?.resolved).length;

  const accuracy = practiceAccuracy(progress);

  const requirements: Requirement[] = [
    {
      id: 'sections',
      label: bi('Work through the teaching sections', 'Премини през учебните раздели'),
      satisfied: seen >= sectionIds.length,
      done: seen,
      total: sectionIds.length,
    },
    {
      id: 'exercises',
      label: bi('Complete every exercise', 'Изпълни всички упражнения'),
      satisfied: resolved >= practiceIds.length,
      done: resolved,
      total: practiceIds.length,
    },
  ];

  if (words.length > 0) {
    requirements.push({
      id: 'words',
      label: bi('Recall the key words', 'Припомни ключовите думи'),
      satisfied: wordsResolved >= words.length,
      done: wordsResolved,
      total: words.length,
    });
  }
  if (sentences.length > 0) {
    requirements.push({
      id: 'sentences',
      label: bi('Type the key sentences', 'Напиши ключовите изречения'),
      satisfied: sentencesResolved >= sentences.length,
      done: sentencesResolved,
      total: sentences.length,
    });
  }

  requirements.push(
    {
      id: 'accuracy',
      label: bi(
        `Reach ${Math.round(PRACTICE_MIN_ACCURACY * 100)}% first-try accuracy`,
        `Постигни ${Math.round(PRACTICE_MIN_ACCURACY * 100)}% верни от първи опит`,
      ),
      satisfied: accuracy >= PRACTICE_MIN_ACCURACY,
      done: Math.round(accuracy * 100),
      total: 100,
    },
    {
      id: 'mastery',
      label: bi('Pass the mastery check', 'Издържи проверката за усвояване'),
      satisfied: progress.mastery.passed,
    },
  );

  return requirements;
}

export function isLessonComplete(lesson: Lesson, progress: LessonProgress): boolean {
  return lessonRequirements(lesson, progress).every((r) => r.satisfied);
}

/**
 * Should a short recovery round run before the mastery check?
 *
 * The purpose is mastery, not punishment: the learner gets extra practice on the
 * steps they got wrong, once, and then goes on to the mastery check.
 */
export function needsRecovery(lesson: Lesson, progress: LessonProgress): boolean {
  const practiceIds = allStepIds(lesson);
  const attempted = practiceIds.filter((id) => progress.practice[id]);
  if (attempted.length < practiceIds.length) return false;
  if (progress.recoveryRounds > 0) return false;
  return practiceAccuracy(progress) < RECOVERY_THRESHOLD;
}

/** The steps a recovery round should revisit: everything not recalled cleanly. */
export function recoveryStepIds(lesson: Lesson, progress: LessonProgress): string[] {
  return allStepIds(lesson).filter((id) => {
    const outcome = progress.practice[id];
    return outcome ? !outcome.firstTryCorrect : false;
  });
}

export function recordMasteryAttempt(
  progress: LessonProgress,
  accuracy: number,
  passAccuracy: number,
  now = new Date().toISOString(),
): LessonProgress {
  const passed = progress.mastery.passed || accuracy >= passAccuracy;
  return {
    ...progress,
    lastActiveAt: now,
    mastery: {
      attempts: progress.mastery.attempts + 1,
      bestAccuracy: Math.max(progress.mastery.bestAccuracy, accuracy),
      passed,
    },
  };
}

export function completeLesson(progress: LessonProgress, now = new Date().toISOString()): LessonProgress {
  return { ...progress, completedAt: progress.completedAt ?? now, lastActiveAt: now };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
