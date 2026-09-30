import webpush from 'web-push';
import { dueItems } from '../src/core/srs/scheduler.ts';
import { listReviewItems, type Scope } from './store.ts';

/**
 * Reminders, and the rules they obey.
 *
 * A learning app you forget to open teaches nothing, so this exists. But a
 * reminder is the easiest place in a product to start lying — a streak you did
 * not earn, a "you're falling behind!", a daily ping whether or not there is
 * anything to do — and this app does not display invented statistics, which
 * applies to what it sends as much as to what it shows.
 *
 * So:
 *
 *  - Nothing is sent when nothing is due. Silence is the correct output most
 *    days, and a notification that arrives on an empty queue teaches the
 *    learner to ignore the next one.
 *  - The number in the message is the real count from the review queue.
 *  - There is no streak, no guilt and no urgency language. It says what is
 *    waiting; deciding whether to do it is the learner's business.
 *  - At most one reminder a day, enforced by last_sent_at, so a re-run of the
 *    sender cannot double up.
 */

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
  lastSentAt: string | null;
}

export interface PushConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

/**
 * Push is configured only when all three values are present.
 *
 * Like the AI provider, an unconfigured feature reports itself unavailable
 * rather than half-working: the settings page then says so instead of offering
 * a switch that silently does nothing.
 */
