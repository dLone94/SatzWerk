// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
