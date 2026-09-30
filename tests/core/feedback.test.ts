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

/*
 * Every explanation quoted the first changed word, whatever it was about:
 * "Das Tisch sind groß." was told "The verb ending is wrong: "Der", not
 * "Das"". Each line now quotes the word its own mistake is in.
 */
describe('each explanation quotes its own word', () => {
  it('names the verb in the verb line and the article in the article line', () => {
    const { en } = explain('Das Tisch sind groß.', spec('Der Tisch ist groß.'));
    const verb = en.find((line) => line.toLowerCase().includes('verb'));
    expect(verb).toContain('"ist"');
    expect(verb).not.toContain('"Der"');
    expect(en.join(' ')).toContain('"Der Tisch"');
  });

  it('does the same for a possessive beside a verb ending', () => {
    const { en } = explain('Mein Oma wohnen in Hamburg.', spec('Meine Oma wohnt in Hamburg.'));
    const verb = en.find((line) => line.toLowerCase().includes('verb'));
    expect(verb).toContain('"wohnt"');
    expect(verb).not.toContain('Meine');
  });

  it('quotes the right word for a vocabulary slip beside an article slip', () => {
    const { en } = explain('Das Tisch ist klein.', spec('Der Tisch ist groß.'));
    const vocabulary = en.find((line) => line.startsWith('The word German uses'));
    expect(vocabulary).toContain('"groß"');
  });
});

/*
 * Two neighbouring wrong words were misaligned: "Ich wohnst im Hamburg." was
 * told that German does not need "wohnst", that the word it uses is "wohne",
 * and that "in" is missing — and was filed as an extra word.
 */
describe('two wrong words side by side', () => {
  it('pairs each wrong word with the word it stands for', () => {
    const { result, en } = explain('Ich wohnst im Hamburg.', spec('Ich wohne in Hamburg.'));
    expect(result.categories).toEqual(['verb-conjugation', 'preposition']);
    expect(en.join(' ')).toContain('"wohne"');
    expect(en.join(' ')).toContain('"in"');
    expect(en.join(' ')).toContain('"im"');
  });

  it('diagnoses "Wie heißt du?" as a verb and a pronoun, not as missing words', () => {
    const { result } = explain('Wie heißt du?', spec('Wie heißen Sie?'));
    expect(result.categories).toContain('verb-conjugation');
    expect(result.categories).toContain('pronoun');
    expect(result.categories).not.toContain('missing-word');
    expect(result.categories).not.toContain('extra-word');
  });

  it('grades two typos side by side like two typos apart', () => {
    const apart = validateAnswer('Guten Morge, Frau Webe!', spec('Guten Morgen, Frau Weber!'), { lexicon: LEXICON });
    const together = validateAnswer('Guten Morge, Fra Weber!', spec('Guten Morgen, Frau Weber!'), { lexicon: LEXICON });
    expect(together.verdict).toBe(apart.verdict);
  });

  it('still pairs the likely word when one word is extra', () => {
    const { result } = explain('Ich wohne jetzt im Hamburg.', spec('Ich wohne in Hamburg.'));
    expect(result.categories).toContain('preposition');
    expect(result.categories).toContain('extra-word');
  });
});

/*
 * The article explanation rebuilt the "right" article from the noun's gender,
 * always in the nominative: "mit das Auto" was told German uses "das Auto",
 * not "das Auto"; "Mein Oma" was told to write "die Oma"; and the plural-only
 * Eltern was called feminine.
 */
describe('the article explanation', () => {
  it('prescribes the article the sentence needs, not the nominative', () => {
    const { en, bg } = explain('Wir fahren mit das Auto zum Kino.', spec('Wir fahren mit dem Auto zum Kino.'));
    expect(en.join(' ')).toContain('"dem Auto"');
    expect(en.join(' ')).not.toMatch(/uses "das Auto", not "das Auto"/);
    expect(bg.join(' ')).toContain('dem Auto');
  });

  it('keeps the possessive the answer uses', () => {
    const { en } = explain('Mein Oma wohnt in Hamburg.', spec('Meine Oma wohnt in Hamburg.'));
    expect(en.join(' ')).toContain('"Meine Oma"');
    expect(en.join(' ')).not.toContain('"die Oma", not');
  });

  it('asks for keinen where the learner wrote kein or nicht', () => {
    for (const given of ['Ich habe kein Bruder.', 'Ich habe nicht Bruder.']) {
      const { en } = explain(given, spec('Ich habe keinen Bruder.'));
      expect(en.join(' '), given).toContain('"keinen Bruder"');
    }
  });

  it('calls a plural-only noun plural, not feminine', () => {
    const { en, bg } = explain('Mein Eltern wohnen in Bulgarien.', spec('Meine Eltern wohnen in Bulgarien.'));
    expect(en.join(' ')).not.toContain('feminine');
    expect(en.join(' ')).toContain('plural');
    expect(en.join(' ')).toContain('"Meine Eltern"');
    expect(bg.join(' ')).toContain('множествено число');
  });
});

/*
 * A wrong ending on a verb or an adjective the small lexicon did not list was
 * a "spelling slip". Now it is grammar, and the line has to say so.
 */
describe('the ending explanations', () => {
  it('explains an adjective ending, quoting both forms', () => {
    const { result, en, bg } = explain('Ich nehme den schnelle Zug.', spec('Ich nehme den schnellen Zug.'));
    expect(result.categories).toEqual(['adjective-ending']);
    expect(en.join(' ')).toContain('"schnellen", not "schnelle"');
    expect(bg.join(' ')).toContain('schnellen');
  });

  it('names the verb of an ending the lexicon learnt from the vocabulary', () => {
    const { result, en } = explain('Ich kennt deinen Vater.', spec('Ich kenne deinen Vater.'));
    expect(result.categories).toEqual(['verb-conjugation']);
    expect(en.join(' ')).toContain('"kennen"');
  });
});

/*
 * Every reordering was told that the verb belongs in second position, even
 * when the learner's verb was second ("In Hamburg wohne ich." in a
 * dictation, or "Ich arbeite heute." where the lesson fronts the time).
 */
describe('the word-order explanation', () => {
  it('does not cite the verb-second rule when the verb is already second', () => {
    for (const [given, answer, kind] of [
      ['In Hamburg wohne ich.', 'Ich wohne in Hamburg.', 'dictation'],
      ['Ich arbeite heute zu Hause.', 'Heute arbeite ich zu Hause.', 'type'],
    ] as const) {
      const { result, en } = explain(given, spec(answer), { exerciseKind: kind });
      expect(result.categories, given).toEqual(['word-order']);
      expect(en.join(' '), given).not.toContain('second position');
      expect(en.join(' '), given).toContain(`starts with "${answer.split(' ')[0]}"`);
    }
  });

  it('still cites it when the verb is out of place', () => {
    for (const [given, answer] of [
      ['In Hamburg ich wohne.', 'Ich wohne in Hamburg.'],
      ['Heute ich arbeite zu Hause.', 'Heute arbeite ich zu Hause.'],
    ]) {
      const { en } = explain(given!, spec(answer!));
      expect(en.join(' '), given).toContain('second position');
    }
  });

  it('accepts the fronted phrase in a typed answer, showing the taught order', () => {
    const { result, feedback } = explain('In Hamburg wohne ich.', spec('Ich wohne in Hamburg.'), { exerciseKind: 'type' });
    expect(result.verdict).toBe('accepted-variant');
    expect(feedback.correction).toBe('Ich wohne in Hamburg.');
  });
});
