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
 * A2 Unit 5 — Travel and problems.
 *
 * The last A2 unit. Comparison is the one topic in the level where German is
 * simpler than English and harder than Bulgarian, and each path is told which.
 *
 * English splits its comparatives by length — bigger, but *more* interesting —
 * so an English speaker reliably produces *mehr interessant*. German has no
 * such split: everything takes -er. One rule instead of two, and the English
 * path is told it is getting a discount.
 *
 * Bulgarian is more regular still: „по-" and „най-" are prefixes that never
 * touch the word. A Bulgarian speaker has never had to change an adjective to
 * compare it, so the umlauts (groß → größer, alt → älter) are the genuinely new
 * work, and „от" → als is the small trap beside them.
 *
 * The adjective endings are kept as small as A1 kept the dative: definite
 * article only, nominative and accusative only, and the lesson says out loud
 * that this is one corner rather than the system. Five of the six forms are -e,
 * which makes the working rule short enough to hold under pressure.
 */

/** The shorthands default to pre-a1; everything in this file is A2. */
const a2 = (ex: Exercise): Exercise => ({ ...ex, level: 'a2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-komparativ-als',
    template: '___ ist ___er als ___.',
    example: 'Der Zug ist schneller als der Bus.',
    gloss: bi('___ is ___er than ___.', '___ е по-___ от ___.'),
    level: 'a2',
    grammarIds: ['g-komparativ'],
  },
  {
    id: 'p-am-besten',
    template: '___ ist am ___sten.',
    example: 'Der Zug ist am schnellsten.',
    gloss: bi('___ is the ___est.', '___ е най-___.'),
    level: 'a2',
    grammarIds: ['g-superlativ'],
  },
  {
    id: 'p-adjektiv-vor-nomen',
    template: 'Das ist der ___e ___.',
    example: 'Das ist der schnelle Zug.',
    gloss: bi('That is the ___ ___.', 'Това е ___ ___.'),
    level: 'a2',
    grammarIds: ['g-adjektivendungen'],
  },
  {
    id: 'p-verspaetung',
    template: 'Der ___ hat Verspätung.',
    example: 'Der Zug hat Verspätung.',
    gloss: bi('The ___ is delayed.', '___ има закъснение.'),
    level: 'a2',
  },
];

