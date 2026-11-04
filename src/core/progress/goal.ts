/**
 * The daily goal, in active minutes.
 *
 * It used to start at 20, while the daily practice it sits beside takes about
 * six: a beginner who did the day's practice read "17 more to your goal"
 * every evening. A goal is a habit before it is a target, so a new learner
 * starts at 10 and is offered small steps either side of it. A goal a learner
 * already has is theirs and is never moved by a change here.
 */
export const DEFAULT_DAILY_GOAL_MINUTES = 10;

/** The goals offered as one tap, at onboarding and in Settings; anything else is typed. */
export const DAILY_GOAL_CHOICES = [5, 10, 15, 20] as const;
