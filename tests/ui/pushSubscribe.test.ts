// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { enablePush } from '../../src/services/push/index.ts';

/**
 * Nothing is sent on a day the learner has already studied, and study days
 * are filed on the learner's own calendar. The job runs in UTC, so the device
 * has to say where it is when it subscribes, or "today" for a learner in Sofia
 * would end at two in the morning.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

describe('subscribing', () => {
  it('sends how far this device is from UTC, and passes on the send hour', async () => {
    const sent: Array<{ url: string; body?: Record<string, unknown> }> = [];
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      sent.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
      const body = url === '/api/push/status' ? { configured: true, publicKey: 'BAAA', sendHourUtc: 18 } : {};
      return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
    vi.stubGlobal('PushManager', function PushManager() {});
    vi.stubGlobal('Notification', { permission: 'default', requestPermission: async () => 'granted' });
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'p', auth: 'a' } }),
    };
    const registration = { pushManager: { getSubscription: async () => subscription } };
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: async () => registration, ready: Promise.resolve(registration) },
    });

    const status = await enablePush();

    expect(status).toEqual({ state: 'on', endpoint: subscription.endpoint, sendHourUtc: 18 });
    const subscribe = sent.find((request) => request.url === '/api/push/subscribe')!;
    expect(subscribe.body).toMatchObject({ tzOffsetMinutes: 0 - new Date().getTimezoneOffset() });
  });
});
