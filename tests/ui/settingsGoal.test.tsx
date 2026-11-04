// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { SettingsPage } from '../../src/ui/pages/SettingsPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * The daily goal in Settings.
 *
 * The chips became 5, 10, 15 and 20 minutes, so 30 is no longer one of them.
 * A learner who had chosen 30 saw no chip pressed and an empty "Custom"
 * field, while the welcome screen put the same goal back in its field.
 */

function Harness({ minutes, lang }: { minutes: number; lang: TeachingLanguage }) {
  const base = stubState({}, lang);
  const [profile, setProfile] = useState({ ...base.profile, dailyTargetMinutes: minutes });
  const value = stubState({
    profile,
    updateProfile: async (patch) => setProfile((current) => ({ ...current, ...patch })),
  }, lang);
  return (
    <MemoryRouter>
      <AppStateContext.Provider value={value}>
        <SettingsPage />
      </AppStateContext.Provider>
    </MemoryRouter>
  );
}

describe.each(['en', 'bg'] as const)('the daily goal in Settings (%s)', (lang) => {
  it('shows a goal of 30 in the custom field, and a chip clears it', async () => {
    const user = userEvent.setup();
    render(<Harness minutes={30} lang={lang} />);
    const field = screen.getByLabelText(tr('settingsCustom', lang));
    expect(field).toHaveValue(30);
    for (const minutes of [5, 10, 15, 20]) {
      expect(screen.getByRole('button', { name: tr('settingsMinutes', lang, { n: minutes }) }))
        .toHaveAttribute('aria-pressed', 'false');
    }

    await user.click(screen.getByRole('button', { name: tr('settingsMinutes', lang, { n: 15 }) }));
    expect(screen.getByRole('button', { name: tr('settingsMinutes', lang, { n: 15 }) }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(field).toHaveValue(null);
  });

  it('presses the chip for a goal it offers and leaves the field empty', () => {
    render(<Harness minutes={10} lang={lang} />);
    expect(screen.getByRole('button', { name: tr('settingsMinutes', lang, { n: 10 }) }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText(tr('settingsCustom', lang))).toHaveValue(null);
  });
});
