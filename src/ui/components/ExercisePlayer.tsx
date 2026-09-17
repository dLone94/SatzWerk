import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveTarget } from '../../content/index.ts';
import type { CefrLevel, Exercise, ExerciseStep } from '../../content/types.ts';
import { buildFeedback, type FeedbackMessage } from '../../core/feedback/explain.ts';
import {
  adapt,
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
  /** Restrict to these step ids, used by the recovery round. */
  onlyStepIds?: string[];
  onFinish: (summary: PlayerSummary) => void;
  onExit?: () => void;
  exitLabel?: string;
}

interface Playable {
  exercise: Exercise;
  step: ExerciseStep;
}

type Phase = 'answer' | 'feedback' | 'retype';

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
  onlyStepIds,
  onFinish,
  onExit,
  exitLabel,
}: ExercisePlayerProps) {
  const { lang, t, say, lexicon, describeNoun, submitAttempt, tts } = useApp();

  const playables = useMemo<Playable[]>(() => {
    const out: Playable[] = [];
    for (const exercise of exercises) {
      if (exercise.only && !exercise.only.includes(lang)) continue;
      for (const step of exercise.steps) {
        if (step.only && !step.only.includes(lang)) continue;
        if (onlyStepIds && !onlyStepIds.includes(step.id)) continue;
        out.push({ exercise, step });
      }
    }
    return out;
  }, [exercises, lang, onlyStepIds]);

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

  const inputRef = useRef<AnswerInputHandle | null>(null);
  const continueRef = useRef<HTMLButtonElement | null>(null);
  const startedAt = useRef(Date.now());

  const current = playables[cursor];
  const total = playables.length;
  const presentation = presentationFor(support.support);

  // Pre-open the hints the adaptive support level unlocks.
  useEffect(() => {
    if (!current) return;
    startedAt.current = Date.now();
    setHintsShown(allowHints ? Math.min(presentation.hintsUnlocked, current.step.hints.length) : 0);
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

  const wordBank = useMemo(() => {
    if (!current) return null;
    const authored = current.step.wordBank;
    if (authored) return shuffle(authored, current.step.id);
    if (!presentation.showWordBank) return null;
    const answer = current.step.answer.accepted[0] ?? '';
    const tokens = answer.split(/\s+/).filter(Boolean);
    return tokens.length > 1 ? shuffle(tokens, current.step.id) : null;
  }, [current, presentation.showWordBank]);

  const advance = useCallback(() => {
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
    if (cursor + 1 >= total) {
      onFinish({
        total,
        firstTryCorrect,
        accuracy: total > 0 ? firstTryCorrect / total : 0,
      });
      return;
    }
    setCursor((index) => index + 1);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [cursor, total, firstTryCorrect, onFinish]);

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
    if (!current || busy) return;
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
          hintsUsed: hintsShown,
          revealed: false,
          isRetype: false,
          resolved: true,
          durationMs: Date.now() - startedAt.current,
          reviewTargets: targetsFor(step),
        });
      } finally {
        setBusy(false);
      }
      setFirstTryCorrect((count) => count + 1);
      setPhase('feedback');
      setFeedback({
        tone: 'success',
        headline: { en: t('exerciseFreeWritingOk'), bg: t('exerciseFreeWritingOk') },
        lines: [],
        correction: step.answer.accepted[0] ?? '',
        askRetype: false,
      });
      return;
    }

    const validation = validateAnswer(value, step.answer, { lexicon });
    if (validation.verdict === 'empty') {
      setFeedback(buildFeedback(validation, { lexicon, describeNoun }));
      setResult(validation);
      inputRef.current?.focus();
      return;
    }

    const message = buildFeedback(validation, { lexicon, describeNoun });
    const credit = validation.credit * hintPenalty(hintsShown, revealed);
    const mustRetype = exercise.mandatoryRetype !== false && validation.requireRetype;
    const clean =
      (validation.verdict === 'correct' || validation.verdict === 'accepted-variant') &&
      hintsShown === 0 &&
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
        hintsUsed: hintsShown,
        revealed,
        isRetype: false,
        resolved,
        durationMs: Date.now() - startedAt.current,
        reviewTargets: targetsFor(step),
      });
    } finally {
      setBusy(false);
    }

    if (clean) setFirstTryCorrect((count) => count + 1);

    // Adapt the amount of support for the steps that follow.
    const outcome = clean ? 'clean' : validation.credit > 0 ? 'partial' : 'wrong';
    const nextSupport = adapt(support, outcome);
    if (nextSupport.support !== support.support) {
      setSupportNote(
        presentationFor(nextSupport.support).hintsUnlocked > presentation.hintsUnlocked ? 'up' : 'down',
      );
    }
    setSupport(nextSupport);

    setResult(validation);
    setFeedback(message);
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
    hintsShown,
    revealed,
    support,
    presentation.hintsUnlocked,
    context,
    lessonId,
    say,
    submitAttempt,
    targetsFor,
    t,
  ]);

  const submitRetype = useCallback(async () => {
    if (!current || busy || !result) return;
    const { exercise, step } = current;
    const check = validateAnswer(value, step.answer, { lexicon });
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
        hintsUsed: hintsShown,
        revealed,
        isRetype: true,
        resolved: true,
        durationMs: Date.now() - startedAt.current,
      });
    } finally {
      setBusy(false);
    }
    setRetypeNudge(false);
    setPhase('feedback');
  }, [current, busy, result, value, lexicon, context, lessonId, say, submitAttempt, hintsShown, revealed]);

  const revealAnswer = useCallback(() => {
    if (!current) return;
    setRevealed(true);
    setValue(current.step.answer.accepted[0] ?? '');
    setHintsShown(current.step.hints.length);
    inputRef.current?.focus();
  }, [current]);

  if (!current) {
    return (
      <div className="player player--empty">
        <p>{t('exerciseDone')}</p>
      </div>
    );
  }

  const { exercise, step } = current;
  const scaffold = step.scaffold ? splitScaffold(step.scaffold) : null;
  const hideText = Boolean(step.audio?.hideText);
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
    <div className="player">
      <header className="player__head">
        <div className="player__progress">
          <span className="player__count">{t('exerciseProgress', { done: cursor + 1, total })}</span>
          <div className="player__bar">
            <span style={{ width: `${(cursor / total) * 100}%` }} />
          </div>
        </div>
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

      <div className="task">
        {step.instruction ? <p className="task__instruction">{say(step.instruction)}</p> : null}

        {hideText ? (
          <div className="task__audio-only">
            <AudioButton text={step.audio!.text} />
            <AudioButton text={step.audio!.text} slow />
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
            {lang === 'bg' ? `„${say(step.prompt)}“` : say(step.prompt)}
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
            {presentation.showFirstLetters
              ? firstWordCue(step.answer.accepted[0] ?? '')
              : `${(step.answer.accepted[0] ?? '').split(/\s+/)[0]} …`}
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
              tone={tone}
              focusKey={`${step.id}-${phase}`}
              describedBy="player-keyhint"
            />
          </>
        )}

        {isFree ? <p className="task__note">{t('exerciseFreeWritingNote')}</p> : null}

        {freeNote && !freeNote.ok ? (
          <p className="task__warn" role="status">
            {t('exerciseFreeWritingMissing', { words: freeNote.missing.join(', ') })}
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
            <span className="task__keyhint" id="player-keyhint">
              {t('exerciseEnterToSubmit')}
            </span>
          </div>
        ) : null}

        {hintsShown > 0 && phase !== 'feedback' ? (
          <ul className="hints">
            {step.hints.slice(0, hintsShown).map((hint, index) => (
              <li key={index}>
                <span className="hints__n">{index + 1}</span>
                {say(hint)}
              </li>
            ))}
            {revealed ? <li className="hints__revealed">{t('exerciseRevealWarning')}</li> : null}
          </ul>
        ) : null}
      </div>

      {feedback ? (
        <div className={`feedback feedback--${feedback.tone}`} role="status" aria-live="polite">
          <p className="feedback__headline">{say(feedback.headline)}</p>

          {result && result.verdict !== 'correct' && result.verdict !== 'empty' ? (
            <dl className="feedback__compare">
              <dt>{t('feedbackYourAnswer')}</dt>
              <dd lang="de" className="feedback__given">
                {result.diff.length > 0 ? <TokenDiff result={result} /> : value}
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

          {phase === 'retype' ? (
            <div className="feedback__retype">
              <p className="feedback__retype-label">{t('exerciseRetype')}</p>
              <p className="feedback__retype-target" lang="de">
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

          {phase === 'feedback' ? (
            <div className="task__controls">
              <button ref={continueRef} type="button" className="btn btn--primary" onClick={advance}>
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
    if (!current) return;
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
        credit: validation.credit * hintPenalty(hintsShown, false),
        categories: validation.categories,
        hintsUsed: hintsShown,
        revealed: false,
        isRetype: false,
        resolved: true,
        durationMs: Date.now() - startedAt.current,
        reviewTargets: targetsFor(current.step),
      });
    } finally {
      setBusy(false);
    }
    if (validation.verdict === 'correct' && hintsShown === 0) {
      setFirstTryCorrect((count) => count + 1);
    }
    setResult(validation);
    setFeedback(message);
    setPhase('feedback');
  }
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
