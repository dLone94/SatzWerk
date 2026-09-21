import { createHash, randomBytes } from 'node:crypto';
import type { CefrLevel, ErrorCategory, TeachingLanguage } from '../src/content/types.ts';
import {
  applyCompletion,
  applyMastery,
  applyRecoveryRound,
  type LessonProgress,
  type StepOutcome,
} from '../src/core/progress/lesson.ts';
import {
  createReviewItem,
  gradeFromAttempt,
  scheduleReview,
  type RecallGrade,
  type ReviewItem,
  type ReviewKind,
} from '../src/core/srs/scheduler.ts';
import type { Verdict } from '../src/core/validation/validate.ts';
import { localDay, plausibleOffset, streakOn } from '../src/core/progress/days.ts';
import type { Db } from './db.ts';

/**
 * All database access lives here.
 *
 * Note that the *scheduling* decisions are made on the server, using the same
 * pure functions the client uses for its optimistic UI. The database is the
 * single source of truth for what is due and when.
 */

/**
 * Who is asking.
 *
 * Every function below that touches somebody's progress takes this rather than
 * a bare `Db`, and that is the point: a household shares one database, and the
 * type makes it impossible to write a query that forgets whose row it is. The
 * few functions that are genuinely about the account rather than a person — the
 * password, the session secret — still take a `Db`.
 */
export interface Scope {
  db: Db;
  /** A row in `learners`. Progress tables carry it as `user_id`. */
  userId: number;
}

/* ------------------------------------------------------------------ *
 * Learners
 * ------------------------------------------------------------------ */

export interface Learner {
  id: number;
  name: string;
  createdAt: string;
}

export async function listLearners(db: Db): Promise<Learner[]> {
  const rows = (await db.all('SELECT id, name, created_at FROM learners ORDER BY id')) as Array<
    Record<string, unknown>
  >;
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    createdAt: String(row.created_at),
  }));
}

export async function getLearner(db: Db, id: number): Promise<Learner | undefined> {
  const row = (await db.get('SELECT id, name, created_at FROM learners WHERE id = ?', id)) as
    | Record<string, unknown>
    | undefined;
  if (!row) return undefined;
  return { id: Number(row.id), name: String(row.name), createdAt: String(row.created_at) };
}

/**
 * Add somebody, with the empty profile that makes them a learner rather than a
 * name: their own teaching path, their own daily target, their own everything.
 */
export async function createLearner(db: Db, name: string): Promise<Learner> {
  const now = new Date().toISOString();
  const inserted = await db.get<{ id: number }>(
    'INSERT INTO learners (name, created_at) VALUES (?, ?) RETURNING id',
    name.trim().slice(0, 40) || 'me',
    now,
  );
  const id = Number(inserted!.id);
  await db.run(
    `INSERT INTO profile (user_id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
     VALUES (?, 'en', 20, 0, ?, ?)
     ON CONFLICT (user_id) DO NOTHING`,
    id,
    now,
    now,
  );
  return (await getLearner(db, id))!;
}

export async function renameLearner(db: Db, id: number, name: string): Promise<Learner | undefined> {
  await db.run('UPDATE learners SET name = ? WHERE id = ?', name.trim().slice(0, 40) || 'me', id);
  return await getLearner(db, id);
}

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

export async function getProfile({ db, userId }: Scope): Promise<Profile> {
  const row = await db.get(`SELECT teaching_language, daily_target_minutes, display_name, onboarded, created_at
       FROM profile WHERE user_id = ?`, userId) as Record<string, unknown> | undefined ?? {};
  return {
    teachingLanguage: (row.teaching_language as TeachingLanguage) ?? 'en',
    dailyTargetMinutes: Number(row.daily_target_minutes ?? 20),
    displayName: (row.display_name as string | null) ?? null,
    onboarded: Number(row.onboarded ?? 0) === 1,
    // Every learner is given a profile row, so this default should never be
    // reached — but `String(undefined)` is the string "undefined", and a date
    // field carrying that word renders as "Invalid Date" on the dashboard
    // rather than failing anywhere a reader would see it.
    createdAt: row.created_at == null ? new Date().toISOString() : String(row.created_at),
  };
}

