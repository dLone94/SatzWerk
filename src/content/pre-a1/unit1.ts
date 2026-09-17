import {
  articleRecall,
  bi,
  dictation,
  exercise,
  fillBlank,
  multipleChoice,
  nounWithArticle,
  typeIt,
} from '../authoring.ts';
import type { Checkpoint, Lesson, Unit } from '../types.ts';

/* ================================================================== *
 * Lesson 1 - German sounds and the four extra letters
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u1-l1',
  unitId: 'pre-a1-u1',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 12,
  title: bi('Sounds and four extra letters', 'Звуковете и четирите допълнителни букви'),
  objective: bi(
    'After this lesson you will be able to read German words aloud with the right sounds and type ä, ö, ü and ß correctly.',
    'След този урок ще можеш да четеш немски думи на глас с правилните звукове и да пишеш правилно ä, ö, ü и ß.',
  ),
  outcomes: [
    bi('I can pronounce ä, ö, ü and ß.', 'Мога да изговарям ä, ö, ü и ß.'),
    bi('I know that w sounds like v and s can sound like z.', 'Знам, че w се чете като в, а s може да звучи като з.'),
    bi('I can type the German special letters.', 'Мога да пиша немските специални букви.'),
  ],
  vocabIds: ['v-das-alphabet', 'v-der-buchstabe'],
  grammarIds: ['g-special-letters'],
  sections: [
    {
      id: 'u1l1-intro',
      kind: 'intro',
      title: bi('Why start here', 'Защо започваме оттук'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German spelling is remarkably honest. Once you know the letters, you can read almost any word aloud correctly, even one you have never seen. That is a real advantage, and it is worth ten minutes up front.',
            'Немският правопис е забележително честен. Щом научиш буквите, можеш да прочетеш на глас почти всяка дума правилно, дори непозната. Това е истинско предимство и си заслужава десет минути в началото.',
          ),
        },
        {
          t: 'p',
          only: ['en'],
          text: bi(
            'This is the opposite of English, where "though", "through" and "tough" all end differently. In German, what you see is what you say.',
            '',
          ),
        },
        {
          t: 'p',
          only: ['bg'],
          text: bi(
            '',
            'В това немският е близък до българския: пише се почти както се чете. Разликата е, че някои букви се четат другояче, отколкото очакваш от латиницата.',
          ),
        },
      ],
    },
    {
      id: 'u1l1-letters',
      kind: 'pronunciation',
      title: bi('The four extra letters', 'Четирите допълнителни букви'),
      blocks: [],
      grammarId: 'g-special-letters',
    },
    {
      id: 'u1l1-traps',
      kind: 'pronunciation',
      title: bi('Three letters that surprise everyone', 'Три букви, които изненадват всички'),
      blocks: [
        {
          t: 'table',
          headers: [bi('Letter', 'Буква'), bi('Sounds like', 'Звучи като'), bi('Example', 'Пример')],
          rows: [
            ['w', bi('English v', 'българско в'), 'wohnen — VOH-nen'],
            ['v', bi('English f', 'българско ф'), 'vier — FEER'],
            ['z', bi('ts', 'ц'), 'zwei — TSVY'],
            ['s', bi('z before a vowel', 'з пред гласна'), 'lesen — LAY-zen, sieben — ZEE-ben'],
            ['ei', bi('like "eye"', 'ай'), 'heißen — HY-sen'],
            ['ie', bi('like "ee"', 'и'), 'vier — FEER'],
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'The last two rows catch everyone: "ei" is said "eye", and "ie" is said "ee". So "heißen" begins like the English word "nice", and "vier" sounds like "fear".',
            'Последните два реда объркват всички: „ei“ се чете „ай“, а „ie“ се чете „и“. Значи „heißen“ е „хайсен“, а „vier“ е „фир“.',
          ),
        },
        { t: 'de', de: 'Ich heiße Teo.', gloss: bi('My name is Teo.', 'Казвам се Тео.'), audio: true },
        { t: 'de', de: 'Wir wohnen in Hamburg.', gloss: bi('We live in Hamburg.', 'Живеем в Хамбург.'), audio: true },
      ],
    },
    {
      id: 'u1l1-typing',
      kind: 'examples',
      title: bi('Typing the special letters', 'Как да пишеш специалните букви'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Every answer field in SatzWerk has ä ö ü ß buttons underneath it. Click one and it is inserted where your cursor is.',
            'Всяко поле за отговор в SatzWerk има бутони ä ö ü ß под себе си. Щракни върху бутон и буквата се вписва там, където е курсорът.',
          ),
        },
        {
          t: 'table',
          headers: [bi('If you type', 'Ако напишеш'), bi('Standard German', 'Стандартен немски')],
          rows: [
            ['ae', 'ä'],
            ['oe', 'ö'],
            ['ue', 'ü'],
            ['ss', 'ß'],
          ],
          caption: bi(
            'SatzWerk accepts the left column, then shows you the right one and asks you to retype it.',
            'SatzWerk приема лявата колона, после ти показва дясната и иска да я напишеш отново.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'That last row is a typing shortcut, not a spelling rule. German uses ss and ß for different sounds: ß after a long vowel (heißen, Maße) and ss after a short one (Masse). So "ss" is how you reach ß on a keyboard that has none — it does not mean the two are interchangeable.',
            'Последният ред е пряк път при писане, а не правописно правило. Немският използва ss и ß за различни звукове: ß след дълга гласна (heißen, Maße) и ss след кратка (Masse). Значи „ss“ е начин да стигнеш до ß на клавиатура без нея — не означава, че двете са взаимозаменяеми.',
          ),
        },
      ],
    },
    {
      id: 'u1l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('ä ö ü ß are separate letters with their own sounds.', 'ä ö ü ß са отделни букви със свои звукове.'),
            bi('w = v, v = f, z = ts, s between vowels = z.', 'w = в, v = ф, z = ц, s между гласни = з.'),
            bi('ei = "eye", ie = "ee".', 'ei = „ай“, ie = „и“.'),
            bi('You may type ae/oe/ue/ss, but standard spelling is the goal.', 'Можеш да пишеш ae/oe/ue/ss, но целта е стандартният правопис.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice(
      'u1l1-ex1',
      bi('First listening: hear the difference', 'Първо слушане: чуй разликата'),
      [
        {
          id: 'u1l1-ex1-s1',
          prompt: bi('Listen. Which word did you hear?', 'Слушай. Коя дума чу?'),
          audio: { text: 'die Töchter', hideText: true },
          choices: [
            { id: 'a', de: 'die Tochter', gloss: bi('the daughter', 'дъщерята') },
            { id: 'b', de: 'die Töchter', gloss: bi('the daughters', 'дъщерите') },
          ],
          correct: 'b',
          answer: 'die Töchter',
          shape: 'phrase',
          hints: [
            bi('Listen for the rounded lips on the first vowel.', 'Слушай за закръглените устни при първата гласна.'),
          ],
        },
        {
          id: 'u1l1-ex1-s2',
          prompt: bi('Listen. Which word did you hear?', 'Слушай. Коя дума чу?'),
          audio: { text: 'vier', hideText: true },
          choices: [
            { id: 'a', de: 'wir', gloss: bi('we', 'ние') },
            { id: 'b', de: 'vier', gloss: bi('four', 'четири') },
          ],
          correct: 'b',
          answer: 'vier',
          shape: 'word',
          hints: [bi('German v sounds like f.', 'Немското v звучи като ф.')],
        },
      ],
      'listenChoose',
    ),

    typeIt(
      'u1l1-ex2',
      bi('Write it in standard German spelling', 'Напиши го в стандартен немски правопис'),
      [
        {
          prompt: bi(
            'Rewrite with the proper German letter: heisse',
            'Напиши с правилната немска буква: heisse',
          ),
          answer: 'heiße',
          shape: 'word',
          hints: [
            bi('Replace ss with one letter.', 'Замени ss с една буква.'),
            bi('Use the ß button under the field.', 'Използвай бутона ß под полето.'),
          ],
        },
        {
          prompt: bi('Rewrite with the proper German letter: Tschuess', 'Напиши с правилната немска буква: Tschuess'),
          answer: 'Tschüss',
          shape: 'word',
          hints: [
            bi('ue becomes one letter, ss stays ss here.', 'ue става една буква, а ss тук остава ss.'),
          ],
        },
        {
          prompt: bi('Rewrite with the proper German letter: Toechter', 'Напиши с правилната немска буква: Toechter'),
          answer: 'Töchter',
          shape: 'word',
          reviewTargets: ['v-die-tochter'],
          hints: [bi('oe becomes ö.', 'oe става ö.')],
        },
        {
          prompt: bi('Rewrite with the proper German letter: gross', 'Напиши с правилната немска буква: gross'),
          answer: 'groß',
          shape: 'word',
          hints: [bi('It means "big".', 'Означава „голям“.')],
        },
      ],
      ['g-special-letters'],
    ),

    dictation('u1l1-ex3', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the word you hear.', 'Напиши думата, която чуваш.'),
        answer: 'das Haus',
        shape: 'phrase',
        reviewTargets: ['v-das-haus'],
        hints: [bi('It starts with "das".', 'Започва с „das“.')],
      },
      {
        instruction: bi('Type the word you hear.', 'Напиши думата, която чуваш.'),
        answer: 'die Städte',
        shape: 'phrase',
        reviewTargets: ['v-die-stadt'],
        hints: [bi('Plural of "die Stadt".', 'Множествено число на „die Stadt“.')],
      },
      {
        instruction: bi('Type the word you hear.', 'Напиши думата, която чуваш.'),
        answer: 'Tschüss',
        shape: 'word',
        reviewTargets: ['v-tschuess'],
        hints: [bi('An informal goodbye.', 'Неофициално сбогуване.')],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.67,
    exercises: [
      typeIt('u1l1-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('Write in standard German spelling: Staedte', 'Напиши в стандартен немски правопис: Staedte'),
          answer: 'Städte',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('Write in standard German spelling: heissen', 'Напиши в стандартен немски правопис: heissen'),
          answer: 'heißen',
          shape: 'word',
          hints: [],
        },
      ]),
      dictation('u1l1-m2', bi('Mastery check: listening', 'Проверка за усвояване: слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'das Buch',
          shape: 'phrase',
          hints: [],
        },
      ]),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'You can now read German letters correctly and type the four special ones. Next: why every German noun arrives with a small word in front of it.',
        'Вече можеш да четеш немските букви правилно и да пишеш четирите специални. Следва: защо всяко немско съществително идва с малка дума пред себе си.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 - Nouns, capital letters and der / die / das
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u1-l2',
  unitId: 'pre-a1-u1',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 18,
  title: bi('Nouns: capital letters and der / die / das', 'Съществителните: главни букви и der / die / das'),
  objective: bi(
    'After this lesson you will be able to write German nouns with a capital letter and give each one its article.',
    'След този урок ще можеш да пишеш немските съществителни с главна буква и да им даваш правилния член.',
  ),
  outcomes: [
    bi('I can write German nouns with a capital letter.', 'Мога да пиша немските съществителни с главна буква.'),
    bi('I can say der, die or das for the nouns in this lesson.', 'Мога да кажа der, die или das за съществителните в този урок.'),
    bi('I can build a short sentence with a noun and its article.', 'Мога да съставя кратко изречение със съществително и неговия член.'),
  ],
  vocabIds: [
    'v-das-haus',
    'v-der-tisch',
    'v-die-tochter',
    'v-der-sohn',
    'v-das-buch',
    'v-die-frau',
    'v-der-mann',
    'v-das-kind',
    'v-der-hund',
    'v-die-katze',
    'v-das-wasser',
    'v-das-maedchen',
  ],
  grammarIds: ['g-noun-capitals', 'g-articles', 'g-ein-eine'],
  sections: [
    {
      id: 'u1l2-intro',
      kind: 'intro',
      title: bi('The most useful habit in German', 'Най-полезният навик в немския'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'There is one habit that separates learners who make steady progress from learners who fight the language for years: always learn a noun together with its article.',
            'Има един навик, който отличава учащите с постоянен напредък от тези, които се борят с езика години: винаги учи съществителното заедно с члена му.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'Not "Haus" but "das Haus". Not "Tisch" but "der Tisch". It costs nothing extra at the start and saves you from a thousand small mistakes later.',
            'Не „Haus“, а „das Haus“. Не „Tisch“, а „der Tisch“. В началото не струва нищо допълнително, а по-късно ти спестява хиляда малки грешки.',
          ),
        },
      ],
    },
    {
      id: 'u1l2-capitals',
      kind: 'grammar',
      title: bi('Every noun gets a capital letter', 'Всяко съществително е с главна буква'),
      blocks: [],
      grammarId: 'g-noun-capitals',
    },
    {
      id: 'u1l2-articles',
      kind: 'grammar',
      title: bi('der, die, das', 'der, die, das'),
      blocks: [],
      grammarId: 'g-articles',
    },
    {
      id: 'u1l2-words',
      kind: 'vocabulary',
      title: bi('Your first twelve nouns', 'Първите ти дванайсет съществителни'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Listen to each one and read it aloud with the article attached. The article is part of the word.',
            'Изслушай всяко и го прочети на глас заедно с члена. Членът е част от думата.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Виж колко често родът не съвпада с българския: das Haus (къща — ж.р.), der Tisch (маса — ж.р.), das Buch (книга — ж.р.), der Hund (куче — ср.р.). Съвпадат: die Tochter, der Sohn, das Kind, die Katze.',
          ),
        },
      ],
      vocabIds: [
        'v-das-haus',
        'v-der-tisch',
        'v-die-tochter',
        'v-der-sohn',
        'v-das-buch',
        'v-die-frau',
        'v-der-mann',
        'v-das-kind',
        'v-der-hund',
        'v-die-katze',
        'v-das-wasser',
        'v-das-maedchen',
      ],
    },
    {
      id: 'u1l2-ein',
      kind: 'grammar',
      title: bi('ein and eine', 'ein и eine'),
      blocks: [],
      grammarId: 'g-ein-eine',
    },
    {
      id: 'u1l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('All nouns are capitalised, everywhere in the sentence.', 'Всички съществителни са с главна буква, навсякъде в изречението.'),
            bi('Three genders, three articles: der, die, das.', 'Три рода, три члена: der, die, das.'),
            bi('eine for feminine, ein for masculine and neuter.', 'eine за женски род, ein за мъжки и среден.'),
            bi('Learn every new noun as article + noun.', 'Учи всяко ново съществително като член + съществително.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice(
      'u1l2-ex1',
      bi('First exposure: which article?', 'Първо запознаване: кой член?'),
      [
        {
          prompt: bi('Which article goes with "Haus"?', 'Кой член отива с „Haus“?'),
          choices: [
            { id: 'a', de: 'der' },
            { id: 'b', de: 'die' },
            { id: 'c', de: 'das' },
          ],
          correct: 'c',
          answer: 'das',
          shape: 'word',
          reviewTargets: ['v-das-haus'],
          hints: [],
        },
        {
          prompt: bi('Which article goes with "Katze"?', 'Кой член отива с „Katze“?'),
          choices: [
            { id: 'a', de: 'der' },
            { id: 'b', de: 'die' },
            { id: 'c', de: 'das' },
          ],
          correct: 'b',
          answer: 'die',
          shape: 'word',
          reviewTargets: ['v-die-katze'],
          hints: [],
        },
      ],
    ),

    articleRecall('u1l2-ex2', bi('Now recall the article yourself', 'Сега си припомни члена сам'), [
      { noun: 'Tisch', article: 'der', vocabId: 'v-der-tisch', gloss: bi('the table', 'масата') },
      { noun: 'Haus', article: 'das', vocabId: 'v-das-haus', gloss: bi('the house', 'къщата') },
      { noun: 'Tochter', article: 'die', vocabId: 'v-die-tochter', gloss: bi('the daughter', 'дъщерята') },
      { noun: 'Hund', article: 'der', vocabId: 'v-der-hund', gloss: bi('the dog', 'кучето') },
      { noun: 'Buch', article: 'das', vocabId: 'v-das-buch', gloss: bi('the book', 'книгата') },
      { noun: 'Mädchen', article: 'das', vocabId: 'v-das-maedchen', gloss: bi('the girl', 'момичето') },
    ]),

    nounWithArticle('u1l2-ex3', bi('Word, then word with article', 'Дума, после дума с член'), [
      {
        prompt: bi('dog', 'куче'),
        bare: 'Hund',
        withArticle: 'der Hund',
        vocabId: 'v-der-hund',
        hint: bi('Masculine in German.', 'В немския е от мъжки род.'),
      },
      {
        prompt: bi('daughter', 'дъщеря'),
        bare: 'Tochter',
        withArticle: 'die Tochter',
        vocabId: 'v-die-tochter',
        hint: bi('Feminine, as you would expect.', 'От женски род, както и очакваш.'),
      },
      {
        prompt: bi('table', 'маса'),
        bare: 'Tisch',
        withArticle: 'der Tisch',
        vocabId: 'v-der-tisch',
        hint: bi('Masculine in German.', 'В немския е от мъжки род, въпреки че „маса“ е от женски.'),
      },
      {
        prompt: bi('water', 'вода'),
        bare: 'Wasser',
        withArticle: 'das Wasser',
        vocabId: 'v-das-wasser',
        hint: bi('Neuter in German.', 'В немския е от среден род.'),
      },
    ]),

    fillBlank('u1l2-ex4', bi('Complete the sentence', 'Довърши изречението'), [
      {
        prompt: bi('The child is three years old.', 'Детето е на три години.'),
        scaffold: '___ Kind ist drei Jahre alt.',
        answer: 'Das',
        shape: 'word',
        reviewTargets: ['v-das-kind'],
        hints: [bi('Kind is neuter.', 'Kind е от среден род.')],
      },
      {
        prompt: bi('I have a daughter.', 'Имам една дъщеря.'),
        scaffold: 'Ich habe ___ Tochter.',
        answer: 'eine',
        shape: 'word',
        reviewTargets: ['v-die-tochter'],
        hints: [
          bi('Tochter is feminine, so the indefinite article takes an -e.', 'Tochter е от женски род, затова неопределителният член взима -e.'),
        ],
      },
    ]),

    typeIt(
      'u1l2-ex5',
      bi('Full sentences with an article', 'Цели изречения с член'),
      [
        {
          prompt: bi('The table is big.', 'Масата е голяма.'),
          answer: 'Der Tisch ist groß.',
          reviewTargets: ['v-der-tisch'],
          traps: [
            {
              answer: 'Die Tisch ist groß.',
              category: 'gender',
              feedback: bi(
                '"Tisch" is masculine in German, even though the word for table is feminine in many other languages: der Tisch.',
                '„Tisch“ е от мъжки род в немския, въпреки че „маса“ е от женски род в българския: der Tisch.',
              ),
            },
            {
              answer: 'Der tisch ist groß.',
              category: 'capitalization',
              feedback: bi(
                'German writes every noun with a capital letter, so it is "Tisch", not "tisch".',
                'В немския всяко съществително се пише с главна буква, така че е „Tisch“, не „tisch“.',
              ),
            },
          ],
          hints: [
            bi('Start with the article for Tisch.', 'Започни с члена за Tisch.'),
            bi('Der Tisch ist ...', 'Der Tisch ist ...'),
          ],
        },
        {
          prompt: bi('The house is big.', 'Къщата е голяма.'),
          answer: 'Das Haus ist groß.',
          reviewTargets: ['v-das-haus'],
          traps: [
            {
              answer: 'Die Haus ist groß.',
              category: 'gender',
              feedback: bi(
                '"Haus" is neuter: das Haus. The article does not follow the meaning of the word.',
                '„Haus“ е от среден род: das Haus. Членът не следва значението на думата, а рода в немския.',
              ),
            },
          ],
          hints: [bi('Haus is neuter.', 'Haus е от среден род.')],
        },
        {
          prompt: bi('The dog is small.', 'Кучето е малко.'),
          answer: 'Der Hund ist klein.',
          reviewTargets: ['v-der-hund'],
          hints: [bi('Hund is masculine.', 'Hund е от мъжки род.')],
        },
      ],
      ['g-articles', 'g-noun-capitals'],
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      articleRecall('u1l2-m1', bi('Mastery check: articles', 'Проверка: членове'), [
        { noun: 'Frau', article: 'die', vocabId: 'v-die-frau', gloss: bi('the woman', 'жената') },
        { noun: 'Sohn', article: 'der', vocabId: 'v-der-sohn', gloss: bi('the son', 'синът') },
        { noun: 'Wasser', article: 'das', vocabId: 'v-das-wasser', gloss: bi('the water', 'водата') },
      ]),
      exercise({
        id: 'u1l2-m2',
        kind: 'type',
        objective: bi('Mastery check: full noun', 'Проверка: цяло съществително'),
        steps: [
          {
            prompt: bi('the cat', 'котка'),
            instruction: bi('Write the noun with its article.', 'Напиши съществителното с члена.'),
            answer: 'die Katze',
            shape: 'phrase',
            reviewTargets: ['v-die-katze'],
            hints: [],
          },
        ],
      }),
      typeIt('u1l2-m3', bi('Mastery check: a full sentence', 'Проверка: цяло изречение'), [
        {
          prompt: bi('The book is new.', 'Книгата е нова.'),
          answer: 'Das Buch ist neu.',
          reviewTargets: ['v-das-buch'],
          hints: [],
        },
      ]),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'From here on, SatzWerk will usually ask you for "die Tochter" rather than "Tochter". That is on purpose.',
        'Оттук насетне SatzWerk обикновено ще иска от теб „die Tochter“, а не само „Tochter“. Това е нарочно.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u1-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u1',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Unit checkpoint: letters and articles', 'Контролна проверка: букви и членове'),
  description: bi(
    'The special letters and the article that belongs to each noun — spelled, heard and produced.',
    'Специалните букви и членът, който принадлежи на всяко съществително — написани, чути и произведени.',
  ),
  exercises: [
    typeIt('cp-u1-1', bi('Standard spelling', 'Стандартен правопис'), [
      {
        prompt: bi('Write in standard German spelling: Toechter', 'Напиши в стандартен немски правопис: Toechter'),
        answer: 'T\u00f6chter',
        shape: 'word',
        hints: [],
      },
      {
        prompt: bi('Write in standard German spelling: gross', 'Напиши в стандартен немски правопис: gross'),
        answer: 'gro\u00df',
        shape: 'word',
        hints: [],
      },
      {
        prompt: bi('Write in standard German spelling: Staedte', 'Напиши в стандартен немски правопис: Staedte'),
        answer: 'St\u00e4dte',
        shape: 'word',
        hints: [],
      },
    ]),
    articleRecall('cp-u1-2', bi('Which article?', 'Кой член?'), [
      { noun: 'Tisch', article: 'der', vocabId: 'v-der-tisch', gloss: bi('the table', 'масата') },
      { noun: 'Haus', article: 'das', vocabId: 'v-das-haus', gloss: bi('the house', 'къщата') },
      { noun: 'Katze', article: 'die', vocabId: 'v-die-katze', gloss: bi('the cat', 'котката') },
      { noun: 'M\u00e4dchen', article: 'das', vocabId: 'v-das-maedchen', gloss: bi('the girl', 'момичето') },
    ]),
    typeIt('cp-u1-3', bi('Nouns with their article', 'Съществителни с члена'), [
      {
        prompt: bi('the daughter', 'дъщеря'),
        instruction: bi('With the article.', 'С члена.'),
        answer: 'die Tochter',
        shape: 'phrase',
        hints: [],
      },
      {
        prompt: bi('the dog', 'куче'),
        instruction: bi('With the article.', 'С члена.'),
        answer: 'der Hund',
        shape: 'phrase',
        hints: [],
      },
    ]),
    typeIt('cp-u1-4', bi('A full sentence', 'Цяло изречение'), [
      {
        prompt: bi('The table is big.', 'Масата е голяма.'),
        answer: 'Der Tisch ist gro\u00df.',
        hints: [],
      },
      {
        prompt: bi('The book is new.', 'Книгата е нова.'),
        answer: 'Das Buch ist neu.',
        hints: [],
      },
    ]),
    dictation('cp-u1-5', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'das Wasser',
        shape: 'phrase',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'die H\u00e4user',
        shape: 'phrase',
        hints: [],
      },
    ]),
  ],
};

export const PRE_A1_UNIT_1: Unit = {
  id: 'pre-a1-u1',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  title: bi('Welcome to German', 'Добре дошъл в немския'),
  summary: bi(
    'The sounds, the letters, and the one habit that makes everything later easier: learning nouns with their article.',
    'Звуковете, буквите и онзи навик, който прави всичко по-нататък по-лесно: да учиш съществителните с члена им.',
  ),
  lessons: [lesson1, lesson2],
  checkpoint,
};
