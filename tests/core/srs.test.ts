import { describe, expect, it } from 'vitest';
import {
  createReviewItem,
  dueItems,
  gradeFromAttempt,
  hintPenalty,
  orderQueue,
  scheduleReview,
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

    // The second step is answered when it falls due, a day later.
    const graduated = scheduleReview(step1, 'good', new Date(step1.dueAt));
    expect(graduated.state).toBe('known');
    expect(graduated.intervalDays).toBe(2);
  });

  it('repeats the same learning step on "hard"', () => {
    const first = scheduleReview(item(), 'hard', T0);
    expect(first.state).toBe('learning');
    expect(first.learningStep).toBe(0);
    expect(minutesBetween(first.dueAt, T0)).toBe(10);
  });

  it('graduates straight away on "easy"', () => {
    const jumped = scheduleReview(item(), 'easy', T0);
    expect(jumped.state).toBe('known');
    expect(jumped.intervalDays).toBe(4);
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
