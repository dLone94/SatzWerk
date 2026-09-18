import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 Unit 3 grammar: the language of a transaction.
 *
 * Everything here is chosen because it is needed to get through a shop or a
 * café without switching to English, which is the test of A1 that matters.
 *
 * The path split is unusually clean in this unit. Quantity phrases are the one
 * place where Bulgarian matches German exactly and English does not — "килограм
 * ябълки" and "ein Kilo Äpfel" both refuse a preposition, while English insists
 * on "of". So the Bulgarian path is told to trust its instinct and the English
 * path is warned off one. The formal imperative goes the other way: Bulgarian
 * has a real imperative form and English uses a bare verb, and German needs the
 * pronoun kept in place, which is what an English speaker forgets.
 */

/* ------------------------------------------------------------------ *
 * möchten
 * ------------------------------------------------------------------ */

const moechtenBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'möchten is how you ask for something without sounding like you are giving an order. It behaves exactly like the modal verbs from Unit 2.',
      'möchten е начинът да поискаш нещо, без да звучиш като да даваш заповед. Държи се точно като модалните глаголи от раздел 2.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Person', 'Лице'), bi('Form', 'Форма')],
    rows: [
      ['ich', 'möchte'],
      ['du', 'möchtest'],
      ['er / sie / es', 'möchte'],
      ['wir', 'möchten'],
      ['ihr', 'möchtet'],
      ['sie / Sie', 'möchten'],
    ],
    caption: bi(
      'ich and er share a form again, as with every modal.',
      'ich и er пак имат една и съща форма, както при всички модални глаголи.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'It does two jobs. With a noun it means "I would like that thing", and the thing is an object — so a masculine noun takes einen. With a verb, the verb goes to the end, exactly as after müssen.',
      'Върши две работи. Със съществително значи „бих искал това нещо“, а нещото е допълнение — затова съществителното от мъжки род взима einen. С глагол, глаголът отива в края, точно както след müssen.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich möchte einen Kaffee. — I would like a coffee.', 'Ich möchte einen Kaffee. — Бих искал едно кафе.'),
      bi('Ich möchte eine Suppe. — I would like a soup.', 'Ich möchte eine Suppe. — Бих искал една супа.'),
      bi('Ich möchte bezahlen. — I would like to pay.', 'Ich möchte bezahlen. — Бих искал да платя.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('wollen is not rude, but it is blunt', 'wollen не е грубо, но е рязко'),
    text: bi(
      '"Ich will einen Kaffee" is correct German and lands like "I want a coffee" — fine between friends, wrong at a counter. In a shop, a café or anywhere with a stranger, use möchte.',
      '„Ich will einen Kaffee“ е правилен немски и звучи като „Искам кафе“ — става между приятели, но не и на щанда. В магазин, кафене или с непознат използвай möchte.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Съответствието е точно: „бих искал“ е учтивата форма на „искам“, както möchte е учтивата форма на will. Разликата е, че немското möchte не е сложна форма — то е една дума и се спряга нормално.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'The same politeness step as English: "I want" versus "I would like". German makes it with one word instead of three, and möchte is a real conjugated verb rather than a construction.',
      '',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Quantities
 * ------------------------------------------------------------------ */

const quantityBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'To ask for an amount, put the measure first and the thing straight after it. Nothing goes between them.',
      'За да поискаш количество, слагаш мярката първо, а нещото веднага след нея. Между тях не стои нищо.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('ein Kilo Äpfel — a kilo of apples', 'ein Kilo Äpfel — килограм ябълки'),
      bi('eine Flasche Wasser — a bottle of water', 'eine Flasche Wasser — бутилка вода'),
      bi('ein Glas Milch — a glass of milk', 'ein Glas Milch — чаша мляко'),
      bi('ein Stück Kuchen — a piece of cake', 'ein Stück Kuchen — парче сладкиш'),
      bi('eine Tasse Kaffee — a cup of coffee', 'eine Tasse Kaffee — чаша кафе'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('No "of", and no article either', ''),
    text: bi(
      'English needs two words German does not: "a glass **of** water" and often "a glass of **the** water". German has neither — ein Glas Wasser, and that is the whole phrase. "Ein Glas von Wasser" is the mistake English speakers make, and it is not German.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Тук българският е прав'),
    text: bi(
      '',
      'Българският прави точно същото: „килограм ябълки“, „бутилка вода“, „парче сладкиш“ — без предлог, без член. Немският е идентичен. Това е рядък случай, в който можеш да превеждаш дума по дума и да излезе правилно.\n\nЕдинствената добавка: измерването се членува, а стоката не. „ein Kilo Äpfel“ — ein пред Kilo, нищо пред Äpfel.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'Kilo stays singular after a number: zwei Kilo Tomaten, not zwei Kilos. The same is true of measures generally.',
      'Kilo остава в единствено число след число: zwei Kilo Tomaten, а не zwei Kilos. Същото важи за мерките изобщо.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The formal imperative
 * ------------------------------------------------------------------ */

const imperativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'To ask someone you address as Sie to do something, use the plain verb followed by Sie. That is the whole rule.',
      'За да помолиш някого, към когото се обръщаш на Sie, да направи нещо, използваш чистия глагол, следван от Sie. Това е цялото правило.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Verb', 'Глагол'), bi('Asking someone', 'Молба към някого')],
    rows: [
      ['nehmen', 'Nehmen Sie ...'],
      ['kommen', 'Kommen Sie ...'],
      ['warten', 'Warten Sie ...'],
      ['entschuldigen', 'Entschuldigen Sie ...'],
    ],
  },
  {
    t: 'list',
    items: [
      bi('Nehmen Sie die Suppe! — Have the soup!', 'Nehmen Sie die Suppe! — Вземете супата!'),
      bi('Kommen Sie bitte um acht. — Please come at eight.', 'Kommen Sie bitte um acht. — Моля, елате в осем.'),
      bi('Entschuldigen Sie, wo ist die Küche? — Excuse me, where is the kitchen?', 'Entschuldigen Sie, wo ist die Küche? — Извинете, къде е кухнята?'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('bitte does the softening', 'bitte смекчава'),
    text: bi(
      'A bare imperative sounds brisk in German too. Adding bitte turns an instruction into a request, and it usually goes straight after Sie.',
      'Чистата заповедна форма звучи рязко и на немски. Добавянето на bitte превръща инструкцията в молба и обикновено идва веднага след Sie.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    text: bi(
      'The pronoun stays. English drops it — "Take the soup" — but German keeps Sie in the sentence: "Nehmen Sie die Suppe." Leaving it out changes the verb into a statement about several people.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има истинска заповедна форма, която се различава от сегашно време: „вземам“ → „вземете“. Немският не си прави труда — взима глагола както си е в речника и слага Sie след него. По-малко за учене, но и по-малко познато на ухото.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_5: GrammarConcept[] = [
  {
    id: 'g-moechten',
    title: bi('möchten — the polite ask', 'möchten — учтивата молба'),
    level: 'a1',
    summary: bi(
      'A modal verb that takes either a thing or another verb, and keeps you polite.',
      'Модален глагол, който взима или нещо, или друг глагол, и те държи учтив.',
    ),
    tags: ['verbs', 'politeness'],
    blocks: moechtenBlocks,
  },
  {
    id: 'g-quantities',
    title: bi('Quantities: ein Kilo Äpfel', 'Количества: ein Kilo Äpfel'),
    level: 'a1',
    summary: bi(
      'Measure first, thing straight after, nothing in between.',
      'Първо мярката, веднага след нея нещото, нищо помежду им.',
    ),
    tags: ['nouns', 'shopping'],
    blocks: quantityBlocks,
  },
  {
    id: 'g-imperative-sie',
    title: bi('Asking politely: Nehmen Sie', 'Учтива молба: Nehmen Sie'),
    level: 'a1',
    summary: bi('The plain verb, then Sie.', 'Чистият глагол, после Sie.'),
    tags: ['verbs', 'politeness'],
    blocks: imperativeBlocks,
  },
];
