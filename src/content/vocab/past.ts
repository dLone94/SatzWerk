import type { VocabEntry } from '../types.ts';

/**
 * Last weekend (A2 Unit 1).
 *
 * The smallest vocabulary list in the course so far, and deliberately so. This
 * unit teaches the Perfekt, and the learner already owns forty-three verbs from
 * Pre-A1 and A1 — machen, spielen, essen, gehen, fahren, arbeiten. What is new
 * is not the words but a second form of the words, so the unit spends its
 * effort on that form rather than on more vocabulary to carry.
 *
 * What is added is what a past-tense unit cannot do without: the time
 * expressions that place a sentence in the past, two verbs that take sein and
 * had no reason to exist before (bleiben, fliegen), one that only ever turns up
 * in the past (passieren), and the handful of nouns a weekend story needs.
 */

const U = 'a2-u1';
const L1 = 'a2-u1-l1';
const L2 = 'a2-u1-l2';
const L3 = 'a2-u1-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — placing a sentence in the past
 * ------------------------------------------------------------------ */

const TIME: VocabEntry[] = [
  {
    id: 'v-vorgestern',
    german: 'vorgestern',
    display: 'vorgestern',
    wordType: 'adverb',
    translation: { en: 'the day before yesterday', bg: 'онзи ден' },
    pronunciation: { en: 'FOR-ges-tern', bg: 'ФОР-гес-терн' },
    example: {
      de: 'Vorgestern habe ich gearbeitet.',
      gloss: { en: 'The day before yesterday I worked.', bg: 'Онзи ден работих.' },
    },
    tags: ['time', 'past'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'German has a single word for it, where English needs four. It is built from vor ("before") plus gestern, and morgen has the same trick: übermorgen is the day after tomorrow.',
      bg: 'Немският има една дума за това, което на български е израз от две. Строи се от vor („преди“) и gestern, а morgen има същия номер: übermorgen е вдругиден.',
    },
  },
  {
    id: 'v-letzte-woche',
    german: 'letzte Woche',
    display: 'letzte Woche',
    wordType: 'phrase',
    translation: { en: 'last week', bg: 'миналата седмица' },
    pronunciation: { en: 'LETS-te VO-khe', bg: 'ЛЕЦ-те ВО-хе' },
    example: {
      de: 'Letzte Woche habe ich viel gearbeitet.',
      gloss: { en: 'Last week I worked a lot.', bg: 'Миналата седмица работих много.' },
    },
    tags: ['time', 'past'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-die-woche'],
    notes: {
      en: 'No preposition and no article: "letzte Woche", not "in der letzten Woche". The same goes for letzten Monat and letztes Jahr.',
      bg: 'Без предлог и без член: „letzte Woche“, не „in der letzten Woche“. Същото важи за letzten Monat и letztes Jahr.',
    },
  },
  {
    id: 'v-letztes-wochenende',
    german: 'letztes Wochenende',
    display: 'letztes Wochenende',
    wordType: 'phrase',
    translation: { en: 'last weekend', bg: 'миналия уикенд' },
    pronunciation: { en: 'LETS-tes VO-khen-en-de', bg: 'ЛЕЦ-тес ВО-хен-ен-де' },
    example: {
      de: 'Letztes Wochenende war ich in Berlin.',
      gloss: { en: 'Last weekend I was in Berlin.', bg: 'Миналия уикенд бях в Берлин.' },
    },
    tags: ['time', 'past'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-das-wochenende'],
  },
  {
    id: 'v-letztes-jahr',
    german: 'letztes Jahr',
    display: 'letztes Jahr',
    wordType: 'phrase',
    translation: { en: 'last year', bg: 'миналата година' },
    pronunciation: { en: 'LETS-tes YAR', bg: 'ЛЕЦ-тес ЯР' },
    example: {
      de: 'Letztes Jahr bin ich nach Wien gefahren.',
      gloss: { en: 'Last year I went to Vienna.', bg: 'Миналата година ходих до Виена.' },
    },
    tags: ['time', 'past'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-das-jahr'],
  },
  {
    id: 'v-die-party',
    german: 'Party',
    display: 'die Party',
    article: 'die',
    gender: 'f',
    plural: 'die Partys',
    wordType: 'noun',
    translation: { en: 'party', bg: 'парти' },
    pronunciation: { en: 'PAR-tee', bg: 'ПАР-ти' },
    example: {
      de: 'Ich habe eine Party gemacht.',
      gloss: { en: 'I had a party.', bg: 'Направих парти.' },
    },
    tags: ['leisure'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    notes: {
      en: 'An English word that German kept, and gave a gender to: die Party. The plural is Partys, not Parties — German does not import English spelling rules.',
      bg: 'Английска дума, която немският е запазил и ѝ е дал род: die Party. Множественото е Partys, не Parties — немският не внася английски правописни правила.',
    },
  },
  {
    id: 'v-der-ausflug',
    german: 'Ausflug',
    display: 'der Ausflug',
    article: 'der',
    gender: 'm',
    plural: 'die Ausflüge',
    wordType: 'noun',
    translation: { en: 'trip, outing', bg: 'екскурзия, излет' },
    pronunciation: { en: 'OWS-floog', bg: 'АУС-флуг' },
    example: {
      de: 'Wir haben einen Ausflug gemacht.',
      gloss: { en: 'We went on a trip.', bg: 'Направихме излет.' },
    },
    tags: ['leisure', 'travel'],
    level: 'a2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    collocations: [
      { de: 'einen Ausflug machen', gloss: { en: 'to go on a trip', bg: 'да направиш излет' } },
    ],
    notes: {
      en: 'aus + Flug, "out-flight", though no flying is involved: it is a day trip. Note that you *make* one in German — einen Ausflug machen.',
      bg: 'aus + Flug, „из-полет“, макар че никой не лети: това е еднодневен излет. Забележи, че на немски го „правиш“ — einen Ausflug machen.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the verbs that take sein
 * ------------------------------------------------------------------ */

const MOVEMENT: VocabEntry[] = [
  {
    id: 'v-bleiben',
    german: 'bleiben',
    display: 'bleiben',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'geblieben' },
    translation: { en: 'to stay', bg: 'оставам' },
    pronunciation: { en: 'BLY-ben', bg: 'БЛАЙ-бен' },
    example: {
      de: 'Ich bin zu Hause geblieben.',
      gloss: { en: 'I stayed at home.', bg: 'Останах вкъщи.' },
    },
    tags: ['movement'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The odd one out: bleiben takes sein although nothing moves at all. It is one of three exceptions worth memorising by name — sein, bleiben, werden — rather than trying to reason about.',
      bg: 'Изключението: bleiben взима sein, въпреки че нищо не се движи. Това е един от трите случая, които се помнят по име — sein, bleiben, werden — вместо да се обясняват.',
    },
  },
  {
    id: 'v-fliegen',
    german: 'fliegen',
    display: 'fliegen',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'geflogen' },
    translation: { en: 'to fly', bg: 'летя' },
    pronunciation: { en: 'FLEE-gen', bg: 'ФЛИ-ген' },
    example: {
      de: 'Wir sind nach Sofia geflogen.',
      gloss: { en: 'We flew to Sofia.', bg: 'Летяхме до София.' },
    },
    tags: ['movement', 'travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-fahren', 'v-gehen'],
    notes: {
      en: 'Three verbs for going somewhere, and German keeps them apart: gehen on foot, fahren by road or rail, fliegen by air. All three take sein.',
      bg: 'Три глагола за „отивам“ и немският ги различава: gehen пеша, fahren с наземен транспорт, fliegen със самолет. И трите взимат sein.',
    },
  },
  {
    id: 'v-die-reise',
    german: 'Reise',
    display: 'die Reise',
    article: 'die',
    gender: 'f',
    plural: 'die Reisen',
    wordType: 'noun',
    translation: { en: 'journey, trip', bg: 'пътуване' },
    pronunciation: { en: 'RY-ze', bg: 'РАЙ-зе' },
    example: {
      de: 'Die Reise war lang.',
      gloss: { en: 'The journey was long.', bg: 'Пътуването беше дълго.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-der-urlaub',
    german: 'Urlaub',
    display: 'der Urlaub',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'holiday, leave from work', bg: 'отпуск' },
    pronunciation: { en: 'OOR-lowp', bg: 'УР-лауп' },
    example: {
      de: 'Ich war im Urlaub.',
      gloss: { en: 'I was on holiday.', bg: 'Бях в отпуск.' },
    },
    tags: ['travel', 'work'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    collocations: [{ de: 'im Urlaub', gloss: { en: 'on holiday', bg: 'в отпуск' } }],
    notes: {
      en: 'Urlaub is leave from work. A school holiday is Ferien, and the two are not interchangeable — an adult with a job says Urlaub.',
      bg: 'Urlaub е отпуск от работа. Училищната ваканция е Ferien и двете не се заменят — работещ човек казва Urlaub.',
    },
  },
  {
    id: 'v-das-hotel',
    german: 'Hotel',
    display: 'das Hotel',
    article: 'das',
    gender: 'n',
    plural: 'die Hotels',
    wordType: 'noun',
    translation: { en: 'hotel', bg: 'хотел' },
    pronunciation: { en: 'ho-TEL', bg: 'хо-ТЕЛ' },
    example: {
      de: 'Das Hotel war sehr gut.',
      gloss: { en: 'The hotel was very good.', bg: 'Хотелът беше много добър.' },
    },
    tags: ['travel'],
    level: 'a2',
    unitId: U,
    lessonId: L2,
    difficulty: 1,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — telling the story
 * ------------------------------------------------------------------ */

const STORY: VocabEntry[] = [
  {
    id: 'v-frueher',
    german: 'früher',
    display: 'früher',
    wordType: 'adverb',
    translation: { en: 'in the past, back then', bg: 'едно време, преди' },
    pronunciation: { en: 'FRUE-er', bg: 'ФРЮ-ер' },
    example: {
      de: 'Früher hatte ich mehr Zeit.',
      gloss: { en: 'I used to have more time.', bg: 'Едно време имах повече време.' },
    },
    tags: ['time', 'past'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'This is how German says "used to": früher plus an ordinary past tense. There is no separate construction for it.',
      bg: 'Така немският казва „едно време“: früher плюс обикновено минало време. Отделна конструкция за това няма.',
    },
  },
  {
    id: 'v-passieren',
    german: 'passieren',
    display: 'passieren',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'passiert' },
    translation: { en: 'to happen', bg: 'случвам се' },
    pronunciation: { en: 'pa-SEE-ren', bg: 'па-СИ-рен' },
    example: {
      de: 'Was ist passiert?',
      gloss: { en: 'What happened?', bg: 'Какво стана?' },
    },
    tags: ['events'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Two things at once: it takes sein (a change of state), and being an -ieren verb it builds its participle with no ge- — passiert, not gepassiert.',
      bg: 'Две неща наведнъж: взима sein (промяна на състояние) и, като глагол на -ieren, прави причастието си без ge- — passiert, не gepassiert.',
    },
  },
  {
    id: 'v-das-konzert',
    german: 'Konzert',
    display: 'das Konzert',
    article: 'das',
    gender: 'n',
    plural: 'die Konzerte',
    wordType: 'noun',
    translation: { en: 'concert', bg: 'концерт' },
    pronunciation: { en: 'kon-TSERT', bg: 'кон-ЦЕРТ' },
    example: {
      de: 'Das Konzert war super.',
      gloss: { en: 'The concert was great.', bg: 'Концертът беше супер.' },
    },
    tags: ['leisure'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-super',
    german: 'super',
    display: 'super',
    wordType: 'adjective',
    translation: { en: 'great, brilliant', bg: 'супер, страхотно' },
    pronunciation: { en: 'ZOO-per', bg: 'ЗУ-пер' },
    example: {
      de: 'Das Wochenende war super.',
      gloss: { en: 'The weekend was great.', bg: 'Уикендът беше супер.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
    notes: {
      en: 'Note the pronunciation: German s before a vowel is a z sound, so it is "zooper", not "sooper".',
      bg: 'Внимавай с произношението: немското s пред гласна звучи като „з“, така че е „зупер“, не „супер“.',
    },
  },
  {
    id: 'v-langweilig',
    german: 'langweilig',
    display: 'langweilig',
    wordType: 'adjective',
    translation: { en: 'boring', bg: 'скучен, скучно' },
    pronunciation: { en: 'LANG-vy-lish', bg: 'ЛАНГ-вай-лих' },
    example: {
      de: 'Der Film war langweilig.',
      gloss: { en: 'The film was boring.', bg: 'Филмът беше скучен.' },
    },
    tags: ['opinion'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'lang + Weile, "long while" — which is exactly what being bored feels like. German builds a surprising number of its adjectives this transparently.',
      bg: 'lang + Weile, „дълго време“ — точно това е усещането от скуката. Немският строи изненадващо много прилагателни толкова прозрачно.',
    },
  },
  {
    id: 'v-der-film',
    german: 'Film',
    display: 'der Film',
    article: 'der',
    gender: 'm',
    plural: 'die Filme',
    wordType: 'noun',
    translation: { en: 'film, movie', bg: 'филм' },
    pronunciation: { en: 'film', bg: 'филм' },
    example: {
      de: 'Ich habe einen Film gesehen.',
      gloss: { en: 'I watched a film.', bg: 'Гледах филм.' },
    },
    tags: ['leisure'],
    level: 'a2',
    unitId: U,
    lessonId: L3,
    difficulty: 1,
    related: ['v-kino'],
  },
];

export const PAST_VOCAB: VocabEntry[] = [...TIME, ...MOVEMENT, ...STORY];
