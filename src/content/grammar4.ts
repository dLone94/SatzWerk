import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 Unit 2 grammar: the German sentence bracket.
 *
 * Separable verbs and modal verbs look like two topics and are one: German
 * routinely splits a verb in half and parks the second half at the end of the
 * sentence. Everything between those halves is the middle of the sentence. Once
 * a learner sees the bracket, both topics stop being lists to memorise.
 *
 * The paths diverge for a real reason. English has phrasal verbs — "get up",
 * "tidy up", and even "tidy it up" with the particle moved — so an English
 * speaker already has the instinct and only has to learn how far the particle
 * travels. Bulgarian has no equivalent at all: its prefixed verbs never come
 * apart. So the Bulgarian path is not told "this is like something you know",
 * because it is not; it is told plainly that this is new, and given a way to
 * hear it. Modals are the other way round: English modals already take a bare
 * infinitive, while Bulgarian needs "да", which is the error a Bulgarian
 * speaker will actually make.
 */

/* ------------------------------------------------------------------ *
 * Separable verbs
 * ------------------------------------------------------------------ */

const separableBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Some German verbs come in two pieces. In the dictionary they are written as one word — aufstehen — but in a normal sentence the first piece breaks off and goes to the very end.',
      'Някои немски глаголи се състоят от две части. В речника се пишат като една дума — aufstehen — но в обикновено изречение първата част се отделя и отива най-накрая.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Ich stehe um sieben Uhr auf.',
    parts: [
      { de: 'Ich', gloss: bi('I', 'аз') },
      { de: 'stehe', gloss: bi('the verb, in second position as always', 'глаголът, на второ място както винаги') },
      { de: 'um sieben Uhr', gloss: bi('at seven o’clock', 'в седем часа') },
      { de: 'auf', gloss: bi('the other half of the verb, at the end', 'другата половина на глагола, най-накрая') },
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The bracket', 'Рамката'),
    text: bi(
      'The two halves form a bracket, and everything the sentence says goes inside it. This is the shape of most German sentences from here on, so it is worth hearing it rather than memorising it.',
      'Двете половини образуват рамка и всичко, което изречението казва, стои вътре в нея. Това е формата на повечето немски изречения оттук нататък, така че си струва да я чуеш, а не да я зубриш.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich kaufe am Samstag ein. — I do the shopping on Saturday.', 'Ich kaufe am Samstag ein. — Пазарувам в събота.'),
      bi('Am Abend sehe ich fern. — In the evening I watch television.', 'Am Abend sehe ich fern. — Вечер гледам телевизия.'),
      bi('Ich räume mein Zimmer auf. — I tidy up my room.', 'Ich räume mein Zimmer auf. — Разтребвам стаята си.'),
      bi('Die Arbeit fängt um acht an. — Work starts at eight.', 'Die Arbeit fängt um acht an. — Работата започва в осем.'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You already do a smaller version of this', ''),
    text: bi(
      'English has phrasal verbs, and their particles move too: "tidy up your room" but also "tidy your room up". German is the strict version of the same instinct — the particle always goes to the end, never anywhere else. If you can feel why "tidy your room up" is fine, you can feel "Ich räume mein Zimmer auf".',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Това наистина е ново'),
    text: bi(
      '',
      'Тук няма на какво да се опреш от българския, и е по-честно да се каже направо. Българските представки не се отделят: „ставам“ си остава цяло, каквото и да следва. Немското aufstehen се разпада и половината чака до края на изречението.\n\nПрактическото следствие: докато не чуеш последната дума, не знаеш какъв е глаголът. „Ich stehe um sieben Uhr…“ може да стане „auf“ (ставам) или нещо друго. Немците слушат до края — и ти ще свикнеш да правиш същото.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    text: bi(
      'The one mistake to avoid: never write the verb whole inside a sentence. "Ich aufstehe um sieben" is not German.',
      'Единствената грешка за избягване: никога не пиши глагола цял вътре в изречението. „Ich aufstehe um sieben“ не е немски.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Modal verbs
 * ------------------------------------------------------------------ */

const modalBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'können, müssen and wollen say what you can, have to and want to do. They take a second verb, and that second verb goes to the end of the sentence in its dictionary form.',
      'können, müssen и wollen казват какво можеш, какво трябва и какво искаш да правиш. Те взимат втори глагол, а той отива в края на изречението в речниковата си форма.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Ich muss heute arbeiten.',
    parts: [
      { de: 'Ich', gloss: bi('I', 'аз') },
      { de: 'muss', gloss: bi('the modal, in second position', 'модалният глагол, на второ място') },
      { de: 'heute', gloss: bi('today', 'днес') },
      { de: 'arbeiten', gloss: bi('the second verb, unchanged, at the end', 'вторият глагол, непроменен, най-накрая') },
    ],
  },
  {
    t: 'table',
    headers: [bi('Person', 'Лице'), bi('können', 'können'), bi('müssen', 'müssen'), bi('wollen', 'wollen')],
    rows: [
      ['ich', 'kann', 'muss', 'will'],
      ['du', 'kannst', 'musst', 'willst'],
      ['er / sie / es', 'kann', 'muss', 'will'],
      ['wir', 'können', 'müssen', 'wollen'],
      ['ihr', 'könnt', 'müsst', 'wollt'],
      ['sie / Sie', 'können', 'müssen', 'wollen'],
    ],
    caption: bi(
      'Note the top: ich and er are identical and take no ending at all. Every modal verb behaves this way.',
      'Забележи горната част: ich и er са еднакви и нямат никакво окончание. Всички модални глаголи са такива.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Без „да“'),
    text: bi(
      '',
      'Това е грешката, която български говорещ прави почти сигурно. Българското „трябва да работя“ има „да“ и глагол в лична форма. Немското изречение няма нито „да“, нито лична форма: „Ich muss arbeiten“ — само muss и после чистият, речников глагол в края.\n\nИ втора разлика: българското „трябва“ е безлично и не се мени. Немското müssen се спряга: ich muss, du musst, wir müssen. Трябва да избереш формата според лицето.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('Half of this is free', ''),
    text: bi(
      'English modals already take a bare infinitive: "I must work", not "I must to work". German agrees with you. The new part is only where that second verb lands — at the end, after everything else: "Ich muss heute arbeiten", literally "I must today work".',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    text: bi(
      'ich will means "I want", not "I will". German has no future tense built with will, and this false friend causes real confusion.',
      '„ich will“ значи „искам“, а не „ще“. Немският не строи бъдеще време с will и тази подвеждаща прилика създава истинско объркване.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich kann gut kochen. — I can cook well.', 'Ich kann gut kochen. — Мога да готвя добре.'),
      bi('Wir wollen heute einkaufen. — We want to do the shopping today.', 'Wir wollen heute einkaufen. — Днес искаме да пазаруваме.'),
      bi('Musst du am Samstag arbeiten? — Do you have to work on Saturday?', 'Musst du am Samstag arbeiten? — Трябва ли да работиш в събота?'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('A separable verb after a modal stays whole', 'Делимият глагол след модален остава цял'),
    text: bi(
      'The end of the sentence is where the second verb goes, so a separable verb arrives there in one piece: "Ich muss früh aufstehen." It is already at the end, so it has nowhere to break off to.',
      'Краят на изречението е мястото на втория глагол, затова делимият глагол стига дотам цял: „Ich muss früh aufstehen“. Вече е най-накрая и няма къде да се отдели.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * es gibt
 * ------------------------------------------------------------------ */

const esGibtBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'es gibt says that something exists or is there. It never changes: one form for one thing and for many.',
      'es gibt казва, че нещо съществува или го има. Никога не се мени: една форма и за едно нещо, и за много.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Es gibt einen Garten. — There is a garden.', 'Es gibt einen Garten. — Има градина.'),
      bi('Es gibt drei Zimmer. — There are three rooms.', 'Es gibt drei Zimmer. — Има три стаи.'),
      bi('Es gibt keinen Schrank. — There is no wardrobe.', 'Es gibt keinen Schrank. — Няма гардероб.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('It takes an object', 'Взима допълнение'),
    text: bi(
      'What there is, is the object of es gibt — so a masculine noun takes einen or keinen, exactly as it does after haben. This is the accusative from Unit 1, turning up where you might not expect it.',
      'Това, което го има, е допълнение на es gibt — затова съществителното от мъжки род взима einen или keinen, точно както след haben. Това е винителният падеж от раздел 1, появяващ се там, където не го очакваш.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българското „има“ е точният аналог и работи по същия начин: безлично е и взима пряко допълнение — „има градина“, „има три стаи“. Немското es gibt прави същото. Единствената добавка е членът: „има градина“ става „es gibt einen Garten“ с einen, защото Garten е мъжки род и е допълнение.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English changes the verb for number — "there is a garden" but "there are three rooms". German does not: es gibt covers both. In exchange, German asks you to mark the noun as an object, which English does not do at all.',
      '',
    ),
  },
];

export const GRAMMAR_CONCEPTS_4: GrammarConcept[] = [
  {
    id: 'g-separable-verbs',
    title: bi('Separable verbs', 'Делими глаголи'),
    level: 'a1',
    summary: bi(
      'Half the verb goes to the end of the sentence.',
      'Половината глагол отива в края на изречението.',
    ),
    tags: ['verbs', 'word-order'],
    blocks: separableBlocks,
  },
  {
    id: 'g-modal-verbs',
    title: bi('können, müssen, wollen', 'können, müssen, wollen'),
    level: 'a1',
    summary: bi(
      'The modal is in second position and the other verb waits at the end.',
      'Модалният глагол е на второ място, а другият чака в края.',
    ),
    tags: ['verbs', 'word-order'],
    blocks: modalBlocks,
  },
  {
    id: 'g-es-gibt',
    title: bi('es gibt — there is, there are', 'es gibt — има'),
    level: 'a1',
    summary: bi(
      'One form for both, and what follows it is an object.',
      'Една форма и за двете, а това, което следва, е допълнение.',
    ),
    tags: ['verbs', 'case'],
    blocks: esGibtBlocks,
  },
];
