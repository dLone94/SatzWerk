// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SCENARIO_SCRIPTS } from '../../src/content/index.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { ScenarioPlayer, segmentsOf } from '../../src/ui/components/ScenarioPlayer.tsx';
import { ScenarioPage } from '../../src/ui/pages/ScenarioPage.tsx';
import { stubState } from './playerStub.tsx';

/** A conversation, heard as well as seen. */

const [first, second] = SCENARIO_SCRIPTS;

describe('a conversation', () => {
  /*
   * The partner's next line arrived in a new node with nothing listening for
   * it, so a screen reader never said what had just been said to you.
   */
  it('announces what the other person says', async () => {
    render(
      <AppStateContext.Provider value={stubState()}>
        <ScenarioPlayer script={first!} onFinish={() => {}} onExit={() => {}} />
      </AppStateContext.Provider>,
    );
    const region = document.querySelector('.scenario > [role="status"][aria-live="polite"]');
    expect(region).not.toBeNull();
    const line = segmentsOf(first!, 'en')[0]!.lead.find((beat) => beat.who === 'them');
    expect(line).toBeDefined();
    await waitFor(() => expect(region!.textContent).toContain(line!.who === 'them' ? line!.de : ''));
  });

  /*
   * Moving from one conversation to another kept the page, so the new one
   * opened mid-way through the old one, or on its result.
   */
  it('opens the next one at its own introduction', async () => {
    const user = userEvent.setup();
    render(
      <AppStateContext.Provider value={stubState()}>
        <MemoryRouter initialEntries={[`/scenario/${first!.id}`]}>
          <Link to={`/scenario/${second!.id}`}>elsewhere</Link>
          <Routes>
            <Route path="/scenario/:scriptId" element={<ScenarioPage />} />
          </Routes>
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    await user.click(screen.getByRole('button', { name: tr('scenarioStart', 'en') }));
    expect(document.querySelector('.scenario')).not.toBeNull();
    await user.click(screen.getByRole('link', { name: 'elsewhere' }));
    expect(document.querySelector('.scenario')).toBeNull();
    expect(screen.getByRole('button', { name: tr('scenarioStart', 'en') })).toBeInTheDocument();
  });
});
