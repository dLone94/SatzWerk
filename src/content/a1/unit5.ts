import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  nounWithArticle,
  partialRecall,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * A1 Unit 5 — Getting around town.
 *
 * The dative arrives here, and it is the step where beginners stall. Two
 * decisions keep it survivable.
 *
 * First, the scope is tiny: three prepositions that always take it, singular
 * only, no two-way rules and no dative plural. "mit dem Bus zum Bahnhof" is the
 * whole target. Second, the places in Lesson 1 are chosen so that saying where
 * you are going *is* the practice — every noun in the unit is somewhere you go
 * to or travel by, so the form is repeated dozens of times without a single
 * exercise that exists only to drill it.
 *
 * Both paths are given an anchor instead of a warning, because both languages
 * kept a dative in one place: Bulgarian in the clitics (ми, ти, му — and „брат
 * ми“, which the learner met in Unit 1 without being told what it was), English
 * in "give him the book".
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-wo-ist',
    template: 'Wo ist ___?',
    example: 'Wo ist der Bahnhof?',
    gloss: bi('Where is the ___?', 'Къде е ___?'),
    level: 'a1',
  },
  {
    id: 'p-mit-dem',
    template: 'Ich fahre mit ___ ___.',
    example: 'Ich fahre mit dem Bus.',
    gloss: bi('I go by ___.', 'Пътувам с ___.'),
    level: 'a1',
    grammarIds: ['g-dative-basics'],
  },
  {
    id: 'p-ich-gehe-zum',
    template: 'Ich gehe zu___ ___.',
    example: 'Ich gehe zum Bahnhof.',
    gloss: bi('I am going to the ___.', 'Отивам до ___.'),
    level: 'a1',
    grammarIds: ['g-zum-zur'],
  },
  {
    id: 'p-wie-komme-ich',
    template: 'Wie komme ich zu___ ___?',
    example: 'Wie komme ich zum Museum?',
    gloss: bi('How do I get to the ___?', 'Как да стигна до ___?'),
    level: 'a1',
    grammarIds: ['g-zum-zur'],
  },
];

