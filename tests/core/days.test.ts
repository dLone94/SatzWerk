import { describe, expect, it } from 'vitest';
import {
  localDay,
  plausibleOffset,
  streakOn,
  todayHere,
  MAX_OFFSET_MINUTES,
  MIN_OFFSET_MINUTES,
} from '../../src/core/progress/days.ts';

/**
 * Which day work belongs to, and what a streak is allowed to claim.
 *
 * This is the rule both sides apply: the server files a write under a day, and
 * the dashboard counts the streak. If they ever disagreed, the number on the
 * screen would not be the number in the database.
 */

describe('the day a piece of work belongs to', () => {
  it('files a Berlin round finished after midnight under that day', () => {
    // 22:30 UTC on Monday is 00:30 on Tuesday in Berlin, and whoever typed it
    // was sitting in Berlin.
    expect(localDay(new Date('2026-09-14T22:30:00Z'), 120)).toBe('2026-09-15');
    // The same instant, to a UTC clock, which is what this used to be.
    expect(localDay(new Date('2026-09-14T22:30:00Z'), 0)).toBe('2026-09-14');
  });

  it('works the other way for a learner west of UTC', () => {
    // 02:00 UTC on Tuesday is still Monday evening in New York.
    expect(localDay(new Date('2026-09-15T02:00:00Z'), -240)).toBe('2026-09-14');
  });

  it('takes the offsets that exist and ignores the ones that do not', () => {
    expect(plausibleOffset(120)).toBe(120);
    expect(plausibleOffset(-330)).toBe(-330);
    expect(plausibleOffset(MAX_OFFSET_MINUTES)).toBe(MAX_OFFSET_MINUTES);
    expect(plausibleOffset(MIN_OFFSET_MINUTES)).toBe(MIN_OFFSET_MINUTES);
    // A broken clock, or somebody trying it on. UTC is the honest fallback.
    for (const nonsense of [MAX_OFFSET_MINUTES + 1, MIN_OFFSET_MINUTES - 1, NaN, Infinity, 'soon', null, undefined, {}]) {
      expect(plausibleOffset(nonsense), String(nonsense)).toBe(0);
    }
  });

  it('agrees with the browser it is running in', () => {
    const now = new Date();
    // Whatever this machine's zone is, "today here" is the date a person
    // standing next to it would write down.
    expect(todayHere(now)).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    );
  });
});

describe('the streak', () => {
  it('counts consecutive days and stops at the first gap', () => {
    expect(streakOn(['2026-09-14', '2026-09-15', '2026-09-16'], '2026-09-16')).toBe(3);
    expect(streakOn(['2026-09-14', '2026-09-16'], '2026-09-16')).toBe(1);
  });

  it('survives a day that is not over yet', () => {
    // Studied yesterday, not yet today: the streak is still alive.
    expect(streakOn(['2026-09-14', '2026-09-15'], '2026-09-16')).toBe(2);
  });

  it('ends once a whole day has been missed', () => {
    expect(streakOn(['2026-09-14', '2026-09-15'], '2026-09-17')).toBe(0);
  });

  it('is zero when nothing has been done', () => {
    expect(streakOn([], '2026-09-16')).toBe(0);
  });

  it('counts across a month and a year boundary', () => {
    expect(streakOn(['2026-08-31', '2026-09-01'], '2026-09-01')).toBe(2);
    expect(streakOn(['2025-12-31', '2026-01-01'], '2026-01-01')).toBe(2);
  });

  it('is not confused by a day counted twice', () => {
    expect(streakOn(['2026-09-16', '2026-09-16', '2026-09-15'], '2026-09-16')).toBe(2);
  });
});
