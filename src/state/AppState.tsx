import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Bilingual, TeachingLanguage } from '../content/types.ts';
import { LEXICON, describeNoun } from '../content/index.ts';
import type { LessonProgress } from '../core/progress/lesson.ts';
import type { RecallGrade, ReviewItem } from '../core/srs/scheduler.ts';
import { tr, type UiKey } from '../i18n.ts';
import {
  api,
  type AppStateSnapshot,
  type AttemptPayload,
  type CoachStatus,
  type MistakeRecord,
  type Profile,
  type SessionState,
  type Stats,
  type TargetSpec,
} from '../services/api/client.ts';
import { createTtsProvider, type TtsProvider } from '../services/tts/index.ts';

/**
 * One context for the whole app.
 *
 * The server owns the truth. Every mutation goes through the API and the
 * response replaces local state, so what the dashboard shows is always what is
 * actually in the database.
 */

export interface AppStateValue {
  ready: boolean;
  error: string | null;
  /** Whether this deployment needs a password, and whether we have one. */
  session: SessionState;
  signIn: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  profile: Profile;
  lessons: Record<string, LessonProgress>;
  reviewItems: ReviewItem[];
  mistakes: MistakeRecord[];
  favorites: string[];
  stats: Stats;
  studyDays: AppStateSnapshot['studyDays'];
  checkpointResults: AppStateSnapshot['checkpointResults'];
  coach: CoachStatus | null;

  lang: TeachingLanguage;
  /** Interface string lookup for the active teaching language. */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Pick the active language out of an authored bilingual string. */
  say: (text: Bilingual | null | undefined) => string;

  tts: TtsProvider;
  lexicon: typeof LEXICON;
  describeNoun: typeof describeNoun;

  reload: () => Promise<void>;
  setTeachingLanguage: (lang: TeachingLanguage) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  submitAttempt: (payload: AttemptPayload) => Promise<void>;
  markSectionSeen: (lessonId: string, sectionId: string) => Promise<void>;
  recordMastery: (lessonId: string, accuracy: number, passAccuracy: number) => Promise<LessonProgress>;
  recordRecovery: (lessonId: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
  ensureReviewItems: (targets: TargetSpec[]) => Promise<void>;
  gradeReview: (id: string, grade: RecallGrade) => Promise<void>;
  resolveMistake: (id: string) => Promise<void>;
  toggleFavorite: (vocabId: string) => Promise<void>;
  recordCheckpoint: (payload: {
    checkpointId: string;
    scope: string;
    targetId: string;
    accuracy: number;
    passed: boolean;
  }) => Promise<void>;
  resetAll: () => Promise<void>;
  lessonProgress: (lessonId: string) => LessonProgress;
}

/**
 * Exported so tests can mount a component with a stub state instead of a live
 * server. Application code should always use `useApp()`.
 */
export const AppStateContext = createContext<AppStateValue | null>(null);

const EMPTY_STATS: Stats = {
  totalAnswers: 0,
  correctAnswers: 0,
  accuracy: 0,
  totalStudySeconds: 0,
  studyDays: 0,
  streak: 0,
  categoryCounts: [],
  retypedCorrections: 0,
};

const DEFAULT_PROFILE: Profile = {
  teachingLanguage: 'en',
  dailyTargetMinutes: 20,
  displayName: null,
  onboarded: false,
  createdAt: new Date().toISOString(),
};

function emptyProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}

function indexLessons(lessons: LessonProgress[]): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = {};
  for (const lesson of lessons) out[lesson.lessonId] = lesson;
  return out;
}

