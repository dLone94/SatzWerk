import { createHash } from 'node:crypto';
import type { CefrLevel, ErrorCategory, TeachingLanguage } from '../src/content/types.ts';
import type { LessonProgress, StepOutcome } from '../src/core/progress/lesson.ts';
import {
  createReviewItem,
  gradeFromAttempt,
  scheduleReview,
  type RecallGrade,
  type ReviewItem,
  type ReviewKind,
} from '../src/core/srs/scheduler.ts';
import type { Verdict } from '../src/core/validation/validate.ts';
import type { Db } from './db.ts';

/**
 * All database access lives here.
 *
 * Note that the *scheduling* decisions are made on the server, using the same
 * pure functions the client uses for its optimistic UI. The database is the
 * single source of truth for what is due and when.
 */

/* ------------------------------------------------------------------ *
 * Profile
 * ------------------------------------------------------------------ */

export interface Profile {
  teachingLanguage: TeachingLanguage;
  dailyTargetMinutes: number;
  displayName: string | null;
  onboarded: boolean;
  createdAt: string;
}

export async function getProfile(db: Db): Promise<Profile> {
  const row = await db.get(`SELECT teaching_language, daily_target_minutes, display_name, onboarded, created_at
       FROM profile WHERE id = 1`) as Record<string, unknown>;
  return {
    teachingLanguage: (row.teaching_language as TeachingLanguage) ?? 'en',
    dailyTargetMinutes: Number(row.daily_target_minutes ?? 20),
    displayName: (row.display_name as string | null) ?? null,
    onboarded: Number(row.onboarded ?? 0) === 1,
    createdAt: String(row.created_at),
  };
}

export interface ProfilePatch {
  teachingLanguage?: TeachingLanguage;
  dailyTargetMinutes?: number;
  displayName?: string | null;
  onboarded?: boolean;
}

export async function updateProfile(db: Db, patch: ProfilePatch): Promise<Profile> {
  const current = await getProfile(db);
  const next: Profile = {
    ...current,
    ...(patch.teachingLanguage ? { teachingLanguage: patch.teachingLanguage } : {}),
    ...(patch.dailyTargetMinutes !== undefined
      ? { dailyTargetMinutes: clampTarget(patch.dailyTargetMinutes) }
      : {}),
    ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
    ...(patch.onboarded !== undefined ? { onboarded: patch.onboarded } : {}),
  };
  await db.run(`UPDATE profile
     SET teaching_language = ?, daily_target_minutes = ?, display_name = ?, onboarded = ?, updated_at = ?
     WHERE id = 1`, next.teachingLanguage,
    next.dailyTargetMinutes,
    next.displayName,
    next.onboarded ? 1 : 0,
    new Date().toISOString(),);
  return next;
}

function clampTarget(minutes: number): number {
  if (!Number.isFinite(minutes)) return 20;
  return Math.min(180, Math.max(5, Math.round(minutes)));
}

/* ------------------------------------------------------------------ *
 * Lesson progress
 * ------------------------------------------------------------------ */

function emptyRow(lessonId: string): LessonProgress {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}

export async function getLessonProgress(db: Db, lessonId: string): Promise<LessonProgress> {
  const state = await db.get(`SELECT * FROM lesson_state WHERE lesson_id = ?`, lessonId) as Record<string, unknown> | undefined;
  const outcomes = await db.all(`SELECT * FROM step_outcomes WHERE lesson_id = ?`, lessonId) as Array<Record<string, unknown>>;

  const practice: Record<string, StepOutcome> = {};
  for (const row of outcomes) {
    const stepId = String(row.step_id);
    practice[stepId] = {
      stepId,
      attempts: Number(row.attempts),
      firstTryCorrect: Number(row.first_try_correct) === 1,
      bestCredit: Number(row.best_credit),
      resolved: Number(row.resolved) === 1,
      hintsUsed: Number(row.hints_used),
      revealed: Number(row.revealed) === 1,
    };
  }

  if (!state) return { ...emptyRow(lessonId), practice };

  return {
    lessonId,
    sectionsSeen: JSON.parse(String(state.sections_seen ?? '[]')) as string[],
    practice,
    mastery: {
      attempts: Number(state.mastery_attempts),
      bestAccuracy: Number(state.mastery_best_accuracy),
      passed: Number(state.mastery_passed) === 1,
    },
    recoveryRounds: Number(state.recovery_rounds),
    startedAt: (state.started_at as string | null) ?? undefined,
    completedAt: (state.completed_at as string | null) ?? undefined,
    lastActiveAt: (state.last_active_at as string | null) ?? undefined,
  };
}

