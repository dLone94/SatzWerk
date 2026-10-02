import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { resolveTarget } from '../../content/browser.ts';
import type { CefrLevel, Exercise, ExerciseStep } from '../../content/types.ts';
import { buildFeedback, type FeedbackMessage } from '../../core/feedback/explain.ts';
import {
  adapt,
  firstLetterCue,
  firstWordCue,
  initialAdaptation,
  presentationFor,
  type AdaptationState,
} from '../../core/progress/adaptation.ts';
import { hintPenalty } from '../../core/srs/scheduler.ts';
import { splitScaffold } from '../../core/validation/text.ts';
import {
  checkFreeWriting,
  validateAnswer,
  type ValidationResult,
} from '../../core/validation/validate.ts';
import { CATEGORY_LABELS } from '../../i18n.ts';
import { ExplainWhy } from './ExplainWhy.tsx';
import { SpeakAnswer, SpeakCheck } from './Speaking.tsx';
import type { AttemptPayload, TargetSpec } from '../../services/api/client.ts';
import { useApp } from '../../state/AppState.tsx';
import { AnswerInput, type AnswerInputHandle } from './AnswerInput.tsx';
import { AudioButton } from './bits.tsx';

/**
 * The exercise engine.
 *
 * One component drives every exercise kind, because they all reduce to the same
 * thing: a prompt, one or more answer steps, progressive hints, a verdict and,
 * when the mistake matters, a mandatory retyping of the correct German.
 *
 * Keyboard contract:
 *   Enter submits -> Enter again advances -> focus returns to the input.
 */

export interface PlayerSummary {
  total: number;
  firstTryCorrect: number;
  accuracy: number;
}

export interface ExercisePlayerProps {
  exercises: Exercise[];
  context: AttemptPayload['context'];
  level: CefrLevel;
  lessonId?: string;
  /** Mastery checks and checkpoints run without hints. */
  allowHints?: boolean;
  /**
   * Hide the step counter.
   *
   * A scenario plays one turn at a time and keeps its own progress, so the
   * player's own bar would read "1 of 1" at every turn of the conversation.
   */
  hideProgress?: boolean;
  /**
   * Offer a way to answer "I do not know this one".
   *
   * Only the placement check uses it, and it needs it: that check runs with no
   * hints and no reveal, and its last four questions are B2. Without an
   * explicit way out, a beginner reaching them is stuck on a screen that will
   * not accept an empty answer and offers no help — the exact dead end this
   * app has already shipped once. The skip is recorded as a real attempt with
   * an empty verdict, so it counts against the band rather than vanishing.
   */
  allowSkip?: boolean;
  /**
   * Offer the microphone as a way to *answer*, not only as a way to practise
   * saying an answer that is already right.
   *
   * Real Life passes it and nothing else does. Typing is what a lesson is for
   * — it makes you produce the letters, including the ones a phone keyboard
   * hides — and answering a lesson aloud would remove the practice it exists
   * for. A conversation is the opposite: in a bakery nobody types.
   */
  allowSpeaking?: boolean;
  /** Restrict to these step ids, used by the recovery round. */
  onlyStepIds?: string[];
  onFinish: (summary: PlayerSummary) => void;
  /**
   * Fired once per step, with the text the learner ended up having accepted
   * and whether they got there cleanly.
   *
   * The scenario player needs the text to build a transcript: showing the
   * canonical answer instead would put words in the learner's mouth whenever
   * they said something true that was not the taught form. The placement check
   * needs `correct`, which is the same strict notion the score uses — right at
   * the first attempt, no hint opened, nothing revealed.
   */
  onStepDone?: (info: { stepId: string; given: string; correct: boolean }) => void;
  onExit?: () => void;
  exitLabel?: string;
}

interface Playable {
  exercise: Exercise;
  step: ExerciseStep;
}

type Phase = 'answer' | 'feedback' | 'retype';

/**
 * Replays a dictation line gets after the automatic first play.
 *
 * Three hearings in total. Fewer makes a single mis-heard syllable
 * unrecoverable; more and the learner stops listening and starts sampling.
 */
export const DEFAULT_REPLAYS = 2;
/** In the first level the words are new to the ear as well as the eye. */
export const BEGINNER_REPLAYS = 4;

