// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp } from '../../src/state/AppState.tsx';
import { SyncBanner } from '../../src/ui/components/SyncBanner.tsx';

/**
 * The writes nobody holds a queue for.
 *
 * A typed answer waits in the outbox, because losing one loses work. A
 * preference is different — setting it again costs a tap — so these are tried
 * once and not held. What they must never do is fail in silence, and that is
 * exactly what they did: with no connection, tapping the star on a word threw
 * an uncaught rejection into the console, the star stayed empty, and the app
 * said nothing whatsoever. Found by tapping it in a browser with the network
 * switched off, not by a test; there is one now.
 */

const snapshot = {
  profile: {
    teachingLanguage: 'en' as const,
    dailyTargetMinutes: 20,
    displayName: null,
    onboarded: true,
    createdAt: new Date().toISOString(),
  },
  lessons: [],
  reviewItems: [],
  mistakes: [
    {
      id: 'm1',
      category: 'article' as const,
      expected: 'die Tochter',
      lastGiven: 'der Tochter',
      stepId: 's1',
      lessonId: 'l1',
      occurrences: 2,
      correctedCount: 0,
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      resolvedAt: null,
    },
  ],
  favorites: [],
  stats: {
    totalAnswers: 0,
    correctAnswers: 0,
    accuracy: 0,
    totalStudySeconds: 0,
    studyDays: 0,
    streak: 0,
    categoryCounts: [],
    retypedCorrections: 0,
  },
  studyDays: [],
  checkpointResults: [],
  scenarioRuns: [],
  serverTime: new Date().toISOString(),
};

/** What the server does with anything that is not a read. */
let writesBehave: 'accept' | 'unreachable' = 'accept';
const originalFetch = globalThis.fetch;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  outbox.reset();
  writesBehave = 'accept';
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';

    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/state') && method === 'GET') return json(snapshot);
    if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
    if (url.endsWith('/api/learners') && method === 'GET') {
      return json({ learners: [{ id: 1, name: 'me', createdAt: snapshot.serverTime }], studyingAs: 1 });
    }

    if (writesBehave === 'unreachable') throw new TypeError('Failed to fetch');

    if (url.includes('/favorite')) return json({ favorites: ['v-der-tisch'] });
    if (url.endsWith('/api/profile')) return json({ ...snapshot.profile, dailyTargetMinutes: 35 });
    if (url.includes('/resolve')) return json([]);
    if (url.endsWith('/api/learners')) {
      return json({
        learners: [
          { id: 1, name: 'me', createdAt: snapshot.serverTime },
          { id: 2, name: 'Papa', createdAt: snapshot.serverTime },
        ],
        studyingAs: 2,
      });
    }
    throw new Error(`unexpected request: ${method} ${url}`);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

/** Every unqueued write, behind a button, so each can be tried in turn. */
function Harness() {
  const app = useApp();
  if (!app.ready) return <p>loading</p>;
  return (
    <>
      <SyncBanner />
      <button type="button" onClick={() => void app.toggleFavorite('v-der-tisch')}>
        star
      </button>
      <button type="button" onClick={() => void app.updateProfile({ dailyTargetMinutes: 35 })}>
        target
      </button>
      <button type="button" onClick={() => void app.setTeachingLanguage('bg')}>
        path
      </button>
      <button type="button" onClick={() => void app.resolveMistake('m1')}>
        mistake
      </button>
      <button type="button" onClick={() => void app.addLearner('Papa')}>
        learner
      </button>
      <p data-testid="favourites">{app.favorites.join(',')}</p>
      <p data-testid="target">{String(app.profile.dailyTargetMinutes)}</p>
    </>
  );
}

const mount = async () => {
  render(
    <AppStateProvider>
      <Harness />
    </AppStateProvider>,
  );
  await screen.findByRole('button', { name: 'star' });
};

describe('a write that did not land and is not being held', () => {
  it.each([
    ['star', 'notSavedFavorite'],
    ['target', 'notSavedProfile'],
    ['path', 'notSavedProfile'],
    ['mistake', 'notSavedMistake'],
    ['learner', 'notSavedLearner'],
  ] as const)('says so when %s could not be saved', async (button, key) => {
    const user = userEvent.setup();
    await mount();
    writesBehave = 'unreachable';

    await user.click(screen.getByRole('button', { name: button }));

    // Named, so the learner knows which tap did not take.
    expect(await screen.findByText(tr(key, 'en'))).toBeInTheDocument();
    expect(screen.getByText(tr('notSavedReason', 'en'))).toBeInTheDocument();
  });

  it('claims nothing it did not save', async () => {
    const user = userEvent.setup();
    await mount();
    writesBehave = 'unreachable';

    await user.click(screen.getByRole('button', { name: 'star' }));
    await screen.findByText(tr('notSavedFavorite', 'en'));
    // The star is not shown as filled, because the database does not hold it.
    expect(screen.getByTestId('favourites').textContent).toBe('');
  });

  it('says nothing when the write did land', async () => {
    const user = userEvent.setup();
    await mount();

    await user.click(screen.getByRole('button', { name: 'star' }));
    await waitFor(() => expect(screen.getByTestId('favourites').textContent).toBe('v-der-tisch'));
    expect(screen.queryByText(tr('notSavedTitle', 'en'))).not.toBeInTheDocument();
  });

  it('stops saying so once the next write works', async () => {
    const user = userEvent.setup();
    await mount();

    writesBehave = 'unreachable';
    await user.click(screen.getByRole('button', { name: 'target' }));
    await screen.findByText(tr('notSavedProfile', 'en'));

    writesBehave = 'accept';
    await user.click(screen.getByRole('button', { name: 'target' }));
    await waitFor(() => expect(screen.getByTestId('target').textContent).toBe('35'));
    expect(screen.queryByText(tr('notSavedProfile', 'en'))).not.toBeInTheDocument();
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    await mount();
    writesBehave = 'unreachable';
    await user.click(screen.getByRole('button', { name: 'star' }));
    await screen.findByText(tr('notSavedFavorite', 'en'));

    await user.click(screen.getByRole('button', { name: tr('syncDismiss', 'en') }));
    expect(screen.queryByText(tr('notSavedFavorite', 'en'))).not.toBeInTheDocument();
  });
});
