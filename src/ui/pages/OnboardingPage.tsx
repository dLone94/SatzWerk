import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TeachingLanguage } from '../../content/types.ts';
import { contentStats, unauthoredLevels } from '../../content/browser.ts';
import { UI, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Icon } from '../components/icons.tsx';
import { DackelScene } from '../components/Dackel.tsx';

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
  // Named only while some level really is an outline. When none is, the
  // sentence simply ends after the counts.
  const pending = unauthoredLevels().map((level) => level.label);
  const outlineOnly =
    pending.length === 0
      ? ''
      : lang === 'bg'
        ? ` ${pending.join(', ')} засега ${pending.length === 1 ? 'е само план' : 'са само план'}.`
        : ` ${pending.join(', ')} ${pending.length === 1 ? 'is' : 'are'} an outline only so far.`;

  const choose = async (next: TeachingLanguage) => {
    await setTeachingLanguage(next);
  };

  const finish = async () => {
    const minutes = custom.trim().length > 0 ? Number(custom) : target;
    await updateProfile({
      onboarded: true,
      dailyTargetMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : target,
    });
  };

  const start = async () => {
    setBusy(true);
    try {
      await finish();
      navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const startWithPlacement = async () => {
    setBusy(true);
    try {
      await finish();
      navigate('/placement', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboarding">
      <DackelScene className="onboarding__scene" />
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
            <span className="path-card__german">
              <Icon name="arrow" size={16} /> Deutsch
            </span>
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

      {/*
        * Offered after the start button rather than instead of it.
        *
        * Most people opening this already know they are beginners, and making
        * them sit a test before their first lesson would be a strange welcome.
        * The ones who need it are the ones who already speak some German, and
        * they are the ones who will read this line.
        */}
      <p className="onboarding__placement">
        {say('onboardingKnowSome')}{' '}
        <button type="button" className="linklike" onClick={() => void startWithPlacement()} disabled={busy}>
          {say('placementNav')}
        </button>
      </p>

      <p className="onboarding__footnote">{say('onboardingChangeLater')}</p>

      {/*
        * What is here, counted rather than claimed.
        *
        * This line used to end with "Levels A1–B2 are outlines only so far",
        * which was true when it was written and had quietly become false: by
        * then all five levels were authored and the first screen a new learner
        * saw was understating the app. A sentence about what exists has to be
        * derived from what exists, or it goes stale the day after it is typed.
        */}
      <p className="onboarding__content">
        {lang === 'bg'
          ? `Налични сега: ${stats.lessons} урока на ${stats.authoredLevels} нива, ${stats.answerSteps} задачи за писане, ${stats.vocabulary} думи.${outlineOnly}`
          : `Available now: ${stats.lessons} lessons across ${stats.authoredLevels} levels, ${stats.answerSteps} answer tasks, ${stats.vocabulary} words.${outlineOnly}`}
      </p>
    </div>
  );
}
