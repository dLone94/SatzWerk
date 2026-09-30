// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import { api, type WritingEvaluation } from '../../src/services/api/client.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { CoachPage } from '../../src/ui/pages/CoachPage.tsx';
import { stubState } from './playerStub.tsx';

/*
 * The coach's findings and errors used to appear with nothing to tell a
 * screen reader: no live region at all, so pressing "Check my German" seemed
 * to do nothing. A region that is there from the start now gets the outcome.
 */

const evaluation = (findings: number): WritingEvaluation => ({
  engine: 'rules',
  findings: Array.from({ length: findings }, (_, index) => ({
    category: 'article',
    message: { en: `finding ${index}`, bg: `бележка ${index}` },
    excerpt: 'die Tisch',
    suggestion: 'der Tisch',
  })) as WritingEvaluation['findings'],
  checksApplied: [],
  unknownWords: [],
  note: { en: 'note', bg: 'бележка' },
});

function mount() {
  render(
    <AppStateContext.Provider value={stubState()}>
      <MemoryRouter>
        <CoachPage />
      </MemoryRouter>
    </AppStateContext.Provider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe('the coach', () => {
  it('announces its findings through a region that was there all along', async () => {
    vi.spyOn(api, 'reviewWriting').mockResolvedValue(evaluation(2));
    const user = userEvent.setup();
    mount();
    const region = document.querySelector('[role="status"][aria-live="polite"]');
    expect(region).not.toBeNull();
    expect(region!.textContent).toBe('');

    await user.type(screen.getByRole('textbox'), 'Die Tisch ist groß.');
    await user.click(screen.getByRole('button', { name: tr('coachCheck', 'en') }));
    await waitFor(() => expect(region!.textContent).toBe(tr('coachFindingsCount', 'en', { n: 2 })));
  });

  it('says so when it found nothing', async () => {
    vi.spyOn(api, 'reviewWriting').mockResolvedValue(evaluation(0));
    const user = userEvent.setup();
    mount();
    const region = document.querySelector('[role="status"][aria-live="polite"]')!;
    await user.type(screen.getByRole('textbox'), 'Der Tisch ist groß.');
    await user.click(screen.getByRole('button', { name: tr('coachCheck', 'en') }));
    await waitFor(() => expect(region.textContent).toBe(tr('coachNoFindings', 'en')));
  });

  it('reads out an error', async () => {
    vi.spyOn(api, 'reviewWriting').mockRejectedValue(new Error('The server did not answer.'));
    const user = userEvent.setup();
    mount();
    await user.type(screen.getByRole('textbox'), 'Der Tisch ist groß.');
    await user.click(screen.getByRole('button', { name: tr('coachCheck', 'en') }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The server did not answer.');
  });
});
