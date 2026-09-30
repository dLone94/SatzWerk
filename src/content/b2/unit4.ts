import { bi, dictation, fillBlank, freeWriting, typeIt, wordOrder } from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B2 Unit 4 — Formal written German.
 *
 * Unit 3 taught reading written German; this is writing it, and with a
 * purpose: every example in the unit belongs to a letter that has to achieve
 * something — a defect remedied, a refund paid, a deadline acknowledged.
 *
 * That framing decides the grammar. **Funktionsverbgefüge** (lesson 1) are
 * the noun-plus-verb pairs officialdom runs on, where the noun means
 * everything and the verb almost nothing: *Bezug nehmen auf*, *in Anspruch
 * nehmen*, *zur Verfügung stellen*. Both paths need the same warning here
 * rather than different ones, because the trap is the same from either side:
 * the individual words mislead, and nobody is taking anything.
 *
 * **The genitive prepositions** (lesson 2) are where B1 Unit 4's register
 * lesson comes due. aufgrund, trotz, während, innerhalb and hinsichtlich all
 * demand the case that only survives in writing, and neither English
 * ("because of the delay") nor Bulgarian („поради забавянето“) marks a case at
 * all — so there is nothing to transfer and the endings have to be built.
 *
 * **Written politeness** (lesson 3) is the interesting one, because both
 * paths have a formal register and both are wrong here in the same direction.
 * English asks by questioning — "Could you possibly let me know" — and
 * Bulgarian asks with „бихте ли“. German does not ask: it states a fact about
 * itself. *Ich bitte um eine Bestätigung* is not brusque, it is standard, and
 * the politeness sits in the Konjunktiv II and the fixed frame rather than in
 * hedging.
 */

/** Everything in this file is B2. */
const b2 = (ex: Exercise): Exercise => ({ ...ex, level: 'b2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-bezug-nehmend',
    template: 'Bezug nehmend auf Ihr Schreiben vom ___',
    example: 'Bezug nehmend auf Ihr Schreiben vom 3. Mai teile ich Ihnen Folgendes mit.',
    gloss: bi(
      'With reference to your letter of 3 May, I inform you of the following.',
      'Във връзка с Вашето писмо от 3 май Ви съобщавам следното.',
    ),
    level: 'b2',
    grammarIds: ['g-funktionsverben'],
  },
  {
    id: 'p-aufgrund-genitiv',
    template: 'Aufgrund ___ bitte ich um ___.',
    example: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
    gloss: bi('Because of the delay I request a refund.', 'Поради забавянето моля за възстановяване на сумата.'),
    level: 'b2',
    grammarIds: ['g-genitivpraepositionen'],
  },
  {
    id: 'p-waere-dankbar',
    template: 'Ich wäre Ihnen dankbar, wenn Sie ___ würden.',
    example: 'Ich wäre Ihnen dankbar, wenn Sie den Mangel beheben würden.',
    gloss: bi(
      'I would be grateful if you would remedy the defect.',
      'Бих Ви бил благодарен, ако отстраните дефекта.',
    ),
    level: 'b2',
    grammarIds: ['g-schriftliche-hoeflichkeit'],
  },
  {
    id: 'p-hinweisen-dass',
    template: 'Ich möchte Sie darauf hinweisen, dass ___.',
    example: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
    gloss: bi(
      'I would like to point out that the deadline has passed.',
      'Бих искал да Ви обърна внимание, че срокът е изтекъл.',
    ),
    level: 'b2',
    grammarIds: ['g-schriftliche-hoeflichkeit'],
  },
];

