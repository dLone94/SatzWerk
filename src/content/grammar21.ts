import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B2 Unit 2 grammar: reporting, comparing, conceding, softening.
 *
 * The centre of this unit is **Konjunktiv I**, and it is the single clearest
 * case in the whole course of the two paths standing in completely different
 * places.
 *
 * English has no grammatical way to mark "this is what he said, not what I
 * say". It backshifts the tense — "he said he had no time" — and leaves the
 * rest to context, which is why an English speaker produces *Er sagte, er
 * hatte keine Zeit*: grammatical German, and a sentence in which the speaker
 * has quietly endorsed the claim.
 *
 * **Bulgarian has the category outright.** The renarrative — „казал, че нямал
 * време“ — is a grammaticalised way of saying that the information is second
 * hand and the speaker takes no responsibility for it. That is precisely what
 * Konjunktiv I does. A Bulgarian speaker does not need the concept explained;
 * they need the German forms, and they need to be told that German uses its
 * version mostly in writing, where Bulgarian uses its own everywhere.
 *
 * So the concept below is authored twice over rather than translated: one path
 * is taught a distinction it does not have, the other is handed a map from a
 * distinction it already uses daily.
 *
 * The other three are smaller and all serve the same unit: **je … desto**,
 * which is the one German comparative structure with word order in both
 * halves; **zwar … aber** and **nicht nur … sondern auch**, the two frames a
 * German argument concedes and escalates with; and the **modal particles**,
 * where English has nothing at all and Bulgarian has a partial equivalent it
 * can be pointed at.
 */

/* ------------------------------------------------------------------ *
 * Konjunktiv I and reported speech
 * ------------------------------------------------------------------ */

