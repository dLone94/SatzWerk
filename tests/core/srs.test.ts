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

    const graduated = scheduleReview(step1, 'good', T0);
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
});
