// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { todayHere } from '../../src/core/progress/days.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp } from '../../src/state/AppState.tsx';

/**
 * Time studied is measured in the app: time on screen, sent once a minute.
 * Closing the app threw away whatever had not been sent yet, so every short
 * visit on a phone lost up to a minute.
 */

const stats = {
  totalAnswers: 0,
  correctAnswers: 0,
  accuracy: 0,
  totalStudySeconds: 0,
  studyDays: 0,
  streak: 0,
  categoryCounts: [],
  retypedCorrections: 0,
};

const snapshot = {
  profile: { teachingLanguage: 'en', dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '' },
  lessons: [],
  reviewItems: [],
  mistakes: [],
  favorites: [],
  stats,
  studyDays: [],
  checkpointResults: [],
  scenarioRuns: [],
  serverTime: new Date().toISOString(),
};

const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const originalFetch = globalThis.fetch;
let visibility: DocumentVisibilityState = 'visible';
let clock = Date.now();
let state: ReturnType<typeof useApp>;

beforeEach(() => {
  outbox.reset();
  visibility = 'visible';
  clock = Date.now();
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/state')) return json(snapshot);
    if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
    if (url.endsWith('/api/learners')) return json({ learners: [{ id: 1, name: 'me', createdAt: '' }], studyingAs: 1 });
    // The server is unreachable for time, so whatever was kept stays visible.
    if (url.endsWith('/api/study')) throw new TypeError('Failed to fetch');
    if (url.endsWith('/api/daily-runs')) return json({ dailyRuns: [] });
    throw new Error(`unexpected request: ${url}`);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function Ready({ learning = true }: { learning?: boolean }) {
  state = useApp();
  const { ready } = state;
  return <p data-study-active={ready && learning ? 'true' : undefined}>{ready ? 'ready' : 'loading'}</p>;
}

async function mount(learning = true) {
  const view = render(
    <AppStateProvider>
      <Ready learning={learning} />
    </AppStateProvider>,
  );
  await waitFor(() => expect(view.getByText('ready')).toBeInTheDocument());
}

const keptSeconds = () =>
  outbox
    .snapshot()
    .queued.map((item) => item.write)
    .filter((write) => write.kind === 'studyTime')
    .reduce((sum, write) => sum + (write.kind === 'studyTime' ? write.seconds : 0), 0);

function hide() {
  visibility = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('time studied survives putting the phone away', () => {
  it('does not count browsing account or navigation screens', async () => {
    await mount(false);
    clock += 5 * 60_000;
    hide();
    expect(keptSeconds()).toBe(0);
  });
  it('pauses an idle lesson and resumes after interaction', async () => {
    await mount();
    clock += 5 * 60_000;
    await act(async () => document.dispatchEvent(new Event('pointerdown')));
    clock += 25_000;
    hide();
    expect(keptSeconds()).toBe(145);
  });
  it('keeps a partial minute with its learner before a new learner is added', async () => {
    await mount();
    clock += 25_000;
    await act(async () => {
      expect(await state.addLearner('Papa')).toBe('answers-waiting');
    });
    expect(keptSeconds()).toBe(25);
    expect(state.studyingAs).toBe(1);
  });
  it('keeps the seconds since the last flush when the app is hidden', async () => {
    await mount();
    clock += 40_000;
    hide();
    expect(keptSeconds()).toBe(40);
  });

  it('keeps them when the page is closed outright', async () => {
    await mount();
    clock += 25_000;
    window.dispatchEvent(new Event('pagehide'));
    expect(keptSeconds()).toBe(25);
  });

  it('does not count the time the app spent in the background', async () => {
    await mount();
    clock += 30_000;
    hide();
    clock += 10 * 60_000;
    window.dispatchEvent(new Event('pagehide'));
    expect(keptSeconds()).toBe(30);
  });
});

/*
 * The minutes of a daily practice reached the server up to a minute after it
 * was finished, so its finish screen and Today right after it showed the
 * goal short by the last minute studied.
 */
describe('the minutes of a finished daily practice', () => {
  const run = (stage: number) => ({ id: 'run', day: '2026-11-04', scriptId: 'sc-bakery-pre-a1', goal: 'everyday' as const,
    stage, total: 4, firstTryCorrect: 4, listeningCompleted: false });

  it('are kept the moment it is finished', async () => {
    await mount();
    clock += 40_000;
    await act(async () => { await state.recordDailyRun(run(5)); });
    expect(keptSeconds()).toBe(40);
  });

  // The server is away here, so the time is still only on this device. It
  // counts on screen at once, and a fresh read of the state does not take it back.
  it('count towards today on screen before the server has them', async () => {
    await mount();
    clock += 40_000;
    await act(async () => { await state.recordDailyRun(run(5)); });
    const today = () => state.studyDays.find((entry) => entry.day === todayHere())?.secondsActive;
    expect(today()).toBe(40);
    await act(async () => { await state.reload(); });
    expect(today()).toBe(40);
  });

  it('wait for the minute as before while the practice goes on', async () => {
    await mount();
    clock += 40_000;
    await act(async () => { await state.recordDailyRun(run(3)); });
    expect(keptSeconds()).toBe(0);
  });
});

describe('a minute with nothing to send', () => {
  /*
   * The minute's flush runs on every screen. With nothing studied and nothing
   * waiting it only re-reads the queue — but it built a new sync object with
   * the same numbers each time, which changed the app's context, and every
   * screen drew itself again once a minute. On Today, for a learner with a
   * long history, that was a second-long freeze on a phone with nobody
   * touching it.
   */
  it('does not draw the app again', async () => {
    const minute: Array<() => void> = [];
    const setInterval = window.setInterval.bind(window);
    vi.spyOn(window, 'setInterval').mockImplementation(((handler: () => void, delay?: number) => {
      if (delay === 60_000) minute.push(handler);
      return setInterval(handler, delay);
    }) as typeof window.setInterval);

    let renders = 0;
    function Watcher() {
      useApp();
      renders += 1;
      return null;
    }
    const view = render(
      <AppStateProvider>
        <Ready learning={false} />
        <Watcher />
      </AppStateProvider>,
    );
    await waitFor(() => expect(view.getByText('ready')).toBeInTheDocument());
    expect(minute).toHaveLength(1);

    const before = renders;
    for (let tick = 0; tick < 3; tick += 1) {
      clock += 60_000;
      await act(async () => minute[0]!());
    }
    expect(outbox.queuedCount()).toBe(0);
    expect(renders - before, 'renders caused by three idle minutes').toBe(0);
  });
});
