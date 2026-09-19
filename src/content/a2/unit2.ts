import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * A2 Unit 2 — Home, city and services.
 *
 * Two hard things, one setting. Describing a flat is the only natural reason to
 * need the two-way prepositions, and calling a landlord about a broken heater
 * is the only natural reason to need weil. Putting them in the same unit is not
 * a compromise: the last lesson is a phone call in which you say where the
 * problem is and why you are calling, which needs both.
 *
 * The verb pairs carry the case so the learner never has to decide it twice.
 * stellen always takes the accusative, stehen always takes the dative, and a
 * learner who has learnt them as a pair has learnt the grammar with them. That
 * is why the pairs are introduced before the case table is asked for.
 *
 * The paths diverge most here. English already distinguishes in from into, so
 * the English path is told it owns the idea and only has to move it onto the
 * article. Bulgarian does not distinguish them at all — „в стаята" is the same
 * sitting inside it and walking into it — so the Bulgarian path gets the honest
 * version and a question to ask every time instead of a feeling to trust.
 */

/** The shorthands default to pre-a1; everything in this file is A2. */
const a2 = (ex: Exercise): Exercise => ({ ...ex, level: 'a2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-wo-dativ',
    template: 'Das ___ steht in ___ ___.',
    example: 'Die Lampe steht in der Ecke.',
    gloss: bi('The ___ is in the ___.', '___ е в ___.'),
    level: 'a2',
    grammarIds: ['g-wechselpraepositionen'],
  },
  {
    id: 'p-wohin-akkusativ',
    template: 'Ich stelle ___ in ___ ___.',
    example: 'Ich stelle die Lampe in die Ecke.',
    gloss: bi('I am putting ___ into the ___.', 'Слагам ___ в ___.'),
    level: 'a2',
    grammarIds: ['g-wechselpraepositionen', 'g-stellen-legen'],
  },
  {
    id: 'p-weil',
    template: '___, weil ___ ___ ist.',
    example: 'Ich rufe an, weil die Heizung kaputt ist.',
    gloss: bi('___, because ___ is ___.', '___, защото ___ е ___.'),
    level: 'a2',
    grammarIds: ['g-weil'],
  },
  {
    id: 'p-funktioniert-nicht',
    template: '___ funktioniert nicht.',
    example: 'Die Heizung funktioniert nicht.',
    gloss: bi('The ___ is not working.', '___ не работи.'),
    level: 'a2',
  },
];

