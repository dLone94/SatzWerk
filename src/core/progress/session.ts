import type { Exercise } from '../../content/types.ts';

/**
 * The daily session: one round, sized to the time the learner actually has.
 *
 * A lesson in this course takes twenty-five to thirty minutes, which is the
 * right length for meeting something new and the wrong length for a Tuesday.
 * Most days the honest question is not "which lesson shall I do" but "I have
 * ten minutes, what is worth doing with them" — and until now the app answered
 * that with a list of links to three different pages.
 *
 * This builds a single round instead, out of what is genuinely most useful:
 *
 *  1. **Review that is due.** Spaced repetition only works if the due items
 *     are actually done, and they decay if they are not. They go first.
 *  2. **Recurring mistakes.** A mistake made more than once is the clearest
 *     signal the course has about what this learner specifically needs.
 *  3. **The lesson in progress**, to fill whatever time is left.
 *
 * ## Why the estimate is honest
 *
 * The app promises never to display an invented statistic, and a session
 * advertised as "10 minutes" is a statistic. So the length is not guessed from
 * a constant somebody liked the look of: it is computed from **this learner's
 * own measured pace** — the study seconds and answer count the database has
 * already been recording — and only falls back to a stated default before
 * there is enough of their own data to be worth using.
 *
 * That also means the session gets more accurate the more it is used, which is
 * the right direction for it to move in.
 */

export interface SessionStats {
  /** Total seconds recorded studying, from the database. */
  totalStudySeconds: number;
  /** Total answers submitted, from the database. */
  totalAnswers: number;
}

/**
 * The fallback pace, in seconds per answer.
 *
 * Used only until the learner has answered enough for their own average to
 * mean something. Twenty seconds is the measured middle of this course's own
 * exercise shapes: reading a prompt, typing a German sentence, reading the
 * verdict, and retyping it when it was wrong — which the app requires.
 *
 * It is deliberately on the generous side. A session that runs short is a
 * pleasant surprise; one that runs long breaks the promise on its own label.
 */
export const DEFAULT_SECONDS_PER_ANSWER = 20;

/**
 * How many answers a learner must have given before their own average is used
 * instead of the default.
 *
 * Thirty is roughly one lesson. Below that the average is dominated by the
 * first few answers, which are always slow — somebody is still working out
 * where the umlaut buttons are.
 */
export const ENOUGH_ANSWERS_TO_MEASURE = 30;

/** Seconds per answer for this learner: measured when possible, stated when not. */
export function secondsPerAnswer(stats: SessionStats): { seconds: number; measured: boolean } {
  if (stats.totalAnswers < ENOUGH_ANSWERS_TO_MEASURE || stats.totalStudySeconds <= 0) {
    return { seconds: DEFAULT_SECONDS_PER_ANSWER, measured: false };
  }
  const average = stats.totalStudySeconds / stats.totalAnswers;
  // Clamped against nonsense in either direction: a tab left open all night
  // would otherwise make every session look like it takes an hour, and a burst
  // of one-letter answers would make it look like four minutes.
  const clamped = Math.min(60, Math.max(5, average));
  return { seconds: Math.round(clamped), measured: true };
}

export type SessionPartKind = 'review' | 'mistakes' | 'lesson';

export interface SessionPart {
  kind: SessionPartKind;
  exercises: Exercise[];
  /** Answer steps in this part — what the estimate is actually counted from. */
  steps: number;
}

export interface SessionPlan {
  exercises: Exercise[];
  parts: SessionPart[];
  /** Total answer steps in the session. */
  steps: number;
  estimatedSeconds: number;
  /** True when the estimate came from this learner's own recorded pace. */
  measured: boolean;
}

export interface SessionSources {
  /** Exercises built from review items that are due now. */
  review: Exercise[];
  /** Exercises built from mistakes that have happened more than once. */
  mistakes: Exercise[];
  /** Exercises from the lesson currently in progress. */
  lesson: Exercise[];
}

const ORDER: SessionPartKind[] = ['review', 'mistakes', 'lesson'];

function countSteps(exercises: Exercise[]): number {
  return exercises.reduce((total, exercise) => total + exercise.steps.length, 0);
}

/**
 * Fill the available time from the three sources in priority order.
 *
 * Exercises are taken whole. Cutting one in half would leave a learner three
 * steps into a conjugation table with no ending, which is worse than running
 * forty seconds over — so the budget is a target rather than a hard ceiling,
 * and the estimate reports what was actually assembled rather than what was
 * asked for.
 */
export function planSession(
  sources: SessionSources,
  targetMinutes: number,
  stats: SessionStats,
): SessionPlan {
  const pace = secondsPerAnswer(stats);
  const budgetSeconds = Math.max(60, targetMinutes * 60);

  const parts: SessionPart[] = [];
  const chosen: Exercise[] = [];
  let spent = 0;

  for (const kind of ORDER) {
    const available = sources[kind];
    const taken: Exercise[] = [];
    for (const exercise of available) {
      // Always take at least one exercise overall, so a session is never empty
      // when there is anything at all to do.
      const cost = exercise.steps.length * pace.seconds;
      if (chosen.length > 0 && spent + cost > budgetSeconds) continue;
      taken.push(exercise);
      chosen.push(exercise);
      spent += cost;
    }
    if (taken.length > 0) {
      parts.push({ kind, exercises: taken, steps: countSteps(taken) });
    }
  }

  const steps = countSteps(chosen);
  return {
    exercises: chosen,
    parts,
    steps,
    estimatedSeconds: steps * pace.seconds,
    measured: pace.measured,
  };
}

/** Minutes, rounded for display, never rounded down to zero when there is work. */
export function estimatedMinutes(plan: SessionPlan): number {
  if (plan.steps === 0) return 0;
  return Math.max(1, Math.round(plan.estimatedSeconds / 60));
}
