import { describe, expect, it } from 'vitest';
import { ruleBasedWritingReview } from '../../server/ai.ts';

/**
 * The Coach's subject-verb agreement check.
 *
 * It was listed on the Coach page as a check it ran, and measured, it never
 * fired: it compared only the first verb of a sentence with the first pronoun,
 * and it counted an infinitive as agreeing with anything — so "Ich arbeiten."
 * passed, and that is the single most common thing a beginner writes when they
 * have not conjugated at all.
 *
 * Both lists matter. The wrong ones prove it now speaks; the right ones prove
 * it does not start crying wolf, which an honest checker must not do either.
 */

const flagged = (text: string) =>
  ruleBasedWritingReview(text)
    .findings.filter((finding) => finding.category === 'verb-conjugation')
    .map((finding) => finding.excerpt);

describe('subject and verb that do not agree', () => {
  it.each([
    ['Ich arbeiten.', 'arbeiten'],
    ['Er machen das.', 'machen'],
    ['Ich sind müde.', 'sind'],
    ['Du heiße Anna.', 'heiße'],
    // The sentence the Coach was shown in the browser, and missed.
    ['Ich wohne in Berlin und ich arbeiten hier.', 'arbeiten'],
  ])('flags "%s"', (text, verb) => {
    expect(flagged(text)).toEqual([verb]);
  });
});

describe('subject and verb that do agree', () => {
  it.each([
    'Ich arbeite hier.',
    'Wir arbeiten hier.',
    // Polite Sie mid-sentence takes the plural form.
    'Arbeiten Sie hier?',
    'Sie arbeiten hier.',
    // Lowercase sie is "she" or "they", and either form is right.
    'Morgen arbeitet sie hier.',
    'Heute arbeiten sie hier.',
    // A capital Sie opening a sentence can be "she" too.
    'Sie ist müde.',
    // Inverted order.
    'Heute arbeite ich.',
    // A pronoun after a verb is often its object, not its subject.
    'Ich kaufe es.',
    'Ich sehe sie.',
    // Two people, one plural subject.
    'Du und ich arbeiten hier.',
    // Modal plus infinitive: the lexicon does not know the modal, so nothing
    // is said about it, and the infinitive at the end is not the finite verb.
    'Ich möchte hier arbeiten.',
    'Das ist er.',
  ])('leaves "%s" alone', (text) => {
    expect(flagged(text)).toEqual([]);
  });
});
