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
 * A1 Unit 1 — People and family.
 *
 * The unit has one job: turn the accusative from a rule about `haben` into a
 * rule about German. Pre-A1 left it as "after haben, ein becomes einen", which
 * works for a dozen sentences and then quietly breaks, because the learner has
 * attached the ending to the wrong thing. So Lesson 2 supplies verbs — kennen,
 * sehen, suchen, brauchen, besuchen — and shows that they all behave the same,
 * while `sein` behaves differently for a reason worth understanding.
 *
 * Possessives come first (Lesson 1) and again last (Lesson 3) because they are
 * the cheapest way to practise gender agreement: mein/meine is the ein/eine
 * pattern the learner already owns, so nothing new has to be memorised, and
 * every sentence is still a gender decision.
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-mein-heisst',
    template: 'Mein___ ___ heißt ___.',
    example: 'Meine Schwester heißt Lena.',
    gloss: bi('My ___ is called ___.', '___ ми се казва ___.'),
    level: 'a1',
    grammarIds: ['g-possessives'],
  },
  {
    id: 'p-ich-kenne-den',
    template: 'Ich kenne den ___.',
    example: 'Ich kenne den Nachbarn.',
    gloss: bi('I know the ___.', 'Познавам ___.'),
    level: 'a1',
    grammarIds: ['g-accusative'],
  },
  {
    id: 'p-ich-brauche-einen',
    template: 'Ich brauche einen ___.',
    example: 'Ich brauche einen Tisch.',
    gloss: bi('I need a ___.', 'Трябва ми ___.'),
    level: 'a1',
    grammarIds: ['g-accusative'],
  },
  {
    id: 'p-sein-ihr-ist',
    template: '___ ___ ist ___.',
    example: 'Ihr Bruder ist sehr nett.',
    gloss: bi('His / her ___ is ___.', 'Неговият / нейният ___ е ___.'),
    level: 'a1',
    grammarIds: ['g-sein-ihr'],
  },
];

