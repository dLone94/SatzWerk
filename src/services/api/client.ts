import type { ErrorCategory, TeachingLanguage } from '../../content/types.ts';
import type { LessonProgress } from '../../core/progress/lesson.ts';
import type { RecallGrade, ReviewItem, ReviewKind } from '../../core/srs/scheduler.ts';
import type { Verdict } from '../../core/validation/validate.ts';
import { existingPushEndpoint } from '../push/index.ts';
import type { DailyRun, DailyRunInput, LearningGoal } from '../../core/progress/daily.ts';
import type { CefrLevel } from '../../content/types.ts';

/** Typed client for the SatzWerk API. One place that knows about fetch. */

export interface Profile {
  teachingLanguage: TeachingLanguage;
  dailyTargetMinutes: number;
  displayName: string | null;
  onboarded: boolean;
  createdAt: string;
  learningGoal?: LearningGoal;
  practiceLevel?: CefrLevel | null;
  weeklyTargetDays?: number;
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
  dailyRuns?: DailyRun[];
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
  /**
   * Whether the validator asked for the answer to be typed again. Sent because
   * 'accepted-with-note' covers both a forgotten full stop, which is a right
   * answer, and "ae" for "ä", which is not, and only the validator knows which.
   * Without it the server treats every note as needing a retype.
   */
  requireRetype?: boolean;
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

/**
 * How much of an answer's text the server keeps: it stores the first 500
 * characters of the prompt, the expected answer and what was typed.
 */
export const ATTEMPT_TEXT_LIMIT = 500;

/**
 * An answer cut to what the server keeps, before it is queued or sent.
 *
 * Nothing stops a learner pasting a whole page into an answer box, and the
 * whole page went into the queue and out on the wire, where a body over the
 * server's limit was refused — the answer lost over characters the database
 * would have thrown away anyway.
 */
export function boundedAttempt(payload: AttemptPayload): AttemptPayload {
  const cut = (text: string) => (text.length > ATTEMPT_TEXT_LIMIT ? text.slice(0, ATTEMPT_TEXT_LIMIT) : text);
  return {
    ...payload,
    expected: cut(payload.expected),
    given: cut(payload.given),
    ...(payload.prompt === undefined ? {} : { prompt: cut(payload.prompt) }),
  };
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
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE = '/api';

/**
 * Sent with every request the app makes.
 *
 * The server refuses a write that cannot show it came from the app, because
 * an ordinary form on any other web page could otherwise post to it — set a
 * password on a local copy, or wipe the learner's progress. Another page
 * cannot send a custom header like this one without the server's permission,
 * which it never gives. Bodyless posts (reset, logout) carry no Content-Type,
 * so this header is what vouches for them.
 */
export const CLIENT_HEADERS = { 'X-Requested-With': 'SatzWerk' } as const;

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
 * take longer than ten seconds and still save the write. The server saves an
 * acknowledgement with each write's idempotency key so a retry is safe.
 */
const WRITE_TIMEOUT_MS = REQUEST_TIMEOUT_MS;

/**
 * For the German Coach: longer than the server's own deadline for the model
 * (server/ai-claude.ts) with a cold start on top, so whatever the server says —
 * the explanation, its note that the model could not be reached, or the
 * rule-based writing review — arrives before the browser stops listening.
 */
export const COACH_TIMEOUT_MS = 35_000;

/** What a timeout says when nothing more specific is known about the request. */
const SLOW_SERVER = 'The server may still be starting up, or it cannot reach its database.';

/** Header naming a write, the same on every try of it. See `QueuedWrite.id`. */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

/**
 * Header naming the learner a request belongs to.
 *
 * Every tab in a browser shares the cookie that says who is studying, so
 * adding or choosing somebody in one tab changed it under every other tab: a
 * tab still showing the first learner filed its next answer under the new
 * one. So a tab says who it is showing on everything it sends, and a queued
 * write says who it was made for, whichever tab ends up sending it.
 *
 * The reminder switch (src/services/push) sends no name, on purpose. A
 * browser has one push subscription however many tabs it has open, so it
 * belongs to whoever the browser was last handed to — the cookie — and the
 * server moves it there on every switch.
 */
export const LEARNER_HEADER = 'X-SatzWerk-Learner';

/** The learner this tab is showing, once it knows; see `showingLearner`. */
let tabLearner: number | undefined;

/**
 * Say which learner this tab is showing from now on. Called when the household
 * is loaded and on every switch; until then requests carry no name and the
 * server goes by the cookie, which is how a fresh tab finds out who it is.
 */
export function showingLearner(id: number | undefined): void {
  tabLearner = id;
}

/** The learner this tab is showing, or undefined before it has loaded. */
export function learnerShown(): number | undefined {
  return tabLearner;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
  whenSlow = SLOW_SERVER,
): Promise<T> {
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
        ...CLIENT_HEADERS,
        ...(tabLearner === undefined ? {} : { [LEARNER_HEADER]: String(tabLearner) }),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === 'TimeoutError';
    throw new ApiError(
      timedOut
        ? `${what} did not answer within ${timeoutMs / 1000} seconds. ${whenSlow}`
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
        response.status, response.headers.get('x-request-id') ?? undefined,
      );
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `${what} failed with ${response.status}`;
    throw new ApiError(message, response.status, response.headers.get('x-request-id') ?? undefined);
  }
  return payload as T;
}

const post = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

/**
 * A question for the German Coach. A slow model is not a database that cannot
 * be reached, and saying so sent people looking for the wrong problem. The
 * text is for whoever reads the console; the coach's screens tell the learner
 * in their own language (`coachNoAnswer`).
 */
const askCoach = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(
    path,
    { method: 'POST', body: JSON.stringify(body) },
    COACH_TIMEOUT_MS,
    'The German Coach is slow to answer right now. Nothing you did is lost; try again in a moment.',
  );

/**
 * A write the outbox can hold: sent with its key, and given up on sooner.
 * `key` is optional so a caller that has none still works. `learner` is who
 * the write was made for, when it waited in the queue; without it the write
 * goes as the learner this tab is showing.
 */
const write = <T>(path: string, body: unknown, key: string | undefined, learner?: number): Promise<T> =>
  request<T>(
    path,
    {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        ...(key ? { [IDEMPOTENCY_HEADER]: key } : {}),
        ...(learner === undefined ? {} : { [LEARNER_HEADER]: String(learner) }),
      },
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
  // With this browser's push endpoint, when it has one, so the phone's
  // reminders move to the learner who is studying on it now.
  addLearner: async (name: string) =>
    post<LearnerList>('/learners', { name, endpoint: await existingPushEndpoint() }),
  studyAs: async (id: number) =>
    post<LearnerList>('/learners/select', { id, endpoint: await existingPushEndpoint() }),
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

  // Bounded here as well as when queued, for an answer queued by a version of
  // the app that did not bound it and is still waiting on this phone.
  recordAttempt: (payload: AttemptPayload, key?: string, learner?: number) =>
    write<AttemptResponse>('/attempts', boundedAttempt(payload), key, learner),

  markSectionSeen: (lessonId: string, sectionId: string, key?: string, learner?: number) =>
    write<LessonProgress>(
      `/lessons/${encodeURIComponent(lessonId)}/sections/${encodeURIComponent(sectionId)}`,
      undefined,
      key,
      learner,
    ),

  recordMastery: (lessonId: string, accuracy: number, passAccuracy: number, key?: string, learner?: number) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/mastery`, { accuracy, passAccuracy }, key, learner),

  recordRecovery: (lessonId: string, key?: string, learner?: number) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/recovery`, undefined, key, learner),

