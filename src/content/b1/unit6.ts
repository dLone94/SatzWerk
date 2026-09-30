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
 * B1 Unit 6 — Opinions and written German.
 *
 * The last unit of the level, and the only one whose subject is not a
 * situation. Every other B1 unit taught a place to go and a thing to get done.
 * This one teaches how to hold a position and defend it, which is what B1 is
 * actually defined by: not more vocabulary, but the ability to say *why*.
 *
 * There is almost no new grammar here, deliberately. By this point the learner
 * has every clause type German uses. What they do not have is the *shape* of
 * an argument — the fixed phrases that signal "here is my position", "here is
 * the other side", "here is my conclusion" — and those are taught as whole
 * phrases rather than assembled from parts, because that is how they are used.
 *
 * The one thing that does need teaching carefully is register, and it needs a
 * different warning in each path for the same reason: both languages reward
 * variation in formal writing and German does not. An English letter sounds
 * better for sounding like a person; a Bulgarian one has more freedom after
 * the salutation. German formal writing is formulaic on purpose, and
 * translating your own politeness produces something grammatical and subtly
 * wrong. So each path is told, in its own terms, to reproduce the German
 * formula rather than to compose one.
 *
 * The smallest point in the unit is also the most visible: the comma after
 * *Sehr geehrte Frau Weber,* and the small letter that follows it. English
 * capitalises there; Bulgarian capitalises there; German does not.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-meiner-meinung-nach',
    template: 'Meiner Meinung nach ist ___.',
    example: 'Meiner Meinung nach ist das keine gute Idee.',
    gloss: bi('In my opinion ___ is ___.', 'По мое мнение ___ е ___.'),
    level: 'b1',
    grammarIds: ['g-meinung-aeussern'],
  },
  {
    id: 'p-ich-finde-dass',
    template: 'Ich finde, dass ___.',
    example: 'Ich finde, dass wir mehr tun sollten.',
    gloss: bi('I think that ___.', 'Смятам, че ___.'),
    level: 'b1',
    grammarIds: ['g-meinung-aeussern'],
  },
  {
    id: 'p-einerseits-andererseits',
    template: 'Einerseits ___, andererseits ___.',
    example: 'Einerseits ist es praktisch, andererseits ist es teuer.',
    gloss: bi('On the one hand ___, on the other ___.', 'От една страна ___, от друга ___.'),
    level: 'b1',
    grammarIds: ['g-einerseits'],
  },
  {
    id: 'p-hiermit-teile-ich-mit',
    template: 'Hiermit teile ich Ihnen mit, dass ___.',
    example: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
    gloss: bi('I hereby inform you that ___.', 'С настоящото ви съобщавам, че ___.'),
    level: 'b1',
    grammarIds: ['g-formeller-brief'],
  },
];

