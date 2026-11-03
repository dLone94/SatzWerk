import { describe, expect, it } from 'vitest';
import type { AnswerSpec } from '../../src/content/types.ts';
import { LEXICON, SCENARIO_SCRIPTS, allLessons, describeNoun } from '../../src/content/index.ts';
import { buildFeedback } from '../../src/core/feedback/explain.ts';
import { microTip } from '../../src/core/feedback/microTips.ts';
import { tokenize } from '../../src/core/validation/text.ts';
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

  // With no gender line before it, the article line opened with a "So"
  // ("Затова") that followed from nothing.
  it('starts with "So" only after the gender line', () => {
    for (const [given, answer] of [
      ['Ich habe kein Bruder.', 'Ich habe keinen Bruder.'],
      ['Ich kenne deinem Vater.', 'Ich kenne deinen Vater.'],
    ]) {
      const { en, bg } = explain(given!, spec(answer!));
      expect(en.join(' '), given).not.toMatch(/(^| )So here/);
      expect(bg.join(' '), given).not.toContain('Затова');
      expect(en.join(' '), given).toContain('Here German uses');
    }
    const { en } = explain('Das Tisch ist groß.', spec('Der Tisch ist groß.'));
    expect(en.join(' ')).toContain('So here German uses');
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

/** Every word an explanation line quotes, "…" in English and „…“ in Bulgarian. */
function quoted(lines: string[]): string[] {
  return lines.flatMap((line) => [...line.matchAll(/["„]([^"“]+)["“]/g)].map((match) => match[1]!));
}

/*
 * The panel shows one answer under "Expected" and asks for it to be retyped.
 * The lines under it were built from whichever authored alternative came
 * closest: "The word German uses here is "hier"" under "Das, bitte.", and
 * "Hallo" under "Guten Morgen!".
 */
describe('the explanation and the expected answer agree', () => {
  it('explains a wrong answer against the answer it shows', () => {
    for (const [given, answer, alternatives] of [
      ['xyz', 'Guten Morgen!', ['Guten Tag!', 'Hallo!']],
      ['Tschüss!', 'Guten Morgen!', ['Guten Tag!', 'Hallo!']],
      ['ich weiß nicht', 'Das, bitte.', ['Das hier, bitte.']],
      ['Halo!', 'Guten Morgen!', ['Guten Tag!', 'Hallo!']],
      ['Guten Tag noch!', 'Auf Wiedersehen!', ['Schönen Tag noch!']],
    ] as const) {
      const { feedback, en } = explain(given, spec(answer, { alternatives: [...alternatives] }));
      const shown = feedback.correction.toLowerCase();
      for (const word of quoted(en)) {
        // A word the learner typed may be quoted back too.
        if (given.toLowerCase().includes(word.toLowerCase())) continue;
        expect(shown, `${given}: "${word}"`).toContain(word.toLowerCase());
      }
    }
  });

  // Across the course, whatever a wrong answer is compared with is what the
  // panel shows and asks to be retyped.
  it('holds for every authored step with alternatives', () => {
    const steps = [
      ...allLessons().flatMap((lesson) => lesson.exercises),
      ...SCENARIO_SCRIPTS.flatMap((script) => script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : []))),
    ]
      .flatMap((exercise) => exercise.steps.map((step) => ({ step, kind: exercise.kind })))
      .filter(({ step }) => (step.answer.alternatives ?? []).length > 0);
    expect(steps.length).toBeGreaterThan(100);
    for (const { step, kind } of steps) {
      const alternative = step.answer.alternatives![0]!;
      const words = alternative.split(' ');
      // Nonsense, the alternative with a letter missing, and the alternative
      // without its first word.
      for (const given of ['xyz', alternative.replace(/\p{L}(\p{L})/u, '$1'), words.slice(1).join(' ') || 'xyz']) {
        const result = validateAnswer(given, step.answer, { lexicon: LEXICON, scaffold: step.scaffold, exerciseKind: kind });
        if (result.verdict === 'correct' || result.verdict === 'accepted-variant' || result.trapFeedback) continue;
        const compared = result.diff.map((entry) => entry.expected).filter(Boolean).join(' ').toLowerCase();
        expect(compared, `${step.id}: ${given}`).toBe(tokenize(result.target).join(' ').toLowerCase());
      }
    }
  });
});

/*
 * "Das" in "Das, bitte." means "that one", as the step's own hint says. The
 * feedback called it an article and added the article tip.
 */
describe('das standing on its own', () => {
  it('is not explained as an article', () => {
    for (const [given, answer] of [
      ['Brot, bitte.', 'Das, bitte.'],
      ['Sie ist meine Tochter.', 'Das ist meine Tochter.'],
      ['ich weiß nicht', 'Das, bitte.'],
    ] as const) {
      const { result, en, bg } = explain(given, spec(answer));
      expect(en.join(' '), given).not.toContain('article');
      expect(bg.join(' '), given).not.toContain('Член');
      expect(microTip(result.categories), given).toBeUndefined();
    }
  });

  it('names the pronoun that belongs there', () => {
    const { en, bg } = explain('Sie ist meine Tochter.', spec('Das ist meine Tochter.'));
    expect(en).toContain('The pronoun should be "Das", not "Sie".');
    expect(bg).toContain('Местоимението трябва да е „Das“, а не „Sie“.');
  });

  // The next sentence's capital, or the end of the question, used to count
  // as das's noun on these steps: "The article has to be "das" here".
  it('is not explained as an article at the end of a sentence', () => {
    const steps = new Map(
      SCENARIO_SCRIPTS.flatMap((script) => script.beats.flatMap((beat) => (beat.who === 'you' ? beat.exercise.steps : [])))
        .concat(allLessons().flatMap((lesson) => lesson.exercises.flatMap((exercise) => exercise.steps)))
        .map((step) => [step.id, step]),
    );
    for (const [id, given, line] of [
      ['sc-pharmacy-a1-t4-s1', 'Ich nehme es. Danke schön!', 'The pronoun should be "das", not "es".'],
      ['sc-pharmacy-b1-t4-s1', 'Dann nehme ich es. Vielen Dank!', undefined],
      ['u3l3-ex2-s3', 'Wie viel kostet die?', 'The pronoun should be "das", not "die".'],
      ['u6l3-ex4-s1', 'Wer ist der?', 'The pronoun should be "das", not "der".'],
    ] as const) {
      const step = steps.get(id);
      expect(step, id).toBeDefined();
      const { result, en, bg } = explain(given, step!.answer, { scaffold: step!.scaffold });
      expect(result.categories, given).not.toContain('article');
      expect(en.join(' '), given).not.toContain('article');
      expect(bg.join(' '), given).not.toContain('Член');
      expect(microTip(result.categories), given).toBeUndefined();
      if (line) expect(en, given).toContain(line);
    }
  });

  // The noun of a gap's article is in the scaffold. The explanation read the
  // answer without it, took "das" for a pronoun, and could not find the
  // article it was asked to explain.
  it('names the article the validator found, in a gap too', () => {
    const { result, en } = explain('sie kleinen', spec('das kleine'), { scaffold: '___ Kind schläft.' });
    expect(result.categories).toContain('article');
    expect(en).toContain('The article has to be "das" here, not "sie".');
  });
});

/*
 * With the noun left out, the article line quoted the learner's word joined
 * to the answer's noun: "not "xyz Wasser"", a phrase nobody typed.
 */
describe('an article whose noun was left out', () => {
  it('quotes only what the learner wrote', () => {
    const { en } = explain('Eine, bitte.', spec('Ein Wasser, bitte.'));
    expect(en).toContain('So here German uses "Ein Wasser", not "Eine".');
    expect(en.join(' ')).not.toContain('Eine Wasser');
  });

  it('does not call another word in its place an article mistake', () => {
    const { result, en } = explain('xyz bitte.', spec('Ein Wasser, bitte.', { alternatives: ['Bitte ein Wasser.', 'Wasser, bitte.'] }));
    expect(result.categories).not.toContain('article');
    expect(en.join(' ')).not.toContain('xyz Wasser');
    expect(microTip(result.categories)).toBeUndefined();
  });
});

describe('an answer typed in Cyrillic letters', () => {
  it('asks for the German keyboard instead of explaining a mistake', () => {
    const { result, feedback, en, bg } = explain('Гутен Морген', spec('Guten Morgen!'));
    expect(result.verdict).toBe('empty');
    expect(feedback.askRetype).toBe(false);
    expect(en.join(' ')).toContain('Cyrillic');
    expect(bg.join(' ')).toContain('кирилица');
    expect(en.join(' ')).not.toContain('Guten');
  });
});

describe('a wrong choice in a listening exercise', () => {
  it('is explained by its sound, without a grammar tip', () => {
    const { result, en, bg } = explain('die Tochter', spec('die Töchter'), { exerciseKind: 'listenChoose' });
    expect(en.join(' ')).not.toContain('Here German needs');
    expect(en.join(' ')).toContain('ö');
    expect(en.join(' ')).toContain('plain o');
    expect(bg.join(' ')).toContain('ö');
    expect(microTip(result.categories)).toBeUndefined();
  });

  it('names what was said when more than the dots differ', () => {
    const { en, bg } = explain('wir', spec('vier'), { exerciseKind: 'listenChoose' });
    expect(en.join(' ')).toContain('It was "vier", not "wir".');
    expect(bg.join(' ')).toContain('Беше „vier“, а не „wir“.');
  });

  // The choice is quoted as it was shown, not rebuilt from its words.
  it('quotes the choice with its marks', () => {
    const { en } = explain('8:30', spec('7:30'), { exerciseKind: 'listenChoose' });
    expect(en.join(' ')).toContain('It was "7:30", not "8:30".');
  });
});
