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
  ApiError,
  type AppStateSnapshot,
  type AttemptPayload,
  type CoachStatus,
  type MistakeRecord,
  type Profile,
  type SessionState,
  type Stats,
  type TargetSpec,
} from '../services/api/client.ts';
import * as outbox from '../services/api/outbox.ts';
import { createTtsProvider, type TtsProvider } from '../services/tts/index.ts';
import { createSpeechRecogniser, type SpeechRecogniser } from '../services/speech/recogniser.ts';

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
  /** First run on a hosted copy: set the password there is not one yet. */
  choosePassword: (password: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  signOut: () => Promise<void>;
  profile: Profile;
  lessons: Record<string, LessonProgress>;
  reviewItems: ReviewItem[];
  mistakes: MistakeRecord[];
  favorites: string[];
  stats: Stats;
  studyDays: AppStateSnapshot['studyDays'];
  checkpointResults: AppStateSnapshot['checkpointResults'];
  scenarioRuns: AppStateSnapshot['scenarioRuns'];
  coach: CoachStatus | null;

  lang: TeachingLanguage;
  /** Interface string lookup for the active teaching language. */
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  /** Pick the active language out of an authored bilingual string. */
  say: (text: Bilingual | null | undefined) => string;

  tts: TtsProvider;
  recogniser: SpeechRecogniser;
  lexicon: typeof LEXICON;
  describeNoun: typeof describeNoun;

  reload: () => Promise<void>;
  setTeachingLanguage: (lang: TeachingLanguage) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  submitAttempt: (payload: AttemptPayload) => Promise<void>;
  /** Answers typed but not yet in the database, because the server was away. */
  sync: SyncState;
  /** Send what is waiting now, rather than at the next automatic attempt. */
  syncAnswers: () => Promise<void>;
  /** Stop reporting answers the server refused, once they have been read. */
  dismissRefusedAnswers: () => void;
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
  recordScenarioRun: (scriptId: string, turns: number, firstTryCorrect: number) => Promise<void>;
  resetAll: () => Promise<void>;
  lessonProgress: (lessonId: string) => LessonProgress;
}

export interface SyncState {
  /** Waiting to be sent. Their verdicts were already shown to the learner. */
  pending: number;
  /** The server refused these; they will never be sent. Reported, not hidden. */
  refused: number;
  /**
   * True while the queue is only in memory, because the browser will not store
   * anything. The answers are still held; a reload would lose them.
   */
  atRisk: boolean;
  /** Answers that could not even be held, because the queue is full. */
  lost: number;
}

const NO_PENDING: SyncState = { pending: 0, refused: 0, atRisk: false, lost: 0 };

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

/**
 * How often to try the answers waiting in the outbox. Often enough that a
 * connection coming back mid-lesson is noticed without the learner doing
 * anything; rarely enough that a long stretch with no signal is not a stream
 * of doomed requests.
 */
