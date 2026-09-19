import type { VocabEntry } from '../types.ts';

/**
 * The grammatical vocabulary consolidated in Pre-A1 Unit 6: pronouns, the two
 * negation words, and the question words.
 *
 * These are words the learner has already met in passing. Unit 6 collects them
 * so they can be drilled and reviewed deliberately rather than absorbed by
 * accident.
 */

const U = 'pre-a1-u6';
const L1 = 'pre-a1-u6-l1';
const L2 = 'pre-a1-u6-l2';
const L3 = 'pre-a1-u6-l3';

const PRONOUNS: VocabEntry[] = [
  {
    id: 'v-wir',
    german: 'wir',
    display: 'wir',
    wordType: 'pronoun',
    translation: { en: 'we', bg: 'ние' },
    pronunciation: { en: 'veer', bg: 'вир' },
    example: {
      de: 'Wir wohnen in Hamburg.',
      gloss: { en: 'We live in Hamburg.', bg: 'Живеем в Хамбург.' },
    },
    tags: ['pronoun', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    notes: {
      en: 'Careful with the sound: "wir" is said VEER, and "vier" (four) is said FEER. They are near-opposites.',
      bg: 'Внимавай със звука: „wir“ е ВИР, а „vier“ (четири) е ФИР. Почти обратното на очакваното.',
    },
  },
  {
    id: 'v-ihr',
    german: 'ihr',
    display: 'ihr',
    wordType: 'pronoun',
    translation: { en: 'you (several people, informal)', bg: 'вие (към няколко човека, неофициално)' },
    pronunciation: { en: 'eer', bg: 'ир' },
    example: {
      de: 'Wo wohnt ihr?',
      gloss: { en: 'Where do you (all) live?', bg: 'Къде живеете?' },
    },
    tags: ['pronoun', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    notes: {
      en: 'English has no separate plural "you", which is why this form is easy to forget. Use it for a group of friends.',
      bg: 'Тук българският помага: „ihr“ е неофициалното „вие“ към няколко човека, а „Sie“ с главна буква е учтивото „Вие“ към един или повече.',
    },
  },
  {
    id: 'v-er',
    german: 'er',
    display: 'er',
    wordType: 'pronoun',
    translation: { en: 'he; it (for der-words)', bg: 'той' },
    pronunciation: { en: 'air', bg: 'ер' },
    example: {
      de: 'Der Tisch ist neu. Er ist groß.',
      gloss: { en: 'The table is new. It is big.', bg: 'Масата е нова. Тя е голяма.' },
    },
    tags: ['pronoun', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'German uses "er" for any der-word, not only for people. A table is "er", because it is der Tisch.',
      bg: 'Немският използва „er“ за всяка дума с der, не само за хора. Масата е „er“, защото е der Tisch — макар на български да е „тя“.',
    },
  },
  {
    id: 'v-es',
    german: 'es',
    display: 'es',
    wordType: 'pronoun',
    translation: { en: 'it (for das-words)', bg: 'то' },
    pronunciation: { en: 'es', bg: 'ес' },
    example: {
      de: 'Das Haus ist alt. Es ist groß.',
      gloss: { en: 'The house is old. It is big.', bg: 'Къщата е стара. Тя е голяма.' },
    },
    tags: ['pronoun', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
];

const NEGATION: VocabEntry[] = [
  {
    id: 'v-nicht',
    german: 'nicht',
    display: 'nicht',
    wordType: 'particle',
    translation: { en: 'not', bg: 'не (при глагол или прилагателно)' },
    pronunciation: { en: 'nikht', bg: 'нихт' },
    example: {
      de: 'Ich wohne nicht in Berlin.',
      gloss: { en: 'I do not live in Berlin.', bg: 'Не живея в Берлин.' },
    },
    tags: ['negation', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-kein'],
    notes: {
      en: 'German has no "do not" helper. The verb stays where it is and "nicht" goes after it: Ich wohne nicht hier.',
      bg: 'Голяма разлика: българското „не“ стои ПРЕД глагола („не живея“), а немското „nicht“ стои СЛЕД него: Ich wohne nicht.',
    },
  },
  {
    id: 'v-kein',
    german: 'kein',
    display: 'kein',
    wordType: 'article',
    translation: { en: 'no, not a (before a noun)', bg: 'никакъв, не (пред съществително)' },
    pronunciation: { en: 'kyn', bg: 'кайн' },
    example: {
      de: 'Ich habe keine Schwester.',
      gloss: { en: 'I do not have a sister.', bg: 'Нямам сестра.' },
    },
    tags: ['negation', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    related: ['v-nicht'],
    notes: {
      en: 'Use "kein" to negate a noun and "nicht" for everything else. "kein" takes the same endings as "ein": kein Bruder, keine Schwester.',
      bg: 'Използвай „kein“, за да отречеш съществително, и „nicht“ за всичко останало. „kein“ взима същите окончания като „ein“: kein Bruder, keine Schwester.',
    },
  },
];

const QUESTION_WORDS: VocabEntry[] = [
  {
    id: 'v-wer',
    german: 'wer',
    display: 'wer',
    wordType: 'pronoun',
    translation: { en: 'who', bg: 'кой' },
    pronunciation: { en: 'vair', bg: 'вер' },
    example: {
      de: 'Wer ist das?',
      gloss: { en: 'Who is that?', bg: 'Кой е това?' },
    },
    tags: ['question', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'A false friend for English speakers: "wer" means who, and "wo" means where. They are the other way round from what you expect.',
      bg: 'Лесно се обърква: „wer“ значи „кой“, а „wo“ значи „къде“.',
    },
  },
  {
    id: 'v-was',
    german: 'was',
    display: 'was',
    wordType: 'pronoun',
    translation: { en: 'what', bg: 'какво' },
    pronunciation: { en: 'vas', bg: 'вас' },
    example: {
      de: 'Was machst du?',
      gloss: { en: 'What are you doing?', bg: 'Какво правиш?' },
    },
    tags: ['question', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
  },
  {
    id: 'v-warum',
    german: 'warum',
    display: 'warum',
    wordType: 'adverb',
    translation: { en: 'why', bg: 'защо' },
    pronunciation: { en: 'va-ROOM', bg: 'ва-РУМ' },
    example: {
      de: 'Warum lernst du Deutsch?',
      gloss: { en: 'Why are you learning German?', bg: 'Защо учиш немски?' },
    },
    tags: ['question', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-machen',
    german: 'machen',
    display: 'machen',
    wordType: 'verb',
    translation: { en: 'to do, to make', bg: 'правя' },
    pronunciation: { en: 'MAH-khen', bg: 'МА-хен' },
    example: {
      de: 'Was machst du am Wochenende?',
      gloss: { en: 'What are you doing at the weekend?', bg: 'Какво правиш през уикенда?' },
    },
    tags: ['verb', 'grammar'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
  },
];

export const GRAMMAR_WORD_VOCAB: VocabEntry[] = [...PRONOUNS, ...NEGATION, ...QUESTION_WORDS];