/** How often we flush accumulated active time to the server. */
const STUDY_FLUSH_MS = 60_000;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ required: false, signedIn: true });
  const [snapshot, setSnapshot] = useState<AppStateSnapshot | null>(null);
  const [coach, setCoach] = useState<CoachStatus | null>(null);

  const tts = useMemo(() => createTtsProvider(), []);
  const pendingSeconds = useRef(0);

  const load = useCallback(async () => {
    try {
      // `/session` is public, so it answers before sign-in. Asking first means
      // a locked deployment shows a password prompt instead of an error page.
      const current = await api.session();
      setSession(current);
      if (current.required && !current.signedIn) {
        setError(null);
        return;
      }
      const [state, coachStatus] = await Promise.all([api.state(), api.coachStatus()]);
      setSnapshot(state);
      setCoach(coachStatus);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setReady(true);
    }
  }, []);

  const signIn = useCallback(
    async (password: string) => {
      await api.login(password);
      setReady(false);
      await load();
    },
    [load],
  );

  const signOut = useCallback(async () => {
    await api.logout();
    setSnapshot(null);
    setSession({ required: true, signedIn: false });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Track real time on task and flush it periodically, so "time studied" is
  // measured rather than guessed.
  useEffect(() => {
    let last = Date.now();
    const tick = window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === 'visible') {
        pendingSeconds.current += Math.min(STUDY_FLUSH_MS, now - last) / 1000;
      }
      last = now;
    }, 5_000);

    const flush = window.setInterval(() => {
      const seconds = Math.round(pendingSeconds.current);
      if (seconds < 10) return;
      pendingSeconds.current = 0;
      void api
        .addStudyTime(seconds)
        .then((result) =>
          setSnapshot((current) => (current ? { ...current, stats: result.stats, studyDays: result.studyDays } : current)),
        )
        .catch(() => undefined);
    }, STUDY_FLUSH_MS);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(flush);
    };
  }, []);

  const profile = snapshot?.profile ?? DEFAULT_PROFILE;
  const lang = profile.teachingLanguage;

  const t = useCallback(
    (key: UiKey, vars?: Record<string, string | number>) => tr(key, lang, vars),
    [lang],
  );

  const say = useCallback(
    (text: Bilingual | null | undefined) => (text ? text[lang] : ''),
    [lang],
  );

  const patchSnapshot = useCallback((patch: Partial<AppStateSnapshot>) => {
    setSnapshot((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const mergeLesson = useCallback((progress: LessonProgress) => {
    setSnapshot((current) =>
      current
        ? {
            ...current,
            lessons: [
              ...current.lessons.filter((lesson) => lesson.lessonId !== progress.lessonId),
              progress,
            ],
          }
        : current,
    );
  }, []);

  const value = useMemo<AppStateValue>(() => {
    const lessons = indexLessons(snapshot?.lessons ?? []);

    return {
      ready,
      error,
      session,
      signIn,
      signOut,
      profile,
      lessons,
      reviewItems: snapshot?.reviewItems ?? [],
      mistakes: snapshot?.mistakes ?? [],
      favorites: snapshot?.favorites ?? [],
      stats: snapshot?.stats ?? EMPTY_STATS,
      studyDays: snapshot?.studyDays ?? [],
      checkpointResults: snapshot?.checkpointResults ?? [],
      coach,
      lang,
      t,
      say,
      tts,
      lexicon: LEXICON,
      describeNoun,

      reload: load,

      lessonProgress: (lessonId: string) => lessons[lessonId] ?? emptyProgress(lessonId),

      setTeachingLanguage: async (next) => {
        const updated = await api.updateProfile({ teachingLanguage: next });
        patchSnapshot({ profile: updated });
      },

      updateProfile: async (patch) => {
        const updated = await api.updateProfile(patch);
        patchSnapshot({ profile: updated });
      },

      submitAttempt: async (payload) => {
        const result = await api.recordAttempt(payload);
        setSnapshot((current) => {
          if (!current) return current;
          const byId = new Map(current.reviewItems.map((item) => [item.id, item]));
          for (const item of result.reviewItems) byId.set(item.id, item);
          return {
            ...current,
            stats: result.stats,
            reviewItems: [...byId.values()],
            lessons: result.lessonProgress
              ? [
                  ...current.lessons.filter((lesson) => lesson.lessonId !== result.lessonProgress!.lessonId),
                  result.lessonProgress,
                ]
              : current.lessons,
          };
        });
        // The mistake bank changes shape on a wrong answer or a retype.
        if (result.mistakeId || payload.isRetype) {
          const state = await api.state();
          patchSnapshot({ mistakes: state.mistakes, stats: state.stats });
        }
      },

      markSectionSeen: async (lessonId, sectionId) => {
        mergeLesson(await api.markSectionSeen(lessonId, sectionId));
      },

      recordMastery: async (lessonId, accuracy, passAccuracy) => {
        const progress = await api.recordMastery(lessonId, accuracy, passAccuracy);
        mergeLesson(progress);
        return progress;
      },

      recordRecovery: async (lessonId) => {
        mergeLesson(await api.recordRecovery(lessonId));
      },

      completeLesson: async (lessonId) => {
        mergeLesson(await api.completeLesson(lessonId));
      },

      ensureReviewItems: async (targets) => {
        if (targets.length === 0) return;
        const result = await api.ensureReviewItems(targets);
        patchSnapshot({ reviewItems: result.reviewItems });
      },

      gradeReview: async (id, grade) => {
        const item = await api.gradeReview(id, grade);
        setSnapshot((current) =>
          current
            ? {
                ...current,
                reviewItems: current.reviewItems.map((existing) => (existing.id === item.id ? item : existing)),
              }
            : current,
        );
      },

      resolveMistake: async (id) => {
        const mistakes = await api.resolveMistake(id);
        patchSnapshot({ mistakes });
      },

      toggleFavorite: async (vocabId) => {
        const isFavorite = (snapshot?.favorites ?? []).includes(vocabId);
        const result = await api.setFavorite(vocabId, !isFavorite);
        patchSnapshot({ favorites: result.favorites });
      },

      recordCheckpoint: async (payload) => {
        const result = await api.recordCheckpoint(payload);
        patchSnapshot({ checkpointResults: result.results });
      },

      resetAll: async () => {
        setSnapshot(await api.reset());
      },
    };
  }, [ready, error, session, signIn, signOut, profile, snapshot, coach, lang, t, say, tts, load, patchSnapshot, mergeLesson]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useApp must be used inside <AppStateProvider>');
  return value;
}
