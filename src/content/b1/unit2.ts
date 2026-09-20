import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  multipleChoice,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B1 Unit 2 — Authorities and paperwork.
 *
 * The unit that flips the advantage.
 *
 * Unit 1 handed the Bulgarian path a large head start on relative clauses, and
 * said so. This unit does the opposite, and says that too: the infinitive with
 * *zu* is almost free for an English speaker and genuinely hard for a Bulgarian
 * one, because Bulgarian has no infinitive at all. A course that only ever
 * tells one learner they are lucky is not being honest with the other.
 *
 * **The passive** (lesson 1) is the register of the German state. A letter
 * from an Amt almost never names who does anything — *Der Antrag wird geprüft*
 * — which is why reading it matters more than producing it, and why this
 * lesson starts from a real official sentence rather than from a table.
 *
 * Both starting languages have a passive and each builds it differently, so
 * each gets its own predicted error rather than a shared warning. English
 * forms it with *be*, so an English speaker writes *Das Formular ist
 * ausgefüllt* — correct German meaning something else. Bulgarian mostly avoids
 * the construction and uses the reflexive (*формулярът се попълва*), so a
 * Bulgarian speaker reaches for a *sich* that has nowhere to go. Both are
 * authored as traps in the same exercise, exactly as A2 Unit 4 did for
 * reflexives.
 *
 * **The infinitive with zu** (lesson 2) is where Bulgarian loses its
 * advantage. Bulgarian says *надявам се да получа час* — "да" plus a
 * conjugated verb — so the instinct is to conjugate the second verb in German
 * too, producing a heavy *dass*-clause where German wants a bare infinitive.
 * The Bulgarian path gets a translation rule it can actually apply, and the
 * boundary case (different subjects really do need *dass*) is taught with it.
 *
 * **Lesson 3** puts them together in the place they actually occur: a counter,
 * a form, and the letter that arrives afterwards.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-passiv-praesens',
    template: '___ wird ___.',
    example: 'Das Formular wird ausgefüllt.',
    gloss: bi('___ is ___.', '___ се ___.'),
    level: 'b1',
    grammarIds: ['g-passiv'],
  },
  {
    id: 'p-passiv-modal',
    template: '___ muss ___ werden.',
    example: 'Der Antrag muss eingereicht werden.',
    gloss: bi('___ has to be ___.', '___ трябва да бъде ___.'),
    level: 'b1',
    grammarIds: ['g-passiv'],
  },
  {
    id: 'p-zu-infinitiv',
    template: 'Ich hoffe, ___ zu ___.',
    example: 'Ich hoffe, bald einen Termin zu bekommen.',
    gloss: bi('I hope to ___.', 'Надявам се да ___.'),
    level: 'b1',
    grammarIds: ['g-zu-infinitiv'],
  },
  {
    id: 'p-um-zu',
    template: 'Ich gehe ___, um ___ zu ___.',
    example: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
    gloss: bi('I am going ___ in order to ___.', 'Отивам ___, за да ___.'),
    level: 'b1',
    grammarIds: ['g-zu-infinitiv'],
  },
];

