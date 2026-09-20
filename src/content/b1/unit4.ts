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
 * B1 Unit 4 — Work and applications.
 *
 * The unit built around one document. A German *Bewerbung* is a fixed genre —
 * a *Lebenslauf*, an *Anschreiben*, certificates — and by the end of these
 * three lessons a learner can write the letter, because the grammar was chosen
 * to serve it rather than the other way round.
 *
 * **The genitive** (lesson 1) is taught honestly, which means admitting that
 * spoken German is abandoning it. *Das Auto von meinem Bruder* is what people
 * say; *das Auto meines Bruders* is what people write. Teaching it as
 * obligatory would be teaching a register the learner rarely hears; skipping
 * it would leave them unable to read a contract. So it is presented as the
 * written register, required in exactly the documents this unit is about — and
 * the Bulgarian path is told plainly that its instinctive *von* is not an
 * error, merely the wrong register.
 *
 * **Connectors** (lesson 2) are where B1 word order finally has to be
 * systematic. German sorts them by what they do to the verb rather than by
 * meaning, so *obwohl* and *trotzdem* — nearly synonymous — end up in
 * different families. Neither starting language makes this split: English
 * blurs it, Bulgarian does not have it at all, and the trap is the same
 * sentence in both paths.
 *
 * **Verbs with fixed prepositions** (lesson 3) are the rare topic that is
 * equally hard for everyone, and the course says so rather than manufacturing
 * an asymmetry. *sich bewerben um* is not *für* however you get there: "apply
 * for" and „кандидатствам за“ both point the wrong way, and German went a
 * third direction.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-genitiv-des',
    template: 'der ___ des ___s',
    example: 'der Lebenslauf des Bewerbers',
    gloss: bi('the applicant’s CV', 'автобиографията на кандидата'),
    level: 'b1',
    grammarIds: ['g-genitiv'],
  },
  {
    id: 'p-obwohl',
    template: 'Obwohl ich ___ habe, ___ ich ___.',
    example: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
    gloss: bi('Although I have ___, I ___.', 'Въпреки че имам ___, аз ___.'),
    level: 'b1',
    grammarIds: ['g-konnektoren'],
  },
  {
    id: 'p-trotzdem',
    template: 'Trotzdem ___ ich ___.',
    example: 'Trotzdem lerne ich schnell.',
    gloss: bi('All the same, I ___.', 'Въпреки това аз ___.'),
    level: 'b1',
    grammarIds: ['g-konnektoren'],
  },
  {
    id: 'p-bewerben-um',
    template: 'Ich bewerbe mich um ___.',
    example: 'Ich bewerbe mich um die Stelle.',
    gloss: bi('I am applying for ___.', 'Кандидатствам за ___.'),
    level: 'b1',
    grammarIds: ['g-verb-praeposition'],
  },
];