const SYNC_RETRY_MS = 30_000;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>({ required: false, signedIn: true });
  const [snapshot, setSnapshot] = useState<AppStateSnapshot | null>(null);
  const [coach, setCoach] = useState<CoachStatus | null>(null);

  const [sync, setSync] = useState<SyncState>(NO_PENDING);

  const tts = useMemo(() => createTtsProvider(), []);
  const recogniser = useMemo(() => createSpeechRecogniser(), []);
  const pendingSeconds = useRef(0);
  /** Answers the queue was too full to take. Counted so they can be owned up to. */
  const lostAnswers = useRef(0);
  /** The flush in flight, so the interval and the `online` event share one. */
  const flushing = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    try {
      // `/session` is public, so it answers before sign-in. Asking first means
      // a locked deployment shows a password prompt instead of an error page.
      const current = await api.session();
      setSession(current);
      if (current.needsSetup || (current.required && !current.signedIn)) {
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

  const choosePassword = useCallback(
    async (password: string) => {
      await api.setupPassword(password);
      setReady(false);
      await load();
    },
    [load],
  );

  const changePassword = useCallback(async (current: string, next: string) => {
    setSession(await api.changePassword(current, next));
  }, []);

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

  /** What the outbox currently holds, in the shape the app shows it. */
  const readSync = useCallback(() => {
    const state = outbox.snapshot();
    setSync({
      pending: state.queued.length,
      refused: state.rejected.length,
      atRisk: state.queued.length > 0 && !outbox.isDurable(),
      lost: lostAnswers.current,
    });
  }, []);

  /**
   * Send the answers that are waiting.
   *
   * Afterwards the whole snapshot is fetched again rather than patched: every
   * sent answer moved the streak, the review schedule and possibly the mistake
   * bank, and one request that asks the database what is true beats replaying
   * what each answer ought to have done.
   */
  const flushAnswers = useCallback(async () => {
    if (flushing.current) return flushing.current;
    if (outbox.queuedCount() === 0) {
      readSync();
      return;
    }

    const run = (async () => {
      const outcome = await outbox.flush((payload) => api.recordAttempt(payload));
      if (outcome.sent > 0) {
        try {
          setSnapshot(await api.state());
        } catch {
          // The connection went again between the last answer and this fetch.
          // The numbers stay as they were; nothing is invented to fill the gap.
        }
      }
      readSync();
    })();

    flushing.current = run.finally(() => {
      flushing.current = null;
    });
    return flushing.current;
  }, [readSync]);

  // Try again when the browser says the network is back, and on a timer for
  // the cases it does not say — a captive wifi, a server that was restarting.
  // Gated on having loaded once: flushing before sign-in would meet a row of
  // 401s and mark good answers as refused.
  const loaded = snapshot !== null;
  useEffect(() => {
    readSync();
    if (!loaded) return;
    void flushAnswers();

    const onOnline = () => void flushAnswers();
    window.addEventListener('online', onOnline);
    const timer = window.setInterval(() => {
      if (outbox.queuedCount() > 0) void flushAnswers();
    }, SYNC_RETRY_MS);

    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(timer);
    };
  }, [loaded, flushAnswers, readSync]);

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
      choosePassword,
      changePassword,
      signOut,
      profile,
      lessons,
      reviewItems: snapshot?.reviewItems ?? [],
      mistakes: snapshot?.mistakes ?? [],
      favorites: snapshot?.favorites ?? [],
      stats: snapshot?.stats ?? EMPTY_STATS,
      studyDays: snapshot?.studyDays ?? [],
      checkpointResults: snapshot?.checkpointResults ?? [],
      scenarioRuns: snapshot?.scenarioRuns ?? [],
      coach,
      lang,
      t,
      say,
      tts,
      recogniser,
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

      /**
       * Bank an answer — and never lose it, and never stop the lesson.
       *
       * The verdict has already been decided by the validator in the browser
       * and shown to the learner; this is only the record of it. So a server
       * that cannot be reached is not a reason to refuse an answer somebody
       * typed. It is held, and sent when there is a connection again.
       */
      submitAttempt: async (payload) => {
        // `payload` wins so a caller can state the time itself; none does yet.
        const stamped: AttemptPayload = { at: new Date().toISOString(), ...payload };

        const hold = () => {
          if (!outbox.enqueue(stamped)) lostAnswers.current += 1;
          readSync();
        };

        // Never jump the queue. Earlier answers waiting means this one waits
        // too: the review schedule is computed from one attempt to the next,
        // so sending today's before yesterday's schedules the wrong thing.
        if (outbox.queuedCount() > 0) {
          hold();
          void flushAnswers();
          return;
        }

        let result;
        try {
          result = await api.recordAttempt(stamped);
        } catch (cause) {
          if (outbox.isUnreachable(cause)) {
            hold();
            return;
          }
          // The server was there and said no. Retrying would be refused again,
          // so it is kept as a refusal and reported rather than retried — and
          // the lesson carries on rather than freezing on a dead screen.
          outbox.recordRefusal(cause instanceof Error ? cause.message : String(cause));
          readSync();
          if (cause instanceof ApiError && cause.status === 401) {
            // Signed out somewhere else, or the session expired. Asking the
            // server again puts the password screen up instead of leaving the
            // learner typing into nothing.
            setSession(await api.session());
          }
          return;
        }

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
          try {
            const state = await api.state();
            patchSnapshot({ mistakes: state.mistakes, stats: state.stats });
          } catch {
            // The answer itself is banked; only this refresh missed. The
            // mistake list catches up on the next load.
          }
        }
      },

      sync,
      syncAnswers: flushAnswers,
      dismissRefusedAnswers: () => {
        outbox.clearRejected();
        lostAnswers.current = 0;
        readSync();
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

      recordScenarioRun: async (scriptId, turns, firstTryCorrect) => {
        const result = await api.recordScenarioRun({ scriptId, turns, firstTryCorrect });
        patchSnapshot({ scenarioRuns: result.scenarioRuns });
      },

      resetAll: async () => {
        setSnapshot(await api.reset());
      },
    };
  }, [ready, error, session, signIn, choosePassword, changePassword, signOut, profile, snapshot, coach, lang, t, say, tts, recogniser, load, patchSnapshot, mergeLesson, sync, readSync, flushAnswers]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useApp must be used inside <AppStateProvider>');
  return value;
}