/* ================================================================== *
 * Lesson 1 — comparing two things
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a2-u5-l1',
  unitId: 'a2-u5',
  level: 'a2',
  order: 1,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Faster, cheaper: comparing two things', 'По-бързо, по-евтино: сравняване на две неща'),
  objective: bi(
    'After this lesson you will be able to weigh two options against each other — which is what planning a journey actually is.',
    'След този урок ще можеш да претеглиш две възможности една срещу друга — а точно това е планирането на пътуване.',
  ),
  outcomes: [
    bi('I can add -er to any adjective.', 'Мога да добавя -er към всяко прилагателно.'),
    bi('I use als for "than", not wie.', 'Използвам als за „от“ при сравнение, не wie.'),
    bi('I know the adjectives that take an umlaut.', 'Знам прилагателните, които взимат умлаут.'),
    bi('I know gut → besser.', 'Знам gut → besser.'),
  ],
  vocabIds: ['v-schnell', 'v-langsam', 'v-der-flug', 'v-interessant', 'v-schoen', 'v-gut-adj'],
  grammarIds: ['g-komparativ'],
  sections: [
    {
      id: 'a2u5l1-intro',
      kind: 'intro',
      title: bi('One ending for every adjective', 'Едно окончание за всяко прилагателно'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German compares with -er and joins with als. There is no second pattern for long words, and no separate word to put in front.',
            'Немският сравнява с -er и свързва с als. Няма втори модел за дългите думи и няма отделна дума, която да се слага отпред.',
          ),
        },
        {
          t: 'de',
          de: 'Der Zug ist schneller als der Bus.',
          gloss: bi('The train is faster than the bus.', 'Влакът е по-бърз от автобуса.'),
          audio: true,
        },
      ],
    },
    {
      id: 'a2u5l1-vocab',
      kind: 'vocabulary',
      title: bi('Things worth comparing', 'Неща, които си струва да се сравнят'),
      vocabIds: ['v-schnell', 'v-langsam', 'v-der-flug', 'v-interessant', 'v-schoen', 'v-gut-adj'],
      blocks: [],
    },
    {
      id: 'a2u5l1-grammar',
      kind: 'grammar',
      title: bi('-er and als', '-er и als'),
      blocks: [],
      grammarId: 'g-komparativ',
    },
    {
      id: 'a2u5l1-examples',
      kind: 'examples',
      title: bi('Planning a journey', 'Планиране на пътуване'),
      blocks: [
        { t: 'de', de: 'Der Flug war billiger als der Zug.', gloss: bi('The flight was cheaper than the train.', 'Полетът беше по-евтин от влака.'), audio: true },
        { t: 'de', de: 'Der Bus ist langsamer als der Zug.', gloss: bi('The bus is slower than the train.', 'Автобусът е по-бавен от влака.'), audio: true },
        { t: 'de', de: 'Die Stadt ist interessanter als das Dorf.', gloss: bi('The city is more interesting than the village.', 'Градът е по-интересен от селото.'), audio: true },
        { t: 'de', de: 'Das Hotel war besser als das Hostel.', gloss: bi('The hotel was better than the hostel.', 'Хотелът беше по-добър от хостела.'), audio: true },
      ],
    },
    {
      id: 'a2u5l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('-er on every adjective, however long.', '-er на всяко прилагателно, колкото и дълго да е.'),
            bi('als for "than"; wie only for "as … as".', 'als за сравнение; wie само за „толкова, колкото“.'),
            bi('Short adjectives often add an umlaut: größer, älter.', 'Късите прилагателни често добавят умлаут: größer, älter.'),
            bi('gut → besser, and nothing predicts it.', 'gut → besser, и нищо не го предсказва.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      fillBlank('a2u5l1-ex1', bi('Build the comparative', 'Построй сравнителната степен'), [
        {
          prompt: bi('schnell → ?', 'schnell → ?'),
          scaffold: 'Der Zug ist ___ als der Bus.',
          answer: 'schneller',
          shape: 'word',
          reviewTargets: ['v-schnell'],
          hints: [],
        },
        {
          prompt: bi('interessant → ?', 'interessant → ?'),
          scaffold: 'Die Stadt ist ___ als das Dorf.',
          answer: 'interessanter',
          shape: 'word',
          reviewTargets: ['v-interessant'],
          hints: [bi('Long, and still just -er.', 'Дълго, и пак само -er.')],
          traps: [
            {
              answer: 'mehr interessant',
              category: 'adjective-ending',
              feedback: bi(
                'German never uses a separate word for this. Every adjective takes -er, however long: interessanter.',
                'Немският никога не използва отделна дума за това. Всяко прилагателно взима -er, колкото и дълго да е: interessanter.',
              ),
            },
          ],
        },
        {
          prompt: bi('gut → ?', 'gut → ?'),
          scaffold: 'Das Hotel war ___ als das Hostel.',
          answer: 'besser',
          shape: 'word',
          reviewTargets: ['v-besser'],
          hints: [],
          traps: [
            {
              answer: 'guter',
              category: 'adjective-ending',
              feedback: bi(
                'gut is irregular: gut → besser → am besten. It is the one comparison worth learning by heart.',
                'gut е неправилно: gut → besser → am besten. Това е сравнението, което си струва да се знае наизуст.',
              ),
            },
          ],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u5l1-ex2',
        bi('Compare them', 'Сравни ги'),
        [
          {
            prompt: bi('The train is faster than the bus.', 'Влакът е по-бърз от автобуса.'),
            answer: 'Der Zug ist schneller als der Bus.',
            reviewTargets: ['p-komparativ-als'],
            hints: [],
            traps: [
              {
                answer: 'Der Zug ist schneller wie der Bus.',
                category: 'vocabulary',
                feedback: bi(
                  'Comparing two different things takes als. wie is for saying they are the same: so schnell wie der Bus.',
                  'Сравняването на две различни неща иска als. wie е за това, че са еднакви: so schnell wie der Bus.',
                ),
              },
              {
                answer: 'Der Zug ist schneller von der Bus.',
                category: 'preposition',
                feedback: bi(
                  'The word is als, not von.',
                  'Думата е als, не von. Българското „от“ при сравнение не се превежда буквално.',
                ),
              },
            ],
          },
          {
            prompt: bi('The flight was cheaper than the train.', 'Полетът беше по-евтин от влака.'),
            answer: 'Der Flug war billiger als der Zug.',
            reviewTargets: ['v-der-flug'],
            hints: [],
          },
          {
            prompt: bi('The bus is slower than the train.', 'Автобусът е по-бавен от влака.'),
            answer: 'Der Bus ist langsamer als der Zug.',
            reviewTargets: ['v-langsam'],
            hints: [],
          },
        ],
        ['g-komparativ'],
      ),
    ),
    a2(
      dictation('a2u5l1-ex3', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Zug ist schneller als der Bus.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Hotel war besser.',
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
        typeIt('a2u5l1-m1', bi('Two things, weighed', 'Две неща, претеглени'), [
          {
            prompt: bi('The train is faster than the bus.', 'Влакът е по-бърз от автобуса.'),
            answer: 'Der Zug ist schneller als der Bus.',
            hints: [],
          },
          {
            prompt: bi('The city is more interesting than the village.', 'Градът е по-интересен от селото.'),
            answer: 'Die Stadt ist interessanter als das Dorf.',
            hints: [],
          },
          {
            prompt: bi('The hotel was better.', 'Хотелът беше по-добър.'),
            answer: 'Das Hotel war besser.',
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
        'One ending, one joining word, and a short list of umlauts. Next: what to say when one thing beats everything else.',
        'Едно окончание, една свързваща дума и кратък списък с умлаути. Следва: какво да кажеш, когато едно нещо бие всички останали.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — the best of all
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a2-u5-l2',
  unitId: 'a2-u5',
  level: 'a2',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('The best of all: am besten', 'Най-доброто от всички: am besten'),
  objective: bi(
    'After this lesson you will be able to say which one is best — and put an adjective in front of a noun for the first time.',
    'След този урок ще можеш да кажеш кое е най-доброто — и за първи път ще сложиш прилагателно пред съществително.',
  ),
  outcomes: [
    bi('I can use am …sten.', 'Мога да използвам am …sten.'),
    bi('I can say der beste, die beste, das beste.', 'Мога да кажа der beste, die beste, das beste.'),
    bi('I know gut, besser, am besten by heart.', 'Знам gut, besser, am besten наизуст.'),
    bi('I can buy a ticket and talk about a suitcase.', 'Мога да си купя билет и да говоря за куфар.'),
  ],
  vocabIds: ['v-die-fahrkarte', 'v-der-koffer', 'v-puenktlich'],
  grammarIds: ['g-superlativ', 'g-adjektivendungen'],
  sections: [
    {
      id: 'a2u5l2-intro',
      kind: 'intro',
      title: bi('Two shapes, one meaning', 'Две форми, едно значение'),
      blocks: [
        {
          t: 'contrast',
          de: 'Der Zug ist am schnellsten. / Das ist der schnellste Zug.',
          other: bi(
            'The train is the fastest. / That is the fastest train.',
            'Влакът е най-бърз. / Това е най-бързият влак.',
          ),
          note: bi(
            'Standing alone it is am …sten. In front of a noun it takes an article and an ending.',
            'Самостоятелно е am …sten. Пред съществително взима член и окончание.',
          ),
        },
      ],
    },
    {
      id: 'a2u5l2-vocab',
      kind: 'vocabulary',
      title: bi('At the station', 'На гарата'),
      vocabIds: ['v-die-fahrkarte', 'v-der-koffer', 'v-puenktlich'],
      blocks: [],
    },
    {
      id: 'a2u5l2-grammar',
      kind: 'grammar',
      title: bi('The superlative', 'Превъзходната степен'),
      blocks: [],
      grammarId: 'g-superlativ',
    },
    {
      id: 'a2u5l2-endings',
      kind: 'grammar',
      title: bi('An adjective in front of a noun', 'Прилагателно пред съществително'),
      blocks: [],
      grammarId: 'g-adjektivendungen',
    },
    {
      id: 'a2u5l2-examples',
      kind: 'examples',
      title: bi('Choosing', 'Избор'),
      blocks: [
        { t: 'de', de: 'Der Zug ist am schnellsten.', gloss: bi('The train is the fastest.', 'Влакът е най-бърз.'), audio: true },
        { t: 'de', de: 'Das ist der schnellste Zug.', gloss: bi('That is the fastest train.', 'Това е най-бързият влак.'), audio: true },
        { t: 'de', de: 'Das war das beste Hotel.', gloss: bi('That was the best hotel.', 'Това беше най-добрият хотел.'), audio: true },
        { t: 'de', de: 'Ich kaufe die billigste Fahrkarte.', gloss: bi('I am buying the cheapest ticket.', 'Купувам най-евтиния билет.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Notice the endings: der schnellste, das beste, die billigste — all -e, because five of the six forms are.',
            'Забележи окончанията: der schnellste, das beste, die billigste — всички на -e, защото пет от шестте форми са такива.',
          ),
        },
      ],
    },
    {
      id: 'a2u5l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Alone: am schnellsten.', 'Самостоятелно: am schnellsten.'),
            bi('Before a noun: der schnellste Zug.', 'Пред съществително: der schnellste Zug.'),
            bi('gut, besser, am besten.', 'gut, besser, am besten.'),
            bi('After der/die/das the ending is -e.', 'След der/die/das окончанието е -e.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      fillBlank('a2u5l2-ex1', bi('Alone or in front of a noun?', 'Самостоятелно или пред съществително?'), [
        {
          prompt: bi('The train is the fastest.', 'Влакът е най-бърз.'),
          scaffold: 'Der Zug ist ___ schnellsten.',
          answer: 'am',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('That is the fastest train.', 'Това е най-бързият влак.'),
          scaffold: 'Das ist der ___ Zug.',
          answer: 'schnellste',
          shape: 'word',
          hints: [bi('Article in front, so an ending on the end.', 'Член отпред, значи окончание накрая.')],
        },
        {
          prompt: bi('That was the best hotel.', 'Това беше най-добрият хотел.'),
          scaffold: 'Das war das ___ Hotel.',
          answer: 'beste',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u5l2-ex2',
        bi('Which is best', 'Кое е най-добро'),
        [
          {
            prompt: bi('The train is the fastest.', 'Влакът е най-бърз.'),
            answer: 'Der Zug ist am schnellsten.',
            reviewTargets: ['p-am-besten'],
            hints: [],
          },
          {
            prompt: bi('That was the best hotel.', 'Това беше най-добрият хотел.'),
            answer: 'Das war das beste Hotel.',
            hints: [],
          },
          {
            prompt: bi('I am buying the cheapest ticket.', 'Купувам най-евтиния билет.'),
            answer: 'Ich kaufe die billigste Fahrkarte.',
            reviewTargets: ['v-die-fahrkarte'],
            hints: [],
          },
          {
            prompt: bi('The train was on time.', 'Влакът беше навреме.'),
            answer: 'Der Zug war pünktlich.',
            reviewTargets: ['v-puenktlich'],
            hints: [],
          },
        ],
        ['g-superlativ'],
      ),
    ),
    a2(
      exercise({
        id: 'a2u5l2-ex3',
        kind: 'fillBlank',
        level: 'a2',
        objective: bi('The ending after der, die, das', 'Окончанието след der, die, das'),
        steps: [
          {
            prompt: bi('the fast train (subject) — schnell', 'бързият влак (подлог) — schnell'),
            scaffold: 'Der ___ Zug fährt um acht.',
            answer: 'schnelle',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('the fast train (object) — schnell', 'бързия влак (допълнение) — schnell'),
            scaffold: 'Ich nehme den ___ Zug.',
            answer: 'schnellen',
            shape: 'word',
            hints: [bi('Masculine object — the one exception.', 'Мъжко допълнение — единственото изключение.')],
          },
          {
            prompt: bi('the beautiful city — schön', 'красивият град — schön'),
            scaffold: 'Die ___ Stadt ist groß.',
            answer: 'schöne',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      dictation('a2u5l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Zug ist am schnellsten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das war das beste Hotel.',
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
        typeIt('a2u5l2-m1', bi('The best', 'Най-доброто'), [
          {
            prompt: bi('The train is the fastest.', 'Влакът е най-бърз.'),
            answer: 'Der Zug ist am schnellsten.',
            hints: [],
          },
          {
            prompt: bi('That was the best hotel.', 'Това беше най-добрият хотел.'),
            answer: 'Das war das beste Hotel.',
            hints: [],
          },
          {
            prompt: bi('I am taking the fast train.', 'Взимам бързия влак.'),
            answer: 'Ich nehme den schnellen Zug.',
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
        'Two shapes for the superlative, and one corner of the adjective endings: -e after der, die and das, except the masculine object.',
        'Две форми за превъзходната степен и едно ъгълче от окончанията: -e след der, die и das, освен при мъжкото допълнение.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — when the journey goes wrong
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a2-u5-l3',
  unitId: 'a2-u5',
  level: 'a2',
  order: 3,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('When it goes wrong: delays and missed trains', 'Когато нещо се обърка: закъснения и изпуснати влакове'),
  objective: bi(
    'After this lesson you will be able to say what went wrong on a journey and ask what to do about it.',
    'След този урок ще можеш да кажеш какво се е объркало при пътуване и да попиташ какво да правиш.',
  ),
  outcomes: [
    bi('I can say a train is delayed.', 'Мога да кажа, че влакът има закъснение.'),
    bi('I can say I missed a train or have to change.', 'Мога да кажа, че съм изпуснал влак или трябва да се прекача.'),
    bi('I can explain the problem with weil.', 'Мога да обясня проблема с weil.'),
    bi('I can tell the whole story in the past.', 'Мога да разкажа цялата история в минало време.'),
  ],
  vocabIds: ['v-die-verspaetung', 'v-umsteigen', 'v-verpassen', 'v-das-gepaeck'],
  grammarIds: ['g-perfekt-sein', 'g-weil'],
  sections: [
    {
      id: 'a2u5l3-intro',
      kind: 'intro',
      title: bi('The last lesson needs no new grammar', 'Последният урок няма нужда от нова граматика'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Everything here is a recombination: the Perfekt from Unit 1, weil from Unit 2, the comparative from this unit. Only four words are new, and they are the four things that go wrong on a journey.',
            'Всичко тук е прекомбинация: перфектът от раздел 1, weil от раздел 2, сравнителната степен от този раздел. Нови са само четири думи — и те са четирите неща, които се объркват при пътуване.',
          ),
        },
      ],
    },
    {
      id: 'a2u5l3-vocab',
      kind: 'vocabulary',
      title: bi('What goes wrong', 'Какво се обърква'),
      vocabIds: ['v-die-verspaetung', 'v-umsteigen', 'v-verpassen', 'v-das-gepaeck'],
      blocks: [],
    },
    {
      id: 'a2u5l3-examples',
      kind: 'examples',
      title: bi('A bad journey', 'Лошо пътуване'),
      blocks: [
        { t: 'de', de: 'Der Zug hat Verspätung.', gloss: bi('The train is delayed.', 'Влакът има закъснение.'), audio: true },
        { t: 'de', de: 'Ich habe den Zug verpasst.', gloss: bi('I missed the train.', 'Изпуснах влака.'), audio: true },
        { t: 'de', de: 'Ich muss in München umsteigen.', gloss: bi('I have to change in Munich.', 'Трябва да се прекача в Мюнхен.'), audio: true },
        { t: 'de', de: 'Ich habe den Zug verpasst, weil der Bus Verspätung hatte.', gloss: bi('I missed the train because the bus was delayed.', 'Изпуснах влака, защото автобусът закъсня.'), audio: true },
        { t: 'de', de: 'Mein Gepäck ist weg.', gloss: bi('My luggage is gone.', 'Багажът ми го няма.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'The fourth sentence is the whole level in one line: a Perfekt, a weil, and a verb at the end.',
            'Четвъртото изречение е цялото ниво в един ред: перфект, weil и глагол в края.',
          ),
        },
      ],
    },
    {
      id: 'a2u5l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Der Zug hat Verspätung — no article.', 'Der Zug hat Verspätung — без член.'),
            bi('verpassen takes haben; umsteigen takes sein.', 'verpassen взима haben; umsteigen взима sein.'),
            bi('Both have no ge-: verpasst, umgestiegen has it in the middle.', 'verpasst няма ge-; umgestiegen го има по средата.'),
            bi('weil still sends the verb to the end.', 'weil още праща глагола в края.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      typeIt(
        'a2u5l3-ex1',
        bi('What went wrong', 'Какво се обърка'),
        [
          {
            prompt: bi('The train is delayed.', 'Влакът има закъснение.'),
            answer: 'Der Zug hat Verspätung.',
            reviewTargets: ['v-die-verspaetung', 'p-verspaetung'],
            hints: [],
          },
          {
            prompt: bi('I missed the train.', 'Изпуснах влака.'),
            answer: 'Ich habe den Zug verpasst.',
            reviewTargets: ['v-verpassen'],
            hints: [],
            traps: [
              {
                answer: 'Ich habe den Zug geverpasst.',
                category: 'verb-conjugation',
                feedback: bi(
                  'ver- at the front means no ge- in the participle: verpasst.',
                  'ver- отпред значи без ge- в причастието: verpasst.',
                ),
              },
            ],
          },
          {
            prompt: bi('I have to change in Munich.', 'Трябва да се прекача в Мюнхен.'),
            answer: 'Ich muss in München umsteigen.',
            reviewTargets: ['v-umsteigen'],
            hints: [],
          },
        ],
      ),
    ),
    a2(
      wordOrder('a2u5l3-ex2', bi('Say why', 'Кажи защо'), [
        {
          prompt: bi('I missed the train because the bus was delayed.', 'Изпуснах влака, защото автобусът закъсня.'),
          bank: ['Ich', 'habe', 'den', 'Zug', 'verpasst,', 'weil', 'der', 'Bus', 'Verspätung', 'hatte'],
          answer: 'Ich habe den Zug verpasst, weil der Bus Verspätung hatte.',
          hints: [bi('hatte goes last.', 'hatte отива последно.')],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u5l3-ex3',
        bi('The whole story', 'Цялата история'),
        [
          {
            prompt: bi('I missed the train because the bus was delayed.', 'Изпуснах влака, защото автобусът закъсня.'),
            answer: 'Ich habe den Zug verpasst, weil der Bus Verspätung hatte.',
            hints: [],
          },
          {
            prompt: bi('My luggage is gone.', 'Багажът ми го няма.'),
            answer: 'Mein Gepäck ist weg.',
            reviewTargets: ['v-das-gepaeck'],
            hints: [],
          },
          {
            prompt: bi('The next train is slower.', 'Следващият влак е по-бавен.'),
            answer: 'Der nächste Zug ist langsamer.',
            hints: [],
          },
        ],
      ),
    ),
    a2(
      dictation('a2u5l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Zug hat Verspätung.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe den Zug verpasst.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a2(
      freeWriting('a2u5l3-ex5', bi('Tell the story of a bad journey', 'Разкажи за едно лошо пътуване'), [
        {
          prompt: bi(
            'Write four sentences about a journey that went wrong: where you went, what happened, why, and how it compared with another time.',
            'Напиши четири изречения за пътуване, което се е объркало: къде отиде, какво стана, защо и как беше в сравнение с друг път.',
          ),
          instruction: bi(
            'A Perfekt, a weil and a comparative all have to appear.',
            'Трябва да се появят перфект, weil и сравнителна степен.',
          ),
          answer:
            'Ich bin nach München gefahren. Ich habe den Zug verpasst, weil der Bus Verspätung hatte. Der nächste Zug war langsamer. Die Reise war schlechter als letztes Jahr.',
          shape: 'sentence',
          requiredTokens: ['weil', 'verpasst', 'als'],
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u5l3-m1', bi('Under pressure', 'Под напрежение'), [
          {
            prompt: bi('The train is delayed.', 'Влакът има закъснение.'),
            answer: 'Der Zug hat Verspätung.',
            hints: [],
          },
          {
            prompt: bi('I missed the train.', 'Изпуснах влака.'),
            answer: 'Ich habe den Zug verpasst.',
            hints: [],
          },
          {
            prompt: bi('I have to change in Munich.', 'Трябва да се прекача в Мюнхен.'),
            answer: 'Ich muss in München umsteigen.',
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
        'That is A2: a past tense, three conjunctions, two cases after a preposition, reflexive verbs and comparison — enough to tell somebody what happened and what you thought of it.',
        'Това е A2: минало време, три съюза, два падежа след предлог, възвратни глаголи и сравнение — достатъчно, за да разкажеш на някого какво е станало и какво мислиш за него.',
      ),
    },
  ],
};

/* ================================================================== *
 * Checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a2-u5',
  scope: 'unit',
  targetId: 'a2-u5',
  status: 'available',
  title: bi('Unit 5 checkpoint', 'Проверка на раздел 5'),
  description: bi(
    'Comparing, choosing the best, and saying what went wrong.',
    'Сравняване, избор на най-доброто и разказ какво се е объркало.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a2(
      typeIt('cp-a2u5-1', bi('Comparing', 'Сравняване'), [
        {
          prompt: bi('The train is faster than the bus.', 'Влакът е по-бърз от автобуса.'),
          answer: 'Der Zug ist schneller als der Bus.',
          hints: [],
        },
        {
          prompt: bi('The city is more interesting than the village.', 'Градът е по-интересен от селото.'),
          answer: 'Die Stadt ist interessanter als das Dorf.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u5-2', bi('The best', 'Най-доброто'), [
        {
          prompt: bi('The train is the fastest.', 'Влакът е най-бърз.'),
          answer: 'Der Zug ist am schnellsten.',
          hints: [],
        },
        {
          prompt: bi('That was the best hotel.', 'Това беше най-добрият хотел.'),
          answer: 'Das war das beste Hotel.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u5-3', bi('When it goes wrong', 'Когато се обърка'), [
        {
          prompt: bi('The train is delayed.', 'Влакът има закъснение.'),
          answer: 'Der Zug hat Verspätung.',
          hints: [],
        },
        {
          prompt: bi('I missed the train.', 'Изпуснах влака.'),
          answer: 'Ich habe den Zug verpasst.',
          hints: [],
        },
        {
          prompt: bi('I missed the train because the bus was delayed.', 'Изпуснах влака, защото автобусът закъсня.'),
          answer: 'Ich habe den Zug verpasst, weil der Bus Verspätung hatte.',
          hints: [],
        },
      ]),
    ),
    a2(
      exercise({
        id: 'cp-a2u5-4',
        kind: 'fillBlank',
        level: 'a2',
        objective: bi('The ending', 'Окончанието'),
        steps: [
          {
            prompt: bi('the fast train (subject) — schnell', 'бързият влак (подлог) — schnell'),
            scaffold: 'Der ___ Zug fährt um acht.',
            answer: 'schnelle',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('the fast train (object) — schnell', 'бързия влак (допълнение) — schnell'),
            scaffold: 'Ich nehme den ___ Zug.',
            answer: 'schnellen',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('gut → ?', 'gut → ?'),
            scaffold: 'Das Hotel war ___ als das Hostel.',
            answer: 'besser',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      dictation('cp-a2u5-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Zug ist am schnellsten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Zug hat Verspätung.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A2_UNIT_5: Unit = {
  id: 'a2-u5',
  level: 'a2',
  order: 5,
  status: 'available',
  title: bi('Travel and problems', 'Пътуване и проблеми'),
  summary: bi(
    'Comparison — where German is simpler than English and harder than Bulgarian — the superlative, one corner of the adjective endings, and the four things that go wrong on a journey.',
    'Сравнение — където немският е по-прост от английския и по-труден от българския — превъзходна степен, едно ъгълче от окончанията на прилагателните и четирите неща, които се объркват при пътуване.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A2_U5_PATTERNS = PATTERNS;
