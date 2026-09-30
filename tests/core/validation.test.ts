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
  { german: 'Tschüss', wordType: 'phrase' },
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

  /*
   * A required word matched any word that started with it, so "wohne" counted
   * as the question word "wo", "umziehen" as "um … zu", "essen" as "es" and
   * "also" as "als": the task was marked done without the grammar it asked for.
   */
  it('does not count a longer word that only starts with a short required word', () => {
    const require = (token: string) => ({ accepted: [''], shape: 'sentence' as const, requiredTokens: [token] });
    const questions = require('wer|was|wo|woher|wohin|wann|wie|warum');
    expect(checkFreeWriting('Ich wohne in Wien.', questions).satisfied).toBe(false);
    expect(checkFreeWriting('Wo wohnst du?', questions).satisfied).toBe(true);
    expect(checkFreeWriting('Ich möchte umziehen, bald.', require('um')).satisfied).toBe(false);
    expect(checkFreeWriting('Heute essen wir Pizza.', require('es')).satisfied).toBe(false);
    expect(checkFreeWriting('Ich war also müde.', require('als')).satisfied).toBe(false);
    expect(checkFreeWriting('Ich komme immer spät.', require('Im')).satisfied).toBe(false);
  });

  // The list above named only some short words, so "war" was still found in
  // "warte" and "warum", and "bin" in "binde".
  it('takes a short required word only as itself or with an ending', () => {
    const require = (token: string) => ({ accepted: [''], shape: 'sentence' as const, requiredTokens: [token] });
    expect(checkFreeWriting('Ich warte auf den Bus und warum nicht.', require('war')).satisfied).toBe(false);
    expect(checkFreeWriting('Ich binde meine Schuhe zu.', require('bin')).satisfied).toBe(false);
    expect(checkFreeWriting('Du warst gestern im Kino.', require('war')).satisfied).toBe(true);
    expect(checkFreeWriting('Ich bin Teo.', require('bin')).satisfied).toBe(true);
    // A separable prefix is still found on its verb: "Ich muss früh aufstehen."
    expect(checkFreeWriting('Ich muss früh aufstehen.', require('auf')).satisfied).toBe(true);
  });

  it('still takes an inflected form of a longer required word', () => {
    const require = (token: string) => ({ accepted: [''], shape: 'sentence' as const, requiredTokens: [token] });
    expect(checkFreeWriting('Wir haben Pizza gegessen.', require('habe')).satisfied).toBe(true);
    expect(checkFreeWriting('Wir waren im Kino.', require('war')).satisfied).toBe(true);
    expect(checkFreeWriting('Ich plane meine Geburtstagsparty.', require('Geburtstag')).satisfied).toBe(true);
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

/*
 * The lowercase first letter of a sentence was forgiven only in answers of two
 * or more words. A one-word answer that opens a sentence — "tschüss", or "am"
 * in "___ Montag arbeite ich." — gets a field with the phone's capitals off,
 * so the iPhone typed it in lower case and the learner got "Almost right", half
 * the credit and a retype that refused the same word again. The mirror case
 * was just as unfair: "Der Tisch" for "der Tisch", or "Zwei" typed from a
 * recording, is how German writes a word that stands on its own, and it was
 * graded as a capital-letter mistake too.
 */
describe('the first letter of an answer that opens a sentence', () => {
  const note = (r: ReturnType<typeof validateAnswer>) => {
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('capitalization');
    expect(r.requireRetype).toBe(false);
    expect(r.credit).toBeGreaterThanOrEqual(0.9);
  };

  it('lets a lowercase one-word answer through with a note', () => {
    note(validateAnswer('tschüss', word(['Tschüss']), opts));
    note(validateAnswer('danke', word(['Danke']), opts));
  });

  it('lets a lowercase word in a gap at the start of the sentence through', () => {
    note(validateAnswer('am', word(['Am']), { ...opts, scaffold: '___ Montag arbeite ich.' }));
    note(validateAnswer('mein', word(['Mein']), { ...opts, scaffold: '___ Baby schläft.' }));
    note(validateAnswer('als', word(['Als']), { ...opts, scaffold: '___ ich zehn war, kam ich aufs Gymnasium.' }));
    note(validateAnswer('wer', word(['Wer']), { ...opts, scaffold: 'Hallo! ___ ist das?' }));
  });

  // A lone Ihr or Sie was held to its capital even in a gap that opens the
  // sentence, where a capital cannot tell "your" from "her": "ihr" typed on a
  // phone in "___ Bruder heißt Tom." was almost-right, with a retype.
  it('lets a lowercase ihr or sie in a gap at the start of the sentence through', () => {
    note(validateAnswer('ihr', word(['Ihr']), { ...opts, scaffold: '___ Bruder heißt Tom.' }));
    note(validateAnswer('ihre', word(['Ihre']), { ...opts, scaffold: '___ Schwester heißt Anna.' }));
    note(validateAnswer('sie', word(['Sie']), { ...opts, scaffold: '___ kommen aus Bulgarien?' }));
  });

  it('still wants the capital on a noun, singular or plural', () => {
    for (const [given, answer] of [
      ['tochter', 'Tochter'],
      ['töchter', 'Töchter'],
      ['hamburg', 'Hamburg'],
    ]) {
      const r = validateAnswer(given!, word([answer!]), opts);
      expect(r.verdict, given).toBe('almost');
      expect(r.requireRetype, given).toBe(true);
    }
    const gap = validateAnswer('tisch', word(['Tisch']), { ...opts, scaffold: '___ ist groß.' });
    expect(gap.verdict).toBe('almost');
  });

  it('still wants the capital in a gap inside the sentence', () => {
    const formal = validateAnswer('ihres', word(['Ihres']), { ...opts, scaffold: 'hinsichtlich ___ Schreibens' });
    expect(formal.verdict).toBe('almost');
    const unknown = validateAnswer('anspruch', word(['Anspruch']), { ...opts, scaffold: 'Sie haben ___ auf Urlaub.' });
    expect(unknown.verdict).toBe('almost');
  });

  it('still tells the one-word Sie from sie', () => {
    expect(validateAnswer('sie', word(['Sie']), opts).verdict).not.toBe('accepted-with-note');
    expect(validateAnswer('Sie', word(['sie']), opts).verdict).not.toBe('accepted-with-note');
  });

  it('lets a capital on a word or phrase that stands on its own through with a note', () => {
    note(validateAnswer('Der Tisch', word(['der Tisch']), opts));
    note(validateAnswer('Das Wasser', word(['das Wasser']), opts));
    note(validateAnswer('Zwei', word(['zwei']), opts));
    note(validateAnswer('Der', word(['der']), { ...opts, scaffold: '___ Tisch' }));
    note(
      validateAnswer(
        'Die Reform, die von der Regierung geplant wurde',
        sentence(['die Reform, die von der Regierung geplant wurde']),
        opts,
      ),
    );
  });

  it('still counts a capital inside the sentence, or on a noun lowered after it', () => {
    const inside = validateAnswer('Eine', word(['eine']), { ...opts, scaffold: 'Ich habe ___ Tochter.' });
    expect(inside.verdict).toBe('almost');
    expect(validateAnswer('Der tisch', word(['der Tisch']), opts).verdict).toBe('almost');
    expect(validateAnswer('der tisch', word(['der Tisch']), opts).verdict).toBe('almost');
  });
});

/*
 * "sie ist Ärztin." for "She is a doctor." was scored as a pronoun mistake and
 * told that "sie" means she — which is exactly what the learner wrote. At the
 * start of a sentence a capital cannot tell Sie from sie, so the lowercase
 * first letter there is only the phone's missing capital.
 */
/*
 * "gerne" is the same word as "gern" and just as standard ("Ich hätte gerne
 * einen Termin."), but no step listed it, so it was graded a spelling slip:
 * almost-right, a retype, and not clean in a final check.
 */
describe('gern and gerne', () => {
  it('accepts gerne where the lesson teaches gern, at full credit', () => {
    const r = validateAnswer('Ich trinke gerne Tee.', sentence(['Ich trinke gern Tee.']), opts);
    expect(r.verdict).toBe('accepted-variant');
    expect(r.credit).toBe(1);
    expect(r.target).toBe('Ich trinke gern Tee.');
    const gap = validateAnswer('gerne', word(['gern']), { ...opts, scaffold: 'Ich trinke ___ Tee.' });
    expect(gap.verdict).toBe('accepted-variant');
    const first = validateAnswer('Gerne!', word(['Gern!']), opts);
    expect(first.credit).toBe(1);
  });

  it('works the other way round, and on an alternative', () => {
    expect(validateAnswer('Ich hätte gern einen Termin.', sentence(['Ich hätte gerne einen Termin.']), opts).credit).toBe(1);
    const spec = sentence(['Ich trinke Tee.'], { alternatives: ['Ich trinke gern Tee.'] });
    expect(validateAnswer('Ich trinke gerne Tee.', spec, opts).credit).toBe(1);
  });

  it('still hears gern in a dictation, where the recording says it', () => {
    const r = validateAnswer('Ich trinke gerne Tee.', sentence(['Ich trinke gern Tee.']), {
      ...opts,
      exerciseKind: 'dictation',
    });
    expect(r.credit).toBeLessThan(1);
  });

  it('does not stretch to other words', () => {
    expect(validateAnswer('Ich trinke gernen Tee.', sentence(['Ich trinke gern Tee.']), opts).credit).toBeLessThan(1);
  });
});

/*
 * The lexicon knew fifteen verbs and only the bare possessives, and nothing
 * about adjective endings, so a wrong ending on any other word one letter off
 * was graded a spelling slip with credit: "Ich kennt deinen Vater.", "Ich
 * kenne deinem Vater.", "Ich nehme den schnelle Zug." — the grammar the
 * lessons teach, several of them in final checks.
 */
describe('a wrong ending is grammar, not a typo', () => {
  const taught = extendLexicon(lexicon, [
    { german: 'kennen', wordType: 'verb' },
    { german: 'besuchen', wordType: 'verb' },
    { german: 'anrufen', wordType: 'verb' },
    { german: 'schnell', wordType: 'adjective' },
    { german: 'müde', wordType: 'adjective' },
    { german: 'Vater', wordType: 'noun', gender: 'm', plural: 'die Väter' },
    { german: 'Zug', wordType: 'noun', gender: 'm', plural: 'die Züge' },
    { german: 'Wasser', wordType: 'noun', gender: 'n' },
  ]);
  const with_ = { lexicon: taught };

  it('files a verb ending as a conjugation mistake, with no credit', () => {
    for (const [given, answer] of [
      ['Ich kennt deinen Vater.', 'Ich kenne deinen Vater.'],
      ['Wir besuche den Vater.', 'Wir besuchen den Vater.'],
      ['Er ruft an.', 'Er rufe an.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), with_);
      expect(r.categories, given).toEqual(['verb-conjugation']);
      expect(r.credit, given).toBe(0);
    }
  });

  it('files an inflected possessive as an article mistake', () => {
    const r = validateAnswer('Ich kenne deinem Vater.', sentence(['Ich kenne deinen Vater.']), with_);
    expect(r.categories).toContain('article');
    expect(r.credit).toBe(0);
    const kein = validateAnswer('Ich habe keinem Vater.', sentence(['Ich habe keinen Vater.']), with_);
    expect(kein.categories).toContain('article');
  });

  it('files an adjective ending as an adjective-ending mistake', () => {
    for (const [given, answer] of [
      ['Ich nehme den schnelle Zug.', 'Ich nehme den schnellen Zug.'],
      ['Ich bin müder.', 'Ich bin müde.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), with_);
      expect(r.categories, given).toEqual(['adjective-ending']);
      expect(r.credit, given).toBe(0);
    }
  });

  it('still lets a real typo through as spelling', () => {
    for (const [given, answer] of [
      ['Ich nehme den schnelen Zug.', 'Ich nehme den schnellen Zug.'],
      ['Ich trinke Wasse.', 'Ich trinke Wasser.'],
      ['Ich kene deinen Vater.', 'Ich kenne deinen Vater.'],
      ['Mein Vatter ist hier.', 'Mein Vater ist hier.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), with_);
      expect(r.categories, given).toEqual(['spelling']);
      expect(r.credit, given).toBeGreaterThan(0);
    }
  });
});

/*
 * Fronting the place or the time keeps the verb second and is correct German
 * ("In Hamburg wohne ich."), but every reordering scored nothing as a
 * word-order mistake, with the explanation that the verb belongs in second
 * position — the rule the learner had just applied.
 */
describe('the verb in second place after a fronted phrase', () => {
  const taught = extendLexicon(lexicon, [
    { german: 'Oma', wordType: 'noun', gender: 'f' },
    { german: 'Sonntag', wordType: 'noun', gender: 'm' },
    { german: 'Bruder', wordType: 'noun', gender: 'm' },
    { german: 'groß', wordType: 'adjective' },
    { german: 'aufstehen', wordType: 'verb' },
  ]);
  const with_ = { lexicon: taught };

  it('accepts a place, a time or an object moved to the front', () => {
    for (const [given, answer] of [
      ['In Hamburg wohne ich.', 'Ich wohne in Hamburg.'],
      ['Heute muss ich arbeiten.', 'Ich muss heute arbeiten.'],
      ['Am Sonntag arbeite ich nicht.', 'Ich arbeite am Sonntag nicht.'],
      ['In Hamburg wohnt meine Oma.', 'Meine Oma wohnt in Hamburg.'],
      ['Um sieben Uhr stehe ich auf.', 'Ich stehe um sieben Uhr auf.'],
      ['Einen Bruder habe ich.', 'Ich habe einen Bruder.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), with_);
      expect(r.verdict, given).toBe('accepted-variant');
      expect(r.credit, given).toBe(1);
      expect(r.target, given).toBe(answer);
    }
  });

  it('still refuses an order that breaks the rule', () => {
    for (const [given, answer] of [
      ['In Hamburg ich wohne.', 'Ich wohne in Hamburg.'],
      ['Hamburg wohne ich in.', 'Ich wohne in Hamburg.'],
      ['Heute muss arbeiten ich.', 'Ich muss heute arbeiten.'],
      ['Arbeiten muss ich heute.', 'Ich muss heute arbeiten.'],
      ['Heute ich arbeite.', 'Ich arbeite heute.'],
      ['Auf stehe ich um sieben Uhr.', 'Ich stehe um sieben Uhr auf.'],
      ['Bruder habe ich einen großen.', 'Ich habe einen großen Bruder.'],
      ['Heute zu Hause arbeite ich.', 'Ich arbeite heute zu Hause.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), with_);
      expect(r.categories, given).toEqual(['word-order']);
      expect(r.credit, given).toBe(0);
    }
  });

  // Generating the regular forms of "sein" made "seit" a form of it, so the
  // fronted "Seit zwei Jahren" looked like it held a verb and was refused.
  it('accepts a phrase with seit moved to the front', () => {
    const withSein = extendLexicon(taught, [
      { german: 'sein', wordType: 'verb' },
      { german: 'Jahr', wordType: 'noun', gender: 'n', plural: 'die Jahre' },
      { german: 'Berlin', wordType: 'noun' },
    ]);
    const r = validateAnswer('Seit zwei Jahren wohne ich in Berlin.', sentence(['Ich wohne seit zwei Jahren in Berlin.']), {
      lexicon: withSein,
    });
    expect(r.verdict).toBe('accepted-variant');
    const mixed = validateAnswer('Ich wohne sein Montag hier.', sentence(['Ich wohne seit Montag hier.']), {
      lexicon: withSein,
    });
    expect(mixed.categories).not.toContain('verb-conjugation');
  });

  // A time word moved to the front was refused whenever a noun followed it,
  // because "Um acht | Uhr" must not be split: "Gestern habe ich Fußball
  // gespielt." was a word-order mistake.
  it('accepts a time word moved to the front before a noun object', () => {
    const more = extendLexicon(taught, [
      { german: 'Fußball', wordType: 'noun', gender: 'm' },
      { german: 'Mutter', wordType: 'noun', gender: 'f' },
      { german: 'Suppe', wordType: 'noun', gender: 'f' },
      { german: 'kochen', wordType: 'verb' },
    ]);
    for (const [given, answer] of [
      ['Gestern habe ich Fußball gespielt.', 'Ich habe gestern Fußball gespielt.'],
      ['Heute kocht meine Mutter Suppe.', 'Meine Mutter kocht heute Suppe.'],
    ]) {
      const r = validateAnswer(given!, sentence([answer!]), { lexicon: more });
      expect(r.verdict, given).toBe('accepted-variant');
    }
    const split = validateAnswer('Morgen wohne ich in Hamburg.', sentence(['Ich wohne morgen in Hamburg.']), {
      lexicon: more,
    });
    expect(split.verdict).toBe('accepted-variant');
  });

  it('keeps the order the lesson asks for when it fronts the time itself', () => {
    const r = validateAnswer('Ich arbeite heute zu Hause.', sentence(['Heute arbeite ich zu Hause.']), with_);
    expect(r.categories).toEqual(['word-order']);
  });

  it('keeps the exact order in a dictation and in the word-order drills', () => {
    for (const kind of ['dictation', 'wordOrder', 'sentenceBuild'] as const) {
      const r = validateAnswer('In Hamburg wohne ich.', sentence(['Ich wohne in Hamburg.']), {
        ...with_,
        exerciseKind: kind,
      });
      expect(r.categories, kind).toEqual(['word-order']);
    }
  });
});

describe('sie at the start of a sentence', () => {
  it('is a missing capital, not a pronoun mistake', () => {
    const r = validateAnswer('sie ist Ärztin.', sentence(['Sie ist Ärztin.']), opts);
    expect(r.verdict).toBe('accepted-with-note');
    expect(r.notes).toContain('capitalization');
  });

  it('is not filed as a pronoun mistake beside another slip', () => {
    const r = validateAnswer('sie ist Arztin.', sentence(['Sie ist Ärztin.']), opts);
    expect(r.categories).not.toContain('pronoun');
  });

  it('still counts inside the sentence', () => {
    const r = validateAnswer('Wie heißen sie?', sentence(['Wie heißen Sie?']), opts);
    expect(r.categories).toContain('pronoun');
  });
});

