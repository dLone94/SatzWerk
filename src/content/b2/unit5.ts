import { bi, dictation, fillBlank, freeWriting, typeIt, wordOrder } from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B2 Unit 5 — Natural spoken German.
 *
 * The last unit of the course, and the one that admits what the previous
 * eighty lessons could not: a learner who has done all of them can read a
 * rental contract and still lose the thread at a lunch table.
 *
 * Not because the grammar changes — it does not — but because speech swaps
 * words, deletes sounds and rearranges sentences that writing keeps intact.
 * All three lessons are therefore taught **for listening first**, and every
 * exercise asks the learner to produce the *full* form from the spoken one
 * rather than the other way round. Nobody has ever been thought rude for
 * saying *bekommen*; failing to understand *Haste mal kurz?* stops a
 * conversation dead.
 *
 * That framing is also why this unit comes after the formal one. Unit 4 was
 * about a register a learner must produce and will rarely hear; this is about
 * a register they will hear constantly and may never need to produce. Saying
 * that plainly is more useful than pretending both are symmetrical.
 *
 * The paths diverge most in lesson 3. English drops subjects in exactly this
 * casual way ("Didn't see it"), so that instinct transfers — but its tag
 * questions are built by rule, agreeing with verb and subject, where German
 * has one invariant *ne?*. Bulgarian has the invariant tag already („нали?“)
 * and moves constituents freely, so the afterthought is familiar; what it
 * lacks is the verb-second frame the deletions happen inside.
 */

/** Everything in this file is B2. */
const b2 = (ex: Exercise): Exercise => ({ ...ex, level: 'b2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-kriegen-frage',
    template: 'Hast du ___ gekriegt?',
    example: 'Hast du meine Nachricht gekriegt?',
    gloss: bi('Did you get my message?', 'Получи ли съобщението ми?'),
    level: 'b2',
    grammarIds: ['g-umgangssprache'],
  },
  {
    id: 'p-klappen',
    template: 'Hat ___ geklappt?',
    example: 'Hat mit dem Termin alles geklappt?',
    gloss: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
    level: 'b2',
    grammarIds: ['g-umgangssprache'],
  },
  {
    id: 'p-lust-haben',
    template: 'Hast du Lust, ___ zu ___?',
    example: 'Hast du Lust, morgen vorbeizukommen?',
    gloss: bi('Do you fancy coming round tomorrow?', 'Имаш ли желание да наминеш утре?'),
    level: 'b2',
    grammarIds: ['g-umgangssprache'],
  },
  {
    id: 'p-tag-ne',
    template: '___, ne?',
    example: 'Das machen wir morgen, ne?',
    gloss: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
    level: 'b2',
    grammarIds: ['g-gesprochene-syntax'],
  },
];

