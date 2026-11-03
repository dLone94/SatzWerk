/**
 * How much of an answer's text is kept: the first 500 characters of the
 * prompt, the expected answer and what was typed.
 *
 * The server cuts to it when it stores an attempt, and the app cuts to it
 * before it queues one, so a pasted page never goes out too big to be taken.
 * One number for both sides, so the answer the app held is the answer the
 * database keeps.
 */
export const ATTEMPT_TEXT_LIMIT = 500;
