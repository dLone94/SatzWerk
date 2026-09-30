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
  /**
   * Every noun the course teaches, singular and plural, lowercased — with or
   * without a gender. A noun keeps its capital anywhere in a sentence, so the
   * capital-letter checks need to know one when they see it.
   */
  nouns: Set<string>;
  /**
   * Lowercased forms of the course's verbs and adjectives, each to the words
   * it can be a form of: "kennt" and "kenne" both lead to kennen, "schnelle"
   * and "schnellen" to schnell. Two forms of one word differ in their ending,
   * which is grammar, never a typo.
   */
  inflections: Map<string, string[]>;
  /** Lowercased Perfekt participles the course teaches ("gegangen"). */
  participles: Set<string>;
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
  // The case forms of kein and the possessives. Without them "deinem" for
  // "deinen" was one letter off a word the validator did not know, and was
  // forgiven as a spelling slip. -en marks the masculine accusative, -em the
  // masculine or neuter dative, -er the feminine dative, -es the genitive.
  ...(['kein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'] as const).flatMap((stem) => {
    const base = stem === 'euer' ? 'eur' : stem;
    const forms: Array<[string, Gender[]]> = [
      [`${base}en`, ['m']],
      [`${base}em`, ['m', 'n']],
      [`${base}er`, ['f']],
      [`${base}es`, ['m', 'n']],
    ];
    if (stem === 'euer') forms.push(['euer', ['m', 'n']], ['eure', ['f']]);
    return forms;
  }),
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
  // The modal verbs and werden: irregular, and the verb in second place of
  // many taught sentences ("Ich muss heute arbeiten").
  müssen: { ich: 'muss', du: 'musst', er: 'muss', wir: 'müssen', ihr: 'müsst', sie: 'müssen', infinitive: 'müssen' },
  können: { ich: 'kann', du: 'kannst', er: 'kann', wir: 'können', ihr: 'könnt', sie: 'können', infinitive: 'können' },
  wollen: { ich: 'will', du: 'willst', er: 'will', wir: 'wollen', ihr: 'wollt', sie: 'wollen', infinitive: 'wollen' },
  dürfen: { ich: 'darf', du: 'darfst', er: 'darf', wir: 'dürfen', ihr: 'dürft', sie: 'dürfen', infinitive: 'dürfen' },
  sollen: { ich: 'soll', du: 'sollst', er: 'soll', wir: 'sollen', ihr: 'sollt', sie: 'sollen', infinitive: 'sollen' },
  möchten: { ich: 'möchte', du: 'möchtest', er: 'möchte', wir: 'möchten', ihr: 'möchtet', sie: 'möchten' },
  werden: { ich: 'werde', du: 'wirst', er: 'wird', wir: 'werden', ihr: 'werdet', sie: 'werden', infinitive: 'werden' },
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
    nouns: new Set(),
    inflections: new Map(),
    participles: new Set(),
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
  /** A verb's Perfekt participle, once the course teaches it. */
  participle?: string;
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
  const nouns = new Set(base.nouns);
  const participles = new Set(base.participles);
  const inflections = new Map<string, string[]>();
  for (const [form, words] of base.inflections) inflections.set(form, [...words]);
  const inflect = (word: string, forms: string[]) => {
    for (const form of forms) {
      const list = inflections.get(form);
      if (!list) inflections.set(form, [word]);
      else if (!list.includes(word)) list.push(word);
    }
  };

  for (const entry of entries) {
    const head = lower(entry.german);
    for (const part of head.split(/\s+/)) knownWords.add(part);
    knownWords.add(head);

    // Without this, the moment A2 starts asking for "Ich bin gegangen" the
    // validator calls a perfectly good participle a typo, because nothing in
    // the course had ever named it as a word.
    if (entry.participle) {
      knownWords.add(lower(entry.participle));
      participles.add(lower(entry.participle));
    }

    // A generated form that is already a function word is not this word:
    // the regular forms of "sein" include "seit", which is a preposition.
    const own = (forms: string[]) =>
      forms.filter(
        (form) =>
          !base.articles.has(form) &&
          !base.pronouns.has(form) &&
          !base.prepositions.has(form) &&
          !base.conjunctions.has(form),
      );
    if (entry.wordType === 'verb') inflect(`verb:${head}`, own(presentForms(head)));
    if (entry.wordType === 'adjective') inflect(`adjective:${head}`, own(adjectiveForms(head)));

    if (entry.wordType === 'noun') {
      nouns.add(head);
      if (entry.gender) nounGender.set(head, entry.gender);
      if (entry.plural) {
        // Plurals are authored with their article ("die Toechter"); store bare.
        const bare = lower(entry.plural).replace(/^(der|die|das)\s+/, '');
        pluralOf.set(head, bare);
        singularOf.set(bare, head);
        knownWords.add(bare);
        nouns.add(bare);
      }
    }
  }

  return { ...base, nounGender, nouns, inflections, participles, pluralOf, singularOf, knownWords };
}

