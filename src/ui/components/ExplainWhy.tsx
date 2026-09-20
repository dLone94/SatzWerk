import { useState } from 'react';
import type { ErrorCategory } from '../../content/types.ts';
import { api } from '../../services/api/client.ts';
import { useApp } from '../../state/AppState.tsx';

/**
 * "Why was this wrong?" — the one question authored content cannot answer.
 *
 * Every lesson here is written by hand, and the traps are written by hand too:
 * if you produce a wrong form somebody anticipated, you get an explanation
 * somebody wrote for exactly that form. But a learner can produce a wrong form
 * nobody anticipated, and until now the app could only show the right answer
 * again, which is not an explanation of anything.
 *
 * Three things make this safe to add to a tool that otherwise refuses to
 * invent German:
 *
 * 1. **It comes after the verdict.** The mark is already decided and banked by
 *    the validator. Nothing here can change whether the answer was right.
 * 2. **It is labelled.** The panel says a model wrote it and that it can be
 *    wrong. A learner has to be able to tell it apart from the authored
 *    explanation two lines above it, or the authored one is worth less.
 * 3. **It is asked for.** It does not appear on its own after every mistake —
 *    a generated paragraph pushed at you on every slip would be noise, and
 *    would cost a request each time.
 *
 * Where no provider is configured this renders nothing at all: not a disabled
 * button, not "coming soon".
 */
export function ExplainWhy({
  expected,
  given,
  categories,
  level,
}: {
  expected: string;
  given: string;
  categories: ErrorCategory[];
  level: string;
}) {
  const { t, lang, coach } = useApp();
  const [state, setState] = useState<'idle' | 'asking' | 'done' | 'failed'>('idle');
  const [explanation, setExplanation] = useState('');
  const [problem, setProblem] = useState('');

  if (!coach?.aiAvailable) return null;

  const ask = async () => {
    setState('asking');
    setProblem('');
    try {
      const result = await api.explainMistake({ expected, given, categories, language: lang, level });
      if (result.explanation) {
        setExplanation(result.explanation);
        setState('done');
        return;
      }
      // The server answered, but with a reason rather than an explanation.
      setProblem(result.error ? result.error[lang] : t('explainFailed'));
      setState('failed');
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : String(cause));
      setState('failed');
    }
  };

  return (
    <div className="explain">
      {state === 'idle' || state === 'asking' ? (
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => void ask()}
          disabled={state === 'asking'}
        >
          {state === 'asking' ? t('explainAsking') : t('explainAsk')}
        </button>
      ) : null}

      {state === 'done' ? (
        <div className="explain__answer">
          {/* The label comes first, before the text it is about. Putting it
              underneath would mean the learner reads the explanation as the
              app's own voice and only afterwards finds out it is not. */}
          <p className="explain__label">{t('explainGenerated')}</p>
          <p className="explain__text">{explanation}</p>
        </div>
      ) : null}

      {state === 'failed' ? <p className="task__warn">{problem}</p> : null}
    </div>
  );
}
