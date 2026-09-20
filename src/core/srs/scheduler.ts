import type { CefrLevel, ErrorCategory } from '../../content/types.ts';
import type { Verdict } from '../validation/validate.ts';

/**
 * SatzWerk review scheduler.
 *
 * ## The algorithm, written down
 *
 * A deliberately small, SM-2-derived scheme. It is documented here so it can be
 * tuned later without anyone having to reverse-engineer it.
 *
 * States: `new` -> `learning` -> `known`, with `lapsed` for a known item that
 * was forgotten.
 *
 * Learning steps (minutes): 10, then 1440 (one day). A `good` answer moves to
 * the next step; after the last step the item graduates to `known`.
 *
 * Once `known`, the interval grows multiplicatively:
 *
 *     interval' = clamp(interval * ease * gradeFactor, 1, 365)
 *
 * with gradeFactor 0.6 for `hard`, 1.0 for `good` and 1.3 for `easy`, and
 * `ease` moving by -0.15 / 0 / +0.15 within [1.3, 2.8].
 *
 * `again` always sends the item back to learning step 0 with a 5-minute delay,
 * counts a lapse and drops the ease by 0.2.
 *
 * Recall quality is NOT taken straight from correctness. `gradeFromAttempt`
 * folds in hint usage and error severity, so an answer produced only after the
 * solution was revealed can never be graded better than `again`.
 */

export type ReviewState = 'new' | 'learning' | 'known' | 'lapsed';

export type RecallGrade = 'again' | 'hard' | 'good' | 'easy';

export type ReviewKind = 'vocab' | 'noun-article' | 'sentence' | 'pattern' | 'grammar' | 'mistake';

export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  /** Vocabulary id, pattern id, grammar id or mistake id. */
  refId: string;
  lessonId?: string;
  level: CefrLevel;
  state: ReviewState;
  ease: number;
  /** Current interval in days. 0 while the item is still in learning. */
  intervalDays: number;
  /** ISO timestamp. */
  dueAt: string;
  lastReviewAt?: string;
  successCount: number;
  failureCount: number;
  lapses: number;
  learningStep: number;
  createdAt: string;
}

