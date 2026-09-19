import {
  bi,
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
    id: 'p-am-tag',
    template: 'Am ___ arbeite ich.',
    example: 'Am Montag arbeite ich.',
    gloss: bi('On ___ I work.', 'В ___ работя.'),
    level: 'pre-a1',
    grammarIds: ['g-time-prepositions', 'g-verb-second'],
  },
  {
    id: 'p-im-monat',
    template: 'Im ___ habe ich Geburtstag.',
    example: 'Im Mai habe ich Geburtstag.',
    gloss: bi('My birthday is in ___.', 'През ___ имам рожден ден.'),
    level: 'pre-a1',
    grammarIds: ['g-time-prepositions'],
  },
  {
    id: 'p-es-ist-uhr',
    template: 'Es ist ___ Uhr.',
    example: 'Es ist acht Uhr.',
    gloss: bi('It is ___ o’clock.', 'Часът е ___.'),
    level: 'pre-a1',
    grammarIds: ['g-telling-time'],
  },
];

/* ================================================================== *
 * Lesson 1 - Days of the week
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u5-l1',
  unitId: 'pre-a1-u5',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 16,
  title: bi('Days of the week', 'Дните от седмицата'),
  objective: bi(
    'After this lesson you will be able to name the days of the week and say what you do on a particular day.',
    'След този урок ще можеш да назоваваш дните от седмицата и да кажеш какво правиш в определен ден.',
  ),
  outcomes: [
    bi('I can name all seven days.', 'Мога да назова всичките седем дни.'),
    bi('I can say "on Monday" with the right preposition.', 'Мога да кажа „в понеделник“ с правилния предлог.'),
    bi('I can use heute, morgen and gestern.', 'Мога да използвам heute, morgen и gestern.'),
  ],
  vocabIds: [
    'v-montag', 'v-dienstag', 'v-mittwoch', 'v-donnerstag', 'v-freitag',
    'v-samstag', 'v-sonntag', 'v-heute', 'v-morgen', 'v-gestern',
    'v-die-woche', 'v-das-wochenende',
  ],
  grammarIds: ['g-time-prepositions', 'g-verb-second'],
  patterns: [PATTERNS[0]!],
  sections: [
    {
      id: 'u5l1-intro',
      kind: 'intro',
      title: bi('Seven days, one gender', 'Седем дни, един род'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A rare piece of good news: every day of the week is masculine, so it is der Montag, der Dienstag, der Mittwoch — all of them. One rule, no exceptions.',
            'Рядка добра новина: всеки ден от седмицата е от мъжки род, значи der Montag, der Dienstag, der Mittwoch — всички. Едно правило, без изключения.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'And the German week starts on Monday, which is also where the calendar starts.',
            'А немската седмица започва в понеделник, откъдето започва и календарът.',
          ),
        },
      ],
    },
    {
      id: 'u5l1-vocab',
      kind: 'vocabulary',
      title: bi('The seven days', 'Седемте дни'),
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Two are transparent once you look: Mittwoch is "mid-week", and Sonntag is "sun-day".',
            'Две са прозрачни, щом се загледаш: Mittwoch е „средата на седмицата“, а Sonntag е „ден на слънцето“.',
          ),
        },
      ],
      vocabIds: ['v-montag', 'v-dienstag', 'v-mittwoch', 'v-donnerstag', 'v-freitag', 'v-samstag', 'v-sonntag'],
    },
    {
      id: 'u5l1-prepositions',
      kind: 'grammar',
      title: bi('am, im, um', 'am, im, um'),
      blocks: [],
      grammarId: 'g-time-prepositions',
    },
    {
      id: 'u5l1-wordorder',
      kind: 'grammar',
      title: bi('Putting the day first', 'Когато денят е отпред'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A time expression very often opens a German sentence. When it does, the verb-second rule takes over: the verb comes next and the subject moves behind it.',
            'Изразът за време много често отваря немското изречение. Тогава влиза правилото за глагола на второ място: глаголът идва веднага след него, а подлогът минава зад глагола.',
          ),
        },
        {
          t: 'table',
          headers: [bi('1', '1'), bi('2 — verb', '2 — глагол'), bi('3 ...', '3 ...')],
          rows: [
            ['Am Montag', 'arbeite', 'ich.'],
            ['Heute', 'lerne', 'ich Deutsch.'],
            ['Am Wochenende', 'bin', 'ich zu Hause.'],
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'So it is "Am Montag arbeite ich", never "Am Montag ich arbeite". This is the same rule you met in Unit 2 — it just bites more often now that you have time expressions.',
            'Значи е „Am Montag arbeite ich“, никога „Am Montag ich arbeite“. Това е същото правило от раздел 2 — просто сега се проявява по-често, защото имаш изрази за време.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Тук грешката е почти неизбежна в началото, защото българският позволява и двете: „В понеделник работя“ и „В понеделник аз работя“ звучат добре. Немският допуска само едното.',
          ),
        },
      ],
    },
    {
      id: 'u5l1-relative',
      kind: 'vocabulary',
      title: bi('Today, tomorrow, yesterday', 'Днес, утре, вчера'),
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Watch the capital letter: "morgen" (lowercase) is tomorrow, "der Morgen" (capital) is the morning. "morgen Morgen" — tomorrow morning — is a real phrase, though Germans usually say "morgen früh".',
            'Внимавай с главната буква: „morgen“ (малка буква) е „утре“, а „der Morgen“ (главна) е „утрото“. „morgen Morgen“ — утре сутрин — съществува, но немците обикновено казват „morgen früh“.',
          ),
        },
      ],
      vocabIds: ['v-heute', 'v-morgen', 'v-gestern', 'v-die-woche', 'v-das-wochenende'],
    },
    {
      id: 'u5l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('All seven days are masculine: der Montag.', 'И седемте дни са от мъжки род: der Montag.'),
            bi('"On Monday" is "am Montag".', '„В понеделник“ е „am Montag“.'),
            bi('A time expression in front pushes the subject behind the verb.', 'Израз за време отпред изтласква подлога зад глагола.'),
            bi('morgen = tomorrow, der Morgen = the morning.', 'morgen = утре, der Morgen = утрото.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    typeIt(
      'u5l1-ex1',
      bi('Name the day', 'Назови деня'),
      [
        { prompt: bi('Monday', 'понеделник'), answer: 'Montag', shape: 'word', reviewTargets: ['v-montag'], hints: [] },
        { prompt: bi('Wednesday', 'сряда'), answer: 'Mittwoch', shape: 'word', reviewTargets: ['v-mittwoch'], hints: [bi('"Mid-week".', '„Средата на седмицата“.')] },
        { prompt: bi('Thursday', 'четвъртък'), answer: 'Donnerstag', shape: 'word', reviewTargets: ['v-donnerstag'], hints: [] },
        { prompt: bi('Saturday', 'събота'), answer: 'Samstag', shape: 'word', reviewTargets: ['v-samstag'], hints: [] },
        { prompt: bi('Sunday', 'неделя'), answer: 'Sonntag', shape: 'word', reviewTargets: ['v-sonntag'], hints: [bi('"Sun-day".', '„Ден на слънцето“.')] },
      ],
    ),

    fillBlank('u5l1-ex2', bi('Which preposition?', 'Кой предлог?'), [
      {
        prompt: bi('On Monday I work.', 'В понеделник работя.'),
        scaffold: '___ Montag arbeite ich.',
        answer: 'Am',
        shape: 'word',
        reviewTargets: ['p-am-tag'],
        hints: [bi('Two letters, for a day of the week.', 'Две букви, за ден от седмицата.')],
      },
      {
        prompt: bi('At the weekend I am at home.', 'През уикенда съм вкъщи.'),
        scaffold: '___ Wochenende bin ich zu Hause.',
        answer: 'Am',
        shape: 'word',
        reviewTargets: ['v-das-wochenende'],
        hints: [bi('The weekend takes the same preposition as a day.', 'Уикендът взима същия предлог като ден.')],
      },
    ]),

    wordOrder('u5l1-ex3', bi('Put the verb in second position', 'Сложи глагола на второ място'), [
      {
        prompt: bi('On Monday I work.', 'В понеделник работя.'),
        bank: ['arbeite', 'Am', 'ich.', 'Montag'],
        answer: 'Am Montag arbeite ich.',
        hints: [bi('Time first, then the verb, then the subject.', 'Първо времето, после глаголът, после подлогът.')],
      },
      {
        prompt: bi('Today I am learning German.', 'Днес уча немски.'),
        bank: ['lerne', 'Heute', 'Deutsch.', 'ich'],
        answer: 'Heute lerne ich Deutsch.',
        hints: [bi('The subject comes after the verb here.', 'Подлогът тук идва след глагола.')],
      },
    ]),

    typeIt(
      'u5l1-ex4',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('On Monday I work.', 'В понеделник работя.'),
          answer: 'Am Montag arbeite ich.',
          alternatives: ['Ich arbeite am Montag.'],
          reviewTargets: ['p-am-tag', 'v-montag'],
          traps: [
            {
              answer: 'Am Montag ich arbeite.',
              category: 'word-order',
              feedback: bi(
                'Because "Am Montag" takes position one, the verb has to come next: Am Montag arbeite ich. The subject moves behind the verb.',
                'Тъй като „Am Montag“ заема първа позиция, глаголът трябва да дойде веднага след него: Am Montag arbeite ich. Подлогът минава зад глагола.',
              ),
            },
          ],
          hints: [
            bi('Four words. The verb must be second.', 'Четири думи. Глаголът трябва да е втори.'),
            bi('Am Montag ...', 'Am Montag ...'),
          ],
        },
        {
          prompt: bi('Today I am learning German.', 'Днес уча немски.'),
          answer: 'Heute lerne ich Deutsch.',
          alternatives: ['Ich lerne heute Deutsch.'],
          reviewTargets: ['v-heute', 'v-lernen'],
          hints: [bi('Four words, starting with "Heute".', 'Четири думи, започвайки с „Heute“.')],
        },
        {
          prompt: bi('At the weekend I am at home.', 'През уикенда съм вкъщи.'),
          answer: 'Am Wochenende bin ich zu Hause.',
          alternatives: ['Ich bin am Wochenende zu Hause.'],
          reviewTargets: ['v-das-wochenende'],
          hints: [bi('The verb is sein.', 'Глаголът е sein.')],
        },
        {
          prompt: bi('Tomorrow I am working in Hamburg.', 'Утре работя в Хамбург.'),
          answer: 'Morgen arbeite ich in Hamburg.',
          alternatives: ['Ich arbeite morgen in Hamburg.'],
          reviewTargets: ['v-morgen', 'v-arbeiten'],
          hints: [bi('Five words. Verb second again.', 'Пет думи. Глаголът пак е втори.')],
        },
      ],
      ['g-verb-second', 'g-time-prepositions'],
    ),

    multipleChoice('u5l1-ex5', bi('morgen or Morgen?', 'morgen или Morgen?'), [
      {
        prompt: bi('Which one means "tomorrow"?', 'Кое значи „утре“?'),
        choices: [
          { id: 'a', de: 'morgen', gloss: bi('lowercase', 'малка буква') },
          { id: 'b', de: 'der Morgen', gloss: bi('capitalised noun', 'съществително с главна буква') },
        ],
        correct: 'a',
        answer: 'morgen',
        shape: 'word',
        reviewTargets: ['v-morgen'],
        hints: [],
      },
    ]),

    dictation('u5l1-ex6', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the day you hear.', 'Напиши деня, който чуваш.'),
        answer: 'Donnerstag',
        shape: 'word',
        reviewTargets: ['v-donnerstag'],
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Am Freitag arbeite ich nicht.',
        shape: 'sentence',
        reviewTargets: ['v-freitag'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u5l1-m1', bi('Mastery check', 'Проверка за усвояване'), [
        { prompt: bi('Wednesday', 'сряда'), answer: 'Mittwoch', shape: 'word', hints: [] },
        {
          prompt: bi('On Tuesday I work.', 'Във вторник работя.'),
          answer: 'Am Dienstag arbeite ich.',
          alternatives: ['Ich arbeite am Dienstag.'],
          hints: [],
        },
        {
          prompt: bi('Today I am learning German.', 'Днес уча немски.'),
          answer: 'Heute lerne ich Deutsch.',
          alternatives: ['Ich lerne heute Deutsch.'],
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 - Months and dates
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u5-l2',
  unitId: 'pre-a1-u5',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 16,
  title: bi('Months and birthdays', 'Месеци и рождени дни'),
  objective: bi(
    'After this lesson you will be able to name the months and say when your birthday is.',
    'След този урок ще можеш да назоваваш месеците и да кажеш кога е рожденият ти ден.',
  ),
  outcomes: [
    bi('I can name the twelve months.', 'Мога да назова дванайсетте месеца.'),
    bi('I can say which month something happens in.', 'Мога да кажа през кой месец става нещо.'),
    bi('I can ask and answer when someone’s birthday is.', 'Мога да питам и да отговарям кога е рожденият ден на някого.'),
  ],
  vocabIds: [
    'v-januar', 'v-februar', 'v-maerz', 'v-april', 'v-mai', 'v-juni',
    'v-juli', 'v-august', 'v-september', 'v-oktober', 'v-november', 'v-dezember',
    'v-der-monat', 'v-der-geburtstag', 'v-wann',
  ],
  grammarIds: ['g-time-prepositions'],
  patterns: [PATTERNS[1]!],
  sections: [
    {
      id: 'u5l2-intro',
      kind: 'intro',
      title: bi('The months are nearly free', 'Месеците са почти подарък'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'The month names come from Latin, so they will look familiar. What you have to add is German pronunciation and the preposition "im".',
            'Имената на месеците идват от латински, така че ще ти изглеждат познати. Трябва да добавиш само немския изговор и предлога „im“.',
          ),
        },
        { t: 'de', de: 'Im Mai habe ich Geburtstag.', gloss: bi('My birthday is in May.', 'През май имам рожден ден.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Note the construction: German says "haben Geburtstag", literally "to have birthday".',
            'Забележи конструкцията: немският казва „haben Geburtstag“, буквално „имам рожден ден“ — точно както в българския.',
          ),
        },
      ],
    },
    {
      id: 'u5l2-vocab',
      kind: 'vocabulary',
      title: bi('The twelve months', 'Дванайсетте месеца'),
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Three to listen to carefully: März has the ä sound, Juni and Juli sound almost identical, and August is stressed on the second syllable — ow-GUST.',
            'Три за внимателно слушане: März има звука ä, Juni и Juli звучат почти еднакво, а August е с ударение на втората сричка — ау-ГУСТ.',
          ),
        },
      ],
      vocabIds: [
        'v-januar', 'v-februar', 'v-maerz', 'v-april', 'v-mai', 'v-juni',
        'v-juli', 'v-august', 'v-september', 'v-oktober', 'v-november', 'v-dezember',
      ],
    },
    {
      id: 'u5l2-im',
      kind: 'grammar',
      title: bi('im for months', 'im за месеци'),
      blocks: [],
      grammarId: 'g-time-prepositions',
    },
    {
      id: 'u5l2-birthday',
      kind: 'examples',
      title: bi('Birthdays', 'Рождени дни'),
      blocks: [
        { t: 'de', de: 'Wann hast du Geburtstag?', gloss: bi('When is your birthday?', 'Кога имаш рожден ден?'), audio: true },
        { t: 'de', de: 'Im September. Und du?', gloss: bi('In September. And you?', 'През септември. А ти?'), audio: true },
        { t: 'de', de: 'Herzlichen Glückwunsch!', gloss: bi('Happy birthday!', 'Честит рожден ден!'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            '"Herzlichen Glückwunsch" is the all-purpose congratulation — birthdays, exams, new jobs, new babies.',
            '„Herzlichen Glückwunsch“ е универсалното поздравление — рождени дни, изпити, нова работа, новородено.',
          ),
        },
      ],
      vocabIds: ['v-der-geburtstag', 'v-wann', 'v-der-monat'],
    },
    {
      id: 'u5l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('All twelve months are masculine: der Januar.', 'И дванайсетте месеца са от мъжки род: der Januar.'),
            bi('"In May" is "im Mai".', '„През май“ е „im Mai“.'),
            bi('Wann hast du Geburtstag? — Im Mai.', 'Wann hast du Geburtstag? — Im Mai.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    typeIt(
      'u5l2-ex1',
      bi('Name the month', 'Назови месеца'),
      [
        { prompt: bi('March', 'март'), answer: 'März', shape: 'word', reviewTargets: ['v-maerz'], hints: [bi('It needs ä.', 'Изисква ä.')] },
        { prompt: bi('May', 'май'), answer: 'Mai', shape: 'word', reviewTargets: ['v-mai'], hints: [] },
        { prompt: bi('June', 'юни'), answer: 'Juni', shape: 'word', reviewTargets: ['v-juni'], hints: [] },
        { prompt: bi('October', 'октомври'), answer: 'Oktober', shape: 'word', reviewTargets: ['v-oktober'], hints: [bi('German spells it with a k.', 'Немският го пише с k.')] },
        { prompt: bi('December', 'декември'), answer: 'Dezember', shape: 'word', reviewTargets: ['v-dezember'], hints: [bi('German spells it with a z.', 'Немският го пише с z.')] },
      ],
    ),

    fillBlank('u5l2-ex2', bi('am or im?', 'am или im?'), [
      {
        prompt: bi('In May I have holiday.', 'През май съм в отпуск.'),
        scaffold: '___ Mai habe ich Urlaub.',
        answer: 'Im',
        shape: 'word',
        reviewTargets: ['p-im-monat'],
        hints: [bi('For a month.', 'За месец.')],
      },
      {
        prompt: bi('On Sunday I am at home.', 'В неделя съм вкъщи.'),
        scaffold: '___ Sonntag bin ich zu Hause.',
        answer: 'Am',
        shape: 'word',
        reviewTargets: ['v-sonntag'],
        hints: [bi('For a day.', 'За ден.')],
      },
    ]),

    typeIt(
      'u5l2-ex3',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('My birthday is in May.', 'През май имам рожден ден.'),
          answer: 'Im Mai habe ich Geburtstag.',
          alternatives: ['Ich habe im Mai Geburtstag.'],
          reviewTargets: ['p-im-monat', 'v-der-geburtstag'],
          traps: [
            {
              answer: 'Am Mai habe ich Geburtstag.',
              category: 'preposition',
              feedback: bi(
                'Months take "im", not "am". Use am for a day (am Montag) and im for a month (im Mai).',
                'Месеците взимат „im“, не „am“. Използвай am за ден (am Montag) и im за месец (im Mai).',
              ),
            },
            {
              answer: 'Im Mai ich habe Geburtstag.',
              category: 'word-order',
              feedback: bi(
                '"Im Mai" is in position one, so the verb comes next: Im Mai habe ich Geburtstag.',
                '„Im Mai“ е на първа позиция, затова глаголът идва след него: Im Mai habe ich Geburtstag.',
              ),
            },
          ],
          hints: [
            bi('Five words. Watch both the preposition and the word order.', 'Пет думи. Внимавай и с предлога, и със словореда.'),
            bi('Im Mai ...', 'Im Mai ...'),
          ],
        },
        {
          prompt: bi('When is your birthday? (informal)', 'Кога имаш рожден ден?'),
          answer: 'Wann hast du Geburtstag?',
          reviewTargets: ['v-wann', 'v-der-geburtstag'],
          hints: [bi('Four words, starting with the question word for "when".', 'Четири думи, започвайки с въпросителната дума за „кога“.')],
        },
        {
          prompt: bi('In December I am in Bulgaria.', 'През декември съм в България.'),
          answer: 'Im Dezember bin ich in Bulgarien.',
          alternatives: ['Ich bin im Dezember in Bulgarien.'],
          reviewTargets: ['v-dezember'],
          hints: [],
        },
      ],
      ['g-time-prepositions'],
    ),

    partialRecall('u5l2-ex4', bi('Partial recall', 'Частично припомняне'), [
      {
        prompt: bi('February', 'февруари'),
        scaffold: 'F___',
        answer: 'Februar',
        shape: 'word',
        reviewTargets: ['v-februar'],
        hints: [],
      },
      {
        prompt: bi('August', 'август'),
        scaffold: 'A___',
        answer: 'August',
        shape: 'word',
        reviewTargets: ['v-august'],
        hints: [],
      },
    ]),

    dictation('u5l2-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the month you hear.', 'Напиши месеца, който чуваш.'),
        answer: 'März',
        shape: 'word',
        reviewTargets: ['v-maerz'],
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Im Juli habe ich Geburtstag.',
        shape: 'sentence',
        reviewTargets: ['v-juli'],
        hints: [],
      },
    ]),

    freeWriting('u5l2-ex6', bi('Free production', 'Свободно производство'), [
      {
        prompt: bi(
          'Write one sentence saying when your birthday is.',
          'Напиши едно изречение за това кога е рожденият ти ден.',
        ),
        instruction: bi('Use your real month.', 'Използвай истинския си месец.'),
        answer: 'Im Mai habe ich Geburtstag.',
        shape: 'sentence',
        requiredTokens: ['Geburtstag'],
        hints: [bi('Im ... habe ich Geburtstag.', 'Im ... habe ich Geburtstag.')],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u5l2-m1', bi('Mastery check', 'Проверка за усвояване'), [
        { prompt: bi('March', 'март'), answer: 'März', shape: 'word', hints: [] },
        {
          prompt: bi('My birthday is in September.', 'През септември имам рожден ден.'),
          answer: 'Im September habe ich Geburtstag.',
          alternatives: ['Ich habe im September Geburtstag.'],
          hints: [],
        },
        {
          prompt: bi('When is your birthday? (informal)', 'Кога имаш рожден ден?'),
          answer: 'Wann hast du Geburtstag?',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 - Telling the time
 * ================================================================== */