/* ================================================================== *
 * Lesson 1 — where things are
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a2-u2-l1',
  unitId: 'a2-u2',
  level: 'a2',
  order: 1,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Where things are: wo and the dative', 'Къде са нещата: wo и дателният падеж'),
  objective: bi(
    'After this lesson you will be able to say where something is in a room, using the right verb for how it sits there.',
    'След този урок ще можеш да кажеш къде е нещо в стаята, с правилния глагол за начина, по който стои там.',
  ),
  outcomes: [
    bi('I can answer wo? with the dative.', 'Мога да отговоря на wo? с дателен падеж.'),
    bi('I can choose between stehen, liegen and hängen.', 'Мога да избера между stehen, liegen и hängen.'),
    bi('I know the nine two-way prepositions.', 'Знам деветте двупосочни предлога.'),
    bi('I can describe a room.', 'Мога да опиша стая.'),
  ],
  vocabIds: ['v-die-wand', 'v-die-ecke', 'v-das-regal', 'v-die-lampe', 'v-das-bild', 'v-stehen', 'v-liegen', 'v-haengen'],
  grammarIds: ['g-wechselpraepositionen', 'g-stellen-legen'],
  sections: [
    {
      id: 'a2u2l1-intro',
      kind: 'intro',
      title: bi('German does not say a thing "is" somewhere', 'Немският не казва, че нещо „е“ някъде'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'It says how it is there. Upright things stand, flat things lie, and things on a hook hang. There is no neutral verb, so choosing one is the first thing to learn.',
            'Той казва как е там. Изправените неща стоят, плоските лежат, а закачените висят. Няма неутрален глагол, затова изборът е първото за учене.',
          ),
        },
        {
          t: 'list',
          items: [
            bi('Die Lampe steht in der Ecke. — the lamp is upright.', 'Die Lampe steht in der Ecke. — лампата е изправена.'),
            bi('Das Buch liegt auf dem Tisch. — the book is flat.', 'Das Buch liegt auf dem Tisch. — книгата е легнала.'),
            bi('Das Bild hängt an der Wand. — the picture is on a hook.', 'Das Bild hängt an der Wand. — картината е закачена.'),
          ],
        },
      ],
    },
    {
      id: 'a2u2l1-vocab',
      kind: 'vocabulary',
      title: bi('A room, and how things sit in it', 'Стая и как стоят нещата в нея'),
      vocabIds: ['v-die-wand', 'v-die-ecke', 'v-das-regal', 'v-die-lampe', 'v-das-bild', 'v-stehen', 'v-liegen', 'v-haengen'],
      blocks: [],
    },
    {
      id: 'a2u2l1-grammar',
      kind: 'grammar',
      title: bi('wo or wohin', 'wo или wohin'),
      blocks: [],
      grammarId: 'g-wechselpraepositionen',
    },
    {
      id: 'a2u2l1-pairs',
      kind: 'grammar',
      title: bi('The verb pairs', 'Двойките глаголи'),
      blocks: [],
      grammarId: 'g-stellen-legen',
    },
    {
      id: 'a2u2l1-examples',
      kind: 'examples',
      title: bi('One room, described', 'Една стая, описана'),
      blocks: [
        { t: 'de', de: 'Die Lampe steht in der Ecke.', gloss: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'), audio: true },
        { t: 'de', de: 'Das Buch liegt auf dem Tisch.', gloss: bi('The book is on the table.', 'Книгата е на масата.'), audio: true },
        { t: 'de', de: 'Das Bild hängt an der Wand.', gloss: bi('The picture is on the wall.', 'Картината е на стената.'), audio: true },
        { t: 'de', de: 'Die Bücher stehen im Regal.', gloss: bi('The books are on the shelf.', 'Книгите са на рафта.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'im is in dem, shortened — the same im you have used since "im Mai".',
            'im е in dem, съкратено — същото im, което използваш още от „im Mai“.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('wo? → dative: dem, der, dem.', 'wo? → дателен: dem, der, dem.'),
            bi('stehen upright, liegen flat, hängen on a hook.', 'stehen изправено, liegen легнало, hängen закачено.'),
            bi('in dem = im, an dem = am.', 'in dem = im, an dem = am.'),
            bi('The nine: in, an, auf, über, unter, vor, hinter, neben, zwischen.', 'Деветте: in, an, auf, über, unter, vor, hinter, neben, zwischen.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      fillBlank('a2u2l1-ex1', bi('Which verb?', 'Кой глагол?'), [
        {
          prompt: bi('The lamp is in the corner. (upright)', 'Лампата е в ъгъла. (изправена)'),
          scaffold: 'Die Lampe ___ in der Ecke.',
          answer: 'steht',
          shape: 'word',
          reviewTargets: ['v-stehen'],
          hints: [bi('A lamp stands.', 'Лампата стои.')],
        },
        {
          prompt: bi('The book is on the table. (flat)', 'Книгата е на масата. (легнала)'),
          scaffold: 'Das Buch ___ auf dem Tisch.',
          answer: 'liegt',
          shape: 'word',
          reviewTargets: ['v-liegen'],
          hints: [],
        },
        {
          prompt: bi('The picture is on the wall.', 'Картината е на стената.'),
          scaffold: 'Das Bild ___ an der Wand.',
          answer: 'hängt',
          shape: 'word',
          reviewTargets: ['v-haengen'],
          hints: [],
        },
      ]),
    ),
    a2(
      exercise({
        id: 'a2u2l1-ex2',
        kind: 'articleRecall',
        level: 'a2',
        objective: bi('The article after wo?', 'Членът след wo?'),
        mandatoryRetype: false,
        steps: [
          {
            prompt: bi('in the corner (die Ecke)', 'в ъгъла (die Ecke)'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'in ___ Ecke',
            answer: 'der',
            shape: 'word',
            hints: [bi('Feminine dative — the trap from A1 Unit 5.', 'Женски род, дателен — капанът от раздел 5 на A1.')],
          },
          {
            prompt: bi('on the table (der Tisch)', 'на масата (der Tisch)'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'auf ___ Tisch',
            answer: 'dem',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('on the wall (die Wand)', 'на стената (die Wand)'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'an ___ Wand',
            answer: 'der',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      typeIt(
        'a2u2l1-ex3',
        bi('Describe the room', 'Опиши стаята'),
        [
          {
            prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
            answer: 'Die Lampe steht in der Ecke.',
            reviewTargets: ['p-wo-dativ'],
            hints: [],
            traps: [
              {
                answer: 'Die Lampe steht in die Ecke.',
                category: 'case',
                feedback: bi(
                  'Nothing is moving, so this answers wo? and takes the dative: in der Ecke.',
                  'Нищо не се движи, значи това отговаря на wo? и взима дателен падеж: in der Ecke.',
                ),
              },
              {
                answer: 'Die Lampe ist in der Ecke.',
                category: 'vocabulary',
                feedback: bi(
                  'Understandable, but German says how a thing is there: a lamp steht. Keep sein for descriptions like "Die Lampe ist kaputt".',
                  'Разбираемо, но немският казва как стои нещото: лампата steht. Пази sein за описания като „Die Lampe ist kaputt“.',
                ),
              },
            ],
          },
          {
            prompt: bi('The picture is on the wall.', 'Картината е на стената.'),
            answer: 'Das Bild hängt an der Wand.',
            hints: [],
          },
          {
            prompt: bi('The books are on the shelf.', 'Книгите са на рафта.'),
            answer: 'Die Bücher stehen im Regal.',
            hints: [bi('in dem, shortened.', 'in dem, съкратено.')],
          },
        ],
        ['g-wechselpraepositionen'],
      ),
    ),
    a2(
      dictation('a2u2l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Buch liegt auf dem Tisch.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Lampe steht in der Ecke.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u2l1-m1', bi('Where it is', 'Къде е'), [
          {
            prompt: bi('The book is on the table.', 'Книгата е на масата.'),
            answer: 'Das Buch liegt auf dem Tisch.',
            hints: [],
          },
          {
            prompt: bi('The picture is on the wall.', 'Картината е на стената.'),
            answer: 'Das Bild hängt an der Wand.',
            hints: [],
          },
          {
            prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
            answer: 'Die Lampe steht in der Ecke.',
            hints: [],
          },
        ]),
      ),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'wo? takes the dative, and the verb you choose says how the thing is there. Next comes the other half: what happens when it moves.',
        'wo? взима дателен, а глаголът, който избереш, казва как стои нещото. Следва другата половина: какво става, когато то се движи.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — putting things somewhere
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a2-u2-l2',
  unitId: 'a2-u2',
  level: 'a2',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Putting things: wohin and the accusative', 'Слагане на нещата: wohin и винителният падеж'),
  objective: bi(
    'After this lesson you will be able to say where you are putting something — and know why the article changes.',
    'След този урок ще можеш да кажеш къде слагаш нещо — и ще знаеш защо членът се променя.',
  ),
  outcomes: [
    bi('I can answer wohin? with the accusative.', 'Мога да отговоря на wohin? с винителен падеж.'),
    bi('I can use stellen and legen.', 'Мога да използвам stellen и legen.'),
    bi('I can tell the two questions apart before I write the article.', 'Мога да различа двата въпроса, преди да напиша члена.'),
    bi('I can talk about moving house.', 'Мога да говоря за преместване.'),
  ],
  vocabIds: ['v-stellen', 'v-legen', 'v-der-boden', 'v-umziehen'],
  grammarIds: ['g-wechselpraepositionen', 'g-stellen-legen'],
  sections: [
    {
      id: 'a2u2l2-intro',
      kind: 'intro',
      title: bi('The same preposition, a different case', 'Същият предлог, различен падеж'),
      blocks: [
        {
          t: 'contrast',
          de: 'Die Lampe steht in der Ecke. / Ich stelle die Lampe in die Ecke.',
          other: bi(
            'The lamp is in the corner. / I am putting the lamp into the corner.',
            'Лампата е в ъгъла. / Слагам лампата в ъгъла.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'One word changes: der becomes die. That single letter is the difference between where something is and where it is going.',
            'Една дума се променя: der става die. Тази единствена буква е разликата между това къде е нещо и накъде отива.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l2-vocab',
      kind: 'vocabulary',
      title: bi('Putting, and moving out', 'Слагане и преместване'),
      vocabIds: ['v-stellen', 'v-legen', 'v-der-boden', 'v-umziehen'],
      blocks: [],
    },
    {
      id: 'a2u2l2-examples',
      kind: 'examples',
      title: bi('Moving in', 'Нанасяне'),
      blocks: [
        { t: 'de', de: 'Ich stelle die Lampe in die Ecke.', gloss: bi('I am putting the lamp in the corner.', 'Слагам лампата в ъгъла.'), audio: true },
        { t: 'de', de: 'Ich lege das Buch auf den Tisch.', gloss: bi('I am putting the book on the table.', 'Слагам книгата на масата.'), audio: true },
        { t: 'de', de: 'Ich hänge das Bild an die Wand.', gloss: bi('I am hanging the picture on the wall.', 'Закачам картината на стената.'), audio: true },
        { t: 'de', de: 'Ich bin letztes Jahr nach Berlin umgezogen.', gloss: bi('I moved to Berlin last year.', 'Преместих се в Берлин миналата година.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'umziehen is separable and takes sein, so its Perfekt is bin … umgezogen — both A2 rules from Unit 1 in one word.',
            'umziehen е делим и взима sein, затова перфектът му е bin … umgezogen — двете правила от раздел 1 на A2 в една дума.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('wohin? → accusative: den, die, das.', 'wohin? → винителен: den, die, das.'),
            bi('stellen and legen always take the accusative.', 'stellen и legen винаги взимат винителен.'),
            bi('stehen and liegen always take the dative.', 'stehen и liegen винаги взимат дателен.'),
            bi('Ask the question before you write the article.', 'Задай въпроса, преди да напишеш члена.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      exercise({
        id: 'a2u2l2-ex1',
        kind: 'articleRecall',
        level: 'a2',
        objective: bi('wo or wohin?', 'wo или wohin?'),
        mandatoryRetype: false,
        steps: [
          {
            prompt: bi('I am putting the lamp into the corner.', 'Слагам лампата в ъгъла.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Ich stelle die Lampe in ___ Ecke.',
            answer: 'die',
            shape: 'word',
            hints: [bi('It is going somewhere, so wohin.', 'Отива някъде, значи wohin.')],
          },
          {
            prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Die Lampe steht in ___ Ecke.',
            answer: 'der',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I am putting the book on the table.', 'Слагам книгата на масата.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Ich lege das Buch auf ___ Tisch.',
            answer: 'den',
            shape: 'word',
            hints: [bi('Masculine accusative.', 'Мъжки род, винителен.')],
          },
          {
            prompt: bi('The book is on the table.', 'Книгата е на масата.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Das Buch liegt auf ___ Tisch.',
            answer: 'dem',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      typeIt(
        'a2u2l2-ex2',
        bi('Say where it is going', 'Кажи накъде отива'),
        [
          {
            prompt: bi('I am putting the lamp in the corner.', 'Слагам лампата в ъгъла.'),
            answer: 'Ich stelle die Lampe in die Ecke.',
            reviewTargets: ['v-stellen', 'p-wohin-akkusativ'],
            hints: [],
            traps: [
              {
                answer: 'Ich stelle die Lampe in der Ecke.',
                category: 'case',
                feedback: bi(
                  'The lamp is going somewhere, so this answers wohin? and takes the accusative: in die Ecke.',
                  'Лампата отива някъде, значи това отговаря на wohin? и взима винителен: in die Ecke. (Българското „в ъгъла“ не се мени, но немското се мени.)',
                ),
              },
            ],
          },
          {
            prompt: bi('I am putting the book on the table.', 'Слагам книгата на масата.'),
            answer: 'Ich lege das Buch auf den Tisch.',
            reviewTargets: ['v-legen'],
            hints: [],
          },
          {
            prompt: bi('I am hanging the picture on the wall.', 'Закачам картината на стената.'),
            answer: 'Ich hänge das Bild an die Wand.',
            hints: [],
          },
          {
            prompt: bi('I moved to Berlin last year.', 'Преместих се в Берлин миналата година.'),
            answer: 'Letztes Jahr bin ich nach Berlin umgezogen.',
            alternatives: ['Ich bin letztes Jahr nach Berlin umgezogen.'],
            reviewTargets: ['v-umziehen'],
            hints: [],
          },
        ],
        ['g-wechselpraepositionen'],
      ),
    ),
    a2(
      wordOrder('a2u2l2-ex3', bi('Both halves', 'И двете половини'), [
        {
          prompt: bi('I am putting the book on the table.', 'Слагам книгата на масата.'),
          bank: ['Ich', 'lege', 'das', 'Buch', 'auf', 'den', 'Tisch'],
          answer: 'Ich lege das Buch auf den Tisch.',
          hints: [],
        },
        {
          prompt: bi('The bag is on the floor.', 'Чантата е на пода.'),
          bank: ['Die', 'Tasche', 'liegt', 'auf', 'dem', 'Boden'],
          answer: 'Die Tasche liegt auf dem Boden.',
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u2l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich stelle die Lampe in die Ecke.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich lege das Buch auf den Tisch.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u2l2-m1', bi('Which question does it answer?', 'На кой въпрос отговаря?'), [
          {
            prompt: bi('I am putting the lamp in the corner.', 'Слагам лампата в ъгъла.'),
            answer: 'Ich stelle die Lampe in die Ecke.',
            hints: [],
          },
          {
            prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
            answer: 'Die Lampe steht in der Ecke.',
            hints: [],
          },
          {
            prompt: bi('I am putting the book on the table.', 'Слагам книгата на масата.'),
            answer: 'Ich lege das Buch auf den Tisch.',
            hints: [],
          },
        ]),
      ),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'One question decides the case, and the verb you chose has already answered it. stellen and legen mean movement; stehen and liegen mean rest.',
        'Един въпрос решава падежа, а глаголът, който си избрал, вече е отговорил на него. stellen и legen значат движение; stehen и liegen значат покой.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — when something is broken
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a2-u2-l3',
  unitId: 'a2-u2',
  level: 'a2',
  order: 3,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('When something is broken: weil', 'Когато нещо се счупи: weil'),
  objective: bi(
    'After this lesson you will be able to report a problem and explain why you are calling — with the verb where German puts it.',
    'След този урок ще можеш да съобщиш за проблем и да обясниш защо се обаждаш — с глагола там, където немският го слага.',
  ),
  outcomes: [
    bi('I can say something is broken or not working.', 'Мога да кажа, че нещо е счупено или не работи.'),
    bi('I can use weil and put the verb last.', 'Мога да използвам weil и да сложа глагола последен.'),
    bi('I can call a landlord and explain the problem.', 'Мога да се обадя на хазяина и да обясня проблема.'),
    bi('I remember the comma before weil.', 'Помня запетаята преди weil.'),
  ],
  vocabIds: ['v-die-heizung', 'v-kaputt', 'v-reparieren', 'v-funktionieren', 'v-anrufen', 'v-der-vermieter', 'v-die-miete', 'v-das-problem', 'v-weil'],
  grammarIds: ['g-weil'],
  sections: [
    {
      id: 'a2u2l3-intro',
      kind: 'intro',
      title: bi('The phone call', 'Телефонното обаждане'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Something has broken and you have to call someone about it. That is two sentences — what is wrong, and why you are calling — and joining them is what weil is for.',
            'Нещо се е счупило и трябва да се обадиш за него. Това са две изречения — какво не е наред и защо се обаждаш — и weil служи именно да ги свърже.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l3-vocab',
      kind: 'vocabulary',
      title: bi('When it does not work', 'Когато не работи'),
      vocabIds: ['v-die-heizung', 'v-kaputt', 'v-funktionieren', 'v-reparieren', 'v-anrufen', 'v-der-vermieter', 'v-die-miete', 'v-das-problem'],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'People arbeiten; machines funktionieren. "Die Heizung arbeitet nicht" would sound as odd as saying the heating has a job.',
            'Хората arbeiten; машините funktionieren. „Die Heizung arbeitet nicht“ би звучало все едно отоплението е на работа.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l3-grammar',
      kind: 'grammar',
      title: bi('weil and the verb at the end', 'weil и глаголът в края'),
      blocks: [],
      grammarId: 'g-weil',
    },
    {
      id: 'a2u2l3-examples',
      kind: 'examples',
      title: bi('The whole call', 'Целият разговор'),
      blocks: [
        { t: 'de', de: 'Die Heizung funktioniert nicht.', gloss: bi('The heating is not working.', 'Отоплението не работи.'), audio: true },
        { t: 'de', de: 'Ich rufe an, weil die Heizung kaputt ist.', gloss: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'), audio: true },
        { t: 'de', de: 'Können Sie die Heizung reparieren?', gloss: bi('Can you repair the heating?', 'Можете ли да поправите отоплението?'), audio: true },
        { t: 'de', de: 'Ich habe den Vermieter angerufen.', gloss: bi('I called the landlord.', 'Обадих се на хазяина.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Two different ends of the sentence are in play here. In "Ich rufe an" the separable prefix is last; in "…, weil die Heizung kaputt ist" the whole verb is last. Both feel like the same habit, and they are.',
            'Тук са в действие два различни „края“ на изречението. В „Ich rufe an“ последна е делимата представка; в „…, weil die Heizung kaputt ist“ последен е целият глагол. И двете са един и същи навик — и наистина са.',
          ),
        },
      ],
    },
    {
      id: 'a2u2l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('weil sends the verb to the end of its clause.', 'weil праща глагола в края на своето изречение.'),
            bi('There is always a comma before weil.', 'Винаги има запетая преди weil.'),
            bi('kaputt for broken, funktioniert nicht for not working.', 'kaputt за счупено, funktioniert nicht за „не работи“.'),
            bi('anrufen is separable: Ich rufe an.', 'anrufen е делим: Ich rufe an.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      typeIt(
        'a2u2l3-ex1',
        bi('Report the problem', 'Съобщи проблема'),
        [
          {
            prompt: bi('The heating is not working.', 'Отоплението не работи.'),
            answer: 'Die Heizung funktioniert nicht.',
            reviewTargets: ['v-die-heizung', 'p-funktioniert-nicht'],
            hints: [],
          },
          {
            prompt: bi('The lamp is broken.', 'Лампата е счупена.'),
            answer: 'Die Lampe ist kaputt.',
            reviewTargets: ['v-kaputt'],
            hints: [],
          },
          {
            prompt: bi('I am calling the landlord.', 'Обаждам се на хазяина.'),
            answer: 'Ich rufe den Vermieter an.',
            reviewTargets: ['v-anrufen'],
            hints: [bi('Separable — the an goes last.', 'Делим — an отива последно.')],
          },
        ],
      ),
    ),
    a2(
      wordOrder('a2u2l3-ex2', bi('Send the verb to the end', 'Прати глагола в края'), [
        {
          prompt: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'),
          bank: ['Ich', 'rufe', 'an,', 'weil', 'die', 'Heizung', 'kaputt', 'ist'],
          answer: 'Ich rufe an, weil die Heizung kaputt ist.',
          hints: [bi('ist goes last, after kaputt.', 'ist отива последно, след kaputt.')],
        },
        {
          prompt: bi('I am staying at home because I have no time.', 'Оставам вкъщи, защото нямам време.'),
          bank: ['Ich', 'bleibe', 'zu', 'Hause,', 'weil', 'ich', 'keine', 'Zeit', 'habe'],
          answer: 'Ich bleibe zu Hause, weil ich keine Zeit habe.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u2l3-ex3',
        bi('Explain why', 'Обясни защо'),
        [
          {
            prompt: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'),
            answer: 'Ich rufe an, weil die Heizung kaputt ist.',
            reviewTargets: ['v-weil', 'p-weil'],
            hints: [],
            traps: [
              {
                answer: 'Ich rufe an, weil die Heizung ist kaputt.',
                category: 'word-order',
                feedback: bi(
                  'After weil the verb goes to the very end: weil die Heizung kaputt ist.',
                  'След weil глаголът отива чак накрая: weil die Heizung kaputt ist. Свободният български словоред тук не важи.',
                ),
              },
              {
                answer: 'Ich rufe an weil die Heizung kaputt ist.',
                category: 'punctuation',
                feedback: bi(
                  'German always puts a comma before weil.',
                  'Немският винаги слага запетая преди weil.',
                ),
              },
            ],
          },
          {
            prompt: bi('I am staying at home because I am ill.', 'Оставам вкъщи, защото съм болен.'),
            answer: 'Ich bleibe zu Hause, weil ich krank bin.',
            hints: [bi('bin goes last.', 'bin отива последно.')],
          },
          {
            prompt: bi('I am not coming because I have no time.', 'Няма да дойда, защото нямам време.'),
            answer: 'Ich komme nicht, weil ich keine Zeit habe.',
            hints: [],
          },
        ],
        ['g-weil'],
      ),
    ),
    a2(
      dictation('a2u2l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Heizung funktioniert nicht.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich rufe an, weil die Heizung kaputt ist.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a2(
      freeWriting('a2u2l3-ex5', bi('Make the call', 'Обади се'), [
        {
          prompt: bi(
            'Write three sentences to your landlord: say what is broken, say why you are calling, and ask whether it can be repaired.',
            'Напиши три изречения до хазяина си: кажи какво е счупено, защо се обаждаш и попитай може ли да се поправи.',
          ),
          instruction: bi(
            'One of them has to use weil, with the verb at the end.',
            'В едно от тях трябва да има weil, с глагола накрая.',
          ),
          answer:
            'Die Heizung ist kaputt. Ich rufe an, weil die Heizung nicht funktioniert. Können Sie die Heizung reparieren?',
          shape: 'sentence',
          requiredTokens: ['weil', 'kaputt', 'reparieren'],
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u2l3-m1', bi('Problem and reason', 'Проблем и причина'), [
          {
            prompt: bi('The heating is not working.', 'Отоплението не работи.'),
            answer: 'Die Heizung funktioniert nicht.',
            hints: [],
          },
          {
            prompt: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'),
            answer: 'Ich rufe an, weil die Heizung kaputt ist.',
            hints: [],
          },
          {
            prompt: bi('I am staying at home because I am ill.', 'Оставам вкъщи, защото съм болен.'),
            answer: 'Ich bleibe zu Hause, weil ich krank bin.',
            hints: [],
          },
        ]),
      ),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'weil is the first word that rearranges a clause, and it will not be the last: dass and wenn do exactly the same thing. Getting the habit now costs one unit and saves three.',
        'weil е първата дума, която пренарежда изречението, и няма да е последната: dass и wenn правят точно същото. Навикът сега струва един раздел и спестява три.',
      ),
    },
  ],
};

/* ================================================================== *
 * Checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a2-u2',
  scope: 'unit',
  targetId: 'a2-u2',
  status: 'available',
  title: bi('Unit 2 checkpoint', 'Проверка на раздел 2'),
  description: bi(
    'Where things are, where they are going, and why you are calling about them.',
    'Къде са нещата, накъде отиват и защо се обаждаш за тях.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a2(
      exercise({
        id: 'cp-a2u2-1',
        kind: 'articleRecall',
        level: 'a2',
        objective: bi('wo or wohin', 'wo или wohin'),
        mandatoryRetype: false,
        steps: [
          {
            prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Die Lampe steht in ___ Ecke.',
            answer: 'der',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I am putting the lamp into the corner.', 'Слагам лампата в ъгъла.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Ich stelle die Lampe in ___ Ecke.',
            answer: 'die',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I am putting the book on the table.', 'Слагам книгата на масата.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Ich lege das Buch auf ___ Tisch.',
            answer: 'den',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('The book is on the table.', 'Книгата е на масата.'),
            instruction: bi('Type the article only.', 'Напиши само члена.'),
            scaffold: 'Das Buch liegt auf ___ Tisch.',
            answer: 'dem',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      typeIt('cp-a2u2-2', bi('Where things are', 'Къде са нещата'), [
        {
          prompt: bi('The picture is on the wall.', 'Картината е на стената.'),
          answer: 'Das Bild hängt an der Wand.',
          hints: [],
        },
        {
          prompt: bi('The books are on the shelf.', 'Книгите са на рафта.'),
          answer: 'Die Bücher stehen im Regal.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u2-3', bi('Where they are going', 'Накъде отиват'), [
        {
          prompt: bi('I am hanging the picture on the wall.', 'Закачам картината на стената.'),
          answer: 'Ich hänge das Bild an die Wand.',
          hints: [],
        },
        {
          prompt: bi('I am putting the lamp in the corner.', 'Слагам лампата в ъгъла.'),
          answer: 'Ich stelle die Lampe in die Ecke.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u2-4', bi('Because', 'Защото'), [
        {
          prompt: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'),
          answer: 'Ich rufe an, weil die Heizung kaputt ist.',
          hints: [],
        },
        {
          prompt: bi('I am staying at home because I have no time.', 'Оставам вкъщи, защото нямам време.'),
          answer: 'Ich bleibe zu Hause, weil ich keine Zeit habe.',
          hints: [],
        },
        {
          prompt: bi('The heating is not working.', 'Отоплението не работи.'),
          answer: 'Die Heizung funktioniert nicht.',
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('cp-a2u2-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Buch liegt auf dem Tisch.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich rufe an, weil die Heizung kaputt ist.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A2_UNIT_2: Unit = {
  id: 'a2-u2',
  level: 'a2',
  order: 2,
  status: 'available',
  title: bi('Home, city and services', 'Дом, град и услуги'),
  summary: bi(
    'The two-way prepositions, the verb pairs that decide the case for you, and weil — the first word that sends a verb to the end.',
    'Двупосочните предлози, двойките глаголи, които решават падежа вместо теб, и weil — първата дума, която праща глагол в края.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A2_U2_PATTERNS = PATTERNS;
