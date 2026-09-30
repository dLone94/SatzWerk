// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider } from '../../src/state/AppState.tsx';
import { App } from '../../src/ui/App.tsx';

/**
 * What the app says when it is opened with no signal.
 *
 * The service worker keeps the app itself, so a train going underground no
 * longer replaces SatzWerk with the browser's error page. What it must not do
 * is fill the screen it now shows: the progress lives in the database, the
 * database cannot be reached, and a streak nobody can confirm is exactly the
 * kind of number this app does not print.
 *
 * It also must not call it a fault. Nothing has gone wrong.
 */

const originalFetch = globalThis.fetch;

/** How the server behaves: absent, or present and unhappy. */
let mode: 'unreachable' | 'broken' = 'unreachable';

beforeEach(() => {
  outbox.reset();
  mode = 'unreachable';
  globalThis.fetch = vi.fn(async () => {
    if (mode === 'unreachable') throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify({ error: 'the database is on fire' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

const mount = () =>
  render(
    <MemoryRouter>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MemoryRouter>,
  );

describe('opened with no connection', () => {
  it('says there is no connection, not that something went wrong', async () => {
    mount();
    expect(await screen.findByText(tr('offlineTitle', 'en'))).toBeInTheDocument();
    expect(screen.getByText(tr('offlineBody', 'en'))).toBeInTheDocument();
    expect(screen.queryByText(tr('errorTitle', 'en'))).not.toBeInTheDocument();
  });

  it('prints no number it cannot stand behind', async () => {
    const { container } = mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    // No streak, no accuracy, no counts: there is nothing to count from.
    expect(container.textContent).not.toMatch(/\d+\s?%/);
    expect(container.textContent).not.toMatch(/streak/i);
  });

  it('says what is waiting, when something is', async () => {
    outbox.enqueue({
      kind: 'attempt',
      payload: {
        context: 'lesson',
        stepId: 's1',
        expected: 'der Tisch',
        given: 'der Tisch',
        verdict: 'correct',
        credit: 1,
        categories: [],
        hintsUsed: 0,
        revealed: false,
        isRetype: false,
        resolved: true,
      },
    });
    mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    // One answer, so the singular — and it promises only that it is kept.
    expect(screen.getByText(tr('offlineWaiting', 'en', { n: 1 }))).toBeInTheDocument();
  });

  /*
   * Study minutes were counted as answers. One answer typed offline showed as
   * "2 answers are waiting" after a reload, because the minutes queued when
   * the app was put away were added in — and more with every reload.
   */
  it('counts only answers as answers', async () => {
    outbox.enqueue({
      kind: 'attempt',
      payload: {
        context: 'lesson',
        stepId: 's1',
        expected: 'der Tisch',
        given: 'der Tisch',
        verdict: 'correct',
        credit: 1,
        categories: [],
        hintsUsed: 0,
        revealed: false,
        isRetype: false,
        resolved: true,
      },
    });
    outbox.enqueue({ kind: 'studyTime', seconds: 90, at: new Date().toISOString() });
    outbox.enqueue({ kind: 'studyTime', seconds: 40, at: new Date().toISOString() });
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });
    mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    expect(screen.getByText(tr('offlineWaiting', 'en', { n: 1 }))).toBeInTheDocument();
    expect(screen.getByText(tr('offlineOther', 'en', { n: 1 }))).toBeInTheDocument();
    expect(screen.queryByText(/answers are waiting/)).not.toBeInTheDocument();
  });

  // With only a lesson result held, the screen said it was waiting "too",
  // next to no answers at all.
  it('does not say "too" when a lesson result is all that is waiting', async () => {
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });
    const { container } = mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    expect(screen.getByText(tr('offlineOther', 'en', { n: 1 }))).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\btoo\b/);
    expect(tr('offlineOther', 'bg', { n: 1 })).not.toMatch(/ и 1 /);
    expect(tr('offlineOther', 'bg', { n: 2 })).not.toMatch(/ и 2 /);
  });

  it('says nothing is waiting when only study minutes are', async () => {
    outbox.enqueue({ kind: 'studyTime', seconds: 90, at: new Date().toISOString() });
    const { container } = mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    expect(container.textContent).not.toMatch(/waiting/);
  });

  it('offers a way to try again', async () => {
    mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    expect(screen.getByRole('button', { name: tr('retry', 'en') })).toBeInTheDocument();
  });
});

describe('a server that is there and unhappy', () => {
  /**
   * The other half of the distinction. A 500 is not a tunnel, and calling it
   * one would send somebody to look at their signal when the fault is ours.
   */
  it('still reports a fault as a fault, with its detail', async () => {
    mode = 'broken';
    mount();
    expect(await screen.findByText(tr('errorTitle', 'en'))).toBeInTheDocument();
    expect(screen.queryByText(tr('offlineTitle', 'en'))).not.toBeInTheDocument();
    expect(screen.getByText(/the database is on fire/)).toBeInTheDocument();
  });
});
