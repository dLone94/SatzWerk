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
 * A1 Unit 6 — Appointments, health and weather.
 *
 * The last unit of the level, and it closes gaps rather than opening ground.
 * `bei` gives Unit 5's dative a third preposition and one more repetition in a
 * different setting. The impersonal `es` is the one genuinely new structure, and
 * it is here at the end because it is the clearest possible statement of the
 * rule the whole level has been building towards: a German sentence has a
 * subject and a verb in second position, and when there is nothing to be the
 * subject, German invents one rather than going without.
 *
 * Health is also where the compound rule from Unit 2 pays off. Once Kopf, Hals
 * and Bauch are known, Kopfschmerzen builds itself, and the lesson says so
 * instead of presenting three separate words to memorise.
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-termin-beim',
    template: 'Ich habe einen Termin bei___ ___.',
    example: 'Ich habe einen Termin beim Arzt.',
    gloss: bi('I have an appointment at the ___.', 'Имам час при ___.'),
    level: 'a1',
    grammarIds: ['g-bei'],
  },
  {
    id: 'p-ich-habe-schmerzen',
    template: 'Ich habe ___schmerzen.',
    example: 'Ich habe Kopfschmerzen.',
    gloss: bi('I have a ___ache.', 'Боли ме ___.'),
    level: 'a1',
  },
  {
    id: 'p-es-regnet',
    template: 'Es ___.',
    example: 'Es regnet.',
    gloss: bi('It is ___ing.', 'Вали.'),
    level: 'a1',
    grammarIds: ['g-impersonal-es'],
  },
  {
    id: 'p-wie-ist-das-wetter',
    template: 'Wie ist das Wetter ___?',
    example: 'Wie ist das Wetter heute?',
    gloss: bi('What is the weather like ___?', 'Какво е времето ___?'),
    level: 'a1',
  },
];

