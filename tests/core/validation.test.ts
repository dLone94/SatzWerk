import { describe, expect, it } from 'vitest';
import type { AnswerSpec } from '../../src/content/types.ts';
import { createBaseLexicon, extendLexicon } from '../../src/core/validation/lexicon.ts';
import { checkFreeWriting, validateAnswer } from '../../src/core/validation/validate.ts';
import { compareUmlauts, splitScaffold } from '../../src/core/validation/text.ts';

const lexicon = extendLexicon(createBaseLexicon(), [
  { german: 'Tochter', wordType: 'noun', gender: 'f', plural: 'die Töchter' },
  { german: 'Tisch', wordType: 'noun', gender: 'm', plural: 'die Tische' },
  { german: 'Haus', wordType: 'noun', gender: 'n', plural: 'die Häuser' },
  { german: 'Hamburg', wordType: 'noun' },
  { german: 'Deutschland', wordType: 'noun' },
  { german: 'Bulgarien', wordType: 'noun' },
  { german: 'Entschuldigung', wordType: 'noun', gender: 'f' },
  { german: 'Arbeit', wordType: 'noun', gender: 'f' },
]);

const opts = { lexicon };

function sentence(accepted: string[], extra: Partial<AnswerSpec> = {}): AnswerSpec {
  return { accepted, shape: 'sentence', ...extra };
}
function word(accepted: string[], extra: Partial<AnswerSpec> = {}): AnswerSpec {
  return { accepted, shape: 'word', ...extra };
}

