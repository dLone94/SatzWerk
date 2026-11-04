import webpush from 'web-push';
import type { Bilingual } from '../src/content/types.ts';
import { localDay, plausibleOffset } from '../src/core/progress/days.ts';
import { dueItems } from '../src/core/srs/scheduler.ts';
import * as store from './store.ts';
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
 *  - Except in the first two weeks, which is when that rule was most wrong. A
 *    word answered right first time comes back after four days, so a learner
 *    who did well on day one had nothing due on days two to four (exactly
 *    the days a beginner drifts off) and heard nothing. Until they have
 *    studied on five days, a day without study gets one note that today's
 *    practice is ready, naming the conversation the practice page will
 *    really open. That is as true as a due count: the practice is there
 *    every day. After three such days in a row it stops, because three
 *    unanswered reminders say that reminders are not what is missing.
 *  - Nothing is sent on a day the learner has already studied, by their own
 *    calendar. They have done their day; the app has nothing to add.
 *  - The number in the message is the real count from the review queue.
 *  - There is no streak, no guilt and no urgency language. It says what is
 *    waiting; deciding whether to do it is the learner's business.
 *  - At most one reminder a day, claimed in last_sent_at before sending, so
 *    a re-run of the sender, even one at the same moment, cannot double up.
 */

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
  lastSentAt: string | null;
  /** Minutes from UTC where the device was when it subscribed; 0 when unknown. */
  tzOffsetMinutes: number;
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

/**
 * The hour, in UTC, at which the hosted deployment sends reminders.
 *
 * It is the schedule of the single cron job in vercel.json, and a test holds
 * the two together. One daily job is all the hosting plan allows, so the hour
 * is the same for everybody and the learner cannot choose it: morning or
 * evening would need a second job, or an hourly one. What the app can do
 * honestly is say when it is, in the learner's own time.
 */
export const REMINDER_HOUR_UTC = 18;

/**
 * When reminders go out here, if anybody knows.
 *
 * Hosted, the cron above decides. Self-hosted, whatever calls /api/push/run
 * decides, and the app cannot see that, so it claims no time unless the
 * operator says which hour they scheduled.
 */
export function reminderHourUtc(env: NodeJS.ProcessEnv = process.env): number | null {
  const stated = env.REMINDER_HOUR_UTC?.trim();
  if (stated) {
    const hour = Number(stated);
    return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : null;
  }
  return env.VERCEL ? REMINDER_HOUR_UTC : null;
}

/* ------------------------------------------------------------------ *
 * Storage
 * ------------------------------------------------------------------ */

