import { createECDH, randomBytes } from 'node:crypto';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import webpush from 'web-push';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { openDatabase, type Db } from '../../server/db.ts';
import {
  listSubscriptions,
  saveSubscription,
  sendDueReminder,
  type PushSender,
} from '../../server/push.ts';
import * as store from '../../server/store.ts';

/**
 * The send path, in two halves.
 *
 * Everything between "something is due" and "a notification leaves the server"
 * is code that cannot be checked by reading it, and whose failure mode is the
 * worst kind: notifications that silently never arrive, which nobody notices
 * because nothing appears to be wrong.
 *
 * The crypto half is checked against web-push's own request builder, so the
 * real VAPID signature and the real aes128gcm encryption are exercised with
 * real keys. The bookkeeping half — once a day, prune what is gone, keep what
 * merely failed — is checked through an injected sender, because the real one
 * insists on HTTPS, as a push service should.
 */

const keys = webpush.generateVAPIDKeys();

/** A genuine P-256 key pair, since the sender does ECDH against it. */
function browserKeys() {
  const curve = createECDH('prime256v1');
  curve.generateKeys();
  return {
    p256dh: curve.getPublicKey().toString('base64url'),
    auth: randomBytes(16).toString('base64url'),
  };
}

const env = {
  VAPID_PUBLIC_KEY: keys.publicKey,
  VAPID_PRIVATE_KEY: keys.privateKey,
  VAPID_SUBJECT: 'mailto:test@example.invalid',
} as unknown as NodeJS.ProcessEnv;

describe('the notification that actually goes on the wire', () => {
  it('is VAPID-signed and encrypted, with real keys', async () => {
    const subscription = { endpoint: 'https://push.example/one', keys: browserKeys() };
    const details = await webpush.generateRequestDetails(
      subscription,
      JSON.stringify({ title: 'SatzWerk', body: '2 items are due for review.' }),
      {
        vapidDetails: {
          subject: 'mailto:test@example.invalid',
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
        },
      },
    );

    expect(details.method).toBe('POST');
    expect(details.endpoint).toBe('https://push.example/one');
    expect(details.headers['Content-Encoding']).toBe('aes128gcm');
    expect(String(details.headers.Authorization)).toContain('vapid');
    expect(details.body).toBeInstanceOf(Buffer);
    // Genuinely encrypted: the message must not be readable on the wire.
    expect((details.body as Buffer).toString('utf8')).not.toContain('due for review');
    expect((details.body as Buffer).byteLength).toBeGreaterThan(0);
  });
});

describe('sending a reminder', () => {
  let db: Db;
  let dbPath: string;

  /*
   * Days measured from the clock rather than written down.
   *
   * A new review item is due from the moment it is created, so a fixed
   * timestamp in the past reports nothing due and the test fails for a reason
   * that has nothing to do with sending. Hard-coding a date in the future
   * would work until that date arrived.
   */
  const DAY_MS = 24 * 60 * 60 * 1000;
  /**
   * A fixed hour on a day n days from now.
   *
   * The hour is pinned so that "later the same day" cannot cross midnight UTC
   * when the suite happens to run late in the evening — which would turn the
   * once-a-day test into a flake that only fails after 21:00.
   */
  const dayAfter = (n: number, hour = 9) => {
    const date = new Date(Date.now() + n * DAY_MS);
    date.setUTCHours(hour, 0, 0, 0);
    return date;
  };

  beforeAll(async () => {
    dbPath = join(tmpdir(), `satzwerk-push-${Date.now()}.db`);
    db = await openDatabase({ path: dbPath });
    // Two items to be due: both new, so the scheduler calls both due now.
    await store.ensureReviewItems(db, [
      { kind: 'vocab', refId: 'v-die-tochter', level: 'pre-a1', difficulty: 2 },
      { kind: 'vocab', refId: 'v-der-tisch', level: 'pre-a1', difficulty: 2 },
    ]);
  }, 30_000);

  afterAll(async () => {
    await db?.close();
    rmSync(dbPath, { force: true });
  });

  it('sends nothing at all when push is not configured', async () => {
    const send = vi.fn();
    const report = await sendDueReminder(db, { env: {} as NodeJS.ProcessEnv, send });
    expect(report).toMatchObject({ configured: false, sent: 0, reason: 'not-configured' });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends nothing when nobody has subscribed', async () => {
    const send = vi.fn();
    const report = await sendDueReminder(db, { env, send });
    expect(report).toMatchObject({ configured: true, sent: 0, reason: 'no-subscriptions' });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends the real due count, once', async () => {
    await saveSubscription(db, { endpoint: 'https://push.example/one', ...browserKeys() });
    const send = vi.fn<PushSender>(async () => undefined);
    const report = await sendDueReminder(db, {
      env,
      send,
      now: dayAfter(1),
    });

    expect(report).toMatchObject({ configured: true, sent: 1, removed: 0 });
    expect(report.dueCount).toBe(2);
    expect(send).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(send.mock.calls[0]![1]) as { body: string; dueCount: number };
    expect(payload.dueCount).toBe(2);
    expect(payload.body).toContain('2');
  });

  it('does not send twice on the same day', async () => {
    const send = vi.fn<PushSender>(async () => undefined);
    const report = await sendDueReminder(db, {
      env,
      send,
      // Later the same UTC day as the send above.
      now: dayAfter(1, 21),
    });
    expect(report).toMatchObject({ sent: 0, skipped: 1, reason: 'already-sent-today' });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends again the next day', async () => {
    const send = vi.fn<PushSender>(async () => undefined);
    const report = await sendDueReminder(db, {
      env,
      send,
      now: dayAfter(2),
    });
    expect(report.sent).toBe(1);
  });

  /**
   * A transient failure is not a reason to forget a device, so the row stays
   * and the reason comes back in the report rather than vanishing.
   */
  it('keeps a subscription that merely failed, and says why', async () => {
    const send = vi.fn<PushSender>(async () => {
      throw new Error('network unreachable');
    });
    const report = await sendDueReminder(db, {
      env,
      send,
      now: dayAfter(3),
    });
    expect(report).toMatchObject({ sent: 0, skipped: 1, removed: 0 });
    expect(report.errors?.[0]).toContain('network unreachable');
    expect(await listSubscriptions(db)).toHaveLength(1);
  });

  /**
   * 410 Gone means the app was uninstalled or the browser rotated its
   * subscription. Retrying forever would mean the table only ever grows.
   */
  it('forgets a subscription the push service says is gone', async () => {
    const send = vi.fn<PushSender>(async () => {
      throw Object.assign(new Error('gone'), { statusCode: 410 });
    });
    const report = await sendDueReminder(db, {
      env,
      send,
      now: dayAfter(4),
    });
    expect(report).toMatchObject({ sent: 0, removed: 1 });
    expect(await listSubscriptions(db)).toHaveLength(0);
  });
});
