import type { VocabEntry } from '../types.ts';

/**
 * Work and education (A2 Unit 3).
 *
 * The vocabulary is chosen so that dass and wenn have something worth saying.
 * A subordinate clause is only useful once there is an opinion to hold or a
 * condition to state, so this list is built around glauben, denken and wissen —
 * the three verbs that make dass necessary — and around the things an adult
 * actually has opinions about: a job, a course, an exam, money.
 *
 * werden is here too, and it is doing double duty: it is what you become
 * ("Ich möchte Lehrer werden") and it is how German talks about the future.
 */

const U = 'a2-u3';
const L1 = 'a2-u3-l1';
const L2 = 'a2-u3-l2';
const L3 = 'a2-u3-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — a job, and what you think about it
 * ------------------------------------------------------------------ */

const WORK: VocabEntry[] = [
  {
    id: 'v-die-stelle',
    german: 'Stelle',
    display: 'die Stelle',
    article: 'die',
    gender: 'f',
    plural: 'die Stellen',
    wordType: 'noun',
    translation: { en: 'job, position', bg: 'работно място, позиция' },
    pronunciation: { en: 'SHTEL-e', bg: 'ЩЕЛ-е' },
    example: {
      de: 'Ich suche eine Stelle.',
      gloss: { en: 'I am looking for a job.', bg: 'Търся работа.' },
    },
    tags: ['work'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-beruf'],
    notes: {
      en: 'Three words that all translate as "job" and are not interchangeable: der Beruf is your profession, die Stelle is the post you hold, die Arbeit is the work itself.',
      bg: 'Три думи, които се превеждат като „работа“ и не се заменят: der Beruf е професията, die Stelle е позицията, die Arbeit е самата работа.',
    },
  },
  {
    id: 'v-die-bewerbung',
    german: 'Bewerbung',
    display: 'die Bewerbung',
    article: 'die',
    gender: 'f',
    plural: 'die Bewerbungen',
    wordType: 'noun',
    translation: { en: 'job application', bg: 'кандидатура, молба за работа' },
    pronunciation: { en: 'be-VER-boong', bg: 'бе-ВЕР-бунг' },
    example: {
      de: 'Ich schreibe eine Bewerbung.',
      gloss: { en: 'I am writing a job application.', bg: 'Пиша кандидатура за работа.' },
    },
    tags: ['work'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    notes: {
      en: 'Another -ung noun, so feminine without exception. A German Bewerbung is a formal package with a photo and certificates, not a one-page CV.',
      bg: 'Още едно съществително на -ung, значи женски род без изключение. Немската Bewerbung е официален комплект със снимка и дипломи, не автобиография на една страница.',
    },
  },
  {
    id: 'v-verdienen',
    german: 'verdienen',
    display: 'verdienen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'verdient' },
    translation: { en: 'to earn', bg: 'изкарвам, печеля (пари)' },
    pronunciation: { en: 'fer-DEE-nen', bg: 'фер-ДИ-нен' },
    example: {
      de: 'Ich verdiene nicht viel.',
      gloss: { en: 'I do not earn much.', bg: 'Не изкарвам много.' },
    },
    tags: ['work', 'money'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Starts with ver-, so no ge- in the participle: verdient. Germans consider salary a private matter, so the word turns up more in job adverts than in conversation.',
      bg: 'Започва с ver-, затова няма ge- в причастието: verdient. Немците смятат заплатата за личен въпрос, затова думата се среща повече в обяви, отколкото в разговор.',
    },
  },
  {
    id: 'v-das-geld',
    german: 'Geld',
    display: 'das Geld',
    article: 'das',
    gender: 'n',
    wordType: 'noun',
    translation: { en: 'money', bg: 'пари' },
    pronunciation: { en: 'gelt', bg: 'гелд' },
    example: {
      de: 'Ich habe kein Geld.',
      gloss: { en: 'I have no money.', bg: 'Нямам пари.' },
    },
    tags: ['money'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    notes: {
      en: 'Singular in German, plural in Bulgarian — "пари" is plural, "das Geld" is one thing. So it is "das Geld ist", never "sind".',
      bg: 'На немски е единствено число, на български — множествено. „Парите са“, но „das Geld ist“, никога „sind“.',
    },
  },
  {
    id: 'v-glauben',
    german: 'glauben',
    display: 'glauben',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'geglaubt' },
    translation: { en: 'to believe, to think', bg: 'мисля, вярвам' },
    pronunciation: { en: 'GLOW-ben', bg: 'ГЛАУ-бен' },
    example: {
      de: 'Ich glaube, dass Deutsch schwer ist.',
      gloss: { en: 'I think German is hard.', bg: 'Мисля, че немският е труден.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-denken', 'v-wissen'],
  },
  {
    id: 'v-denken',
    german: 'denken',
    display: 'denken',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gedacht' },
    translation: { en: 'to think', bg: 'мисля' },
    pronunciation: { en: 'DENK-en', bg: 'ДЕНК-ен' },
    example: {
      de: 'Ich denke, dass das gut ist.',
      gloss: { en: 'I think that is good.', bg: 'Мисля, че това е добре.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-glauben'],
    notes: {
      en: 'An irregular participle worth noticing: gedacht, not "gedenkt". kennen does the same — gekannt.',
      bg: 'Неправилно причастие, което си струва да се забележи: gedacht, не „gedenkt“. kennen прави същото — gekannt.',
    },
  },
  {
    id: 'v-wissen',
    german: 'wissen',
    display: 'wissen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gewusst' },
    translation: { en: 'to know (a fact)', bg: 'знам (факт)' },
    pronunciation: { en: 'VIS-en', bg: 'ВИС-ен' },
    example: {
      de: 'Ich weiß, dass du Deutsch lernst.',
      gloss: { en: 'I know that you are learning German.', bg: 'Знам, че учиш немски.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    related: ['v-kennen'],
    notes: {
      en: 'German splits knowing in two: wissen is knowing a fact, kennen is being acquainted with a person or place. "Ich weiß es" but "Ich kenne ihn". Note the odd ich-form: ich weiß, du weißt.',
      bg: 'Немският разделя знаенето на две: wissen е да знаеш факт, kennen е да познаваш човек или място. „Ich weiß es“, но „Ich kenne ihn“. Забележи странната форма за ich: ich weiß, du weißt.',
    },
  },
  {
    id: 'v-dass',
    german: 'dass',
    display: 'dass',
    wordType: 'conjunction',
    translation: { en: 'that (introducing a clause)', bg: 'че' },
    pronunciation: { en: 'dass', bg: 'дас' },
    example: {
      de: 'Ich glaube, dass Deutsch schwer ist.',
      gloss: { en: 'I think that German is hard.', bg: 'Мисля, че немският е труден.' },
    },
    tags: ['grammar-word'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-weil'],
    notes: {
      en: 'Does exactly what weil does to the word order: verb to the end, comma in front. And note the spelling — dass with ss is the conjunction; das with one s is the article.',
      bg: 'Прави със словореда точно каквото прави weil: глаголът в края, запетая отпред. И внимавай с правописа — dass с ss е съюзът; das с едно s е членът.',
    },
  },
  {
    id: 'v-schwer',
    german: 'schwer',
    display: 'schwer',
    wordType: 'adjective',
    translation: { en: 'hard, difficult; heavy', bg: 'труден; тежък' },
    pronunciation: { en: 'shvair', bg: 'швер' },
    example: {
      de: 'Deutsch ist nicht schwer.',
      gloss: { en: 'German is not hard.', bg: 'Немският не е труден.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'One word for both "difficult" and "heavy", exactly like Bulgarian „тежък“ and unlike English, which keeps them apart.',
      bg: 'Една дума и за „труден“, и за „тежък“ — точно като българското „тежък“.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — courses, exams, and conditions
 * ------------------------------------------------------------------ */

const STUDY: VocabEntry[] = [
  {
    id: 'v-der-kurs',
    german: 'Kurs',
    display: 'der Kurs',
    article: 'der',
    gender: 'm',
    plural: 'die Kurse',
    wordType: 'noun',
    translation: { en: 'course, class', bg: 'курс' },
    pronunciation: { en: 'koors', bg: 'курс' },
    example: {
      de: 'Ich mache einen Deutschkurs.',
      gloss: { en: 'I am doing a German course.', bg: 'Карам курс по немски.' },
    },
    tags: ['education'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 1,
    collocations: [{ de: 'einen Kurs machen', gloss: { en: 'to do a course', bg: 'да карам курс' } }],
  },
  {
    id: 'v-die-pruefung',
    german: 'Prüfung',
    display: 'die Prüfung',
    article: 'die',
    gender: 'f',
    plural: 'die Prüfungen',
    wordType: 'noun',
    translation: { en: 'exam', bg: 'изпит' },
    pronunciation: { en: 'PRUE-foong', bg: 'ПРЮ-фунг' },
    example: {
      de: 'Ich habe die Prüfung bestanden.',
      gloss: { en: 'I passed the exam.', bg: 'Изкарах изпита.' },
    },
    tags: ['education'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'A third -ung noun, and feminine like all of them. You *make* an exam in German — eine Prüfung machen — and passing one is bestehen.',
      bg: 'Трето съществително на -ung, и пак от женски род. На немски изпитът се „прави“ — eine Prüfung machen — а изкарването му е bestehen.',
    },
  },
  {
    id: 'v-wenn',
    german: 'wenn',
    display: 'wenn',
    wordType: 'conjunction',
    translation: { en: 'if, when(ever)', bg: 'ако, когато' },
    pronunciation: { en: 'ven', bg: 'вен' },
    example: {
      de: 'Wenn ich Zeit habe, lerne ich Deutsch.',
      gloss: { en: 'When I have time, I study German.', bg: 'Когато имам време, уча немски.' },
    },
    tags: ['grammar-word'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    related: ['v-weil', 'v-dass'],
    notes: {
      en: 'One word for both "if" and "when", which your language keeps apart. And like weil and dass, it sends its verb to the end.',
      bg: 'Една дума и за „ако“, и за „когато“ — а българският ги различава. И както weil и dass, праща глагола си в края.',
    },
  },
  {
    id: 'v-wichtig',
    german: 'wichtig',
    display: 'wichtig',
    wordType: 'adjective',
    translation: { en: 'important', bg: 'важен' },
    pronunciation: { en: 'VIKH-tikh', bg: 'ВИХ-тих' },
    example: {
      de: 'Deutsch ist wichtig für meine Arbeit.',
      gloss: { en: 'German is important for my work.', bg: 'Немският е важен за работата ми.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-einfach',
    german: 'einfach',
    display: 'einfach',
    wordType: 'adjective',
    translation: { en: 'easy, simple', bg: 'лесен, прост' },
    pronunciation: { en: 'AYN-fakh', bg: 'АЙН-фах' },
    example: {
      de: 'Die Prüfung war einfach.',
      gloss: { en: 'The exam was easy.', bg: 'Изпитът беше лесен.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'ein + fach, "one-fold". It also works as an adverb meaning "just": "Sag es einfach" — just say it.',
      bg: 'ein + fach, „еднократен“. Работи и като наречие със значение „просто“: „Sag es einfach“ — просто го кажи.',
    },
  },
  {
    id: 'v-vielleicht',
    german: 'vielleicht',
    display: 'vielleicht',
    wordType: 'adverb',
    translation: { en: 'maybe, perhaps', bg: 'може би' },
    pronunciation: { en: 'fee-LYKHT', bg: 'фи-ЛАЙХТ' },
    example: {
      de: 'Vielleicht mache ich einen Kurs.',
      gloss: { en: 'Maybe I will do a course.', bg: 'Може би ще карам курс.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Put it first and the verb still comes second: "Vielleicht mache ich…" — not "Vielleicht ich mache". The rule from Pre-A1 has never stopped applying.',
      bg: 'Сложи го отпред и глаголът пак е втори: „Vielleicht mache ich…“, не „Vielleicht ich mache“. Правилото от Pre-A1 никога не е спирало да важи.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — what you are going to be
 * ------------------------------------------------------------------ */

const FUTURE: VocabEntry[] = [
  {
    id: 'v-werden',
    german: 'werden',
    display: 'werden',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'geworden' },
    translation: { en: 'to become; will (future)', bg: 'ставам; ще (бъдеще)' },
    pronunciation: { en: 'VAIR-den', bg: 'ВЕР-ден' },
    example: {
      de: 'Ich möchte Lehrer werden.',
      gloss: { en: 'I want to become a teacher.', bg: 'Искам да стана учител.' },
    },
    tags: ['work'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'Two jobs in one verb: becoming something, and forming the future. It is also the third verb that takes sein for no reason — with sein and bleiben.',
      bg: 'Две работи в един глагол: ставане на нещо и образуване на бъдеще време. Освен това е третият глагол, който взима sein без причина — заедно със sein и bleiben.',
    },
  },
  {
    id: 'v-die-zukunft',
    german: 'Zukunft',
    display: 'die Zukunft',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'future', bg: 'бъдеще' },
    pronunciation: { en: 'TSOO-koonft', bg: 'ЦУ-кунфт' },
    example: {
      de: 'In Zukunft lerne ich mehr.',
      gloss: { en: 'In future I will study more.', bg: 'В бъдеще ще уча повече.' },
    },
    tags: ['time'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-die-erfahrung',
    german: 'Erfahrung',
    display: 'die Erfahrung',
    article: 'die',
    gender: 'f',
    plural: 'die Erfahrungen',
    wordType: 'noun',
    translation: { en: 'experience', bg: 'опит' },
    pronunciation: { en: 'er-FAH-roong', bg: 'ер-ФА-рунг' },
    example: {
      de: 'Ich habe viel Erfahrung.',
      gloss: { en: 'I have a lot of experience.', bg: 'Имам много опит.' },
    },
    tags: ['work'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'A fourth -ung noun in one unit, and feminine like the rest. If a German noun ends in -ung, you never have to guess its gender.',
      bg: 'Четвърто съществително на -ung в един раздел, и пак от женски род. Ако немско съществително завършва на -ung, родът му никога не се гадае.',
    },
  },
  {
    id: 'v-das-team',
    german: 'Team',
    display: 'das Team',
    article: 'das',
    gender: 'n',
    plural: 'die Teams',
    wordType: 'noun',
    translation: { en: 'team', bg: 'екип' },
    pronunciation: { en: 'teem', bg: 'тийм' },
    example: {
      de: 'Das Team ist sehr nett.',
      gloss: { en: 'The team is very nice.', bg: 'Екипът е много симпатичен.' },
    },
    tags: ['work'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
  },
];

export const WORK2_VOCAB: VocabEntry[] = [...WORK, ...STUDY, ...FUTURE];
