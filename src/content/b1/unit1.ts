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
 * B1 Unit 1 — Finding and renting a flat.
 *
 * The first B1 unit, and the point where the course stops teaching German in
 * general and starts teaching Germany in particular. Flat-hunting is the right
 * place to begin: it is the first thing anyone moving there has to survive, it
 * is full of vocabulary that is legal before it is linguistic, and — usefully
 * — it is the densest everyday source of the two structures this unit teaches.
 *
 * **Relative clauses** (lessons 1 and 3) are the structure that separates A2
 * German from B1 German. Everything up to here could be said in short
 * sentences joined with und, aber and weil. A relative clause is the first
 * tool for saying two things about one noun without stopping.
 *
 * The two paths meet this from opposite sides, and this is the sharpest
 * divergence anywhere in the course. English has dismantled its relative
 * pronouns — *that* covers everything, and English drops the word entirely
 * when it is an object ("the flat I saw"). Bulgarian has kept the whole
 * system: *който/която/което/които* agrees for gender and number exactly as
 * German does, and *когото* exists for the accusative. So the English path is
 * taught a system it no longer has, while the Bulgarian path is told, plainly,
 * that it already owns nine tenths of this and has exactly one new thing to
 * learn: the verb goes to the end.
 *
 * **Adjective endings after ein** (lesson 2) is the other half of what A2
 * started and openly left unfinished. It is taught as a reason rather than a
 * table: *ein* cannot show gender, so the adjective has to. Here too the paths
 * differ — an English adjective never changes at all, while Bulgarian already
 * moves the definite marker onto the adjective when the adjective comes first
 * (*голям апартамент* → *големият апартамент*). The Bulgarian path gets to
 * recognise the mechanism; the English path has to build it.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-relativsatz-nom',
    template: 'Das ist die Wohnung, die ___.',
    example: 'Das ist die Wohnung, die einen Balkon hat.',
    gloss: bi('That is the flat that ___.', 'Това е апартаментът, който ___.'),
    level: 'b1',
    grammarIds: ['g-relativsatz'],
  },
  {
    id: 'p-relativsatz-akk',
    template: 'Das ist der ___, den ich ___ habe.',
    example: 'Das ist der Vermieter, den ich angerufen habe.',
    gloss: bi('That is the ___ I ___.', 'Това е ___, когото ___.'),
    level: 'b1',
    grammarIds: ['g-relativsatz'],
  },
  {
    id: 'p-adjektiv-ein',
    template: 'Wir suchen eine ___e Wohnung.',
    example: 'Wir suchen eine möblierte Wohnung.',
    gloss: bi('We are looking for a ___ flat.', 'Търсим ___ апартамент.'),
    level: 'b1',
    grammarIds: ['g-adjektiv-ein'],
  },
  {
    id: 'p-relativsatz-praeposition',
    template: 'die Wohnung, in der ___',
    example: 'Das ist die Wohnung, in der ich wohne.',
    gloss: bi('the flat I live in', 'апартаментът, в който живея'),
    level: 'b1',
    grammarIds: ['g-relativsatz-dativ'],
  },
];

