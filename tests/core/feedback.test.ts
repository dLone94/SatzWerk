import { describe, expect, it } from 'vitest';
import type { AnswerSpec } from '../../src/content/types.ts';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import { buildFeedback } from '../../src/core/feedback/explain.ts';
import { validateAnswer, type ValidateOptions } from '../../src/core/validation/validate.ts';

/*
 * The explanations the learner reads after an answer, checked against the
 * course's real lexicon and noun list.
 */

const ctx = { lexicon: LEXICON, describeNoun };

function spec(accepted: string, extra: Partial<AnswerSpec> = {}): AnswerSpec {
  return { accepted: [accepted], shape: accepted.includes(' ') ? 'sentence' : 'word', ...extra };
}

function explain(given: string, answer: AnswerSpec, options: Partial<ValidateOptions> = {}) {
  const result = validateAnswer(given, answer, { lexicon: LEXICON, ...options });
  const feedback = buildFeedback(result, ctx);
  return { result, feedback, en: feedback.lines.map((line) => line.en), bg: feedback.lines.map((line) => line.bg) };
}

describe('capital letters in the explanation', () => {
  // "Der Tisch" for "der Tisch" is how German writes a word on its own; the
  // note must not say that a sentence starts with a capital, which is what
  // the learner did.
  it('explains an added capital on a word that stands on its own as fine', () => {
    const { en, bg } = explain('Der Tisch', spec('der Tisch', { shape: 'phrase' }));
    expect(en.join(' ')).not.toContain('sentence starts');
    expect(en.join(' ')).toContain('der Tisch');
    expect(bg.join(' ')).toContain('der Tisch');
  });

  // An "almost" used to show only its categories, so the dots left off beside
  // a lowercase noun were never mentioned.
  it('explains the notes of an almost-right answer too', () => {
    const { result, en } = explain('der tisch ist gross.', spec('Der Tisch ist groß.'));
    expect(result.verdict).toBe('almost');
    expect(en.some((line) => line.includes('capital'))).toBe(true);
    expect(en.some((line) => line.includes('special letter') || line.includes('ß'))).toBe(true);
  });

  it('names both the dots and the capital on a lowercase "tschuess"', () => {
    const { en } = explain('tschuess', spec('Tschüss'));
    expect(en.some((line) => line.includes('capital'))).toBe(true);
    expect(en.some((line) => line.includes('special letter'))).toBe(true);
  });
});

/*
 * "Wie heißen du?" was told that capitalisation matters and that sie means
 * she — the learner wrote neither. And "sie ist Ärztin." for "She is a
 * doctor." was told the same, although sie is exactly right there.
 */
describe('the formal Sie in the explanation', () => {
  it('asks for the formal Sie when du stands in its place', () => {
    const { en, bg } = explain('Wie heißen du?', spec('Wie heißen Sie?'));
    expect(en.join(' ')).not.toContain('Capitalisation matters');
    expect(en.join(' ')).toContain('formal "Sie"');
    expect(bg.join(' ')).toContain('Sie');
  });

  it('keeps the capital explanation for sie written in place of Sie', () => {
    const { en } = explain('Wie heißen sie?', spec('Wie heißen Sie?'));
    expect(en.join(' ')).toContain('Capitalisation matters');
  });

  it('does not tell "sie ist Ärztin." that sie means she', () => {
    const { result, en } = explain('sie ist Ärztin.', spec('Sie ist Ärztin.'));
    expect(result.verdict).toBe('accepted-with-note');
    expect(en.join(' ')).not.toContain('formal');
  });
});