export function pushConfig(env: NodeJS.ProcessEnv = process.env): PushConfig | null {
  const publicKey = env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = env.VAPID_PRIVATE_KEY?.trim();
  // A contact address is required by the standard so a push service can reach
  // the sender. mailto: is what the spec expects.
  const subject = env.VAPID_SUBJECT?.trim() || 'mailto:satzwerk@example.invalid';
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

/* ------------------------------------------------------------------ *
 * Storage
 * ------------------------------------------------------------------ */

export async function saveSubscription(
  { db, userId }: Scope,
  input: { endpoint: string; p256dh: string; auth: string },
  now = new Date(),
): Promise<void> {
  // The endpoint is the identity, so re-subscribing from the same browser
  // refreshes the keys rather than making a duplicate. It also moves the
  // subscription to whoever is studying here now: one phone, one person at a
  // time, and the reminder should be about their reviews.
  await db.run(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, user_id = excluded.user_id`,
    input.endpoint,
    input.p256dh,
    input.auth,
    userId,
    now.toISOString(),
  );
}

/**
 * The push services browsers actually use.
 *
 * The endpoint comes from the browser, but nothing stopped a request from
 * naming any URL at all — http://169.254.169.254/…, a port on 127.0.0.1, a host
 * on the internal network — and the evening job would then send a request to
 * it from the server. Chrome, Edge's Chromium builds, Opera and Samsung use
 * Firebase; Safari uses Apple's; Firefox uses Mozilla's; the old Edge used
 * Windows'. A browser that uses none of these gets no reminders, which is a
 * small price for the server not being pointed at arbitrary hosts.
 */
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  /^([a-z0-9-]+\.)*push\.apple\.com$/,
  /^updates\.push\.services\.mozilla\.com$/,
  /^([a-z0-9-]+\.)*notify\.windows\.com$/,
];
const MAX_ENDPOINT_LENGTH = 1024;

function decodedLength(value: string): number {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(value)) return -1;
  return Buffer.from(value, 'base64url').length;
}

/** Why a subscription cannot be stored, or null when it can. */
export function subscriptionProblem(input: { endpoint: string; p256dh: string; auth: string }): string | null {
  if (input.endpoint.length > MAX_ENDPOINT_LENGTH) return 'endpoint is too long';
  let url: URL;
  try {
    url = new URL(input.endpoint);
  } catch {
    return 'endpoint is not a URL';
  }
  if (url.protocol !== 'https:' || url.port !== '' || url.username || url.password) {
    return 'endpoint must be a plain https URL';
  }
  if (!PUSH_HOSTS.some((host) => host.test(url.hostname))) return 'endpoint is not a known push service';
  // A P-256 public key, uncompressed: 65 bytes starting 0x04. The auth secret
  // is 16 bytes. Anything else cannot be encrypted to.
  if (decodedLength(input.p256dh) !== 65 || Buffer.from(input.p256dh, 'base64url')[0] !== 0x04) {
    return 'keys.p256dh is not a P-256 public key';
  }
  if (decodedLength(input.auth) !== 16) return 'keys.auth is not a 16-byte secret';
  return null;
}

export async function deleteSubscription({ db }: Scope, endpoint: string): Promise<void> {
  // Not scoped by learner: unsubscribing is about this browser, and the
  // endpoint identifies it exactly.
  await db.run('DELETE FROM push_subscriptions WHERE endpoint = ?', endpoint);
}

export async function listSubscriptions({ db, userId }: Scope): Promise<PushSubscriptionRecord[]> {
  const rows = (await db.all(
    'SELECT endpoint, p256dh, auth, last_sent_at FROM push_subscriptions WHERE user_id = ?',
    userId,
  )) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    endpoint: String(row.endpoint),
    p256dh: String(row.p256dh),
    auth: String(row.auth),
    lastSentAt: row.last_sent_at == null ? null : String(row.last_sent_at),
  }));
}

export async function isSubscribed({ db }: Scope, endpoint: string): Promise<boolean> {
  const row = await db.get('SELECT endpoint FROM push_subscriptions WHERE endpoint = ?', endpoint);
  return row !== undefined;
}

/* ------------------------------------------------------------------ *
 * Deciding whether to send
 * ------------------------------------------------------------------ */

export interface ReminderDecision {
  send: boolean;
  dueCount: number;
  /** Why nothing is going out, when nothing is. */
  reason?: 'nothing-due' | 'already-sent-today' | 'not-configured' | 'no-subscriptions';
}

/** Two ISO timestamps on the same UTC day? */
export function sameUtcDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

export function decideReminder(
  dueCount: number,
  subscription: Pick<PushSubscriptionRecord, 'lastSentAt'>,
  now = new Date(),
): ReminderDecision {
  if (dueCount === 0) return { send: false, dueCount, reason: 'nothing-due' };
  if (subscription.lastSentAt && sameUtcDay(subscription.lastSentAt, now.toISOString())) {
    return { send: false, dueCount, reason: 'already-sent-today' };
  }
  return { send: true, dueCount };
}

/** The message, in the learner's own language. Plain counts, nothing else. */
export function reminderText(dueCount: number, lang: 'en' | 'bg'): { title: string; body: string } {
  if (lang === 'bg') {
    return {
      title: 'SatzWerk',
      body:
        dueCount === 1
          ? '1 дума чака повторение.'
          : `${dueCount} думи чакат повторение.`,
    };
  }
  return {
    title: 'SatzWerk',
    body: dueCount === 1 ? '1 item is due for review.' : `${dueCount} items are due for review.`,
  };
}

/* ------------------------------------------------------------------ *
 * Sending
 * ------------------------------------------------------------------ */

export interface SendReport {
  configured: boolean;
  dueCount: number;
  sent: number;
  skipped: number;
  removed: number;
  reason?: ReminderDecision['reason'];
  /**
   * Why a send failed, when one did.
   *
   * A reminder that silently never arrives is the worst failure this feature
   * has, and it is invisible by nature: nobody notices a notification that did
   * not happen. So the report carries the reason out to the caller — and the
   * cron endpoint returns it — rather than swallowing it in a catch.
   */
  errors?: string[];
}

/**
 * How a notification actually leaves the machine.
 *
 * Injectable because the real sender insists on HTTPS, as a push service
 * should, which makes it untestable against a local stub. The seam lets the
 * bookkeeping — sent once a day, prune what is gone, keep what merely failed —
 * be tested without a network, while the encryption itself is checked
 * separately against web-push's own request builder.
 */
export type PushSender = (
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
) => Promise<unknown>;

/**
 * How long one device gets to accept its reminder.
 *
 * Push services answer in well under a second. Without a limit, one endpoint
 * that accepted the connection and then said nothing held up every device and
 * learner after it until the function was killed at 30 seconds — every
 * evening, with no error to show for it.
 */
export const SEND_TIMEOUT_MS = 5_000;

/**
 * The real sender. `timeout` makes web-push destroy a socket that goes quiet;
 * `TTL` lets a push service drop a reminder that could not be delivered within
 * twelve hours, since "3 items are due" from last week is not worth showing.
 */
export function webPushSender(timeoutMs = SEND_TIMEOUT_MS): PushSender {
  return (subscription, payload) =>
    webpush.sendNotification(subscription, payload, { timeout: timeoutMs, TTL: 12 * 3600 });
}

/** The same deadline around any sender, in case one never settles. */
function withDeadline<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    work,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`did not answer within ${ms / 1000} seconds`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/**
 * Send today's reminder, if there is one to send.
 *
 * A push service returns 404 or 410 for an endpoint that no longer exists —
 * the app was uninstalled, or the browser rotated its subscription. Those rows
 * are deleted rather than retried forever; anything else is left alone, since
 * a transient failure is not a reason to forget a device.
 */
export async function sendDueReminder(
  scope: Scope,
  options: {
    lang?: 'en' | 'bg';
    now?: Date;
    env?: NodeJS.ProcessEnv;
    /** Defaults to web-push. Supplied by the tests. */
    send?: PushSender;
    /** How long each device gets. See SEND_TIMEOUT_MS. */
    timeoutMs?: number;
  } = {},
): Promise<SendReport> {
  const now = options.now ?? new Date();
  const config = pushConfig(options.env);
  if (!config) {
    return { configured: false, dueCount: 0, sent: 0, skipped: 0, removed: 0, reason: 'not-configured' };
  }

  const { db } = scope;
  const subscriptions = await listSubscriptions(scope);
  const dueCount = dueItems(await listReviewItems(scope), now).length;

  if (subscriptions.length === 0) {
    return { configured: true, dueCount, sent: 0, skipped: 0, removed: 0, reason: 'no-subscriptions' };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  const timeoutMs = options.timeoutMs ?? SEND_TIMEOUT_MS;
  const send: PushSender = options.send ?? webPushSender(timeoutMs);
  const payload = JSON.stringify({
    ...reminderText(dueCount, options.lang ?? 'en'),
    /*
     * The reminder opens the daily round rather than the review queue.
     *
     * What brings somebody back at nine in the evening is a round they can
     * finish, not a queue they have to decide how much of to do — and the
     * round starts with exactly the items this notification is about.
     */
    url: '/session',
    dueCount,
  });

  let sent = 0;
  let skipped = 0;
  let removed = 0;
  let reason: ReminderDecision['reason'] | undefined;
  const errors: string[] = [];

  const due: PushSubscriptionRecord[] = [];
  for (const subscription of subscriptions) {
    const decision = decideReminder(dueCount, subscription, now);
    if (decision.send) {
      due.push(subscription);
    } else {
      skipped += 1;
      reason = decision.reason;
    }
  }

  // All at once rather than one after another, so a slow device costs its
  // own deadline and nobody else's.
  await Promise.allSettled(
    due.map(async (subscription) => {
      try {
        await withDeadline(
          send(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            payload,
          ),
          timeoutMs,
        );
        await db.run(
          'UPDATE push_subscriptions SET last_sent_at = ? WHERE endpoint = ?',
          now.toISOString(),
          subscription.endpoint,
        );
        sent += 1;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await deleteSubscription(scope, subscription.endpoint);
          removed += 1;
        } else {
          skipped += 1;
          errors.push(`${subscription.endpoint}: ${(error as Error).message}`);
        }
      }
    }),
  );

  return {
    configured: true,
    dueCount,
    sent,
    skipped,
    removed,
    ...(reason ? { reason } : {}),
    ...(errors.length ? { errors } : {}),
  };
}
