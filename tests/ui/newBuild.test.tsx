// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import { arrivedAt, watchForNewBuild } from '../../src/services/offline/register.ts';
import { AppStateProvider } from '../../src/state/AppState.tsx';
import { App } from '../../src/ui/App.tsx';

/*
 * A Home Screen app kept running an old version.
 *
 * iOS keeps an installed app in memory for days. Brought back to the front,
 * it carried on with the build it started with, however many deploys had
 * happened since: nothing ever reloaded it, so fixes did not reach the phone
 * until the app was killed by hand.
 */

const originalFetch = globalThis.fetch;
let files: string[] = [];
let reachable = true;

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  files = ['/assets/index-old111.js', '/assets/index-old111.css'];
  reachable = true;
  document.head.innerHTML = '<script type="module" src="/assets/index-old111.js"></script>';
  globalThis.fetch = vi.fn(async () => {
    if (!reachable) throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify({ files }), { status: 200 });
  }) as unknown as typeof fetch;
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.fetch = originalFetch;
  document.head.innerHTML = '';
  window.history.replaceState(null, '', '/');
});

describe('coming back to an app that was left open', () => {
  it('reloads onto a new build after a while away', async () => {
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      setVisibility('hidden');
      files = ['/assets/index-new222.js', '/assets/index-new222.css'];
      vi.setSystemTime(Date.now() + 60 * 60_000);
      setVisibility('visible');
      await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    } finally {
      stop();
    }
  });

  it('stays put when the build has not changed', async () => {
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      setVisibility('hidden');
      vi.setSystemTime(Date.now() + 60 * 60_000);
      setVisibility('visible');
      await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
      await Promise.resolve();
      expect(reload).not.toHaveBeenCalled();
    } finally {
      stop();
    }
  });

  it('does not interrupt somebody who only glanced away', async () => {
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      setVisibility('hidden');
      files = ['/assets/index-new222.js'];
      vi.setSystemTime(Date.now() + 30_000);
      setVisibility('visible');
      await Promise.resolve();
      expect(globalThis.fetch).not.toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    } finally {
      stop();
    }
  });

  it('keeps running what it has when there is no signal', async () => {
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      reachable = false;
      setVisibility('hidden');
      vi.setSystemTime(Date.now() + 60 * 60_000);
      setVisibility('visible');
      await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
      await Promise.resolve();
      expect(reload).not.toHaveBeenCalled();
    } finally {
      stop();
    }
  });
});

/*
 * The reload threw away work in progress.
 *
 * It came the moment the app was back in front, wherever the learner was. A
 * checkpoint, a Real Life conversation, a review round and a half-typed answer
 * live only in memory, so somebody who took a phone call half-way through a
 * checkpoint just after a deploy came back to Today with the checkpoint gone.
 */
describe('a new build found in the middle of something', () => {
  async function comeBackToNewBuild(reload: () => void) {
    setVisibility('hidden');
    files = ['/assets/index-new222.js', '/assets/index-new222.css'];
    vi.setSystemTime(Date.now() + 60 * 60_000);
    setVisibility('visible');
    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(reload).not.toHaveBeenCalled();
  }

  it('waits until the checkpoint is left for a screen with nothing open', async () => {
    window.history.replaceState(null, '', '/checkpoint/pre-a1-u1-cp');
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      await comeBackToNewBuild(reload);
      arrivedAt('/lesson/pre-a1-u1-l2');
      expect(reload).not.toHaveBeenCalled();
      arrivedAt('/course');
      expect(reload).toHaveBeenCalledTimes(1);
      arrivedAt('/');
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      stop();
    }
  });

  it('leaves a Real Life conversation alone', async () => {
    window.history.replaceState(null, '', '/scenario/bakery');
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      await comeBackToNewBuild(reload);
      arrivedAt('/scenario/bakery');
      expect(reload).not.toHaveBeenCalled();
      arrivedAt('/');
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      stop();
    }
  });

  it('hears from the app when the learner reaches a resting screen', async () => {
    window.history.replaceState(null, '', '/checkpoint/pre-a1-u1-cp');
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      await comeBackToNewBuild(reload);
      // The app itself, opened on the course path; no server to load from.
      globalThis.fetch = vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch;
      render(
        <MemoryRouter initialEntries={['/course']}>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </MemoryRouter>,
      );
      await screen.findByText(tr('offlineTitle', 'en'));
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      stop();
    }
  });

  it('does nothing on the next screen when no new build was found', () => {
    const reload = vi.fn();
    const stop = watchForNewBuild(reload);
    try {
      arrivedAt('/course');
      expect(reload).not.toHaveBeenCalled();
    } finally {
      stop();
    }
  });
});
