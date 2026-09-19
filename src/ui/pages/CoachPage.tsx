import { useState } from 'react';
import { CATEGORY_LABELS } from '../../i18n.ts';
import { api, type WritingEvaluation } from '../../services/api/client.ts';
import { SPEECH_ROADMAP } from '../../services/speech/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { AnswerInput } from '../components/AnswerInput.tsx';
import { Card } from '../components/bits.tsx';

/**
 * The German Coach.
 *
 * What runs here is the deterministic rule-based reviewer on the server. The
 * page states that plainly, lists the checks that were actually applied, and
 * names the words the checker did not understand. The model-backed features are
 * listed as planned, not shown as broken buttons.
 */
export function CoachPage() {
  const { t, say, lang, coach } = useApp();
  const [text, setText] = useState('');
  const [result, setResult] = useState<WritingEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    if (text.trim().length === 0) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await api.reviewWriting(text, lang, 'pre-a1'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">{t('coachTitle')}</h1>
      <p className="page__lede">{t('coachSubtitle')}</p>

      <Card title={t('coachAiStatus')}>
        <p className="coach-status">
          <span className={`state-dot state-dot--${coach?.aiAvailable ? 'known' : 'new'}`} aria-hidden="true" />
          {coach?.aiAvailable ? `AI: ${coach.provider}` : t('coachNoAi')}
        </p>
      </Card>

      <Card title={t('coachInput')}>
        <AnswerInput
          value={text}
          onChange={setText}
          onSubmit={() => void check()}
          label={t('coachInput')}
          multiline
          placeholder="Ich komme aus Bulgarien. Ich wohne in Hamburg."
        />
        <div className="section-nav">
          <button type="button" className="btn btn--primary" onClick={() => void check()} disabled={busy}>
            {t('coachCheck')}
          </button>
        </div>
        {error ? <p className="task__warn">{error}</p> : null}
      </Card>

      {result ? (
        <>
          <Card title={t('coachFindings')}>
            {result.findings.length === 0 ? (
              <p className="muted">{t('coachNoFindings')}</p>
            ) : (
              <ul className="findings">
                {result.findings.map((finding, index) => (
                  <li key={index}>
                    <span className={`tag tag--${finding.category}`}>
                      {say(CATEGORY_LABELS[finding.category] ?? CATEGORY_LABELS.unknown)}
                    </span>
                    {finding.excerpt ? (
                      <span className="findings__excerpt" lang="de">
                        {finding.excerpt}
                      </span>
                    ) : null}
                    <p className="findings__message">{say(finding.message)}</p>
                    {finding.suggestion ? (
                      <p className="findings__suggestion">
                        {t('coachSuggestion')}:{' '}
                        <strong lang="de">{finding.suggestion}</strong>
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <p className="card__foot">{say(result.note)}</p>
          </Card>

          <div className="grid grid--2">
            <Card title={t('coachChecksApplied')}>
              <ul className="checks">
                {result.checksApplied.map((checkItem, index) => (
                  <li key={index}>{say(checkItem)}</li>
                ))}
              </ul>
            </Card>

            {result.unknownWords.length > 0 ? (
              <Card title={t('coachUnknownWords')}>
                <ul className="pill-list pill-list--muted">
                  {result.unknownWords.map((word) => (
                    <li key={word} lang="de">
                      {word}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        </>
      ) : null}

      <Card title={t('coachPlannedTitle')}>
        <p>{t('coachPlannedBody')}</p>
        <ul className="planned-features">
          {Object.entries<string>({ ...(coach?.features ?? {}), ...SPEECH_ROADMAP }).map(([name, status]) => (
            <li key={name}>
              <code>{name}</code>
              <span className={`badge badge--${status === 'rule-based' || status === 'ai' ? 'available' : 'planned'}`}>
                {status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
