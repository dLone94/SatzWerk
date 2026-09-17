import { useState } from 'react';
import { contentStats } from '../../content/index.ts';
import type { TeachingLanguage } from '../../content/types.ts';
import { UI } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card } from '../components/bits.tsx';

const TARGETS = [10, 20, 30];

export function SettingsPage() {
  const { t, lang, profile, updateProfile, setTeachingLanguage, tts, resetAll } = useApp();
  const [custom, setCustom] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const stats = contentStats();

  return (
    <div className="page">
      <h1 className="page__title">{t('settingsTitle')}</h1>

      <Card title={t('settingsLanguage')} subtitle={t('settingsLanguageNote')}>
        <div className="chips">
          {(['en', 'bg'] as TeachingLanguage[]).map((code) => (
            <button
              key={code}
              type="button"
              className={`chip chip--choice${lang === code ? ' is-active' : ''}`}
              aria-pressed={lang === code}
              onClick={() => void setTeachingLanguage(code)}
            >
              {code === 'en' ? 'English' : 'Български'}
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('settingsDailyTarget')}>
        <div className="chips">
          {TARGETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={`chip chip--choice${profile.dailyTargetMinutes === minutes ? ' is-active' : ''}`}
              aria-pressed={profile.dailyTargetMinutes === minutes}
              onClick={() => void updateProfile({ dailyTargetMinutes: minutes })}
            >
              {UI.settingsMinutes[lang].replace('{n}', String(minutes))}
            </button>
          ))}
          <label className="onboarding__custom">
            <span>{t('settingsCustom')}</span>
            <input
              type="number"
              min={5}
              max={180}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              onBlur={() => {
                const minutes = Number(custom);
                if (Number.isFinite(minutes) && minutes >= 5) {
                  void updateProfile({ dailyTargetMinutes: minutes });
                }
              }}
              aria-label={t('settingsCustom')}
            />
          </label>
        </div>
        <p className="card__foot">
          {UI.settingsMinutes[lang].replace('{n}', String(profile.dailyTargetMinutes))}
        </p>
      </Card>

      <Card title={t('settingsAudio')}>
        <p>
          {t('settingsVoice')}: <strong>{tts.available ? tts.describe() : t('exerciseAudioUnavailable')}</strong>
        </p>
        {tts.available ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => tts.speak('Guten Tag! Ich heiße SatzWerk.')}
          >
            {t('exercisePlayAudio')}
          </button>
        ) : null}
        <p className="card__foot">
          {lang === 'bg'
            ? 'Говорът минава през сменяем TTSProvider. Браузърният глас de-DE е резервният вариант.'
            : 'Speech goes through a replaceable TTSProvider. The de-DE browser voice is the fallback.'}
        </p>
      </Card>

      <Card title={t('settingsContent')}>
        <ul className="content-stats">
          <li>
            {lang === 'bg' ? 'Нива в структурата' : 'Levels in the structure'}: <strong>{stats.levels}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Завършени урока' : 'Finished lessons'}: <strong>{stats.lessons}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Упражнения' : 'Exercises'}: <strong>{stats.exercises}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Задачи за отговор' : 'Answer tasks'}: <strong>{stats.answerSteps}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Думи в речника' : 'Vocabulary entries'}: <strong>{stats.vocabulary}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Граматични теми' : 'Grammar concepts'}: <strong>{stats.grammarConcepts}</strong>
          </li>
          <li>
            {lang === 'bg' ? 'Контролни проверки' : 'Checkpoints'}: <strong>{stats.checkpoints}</strong>
          </li>
        </ul>
        <p className="card__foot">
          {lang === 'bg'
            ? 'Нивата A1–B2 съществуват като структура и план, но още не са написани.'
            : 'Levels A1–B2 exist as structure and outline, but are not authored yet.'}
        </p>
      </Card>

      <Card title={t('settingsData')} subtitle={t('settingsDataNote')}>
        <p className="task__warn">{t('settingsResetConfirm')}</p>
        <div className="reset-row">
          <input
            type="text"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            aria-label={t('settingsResetConfirm')}
            placeholder="DELETE"
          />
          <button
            type="button"
            className="btn btn--danger"
            disabled={confirm !== 'DELETE'}
            onClick={() => {
              void resetAll().then(() => {
                setConfirm('');
                setResetDone(true);
              });
            }}
          >
            {t('settingsReset')}
          </button>
        </div>
        {resetDone ? <p className="done-note">{t('settingsResetDone')}</p> : null}
      </Card>
    </div>
  );
}
