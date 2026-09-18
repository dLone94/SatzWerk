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

export interface AppStateSnapshot {
  profile: Profile;
  lessons: LessonProgress[];
  reviewItems: ReviewItem[];
  mistakes: MistakeRecord[];
  favorites: string[];
  stats: Stats;
  studyDays: StudyDay[];
  checkpointResults: CheckpointResult[];
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
  context: 'lesson' | 'mastery' | 'review' | 'checkpoint' | 'practice';
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
}

export interface WritingEvaluation {
  engine: 'rules' | 'ai';
  findings: CoachFinding[];
  checksApplied: Array<{ en: string; bg: string }>;
  unknownWords: string[];
  note: { en: string; bg: string };
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: 'same-origin',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    const timedOut = cause instanceof DOMException && cause.name === 'TimeoutError';
    throw new ApiError(
      timedOut
        ? `The server did not answer within ${REQUEST_TIMEOUT_MS / 1000} seconds. It may still be starting up, or it cannot reach its database.`
        : `Could not reach the server: ${cause instanceof Error ? cause.message : String(cause)}`,
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
          ? `The server sent something that is not JSON: ${firstLine}`
          : `The server failed with HTTP ${response.status}: ${firstLine || response.statusText}`,
        response.status,
      );
    }
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

const post = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export interface SessionState {
  /** Whether this deployment asks for a password at all. */
  required: boolean;
  signedIn: boolean;
  /** Hosted, but no password chosen yet: show the setup screen. */
  needsSetup?: boolean;
  /** False when the password comes from an environment variable. */
  canChangePassword?: boolean;
}

export const api = {
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

  recordAttempt: (payload: AttemptPayload) => post<AttemptResponse>('/attempts', payload),

  markSectionSeen: (lessonId: string, sectionId: string) =>
    post<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/sections/${encodeURIComponent(sectionId)}`),

  recordMastery: (lessonId: string, accuracy: number, passAccuracy: number) =>
    post<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/mastery`, { accuracy, passAccuracy }),

  recordRecovery: (lessonId: string) =>
    post<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/recovery`),

  completeLesson: (lessonId: string) =>
    post<LessonProgress>(`/lessons/${encodeURIComponent(lessonId)}/complete`),

  ensureReviewItems: (targets: TargetSpec[]) =>
    post<{ created: ReviewItem[]; reviewItems: ReviewItem[] }>('/reviews/ensure', { targets }),

  gradeReview: (id: string, grade: RecallGrade) =>
    post<ReviewItem>(`/reviews/${encodeURIComponent(id)}/grade`, { grade }),

  resolveMistake: (id: string) => post<MistakeRecord[]>(`/mistakes/${encodeURIComponent(id)}/resolve`),

  setFavorite: (vocabId: string, favorite: boolean) =>
    post<{ favorites: string[] }>(`/vocabulary/${encodeURIComponent(vocabId)}/favorite`, { favorite }),

  recordCheckpoint: (payload: {
    checkpointId: string;
    scope: string;
    targetId: string;
    accuracy: number;
    passed: boolean;
    detail?: unknown;
  }) => post<{ results: CheckpointResult[] }>('/checkpoints', payload),

  addStudyTime: (seconds: number) =>
    post<{ stats: Stats; studyDays: StudyDay[] }>('/study', { seconds }),

  coachStatus: () => request<CoachStatus>('/coach/status'),

  reviewWriting: (text: string, language: TeachingLanguage, level: string) =>
    post<WritingEvaluation>('/coach/writing', { text, language, level }),

  reset: () => post<AppStateSnapshot>('/reset'),
};
