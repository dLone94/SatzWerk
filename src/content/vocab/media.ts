import type { VocabEntry } from '../types.ts';

/**
 * Media and society (B2 Unit 3).
 *
 * The first unit in the course whose language the learner will mostly *read*
 * rather than say. That changes what belongs in the vocabulary: these are the
 * words that carry a newspaper paragraph, and several of them are nearly
 * useless in conversation — nobody says *Die Zahl der Beschäftigten ist um
 * drei Prozent gestiegen* over dinner.
 *
 * Three groups, one per lesson.
 *
 * **The news itself** (lesson 1): Schlagzeile, Reform, Regierung, Maßnahme,
 * umstritten. These are the nouns that the long pre-nominal participle blocks
 * are built around — *die von der Regierung geplante Reform* — so they arrive
 * in the same lesson as the structure.
 *
 * **Numbers** (lesson 2): steigen and sinken with their prepositions, der
 * Anteil, durchschnittlich, betragen. German reports a change with *um* and a
 * new level with *auf*, and the pair is the whole grammar of a statistic.
 *
 * **Consequences** (lesson 3): die Auswirkung, die Folge, sich auswirken,
 * zunehmen. The vocabulary of what a change does to people, which is what an
 * opinion piece is actually about.
 *
 * Two pairs are worth the space:
 *
 * - **Prozent and Prozentpunkt.** From 4% to 6% is two percentage points and a
 *   fifty percent increase, and German keeps the two words rigorously apart
 *   where casual English blurs them.
 * - **die Folge and die Auswirkung.** A Folge follows; an Auswirkung acts on
 *   something. A journalist picks deliberately between them.
 */

const U = 'b2-u3';
const L1 = 'b2-u3-l1';
const L2 = 'b2-u3-l2';
const L3 = 'b2-u3-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the news
 * ------------------------------------------------------------------ */

