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
 * B1 Unit 3 — Health and insurance.
 *
 * The unit where, unusually, neither path is at a disadvantage. English has
 * "I would like" and "could you"; Bulgarian has „бих искал“ and „бихте ли“.
 * Both learners already know what Konjunktiv II is *for*, and the course says
 * so rather than inventing a difficulty to be solemn about.
 *
 * What it teaches instead is the one place German breaks the pattern both
 * languages follow — and the interesting part is that both paths make the
 * same mistake for opposite reasons. English builds the conditional
 * analytically for most verbs; Bulgarian builds it analytically for *all* of
 * them, with „бих“ and no exceptions whatever. German keeps real one-word
 * forms for exactly the verbs you use most. So *ich würde haben* arrives from
 * two different directions, and each path is told which one is theirs.
 *
 * The content is chosen so the politeness has somewhere to live. A German
 * doctor's appointment is the everyday situation where an adult learner most
 * needs to sound like an adult, and where the hard part is rarely describing
 * the symptom — A2 already did that — but understanding the reply.
 *
 * Lesson 3 adds indirect questions, which pair naturally: almost every polite
 * question at a surgery or an insurer's is one. Here the paths do differ, and
 * for once it is Bulgarian that transfers cleanly — „дали“ is *ob* — while
 * English speakers keep the question word order that German cannot have.
 */

/** The shorthands default to pre-a1; everything in this file is B1. */
const b1 = (ex: Exercise): Exercise => ({ ...ex, level: 'b1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-haette-gern',
    template: 'Ich hätte gern ___.',
    example: 'Ich hätte gern einen Termin.',
    gloss: bi('I would like ___.', 'Бих искал ___.'),
    level: 'b1',
    grammarIds: ['g-konjunktiv2-hoeflich'],
  },
  {
    id: 'p-koennten-sie',
    template: 'Könnten Sie ___?',
    example: 'Könnten Sie mir helfen?',
    gloss: bi('Could you ___?', 'Бихте ли ___?'),
    level: 'b1',
    grammarIds: ['g-konjunktiv2-hoeflich'],
  },
  {
    id: 'p-an-deiner-stelle',
    template: 'An Ihrer Stelle würde ich ___.',
    example: 'An Ihrer Stelle würde ich zum Hausarzt gehen.',
    gloss: bi('If I were you I would ___.', 'На твое място бих ___.'),
    level: 'b1',
    grammarIds: ['g-konjunktiv2-wenn'],
  },
  {
    id: 'p-indirekte-frage-ob',
    template: 'Ich wollte fragen, ob ___.',
    example: 'Ich wollte fragen, ob die Kasse das zahlt.',
    gloss: bi('I wanted to ask whether ___.', 'Исках да попитам дали ___.'),
    level: 'b1',
    grammarIds: ['g-indirekte-frage'],
  },
];