describe('exact and alternative answers', () => {
  it('accepts the taught answer at full credit', () => {
    const r = validateAnswer('Ich wohne in Hamburg.', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('correct');
    expect(r.credit).toBe(1);
    expect(r.requireRetype).toBe(false);
  });

  it('accepts an authored alternative at full credit but still shows the taught form', () => {
    const spec = sentence(['Ich wohne in Hamburg.'], { alternatives: ['Ich lebe in Hamburg.'] });
    const r = validateAnswer('Ich lebe in Hamburg.', spec, opts);
    expect(r.verdict).toBe('accepted-variant');
    expect(r.credit).toBe(1);
    expect(r.target).toBe('Ich wohne in Hamburg.');
  });

  it('is tolerant of surrounding whitespace', () => {
    const r = validateAnswer('  Ich wohne in Hamburg.  ', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('correct');
  });

  it('treats empty input as "have a go first", not as a mistake', () => {
    const r = validateAnswer('   ', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('empty');
    expect(r.categories).toEqual([]);
  });
});

describe('orthography is forgiven softly, never silently', () => {
  it('flags a missing full stop but does not demand a retype', () => {
    const r = validateAnswer('Ich wohne in Hamburg', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('punctuation');
    expect(r.requireRetype).toBe(false);
    expect(r.credit).toBeGreaterThan(0.9);
  });

  it('accepts "heisse" for "heiße" with a note and asks for a retype', () => {
    const r = validateAnswer('Ich heisse Theo.', sentence(['Ich heiße Theo.']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('umlaut');
    expect(r.requireRetype).toBe(true);
    expect(r.credit).toBeLessThan(1);
  });

  it('accepts ue for ü', () => {
    const r = validateAnswer('Tschuess', word(['Tschüss']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('umlaut');
  });

  it('does not silently fold the other direction', () => {
    // The learner added a special letter the answer does not have.
    const r = validateAnswer('Ich wohne in Hambürg.', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).not.toBe('accepted-with-note');
  });

  it('treats a lowercase noun as a real capitalisation mistake', () => {
    const r = validateAnswer('der tisch', word(['der Tisch']), opts);
    expect(r.verdict).toBe('almost');
    expect(r.categories).toContain('capitalization');
    expect(r.requireRetype).toBe(true);
    expect(r.credit).toBeLessThan(0.6);
  });

  it('catches a single-letter typo as spelling, not vocabulary', () => {
    const r = validateAnswer('Entschuldigng', word(['Entschuldigung']), opts);
    expect(r.verdict).toBe('almost');
    expect(r.categories).toEqual(['spelling']);
    expect(r.requireRetype).toBe(true);
  });
});

/*
 * On an iPhone the answer field does not capitalise by itself, so a beginner's
 * "ich wohne in Hamburg." was marked almost-wrong, cost half the credit, asked
 * for a retype and went into the mistake bank as a capitalisation mistake.
 * The first letter of a sentence is a small thing; a noun's capital is German.
 */
describe('capital letters typed on a phone', () => {
  it('lets a lowercase first word of a sentence through with a note', () => {
    const r = validateAnswer('ich wohne in Hamburg.', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('capitalization');
    expect(r.requireRetype).toBe(false);
    expect(r.credit).toBeGreaterThanOrEqual(0.9);
  });

  it('still also forgives the missing full stop', () => {
    const r = validateAnswer('ich wohne in Hamburg', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.requireRetype).toBe(false);
  });

  it('still wants the capital on a noun', () => {
    const r = validateAnswer('ich wohne in hamburg.', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('almost');
    expect(r.requireRetype).toBe(true);
  });

  it('still wants the capital on a sentence that starts with a noun', () => {
    const r = validateAnswer('tochter, komm!', sentence(['Tochter, komm!']), opts);
    expect(r.verdict).not.toBe('accepted-with-note');
  });

  it('still tells Sie from sie', () => {
    const r = validateAnswer('Wie heißen sie?', sentence(['Wie heißen Sie?']), opts);
    expect(r.verdict).not.toBe('accepted-with-note');
  });

  it('does not let ss for ß hide a lowercase noun', () => {
    const r = validateAnswer('der tisch ist gross.', sentence(['Der Tisch ist groß.']), opts);
    expect(r.verdict).not.toBe('accepted-with-note');
    expect(r.categories).toContain('capitalization');
  });

  it('does not let ss for ß hide a lowercase Sie', () => {
    const r = validateAnswer('Wie heissen sie?', sentence(['Wie heißen Sie?']), opts);
    expect(r.verdict).not.toBe('accepted-with-note');
  });
});

/*
 * A beginner who leaves the dots off ("Tschuss") was told only that the word
 * "is spelled slightly differently". The letter they missed is the lesson.
 */
describe('an umlaut left out', () => {
  it('is named as the umlaut, not as a vague spelling slip', () => {
    const r = validateAnswer('Tschuss', word(['Tschüss']), opts);
    expect(r.verdict).toBe('almost');
    expect(r.categories).toContain('umlaut');
    expect(r.requireRetype).toBe(true);
  });

  it('leaves a real word alone: Tochter is not a misspelt Töchter', () => {
    const r = validateAnswer('die Tochter', word(['die Töchter']), opts);
    expect(r.categories).not.toContain('umlaut');
  });

  it('is found inside a sentence too', () => {
    const r = validateAnswer('Ich bin mude.', sentence(['Ich bin müde.']), opts);
    expect(r.categories).toContain('umlaut');
  });
});

describe('grammar mistakes never get credit', () => {
  it('diagnoses a wrong indefinite article as article + gender', () => {
    const r = validateAnswer('Ich habe ein Tochter.', sentence(['Ich habe eine Tochter.']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.credit).toBe(0);
    expect(r.categories).toContain('article');
    expect(r.categories).toContain('gender');
    expect(r.requireRetype).toBe(true);
  });

  it('diagnoses a wrong definite article', () => {
    const r = validateAnswer('die Tisch', word(['der Tisch']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toContain('article');
    expect(r.categories).toContain('gender');
  });

  it('diagnoses a wrong preposition', () => {
    const r = validateAnswer('Ich komme von Bulgarien.', sentence(['Ich komme aus Bulgarien.']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toEqual(['preposition']);
  });

  it('diagnoses a wrong person ending on the verb', () => {
    const r = validateAnswer('Du wohne in Deutschland.', sentence(['Du wohnst in Deutschland.']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toContain('verb-conjugation');
  });

  it('diagnoses word order when every word is right', () => {
    const r = validateAnswer(
      'Ich arbeite heute zu Hause.',
      sentence(['Heute arbeite ich zu Hause.']),
      opts,
    );
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toEqual(['word-order']);
    expect(r.credit).toBe(0);
  });

  it('distinguishes formal Sie from sie', () => {
    const r = validateAnswer('Wie heißen sie?', sentence(['Wie heißen Sie?']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toContain('pronoun');
    expect(r.credit).toBe(0);
  });

  it('reports a plural where the singular was asked for', () => {
    const r = validateAnswer('die Töchter', word(['die Tochter']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toContain('plural');
  });

  it('reports a missing word', () => {
    const r = validateAnswer('Ich wohne Hamburg.', sentence(['Ich wohne in Hamburg.']), opts);
    expect(r.verdict).toBe('incorrect');
    expect(r.categories).toContain('missing-word');
  });

  it('never rescues a grammar mistake through typo tolerance', () => {
    // "eine" and "ein" are one edit apart, but articles are grammar.
    const r = validateAnswer('eine Tisch', word(['ein Tisch']), opts);
    expect(r.credit).toBe(0);
    expect(r.categories).toContain('article');
    expect(r.categories).not.toContain('spelling');
  });

  it('does not let a capitalisation trap swallow the correct answer', () => {
    // Regression: the trap differs from the answer only by case, so a
    // case-insensitive trap match would have rejected the correct answer too.
    const spec = sentence(['Wie heißen Sie?'], {
      trapAnswers: [
        {
          answer: 'Wie heißen sie?',
          category: 'pronoun',
          feedback: { en: 'Formal Sie is capitalised.', bg: 'Учтивото Sie е с главна буква.' },
        },
      ],
    });
    expect(validateAnswer('Wie heißen Sie?', spec, opts).verdict).toBe('correct');

    const wrong = validateAnswer('Wie heißen sie?', spec, opts);
    expect(wrong.verdict).toBe('incorrect');
    expect(wrong.trapFeedback?.en).toContain('Formal');
  });

  it('uses the authored explanation for a known wrong turn', () => {
    const spec = sentence(['Ich komme aus Bulgarien.'], {
      trapAnswers: [
        {
          answer: 'Ich komme von Bulgarien.',
          category: 'preposition',
          feedback: { en: 'Use aus for countries.', bg: 'За държави се използва aus.' },
        },
      ],
    });
    const r = validateAnswer('Ich komme von Bulgarien.', spec, opts);
    expect(r.trapFeedback?.bg).toContain('aus');
    expect(r.categories).toEqual(['preposition']);
  });
});

describe('text helpers', () => {
  it('detects digraph-for-special-letter precisely', () => {
    expect(compareUmlauts('heisse', 'heiße')).toBe('digraph-for-umlaut');
    expect(compareUmlauts('heiße', 'heiße')).toBe('identical');
    // Must not treat a genuine s/ß distinction as equivalent in this direction.
    expect(compareUmlauts('Maße', 'Masse')).toBe('other');
  });

  it('splits a scaffold into its parts', () => {
    expect(splitScaffold('Ich ___ in Hamburg.')).toEqual({
      before: 'Ich ',
      after: ' in Hamburg.',
      seed: '',
    });
    expect(splitScaffold('Ich w___ in Hamburg.').seed).toBe('w');
  });
});

/*
 * "Introduce yourself" required the word "heiße", so "Mein Name ist Teo." —
 * which the same lesson teaches — could not be handed in, and nor could
 * "Ich heisse Teo", although lesson 1 says ss is accepted.
 */
describe('open writing that asks for particular words', () => {
  const intro = { accepted: [''], shape: 'sentence' as const, requiredTokens: ['heiße|Name|bin'] };

  it('takes any one of the ways the lesson taught', () => {
    for (const answer of ['Ich heiße Teo.', 'Mein Name ist Teo.', 'Hallo, ich bin Teo.']) {
      expect(checkFreeWriting(answer, intro).satisfied, answer).toBe(true);
    }
  });

  it('accepts ss for ß in a required word, or a plain s', () => {
    expect(checkFreeWriting('Ich heisse Teo.', intro).satisfied).toBe(true);
    expect(checkFreeWriting('guten tag! ich heise teo', intro).satisfied).toBe(true);
  });

  it('still notices when none of them is there', () => {
    expect(checkFreeWriting('Hallo und tschüss Teo.', intro).missingRequired).toEqual(['heiße|Name|bin']);
  });
});

/*
 * Two traps differ from the answer only by punctuation: the comma before
 * "weil" and the apostrophe in "Peter's". The trap check stripped all
 * punctuation before comparing, which removed the very comma or apostrophe
 * the trap is about, so the correct sentence typed without its full stop was
 * caught by the trap: no credit, "German always puts a comma before weil",
 * and the retype refused the same correct sentence.
 */
describe('a trap that differs from the answer only by punctuation', () => {
  const weil = sentence(['Ich rufe an, weil die Heizung kaputt ist.'], {
    trapAnswers: [
      {
        answer: 'Ich rufe an weil die Heizung kaputt ist.',
        category: 'punctuation',
        feedback: { en: 'German always puts a comma before weil.', bg: 'Запетая преди weil.' },
      },
    ],
  });
  const peter = sentence(['Peters Lebenslauf ist sehr gut.'], {
    trapAnswers: [
      {
        answer: "Peter's Lebenslauf ist sehr gut.",
        category: 'punctuation',
        feedback: { en: 'No apostrophe in the genitive.', bg: 'Без апостроф.' },
      },
    ],
  });

  it('does not catch the correct answer typed without its full stop', () => {
    for (const [answer, spec] of [
      ['Ich rufe an, weil die Heizung kaputt ist', weil],
      ['Ich rufe an, weil die Heizung kaputt ist!', weil],
      ['Peters Lebenslauf ist sehr gut', peter],
      ['Peters Lebenslauf ist sehr gut!', peter],
    ] as const) {
      const r = validateAnswer(answer, spec, opts);
      expect(r.trapFeedback, answer).toBeUndefined();
      expect(r.credit, answer).toBeGreaterThanOrEqual(0.9);
      expect(r.requireRetype, answer).toBe(false);
    }
  });

  it('still catches the trap itself, with or without the full stop', () => {
    for (const [answer, spec] of [
      ['Ich rufe an weil die Heizung kaputt ist.', weil],
      ['Ich rufe an weil die Heizung kaputt ist', weil],
      ["Peter's Lebenslauf ist sehr gut.", peter],
      ["Peter's Lebenslauf ist sehr gut", peter],
      // The iPhone types a curly apostrophe.
      ['Peter’s Lebenslauf ist sehr gut.', peter],
    ] as const) {
      const r = validateAnswer(answer, spec, opts);
      expect(r.trapFeedback, answer).toBeDefined();
      expect(r.credit, answer).toBe(0);
    }
  });

  it('keeps the case-only trap working', () => {
    const spec = sentence(['Wie heißen Sie?'], {
      trapAnswers: [
        { answer: 'Wie heißen sie?', category: 'pronoun', feedback: { en: 'Formal Sie.', bg: 'Sie.' } },
      ],
    });
    expect(validateAnswer('Wie heißen sie', spec, opts).trapFeedback).toBeDefined();
    expect(validateAnswer('Wie heißen Sie', spec, opts).trapFeedback).toBeUndefined();
  });
});

