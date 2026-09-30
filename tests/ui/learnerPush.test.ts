// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api/client.ts';

/**
 * A phone that turned reminders on as one learner kept that learner's
 * reminders after it was handed to somebody else. The server moves the
 * subscription when a switch of learner names this browser's endpoint, so the
 * switch has to send it.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

function capture(): Array<{ url: string; body: unknown }> {
  const sent: Array<{ url: string; body: unknown }> = [];
  globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
    sent.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return new Response(JSON.stringify({ learners: [], studyingAs: 2 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as unknown as typeof fetch;
  return sent;
}

describe('switching learner on a phone with reminders on', () => {
  it('sends the phone’s push endpoint with the switch', async () => {
    vi.stubGlobal('PushManager', function PushManager() {});
    vi.stubGlobal('Notification', { permission: 'granted' });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        getRegistration: async () => ({
          pushManager: { getSubscription: async () => ({ endpoint: 'https://push.example/phone' }) },
        }),
      },
    });
    const sent = capture();
    await api.studyAs(2);
    await api.addLearner('Anna');
    expect(sent.map((request) => request.body)).toEqual([
      { id: 2, endpoint: 'https://push.example/phone' },
      { name: 'Anna', endpoint: 'https://push.example/phone' },
    ]);
  });

  it('sends nothing extra where there is no push at all', async () => {
    const sent = capture();
    await api.studyAs(2);
    expect(sent[0]!.body).toEqual({ id: 2 });
  });
});
