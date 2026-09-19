import type { VocabEntry } from '../types.ts';

/**
 * Health and advice (A2 Unit 4).
 *
 * The reflexive verbs are the point of this unit, and the vocabulary is chosen
 * so they arrive in the situation that actually needs them: saying how you
 * feel. sich fühlen is the one a learner will use every day, so it leads.
 *
 * The body parts extend A1 Unit 6 rather than repeating it — Kopf, Hals and
 * Bauch are already known, so this adds the four that a doctor's visit still
 * needs and lets the -schmerzen compound do the rest of the work.
 */

const U = 'a2-u4';
const L1 = 'a2-u4-l1';
const L2 = 'a2-u4-l2';
const L3 = 'a2-u4-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — how you feel
 * ------------------------------------------------------------------ */

const FEELING: VocabEntry[] = [
  {
    id: 'v-sich-fuehlen',
    german: 'sich fühlen',
    display: 'sich fühlen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gefühlt' },
    translation: { en: 'to feel (a certain way)', bg: 'чувствам се' },
    pronunciation: { en: 'zikh FUE-len', bg: 'зих ФЮ-лен' },
    example: {
      de: 'Ich fühle mich nicht gut.',
      gloss: { en: 'I do not feel well.', bg: 'Не се чувствам добре.' },
    },
    tags: ['health', 'reflexive'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'The reflexive word is not optional: "Ich fühle gut" is not a sentence. English has no equivalent here — "I feel myself well" is wrong in English and right in German.',
      bg: 'Възвратната дума не е по избор: „Ich fühle gut“ не е изречение. Българското „чувствам се“ работи по същия начин — само че немското „се“ се мени по лице.',
    },
  },
  {
    id: 'v-sich-ausruhen',
    german: 'sich ausruhen',
    display: 'sich ausruhen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'ausgeruht' },
    translation: { en: 'to rest', bg: 'почивам си' },
    pronunciation: { en: 'zikh OWS-roo-en', bg: 'зих АУС-ру-ен' },
    example: {
      de: 'Ich ruhe mich aus.',
      gloss: { en: 'I am resting.', bg: 'Почивам си.' },
    },
    tags: ['health', 'reflexive'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    notes: {
      en: 'Reflexive and separable at once, so three pieces end up spread across the sentence: Ich ruhe mich aus. The reflexive word comes straight after the verb.',
      bg: 'Възвратен и делим едновременно, затова три части се разпределят из изречението: Ich ruhe mich aus. Възвратната дума идва веднага след глагола.',
    },
  },
  {
    id: 'v-sich-erkaelten',
    german: 'sich erkälten',
    display: 'sich erkälten',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'erkältet' },
    translation: { en: 'to catch a cold', bg: 'настивам' },
    pronunciation: { en: 'zikh er-KEL-ten', bg: 'зих ер-КЕЛ-тен' },
    example: {
      de: 'Ich habe mich erkältet.',
      gloss: { en: 'I have caught a cold.', bg: 'Настинах.' },
    },
    tags: ['health', 'reflexive'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    related: ['v-erkaeltung'],
    notes: {
      en: 'Starts with er-, so no ge- in the participle: erkältet. And the reflexive word stays put in the Perfekt: Ich habe mich erkältet.',
      bg: 'Започва с er-, затова няма ge- в причастието: erkältet. А възвратната дума си остава на мястото и в перфекта: Ich habe mich erkältet.',
    },
  },
  {
    id: 'v-besser',
    german: 'besser',
    display: 'besser',
    wordType: 'adjective',
    translation: { en: 'better', bg: 'по-добре, по-добър' },
    pronunciation: { en: 'BES-er', bg: 'БЕС-ер' },
    example: {
      de: 'Heute geht es mir besser.',
      gloss: { en: 'I feel better today.', bg: 'Днес съм по-добре.' },
    },
    tags: ['health', 'opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'Irregular, like English good/better: gut → besser. The full comparison comes in Unit 5.',
      bg: 'Неправилна форма, като в българското „добър/по-добър“ без частицата: gut → besser, а не „mehr gut“. Пълното сравнение идва в раздел 5.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — advice
 * ------------------------------------------------------------------ */

const ADVICE: VocabEntry[] = [
  {
    id: 'v-sollen',
    german: 'sollen',
    display: 'sollen',
    wordType: 'verb',
    translation: { en: 'should, to be supposed to', bg: 'трябва, редно е (по чужда препоръка)' },
    pronunciation: { en: 'ZOL-en', bg: 'ЗОЛ-ен' },
    example: {
      de: 'Du sollst viel Tee trinken.',
      gloss: { en: 'You should drink a lot of tea.', bg: 'Трябва да пиеш много чай.' },
    },
    tags: ['modal'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-muessen'],
    notes: {
      en: 'The fifth modal, and it behaves like the four from A1: second position, other verb at the end. müssen is a necessity you feel; sollen is what someone else says you ought to do.',
      bg: 'Петият модален глагол и се държи като четирите от A1: втора позиция, другият глагол накрая. müssen е необходимост, която усещаш; sollen е това, което някой друг казва, че е редно.',
    },
  },
  {
    id: 'v-helfen',
    german: 'helfen',
    display: 'helfen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'geholfen' },
    translation: { en: 'to help', bg: 'помагам' },
    pronunciation: { en: 'HEL-fen', bg: 'ХЕЛ-фен' },
    example: {
      de: 'Tee hilft gut.',
      gloss: { en: 'Tea helps a lot.', bg: 'Чаят помага добре.' },
    },
    tags: ['health'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'A stem-changer: ich helfe, du hilfst, er hilft — the same e→i shift as sprechen and essen.',
      bg: 'Сменя гласната: ich helfe, du hilfst, er hilft — същата промяна e→i като при sprechen и essen.',
    },
  },
  {
    id: 'v-der-tipp',
    german: 'Tipp',
    display: 'der Tipp',
    article: 'der',
    gender: 'm',
    plural: 'die Tipps',
    wordType: 'noun',
    translation: { en: 'tip, piece of advice', bg: 'съвет' },
    pronunciation: { en: 'tip', bg: 'тип' },
    example: {
      de: 'Ich habe einen Tipp für dich.',
      gloss: { en: 'I have a tip for you.', bg: 'Имам един съвет за теб.' },
    },
    tags: ['advice'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 1,
    notes: {
      en: 'Two p\'s in German, one in English. The proper word for advice is der Rat, but Tipp is what people say.',
      bg: 'С две p на немски. Официалната дума за съвет е der Rat, но хората казват Tipp.',
    },
  },
  {
    id: 'v-das-medikament',
    german: 'Medikament',
    display: 'das Medikament',
    article: 'das',
    gender: 'n',
    plural: 'die Medikamente',
    wordType: 'noun',
    translation: { en: 'medicine, drug', bg: 'лекарство' },
    pronunciation: { en: 'me-di-ka-MENT', bg: 'ме-ди-ка-МЕНТ' },
    example: {
      de: 'Ich nehme ein Medikament.',
      gloss: { en: 'I am taking a medicine.', bg: 'Взимам лекарство.' },
    },
    tags: ['health'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-die-tablette',
    german: 'Tablette',
    display: 'die Tablette',
    article: 'die',
    gender: 'f',
    plural: 'die Tabletten',
    wordType: 'noun',
    translation: { en: 'tablet, pill', bg: 'таблетка' },
    pronunciation: { en: 'ta-BLET-e', bg: 'та-БЛЕТ-е' },
    example: {
      de: 'Nimm eine Tablette!',
      gloss: { en: 'Take a tablet!', bg: 'Вземи една таблетка!' },
    },
    tags: ['health'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — at the doctor
 * ------------------------------------------------------------------ */

const BODY: VocabEntry[] = [
  {
    id: 'v-der-ruecken',
    german: 'Rücken',
    display: 'der Rücken',
    article: 'der',
    gender: 'm',
    plural: 'die Rücken',
    wordType: 'noun',
    translation: { en: 'back', bg: 'гръб' },
    pronunciation: { en: 'RUE-ken', bg: 'РЮ-кен' },
    example: {
      de: 'Ich habe Rückenschmerzen.',
      gloss: { en: 'I have back pain.', bg: 'Боли ме гърбът.' },
    },
    tags: ['body'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    related: ['v-schmerzen'],
    notes: {
      en: 'The compound rule from A1 Unit 6 still holds: Rücken + Schmerzen = Rückenschmerzen, one word.',
      bg: 'Правилото за сложните думи от раздел 6 на A1 още важи: Rücken + Schmerzen = Rückenschmerzen, една дума.',
    },
  },
  {
    id: 'v-der-zahn',
    german: 'Zahn',
    display: 'der Zahn',
    article: 'der',
    gender: 'm',
    plural: 'die Zähne',
    wordType: 'noun',
    translation: { en: 'tooth', bg: 'зъб' },
    pronunciation: { en: 'tsahn', bg: 'цан' },
    example: {
      de: 'Mein Zahn tut weh.',
      gloss: { en: 'My tooth hurts.', bg: 'Боли ме зъбът.' },
    },
    tags: ['body'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-das-bein',
    german: 'Bein',
    display: 'das Bein',
    article: 'das',
    gender: 'n',
    plural: 'die Beine',
    wordType: 'noun',
    translation: { en: 'leg', bg: 'крак' },
    pronunciation: { en: 'byne', bg: 'байн' },
    example: {
      de: 'Mein Bein tut weh.',
      gloss: { en: 'My leg hurts.', bg: 'Боли ме кракът.' },
    },
    tags: ['body'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'German splits the leg from the foot: das Bein is the leg, der Fuß is the foot, and you cannot use one for the other.',
      bg: 'Немският различава крака от стъпалото: das Bein е кракът, der Fuß е стъпалото. Българското „крак“ покрива и двете, така че тук се внимава.',
    },
  },
  {
    id: 'v-der-arm',
    german: 'Arm',
    display: 'der Arm',
    article: 'der',
    gender: 'm',
    plural: 'die Arme',
    wordType: 'noun',
    translation: { en: 'arm', bg: 'ръка (от рамото)' },
    pronunciation: { en: 'arm', bg: 'арм' },
    example: {
      de: 'Mein Arm tut weh.',
      gloss: { en: 'My arm hurts.', bg: 'Боли ме ръката.' },
    },
    tags: ['body'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
  },
  {
    id: 'v-das-auge',
    german: 'Auge',
    display: 'das Auge',
    article: 'das',
    gender: 'n',
    plural: 'die Augen',
    wordType: 'noun',
    translation: { en: 'eye', bg: 'око' },
    pronunciation: { en: 'OW-ge', bg: 'АУ-ге' },
    example: {
      de: 'Meine Augen sind müde.',
      gloss: { en: 'My eyes are tired.', bg: 'Очите ми са уморени.' },
    },
    tags: ['body'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Neuter in German, and its plural is Augen — one of the nouns that takes -n rather than -e.',
      bg: 'Среден род на немски (българското „око“ също), а множественото е Augen — едно от съществителните с -n вместо -e.',
    },
  },
];

export const ADVICE_VOCAB: VocabEntry[] = [...FEELING, ...ADVICE, ...BODY];
