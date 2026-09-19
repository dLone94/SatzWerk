import type { Gender } from '../../content/types.ts';
import { lower } from './text.ts';

/**
 * A small, honest German lexicon.
 *
 * It is not a full morphological analyser. It covers the function words and the
 * verbs actually taught in the authored course, which is exactly what the
 * validator needs in order to tell a *grammar* mistake apart from a typo.
 *
 * The rule the validator relies on: anything listed here is a grammatical
 * choice, so a difference on one of these words is never forgiven as a typo.
 */

export interface VerbForm {
  lemma: string;
  person: 'ich' | 'du' | 'er' | 'wir' | 'ihr' | 'sie' | 'infinitive' | 'participle';
  tense: 'present' | 'past' | 'participle' | 'infinitive';
}

export interface GermanLexicon {
  articles: Set<string>;
  /** Gender(s) each article form can mark, for gender-vs-article diagnosis. */
  articleGender: Map<string, Gender[]>;
  pronouns: Set<string>;
  prepositions: Set<string>;
  conjunctions: Set<string>;
  /** Lowercased verb form to its analysis. */
  verbForms: Map<string, VerbForm[]>;
  /** Every word the app knows about, lowercased. Used to reject false "typos". */
  knownWords: Set<string>;
  /** Lowercased noun to grammatical gender. */
  nounGender: Map<string, Gender>;
  /** Lowercased singular noun to its plural (bare, no article). */
  pluralOf: Map<string, string>;
  /** Lowercased plural noun to its singular. */
  singularOf: Map<string, string>;
}

const ARTICLE_GENDER: Array<[string, Gender[]]> = [
  ['der', ['m', 'f']], // nominative masculine, dative/genitive feminine
  ['die', ['f']],
  ['das', ['n']],
  ['den', ['m']],
  ['dem', ['m', 'n']],
  ['des', ['m', 'n']],
  ['ein', ['m', 'n']],
  ['eine', ['f']],
  ['einen', ['m']],
  ['einem', ['m', 'n']],
  ['einer', ['f']],
  ['eines', ['m', 'n']],
  ['kein', ['m', 'n']],
  ['keine', ['f']],
  ['keinen', ['m']],
  ['mein', ['m', 'n']],
  ['meine', ['f']],
  ['meinen', ['m']],
  ['dein', ['m', 'n']],
  ['deine', ['f']],
  ['sein', ['m', 'n']],
  ['seine', ['f']],
  ['ihr', ['m', 'n']],
  ['ihre', ['f']],
  ['unser', ['m', 'n']],
  ['unsere', ['f']],
];

const PRONOUNS = [
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man',
  'mich', 'dich', 'ihn', 'uns', 'euch',
  'mir', 'dir', 'ihm', 'ihnen',
  'wer', 'wen', 'wem', 'was',
  'dies', 'dieser', 'diese', 'dieses',
];

const PREPOSITIONS = [
  'in', 'an', 'auf', 'aus', 'bei', 'mit', 'nach', 'seit', 'von', 'zu', 'zur', 'zum',
  'durch', 'fuer', 'gegen', 'ohne', 'um', 'ueber', 'unter', 'vor', 'zwischen',
  'hinter', 'neben', 'ab', 'gegenueber', 'am', 'im', 'ins', 'beim',
  'für', 'über', 'gegenüber',
];

const CONJUNCTIONS = [
  'und', 'aber', 'oder', 'denn', 'sondern',
  'weil', 'dass', 'wenn', 'als', 'obwohl', 'damit', 'ob', 'bevor', 'nachdem',
];

/**
 * Present-tense paradigms for the verbs taught in the authored lessons, plus
 * the handful of past forms a beginner meets. Each entry maps a form to every
 * analysis it can have, because German forms are heavily syncretic
 * (for example "wohnen" is both the infinitive and the wir/sie form).
 */
