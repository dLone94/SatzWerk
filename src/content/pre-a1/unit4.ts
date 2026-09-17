import {
  bi,
  conjugate,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  multipleChoice,
  nounWithArticle,
  partialRecall,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Lesson, SentencePattern, Unit } from '../types.ts';

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-spreche',
    template: 'Ich spreche ___.',
    example: 'Ich spreche Bulgarisch.',
    gloss: bi('I speak ___.', 'Говоря ___.'),
    level: 'pre-a1',
  },
  {
    id: 'p-ich-bin-beruf',
    template: 'Ich bin ___.',
    example: 'Ich bin Lehrerin.',
    gloss: bi('I am a ___ (profession).', 'Аз съм ___ (професия).'),
    level: 'pre-a1',
    grammarIds: ['g-no-article-profession'],
  },
  {
    id: 'p-ich-habe-einen',
    template: 'Ich habe einen ___.',
    example: 'Ich habe einen Bruder.',
    gloss: bi('I have a ___ (masculine).', 'Имам един ___ (мъжки род).'),
    level: 'pre-a1',
    grammarIds: ['g-haben-accusative'],
  },
];

/* ================================================================== *
 * Lesson 1 - Countries and languages
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u4-l1',
  unitId: 'pre-a1-u4',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 18,
  title: bi('Countries and languages', 'Държави и езици'),
  objective: bi(
    'After this lesson you will be able to say which country you are from and which languages you speak.',
    'След този урок ще можеш да кажеш от коя държава си и какви езици говориш.',
  ),
  outcomes: [
    bi('I can name several countries and say where someone is from.', 'Мога да назова няколко държави и да кажа откъде е някой.'),
    bi('I can say which languages I speak.', 'Мога да кажа какви езици говоря.'),
    bi('I know that language names are capitalised in German.', 'Знам, че имената на езиците в немския се пишат с главна буква.'),
  ],
  vocabIds: [
    'v-oesterreich', 'v-die-schweiz', 'v-die-tuerkei', 'v-england',
    'v-deutsch', 'v-bulgarisch', 'v-englisch', 'v-sprechen', 'v-lernen',
    'v-welche-sprachen-sprichst-du',
  ],
  grammarIds: ['g-noun-capitals', 'g-present-endings'],
  patterns: [PATTERNS[0]!],
  sections: [
    {
      id: 'u4l1-intro',
      kind: 'intro',
      title: bi('Most countries need no article', 'Повечето държави са без член'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You already know "Ich komme aus Bulgarien". Most country names work exactly like that, with no article at all.',
            'Вече знаеш „Ich komme aus Bulgarien“. Повечето имена на държави работят точно така, без никакъв член.',
          ),
        },
        { t: 'de', de: 'Ich komme aus Deutschland.', gloss: bi('I come from Germany.', 'Аз съм от Германия.'), audio: true },
        { t: 'de', de: 'Er kommt aus Österreich.', gloss: bi('He comes from Austria.', 'Той е от Австрия.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          title: bi('A small group keeps its article', 'Малка група запазва члена си'),
          text: bi(
            'die Schweiz and die Türkei are feminine and keep their article. After "aus" it changes to "der": aus der Schweiz, aus der Türkei. Just learn these two as fixed phrases for now.',
            'die Schweiz и die Türkei са от женски род и запазват члена си. След „aus“ той става „der“: aus der Schweiz, aus der Türkei. Засега просто научи тези две като готови изрази.',
          ),
        },
      ],
    },
    {
      id: 'u4l1-vocab-countries',
      kind: 'vocabulary',
      title: bi('Countries', 'Държави'),
      blocks: [],
      vocabIds: ['v-oesterreich', 'v-die-schweiz', 'v-die-tuerkei', 'v-england'],
    },
    {
      id: 'u4l1-languages',
      kind: 'grammar',
      title: bi('Languages are nouns', 'Езиците са съществителни'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'In German a language is a noun, so it gets a capital letter: Deutsch, Englisch, Bulgarisch. You do not need an article with it.',
            'В немския езикът е съществително, затова се пише с главна буква: Deutsch, Englisch, Bulgarisch. Не ти трябва член пред него.',
          ),
        },
        { t: 'de', de: 'Ich spreche Bulgarisch.', gloss: bi('I speak Bulgarian.', 'Говоря български.'), audio: true },
        { t: 'de', de: 'Ich lerne Deutsch.', gloss: bi('I am learning German.', 'Уча немски.'), audio: true },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Разликата от българския е чисто правописна, но се забелязва веднага: българският пише „немски“ с малка буква, немският — „Deutsch“ с главна. Ако напишеш „deutsch“, ще изглежда като прилагателно, не като език.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['en'],
          text: bi(
            'English also capitalises languages, so this one is free. What is different is the missing article: German says "Ich lerne Deutsch", never "das Deutsch".',
            '',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'German has no progressive tense. "Ich lerne Deutsch" covers both "I learn German" and "I am learning German" — one form does both jobs.',
            'Немският няма отделна форма за продължително действие. „Ich lerne Deutsch“ значи и „уча немски“, и „в момента уча немски“ — една форма върши двете работи.',
          ),
        },
      ],
      vocabIds: ['v-deutsch', 'v-bulgarisch', 'v-englisch'],
    },
    {
      id: 'u4l1-sprechen',
      kind: 'grammar',
      title: bi('sprechen changes its vowel', 'sprechen мени гласната си'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'sprechen is the first verb you meet that changes its stem vowel. It only happens in the du and er/sie/es forms.',
            'sprechen е първият глагол, който мени гласната в основата си. Това става само при du и er/sie/es.',
          ),
        },
        {
          t: 'table',
          headers: [bi('Person', 'Лице'), bi('Form', 'Форма')],
          rows: [
            ['ich', 'spreche'],
            ['du', 'sprichst'],
            ['er / sie / es', 'spricht'],
            ['wir', 'sprechen'],
            ['ihr', 'sprecht'],
            ['sie / Sie', 'sprechen'],
          ],
          caption: bi(
            'e becomes i in exactly two places. Everywhere else it behaves normally.',
            'e става i точно на две места. Навсякъде другаде се държи нормално.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Българският също мени корена при някои глаголи („мога — можеш“), така че идеята не е чужда. Разликата е, че в немския промяната засяга само du и er/sie/es — никога ich или множественото число.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['en'],
          text: bi(
            'English does something similar in a few verbs — "I sing, I sang" — but only across tenses, never between persons. In German the change happens inside the present tense, which takes getting used to.',
            '',
          ),
        },
      ],
    },
    {
      id: 'u4l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Most countries: no article. aus Deutschland, aus England.', 'Повечето държави: без член. aus Deutschland, aus England.'),
            bi('Two to memorise: aus der Schweiz, aus der Türkei.', 'Две за запомняне: aus der Schweiz, aus der Türkei.'),
            bi('Languages are capitalised nouns with no article.', 'Езиците са съществителни с главна буква и без член.'),
            bi('sprechen: du sprichst, er spricht.', 'sprechen: du sprichst, er spricht.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    conjugate(
      'u4l1-ex1',
      'sprechen',
      bi('Conjugate sprechen', 'Спрегни sprechen'),
      ['spreche', 'sprichst', 'spricht', 'sprechen', 'sprecht', 'sprechen'],
      ['v-sprechen'],
    ),

    fillBlank('u4l1-ex2', bi('Guided typing', 'Насочено писане'), [
      {
        prompt: bi('I speak Bulgarian.', 'Говоря български.'),
        scaffold: 'Ich ___ Bulgarisch.',
        answer: 'spreche',
        shape: 'word',
        reviewTargets: ['v-sprechen', 'p-ich-spreche'],
        hints: [bi('The ich form.', 'Формата за ich.')],
      },
      {
        prompt: bi('Do you speak German? (informal)', 'Говориш ли немски?'),
        scaffold: '___ du Deutsch?',
        answer: 'Sprichst',
        shape: 'word',
        reviewTargets: ['v-sprechen'],
        hints: [bi('The du form, with the vowel change.', 'Формата за du, с промяната на гласната.')],
      },
      {
        prompt: bi('I come from Switzerland.', 'Аз съм от Швейцария.'),
        scaffold: 'Ich komme aus ___ Schweiz.',
        answer: 'der',
        shape: 'word',
        reviewTargets: ['v-die-schweiz'],
        hints: [bi('die Schweiz keeps its article, and it changes after aus.', 'die Schweiz запазва члена си и той се мени след aus.')],
      },
    ]),

    typeIt(
      'u4l1-ex3',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('I speak Bulgarian and German.', 'Говоря български и немски.'),
          answer: 'Ich spreche Bulgarisch und Deutsch.',
          reviewTargets: ['p-ich-spreche', 'v-bulgarisch', 'v-deutsch'],
          traps: [
            {
              answer: 'Ich spreche bulgarisch und deutsch.',
              category: 'capitalization',
              feedback: bi(
                'Languages are nouns in German, so they need capital letters: Bulgarisch und Deutsch.',
                'Езиците в немския са съществителни, затова искат главни букви: Bulgarisch und Deutsch.',
              ),
            },
          ],
          hints: [
            bi('Five words. Watch the capital letters.', 'Пет думи. Внимавай с главните букви.'),
            bi('Ich spreche ...', 'Ich spreche ...'),
          ],
        },
        {
          prompt: bi('I am learning German.', 'Уча немски.'),
          answer: 'Ich lerne Deutsch.',
          reviewTargets: ['v-lernen', 'v-deutsch'],
          hints: [bi('Three words.', 'Три думи.')],
        },
        {
          prompt: bi('He comes from Austria.', 'Той е от Австрия.'),
          answer: 'Er kommt aus Österreich.',
          reviewTargets: ['v-oesterreich'],
          traps: [
            {
              answer: 'Er kommen aus Österreich.',
              category: 'verb-conjugation',
              feedback: bi(
                'With "er" the verb takes -t: er kommt. "kommen" is the form for wir, sie and Sie.',
                'С „er“ глаголът взима -t: er kommt. „kommen“ е формата за wir, sie и Sie.',
              ),
            },
          ],
          hints: [bi('Four words. Watch the verb ending after er.', 'Четири думи. Внимавай с окончанието след er.')],
        },
        {
          prompt: bi('I come from Turkey.', 'Аз съм от Турция.'),
          answer: 'Ich komme aus der Türkei.',
          reviewTargets: ['v-die-tuerkei'],
          traps: [
            {
              answer: 'Ich komme aus Türkei.',
              category: 'article',
              feedback: bi(
                'die Türkei is one of the few countries that keeps its article, and after "aus" it becomes "der": aus der Türkei.',
                'die Türkei е една от малкото държави, които запазват члена си, и след „aus“ той става „der“: aus der Türkei.',
              ),
            },
          ],
          hints: [bi('This country keeps its article.', 'Тази държава запазва члена си.')],
        },
        {
          prompt: bi('Do you speak English? (formal)', 'Говорите ли английски? (учтиво)'),
          answer: 'Sprechen Sie Englisch?',
          reviewTargets: ['v-englisch'],
          hints: [bi('Yes/no question: the verb comes first.', 'Въпрос с да/не: глаголът идва първи.')],
        },
      ],
      ['g-present-endings', 'g-noun-capitals'],
    ),

    partialRecall('u4l1-ex4', bi('Partial recall', 'Частично припомняне'), [
      {
        prompt: bi('Which languages do you speak?', 'Какви езици говориш?'),
        scaffold: 'Welche S___ sprichst du?',
        answer: 'Sprachen',
        shape: 'word',
        reviewTargets: ['v-welche-sprachen-sprichst-du', 'v-die-sprache'],
        hints: [bi('The plural of die Sprache.', 'Множественото число на die Sprache.')],
      },
    ]),

    dictation('u4l1-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich spreche Deutsch und Englisch.',
        shape: 'sentence',
        reviewTargets: ['p-ich-spreche'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Sprechen Sie Bulgarisch?',
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u4l1-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('I speak Bulgarian.', 'Говоря български.'),
          answer: 'Ich spreche Bulgarisch.',
          hints: [],
        },
        {
          prompt: bi('Do you speak German? (informal)', 'Говориш ли немски?'),
          answer: 'Sprichst du Deutsch?',
          hints: [],
        },
        {
          prompt: bi('I come from Switzerland.', 'Аз съм от Швейцария.'),
          answer: 'Ich komme aus der Schweiz.',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 - Nationality and work
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u4-l2',
  unitId: 'pre-a1-u4',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Nationality and work', 'Националност и работа'),
  objective: bi(
    'After this lesson you will be able to say what nationality you are and what you do for a living — without an article, the way German does it.',
    'След този урок ще можеш да кажеш какъв си по националност и с какво се занимаваш — без член, както го прави немският.',
  ),
  outcomes: [
    bi('I can say my nationality and my profession.', 'Мога да кажа националността и професията си.'),
    bi('I know that German uses no article with a profession.', 'Знам, че немският не използва член при професия.'),
    bi('I can use the feminine -in forms correctly.', 'Мога да използвам правилно женските форми на -in.'),
    bi('I can ask someone what they do.', 'Мога да попитам някого с какво се занимава.'),
  ],
  vocabIds: [
    'v-der-deutsche', 'v-die-deutsche', 'v-der-bulgare', 'v-die-bulgarin',
    'v-der-beruf', 'v-der-lehrer', 'v-die-lehrerin', 'v-der-arzt', 'v-die-aerztin',
    'v-der-student', 'v-der-ingenieur', 'v-die-verkaeuferin',
    'v-was-machst-du-beruflich', 'v-arbeiten',
  ],
  grammarIds: ['g-no-article-profession'],
  patterns: [PATTERNS[1]!],
  sections: [
    {
      id: 'u4l2-intro',
      kind: 'intro',
      title: bi('The missing article', 'Липсващият член'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This lesson is short on grammar and long on useful words. There is exactly one rule, and it is a rule about leaving something out.',
            'Този урок е с малко граматика и много полезни думи. Има точно едно правило и то е правило за изпускане.',
          ),
        },
        { t: 'de', de: 'Ich bin Lehrer.', gloss: bi('I am a teacher.', 'Аз съм учител.'), audio: true },
        { t: 'de', de: 'Ich bin Bulgare.', gloss: bi('I am Bulgarian.', 'Аз съм българин.'), audio: true },
      ],
    },
    {
      id: 'u4l2-grammar',
      kind: 'grammar',
      title: bi('No article, and the -in ending', 'Без член и окончанието -in'),
      blocks: [],
      grammarId: 'g-no-article-profession',
    },
    {
      id: 'u4l2-nationalities',
      kind: 'vocabulary',
      title: bi('Nationalities', 'Националности'),
      blocks: [],
      vocabIds: ['v-der-deutsche', 'v-die-deutsche', 'v-der-bulgare', 'v-die-bulgarin'],
    },
    {
      id: 'u4l2-jobs',
      kind: 'vocabulary',
      title: bi('Professions', 'Професии'),
      blocks: [],
      vocabIds: [
        'v-der-beruf', 'v-der-lehrer', 'v-die-lehrerin', 'v-der-arzt', 'v-die-aerztin',
        'v-der-student', 'v-der-ingenieur', 'v-die-verkaeuferin', 'v-arbeiten',
      ],
    },
    {
      id: 'u4l2-dialogue',
      kind: 'examples',
      title: bi('Meeting a colleague', 'Среща с колега'),
      blocks: [
        { t: 'de', de: 'Guten Tag! Ich heiße Anna Weber.', gloss: bi('Hello! My name is Anna Weber.', 'Добър ден! Казвам се Ана Вебер.'), audio: true },
        { t: 'de', de: 'Freut mich. Was machen Sie beruflich?', gloss: bi('Pleased to meet you. What do you do for work?', 'Приятно ми е. С какво се занимавате?'), audio: true },
        { t: 'de', de: 'Ich bin Ärztin. Und Sie?', gloss: bi('I am a doctor. And you?', 'Аз съм лекарка. А Вие?'), audio: true },
        { t: 'de', de: 'Ich bin Ingenieur. Ich arbeite bei Siemens.', gloss: bi('I am an engineer. I work at Siemens.', 'Аз съм инженер. Работя в Siemens.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Two useful small things: "Freut mich" is the standard reply to an introduction, and "Und Sie?" hands the question straight back.',
            'Две полезни малки неща: „Freut mich“ е стандартният отговор при запознанство, а „Und Sie?“ връща въпроса обратно.',
          ),
        },
      ],
    },
    {
      id: 'u4l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich bin Lehrer. — a bare profession takes no article.', 'Ich bin Lehrer. — професия сама по себе си е без член.'),
            bi('A woman ends in -in: Lehrerin, Ärztin (umlaut too), Bulgarin (the -e drops).', 'Жена завършва на -in: Lehrerin, Ärztin (и умлаут), Bulgarin (пада -e).'),
            bi('Was machst du beruflich? / Was sind Sie von Beruf?', 'Was machst du beruflich? / Was sind Sie von Beruf?'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice('u4l2-ex1', bi('First exposure: with or without an article?', 'Първо запознаване: със или без член?'), [
      {
        prompt: bi('Which sentence is correct German?', 'Кое изречение е правилен немски?'),
        choices: [
          { id: 'a', de: 'Ich bin ein Lehrer.', gloss: bi('with an article', 'с член') },
          { id: 'b', de: 'Ich bin Lehrer.', gloss: bi('without an article', 'без член') },
        ],
        correct: 'b',
        answer: 'Ich bin Lehrer.',
        shape: 'sentence',
        reviewTargets: ['v-der-lehrer'],
        hints: [],
      },
    ]),

    typeIt(
      'u4l2-ex2',
      bi('Say what someone does', 'Кажи с какво се занимава някой'),
      [
        {
          prompt: bi('I am a teacher. (a man speaking)', 'Аз съм учител. (говори мъж)'),
          answer: 'Ich bin Lehrer.',
          reviewTargets: ['p-ich-bin-beruf', 'v-der-lehrer'],
          traps: [
            {
              answer: 'Ich bin ein Lehrer.',
              category: 'article',
              feedback: bi(
                'German leaves the article out with a profession: "Ich bin Lehrer", not "ein Lehrer".',
                'Немският изпуска члена при професия: „Ich bin Lehrer“, а не „ein Lehrer“ — точно както българското „Аз съм учител“.',
              ),
            },
          ],
          hints: [bi('Three words — fewer than you might expect.', 'Три думи — по-малко, отколкото очакваш.')],
        },
        {
          prompt: bi('My mother is a teacher.', 'Майка ми е учителка.'),
          answer: 'Meine Mutter ist Lehrerin.',
          reviewTargets: ['v-die-lehrerin', 'v-die-mutter'],
          traps: [
            {
              answer: 'Meine Mutter ist Lehrer.',
              category: 'gender',
              feedback: bi(
                'For a woman German uses the -in form: Lehrerin. "Lehrer" would describe a man.',
                'За жена немският използва формата на -in: Lehrerin. „Lehrer“ би описало мъж.',
              ),
            },
            {
              answer: 'Mein Mutter ist Lehrerin.',
              category: 'gender',
              feedback: bi(
                '"Mutter" is feminine (die Mutter), so the possessive takes an -e: meine Mutter.',
                '„Mutter“ е от женски род (die Mutter), затова притежателното взима -e: meine Mutter.',
              ),
            },
          ],
          hints: [bi('Four words. She is a woman, so watch the ending.', 'Четири думи. Тя е жена, внимавай с окончанието.')],
        },
        {
          prompt: bi('She is a doctor.', 'Тя е лекарка.'),
          answer: 'Sie ist Ärztin.',
          reviewTargets: ['v-die-aerztin'],
          hints: [bi('Three words, one of them with Ä.', 'Три думи, една от тях с Ä.')],
        },
        {
          prompt: bi('I am Bulgarian. (a woman speaking)', 'Аз съм българка. (говори жена)'),
          answer: 'Ich bin Bulgarin.',
          reviewTargets: ['v-die-bulgarin'],
          hints: [bi('The feminine form ends in -in.', 'Женската форма завършва на -in.')],
        },
        {
          prompt: bi('He is an engineer.', 'Той е инженер.'),
          answer: 'Er ist Ingenieur.',
          reviewTargets: ['v-der-ingenieur'],
          hints: [],
        },
        {
          prompt: bi('I work in Hamburg.', 'Работя в Хамбург.'),
          answer: 'Ich arbeite in Hamburg.',
          reviewTargets: ['v-arbeiten'],
          hints: [],
        },
        {
          prompt: bi('What do you do for work? (informal)', 'С какво се занимаваш?'),
          answer: 'Was machst du beruflich?',
          reviewTargets: ['v-was-machst-du-beruflich'],
          hints: [
            bi('Four words. It starts with the question word for "what".', 'Четири думи. Започва с въпросителната дума за „какво“.'),
            bi('Was machst ...', 'Was machst ...'),
          ],
        },
      ],
      ['g-no-article-profession'],
    ),

    fillBlank('u4l2-ex3', bi('Masculine or feminine form?', 'Мъжка или женска форма?'), [
      {
        prompt: bi('She is a shop assistant.', 'Тя е продавачка.'),
        scaffold: 'Sie ist ___.',
        answer: 'Verkäuferin',
        shape: 'word',
        reviewTargets: ['v-die-verkaeuferin'],
        hints: [bi('She is a woman, so the word ends in -in.', 'Тя е жена, затова думата завършва на -in.')],
      },
      {
        prompt: bi('He is a student.', 'Той е студент.'),
        scaffold: 'Er ist ___.',
        answer: 'Student',
        shape: 'word',
        reviewTargets: ['v-der-student'],
        hints: [],
      },
    ]),

    wordOrder('u4l2-ex4', bi('Build the sentence, then type it', 'Подреди изречението, после го напиши'), [
      {
        prompt: bi('My father is a doctor.', 'Баща ми е лекар.'),
        bank: ['ist', 'Mein', 'Arzt.', 'Vater'],
        answer: 'Mein Vater ist Arzt.',
        hints: [bi('Possessive, noun, verb, profession.', 'Притежателно, съществително, глагол, професия.')],
      },
    ]),

    dictation('u4l2-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich bin Lehrerin.',
        shape: 'sentence',
        reviewTargets: ['v-die-lehrerin'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Was machst du beruflich?',
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u4l2-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('I am a teacher. (a woman speaking)', 'Аз съм учителка. (говори жена)'),
          answer: 'Ich bin Lehrerin.',
          hints: [],
        },
        {
          prompt: bi('He is a doctor.', 'Той е лекар.'),
          answer: 'Er ist Arzt.',
          hints: [],
        },
        {
          prompt: bi('What do you do for work? (informal)', 'С какво се занимаваш?'),
          answer: 'Was machst du beruflich?',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 - Family, and haben
 * ================================================================== */

