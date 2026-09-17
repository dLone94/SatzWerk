import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  multipleChoice,
  partialRecall,
  typeIt,
} from '../authoring.ts';
import type { Checkpoint, Lesson, SentencePattern, Unit } from '../types.ts';

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-bin-jahre-alt',
    template: 'Ich bin ___ Jahre alt.',
    example: 'Ich bin dreißig Jahre alt.',
    gloss: bi('I am ___ years old.', 'Аз съм на ___ години.'),
    level: 'pre-a1',
    grammarIds: ['g-age-and-prices'],
  },
  {
    id: 'p-das-kostet',
    template: 'Das kostet ___ Euro.',
    example: 'Das kostet drei Euro.',
    gloss: bi('That costs ___ euros.', 'Това струва ___ евро.'),
    level: 'pre-a1',
    grammarIds: ['g-age-and-prices'],
  },
];

/* ================================================================== *
 * Lesson 1 - Zero to twenty
 * ================================================================== */

const lesson1: Lesson = {
  id: 'pre-a1-u3-l1',
  unitId: 'pre-a1-u3',
  level: 'pre-a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 16,
  title: bi('Zero to twenty', 'От нула до двайсет'),
  objective: bi(
    'After this lesson you will be able to say, hear and write the numbers 0 to 20 in German.',
    'След този урок ще можеш да казваш, чуваш и пишеш числата от 0 до 20 на немски.',
  ),
  outcomes: [
    bi('I can count from zero to twenty.', 'Мога да броя от нула до двайсет.'),
    bi('I can write the numbers correctly, including the irregular ones.', 'Мога да пиша числата правилно, включително неправилните.'),
    bi('I can understand a number when I hear it.', 'Мога да разбера число, когато го чуя.'),
  ],
  vocabIds: [
    'v-null', 'v-eins', 'v-zwei', 'v-drei', 'v-vier', 'v-fuenf', 'v-sechs', 'v-sieben',
    'v-acht', 'v-neun', 'v-zehn', 'v-elf', 'v-zwoelf', 'v-dreizehn', 'v-vierzehn',
    'v-fuenfzehn', 'v-sechzehn', 'v-siebzehn', 'v-achtzehn', 'v-neunzehn', 'v-zwanzig',
  ],
  grammarIds: ['g-numbers'],
  sections: [
    {
      id: 'u3l1-intro',
      kind: 'intro',
      title: bi('Numbers are worth doing properly', 'Числата си заслужават да се научат добре'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Numbers turn up in every practical situation: prices, addresses, appointment times, platform numbers, your own age. They are also the part of German that is easiest to mishear, so this lesson does a lot of listening.',
            'Числата се появяват във всяка практична ситуация: цени, адреси, часове за срещи, номера на коловози, собствената ти възраст. Освен това са частта от немския, която най-лесно се чува грешно, затова този урок включва много слушане.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'Zero to twelve have to be learnt one by one. From thirteen it becomes a pattern.',
            'От нула до дванайсет трябва да се научат една по една. От тринайсет става модел.',
          ),
        },
      ],
    },
    {
      id: 'u3l1-zero-twelve',
      kind: 'vocabulary',
      title: bi('Zero to twelve', 'От нула до дванайсет'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Play each one and say it aloud. Two of them need particular care, and they are flagged below.',
            'Изслушай всяко и го кажи на глас. Две от тях искат особено внимание и са отбелязани по-долу.',
          ),
        },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'vier (four) is said FEER, not "vire" — remember v = f and ie = ee. And zwei is TSVY, with the z said as ts.',
            'vier (четири) се чете ФИР, а не „виер“ — помни v = ф и ie = и. А zwei е ЦВАЙ, с z като „ц“.',
          ),
        },
      ],
      vocabIds: [
        'v-null', 'v-eins', 'v-zwei', 'v-drei', 'v-vier', 'v-fuenf',
        'v-sechs', 'v-sieben', 'v-acht', 'v-neun', 'v-zehn', 'v-elf', 'v-zwoelf',
      ],
    },
    {
      id: 'u3l1-pattern',
      kind: 'grammar',
      title: bi('Thirteen to twenty', 'От тринайсет до двайсет'),
      blocks: [],
      grammarId: 'g-numbers',
    },
    {
      id: 'u3l1-teens',
      kind: 'vocabulary',
      title: bi('The teens', 'Числата от 13 до 20'),
      blocks: [],
      vocabIds: [
        'v-dreizehn', 'v-vierzehn', 'v-fuenfzehn', 'v-sechzehn',
        'v-siebzehn', 'v-achtzehn', 'v-neunzehn', 'v-zwanzig',
      ],
    },
    {
      id: 'u3l1-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('0–12 have to be memorised.', '0–12 трябва да се запомнят.'),
            bi('13–19 are the digit plus -zehn.', '13–19 са цифрата плюс -zehn.'),
            bi('Two irregulars: sechzehn and siebzehn drop a piece.', 'Две изключения: sechzehn и siebzehn изпускат по нещо.'),
            bi('vier = FEER, zwei = TSVY, zwanzig ends in "-tsikh".', 'vier = ФИР, zwei = ЦВАЙ, zwanzig завършва на „-цих“.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    multipleChoice(
      'u3l1-ex1',
      bi('First listening: which number?', 'Първо слушане: кое число?'),
      [
        {
          prompt: bi('Listen. Which number did you hear?', 'Слушай. Кое число чу?'),
          audio: { text: 'vier', hideText: true },
          choices: [
            { id: 'a', de: 'vier', gloss: bi('four', 'четири') },
            { id: 'b', de: 'wir', gloss: bi('we', 'ние') },
          ],
          correct: 'a',
          answer: 'vier',
          shape: 'word',
          reviewTargets: ['v-vier'],
          hints: [],
        },
        {
          prompt: bi('Listen. Which number did you hear?', 'Слушай. Кое число чу?'),
          audio: { text: 'zwei', hideText: true },
          choices: [
            { id: 'a', de: 'drei', gloss: bi('three', 'три') },
            { id: 'b', de: 'zwei', gloss: bi('two', 'две') },
          ],
          correct: 'b',
          answer: 'zwei',
          shape: 'word',
          reviewTargets: ['v-zwei'],
          hints: [],
        },
      ],
      'listenChoose',
    ),

    typeIt(
      'u3l1-ex2',
      bi('Write the number as a word', 'Напиши числото с думи'),
      [
        { prompt: bi('3', '3'), answer: 'drei', shape: 'word', reviewTargets: ['v-drei'], hints: [] },
        { prompt: bi('7', '7'), answer: 'sieben', shape: 'word', reviewTargets: ['v-sieben'], hints: [bi('Two syllables.', 'Две срички.')] },
        {
          prompt: bi('5', '5'),
          answer: 'fünf',
          shape: 'word',
          reviewTargets: ['v-fuenf'],
          hints: [bi('It needs ü.', 'Изисква ü.')],
        },
        {
          prompt: bi('12', '12'),
          answer: 'zwölf',
          shape: 'word',
          reviewTargets: ['v-zwoelf'],
          hints: [bi('It needs ö.', 'Изисква ö.')],
        },
        {
          prompt: bi('16', '16'),
          answer: 'sechzehn',
          shape: 'word',
          reviewTargets: ['v-sechzehn'],
          traps: [
            {
              answer: 'sechszehn',
              category: 'spelling',
              feedback: bi(
                'Almost — but 16 is irregular: "sechs" loses its s before -zehn. It is sechzehn.',
                'Почти — но 16 е неправилно: „sechs“ губи своето s пред -zehn. Правилното е sechzehn.',
              ),
            },
          ],
          hints: [bi('Careful: this one is irregular.', 'Внимавай: това е неправилно.')],
        },
        {
          prompt: bi('17', '17'),
          answer: 'siebzehn',
          shape: 'word',
          reviewTargets: ['v-siebzehn'],
          traps: [
            {
              answer: 'siebenzehn',
              category: 'spelling',
              feedback: bi(
                '17 is the other irregular one: "sieben" loses its -en. It is siebzehn.',
                '17 е другото изключение: „sieben“ губи своето -en. Правилното е siebzehn.',
              ),
            },
          ],
          hints: [bi('The other irregular one.', 'Другото изключение.')],
        },
        {
          prompt: bi('20', '20'),
          answer: 'zwanzig',
          shape: 'word',
          reviewTargets: ['v-zwanzig'],
          hints: [],
        },
      ],
      ['g-numbers'],
    ),

    fillBlank('u3l1-ex3', bi('Complete the pattern', 'Довърши модела'), [
      {
        prompt: bi('14', '14'),
        scaffold: 'vier___',
        answer: 'vierzehn',
        shape: 'word',
        reviewTargets: ['v-vierzehn'],
        hints: [bi('Digit plus -zehn.', 'Цифра плюс -zehn.')],
      },
      {
        prompt: bi('19', '19'),
        scaffold: 'neun___',
        answer: 'neunzehn',
        shape: 'word',
        reviewTargets: ['v-neunzehn'],
        hints: [],
      },
    ]),

    partialRecall('u3l1-ex4', bi('Recall from the first letters', 'Припомни си от първите букви'), [
      {
        prompt: bi('8', '8'),
        scaffold: 'a___',
        answer: 'acht',
        shape: 'word',
        reviewTargets: ['v-acht'],
        hints: [],
      },
      {
        prompt: bi('11', '11'),
        scaffold: 'e___',
        answer: 'elf',
        shape: 'word',
        reviewTargets: ['v-elf'],
        hints: [],
      },
    ]),

    dictation('u3l1-ex5', bi('Listen and write the number', 'Слушай и напиши числото'), [
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'sechs',
        shape: 'word',
        reviewTargets: ['v-sechs'],
        hints: [],
      },
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'dreizehn',
        shape: 'word',
        reviewTargets: ['v-dreizehn'],
        hints: [],
      },
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'zwölf',
        shape: 'word',
        reviewTargets: ['v-zwoelf'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u3l1-m1', bi('Mastery check: numbers', 'Проверка: числа'), [
        { prompt: bi('9', '9'), answer: 'neun', shape: 'word', hints: [] },
        { prompt: bi('16', '16'), answer: 'sechzehn', shape: 'word', hints: [] },
        { prompt: bi('12', '12'), answer: 'zwölf', shape: 'word', hints: [] },
      ]),
      dictation('u3l1-m2', bi('Mastery check: listening', 'Проверка: слушане'), [
        {
          instruction: bi('Write what you hear.', 'Напиши каквото чуваш.'),
          answer: 'siebzehn',
          shape: 'word',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 - Twenty to a hundred
 * ================================================================== */

const lesson2: Lesson = {
  id: 'pre-a1-u3-l2',
  unitId: 'pre-a1-u3',
  level: 'pre-a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 18,
  title: bi('Twenty to a hundred', 'От двайсет до сто'),
  objective: bi(
    'After this lesson you will be able to say and write any number up to a hundred, including the back-to-front ones.',
    'След този урок ще можеш да казваш и пишеш всяко число до сто, включително „обърнатите“.',
  ),
  outcomes: [
    bi('I can say the tens from 20 to 100.', 'Мога да казвам десетиците от 20 до 100.'),
    bi('I can build numbers like einundzwanzig correctly.', 'Мога да изграждам правилно числа като einundzwanzig.'),
    bi('I can hear a two-digit number and write it down.', 'Мога да чуя двуцифрено число и да го запиша.'),
  ],
  vocabIds: [
    'v-dreissig', 'v-vierzig', 'v-fuenfzig', 'v-sechzig', 'v-siebzig',
    'v-achtzig', 'v-neunzig', 'v-hundert', 'v-einundzwanzig', 'v-zweiunddreissig',
  ],
  grammarIds: ['g-numbers'],
  sections: [
    {
      id: 'u3l2-tens',
      kind: 'vocabulary',
      title: bi('The tens', 'Десетиците'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Most tens are simply the digit plus -zig. Two are irregular: dreißig is spelled with ß, and sechzig and siebzig shorten the same way as sechzehn and siebzehn.',
            'Повечето десетици са просто цифрата плюс -zig. Две са неправилни: dreißig се пише с ß, а sechzig и siebzig се съкращават като sechzehn и siebzehn.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Say -zig as "-tsikh". A German who says "-tsig" is probably being deliberately clear on the phone.',
            'Изговаряй -zig като „-цих“. Немец, който казва „-циг“, вероятно нарочно се изразява по-ясно по телефона.',
          ),
        },
      ],
      vocabIds: ['v-dreissig', 'v-vierzig', 'v-fuenfzig', 'v-sechzig', 'v-siebzig', 'v-achtzig', 'v-neunzig', 'v-hundert'],
    },
    {
      id: 'u3l2-backwards',
      kind: 'grammar',
      title: bi('Numbers said back to front', 'Числата, казани обратно'),
      blocks: [],
      grammarId: 'g-numbers',
    },
    {
      id: 'u3l2-practice-reading',
      kind: 'examples',
      title: bi('Read these aloud', 'Прочети ги на глас'),
      blocks: [
        { t: 'de', de: 'einundzwanzig', gloss: bi('21', '21'), audio: true },
        { t: 'de', de: 'fünfundvierzig', gloss: bi('45', '45'), audio: true },
        { t: 'de', de: 'achtundsechzig', gloss: bi('68', '68'), audio: true },
        { t: 'de', de: 'neunundneunzig', gloss: bi('99', '99'), audio: true },
        {
          t: 'callout',
          tone: 'warn',
          text: bi(
            'Practical consequence: when someone reads you a number, the first digit you hear is the last one you write. Write the tens down first and fill in the unit afterwards.',
            'Практично следствие: когато някой ти чете число, първата цифра, която чуваш, е последната, която пишеш. Запиши първо десетиците и после допълни единицата.',
          ),
        },
      ],
    },
    {
      id: 'u3l2-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Digit + -zig, with dreißig, sechzig and siebzig irregular.', 'Цифра + -zig, а dreißig, sechzig и siebzig са неправилни.'),
            bi('21 to 99: unit + und + ten, all as one word.', '21 до 99: единица + und + десетица, всичко като една дума.'),
            bi('No spaces, no hyphens: einundzwanzig.', 'Без интервали, без тирета: einundzwanzig.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    typeIt(
      'u3l2-ex1',
      bi('The tens', 'Десетиците'),
      [
        {
          prompt: bi('30', '30'),
          answer: 'dreißig',
          shape: 'word',
          reviewTargets: ['v-dreissig'],
          traps: [
            {
              answer: 'dreizig',
              category: 'spelling',
              feedback: bi(
                '30 is the exception in spelling: it is written dreißig, with ß, not "dreizig".',
                '30 е изключението в правописа: пише се dreißig, с ß, не „dreizig“.',
              ),
            },
          ],
          hints: [bi('This one uses ß.', 'Това използва ß.')],
        },
        { prompt: bi('40', '40'), answer: 'vierzig', shape: 'word', reviewTargets: ['v-vierzig'], hints: [] },
        { prompt: bi('60', '60'), answer: 'sechzig', shape: 'word', reviewTargets: ['v-sechzig'], hints: [bi('Shortens like sechzehn.', 'Съкращава се като sechzehn.')] },
        { prompt: bi('70', '70'), answer: 'siebzig', shape: 'word', reviewTargets: ['v-siebzig'], hints: [bi('Shortens like siebzehn.', 'Съкращава се като siebzehn.')] },
        { prompt: bi('100', '100'), answer: 'hundert', shape: 'word', reviewTargets: ['v-hundert'], hints: [] },
      ],
      ['g-numbers'],
    ),

    typeIt('u3l2-ex2', bi('Build the number as one word', 'Изгради числото като една дума'), [
      {
        prompt: bi(
          '21 — say it as "one and twenty", and write it as a single word',
          '21 — кажи го като „едно и двайсет“ и го напиши като една дума',
        ),
        answer: 'einundzwanzig',
        shape: 'word',
        reviewTargets: ['v-einundzwanzig'],
        hints: [bi('The joining word is "und".', 'Свързващата дума е „und“.')],
      },
      {
        prompt: bi(
          '32 — say it as "two and thirty", and write it as a single word',
          '32 — кажи го като „две и трийсет“ и го напиши като една дума',
        ),
        answer: 'zweiunddreißig',
        shape: 'word',
        reviewTargets: ['v-zweiunddreissig'],
        hints: [bi('Careful: 30 is dreißig, with ß.', 'Внимавай: 30 е dreißig, с ß.')],
      },
    ]),

    typeIt(
      'u3l2-ex3',
      bi('Full production: two-digit numbers', 'Пълно производство: двуцифрени числа'),
      [
        {
          prompt: bi('21', '21'),
          answer: 'einundzwanzig',
          reviewTargets: ['v-einundzwanzig'],
          shape: 'word',
          traps: [
            {
              answer: 'zwanzigundein',
              category: 'word-order',
              feedback: bi(
                'The other way round: German says the unit first. It is einundzwanzig, literally "one-and-twenty".',
                'Обратното: немският казва първо единицата. Правилното е einundzwanzig, буквално „едно-и-двайсет“.',
              ),
            },
            {
              answer: 'ein und zwanzig',
              category: 'spelling',
              feedback: bi(
                'Right order, but German writes it as one single word: einundzwanzig.',
                'Правилен ред, но немският го пише като една дума: einundzwanzig.',
              ),
            },
          ],
          hints: [
            bi('Unit first, then und, then the ten.', 'Първо единицата, после und, после десетицата.'),
            bi('ein...', 'ein...'),
          ],
        },
        {
          prompt: bi('45', '45'),
          answer: 'fünfundvierzig',
          shape: 'word',
          hints: [bi('Five-and-forty.', 'Пет-и-четирийсет.')],
        },
        {
          prompt: bi('68', '68'),
          answer: 'achtundsechzig',
          shape: 'word',
          hints: [bi('Eight-and-sixty. Careful with sechzig.', 'Осем-и-шейсет. Внимавай с sechzig.')],
        },
        {
          prompt: bi('99', '99'),
          answer: 'neunundneunzig',
          shape: 'word',
          hints: [],
        },
      ],
      ['g-numbers'],
    ),

    dictation('u3l2-ex4', bi('Listen and write the digits', 'Слушай и напиши цифрите'), [
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'einundzwanzig',
        shape: 'word',
        reviewTargets: ['v-einundzwanzig'],
        hints: [],
      },
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'siebzig',
        shape: 'word',
        reviewTargets: ['v-siebzig'],
        hints: [],
      },
      {
        instruction: bi('Write the number you hear as a word.', 'Напиши числото, което чуваш, с думи.'),
        answer: 'zweiunddreißig',
        shape: 'word',
        reviewTargets: ['v-zweiunddreissig'],
        hints: [],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      typeIt('u3l2-m1', bi('Mastery check', 'Проверка за усвояване'), [
        { prompt: bi('30', '30'), answer: 'dreißig', shape: 'word', hints: [] },
        { prompt: bi('21', '21'), answer: 'einundzwanzig', shape: 'word', hints: [] },
        { prompt: bi('76', '76'), answer: 'sechsundsiebzig', shape: 'word', hints: [] },
      ]),
      dictation('u3l2-m2', bi('Mastery check: listening', 'Проверка: слушане'), [
        {
          instruction: bi('Write what you hear.', 'Напиши каквото чуваш.'),
          answer: 'fünfundvierzig',
          shape: 'word',
          hints: [],
        },
      ]),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 - Age, prices and phone numbers
 * ================================================================== */

const lesson3: Lesson = {
  id: 'pre-a1-u3-l3',
  unitId: 'pre-a1-u3',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Age, prices and phone numbers', 'Възраст, цени и телефонни номера'),
  objective: bi(
    'After this lesson you will be able to say how old you are, ask a price, and give your phone number in German.',
    'След този урок ще можеш да кажеш на колко години си, да попиташ за цена и да дадеш телефонния си номер на немски.',
  ),
  outcomes: [
    bi('I can say how old I am and ask someone else.', 'Мога да кажа на колко години съм и да попитам друг.'),
    bi('I can ask what something costs and understand the answer.', 'Мога да попитам колко струва нещо и да разбера отговора.'),
    bi('I can give and understand a phone number.', 'Мога да дам и да разбера телефонен номер.'),
  ],
  vocabIds: ['v-das-jahr', 'v-alt', 'v-wie-alt-bist-du', 'v-die-telefonnummer', 'v-der-euro', 'v-kosten', 'v-wie-viel'],
  grammarIds: ['g-age-and-prices', 'g-sein'],
  patterns: [PATTERNS[0]!, PATTERNS[1]!],
  sections: [
    {
      id: 'u3l3-intro',
      kind: 'intro',
      title: bi('Numbers doing real work', 'Числата на практика'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You now have the numbers. This lesson puts them into the three sentences you will actually need them for.',
            'Вече имаш числата. Този урок ги слага в трите изречения, за които наистина ще ти трябват.',
          ),
        },
        {
          t: 'breakdown',
          de: 'Ich bin dreißig Jahre alt.',
          parts: [
            { de: 'Ich bin', gloss: bi('I am', 'аз съм') },
            { de: 'dreißig', gloss: bi('thirty', 'трийсет') },
            { de: 'Jahre alt', gloss: bi('years old', 'години (буквално: години стар)') },
          ],
        },
      ],
    },
    {
      id: 'u3l3-grammar',
      kind: 'grammar',
      title: bi('How to say it', 'Как се казва'),
      blocks: [],
      grammarId: 'g-age-and-prices',
    },
    {
      id: 'u3l3-vocab',
      kind: 'vocabulary',
      title: bi('The words', 'Думите'),
      blocks: [],
      vocabIds: ['v-das-jahr', 'v-alt', 'v-wie-alt-bist-du', 'v-die-telefonnummer', 'v-der-euro', 'v-kosten', 'v-wie-viel'],
    },
    {
      id: 'u3l3-dialogue',
      kind: 'examples',
      title: bi('At the bakery', 'В пекарната'),
      blocks: [
        { t: 'de', de: 'Guten Morgen! Was kostet ein Brot?', gloss: bi('Good morning! What does a loaf cost?', 'Добро утро! Колко струва един хляб?'), audio: true },
        { t: 'de', de: 'Drei Euro zwanzig, bitte.', gloss: bi('Three euros twenty, please.', 'Три евро и двайсет, моля.'), audio: true },
        { t: 'de', de: 'Danke. Auf Wiedersehen!', gloss: bi('Thanks. Goodbye!', 'Благодаря. Довиждане!'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Prices are said without the word for cents: "drei Euro zwanzig" means 3.20. Germans also write it with a comma: 3,20 €.',
            'Цените се казват без думата за центове: „drei Euro zwanzig“ значи 3,20. Немците го пишат със запетая: 3,20 €.',
          ),
        },
      ],
    },
    {
      id: 'u3l3-summary',
      kind: 'summary',
      title: bi('Summary', 'Резюме'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich bin ... Jahre alt. / Wie alt bist du?', 'Ich bin ... Jahre alt. / Wie alt bist du?'),
            bi('Wie viel kostet das? / Das kostet ... Euro.', 'Wie viel kostet das? / Das kostet ... Euro.'),
            bi('Wie ist deine Telefonnummer? — "how is", not "what is".', 'Wie ist deine Telefonnummer? — „как е“, не „какъв е“.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    fillBlank('u3l3-ex1', bi('Guided typing', 'Насочено писане'), [
      {
        prompt: bi('I am thirty years old.', 'Аз съм на трийсет години.'),
        scaffold: 'Ich bin dreißig ___ alt.',
        answer: 'Jahre',
        shape: 'word',
        reviewTargets: ['v-das-jahr', 'p-ich-bin-jahre-alt'],
        hints: [bi('Plural of das Jahr.', 'Множествено число на das Jahr.')],
      },
      {
        prompt: bi('That costs three euros.', 'Това струва три евро.'),
        scaffold: 'Das ___ drei Euro.',
        answer: 'kostet',
        shape: 'word',
        reviewTargets: ['v-kosten'],
        hints: [bi('The er/sie/es form of kosten.', 'Формата за er/sie/es на kosten.')],
      },
    ]),

    typeIt(
      'u3l3-ex2',
      bi('Full production', 'Пълно производство'),
      [
        {
          prompt: bi('How old are you? (informal)', 'На колко години си?'),
          answer: 'Wie alt bist du?',
          reviewTargets: ['v-wie-alt-bist-du'],
          traps: [
            {
              answer: 'Wie alt hast du?',
              category: 'auxiliary-verb',
              feedback: bi(
                'German uses "sein" for age, not "haben": Wie alt BIST du? Some languages say "how many years do you have" — German does not.',
                'Немският използва „sein“ за възраст, не „haben“: Wie alt BIST du? Някои езици казват „колко години имаш“ — немският не.',
              ),
            },
          ],
          hints: [bi('Four words. The verb is sein.', 'Четири думи. Глаголът е sein.')],
        },
        {
          prompt: bi('I am thirty years old.', 'Аз съм на трийсет години.'),
          answer: 'Ich bin dreißig Jahre alt.',
          reviewTargets: ['p-ich-bin-jahre-alt'],
          traps: [
            {
              answer: 'Ich bin dreißig Jahr alt.',
              category: 'plural',
              feedback: bi(
                'With a number above one, German needs the plural: dreißig Jahre, not "Jahr".',
                'С число над едно немският иска множествено число: dreißig Jahre, а не „Jahr“.',
              ),
            },
          ],
          hints: [bi('Five words, ending in "alt".', 'Пет думи, завършващи на „alt“.')],
        },
        {
          prompt: bi('How much does that cost?', 'Колко струва това?'),
          answer: 'Wie viel kostet das?',
          alternatives: ['Was kostet das?'],
          reviewTargets: ['v-wie-viel', 'v-kosten'],
          hints: [bi('Four words.', 'Четири думи.')],
        },
        {
          prompt: bi('That costs twenty-one euros.', 'Това струва двайсет и едно евро.'),
          answer: 'Das kostet einundzwanzig Euro.',
          reviewTargets: ['p-das-kostet', 'v-der-euro'],
          hints: [bi('Remember the back-to-front number.', 'Помни обърнатото число.')],
        },
        {
          prompt: bi('What is your phone number? (informal)', 'Какъв е телефонният ти номер?'),
          answer: 'Wie ist deine Telefonnummer?',
          reviewTargets: ['v-die-telefonnummer'],
          traps: [
            {
              answer: 'Was ist deine Telefonnummer?',
              category: 'vocabulary',
              feedback: bi(
                'German asks "Wie ist ...?" — literally "how is" — for a number or a name, not "Was ist ...?".',
                'Немският пита „Wie ist ...?“ — буквално „как е“ — за номер или име, а не „Was ist ...?“.',
              ),
            },
            {
              answer: 'Wie ist dein Telefonnummer?',
              category: 'gender',
              feedback: bi(
                '"Telefonnummer" is feminine (die Telefonnummer), so the possessive takes an -e: deine Telefonnummer.',
                '„Telefonnummer“ е от женски род (die Telefonnummer), затова притежателното взима -e: deine Telefonnummer.',
              ),
            },
          ],
          hints: [
            bi('The question word is not "Was".', 'Въпросителната дума не е „Was“.'),
            bi('Telefonnummer is feminine.', 'Telefonnummer е от женски род.'),
          ],
        },
      ],
      ['g-age-and-prices'],
    ),

    partialRecall('u3l3-ex3', bi('Partial recall', 'Частично припомняне'), [
      {
        prompt: bi('How old are you? (formal)', 'На колко години сте? (учтиво)'),
        scaffold: 'Wie alt s___ Sie?',
        answer: 'sind',
        shape: 'word',
        hints: [bi('The Sie form of sein.', 'Формата за Sie на sein.')],
      },
    ]),

    dictation('u3l3-ex4', bi('Listen and type', 'Слушай и напиши'), [
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich bin vierzig Jahre alt.',
        shape: 'sentence',
        reviewTargets: ['p-ich-bin-jahre-alt'],
        hints: [],
      },
      {
        instruction: bi('Type the price you hear.', 'Напиши цената, която чуваш.'),
        answer: 'Das kostet drei Euro.',
        shape: 'sentence',
        reviewTargets: ['p-das-kostet'],
        hints: [],
      },
    ]),

    freeWriting('u3l3-ex5', bi('Free production', 'Свободно производство'), [
      {
        prompt: bi(
          'Write one sentence saying how old you are.',
          'Напиши едно изречение за това на колко години си.',
        ),
        instruction: bi('Use your real age.', 'Използвай истинската си възраст.'),
        answer: 'Ich bin dreißig Jahre alt.',
        shape: 'sentence',
        requiredTokens: ['Jahre', 'alt'],
        hints: [bi('Ich bin ... Jahre alt.', 'Ich bin ... Jahre alt.')],
      },
    ]),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      typeIt('u3l3-m1', bi('Mastery check', 'Проверка за усвояване'), [
        {
          prompt: bi('How old are you? (informal)', 'На колко години си?'),
          answer: 'Wie alt bist du?',
          hints: [],
        },
        {
          prompt: bi('I am twenty-one years old.', 'Аз съм на двайсет и една години.'),
          answer: 'Ich bin einundzwanzig Jahre alt.',
          hints: [],
        },
        {
          prompt: bi('How much does that cost?', 'Колко струва това?'),
          answer: 'Wie viel kostet das?',
          alternatives: ['Was kostet das?'],
          hints: [],
        },
      ]),
      dictation('u3l3-m2', bi('Mastery check: listening', 'Проверка: слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das kostet fünf Euro.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ],
  },
  summary: [
    {
      t: 'p',
      text: bi(
        'You can now handle money, age and numbers on the phone. Next: saying where you are from in more detail, and what you do.',
        'Вече можеш да се справяш с пари, възраст и числа по телефона. Следва: да кажеш по-подробно откъде си и с какво се занимаваш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'pre-a1-u3-checkpoint',
  scope: 'unit',
  targetId: 'pre-a1-u3',
  status: 'available',
  passAccuracy: 0.75,
  title: bi('Unit checkpoint: numbers', 'Контролна проверка: числа'),
  description: bi(
    'Numbers from zero to a hundred, age, prices and phone numbers — written, heard and produced.',
    'Числата от нула до сто, възраст, цени и телефонни номера — писмено, чуто и произведено.',
  ),
  exercises: [
    typeIt('cp-u3-1', bi('Write the numbers', 'Напиши числата'), [
      { prompt: bi('7', '7'), answer: 'sieben', shape: 'word', hints: [] },
      { prompt: bi('16', '16'), answer: 'sechzehn', shape: 'word', hints: [] },
      { prompt: bi('30', '30'), answer: 'dreißig', shape: 'word', hints: [] },
      { prompt: bi('42', '42'), answer: 'zweiundvierzig', shape: 'word', hints: [] },
    ]),
    typeIt('cp-u3-2', bi('Age and prices', 'Възраст и цени'), [
      {
        prompt: bi('I am thirty-five years old.', 'Аз съм на трийсет и пет години.'),
        answer: 'Ich bin fünfunddreißig Jahre alt.',
        hints: [],
      },
      {
        prompt: bi('How much does that cost?', 'Колко струва това?'),
        answer: 'Wie viel kostet das?',
        alternatives: ['Was kostet das?'],
        hints: [],
      },
      {
        prompt: bi('That costs twelve euros.', 'Това струва дванайсет евро.'),
        answer: 'Das kostet zwölf Euro.',
        hints: [],
      },
    ]),
    dictation('cp-u3-3', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Write the number you hear.', 'Напиши числото, което чуваш.'),
        answer: 'achtundsechzig',
        shape: 'word',
        hints: [],
      },
      {
        instruction: bi('Type the sentence you hear.', 'Напиши изречението, което чуваш.'),
        answer: 'Ich bin zwanzig Jahre alt.',
        shape: 'sentence',
        hints: [],
      },
    ]),
    exercise({
      id: 'cp-u3-4',
      kind: 'multipleChoice',
      objective: bi('Hearing the order', 'Да чуеш реда'),
      mandatoryRetype: false,
      steps: [
        {
          prompt: bi('Listen. Which number is it?', 'Слушай. Кое число е?'),
          audio: { text: 'siebenundvierzig', hideText: true },
          choices: [
            { id: 'a', de: '74', gloss: bi('seventy-four', 'седемдесет и четири') },
            { id: 'b', de: '47', gloss: bi('forty-seven', 'четирийсет и седем') },
          ],
          correct: 'b',
          answer: '47',
          shape: 'word',
          hints: [],
        },
      ],
    }),
  ],
};

export const PRE_A1_UNIT_3: Unit = {
  id: 'pre-a1-u3',
  level: 'pre-a1',
  order: 3,
  status: 'available',
  title: bi('Numbers and quantities', 'Числа и количества'),
  summary: bi(
    'Count to a hundred, say your age, ask a price and give a phone number — with the German habit of saying numbers back to front.',
    'Брой до сто, кажи възрастта си, попитай за цена и дай телефонен номер — с немския навик да казва числата обратно.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const PRE_A1_U3_PATTERNS = PATTERNS;
