// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { todayHere } from '../../src/core/progress/days.ts';
import { weeklyPractice } from '../../src/core/progress/daily.ts';
import type { AttemptPayload, StudyDay } from '../../src/services/api/client.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp, type AppStateValue } from '../../src/state/AppState.tsx';

/*
 * The days a learner practised came back from the server only with the study
 * minutes, sent once a minute. A short daily practice answered right
 * throughout therefore finished on "0 / 4 practice days this week", with no
 * streak, beside its own result; only a wrong answer, which fetches the whole
 * state, or the next minute corrected it.
 */

const stats = {
  totalAnswers: 0, correctAnswers: 0, accuracy: 0, totalStudySeconds: 0, studyDays: 0, streak: 0,
  categoryCounts: [], retypedCorrections: 0,
};
let serverDays: StudyDay[] = [];
const requests: string[] = [];
const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const originalFetch = globalThis.fetch;

beforeEach(() => {
  outbox.reset();
  requests.length = 0;
  serverDays = [{ day: '2026-01-05', secondsActive: 300, answers: 4, correct: 4 }];
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requests.push(`${init?.method ?? 'GET'} ${url}`);
    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/state')) {
      return json({ profile: { teachingLanguage: 'en', dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '' },
        lessons: [], reviewItems: [], mistakes: [], favorites: [], stats, studyDays: serverDays, checkpointResults: [],
        scenarioRuns: [], dailyRuns: [], serverTime: new Date().toISOString() });
    }
    if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
    if (url.endsWith('/api/learners')) return json({ learners: [{ id: 1, name: 'me', createdAt: '' }], studyingAs: 1 });
    if (url.endsWith('/api/attempts')) return json({ attemptId: requests.length, reviewItems: [], grade: 'good', stats });
    throw new Error(`unexpected request: ${url}`);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

async function mountState(): Promise<() => AppStateValue> {
  let latest: AppStateValue | null = null;
  function Probe() {
    latest = useApp();
    return <p>{latest.ready ? 'ready' : 'loading'}</p>;
  }
  render(<AppStateProvider><Probe /></AppStateProvider>);
  await screen.findByText('ready');
  return () => latest!;
}

const answer = (extra: Partial<AttemptPayload> = {}): AttemptPayload => ({
  context: 'practice', stepId: 'daily-phrase-1', expected: 'Guten Morgen!', given: 'Guten Morgen!',
  verdict: 'correct', credit: 1, categories: [], hintsUsed: 0, revealed: false, isRetype: false, resolved: true, ...extra,
});

it('counts today as a practice day as soon as an answer is saved', async () => {
  const state = await mountState();
  expect(weeklyPractice(state().studyDays, 4).done).toBe(0);
  await act(async () => {
    await state().submitAttempt(answer());
    await state().submitAttempt(answer({ stepId: 'daily-phrase-2', revealed: true }));
  });
  await waitFor(() => expect(outbox.queuedCount()).toBe(0));
  const today = state().studyDays.find((day) => day.day === todayHere());
  expect(today).toEqual({ day: todayHere(), secondsActive: 0, answers: 2, correct: 1 });
  expect(weeklyPractice(state().studyDays, 4).done).toBe(1);
  expect(state().stats.streak).toBe(1);
  // From the answers' own acknowledgements, not from fetching everything again.
  expect(requests.filter((request) => request === 'GET /api/state')).toHaveLength(1);
  // The days already on record are kept as they were.
  expect(state().studyDays.find((day) => day.day === '2026-01-05')).toEqual(serverDays[0]);
});
