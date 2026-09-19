import {
  bi,
  conjugate,
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
 * A2 Unit 1 — Last weekend: the Perfekt.
 *
 * The first unit of A2, and it deliberately teaches almost no new words. The
 * learner finished A1 owning forty-three verbs; this unit gives them a second
 * form of those verbs rather than more verbs to carry. "Ich arbeite" becomes
 * "Ich habe gearbeitet", and the whole of A1 becomes sayable in the past.
 *
 * The word order is sold as something already owned, because it is: the bracket
 * in "Ich habe gestern Deutsch gelernt" is the bracket from A1 Unit 2's
 * separable verbs and Unit 2's modals. Three structures, one shape — and saying
 * so turns the hardest-looking thing in the unit into the easiest.
 *
 * The auxiliary is where the two paths diverge hardest, and the Bulgarian one
 * carries the sharper warning. Bulgarian forms its perfect with „съм“ for every
 * verb without exception, so the instinct produces *"Ich bin gearbeitet" —
 * confidently, and every time. It is authored as a trap in every lesson of the
 * unit rather than mentioned once and hoped for.
 */

/** The shorthands default to pre-a1; everything in this file is A2. */
const a2 = (ex: Exercise): Exercise => ({ ...ex, level: 'a2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-perfekt-haben',
    template: 'Ich habe ___ ge___t.',
    example: 'Ich habe gestern gearbeitet.',
    gloss: bi('I ___ed ___.', '___ ___.'),
    level: 'a2',
    grammarIds: ['g-perfekt-haben'],
  },
  {
    id: 'p-perfekt-sein',
    template: 'Ich bin nach ___ gefahren.',
    example: 'Ich bin nach Berlin gefahren.',
    gloss: bi('I went to ___.', 'Отидох до ___.'),
    level: 'a2',
    grammarIds: ['g-perfekt-sein'],
  },
  {
    id: 'p-war-hatte',
    template: 'Letztes Wochenende war ich ___.',
    example: 'Letztes Wochenende war ich in Berlin.',
    gloss: bi('Last weekend I was ___.', 'Миналия уикенд бях ___.'),
    level: 'a2',
    grammarIds: ['g-praeteritum-war-hatte'],
  },
  {
    id: 'p-was-hast-du-gemacht',
    template: 'Was hast du ___ gemacht?',
    example: 'Was hast du am Wochenende gemacht?',
    gloss: bi('What did you do ___?', 'Какво прави ___?'),
    level: 'a2',
    grammarIds: ['g-perfekt-haben'],
  },
];

/* ================================================================== *
 * Lesson 1 — haben plus a participle
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a2-u1-l1',
  unitId: 'a2-u1',
  level: 'a2',
  order: 1,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('What you did: haben and the participle', 'Какво си правил: haben и причастието'),
  objective: bi(
    'After this lesson you will be able to say what you did, using verbs you already know in a form you do not.',
    'След този урок ще можеш да кажеш какво си правил, с глаголи, които вече знаеш, във форма, която още не знаеш.',
  ),
  outcomes: [
    bi('I can put haben in second position and the participle at the end.', 'Мога да сложа haben на второ място, а причастието — накрая.'),
    bi('I can build ge- … -t participles from regular verbs.', 'Мога да строя причастия с ge- … -t от правилни глаголи.'),
    bi('I can say when something happened: gestern, letzte Woche.', 'Мога да кажа кога се е случило: gestern, letzte Woche.'),
    bi('I can ask someone what they did.', 'Мога да попитам някого какво е правил.'),
  ],
  vocabIds: ['v-vorgestern', 'v-letzte-woche', 'v-letztes-wochenende', 'v-letztes-jahr', 'v-die-party', 'v-der-ausflug'],
  grammarIds: ['g-perfekt-haben', 'g-partizip-2'],
  sections: [
    {
      id: 'a2u1l1-intro',
      kind: 'intro',
      title: bi('Everything you can already say, in the past', 'Всичко, което вече можеш да кажеш, в минало време'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You finished A1 with forty-three verbs. This unit does not add more — it gives you a second form of the ones you have, and with it every sentence you can already build becomes a sentence about yesterday.',
            'Завърши A1 с четиридесет и три глагола. Този раздел не добавя нови — дава ти втора форма на тези, които имаш, и с нея всяко изречение, което вече можеш да построиш, става изречение за вчера.',
          ),
        },
        {
          t: 'contrast',
          de: 'Ich arbeite. → Ich habe gearbeitet.',
          other: bi('I work. → I worked.', 'Работя. → Работих.'),
        },
      ],
    },
    {
      id: 'a2u1l1-grammar',
      kind: 'grammar',
      title: bi('haben plus a participle', 'haben плюс причастие'),
      blocks: [],
      grammarId: 'g-perfekt-haben',
    },
    {
      id: 'a2u1l1-partizip',
      kind: 'grammar',
      title: bi('Building the participle', 'Строеж на причастието'),
      blocks: [],
      grammarId: 'g-partizip-2',
    },
    {
      id: 'a2u1l1-vocab',
      kind: 'vocabulary',
      title: bi('When it happened', 'Кога се е случило'),
      vocabIds: ['v-vorgestern', 'v-letzte-woche', 'v-letztes-wochenende', 'v-letztes-jahr'],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'These phrases take no preposition and no article: letzte Woche, not "in der letzten Woche". Put one first and the verb still comes second — Letzte Woche habe ich gearbeitet.',
            'Тези изрази не взимат нито предлог, нито член: letzte Woche, не „in der letzten Woche“. Сложи един отпред и глаголът пак е втори — Letzte Woche habe ich gearbeitet.',
          ),
        },
      ],
    },
    {
      id: 'a2u1l1-examples',
      kind: 'examples',
      title: bi('A weekend, in the past tense', 'Един уикенд в минало време'),
      blocks: [
        { t: 'de', de: 'Was hast du am Wochenende gemacht?', gloss: bi('What did you do at the weekend?', 'Какво прави през уикенда?'), audio: true },
        { t: 'de', de: 'Ich habe eine Party gemacht.', gloss: bi('I had a party.', 'Направих парти.'), audio: true },
        { t: 'de', de: 'Wir haben einen Ausflug gemacht.', gloss: bi('We went on a trip.', 'Направихме излет.'), audio: true },
        { t: 'de', de: 'Ich habe gestern Deutsch gelernt.', gloss: bi('I studied German yesterday.', 'Вчера учих немски.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          only: ['bg'],
          text: bi(
            '',
            'Забележи helper-а във всяко от тези изречения: habe, hast, haben. Нито едно не използва bin. Българското „съм“ тук не важи.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          only: ['en'],
          text: bi(
            'Every one of these would be a past simple in English — "I had a party", not "I have had a party". German uses this form for both, so do not hold it back for the ones that feel like a present perfect.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a2u1l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('haben second, participle last.', 'haben втори, причастието последно.'),
            bi('Regular participles: ge + stem + t.', 'Правилни причастия: ge + основа + t.'),
            bi('-ieren verbs and be-/ver-/er- verbs take no ge-.', 'Глаголите на -ieren и тези с be-/ver-/er- нямат ge-.'),
            bi('The participle never changes for person.', 'Причастието не се мени по лице.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      partialRecall('a2u1l1-ex1', bi('Build the participle', 'Построй причастието'), [
        {
          prompt: bi('machen → ?', 'machen → ?'),
          scaffold: 'ge___',
          answer: 'gemacht',
          shape: 'word',
          reviewTargets: ['v-machen'],
          hints: [bi('ge + mach + t', 'ge + mach + t')],
        },
        {
          prompt: bi('spielen → ?', 'spielen → ?'),
          scaffold: 'ge___',
          answer: 'gespielt',
          shape: 'word',
          reviewTargets: ['v-spielen'],
          hints: [],
        },
        {
          prompt: bi('arbeiten → ?', 'arbeiten → ?'),
          scaffold: 'gearb___',
          answer: 'gearbeitet',
          shape: 'word',
          reviewTargets: ['v-arbeiten'],
          hints: [bi('An extra e: -t after -t cannot be said.', 'Допълнително e: -t след -t не се изговаря.')],
          traps: [
            {
              answer: 'gearbeitt',
              category: 'spelling',
              feedback: bi(
                'A stem ending in -t needs an -e- before the ending: gearbeitet.',
                'Основа, която завършва на -t, иска -e- преди окончанието: gearbeitet.',
              ),
            },
          ],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u1l1-ex2',
        bi('Say what you did', 'Кажи какво си правил'),
        [
          {
            prompt: bi('I worked.', 'Работих.'),
            answer: 'Ich habe gearbeitet.',
            reviewTargets: ['g-perfekt-haben', 'p-perfekt-haben'],
            hints: [bi('haben second, participle last.', 'haben втори, причастието последно.')],
            traps: [
              {
                answer: 'Ich bin gearbeitet.',
                category: 'auxiliary-verb',
                feedback: bi(
                  'arbeiten takes haben, not sein. Only movement and change-of-state verbs take sein: Ich habe gearbeitet.',
                  'arbeiten взима haben, не sein. Само глаголите за движение и промяна на състояние взимат sein. Българското „работил СЪМ“ подвежда тук: Ich habe gearbeitet.',
                ),
              },
              {
                answer: 'Ich habe arbeitet.',
                category: 'verb-conjugation',
                feedback: bi(
                  'The participle needs its ge-: gearbeitet.',
                  'Причастието иска своето ge-: gearbeitet.',
                ),
              },
            ],
          },
          {
            prompt: bi('Yesterday I cooked.', 'Вчера готвих.'),
            answer: 'Gestern habe ich gekocht.',
            alternatives: ['Ich habe gestern gekocht.'],
            reviewTargets: ['v-kochen'],
            hints: [bi('Something first, so the verb moves to second.', 'Нещо отпред, значи глаголът се мести на второ място.')],
          },
          {
            prompt: bi('We had a party.', 'Направихме парти.'),
            answer: 'Wir haben eine Party gemacht.',
            reviewTargets: ['v-die-party'],
            hints: [],
          },
          {
            prompt: bi('Last week I studied German.', 'Миналата седмица учих немски.'),
            answer: 'Letzte Woche habe ich Deutsch gelernt.',
            alternatives: ['Ich habe letzte Woche Deutsch gelernt.'],
            reviewTargets: ['v-letzte-woche'],
            hints: [],
          },
        ],
        ['g-perfekt-haben'],
      ),
    ),
    a2(
      wordOrder('a2u1l1-ex3', bi('Put the bracket together', 'Сглоби рамката'), [
        {
          prompt: bi('What did you do at the weekend?', 'Какво прави през уикенда?'),
          bank: ['Was', 'hast', 'du', 'am', 'Wochenende', 'gemacht'],
          answer: 'Was hast du am Wochenende gemacht?',
          hints: [bi('The participle is last, even in a question.', 'Причастието е последно дори във въпрос.')],
        },
        {
          prompt: bi('We went on a trip the day before yesterday.', 'Онзи ден направихме излет.'),
          bank: ['Vorgestern', 'haben', 'wir', 'einen', 'Ausflug', 'gemacht'],
          answer: 'Vorgestern haben wir einen Ausflug gemacht.',
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u1l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe gestern gearbeitet.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Was hast du gemacht?',
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
        typeIt('a2u1l1-m1', bi('The whole structure', 'Цялата конструкция'), [
          {
            prompt: bi('I studied German yesterday.', 'Вчера учих немски.'),
            answer: 'Ich habe gestern Deutsch gelernt.',
            alternatives: ['Gestern habe ich Deutsch gelernt.'],
            hints: [],
          },
          {
            prompt: bi('What did you do? (informal)', 'Какво прави?'),
            answer: 'Was hast du gemacht?',
            hints: [],
          },
          {
            prompt: bi('Last year I worked a lot.', 'Миналата година работих много.'),
            answer: 'Letztes Jahr habe ich viel gearbeitet.',
            alternatives: ['Ich habe letztes Jahr viel gearbeitet.'],
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
        'Every verb you learnt in A1 now has a past. The helper goes second and the verb waits at the end — the same bracket you have been building since Unit 2 of A1.',
        'Всеки глагол, който научи в A1, вече има минало. Помощният глагол е втори, а глаголът чака накрая — същата рамка, която строиш още от раздел 2 на A1.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — the verbs that take sein
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a2-u1-l2',
  unitId: 'a2-u1',
  level: 'a2',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Where you went: the verbs that take sein', 'Къде си ходил: глаголите със sein'),
  objective: bi(
    'After this lesson you will be able to talk about where you went, and know which verbs use sein instead of haben.',
    'След този урок ще можеш да говориш къде си ходил и ще знаеш кои глаголи използват sein вместо haben.',
  ),
  outcomes: [
    bi('I can use sein with verbs of movement.', 'Мога да използвам sein с глаголи за движение.'),
    bi('I know gegangen, gefahren, geflogen, gekommen, geblieben.', 'Знам gegangen, gefahren, geflogen, gekommen, geblieben.'),
    bi('I can say where I travelled and where I stayed.', 'Мога да кажа къде съм пътувал и къде съм останал.'),
    bi('I know that sein is the exception, not the rule.', 'Знам, че sein е изключението, а не правилото.'),
  ],
  vocabIds: ['v-bleiben', 'v-fliegen', 'v-die-reise', 'v-der-urlaub', 'v-das-hotel'],
  grammarIds: ['g-perfekt-sein'],
  sections: [
    {
      id: 'a2u1l2-intro',
      kind: 'intro',
      title: bi('A small group, used constantly', 'Малка група, използвана постоянно'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Most verbs take haben. A small group takes sein — and unfortunately that group contains the verbs you need most when talking about a weekend: going, driving, flying, coming, staying.',
            'Повечето глаголи взимат haben. Малка група взима sein — и за съжаление в тази група са точно глаголите, които най-много ти трябват, когато разказваш за уикенда: отивам, пътувам, летя, идвам, оставам.',
          ),
        },
      ],
    },
    {
      id: 'a2u1l2-grammar',
      kind: 'grammar',
      title: bi('Movement and change of state', 'Движение и промяна на състояние'),
      blocks: [],
      grammarId: 'g-perfekt-sein',
    },
    {
      id: 'a2u1l2-vocab',
      kind: 'vocabulary',
      title: bi('Travelling, and staying put', 'Пътуване и оставане'),
      vocabIds: ['v-bleiben', 'v-fliegen', 'v-die-reise', 'v-der-urlaub', 'v-das-hotel'],
      blocks: [],
    },
    {
      id: 'a2u1l2-examples',
      kind: 'examples',
      title: bi('A weekend away', 'Уикенд извън града'),
      blocks: [
        { t: 'de', de: 'Ich bin nach Berlin gefahren.', gloss: bi('I went to Berlin.', 'Отидох до Берлин.'), audio: true },
        { t: 'de', de: 'Wir sind nach Sofia geflogen.', gloss: bi('We flew to Sofia.', 'Летяхме до София.'), audio: true },
        { t: 'de', de: 'Ich bin zu Hause geblieben.', gloss: bi('I stayed at home.', 'Останах вкъщи.'), audio: true },
        { t: 'de', de: 'Das Hotel war gut, und die Reise war lang.', gloss: bi('The hotel was good, and the journey was long.', 'Хотелът беше добър, а пътуването — дълго.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Two helpers in one story is normal: "Ich bin nach Berlin gefahren und habe dort Freunde besucht." Each verb brings its own.',
            'Два помощни глагола в един разказ е нормално: „Ich bin nach Berlin gefahren und habe dort Freunde besucht.“ Всеки глагол си носи своя.',
          ),
        },
      ],
    },
    {
      id: 'a2u1l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Moved somewhere or changed state → sein.', 'Придвижи се или се промени → sein.'),
            bi('Everything else → haben.', 'Всичко останало → haben.'),
            bi('sein, bleiben, werden take sein with no reason.', 'sein, bleiben, werden взимат sein без причина.'),
            bi('gehen → gegangen, fahren → gefahren, fliegen → geflogen.', 'gehen → gegangen, fahren → gefahren, fliegen → geflogen.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      fillBlank('a2u1l2-ex1', bi('haben or sein?', 'haben или sein?'), [
        {
          prompt: bi('I went to Berlin.', 'Отидох до Берлин.'),
          scaffold: 'Ich ___ nach Berlin gefahren.',
          answer: 'bin',
          shape: 'word',
          reviewTargets: ['g-perfekt-sein'],
          hints: [bi('Did anything move?', 'Премести ли се нещо?')],
          traps: [
            {
              answer: 'habe',
              category: 'auxiliary-verb',
              feedback: bi(
                'fahren is movement from one place to another, so it takes sein: Ich bin nach Berlin gefahren.',
                'fahren е движение от едно място към друго, затова взима sein: Ich bin nach Berlin gefahren.',
              ),
            },
          ],
        },
        {
          prompt: bi('I cooked.', 'Готвих.'),
          scaffold: 'Ich ___ gekocht.',
          answer: 'habe',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'bin',
              category: 'auxiliary-verb',
              feedback: bi(
                'Nothing moved and nothing changed state, so kochen takes haben: Ich habe gekocht.',
                'Нищо не се е преместило и нищо не се е променило, затова kochen взима haben: Ich habe gekocht. (Българското „готвил съм“ подвежда.)',
              ),
            },
          ],
        },
        {
          prompt: bi('I stayed at home.', 'Останах вкъщи.'),
          scaffold: 'Ich ___ zu Hause geblieben.',
          answer: 'bin',
          shape: 'word',
          reviewTargets: ['v-bleiben'],
          hints: [bi('One of the three with no reason behind it.', 'Един от трите без обяснение.')],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u1l2-ex2',
        bi('Where you went', 'Къде си ходил'),
        [
          {
            prompt: bi('We flew to Sofia.', 'Летяхме до София.'),
            answer: 'Wir sind nach Sofia geflogen.',
            reviewTargets: ['v-fliegen', 'p-perfekt-sein'],
            hints: [],
          },
          {
            prompt: bi('I stayed at home.', 'Останах вкъщи.'),
            answer: 'Ich bin zu Hause geblieben.',
            reviewTargets: ['v-bleiben'],
            hints: [],
          },
          {
            prompt: bi('I went to the station on foot.', 'Отидох пеша до гарата.'),
            answer: 'Ich bin zu Fuß zum Bahnhof gegangen.',
            reviewTargets: ['v-gehen'],
            hints: [bi('zum from A1 Unit 5 has not changed.', 'zum от раздел 5 на A1 не се е променило.')],
          },
        ],
        ['g-perfekt-sein'],
      ),
    ),
    a2(
      wordOrder('a2u1l2-ex3', bi('Two verbs, two helpers', 'Два глагола, два помощни глагола'), [
        {
          prompt: bi('I went to Berlin and visited friends.', 'Отидох до Берлин и посетих приятели.'),
          bank: ['Ich', 'bin', 'nach', 'Berlin', 'gefahren', 'und', 'habe', 'Freunde', 'besucht'],
          answer: 'Ich bin nach Berlin gefahren und habe Freunde besucht.',
          hints: [bi('Each half keeps its own helper.', 'Всяка половина си пази своя помощен глагол.')],
        },
      ]),
    ),
    a2(
      dictation('a2u1l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bin nach Berlin gefahren.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wir sind zu Hause geblieben.',
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
        typeIt('a2u1l2-m1', bi('The right helper', 'Правилният помощен глагол'), [
          {
            prompt: bi('I went to Vienna.', 'Отидох до Виена.'),
            answer: 'Ich bin nach Wien gefahren.',
            hints: [],
          },
          {
            prompt: bi('I worked a lot.', 'Работих много.'),
            answer: 'Ich habe viel gearbeitet.',
            hints: [],
          },
          {
            prompt: bi('We stayed at home.', 'Останахме вкъщи.'),
            answer: 'Wir sind zu Hause geblieben.',
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
        'sein is the exception and haben is the rule — but the exception covers exactly the verbs a weekend story is made of, which is why it is worth the trouble.',
        'sein е изключението, а haben — правилото. Само че изключението покрива точно глаголите, от които е направен разказът за уикенда, и затова си заслужава усилието.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — war, hatte, and telling the story
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a2-u1-l3',
  unitId: 'a2-u1',
  level: 'a2',
  order: 3,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('war, hatte, and telling the whole story', 'war, hatte и целият разказ'),
  objective: bi(
    'After this lesson you will be able to tell someone about your weekend in several connected sentences.',
    'След този урок ще можеш да разкажеш за уикенда си в няколко свързани изречения.',
  ),
  outcomes: [
    bi('I can use war and hatte instead of the heavy Perfekt forms.', 'Мога да използвам war и hatte вместо тежките форми с Perfekt.'),
    bi('I can say es gab for "there was".', 'Мога да кажа es gab за „имаше“.'),
    bi('I can say whether something was good or boring.', 'Мога да кажа дали нещо е било хубаво или скучно.'),
    bi('I can tell a short story about my weekend.', 'Мога да разкажа накратко за уикенда си.'),
  ],
  vocabIds: ['v-frueher', 'v-passieren', 'v-das-konzert', 'v-super', 'v-langweilig', 'v-der-film'],
  grammarIds: ['g-praeteritum-war-hatte'],
  sections: [
    {
      id: 'a2u1l3-intro',
      kind: 'intro',
      title: bi('Three verbs that do it differently', 'Три глагола, които го правят другояче'),
      blocks: [
        {
          t: 'p',
          text: bi(
            '"Ich bin gewesen" is correct German that nobody says. For sein, haben and es gibt, spoken German keeps an older, shorter past — and you will hear it in the first sentence of any story about the weekend.',
            '„Ich bin gewesen“ е правилен немски, който никой не казва. При sein, haben и es gibt говоримият немски пази по-старо и по-кратко минало — и ще го чуеш в първото изречение на всеки разказ за уикенда.',
          ),
        },
      ],
    },
    {
      id: 'a2u1l3-grammar',
      kind: 'grammar',
      title: bi('war, hatte, es gab', 'war, hatte, es gab'),
      blocks: [],
      grammarId: 'g-praeteritum-war-hatte',
    },
    {
      id: 'a2u1l3-vocab',
      kind: 'vocabulary',
      title: bi('Was it any good?', 'Хубаво ли беше?'),
      vocabIds: ['v-super', 'v-langweilig', 'v-der-film', 'v-das-konzert', 'v-passieren', 'v-frueher'],
      blocks: [],
    },
    {
      id: 'a2u1l3-examples',
      kind: 'examples',
      title: bi('The whole weekend, told', 'Целият уикенд, разказан'),
      blocks: [
        { t: 'de', de: 'Letztes Wochenende war ich in Berlin.', gloss: bi('Last weekend I was in Berlin.', 'Миналия уикенд бях в Берлин.'), audio: true },
        { t: 'de', de: 'Ich hatte keine Zeit.', gloss: bi('I had no time.', 'Нямах време.'), audio: true },
        { t: 'de', de: 'Es gab ein Konzert.', gloss: bi('There was a concert.', 'Имаше концерт.'), audio: true },
        { t: 'de', de: 'Das Konzert war super, aber der Film war langweilig.', gloss: bi('The concert was great, but the film was boring.', 'Концертът беше супер, но филмът беше скучен.'), audio: true },
        { t: 'de', de: 'Was ist passiert?', gloss: bi('What happened?', 'Какво стана?'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'A story is just several of these in a row, joined with und, aber and denn — which you learnt in A1 Unit 4 and which still change nothing about the word order.',
            'Разказът е просто няколко такива изречения едно след друго, свързани с und, aber и denn — които научи в раздел 4 на A1 и които пак не променят нищо в словореда.',
          ),
        },
      ],
    },
    {
      id: 'a2u1l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('war, not bin gewesen.', 'war, не bin gewesen.'),
            bi('hatte, not habe gehabt.', 'hatte, не habe gehabt.'),
            bi('es gab, for "there was".', 'es gab за „имаше“.'),
            bi('ich and er/sie/es are the same: war, hatte.', 'ich и er/sie/es съвпадат: war, hatte.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      conjugate(
        'a2u1l3-ex1',
        'sein (Präteritum)',
        bi('war, all six', 'war, и шестте'),
        ['war', 'warst', 'war', 'waren', 'wart', 'waren'],
        ['v-sein-verb'],
      ),
    ),
    a2(
      typeIt(
        'a2u1l3-ex2',
        bi('Say how it was', 'Кажи как е било'),
        [
          {
            prompt: bi('Last weekend I was in Berlin.', 'Миналия уикенд бях в Берлин.'),
            answer: 'Letztes Wochenende war ich in Berlin.',
            alternatives: ['Ich war letztes Wochenende in Berlin.'],
            reviewTargets: ['p-war-hatte'],
            hints: [],
            traps: [
              {
                answer: 'Letztes Wochenende bin ich in Berlin gewesen.',
                category: 'verb-tense',
                feedback: bi(
                  'Not wrong, but nobody says it. For sein, German uses the simple past: war.',
                  'Не е грешно, но никой не го казва. При sein немският използва простото минало: war.',
                ),
              },
            ],
          },
          {
            prompt: bi('I had no time.', 'Нямах време.'),
            answer: 'Ich hatte keine Zeit.',
            hints: [],
          },
          {
            prompt: bi('There was a concert.', 'Имаше концерт.'),
            answer: 'Es gab ein Konzert.',
            reviewTargets: ['v-das-konzert'],
            hints: [],
          },
          {
            prompt: bi('The film was boring.', 'Филмът беше скучен.'),
            answer: 'Der Film war langweilig.',
            reviewTargets: ['v-langweilig', 'v-der-film'],
            hints: [],
          },
        ],
        ['g-praeteritum-war-hatte'],
      ),
    ),
    a2(
      fillBlank('a2u1l3-ex3', bi('The missing form', 'Липсващата форма'), [
        {
          prompt: bi('What happened?', 'Какво стана?'),
          scaffold: 'Was ist ___?',
          answer: 'passiert',
          shape: 'word',
          reviewTargets: ['v-passieren'],
          hints: [bi('An -ieren verb: no ge-.', 'Глагол на -ieren: без ge-.')],
          traps: [
            {
              answer: 'gepassiert',
              category: 'verb-conjugation',
              feedback: bi(
                'Verbs ending in -ieren build their participle with no ge-: passiert, studiert.',
                'Глаголите на -ieren правят причастието си без ge-: passiert, studiert.',
              ),
            },
          ],
        },
        {
          prompt: bi('I used to have more time.', 'Едно време имах повече време.'),
          scaffold: 'Früher ___ ich mehr Zeit.',
          answer: 'hatte',
          shape: 'word',
          reviewTargets: ['v-frueher'],
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u1l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Konzert war super.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich hatte keine Zeit.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a2(
      freeWriting('a2u1l3-ex5', bi('Tell me about your weekend', 'Разкажи за уикенда си'), [
        {
          prompt: bi(
            'Write four sentences about last weekend: where you were, what you did, where you went, and whether it was any good.',
            'Напиши четири изречения за миналия уикенд: къде беше, какво прави, къде ходи и дали беше хубаво.',
          ),
          instruction: bi(
            'Use your own weekend. war, a haben-participle and a sein-participle all have to appear.',
            'Използвай собствения си уикенд. Трябва да се появят war, причастие с haben и причастие със sein.',
          ),
          answer:
            'Letztes Wochenende war ich zu Hause. Ich habe viel gelesen. Am Sonntag bin ich zum Park gegangen. Es war super.',
          shape: 'sentence',
          requiredTokens: ['war', 'habe', 'bin'],
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u1l3-m1', bi('The story, in pieces', 'Разказът, на части'), [
          {
            prompt: bi('Last weekend I was at home.', 'Миналия уикенд бях вкъщи.'),
            answer: 'Letztes Wochenende war ich zu Hause.',
            alternatives: ['Ich war letztes Wochenende zu Hause.'],
            hints: [],
          },
          {
            prompt: bi('There was a party.', 'Имаше парти.'),
            answer: 'Es gab eine Party.',
            hints: [],
          },
          {
            prompt: bi('It was great.', 'Беше супер.'),
            answer: 'Es war super.',
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
        'With war, hatte and the Perfekt you can now tell someone what your weekend was like — which is the first thing anybody asks on a Monday.',
        'С war, hatte и Perfekt вече можеш да разкажеш какъв е бил уикендът ти — а това е първото, което всеки пита в понеделник.',
      ),
    },
  ],
};

/* ================================================================== *
 * Checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a2-u1',
  scope: 'unit',
  targetId: 'a2-u1',
  status: 'available',
  title: bi('Unit 1 checkpoint', 'Проверка на раздел 1'),
  description: bi(
    'The past tense: both helpers, the participles, and the three verbs that keep the simple past.',
    'Минало време: и двата помощни глагола, причастията и трите глагола, които пазят простото минало.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a2(
      typeIt('cp-a2u1-1', bi('With haben', 'С haben'), [
        {
          prompt: bi('I worked yesterday.', 'Вчера работих.'),
          answer: 'Ich habe gestern gearbeitet.',
          alternatives: ['Gestern habe ich gearbeitet.'],
          hints: [],
        },
        {
          prompt: bi('We had a party.', 'Направихме парти.'),
          answer: 'Wir haben eine Party gemacht.',
          hints: [],
        },
        {
          prompt: bi('What did you do? (informal)', 'Какво прави?'),
          answer: 'Was hast du gemacht?',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u1-2', bi('With sein', 'Със sein'), [
        {
          prompt: bi('I went to Berlin.', 'Отидох до Берлин.'),
          answer: 'Ich bin nach Berlin gefahren.',
          hints: [],
        },
        {
          prompt: bi('We flew to Sofia.', 'Летяхме до София.'),
          answer: 'Wir sind nach Sofia geflogen.',
          hints: [],
        },
        {
          prompt: bi('I stayed at home.', 'Останах вкъщи.'),
          answer: 'Ich bin zu Hause geblieben.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u1-3', bi('war, hatte, es gab', 'war, hatte, es gab'), [
        {
          prompt: bi('Last weekend I was in Berlin.', 'Миналия уикенд бях в Берлин.'),
          answer: 'Letztes Wochenende war ich in Berlin.',
          alternatives: ['Ich war letztes Wochenende in Berlin.'],
          hints: [],
        },
        {
          prompt: bi('I had no time.', 'Нямах време.'),
          answer: 'Ich hatte keine Zeit.',
          hints: [],
        },
        {
          prompt: bi('There was a concert.', 'Имаше концерт.'),
          answer: 'Es gab ein Konzert.',
          hints: [],
        },
      ]),
    ),
    a2(
      exercise({
        id: 'cp-a2u1-4',
        kind: 'fillBlank',
        level: 'a2',
        objective: bi('Which helper?', 'Кой помощен глагол?'),
        steps: [
          {
            prompt: bi('I cooked.', 'Готвих.'),
            scaffold: 'Ich ___ gekocht.',
            answer: 'habe',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I walked there.', 'Отидох пеша.'),
            scaffold: 'Ich ___ zu Fuß gegangen.',
            answer: 'bin',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('studieren → ?', 'studieren → ?'),
            scaffold: 'Ich habe Medizin ___.',
            answer: 'studiert',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      dictation('cp-a2u1-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bin nach Berlin gefahren.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Wochenende war super.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A2_UNIT_1: Unit = {
  id: 'a2-u1',
  level: 'a2',
  order: 1,
  status: 'available',
  title: bi('Last weekend: the Perfekt', 'Миналият уикенд: Perfekt'),
  summary: bi(
    'The past tense, built from verbs you already know: haben or sein in second position, the participle at the end, and war and hatte for the three verbs that never bothered with it.',
    'Миналото време, построено от глаголи, които вече знаеш: haben или sein на второ място, причастието накрая, и war и hatte за трите глагола, които никога не са си правили труда.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A2_U1_PATTERNS = PATTERNS;
