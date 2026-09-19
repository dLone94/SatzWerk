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
 * A2 Unit 3 — Work and education.
 *
 * The unit's claim is that it teaches almost no new grammar. dass and wenn do
 * to the verb exactly what weil did in Unit 2, and the first line of each
 * lesson says so rather than presenting a second rule. What is genuinely new is
 * one consequence: when a wenn-clause comes first, the main clause has to start
 * with its verb, and the two verbs end up meeting at the comma.
 *
 * That is the hardest single thing in A2 so far, and neither path has an anchor
 * for it — English and Bulgarian both keep subject-then-verb after the comma.
 * So neither path is offered a false comfort. What both get instead is the
 * reason: the whole clause occupies first position, and verb-second has been
 * the rule since Pre-A1. A wenn-clause is a long "Am Montag".
 *
 * The future is the easy half and is presented as such. German mostly uses the
 * present tense with a time word, which is one fewer thing to learn than either
 * path expects — a rare case of German asking for less.
 */

/** The shorthands default to pre-a1; everything in this file is A2. */
const a2 = (ex: Exercise): Exercise => ({ ...ex, level: 'a2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-glaube-dass',
    template: 'Ich glaube, dass ___ ___ ist.',
    example: 'Ich glaube, dass Deutsch schwer ist.',
    gloss: bi('I think that ___ is ___.', 'Мисля, че ___ е ___.'),
    level: 'a2',
    grammarIds: ['g-dass'],
  },
  {
    id: 'p-wenn-vorne',
    template: 'Wenn ich ___ habe, ___ ich ___.',
    example: 'Wenn ich Zeit habe, lerne ich Deutsch.',
    gloss: bi('When I have ___, I ___.', 'Когато имам ___, ___.'),
    level: 'a2',
    grammarIds: ['g-wenn'],
  },
  {
    id: 'p-moechte-werden',
    template: 'Ich möchte ___ werden.',
    example: 'Ich möchte Lehrer werden.',
    gloss: bi('I want to become a ___.', 'Искам да стана ___.'),
    level: 'a2',
    grammarIds: ['g-futur'],
  },
];

