/**
 * Which day a piece of work belongs to.
 *
 * The app counts a streak, and a streak is a claim about the learner's own
 * calendar. Every day here used to be `toISOString().slice(0, 10)` — a UTC
 * day — and in Berlin that is not the same thing as a day. A round finished at
 * half past midnight on Tuesday is 22:30 UTC on Monday, so it was filed under
 * Monday: Tuesday then held no work at all, and three consecutive evenings of
 * study reported a streak of one. Measured, not imagined — there is a test for
 * exactly those three evenings.
 *
 * So the browser says which day it is where it is standing, and these two
 * functions are the whole rule. They are pure and live here because both sides
 * need them: the server buckets the write, and the dashboard counts the streak
 * against the same calendar the learner is looking at.
 */

/**
 * Minutes to add to UTC to get local time — the negation of JavaScript's
 * `getTimezoneOffset()`, which counts the other way round.
 *
 * Real offsets run from -12:00 to +14:00. Anything outside that came from a
 * broken clock or a hostile client, and is ignored rather than trusted: the
 * cost of being wrong is somebody's streak, and UTC is the honest fallback.
 */
export const MAX_OFFSET_MINUTES = 14 * 60;
export const MIN_OFFSET_MINUTES = -12 * 60;

export function plausibleOffset(raw: unknown): number {
  const minutes = Number(raw);
  if (!Number.isFinite(minutes)) return 0;
  const whole = Math.round(minutes);
  if (whole < MIN_OFFSET_MINUTES || whole > MAX_OFFSET_MINUTES) return 0;
  return whole;
}

/** The calendar date at `at`, as seen from a place `offsetMinutes` from UTC. */
export function localDay(at: Date, offsetMinutes = 0): string {
  return new Date(at.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10);
}

/** Today, where this code is running. Used by the browser, not the server. */
export function todayHere(now = new Date()): string {
  return localDay(now, -now.getTimezoneOffset());
}

const DAY_MS = 86_400_000;

function shift(day: string, days: number): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/**
 * Consecutive days of real work, counted backwards from `today`.
 *
 * A day with no answers ends it, and nothing is invented: only days the
 * learner actually answered on are counted. A streak stays alive until the end
 * of the following day, so somebody who studies every evening does not lose it
 * because they have not got to today's round yet.
 */
export function streakOn(daysWithAnswers: Iterable<string>, today: string): number {
  const days = daysWithAnswers instanceof Set ? daysWithAnswers : new Set(daysWithAnswers);
  if (days.size === 0) return 0;

  let cursor = days.has(today) ? today : days.has(shift(today, -1)) ? shift(today, -1) : null;
  if (cursor === null) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shift(cursor, -1);
  }
  return streak;
}
