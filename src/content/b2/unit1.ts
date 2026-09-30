import { bi, dictation, fillBlank, freeWriting, typeIt, wordOrder } from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B2 Unit 1 — At work: meetings and projects.
 *
 * B1 ended with a learner who can hold a position and write a formal letter.
 * B2 begins on the day after they are hired, and the problem changes shape:
 * they are no longer trying to be understood, they are trying to be taken
 * seriously. That is a register problem, and it is what this whole level is
 * about.
 *
 * The unit teaches three things, and the office is not decoration — it is the
 * only place where all three are compulsory at once.
 *
 * **The passive, finished** (lesson 1). B1 taught *wird ausgefüllt* and
 * stopped. A status report needs the other tenses, and one of them contains
 * the most recognisable B2 error in German: *ist geschrieben **worden***,
 * where werden loses its ge-. The two paths arrive at this from different
 * directions. English builds every passive with *be*, so "has been written"
 * translates itself into *ist geschrieben* — real German, different sentence.
 * Bulgarian builds the past passive exactly as German does („беше написан“ =
 * *wurde geschrieben*), so that half is free; what Bulgarian does not mark is
 * the Perfekt, and that is precisely where the new form lives.
 *
 * **wird erledigt against ist erledigt** (also lesson 1, because the pair is
 * the point). German separates the event from the state it leaves behind.
 * English cannot hear the difference at all — "the door is closed" is both
 * sentences — while Bulgarian does make the cut, with verbal aspect rather
 * than with the auxiliary, so the Bulgarian path gets told its instinct is
 * sound and warned about the one thing that misleads it: „се“ is not how
 * German builds a passive.
 *
 * **Meeting language** (lesson 2) is deliberately not presented as new
 * grammar, because it is not. allerdings, dennoch and folglich are the
 * adverbial family from B1 Unit 4 in better clothes. What the lesson spends
 * its time on is the error that actually happens: the English "However," comma
 * producing *Allerdings, wir sollten …*
 *
 * **Nominalisation** (lesson 3) is why German reports read the way they do,
 * and it is the first place at B2 where the English path has the easier ride —
 * English nominalises just as heavily and joins with *of*, which maps onto the
 * genitive. Bulgarian joins with „на“, which maps onto *von*, and *von* in a
 * report is the same register mistake B1 Unit 4 named for the genitive.
 */

/** Everything in this file is B2. */
const b2 = (ex: Exercise): Exercise => ({ ...ex, level: 'b2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-passiv-praeteritum',
    template: 'Der Bericht wurde ___.',
    example: 'Der Bericht wurde gestern eingereicht.',
    gloss: bi('The report was ___.', 'Докладът беше ___.'),
    level: 'b2',
    grammarIds: ['g-passiv-zeiten'],
  },
  {
    id: 'p-passiv-perfekt',
    template: 'Der Bericht ist ___ worden.',
    example: 'Der Bericht ist schon geschrieben worden.',
    gloss: bi('The report has already been written.', 'Докладът вече е бил написан.'),
    level: 'b2',
    grammarIds: ['g-passiv-zeiten'],
  },
  {
    id: 'p-zustandspassiv',
    template: 'Der Auftrag ist ___.',
    example: 'Der Auftrag ist erledigt.',
    gloss: bi('The order is done.', 'Поръчката е приключена.'),
    level: 'b2',
    grammarIds: ['g-zustandspassiv'],
  },
  {
    id: 'p-vorschlag-dass',
    template: 'Ich würde vorschlagen, dass ___.',
    example: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
    gloss: bi('I would suggest that ___.', 'Бих предложил ___.'),
    level: 'b2',
    grammarIds: ['g-konnektoren-b2'],
  },
  {
    id: 'p-nominalisierung-genitiv',
    template: 'die ___ des ___',
    example: 'die Durchführung des Projekts',
    gloss: bi('the carrying out of the project', 'провеждането на проекта'),
    level: 'b2',
    grammarIds: ['g-nominalisierung'],
  },
];