export async function getAllLessonProgress(db: Db): Promise<LessonProgress[]> {
  const lessonIds = new Set<string>();
  for (const row of await db.all('SELECT lesson_id FROM lesson_state') as Array<{ lesson_id: string }>) {
    lessonIds.add(row.lesson_id);
  }
  for (const row of await db.all('SELECT DISTINCT lesson_id FROM step_outcomes') as Array<{
    lesson_id: string;
  }>) {
    lessonIds.add(row.lesson_id);
  }
  return Promise.all([...lessonIds].map((id) => getLessonProgress(db, id)));
}

async function ensureLessonState(db: Db, lessonId: string, now: string): Promise<void> {
  await db.run(`INSERT INTO lesson_state (lesson_id, started_at, last_active_at)
     VALUES (?, ?, ?)
     ON CONFLICT (lesson_id) DO UPDATE SET last_active_at = excluded.last_active_at`, lessonId, now, now);
}

export async function markSectionSeen(db: Db, lessonId: string, sectionId: string): Promise<LessonProgress> {
  const now = new Date().toISOString();
  await ensureLessonState(db, lessonId, now);
  const current = await getLessonProgress(db, lessonId);
  if (!current.sectionsSeen.includes(sectionId)) {
    const next = [...current.sectionsSeen, sectionId];
    await db.run('UPDATE lesson_state SET sections_seen = ?, last_active_at = ? WHERE lesson_id = ?', JSON.stringify(next),
      now,
      lessonId,);
  }
  return await getLessonProgress(db, lessonId);
}

export async function recordMastery(
  db: Db,
  lessonId: string,
  accuracy: number,
  passAccuracy: number,
): Promise<LessonProgress> {
  const now = new Date().toISOString();
  await ensureLessonState(db, lessonId, now);
  const current = await getLessonProgress(db, lessonId);
  const passed = current.mastery.passed || accuracy >= passAccuracy;
  await db.run(`UPDATE lesson_state
     SET mastery_attempts = ?, mastery_best_accuracy = ?, mastery_passed = ?, last_active_at = ?
     WHERE lesson_id = ?`, current.mastery.attempts + 1,
    Math.max(current.mastery.bestAccuracy, accuracy),
    passed ? 1 : 0,
    now,
    lessonId,);
  return await getLessonProgress(db, lessonId);
}

export async function recordRecoveryRound(db: Db, lessonId: string): Promise<LessonProgress> {
  const now = new Date().toISOString();
  await ensureLessonState(db, lessonId, now);
  await db.run('UPDATE lesson_state SET recovery_rounds = recovery_rounds + 1, last_active_at = ? WHERE lesson_id = ?', now, lessonId);
  return await getLessonProgress(db, lessonId);
}

export async function completeLesson(db: Db, lessonId: string): Promise<LessonProgress> {
  const now = new Date().toISOString();
  await ensureLessonState(db, lessonId, now);
  await db.run(`UPDATE lesson_state
     SET completed_at = COALESCE(completed_at, ?), last_active_at = ?
     WHERE lesson_id = ?`, now, now, lessonId);
  return await getLessonProgress(db, lessonId);
}

/* ------------------------------------------------------------------ *
 * Review items
 * ------------------------------------------------------------------ */

function rowToReviewItem(row: Record<string, unknown>): ReviewItem {
  return {
    id: String(row.id),
    kind: row.kind as ReviewKind,
    refId: String(row.ref_id),
    lessonId: (row.lesson_id as string | null) ?? undefined,
    level: row.level as CefrLevel,
    state: row.state as ReviewItem['state'],
    ease: Number(row.ease),
    intervalDays: Number(row.interval_days),
    dueAt: String(row.due_at),
    lastReviewAt: (row.last_review_at as string | null) ?? undefined,
    successCount: Number(row.success_count),
    failureCount: Number(row.failure_count),
    lapses: Number(row.lapses),
    learningStep: Number(row.learning_step),
    createdAt: String(row.created_at),
  };
}

export async function listReviewItems(db: Db): Promise<ReviewItem[]> {
  return (await db.all('SELECT * FROM review_items ORDER BY due_at') as Array<Record<string, unknown>>).map(
    rowToReviewItem,
  );
}