const lesson3: Lesson = {
  id: 'pre-a1-u5-l3',
  unitId: 'pre-a1-u5',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 22,
  title: bi('Telling the time', 'Колко е часът'),
  objective: bi(
    'After this lesson you will be able to ask and tell the time in German — including the half hour, which German counts forward.',
    'След този урок ще можеш да питаш и да казваш колко е часът на немски — включително половиния час, който немският брои напред.',
  ),
  outcomes: [
    bi('I can ask what time it is.', 'Мога да попитам колко е часът.'),
    bi('I can say a full hour, a quarter and a half hour.', 'Мога да кажа цял час, четвърт и половин час.'),
    bi('I understand that halb acht means 7:30.', 'Разбирам, че halb acht значи 7:30.'),
    bi('I can say at what time something happens.', 'Мога да кажа в колко часа става нещо.'),
  ],
  vocabIds: ['v-die-uhr', 'v-wie-viel-uhr-ist-es', 'v-halb', 'v-viertel', 'v-um'],
  grammarIds: ['g-telling-time', 'g-time-prepositions'],
  patterns: [PATTERNS[2]!],
  sections: [
    {
      id: 'u5l3-intro',
      kind: 'intro',
      title: bi('One habit to unlearn', 'Един навик за отучване'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Telling the time in German is straightforward except for one thing, and that one thing makes people miss appointments. It is worth five careful minutes.',
            'Часът на немски е прост, с едно изключение — и точно това изключение кара хората да изпускат срещи. Заслужава пет внимателни минути.',
          ),
        },
        { t: 'de', de: 'Wie viel Uhr ist es?', gloss: bi('What time is it?', 'Колко е часът?'), audio: true },
        { t: 'de', de: 'Es ist acht Uhr.', gloss: bi('It is eight o’clock.', 'Часът е осем.'), audio: true },
        { t: 'de', de: 'Es ist halb acht.', gloss: bi('It is half past seven.', 'Часът е седем и половина.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Read those last two again. "acht Uhr" is 8:00, but "halb acht" is 7:30 — half an hour *before* eight.',
            'Прочети последните две отново. „acht Uhr“ е 8:00, но „halb acht“ е 7:30 — половин час ПРЕДИ осем.',
          ),
        },
      ],
    },
    {
      id: 'u5l3-grammar',
      kind: 'grammar',
      title: bi('The clock', 'Часовникът'),
      blocks: [],
      grammarId: 'g-telling-time',
    },
    {
      id: 'u5l3-vocab',
      kind: 'vocabulary',
      title: bi('The words', 'Думите'),
      blocks: [],
      vocabIds: ['v-die-uhr', 'v-wie-viel-uhr-ist-es', 'v-halb', 'v-viertel', 'v-um'],
    },
    {
      id: 'u5l3-um',
      kind: 'examples',
      title: bi('Saying when something happens', 'Да кажеш в колко часа става нещо'),
      blocks: [
        { t: 'de', de: 'Ich arbeite um acht Uhr.', gloss: bi('I work at eight o’clock.', 'Работя в осем часа.'), audio: true },
        { t: 'de', de: 'Um halb neun bin ich zu Hause.', gloss: bi('At half past eight I am at home.', 'В осем и половина съм вкъщи.'), audio: true },
        { t: 'de', de: 'Der Termin ist um Viertel vor zehn.', gloss: bi('The appointment is at quarter to ten.', 'Срещата е за десет без петнайсет.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'In anything official — a doctor’s appointment, a train, opening hours — Germans use the 24-hour clock: "vierzehn Uhr dreißig" for 14:30. Completely unambiguous, and worth using yourself when it matters.',
            'В официален контекст — час при лекар, влак, работно време — немците използват 24-часовия формат: „vierzehn Uhr dreißig“ за 14:30. Напълно еднозначно и си заслужава да го използваш, когато е важно.',
          ),
        },
      ],
    },
    {
      id: 'u5l3-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Wie viel Uhr ist es? / Wie spät ist es?', 'Wie viel Uhr ist es? / Wie spät ist es?'),
            bi('Full hour: Es ist acht Uhr.', 'Цял час: Es ist acht Uhr.'),
            bi('halb acht = 7:30. The German number is one higher.', 'halb acht = 7:30. Немското число е с едно по-високо.'),
            bi('Viertel nach / Viertel vor for quarters.', 'Viertel nach / Viertel vor за четвъртинките.'),
            bi('"At" a time is "um": um acht Uhr.', '„В“ определен час е „um“: um acht Uhr.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice(
      'u5l3-ex1',
      bi('First: what does halb acht mean?', 'Първо: какво значи halb acht?'),
      [
        {
          prompt: bi('"Es ist halb acht." What time is it?', '„Es ist halb acht.“ Колко е часът?'),
          choices: [
            { id: 'a', de: '7:30', gloss: bi('half past seven', 'седем и половина') },
            { id: 'b', de: '8:30', gloss: bi('half past eight', 'осем и половина') },
          ],
          correct: 'a',
          answer: '7:30',
          shape: 'word',
          reviewTargets: ['v-halb'],
          hints: [bi('German counts towards the coming hour.', 'Немският брои към идващия час.')],
        },
        {
          prompt: bi('How do you say 9:30 in German?', 'Как се казва 9:30 на немски?'),
          choices: [
            { id: 'a', de: 'halb neun', gloss: bi('half nine', 'половин девет') },
            { id: 'b', de: 'halb zehn', gloss: bi('half ten', 'половин десет') },
          ],
          correct: 'b',
          answer: 'halb zehn',
          shape: 'phrase',
          reviewTargets: ['v-halb'],
          hints: [bi('One higher than you expect.', 'С едно по-високо, отколкото очакваш.')],
        },
      ],
      'listenChoose',
    ),

    fillBlank('u5l3-ex2', bi('Complete the time', 'Довърши часа'), [
      {
        prompt: bi('It is eight o’clock.', 'Часът е осем.'),
        scaffold: 'Es ist acht ___.',
        answer: 'Uhr',
        shape: 'word',
        reviewTargets: ['v-die-uhr', 'p-es-ist-uhr'],
        hints: [bi('With a full hour, German keeps this word.', 'При цял час немският запазва тази дума.')],
      },
      {
        prompt: bi('It is 7:30.', 'Часът е 7:30.'),
        scaffold: 'Es ist halb ___.',
        answer: 'acht',
        shape: 'word',
        reviewTargets: ['v-halb'],
        hints: [bi('The coming hour, not the one that has passed.', 'Идващият час, не изминалият.')],
      },
      {
        prompt: bi('It is 8:15.', 'Часът е 8:15.'),
        scaffold: 'Es ist Viertel ___ acht.',
        answer: 'nach',
        shape: 'word',
        reviewTargets: ['v-viertel'],
        hints: [bi('A quarter *after* eight.', 'Четвърт СЛЕД осем.')],
      },
    ]),

    typeIt(
      'u5l3-ex3',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('What time is it?', 'Колко е часът?'),
          answer: 'Wie viel Uhr ist es?',
          alternatives: ['Wie spät ist es?'],
          reviewTargets: ['v-wie-viel-uhr-ist-es'],
          hints: [bi('Five words.', 'Пет думи.')],
        },
        {
          prompt: bi('It is nine o’clock.', 'Часът е девет.'),
          answer: 'Es ist neun Uhr.',
          reviewTargets: ['p-es-ist-uhr'],
          traps: [
            {
              answer: 'Es ist neun.',
              category: 'missing-word',
              feedback: bi(
                'German needs "Uhr" with a full hour: Es ist neun Uhr. Leaving it out sounds incomplete.',
                'Немският иска „Uhr“ при цял час: Es ist neun Uhr. Без нея звучи недовършено — за разлика от българското „Часът е девет“.',
              ),
            },
          ],
          hints: [bi('Four words. Do not drop the word for o’clock.', 'Четири думи. Не пропускай думата за „часа“.')],
        },
        {
          prompt: bi('It is 7:30.', 'Часът е седем и половина.'),
          answer: 'Es ist halb acht.',
          reviewTargets: ['v-halb'],
          traps: [
            {
              answer: 'Es ist halb sieben.',
              category: 'vocabulary',
              feedback: bi(
                'German counts forward to the coming hour, so 7:30 is "halb acht" — half way to eight. "halb sieben" would be 6:30.',
                'Немският брои напред към идващия час, затова 7:30 е „halb acht“ — половината до осем. „halb sieben“ би било 6:30.',
              ),
            },
          ],
          hints: [
            bi('Four words. Remember: one higher.', 'Четири думи. Помни: с едно по-високо.'),
            bi('Es ist halb ...', 'Es ist halb ...'),
          ],
        },
        {
          prompt: bi('I work at eight o’clock.', 'Работя в осем часа.'),
          answer: 'Ich arbeite um acht Uhr.',
          reviewTargets: ['v-um'],
          traps: [
            {
              answer: 'Ich arbeite am acht Uhr.',
              category: 'preposition',
              feedback: bi(
                'A clock time takes "um", not "am". am is for days, im for months, um for times.',
                'Точният час взима „um“, не „am“. am е за дни, im за месеци, um за часове.',
              ),
            },
          ],
          hints: [bi('Five words. Which preposition goes with a clock time?', 'Пет думи. Кой предлог отива с точен час?')],
        },
        {
          prompt: bi('It is quarter to ten.', 'Часът е десет без петнайсет.'),
          answer: 'Es ist Viertel vor zehn.',
          reviewTargets: ['v-viertel'],
          hints: [bi('A quarter *before* ten.', 'Четвърт ПРЕДИ десет.')],
        },
      ],
      ['g-telling-time', 'g-time-prepositions'],
    ),

    dictation('u5l3-ex4', bi('Listen and type the time', 'Слушай и напиши часа'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Es ist halb neun.',
        shape: 'sentence',
        reviewTargets: ['v-halb'],
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Es ist Viertel nach sechs.',
        shape: 'sentence',
        reviewTargets: ['v-viertel'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Wie viel Uhr ist es?',
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u5l3-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('What time is it?', 'Колко е часът?'),
          answer: 'Wie viel Uhr ist es?',
          alternatives: ['Wie spät ist es?'],
          hints: [],
        },
        {
          prompt: bi('It is ten o’clock.', 'Часът е десет.'),
          answer: 'Es ist zehn Uhr.',
          hints: [],
        },
        {
          prompt: bi('It is 8:30.', 'Часът е осем и половина.'),
          answer: 'Es ist halb neun.',
          hints: [],
        },
        {
          prompt: bi('I work at nine o’clock.', 'Работя в девет часа.'),
          answer: 'Ich arbeite um neun Uhr.',
          hints: [],
        },
      ]),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'You can now handle a calendar and a clock. The last unit pulls the grammar of the whole level together.',
        'Вече можеш да се справяш с календар и часовник. Последният раздел събира граматиката на цялото ниво.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u5-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u5',
  status: 'available',
  passAccuracy: 0.75,
  title: bi('Unit checkpoint: time', 'Контролна проверка: време'),
  description: bi(
    'Days, months, the clock and the three prepositions — plus the word order a time expression forces.',
    'Дни, месеци, часът и трите предлога — плюс словореда, който изразът за време налага.',
  ),
  exercises: [
    typeIt('cp-u5-1', bi('Days and months', 'Дни и месеци'), [
      { prompt: bi('Wednesday', 'сряда'), answer: 'Mittwoch', shape: 'word', hints: [] },
      { prompt: bi('March', 'март'), answer: 'März', shape: 'word', hints: [] },
      { prompt: bi('Sunday', 'неделя'), answer: 'Sonntag', shape: 'word', hints: [] },
    ]),
    exercise({
      id: 'cp-u5-2',
      kind: 'fillBlank',
      objective: bi('am, im or um?', 'am, im или um?'),
      steps: [
        {
          prompt: bi('on Friday', 'в петък'),
          scaffold: '___ Freitag',
          answer: 'am',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('in October', 'през октомври'),
          scaffold: '___ Oktober',
          answer: 'im',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('at seven o’clock', 'в седем часа'),
          scaffold: '___ sieben Uhr',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
      ],
    }),
    typeIt('cp-u5-3', bi('Full sentences', 'Цели изречения'), [
      {
        prompt: bi('On Monday I work.', 'В понеделник работя.'),
        answer: 'Am Montag arbeite ich.',
        alternatives: ['Ich arbeite am Montag.'],
        hints: [],
      },
      {
        prompt: bi('My birthday is in May.', 'През май имам рожден ден.'),
        answer: 'Im Mai habe ich Geburtstag.',
        alternatives: ['Ich habe im Mai Geburtstag.'],
        hints: [],
      },
      {
        prompt: bi('It is 7:30.', 'Часът е седем и половина.'),
        answer: 'Es ist halb acht.',
        hints: [],
      },
      {
        prompt: bi('I work at eight o’clock.', 'Работя в осем часа.'),
        answer: 'Ich arbeite um acht Uhr.',
        hints: [],
      },
    ]),
    dictation('cp-u5-4', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Am Wochenende bin ich zu Hause.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Es ist Viertel vor neun.',
        shape: 'sentence',
        hints: [],
      },
    ]),
    freeWriting('cp-u5-5', bi('Writing', 'Писане'), [
      {
        prompt: bi(
          'Write two sentences: one about a day you work, and one about when your birthday is.',
          'Напиши две изречения: едно за ден, в който работиш, и едно за това кога е рожденият ти ден.',
        ),
        answer: 'Am Montag arbeite ich. Im Mai habe ich Geburtstag.',
        shape: 'sentence',
        requiredTokens: ['Am', 'Im'],
        hints: [],
      },
    ]),
  ],
};

export const PRE_A1_UNIT_5: Unit = {
  id: 'pre-a1-u5',
  level: 'pre-a1',
  order: 5,
  status: 'available',
  title: bi('Time and calendar', 'Време и календар'),
  summary: bi(
    'Days, months and the clock — with the three prepositions German insists on and the half hour it counts forward.',
    'Дни, месеци и часът — с трите предлога, на които немският настоява, и половиния час, който брои напред.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const PRE_A1_U5_PATTERNS = PATTERNS;
