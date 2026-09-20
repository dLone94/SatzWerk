import type { VocabEntry } from '../types.ts';

/**
 * Family, school and daily life (B1 Unit 5).
 *
 * A2 taught the family as a list of people. This unit is about the
 * institutions they move through, which in Germany means a school system with
 * a vocabulary that does not translate — *Kita*, *Grundschule*, *Gymnasium*,
 * *Ausbildung* — and a set of words that decide a child's path at the age of
 * ten.
 *
 * That last point is why these words are worth the space. A German parent is
 * asked, at the end of the fourth school year, which kind of secondary school
 * their child will go to, and the answer shapes everything afterwards. A
 * learner who cannot follow that conversation cannot take part in one of the
 * most consequential decisions of their family's life in the country.
 *
 * The rest are the words a story needs. This is the unit where the past is
 * told rather than reported — *als ich klein war*, *früher*, *damals* — and
 * the time expressions arrive with the tense that needs them.
 */

const U = 'b1-u5';
const L1 = 'b1-u5-l1';
const L2 = 'b1-u5-l2';
const L3 = 'b1-u5-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — telling a story about before
 * ------------------------------------------------------------------ */

const NARRATING: VocabEntry[] = [
  {
    id: 'v-damals',
    german: 'damals',
    display: 'damals',
    wordType: 'adverb',
    translation: { en: 'back then, at that time', bg: 'тогава, по онова време' },
    pronunciation: { en: 'DAH-mahls', bg: 'ДА-малс' },
    example: {
      de: 'Damals wohnten wir noch in Bulgarien.',
      gloss: { en: 'Back then we still lived in Bulgaria.', bg: 'Тогава още живеехме в България.' },
    },
    tags: ['time'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-frueher'],
    notes: {
      en: 'Points at a specific past time the listener already knows about. früher is vaguer — "in the old days" — and damals is "then, when that was happening".',
      bg: 'Сочи към конкретно минало време, което слушателят вече знае. früher е по-разтегливо — „едно време“ — а damals е „тогава, когато това се случваше“.',
    },
  },
  {
    id: 'v-die-kindheit',
    german: 'Kindheit',
    display: 'die Kindheit',
    article: 'die',
    gender: 'f',
    plural: 'die Kindheiten',
    wordType: 'noun',
    translation: { en: 'childhood', bg: 'детство' },
    pronunciation: { en: 'KINT-hite', bg: 'КИНТ-хайт' },
    example: {
      de: 'In meiner Kindheit hatten wir keinen Fernseher.',
      gloss: {
        en: 'In my childhood we did not have a television.',
        bg: 'В детството ми нямахме телевизор.',
      },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Kind + -heit. The -heit ending turns an idea into an abstract noun and is always feminine: die Freiheit, die Gesundheit, die Kindheit. One ending, one gender, hundreds of words.',
      bg: 'Kind + -heit. Окончанието -heit превръща идея в абстрактно съществително и винаги е от женски род: die Freiheit, die Gesundheit, die Kindheit. Едно окончание, един род, стотици думи.',
    },
  },
  {
    id: 'v-sich-erinnern',
    german: 'sich erinnern an',
    display: 'sich erinnern an',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'erinnert' },
    translation: { en: 'to remember', bg: 'спомням си' },
    pronunciation: { en: 'zikh er-IN-ern an', bg: 'зих ер-И-нерн ан' },
    example: {
      de: 'Ich erinnere mich an meinen ersten Schultag.',
      gloss: { en: 'I remember my first day at school.', bg: 'Спомням си първия си учебен ден.' },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    notes: {
      en: 'Reflexive, and the preposition is an plus the accusative. Another fixed pairing to learn whole, like the ones in Unit 4.',
      bg: 'Възвратен, а предлогът е an плюс винителен. Още една закована двойка, която се учи цяла, като тези от раздел 4.',
    },
  },
  {
    id: 'v-der-schultag',
    german: 'Schultag',
    display: 'der Schultag',
    article: 'der',
    gender: 'm',
    plural: 'die Schultage',
    wordType: 'noun',
    translation: { en: 'school day', bg: 'учебен ден' },
    pronunciation: { en: 'SHOOL-tahk', bg: 'ШУЛ-таг' },
    example: {
      de: 'Der erste Schultag war sehr aufregend.',
      gloss: { en: 'The first day at school was very exciting.', bg: 'Първият учебен ден беше много вълнуващ.' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'German children start school with a Schultüte — a large paper cone full of sweets and small presents, carried on the first day and photographed every time.',
      bg: 'Немските деца тръгват на училище със Schultüte — голям хартиен конус, пълен със сладки и малки подаръци, носен на първия ден и снимкан всеки път.',
    },
  },
  {
    id: 'v-aufwachsen',
    german: 'aufwachsen',
    display: 'aufwachsen',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'aufgewachsen' },
    translation: { en: 'to grow up', bg: 'израствам' },
    pronunciation: { en: 'OWF-vak-sen', bg: 'АУФ-вак-сен' },
    example: {
      de: 'Ich bin in einer kleinen Stadt aufgewachsen.',
      gloss: { en: 'I grew up in a small town.', bg: 'Израснах в малък град.' },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Takes sein, because growing up is a change of state — the same reason as werden and umziehen.',
      bg: 'Взима sein, защото израстването е промяна на състоянието — същата причина като при werden и umziehen.',
    },
  },
  {
    id: 'v-die-erinnerung',
    german: 'Erinnerung',
    display: 'die Erinnerung',
    article: 'die',
    gender: 'f',
    plural: 'die Erinnerungen',
    wordType: 'noun',
    translation: { en: 'memory', bg: 'спомен' },
    pronunciation: { en: 'er-IN-er-oong', bg: 'ер-И-не-рунг' },
    example: {
      de: 'Das ist eine schöne Erinnerung.',
      gloss: { en: 'That is a lovely memory.', bg: 'Това е хубав спомен.' },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-sich-erinnern'],
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the German school system
 * ------------------------------------------------------------------ */

const SCHOOL: VocabEntry[] = [
  {
    id: 'v-die-kita',
    german: 'Kita',
    display: 'die Kita',
    article: 'die',
    gender: 'f',
    plural: 'die Kitas',
    wordType: 'noun',
    translation: { en: 'day nursery, kindergarten', bg: 'детска градина' },
    pronunciation: { en: 'KEE-tah', bg: 'КИ-та' },
    example: {
      de: 'Wir haben schon einen Kita-Platz gefunden.',
      gloss: {
        en: 'We have already found a nursery place.',
        bg: 'Вече намерихме място в детска градина.',
      },
    },
    tags: ['school', 'family'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'Short for Kindertagesstätte. The word that matters beside it is Kita-Platz: places are scarce in the cities, and parents register long before the child is born.',
      bg: 'Съкратено от Kindertagesstätte. Думата до нея, която има значение, е Kita-Platz: местата в градовете са малко и родителите се записват много преди детето да се роди.',
    },
  },
  {
    id: 'v-die-grundschule',
    german: 'Grundschule',
    display: 'die Grundschule',
    article: 'die',
    gender: 'f',
    plural: 'die Grundschulen',
    wordType: 'noun',
    translation: { en: 'primary school', bg: 'начално училище' },
    pronunciation: { en: 'GROONT-shoo-luh', bg: 'ГРУНТ-шу-ле' },
    example: {
      de: 'Die Grundschule dauert vier Jahre.',
      gloss: { en: 'Primary school lasts four years.', bg: 'Началното училище трае четири години.' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'Four years in most of Germany, six in Berlin and Brandenburg. At the end of it the decision about secondary school is made — which is unusually early by European standards.',
      bg: 'Четири години в по-голямата част от Германия, шест в Берлин и Бранденбург. В края му се взима решението за средното училище — необичайно рано по европейските мерки.',
    },
  },
  {
    id: 'v-das-gymnasium',
    german: 'Gymnasium',
    display: 'das Gymnasium',
    article: 'das',
    gender: 'n',
    plural: 'die Gymnasien',
    wordType: 'noun',
    translation: { en: 'academic secondary school', bg: 'гимназия' },
    pronunciation: { en: 'guem-NAH-zee-oom', bg: 'гюм-НА-зи-ум' },
    example: {
      de: 'Als ich zehn war, kam ich aufs Gymnasium.',
      gloss: { en: 'When I was ten I went to the Gymnasium.', bg: 'Когато бях на десет, отидох в гимназия.' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The academic track, ending in the Abitur, which is what university entrance requires. Note it is not a sports hall — that is die Turnhalle.',
      bg: 'Академичният път, завършващ с Abitur, което е нужно за университет. Забележи, че не е спортна зала — това е die Turnhalle.',
    },
  },
  {
    id: 'v-das-abitur',
    german: 'Abitur',
    display: 'das Abitur',
    article: 'das',
    gender: 'n',
    plural: 'die Abiture',
    wordType: 'noun',
    translation: { en: 'school-leaving exam for university', bg: 'зрелостен изпит, матура' },
    pronunciation: { en: 'ah-bee-TOOR', bg: 'аби-ТУР' },
    example: {
      de: 'Ohne Abitur kann man nicht studieren.',
      gloss: { en: 'Without the Abitur you cannot go to university.', bg: 'Без матура не можеш да учиш в университет.' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-das-gymnasium'],
  },
  {
    id: 'v-die-ausbildung',
    german: 'Ausbildung',
    display: 'die Ausbildung',
    article: 'die',
    gender: 'f',
    plural: 'die Ausbildungen',
    wordType: 'noun',
    translation: { en: 'vocational training', bg: 'професионално обучение' },
    pronunciation: { en: 'OWS-bil-doong', bg: 'АУС-бил-дунг' },
    example: {
      de: 'Er macht eine Ausbildung als Elektriker.',
      gloss: {
        en: 'He is doing an apprenticeship as an electrician.',
        bg: 'Той учи за електротехник.',
      },
    },
    tags: ['school', 'work'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The other respectable path, and genuinely respected: three years of paid work plus vocational school, ending in a qualification that is recognised everywhere. It is not a lesser option, and treating it as one is a common outsider’s mistake.',
      bg: 'Другият уважаван път, и наистина уважаван: три години платена работа плюс професионално училище, завършващи с призната навсякъде квалификация. Не е по-нисша опция и да се приема за такава е честа грешка на новодошлите.',
    },
  },
  {
    id: 'v-das-zeugnis',
    german: 'Zeugnis',
    display: 'das Zeugnis',
    article: 'das',
    gender: 'n',
    plural: 'die Zeugnisse',
    wordType: 'noun',
    translation: { en: 'school report, certificate', bg: 'свидетелство, бележник' },
    pronunciation: { en: 'TSOYK-nis', bg: 'ЦОЙК-нис' },
    example: {
      de: 'Das Zeugnis bekommt man am Ende des Schuljahres.',
      gloss: {
        en: 'You get the report at the end of the school year.',
        bg: 'Свидетелството се получава в края на учебната година.',
      },
    },
    tags: ['school', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Also the word for a reference from an employer — Arbeitszeugnis — which Germans keep for life and expect to be shown a copy of.',
      bg: 'Същата дума и за препоръка от работодател — Arbeitszeugnis — която германците пазят цял живот и очакват да им се покаже копие.',
    },
  },
  {
    id: 'v-die-note',
    german: 'Note',
    display: 'die Note',
    article: 'die',
    gender: 'f',
    plural: 'die Noten',
    wordType: 'noun',
    translation: { en: 'mark, grade', bg: 'оценка' },
    pronunciation: { en: 'NOH-tuh', bg: 'НО-те' },
    example: {
      de: 'Als ich in der Schule war, hatte ich gute Noten.',
      gloss: { en: 'When I was at school I had good marks.', bg: 'Когато бях в училище, имах добри оценки.' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'German marks run from 1 to 6, and **1 is the best**. This is the reverse of the Bulgarian scale, where 6 is the best — a genuinely confusing difference if nobody tells you.',
      bg: 'Немските оценки са от 1 до 6, а **1 е най-добрата**. Това е обратното на българската скала, където 6 е най-добрата — наистина объркваща разлика, ако никой не ти я каже.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — daily life, and talking to the school
 * ------------------------------------------------------------------ */

const DAILY: VocabEntry[] = [
  {
    id: 'v-der-elternabend',
    german: 'Elternabend',
    display: 'der Elternabend',
    article: 'der',
    gender: 'm',
    plural: 'die Elternabende',
    wordType: 'noun',
    translation: { en: 'parents’ evening', bg: 'родителска среща' },
    pronunciation: { en: 'EL-tern-ah-bent', bg: 'ЕЛ-терн-абенд' },
    example: {
      de: 'Der Elternabend findet am Dienstag statt.',
      gloss: { en: 'The parents’ evening takes place on Tuesday.', bg: 'Родителската среща е във вторник.' },
    },
    tags: ['school', 'family'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-stattfinden',
    german: 'stattfinden',
    display: 'stattfinden',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'stattgefunden' },
    translation: { en: 'to take place', bg: 'провежда се, състои се' },
    pronunciation: { en: 'SHTAT-fin-den', bg: 'ЩАТ-фин-ден' },
    example: {
      de: 'Das Treffen findet um achtzehn Uhr statt.',
      gloss: { en: 'The meeting takes place at six o’clock.', bg: 'Срещата се провежда в осемнайсет часа.' },
    },
    tags: ['time'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Separable, and it appears in every announcement, invitation and school letter you will get. "Findet statt" means it is happening; "fällt aus" means it is cancelled.',
      bg: 'Отделяем и се появява във всяко обявление, покана и училищно писмо, което ще получиш. „Findet statt“ значи, че ще се проведе; „fällt aus“ значи, че се отменя.',
    },
  },
  {
    id: 'v-die-hausaufgaben',
    german: 'Hausaufgaben',
    display: 'die Hausaufgaben',
    article: 'die',
    gender: 'f',
    plural: 'die Hausaufgaben',
    wordType: 'noun',
    translation: { en: 'homework', bg: 'домашни' },
    pronunciation: { en: 'HOWS-owf-gah-ben', bg: 'ХАУС-ауф-габен' },
    example: {
      de: 'Hast du schon deine Hausaufgaben gemacht?',
      gloss: { en: 'Have you done your homework yet?', bg: 'Направи ли си вече домашните?' },
    },
    tags: ['school'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Plural in German, where English treats homework as uncountable. "Die Hausaufgaben machen" — you *make* them, not do them.',
      bg: 'В немския е в множествено число, за разлика от английското неизброимо homework. „Die Hausaufgaben machen“ — на немски ги „правиш“ със същия глагол като на български.',
    },
  },
  {
    id: 'v-sich-kuemmern',
    german: 'sich kümmern um',
    display: 'sich kümmern um',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gekümmert' },
    translation: { en: 'to look after, to take care of', bg: 'грижа се за' },
    pronunciation: { en: 'zikh KUEM-ern oom', bg: 'зих КЮМ-ерн ум' },
    example: {
      de: 'Meine Mutter hat sich um uns gekümmert.',
      gloss: { en: 'My mother looked after us.', bg: 'Майка ми се грижеше за нас.' },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'um plus the accusative, and it is the everyday word for handling something as well as caring for someone: "Ich kümmere mich darum" — I will deal with it.',
      bg: 'um плюс винителен, и е всекидневната дума и за „заемам се с нещо“, не само за грижа за някого: „Ich kümmere mich darum“ — аз ще се погрижа.',
    },
  },
  {
    id: 'v-der-alltag',
    german: 'Alltag',
    display: 'der Alltag',
    article: 'der',
    gender: 'm',
    plural: 'die Alltage',
    wordType: 'noun',
    translation: { en: 'everyday life, daily routine', bg: 'ежедневие' },
    pronunciation: { en: 'AL-tahk', bg: 'АЛ-таг' },
    example: {
      de: 'Der Alltag mit zwei Kindern ist anstrengend.',
      gloss: {
        en: 'Everyday life with two children is exhausting.',
        bg: 'Ежедневието с две деца е изморително.',
      },
    },
    tags: ['family'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'all + Tag, "all-day", and it means the ordinary run of things rather than any one day. German loves this word and uses it where English says "day-to-day".',
      bg: 'all + Tag, „всекидневие“. Немският обича тази дума и я използва там, където английският казва „day-to-day“.',
    },
  },
  {
    id: 'v-anstrengend',
    german: 'anstrengend',
    display: 'anstrengend',
    wordType: 'adjective',
    translation: { en: 'exhausting, demanding', bg: 'изморителен, напрегнат' },
    pronunciation: { en: 'AN-shtreng-ent', bg: 'АН-щренг-енд' },
    example: {
      de: 'Die Woche war sehr anstrengend.',
      gloss: { en: 'The week was very exhausting.', bg: 'Седмицата беше много изморителна.' },
    },
    tags: ['description'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-die-betreuung',
    german: 'Betreuung',
    display: 'die Betreuung',
    article: 'die',
    gender: 'f',
    plural: 'die Betreuungen',
    wordType: 'noun',
    translation: { en: 'childcare, supervision', bg: 'гледане, наглеждане' },
    pronunciation: { en: 'buh-TROY-oong', bg: 'бе-ТРОЙ-унг' },
    example: {
      de: 'Die Betreuung endet um sechzehn Uhr.',
      gloss: { en: 'The childcare ends at four o’clock.', bg: 'Гледането свършва в шестнайсет часа.' },
    },
    tags: ['school', 'family'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'The word on every nursery and after-school form. German primary schools often finish at lunchtime, and Betreuung is the paid supervision that covers the afternoon — which is why working parents ask about it first.',
      bg: 'Думата във всеки формуляр за градина и занималня. Немските начални училища често свършват на обяд, а Betreuung е платеното наглеждане следобед — затова работещите родители питат първо за него.',
    },
  },
];

export const FAMILY2_VOCAB: VocabEntry[] = [...NARRATING, ...SCHOOL, ...DAILY];
