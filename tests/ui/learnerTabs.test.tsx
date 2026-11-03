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

    // The first load asks the cookie who it is showing, and only then reads,
    // naming them: read side by side, another tab moving the cookie between
    // the two requests paired one learner's progress with another's name.
    const reads = sent.filter((request) => request.path.startsWith('/api/') && request.path !== '/api/session');
    expect(reads[0]).toEqual({ path: '/api/learners', learner: null });
    expect(reads.find((request) => request.path === '/api/state')?.learner).toBe('1');

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

  it('keeps showing its own learner when it sends somebody else\'s write', async () => {
    // Tab A, showing Me, typed an answer that had to wait.
    showingLearner(1);
    outbox.enqueue({ kind: 'attempt', payload: answer }, 'from-tab-a');
    showingLearner(undefined);

    // Tab B shows Bob, who has answered once. The server's answer to Me's
    // write is Me's: five hundred answers, a review item of Me's, Me's lesson.
    // No mistake was banked, so no fetch of the whole state follows to hide
    // what the answer was laid over.
    serverWithCookieFor(2);
    const bobStats = { ...snapshot.stats, totalAnswers: 1, correctAnswers: 1, accuracy: 1 };
    const meStats = { ...snapshot.stats, totalAnswers: 500, correctAnswers: 400, accuracy: 0.8 };
    const reply = reviewItemFor('vocab:mes-word');
    const bobFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      if (path === '/api/state') {
        sent.push({ path, learner: new Headers(init?.headers).get(LEARNER_HEADER) });
        return json({ ...snapshot, stats: bobStats });
      }
      if (path === '/api/attempts') {
        sent.push({ path, learner: new Headers(init?.headers).get(LEARNER_HEADER) });
        return json({
          attemptId: 7,
          reviewItems: [reply],
          grade: 'again',
          stats: meStats,
          lessonProgress: { ...emptyLesson(answer.lessonId!), startedAt: '2026-11-01T10:00:00.000Z' },
        });
      }
      return bobFetch(input, init);
    }) as typeof fetch;

    render(<AppStateProvider><Grab /></AppStateProvider>);
    await waitFor(() => expect(app?.studyingAs).toBe(2));
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    expect(sent.find((request) => request.path === '/api/attempts')?.learner).toBe('1');

    // Still Bob's numbers, and nothing of Me's laid over them.
    expect(app!.stats.totalAnswers).toBe(1);
    expect(app!.reviewItems.map((item) => item.id)).not.toContain('vocab:mes-word');
    expect(app!.lessons[answer.lessonId!]).toBeUndefined();
  });

  it('lays only its own learner\'s waiting work over what it shows', async () => {
    // Me finished a lesson and a daily session with no connection, in tab A.
    showingLearner(1);
    outbox.enqueue({ kind: 'complete', lessonId: 'pre-a1-u1-l1' }, 'me-complete');
    outbox.enqueue({ kind: 'dailyRun', payload: {
      id: 'me-daily', day: '2026-11-03', scriptId: 'cafe', goal: 'everyday', stage: 5,
      total: 6, firstTryCorrect: 5, listeningCompleted: true,
    } }, 'me-daily');
    showingLearner(undefined);

    // Tab B opens on Bob while the server cannot take writes yet.
    serverWithCookieFor(2);
    const bobFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input), 'http://localhost').pathname;
      if (path.startsWith('/api/lessons/') || path === '/api/daily-runs') {
        return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 503 });
      }
      return bobFetch(input, init);
    }) as typeof fetch;

    render(<AppStateProvider><Grab /></AppStateProvider>);
    await waitFor(() => expect(app?.studyingAs).toBe(2));
    await waitFor(() => expect(sent.some((request) => request.path === '/api/state')).toBe(true));

    // Me's work is still waiting, and still Me's: Bob has finished nothing.
    expect(outbox.queuedCount()).toBe(2);
    expect(app!.lessonProgress('pre-a1-u1-l1').completedAt).toBeUndefined();
    expect(app!.dailyRuns).toEqual([]);
  });
});

function reviewItemFor(id: string) {
  return {
    id, kind: 'vocab', refId: id.slice('vocab:'.length), level: 'A1', state: 'learning', ease: 2.5,
    intervalDays: 0, dueAt: '2026-11-03T10:10:00.000Z', successCount: 0, failureCount: 1, lapses: 0,
    learningStep: 0, createdAt: '2026-11-03T10:00:00.000Z',
  };
}

function emptyLesson(lessonId: string) {
  return {
    lessonId, sectionsSeen: [], practice: {}, recoveryRounds: 0,
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
  };
}
