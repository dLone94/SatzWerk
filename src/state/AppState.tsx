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
import {
  applyCompletion,
  applyMastery,
  applyRecoveryRound,
  markSectionSeen as markSectionSeenIn,
  type LessonProgress,
} from '../core/progress/lesson.ts';
import { streakOn, todayHere } from '../core/progress/days.ts';
import { scheduleReview, type RecallGrade, type ReviewItem } from '../core/srs/scheduler.ts';
import { tr, type UiKey } from '../i18n.ts';
import {
  api,
  ApiError,
  type AppStateSnapshot,
  type Learner,
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
import { deviceLanguage, markPageLanguage, rememberLanguage } from '../ui/deviceLanguage.ts';

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
  /**
   * True when the load failed because the server could not be reached at all,
   * rather than because it answered with a problem. A tunnel is not a fault,
   * and the two deserve different screens.
   */
  offline: boolean;
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
  /** Everybody who studies on this copy, and who is studying here now. */
  learners: Learner[];
  studyingAs: number;
  /** Hand the app to somebody else. Refuses while answers are waiting to be saved. */
  studyAs: (id: number) => Promise<'switched' | 'answers-waiting' | 'failed'>;
  addLearner: (name: string) => Promise<void>;
  renameLearner: (id: number, name: string) => Promise<void>;

  /**
   * A write that did not land and is not being held: a preference, a star, a
   * mistake put away. Named so the app can say which one, in the learner's
   * own language, instead of throwing into the console.
   */
  notice: UiKey | null;
  dismissNotice: () => void;

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
  /** True once the server has deleted everything; anything else means it did not. */
  resetAll: () => Promise<boolean | undefined>;
  lessonProgress: (lessonId: string) => LessonProgress;
}