export async function saveSubscription(
  { db, userId }: Scope,
  input: { endpoint: string; p256dh: string; auth: string; tzOffsetMinutes?: number },
  now = new Date(),
): Promise<void> {
  // The endpoint is the identity, so re-subscribing from the same browser
  // refreshes the keys rather than making a duplicate. It also moves the
  // subscription to whoever is studying here now: one phone, one person at a
  // time, and the reminder should be about their reviews. And it refreshes
  // where the phone is, which is what "today" means for its learner.
  await db.run(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_id, created_at, tz_offset_minutes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth,
       user_id = excluded.user_id, tz_offset_minutes = excluded.tz_offset_minutes`,
    input.endpoint,
    input.p256dh,
    input.auth,
    userId,
    now.toISOString(),
    plausibleOffset(input.tzOffsetMinutes ?? 0),
  );
}

/**
 * Hand the subscription of this browser to another learner, when the phone
 * is handed to them. Only the one endpoint moves; other devices keep theirs.
 * Without this the phone kept the reminders of the previous learner, and the
 * Settings of the new one showed reminders as on with nothing to say otherwise.
 */
export async function moveSubscription(db: Scope['db'], endpoint: string, userId: number): Promise<void> {
  await db.run('UPDATE push_subscriptions SET user_id = ? WHERE endpoint = ?', userId, endpoint);
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
    'SELECT endpoint, p256dh, auth, last_sent_at, tz_offset_minutes FROM push_subscriptions WHERE user_id = ?',
    userId,
  )) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    endpoint: String(row.endpoint),
    p256dh: String(row.p256dh),
    auth: String(row.auth),
    lastSentAt: row.last_sent_at == null ? null : String(row.last_sent_at),
    tzOffsetMinutes: plausibleOffset(row.tz_offset_minutes ?? 0),
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
  /** What the reminder is about, when one is going out. */
  kind?: 'due' | 'practice';
  /** Why nothing is going out, when nothing is. */
  reason?: 'nothing-due' | 'already-sent-today' | 'studied-today' | 'not-configured' | 'no-subscriptions';
}

/** Two ISO timestamps on the same UTC day? */
export function sameUtcDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** How long a learner counts as new: two weeks from their first day of study. */
export const FIRST_WEEKS_DAYS = 14;
/** Days of study after which the learner has a rhythm, and due items carry it. */
export const SETTLED_STUDY_DAYS = 5;
/** Days away after which a new learner's reminder about the practice stops. */
export const NUDGE_DAYS_AWAY = 3;

/** Where a learner stands today, on their own calendar. */
export interface LearnerDay {
  today: string;
  studiedToday: boolean;
  /** In the first two weeks and not yet studied on five days. */
  newcomer: boolean;
  /** Whole days since they last studied, or since they started when they have not yet. */
  daysAway: number;
}

const DAY_MS = 86_400_000;
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

/**
 * Today for this learner, where the device is.
 *
 * `studied` is every day with any study in it, as the study log files them:
 * on the learner's own calendar. The two weeks run from the first of those
 * rather than from when the profile was made, because somebody who opened the
 * app once a month ago and begins properly today is in their first week now.
 */
export function learnerDay(
  history: { studied: readonly string[]; startedAt: string },
  now: Date,
  offsetMinutes: number,
): LearnerDay {
  const today = localDay(now, offsetMinutes);
  const days = [...new Set(history.studied)].filter((day) => day <= today).sort();
  const started = new Date(history.startedAt);
  const first = days[0] ?? (Number.isNaN(started.getTime()) ? today : localDay(started, offsetMinutes));
  const last = days.at(-1) ?? first;
  return {
    today,
    studiedToday: days.includes(today),
    newcomer: daysBetween(first, today) < FIRST_WEEKS_DAYS && days.length < SETTLED_STUDY_DAYS,
    daysAway: Math.max(0, daysBetween(last, today)),
  };
}

/**
 * Whether to send, and about what.
 *
 * Without `day` this is the rule as it always was, the due count alone. The
 * sender always knows the learner's day and passes it.
 */
export function decideReminder(
  dueCount: number,
  subscription: Pick<PushSubscriptionRecord, 'lastSentAt'>,
  now = new Date(),
  day?: LearnerDay,
): ReminderDecision {
  if (day?.studiedToday) return { send: false, dueCount, reason: 'studied-today' };
  const kind =
    dueCount > 0
      ? 'due'
      : day?.newcomer && day.daysAway >= 1 && day.daysAway <= NUDGE_DAYS_AWAY
        ? 'practice'
        : null;
  if (!kind) return { send: false, dueCount, reason: 'nothing-due' };
  if (subscription.lastSentAt && sameUtcDay(subscription.lastSentAt, now.toISOString())) {
    return { send: false, dueCount, reason: 'already-sent-today' };
  }
  return { send: true, dueCount, kind };
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

/**
 * The first weeks' message: what is ready, by name. No count, because there
 * is none to give, and nothing about the days that went before.
 */
export function practiceReminderText(
  conversation: Bilingual | null,
  lang: 'en' | 'bg',
): { title: string; body: string } {
  if (lang === 'bg') {
    return {
      title: 'SatzWerk',
      body: conversation ? `Днешната практика е готова: ${conversation.bg}.` : 'Днешната практика е готова.',
    };
  }
  return {
    title: 'SatzWerk',
    body: conversation ? `Today’s practice is ready: ${conversation.en}.` : 'Today’s practice is ready.',
  };
}

/**
 * The conversation today's practice opens with, chosen by the code the
 * practice page uses, from the same rows, on the learner's own day.
 *
 * Imported only when a first-weeks reminder is going out: it reads the course
 * catalogue, which no other request to the server needs.
 */
async function practiceConversation(scope: Scope, day: string, offsetMinutes: number): Promise<Bilingual | null> {
  const [{ chooseDailyScript }, { inferredPracticeLevel }, { SCENARIOS }] = await Promise.all([
    import('../src/ui/dailyBuilder.ts'),
    import('../src/ui/selectors.ts'),
    import('../src/content/outline/realLife.ts'),
  ]);
  const [profile, lessons, checkpoints, runs] = await Promise.all([
    store.getProfile(scope),
    store.getAllLessonProgress(scope),
    store.listCheckpointResults(scope),
    store.listScenarioRuns(scope),
  ]);
  const byLesson = Object.fromEntries(lessons.map((progress) => [progress.lessonId, progress]));
  const level = profile.practiceLevel ?? inferredPracticeLevel(byLesson, checkpoints);
  const script = chooseDailyScript(profile.learningGoal ?? 'everyday', level, runs, day, offsetMinutes);
  return SCENARIOS.find((scenario) => scenario.id === script.scenarioId)?.title ?? null;
}

/** Every day this learner studied on, and when they began. */
async function studyHistory({ db, userId }: Scope): Promise<{ studied: string[]; startedAt: string }> {
  const [days, profile] = await Promise.all([
    db.all<{ day: string }>(
      'SELECT day FROM study_days WHERE user_id = ? AND (answers > 0 OR seconds_active > 0)',
      userId,
    ),
    db.get<{ created_at: string | null }>('SELECT created_at FROM profile WHERE user_id = ?', userId),
  ]);
  return {
    studied: days.map((row) => String(row.day)),
    startedAt: profile?.created_at == null ? new Date().toISOString() : String(profile.created_at),
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
  const lang = options.lang ?? 'en';
  const history = await studyHistory(scope);

  // Each device decides on its own calendar: a phone in Sofia and a laptop
  // left set to UTC can be on different days at the same moment.
  const conversations = new Map<string, Promise<Bilingual | null>>();
  const payloadFor = async (kind: 'due' | 'practice', day: LearnerDay, offsetMinutes: number) => {
    if (kind === 'due') {
      return JSON.stringify({
        ...reminderText(dueCount, lang),
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
    }
    const key = `${day.today} ${offsetMinutes}`;
    // A catalogue that will not load costs the name, not the reminder.
    if (!conversations.has(key)) {
      conversations.set(key, practiceConversation(scope, day.today, offsetMinutes).catch(() => null));
    }
    // The practice page, which opens on the conversation this one names.
    return JSON.stringify({ ...practiceReminderText(await conversations.get(key)!, lang), url: '/daily', dueCount });
  };

  let sent = 0;
  let skipped = 0;
  let removed = 0;
  let reason: ReminderDecision['reason'] | undefined;
  const errors: string[] = [];

  const due: Array<{ subscription: PushSubscriptionRecord; kind: 'due' | 'practice'; day: LearnerDay }> = [];
  for (const subscription of subscriptions) {
    const day = learnerDay(history, now, subscription.tzOffsetMinutes);
    const decision = decideReminder(dueCount, subscription, now, day);
    if (decision.send && decision.kind) {
      due.push({ subscription, kind: decision.kind, day });
    } else {
      skipped += 1;
      reason = decision.reason;
    }
  }

  const sentAt = now.toISOString();
  const startOfDay = `${sentAt.slice(0, 10)}T00:00:00.000Z`;

  // All at once rather than one after another, so a slow device costs its
  // own deadline and nobody else's.
  await Promise.allSettled(
    due.map(async ({ subscription, kind, day }) => {
      /*
       * Claimed before it is sent. Reading last_sent_at, sending and then
       * stamping it let two runs at the same moment (a retried cron and a
       * manual run, or two instances) both read an empty value and both send.
       * Only the run whose update changes the row goes on; the user_id keeps
       * a phone handed to somebody else in the meantime from getting this
       * learner's reminder.
       */
      const claimed = await db.run(
        `UPDATE push_subscriptions SET last_sent_at = ?
         WHERE endpoint = ? AND user_id = ? AND (last_sent_at IS NULL OR last_sent_at < ?)`,
        sentAt,
        subscription.endpoint,
        scope.userId,
        startOfDay,
      );
      if (claimed.changes !== 1) {
        skipped += 1;
        reason = 'already-sent-today';
        return;
      }
      try {
        await withDeadline(
          send(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            await payloadFor(kind, day, subscription.tzOffsetMinutes),
          ),
          timeoutMs,
        );
        sent += 1;
      } catch (error) {
        // Nothing arrived, so the day is not used up: give the claim back,
        // unless another run has stamped the row since.
        await db.run(
          'UPDATE push_subscriptions SET last_sent_at = ? WHERE endpoint = ? AND last_sent_at = ?',
          subscription.lastSentAt,
          subscription.endpoint,
          sentAt,
        );
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
