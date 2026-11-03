// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { SetupPage } from '../../src/ui/pages/SetupPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * Choosing the password on a hosted copy: the one screen between the person
 * deploying SatzWerk and everything else, so it has to work by keyboard and
 * by ear as well as by eye.
 *
 * It used to name the 10-character rule only after typing began, in a line no
 * field pointed to and nothing announced; the submit button stayed disabled
 * until both fields were right, so Tab skipped it, focus fell off the form,
 * and Enter did nothing at all — with no word said about why.
 */

function mount() {
  const choosePassword = vi.fn(async () => {});
  render(
    <AppStateContext.Provider value={stubState({ choosePassword })}>
      <SetupPage />
    </AppStateContext.Provider>,
  );
  return {
    choosePassword,
    first: screen.getByLabelText(tr('setupPassword', 'en')),
    second: screen.getByLabelText(tr('setupConfirm', 'en')),
    submit: screen.getByRole('button', { name: tr('setupSubmit', 'en') }),
  };
}

describe('setting the password', () => {
  it('states the length rule before anything is typed, on the field it is about', () => {
    const { first } = mount();
    expect(first).toHaveAccessibleDescription(tr('setupTooShort', 'en'));
    expect(screen.getByText(tr('setupTooShort', 'en'))).toBeVisible();
  });

  it('lets the keyboard reach the button, and says what is wrong with a short password', async () => {
    const user = userEvent.setup();
    const { first, second, submit, choosePassword } = mount();
    await user.type(first, 'short1234');
    await user.tab();
    await user.type(second, 'short1234');
    await user.tab();
    expect(submit).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(choosePassword).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('setupTooShort', 'en'));
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveFocus();
  });

  it('says so again on the next try, so a screen reader hears it again', async () => {
    const user = userEvent.setup();
    const { first, submit } = mount();
    await user.type(first, 'short');
    await user.click(submit);
    const once = await screen.findByRole('alert');
    await user.click(submit);
    const twice = await screen.findByRole('alert');
    // A new node: an alert is announced when it arrives, not when it stays.
    expect(twice).not.toBe(once);
  });

  it('points the second field at the mismatch, and takes the learner there', async () => {
    const user = userEvent.setup();
    const { first, second, submit, choosePassword } = mount();
    await user.type(first, 'longenough1');
    await user.type(second, 'longenough2');
    expect(second).toHaveAccessibleDescription(tr('setupMismatch', 'en'));

    await user.click(submit);
    expect(choosePassword).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('setupMismatch', 'en'));
    expect(second).toHaveAttribute('aria-invalid', 'true');
    expect(first).not.toHaveAttribute('aria-invalid', 'true');
    expect(second).toHaveFocus();
  });

  it('asks for the second copy when it was left empty', async () => {
    const user = userEvent.setup();
    const { first, second, submit } = mount();
    await user.type(first, 'longenough1');
    await user.click(submit);
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('setupMismatch', 'en'));
    expect(second).toHaveFocus();
  });

  it('sets the password when both copies are long enough and match', async () => {
    const user = userEvent.setup();
    const { first, second, submit, choosePassword } = mount();
    await user.type(first, 'longenough1');
    await user.type(second, 'longenough1');
    await user.click(submit);
    expect(choosePassword).toHaveBeenCalledWith('longenough1');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(first).not.toHaveAttribute('aria-invalid');
  });
});