  completeLesson: (lessonId: string, key?: string, learner?: number) =>
    write<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/complete`, undefined, key, learner),

  ensureReviewItems: (targets: TargetSpec[]) =>
    post<{ created: ReviewItem[]; reviewItems: ReviewItem[] }>('/reviews/ensure', { targets }),

  /**
   * `gradedAt` is when the learner graded it. A grade given offline and sent
   * hours later is scheduled from the moment of recall, not of delivery.
   */
  gradeReview: (id: string, grade: RecallGrade, gradedAt?: string, key?: string, learner?: number) =>
    write<ReviewItem>(`/reviews/${encodeURIComponent(id)}/grade`, { grade, gradedAt }, key, learner),

  resolveMistake: (id: string) => post<MistakeRecord[]>(`/mistakes/${encodeURIComponent(id)}/resolve`),

  setFavorite: (vocabId: string, favorite: boolean) =>
    post<{ favorites: string[] }>(`/vocabulary/${encodeURIComponent(vocabId)}/favorite`, { favorite }),

  recordCheckpoint: (payload: CheckpointPayload, key?: string, learner?: number) =>
    write<{ results: CheckpointResult[] }>('/checkpoints', payload, key, learner),

  recordScenarioRun: (payload: ScenarioRunPayload, key?: string, learner?: number) =>
    write<{ scenarioRuns: ScenarioRun[] }>('/scenario-runs', payload, key, learner),
  recordDailyRun: (payload: DailyRunInput, key?: string, learner?: number) =>
    write<{ dailyRuns: DailyRun[] }>('/daily-runs', payload, key, learner),

  /**
   * `at` is when the time was spent, which is not when it was sent if it
   * waited for a connection — minutes belong to the day they were studied.
   */
  addStudyTime: (seconds: number, at?: string, tzOffsetMinutes?: number, key?: string, learner?: number) =>
    write<{ stats: Stats; studyDays: StudyDay[] }>('/study', { seconds, at, tzOffsetMinutes }, key, learner),

  coachStatus: () => request<CoachStatus>('/coach/status'),

  reviewWriting: (text: string, language: TeachingLanguage, level: string) =>
    askCoach<WritingEvaluation>('/coach/writing', { text, language, level }),

  explainMistake: (payload: {
    expected: string;
    given: string;
    categories: ErrorCategory[];
    language: TeachingLanguage;
    level: string;
  }) => askCoach<MistakeExplanation>('/coach/explain', payload),

  reset: () => post<AppStateSnapshot>('/reset'),
};
