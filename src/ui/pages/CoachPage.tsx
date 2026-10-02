import { useState } from 'react';
import { CATEGORY_LABELS, type UiKey } from '../../i18n.ts';
import { api, type WritingEvaluation } from '../../services/api/client.ts';
import { useApp } from '../../state/AppState.tsx';
import { AnswerInput } from '../components/AnswerInput.tsx';
import { Card } from '../components/bits.tsx';

/**
 * The German Coach.
 *
 * What runs here is the deterministic rule-based reviewer on the server. The
 * page states that plainly, lists the checks that were actually applied, and
 * names the words the checker did not understand. What the coach cannot do is
 * listed in plain words, not shown as broken buttons.
 */
export function CoachPage() {
  const { t, say, lang, coach, recogniser } = useApp();
  const [text, setText] = useState('');
  const [result, setResult] = useState<WritingEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /*
   * What a screen reader hears after a check. The results used to appear
   * with no live region at all, so pressing the button seemed to do nothing.
   * This region is there from the start and only its text changes; it is
   * emptied first, so the same outcome twice is still news.
   */
  const [announcement, setAnnouncement] = useState('');

  const check = async () => {
    if (text.trim().length === 0) return;
    setBusy(true);
    setError(null);
    setAnnouncement('');
    try {
      const evaluation = await api.reviewWriting(text, lang, 'pre-a1');
      setResult(evaluation);
      const summary =
        evaluation.findings.length === 0 ? t('coachNoFindings') : t('coachFindingsCount', { n: evaluation.findings.length });
      window.setTimeout(() => setAnnouncement(summary), 50);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" data-study-active="true">
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
        {error ? (
          <p className="task__warn" role="alert">
            {error}
          </p>
        ) : null}
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
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

      <Card title={t('coachAbilitiesTitle')}>
        <ul className="planned-features">
          {coachAbilities(coach?.features ?? {}, recogniser.available).map(({ ability, state }) => (
            <li key={ability}>
              <span>{t(ABILITY_LABELS[ability])}</span>
              <span className={`badge badge--${state === 'yes' || state === 'yesAi' ? 'available' : 'planned'}`}>
                {t(STATE_LABELS[state])}
              </span>
            </li>
          ))}
        </ul>
        <p className="muted">{t('coachAbilitiesBody')}</p>
      </Card>
    </div>
  );
}

export type Ability = 'writing' | 'explain' | 'speaking' | 'pronunciation' | 'practice' | 'conversation';
export type AbilityState = 'yes' | 'yesAi' | 'notYet' | 'notHere' | 'never';

const ABILITY_LABELS = {
  writing: 'coachAbilityWriting',
  explain: 'coachAbilityExplain',
  speaking: 'coachAbilitySpeaking',
  pronunciation: 'coachAbilityPronunciation',
  practice: 'coachAbilityPractice',
  conversation: 'coachAbilityConversation',
} as const satisfies Record<Ability, UiKey>;

const STATE_LABELS = {
  yes: 'coachCanYes',
  yesAi: 'coachCanYesAi',
  notYet: 'coachCanNotYet',
  notHere: 'coachCanNotHere',
  never: 'coachCanNever',
} as const satisfies Record<AbilityState, UiKey>;

/**
 * What the coach can do on this device, in the learner's terms.
 *
 * The server reports its own features; speaking depends on this browser, so
 * the page decides that one. Anything the server does not mention falls back to
 * the honest answer: rule checks always exist, the rest is not there yet.
 */
export function coachAbilities(
  features: Record<string, string>,
  speechAvailable: boolean,
): { ability: Ability; state: AbilityState }[] {
  const decided = (value: string | undefined): AbilityState =>
    value === 'not-generated' ? 'never' : value === 'ai' ? 'yes' : 'notYet';
  return [
    { ability: 'writing', state: features.writingReview?.includes('ai') ? 'yesAi' : 'yes' },
    { ability: 'explain', state: decided(features.explainMistake) },
    { ability: 'speaking', state: speechAvailable ? 'yes' : 'notHere' },
    { ability: 'pronunciation', state: 'notYet' },
    { ability: 'practice', state: decided(features.generatePractice) },
    { ability: 'conversation', state: decided(features.conversation) },
  ];
}
