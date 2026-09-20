// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { typeIt } from '../../src/content/authoring.ts';
import type { Exercise } from '../../src/content/types.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { SyncBanner } from '../../src/ui/components/SyncBanner.tsx';

/**
 * The tunnel test.
 *
 * This app is used on a phone, and the phone loses signal: in the U-Bahn, in a
 * lift, in a flat whose corner the router does not reach. Before the outbox,
 * `submitAttempt` threw when it could not reach the server, nothing caught it,
 * and the learner sat in front of a screen that had swallowed their answer and
 * did nothing at all.
 *
 * So: the lesson carries on, the answer is kept, the app says how many are
 * waiting, and they go into the database when the connection comes back.
 */

const bi = (en: string, bg: string) => ({ en, bg });

const lesson: Exercise = typeIt('t-origin', bi('Origin', 'Произход'), [
  {
    id: 't-origin-s1',
    prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
    answer: 'Ich komme aus Bulgarien.',
  },
]);

const snapshot = {
  profile: {
    teachingLanguage: 'en',
    dailyTargetMinutes: 20,
    displayName: null,
    onboarded: true,
    createdAt: new Date().toISOString(),
  },
  lessons: [],
  reviewItems: [],
  mistakes: [],
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

/** Flipped by each test to decide what the server does with an answer. */
let attemptsBehave: 'accept' | 'unreachable' | 'refuse' = 'accept';
const posted: Array<Record<string, unknown>> = [];

const originalFetch = globalThis.fetch;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  outbox.reset();
  posted.length = 0;
  attemptsBehave = 'accept';

  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/state')) return json(snapshot);
    if (url.endsWith('/api/coach/status')) {
      return json({ aiAvailable: false, provider: 'none', features: {} });
    }

    if (url.endsWith('/api/attempts')) {
      posted.push(JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>);
      if (attemptsBehave === 'unreachable') throw new TypeError('Failed to fetch');
      if (attemptsBehave === 'refuse') return json({ error: 'verdict is not recognised' }, 400);
      return json({ attemptId: posted.length, reviewItems: [], grade: 'good', stats: snapshot.stats });
    }

    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

function Harness() {
  const { ready } = useApp();
  if (!ready) return <p>loading</p>;
  return (
    <>
      <SyncBanner />
      <ExercisePlayer exercises={[lesson]} context="lesson" level="pre-a1" lessonId="l1" onFinish={() => {}} />
    </>
  );
}

async function mount() {
  render(
    <AppStateProvider>
      <Harness />
    </AppStateProvider>,
  );
  await screen.findByRole('textbox');
}

async function answer(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), text);
  await user.keyboard('{Enter}');
}

describe('an answer typed while the server is unreachable', () => {
  it('is still marked, and the lesson carries on', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');

    // The validator lives in the browser, so the verdict never depended on
    // the server. This is the part that used to freeze.
    expect(await screen.findByText(/Correct\./)).toBeInTheDocument();
  });

  it('is kept, and the app says so', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');

    expect(await screen.findByText('1 answer is waiting')).toBeInTheDocument();
    expect(outbox.queuedCount()).toBe(1);
    // Nothing is claimed about it: the queue is named, not folded into a stat.
    expect(screen.getByText(/reach the database as soon as there is a connection/)).toBeInTheDocument();
  });

  it('reaches the database when the connection comes back', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');
    await screen.findByText('1 answer is waiting');

    attemptsBehave = 'accept';
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try now' }));

    await waitFor(() => expect(screen.queryByText('1 answer is waiting')).not.toBeInTheDocument());
    expect(outbox.queuedCount()).toBe(0);
    // Sent once while offline (and thrown away by the network), once for real.
    expect(posted.filter((body) => body.given === 'Ich komme aus Bulgarien.').length).toBe(2);
  });

  it('carries the time it was typed rather than the time it was sent', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    const before = new Date().toISOString();
    await answer('Ich komme aus Bulgarien.');
    await screen.findByText('1 answer is waiting');

    attemptsBehave = 'accept';
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try now' }));
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));

    const sent = posted[posted.length - 1];
    expect(typeof sent?.at).toBe('string');
    // Stamped when the answer was given, not when the queue was drained.
    expect(String(sent?.at) >= before).toBe(true);
  });
});

describe('an answer the server refuses outright', () => {
  it('does not freeze the lesson, and is reported rather than retried', async () => {
    await mount();
    attemptsBehave = 'refuse';
    await answer('Ich komme aus Bulgarien.');

    expect(await screen.findByText(/Correct\./)).toBeInTheDocument();
    expect(await screen.findByText(/The server refused 1 answer/)).toBeInTheDocument();
    // Not queued: it would be refused again every time it was tried.
    expect(outbox.queuedCount()).toBe(0);
  });
});
