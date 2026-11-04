import { createECDH, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import webpush from 'web-push';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import {
  FIRST_WEEKS_DAYS,
  NUDGE_DAYS_AWAY,
  REMINDER_HOUR_UTC,
  SETTLED_STUDY_DAYS,
  decideReminder,
  learnerDay,
  listSubscriptions,
  practiceReminderText,
  reminderHourUtc,
  saveSubscription,
  sendDueReminder,
  type PushSender,
} from '../../server/push.ts';
import * as store from '../../server/store.ts';
import { SCENARIOS } from '../../src/content/outline/realLife.ts';
import { chooseDailyScript } from '../../src/ui/dailyBuilder.ts';

/**
 * The first weeks, when a reminder matters most and the old rule sent nothing.
 *
 * A learner who answers everything right on day one has nothing due on days
 * two to four: a word answered right first time comes back after four days.
 * Those are exactly the days a beginner drifts away, and the only rule there
 * was — send when something is due — kept quiet through all of them. These
 * tests pin the rule that fills the gap and the limits that keep it honest:
 * only about something real, never on a day already studied, at most one a
 * day, and quiet again once the learner has a rhythm or has let it go.
 */

const DAY = '2026-03-10';
const at = (day: string, time = '18:00:00') => new Date(`${day}T${time}.000Z`);

describe("the learner's day", () => {
  it('is read on their own calendar, not the server’s', () => {
    // 22:30 UTC on the 10th is already the 11th in Sofia (+180 in summer).
    const day = learnerDay({ studied: ['2026-03-10'], startedAt: '2026-03-09T08:00:00.000Z' }, at(DAY, '22:30:00'), 180);
    expect(day.today).toBe('2026-03-11');
    expect(day.studiedToday).toBe(false);
    expect(day.daysAway).toBe(1);
  });

  it('knows a day already studied', () => {
    const day = learnerDay({ studied: ['2026-03-09', DAY], startedAt: '2026-03-09T08:00:00.000Z' }, at(DAY), 0);
    expect(day.studiedToday).toBe(true);
  });

  it('is new for the first two weeks, until five days have been studied', () => {
    const started = '2026-03-01T08:00:00.000Z';
    expect(learnerDay({ studied: ['2026-03-01'], startedAt: started }, at('2026-03-14'), 0).newcomer).toBe(true);
    expect(learnerDay({ studied: ['2026-03-01'], startedAt: started }, at('2026-03-15'), 0).newcomer).toBe(false);
    const five = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05'];
    expect(learnerDay({ studied: five, startedAt: started }, at('2026-03-07'), 0).newcomer).toBe(false);
    expect(learnerDay({ studied: five.slice(0, 4), startedAt: started }, at('2026-03-07'), 0).newcomer).toBe(true);
    expect([FIRST_WEEKS_DAYS, SETTLED_STUDY_DAYS]).toEqual([14, 5]);
  });

  /*
   * The two weeks are counted from the first day of study, not from when the
   * profile was made: somebody who opened the app once a month ago and starts
   * properly today is in their first week today.
   */
  it('starts the two weeks on the first day of study', () => {
    const day = learnerDay({ studied: ['2026-03-09'], startedAt: '2026-01-01T08:00:00.000Z' }, at(DAY), 0);
    expect(day.newcomer).toBe(true);
    expect(day.daysAway).toBe(1);
  });

  it('counts the days away from the start when nothing has been studied yet', () => {
    const day = learnerDay({ studied: [], startedAt: '2026-03-08T08:00:00.000Z' }, at(DAY), 0);
    expect(day).toMatchObject({ newcomer: true, studiedToday: false, daysAway: 2 });
  });
});

describe('when a first-weeks reminder may be sent', () => {
  const newcomer = (daysAway: number) => ({ today: DAY, studiedToday: false, newcomer: true, daysAway });

  it('sends one about the day’s practice when nothing is due', () => {
    expect(decideReminder(0, { lastSentAt: null }, at(DAY), newcomer(1))).toEqual({
      send: true,
      dueCount: 0,
      kind: 'practice',
    });
  });

  it('prefers the real due count when something is due', () => {
    expect(decideReminder(3, { lastSentAt: null }, at(DAY), newcomer(1))).toMatchObject({ send: true, kind: 'due' });
  });

  it('never sends on a day already studied, even with something due', () => {
    const studied = { ...newcomer(0), studiedToday: true };
    expect(decideReminder(4, { lastSentAt: null }, at(DAY), studied)).toEqual({
      send: false,
      dueCount: 4,
      reason: 'studied-today',
    });
    const settled = { ...studied, newcomer: false };
    expect(decideReminder(4, { lastSentAt: null }, at(DAY), settled).reason).toBe('studied-today');
  });

  /*
   * Three unanswered reminders say that reminders are not what is missing.
   * The fourth would only be the start of a daily ping that is ignored, and
   * the due-items rule takes over from there.
   */
  it('lets it rest after three days away', () => {
    expect(NUDGE_DAYS_AWAY).toBe(3);
    expect(decideReminder(0, { lastSentAt: null }, at(DAY), newcomer(3)).send).toBe(true);
    expect(decideReminder(0, { lastSentAt: null }, at(DAY), newcomer(4))).toMatchObject({
      send: false,
      reason: 'nothing-due',
    });
  });

  it('keeps the due-items rule once the first weeks are over', () => {
    const settled = { ...newcomer(1), newcomer: false };
    expect(decideReminder(0, { lastSentAt: null }, at(DAY), settled).reason).toBe('nothing-due');
    expect(decideReminder(2, { lastSentAt: null }, at(DAY), settled)).toMatchObject({ send: true, kind: 'due' });
  });

  it('still sends at most once a day', () => {
    expect(decideReminder(0, { lastSentAt: `${DAY}T06:00:00.000Z` }, at(DAY), newcomer(1)).reason).toBe(
      'already-sent-today',
    );
  });
});

describe('what a first-weeks reminder says', () => {
  it('names the conversation, in the learner’s language', () => {
    expect(practiceReminderText({ en: 'At the bakery', bg: 'В пекарната' }, 'en').body).toBe(
      'Today’s practice is ready: At the bakery.',
    );
    expect(practiceReminderText({ en: 'At the bakery', bg: 'В пекарната' }, 'bg').body).toBe(
      'Днешната практика е готова: В пекарната.',
    );
  });

  it('never pressures, and never invents a figure', () => {
    for (const lang of ['en', 'bg'] as const) {
      const text = practiceReminderText({ en: 'At the bakery', bg: 'В пекарната' }, lang);
      expect(`${text.title} ${text.body}`).not.toMatch(/streak|miss|don't|lose|behind|!|серия|пропус|изгуб/i);
      expect(text.body).not.toMatch(/\d/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The send path, on both databases
 * ------------------------------------------------------------------ */

const keys = webpush.generateVAPIDKeys();
const env = {
  VAPID_PUBLIC_KEY: keys.publicKey,
  VAPID_PRIVATE_KEY: keys.privateKey,
} as unknown as NodeJS.ProcessEnv;

function browserKeys() {
  const curve = createECDH('prime256v1');
  curve.generateKeys();
  return { p256dh: curve.getPublicKey().toString('base64url'), auth: randomBytes(16).toString('base64url') };
}

const databases: Array<[string, () => Promise<Db>]> = [['sqlite', () => openDatabase({ path: ':memory:' })]];
if (process.env.TEST_DATABASE_URL) {
  databases.push([
    'postgres',
    async () => {
      // A schema of its own: the parity tests drop and recreate `public`
      // while other files run.
      const url = process.env.TEST_DATABASE_URL!;
      const admin = new pg.Client({ connectionString: url });
      await admin.connect();
      await admin.query('DROP SCHEMA IF EXISTS first_weeks CASCADE; CREATE SCHEMA first_weeks;');
      await admin.end();
      const separator = url.includes('?') ? '&' : '?';
      return openDatabase({ databaseUrl: `${url}${separator}options=-c%20search_path%3Dfirst_weeks` });
    },
  ]);
}

describe.each(databases)('first-weeks reminders on %s', (_name, open) => {
  let db: Db;
  afterEach(async () => {
    await db?.close();
  });

  const scope = () => ({ db, userId: 1 });
  const payloadOf = (send: ReturnType<typeof vi.fn<PushSender>>, call = 0) =>
    JSON.parse(send.mock.calls[call]![1]) as { title: string; body: string; url: string; dueCount: number };

  it('names the conversation the practice page will offer, and opens it', async () => {
    db = await open();
    // Studied on the evening of the 9th in Sofia, which is the 9th there.
    await store.addStudyTime(scope(), 300, at('2026-03-09', '19:00:00'), 120);
    await saveSubscription(scope(), { endpoint: 'https://push.example/phone', ...browserKeys(), tzOffsetMinutes: 120 });

    const send = vi.fn<PushSender>(async () => undefined);
    const report = await sendDueReminder(scope(), { env, send, now: at(DAY), lang: 'bg' });

    expect(report).toMatchObject({ sent: 1, dueCount: 0 });
    const script = chooseDailyScript('everyday', 'pre-a1', [], DAY, 120);
    const title = SCENARIOS.find((scenario) => scenario.id === script.scenarioId)!.title;
    expect(payloadOf(send)).toMatchObject({ body: `Днешната практика е готова: ${title.bg}.`, url: '/daily' });
  });

  it('stays quiet on a day already studied, by the learner’s own calendar', async () => {
    db = await open();
    await store.addStudyTime(scope(), 300, at('2026-03-09', '19:00:00'), 180);
    // 21:30 UTC on the 10th is 00:30 on the 11th in Sofia: a new day, and
    // the learner has already practised in it.
    await store.addStudyTime(scope(), 120, at(DAY, '21:30:00'), 180);
    await saveSubscription(scope(), { endpoint: 'https://push.example/phone', ...browserKeys(), tzOffsetMinutes: 180 });

    const send = vi.fn<PushSender>(async () => undefined);
    const report = await sendDueReminder(scope(), { env, send, now: at(DAY, '21:45:00') });
    expect(report).toMatchObject({ sent: 0, reason: 'studied-today' });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends the real due count rather than the practice when something is due', async () => {
    db = await open();
    await store.addStudyTime(scope(), 300, at('2026-03-09', '10:00:00'), 0);
    await store.ensureReviewItems(scope(), [{ kind: 'vocab', refId: 'v-die-tochter', level: 'pre-a1', difficulty: 2 }]);
    await saveSubscription(scope(), { endpoint: 'https://push.example/phone', ...browserKeys() });

    const send = vi.fn<PushSender>(async () => undefined);
    await sendDueReminder(scope(), { env, send, now: new Date(Date.now() + 86_400_000) });
    // Created now, so the item is due from now; the study day is long past,
    // so this is the plain due-items rule.
    expect(payloadOf(send)).toMatchObject({ body: '1 item is due for review.', url: '/session', dueCount: 1 });
  });

  /*
   * Two runs at once — a retried cron and a manual run, or two instances —
   * used to both read an empty last_sent_at and both send. The send is now
   * claimed in the database first, and only the run that claims it sends.
   */
  it('sends once when two runs overlap', async () => {
    db = await open();
    await store.addStudyTime(scope(), 300, at('2026-03-09', '10:00:00'), 0);
    await saveSubscription(scope(), { endpoint: 'https://push.example/phone', ...browserKeys() });

    const send = vi.fn<PushSender>(() => new Promise((resolve) => setTimeout(resolve, 20)));
    const reports = await Promise.all([
      sendDueReminder(scope(), { env, send, now: at(DAY) }),
      sendDueReminder(scope(), { env, send, now: at(DAY, '18:00:01') }),
    ]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(reports.map((report) => report.sent).sort()).toEqual([0, 1]);
  });

  it('can try again later the same day when the send itself failed', async () => {
    db = await open();
    await store.addStudyTime(scope(), 300, at('2026-03-09', '10:00:00'), 0);
    await saveSubscription(scope(), { endpoint: 'https://push.example/phone', ...browserKeys() });

    const failing = vi.fn<PushSender>(async () => {
      throw new Error('network unreachable');
    });
    expect((await sendDueReminder(scope(), { env, send: failing, now: at(DAY) })).errors).toHaveLength(1);
    expect((await listSubscriptions(scope()))[0]!.lastSentAt).toBeNull();

    const working = vi.fn<PushSender>(async () => undefined);
    expect((await sendDueReminder(scope(), { env, send: working, now: at(DAY, '19:00:00') })).sent).toBe(1);
  });

  it('remembers where the device is, and updates it on re-subscribing', async () => {
    db = await open();
    const browser = { endpoint: 'https://push.example/phone', ...browserKeys() };
    await saveSubscription(scope(), { ...browser, tzOffsetMinutes: 120 });
    expect((await listSubscriptions(scope()))[0]!.tzOffsetMinutes).toBe(120);
    await saveSubscription(scope(), { ...browser, tzOffsetMinutes: 180 });
    expect((await listSubscriptions(scope()))[0]!.tzOffsetMinutes).toBe(180);
  });
});

describe('the reminder time', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  /*
   * The hosting plan allows a daily job and no more, so there is one, at a
   * fixed hour, and the app can only say when that is — not let the learner
   * choose. This keeps what the app says in step with what is scheduled.
   */
  it('is the one daily job the deployment schedules', () => {
    const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    expect(config.crons).toEqual([{ path: '/api/push/run', schedule: `0 ${REMINDER_HOUR_UTC} * * *` }]);
  });

  it('is known when hosted, and only claimed elsewhere when the operator says so', () => {
    expect(reminderHourUtc({ VERCEL: '1' } as unknown as NodeJS.ProcessEnv)).toBe(REMINDER_HOUR_UTC);
    expect(reminderHourUtc({} as NodeJS.ProcessEnv)).toBeNull();
    expect(reminderHourUtc({ REMINDER_HOUR_UTC: '7' } as unknown as NodeJS.ProcessEnv)).toBe(7);
    expect(reminderHourUtc({ REMINDER_HOUR_UTC: '25' } as unknown as NodeJS.ProcessEnv)).toBeNull();
  });

  it('is reported with the push status, and the subscription keeps the device’s offset', async () => {
    vi.stubEnv('VAPID_PUBLIC_KEY', keys.publicKey);
    vi.stubEnv('VAPID_PRIVATE_KEY', keys.privateKey);
    vi.stubEnv('REMINDER_HOUR_UTC', '18');
    const db = await openDatabase({ path: ':memory:' });
    const status = await handleRequest({ db }, { method: 'GET', path: '/api/push/status' });
    expect(status.body).toMatchObject({ configured: true, sendHourUtc: 18 });

    const browser = browserKeys();
    const subscribed = await handleRequest(
      { db },
      {
        method: 'POST',
        path: '/api/push/subscribe',
        body: { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: browser, tzOffsetMinutes: 120 },
      },
    );
    expect(subscribed.status).toBe(200);
    expect((await listSubscriptions({ db, userId: 1 }))[0]!.tzOffsetMinutes).toBe(120);
    await db.close();
  });
});
