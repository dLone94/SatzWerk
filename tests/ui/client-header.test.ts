import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api/client.ts';
import { disablePush } from '../../src/services/push/index.ts';

/**
 * The header that says a request came from the app.
 *
 * The server now refuses a write that cannot show where it came from, because
 * an ordinary form on any web page used to be able to set a local copy's
 * password or wipe the learner's progress. The bodyless posts (reset, logout)
 * carry no Content-Type, so without this header they would be refused too and
 * the app's own Reset button would stop working.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllGlobals();
});

function recordFetches() {
  const seen: Array<{ url: string; headers: Headers }> = [];
  globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
    seen.push({ url, headers: new Headers(init?.headers) });
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  }) as unknown as typeof fetch;
  return seen;
}

describe('every request the app makes', () => {
  it('carries the app header, with a body or without one', async () => {
    const seen = recordFetches();
    await api.reset();
    await api.logout();
    await api.login('a-long-enough-password');
    await api.state();
    expect(seen).toHaveLength(4);
    for (const { url, headers } of seen) {
      expect(headers.get('x-requested-with'), url).toBe('SatzWerk');
    }
    // And JSON is still declared where there is JSON.
    expect(seen[2]!.headers.get('content-type')).toBe('application/json');
  });

  it('including turning reminders off', async () => {
    const seen = recordFetches();
    const subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', unsubscribe: async () => true };
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration: async () => ({ pushManager: { getSubscription: async () => subscription } }) },
    });
    await disablePush();
    expect(seen.map(({ url }) => url)).toEqual(['/api/push/unsubscribe']);
    expect(seen[0]!.headers.get('x-requested-with')).toBe('SatzWerk');
  });
});
