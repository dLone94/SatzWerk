import { createECDH, randomBytes } from 'node:crypto';
import { createServer, type Server, type Socket } from 'node:net';
import webpush from 'web-push';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import {
  listSubscriptions,
  saveSubscription,
  sendDueReminder,
  subscriptionProblem,
  webPushSender,
  type PushSender,
} from '../../server/push.ts';
import * as store from '../../server/store.ts';

/**
 * Where a reminder may be sent, and how long one may take.
 *
 * /api/push/subscribe stored any endpoint at all — http://169.254.169.254/…,
 * https://127.0.0.1:port/…, any internal host — and the evening job then made
 * a request to it from the server. The sender set no timeout and sent one
 * subscription at a time, so a single endpoint that accepted the connection and
 * never answered held up every later device and learner until the function was
 * killed at 30 seconds. Reminders stopped every evening, with no error anywhere.
 */

const scopeOf = (db: Db): store.Scope => ({ db, userId: 1 });

function browserKeys() {
  const curve = createECDH('prime256v1');
  curve.generateKeys();
  return { p256dh: curve.getPublicKey().toString('base64url'), auth: randomBytes(16).toString('base64url') };
}

const vapid = webpush.generateVAPIDKeys();
const env = {
  VAPID_PUBLIC_KEY: vapid.publicKey,
  VAPID_PRIVATE_KEY: vapid.privateKey,
  VAPID_SUBJECT: 'mailto:test@example.invalid',
} as unknown as NodeJS.ProcessEnv;

describe('which endpoints a subscription may name', () => {
  const keys = browserKeys();

  it("takes the browsers' real push services", () => {
    for (const endpoint of [
      'https://fcm.googleapis.com/fcm/send/dQw4w9WgXcQ:APA91b',
      'https://web.push.apple.com/QGuQyavXutnMH4Hi',
      'https://updates.push.services.mozilla.com/wpush/v2/gAAAAA',
      'https://wns2-par02p.notify.windows.com/w/?token=BQYAAA',
    ]) {
      expect(subscriptionProblem({ endpoint, ...keys }), endpoint).toBeNull();
    }
  });

  it('refuses anything else', () => {
    for (const endpoint of [
      'http://169.254.169.254/latest/meta-data',
      'https://127.0.0.1:38581/stuck',
      'http://fcm.googleapis.com/fcm/send/abc',
      'https://fcm.googleapis.com:8443/fcm/send/abc',
      'https://fcm.googleapis.com.evil.example/fcm/send/abc',
      'https://push.apple.com.evil.example/x',
      'https://intranet.local/hook',
      'not a url',
      `https://fcm.googleapis.com/${'a'.repeat(2048)}`,
    ]) {
      expect(subscriptionProblem({ endpoint, ...keys }), endpoint).not.toBeNull();
    }
  });

  it('refuses keys that are not keys', () => {
    const endpoint = 'https://fcm.googleapis.com/fcm/send/abc';
    expect(subscriptionProblem({ endpoint, p256dh: 'x', auth: keys.auth })).not.toBeNull();
    expect(subscriptionProblem({ endpoint, p256dh: keys.p256dh, auth: 'y' })).not.toBeNull();
    // 65 bytes, but not an uncompressed point.
    expect(
      subscriptionProblem({ endpoint, p256dh: Buffer.alloc(65, 1).toString('base64url'), auth: keys.auth }),
    ).not.toBeNull();
  });

  it('is checked by the API before anything is stored', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const response = await handleRequest(
      { db },
      {
        method: 'POST',
        path: '/api/push/subscribe',
        body: { endpoint: 'http://169.254.169.254/latest/meta-data', keys: { p256dh: 'x', auth: 'y' } },
      },
    );
    expect(response.status).toBe(400);
    expect(await listSubscriptions(scopeOf(db))).toHaveLength(0);

    const good = await handleRequest(
      { db },
      {
        method: 'POST',
        path: '/api/push/subscribe',
        body: { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys },
      },
    );
    expect(good.status).toBe(200);
    expect(await listSubscriptions(scopeOf(db))).toHaveLength(1);
    await db.close();
  });
});

describe('a push service that never answers', () => {
  let tarpit: Server;
  let port: number;
  const sockets: Socket[] = [];

  beforeEach(async () => {
    // Accepts the connection, then says nothing at all.
    tarpit = createServer((socket) => sockets.push(socket));
    await new Promise<void>((resolve) => tarpit.listen(0, '127.0.0.1', resolve));
    port = (tarpit.address() as { port: number }).port;
  });

  afterEach(async () => {
    for (const socket of sockets.splice(0)) socket.destroy();
    await new Promise<void>((resolve) => tarpit.close(() => resolve()));
  });

  it('is given up on by the real sender rather than waited for', async () => {
    webpush.setVapidDetails(env.VAPID_SUBJECT!, vapid.publicKey, vapid.privateKey);
    const started = Date.now();
    await expect(
      webPushSender(300)({ endpoint: `https://127.0.0.1:${port}/stuck`, keys: browserKeys() }, '{}'),
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(3_000);
  });

  it('does not stop the other devices getting theirs', async () => {
    const db = await openDatabase({ path: ':memory:' });
    await store.ensureReviewItems(scopeOf(db), [
      { kind: 'vocab', refId: 'v-die-tochter', level: 'pre-a1', difficulty: 2 },
    ]);
    await saveSubscription(scopeOf(db), { endpoint: 'https://stuck.example/1', ...browserKeys() });
    await saveSubscription(scopeOf(db), { endpoint: 'https://fcm.googleapis.com/fcm/send/phone', ...browserKeys() });

    const attempted: string[] = [];
    // A sender that hangs forever on the first device, whatever it was told.
    const send: PushSender = (subscription) => {
      attempted.push(subscription.endpoint);
      return subscription.endpoint.includes('stuck') ? new Promise(() => undefined) : Promise.resolve();
    };
    const report = await sendDueReminder(scopeOf(db), { env, send, timeoutMs: 200 });

    expect(attempted).toContain('https://fcm.googleapis.com/fcm/send/phone');
    expect(report).toMatchObject({ sent: 1, skipped: 1, removed: 0 });
    expect(report.errors?.[0]).toMatch(/stuck\.example.*did not answer/);
    await db.close();
  });
});