/* ================================================================== *
 * Lesson 1 — the language the state speaks
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u2-l1',
  unitId: 'b1-u2',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The form is filled in: the passive', 'Формулярът се попълва: страдателен залог'),
  objective: bi(
    'After this lesson you can read a letter from a German authority, which is written almost entirely in a voice that never says who is doing anything.',
    'След този урок можеш да четеш писмо от немска институция — а то е написано почти изцяло в глас, който никога не казва кой какво прави.',
  ),
  outcomes: [
    bi('I can recognise the passive when I read it.', 'Разпознавам страдателния залог, когато го чета.'),
    bi('I build it with werden, not sein.', 'Строя го с werden, не със sein.'),
    bi('I can name who does it with von.', 'Мога да кажа кой го прави с von.'),
    bi('I understand muss … werden in an official letter.', 'Разбирам muss … werden в официално писмо.'),
  ],
  vocabIds: [
    'v-das-amt',
    'v-das-buergeramt',
    'v-die-anmeldung',
    'v-sich-anmelden',
    'v-das-formular',
    'v-ausfuellen',
    'v-die-unterlagen',
    'v-der-ausweis',
    'v-der-reisepass',
  ],
  grammarIds: ['g-passiv'],
  sections: [
    {
      id: 'b1u2l1-intro',
      kind: 'intro',
      title: bi('A sentence with nobody in it', 'Изречение, в което няма никого'),
      blocks: [
        {
          t: 'de',
          de: 'Der Antrag wird geprüft.',
          gloss: bi('The application is being checked.', 'Заявлението се проверява.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Checked by whom? The sentence does not say, and that is deliberate: the office is speaking as an institution rather than as a person. Almost every letter you will get from a German authority is written this way.',
            'Проверява се от кого? Изречението не казва и това е нарочно: службата говори като институция, а не като човек. Почти всяко писмо от немска институция е написано така.',
          ),
        },
        {
          t: 'contrast',
          de: 'Der Beamte füllt das Formular aus. → Das Formular wird ausgefüllt.',
          other: bi(
            'The person disappears and the form moves to the front.',
            'Човекът изчезва, а формулярът минава отпред.',
          ),
        },
      ],
    },
    {
      id: 'b1u2l1-vocab',
      kind: 'vocabulary',
      title: bi('Registering where you live', 'Регистрация на адреса'),
      vocabIds: [
        'v-das-amt',
        'v-das-buergeramt',
        'v-die-anmeldung',
        'v-sich-anmelden',
        'v-das-formular',
        'v-ausfuellen',
        'v-die-unterlagen',
        'v-der-ausweis',
        'v-der-reisepass',
      ],
      blocks: [],
    },
    {
      id: 'b1u2l1-grammar',
      kind: 'grammar',
      title: bi('werden plus the participle', 'werden плюс причастие'),
      blocks: [],
      grammarId: 'g-passiv',
    },
    {
      id: 'b1u2l1-culture',
      kind: 'culture',
      title: bi('The Anmeldung, and why everything waits for it', 'Anmeldung и защо всичко чака заради нея'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Within two weeks of moving into a flat you are legally required to register your address. The piece of paper you get back is the key to almost everything else.',
            'До две седмици след нанасянето си длъжен по закон да регистрираш адреса си. Листът, който получаваш обратно, е ключът към почти всичко останало.',
          ),
        },
        {
          t: 'list',
          items: [
            bi('No Anmeldung, no bank account.', 'Без Anmeldung няма банкова сметка.'),
            bi('No bank account, no salary and no phone contract.', 'Без банкова сметка няма заплата и телефонен договор.'),
            bi('The tax number arrives by post, at the registered address.', 'Данъчният номер идва по пощата, на регистрирания адрес.'),
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          title: bi('What to bring', 'Какво да носиш'),
          text: bi(
            'A passport or ID, the completed Anmeldeformular, and the Wohnungsgeberbestätigung — a form your landlord signs confirming you really live there. Without that last one the appointment is wasted, and it is the one people forget.',
            'Паспорт или лична карта, попълнен Anmeldeformular и Wohnungsgeberbestätigung — формуляр, подписан от наемодателя, че наистина живееш там. Без последното часът отива нахалост, а точно него хората забравят.',
          ),
        },
      ],
    },
    {
      id: 'b1u2l1-examples',
      kind: 'examples',
      title: bi('Sentences from a real letter', 'Изречения от истинско писмо'),
      blocks: [
        {
          t: 'de',
          de: 'Das Formular wird am Schalter ausgefüllt.',
          gloss: bi('The form is filled in at the counter.', 'Формулярът се попълва на гишето.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Unterlagen werden geprüft.',
          gloss: bi('The documents are being checked.', 'Документите се проверяват.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Antrag wird von der Behörde bearbeitet.',
          gloss: bi(
            'The application is being processed by the authority.',
            'Заявлението се обработва от ведомството.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Bescheinigung muss persönlich abgeholt werden.',
          gloss: bi(
            'The certificate has to be collected in person.',
            'Удостоверението трябва да се получи лично.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u2l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('werden in second position, participle at the end.', 'werden на второ място, причастие в края.'),
            bi('sein plus a participle is a state, not a passive.', 'sein плюс причастие е състояние, не страдателен залог.'),
            bi('von plus the dative names who does it.', 'von плюс дателен казва кой го прави.'),
            bi('With a modal: muss … eingereicht werden.', 'С модален глагол: muss … eingereicht werden.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      multipleChoice('b1u2l1-ex1', bi('Action or state?', 'Действие или състояние?'), [
        {
          prompt: bi(
            'Which sentence says the form is being filled in right now?',
            'Кое изречение казва, че формулярът се попълва в момента?',
          ),
          answer: 'Das Formular wird ausgefüllt.',
          choices: [
            { id: 'a', de: 'Das Formular wird ausgefüllt.' },
            { id: 'b', de: 'Das Formular ist ausgefüllt.' },
          ],
          correct: 'a',
          hints: [],
        },
        {
          prompt: bi(
            'And which one says it is already done?',
            'А кое казва, че вече е готов?',
          ),
          answer: 'Das Formular ist ausgefüllt.',
          choices: [
            { id: 'a', de: 'Das Formular wird ausgefüllt.' },
            { id: 'b', de: 'Das Formular ist ausgefüllt.' },
          ],
          correct: 'b',
          hints: [],
        },
      ]),
    ),
    b1(
      fillBlank('b1u2l1-ex2', bi('Which helper?', 'Кой помощен глагол?'), [
        {
          prompt: bi('The application is being checked.', 'Заявлението се проверява.'),
          scaffold: 'Der Antrag ___ geprüft.',
          answer: 'wird',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('The documents are being checked.', 'Документите се проверяват.'),
          scaffold: 'Die Unterlagen ___ geprüft.',
          answer: 'werden',
          shape: 'word',
          hints: [bi('Plural subject.', 'Подлогът е в множествено число.')],
        },
        {
          prompt: bi('The certificate is sent by post.', 'Удостоверението се изпраща по пощата.'),
          scaffold: 'Die Bescheinigung ___ per Post geschickt.',
          answer: 'wird',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u2l1-ex3',
        bi('Turn it round', 'Обърни го'),
        [
          {
            prompt: bi('The form is filled in at the counter.', 'Формулярът се попълва на гишето.'),
            answer: 'Das Formular wird am Schalter ausgefüllt.',
            reviewTargets: ['p-passiv-praesens', 'v-das-formular', 'v-ausfuellen'],
            hints: [],
            traps: [
              {
                answer: 'Das Formular ist am Schalter ausgefüllt.',
                category: 'verb-conjugation',
                feedback: bi(
                  'That is correct German, but it means the form is already filled in — a finished state. For the action, German uses werden: Das Formular wird ausgefüllt.',
                  'Това е правилен немски, но значи, че формулярът вече е попълнен — завършено състояние. За действието немският използва werden: Das Formular wird ausgefüllt.',
                ),
              },
              {
                answer: 'Das Formular füllt sich am Schalter aus.',
                category: 'pronoun',
                feedback: bi(
                  'There is no reflexive here. Bulgarian says „формулярът се попълва“, but that „се“ has no German equivalent in this construction — German swaps it for werden plus the participle.',
                  'Тук няма възвратна форма. Българският казва „формулярът се попълва“, но това „се“ няма немски еквивалент в тази конструкция — немският го заменя с werden плюс причастие.',
                ),
              },
            ],
          },
          {
            prompt: bi('The documents are being checked.', 'Документите се проверяват.'),
            answer: 'Die Unterlagen werden geprüft.',
            reviewTargets: ['v-die-unterlagen'],
            hints: [],
          },
          {
            prompt: bi('The application is processed by the authority.', 'Заявлението се обработва от ведомството.'),
            answer: 'Der Antrag wird von der Behörde bearbeitet.',
            reviewTargets: ['v-die-behoerde'],
            hints: [bi('von always takes the dative.', 'von винаги иска дателен падеж.')],
          },
        ],
        ['g-passiv'],
      ),
    ),
    b1(
      wordOrder('b1u2l1-ex4', bi('With a modal verb', 'С модален глагол'), [
        {
          prompt: bi('The application has to be submitted by Friday.', 'Заявлението трябва да бъде подадено до петък.'),
          bank: ['Der', 'Antrag', 'muss', 'bis', 'Freitag', 'eingereicht', 'werden.'],
          answer: 'Der Antrag muss bis Freitag eingereicht werden.',
          hints: [
            bi(
              'werden goes last, as an infinitive, behind the participle.',
              'werden отива последно, като инфинитив, зад причастието.',
            ),
          ],
        },
      ]),
    ),
    b1(
      dictation('b1u2l1-ex5', bi('Listening to officialese', 'Слушане на официален немски'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das Formular wird ausgefüllt.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Unterlagen werden geprüft.',
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
        typeIt('b1u2l1-m1', bi('The official voice', 'Официалният глас'), [
          {
            prompt: bi('The form is filled in at the counter.', 'Формулярът се попълва на гишето.'),
            answer: 'Das Formular wird am Schalter ausgefüllt.',
            hints: [],
          },
          {
            prompt: bi('The documents are being checked.', 'Документите се проверяват.'),
            answer: 'Die Unterlagen werden geprüft.',
            hints: [],
          },
          {
            prompt: bi('The application has to be submitted by Friday.', 'Заявлението трябва да бъде подадено до петък.'),
            answer: 'Der Antrag muss bis Freitag eingereicht werden.',
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
        'One helper verb, one participle, and a sentence with nobody in it. Next: how to say what you are going there to do.',
        'Един помощен глагол, едно причастие и изречение, в което няма никого. Следва: как да кажеш какво отиваш да свършиш.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — saying what you are trying to do
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u2-l2',
  unitId: 'b1-u2',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('In order to register: zu and um … zu', 'За да се регистрирам: zu и um … zu'),
  objective: bi(
    'After this lesson you can say what you are hoping, trying or going somewhere to do — in one sentence rather than two.',
    'След този урок можеш да кажеш какво се надяваш, опитваш или отиваш някъде да направиш — в едно изречение вместо в две.',
  ),
  outcomes: [
    bi('I can use zu plus an infinitive at the end.', 'Мога да използвам zu плюс инфинитив в края.'),
    bi('I put the zu inside a separable verb.', 'Слагам zu вътре в отделяемия глагол.'),
    bi('I can give a purpose with um … zu.', 'Мога да кажа цел с um … zu.'),
    bi('I know when dass is needed instead.', 'Знам кога вместо това трябва dass.'),
  ],
  vocabIds: [
    'v-beantragen',
    'v-der-antrag',
    'v-einreichen',
    'v-die-frist',
    'v-die-bescheinigung',
    'v-die-aufenthaltserlaubnis',
    'v-gueltig',
  ],
  grammarIds: ['g-zu-infinitiv'],
  sections: [
    {
      id: 'b1u2l2-intro',
      kind: 'intro',
      title: bi('Two verbs, one sentence', 'Два глагола, едно изречение'),
      blocks: [
        {
          t: 'de',
          de: 'Ich hoffe, bald einen Termin zu bekommen.',
          gloss: bi('I hope to get an appointment soon.', 'Надявам се скоро да получа час.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
          gloss: bi(
            'I am going to the citizens’ office in order to register.',
            'Отивам в гражданската служба, за да се регистрирам.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'The second verb never changes its form. It stays exactly as the dictionary has it, with zu in front, at the end of the sentence.',
            'Вторият глагол изобщо не си мени формата. Остава точно както е в речника, със zu отпред, в края на изречението.',
          ),
        },
      ],
    },
    {
      id: 'b1u2l2-vocab',
      kind: 'vocabulary',
      title: bi('Applying for things', 'Кандидатстване за неща'),
      vocabIds: [
        'v-beantragen',
        'v-der-antrag',
        'v-einreichen',
        'v-die-frist',
        'v-die-bescheinigung',
        'v-die-aufenthaltserlaubnis',
        'v-gueltig',
      ],
      blocks: [],
    },
    {
      id: 'b1u2l2-grammar',
      kind: 'grammar',
      title: bi('zu plus the infinitive', 'zu плюс инфинитив'),
      blocks: [],
      grammarId: 'g-zu-infinitiv',
    },
    {
      id: 'b1u2l2-examples',
      kind: 'examples',
      title: bi('What people actually say at an Amt', 'Какво се казва наистина в службата'),
      blocks: [
        {
          t: 'de',
          de: 'Ich möchte eine Aufenthaltserlaubnis beantragen.',
          gloss: bi(
            'I would like to apply for a residence permit.',
            'Бих искал да подам заявление за разрешение за пребиваване.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Es ist wichtig, sich rechtzeitig anzumelden.',
          gloss: bi('It is important to register in good time.', 'Важно е да се регистрираш навреме.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich habe vergessen, das Formular mitzubringen.',
          gloss: bi('I forgot to bring the form.', 'Забравих да донеса формуляра.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich brauche einen Termin, um den Antrag abzugeben.',
          gloss: bi(
            'I need an appointment in order to hand in the application.',
            'Трябва ми час, за да предам заявлението.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u2l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('zu plus the infinitive, at the end.', 'zu плюс инфинитив, в края.'),
            bi('A separable verb takes the zu inside: anzumelden.', 'Отделяемият глагол взима zu вътре: anzumelden.'),
            bi('um … zu for a purpose.', 'um … zu за цел.'),
            bi('Different subjects need dass instead.', 'При различни подлози трябва dass.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u2l2-ex1', bi('Where does the zu go?', 'Къде отива zu?'), [
        {
          prompt: bi('anmelden — to register', 'anmelden — регистрирам се'),
          scaffold: 'Es ist wichtig, sich rechtzeitig ___.',
          answer: 'anzumelden',
          shape: 'word',
          hints: [
            bi(
              'Separable: the zu goes between the prefix and the stem, all as one word.',
              'Отделяем: zu отива между представката и основата, всичко слято.',
            ),
          ],
          traps: [
            {
              answer: 'zu anmelden',
              category: 'word-order',
              feedback: bi(
                'With a separable verb the zu goes inside, not in front: anzumelden, written as one word.',
                'При отделяем глагол zu отива вътре, не отпред: anzumelden, написано слято.',
              ),
            },
          ],
        },
        {
          prompt: bi('bekommen — to get', 'bekommen — получавам'),
          scaffold: 'Ich hoffe, bald einen Termin ___.',
          answer: 'zu bekommen',
          shape: 'phrase',
          hints: [
            bi(
              'Not separable, so the zu stays in front as its own word.',
              'Не е отделяем, затова zu стои отпред като отделна дума.',
            ),
          ],
        },
        {
          prompt: bi('mitbringen — to bring along', 'mitbringen — донасям'),
          scaffold: 'Ich habe vergessen, das Formular ___.',
          answer: 'mitzubringen',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u2l2-ex2',
        bi('One sentence, not two', 'Едно изречение, не две'),
        [
          {
            prompt: bi('I hope to get an appointment soon.', 'Надявам се скоро да получа час.'),
            answer: 'Ich hoffe, bald einen Termin zu bekommen.',
            reviewTargets: ['p-zu-infinitiv'],
            hints: [],
            traps: [
              {
                answer: 'Ich hoffe, dass ich bald einen Termin bekomme.',
                category: 'word-order',
                feedback: bi(
                  'Grammatically correct, but heavy — and German only needs dass when the two halves have different subjects. Here both are "ich", so the infinitive is the natural form: Ich hoffe, bald einen Termin zu bekommen.',
                  'Граматично е вярно, но е тежко — а немският иска dass само когато двете части имат различни подлози. Тук и двете са „ich“, затова естественото е инфинитивът: Ich hoffe, bald einen Termin zu bekommen. Българското „да получа“ те кара да спрегнеш глагола; на немски той не се мени.',
                ),
              },
            ],
          },
          {
            prompt: bi('It is important to register in good time.', 'Важно е да се регистрираш навреме.'),
            answer: 'Es ist wichtig, sich rechtzeitig anzumelden.',
            reviewTargets: ['v-sich-anmelden'],
            hints: [],
          },
          {
            prompt: bi('I forgot to bring the form.', 'Забравих да донеса формуляра.'),
            answer: 'Ich habe vergessen, das Formular mitzubringen.',
            reviewTargets: ['v-das-formular'],
            hints: [],
          },
          {
            prompt: bi(
              'I would like to apply for a residence permit.',
              'Бих искал да подам заявление за разрешение за пребиваване.',
            ),
            answer: 'Ich möchte eine Aufenthaltserlaubnis beantragen.',
            reviewTargets: ['v-beantragen', 'v-die-aufenthaltserlaubnis'],
            hints: [
              bi(
                'After a modal verb there is no zu at all — möchte takes a bare infinitive.',
                'След модален глагол изобщо няма zu — möchte взима гол инфинитив.',
              ),
            ],
            traps: [
              {
                answer: 'Ich möchte eine Aufenthaltserlaubnis zu beantragen.',
                category: 'extra-word',
                feedback: bi(
                  'Modal verbs never take zu. It is möchte … beantragen, exactly like ich kann … machen.',
                  'Модалните глаголи никога не взимат zu. Правилното е möchte … beantragen, точно както ich kann … machen.',
                ),
              },
            ],
          },
        ],
        ['g-zu-infinitiv'],
      ),
    ),
    b1(
      typeIt(
        'b1u2l2-ex3',
        bi('Saying why you are going', 'Да кажеш защо отиваш'),
        [
          {
            prompt: bi(
              'I am going to the citizens’ office in order to register.',
              'Отивам в гражданската служба, за да се регистрирам.',
            ),
            answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
            reviewTargets: ['p-um-zu', 'v-das-buergeramt'],
            hints: [],
          },
          {
            prompt: bi(
              'I need an appointment in order to hand in the application.',
              'Трябва ми час, за да предам заявлението.',
            ),
            answer: 'Ich brauche einen Termin, um den Antrag abzugeben.',
            reviewTargets: ['v-der-antrag', 'v-abgeben'],
            hints: [],
          },
        ],
        ['g-zu-infinitiv'],
      ),
    ),
    b1(
      exercise({
        id: 'b1u2l2-ex4',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('zu or dass?', 'zu или dass?'),
        steps: [
          {
            prompt: bi('Both halves are "ich".', 'И двете части са „ich“.'),
            scaffold: 'Ich hoffe, bald einen Termin ___ bekommen.',
            answer: 'zu',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('I want *you* to come — the subjects differ.', 'Искам *ти* да дойдеш — подлозите са различни.'),
            scaffold: 'Ich möchte, ___ du mitkommst.',
            answer: 'dass',
            shape: 'word',
            hints: [
              bi(
                'When the two halves have different subjects, the infinitive cannot carry it.',
                'Когато двете части имат различни подлози, инфинитивът не може да го носи.',
              ),
            ],
          },
        ],
      }),
    ),
    b1(
      dictation('b1u2l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich hoffe, bald einen Termin zu bekommen.',
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
        typeIt('b1u2l2-m1', bi('Two verbs, one sentence', 'Два глагола, едно изречение'), [
          {
            prompt: bi('I hope to get an appointment soon.', 'Надявам се скоро да получа час.'),
            answer: 'Ich hoffe, bald einen Termin zu bekommen.',
            hints: [],
          },
          {
            prompt: bi(
              'I am going to the citizens’ office in order to register.',
              'Отивам в гражданската служба, за да се регистрирам.',
            ),
            answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
            hints: [],
          },
          {
            prompt: bi('I forgot to bring the form.', 'Забравих да донеса формуляра.'),
            answer: 'Ich habe vergessen, das Formular mitzubringen.',
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
        'A second verb that never changes, and one small word that sometimes hides inside it. Next: the counter, the queue and the letter that follows.',
        'Втори глагол, който никога не се мени, и една малка дума, която понякога се крие вътре в него. Следва: гишето, опашката и писмото, което идва после.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — at the counter
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u2-l3',
  unitId: 'b1-u2',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('At the counter, and the letter afterwards', 'На гишето и писмото след това'),
  objective: bi(
    'After this lesson you can get through an appointment at a German office and understand the letter that arrives two weeks later.',
    'След този урок можеш да преминеш през час в немска служба и да разбереш писмото, което идва две седмици по-късно.',
  ),
  outcomes: [
    bi('I can ask who is responsible for something.', 'Мога да попитам кой отговаря за нещо.'),
    bi('I can say what I need and why I am there.', 'Мога да кажа какво ми трябва и защо съм там.'),
    bi('I can read a short official letter.', 'Мога да прочета кратко официално писмо.'),
    bi('I can write a short formal request.', 'Мога да напиша кратка официална молба.'),
  ],
  vocabIds: [
    'v-die-behoerde',
    'v-der-schalter',
    'v-zustaendig',
    'v-der-stempel',
    'v-abgeben',
    'v-die-gebuehr',
    'v-der-nachweis',
  ],
  grammarIds: ['g-passiv', 'g-zu-infinitiv'],
  sections: [
    {
      id: 'b1u2l3-intro',
      kind: 'intro',
      title: bi('The sentence you will hear most', 'Изречението, което ще чуеш най-често'),
      blocks: [
        {
          t: 'de',
          de: 'Dafür bin ich leider nicht zuständig.',
          gloss: bi(
            'I am unfortunately not responsible for that.',
            'За това за съжаление не съм компетентен.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'It is not a refusal. It means there is another desk, and the useful thing to say next is a question rather than an argument.',
            'Това не е отказ. Значи, че има друго бюро, и полезното нещо после е въпрос, а не спор.',
          ),
        },
        {
          t: 'de',
          de: 'Wer ist dafür zuständig?',
          gloss: bi('Who is responsible for that?', 'Кой отговаря за това?'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u2l3-vocab',
      kind: 'vocabulary',
      title: bi('At the counter', 'На гишето'),
      vocabIds: [
        'v-die-behoerde',
        'v-der-schalter',
        'v-zustaendig',
        'v-der-stempel',
        'v-abgeben',
        'v-die-gebuehr',
        'v-der-nachweis',
      ],
      blocks: [],
    },
    {
      id: 'b1u2l3-culture',
      kind: 'culture',
      title: bi('How a German office works', 'Как работи немската служба'),
      blocks: [
        {
          t: 'list',
          items: [
            bi(
              'An appointment (Termin) is nearly always required, and is often weeks away.',
              'Почти винаги трябва час (Termin) и той често е след седмици.',
            ),
            bi(
              'Take a number, then watch the screen for your number and a counter.',
              'Взимаш номер, после следиш екрана за номера си и за гише.',
            ),
            bi(
              'Bring everything on the list. A missing document means a new appointment, not a phone call.',
              'Носи всичко от списъка. Липсващ документ значи нов час, а не телефонно обаждане.',
            ),
            bi(
              'Many offices take cash only. "Nur Barzahlung" means notes.',
              'Много служби приемат само в брой. „Nur Barzahlung“ значи банкноти.',
            ),
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('The answer arrives on paper', 'Отговорът идва на хартия'),
          text: bi(
            'German authorities write letters. The decision will come by post, to your registered address, often weeks later — which is one more reason the Anmeldung has to be right.',
            'Немските институции пишат писма. Решението идва по пощата, на регистрирания ти адрес, често седмици по-късно — което е още една причина Anmeldung да е точна.',
          ),
        },
      ],
    },
    {
      id: 'b1u2l3-examples',
      kind: 'examples',
      title: bi('Getting through the appointment', 'Как да минеш през часа'),
      blocks: [
        {
          t: 'de',
          de: 'Ich habe einen Termin um zehn Uhr.',
          gloss: bi('I have an appointment at ten.', 'Имам час в десет.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich möchte mich anmelden. Hier sind meine Unterlagen.',
          gloss: bi(
            'I would like to register. Here are my documents.',
            'Бих искал да се регистрирам. Ето документите ми.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ein Nachweis über das Einkommen wird verlangt.',
          gloss: bi('Proof of income is required.', 'Изисква се документ за доходите.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Bescheinigung wird Ihnen per Post geschickt.',
          gloss: bi(
            'The certificate will be sent to you by post.',
            'Удостоверението ще ти бъде изпратено по пощата.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u2l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('"Nicht zuständig" means another desk, not no.', '„Nicht zuständig“ значи друго бюро, а не „не“.'),
            bi('Say what you want with möchte plus the bare infinitive.', 'Кажи какво искаш с möchte плюс гол инфинитив.'),
            bi('Official letters are in the passive. Read for the verb at the end.', 'Официалните писма са в страдателен залог. Търси глагола в края.'),
            bi('wird verlangt, wird geschickt, muss abgeholt werden.', 'wird verlangt, wird geschickt, muss abgeholt werden.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      typeIt(
        'b1u2l3-ex1',
        bi('At the counter', 'На гишето'),
        [
          {
            prompt: bi('I have an appointment at ten.', 'Имам час в десет.'),
            answer: 'Ich habe einen Termin um zehn Uhr.',
            reviewTargets: ['v-termin'],
            hints: [],
          },
          {
            prompt: bi('Who is responsible for that?', 'Кой отговаря за това?'),
            answer: 'Wer ist dafür zuständig?',
            reviewTargets: ['v-zustaendig'],
            hints: [],
          },
          {
            prompt: bi('How much is the fee?', 'Колко е таксата?'),
            answer: 'Wie hoch ist die Gebühr?',
            alternatives: ['Wie viel kostet das?'],
            reviewTargets: ['v-die-gebuehr'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      fillBlank('b1u2l3-ex2', bi('Reading the letter', 'Четене на писмото'), [
        {
          prompt: bi('Proof of income is required.', 'Изисква се документ за доходите.'),
          scaffold: 'Ein Nachweis über das Einkommen ___ verlangt.',
          answer: 'wird',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('The certificate has to be collected in person.', 'Удостоверението трябва да се получи лично.'),
          scaffold: 'Die Bescheinigung muss persönlich abgeholt ___.',
          answer: 'werden',
          shape: 'word',
          hints: [
            bi(
              'With a modal, werden goes last as an infinitive.',
              'С модален глагол werden отива последно като инфинитив.',
            ),
          ],
        },
        {
          prompt: bi('I am coming in order to hand in the application.', 'Идвам, за да предам заявлението.'),
          scaffold: 'Ich komme, um den Antrag ___.',
          answer: 'abzugeben',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u2l3-ex3',
        bi('Putting both together', 'Двете заедно'),
        [
          {
            prompt: bi(
              'I would like to register. Here are my documents.',
              'Бих искал да се регистрирам. Ето документите ми.',
            ),
            answer: 'Ich möchte mich anmelden. Hier sind meine Unterlagen.',
            reviewTargets: ['v-sich-anmelden', 'v-die-unterlagen'],
            hints: [],
          },
          {
            prompt: bi(
              'The certificate will be sent to you by post.',
              'Удостоверението ще ти бъде изпратено по пощата.',
            ),
            answer: 'Die Bescheinigung wird Ihnen per Post geschickt.',
            reviewTargets: ['v-die-bescheinigung'],
            hints: [],
          },
          {
            prompt: bi('Without a stamp the document is not valid.', 'Без печат документът не е валиден.'),
            answer: 'Ohne Stempel ist das Dokument nicht gültig.',
            reviewTargets: ['v-der-stempel', 'v-gueltig'],
            hints: [],
          },
        ],
        ['g-passiv'],
      ),
    ),
    b1(
      freeWriting('b1u2l3-ex4', bi('Write the request', 'Напиши молбата'), [
        {
          prompt: bi(
            'Write two or three sentences to an office: you would like an appointment in order to register, and you ask which documents are required. Use um … zu at least once.',
            'Напиши две-три изречения до служба: искаш час, за да се регистрираш, и питаш какви документи се изискват. Използвай um … zu поне веднъж.',
          ),
          answer:
            'Ich möchte einen Termin vereinbaren, um mich anzumelden. Welche Unterlagen werden benötigt?',
          requiredTokens: ['um'],
          shape: 'sentence',
          hints: [
            bi(
              'Say what you want first, then the purpose, then the question.',
              'Първо кажи какво искаш, после целта, после въпроса.',
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
        typeIt('b1u2l3-m1', bi('The whole appointment', 'Целият час'), [
          {
            prompt: bi('Who is responsible for that?', 'Кой отговаря за това?'),
            answer: 'Wer ist dafür zuständig?',
            hints: [],
          },
          {
            prompt: bi(
              'The certificate will be sent to you by post.',
              'Удостоверението ще ти бъде изпратено по пощата.',
            ),
            answer: 'Die Bescheinigung wird Ihnen per Post geschickt.',
            hints: [],
          },
          {
            prompt: bi('I am coming in order to hand in the application.', 'Идвам, за да предам заявлението.'),
            answer: 'Ich komme, um den Antrag abzugeben.',
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
        'A voice with nobody in it, a second verb that never changes, and the vocabulary of the German state. Next: the doctor, where the language gets personal again.',
        'Глас, в който няма никого, втори глагол, който никога не се мени, и езикът на немската държава. Следва: лекарят, където езикът отново става личен.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u2',
  scope: 'unit',
  targetId: 'b1-u2',
  status: 'available',
  title: bi('Unit 2 checkpoint', 'Проверка на раздел 2'),
  description: bi(
    'The passive in both its shapes, zu and um … zu, and the paperwork they describe.',
    'Страдателният залог в двете си форми, zu и um … zu, и документите, които описват.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u2-1', bi('The official voice', 'Официалният глас'), [
        {
          prompt: bi('The form is filled in at the counter.', 'Формулярът се попълва на гишето.'),
          answer: 'Das Formular wird am Schalter ausgefüllt.',
          hints: [],
        },
        {
          prompt: bi('The application has to be submitted by Friday.', 'Заявлението трябва да бъде подадено до петък.'),
          answer: 'Der Antrag muss bis Freitag eingereicht werden.',
          hints: [],
        },
        {
          prompt: bi('The application is processed by the authority.', 'Заявлението се обработва от ведомството.'),
          answer: 'Der Antrag wird von der Behörde bearbeitet.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u2-2', bi('Two verbs, one sentence', 'Два глагола, едно изречение'), [
        {
          prompt: bi('I hope to get an appointment soon.', 'Надявам се скоро да получа час.'),
          answer: 'Ich hoffe, bald einen Termin zu bekommen.',
          hints: [],
        },
        {
          prompt: bi(
            'I am going to the citizens’ office in order to register.',
            'Отивам в гражданската служба, за да се регистрирам.',
          ),
          answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u2-3',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('The right form', 'Правилната форма'),
        steps: [
          {
            prompt: bi('plural subject, passive', 'подлог в мн. число, страдателен залог'),
            scaffold: 'Die Unterlagen ___ geprüft.',
            answer: 'werden',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('anmelden, after "wichtig, sich …"', 'anmelden, след „wichtig, sich …“'),
            scaffold: 'Es ist wichtig, sich rechtzeitig ___.',
            answer: 'anzumelden',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('different subjects', 'различни подлози'),
            scaffold: 'Ich möchte, ___ du mitkommst.',
            answer: 'dass',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      typeIt('cp-b1u2-4', bi('At the office', 'В службата'), [
        {
          prompt: bi('Who is responsible for that?', 'Кой отговаря за това?'),
          answer: 'Wer ist dafür zuständig?',
          hints: [],
        },
        {
          prompt: bi('Without a stamp the document is not valid.', 'Без печат документът не е валиден.'),
          answer: 'Ohne Stempel ist das Dokument nicht gültig.',
          hints: [],
        },
      ]),
    ),
    b1(
      dictation('cp-b1u2-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Unterlagen werden geprüft.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_2: Unit = {
  id: 'b1-u2',
  level: 'b1',
  order: 2,
  status: 'available',
  title: bi('Authorities and paperwork', 'Институции и документи'),
  summary: bi(
    'The passive, which is the voice the German state writes in, and the infinitive with zu — the one place where the English path gets the easy ride and the Bulgarian path has real work to do.',
    'Страдателният залог, гласът, с който пише немската държава, и инфинитивът със zu — мястото, където английският път е лесният, а българският има истинска работа.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U2_PATTERNS = PATTERNS;
