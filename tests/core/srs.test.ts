import { describe, expect, it } from 'vitest';
import {
  createReviewItem,
  dueItems,
  dueReason,
  gradeFromAttempt,
  hintPenalty,
  KNOWN_INTERVAL_DAYS,
  orderQueue,
  scheduleReview,
  stateForInterval,
  summarizeQueue,
  type ReviewItem,
} from '../../src/core/srs/scheduler.ts';

const T0 = new Date('2026-01-01T10:00:00.000Z');

function item(overrides: Partial<ReviewItem> = {}): ReviewItem {
  return {
    ...createReviewItem({ id: 'r1', kind: 'vocab', refId: 'v1', level: 'pre-a1', now: T0 }),
    ...overrides,
  };
}

const minutesBetween = (a: string, b: Date) => (new Date(a).getTime() - b.getTime()) / 60_000;

describe('scheduler', () => {
  it('creates a new item that is due immediately', () => {
    const fresh = createReviewItem({ id: 'r1', kind: 'vocab', refId: 'v1', level: 'pre-a1', now: T0 });
    expect(fresh.state).toBe('new');
    expect(dueItems([fresh], T0)).toHaveLength(1);
  });

  it('gives harder words a lower starting ease', () => {
    const easy = createReviewItem({ id: 'a', kind: 'vocab', refId: 'v', level: 'pre-a1', difficulty: 1, now: T0 });
    const hard = createReviewItem({ id: 'b', kind: 'vocab', refId: 'v', level: 'pre-a1', difficulty: 5, now: T0 });
    expect(hard.ease).toBeLessThan(easy.ease);
  });

  it('walks a new item through the learning steps and graduates it', () => {
    const step1 = scheduleReview(item(), 'good', T0);
    expect(step1.state).toBe('learning');
    expect(minutesBetween(step1.dueAt, T0)).toBe(1440);

    // The second step is answered when it falls due, a day later. Graduated,
    // it is reviewed two days on, and it is still being learnt.
    const graduated = scheduleReview(step1, 'good', new Date(step1.dueAt));
    expect(graduated.state).toBe('learning');
    expect(graduated.intervalDays).toBe(2);

    // Remembered again when that falls due: a second day, after a real gap.
    const known = scheduleReview(graduated, 'good', new Date(graduated.dueAt));
    expect(known.state).toBe('known');
    expect(known.intervalDays).toBe(5);
  });

  it('repeats the same learning step on "hard"', () => {
    const first = scheduleReview(item(), 'hard', T0);
    expect(first.state).toBe('learning');
    expect(first.learningStep).toBe(0);
    expect(minutesBetween(first.dueAt, T0)).toBe(10);
  });

  it('does not let "easy" skip a learning step', () => {
    // Every clean answer is graded easy. It used to jump a word just taught
    // to "known" with a four-day interval.
    const first = scheduleReview(item(), 'easy', T0);
    expect(first.state).toBe('learning');
    expect(first.learningStep).toBe(1);
    expect(minutesBetween(first.dueAt, T0)).toBe(1440);
    expect(first.ease).toBe(item().ease);
  });

  it('grows the interval multiplicatively for known items', () => {
    const known = item({ state: 'known', intervalDays: 4, ease: 2.5, learningStep: 2 });
    const next = scheduleReview(known, 'good', T0);
    expect(next.intervalDays).toBe(10); // round(4 * 2.5 * 1.0)
    const easier = scheduleReview(known, 'easy', T0);
    expect(easier.intervalDays).toBeGreaterThan(next.intervalDays);
    const harder = scheduleReview(known, 'hard', T0);
    expect(harder.intervalDays).toBeLessThan(next.intervalDays);
  });

  it('lapses a forgotten known item and brings it straight back', () => {
    const known = item({ state: 'known', intervalDays: 30, ease: 2.5 });
    const lapsed = scheduleReview(known, 'again', T0);
    expect(lapsed.state).toBe('lapsed');
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.intervalDays).toBe(0);
    expect(minutesBetween(lapsed.dueAt, T0)).toBe(5);
    expect(lapsed.ease).toBeLessThan(known.ease);
  });

  it('counts forgetting a graduated item as a lapse even before it is known', () => {
    const graduated = item({ state: 'learning', intervalDays: 2, learningStep: 2 });
    const lapsed = scheduleReview(graduated, 'again', T0);
    expect(lapsed.state).toBe('lapsed');
    expect(lapsed.lapses).toBe(1);
  });

  it('keeps a slip on the learning steps out of the lapse count', () => {
    const slipped = scheduleReview(item({ state: 'learning', learningStep: 1 }), 'again', T0);
    expect(slipped.state).toBe('learning');
    expect(slipped.lapses).toBe(0);
  });

  it('keeps the ease inside its bounds', () => {
    let current = item({ state: 'known', intervalDays: 10, ease: 1.35 });
    for (let i = 0; i < 5; i += 1) current = scheduleReview(current, 'again', T0);
    expect(current.ease).toBeGreaterThanOrEqual(1.3);

    let rising = item({ state: 'known', intervalDays: 10, ease: 2.75 });
    for (let i = 0; i < 5; i += 1) rising = scheduleReview(rising, 'easy', T0);
    expect(rising.ease).toBeLessThanOrEqual(2.8);
  });
});