/** Deterministic shuffle so a word bank does not reorder on every render. */
function shuffle<T>(items: T[], seed: string): T[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
    const j = Math.abs(hash) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function ExercisePlayer({
  exercises,
  context,
  level,
  lessonId,
  allowHints = true,
  hideProgress = false,
  allowSkip = false,
  allowSpeaking = false,
  onlyStepIds,
  onFinish,
  onStepDone,
  onExit,
  exitLabel,
}: ExercisePlayerProps) {
  const { lang, t, say, lexicon, describeNoun, submitAttempt, tts } = useApp();

  /*
   * The round is the one the player was opened with.
   *
   * Review and the mistake bank build their exercises from live lists, and
   * every answer changes those lists: the item just answered stops being due,
   * a wrong answer adds a mistake. Following the prop re-indexed a running
   * round under the cursor, so the next word slid under the verdict and was
   * skipped, and the retype was checked against a question nobody could see.
   * A caller that means a new round mounts a new player (a new `key`).
   */
  const [round] = useState(() => ({ exercises, onlyStepIds }));

  const playables = useMemo<Playable[]>(() => {
    const out: Playable[] = [];
    for (const exercise of round.exercises) {
      if (exercise.only && !exercise.only.includes(lang)) continue;
      for (const step of exercise.steps) {
        if (step.only && !step.only.includes(lang)) continue;
        if (round.onlyStepIds && !round.onlyStepIds.includes(step.id)) continue;
        out.push({ exercise, step });
      }
    }
    return out;
  }, [round, lang]);

  const [cursor, setCursor] = useState(0);
  const [value, setValue] = useState('');
  const [phase, setPhase] = useState<Phase>('answer');
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [retypeNudge, setRetypeNudge] = useState(false);
  const [freeNote, setFreeNote] = useState<{ ok: boolean; missing: string[] } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [usedBank, setUsedBank] = useState<number[]>([]);
  const [support, setSupport] = useState<AdaptationState>(initialAdaptation());
  const [supportNote, setSupportNote] = useState<'up' | 'down' | null>(null);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [busy, setBusy] = useState(false);
  const [replaysUsed, setReplaysUsed] = useState(0);
  /** How many of the hints on screen the support ladder opened by itself. */
  const [autoHints, setAutoHints] = useState(0);
  /** What the learner submitted, kept after the field is cleared for a retype. */
  const [submitted, setSubmitted] = useState('');
  /** Read out by the live region below; see `announce`. */
  const [announcement, setAnnouncement] = useState('');
  /*
   * The round is over and `onFinish` has been called.
   *
   * The caller usually saves something before it moves on, and on a phone
   * waking the database that takes seconds. The last question used to sit
   * there cleared and answerable meanwhile, and answering it again finished
   * the round twice. Once finished, the player takes no more answers.
   */
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  const inputRef = useRef<AnswerInputHandle | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);
  const startedAt = useRef(Date.now());
  /** The last text this step had accepted, for the transcript. */
  const accepted = useRef('');
  /** Whether this step was answered cleanly, for the placement bands. */
  const wasClean = useRef(false);

  const current = finished ? undefined : playables[cursor];
  const total = playables.length;
  /*
   * No adaptive support where there are no hints.
   *
   * A final check, a checkpoint and the placement check measure what the
   * learner can do alone. The ladder used to run there too, so two slips put
   * the first word of the answer on screen (for a one-word answer, the whole
   * answer) and a few more handed over every word as chips, all counted as
   * right first time. An authored word bank is part of the question and stays.
   */
  const presentation = presentationFor(allowHints ? support.support : 'full-production');
  // `hintsShown` counts every hint on screen; only the ones the learner opened
  // are theirs to pay for.
  const learnerHints = Math.max(0, hintsShown - autoHints);

  // While a question is on screen the phone's tab bar steps aside, so the
  // question has the whole height and a stray tap cannot leave the lesson.
  useEffect(() => focusMode(), []);

  // Pre-open the hints the adaptive support level unlocks, and seed the input
  // with a partial-recall cue ("Ich w___ in Hamburg." starts the learner at "w").
  useEffect(() => {
    if (!current) return;
    startedAt.current = Date.now();
    const opened = allowHints ? Math.min(presentation.hintsUnlocked, current.step.hints.length) : 0;
    setHintsShown(opened);
    setAutoHints(opened);
    setReplaysUsed(0);
    const seed = current.step.scaffold ? splitScaffold(current.step.scaffold).seed : '';
    if (seed) setValue(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, current?.step.id, allowHints]);

  // Speak dictation prompts as soon as the step opens.
  useEffect(() => {
    if (!current?.step.audio?.hideText) return;
    tts.speak(current.step.audio.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, current?.step.id]);

  useEffect(() => {
    if (phase === 'feedback') continueRef.current?.focus();
  }, [phase]);

  /*
   * Bring the verdict into view.
   *
   * On a phone the feedback opens below the fold as often as not — the answer
   * is judged, the explanation is written, and the screen looks unchanged. The
   * focus move above handles a keyboard; this is for a thumb. `nearest` scrolls
   * only as far as it has to, so a verdict already on screen does not jump.
   */
  useEffect(() => {
    if (phase === 'answer') return;
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Optional call, not just optional chaining on the node: jsdom has no
    // scrollIntoView at all, and a throw here would take the player down.
    feedbackRef.current?.scrollIntoView?.({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [phase, current?.step.id]);

  const wordBank = useMemo(() => {
    if (!current) return null;
    const authored = current.step.wordBank;
    if (authored) return shuffle(authored, current.step.id);
    if (!presentation.showWordBank) return null;
    /*
     * Never build one out of the answer for open writing.
     *
     * The synthesised bank is a scaffold: when a learner is struggling with a
     * sentence that has one right answer, handing them its words in the wrong
     * order is help. A free-writing task has no single right answer — the
     * screen says so — and it is checked for required words rather than for
     * matching a model. Scattering the model answer's words across the screen
     * as chips would quietly turn "write what you want to say" into "unscramble
     * what we had in mind", which is a different exercise and a worse one.
     *
     * An authored word bank above is untouched: giving a learner the
     * vocabulary to use is a deliberate teaching choice, and it is not the
     * answer.
     */
    if (current.exercise.kind === 'freeWriting') return null;
    const answer = current.step.answer.accepted[0] ?? '';
    const tokens = answer.split(/\s+/).filter(Boolean);
    return tokens.length > 1 ? shuffle(tokens, current.step.id) : null;
  }, [current, presentation.showWordBank]);

  /*
   * Say the verdict to a screen reader.
   *
   * The feedback panel used to arrive in one piece, live region and text
   * together, while focus jumped to Continue, so the verdict was never read
   * out. The region below is on screen for the player's whole life and only
   * its text changes, which is what a screen reader listens for. It is
   * emptied first, so the same verdict twice in a row is still news.
   */
  const announce = useCallback(
    (message: FeedbackMessage, wrong: boolean) => {
      const parts = [say(message.headline), ...message.lines.slice(0, 1).map((line) => say(line))];
      if (wrong && message.correction) parts.push(`${t('feedbackExpected')}: ${message.correction}`);
      setAnnouncement('');
      window.setTimeout(() => setAnnouncement(parts.join(' ')), 50);
    },
    [say, t],
  );

  const advance = useCallback(() => {
    if (finishedRef.current) return;
    if (current && accepted.current) {
      onStepDone?.({
        stepId: current.step.id,
        given: accepted.current,
        correct: wasClean.current,
      });
      accepted.current = '';
      wasClean.current = false;
    }
    if (cursor + 1 >= total) {
      finishedRef.current = true;
      setFinished(true);
      onFinish({
        total,
        firstTryCorrect,
        accuracy: total > 0 ? firstTryCorrect / total : 0,
      });
      return;
    }
    setValue('');
    setPhase('answer');
    setResult(null);
    setFeedback(null);
    setRevealed(false);
    setRetypeNudge(false);
    setFreeNote(null);
    setShowExplanation(false);
    setUsedBank([]);
    setSupportNote(null);
    setReplaysUsed(0);
    setSubmitted('');
    setAnnouncement('');
    // Focused inside the tap on Continue as well as after the render: iOS only
    // opens the keyboard for focus given during the tap itself.
    inputRef.current?.focus();
    setCursor((index) => index + 1);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [cursor, total, firstTryCorrect, onFinish, onStepDone, current]);

  const targetsFor = useCallback(
    (step: ExerciseStep): TargetSpec[] =>
      (step.reviewTargets ?? [])
        .map((id) => resolveTarget(id))
        .filter((target): target is NonNullable<typeof target> => Boolean(target))
        .map((target) => ({
          refId: target.id,
          kind: target.kind,
          // The resolved content level wins; `level` is the fallback for a
          // target that has no level of its own.
          level: target.level || level,
          lessonId,
          difficulty: target.difficulty,
        })),
    [lessonId, level],
  );

  const submit = useCallback(async () => {
    if (!current || busy || finishedRef.current) return;
    const { exercise, step } = current;

    // Open writing is never marked simply "wrong".
    if (exercise.kind === 'freeWriting') {
      const check = checkFreeWriting(value, step.answer);
      setFreeNote({ ok: check.satisfied, missing: check.missingRequired });
      if (!check.satisfied) {
        inputRef.current?.focus();
        return;
      }
      setBusy(true);
      try {
        await submitAttempt({
          context,
          lessonId,
          exerciseId: exercise.id,
          stepId: step.id,
          prompt: step.prompt ? say(step.prompt) : undefined,
          expected: step.answer.accepted[0] ?? '',
          given: value,
          verdict: 'accepted-variant',
          credit: 1,
          categories: [],
          hintsUsed: learnerHints,
          revealed: false,
          isRetype: false,
          resolved: true,
          durationMs: Date.now() - startedAt.current,
          reviewTargets: targetsFor(step),
        });
      } finally {
        setBusy(false);
      }
      accepted.current = value;
      wasClean.current = true;
      setFirstTryCorrect((count) => count + 1);
      setPhase('feedback');
      const done: FeedbackMessage = {
        tone: 'success',
        headline: { en: t('exerciseFreeWritingOk'), bg: t('exerciseFreeWritingOk') },
        lines: [],
        correction: step.answer.accepted[0] ?? '',
        askRetype: false,
      };
      setFeedback(done);
      announce(done, false);
      return;
    }

    // Where the answer stands (a gap that opens the sentence) and what kind of
    // task it is decide how a capital or the word order is judged.
    const validation = validateAnswer(value, step.answer, {
      lexicon,
      scaffold: step.scaffold,
      exerciseKind: exercise.kind,
    });
    if (validation.verdict === 'empty') {
      setFeedback(buildFeedback(validation, { lexicon, describeNoun }));
      setResult(validation);
      inputRef.current?.focus();
      return;
    }

    const message = buildFeedback(validation, { lexicon, describeNoun });
    const credit = validation.credit * hintPenalty(learnerHints, revealed);
    /*
     * Every answer that leaves the step unresolved is retyped.
     *
     * Word drills (articles, conjugations) are marked `mandatoryRetype: false`
     * because a single word is quick to see and remember. But the retype is
     * also the only way a step becomes resolved, so skipping it left a wrong
     * article unresolved for good: the lesson stayed unfinished after a
     * perfect final check, with nothing saying why. A one-word retype costs a
     * second; a lesson that cannot be finished costs the learner the lesson.
     */
    const mustRetype = validation.requireRetype;
    // A note that asks for nothing (a forgotten full stop) is still a right
    // answer; one that asks for a retype (ae for ä) is not.
    const clean =
      (validation.verdict === 'correct' ||
        validation.verdict === 'accepted-variant' ||
        (validation.verdict === 'accepted-with-note' && !validation.requireRetype)) &&
      learnerHints === 0 &&
      !revealed;
    const resolved = !validation.requireRetype && validation.credit > 0;

    setBusy(true);
    try {
      await submitAttempt({
        context,
        lessonId,
        exerciseId: exercise.id,
        stepId: step.id,
        prompt: step.prompt ? say(step.prompt) : undefined,
        expected: validation.target,
        given: value,
        verdict: validation.verdict,
        credit,
        categories: validation.categories,
        hintsUsed: learnerHints,
        revealed,
        isRetype: false,
        resolved,
        // The same flag `clean` rests on, so the server counts this answer
        // right exactly when the player does.
        requireRetype: validation.requireRetype,
        durationMs: Date.now() - startedAt.current,
        reviewTargets: targetsFor(step),
      });
    } finally {
      setBusy(false);
    }

    if (clean) setFirstTryCorrect((count) => count + 1);
    wasClean.current = clean;

    // Adapt the amount of support for the steps that follow, only where
    // support is offered at all.
    if (allowHints) {
      const outcome = clean ? 'clean' : validation.credit > 0 ? 'partial' : 'wrong';
      const nextSupport = adapt(support, outcome);
      if (nextSupport.support !== support.support) {
        setSupportNote(
          presentationFor(nextSupport.support).hintsUnlocked > presentation.hintsUnlocked ? 'up' : 'down',
        );
      }
      setSupport(nextSupport);
    }

    setResult(validation);
    setFeedback(message);
    setSubmitted(value);
    announce(message, validation.verdict !== 'correct');
    // What the learner said. When a retype is coming, the retype replaces it.
    accepted.current = validation.credit > 0 ? value : validation.target;
    if (mustRetype) {
      setValue('');
      setPhase('retype');
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setPhase('feedback');
    }
  }, [
    current,
    busy,
    value,
    lexicon,
    describeNoun,
    learnerHints,
    revealed,
    support,
    presentation.hintsUnlocked,
    allowHints,
    context,
    lessonId,
    say,
    submitAttempt,
    targetsFor,
    t,
    announce,
  ]);

  const submitRetype = useCallback(async () => {
    if (!current || busy || !result || finishedRef.current) return;
    const { exercise, step } = current;
    const check = validateAnswer(value, step.answer, {
      lexicon,
      scaffold: step.scaffold,
      exerciseKind: exercise.kind,
    });
    // "Sufficiently accurate": the right words, at most a punctuation slip.
    if (check.credit < 0.9) {
      setRetypeNudge(true);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    try {
      await submitAttempt({
        context,
        lessonId,
        exerciseId: exercise.id,
        stepId: step.id,
        prompt: step.prompt ? say(step.prompt) : undefined,
        expected: result.target,
        given: value,
        verdict: check.verdict,
        credit: check.credit,
        categories: [],
        hintsUsed: learnerHints,
        revealed,
        isRetype: true,
        resolved: true,
        durationMs: Date.now() - startedAt.current,
      });
    } finally {
      setBusy(false);
    }
    accepted.current = value;
    setRetypeNudge(false);
    setPhase('feedback');
  }, [current, busy, result, value, lexicon, context, lessonId, say, submitAttempt, learnerHints, revealed]);

  const skip = useCallback(async () => {
    if (!current || busy || finishedRef.current) return;
    const { exercise, step } = current;
    setBusy(true);
    try {
      await submitAttempt({
        context,
        lessonId,
        exerciseId: exercise.id,
        stepId: step.id,
        prompt: step.prompt ? say(step.prompt) : undefined,
        expected: step.answer.accepted[0] ?? '',
        given: '',
        verdict: 'empty',
        credit: 0,
        categories: [],
        hintsUsed: learnerHints,
        revealed,
        isRetype: false,
        resolved: true,
        durationMs: Date.now() - startedAt.current,
      });
    } finally {
      setBusy(false);
    }
    accepted.current = step.answer.accepted[0] ?? '';
    wasClean.current = false;
    advance();
  }, [current, busy, context, lessonId, say, submitAttempt, learnerHints, revealed, advance]);

  /*
   * Show the answer — and leave the typing to the learner.
   *
   * This used to put the answer straight into the box, so one press of Enter
   * passed the step without a single German letter typed. The whole app is
   * built on the opposite: recall, then *type*, then type again when it was
   * wrong. Seeing the answer is fine and often necessary; not having to
   * produce it is what made it pointless. So it is shown above the box, the
   * box is left as it was, and the step still costs its credit and comes
   * back soon, as the warning says.
   */
  const revealAnswer = useCallback(() => {
    if (!current) return;
    setRevealed(true);
    setHintsShown(current.step.hints.length);
    inputRef.current?.focus();
  }, [current]);

  // The live region lives outside every branch, so it is never remounted.
  const liveRegion = (
    <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );

  if (!current) {
    // Never a dead end: an empty round, or one whose caller has not moved on
    // yet, still has a way out.
    return (
      <div className="player player--empty">
        {liveRegion}
        <p>{t('exerciseDone')}</p>
        {onExit ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onExit}>
            {exitLabel ?? t('lessonBackToLesson')}
          </button>
        ) : null}
      </div>
    );
  }

  const { exercise, step } = current;
  // Review and mistake rounds mix levels. Their generic player level must
  // not give a B2 word beginner replay limits or beginner AI explanations.
  const stepLevel = (step.reviewTargets ?? [])
    .map((id) => resolveTarget(id)?.level)
    .find((targetLevel) => targetLevel !== undefined) ?? level;
  const scaffold = step.scaffold ? splitScaffold(step.scaffold) : null;
  const hideText = Boolean(step.audio?.hideText);
  /*
   * Only dictation is budgeted.
   *
   * `listenChoose` hides its text too, but the model calls it first listening
   * exposure and means it: the learner is meeting the sound for the first
   * time and picking between options they can see. Rationing a first hearing
   * teaches nothing. Dictation is the one that asks you to produce what you
   * heard, and that is the task unlimited replay quietly turns into
   * transcription.
   */
  const budgeted = hideText && exercise.kind === 'dictation';
  // Two replays unless the step says otherwise: enough to catch a word you
  // half-heard, not enough to transcribe by repetition.
  const replayBudget = step.audio?.replays ?? (stepLevel === 'pre-a1' ? BEGINNER_REPLAYS : DEFAULT_REPLAYS);
  const replaysLeft = budgeted ? Math.max(0, replayBudget - replaysUsed) : Number.POSITIVE_INFINITY;
  const isChoice = exercise.kind === 'multipleChoice' || exercise.kind === 'listenChoose';
  const isFree = exercise.kind === 'freeWriting';
  const tone =
    phase === 'answer' || phase === 'retype'
      ? 'neutral'
      : feedback?.tone === 'success'
        ? 'success'
        : feedback?.tone === 'note'
          ? 'warning'
          : feedback?.tone === 'almost'
            ? 'warning'
            : 'error';

  return (
    <div className="player" data-study-active="true">
      {liveRegion}
      <header className="player__head">
        {hideProgress ? (
          <div className="player__progress" />
        ) : (
          <div className="player__progress">
            <span className="player__count">{t('exerciseProgress', { done: cursor + 1, total })}</span>
            {total <= MAX_SEGMENTS ? (
              // One segment per question: how far you are, and how far to go,
              // without reading a number.
              <div className="player__segments" aria-hidden="true">
                {Array.from({ length: total }, (_, index) => (
                  <span
                    key={index}
                    className={index < cursor ? 'is-done' : index === cursor ? 'is-current' : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="player__bar">
                <span style={{ width: `${(cursor / total) * 100}%` }} />
              </div>
            )}
          </div>
        )}
        {onExit ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onExit}>
            {exitLabel ?? t('lessonBackToLesson')}
          </button>
        ) : null}
      </header>

      <p className="player__objective">{say(exercise.objective)}</p>

      {supportNote ? (
        <p className="player__support" role="status">
          {supportNote === 'up' ? t('exerciseSupportAdded') : t('exerciseSupportRemoved')}
        </p>
      ) : null}

      {/* The ids are here so an end-to-end harness can tell which authored step
          it is looking at, rather than having to predict the sequence the
          adaptive ladder produces. */}
      {/* Keyed by step id: React then gives each question its own node, which
          is what makes the card arrive rather than silently swap its text. */}
      <div
        key={step.id}
        className="task"
        data-step-id={step.id}
        data-exercise-id={exercise.id}
        data-kind={exercise.kind}
      >
        {step.instruction ? <p className="task__instruction">{say(step.instruction)}</p> : null}

        {hideText ? (
          /*
           * Dictation, with a budget.
           *
           * The line is spoken once when the step opens, and after that the
           * learner gets `replays` more hearings — the slow one included,
           * because a budget you can dodge by always pressing the snail is not
           * a budget. Unlimited replay turns dictation into transcription with
           * a scrub bar: you stop listening and start sampling until the words
           * resolve.
           *
           * The count is stated before it runs out rather than after, and the
           * buttons stay visible when spent so nothing silently disappears.
           * This is never a dead end: the hint ladder and the reveal are
           * untouched, and both are a press away.
           */
          <div className="task__audio-only">
            {/* The text is the answer here, so it stays out of the buttons'
                names too: a screen reader would otherwise read it out. */}
            <AudioButton
              text={step.audio!.text}
              concealText
              disabled={replaysLeft === 0}
              onPlay={() => setReplaysUsed((used) => used + 1)}
            />
            <AudioButton
              text={step.audio!.text}
              slow
              concealText
              disabled={replaysLeft === 0}
              onPlay={() => setReplaysUsed((used) => used + 1)}
            />
            {budgeted ? (
              <span className="task__replays" role="status">
                {replaysLeft > 0 ? t('exerciseReplaysLeft', { n: replaysLeft }) : t('exerciseReplaysGone')}
              </span>
            ) : null}
          </div>
        ) : null}

        {!hideText && step.promptDe ? (
          <p className="task__prompt-de" lang="de">
            {step.promptDe}
            <AudioButton text={step.promptDe} compact />
          </p>
        ) : null}

        {!hideText && step.prompt ? (
          <p className="task__prompt" lang={lang === 'bg' ? 'bg' : 'en'}>
            {/* As on the English path, no quotation marks of its own: many
                prompts are instructions ("Слушай. Коя дума чу?"), not
                sentences to translate, and a prompt that quotes German
                ended up with quotes inside quotes. */}
            {say(step.prompt)}
          </p>
        ) : null}

        {!hideText && step.audio && !step.audio.hideText ? (
          <div className="task__audio">
            <AudioButton text={step.audio.text} />
            <AudioButton text={step.audio.text} slow />
          </div>
        ) : null}

        {presentation.showFirstWord && phase === 'answer' && !isChoice && !isFree ? (
          <p className="task__cue" lang="de">
            {supportCue(step.answer.accepted[0] ?? '', presentation.showFirstLetters)}
          </p>
        ) : null}

        {isChoice ? (
          <div className="choices" role="group" aria-label={t('exerciseChoose')}>
            {(step.choices ?? []).map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="choice"
                disabled={phase !== 'answer' || busy}
                onClick={() => {
                  setValue(choice.de);
                  // Submitting on the next tick so `value` is committed first.
                  requestAnimationFrame(() => void submitChoice(choice.de));
                }}
              >
                <span lang="de" className="choice__de">
                  {choice.de}
                </span>
                {choice.gloss ? <span className="choice__gloss">{say(choice.gloss)}</span> : null}
              </button>
            ))}
          </div>
        ) : (
          <>
            {wordBank && phase === 'answer' ? (
              <div className="bank">
                <p className="bank__label">{t('exerciseWordBank')}</p>
                <div className="bank__chips">
                  {wordBank.map((word, index) => (
                    <button
                      key={`${word}-${index}`}
                      type="button"
                      className="chip"
                      disabled={usedBank.includes(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setUsedBank((used) => [...used, index]);
                        setValue((text) => (text.length > 0 ? `${text} ${word}` : word));
                        inputRef.current?.focus();
                      }}
                    >
                      {word}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      setUsedBank([]);
                      setValue('');
                      inputRef.current?.focus();
                    }}
                  >
                    {t('exerciseWordBankClear')}
                  </button>
                </div>
              </div>
            ) : null}

            <AnswerInput
              ref={inputRef}
              value={value}
              onChange={setValue}
              onSubmit={() => {
                if (phase === 'answer') void submit();
                else if (phase === 'retype') void submitRetype();
                else advance();
              }}
              label={phase === 'retype' ? t('exerciseRetype') : t('exerciseTypeAnswer')}
              prefix={scaffold?.before}
              suffix={scaffold?.after}
              disabled={phase === 'feedback' || busy}
              multiline={isFree}
              compact={step.answer.shape === 'word' && !isFree}
              capitalizeSentences={(step.answer.shape === 'sentence' || isFree) && !scaffold?.before}
              tone={tone}
              focusKey={`${step.id}-${phase}`}
              // While retyping, the field is described by the verdict and the
              // correction, which is where focus lands after a wrong answer.
              describedBy={phase === 'retype' ? 'player-verdict player-retype-target' : 'player-keyhint'}
            />
          </>
        )}

        {isFree ? <p className="task__note">{t('exerciseFreeWritingNote')}</p> : null}

        {freeNote && !freeNote.ok ? (
          <p className="task__warn" role="status">
            {t('exerciseFreeWritingMissing', { words: freeNote.missing.map((word) => word.split('|').join(' / ')).join(', ') })}
          </p>
        ) : null}

        {phase === 'answer' && !isChoice ? (
          <div className="task__controls">
            <button type="button" className="btn btn--primary" onClick={() => void submit()} disabled={busy}>
              {t('exerciseSubmit')}
            </button>
            {allowHints && step.hints.length > 0 ? (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={hintsShown >= step.hints.length}
                onClick={() => setHintsShown((count) => count + 1)}
              >
                {hintsShown >= step.hints.length
                  ? t('exerciseNoMoreHints')
                  : t('exerciseHintCount', { n: hintsShown + 1, total: step.hints.length })}
              </button>
            ) : null}
            {allowHints && !isFree ? (
              <button type="button" className="btn btn--ghost btn--quiet" onClick={revealAnswer}>
                {t('exerciseReveal')}
              </button>
            ) : null}
            {allowSkip ? (
              <button
                type="button"
                className="btn btn--ghost btn--quiet"
                onClick={() => void skip()}
                disabled={busy}
              >
                {t('exerciseSkip')}
              </button>
            ) : null}
            {/* A dictation asks what you heard, so answering it by voice would
                test nothing; everywhere else in a conversation it is offered. */}
            {allowSpeaking && exercise.kind !== 'dictation' ? (
              <SpeakAnswer
                onHeard={(text) => {
                  setValue(text);
                  inputRef.current?.focus();
                }}
              />
            ) : null}
            <span className="task__keyhint" id="player-keyhint">
              {t(isFree ? 'exerciseCtrlEnterToSubmit' : 'exerciseEnterToSubmit')}
            </span>
          </div>
        ) : null}

        {(hintsShown > 0 || revealed) && phase !== 'feedback' ? (
          <ul className="hints">
            {step.hints.slice(0, hintsShown).map((hint, index) => (
              <li key={index}>
                <span className="hints__n">{index + 1}</span>
                {say(hint)}
              </li>
            ))}
            {revealed ? (
              <li className="hints__revealed">
                <span className="hints__answer" lang="de">
                  {step.answer.accepted[0]}
                </span>
                <span>{t('exerciseRevealType')}</span>
                <span className="hints__warning">{t('exerciseRevealWarning')}</span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {feedback ? (
        <div ref={feedbackRef} className={`feedback feedback--${feedback.tone}`}>
          <p className="feedback__headline" id="player-verdict">
            <VerdictMark tone={feedback.tone} />
            {say(feedback.headline)}
          </p>

          {result && result.verdict !== 'correct' && result.verdict !== 'empty' ? (
            <dl className="feedback__compare">
              <dt>{t(isChoice ? 'feedbackYourChoice' : 'feedbackYourAnswer')}</dt>
              <dd lang="de" className="feedback__given">
                {result.diff.length > 0 ? <TokenDiff result={result} /> : submitted}
              </dd>
              <dt>{t('feedbackExpected')}</dt>
              <dd lang="de" className="feedback__expected">
                {feedback.correction}
                <AudioButton text={feedback.correction} compact />
              </dd>
            </dl>
          ) : null}

          {feedback.lines.length > 0 ? (
            <div className="feedback__lines">
              {feedback.lines.map((line, index) => (
                <p key={index}>{say(line)}</p>
              ))}
            </div>
          ) : null}

          {result && result.categories.length > 0 ? (
            <ul className="feedback__tags">
              {result.categories.map((category) => (
                <li key={category} className={`tag tag--${category}`}>
                  {say(CATEGORY_LABELS[category])}
                </li>
              ))}
            </ul>
          ) : null}

          {/*
            Offered only when the answer was actually wrong, and only after the
            authored explanation above has had its say. The course answers
            first; the model answers the question the course could not
            anticipate. It renders nothing at all with no provider configured.
          */}
          {result && result.verdict !== 'correct' && result.verdict !== 'empty' ? (
            // What was submitted, not the field: a retype clears the field,
            // and the model was being asked to explain an empty answer.
            <ExplainWhy
              key={step.id}
              expected={feedback.correction}
              given={submitted}
              categories={result.categories}
              level={stepLevel}
            />
          ) : null}

          {phase === 'retype' ? (
            <div className="feedback__retype">
              <p className="feedback__retype-label">{t('exerciseRetype')}</p>
              <p className="feedback__retype-target" id="player-retype-target" lang="de">
                {feedback.correction}
              </p>
              {retypeNudge ? <p className="task__warn">{t('exerciseRetypeLocked')}</p> : null}
              <div className="task__controls">
                <button type="button" className="btn btn--primary" onClick={() => void submitRetype()} disabled={busy}>
                  {t('exerciseSubmit')}
                </button>
                <span className="task__keyhint">{t('exerciseEnterToSubmit')}</span>
              </div>
            </div>
          ) : null}

          {/*
            Speaking is offered only once the answer is correct, and only for
            something worth saying aloud. That ordering is the whole safety
            argument: a missing microphone, a noisy room or a recogniser that
            mishears can cost the learner nothing, because the mark is already
            in the bank.
          */}
          {phase === 'feedback' && feedback.tone === 'success' && step.answer.shape !== 'word' ? (
            <SpeakCheck target={feedback.correction} spec={step.answer} />
          ) : null}

          {phase === 'feedback' ? (
            <div className="task__controls">
              <button
                ref={continueRef}
                type="button"
                className="btn btn--primary"
                onClick={advance}
                aria-describedby="player-verdict"
              >
                {t('exerciseContinue')}
              </button>
              <span className="task__keyhint">{t('exerciseEnterToContinue')}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {step.prompt && hideText && phase !== 'answer' ? (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setShowExplanation((shown) => !shown)}
        >
          {showExplanation ? t('exerciseHideTranslation') : t('exerciseShowTranslation')}
        </button>
      ) : null}
      {showExplanation && step.prompt ? <p className="task__prompt">{say(step.prompt)}</p> : null}
    </div>
  );

  /** Submitting a multiple-choice option runs it through the same validator. */
  async function submitChoice(chosen: string): Promise<void> {
    if (!current || finishedRef.current) return;
    const validation = validateAnswer(chosen, current.step.answer, { lexicon });
    const message = buildFeedback(validation, { lexicon, describeNoun });
    setBusy(true);
    try {
      await submitAttempt({
        context,
        lessonId,
        exerciseId: current.exercise.id,
        stepId: current.step.id,
        prompt: current.step.prompt ? say(current.step.prompt) : undefined,
        expected: validation.target,
        given: chosen,
        verdict: validation.verdict,
        credit: validation.credit * hintPenalty(learnerHints, false),
        categories: validation.categories,
        hintsUsed: learnerHints,
        revealed: false,
        isRetype: false,
        resolved: true,
        durationMs: Date.now() - startedAt.current,
        reviewTargets: targetsFor(current.step),
      });
    } finally {
      setBusy(false);
    }
    if (validation.verdict === 'correct' && learnerHints === 0) {
      setFirstTryCorrect((count) => count + 1);
    }
    setResult(validation);
    setFeedback(message);
    setSubmitted(chosen);
    announce(message, validation.verdict !== 'correct');
    setPhase('feedback');
  }
}

/*
 * The cue the support ladder shows above the field.
 *
 * "The first word" of a one-word answer is the answer, and the cue used to
 * print it: "heißt …" above an empty box, copied and marked right first time.
 * A one-word answer gets its first letter and a blank per letter instead.
 */
function supportCue(answer: string, letters: boolean): string {
  const words = answer.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return firstLetterCue(answer, 1);
  return letters ? firstWordCue(answer) : `${words[0]} …`;
}

/** Beyond this many questions a segment is too thin to read; a bar takes over. */
const MAX_SEGMENTS = 24;

/*
 * How many players are on screen. A scenario swaps one for the next between
 * turns, and counting rather than toggling keeps the tab bar from flashing
 * back for the frame in between.
 */
let playersOnScreen = 0;

function focusMode(): () => void {
  playersOnScreen += 1;
  document.documentElement.classList.add('is-playing');
  return () => {
    playersOnScreen -= 1;
    if (playersOnScreen === 0) document.documentElement.classList.remove('is-playing');
  };
}

/**
 * A tick or a cross, drawn rather than shown.
 *
 * Only the two verdicts that are simply right or simply wrong get a mark.
 * "Almost" and a credited variant get none on purpose: the app spends a lot of
 * effort distinguishing those from both of the others, and a mark that said
 * either would throw that away.
 *
 * It also earns its place for legibility: the feedback then says which verdict
 * it is in a shape as well as a colour.
 */
function VerdictMark({ tone }: { tone: FeedbackMessage['tone'] }) {
  if (tone !== 'success' && tone !== 'error') return null;
  const good = tone === 'success';
  return (
    <span className={`verdict-mark verdict-mark--${good ? 'good' : 'bad'}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {good ? (
          <path d="M5 13l4.2 4.2L19 7.5" style={{ '--len': 22 } as CSSProperties} />
        ) : (
          <>
            <path d="M7 7l10 10" style={{ '--len': 15 } as CSSProperties} />
            <path d="M17 7L7 17" style={{ '--len': 15 } as CSSProperties} />
          </>
        )}
      </svg>
    </span>
  );
}

/** Word-by-word comparison, so listening and dictation mistakes are visible. */
function TokenDiff({ result }: { result: ValidationResult }) {
  return (
    <span className="diff">
      {result.diff.map((entry, index) => {
        if (entry.status === 'missing') {
          return (
            <span key={index} className="diff__missing" title={entry.expected}>
              {'•'}
            </span>
          );
        }
        return (
          <span key={index} className={`diff__token diff__token--${entry.status}`}>
            {entry.given ?? entry.expected}
          </span>
        );
      })}
    </span>
  );
}
