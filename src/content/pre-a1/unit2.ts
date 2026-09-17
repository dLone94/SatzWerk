import {
  bi,
  conjugate,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  multipleChoice,
  partialRecall,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Lesson, SentencePattern, Unit } from '../types.ts';

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-heisse',
    template: 'Ich heiße ___.',
    example: 'Ich heiße Teo.',
    gloss: bi('My name is ___.', 'Казвам се ___.'),
    level: 'pre-a1',
    grammarIds: ['g-present-endings'],
  },
  {
    id: 'p-ich-komme-aus',
    template: 'Ich komme aus ___.',
    example: 'Ich komme aus Bulgarien.',
    gloss: bi('I come from ___.', 'Аз съм от ___.'),
    level: 'pre-a1',
  },
  {
    id: 'p-ich-wohne-in',
    template: 'Ich wohne in ___.',
    example: 'Ich wohne in Hamburg.',
    gloss: bi('I live in ___.', 'Живея в ___.'),
    level: 'pre-a1',
    grammarIds: ['g-verb-second'],
  },
  {
    id: 'p-wie-heisst-du',
    template: 'Wie heißt du?',
    example: 'Wie heißt du?',
    gloss: bi('What is your name?', 'Как се казваш?'),
    level: 'pre-a1',
    grammarIds: ['g-du-sie'],
  },
];

