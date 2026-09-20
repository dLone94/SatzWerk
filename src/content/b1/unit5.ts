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
 * B1 Unit 5 — Family, school and daily life.
 *
 * The narrating unit. Everything up to here has been transactional — renting,
 * registering, applying, being ill — and this is where the learner gets to
 * tell somebody about their life.
 *
 * **The Präteritum** (lesson 1) is the grammar for it, and the thing that
 * actually needs teaching is not the endings but the register rule: German
 * chooses between its two past tenses by *how you are communicating* rather
 * than by what happened. Spoken German tells a story in the Perfekt; written
 * German tells the same story in the Präteritum.
 *
 * Neither starting language does this, and they fail differently. English has
 * one simple past that covers everything, so *ich ging* and *ich bin gegangen*
 * both read as "I went" and the split looks arbitrary. Bulgarian is the more
 * interesting case, because it has *more* past tenses than German: its
 * imperfect maps remarkably well onto the Präteritum for background
 * description, so the intuition for when it *feels* right is largely already
 * there — what is missing is the register rule, since Bulgarian uses its
 * aorist in conversation constantly.
 *
 * **als, wenn and wann** (lesson 2) is the small compulsory distinction that
 * one English word and two Bulgarian ones obscure. It is equally hard from
 * both directions and the unit says so.
 *
 * The setting is the German school system, which is worth a unit of its own:
 * *Kita*, *Grundschule*, *Gymnasium*, *Ausbildung*, and a decision made about
 * a child at the age of ten. A learner who cannot follow that conversation
 * cannot take part in one of the most consequential decisions of their
 * family's life here.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-praeteritum-erzaehlen',
    template: 'Damals ___ wir in ___.',
    example: 'Damals wohnten wir in Bulgarien.',
    gloss: bi('Back then we lived in ___.', 'Тогава живеехме в ___.'),
    level: 'b1',
    grammarIds: ['g-praeteritum'],
  },
  {
    id: 'p-als-ich-war',
    template: 'Als ich ___ war, ___.',
    example: 'Als ich zehn war, kam ich aufs Gymnasium.',
    gloss: bi('When I was ___, ___.', 'Когато бях на ___, ___.'),
    level: 'b1',
    grammarIds: ['g-als-wenn'],
  },
  {
    id: 'p-wenn-immer',
    template: 'Wenn ich ___ hatte, ___ ich ___.',
    example: 'Wenn ich Zeit hatte, spielte ich Fußball.',
    gloss: bi('Whenever I had ___, I ___.', 'Когато имах ___, ___.'),
    level: 'b1',
    grammarIds: ['g-als-wenn'],
  },
  {
    id: 'p-nachdem',
    template: 'Nachdem ___ , ___.',
    example: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
    gloss: bi('After ___ had ___, ___.', 'След като ___, ___.'),
    level: 'b1',
    grammarIds: ['g-plusquamperfekt'],
  },
];

