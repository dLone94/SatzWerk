import type { AnswerSpec, ErrorCategory } from '../../content/types.ts';
import { tokenize } from './text.ts';
import { validateAnswer, type ValidateOptions, type ValidationResult } from './validate.ts';

/**
 * Judging something that was said rather than typed.
 *
 * The rule here is short: do not mark a learner down for anything a listener
 * could not have heard.
 *
 * A recogniser returns bare text. It capitalises by its own rules — German
 * recognisers usually capitalise nouns, but not reliably — and its punctuation
 * is invented, since nobody pronounces a full stop. Marking either of those
 * wrong would be judging the recogniser, not the speaker. So both are
 * normalised away before the transcript reaches the ordinary validator, and
 * capitalisation and punctuation are dropped from the verdict if they somehow
 * survive.
 *
 * Everything else — the article, the case, the word order, the verb form — is
 * judged exactly as it is for typing, by exactly the same code. That is the
 * point: a wrong case is a wrong case whether you wrote it or said it, and the
 * learner gets the same authored explanation either way.
 */

/** Mistakes that cannot be heard, and so cannot be the speaker's fault. */
const INAUDIBLE: ReadonlySet<ErrorCategory> = new Set<ErrorCategory>([
  'capitalization',
  'punctuation',
]);

export interface SpokenJudgement {
  /** What the recogniser heard, as it heard it. */
  heard: string;
  /** The validator's verdict on the spoken form. */
  result: ValidationResult;
  /**
   * True when the words match and only inaudible things differ — the honest
   * meaning of "the recogniser understood you".
   */
  understood: boolean;
}

/**
 * Strip what a microphone cannot carry.
 *
 * Case is folded to the answer's own case where the words match, rather than
 * lowercased, so the learner is shown German that looks like German.
 */
export function normaliseSpoken(transcript: string): string {
  return transcript
    .replace(/[.,!?;:…„“”’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Do two utterances contain the same words, ignoring case and punctuation? */
export function sameWords(a: string, b: string): boolean {
  const left = tokenize(normaliseSpoken(a)).map((word) => word.toLowerCase());
  const right = tokenize(normaliseSpoken(b)).map((word) => word.toLowerCase());
  return left.length === right.length && left.every((word, index) => word === right[index]);
}

/**
 * Judge a transcript against the answer the exercise wanted.
 *
 * The transcript is compared against every accepted answer; if it matches one
 * of them in words, that answer's own text is what goes to the validator, so
 * the learner is never told off for a capital letter the recogniser chose.
 */
export function judgeSpoken(
  transcript: string,
  spec: AnswerSpec,
  options: ValidateOptions,
): SpokenJudgement {
  const heard = normaliseSpoken(transcript);

  // If the words are right, hand the validator the authored spelling. The
  // learner said the sentence; the recogniser's orthography is not their work.
  const matched = spec.accepted.find((accepted) => sameWords(heard, accepted));
  const given = matched ?? heard;

  const result = validateAnswer(given, spec, options);
  const audible = result.categories.filter((category) => !INAUDIBLE.has(category));

  return {
    heard,
    result: {
      ...result,
      categories: audible,
      notes: result.notes.filter((note) => !INAUDIBLE.has(note)),
      // Nothing spoken is ever retyped on the strength of a capital letter.
      requireRetype: audible.length > 0 && result.requireRetype,
    },
    understood: matched !== undefined,
  };
}
