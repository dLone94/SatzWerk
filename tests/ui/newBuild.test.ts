// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { watchForNewBuild } from '../../src/services/offline/register.ts';

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