const VERB_PARADIGMS: Record<string, Partial<Record<VerbForm['person'], string>>> = {
  sein: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind', infinitive: 'sein' },
  haben: { ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben', infinitive: 'haben' },
  heißen: {
    ich: 'heiße', du: 'heißt', er: 'heißt', wir: 'heißen', ihr: 'heißt',
    sie: 'heißen', infinitive: 'heißen',
  },
  kommen: { ich: 'komme', du: 'kommst', er: 'kommt', wir: 'kommen', ihr: 'kommt', sie: 'kommen', infinitive: 'kommen' },
  wohnen: { ich: 'wohne', du: 'wohnst', er: 'wohnt', wir: 'wohnen', ihr: 'wohnt', sie: 'wohnen', infinitive: 'wohnen' },
  leben: { ich: 'lebe', du: 'lebst', er: 'lebt', wir: 'leben', ihr: 'lebt', sie: 'leben', infinitive: 'leben' },
  arbeiten: {
    ich: 'arbeite', du: 'arbeitest', er: 'arbeitet', wir: 'arbeiten', ihr: 'arbeitet',
    sie: 'arbeiten', infinitive: 'arbeiten',
  },
  machen: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen', infinitive: 'machen' },
  lernen: { ich: 'lerne', du: 'lernst', er: 'lernt', wir: 'lernen', ihr: 'lernt', sie: 'lernen', infinitive: 'lernen' },
  sprechen: {
    ich: 'spreche', du: 'sprichst', er: 'spricht', wir: 'sprechen', ihr: 'sprecht',
    sie: 'sprechen', infinitive: 'sprechen',
  },
  gehen: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen', infinitive: 'gehen' },
  trinken: {
    ich: 'trinke', du: 'trinkst', er: 'trinkt', wir: 'trinken', ihr: 'trinkt',
    sie: 'trinken', infinitive: 'trinken',
  },
  buchstabieren: {
    ich: 'buchstabiere', du: 'buchstabierst', er: 'buchstabiert', wir: 'buchstabieren',
    ihr: 'buchstabiert', sie: 'buchstabieren', infinitive: 'buchstabieren',
  },
  verstehen: {
    ich: 'verstehe', du: 'verstehst', er: 'versteht', wir: 'verstehen', ihr: 'versteht',
    sie: 'verstehen', infinitive: 'verstehen',
  },
  kosten: {
    ich: 'koste', du: 'kostest', er: 'kostet', wir: 'kosten', ihr: 'kostet',
    sie: 'kosten', infinitive: 'kosten',
  },
};

const PAST_FORMS: Array<[string, string, VerbForm['person']]> = [
  ['war', 'sein', 'ich'],
  ['warst', 'sein', 'du'],
  ['waren', 'sein', 'wir'],
  ['hatte', 'haben', 'ich'],
  ['hattest', 'haben', 'du'],
  ['hatten', 'haben', 'wir'],
];

function buildVerbForms(): Map<string, VerbForm[]> {
  const map = new Map<string, VerbForm[]>();
  const add = (form: string, analysis: VerbForm) => {
    const key = lower(form);
    const list = map.get(key);
    if (list) list.push(analysis);
    else map.set(key, [analysis]);
  };

  for (const [lemma, paradigm] of Object.entries(VERB_PARADIGMS)) {
    for (const [person, form] of Object.entries(paradigm)) {
      if (!form) continue;
      add(form, {
        lemma,
        person: person as VerbForm['person'],
        tense: person === 'infinitive' ? 'infinitive' : 'present',
      });
    }
  }
  for (const [form, lemma, person] of PAST_FORMS) {
    add(form, { lemma, person, tense: 'past' });
  }
  return map;
}

/** The static part of the lexicon: function words plus taught verb paradigms. */
export function createBaseLexicon(): GermanLexicon {
  const articleGender = new Map<string, Gender[]>(ARTICLE_GENDER);
  const articles = new Set(articleGender.keys());
  const pronouns = new Set(PRONOUNS.map(lower));
  const prepositions = new Set(PREPOSITIONS.map(lower));
  const conjunctions = new Set(CONJUNCTIONS.map(lower));
  const verbForms = buildVerbForms();

  const knownWords = new Set<string>([
    ...articles,
    ...pronouns,
    ...prepositions,
    ...conjunctions,
    ...verbForms.keys(),
    'nicht', 'ja', 'nein', 'auch', 'sehr', 'hier', 'heute', 'morgen', 'gestern',
    'gern', 'schon', 'noch', 'jetzt', 'gut', 'bitte', 'danke', 'wie', 'wo', 'woher',
    'wohin', 'wann', 'warum', 'sie',
    // Frequent adjectives, numbers and fillers the Pre-A1 sentences use. Knowing
    // them stops the validator from calling a real word a typo.
    'gro\u00df', 'klein', 'neu', 'alt', 'sch\u00f6n', 'nett', 'eins', 'zwei', 'drei',
    'vier', 'f\u00fcnf', 'jahr', 'jahre', 'hause', 'arbeit', 'deutsch', 'bulgarisch',
    'guten', 'gute', 'nacht', 'tag', 'abend', 'hallo', 'entschuldigung', 'name',
    'viel', 'viele', 'wenig', 'ein', 'meine', 'mein', 'dein', 'deine', 'nach', 'vor',
    'es', 'das', 'dies', 'diese', 'dieser', 'und', 'oder', 'aber', 'kein', 'keine',
    'nicht', 'schon', 'erst', 'auch', 'halb', 'uhr', 'geburtstag', 'beruf', 'deutsch',
  ]);

  return {
    articles,
    articleGender,
    pronouns,
    prepositions,
    conjunctions,
    verbForms,
    knownWords,
    nounGender: new Map(),
    pluralOf: new Map(),
    singularOf: new Map(),
  };
}

export interface LexiconSeed {
  german: string;
  wordType: string;
  gender?: Gender;
  plural?: string;
  display?: string;
}

/**
 * Extend the base lexicon with the vocabulary of the authored course.
 *
 * The validator becomes sharper the more vocabulary it knows: it can then say
 * "that is the plural" or "that is a different word" instead of "typo".
 */
export function extendLexicon(base: GermanLexicon, entries: LexiconSeed[]): GermanLexicon {
  const nounGender = new Map(base.nounGender);
  const pluralOf = new Map(base.pluralOf);
  const singularOf = new Map(base.singularOf);
  const knownWords = new Set(base.knownWords);

  for (const entry of entries) {
    const head = lower(entry.german);
    for (const part of head.split(/\s+/)) knownWords.add(part);
    knownWords.add(head);

    if (entry.wordType === 'noun') {
      if (entry.gender) nounGender.set(head, entry.gender);
      if (entry.plural) {
        // Plurals are authored with their article ("die Toechter"); store bare.
        const bare = lower(entry.plural).replace(/^(der|die|das)\s+/, '');
        pluralOf.set(head, bare);
        singularOf.set(bare, head);
        knownWords.add(bare);
      }
    }
  }

  return { ...base, nounGender, pluralOf, singularOf, knownWords };
}

export function isFunctionWord(lexicon: GermanLexicon, token: string): boolean {
  const key = lower(token);
  return (
    lexicon.articles.has(key) ||
    lexicon.pronouns.has(key) ||
    lexicon.prepositions.has(key) ||
    lexicon.conjunctions.has(key) ||
    lexicon.verbForms.has(key)
  );
}

export function verbLemmas(lexicon: GermanLexicon, token: string): VerbForm[] {
  return lexicon.verbForms.get(lower(token)) ?? [];
}
