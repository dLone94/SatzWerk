import type { VocabEntry } from '../types.ts';

/**
 * Travel and problems (A2 Unit 5).
 *
 * The last A2 unit, and the vocabulary is picked so that comparison has
 * something worth comparing. A journey is the one everyday situation where a
 * learner naturally weighs two options against each other — this train is
 * faster, that flight is cheaper, the hotel was the best one — so the adjectives
 * come first and the grammar follows them rather than the other way round.
 *
 * The problems half is what makes the unit useful rather than decorative:
 * missing a connection and asking about a delay are the two things that go
 * wrong on a German journey, and they are worth being able to say under
 * pressure.
 */

const U = 'a2-u5';
const L1 = 'a2-u5-l1';
const L2 = 'a2-u5-l2';
const L3 = 'a2-u5-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — comparing two things
 * ------------------------------------------------------------------ */

const COMPARE: VocabEntry[] = [
  {
    id: 'v-schnell',
    german: 'schnell',
    display: 'schnell',
    wordType: 'adjective',
    translation: { en: 'fast, quick', bg: 'бърз, бързо' },
    pronunciation: { en: 'shnel', bg: 'шнел' },
    example: {
      de: 'Der Zug ist schnell.',
      gloss: { en: 'The train is fast.', bg: 'Влакът е бърз.' },
    },
    tags: ['travel', 'opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    related: ['v-langsam'],
  },
  {
    id: 'v-langsam',
    german: 'langsam',
    display: 'langsam',
    wordType: 'adjective',
    translation: { en: 'slow, slowly', bg: 'бавен, бавно' },
    pronunciation: { en: 'LANG-zahm', bg: 'ЛАНГ-зам' },
    example: {
      de: 'Der Bus ist langsamer als der Zug.',
      gloss: { en: 'The bus is slower than the train.', bg: 'Автобусът е по-бавен от влака.' },
    },
    tags: ['travel', 'opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-schnell'],
    notes: {
      en: 'Also the word you need most as a learner: "Langsamer, bitte" — slower, please.',
      bg: 'Освен това е думата, която ти трябва най-много като учещ: „Langsamer, bitte“ — по-бавно, моля.',
    },
  },
  {
    id: 'v-der-flug',
    german: 'Flug',
    display: 'der Flug',
    article: 'der',
    gender: 'm',
    plural: 'die Flüge',
    wordType: 'noun',
    translation: { en: 'flight', bg: 'полет' },
    pronunciation: { en: 'floog', bg: 'флуг' },
    example: {
      de: 'Der Flug war billiger als der Zug.',
      gloss: { en: 'The flight was cheaper than the train.', bg: 'Полетът беше по-евтин от влака.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-fliegen'],
  },
  {
    id: 'v-interessant',
    german: 'interessant',
    display: 'interessant',
    wordType: 'adjective',
    translation: { en: 'interesting', bg: 'интересен' },
    pronunciation: { en: 'in-te-re-SANT', bg: 'ин-те-ре-САНТ' },
    example: {
      de: 'Die Stadt ist interessanter als das Dorf.',
      gloss: { en: 'The city is more interesting than the village.', bg: 'Градът е по-интересен от селото.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'A long adjective, and German still adds -er: interessanter. There is no German equivalent of "more interesting", and *mehr interessant* is the mistake an English speaker makes here.',
      bg: 'Дълго прилагателно, а немският пак добавя -er: interessanter. Няма немско съответствие на „по-интересен“ с отделна дума.',
    },
  },
  {
    id: 'v-schoen',
    german: 'schön',
    display: 'schön',
    wordType: 'adjective',
    translation: { en: 'beautiful, nice', bg: 'красив, хубав' },
    pronunciation: { en: 'shurn', bg: 'шьон' },
    example: {
      de: 'Der Park ist schön.',
      gloss: { en: 'The park is beautiful.', bg: 'Паркът е красив.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'One of the adjectives that takes an umlaut in the comparative: schön → schöner is easy, but groß → größer and alt → älter are the pattern to watch.',
      bg: 'Едно от прилагателните с умлаут: schön → schöner е лесно, но groß → größer и alt → älter са моделът, който да следиш.',
    },
  },
  {
    id: 'v-gut-adj',
    german: 'gut',
    display: 'gut',
    wordType: 'adjective',
    translation: { en: 'good', bg: 'добър' },
    pronunciation: { en: 'goot', bg: 'гут' },
    example: {
      de: 'Das Hotel war gut.',
      gloss: { en: 'The hotel was good.', bg: 'Хотелът беше добър.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    related: ['v-besser'],
    notes: {
      en: 'The one completely irregular comparison, and the one you will use most: gut → besser → am besten.',
      bg: 'Единственото напълно неправилно сравнение и това, което ще използваш най-много: gut → besser → am besten.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the best of all
 * ------------------------------------------------------------------ */

const BEST: VocabEntry[] = [
  {
    id: 'v-die-fahrkarte',
    german: 'Fahrkarte',
    display: 'die Fahrkarte',
    article: 'die',
    gender: 'f',
    plural: 'die Fahrkarten',
    wordType: 'noun',
    translation: { en: 'ticket (for travel)', bg: 'билет' },
    pronunciation: { en: 'FAR-kar-te', bg: 'ФАР-кар-те' },
    example: {
      de: 'Ich kaufe eine Fahrkarte.',
      gloss: { en: 'I am buying a ticket.', bg: 'Купувам билет.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'fahren + Karte, transparently. Ticket also exists and is used for flights and concerts, but a train ticket is a Fahrkarte.',
      bg: 'fahren + Karte, съвсем прозрачно. Ticket също съществува и се използва за полети и концерти, но билетът за влак е Fahrkarte.',
    },
  },
  {
    id: 'v-der-koffer',
    german: 'Koffer',
    display: 'der Koffer',
    article: 'der',
    gender: 'm',
    plural: 'die Koffer',
    wordType: 'noun',
    translation: { en: 'suitcase', bg: 'куфар' },
    pronunciation: { en: 'KOF-er', bg: 'КОФ-ер' },
    example: {
      de: 'Mein Koffer ist zu schwer.',
      gloss: { en: 'My suitcase is too heavy.', bg: 'Куфарът ми е твърде тежък.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'The plural is identical to the singular: der Koffer, die Koffer. Only the article tells you which you are hearing.',
      bg: 'Множественото съвпада с единственото: der Koffer, die Koffer. Само членът показва кое чуваш.',
    },
  },
  {
    id: 'v-puenktlich',
    german: 'pünktlich',
    display: 'pünktlich',
    wordType: 'adjective',
    translation: { en: 'on time, punctual', bg: 'точен, навреме' },
    pronunciation: { en: 'PUENKT-likh', bg: 'ПЮНКТ-лих' },
    example: {
      de: 'Der Zug war pünktlich.',
      gloss: { en: 'The train was on time.', bg: 'Влакът беше навреме.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'A word Germans use about themselves and, with some irony, about their trains.',
      bg: 'Дума, която немците използват за себе си и — с известна ирония — за влаковете си.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — when the journey goes wrong
 * ------------------------------------------------------------------ */

const PROBLEMS: VocabEntry[] = [
  {
    id: 'v-die-verspaetung',
    german: 'Verspätung',
    display: 'die Verspätung',
    article: 'die',
    gender: 'f',
    plural: 'die Verspätungen',
    wordType: 'noun',
    translation: { en: 'delay', bg: 'закъснение' },
    pronunciation: { en: 'fer-SHPAY-toong', bg: 'фер-ШПЕ-тунг' },
    example: {
      de: 'Der Zug hat Verspätung.',
      gloss: { en: 'The train is delayed.', bg: 'Влакът има закъснение.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'German says the train *has* a delay — "Der Zug hat Verspätung" — with no article. It is the sentence you will hear most often on a German platform.',
      bg: 'Немският казва, че влакът „има“ закъснение — „Der Zug hat Verspätung“ — без член. Това е изречението, което ще чуеш най-често на немски перон.',
    },
  },
  {
    id: 'v-umsteigen',
    german: 'umsteigen',
    display: 'umsteigen',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'umgestiegen' },
    translation: { en: 'to change (trains)', bg: 'прекачвам се' },
    pronunciation: { en: 'OOM-shty-gen', bg: 'УМ-щай-ген' },
    example: {
      de: 'Ich muss in München umsteigen.',
      gloss: { en: 'I have to change in Munich.', bg: 'Трябва да се прекача в Мюнхен.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    related: ['v-umziehen'],
    notes: {
      en: 'Separable and takes sein, like umziehen: Ich bin umgestiegen. The um- prefix means "changing over" in both.',
      bg: 'Делим и взима sein, като umziehen: Ich bin umgestiegen. Представката um- и в двата значи „смяна“.',
    },
  },
  {
    id: 'v-verpassen',
    german: 'verpassen',
    display: 'verpassen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'verpasst' },
    translation: { en: 'to miss (a train, a connection)', bg: 'изпускам' },
    pronunciation: { en: 'fer-PAS-en', bg: 'фер-ПАС-ен' },
    example: {
      de: 'Ich habe den Zug verpasst.',
      gloss: { en: 'I missed the train.', bg: 'Изпуснах влака.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'ver- at the front, so no ge- in the participle: verpasst. German keeps missing a train (verpassen) apart from missing a person (vermissen).',
      bg: 'ver- отпред, затова няма ge- в причастието: verpasst. Немският различава да изпуснеш влак (verpassen) от това да ти липсва човек (vermissen).',
    },
  },
  {
    id: 'v-das-gepaeck',
    german: 'Gepäck',
    display: 'das Gepäck',
    article: 'das',
    gender: 'n',
    wordType: 'noun',
    translation: { en: 'luggage', bg: 'багаж' },
    pronunciation: { en: 'ge-PEK', bg: 'ге-ПЕК' },
    example: {
      de: 'Mein Gepäck ist weg.',
      gloss: { en: 'My luggage is gone.', bg: 'Багажът ми го няма.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Singular only, like English luggage: "das Gepäck ist", never "sind", however many suitcases there are.',
      bg: 'Само единствено число, като българското „багаж“: „das Gepäck ist“, никога „sind“, колкото и куфара да са.',
    },
  },
];

export const TRAVEL_VOCAB: VocabEntry[] = [...COMPARE, ...BEST, ...PROBLEMS];
