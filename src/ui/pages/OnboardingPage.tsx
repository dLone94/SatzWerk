import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TeachingLanguage } from '../../content/types.ts';
import { contentStats } from '../../content/index.ts';
import { UI, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';

const TARGETS = [10, 20, 30];

/**
 * First run.
 *
 * Deliberately one screen and two decisions. The teaching language is written to
 * the database immediately, so it survives a reload even if the learner stops
 * here.
 */
export function OnboardingPage() {
  const { profile, updateProfile, setTeachingLanguage } = useApp();
  const navigate = useNavigate();
  const [target, setTarget] = useState(profile.dailyTargetMinutes);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  const lang = profile.teachingLanguage;
  const say = (key: keyof typeof UI) => UI[key][lang];
  const stats = contentStats();

  const choose = async (next: TeachingLanguage) => {
    await setTeachingLanguage(next);
  };

  const start = async () => {
    setBusy(true);
    try {
      const minutes = custom.trim().length > 0 ? Number(custom) : target;
      await updateProfile({
        onboarded: true,
        dailyTargetMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : target,
      });
      navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboarding">
      <h1 className="onboarding__title">{say('onboardingTitle')}</h1>
      <p className="onboarding__intro">{say('onboardingIntro')}</p>

      <div className="onboarding__paths">
        {(['en', 'bg'] as const).map((code) => (
          <button
            key={code}
            type="button"
            className={`path-card${lang === code ? ' is-active' : ''}`}
            aria-pressed={lang === code}
            onClick={() => void choose(code)}
          >
            <span className="path-card__flagword">{code === 'en' ? 'English' : 'Български'}</span>
            <span className="path-card__label">
              {code === 'en' ? UI.onboardingPathEn[code] : UI.onboardingPathBg[code]}
            </span>
            <span className="path-card__german">{'→'} Deutsch</span>
          </button>
        ))}
      </div>

      <p className="onboarding__note">{say('onboardingPathNote')}</p>

      <fieldset className="onboarding__target">
        <legend>{say('onboardingTarget')}</legend>
        <div className="chips">
          {TARGETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={`chip chip--choice${target === minutes && custom === '' ? ' is-active' : ''}`}
              aria-pressed={target === minutes && custom === ''}
              onClick={() => {
                setTarget(minutes);
                setCustom('');
              }}
            >
              {tr('settingsMinutes', lang, { n: minutes })}
            </button>
          ))}
          <label className="onboarding__custom">
            <span>{say('settingsCustom')}</span>
            <input
              type="number"
              min={5}
              max={180}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              aria-label={say('settingsCustom')}
            />
          </label>
        </div>
      </fieldset>

      <button type="button" className="btn btn--primary btn--lg" onClick={() => void start()} disabled={busy}>
        {say('onboardingStart')}
      </button>

      <p className="onboarding__footnote">{say('onboardingChangeLater')}</p>

      <p className="onboarding__content">
        {lang === 'bg'
          ? `Налични сега: ${stats.lessons} завършени урока, ${stats.answerSteps} задачи за писане, ${stats.vocabulary} думи. Нивата A1–B2 засега са само план.`
          : `Available now: ${stats.lessons} finished lessons, ${stats.answerSteps} answer tasks, ${stats.vocabulary} words. Levels A1–B2 are outlines only so far.`}
      </p>
    </div>
  );
}
