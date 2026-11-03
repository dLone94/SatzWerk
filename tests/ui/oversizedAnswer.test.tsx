// @vitest-environment jsdom
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, ATTEMPT_TEXT_LIMIT, type AttemptPayload } from '../../src/services/api/client.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp, type AppStateValue } from '../../src/state/AppState.tsx';

/**
 * An answer pasted by accident.
 *
 * A 300,000-character answer went into the queue whole and out in one request
 * over the server's 256 KB limit. The server reset the connection, the outbox
 * read that as "offline" and held the write at the front of the queue for good:
 * every later answer waited behind it, the banner blamed the connection, and
 * no learner could be added or switched to. The server now answers 413 (see
 * tests/server/main.test.ts); these are the client's half.
 */

const huge = 'x'.repeat(300_000);
const answer: AttemptPayload = {
  context: 'lesson',
  stepId: 'u1l1-ex2-s1',
  expected: 'Hallo',
  given: huge,
  verdict: 'incorrect',
  credit: 0,
  categories: [],
  hintsUsed: 0,
  revealed: false,
  isRetype: false,
  resolved: false,
};

const originalFetch = globalThis.fetch;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => outbox.reset());
afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

describe('an answer bigger than the server keeps', () => {
  it('is sent cut to what the server stores', async () => {
    const bodies: string[] = [];
    globalThis.fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return json({ attemptId: 1, reviewItems: [], grade: 'again', stats: {} });
    }) as typeof fetch;
    await api.recordAttempt(answer, 'k1');
    const sent = JSON.parse(bodies[0]!) as AttemptPayload;
    expect(sent.given).toHaveLength(ATTEMPT_TEXT_LIMIT);
    expect(sent.expected).toBe('Hallo');
  });

  it('is queued cut, so it never sits in storage at full size', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
      if (url.endsWith('/api/state')) {
        return json({
          profile: { teachingLanguage: 'en', dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '' },
          lessons: [], reviewItems: [], mistakes: [], favorites: [],
          stats: { totalAnswers: 0, correctAnswers: 0, accuracy: 0, totalStudySeconds: 0, studyDays: 0, streak: 0, categoryCounts: [], retypedCorrections: 0 },
          studyDays: [], checkpointResults: [], scenarioRuns: [], serverTime: new Date().toISOString(),
        });
      }
      if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
      if (url.endsWith('/api/learners')) return json({ learners: [{ id: 1, name: 'me', createdAt: '' }], studyingAs: 1 });
      // Held, so what was queued can be looked at.
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;

    let app: AppStateValue | undefined;
    function Grab() {
      app = useApp();
      return null;
    }
    render(<AppStateProvider><Grab /></AppStateProvider>);
    await waitFor(() => expect(app?.ready && app.profile.onboarded).toBe(true));
    await app!.submitAttempt(answer);
    await waitFor(() => expect(outbox.queuedCount()).toBe(1));
    const queued = outbox.snapshot().queued[0]!.write;
    expect(queued.kind).toBe('attempt');
    expect(queued.kind === 'attempt' && queued.payload.given).toHaveLength(ATTEMPT_TEXT_LIMIT);
  });

  it('is refused and reported by a 413, and the answers behind it still go', async () => {
    outbox.enqueue({ kind: 'attempt', payload: { ...answer, stepId: 'big' } }, 'big');
    outbox.enqueue({ kind: 'attempt', payload: { ...answer, stepId: 'next', given: 'Hallo' } }, 'next');
    const sent: string[] = [];
    const outcome = await outbox.flush(async (_write, id) => {
      if (id === 'big') throw new ApiError('That is more than the server takes in one request (256 KB).', 413);
      sent.push(id);
      return {};
    });
    expect(outcome).toMatchObject({ sent: 1, rejected: 1, remaining: 0 });
    expect(sent).toEqual(['next']);
    expect(outbox.snapshot().rejected[0]).toMatchObject({ id: 'big', reason: expect.stringContaining('256 KB') });
  });
});