/* ================================================================== *
 * Lesson 1 — what was done, by nobody in particular
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b2-u1-l1',
  unitId: 'b2-u1',
  level: 'b2',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The report was submitted', 'Докладът беше подаден'),
  objective: bi(
    'After this lesson you can report on work in the voice a German workplace reports in: the passive, in every tense you need, and the difference between something being done and something being done with.',
    'След този урок можеш да докладваш за работа в гласа, с който немската работна среда докладва: страдателен залог във всички нужни времена и разликата между нещо, което се върши, и нещо, което е свършено.',
  ),
  outcomes: [
    bi('I can say what was done without saying who did it.', 'Мога да кажа какво е направено, без да казвам кой го е направил.'),
    bi('I use wurde in writing and ist … worden when speaking.', 'Използвам wurde в писмен текст и ist … worden, когато говоря.'),
    bi('I never write geworden in a passive sentence.', 'Никога не пиша geworden в страдателно изречение.'),
    bi('I can tell wird erledigt from ist erledigt.', 'Различавам wird erledigt от ist erledigt.'),
  ],
  vocabIds: [
    'v-die-besprechung',
    'v-das-protokoll',
    'v-der-bericht',
    'v-der-auftrag',
    'v-erledigen',
    'v-durchfuehren',
    'v-die-verzoegerung',
    'v-rechtzeitig',
  ],
  grammarIds: ['g-passiv-zeiten', 'g-zustandspassiv'],
  sections: [
    {
      id: 'b2u1l1-intro',
      kind: 'intro',
      title: bi('Nobody did it. It was done.', 'Никой не го е направил. То е направено.'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Read any German status report and count the people in it. There will be almost none.',
            'Прочети който и да е немски работен отчет и преброй хората в него. Почти няма да има.',
          ),
        },
        {
          t: 'contrast',
          de: 'Ich habe den Bericht gestern eingereicht.',
          other: bi(
            'True, and it puts you in the sentence. Fine in a conversation.',
            'Вярно е, но те слага в изречението. Става за разговор.',
          ),
        },
        {
          t: 'de',
          de: 'Der Bericht wurde gestern eingereicht.',
          gloss: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Same fact, no actor, and it is what a report says. You already build this in the present. This lesson gives you the rest of the tenses — which is less work than it sounds, because only one word ever changes.',
            'Същият факт, без действащо лице — и точно така се пише в отчет. В сегашно време вече го умееш. Този урок ти дава останалите времена, а това е по-малко работа, отколкото звучи, защото се променя само една дума.',
          ),
        },
      ],
    },
    {
      id: 'b2u1l1-vocab',
      kind: 'vocabulary',
      title: bi('The words a project is reported in', 'Думите, с които се отчита проект'),
      vocabIds: [
        'v-die-besprechung',
        'v-das-protokoll',
        'v-der-bericht',
        'v-der-auftrag',
        'v-erledigen',
        'v-durchfuehren',
        'v-die-verzoegerung',
        'v-rechtzeitig',
      ],
      blocks: [
        {
          t: 'callout',
          tone: 'warn',
          title: bi('Verspätung is for trains', 'Verspätung е за влакове'),
          text: bi(
            'A train has a **Verspätung**. A project, a delivery or a decision has a **Verzögerung**. English calls both a delay, so the pair has to be learnt as a pair — and using the train word about a deadline sounds careless rather than foreign.',
            'Влакът има **Verspätung**. Проектът, доставката или решението имат **Verzögerung**. И на български двете са „закъснение“, затова двойката се учи наведнъж — а думата за влак, употребена за срок, звучи немарливо, а не чуждо.',
          ),
        },
      ],
    },
    {
      id: 'b2u1l1-grammar',
      kind: 'grammar',
      title: bi('Only werden moves', 'Мести се само werden'),
      blocks: [],
      grammarId: 'g-passiv-zeiten',
    },
    {
      id: 'b2u1l1-grammar2',
      kind: 'grammar',
      title: bi('The event, and the state it leaves', 'Събитието и състоянието след него'),
      blocks: [],
      grammarId: 'g-zustandspassiv',
    },
    {
      id: 'b2u1l1-examples',
      kind: 'examples',
      title: bi('A project, reported', 'Проект, отчетен'),
      blocks: [
        {
          t: 'de',
          de: 'Das Protokoll wurde an alle Teilnehmer verschickt.',
          gloss: bi('The minutes were sent to all participants.', 'Протоколът беше изпратен до всички участници.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Auftrag ist gestern bearbeitet worden.',
          gloss: bi('The order was processed yesterday.', 'Поръчката беше обработена вчера.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Besprechung musste verschoben werden.',
          gloss: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Bericht ist fertig. Er ist schon eingereicht.',
          gloss: bi('The report is finished. It has already been handed in.', 'Докладът е готов. Вече е подаден.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u1l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('wird → wurde → ist … worden. The participle never changes.', 'wird → wurde → ist … worden. Причастието не се променя.'),
            bi('worden has no ge-. geworden belongs to the other werden.', 'worden е без ge-. geworden принадлежи на другото werden.'),
            bi('Writing prefers wurde; speaking prefers ist … worden.', 'Писменият език предпочита wurde; говоримият — ist … worden.'),
            bi('werden is the event. sein is the state. If gerade fits, use werden.', 'werden е събитието. sein е състоянието. Ако gerade пасва, използвай werden.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u1l1-ex1', bi('Which form of werden?', 'Коя форма на werden?'), [
        {
          prompt: bi('yesterday — Präteritum', 'вчера — претеритум'),
          scaffold: 'Der Bericht ___ gestern eingereicht.',
          answer: 'wurde',
          shape: 'word',
          hints: [bi('One word, past, written German.', 'Една дума, минало време, писмен немски.')],
        },
        {
          prompt: bi('right now — present', 'точно сега — сегашно'),
          scaffold: 'Das Protokoll ___ gerade geschrieben.',
          answer: 'wird',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('has been processed — Perfekt', 'е бил обработен — перфект'),
          scaffold: 'Der Auftrag ist gestern bearbeitet ___.',
          answer: 'worden',
          shape: 'word',
          hints: [bi('No ge- on this one.', 'Тази е без ge-.')],
          traps: [
            {
              answer: 'geworden',
              category: 'verb-conjugation',
              feedback: bi(
                'In a passive, werden appears as worden with no ge-. geworden is the participle of the other werden, the one that means "became": Er ist Ingenieur geworden.',
                'В страдателен залог werden се явява като worden, без ge-. geworden е причастието на другото werden, онова със значение „стана“: Er ist Ingenieur geworden.',
              ),
            },
          ],
        },
        {
          prompt: bi('had to be postponed — modal in the past', 'трябваше да бъде отложена — модален в миналото'),
          scaffold: 'Die Besprechung musste verschoben ___.',
          answer: 'werden',
          shape: 'word',
          hints: [bi('After a modal, werden stays an infinitive.', 'След модален глагол werden остава в инфинитив.')],
        },
      ]),
    ),
    b2(
      fillBlank('b2u1l1-ex2', bi('The event or the state?', 'Събитието или състоянието?'), [
        {
          prompt: bi('Someone is closing it right now.', 'В момента някой я затваря.'),
          scaffold: 'Die Tür ___ gerade geschlossen.',
          answer: 'wird',
          shape: 'word',
          hints: [bi('gerade fits, so it is the event.', 'gerade пасва, значи е събитието.')],
        },
        {
          prompt: bi('It is shut. Nothing is happening.', 'Тя е затворена. Нищо не се случва.'),
          scaffold: 'Die Tür ___ seit gestern geschlossen.',
          answer: 'ist',
          shape: 'word',
          hints: [bi('A state that has lasted since yesterday.', 'Състояние, което трае от вчера.')],
        },
        {
          prompt: bi('It is off the list — a result.', 'Отпада от списъка — резултат.'),
          scaffold: 'Der Auftrag ___ erledigt.',
          answer: 'ist',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('Somebody is dealing with it — a promise.', 'Някой се занимава с нея — обещание.'),
          scaffold: 'Der Auftrag ___ heute noch erledigt.',
          answer: 'wird',
          shape: 'word',
          hints: [bi('Still to happen today.', 'Тепърва ще се случи днес.')],
        },
      ]),
    ),
    b2(
      wordOrder('b2u1l1-ex3', bi('Build the passive sentence', 'Построй страдателното изречение'), [
        {
          prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
          bank: ['Der', 'Bericht', 'wurde', 'gestern', 'eingereicht.'],
          answer: 'Der Bericht wurde gestern eingereicht.',
          hints: [bi('The participle goes last.', 'Причастието отива последно.')],
        },
        {
          prompt: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
          bank: ['Die', 'Besprechung', 'musste', 'verschoben', 'werden.'],
          answer: 'Die Besprechung musste verschoben werden.',
          hints: [
            bi(
              'Two verbs at the end: the participle first, then werden.',
              'Два глагола накрая: първо причастието, после werden.',
            ),
          ],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u1l1-ex4',
        bi('Report it yourself', 'Отчети го сам'),
        [
          {
            prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
            answer: 'Der Bericht wurde gestern eingereicht.',
            reviewTargets: ['p-passiv-praeteritum', 'v-der-bericht', 'v-einreichen'],
            hints: [],
            traps: [
              {
                answer: 'Der Bericht war gestern eingereicht.',
                category: 'auxiliary-verb',
                feedback: bi(
                  'war + participle is the state passive: it would mean the report was already in at that point. For the event itself German uses wurde: Der Bericht wurde gestern eingereicht.',
                  'war + причастие е страдателен залог за състояние: би значело, че докладът вече е бил подаден към онзи момент. За самото събитие немският използва wurde: Der Bericht wurde gestern eingereicht.',
                ),
              },
            ],
          },
          {
            prompt: bi('The order was processed yesterday. (spoken)', 'Поръчката беше обработена вчера. (говоримо)'),
            answer: 'Der Auftrag ist gestern bearbeitet worden.',
            reviewTargets: ['p-passiv-perfekt', 'v-der-auftrag'],
            hints: [],
            traps: [
              {
                answer: 'Der Auftrag ist gestern bearbeitet geworden.',
                category: 'verb-conjugation',
                feedback: bi(
                  'In the passive, werden loses its ge-: bearbeitet worden. geworden belongs to the other werden — Er ist Chef geworden.',
                  'В страдателен залог werden губи своето ge-: bearbeitet worden. geworden е от другото werden — Er ist Chef geworden.',
                ),
              },
            ],
          },
          {
            prompt: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
            answer: 'Die Besprechung musste verschoben werden.',
            reviewTargets: ['v-die-besprechung'],
            hints: [],
          },
          {
            prompt: bi('The minutes are being written right now.', 'Протоколът се пише точно сега.'),
            answer: 'Das Protokoll wird gerade geschrieben.',
            reviewTargets: ['v-das-protokoll'],
            hints: [],
          },
          {
            prompt: bi('The order is done.', 'Поръчката е приключена.'),
            answer: 'Der Auftrag ist erledigt.',
            reviewTargets: ['p-zustandspassiv', 'v-erledigen'],
            hints: [],
            traps: [
              {
                answer: 'Der Auftrag wird erledigt.',
                category: 'auxiliary-verb',
                feedback: bi(
                  'wird erledigt is a promise — somebody is going to deal with it. The finished result is a state: Der Auftrag ist erledigt.',
                  'wird erledigt е обещание — някой ще се заеме. Завършеният резултат е състояние: Der Auftrag ist erledigt.',
                ),
              },
            ],
          },
        ],
        ['g-passiv-zeiten', 'g-zustandspassiv'],
      ),
    ),
    b2(
      typeIt(
        'b2u1l1-ex5',
        bi('Delays, and who says what', 'Забавяния и кой какво казва'),
        [
          {
            prompt: bi('There was a delay in the delivery.', 'Възникна забавяне на доставката.'),
            answer: 'Es kam zu einer Verzögerung bei der Lieferung.',
            reviewTargets: ['v-die-verzoegerung'],
            hints: [
              bi(
                'German says it with es kam zu — "it came to a delay".',
                'Немският го казва с es kam zu — „дойде се до забавяне“.',
              ),
            ],
          },
          {
            prompt: bi('The application was submitted in good time.', 'Заявлението беше подадено навреме.'),
            answer: 'Der Antrag wurde rechtzeitig eingereicht.',
            reviewTargets: ['v-rechtzeitig', 'v-der-antrag'],
            hints: [],
          },
          {
            prompt: bi('We are carrying the project out in three phases.', 'Провеждаме проекта на три етапа.'),
            answer: 'Wir führen das Projekt in drei Phasen durch.',
            reviewTargets: ['v-durchfuehren'],
            hints: [bi('durchführen splits.', 'durchführen се разделя.')],
            traps: [
              {
                answer: 'Wir durchführen das Projekt in drei Phasen.',
                category: 'word-order',
                feedback: bi(
                  'durchführen is separable here: the prefix goes to the end. Wir führen das Projekt in drei Phasen durch.',
                  'Тук durchführen е разделим: представката отива в края. Wir führen das Projekt in drei Phasen durch.',
                ),
              },
            ],
          },
        ],
        ['g-passiv-zeiten'],
      ),
    ),
    b2(
      dictation('b2u1l1-ex6', bi('Hear the worden', 'Чуй worden'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Auftrag ist gestern bearbeitet worden.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Besprechung musste verschoben werden.',
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
        typeIt('b2u1l1-m1', bi('Report it in both voices', 'Отчети го в двата гласа'), [
          {
            prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
            answer: 'Der Bericht wurde gestern eingereicht.',
            hints: [],
          },
          {
            prompt: bi('The order was processed yesterday. (spoken)', 'Поръчката беше обработена вчера. (говоримо)'),
            answer: 'Der Auftrag ist gestern bearbeitet worden.',
            hints: [],
          },
          {
            prompt: bi('The order is done.', 'Поръчката е приключена.'),
            answer: 'Der Auftrag ist erledigt.',
            hints: [],
          },
        ]),
      ),
      b2(
        fillBlank('b2u1l1-m2', bi('werden or sein?', 'werden или sein?'), [
          {
            prompt: bi('right now', 'точно сега'),
            scaffold: 'Die Tür ___ gerade geschlossen.',
            answer: 'wird',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('a finished result', 'завършен резултат'),
            scaffold: 'Das Protokoll ___ schon geschrieben.',
            answer: 'ist',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('no ge- here', 'тук без ge-'),
            scaffold: 'Der Bericht ist eingereicht ___.',
            answer: 'worden',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — saying something in the room
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b2-u1-l2',
  unitId: 'b2-u1',
  level: 'b2',
  order: 2,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('First of all, however, consequently', 'Първо, обаче, следователно'),
  objective: bi(
    'After this lesson you can structure what you say in a meeting — open, add, object, conclude — without losing the verb in second position.',
    'След този урок можеш да структурираш казаното на работна среща — откриване, допълване, възражение, извод — без да изгубиш глагола от второ място.',
  ),
  outcomes: [
    bi('I can signal what kind of contribution is coming.', 'Мога да покажа какъв принос следва.'),
    bi('I keep the verb second after a connector in first position.', 'Пазя глагола на второ място след свързваща дума в началото.'),
    bi('I can make a suggestion politely and object without rudeness.', 'Мога да направя учтиво предложение и да възразя без грубост.'),
    bi('I can agree, reject and summarise.', 'Мога да се съглася, да отхвърля и да обобщя.'),
  ],
  vocabIds: [
    'v-der-vorschlag',
    'v-vorschlagen',
    'v-der-einwand',
    'v-ablehnen',
    'v-die-tagesordnung',
    'v-sich-einigen',
    'v-der-zeitplan',
    'v-allerdings',
    'v-dennoch',
    'v-folglich',
  ],
  grammarIds: ['g-konnektoren-b2'],
  sections: [
    {
      id: 'b2u1l2-intro',
      kind: 'intro',
      title: bi('Signposts, not new grammar', 'Указателни табели, а не нова граматика'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'A German meeting is signposted. Before the content of a contribution arrives, a word has already told everyone what kind of contribution it is.',
            'Немската работна среща е обозначена с табели. Преди да дойде съдържанието на изказването, една дума вече е казала на всички какъв вид изказване следва.',
          ),
        },
        {
          t: 'de',
          de: 'Zunächst schauen wir uns die Zahlen an. Allerdings ist der Zeitplan sehr eng. Folglich müssen wir neu planen.',
          gloss: bi(
            'First of all we will look at the figures. The schedule is very tight, though. So we have to re-plan.',
            'Първо ще погледнем числата. Графикът обаче е много стегнат. Следователно трябва да планираме наново.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Three connectors, three jobs, and not one new rule: each takes the first slot, so the verb follows immediately. You have been doing that since Pre-A1.',
            'Три свързващи думи, три роли и нито едно ново правило: всяка заема първия слот, затова глаголът идва веднага след нея. Правиш го още от Pre-A1.',
          ),
        },
      ],
    },
    {
      id: 'b2u1l2-vocab',
      kind: 'vocabulary',
      title: bi('Meeting words', 'Думи за работна среща'),
      vocabIds: [
        'v-der-vorschlag',
        'v-vorschlagen',
        'v-der-einwand',
        'v-ablehnen',
        'v-die-tagesordnung',
        'v-sich-einigen',
        'v-der-zeitplan',
        'v-allerdings',
        'v-dennoch',
        'v-folglich',
      ],
      blocks: [],
    },
    {
      id: 'b2u1l2-grammar',
      kind: 'grammar',
      title: bi('The family in a suit', 'Семейството с костюм'),
      blocks: [],
      grammarId: 'g-konnektoren-b2',
    },
    {
      id: 'b2u1l2-examples',
      kind: 'examples',
      title: bi('Four things you will need to say', 'Четири неща, които ще ти трябват'),
      blocks: [
        {
          t: 'de',
          de: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
          gloss: bi('I would suggest that we check the figures first.', 'Бих предложил първо да проверим числата.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Da habe ich einen Einwand: der Zeitplan ist zu eng.',
          gloss: bi('I have an objection there: the schedule is too tight.', 'Тук имам възражение: графикът е твърде стегнат.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wir haben uns auf einen neuen Termin geeinigt.',
          gloss: bi('We agreed on a new date.', 'Споразумяхме се за нова дата.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Abschließend fasse ich die Ergebnisse kurz zusammen.',
          gloss: bi('To close, I will briefly summarise the results.', 'В заключение ще обобщя накратко резултатите.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u1l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('zunächst opens, außerdem adds, allerdings concedes, dennoch insists, folglich concludes.', 'zunächst открива, außerdem добавя, allerdings отстъпва, dennoch настоява, folglich заключава.'),
            bi('Connector in first position → verb second, subject third.', 'Свързваща дума на първо място → глагол втори, подлог трети.'),
            bi('No comma after allerdings, dennoch or folglich.', 'След allerdings, dennoch и folglich не се пише запетая.'),
            bi('Ich würde vorschlagen, dass … is the polite way to take the floor.', 'Ich würde vorschlagen, dass … е учтивият начин да вземеш думата.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u1l2-ex1', bi('Which connector?', 'Коя свързваща дума?'), [
        {
          prompt: bi('opening the meeting', 'откриване на срещата'),
          scaffold: '___ schauen wir uns die Zahlen an.',
          answer: 'Zunächst',
          shape: 'word',
          hints: [bi('First of all.', 'Най-напред.')],
        },
        {
          prompt: bi('conceding a problem', 'признаване на проблем'),
          scaffold: '___ ist der Zeitplan sehr eng.',
          answer: 'Allerdings',
          shape: 'word',
          hints: [bi('However — and note the verb right behind it.', 'Обаче — и виж глагола точно зад нея.')],
        },
        {
          prompt: bi('drawing a conclusion', 'извеждане на извод'),
          scaffold: '___ müssen wir den Plan ändern.',
          answer: 'Folglich',
          shape: 'word',
          hints: [bi('The formal deshalb.', 'Официалното deshalb.')],
        },
        {
          prompt: bi('insisting in spite of it', 'настояване въпреки всичко'),
          scaffold: '___ halten wir an dem Termin fest.',
          answer: 'Dennoch',
          shape: 'word',
          hints: [bi('The written trotzdem.', 'Писменото trotzdem.')],
        },
      ]),
    ),
    b2(
      wordOrder('b2u1l2-ex2', bi('Keep the verb second', 'Дръж глагола на второ място'), [
        {
          prompt: bi('However, the schedule is very tight.', 'Графикът обаче е много стегнат.'),
          bank: ['Allerdings', 'ist', 'der', 'Zeitplan', 'sehr', 'eng.'],
          answer: 'Allerdings ist der Zeitplan sehr eng.',
          hints: [bi('Connector, verb, subject.', 'Свързваща дума, глагол, подлог.')],
        },
        {
          prompt: bi('Consequently the report has to be rewritten.', 'Следователно докладът трябва да бъде пренаписан.'),
          bank: ['Folglich', 'muss', 'der', 'Bericht', 'neu', 'geschrieben', 'werden.'],
          answer: 'Folglich muss der Bericht neu geschrieben werden.',
          hints: [bi('A passive with a modal, inside a connector sentence.', 'Страдателен залог с модален глагол, вътре в изречение със свързваща дума.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u1l2-ex3',
        bi('Say it in the meeting', 'Кажи го на срещата'),
        [
          {
            prompt: bi('I would suggest that we check the figures first.', 'Бих предложил първо да проверим числата.'),
            answer: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
            alternatives: ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
            reviewTargets: ['p-vorschlag-dass', 'v-vorschlagen'],
            hints: [],
            traps: [
              {
                answer: 'Ich würde vorschlagen, dass wir prüfen zuerst die Zahlen.',
                category: 'word-order',
                feedback: bi(
                  'dass sends the verb to the end of its clause: …, dass wir zuerst die Zahlen prüfen.',
                  'dass изпраща глагола в края на своето изречение: …, dass wir zuerst die Zahlen prüfen.',
                ),
              },
            ],
          },
          {
            prompt: bi('However, the schedule is very tight.', 'Графикът обаче е много стегнат.'),
            answer: 'Allerdings ist der Zeitplan sehr eng.',
            reviewTargets: ['v-allerdings', 'v-der-zeitplan'],
            hints: [],
            traps: [
              {
                answer: 'Allerdings der Zeitplan ist sehr eng.',
                category: 'word-order',
                feedback: bi(
                  'Allerdings fills the first slot on its own, so the verb comes second: Allerdings ist der Zeitplan sehr eng. English writes "However, the schedule is…" — German cannot.',
                  'Allerdings само по себе си заема първия слот, затова глаголът е втори: Allerdings ist der Zeitplan sehr eng. Английският пише „However, the schedule is…“ — немският не може.',
                ),
              },
            ],
          },
          {
            prompt: bi('The proposal was rejected.', 'Предложението беше отхвърлено.'),
            answer: 'Der Vorschlag wurde abgelehnt.',
            reviewTargets: ['v-der-vorschlag', 'v-ablehnen', 'p-passiv-praeteritum'],
            hints: [],
          },
          {
            prompt: bi('We agreed on a new date.', 'Споразумяхме се за нова дата.'),
            answer: 'Wir haben uns auf einen neuen Termin geeinigt.',
            reviewTargets: ['v-sich-einigen'],
            hints: [bi('sich einigen auf + accusative.', 'sich einigen auf + винителен падеж.')],
          },
          {
            prompt: bi('The item is not on the agenda.', 'Точката не е в дневния ред.'),
            answer: 'Der Punkt steht nicht auf der Tagesordnung.',
            reviewTargets: ['v-die-tagesordnung'],
            hints: [],
          },
        ],
        ['g-konnektoren-b2'],
      ),
    ),
    b2(
      typeIt(
        'b2u1l2-ex4',
        bi('Objecting without being rude', 'Да възразиш, без да си груб'),
        [
          {
            prompt: bi('If I understand correctly, this is about the schedule.', 'Ако разбирам правилно, става дума за графика.'),
            answer: 'Wenn ich das richtig verstehe, geht es um den Zeitplan.',
            reviewTargets: ['v-der-zeitplan'],
            hints: [
              bi(
                'The wenn-clause is first, so the main verb comes straight after the comma.',
                'Изречението с wenn е първо, затова главният глагол идва веднага след запетаята.',
              ),
            ],
          },
          {
            prompt: bi('I have an objection to this plan.', 'Имам възражение срещу този план.'),
            answer: 'Gegen diesen Plan habe ich einen Einwand.',
            alternatives: ['Ich habe einen Einwand gegen diesen Plan.'],
            reviewTargets: ['v-der-einwand'],
            hints: [],
          },
          {
            prompt: bi('Even so, we are sticking to the deadline.', 'Въпреки това се придържаме към срока.'),
            answer: 'Dennoch halten wir an der Frist fest.',
            reviewTargets: ['v-dennoch', 'v-die-frist'],
            hints: [],
          },
        ],
        ['g-konnektoren-b2'],
      ),
    ),
    b2(
      dictation('b2u1l2-ex5', bi('Listening in the meeting', 'Слушане на срещата'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Allerdings ist der Zeitplan sehr eng.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
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
        typeIt('b2u1l2-m1', bi('Four moves in a meeting', 'Четири хода на среща'), [
          {
            prompt: bi('I would suggest that we check the figures first.', 'Бих предложил първо да проверим числата.'),
            answer: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
            alternatives: ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
            hints: [],
          },
          {
            prompt: bi('However, the schedule is very tight.', 'Графикът обаче е много стегнат.'),
            answer: 'Allerdings ist der Zeitplan sehr eng.',
            hints: [],
          },
          {
            prompt: bi('Consequently the report has to be rewritten.', 'Следователно докладът трябва да бъде пренаписан.'),
            answer: 'Folglich muss der Bericht neu geschrieben werden.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — the nouns a report is built from
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b2-u1-l3',
  unitId: 'b2-u1',
  level: 'b2',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The carrying out of the project', 'Провеждането на проекта'),
  objective: bi(
    'After this lesson you can write the way a German report is written: verbs turned into nouns, joined with the genitive, with the actor out of the sentence.',
    'След този урок можеш да пишеш така, както се пише немски доклад: глаголи, превърнати в съществителни, свързани с родителен падеж, с изнесено извън изречението действащо лице.',
  ),
  outcomes: [
    bi('I can turn a verb into its -ung noun.', 'Мога да превърна глагол в съществително на -ung.'),
    bi('I know every -ung is feminine and every infinitive-noun is neuter.', 'Знам, че всяко -ung е от женски род, а всеки инфинитив-съществително — от среден.'),
    bi('I join the noun to its object with the genitive, not with von.', 'Свързвам съществителното с обекта му чрез родителен падеж, а не с von.'),
    bi('I can write two sentences of a status report.', 'Мога да напиша две изречения от работен отчет.'),
  ],
  vocabIds: [
    'v-die-durchfuehrung',
    'v-die-umsetzung',
    'v-die-entscheidung',
    'v-die-anforderung',
    'v-die-zusammenarbeit',
    'v-beschliessen',
  ],
  grammarIds: ['g-nominalisierung'],
  sections: [
    {
      id: 'b2u1l3-intro',
      kind: 'intro',
      title: bi('The verb becomes the subject', 'Глаголът става подлог'),
      blocks: [
        {
          t: 'contrast',
          de: 'Wir haben das Projekt durchgeführt. Es hat drei Monate gedauert.',
          other: bi(
            'Two sentences, a person in the first one. Perfectly good spoken German.',
            'Две изречения, в първото има човек. Съвсем добър говорим немски.',
          ),
        },
        {
          t: 'de',
          de: 'Die Durchführung des Projekts dauerte drei Monate.',
          gloss: bi('Carrying the project out took three months.', 'Провеждането на проекта отне три месеца.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'One sentence, no people, and the verb has become the thing the sentence is about. That move is most of what separates a report from an email.',
            'Едно изречение, без хора, и глаголът се е превърнал в това, за което е изречението. Точно този ход отличава доклада от имейла.',
          ),
        },
      ],
    },
    {
      id: 'b2u1l3-vocab',
      kind: 'vocabulary',
      title: bi('Nouns that were verbs', 'Съществителни, които са били глаголи'),
      vocabIds: [
        'v-die-durchfuehrung',
        'v-die-umsetzung',
        'v-die-entscheidung',
        'v-die-anforderung',
        'v-die-zusammenarbeit',
        'v-beschliessen',
      ],
      blocks: [],
    },
    {
      id: 'b2u1l3-grammar',
      kind: 'grammar',
      title: bi('-ung, and what comes after it', '-ung и какво идва след него'),
      blocks: [],
      grammarId: 'g-nominalisierung',
    },
    {
      id: 'b2u1l3-examples',
      kind: 'examples',
      title: bi('A status report, in four lines', 'Работен отчет в четири реда'),
      blocks: [
        {
          t: 'de',
          de: 'Die Umsetzung der Anforderungen dauert länger als geplant.',
          gloss: bi(
            'Implementing the requirements is taking longer than planned.',
            'Реализацията на изискванията отнема повече време от планираното.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Entscheidung wurde in der Besprechung getroffen.',
          gloss: bi('The decision was taken in the meeting.', 'Решението беше взето на срещата.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Nach der Prüfung des Berichts treffen wir eine Entscheidung.',
          gloss: bi('After checking the report we will take a decision.', 'След проверката на доклада ще вземем решение.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Vielen Dank für die gute Zusammenarbeit.',
          gloss: bi('Many thanks for the good cooperation.', 'Благодаря за доброто сътрудничество.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u1l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('durchführen → die Durchführung. The verb keeps its meaning and loses its actor.', 'durchführen → die Durchführung. Глаголът пази значението си и губи действащото лице.'),
            bi('Every -ung noun is feminine. Every infinitive used as a noun is neuter.', 'Всяко съществително на -ung е от женски род. Всеки инфинитив като съществително е от среден.'),
            bi('The object becomes a genitive: die Durchführung des Projekts.', 'Допълнението минава в родителен падеж: die Durchführung des Projekts.'),
            bi('eine Entscheidung wird getroffen, not gemacht.', 'eine Entscheidung wird getroffen, а не gemacht.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u1l3-ex1', bi('From verb to noun', 'От глагол към съществително'), [
        {
          prompt: bi('durchführen → the noun', 'durchführen → съществителното'),
          scaffold: 'die ___ des Projekts',
          answer: 'Durchführung',
          shape: 'word',
          hints: [bi('Take the stem and add -ung.', 'Вземи основата и добави -ung.')],
        },
        {
          prompt: bi('umsetzen → the noun', 'umsetzen → съществителното'),
          scaffold: 'die ___ der Idee',
          answer: 'Umsetzung',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('entscheiden → the noun', 'entscheiden → съществителното'),
          scaffold: 'die ___ des Teams',
          answer: 'Entscheidung',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the article for any -ung noun', 'членът за всяко съществително на -ung'),
          scaffold: '___ Anforderung ist neu.',
          answer: 'Die',
          shape: 'word',
          hints: [bi('Every single one of them.', 'Всички до едно.')],
        },
      ]),
    ),
    b2(
      fillBlank('b2u1l3-ex2', bi('The genitive after the noun', 'Родителен падеж след съществителното'), [
        {
          prompt: bi('das Projekt — the carrying out of the project', 'das Projekt — провеждането на проекта'),
          scaffold: 'die Durchführung ___ Projekts',
          answer: 'des',
          shape: 'word',
          hints: [bi('Neuter genitive.', 'Среден род, родителен падеж.')],
        },
        {
          prompt: bi('die Idee — the implementation of the idea', 'die Idee — реализацията на идеята'),
          scaffold: 'die Umsetzung ___ Idee',
          answer: 'der',
          shape: 'word',
          hints: [bi('Feminine genitive.', 'Женски род, родителен падеж.')],
        },
        {
          prompt: bi('der Bericht — after checking the report', 'der Bericht — след проверката на доклада'),
          scaffold: 'nach der Prüfung ___ Berichts',
          answer: 'des',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u1l3-ex3',
        bi('Write it as a report would', 'Напиши го както би го написал докладът'),
        [
          {
            prompt: bi('Carrying the project out takes three months.', 'Провеждането на проекта отнема три месеца.'),
            answer: 'Die Durchführung des Projekts dauert drei Monate.',
            reviewTargets: ['p-nominalisierung-genitiv', 'v-die-durchfuehrung'],
            hints: [],
            traps: [
              {
                answer: 'Die Durchführung von dem Projekt dauert drei Monate.',
                category: 'case',
                feedback: bi(
                  'von + dative is what people say out loud; a report uses the genitive: die Durchführung des Projekts. Same register rule as the genitive at B1.',
                  'von + дателен падеж е за говоримия език; в доклад се използва родителен: die Durchführung des Projekts. Същото правило за регистъра като при родителния падеж в B1.',
                ),
              },
            ],
          },
          {
            prompt: bi('Implementing the requirements is taking longer than planned.', 'Реализацията на изискванията отнема повече време от планираното.'),
            answer: 'Die Umsetzung der Anforderungen dauert länger als geplant.',
            reviewTargets: ['v-die-umsetzung', 'v-die-anforderung'],
            hints: [],
          },
          {
            prompt: bi('The decision was taken in the meeting.', 'Решението беше взето на срещата.'),
            answer: 'Die Entscheidung wurde in der Besprechung getroffen.',
            reviewTargets: ['v-die-entscheidung', 'p-passiv-praeteritum'],
            hints: [],
            traps: [
              {
                answer: 'Die Entscheidung wurde in der Besprechung gemacht.',
                category: 'vocabulary',
                feedback: bi(
                  'German takes a decision with treffen: eine Entscheidung treffen. machen does not collocate here.',
                  'Немският „среща“ решението: eine Entscheidung treffen. machen не се съчетава тук.',
                ),
              },
            ],
          },
          {
            prompt: bi('The team decided to change the schedule.', 'Екипът реши да промени графика.'),
            answer: 'Das Team hat beschlossen, den Zeitplan zu ändern.',
            reviewTargets: ['v-beschliessen', 'v-der-zeitplan'],
            hints: [bi('zu + infinitive, after a comma.', 'zu + инфинитив, след запетая.')],
          },
          {
            prompt: bi('Many thanks for the good cooperation.', 'Благодаря за доброто сътрудничество.'),
            answer: 'Vielen Dank für die gute Zusammenarbeit.',
            reviewTargets: ['v-die-zusammenarbeit'],
            hints: [],
          },
        ],
        ['g-nominalisierung'],
      ),
    ),
    b2(
      freeWriting('b2u1l3-ex4', bi('Two lines of a status report', 'Два реда от работен отчет'), [
        {
          prompt: bi(
            'Write two sentences reporting on a project: one saying what was done (passive), one built on a -ung noun with a genitive behind it.',
            'Напиши две изречения, които отчитат проект: едното казва какво е направено (страдателен залог), другото е построено върху съществително на -ung с родителен падеж след него.',
          ),
          answer:
            'Der Bericht wurde rechtzeitig eingereicht. Die Umsetzung der Anforderungen dauert länger als geplant.',
          requiredTokens: ['wurde', 'Umsetzung'],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('b2u1l3-ex5', bi('Hearing a genitive', 'Да чуеш родителен падеж'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Durchführung des Projekts dauert drei Monate.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Nach der Prüfung des Berichts treffen wir eine Entscheidung.',
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
        typeIt('b2u1l3-m1', bi('Report register', 'Регистър на доклада'), [
          {
            prompt: bi('Carrying the project out takes three months.', 'Провеждането на проекта отнема три месеца.'),
            answer: 'Die Durchführung des Projekts dauert drei Monate.',
            hints: [],
          },
          {
            prompt: bi('The decision was taken in the meeting.', 'Решението беше взето на срещата.'),
            answer: 'Die Entscheidung wurde in der Besprechung getroffen.',
            hints: [],
          },
        ]),
      ),
      b2(
        fillBlank('b2u1l3-m2', bi('The ending and the case', 'Окончанието и падежът'), [
          {
            prompt: bi('umsetzen → the noun', 'umsetzen → съществителното'),
            scaffold: 'die ___ der Idee',
            answer: 'Umsetzung',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('das Projekt — genitive', 'das Projekt — родителен падеж'),
            scaffold: 'die Durchführung ___ Projekts',
            answer: 'des',
            shape: 'word',
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
  id: 'cp-b2u1',
  scope: 'unit',
  targetId: 'b2-u1',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Checkpoint: at work', 'Проверка: на работа'),
  description: bi(
    'The passive in every tense, the event against the state, the connectors of a meeting, and the nouns a report is built from.',
    'Страдателен залог във всички времена, събитие срещу състояние, свързващите думи на срещата и съществителните, от които е изграден докладът.',
  ),
  exercises: [
    b2(
      fillBlank('cp-b2u1-1', bi('werden, sein, worden', 'werden, sein, worden'), [
        {
          prompt: bi('yesterday, in writing', 'вчера, в писмен вид'),
          scaffold: 'Der Bericht ___ gestern eingereicht.',
          answer: 'wurde',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the Perfekt passive', 'перфект в страдателен залог'),
          scaffold: 'Der Auftrag ist bearbeitet ___.',
          answer: 'worden',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a finished state', 'завършено състояние'),
          scaffold: 'Der Auftrag ___ erledigt.',
          answer: 'ist',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('after a modal', 'след модален глагол'),
          scaffold: 'Die Besprechung musste verschoben ___.',
          answer: 'werden',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u1-2', bi('Report on the work', 'Отчети работата'), [
        {
          prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
          answer: 'Der Bericht wurde gestern eingereicht.',
          hints: [],
        },
        {
          prompt: bi('The order was processed yesterday. (spoken)', 'Поръчката беше обработена вчера. (говоримо)'),
          answer: 'Der Auftrag ist gestern bearbeitet worden.',
          hints: [],
        },
        {
          prompt: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
          answer: 'Die Besprechung musste verschoben werden.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u1-3', bi('In the meeting', 'На срещата'), [
        {
          prompt: bi('I would suggest that we check the figures first.', 'Бих предложил първо да проверим числата.'),
          answer: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
          alternatives: ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
          hints: [],
        },
        {
          prompt: bi('However, the schedule is very tight.', 'Графикът обаче е много стегнат.'),
          answer: 'Allerdings ist der Zeitplan sehr eng.',
          hints: [],
        },
        {
          prompt: bi('The proposal was rejected.', 'Предложението беше отхвърлено.'),
          answer: 'Der Vorschlag wurde abgelehnt.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u1-4', bi('In the report', 'В доклада'), [
        {
          prompt: bi('Carrying the project out takes three months.', 'Провеждането на проекта отнема три месеца.'),
          answer: 'Die Durchführung des Projekts dauert drei Monate.',
          hints: [],
        },
        {
          prompt: bi('The decision was taken in the meeting.', 'Решението беше взето на срещата.'),
          answer: 'Die Entscheidung wurde in der Besprechung getroffen.',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('cp-b2u1-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der Auftrag ist gestern bearbeitet worden.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Durchführung des Projekts dauert drei Monate.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B2_UNIT_1: Unit = {
  id: 'b2-u1',
  level: 'b2',
  order: 1,
  status: 'available',
  title: bi('At work: meetings and projects', 'На работа: срещи и проекти'),
  summary: bi(
    'The passive finished off — every tense, and the event against the state — the connectors a meeting is structured with, and the nominalisation that professional German is written in.',
    'Довършен страдателен залог — всички времена и събитие срещу състояние — свързващите думи, с които се структурира среща, и номинализацията, с която се пише професионален немски.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B2_U1_PATTERNS = PATTERNS;