/* ================================================================== *
 * Lesson 1 — mein and dein
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u1-l1',
  unitId: 'a1-u1',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('My family, your family', 'Моето семейство, твоето семейство'),
  objective: bi(
    'After this lesson you will be able to name the wider family and say whose someone is, using mein and dein with the right ending.',
    'След този урок ще можеш да назовеш по-широкото семейство и да кажеш чий е някой, използвайки mein и dein с правилното окончание.',
  ),
  outcomes: [
    bi('I can name grandparents, aunts, uncles and siblings.', 'Мога да назова баба и дядо, лели, чичовци, братя и сестри.'),
    bi('I can choose between mein and meine.', 'Мога да избирам между mein и meine.'),
    bi('I can ask whose someone is with dein.', 'Мога да попитам чий е някой с dein.'),
    bi('I know that the ending follows the thing owned, not the owner.', 'Знам, че окончанието следва притежаваното, а не притежателя.'),
  ],
  vocabIds: [
    'v-grossmutter',
    'v-grossvater',
    'v-oma',
    'v-opa',
    'v-geschwister',
    'v-onkel',
    'v-tante',
    'v-junge',
    'v-baby',
    'v-verheiratet',
    'v-ledig',
  ],
  grammarIds: ['g-possessives'],
  sections: [
    {
      id: 'a1u1l1-intro',
      kind: 'intro',
      title: bi('From words to people', 'От думи към хора'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You already know Mutter, Vater, Bruder, Schwester and Kind. This lesson adds the rest of the family and — more importantly — the one word that turns a noun into a person you actually know: mein.',
            'Вече знаеш Mutter, Vater, Bruder, Schwester и Kind. Този урок добавя останалата част от семейството и — по-важното — думата, която превръща съществителното в конкретен човек: mein.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'The good news arrives immediately: mein takes exactly the endings of ein, which you have been using since Unit 2. Nothing new has to be memorised.',
            'Добрата новина идва веднага: mein взима точно окончанията на ein, които използваш от раздел 2. Нищо ново за наизустяване.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l1-vocab',
      kind: 'vocabulary',
      title: bi('The wider family', 'По-широкото семейство'),
      vocabIds: [
        'v-grossmutter',
        'v-grossvater',
        'v-oma',
        'v-opa',
        'v-geschwister',
        'v-onkel',
        'v-tante',
        'v-junge',
        'v-baby',
      ],
      blocks: [
        {
          t: 'p',
          text: bi(
            'Two words here are worth extra attention. Geschwister exists only in the plural, and der Junge is masculine while das Mädchen is neuter — a pair that catches everyone.',
            'Две от думите заслужават допълнително внимание. Geschwister съществува само в множествено число, а der Junge е мъжки род, докато das Mädchen е среден — двойка, която хваща всички.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Забележи къде родовете се разминават с българските: der Junge е мъжки, а „момче“ е среден. Обратното е при das Mädchen — среден на немски, „момиче“ е среден и на български, така че там няма проблем. Правилото си остава: учи члена заедно с думата и не се допитвай до българския род.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['en'],
          text: bi(
            'Oma and Opa are what families actually say. Großmutter and Großvater are for forms and formal writing — useful to recognise, rarely useful to say.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a1u1l1-grammar',
      kind: 'grammar',
      title: bi('mein and dein', 'mein и dein'),
      blocks: [],
      grammarId: 'g-possessives',
    },
    {
      id: 'a1u1l1-status',
      kind: 'examples',
      title: bi('Saying more about someone', 'Да кажеш повече за някого'),
      blocks: [
        {
          t: 'de',
          de: 'Meine Schwester ist verheiratet.',
          gloss: bi('My sister is married.', 'Сестра ми е омъжена.'),
        },
        {
          t: 'de',
          de: 'Mein Bruder ist ledig.',
          gloss: bi('My brother is single.', 'Брат ми не е женен.'),
        },
        {
          t: 'de',
          de: 'Meine Großeltern wohnen zusammen in Wien.',
          gloss: bi('My grandparents live together in Vienna.', 'Баба ми и дядо ми живеят заедно във Виена.'),
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'verheiratet and ledig do not change for a man or a woman. One form each, which is one fewer thing to get wrong.',
            'verheiratet и ledig не се менят според това дали става дума за мъж или жена. По една форма — с едно нещо по-малко за грешене.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('mein follows ein: mein Bruder, meine Schwester, mein Kind, meine Eltern.', 'mein следва ein: mein Bruder, meine Schwester, mein Kind, meine Eltern.'),
            bi('dein behaves identically.', 'dein се държи по същия начин.'),
            bi('The ending is about the noun, never about you.', 'Окончанието е заради съществителното, никога заради теб.'),
            bi('Geschwister is plural only.', 'Geschwister е само в множествено число.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      nounWithArticle(
        'a1u1l1-ex1',
        bi('The new family words', 'Новите думи за семейство'),
        [
          {
            prompt: bi('grandmother', 'баба'),
            bare: 'Großmutter',
            withArticle: 'die Großmutter',
            vocabId: 'v-grossmutter',
          },
          {
            prompt: bi('grandad (informal)', 'дядо (галено)'),
            bare: 'Opa',
            withArticle: 'der Opa',
            vocabId: 'v-opa',
          },
          {
            prompt: bi('aunt', 'леля'),
            bare: 'Tante',
            withArticle: 'die Tante',
            vocabId: 'v-tante',
          },
          {
            prompt: bi('boy', 'момче'),
            bare: 'Junge',
            withArticle: 'der Junge',
            vocabId: 'v-junge',
            hint: bi(
              'Masculine, even though a boy is a child.',
              'Мъжки род, въпреки че „момче“ на български е среден.',
            ),
          },
        ],
      ),
    ),
    a1(
      fillBlank('a1u1l1-ex2', bi('mein or meine?', 'mein или meine?'), [
        {
          prompt: bi('My brother is called Tom.', 'Брат ми се казва Том.'),
          scaffold: '___ Bruder heißt Tom.',
          answer: 'Mein',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [
            bi('Bruder is masculine: der Bruder.', 'Bruder е мъжки род: der Bruder.'),
            bi('Masculine takes the short form.', 'Мъжкият род взима късата форма.'),
          ],
          traps: [
            {
              answer: 'Meine',
              category: 'gender',
              feedback: bi(
                'Meine is for feminine and plural. Bruder is masculine — der Bruder — so it takes mein, like ein Bruder.',
                'Meine е за женски род и множествено число. Bruder е мъжки род — der Bruder — затова взима mein, също като ein Bruder.',
              ),
            },
          ],
        },
        {
          prompt: bi('My sister lives in Berlin.', 'Сестра ми живее в Берлин.'),
          scaffold: '___ Schwester wohnt in Berlin.',
          answer: 'Meine',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [bi('Schwester is feminine: die Schwester.', 'Schwester е женски род: die Schwester.')],
          traps: [
            {
              answer: 'Mein',
              category: 'gender',
              feedback: bi(
                'Feminine nouns take meine, exactly as they take eine: eine Schwester, meine Schwester.',
                'Съществителните от женски род взимат meine, точно както взимат eine: eine Schwester, meine Schwester.',
              ),
            },
          ],
        },
        {
          prompt: bi('My parents come from Bulgaria.', 'Родителите ми са от България.'),
          scaffold: '___ Eltern kommen aus Bulgarien.',
          answer: 'Meine',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [
            bi('Eltern is plural.', 'Eltern е в множествено число.'),
            bi('Plural takes the same form as feminine.', 'Множественото число взима същата форма като женския род.'),
          ],
        },
        {
          prompt: bi('My child is two years old.', 'Детето ми е на две години.'),
          scaffold: '___ Kind ist zwei Jahre alt.',
          answer: 'Mein',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [bi('Kind is neuter: das Kind.', 'Kind е среден род: das Kind.')],
          traps: [
            {
              answer: 'Meine',
              category: 'gender',
              feedback: bi(
                'Neuter behaves like masculine here: ein Kind, mein Kind. Only feminine and plural add the e.',
                'Средният род тук се държи като мъжкия: ein Kind, mein Kind. Само женският род и множественото число добавят -e.',
              ),
            },
          ],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u1l1-ex3',
        bi('Say it yourself', 'Кажи го сам'),
        [
          {
            prompt: bi('My grandma lives in Hamburg.', 'Баба ми живее в Хамбург.'),
            answer: 'Meine Oma wohnt in Hamburg.',
            reviewTargets: ['v-oma', 'p-mein-heisst'],
            hints: [bi('Oma is feminine.', 'Oma е женски род.')],
          },
          {
            prompt: bi('My uncle works in Berlin.', 'Чичо ми работи в Берлин.'),
            answer: 'Mein Onkel arbeitet in Berlin.',
            reviewTargets: ['v-onkel'],
            hints: [bi('Onkel is masculine.', 'Onkel е мъжки род.')],
          },
          {
            prompt: bi('My aunt is called Maria.', 'Леля ми се казва Мария.'),
            answer: 'Meine Tante heißt Maria.',
            reviewTargets: ['v-tante', 'p-mein-heisst'],
            hints: [],
          },
          {
            prompt: bi('My brother is single.', 'Брат ми не е женен.'),
            answer: 'Mein Bruder ist ledig.',
            reviewTargets: ['v-ledig'],
            hints: [],
          },
        ],
        ['g-possessives'],
      ),
    ),
    a1(
      partialRecall('a1u1l1-ex4', bi('Your family, this time with dein', 'Твоето семейство, този път с dein'), [
        {
          prompt: bi('Is that your sister?', 'Това сестра ти ли е?'),
          scaffold: 'Ist das d___ Schwester?',
          answer: 'deine',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [bi('Same endings as mein.', 'Същите окончания като mein.')],
        },
        {
          prompt: bi('Where does your grandad live?', 'Къде живее дядо ти?'),
          scaffold: 'Wo wohnt d___ Opa?',
          answer: 'dein',
          shape: 'word',
          reviewTargets: ['g-possessives', 'v-opa'],
          hints: [bi('Opa is masculine.', 'Opa е мъжки род.')],
        },
        {
          prompt: bi('Are your parents in Sofia?', 'Родителите ти в София ли са?'),
          scaffold: 'Sind d___ Eltern in Sofia?',
          answer: 'deine',
          shape: 'word',
          reviewTargets: ['g-possessives'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u1l1-ex5', bi('Build the sentence', 'Подреди изречението'), [
        {
          prompt: bi('My siblings live in Munich.', 'Братята и сестрите ми живеят в Мюнхен.'),
          bank: ['Meine', 'Geschwister', 'wohnen', 'in', 'München'],
          answer: 'Meine Geschwister wohnen in München.',
          hints: [
            bi('Geschwister is plural, so the verb is wohnen.', 'Geschwister е множествено число, затова глаголът е wohnen.'),
          ],
        },
        {
          prompt: bi('Is your aunt married?', 'Леля ти омъжена ли е?'),
          bank: ['Ist', 'deine', 'Tante', 'verheiratet'],
          answer: 'Ist deine Tante verheiratet?',
          hints: [bi('A yes/no question starts with the verb.', 'Въпрос с да/не започва с глагола.')],
        },
      ]),
    ),
    a1(
      dictation('a1u1l1-ex6', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Mein Opa ist sehr alt.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Meine Tante wohnt in Wien.',
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
        typeIt('a1u1l1-m1', bi('Mastery: possessives', 'Проверка: притежателни'), [
          {
            prompt: bi('My grandmother is 70 years old.', 'Баба ми е на 70 години.'),
            answer: 'Meine Großmutter ist 70 Jahre alt.',
            alternatives: ['Meine Oma ist 70 Jahre alt.'],
            hints: [],
          },
          {
            prompt: bi('Is that your brother?', 'Това брат ти ли е?'),
            answer: 'Ist das dein Bruder?',
            hints: [],
          },
          {
            prompt: bi('My parents are in Bulgaria.', 'Родителите ми са в България.'),
            answer: 'Meine Eltern sind in Bulgarien.',
            hints: [],
          },
        ]),
      ),
      a1(
        fillBlank('a1u1l1-m2', bi('Mastery: the right ending', 'Проверка: правилното окончание'), [
          {
            prompt: bi('My baby is sleeping.', 'Бебето ми спи.'),
            scaffold: '___ Baby schläft.',
            answer: 'Mein',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('Your siblings are nice.', 'Братята и сестрите ти са мили.'),
            scaffold: '___ Geschwister sind nett.',
            answer: 'Deine',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — the accusative
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u1-l2',
  unitId: 'a1-u1',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Subject and object: the accusative', 'Подлог и допълнение: винителен падеж'),
  objective: bi(
    'After this lesson you will be able to use den, einen, meinen and keinen for a masculine object, with any verb rather than only with haben.',
    'След този урок ще можеш да използваш den, einen, meinen и keinen за мъжко допълнение, с всеки глагол, а не само с haben.',
  ),
  outcomes: [
    bi('I can tell the subject from the object in a German sentence.', 'Мога да различа подлога от допълнението в немско изречение.'),
    bi('I can use den, einen, meinen and keinen correctly.', 'Мога да използвам правилно den, einen, meinen и keinen.'),
    bi('I know that only masculine changes.', 'Знам, че само мъжкият род се мени.'),
    bi('I know that nothing changes after sein.', 'Знам, че след sein нищо не се мени.'),
  ],
  vocabIds: [
    'v-kennen',
    'v-sehen',
    'v-suchen',
    'v-brauchen',
    'v-besuchen',
    'v-finden',
    'v-moegen',
    'v-freund',
    'v-freundin',
    'v-kollege',
    'v-kollegin',
    'v-nachbar',
  ],
  grammarIds: ['g-accusative'],
  sections: [
    {
      id: 'a1u1l2-intro',
      kind: 'intro',
      title: bi('You have met half of this already', 'Половината вече си я срещал'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'In Pre-A1 you learnt that "ein Bruder" becomes "einen Bruder" after haben. That was true, but it was only a corner of something larger, and learning it as a fact about haben makes the rest of German harder.',
            'В Pre-A1 научи, че „ein Bruder“ става „einen Bruder“ след haben. Това беше вярно, но беше само ъгълче от нещо по-голямо, а да го помниш като факт за haben прави останалата част от немския по-трудна.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'The ending has nothing to do with haben. It marks what the sentence is done to. Once you see that, the same rule works with every verb in this lesson.',
            'Окончанието няма нищо общо с haben. То маркира това, върху което се извършва действието. Щом го видиш така, същото правило работи с всеки глагол в този урок.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l2-grammar',
      kind: 'grammar',
      title: bi('The rule, in one table', 'Правилото, в една таблица'),
      blocks: [],
      grammarId: 'g-accusative',
    },
    {
      id: 'a1u1l2-vocab',
      kind: 'vocabulary',
      title: bi('Verbs that take an object', 'Глаголи с допълнение'),
      vocabIds: [
        'v-kennen',
        'v-sehen',
        'v-suchen',
        'v-brauchen',
        'v-besuchen',
        'v-finden',
        'v-moegen',
        'v-freund',
        'v-freundin',
        'v-kollege',
        'v-kollegin',
        'v-nachbar',
      ],
      blocks: [
        {
          t: 'p',
          text: bi(
            'Every one of these verbs does something to someone or something, so every one of them is followed by the object form.',
            'Всеки от тези глаголи върши нещо върху някого или нещо, затова след всеки от тях идва формата за допълнение.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Two of the new nouns add -n as an object: den Kollegen, den Nachbarn. Recognise them for now — the full pattern comes later.',
            'Две от новите съществителни добавят -n като допълнение: den Kollegen, den Nachbarn. Засега само ги разпознавай — целият модел идва по-късно.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l2-examples',
      kind: 'examples',
      title: bi('Same rule, five verbs', 'Едно правило, пет глагола'),
      blocks: [
        { t: 'de', de: 'Ich kenne deinen Vater.', gloss: bi('I know your father.', 'Познавам баща ти.') },
        { t: 'de', de: 'Ich sehe meinen Bruder jeden Tag.', gloss: bi('I see my brother every day.', 'Виждам брат си всеки ден.') },
        { t: 'de', de: 'Wir besuchen meinen Onkel.', gloss: bi('We are visiting my uncle.', 'Гостуваме на чичо ми.') },
        { t: 'de', de: 'Ich brauche einen Tisch.', gloss: bi('I need a table.', 'Трябва ми маса.') },
        { t: 'de', de: 'Er hat keinen Bruder.', gloss: bi('He has no brother.', 'Той няма брат.') },
        {
          t: 'contrast',
          de: 'Das ist mein Bruder.',
          other: bi('That is my brother.', 'Това е брат ми.'),
          note: bi(
            'After sein, nothing changes — mein, not meinen. sein connects two things instead of doing something to one.',
            'След sein нищо не се мени — mein, не meinen. sein свързва две неща, вместо да върши нещо върху едното.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Only masculine changes: der → den, ein → einen, mein → meinen, kein → keinen.', 'Само мъжкият род се мени: der → den, ein → einen, mein → meinen, kein → keinen.'),
            bi('Feminine, neuter and plural look exactly the same as before.', 'Женският род, средният род и множественото число изглеждат точно както преди.'),
            bi('It is about the job of the noun, not about which verb you used.', 'Става дума за ролята на съществителното, а не за това кой глагол си използвал.'),
            bi('After sein, nothing changes.', 'След sein нищо не се мени.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      fillBlank('a1u1l2-ex1', bi('der or den?', 'der или den?'), [
        {
          prompt: bi('I know the neighbour.', 'Познавам съседа.'),
          scaffold: 'Ich kenne ___ Nachbarn.',
          answer: 'den',
          shape: 'word',
          reviewTargets: ['g-accusative', 'v-kennen'],
          hints: [
            bi('Who is doing the knowing? Not the neighbour.', 'Кой познава? Не съседът.'),
            bi('The neighbour is the object, and Nachbar is masculine.', 'Съседът е допълнение, а Nachbar е мъжки род.'),
          ],
          traps: [
            {
              answer: 'der',
              category: 'case',
              feedback: bi(
                'der is the subject form — the one doing something. Here the neighbour is the one being known, so it is den.',
                'der е формата за подлог — този, който върши действието. Тук съседът е този, когото познават, затова е den.',
              ),
            },
          ],
        },
        {
          prompt: bi('The brother knows my father.', 'Братът познава баща ми.'),
          scaffold: '___ Bruder kennt meinen Vater.',
          answer: 'Der',
          shape: 'word',
          reviewTargets: ['g-accusative'],
          hints: [bi('This one is doing the knowing.', 'Този тук върши познаването.')],
          traps: [
            {
              answer: 'Den',
              category: 'case',
              feedback: bi(
                'Careful — the brother is the subject here. The object is meinen Vater, which is already marked.',
                'Внимавай — братът тук е подлогът. Допълнението е meinen Vater и то вече е маркирано.',
              ),
            },
          ],
        },
        {
          prompt: bi('I am looking for my sister.', 'Търся сестра си.'),
          scaffold: 'Ich suche ___ Schwester.',
          answer: 'meine',
          shape: 'word',
          reviewTargets: ['g-accusative', 'v-suchen'],
          hints: [bi('Schwester is feminine. Does feminine change?', 'Schwester е женски род. Мени ли се женският род?')],
          traps: [
            {
              answer: 'meinen',
              category: 'case',
              feedback: bi(
                'Only masculine takes -en. Schwester is feminine, so it stays meine — object or not.',
                'Само мъжкият род взима -en. Schwester е женски род, затова остава meine — независимо дали е допълнение.',
              ),
            },
          ],
        },
        {
          prompt: bi('I need a table.', 'Трябва ми маса.'),
          scaffold: 'Ich brauche ___ Tisch.',
          answer: 'einen',
          shape: 'word',
          reviewTargets: ['g-accusative', 'v-brauchen', 'p-ich-brauche-einen'],
          hints: [bi('Tisch is masculine: der Tisch.', 'Tisch е мъжки род: der Tisch.')],
          traps: [
            {
              answer: 'ein',
              category: 'case',
              feedback: bi(
                'Masculine objects take einen. The table is what you need, so it is the object: Ich brauche einen Tisch.',
                'Мъжките допълнения взимат einen. Масата е това, което ти трябва, значи е допълнение: Ich brauche einen Tisch.',
              ),
            },
          ],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u1l2-ex2',
        bi('Five verbs, one rule', 'Пет глагола, едно правило'),
        [
          {
            prompt: bi('I know your father.', 'Познавам баща ти.'),
            answer: 'Ich kenne deinen Vater.',
            reviewTargets: ['v-kennen', 'g-accusative'],
            hints: [bi('Vater is masculine and it is the object.', 'Vater е мъжки род и е допълнение.')],
            traps: [
              {
                answer: 'Ich kenne dein Vater.',
                category: 'case',
                feedback: bi(
                  'Almost. Masculine objects take -en: deinen Vater.',
                  'Почти. Мъжките допълнения взимат -en: deinen Vater.',
                ),
              },
            ],
          },
          {
            prompt: bi('We are visiting my uncle.', 'Гостуваме на чичо ми.'),
            answer: 'Wir besuchen meinen Onkel.',
            reviewTargets: ['v-besuchen', 'g-accusative'],
            hints: [],
          },
          {
            prompt: bi('I am looking for my friend. (male)', 'Търся приятеля си.'),
            answer: 'Ich suche meinen Freund.',
            reviewTargets: ['v-suchen', 'v-freund'],
            hints: [],
          },
          {
            prompt: bi('She has no brother.', 'Тя няма брат.'),
            answer: 'Sie hat keinen Bruder.',
            reviewTargets: ['g-accusative'],
            hints: [bi('kein takes the same endings as ein.', 'kein взима същите окончания като ein.')],
          },
          {
            prompt: bi('That is my colleague. (female)', 'Това е колежката ми.'),
            answer: 'Das ist meine Kollegin.',
            reviewTargets: ['v-kollegin'],
            hints: [bi('After sein, nothing changes.', 'След sein нищо не се мени.')],
          },
        ],
        ['g-accusative'],
      ),
    ),
    a1(
      partialRecall('a1u1l2-ex3', bi('Finish the ending', 'Довърши окончанието'), [
        {
          prompt: bi('I see my brother every day.', 'Виждам брат си всеки ден.'),
          scaffold: 'Ich sehe mein___ Bruder jeden Tag.',
          answer: 'meinen',
          shape: 'word',
          reviewTargets: ['v-sehen', 'g-accusative'],
          hints: [],
        },
        {
          prompt: bi('Do you know my aunt?', 'Познаваш ли леля ми?'),
          scaffold: 'Kennst du mein___ Tante?',
          answer: 'meine',
          shape: 'word',
          reviewTargets: ['v-kennen', 'g-accusative'],
          hints: [bi('Feminine does not change.', 'Женският род не се мени.')],
        },
        {
          prompt: bi('I do not need a table.', 'Не ми трябва маса.'),
          scaffold: 'Ich brauche kein___ Tisch.',
          answer: 'keinen',
          shape: 'word',
          reviewTargets: ['g-accusative'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u1l2-ex4', bi('Put it together', 'Сглоби изречението'), [
        {
          prompt: bi('I know your colleague. (male)', 'Познавам колегата ти.'),
          bank: ['Ich', 'kenne', 'deinen', 'Kollegen'],
          answer: 'Ich kenne deinen Kollegen.',
          hints: [bi('Kollege adds -n as an object.', 'Kollege добавя -n като допълнение.')],
        },
        {
          prompt: bi('My sister is visiting my grandma.', 'Сестра ми гостува на баба.'),
          bank: ['Meine', 'Schwester', 'besucht', 'meine', 'Oma'],
          answer: 'Meine Schwester besucht meine Oma.',
          hints: [
            bi('Two feminine nouns, so nothing changes shape.', 'Две съществителни от женски род, така че нищо не си променя формата.'),
          ],
        },
      ]),
    ),
    a1(
      dictation('a1u1l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich kenne deinen Bruder.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wir besuchen meine Eltern.',
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
        typeIt('a1u1l2-m1', bi('Mastery: the accusative', 'Проверка: винителен падеж'), [
          {
            prompt: bi('I know your uncle.', 'Познавам чичо ти.'),
            answer: 'Ich kenne deinen Onkel.',
            hints: [],
          },
          {
            prompt: bi('He has no sister.', 'Той няма сестра.'),
            answer: 'Er hat keine Schwester.',
            hints: [],
          },
          {
            prompt: bi('We need a table.', 'Трябва ни маса.'),
            answer: 'Wir brauchen einen Tisch.',
            hints: [],
          },
          {
            prompt: bi('That is my neighbour.', 'Това е съседът ми.'),
            answer: 'Das ist mein Nachbar.',
            hints: [],
          },
        ]),
      ),
      a1(
        fillBlank('a1u1l2-m2', bi('Mastery: subject or object?', 'Проверка: подлог или допълнение?'), [
          {
            prompt: bi('The boy is looking for his father.', 'Момчето търси баща си.'),
            scaffold: '___ Junge sucht seinen Vater.',
            answer: 'Der',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I see the boy.', 'Виждам момчето.'),
            scaffold: 'Ich sehe ___ Jungen.',
            answer: 'den',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — sein and ihr
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u1-l3',
  unitId: 'a1-u1',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('His family, her family', 'Неговото семейство, нейното семейство'),
  objective: bi(
    'After this lesson you will be able to talk about someone else’s family with sein and ihr, and describe a person with a handful of common adjectives.',
    'След този урок ще можеш да говориш за семейството на друг човек със sein и ihr и да опишеш човек с няколко често използвани прилагателни.',
  ),
  outcomes: [
    bi('I can say his and her in German.', 'Мога да кажа „негов“ и „неин“ на немски.'),
    bi('I know the ending describes the thing owned, not the owner.', 'Знам, че окончанието описва притежаваното, а не притежателя.'),
    bi('I can describe a person with nett, freundlich, lustig, ruhig, klug and streng.', 'Мога да опиша човек с nett, freundlich, lustig, ruhig, klug и streng.'),
    bi('I can tell the two meanings of ihr apart.', 'Мога да различа двете значения на ihr.'),
  ],
  vocabIds: [
    'v-nett',
    'v-freundlich',
    'v-lustig',
    'v-ruhig',
    'v-klug',
    'v-jung',
    'v-streng',
    'v-zusammen',
    'v-sehr',
    'v-person',
    'v-mensch',
  ],
  grammarIds: ['g-sein-ihr'],
  sections: [
    {
      id: 'a1u1l3-intro',
      kind: 'intro',
      title: bi('Talking about someone else', 'Да говориш за друг човек'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'So far every family has been yours or the person you are speaking to. This lesson lets you talk about a third person — which is most of what conversation actually is.',
            'Досега всяко семейство беше твоето или на човека, с когото говориш. Този урок ти позволява да говориш за трети човек — а именно това е по-голямата част от разговорите.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l3-grammar',
      kind: 'grammar',
      title: bi('sein and ihr', 'sein и ihr'),
      blocks: [],
      grammarId: 'g-sein-ihr',
    },
    {
      id: 'a1u1l3-vocab',
      kind: 'vocabulary',
      title: bi('Describing a person', 'Как да опишеш човек'),
      vocabIds: ['v-nett', 'v-freundlich', 'v-lustig', 'v-ruhig', 'v-klug', 'v-jung', 'v-streng', 'v-sehr'],
      blocks: [
        {
          t: 'p',
          text: bi(
            'These adjectives come after sein, where they never change their form: "Er ist nett", "Sie ist nett", "Sie sind nett". Adjectives in front of a noun do change, but that is a later lesson.',
            'Тези прилагателни идват след sein, където никога не си менят формата: „Er ist nett“, „Sie ist nett“, „Sie sind nett“. Прилагателните пред съществително се менят, но това е за по-късен урок.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Тук немският е по-лесен от българския. Българският мени прилагателното по род: „мил“, „мила“, „мило“. След немското sein прилагателното стои непроменено за всички: er ist nett, sie ist nett, es ist nett.',
          ),
        },
      ],
    },
    {
      id: 'a1u1l3-examples',
      kind: 'examples',
      title: bi('Two people, two possessives', 'Двама души, две притежателни'),
      blocks: [
        {
          t: 'breakdown',
          de: 'Seine Schwester ist sehr nett.',
          parts: [
            { de: 'Seine', gloss: bi('his — with an e, because Schwester is feminine', 'негова — с -e, защото Schwester е женски род') },
            { de: 'Schwester', gloss: bi('sister', 'сестра') },
            { de: 'ist', gloss: bi('is', 'е') },
            { de: 'sehr nett', gloss: bi('very nice', 'много мила') },
          ],
        },
        {
          t: 'breakdown',
          de: 'Ihr Bruder ist sehr klug.',
          parts: [
            { de: 'Ihr', gloss: bi('her — no ending, because Bruder is masculine', 'неин — без окончание, защото Bruder е мъжки род') },
            { de: 'Bruder', gloss: bi('brother', 'брат') },
            { de: 'ist', gloss: bi('is', 'е') },
            { de: 'sehr klug', gloss: bi('very clever', 'много умен') },
          ],
        },
      ],
    },
    {
      id: 'a1u1l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('sein = his, ihr = her.', 'sein = негов, ihr = неин.'),
            bi('Both take the mein endings.', 'И двете взимат окончанията на mein.'),
            bi('The word says whose; the ending says what.', 'Думата казва чий; окончанието казва какво.'),
            bi('ihr before a verb is "you (plural)"; before a noun it is "her".', 'ihr пред глагол е „вие“; пред съществително е „неин“.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      fillBlank('a1u1l3-ex1', bi('His or her?', 'Негов или неин?'), [
        {
          prompt: bi('That is Tom. His sister is called Lena.', 'Това е Том. Сестра му се казва Лена.'),
          scaffold: 'Das ist Tom. ___ Schwester heißt Lena.',
          answer: 'Seine',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [
            bi('Tom is a man, so the word is sein.', 'Том е мъж, значи думата е sein.'),
            bi('Schwester is feminine, so it needs the e.', 'Schwester е женски род, значи трябва -e.'),
          ],
          traps: [
            {
              answer: 'Sein',
              category: 'gender',
              feedback: bi(
                'The word is right — Tom is a man — but the ending follows Schwester, which is feminine: seine Schwester.',
                'Думата е вярна — Том е мъж — но окончанието следва Schwester, което е женски род: seine Schwester.',
              ),
            },
            {
              answer: 'Ihre',
              category: 'pronoun',
              feedback: bi(
                'ihr is for a female owner. The owner here is Tom, so it is sein — and then seine, because Schwester is feminine.',
                'ihr е за притежател жена. Тук притежателят е Том, значи е sein — и след това seine, защото Schwester е женски род.',
              ),
            },
          ],
        },
        {
          prompt: bi('That is Lena. Her brother is called Tom.', 'Това е Лена. Брат ѝ се казва Том.'),
          scaffold: 'Das ist Lena. ___ Bruder heißt Tom.',
          answer: 'Ihr',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [bi('Lena is a woman, and Bruder is masculine.', 'Лена е жена, а Bruder е мъжки род.')],
          traps: [
            {
              answer: 'Ihre',
              category: 'gender',
              feedback: bi(
                'The owner is right, but the ending follows Bruder, which is masculine and takes no ending: ihr Bruder.',
                'Притежателят е верен, но окончанието следва Bruder, който е мъжки род и не взима окончание: ihr Bruder.',
              ),
            },
          ],
        },
        {
          prompt: bi('Her parents live in Sofia.', 'Родителите ѝ живеят в София.'),
          scaffold: '___ Eltern wohnen in Sofia.',
          answer: 'Ihre',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [bi('Plural takes the same ending as feminine.', 'Множественото число взима същото окончание като женския род.')],
        },
        {
          prompt: bi('His child is two years old.', 'Детето му е на две години.'),
          scaffold: '___ Kind ist zwei Jahre alt.',
          answer: 'Sein',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [bi('Kind is neuter, which takes no ending.', 'Kind е среден род и не взима окончание.')],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u1l3-ex2',
        bi('Describe them', 'Опиши ги'),
        [
          {
            prompt: bi('His brother is very funny.', 'Брат му е много забавен.'),
            answer: 'Sein Bruder ist sehr lustig.',
            reviewTargets: ['v-lustig', 'p-sein-ihr-ist'],
            hints: [],
          },
          {
            prompt: bi('Her grandmother is very friendly.', 'Баба ѝ е много любезна.'),
            answer: 'Ihre Großmutter ist sehr freundlich.',
            alternatives: ['Ihre Oma ist sehr freundlich.'],
            reviewTargets: ['v-freundlich'],
            hints: [],
          },
          {
            prompt: bi('My father is strict.', 'Баща ми е строг.'),
            answer: 'Mein Vater ist streng.',
            reviewTargets: ['v-streng'],
            hints: [],
          },
          {
            prompt: bi('Her son is very clever.', 'Синът ѝ е много умен.'),
            answer: 'Ihr Sohn ist sehr klug.',
            reviewTargets: ['v-klug'],
            hints: [],
          },
        ],
        ['g-sein-ihr'],
      ),
    ),
    a1(
      partialRecall('a1u1l3-ex3', bi('Which ihr is it?', 'Кое ihr е това?'), [
        {
          prompt: bi('Where do you live? (speaking to several friends)', 'Къде живеете? (към няколко приятели)'),
          scaffold: 'Wo wohnt i___?',
          answer: 'ihr',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [bi('Before a verb, ihr is the pronoun "you".', 'Пред глагол ihr е местоимението „вие“.')],
        },
        {
          prompt: bi('Her uncle works in Vienna.', 'Чичо ѝ работи във Виена.'),
          scaffold: 'I___ Onkel arbeitet in Wien.',
          answer: 'Ihr',
          shape: 'word',
          reviewTargets: ['g-sein-ihr'],
          hints: [bi('Before a noun, ihr is the possessive "her".', 'Пред съществително ihr е притежателното „неин“.')],
        },
      ]),
    ),
    a1(
      wordOrder('a1u1l3-ex4', bi('Build it', 'Подреди'), [
        {
          prompt: bi('His colleague is very nice. (female)', 'Колежката му е много мила.'),
          bank: ['Seine', 'Kollegin', 'ist', 'sehr', 'nett'],
          answer: 'Seine Kollegin ist sehr nett.',
          hints: [],
        },
        {
          prompt: bi('Her parents live together in Munich.', 'Родителите ѝ живеят заедно в Мюнхен.'),
          bank: ['Ihre', 'Eltern', 'wohnen', 'zusammen', 'in', 'München'],
          answer: 'Ihre Eltern wohnen zusammen in München.',
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u1l3-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ihr Bruder ist sehr nett.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Seine Tante wohnt in Berlin.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u1l3-ex6', bi('Write about one person', 'Напиши за един човек'), [
        {
          prompt: bi(
            'Write two sentences about someone in your family: who they are and what they are like.',
            'Напиши две изречения за някого от семейството ти: кой е и какъв е.',
          ),
          answer: 'Mein Bruder heißt Tom. Er ist sehr nett.',
          requiredTokens: ['ist'],
          shape: 'sentence',
          hints: [
            bi('Start with mein or meine plus a family word.', 'Започни с mein или meine плюс дума за семейство.'),
            bi('Use ist and one adjective for the second sentence.', 'Използвай ist и едно прилагателно за второто изречение.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u1l3-m1', bi('Mastery: his and her', 'Проверка: негов и неин'), [
          {
            prompt: bi('His sister is married.', 'Сестра му е омъжена.'),
            answer: 'Seine Schwester ist verheiratet.',
            hints: [],
          },
          {
            prompt: bi('Her father is very strict.', 'Баща ѝ е много строг.'),
            answer: 'Ihr Vater ist sehr streng.',
            hints: [],
          },
          {
            prompt: bi('I know her brother.', 'Познавам брат ѝ.'),
            answer: 'Ich kenne ihren Bruder.',
            hints: [
              bi('Object plus masculine — the ending comes back.', 'Допълнение плюс мъжки род — окончанието се връща.'),
            ],
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
  id: 'cp-a1-u1',
  scope: 'unit',
  targetId: 'a1-u1',
  status: 'available',
  title: bi('Unit 1 checkpoint', 'Проверка на раздел 1'),
  description: bi(
    'Family, possessives and the accusative together. Nothing here is new.',
    'Семейство, притежателни и винителен падеж заедно. Нищо тук не е ново.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u1-1', bi('Your family', 'Твоето семейство'), [
        {
          prompt: bi('My grandad comes from Austria.', 'Дядо ми е от Австрия.'),
          answer: 'Mein Opa kommt aus Österreich.',
          hints: [],
        },
        {
          prompt: bi('My aunt is married.', 'Леля ми е омъжена.'),
          answer: 'Meine Tante ist verheiratet.',
          hints: [],
        },
        {
          prompt: bi('I have two siblings.', 'Имам двама братя и сестри.'),
          answer: 'Ich habe zwei Geschwister.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u1-2', bi('Subject and object', 'Подлог и допълнение'), [
        {
          prompt: bi('I know your uncle.', 'Познавам чичо ти.'),
          answer: 'Ich kenne deinen Onkel.',
          hints: [],
        },
        {
          prompt: bi('We are visiting my grandma.', 'Гостуваме на баба.'),
          answer: 'Wir besuchen meine Oma.',
          hints: [],
        },
        {
          prompt: bi('He needs a table.', 'Трябва му маса.'),
          answer: 'Er braucht einen Tisch.',
          hints: [],
        },
        {
          prompt: bi('She has no brother.', 'Тя няма брат.'),
          answer: 'Sie hat keinen Bruder.',
          hints: [],
        },
      ]),
    ),
    a1(
      fillBlank('cp-a1u1-3', bi('The right form', 'Правилната форма'), [
        {
          prompt: bi('That is Lena. Her brother is called Tom.', 'Това е Лена. Брат ѝ се казва Том.'),
          scaffold: '___ Bruder heißt Tom.',
          answer: 'Ihr',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('That is Tom. His sister lives in Berlin.', 'Това е Том. Сестра му живее в Берлин.'),
          scaffold: '___ Schwester wohnt in Berlin.',
          answer: 'Seine',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I am looking for the neighbour.', 'Търся съседа.'),
          scaffold: 'Ich suche ___ Nachbarn.',
          answer: 'den',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u1-4',
        kind: 'type',
        objective: bi('Describing people', 'Описание на хора'),
        steps: [
          {
            prompt: bi('Her daughter is very quiet.', 'Дъщеря ѝ е много тиха.'),
            answer: 'Ihre Tochter ist sehr ruhig.',
            hints: [],
          },
          {
            prompt: bi('My neighbour is very nice.', 'Съседът ми е много мил.'),
            answer: 'Mein Nachbar ist sehr nett.',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u1-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich kenne deinen Vater.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Meine Geschwister wohnen in Wien.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_1: Unit = {
  id: 'a1-u1',
  level: 'a1',
  order: 1,
  status: 'available',
  title: bi('People and family', 'Хора и семейство'),
  summary: bi(
    'The wider family, mein and dein, and the accusative as a rule about German rather than a rule about haben.',
    'По-широкото семейство, mein и dein, и винителният падеж като правило за немския, а не правило за haben.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U1_PATTERNS = PATTERNS;
