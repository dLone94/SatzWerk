import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnswerSpec } from '../../content/types.ts';
import { judgeSpoken, type SpokenJudgement } from '../../core/validation/speech.ts';
import type { RecognitionError } from '../../services/speech/recogniser.ts';
import { useApp } from '../../state/AppState.tsx';

/*
 * The two speaking controls.
 *
 * `SpeakCheck` comes after a correct answer: say the sentence and find out
 * whether a machine understood it. `SpeakAnswer` comes instead of typing one,
 * in a conversation, where saying your line is the thing being rehearsed.
 * They share the microphone, the error wording and the icon.
 */

/**
 * Say the sentence, and find out whether a machine understood it.
 *
 * Three rules hold this component together:
 *
 *  1. If the browser has no recogniser, it renders nothing. Not a disabled
 *     button, not a "coming soon" — nothing. A control that cannot work is
 *     worse than an absent one.
 *  2. It never shows a score. What it shows is what the recogniser heard,
 *     beside what the sentence was, and it says in words that this is a test
 *     of being understood rather than a judgement of an accent.
 *  3. It never blocks. Speaking is offered after the answer is already right,
 *     so a missing microphone, a noisy room or a recogniser that mishears can
 *     cost the learner nothing.
 */
export function SpeakCheck({ target, spec }: { target: string; spec?: AnswerSpec }) {
  const { t, recogniser, lexicon } = useApp();
  const [phase, setPhase] = useState<'idle' | 'listening' | 'done'>('idle');
  const [partial, setPartial] = useState('');
  const [judgement, setJudgement] = useState<SpokenJudgement | null>(null);
  const [error, setError] = useState<RecognitionError | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      recogniser.stop();
    };
  }, [recogniser]);

  const listen = useCallback(async () => {
    setPhase('listening');
    setPartial('');
    setJudgement(null);
    setError(null);

    const result = await recogniser.listen({
      lang: 'de-DE',
      onPartial: (text) => {
        if (alive.current) setPartial(text);
      },
    });
    if (!alive.current) return;

    if (!result.transcript) {
      setError(result.error ?? 'failed');
      setPhase('idle');
      return;
    }

    // The spec carries the alternatives and the authored traps, so a spoken
    // answer is judged by the same rules as a typed one. Without one — on a
    // vocabulary page, say — the target is the only accepted answer.
    const answer: AnswerSpec = spec ?? { accepted: [target], shape: 'phrase' };
    setJudgement(judgeSpoken(result.transcript, answer, { lexicon }));
    setPhase('done');
  }, [recogniser, spec, target, lexicon]);

  // Nothing to listen with: say nothing rather than promising something.
  if (!recogniser.available) return null;

  return (
    <div className="speak">
      <div className="speak__row">
        {phase === 'listening' ? (
          <button type="button" className="btn btn--ghost btn--sm speak__btn is-listening" onClick={() => recogniser.stop()}>
            <span className="speak__pulse" aria-hidden="true" />
            {t('speakStop')}
          </button>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm speak__btn" onClick={() => void listen()}>
            <MicIcon />
            {judgement || error ? t('speakAgain') : t('speakTry')}
          </button>
        )}

        {phase === 'listening' ? (
          <span className="speak__status" role="status">
            {partial || t('speakListening')}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="speak__error" role="status">
          {t(ERROR_KEYS[error])}
        </p>
      ) : null}

      {judgement ? (
        <div
          className={`speak__result${judgement.understood ? ' speak__result--ok' : ''}`}
          role="status"
        >
          <p className="speak__verdict">
            {judgement.understood ? t('speakUnderstood') : t('speakNotQuite')}
          </p>
          <dl className="speak__compare">
            <dt>{t('speakHeard')}</dt>
            <dd lang="de">{judgement.heard}</dd>
          </dl>
          {!judgement.understood ? (
            <p className="speak__target" lang="de">
              {target}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Said every time the panel is open, not hidden behind an info icon:
          it is the difference between what this does and what a learner might
          assume it does. */}
      {judgement || error ? <p className="speak__note">{t('speakWhatItMeans')}</p> : null}
    </div>
  );
}

const ERROR_KEYS: Record<RecognitionError, 'speakDenied' | 'speakNoSpeech' | 'speakNoMatch' | 'speakNetwork' | 'speakFailed'> = {
  denied: 'speakDenied',
  'no-speech': 'speakNoSpeech',
  'no-match': 'speakNoMatch',
  network: 'speakNetwork',
  aborted: 'speakNoSpeech',
  unsupported: 'speakFailed',
  failed: 'speakFailed',
};

function MicIcon() {
  return (
    <svg className="speak__icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}


/**
 * Answer by speaking, in a conversation.
 *
 * Only Real Life offers this, and the boundary is deliberate. Typing is the
 * discipline the course is built on — a lesson makes you produce the letters,
 * including the ones a phone keyboard hides — and letting a lesson be answered
 * aloud would quietly remove the practice it exists for. A conversation is the
 * opposite case: in a bakery nobody types, and the line you have to produce is
 * a spoken one.
 *
 * What it does *not* do is submit for you. The transcript goes into the answer
 * box and stops there, because a recogniser mishears, and being marked wrong
 * for a machine's mistake would be the worst kind of unfair feedback. The
 * learner reads what landed, fixes it if it is wrong, and presses enter — so
 * the answer that reaches the validator is always one somebody chose to send.
 */
export function SpeakAnswer({ onHeard }: { onHeard: (text: string) => void }) {
  const { t, recogniser } = useApp();
  const [phase, setPhase] = useState<'idle' | 'listening'>('idle');
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<RecognitionError | null>(null);
  const [heard, setHeard] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      recogniser.stop();
    };
  }, [recogniser]);

  const listen = useCallback(async () => {
    setPhase('listening');
    setPartial('');
    setError(null);

    const result = await recogniser.listen({
      lang: 'de-DE',
      onPartial: (text) => {
        if (alive.current) setPartial(text);
      },
    });
    if (!alive.current) return;

    setPhase('idle');
    if (!result.transcript) {
      setError(result.error ?? 'failed');
      return;
    }
    setHeard(true);
    onHeard(result.transcript);
  }, [recogniser, onHeard]);

  // Nothing to listen with: say nothing rather than promising something.
  if (!recogniser.available) return null;

  return (
    <div className="speak speak--answer">
      <div className="speak__row">
        {phase === 'listening' ? (
          <button
            type="button"
            className="btn btn--ghost btn--sm speak__btn is-listening"
            onClick={() => recogniser.stop()}
          >
            <span className="speak__pulse" aria-hidden="true" />
            {t('speakStop')}
          </button>
        ) : (
          <button type="button" className="btn btn--ghost btn--sm speak__btn" onClick={() => void listen()}>
            <MicIcon />
            {heard || error ? t('speakAgain') : t('speakSay')}
          </button>
        )}

        {phase === 'listening' ? (
          <span className="speak__status" role="status">
            {partial || t('speakListening')}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="speak__error" role="status">
          {t(ERROR_KEYS[error])}
        </p>
      ) : null}

      {/* Said once something has been heard, because that is the moment it
          matters: the box holds a machine's guess, not a verdict. */}
      {heard && !error ? <p className="speak__note">{t('speakSayHint')}</p> : null}
    </div>
  );
}