export const LEARNING_STEPS_MINUTES = [10, 1440];
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;
export const DEFAULT_EASE = 2.5;
export const MAX_INTERVAL_DAYS = 365;

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const GRADE_FACTOR: Record<RecallGrade, number> = { again: 0, hard: 0.6, good: 1, easy: 1.3 };
const EASE_DELTA: Record<RecallGrade, number> = { again: -0.2, hard: -0.15, good: 0, easy: 0.15 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function iso(date: Date): string {
  return date.toISOString();
}

export interface NewItemInput {
  id: string;
  kind: ReviewKind;
  refId: string;
  level: CefrLevel;
  lessonId?: string;
  /** Authored difficulty 1..5; harder words start with a slightly lower ease. */
  difficulty?: number;
  now?: Date;
}

/** Create an item that is immediately due, because it has just been taught. */
export function createReviewItem(input: NewItemInput): ReviewItem {
  const now = input.now ?? new Date();
  const difficulty = clamp(input.difficulty ?? 2, 1, 5);
  return {
    id: input.id,
    kind: input.kind,
    refId: input.refId,
    lessonId: input.lessonId,
    level: input.level,
    state: 'new',
    ease: clamp(DEFAULT_EASE - (difficulty - 2) * 0.1, MIN_EASE, MAX_EASE),
    intervalDays: 0,
    dueAt: iso(now),
    successCount: 0,
    failureCount: 0,
    lapses: 0,
    learningStep: 0,
    createdAt: iso(now),
  };
}

/**
 * Apply a graded review to an item, returning a new item. Pure: the caller
 * persists the result.
 */
export function scheduleReview(item: ReviewItem, grade: RecallGrade, now = new Date()): ReviewItem {
  const next: ReviewItem = { ...item, lastReviewAt: iso(now) };

  if (grade === 'again') {
    next.state = item.state === 'known' ? 'lapsed' : 'learning';
    next.learningStep = 0;
    next.intervalDays = 0;
    next.failureCount = item.failureCount + 1;
    if (item.state === 'known') next.lapses = item.lapses + 1;
    next.ease = clamp(item.ease + EASE_DELTA.again, MIN_EASE, MAX_EASE);
    next.dueAt = iso(new Date(now.getTime() + 5 * MINUTE_MS));
    return next;
  }

  next.successCount = item.successCount + 1;
  next.ease = clamp(item.ease + EASE_DELTA[grade], MIN_EASE, MAX_EASE);

  const inLearning = item.state === 'new' || item.state === 'learning' || item.state === 'lapsed';

  if (inLearning) {
    if (grade === 'easy') {
      next.state = 'known';
      next.learningStep = LEARNING_STEPS_MINUTES.length;
      next.intervalDays = 4;
      next.dueAt = iso(new Date(now.getTime() + 4 * DAY_MS));
      return next;
    }
    const step = grade === 'hard' ? item.learningStep : item.learningStep + 1;
    if (step >= LEARNING_STEPS_MINUTES.length) {
      next.state = 'known';
      next.learningStep = LEARNING_STEPS_MINUTES.length;
      next.intervalDays = 2;
      next.dueAt = iso(new Date(now.getTime() + 2 * DAY_MS));
      return next;
    }
    next.state = 'learning';
    next.learningStep = step;
    next.intervalDays = 0;
    const minutes = LEARNING_STEPS_MINUTES[step] ?? LEARNING_STEPS_MINUTES[0]!;
    next.dueAt = iso(new Date(now.getTime() + minutes * MINUTE_MS));
    return next;
  }

  // Known item reviewed on time.
  const previous = Math.max(item.intervalDays, 1);
  const interval = clamp(Math.round(previous * next.ease * GRADE_FACTOR[grade]), 1, MAX_INTERVAL_DAYS);
  next.state = 'known';
  next.intervalDays = interval;
  next.dueAt = iso(new Date(now.getTime() + interval * DAY_MS));
  return next;
}

export interface AttemptQuality {
  verdict: Verdict;
  /** How many hints the learner opened before answering. */
  hintsUsed: number;
  /** True when the full solution was shown before the learner typed it. */
  revealed: boolean;
  categories?: ErrorCategory[];
}

/**
 * Translate one exercise attempt into a recall grade.
 *
 * Revealing the answer or making a grammar mistake is always `again`: the item
 * must come back soon. An answer that needed hints can never be `easy`.
 */
export function gradeFromAttempt(quality: AttemptQuality): RecallGrade {
  if (quality.revealed) return 'again';
  switch (quality.verdict) {
    case 'incorrect':
    case 'empty':
      return 'again';
    case 'almost':
      return quality.hintsUsed > 0 ? 'again' : 'hard';
    case 'accepted-with-note':
      return quality.hintsUsed > 0 ? 'hard' : 'good';
    case 'correct':
    case 'accepted-variant':
      if (quality.hintsUsed === 0) return 'easy';
      if (quality.hintsUsed === 1) return 'good';
      return 'hard';
    default:
      return 'good';
  }
}

/** Mastery credit multiplier for hint usage. Support is never punished harshly. */
export function hintPenalty(hintsUsed: number, revealed: boolean): number {
  if (revealed) return 0;
  const table = [1, 0.85, 0.7, 0.55];
  return table[Math.min(hintsUsed, table.length - 1)]!;
}

export function isDue(item: ReviewItem, now = new Date()): boolean {
  return new Date(item.dueAt).getTime() <= now.getTime();
}

export function dueItems(items: ReviewItem[], now = new Date()): ReviewItem[] {
  return items.filter((item) => isDue(item, now));
}

/** Human-readable reason an item is in the queue, so the UI never has to guess. */
export function dueReason(item: ReviewItem): 'new' | 'learning' | 'overdue' | 'scheduled' | 'lapsed' {
  if (item.state === 'new') return 'new';
  if (item.state === 'lapsed') return 'lapsed';
  if (item.state === 'learning') return 'learning';
  const daysLate = (Date.now() - new Date(item.dueAt).getTime()) / DAY_MS;
  return daysLate > item.intervalDays ? 'overdue' : 'scheduled';
}

/**
 * Which lesson an item came from, for interleaving.
 *
 * Falls back to the level for items with no lesson — a mistake recorded in a
 * scenario, for instance — so every item has a source and nothing collapses
 * into one undifferentiated bucket.
 */
function sourceOf(item: ReviewItem): string {
  return item.lessonId ?? `level:${item.level}`;
}

/**
 * Deal the items out so that neighbours come from different lessons.
 *
 * Items created by one lesson are created in the same moment, so they share a
 * `dueAt` and arrive as a contiguous block — twenty words from B2 Unit 5, one
 * after another. That is *blocked* practice, and blocked practice reliably
 * feels easier than it is: within a run you stop retrieving the word and start
 * coasting on the context the run itself supplies.
 *
 * This keeps urgency as the first consideration — the bucket whose head is
 * most overdue goes first — and only uses the interleave to break ties between
 * buckets, so nothing waits meaningfully longer than it did. When one bucket
 * is all that is left, its items simply run out in order rather than being
 * held back to preserve an alternation that no longer has a partner.
 */
function interleave(items: ReviewItem[]): ReviewItem[] {
  if (items.length < 3) return items;

  const buckets = new Map<string, ReviewItem[]>();
  for (const item of items) {
    const key = sourceOf(item);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }
  if (buckets.size < 2) return items;

  const out: ReviewItem[] = [];
  let previous: string | null = null;
  while (out.length < items.length) {
    let chosen: string | null = null;
    let chosenDue = Number.POSITIVE_INFINITY;
    for (const [key, bucket] of buckets) {
      if (bucket.length === 0) continue;
      // Skip the bucket we just took from, unless it is the only one left.
      if (key === previous && [...buckets.values()].some((other) => other.length > 0 && other !== bucket)) {
        continue;
      }
      const due = new Date(bucket[0]!.dueAt).getTime();
      if (due < chosenDue || (due === chosenDue && chosen !== null && key < chosen)) {
        chosen = key;
        chosenDue = due;
      }
    }
    if (chosen === null) break;
    out.push(buckets.get(chosen)!.shift()!);
    previous = chosen;
  }
  return out;
}

/**
 * Order the queue: forgotten material first, then items still being learned,
 * then the longest overdue — and, within each of those tiers, dealt out so
 * that consecutive items come from different lessons wherever the queue makes
 * that possible.
 *
 * The tiers are about urgency and are not interleaved across: something you
 * have forgotten is worth seeing before something merely scheduled, whatever
 * lesson each came from.
 */
export function orderQueue(items: ReviewItem[], now = new Date()): ReviewItem[] {
  const priority: Record<ReviewState, number> = { lapsed: 0, learning: 1, known: 2, new: 3 };
  const sorted = dueItems(items, now).sort((a, b) => {
    if (priority[a.state] !== priority[b.state]) return priority[a.state] - priority[b.state];
    const aDue = new Date(a.dueAt).getTime();
    const bDue = new Date(b.dueAt).getTime();
    if (aDue !== bDue) return aDue - bDue;
    return a.id.localeCompare(b.id);
  });

  const out: ReviewItem[] = [];
  for (const state of ['lapsed', 'learning', 'known', 'new'] as ReviewState[]) {
    out.push(...interleave(sorted.filter((item) => item.state === state)));
  }
  return out;
}

export interface QueueSummary {
  total: number;
  new: number;
  learning: number;
  lapsed: number;
  known: number;
}

export function summarizeQueue(items: ReviewItem[], now = new Date()): QueueSummary {
  const due = dueItems(items, now);
  return {
    total: due.length,
    new: due.filter((i) => i.state === 'new').length,
    learning: due.filter((i) => i.state === 'learning').length,
    lapsed: due.filter((i) => i.state === 'lapsed').length,
    known: due.filter((i) => i.state === 'known').length,
  };
}