export interface SyncState {
  /** Answers waiting to be sent. Their verdicts were already shown. */
  pending: number;
  /**
   * Everything else waiting: a mastery result, a finished lesson, a
   * conversation played. Counted apart because "answers" is the word that
   * means something to whoever typed them.
   */
  other: number;
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

const NO_PENDING: SyncState = { pending: 0, other: 0, refused: 0, atRisk: false, lost: 0 };

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

/** The days that actually hold answers, which is all a streak is counted from. */
function daysAnswered(studyDays: AppStateSnapshot['studyDays']): string[] {
  return studyDays.filter((day) => day.answers > 0).map((day) => day.day);
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
  const [offline, setOffline] = useState(false);
  const [session, setSession] = useState<SessionState>({ required: false, signedIn: true });
  const [snapshot, setSnapshot] = useState<AppStateSnapshot | null>(null);
  const [coach, setCoach] = useState<CoachStatus | null>(null);

  const [sync, setSync] = useState<SyncState>(NO_PENDING);
  const [notice, setNotice] = useState<UiKey | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [studyingAs, setStudyingAs] = useState(1);

  const tts = useMemo(() => createTtsProvider(), []);
  const recogniser = useMemo(() => createSpeechRecogniser(), []);
  const pendingSeconds = useRef(0);
  /** Answers the queue was too full to take. Counted so they can be owned up to. */
  const lostAnswers = useRef(0);
  /** The flush in flight, so the interval and the `online` event share one. */
  const flushing = useRef<Promise<void> | null>(null);
  /*
   * Lesson progress as it stands *now*, rather than as it stood when React
   * last rendered.
   *
   * Finishing a lesson is two writes in one tick — the mastery result, then the
   * completion — and offline each applies a rule to the progress before it.
   * Read from a render closure, the second one starts from the state before the
   * first and quietly undoes it: the screen said "passed" while the
   * requirement list below it still said the check was not done. Found by
   * looking at the screen, not by a test; there is one for it now.
   */
  const lessonsRef = useRef<Record<string, LessonProgress>>({});
  /** The same, for the review schedule: two grades in a row must compose. */
  const reviewItemsRef = useRef<ReviewItem[]>([]);

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
      const [state, coachStatus, household] = await Promise.all([
        api.state(),
        api.coachStatus(),
        api.learners(),
      ]);
      setSnapshot(state);
      setCoach(coachStatus);
      setLearners(household.learners);
      setStudyingAs(household.studyingAs);
      setError(null);
      setOffline(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      // The same question the outbox asks about a write: was the server not
      // there, or did it say no? Only the first is a tunnel.
      setOffline(outbox.isUnreachable(cause));
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
    let visible = document.visibilityState === 'visible';
    /** Credit the time since the last look, if the app was on screen for it. */
    const accrue = () => {
      const now = Date.now();
      if (visible) pendingSeconds.current += Math.min(STUDY_FLUSH_MS, now - last) / 1000;
      last = now;
      visible = document.visibilityState === 'visible';
    };
    const tick = window.setInterval(accrue, 5_000);

    const flush = window.setInterval(() => {
      const seconds = Math.round(pendingSeconds.current);
      if (seconds < 10) return;
      pendingSeconds.current = 0;
      const at = new Date().toISOString();
      const tzOffsetMinutes = -new Date().getTimezoneOffset();
      void api
        .addStudyTime(seconds, at, tzOffsetMinutes)
        .then((result) =>
          setSnapshot((current) => (current ? { ...current, stats: result.stats, studyDays: result.studyDays } : current)),
        )
        .catch((cause: unknown) => {
          // Time on task used to be dropped on the floor here. It is real
          // measured time, and it belongs to the day it was spent, so it waits
          // with everything else rather than vanishing.
          if (outbox.isUnreachable(cause)) {
            outbox.enqueue({ kind: 'studyTime', seconds, at, tzOffsetMinutes });
          }
        });
    }, STUDY_FLUSH_MS);

    // Closing the app, or switching away from it, used to throw away whatever
    // had not been flushed yet: up to a minute a visit. It goes into the
    // outbox instead, which sends it with everything else.
    const keep = () => {
      const seconds = Math.round(pendingSeconds.current);
      if (seconds < 1) return;
      pendingSeconds.current = 0;
      outbox.enqueue({
        kind: 'studyTime',
        seconds,
        at: new Date().toISOString(),
        tzOffsetMinutes: -new Date().getTimezoneOffset(),
      });
    };
    const onVisibility = () => {
      accrue();
      if (!visible) keep();
    };
    const onPageHide = () => {
      accrue();
      keep();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(tick);
      window.clearInterval(flush);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  // The server's answer is the truth; the mirror above follows it.
  useEffect(() => {
    lessonsRef.current = indexLessons(snapshot?.lessons ?? []);
    reviewItemsRef.current = snapshot?.reviewItems ?? [];
  }, [snapshot]);

  // Before the profile has loaded — the boot, offline, error and password
  // screens — the language last used on this device, not always English. It
  // is read again each time there is no profile, not once at start: signing
  // out clears the profile, and by then the learner may have switched.
  const noSnapshot = snapshot === null;
  const fallbackProfile = useMemo<Profile>(
    () => ({ ...DEFAULT_PROFILE, teachingLanguage: deviceLanguage() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [noSnapshot],
  );
  const profile = snapshot?.profile ?? fallbackProfile;
  const lang = profile.teachingLanguage;
  const knowsLanguage = snapshot !== null;
  useEffect(() => {
    markPageLanguage(lang);
    if (knowsLanguage) rememberLanguage(lang);
  }, [lang, knowsLanguage]);

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

  /**
   * The one place that knows how each held write reaches the server.
   *
   * The outbox itself knows nothing about the API — it is a queue of what
   * happened, in order. This turns an entry back into the request it was.
   */
  const sendWrite = useCallback((write: outbox.PendingWrite): Promise<unknown> => {
    switch (write.kind) {
      case 'attempt':
        return api.recordAttempt(write.payload);
      case 'reviewGrade':
        return api.gradeReview(write.id, write.grade);
      case 'studyTime':
        return api.addStudyTime(write.seconds, write.at, write.tzOffsetMinutes);
      case 'sectionSeen':
        return api.markSectionSeen(write.lessonId, write.sectionId);
      case 'recovery':
        return api.recordRecovery(write.lessonId);
      case 'mastery':
        return api.recordMastery(write.lessonId, write.accuracy, write.passAccuracy);
      case 'complete':
        return api.completeLesson(write.lessonId);
      case 'checkpoint':
        return api.recordCheckpoint(write.payload);
      case 'scenarioRun':
        return api.recordScenarioRun(write.payload);
    }
  }, []);

  /** What the outbox currently holds, in the shape the app shows it. */
  const readSync = useCallback(() => {
    const state = outbox.snapshot();
    const answers = state.queued.filter((item) => item.write.kind === 'attempt').length;
    setSync({
      pending: answers,
      other: state.queued.length - answers,
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
      const outcome = await outbox.flush(sendWrite);
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
  }, [readSync, sendWrite]);

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
    // Coming back to the app sends what was kept when it was put away.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && outbox.queuedCount() > 0) void flushAnswers();
    };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => {
      if (outbox.queuedCount() > 0) void flushAnswers();
    }, SYNC_RETRY_MS);

    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [loaded, flushAnswers, readSync]);

  /**
   * A write the server was there for and said no to.
   *
   * Retrying it would be refused again, so it is kept with its reason and
   * reported rather than queued — and whatever the learner was doing carries
   * on, instead of freezing on a screen that has swallowed their work.
   */
  const refuse = useCallback(
    async (cause: unknown) => {
      outbox.recordRefusal(cause instanceof Error ? cause.message : String(cause));
      readSync();
      if (cause instanceof ApiError && cause.status === 401) {
        // Signed out somewhere else, or the session expired. Asking the server
        // again puts the password screen up instead of leaving somebody typing
        // into nothing.
        setSession(await api.session());
      }
    },
    [readSync],
  );

  const mergeLesson = useCallback((progress: LessonProgress) => {
    lessonsRef.current = { ...lessonsRef.current, [progress.lessonId]: progress };
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

    /**
     * Send a lesson write, or hold it and apply its rule locally.
     *
     * `local` is the same pure function the server applies, so what the learner
     * sees offline is what the database will hold once the queue drains. On a
     * refusal nothing is claimed: the progress comes back unchanged, and the
     * strip at the top of the app reports what was refused.
     */
    const lessonWrite = async (
      lessonId: string,
      send: () => Promise<LessonProgress>,
      write: outbox.PendingWrite,
      local: (prior: LessonProgress) => LessonProgress,
    ): Promise<LessonProgress> => {
      const prior = lessonsRef.current[lessonId] ?? lessons[lessonId] ?? emptyProgress(lessonId);

      const hold = () => {
        const optimistic = local(prior);
        if (!outbox.enqueue(write)) lostAnswers.current += 1;
        mergeLesson(optimistic);
        readSync();
        return optimistic;
      };

      // Never jump the queue. Answers from this very lesson may still be
      // waiting, and the mastery result belongs behind them.
      if (outbox.queuedCount() > 0) {
        const optimistic = hold();
        void flushAnswers();
        return optimistic;
      }

      try {
        const progress = await send();
        mergeLesson(progress);
        return progress;
      } catch (cause) {
        if (outbox.isUnreachable(cause)) return hold();
        await refuse(cause);
        return prior;
      }
    };

    /**
     * A write that is not worth queueing, and not allowed to disappear.
     *
     * Answers go in the outbox because losing one loses work. A preference is
     * different: setting it again costs a tap, and holding it would mean the
     * app disagreeing with the database about what the daily target is until
     * the queue drained. So these are attempted once — and when the attempt
     * fails the app says which one failed, rather than leaving an uncaught
     * rejection in the console and a star that did not fill.
     */
    const reporting = async <T,>(what: UiKey, work: () => Promise<T>): Promise<T | undefined> => {
      try {
        const result = await work();
        setNotice(null);
        return result;
      } catch {
        setNotice(what);
        return undefined;
      }
    };

    return {
      ready,
      error,
      offline,
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
      /*
       * The streak is recounted here, against this browser's calendar.
       *
       * The server counts it too, from the same pure rule, but it has to pick
       * a day without knowing where the phone is — and for the couple of hours
       * each night when those two disagree, the one that matters is the one on
       * the wall behind the learner. Everything else in `stats` is the
       * server's, untouched.
       */
      stats: snapshot
        ? { ...snapshot.stats, streak: streakOn(daysAnswered(snapshot.studyDays), todayHere()) }
        : EMPTY_STATS,
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
        await reporting('notSavedProfile', async () => {
          patchSnapshot({ profile: await api.updateProfile({ teachingLanguage: next }) });
        });
      },

      updateProfile: async (patch) => {
        await reporting('notSavedProfile', async () => {
          patchSnapshot({ profile: await api.updateProfile(patch) });
        });
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
        const stamped: AttemptPayload = {
          at: new Date().toISOString(),
          // Negated, because `getTimezoneOffset` counts from local to UTC and
          // everything downstream counts the other way.
          tzOffsetMinutes: -new Date().getTimezoneOffset(),
          ...payload,
        };

        const hold = () => {
          if (!outbox.enqueue({ kind: 'attempt', payload: stamped })) lostAnswers.current += 1;
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
          await refuse(cause);
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

      learners,
      studyingAs,

      /**
       * Hand the app to somebody else.
       *
       * The refusal is the interesting part. Answers wait in an outbox when
       * the server cannot be reached, and they carry no learner of their own —
       * they would be sent as whoever is studying when the connection returns.
       * Switching with a queue would file one person's sentences under
       * another's name, so it is refused until they are saved, and the caller
       * says why.
       */
      studyAs: async (id) => {
        if (outbox.queuedCount() > 0) {
          await flushAnswers();
          if (outbox.queuedCount() > 0) return 'answers-waiting';
        }
        const switched = await reporting('notSavedLearner', async () => {
          const household = await api.studyAs(id);
          setLearners(household.learners);
          setStudyingAs(household.studyingAs);
          // Everything below belongs to somebody else now.
          setReady(false);
          await load();
          return true;
        });
        return switched ? 'switched' : 'failed';
      },

      addLearner: async (name) => {
        await reporting('notSavedLearner', async () => {
          const household = await api.addLearner(name);
          setLearners(household.learners);
          setStudyingAs(household.studyingAs);
          setReady(false);
          await load();
        });
      },

      renameLearner: async (id, name) => {
        await reporting('notSavedLearner', async () => {
          setLearners((await api.renameLearner(id, name)).learners);
        });
      },

      notice,
      dismissNotice: () => setNotice(null),

      sync,
      syncAnswers: flushAnswers,
      dismissRefusedAnswers: () => {
        outbox.clearRejected();
        lostAnswers.current = 0;
        readSync();
      },

      /*
       * Working through a lesson, and finishing one.
       *
       * Each of these four is a rule applied to numbers the browser already
       * has — which is why `src/core/progress/lesson.ts` holds the rule and the
       * server applies the same function. So when the server cannot be
       * reached, the write is held and the rule is applied here: the learner
       * sees the result they would have seen, and the database agrees when the
       * queue drains. Nothing is guessed at; the arithmetic simply happens one
       * side earlier.
       */

      markSectionSeen: async (lessonId, sectionId) => {
        await lessonWrite(
          lessonId,
          () => api.markSectionSeen(lessonId, sectionId),
          { kind: 'sectionSeen', lessonId, sectionId },
          (prior) => markSectionSeenIn(prior, sectionId),
        );
      },

      // The one write whose value the caller needs: the lesson page shows
      // "passed" or "not yet" from it, so offline it must still answer.
      recordMastery: (lessonId, accuracy, passAccuracy) =>
        lessonWrite(
          lessonId,
          () => api.recordMastery(lessonId, accuracy, passAccuracy),
          { kind: 'mastery', lessonId, accuracy, passAccuracy },
          (prior) => applyMastery(prior, accuracy, passAccuracy, new Date().toISOString()),
        ),

      recordRecovery: async (lessonId) => {
        await lessonWrite(
          lessonId,
          () => api.recordRecovery(lessonId),
          { kind: 'recovery', lessonId },
          (prior) => applyRecoveryRound(prior, new Date().toISOString()),
        );
      },

      completeLesson: async (lessonId) => {
        await lessonWrite(
          lessonId,
          () => api.completeLesson(lessonId),
          { kind: 'complete', lessonId },
          (prior) => applyCompletion(prior, new Date().toISOString()),
        );
      },

      ensureReviewItems: async (targets) => {
        if (targets.length === 0) return;
        await reporting('notSavedReviews', async () => {
          patchSnapshot({ reviewItems: (await api.ensureReviewItems(targets)).reviewItems });
        });
      },

      /**
       * Grading a grammar concept from memory.
       *
       * The scheduler is a pure function both sides use, so a grade given
       * without a connection can be applied here and confirmed later — exactly
       * like a mastery result. Before this, the button simply did nothing and
       * the grade was gone.
       */
      gradeReview: async (id, grade) => {
        const replace = (item: ReviewItem) => {
          // The mirror first, so grading a second concept in the same breath
          // starts from the first one's result rather than from before it.
          reviewItemsRef.current = reviewItemsRef.current.map((existing) =>
            existing.id === item.id ? item : existing,
          );
          setSnapshot((current) =>
            current
              ? {
                  ...current,
                  reviewItems: current.reviewItems.map((existing) =>
                    existing.id === item.id ? item : existing,
                  ),
                }
              : current,
          );
        };

        const hold = () => {
          const current = reviewItemsRef.current.find((item) => item.id === id);
          if (!outbox.enqueue({ kind: 'reviewGrade', id, grade })) lostAnswers.current += 1;
          if (current) replace(scheduleReview(current, grade));
          readSync();
        };

        if (outbox.queuedCount() > 0) {
          hold();
          void flushAnswers();
          return;
        }
        try {
          replace(await api.gradeReview(id, grade));
        } catch (cause) {
          if (outbox.isUnreachable(cause)) return hold();
          await refuse(cause);
        }
      },

      resolveMistake: async (id) => {
        await reporting('notSavedMistake', async () => {
          patchSnapshot({ mistakes: await api.resolveMistake(id) });
        });
      },

      toggleFavorite: async (vocabId) => {
        const isFavorite = (snapshot?.favorites ?? []).includes(vocabId);
        await reporting('notSavedFavorite', async () => {
          patchSnapshot({ favorites: (await api.setFavorite(vocabId, !isFavorite)).favorites });
        });
      },

      recordCheckpoint: async (payload) => {
        const hold = () => {
          if (!outbox.enqueue({ kind: 'checkpoint', payload })) lostAnswers.current += 1;
          // The row the server would store is the row we just sent, so showing
          // it is reporting, not guessing. The server's own list replaces it
          // when the queue drains.
          const row = {
            checkpointId: payload.checkpointId,
            accuracy: payload.accuracy,
            passed: payload.passed,
            createdAt: new Date().toISOString(),
          };
          setSnapshot((current) =>
            current ? { ...current, checkpointResults: [...current.checkpointResults, row] } : current,
          );
          readSync();
        };

        if (outbox.queuedCount() > 0) {
          hold();
          void flushAnswers();
          return;
        }
        try {
          const result = await api.recordCheckpoint(payload);
          patchSnapshot({ checkpointResults: result.results });
        } catch (cause) {
          if (outbox.isUnreachable(cause)) return hold();
          await refuse(cause);
        }
      },

      recordScenarioRun: async (scriptId, turns, firstTryCorrect) => {
        const payload = { scriptId, turns, firstTryCorrect };

        const hold = () => {
          if (!outbox.enqueue({ kind: 'scenarioRun', payload })) lostAnswers.current += 1;
          // Unlike a checkpoint row, a scenario's stored figures are an
          // aggregate the server computes across every run. Rather than
          // guessing at it, the Real Life badges stay as they were and the
          // strip says a run is waiting.
          readSync();
        };

        if (outbox.queuedCount() > 0) {
          hold();
          void flushAnswers();
          return;
        }
        try {
          const result = await api.recordScenarioRun(payload);
          patchSnapshot({ scenarioRuns: result.scenarioRuns });
        } catch (cause) {
          if (outbox.isUnreachable(cause)) return hold();
          await refuse(cause);
        }
      },

      // Says whether it worked: Settings used to announce "Progress deleted."
      // under the banner saying nothing was.
      resetAll: async () =>
        (await reporting('notSavedReset', async () => {
          setSnapshot(await api.reset());
          return true;
        })) === true,
    };
  }, [ready, error, offline, session, signIn, choosePassword, changePassword, signOut, profile, snapshot, coach, lang, t, say, tts, recogniser, load, patchSnapshot, mergeLesson, sync, readSync, flushAnswers, refuse, learners, studyingAs, notice]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useApp must be used inside <AppStateProvider>');
  return value;
}
