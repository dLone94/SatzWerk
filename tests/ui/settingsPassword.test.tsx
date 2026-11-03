// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import type { SessionState } from '../../src/services/api/client.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { SettingsPage } from '../../src/ui/pages/SettingsPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * The first password on a local copy.
 *
 * The README, the server's startup line and its refusal to finish setup from
 * another device all say to choose the password in Settings on this computer.
 * Settings only had a card for changing one, shown only once a password
 * existed, so there was nowhere to choose it and a phone could never sign in.
 */

function Harness({ changePassword }: { changePassword: (current: string, next: string) => Promise<void> }) {
  const [session, setSession] = useState<SessionState>({ required: false, signedIn: true, canChangePassword: true });
  const value = stubState({
    session,
    changePassword: async (current, next) => {
      await changePassword(current, next);
      setSession({ required: true, signedIn: true, needsSetup: false, canChangePassword: true });
    },
  });
  return (
    <MemoryRouter>
      <AppStateContext.Provider value={value}>
        <SettingsPage />
      </AppStateContext.Provider>
    </MemoryRouter>
  );
}

describe('choosing the first password in Settings', () => {
  it('offers it on an open copy, asks for it twice, and sends no current password', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn(async () => {});
    render(<Harness changePassword={changePassword} />);

    // No current password exists to ask for.
    expect(screen.queryByLabelText(tr('passwordCurrent', 'en'))).toBeNull();
    const first = screen.getByLabelText(tr('setupPassword', 'en'));
    const second = screen.getByLabelText(tr('setupConfirm', 'en'));
    const submit = screen.getByRole('button', { name: tr('setupTitle', 'en') });

    await user.type(first, 'correct-horse-1');
    await user.type(second, 'correct-horse-2');
    expect(second).toHaveAccessibleDescription(tr('setupMismatch', 'en'));
    await user.click(submit);
    expect(changePassword).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('setupMismatch', 'en'));
    expect(second).toHaveAttribute('aria-invalid', 'true');
    expect(second).toHaveFocus();

    await user.clear(second);
    await user.type(second, 'correct-horse-1');
    await user.keyboard('{Enter}');

    expect(changePassword).toHaveBeenCalledWith('', 'correct-horse-1');
    // Once there is a password, the change form takes over and says it is
    // set — where focus now is, since the button that had it is gone.
    const note = await screen.findByRole('status');
    expect(note).toHaveTextContent(tr('passwordChosen', 'en'));
    expect(note).toHaveFocus();
    expect(screen.getByLabelText(tr('passwordCurrent', 'en'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: tr('setupTitle', 'en') })).toBeNull();
  });

  it('states the rule from the start, lets the keyboard reach the button, and refuses a short one', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn(async () => {});
    render(<Harness changePassword={changePassword} />);
    const first = screen.getByLabelText(tr('setupPassword', 'en'));
    const second = screen.getByLabelText(tr('setupConfirm', 'en'));
    const submit = screen.getByRole('button', { name: tr('setupTitle', 'en') });
    expect(first).toHaveAccessibleDescription(tr('setupTooShort', 'en'));

    await user.type(first, 'short1234');
    await user.tab();
    await user.type(second, 'short1234');
    await user.tab();
    expect(submit).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(changePassword).not.toHaveBeenCalled();
    const once = await screen.findByRole('alert');
    expect(once).toHaveTextContent(tr('setupTooShort', 'en'));
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveFocus();

    // Said again on the next try: a new alert, which is announced afresh.
    await user.click(submit);
    expect(await screen.findByRole('alert')).not.toBe(once);
  });

  it('says why when the server would not take it, and keeps the copy open', async () => {
    const user = userEvent.setup();
    const changePassword = vi.fn(async () => {
      throw new Error('Use at least 10 characters.');
    });
    render(<Harness changePassword={changePassword} />);
    await user.type(screen.getByLabelText(tr('setupPassword', 'en')), 'correct-horse-1');
    await user.type(screen.getByLabelText(tr('setupConfirm', 'en')), 'correct-horse-1');
    await user.click(screen.getByRole('button', { name: tr('setupTitle', 'en') }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Use at least 10 characters.');
    expect(screen.getByLabelText(tr('setupPassword', 'en'))).toHaveFocus();
    expect(screen.getByRole('button', { name: tr('setupTitle', 'en') })).toBeEnabled();
  });
});