/* ================================================================== *
 * Lesson 1 — the words that replace the words you know
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b2-u5-l1',
  unitId: 'b2-u5',
  level: 'b2',
  order: 1,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('Did you get my message?', 'Получи ли съобщението ми?'),
  objective: bi(
    'After this lesson you recognise the everyday verbs that quietly replace the ones the course taught you, and you know which room each belongs in.',
    'След този урок разпознаваш всекидневните глаголи, които тихо заместват научените в курса, и знаеш кой от тях за коя обстановка е.',
  ),
  outcomes: [
    bi('I understand kriegen, gucken, klappen and hinkriegen.', 'Разбирам kriegen, gucken, klappen и hinkriegen.'),
    bi('I can give the textbook equivalent of each.', 'Мога да посоча учебникарското съответствие на всеки от тях.'),
    bi('I keep them out of formal writing.', 'Не ги използвам в официален писмен текст.'),
    bi('I am not thrown when somebody uses them at speed.', 'Не се обърквам, когато някой ги използва бързо.'),
  ],
  vocabIds: ['v-kriegen', 'v-gucken', 'v-klappen', 'v-hinkriegen', 'v-nerven'],
  grammarIds: ['g-umgangssprache'],
  sections: [
    {
      id: 'b2u5l1-intro',
      kind: 'intro',
      title: bi('The swap nobody announces', 'Замяната, която никой не обявява'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You have known bekommen since A1. You will rarely hear it.',
            'Знаеш bekommen още от A1. Рядко ще го чуеш.',
          ),
        },
        {
          t: 'contrast',
          de: 'Hast du meine Nachricht bekommen?',
          other: bi(
            'Correct, and the version a textbook prints.',
            'Правилно е и точно така го печата учебникът.',
          ),
        },
        {
          t: 'de',
          de: 'Hast du meine Nachricht gekriegt?',
          gloss: bi('Did you get my message?', 'Получи ли съобщението ми?'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Same grammar, same meaning, different word — and the second one is what you will actually hear. This lesson is about hearing it, not about switching.',
            'Същата граматика, същото значение, друга дума — и точно втората ще чуваш в действителност. Този урок е за това да я чуваш, а не да сменяш своята.',
          ),
        },
      ],
    },
    {
      id: 'b2u5l1-vocab',
      kind: 'vocabulary',
      title: bi('Five words you will hear today', 'Пет думи, които ще чуеш още днес'),
      vocabIds: ['v-kriegen', 'v-gucken', 'v-klappen', 'v-hinkriegen', 'v-nerven'],
      blocks: [],
    },
    {
      id: 'b2u5l1-grammar',
      kind: 'grammar',
      title: bi('Which word, which room', 'Коя дума, коя обстановка'),
      blocks: [],
      grammarId: 'g-umgangssprache',
    },
    {
      id: 'b2u5l1-examples',
      kind: 'examples',
      title: bi('An ordinary afternoon', 'Един обикновен следобед'),
      blocks: [
        {
          t: 'de',
          de: 'Kriegst du das bis morgen hin?',
          gloss: bi('Can you manage that by tomorrow?', 'Ще се справиш ли с това до утре?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich guck mal kurz, ob das geht.',
          gloss: bi('I will just have a quick look at whether that works.', 'Само ще погледна набързо дали става.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Hat mit dem Termin alles geklappt?',
          gloss: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das nervt mich total.',
          gloss: bi('That really annoys me.', 'Това страшно ме дразни.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u5l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('kriegen = bekommen. gucken = sehen. klappen = funktionieren.', 'kriegen = bekommen. gucken = sehen. klappen = funktionieren.'),
            bi('hinkriegen splits: Kriegst du das hin?', 'hinkriegen се разделя: Kriegst du das hin?'),
            bi('None of them belongs in a formal email.', 'Нито един от тях не е за официален имейл.'),
            bi('Understanding them is compulsory; using them is optional.', 'Разбирането им е задължително; употребата — по избор.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u5l1-ex1', bi('Give the textbook word', 'Посочи учебникарската дума'), [
        {
          prompt: bi('kriegen — the formal equivalent', 'kriegen — официалното съответствие'),
          scaffold: 'Hast du meine Nachricht ___?',
          answer: 'bekommen',
          shape: 'word',
          hints: [bi('The word you learnt at A1.', 'Думата, която научи в A1.')],
        },
        {
          prompt: bi('gucken — the neutral equivalent', 'gucken — неутралното съответствие'),
          scaffold: 'Ich ___ mal kurz, ob das geht.',
          answer: 'schaue',
          alternatives: ['sehe'],
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('klappen — for a machine', 'klappen — за машина'),
          scaffold: 'Der Drucker ___ wieder nicht.',
          answer: 'funktioniert',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u5l1-ex2',
        bi('Say it the way people say it', 'Кажи го както го казват хората'),
        [
          {
            prompt: bi('Did you get my message?', 'Получи ли съобщението ми?'),
            answer: 'Hast du meine Nachricht gekriegt?',
            alternatives: ['Hast du meine Nachricht bekommen?'],
            reviewTargets: ['p-kriegen-frage', 'v-kriegen'],
            hints: [],
          },
          {
            prompt: bi('Can you manage that by tomorrow?', 'Ще се справиш ли с това до утре?'),
            answer: 'Kriegst du das bis morgen hin?',
            reviewTargets: ['v-hinkriegen'],
            hints: [bi('hinkriegen splits, so hin goes last.', 'hinkriegen се разделя, затова hin отива накрая.')],
            traps: [
              {
                answer: 'Hinkriegst du das bis morgen?',
                category: 'word-order',
                feedback: bi(
                  'hinkriegen is separable: the prefix goes to the end. Kriegst du das bis morgen hin?',
                  'hinkriegen е разделим: представката отива в края. Kriegst du das bis morgen hin?',
                ),
              },
            ],
          },
          {
            prompt: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
            answer: 'Hat mit dem Termin alles geklappt?',
            reviewTargets: ['p-klappen', 'v-klappen', 'v-termin'],
            hints: [],
          },
          {
            prompt: bi('That really annoys me.', 'Това страшно ме дразни.'),
            answer: 'Das nervt mich total.',
            reviewTargets: ['v-nerven', 'v-total'],
            hints: [],
          },
        ],
        ['g-umgangssprache'],
      ),
    ),
    b2(
      typeIt(
        'b2u5l1-ex3',
        bi('Now put it in the email', 'Сега го сложи в имейла'),
        [
          {
            prompt: bi(
              'Write the same question for a formal email: "Did you receive my message?"',
              'Напиши същия въпрос за официален имейл: „Получихте ли съобщението ми?“',
            ),
            answer: 'Haben Sie meine Nachricht erhalten?',
            alternatives: ['Haben Sie meine Nachricht bekommen?'],
            hints: [bi('Sie, and the formal verb.', 'Sie и официалният глагол.')],
            traps: [
              {
                answer: 'Haben Sie meine Nachricht gekriegt?',
                category: 'vocabulary',
                feedback: bi(
                  'kriegen is spoken German. A formal email uses erhalten or bekommen.',
                  'kriegen е говорим немски. Официалният имейл използва erhalten или bekommen.',
                ),
              },
            ],
          },
        ],
        ['g-umgangssprache'],
      ),
    ),
    b2(
      dictation('b2u5l1-ex4', bi('Listening at speed', 'Слушане с темпо'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Hast du meine Nachricht gekriegt?',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Kriegst du das bis morgen hin?',
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
        typeIt('b2u5l1-m1', bi('Spoken, then written', 'Говоримо, после писмено'), [
          {
            prompt: bi('Did you get my message?', 'Получи ли съобщението ми?'),
            answer: 'Hast du meine Nachricht gekriegt?',
            alternatives: ['Hast du meine Nachricht bekommen?'],
            hints: [],
          },
          {
            prompt: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
            answer: 'Hat mit dem Termin alles geklappt?',
            hints: [],
          },
          {
            prompt: bi('For an email: Did you receive my message?', 'За имейл: Получихте ли съобщението ми?'),
            answer: 'Haben Sie meine Nachricht erhalten?',
            alternatives: ['Haben Sie meine Nachricht bekommen?'],
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — decoding the run-together bits
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b2-u5-l2',
  unitId: 'b2-u5',
  level: 'b2',
  order: 2,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('Got a second?', 'Имаш ли момент?'),
  objective: bi(
    'After this lesson you can hear a contracted German sentence and write out what it actually is.',
    'След този урок можеш да чуеш слято немско изречение и да го запишеш в пълния му вид.',
  ),
  outcomes: [
    bi('I can expand haste, kannste and gibt’s.', 'Мога да разгърна haste, kannste и gibt’s.'),
    bi('I recognise ’ne and ’nen as eine and einen.', 'Разпознавам ’ne и ’nen като eine и einen.'),
    bi('I know a dropped -e is not a mistake.', 'Знам, че изпуснатото -e не е грешка.'),
    bi('I can use the fixed phrases of ordinary arrangements.', 'Мога да използвам устойчивите изрази за всекидневни уговорки.'),
  ],
  vocabIds: [
    'v-bescheid-sagen',
    'v-die-ahnung',
    'v-die-lust',
    'v-sich-melden',
    'v-vorbeikommen',
    'v-der-feierabend',
  ],
  grammarIds: ['g-reduktion'],
  sections: [
    {
      id: 'b2u5l2-intro',
      kind: 'intro',
      title: bi('One sound, four words', 'Един звук, четири думи'),
      blocks: [
        {
          t: 'de',
          de: 'Haste mal kurz?',
          gloss: bi('Got a second?', 'Имаш ли момент?'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'That is Hast du mal kurz — four words, said as two. Nothing about it is careless, regional or wrong: every German does it and a textbook simply never prints it.',
            'Това е Hast du mal kurz — четири думи, изречени като две. В него няма нищо немарливо, диалектно или погрешно: всеки германец го прави, а учебникът просто не го печата.',
          ),
        },
      ],
    },
    {
      id: 'b2u5l2-vocab',
      kind: 'vocabulary',
      title: bi('Arrangements between people', 'Уговорки между хора'),
      vocabIds: [
        'v-bescheid-sagen',
        'v-die-ahnung',
        'v-die-lust',
        'v-sich-melden',
        'v-vorbeikommen',
        'v-der-feierabend',
      ],
      blocks: [],
    },
    {
      id: 'b2u5l2-grammar',
      kind: 'grammar',
      title: bi('What speech glues together', 'Какво слепва речта'),
      blocks: [],
      grammarId: 'g-reduktion',
    },
    {
      id: 'b2u5l2-examples',
      kind: 'examples',
      title: bi('Four things you will hear this week', 'Четири неща, които ще чуеш тази седмица'),
      blocks: [
        {
          t: 'de',
          de: 'Sag mir einfach Bescheid, wenn du so weit bist.',
          gloss: bi('Just let me know when you are ready.', 'Просто ми кажи, като си готов.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Keine Ahnung, ob das klappt.',
          gloss: bi('No idea whether that will work out.', 'Нямам представа дали ще се получи.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Hast du Lust, morgen vorbeizukommen?',
          gloss: bi('Do you fancy coming round tomorrow?', 'Имаш ли желание да наминеш утре?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich melde mich nach Feierabend.',
          gloss: bi('I will be in touch after work.', 'Ще се обадя след работа.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u5l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Haste = Hast du. Kannste = Kannst du.', 'Haste = Hast du. Kannste = Kannst du.'),
            bi('’ne = eine, ’nen = einen, gibt’s = gibt es.', '’ne = eine, ’nen = einen, gibt’s = gibt es.'),
            bi('Ich hab and ich geh are normal speech, not errors.', 'Ich hab и ich geh са нормална реч, а не грешки.'),
            bi('Hear them; write the full forms.', 'Чувай ги; пиши пълните форми.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      typeIt(
        'b2u5l2-ex1',
        bi('Write out what was actually said', 'Запиши какво всъщност беше казано'),
        [
          {
            prompt: bi('You hear: "Haste mal kurz?" — write the full form.', 'Чуваш: „Haste mal kurz?“ — напиши пълната форма.'),
            answer: 'Hast du mal kurz?',
            hints: [bi('Two words hide in haste.', 'В haste се крият две думи.')],
          },
          {
            prompt: bi('You hear: "Kannste mir helfen?" — write the full form.', 'Чуваш: „Kannste mir helfen?“ — напиши пълната форма.'),
            answer: 'Kannst du mir helfen?',
            hints: [],
          },
          {
            prompt: bi('You hear: "Gibt’s noch Kaffee?" — write the full form.', 'Чуваш: „Gibt’s noch Kaffee?“ — напиши пълната форма.'),
            answer: 'Gibt es noch Kaffee?',
            reviewTargets: ['v-kaffee'],
            hints: [],
          },
          {
            prompt: bi('You hear: "Ich hab ’ne Frage." — write the full form.', 'Чуваш: „Ich hab ’ne Frage.“ — напиши пълната форма.'),
            answer: 'Ich habe eine Frage.',
            hints: [bi('Two reductions in one short sentence.', 'Две съкращения в едно кратко изречение.')],
          },
        ],
        ['g-reduktion'],
      ),
    ),
    b2(
      fillBlank('b2u5l2-ex2', bi('The fixed phrases', 'Устойчивите изрази'), [
        {
          prompt: bi('let me know', 'кажи ми'),
          scaffold: 'Sag mir einfach ___, wenn du so weit bist.',
          answer: 'Bescheid',
          shape: 'word',
          hints: [bi('Capital letter, and it never changes.', 'С главна буква и никога не се променя.')],
        },
        {
          prompt: bi('no idea', 'нямам представа'),
          scaffold: 'Keine ___, ob das klappt.',
          answer: 'Ahnung',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('do you fancy …', 'имаш ли желание …'),
          scaffold: 'Hast du ___, morgen vorbeizukommen?',
          answer: 'Lust',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u5l2-ex3',
        bi('Make the arrangement', 'Направи уговорката'),
        [
          {
            prompt: bi('Just let me know when you are ready.', 'Просто ми кажи, като си готов.'),
            answer: 'Sag mir einfach Bescheid, wenn du so weit bist.',
            reviewTargets: ['v-bescheid-sagen'],
            hints: [],
          },
          {
            prompt: bi('No idea whether that will work out.', 'Нямам представа дали ще се получи.'),
            answer: 'Keine Ahnung, ob das klappt.',
            reviewTargets: ['v-die-ahnung', 'v-klappen'],
            hints: [],
          },
          {
            prompt: bi('Do you fancy coming round tomorrow?', 'Имаш ли желание да наминеш утре?'),
            answer: 'Hast du Lust, morgen vorbeizukommen?',
            reviewTargets: ['p-lust-haben', 'v-die-lust', 'v-vorbeikommen'],
            hints: [bi('zu goes inside the separable verb: vorbeizukommen.', 'zu влиза вътре в разделимия глагол: vorbeizukommen.')],
          },
          {
            prompt: bi('I will be in touch after work.', 'Ще се обадя след работа.'),
            // Feierabend takes no article after nach, as Mittag and Dienst do not.
            answer: 'Ich melde mich nach Feierabend.',
            alternatives: ['Ich melde mich nach dem Feierabend.'],
            reviewTargets: ['v-sich-melden', 'v-der-feierabend'],
            hints: [],
          },
        ],
        ['g-reduktion'],
      ),
    ),
    b2(
      dictation('b2u5l2-ex4', bi('Full forms, spoken', 'Пълни форми, изговорени'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Hast du Lust, morgen vorbeizukommen?',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Keine Ahnung, ob das klappt.',
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
        typeIt('b2u5l2-m1', bi('Decode and arrange', 'Разчети и уговори'), [
          {
            prompt: bi('You hear: "Haste mal kurz?" — write the full form.', 'Чуваш: „Haste mal kurz?“ — напиши пълната форма.'),
            answer: 'Hast du mal kurz?',
            hints: [],
          },
          {
            prompt: bi('Just let me know when you are ready.', 'Просто ми кажи, като си готов.'),
            answer: 'Sag mir einfach Bescheid, wenn du so weit bist.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — the shape of a spoken sentence
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b2-u5-l3',
  unitId: 'b2-u5',
  level: 'b2',
  order: 3,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('Didn’t see it', 'Не съм го гледал'),
  objective: bi(
    'After this lesson you recognise the three things speech does to a German sentence — deleting the front, adding an afterthought, and asking for agreement — and you can say what the full sentence was.',
    'След този урок разпознаваш трите неща, които речта прави с немското изречение — изтрива началото, добавя допълнение накрая и иска съгласие — и можеш да кажеш какво е било пълното изречение.',
  ),
  outcomes: [
    bi('I understand a sentence with the first pronoun deleted.', 'Разбирам изречение с изтрито първо местоимение.'),
    bi('I recognise an afterthought at the end.', 'Разпознавам допълнение в края.'),
    bi('I can use ne? and oder? to ask for agreement.', 'Мога да използвам ne? и oder?, за да поискам съгласие.'),
    bi('I know the verb-second frame is still underneath.', 'Знам, че рамката „глаголът е втори“ стои отдолу.'),
  ],
  vocabIds: ['v-echt', 'v-ziemlich', 'v-total', 'v-der-quatsch', 'v-das-zeug', 'v-der-typ'],
  grammarIds: ['g-gesprochene-syntax'],
  sections: [
    {
      id: 'b2u5l3-intro',
      kind: 'intro',
      title: bi('The front falls off', 'Началото отпада'),
      blocks: [
        {
          t: 'contrast',
          de: 'Das habe ich nicht gesehen.',
          other: bi('The full sentence, and correct.', 'Пълното изречение, и то правилно.'),
        },
        {
          t: 'de',
          de: 'Hab ich nicht gesehen.',
          gloss: bi('Didn’t see it.', 'Не съм го гледал.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'The first slot has been deleted, not moved — everything after it is in exactly the usual order. This is the one deletion, not a licence to rearrange.',
            'Първата позиция е изтрита, а не преместена — всичко след нея е точно в обичайния ред. Това е единственото изтриване, а не разрешение за пренареждане.',
          ),
        },
      ],
    },
    {
      id: 'b2u5l3-vocab',
      kind: 'vocabulary',
      title: bi('What speech is flavoured with', 'С какво се подправя речта'),
      vocabIds: ['v-echt', 'v-ziemlich', 'v-total', 'v-der-quatsch', 'v-das-zeug', 'v-der-typ'],
      blocks: [],
    },
    {
      id: 'b2u5l3-grammar',
      kind: 'grammar',
      title: bi('Delete, append, confirm', 'Изтрий, добави, потвърди'),
      blocks: [],
      grammarId: 'g-gesprochene-syntax',
    },
    {
      id: 'b2u5l3-examples',
      kind: 'examples',
      title: bi('A conversation, as it really runs', 'Разговор, както наистина протича'),
      blocks: [
        {
          t: 'de',
          de: 'Hab ich nicht gesehen.',
          gloss: bi('Didn’t see it.', 'Не съм го гледал.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der ist echt gut, der Film.',
          gloss: bi('It is really good, that film.', 'Много е добър, филмът.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das machen wir morgen, ne?',
          gloss: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ach Quatsch, das macht doch nichts.',
          gloss: bi('Oh nonsense, it does not matter.', 'Ама глупости, няма нищо.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u5l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('The first pronoun can vanish. The rest keeps its order.', 'Първото местоимение може да изчезне. Останалото си пази реда.'),
            bi('An afterthought repeats the subject at the end: …, der Film.', 'Допълнението накрая повтаря подлога: …, der Film.'),
            bi('ne? and oder? are invariant. They never agree with anything.', 'ne? и oder? са неизменяеми. Не се съгласуват с нищо.'),
            bi('echt, ziemlich and total are what make it sound spoken.', 'echt, ziemlich и total са това, което го прави говоримо.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      typeIt(
        'b2u5l3-ex1',
        bi('Restore the full sentence', 'Възстанови пълното изречение'),
        [
          {
            prompt: bi('You hear: "Hab ich nicht gesehen." — write the full sentence.', 'Чуваш: „Hab ich nicht gesehen.“ — напиши пълното изречение.'),
            answer: 'Das habe ich nicht gesehen.',
            hints: [bi('Put the missing first word back, and the -e too.', 'Върни липсващата първа дума, както и -e.')],
          },
          {
            prompt: bi('You hear: "Der ist echt gut, der Film." — say it without the afterthought.', 'Чуваш: „Der ist echt gut, der Film.“ — кажи го без допълнението накрая.'),
            answer: 'Der Film ist echt gut.',
            reviewTargets: ['v-echt', 'v-der-film'],
            hints: [],
          },
          {
            prompt: bi('You hear: "Machen wir morgen, ne?" — write it as a full question.', 'Чуваш: „Machen wir morgen, ne?“ — напиши го като пълен въпрос.'),
            answer: 'Machen wir das morgen?',
            hints: [],
          },
        ],
        ['g-gesprochene-syntax'],
      ),
    ),
    b2(
      wordOrder('b2u5l3-ex2', bi('Build the spoken shape', 'Построй говоримата форма'), [
        {
          prompt: bi('It is really good, that film.', 'Много е добър, филмът.'),
          bank: ['Der', 'ist', 'echt', 'gut,', 'der', 'Film.'],
          answer: 'Der ist echt gut, der Film.',
          hints: [bi('Pronoun first, the noun as an afterthought.', 'Първо местоимението, съществителното — като допълнение накрая.')],
        },
        {
          prompt: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
          bank: ['Das', 'machen', 'wir', 'morgen,', 'ne?'],
          answer: 'Das machen wir morgen, ne?',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u5l3-ex3',
        bi('Sound like a person', 'Звучи като човек'),
        [
          {
            prompt: bi('That was really good.', 'Това беше наистина добро.'),
            answer: 'Das war echt gut.',
            reviewTargets: ['v-echt'],
            hints: [],
          },
          {
            prompt: bi('That is pretty complicated.', 'Това е доста сложно.'),
            answer: 'Das ist ziemlich kompliziert.',
            reviewTargets: ['v-ziemlich'],
            hints: [],
          },
          {
            prompt: bi('Oh nonsense, it does not matter.', 'Ама глупости, няма нищо.'),
            answer: 'Ach Quatsch, das macht doch nichts.',
            reviewTargets: ['v-der-quatsch'],
            hints: [],
          },
          {
            prompt: bi('Take your stuff with you, please.', 'Вземи си нещата, моля.'),
            answer: 'Nimm dein Zeug bitte mit.',
            reviewTargets: ['v-das-zeug'],
            hints: [bi('mitnehmen splits.', 'mitnehmen се разделя.')],
          },
        ],
        ['g-gesprochene-syntax'],
      ),
    ),
    b2(
      freeWriting('b2u5l3-ex4', bi('Three lines of ordinary talk', 'Три реда всекидневен разговор'), [
        {
          prompt: bi(
            'A colleague asks whether you saw the film. Write three short spoken lines: say you did not, ask whether it is good, and suggest tomorrow with a tag. Use echt and ne.',
            'Колега те пита дали си гледал филма. Напиши три кратки говорими реплики: кажи, че не си, попитай дали е добър и предложи утре с въпросна частица. Използвай echt и ne.',
          ),
          answer: 'Hab ich nicht gesehen. Ist der echt gut? Dann gucken wir den morgen, ne?',
          requiredTokens: ['echt', 'ne'],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('b2u5l3-ex5', bi('Spoken shapes by ear', 'Говорими форми на слух'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der ist echt gut, der Film.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Das machen wir morgen, ne?',
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
        typeIt('b2u5l3-m1', bi('Spoken and full', 'Говоримо и пълно'), [
          {
            prompt: bi('You hear: "Hab ich nicht gesehen." — write the full sentence.', 'Чуваш: „Hab ich nicht gesehen.“ — напиши пълното изречение.'),
            answer: 'Das habe ich nicht gesehen.',
            hints: [],
          },
          {
            prompt: bi('It is really good, that film.', 'Много е добър, филмът.'),
            answer: 'Der ist echt gut, der Film.',
            hints: [],
          },
          {
            prompt: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
            answer: 'Das machen wir morgen, ne?',
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
  id: 'cp-b2u5',
  scope: 'unit',
  targetId: 'b2-u5',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Checkpoint: natural spoken German', 'Проверка: естествен говорим немски'),
  description: bi(
    'The everyday words, the contractions written out in full, and the three things speech does to a sentence.',
    'Всекидневните думи, съкращенията, изписани изцяло, и трите неща, които речта прави с изречението.',
  ),
  exercises: [
    b2(
      fillBlank('cp-b2u5-1', bi('Spoken and textbook', 'Говоримо и учебникарско'), [
        {
          prompt: bi('kriegen — the formal equivalent', 'kriegen — официалното съответствие'),
          scaffold: 'Hast du meine Nachricht ___?',
          answer: 'bekommen',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('klappen — for a machine', 'klappen — за машина'),
          scaffold: 'Der Drucker ___ wieder nicht.',
          answer: 'funktioniert',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('let me know', 'кажи ми'),
          scaffold: 'Sag mir einfach ___.',
          answer: 'Bescheid',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      // The prompts say "in full", as the level checkpoint's do: "write down
      // what was said" alone invited a transcription, which is then wrong.
      typeIt('cp-b2u5-2', bi('Write out the full forms', 'Напиши пълните форми'), [
        {
          prompt: bi('You hear: "Haste mal kurz?" — write it out in full.', 'Чуваш: „Haste mal kurz?“ — напиши го изцяло.'),
          answer: 'Hast du mal kurz?',
          hints: [],
        },
        {
          prompt: bi('You hear: "Ich hab ’ne Frage." — write it out in full.', 'Чуваш: „Ich hab ’ne Frage.“ — напиши го изцяло.'),
          answer: 'Ich habe eine Frage.',
          hints: [],
        },
        {
          prompt: bi('You hear: "Hab ich nicht gesehen." — write it out in full.', 'Чуваш: „Hab ich nicht gesehen.“ — напиши го изцяло.'),
          answer: 'Das habe ich nicht gesehen.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u5-3', bi('Ordinary talk', 'Всекидневен разговор'), [
        {
          prompt: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
          answer: 'Hat mit dem Termin alles geklappt?',
          hints: [],
        },
        {
          prompt: bi('Do you fancy coming round tomorrow?', 'Имаш ли желание да наминеш утре?'),
          answer: 'Hast du Lust, morgen vorbeizukommen?',
          hints: [],
        },
        {
          prompt: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
          answer: 'Das machen wir morgen, ne?',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u5-4', bi('And the same thing, formally', 'И същото, но официално'), [
        {
          prompt: bi('For an email: Did you receive my message?', 'За имейл: Получихте ли съобщението ми?'),
          answer: 'Haben Sie meine Nachricht erhalten?',
          alternatives: ['Haben Sie meine Nachricht bekommen?'],
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('cp-b2u5-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Hast du meine Nachricht gekriegt?',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Der ist echt gut, der Film.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B2_UNIT_5: Unit = {
  id: 'b2-u5',
  level: 'b2',
  order: 5,
  status: 'available',
  title: bi('Natural spoken German', 'Естествен говорим немски'),
  summary: bi(
    'The German nobody writes down: the everyday words that replace the textbook ones, the contractions that make four words sound like two, and the three things speech does to a sentence. Taught for listening, because understanding it is compulsory and producing it is not.',
    'Немският, който никой не записва: всекидневните думи, които заместват учебникарските, съкращенията, при които четири думи звучат като две, и трите неща, които речта прави с изречението. Преподава се за слушане, защото разбирането е задължително, а употребата — не.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B2_U5_PATTERNS = PATTERNS;