/* ================================================================== *
 * Lesson 1 — two things about one noun
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u1-l1',
  unitId: 'b1-u1',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The flat that has a balcony', 'Апартаментът, който има балкон'),
  objective: bi(
    'After this lesson you can say two things about one noun without starting a second sentence — which is the structure that makes German sound grown-up.',
    'След този урок можеш да кажеш две неща за едно съществително, без да започваш второ изречение — а това е структурата, която прави немския да звучи зряло.',
  ),
  outcomes: [
    bi('I can join two sentences about the same noun.', 'Мога да свържа две изречения за едно и също съществително.'),
    bi('I take the gender from the noun and the case from the clause.', 'Взимам рода от съществителното, а падежа от изречението.'),
    bi('I put the verb at the end and the comma in front.', 'Слагам глагола в края, а запетаята отпред.'),
    bi('I never leave the relative pronoun out.', 'Никога не пропускам относителното местоимение.'),
  ],
  vocabIds: [
    'v-die-anzeige',
    'v-die-besichtigung',
    'v-besichtigen',
    'v-der-balkon',
    'v-hell',
    'v-dunkel',
    'v-der-quadratmeter',
    'v-moebliert',
  ],
  grammarIds: ['g-relativsatz'],
  sections: [
    {
      id: 'b1u1l1-intro',
      kind: 'intro',
      title: bi('Two sentences become one', 'Две изречения стават едно'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You can already say both halves of this. What is new is joining them.',
            'И двете половини вече можеш да ги кажеш. Новото е свързването им.',
          ),
        },
        {
          t: 'contrast',
          de: 'Das ist die Wohnung. Sie hat einen Balkon.',
          other: bi('Two sentences. Correct, but it is how a beginner speaks.', 'Две изречения. Правилно, но така говори начинаещ.'),
        },
        {
          t: 'de',
          de: 'Das ist die Wohnung, die einen Balkon hat.',
          gloss: bi('That is the flat that has a balcony.', 'Това е апартаментът, който има балкон.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'One sentence, one comma, and the verb at the very end. That is the whole shape.',
            'Едно изречение, една запетая и глаголът най-накрая. Това е цялата форма.',
          ),
        },
      ],
    },
    {
      id: 'b1u1l1-vocab',
      kind: 'vocabulary',
      title: bi('What a flat advertisement says', 'Какво пише в една обява за жилище'),
      vocabIds: [
        'v-die-anzeige',
        'v-die-besichtigung',
        'v-besichtigen',
        'v-der-balkon',
        'v-hell',
        'v-dunkel',
        'v-der-quadratmeter',
        'v-moebliert',
      ],
      blocks: [],
    },
    {
      id: 'b1u1l1-grammar',
      kind: 'grammar',
      title: bi('der, die, das — again, and doing a new job', 'der, die, das — отново, и с нова задача'),
      blocks: [],
      grammarId: 'g-relativsatz',
    },
    {
      id: 'b1u1l1-examples',
      kind: 'examples',
      title: bi('Talking about flats you have seen', 'Разговор за жилища, които си видял'),
      blocks: [
        {
          t: 'de',
          de: 'Das ist die Wohnung, die sechzig Quadratmeter hat.',
          gloss: bi('That is the flat that is sixty square metres.', 'Това е апартаментът, който е шейсет квадратни метра.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Wohnung, die wir gestern besichtigt haben, war sehr dunkel.',
          gloss: bi('The flat we viewed yesterday was very dark.', 'Апартаментът, който огледахме вчера, беше много тъмен.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das ist der Vermieter, den ich angerufen habe.',
          gloss: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich habe eine Anzeige gefunden, die interessant klingt.',
          gloss: bi('I found a listing that sounds interesting.', 'Намерих обява, която звучи интересно.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u1l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi(
              'The pronoun is the definite article: der, die, das — den for a masculine object.',
              'Местоимението е определителният член: der, die, das — den при мъжки род допълнение.',
            ),
            bi(
              'Gender comes from the noun in front. Case comes from the job inside the clause.',
              'Родът идва от съществителното отпред. Падежът идва от ролята вътре в изречението.',
            ),
            bi('The conjugated verb goes last, as after weil.', 'Спрегнатият глагол отива последен, както след weil.'),
            bi('The comma is compulsory, and so is the pronoun.', 'Запетаята е задължителна, местоимението също.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u1l1-ex1', bi('Which pronoun?', 'Кое местоимение?'), [
        {
          prompt: bi('die Wohnung — it has a balcony', 'die Wohnung — тя има балкон'),
          scaffold: 'Das ist die Wohnung, ___ einen Balkon hat.',
          answer: 'die',
          shape: 'word',
          hints: [bi('Feminine, and it is the subject of the clause.', 'Женски род и е подлог в изречението.')],
        },
        {
          prompt: bi('der Balkon — it is big', 'der Balkon — той е голям'),
          scaffold: 'Das ist der Balkon, ___ so groß ist.',
          answer: 'der',
          shape: 'word',
          hints: [bi('Masculine, and it is the subject here.', 'Мъжки род и тук е подлог.')],
        },
        {
          prompt: bi('der Vermieter — I called him', 'der Vermieter — аз му се обадих'),
          scaffold: 'Das ist der Vermieter, ___ ich angerufen habe.',
          answer: 'den',
          shape: 'word',
          hints: [
            bi(
              'Masculine — but inside the clause he is the one being called, not the one calling.',
              'Мъжки род — но вътре в изречението него го търсят, не той търси.',
            ),
          ],
          traps: [
            {
              answer: 'der',
              category: 'case',
              feedback: bi(
                'The noun in front gives you the gender only. Inside the clause the landlord is the object of angerufen, so it is den.',
                'Съществителното отпред ти дава само рода. Вътре в изречението наемодателят е допълнение на angerufen, затова е den.',
              ),
            },
          ],
        },
        {
          prompt: bi('das Zimmer — we saw it', 'das Zimmer — ние го видяхме'),
          scaffold: 'Das ist das Zimmer, ___ wir gesehen haben.',
          answer: 'das',
          shape: 'word',
          hints: [
            bi(
              'Neuter is the easy one: das for both jobs.',
              'Среден род е лесният: das и за двете роли.',
            ),
          ],
        },
      ]),
    ),
    b1(
      wordOrder('b1u1l1-ex2', bi('Put the clause in order', 'Подреди подчиненото изречение'), [
        {
          prompt: bi('That is the flat that has a balcony.', 'Това е апартаментът, който има балкон.'),
          bank: ['Das', 'ist', 'die', 'Wohnung,', 'die', 'einen', 'Balkon', 'hat.'],
          answer: 'Das ist die Wohnung, die einen Balkon hat.',
          hints: [bi('The verb is last.', 'Глаголът е последен.')],
        },
        {
          prompt: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
          bank: ['Das', 'ist', 'der', 'Vermieter,', 'den', 'ich', 'angerufen', 'habe.'],
          answer: 'Das ist der Vermieter, den ich angerufen habe.',
          hints: [
            bi(
              'Two verb parts: the participle first, then the conjugated verb right at the end.',
              'Две глаголни части: първо причастието, после спрегнатият глагол най-накрая.',
            ),
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u1l1-ex3',
        bi('Join them yourself', 'Свържи ги сам'),
        [
          {
            prompt: bi('That is the flat that is sixty square metres.', 'Това е апартаментът, който е шейсет квадратни метра.'),
            answer: 'Das ist die Wohnung, die sechzig Quadratmeter hat.',
            alternatives: ['Das ist die Wohnung, die 60 Quadratmeter hat.'],
            reviewTargets: ['p-relativsatz-nom', 'v-der-quadratmeter'],
            hints: [],
            traps: [
              {
                answer: 'Das ist die Wohnung, die hat sechzig Quadratmeter.',
                category: 'word-order',
                feedback: bi(
                  'A relative clause is a subordinate clause, so the verb goes right to the end: …, die sechzig Quadratmeter hat.',
                  'Относителното изречение е подчинено, затова глаголът отива най-накрая: …, die sechzig Quadratmeter hat.',
                ),
              },
            ],
          },
          {
            prompt: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
            answer: 'Das ist der Vermieter, den ich angerufen habe.',
            reviewTargets: ['p-relativsatz-akk', 'v-der-vermieter'],
            hints: [],
            traps: [
              {
                answer: 'Das ist der Vermieter, der ich angerufen habe.',
                category: 'case',
                feedback: bi(
                  'Inside the clause he is the object of angerufen, so the pronoun is den. The gender comes from Vermieter; the case does not.',
                  'Вътре в изречението той е допълнение на angerufen, затова местоимението е den. Родът идва от Vermieter; падежът — не.',
                ),
              },
            ],
          },
          {
            prompt: bi('I found a listing that sounds interesting.', 'Намерих обява, която звучи интересно.'),
            answer: 'Ich habe eine Anzeige gefunden, die interessant klingt.',
            reviewTargets: ['v-die-anzeige'],
            hints: [],
          },
          {
            prompt: bi('The flat we viewed yesterday was very dark.', 'Апартаментът, който огледахме вчера, беше много тъмен.'),
            answer: 'Die Wohnung, die wir gestern besichtigt haben, war sehr dunkel.',
            reviewTargets: ['v-besichtigen', 'v-dunkel'],
            hints: [
              bi(
                'The relative clause sits in the middle, with a comma on each side.',
                'Относителното изречение стои в средата, със запетая от двете страни.',
              ),
            ],
          },
        ],
        ['g-relativsatz'],
      ),
    ),
    b1(
      typeIt(
        'b1u1l1-ex4',
        bi('The word English leaves out', 'Думата, която английският пропуска'),
        [
          {
            prompt: bi('That is the flat I saw.', 'Това е апартаментът, който видях.'),
            answer: 'Das ist die Wohnung, die ich gesehen habe.',
            reviewTargets: ['p-relativsatz-akk'],
            hints: [],
            traps: [
              {
                answer: 'Das ist die Wohnung ich gesehen habe.',
                category: 'missing-word',
                feedback: bi(
                  'English can drop the relative pronoun — "the flat I saw" — and German never can. die is compulsory, and so is the comma before it.',
                  'Английският може да пропусне относителното местоимение — „the flat I saw“ — немският никога. die е задължително, запетаята преди него също.',
                ),
              },
            ],
          },
          {
            prompt: bi('The neighbour I met was friendly.', 'Съседът, когото срещнах, беше любезен.'),
            answer: 'Der Nachbar, den ich getroffen habe, war freundlich.',
            reviewTargets: ['v-nachbar', 'v-freundlich'],
            hints: [],
          },
        ],
        ['g-relativsatz'],
      ),
    ),
    b1(
      dictation('b1u1l1-ex5', bi('Hear where the comma is', 'Чуй къде е запетаята'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das ist die Wohnung, die einen Balkon hat.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das ist der Vermieter, den ich angerufen habe.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u1l1-m1', bi('Two things about one noun', 'Две неща за едно съществително'), [
          {
            prompt: bi('That is the flat that has a balcony.', 'Това е апартаментът, който има балкон.'),
            answer: 'Das ist die Wohnung, die einen Balkon hat.',
            hints: [],
          },
          {
            prompt: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
            answer: 'Das ist der Vermieter, den ich angerufen habe.',
            hints: [],
          },
          {
            prompt: bi('I found a listing that sounds interesting.', 'Намерих обява, която звучи интересно.'),
            answer: 'Ich habe eine Anzeige gefunden, die interessant klingt.',
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
        'The article you have used since the beginning, doing a second job — and one comma that is never optional. Next: the endings that let you describe the flat before you name it.',
        'Членът, който използваш от самото начало, върши втора работа — и една запетая, която никога не е по избор. Следва: окончанията, които ти позволяват да опишеш жилището, преди да го назовеш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — reading the advertisement
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u1-l2',
  unitId: 'b1-u1',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('A bright flat with a big balcony', 'Светъл апартамент с голям балкон'),
  objective: bi(
    'After this lesson you can read a German flat advertisement and write one — which means finishing the adjective endings A2 deliberately left half done.',
    'След този урок можеш да прочетеш немска обява за жилище и да напишеш такава — тоест да завършиш окончанията на прилагателните, които A2 нарочно остави наполовина.',
  ),
  outcomes: [
    bi('I know why the ending changes after ein.', 'Знам защо окончанието се променя след ein.'),
    bi('I can write ein heller Raum and ein helles Zimmer.', 'Мога да напиша ein heller Raum и ein helles Zimmer.'),
    bi('I understand the costs in a German advertisement.', 'Разбирам разходите в немска обява.'),
    bi('I can ask what is and is not included.', 'Мога да попитам какво е включено и какво не.'),
  ],
  vocabIds: [
    'v-der-mietvertrag',
    'v-die-kaution',
    'v-die-nebenkosten',
    'v-die-kaltmiete',
    'v-der-stock',
    'v-der-aufzug',
    'v-unterschreiben',
  ],
  grammarIds: ['g-adjektiv-ein'],
  sections: [
    {
      id: 'b1u1l2-intro',
      kind: 'intro',
      title: bi('The ending is doing a job', 'Окончанието върши работа'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A2 taught the endings after der, die and das, and said openly that it was one corner of the system. This is the rest of it, and there is a reason behind it rather than a table to memorise.',
            'A2 научи окончанията след der, die и das и каза открито, че това е едно ъгълче от системата. Това е останалото, а зад него стои причина, а не таблица за наизустяване.',
          ),
        },
        {
          t: 'contrast',
          de: 'der helle Raum — ein heller Raum',
          other: bi(
            'der already shows that the noun is masculine. ein does not — so the adjective steps in and shows it instead.',
            'der вече показва, че съществителното е от мъжки род. ein не го показва — затова прилагателното се намесва и го показва вместо него.',
          ),
        },
        {
          t: 'de',
          de: 'Wir suchen eine möblierte Wohnung mit einem großen Balkon.',
          gloss: bi(
            'We are looking for a furnished flat with a big balcony.',
            'Търсим обзаведен апартамент с голям балкон.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u1l2-vocab',
      kind: 'vocabulary',
      title: bi('What it actually costs', 'Какво всъщност струва'),
      vocabIds: [
        'v-der-mietvertrag',
        'v-die-kaution',
        'v-die-nebenkosten',
        'v-die-kaltmiete',
        'v-der-stock',
        'v-der-aufzug',
        'v-unterschreiben',
      ],
      blocks: [],
    },
    {
      id: 'b1u1l2-grammar',
      kind: 'grammar',
      title: bi('ein cannot show the gender', 'ein не може да покаже рода'),
      blocks: [],
      grammarId: 'g-adjektiv-ein',
    },
    {
      id: 'b1u1l2-culture',
      kind: 'culture',
      title: bi('Three numbers in every advertisement', 'Три числа във всяка обява'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A German rental advertisement quotes the smallest number it honestly can. Knowing which number you are looking at is worth as much as the grammar.',
            'Немската обява за наем посочва най-малкото число, което честно може. Да знаеш кое число гледаш, струва колкото граматиката.',
          ),
        },
        {
          t: 'table',
          headers: [bi('Word', 'Дума'), bi('What it means', 'Какво означава')],
          rows: [
            ['Kaltmiete', bi('the rent alone, with nothing in it', 'самият наем, без нищо в него')],
            ['Nebenkosten', bi('heating, water, rubbish, caretaker', 'отопление, вода, боклук, домоуправител')],
            ['Warmmiete', bi('Kaltmiete + Nebenkosten — what actually leaves your account', 'Kaltmiete + Nebenkosten — това, което наистина излиза от сметката')],
            ['Kaution', bi('deposit, up to three Kaltmieten, paid before you move in', 'депозит, до три базови наема, платен преди нанасянето')],
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          title: bi('The number that surprises everyone', 'Числото, което изненадва всички'),
          text: bi(
            'Before you get the keys you typically pay the first month plus three months of Kaltmiete as a deposit — four months of rent in one go. The deposit comes back when you leave, minus whatever the landlord decides you damaged.',
            'Преди да получиш ключовете, обикновено плащаш първия месец плюс три базови наема депозит — четири наема наведнъж. Депозитът се връща при изнасянето, минус това, което наемодателят реши, че си повредил.',
          ),
        },
      ],
    },
    {
      id: 'b1u1l2-examples',
      kind: 'examples',
      title: bi('Straight out of an advertisement', 'Направо от обява'),
      blocks: [
        {
          t: 'de',
          de: 'Helle Wohnung mit einem großen Balkon.',
          gloss: bi('Bright flat with a big balcony.', 'Светъл апартамент с голям балкон.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das ist ein sehr helles Zimmer.',
          gloss: bi('That is a very bright room.', 'Това е много светла стая.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wir haben einen neuen Mietvertrag unterschrieben.',
          gloss: bi('We signed a new rental contract.', 'Подписахме нов договор за наем.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Sind die Nebenkosten in der Miete enthalten?',
          gloss: bi('Are the utilities included in the rent?', 'Включени ли са консумативите в наема?'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u1l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Only two endings are new: -er masculine, -es neuter.', 'Само две окончания са нови: -er за мъжки род, -es за среден.'),
            bi('They appear exactly where ein hides a gender.', 'Появяват се точно там, където ein скрива род.'),
            bi('dunkel → dunkles, teuer → teure: the -e- drops out.', 'dunkel → dunkles, teuer → teure: едно -e- отпада.'),
            bi('Kaltmiete is not what you pay. Warmmiete is.', 'Kaltmiete не е това, което плащаш. Warmmiete е.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u1l2-ex1', bi('After der, then after ein', 'След der, после след ein'), [
        {
          prompt: bi('the bright room — hell', 'светлата стая — hell'),
          scaffold: 'Das ist der ___ Raum.',
          answer: 'helle',
          shape: 'word',
          hints: [bi('After der, the ending you learnt at A2.', 'След der — окончанието, което научи на A2.')],
        },
        {
          prompt: bi('a bright room — hell', 'светла стая — hell'),
          scaffold: 'Das ist ein ___ Raum.',
          answer: 'heller',
          shape: 'word',
          hints: [
            bi(
              'ein cannot show that Raum is masculine, so the adjective does.',
              'ein не може да покаже, че Raum е от мъжки род, затова прилагателното го прави.',
            ),
          ],
          traps: [
            {
              answer: 'helle',
              category: 'adjective-ending',
              feedback: bi(
                'After der it is -e, but ein shows no gender at all, so the adjective takes over: ein heller Raum.',
                'След der е -e, но ein изобщо не показва род, затова прилагателното поема ролята: ein heller Raum.',
              ),
            },
          ],
        },
        {
          prompt: bi('a bright room (neuter: Zimmer) — hell', 'светла стая (среден род: Zimmer) — hell'),
          scaffold: 'Das ist ein ___ Zimmer.',
          answer: 'helles',
          shape: 'word',
          hints: [bi('Neuter. The -es is the das that ein cannot show.', 'Среден род. -es е онова das, което ein не може да покаже.')],
        },
        {
          prompt: bi('a bright flat (feminine) — hell', 'светъл апартамент (женски род) — hell'),
          scaffold: 'Das ist eine ___ Wohnung.',
          answer: 'helle',
          shape: 'word',
          hints: [
            bi(
              'eine already ends in -e and shows the feminine, so nothing changes here.',
              'eine вече завършва на -e и показва женски род, затова тук нищо не се променя.',
            ),
          ],
        },
        {
          prompt: bi('a dark room — dunkel', 'тъмна стая — dunkel'),
          scaffold: 'Das ist ein ___ Zimmer.',
          answer: 'dunkles',
          shape: 'word',
          hints: [bi('The -e- of dunkel drops out.', 'Едно -e- от dunkel отпада.')],
          traps: [
            {
              answer: 'dunkeles',
              category: 'spelling',
              feedback: bi(
                'dunkel loses its -e- as soon as an ending arrives: dunkles. teuer does the same — eine teure Wohnung.',
                'dunkel губи своето -e- веднага щом дойде окончание: dunkles. teuer прави същото — eine teure Wohnung.',
              ),
            },
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u1l2-ex2',
        bi('Write the advertisement', 'Напиши обявата'),
        [
          {
            prompt: bi('We are looking for a furnished flat.', 'Търсим обзаведен апартамент.'),
            answer: 'Wir suchen eine möblierte Wohnung.',
            reviewTargets: ['p-adjektiv-ein', 'v-moebliert'],
            hints: [],
          },
          {
            prompt: bi('That is a very bright room.', 'Това е много светла стая.'),
            answer: 'Das ist ein sehr helles Zimmer.',
            reviewTargets: ['v-hell'],
            hints: [],
          },
          {
            prompt: bi('The flat has a big balcony.', 'Апартаментът има голям балкон.'),
            answer: 'Die Wohnung hat einen großen Balkon.',
            reviewTargets: ['v-der-balkon'],
            hints: [
              bi(
                'The balcony is the object here, so einen — and after einen the adjective takes -en.',
                'Балконът тук е допълнение, значи einen — а след einen прилагателното взима -en.',
              ),
            ],
          },
          {
            prompt: bi('We signed a new rental contract.', 'Подписахме нов договор за наем.'),
            answer: 'Wir haben einen neuen Mietvertrag unterschrieben.',
            reviewTargets: ['v-der-mietvertrag', 'v-unterschreiben'],
            hints: [],
            traps: [
              {
                answer: 'Wir haben einen neuen Mietvertrag untergeschrieben.',
                category: 'verb-conjugation',
                feedback: bi(
                  'unterschreiben does not split, so there is no ge- in the middle: unterschrieben. Compare umziehen, which does split: umgezogen.',
                  'unterschreiben не се разделя, затова няма ge- в средата: unterschrieben. Сравни с umziehen, което се разделя: umgezogen.',
                ),
              },
            ],
          },
        ],
        ['g-adjektiv-ein'],
      ),
    ),
    b1(
      typeIt(
        'b1u1l2-ex3',
        bi('Asking about the money', 'Питане за парите'),
        [
          {
            prompt: bi('Are the utilities included in the rent?', 'Включени ли са консумативите в наема?'),
            answer: 'Sind die Nebenkosten in der Miete enthalten?',
            reviewTargets: ['v-die-nebenkosten'],
            hints: [],
          },
          {
            prompt: bi('How much is the deposit?', 'Колко е депозитът?'),
            answer: 'Wie hoch ist die Kaution?',
            alternatives: ['Wie viel ist die Kaution?'],
            reviewTargets: ['v-die-kaution'],
            hints: [
              bi(
                'German asks "how high" for an amount of money, not "how much".',
                'Немският пита „колко високо“ за сума пари, а не „колко“.',
              ),
            ],
          },
          {
            prompt: bi('The flat is on the third floor and there is no lift.', 'Апартаментът е на третия етаж и няма асансьор.'),
            answer: 'Die Wohnung ist im dritten Stock und es gibt keinen Aufzug.',
            reviewTargets: ['v-der-stock', 'v-der-aufzug'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      dictation('b1u1l2-ex4', bi('Listening to an advertisement', 'Слушане на обява'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wir suchen eine möblierte Wohnung.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Wohnung hat einen großen Balkon.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        exercise({
          id: 'b1u1l2-m1',
          kind: 'fillBlank',
          level: 'b1',
          objective: bi('The two new endings', 'Двете нови окончания'),
          steps: [
            {
              prompt: bi('a bright room (der Raum)', 'светла стая (der Raum)'),
              scaffold: 'Das ist ein ___ Raum.',
              answer: 'heller',
              shape: 'word',
              hints: [],
            },
            {
              prompt: bi('a bright room (das Zimmer)', 'светла стая (das Zimmer)'),
              scaffold: 'Das ist ein ___ Zimmer.',
              answer: 'helles',
              shape: 'word',
              hints: [],
            },
            {
              prompt: bi('a furnished flat (die Wohnung)', 'обзаведен апартамент (die Wohnung)'),
              scaffold: 'Wir suchen eine ___ Wohnung.',
              answer: 'möblierte',
              shape: 'word',
              hints: [],
            },
          ],
        }),
      ),
      b1(
        typeIt('b1u1l2-m2', bi('From the advertisement', 'От обявата'), [
          {
            prompt: bi('The flat has a big balcony.', 'Апартаментът има голям балкон.'),
            answer: 'Die Wohnung hat einen großen Balkon.',
            hints: [],
          },
          {
            prompt: bi('Are the utilities included in the rent?', 'Включени ли са консумативите в наема?'),
            answer: 'Sind die Nebenkosten in der Miete enthalten?',
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
        'Two endings, and a reason that makes them stick: the adjective says what ein could not. Next: the same relative clauses, one case further, and a complaint worth sending.',
        'Две окончания и причина, която ги задържа: прилагателното казва това, което ein не може. Следва: същите относителни изречения, един падеж по-нататък, и оплакване, което си струва да изпратиш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — living there, and what goes wrong
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u1-l3',
  unitId: 'b1-u1',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The flat I live in', 'Апартаментът, в който живея'),
  objective: bi(
    'After this lesson you can complain, in writing, to the people who are supposed to fix things — and put a preposition in front of a relative pronoun while you do it.',
    'След този урок можеш да се оплачеш писмено на хората, които би трябвало да оправят нещата — и да сложиш предлог пред относително местоимение, докато го правиш.',
  ),
  outcomes: [
    bi('I can use dem, der and denen in a relative clause.', 'Мога да използвам dem, der и denen в относително изречение.'),
    bi('I put the preposition in front, never at the end.', 'Слагам предлога отпред, никога в края.'),
    bi('I can describe a problem in the flat.', 'Мога да опиша проблем в жилището.'),
    bi('I can write a short complaint that gets an answer.', 'Мога да напиша кратко оплакване, на което ще отговорят.'),
  ],
  vocabIds: [
    'v-die-hausverwaltung',
    'v-der-schimmel',
    'v-sich-beschweren',
    'v-kuendigen',
    'v-einziehen',
    'v-ausziehen',
    'v-der-laerm',
    'v-die-hausordnung',
  ],
  grammarIds: ['g-relativsatz-dativ'],
  sections: [
    {
      id: 'b1u1l3-intro',
      kind: 'intro',
      title: bi('One more case, one more position', 'Още един падеж, още една позиция'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Lesson 1 gave you the pronoun as a subject and as an object. There is one more case it can take, and one more place a preposition can stand.',
            'Урок 1 ти даде местоимението като подлог и като допълнение. Има още един падеж, който може да вземе, и още едно място, където може да стои предлог.',
          ),
        },
        {
          t: 'de',
          de: 'Das ist die Wohnung, in der ich wohne.',
          gloss: bi('That is the flat I live in.', 'Това е апартаментът, в който живея.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Nachbar, mit dem ich gesprochen habe, war sehr nett.',
          gloss: bi('The neighbour I spoke to was very nice.', 'Съседът, с когото говорих, беше много мил.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u1l3-vocab',
      kind: 'vocabulary',
      title: bi('When something is wrong', 'Когато нещо не е наред'),
      vocabIds: [
        'v-die-hausverwaltung',
        'v-der-schimmel',
        'v-sich-beschweren',
        'v-kuendigen',
        'v-einziehen',
        'v-ausziehen',
        'v-der-laerm',
        'v-die-hausordnung',
      ],
      blocks: [],
    },
    {
      id: 'b1u1l3-grammar',
      kind: 'grammar',
      title: bi('dem, der, dem — and denen', 'dem, der, dem — и denen'),
      blocks: [],
      grammarId: 'g-relativsatz-dativ',
    },
    {
      id: 'b1u1l3-culture',
      kind: 'culture',
      title: bi('Complaining in a way that works', 'Оплакване, което върши работа'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German complaints are effective when they are unemotional, dated and specific. A polite sentence naming the problem and a deadline will get further than an angry one.',
            'Оплакванията в Германия работят, когато са без емоция, с дата и конкретни. Учтиво изречение, което назовава проблема и срок, стига по-далеч от гневното.',
          ),
        },
        {
          t: 'list',
          items: [
            bi(
              'Say what is wrong: "Im Bad ist Schimmel an der Wand."',
              'Кажи какво не е наред: „Im Bad ist Schimmel an der Wand.“',
            ),
            bi(
              'Say since when: "seit drei Wochen".',
              'Кажи откога: „seit drei Wochen“.',
            ),
            bi(
              'Ask for something specific: "Ich bitte Sie, das bis zum 30. zu reparieren."',
              'Поискай нещо конкретно: „Ich bitte Sie, das bis zum 30. zu reparieren.“',
            ),
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('Ruhezeiten are a real rule', 'Ruhezeiten са истинско правило'),
          text: bi(
            'Quiet hours are usually 22:00 to 06:00 and all day Sunday, and they are in the Hausordnung, which is part of the contract. Drilling on a Sunday afternoon is not a faux pas — it is grounds for a complaint.',
            'Часовете на тишина обикновено са от 22:00 до 06:00 и цялата неделя и стоят в Hausordnung, която е част от договора. Да пробиваш в неделя следобед не е нетактичност — то е основание за оплакване.',
          ),
        },
      ],
    },
    {
      id: 'b1u1l3-examples',
      kind: 'examples',
      title: bi('Saying what is wrong', 'Да кажеш какво не е наред'),
      blocks: [
        {
          t: 'de',
          de: 'Im Bad ist Schimmel an der Wand.',
          gloss: bi('There is mould on the bathroom wall.', 'В банята има мухъл по стената.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich möchte mich über den Lärm beschweren.',
          gloss: bi('I would like to complain about the noise.', 'Бих искал да се оплача от шума.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Hausverwaltung, der ich geschrieben habe, hat nicht geantwortet.',
          gloss: bi(
            'The property management I wrote to has not answered.',
            'Домоуправлението, на което писах, не отговори.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Leute, mit denen wir im Haus wohnen, sind sehr ruhig.',
          gloss: bi(
            'The people we share the building with are very quiet.',
            'Хората, с които живеем в сградата, са много тихи.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u1l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Dative: dem, der, dem — and denen in the plural.', 'Дателен: dem, der, dem — и denen в множествено число.'),
            bi('denen is the only form that is not an article.', 'denen е единствената форма, която не е член.'),
            bi('The preposition stands in front of the pronoun.', 'Предлогът стои пред местоимението.'),
            bi('sich über etwas beschweren — über, not von.', 'sich über etwas beschweren — über, не von.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u1l3-ex1', bi('Which form after the preposition?', 'Коя форма след предлога?'), [
        {
          prompt: bi('die Wohnung — I live in it', 'die Wohnung — живея в нея'),
          scaffold: 'Das ist die Wohnung, in ___ ich wohne.',
          answer: 'der',
          shape: 'word',
          hints: [bi('Feminine, and in for a location takes the dative.', 'Женски род, а in при място иска дателен.')],
        },
        {
          prompt: bi('der Nachbar — I spoke to him', 'der Nachbar — говорих с него'),
          scaffold: 'Der Nachbar, mit ___ ich gesprochen habe, war nett.',
          answer: 'dem',
          shape: 'word',
          hints: [bi('mit always takes the dative.', 'mit винаги иска дателен.')],
        },
        {
          prompt: bi('die Leute — we live with them', 'die Leute — живеем с тях'),
          scaffold: 'Die Leute, mit ___ wir im Haus wohnen, sind ruhig.',
          answer: 'denen',
          shape: 'word',
          hints: [
            bi(
              'Plural dative. This is the one form that is not simply an article.',
              'Множествено число, дателен. Това е единствената форма, която не е просто член.',
            ),
          ],
          traps: [
            {
              answer: 'den',
              category: 'case',
              feedback: bi(
                'den is the article, but the relative pronoun in the dative plural is denen. It is the only form in the whole table you have to learn separately.',
                'den е членът, но относителното местоимение в дателен множествено число е denen. Това е единствената форма в цялата таблица, която се учи отделно.',
              ),
            },
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u1l3-ex2',
        bi('The preposition goes first', 'Предлогът е отпред'),
        [
          {
            prompt: bi('That is the flat I live in.', 'Това е апартаментът, в който живея.'),
            answer: 'Das ist die Wohnung, in der ich wohne.',
            reviewTargets: ['p-relativsatz-praeposition'],
            hints: [],
            traps: [
              {
                answer: 'Das ist die Wohnung, die ich wohne in.',
                category: 'word-order',
                feedback: bi(
                  'German cannot leave a preposition at the end. It moves to the front of the clause and takes the pronoun with it: in der ich wohne.',
                  'Немският не може да остави предлог в края. Той отива в началото на изречението и взима местоимението със себе си: in der ich wohne.',
                ),
              },
            ],
          },
          {
            prompt: bi('The neighbour I spoke to was very nice.', 'Съседът, с когото говорих, беше много мил.'),
            answer: 'Der Nachbar, mit dem ich gesprochen habe, war sehr nett.',
            reviewTargets: ['v-nachbar'],
            hints: [],
          },
          {
            prompt: bi('The property management I wrote to has not answered.', 'Домоуправлението, на което писах, не отговори.'),
            answer: 'Die Hausverwaltung, der ich geschrieben habe, hat nicht geantwortet.',
            reviewTargets: ['v-die-hausverwaltung'],
            hints: [
              bi(
                'schreiben takes a dative person with no preposition at all.',
                'schreiben иска лице в дателен, изобщо без предлог.',
              ),
            ],
          },
        ],
        ['g-relativsatz-dativ'],
      ),
    ),
    b1(
      typeIt(
        'b1u1l3-ex3',
        bi('Reporting the problem', 'Докладване на проблема'),
        [
          {
            prompt: bi('There is mould on the bathroom wall.', 'В банята има мухъл по стената.'),
            answer: 'Im Bad ist Schimmel an der Wand.',
            // Fronting the place is what a German speaker actually says here,
            // but subject-first is equally correct German and a learner who
            // writes it has not made a mistake.
            alternatives: ['Schimmel ist im Bad an der Wand.'],
            reviewTargets: ['v-der-schimmel'],
            hints: [],
          },
          {
            prompt: bi('I would like to complain about the noise.', 'Бих искал да се оплача от шума.'),
            answer: 'Ich möchte mich über den Lärm beschweren.',
            reviewTargets: ['v-sich-beschweren', 'v-der-laerm'],
            hints: [],
            traps: [
              {
                answer: 'Ich möchte mich von dem Lärm beschweren.',
                category: 'preposition',
                feedback: bi(
                  'The thing complained about takes über plus the accusative: sich über den Lärm beschweren.',
                  'Това, от което се оплакваш, идва с über и винителен: sich über den Lärm beschweren.',
                ),
              },
            ],
          },
          {
            prompt: bi('We moved in last month.', 'Нанесохме се миналия месец.'),
            answer: 'Wir sind letzten Monat eingezogen.',
            reviewTargets: ['v-einziehen'],
            hints: [],
            traps: [
              {
                answer: 'Wir haben letzten Monat eingezogen.',
                category: 'verb-conjugation',
                feedback: bi(
                  'einziehen is a change of place, so it takes sein: Wir sind eingezogen. So do ausziehen and umziehen.',
                  'einziehen е промяна на мястото, затова взима sein: Wir sind eingezogen. Същото важи за ausziehen и umziehen.',
                ),
              },
            ],
          },
        ],
      ),
    ),
    b1(
      freeWriting('b1u1l3-ex4', bi('Write the complaint', 'Напиши оплакването'), [
        {
          prompt: bi(
            'Write two or three sentences to the property management: there has been mould in the bathroom for three weeks, and you would like it repaired. Use at least one relative clause.',
            'Напиши две-три изречения до домоуправлението: от три седмици в банята има мухъл и искаш да бъде отстранен. Използвай поне едно относително изречение.',
          ),
          answer: 'Im Bad ist seit drei Wochen Schimmel an der Wand. Ich bitte Sie, das bald zu reparieren.',
          requiredTokens: ['Schimmel'],
          shape: 'sentence',
          hints: [
            bi(
              'Start with the problem, then say since when, then ask for something specific.',
              'Започни с проблема, после кажи откога, после поискай нещо конкретно.',
            ),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u1l3-m1', bi('The preposition in front', 'Предлогът отпред'), [
          {
            prompt: bi('That is the flat I live in.', 'Това е апартаментът, в който живея.'),
            answer: 'Das ist die Wohnung, in der ich wohne.',
            hints: [],
          },
          {
            prompt: bi('The neighbour I spoke to was very nice.', 'Съседът, с когото говорих, беше много мил.'),
            answer: 'Der Nachbar, mit dem ich gesprochen habe, war sehr nett.',
            hints: [],
          },
          {
            prompt: bi('I would like to complain about the noise.', 'Бих искал да се оплача от шума.'),
            answer: 'Ich möchte mich über den Lärm beschweren.',
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
        'One extra case, one word that is not an article, and a preposition that refuses to sit at the end. That is the whole relative-clause system — and it will carry you through the rest of B1.',
        'Един допълнителен падеж, една дума, която не е член, и предлог, който отказва да стои в края. Това е цялата система на относителните изречения — и тя ще те носи през останалата част от B1.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u1',
  scope: 'unit',
  targetId: 'b1-u1',
  status: 'available',
  title: bi('Unit 1 checkpoint', 'Проверка на раздел 1'),
  description: bi(
    'Relative clauses in three cases, the endings after ein, and a complaint that would actually be answered.',
    'Относителни изречения в три падежа, окончанията след ein и оплакване, на което наистина биха отговорили.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u1-1', bi('Joining two statements', 'Свързване на две твърдения'), [
        {
          prompt: bi('That is the flat that has a balcony.', 'Това е апартаментът, който има балкон.'),
          answer: 'Das ist die Wohnung, die einen Balkon hat.',
          hints: [],
        },
        {
          prompt: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
          answer: 'Das ist der Vermieter, den ich angerufen habe.',
          hints: [],
        },
        {
          prompt: bi('That is the flat I live in.', 'Това е апартаментът, в който живея.'),
          answer: 'Das ist die Wohnung, in der ich wohne.',
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u1-2',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('The pronoun', 'Местоимението'),
        steps: [
          {
            prompt: bi('die Wohnung — it is bright', 'die Wohnung — тя е светла'),
            scaffold: 'die Wohnung, ___ sehr hell ist',
            answer: 'die',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('der Vertrag — I signed it', 'der Vertrag — подписах го'),
            scaffold: 'der Vertrag, ___ ich unterschrieben habe',
            answer: 'den',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('die Leute — we live with them', 'die Leute — живеем с тях'),
            scaffold: 'die Leute, mit ___ wir wohnen',
            answer: 'denen',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      exercise({
        id: 'cp-b1u1-3',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('The ending after ein', 'Окончанието след ein'),
        steps: [
          {
            prompt: bi('a bright room (der Raum) — hell', 'светла стая (der Raum) — hell'),
            scaffold: 'Das ist ein ___ Raum.',
            answer: 'heller',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('a bright room (das Zimmer) — hell', 'светла стая (das Zimmer) — hell'),
            scaffold: 'Das ist ein ___ Zimmer.',
            answer: 'helles',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('a big balcony (object) — groß', 'голям балкон (допълнение) — groß'),
            scaffold: 'Die Wohnung hat einen ___ Balkon.',
            answer: 'großen',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      typeIt('cp-b1u1-4', bi('Saying what is wrong', 'Да кажеш какво не е наред'), [
        {
          prompt: bi('I would like to complain about the noise.', 'Бих искал да се оплача от шума.'),
          answer: 'Ich möchte mich über den Lärm beschweren.',
          hints: [],
        },
        {
          prompt: bi('Are the utilities included in the rent?', 'Включени ли са консумативите в наема?'),
          answer: 'Sind die Nebenkosten in der Miete enthalten?',
          hints: [],
        },
      ]),
    ),
    b1(
      dictation('cp-b1u1-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das ist die Wohnung, die einen Balkon hat.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wir suchen eine möblierte Wohnung.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_1: Unit = {
  id: 'b1-u1',
  level: 'b1',
  order: 1,
  status: 'available',
  title: bi('Finding and renting a flat', 'Намиране и наемане на жилище'),
  summary: bi(
    'Relative clauses — the structure that separates A2 German from B1 German — the adjective endings A2 left unfinished, and the vocabulary of a German rental contract.',
    'Относителни изречения — структурата, която отделя A2 от B1 — окончанията на прилагателните, които A2 остави недовършени, и езикът на немския договор за наем.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U1_PATTERNS = PATTERNS;