/*
 * Early reviews.
 *
 * Every answer in a lesson schedules the words it targets, and one lesson
 * often asks for the same word nine or ten times within a few minutes. Each of
 * those answers used to count as a review made on time, so the interval was
 * multiplied again and again: 4 days, 15, 55, 200, 365. One clean sitting sent
 * the central word of a lesson out of review for a year, and a word answered
 * wrongly and then right a minute later jumped straight to four days.
 */
describe('reviews made before the item is due', () => {
  const minute = 60_000;
  const day = 86_400_000;
  const at = (ms: number) => new Date(T0.getTime() + ms);

  it('keeps a word answered nine times in one sitting within four days', () => {
    let current = item();
    for (let n = 0; n < 9; n += 1) current = scheduleReview(current, 'easy', at(n * minute));
    expect(current.intervalDays).toBeLessThanOrEqual(4);
    expect(new Date(current.dueAt).getTime() - at(8 * minute).getTime()).toBeLessThanOrEqual(4 * day);
  });

  it('keeps "good" answers in one sitting within the first learning steps', () => {
    let current = item();
    for (let n = 0; n < 9; n += 1) current = scheduleReview(current, 'good', at(n * minute));
    expect(current.state).toBe('learning');
    expect(new Date(current.dueAt).getTime() - at(8 * minute).getTime()).toBeLessThanOrEqual(day);
  });

  it('does not let a right answer straight after a slip skip the learning steps', () => {
    const slipped = scheduleReview(scheduleReview(item(), 'easy', T0), 'again', at(day * 4));
    const next = scheduleReview(slipped, 'easy', at(day * 4 + minute));
    expect(next.state).not.toBe('known');
    expect(new Date(next.dueAt).getTime() - at(day * 4 + minute).getTime()).toBeLessThanOrEqual(10 * minute);
  });

  it('grows an early review by the time that has actually passed', () => {
    // Known for 10 days, last seen 8 days ago: practising it early is worth
    // about as much as eight days of spacing, not the full ten.
    const known = item({
      state: 'known',
      intervalDays: 10,
      ease: 2.5,
      lastReviewAt: at(-8 * day).toISOString(),
      dueAt: at(2 * day).toISOString(),
    });
    const next = scheduleReview(known, 'good', T0);
    expect(next.intervalDays).toBe(20); // round(8 * 2.5)
    expect(new Date(next.dueAt).getTime()).toBe(T0.getTime() + 20 * day);
  });

  it('never shortens an interval because the review came early', () => {
    const known = item({
      state: 'known',
      intervalDays: 30,
      ease: 2.5,
      lastReviewAt: at(-1 * day).toISOString(),
      dueAt: at(29 * day).toISOString(),
    });
    for (const grade of ['hard', 'good', 'easy'] as const) {
      const next = scheduleReview(known, grade, T0);
      expect(next.intervalDays, grade).toBe(30);
      expect(next.state).toBe('known');
      // Practising early still moves it back in the queue, so the next early
      // round offers something else.
      expect(new Date(next.dueAt).getTime()).toBeGreaterThanOrEqual(new Date(known.dueAt).getTime());
    }
  });

  it('still lets a slip demote an item that is not due yet', () => {
    const known = item({
      state: 'known',
      intervalDays: 30,
      lastReviewAt: at(-1 * day).toISOString(),
      dueAt: at(29 * day).toISOString(),
    });
    const lapsed = scheduleReview(known, 'again', T0);
    expect(lapsed.state).toBe('lapsed');
    expect(minutesBetween(lapsed.dueAt, T0)).toBe(5);
  });
});

