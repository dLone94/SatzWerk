import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  partialRecall,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * A1 Unit 4 — Work, study and free time.
 *
 * The unit builds towards its last lesson. und, aber, oder and denn are the
 * four joining words that change nothing about word order, and they double the
 * length of every sentence a learner can already produce at no grammatical
 * cost — but only if there is something worth joining. So Lessons 1 and 2
 * deliberately supply pairs: a job and an opinion about it, a hobby and a
 * reason for it.
 *
 * gern and lieber sit in the middle of the unit for the same reason. They are
 * the cheapest way to turn a bare statement into an opinion, and an opinion is
 * the second half of a sentence with aber in it.
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-arbeite-als',
    template: 'Ich arbeite als ___.',
    example: 'Ich arbeite als Lehrerin.',
    gloss: bi('I work as a ___.', 'Работя като ___.'),
    level: 'a1',
    grammarIds: ['g-no-article-profession'],
  },
  {
    id: 'p-ich-lese-gern',
    template: 'Ich ___ gern ___.',
    example: 'Ich höre gern Musik.',
    gloss: bi('I like ___ing ___.', 'Обичам да ___.'),
    level: 'a1',
    grammarIds: ['g-gern-lieber'],
  },
  {
    id: 'p-aber-ich-bin',
    template: '___, aber ___.',
    example: 'Ich arbeite viel, aber ich bin nicht müde.',
    gloss: bi('___, but ___.', '___, но ___.'),
    level: 'a1',
    grammarIds: ['g-conjunctions'],
  },
  {
    id: 'p-denn-ich-bin',
    template: '___, denn ___.',
    example: 'Ich trinke Kaffee, denn ich bin müde.',
    gloss: bi('___, because ___.', '___, защото ___.'),
    level: 'a1',
    grammarIds: ['g-conjunctions'],
  },
];

