import { useEffect, useState } from 'react';
import { tr } from '../../i18n.ts';
import {
  enablePush,
  inviteOffered,
  readPushStatus,
  reminderClockTime,
  rememberInviteOffered,
  type PushStatus,
} from '../../services/push/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card } from './bits.tsx';

/**
 * Asking whether to send reminders, once, when the answer means something.
 *
 * The switch used to live only in Settings, which a beginner does not open in
 * their first week, and that week is when a reminder helps most. This sits on
 * the screen that ends a finished lesson or daily practice: the learner has
 * just seen what a session is, so "shall we remind you?" is a real question,
 * and the tap it asks for is the gesture a permission prompt needs. Never on
 * first opening the app, when there is nothing yet to be reminded of.
 *
 * Offered once on a device, whatever the answer; Settings keeps the switch.
 * On an iPhone in Safari there is no push at all until the app is on the Home
 * Screen, so there it shows how to put it there instead, and the invitation
 * proper waits for the installed app, where it is offered afresh.
 */
type Shown =
  | { kind: 'enable'; status: PushStatus }
  | { kind: 'install' }
  | { kind: 'result'; status: PushStatus; failure?: string };

export function ReminderInvite() {
  const { t, lang } = useApp();
  const [shown, setShown] = useState<Shown | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // A device that has been asked has its answer; nothing to look up.
    if (inviteOffered('enable')) return;
    let alive = true;
    void readPushStatus()
      .then((status) => {
        if (!alive) return;
        if (status.state === 'off') {
          rememberInviteOffered('enable');
          setShown({ kind: 'enable', status });
        } else if (status.state === 'needs-install' && !inviteOffered('install')) {
          rememberInviteOffered('install');
          setShown({ kind: 'install' });
        }
        // On, blocked, unsupported or not configured: nothing to invite, and
        // nothing used up, so the question can still come if that changes.
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!shown) return null;

  if (shown.kind === 'install') {
    return (
      <Card title={t('installTitle')} subtitle={t('installWhy')}>
        <ol className="reminder-invite__steps">
          <li>{t('installStepShare')}</li>
          <li>{t('installStepAdd')}</li>
          <li>{t('installStepOpen')}</li>
        </ol>
        <div className="section-nav">
          <button type="button" className="btn btn--ghost" onClick={() => setShown(null)}>
            {t('installGotIt')}
          </button>
        </div>
      </Card>
    );
  }

  if (shown.kind === 'result') {
    const { status, failure } = shown;
    return (
      <Card title={t('inviteTitle')}>
        <p role="status">
          {failure
            ? tr('remindersFailed', lang, { reason: failure })
            : status.state === 'on'
              ? t('inviteDone')
              : status.state === 'denied'
                ? t('remindersDenied')
                : status.state === 'needs-install'
                  ? t('remindersNeedsInstall')
                  : status.state === 'unsupported'
                    ? t('remindersUnsupported')
                    : status.state === 'not-configured'
                      ? t('remindersNotConfigured')
                      : t('remindersOff')}
        </p>
      </Card>
    );
  }

  const hour = shown.status.sendHourUtc;
  // The browser can refuse outright; say so rather than leave a dead button.
  const accept = async () => {
    setBusy(true);
    try {
      setShown({ kind: 'result', status: await enablePush() });
    } catch (cause) {
      setShown({
        kind: 'result',
        status: { state: 'off' },
        failure: cause instanceof Error ? cause.message : String(cause),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title={t('inviteTitle')}>
      <p>{hour === undefined ? t('inviteWhenever') : t('inviteWhen', { time: reminderClockTime(hour, lang) })}</p>
      <div className="section-nav">
        <button type="button" className="btn btn--primary" disabled={busy} onClick={() => void accept()}>
          {busy ? t('remindersWorking') : t('remindersEnable')}
        </button>
        <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => setShown(null)}>
          {t('inviteNotNow')}
        </button>
      </div>
      <p className="card__foot">{t('inviteHonest')}</p>
    </Card>
  );
}