const lesson3: Lesson = {
  id: 'pre-a1-u4-l3',
  unitId: 'pre-a1-u4',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 22,
  title: bi('Family, and the verb haben', 'Семейство и глаголът haben'),
  objective: bi(
    'After this lesson you will be able to talk about your family and use haben with the accusative — your first real case ending.',
    'След този урок ще можеш да говориш за семейството си и да използваш haben с винителен падеж — първото ти истинско падежно окончание.',
  ),
  outcomes: [
    bi('I can name the members of my family.', 'Мога да назова членовете на семейството си.'),
    bi('I can conjugate haben.', 'Мога да спрегна haben.'),
    bi('I can say "Ich habe einen Bruder" with the right ending.', 'Мога да кажа „Ich habe einen Bruder“ с правилното окончание.'),
    bi('I can ask whether someone has brothers or sisters.', 'Мога да попитам дали някой има братя и сестри.'),
  ],
  vocabIds: [
    'v-die-familie', 'v-die-mutter', 'v-der-vater', 'v-die-eltern',
    'v-der-bruder', 'v-die-schwester', 'v-haben', 'v-hast-du-geschwister',
  ],
  grammarIds: ['g-haben-accusative'],
  patterns: [PATTERNS[2]!],
  sections: [
    {
      id: 'u4l3-intro',
      kind: 'intro',
      title: bi('Your first case ending', 'Първото ти падежно окончание'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Family words are easy. What makes this lesson important is the small change that happens after "haben".',
            'Думите за семейство са лесни. Това, което прави урока важен, е малката промяна, която става след „haben“.',
          ),
        },
        {
          t: 'breakdown',
          de: 'Ich habe einen Bruder.',
          parts: [
            { de: 'Ich', gloss: bi('I', 'аз') },
            { de: 'habe', gloss: bi('have', 'имам') },
            { de: 'einen', gloss: bi('a (masculine, object form)', 'един (мъжки род, форма за допълнение)') },
            { de: 'Bruder', gloss: bi('brother', 'брат') },
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Compare: Ich habe einen Bruder / eine Schwester / ein Kind. Only the masculine changed.',
            'Сравни: Ich habe einen Bruder / eine Schwester / ein Kind. Само мъжкият род се промени.',
          ),
        },
      ],
    },
    {
      id: 'u4l3-vocab',
      kind: 'vocabulary',
      title: bi('The family', 'Семейството'),
      blocks: [],
      vocabIds: [
        'v-die-familie', 'v-die-mutter', 'v-der-vater', 'v-die-eltern',
        'v-der-bruder', 'v-die-schwester',
      ],
    },
    {
      id: 'u4l3-grammar',
      kind: 'grammar',
      title: bi('haben and the accusative', 'haben и винителният падеж'),
      blocks: [],
      grammarId: 'g-haben-accusative',
    },
    {
      id: 'u4l3-examples',
      kind: 'examples',
      title: bi('Talking about family', 'Да говориш за семейството'),
      blocks: [
        { t: 'de', de: 'Ich habe eine Schwester und einen Bruder.', gloss: bi('I have a sister and a brother.', 'Имам една сестра и един брат.'), audio: true },
        { t: 'de', de: 'Meine Eltern wohnen in Bulgarien.', gloss: bi('My parents live in Bulgaria.', 'Родителите ми живеят в България.'), audio: true },
        { t: 'de', de: 'Hast du Geschwister?', gloss: bi('Do you have brothers or sisters?', 'Имаш ли братя и сестри?'), audio: true },
        { t: 'de', de: 'Wir haben zwei Kinder.', gloss: bi('We have two children.', 'Имаме две деца.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'With a plural, nothing changes at all: "zwei Kinder", "Geschwister". The ending only appears on a masculine singular.',
            'При множествено число нищо не се мени: „zwei Kinder“, „Geschwister“. Окончанието се появява само при мъжки род в единствено число.',
          ),
        },
      ],
    },
    {
      id: 'u4l3-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('haben: habe, hast, hat, haben, habt, haben.', 'haben: habe, hast, hat, haben, habt, haben.'),
            bi('After haben, masculine ein becomes einen.', 'След haben мъжкото ein става einen.'),
            bi('Feminine, neuter and plural do not change.', 'Женски, среден род и множествено число не се менят.'),
            bi('die Eltern and Geschwister are always plural.', 'die Eltern и Geschwister са винаги в множествено число.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    conjugate(
      'u4l3-ex1',
      'haben',
      bi('Conjugate haben', 'Спрегни haben'),
      ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
      ['v-haben'],
    ),

    nounWithArticle('u4l3-ex2', bi('Word, then word with article', 'Дума, после дума с член'), [
      {
        prompt: bi('mother', 'майка'),
        bare: 'Mutter',
        withArticle: 'die Mutter',
        vocabId: 'v-die-mutter',
        hint: bi('Feminine.', 'От женски род.'),
      },
      {
        prompt: bi('father', 'баща'),
        bare: 'Vater',
        withArticle: 'der Vater',
        vocabId: 'v-der-vater',
        hint: bi('Masculine.', 'От мъжки род.'),
      },
      {
        prompt: bi('sister', 'сестра'),
        bare: 'Schwester',
        withArticle: 'die Schwester',
        vocabId: 'v-die-schwester',
        hint: bi('Feminine.', 'От женски род.'),
      },
    ]),

    fillBlank('u4l3-ex3', bi('ein, eine or einen?', 'ein, eine или einen?'), [
      {
        prompt: bi('I have a brother.', 'Имам един брат.'),
        scaffold: 'Ich habe ___ Bruder.',
        answer: 'einen',
        shape: 'word',
        reviewTargets: ['v-der-bruder', 'p-ich-habe-einen'],
        hints: [bi('Bruder is masculine, and this is the object.', 'Bruder е от мъжки род и тук е допълнение.')],
      },
      {
        prompt: bi('I have a sister.', 'Имам една сестра.'),
        scaffold: 'Ich habe ___ Schwester.',
        answer: 'eine',
        shape: 'word',
        reviewTargets: ['v-die-schwester'],
        hints: [bi('Feminine does not change.', 'Женският род не се мени.')],
      },
      {
        prompt: bi('I have a child.', 'Имам едно дете.'),
        scaffold: 'Ich habe ___ Kind.',
        answer: 'ein',
        shape: 'word',
        reviewTargets: ['v-das-kind'],
        hints: [bi('Neuter does not change either.', 'Средният род също не се мени.')],
      },
    ]),

    typeIt(
      'u4l3-ex4',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('I have a brother.', 'Имам един брат.'),
          answer: 'Ich habe einen Bruder.',
          reviewTargets: ['p-ich-habe-einen', 'v-der-bruder'],
          traps: [
            {
              answer: 'Ich habe ein Bruder.',
              category: 'case',
              feedback: bi(
                '"Bruder" is masculine, and after haben a masculine object takes "einen": Ich habe einen Bruder.',
                '„Bruder“ е от мъжки род, а след haben мъжкото допълнение взима „einen“: Ich habe einen Bruder.',
              ),
            },
            {
              answer: 'Ich habe eine Bruder.',
              category: 'gender',
              feedback: bi(
                '"eine" is the feminine form. Bruder is masculine, so after haben it is "einen Bruder".',
                '„eine“ е женската форма. Bruder е от мъжки род, затова след haben е „einen Bruder“.',
              ),
            },
          ],
          hints: [
            bi('Four words. The masculine article changes here.', 'Четири думи. Мъжкият член тук се мени.'),
            bi('Ich habe ...', 'Ich habe ...'),
          ],
        },
        {
          prompt: bi('I have a sister.', 'Имам една сестра.'),
          answer: 'Ich habe eine Schwester.',
          reviewTargets: ['v-die-schwester'],
          hints: [bi('Feminine, so no change.', 'Женски род, значи без промяна.')],
        },
        {
          prompt: bi('I have two children.', 'Имам две деца.'),
          answer: 'Ich habe zwei Kinder.',
          reviewTargets: ['v-das-kind', 'v-zwei'],
          hints: [bi('Plural of das Kind.', 'Множествено число на das Kind.')],
        },
        {
          prompt: bi('Do you have brothers or sisters? (informal)', 'Имаш ли братя и сестри?'),
          answer: 'Hast du Geschwister?',
          reviewTargets: ['v-hast-du-geschwister'],
          hints: [
            bi('Three words. One German word covers brothers and sisters.', 'Три думи. Една немска дума покрива братя и сестри.'),
            bi('Hast du ...', 'Hast du ...'),
          ],
        },
        {
          prompt: bi('My parents live in Bulgaria.', 'Родителите ми живеят в България.'),
          answer: 'Meine Eltern wohnen in Bulgarien.',
          reviewTargets: ['v-die-eltern'],
          traps: [
            {
              answer: 'Meine Eltern wohnt in Bulgarien.',
              category: 'verb-conjugation',
              feedback: bi(
                '"Eltern" is plural, so the verb is plural too: meine Eltern wohnen.',
                '„Eltern“ е в множествено число, затова и глаголът е в множествено: meine Eltern wohnen.',
              ),
            },
          ],
          hints: [bi('Eltern is plural — so is the verb.', 'Eltern е в множествено число — и глаголът също.')],
        },
        {
          prompt: bi('My father is a doctor.', 'Баща ми е лекар.'),
          answer: 'Mein Vater ist Arzt.',
          reviewTargets: ['v-der-vater', 'v-der-arzt'],
          hints: [],
        },
      ],
      ['g-haben-accusative'],
    ),

    dictation('u4l3-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich habe einen Bruder.',
        shape: 'sentence',
        reviewTargets: ['p-ich-habe-einen'],
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Wir haben zwei Kinder.',
        shape: 'sentence',
        reviewTargets: ['v-haben'],
        hints: [],
      },
    ]),

    freeWriting('u4l3-ex6', bi('Free production', 'Свободно производство'), [
      {
        prompt: bi(
          'Write two sentences about your family: who you have, and where they live.',
          'Напиши две изречения за семейството си: кого имаш и къде живеят.',
        ),
        instruction: bi('Use your real family. There is no single right answer.', 'Използвай истинското си семейство. Няма един правилен отговор.'),
        answer: 'Ich habe eine Schwester. Meine Eltern wohnen in Sofia.',
        shape: 'sentence',
        requiredTokens: ['habe'],
        hints: [bi('Ich habe ... / Meine Eltern wohnen in ...', 'Ich habe ... / Meine Eltern wohnen in ...')],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u4l3-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('I have a brother.', 'Имам един брат.'),
          answer: 'Ich habe einen Bruder.',
          hints: [],
        },
        {
          prompt: bi('I have a sister.', 'Имам една сестра.'),
          answer: 'Ich habe eine Schwester.',
          hints: [],
        },
        {
          prompt: bi('Do you have brothers or sisters? (informal)', 'Имаш ли братя и сестри?'),
          answer: 'Hast du Geschwister?',
          hints: [],
        },
      ]),
      exercise({
        id: 'u4l3-m2',
        kind: 'conjugation',
        objective: bi('Mastery check: haben', 'Проверка: haben'),
        mandatoryRetype: false,
        steps: [
          {
            prompt: bi('du — you (informal)', 'du — ти'),
            scaffold: 'du ___',
            answer: 'hast',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('ihr — you (plural)', 'ihr — вие'),
            scaffold: 'ihr ___',
            answer: 'habt',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'You have met your first case ending. It comes back in every unit from here on, so it was worth the effort.',
        'Срещна първото си падежно окончание. То се връща във всеки следващ раздел, така че усилието си заслужаваше.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u4-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u4',
  status: 'available',
  passAccuracy: 0.75,
  title: bi('Unit checkpoint: about you', 'Контролна проверка: за теб'),
  description: bi(
    'Countries, languages, nationality, work and family — including the article that disappears and the one that gains an -n.',
    'Държави, езици, националност, работа и семейство — включително члена, който изчезва, и онзи, който получава -n.',
  ),
  exercises: [
    typeIt('cp-u4-1', bi('Languages and countries', 'Езици и държави'), [
      {
        prompt: bi('I speak Bulgarian and German.', 'Говоря български и немски.'),
        answer: 'Ich spreche Bulgarisch und Deutsch.',
        hints: [],
      },
      {
        prompt: bi('I come from Switzerland.', 'Аз съм от Швейцария.'),
        answer: 'Ich komme aus der Schweiz.',
        hints: [],
      },
    ]),
    typeIt('cp-u4-2', bi('Work and nationality', 'Работа и националност'), [
      {
        prompt: bi('I am a teacher. (a woman speaking)', 'Аз съм учителка. (говори жена)'),
        answer: 'Ich bin Lehrerin.',
        hints: [],
      },
      {
        prompt: bi('He is an engineer.', 'Той е инженер.'),
        answer: 'Er ist Ingenieur.',
        hints: [],
      },
      {
        prompt: bi('What do you do for work? (informal)', 'С какво се занимаваш?'),
        answer: 'Was machst du beruflich?',
        hints: [],
      },
    ]),
    typeIt('cp-u4-3', bi('Family and haben', 'Семейство и haben'), [
      {
        prompt: bi('I have a brother.', 'Имам един брат.'),
        answer: 'Ich habe einen Bruder.',
        hints: [],
      },
      {
        prompt: bi('I have a sister.', 'Имам една сестра.'),
        answer: 'Ich habe eine Schwester.',
        hints: [],
      },
      {
        prompt: bi('My parents live in Bulgaria.', 'Родителите ми живеят в България.'),
        answer: 'Meine Eltern wohnen in Bulgarien.',
        hints: [],
      },
    ]),
    exercise({
      id: 'cp-u4-4',
      kind: 'fillBlank',
      objective: bi('The right article form', 'Правилната форма на члена'),
      steps: [
        {
          prompt: bi('I have a son.', 'Имам един син.'),
          scaffold: 'Ich habe ___ Sohn.',
          answer: 'einen',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I have a daughter.', 'Имам една дъщеря.'),
          scaffold: 'Ich habe ___ Tochter.',
          answer: 'eine',
          shape: 'word',
          hints: [],
        },
      ],
    }),
    dictation('cp-u4-5', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich bin Ärztin.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich habe einen Bruder.',
        shape: 'sentence',
        hints: [],
      },
    ]),
    freeWriting('cp-u4-6', bi('Writing', 'Писане'), [
      {
        prompt: bi(
          'Write three sentences about yourself: where you come from, what you do, and who is in your family.',
          'Напиши три изречения за себе си: откъде си, с какво се занимаваш и кой е в семейството ти.',
        ),
        answer: 'Ich komme aus Bulgarien. Ich bin Ingenieur. Ich habe eine Schwester.',
        shape: 'sentence',
        requiredTokens: ['komme', 'bin', 'habe'],
        hints: [],
      },
    ]),
  ],
};

export const PRE_A1_UNIT_4: Unit = {
  id: 'pre-a1-u4',
  level: 'pre-a1',
  order: 4,
  status: 'available',
  title: bi('Personal information', 'Лична информация'),
  summary: bi(
    'Countries, languages, nationality, what you do and who you have — plus the first case ending German asks of you.',
    'Държави, езици, националност, с какво се занимаваш и кого имаш — плюс първото падежно окончание, което немският иска от теб.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const PRE_A1_U4_PATTERNS = PATTERNS;