/* ================================================================== *
 * Lesson 1 — places
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u5-l1',
  unitId: 'a1-u5',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Places in town', 'Места в града'),
  objective: bi(
    'After this lesson you will be able to name the places you need in a town and ask where one is.',
    'След този урок ще можеш да назовеш местата, които ти трябват в града, и да попиташ къде е някое от тях.',
  ),
  outcomes: [
    bi('I can name the main places in a town.', 'Мога да назова основните места в града.'),
    bi('I can ask where something is.', 'Мога да попитам къде е нещо.'),
    bi('I can say something is here or there.', 'Мога да кажа, че нещо е тук или там.'),
    bi('I know these words with their articles, which the next lesson needs.', 'Знам тези думи с членовете им, което следващият урок изисква.'),
  ],
  vocabIds: [
    'v-bahnhof',
    'v-haltestelle',
    'v-strasse',
    'v-apotheke',
    'v-post',
    'v-bank',
    'v-kino',
    'v-restaurant',
    'v-park',
    'v-museum',
    'v-hier',
    'v-dort',
  ],
  grammarIds: [],
  sections: [
    {
      id: 'a1u5l1-intro',
      kind: 'intro',
      title: bi('Learn these with their articles', 'Учи ги заедно с членовете'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This looks like an ordinary vocabulary lesson and it is not. The next lesson asks you to say where you are going, and German decides the form of that sentence from the gender of the place. Every article you learn now saves you a decision later.',
            'Това изглежда като обикновен урок по лексика, но не е. Следващият урок иска да кажеш къде отиваш, а немският решава формата на това изречение според рода на мястото. Всеки член, който научиш сега, ти спестява решение по-късно.',
          ),
        },
      ],
    },
    {
      id: 'a1u5l1-vocab',
      kind: 'vocabulary',
      title: bi('Around town', 'Из града'),
      vocabIds: [
        'v-bahnhof',
        'v-haltestelle',
        'v-strasse',
        'v-apotheke',
        'v-post',
        'v-bank',
        'v-kino',
        'v-restaurant',
        'v-park',
        'v-museum',
      ],
      blocks: [
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Родовете тук се разминават често: „гара“ е женски, а der Bahnhof е мъжки; „музей“ е мъжки, а das Museum е среден. Ако превеждаш рода от българския, ще сгрешиш точно на местата, които ще ти трябват най-често.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['en'],
          text: bi(
            'Two of these are compounds you can take apart: Bahnhof is railway-yard, Haltestelle is stopping-place. The gender comes from the last part, as always.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a1u5l1-asking',
      kind: 'examples',
      title: bi('Asking where', 'Да попиташ къде'),
      blocks: [
        { t: 'de', de: 'Wo ist der Bahnhof?', gloss: bi('Where is the station?', 'Къде е гарата?') },
        { t: 'de', de: 'Wo ist die Apotheke?', gloss: bi('Where is the pharmacy?', 'Къде е аптеката?') },
        { t: 'de', de: 'Das Kino ist dort.', gloss: bi('The cinema is there.', 'Киното е там.') },
        { t: 'de', de: 'Die Haltestelle ist hier.', gloss: bi('The stop is here.', 'Спирката е тук.') },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'The article after Wo ist is the ordinary one you learnt with the word — nothing changes yet. That comes in the next lesson.',
            'Членът след Wo ist е обикновеният, който си научил с думата — засега нищо не се мени. Това идва в следващия урок.',
          ),
        },
      ],
    },
    {
      id: 'a1u5l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('der Bahnhof, der Park — masculine.', 'der Bahnhof, der Park — мъжки род.'),
            bi('die Post, die Bank, die Apotheke, die Haltestelle, die Straße — feminine.', 'die Post, die Bank, die Apotheke, die Haltestelle, die Straße — женски род.'),
            bi('das Kino, das Restaurant, das Museum — neuter.', 'das Kino, das Restaurant, das Museum — среден род.'),
            bi('Wo ist ...? asks where something is.', 'Wo ist ...? пита къде е нещо.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      nounWithArticle('a1u5l1-ex1', bi('With the article', 'С члена'), [
        { prompt: bi('railway station', 'гара'), bare: 'Bahnhof', withArticle: 'der Bahnhof', vocabId: 'v-bahnhof', hint: bi('Masculine, although it is feminine in many languages.', 'Мъжки род, макар на български „гара“ да е женски.') },
        { prompt: bi('pharmacy', 'аптека'), bare: 'Apotheke', withArticle: 'die Apotheke', vocabId: 'v-apotheke' },
        { prompt: bi('cinema', 'кино'), bare: 'Kino', withArticle: 'das Kino', vocabId: 'v-kino' },
        { prompt: bi('museum', 'музей'), bare: 'Museum', withArticle: 'das Museum', vocabId: 'v-museum' },
      ]),
    ),
    a1(
      typeIt(
        'a1u5l1-ex2',
        bi('Ask where', 'Попитай къде'),
        [
          {
            prompt: bi('Where is the station?', 'Къде е гарата?'),
            answer: 'Wo ist der Bahnhof?',
            reviewTargets: ['v-bahnhof', 'p-wo-ist'],
            hints: [],
          },
          {
            prompt: bi('Where is the post office?', 'Къде е пощата?'),
            answer: 'Wo ist die Post?',
            reviewTargets: ['v-post'],
            hints: [],
          },
          {
            prompt: bi('The bank is next to the post office.', 'Банката е до пощата.'),
            answer: 'Die Bank ist neben der Post.',
            reviewTargets: ['v-bank'],
            hints: [bi('neben takes the same form you will learn next lesson.', 'neben взима същата форма, която ще научиш в следващия урок.')],
          },
          {
            prompt: bi('The cinema is there.', 'Киното е там.'),
            answer: 'Das Kino ist dort.',
            reviewTargets: ['v-dort', 'v-kino'],
            hints: [],
          },
        ],
      ),
    ),
    a1(
      fillBlank('a1u5l1-ex3', bi('Which article?', 'Кой член?'), [
        {
          prompt: bi('The stop is here.', 'Спирката е тук.'),
          scaffold: '___ Haltestelle ist hier.',
          answer: 'Die',
          shape: 'word',
          reviewTargets: ['v-haltestelle'],
          hints: [],
        },
        {
          prompt: bi('The park is big.', 'Паркът е голям.'),
          scaffold: '___ Park ist groß.',
          answer: 'Der',
          shape: 'word',
          reviewTargets: ['v-park'],
          hints: [],
        },
        {
          prompt: bi('The restaurant is very good.', 'Ресторантът е много добър.'),
          scaffold: '___ Restaurant ist sehr gut.',
          answer: 'Das',
          shape: 'word',
          reviewTargets: ['v-restaurant'],
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u5l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wo ist die Apotheke?',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Bahnhof ist dort.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u5l1-m1', bi('Mastery: places', 'Проверка: места'), [
          {
            prompt: bi('Where is the cinema?', 'Къде е киното?'),
            answer: 'Wo ist das Kino?',
            hints: [],
          },
          {
            prompt: bi('The museum is closed today.', 'Музеят е затворен днес.'),
            answer: 'Das Museum ist heute zu.',
            hints: [],
          },
          {
            prompt: bi('The pharmacy is here.', 'Аптеката е тук.'),
            answer: 'Die Apotheke ist hier.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — the dative
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u5-l2',
  unitId: 'a1-u5',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Getting there: mit dem Bus zum Bahnhof', 'Как стигаш: mit dem Bus zum Bahnhof'),
  objective: bi(
    'After this lesson you will be able to say how you travel and where you are going, using the third form of the article after mit and zu.',
    'След този урок ще можеш да кажеш как пътуваш и къде отиваш, използвайки третата форма на члена след mit и zu.',
  ),
  outcomes: [
    bi('I can say how I travel: mit dem Bus, mit dem Auto.', 'Мога да кажа как пътувам: mit dem Bus, mit dem Auto.'),
    bi('I can say where I am going with zum and zur.', 'Мога да кажа къде отивам с zum и zur.'),
    bi('I know that feminine becomes der after mit.', 'Знам, че женският род става der след mit.'),
    bi('I know when to use gehen and when to use fahren.', 'Знам кога се използва gehen и кога fahren.'),
  ],
  vocabIds: ['v-bus', 'v-zug', 'v-auto', 'v-zu-fuss', 'v-gehen', 'v-mit', 'v-zu-prep', 'v-wie-lange'],
  grammarIds: ['g-dative-basics', 'g-zum-zur'],
  sections: [
    {
      id: 'a1u5l2-intro',
      kind: 'intro',
      title: bi('The step people stall on', 'Стъпката, на която хората засядат'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This lesson introduces a third form of the article. It has a reputation for being where beginners give up, so it is kept deliberately small here: two prepositions, singular only, and one sentence worth owning — mit dem Bus zum Bahnhof.',
            'Този урок въвежда трета форма на члена. Има славата на мястото, където начинаещите се отказват, затова тук е нарочно смалена: два предлога, само единствено число и едно изречение, което си струва да знаеш наизуст — mit dem Bus zum Bahnhof.',
          ),
        },
      ],
    },
    {
      id: 'a1u5l2-grammar',
      kind: 'grammar',
      title: bi('The third form', 'Третата форма'),
      blocks: [],
      grammarId: 'g-dative-basics',
    },
    {
      id: 'a1u5l2-zumzur',
      kind: 'grammar',
      title: bi('zum and zur', 'zum и zur'),
      blocks: [],
      grammarId: 'g-zum-zur',
    },
    {
      id: 'a1u5l2-gehen',
      kind: 'contrast',
      title: bi('gehen or fahren?', 'gehen или fahren?'),
      blocks: [
        {
          t: 'contrast',
          de: 'Ich gehe zur Post.',
          other: bi('I am going to the post office. (walking)', 'Отивам до пощата. (пеша)'),
        },
        {
          t: 'contrast',
          de: 'Ich fahre zum Bahnhof.',
          other: bi('I am going to the station. (by vehicle)', 'Отивам до гарата. (с превозно средство)'),
        },
        {
          t: 'callout',
          tone: 'warn',
          only: ['bg'],
          text: bi(
            '',
            'Българското „отивам“ не прави тази разлика. На немски изборът е задължителен: gehen значи пеша, fahren значи с нещо. „Ich gehe nach Berlin“ звучи така, сякаш тръгваш пеша за Берлин.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          only: ['en'],
          text: bi(
            'English "go" covers both. German makes you choose: gehen is on foot, fahren is by vehicle. "Ich gehe nach Berlin" says you are walking there.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a1u5l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('mit dem Bus, mit dem Auto, mit dem Zug — masculine and neuter are both dem.', 'mit dem Bus, mit dem Auto, mit dem Zug — мъжкият и средният са dem.'),
            bi('Feminine becomes der: mit der Post.', 'Женският става der: mit der Post.'),
            bi('zum for masculine and neuter, zur for feminine.', 'zum за мъжки и среден род, zur за женски.'),
            bi('zu Fuß takes no article at all.', 'zu Fuß не взима никакъв член.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      fillBlank('a1u5l2-ex1', bi('dem or der?', 'dem или der?'), [
        {
          prompt: bi('I go by bus.', 'Пътувам с автобуса.'),
          scaffold: 'Ich fahre mit ___ Bus.',
          answer: 'dem',
          shape: 'word',
          reviewTargets: ['g-dative-basics', 'v-bus', 'p-mit-dem'],
          hints: [bi('Bus is masculine.', 'Bus е мъжки род.')],
          traps: [
            {
              answer: 'den',
              category: 'case',
              feedback: bi(
                'den is the object form. After mit, masculine becomes dem: mit dem Bus.',
                'den е формата за допълнение. След mit мъжкият род става dem: mit dem Bus.',
              ),
            },
          ],
        },
        {
          prompt: bi('We are going by car.', 'Пътуваме с колата.'),
          scaffold: 'Wir fahren mit ___ Auto.',
          answer: 'dem',
          shape: 'word',
          reviewTargets: ['v-auto'],
          hints: [bi('Neuter behaves like masculine here.', 'Средният род тук се държи като мъжкия.')],
        },
        {
          prompt: bi('by train', 'с влака'),
          scaffold: 'mit ___ Zug',
          answer: 'dem',
          shape: 'word',
          reviewTargets: ['v-zug'],
          hints: [],
        },
        {
          prompt: bi('by post', 'с пощата'),
          scaffold: 'mit ___ Post',
          answer: 'der',
          shape: 'word',
          reviewTargets: ['v-post', 'g-dative-basics'],
          hints: [bi('Post is feminine — and feminine is the surprising one.', 'Post е женски род — а женският е изненадващият.')],
          traps: [
            {
              answer: 'dem',
              category: 'case',
              feedback: bi(
                'Feminine takes der after mit. It looks like the masculine subject form and is not: mit der Post.',
                'Женският род взима der след mit. Прилича на мъжката форма за подлог, но не е тя: mit der Post.',
              ),
            },
          ],
        },
      ]),
    ),
    a1(
      fillBlank('a1u5l2-ex2', bi('zum or zur?', 'zum или zur?'), [
        {
          prompt: bi('I am going to the station.', 'Отивам до гарата.'),
          scaffold: 'Ich gehe ___ Bahnhof.',
          answer: 'zum',
          shape: 'word',
          reviewTargets: ['g-zum-zur', 'p-ich-gehe-zum'],
          hints: [bi('der Bahnhof — masculine.', 'der Bahnhof — мъжки род.')],
          traps: [
            {
              answer: 'zur',
              category: 'case',
              feedback: bi(
                'zur is for feminine nouns. Bahnhof is masculine — der Bahnhof — so it is zum.',
                'zur е за женски род. Bahnhof е мъжки — der Bahnhof — затова е zum.',
              ),
            },
          ],
        },
        {
          prompt: bi('I am going to the pharmacy.', 'Отивам до аптеката.'),
          scaffold: 'Ich gehe ___ Apotheke.',
          answer: 'zur',
          shape: 'word',
          reviewTargets: ['v-apotheke', 'g-zum-zur'],
          hints: [bi('die Apotheke — feminine.', 'die Apotheke — женски род.')],
        },
        {
          prompt: bi('How do I get to the museum?', 'Как да стигна до музея?'),
          scaffold: 'Wie komme ich ___ Museum?',
          answer: 'zum',
          shape: 'word',
          reviewTargets: ['v-museum', 'p-wie-komme-ich'],
          hints: [bi('das Museum — neuter, which takes zum.', 'das Museum — среден род, който взима zum.')],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u5l2-ex3',
        bi('How and where', 'Как и къде'),
        [
          {
            prompt: bi('I go by bus.', 'Пътувам с автобуса.'),
            answer: 'Ich fahre mit dem Bus.',
            reviewTargets: ['v-mit', 'p-mit-dem'],
            hints: [],
          },
          {
            prompt: bi('I am going to the post office.', 'Отивам до пощата.'),
            answer: 'Ich gehe zur Post.',
            reviewTargets: ['v-gehen', 'g-zum-zur'],
            hints: [],
          },
          {
            prompt: bi('We are going to the cinema by car.', 'Отиваме на кино с колата.'),
            answer: 'Wir fahren mit dem Auto zum Kino.',
            reviewTargets: ['v-auto', 'v-kino'],
            hints: [bi('How first, then where.', 'Първо как, после къде.')],
          },
          {
            prompt: bi('I go on foot.', 'Отивам пеша.'),
            answer: 'Ich gehe zu Fuß.',
            reviewTargets: ['v-zu-fuss'],
            hints: [bi('No article at all here.', 'Тук няма никакъв член.')],
          },
        ],
        ['g-dative-basics', 'g-zum-zur'],
      ),
    ),
    a1(
      wordOrder('a1u5l2-ex4', bi('Build the journey', 'Построй пътуването'), [
        {
          prompt: bi('I go to the station by train.', 'Отивам до гарата с влака.'),
          bank: ['Ich', 'fahre', 'mit', 'dem', 'Zug', 'zum', 'Bahnhof'],
          answer: 'Ich fahre mit dem Zug zum Bahnhof.',
          hints: [],
        },
        {
          prompt: bi('How long does the bus take?', 'Колко време пътува автобусът?'),
          bank: ['Wie', 'lange', 'fährt', 'der', 'Bus'],
          answer: 'Wie lange fährt der Bus?',
          hints: [bi('A question word first, then the verb.', 'Първо въпросителната дума, после глаголът.')],
        },
      ]),
    ),
    a1(
      dictation('a1u5l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich fahre mit dem Bus zum Bahnhof.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich gehe zur Apotheke.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u5l2-m1', bi('Mastery: mit and zu', 'Проверка: mit и zu'), [
          {
            prompt: bi('I go by car.', 'Пътувам с колата.'),
            answer: 'Ich fahre mit dem Auto.',
            hints: [],
          },
          {
            prompt: bi('I am going to the bank.', 'Отивам до банката.'),
            answer: 'Ich gehe zur Bank.',
            hints: [],
          },
          {
            prompt: bi('How do I get to the station?', 'Как да стигна до гарата?'),
            answer: 'Wie komme ich zum Bahnhof?',
            hints: [],
          },
        ]),
      ),
      a1(
        fillBlank('a1u5l2-m2', bi('Mastery: the form', 'Проверка: формата'), [
          {
            prompt: bi('by train', 'с влака'),
            scaffold: 'mit ___ Zug',
            answer: 'dem',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('to the post office', 'до пощата'),
            scaffold: '___ Post',
            answer: 'zur',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — directions
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u5-l3',
  unitId: 'a1-u5',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Asking the way', 'Да попиташ за пътя'),
  objective: bi(
    'After this lesson you will be able to stop a stranger politely, ask the way, and understand the answer.',
    'След този урок ще можеш учтиво да спреш непознат, да попиташ за пътя и да разбереш отговора.',
  ),
  outcomes: [
    bi('I can stop someone politely with Entschuldigen Sie.', 'Мога учтиво да спра някого с Entschuldigen Sie.'),
    bi('I can ask how to get somewhere.', 'Мога да попитам как да стигна донякъде.'),
    bi('I understand links, rechts and geradeaus.', 'Разбирам links, rechts и geradeaus.'),
    bi('I can ask whether it is far.', 'Мога да попитам дали е далеч.'),
  ],
  vocabIds: [
    'v-links',
    'v-rechts',
    'v-geradeaus',
    'v-neben',
    'v-erste',
    'v-zweite',
    'v-weit',
    'v-entschuldigen-sie',
  ],
  grammarIds: ['g-imperative-sie'],
  sections: [
    {
      id: 'a1u5l3-intro',
      kind: 'intro',
      title: bi('Understanding matters more than speaking here', 'Тук разбирането е по-важно от говоренето'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Asking the way is easy: one sentence. Understanding the answer is the hard part, and it arrives fast and in the imperative. So this lesson spends most of its time on recognising what comes back.',
            'Да попиташ за пътя е лесно: едно изречение. Трудното е да разбереш отговора, а той идва бързо и в заповедна форма. Затова този урок се занимава най-вече с разпознаване на това, което ти отговарят.',
          ),
        },
      ],
    },
    {
      id: 'a1u5l3-vocab',
      kind: 'vocabulary',
      title: bi('Left, right, straight on', 'Вляво, вдясно, направо'),
      vocabIds: ['v-links', 'v-rechts', 'v-geradeaus', 'v-erste', 'v-zweite', 'v-weit', 'v-neben'],
      blocks: [],
    },
    {
      id: 'a1u5l3-grammar',
      kind: 'grammar',
      title: bi('What you will hear back', 'Какво ще чуеш в отговор'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'The answer almost always comes as an instruction with Sie, which you met when ordering. Here it matters for understanding rather than producing.',
            'Отговорът почти винаги идва като подкана със Sie, което срещна при поръчването. Тук е важно за разбиране, а не за произвеждане.',
          ),
        },
        { t: 'de', de: 'Gehen Sie geradeaus.', gloss: bi('Go straight on.', 'Вървете направо.') },
        { t: 'de', de: 'Nehmen Sie die erste Straße links.', gloss: bi('Take the first street on the left.', 'Вземете първата улица вляво.') },
        { t: 'de', de: 'Die Bank ist neben der Post.', gloss: bi('The bank is next to the post office.', 'Банката е до пощата.') },
      ],
      grammarId: 'g-imperative-sie',
    },
    {
      id: 'a1u5l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Entschuldigen Sie opens politely.', 'Entschuldigen Sie започва учтиво.'),
            bi('Wie komme ich zum ...? is the question.', 'Wie komme ich zum ...? е въпросът.'),
            bi('links, rechts, geradeaus — the three answers you will hear.', 'links, rechts, geradeaus — трите отговора, които ще чуеш.'),
            bi('neben takes the same form as mit: neben der Post.', 'neben взима същата форма като mit: neben der Post.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u5l3-ex1',
        bi('Ask the way', 'Попитай за пътя'),
        [
          {
            prompt: bi('Excuse me, where is the station?', 'Извинете, къде е гарата?'),
            answer: 'Entschuldigen Sie, wo ist der Bahnhof?',
            reviewTargets: ['v-entschuldigen-sie', 'p-wo-ist'],
            hints: [],
          },
          {
            prompt: bi('How do I get to the museum?', 'Как да стигна до музея?'),
            answer: 'Wie komme ich zum Museum?',
            reviewTargets: ['p-wie-komme-ich'],
            hints: [],
          },
          {
            prompt: bi('Is it far?', 'Далеч ли е?'),
            answer: 'Ist es weit?',
            reviewTargets: ['v-weit'],
            hints: [],
          },
          {
            prompt: bi('The pharmacy is on the left.', 'Аптеката е вляво.'),
            answer: 'Die Apotheke ist links.',
            reviewTargets: ['v-links'],
            hints: [],
          },
        ],
      ),
    ),
    a1(
      fillBlank('a1u5l3-ex2', bi('Left or right?', 'Вляво или вдясно?'), [
        {
          prompt: bi('Take the first street on the left.', 'Вземете първата улица вляво.'),
          scaffold: 'Nehmen Sie die erste Straße ___.',
          answer: 'links',
          shape: 'word',
          reviewTargets: ['v-links', 'v-erste'],
          hints: [],
        },
        {
          prompt: bi('The bank is on the right.', 'Банката е вдясно.'),
          scaffold: 'Die Bank ist ___.',
          answer: 'rechts',
          shape: 'word',
          reviewTargets: ['v-rechts'],
          hints: [],
        },
        {
          prompt: bi('Go straight on.', 'Вървете направо.'),
          scaffold: 'Gehen Sie ___.',
          answer: 'geradeaus',
          shape: 'word',
          reviewTargets: ['v-geradeaus'],
          hints: [],
        },
      ]),
    ),
    a1(
      partialRecall('a1u5l3-ex3', bi('Next to what?', 'До какво?'), [
        {
          prompt: bi('The bank is next to the post office.', 'Банката е до пощата.'),
          scaffold: 'Die Bank ist neben d___ Post.',
          answer: 'der',
          shape: 'word',
          reviewTargets: ['v-neben', 'g-dative-basics'],
          hints: [bi('Post is feminine, and neben behaves like mit.', 'Post е женски род, а neben се държи като mit.')],
        },
        {
          prompt: bi('The park is next to the museum.', 'Паркът е до музея.'),
          scaffold: 'Der Park ist neben d___ Museum.',
          answer: 'dem',
          shape: 'word',
          reviewTargets: ['v-neben'],
          hints: [bi('Museum is neuter.', 'Museum е среден род.')],
        },
      ]),
    ),
    a1(
      dictation('a1u5l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Gehen Sie geradeaus.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die erste Straße rechts.',
          shape: 'phrase',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u5l3-ex5', bi('Ask for somewhere you need', 'Попитай за място, което ти трябва'), [
        {
          prompt: bi(
            'Write two sentences: stop someone politely and ask how to get somewhere.',
            'Напиши две изречения: спри учтиво някого и попитай как да стигнеш донякъде.',
          ),
          answer: 'Entschuldigen Sie. Wie komme ich zum Bahnhof?',
          requiredTokens: ['Entschuldigen'],
          shape: 'sentence',
          hints: [
            bi('Start with Entschuldigen Sie.', 'Започни с Entschuldigen Sie.'),
            bi('Then Wie komme ich zum or zur ...?', 'После Wie komme ich zum или zur ...?'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u5l3-m1', bi('Mastery: directions', 'Проверка: посоки'), [
          {
            prompt: bi('Excuse me, where is the pharmacy?', 'Извинете, къде е аптеката?'),
            answer: 'Entschuldigen Sie, wo ist die Apotheke?',
            hints: [],
          },
          {
            prompt: bi('Go straight on.', 'Вървете направо.'),
            answer: 'Gehen Sie geradeaus.',
            hints: [],
          },
          {
            prompt: bi('The cinema is next to the park.', 'Киното е до парка.'),
            answer: 'Das Kino ist neben dem Park.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a1-u5',
  scope: 'unit',
  targetId: 'a1-u5',
  status: 'available',
  title: bi('Unit 5 checkpoint', 'Проверка на раздел 5'),
  description: bi(
    'Places, how you get there, and asking the way.',
    'Места, как стигаш дотам и как питаш за пътя.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u5-1', bi('Places', 'Места'), [
        {
          prompt: bi('Where is the station?', 'Къде е гарата?'),
          answer: 'Wo ist der Bahnhof?',
          hints: [],
        },
        {
          prompt: bi('The museum is next to the park.', 'Музеят е до парка.'),
          answer: 'Das Museum ist neben dem Park.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u5-2', bi('Getting there', 'Стигане дотам'), [
        {
          prompt: bi('I go by bus.', 'Пътувам с автобуса.'),
          answer: 'Ich fahre mit dem Bus.',
          hints: [],
        },
        {
          prompt: bi('I am going to the post office.', 'Отивам до пощата.'),
          answer: 'Ich gehe zur Post.',
          hints: [],
        },
        {
          prompt: bi('We are going to the cinema by car.', 'Отиваме на кино с колата.'),
          answer: 'Wir fahren mit dem Auto zum Kino.',
          hints: [],
        },
        {
          prompt: bi('I go on foot.', 'Отивам пеша.'),
          answer: 'Ich gehe zu Fuß.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u5-3', bi('Asking the way', 'Питане за пътя'), [
        {
          prompt: bi('Excuse me, how do I get to the museum?', 'Извинете, как да стигна до музея?'),
          answer: 'Entschuldigen Sie, wie komme ich zum Museum?',
          hints: [],
        },
        {
          prompt: bi('Is it far?', 'Далеч ли е?'),
          answer: 'Ist es weit?',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u5-4',
        kind: 'fillBlank',
        objective: bi('The third form', 'Третата форма'),
        steps: [
          {
            prompt: bi('by train', 'с влака'),
            scaffold: 'mit ___ Zug',
            answer: 'dem',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('to the pharmacy', 'до аптеката'),
            scaffold: '___ Apotheke',
            answer: 'zur',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('next to the post office', 'до пощата'),
            scaffold: 'neben ___ Post',
            answer: 'der',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u5-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich fahre mit dem Bus zum Bahnhof.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Gehen Sie geradeaus.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_5: Unit = {
  id: 'a1-u5',
  level: 'a1',
  order: 5,
  status: 'available',
  title: bi('Getting around town', 'Придвижване в града'),
  summary: bi(
    'Places, transport and directions — and the dative, kept to mit, zu and neben so it stays learnable.',
    'Места, транспорт и посоки — и дателният падеж, сведен до mit, zu и neben, за да остане научим.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U5_PATTERNS = PATTERNS;
