import { useEffect, useRef, useState } from 'react';
import { tr } from '../../i18n.ts';
import {
  enablePush,
  inviteOffered,
  readPushStatus,
  reminderClockWindow,
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
 * It counts as offered once it is on screen, answered or not: a learner who
 * scrolls past it to the next lesson has answered too, and keeping it until
 * it is tapped would put it under every lesson until it is, which is the
 * nagging the reminders themselves promise not to do. Once per device rather
 * than per learner, because what it sets up is the browser's: a second
 * learner on a shared phone gets that phone's reminders, and Settings.
 * A browser that has granted permission and has no subscription had them on
 * and turned them off, so it is not asked again.
 *
 * On an iPhone in Safari there is no push at all until the app is on the Home
 * Screen, so there it shows how to put it there instead, and the invitation
 * proper waits for the installed app, where it is offered afresh.
 */
type Shown =
  | { kind: 'enable'; status: PushStatus }
  | { kind: 'install' }
  | { kind: 'result'; status: PushStatus; failure?: string };

/** What a keyboard can reach, for finding the control before the card. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]';

export function ReminderInvite() {
  const { t, lang } = useApp();
  const [shown, setShown] = useState<Shown | null>(null);
  const [busy, setBusy] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);

  // The answer replaces the buttons that were just pressed: focus its title,
  // which is described by the answer, so it is read out where it appears.
  useEffect(() => {
    if (shown?.kind === 'result') title.current?.focus();
  }, [shown]);

  /*
   * Gone, the card would take focus with it to the top of the page. It goes
   * to the last control before the card instead (the finished screen's own
   * buttons), so the next Tab carries on from where the learner was.
   */
  const dismiss = () => {
    const card = title.current?.closest('section');
    if (card) {
      const before = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => card.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING,
      );
      before.at(-1)?.focus();
    }
    setShown(null);
  };

  useEffect(() => {
    // A device that has been asked has its answer; nothing to look up.
    if (inviteOffered('enable')) return;
    let alive = true;
    void readPushStatus()
      .then((status) => {
        if (!alive) return;
        if (status.state === 'off' && !status.turnedOff) {
          rememberInviteOffered('enable');
          setShown({ kind: 'enable', status });
        } else if (status.state === 'needs-install' && !inviteOffered('install')) {
          rememberInviteOffered('install');
          setShown({ kind: 'install' });
        }
        // On, turned off, blocked, unsupported or not configured: nothing to
        // invite, and nothing used up, so the question can still come if that
        // changes.
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  if (!shown) return null;

  if (shown.kind === 'install') {
    return (
      <Card title={t('installTitle')} subtitle={t('installWhy')} titleRef={title}>
        <ol className="reminder-invite__steps">
          <li>{t('installStepShare')}</li>
          <li>{t('installStepAdd')}</li>
          <li>{t('installStepOpen')}</li>
        </ol>
        <div className="section-nav">
          <button type="button" className="btn btn--ghost" onClick={dismiss}>
            {t('installGotIt')}
          </button>
        </div>
      </Card>
    );
  }

  if (shown.kind === 'result') {
    const { status, failure } = shown;
    // Not on, and not something only the device's own settings can change:
    // the switch in Settings is the way on from here.
    const retry = Boolean(failure) || status.state === 'off';
    return (
      <Card title={t('inviteTitle')} titleRef={title} titleDescribedBy="reminder-invite-answer">
        <div role="status" id="reminder-invite-answer">
          <p>
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
          {retry ? <p>{t('inviteRetry')}</p> : null}
        </div>
        <div className="section-nav">
          <button type="button" className="btn btn--ghost" onClick={dismiss}>
            {t('inviteClose')}
          </button>
        </div>
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
    <Card title={t('inviteTitle')} titleRef={title}>
      <p>{hour === undefined ? t('inviteWhenever') : t('inviteWhen', reminderClockWindow(hour, lang))}</p>
      <div className="section-nav">
        <button type="button" className="btn btn--primary" disabled={busy} onClick={() => void accept()}>
          {busy ? t('remindersWorking') : t('remindersEnable')}
        </button>
        <button type="button" className="btn btn--ghost" disabled={busy} onClick={dismiss}>
          {t('inviteNotNow')}
        </button>
      </div>
      <p className="card__foot">{t('inviteHonest')}</p>
    </Card>
  );
}
