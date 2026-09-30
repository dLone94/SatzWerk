import type { ErrorCategory, TeachingLanguage } from '../../content/types.ts';
import type { LessonProgress } from '../../core/progress/lesson.ts';
import type { RecallGrade, ReviewItem, ReviewKind } from '../../core/srs/scheduler.ts';
import type { Verdict } from '../../core/validation/validate.ts';

/** Typed client for the SatzWerk API. One place that knows about fetch. */

export interface Profile {
  teachingLanguage: TeachingLanguage;
  dailyTargetMinutes: number;
  displayName: string | null;
  onboarded: boolean;
  createdAt: string;
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

export interface Stats {
  totalAnswers: number;
  correctAnswers: number;
  accuracy: number;
  totalStudySeconds: number;
  studyDays: number;
  streak: number;
  categoryCounts: Array<{ category: ErrorCategory; count: number }>;
  retypedCorrections: number;
}

export interface StudyDay {
  day: string;
  secondsActive: number;
  answers: number;
  correct: number;
}

export interface CheckpointResult {
  checkpointId: string;
  accuracy: number;
  passed: boolean;
  createdAt: string;
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

export interface AppStateSnapshot {
  profile: Profile;
  lessons: LessonProgress[];
  reviewItems: ReviewItem[];
  mistakes: MistakeRecord[];
  favorites: string[];
  stats: Stats;
  studyDays: StudyDay[];
  checkpointResults: CheckpointResult[];
  scenarioRuns: ScenarioRun[];
  serverTime: string;
}

export interface TargetSpec {
  refId: string;
  kind: ReviewKind;
  level: string;
  lessonId?: string;
  difficulty?: number;
}

export interface AttemptPayload {
  context: 'lesson' | 'mastery' | 'review' | 'checkpoint' | 'practice' | 'scenario';
  lessonId?: string;
  exerciseId?: string;
  stepId: string;
  prompt?: string;
  expected: string;
  given: string;
  verdict: Verdict;
  credit: number;
  categories: ErrorCategory[];
  hintsUsed: number;
  revealed: boolean;
  isRetype: boolean;
  resolved: boolean;
  durationMs?: number;
  reviewTargets?: TargetSpec[];
  /**
   * When the answer was typed, as an ISO string. Sent because an answer can
   * wait in the outbox for a connection, and it belongs to the day it was
   * typed rather than the day it was finally delivered. The server uses it
   * only if it is plausible.
   */
  at?: string;
  /**
   * Minutes from UTC where it was typed. Sent for the same reason as `at`: a
   * round finished at half past midnight in Berlin belongs to that Tuesday,
   * and to a UTC clock it is still Monday.
   */
  tzOffsetMinutes?: number;
}

export interface CheckpointPayload {
  checkpointId: string;
  scope: string;
  targetId: string;
  accuracy: number;
  passed: boolean;
  detail?: unknown;
}

export interface ScenarioRunPayload {
  scriptId: string;
  turns: number;
  firstTryCorrect: number;
}

export interface AttemptResponse {
  attemptId: number;
  reviewItems: ReviewItem[];
  grade: RecallGrade;
  lessonProgress?: LessonProgress;
  mistakeId?: string;
  stats: Stats;
}

export interface CoachStatus {
  aiAvailable: boolean;
  provider: string;
  features: Record<string, string>;
}

export interface CoachFinding {
  category: ErrorCategory;
  message: { en: string; bg: string };
  excerpt?: string;
  suggestion?: string;
  /** Written by a model rather than by a deterministic check, so the UI marks it. */
  generated?: boolean;
}

export interface WritingEvaluation {
  engine: 'rules' | 'ai';
  findings: CoachFinding[];
  checksApplied: Array<{ en: string; bg: string }>;
  unknownWords: string[];
  note: { en: string; bg: string };
  generatedLanguage?: TeachingLanguage;
}

/**
 * Why one answer was wrong, written for one teaching path.
 *
 * `explanation` is a plain string, not a bilingual pair: it is generated once,
 * in the language that asked for it. `error` is the other outcome — the call
 * failed, and saying so beats an empty panel.
 */
export interface MistakeExplanation {
  available: boolean;
  explanation?: string;
  language?: TeachingLanguage;
  generated?: boolean;
  error?: { en: string; bg: string };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE = '/api';

/**
 * Long enough for a cold start and a migration, short enough that a request
 * which is never coming back becomes an error the app can show. Without this
 * a hung server leaves the app on its loading screen indefinitely, saying
 * nothing — which is harder to diagnose than any error message.
 */
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * For the writes the outbox can hold. Nobody waits on these any more — the
 * verdict is on screen before they are sent — so giving up sooner would only
 * hand a stuck request back to the outbox to try again. It stays as long as
 * any other request for now: a cold function waking a sleeping database can
 * take longer than ten seconds and still save the write, and until the server
 * recognises a repeat by its idempotency key, the retry would save it twice.
 */
const WRITE_TIMEOUT_MS = REQUEST_TIMEOUT_MS;

/** Header naming a write, the same on every try of it. See `QueuedWrite.id`. */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

async function request<T>(path: string, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  // Named in every failure below. An error that says only "HTTP 404" leaves
  // the one useful fact — *which* request failed — visible in a browser's
  // network panel and nowhere else, so it cannot be reported by whoever hit
  // it. Two rounds of diagnosing a hosted 404 were spent on exactly that.
  const what = `${init?.method ?? 'GET'} ${BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'same-origin',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === 'TimeoutError';
    throw new ApiError(
      timedOut
        ? `${what} did not answer within ${timeoutMs / 1000} seconds. The server may still be starting up, or it cannot reach its database.`
        : `Could not reach the server for ${what}: ${cause instanceof Error ? cause.message : String(cause)}`,
      0,
    );
  }
  const text = await response.text();

  // Not every failure comes back as JSON. A hosting platform answers a crashed
  // function with its own plain-text or HTML page, and parsing that produced
  // `Unexpected token 'A', "A server e"... is not valid JSON` — which says
  // nothing about what went wrong. Report the status and the first line of
  // whatever actually arrived instead.
  let payload: unknown = null;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      const firstLine = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
      throw new ApiError(
        response.ok
          ? `${what} returned something that is not JSON: ${firstLine}`
          : `${what} failed with HTTP ${response.status}: ${firstLine || response.statusText}`,
        response.status,
      );
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `${what} failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

const post = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

/**
 * A write the outbox can hold: sent with its key, and given up on sooner.
 * `key` is optional so a caller that has none still works.
 */
const write = <T>(path: string, body: unknown, key: string | undefined): Promise<T> =>
  request<T>(
    path,
    {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: key ? { [IDEMPOTENCY_HEADER]: key } : undefined,
    },
    WRITE_TIMEOUT_MS,
  );

export interface SessionState {
  /** Whether this deployment asks for a password at all. */
  required: boolean;
  signedIn: boolean;
  /** Hosted, but no password chosen yet: show the setup screen. */
  needsSetup?: boolean;
  /** False when the password comes from an environment variable. */
  canChangePassword?: boolean;
}

export interface Learner {
  id: number;
  name: string;
  createdAt: string;
}

export interface LearnerList {
  learners: Learner[];
  /** The learner this browser is studying as. */
  studyingAs: number;
}

export const api = {
  learners: () => request<LearnerList>('/learners'),
  addLearner: (name: string) => post<LearnerList>('/learners', { name }),
  studyAs: (id: number) => post<LearnerList>('/learners/select', { id }),
  renameLearner: (id: number, name: string) =>
    request<LearnerList>(`/learners/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),

  health: () => request<{ ok: boolean }>('/health'),
  state: () => request<AppStateSnapshot>('/state'),

  /** Public: answers before sign-in, so the app knows whether to ask. */
  session: () => request<SessionState>('/session'),
  login: (password: string) => post<SessionState>('/login', { password }),
  logout: () => post<SessionState>('/logout'),
  /** First run on a hosted copy: choose the password. */
  setupPassword: (password: string) => post<SessionState>('/setup', { password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<SessionState>('/password', { currentPassword, newPassword }),

  updateProfile: (patch: Partial<Pick<Profile, 'teachingLanguage' | 'dailyTargetMinutes' | 'displayName' | 'onboarded'>>) =>
    request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(patch) }),

  recordAttempt: (payload: AttemptPayload, key?: string) => write<AttemptResponse>('/attempts', payload, key),

  markSectionSeen: (lessonId: string, sectionId: string, key?: string) =>
    write<LessonProgress>(
      `/lessons/${encodeURIComponent(lessonId)}/sections/${encodeURIComponent(sectionId)}`,
      undefined,
      key,
    ),

  recordMastery: (lessonId: string, accuracy: number, passAccuracy: number, key?: string) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/mastery`, { accuracy, passAccuracy }, key),

  recordRecovery: (lessonId: string, key?: string) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/recovery`, undefined, key),

  completeLesson: (lessonId: string, key?: string) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/complete`, undefined, key),

  ensureReviewItems: (targets: TargetSpec[]) =>
    post<{ created: ReviewItem[]; reviewItems: ReviewItem[] }>('/reviews/ensure', { targets }),

  /**
   * `gradedAt` is when the learner graded it. A grade given offline and sent
   * hours later is scheduled from the moment of recall, not of delivery.
   */
  gradeReview: (id: string, grade: RecallGrade, gradedAt?: string, key?: string) =>
    write<ReviewItem>(`/reviews/${encodeURIComponent(id)}/grade`, { grade, gradedAt }, key),

  resolveMistake: (id: string) => post<MistakeRecord[]>(`/mistakes/${encodeURIComponent(id)}/resolve`),

  setFavorite: (vocabId: string, favorite: boolean) =>
    post<{ favorites: string[] }>(`/vocabulary/${encodeURIComponent(vocabId)}/favorite`, { favorite }),

  recordCheckpoint: (payload: CheckpointPayload, key?: string) =>
    write<{ results: CheckpointResult[] }>('/checkpoints', payload, key),

  recordScenarioRun: (payload: ScenarioRunPayload, key?: string) =>
    write<{ scenarioRuns: ScenarioRun[] }>('/scenario-runs', payload, key),

  /**
   * `at` is when the time was spent, which is not when it was sent if it
   * waited for a connection — minutes belong to the day they were studied.
   */
  addStudyTime: (seconds: number, at?: string, tzOffsetMinutes?: number, key?: string) =>
    write<{ stats: Stats; studyDays: StudyDay[] }>('/study', { seconds, at, tzOffsetMinutes }, key),

  coachStatus: () => request<CoachStatus>('/coach/status'),

  reviewWriting: (text: string, language: TeachingLanguage, level: string) =>
    post<WritingEvaluation>('/coach/writing', { text, language, level }),

  explainMistake: (payload: {
    expected: string;
    given: string;
    categories: ErrorCategory[];
    language: TeachingLanguage;
    level: string;
  }) => post<MistakeExplanation>('/coach/explain', payload),

  reset: () => post<AppStateSnapshot>('/reset'),
};