/*
 * What "known" means.
 *
 * One lesson called eight of its twelve words known: every clean answer was
 * graded easy, and easy took a word just taught straight to a four-day
 * interval. Known now takes recall on two separate days after the day it was
 * taught, and nothing done in one day gets an item there.
 */
describe('known', () => {
  const minute = 60_000;
  const day = 86_400_000;
  const at = (ms: number) => new Date(T0.getTime() + ms);

  it('is one rule, by interval', () => {
    expect(KNOWN_INTERVAL_DAYS).toBe(5);
    expect(stateForInterval(2)).toBe('learning');
    expect(stateForInterval(4)).toBe('learning');
    expect(stateForInterval(5)).toBe('known');
    expect(stateForInterval(40)).toBe('known');
  });

  it('is never reached by answers given on the day the item was taught', () => {
    for (const grade of ['good', 'easy'] as const) {
      let current = item();
      // A lesson, its final check, a redo and a review round: every twenty
      // minutes until just before midnight.
      for (let n = 0; n < 40; n += 1) current = scheduleReview(current, grade, at(n * 20 * minute));
      expect(current.state, grade).toBe('learning');
      expect(current.intervalDays, grade).toBe(0);
    }
  });

  it('is never reached again on the day an item was forgotten', () => {
    let current = scheduleReview(item({ state: 'known', intervalDays: 15, ease: 2.5 }), 'again', T0);
    for (let n = 1; n < 40; n += 1) current = scheduleReview(current, 'easy', at(n * 20 * minute));
    expect(current.state).not.toBe('known');
    expect(current.intervalDays).toBe(0);
  });

  it('is not reached by early practice inside one day after graduating', () => {
    let current = item({
      state: 'learning',
      intervalDays: 2,
      learningStep: 2,
      ease: 2.8,
      lastReviewAt: T0.toISOString(),
      dueAt: at(2 * day).toISOString(),
    });
    for (let n = 1; n < 24; n += 1) current = scheduleReview(current, 'easy', at(n * 59 * minute));
    expect(current.state).toBe('learning');
    expect(current.intervalDays).toBeLessThan(KNOWN_INTERVAL_DAYS);
  });

  /*
   * Practising early every day pushed the due date out each time, so the word
   * was never due, and a day's early growth (three days) never reached five:
   * remembered on thirty separate days, it still read "Learning".
   */
  it('is reached by a clean answer every day, in a few days', () => {
    for (const grade of ['good', 'easy'] as const) {
      let current = item();
      let knownOn: number | undefined;
      for (let d = 0; d <= 30 && knownOn === undefined; d += 1) {
        current = scheduleReview(current, grade, at(d * day));
        if (current.state === 'known') knownOn = d;
      }
      expect(knownOn, grade).toBeDefined();
      expect(knownOn!, grade).toBeLessThanOrEqual(5);
    }
  });

  it('is not hurried by a day held on an answer that only just survived', () => {
    const graduated = item({
      state: 'learning',
      intervalDays: 3,
      learningStep: 2,
      ease: 2.5,
      lastReviewAt: T0.toISOString(),
      dueAt: at(3 * day).toISOString(),
    });
    expect(scheduleReview(graduated, 'hard', at(day)).intervalDays).toBe(3);
    expect(scheduleReview(graduated, 'good', at(day)).intervalDays).toBe(4);
    // Less than a whole day is still the same day's practice.
    expect(scheduleReview(graduated, 'easy', at(day - 60_000)).intervalDays).toBe(3);
  });

  it('can be lost on a right answer that only just survived', () => {
    const shaky = item({
      state: 'known',
      intervalDays: 5,
      learningStep: 2,
      ease: 1.3,
      lastReviewAt: T0.toISOString(),
      dueAt: at(5 * day).toISOString(),
    });
    const next = scheduleReview(shaky, 'hard', at(5 * day));
    expect(next.intervalDays).toBe(4); // round(5 * 1.3 * 0.6)
    expect(next.state).toBe('learning');
    expect(next.lapses).toBe(0);
  });

  it('is reached by clean answers on the day after and two days after that', () => {
    let current = scheduleReview(item(), 'easy', T0);
    current = scheduleReview(current, 'easy', at(day));
    expect(current.state).toBe('learning');
    current = scheduleReview(current, 'easy', at(3 * day));
    expect(current.state).toBe('known');
  });
});

