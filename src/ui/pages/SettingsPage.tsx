import { useEffect, useState } from 'react';
import { contentStats, unauthoredLevels } from '../../content/index.ts';
import type { TeachingLanguage } from '../../content/types.ts';
import { tr } from '../../i18n.ts';
import {
  disablePush,
  enablePush,
  readPushStatus,
  type PushStatus,
} from '../../services/push/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card } from '../components/bits.tsx';

const TARGETS = [10, 20, 30];

export function SettingsPage() {
  const { t, lang, profile, updateProfile, setTeachingLanguage, tts, resetAll, session, signOut, changePassword } =
    useApp();
  const [custom, setCustom] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);
  const stats = contentStats();
  // Named from the curriculum itself, so the sentence cannot outlive the gap
  // it describes.
  const pending = unauthoredLevels().map((level) => level.label);

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
              {tr('settingsMinutes', lang, { n: minutes })}
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
          {tr('settingsMinutes', lang, { n: profile.dailyTargetMinutes })}
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

      <RemindersCard />

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
        {pending.length > 0 ? (
          <p className="card__foot">
            {lang === 'bg'
              ? `${pending.length === 1 ? 'Ниво' : 'Нивата'} ${pending.join(', ')} ${pending.length === 1 ? 'съществува' : 'съществуват'} като структура и план, но още ${pending.length === 1 ? 'не е написано' : 'не са написани'}.`
              : `${pending.length === 1 ? 'Level' : 'Levels'} ${pending.join(', ')} ${pending.length === 1 ? 'exists' : 'exist'} as structure and outline, but ${pending.length === 1 ? 'is' : 'are'} not authored yet.`}
          </p>
        ) : (
          <p className="card__foot">
            {lang === 'bg'
              ? 'Всички нива в структурата са написани.'
              : 'Every level in the structure is authored.'}
          </p>
        )}
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

      {/* Only meaningful on a hosted copy: locally there is no session at all. */}
      {session.required ? (
        <Card title={t('passwordChange')}>
          {session.canChangePassword === false ? (
            <p className="task__warn">{t('passwordFromEnv')}</p>
          ) : (
            <form
              className="password-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (passwordBusy || newPassword.length < 10) return;
                setPasswordBusy(true);
                setPasswordError(null);
                setPasswordDone(false);
                void changePassword(currentPassword, newPassword)
                  .then(() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setPasswordDone(true);
                  })
                  .catch((cause: unknown) =>
                    setPasswordError(cause instanceof Error ? cause.message : String(cause)),
                  )
                  .finally(() => setPasswordBusy(false));
              }}
            >
              <label htmlFor="current-password">{t('passwordCurrent')}</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <label htmlFor="next-password">{t('passwordNew')}</label>
              <input
                id="next-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              {newPassword.length > 0 && newPassword.length < 10 ? (
                <p className="login__hint">{t('setupTooShort')}</p>
              ) : null}
              {passwordError ? (
                <p className="login__error" role="alert">
                  {passwordError}
                </p>
              ) : null}
              {passwordDone ? <p className="done-note">{t('passwordChanged')}</p> : null}
              <button
                type="submit"
                className="btn btn--primary"
                disabled={passwordBusy || newPassword.length < 10 || currentPassword.length === 0}
              >
                {t('passwordChange')}
              </button>
            </form>
          )}
          <p className="card__foot">
            <button type="button" className="btn btn--ghost" onClick={() => void signOut()}>
              {t('signOut')}
            </button>
          </p>
        </Card>
      ) : null}
    </div>
  );
}

/**
 * The reminder switch.
 *
 * Every state gets its own sentence, because the thing to do about each is
 * different: on iPhone the app has to be installed before notifications exist
 * at all, a blocked permission can only be undone in device settings, and an
 * unconfigured server means there is nothing to switch on. A single
 * "couldn't turn on notifications" would leave a learner stuck on all three.
 */
function RemindersCard() {
  const { t, lang } = useApp();
  const [status, setStatus] = useState<PushStatus>({ state: 'unsupported' });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void readPushStatus().then((next) => {
      if (alive) setStatus(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  /*
   * The browser can refuse outright — a service worker that will not register,
   * a push service that is unreachable, a private window where the API exists
   * but does not work. Left uncaught, the tap did nothing at all and the card
   * stayed as it was, which reads as the app being broken. Say what happened.
   */
  const toggle = async () => {
    setBusy(true);
    setFailure(null);
    try {
      setStatus(status.state === 'on' ? await disablePush() : await enablePush());
    } catch (cause) {
      setFailure(cause instanceof Error ? cause.message : String(cause));
      setStatus(await readPushStatus().catch(() => ({ state: 'off' }) as PushStatus));
    } finally {
      setBusy(false);
    }
  };

  const canToggle = status.state === 'on' || status.state === 'off';

  return (
    <Card title={t('remindersTitle')} subtitle={t('remindersWhat')}>
      <p>
        <strong>{status.state === 'on' ? t('remindersOn') : t('remindersOff')}</strong>
      </p>

      {status.state === 'needs-install' ? <p className="muted">{t('remindersNeedsInstall')}</p> : null}
      {status.state === 'unsupported' ? <p className="muted">{t('remindersUnsupported')}</p> : null}
      {status.state === 'not-configured' ? (
        <p className="muted">{t('remindersNotConfigured')}</p>
      ) : null}
      {status.state === 'denied' ? <p className="muted">{t('remindersDenied')}</p> : null}

      {canToggle ? (
        <button
          type="button"
          className={`btn ${status.state === 'on' ? 'btn--ghost' : 'btn--primary'}`}
          onClick={() => void toggle()}
          disabled={busy}
        >
          {busy
            ? t('remindersWorking')
            : status.state === 'on'
              ? t('remindersDisable')
              : t('remindersEnable')}
        </button>
      ) : null}

      {failure ? (
        <p className="task__warn">{tr('remindersFailed', lang, { reason: failure })}</p>
      ) : null}

      <p className="card__foot">{t('remindersHonest')}</p>
    </Card>
  );
}
