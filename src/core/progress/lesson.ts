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

/**
 * The share a final check needs, given how many questions it has.
 *
 * Most checks are three or four questions long, and an authored 70% or 75% of
 * three is three: one forgotten umlaut and a beginner failed a lesson they had
 * learned. On any check of three or more questions, one slip is allowed; a
 * long check keeps its authored mark if that is already more forgiving.
 */
export function masteryPassMark(passAccuracy: number, questions: number): number {
  if (questions < 3) return passAccuracy;
  return Math.min(passAccuracy, (questions - 1) / questions);
}

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
  /**
   * Whether the validator asked for the answer to be typed again. Only an
   * 'accepted-with-note' verdict needs it, to tell a forgotten full stop
   * (false) from 'ae' typed for 'ä' (true).
   */
  requireRetype?: boolean;
  now?: string;
}

const FULL_CREDIT_VERDICTS: ReadonlySet<Verdict> = new Set<Verdict>(['correct', 'accepted-variant']);

/**
 * Whether a verdict counts as a right answer — the one definition the player,
 * this file and the server all use.
 *
 * A note that asks for nothing (a forgotten full stop) is right: the player
 * shows it as right first time, and counting it as wrong here sent a learner
 * who never typed the final full stop to a quick redo of accepted sentences.
 * A note that asks for a retype is not. When nobody said which it was — an
 * answer from an older client — it is not counted, as before.
 */
export function countsAsRight(verdict: Verdict, requireRetype?: boolean): boolean {
  return FULL_CREDIT_VERDICTS.has(verdict) || (verdict === 'accepted-with-note' && requireRetype === false);
}

export function recordStepOutcome(progress: LessonProgress, input: RecordInput): LessonProgress {
  const prior = progress.practice[input.stepId];
  const isFirstAttempt = !prior;
  const firstTryCorrect = isFirstAttempt
    ? countsAsRight(input.verdict, input.requireRetype) && input.hintsUsed === 0 && !input.revealed
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

/*
 * What finishing a lesson does to its progress.
 *
 * These three were the database's business until the browser had to answer the
 * same question without it. A lesson done in a tunnel still has to show whether
 * the mastery check was passed, and that decision is a rule, not a fact the
 * server holds: a passing accuracy, a count, a best-so-far. So the rule lives
 * here, in the pure core, and `server/store.ts` applies exactly this function
 * before writing the row — see `tests/server/api.test.ts`, which fails if the
 * two ever drift.
 *
 * Nothing is invented offline; the same arithmetic simply happens one side
 * earlier, and is confirmed when the write arrives.
 */

export function applyMastery(
  progress: LessonProgress,
  accuracy: number,
  passAccuracy: number,
  now: string,
): LessonProgress {
  return {
    ...progress,
    startedAt: progress.startedAt ?? now,
    lastActiveAt: now,
    mastery: {
      attempts: progress.mastery.attempts + 1,
      // Best, not latest: a second run that goes worse does not take away what
      // was already shown.
      bestAccuracy: Math.max(progress.mastery.bestAccuracy, accuracy),
      passed: progress.mastery.passed || accuracy >= passAccuracy,
    },
  };
}

export function applyRecoveryRound(progress: LessonProgress, now: string): LessonProgress {
  return {
    ...progress,
    startedAt: progress.startedAt ?? now,
    lastActiveAt: now,
    recoveryRounds: progress.recoveryRounds + 1,
  };
}

export function applyCompletion(progress: LessonProgress, now: string): LessonProgress {
  return {
    ...progress,
    startedAt: progress.startedAt ?? now,
    lastActiveAt: now,
    // The first completion is the one that counts; finishing again does not
    // move the date.
    completedAt: progress.completedAt ?? now,
  };
}

/**
 * The stored outcomes that count as this lesson's practice.
 *
 * Given the lesson, only its own practice steps. The server once filed
 * final-check answers here too, and those rows are still stored: counted, a
 * final check that went badly lowered the first-try figure and called for a
 * recovery round the practice never earned.
 */
function practiceOutcomes(progress: LessonProgress, lesson?: Lesson): StepOutcome[] {
  if (!lesson) return Object.values(progress.practice);
  return unique(allStepIds(lesson)).flatMap((id) => {
    const outcome = progress.practice[id];
    return outcome ? [outcome] : [];
  });
}

/** First-try accuracy over every practice step the learner has attempted. */
export function practiceAccuracy(progress: LessonProgress, lesson?: Lesson): number {
  const outcomes = practiceOutcomes(progress, lesson);
  if (outcomes.length === 0) return 0;
  const correct = outcomes.filter((o) => o.firstTryCorrect).length;
  return correct / outcomes.length;
}

/** Average credit earned, which is what feeds the dashboard accuracy figure. */
export function practiceCredit(progress: LessonProgress, lesson?: Lesson): number {
  const outcomes = practiceOutcomes(progress, lesson);
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

  const accuracy = practiceAccuracy(progress, lesson);

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
        `Get ${Math.round(PRACTICE_MIN_ACCURACY * 100)}% right first time, or pass the final check`,
        `${Math.round(PRACTICE_MIN_ACCURACY * 100)}% верни от първи опит или издържана финална проверка`,
      ),
      // First tries cannot be taken again, so a lesson that went badly the
      // first time could otherwise never be finished. Passing the final check
      // later is proof enough.
      satisfied: accuracy >= PRACTICE_MIN_ACCURACY || progress.mastery.passed,
      done: Math.round(accuracy * 100),
      total: 100,
    },
    {
      id: 'mastery',
      label: bi('Pass the final check', 'Издържи финалната проверка'),
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
  return practiceAccuracy(progress, lesson) < RECOVERY_THRESHOLD;
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