/*
 * Late reviews.
 *
 * der Hund was last seen on a four-day interval and recalled cleanly nine
 * days later, and its next interval was worked out from the four days it was
 * given, not the nine it had lasted.
 */
describe('reviews made after the item fell due', () => {
  const day = 86_400_000;
  const at = (ms: number) => new Date(T0.getTime() + ms);
  const lateBy = (elapsed: number) =>
    item({
      state: 'known',
      intervalDays: 4,
      ease: 2.5,
      learningStep: 2,
      lastReviewAt: at(-elapsed * day).toISOString(),
      dueAt: at((4 - elapsed) * day).toISOString(),
    });

  it('counts the days it was actually remembered', () => {
    expect(scheduleReview(lateBy(9), 'good', T0).intervalDays).toBe(20); // 8 held, not 4
    expect(scheduleReview(lateBy(6), 'good', T0).intervalDays).toBe(15); // 6 * 2.5
    expect(scheduleReview(lateBy(9), 'easy', T0).intervalDays).toBe(28); // round(8 * 2.65 * 1.3)
  });

  it('gives an on-time review exactly what it always had', () => {
    expect(scheduleReview(lateBy(4), 'good', T0).intervalDays).toBe(10);
  });

  it('credits at most twice the interval after a long break', () => {
    expect(scheduleReview(lateBy(120), 'good', T0).intervalDays).toBe(20);
  });

  it('gives a hard answer no credit for lateness', () => {
    expect(scheduleReview(lateBy(9), 'hard', T0).intervalDays).toBe(scheduleReview(lateBy(4), 'hard', T0).intervalDays);
  });

  it('still resets a late item that was forgotten', () => {
    const lapsed = scheduleReview(lateBy(60), 'again', T0);
    expect(lapsed.state).toBe('lapsed');
    expect(lapsed.intervalDays).toBe(0);
    expect(lapsed.learningStep).toBe(0);
    expect(minutesBetween(lapsed.dueAt, T0)).toBe(5);
    // And it has to come back through the steps before it is known again.
    const relearnt = scheduleReview(lapsed, 'easy', new Date(lapsed.dueAt));
    expect(relearnt.state).toBe('learning');
    expect(minutesBetween(relearnt.dueAt, new Date(lapsed.dueAt))).toBe(1440);
  });
});