/* ================================================================== *
 * Lesson 1 — the advert, and the case that written German uses
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u4-l1',
  unitId: 'b1-u4',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The applicant’s CV: the genitive', 'Автобиографията на кандидата: родителен падеж'),
  objective: bi(
    'After this lesson you can read and write the register German uses on paper — starting with the fourth and last case.',
    'След този урок можеш да четеш и пишеш регистъра, който немският използва на хартия — започвайки с четвъртия и последен падеж.',
  ),
  outcomes: [
    bi('I can use des and der correctly.', 'Мога да използвам des и der правилно.'),
    bi('I add -s to masculine and neuter nouns.', 'Добавям -s при мъжки и среден род.'),
    bi('I know German writes Peters, never Peter’s.', 'Знам, че немският пише Peters, никога Peter’s.'),
    bi('I know when von is fine and when it is not.', 'Знам кога von е добре и кога не е.'),
  ],
  vocabIds: [
    'v-die-stellenanzeige',
    'v-der-lebenslauf',
    'v-das-anschreiben',
    'v-sich-bewerben',
    'v-die-kenntnisse',
    'v-der-arbeitgeber',
    'v-der-arbeitnehmer',
  ],
  grammarIds: ['g-genitiv'],
  sections: [
    {
      id: 'b1u4l1-intro',
      kind: 'intro',
      title: bi('The case you read more than you speak', 'Падежът, който четеш повече, отколкото говориш'),
      blocks: [
        {
          t: 'contrast',
          de: 'das Auto von meinem Bruder — das Auto meines Bruders',
          other: bi(
            'The first is what people say. The second is what people write — and this unit is about writing.',
            'Първото е това, което хората казват. Второто е това, което пишат — а този раздел е за писане.',
          ),
        },
        {
          t: 'de',
          de: 'Der Lebenslauf des Bewerbers ist vollständig.',
          gloss: bi('The applicant’s CV is complete.', 'Автобиографията на кандидата е пълна.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u4l1-vocab',
      kind: 'vocabulary',
      title: bi('What a German application is made of', 'От какво се състои немската кандидатура'),
      vocabIds: [
        'v-die-stellenanzeige',
        'v-der-lebenslauf',
        'v-das-anschreiben',
        'v-sich-bewerben',
        'v-die-kenntnisse',
        'v-der-arbeitgeber',
        'v-der-arbeitnehmer',
      ],
      blocks: [],
    },
    {
      id: 'b1u4l1-grammar',
      kind: 'grammar',
      title: bi('des and der', 'des и der'),
      blocks: [],
      grammarId: 'g-genitiv',
    },
    {
      id: 'b1u4l1-culture',
      kind: 'culture',
      title: bi('The shape of a German application', 'Формата на немската кандидатура'),
      blocks: [
        {
          t: 'list',
          items: [
            bi(
              'Anschreiben: one page, never more. Say where you saw the advert in the first line.',
              'Anschreiben: една страница, никога повече. Кажи в първия ред къде си видял обявата.',
            ),
            bi(
              'Lebenslauf: tabular, reverse order, one or two pages.',
              'Lebenslauf: табличен, в обратен ред, една-две страници.',
            ),
            bi(
              'Zeugnisse: copies of certificates and references. Germans keep every one they have ever been given.',
              'Zeugnisse: копия на дипломи и препоръки. Германците пазят всяка, която някога са получили.',
            ),
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('Two sentences do most of the work', 'Две изречения вършат повечето работа'),
          text: bi(
            '"Ich bewerbe mich um die Stelle als …" opens it and "Ich freue mich auf Ihre Antwort." closes it. Both are formulaic, both are expected, and lesson 3 is where their prepositions get pinned down.',
            '„Ich bewerbe mich um die Stelle als …“ го отваря, а „Ich freue mich auf Ihre Antwort.“ го затваря. И двете са шаблонни, и двете се очакват, а урок 3 е мястото, където предлозите им се заковават.',
          ),
        },
      ],
    },
    {
      id: 'b1u4l1-examples',
      kind: 'examples',
      title: bi('From a real application', 'От истинска кандидатура'),
      blocks: [
        {
          t: 'de',
          de: 'Ich habe Ihre Stellenanzeige im Internet gelesen.',
          gloss: bi(
            'I read your job advertisement on the internet.',
            'Прочетох обявата ви за работа в интернет.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Leiter der Abteilung heißt Herr Weber.',
          gloss: bi(
            'The head of the department is called Mr Weber.',
            'Ръководителят на отдела се казва господин Вебер.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Rechte des Arbeitnehmers sind gesetzlich geschützt.',
          gloss: bi(
            'The employee’s rights are protected by law.',
            'Правата на служителя са защитени от закона.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Gute Deutschkenntnisse sind erforderlich.',
          gloss: bi('Good German skills are required.', 'Изискват се добри познания по немски.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u4l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('des plus -s for masculine and neuter.', 'des плюс -s при мъжки и среден род.'),
            bi('der for feminine and plural, and the noun stays put.', 'der при женски род и мн. число, а думата не се мени.'),
            bi('Names take -s with no apostrophe: Peters Lebenslauf.', 'Имената взимат -s без апостроф: Peters Lebenslauf.'),
            bi('wegen, während, trotz and innerhalb take the genitive.', 'wegen, während, trotz и innerhalb искат родителен падеж.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u4l1-ex1', bi('des or der?', 'des или der?'), [
        {
          prompt: bi('der Bewerber — the applicant’s CV', 'der Bewerber — автобиографията на кандидата'),
          scaffold: 'der Lebenslauf ___ Bewerbers',
          answer: 'des',
          shape: 'word',
          hints: [bi('Masculine.', 'Мъжки род.')],
        },
        {
          prompt: bi('die Abteilung — the head of the department', 'die Abteilung — ръководителят на отдела'),
          scaffold: 'der Leiter ___ Abteilung',
          answer: 'der',
          shape: 'word',
          hints: [bi('Feminine, and the noun itself does not change.', 'Женски род, а самата дума не се мени.')],
        },
        {
          prompt: bi('die Arbeitnehmer — the employees’ rights', 'die Arbeitnehmer — правата на служителите'),
          scaffold: 'die Rechte ___ Arbeitnehmer',
          answer: 'der',
          shape: 'word',
          hints: [bi('Plural.', 'Множествено число.')],
        },
        {
          prompt: bi('die Probezeit — during the probation period', 'die Probezeit — по време на изпитателния срок'),
          scaffold: 'während ___ Probezeit',
          answer: 'der',
          shape: 'word',
          hints: [bi('während takes the genitive, and Probezeit is feminine.', 'während иска родителен падеж, а Probezeit е от женски род.')],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u4l1-ex2',
        bi('Write it the way it is written', 'Напиши го така, както се пише'),
        [
          {
            prompt: bi('The applicant’s CV is complete.', 'Автобиографията на кандидата е пълна.'),
            answer: 'Der Lebenslauf des Bewerbers ist vollständig.',
            reviewTargets: ['p-genitiv-des', 'v-der-lebenslauf'],
            hints: [],
            traps: [
              {
                answer: 'Der Lebenslauf von dem Bewerber ist vollständig.',
                category: 'case',
                feedback: bi(
                  'Not wrong German — that is how people speak. But this is the written register, and a written application uses the genitive: des Bewerbers.',
                  'Не е грешен немски — така се говори. Но тук регистърът е писмен, а писмената кандидатура използва родителен падеж: des Bewerbers.',
                ),
              },
            ],
          },
          {
            prompt: bi('Peter’s CV is very good.', 'Автобиографията на Петер е много добра.'),
            answer: 'Peters Lebenslauf ist sehr gut.',
            hints: [],
            traps: [
              {
                answer: "Peter's Lebenslauf ist sehr gut.",
                category: 'punctuation',
                feedback: bi(
                  'German does not use an apostrophe in the genitive: Peters Lebenslauf. Germans themselves get this wrong often enough that the mistake has a name.',
                  'Немският не използва апостроф в родителен падеж: Peters Lebenslauf. Самите германци бъркат това достатъчно често, че грешката си има име.',
                ),
              },
            ],
          },
          {
            prompt: bi('The employee’s rights are protected by law.', 'Правата на служителя са защитени от закона.'),
            answer: 'Die Rechte des Arbeitnehmers sind gesetzlich geschützt.',
            reviewTargets: ['v-der-arbeitnehmer'],
            hints: [],
          },
          {
            prompt: bi('I read your job advertisement on the internet.', 'Прочетох обявата ви за работа в интернет.'),
            answer: 'Ich habe Ihre Stellenanzeige im Internet gelesen.',
            reviewTargets: ['v-die-stellenanzeige'],
            hints: [],
          },
        ],
        ['g-genitiv'],
      ),
    ),
    b1(
      dictation('b1u4l1-ex3', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Lebenslauf des Bewerbers ist vollständig.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Leiter der Abteilung heißt Herr Weber.',
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
        typeIt('b1u4l1-m1', bi('The written register', 'Писменият регистър'), [
          {
            prompt: bi('The applicant’s CV is complete.', 'Автобиографията на кандидата е пълна.'),
            answer: 'Der Lebenslauf des Bewerbers ist vollständig.',
            hints: [],
          },
          {
            prompt: bi(
              'The head of the department is called Mr Weber.',
              'Ръководителят на отдела се казва господин Вебер.',
            ),
            answer: 'Der Leiter der Abteilung heißt Herr Weber.',
            hints: [],
          },
          {
            prompt: bi('Peter’s CV is very good.', 'Автобиографията на Петер е много добра.'),
            answer: 'Peters Lebenslauf ist sehr gut.',
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
        'One article, one letter, and no apostrophe — the fourth case is the smallest of the four. Next: the words that join sentences, and what each of them does to the verb.',
        'Един член, една буква и никакъв апостроф — четвъртият падеж е най-малкият от четирите. Следва: думите, които свързват изречения, и какво прави всяка от тях с глагола.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — although, therefore, all the same
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u4-l2',
  unitId: 'b1-u4',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Although, therefore, all the same', 'Въпреки че, затова, въпреки това'),
  objective: bi(
    'After this lesson you can argue a point in writing — which in German means knowing which family a joining word belongs to before you use it.',
    'След този урок можеш да защитиш теза в писмен вид — а на немски това значи да знаеш към кое семейство принадлежи свързващата дума, преди да я използваш.',
  ),
  outcomes: [
    bi('I know the three families and what each does.', 'Знам трите семейства и какво прави всяко.'),
    bi('obwohl sends the verb to the end.', 'obwohl изпраща глагола в края.'),
    bi('trotzdem puts it second, before the subject.', 'trotzdem го слага втори, преди подлога.'),
    bi('I can read an employment contract.', 'Мога да прочета трудов договор.'),
  ],
  vocabIds: [
    'v-der-arbeitsvertrag',
    'v-die-probezeit',
    'v-befristet',
    'v-das-gehalt',
    'v-die-kuendigungsfrist',
    'v-die-abteilung',
    'v-die-fortbildung',
  ],
  grammarIds: ['g-konnektoren'],
  sections: [
    {
      id: 'b1u4l2-intro',
      kind: 'intro',
      title: bi('Same meaning, different grammar', 'Едно значение, различна граматика'),
      blocks: [
        {
          t: 'contrast',
          de: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell. — Ich habe wenig Erfahrung. Trotzdem lerne ich schnell.',
          other: bi(
            'Almost the same sentence twice. The verb is in a different place both times.',
            'Почти едно и също изречение два пъти. Глаголът е на различно място и в двата случая.',
          ),
        },
        {
          t: 'p',
          text: bi(
            'German sorts joining words by what they do to the verb, not by what they mean. Learn the family and the word order follows.',
            'Немският подрежда свързващите думи по това какво правят с глагола, а не по значението им. Научи семейството и словоредът идва от само себе си.',
          ),
        },
      ],
    },
    {
      id: 'b1u4l2-vocab',
      kind: 'vocabulary',
      title: bi('What the contract says', 'Какво пише в договора'),
      vocabIds: [
        'v-der-arbeitsvertrag',
        'v-die-probezeit',
        'v-befristet',
        'v-das-gehalt',
        'v-die-kuendigungsfrist',
        'v-die-abteilung',
        'v-die-fortbildung',
      ],
      blocks: [],
    },
    {
      id: 'b1u4l2-grammar',
      kind: 'grammar',
      title: bi('Three families', 'Три семейства'),
      blocks: [],
      grammarId: 'g-konnektoren',
    },
    {
      id: 'b1u4l2-examples',
      kind: 'examples',
      title: bi('Arguing your case', 'Как да защитиш тезата си'),
      blocks: [
        {
          t: 'de',
          de: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
          gloss: bi(
            'Although I have little experience, I learn quickly.',
            'Въпреки че имам малко опит, уча бързо.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Trotzdem möchte ich eine Fortbildung machen.',
          gloss: bi(
            'All the same, I would like to do further training.',
            'Въпреки това искам да мина квалификация.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Vertrag ist befristet, deshalb suche ich etwas Neues.',
          gloss: bi(
            'The contract is fixed-term, so I am looking for something new.',
            'Договорът е срочен, затова търся нещо ново.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Während der Probezeit beträgt die Kündigungsfrist zwei Wochen.',
          gloss: bi(
            'During probation the notice period is two weeks.',
            'По време на изпитателния срок предизвестието е две седмици.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u4l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('und, aber, denn: nothing moves.', 'und, aber, denn: нищо не се мести.'),
            bi('weil, dass, wenn, obwohl: verb to the end.', 'weil, dass, wenn, obwohl: глаголът в края.'),
            bi('trotzdem, deshalb, außerdem: verb second, subject behind.', 'trotzdem, deshalb, außerdem: глаголът втори, подлогът зад него.'),
            bi('obwohl and trotzdem mean the same and behave differently.', 'obwohl и trotzdem значат едно и също, а се държат различно.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      wordOrder('b1u4l2-ex1', bi('Which family?', 'Кое семейство?'), [
        {
          prompt: bi(
            'Although I have little experience, I learn quickly.',
            'Въпреки че имам малко опит, уча бързо.',
          ),
          bank: ['Obwohl', 'ich', 'wenig', 'Erfahrung', 'habe,', 'lerne', 'ich', 'schnell.'],
          answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
          hints: [bi('obwohl sends the verb to the end.', 'obwohl изпраща глагола в края.')],
        },
        {
          prompt: bi('All the same, I learn quickly.', 'Въпреки това уча бързо.'),
          bank: ['Trotzdem', 'lerne', 'ich', 'schnell.'],
          answer: 'Trotzdem lerne ich schnell.',
          hints: [
            bi(
              'trotzdem takes position one, so the verb is second and the subject follows it.',
              'trotzdem заема първа позиция, затова глаголът е втори, а подлогът го следва.',
            ),
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u4l2-ex2',
        bi('The pair that gets mixed up', 'Двойката, която се бърка'),
        [
          {
            prompt: bi(
              'Although I have little experience, I learn quickly.',
              'Въпреки че имам малко опит, уча бързо.',
            ),
            answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
            reviewTargets: ['p-obwohl', 'v-die-erfahrung'],
            hints: [],
            traps: [
              {
                answer: 'Obwohl ich habe wenig Erfahrung, lerne ich schnell.',
                category: 'word-order',
                feedback: bi(
                  'obwohl is a subordinator, exactly like weil and dass: the conjugated verb goes right to the end of its clause.',
                  'obwohl е подчинителен съюз, точно като weil и dass: спрегнатият глагол отива най-накрая в своето изречение.',
                ),
              },
            ],
          },
          {
            prompt: bi('All the same, I would like to do further training.', 'Въпреки това искам да мина квалификация.'),
            answer: 'Trotzdem möchte ich eine Fortbildung machen.',
            reviewTargets: ['p-trotzdem', 'v-die-fortbildung'],
            hints: [],
            traps: [
              {
                answer: 'Trotzdem ich möchte eine Fortbildung machen.',
                category: 'word-order',
                feedback: bi(
                  'trotzdem is not a conjunction — it is an adverb in position one, and whatever stands in position one pushes the verb to second place: Trotzdem möchte ich …',
                  'trotzdem не е съюз — то е наречие на първа позиция, а каквото стои на първа позиция, бута глагола на второ място: Trotzdem möchte ich …',
                ),
              },
            ],
          },
          {
            prompt: bi(
              'The contract is fixed-term, so I am looking for something new.',
              'Договорът е срочен, затова търся нещо ново.',
            ),
            answer: 'Der Vertrag ist befristet, deshalb suche ich etwas Neues.',
            reviewTargets: ['v-befristet'],
            hints: [],
          },
        ],
        ['g-konnektoren'],
      ),
    ),
    b1(
      typeIt(
        'b1u4l2-ex3',
        bi('Reading the contract', 'Четене на договора'),
        [
          {
            prompt: bi(
              'During probation the notice period is two weeks.',
              'По време на изпитателния срок предизвестието е две седмици.',
            ),
            answer: 'Während der Probezeit beträgt die Kündigungsfrist zwei Wochen.',
            reviewTargets: ['v-die-probezeit', 'v-die-kuendigungsfrist'],
            hints: [],
          },
          {
            prompt: bi('The salary is transferred monthly.', 'Заплатата се превежда месечно.'),
            answer: 'Das Gehalt wird monatlich überwiesen.',
            reviewTargets: ['v-das-gehalt'],
            hints: [],
          },
          {
            prompt: bi('The contract is limited to two years.', 'Договорът е срочен, за две години.'),
            answer: 'Der Vertrag ist auf zwei Jahre befristet.',
            reviewTargets: ['v-der-arbeitsvertrag'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      exercise({
        id: 'b1u4l2-ex4',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('Where does the verb go?', 'Къде отива глаголът?'),
        steps: [
          {
            prompt: bi('obwohl + ich habe wenig Zeit', 'obwohl + ich habe wenig Zeit'),
            scaffold: 'Obwohl ich wenig Zeit ___, mache ich die Fortbildung.',
            answer: 'habe',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('trotzdem + ich mache die Fortbildung', 'trotzdem + ich mache die Fortbildung'),
            scaffold: 'Trotzdem ___ ich die Fortbildung.',
            answer: 'mache',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('aber + ich lerne schnell', 'aber + ich lerne schnell'),
            scaffold: 'Ich habe wenig Erfahrung, aber ich ___ schnell.',
            answer: 'lerne',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b1(
        typeIt('b1u4l2-m1', bi('Three families', 'Три семейства'), [
          {
            prompt: bi(
              'Although I have little experience, I learn quickly.',
              'Въпреки че имам малко опит, уча бързо.',
            ),
            answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
            hints: [],
          },
          {
            prompt: bi('All the same, I would like to do further training.', 'Въпреки това искам да мина квалификация.'),
            answer: 'Trotzdem möchte ich eine Fortbildung machen.',
            hints: [],
          },
          {
            prompt: bi(
              'The contract is fixed-term, so I am looking for something new.',
              'Договорът е срочен, затова търся нещо ново.',
            ),
            answer: 'Der Vertrag ist befristet, deshalb suche ich etwas Neues.',
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
        'Three families, one question to ask of every new joining word. Next: the prepositions that come glued to a verb, and the letter they open and close.',
        'Три семейства и един въпрос, който да зададеш за всяка нова свързваща дума. Следва: предлозите, залепени за глагола, и писмото, което отварят и затварят.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — the interview, and the letter
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u4-l3',
  unitId: 'b1-u4',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('I am applying for: verbs and their prepositions', 'Кандидатствам за: глаголи и техните предлози'),
  objective: bi(
    'After this lesson you can write a German cover letter and answer the questions a German interview actually asks.',
    'След този урок можеш да напишеш немско мотивационно писмо и да отговориш на въпросите, които немското интервю наистина задава.',
  ),
  outcomes: [
    bi('I know sich bewerben takes um, not für.', 'Знам, че sich bewerben иска um, а не für.'),
    bi('I can use sich freuen auf and sich interessieren für.', 'Мога да използвам sich freuen auf и sich interessieren für.'),
    bi('I can describe my strengths in the expected words.', 'Мога да опиша силните си страни с очакваните думи.'),
    bi('I can write the opening and closing lines of an application.', 'Мога да напиша началото и края на кандидатура.'),
  ],
  vocabIds: [
    'v-das-vorstellungsgespraech',
    'v-zuverlaessig',
    'v-teamfaehig',
    'v-die-staerke',
    'v-die-schwaeche',
    'v-sich-interessieren',
    'v-sich-freuen-auf',
  ],
  grammarIds: ['g-verb-praeposition'],
  sections: [
    {
      id: 'b1u4l3-intro',
      kind: 'intro',
      title: bi('The preposition is part of the word', 'Предлогът е част от думата'),
      blocks: [
        {
          t: 'de',
          de: 'Ich bewerbe mich um die Stelle.',
          gloss: bi('I am applying for the position.', 'Кандидатствам за позицията.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Not für. English says "apply for" and Bulgarian says „кандидатствам за“, and both point at für — German chose um instead. There is no rule; there is only the pairing.',
            'Не für. Английският казва „apply for“, българският казва „кандидатствам за“ и двата сочат към für — немският е избрал um. Няма правило; има само двойката.',
          ),
        },
        {
          t: 'de',
          de: 'Ich freue mich auf Ihre Antwort.',
          gloss: bi('I look forward to your reply.', 'Очаквам отговора ви с нетърпение.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u4l3-vocab',
      kind: 'vocabulary',
      title: bi('The interview', 'Интервюто'),
      vocabIds: [
        'v-das-vorstellungsgespraech',
        'v-zuverlaessig',
        'v-teamfaehig',
        'v-die-staerke',
        'v-die-schwaeche',
        'v-sich-interessieren',
        'v-sich-freuen-auf',
      ],
      blocks: [],
    },
    {
      id: 'b1u4l3-grammar',
      kind: 'grammar',
      title: bi('Verbs with a fixed preposition', 'Глаголи с фиксиран предлог'),
      blocks: [],
      grammarId: 'g-verb-praeposition',
    },
    {
      id: 'b1u4l3-culture',
      kind: 'culture',
      title: bi('What a German interview expects', 'Какво очаква немското интервю'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Be punctual to the minute. Five minutes early is on time.', 'Бъди точен до минутата. Пет минути по-рано значи навреме.'),
            bi('Sie throughout, unless you are explicitly offered du.', 'През цялото време на „Вие“, освен ако изрично не ти предложат „ти“.'),
            bi(
              'Expect "Was sind Ihre Stärken und Schwächen?" — it is asked almost every time.',
              'Очаквай „Was sind Ihre Stärken und Schwächen?“ — пита се почти всеки път.',
            ),
            bi(
              'Have questions ready. Asking none is read as not being interested.',
              'Имай готови въпроси. Да не зададеш нито един, се чете като липса на интерес.',
            ),
          ],
        },
      ],
    },
    {
      id: 'b1u4l3-examples',
      kind: 'examples',
      title: bi('The sentences you will actually write', 'Изреченията, които наистина ще напишеш'),
      blocks: [
        {
          t: 'de',
          de: 'Ich möchte mich um die Stelle bewerben.',
          gloss: bi('I would like to apply for the position.', 'Бих искал да кандидатствам за позицията.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich interessiere mich für diese Stelle.',
          gloss: bi('I am interested in this position.', 'Интересувам се от тази позиция.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich arbeite selbstständig und zuverlässig.',
          gloss: bi('I work independently and reliably.', 'Работя самостоятелно и надеждно.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich freue mich auf Ihre Antwort.',
          gloss: bi('I look forward to your reply.', 'Очаквам отговора ви с нетърпение.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u4l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('sich bewerben **um** — never für.', 'sich bewerben **um** — никога für.'),
            bi('sich interessieren **für**, sich freuen **auf**.', 'sich interessieren **für**, sich freuen **auf**.'),
            bi('Learn the preposition with the verb, as one item.', 'Учи предлога заедно с глагола, като едно цяло.'),
            bi('Those two sentences open and close the letter.', 'Тези две изречения отварят и затварят писмото.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u4l3-ex1', bi('Which preposition?', 'Кой предлог?'), [
        {
          prompt: bi('sich bewerben — for the position', 'sich bewerben — за позицията'),
          scaffold: 'Ich bewerbe mich ___ die Stelle.',
          answer: 'um',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'für',
              category: 'preposition',
              feedback: bi(
                'Both English and Bulgarian point at für here, and both are wrong. sich bewerben takes um — and it is the first sentence of your cover letter, so it is worth owning.',
                'И английският, и българският сочат към für тук и двата грешат. sich bewerben иска um — а това е първото изречение на мотивационното ти писмо, затова си струва да се знае.',
              ),
            },
          ],
        },
        {
          prompt: bi('sich interessieren — in this position', 'sich interessieren — от тази позиция'),
          scaffold: 'Ich interessiere mich ___ diese Stelle.',
          answer: 'für',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('sich freuen — to your reply', 'sich freuen — отговора ви'),
          scaffold: 'Ich freue mich ___ Ihre Antwort.',
          answer: 'auf',
          shape: 'word',
          hints: [bi('Something still to come takes auf.', 'Нещо предстоящо иска auf.')],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u4l3-ex2',
        bi('The letter', 'Писмото'),
        [
          {
            prompt: bi('I would like to apply for the position.', 'Бих искал да кандидатствам за позицията.'),
            answer: 'Ich möchte mich um die Stelle bewerben.',
            reviewTargets: ['p-bewerben-um', 'v-sich-bewerben'],
            hints: [],
          },
          {
            prompt: bi('I am interested in this position.', 'Интересувам се от тази позиция.'),
            answer: 'Ich interessiere mich für diese Stelle.',
            reviewTargets: ['v-sich-interessieren'],
            hints: [],
          },
          {
            prompt: bi('I look forward to your reply.', 'Очаквам отговора ви с нетърпение.'),
            answer: 'Ich freue mich auf Ihre Antwort.',
            reviewTargets: ['v-sich-freuen-auf'],
            hints: [],
          },
        ],
        ['g-verb-praeposition'],
      ),
    ),
    b1(
      typeIt(
        'b1u4l3-ex3',
        bi('At the interview', 'На интервюто'),
        [
          {
            prompt: bi('What are your strengths and weaknesses?', 'Какви са силните и слабите ти страни?'),
            answer: 'Was sind Ihre Stärken und Schwächen?',
            reviewTargets: ['v-die-staerke', 'v-die-schwaeche'],
            hints: [],
          },
          {
            prompt: bi('I work independently and reliably.', 'Работя самостоятелно и надеждно.'),
            answer: 'Ich arbeite selbstständig und zuverlässig.',
            reviewTargets: ['v-zuverlaessig'],
            hints: [],
          },
          {
            prompt: bi('We are looking for a team player.', 'Търсим човек, който работи добре в екип.'),
            answer: 'Wir suchen eine teamfähige Person.',
            reviewTargets: ['v-teamfaehig'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      freeWriting('b1u4l3-ex4', bi('Open the letter', 'Отвори писмото'), [
        {
          prompt: bi(
            'Write the first two sentences of a cover letter: say where you saw the advert, and that you are applying for the position. Then add one sentence saying that although you have little experience, you learn quickly.',
            'Напиши първите две изречения на мотивационно писмо: кажи къде си видял обявата и че кандидатстваш за позицията. После добави едно изречение, че въпреки малкия си опит учиш бързо.',
          ),
          answer:
            'Ich habe Ihre Stellenanzeige im Internet gelesen und möchte mich um die Stelle bewerben. Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
          requiredTokens: ['bewerben'],
          shape: 'sentence',
          hints: [
            bi(
              'Where you saw it, then the application, then the argument.',
              'Къде си я видял, после кандидатурата, после аргументът.',
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
        typeIt('b1u4l3-m1', bi('Opening and closing', 'Начало и край'), [
          {
            prompt: bi('I would like to apply for the position.', 'Бих искал да кандидатствам за позицията.'),
            answer: 'Ich möchte mich um die Stelle bewerben.',
            hints: [],
          },
          {
            prompt: bi('I look forward to your reply.', 'Очаквам отговора ви с нетърпение.'),
            answer: 'Ich freue mich auf Ihre Antwort.',
            hints: [],
          },
          {
            prompt: bi('I am interested in this position.', 'Интересувам се от тази позиция.'),
            answer: 'Ich interessiere mich für diese Stelle.',
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
        'A case for writing, three families of joining words, and a handful of prepositions that have to be memorised — which together are a German cover letter. Next: the past, told as a story.',
        'Падеж за писане, три семейства свързващи думи и шепа предлози, които просто се помнят — а заедно те са немското мотивационно писмо. Следва: миналото, разказано като история.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u4',
  scope: 'unit',
  targetId: 'b1-u4',
  status: 'available',
  title: bi('Unit 4 checkpoint', 'Проверка на раздел 4'),
  description: bi(
    'The genitive, the three connector families, and the prepositions a cover letter needs.',
    'Родителният падеж, трите семейства свързващи думи и предлозите, които иска едно мотивационно писмо.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u4-1', bi('The written register', 'Писменият регистър'), [
        {
          prompt: bi('The applicant’s CV is complete.', 'Автобиографията на кандидата е пълна.'),
          answer: 'Der Lebenslauf des Bewerbers ist vollständig.',
          hints: [],
        },
        {
          prompt: bi('The employee’s rights are protected by law.', 'Правата на служителя са защитени от закона.'),
          answer: 'Die Rechte des Arbeitnehmers sind gesetzlich geschützt.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u4-2', bi('obwohl or trotzdem', 'obwohl или trotzdem'), [
        {
          prompt: bi(
            'Although I have little experience, I learn quickly.',
            'Въпреки че имам малко опит, уча бързо.',
          ),
          answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
          hints: [],
        },
        {
          prompt: bi('All the same, I would like to do further training.', 'Въпреки това искам да мина квалификация.'),
          answer: 'Trotzdem möchte ich eine Fortbildung machen.',
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u4-3',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('The right small word', 'Правилната малка дума'),
        steps: [
          {
            prompt: bi('der Bewerber — genitive', 'der Bewerber — родителен падеж'),
            scaffold: 'der Lebenslauf ___ Bewerbers',
            answer: 'des',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('sich bewerben — for the position', 'sich bewerben — за позицията'),
            scaffold: 'Ich bewerbe mich ___ die Stelle.',
            answer: 'um',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('sich freuen — to your reply', 'sich freuen — отговора ви'),
            scaffold: 'Ich freue mich ___ Ihre Antwort.',
            answer: 'auf',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      typeIt('cp-b1u4-4', bi('The application', 'Кандидатурата'), [
        {
          prompt: bi('I would like to apply for the position.', 'Бих искал да кандидатствам за позицията.'),
          answer: 'Ich möchte mich um die Stelle bewerben.',
          hints: [],
        },
        {
          prompt: bi(
            'During probation the notice period is two weeks.',
            'По време на изпитателния срок предизвестието е две седмици.',
          ),
          answer: 'Während der Probezeit beträgt die Kündigungsfrist zwei Wochen.',
          hints: [],
        },
      ]),
    ),
    b1(
      dictation('cp-b1u4-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich freue mich auf Ihre Antwort.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_4: Unit = {
  id: 'b1-u4',
  level: 'b1',
  order: 4,
  status: 'available',
  title: bi('Work and applications', 'Работа и кандидатстване'),
  summary: bi(
    'The genitive — taught as the written register it actually is — the three connector families that decide German word order, and the fixed prepositions that open and close a cover letter.',
    'Родителният падеж — преподаден като писмения регистър, какъвто наистина е — трите семейства свързващи думи, които решават немския словоред, и фиксираните предлози, които отварят и затварят мотивационното писмо.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U4_PATTERNS = PATTERNS;