export interface ProfilePatch {
  teachingLanguage?: TeachingLanguage;
  dailyTargetMinutes?: number;
  displayName?: string | null;
  onboarded?: boolean;
}

export async function updateProfile(scope: Scope, patch: ProfilePatch): Promise<Profile> {
  const { db, userId } = scope;
  const current = await getProfile(scope);
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
     WHERE user_id = ?`, next.teachingLanguage,
    next.dailyTargetMinutes,
    next.displayName,
    next.onboarded ? 1 : 0,
    new Date().toISOString(),
    userId,);
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

export async function getLessonProgress({ db, userId }: Scope, lessonId: string): Promise<LessonProgress> {
  const state = await db.get(`SELECT * FROM lesson_state WHERE lesson_id = ? AND user_id = ?`, lessonId, userId) as Record<string, unknown> | undefined;
  const outcomes = await db.all(`SELECT * FROM step_outcomes WHERE lesson_id = ? AND user_id = ?`, lessonId, userId) as Array<Record<string, unknown>>;

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

export async function getAllLessonProgress(scope: Scope): Promise<LessonProgress[]> {
  const { db, userId } = scope;
  const lessonIds = new Set<string>();
  for (const row of await db.all('SELECT lesson_id FROM lesson_state WHERE user_id = ?', userId) as Array<{ lesson_id: string }>) {
    lessonIds.add(row.lesson_id);
  }
  for (const row of await db.all('SELECT DISTINCT lesson_id FROM step_outcomes WHERE user_id = ?', userId) as Array<{
    lesson_id: string;
  }>) {
    lessonIds.add(row.lesson_id);
  }
  return Promise.all([...lessonIds].map((id) => getLessonProgress(scope, id)));
}

async function ensureLessonState({ db, userId }: Scope, lessonId: string, now: string): Promise<void> {
  await db.run(`INSERT INTO lesson_state (lesson_id, user_id, started_at, last_active_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT (lesson_id, user_id) DO UPDATE SET last_active_at = excluded.last_active_at`, lessonId, userId, now, now);
}

export async function markSectionSeen(scope: Scope, lessonId: string, sectionId: string): Promise<LessonProgress> {
  const { db, userId } = scope;
  const now = new Date().toISOString();
  await ensureLessonState(scope, lessonId, now);
  const current = await getLessonProgress(scope, lessonId);
  if (!current.sectionsSeen.includes(sectionId)) {
    const next = [...current.sectionsSeen, sectionId];
    await db.run('UPDATE lesson_state SET sections_seen = ?, last_active_at = ? WHERE lesson_id = ? AND user_id = ?', JSON.stringify(next),
      now,
      lessonId,
      userId,);
  }
  return await getLessonProgress(scope, lessonId);
}

export async function recordMastery(
  scope: Scope,
  lessonId: string,
  accuracy: number,
  passAccuracy: number,
): Promise<LessonProgress> {
  const { db, userId } = scope;
  const now = new Date().toISOString();
  await ensureLessonState(scope, lessonId, now);
  // The rule is `applyMastery` in the pure core, because the browser has to be
  // able to answer "did I pass?" from a tunnel, with no database to ask.
  const next = applyMastery(await getLessonProgress(scope, lessonId), accuracy, passAccuracy, now);
  await db.run(`UPDATE lesson_state
     SET mastery_attempts = ?, mastery_best_accuracy = ?, mastery_passed = ?, last_active_at = ?
     WHERE lesson_id = ? AND user_id = ?`, next.mastery.attempts,
    next.mastery.bestAccuracy,
    next.mastery.passed ? 1 : 0,
    now,
    lessonId,
    userId,);
  return await getLessonProgress(scope, lessonId);
}

export async function recordRecoveryRound(scope: Scope, lessonId: string): Promise<LessonProgress> {
  const { db, userId } = scope;
  const now = new Date().toISOString();
  await ensureLessonState(scope, lessonId, now);
  const next = applyRecoveryRound(await getLessonProgress(scope, lessonId), now);
  await db.run('UPDATE lesson_state SET recovery_rounds = ?, last_active_at = ? WHERE lesson_id = ? AND user_id = ?', next.recoveryRounds, now, lessonId, userId);
  return await getLessonProgress(scope, lessonId);
}

export async function completeLesson(scope: Scope, lessonId: string): Promise<LessonProgress> {
  const { db, userId } = scope;
  const now = new Date().toISOString();
  await ensureLessonState(scope, lessonId, now);
  const next = applyCompletion(await getLessonProgress(scope, lessonId), now);
  await db.run(`UPDATE lesson_state
     SET completed_at = ?, last_active_at = ?
     WHERE lesson_id = ? AND user_id = ?`, next.completedAt ?? now, now, lessonId, userId);
  return await getLessonProgress(scope, lessonId);
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

export async function listReviewItems({ db, userId }: Scope): Promise<ReviewItem[]> {
  return (await db.all('SELECT * FROM review_items WHERE user_id = ? ORDER BY due_at', userId) as Array<Record<string, unknown>>).map(
    rowToReviewItem,
  );
}

export async function getReviewItem({ db, userId }: Scope, id: string): Promise<ReviewItem | undefined> {
  const row = await db.get('SELECT * FROM review_items WHERE id = ? AND user_id = ?', id, userId) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToReviewItem(row) : undefined;
}

async function upsertReviewItem({ db, userId }: Scope, item: ReviewItem): Promise<void> {
  await db.run(`INSERT INTO review_items
       (id, user_id, kind, ref_id, lesson_id, level, state, ease, interval_days, due_at,
        last_review_at, success_count, failure_count, lapses, learning_step, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (id, user_id) DO UPDATE SET
       state = excluded.state,
       ease = excluded.ease,
       interval_days = excluded.interval_days,
       due_at = excluded.due_at,
       last_review_at = excluded.last_review_at,
       success_count = excluded.success_count,
       failure_count = excluded.failure_count,
       lapses = excluded.lapses,
       learning_step = excluded.learning_step`, item.id,
    userId,
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
export async function ensureReviewItems(scope: Scope, targets: TargetSpec[]): Promise<ReviewItem[]> {
  const created: ReviewItem[] = [];
  for (const target of targets) {
    const id = reviewItemId(target.kind, target.refId);
    if (await getReviewItem(scope, id)) continue;
    const item = createReviewItem({
      id,
      kind: target.kind,
      refId: target.refId,
      level: target.level,
      lessonId: target.lessonId,
      difficulty: target.difficulty,
    });
    await upsertReviewItem(scope, item);
    created.push(item);
  }
  return created;
}

export async function gradeReviewItem(scope: Scope, id: string, grade: RecallGrade): Promise<ReviewItem | undefined> {
  const item = await getReviewItem(scope, id);
  if (!item) return undefined;
  const next = scheduleReview(item, grade);
  await upsertReviewItem(scope, next);
  return next;
}

/* ------------------------------------------------------------------ *
 * Attempts, mistakes and study days
 * ------------------------------------------------------------------ */

export type AttemptContext = 'lesson' | 'mastery' | 'review' | 'checkpoint' | 'practice' | 'scenario';

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
  /**
   * Minutes from UTC where the answer was typed, so it is filed under the
   * learner's own calendar day rather than under a UTC one. Absent means UTC,
   * which is what every row written before this existed already means.
   */
  tzOffsetMinutes?: number;
}

export interface AttemptResult {
  attemptId: number;
  reviewItems: ReviewItem[];
  grade: RecallGrade;
  lessonProgress?: LessonProgress;
  mistakeId?: string;
}

const CREDIT_VERDICTS = new Set<Verdict>(['correct', 'accepted-variant']);

export async function recordAttempt(scope: Scope, input: AttemptInput, now = new Date()): Promise<AttemptResult> {
  const { db, userId } = scope;
  const iso = now.toISOString();
  const day = localDay(now, plausibleOffset(input.tzOffsetMinutes));

  return db.transaction(async () => {
    // RETURNING rather than a last-insert-rowid lookup: SQLite and Postgres
    // both support it, and it is the only portable way to get the new id.
    const inserted = await db.get<{ id: number }>(`INSERT INTO attempts
           (created_at, user_id, context, lesson_id, exercise_id, step_id, prompt, expected, given,
            verdict, credit, categories, hints_used, revealed, is_retype, duration_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`, iso,
        userId,
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
    await db.run(`INSERT INTO study_days (day, user_id, seconds_active, answers, correct)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT (day, user_id) DO UPDATE SET
         seconds_active = study_days.seconds_active + excluded.seconds_active,
         answers = study_days.answers + 1,
         correct = study_days.correct + excluded.correct`, day, userId, Math.min(300, Math.round((input.durationMs ?? 0) / 1000)), wasCorrect ? 1 : 0);

    // Step outcome for the lesson mastery rules.
    let lessonProgress: LessonProgress | undefined;
    if (input.lessonId && !input.isRetype) {
      await ensureLessonState(scope, input.lessonId, iso);
      const prior = await db.get('SELECT * FROM step_outcomes WHERE lesson_id = ? AND step_id = ? AND user_id = ?', input.lessonId, input.stepId, userId) as Record<string, unknown> | undefined;

      const firstTryCorrect = prior
        ? Number(prior.first_try_correct) === 1
        : CREDIT_VERDICTS.has(input.verdict) && input.hintsUsed === 0 && !input.revealed;

      await db.run(`INSERT INTO step_outcomes
           (lesson_id, step_id, user_id, attempts, first_try_correct, best_credit, resolved, hints_used, revealed, updated_at)
         VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (lesson_id, step_id, user_id) DO UPDATE SET
           attempts = step_outcomes.attempts + 1,
           first_try_correct = ?,
           best_credit = GREATEST(step_outcomes.best_credit, excluded.best_credit),
           resolved = GREATEST(step_outcomes.resolved, excluded.resolved),
           hints_used = GREATEST(step_outcomes.hints_used, excluded.hints_used),
           revealed = GREATEST(step_outcomes.revealed, excluded.revealed),
           updated_at = excluded.updated_at`, input.lessonId,
        input.stepId,
        userId,
        firstTryCorrect ? 1 : 0,
        input.credit,
        input.resolved ? 1 : 0,
        input.hintsUsed,
        input.revealed ? 1 : 0,
        iso,
        firstTryCorrect ? 1 : 0,);
    } else if (input.lessonId && input.isRetype && input.resolved) {
      // A successful retyping closes the step without changing its first-try record.
      await db.run(`UPDATE step_outcomes SET resolved = 1, updated_at = ? WHERE lesson_id = ? AND step_id = ? AND user_id = ?`, iso, input.lessonId, input.stepId, userId);
    }

    // Mistake bank.
    let mistakeId: string | undefined;
    if (!input.isRetype && input.categories.length > 0) {
      mistakeId = await upsertMistake(scope, input, iso);
    } else if (input.isRetype && CREDIT_VERDICTS.has(input.verdict)) {
      await creditRetype(scope, input, iso);
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
        let item = await getReviewItem(scope, id);
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
        await upsertReviewItem(scope, next);
        reviewItems.push(next);
      }
    }

    if (input.lessonId) lessonProgress = await getLessonProgress(scope, input.lessonId);
    return { attemptId, reviewItems, grade, lessonProgress, mistakeId };
  });
}

function mistakeKey(category: ErrorCategory, expected: string, stepId: string): string {
  return createHash('sha1').update(`${category}|${expected}|${stepId}`).digest('hex').slice(0, 16);
}

async function upsertMistake({ db, userId }: Scope, input: AttemptInput, iso: string): Promise<string> {
  // The primary category is the most specific grammatical one available.
  const category = input.categories[0]!;
  const id = mistakeKey(category, input.expected, input.stepId);
  await db.run(`INSERT INTO mistakes
       (id, user_id, category, expected, last_given, step_id, lesson_id, occurrences, corrected_count, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?, ?)
     ON CONFLICT (id, user_id) DO UPDATE SET
       occurrences = mistakes.occurrences + 1,
       last_given = excluded.last_given,
       last_seen_at = excluded.last_seen_at,
       resolved_at = NULL`, id,
    userId,
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
async function creditRetype({ db, userId }: Scope, input: AttemptInput, iso: string): Promise<void> {
  await db.run(`UPDATE mistakes
     SET corrected_count = corrected_count + 1, last_seen_at = ?
     WHERE step_id = ? AND expected = ? AND user_id = ?`, iso, input.stepId, input.expected, userId);
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

export async function listMistakes({ db, userId }: Scope, includeResolved = false): Promise<MistakeRecord[]> {
  const sql = includeResolved
    ? 'SELECT * FROM mistakes WHERE user_id = ? ORDER BY last_seen_at DESC'
    : 'SELECT * FROM mistakes WHERE user_id = ? AND resolved_at IS NULL ORDER BY occurrences DESC, last_seen_at DESC';
  return (await db.all(sql, userId) as Array<Record<string, unknown>>).map((row) => ({
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

export async function resolveMistake({ db, userId }: Scope, id: string): Promise<void> {
  await db.run('UPDATE mistakes SET resolved_at = ? WHERE id = ? AND user_id = ?', new Date().toISOString(), id, userId);
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

export async function recordCheckpointResult({ db, userId }: Scope, input: CheckpointResultInput): Promise<void> {
  await db.run(`INSERT INTO checkpoint_results (checkpoint_id, user_id, scope, target_id, accuracy, passed, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, input.checkpointId,
    userId,
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

export async function listCheckpointResults({ db, userId }: Scope): Promise<CheckpointResult[]> {
  return (
    await db.all('SELECT checkpoint_id, accuracy, passed, created_at FROM checkpoint_results WHERE user_id = ? ORDER BY created_at DESC', userId) as Array<Record<string, unknown>>
  ).map((row) => ({
    checkpointId: String(row.checkpoint_id),
    accuracy: Number(row.accuracy),
    passed: Number(row.passed) === 1,
    createdAt: String(row.created_at),
  }));
}

/* ------------------------------------------------------------------ *
 * Real Life scenario runs
 * ------------------------------------------------------------------ */

export interface ScenarioRunInput {
  scriptId: string;
  turns: number;
  firstTryCorrect: number;
}

export interface ScenarioRun {
  scriptId: string;
  runs: number;
  turns: number;
  firstTryCorrect: number;
  lastAccuracy: number;
  bestAccuracy: number;
  firstRunAt: string;
  lastRunAt: string;
}

/**
 * Record a finished conversation.
 *
 * The accuracy stored is this run's, and `best_accuracy` only ever goes up —
 * a scenario is meant to be replayed, and GREATEST() is spelled differently in
 * the two dialects, so the comparison happens here where it is readable.
 */
export async function recordScenarioRun(
  { db, userId }: Scope,
  input: ScenarioRunInput,
  when = new Date(),
): Promise<void> {
  const now = when.toISOString();
  const turns = Math.max(0, Math.round(input.turns));
  const correct = Math.max(0, Math.min(turns, Math.round(input.firstTryCorrect)));
  const accuracy = turns > 0 ? correct / turns : 0;
  await db.run(
    `INSERT INTO scenario_runs
       (script_id, user_id, runs, turns, first_try_correct, last_accuracy, best_accuracy, first_run_at, last_run_at)
     VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (script_id, user_id) DO UPDATE SET
       runs              = scenario_runs.runs + 1,
       turns             = excluded.turns,
       first_try_correct = excluded.first_try_correct,
       last_accuracy     = excluded.last_accuracy,
       best_accuracy     = CASE
                             WHEN excluded.best_accuracy > scenario_runs.best_accuracy
                             THEN excluded.best_accuracy ELSE scenario_runs.best_accuracy
                           END,
       last_run_at       = excluded.last_run_at`,
    input.scriptId,
    userId,
    turns,
    correct,
    accuracy,
    accuracy,
    now,
    now,
  );
}

export async function listScenarioRuns({ db, userId }: Scope): Promise<ScenarioRun[]> {
  return (
    (await db.all(
      /*
       * The second ORDER BY column is not decoration.
       *
       * last_run_at is an ISO string with millisecond precision, and two
       * conversations finished inside the same millisecond tie on it. A tie
       * leaves the order up to the engine, and SQLite and Postgres resolve it
       * differently — which is exactly how CI caught this, with the two
       * databases handing back the same two rows in opposite orders. Most
       * recent first, then by id, is a total order on both.
       */
      `SELECT script_id, runs, turns, first_try_correct, last_accuracy, best_accuracy, first_run_at, last_run_at
         FROM scenario_runs WHERE user_id = ? ORDER BY last_run_at DESC, script_id ASC`,
      userId,
    )) as Array<Record<string, unknown>>
  ).map((row) => ({
    scriptId: String(row.script_id),
    runs: Number(row.runs),
    turns: Number(row.turns),
    firstTryCorrect: Number(row.first_try_correct),
    lastAccuracy: Number(row.last_accuracy),
    bestAccuracy: Number(row.best_accuracy),
    firstRunAt: String(row.first_run_at),
    lastRunAt: String(row.last_run_at),
  }));
}

export async function setFavorite({ db, userId }: Scope, vocabId: string, favorite: boolean): Promise<void> {
  await db.run(`INSERT INTO word_flags (vocab_id, user_id, favorite, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (vocab_id, user_id) DO UPDATE SET favorite = excluded.favorite, updated_at = excluded.updated_at`, vocabId, userId, favorite ? 1 : 0, new Date().toISOString());
}

export async function listFavorites({ db, userId }: Scope): Promise<string[]> {
  return (await db.all('SELECT vocab_id FROM word_flags WHERE favorite = 1 AND user_id = ?', userId) as Array<{
    vocab_id: string;
  }>).map((row) => row.vocab_id);
}

export async function addStudyTime(
  { db, userId }: Scope,
  seconds: number,
  now = new Date(),
  tzOffsetMinutes = 0,
): Promise<void> {
  const day = localDay(now, plausibleOffset(tzOffsetMinutes));
  await db.run(`INSERT INTO study_days (day, user_id, seconds_active, answers, correct) VALUES (?, ?, ?, 0, 0)
     ON CONFLICT (day, user_id) DO UPDATE SET seconds_active = study_days.seconds_active + excluded.seconds_active`, day, userId, Math.max(0, Math.min(3600, Math.round(seconds))));
}

export interface StudyDay {
  day: string;
  secondsActive: number;
  answers: number;
  correct: number;
}

export async function listStudyDays({ db, userId }: Scope, limit = 120): Promise<StudyDay[]> {
  return (
    await db.all('SELECT * FROM study_days WHERE user_id = ? ORDER BY day DESC LIMIT ?', userId, limit) as Array<
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

export async function listRecentAttempts({ db, userId }: Scope, limit = 50): Promise<AttemptSummary[]> {
  return (
    await db.all(`SELECT step_id, expected, given, verdict, categories, is_retype, created_at, lesson_id
         FROM attempts WHERE user_id = ? ORDER BY id DESC LIMIT ?`, userId, limit) as Array<Record<string, unknown>>
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

export async function getStats(scope: Scope, now = new Date(), tzOffsetMinutes = 0): Promise<Stats> {
  const { db, userId } = scope;
  const totals = await db.get(`SELECT COUNT(*) AS answers,
              SUM(CASE WHEN verdict IN ('correct','accepted-variant') AND revealed = 0 THEN 1 ELSE 0 END) AS correct,
              SUM(CASE WHEN is_retype = 1 AND verdict IN ('correct','accepted-variant') THEN 1 ELSE 0 END) AS retypes
       FROM attempts WHERE user_id = ?`, userId) as Record<string, unknown>;

  const firstTry = await db.get(`SELECT COUNT(*) AS answers,
              SUM(CASE WHEN verdict IN ('correct','accepted-variant') AND revealed = 0 THEN 1 ELSE 0 END) AS correct
       FROM attempts WHERE user_id = ? AND is_retype = 0`, userId) as Record<string, unknown>;

  const study = await db.get('SELECT COALESCE(SUM(seconds_active), 0) AS seconds, COUNT(*) AS days FROM study_days WHERE user_id = ?', userId) as Record<string, unknown>;

  const categories = await db.all(`SELECT category, SUM(occurrences) AS count FROM mistakes
       WHERE user_id = ? GROUP BY category ORDER BY count DESC`, userId) as Array<Record<string, unknown>>;

  const answers = Number(firstTry.answers ?? 0);
  const correct = Number(firstTry.correct ?? 0);

  return {
    totalAnswers: Number(totals.answers ?? 0),
    correctAnswers: correct,
    accuracy: answers > 0 ? correct / answers : 0,
    totalStudySeconds: Number(study.seconds ?? 0),
    studyDays: Number(study.days ?? 0),
    streak: await computeStreak(scope, now, tzOffsetMinutes),
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
export async function computeStreak(
  { db, userId }: Scope,
  now = new Date(),
  tzOffsetMinutes = 0,
): Promise<number> {
  const days = (
    await db.all('SELECT day FROM study_days WHERE answers > 0 AND user_id = ?', userId) as Array<{
      day: string;
    }>
  ).map((row) => row.day);
  // The rule itself is in the pure core, because the dashboard counts the same
  // thing against the browser's own calendar and the two must not disagree.
  return streakOn(days, localDay(now, plausibleOffset(tzOffsetMinutes)));
}

/**
 * Start again — for one learner.
 *
 * In a household this has to be per person: wiping the whole database because
 * somebody wanted their own fresh start would take everyone else's work with
 * it. The learner's own row in `learners` and their profile stay, because they
 * are still here; it is their progress that goes.
 */
export async function resetAll({ db, userId }: Scope): Promise<void> {
  for (const table of [
    'attempts',
    'mistakes',
    'review_items',
    'step_outcomes',
    'lesson_state',
    'study_days',
    'checkpoint_results',
    'word_flags',
    'scenario_runs',
  ]) {
    await db.run(`DELETE FROM ${table} WHERE user_id = ?`, userId);
  }
}

/* ------------------------------------------------------------------ *
 * Credentials
 *
 * The password hash and the session secret live in the database so that a
 * hosted deployment needs no local tooling to set a password: it is chosen in
 * the browser on first visit and can be changed from Settings. Environment
 * variables still take precedence for anyone who prefers to configure them
 * that way.
 * ------------------------------------------------------------------ */

/** The stored hash for the single account, if a password has been set. */
export async function getPasswordHash(db: Db): Promise<string | null> {
  const row = await db.get<{ password_hash: string | null }>(
    'SELECT password_hash FROM users WHERE id = 1',
  );
  return row?.password_hash ?? null;
}

export async function setPasswordHash(db: Db, hash: string): Promise<void> {
  await db.run('UPDATE users SET password_hash = ?, password_set_at = ? WHERE id = 1', hash, new Date().toISOString());
}

/**
 * The session-signing key, generated once and kept.
 *
 * Stored rather than derived so that sessions survive a restart and a redeploy.
 * Deleting the row signs everyone out, which is how access gets revoked
 * without touching any hosting settings.
 */
export async function getOrCreateSessionSecret(db: Db): Promise<string> {
  const existing = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'session_secret');
  if (existing?.value) return existing.value;
  const secret = randomBytes(32).toString('hex');
  // ON CONFLICT DO NOTHING, then read back: two cold serverless invocations can
  // reach this at the same moment, and they must end up agreeing on one secret
  // rather than each storing its own and invalidating the other's sessions.
  await db.run(
    `INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING`,
    'session_secret',
    secret,
  );
  const stored = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'session_secret');
  return stored?.value ?? secret;
}

export async function clearSessionSecret(db: Db): Promise<void> {
  await db.run('DELETE FROM meta WHERE key = ?', 'session_secret');
}
