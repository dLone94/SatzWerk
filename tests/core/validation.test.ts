import { describe, expect, it } from 'vitest';
import type { AnswerSpec } from '../../src/content/types.ts';
import { createBaseLexicon, extendLexicon } from '../../src/core/validation/lexicon.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
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
