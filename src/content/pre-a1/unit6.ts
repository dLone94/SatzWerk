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
    id: 'p-ich-habe-kein',
    template: 'Ich habe kein___ ___.',
    example: 'Ich habe keine Schwester.',
    gloss: bi('I do not have a ___.', 'Нямам ___.'),
    level: 'pre-a1',
    grammarIds: ['g-negation'],
  },
  {
    id: 'p-wohnst-du-hier',
    template: '___ du ___?',
    example: 'Wohnst du hier?',
    gloss: bi('Do you ___?', '___ ли?'),
    level: 'pre-a1',
    grammarIds: ['g-questions'],
  },
];

/* ================================================================== *
 * Lesson 1 - All the pronouns
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u6-l1',
  unitId: 'pre-a1-u6',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('All the pronouns, sein and haben', 'Всички местоимения, sein и haben'),
  objective: bi(
    'After this lesson you will be able to use all nine German pronouns with sein and haben, and choose correctly between du, ihr and Sie.',
    'След този урок ще можеш да използваш всичките девет немски местоимения с sein и haben и да избираш правилно между du, ihr и Sie.',
  ),
  outcomes: [
    bi('I can use all nine pronouns.', 'Мога да използвам всичките девет местоимения.'),
    bi('I can conjugate sein and haben without thinking.', 'Мога да спрягам sein и haben без да мисля.'),
    bi('I can choose between du, ihr and Sie.', 'Мога да избирам между du, ihr и Sie.'),
    bi('I know that er, sie and es follow the article, not the meaning.', 'Знам, че er, sie и es следват члена, не значението.'),
  ],
  vocabIds: ['v-wir', 'v-ihr', 'v-er', 'v-es', 'v-sein-verb', 'v-haben'],
  grammarIds: ['g-pronoun-table', 'g-du-sie', 'g-sein'],
  sections: [
    {
      id: 'u6l1-intro',
      kind: 'intro',
      title: bi('Collecting what you already use', 'Да съберем това, което вече използваш'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You have been using these pronouns since Unit 2 without seeing them all in one place. This unit collects the grammar of the whole level so it becomes something you can rely on rather than something you half remember.',
            'Използваш тези местоимения от раздел 2, без да си ги виждал събрани на едно място. Този раздел събира граматиката на цялото ниво, за да стане нещо, на което разчиташ, а не нещо, което помниш наполовина.',
          ),
        },
      ],
    },
    {
      id: 'u6l1-table',
      kind: 'grammar',
      title: bi('The full table', 'Пълната таблица'),
      blocks: [],
      grammarId: 'g-pronoun-table',
    },
    {
      id: 'u6l1-ersies',
      kind: 'grammar',
      title: bi('er, sie, es follow the article', 'er, sie, es следват члена'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This is the part that surprises people. In German, "it" is not a separate category. A thing takes the pronoun that matches its article.',
            'Това е частта, която изненадва хората. В немския „то“ не е отделна категория. Предметът взима местоимението, което съответства на члена му.',
          ),
        },
        {
          t: 'table',
          headers: [bi('Noun', 'Съществително'), bi('Pronoun', 'Местоимение'), bi('Example', 'Пример')],
          rows: [
            ['der Tisch', 'er', 'Er ist groß.'],
            ['die Stadt', 'sie', 'Sie ist schön.'],
            ['das Haus', 'es', 'Es ist alt.'],
          ],
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Тук българският ти помага повече, отколкото очакваш! Българският прави точно същото: „масата… тя е голяма“, „градът… той е красив“. Проблемът е само че родовете не съвпадат: der Tisch е „той“ на немски, а „маса“ е „тя“ на български. Затова местоимението се избира по немския член, не по българския род.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['en'],
          text: bi(
            'English has one word, "it", for every object. German has three, and which one you use depends purely on the article you learnt with the noun. A table is "er" — calling it "es" is a grammar mistake, not a stylistic choice.',
            '',
          ),
        },
      ],
    },
    {
      id: 'u6l1-dusie',
      kind: 'grammar',
      title: bi('du, ihr or Sie?', 'du, ihr или Sie?'),
      blocks: [],
      grammarId: 'g-du-sie',
    },
    {
      id: 'u6l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Nine pronouns, three of which mean "you".', 'Девет местоимения, три от които значат „ти/вие“.'),
            bi('wir, sie and Sie always share the same verb form.', 'wir, sie и Sie винаги имат същата глаголна форма.'),
            bi('er/sie/es follow the article of the noun.', 'er/sie/es следват члена на съществителното.'),
            bi('Only formal Sie is capitalised.', 'Само учтивото Sie се пише с главна буква.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    conjugate(
      'u6l1-ex1',
      'sein',
      bi('Conjugate sein', 'Спрегни sein'),
      ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'],
      ['v-sein-verb'],
    ),

    conjugate(
      'u6l1-ex2',
      'haben',
      bi('Conjugate haben', 'Спрегни haben'),
      ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
      ['v-haben'],
    ),

    fillBlank('u6l1-ex3', bi('Which pronoun?', 'Кое местоимение?'), [
      {
        prompt: bi('The table is new. It is big.', 'Масата е нова. Тя е голяма.'),
        scaffold: 'Der Tisch ist neu. ___ ist groß.',
        answer: 'Er',
        shape: 'word',
        reviewTargets: ['v-er', 'v-der-tisch'],
        hints: [bi('Tisch takes der, so the pronoun is er.', 'Tisch взима der, затова местоимението е er.')],
      },
      {
        prompt: bi('The house is old. It is big.', 'Къщата е стара. Тя е голяма.'),
        scaffold: 'Das Haus ist alt. ___ ist groß.',
        answer: 'Es',
        shape: 'word',
        reviewTargets: ['v-es', 'v-das-haus'],
        hints: [bi('Haus takes das.', 'Haus взима das.')],
      },
      {
        prompt: bi('We live in Hamburg.', 'Живеем в Хамбург.'),
        scaffold: '___ wohnen in Hamburg.',
        answer: 'Wir',
        shape: 'word',
        reviewTargets: ['v-wir'],
        hints: [],
      },
      {
        prompt: bi('Where do you (all) live?', 'Къде живеете?'),
        scaffold: 'Wo wohnt ___?',
        answer: 'ihr',
        shape: 'word',
        reviewTargets: ['v-ihr'],
        hints: [bi('Informal, to several people.', 'Неофициално, към няколко човека.')],
      },
    ]),

    typeIt(
      'u6l1-ex4',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('We are from Bulgaria.', 'Ние сме от България.'),
          answer: 'Wir kommen aus Bulgarien.',
          reviewTargets: ['v-wir'],
          traps: [
            {
              answer: 'Wir kommt aus Bulgarien.',
              category: 'verb-conjugation',
              feedback: bi(
                'With "wir" the verb keeps the infinitive form: wir kommen. "kommt" is for er/sie/es and ihr.',
                'С „wir“ глаголът запазва формата на инфинитива: wir kommen. „kommt“ е за er/sie/es и ihr.',
              ),
            },
          ],
          hints: [bi('Four words. wir takes the -en form.', 'Четири думи. wir взима формата на -en.')],
        },
        {
          prompt: bi('You (all) are teachers.', 'Вие сте учители.'),
          answer: 'Ihr seid Lehrer.',
          reviewTargets: ['v-ihr', 'v-der-lehrer'],
          traps: [
            {
              answer: 'Ihr sind Lehrer.',
              category: 'verb-conjugation',
              feedback: bi(
                '"ihr" has its own form of sein: ihr seid. "sind" belongs to wir, sie and Sie.',
                '„ihr“ има собствена форма на sein: ihr seid. „sind“ е за wir, sie и Sie.',
              ),
            },
          ],
          hints: [bi('The ihr form of sein is the odd one out.', 'Формата за ihr на sein е особената.')],
        },
        {
          prompt: bi('Do you have a brother? (formal)', 'Имате ли брат? (учтиво)'),
          answer: 'Haben Sie einen Bruder?',
          reviewTargets: ['v-haben', 'v-der-bruder'],
          traps: [
            {
              answer: 'Haben sie einen Bruder?',
              category: 'pronoun',
              feedback: bi(
                'Formal "you" is written with a capital S: Sie. With a small s, "sie" means they — you would be asking about other people.',
                'Учтивото „Вие“ се пише с главно S: Sie. С малко s „sie“ значи „те“ — значи би питал за други хора.',
              ),
            },
          ],
          hints: [bi('Yes/no question, formal. Watch the capital letter.', 'Въпрос с да/не, учтиво. Внимавай с главната буква.')],
        },
        {
          prompt: bi('She is a doctor and he is a teacher.', 'Тя е лекарка, а той е учител.'),
          answer: 'Sie ist Ärztin und er ist Lehrer.',
          reviewTargets: ['v-die-aerztin', 'v-der-lehrer'],
          hints: [bi('Seven words. No articles with the professions.', 'Седем думи. Без членове при професиите.')],
        },
      ],
      ['g-pronoun-table'],
    ),

    multipleChoice('u6l1-ex5', bi('du, ihr or Sie?', 'du, ihr или Sie?'), [
      {
        prompt: bi(
          'You are talking to two friends. Which form do you use?',
          'Говориш с двама приятели. Коя форма използваш?',
        ),
        choices: [
          { id: 'a', de: 'du', gloss: bi('one person, informal', 'един човек, неофициално') },
          { id: 'b', de: 'ihr', gloss: bi('several people, informal', 'няколко човека, неофициално') },
          { id: 'c', de: 'Sie', gloss: bi('formal', 'учтиво') },
        ],
        correct: 'b',
        answer: 'ihr',
        shape: 'word',
        reviewTargets: ['v-ihr'],
        hints: [],
      },
      {
        prompt: bi(
          'You are at the Bürgeramt talking to an official. Which form?',
          'В Bürgeramt говориш със служител. Коя форма?',
        ),
        choices: [
          { id: 'a', de: 'du', gloss: bi('informal', 'неофициално') },
          { id: 'b', de: 'Sie', gloss: bi('formal', 'учтиво') },
        ],
        correct: 'b',
        answer: 'Sie',
        shape: 'word',
        hints: [],
      },
    ]),

    dictation('u6l1-ex6', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Wir haben zwei Kinder.',
        shape: 'sentence',
        reviewTargets: ['v-wir', 'v-haben'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Wo wohnt ihr?',
        shape: 'sentence',
        reviewTargets: ['v-ihr'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      exercise({
        id: 'u6l1-m1',
        kind: 'conjugation',
        objective: bi('Mastery check: verb forms', 'Проверка: глаголни форми'),
        mandatoryRetype: false,
        steps: [
          { prompt: bi('ihr — sein', 'ihr — sein'), scaffold: 'ihr ___', answer: 'seid', shape: 'word', hints: [] },
          { prompt: bi('wir — haben', 'wir — haben'), scaffold: 'wir ___', answer: 'haben', shape: 'word', hints: [] },
          { prompt: bi('er — sein', 'er — sein'), scaffold: 'er ___', answer: 'ist', shape: 'word', hints: [] },
        ],
      }),
      typeIt('u6l1-m2', bi('Mastery check: sentences', 'Проверка: изречения'), [
        {
          prompt: bi('We are from Bulgaria.', 'Ние сме от България.'),
          answer: 'Wir kommen aus Bulgarien.',
          hints: [],
        },
        {
          prompt: bi('Do you have a brother? (formal)', 'Имате ли брат? (учтиво)'),
          answer: 'Haben Sie einen Bruder?',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 - Plurals and saying no
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u6-l2',
  unitId: 'pre-a1-u6',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Plurals and saying no', 'Множествено число и отрицание'),
  objective: bi(
    'After this lesson you will be able to form the plural of the nouns you know and negate a sentence with nicht or kein.',
    'След този урок ще можеш да образуваш множествено число на познатите съществителни и да отричаш изречение с nicht или kein.',
  ),
  outcomes: [
    bi('I can use the plural of the nouns in this level.', 'Мога да използвам множественото число на съществителните от това ниво.'),
    bi('I know that every plural takes die.', 'Знам, че всяко множествено число взима die.'),
    bi('I can choose between nicht and kein.', 'Мога да избирам между nicht и kein.'),
    bi('I can put nicht in the right place.', 'Мога да поставя nicht на правилното място.'),
  ],
  vocabIds: ['v-nicht', 'v-kein'],
  grammarIds: ['g-plurals', 'g-negation'],
  patterns: [PATTERNS[0]!],
  sections: [
    {
      id: 'u6l2-plurals',
      kind: 'grammar',
      title: bi('Forming the plural', 'Образуване на множествено число'),
      blocks: [],
      grammarId: 'g-plurals',
    },
    {
      id: 'u6l2-plural-review',
      kind: 'vocabulary',
      title: bi('Plurals you already know', 'Множествени числа, които вече знаеш'),
      blocks: [
        {
          t: 'table',
          headers: [bi('Singular', 'Единствено'), bi('Plural', 'Множествено')],
          rows: [
            ['der Tisch', 'die Tische'],
            ['das Haus', 'die Häuser'],
            ['die Tochter', 'die Töchter'],
            ['der Bruder', 'die Brüder'],
            ['die Mutter', 'die Mütter'],
            ['das Kind', 'die Kinder'],
            ['die Frau', 'die Frauen'],
            ['das Mädchen', 'die Mädchen'],
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Notice how many of these use the umlaut. When a plural changes its vowel, that vowel change is the plural — forget the dots and you have said the singular.',
            'Забележи колко от тези използват умлаут. Когато множественото мени гласната, точно тази промяна е множественото — забравиш ли точките, си казал единственото число.',
          ),
        },
      ],
    },
    {
      id: 'u6l2-negation',
      kind: 'grammar',
      title: bi('nicht and kein', 'nicht и kein'),
      blocks: [],
      grammarId: 'g-negation',
    },
    {
      id: 'u6l2-examples',
      kind: 'examples',
      title: bi('In use', 'В употреба'),
      blocks: [
        { t: 'de', de: 'Ich habe keine Geschwister.', gloss: bi('I have no brothers or sisters.', 'Нямам братя и сестри.'), audio: true },
        { t: 'de', de: 'Ich wohne nicht in Berlin.', gloss: bi('I do not live in Berlin.', 'Не живея в Берлин.'), audio: true },
        { t: 'de', de: 'Er ist kein Lehrer.', gloss: bi('He is not a teacher.', 'Той не е учител.'), audio: true },
        { t: 'de', de: 'Das ist nicht groß.', gloss: bi('That is not big.', 'Това не е голямо.'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Look at the third one. Professions take no article, but negating one still needs "kein", because you are cancelling a noun.',
            'Погледни третото. Професиите са без член, но отричането им пак иска „kein“, защото отричаш съществително.',
          ),
        },
      ],
    },
    {
      id: 'u6l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Every plural takes die, whatever the gender.', 'Всяко множествено число взима die, независимо от рода.'),
            bi('The plural ending is learnt with the word.', 'Окончанието за множествено се учи заедно с думата.'),
            bi('kein negates a noun; nicht negates everything else.', 'kein отрича съществително; nicht отрича всичко останало.'),
            bi('nicht comes after the verb, not before it.', 'nicht идва след глагола, не преди него.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    nounWithArticle('u6l2-ex1', bi('Give the plural', 'Дай множественото число'), [
      {
        prompt: bi('tables (more than one)', 'маси (повече от една)'),
        bare: 'Tische',
        withArticle: 'die Tische',
        vocabId: 'v-der-tisch',
        hint: bi('Every plural takes die.', 'Всяко множествено взима die.'),
      },
      {
        prompt: bi('houses', 'къщи'),
        bare: 'Häuser',
        withArticle: 'die Häuser',
        vocabId: 'v-das-haus',
        hint: bi('The vowel changes and -er is added.', 'Гласната се мени и се добавя -er.'),
      },
      {
        prompt: bi('daughters', 'дъщери'),
        bare: 'Töchter',
        withArticle: 'die Töchter',
        vocabId: 'v-die-tochter',
        hint: bi('Only the vowel changes.', 'Мени се само гласната.'),
      },
      {
        prompt: bi('children', 'деца'),
        bare: 'Kinder',
        withArticle: 'die Kinder',
        vocabId: 'v-das-kind',
        hint: bi('-er is added, no umlaut.', 'Добавя се -er, без умлаут.'),
      },
    ]),

    multipleChoice('u6l2-ex2', bi('nicht or kein?', 'nicht или kein?'), [
      {
        prompt: bi('"I do not live in Berlin." Which word negates it?', '„Не живея в Берлин.“ Коя дума отрича?'),
        choices: [
          { id: 'a', de: 'nicht', gloss: bi('negates a verb or a place', 'отрича глагол или място') },
          { id: 'b', de: 'kein', gloss: bi('negates a noun', 'отрича съществително') },
        ],
        correct: 'a',
        answer: 'nicht',
        shape: 'word',
        reviewTargets: ['v-nicht'],
        hints: [],
      },
      {
        prompt: bi('"I have no sister." Which word negates it?', '„Нямам сестра.“ Коя дума отрича?'),
        choices: [
          { id: 'a', de: 'nicht', gloss: bi('negates a verb', 'отрича глагол') },
          { id: 'b', de: 'kein', gloss: bi('negates a noun', 'отрича съществително') },
        ],
        correct: 'b',
        answer: 'kein',
        shape: 'word',
        reviewTargets: ['v-kein'],
        hints: [],
      },
    ]),

    fillBlank('u6l2-ex3', bi('Complete the negation', 'Довърши отрицанието'), [
      {
        prompt: bi('I do not have a sister.', 'Нямам сестра.'),
        scaffold: 'Ich habe ___ Schwester.',
        answer: 'keine',
        shape: 'word',
        reviewTargets: ['v-kein', 'p-ich-habe-kein'],
        hints: [bi('Schwester is feminine.', 'Schwester е от женски род.')],
      },
      {
        prompt: bi('I do not have a brother.', 'Нямам брат.'),
        scaffold: 'Ich habe ___ Bruder.',
        answer: 'keinen',
        shape: 'word',
        reviewTargets: ['v-kein', 'v-der-bruder'],
        hints: [bi('Masculine, and it is the object of haben.', 'Мъжки род и е допълнение на haben.')],
      },
      {
        prompt: bi('I do not work on Monday.', 'В понеделник не работя.'),
        scaffold: 'Am Montag arbeite ich ___.',
        answer: 'nicht',
        shape: 'word',
        reviewTargets: ['v-nicht'],
        hints: [bi('It negates the verb, and it goes at the end here.', 'Отрича глагола и тук застава накрая.')],
      },
    ]),

    typeIt(
      'u6l2-ex4',
      bi('Full production: saying no', 'Пълно производство: отрицание'),
      [
        {
          prompt: bi('I do not have a sister.', 'Нямам сестра.'),
          answer: 'Ich habe keine Schwester.',
          reviewTargets: ['p-ich-habe-kein', 'v-kein'],
          traps: [
            {
              answer: 'Ich habe nicht eine Schwester.',
              category: 'vocabulary',
              feedback: bi(
                'To cancel a noun German uses "kein", not "nicht ein": Ich habe keine Schwester.',
                'За да отрече съществително, немският използва „kein“, а не „nicht ein“: Ich habe keine Schwester.',
              ),
            },
            {
              answer: 'Ich habe kein Schwester.',
              category: 'gender',
              feedback: bi(
                '"Schwester" is feminine, so kein takes an -e: keine Schwester. kein follows exactly the same endings as ein.',
                '„Schwester“ е от женски род, затова kein взима -e: keine Schwester. kein следва точно същите окончания като ein.',
              ),
            },
          ],
          hints: [
            bi('Four words. Which negation word cancels a noun?', 'Четири думи. Коя отрицателна дума отрича съществително?'),
            bi('Ich habe ...', 'Ich habe ...'),
          ],
        },
        {
          prompt: bi('I do not live in Berlin.', 'Не живея в Берлин.'),
          answer: 'Ich wohne nicht in Berlin.',
          reviewTargets: ['v-nicht'],
          traps: [
            {
              answer: 'Ich nicht wohne in Berlin.',
              category: 'word-order',
              feedback: bi(
                'In German "nicht" goes after the verb, not before it: Ich wohne nicht in Berlin.',
                'В немския „nicht“ застава след глагола, не преди него: Ich wohne nicht in Berlin. Българското „не“ стои преди глагола — немското не.',
              ),
            },
          ],
          hints: [
            bi('Five words. Where does nicht go?', 'Пет думи. Къде застава nicht?'),
            bi('Ich wohne ...', 'Ich wohne ...'),
          ],
        },
        {
          prompt: bi('He is not a teacher.', 'Той не е учител.'),
          answer: 'Er ist kein Lehrer.',
          reviewTargets: ['v-kein', 'v-der-lehrer'],
          hints: [bi('Lehrer is a noun, so which word do you need?', 'Lehrer е съществително, значи коя дума ти трябва?')],
        },
        {
          prompt: bi('I do not have children.', 'Нямам деца.'),
          answer: 'Ich habe keine Kinder.',
          reviewTargets: ['v-das-kind'],
          hints: [bi('Plural takes keine.', 'Множественото взима keine.')],
        },
        {
          prompt: bi('I have two daughters.', 'Имам две дъщери.'),
          answer: 'Ich habe zwei Töchter.',
          reviewTargets: ['v-die-tochter'],
          traps: [
            {
              answer: 'Ich habe zwei Tochter.',
              category: 'plural',
              feedback: bi(
                'With "zwei" you need the plural, and the plural of die Tochter changes its vowel: die Töchter.',
                'С „zwei“ трябва множествено число, а множественото на die Tochter мени гласната: die Töchter.',
              ),
            },
          ],
          hints: [bi('The plural needs an umlaut.', 'Множественото иска умлаут.')],
        },
      ],
      ['g-negation', 'g-plurals'],
    ),

    partialRecall('u6l2-ex5', bi('Partial recall', 'Частично припомняне'), [
      {
        prompt: bi('brothers', 'братя'),
        scaffold: 'die Br___',
        answer: 'Brüder',
        shape: 'word',
        reviewTargets: ['v-der-bruder'],
        hints: [],
      },
      {
        prompt: bi('mothers', 'майки'),
        scaffold: 'die M___',
        answer: 'Mütter',
        shape: 'word',
        reviewTargets: ['v-die-mutter'],
        hints: [],
      },
    ]),

    dictation('u6l2-ex6', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich habe keine Geschwister.',
        shape: 'sentence',
        reviewTargets: ['v-kein'],
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich arbeite nicht am Sonntag.',
        shape: 'sentence',
        reviewTargets: ['v-nicht'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u6l2-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('I do not have a brother.', 'Нямам брат.'),
          answer: 'Ich habe keinen Bruder.',
          hints: [],
        },
        {
          prompt: bi('I do not live in Berlin.', 'Не живея в Берлин.'),
          answer: 'Ich wohne nicht in Berlin.',
          hints: [],
        },
        {
          prompt: bi('I have two daughters.', 'Имам две дъщери.'),
          answer: 'Ich habe zwei Töchter.',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 - Asking questions
 * ================================================================== */

