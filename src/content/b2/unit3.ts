import { bi, dictation, fillBlank, freeWriting, typeIt, wordOrder } from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B2 Unit 3 — Media and society.
 *
 * The first unit whose language the learner will mostly *read*. That is a
 * deliberate change of purpose: a B1 learner can hold a conversation and still
 * bounce off the front page of a newspaper, because written German packs a
 * paragraph in ways spoken German never does.
 *
 * **Lesson 1 is the extended participial attribute** — *die von der Regierung
 * geplante Reform* — a whole clause sitting between an article and its noun.
 * Bulgarian has the advantage here, and plainly: „планираната от
 * правителството реформа“ is the same structure in the same order, so that
 * path learns one thing (German puts a separate article at the front of the
 * block) and can then use it in writing. English cannot build this at all, so
 * the English path is given a *reading* strategy instead — find the article,
 * jump to the noun at the end, then read the middle — and told it may keep
 * using relative clauses when it writes.
 *
 * **Lesson 2 is the grammar of a number**: um for the size of a change, auf
 * for the level it reaches, and the counting phrases that take a singular verb
 * (die Zahl der Anträge **ist** gesunken). Small, unforgiving, and the
 * difference between a rent rising by ten percent and rising to ten.
 *
 * **Lesson 3 is the three passive substitutes** — sein + zu + Infinitiv, sich
 * lassen, and the -bar adjective. Each path already owns exactly one of them
 * (-bar is -able and „-им“), which makes the other two easier to place: the
 * lesson names what transfers before it teaches what does not.
 */

/** Everything in this file is B2. */
const b2 = (ex: Exercise): Exercise => ({ ...ex, level: 'b2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-partizip-attribut',
    template: 'die von ___ geplante ___',
    example: 'die von der Regierung geplante Reform',
    gloss: bi('the reform planned by the government', 'планираната от правителството реформа'),
    level: 'b2',
    grammarIds: ['g-partizipialattribut'],
  },
  {
    id: 'p-statistik-um',
    template: '___ ist um ___ Prozent gestiegen.',
    example: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
    gloss: bi('The number of applications has fallen by twelve percent.', 'Броят на заявленията е намалял с дванайсет процента.'),
    level: 'b2',
    grammarIds: ['g-statistik'],
  },
  {
    id: 'p-laesst-sich',
    template: 'Das lässt sich ___.',
    example: 'Das lässt sich machen.',
    gloss: bi('That can be done.', 'Това може да се направи.'),
    level: 'b2',
    grammarIds: ['g-passiv-ersatz'],
  },
  {
    id: 'p-ist-zu-inf',
    template: 'Das ist nicht zu ___.',
    example: 'Das ist nicht zu ändern.',
    gloss: bi('That cannot be changed.', 'Това не може да се промени.'),
    level: 'b2',
    grammarIds: ['g-passiv-ersatz'],
  },
];

