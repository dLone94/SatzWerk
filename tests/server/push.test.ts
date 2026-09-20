import { describe, expect, it } from 'vitest';
import {
  decideReminder,
  pushConfig,
  reminderText,
  sameUtcDay,
} from '../../server/push.ts';

/**
 * A reminder is the easiest place in a product to start lying.
 *
 * A streak nobody earned, a "you're falling behind", a daily ping whether or
 * not there is anything to do — all of those are invented statistics wearing a
 * different hat, and this app does not display those. These tests pin the
 * rules that keep the sender honest, because they are the rules that would be
 * quietly relaxed first if engagement ever looked disappointing.
 */

describe('when a reminder may be sent', () => {
  /**
   * The load-bearing one. A notification that arrives on an empty queue
   * teaches the learner that the notifications mean nothing, and the next one
   * — the one that mattered — gets ignored too.
   */
  it('sends nothing when nothing is due', () => {
    expect(decideReminder(0, { lastSentAt: null })).toEqual({
      send: false,
      dueCount: 0,
      reason: 'nothing-due',
    });
  });

  it('sends when something is due and nothing went out today', () => {
    expect(decideReminder(5, { lastSentAt: null })).toEqual({ send: true, dueCount: 5 });
  });

  it('sends at most once a day, so a re-run cannot double up', () => {
    const now = new Date('2026-09-19T18:00:00.000Z');
    const earlier = '2026-09-19T06:30:00.000Z';
    expect(decideReminder(5, { lastSentAt: earlier }, now)).toMatchObject({
      send: false,
      reason: 'already-sent-today',
    });
  });

  it('sends again the next day', () => {
    const now = new Date('2026-09-20T18:00:00.000Z');
    expect(decideReminder(5, { lastSentAt: '2026-09-19T18:00:00.000Z' }, now).send).toBe(true);
  });

  it('compares days, not the clock', () => {
    expect(sameUtcDay('2026-09-19T00:00:01.000Z', '2026-09-19T23:59:59.000Z')).toBe(true);
    expect(sameUtcDay('2026-09-19T23:59:59.000Z', '2026-09-20T00:00:01.000Z')).toBe(false);
  });
});

describe('what a reminder says', () => {
  it('states the real count, in the learner’s language', () => {
    expect(reminderText(7, 'en').body).toBe('7 items are due for review.');
    expect(reminderText(7, 'bg').body).toBe('7 думи чакат повторение.');
  });

  it('gets the singular right in both paths', () => {
    expect(reminderText(1, 'en').body).toBe('1 item is due for review.');
    expect(reminderText(1, 'bg').body).toBe('1 дума чака повторение.');
  });

  /**
   * No streak, no urgency, no guilt. The message says what is waiting and
   * stops; whether to do it is the learner's business.
   */
  it('never pressures, and never invents a figure', () => {
    for (const lang of ['en', 'bg'] as const) {
      for (const count of [1, 3, 40]) {
        const { body } = reminderText(count, lang);
        expect(body).toContain(String(count));
        expect(body.toLowerCase()).not.toMatch(/streak|serie|серия|behind|изоставаш|!|don't|не забравяй/);
      }
    }
  });
});

describe('configuration', () => {
  it('reports push unconfigured unless both keys are present', () => {
    expect(pushConfig({} as NodeJS.ProcessEnv)).toBeNull();
    expect(pushConfig({ VAPID_PUBLIC_KEY: 'pub' } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(pushConfig({ VAPID_PRIVATE_KEY: 'priv' } as unknown as NodeJS.ProcessEnv)).toBeNull();
  });

  it('accepts a configured pair and defaults the contact address', () => {
    const config = pushConfig({
      VAPID_PUBLIC_KEY: 'pub',
      VAPID_PRIVATE_KEY: 'priv',
    } as unknown as NodeJS.ProcessEnv);
    expect(config).toMatchObject({ publicKey: 'pub', privateKey: 'priv' });
    expect(config!.subject.startsWith('mailto:')).toBe(true);
  });

  it('ignores whitespace-only values, which is what a half-filled setting looks like', () => {
    expect(
      pushConfig({ VAPID_PUBLIC_KEY: '  ', VAPID_PRIVATE_KEY: 'priv' } as unknown as NodeJS.ProcessEnv),
    ).toBeNull();
  });
});