/* ================================================================== *
 * Lesson 1 — making the appointment
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b1-u3-l1',
  unitId: 'b1-u3',
  level: 'b1',
  order: 1,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('I would like an appointment', 'Бих искал час'),
  objective: bi(
    'After this lesson you can make a request the way an adult German speaker makes one — which is one form sideways from the way you have been asking so far.',
    'След този урок можеш да отправиш молба така, както я отправя възрастен немски говорещ — което е една форма встрани от начина, по който си питал досега.',
  ),
  outcomes: [
    bi('I can say hätte, wäre and könnte without thinking.', 'Мога да кажа hätte, wäre и könnte, без да мисля.'),
    bi('I know würde never goes with haben or sein.', 'Знам, че würde никога не върви с haben или sein.'),
    bi('I can book an appointment on the phone.', 'Мога да запазя час по телефона.'),
    bi('I understand what a German surgery asks me first.', 'Разбирам какво ме пита първо немският кабинет.'),
  ],
  vocabIds: [
    'v-der-hausarzt',
    'v-der-facharzt',
    'v-die-ueberweisung',
    'v-die-krankenkasse',
    'v-versichert',
    'v-die-beschwerden',
    'v-die-untersuchung',
  ],
  grammarIds: ['g-konjunktiv2-hoeflich'],
  sections: [
    {
      id: 'b1u3l1-intro',
      kind: 'intro',
      title: bi('One form sideways', 'Една форма встрани'),
      blocks: [
        {
          t: 'contrast',
          de: 'Ich will einen Termin. → Ich hätte gern einen Termin.',
          other: bi(
            'Same request. The first sounds like a demand; the second is what people actually say.',
            'Същата молба. Първото звучи като искане; второто е това, което хората наистина казват.',
          ),
        },
        {
          t: 'de',
          de: 'Ich hätte gern einen Termin beim Hausarzt.',
          gloss: bi(
            'I would like an appointment with the family doctor.',
            'Бих искал час при личния лекар.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'You already know this move in your own language. What is new is that German keeps special one-word forms for the verbs you need most.',
            'Този ход вече го знаеш на своя език. Новото е, че немският пази специални едносрични форми за глаголите, които ти трябват най-много.',
          ),
        },
      ],
    },
    {
      id: 'b1u3l1-vocab',
      kind: 'vocabulary',
      title: bi('Doctors, and who pays', 'Лекари и кой плаща'),
      vocabIds: [
        'v-der-hausarzt',
        'v-der-facharzt',
        'v-die-ueberweisung',
        'v-die-krankenkasse',
        'v-versichert',
        'v-die-beschwerden',
        'v-die-untersuchung',
      ],
      blocks: [],
    },
    {
      id: 'b1u3l1-grammar',
      kind: 'grammar',
      title: bi('hätte, wäre, könnte', 'hätte, wäre, könnte'),
      blocks: [],
      grammarId: 'g-konjunktiv2-hoeflich',
    },
    {
      id: 'b1u3l1-culture',
      kind: 'culture',
      title: bi('How a German surgery works', 'Как работи немският лекарски кабинет'),
      blocks: [
        {
          t: 'list',
          items: [
            bi(
              'You register with one Hausarzt, and they are the door to everything else.',
              'Записваш се при един Hausarzt и той е вратата към всичко останало.',
            ),
            bi(
              'A specialist normally needs an Überweisung from that doctor.',
              'За специалист обикновено трябва Überweisung от този лекар.',
            ),
            bi(
              'The first question at reception is "Sind Sie gesetzlich oder privat versichert?"',
              'Първият въпрос на рецепцията е „Sind Sie gesetzlich oder privat versichert?“',
            ),
            bi(
              'Bring your insurance card. Without it you may be asked to pay and claim back.',
              'Носи си здравната карта. Без нея може да те помолят да платиш и после да си го искаш обратно.',
            ),
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('Out of hours', 'Извън работно време'),
          text: bi(
            '116 117 is the on-call doctor service for things that are urgent but not emergencies. 112 is the ambulance. Knowing which is which saves a very long wait.',
            '116 117 е дежурната лекарска служба за спешни, но не животозастрашаващи неща. 112 е линейката. Да знаеш кое кое е, спестява много дълго чакане.',
          ),
        },
      ],
    },
    {
      id: 'b1u3l1-examples',
      kind: 'examples',
      title: bi('On the phone to a surgery', 'По телефона до кабинета'),
      blocks: [
        {
          t: 'de',
          de: 'Ich hätte gern einen Termin.',
          gloss: bi('I would like an appointment.', 'Бих искал час.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Könnten Sie mir helfen?',
          gloss: bi('Could you help me?', 'Бихте ли ми помогнали?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wäre auch Donnerstag möglich?',
          gloss: bi('Would Thursday also be possible?', 'Би ли било възможно и в четвъртък?'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich bin gesetzlich versichert.',
          gloss: bi('I am insured under the public system.', 'Осигурен съм държавно.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u3l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Five forms: hätte, wäre, könnte, müsste, wüsste.', 'Пет форми: hätte, wäre, könnte, müsste, wüsste.'),
            bi('Everything else takes würde plus the infinitive.', 'Всичко останало взима würde плюс инфинитив.'),
            bi('Never würde haben, würde sein or würde können.', 'Никога würde haben, würde sein или würde können.'),
            bi('Ich hätte gern … is the everyday polite request.', 'Ich hätte gern … е всекидневната учтива молба.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u3l1-ex1', bi('The polite form', 'Учтивата форма'), [
        {
          prompt: bi('haben → I would like', 'haben → бих искал'),
          scaffold: 'Ich ___ gern einen Termin.',
          answer: 'hätte',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'würde haben',
              category: 'verb-conjugation',
              feedback: bi(
                'haben keeps its own form: hätte. "I would have" is ich hätte, never *ich würde haben*.',
                'haben пази своя форма: hätte. „Бих имал“ е ich hätte, никога *ich würde haben*.',
              ),
            },
          ],
        },
        {
          prompt: bi('können → could you', 'können → бихте ли'),
          scaffold: '___ Sie mir helfen?',
          answer: 'Könnten',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'Würden Sie können',
              category: 'verb-conjugation',
              feedback: bi(
                'A modal verb keeps its own form too: könnten. There is no *würde können*.',
                'Модалният глагол също пази своя форма: könnten. Няма *würde können*.',
              ),
            },
          ],
        },
        {
          prompt: bi('sein → would it be possible', 'sein → би ли било възможно'),
          scaffold: '___ auch Donnerstag möglich?',
          answer: 'Wäre',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('gehen → I would go', 'gehen → бих отишъл'),
          scaffold: 'Ich ___ zum Hausarzt gehen.',
          answer: 'würde',
          shape: 'word',
          hints: [
            bi(
              'gehen has no special form, so this is where würde belongs.',
              'gehen няма специална форма, затова тук е мястото на würde.',
            ),
          ],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u3l1-ex2',
        bi('Booking the appointment', 'Запазване на час'),
        [
          {
            prompt: bi(
              'I would like an appointment with the family doctor.',
              'Бих искал час при личния лекар.',
            ),
            answer: 'Ich hätte gern einen Termin beim Hausarzt.',
            reviewTargets: ['p-haette-gern', 'v-der-hausarzt'],
            hints: [],
          },
          {
            prompt: bi('Could you help me?', 'Бихте ли ми помогнали?'),
            answer: 'Könnten Sie mir helfen?',
            reviewTargets: ['p-koennten-sie'],
            hints: [],
          },
          {
            prompt: bi('Would Thursday also be possible?', 'Би ли било възможно и в четвъртък?'),
            answer: 'Wäre auch Donnerstag möglich?',
            hints: [],
          },
          {
            prompt: bi('For the specialist you need a referral.', 'За специалиста ти трябва направление.'),
            answer: 'Für den Facharzt brauchen Sie eine Überweisung.',
            reviewTargets: ['v-der-facharzt', 'v-die-ueberweisung'],
            hints: [],
          },
        ],
        ['g-konjunktiv2-hoeflich'],
      ),
    ),
    b1(
      typeIt(
        'b1u3l1-ex3',
        bi('At the surgery', 'В кабинета'),
        [
          {
            prompt: bi('How long have you had these symptoms?', 'Откога имаш тези оплаквания?'),
            answer: 'Seit wann haben Sie diese Beschwerden?',
            reviewTargets: ['v-die-beschwerden'],
            hints: [],
          },
          {
            prompt: bi('I am insured under the public system.', 'Осигурен съм държавно.'),
            answer: 'Ich bin gesetzlich versichert.',
            reviewTargets: ['v-versichert'],
            hints: [],
          },
          {
            prompt: bi('The health insurance does not pay for that.', 'Това здравната каса не го покрива.'),
            answer: 'Das zahlt die Krankenkasse nicht.',
            reviewTargets: ['v-die-krankenkasse'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      dictation('b1u3l1-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich hätte gern einen Termin.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Könnten Sie mir helfen?',
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
        typeIt('b1u3l1-m1', bi('Asking properly', 'Да попиташ както трябва'), [
          {
            prompt: bi('I would like an appointment.', 'Бих искал час.'),
            answer: 'Ich hätte gern einen Termin.',
            hints: [],
          },
          {
            prompt: bi('Could you help me?', 'Бихте ли ми помогнали?'),
            answer: 'Könnten Sie mir helfen?',
            hints: [],
          },
          {
            prompt: bi('Would Thursday also be possible?', 'Би ли било възможно и в четвъртък?'),
            answer: 'Wäre auch Donnerstag möglich?',
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
        'Five forms and one fallback, and German suddenly sounds like an adult speaking. Next: the same forms, used to say what you would do.',
        'Пет форми и едно резервно решение — и немският изведнъж звучи като възрастен човек. Следва: същите форми, за да кажеш какво би направил.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 2 — if I were you
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b1-u3-l2',
  unitId: 'b1-u3',
  level: 'b1',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('If I were you: advice and hypotheses', 'На твое място: съвет и предположение'),
  objective: bi(
    'After this lesson you can give advice without ordering anyone about, and say what would happen if things were different.',
    'След този урок можеш да даваш съвет, без да командваш, и да кажеш какво би станало, ако нещата бяха различни.',
  ),
  outcomes: [
    bi('I can use An deiner Stelle würde ich …', 'Мога да използвам An deiner Stelle würde ich …'),
    bi('I can build a wenn-clause in Konjunktiv II.', 'Мога да построя wenn-изречение в Konjunktiv II.'),
    bi('I keep the verb at the end of the wenn-clause.', 'Държа глагола в края на wenn-изречението.'),
    bi('I can understand a doctor’s advice.', 'Мога да разбера съвета на лекаря.'),
  ],
  vocabIds: [
    'v-die-diagnose',
    'v-behandeln',
    'v-die-behandlung',
    'v-das-rezept',
    'v-die-krankmeldung',
    'v-sich-ausruhen-b1',
    'v-der-notfall',
  ],
  grammarIds: ['g-konjunktiv2-wenn'],
  sections: [
    {
      id: 'b1u3l2-intro',
      kind: 'intro',
      title: bi('Advice without an order', 'Съвет без заповед'),
      blocks: [
        {
          t: 'contrast',
          de: 'Gehen Sie zum Arzt! → An Ihrer Stelle würde ich zum Arzt gehen.',
          other: bi(
            'The first is an instruction. The second is a suggestion, and it is what people give each other.',
            'Първото е нареждане. Второто е предложение и точно това хората си дават един на друг.',
          ),
        },
        {
          t: 'de',
          de: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
          gloss: bi(
            'If I had more time, I would go to the doctor.',
            'Ако имах повече време, бих отишъл на лекар.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u3l2-vocab',
      kind: 'vocabulary',
      title: bi('What the doctor says back', 'Какво отговаря лекарят'),
      vocabIds: [
        'v-die-diagnose',
        'v-behandeln',
        'v-die-behandlung',
        'v-das-rezept',
        'v-die-krankmeldung',
        'v-sich-ausruhen-b1',
        'v-der-notfall',
      ],
      blocks: [],
    },
    {
      id: 'b1u3l2-grammar',
      kind: 'grammar',
      title: bi('wenn plus Konjunktiv II', 'wenn плюс Konjunktiv II'),
      blocks: [],
      grammarId: 'g-konjunktiv2-wenn',
    },
    {
      id: 'b1u3l2-examples',
      kind: 'examples',
      title: bi('Advice you will be given', 'Съвети, които ще получиш'),
      blocks: [
        {
          t: 'de',
          de: 'An Ihrer Stelle würde ich mich ein paar Tage schonen.',
          gloss: bi(
            'If I were you I would take it easy for a few days.',
            'На твое място бих се пазил няколко дни.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich brauche eine Krankmeldung für meinen Arbeitgeber.',
          gloss: bi(
            'I need a sick note for my employer.',
            'Трябва ми болничен за работодателя ми.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wenn es dringend wäre, würde ich die 112 anrufen.',
          gloss: bi('If it were urgent, I would call 112.', 'Ако беше спешно, бих звъннал на 112.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das wird mit Tabletten behandelt.',
          gloss: bi('That is treated with tablets.', 'Това се лекува с таблетки.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u3l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('An Ihrer Stelle würde ich … for advice.', 'An Ihrer Stelle würde ich … за съвет.'),
            bi('Both halves of a hypothesis take Konjunktiv II.', 'И двете половини на предположението взимат Konjunktiv II.'),
            bi('The verb stands last in the wenn-clause.', 'Глаголът стои последен в wenn-изречението.'),
            bi('Use hätte and wäre, not haben würde.', 'Използвай hätte и wäre, а не haben würde.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      wordOrder('b1u3l2-ex1', bi('Build the hypothesis', 'Построй предположението'), [
        {
          prompt: bi('If I had more time, I would go to the doctor.', 'Ако имах повече време, бих отишъл на лекар.'),
          bank: ['Wenn', 'ich', 'mehr', 'Zeit', 'hätte,', 'würde', 'ich', 'zum', 'Arzt', 'gehen.'],
          answer: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
          hints: [
            bi(
              'The wenn-clause puts its verb last; then the main clause starts with its own verb.',
              'wenn-изречението слага глагола си последен; после главното изречение започва със своя глагол.',
            ),
          ],
        },
        {
          prompt: bi('If it were urgent, I would call 112.', 'Ако беше спешно, бих звъннал на 112.'),
          bank: ['Wenn', 'es', 'dringend', 'wäre,', 'würde', 'ich', 'die', '112', 'anrufen.'],
          answer: 'Wenn es dringend wäre, würde ich die 112 anrufen.',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u3l2-ex2',
        bi('Give the advice', 'Дай съвета'),
        [
          {
            prompt: bi(
              'If I were you I would take it easy for a few days.',
              'На твое място бих се пазил няколко дни.',
            ),
            answer: 'An Ihrer Stelle würde ich mich ein paar Tage schonen.',
            alternatives: ['An deiner Stelle würde ich mich ein paar Tage schonen.'],
            reviewTargets: ['p-an-deiner-stelle', 'v-sich-ausruhen-b1'],
            hints: [],
          },
          {
            prompt: bi('If I were you I would go to the family doctor.', 'На твое място бих отишъл при личния лекар.'),
            answer: 'An Ihrer Stelle würde ich zum Hausarzt gehen.',
            alternatives: ['An deiner Stelle würde ich zum Hausarzt gehen.'],
            reviewTargets: ['v-der-hausarzt'],
            hints: [],
          },
          {
            prompt: bi('I need a sick note for my employer.', 'Трябва ми болничен за работодателя ми.'),
            answer: 'Ich brauche eine Krankmeldung für meinen Arbeitgeber.',
            reviewTargets: ['v-die-krankmeldung'],
            hints: [],
          },
        ],
        ['g-konjunktiv2-wenn'],
      ),
    ),
    b1(
      fillBlank('b1u3l2-ex3', bi('Which form in the wenn-clause?', 'Коя форма в wenn-изречението?'), [
        {
          prompt: bi('haben', 'haben'),
          scaffold: 'Wenn ich mehr Zeit ___, würde ich zum Arzt gehen.',
          answer: 'hätte',
          shape: 'word',
          hints: [],
          traps: [
            {
              answer: 'haben würde',
              category: 'verb-conjugation',
              feedback: bi(
                'Where a one-word form exists, German uses it — especially here. hätte, not haben würde.',
                'Там, където има едносрична форма, немският я използва — особено тук. hätte, а не haben würde.',
              ),
            },
          ],
        },
        {
          prompt: bi('sein', 'sein'),
          scaffold: 'Wenn es dringend ___, würde ich die 112 anrufen.',
          answer: 'wäre',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('sein — if I were you', 'sein — ако бях на твое място'),
          scaffold: 'Wenn ich Sie ___, würde ich mich schonen.',
          answer: 'wäre',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      freeWriting('b1u3l2-ex4', bi('Advise a colleague', 'Посъветвай колега'), [
        {
          prompt: bi(
            'A colleague has had a cough for a week and keeps coming to work. Give them two sentences of advice, using An deiner Stelle würde ich …',
            'Колега кашля от седмица и продължава да идва на работа. Дай му два съвета, като използваш An deiner Stelle würde ich …',
          ),
          answer:
            'An deiner Stelle würde ich zum Hausarzt gehen. Ich würde mich ein paar Tage schonen.',
          requiredTokens: ['würde'],
          shape: 'sentence',
          hints: [
            bi(
              'Suggest the doctor first, then the resting.',
              'Първо предложи лекаря, после почивката.',
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
        typeIt('b1u3l2-m1', bi('What you would do', 'Какво би направил'), [
          {
            prompt: bi('If I had more time, I would go to the doctor.', 'Ако имах повече време, бих отишъл на лекар.'),
            answer: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
            hints: [],
          },
          {
            prompt: bi(
              'If I were you I would take it easy for a few days.',
              'На твое място бих се пазил няколко дни.',
            ),
            answer: 'An Ihrer Stelle würde ich mich ein paar Tage schonen.',
            alternatives: ['An deiner Stelle würde ich mich ein paar Tage schonen.'],
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
        'The same five forms, now carrying a whole hypothesis. Next: asking a question politely, which means burying it inside another sentence.',
        'Същите пет форми, сега носещи цяло предположение. Следва: как да зададеш въпрос учтиво — тоест да го скриеш вътре в друго изречение.',
      ),
    },
  ],
};

/* ================================================================== *
 * Lesson 3 — the pharmacy, and asking what is covered
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b1-u3-l3',
  unitId: 'b1-u3',
  level: 'b1',
  order: 3,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('Could you tell me whether …', 'Бихте ли ми казали дали …'),
  objective: bi(
    'After this lesson you can ask a pharmacist or an insurer anything you need to, politely, and understand the answer.',
    'След този урок можеш да питаш фармацевт или осигурител каквото ти трябва, учтиво, и да разбереш отговора.',
  ),
  outcomes: [
    bi('I can build an indirect question.', 'Мога да построя непряк въпрос.'),
    bi('I use ob for a yes-or-no question.', 'Използвам ob за въпрос с „да“ или „не“.'),
    bi('I put the verb at the end.', 'Слагам глагола в края.'),
    bi('I can ask what the insurance covers.', 'Мога да попитам какво покрива осигуровката.'),
  ],
  vocabIds: [
    'v-die-versicherung',
    'v-die-zuzahlung',
    'v-rezeptfrei',
    'v-die-nebenwirkung',
    'v-einnehmen',
    'v-die-impfung',
    'v-der-apotheker',
  ],
  grammarIds: ['g-indirekte-frage'],
  sections: [
    {
      id: 'b1u3l3-intro',
      kind: 'intro',
      title: bi('A question inside a sentence', 'Въпрос вътре в изречение'),
      blocks: [
        {
          t: 'contrast',
          de: 'Wann ist der Termin? → Könnten Sie mir sagen, wann der Termin ist?',
          other: bi(
            'The question goes inside, and its verb moves to the very end.',
            'Въпросът влиза вътре, а глаголът му отива най-накрая.',
          ),
        },
        {
          t: 'de',
          de: 'Ich wollte fragen, ob die Kasse das zahlt.',
          gloss: bi(
            'I wanted to ask whether the insurance pays for that.',
            'Исках да попитам дали касата го покрива.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u3l3-vocab',
      kind: 'vocabulary',
      title: bi('At the pharmacy', 'В аптеката'),
      vocabIds: [
        'v-die-versicherung',
        'v-die-zuzahlung',
        'v-rezeptfrei',
        'v-die-nebenwirkung',
        'v-einnehmen',
        'v-die-impfung',
        'v-der-apotheker',
      ],
      blocks: [],
    },
    {
      id: 'b1u3l3-grammar',
      kind: 'grammar',
      title: bi('ob, and the verb at the end', 'ob и глаголът в края'),
      blocks: [],
      grammarId: 'g-indirekte-frage',
    },
    {
      id: 'b1u3l3-examples',
      kind: 'examples',
      title: bi('Things worth asking', 'Неща, които си струва да попиташ'),
      blocks: [
        {
          t: 'de',
          de: 'Könnten Sie mir sagen, ob die Versicherung das zahlt?',
          gloss: bi(
            'Could you tell me whether the insurance pays for that?',
            'Бихте ли ми казали дали осигуровката го покрива?',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich wollte fragen, wann die nächste Impfung fällig ist.',
          gloss: bi(
            'I wanted to ask when the next vaccination is due.',
            'Исках да попитам кога е следващата ваксина.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Welche Nebenwirkungen hat das Medikament?',
          gloss: bi(
            'What side effects does the medicine have?',
            'Какви странични действия има лекарството?',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Tabletten sollten Sie dreimal täglich einnehmen.',
          gloss: bi(
            'You should take the tablets three times a day.',
            'Таблетките трябва да се приемат три пъти дневно.',
          ),
          audio: true,
        },
      ],
    },
    {
      id: 'b1u3l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('ob for yes-or-no; the question word otherwise.', 'ob за „да/не“; иначе въпросителната дума.'),
            bi('The verb goes to the very end, as after weil.', 'Глаголът отива най-накрая, както след weil.'),
            bi('Könnten Sie mir sagen, … is the polite opener.', 'Könnten Sie mir sagen, … е учтивото начало.'),
            bi('rezeptfrei means without prescription, not free.', 'rezeptfrei значи без рецепта, а не безплатно.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b1(
      fillBlank('b1u3l3-ex1', bi('ob or a question word?', 'ob или въпросителна дума?'), [
        {
          prompt: bi('Does the insurance pay for that?', 'Осигуровката покрива ли това?'),
          scaffold: 'Ich wollte fragen, ___ die Versicherung das zahlt.',
          answer: 'ob',
          shape: 'word',
          hints: [bi('A yes-or-no question.', 'Въпрос с отговор „да“ или „не“.')],
        },
        {
          prompt: bi('When is the appointment?', 'Кога е часът?'),
          scaffold: 'Könnten Sie mir sagen, ___ der Termin ist?',
          answer: 'wann',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('Where is the pharmacy?', 'Къде е аптеката?'),
          scaffold: 'Wissen Sie, ___ die Apotheke ist?',
          answer: 'wo',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt(
        'b1u3l3-ex2',
        bi('Bury the question', 'Скрий въпроса'),
        [
          {
            prompt: bi(
              'Could you tell me when the appointment is?',
              'Бихте ли ми казали кога е часът?',
            ),
            answer: 'Könnten Sie mir sagen, wann der Termin ist?',
            reviewTargets: ['p-koennten-sie'],
            hints: [],
            traps: [
              {
                answer: 'Könnten Sie mir sagen, wann ist der Termin?',
                category: 'word-order',
                feedback: bi(
                  'Once the question is inside another sentence it is a subordinate clause, so the verb goes right to the end: …, wann der Termin ist?',
                  'Щом въпросът е вътре в друго изречение, той е подчинено изречение, затова глаголът отива най-накрая: …, wann der Termin ist?',
                ),
              },
            ],
          },
          {
            prompt: bi(
              'Could you tell me whether the insurance pays for that?',
              'Бихте ли ми казали дали осигуровката го покрива?',
            ),
            answer: 'Könnten Sie mir sagen, ob die Versicherung das zahlt?',
            reviewTargets: ['p-indirekte-frage-ob', 'v-die-versicherung'],
            hints: [],
          },
          {
            prompt: bi(
              'I wanted to ask when the next vaccination is due.',
              'Исках да попитам кога е следващата ваксина.',
            ),
            answer: 'Ich wollte fragen, wann die nächste Impfung fällig ist.',
            reviewTargets: ['v-die-impfung'],
            hints: [],
          },
        ],
        ['g-indirekte-frage'],
      ),
    ),
    b1(
      typeIt(
        'b1u3l3-ex3',
        bi('At the pharmacy', 'В аптеката'),
        [
          {
            prompt: bi(
              'Is the medicine available without a prescription?',
              'Лекарството без рецепта ли е?',
            ),
            answer: 'Ist das Medikament rezeptfrei?',
            reviewTargets: ['v-rezeptfrei'],
            hints: [],
          },
          {
            prompt: bi('What side effects does the medicine have?', 'Какви странични действия има лекарството?'),
            answer: 'Welche Nebenwirkungen hat das Medikament?',
            reviewTargets: ['v-die-nebenwirkung'],
            hints: [],
          },
          {
            prompt: bi('The co-payment is five euros.', 'Доплащането е пет евро.'),
            answer: 'Die Zuzahlung beträgt fünf Euro.',
            reviewTargets: ['v-die-zuzahlung'],
            hints: [],
          },
        ],
      ),
    ),
    b1(
      dictation('b1u3l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich wollte fragen, ob die Kasse das zahlt.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Tabletten sollten Sie dreimal täglich einnehmen.',
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
        typeIt('b1u3l3-m1', bi('Asking politely', 'Учтиво питане'), [
          {
            prompt: bi('Could you tell me when the appointment is?', 'Бихте ли ми казали кога е часът?'),
            answer: 'Könnten Sie mir sagen, wann der Termin ist?',
            hints: [],
          },
          {
            prompt: bi(
              'I wanted to ask whether the insurance pays for that.',
              'Исках да попитам дали осигуровката го покрива.',
            ),
            answer: 'Ich wollte fragen, ob die Versicherung das zahlt.',
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
        'Politeness, hypotheses and buried questions — three uses of the same handful of forms. Next: work, and the German application letter.',
        'Учтивост, предположения и скрити въпроси — три употреби на едни и същи няколко форми. Следва: работата и немското мотивационно писмо.',
      ),
    },
  ],
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-b1-u3',
  scope: 'unit',
  targetId: 'b1-u3',
  status: 'available',
  title: bi('Unit 3 checkpoint', 'Проверка на раздел 3'),
  description: bi(
    'The polite forms, a hypothesis, an indirect question, and the vocabulary of being ill in Germany.',
    'Учтивите форми, едно предположение, един непряк въпрос и езикът на боледуването в Германия.',
  ),
  passAccuracy: 0.75,
  exercises: [
    b1(
      typeIt('cp-b1u3-1', bi('Asking politely', 'Учтиво питане'), [
        {
          prompt: bi('I would like an appointment with the family doctor.', 'Бих искал час при личния лекар.'),
          answer: 'Ich hätte gern einen Termin beim Hausarzt.',
          hints: [],
        },
        {
          prompt: bi('Could you help me?', 'Бихте ли ми помогнали?'),
          answer: 'Könnten Sie mir helfen?',
          hints: [],
        },
        {
          prompt: bi('Would Thursday also be possible?', 'Би ли било възможно и в четвъртък?'),
          answer: 'Wäre auch Donnerstag möglich?',
          hints: [],
        },
      ]),
    ),
    b1(
      exercise({
        id: 'cp-b1u3-2',
        kind: 'fillBlank',
        level: 'b1',
        objective: bi('One word or würde?', 'Една дума или würde?'),
        steps: [
          {
            prompt: bi('haben', 'haben'),
            scaffold: 'Ich ___ gern einen Termin.',
            answer: 'hätte',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('sein', 'sein'),
            scaffold: 'Wenn es dringend ___, würde ich die 112 anrufen.',
            answer: 'wäre',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('gehen', 'gehen'),
            scaffold: 'An Ihrer Stelle ___ ich zum Hausarzt gehen.',
            answer: 'würde',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    b1(
      typeIt('cp-b1u3-3', bi('The buried question', 'Скритият въпрос'), [
        {
          prompt: bi(
            'Could you tell me whether the insurance pays for that?',
            'Бихте ли ми казали дали осигуровката го покрива?',
          ),
          answer: 'Könnten Sie mir sagen, ob die Versicherung das zahlt?',
          hints: [],
        },
        {
          prompt: bi('Could you tell me when the appointment is?', 'Бихте ли ми казали кога е часът?'),
          answer: 'Könnten Sie mir sagen, wann der Termin ist?',
          hints: [],
        },
      ]),
    ),
    b1(
      typeIt('cp-b1u3-4', bi('Being ill in Germany', 'Боледуване в Германия'), [
        {
          prompt: bi('For the specialist you need a referral.', 'За специалиста ти трябва направление.'),
          answer: 'Für den Facharzt brauchen Sie eine Überweisung.',
          hints: [],
        },
        {
          prompt: bi('I need a sick note for my employer.', 'Трябва ми болничен за работодателя ми.'),
          answer: 'Ich brauche eine Krankmeldung für meinen Arbeitgeber.',
          hints: [],
        },
      ]),
    ),
    b1(
      dictation('cp-b1u3-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich hätte gern einen Termin.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B1_UNIT_3: Unit = {
  id: 'b1-u3',
  level: 'b1',
  order: 3,
  status: 'available',
  title: bi('Health and insurance', 'Здраве и осигуровки'),
  summary: bi(
    'Konjunktiv II — the one topic where neither path is at a disadvantage — plus indirect questions, and the machinery of being ill in Germany: referrals, sick notes and who pays.',
    'Konjunktiv II — единствената тема, в която нито един от двата пътя не е в неизгодна позиция — плюс непреки въпроси и машинарията на боледуването в Германия: направления, болнични и кой плаща.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B1_U3_PATTERNS = PATTERNS;