const konjunktiv1Blocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has a verb form whose whole job is to say: these are somebody else’s words, and I am not vouching for them.',
      'Немският има глаголна форма, чиято единствена задача е да каже: това са чужди думи и аз не гарантирам за тях.',
    ),
  },
  {
    t: 'contrast',
    de: 'Er sagt, er hat keine Zeit.',
    other: bi(
      'Everyday spoken German — and it sounds as though you believe him.',
      'Всекидневен говорим немски — и звучи, все едно му вярваш.',
    ),
  },
  {
    t: 'de',
    de: 'Er sagt, er habe keine Zeit.',
    gloss: bi(
      'He says he has no time. (his claim, not mine)',
      'Той казва, че нямал време. (негово твърдение, не мое)',
    ),
    audio: true,
  },
  {
    t: 'table',
    headers: [bi('Verb', 'Глагол'), bi('er / sie / es', 'er / sie / es'), bi('Example', 'Пример')],
    rows: [
      ['sein', 'sei', 'Sie sagt, sie sei krank.'],
      ['haben', 'habe', 'Er sagt, er habe keine Zeit.'],
      ['werden', 'werde', 'Sie sagt, sie werde später kommen.'],
      ['können', 'könne', 'Er sagt, er könne das nicht machen.'],
      ['müssen', 'müsse', 'Sie sagt, sie müsse noch arbeiten.'],
      ['gehen', 'gehe', 'Er sagt, er gehe jetzt nach Hause.'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The form is easier than it looks', 'Формата е по-лесна, отколкото изглежда'),
    text: bi(
      'For the third person singular — which is almost all reported speech — take the infinitive stem and add **-e**: habe, gehe, könne, müsse. There is exactly one irregular: **sei**.\n\nNote what is missing: the -t that the ordinary present tense has. *er hat* becomes *er habe*, and that missing -t is the whole signal.',
      'За трето лице единствено число — а то покрива почти цялата преизказна реч — вземи основата на инфинитива и добави **-e**: habe, gehe, könne, müsse. Неправилна е точно една форма: **sei**.\n\nЗабележи какво липсва: -t от обикновеното сегашно време. *er hat* става *er habe*, и точно това липсващо -t е сигналът.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('When it looks like the present, switch to Konjunktiv II', 'Когато съвпада със сегашното, минаваш на Konjunktiv II'),
    text: bi(
      'In the plural, Konjunktiv I is usually identical to the ordinary present — *sie haben* either way — so it marks nothing. German switches to Konjunktiv II there instead:\n\nSie sagen, sie **hätten** keine Zeit. — Die Kollegen sagen, sie **kämen** später.\n\nThe rule is mechanical: if the Konjunktiv I form is indistinguishable, use Konjunktiv II.',
      'В множествено число Konjunktiv I обикновено съвпада с обикновеното сегашно — *sie haben* и в двата случая — така че не маркира нищо. Затова немският минава на Konjunktiv II:\n\nSie sagen, sie **hätten** keine Zeit. — Die Kollegen sagen, sie **kämen** später.\n\nПравилото е механично: ако формата на Konjunktiv I не се различава, използвай Konjunktiv II.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English has no word for this, so it moves the tense instead', 'English has no word for this, so it moves the tense instead'),
    text: bi(
      '"He said he had no time." English shifts the tense back one step and leaves the rest to context — there is no form that says *I am only reporting this*.\n\nTranslate that shift directly and you get **Er sagte, er hatte keine Zeit**, which is correct German for something else: it reads as a fact you are confirming. The distancing has gone.\n\nGerman does not backshift. The tense stays where the original speaker put it, and the mood does the work.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('Това вече го имаш — то се казва преизказно наклонение', 'Това вече го имаш — то се казва преизказно наклонение'),
    text: bi(
      '',
      'Българският е един от малкото европейски езици с граматична форма за чужда информация: „Той казал, че нямал време.“ Точно това прави Konjunktiv I.\n\nЗначи концепцията не ти е нова — не ти трябва обяснение защо изобщо съществува такава форма, а само немските форми и едно уточнение:\n\n**Регистърът е различен.** Българското преизказно се използва навсякъде, включително в разговор. Немският Konjunktiv I живее почти само в писмен текст — новини, доклади, протоколи. В кухнята германецът казва *Er sagt, er hat keine Zeit* и разчита на контекста, както прави англичанинът.',
    ),
  },
  {
    t: 'de',
    de: 'Laut dem Bericht sei die Frist eingehalten worden.',
    gloss: bi(
      'According to the report, the deadline was met.',
      'Според доклада срокът бил спазен.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Die Firma behauptet, es habe keine Verzögerung gegeben.',
    gloss: bi(
      'The company claims there was no delay.',
      'Фирмата твърди, че не е имало забавяне.',
    ),
    audio: true,
  },
];

const KONJUNKTIV_1: GrammarConcept = {
  id: 'g-konjunktiv-1',
  title: bi('Konjunktiv I: his words, not yours', 'Konjunktiv I: неговите думи, не твоите'),
  level: 'b2',
  summary: bi(
    'er sagt, er habe … — stem plus -e, sei as the one irregular, and Konjunktiv II wherever the form would be invisible.',
    'er sagt, er habe … — основа плюс -e, sei е единствената неправилна форма, а където формата не се вижда — Konjunktiv II.',
  ),
  blocks: konjunktiv1Blocks,
  tags: ['mood', 'reported-speech', 'register'],
};

/* ------------------------------------------------------------------ *
 * je … desto
 * ------------------------------------------------------------------ */

const jeDestoBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Two things rising together — the more of one, the more of the other. Both halves take a comparative, and each half has its own word order.',
      'Две неща, които растат заедно — колкото повече от едното, толкова повече от другото. И двете части искат сравнителна степен и всяка има собствен словоред.',
    ),
  },
  {
    t: 'de',
    de: 'Je größer der Aufwand ist, desto höher sind die Kosten.',
    gloss: bi(
      'The greater the effort, the higher the costs.',
      'Колкото по-голямо е усилието, толкова по-високи са разходите.',
    ),
    audio: true,
  },
  {
    t: 'table',
    headers: [bi('Half', 'Част'), bi('Word order', 'Словоред'), bi('Example', 'Пример')],
    rows: [
      [
        bi('je …', 'je …'),
        bi('subordinate clause: verb last', 'подчинено изречение: глаголът последен'),
        'Je länger wir warten, …',
      ],
      [
        bi('desto …', 'desto …'),
        bi('main clause: verb second, straight after desto + comparative', 'главно изречение: глаголът втори, веднага след desto + сравнителна'),
        '… desto teurer wird es.',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The comma, and the two word orders', 'Запетаята и двата словореда'),
    text: bi(
      'The je-half is a subordinate clause, so its verb goes to the end. The desto-half is a main clause, and *desto + comparative* together fill the first slot, so the verb comes straight after them.\n\n**Je länger wir warten, desto teurer wird es.** — not *desto es wird teurer*.',
      'Частта с je е подчинено изречение, затова глаголът ѝ отива в края. Частта с desto е главно изречение, а *desto + сравнителна* заедно заемат първия слот, затова глаголът идва веднага след тях.\n\n**Je länger wir warten, desto teurer wird es.** — а не *desto es wird teurer*.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    title: bi('Both your languages leave the verb alone', 'И двата ти езика оставят глагола на мира'),
    text: bi(
      'English says "the longer we wait, the more expensive it gets" and moves nothing. Bulgarian says „колкото по-дълго чакаме, толкова по-скъпо става“ and moves nothing either. German is the odd one out, twice in one sentence — so this is a structure to drill rather than to reason about.',
      'Английският казва „the longer we wait, the more expensive it gets“ и не мести нищо. Българският казва „колкото по-дълго чакаме, толкова по-скъпо става“ и също не мести нищо. Немският е изключението, при това два пъти в едно изречение — затова тази структура се упражнява, а не се осмисля.',
    ),
  },
  {
    t: 'de',
    de: 'Je früher wir anfangen, desto besser.',
    gloss: bi('The earlier we start, the better.', 'Колкото по-рано започнем, толкова по-добре.'),
    audio: true,
  },
];

const JE_DESTO: GrammarConcept = {
  id: 'g-je-desto',
  title: bi('je … desto', 'je … desto'),
  level: 'b2',
  summary: bi(
    'Je + comparative with the verb last, desto + comparative with the verb second.',
    'Je + сравнителна с глагол накрая, desto + сравнителна с глагол на второ място.',
  ),
  blocks: jeDestoBlocks,
  tags: ['comparison', 'word-order'],
};

/* ------------------------------------------------------------------ *
 * Conceding and escalating
 * ------------------------------------------------------------------ */

const konzessivBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A German argument usually concedes before it objects. Two frames do almost all of that work, and both are fixed.',
      'Немският аргумент обикновено първо отстъпва и чак после възразява. Две устойчиви рамки вършат почти цялата тази работа.',
    ),
  },
  {
    t: 'de',
    de: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
    gloss: bi(
      'The proposal is expensive, admittedly, but it saves us time later.',
      'Предложението наистина е скъпо, но по-късно ни спестява време.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Wir brauchen nicht nur mehr Zeit, sondern auch mehr Leute.',
    gloss: bi(
      'We need not only more time but also more people.',
      'Трябват ни не само повече време, но и повече хора.',
    ),
    audio: true,
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('zwar concedes, aber turns', 'zwar отстъпва, aber обръща'),
    text: bi(
      '*zwar* admits the other side has a point and signals that a *but* is coming, so nobody has to guess where you stand. It sits inside the clause, usually right after the verb, and **aber** starts the second half as an ordinary conjunction — no verb movement.',
      '*zwar* признава, че отсрещната страна има право, и подсказва, че следва „но“ — така никой не гадае каква е позицията ти. Стои вътре в изречението, обикновено веднага след глагола, а **aber** започва втората половина като обикновен съюз — без местене на глагола.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('sondern is not aber', 'sondern не е aber'),
    text: bi(
      '*sondern* replaces something that has just been denied: nicht X, **sondern** Y. It can only follow a negative. *aber* adds a contrast to something that still stands.\n\nnicht nur …, **sondern auch** … is one fixed phrase and always this shape.',
      '*sondern* заменя нещо, което току-що е отречено: nicht X, **sondern** Y. Може да следва само отрицание. *aber* добавя контраст към нещо, което остава в сила.\n\nnicht nur …, **sondern auch** … е устойчив израз и винаги има тази форма.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('„а“ и „но“ — точно същото разделение', '„а“ и „но“ — точно същото разделение'),
    text: bi(
      '',
      'Българският прави абсолютно същото разграничение, само че с две отделни думи: „не X, **а** Y“ срещу „X, **но** Y“. Ако мислиш „а“ → sondern и „но“ → aber, ще уцелваш почти винаги.\n\nАнглоговорящите нямат този ориентир — при тях и двете са „but“ — така че тук имаш предимство.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English has one word where German has two', 'English has one word where German has two'),
    text: bi(
      '"but" covers both: "not X but Y" and "X, but Y". German splits them, and using aber after a negative is one of the most audible B2 slips: *Wir brauchen nicht mehr Zeit, aber mehr Leute* says something different from what you meant.\n\nTest: could you replace it with "instead"? Then it is **sondern**.',
      '',
    ),
  },
];

const KONZESSIV_B2: GrammarConcept = {
  id: 'g-konzessiv-b2',
  title: bi('zwar … aber, nicht nur … sondern auch', 'zwar … aber, nicht nur … sondern auch'),
  level: 'b2',
  summary: bi(
    'Concede first with zwar, turn with aber; replace a denied thing with sondern, never with aber.',
    'Първо отстъпи със zwar, после обърни с aber; заменяй отреченото със sondern, никога с aber.',
  ),
  blocks: konzessivBlocks,
  tags: ['connectors', 'argument'],
};

/* ------------------------------------------------------------------ *
 * Modal particles
 * ------------------------------------------------------------------ */

const partikelBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German sprinkles small words into a sentence that change nothing about the facts and everything about the tone. They are the difference between a request and an order, and between a question and an accusation.',
      'Немският вмъква в изречението малки думи, които не променят нищо във фактите и всичко в тона. Те са разликата между молба и заповед, между въпрос и обвинение.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Particle', 'Частица'), bi('What it does', 'Какво прави'), bi('Example', 'Пример')],
    rows: [
      [
        'mal',
        bi('makes a request small and casual', 'прави молбата малка и небрежна'),
        'Schauen Sie mal auf Seite drei.',
      ],
      [
        'doch',
        bi('pushes back gently: but surely, do go on', 'меко настоява: та нали, хайде все пак'),
        'Sagen Sie doch einfach, was Sie denken.',
      ],
      [
        'ja',
        bi('marks it as something we both already know', 'маркира го като нещо, което и двамата знаем'),
        'Das ist ja nicht neu.',
      ],
      [
        'eben',
        bi('exactly — that is the point', 'точно така — това е въпросът'),
        'Eben deshalb brauchen wir mehr Zeit.',
      ],
      [
        'halt',
        bi('resigned: that is just how it is', 'примирено: просто така е'),
        'Das dauert halt.',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Where they go', 'Къде застават'),
    text: bi(
      'In the middle of the sentence, after the verb and the pronouns, before the new information. Never in first position, and never stressed.\n\n**Sagen Sie doch einfach, was Sie denken.** — Schauen Sie **mal** auf Seite drei.',
      'В средата на изречението, след глагола и местоименията, преди новата информация. Никога на първо място и никога под ударение.\n\n**Sagen Sie doch einfach, was Sie denken.** — Schauen Sie **mal** auf Seite drei.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English does this with the voice instead', 'English does this with the voice instead'),
    text: bi(
      'There is no English word for *doch*. English carries the same meanings with intonation and with tags — "do tell me", "surely", "you know" — which is why particles feel like clutter to an English ear and their absence makes German sound blunt to a German one.\n\nA sentence without them is never wrong. It is just flatter and, in a negotiation, harder: *Sagen Sie, was Sie denken* is an instruction, and *Sagen Sie doch einfach, was Sie denken* is an invitation.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('Българският също има такива частици', 'Българският също има такива частици'),
    text: bi(
      '',
      'Българският разполага със същия инструмент: „я кажи“, „нали ти казах“, „все пак“, „просто“. Те също не променят фактите, а тона, и също стоят вътре в изречението, не отпред.\n\nЗатова усетът ти за това *защо* съществуват такива думи е наред. Внимавай само с едно: съответствията не са едно към едно. „нали“ покрива части от ja и от doch, но не ги заменя — по-добре научи немските частици с цели изречения, отколкото с превод.',
    ),
  },
  {
    t: 'de',
    de: 'Das ist ja nicht neu. Eben deshalb brauchen wir mehr Zeit.',
    gloss: bi(
      'That is hardly new. Which is exactly why we need more time.',
      'Това не е нещо ново. Точно затова ни трябва повече време.',
    ),
    audio: true,
  },
];

const MODALPARTIKELN: GrammarConcept = {
  id: 'g-modalpartikeln',
  title: bi('doch, mal, ja, eben: the small words that set the tone', 'doch, mal, ja, eben: малките думи, които задават тона'),
  level: 'b2',
  summary: bi(
    'They change nothing about the facts and everything about how the sentence lands. Middle of the sentence, never stressed.',
    'Не променят нищо във фактите и всичко в начина, по който звучи изречението. В средата, никога под ударение.',
  ),
  blocks: partikelBlocks,
  tags: ['particles', 'register', 'spoken'],
};

export const GRAMMAR_CONCEPTS_21: GrammarConcept[] = [
  KONJUNKTIV_1,
  JE_DESTO,
  KONZESSIV_B2,
  MODALPARTIKELN,
];
