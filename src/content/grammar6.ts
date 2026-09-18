import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 Unit 4 grammar: preferring, and joining.
 *
 * The conjunctions are the structural payload. und, aber, oder and denn are the
 * four that change nothing about word order, which makes them the right four to
 * learn first — they let a learner double the length of every sentence they can
 * already say, at no grammatical cost. weil, which does change the order, is
 * deliberately left for later, and denn exists precisely so that a learner can
 * give a reason before they can handle it.
 *
 * The path note that earns its place here is about the subject pronoun.
 * Bulgarian drops it freely ("Работя много, но не съм уморен" has no "аз" in
 * either half) and German cannot: each half needs its own subject. That is a
 * mistake a Bulgarian speaker will make on the first attempt and an English
 * speaker will make rarely.
 */

/* ------------------------------------------------------------------ *
 * gern, lieber, am liebsten
 * ------------------------------------------------------------------ */

const gernBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has no verb for "to like doing". It adds gern to the verb you are already using, and grades it like an adjective.',
      'Немският няма глагол за „обичам да правя“. Добавя gern към глагола, който вече използваш, и го степенува като прилагателно.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Word', 'Дума'), bi('Means', 'Значи'), bi('Example', 'Пример')],
    rows: [
      ['gern', bi('like doing', 'обичам да'), 'Ich lese gern.'],
      ['lieber', bi('prefer', 'предпочитам'), 'Ich lese lieber.'],
      ['am liebsten', bi('like most of all', 'най-много обичам'), 'Am liebsten lese ich.'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'The word goes after the verb: "Ich höre gern Musik", not "Ich gern höre Musik". The verb keeps second position, as always.',
      'Думата стои след глагола: „Ich höre gern Musik“, а не „Ich gern höre Musik“. Глаголът си остава на второ място, както винаги.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich spiele gern Fußball. — I like playing football.', 'Ich spiele gern Fußball. — Обичам да играя футбол.'),
      bi('Ich trinke lieber Tee. — I prefer tea.', 'Ich trinke lieber Tee. — Предпочитам чай.'),
      bi('Am liebsten schwimme ich. — Most of all I like swimming.', 'Am liebsten schwimme ich. — Най-много обичам да плувам.'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският използва цял глагол — „обичам да чета“ — с „да“ и второ спрежение. Немският използва една малка дума и нищо друго: „Ich lese gern“. По-кратко е, но затова и по-лесно се забравя; струва си да се упражни повече, отколкото изглежда нужно.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English needs a second verb — "I like reading" — where German needs one small word. There is no "Ich mag lesen" at this level: gern does the whole job, and it goes after the verb.',
      '',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Conjunctions
 * ------------------------------------------------------------------ */

const conjunctionBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'These four words join two complete sentences and change nothing at all. The verb stays in second position on both sides, exactly as it was.',
      'Тези четири думи свързват две цели изречения и не променят абсолютно нищо. Глаголът си остава на второ място и от двете страни, точно както е бил.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Word', 'Дума'), bi('Means', 'Значи'), bi('Example', 'Пример')],
    rows: [
      ['und', bi('and', 'и'), 'Ich lese und ich höre Musik.'],
      ['aber', bi('but', 'но'), 'Ich arbeite viel, aber ich bin nicht müde.'],
      ['oder', bi('or', 'или'), 'Trinkst du Tee oder trinkst du Kaffee?'],
      ['denn', bi('because', 'защото'), 'Ich trinke Kaffee, denn ich bin müde.'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Why these four first', 'Защо точно тези четири'),
    text: bi(
      'Because they are free. They double the length of every sentence you can already build and ask nothing new of you. German has other joining words — weil is the common one for "because" — that throw the verb to the end of its half. Those come later, and denn is here so that you can give a reason in the meantime.',
      'Защото са безплатни. Удвояват дължината на всяко изречение, което вече можеш да построиш, и не искат нищо ново от теб. Немският има и други свързващи думи — weil е честото „защото“ — които хвърлят глагола в края на своята половина. Те идват по-късно, а denn е тук, за да можеш да даваш причина дотогава.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Повтори подлога'),
    text: bi(
      '',
      'Това е грешката, която ще направиш на първия опит. Българският спокойно изпуска местоимението и в двете половини: „Работя много, но не съм уморен“ — няма нито едно „аз“. Немският иска подлог във всяка половина: „Ich arbeite viel, aber ich bin nicht müde“. Второто ich не е излишно — без него изречението е счупено.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    text: bi(
      'English can leave the second subject out — "I work a lot but am not tired". German cannot: each half needs its own subject. "Ich arbeite viel, aber bin nicht müde" is wrong.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'A comma goes before aber and denn. Before und and oder joining two full sentences it is optional, and most people leave it out.',
      'Пред aber и denn се пише запетая. Пред und и oder, когато свързват две цели изречения, тя е по избор и повечето хора я пропускат.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Ich arbeite viel, aber ich bin nicht müde.',
    parts: [
      { de: 'Ich arbeite viel', gloss: bi('a complete sentence', 'цяло изречение') },
      { de: 'aber', gloss: bi('joins, changes nothing', 'свързва, не променя нищо') },
      { de: 'ich bin nicht müde', gloss: bi('another complete sentence, with its own subject', 'друго цяло изречение, със собствен подлог') },
    ],
  },
];

export const GRAMMAR_CONCEPTS_6: GrammarConcept[] = [
  {
    id: 'g-gern-lieber',
    title: bi('gern, lieber, am liebsten', 'gern, lieber, am liebsten'),
    level: 'a1',
    summary: bi(
      'One small word after the verb says you like doing it.',
      'Една малка дума след глагола казва, че обичаш да го правиш.',
    ),
    tags: ['adverbs', 'word-order'],
    blocks: gernBlocks,
  },
  {
    id: 'g-conjunctions',
    title: bi('und, aber, oder, denn', 'und, aber, oder, denn'),
    level: 'a1',
    summary: bi(
      'Four joining words that change nothing about the word order.',
      'Четири свързващи думи, които не променят нищо в словореда.',
    ),
    tags: ['word-order', 'conjunctions'],
    blocks: conjunctionBlocks,
  },
];
