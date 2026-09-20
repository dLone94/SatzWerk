import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B2 Unit 4 grammar: the machinery of an official letter.
 *
 * Unit 3 taught reading written German. This is writing it, and the three
 * structures below are what separate a letter that gets answered from one that
 * gets filed.
 *
 * **Funktionsverbgefüge** — *in Anspruch nehmen*, *zur Verfügung stellen*,
 * *Bezug nehmen auf* — are noun-plus-verb pairs where the noun carries the
 * meaning and the verb has almost none left. Officialdom runs on them. They
 * are not idioms to be decoded but fixed units to be learnt whole, and both
 * paths need the same warning: the individual words will mislead you.
 *
 * **The genitive prepositions** — aufgrund, trotz, während, innerhalb,
 * hinsichtlich — are where B1's register lesson about the genitive comes due.
 * Both English and Bulgarian join these ideas with a preposition and a plain
 * noun ("because of the delay", „поради забавянето“); German demands a case,
 * and the case is the one that only survives in writing.
 *
 * **Written politeness** is a set of frames rather than a rule: *Ich wäre
 * Ihnen dankbar, wenn Sie …*, *Ich möchte Sie darauf hinweisen, dass …*, *Ich
 * bitte um …* Each is a Konjunktiv II the learner already owns from B1, doing
 * a job neither path's own formal register does in the same way — English
 * asks with questions ("Could you possibly …?"), Bulgarian asks with „бихте
 * ли“, and German states its request as a fact about itself.
 */

/* ------------------------------------------------------------------ *
 * Funktionsverbgefüge
 * ------------------------------------------------------------------ */

const funktionsverbBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Official German is built from pairs: a noun that means something and a verb that barely does. Together they are one unit, and neither half can be swapped.',
      'Официалният немски е изграден от двойки: съществително, което значи нещо, и глагол, който почти не значи нищо. Заедно са една единица и никоя от двете части не може да се замени.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Phrase', 'Израз'), bi('Plain verb', 'Обикновен глагол'), bi('Meaning', 'Значение')],
    rows: [
      [
        'Bezug nehmen auf',
        'sich beziehen auf',
        bi('to refer to', 'да се позова на'),
      ],
      [
        'in Anspruch nehmen',
        'nutzen',
        bi('to make use of, to claim', 'да се възползвам от, да предявя'),
      ],
      [
        'zur Verfügung stellen',
        'geben',
        bi('to make available', 'да предоставя'),
      ],
      [
        'in Kauf nehmen',
        'akzeptieren',
        bi('to put up with', 'да приема (като неизбежно)'),
      ],
      [
        'zur Kenntnis nehmen',
        'erfahren',
        bi('to take note of', 'да взема под внимание'),
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The words will mislead you', 'Думите ще те подведат'),
    text: bi(
      '*nehmen* means to take, and in none of these does anybody take anything. The noun carries the meaning; the verb is nearly empty. So learn the whole phrase, with its preposition and its article, as one piece — **Bezug nehmen auf** + accusative, **in Anspruch nehmen** + accusative object.',
      '*nehmen* значи „вземам“, а в нито един от тези изрази никой нищо не взема. Значението го носи съществителното; глаголът е почти празен. Затова учи целия израз — заедно с предлога и члена — като едно цяло: **Bezug nehmen auf** + винителен падеж, **in Anspruch nehmen** + допълнение във винителен.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Why officialdom likes them', 'Защо чиновническият език ги обича'),
    text: bi(
      'They put the action into a noun, which means it can be modified, nominalised and passivised without naming anybody. That is the same move as B2 Unit 1: *Die Leistung wurde in Anspruch genommen* says a service was claimed and never says by whom.',
      'Те вкарват действието в съществително, което може да се определя, номинализира и поставя в страдателен залог, без да се назовава никой. Това е същият ход като в B2, раздел 1: *Die Leistung wurde in Anspruch genommen* казва, че услугата е била ползвана, без изобщо да казва от кого.',
    ),
  },
  {
    t: 'de',
    de: 'Bezug nehmend auf Ihr Schreiben vom 3. Mai teile ich Ihnen Folgendes mit.',
    gloss: bi(
      'With reference to your letter of 3 May, I inform you of the following.',
      'Във връзка с Вашето писмо от 3 май Ви съобщавам следното.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Ich möchte die Gewährleistung in Anspruch nehmen.',
    gloss: bi(
      'I would like to claim under the statutory warranty.',
      'Бих искал да се възползвам от законовата гаранция.',
    ),
    audio: true,
  },
];

const FUNKTIONSVERBEN: GrammarConcept = {
  id: 'g-funktionsverben',
  title: bi('Bezug nehmen auf, in Anspruch nehmen', 'Bezug nehmen auf, in Anspruch nehmen'),
  level: 'b2',
  summary: bi(
    'Noun plus near-empty verb, learnt whole. The noun carries the meaning; nobody takes anything.',
    'Съществително плюс почти празен глагол, учи се наведнъж. Значението е в съществителното; никой нищо не взема.',
  ),
  blocks: funktionsverbBlocks,
  tags: ['collocations', 'register', 'formal'],
};

/* ------------------------------------------------------------------ *
 * Genitive prepositions
 * ------------------------------------------------------------------ */

const genitivPrepBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A small set of prepositions takes the genitive, and they are exactly the ones an official letter needs.',
      'Малка група предлози изискват родителен падеж — и това са точно онези, които официалното писмо използва.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Preposition', 'Предлог'), bi('Means', 'Значение'), bi('Example', 'Пример')],
    rows: [
      ['aufgrund', bi('because of', 'поради'), 'aufgrund der Verzögerung'],
      ['trotz', bi('despite', 'въпреки'), 'trotz mehrerer Anrufe'],
      ['während', bi('during', 'по време на'), 'während der Bauarbeiten'],
      ['innerhalb', bi('within', 'в рамките на'), 'innerhalb einer Woche'],
      ['hinsichtlich', bi('with regard to', 'по отношение на'), 'hinsichtlich der Kosten'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The endings you need', 'Окончанията, които ти трябват'),
    text: bi(
      'Masculine and neuter: **des** + noun + **-s** or **-es**. Feminine and plural: **der**, with nothing added to the noun.\n\naufgrund **des Mangels** — trotz **der Verzögerung** — innerhalb **einer Woche** — hinsichtlich **der Kosten**.',
      'Мъжки и среден род: **des** + съществително + **-s** или **-es**. Женски род и множествено число: **der**, без добавка към съществителното.\n\naufgrund **des Mangels** — trotz **der Verzögerung** — innerhalb **einer Woche** — hinsichtlich **der Kosten**.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('This is the register lesson again', 'Това е отново урокът за регистъра'),
    text: bi(
      'In speech you will hear *wegen dem Mangel* with the dative, and it is normal. In a letter it marks you as careless, so the written form is **wegen des Mangels** or, better, **aufgrund des Mangels**.\n\nSame distinction as B1 Unit 4: the spoken form is not an error, it is the wrong room.',
      'В речта ще чуеш *wegen dem Mangel* с дателен падеж и това е нормално. В писмо обаче звучи небрежно, затова писмената форма е **wegen des Mangels** или, още по-добре, **aufgrund des Mangels**.\n\nСъщото разграничение като в B1, раздел 4: говоримата форма не е грешка, а погрешна обстановка.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    title: bi('Both your languages just use a noun', 'И двата ти езика просто слагат съществително'),
    text: bi(
      '"because of the delay" and „поради забавянето“ — neither marks a case, because neither has one left to mark. German does, and in this corner of the language it still insists. There is nothing to transfer here: the endings have to be built.',
      '„because of the delay“ и „поради забавянето“ — нито единият не маркира падеж, защото няма какво да маркира. Немският има и точно в този ъгъл на езика все още настоява. Тук няма какво да се пренесе: окончанията се строят.',
    ),
  },
  {
    t: 'de',
    de: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
    gloss: bi(
      'Because of the delay I request a refund.',
      'Поради забавянето моля за възстановяване на сумата.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Trotz mehrerer Anrufe wurde der Mangel nicht behoben.',
    gloss: bi(
      'Despite several phone calls the defect was not remedied.',
      'Въпреки няколкото обаждания дефектът не беше отстранен.',
    ),
    audio: true,
  },
];

const GENITIVPRAEPOSITIONEN: GrammarConcept = {
  id: 'g-genitivpraepositionen',
  title: bi('aufgrund, trotz, während, innerhalb', 'aufgrund, trotz, während, innerhalb'),
  level: 'b2',
  summary: bi(
    'The prepositions an official letter runs on, and all of them take the genitive.',
    'Предлозите, с които работи официалното писмо — и всички искат родителен падеж.',
  ),
  blocks: genitivPrepBlocks,
  tags: ['genitive', 'prepositions', 'formal'],
};

/* ------------------------------------------------------------------ *
 * Written politeness
 * ------------------------------------------------------------------ */

const hoeflichkeitBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A German letter asks for things by stating facts about itself. It does not ask questions, and it never says what it wants.',
      'Немското писмо иска нещо, като съобщава факти за себе си. То не задава въпроси и никога не казва какво „иска“.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Frame', 'Рамка'), bi('Used for', 'За какво служи'), bi('Example', 'Пример')],
    rows: [
      [
        'Ich bitte um …',
        bi('a request', 'молба'),
        'Ich bitte um eine schriftliche Bestätigung.',
      ],
      [
        'Ich wäre Ihnen dankbar, wenn …',
        bi('a firmer request', 'по-настоятелна молба'),
        'Ich wäre Ihnen dankbar, wenn Sie den Mangel beheben würden.',
      ],
      [
        'Ich möchte Sie darauf hinweisen, dass …',
        bi('a warning', 'предупреждение'),
        'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
      ],
      [
        'Sollte … nicht …, behalte ich mir vor, …',
        bi('a consequence', 'последица'),
        'Sollte keine Antwort erfolgen, behalte ich mir weitere Schritte vor.',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The whole ladder is Konjunktiv II', 'Цялата стълбица е Konjunktiv II'),
    text: bi(
      'wäre, hätte, würde, könnte — the forms from B1 Unit 3, in their most formal use. The further from the indicative you go, the more distance you put between yourself and the demand, and distance is exactly what politeness is made of here.',
      'wäre, hätte, würde, könnte — формите от B1, раздел 3, в най-официалната им употреба. Колкото по-далеч си от изявителното наклонение, толкова повече дистанция слагаш между себе си и искането — а точно от дистанция е направена учтивостта тук.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('Do not translate your own politeness', 'Do not translate your own politeness'),
    text: bi(
      'English asks by questioning: "Could you possibly let me know …?", "I was wondering whether …". Translated into German those come out either odd or weak.\n\nGerman states: **Ich bitte um …** is not rude, it is standard, and it reads as businesslike rather than demanding. The politeness is carried by the Konjunktiv and by the fixed frame, not by hedging.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('„Бихте ли“ не е немската рамка', '„Бихте ли“ не е немската рамка'),
    text: bi(
      '',
      'Българското официално писмо моли с въпрос: „Бихте ли ми потвърдили …“. Немското не пита — то съобщава: **Ich bitte um eine Bestätigung.**\n\nФормата *Könnten Sie mir bitte …* съществува и е учтива, но в писмо е по-скоро разговорна. За писмо вземи рамката с ich bitte um или Ich wäre Ihnen dankbar, wenn …',
    ),
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
    de: 'Sollte ich bis dahin nichts hören, behalte ich mir weitere Schritte vor.',
    gloss: bi(
      'Should I not hear anything by then, I reserve the right to take further steps.',
      'Ако до тогава не получа отговор, си запазвам правото да предприема по-нататъшни стъпки.',
    ),
    audio: true,
  },
];

const SCHRIFTLICHE_HOEFLICHKEIT: GrammarConcept = {
  id: 'g-schriftliche-hoeflichkeit',
  title: bi('Asking firmly in writing', 'Настоятелна молба в писмен вид'),
  level: 'b2',
  summary: bi(
    'Ich bitte um …, Ich wäre Ihnen dankbar, wenn …, Ich möchte Sie darauf hinweisen, dass … — statements, not questions.',
    'Ich bitte um …, Ich wäre Ihnen dankbar, wenn …, Ich möchte Sie darauf hinweisen, dass … — твърдения, а не въпроси.',
  ),
  blocks: hoeflichkeitBlocks,
  tags: ['politeness', 'register', 'formal'],
};

export const GRAMMAR_CONCEPTS_23: GrammarConcept[] = [
  FUNKTIONSVERBEN,
  GENITIVPRAEPOSITIONEN,
  SCHRIFTLICHE_HOEFLICHKEIT,
];