export async function getReviewItem(db: Db, id: string): Promise<ReviewItem | undefined> {
  const row = await db.get('SELECT * FROM review_items WHERE id = ?', id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToReviewItem(row) : undefined;
}

async function upsertReviewItem(db: Db, item: ReviewItem): Promise<void> {
  await db.run(`INSERT INTO review_items
       (id, kind, ref_id, lesson_id, level, state, ease, interval_days, due_at,
        last_review_at, success_count, failure_count, lapses, learning_step, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       state = excluded.state,
       ease = excluded.ease,
       interval_days = excluded.interval_days,
       due_at = excluded.due_at,
       last_review_at = excluded.last_review_at,
       success_count = excluded.success_count,
       failure_count = excluded.failure_count,
       lapses = excluded.lapses,
       learning_step = excluded.learning_step`, item.id,
    item.kind,
    item.refId,
    item.lessonId ?? null,
    item.level,
    item.state,
    item.ease,
    item.intervalDays,
    item.dueAt,
    item.lastReviewAt ?? null,
    item.successCount,
    item.failureCount,
    item.lapses,
    item.learningStep,
    item.createdAt,);
}

export interface TargetSpec {
  refId: string;
  kind: ReviewKind;
  level: CefrLevel;
  lessonId?: string;
  difficulty?: number;
}

export function reviewItemId(kind: ReviewKind, refId: string): string {
  return `${kind}:${refId}`;
}

/** Create review items for material the learner has just been taught. */
export async function ensureReviewItems(db: Db, targets: TargetSpec[]): Promise<ReviewItem[]> {
  const created: ReviewItem[] = [];
  for (const target of targets) {
    const id = reviewItemId(target.kind, target.refId);
    if (await getReviewItem(db, id)) continue;
    const item = createReviewItem({
      id,
      kind: target.kind,
      refId: target.refId,
      level: target.level,
      lessonId: target.lessonId,
      difficulty: target.difficulty,
    });
    await upsertReviewItem(db, item);
    created.push(item);
  }
  return created;
}

export async function gradeReviewItem(db: Db, id: string, grade: RecallGrade): Promise<ReviewItem | undefined> {
  const item = await getReviewItem(db, id);
  if (!item) return undefined;
  const next = scheduleReview(item, grade);
  await upsertReviewItem(db, next);
  return next;
}

/* ------------------------------------------------------------------ *
 * Attempts, mistakes and study days
 * ------------------------------------------------------------------ */

export type AttemptContext = 'lesson' | 'mastery' | 'review' | 'checkpoint' | 'practice';

export interface AttemptInput {
  context: AttemptContext;
  lessonId?: string;
  exerciseId?: string;
  stepId: string;
  prompt?: string;
  expected: string;
  given: string;
  verdict: Verdict;
  /** Credit after the hint penalty. */
  credit: number;
  categories: ErrorCategory[];
  hintsUsed: number;
  revealed: boolean;
  /** True when this submission is the learner retyping a correction. */
  isRetype: boolean;
  /** True once the learner has produced the correct German for this step. */
  resolved: boolean;
  durationMs?: number;
  reviewTargets?: TargetSpec[];
}

export interface AttemptResult {
  attemptId: number;
  reviewItems: ReviewItem[];
  grade: RecallGrade;
  lessonProgress?: LessonProgress;
  mistakeId?: string;
}

const CREDIT_VERDICTS = new Set<Verdict>(['correct', 'accepted-variant']);

export async function recordAttempt(db: Db, input: AttemptInput, now = new Date()): Promise<AttemptResult> {
  const iso = now.toISOString();
  const day = iso.slice(0, 10);

  return db.transaction(async () => {
    // RETURNING rather than a last-insert-rowid lookup: SQLite and Postgres
    // both support it, and it is the only portable way to get the new id.
    const inserted = await db.get<{ id: number }>(`INSERT INTO attempts
           (created_at, context, lesson_id, exercise_id, step_id, prompt, expected, given,
            verdict, credit, categories, hints_used, revealed, is_retype, duration_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`, iso,
        input.context,
        input.lessonId ?? null,
        input.exerciseId ?? null,
        input.stepId,
        input.prompt ?? null,
        input.expected,
        input.given,
        input.verdict,
        input.credit,
        JSON.stringify(input.categories),
        input.hintsUsed,
        input.revealed ? 1 : 0,
        input.isRetype ? 1 : 0,
        input.durationMs ?? null,);
    const attemptId = Number(inserted!.id);

    // Daily activity, from which the streak and study time are derived.
    const wasCorrect = CREDIT_VERDICTS.has(input.verdict) && !input.revealed;
    await db.run(`INSERT INTO study_days (day, seconds_active, answers, correct)
       VALUES (?, ?, 1, ?)
       ON CONFLICT (day) DO UPDATE SET
         seconds_active = study_days.seconds_active + excluded.seconds_active,
         answers = study_days.answers + 1,
         correct = study_days.correct + excluded.correct`, day, Math.min(300, Math.round((input.durationMs ?? 0) / 1000)), wasCorrect ? 1 : 0);

    // Step outcome for the lesson mastery rules.
    let lessonProgress: LessonProgress | undefined;
    if (input.lessonId && !input.isRetype) {
      await ensureLessonState(db, input.lessonId, iso);
      const prior = await db.get('SELECT * FROM step_outcomes WHERE lesson_id = ? AND step_id = ?', input.lessonId, input.stepId) as Record<string, unknown> | undefined;

      const firstTryCorrect = prior
        ? Number(prior.first_try_correct) === 1
        : CREDIT_VERDICTS.has(input.verdict) && input.hintsUsed === 0 && !input.revealed;

      await db.run(`INSERT INTO step_outcomes
           (lesson_id, step_id, attempts, first_try_correct, best_credit, resolved, hints_used, revealed, updated_at)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (lesson_id, step_id) DO UPDATE SET
           attempts = step_outcomes.attempts + 1,
           first_try_correct = ?,
           best_credit = GREATEST(step_outcomes.best_credit, excluded.best_credit),
           resolved = GREATEST(step_outcomes.resolved, excluded.resolved),
           hints_used = GREATEST(step_outcomes.hints_used, excluded.hints_used),
           revealed = GREATEST(step_outcomes.revealed, excluded.revealed),
           updated_at = excluded.updated_at`, input.lessonId,
        input.stepId,
        firstTryCorrect ? 1 : 0,
        input.credit,
        input.resolved ? 1 : 0,
        input.hintsUsed,
        input.revealed ? 1 : 0,
        iso,
        firstTryCorrect ? 1 : 0,);
    } else if (input.lessonId && input.isRetype && input.resolved) {
      // A successful retyping closes the step without changing its first-try record.
      await db.run(`UPDATE step_outcomes SET resolved = 1, updated_at = ? WHERE lesson_id = ? AND step_id = ?`, iso, input.lessonId, input.stepId);
    }

    // Mistake bank.
    let mistakeId: string | undefined;
    if (!input.isRetype && input.categories.length > 0) {
      mistakeId = await upsertMistake(db, input, iso);
    } else if (input.isRetype && CREDIT_VERDICTS.has(input.verdict)) {
      await creditRetype(db, input, iso);
    }

    // Review scheduling.
    const grade = gradeFromAttempt({
      verdict: input.verdict,
      hintsUsed: input.hintsUsed,
      revealed: input.revealed,
      categories: input.categories,
    });
    const reviewItems: ReviewItem[] = [];
    if (!input.isRetype) {
      for (const target of input.reviewTargets ?? []) {
        const id = reviewItemId(target.kind, target.refId);
        let item = await getReviewItem(db, id);
        if (!item) {
          item = createReviewItem({
            id,
            kind: target.kind,
            refId: target.refId,
            level: target.level,
            lessonId: target.lessonId ?? input.lessonId,
            difficulty: target.difficulty,
            now,
          });
        }
        const next = scheduleReview(item, grade, now);
        await upsertReviewItem(db, next);
        reviewItems.push(next);
      }
    }

    if (input.lessonId) lessonProgress = await getLessonProgress(db, input.lessonId);
    return { attemptId, reviewItems, grade, lessonProgress, mistakeId };
  });
}

function mistakeKey(category: ErrorCategory, expected: string, stepId: string): string {
  return createHash('sha1').update(`${category}|${expected}|${stepId}`).digest('hex').slice(0, 16);
}

async function upsertMistake(db: Db, input: AttemptInput, iso: string): Promise<string> {
  // The primary category is the most specific grammatical one available.
  const category = input.categories[0]!;
  const id = mistakeKey(category, input.expected, input.stepId);
  await db.run(`INSERT INTO mistakes
       (id, category, expected, last_given, step_id, lesson_id, occurrences, corrected_count, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
     ON CONFLICT (id) DO UPDATE SET
       occurrences = mistakes.occurrences + 1,
       last_given = excluded.last_given,
       last_seen_at = excluded.last_seen_at,
       resolved_at = NULL`, id,
    category,
    input.expected,
    input.given,
    input.stepId,
    input.lessonId ?? null,
    iso,
    iso,);
  return id;
}

/** Record that the learner successfully retyped a correction. */
async function creditRetype(db: Db, input: AttemptInput, iso: string): Promise<void> {
  await db.run(`UPDATE mistakes
     SET corrected_count = corrected_count + 1, last_seen_at = ?
     WHERE step_id = ? AND expected = ?`, iso, input.stepId, input.expected);
}

export interface MistakeRecord {
  id: string;
  category: ErrorCategory;
  expected: string;
  lastGiven: string;
  stepId: string | null;
  lessonId: string | null;
  occurrences: number;
  correctedCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt: string | null;
}

export async function listMistakes(db: Db, includeResolved = false): Promise<MistakeRecord[]> {
  const sql = includeResolved
    ? 'SELECT * FROM mistakes ORDER BY last_seen_at DESC'
    : 'SELECT * FROM mistakes WHERE resolved_at IS NULL ORDER BY occurrences DESC, last_seen_at DESC';
  return (await db.all(sql) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    category: row.category as ErrorCategory,
    expected: String(row.expected),
    lastGiven: String(row.last_given),
    stepId: (row.step_id as string | null) ?? null,
    lessonId: (row.lesson_id as string | null) ?? null,
    occurrences: Number(row.occurrences),
    correctedCount: Number(row.corrected_count),
    firstSeenAt: String(row.first_seen_at),
    lastSeenAt: String(row.last_seen_at),
    resolvedAt: (row.resolved_at as string | null) ?? null,
  }));
}

