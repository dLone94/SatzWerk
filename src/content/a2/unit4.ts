import {
  bi,
  conjugate,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * A2 Unit 4 — Health and advice.
 *
 * Reflexive verbs are the clearest case in the whole course of the two paths
 * needing opposite advice.
 *
 * Bulgarian has „се" and puts it in the same places, so the Bulgarian learner
 * never has to be persuaded the word belongs there. What they need is the one
 * warning their own language cannot give them: German's „се" changes with the
 * person. „Ich fühle sich gut" is the mistake a Bulgarian speaker makes, and it
 * comes from the perfectly reasonable habit of a word that never changes.
 *
 * English has no reflexive here at all — "I feel myself well" is wrong and a
 * little comic — so the English learner has the opposite problem: they must add
 * a word their language forbids, and their instinct deletes it. "Ich fühle gut"
 * is the mistake, and it is authored as a trap too.
 *
 * Two mistakes, two paths, one exercise. The rest of the unit is small: sollen
 * is a fifth modal that behaves like the four already known, and the
 * du-imperative is the du-form with two things removed.
 */

/** The shorthands default to pre-a1; everything in this file is A2. */
const a2 = (ex: Exercise): Exercise => ({ ...ex, level: 'a2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-ich-fuehle-mich',
    template: 'Ich fühle mich ___.',
    example: 'Ich fühle mich nicht gut.',
    gloss: bi('I feel ___.', 'Чувствам се ___.'),
    level: 'a2',
    grammarIds: ['g-reflexive'],
  },
  {
    id: 'p-du-sollst',
    template: 'Du sollst ___ ___.',
    example: 'Du sollst viel Tee trinken.',
    gloss: bi('You should ___.', 'Трябва да ___.'),
    level: 'a2',
    grammarIds: ['g-sollen'],
  },
  {
    id: 'p-imperativ-du',
    template: '___ ___!',
    example: 'Trink viel Tee!',
    gloss: bi('___!', '___!'),
    level: 'a2',
    grammarIds: ['g-imperativ-du'],
  },
];

/* ================================================================== *
 * Lesson 1 — how you feel
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a2-u4-l1',
  unitId: 'a2-u4',
  level: 'a2',
  order: 1,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('How you feel: reflexive verbs', 'Как се чувстваш: възвратни глаголи'),
  objective: bi(
    'After this lesson you will be able to say how you feel, using the little word German insists on.',
    'След този урок ще можеш да кажеш как се чувстваш, с малката дума, на която немският държи.',
  ),
  outcomes: [
    bi('I can say how I feel with sich fühlen.', 'Мога да кажа как се чувствам със sich fühlen.'),
    bi('I know mich, dich, sich, uns, euch, sich.', 'Знам mich, dich, sich, uns, euch, sich.'),
    bi('I can say I am resting or have caught a cold.', 'Мога да кажа, че си почивам или че съм настинал.'),
    bi('I put the reflexive word straight after the verb.', 'Слагам възвратната дума веднага след глагола.'),
  ],
  vocabIds: ['v-sich-fuehlen', 'v-sich-ausruhen', 'v-sich-erkaelten', 'v-besser'],
  grammarIds: ['g-reflexive'],
  sections: [
    {
      id: 'a2u4l1-intro',
      kind: 'intro',
      title: bi('A word that points back at you', 'Дума, която сочи обратно към теб'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Some German verbs carry a second small word that refers to the subject. It is part of the verb, not an addition — which is why the vocabulary lists them as sich fühlen rather than fühlen.',
            'Някои немски глаголи носят втора малка дума, която сочи към подлога. Тя е част от глагола, не добавка — затова речникът ги изписва като sich fühlen, а не fühlen.',
          ),
        },
        {
          t: 'contrast',
          de: 'Ich fühle mich gut.',
          other: bi('I feel well. (no extra word in English)', 'Чувствам се добре. (българското „се“ прави същото)'),
        },
      ],
    },
    {
      id: 'a2u4l1-vocab',
      kind: 'vocabulary',
      title: bi('Three verbs that need it', 'Три глагола, които я изискват'),
      vocabIds: ['v-sich-fuehlen', 'v-sich-ausruhen', 'v-sich-erkaelten', 'v-besser'],
      blocks: [],
    },
    {
      id: 'a2u4l1-grammar',
      kind: 'grammar',
      title: bi('The reflexive words', 'Възвратните думи'),
      blocks: [],
      grammarId: 'g-reflexive',
    },
    {
      id: 'a2u4l1-examples',
      kind: 'examples',
      title: bi('Saying how you are', 'Да кажеш как си'),
      blocks: [
        { t: 'de', de: 'Ich fühle mich nicht gut.', gloss: bi('I do not feel well.', 'Не се чувствам добре.'), audio: true },
        { t: 'de', de: 'Heute fühle ich mich besser.', gloss: bi('Today I feel better.', 'Днес се чувствам по-добре.'), audio: true },
        { t: 'de', de: 'Ich ruhe mich aus.', gloss: bi('I am resting.', 'Почивам си.'), audio: true },
        { t: 'de', de: 'Ich habe mich erkältet.', gloss: bi('I have caught a cold.', 'Настинах.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'The reflexive word stays right behind the verb, whatever else happens to the sentence — even when the verb splits (ruhe … aus) or the Perfekt sends a participle to the end.',
            'Възвратната дума си стои веднага след глагола, каквото и да става с изречението — дори когато глаголът се дели (ruhe … aus) или перфектът праща причастие в края.',
          ),
        },
      ],
    },
    {
      id: 'a2u4l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('mich, dich, sich, uns, euch, sich.', 'mich, dich, sich, uns, euch, sich.'),
            bi('It is part of the verb, so learn sich fühlen as one word.', 'Част е от глагола, затова учи sich fühlen като едно цяло.'),
            bi('It goes straight after the conjugated verb.', 'Идва веднага след спрегнатия глагол.'),
            bi('Ich fühle mich gut — never Ich fühle gut.', 'Ich fühle mich gut — никога Ich fühle gut.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      conjugate(
        'a2u4l1-ex1',
        'sich fühlen',
        bi('All six, with the reflexive word', 'И шестте, с възвратната дума'),
        ['fühle mich', 'fühlst dich', 'fühlt sich', 'fühlen uns', 'fühlt euch', 'fühlen sich'],
        ['v-sich-fuehlen'],
      ),
    ),
    a2(
      typeIt(
        'a2u4l1-ex2',
        bi('How you feel', 'Как се чувстваш'),
        [
          {
            prompt: bi('I do not feel well.', 'Не се чувствам добре.'),
            answer: 'Ich fühle mich nicht gut.',
            reviewTargets: ['v-sich-fuehlen', 'p-ich-fuehle-mich'],
            hints: [],
            traps: [
              {
                answer: 'Ich fühle nicht gut.',
                category: 'missing-word',
                feedback: bi(
                  'sich fühlen needs its reflexive word — English has nothing like it here, but German does not work without it: Ich fühle mich nicht gut.',
                  'sich fühlen иска възвратната си дума, точно както българското „чувствам се“: Ich fühle mich nicht gut.',
                ),
              },
              {
                answer: 'Ich fühle sich nicht gut.',
                category: 'pronoun',
                feedback: bi(
                  'sich is only for er/sie/es and Sie. For ich it is mich: Ich fühle mich nicht gut.',
                  'sich е само за er/sie/es и Sie. За ich е mich: Ich fühle mich nicht gut. (Българското „се“ не се мени, немското се мени.)',
                ),
              },
            ],
          },
          {
            prompt: bi('Today I feel better.', 'Днес се чувствам по-добре.'),
            answer: 'Heute fühle ich mich besser.',
            alternatives: ['Ich fühle mich heute besser.'],
            reviewTargets: ['v-besser'],
            hints: [],
          },
          {
            prompt: bi('I am resting.', 'Почивам си.'),
            answer: 'Ich ruhe mich aus.',
            reviewTargets: ['v-sich-ausruhen'],
            hints: [bi('Separable and reflexive at once.', 'Едновременно делим и възвратен.')],
          },
          {
            prompt: bi('I have caught a cold.', 'Настинах.'),
            answer: 'Ich habe mich erkältet.',
            reviewTargets: ['v-sich-erkaelten'],
            hints: [],
          },
        ],
        ['g-reflexive'],
      ),
    ),
    a2(
      fillBlank('a2u4l1-ex3', bi('Which word?', 'Коя дума?'), [
        {
          prompt: bi('He does not feel well.', 'Той не се чувства добре.'),
          scaffold: 'Er fühlt ___ nicht gut.',
          answer: 'sich',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('Do you feel better? (informal)', 'Чувстваш ли се по-добре?'),
          scaffold: 'Fühlst du ___ besser?',
          answer: 'dich',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('We feel good.', 'Чувстваме се добре.'),
          scaffold: 'Wir fühlen ___ gut.',
          answer: 'uns',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    a2(
      dictation('a2u4l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich fühle mich nicht gut.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe mich erkältet.',
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
        typeIt('a2u4l1-m1', bi('The reflexive habit', 'Възвратният навик'), [
          {
            prompt: bi('I do not feel well.', 'Не се чувствам добре.'),
            answer: 'Ich fühle mich nicht gut.',
            hints: [],
          },
          {
            prompt: bi('He feels better.', 'Той се чувства по-добре.'),
            answer: 'Er fühlt sich besser.',
            hints: [],
          },
          {
            prompt: bi('I am resting.', 'Почивам си.'),
            answer: 'Ich ruhe mich aus.',
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
        'The reflexive word is part of the verb and changes with the person. That is the whole rule, and the six forms are pronouns you already had.',
        'Възвратната дума е част от глагола и се мени по лице. Това е цялото правило, а шестте форми са местоимения, които вече имаше.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — giving advice
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a2-u4-l2',
  unitId: 'a2-u4',
  level: 'a2',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Giving advice: sollen and the imperative', 'Даване на съвет: sollen и заповедната форма'),
  objective: bi(
    'After this lesson you will be able to tell a friend what to do — politely with sollen, or directly with the imperative.',
    'След този урок ще можеш да кажеш на приятел какво да направи — учтиво със sollen или направо със заповедна форма.',
  ),
  outcomes: [
    bi('I can use sollen like the other modals.', 'Мога да използвам sollen като другите модални глаголи.'),
    bi('I can build the du-imperative.', 'Мога да образувам заповедната форма за du.'),
    bi('I can tell sollen from müssen.', 'Мога да различа sollen от müssen.'),
    bi('I can give three pieces of advice to someone who is ill.', 'Мога да дам три съвета на болен човек.'),
  ],
  vocabIds: ['v-sollen', 'v-helfen', 'v-der-tipp', 'v-das-medikament', 'v-die-tablette'],
  grammarIds: ['g-sollen', 'g-imperativ-du'],
  sections: [
    {
      id: 'a2u4l2-intro',
      kind: 'intro',
      title: bi('Two ways to say it', 'Два начина да го кажеш'),
      blocks: [
        {
          t: 'contrast',
          de: 'Du sollst viel Tee trinken. / Trink viel Tee!',
          other: bi(
            'You should drink a lot of tea. / Drink a lot of tea!',
            'Трябва да пиеш много чай. / Пий много чай!',
          ),
          note: bi(
            'The first is advice, the second is an instruction. Both are friendly.',
            'Първото е съвет, второто е указание. И двете са приятелски.',
          ),
        },
      ],
    },
    {
      id: 'a2u4l2-vocab',
      kind: 'vocabulary',
      title: bi('Advice and medicine', 'Съвети и лекарства'),
      vocabIds: ['v-sollen', 'v-helfen', 'v-der-tipp', 'v-das-medikament', 'v-die-tablette'],
      blocks: [],
    },
    {
      id: 'a2u4l2-grammar',
      kind: 'grammar',
      title: bi('sollen', 'sollen'),
      blocks: [],
      grammarId: 'g-sollen',
    },
    {
      id: 'a2u4l2-imperative',
      kind: 'grammar',
      title: bi('The du-imperative', 'Заповедната форма за du'),
      blocks: [],
      grammarId: 'g-imperativ-du',
    },
    {
      id: 'a2u4l2-examples',
      kind: 'examples',
      title: bi('What to tell someone who is ill', 'Какво да кажеш на болен човек'),
      blocks: [
        { t: 'de', de: 'Du sollst viel Tee trinken.', gloss: bi('You should drink a lot of tea.', 'Трябва да пиеш много чай.'), audio: true },
        { t: 'de', de: 'Trink viel Tee!', gloss: bi('Drink a lot of tea!', 'Пий много чай!'), audio: true },
        { t: 'de', de: 'Geh zum Arzt!', gloss: bi('Go to the doctor!', 'Иди на лекар!'), audio: true },
        { t: 'de', de: 'Ruh dich aus!', gloss: bi('Get some rest!', 'Почини си!'), audio: true },
        { t: 'de', de: 'Tee hilft gut.', gloss: bi('Tea helps a lot.', 'Чаят помага добре.'), audio: true },
      ],
    },
    {
      id: 'a2u4l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('sollen is a modal: second position, other verb at the end.', 'sollen е модален: втора позиция, другият глагол накрая.'),
            bi('Imperative: du-form, minus -st, minus du.', 'Заповедна форма: формата за du, без -st, без du.'),
            bi('A stem change stays: Nimm! An umlaut goes: Fahr!', 'Промяната на гласната остава: Nimm! Умлаутът пада: Fahr!'),
            bi('The reflexive word survives: Ruh dich aus!', 'Възвратната дума оцелява: Ruh dich aus!'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      fillBlank('a2u4l2-ex1', bi('Build the imperative', 'Построй заповедната форма'), [
        {
          prompt: bi('du trinkst → Drink!', 'du trinkst → Пий!'),
          scaffold: '___ viel Tee!',
          answer: 'Trink',
          shape: 'word',
          hints: [bi('Cut the -st.', 'Махни -st.')],
        },
        {
          prompt: bi('du gehst → Go!', 'du gehst → Иди!'),
          scaffold: '___ zum Arzt!',
          answer: 'Geh',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('du nimmst → Take!', 'du nimmst → Вземи!'),
          scaffold: '___ eine Tablette!',
          answer: 'Nimm',
          shape: 'word',
          reviewTargets: ['v-die-tablette'],
          hints: [bi('The stem change stays.', 'Промяната на гласната остава.')],
          traps: [
            {
              answer: 'Nehm',
              category: 'verb-conjugation',
              feedback: bi(
                'The imperative comes from the du-form, and du nimmst has the vowel change: Nimm!',
                'Заповедната форма идва от формата за du, а du nimmst има смяна на гласната: Nimm!',
              ),
            },
          ],
        },
      ]),
    ),
    a2(
      typeIt(
        'a2u4l2-ex2',
        bi('Give the advice', 'Дай съвета'),
        [
          {
            prompt: bi('You should drink a lot of tea.', 'Трябва да пиеш много чай.'),
            answer: 'Du sollst viel Tee trinken.',
            reviewTargets: ['v-sollen', 'p-du-sollst'],
            hints: [bi('Modal second, other verb last.', 'Модалният втори, другият глагол последен.')],
            traps: [
              {
                answer: 'Du sollst viel Tee trinkst.',
                category: 'verb-conjugation',
                feedback: bi(
                  'After a modal the second verb stays in the infinitive: Du sollst viel Tee trinken.',
                  'След модален глагол вторият остава в инфинитив: Du sollst viel Tee trinken.',
                ),
              },
            ],
          },
          {
            prompt: bi('Drink a lot of tea!', 'Пий много чай!'),
            answer: 'Trink viel Tee!',
            reviewTargets: ['p-imperativ-du'],
            hints: [],
          },
          {
            prompt: bi('Go to the doctor!', 'Иди на лекар!'),
            answer: 'Geh zum Arzt!',
            hints: [],
          },
          {
            prompt: bi('Get some rest!', 'Почини си!'),
            answer: 'Ruh dich aus!',
            hints: [bi('The reflexive word stays.', 'Възвратната дума остава.')],
          },
        ],
        ['g-sollen', 'g-imperativ-du'],
      ),
    ),
    a2(
      wordOrder('a2u4l2-ex3', bi('Advice with a modal', 'Съвет с модален глагол'), [
        {
          prompt: bi('You should go to the doctor.', 'Трябва да отидеш на лекар.'),
          bank: ['Du', 'sollst', 'zum', 'Arzt', 'gehen'],
          answer: 'Du sollst zum Arzt gehen.',
          hints: [],
        },
        {
          prompt: bi('I am supposed to rest.', 'Трябва да си почивам.'),
          bank: ['Ich', 'soll', 'mich', 'ausruhen'],
          answer: 'Ich soll mich ausruhen.',
          hints: [bi('The reflexive word comes right after the modal.', 'Възвратната дума идва веднага след модалния глагол.')],
        },
      ]),
    ),
    a2(
      dictation('a2u4l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Du sollst viel Tee trinken.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Geh zum Arzt!',
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
        typeIt('a2u4l2-m1', bi('Two ways to advise', 'Два начина за съвет'), [
          {
            prompt: bi('You should drink a lot of tea.', 'Трябва да пиеш много чай.'),
            answer: 'Du sollst viel Tee trinken.',
            hints: [],
          },
          {
            prompt: bi('Go to the doctor!', 'Иди на лекар!'),
            answer: 'Geh zum Arzt!',
            hints: [],
          },
          {
            prompt: bi('Take a tablet!', 'Вземи една таблетка!'),
            answer: 'Nimm eine Tablette!',
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
        'sollen behaves like every modal you know, and the imperative is the du-form with two things taken off. Neither is a new structure.',
        'sollen се държи като всеки модален глагол, който знаеш, а заповедната форма е формата за du с две махнати неща. Нито едното е нова конструкция.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — at the doctor
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a2-u4-l3',
  unitId: 'a2-u4',
  level: 'a2',
  order: 3,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('At the doctor: the whole visit', 'При лекаря: цялото посещение'),
  objective: bi(
    'After this lesson you will be able to get through a doctor\'s appointment: say what hurts, say how long, and understand the advice.',
    'След този урок ще можеш да преминеш през преглед: да кажеш какво те боли, откога и да разбереш съвета.',
  ),
  outcomes: [
    bi('I can name the parts of the body a doctor asks about.', 'Мога да назова частите на тялото, за които пита лекарят.'),
    bi('I can say what hurts with -schmerzen or tut weh.', 'Мога да кажа какво ме боли с -schmerzen или tut weh.'),
    bi('I can explain why I am there with weil.', 'Мога да обясня защо съм там с weil.'),
    bi('I can understand and repeat the advice.', 'Мога да разбера и да повторя съвета.'),
  ],
  vocabIds: ['v-der-ruecken', 'v-der-zahn', 'v-das-bein', 'v-der-arm', 'v-das-auge'],
  grammarIds: ['g-reflexive', 'g-sollen'],
  sections: [
    {
      id: 'a2u4l3-intro',
      kind: 'intro',
      title: bi('Everything in this lesson is a recombination', 'Всичко в този урок е прекомбинация'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'The compound rule is from A1 Unit 6, weil is from A2 Unit 2, the reflexive word is from this unit. The only new thing is five body parts — and the sentences build themselves.',
            'Правилото за сложните думи е от раздел 6 на A1, weil е от раздел 2 на A2, възвратната дума е от този раздел. Единственото ново са пет части на тялото — а изреченията се строят сами.',
          ),
        },
      ],
    },
    {
      id: 'a2u4l3-vocab',
      kind: 'vocabulary',
      title: bi('Five more parts of the body', 'Още пет части на тялото'),
      vocabIds: ['v-der-ruecken', 'v-der-zahn', 'v-das-bein', 'v-der-arm', 'v-das-auge'],
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          only: ['bg'],
          text: bi(
            '',
            'Внимавай с крака: немският различава das Bein (крак от бедрото надолу) от der Fuß (стъпало). Българското „крак“ покрива и двете, така че тук трябва да се избира.',
          ),
        },
      ],
    },
    {
      id: 'a2u4l3-examples',
      kind: 'examples',
      title: bi('The appointment', 'Прегледът'),
      blocks: [
        { t: 'de', de: 'Ich habe Rückenschmerzen.', gloss: bi('I have back pain.', 'Боли ме гърбът.'), audio: true },
        { t: 'de', de: 'Mein Zahn tut weh.', gloss: bi('My tooth hurts.', 'Боли ме зъбът.'), audio: true },
        { t: 'de', de: 'Ich bin hier, weil ich mich nicht gut fühle.', gloss: bi('I am here because I do not feel well.', 'Тук съм, защото не се чувствам добре.'), audio: true },
        { t: 'de', de: 'Sie sollen sich ausruhen.', gloss: bi('You should rest.', 'Трябва да си почивате.'), audio: true },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'Look at the third one: weil sends fühle to the end, and the reflexive word mich goes with it. "…, weil ich mich nicht gut fühle."',
            'Виж третото: weil праща fühle в края, а възвратната дума mich върви с него. „…, weil ich mich nicht gut fühle.“',
          ),
        },
      ],
    },
    {
      id: 'a2u4l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Rücken, Zahn, Bein, Arm, Auge.', 'Rücken, Zahn, Bein, Arm, Auge.'),
            bi('Body part + schmerzen = one word.', 'Част на тялото + schmerzen = една дума.'),
            bi('Mein Zahn tut weh, for a single thing.', 'Mein Zahn tut weh, за едно нещо.'),
            bi('weil moves the verb and takes the reflexive word with it.', 'weil мести глагола и взима възвратната дума със себе си.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a2(
      typeIt(
        'a2u4l3-ex1',
        bi('What hurts', 'Какво те боли'),
        [
          {
            prompt: bi('I have back pain.', 'Боли ме гърбът.'),
            answer: 'Ich habe Rückenschmerzen.',
            reviewTargets: ['v-der-ruecken'],
            hints: [bi('One word.', 'Една дума.')],
          },
          {
            prompt: bi('My tooth hurts.', 'Боли ме зъбът.'),
            answer: 'Mein Zahn tut weh.',
            reviewTargets: ['v-der-zahn'],
            hints: [],
          },
          {
            prompt: bi('My leg hurts.', 'Боли ме кракът.'),
            answer: 'Mein Bein tut weh.',
            reviewTargets: ['v-das-bein'],
            hints: [],
          },
        ],
      ),
    ),
    a2(
      typeIt(
        'a2u4l3-ex2',
        bi('The whole visit', 'Целият преглед'),
        [
          {
            prompt: bi('I am here because I do not feel well.', 'Тук съм, защото не се чувствам добре.'),
            answer: 'Ich bin hier, weil ich mich nicht gut fühle.',
            reviewTargets: ['v-weil', 'v-sich-fuehlen'],
            hints: [bi('fühle goes last; mich goes with it.', 'fühle отива последно; mich върви с него.')],
            traps: [
              {
                answer: 'Ich bin hier, weil ich fühle mich nicht gut.',
                category: 'word-order',
                feedback: bi(
                  'After weil the verb goes to the end, and the reflexive word stays in front of it: weil ich mich nicht gut fühle.',
                  'След weil глаголът отива в края, а възвратната дума остава пред него: weil ich mich nicht gut fühle.',
                ),
              },
            ],
          },
          {
            prompt: bi('I have caught a cold.', 'Настинах.'),
            answer: 'Ich habe mich erkältet.',
            hints: [],
          },
          {
            prompt: bi('You should rest. (formal)', 'Трябва да си почивате.'),
            answer: 'Sie sollen sich ausruhen.',
            hints: [],
          },
        ],
      ),
    ),
    a2(
      dictation('a2u4l3-ex3', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich habe Rückenschmerzen.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Mein Zahn tut weh.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a2(
      freeWriting('a2u4l3-ex4', bi('Tell the doctor', 'Кажи на лекаря'), [
        {
          prompt: bi(
            'Write three sentences at the doctor: say how you feel, say what hurts, and say why you came.',
            'Напиши три изречения при лекаря: как се чувстваш, какво те боли и защо си дошъл.',
          ),
          instruction: bi(
            'A reflexive verb and weil both have to appear.',
            'Трябва да се появят възвратен глагол и weil.',
          ),
          answer:
            'Ich fühle mich nicht gut. Ich habe Rückenschmerzen. Ich bin hier, weil ich mich erkältet habe.',
          shape: 'sentence',
          requiredTokens: ['mich', 'weil'],
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      a2(
        typeIt('a2u4l3-m1', bi('At the doctor', 'При лекаря'), [
          {
            prompt: bi('I have back pain.', 'Боли ме гърбът.'),
            answer: 'Ich habe Rückenschmerzen.',
            hints: [],
          },
          {
            prompt: bi('I am here because I do not feel well.', 'Тук съм, защото не се чувствам добре.'),
            answer: 'Ich bin hier, weil ich mich nicht gut fühle.',
            hints: [],
          },
          {
            prompt: bi('Take a tablet!', 'Вземи една таблетка!'),
            answer: 'Nimm eine Tablette!',
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
        'A whole doctor\'s appointment, built almost entirely from rules you already had. That is what a level looks like when it is working.',
        'Цял преглед при лекар, построен почти изцяло от правила, които вече имаше. Така изглежда ниво, което работи.',
      ),
    },
  ],
};

/* ================================================================== *
 * Checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a2-u4',
  scope: 'unit',
  targetId: 'a2-u4',
  status: 'available',
  title: bi('Unit 4 checkpoint', 'Проверка на раздел 4'),
  description: bi(
    'How you feel, what hurts, and what somebody ought to do about it.',
    'Как се чувстваш, какво те боли и какво е редно да се направи.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a2(
      typeIt('cp-a2u4-1', bi('How you feel', 'Как се чувстваш'), [
        {
          prompt: bi('I do not feel well.', 'Не се чувствам добре.'),
          answer: 'Ich fühle mich nicht gut.',
          hints: [],
        },
        {
          prompt: bi('He feels better.', 'Той се чувства по-добре.'),
          answer: 'Er fühlt sich besser.',
          hints: [],
        },
        {
          prompt: bi('I have caught a cold.', 'Настинах.'),
          answer: 'Ich habe mich erkältet.',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u4-2', bi('Advice', 'Съвет'), [
        {
          prompt: bi('You should drink a lot of tea.', 'Трябва да пиеш много чай.'),
          answer: 'Du sollst viel Tee trinken.',
          hints: [],
        },
        {
          prompt: bi('Go to the doctor!', 'Иди на лекар!'),
          answer: 'Geh zum Arzt!',
          hints: [],
        },
        {
          prompt: bi('Take a tablet!', 'Вземи една таблетка!'),
          answer: 'Nimm eine Tablette!',
          hints: [],
        },
      ]),
    ),
    a2(
      typeIt('cp-a2u4-3', bi('At the doctor', 'При лекаря'), [
        {
          prompt: bi('I have back pain.', 'Боли ме гърбът.'),
          answer: 'Ich habe Rückenschmerzen.',
          hints: [],
        },
        {
          prompt: bi('I am here because I do not feel well.', 'Тук съм, защото не се чувствам добре.'),
          answer: 'Ich bin hier, weil ich mich nicht gut fühle.',
          hints: [],
        },
      ]),
    ),
    a2(
      exercise({
        id: 'cp-a2u4-4',
        kind: 'fillBlank',
        level: 'a2',
        objective: bi('The reflexive word', 'Възвратната дума'),
        steps: [
          {
            prompt: bi('She does not feel well.', 'Тя не се чувства добре.'),
            scaffold: 'Sie fühlt ___ nicht gut.',
            answer: 'sich',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('Do you feel better? (informal)', 'Чувстваш ли се по-добре?'),
            scaffold: 'Fühlst du ___ besser?',
            answer: 'dich',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a2(
      dictation('cp-a2u4-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich fühle mich nicht gut.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Du sollst viel Tee trinken.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A2_UNIT_4: Unit = {
  id: 'a2-u4',
  level: 'a2',
  order: 4,
  status: 'available',
  title: bi('Health and advice', 'Здраве и съвети'),
  summary: bi(
    'Reflexive verbs — where a Bulgarian speaker already has the idea and an English speaker has to add a word their language forbids — plus sollen and the informal imperative.',
    'Възвратни глаголи — където българинът вече има идеята, а англоговорящият трябва да добави дума, която езикът му забранява — плюс sollen и неформалната заповедна форма.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A2_U4_PATTERNS = PATTERNS;
