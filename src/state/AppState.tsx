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
  recordStepOutcome,
  type LessonProgress,
} from '../core/progress/lesson.ts';
import { streakOn, todayHere } from '../core/progress/days.ts';
import { scheduleReview, type RecallGrade, type ReviewItem } from '../core/srs/scheduler.ts';
import { tr, type UiKey } from '../i18n.ts';
import {
  api,
  type AttemptResponse,
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
  resetAll: () => Promise<void>;
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

/**
 * What a held write does to one lesson's progress, by the rule the server
 * applies when it arrives — or nothing, for a write that does not touch a
 * lesson.
 *
 * Answers were the gap. A lesson done in a tunnel held every answer, but none
 * of them reached the lesson's practice record in the browser, so the end of
 * the lesson said "Complete every exercise 0 / 9" to somebody who had just done
 * all nine, skipped the celebration and the recovery round, and never queued
 * the completion.
 */
function heldLessonRule(
  write: outbox.PendingWrite,
): { lessonId: string; apply: (prior: LessonProgress) => LessonProgress } | null {
  const now = new Date().toISOString();
  switch (write.kind) {
    case 'attempt': {
      const attempt = write.payload;
      if (!attempt.lessonId) return null;
      // Only practice is practice. A final-check answer is judged by the
      // mastery result that follows it; filed as a practice step, a failed
      // check lowered the first-try score and forced a recovery round. The
      // server keeps the same rule.
      if (attempt.context !== 'lesson' && attempt.context !== 'practice') return null;
      if (!attempt.isRetype) {
        return {
          lessonId: attempt.lessonId,
          apply: (prior) =>
            recordStepOutcome(prior, {
              stepId: attempt.stepId,
              verdict: attempt.verdict,
              credit: attempt.credit,
              hintsUsed: attempt.hintsUsed,
              revealed: attempt.revealed,
              resolved: attempt.resolved,
              now: attempt.at,
            }),
        };
      }
      if (!attempt.resolved) return null;
      // A successful retype closes the step and leaves its first try alone.
      return {
        lessonId: attempt.lessonId,
        apply: (prior) => {
          const step = prior.practice[attempt.stepId];
          if (!step) return prior;
          return { ...prior, practice: { ...prior.practice, [attempt.stepId]: { ...step, resolved: true } } };
        },
      };
    }
    case 'sectionSeen':
      return { lessonId: write.lessonId, apply: (prior) => markSectionSeenIn(prior, write.sectionId) };
    case 'recovery':
      return { lessonId: write.lessonId, apply: (prior) => applyRecoveryRound(prior, now) };
    case 'mastery':
      return {
        lessonId: write.lessonId,
        apply: (prior) => applyMastery(prior, write.accuracy, write.passAccuracy, now),
      };
    case 'complete':
      return { lessonId: write.lessonId, apply: (prior) => applyCompletion(prior, now) };
    default:
      return null;
  }
}

/** One lesson's progress from the server, with what is still held on top. */
function withHeldLesson(progress: LessonProgress): LessonProgress {
  let next = progress;
  for (const { write } of outbox.snapshot().queued) {
    const rule = heldLessonRule(write);
    if (rule && rule.lessonId === progress.lessonId) next = rule.apply(next);
  }
  return next;
}

/**
 * The server's state, with every write still waiting in the outbox applied on
 * top by the same rules the server will apply when it gets them.
 *
 * Without this, fetching the state while something was still held replaced
 * the result held on the device: the "Lesson complete" screen showed "Pass
 * the final check" unticked, because the flush that fetched the state had
 * started before the result was queued.
 */
function withHeld(state: AppStateSnapshot): AppStateSnapshot {
  const queued = outbox.snapshot().queued;
  if (queued.length === 0) return state;
  const lessons = indexLessons(state.lessons);
  let reviewItems = state.reviewItems;
  for (const { write } of queued) {
    const rule = heldLessonRule(write);
    if (rule) {
      lessons[rule.lessonId] = rule.apply(lessons[rule.lessonId] ?? emptyProgress(rule.lessonId));
    } else if (write.kind === 'reviewGrade') {
      const when = write.gradedAt ? new Date(write.gradedAt) : new Date();
      reviewItems = reviewItems.map((item) => (item.id === write.id ? scheduleReview(item, write.grade, when) : item));
    }
  }
  return { ...state, lessons: Object.values(lessons), reviewItems };
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
  /**
   * True once a write has had to wait — the server was away, or failed — so
   * the next flush that sends anything fetches the whole state afterwards.
   * A write sent straight through needs no such fetch: its own answer is
   * applied as it arrives.
   */
  const replaying = useRef(false);
  /** Set by a 401. Nothing is sent until the learner signs in again. */
  const signedOut = useRef(false);
  /** Something was queued while a flush was already running. */
  const flushAgain = useRef(false);

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
      setSnapshot(withHeld(state));
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
      const key = outbox.newWriteId();
      void api
        .addStudyTime(seconds, at, tzOffsetMinutes, key)
        .then((result) =>
          setSnapshot((current) => (current ? { ...current, stats: result.stats, studyDays: result.studyDays } : current)),
        )
        .catch((cause: unknown) => {
          // Time on task used to be dropped on the floor here. It is real
          // measured time, and it belongs to the day it was spent, so it waits
          // with everything else rather than vanishing.
          if (outbox.isRetryable(cause) || outbox.needsSignIn(cause)) {
            replaying.current = true;
            outbox.enqueue({ kind: 'studyTime', seconds, at, tzOffsetMinutes }, key);
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

  const replaceReviewItem = useCallback((item: ReviewItem) => {
    // The mirror first, so grading a second concept in the same breath
    // starts from the first one's result rather than from before it.
    reviewItemsRef.current = reviewItemsRef.current.map((existing) => (existing.id === item.id ? item : existing));
    setSnapshot((current) =>
      current
        ? {
            ...current,
            reviewItems: current.reviewItems.map((existing) => (existing.id === item.id ? item : existing)),
          }
        : current,
    );
  }, []);

  /**
   * The one place that knows how each held write reaches the server.
   *
   * The outbox itself knows nothing about the API — it is a queue of what
   * happened, in order. This turns an entry back into the request it was,
   * sent with the id it was queued under as its idempotency key.
   */
  const sendWrite = useCallback((write: outbox.PendingWrite, key: string): Promise<unknown> => {
    switch (write.kind) {
      case 'attempt':
        return api.recordAttempt(write.payload, key);
      case 'reviewGrade':
        return api.gradeReview(write.id, write.grade, write.gradedAt, key);
      case 'studyTime':
        return api.addStudyTime(write.seconds, write.at, write.tzOffsetMinutes, key);
      case 'sectionSeen':
        return api.markSectionSeen(write.lessonId, write.sectionId, key);
      case 'recovery':
        return api.recordRecovery(write.lessonId, key);
      case 'mastery':
        return api.recordMastery(write.lessonId, write.accuracy, write.passAccuracy, key);
      case 'complete':
        return api.completeLesson(write.lessonId, key);
      case 'checkpoint':
        return api.recordCheckpoint(write.payload, key);
      case 'scenarioRun':
        return api.recordScenarioRun(write.payload, key);
    }
  }, []);

  /**
   * What the server said about one write from the queue, applied as it
   * arrives — the same as a write sent directly used to be. Whatever is still
   * waiting behind it is laid back on top, so an answer's response does not
   * take away the result queued after it. Returns true when the change reaches
   * further than the response says (the mistake bank), and the state should
   * be fetched once the queue is empty.
   */
  const applySent = useCallback(
    (write: outbox.PendingWrite, result: unknown): boolean => {
      switch (write.kind) {
        case 'attempt': {
          const response = result as AttemptResponse;
          setSnapshot((current) => {
            if (!current) return current;
            const byId = new Map(current.reviewItems.map((item) => [item.id, item]));
            for (const item of response.reviewItems) byId.set(item.id, item);
            return { ...current, stats: response.stats, reviewItems: [...byId.values()] };
          });
          if (response.lessonProgress) mergeLesson(withHeldLesson(response.lessonProgress));
          // The mistake bank changes shape on a wrong answer or a retype.
          return Boolean(response.mistakeId || write.payload.isRetype);
        }
        case 'reviewGrade':
          replaceReviewItem(result as ReviewItem);
          return false;
        case 'studyTime': {
          const response = result as { stats: Stats; studyDays: AppStateSnapshot['studyDays'] };
          patchSnapshot({ stats: response.stats, studyDays: response.studyDays });
          return false;
        }
        case 'sectionSeen':
        case 'recovery':
        case 'mastery':
        case 'complete':
          mergeLesson(withHeldLesson(result as LessonProgress));
          return false;
        case 'checkpoint':
          patchSnapshot({ checkpointResults: (result as { results: AppStateSnapshot['checkpointResults'] }).results });
          return false;
        case 'scenarioRun':
          patchSnapshot({ scenarioRuns: (result as { scenarioRuns: AppStateSnapshot['scenarioRuns'] }).scenarioRuns });
          return false;
      }
    },
    [mergeLesson, patchSnapshot, replaceReviewItem],
  );

  /** What the outbox currently holds, in the shape the app shows it. */
  const readSync = useCallback(() => {
    const state = outbox.snapshot();
    const answers = state.queued.filter((item) => item.write.kind === 'attempt').length;
    // Study minutes are bookkeeping, not something the learner did and is
    // waiting on. Counted in, they turned "1 answer is waiting" into "2
    // answers" after a reload, and more after each one. They are still sent.
    const bookkeeping = state.queued.filter((item) => item.write.kind === 'studyTime').length;
    setSync({
      pending: answers,
      other: state.queued.length - answers - bookkeeping,
      refused: state.rejected.length,
      atRisk: state.queued.length > 0 && !outbox.isDurable(),
      lost: lostAnswers.current,
    });
  }, []);

  /**
   * The session has ended: say so, so the password screen comes up, and send
   * nothing more until the learner is back. What is waiting stays waiting.
   */
  const sessionEnded = useCallback(async () => {
    signedOut.current = true;
    try {
      const current = await api.session();
      setSession(current);
      signedOut.current = current.required && !current.signedIn;
    } catch {
      // Not reachable to ask. The next try will meet the 401 again and ask
      // again; holding the queue shut on a guess would be worse.
      signedOut.current = false;
    }
  }, []);

  /**
   * Send what is waiting.
   *
   * Each write's own answer is applied as it arrives. When writes had to wait
   * — the server was away — the whole snapshot is fetched once the queue is
   * empty: every held answer moved the streak and possibly the mistake bank,
   * and one request that asks the database what is true beats replaying what
   * each answer ought to have done. Anything still waiting is laid on top of
   * it, so the fetch never takes back a result held on this device.
   */
  const flushAnswers = useCallback(async () => {
    if (flushing.current) {
      // A write queued while a flush is running is sent by that flush,
      // not left for the next timer.
      flushAgain.current = true;
      return flushing.current;
    }
    if (signedOut.current || outbox.queuedCount() === 0) {
      readSync();
      return;
    }

    const run = async () => {
      const wasHeld = replaying.current;
      let sent = 0;
      let refresh = false;
      let stopped: outbox.FlushOutcome['stopped'];
      do {
        flushAgain.current = false;
        const outcome = await outbox.flush(sendWrite, (write, result) => {
          if (applySent(write, result)) refresh = true;
        });
        sent += outcome.sent;
        stopped = outcome.stopped;
        // Keep going while writes arrive behind the pass — the learner answering
        // the next question while the last one was in flight.
      } while (!stopped && outbox.queuedCount() > 0);

      if (stopped) replaying.current = true;
      if (stopped === 'signedOut') await sessionEnded();

      if (sent > 0 && (wasHeld || refresh)) {
        try {
          setSnapshot(withHeld(await api.state()));
          if (outbox.queuedCount() === 0) replaying.current = false;
        } catch {
          // The connection went again between the last answer and this fetch.
          // The numbers stay as they were; nothing is invented to fill the gap.
        }
      }
      readSync();
      return stopped;
    };

    flushing.current = run().then(
      (stopped) => {
        flushing.current = null;
        if (flushAgain.current && !stopped) void flushAnswers();
      },
      () => {
        flushing.current = null;
      },
    );
    return flushing.current;
  }, [readSync, sendWrite, applySent, sessionEnded]);

  // Signing in again sends what waited through the expired session. The
  // snapshot was never cleared, so the effect below that flushes on load does
  // not run again by itself.
  const signIn = useCallback(
    async (password: string) => {
      await api.login(password);
      signedOut.current = false;
      setReady(false);
      await load();
      void flushAnswers();
    },
    [load, flushAnswers],
  );

  const choosePassword = useCallback(
    async (password: string) => {
      await api.setupPassword(password);
      signedOut.current = false;
      setReady(false);
      await load();
      void flushAnswers();
    },
    [load, flushAnswers],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      setSession(await api.changePassword(current, next));
      signedOut.current = false;
      void flushAnswers();
    },
    [flushAnswers],
  );

  // Try again when the browser says the network is back, and on a timer for
  // the cases it does not say — a captive wifi, a server that was restarting.
  // Gated on having loaded once: before sign-in there is nobody to send as.
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
    (cause: unknown) => {
      outbox.recordRefusal(cause instanceof Error ? cause.message : String(cause));
      readSync();
    },
    [readSync],
  );

  /**
   * A direct write that did not land: held when the server failed or the
   * session ended — either way it will be accepted later — and refused only
   * when the server said this write is wrong. Returns whether it was held.
   */
  const heldAfter = useCallback(
    async (cause: unknown, hold: () => void): Promise<boolean> => {
      if (outbox.isRetryable(cause)) {
        replaying.current = true;
        hold();
        return true;
      }
      if (outbox.needsSignIn(cause)) {
        // Signed out somewhere else, or the session expired. The write waits
        // for the learner to sign in again, and asking the server puts the
        // password screen up instead of leaving somebody typing into nothing.
        replaying.current = true;
        hold();
        await sessionEnded();
        return true;
      }
      refuse(cause);
      return false;
    },
    [refuse, sessionEnded],
  );

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
      send: (key: string) => Promise<LessonProgress>,
      write: outbox.PendingWrite,
      local: (prior: LessonProgress) => LessonProgress,
    ): Promise<LessonProgress> => {
      const current = () => lessonsRef.current[lessonId] ?? lessons[lessonId] ?? emptyProgress(lessonId);
      const prior = current();
      // One key for the direct send and, if it has to wait, for every retry.
      const key = outbox.newWriteId();

      let optimistic = prior;
      const hold = () => {
        // From the progress as it stands now, not as it stood before the
        // request: an answer may have been applied while it was in flight.
        optimistic = local(current());
        if (!outbox.enqueue(write, key)) lostAnswers.current += 1;
        mergeLesson(optimistic);
        readSync();
      };

      // Never jump the queue. Answers from this very lesson may still be
      // waiting, and the mastery result belongs behind them.
      if (outbox.queuedCount() > 0) {
        hold();
        void flushAnswers();
        return optimistic;
      }

      try {
        const progress = await send(key);
        mergeLesson(progress);
        return progress;
      } catch (cause) {
        // A 500 or an expired session is held and shown as the rule says; a
        // 100% final check is never reported as "Not passed yet" because the
        // database hiccuped. Only a write the server refused claims nothing.
        return (await heldAfter(cause, hold)) ? optimistic : prior;
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

      // The mirror first: the end of a lesson asks right after its last
      // answer was applied, before React has rendered it.
      lessonProgress: (lessonId: string) =>
        lessonsRef.current[lessonId] ?? lessons[lessonId] ?? emptyProgress(lessonId),

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
       *
       * Every answer goes through the outbox, even with a good connection,
       * and this returns as soon as it is held. It used to wait for the
       * server first, and on a weak signal the verdict sat behind a request
       * that took up to 30 seconds to give up: the screen looked frozen. The
       * queue also keeps answers in the order they were given, which the
       * review schedule needs, however the requests overlap.
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
        const write: outbox.PendingWrite = { kind: 'attempt', payload: stamped };

        if (!outbox.enqueue(write)) {
          lostAnswers.current += 1;
          readSync();
          return;
        }

        // The lesson's own record moves now, by the rule the server applies
        // when the answer arrives, so the end of the lesson sees every step
        // whether or not the answer has been sent yet.
        const rule = heldLessonRule(write);
        if (rule) {
          mergeLesson(rule.apply(lessonsRef.current[rule.lessonId] ?? lessons[rule.lessonId] ?? emptyProgress(rule.lessonId)));
        }

        // Not counted on screen yet: with a connection it is gone in a moment,
        // and the strip would flash "1 answer is waiting" after every answer.
        // The flush says so if it could not be sent.
        void flushAnswers();
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
          (key) => api.markSectionSeen(lessonId, sectionId, key),
          { kind: 'sectionSeen', lessonId, sectionId },
          (prior) => markSectionSeenIn(prior, sectionId),
        );
      },

      // The one write whose value the caller needs: the lesson page shows
      // "passed" or "not yet" from it, so offline it must still answer.
      recordMastery: (lessonId, accuracy, passAccuracy) =>
        lessonWrite(
          lessonId,
          (key) => api.recordMastery(lessonId, accuracy, passAccuracy, key),
          { kind: 'mastery', lessonId, accuracy, passAccuracy },
          (prior) => applyMastery(prior, accuracy, passAccuracy, new Date().toISOString()),
        ),

      recordRecovery: async (lessonId) => {
        await lessonWrite(
          lessonId,
          (key) => api.recordRecovery(lessonId, key),
          { kind: 'recovery', lessonId },
          (prior) => applyRecoveryRound(prior, new Date().toISOString()),
        );
      },

      completeLesson: async (lessonId) => {
        await lessonWrite(
          lessonId,
          (key) => api.completeLesson(lessonId, key),
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
        // The moment of recall, taken once: the schedule shown here and the
        // one the server stores both count from it, however long the grade
        // waits for a connection.
        const gradedAt = new Date();
        const key = outbox.newWriteId();

        const hold = () => {
          const current = reviewItemsRef.current.find((item) => item.id === id);
          const queued = outbox.enqueue({ kind: 'reviewGrade', id, grade, gradedAt: gradedAt.toISOString() }, key);
          if (!queued) lostAnswers.current += 1;
          if (current) replaceReviewItem(scheduleReview(current, grade, gradedAt));
          readSync();
        };

        if (outbox.queuedCount() > 0) {
          hold();
          void flushAnswers();
          return;
        }
        try {
          replaceReviewItem(await api.gradeReview(id, grade, gradedAt.toISOString(), key));
        } catch (cause) {
          await heldAfter(cause, hold);
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
        const key = outbox.newWriteId();
        const hold = () => {
          if (!outbox.enqueue({ kind: 'checkpoint', payload }, key)) lostAnswers.current += 1;
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
          const result = await api.recordCheckpoint(payload, key);
          patchSnapshot({ checkpointResults: result.results });
        } catch (cause) {
          await heldAfter(cause, hold);
        }
      },

      recordScenarioRun: async (scriptId, turns, firstTryCorrect) => {
        const payload = { scriptId, turns, firstTryCorrect };

        const key = outbox.newWriteId();
        const hold = () => {
          if (!outbox.enqueue({ kind: 'scenarioRun', payload }, key)) lostAnswers.current += 1;
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
          const result = await api.recordScenarioRun(payload, key);
          patchSnapshot({ scenarioRuns: result.scenarioRuns });
        } catch (cause) {
          await heldAfter(cause, hold);
        }
      },

      resetAll: async () => {
        await reporting('notSavedReset', async () => {
          setSnapshot(await api.reset());
        });
      },
    };
  }, [ready, error, offline, session, signIn, choosePassword, changePassword, signOut, profile, snapshot, coach, lang, t, say, tts, recogniser, load, patchSnapshot, mergeLesson, replaceReviewItem, sync, readSync, flushAnswers, heldAfter, learners, studyingAs, notice]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useApp must be used inside <AppStateProvider>');
  return value;
}