/* ================================================================== *
 * Lesson 1 — appointments
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u6-l1',
  unitId: 'a1-u6',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Making an appointment', 'Записване на час'),
  objective: bi(
    'After this lesson you will be able to ask for an appointment, accept a time, and say where you have to be.',
    'След този урок ще можеш да поискаш час, да приемеш предложено време и да кажеш къде трябва да бъдеш.',
  ),
  outcomes: [
    bi('I can ask for an appointment.', 'Мога да поискам час.'),
    bi('I can say I am at the doctor’s with beim.', 'Мога да кажа, че съм при лекаря, с beim.'),
    bi('I can accept or cancel a time.', 'Мога да приема или да отменя час.'),
    bi('I know bei takes the same form as mit and zu.', 'Знам, че bei взима същата форма като mit и zu.'),
  ],
  vocabIds: ['v-termin', 'v-praxis', 'v-bei', 'v-absagen', 'v-passt'],
  grammarIds: ['g-bei'],
  sections: [
    {
      id: 'a1u6l1-intro',
      kind: 'intro',
      title: bi('German life runs on appointments', 'Немският живот върви по записани часове'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A Termin is a fixed appointment, and you will need one for the doctor, the office and almost everything official. The language for it is small and worth owning exactly.',
            'Termin е записан час и ще ти трябва за лекар, за служба и за почти всичко официално. Езикът за него е малко и си струва да се знае точно.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l1-vocab',
      kind: 'vocabulary',
      title: bi('Words for an appointment', 'Думи за записване на час'),
      vocabIds: ['v-termin', 'v-praxis', 'v-absagen', 'v-passt'],
      blocks: [],
    },
    {
      id: 'a1u6l1-grammar',
      kind: 'grammar',
      title: bi('bei and beim', 'bei и beim'),
      blocks: [],
      grammarId: 'g-bei',
    },
    {
      id: 'a1u6l1-examples',
      kind: 'examples',
      title: bi('The whole conversation', 'Целият разговор'),
      blocks: [
        { t: 'de', de: 'Ich möchte einen Termin.', gloss: bi('I would like an appointment.', 'Бих искал час.') },
        { t: 'de', de: 'Ich habe einen Termin beim Arzt.', gloss: bi('I have an appointment at the doctor’s.', 'Имам час при лекаря.') },
        { t: 'de', de: 'Montag um zehn? Das passt.', gloss: bi('Monday at ten? That works.', 'Понеделник в десет? Става.') },
        { t: 'de', de: 'Ich sage den Termin ab.', gloss: bi('I am cancelling the appointment.', 'Отменям часа.') },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'absagen is separable, so the ab goes to the end — the same bracket you built in Unit 2.',
            'absagen е делим, затова ab отива в края — същата рамка, която построи в раздел 2.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('bei dem becomes beim; bei der stays as it is.', 'bei dem става beim; bei der си остава.'),
            bi('mit, zu and bei all take the same form.', 'mit, zu и bei взимат една и съща форма.'),
            bi('Das passt accepts a proposed time.', 'Das passt приема предложен час.'),
            bi('absagen splits: Ich sage den Termin ab.', 'absagen се разделя: Ich sage den Termin ab.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u6l1-ex1',
        bi('Make the appointment', 'Запиши часа'),
        [
          {
            prompt: bi('I would like an appointment.', 'Бих искал час.'),
            answer: 'Ich möchte einen Termin.',
            reviewTargets: ['v-termin'],
            hints: [bi('Termin is masculine and it is the object.', 'Termin е мъжки род и е допълнение.')],
          },
          {
            prompt: bi('I have an appointment at the doctor’s.', 'Имам час при лекаря.'),
            answer: 'Ich habe einen Termin beim Arzt.',
            reviewTargets: ['v-bei', 'p-termin-beim'],
            hints: [bi('bei dem contracts.', 'bei dem се слива.')],
            traps: [
              {
                answer: 'Ich habe einen Termin bei dem Arzt.',
                category: 'preposition',
                feedback: bi(
                  'Correct in grammar, but nobody says it: bei dem always contracts to beim.',
                  'Граматически вярно, но никой не го казва: bei dem винаги се слива в beim.',
                ),
              },
            ],
          },
          {
            prompt: bi('I am cancelling the appointment.', 'Отменям часа.'),
            answer: 'Ich sage den Termin ab.',
            reviewTargets: ['v-absagen'],
            hints: [bi('A separable verb: ab goes last.', 'Делим глагол: ab отива най-накрая.')],
          },
        ],
        ['g-bei'],
      ),
    ),
    a1(
      fillBlank('a1u6l1-ex2', bi('beim or bei der?', 'beim или bei der?'), [
        {
          prompt: bi('at the doctor’s (male)', 'при лекаря'),
          scaffold: '___ Arzt',
          answer: 'beim',
          shape: 'word',
          reviewTargets: ['g-bei'],
          hints: [bi('der Arzt — masculine, so it contracts.', 'der Arzt — мъжки род, затова се слива.')],
        },
        {
          prompt: bi('at the doctor’s (female)', 'при лекарката'),
          scaffold: '___ Ärztin',
          answer: 'bei der',
          shape: 'phrase',
          reviewTargets: ['g-bei'],
          hints: [bi('Feminine does not contract.', 'Женският род не се слива.')],
        },
        {
          prompt: bi('at the boss’s', 'при шефа'),
          scaffold: '___ Chef',
          answer: 'beim',
          shape: 'word',
          reviewTargets: ['v-chef'],
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u6l1-ex3', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe einen Termin beim Arzt.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Praxis ist heute zu.',
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
        typeIt('a1u6l1-m1', bi('Mastery: appointments', 'Проверка: записване на час'), [
          {
            prompt: bi('I would like an appointment.', 'Бих искал час.'),
            answer: 'Ich möchte einen Termin.',
            hints: [],
          },
          {
            prompt: bi('I am at the doctor’s.', 'При лекаря съм.'),
            answer: 'Ich bin beim Arzt.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — health
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u6-l2',
  unitId: 'a1-u6',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Saying what is wrong', 'Да кажеш какво ти е'),
  objective: bi(
    'After this lesson you will be able to say that you are ill and what hurts, and wish someone well.',
    'След този урок ще можеш да кажеш, че си болен и какво те боли, и да пожелаеш на някого оздравяване.',
  ),
  outcomes: [
    bi('I can say I am ill.', 'Мога да кажа, че съм болен.'),
    bi('I can name what hurts with -schmerzen.', 'Мога да назова какво ме боли с -schmerzen.'),
    bi('I can say a body part hurts with tut weh.', 'Мога да кажа, че нещо ме боли, с tut weh.'),
    bi('I can wish someone a good recovery.', 'Мога да пожелая на някого оздравяване.'),
  ],
  vocabIds: [
    'v-krank',
    'v-gesund',
    'v-kopf',
    'v-hals',
    'v-bauch',
    'v-schmerzen',
    'v-fieber',
    'v-erkaeltung',
    'v-weh-tun',
    'v-gute-besserung',
  ],
  grammarIds: [],
  sections: [
    {
      id: 'a1u6l2-intro',
      kind: 'intro',
      title: bi('Three words, nine sentences', 'Три думи, девет изречения'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German builds the words for pain by sticking the body part onto Schmerzen. Learn Kopf, Hals and Bauch, and the rest builds itself.',
            'Немският строи думите за болка, като залепя частта от тялото към Schmerzen. Научи Kopf, Hals и Bauch, а останалото се построява само.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l2-vocab',
      kind: 'vocabulary',
      title: bi('What hurts', 'Какво боли'),
      vocabIds: ['v-krank', 'v-gesund', 'v-kopf', 'v-hals', 'v-bauch', 'v-fieber', 'v-erkaeltung'],
      blocks: [
        {
          t: 'table',
          headers: [bi('Body part', 'Част от тялото'), bi('The pain', 'Болката'), bi('Meaning', 'Значение')],
          rows: [
            ['der Kopf', 'Kopfschmerzen', bi('headache', 'главоболие')],
            ['der Hals', 'Halsschmerzen', bi('sore throat', 'болки в гърлото')],
            ['der Bauch', 'Bauchschmerzen', bi('stomach ache', 'болки в корема')],
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Always plural, and with no article: "Ich habe Kopfschmerzen", never "einen Kopfschmerz".',
            'Винаги в множествено число и без член: „Ich habe Kopfschmerzen“, никога „einen Kopfschmerz“.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l2-wehtun',
      kind: 'contrast',
      title: bi('tut weh — and who is the subject', 'tut weh — и кой е подлогът'),
      blocks: [
        {
          t: 'contrast',
          de: 'Mein Kopf tut weh.',
          other: bi('My head hurts.', 'Боли ме главата.'),
          note: bi(
            'The body part is the subject, and weh goes to the end like a separable verb.',
            'Частта от тялото е подлогът, а weh отива в края като при делим глагол.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          only: ['bg'],
          text: bi(
            '',
            'Строежът е обърнат спрямо българския. „Боли ме главата“ има „ме“ — човекът е допълнение. Немското „Mein Kopf tut weh“ няма „ме“ изобщо: главата е подлогът и тя върши действието. Не търси къде да сложиш „ме“ — просто го няма.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['en'],
          text: bi(
            'This one matches English closely: "my head hurts", with the head as the subject. The only German addition is that weh travels to the end.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a1u6l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich bin krank. — the sentence to have ready.', 'Ich bin krank. — изречението, което да имаш готово.'),
            bi('Kopf + schmerzen, Hals + schmerzen, Bauch + schmerzen.', 'Kopf + schmerzen, Hals + schmerzen, Bauch + schmerzen.'),
            bi('Ich habe Fieber — no article.', 'Ich habe Fieber — без член.'),
            bi('Gute Besserung! is expected, not optional.', 'Gute Besserung! се очаква, не е по избор.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u6l2-ex1',
        bi('Say what is wrong', 'Кажи какво ти е'),
        [
          {
            prompt: bi('I am ill.', 'Болен съм.'),
            answer: 'Ich bin krank.',
            reviewTargets: ['v-krank'],
            hints: [],
          },
          {
            prompt: bi('I have a headache.', 'Боли ме главата.'),
            answer: 'Ich habe Kopfschmerzen.',
            reviewTargets: ['v-schmerzen', 'p-ich-habe-schmerzen'],
            hints: [bi('One word, and no article.', 'Една дума и без член.')],
            traps: [
              {
                answer: 'Ich habe einen Kopfschmerz.',
                category: 'plural',
                feedback: bi(
                  'German uses the plural and no article here: Ich habe Kopfschmerzen.',
                  'Немският използва множествено число и без член: Ich habe Kopfschmerzen.',
                ),
              },
            ],
          },
          {
            prompt: bi('I have a temperature.', 'Имам температура.'),
            answer: 'Ich habe Fieber.',
            reviewTargets: ['v-fieber'],
            hints: [],
          },
          {
            prompt: bi('My throat hurts.', 'Боли ме гърлото.'),
            answer: 'Mein Hals tut weh.',
            reviewTargets: ['v-weh-tun', 'v-hals'],
            hints: [bi('The throat is the subject here.', 'Гърлото тук е подлогът.')],
          },
        ],
      ),
    ),
    a1(
      partialRecall('a1u6l2-ex2', bi('Build the pain', 'Построй болката'), [
        {
          prompt: bi('I have a sore throat.', 'Боли ме гърлото.'),
          scaffold: 'Ich habe Hals___.',
          answer: 'Halsschmerzen',
          shape: 'word',
          reviewTargets: ['v-schmerzen', 'v-hals'],
          hints: [bi('One word, not two.', 'Една дума, не две.')],
        },
        {
          prompt: bi('I have a stomach ache.', 'Боли ме коремът.'),
          scaffold: 'Ich habe Bauch___.',
          answer: 'Bauchschmerzen',
          shape: 'word',
          reviewTargets: ['v-schmerzen', 'v-bauch'],
          hints: [bi('One word, not two.', 'Една дума, не две.')],
        },
        {
          prompt: bi('I have a cold.', 'Имам настинка.'),
          scaffold: 'Ich habe eine Erk___.',
          answer: 'Erkältung',
          shape: 'word',
          reviewTargets: ['v-erkaeltung'],
          hints: [bi('It needs an umlaut.', 'Трябва умлаут.')],
        },
      ]),
    ),
    a1(
      wordOrder('a1u6l2-ex3', bi('Put it together', 'Сглоби'), [
        {
          prompt: bi('My head hurts.', 'Боли ме главата.'),
          bank: ['Mein', 'Kopf', 'tut', 'weh'],
          answer: 'Mein Kopf tut weh.',
          hints: [bi('weh goes last.', 'weh отива най-накрая.')],
        },
        {
          prompt: bi('I am ill and I have a temperature.', 'Болен съм и имам температура.'),
          bank: ['Ich', 'bin', 'krank', 'und', 'ich', 'habe', 'Fieber'],
          answer: 'Ich bin krank und ich habe Fieber.',
          hints: [bi('Each half needs its own subject.', 'Всяка половина иска собствен подлог.')],
        },
      ]),
    ),
    a1(
      dictation('a1u6l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe Kopfschmerzen.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Gute Besserung!',
          shape: 'phrase',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u6l2-m1', bi('Mastery: health', 'Проверка: здраве'), [
          {
            prompt: bi('I am ill and I have a sore throat.', 'Болен съм и ме боли гърлото.'),
            answer: 'Ich bin krank und ich habe Halsschmerzen.',
            hints: [],
          },
          {
            prompt: bi('My stomach hurts.', 'Боли ме коремът.'),
            answer: 'Mein Bauch tut weh.',
            hints: [],
          },
          {
            prompt: bi('I am well again.', 'Отново съм здрав.'),
            answer: 'Ich bin wieder gesund.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — weather
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u6-l3',
  unitId: 'a1-u6',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('The weather, and the subject German invents', 'Времето и подлогът, който немският измисля'),
  objective: bi(
    'After this lesson you will be able to talk about the weather, and you will know why every German sentence needs a subject even when there is nothing to be one.',
    'След този урок ще можеш да говориш за времето и ще знаеш защо всяко немско изречение иска подлог дори когато няма какво да бъде подлог.',
  ),
  outcomes: [
    bi('I can say what the weather is doing.', 'Мога да кажа какво е времето.'),
    bi('I can ask what the weather is like.', 'Мога да попитам какво е времето.'),
    bi('I know that es cannot be left out.', 'Знам, че es не може да се изпусне.'),
    bi('I know the verb stays second even when es moves.', 'Знам, че глаголът остава втори дори когато es се мести.'),
  ],
  vocabIds: [
    'v-wetter',
    'v-regnen',
    'v-schneien',
    'v-sonne',
    'v-scheinen',
    'v-kalt',
    'v-warm',
    'v-heiss',
    'v-windig',
    'v-sommer',
    'v-winter',
  ],
  grammarIds: ['g-impersonal-es'],
  sections: [
    {
      id: 'a1u6l3-intro',
      kind: 'intro',
      title: bi('The last new idea of the level', 'Последната нова идея за нивото'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Weather is easy vocabulary attached to one genuinely important rule, which is why it comes last: a German sentence must have a subject, and when nothing can be one, German supplies es.',
            'Времето е лесна лексика, закачена за едно наистина важно правило, и затова идва накрая: немското изречение задължително има подлог, а когато няма какво да бъде подлог, немският слага es.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l3-grammar',
      kind: 'grammar',
      title: bi('Es regnet', 'Es regnet'),
      blocks: [],
      grammarId: 'g-impersonal-es',
    },
    {
      id: 'a1u6l3-vocab',
      kind: 'vocabulary',
      title: bi('Weather words', 'Думи за времето'),
      vocabIds: ['v-wetter', 'v-regnen', 'v-schneien', 'v-sonne', 'v-scheinen', 'v-kalt', 'v-warm', 'v-heiss', 'v-windig'],
      blocks: [
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Забележи, че „време“ на български е две различни думи на немски: Zeit е часовниковото време, Wetter е това навън. „Wie ist das Wetter?“ никога не пита колко е часът.',
          ),
        },
      ],
    },
    {
      id: 'a1u6l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Es regnet, es schneit, es ist kalt — es is never left out.', 'Es regnet, es schneit, es ist kalt — es никога не се изпуска.'),
            bi('Heute regnet es — the verb is still second.', 'Heute regnet es — глаголът пак е втори.'),
            bi('Die Sonne scheint — a real subject, so no es.', 'Die Sonne scheint — истински подлог, значи без es.'),
            bi('Wetter is the weather; Zeit is the clock.', 'Wetter е времето навън; Zeit е часовниковото.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u6l3-ex1',
        bi('What is it doing?', 'Какво прави времето?'),
        [
          {
            prompt: bi('It is raining.', 'Вали.'),
            answer: 'Es regnet.',
            reviewTargets: ['v-regnen', 'p-es-regnet'],
            hints: [bi('German needs a subject even here.', 'Немският иска подлог дори тук.')],
            traps: [
              {
                answer: 'Regnet.',
                category: 'missing-word',
                feedback: bi(
                  'A German sentence cannot go without a subject. There is nothing that could be one here, so German supplies es: Es regnet.',
                  'Немското изречение не може без подлог. Тук няма какво да бъде подлог, затова немският слага es: Es regnet. („Вали.“ на български е цяло изречение, на немски не е.)',
                ),
              },
            ],
          },
          {
            prompt: bi('It is cold.', 'Студено е.'),
            answer: 'Es ist kalt.',
            reviewTargets: ['v-kalt'],
            hints: [],
            traps: [
              {
                answer: 'Ist kalt.',
                category: 'missing-word',
                feedback: bi(
                  'Same rule: es holds the subject position. Es ist kalt.',
                  'Същото правило: es държи мястото на подлога. Es ist kalt.',
                ),
              },
            ],
          },
          {
            prompt: bi('The sun is shining.', 'Слънцето грее.'),
            answer: 'Die Sonne scheint.',
            reviewTargets: ['v-sonne', 'v-scheinen'],
            hints: [bi('Here there is a real subject, so no es.', 'Тук има истински подлог, затова без es.')],
          },
          {
            prompt: bi('What is the weather like today?', 'Какво е времето днес?'),
            answer: 'Wie ist das Wetter heute?',
            reviewTargets: ['v-wetter', 'p-wie-ist-das-wetter'],
            hints: [],
          },
        ],
        ['g-impersonal-es'],
      ),
    ),
    a1(
      fillBlank('a1u6l3-ex2', bi('Where does es go?', 'Къде отива es?'), [
        {
          prompt: bi('Today it is raining.', 'Днес вали.'),
          scaffold: 'Heute regnet ___.',
          answer: 'es',
          shape: 'word',
          reviewTargets: ['g-impersonal-es'],
          hints: [bi('The verb stays second, so es moves after it.', 'Глаголът остава втори, затова es се мести след него.')],
        },
        {
          prompt: bi('In winter it often snows.', 'През зимата често вали сняг.'),
          scaffold: 'Im Winter schneit ___ oft.',
          answer: 'es',
          shape: 'word',
          reviewTargets: ['v-schneien', 'v-winter'],
          hints: [],
        },
        {
          prompt: bi('It is very windy.', 'Много е ветровито.'),
          scaffold: '___ ist sehr windig.',
          answer: 'Es',
          shape: 'word',
          reviewTargets: ['v-windig'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u6l3-ex3', bi('Build the weather report', 'Построй прогнозата'), [
        {
          prompt: bi('In summer it is hot.', 'През лятото е горещо.'),
          bank: ['Im', 'Sommer', 'ist', 'es', 'heiß'],
          answer: 'Im Sommer ist es heiß.',
          hints: [bi('Time first, verb second, then es.', 'Първо времето, после глаголът, после es.')],
        },
        {
          prompt: bi('It is cold and it is raining.', 'Студено е и вали.'),
          bank: ['Es', 'ist', 'kalt', 'und', 'es', 'regnet'],
          answer: 'Es ist kalt und es regnet.',
          hints: [bi('Both halves need their own es.', 'И двете половини искат собствено es.')],
        },
      ]),
    ),
    a1(
      dictation('a1u6l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Es regnet heute.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Sonne scheint.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u6l3-ex5', bi('Describe today', 'Опиши днешния ден'), [
        {
          prompt: bi(
            'Write two sentences about the weather today and what you are doing because of it.',
            'Напиши две изречения за времето днес и какво правиш заради него.',
          ),
          answer: 'Es regnet heute. Ich bin zu Hause, denn es ist kalt.',
          requiredTokens: ['es'],
          shape: 'sentence',
          hints: [
            bi('Start with Es or Heute.', 'Започни с Es или Heute.'),
            bi('Join the second sentence with denn or aber.', 'Свържи второто изречение с denn или aber.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u6l3-m1', bi('Mastery: the weather', 'Проверка: времето'), [
          {
            prompt: bi('It is snowing.', 'Вали сняг.'),
            answer: 'Es schneit.',
            hints: [],
          },
          {
            prompt: bi('Today it is warm.', 'Днес е топло.'),
            answer: 'Heute ist es warm.',
            alternatives: ['Es ist heute warm.'],
            hints: [],
          },
          {
            prompt: bi('What is the weather like?', 'Какво е времето?'),
            answer: 'Wie ist das Wetter?',
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
  id: 'cp-a1-u6',
  scope: 'unit',
  targetId: 'a1-u6',
  status: 'available',
  title: bi('Unit 6 checkpoint', 'Проверка на раздел 6'),
  description: bi(
    'Appointments, health and weather — and the subject German will not go without.',
    'Записване на час, здраве и време — и подлогът, без който немският не може.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u6-1', bi('Appointments', 'Записване на час'), [
        {
          prompt: bi('I would like an appointment.', 'Бих искал час.'),
          answer: 'Ich möchte einen Termin.',
          hints: [],
        },
        {
          prompt: bi('I have an appointment at the doctor’s.', 'Имам час при лекаря.'),
          answer: 'Ich habe einen Termin beim Arzt.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u6-2', bi('Health', 'Здраве'), [
        {
          prompt: bi('I am ill.', 'Болен съм.'),
          answer: 'Ich bin krank.',
          hints: [],
        },
        {
          prompt: bi('I have a headache.', 'Боли ме главата.'),
          answer: 'Ich habe Kopfschmerzen.',
          hints: [],
        },
        {
          prompt: bi('My throat hurts.', 'Боли ме гърлото.'),
          answer: 'Mein Hals tut weh.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u6-3', bi('Weather', 'Времето'), [
        {
          prompt: bi('It is raining.', 'Вали.'),
          answer: 'Es regnet.',
          hints: [],
        },
        {
          prompt: bi('Today it is cold.', 'Днес е студено.'),
          answer: 'Heute ist es kalt.',
          alternatives: ['Es ist heute kalt.'],
          hints: [],
        },
        {
          prompt: bi('The sun is shining.', 'Слънцето грее.'),
          answer: 'Die Sonne scheint.',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u6-4',
        kind: 'fillBlank',
        objective: bi('The missing piece', 'Липсващото парче'),
        steps: [
          {
            prompt: bi('at the doctor’s', 'при лекаря'),
            scaffold: '___ Arzt',
            answer: 'beim',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('Today it is snowing.', 'Днес вали сняг.'),
            scaffold: 'Heute schneit ___.',
            answer: 'es',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u6-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe Kopfschmerzen.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Es ist kalt und windig.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_6: Unit = {
  id: 'a1-u6',
  level: 'a1',
  order: 6,
  status: 'available',
  title: bi('Appointments, health and weather', 'Срещи, здраве и времето'),
  summary: bi(
    'Making an appointment, saying what hurts, and the impersonal es — the rule that a German sentence never goes without a subject.',
    'Записване на час, какво те боли, и безличното es — правилото, че немското изречение никога не остава без подлог.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U6_PATTERNS = PATTERNS;
