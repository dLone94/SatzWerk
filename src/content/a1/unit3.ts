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
 * A1 Unit 3 — Food, cafés and shopping.
 *
 * The test this unit is written against is a practical one: can the learner get
 * through a German café and a German supermarket without switching to English?
 * So the content is a transaction from start to finish — choosing, ordering,
 * asking a price, paying, and buying a quantity of something — rather than a
 * themed word list.
 *
 * Grammatically it is a consolidation unit wearing a vocabulary unit's clothes.
 * Ordering is the accusative (einen Kaffee), möchten is Unit 2's modal pattern
 * met politely, and the quantity phrase is the one construction where a
 * Bulgarian speaker can translate word for word and be right — which is worth
 * saying out loud, because most of this course tells them the opposite.
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-moechte',
    template: 'Ich möchte ___, bitte.',
    example: 'Ich möchte einen Kaffee, bitte.',
    gloss: bi('I would like ___, please.', 'Бих искал ___, моля.'),
    level: 'a1',
    grammarIds: ['g-moechten'],
  },
  {
    id: 'p-ein-glas',
    template: 'Ein ___ ___, bitte.',
    example: 'Ein Glas Wasser, bitte.',
    gloss: bi('A ___ of ___, please.', 'Една ___ ___, моля.'),
    level: 'a1',
    grammarIds: ['g-quantities'],
  },
  {
    id: 'p-was-kostet',
    template: 'Was kostet ___?',
    example: 'Was kostet der Kuchen?',
    gloss: bi('How much is the ___?', 'Колко струва ___?'),
    level: 'a1',
  },
  {
    id: 'p-nehmen-sie',
    template: '___ Sie ___.',
    example: 'Nehmen Sie die Suppe.',
    gloss: bi('Have the ___.', 'Вземете ___.'),
    level: 'a1',
    grammarIds: ['g-imperative-sie'],
  },
];