/* ================================================================== *
 * Lesson 1 — work and study
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u4-l1',
  unitId: 'a1-u4',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Work and study', 'Работа и учене'),
  objective: bi(
    'After this lesson you will be able to say what you do, where you do it, and whether you have time.',
    'След този урок ще можеш да кажеш какво работиш, къде го правиш и дали имаш време.',
  ),
  outcomes: [
    bi('I can say what I work as, with no article.', 'Мога да кажа какъв работя, без член.'),
    bi('I can say where I work or study.', 'Мога да кажа къде работя или следвам.'),
    bi('I know when to use studieren and when to use lernen.', 'Знам кога се използва studieren и кога lernen.'),
    bi('I can say I have no time.', 'Мога да кажа, че нямам време.'),
  ],
  vocabIds: [
    'v-firma',
    'v-buero',
    'v-chef',
    'v-studieren',
    'v-universitaet',
    'v-schule',
    'v-als',
    'v-zeit',
    'v-frei',
  ],
  grammarIds: ['g-no-article-profession'],
  sections: [
    {
      id: 'a1u4l1-intro',
      kind: 'intro',
      title: bi('The question everyone asks', 'Въпросът, който всички задават'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You already know how to answer "Was machst du beruflich?" with a job title. This lesson adds where, with whom, and the one small word that makes it sound natural: als.',
            'Вече знаеш как да отговориш на „Was machst du beruflich?“ с название на професия. Този урок добавя къде, с кого и малката дума, която прави отговора естествен: als.',
          ),
        },
      ],
    },
    {
      id: 'a1u4l1-vocab',
      kind: 'vocabulary',
      title: bi('Where you spend the day', 'Където прекарваш деня'),
      vocabIds: ['v-firma', 'v-buero', 'v-chef', 'v-studieren', 'v-universitaet', 'v-schule', 'v-zeit', 'v-frei'],
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'studieren is university only. Learning a language or a skill is lernen: "Ich lerne Deutsch", not "Ich studiere Deutsch" — unless German is your degree.',
            'studieren е само за университет. Учене на език или умение е lernen: „Ich lerne Deutsch“, а не „Ich studiere Deutsch“ — освен ако германистиката не ти е специалността.',
          ),
        },
      ],
    },
    {
      id: 'a1u4l1-als',
      kind: 'grammar',
      title: bi('als, and the missing article', 'als и липсващият член'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You met this rule with "Ich bin Lehrerin". It works the same after als.',
            'Срещна това правило при „Ich bin Lehrerin“. Работи по същия начин и след als.',
          ),
        },
        { t: 'de', de: 'Ich arbeite als Lehrerin.', gloss: bi('I work as a teacher.', 'Работя като учителка.') },
        { t: 'de', de: 'Er arbeitet als Ingenieur.', gloss: bi('He works as an engineer.', 'Той работи като инженер.') },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'No ein, no eine: "als Lehrerin", never "als eine Lehrerin".',
            'Без ein, без eine: „als Lehrerin“, никога „als eine Lehrerin“.',
          ),
        },
      ],
      grammarId: 'g-no-article-profession',
    },
    {
      id: 'a1u4l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('als takes no article.', 'als не взима член.'),
            bi('studieren is university; lernen is everything else.', 'studieren е университет; lernen е всичко останало.'),
            bi('Ich habe keine Zeit — kein, because Zeit is a noun.', 'Ich habe keine Zeit — kein, защото Zeit е съществително.'),
            bi('frei means available, not free of charge.', 'frei значи свободен, не безплатен.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u4l1-ex1',
        bi('What you do', 'Какво работиш'),
        [
          {
            prompt: bi('I work as a teacher. (female)', 'Работя като учителка.'),
            answer: 'Ich arbeite als Lehrerin.',
            reviewTargets: ['v-als', 'p-ich-arbeite-als'],
            hints: [bi('No article after als.', 'Без член след als.')],
            traps: [
              {
                answer: 'Ich arbeite als eine Lehrerin.',
                category: 'extra-word',
                feedback: bi(
                  'No article after als. German says "als Lehrerin", the same way it says "Ich bin Lehrerin".',
                  'Без член след als. Немският казва „als Lehrerin“, също както казва „Ich bin Lehrerin“.',
                ),
              },
            ],
          },
          {
            prompt: bi('I study in Munich.', 'Следвам в Мюнхен.'),
            answer: 'Ich studiere in München.',
            reviewTargets: ['v-studieren'],
            hints: [],
          },
          {
            prompt: bi('My boss is very nice.', 'Шефът ми е много мил.'),
            answer: 'Mein Chef ist sehr nett.',
            reviewTargets: ['v-chef'],
            hints: [],
          },
          {
            prompt: bi('I have no time.', 'Нямам време.'),
            answer: 'Ich habe keine Zeit.',
            reviewTargets: ['v-zeit'],
            hints: [bi('Zeit is feminine.', 'Zeit е женски род.')],
          },
        ],
        ['g-no-article-profession'],
      ),
    ),
    a1(
      fillBlank('a1u4l1-ex2', bi('studieren or lernen?', 'studieren или lernen?'), [
        {
          prompt: bi('I am learning German.', 'Уча немски.'),
          scaffold: 'Ich ___ Deutsch.',
          answer: 'lerne',
          shape: 'word',
          reviewTargets: ['v-studieren'],
          hints: [bi('A language is not a degree.', 'Един език не е специалност.')],
          traps: [
            {
              answer: 'studiere',
              category: 'vocabulary',
              feedback: bi(
                'studieren is for a university degree. Learning a language is lernen: Ich lerne Deutsch.',
                'studieren е за университетска специалност. Ученето на език е lernen: Ich lerne Deutsch.',
              ),
            },
          ],
        },
        {
          prompt: bi('She studies in Berlin.', 'Тя следва в Берлин.'),
          scaffold: 'Sie ___ in Berlin.',
          answer: 'studiert',
          shape: 'word',
          reviewTargets: ['v-studieren'],
          hints: [],
        },
        {
          prompt: bi('On Saturday I am free.', 'В събота съм свободен.'),
          scaffold: 'Am Samstag bin ich ___.',
          answer: 'frei',
          shape: 'word',
          reviewTargets: ['v-frei'],
          hints: [],
        },
      ]),
    ),
    a1(
      partialRecall('a1u4l1-ex3', bi('Finish the word', 'Довърши думата'), [
        {
          prompt: bi('My office is small.', 'Офисът ми е малък.'),
          scaffold: 'Mein B___ ist klein.',
          answer: 'Büro',
          shape: 'word',
          reviewTargets: ['v-buero'],
          hints: [bi('It needs an umlaut.', 'Трябва умлаут.')],
        },
        {
          prompt: bi('I work at a company in Berlin.', 'Работя във фирма в Берлин.'),
          scaffold: 'Ich arbeite bei einer F___ in Berlin.',
          answer: 'Firma',
          shape: 'word',
          reviewTargets: ['v-firma'],
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u4l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich arbeite als Lehrerin.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe keine Zeit.',
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
        typeIt('a1u4l1-m1', bi('Mastery: work and study', 'Проверка: работа и учене'), [
          {
            prompt: bi('He works as a teacher.', 'Той работи като учител.'),
            answer: 'Er arbeitet als Lehrer.',
            hints: [],
          },
          {
            prompt: bi('I am learning German.', 'Уча немски.'),
            answer: 'Ich lerne Deutsch.',
            hints: [],
          },
          {
            prompt: bi('My office is very big.', 'Офисът ми е много голям.'),
            answer: 'Mein Büro ist sehr groß.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — free time
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u4-l2',
  unitId: 'a1-u4',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Free time, and what you prefer', 'Свободно време и какво предпочиташ'),
  objective: bi(
    'After this lesson you will be able to talk about your hobbies and say what you like and prefer, using gern and lieber.',
    'След този урок ще можеш да говориш за хобитата си и да кажеш какво обичаш и какво предпочиташ, използвайки gern и lieber.',
  ),
  outcomes: [
    bi('I can name what I do in my free time.', 'Мога да назова какво правя в свободното си време.'),
    bi('I can say what I like doing with gern.', 'Мога да кажа какво обичам да правя с gern.'),
    bi('I can say what I prefer with lieber.', 'Мога да кажа какво предпочитам с lieber.'),
    bi('I can use the irregular forms of lesen, fahren and treffen.', 'Мога да използвам неправилните форми на lesen, fahren и treffen.'),
  ],
  vocabIds: [
    'v-hobby',
    'v-lesen',
    'v-hoeren',
    'v-musik',
    'v-sport',
    'v-spielen',
    'v-schwimmen',
    'v-tanzen',
    'v-treffen',
    'v-fahrrad',
    'v-fahren',
    'v-lieber',
  ],
  grammarIds: ['g-gern-lieber'],
  sections: [
    {
      id: 'a1u4l2-intro',
      kind: 'intro',
      title: bi('What you do when you stop working', 'Какво правиш, когато спреш да работиш'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Free time is the easiest subject to talk about and the one that comes up first with new people, because everyone has an answer.',
            'Свободното време е най-лесната тема и първата, която изниква с нови хора, защото всеки има отговор.',
          ),
        },
      ],
    },
    {
      id: 'a1u4l2-vocab',
      kind: 'vocabulary',
      title: bi('Hobbies', 'Хобита'),
      vocabIds: ['v-hobby', 'v-lesen', 'v-hoeren', 'v-musik', 'v-sport', 'v-spielen', 'v-schwimmen', 'v-tanzen', 'v-treffen', 'v-fahrrad', 'v-fahren'],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Three of these are irregular in the du and er forms: du liest, du fährst, du triffst. They are the last stem changes this level needs.',
            'Три от тях са неправилни при du и er: du liest, du fährst, du triffst. Това са последните промени на корена, които нивото изисква.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Две неща, които българският прави различно: treffen не иска предлог — „Ich treffe meinen Freund“, а не „с приятеля си“; и spielen върши работата и на „играя“, и на „свиря“.',
          ),
        },
      ],
    },
    {
      id: 'a1u4l2-grammar',
      kind: 'grammar',
      title: bi('gern and lieber', 'gern и lieber'),
      blocks: [],
      grammarId: 'g-gern-lieber',
    },
    {
      id: 'a1u4l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('gern goes after the verb, never before it.', 'gern стои след глагола, никога преди него.'),
            bi('lieber is the comparative: I prefer.', 'lieber е сравнителната степен: предпочитам.'),
            bi('Sport machen, Fahrrad fahren — no article.', 'Sport machen, Fahrrad fahren — без член.'),
            bi('treffen takes a direct object, with no preposition.', 'treffen взима пряко допълнение, без предлог.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u4l2-ex1',
        bi('What you like', 'Какво обичаш'),
        [
          {
            prompt: bi('I like listening to music.', 'Обичам да слушам музика.'),
            answer: 'Ich höre gern Musik.',
            reviewTargets: ['v-hoeren', 'p-ich-lese-gern'],
            hints: [bi('gern comes after the verb.', 'gern идва след глагола.')],
            traps: [
              {
                answer: 'Ich gern höre Musik.',
                category: 'word-order',
                feedback: bi(
                  'The verb keeps second position, so gern comes after it: Ich höre gern Musik.',
                  'Глаголът остава на второ място, затова gern идва след него: Ich höre gern Musik.',
                ),
              },
            ],
          },
          {
            prompt: bi('I like reading.', 'Обичам да чета.'),
            answer: 'Ich lese gern.',
            reviewTargets: ['v-lesen', 'g-gern-lieber'],
            hints: [],
          },
          {
            prompt: bi('I prefer drinking tea.', 'Предпочитам да пия чай.'),
            answer: 'Ich trinke lieber Tee.',
            reviewTargets: ['v-lieber'],
            hints: [],
          },
          {
            prompt: bi('I am meeting my friends.', 'Срещам се с приятелите си.'),
            answer: 'Ich treffe meine Freunde.',
            reviewTargets: ['v-treffen'],
            hints: [bi('No preposition after treffen.', 'Без предлог след treffen.')],
          },
        ],
        ['g-gern-lieber'],
      ),
    ),
    a1(
      partialRecall('a1u4l2-ex2', bi('The irregular forms', 'Неправилните форми'), [
        {
          prompt: bi('She reads a lot.', 'Тя чете много.'),
          scaffold: 'Sie l___ viel.',
          answer: 'liest',
          shape: 'word',
          reviewTargets: ['v-lesen'],
          hints: [bi('The e becomes ie.', 'Гласната e става ie.')],
        },
        {
          prompt: bi('Do you drive to Berlin? (informal)', 'Пътуваш ли за Берлин?'),
          scaffold: 'F___ du nach Berlin?',
          answer: 'Fährst',
          shape: 'word',
          reviewTargets: ['v-fahren'],
          hints: [bi('The a takes an umlaut.', 'Гласната a взима умлаут.')],
        },
        {
          prompt: bi('He is meeting his brother.', 'Той се среща с брат си.'),
          scaffold: 'Er tr___ seinen Bruder.',
          answer: 'trifft',
          shape: 'word',
          reviewTargets: ['v-treffen'],
          hints: [bi('The e becomes i and the f doubles.', 'Гласната e става i, а f се удвоява.')],
        },
      ]),
    ),
    a1(
      wordOrder('a1u4l2-ex3', bi('Put it in order', 'Подреди'), [
        {
          prompt: bi('I like doing sport.', 'Обичам да спортувам.'),
          bank: ['Ich', 'mache', 'gern', 'Sport'],
          answer: 'Ich mache gern Sport.',
          hints: [],
        },
        {
          prompt: bi('My sister likes dancing.', 'Сестра ми обича да танцува.'),
          bank: ['Meine', 'Schwester', 'tanzt', 'gern'],
          answer: 'Meine Schwester tanzt gern.',
          hints: [],
        },
      ]),
    ),
    a1(
      fillBlank('a1u4l2-ex4', bi('gern or lieber?', 'gern или lieber?'), [
        {
          prompt: bi('I like swimming.', 'Обичам да плувам.'),
          scaffold: 'Ich schwimme ___.',
          answer: 'gern',
          shape: 'word',
          reviewTargets: ['v-schwimmen'],
          hints: [],
        },
        {
          prompt: bi('I prefer reading.', 'Предпочитам да чета.'),
          scaffold: 'Ich lese ___.',
          answer: 'lieber',
          shape: 'word',
          reviewTargets: ['v-lieber'],
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u4l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich höre gern Musik.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich fahre gern Fahrrad.',
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
        typeIt('a1u4l2-m1', bi('Mastery: free time', 'Проверка: свободно време'), [
          {
            prompt: bi('I like playing football.', 'Обичам да играя футбол.'),
            answer: 'Ich spiele gern Fußball.',
            hints: [],
          },
          {
            prompt: bi('She prefers swimming.', 'Тя предпочита да плува.'),
            answer: 'Sie schwimmt lieber.',
            hints: [],
          },
          {
            prompt: bi('I am meeting my friend. (male)', 'Срещам се с приятеля си.'),
            answer: 'Ich treffe meinen Freund.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — joining sentences
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u4-l3',
  unitId: 'a1-u4',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Joining two sentences', 'Свързване на две изречения'),
  objective: bi(
    'After this lesson you will be able to join two sentences with und, aber, oder and denn, and give a reason for what you say.',
    'След този урок ще можеш да свързваш две изречения с und, aber, oder и denn и да даваш причина за това, което казваш.',
  ),
  outcomes: [
    bi('I can join two sentences with und, aber, oder and denn.', 'Мога да свържа две изречения с und, aber, oder и denn.'),
    bi('I know the word order does not change after them.', 'Знам, че словоредът не се мени след тях.'),
    bi('I give each half its own subject.', 'Давам на всяка половина собствен подлог.'),
    bi('I can give a reason with denn.', 'Мога да дам причина с denn.'),
  ],
  vocabIds: ['v-und', 'v-aber', 'v-oder', 'v-denn', 'v-muede', 'v-viel', 'v-zu-hause'],
  grammarIds: ['g-conjunctions'],
  sections: [
    {
      id: 'a1u4l3-intro',
      kind: 'intro',
      title: bi('Twice the sentence, no new grammar', 'Двойно изречение, без нова граматика'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'These four words are the best value in German. They join two complete sentences, they change nothing at all, and they immediately double the length of everything you can say.',
            'Тези четири думи са най-изгодната сделка в немския. Свързват две цели изречения, не променят абсолютно нищо и веднага удвояват дължината на всичко, което можеш да кажеш.',
          ),
        },
      ],
    },
    {
      id: 'a1u4l3-grammar',
      kind: 'grammar',
      title: bi('und, aber, oder, denn', 'und, aber, oder, denn'),
      blocks: [],
      grammarId: 'g-conjunctions',
    },
    {
      id: 'a1u4l3-examples',
      kind: 'examples',
      title: bi('Put together', 'Сглобени'),
      blocks: [
        { t: 'de', de: 'Ich arbeite viel, aber ich bin nicht müde.', gloss: bi('I work a lot, but I am not tired.', 'Работя много, но не съм уморен.') },
        { t: 'de', de: 'Ich trinke Kaffee, denn ich bin müde.', gloss: bi('I drink coffee, because I am tired.', 'Пия кафе, защото съм уморен.') },
        { t: 'de', de: 'Am Abend bin ich zu Hause und ich lese.', gloss: bi('In the evening I am at home and I read.', 'Вечер съм вкъщи и чета.') },
        { t: 'de', de: 'Trinkst du Tee oder trinkst du Kaffee?', gloss: bi('Do you drink tea or do you drink coffee?', 'Пиеш ли чай или пиеш кафе?') },
      ],
    },
    {
      id: 'a1u4l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('The verb stays in second position on both sides.', 'Глаголът остава на второ място и от двете страни.'),
            bi('Each half needs its own subject.', 'Всяка половина иска собствен подлог.'),
            bi('A comma before aber and denn.', 'Запетая пред aber и denn.'),
            bi('denn is the easy because; weil comes later.', 'denn е лесното „защото“; weil идва по-късно.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u4l3-ex1',
        bi('Join them', 'Свържи ги'),
        [
          {
            prompt: bi('I work a lot, but I am not tired.', 'Работя много, но не съм уморен.'),
            answer: 'Ich arbeite viel, aber ich bin nicht müde.',
            reviewTargets: ['v-aber', 'p-aber-ich-bin'],
            hints: [bi('Both halves need a subject.', 'И двете половини искат подлог.')],
            traps: [
              {
                answer: 'Ich arbeite viel, aber bin nicht müde.',
                category: 'missing-word',
                feedback: bi(
                  'The second half needs its own subject: aber ich bin nicht müde. German does not leave it out.',
                  'Втората половина иска собствен подлог: aber ich bin nicht müde. Немският не го изпуска, макар българският да го прави.',
                ),
              },
            ],
          },
          {
            prompt: bi('I drink coffee, because I am tired.', 'Пия кафе, защото съм уморен.'),
            answer: 'Ich trinke Kaffee, denn ich bin müde.',
            reviewTargets: ['v-denn', 'p-denn-ich-bin'],
            hints: [],
          },
          {
            prompt: bi('In the evening I am at home and I read.', 'Вечер съм вкъщи и чета.'),
            answer: 'Am Abend bin ich zu Hause und ich lese.',
            alternatives: ['Ich bin am Abend zu Hause und ich lese.'],
            reviewTargets: ['v-zu-hause', 'v-und'],
            hints: [bi('The time phrase is first, so the verb comes second.', 'Изразът за време е отпред, затова глаголът е втори.')],
          },
          {
            prompt: bi('I am tired, but I am at home.', 'Уморен съм, но съм вкъщи.'),
            answer: 'Ich bin müde, aber ich bin zu Hause.',
            reviewTargets: ['v-muede', 'v-zu-hause'],
            hints: [bi('Both halves need ich.', 'И двете половини искат ich.')],
          },
        ],
        ['g-conjunctions'],
      ),
    ),
    a1(
      fillBlank('a1u4l3-ex2', bi('Which joining word?', 'Коя свързваща дума?'), [
        {
          prompt: bi('I am staying at home, because I have no time.', 'Оставам вкъщи, защото нямам време.'),
          scaffold: 'Ich bin zu Hause, ___ ich habe keine Zeit.',
          answer: 'denn',
          shape: 'word',
          reviewTargets: ['v-denn'],
          hints: [bi('This one gives a reason.', 'Тази дума дава причина.')],
        },
        {
          prompt: bi('I like reading, but I prefer swimming.', 'Обичам да чета, но предпочитам да плувам.'),
          scaffold: 'Ich lese gern, ___ ich schwimme lieber.',
          answer: 'aber',
          shape: 'word',
          reviewTargets: ['v-aber'],
          hints: [],
        },
        {
          prompt: bi('Do you drink tea or coffee?', 'Пиеш ли чай или кафе?'),
          scaffold: 'Trinkst du Tee ___ Kaffee?',
          answer: 'oder',
          shape: 'word',
          reviewTargets: ['v-oder'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u4l3-ex3', bi('Build the long sentence', 'Построй дългото изречение'), [
        {
          prompt: bi('I work a lot, but I would rather be at home.', 'Работя много, но предпочитам да съм вкъщи.'),
          bank: ['Ich', 'arbeite', 'viel,', 'aber', 'ich', 'bin', 'lieber', 'zu', 'Hause'],
          answer: 'Ich arbeite viel, aber ich bin lieber zu Hause.',
          hints: [bi('Two halves, each with ich.', 'Две половини, всяка с ich.')],
        },
        {
          prompt: bi('She is tired, because she works a lot.', 'Тя е уморена, защото работи много.'),
          bank: ['Sie', 'ist', 'müde,', 'denn', 'sie', 'arbeitet', 'viel'],
          answer: 'Sie ist müde, denn sie arbeitet viel.',
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u4l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bin müde, denn ich arbeite viel.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich lese gern, aber ich sehe nie fern.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u4l3-ex5', bi('Write about your week', 'Напиши за седмицата си'), [
        {
          prompt: bi(
            'Write one long sentence about your week, using aber or denn.',
            'Напиши едно дълго изречение за седмицата си, използвайки aber или denn.',
          ),
          answer: 'Ich arbeite viel, aber am Wochenende bin ich frei.',
          requiredTokens: ['ich'],
          shape: 'sentence',
          hints: [
            bi('Two complete halves, joined.', 'Две цели половини, свързани.'),
            bi('Each half needs its own subject.', 'Всяка половина иска собствен подлог.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u4l3-m1', bi('Mastery: joining', 'Проверка: свързване'), [
          {
            prompt: bi('I am tired, because I work a lot.', 'Уморен съм, защото работя много.'),
            answer: 'Ich bin müde, denn ich arbeite viel.',
            hints: [],
          },
          {
            prompt: bi('I like reading, but I prefer swimming.', 'Обичам да чета, но предпочитам да плувам.'),
            answer: 'Ich lese gern, aber ich schwimme lieber.',
            hints: [],
          },
          {
            prompt: bi('Do you drink tea or coffee?', 'Пиеш ли чай или кафе?'),
            answer: 'Trinkst du Tee oder Kaffee?',
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
  id: 'cp-a1-u4',
  scope: 'unit',
  targetId: 'a1-u4',
  status: 'available',
  title: bi('Unit 4 checkpoint', 'Проверка на раздел 4'),
  description: bi(
    'Work, free time, and sentences with two halves.',
    'Работа, свободно време и изречения с две половини.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u4-1', bi('Work', 'Работа'), [
        {
          prompt: bi('I work as a teacher. (male)', 'Работя като учител.'),
          answer: 'Ich arbeite als Lehrer.',
          hints: [],
        },
        {
          prompt: bi('I have no time.', 'Нямам време.'),
          answer: 'Ich habe keine Zeit.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u4-2', bi('Free time', 'Свободно време'), [
        {
          prompt: bi('I like listening to music.', 'Обичам да слушам музика.'),
          answer: 'Ich höre gern Musik.',
          hints: [],
        },
        {
          prompt: bi('I prefer reading.', 'Предпочитам да чета.'),
          answer: 'Ich lese lieber.',
          hints: [],
        },
        {
          prompt: bi('I am meeting my friends.', 'Срещам се с приятелите си.'),
          answer: 'Ich treffe meine Freunde.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u4-3', bi('Two halves', 'Две половини'), [
        {
          prompt: bi('I work a lot, but I am not tired.', 'Работя много, но не съм уморен.'),
          answer: 'Ich arbeite viel, aber ich bin nicht müde.',
          hints: [],
        },
        {
          prompt: bi('I am at home, because I have no time.', 'Вкъщи съм, защото нямам време.'),
          answer: 'Ich bin zu Hause, denn ich habe keine Zeit.',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u4-4',
        kind: 'partialRecall',
        objective: bi('Irregular forms', 'Неправилни форми'),
        steps: [
          {
            prompt: bi('She reads a lot.', 'Тя чете много.'),
            scaffold: 'Sie l___ viel.',
            answer: 'liest',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('He is meeting his sister.', 'Той се среща със сестра си.'),
            scaffold: 'Er tr___ seine Schwester.',
            answer: 'trifft',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u4-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bin müde, denn ich arbeite viel.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Am Samstag bin ich frei.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_4: Unit = {
  id: 'a1-u4',
  level: 'a1',
  order: 4,
  status: 'available',
  title: bi('Work, study and free time', 'Работа, учене и свободно време'),
  summary: bi(
    'What you do and what you would rather do, and the four joining words that double the length of every sentence.',
    'Какво правиш и какво би предпочел, и четирите свързващи думи, които удвояват дължината на всяко изречение.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U4_PATTERNS = PATTERNS;