describe('grading an attempt', () => {
  it('never rewards an answer that was revealed first', () => {
    expect(gradeFromAttempt({ verdict: 'correct', hintsUsed: 0, revealed: true })).toBe('again');
    expect(hintPenalty(0, true)).toBe(0);
  });

  it('rewards unaided recall the most', () => {
    expect(gradeFromAttempt({ verdict: 'correct', hintsUsed: 0, revealed: false })).toBe('easy');
    expect(gradeFromAttempt({ verdict: 'correct', hintsUsed: 1, revealed: false })).toBe('good');
    expect(gradeFromAttempt({ verdict: 'correct', hintsUsed: 3, revealed: false })).toBe('hard');
  });

  it('sends grammar mistakes back to the start of the queue', () => {
    expect(gradeFromAttempt({ verdict: 'incorrect', hintsUsed: 0, revealed: false })).toBe('again');
  });

  it('treats an orthographic note as a good but not perfect recall', () => {
    expect(gradeFromAttempt({ verdict: 'accepted-with-note', hintsUsed: 0, revealed: false })).toBe('good');
  });

  it('reduces credit as hints are used, without punishing harshly', () => {
    expect(hintPenalty(0, false)).toBe(1);
    expect(hintPenalty(1, false)).toBeLessThan(1);
    expect(hintPenalty(1, false)).toBeGreaterThan(0.5);
    expect(hintPenalty(3, false)).toBeGreaterThan(0.5);
  });
});

describe('why an item is due', () => {
  /*
   * "Overdue" used to mean later than the item's whole interval, so a word on
   * a four-day interval that fell due three days ago said "Scheduled for
   * today", and so did seven others beside it.
   */
  const now = new Date(2026, 10, 2, 9, 0);
  const known = (dueAt: Date) => item({ state: 'known', intervalDays: 4, dueAt: dueAt.toISOString() });

  it('calls anything that fell due before today overdue', () => {
    expect(dueReason(known(new Date(2026, 9, 30, 9, 0)), now)).toBe('overdue');
    expect(dueReason(known(new Date(2026, 10, 1, 23, 30)), now)).toBe('overdue');
  });

  it('keeps "scheduled" for what falls due today', () => {
    expect(dueReason(known(new Date(2026, 10, 2, 0, 15)), now)).toBe('scheduled');
    expect(dueReason(known(new Date(2026, 10, 2, 8, 59)), now)).toBe('scheduled');
  });

  it('still names new, learning and forgotten items by their state', () => {
    const late = new Date(2026, 9, 1).toISOString();
    expect(dueReason(item({ state: 'new', dueAt: late }), now)).toBe('new');
    expect(dueReason(item({ state: 'learning', dueAt: late }), now)).toBe('learning');
    expect(dueReason(item({ state: 'lapsed', dueAt: late }), now)).toBe('lapsed');
  });

  it('reads a graduated item that is not known yet by the calendar', () => {
    // Four days on an interval, it has not been asked for three of them.
    const graduated = item({ state: 'learning', intervalDays: 4, learningStep: 2, dueAt: new Date(2026, 9, 30, 9, 0).toISOString() });
    expect(dueReason(graduated, now)).toBe('overdue');
    expect(dueReason({ ...graduated, dueAt: new Date(2026, 10, 2, 8, 0).toISOString() }, now)).toBe('scheduled');
  });
});