const NEWS: VocabEntry[] = [
  {
    id: 'v-die-schlagzeile',
    german: 'Schlagzeile',
    display: 'die Schlagzeile',
    article: 'die',
    gender: 'f',
    plural: 'die Schlagzeilen',
    wordType: 'noun',
    translation: { en: 'headline', bg: 'заглавие (във вестник)' },
    pronunciation: { en: 'SHLAHK-tsy-luh', bg: 'ШЛАГ-цай-ле' },
    example: {
      de: 'Die Schlagzeile stand auf der ersten Seite.',
      gloss: {
        en: 'The headline was on the front page.',
        bg: 'Заглавието беше на първа страница.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
  {
    id: 'v-die-regierung',
    german: 'Regierung',
    display: 'die Regierung',
    article: 'die',
    gender: 'f',
    plural: 'die Regierungen',
    wordType: 'noun',
    translation: { en: 'government', bg: 'правителство' },
    pronunciation: { en: 'ruh-GEE-rung', bg: 'ре-ГИ-рунг' },
    example: {
      de: 'Die Regierung hat eine neue Reform angekündigt.',
      gloss: {
        en: 'The government has announced a new reform.',
        bg: 'Правителството обяви нова реформа.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'Feminine, like every -ung noun from Unit 1 — and note the gender mismatch: Regierung is feminine where "government" is nothing and „правителство“ is neuter.',
      bg: 'От женски род, както всяко съществително на -ung от раздел 1 — и внимавай с разминаването: Regierung е от женски род, а „правителство“ е от среден.',
    },
  },
  {
    id: 'v-die-reform',
    german: 'Reform',
    display: 'die Reform',
    article: 'die',
    gender: 'f',
    plural: 'die Reformen',
    wordType: 'noun',
    translation: { en: 'reform', bg: 'реформа' },
    pronunciation: { en: 'ruh-FORM', bg: 'ре-ФОРМ' },
    example: {
      de: 'Die von der Regierung geplante Reform ist umstritten.',
      gloss: {
        en: 'The reform planned by the government is contested.',
        bg: 'Планираната от правителството реформа е спорна.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
  {
    id: 'v-die-massnahme',
    german: 'Maßnahme',
    display: 'die Maßnahme',
    article: 'die',
    gender: 'f',
    plural: 'die Maßnahmen',
    wordType: 'noun',
    translation: { en: 'measure, step taken', bg: 'мярка' },
    pronunciation: { en: 'MAHSS-nah-muh', bg: 'МАС-на-ме' },
    example: {
      de: 'Die Maßnahmen treten ab Januar in Kraft.',
      gloss: {
        en: 'The measures come into force from January.',
        bg: 'Мерките влизат в сила от януари.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
  },
  {
    id: 'v-umstritten',
    german: 'umstritten',
    display: 'umstritten',
    wordType: 'adjective',
    translation: { en: 'contested, controversial', bg: 'спорен, оспорван' },
    pronunciation: { en: 'oom-SHTRIT-en', bg: 'ум-ЩРИ-тен' },
    example: {
      de: 'Der Vorschlag ist in der Öffentlichkeit umstritten.',
      gloss: {
        en: 'The proposal is contested in public.',
        bg: 'Предложението е спорно в обществото.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Literally a participle — "fought over" — used as an adjective. German newspapers use it where English would say "controversial", and it is milder: it reports a dispute rather than taking a side in one.',
      bg: 'Буквално причастие — „оспорван“ — употребено като прилагателно. Немските вестници го използват там, където българският би казал „спорен“: съобщава спор, без да заема страна в него.',
    },
  },
  {
    id: 'v-veroeffentlichen',
    german: 'veröffentlichen',
    display: 'veröffentlichen',
    wordType: 'verb',
    translation: { en: 'to publish', bg: 'да публикувам' },
    pronunciation: { en: 'fair-URF-ent-likh-en', bg: 'фер-ЬОФ-ент-ли-хен' },
    example: {
      de: 'Die Studie wurde gestern veröffentlicht.',
      gloss: {
        en: 'The study was published yesterday.',
        bg: 'Изследването беше публикувано вчера.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'veröffentlicht' },
  },
  {
    id: 'v-die-quelle',
    german: 'Quelle',
    display: 'die Quelle',
    article: 'die',
    gender: 'f',
    plural: 'die Quellen',
    wordType: 'noun',
    translation: { en: 'source', bg: 'източник' },
    pronunciation: { en: 'KVEL-uh', bg: 'КВЕ-ле' },
    example: {
      de: 'Die Zeitung nennt keine Quelle.',
      gloss: {
        en: 'The newspaper gives no source.',
        bg: 'Вестникът не посочва източник.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — numbers
 * ------------------------------------------------------------------ */

const NUMBERS: VocabEntry[] = [
  {
    id: 'v-steigen',
    german: 'steigen',
    display: 'steigen',
    wordType: 'verb',
    translation: { en: 'to rise, to climb', bg: 'да се покачва, да расте' },
    pronunciation: { en: 'SHTY-gen', bg: 'ЩАЙ-ген' },
    example: {
      de: 'Die Mieten sind um zehn Prozent gestiegen.',
      gloss: {
        en: 'Rents have risen by ten percent.',
        bg: 'Наемите са се покачили с десет процента.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'sein', participle: 'gestiegen' },
    notes: {
      en: 'Takes sein, because it is a change of state — the same rule as at A2. And it is intransitive: prices rise, nobody rises them. To put prices up is erhöhen.',
      bg: 'Изисква sein, защото е промяна на състоянието — същото правило като в A2. И е непреходен: цените се покачват, никой не ги покачва. „Да повишиш цените“ е erhöhen.',
    },
  },
  {
    id: 'v-sinken',
    german: 'sinken',
    display: 'sinken',
    wordType: 'verb',
    translation: { en: 'to fall, to sink', bg: 'да спада, да намалява' },
    pronunciation: { en: 'ZINK-en', bg: 'ЗИН-кен' },
    example: {
      de: 'Die Zahl der Anträge ist deutlich gesunken.',
      gloss: {
        en: 'The number of applications has fallen significantly.',
        bg: 'Броят на заявленията е намалял значително.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'sein', participle: 'gesunken' },
    related: ['v-steigen'],
  },
  {
    id: 'v-betragen',
    german: 'betragen',
    display: 'betragen',
    wordType: 'verb',
    translation: { en: 'to amount to, to come to', bg: 'да възлиза на' },
    pronunciation: { en: 'buh-TRAH-gen', bg: 'бе-ТРА-ген' },
    example: {
      de: 'Der Anteil beträgt knapp dreißig Prozent.',
      gloss: {
        en: 'The share amounts to just under thirty percent.',
        bg: 'Делът възлиза на близо трийсет процента.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'betragen' },
    notes: {
      en: 'The participle is identical to the infinitive: hat betragen. A small group of verbs with an unstressed prefix on a strong stem behaves this way.',
      bg: 'Причастието съвпада с инфинитива: hat betragen. Малка група глаголи с неударена представка върху силна основа се държат така.',
    },
  },
  {
    id: 'v-der-anteil',
    german: 'Anteil',
    display: 'der Anteil',
    article: 'der',
    gender: 'm',
    plural: 'die Anteile',
    wordType: 'noun',
    translation: { en: 'share, proportion', bg: 'дял' },
    pronunciation: { en: 'AN-tile', bg: 'АН-тайл' },
    example: {
      de: 'Der Anteil der Frauen in der Firma ist gestiegen.',
      gloss: {
        en: 'The proportion of women in the company has risen.',
        bg: 'Делът на жените във фирмата се е повишил.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-durchschnittlich',
    german: 'durchschnittlich',
    display: 'durchschnittlich',
    wordType: 'adjective',
    translation: { en: 'average, on average', bg: 'среден, средно' },
    pronunciation: { en: 'DOORKH-shnit-likh', bg: 'ДУРХ-шнит-лих' },
    example: {
      de: 'Die Miete beträgt durchschnittlich 900 Euro.',
      gloss: {
        en: 'The rent is on average 900 euros.',
        bg: 'Наемът възлиза средно на 900 евро.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-die-studie',
    german: 'Studie',
    display: 'die Studie',
    article: 'die',
    gender: 'f',
    plural: 'die Studien',
    wordType: 'noun',
    translation: { en: 'study', bg: 'изследване, проучване' },
    pronunciation: { en: 'SHTOO-dee-uh', bg: 'ЩУ-ди-е' },
    example: {
      de: 'Laut einer Studie arbeiten viele lieber im Homeoffice.',
      gloss: {
        en: 'According to a study, many prefer to work from home.',
        bg: 'Според едно проучване мнозина предпочитат да работят от вкъщи.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'Not das Studium, which is what you do at university. eine Studie is a piece of research; das Studium is a degree course.',
      bg: 'Не е das Studium — това е следването в университет. eine Studie е изследване; das Studium е висше образование.',
    },
  },
  {
    id: 'v-die-umfrage',
    german: 'Umfrage',
    display: 'die Umfrage',
    article: 'die',
    gender: 'f',
    plural: 'die Umfragen',
    wordType: 'noun',
    translation: { en: 'survey, poll', bg: 'анкета' },
    pronunciation: { en: 'OOM-frah-guh', bg: 'УМ-фра-ге' },
    example: {
      de: 'In der Umfrage waren zwei Drittel dagegen.',
      gloss: {
        en: 'In the survey two thirds were against it.',
        bg: 'В анкетата две трети бяха против.',
      },
    },
    tags: ['media'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — consequences
 * ------------------------------------------------------------------ */

const CONSEQUENCES: VocabEntry[] = [
  {
    id: 'v-die-auswirkung',
    german: 'Auswirkung',
    display: 'die Auswirkung',
    article: 'die',
    gender: 'f',
    plural: 'die Auswirkungen',
    wordType: 'noun',
    translation: { en: 'effect, impact', bg: 'въздействие' },
    pronunciation: { en: 'OWS-veer-kung', bg: 'АУС-вир-кунг' },
    example: {
      de: 'Die Reform hat Auswirkungen auf alle Mieter.',
      gloss: {
        en: 'The reform has effects on all tenants.',
        bg: 'Реформата има въздействие върху всички наематели.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-die-folge'],
    collocations: [
      { de: 'Auswirkungen auf etwas haben', gloss: { en: 'to have an impact on something', bg: 'да има въздействие върху нещо' } },
    ],
  },
  {
    id: 'v-die-folge',
    german: 'Folge',
    display: 'die Folge',
    article: 'die',
    gender: 'f',
    plural: 'die Folgen',
    wordType: 'noun',
    translation: { en: 'consequence, result', bg: 'последица' },
    pronunciation: { en: 'FOL-guh', bg: 'ФОЛ-ге' },
    example: {
      de: 'Die Folgen sind noch nicht absehbar.',
      gloss: {
        en: 'The consequences cannot be foreseen yet.',
        bg: 'Последиците още не могат да се предвидят.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-die-auswirkung'],
    notes: {
      en: 'A Folge follows something; an Auswirkung acts on something. Journalists choose between them deliberately, and so should you.',
      bg: 'Folge следва нещо; Auswirkung действа върху нещо. Журналистите избират съзнателно между двете, и ти също трябва.',
    },
  },
  {
    id: 'v-zunehmen',
    german: 'zunehmen',
    display: 'zunehmen',
    wordType: 'verb',
    translation: { en: 'to increase, to grow', bg: 'да се увеличава' },
    pronunciation: { en: 'TSOO-nay-men', bg: 'ЦУ-не-мен' },
    example: {
      de: 'Die Kritik an der Reform nimmt zu.',
      gloss: {
        en: 'Criticism of the reform is increasing.',
        bg: 'Критиката към реформата се засилва.',
      },
    },
    tags: ['media', 'numbers'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'zugenommen' },
    notes: {
      en: 'Also what you say about your own weight — Ich habe zugenommen — which is worth knowing before somebody says it to you.',
      bg: 'Същият глагол се използва и за собственото тегло — Ich habe zugenommen — добре е да го знаеш, преди някой да ти го каже.',
    },
  },
  {
    id: 'v-die-oeffentlichkeit',
    german: 'Öffentlichkeit',
    display: 'die Öffentlichkeit',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'the public', bg: 'общественост' },
    pronunciation: { en: 'URF-ent-likh-kite', bg: 'ЬОФ-ент-лих-кайт' },
    example: {
      de: 'In der Öffentlichkeit wird darüber viel diskutiert.',
      gloss: {
        en: 'It is much discussed in public.',
        bg: 'В обществото се дискутира много по този въпрос.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'Every -keit noun is feminine, like every -heit and every -ung. Three endings, three free genders.',
      bg: 'Всяко съществително на -keit е от женски род, както всяко на -heit и всяко на -ung. Три окончания, три безплатни рода.',
    },
  },
  {
    id: 'v-die-kritik',
    german: 'Kritik',
    display: 'die Kritik',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'criticism', bg: 'критика' },
    pronunciation: { en: 'kri-TEEK', bg: 'кри-ТИК' },
    example: {
      de: 'Die Kritik kommt vor allem von den Mietern.',
      gloss: {
        en: 'The criticism comes above all from the tenants.',
        bg: 'Критиката идва преди всичко от наемателите.',
      },
    },
    tags: ['media', 'society'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    collocations: [
      { de: 'Kritik an etwas üben', gloss: { en: 'to criticise something', bg: 'да отправя критика към нещо' } },
    ],
  },
  {
    id: 'v-machbar',
    german: 'machbar',
    display: 'machbar',
    wordType: 'adjective',
    translation: { en: 'doable, feasible', bg: 'осъществим' },
    pronunciation: { en: 'MAHKH-bar', bg: 'МАХ-бар' },
    example: {
      de: 'Der Zeitplan ist machbar.',
      gloss: {
        en: 'The schedule is doable.',
        bg: 'Графикът е осъществим.',
      },
    },
    tags: ['media', 'argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'The -bar ending is German’s -able: machbar, lesbar, absehbar, bezahlbar. It packs "can be done" into one adjective, which is why it is everywhere in headlines.',
      bg: 'Окончанието -bar е немското „-им“: machbar, lesbar, absehbar, bezahlbar. Събира „може да бъде направено“ в едно прилагателно — затова е навсякъде в заглавията.',
    },
  },
];

export const MEDIA_VOCAB: VocabEntry[] = [...NEWS, ...NUMBERS, ...CONSEQUENCES];
