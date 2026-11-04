// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { enablePush, readPushStatus } from '../../src/services/push/index.ts';

/**
 * Nothing is sent on a day the learner has already studied, and study days
 * are filed on the learner's own calendar. The job runs in UTC, so the device
 * has to say where it is when it subscribes, or "today" for a learner in Sofia
 * would end at two in the morning.
 */

const originalFetch = globalThis.fetch;

afterEach(() => {
  localStorage.clear();
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

/*
 * The offset was sent once, when reminders were turned on. Clocks change and
 * people travel, and subscriptions made before the offset existed never sent
 * one, so the server went on reading "today" for a place the phone had left.
 */
describe('a device that has moved', () => {
  const endpoint = 'https://fcm.googleapis.com/fcm/send/abc';

  function browserWithSubscription() {
    const posted: Array<Record<string, unknown>> = [];
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/push/subscribe') posted.push(JSON.parse(String(init!.body)));
      const body = url === '/api/push/status' ? { configured: true, publicKey: 'BAAA', sendHourUtc: 18 } : {};
      return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
    vi.stubGlobal('PushManager', function PushManager() {});
    vi.stubGlobal('Notification', { permission: 'granted', requestPermission: async () => 'granted' });
    const subscription = { endpoint, toJSON: () => ({ endpoint, keys: { p256dh: 'p', auth: 'a' } }) };
    const registration = { pushManager: { getSubscription: async () => subscription } };
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: async () => registration,
        ready: Promise.resolve(registration),
        getRegistration: async () => registration,
      },
    });
    return posted;
  }

  it('tells the server where it is now, once, when it has not said so yet', async () => {
    const posted = browserWithSubscription();
    expect(await readPushStatus()).toMatchObject({ state: 'on', endpoint });
    await vi.waitFor(() => expect(posted).toHaveLength(1));
    expect(posted[0]).toMatchObject({ endpoint, tzOffsetMinutes: 0 - new Date().getTimezoneOffset() });

    // Same place: nothing more to say.
    await readPushStatus();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(posted).toHaveLength(1);
  });

  it('tells it again after the clocks change or a journey', async () => {
    const posted = browserWithSubscription();
    // What the server last heard: an hour further east than now.
    localStorage.setItem('satzwerk.pushOffset', `${60 - new Date().getTimezoneOffset()} ${endpoint}`);
    await readPushStatus();
    await vi.waitFor(() => expect(posted).toHaveLength(1));
  });

  it('remembers what turning reminders on already said', async () => {
    const posted = browserWithSubscription();
    await enablePush();
    expect(posted).toHaveLength(1);
    await readPushStatus();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(posted).toHaveLength(1);
  });

  it('reads permission given and no subscription as turned off', async () => {
    browserWithSubscription();
    const registration = { pushManager: { getSubscription: async () => null } };
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration: async () => registration },
    });
    expect(await readPushStatus()).toEqual({ state: 'off', sendHourUtc: 18, turnedOff: true });
  });
});