/* ================================================================== *
 * Lesson 1 — having a position
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u6-l1',
  unitId: 'b1-u6',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('In my opinion: stating a position', 'По мое мнение: изразяване на позиция'),
  objective: bi(
    'After this lesson you can say what you think and why — which is the thing B1 is actually defined by.',
    'След този урок можеш да кажеш какво мислиш и защо — а това е нещото, което всъщност определя ниво B1.',
  ),
  outcomes: [
    bi('I can open with Ich finde, dass … or Meiner Meinung nach …', 'Мога да започна с Ich finde, dass … или Meiner Meinung nach …'),
    bi('I put the verb second after Meiner Meinung nach.', 'Слагам глагола втори след Meiner Meinung nach.'),
    bi('I can give a reason with Grund.', 'Мога да посоча причина с Grund.'),
    bi('I can agree without saying mit.', 'Мога да се съглася, без да казвам mit.'),
  ],
  vocabIds: [
    'v-die-meinung',
    'v-der-vorteil',
    'v-der-nachteil',
    'v-der-grund',
    'v-der-meinung-sein',
    'v-zustimmen',
  ],
  grammarIds: ['g-meinung-aeussern'],
  sections: [
    {
      id: 'b1u6l1-intro',
      kind: 'intro',
      title: bi('Two ways in', 'Два начина да започнеш'),
      blocks: [
        {
          t: 'de',
          de: 'Ich finde, dass wir mehr tun sollten.',
          gloss: bi('I think we should do more.', 'Смятам, че трябва да правим повече.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Meiner Meinung nach ist das keine gute Idee.',
          gloss: bi(
            'In my opinion that is not a good idea.',
            'По мое мнение това не е добра идея.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'The first is what you say out loud; the second is what you write. Both are fixed openings a German listener recognises instantly.',
            'Първото се казва на глас; второто се пише. И двете са устойчиви начала, които немският слушател разпознава веднага.',
          ),
        },
      ],
    },
    {
      id: 'b1u6l1-vocab',
      kind: 'vocabulary',
      title: bi('The words an argument is made of', 'Думите, от които е направен аргументът'),
      vocabIds: [
        'v-die-meinung',
        'v-der-vorteil',
        'v-der-nachteil',
        'v-der-grund',
        'v-der-meinung-sein',
        'v-zustimmen',
      ],
      blocks: [],
    },
    {
      id: 'b1u6l1-grammar',
      kind: 'grammar',
      title: bi('Stating a position', 'Изразяване на позиция'),
      blocks: [],
      grammarId: 'g-meinung-aeussern',
    },
    {
      id: 'b1u6l1-examples',
      kind: 'examples',
      title: bi('Saying what you think', 'Да кажеш какво мислиш'),
      blocks: [
        {
          t: 'de',
          de: 'Der größte Vorteil ist die Flexibilität.',
          gloss: bi('The biggest advantage is the flexibility.', 'Най-голямото предимство е гъвкавостта.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ein Nachteil ist, dass man weniger Kontakt hat.',
          gloss: bi(
            'One disadvantage is that you have less contact.',
            'Един недостатък е, че има по-малко контакт.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Es gibt mehrere Gründe dafür.',
          gloss: bi('There are several reasons for it.', 'Има няколко причини за това.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Da stimme ich dir zu.',
          gloss: bi('I agree with you on that.', 'Тук съм съгласен с теб.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u6l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich finde, dass … when speaking.', 'Ich finde, dass … в говор.'),
            bi('Meiner Meinung nach … when writing — verb second.', 'Meiner Meinung nach … в писане — глаголът втори.'),
            bi('Vorteil and Nachteil come as a pair.', 'Vorteil и Nachteil вървят в двойка.'),
            bi('ich stimme dir zu — dative, no preposition.', 'ich stimme dir zu — дателен, без предлог.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      wordOrder('b1u6l1-ex1', bi('Verb second, again', 'Глаголът втори, отново'), [
        {
          prompt: bi('In my opinion that is not a good idea.', 'По мое мнение това не е добра идея.'),
          bank: ['Meiner', 'Meinung', 'nach', 'ist', 'das', 'keine', 'gute', 'Idee.'],
          answer: 'Meiner Meinung nach ist das keine gute Idee.',
          hints: [
            bi(
              'The whole phrase is in position one, so the verb comes next.',
              'Целият израз е на първа позиция, затова глаголът идва веднага след него.',
            ),
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u6l1-ex2',
        bi('Say what you think', 'Кажи какво мислиш'),
        [
          {
            prompt: bi('I think we should do more.', 'Смятам, че трябва да правим повече.'),
            answer: 'Ich finde, dass wir mehr tun sollten.',
            reviewTargets: ['p-ich-finde-dass', 'v-der-meinung-sein'],
            hints: [],
          },
          {
            prompt: bi('In my opinion that is not a good idea.', 'По мое мнение това не е добра идея.'),
            answer: 'Meiner Meinung nach ist das keine gute Idee.',
            reviewTargets: ['p-meiner-meinung-nach', 'v-die-meinung'],
            hints: [],
            traps: [
              {
                answer: 'Meiner Meinung nach das ist keine gute Idee.',
                category: 'word-order',
                feedback: bi(
                  'The phrase occupies position one, so the verb has to come second and the subject moves behind it: Meiner Meinung nach **ist das** …',
                  'Изразът заема първа позиция, затова глаголът трябва да е втори, а подлогът минава зад него: Meiner Meinung nach **ist das** …',
                ),
              },
            ],
          },
          {
            prompt: bi('The biggest advantage is the flexibility.', 'Най-голямото предимство е гъвкавостта.'),
            answer: 'Der größte Vorteil ist die Flexibilität.',
            reviewTargets: ['v-der-vorteil'],
            hints: [],
          },
          {
            prompt: bi('I agree with you on that.', 'Тук съм съгласен с теб.'),
            answer: 'Da stimme ich dir zu.',
            alternatives: ['Ich stimme dir da zu.', 'Ich stimme dir zu.'],
            reviewTargets: ['v-zustimmen'],
            hints: [],
            traps: [
              {
                answer: 'Da stimme ich mit dir zu.',
                category: 'preposition',
                feedback: bi(
                  'zustimmen takes a plain dative with no preposition: ich stimme dir zu. The mit belongs to a different phrase — ich bin mit dir einverstanden.',
                  'zustimmen иска чист дателен без предлог: ich stimme dir zu. mit принадлежи на друг израз — ich bin mit dir einverstanden.',
                ),
              },
            ],
          },
        ],
        ['g-meinung-aeussern'],
      ),
    ),
    b1(
      fillBlank('b1u6l1-ex3', bi('Advantage or disadvantage?', 'Предимство или недостатък?'), [
        {
          prompt: bi('the biggest advantage', 'най-голямото предимство'),
          scaffold: 'Der größte ___ ist die Flexibilität.',
          answer: 'Vorteil',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('one disadvantage', 'един недостатък'),
          scaffold: 'Ein ___ ist, dass man weniger Kontakt hat.',
          answer: 'Nachteil',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('several reasons', 'няколко причини'),
          scaffold: 'Es gibt mehrere ___ dafür.',
          answer: 'Gründe',
          shape: 'word',
          hints: [bi('Plural, with an umlaut.', 'Множествено число, с умлаут.')],
        },
      ]),
    ),
    b1(
      dictation('b1u6l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Meiner Meinung nach ist das keine gute Idee.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich finde, dass wir mehr tun sollten.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u6l1-m1', bi('A position', 'Позиция'), [
          {
            prompt: bi('In my opinion that is not a good idea.', 'По мое мнение това не е добра идея.'),
            answer: 'Meiner Meinung nach ist das keine gute Idee.',
            hints: [],
          },
          {
            prompt: bi('I think we should do more.', 'Смятам, че трябва да правим повече.'),
            answer: 'Ich finde, dass wir mehr tun sollten.',
            hints: [],
          },
          {
            prompt: bi('I agree with you on that.', 'Тук съм съгласен с теб.'),
            answer: 'Da stimme ich dir zu.',
            alternatives: ['Ich stimme dir da zu.', 'Ich stimme dir zu.'],
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
        'Two openings, one word-order rule you already knew, and a pair of nouns. Next: the other side of the argument.',
        'Две начала, едно правило за словоред, което вече знаеше, и една двойка съществителни. Следва: другата страна на аргумента.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — the other side
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u6-l2',
  unitId: 'b1-u6',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('On the one hand: weighing both sides', 'От една страна: претегляне на двете страни'),
  objective: bi(
    'After this lesson you can look at both sides of a question before landing on one, which is what a B1 argument is expected to do.',
    'След този урок можеш да погледнеш и двете страни на въпроса, преди да заключиш — а точно това се очаква от аргумент на ниво B1.',
  ),
  outcomes: [
    bi('I can use einerseits … andererseits.', 'Мога да използвам einerseits … andererseits.'),
    bi('I keep the verb in second place after both.', 'Държа глагола на второ място след двете.'),
    bi('I can discuss the environment and traffic.', 'Мога да обсъждам околната среда и движението.'),
    bi('I can argue for and against working from home.', 'Мога да аргументирам за и против работата от вкъщи.'),
  ],
  vocabIds: [
    'v-einerseits',
    'v-die-umwelt',
    'v-der-verkehr',
    'v-das-homeoffice',
    'v-sparen',
    'v-vermeiden',
    'v-die-moeglichkeit',
  ],
  grammarIds: ['g-einerseits'],
  sections: [
    {
      id: 'b1u6l2-intro',
      kind: 'intro',
      title: bi('Both sides, then the landing', 'Двете страни, после заключението'),
      blocks: [
        {
          t: 'de',
          de: 'Einerseits ist es praktisch, andererseits ist es teuer.',
          gloss: bi(
            'On the one hand it is practical, on the other it is expensive.',
            'От една страна е практично, от друга е скъпо.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Nothing new in the grammar: both words are adverbs in position one, exactly like trotzdem and deshalb, so the verb comes second both times.',
            'Нищо ново в граматиката: и двете думи са наречия на първа позиция, точно като trotzdem и deshalb, затова глаголът идва втори и двата пъти.',
          ),
        },
      ],
    },
    {
      id: 'b1u6l2-vocab',
      kind: 'vocabulary',
      title: bi('Things Germans argue about', 'Неща, за които германците спорят'),
      vocabIds: [
        'v-einerseits',
        'v-die-umwelt',
        'v-der-verkehr',
        'v-das-homeoffice',
        'v-sparen',
        'v-vermeiden',
        'v-die-moeglichkeit',
      ],
      blocks: [],
    },
    {
      id: 'b1u6l2-grammar',
      kind: 'grammar',
      title: bi('einerseits … andererseits', 'einerseits … andererseits'),
      blocks: [],
      grammarId: 'g-einerseits',
    },
    {
      id: 'b1u6l2-examples',
      kind: 'examples',
      title: bi('A real argument', 'Истински аргумент'),
      blocks: [
        {
          t: 'de',
          de: 'Einerseits spart man Zeit, andererseits hat man weniger Kontakt.',
          gloss: bi(
            'On the one hand you save time, on the other you have less contact.',
            'От една страна се спестява време, от друга има по-малко контакт.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'In der Stadt gibt es zu viel Verkehr.',
          gloss: bi('There is too much traffic in the city.', 'В града има твърде много движение.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Man sollte unnötige Fahrten vermeiden.',
          gloss: bi('One should avoid unnecessary journeys.', 'Трябва да се избягват ненужни пътувания.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das ist besser für die Umwelt.',
          gloss: bi('That is better for the environment.', 'Това е по-добре за околната среда.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u6l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('einerseits … andererseits, verb second in both halves.', 'einerseits … andererseits, глаголът втори и в двете части.'),
            bi('The same rule as trotzdem and deshalb.', 'Същото правило като при trotzdem и deshalb.'),
            bi('Vorteil and Nachteil give the content.', 'Vorteil и Nachteil дават съдържанието.'),
            bi('Four phrases make a whole written argument.', 'Четири израза правят цял писмен аргумент.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u6l2-ex1', bi('Where does the verb go?', 'Къде отива глаголът?'), [
        {
          prompt: bi('einerseits + es ist praktisch', 'einerseits + es ist praktisch'),
          scaffold: 'Einerseits ___ es praktisch,',
          answer: 'ist',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('andererseits + es ist teuer', 'andererseits + es ist teuer'),
          scaffold: 'andererseits ___ es teuer.',
          answer: 'ist',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('einerseits + man spart Zeit', 'einerseits + man spart Zeit'),
          scaffold: 'Einerseits ___ man Zeit,',
          answer: 'spart',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u6l2-ex2',
        bi('Both sides', 'Двете страни'),
        [
          {
            prompt: bi(
              'On the one hand it is practical, on the other it is expensive.',
              'От една страна е практично, от друга е скъпо.',
            ),
            answer: 'Einerseits ist es praktisch, andererseits ist es teuer.',
            reviewTargets: ['p-einerseits-andererseits', 'v-einerseits'],
            hints: [],
            traps: [
              {
                answer: 'Einerseits es ist praktisch, andererseits es ist teuer.',
                category: 'word-order',
                feedback: bi(
                  'Both words take position one, so the verb comes second both times: Einerseits **ist es** …, andererseits **ist es** …',
                  'И двете думи заемат първа позиция, затова глаголът идва втори и двата пъти: Einerseits **ist es** …, andererseits **ist es** …',
                ),
              },
            ],
          },
          {
            prompt: bi(
              'On the one hand you save time, on the other you have less contact.',
              'От една страна се спестява време, от друга има по-малко контакт.',
            ),
            answer: 'Einerseits spart man Zeit, andererseits hat man weniger Kontakt.',
            reviewTargets: ['v-sparen'],
            hints: [],
          },
        ],
        ['g-einerseits'],
      ),
    ),
    b1(
      typeIt(
        'b1u6l2-ex3',
        bi('Traffic and the environment', 'Движение и околна среда'),
        [
          {
            prompt: bi('There is too much traffic in the city.', 'В града има твърде много движение.'),
            answer: 'In der Stadt gibt es zu viel Verkehr.',
            reviewTargets: ['v-der-verkehr'],
            hints: [],
          },
          {
            prompt: bi('One should avoid unnecessary journeys.', 'Трябва да се избягват ненужни пътувания.'),
            answer: 'Man sollte unnötige Fahrten vermeiden.',
            reviewTargets: ['v-vermeiden'],
            hints: [],
          },
          {
            prompt: bi('That is better for the environment.', 'Това е по-добре за околната среда.'),
            answer: 'Das ist besser für die Umwelt.',
            reviewTargets: ['v-die-umwelt'],
            hints: [],
          },
          {
            prompt: bi('I work from home twice a week.', 'Работя от вкъщи два пъти седмично.'),
            answer: 'Ich arbeite zweimal pro Woche im Homeoffice.',
            alternatives: ['Zweimal pro Woche arbeite ich im Homeoffice.'],
            reviewTargets: ['v-das-homeoffice'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      freeWriting('b1u6l2-ex4', bi('Argue both sides', 'Аргументирай и двете страни'), [
        {
          prompt: bi(
            'Write two sentences about working from home: one advantage and one disadvantage. Use einerseits and andererseits.',
            'Напиши две изречения за работата от вкъщи: едно предимство и един недостатък. Използвай einerseits и andererseits.',
          ),
          answer:
            'Einerseits spart man Zeit, andererseits hat man weniger Kontakt mit den Kollegen.',
          requiredTokens: ['einerseits'],
          shape: 'sentence',
          hints: [
            bi('The verb comes second in both halves.', 'Глаголът идва втори и в двете части.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u6l2-m1', bi('Weighing it up', 'Претегляне'), [
          {
            prompt: bi(
              'On the one hand it is practical, on the other it is expensive.',
              'От една страна е практично, от друга е скъпо.',
            ),
            answer: 'Einerseits ist es praktisch, andererseits ist es teuer.',
            hints: [],
          },
          {
            prompt: bi('That is better for the environment.', 'Това е по-добре за околната среда.'),
            answer: 'Das ist besser für die Umwelt.',
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
        'One matched pair and a familiar word-order rule. Next: putting it on paper, where German is more formulaic than you expect.',
        'Една двойка и едно познато правило за словоред. Следва: как се слага на хартия, където немският е по-шаблонен, отколкото очакваш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — writing it down
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u6-l3',
  unitId: 'b1-u6',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Yours sincerely: the formal letter', 'С уважение: официалното писмо'),
  objective: bi(
    'After this lesson you can write a formal German letter that reads as though a German wrote it — which is a matter of reproducing formulas, not of composing them.',
    'След този урок можеш да напишеш официално немско писмо, което звучи все едно го е писал германец — а това е въпрос на възпроизвеждане на шаблони, а не на съчиняване.',
  ),
  outcomes: [
    bi('I know the standard opening and closing.', 'Знам стандартното начало и завършек.'),
    bi('I write a small letter after the salutation comma.', 'Пиша с малка буква след запетаята на обръщението.'),
    bi('I can announce my point formally.', 'Мога да обявя темата си официално.'),
    bi('I can summarise at the end.', 'Мога да обобщя накрая.'),
  ],
  vocabIds: [
    'v-die-anrede',
    'v-mitteilen',
    'v-die-ruecksprache',
    'v-das-argument',
    'v-zusammenfassen',
    'v-schliesslich',
    'v-entscheiden',
  ],
  grammarIds: ['g-formeller-brief'],
  sections: [
    {
      id: 'b1u6l3-intro',
      kind: 'intro',
      title: bi('Formulas, and why they are correct', 'Шаблони и защо са правилни'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German formal writing is more fixed than you may expect. The phrases below are standard, everybody uses them, and reproducing them is expected rather than unimaginative.',
            'Официалното немско писане е по-стандартизирано, отколкото може да очакваш. Изразите по-долу са стандартни, всички ги използват и възпроизвеждането им се очаква, а не се смята за липса на въображение.',
          ),
        },
        {
          t: 'de',
          de: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
          gloss: bi(
            'I hereby inform you that I have to cancel the appointment.',
            'С настоящото ви съобщавам, че трябва да отменя часа.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u6l3-vocab',
      kind: 'vocabulary',
      title: bi('Writing formally', 'Официално писане'),
      vocabIds: [
        'v-die-anrede',
        'v-mitteilen',
        'v-die-ruecksprache',
        'v-das-argument',
        'v-zusammenfassen',
        'v-schliesslich',
        'v-entscheiden',
      ],
      blocks: [],
    },
    {
      id: 'b1u6l3-grammar',
      kind: 'grammar',
      title: bi('The formal letter', 'Официалното писмо'),
      blocks: [],
      grammarId: 'g-formeller-brief',
    },
    {
      id: 'b1u6l3-culture',
      kind: 'culture',
      title: bi('The four-paragraph argument', 'Аргументът в четири абзаца'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A written B1 argument has a shape, and the shape is what a reader and an examiner both look for.',
            'Писменият аргумент на ниво B1 има форма и точно нея търсят и читателят, и изпитващият.',
          ),
        },
        {
          t: 'list',
          items: [
            bi('1. Your position: Meiner Meinung nach …', '1. Твоята позиция: Meiner Meinung nach …'),
            bi('2. One side: Einerseits …', '2. Едната страна: Einerseits …'),
            bi('3. The other: Andererseits …', '3. Другата: Andererseits …'),
            bi('4. The landing: Zusammenfassend kann man sagen, dass …', '4. Заключението: Zusammenfassend kann man sagen, dass …'),
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('Four phrases, and the structure is done', 'Четири израза и структурата е готова'),
          text: bi(
            'Everything else is content. If you can produce those four openings reliably, the shape of your German writing will be right even on a day when the vocabulary is not.',
            'Всичко останало е съдържание. Ако можеш да произведеш тези четири начала уверено, формата на немския ти текст ще е правилна дори в ден, в който лексиката не е.',
          ),
        },
      ],
    },
    {
      id: 'b1u6l3-examples',
      kind: 'examples',
      title: bi('A letter, line by line', 'Писмо, ред по ред'),
      blocks: [
        {
          t: 'de',
          de: 'Sehr geehrte Damen und Herren,',
          gloss: bi('Dear Sir or Madam,', 'Уважаеми дами и господа,'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
          gloss: bi(
            'I hereby inform you that I have to cancel the appointment.',
            'С настоящото ви съобщавам, че трябва да отменя часа.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.',
          gloss: bi(
            'I am happy to answer any questions.',
            'На разположение съм за допълнителни въпроси.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Mit freundlichen Grüßen',
          gloss: bi('Yours sincerely', 'С уважение'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u6l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Sehr geehrte Damen und Herren, — then a small letter.', 'Sehr geehrte Damen und Herren, — после малка буква.'),
            bi('Hiermit teile ich Ihnen mit, dass …', 'Hiermit teile ich Ihnen mit, dass …'),
            bi('Für Rückfragen stehe ich Ihnen gern zur Verfügung.', 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.'),
            bi('Mit freundlichen Grüßen — no comma after it.', 'Mit freundlichen Grüßen — без запетая след него.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      typeIt(
        'b1u6l3-ex1',
        bi('The fixed lines', 'Устойчивите редове'),
        [
          {
            prompt: bi('Dear Sir or Madam,', 'Уважаеми дами и господа,'),
            answer: 'Sehr geehrte Damen und Herren,',
            reviewTargets: ['v-die-anrede'],
            hints: [],
          },
          {
            prompt: bi(
              'I hereby inform you that I have to cancel the appointment.',
              'С настоящото ви съобщавам, че трябва да отменя часа.',
            ),
            answer: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
            reviewTargets: ['p-hiermit-teile-ich-mit', 'v-mitteilen'],
            hints: [],
          },
          {
            prompt: bi('I am happy to answer any questions.', 'На разположение съм за допълнителни въпроси.'),
            answer: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.',
            reviewTargets: ['v-die-ruecksprache'],
            hints: [],
          },
          {
            prompt: bi('Yours sincerely', 'С уважение'),
            answer: 'Mit freundlichen Grüßen',
            hints: [],
          },
        ],
        ['g-formeller-brief'],
      ),
    ),
    b1(
      exercise({
        id: 'b1u6l3-ex2',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('Capital or small?', 'Главна или малка буква?'),
        steps: [
          {
            prompt: bi(
              'After the salutation comma, the sentence has not started yet.',
              'След запетаята на обръщението изречението още не е започнало.',
            ),
            scaffold: 'Sehr geehrte Frau Weber, ___ schreibe Ihnen wegen der Wohnung.',
            answer: 'ich',
            shape: 'word',
            hints: [],
            traps: [
              {
                answer: 'Ich',
                category: 'capitalization',
                feedback: bi(
                  'German keeps a small letter here: the comma after the salutation does not end a sentence. English and Bulgarian both capitalise; German does not.',
                  'Немският държи малка буква тук: запетаята след обръщението не завършва изречение. И английският, и българският пишат с главна; немският — не.',
                ),
              },
            ],
          },
        ],
      }),
    ),
    b1(
      typeIt(
        'b1u6l3-ex3',
        bi('Landing the argument', 'Заключение на аргумента'),
        [
          {
            prompt: bi(
              'In summary, one can say that both have advantages.',
              'В обобщение може да се каже, че и двете имат предимства.',
            ),
            answer: 'Zusammenfassend kann man sagen, dass beides Vorteile hat.',
            reviewTargets: ['v-zusammenfassen'],
            hints: [],
          },
          {
            prompt: bi('In the end everyone has to decide for themselves.', 'В крайна сметка всеки решава сам.'),
            answer: 'Schließlich muss jeder selbst entscheiden.',
            reviewTargets: ['v-schliesslich', 'v-entscheiden'],
            hints: [],
          },
          {
            prompt: bi('That is a good point.', 'Това е добър аргумент.'),
            answer: 'Das ist ein gutes Argument.',
            reviewTargets: ['v-das-argument'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      freeWriting('b1u6l3-ex4', bi('Write the letter', 'Напиши писмото'), [
        {
          prompt: bi(
            'Write a short formal message: open correctly, say you have to cancel an appointment, and close with the standard two lines.',
            'Напиши кратко официално съобщение: започни правилно, кажи, че трябва да отмениш час, и завърши със стандартните два реда.',
          ),
          answer:
            'Sehr geehrte Damen und Herren, hiermit teile ich Ihnen mit, dass ich den Termin absagen muss. Für Rückfragen stehe ich Ihnen gern zur Verfügung. Mit freundlichen Grüßen',
          requiredTokens: ['geehrte'],
          shape: 'sentence',
          hints: [
            bi(
              'Salutation, the point, the offer to answer questions, the sign-off.',
              'Обръщение, темата, готовност за въпроси, завършек.',
            ),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u6l3-m1', bi('Writing formally', 'Официално писане'), [
          {
            prompt: bi(
              'I hereby inform you that I have to cancel the appointment.',
              'С настоящото ви съобщавам, че трябва да отменя часа.',
            ),
            answer: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
            hints: [],
          },
          {
            prompt: bi('I am happy to answer any questions.', 'На разположение съм за допълнителни въпроси.'),
            answer: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.',
            hints: [],
          },
          {
            prompt: bi(
              'In summary, one can say that both have advantages.',
              'В обобщение може да се каже, че и двете имат предимства.',
            ),
            answer: 'Zusammenfassend kann man sagen, dass beides Vorteile hat.',
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
        'A position, two sides, a conclusion and a letter that looks like a German wrote it. That is B1 — and the level checkpoint is next.',
        'Позиция, две страни, заключение и писмо, което изглежда писано от германец. Това е B1 — а следва проверката на нивото.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u6',
  scope: 'unit',
  targetId: 'b1-u6',
  status: 'available',
  title: bi('Unit 6 checkpoint', 'Проверка на раздел 6'),
  description: bi(
    'A position, both sides, and a formal letter.',
    'Позиция, двете страни и официално писмо.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u6-1', bi('Stating a position', 'Изразяване на позиция'), [
        {
          prompt: bi('In my opinion that is not a good idea.', 'По мое мнение това не е добра идея.'),
          answer: 'Meiner Meinung nach ist das keine gute Idee.',
          hints: [],
        },
        {
          prompt: bi('I think we should do more.', 'Смятам, че трябва да правим повече.'),
          answer: 'Ich finde, dass wir mehr tun sollten.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u6-2', bi('Both sides', 'Двете страни'), [
        {
          prompt: bi(
            'On the one hand it is practical, on the other it is expensive.',
            'От една страна е практично, от друга е скъпо.',
          ),
          answer: 'Einerseits ist es praktisch, andererseits ist es teuer.',
          hints: [],
        },
        {
          prompt: bi('One disadvantage is that you have less contact.', 'Един недостатък е, че има по-малко контакт.'),
          answer: 'Ein Nachteil ist, dass man weniger Kontakt hat.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u6-3', bi('The formal letter', 'Официалното писмо'), [
        {
          prompt: bi(
            'I hereby inform you that I have to cancel the appointment.',
            'С настоящото ви съобщавам, че трябва да отменя часа.',
          ),
          answer: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
          hints: [],
        },
        {
          prompt: bi('I am happy to answer any questions.', 'На разположение съм за допълнителни въпроси.'),
          answer: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.',
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u6-4',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('The details', 'Детайлите'),
        steps: [
          {
            prompt: bi('after the salutation comma', 'след запетаята на обръщението'),
            scaffold: 'Sehr geehrte Frau Weber, ___ schreibe Ihnen wegen der Wohnung.',
            answer: 'ich',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('agreeing, no preposition', 'съгласяване, без предлог'),
            scaffold: 'Da stimme ich ___ zu.',
            answer: 'dir',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      dictation('cp-b1u6-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Meiner Meinung nach ist das keine gute Idee.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Einerseits ist es praktisch, andererseits ist es teuer.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_6: Unit = {
  id: 'b1-u6',
  level: 'b1',
  order: 6,
  status: 'available',
  title: bi('Opinions and written German', 'Мнения и писмен немски'),
  summary: bi(
    'The only B1 unit whose subject is not a situation: how to hold a position, weigh both sides, and write a formal letter that reads as though a German wrote it — which is a matter of reproducing formulas rather than composing them.',
    'Единственият раздел на B1, чийто предмет не е ситуация: как да заемеш позиция, да претеглиш двете страни и да напишеш официално писмо, което звучи все едно го е писал германец — а това е възпроизвеждане на шаблони, не съчиняване.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U6_PATTERNS = PATTERNS;