/* ================================================================== *
 * Lesson 1 — reading the front page
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b2-u3-l1',
  unitId: 'b2-u3',
  level: 'b2',
  order: 1,
  status: 'available',
  estimatedMinutes: 32,
  title: bi('The reform planned by the government', 'Планираната от правителството реформа'),
  objective: bi(
    'After this lesson you can read a German news sentence that puts a whole clause in front of its noun, and take it apart at speed.',
    'След този урок можеш да четеш немско новинарско изречение, което слага цяло изречение пред съществителното, и да го разглобяваш бързо.',
  ),
  outcomes: [
    bi('I can find the noun a long block belongs to.', 'Мога да намеря съществителното, към което се отнася дълъг блок.'),
    bi('I can tell Partizip I from Partizip II in an attribute.', 'Различавам Partizip I от Partizip II в определение.'),
    bi('I can turn a relative clause into a participial attribute and back.', 'Мога да превърна относително изречение в причастно определение и обратно.'),
    bi('I know this is written German and not how people speak.', 'Знам, че това е писмен немски, а не начинът, по който се говори.'),
  ],
  vocabIds: [
    'v-die-schlagzeile',
    'v-die-regierung',
    'v-die-reform',
    'v-die-massnahme',
    'v-umstritten',
    'v-veroeffentlichen',
    'v-die-quelle',
  ],
  grammarIds: ['g-partizipialattribut'],
  sections: [
    {
      id: 'b2u3l1-intro',
      kind: 'intro',
      title: bi('A sentence that makes you wait', 'Изречение, което те кара да чакаш'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You can already read the long version of this sentence. The short one is the problem.',
            'Дългата версия на това изречение вече можеш да я четеш. Проблемът е късата.',
          ),
        },
        {
          t: 'contrast',
          de: 'die Reform, die von der Regierung geplant wurde',
          other: bi(
            'A relative clause. Everything you learnt at B1 — and longer than a newspaper wants.',
            'Относително изречение. Всичко, което научи в B1 — и по-дълго, отколкото вестникът иска.',
          ),
        },
        {
          t: 'de',
          de: 'die von der Regierung geplante Reform',
          gloss: bi('the reform planned by the government', 'планираната от правителството реформа'),
          audio: true,
        },
        {
          t: 'p',
          only: ['en'],
          text: bi(
            'The article arrives, and then the noun does not. Four more words go past before you find out what "die" was pointing at. English cannot do this at all, which is why it has to be read rather than translated.',
            '',
          ),
        },
        {
          t: 'p',
          only: ['bg'],
          text: bi(
            '',
            'Това е същата структура, която българският прави с „планираната от правителството реформа“. Не учиш нова конструкция — учиш къде немският слага члена.',
          ),
        },
      ],
    },
    {
      id: 'b2u3l1-vocab',
      kind: 'vocabulary',
      title: bi('What a news paragraph is made of', 'От какво е направен новинарският абзац'),
      vocabIds: [
        'v-die-schlagzeile',
        'v-die-regierung',
        'v-die-reform',
        'v-die-massnahme',
        'v-umstritten',
        'v-veroeffentlichen',
        'v-die-quelle',
      ],
      blocks: [],
    },
    {
      id: 'b2u3l1-grammar',
      kind: 'grammar',
      title: bi('Article, block, noun', 'Член, блок, съществително'),
      blocks: [],
      grammarId: 'g-partizipialattribut',
    },
    {
      id: 'b2u3l1-examples',
      kind: 'examples',
      title: bi('Four real shapes', 'Четири реални форми'),
      blocks: [
        {
          t: 'de',
          de: 'Die gestern veröffentlichte Studie zeigt ein anderes Bild.',
          gloss: bi(
            'The study published yesterday shows a different picture.',
            'Публикуваното вчера изследване показва друга картина.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die von der Regierung geplanten Maßnahmen sind umstritten.',
          gloss: bi(
            'The measures planned by the government are contested.',
            'Планираните от правителството мерки са спорни.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die steigenden Mieten sind das Hauptthema der Woche.',
          gloss: bi(
            'Rising rents are the main topic of the week.',
            'Покачващите се наеми са основната тема на седмицата.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Zeitung nennt keine Quelle für die genannten Zahlen.',
          gloss: bi(
            'The newspaper gives no source for the figures mentioned.',
            'Вестникът не посочва източник за споменатите числа.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u3l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('The article belongs to the noun at the end, not to the next word.', 'Членът принадлежи на съществителното накрая, а не на следващата дума.'),
            bi('Partizip II is passive: die geplante Reform.', 'Partizip II е страдателно: die geplante Reform.'),
            bi('Partizip I is active: die steigenden Mieten. Infinitive + d + ending.', 'Partizip I е деятелно: die steigenden Mieten. Инфинитив + d + окончание.'),
            bi('It is written German. In speech, use a relative clause.', 'Това е писмен немски. В говора използвай относително изречение.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u3l1-ex1', bi('Which noun does the article belong to?', 'На кое съществително принадлежи членът?'), [
        {
          prompt: bi('die von der Regierung geplante ___', 'die von der Regierung geplante ___'),
          scaffold: 'Die von der Regierung geplante ___ ist umstritten.',
          answer: 'Reform',
          shape: 'word',
          hints: [bi('The noun is the last word of the block.', 'Съществителното е последната дума на блока.')],
        },
        {
          prompt: bi('planen — passive participle, plural noun', 'planen — страдателно причастие, съществително в мн. ч.'),
          scaffold: 'Die von der Regierung ___ Maßnahmen sind umstritten.',
          answer: 'geplanten',
          shape: 'word',
          hints: [bi('Partizip II plus a plural adjective ending.', 'Partizip II плюс окончание за множествено число.')],
        },
        {
          prompt: bi('steigen — active participle', 'steigen — деятелно причастие'),
          scaffold: 'Die ___ Mieten sind das Hauptthema.',
          answer: 'steigenden',
          shape: 'word',
          hints: [bi('Infinitive + d + ending. The rents do the rising.', 'Инфинитив + d + окончание. Наемите сами се покачват.')],
        },
        {
          prompt: bi('veröffentlichen — published yesterday', 'veröffentlichen — публикувано вчера'),
          scaffold: 'Die gestern ___ Studie zeigt etwas anderes.',
          answer: 'veröffentlichte',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u3l1-ex2',
        bi('Unpack it into a relative clause', 'Разгъни го в относително изречение'),
        [
          {
            prompt: bi(
              'Say "the reform planned by the government" as a relative clause instead.',
              'Кажи „планираната от правителството реформа“ като относително изречение.',
            ),
            answer: 'die Reform, die von der Regierung geplant wurde',
            alternatives: ['die Reform, die von der Regierung geplant worden ist'],
            reviewTargets: ['v-die-reform', 'v-die-regierung'],
            hints: [bi('Relative pronoun, then a passive.', 'Относително местоимение, после страдателен залог.')],
          },
          {
            prompt: bi(
              'Say "the study published yesterday" as a relative clause.',
              'Кажи „публикуваното вчера изследване“ като относително изречение.',
            ),
            answer: 'die Studie, die gestern veröffentlicht wurde',
            reviewTargets: ['v-die-studie', 'v-veroeffentlichen'],
            hints: [],
          },
        ],
        ['g-partizipialattribut'],
      ),
    ),
    b2(
      wordOrder('b2u3l1-ex3', bi('Build the block', 'Построй блока'), [
        {
          prompt: bi('The measures planned by the government are contested.', 'Планираните от правителството мерки са спорни.'),
          bank: ['Die', 'von', 'der', 'Regierung', 'geplanten', 'Maßnahmen', 'sind', 'umstritten.'],
          answer: 'Die von der Regierung geplanten Maßnahmen sind umstritten.',
          hints: [bi('Article first, noun at the end of the block.', 'Първо членът, съществителното — в края на блока.')],
        },
        {
          prompt: bi('The study published yesterday shows a different picture.', 'Публикуваното вчера изследване показва друга картина.'),
          bank: ['Die', 'gestern', 'veröffentlichte', 'Studie', 'zeigt', 'ein', 'anderes', 'Bild.'],
          answer: 'Die gestern veröffentlichte Studie zeigt ein anderes Bild.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u3l1-ex4',
        bi('Write the news version', 'Напиши новинарската версия'),
        [
          {
            prompt: bi('The reform planned by the government is contested.', 'Планираната от правителството реформа е спорна.'),
            answer: 'Die von der Regierung geplante Reform ist umstritten.',
            reviewTargets: ['p-partizip-attribut', 'v-umstritten'],
            hints: [],
            traps: [
              {
                answer: 'Die Reform von der Regierung geplante ist umstritten.',
                category: 'word-order',
                feedback: bi(
                  'The whole block sits between the article and the noun: Die von der Regierung geplante Reform. The noun comes last.',
                  'Целият блок стои между члена и съществителното: Die von der Regierung geplante Reform. Съществителното е последно.',
                ),
              },
            ],
          },
          {
            prompt: bi('Rising rents are the main topic of the week.', 'Покачващите се наеми са основната тема на седмицата.'),
            answer: 'Die steigenden Mieten sind das Hauptthema der Woche.',
            alternatives: ['Steigende Mieten sind das Hauptthema der Woche.'],
            reviewTargets: ['v-steigen', 'v-die-miete'],
            hints: [],
          },
          {
            prompt: bi('The newspaper gives no source.', 'Вестникът не посочва източник.'),
            answer: 'Die Zeitung nennt keine Quelle.',
            reviewTargets: ['v-die-quelle'],
            hints: [],
          },
          {
            prompt: bi('The study was published yesterday.', 'Изследването беше публикувано вчера.'),
            answer: 'Die Studie wurde gestern veröffentlicht.',
            reviewTargets: ['v-veroeffentlichen', 'p-passiv-praeteritum'],
            hints: [],
          },
        ],
        ['g-partizipialattribut'],
      ),
    ),
    b2(
      dictation('b2u3l1-ex5', bi('Hearing a long block', 'Да чуеш дълъг блок'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die von der Regierung geplante Reform ist umstritten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die gestern veröffentlichte Studie zeigt ein anderes Bild.',
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
        typeIt('b2u3l1-m1', bi('News German', 'Новинарски немски'), [
          {
            prompt: bi('The reform planned by the government is contested.', 'Планираната от правителството реформа е спорна.'),
            answer: 'Die von der Regierung geplante Reform ist umstritten.',
            hints: [],
          },
          {
            prompt: bi('The study published yesterday shows a different picture.', 'Публикуваното вчера изследване показва друга картина.'),
            answer: 'Die gestern veröffentlichte Studie zeigt ein anderes Bild.',
            hints: [],
          },
        ]),
      ),
      b2(
        fillBlank('b2u3l1-m2', bi('Which participle?', 'Кое причастие?'), [
          {
            prompt: bi('planen — the measures are planned', 'planen — мерките се планират'),
            scaffold: 'die von der Regierung ___ Maßnahmen',
            answer: 'geplanten',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('steigen — the rents rise', 'steigen — наемите се покачват'),
            scaffold: 'die ___ Mieten',
            answer: 'steigenden',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — the grammar of a number
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b2-u3-l2',
  unitId: 'b2-u3',
  level: 'b2',
  order: 2,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('Up by ten percent, or up to ten', 'С десет процента или до десет'),
  objective: bi(
    'After this lesson you can read and write a German statistic without reversing what it says.',
    'След този урок можеш да четеш и пишеш немска статистика, без да обръщаш смисъла ѝ.',
  ),
  outcomes: [
    bi('I use um for the size of a change and auf for the level.', 'Използвам um за размера на промяната и auf за нивото.'),
    bi('I can say what a figure amounts to with betragen.', 'Мога да кажа на колко възлиза дадено число с betragen.'),
    bi('I keep Prozent and Prozentpunkt apart.', 'Разграничавам Prozent и Prozentpunkt.'),
    bi('I use a singular verb after die Zahl der …', 'Използвам глагол в единствено число след die Zahl der …'),
  ],
  vocabIds: [
    'v-steigen',
    'v-sinken',
    'v-betragen',
    'v-der-anteil',
    'v-durchschnittlich',
    'v-die-studie',
    'v-die-umfrage',
  ],
  grammarIds: ['g-statistik'],
  sections: [
    {
      id: 'b2u3l2-intro',
      kind: 'intro',
      title: bi('Two prepositions, opposite facts', 'Два предлога, противоположни факти'),
      blocks: [
        {
          t: 'contrast',
          de: 'Die Miete ist um 100 Euro gestiegen.',
          other: bi('It went up by a hundred.', 'Покачи се със сто.'),
        },
        {
          t: 'contrast',
          de: 'Die Miete ist auf 100 Euro gestiegen.',
          other: bi('It reached a hundred. Quite different news.', 'Стигна до сто. Съвсем друга новина.'),
        },
        {
          t: 'p',
          text: bi(
            'One preposition apart, and the second sentence would be a bargain. This lesson is short because the rule is small — and worth a lesson because getting it wrong reverses the fact.',
            'Разликата е един предлог, а второто изречение би било изгодна оферта. Урокът е кратък, защото правилото е малко — и си струва цял урок, защото грешката обръща факта.',
          ),
        },
      ],
    },
    {
      id: 'b2u3l2-vocab',
      kind: 'vocabulary',
      title: bi('Rising, falling, amounting to', 'Покачване, спадане, възлизане'),
      vocabIds: [
        'v-steigen',
        'v-sinken',
        'v-betragen',
        'v-der-anteil',
        'v-durchschnittlich',
        'v-die-studie',
        'v-die-umfrage',
      ],
      blocks: [],
    },
    {
      id: 'b2u3l2-grammar',
      kind: 'grammar',
      title: bi('um, auf, and the counting phrases', 'um, auf и изразите за броене'),
      blocks: [],
      grammarId: 'g-statistik',
    },
    {
      id: 'b2u3l2-examples',
      kind: 'examples',
      title: bi('A paragraph of figures', 'Абзац с числа'),
      blocks: [
        {
          t: 'de',
          de: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
          gloss: bi(
            'The number of applications has fallen by twelve percent.',
            'Броят на заявленията е намалял с дванайсет процента.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Miete beträgt durchschnittlich 900 Euro.',
          gloss: bi('The rent is on average 900 euros.', 'Наемът възлиза средно на 900 евро.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Laut einer Umfrage arbeitet jeder dritte Beschäftigte im Homeoffice.',
          gloss: bi(
            'According to a survey, one in three employees works from home.',
            'Според анкета всеки трети служител работи от вкъщи.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Anteil der Frauen in der Firma ist gestiegen.',
          gloss: bi('The proportion of women in the company has risen.', 'Делът на жените във фирмата се е повишил.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u3l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('um = by how much. auf = to what level.', 'um = с колко. auf = до какво ниво.'),
            bi('steigen and sinken take sein: ist gestiegen, ist gesunken.', 'steigen и sinken вървят със sein: ist gestiegen, ist gesunken.'),
            bi('betragen states a figure flatly: Der Anteil beträgt 30 %.', 'betragen съобщава число без оценка: Der Anteil beträgt 30 %.'),
            bi('die Zahl der + genitive plural, and a singular verb.', 'die Zahl der + родителен падеж, мн. ч., и глагол в единствено число.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u3l2-ex1', bi('um or auf?', 'um или auf?'), [
        {
          prompt: bi('it went up by ten percent', 'покачи се с десет процента'),
          scaffold: 'Die Mieten sind ___ zehn Prozent gestiegen.',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('it reached 900 euros', 'стигна до 900 евро'),
          scaffold: 'Die Miete ist ___ 900 Euro gestiegen.',
          answer: 'auf',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('it fell by twelve percent', 'намаля с дванайсет процента'),
          scaffold: 'Die Zahl der Anträge ist ___ zwölf Prozent gesunken.',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      fillBlank('b2u3l2-ex2', bi('The verb after a counting phrase', 'Глаголът след израз за броене'), [
        {
          prompt: bi('die Zahl der Anträge — singular or plural verb?', 'die Zahl der Anträge — глагол в ед. или мн. ч.?'),
          scaffold: 'Die Zahl der Anträge ___ gesunken.',
          answer: 'ist',
          shape: 'word',
          hints: [bi('The subject is die Zahl, not die Anträge.', 'Подлогът е die Zahl, а не die Anträge.')],
          traps: [
            {
              answer: 'sind',
              category: 'verb-conjugation',
              feedback: bi(
                'The subject is die Zahl — singular — even though the genitive behind it is plural: Die Zahl der Anträge ist gesunken.',
                'Подлогът е die Zahl — единствено число — макар родителният падеж след него да е множествено: Die Zahl der Anträge ist gesunken.',
              ),
            },
          ],
        },
        {
          prompt: bi('jeder dritte Beschäftigte — one in three', 'jeder dritte Beschäftigte — всеки трети'),
          scaffold: 'Jeder dritte Beschäftigte ___ im Homeoffice.',
          answer: 'arbeitet',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u3l2-ex3',
        bi('Write the figures', 'Напиши числата'),
        [
          {
            prompt: bi('The number of applications has fallen by twelve percent.', 'Броят на заявленията е намалял с дванайсет процента.'),
            answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
            // The lesson's own table writes figures as digits and %, so those are right
            // too; only the spoken form is the one being taught.
            alternatives: [
              'Die Zahl der Anträge ist um 12 Prozent gesunken.',
              'Die Zahl der Anträge ist um 12 % gesunken.',
              'Die Zahl der Anträge ist um 12% gesunken.',
            ],
            reviewTargets: ['p-statistik-um', 'v-sinken'],
            hints: [],
            traps: [
              {
                answer: 'Die Zahl der Anträge hat um zwölf Prozent gesunken.',
                category: 'auxiliary-verb',
                feedback: bi(
                  'sinken is a change of state, so it takes sein: ist gesunken.',
                  'sinken е промяна на състоянието, затова върви със sein: ist gesunken.',
                ),
              },
            ],
          },
          {
            prompt: bi('Rents have risen by ten percent.', 'Наемите са се покачили с десет процента.'),
            answer: 'Die Mieten sind um zehn Prozent gestiegen.',
            alternatives: [
              'Die Mieten sind um 10 Prozent gestiegen.',
              'Die Mieten sind um 10 % gestiegen.',
              'Die Mieten sind um 10% gestiegen.',
            ],
            reviewTargets: ['v-steigen'],
            hints: [],
          },
          {
            prompt: bi('The rent is on average 900 euros.', 'Наемът възлиза средно на 900 евро.'),
            answer: 'Die Miete beträgt durchschnittlich 900 Euro.',
            alternatives: ['Die Miete beträgt durchschnittlich neunhundert Euro.'],
            reviewTargets: ['v-betragen', 'v-durchschnittlich'],
            hints: [],
          },
          {
            prompt: bi('The share amounts to just under thirty percent.', 'Делът възлиза на близо трийсет процента.'),
            answer: 'Der Anteil beträgt knapp dreißig Prozent.',
            alternatives: [
              'Der Anteil beträgt knapp 30 Prozent.',
              'Der Anteil beträgt knapp 30 %.',
              'Der Anteil beträgt knapp 30%.',
            ],
            reviewTargets: ['v-der-anteil'],
            hints: [],
          },
          {
            prompt: bi('According to a study, many prefer to work from home.', 'Според едно проучване мнозина предпочитат да работят от вкъщи.'),
            answer: 'Laut einer Studie arbeiten viele lieber im Homeoffice.',
            reviewTargets: ['v-die-studie', 'v-laut', 'v-das-homeoffice'],
            hints: [bi('Laut + phrase is in first position, so the verb is second.', 'Laut + израз е на първа позиция, затова глаголът е втори.')],
          },
        ],
        ['g-statistik'],
      ),
    ),
    b2(
      dictation('b2u3l2-ex4', bi('Numbers by ear', 'Числа на слух'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
          // A number heard can be written either way; nothing in the audio says which.
          alternatives: [
            'Die Zahl der Anträge ist um 12 Prozent gesunken.',
            'Die Zahl der Anträge ist um 12 % gesunken.',
            'Die Zahl der Anträge ist um 12% gesunken.',
          ],
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Miete beträgt durchschnittlich 900 Euro.',
          alternatives: ['Die Miete beträgt durchschnittlich neunhundert Euro.'],
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
        typeIt('b2u3l2-m1', bi('Two figures, right way round', 'Две числа, в правилната посока'), [
          {
            prompt: bi('Rents have risen by ten percent.', 'Наемите са се покачили с десет процента.'),
            answer: 'Die Mieten sind um zehn Prozent gestiegen.',
            alternatives: [
              'Die Mieten sind um 10 Prozent gestiegen.',
              'Die Mieten sind um 10 % gestiegen.',
              'Die Mieten sind um 10% gestiegen.',
            ],
            hints: [],
          },
          {
            prompt: bi('The number of applications has fallen by twelve percent.', 'Броят на заявленията е намалял с дванайсет процента.'),
            answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
            alternatives: [
              'Die Zahl der Anträge ist um 12 Prozent gesunken.',
              'Die Zahl der Anträge ist um 12 % gesunken.',
              'Die Zahl der Anträge ist um 12% gesunken.',
            ],
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — can be done, three ways
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b2-u3-l3',
  unitId: 'b2-u3',
  level: 'b2',
  order: 3,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('That can be done', 'Това може да се направи'),
  objective: bi(
    'After this lesson you can say that something can (or cannot) be done in the three ways German prefers to the passive.',
    'След този урок можеш да кажеш, че нещо може (или не може) да се направи, по трите начина, които немският предпочита пред страдателния залог.',
  ),
  outcomes: [
    bi('I can use sein + zu + infinitive.', 'Мога да използвам sein + zu + инфинитив.'),
    bi('I can use sich lassen for what is possible.', 'Мога да използвам sich lassen за това, което е възможно.'),
    bi('I can build and read -bar adjectives.', 'Мога да образувам и разчитам прилагателни на -bar.'),
    bi('I can describe the effects of a measure.', 'Мога да опиша въздействието на дадена мярка.'),
  ],
  vocabIds: [
    'v-die-auswirkung',
    'v-die-folge',
    'v-zunehmen',
    'v-die-oeffentlichkeit',
    'v-die-kritik',
    'v-machbar',
  ],
  grammarIds: ['g-passiv-ersatz'],
  sections: [
    {
      id: 'b2u3l3-intro',
      kind: 'intro',
      title: bi('One idea, three shapes', 'Една идея, три форми'),
      blocks: [
        {
          t: 'de',
          de: 'Das kann nicht geändert werden.',
          gloss: bi('That cannot be changed. (the long way)', 'Това не може да бъде променено. (дългият начин)'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Correct, and German has three shorter ways of saying it. A newspaper will use all three on the same page.',
            'Правилно е, но немският има три по-къси начина да го каже. Вестникът ще използва и трите на една и съща страница.',
          ),
        },
        {
          t: 'de',
          de: 'Das ist nicht zu ändern. — Das lässt sich nicht ändern. — Das ist nicht änderbar.',
          gloss: bi(
            'Three ways to say the same thing.',
            'Три начина да се каже едно и също.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u3l3-vocab',
      kind: 'vocabulary',
      title: bi('Effects and criticism', 'Въздействие и критика'),
      vocabIds: [
        'v-die-auswirkung',
        'v-die-folge',
        'v-zunehmen',
        'v-die-oeffentlichkeit',
        'v-die-kritik',
        'v-machbar',
      ],
      blocks: [],
    },
    {
      id: 'b2u3l3-grammar',
      kind: 'grammar',
      title: bi('sein + zu, sich lassen, -bar', 'sein + zu, sich lassen, -bar'),
      blocks: [],
      grammarId: 'g-passiv-ersatz',
    },
    {
      id: 'b2u3l3-examples',
      kind: 'examples',
      title: bi('In a news paragraph', 'В новинарски абзац'),
      blocks: [
        {
          t: 'de',
          de: 'Die Folgen sind noch nicht absehbar.',
          gloss: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Über den Zeitplan lässt sich reden.',
          gloss: bi('The schedule is open to discussion.', 'За графика може да се говори.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Kritik an der Reform nimmt zu.',
          gloss: bi('Criticism of the reform is increasing.', 'Критиката към реформата се засилва.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Reform hat Auswirkungen auf alle Mieter.',
          gloss: bi('The reform has effects on all tenants.', 'Реформата има въздействие върху всички наематели.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u3l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('sein + zu + infinitive: formal, often with a hint of obligation.', 'sein + zu + инфинитив: официално, често с оттенък на задължение.'),
            bi('sich lassen: the everyday one. Das lässt sich machen.', 'sich lassen: всекидневната форма. Das lässt sich machen.'),
            bi('-bar turns it into an adjective: machbar, absehbar, bezahlbar.', '-bar го превръща в прилагателно: machbar, absehbar, bezahlbar.'),
            bi('All three replace können + Passiv, which stays correct.', 'И трите заместват können + страдателен залог, който си остава правилен.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u3l3-ex1', bi('Complete the substitute', 'Допълни заместителя'), [
        {
          prompt: bi('sein + zu — that cannot be changed', 'sein + zu — това не може да се промени'),
          scaffold: 'Das ist nicht ___ ändern.',
          answer: 'zu',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('sich lassen — that can be done', 'sich lassen — това може да се направи'),
          scaffold: 'Das ___ sich machen.',
          answer: 'lässt',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('machen → the adjective', 'machen → прилагателното'),
          scaffold: 'Der Zeitplan ist ___.',
          answer: 'machbar',
          shape: 'word',
          hints: [bi('Stem plus -bar.', 'Основа плюс -bar.')],
        },
        {
          prompt: bi('absehen → not yet foreseeable', 'absehen → още не може да се предвиди'),
          scaffold: 'Die Folgen sind noch nicht ___.',
          answer: 'absehbar',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u3l3-ex2',
        bi('Say it the short way', 'Кажи го по краткия начин'),
        [
          {
            prompt: bi('That can be done. (sich lassen)', 'Това може да се направи. (sich lassen)'),
            answer: 'Das lässt sich machen.',
            reviewTargets: ['p-laesst-sich'],
            hints: [],
            traps: [
              {
                answer: 'Das wird sich machen.',
                category: 'auxiliary-verb',
                feedback: bi(
                  'The frame is lassen, not werden: Das lässt sich machen.',
                  'Рамката е с lassen, а не с werden: Das lässt sich machen.',
                ),
              },
            ],
          },
          {
            prompt: bi('That cannot be changed. (sein + zu)', 'Това не може да се промени. (sein + zu)'),
            answer: 'Das ist nicht zu ändern.',
            reviewTargets: ['p-ist-zu-inf'],
            hints: [],
          },
          {
            prompt: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
            answer: 'Die Folgen sind noch nicht absehbar.',
            reviewTargets: ['v-die-folge'],
            hints: [],
          },
          {
            prompt: bi('The schedule is open to discussion.', 'За графика може да се говори.'),
            answer: 'Über den Zeitplan lässt sich reden.',
            reviewTargets: ['v-der-zeitplan'],
            hints: [],
          },
        ],
        ['g-passiv-ersatz'],
      ),
    ),
    b2(
      typeIt(
        'b2u3l3-ex3',
        bi('Effects, criticism, the public', 'Въздействие, критика, общественост'),
        [
          {
            prompt: bi('The reform has effects on all tenants.', 'Реформата има въздействие върху всички наематели.'),
            answer: 'Die Reform hat Auswirkungen auf alle Mieter.',
            reviewTargets: ['v-die-auswirkung', 'v-die-reform'],
            hints: [],
          },
          {
            prompt: bi('Criticism of the reform is increasing.', 'Критиката към реформата се засилва.'),
            answer: 'Die Kritik an der Reform nimmt zu.',
            reviewTargets: ['v-die-kritik', 'v-zunehmen'],
            hints: [bi('zunehmen splits.', 'zunehmen се разделя.')],
          },
          {
            prompt: bi('It is much discussed in public.', 'В обществото се дискутира много по този въпрос.'),
            answer: 'In der Öffentlichkeit wird darüber viel diskutiert.',
            reviewTargets: ['v-die-oeffentlichkeit'],
            hints: [],
          },
        ],
        ['g-passiv-ersatz'],
      ),
    ),
    b2(
      freeWriting('b2u3l3-ex4', bi('Three lines about a measure', 'Три реда за една мярка'), [
        {
          prompt: bi(
            'Write three sentences about a reform in the news: what was decided, what its effects are, and whether it is feasible. Use Auswirkungen and one -bar adjective.',
            'Напиши три изречения за реформа от новините: какво е решено, какви са последиците и дали е осъществима. Използвай Auswirkungen и едно прилагателно на -bar.',
          ),
          answer:
            'Die Reform wurde im Dezember beschlossen. Sie hat Auswirkungen auf alle Mieter. Ob der Zeitplan machbar ist, ist noch offen.',
          // "one -bar adjective", not only machbar.
          requiredTokens: [
            'Auswirkungen',
            'machbar|absehbar|umsetzbar|bezahlbar|finanzierbar|vorhersehbar|durchführbar|realisierbar|erreichbar|vertretbar|lösbar|denkbar|brauchbar',
          ],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('b2u3l3-ex5', bi('Listening to a news line', 'Слушане на новинарски ред'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Folgen sind noch nicht absehbar.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Über den Zeitplan lässt sich reden.',
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
        typeIt('b2u3l3-m1', bi('All three substitutes', 'И трите заместителя'), [
          {
            prompt: bi('That can be done. (sich lassen)', 'Това може да се направи. (sich lassen)'),
            answer: 'Das lässt sich machen.',
            hints: [],
          },
          {
            prompt: bi('That cannot be changed. (sein + zu)', 'Това не може да се промени. (sein + zu)'),
            answer: 'Das ist nicht zu ändern.',
            hints: [],
          },
          {
            prompt: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
            answer: 'Die Folgen sind noch nicht absehbar.',
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
  id: 'cp-b2u3',
  scope: 'unit',
  targetId: 'b2-u3',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Checkpoint: media and society', 'Проверка: медии и общество'),
  description: bi(
    'Participial attributes, the prepositions a statistic needs, and the three ways of saying something can be done.',
    'Причастни определения, предлозите, които иска статистиката, и трите начина да се каже, че нещо може да се направи.',
  ),
  exercises: [
    b2(
      fillBlank('cp-b2u3-1', bi('The participle', 'Причастието'), [
        {
          prompt: bi('planen — passive, singular', 'planen — страдателно, ед. ч.'),
          scaffold: 'die von der Regierung ___ Reform',
          answer: 'geplante',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('steigen — active, plural', 'steigen — деятелно, мн. ч.'),
          scaffold: 'die ___ Mieten',
          answer: 'steigenden',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('veröffentlichen — published yesterday', 'veröffentlichen — публикувано вчера'),
          scaffold: 'die gestern ___ Studie',
          answer: 'veröffentlichte',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      fillBlank('cp-b2u3-2', bi('um, auf, and the verb', 'um, auf и глаголът'), [
        {
          prompt: bi('by ten percent', 'с десет процента'),
          scaffold: 'Die Mieten sind ___ zehn Prozent gestiegen.',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('to 900 euros', 'до 900 евро'),
          scaffold: 'Die Miete ist ___ 900 Euro gestiegen.',
          answer: 'auf',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('die Zahl der Anträge …', 'die Zahl der Anträge …'),
          scaffold: 'Die Zahl der Anträge ___ gesunken.',
          answer: 'ist',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u3-3', bi('Read it, write it', 'Прочети го, напиши го'), [
        {
          prompt: bi('The reform planned by the government is contested.', 'Планираната от правителството реформа е спорна.'),
          answer: 'Die von der Regierung geplante Reform ist umstritten.',
          hints: [],
        },
        {
          prompt: bi('The number of applications has fallen by twelve percent.', 'Броят на заявленията е намалял с дванайсет процента.'),
          answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
          alternatives: [
            'Die Zahl der Anträge ist um 12 Prozent gesunken.',
            'Die Zahl der Anträge ist um 12 % gesunken.',
            'Die Zahl der Anträge ist um 12% gesunken.',
          ],
          hints: [],
        },
        {
          prompt: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
          answer: 'Die Folgen sind noch nicht absehbar.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u3-4', bi('The short ways', 'Кратките начини'), [
        {
          prompt: bi('That can be done. (sich lassen)', 'Това може да се направи. (sich lassen)'),
          answer: 'Das lässt sich machen.',
          hints: [],
        },
        {
          prompt: bi('That cannot be changed. (sein + zu)', 'Това не може да се промени. (sein + zu)'),
          answer: 'Das ist nicht zu ändern.',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('cp-b2u3-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die von der Regierung geplante Reform ist umstritten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
          alternatives: [
            'Die Zahl der Anträge ist um 12 Prozent gesunken.',
            'Die Zahl der Anträge ist um 12 % gesunken.',
            'Die Zahl der Anträge ist um 12% gesunken.',
          ],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B2_UNIT_3: Unit = {
  id: 'b2-u3',
  level: 'b2',
  order: 3,
  status: 'available',
  title: bi('Media and society', 'Медии и общество'),
  summary: bi(
    'Reading German rather than speaking it: the clause that sits in front of a noun — which Bulgarian already builds and English has to learn to read backwards — the two prepositions a statistic turns on, and the three ways German says something can be done.',
    'Четене на немски, а не говорене: изречението, което стои пред съществителното — българският вече го строи, а английският трябва да се научи да го чете отзад напред — двата предлога, от които зависи статистиката, и трите начина, по които немският казва, че нещо може да се направи.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B2_U3_PATTERNS = PATTERNS;