/* ================================================================== *
 * Lesson 1 — food and drink
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u3-l1',
  unitId: 'a1-u3',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Food and drink', 'Храна и напитки'),
  objective: bi(
    'After this lesson you will be able to name everyday food and drink, say what you like and do not eat, and ask for something politely with möchten.',
    'След този урок ще можеш да назовеш всекидневна храна и напитки, да кажеш какво харесваш и какво не ядеш, и да поискаш нещо учтиво с möchten.',
  ),
  outcomes: [
    bi('I can name common food and drink.', 'Мога да назова обичайна храна и напитки.'),
    bi('I can ask for something politely with möchte.', 'Мога да поискам нещо учтиво с möchte.'),
    bi('I can say what I like with gern.', 'Мога да кажа какво обичам с gern.'),
    bi('I can say I do not eat something, using kein.', 'Мога да кажа, че не ям нещо, използвайки kein.'),
  ],
  vocabIds: [
    'v-brot',
    'v-butter',
    'v-kaese',
    'v-milch',
    'v-kaffee',
    'v-tee',
    'v-apfel',
    'v-tomate',
    'v-kartoffel',
    'v-ei',
    'v-fleisch',
    'v-suppe',
    'v-kuchen',
    'v-hungrig',
    'v-lecker',
    'v-moechten',
    'v-gern',
  ],
  grammarIds: ['g-moechten'],
  sections: [
    {
      id: 'a1u3l1-intro',
      kind: 'intro',
      title: bi('Words you will use today', 'Думи, които ще използваш днес'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This is the first unit whose words you can use within a day of learning them. Everything here is on a German breakfast table or a café menu.',
            'Това е първият раздел, чиито думи можеш да използваш до ден след като си ги научил. Всичко тук е на немска маса за закуска или в меню на кафене.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l1-vocab',
      kind: 'vocabulary',
      title: bi('On the table', 'На масата'),
      vocabIds: [
        'v-brot',
        'v-butter',
        'v-kaese',
        'v-milch',
        'v-kaffee',
        'v-tee',
        'v-apfel',
        'v-tomate',
        'v-kartoffel',
        'v-ei',
        'v-fleisch',
        'v-suppe',
        'v-kuchen',
      ],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Learn der Kaffee and der Apfel with their articles especially carefully. You will order both, and ordering a masculine noun means einen.',
            'Научи der Kaffee и der Apfel с членовете им особено внимателно. Ще поръчваш и двете, а поръчването на съществително от мъжки род значи einen.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Родовете тук се разминават често с българските: „кафе“ е среден, а der Kaffee е мъжки; „ябълка“ е женски, а der Apfel е мъжки; „домат“ е мъжки, а die Tomate е женски. Точно затова курсът те учи на думата заедно с члена.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l1-grammar',
      kind: 'grammar',
      title: bi('möchten', 'möchten'),
      blocks: [],
      grammarId: 'g-moechten',
    },
    {
      id: 'a1u3l1-gern',
      kind: 'examples',
      title: bi('Saying what you like', 'Да кажеш какво обичаш'),
      blocks: [
        { t: 'de', de: 'Ich trinke gern Kaffee.', gloss: bi('I like drinking coffee.', 'Обичам да пия кафе.') },
        { t: 'de', de: 'Ich esse gern Kuchen.', gloss: bi('I like eating cake.', 'Обичам да ям сладкиш.') },
        { t: 'de', de: 'Ich esse kein Fleisch.', gloss: bi('I do not eat meat.', 'Не ям месо.') },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'German has no separate verb for liking to do something. It adds gern to the verb you are already using, and gern sits after it.',
            'Немският няма отделен глагол за „обичам да правя нещо“. Добавя gern към глагола, който вече използваш, и gern стои след него.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'To say you do not eat something, use kein rather than nicht: kein Fleisch, keine Tomaten. nicht negates a verb; kein negates a noun.',
            'За да кажеш, че не ядеш нещо, използвай kein, а не nicht: kein Fleisch, keine Tomaten. nicht отрича глагол; kein отрича съществително.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('möchte is the polite ask; will is blunt.', 'möchte е учтивата молба; will е рязко.'),
            bi('What you would like is an object: einen Kaffee.', 'Това, което искаш, е допълнение: einen Kaffee.'),
            bi('gern goes after the verb and means you like doing it.', 'gern стои след глагола и значи, че обичаш да го правиш.'),
            bi('kein negates a noun, nicht negates a verb.', 'kein отрича съществително, nicht отрича глагол.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      nounWithArticle('a1u3l1-ex1', bi('With the article', 'С члена'), [
        { prompt: bi('coffee', 'кафе'), bare: 'Kaffee', withArticle: 'der Kaffee', vocabId: 'v-kaffee', hint: bi('Masculine, unlike in many languages.', 'Мъжки род, за разлика от българския.') },
        { prompt: bi('apple', 'ябълка'), bare: 'Apfel', withArticle: 'der Apfel', vocabId: 'v-apfel' },
        { prompt: bi('soup', 'супа'), bare: 'Suppe', withArticle: 'die Suppe', vocabId: 'v-suppe' },
        { prompt: bi('egg', 'яйце'), bare: 'Ei', withArticle: 'das Ei', vocabId: 'v-ei' },
      ]),
    ),
    a1(
      typeIt(
        'a1u3l1-ex2',
        bi('Ask politely', 'Поискай учтиво'),
        [
          {
            prompt: bi('I would like a coffee, please.', 'Бих искал едно кафе, моля.'),
            answer: 'Ich möchte einen Kaffee, bitte.',
            alternatives: ['Ich will einen Kaffee, bitte.'],
            reviewTargets: ['v-moechten', 'p-ich-moechte'],
            hints: [bi('Kaffee is masculine and it is the object.', 'Kaffee е мъжки род и е допълнение.')],
            traps: [
              {
                answer: 'Ich möchte ein Kaffee, bitte.',
                category: 'case',
                feedback: bi(
                  'What you would like is the object, and Kaffee is masculine — so einen Kaffee.',
                  'Това, което искаш, е допълнение, а Kaffee е мъжки род — значи einen Kaffee.',
                ),
              },
            ],
          },
          {
            prompt: bi('I would like a soup.', 'Бих искал една супа.'),
            answer: 'Ich möchte eine Suppe.',
            reviewTargets: ['v-suppe', 'v-moechten'],
            hints: [bi('Suppe is feminine, which does not change.', 'Suppe е женски род и не се мени.')],
          },
          {
            prompt: bi('I do not eat meat.', 'Не ям месо.'),
            answer: 'Ich esse kein Fleisch.',
            reviewTargets: ['v-fleisch'],
            hints: [],
            traps: [
              {
                answer: 'Ich esse nicht Fleisch.',
                category: 'vocabulary',
                feedback: bi(
                  'nicht negates a verb. To say no to a noun, German uses kein: Ich esse kein Fleisch.',
                  'nicht отрича глагол. За да откажеш съществително, немският използва kein: Ich esse kein Fleisch.',
                ),
              },
            ],
          },
          {
            prompt: bi('I like drinking tea.', 'Обичам да пия чай.'),
            answer: 'Ich trinke gern Tee.',
            reviewTargets: ['v-gern', 'v-tee'],
            hints: [bi('gern comes after the verb.', 'gern идва след глагола.')],
          },
        ],
        ['g-moechten'],
      ),
    ),
    a1(
      fillBlank('a1u3l1-ex3', bi('ein, eine or einen?', 'ein, eine или einen?'), [
        {
          prompt: bi('I would like an apple.', 'Бих искал една ябълка.'),
          scaffold: 'Ich möchte ___ Apfel.',
          answer: 'einen',
          shape: 'word',
          reviewTargets: ['g-moechten', 'v-apfel'],
          hints: [bi('der Apfel — masculine.', 'der Apfel — мъжки род.')],
        },
        {
          prompt: bi('I would like a cake.', 'Бих искал един сладкиш.'),
          scaffold: 'Ich möchte ___ Kuchen.',
          answer: 'einen',
          shape: 'word',
          reviewTargets: ['v-kuchen'],
          hints: [],
        },
        {
          prompt: bi('I would like an egg.', 'Бих искал едно яйце.'),
          scaffold: 'Ich möchte ___ Ei.',
          answer: 'ein',
          shape: 'word',
          reviewTargets: ['v-ei'],
          hints: [bi('das Ei — neuter, which does not change.', 'das Ei — среден род, който не се мени.')],
        },
      ]),
    ),
    a1(
      partialRecall('a1u3l1-ex4', bi('Finish the word', 'Довърши думата'), [
        {
          prompt: bi('The cake is very tasty.', 'Сладкишът е много вкусен.'),
          scaffold: 'Der Kuchen ist sehr l___.',
          answer: 'lecker',
          shape: 'word',
          reviewTargets: ['v-lecker'],
          hints: [],
        },
        {
          prompt: bi('I am hungry.', 'Гладен съм.'),
          scaffold: 'Ich bin h___.',
          answer: 'hungrig',
          shape: 'word',
          reviewTargets: ['v-hungrig'],
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u3l1-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte einen Kaffee.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich esse kein Fleisch.',
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
        typeIt('a1u3l1-m1', bi('Mastery: ordering politely', 'Проверка: учтива поръчка'), [
          {
            prompt: bi('I would like a tea, please.', 'Бих искал един чай, моля.'),
            answer: 'Ich möchte einen Tee, bitte.',
            hints: [],
          },
          {
            prompt: bi('I like eating cake.', 'Обичам да ям сладкиш.'),
            answer: 'Ich esse gern Kuchen.',
            hints: [],
          },
          {
            prompt: bi('The soup is very tasty.', 'Супата е много вкусна.'),
            answer: 'Die Suppe ist sehr lecker.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — in a café
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u3-l2',
  unitId: 'a1-u3',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('In a café', 'В кафене'),
  objective: bi(
    'After this lesson you will be able to order, ask what something costs, understand the waiter and pay — the whole visit, in German.',
    'След този урок ще можеш да поръчаш, да попиташ колко струва нещо, да разбереш сервитьора и да платиш — цялото посещение, на немски.',
  ),
  outcomes: [
    bi('I can order food and drink.', 'Мога да поръчам храна и напитки.'),
    bi('I can ask what something costs.', 'Мога да попитам колко струва нещо.'),
    bi('I can ask for the bill and pay.', 'Мога да поискам сметката и да платя.'),
    bi('I understand a polite instruction with Sie.', 'Разбирам учтива подкана със Sie.'),
  ],
  vocabIds: [
    'v-nehmen',
    'v-bezahlen',
    'v-rechnung',
    'v-speisekarte',
    'v-kellner',
    'v-glas',
    'v-tasse',
    'v-teuer',
    'v-billig',
    'v-zusammen-getrennt',
  ],
  grammarIds: ['g-imperative-sie'],
  sections: [
    {
      id: 'a1u3l2-intro',
      kind: 'intro',
      title: bi('The whole visit', 'Цялото посещение'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A café visit is short and always the same: sit down, look at the menu, order, eat, ask for the bill, pay. Six moments, and you can learn the German for all of them at once.',
            'Посещението в кафене е кратко и винаги едно и също: сядаш, гледаш менюто, поръчваш, ядеш, искаш сметката, плащаш. Шест момента и можеш да научиш немския за всички наведнъж.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l2-vocab',
      kind: 'vocabulary',
      title: bi('What you need', 'Какво ти трябва'),
      vocabIds: ['v-speisekarte', 'v-kellner', 'v-nehmen', 'v-glas', 'v-tasse', 'v-rechnung', 'v-bezahlen', 'v-teuer', 'v-billig'],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          only: ['bg'],
          text: bi(
            '',
            'Немският разделя това, което българският нарича „чаша“: die Tasse е за топли напитки, das Glas — за студени и стъклени. Поръчаш ли „ein Glas Kaffee“, ще те разберат, но звучи странно.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l2-order',
      kind: 'examples',
      title: bi('Ordering', 'Поръчване'),
      blocks: [
        { t: 'de', de: 'Die Speisekarte, bitte.', gloss: bi('The menu, please.', 'Менюто, моля.') },
        { t: 'de', de: 'Ich nehme die Suppe.', gloss: bi('I will have the soup.', 'Ще взема супата.') },
        { t: 'de', de: 'Eine Tasse Kaffee, bitte.', gloss: bi('A cup of coffee, please.', 'Чаша кафе, моля.') },
        { t: 'de', de: 'Was kostet der Kuchen?', gloss: bi('How much is the cake?', 'Колко струва сладкишът?') },
        { t: 'de', de: 'Die Rechnung, bitte.', gloss: bi('The bill, please.', 'Сметката, моля.') },
        { t: 'de', de: 'Ich möchte bezahlen, bitte.', gloss: bi('I would like to pay, please.', 'Бих искал да платя, моля.') },
      ],
    },
    {
      id: 'a1u3l2-grammar',
      kind: 'grammar',
      title: bi('What the waiter says', 'Какво казва сервитьорът'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You will hear instructions before you can produce them, so this is mostly about recognising the shape.',
            'Ще чуеш подкани, преди да можеш да ги произведеш, затова тук става дума най-вече за разпознаване на формата.',
          ),
        },
      ],
      grammarId: 'g-imperative-sie',
    },
    {
      id: 'a1u3l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich nehme ... is how you order.', 'Ich nehme ... е начинът да поръчаш.'),
            bi('Was kostet ...? asks a price.', 'Was kostet ...? пита за цена.'),
            bi('Die Rechnung, bitte. ends the visit.', 'Die Rechnung, bitte. приключва посещението.'),
            bi('Zusammen oder getrennt? means together or separately.', 'Zusammen oder getrennt? значи „заедно или поотделно“.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u3l2-ex1',
        bi('Order and pay', 'Поръчай и плати'),
        [
          {
            prompt: bi('The menu, please.', 'Менюто, моля.'),
            answer: 'Die Speisekarte, bitte.',
            reviewTargets: ['v-speisekarte'],
            hints: [],
          },
          {
            prompt: bi('I will have the soup.', 'Ще взема супата.'),
            answer: 'Ich nehme die Suppe.',
            reviewTargets: ['v-nehmen'],
            hints: [],
          },
          {
            prompt: bi('A cup of coffee, please.', 'Чаша кафе, моля.'),
            answer: 'Eine Tasse Kaffee, bitte.',
            reviewTargets: ['v-tasse', 'p-ein-glas'],
            hints: [bi('Nothing goes between the cup and the coffee.', 'Между чашата и кафето не стои нищо.')],
          },
          {
            prompt: bi('I would like to pay, please.', 'Бих искал да платя, моля.'),
            answer: 'Ich möchte bezahlen, bitte.',
            reviewTargets: ['v-bezahlen'],
            hints: [bi('After möchte, the other verb goes to the end.', 'След möchte другият глагол отива в края.')],
          },
        ],
        ['g-moechten'],
      ),
    ),
    a1(
      fillBlank('a1u3l2-ex2', bi('Asking the price', 'Питане за цената'), [
        {
          prompt: bi('How much is the cake?', 'Колко струва сладкишът?'),
          scaffold: 'Was ___ der Kuchen?',
          answer: 'kostet',
          shape: 'word',
          reviewTargets: ['p-was-kostet'],
          hints: [],
        },
        {
          prompt: bi('That is too expensive.', 'Това е твърде скъпо.'),
          scaffold: 'Das ist zu ___.',
          answer: 'teuer',
          shape: 'word',
          reviewTargets: ['v-teuer'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u3l2-ex3', bi('Put the order together', 'Сглоби поръчката'), [
        {
          prompt: bi('I would like a glass of water.', 'Бих искал чаша вода.'),
          bank: ['Ich', 'möchte', 'ein', 'Glas', 'Wasser'],
          answer: 'Ich möchte ein Glas Wasser.',
          hints: [bi('Glass first, then the thing in it.', 'Първо чашата, после това, което е в нея.')],
        },
        {
          prompt: bi('We would like to pay separately.', 'Бихме искали да платим поотделно.'),
          bank: ['Wir', 'möchten', 'getrennt', 'bezahlen'],
          answer: 'Wir möchten getrennt bezahlen.',
          hints: [bi('The second verb waits at the end.', 'Вторият глагол чака в края.')],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'a1u3l2-ex4',
        kind: 'multipleChoice',
        objective: bi('What did the waiter ask?', 'Какво попита сервитьорът?'),
        steps: [
          {
            prompt: bi(
              'The waiter says: "Zusammen oder getrennt?" What is being asked?',
              'Сервитьорът казва: „Zusammen oder getrennt?“ Какво пита?',
            ),
            answer: 'zusammen',
            choices: [
              { id: 'zusammen', de: 'Whether you want to pay as one bill or separately', gloss: bi('Whether you want to pay as one bill or separately', 'Дали искате да платите на една сметка или поотделно') },
              { id: 'sitzen', de: 'Whether you want to sit inside or outside', gloss: bi('Whether you want to sit inside or outside', 'Дали искате да седнете вътре или навън') },
              { id: 'noch', de: 'Whether you want to order anything else', gloss: bi('Whether you want to order anything else', 'Дали искате да поръчате още нещо') },
            ],
            correct: 'zusammen',
            reviewTargets: ['v-zusammen-getrennt'],
            hints: [],
          },
        ],
        mandatoryRetype: false,
      }),
    ),
    a1(
      dictation('a1u3l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Rechnung, bitte.',
          shape: 'phrase',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Nehmen Sie die Suppe.',
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
        typeIt('a1u3l2-m1', bi('Mastery: the whole visit', 'Проверка: цялото посещение'), [
          {
            prompt: bi('I will have the cake.', 'Ще взема сладкиша.'),
            answer: 'Ich nehme den Kuchen.',
            hints: [bi('Kuchen is masculine and it is the object.', 'Kuchen е мъжки род и е допълнение.')],
          },
          {
            prompt: bi('How much is the coffee?', 'Колко струва кафето?'),
            answer: 'Was kostet der Kaffee?',
            hints: [],
          },
          {
            prompt: bi('The bill, please.', 'Сметката, моля.'),
            answer: 'Die Rechnung, bitte.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — shopping and quantities
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u3-l3',
  unitId: 'a1-u3',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('At the supermarket', 'В супермаркета'),
  objective: bi(
    'After this lesson you will be able to buy a quantity of something, ask for one more, and say what you need.',
    'След този урок ще можеш да купиш количество от нещо, да поискаш още едно и да кажеш какво ти трябва.',
  ),
  outcomes: [
    bi('I can ask for a kilo, a bottle or a piece of something.', 'Мога да поискам килограм, бутилка или парче от нещо.'),
    bi('I can ask for another one with noch.', 'Мога да поискам още едно с noch.'),
    bi('I can say what we need.', 'Мога да кажа какво ни трябва.'),
    bi('I know the plural forms of the food words.', 'Знам формите за множествено число на думите за храна.'),
  ],
  vocabIds: ['v-supermarkt', 'v-kilo', 'v-flasche', 'v-stueck', 'v-kaufen', 'v-brauchen-wir', 'v-noch'],
  grammarIds: ['g-quantities'],
  sections: [
    {
      id: 'a1u3l3-intro',
      kind: 'intro',
      title: bi('Buying an amount', 'Да купиш количество'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Almost everything in a shop is bought by an amount rather than one at a time, and German builds those phrases with startling simplicity.',
            'Почти всичко в магазина се купува по количество, а не бройка по бройка, а немският строи тези изрази изненадващо просто.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l3-grammar',
      kind: 'grammar',
      title: bi('ein Kilo Äpfel', 'ein Kilo Äpfel'),
      blocks: [],
      grammarId: 'g-quantities',
    },
    {
      id: 'a1u3l3-vocab',
      kind: 'vocabulary',
      title: bi('At the shop', 'В магазина'),
      vocabIds: ['v-supermarkt', 'v-kilo', 'v-flasche', 'v-stueck', 'v-kaufen', 'v-noch'],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'The plurals matter here, because you rarely buy one: die Äpfel, die Tomaten, die Kartoffeln, die Eier.',
            'Тук множественото число има значение, защото рядко купуваш едно: die Äpfel, die Tomaten, die Kartoffeln, die Eier.',
          ),
        },
      ],
    },
    {
      id: 'a1u3l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Measure first, thing after, nothing in between.', 'Първо мярката, после нещото, нищо помежду.'),
            bi('Kilo stays singular after a number.', 'Kilo остава в единствено число след число.'),
            bi('noch einen ... asks for another one.', 'noch einen ... иска още едно.'),
            bi('kaufen buys a thing; einkaufen is shopping in general.', 'kaufen купува нещо; einkaufen е пазаруване изобщо.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u3l3-ex1',
        bi('At the counter', 'На щанда'),
        [
          {
            prompt: bi('A kilo of apples, please.', 'Един килограм ябълки, моля.'),
            answer: 'Ein Kilo Äpfel, bitte.',
            reviewTargets: ['v-kilo', 'g-quantities'],
            hints: [bi('The plural of Apfel takes an umlaut.', 'Множественото на Apfel взима умлаут.')],
            traps: [
              {
                answer: 'Ein Kilo von Äpfel, bitte.',
                category: 'extra-word',
                feedback: bi(
                  'No von. German puts the measure and the thing side by side: ein Kilo Äpfel.',
                  'Без von. Немският слага мярката и нещото едно до друго: ein Kilo Äpfel — точно както „килограм ябълки“.',
                ),
              },
            ],
          },
          {
            prompt: bi('A bottle of water, please.', 'Една бутилка вода, моля.'),
            answer: 'Eine Flasche Wasser, bitte.',
            reviewTargets: ['v-flasche', 'p-ein-glas'],
            hints: [],
          },
          {
            prompt: bi('A piece of cake, please.', 'Едно парче сладкиш, моля.'),
            answer: 'Ein Stück Kuchen, bitte.',
            reviewTargets: ['v-stueck'],
            hints: [],
          },
          {
            prompt: bi('Another coffee, please.', 'Още едно кафе, моля.'),
            answer: 'Noch einen Kaffee, bitte.',
            reviewTargets: ['v-noch'],
            hints: [bi('Kaffee is masculine and still the object.', 'Kaffee е мъжки род и пак е допълнение.')],
          },
        ],
        ['g-quantities'],
      ),
    ),
    a1(
      fillBlank('a1u3l3-ex2', bi('The plural', 'Множественото число'), [
        {
          prompt: bi('Two kilos of tomatoes, please.', 'Два килограма домати, моля.'),
          scaffold: 'Zwei Kilo ___, bitte.',
          answer: 'Tomaten',
          shape: 'word',
          reviewTargets: ['v-tomate'],
          hints: [],
        },
        {
          prompt: bi('I need six eggs.', 'Трябват ми шест яйца.'),
          scaffold: 'Ich brauche sechs ___.',
          answer: 'Eier',
          shape: 'word',
          reviewTargets: ['v-ei'],
          hints: [bi('An irregular plural.', 'Неправилно множествено число.')],
        },
        {
          prompt: bi('We are buying potatoes.', 'Купуваме картофи.'),
          scaffold: 'Wir kaufen ___.',
          answer: 'Kartoffeln',
          shape: 'word',
          reviewTargets: ['v-kartoffel', 'v-kaufen'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u3l3-ex3', bi('Build the sentence', 'Подреди изречението'), [
        {
          prompt: bi('I am buying two bottles of water.', 'Купувам две бутилки вода.'),
          bank: ['Ich', 'kaufe', 'zwei', 'Flaschen', 'Wasser'],
          answer: 'Ich kaufe zwei Flaschen Wasser.',
          hints: [],
        },
        {
          prompt: bi('What do we need for tonight?', 'Какво ни трябва за тази вечер?'),
          bank: ['Was', 'brauchen', 'wir', 'für', 'heute', 'Abend'],
          answer: 'Was brauchen wir für heute Abend?',
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u3l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ein Kilo Äpfel, bitte.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Noch einen Kaffee, bitte.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u3l3-ex5', bi('Write a shopping list sentence', 'Напиши изречение за пазаруване'), [
        {
          prompt: bi(
            'Write one sentence saying what you are buying, with an amount in it.',
            'Напиши едно изречение какво купуваш, с количество в него.',
          ),
          answer: 'Ich kaufe ein Kilo Tomaten und eine Flasche Wasser.',
          requiredTokens: ['kaufe'],
          shape: 'sentence',
          hints: [
            bi('Start with Ich kaufe.', 'Започни с Ich kaufe.'),
            bi('Use Kilo, Flasche or Stück.', 'Използвай Kilo, Flasche или Stück.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u3l3-m1', bi('Mastery: at the shop', 'Проверка: в магазина'), [
          {
            prompt: bi('A kilo of potatoes, please.', 'Един килограм картофи, моля.'),
            answer: 'Ein Kilo Kartoffeln, bitte.',
            hints: [],
          },
          {
            prompt: bi('I am buying a bottle of milk.', 'Купувам една бутилка мляко.'),
            answer: 'Ich kaufe eine Flasche Milch.',
            hints: [],
          },
          {
            prompt: bi('Another tea, please.', 'Още един чай, моля.'),
            answer: 'Noch einen Tee, bitte.',
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
  id: 'cp-a1-u3',
  scope: 'unit',
  targetId: 'a1-u3',
  status: 'available',
  title: bi('Unit 3 checkpoint', 'Проверка на раздел 3'),
  description: bi(
    'A café and a shop from start to finish.',
    'Кафене и магазин от начало до край.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u3-1', bi('Ordering', 'Поръчване'), [
        {
          prompt: bi('I would like a coffee, please.', 'Бих искал едно кафе, моля.'),
          answer: 'Ich möchte einen Kaffee, bitte.',
          hints: [],
        },
        {
          prompt: bi('I will have the soup.', 'Ще взема супата.'),
          answer: 'Ich nehme die Suppe.',
          hints: [],
        },
        {
          prompt: bi('A cup of tea, please.', 'Чаша чай, моля.'),
          answer: 'Eine Tasse Tee, bitte.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u3-2', bi('Paying', 'Плащане'), [
        {
          prompt: bi('How much is the cake?', 'Колко струва сладкишът?'),
          answer: 'Was kostet der Kuchen?',
          hints: [],
        },
        {
          prompt: bi('I would like to pay, please.', 'Бих искал да платя, моля.'),
          answer: 'Ich möchte bezahlen, bitte.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u3-3', bi('Shopping', 'Пазаруване'), [
        {
          prompt: bi('A kilo of apples, please.', 'Един килограм ябълки, моля.'),
          answer: 'Ein Kilo Äpfel, bitte.',
          hints: [],
        },
        {
          prompt: bi('I am buying two bottles of water.', 'Купувам две бутилки вода.'),
          answer: 'Ich kaufe zwei Flaschen Wasser.',
          hints: [],
        },
        {
          prompt: bi('I do not eat meat.', 'Не ям месо.'),
          answer: 'Ich esse kein Fleisch.',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u3-4',
        kind: 'fillBlank',
        objective: bi('The right little word', 'Точната малка дума'),
        steps: [
          {
            prompt: bi('I would like an apple.', 'Бих искал една ябълка.'),
            scaffold: 'Ich möchte ___ Apfel.',
            answer: 'einen',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I like drinking coffee.', 'Обичам да пия кафе.'),
            scaffold: 'Ich trinke ___ Kaffee.',
            answer: 'gern',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u3-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ein Glas Wasser, bitte.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte bezahlen.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_3: Unit = {
  id: 'a1-u3',
  level: 'a1',
  order: 3,
  status: 'available',
  title: bi('Food, cafés and shopping', 'Храна, кафенета и пазаруване'),
  summary: bi(
    'A whole café visit and a whole shop, with möchten for politeness and quantity phrases that work word for word.',
    'Цяло посещение в кафене и цял магазин, с möchten за учтивост и изрази за количество, които работят дума по дума.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U3_PATTERNS = PATTERNS;