/* ================================================================== *
 * Lesson 1 - Greetings and goodbyes
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u2-l1',
  unitId: 'pre-a1-u2',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 15,
  title: bi('Hello and goodbye', 'Здравей и довиждане'),
  objective: bi(
    'After this lesson you will be able to greet anyone in German at the right time of day, and say goodbye formally or informally.',
    'След този урок ще можеш да поздравиш всеки на немски според часа от деня и да се сбогуваш официално или неофициално.',
  ),
  outcomes: [
    bi('I can greet someone appropriately at any time of day.', 'Мога да поздравя подходящо по всяко време на деня.'),
    bi('I can say goodbye formally and informally.', 'Мога да се сбогувам официално и неофициално.'),
    bi('I can choose between a formal and an informal greeting.', 'Мога да избирам между официален и неофициален поздрав.'),
  ],
  vocabIds: [
    'v-hallo',
    'v-guten-morgen',
    'v-guten-tag',
    'v-guten-abend',
    'v-gute-nacht',
    'v-tschuess',
    'v-auf-wiedersehen',
    'v-bis-bald',
  ],
  grammarIds: ['g-du-sie'],
  sections: [
    {
      id: 'u2l1-intro',
      kind: 'intro',
      title: bi('German greetings run on the clock', 'Немските поздрави вървят по часовника'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German has no single all-purpose greeting for formal situations. Which one you use depends on the time of day, and Germans do notice.',
            'Немският няма един универсален поздрав за официални ситуации. Кой ще използваш зависи от часа, а немците го забелязват.',
          ),
        },
        {
          t: 'table',
          headers: [bi('When', 'Кога'), bi('Greeting', 'Поздрав')],
          rows: [
            [bi('until about 10 or 11', 'до около 10–11 ч.'), 'Guten Morgen'],
            [bi('from late morning to about 18:00', 'от предобед до около 18:00'), 'Guten Tag'],
            [bi('from about 18:00', 'от около 18:00'), 'Guten Abend'],
            [bi('any time, informal', 'по всяко време, неофициално'), 'Hallo'],
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            '"Gute Nacht" is NOT an evening greeting. It is only said when someone is going to bed. Saying it when you arrive somewhere at 20:00 is a classic beginner mistake.',
            '„Gute Nacht“ НЕ е вечерен поздрав. Казва се само когато някой отива да спи. Да го кажеш, влизайки някъде в 20:00, е класическа грешка за начинаещи.',
          ),
        },
      ],
    },
    {
      id: 'u2l1-vocab',
      kind: 'vocabulary',
      title: bi('The words', 'Думите'),
      blocks: [
        {
          t: 'p',
          text: bi('Play each one and say it out loud before you move on.', 'Изслушай всяка и я кажи на глас, преди да продължиш.'),
        },
      ],
      vocabIds: [
        'v-hallo',
        'v-guten-morgen',
        'v-guten-tag',
        'v-guten-abend',
        'v-gute-nacht',
        'v-tschuess',
        'v-auf-wiedersehen',
        'v-bis-bald',
      ],
    },
    {
      id: 'u2l1-formality',
      kind: 'culture',
      title: bi('Formal or informal?', 'Официално или неофициално?'),
      blocks: [
        {
          t: 'table',
          headers: [bi('Situation', 'Ситуация'), bi('Say', 'Казваш')],
          rows: [
            [bi('Bakery, shop, Bürgeramt, doctor', 'Пекарна, магазин, Bürgeramt, лекар'), 'Guten Tag — Auf Wiedersehen'],
            [bi('Friends, neighbours you know well', 'Приятели, добре познати съседи'), 'Hallo — Tschüss'],
            [bi('Colleagues you just met', 'Колеги, които току-що си срещнал'), 'Guten Tag — Auf Wiedersehen'],
            [bi('Leaving at night', 'Тръгваш си през нощта'), 'Gute Nacht'],
          ],
        },
        {
          t: 'p',
          text: bi(
            'In shops and offices in Germany it is normal to greet when you walk in, even if nobody is looking at you. Walking up to a counter without a "Guten Tag" reads as slightly rude.',
            'В магазините и офисите в Германия е нормално да поздравиш, когато влизаш, дори никой да не те гледа. Да отидеш до гишето без „Guten Tag“ се възприема като леко неучтиво.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['bg'],
          text: bi(
            '',
            'Разликата от България е реална: в Германия поздравът при влизане в магазин е почти задължителен, а не по желание. Един „Guten Tag“ променя изцяло тона на разговора.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['en'],
          text: bi(
            'If you are used to a nod or a "hi", scale up slightly in Germany: a clear "Guten Tag" is the expected minimum with strangers.',
            '',
          ),
        },
      ],
    },
    {
      id: 'u2l1-examples',
      kind: 'examples',
      title: bi('In use', 'В употреба'),
      blocks: [
        { t: 'de', de: 'Guten Morgen, Frau Weber!', gloss: bi('Good morning, Mrs Weber!', 'Добро утро, госпожо Вебер!'), audio: true },
        { t: 'de', de: 'Guten Tag! Ein Wasser, bitte.', gloss: bi('Hello! A water, please.', 'Добър ден! Една вода, моля.'), audio: true },
        { t: 'de', de: 'Hallo Anna! Bis bald!', gloss: bi('Hi Anna! See you soon!', 'Здравей, Ана! До скоро!'), audio: true },
        { t: 'de', de: 'Auf Wiedersehen, Herr Doktor.', gloss: bi('Goodbye, doctor.', 'Довиждане, докторе.'), audio: true },
      ],
    },
    {
      id: 'u2l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Morgen / Tag / Abend depending on the clock.', 'Morgen / Tag / Abend според часа.'),
            bi('Hallo and Tschüss are informal; Guten Tag and Auf Wiedersehen are safe with anyone.', 'Hallo и Tschüss са неофициални; Guten Tag и Auf Wiedersehen са безопасни с всеки.'),
            bi('Gute Nacht is for going to bed only.', 'Gute Nacht е само когато си отиваш да спиш.'),
            bi('Note "Gute Nacht" but "Guten Morgen" — Nacht is feminine.', 'Забележи „Gute Nacht“, но „Guten Morgen“ — Nacht е от женски род.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice(
      'u2l1-ex1',
      bi('First listening', 'Първо слушане'),
      [
        {
          prompt: bi('Listen. What did you hear?', 'Слушай. Какво чу?'),
          audio: { text: 'Guten Abend', hideText: true },
          choices: [
            { id: 'a', de: 'Guten Morgen', gloss: bi('good morning', 'добро утро') },
            { id: 'b', de: 'Guten Abend', gloss: bi('good evening', 'добър вечер') },
            { id: 'c', de: 'Gute Nacht', gloss: bi('good night', 'лека нощ') },
          ],
          correct: 'b',
          answer: 'Guten Abend',
          shape: 'phrase',
          reviewTargets: ['v-guten-abend'],
          hints: [],
        },
      ],
      'listenChoose',
    ),

    typeIt(
      'u2l1-ex2',
      bi('Pick the right greeting and type it', 'Избери правилния поздрав и го напиши'),
      [
        {
          prompt: bi(
            'It is 8 in the morning. You meet your neighbour on the stairs.',
            'Осем сутринта е. Срещаш съседката си на стълбите.',
          ),
          answer: 'Guten Morgen',
          reviewTargets: ['v-guten-morgen'],
          shape: 'phrase',
          hints: [
            bi('Two words, both from this lesson.', 'Две думи, и двете от този урок.'),
            bi('Guten ...', 'Guten ...'),
          ],
        },
        {
          prompt: bi('It is 19:00. You walk into a restaurant.', '19:00 е. Влизаш в ресторант.'),
          answer: 'Guten Abend',
          reviewTargets: ['v-guten-abend'],
          shape: 'phrase',
          hints: [bi('After 18:00.', 'След 18:00.')],
        },
        {
          prompt: bi('It is 14:00. You walk into a bakery.', '14:00 е. Влизаш в пекарна.'),
          answer: 'Guten Tag',
          reviewTargets: ['v-guten-tag'],
          shape: 'phrase',
          hints: [bi('The neutral, polite default.', 'Неутралният, учтив избор по подразбиране.')],
        },
        {
          prompt: bi('You are going to bed. What do you say?', 'Отиваш да спиш. Какво казваш?'),
          answer: 'Gute Nacht',
          reviewTargets: ['v-gute-nacht'],
          shape: 'phrase',
          traps: [
            {
              answer: 'Guten Nacht',
              category: 'adjective-ending',
              feedback: bi(
                'Careful with the ending: "Nacht" is feminine (die Nacht), so the adjective loses its -n. It is "Gute Nacht", but "Guten Morgen" and "Guten Tag" because Morgen and Tag are masculine.',
                'Внимавай с окончанието: „Nacht“ е от женски род (die Nacht), затова прилагателното губи своето -n. Казва се „Gute Nacht“, но „Guten Morgen“ и „Guten Tag“, защото Morgen и Tag са от мъжки род.',
              ),
            },
          ],
          hints: [bi('Careful: the first word is not "Guten".', 'Внимавай: първата дума не е „Guten“.')],
        },
        {
          prompt: bi('You leave the doctor’s office.', 'Излизаш от лекарския кабинет.'),
          answer: 'Auf Wiedersehen',
          reviewTargets: ['v-auf-wiedersehen'],
          shape: 'phrase',
          hints: [bi('Formal goodbye, two words.', 'Официално сбогуване, две думи.')],
        },
        {
          prompt: bi('You say bye to a friend.', 'Сбогуваш се с приятел.'),
          answer: 'Tschüss',
          reviewTargets: ['v-tschuess'],
          shape: 'word',
          hints: [bi('One word, with ü.', 'Една дума, с ü.')],
        },
      ],
      ['g-du-sie'],
    ),

    fillBlank('u2l1-ex3', bi('Complete the greeting', 'Довърши поздрава'), [
      {
        prompt: bi('good night', 'лека нощ'),
        scaffold: '___ Nacht',
        answer: 'Gute',
        shape: 'word',
        reviewTargets: ['v-gute-nacht'],
        hints: [bi('Nacht is feminine.', 'Nacht е от женски род.')],
      },
      {
        prompt: bi('good day', 'добър ден'),
        scaffold: '___ Tag',
        answer: 'Guten',
        shape: 'word',
        reviewTargets: ['v-guten-tag'],
        hints: [bi('Tag is masculine.', 'Tag е от мъжки род.')],
      },
    ]),

    partialRecall('u2l1-ex4', bi('Recall from the first letters', 'Припомни си от първите букви'), [
      {
        prompt: bi('goodbye (formal)', 'довиждане (официално)'),
        scaffold: 'Auf W___',
        answer: 'Wiedersehen',
        shape: 'word',
        reviewTargets: ['v-auf-wiedersehen'],
        hints: [bi('It contains the word "sehen" (to see).', 'Съдържа думата „sehen“ (виждам).')],
      },
      {
        prompt: bi('see you soon', 'до скоро'),
        scaffold: 'Bis b___',
        answer: 'bald',
        shape: 'word',
        reviewTargets: ['v-bis-bald'],
        hints: [],
      },
    ]),

    dictation('u2l1-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the whole greeting you hear.', 'Напиши целия поздрав, който чуваш.'),
        answer: 'Guten Morgen, Frau Weber!',
        alternatives: ['Guten Morgen Frau Weber!'],
        shape: 'sentence',
        reviewTargets: ['v-guten-morgen', 'v-die-frau'],
        hints: [bi('It starts with a morning greeting.', 'Започва с утринен поздрав.')],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Auf Wiedersehen!',
        shape: 'phrase',
        reviewTargets: ['v-auf-wiedersehen'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u2l1-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('It is 09:00. Greet the baker.', '09:00 е. Поздрави хлебаря.'),
          answer: 'Guten Morgen',
          shape: 'phrase',
          hints: [],
        },
        {
          prompt: bi('You are leaving a shop, politely.', 'Излизаш от магазин, учтиво.'),
          answer: 'Auf Wiedersehen',
          shape: 'phrase',
          hints: [],
        },
        {
          prompt: bi('You are going to bed.', 'Отиваш да спиш.'),
          answer: 'Gute Nacht',
          shape: 'phrase',
          hints: [],
        },
      ]),
      dictation('u2l1-m2', bi('Mastery check: listening', 'Проверка: слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Guten Tag!',
          shape: 'phrase',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 - Politeness
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u2-l2',
  unitId: 'pre-a1-u2',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 15,
  title: bi('Please, thank you, excuse me', 'Моля, благодаря, извинете'),
  objective: bi(
    'After this lesson you will be able to be polite in German: thank someone, ask for something, apologise and get attention.',
    'След този урок ще можеш да бъдеш учтив на немски: да благодариш, да помолиш за нещо, да се извиниш и да привлечеш внимание.',
  ),
  outcomes: [
    bi('I can thank someone and reply to thanks.', 'Мога да благодаря и да отговоря на благодарност.'),
    bi('I can ask for something with bitte.', 'Мога да помоля за нещо с bitte.'),
    bi('I can get a stranger’s attention politely.', 'Мога да привлека учтиво вниманието на непознат.'),
    bi('I can ask how someone is and answer.', 'Мога да попитам как е някой и да отговоря.'),
  ],
  vocabIds: ['v-danke', 'v-bitte', 'v-entschuldigung', 'v-ja', 'v-nein', 'v-wie-gehts', 'v-gut-danke'],
  grammarIds: [],
  sections: [
    {
      id: 'u2l2-intro',
      kind: 'intro',
      title: bi('Four words that open every door', 'Четири думи, които отварят всяка врата'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'With Guten Tag, bitte, danke and Entschuldigung you can already handle a bakery, a bus and a doctor’s reception. They are worth more than fifty nouns.',
            'С Guten Tag, bitte, danke и Entschuldigung вече можеш да се справиш в пекарна, в автобус и на лекарска рецепция. Тези думи струват повече от петдесет съществителни.',
          ),
        },
      ],
    },
    {
      id: 'u2l2-vocab',
      kind: 'vocabulary',
      title: bi('The words', 'Думите'),
      blocks: [],
      vocabIds: ['v-danke', 'v-bitte', 'v-entschuldigung', 'v-ja', 'v-nein', 'v-wie-gehts', 'v-gut-danke'],
    },
    {
      id: 'u2l2-bitte',
      kind: 'grammar',
      title: bi('"bitte" does three jobs', '„bitte“ върши три работи'),
      blocks: [
        {
          t: 'table',
          headers: [bi('Meaning', 'Значение'), bi('Example', 'Пример')],
          rows: [
            [bi('please', 'моля'), 'Ein Wasser, bitte.'],
            [bi('you’re welcome', 'няма защо'), 'Danke! — Bitte!'],
            [bi('here you are', 'заповядай'), 'Bitte schön.'],
          ],
        },
        {
          t: 'p',
          text: bi(
            'So if someone hands you your change and says "Bitte", they are not asking you for anything. They mean "there you go".',
            'Ако някой ти подава рестото и казва „Bitte“, не иска нищо от теб. Означава „заповядай“.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Удобно е, че българското „моля“ прави почти същото — и то значи и „моля“, и „няма защо“, и „заповядай“. Така че тук няма нищо ново за учене, само нова дума за същата логика.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['en'],
          text: bi(
            'English splits these into three different phrases: please, you’re welcome, here you are. German reuses one word for all three, which is less to remember.',
            '',
          ),
        },
      ],
    },
    {
      id: 'u2l2-howareyou',
      kind: 'examples',
      title: bi('How are you?', 'Как си?'),
      blocks: [
        { t: 'de', de: 'Wie geht es dir?', gloss: bi('How are you? (informal)', 'Как си? (неофициално)'), audio: true },
        { t: 'de', de: 'Wie geht es Ihnen?', gloss: bi('How are you? (formal)', 'Как сте? (учтиво)'), audio: true },
        { t: 'de', de: 'Gut, danke. Und dir?', gloss: bi('Fine, thanks. And you?', 'Добре, благодаря. А ти?'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'In spoken German you will mostly hear the short form "Wie geht’s?". Unlike in English, this is a real question — a one-word answer is normal, but so is a real one.',
            'В говоримия немски най-често ще чуеш кратката форма „Wie geht’s?“. Както и българското „Как си?“, това е истински въпрос — кратък отговор е нормален, но и истинският е добре дошъл.',
          ),
        },
      ],
    },
    {
      id: 'u2l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('danke = thank you; bitte = please / you’re welcome / here you are.', 'danke = благодаря; bitte = моля / няма защо / заповядай.'),
            bi('Entschuldigung both apologises and gets attention.', 'Entschuldigung служи и за извинение, и за привличане на внимание.'),
            bi('Wie geht es dir? informal, Wie geht es Ihnen? formal.', 'Wie geht es dir? неофициално, Wie geht es Ihnen? учтиво.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    typeIt(
      'u2l2-ex1',
      bi('Say the polite thing', 'Кажи учтивото'),
      [
        {
          prompt: bi('Someone holds the door for you.', 'Някой ти задържа вратата.'),
          answer: 'Danke',
          alternatives: ['Danke schön', 'Vielen Dank'],
          shape: 'word',
          reviewTargets: ['v-danke'],
          hints: [bi('One word is enough.', 'Една дума е достатъчна.')],
        },
        {
          prompt: bi('Order a water politely.', 'Поръчай една вода учтиво.'),
          answer: 'Ein Wasser, bitte.',
          reviewTargets: ['v-bitte', 'v-das-wasser'],
          traps: [
            {
              answer: 'Eine Wasser, bitte.',
              category: 'gender',
              feedback: bi(
                '"Wasser" is neuter (das Wasser), so the indefinite article is "ein", not "eine".',
                '„Wasser“ е от среден род (das Wasser), затова неопределителният член е „ein“, а не „eine“.',
              ),
            },
          ],
          hints: [
            bi('Three words plus a comma. Start with the article for Wasser.', 'Три думи плюс запетая. Започни с члена за Wasser.'),
            bi('Ein Wasser, ...', 'Ein Wasser, ...'),
          ],
        },
        {
          prompt: bi('You need to ask a stranger something. What comes first?', 'Трябва да попиташ непознат нещо. Какво идва първо?'),
          answer: 'Entschuldigung',
          shape: 'word',
          reviewTargets: ['v-entschuldigung'],
          hints: [
            bi('A long word. It starts with "Ent".', 'Дълга дума. Започва с „Ent“.'),
            bi('Entschuld...', 'Entschuld...'),
          ],
        },
        {
          prompt: bi('Ask a friend how they are.', 'Попитай приятел как е.'),
          answer: 'Wie geht es dir?',
          alternatives: ["Wie geht's?", 'Wie geht es dir'],
          reviewTargets: ['v-wie-gehts'],
          hints: [
            bi('Four words. It starts with the question word for "how".', 'Четири думи. Започва с въпросителната дума за „как“.'),
            bi('Wie geht ...', 'Wie geht ...'),
          ],
        },
        {
          prompt: bi('Answer: fine, thanks.', 'Отговори: добре, благодаря.'),
          answer: 'Gut, danke.',
          reviewTargets: ['v-gut-danke'],
          hints: [],
        },
        {
          prompt: bi('Decline politely: no, thank you.', 'Откажи учтиво: не, благодаря.'),
          answer: 'Nein, danke.',
          reviewTargets: ['v-nein', 'v-danke'],
          hints: [],
        },
      ],
    ),

    partialRecall('u2l2-ex2', bi('Recall the long one', 'Припомни си дългата дума'), [
      {
        prompt: bi('excuse me / sorry', 'извинете / извинявам се'),
        scaffold: 'E___',
        answer: 'Entschuldigung',
        shape: 'word',
        reviewTargets: ['v-entschuldigung'],
        hints: [
          bi('Ent-schul-di-gung, four syllables.', 'Ent-schul-di-gung, четири срички.'),
        ],
      },
    ]),

    dictation('u2l2-ex3', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Entschuldigung!',
        shape: 'word',
        reviewTargets: ['v-entschuldigung'],
        hints: [],
      },
      {
        instruction: bi('Type the whole sentence you hear.', 'Напиши цялото изречение, което чуваш.'),
        answer: 'Ein Wasser, bitte.',
        shape: 'sentence',
        reviewTargets: ['v-bitte'],
        hints: [],
      },
      {
        instruction: bi('Type the whole question you hear.', 'Напиши целия въпрос, който чуваш.'),
        answer: 'Wie geht es dir?',
        shape: 'sentence',
        reviewTargets: ['v-wie-gehts'],
        hints: [],
      },
    ]),

    multipleChoice('u2l2-ex4', bi('What does "Bitte" mean here?', 'Какво значи „Bitte“ тук?'), [
      {
        prompt: bi(
          'The cashier hands you your change and says "Bitte schön." What does she mean?',
          'Касиерката ти подава рестото и казва „Bitte schön.“ Какво има предвид?',
        ),
        choices: [
          { id: 'a', de: 'Bitte = please', gloss: bi('She is asking you for something.', 'Тя иска нещо от теб.') },
          { id: 'b', de: 'Bitte = here you are', gloss: bi('She is handing it over.', 'Тя ти го подава.') },
          { id: 'c', de: 'Bitte = sorry', gloss: bi('She is apologising.', 'Тя се извинява.') },
        ],
        correct: 'b',
        answer: 'Bitte = here you are',
        shape: 'phrase',
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u2l2-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('Get a stranger’s attention.', 'Привлечи вниманието на непознат.'),
          answer: 'Entschuldigung',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('Order a water politely.', 'Поръчай една вода учтиво.'),
          answer: 'Ein Wasser, bitte.',
          hints: [],
        },
        {
          prompt: bi('Say: no, thank you.', 'Кажи: не, благодаря.'),
          answer: 'Nein, danke.',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 - Introducing yourself
 * ================================================================== */

