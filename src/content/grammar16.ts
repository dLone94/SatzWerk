import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 3 grammar: Konjunktiv II, and indirect questions.
 *
 * This unit is unusual: for once neither path is at a disadvantage. English
 * has "I would like" and "could you"; Bulgarian has „бих искал“ and „бихте
 * ли“. Both learners arrive already knowing what this construction is *for*,
 * and pretending otherwise would be inventing a difficulty.
 *
 * What is genuinely worth teaching, then, is not the idea but the German
 * shape — and specifically the one error both paths make for opposite
 * reasons. Neither English nor Bulgarian has a separate subjunctive form of
 * "have" or "be" that a learner could map across:
 *
 *   • English builds it analytically for most verbs — *I would go* — so the
 *     instinct is to say *ich würde haben*, because "I would have" is what
 *     English says.
 *   • Bulgarian builds it analytically for *everything*: „бих“ plus the verb,
 *     with no exceptions at all — бих имал, бих бил, бих отишъл. So the same
 *     *würde haben* comes out, from a rule that is even more consistent.
 *
 * German is the odd one here: it keeps real one-word forms for exactly the
 * verbs you use most — hätte, wäre, könnte, müsste, wüsste — and *würde* is
 * the fallback for the rest. So both paths get the same warning, and the
 * course says out loud that it arrives from two different directions.
 *
 * Indirect questions are the second half, and they pair naturally: almost
 * every polite question at a doctor's or an insurer's is an indirect one.
 * Here the paths do differ. Bulgarian has „дали“, a direct equivalent of *ob*,
 * so the construction transfers cleanly. English uses "if" or "whether" and
 * — the real problem — English speakers keep the question word order, which
 * German cannot: the verb goes to the end.
 */

/* ------------------------------------------------------------------ *
 * Konjunktiv II for politeness
 * ------------------------------------------------------------------ */

const politeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German softens a request by stepping one form sideways. The meaning is unchanged; only the manners are different — and in a doctor’s surgery, a bank or an office, this is the register people actually use.',
      'Немският смекчава молбата, като премества глагола с една форма настрани. Смисълът не се променя; променят се само обноските — а в лекарски кабинет, банка или служба хората говорят точно така.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Plain', 'Направо'), bi('Polite', 'Учтиво'), bi('Meaning', 'Значение')],
    rows: [
      ['Ich will einen Termin.', 'Ich **hätte** gern einen Termin.', bi('I would like an appointment.', 'Бих искал час.')],
      ['Können Sie mir helfen?', '**Könnten** Sie mir helfen?', bi('Could you help me?', 'Бихте ли ми помогнали?')],
      ['Das ist gut.', 'Das **wäre** gut.', bi('That would be good.', 'Това би било добре.')],
      ['Ich muss noch fragen.', 'Ich **müsste** noch fragen.', bi('I would have to ask.', 'Би трябвало да попитам.')],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Five forms carry almost all of it', 'Пет форми носят почти всичко'),
    text: bi(
      'hätte, wäre, könnte, müsste, wüsste. They are the past forms with an umlaut added, and between them they cover the overwhelming majority of polite German you will ever need to produce.\n\nLearn these five as vocabulary and the rest of the system becomes optional.',
      'hätte, wäre, könnte, müsste, wüsste. Това са миналите форми с добавен умлаут и заедно покриват преобладаващата част от учтивия немски, който изобщо ще ти трябва.\n\nНаучи тези пет като думи и останалата част от системата става по избор.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'For every other verb, German uses würde plus the infinitive — the same shape English and Bulgarian use for everything.',
      'За всички останали глаголи немският използва würde плюс инфинитив — същата форма, която английският и българският използват за всичко.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich würde gern einen Termin vereinbaren.', 'Ich würde gern einen Termin vereinbaren.'),
      bi('An Ihrer Stelle würde ich zum Hausarzt gehen.', 'An Ihrer Stelle würde ich zum Hausarzt gehen.'),
      bi('Das würde ich nicht machen.', 'Das würde ich nicht machen.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The one mistake: würde haben, würde sein', 'Единствената грешка: würde haben, würde sein'),
    text: bi(
      'German does **not** say *ich würde haben* or *ich würde sein*. Those verbs have their own forms and keep them: **hätte** and **wäre**. The same goes for the modals — **könnte**, not *würde können*.\n\nEverything else takes würde. That is the whole rule.',
      'Немският **не** казва *ich würde haben* или *ich würde sein*. Тези глаголи имат свои форми и ги запазват: **hätte** и **wäre**. Същото важи за модалните — **könnte**, а не *würde können*.\n\nВсичко останало взима würde. Това е цялото правило.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You already have this — except for three verbs', ''),
    text: bi(
      'English does exactly this and you use it every day: "I would like", "could you", "that would be good". The idea needs no explaining, and the politeness it carries is the same politeness.\n\nThe gap is narrow and specific. English builds it one way for everything — *would* plus the verb — so "I would have" and "I would be" come out as *ich würde haben* and *ich würde sein*. German has kept real one-word forms for precisely those verbs, and for the modals:\n\n• I would have → ich **hätte** (not *würde haben*)\n• I would be → ich **wäre** (not *würde sein*)\n• I could → ich **könnte** (not *würde können*)\n\nThree substitutions, and everything else maps straight across with würde. This is one of the easier things in B1 — provided you learn those three by heart rather than translating.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Идеята е твоя. Изключенията не са.'),
    text: bi(
      '',
      'Българският прави точно това и ти го ползваш всеки ден: „бих искал“, „бихте ли“, „това би било добре“. Конструкцията не е нова и учтивостта, която носи, е същата.\n\nРазликата е в едно нещо, и то е важно. Българското „бих“ работи с **всеки** глагол без изключение: бих искал, бих имал, бих бил, бих отишъл. Една дума плюс глагола, винаги.\n\nНемският не е толкова последователен. Той е запазил истински едносрични форми точно за глаголите, които използваш най-често, и за тях würde е грешка:\n\n• бих имал → ich **hätte**, а не *ich würde haben*\n• бих бил → ich **wäre**, а не *ich würde sein*\n• бих могъл → ich **könnte**, а не *ich würde können*\n\nЗа всичко останало würde е правилното и работи точно като „бих“: würde ich gehen, würde ich sagen.\n\nЗапомни това като списък от пет думи — hätte, wäre, könnte, müsste, wüsste — и после карай с würde. Тези пет покриват почти всичко, което ще ти се наложи да кажеш учтиво.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Giving advice', 'Даване на съвет'),
    text: bi(
      'An deiner Stelle würde ich … — "if I were you, I would …" — is the standard way to advise someone in German, and it is more common than sollen for anything that is a suggestion rather than an instruction.',
      'An deiner Stelle würde ich … — „на твое място бих …“ — е стандартният начин да посъветваш някого на немски и се среща по-често от sollen за всичко, което е предложение, а не нареждане.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Hypotheses: wenn plus Konjunktiv II
 * ------------------------------------------------------------------ */

const hypothesisBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'The same forms say what would happen if things were different. The wenn-clause and the main clause each take a Konjunktiv II form.',
      'Същите форми казват какво би станало, ако нещата бяха различни. И wenn-изречението, и главното изречение взимат форма на Konjunktiv II.',
    ),
  },
  {
    t: 'de',
    de: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
    gloss: bi(
      'If I had more time, I would go to the doctor.',
      'Ако имах повече време, бих отишъл на лекар.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Wenn ich Sie wäre, würde ich mich schonen.', 'Wenn ich Sie wäre, würde ich mich schonen.'),
      bi('Wenn es dringend wäre, würde ich die 112 anrufen.', 'Wenn es dringend wäre, würde ich die 112 anrufen.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Both halves, and the verb still goes last', 'И двете половини, а глаголът пак отива в края'),
    text: bi(
      'The wenn-clause is a subordinate clause, so its verb stands at the end — exactly as it has since A2. And when the wenn-clause comes first, the main clause starts with its verb: **Wenn** ich mehr Zeit **hätte**, **würde** ich zum Arzt gehen.',
      'wenn-изречението е подчинено, затова глаголът му стои в края — точно както още от A2. А когато wenn-изречението е отпред, главното изречение започва със своя глагол: **Wenn** ich mehr Zeit **hätte**, **würde** ich zum Arzt gehen.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two würde in one sentence is clumsy', 'Две würde в едно изречение е тромаво'),
    text: bi(
      'Where a one-word form exists, use it — especially in the wenn-clause. *Wenn ich mehr Zeit haben würde* is understood, but hätte is what a German speaker says.',
      'Там, където има едносрична форма, използвай нея — особено в wenn-изречението. *Wenn ich mehr Zeit haben würde* се разбира, но немецът казва hätte.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Indirect questions
 * ------------------------------------------------------------------ */

const indirectBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A polite question is usually a question inside another sentence. German wraps it the same way it wraps every subordinate clause: the verb goes to the end.',
      'Учтивият въпрос обикновено е въпрос вътре в друго изречение. Немският го опакова както всяко подчинено изречение: глаголът отива в края.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Direct', 'Пряк'), bi('Indirect', 'Непряк')],
    rows: [
      ['Wann ist der Termin?', 'Könnten Sie mir sagen, wann der Termin **ist**?'],
      ['Wo ist die Apotheke?', 'Wissen Sie, wo die Apotheke **ist**?'],
      ['Zahlt die Kasse das?', 'Ich wollte fragen, **ob** die Kasse das **zahlt**.'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('ob is for yes-or-no questions', 'ob е за въпроси с „да“ или „не“'),
    text: bi(
      'A question with a question word keeps that word: wann, wo, wie, warum. A question without one — a yes-or-no question — needs ob to hold the place.',
      'Въпрос с въпросителна дума я запазва: wann, wo, wie, warum. Въпрос без такава — с отговор „да“ или „не“ — иска ob, за да държи мястото.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('Do not keep the question word order', ''),
    text: bi(
      'English changes very little when it buries a question: "where is it" becomes "do you know where it is" — the verb and subject swap back, and English speakers learning German routinely forget to do more than that.\n\nGerman does more. The verb leaves the middle of the clause entirely and goes to the very end:\n\n• Wissen Sie, wo die Apotheke **ist**? — not *wo ist die Apotheke*\n• Könnten Sie mir sagen, wann der Termin **ist**? — not *wann ist der Termin*\n\nFor yes-or-no questions, ob is "whether", and it works exactly like the English word — including the fact that you cannot leave it out the way you can drop "that".',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['bg'],
    title: bi('', '„дали“ е точно ob'),
    text: bi(
      '',
      'Българското „дали“ и немското ob вършат една и съща работа и на същото място:\n\n• Исках да попитам **дали** касата го плаща. → Ich wollte fragen, **ob** die Kasse das zahlt.\n• Знаете ли **дали** е спешно? → Wissen Sie, **ob** es dringend ist?\n\nПри въпрос с въпросителна дума и двата езика просто я запазват: кога → wann, къде → wo.\n\nЕдинственото, което трябва да добавиш, вече го знаеш от A2: в немското подчинено изречение спрегнатият глагол отива най-накрая. Българският го оставя на мястото му („кога е часът“), немският го изпраща в края („wann der Termin **ist**“). Същата стъпка като при weil, dass и относителните изречения — трети път същото правило.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_16: GrammarConcept[] = [
  {
    id: 'g-konjunktiv2-hoeflich',
    title: bi('Konjunktiv II: hätte, wäre, könnte', 'Konjunktiv II: hätte, wäre, könnte'),
    level: 'b1',
    summary: bi(
      'Five one-word forms carry almost all polite German; würde covers the rest — but never haben, sein or a modal.',
      'Пет едносрични форми носят почти целия учтив немски; würde покрива останалото — но никога haben, sein или модален глагол.',
    ),
    tags: ['verb-conjugation', 'politeness'],
    blocks: politeBlocks,
  },
  {
    id: 'g-konjunktiv2-wenn',
    title: bi('If things were different: wenn plus Konjunktiv II', 'Ако нещата бяха различни: wenn плюс Konjunktiv II'),
    level: 'b1',
    summary: bi(
      'Both halves take a Konjunktiv II form, and the verb still goes last in the wenn-clause.',
      'И двете половини взимат форма на Konjunktiv II, а глаголът пак стои последен в wenn-изречението.',
    ),
    tags: ['verb-conjugation', 'word-order'],
    blocks: hypothesisBlocks,
  },
  {
    id: 'g-indirekte-frage',
    title: bi('Indirect questions: ob and the verb at the end', 'Непреки въпроси: ob и глаголът в края'),
    level: 'b1',
    summary: bi(
      'A question inside a sentence is a subordinate clause — ob for yes-or-no, and the verb goes last.',
      'Въпрос вътре в изречение е подчинено изречение — ob за „да/не“, а глаголът отива последен.',
    ),
    tags: ['word-order'],
    blocks: indirectBlocks,
  },
];