/* ================================================================== *
 * Lesson 1 — the complaint that gets answered
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b2-u4-l1',
  unitId: 'b2-u4',
  level: 'b2',
  order: 1,
  status: 'available',
  estimatedMinutes: 32,
  title: bi('With reference to your letter', 'Във връзка с Вашето писмо'),
  objective: bi(
    'After this lesson you can open a formal complaint the way German opens one, and use the noun-and-verb pairs that official language is built from.',
    'След този урок можеш да откриеш официална жалба така, както го прави немският, и да използваш двойките съществително плюс глагол, от които е изграден официалният език.',
  ),
  outcomes: [
    bi('I can refer to earlier correspondence.', 'Мога да се позова на предишна кореспонденция.'),
    bi('I use Funktionsverbgefüge as whole units.', 'Използвам Funktionsverbgefüge като цели единици.'),
    bi('I can name a defect in the word a warranty uses.', 'Мога да назова дефект с думата, с която е написана гаранцията.'),
    bi('I can state what I want done and by when.', 'Мога да заявя какво искам да се направи и до кога.'),
  ],
  vocabIds: [
    'v-der-mangel',
    'v-die-reklamation',
    'v-beheben',
    'v-die-rueckerstattung',
    'v-die-lieferung',
    'v-die-gewaehrleistung',
  ],
  grammarIds: ['g-funktionsverben'],
  sections: [
    {
      id: 'b2u4l1-intro',
      kind: 'intro',
      title: bi('Two letters, one outcome each', 'Две писма, по един изход'),
      blocks: [
        {
          t: 'contrast',
          de: 'Das Ding ist kaputt und ich will mein Geld zurück.',
          other: bi(
            'Every word correct. It will be understood, and then filed.',
            'Всяка дума е правилна. Ще бъде разбрано и после — архивирано.',
          ),
        },
        {
          t: 'de',
          de: 'Bezug nehmend auf Ihr Schreiben vom 3. Mai bitte ich um die Rückerstattung des Kaufpreises.',
          gloss: bi(
            'With reference to your letter of 3 May, I request a refund of the purchase price.',
            'Във връзка с Вашето писмо от 3 май моля за възстановяване на покупната цена.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'The second one is not more polite. It is more expensive to ignore, because it speaks the language the file is kept in.',
            'Второто не е по-учтиво. То е по-скъпо за игнориране, защото говори езика, на който се води преписката.',
          ),
        },
      ],
    },
    {
      id: 'b2u4l1-vocab',
      kind: 'vocabulary',
      title: bi('The words a complaint is made of', 'Думите, от които е направена една жалба'),
      vocabIds: [
        'v-der-mangel',
        'v-die-reklamation',
        'v-beheben',
        'v-die-rueckerstattung',
        'v-die-lieferung',
        'v-die-gewaehrleistung',
      ],
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          title: bi('Reklamation or Beschwerde?', 'Reklamation или Beschwerde?'),
          text: bi(
            'A **Reklamation** is about a product or a service: it arrived broken, it does not work, it never came. A **Beschwerde** is about treatment: somebody was rude, a decision was unfair. They go to different desks, and using the wrong word sends your letter to the wrong one.',
            '**Reklamation** е за стока или услуга: пристигнала е счупена, не работи, изобщо не е дошла. **Beschwerde** е за отношение: някой е бил груб, решението е несправедливо. Отиват при различни служители и сгрешената дума праща писмото ти при грешния.',
          ),
        },
      ],
    },
    {
      id: 'b2u4l1-grammar',
      kind: 'grammar',
      title: bi('Noun carries, verb follows', 'Съществителното носи, глаголът следва'),
      blocks: [],
      grammarId: 'g-funktionsverben',
    },
    {
      id: 'b2u4l1-examples',
      kind: 'examples',
      title: bi('The opening moves', 'Началните ходове'),
      blocks: [
        {
          t: 'de',
          de: 'Betreff: Reklamation zur Bestellung 4711',
          gloss: bi('Subject: complaint regarding order 4711', 'Относно: рекламация по поръчка 4711'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Lieferung ist beschädigt bei mir angekommen.',
          gloss: bi('The delivery arrived damaged.', 'Доставката пристигна повредена.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
          gloss: bi('I would like to claim under the statutory warranty.', 'Бих искал да се възползвам от законовата гаранция.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Bitte beheben Sie den Mangel bis zum 15. März.',
          gloss: bi('Please remedy the defect by 15 March.', 'Моля, отстранете дефекта до 15 март.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u4l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Bezug nehmen auf + accusative: refer to earlier correspondence.', 'Bezug nehmen auf + винителен падеж: позоваване на предишна кореспонденция.'),
            bi('in Anspruch nehmen: claim something you are entitled to.', 'in Anspruch nehmen: да предявиш нещо, на което имаш право.'),
            bi('ein Mangel, not kaputt. Gewährleistung is the law; Garantie is a promise.', 'ein Mangel, а не kaputt. Gewährleistung е законът; Garantie е обещание.'),
            bi('Name a date. A complaint without a deadline is a comment.', 'Посочи дата. Жалба без срок е просто коментар.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u4l1-ex1', bi('Complete the fixed phrase', 'Допълни устойчивия израз'), [
        {
          prompt: bi('refer to your letter', 'позоваване на писмото ви'),
          scaffold: 'Bezug ___ auf Ihr Schreiben vom 3. Mai …',
          answer: 'nehmend',
          shape: 'word',
          hints: [bi('A Partizip I, as in Unit 3.', 'Partizip I, както в раздел 3.')],
        },
        {
          prompt: bi('claim the warranty', 'да се възползвам от гаранцията'),
          scaffold: 'Ich möchte die Gewährleistung in ___ nehmen.',
          answer: 'Anspruch',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('make documents available', 'да предоставя документи'),
          scaffold: 'Die Unterlagen stelle ich Ihnen zur ___.',
          answer: 'Verfügung',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('remedy the defect', 'да отстраня дефекта'),
          scaffold: 'Bitte ___ Sie den Mangel bis zum 15. März.',
          answer: 'beheben',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      wordOrder('b2u4l1-ex2', bi('Open the letter', 'Открий писмото'), [
        {
          prompt: bi(
            'With reference to your letter of 3 May, I request a refund.',
            'Във връзка с Вашето писмо от 3 май моля за възстановяване на сумата.',
          ),
          bank: ['Bezug', 'nehmend', 'auf', 'Ihr', 'Schreiben', 'vom', '3.', 'Mai', 'bitte', 'ich', 'um', 'eine', 'Rückerstattung.'],
          answer: 'Bezug nehmend auf Ihr Schreiben vom 3. Mai bitte ich um eine Rückerstattung.',
          hints: [bi('The whole opening phrase is position one, so the verb comes next.', 'Целият начален израз е първа позиция, затова глаголът идва след него.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u4l1-ex3',
        bi('Write the complaint', 'Напиши жалбата'),
        [
          {
            prompt: bi('The delivery arrived damaged.', 'Доставката пристигна повредена.'),
            answer: 'Die Lieferung ist beschädigt bei mir angekommen.',
            alternatives: [
              'Die Lieferung ist beschädigt angekommen.',
              'Die Lieferung kam beschädigt bei mir an.',
              'Die Lieferung kam beschädigt an.',
            ],
            reviewTargets: ['v-die-lieferung'],
            hints: [],
          },
          {
            prompt: bi('I would like to claim under the statutory warranty.', 'Бих искал да се възползвам от законовата гаранция.'),
            answer: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
            reviewTargets: ['v-die-gewaehrleistung'],
            hints: [],
          },
          {
            prompt: bi('Please remedy the defect by 15 March.', 'Моля, отстранете дефекта до 15 март.'),
            answer: 'Bitte beheben Sie den Mangel bis zum 15. März.',
            reviewTargets: ['v-beheben', 'v-der-mangel'],
            hints: [],
          },
          {
            prompt: bi('I request a refund of the purchase price.', 'Моля за възстановяване на покупната цена.'),
            answer: 'Ich bitte um die Rückerstattung des Kaufpreises.',
            alternatives: [
              'Ich bitte um eine Rückerstattung des Kaufpreises.',
              'Ich bitte um Rückerstattung des Kaufpreises.',
            ],
            reviewTargets: ['v-die-rueckerstattung', 'v-bitten-um'],
            hints: [bi('bitten um + accusative, then a genitive behind the noun.', 'bitten um + винителен падеж, после родителен зад съществителното.')],
          },
          {
            prompt: bi('I would like to submit a complaint.', 'Бих искал да подам рекламация.'),
            answer: 'Ich möchte eine Reklamation einreichen.',
            reviewTargets: ['v-die-reklamation', 'v-einreichen'],
            hints: [],
          },
        ],
        ['g-funktionsverben'],
      ),
    ),
    b2(
      dictation('b2u4l1-ex4', bi('A letter, dictated', 'Писмо под диктовка'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Bitte beheben Sie den Mangel bis zum 15. März.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        typeIt('b2u4l1-m1', bi('Three lines of a complaint', 'Три реда от жалба'), [
          {
            prompt: bi('The delivery arrived damaged.', 'Доставката пристигна повредена.'),
            answer: 'Die Lieferung ist beschädigt bei mir angekommen.',
            alternatives: [
              'Die Lieferung ist beschädigt angekommen.',
              'Die Lieferung kam beschädigt bei mir an.',
              'Die Lieferung kam beschädigt an.',
            ],
            hints: [],
          },
          {
            prompt: bi('I would like to claim under the statutory warranty.', 'Бих искал да се възползвам от законовата гаранция.'),
            answer: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
            hints: [],
          },
          {
            prompt: bi('Please remedy the defect by 15 March.', 'Моля, отстранете дефекта до 15 март.'),
            answer: 'Bitte beheben Sie den Mangel bis zum 15. März.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — the prepositions of officialdom
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b2-u4-l2',
  unitId: 'b2-u4',
  level: 'b2',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Because of, despite, within', 'Поради, въпреки, в рамките на'),
  objective: bi(
    'After this lesson you can join the parts of a formal letter with the prepositions it expects, in the case it expects.',
    'След този урок можеш да свързваш частите на официално писмо с предлозите, които то очаква, и в падежа, който изисква.',
  ),
  outcomes: [
    bi('I can use aufgrund, trotz, während, innerhalb and hinsichtlich.', 'Мога да използвам aufgrund, trotz, während, innerhalb и hinsichtlich.'),
    bi('I build the genitive after them without thinking twice.', 'Образувам родителния падеж след тях, без да се замислям.'),
    bi('I know wegen dem Mangel is speech, not writing.', 'Знам, че wegen dem Mangel е говор, а не писмо.'),
    bi('I can lay out the parts of a German letter.', 'Мога да подредя частите на немско писмо.'),
  ],
  vocabIds: [
    'v-der-betreff',
    'v-das-schreiben',
    'v-der-anhang',
    'v-beiliegend',
    'v-der-eingang',
    'v-die-bestaetigung',
  ],
  grammarIds: ['g-genitivpraepositionen'],
  sections: [
    {
      id: 'b2u4l2-intro',
      kind: 'intro',
      title: bi('The case that only writing keeps', 'Падежът, който само писането пази'),
      blocks: [
        {
          t: 'contrast',
          de: 'wegen dem Mangel',
          other: bi(
            'What you will hear every day. Not what you write.',
            'Това ще го чуваш всеки ден. Но не се пише така.',
          ),
        },
        {
          t: 'de',
          de: 'aufgrund des Mangels',
          gloss: bi('because of the defect', 'поради дефекта'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'B1 said the genitive was a matter of register rather than of correctness. This is where that comes due: the prepositions a letter needs are exactly the ones that demand it.',
            'В B1 беше казано, че родителният падеж е въпрос на регистър, а не на правилност. Тук това идва на падеж: предлозите, които писмото използва, са точно онези, които го изискват.',
          ),
        },
      ],
    },
    {
      id: 'b2u4l2-vocab',
      kind: 'vocabulary',
      title: bi('The parts of a letter', 'Частите на писмото'),
      vocabIds: [
        'v-der-betreff',
        'v-das-schreiben',
        'v-der-anhang',
        'v-beiliegend',
        'v-der-eingang',
        'v-die-bestaetigung',
      ],
      blocks: [],
    },
    {
      id: 'b2u4l2-grammar',
      kind: 'grammar',
      title: bi('Five prepositions, one case', 'Пет предлога, един падеж'),
      blocks: [],
      grammarId: 'g-genitivpraepositionen',
    },
    {
      id: 'b2u4l2-examples',
      kind: 'examples',
      title: bi('A letter, joined up', 'Свързано писмо'),
      blocks: [
        {
          t: 'de',
          de: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
          gloss: bi('Because of the delay I request a refund.', 'Поради забавянето моля за възстановяване на сумата.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Trotz mehrerer Anrufe wurde der Mangel nicht behoben.',
          gloss: bi('Despite several phone calls the defect was not remedied.', 'Въпреки няколкото обаждания дефектът не беше отстранен.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich bitte Sie, den Betrag innerhalb einer Woche zu überweisen.',
          gloss: bi('I ask you to transfer the amount within a week.', 'Моля Ви да преведете сумата в рамките на една седмица.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Beiliegend erhalten Sie eine Kopie der Rechnung.',
          gloss: bi('Please find enclosed a copy of the invoice.', 'Приложено получавате копие от фактурата.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u4l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('aufgrund, trotz, während, innerhalb, hinsichtlich — all genitive.', 'aufgrund, trotz, während, innerhalb, hinsichtlich — всички с родителен падеж.'),
            bi('des + -s for masculine and neuter, der for feminine and plural.', 'des + -s за мъжки и среден род, der за женски и множествено число.'),
            bi('wegen dem … is spoken German. In a letter: aufgrund des …', 'wegen dem … е говорим немски. В писмо: aufgrund des …'),
            bi('Betreff names the matter with no verb and no article.', 'Betreff назовава въпроса без глагол и без член.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u4l2-ex1', bi('The genitive ending', 'Окончанието за родителен падеж'), [
        {
          prompt: bi('der Mangel — because of the defect', 'der Mangel — поради дефекта'),
          scaffold: 'aufgrund ___ Mangels',
          answer: 'des',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('die Verzögerung — because of the delay', 'die Verzögerung — поради забавянето'),
          scaffold: 'aufgrund ___ Verzögerung',
          answer: 'der',
          shape: 'word',
          hints: [bi('Feminine takes der and the noun stays as it is.', 'Женски род иска der, а съществителното не се променя.')],
        },
        {
          prompt: bi('eine Woche — within a week', 'eine Woche — в рамките на една седмица'),
          scaffold: 'innerhalb ___ Woche',
          answer: 'einer',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('das Schreiben — with regard to your letter', 'das Schreiben — по отношение на Вашето писмо'),
          scaffold: 'hinsichtlich ___ Schreibens',
          answer: 'Ihres',
          shape: 'word',
          hints: [bi('Your, neuter, genitive.', 'Вашето, среден род, родителен падеж.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u4l2-ex2',
        bi('Join the letter up', 'Свържи писмото'),
        [
          {
            prompt: bi('Because of the delay I request a refund.', 'Поради забавянето моля за възстановяване на сумата.'),
            answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
            reviewTargets: ['p-aufgrund-genitiv', 'v-die-verzoegerung'],
            hints: [],
            traps: [
              {
                answer: 'Aufgrund die Verzögerung bitte ich um eine Rückerstattung.',
                category: 'case',
                feedback: bi(
                  'aufgrund takes the genitive, so the feminine article becomes der: aufgrund der Verzögerung.',
                  'aufgrund иска родителен падеж, затова членът за женски род става der: aufgrund der Verzögerung.',
                ),
              },
            ],
          },
          {
            prompt: bi('Despite several phone calls the defect was not remedied.', 'Въпреки няколкото обаждания дефектът не беше отстранен.'),
            answer: 'Trotz mehrerer Anrufe wurde der Mangel nicht behoben.',
            reviewTargets: ['v-der-mangel', 'v-beheben'],
            hints: [],
          },
          {
            prompt: bi('I ask you to transfer the amount within a week.', 'Моля Ви да преведете сумата в рамките на една седмица.'),
            answer: 'Ich bitte Sie, den Betrag innerhalb einer Woche zu überweisen.',
            reviewTargets: ['v-die-ueberweisung'],
            hints: [bi('zu + infinitive at the end, after a comma.', 'zu + инфинитив накрая, след запетая.')],
          },
          {
            prompt: bi('Please find enclosed a copy of the invoice.', 'Приложено получавате копие от фактурата.'),
            answer: 'Beiliegend erhalten Sie eine Kopie der Rechnung.',
            reviewTargets: ['v-beiliegend', 'v-rechnung'],
            hints: [],
          },
          {
            prompt: bi('Please confirm receipt of this letter.', 'Моля, потвърдете получаването на това писмо.'),
            answer: 'Bitte bestätigen Sie den Eingang dieses Schreibens.',
            reviewTargets: ['v-der-eingang', 'v-das-schreiben'],
            hints: [],
          },
        ],
        ['g-genitivpraepositionen'],
      ),
    ),
    b2(
      dictation('b2u4l2-ex3', bi('Hearing the genitive', 'Да чуеш родителния падеж'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Trotz mehrerer Anrufe wurde der Mangel nicht behoben.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        fillBlank('b2u4l2-m1', bi('Genitive after the preposition', 'Родителен падеж след предлога'), [
          {
            prompt: bi('der Mangel', 'der Mangel'),
            scaffold: 'aufgrund ___ Mangels',
            answer: 'des',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('die Verzögerung', 'die Verzögerung'),
            scaffold: 'trotz ___ Verzögerung',
            answer: 'der',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
      b2(
        typeIt('b2u4l2-m2', bi('Two formal sentences', 'Две официални изречения'), [
          {
            prompt: bi('Because of the delay I request a refund.', 'Поради забавянето моля за възстановяване на сумата.'),
            answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
            hints: [],
          },
          {
            prompt: bi('Please confirm receipt of this letter.', 'Моля, потвърдете получаването на това писмо.'),
            answer: 'Bitte bestätigen Sie den Eingang dieses Schreibens.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — firm, and never loud
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b2-u4-l3',
  unitId: 'b2-u4',
  level: 'b2',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('I would be grateful if you would', 'Бих Ви бил благодарен, ако'),
  objective: bi(
    'After this lesson you can ask for something in writing the way German asks: as a statement about yourself, at a polite distance, with a consequence attached.',
    'След този урок можеш да поискаш нещо в писмен вид така, както го прави немският: като твърдение за себе си, от учтива дистанция и с посочена последица.',
  ),
  outcomes: [
    bi('I use Ich bitte um … instead of asking a question.', 'Използвам Ich bitte um … вместо въпрос.'),
    bi('I can raise the pressure without raising the voice.', 'Мога да повиша натиска, без да повишавам тон.'),
    bi('I can point out an error politely.', 'Мога да посоча грешка учтиво.'),
    bi('I can state a consequence with Sollte …', 'Мога да посоча последица със Sollte …'),
  ],
  vocabIds: [
    'v-hinweisen',
    'v-bitten-um',
    'v-umgehend',
    'v-fristgerecht',
    'v-die-angelegenheit',
    'v-die-klaerung',
  ],
  grammarIds: ['g-schriftliche-hoeflichkeit'],
  sections: [
    {
      id: 'b2u4l3-intro',
      kind: 'intro',
      title: bi('German does not ask. It states.', 'Немският не пита. Той съобщава.'),
      blocks: [
        {
          t: 'p',
          only: ['en'],
          text: bi(
            'English asks by questioning: "Could you possibly let me know …?" Translated, that comes out either odd or weak.',
            '',
          ),
        },
        {
          t: 'p',
          only: ['bg'],
          text: bi(
            '',
            'Българското официално писмо моли с въпрос: „Бихте ли ми потвърдили …“. Немското не пита.',
          ),
        },
        {
          t: 'de',
          de: 'Ich bitte um eine schriftliche Bestätigung.',
          gloss: bi('I request a written confirmation.', 'Моля за писмено потвърждение.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'A statement about what you are doing — asking — rather than a question about what the reader might do. It is standard, not brusque, and it gets an answer.',
            'Твърдение за това, което ти правиш — молиш — а не въпрос какво евентуално би направил четящият. Това е стандартът, не е рязко и получава отговор.',
          ),
        },
      ],
    },
    {
      id: 'b2u4l3-vocab',
      kind: 'vocabulary',
      title: bi('Asking, pointing out, insisting', 'Молба, посочване, настояване'),
      vocabIds: [
        'v-hinweisen',
        'v-bitten-um',
        'v-umgehend',
        'v-fristgerecht',
        'v-die-angelegenheit',
        'v-die-klaerung',
      ],
      blocks: [],
    },
    {
      id: 'b2u4l3-grammar',
      kind: 'grammar',
      title: bi('The four frames', 'Четирите рамки'),
      blocks: [],
      grammarId: 'g-schriftliche-hoeflichkeit',
    },
    {
      id: 'b2u4l3-examples',
      kind: 'examples',
      title: bi('The ladder, one rung at a time', 'Стълбицата, стъпало по стъпало'),
      blocks: [
        {
          t: 'de',
          de: 'Ich bitte um eine umgehende Antwort.',
          gloss: bi('I request an immediate reply.', 'Моля за незабавен отговор.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich wäre Ihnen dankbar, wenn Sie den Mangel bis zum 15. März beheben würden.',
          gloss: bi(
            'I would be grateful if you would remedy the defect by 15 March.',
            'Бих Ви бил благодарен, ако отстраните дефекта до 15 март.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
          gloss: bi(
            'I would like to point out that the deadline has passed.',
            'Бих искал да Ви обърна внимание, че срокът е изтекъл.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Sollte ich bis dahin nichts hören, behalte ich mir weitere Schritte vor.',
          gloss: bi(
            'Should I not hear anything by then, I reserve the right to take further steps.',
            'Ако до тогава не получа отговор, си запазвам правото да предприема по-нататъшни стъпки.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u4l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Ich bitte um + accusative. Never Ich will.', 'Ich bitte um + винителен падеж. Никога Ich will.'),
            bi('Ich wäre Ihnen dankbar, wenn … + würde at the end.', 'Ich wäre Ihnen dankbar, wenn … + würde накрая.'),
            bi('Ich möchte Sie darauf hinweisen, dass … is a warning in good manners.', 'Ich möchte Sie darauf hinweisen, dass … е предупреждение с добри маниери.'),
            bi('Sollte …, behalte ich mir … vor: the last rung before a lawyer.', 'Sollte …, behalte ich mir … vor: последното стъпало преди адвокат.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u4l3-ex1', bi('Complete the frame', 'Допълни рамката'), [
        {
          prompt: bi('a request', 'молба'),
          scaffold: 'Ich ___ um eine schriftliche Bestätigung.',
          answer: 'bitte',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a firmer request — Konjunktiv II', 'по-настоятелна молба — Konjunktiv II'),
          scaffold: 'Ich ___ Ihnen dankbar, wenn Sie den Mangel beheben würden.',
          answer: 'wäre',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a polite warning', 'учтиво предупреждение'),
          scaffold: 'Ich möchte Sie darauf ___, dass die Frist abgelaufen ist.',
          answer: 'hinweisen',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a consequence', 'последица'),
          scaffold: '___ ich bis dahin nichts hören, behalte ich mir weitere Schritte vor.',
          answer: 'Sollte',
          shape: 'word',
          hints: [bi('A conditional without wenn: the verb comes first.', 'Условно изречение без wenn: глаголът е първи.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u4l3-ex2',
        bi('Ask, firmly', 'Помоли настоятелно'),
        [
          {
            prompt: bi('I request a written confirmation.', 'Моля за писмено потвърждение.'),
            answer: 'Ich bitte um eine schriftliche Bestätigung.',
            reviewTargets: ['v-bitten-um', 'v-die-bestaetigung'],
            hints: [],
            traps: [
              {
                answer: 'Ich will eine schriftliche Bestätigung.',
                category: 'vocabulary',
                feedback: bi(
                  'Ich will never appears in a formal letter. The standard request is Ich bitte um + accusative.',
                  'Ich will никога не се появява в официално писмо. Стандартната молба е Ich bitte um + винителен падеж.',
                ),
              },
            ],
          },
          {
            prompt: bi(
              'I would be grateful if you would remedy the defect by 15 March.',
              'Бих Ви бил благодарен, ако отстраните дефекта до 15 март.',
            ),
            answer: 'Ich wäre Ihnen dankbar, wenn Sie den Mangel bis zum 15. März beheben würden.',
            reviewTargets: ['p-waere-dankbar'],
            hints: [bi('würden goes last in the wenn-clause.', 'würden отива последно в изречението с wenn.')],
          },
          {
            prompt: bi('I would like to point out that the deadline has passed.', 'Бих искал да Ви обърна внимание, че срокът е изтекъл.'),
            answer: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
            reviewTargets: ['p-hinweisen-dass', 'v-hinweisen', 'v-die-frist'],
            hints: [],
          },
          {
            prompt: bi('I request an immediate reply.', 'Моля за незабавен отговор.'),
            answer: 'Ich bitte um eine umgehende Antwort.',
            reviewTargets: ['v-umgehend'],
            hints: [],
          },
          {
            prompt: bi('I hope for a swift resolution of the matter.', 'Надявам се на бързо изясняване на въпроса.'),
            answer: 'Ich hoffe auf eine rasche Klärung der Angelegenheit.',
            reviewTargets: ['v-die-klaerung', 'v-die-angelegenheit'],
            hints: [],
          },
        ],
        ['g-schriftliche-hoeflichkeit'],
      ),
    ),
    b2(
      freeWriting('b2u4l3-ex3', bi('Four lines of a complaint', 'Четири реда от жалба'), [
        {
          prompt: bi(
            'A delivery arrived damaged and two phone calls have changed nothing. Write four lines: say why you are writing, name the defect, ask for a remedy with a date, and add a consequence. Use bitte um and a genitive preposition.',
            'Доставка е пристигнала повредена, а две обаждания не са променили нищо. Напиши четири реда: защо пишеш, какъв е дефектът, каква мярка искаш и до кога, и каква е последицата. Използвай bitte um и предлог с родителен падеж.',
          ),
          answer:
            'Bezug nehmend auf Ihr Schreiben vom 3. Mai teile ich Ihnen mit, dass die Lieferung beschädigt angekommen ist. Aufgrund der Verzögerung bitte ich um eine Rückerstattung des Kaufpreises bis zum 15. März. Sollte ich bis dahin nichts hören, behalte ich mir weitere Schritte vor.',
          // Single words only: the checker matches token by token, so a
          // two-word requirement could never be satisfied.
          requiredTokens: ['bitte', 'Aufgrund'],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('b2u4l3-ex4', bi('Polite and immovable', 'Учтиво и непоколебимо'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bitte um eine schriftliche Bestätigung.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        typeIt('b2u4l3-m1', bi('Three rungs of the ladder', 'Три стъпала от стълбицата'), [
          {
            prompt: bi('I request a written confirmation.', 'Моля за писмено потвърждение.'),
            answer: 'Ich bitte um eine schriftliche Bestätigung.',
            hints: [],
          },
          {
            prompt: bi('I would like to point out that the deadline has passed.', 'Бих искал да Ви обърна внимание, че срокът е изтекъл.'),
            answer: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
            hints: [],
          },
          {
            prompt: bi(
              'I would be grateful if you would remedy the defect by 15 March.',
              'Бих Ви бил благодарен, ако отстраните дефекта до 15 март.',
            ),
            answer: 'Ich wäre Ihnen dankbar, wenn Sie den Mangel bis zum 15. März beheben würden.',
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
  id: 'cp-b2u4',
  scope: 'unit',
  targetId: 'b2-u4',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Checkpoint: formal written German', 'Проверка: официален писмен немски'),
  description: bi(
    'Fixed phrases, the genitive prepositions, and the frames a German letter asks with.',
    'Устойчиви изрази, предлозите с родителен падеж и рамките, с които немското писмо моли.',
  ),
  exercises: [
    b2(
      fillBlank('cp-b2u4-1', bi('The fixed phrases', 'Устойчивите изрази'), [
        {
          prompt: bi('referring to your letter', 'позоваване на Вашето писмо'),
          scaffold: 'Bezug ___ auf Ihr Schreiben vom 3. Mai …',
          answer: 'nehmend',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('claim the warranty', 'да се възползвам от гаранцията'),
          scaffold: 'Ich möchte die Gewährleistung in ___ nehmen.',
          answer: 'Anspruch',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('make available', 'да предоставя'),
          scaffold: 'Die Unterlagen stelle ich Ihnen zur ___.',
          answer: 'Verfügung',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      fillBlank('cp-b2u4-2', bi('The genitive', 'Родителният падеж'), [
        {
          prompt: bi('der Mangel', 'der Mangel'),
          scaffold: 'aufgrund ___ Mangels',
          answer: 'des',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('die Verzögerung', 'die Verzögerung'),
          scaffold: 'aufgrund ___ Verzögerung',
          answer: 'der',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('eine Woche', 'eine Woche'),
          scaffold: 'innerhalb ___ Woche',
          answer: 'einer',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u4-3', bi('Write the letter', 'Напиши писмото'), [
        {
          prompt: bi('Because of the delay I request a refund.', 'Поради забавянето моля за възстановяване на сумата.'),
          answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
          hints: [],
        },
        {
          prompt: bi('I would like to claim under the statutory warranty.', 'Бих искал да се възползвам от законовата гаранция.'),
          answer: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
          hints: [],
        },
        {
          prompt: bi('Please confirm receipt of this letter.', 'Моля, потвърдете получаването на това писмо.'),
          answer: 'Bitte bestätigen Sie den Eingang dieses Schreibens.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u4-4', bi('Ask, and warn', 'Помоли и предупреди'), [
        {
          prompt: bi('I request a written confirmation.', 'Моля за писмено потвърждение.'),
          answer: 'Ich bitte um eine schriftliche Bestätigung.',
          hints: [],
        },
        {
          prompt: bi('I would like to point out that the deadline has passed.', 'Бих искал да Ви обърна внимание, че срокът е изтекъл.'),
          answer: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('cp-b2u4-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich bitte um eine schriftliche Bestätigung.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B2_UNIT_4: Unit = {
  id: 'b2-u4',
  level: 'b2',
  order: 4,
  status: 'available',
  title: bi('Formal written German', 'Официален писмен немски'),
  summary: bi(
    'The letter that gets answered: the noun-and-verb pairs officialdom runs on, the prepositions that still demand a genitive, and the frames German asks with — statements about yourself rather than questions about the reader.',
    'Писмото, на което отговарят: двойките съществително плюс глагол, с които работи администрацията, предлозите, които още изискват родителен падеж, и рамките, с които немският моли — твърдения за себе си, а не въпроси към четящия.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B2_U4_PATTERNS = PATTERNS;
