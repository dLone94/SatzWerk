// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { stubState } from './playerStub.tsx';

/**
 * Asking to send reminders, once, at the moment it makes sense.
 *
 * The switch lived only in Settings, where a beginner never looks in their
 * first week, and nothing told an iPhone learner that reminders need the app
 * on the Home Screen. The invitation now comes at the end of a finished lesson
 * or daily practice: never on first opening the app, and only once on a
 * device, whatever the answer.
 */

const { enablePush, readPushStatus } = vi.hoisted(() => ({
  enablePush: vi.fn(),
  readPushStatus: vi.fn(),
}));

vi.mock('../../src/services/push/index.ts', async (original) => {
  const real = await original<typeof import('../../src/services/push/index.ts')>();
  return { ...real, enablePush, readPushStatus };
});

const { ReminderInvite } = await import('../../src/ui/components/ReminderInvite.tsx');
const { reminderClockTime } = await import('../../src/services/push/index.ts');

const mount = (lang: 'en' | 'bg' = 'en') =>
  render(
    <AppStateContext.Provider value={stubState({}, lang)}>
      <ReminderInvite />
    </AppStateContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
afterEach(cleanup);

describe('the invitation to be reminded', () => {
  it.each(['en', 'bg'] as const)('says when, and turns reminders on from the tap, in %s', async (lang) => {
    readPushStatus.mockResolvedValue({ state: 'off', sendHourUtc: 18 });
    enablePush.mockResolvedValue({ state: 'on', endpoint: 'https://push.example/x', sendHourUtc: 18 });
    mount(lang);

    expect(await screen.findByRole('heading', { name: tr('inviteTitle', lang) })).toBeInTheDocument();
    expect(screen.getByText(tr('inviteWhen', lang, { time: reminderClockTime(18, lang) }))).toBeInTheDocument();
    // Nothing is asked of the browser until the learner taps.
    expect(enablePush).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: tr('remindersEnable', lang) }));
    expect(enablePush).toHaveBeenCalledOnce();
    expect(await screen.findByText(tr('inviteDone', lang))).toBeInTheDocument();
  });

  it('names no time when the server does not know one', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    mount();
    expect(await screen.findByText(tr('inviteWhenever', 'en'))).toBeInTheDocument();
  });

  it('is offered once on a device, whatever the answer', async () => {
    readPushStatus.mockResolvedValue({ state: 'off', sendHourUtc: 18 });
    const first = mount();
    await screen.findByRole('heading', { name: tr('inviteTitle', 'en') });
    first.unmount();

    // The next finished lesson: nothing, and the browser is not even asked.
    mount();
    await waitFor(() => expect(readPushStatus).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('heading', { name: tr('inviteTitle', 'en') })).not.toBeInTheDocument();
  });

  it('goes away when the learner says not now', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    mount();
    await userEvent.click(await screen.findByRole('button', { name: tr('inviteNotNow', 'en') }));
    expect(screen.queryByRole('heading', { name: tr('inviteTitle', 'en') })).not.toBeInTheDocument();
    expect(enablePush).not.toHaveBeenCalled();
  });

  /*
   * The card goes or changes under the learner's finger. Left alone, focus
   * falls to the top of the page and a keyboard or screen reader user starts
   * again from the header.
   */
  it('keeps the learner where they were when the card changes or goes', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    enablePush.mockResolvedValue({ state: 'on', endpoint: 'https://push.example/x' });
    const page = () =>
      render(
        <AppStateContext.Provider value={stubState({}, 'en')}>
          <button type="button">Today</button>
          <ReminderInvite />
          <a href="/next">Later</a>
        </AppStateContext.Provider>,
      );
    page();
    await userEvent.click(await screen.findByRole('button', { name: tr('remindersEnable', 'en') }));
    // The answer, focused through its title, so it is read out in place.
    await screen.findByText(tr('inviteDone', 'en'));
    expect(screen.getByRole('heading', { name: tr('inviteTitle', 'en') })).toHaveFocus();

    cleanup();
    localStorage.clear();
    page();
    await userEvent.click(await screen.findByRole('button', { name: tr('inviteNotNow', 'en') }));
    // Gone: focus on the control just before it, so Tab goes on from there.
    expect(screen.getByRole('button', { name: 'Today' })).toHaveFocus();
  });

  it('says what happened when the browser refuses', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    enablePush.mockResolvedValue({ state: 'denied' });
    mount();
    await userEvent.click(await screen.findByRole('button', { name: tr('remindersEnable', 'en') }));
    expect(await screen.findByText(tr('remindersDenied', 'en'))).toBeInTheDocument();

    cleanup();
    enablePush.mockRejectedValue(new Error('push service unreachable'));
    localStorage.clear();
    mount();
    await userEvent.click(await screen.findByRole('button', { name: tr('remindersEnable', 'en') }));
    expect(
      await screen.findByText(tr('remindersFailed', 'en', { reason: 'push service unreachable' })),
    ).toBeInTheDocument();
  });

  it.each([['on'], ['unsupported'], ['not-configured'], ['denied']])(
    'is not offered when reminders are %s',
    async (state) => {
      readPushStatus.mockResolvedValue({ state });
      mount();
      await waitFor(() => expect(readPushStatus).toHaveBeenCalled());
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      // And not used up: if that changes, the invitation can still come.
      expect(localStorage.length).toBe(0);
    },
  );
});

describe('on an iPhone in Safari', () => {
  it.each(['en', 'bg'] as const)('shows how to add the app to the Home Screen, in %s', async (lang) => {
    readPushStatus.mockResolvedValue({ state: 'needs-install' });
    mount(lang);
    expect(await screen.findByRole('heading', { name: tr('installTitle', lang) })).toBeInTheDocument();
    const steps = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(steps).toEqual([tr('installStepShare', lang), tr('installStepAdd', lang), tr('installStepOpen', lang)]);
    await userEvent.click(screen.getByRole('button', { name: tr('installGotIt', lang) }));
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  /*
   * Installed, the app is a new place: push exists there, and the learner
   * has never been asked about reminders in it. Seeing the install steps
   * must not use up the invitation that only makes sense afterwards.
   */
  it('still invites reminders once the app is installed', async () => {
    readPushStatus.mockResolvedValue({ state: 'needs-install' });
    const safari = mount();
    await screen.findByRole('heading', { name: tr('installTitle', 'en') });
    safari.unmount();

    readPushStatus.mockResolvedValue({ state: 'off' });
    mount();
    expect(await screen.findByRole('heading', { name: tr('inviteTitle', 'en') })).toBeInTheDocument();
  });
});

describe('the reminder time', () => {
  it('is the job’s hour in the learner’s own clock', () => {
    const summer = new Date('2026-07-01T12:00:00Z');
    const expected = new Date(Date.UTC(2026, 6, 1, 18)).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(reminderClockTime(18, 'en', summer)).toBe(expected);
  });
});
