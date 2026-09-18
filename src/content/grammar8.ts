import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 Unit 6 grammar: the impersonal es, and bei.
 *
 * `es` is the sharpest structural contrast with Bulgarian in the whole level.
 * „Вали.“ is a complete Bulgarian sentence with no subject at all, and a
 * Bulgarian speaker's first instinct is to write "Regnet." German does not
 * allow a sentence without a subject, so when there is nothing to be the
 * subject, it invents one. That is not a quirk of weather verbs — it is the
 * rule that verb-second implies, met here for the first time.
 *
 * English speakers already say "it is raining" and get this free, so their note
 * is short and points at the one place English *does* drop it ("raining today?").
 *
 * bei is here to give Unit 5's dative a third preposition and one more
 * repetition in a different setting, rather than to teach anything new.
 */

/* ------------------------------------------------------------------ *
 * The impersonal es
 * ------------------------------------------------------------------ */

const esBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A German sentence must have a subject. When there is nothing that could be one — as with weather — German supplies es.',
      'Немското изречение задължително има подлог. Когато няма какво да бъде подлог — както при времето — немският слага es.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Es regnet. — It is raining.', 'Es regnet. — Вали.'),
      bi('Es schneit. — It is snowing.', 'Es schneit. — Вали сняг.'),
      bi('Es ist kalt. — It is cold.', 'Es ist kalt. — Студено е.'),
      bi('Es ist windig. — It is windy.', 'Es ist windig. — Ветровито е.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Българското изречение без подлог не се превежда буквално'),
    text: bi(
      '',
      'Това е най-острата структурна разлика в цялото ниво. „Вали.“ е цяло, правилно българско изречение — една дума, без подлог. „Студено е.“ също. Немският не може да го направи: изречение без подлог не съществува.\n\nЗатова немският измисля подлог. Es не значи нищо тук — не сочи към нищо — но трябва да е там. „Regnet.“ не е изречение. „Es regnet.“ е.\n\nИ забележи: щом es е подлог, глаголът пак е на второ място. „Heute regnet es.“ — es се премества след глагола, точно както ich би направило.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English does the same thing — "it is raining", where "it" refers to nothing at all — so this one is free. The only difference is that English sometimes drops it in speech ("Raining again?") and German never does.',
      '',
    ),
  },
  {
    t: 'breakdown',
    de: 'Heute regnet es.',
    parts: [
      { de: 'Heute', gloss: bi('today — first position', 'днес — първа позиция') },
      { de: 'regnet', gloss: bi('the verb, still second', 'глаголът, пак втори') },
      { de: 'es', gloss: bi('the subject, moved after the verb', 'подлогът, преместен след глагола') },
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'Asking about the weather: "Wie ist das Wetter?" — how is the weather. Here das Wetter is a real subject, so no es is needed.',
      'Питане за времето: „Wie ist das Wetter?“ — как е времето. Тук das Wetter е истински подлог, затова es не е нужно.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * bei
 * ------------------------------------------------------------------ */

const beiBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'bei means at someone’s place — at the doctor’s, at a friend’s. It is the third preposition that always takes the dative, and it contracts like zu.',
      'bei значи „при някого“ — при лекаря, при приятел. Това е третият предлог, който винаги взима дателен падеж, и се слива като zu.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Long form', 'Дълга форма'), bi('What you say', 'Това, което се казва'), bi('Meaning', 'Значение')],
    rows: [
      ['bei dem Arzt', 'beim Arzt', bi('at the doctor’s', 'при лекаря')],
      ['bei dem Chef', 'beim Chef', bi('at the boss’s', 'при шефа')],
      ['bei der Ärztin', 'bei der Ärztin', bi('at the doctor’s (female) — no contraction', 'при лекарката — без сливане')],
    ],
    caption: bi(
      'bei dem contracts to beim. bei der does not contract at all — there is no "beir".',
      'bei dem се слива в beim. bei der не се слива изобщо — няма „beir“.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Three prepositions, one form', 'Три предлога, една форма'),
    text: bi(
      'mit, zu and bei all take the same form, and now you have met all three. dem for masculine and neuter, der for feminine — the rule has not changed since Unit 5, only the preposition in front of it.',
      'mit, zu и bei взимат една и съща форма и вече си срещнал и трите. dem за мъжки и среден род, der за женски — правилото не се е променило от раздел 5, само предлогът пред него.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich bin beim Arzt. — I am at the doctor’s.', 'Ich bin beim Arzt. — При лекаря съм.'),
      bi('Ich habe einen Termin beim Arzt. — I have an appointment at the doctor’s.', 'Ich habe einen Termin beim Arzt. — Имам час при лекаря.'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българското „при“ е точното съответствие и се използва по същия начин: „при лекаря“, „при шефа“. Разликата пак е само в това, че немският иска и правилната форма на члена — beim, не bei der, когато е мъжки род.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_8: GrammarConcept[] = [
  {
    id: 'g-impersonal-es',
    title: bi('Es regnet — the subject German invents', 'Es regnet — подлогът, който немският измисля'),
    level: 'a1',
    summary: bi(
      'A German sentence cannot go without a subject, so when there is none, es fills the place.',
      'Немското изречение не може без подлог, затова когато няма такъв, es заема мястото.',
    ),
    tags: ['word-order', 'verbs'],
    blocks: esBlocks,
  },
  {
    id: 'g-bei',
    title: bi('bei and beim', 'bei и beim'),
    level: 'a1',
    summary: bi(
      'The third dative preposition, and the last one A1 needs.',
      'Третият предлог с дателен падеж и последният, който A1 изисква.',
    ),
    tags: ['case', 'prepositions'],
    blocks: beiBlocks,
  },
];