const SEPARABLE_PREFIXES = [
  'zurück', 'statt', 'fest', 'fern', 'nach', 'weg', 'los', 'auf', 'aus', 'ein', 'mit', 'vor', 'her', 'hin',
  'ab', 'an', 'zu',
];

/**
 * The regular present-tense forms of a verb, without claiming which person
 * each one is: a strong verb such as nehmen (nimmt) has forms this does not
 * produce, and a few it produces are not real, but every one it produces ends
 * the way a form of this verb could. A separable verb ("anrufen") also gives
 * the forms of its main part ("rufe … an").
 */
function presentForms(infinitive: string): string[] {
  const verb = infinitive.split(/\s+/).pop() ?? '';
  const stem = verb.endsWith('en') ? verb.slice(0, -2) : verb.endsWith('n') ? verb.slice(0, -1) : '';
  if (stem.length < 2) return [];
  const forms = [verb, `${stem}e`, `${stem}st`, `${stem}t`, `${stem}est`, `${stem}et`];
  const prefix = SEPARABLE_PREFIXES.find((p) => verb.startsWith(p) && verb.length - p.length >= 4);
  if (prefix) forms.push(...presentForms(verb.slice(prefix.length)));
  return forms;
}

/** An adjective with each of its endings: schnell, schnelle, schnellen … */
function adjectiveForms(adjective: string): string[] {
  if (/\s/.test(adjective) || adjective.length < 3) return [];
  const stems = [adjective.endsWith('e') ? adjective.slice(0, -1) : adjective];
  // dunkel → dunkle, teuer → teure.
  if (/e[lr]$/.test(adjective)) stems.push(adjective.replace(/e([lr])$/, '$1'));
  return [adjective, ...stems.flatMap((stem) => ['e', 'en', 'em', 'er', 'es'].map((ending) => stem + ending))];
}

/**
 * The part of speech two different forms share, when both are forms of the
 * same taught verb or adjective.
 */
export function sharedInflection(lexicon: GermanLexicon, a: string, b: string): 'verb' | 'adjective' | undefined {
  const first = lexicon.inflections.get(lower(a)) ?? [];
  const second = new Set(lexicon.inflections.get(lower(b)) ?? []);
  const shared = first.find((word) => second.has(word));
  return shared ? (shared.split(':')[0] as 'verb' | 'adjective') : undefined;
}

/** A form of a verb the course knows: a taught paradigm or a vocabulary verb. */
export function isVerbForm(lexicon: GermanLexicon, token: string): boolean {
  const key = lower(token);
  return (
    lexicon.verbForms.has(key) ||
    lexicon.participles.has(key) ||
    (lexicon.inflections.get(key) ?? []).some((word) => word.startsWith('verb:'))
  );
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

/**
 * Pairs of words that are the same word, equally standard, where the course
 * teaches one of them: "gerne" is "gern" with an optional -e. Kept to the
 * pairs that really mean the same — lang/lange or heut/heute do not.
 */
export const FREE_VARIANTS: ReadonlyArray<readonly [string, string]> = [['gern', 'gerne']];

/** A noun the course teaches, in the singular or the plural. */
export function isNoun(lexicon: GermanLexicon, token: string): boolean {
  const key = lower(token);
  return lexicon.nouns.has(key) || lexicon.nounGender.has(key) || lexicon.singularOf.has(key);
}

export function verbLemmas(lexicon: GermanLexicon, token: string): VerbForm[] {
  return lexicon.verbForms.get(lower(token)) ?? [];
}