export async function resolveMistake(db: Db, id: string): Promise<void> {
  await db.run('UPDATE mistakes SET resolved_at = ? WHERE id = ?', new Date().toISOString(), id);
}

/* ------------------------------------------------------------------ *
 * Checkpoints, favourites, statistics
 * ------------------------------------------------------------------ */

export interface CheckpointResultInput {
  checkpointId: string;
  scope: string;
  targetId: string;
  accuracy: number;
  passed: boolean;
  detail?: unknown;
}

export async function recordCheckpointResult(db: Db, input: CheckpointResultInput): Promise<void> {
  await db.run(`INSERT INTO checkpoint_results (checkpoint_id, scope, target_id, accuracy, passed, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, input.checkpointId,
    input.scope,
    input.targetId,
    input.accuracy,
    input.passed ? 1 : 0,
    JSON.stringify(input.detail ?? {}),
    new Date().toISOString(),);
}

export interface CheckpointResult {
  checkpointId: string;
  accuracy: number;
  passed: boolean;
  createdAt: string;
}

export async function listCheckpointResults(db: Db): Promise<CheckpointResult[]> {
  return (
    await db.all('SELECT checkpoint_id, accuracy, passed, created_at FROM checkpoint_results ORDER BY created_at DESC') as Array<Record<string, unknown>>
  ).map((row) => ({
    checkpointId: String(row.checkpoint_id),
    accuracy: Number(row.accuracy),
    passed: Number(row.passed) === 1,
    createdAt: String(row.created_at),
  }));
}

export async function setFavorite(db: Db, vocabId: string, favorite: boolean): Promise<void> {
  await db.run(`INSERT INTO word_flags (vocab_id, favorite, updated_at) VALUES (?, ?, ?)
     ON CONFLICT (vocab_id) DO UPDATE SET favorite = excluded.favorite, updated_at = excluded.updated_at`, vocabId, favorite ? 1 : 0, new Date().toISOString());
}

export async function listFavorites(db: Db): Promise<string[]> {
  return (await db.all('SELECT vocab_id FROM word_flags WHERE favorite = 1') as Array<{
    vocab_id: string;
  }>).map((row) => row.vocab_id);
}

export async function addStudyTime(db: Db, seconds: number, now = new Date()): Promise<void> {
  const day = now.toISOString().slice(0, 10);
  await db.run(`INSERT INTO study_days (day, seconds_active, answers, correct) VALUES (?, ?, 0, 0)
     ON CONFLICT (day) DO UPDATE SET seconds_active = study_days.seconds_active + excluded.seconds_active`, day, Math.max(0, Math.min(3600, Math.round(seconds))));
}

export interface StudyDay {
  day: string;
  secondsActive: number;
  answers: number;
  correct: number;
}

export async function listStudyDays(db: Db, limit = 120): Promise<StudyDay[]> {
  return (
    await db.all('SELECT * FROM study_days ORDER BY day DESC LIMIT ?', limit) as Array<
      Record<string, unknown>
    >
  ).map((row) => ({
    day: String(row.day),
    secondsActive: Number(row.seconds_active),
    answers: Number(row.answers),
    correct: Number(row.correct),
  }));
}

export interface AttemptSummary {
  stepId: string;
  expected: string;
  given: string;
  verdict: string;
  categories: ErrorCategory[];
  isRetype: boolean;
  createdAt: string;
  lessonId: string | null;
}

export async function listRecentAttempts(db: Db, limit = 50): Promise<AttemptSummary[]> {
  return (
    await db.all(`SELECT step_id, expected, given, verdict, categories, is_retype, created_at, lesson_id
         FROM attempts ORDER BY id DESC LIMIT ?`, limit) as Array<Record<string, unknown>>
  ).map((row) => ({
    stepId: String(row.step_id),
    expected: String(row.expected),
    given: String(row.given),
    verdict: String(row.verdict),
    categories: JSON.parse(String(row.categories)) as ErrorCategory[],
    isRetype: Number(row.is_retype) === 1,
    createdAt: String(row.created_at),
    lessonId: (row.lesson_id as string | null) ?? null,
  }));
}

export interface Stats {
  totalAnswers: number;
  correctAnswers: number;
  /** Share of submissions that were correct without hints. 0 when nothing yet. */
  accuracy: number;
  totalStudySeconds: number;
  studyDays: number;
  /** Consecutive days up to today with real activity. */
  streak: number;
  categoryCounts: Array<{ category: ErrorCategory; count: number }>;
  retypedCorrections: number;
}

export async function getStats(db: Db, now = new Date()): Promise<Stats> {
  const totals = await db.get(`SELECT COUNT(*) AS answers,
              SUM(CASE WHEN verdict IN ('correct','accepted-variant') AND revealed = 0 THEN 1 ELSE 0 END) AS correct,
              SUM(CASE WHEN is_retype = 1 AND verdict IN ('correct','accepted-variant') THEN 1 ELSE 0 END) AS retypes
       FROM attempts WHERE is_retype = 0 OR is_retype = 1`) as Record<string, unknown>;

  const firstTry = await db.get(`SELECT COUNT(*) AS answers,
              SUM(CASE WHEN verdict IN ('correct','accepted-variant') AND revealed = 0 THEN 1 ELSE 0 END) AS correct
       FROM attempts WHERE is_retype = 0`) as Record<string, unknown>;

  const study = await db.get('SELECT COALESCE(SUM(seconds_active), 0) AS seconds, COUNT(*) AS days FROM study_days') as Record<string, unknown>;

  const categories = await db.all(`SELECT category, SUM(occurrences) AS count FROM mistakes
       GROUP BY category ORDER BY count DESC`) as Array<Record<string, unknown>>;

  const answers = Number(firstTry.answers ?? 0);
  const correct = Number(firstTry.correct ?? 0);

  return {
    totalAnswers: Number(totals.answers ?? 0),
    correctAnswers: correct,
    accuracy: answers > 0 ? correct / answers : 0,
    totalStudySeconds: Number(study.seconds ?? 0),
    studyDays: Number(study.days ?? 0),
    streak: await computeStreak(db, now),
    categoryCounts: categories.map((row) => ({
      category: row.category as ErrorCategory,
      count: Number(row.count),
    })),
    retypedCorrections: Number(totals.retypes ?? 0),
  };
}

/**
 * The streak is counted backwards from today over days that actually contain
 * answers. A day with no activity ends it. Nothing is invented.
 */
export async function computeStreak(db: Db, now = new Date()): Promise<number> {
  const days = new Set(
    (await db.all('SELECT day FROM study_days WHERE answers > 0') as Array<{ day: string }>).map(
      (row) => row.day,
    ),
  );
  if (days.size === 0) return 0;

  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  // A streak stays alive until the end of the following day.
  let cursor = days.has(today) ? new Date(today) : days.has(yesterday) ? new Date(yesterday) : null;
  if (!cursor) return 0;

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

export function resetAll(db: Db): void {
  db.exec(`
    DELETE FROM attempts;
    DELETE FROM mistakes;
    DELETE FROM review_items;
    DELETE FROM step_outcomes;
    DELETE FROM lesson_state;
    DELETE FROM study_days;
    DELETE FROM checkpoint_results;
    DELETE FROM word_flags;
  `);
}