describe('queue', () => {
  const later = new Date(T0.getTime() + 10 * 86_400_000);

  it('counts only what is actually due', () => {
    const items = [
      item({ id: 'a' }),
      item({ id: 'b', state: 'known', dueAt: new Date(T0.getTime() + 5 * 86_400_000).toISOString() }),
    ];
    expect(summarizeQueue(items, T0).total).toBe(1);
    expect(summarizeQueue(items, later).total).toBe(2);
  });

  it('puts forgotten material before brand new material', () => {
    const items = [
      item({ id: 'new', state: 'new' }),
      item({ id: 'lapsed', state: 'lapsed' }),
      item({ id: 'learning', state: 'learning' }),
    ];
    expect(orderQueue(items, later).map((i) => i.id)).toEqual(['lapsed', 'learning', 'new']);
  });

  /*
   * Interleaving, which is the whole reason orderQueue is not just a sort.
   *
   * A lesson creates all its review items in one moment, so they share a dueAt
   * and used to arrive as one contiguous run — twenty B2 words in a row. That
   * is blocked practice, and it feels easier than it is: inside a run you stop
   * retrieving the word and start coasting on the run's own context.
   */
  it('deals consecutive items out from different lessons', () => {
    const lessons = ['a1-u1-l1', 'b2-u5-l2'];
    const items = lessons.flatMap((lessonId, group) =>
      Array.from({ length: 5 }, (_, index) =>
        item({
          id: `${lessonId}-${index}`,
          lessonId,
          level: group === 0 ? 'a1' : 'b2',
          state: 'known',
          dueAt: T0.toISOString(),
        }),
      ),
    );

    const ordered = orderQueue(items, T0);
    expect(ordered).toHaveLength(10);
    const sources = ordered.map((entry) => entry.lessonId);
    for (let index = 1; index < sources.length; index += 1) {
      expect(sources[index], `position ${index} repeats ${sources[index]}`).not.toBe(sources[index - 1]);
    }
  });

  it('keeps the most overdue item first even while interleaving', () => {
    const old = item({
      id: 'old',
      lessonId: 'a1-u1-l1',
      state: 'known',
      dueAt: new Date(T0.getTime() - 5 * 86_400_000).toISOString(),
    });
    const recent = [0, 1].map((n) =>
      item({ id: `recent-${n}`, lessonId: 'b2-u5-l2', state: 'known', dueAt: T0.toISOString() }),
    );
    expect(orderQueue([...recent, old], T0)[0]!.id).toBe('old');
  });

  it('never holds an item back once only one lesson is left', () => {
    // Two from one lesson, four from another: the alternation runs out and the
    // remainder must still be dealt rather than dropped.
    const items = [
      ...[0, 1].map((n) => item({ id: `short-${n}`, lessonId: 'l-short', state: 'known' })),
      ...[0, 1, 2, 3].map((n) => item({ id: `long-${n}`, lessonId: 'l-long', state: 'known' })),
    ];
    const ordered = orderQueue(items, T0);
    expect(ordered).toHaveLength(6);
    expect(new Set(ordered.map((entry) => entry.id)).size).toBe(6);
  });

  it('does not interleave across urgency tiers', () => {
    // A forgotten word is worth seeing before a merely scheduled one, whatever
    // lesson each came from.
    const items = [
      item({ id: 'known-a', lessonId: 'l1', state: 'known' }),
      item({ id: 'lapsed-a', lessonId: 'l1', state: 'lapsed' }),
      item({ id: 'known-b', lessonId: 'l2', state: 'known' }),
      item({ id: 'lapsed-b', lessonId: 'l2', state: 'lapsed' }),
    ];
    const states = orderQueue(items, T0).map((entry) => entry.state);
    expect(states).toEqual(['lapsed', 'lapsed', 'known', 'known']);
  });

  it('interleaves by level when items have no lesson of their own', () => {
    const items = [
      ...[0, 1, 2].map((n) => item({ id: `a-${n}`, kind: 'mistake', level: 'a1', state: 'known' })),
      ...[0, 1, 2].map((n) => item({ id: `b-${n}`, kind: 'mistake', level: 'b1', state: 'known' })),
    ];
    const levels = orderQueue(items, T0).map((entry) => entry.level);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]).not.toBe(levels[index - 1]);
    }
  });

  it('leaves a queue of one source exactly as it was', () => {
    const items = [0, 1, 2, 3].map((n) =>
      item({ id: `only-${n}`, lessonId: 'l1', state: 'known' }),
    );
    expect(orderQueue(items, T0).map((entry) => entry.id)).toEqual([
      'only-0',
      'only-1',
      'only-2',
      'only-3',
    ]);
  });
});