/* ================================================================== *
 * Lesson 1 — a job, and what you think of it
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a2-u3-l1',
  unitId: 'a2-u3',
  level: 'a2',
  order: 1,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('What you think: dass', 'Какво мислиш: dass'),
  objective: bi(
    'After this lesson you will be able to say what you think, believe and know — about your work and about anything else.',
    'След този урок ще можеш да кажеш какво мислиш, вярваш и знаеш — за работата си и за всичко останало.',
  ),
  outcomes: [
    bi('I can use dass with the verb at the end.', 'Мога да използвам dass с глагола в края.'),
    bi('I can say what I think with glauben, denken and wissen.', 'Мога да кажа какво мисля с glauben, denken и wissen.'),
    bi('I can talk about a job and what I earn.', 'Мога да говоря за работа и колко изкарвам.'),
    bi('I can tell dass from das.', 'Мога да различа dass от das.'),
  ],
  vocabIds: ['v-die-stelle', 'v-die-bewerbung', 'v-verdienen', 'v-das-geld', 'v-glauben', 'v-denken', 'v-wissen', 'v-dass', 'v-schwer'],
  grammarIds: ['g-dass'],
  sections: [
    {
      id: 'a2u3l1-intro',
      kind: 'intro',
      title: bi('You have already learnt this word order', 'Вече си научил този словоред'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'dass does exactly what weil does: comma in front, verb at the end. The only new thing is what it is for — not explaining why, but reporting what you think.',
            'dass прави точно каквото прави weil: запетая отпред, глагол в края. Единственото ново е за какво служи — не да обясняваш защо, а да съобщиш какво мислиш.',
          ),
        },
        {
          t: 'contrast',
          de: 'Ich bleibe zu Hause, weil ich krank bin. / Ich glaube, dass Deutsch schwer ist.',
          other: bi(
            'I am staying at home because I am ill. / I think that German is hard.',
            'Оставам вкъщи, защото съм болен. / Мисля, че немският е труден.',
          ),
          note: bi('Two words, one rule.', 'Две думи, едно правило.'),
        },
      ],
    },
    {
      id: 'a2u3l1-vocab',
      kind: 'vocabulary',
      title: bi('A job, and an opinion about it', 'Работа и мнение за нея'),
      vocabIds: ['v-die-stelle', 'v-die-bewerbung', 'v-verdienen', 'v-das-geld', 'v-glauben', 'v-denken', 'v-wissen', 'v-schwer'],
      blocks: [],
    },
    {
      id: 'a2u3l1-grammar',
      kind: 'grammar',
      title: bi('dass', 'dass'),
      blocks: [],
      grammarId: 'g-dass',
    },
    {
      id: 'a2u3l1-examples',
      kind: 'examples',
      title: bi('Saying what you think', 'Да кажеш какво мислиш'),
      blocks: [
        { t: 'de', de: 'Ich glaube, dass Deutsch schwer ist.', gloss: bi('I think German is hard.', 'Мисля, че немският е труден.'), audio: true },
        { t: 'de', de: 'Ich denke, dass das gut ist.', gloss: bi('I think that is good.', 'Мисля, че това е добре.'), audio: true },
        { t: 'de', de: 'Ich weiß, dass du Deutsch lernst.', gloss: bi('I know that you are learning German.', 'Знам, че учиш немски.'), audio: true },
        { t: 'de', de: 'Ich suche eine Stelle.', gloss: bi('I am looking for a job.', 'Търся работа.'), audio: true },
        { t: 'de', de: 'Ich verdiene nicht viel.', gloss: bi('I do not earn much.', 'Не изкарвам много.'), audio: true },
      ],
    },
    {
      id: 'a2u3l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('dass: comma in front, verb at the end.', 'dass: запетая отпред, глагол в края.'),
            bi('glauben, denken, wissen are what need it.', 'glauben, denken, wissen са тези, които го изискват.'),
            bi('dass with ss is the conjunction; das with one s is the article.', 'dass с ss е съюзът; das с едно s е членът.'),
            bi('wissen a fact, kennen a person.', 'wissen за факт, kennen за човек.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      wordOrder('a2u3l1-ex1', bi('Put the verb last', 'Сложи глагола последен'), [
        {
          prompt: bi('I think that German is hard.', 'Мисля, че немският е труден.'),
          bank: ['Ich', 'glaube,', 'dass', 'Deutsch', 'schwer', 'ist'],
          answer: 'Ich glaube, dass Deutsch schwer ist.',
          hints: [bi('Same as weil.', 'Като при weil.')],
        },
        {
          prompt: bi('I know that you are learning German.', 'Знам, че учиш немски.'),
          bank: ['Ich', 'weiß,', 'dass', 'du', 'Deutsch', 'lernst'],
          answer: 'Ich weiß, dass du Deutsch lernst.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u3l1-ex2',
        bi('Say what you think', 'Кажи какво мислиш'),
        [
          {
            prompt: bi('I think that German is hard.', 'Мисля, че немският е труден.'),
            answer: 'Ich glaube, dass Deutsch schwer ist.',
            reviewTargets: ['v-glauben', 'v-dass', 'p-ich-glaube-dass'],
            hints: [],
            traps: [
              {
                answer: 'Ich glaube, dass Deutsch ist schwer.',
                category: 'word-order',
                feedback: bi(
                  'After dass the verb goes to the end, exactly as after weil: dass Deutsch schwer ist.',
                  'След dass глаголът отива в края, точно както след weil: dass Deutsch schwer ist.',
                ),
              },
              {
                answer: 'Ich glaube, das Deutsch schwer ist.',
                category: 'spelling',
                feedback: bi(
                  'The conjunction is dass with a double s. das with one s is the article.',
                  'Съюзът е dass с двойно s. das с едно s е членът.',
                ),
              },
            ],
          },
          {
            prompt: bi('I think that is good.', 'Мисля, че това е добре.'),
            answer: 'Ich denke, dass das gut ist.',
            reviewTargets: ['v-denken'],
            hints: [bi('Both spellings appear in this one.', 'И двата правописа се появяват тук.')],
          },
          {
            prompt: bi('I am looking for a job.', 'Търся работа.'),
            answer: 'Ich suche eine Stelle.',
            reviewTargets: ['v-die-stelle'],
            hints: [],
          },
          {
            prompt: bi('I do not earn much.', 'Не изкарвам много.'),
            answer: 'Ich verdiene nicht viel.',
            reviewTargets: ['v-verdienen'],
            hints: [],
          },
        ],
        ['g-dass'],
      ),
    ),
    a2(
      fillBlank('a2u3l1-ex3', bi('dass or das?', 'dass или das?'), [
        {
          prompt: bi('I know that you are here.', 'Знам, че си тук.'),
          scaffold: 'Ich weiß, ___ du hier bist.',
          answer: 'dass',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the book (neuter)', 'книгата (среден род)'),
          scaffold: '___ Buch',
          answer: 'das',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u3l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich glaube, dass Deutsch schwer ist.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich suche eine Stelle.',
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
        typeIt('a2u3l1-m1', bi('Opinions', 'Мнения'), [
          {
            prompt: bi('I think that German is hard.', 'Мисля, че немският е труден.'),
            answer: 'Ich glaube, dass Deutsch schwer ist.',
            hints: [],
          },
          {
            prompt: bi('I know that you are learning German.', 'Знам, че учиш немски.'),
            answer: 'Ich weiß, dass du Deutsch lernst.',
            hints: [],
          },
          {
            prompt: bi('I have no money.', 'Нямам пари.'),
            answer: 'Ich habe kein Geld.',
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
        'One word order, three conjunctions. weil explains, dass reports, and the next lesson adds the third.',
        'Един словоред, три съюза. weil обяснява, dass съобщава, а следващият урок добавя третия.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — wenn, and the verb after the comma
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a2-u3-l2',
  unitId: 'a2-u3',
  level: 'a2',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Courses and conditions: wenn', 'Курсове и условия: wenn'),
  objective: bi(
    'After this lesson you will be able to say when and under what condition you do something — including with the condition first, which is where German rearranges itself.',
    'След този урок ще можеш да кажеш кога и при какво условие правиш нещо — включително с условието отпред, където немският се пренарежда.',
  ),
  outcomes: [
    bi('I can use wenn for both "if" and "when".', 'Мога да използвам wenn и за „ако“, и за „когато“.'),
    bi('I can start a sentence with the wenn-clause and still put the verb second.', 'Мога да започна изречението с wenn и пак да сложа глагола втори.'),
    bi('I can talk about a course and an exam.', 'Мога да говоря за курс и изпит.'),
    bi('I recognise the two verbs meeting at the comma.', 'Разпознавам двата глагола, които се срещат на запетаята.'),
  ],
  vocabIds: ['v-der-kurs', 'v-die-pruefung', 'v-wenn', 'v-wichtig', 'v-einfach', 'v-vielleicht'],
  grammarIds: ['g-wenn'],
  sections: [
    {
      id: 'a2u3l2-intro',
      kind: 'intro',
      title: bi('One word for if and when', 'Една дума за „ако“ и „когато“'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'wenn covers both, and moves the verb like weil and dass. The new part is what happens when you put the wenn-clause first — which is what people usually do.',
            'wenn покрива и двете и мести глагола като weil и dass. Новото е какво става, когато сложиш изречението с wenn отпред — а хората обикновено правят точно това.',
          ),
        },
      ],
    },
    {
      id: 'a2u3l2-vocab',
      kind: 'vocabulary',
      title: bi('Courses, exams, opinions', 'Курсове, изпити, мнения'),
      vocabIds: ['v-der-kurs', 'v-die-pruefung', 'v-wichtig', 'v-einfach', 'v-vielleicht'],
      blocks: [],
    },
    {
      id: 'a2u3l2-grammar',
      kind: 'grammar',
      title: bi('wenn, and the verb after the comma', 'wenn и глаголът след запетаята'),
      blocks: [],
      grammarId: 'g-wenn',
    },
    {
      id: 'a2u3l2-examples',
      kind: 'examples',
      title: bi('Both orders', 'И двата реда'),
      blocks: [
        { t: 'de', de: 'Ich lerne Deutsch, wenn ich Zeit habe.', gloss: bi('I study German when I have time.', 'Уча немски, когато имам време.'), audio: true },
        { t: 'de', de: 'Wenn ich Zeit habe, lerne ich Deutsch.', gloss: bi('When I have time, I study German.', 'Когато имам време, уча немски.'), audio: true },
        { t: 'de', de: 'Wenn die Prüfung einfach ist, bestehe ich sie.', gloss: bi('If the exam is easy, I will pass it.', 'Ако изпитът е лесен, ще го изкарам.'), audio: true },
        { t: 'de', de: 'Vielleicht mache ich einen Kurs.', gloss: bi('Maybe I will do a course.', 'Може би ще карам курс.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Look at the second and third examples: …habe, lerne… and …ist, bestehe… Two verbs with a comma between them is the sign you have done it right.',
            'Виж второто и третото изречение: …habe, lerne… и …ist, bestehe… Два глагола със запетая между тях е знакът, че си го направил правилно.',
          ),
        },
      ],
    },
    {
      id: 'a2u3l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('wenn = if and when.', 'wenn = „ако“ и „когато“.'),
            bi('The verb of the wenn-clause goes last.', 'Глаголът на изречението с wenn отива последен.'),
            bi('wenn-clause first → main verb right after the comma.', 'wenn отпред → главният глагол веднага след запетаята.'),
            bi('Two verbs meeting at the comma means it is right.', 'Два глагола, които се срещат на запетаята, значи е вярно.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      wordOrder('a2u3l2-ex1', bi('Condition first', 'Условието отпред'), [
        {
          prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
          bank: ['Wenn', 'ich', 'Zeit', 'habe,', 'lerne', 'ich', 'Deutsch'],
          answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
          hints: [bi('After the comma: verb, then subject.', 'След запетаята: глагол, после подлог.')],
        },
        {
          prompt: bi('I study German when I have time.', 'Уча немски, когато имам време.'),
          bank: ['Ich', 'lerne', 'Deutsch,', 'wenn', 'ich', 'Zeit', 'habe'],
          answer: 'Ich lerne Deutsch, wenn ich Zeit habe.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u3l2-ex2',
        bi('Say it both ways', 'Кажи го и по двата начина'),
        [
          {
            prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
            answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
            reviewTargets: ['v-wenn', 'p-wenn-vorne'],
            hints: [],
            traps: [
              {
                answer: 'Wenn ich Zeit habe, ich lerne Deutsch.',
                category: 'word-order',
                feedback: bi(
                  'The whole wenn-clause is in first position, so the main verb has to be second — right after the comma: …habe, lerne ich Deutsch.',
                  'Цялото изречение с wenn е на първа позиция, затова главният глагол трябва да е втори — веднага след запетаята: …habe, lerne ich Deutsch. Българското „…, аз уча немски“ тук не важи.',
                ),
              },
              {
                answer: 'Wenn ich habe Zeit, lerne ich Deutsch.',
                category: 'word-order',
                feedback: bi(
                  'Inside the wenn-clause the verb goes last: wenn ich Zeit habe.',
                  'Вътре в изречението с wenn глаголът отива последен: wenn ich Zeit habe.',
                ),
              },
            ],
          },
          {
            prompt: bi('I study German when I have time.', 'Уча немски, когато имам време.'),
            answer: 'Ich lerne Deutsch, wenn ich Zeit habe.',
            hints: [],
          },
          {
            prompt: bi('Maybe I will do a course.', 'Може би ще карам курс.'),
            answer: 'Vielleicht mache ich einen Kurs.',
            reviewTargets: ['v-vielleicht', 'v-der-kurs'],
            hints: [bi('Something first, so the verb is second.', 'Нещо отпред, значи глаголът е втори.')],
          },
          {
            prompt: bi('The exam was easy.', 'Изпитът беше лесен.'),
            answer: 'Die Prüfung war einfach.',
            reviewTargets: ['v-die-pruefung', 'v-einfach'],
            hints: [],
          },
        ],
        ['g-wenn'],
      ),
    ),
    a2(
      fillBlank('a2u3l2-ex3', bi('What comes after the comma?', 'Какво идва след запетаята?'), [
        {
          prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
          scaffold: 'Wenn ich Zeit habe, ___ ich Deutsch.',
          answer: 'lerne',
          shape: 'word',
          hints: [bi('The verb, not the subject.', 'Глаголът, не подлогът.')],
        },
        {
          prompt: bi('German is important for my work.', 'Немският е важен за работата ми.'),
          scaffold: 'Deutsch ist ___ für meine Arbeit.',
          answer: 'wichtig',
          shape: 'word',
          reviewTargets: ['v-wichtig'],
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u3l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Prüfung war einfach.',
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
        typeIt('a2u3l2-m1', bi('Conditions', 'Условия'), [
          {
            prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
            answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
            hints: [],
          },
          {
            prompt: bi('I am doing a German course.', 'Карам курс по немски.'),
            answer: 'Ich mache einen Deutschkurs.',
            alternatives: ['Ich mache einen Kurs.'],
            hints: [],
          },
          {
            prompt: bi('German is important for my work.', 'Немският е важен за работата ми.'),
            answer: 'Deutsch ist wichtig für meine Arbeit.',
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
        'Three conjunctions, one rule, and one consequence: put the clause first and the main verb follows the comma. That is the whole of subordinate word order at A2.',
        'Три съюза, едно правило и едно следствие: сложи изречението отпред и главният глагол идва след запетаята. Това е целият подчинен словоред на A2.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — what you are going to be
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a2-u3-l3',
  unitId: 'a2-u3',
  level: 'a2',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Plans: the future, and becoming something', 'Планове: бъдещето и „ставам нещо“'),
  objective: bi(
    'After this lesson you will be able to talk about your plans — and find out that German asks for less here than you expect.',
    'След този урок ще можеш да говориш за плановете си — и ще откриеш, че тук немският иска по-малко, отколкото очакваш.',
  ),
  outcomes: [
    bi('I can talk about the future with the present tense.', 'Мога да говоря за бъдещето със сегашно време.'),
    bi('I can say what I want to become.', 'Мога да кажа какъв искам да стана.'),
    bi('I recognise werden as a future marker.', 'Разпознавам werden като белег за бъдеще.'),
    bi('I can say what experience I have.', 'Мога да кажа какъв опит имам.'),
  ],
  vocabIds: ['v-werden', 'v-die-zukunft', 'v-die-erfahrung', 'v-das-team'],
  grammarIds: ['g-futur'],
  sections: [
    {
      id: 'a2u3l3-intro',
      kind: 'intro',
      title: bi('A rare case of German asking for less', 'Рядък случай, в който немският иска по-малко'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German has a future tense and mostly does not bother with it. "Morgen lerne ich" — present tense, plus a word that says when. That is how people talk about tomorrow.',
            'Немският има бъдеще време и в повечето случаи не си прави труда. „Morgen lerne ich“ — сегашно време плюс дума, която казва кога. Така хората говорят за утре.',
          ),
        },
      ],
    },
    {
      id: 'a2u3l3-vocab',
      kind: 'vocabulary',
      title: bi('Plans and experience', 'Планове и опит'),
      vocabIds: ['v-werden', 'v-die-zukunft', 'v-die-erfahrung', 'v-das-team'],
      blocks: [],
    },
    {
      id: 'a2u3l3-grammar',
      kind: 'grammar',
      title: bi('The future', 'Бъдещето'),
      blocks: [],
      grammarId: 'g-futur',
    },
    {
      id: 'a2u3l3-examples',
      kind: 'examples',
      title: bi('Talking about next year', 'Да говориш за догодина'),
      blocks: [
        { t: 'de', de: 'Morgen lerne ich Deutsch.', gloss: bi('Tomorrow I will study German.', 'Утре ще уча немски.'), audio: true },
        { t: 'de', de: 'Ich möchte Lehrer werden.', gloss: bi('I want to become a teacher.', 'Искам да стана учител.'), audio: true },
        { t: 'de', de: 'In Zukunft lerne ich mehr.', gloss: bi('In future I will study more.', 'В бъдеще ще уча повече.'), audio: true },
        { t: 'de', de: 'Ich habe viel Erfahrung.', gloss: bi('I have a lot of experience.', 'Имам много опит.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'No article before a profession, exactly as in Pre-A1: "Ich möchte Lehrer werden", not "ein Lehrer".',
            'Пред професия няма член, точно както в Pre-A1: „Ich möchte Lehrer werden“, не „ein Lehrer“.',
          ),
        },
      ],
    },
    {
      id: 'a2u3l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Present tense plus a time word is the normal future.', 'Сегашно време плюс дума за време е обичайното бъдеще.'),
            bi('werden also means "to become".', 'werden значи и „ставам“.'),
            bi('No article before a profession.', 'Пред професия няма член.'),
            bi('werden takes sein in the Perfekt: ist geworden.', 'werden взима sein в перфекта: ist geworden.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      typeIt(
        'a2u3l3-ex1',
        bi('Plans', 'Планове'),
        [
          {
            prompt: bi('Tomorrow I will study German.', 'Утре ще уча немски.'),
            answer: 'Morgen lerne ich Deutsch.',
            alternatives: ['Ich lerne morgen Deutsch.'],
            hints: [bi('Present tense is enough.', 'Сегашното време стига.')],
          },
          {
            prompt: bi('I want to become a teacher.', 'Искам да стана учител.'),
            answer: 'Ich möchte Lehrer werden.',
            reviewTargets: ['v-werden', 'p-moechte-werden'],
            hints: [],
            traps: [
              {
                answer: 'Ich möchte ein Lehrer werden.',
                category: 'article',
                feedback: bi(
                  'German uses no article before a profession: Ich möchte Lehrer werden.',
                  'Немският не слага член пред професия: Ich möchte Lehrer werden.',
                ),
              },
            ],
          },
          {
            prompt: bi('I have a lot of experience.', 'Имам много опит.'),
            answer: 'Ich habe viel Erfahrung.',
            reviewTargets: ['v-die-erfahrung'],
            hints: [],
          },
        ],
        ['g-futur'],
      ),
    ),
    a2(
      fillBlank('a2u3l3-ex2', bi('The missing word', 'Липсващата дума'), [
        {
          prompt: bi('I want to become a teacher.', 'Искам да стана учител.'),
          scaffold: 'Ich möchte Lehrer ___.',
          answer: 'werden',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('In future I will study more.', 'В бъдеще ще уча повече.'),
          scaffold: 'In ___ lerne ich mehr.',
          answer: 'Zukunft',
          shape: 'word',
          reviewTargets: ['v-die-zukunft'],
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u3l3-ex3', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte Lehrer werden.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Morgen lerne ich Deutsch.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a2(
      freeWriting('a2u3l3-ex4', bi('Your work and your plans', 'Твоята работа и планове'), [
        {
          prompt: bi(
            'Write four sentences: what you do, what you think of it, what you do when you have time, and what you want to become.',
            'Напиши четири изречения: какво работиш, какво мислиш за това, какво правиш, когато имаш време, и какъв искаш да станеш.',
          ),
          instruction: bi(
            'dass, wenn and werden all have to appear.',
            'Трябва да се появят dass, wenn и werden.',
          ),
          answer:
            'Ich arbeite als Lehrer. Ich glaube, dass die Arbeit schön ist. Wenn ich Zeit habe, lerne ich Deutsch. Ich möchte Ingenieur werden.',
          shape: 'sentence',
          requiredTokens: ['dass', 'wenn', 'werden'],
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u3l3-m1', bi('The future, plainly', 'Бъдещето, просто казано'), [
          {
            prompt: bi('Tomorrow I will study German.', 'Утре ще уча немски.'),
            answer: 'Morgen lerne ich Deutsch.',
            alternatives: ['Ich lerne morgen Deutsch.'],
            hints: [],
          },
          {
            prompt: bi('I want to become a teacher.', 'Искам да стана учител.'),
            answer: 'Ich möchte Lehrer werden.',
            hints: [],
          },
          {
            prompt: bi('The team is very nice.', 'Екипът е много симпатичен.'),
            answer: 'Das Team ist sehr nett.',
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
        'The present tense carries the future, and werden carries what you are going to be. Both are less work than your own language leads you to expect.',
        'Сегашното време носи бъдещето, а werden носи това, което ще станеш. И двете са по-малко работа, отколкото собственият ти език те кара да очакваш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a2-u3',
  scope: 'unit',
  targetId: 'a2-u3',
  status: 'available',
  title: bi('Unit 3 checkpoint', 'Проверка на раздел 3'),
  description: bi(
    'dass, wenn, and what you plan to do — with the verbs where German puts them.',
    'dass, wenn и какво смяташ да правиш — с глаголите там, където немският ги слага.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a2(
      typeIt('cp-a2u3-1', bi('What you think', 'Какво мислиш'), [
        {
          prompt: bi('I think that German is hard.', 'Мисля, че немският е труден.'),
          answer: 'Ich glaube, dass Deutsch schwer ist.',
          hints: [],
        },
        {
          prompt: bi('I know that you are learning German.', 'Знам, че учиш немски.'),
          answer: 'Ich weiß, dass du Deutsch lernst.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u3-2', bi('Conditions', 'Условия'), [
        {
          prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
          answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
          hints: [],
        },
        {
          prompt: bi('I study German when I have time.', 'Уча немски, когато имам време.'),
          answer: 'Ich lerne Deutsch, wenn ich Zeit habe.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u3-3', bi('Work and plans', 'Работа и планове'), [
        {
          prompt: bi('I am looking for a job.', 'Търся работа.'),
          answer: 'Ich suche eine Stelle.',
          hints: [],
        },
        {
          prompt: bi('I want to become a teacher.', 'Искам да стана учител.'),
          answer: 'Ich möchte Lehrer werden.',
          hints: [],
        },
        {
          prompt: bi('Tomorrow I will study German.', 'Утре ще уча немски.'),
          answer: 'Morgen lerne ich Deutsch.',
          alternatives: ['Ich lerne morgen Deutsch.'],
          hints: [],
        },
      ]),
    ),
    a2(
      exercise({
        id: 'cp-a2u3-4',
        kind: 'fillBlank',
        level: 'a2',
        objective: bi('The right word in the gap', 'Правилната дума в празното'),
        steps: [
          {
            prompt: bi('I know that you are here.', 'Знам, че си тук.'),
            scaffold: 'Ich weiß, ___ du hier bist.',
            answer: 'dass',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('When I have time, I study.', 'Когато имам време, уча.'),
            scaffold: 'Wenn ich Zeit habe, ___ ich.',
            answer: 'lerne',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      dictation('cp-a2u3-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte Lehrer werden.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A2_UNIT_3: Unit = {
  id: 'a2-u3',
  level: 'a2',
  order: 3,
  status: 'available',
  title: bi('Work and education', 'Работа и образование'),
  summary: bi(
    'dass and wenn, which do to the verb exactly what weil already did — and the one new consequence: put the clause first and the main verb follows the comma.',
    'dass и wenn, които правят с глагола точно каквото вече прави weil — и едно ново следствие: сложи изречението отпред и главният глагол идва след запетаята.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A2_U3_PATTERNS = PATTERNS;