const lesson3: Lesson = {
  id: 'pre-a1-u6-l3',
  unitId: 'pre-a1-u6',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Asking questions', 'Да задаваш въпроси'),
  objective: bi(
    'After this lesson you will be able to build both kinds of German question and use all the question words from this level.',
    'След този урок ще можеш да изграждаш и двата вида немски въпрос и да използваш всички въпросителни думи от това ниво.',
  ),
  outcomes: [
    bi('I can turn a statement into a yes/no question.', 'Мога да превърна съобщително изречение във въпрос с да/не.'),
    bi('I can use wer, was, wo, woher, wann, wie, warum and wie viel.', 'Мога да използвам wer, was, wo, woher, wann, wie, warum и wie viel.'),
    bi('I can keep the verb in second position in a W-question.', 'Мога да държа глагола на второ място при въпрос с W.'),
    bi('I can hold a short exchange of questions and answers.', 'Мога да проведа кратък разговор с въпроси и отговори.'),
  ],
  vocabIds: ['v-wer', 'v-was', 'v-warum', 'v-machen'],
  grammarIds: ['g-questions', 'g-verb-second'],
  patterns: [PATTERNS[1]!],
  sections: [
    {
      id: 'u6l3-grammar',
      kind: 'grammar',
      title: bi('Two shapes of question', 'Два вида въпрос'),
      blocks: [],
      grammarId: 'g-questions',
    },
    {
      id: 'u6l3-vocab',
      kind: 'vocabulary',
      title: bi('The new question words', 'Новите въпросителни думи'),
      blocks: [],
      vocabIds: ['v-wer', 'v-was', 'v-warum', 'v-machen'],
    },
    {
      id: 'u6l3-dialogue',
      kind: 'examples',
      title: bi('A whole short conversation', 'Цял кратък разговор'),
      blocks: [
        { t: 'de', de: 'Hallo! Wie heißt du?', gloss: bi('Hi! What is your name?', 'Здравей! Как се казваш?'), audio: true },
        { t: 'de', de: 'Ich heiße Teo. Und du?', gloss: bi('My name is Teo. And you?', 'Казвам се Тео. А ти?'), audio: true },
        { t: 'de', de: 'Anna. Woher kommst du?', gloss: bi('Anna. Where are you from?', 'Ана. Откъде си?'), audio: true },
        { t: 'de', de: 'Aus Bulgarien. Ich wohne jetzt in Hamburg.', gloss: bi('From Bulgaria. I live in Hamburg now.', 'От България. Сега живея в Хамбург.'), audio: true },
        { t: 'de', de: 'Warum lernst du Deutsch?', gloss: bi('Why are you learning German?', 'Защо учиш немски?'), audio: true },
        { t: 'de', de: 'Ich arbeite hier. Was machst du beruflich?', gloss: bi('I work here. What do you do for work?', 'Работя тук. С какво се занимаваш?'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Every sentence in that exchange uses something from this level. That is the whole of Pre-A1 doing real work.',
            'Всяко изречение в този разговор използва нещо от това ниво. Това е цялото Pre-A1 в действие.',
          ),
        },
      ],
    },
    {
      id: 'u6l3-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Yes/no question: verb first. Wohnst du hier?', 'Въпрос с да/не: глаголът първи. Wohnst du hier?'),
            bi('W-question: question word, then verb. Wo wohnst du?', 'Въпрос с W: въпросителна дума, после глагол. Wo wohnst du?'),
            bi('No helper verb: never "Tust du wohnen".', 'Без помощен глагол: никога „Tust du wohnen“.'),
            bi('wer = who, wo = where. Do not mix them up.', 'wer = кой, wo = къде. Не ги бъркай.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    typeIt(
      'u6l3-ex1',
      bi('Turn it into a yes/no question', 'Превърни го във въпрос с да/не'),
      [
        {
          prompt: bi('Statement: Du wohnst in Hamburg. Make it a question.', 'Съобщително: Du wohnst in Hamburg. Направи го въпрос.'),
          answer: 'Wohnst du in Hamburg?',
          reviewTargets: ['p-wohnst-du-hier'],
          traps: [
            {
              answer: 'Du wohnst in Hamburg?',
              category: 'word-order',
              feedback: bi(
                'In writing German moves the verb to the front: Wohnst du in Hamburg? Keeping the statement order works in speech with rising intonation, but not in writing.',
                'В писмен вид немският мести глагола отпред: Wohnst du in Hamburg? Запазването на реда работи в говора с въпросителна интонация, но не и в писмен текст.',
              ),
            },
          ],
          hints: [bi('Move the verb to the front.', 'Премести глагола отпред.')],
        },
        {
          prompt: bi('Statement: Sie ist Ärztin. Make it a question.', 'Съобщително: Sie ist Ärztin. Направи го въпрос.'),
          answer: 'Ist sie Ärztin?',
          hints: [],
        },
        {
          prompt: bi('Statement: Du hast einen Bruder. Make it a question.', 'Съобщително: Du hast einen Bruder. Направи го въпрос.'),
          answer: 'Hast du einen Bruder?',
          hints: [],
        },
      ],
      ['g-questions'],
    ),

    fillBlank('u6l3-ex2', bi('Which question word?', 'Коя въпросителна дума?'), [
      {
        prompt: bi('___ is that? — That is my brother.', '___ е това? — Това е брат ми.'),
        scaffold: '___ ist das?',
        answer: 'Wer',
        shape: 'word',
        reviewTargets: ['v-wer'],
        hints: [bi('You are asking about a person.', 'Питаш за човек.')],
      },
      {
        prompt: bi('___ do you live? — In Hamburg.', '___ живееш? — В Хамбург.'),
        scaffold: '___ wohnst du?',
        answer: 'Wo',
        shape: 'word',
        hints: [bi('You are asking about a place.', 'Питаш за място.')],
      },
      {
        prompt: bi('___ are you learning German? — I work here.', '___ учиш немски? — Работя тук.'),
        scaffold: '___ lernst du Deutsch?',
        answer: 'Warum',
        shape: 'word',
        reviewTargets: ['v-warum'],
        hints: [bi('You are asking for a reason.', 'Питаш за причина.')],
      },
      {
        prompt: bi('___ is your birthday? — In May.', '___ имаш рожден ден? — През май.'),
        scaffold: '___ hast du Geburtstag?',
        answer: 'Wann',
        shape: 'word',
        reviewTargets: ['v-wann'],
        hints: [bi('You are asking about time.', 'Питаш за време.')],
      },
    ]),

    wordOrder('u6l3-ex3', bi('Build the question', 'Изгради въпроса'), [
      {
        prompt: bi('Where do you come from?', 'Откъде си?'),
        bank: ['kommst', 'Woher', 'du?'],
        answer: 'Woher kommst du?',
        hints: [bi('Question word, verb, subject.', 'Въпросителна дума, глагол, подлог.')],
      },
      {
        prompt: bi('Do you have children?', 'Имаш ли деца?'),
        bank: ['du', 'Hast', 'Kinder?'],
        answer: 'Hast du Kinder?',
        hints: [bi('Yes/no question: the verb opens it.', 'Въпрос с да/не: глаголът го отваря.')],
      },
    ]),

    typeIt(
      'u6l3-ex4',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('Who is that?', 'Кой е това?'),
          answer: 'Wer ist das?',
          reviewTargets: ['v-wer'],
          traps: [
            {
              answer: 'Wo ist das?',
              category: 'vocabulary',
              feedback: bi(
                '"wo" asks where. For a person you need "wer": Wer ist das?',
                '„wo“ пита къде. За човек трябва „wer“: Wer ist das?',
              ),
            },
          ],
          hints: [bi('Three words. Careful: wer, not wo.', 'Три думи. Внимавай: wer, не wo.')],
        },
        {
          prompt: bi('What are you doing? (informal)', 'Какво правиш?'),
          answer: 'Was machst du?',
          reviewTargets: ['v-was', 'v-machen'],
          hints: [bi('Three words.', 'Три думи.')],
        },
        {
          prompt: bi('Why are you learning German? (informal)', 'Защо учиш немски?'),
          answer: 'Warum lernst du Deutsch?',
          reviewTargets: ['v-warum'],
          hints: [bi('Four words. The verb stays second.', 'Четири думи. Глаголът остава втори.')],
        },
        {
          prompt: bi('Do you live in Hamburg? (informal)', 'Живееш ли в Хамбург?'),
          answer: 'Wohnst du in Hamburg?',
          reviewTargets: ['p-wohnst-du-hier'],
          hints: [bi('The verb comes first in a yes/no question.', 'Глаголът идва първи при въпрос с да/не.')],
        },
        {
          prompt: bi('How old are you? (formal)', 'На колко години сте? (учтиво)'),
          answer: 'Wie alt sind Sie?',
          hints: [],
        },
      ],
      ['g-questions'],
    ),

    dictation('u6l3-ex5', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Warum lernst du Deutsch?',
        shape: 'sentence',
        reviewTargets: ['v-warum'],
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Hast du Kinder?',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type the question you hear.', 'Напиши въпроса, който чуваш.'),
        answer: 'Wer ist das?',
        shape: 'sentence',
        reviewTargets: ['v-wer'],
        hints: [],
      },
    ]),

    freeWriting('u6l3-ex6', bi('Free production: interview someone', 'Свободно производство: интервюирай някого'), [
      {
        prompt: bi(
          'Write three questions you would ask a person you have just met.',
          'Напиши три въпроса, които би задал на човек, когото току-що си срещнал.',
        ),
        instruction: bi(
          'Use three different question words. There is no single right answer.',
          'Използвай три различни въпросителни думи. Няма един правилен отговор.',
        ),
        answer: 'Wie heißt du? Woher kommst du? Was machst du beruflich?',
        shape: 'sentence',
        requiredTokens: ['Wie', 'Woher'],
        hints: [bi('Wie ...? Woher ...? Was ...?', 'Wie ...? Woher ...? Was ...?')],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u6l3-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('Who is that?', 'Кой е това?'),
          answer: 'Wer ist das?',
          hints: [],
        },
        {
          prompt: bi('Do you live in Hamburg? (informal)', 'Живееш ли в Хамбург?'),
          answer: 'Wohnst du in Hamburg?',
          hints: [],
        },
        {
          prompt: bi('Why are you learning German? (informal)', 'Защо учиш немски?'),
          answer: 'Warum lernst du Deutsch?',
          hints: [],
        },
        {
          prompt: bi('What are you doing? (informal)', 'Какво правиш?'),
          answer: 'Was machst du?',
          hints: [],
        },
      ]),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'That is the whole of Pre-A1. You can greet, introduce yourself, say where you are from and what you do, handle numbers and time, negate, and ask questions. The level checkpoint puts all of it together.',
        'Това е цялото Pre-A1. Можеш да поздравяваш, да се представяш, да кажеш откъде си и с какво се занимаваш, да се справяш с числа и време, да отричаш и да задаваш въпроси. Проверката на нивото събира всичко.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u6-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u6',
  status: 'available',
  passAccuracy: 0.75,
  title: bi('Unit checkpoint: grammar', 'Контролна проверка: граматика'),
  description: bi(
    'Pronouns, sein and haben, plurals, negation and both kinds of question.',
    'Местоимения, sein и haben, множествено число, отрицание и двата вида въпрос.',
  ),
  exercises: [
    exercise({
      id: 'cp-u6-1',
      kind: 'conjugation',
      objective: bi('Verb forms', 'Глаголни форми'),
      mandatoryRetype: false,
      steps: [
        { prompt: bi('ihr — sein', 'ihr — sein'), scaffold: 'ihr ___', answer: 'seid', shape: 'word', hints: [] },
        { prompt: bi('du — haben', 'du — haben'), scaffold: 'du ___', answer: 'hast', shape: 'word', hints: [] },
        { prompt: bi('wir — sein', 'wir — sein'), scaffold: 'wir ___', answer: 'sind', shape: 'word', hints: [] },
      ],
    }),
    typeIt('cp-u6-2', bi('Negation', 'Отрицание'), [
      {
        prompt: bi('I do not have a brother.', 'Нямам брат.'),
        answer: 'Ich habe keinen Bruder.',
        hints: [],
      },
      {
        prompt: bi('I do not live in Berlin.', 'Не живея в Берлин.'),
        answer: 'Ich wohne nicht in Berlin.',
        hints: [],
      },
    ]),
    typeIt('cp-u6-3', bi('Questions', 'Въпроси'), [
      {
        prompt: bi('Who is that?', 'Кой е това?'),
        answer: 'Wer ist das?',
        hints: [],
      },
      {
        prompt: bi('Do you have children? (informal)', 'Имаш ли деца?'),
        answer: 'Hast du Kinder?',
        hints: [],
      },
      {
        prompt: bi('Where do you come from? (formal)', 'Откъде сте? (учтиво)'),
        answer: 'Woher kommen Sie?',
        hints: [],
      },
    ]),
    exercise({
      id: 'cp-u6-4',
      kind: 'type',
      objective: bi('Plurals', 'Множествено число'),
      steps: [
        {
          prompt: bi('houses', 'къщи'),
          instruction: bi('With the article.', 'С члена.'),
          answer: 'die Häuser',
          shape: 'phrase',
          hints: [],
        },
        {
          prompt: bi('brothers', 'братя'),
          instruction: bi('With the article.', 'С члена.'),
          answer: 'die Brüder',
          shape: 'phrase',
          hints: [],
        },
      ],
    }),
    dictation('cp-u6-5', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich habe keine Geschwister.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Wo wohnt ihr?',
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
};

export const PRE_A1_UNIT_6: Unit = {
  id: 'pre-a1-u6',
  level: 'pre-a1',
  order: 6,
  status: 'available',
  title: bi('First grammar', 'Първа граматика'),
  summary: bi(
    'The grammar of the whole level in one place: all the pronouns, sein and haben, plurals, negation and questions.',
    'Граматиката на цялото ниво на едно място: всички местоимения, sein и haben, множествено число, отрицание и въпроси.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const PRE_A1_U6_PATTERNS = PATTERNS;
