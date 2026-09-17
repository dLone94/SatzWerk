import type { VocabEntry } from '../types.ts';

/**
 * Days, months, dates and the clock (Pre-A1 Unit 5).
 *
 * The hard parts for a beginner are not the words but the prepositions
 * (am Montag, im Januar, um acht Uhr) and the German habit of counting the
 * half hour forward: "halb acht" is half past *seven*, not half past eight.
 */

const U = 'pre-a1-u5';
const L1 = 'pre-a1-u5-l1';
const L2 = 'pre-a1-u5-l2';
const L3 = 'pre-a1-u5-l3';

interface DayInit {
  id: string;
  de: string;
  en: string;
  bg: string;
  pronEn: string;
  pronBg: string;
  note?: { en?: string; bg?: string };
}

/** All weekdays are masculine, which is a rare piece of good news. */
function day(init: DayInit): VocabEntry {
  return {
    id: init.id,
    german: init.de,
    display: `der ${init.de}`,
    article: 'der',
    gender: 'm',
    plural: `die ${init.de}e`,
    wordType: 'noun',
    translation: { en: init.en, bg: init.bg },
    pronunciation: { en: init.pronEn, bg: init.pronBg },
    example: {
      de: `Am ${init.de} arbeite ich.`,
      gloss: {
        en: `On ${init.en} I work.`,
        bg: `В ${init.bg} работя.`,
      },
    },
    tags: ['time', 'weekday'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    ...(init.note ? { notes: init.note } : {}),
  };
}

const DAYS: VocabEntry[] = [
  day({ id: 'v-montag', de: 'Montag', en: 'Monday', bg: 'понеделник', pronEn: 'MOHN-tahk', pronBg: 'МОН-так',
    note: {
      en: 'All seven weekdays are masculine: der Montag, der Dienstag, and so on. One rule covers them all.',
      bg: 'И седемте дни от седмицата са от мъжки род: der Montag, der Dienstag и т.н. Едно правило важи за всички — точно както в българския.',
    } }),
  day({ id: 'v-dienstag', de: 'Dienstag', en: 'Tuesday', bg: 'вторник', pronEn: 'DEENS-tahk', pronBg: 'ДИНС-так' }),
  day({ id: 'v-mittwoch', de: 'Mittwoch', en: 'Wednesday', bg: 'сряда', pronEn: 'MIT-vokh', pronBg: 'МИТ-вох',
    note: {
      en: 'Literally "mid-week", which is exactly what it is.',
      bg: 'Буквално „средата на седмицата“ — точно както българското „сряда“.',
    } }),
  day({ id: 'v-donnerstag', de: 'Donnerstag', en: 'Thursday', bg: 'четвъртък', pronEn: 'DON-ers-tahk', pronBg: 'ДО-нерс-так' }),
  day({ id: 'v-freitag', de: 'Freitag', en: 'Friday', bg: 'петък', pronEn: 'FRY-tahk', pronBg: 'ФРАЙ-так' }),
  day({ id: 'v-samstag', de: 'Samstag', en: 'Saturday', bg: 'събота', pronEn: 'ZAMS-tahk', pronBg: 'ЗАМС-так' }),
  day({ id: 'v-sonntag', de: 'Sonntag', en: 'Sunday', bg: 'неделя', pronEn: 'ZON-tahk', pronBg: 'ЗОН-так',
    note: {
      en: 'Worth knowing: almost every shop in Germany is closed on Sunday.',
      bg: 'Полезно е да се знае: почти всички магазини в Германия са затворени в неделя.',
    } }),
];

const RELATIVE_TIME: VocabEntry[] = [
  {
    id: 'v-heute',
    german: 'heute',
    display: 'heute',
    wordType: 'adverb',
    translation: { en: 'today', bg: 'днес' },
    pronunciation: { en: 'HOY-te', bg: 'ХОЙ-те' },
    example: {
      de: 'Heute arbeite ich zu Hause.',
      gloss: { en: 'Today I work from home.', bg: 'Днес работя вкъщи.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    notes: {
      en: 'Put it first and the verb still comes second, so the subject moves behind it: Heute arbeite ich.',
      bg: 'Сложи го отпред и глаголът пак е втори, затова подлогът минава след него: Heute arbeite ich. В българския е свободно: „Днес работя“ и „Работя днес“.',
    },
  },
  {
    id: 'v-morgen',
    german: 'morgen',
    display: 'morgen',
    wordType: 'adverb',
    translation: { en: 'tomorrow', bg: 'утре' },
    pronunciation: { en: 'MOR-gen', bg: 'МОР-ген' },
    example: {
      de: 'Morgen lerne ich Deutsch.',
      gloss: { en: 'Tomorrow I am learning German.', bg: 'Утре ще уча немски.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-guten-morgen'],
    notes: {
      en: 'Careful: lowercase "morgen" is tomorrow, capitalised "der Morgen" is the morning. Only the capital letter separates them.',
      bg: 'Внимание: с малка буква „morgen“ е „утре“, а с главна „der Morgen“ е „утрото“. Различава ги само главната буква.',
    },
  },
  {
    id: 'v-gestern',
    german: 'gestern',
    display: 'gestern',
    wordType: 'adverb',
    translation: { en: 'yesterday', bg: 'вчера' },
    pronunciation: { en: 'GES-tern', bg: 'ГЕС-терн' },
    example: {
      de: 'Gestern war ich in Berlin.',
      gloss: { en: 'Yesterday I was in Berlin.', bg: 'Вчера бях в Берлин.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'With yesterday you need the past: "war" (was), not "bin". You will meet the full past tense at A2.',
      bg: 'С „вчера“ трябва минало време: „war“ (бях), не „bin“. Пълното минало време идва в A2.',
    },
  },
  {
    id: 'v-die-woche',
    german: 'Woche',
    display: 'die Woche',
    article: 'die',
    gender: 'f',
    plural: 'die Wochen',
    wordType: 'noun',
    translation: { en: 'the week', bg: 'седмицата' },
    pronunciation: { en: 'VO-khe', bg: 'ВО-хе' },
    example: {
      de: 'Diese Woche arbeite ich viel.',
      gloss: { en: 'This week I am working a lot.', bg: 'Тази седмица работя много.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
  {
    id: 'v-das-wochenende',
    german: 'Wochenende',
    display: 'das Wochenende',
    article: 'das',
    gender: 'n',
    plural: 'die Wochenenden',
    wordType: 'noun',
    translation: { en: 'the weekend', bg: 'уикендът' },
    pronunciation: { en: 'VO-khen-en-de', bg: 'ВО-хен-ен-де' },
    example: {
      de: 'Am Wochenende bin ich zu Hause.',
      gloss: { en: 'At the weekend I am at home.', bg: 'През уикенда съм вкъщи.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    collocations: [{ de: 'am Wochenende', gloss: { en: 'at the weekend', bg: 'през уикенда' } }],
    notes: {
      en: 'Literally "week-end", the same idea as in English, but neuter: das Wochenende.',
      bg: 'Буквално „краят на седмицата“. От среден род: das Wochenende.',
    },
  },
];

interface MonthInit {
  id: string;
  de: string;
  en: string;
  bg: string;
  pronEn: string;
  pronBg: string;
}

/** Months are all masculine, like the weekdays. */
function month(init: MonthInit): VocabEntry {
  return {
    id: init.id,
    german: init.de,
    display: `der ${init.de}`,
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: init.en, bg: init.bg },
    pronunciation: { en: init.pronEn, bg: init.pronBg },
    example: {
      de: `Im ${init.de} habe ich Urlaub.`,
      gloss: {
        en: `In ${init.en} I have holiday.`,
        bg: `През ${init.bg} съм в отпуск.`,
      },
    },
    tags: ['time', 'month'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  };
}

const MONTHS: VocabEntry[] = [
  month({ id: 'v-januar', de: 'Januar', en: 'January', bg: 'януари', pronEn: 'YAH-noo-ar', pronBg: 'Я-ну-ар' }),
  month({ id: 'v-februar', de: 'Februar', en: 'February', bg: 'февруари', pronEn: 'FAY-broo-ar', pronBg: 'ФЕ-бру-ар' }),
  month({ id: 'v-maerz', de: 'März', en: 'March', bg: 'март', pronEn: 'mairts', pronBg: 'мерц' }),
  month({ id: 'v-april', de: 'April', en: 'April', bg: 'април', pronEn: 'a-PRIL', pronBg: 'а-ПРИЛ' }),
  month({ id: 'v-mai', de: 'Mai', en: 'May', bg: 'май', pronEn: 'my', pronBg: 'май' }),
  month({ id: 'v-juni', de: 'Juni', en: 'June', bg: 'юни', pronEn: 'YOO-nee', pronBg: 'Ю-ни' }),
  month({ id: 'v-juli', de: 'Juli', en: 'July', bg: 'юли', pronEn: 'YOO-lee', pronBg: 'Ю-ли' }),
  month({ id: 'v-august', de: 'August', en: 'August', bg: 'август', pronEn: 'ow-GOOST', pronBg: 'ау-ГУСТ' }),
  month({ id: 'v-september', de: 'September', en: 'September', bg: 'септември', pronEn: 'zep-TEM-ber', pronBg: 'зеп-ТЕМ-бер' }),
  month({ id: 'v-oktober', de: 'Oktober', en: 'October', bg: 'октомври', pronEn: 'ok-TOH-ber', pronBg: 'ок-ТО-бер' }),
  month({ id: 'v-november', de: 'November', en: 'November', bg: 'ноември', pronEn: 'no-VEM-ber', pronBg: 'но-ВЕМ-бер' }),
  month({ id: 'v-dezember', de: 'Dezember', en: 'December', bg: 'декември', pronEn: 'de-TSEM-ber', pronBg: 'де-ЦЕМ-бер' }),
];

const DATES_AND_CLOCK: VocabEntry[] = [
  {
    id: 'v-der-monat',
    german: 'Monat',
    display: 'der Monat',
    article: 'der',
    gender: 'm',
    plural: 'die Monate',
    wordType: 'noun',
    translation: { en: 'the month', bg: 'месецът' },
    pronunciation: { en: 'MOH-naht', bg: 'МО-нат' },
    example: {
      de: 'Dieser Monat ist Mai.',
      gloss: { en: 'This month is May.', bg: 'Този месец е май.' },
    },
    tags: ['time'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-der-geburtstag',
    german: 'Geburtstag',
    display: 'der Geburtstag',
    article: 'der',
    gender: 'm',
    plural: 'die Geburtstage',
    wordType: 'noun',
    translation: { en: 'the birthday', bg: 'рожденият ден' },
    pronunciation: { en: 'ge-BOORTS-tahk', bg: 'ге-БУРЦ-так' },
    example: {
      de: 'Mein Geburtstag ist im Mai.',
      gloss: { en: 'My birthday is in May.', bg: 'Рожденият ми ден е през май.' },
    },
    tags: ['time', 'personal'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    collocations: [
      { de: 'Wann hast du Geburtstag?', gloss: { en: 'When is your birthday?', bg: 'Кога имаш рожден ден?' } },
      { de: 'Herzlichen Glückwunsch!', gloss: { en: 'Happy birthday! / Congratulations!', bg: 'Поздравления! / Честит рожден ден!' } },
    ],
    notes: {
      en: 'German says "haben Geburtstag" — literally "to have birthday": Ich habe im Mai Geburtstag.',
      bg: 'Немският казва „haben Geburtstag“ — буквално „имам рожден ден“, точно както в българския: Ich habe im Mai Geburtstag.',
    },
  },
  {
    id: 'v-wann',
    german: 'wann',
    display: 'wann',
    wordType: 'adverb',
    translation: { en: 'when', bg: 'кога' },
    pronunciation: { en: 'van', bg: 'ван' },
    example: {
      de: 'Wann kommst du?',
      gloss: { en: 'When are you coming?', bg: 'Кога идваш?' },
    },
    tags: ['time', 'question'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L2,
    difficulty: 1,
  },
  {
    id: 'v-die-uhr',
    german: 'Uhr',
    display: 'die Uhr',
    article: 'die',
    gender: 'f',
    plural: 'die Uhren',
    wordType: 'noun',
    translation: { en: 'the clock; o’clock', bg: 'часовникът; часът' },
    pronunciation: { en: 'oor', bg: 'ур' },
    example: {
      de: 'Es ist acht Uhr.',
      gloss: { en: 'It is eight o’clock.', bg: 'Часът е осем.' },
    },
    tags: ['time', 'clock'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Never leave out "Uhr" when giving a full hour: "Es ist acht Uhr", not "Es ist acht".',
      bg: 'Не пропускай „Uhr“ при цял час: „Es ist acht Uhr“, а не „Es ist acht“ — за разлика от българското „Часът е осем“.',
    },
  },
  {
    id: 'v-wie-viel-uhr-ist-es',
    german: 'Wie viel Uhr ist es?',
    display: 'Wie viel Uhr ist es?',
    wordType: 'phrase',
    translation: { en: 'What time is it?', bg: 'Колко е часът?' },
    pronunciation: { en: 'vee feel OOR ist es', bg: 'ви фил УР ист ес' },
    example: {
      de: 'Wie viel Uhr ist es? — Es ist halb acht.',
      gloss: {
        en: 'What time is it? — It is half past seven.',
        bg: 'Колко е часът? — Седем и половина.',
      },
    },
    tags: ['time', 'clock', 'question'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    collocations: [
      { de: 'Wie spät ist es?', gloss: { en: 'What time is it? (equally common)', bg: 'Колко е часът? (също толкова често)' } },
    ],
  },
  {
    id: 'v-halb',
    german: 'halb',
    display: 'halb',
    wordType: 'adjective',
    translation: { en: 'half (to the coming hour)', bg: 'половина (към следващия час)' },
    pronunciation: { en: 'halp', bg: 'халп' },
    example: {
      de: 'Es ist halb acht.',
      gloss: { en: 'It is half past seven (7:30).', bg: 'Часът е седем и половина (7:30).' },
    },
    tags: ['time', 'clock'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 5,
    notes: {
      en: 'The single biggest time trap. German counts towards the coming hour: "halb acht" is 7:30, not 8:30. Think "half way to eight".',
      bg: 'Най-голямият капан при часа. Немският брои към идващия час: „halb acht“ е 7:30, а не 8:30. Българският казва „седем и половина“ — немският казва „половината до осем“.',
    },
  },
  {
    id: 'v-viertel',
    german: 'Viertel',
    display: 'das Viertel',
    article: 'das',
    gender: 'n',
    plural: 'die Viertel',
    wordType: 'noun',
    translation: { en: 'the quarter', bg: 'четвъртинката; четвърт час' },
    pronunciation: { en: 'FEER-tel', bg: 'ФИР-тел' },
    example: {
      de: 'Es ist Viertel nach acht.',
      gloss: { en: 'It is quarter past eight.', bg: 'Часът е осем и петнайсет.' },
    },
    tags: ['time', 'clock'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    collocations: [
      { de: 'Viertel nach', gloss: { en: 'quarter past', bg: 'и петнайсет' } },
      { de: 'Viertel vor', gloss: { en: 'quarter to', bg: 'без петнайсет' } },
    ],
  },
  {
    id: 'v-um',
    german: 'um',
    display: 'um',
    wordType: 'preposition',
    translation: { en: 'at (a clock time)', bg: 'в (за точен час)' },
    pronunciation: { en: 'oom', bg: 'ум' },
    example: {
      de: 'Ich arbeite um acht Uhr.',
      gloss: { en: 'I work at eight o’clock.', bg: 'Работя в осем часа.' },
    },
    tags: ['time', 'preposition'],
    level: 'pre-a1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Three prepositions, three jobs: um for a clock time, am for a day, im for a month.',
      bg: 'Три предлога, три задачи: um за точен час, am за ден, im за месец. Българският използва „в“ и „през“ за всички тях.',
    },
  },
];

export const TIME_VOCAB: VocabEntry[] = [
  ...DAYS,
  ...RELATIVE_TIME,
  ...MONTHS,
  ...DATES_AND_CLOCK,
];