/* ================================================================== *
 * Lesson 1 — telling it, and writing it
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u5-l1',
  unitId: 'b1-u5',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Back then we lived in: the written past', 'Тогава живеехме в: миналото на писмения език'),
  objective: bi(
    'After this lesson you can write about your own past — and know why the tense you write in is not the tense you speak in.',
    'След този урок можеш да пишеш за собственото си минало — и да знаеш защо времето, в което пишеш, не е времето, в което говориш.',
  ),
  outcomes: [
    bi('I can form the Präteritum of regular and common verbs.', 'Мога да образувам Präteritum на правилни и чести глаголи.'),
    bi('I use the Perfekt when speaking and the Präteritum when writing.', 'Използвам Perfekt в говор и Präteritum в писане.'),
    bi('I know sein, haben and the modals break that rule.', 'Знам, че sein, haben и модалните нарушават това правило.'),
    bi('I can tell a short story about my childhood.', 'Мога да разкажа кратка история за детството си.'),
  ],
  vocabIds: [
    'v-damals',
    'v-die-kindheit',
    'v-sich-erinnern',
    'v-der-schultag',
    'v-aufwachsen',
    'v-die-erinnerung',
  ],
  grammarIds: ['g-praeteritum'],
  sections: [
    {
      id: 'b1u5l1-intro',
      kind: 'intro',
      title: bi('Two tenses, one meaning', 'Две времена, едно значение'),
      blocks: [
        {
          t: 'contrast',
          de: 'Ich habe in Hamburg gewohnt. — Ich wohnte in Hamburg.',
          other: bi(
            'The same fact twice. The first is what you say; the second is what you write.',
            'Един и същи факт два пъти. Първото се казва; второто се пише.',
          ),
        },
        {
          t: 'de',
          de: 'Damals wohnten wir noch in Bulgarien.',
          gloss: bi('Back then we still lived in Bulgaria.', 'Тогава още живеехме в България.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'A2 gave you war, hatte and es gab and said they were the survivors of this tense. Here is the rest of it — and the rule that decides when to reach for it.',
            'A2 ти даде war, hatte и es gab и каза, че са оцелелите от това време. Ето останалото — и правилото, което решава кога да посегнеш към него.',
          ),
        },
      ],
    },
    {
      id: 'b1u5l1-vocab',
      kind: 'vocabulary',
      title: bi('Words a story needs', 'Думи, които са нужни на един разказ'),
      vocabIds: [
        'v-damals',
        'v-die-kindheit',
        'v-sich-erinnern',
        'v-der-schultag',
        'v-aufwachsen',
        'v-die-erinnerung',
      ],
      blocks: [],
    },
    {
      id: 'b1u5l1-grammar',
      kind: 'grammar',
      title: bi('The Präteritum', 'Präteritum: писменото минало'),
      blocks: [],
      grammarId: 'g-praeteritum',
    },
    {
      id: 'b1u5l1-examples',
      kind: 'examples',
      title: bi('A childhood, written down', 'Едно детство, записано'),
      blocks: [
        {
          t: 'de',
          de: 'Ich bin in einer kleinen Stadt aufgewachsen.',
          gloss: bi('I grew up in a small town.', 'Израснах в малък град.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'In meiner Kindheit hatten wir keinen Fernseher.',
          gloss: bi(
            'In my childhood we did not have a television.',
            'В детството ми нямахме телевизор.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich erinnere mich an meinen ersten Schultag.',
          gloss: bi('I remember my first day at school.', 'Спомням си първия си учебен ден.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der erste Schultag war sehr aufregend.',
          gloss: bi('The first day at school was very exciting.', 'Първият учебен ден беше много вълнуващ.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u5l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Speaking: Perfekt. Writing: Präteritum.', 'Говор: Perfekt. Писане: Präteritum.'),
            bi('sein, haben and the modals use Präteritum even in speech.', 'sein, haben и модалните са в Präteritum дори в говор.'),
            bi('The ich-form and the er-form are identical.', 'Формите за ich и за er са еднакви.'),
            bi('-te for regular verbs; a vowel change for the rest.', '-te при правилните; смяна на гласната при останалите.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      conjugate(
        'b1u5l1-ex1',
        'wohnen (Präteritum)',
        bi('The regular pattern', 'Правилният модел'),
        ['wohnte', 'wohntest', 'wohnte', 'wohnten', 'wohntet', 'wohnten'],
      ),
    ),
    b1(
      fillBlank('b1u5l1-ex2', bi('Put it in the Präteritum', 'Сложи го в Präteritum'), [
        {
          prompt: bi('gehen — I went', 'gehen — отидох'),
          scaffold: 'Ich ___ jeden Tag zu Fuß zur Schule.',
          answer: 'ging',
          shape: 'word',
          hints: [bi('Vowel change, no -te.', 'Смяна на гласната, без -te.')],
        },
        {
          prompt: bi('haben — we had', 'haben — имахме'),
          scaffold: 'In meiner Kindheit ___ wir keinen Fernseher.',
          answer: 'hatten',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('sein — it was', 'sein — беше'),
          scaffold: 'Der erste Schultag ___ sehr aufregend.',
          answer: 'war',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('spielen — I played', 'spielen — играех'),
          scaffold: 'Wenn ich Zeit hatte, ___ ich Fußball.',
          answer: 'spielte',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u5l1-ex3',
        bi('Write about before', 'Пиши за преди'),
        [
          {
            prompt: bi('Back then we still lived in Bulgaria.', 'Тогава още живеехме в България.'),
            answer: 'Damals wohnten wir noch in Bulgarien.',
            alternatives: ['Wir wohnten damals noch in Bulgarien.'],
            reviewTargets: ['p-praeteritum-erzaehlen', 'v-damals'],
            hints: [],
          },
          {
            prompt: bi('I grew up in a small town.', 'Израснах в малък град.'),
            answer: 'Ich bin in einer kleinen Stadt aufgewachsen.',
            reviewTargets: ['v-aufwachsen'],
            hints: [
              bi(
                'This one is spoken, so it is the Perfekt — and aufwachsen takes sein.',
                'Това е говорим език, значи Perfekt — а aufwachsen взима sein.',
              ),
            ],
          },
          {
            prompt: bi('I remember my first day at school.', 'Спомням си първия си учебен ден.'),
            answer: 'Ich erinnere mich an meinen ersten Schultag.',
            reviewTargets: ['v-sich-erinnern', 'v-der-schultag'],
            hints: [],
          },
        ],
        ['g-praeteritum'],
      ),
    ),
    b1(
      dictation('b1u5l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Damals wohnten wir noch in Bulgarien.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'In meiner Kindheit hatten wir keinen Fernseher.',
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
        typeIt('b1u5l1-m1', bi('A story, written', 'Разказ, написан'), [
          {
            prompt: bi('Back then we still lived in Bulgaria.', 'Тогава още живеехме в България.'),
            answer: 'Damals wohnten wir noch in Bulgarien.',
            alternatives: ['Wir wohnten damals noch in Bulgarien.'],
            hints: [],
          },
          {
            prompt: bi(
              'In my childhood we did not have a television.',
              'В детството ми нямахме телевизор.',
            ),
            answer: 'In meiner Kindheit hatten wir keinen Fernseher.',
            alternatives: ['Wir hatten in meiner Kindheit keinen Fernseher.'],
            hints: [],
          },
          {
            prompt: bi('I remember my first day at school.', 'Спомням си първия си учебен ден.'),
            answer: 'Ich erinnere mich an meinen ersten Schultag.',
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
        'Two tenses with one meaning, sorted by whether you are speaking or writing. Next: the one word English has where German has three.',
        'Две времена с едно значение, подредени според това дали говориш, или пишеш. Следва: думата, която в английския е една, а в немския — три.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — als, wenn, wann
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u5-l2',
  unitId: 'b1-u5',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('When I was ten: als, wenn and wann', 'Когато бях на десет: als, wenn и wann'),
  objective: bi(
    'After this lesson you can place events in your past precisely — and follow a conversation about German schooling, which is where German parents place theirs.',
    'След този урок можеш да разположиш точно събитията в своето минало — и да следиш разговор за немското училище, където германските родители разполагат своите.',
  ),
  outcomes: [
    bi('I use als for a single past event.', 'Използвам als за едно минало събитие.'),
    bi('I use wenn for something repeated.', 'Използвам wenn за нещо повтарящо се.'),
    bi('I use wann only in a question.', 'Използвам wann само във въпрос.'),
    bi('I know what Kita, Grundschule and Gymnasium mean.', 'Знам какво значат Kita, Grundschule и Gymnasium.'),
  ],
  vocabIds: [
    'v-die-kita',
    'v-die-grundschule',
    'v-das-gymnasium',
    'v-das-abitur',
    'v-die-ausbildung',
    'v-das-zeugnis',
    'v-die-note',
  ],
  grammarIds: ['g-als-wenn'],
  sections: [
    {
      id: 'b1u5l2-intro',
      kind: 'intro',
      title: bi('Once, or every time?', 'Веднъж или всеки път?'),
      blocks: [
        {
          t: 'contrast',
          de: 'Als ich zehn war, kam ich aufs Gymnasium. — Wenn ich Zeit hatte, spielte ich Fußball.',
          other: bi(
            'Once, and every time. English uses "when" for both; German does not.',
            'Веднъж и всеки път. Английският използва „when“ и за двете; немският — не.',
          ),
        },
        {
          t: 'de',
          de: 'Wann fängt die Schule an?',
          gloss: bi('When does school start?', 'Кога започва училището?'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u5l2-vocab',
      kind: 'vocabulary',
      title: bi('The German school system', 'Немската училищна система'),
      vocabIds: [
        'v-die-kita',
        'v-die-grundschule',
        'v-das-gymnasium',
        'v-das-abitur',
        'v-die-ausbildung',
        'v-das-zeugnis',
        'v-die-note',
      ],
      blocks: [],
    },
    {
      id: 'b1u5l2-grammar',
      kind: 'grammar',
      title: bi('als, wenn, wann', 'als, wenn, wann'),
      blocks: [],
      grammarId: 'g-als-wenn',
    },
    {
      id: 'b1u5l2-culture',
      kind: 'culture',
      title: bi('A decision made at ten', 'Решение, взето на десет'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'German schooling splits early, and the split is the thing to understand — not the names.',
            'Немското училище се разделя рано и точно това разделяне трябва да се разбере, а не имената.',
          ),
        },
        {
          t: 'table',
          headers: [bi('Stage', 'Етап'), bi('Age', 'Възраст'), bi('What it is', 'Какво е')],
          rows: [
            ['Kita', '1–6', bi('nursery; places are scarce and booked early', 'детска градина; местата са малко и се запазват рано')],
            ['Grundschule', '6–10', bi('primary school, four years in most states', 'начално училище, четири години в повечето провинции')],
            ['Gymnasium', '10–18', bi('the academic track, ending in the Abitur', 'академичният път, завършващ с Abitur')],
            ['Ausbildung', bi('after school', 'след училище'), bi('paid apprenticeship plus vocational school', 'платено чиракуване плюс професионално училище')],
          ],
        },
        {
          t: 'callout',
          tone: 'warn',
          title: bi('Marks run the other way', 'Оценките вървят наобратно'),
          text: bi(
            'German school marks go from 1 to 6, and **1 is the best**. A "five" is a bad mark, not a good one — worth knowing before you congratulate anybody.',
            'Немските оценки са от 1 до 6 и **1 е най-добрата**. „Петица“ е лоша оценка, а не добра — струва си да се знае, преди да поздравиш някого.',
          ),
        },
      ],
    },
    {
      id: 'b1u5l2-examples',
      kind: 'examples',
      title: bi('Talking about school', 'Разговор за училището'),
      blocks: [
        {
          t: 'de',
          de: 'Als ich zehn war, kam ich aufs Gymnasium.',
          gloss: bi('When I was ten I went to the Gymnasium.', 'Когато бях на десет, отидох в гимназия.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wenn ich Zeit hatte, spielte ich Fußball.',
          gloss: bi(
            'Whenever I had time I played football.',
            'Когато имах време, играех футбол.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ohne Abitur kann man nicht studieren.',
          gloss: bi(
            'Without the Abitur you cannot go to university.',
            'Без матура не можеш да учиш в университет.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Er macht eine Ausbildung als Elektriker.',
          gloss: bi(
            'He is doing an apprenticeship as an electrician.',
            'Той учи за електротехник.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u5l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('als: once, in the past.', 'als: веднъж, в миналото.'),
            bi('wenn: every time, or present and future.', 'wenn: всеки път, или сегашно и бъдеще.'),
            bi('wann: only in a question.', 'wann: само във въпрос.'),
            bi('All three send the verb to the end.', 'И трите изпращат глагола в края.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u5l2-ex1', bi('als, wenn or wann?', 'als, wenn или wann?'), [
        {
          prompt: bi('Once, in the past: I was ten.', 'Веднъж, в миналото: бях на десет.'),
          scaffold: '___ ich zehn war, kam ich aufs Gymnasium.',
          answer: 'Als',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'Wenn',
              category: 'vocabulary',
              feedback: bi(
                'Being ten happened once, so it is als. Wenn would suggest you were repeatedly ten years old.',
                'Да си на десет се е случило веднъж, затова е als. Wenn би подсказало, че многократно си бил на десет.',
              ),
            },
          ],
        },
        {
          prompt: bi('Every time I had time.', 'Всеки път, когато имах време.'),
          scaffold: '___ ich Zeit hatte, spielte ich Fußball.',
          answer: 'Wenn',
          shape: 'word',
          hints: [bi('Try "whenever". If it still works, it is wenn.', 'Опитай с „всеки път, когато“. Ако пак върви, значи е wenn.')],
        },
        {
          prompt: bi('A question.', 'Въпрос.'),
          scaffold: '___ fängt die Schule an?',
          answer: 'Wann',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('An indirect question.', 'Непряк въпрос.'),
          scaffold: 'Können Sie mir sagen, ___ der Elternabend stattfindet?',
          answer: 'wann',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      wordOrder('b1u5l2-ex2', bi('Build the clause', 'Построй изречението'), [
        {
          prompt: bi('When I was ten I went to the Gymnasium.', 'Когато бях на десет, отидох в гимназия.'),
          bank: ['Als', 'ich', 'zehn', 'war,', 'kam', 'ich', 'aufs', 'Gymnasium.'],
          answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
          hints: [bi('The verb goes last in the als-clause.', 'Глаголът отива последен в als-изречението.')],
        },
        {
          prompt: bi('Whenever I had time I played football.', 'Когато имах време, играех футбол.'),
          bank: ['Wenn', 'ich', 'Zeit', 'hatte,', 'spielte', 'ich', 'Fußball.'],
          answer: 'Wenn ich Zeit hatte, spielte ich Fußball.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u5l2-ex3',
        bi('Talking about schooling', 'Разговор за образованието'),
        [
          {
            prompt: bi('When I was ten I went to the Gymnasium.', 'Когато бях на десет, отидох в гимназия.'),
            answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
            reviewTargets: ['p-als-ich-war', 'v-das-gymnasium'],
            hints: [],
          },
          {
            prompt: bi('Primary school lasts four years.', 'Началното училище трае четири години.'),
            answer: 'Die Grundschule dauert vier Jahre.',
            reviewTargets: ['v-die-grundschule'],
            hints: [],
          },
          {
            prompt: bi('He is doing an apprenticeship as an electrician.', 'Той учи за електротехник.'),
            answer: 'Er macht eine Ausbildung als Elektriker.',
            reviewTargets: ['v-die-ausbildung'],
            hints: [],
          },
          {
            prompt: bi('We have already found a nursery place.', 'Вече намерихме място в детска градина.'),
            answer: 'Wir haben schon einen Kita-Platz gefunden.',
            reviewTargets: ['v-die-kita'],
            hints: [],
          },
        ],
        ['g-als-wenn'],
      ),
    ),
    b1(
      dictation('b1u5l2-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wenn ich Zeit hatte, spielte ich Fußball.',
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
        typeIt('b1u5l2-m1', bi('Once or every time', 'Веднъж или всеки път'), [
          {
            prompt: bi('When I was ten I went to the Gymnasium.', 'Когато бях на десет, отидох в гимназия.'),
            answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
            hints: [],
          },
          {
            prompt: bi('Whenever I had time I played football.', 'Когато имах време, играех футбол.'),
            answer: 'Wenn ich Zeit hatte, spielte ich Fußball.',
            hints: [],
          },
          {
            prompt: bi('When does school start?', 'Кога започва училището?'),
            answer: 'Wann fängt die Schule an?',
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
        'Three words, one test: once, every time, or asking. Next: putting two past events in order.',
        'Три думи, една проверка: веднъж, всеки път или питане. Следва: подреждане на две минали събития.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — the past before the past, and everyday life
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u5-l3',
  unitId: 'b1-u5',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('After we had moved: ordering the past', 'След като се бяхме преместили: подредба на миналото'),
  objective: bi(
    'After this lesson you can say which of two past things happened first, and handle the letters a German school sends home.',
    'След този урок можеш да кажеш кое от две минали неща е станало първо и да се справяш с писмата, които немското училище праща вкъщи.',
  ),
  outcomes: [
    bi('I can form hatte or war plus the participle.', 'Мога да образувам hatte или war плюс причастие.'),
    bi('I can use nachdem correctly.', 'Мога да използвам nachdem правилно.'),
    bi('I can read a note from the school.', 'Мога да прочета бележка от училището.'),
    bi('I can describe my daily routine and say it is exhausting.', 'Мога да опиша ежедневието си и да кажа, че е изморително.'),
  ],
  vocabIds: [
    'v-der-elternabend',
    'v-stattfinden',
    'v-die-hausaufgaben',
    'v-sich-kuemmern',
    'v-der-alltag',
    'v-anstrengend',
    'v-die-betreuung',
  ],
  grammarIds: ['g-plusquamperfekt'],
  sections: [
    {
      id: 'b1u5l3-intro',
      kind: 'intro',
      title: bi('Which one came first?', 'Кое е станало първо?'),
      blocks: [
        {
          t: 'de',
          de: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
          gloss: bi(
            'After we had moved, I found a new school.',
            'След като се бяхме преместили, намерих ново училище.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'You already have this idea in your own language, and German marks it the same way: an auxiliary in the past plus the participle.',
            'Тази идея вече я имаш на своя език и немският я отбелязва по същия начин: помощен глагол в минало плюс причастие.',
          ),
        },
      ],
    },
    {
      id: 'b1u5l3-vocab',
      kind: 'vocabulary',
      title: bi('Everyday life with a school in it', 'Ежедневие с училище в него'),
      vocabIds: [
        'v-der-elternabend',
        'v-stattfinden',
        'v-die-hausaufgaben',
        'v-sich-kuemmern',
        'v-der-alltag',
        'v-anstrengend',
        'v-die-betreuung',
      ],
      blocks: [],
    },
    {
      id: 'b1u5l3-grammar',
      kind: 'grammar',
      title: bi('hatte or war plus the participle', 'hatte или war плюс причастие'),
      blocks: [],
      grammarId: 'g-plusquamperfekt',
    },
    {
      id: 'b1u5l3-examples',
      kind: 'examples',
      title: bi('Notes from the school', 'Бележки от училището'),
      blocks: [
        {
          t: 'de',
          de: 'Der Elternabend findet am Dienstag statt.',
          gloss: bi('The parents’ evening takes place on Tuesday.', 'Родителската среща е във вторник.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Betreuung endet um sechzehn Uhr.',
          gloss: bi('The childcare ends at four o’clock.', 'Гледането свършва в шестнайсет часа.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Nachdem ich gegessen hatte, machte ich die Hausaufgaben.',
          gloss: bi(
            'After I had eaten, I did the homework.',
            'След като бях ял, направих домашните.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Alltag mit zwei Kindern ist anstrengend.',
          gloss: bi(
            'Everyday life with two children is exhausting.',
            'Ежедневието с две деца е изморително.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u5l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('hatte or war plus the participle for the earlier event.', 'hatte или war плюс причастие за по-ранното събитие.'),
            bi('nachdem takes the earlier tense; the main clause the later.', 'nachdem взима по-ранното време; главното изречение — по-късното.'),
            bi('The auxiliary is the same one the Perfekt would use.', 'Помощният глагол е същият, който би използвал Perfekt.'),
            bi('findet statt means it is happening; fällt aus means cancelled.', 'findet statt значи, че ще се проведе; fällt aus — че се отменя.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u5l3-ex1', bi('hatte or war?', 'hatte или war?'), [
        {
          prompt: bi('umziehen takes sein', 'umziehen взима sein'),
          scaffold: 'Nachdem wir umgezogen ___, fand ich eine neue Schule.',
          answer: 'waren',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('essen takes haben', 'essen взима haben'),
          scaffold: 'Nachdem ich gegessen ___, machte ich die Hausaufgaben.',
          answer: 'hatte',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('gehen takes sein', 'gehen взима sein'),
          scaffold: 'Nachdem er zur Schule gegangen ___, war es sehr ruhig.',
          answer: 'war',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u5l3-ex2',
        bi('Two things, in order', 'Две неща, по ред'),
        [
          {
            prompt: bi(
              'After we had moved, I found a new school.',
              'След като се бяхме преместили, намерих ново училище.',
            ),
            answer: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
            reviewTargets: ['p-nachdem', 'v-umziehen'],
            hints: [],
          },
          {
            prompt: bi('After I had eaten, I did the homework.', 'След като бях ял, направих домашните.'),
            answer: 'Nachdem ich gegessen hatte, machte ich die Hausaufgaben.',
            reviewTargets: ['v-die-hausaufgaben'],
            hints: [],
          },
        ],
        ['g-plusquamperfekt'],
      ),
    ),
    b1(
      typeIt(
        'b1u5l3-ex3',
        bi('Everyday life', 'Ежедневие'),
        [
          {
            prompt: bi('The parents’ evening takes place on Tuesday.', 'Родителската среща е във вторник.'),
            answer: 'Der Elternabend findet am Dienstag statt.',
            reviewTargets: ['v-der-elternabend', 'v-stattfinden'],
            hints: [
              bi(
                'stattfinden is separable, so statt goes to the end.',
                'stattfinden е отделяем, затова statt отива в края.',
              ),
            ],
          },
          {
            prompt: bi('The childcare ends at four o’clock.', 'Гледането свършва в шестнайсет часа.'),
            answer: 'Die Betreuung endet um sechzehn Uhr.',
            reviewTargets: ['v-die-betreuung'],
            hints: [],
          },
          {
            prompt: bi(
              'Everyday life with two children is exhausting.',
              'Ежедневието с две деца е изморително.',
            ),
            answer: 'Der Alltag mit zwei Kindern ist anstrengend.',
            reviewTargets: ['v-der-alltag', 'v-anstrengend'],
            hints: [],
          },
          {
            prompt: bi('My mother looked after us.', 'Майка ми се грижеше за нас.'),
            answer: 'Meine Mutter hat sich um uns gekümmert.',
            reviewTargets: ['v-sich-kuemmern'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      freeWriting('b1u5l3-ex4', bi('Write about your childhood', 'Напиши за детството си'), [
        {
          prompt: bi(
            'Write three or four sentences about where you grew up and what you did when you had time. Use als at least once.',
            'Напиши три-четири изречения къде си израснал и какво си правил, когато си имал време. Използвай als поне веднъж.',
          ),
          answer:
            'Als ich klein war, wohnten wir in einer kleinen Stadt. Wenn ich Zeit hatte, spielte ich Fußball. Der Alltag war einfach.',
          requiredTokens: ['Als'],
          shape: 'sentence',
          hints: [
            bi(
              'Start with als and the place, then say what happened every time.',
              'Започни с als и мястото, после кажи какво се е случвало всеки път.',
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
        typeIt('b1u5l3-m1', bi('Ordering the past', 'Подредба на миналото'), [
          {
            prompt: bi(
              'After we had moved, I found a new school.',
              'След като се бяхме преместили, намерих ново училище.',
            ),
            answer: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
            hints: [],
          },
          {
            prompt: bi('The parents’ evening takes place on Tuesday.', 'Родителската среща е във вторник.'),
            answer: 'Der Elternabend findet am Dienstag statt.',
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
        'A tense for writing, three words where English has one, and a way to put two past events in order — enough to tell your own story. Next: opinions, and the last B1 unit.',
        'Време за писане, три думи там, където английският има една, и начин да подредиш две минали събития — достатъчно, за да разкажеш своята история. Следва: мнения и последният раздел на B1.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u5',
  scope: 'unit',
  targetId: 'b1-u5',
  status: 'available',
  title: bi('Unit 5 checkpoint', 'Проверка на раздел 5'),
  description: bi(
    'The written past, als against wenn, the past before the past, and the German school system.',
    'Миналото на писмения език, als срещу wenn, миналото преди миналото и немската училищна система.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u5-1', bi('Writing about before', 'Писане за преди'), [
        {
          prompt: bi('Back then we still lived in Bulgaria.', 'Тогава още живеехме в България.'),
          answer: 'Damals wohnten wir noch in Bulgarien.',
          alternatives: ['Wir wohnten damals noch in Bulgarien.'],
          hints: [],
        },
        {
          prompt: bi('In my childhood we did not have a television.', 'В детството ми нямахме телевизор.'),
          answer: 'In meiner Kindheit hatten wir keinen Fernseher.',
          alternatives: ['Wir hatten in meiner Kindheit keinen Fernseher.'],
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u5-2',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('als, wenn or wann', 'als, wenn или wann'),
        steps: [
          {
            prompt: bi('once, in the past', 'веднъж, в миналото'),
            scaffold: '___ ich zehn war, kam ich aufs Gymnasium.',
            answer: 'Als',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('every time', 'всеки път'),
            scaffold: '___ ich Zeit hatte, spielte ich Fußball.',
            answer: 'Wenn',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('a question', 'въпрос'),
            scaffold: '___ fängt die Schule an?',
            answer: 'Wann',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      typeIt('cp-b1u5-3', bi('Ordering two past events', 'Подредба на две минали събития'), [
        {
          prompt: bi(
            'After we had moved, I found a new school.',
            'След като се бяхме преместили, намерих ново училище.',
          ),
          answer: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
          hints: [],
        },
        {
          prompt: bi('After I had eaten, I did the homework.', 'След като бях ял, направих домашните.'),
          answer: 'Nachdem ich gegessen hatte, machte ich die Hausaufgaben.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u5-4', bi('School and daily life', 'Училище и ежедневие'), [
        {
          prompt: bi('Without the Abitur you cannot go to university.', 'Без матура не можеш да учиш в университет.'),
          answer: 'Ohne Abitur kann man nicht studieren.',
          hints: [],
        },
        {
          prompt: bi('The parents’ evening takes place on Tuesday.', 'Родителската среща е във вторник.'),
          answer: 'Der Elternabend findet am Dienstag statt.',
          hints: [],
        },
      ]),
    ),
    b1(
      dictation('cp-b1u5-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Damals wohnten wir noch in Bulgarien.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_5: Unit = {
  id: 'b1-u5',
  level: 'b1',
  order: 5,
  status: 'available',
  title: bi('Family, school and daily life', 'Семейство, училище и ежедневие'),
  summary: bi(
    'The Präteritum, chosen by register rather than by meaning; als, wenn and wann, where one English word becomes three; the past before the past; and a school system that decides a child’s path at ten.',
    'Präteritum, избиран по регистър, а не по значение; als, wenn и wann, където една английска дума става три; миналото преди миналото; и училищна система, която решава пътя на детето на десет.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U5_PATTERNS = PATTERNS;
