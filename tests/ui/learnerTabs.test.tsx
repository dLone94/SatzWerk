// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LEARNER_HEADER, showingLearner, type AttemptPayload } from '../../src/services/api/client.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp, type AppStateValue } from '../../src/state/AppState.tsx';

/**
 * Two tabs, one cookie.
 *
 * Every tab in a browser shares the cookie that says who is studying. Adding
 * Bob in a second tab moved it for the first, which still said "Me" — and the
 * next answer typed there was filed under Bob, followed by Bob's onboarding
 * under Me's name. Each tab now names the learner it shows on what it sends,
 * and each queued write names the learner it was made for.
 *
 * Two tabs cannot run in one test realm, so the second tab is played by the
 * shared queue: a write another tab left in it, and the tab that sends it.
 */

const answer: AttemptPayload = {
  context: 'lesson',
  lessonId: 'pre-a1-u1-l2',
  stepId: 'u1l2-ex2-1',
  expected: 'den',
  given: 'Antwort von Me im ersten Tab',
  verdict: 'incorrect',
  credit: 0,
  categories: [],
  hintsUsed: 0,
  revealed: false,
  isRetype: false,
  resolved: false,
};

const snapshot = {
  profile: { teachingLanguage: 'en', dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '' },
  lessons: [], reviewItems: [], mistakes: [], favorites: [],
  stats: { totalAnswers: 0, correctAnswers: 0, accuracy: 0, totalStudySeconds: 0, studyDays: 0, streak: 0, categoryCounts: [], retypedCorrections: 0 },
  studyDays: [], checkpointResults: [], scenarioRuns: [], serverTime: new Date().toISOString(),
};

const originalFetch = globalThis.fetch;
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

/** Every request this tab sent, with the learner it named. */
let sent: Array<{ path: string; learner: string | null }>;

/** A server whose cookie says `cookieLearner` is studying. */
function serverWithCookieFor(cookieLearner: number) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = new URL(String(input), 'http://localhost').pathname;
    const learner = new Headers(init?.headers).get(LEARNER_HEADER);
    sent.push({ path, learner });
    if (path === '/api/session') return json({ required: false, signedIn: true });
    if (path === '/api/state') return json(snapshot);
    if (path === '/api/coach/status') return json({ aiAvailable: false, provider: 'none', features: {} });
    if (path === '/api/learners') {
      return json({
        learners: [{ id: 1, name: 'me', createdAt: '' }, { id: 2, name: 'Bob', createdAt: '' }],
        studyingAs: learner ? Number(learner) : cookieLearner,
      });
    }
    if (path === '/api/attempts') return json({ attemptId: 1, reviewItems: [], grade: 'again', stats: snapshot.stats });
    return json({});
  }) as typeof fetch;
}

let app: AppStateValue | undefined;
function Grab() {
  app = useApp();
  return null;
}

beforeEach(() => {
  outbox.reset();
  showingLearner(undefined);
  sent = [];
  app = undefined;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
  showingLearner(undefined);
});

describe('a tab left open while somebody else is chosen in another', () => {
  it('names the learner it shows on its answers, and on what it reads', async () => {
    serverWithCookieFor(1);
    render(<AppStateProvider><Grab /></AppStateProvider>);
    await waitFor(() => expect(app?.studyingAs).toBe(1));

    // The first load asks the cookie; nothing is named before it is known.
    expect(sent.find((request) => request.path === '/api/learners')?.learner).toBeNull();

    // Another tab adds Bob: the cookie now says 2. This tab still shows Me.
    serverWithCookieFor(2);
    await app!.submitAttempt(answer);
    await waitFor(() => expect(sent.some((request) => request.path === '/api/attempts')).toBe(true));
    expect(sent.find((request) => request.path === '/api/attempts')?.learner).toBe('1');

    await app!.reload();
    expect(sent.filter((request) => request.path === '/api/state').at(-1)?.learner).toBe('1');
    expect(app!.studyingAs).toBe(1);
  });

  it('sends a write another tab queued as the learner it was made for', async () => {
    // Tab A, showing Me, typed an answer that had to wait.
    showingLearner(1);
    outbox.enqueue({ kind: 'attempt', payload: answer }, 'from-tab-a');
    expect(outbox.snapshot().queued[0]).toMatchObject({ id: 'from-tab-a', learner: 1 });

    // Tab B opens on Bob, and is the one that sends what is waiting.
    showingLearner(undefined);
    serverWithCookieFor(2);
    render(<AppStateProvider><Grab /></AppStateProvider>);
    await waitFor(() => expect(app?.studyingAs).toBe(2));
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    expect(sent.find((request) => request.path === '/api/attempts')?.learner).toBe('1');
  });
});