const lesson3: Lesson = {
  id: 'pre-a1-u2-l3',
  unitId: 'pre-a1-u2',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Introducing yourself', 'Да се представиш'),
  objective: bi(
    'After this lesson you will be able to say your name in German, ask for someone else’s name, and choose correctly between du and Sie.',
    'След този урок ще можеш да кажеш името си на немски, да попиташ за чуждото име и да избираш правилно между du и Sie.',
  ),
  outcomes: [
    bi('I can say my name in three different ways.', 'Мога да кажа името си по три различни начина.'),
    bi('I can ask someone’s name informally and formally.', 'Мога да попитам за име неофициално и учтиво.'),
    bi('I can conjugate heißen and the forms of sein I need.', 'Мога да спрегна heißen и нужните форми на sein.'),
  ],
  vocabIds: ['v-heissen', 'v-der-name', 'v-sein-verb', 'v-wie-heisst-du', 'v-wie-heissen-sie'],
  grammarIds: ['g-present-endings', 'g-sein', 'g-du-sie'],
  patterns: [PATTERNS[0]!, PATTERNS[3]!],
  sections: [
    {
      id: 'u2l3-intro',
      kind: 'intro',
      title: bi('Three ways to say your name', 'Три начина да кажеш името си'),
      blocks: [
        { t: 'de', de: 'Ich heiße Teo.', gloss: bi('My name is Teo. (most common)', 'Казвам се Тео. (най-често)'), audio: true },
        { t: 'de', de: 'Mein Name ist Teo.', gloss: bi('My name is Teo. (slightly formal)', 'Името ми е Тео. (леко официално)'), audio: true },
        { t: 'de', de: 'Ich bin Teo.', gloss: bi('I am Teo. (casual)', 'Аз съм Тео. (непринудено)'), audio: true },
        {
          t: 'p',
          text: bi(
            'All three are correct. "Ich heiße" is the one you will hear most, and the one this lesson drills.',
            'И трите са правилни. „Ich heiße“ е тази, която ще чуваш най-често, и която този урок упражнява.',
          ),
        },
        {
          t: 'breakdown',
          de: 'Ich heiße Teo.',
          parts: [
            { de: 'Ich', gloss: bi('I', 'аз') },
            { de: 'heiße', gloss: bi('am called', 'казвам се') },
            { de: 'Teo', gloss: bi('Teo', 'Тео') },
          ],
        },
      ],
    },
    {
      id: 'u2l3-heissen',
      kind: 'grammar',
      title: bi('The verb heißen', 'Глаголът heißen'),
      blocks: [
        {
          t: 'table',
          headers: [bi('Person', 'Лице'), bi('Form', 'Форма'), bi('Meaning', 'Значение')],
          rows: [
            ['ich', 'heiße', bi('my name is', 'казвам се')],
            ['du', 'heißt', bi('your name is', 'ти се казваш')],
            ['er / sie / es', 'heißt', bi('his / her name is', 'той / тя се казва')],
            ['wir', 'heißen', bi('our names are', 'ние се казваме')],
            ['ihr', 'heißt', bi('your names are', 'вие се казвате')],
            ['sie / Sie', 'heißen', bi('their name is / your name is (formal)', 'те се казват / Вие се казвате')],
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Only three different forms to remember: heiße, heißt, heißen.',
            'Само три различни форми за запомняне: heiße, heißt, heißen.',
          ),
        },
      ],
    },
    {
      id: 'u2l3-endings',
      kind: 'grammar',
      title: bi('Why the ending changes', 'Защо окончанието се мени'),
      blocks: [],
      grammarId: 'g-present-endings',
    },
    {
      id: 'u2l3-sein',
      kind: 'grammar',
      title: bi('sein — to be', 'sein — съм'),
      blocks: [],
      grammarId: 'g-sein',
    },
    {
      id: 'u2l3-dusie',
      kind: 'grammar',
      title: bi('du or Sie?', 'du или Sie?'),
      blocks: [],
      grammarId: 'g-du-sie',
    },
    {
      id: 'u2l3-dialogue',
      kind: 'examples',
      title: bi('A real exchange', 'Истински разговор'),
      blocks: [
        { t: 'de', de: 'Guten Tag! Wie heißen Sie?', gloss: bi('Good day! What is your name?', 'Добър ден! Как се казвате?'), audio: true },
        { t: 'de', de: 'Ich heiße Teo Petrov. Und Sie?', gloss: bi('My name is Teo Petrov. And you?', 'Казвам се Тео Петров. А Вие?'), audio: true },
        { t: 'de', de: 'Weber. Anna Weber. Freut mich!', gloss: bi('Weber. Anna Weber. Pleased to meet you!', 'Вебер. Ана Вебер. Приятно ми е!'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            '"Freut mich" is the standard short reply to being introduced. Literally "it pleases me".',
            '„Freut mich“ е стандартният кратък отговор при запознанство. Буквално „радва ме“.',
          ),
        },
      ],
    },
    {
      id: 'u2l3-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich heiße ... / Mein Name ist ... / Ich bin ...', 'Ich heiße ... / Mein Name ist ... / Ich bin ...'),
            bi('Wie heißt du? informal — Wie heißen Sie? formal.', 'Wie heißt du? неофициално — Wie heißen Sie? учтиво.'),
            bi('Sie with a capital S is formal you; sie is she or they.', 'Sie с главно S е учтивото Вие; sie е тя или те.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    conjugate(
      'u2l3-ex1',
      'heißen',
      bi('Conjugate heißen', 'Спрегни heißen'),
      ['heiße', 'heißt', 'heißt', 'heißen', 'heißt', 'heißen'],
      ['v-heissen'],
    ),

    fillBlank('u2l3-ex2', bi('Guided typing', 'Насочено писане'), [
      {
        prompt: bi('My name is Teo.', 'Казвам се Тео.'),
        scaffold: 'Ich ___ Teo.',
        answer: 'heiße',
        shape: 'word',
        reviewTargets: ['v-heissen', 'p-ich-heisse'],
        hints: [bi('The ich form of heißen.', 'Формата за ich на heißen.')],
      },
      {
        prompt: bi('What is your name? (informal)', 'Как се казваш?'),
        scaffold: 'Wie ___ du?',
        answer: 'heißt',
        shape: 'word',
        reviewTargets: ['v-wie-heisst-du'],
        hints: [bi('The du form.', 'Формата за du.')],
      },
      {
        prompt: bi('What is your name? (formal)', 'Как се казвате? (учтиво)'),
        scaffold: 'Wie ___ Sie?',
        answer: 'heißen',
        shape: 'word',
        reviewTargets: ['v-wie-heissen-sie'],
        hints: [bi('Sie takes the same form as wir and sie.', 'Sie взима същата форма като wir и sie.')],
      },
    ]),

    partialRecall('u2l3-ex3', bi('Partial recall', 'Частично припомняне'), [
      {
        prompt: bi('What is your name? (formal)', 'Как се казвате? (учтиво)'),
        scaffold: 'Wie h___ Sie?',
        answer: 'heißen',
        shape: 'word',
        reviewTargets: ['v-wie-heissen-sie'],
        hints: [],
      },
      {
        prompt: bi('My name is Anna.', 'Казвам се Ана.'),
        scaffold: 'Ich h___ Anna.',
        answer: 'heiße',
        shape: 'word',
        reviewTargets: ['v-heissen'],
        hints: [],
      },
    ]),

    typeIt(
      'u2l3-ex4',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('What is your name? (to a child)', 'Как се казваш? (на дете)'),
          answer: 'Wie heißt du?',
          reviewTargets: ['v-wie-heisst-du', 'p-wie-heisst-du'],
          traps: [
            {
              answer: 'Wie heißen du?',
              category: 'verb-conjugation',
              feedback: bi(
                'With "du" the verb takes -st: du heißt. "heißen" is the form for wir, sie and formal Sie.',
                'С „du“ глаголът взима -st: du heißt. „heißen“ е формата за wir, sie и учтивото Sie.',
              ),
            },
          ],
          hints: [
            bi('Three words, starting with the question word for "how".', 'Три думи, започвайки с въпросителната дума за „как“.'),
            bi('Wie ... du?', 'Wie ... du?'),
          ],
        },
        {
          prompt: bi('What is your name? (to an official)', 'Как се казвате? (на служител)'),
          answer: 'Wie heißen Sie?',
          reviewTargets: ['v-wie-heissen-sie'],
          traps: [
            {
              answer: 'Wie heißen sie?',
              category: 'pronoun',
              feedback: bi(
                'The formal "you" is always written with a capital S: Sie. Written with a small s, "sie" means she or they — you would be asking what THEY are called.',
                'Учтивото „Вие“ винаги се пише с главно S: Sie. С малко s „sie“ означава тя или те — значи би попитал как се казват ТЕ.',
              ),
            },
          ],
          hints: [bi('Formal you is capitalised.', 'Учтивото Вие се пише с главна буква.')],
        },
        {
          prompt: bi('My name is Teo.', 'Казвам се Тео.'),
          answer: 'Ich heiße Teo.',
          alternatives: ['Mein Name ist Teo.', 'Ich bin Teo.'],
          reviewTargets: ['p-ich-heisse'],
          hints: [bi('Start with "Ich".', 'Започни с „Ich“.')],
        },
        {
          prompt: bi('My name is Teo. (use "Name")', 'Името ми е Тео. (използвай „Name“)'),
          answer: 'Mein Name ist Teo.',
          reviewTargets: ['v-der-name'],
          hints: [
            bi('Four words. Name is masculine, so the possessive is "Mein".', 'Четири думи. Name е от мъжки род, затова притежателното е „Mein“.'),
          ],
        },
        {
          prompt: bi('I am Anna.', 'Аз съм Ана.'),
          answer: 'Ich bin Anna.',
          reviewTargets: ['v-sein-verb'],
          hints: [bi('The ich form of sein.', 'Формата за ich на sein.')],
        },
        {
          prompt: bi('This is my daughter.', 'Това е дъщеря ми.'),
          answer: 'Das ist meine Tochter.',
          reviewTargets: ['v-die-tochter', 'v-sein-verb'],
          traps: [
            {
              answer: 'Das ist mein Tochter.',
              category: 'gender',
              feedback: bi(
                '"Tochter" is feminine (die Tochter), so the possessive takes an -e: meine Tochter.',
                '„Tochter“ е от женски род (die Tochter), затова притежателното взима -e: meine Tochter.',
              ),
            },
          ],
          hints: [
            bi('Tochter is feminine, so "mein" needs an ending.', 'Tochter е от женски род, затова „mein“ иска окончание.'),
          ],
        },
      ],
      ['g-present-endings', 'g-du-sie'],
    ),

    dictation('u2l3-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich heiße Anna.',
        shape: 'sentence',
        reviewTargets: ['v-heissen'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Wie heißen Sie?',
        shape: 'sentence',
        reviewTargets: ['v-wie-heissen-sie'],
        hints: [bi('It is the formal question.', 'Това е учтивият въпрос.')],
      },
    ]),

    freeWriting('u2l3-ex6', bi('Free production', 'Свободно производство'), [
      {
        prompt: bi(
          'Introduce yourself in two sentences: greet, then say your name.',
          'Представи се в две изречения: поздрави, после кажи името си.',
        ),
        instruction: bi(
          'There is no single right answer here. Use what you have learnt.',
          'Тук няма един правилен отговор. Използвай наученото.',
        ),
        answer: 'Guten Tag! Ich heiße Teo.',
        shape: 'sentence',
        requiredTokens: ['heiße'],
        hints: [
          bi('A greeting, then "Ich heiße ...".', 'Поздрав, после „Ich heiße ...“.'),
        ],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u2l3-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('Ask a new colleague their name, politely.', 'Попитай нов колега за името му, учтиво.'),
          answer: 'Wie heißen Sie?',
          hints: [],
        },
        {
          prompt: bi('Say your name using heißen. Use the name Teo.', 'Кажи името си с heißen. Използвай името Тео.'),
          answer: 'Ich heiße Teo.',
          hints: [],
        },
        {
          prompt: bi('Ask a child their name.', 'Попитай дете за името му.'),
          answer: 'Wie heißt du?',
          hints: [],
        },
      ]),
      exercise({
        id: 'u2l3-m2',
        kind: 'conjugation',
        objective: bi('Mastery check: verb forms', 'Проверка: глаголни форми'),
        mandatoryRetype: false,
        steps: [
          {
            prompt: bi('du — you (informal)', 'du — ти'),
            scaffold: 'du ___',
            answer: 'heißt',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('ich — I (verb: sein)', 'ich — аз (глагол: sein)'),
            scaffold: 'ich ___',
            answer: 'bin',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ],
  },
};

/* ================================================================== *
 * Lesson 4 - Where you come from, where you live
 * ================================================================== */

const lesson4: Lesson = {
  id: 'pre-a1-u2-l4',
  unitId: 'pre-a1-u2',
  level: 'pre-a1',
  order: 4,
  status: 'available',
  estimatedMinutes: 22,
  title: bi('Where you come from, where you live', 'Откъде си и къде живееш'),
  objective: bi(
    'After this lesson you will be able to say where you come from and where you live, ask the same questions, and place the German verb correctly.',
    'След този урок ще можеш да кажеш откъде си и къде живееш, да задаваш същите въпроси и да поставяш немския глагол правилно.',
  ),
  outcomes: [
    bi('I can say where I come from and where I live.', 'Мога да кажа откъде идвам и къде живея.'),
    bi('I can ask "Woher kommst du?" and "Wo wohnst du?".', 'Мога да попитам „Woher kommst du?“ и „Wo wohnst du?“.'),
    bi('I can put the conjugated verb in second position.', 'Мога да поставя спрегнатия глагол на второ място.'),
    bi('I can conjugate a regular verb in the present tense.', 'Мога да спрегна правилен глагол в сегашно време.'),
  ],
  vocabIds: [
    'v-kommen',
    'v-wohnen',
    'v-leben',
    'v-woher-kommst-du',
    'v-wo-wohnst-du',
    'v-deutschland',
    'v-bulgarien',
    'v-die-stadt',
    'v-die-sprache',
  ],
  grammarIds: ['g-verb-second', 'g-present-endings'],
  patterns: [PATTERNS[1]!, PATTERNS[2]!],
  sections: [
    {
      id: 'u2l4-intro',
      kind: 'intro',
      title: bi('Two questions you will be asked constantly', 'Два въпроса, които ще ти задават постоянно'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'If you live in Germany, these two questions come up in almost every first conversation. Being able to answer them fluently changes how those conversations go.',
            'Ако живееш в Германия, тези два въпроса идват в почти всеки първи разговор. Да можеш да отговориш свободно променя хода на разговора.',
          ),
        },
        { t: 'de', de: 'Woher kommst du?', gloss: bi('Where are you from?', 'Откъде си?'), audio: true },
        { t: 'de', de: 'Ich komme aus Bulgarien.', gloss: bi('I come from Bulgaria.', 'Аз съм от България.'), audio: true },
        { t: 'de', de: 'Wo wohnst du?', gloss: bi('Where do you live?', 'Къде живееш?'), audio: true },
        { t: 'de', de: 'Ich wohne in Hamburg.', gloss: bi('I live in Hamburg.', 'Живея в Хамбург.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Two question words that look alike: wo = where (a place), woher = where from (an origin). The -her part means "from".',
            'Две близки въпросителни думи: wo = къде (място), woher = откъде (произход). Частта -her значи „от“.',
          ),
        },
      ],
    },
    {
      id: 'u2l4-breakdown',
      kind: 'examples',
      title: bi('Word by word', 'Дума по дума'),
      blocks: [
        {
          t: 'breakdown',
          de: 'Ich wohne in Hamburg.',
          parts: [
            { de: 'Ich', gloss: bi('I', 'аз') },
            { de: 'wohne', gloss: bi('live', 'живея') },
            { de: 'in', gloss: bi('in', 'в') },
            { de: 'Hamburg', gloss: bi('Hamburg', 'Хамбург') },
          ],
        },
        {
          t: 'breakdown',
          de: 'Ich komme aus Bulgarien.',
          parts: [
            { de: 'Ich', gloss: bi('I', 'аз') },
            { de: 'komme', gloss: bi('come', 'идвам') },
            { de: 'aus', gloss: bi('from (out of)', 'от') },
            { de: 'Bulgarien', gloss: bi('Bulgaria', 'България') },
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'With countries and towns of origin, German uses "aus", not "von". "Ich komme von Bulgarien" is a mistake almost every learner makes once.',
            'За държави и градове на произход немският използва „aus“, не „von“. „Ich komme von Bulgarien“ е грешка, която почти всеки учащ прави поне веднъж.',
          ),
        },
      ],
    },
    {
      id: 'u2l4-verbsecond',
      kind: 'grammar',
      title: bi('The verb comes second', 'Глаголът е на второ място'),
      blocks: [],
      grammarId: 'g-verb-second',
    },
    {
      id: 'u2l4-endings',
      kind: 'grammar',
      title: bi('wohnen in all six persons', 'wohnen във всичките шест лица'),
      blocks: [],
      grammarId: 'g-present-endings',
    },
    {
      id: 'u2l4-vocab',
      kind: 'vocabulary',
      title: bi('The words', 'Думите'),
      blocks: [],
      vocabIds: [
        'v-kommen',
        'v-wohnen',
        'v-leben',
        'v-woher-kommst-du',
        'v-wo-wohnst-du',
        'v-deutschland',
        'v-bulgarien',
        'v-die-stadt',
        'v-die-sprache',
      ],
    },
    {
      id: 'u2l4-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich komme aus ... for origin, Ich wohne in ... for where you live.', 'Ich komme aus ... за произход, Ich wohne in ... за къде живееш.'),
            bi('wo = where, woher = where from.', 'wo = къде, woher = откъде.'),
            bi('Regular endings: -e, -st, -t, -en, -t, -en.', 'Правилни окончания: -e, -st, -t, -en, -t, -en.'),
            bi('The conjugated verb stands in position two.', 'Спрегнатият глагол стои на позиция две.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    conjugate(
      'u2l4-ex1',
      'wohnen',
      bi('Conjugate wohnen', 'Спрегни wohnen'),
      ['wohne', 'wohnst', 'wohnt', 'wohnen', 'wohnt', 'wohnen'],
      ['v-wohnen'],
    ),

    // The scaffolding ladder from the product brief, stage by stage.
    fillBlank('u2l4-ex2', bi('Stage 2: guided typing', 'Етап 2: насочено писане'), [
      {
        prompt: bi('I live in Hamburg.', 'Аз живея в Хамбург.'),
        scaffold: 'Ich ___ in Hamburg.',
        answer: 'wohne',
        shape: 'word',
        reviewTargets: ['v-wohnen', 'p-ich-wohne-in'],
        hints: [bi('The ich form of wohnen.', 'Формата за ich на wohnen.')],
      },
      {
        prompt: bi('I come from Bulgaria.', 'Аз идвам от България.'),
        scaffold: 'Ich komme ___ Bulgarien.',
        answer: 'aus',
        shape: 'word',
        reviewTargets: ['p-ich-komme-aus'],
        hints: [bi('Three letters. Not "von".', 'Три букви. Не е „von“.')],
      },
    ]),

    partialRecall('u2l4-ex3', bi('Stage 3: partial recall', 'Етап 3: частично припомняне'), [
      {
        prompt: bi('I live in Hamburg.', 'Аз живея в Хамбург.'),
        scaffold: 'Ich w___ in Hamburg.',
        answer: 'wohne',
        shape: 'word',
        reviewTargets: ['v-wohnen'],
        hints: [],
      },
      {
        prompt: bi('Where do you live?', 'Къде живееш?'),
        scaffold: 'Wo w___ du?',
        answer: 'wohnst',
        shape: 'word',
        reviewTargets: ['v-wo-wohnst-du'],
        hints: [],
      },
    ]),

    typeIt(
      'u2l4-ex4',
      bi('Stage 4: full production', 'Етап 4: пълно производство'),
      [
        {
          prompt: bi('I live in Hamburg.', 'Аз живея в Хамбург.'),
          answer: 'Ich wohne in Hamburg.',
          alternatives: ['Ich lebe in Hamburg.'],
          reviewTargets: ['p-ich-wohne-in', 'v-wohnen'],
          hints: [
            bi('Four words. Start with "Ich".', 'Четири думи. Започни с „Ich“.'),
            bi('The verb is wohnen.', 'Глаголът е wohnen.'),
            bi('Ich wohne ...', 'Ich wohne ...'),
          ],
        },
        {
          prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
          answer: 'Ich komme aus Bulgarien.',
          reviewTargets: ['p-ich-komme-aus', 'v-kommen'],
          traps: [
            {
              answer: 'Ich komme von Bulgarien.',
              category: 'preposition',
              feedback: bi(
                'When you say which country or place you originate from, German uses "aus": Ich komme aus Bulgarien. "von" is for a starting point you have just left, such as "von der Arbeit".',
                'Когато казваш от коя държава или място произхождаш, немският използва „aus“: Ich komme aus Bulgarien. „von“ е за отправна точка, която току-що си напуснал, например „von der Arbeit“.',
              ),
            },
          ],
          hints: [
            bi('Four words. Careful with the preposition.', 'Четири думи. Внимавай с предлога.'),
            bi('Ich komme ...', 'Ich komme ...'),
          ],
        },
        {
          prompt: bi('Where do you live? (informal)', 'Къде живееш?'),
          answer: 'Wo wohnst du?',
          reviewTargets: ['v-wo-wohnst-du'],
          traps: [
            {
              answer: 'Woher wohnst du?',
              category: 'vocabulary',
              feedback: bi(
                '"woher" asks about origin, not location. For a place you live in, use "wo": Wo wohnst du?',
                '„woher“ пита за произход, не за местоположение. За място, на което живееш, използвай „wo“: Wo wohnst du?',
              ),
            },
          ],
          hints: [bi('Three words. The question word is short.', 'Три думи. Въпросителната дума е кратка.')],
        },
        {
          prompt: bi('Where are you from? (informal)', 'Откъде си?'),
          answer: 'Woher kommst du?',
          reviewTargets: ['v-woher-kommst-du'],
          hints: [bi('The question word has five letters.', 'Въпросителната дума е от пет букви.')],
        },
        {
          prompt: bi('You live in Germany.', 'Ти живееш в Германия.'),
          answer: 'Du wohnst in Deutschland.',
          reviewTargets: ['v-wohnen', 'v-deutschland'],
          traps: [
            {
              answer: 'Du wohne in Deutschland.',
              category: 'verb-conjugation',
              feedback: bi(
                'With "du" a regular verb takes -st: du wohnst. "wohne" is the ich form.',
                'С „du“ правилният глагол взима -st: du wohnst. „wohne“ е формата за ich.',
              ),
            },
          ],
          hints: [bi('Watch the verb ending after du.', 'Внимавай с окончанието на глагола след du.')],
        },
        {
          prompt: bi('Where do you live? (formal)', 'Къде живеете? (учтиво)'),
          answer: 'Wo wohnen Sie?',
          reviewTargets: ['v-wo-wohnst-du'],
          hints: [bi('Formal Sie takes the -en form and a capital S.', 'Учтивото Sie взима формата на -en и главно S.')],
        },
      ],
      ['g-verb-second', 'g-present-endings'],
    ),

    wordOrder('u2l4-ex5', bi('Build the sentence, then type it', 'Подреди изречението, после го напиши'), [
      {
        prompt: bi('I live in Germany.', 'Живея в Германия.'),
        bank: ['in', 'Ich', 'Deutschland.', 'wohne'],
        answer: 'Ich wohne in Deutschland.',
        hints: [bi('Subject, verb, then the place.', 'Подлог, глагол, после мястото.')],
      },
      {
        prompt: bi('Where are you from?', 'Откъде си?'),
        bank: ['kommst', 'Woher', 'du?'],
        answer: 'Woher kommst du?',
        hints: [bi('Question word first, verb second.', 'Първо въпросителната дума, глаголът втори.')],
      },
    ]),

    dictation('u2l4-ex6', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich komme aus Bulgarien.',
        shape: 'sentence',
        reviewTargets: ['p-ich-komme-aus'],
        hints: [bi('It is about where someone is from.', 'Става дума откъде е някой.')],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich wohne in Hamburg.',
        shape: 'sentence',
        reviewTargets: ['p-ich-wohne-in'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Wo wohnen Sie?',
        shape: 'sentence',
        hints: [],
      },
    ]),

    freeWriting('u2l4-ex7', bi('Free production', 'Свободно производство'), [
      {
        prompt: bi(
          'Write two sentences about yourself: where you come from and where you live.',
          'Напиши две изречения за себе си: откъде си и къде живееш.',
        ),
        instruction: bi(
          'Use your own country and city. There is no single right answer.',
          'Използвай собствената си държава и град. Няма един правилен отговор.',
        ),
        answer: 'Ich komme aus Bulgarien. Ich wohne in Hamburg.',
        shape: 'sentence',
        requiredTokens: ['komme', 'wohne'],
        hints: [
          bi('Ich komme aus ... Ich wohne in ...', 'Ich komme aus ... Ich wohne in ...'),
        ],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u2l4-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
          answer: 'Ich komme aus Bulgarien.',
          hints: [],
        },
        {
          prompt: bi('I live in Hamburg.', 'Живея в Хамбург.'),
          answer: 'Ich wohne in Hamburg.',
          alternatives: ['Ich lebe in Hamburg.'],
          hints: [],
        },
        {
          prompt: bi('Where are you from? (informal)', 'Откъде си?'),
          answer: 'Woher kommst du?',
          hints: [],
        },
        {
          prompt: bi('You live in Germany.', 'Ти живееш в Германия.'),
          answer: 'Du wohnst in Deutschland.',
          hints: [],
        },
      ]),
      dictation('u2l4-m2', bi('Mastery check: listening', 'Проверка: слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich wohne in Deutschland.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u2-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u2',
  status: 'available',
  passAccuracy: 0.75,
  title: bi('Unit checkpoint: first conversations', 'Контролна проверка: първи разговори'),
  description: bi(
    'A mixed check across the whole unit: greetings, politeness, introducing yourself, and saying where you come from and live. Vocabulary, grammar, listening and writing together.',
    'Смесена проверка върху целия раздел: поздрави, учтивост, представяне и това откъде си и къде живееш. Речник, граматика, слушане и писане заедно.',
  ),
  exercises: [
    typeIt('cp-u2-1', bi('Greetings and politeness', 'Поздрави и учтивост'), [
      {
        prompt: bi('It is 09:00. Greet the person behind the counter.', '09:00 е. Поздрави човека на гишето.'),
        answer: 'Guten Morgen',
        shape: 'phrase',
        hints: [],
      },
      {
        prompt: bi('Get a stranger’s attention.', 'Привлечи вниманието на непознат.'),
        answer: 'Entschuldigung',
        shape: 'word',
        hints: [],
      },
      {
        prompt: bi('Order a water politely.', 'Поръчай една вода учтиво.'),
        answer: 'Ein Wasser, bitte.',
        hints: [],
      },
    ]),
    typeIt('cp-u2-2', bi('Introducing yourself', 'Представяне'), [
      {
        prompt: bi('Ask an official for their name.', 'Попитай служител за името му.'),
        answer: 'Wie heißen Sie?',
        hints: [],
      },
      {
        prompt: bi('Say your name is Teo, using heißen.', 'Кажи, че се казваш Тео, с heißen.'),
        answer: 'Ich heiße Teo.',
        hints: [],
      },
    ]),
    typeIt('cp-u2-3', bi('Origin and home', 'Произход и дом'), [
      {
        prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
        answer: 'Ich komme aus Bulgarien.',
        hints: [],
      },
      {
        prompt: bi('Where do you live? (informal)', 'Къде живееш?'),
        answer: 'Wo wohnst du?',
        hints: [],
      },
      {
        prompt: bi('You live in Germany.', 'Ти живееш в Германия.'),
        answer: 'Du wohnst in Deutschland.',
        hints: [],
      },
    ]),
    exercise({
      id: 'cp-u2-4',
      kind: 'articleRecall',
      objective: bi('Articles', 'Членове'),
      mandatoryRetype: false,
      steps: [
        {
          prompt: bi('the water', 'водата'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: '___ Wasser',
          answer: 'das',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the city', 'градът'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: '___ Stadt',
          answer: 'die',
          shape: 'word',
          hints: [],
        },
      ],
    }),
    dictation('cp-u2-5', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich heiße Anna.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich komme aus Deutschland.',
        shape: 'sentence',
        hints: [],
      },
    ]),
    freeWriting('cp-u2-6', bi('Writing', 'Писане'), [
      {
        prompt: bi(
          'Write a three-sentence introduction: greet, give your name, say where you live.',
          'Напиши представяне от три изречения: поздрав, име, къде живееш.',
        ),
        answer: 'Guten Tag! Ich heiße Teo. Ich wohne in Hamburg.',
        shape: 'sentence',
        requiredTokens: ['heiße', 'wohne'],
        hints: [],
      },
    ]),
  ],
};

export const PRE_A1_UNIT_2: Unit = {
  id: 'pre-a1-u2',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  title: bi('First words, first sentences', 'Първи думи, първи изречения'),
  summary: bi(
    'Greet people, be polite, introduce yourself and say where you come from and where you live — all typed, not clicked.',
    'Поздравявай, бъди учтив, представяй се и казвай откъде си и къде живееш — всичко с писане, не с щракане.',
  ),
  lessons: [lesson1, lesson2, lesson3, lesson4],
  checkpoint,
};

export const PRE_A1_PATTERNS = PATTERNS;
