import { useEffect, useState } from 'react';
import { contentStats, partialLevels, unauthoredLevels } from '../../content/index.ts';
import type { TeachingLanguage } from '../../content/types.ts';
import { tr } from '../../i18n.ts';
import {
  disablePush,
  enablePush,
  readPushStatus,
  type PushStatus,
} from '../../services/push/index.ts';
import { SAMPLE_PHRASE } from '../../services/tts/phraseKey.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card } from '../components/bits.tsx';

const TARGETS = [10, 20, 30];

export function SettingsPage() {
  const { t, lang, profile, updateProfile, setTeachingLanguage, resetAll, session, signOut, changePassword } =
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
  // A level with two of its five units written is neither "not authored yet"
  // nor finished, and saying either would be an overstatement in one direction
  // or the other. It gets its own sentence, with its own real numbers.
  const started = partialLevels();

  return (
    <div className="page">
      <h1 className="page__title">{t('settingsTitle')}</h1>

      <Learners />

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

      <VoiceCard />

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
        ) : null}
        {started.length > 0 ? (
          <p className="card__foot">
            {started
              .map(({ level, written, planned }) =>
                lang === 'bg'
                  ? `Ниво ${level.label} се пише: ${written} ${written === 1 ? 'написан раздел' : 'написани раздела'}, още ${planned} по план.`
                  : `Level ${level.label} is being written: ${written} ${written === 1 ? 'unit' : 'units'} so far, ${planned} still outlined.`,
              )
              .join(' ')}
          </p>
        ) : null}
        {pending.length === 0 && started.length === 0 ? (
          <p className="card__foot">
            {lang === 'bg'
              ? 'Всички нива в структурата са написани.'
              : 'Every level in the structure is authored.'}
          </p>
        ) : null}
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


/**
 * Who is studying.
 *
 * A household shares one password and one copy of the app, so this is a switch
 * rather than a second login — and it says so, because a control that looks
 * like a lock and is not would be worse than no control. What it does buy is
 * real: separate progress, separate reviews, and a teaching path each, so
 * German through English and German through Bulgarian can happen in the same
 * flat on the same evening.
 */
function Learners() {
  const { t, learners, studyingAs, studyAs, addLearner, renameLearner } = useApp();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(0);

  const hand = async (id: number) => {
    setBusy(true);
    setWaiting(0);
    try {
      const outcome = await studyAs(id);
      if (outcome === 'answers-waiting') setWaiting(1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={t('learnersTitle')} subtitle={t('learnersNote')}>
      <ul className="learners">
        {learners.map((learner) => (
          <li key={learner.id} className={`learners__row${learner.id === studyingAs ? ' is-active' : ''}`}>
            <span className="learners__name">{learner.name}</span>
            {learner.id === studyingAs ? (
              <span className="learners__badge">{t('learnersStudying')}</span>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={busy}
                onClick={() => void hand(learner.id)}
              >
                {t('learnersSwitch')}
              </button>
            )}
            <button
              type="button"
              className="btn btn--quiet btn--sm"
              onClick={() => {
                const next = window.prompt(t('learnersName'), learner.name);
                if (next && next.trim()) void renameLearner(learner.id, next.trim());
              }}
            >
              {t('learnersRename')}
            </button>
          </li>
        ))}
      </ul>

      {waiting > 0 ? (
        <p className="task__warn" role="status">
          {t('learnersWaiting', { n: waiting })}
        </p>
      ) : null}

      <form
        className="learners__add"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          void addLearner(name.trim()).finally(() => {
            setName('');
            setBusy(false);
          });
        }}
      >
        <label htmlFor="learner-name">{t('learnersAdd')}</label>
        <input
          id="learner-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('learnersName')}
          maxLength={40}
        />
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy || !name.trim()}>
          {t('learnersSave')}
        </button>
      </form>

      <p className="card__foot">{t('learnersNotAWall')}</p>
    </Card>
  );
}

/**
 * Which German voice reads to you.
 *
 * The app picks the best one this device has, and the list lets you overrule
 * it. The choice is kept on this device only: a voice installed on your phone
 * does not exist on your laptop.
 */
function VoiceCard() {
  const { t, tts } = useApp();
  // Voices turn up after the page loads; re-render when they do.
  const [, setTick] = useState(0);
  useEffect(() => tts.subscribe?.(() => setTick((tick) => tick + 1)), [tts]);

  const voices = tts.voices?.() ?? [];
  const chosen = tts.chosenVoice?.() ?? null;
  const best = voices[0];
  const quality = (option: { quality: string }) =>
    option.quality === 'premium' ? t('voiceQualityPremium') : option.quality === 'good' ? t('voiceQualityGood') : t('voiceQualityBasic');

  if (!tts.available) {
    return (
      <Card title={t('settingsAudio')}>
        <p>{t('exerciseAudioUnavailable')}</p>
      </Card>
    );
  }

  return (
    <Card title={t('settingsAudio')}>
      {voices.length > 0 ? (
        <label className="field">
          <span className="field__label">{t('settingsVoice')}</span>
          <select
            className="field__input"
            value={chosen && voices.some((voice) => voice.id === chosen) ? chosen : ''}
            onChange={(event) => tts.chooseVoice?.(event.target.value || null)}
          >
            <option value="">{t('voiceAutomatic', { name: best ? `${best.name} · ${quality(best)}` : '—' })}</option>
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} · {quality(voice)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>
          {t('settingsVoice')}: <strong>{tts.describe()}</strong>
        </p>
      )}
      <button type="button" className="btn btn--ghost" onClick={() => tts.speak(SAMPLE_PHRASE)}>
        {t('voiceSample')}
      </button>
      {/* Only worth saying when the best voice here is not a good one. */}
      {best?.quality !== 'premium' ? (
        <div className="voice-tip">
          <p className="voice-tip__title">{t('voiceTipTitle')}</p>
          <p>{t('voiceTipIphone')}</p>
          <p>{t('voiceTipAndroid')}</p>
        </div>
      ) : null}
    </Card>
  );
}
