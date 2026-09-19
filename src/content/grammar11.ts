import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A2 Unit 3 grammar: dass, wenn, and the future.
 *
 * The teaching decision here is that dass and wenn are not new grammar. They do
 * to the verb exactly what weil did in Unit 2, and the lesson says so in the
 * first line rather than presenting a second rule to learn. What is new is only
 * what each word is for, and one consequence: a wenn-clause usually comes
 * first, and then the main clause has to start with its verb.
 *
 * That consequence is the hard part, and it is hard for a different reason in
 * each path. An English speaker reads "When I have time, I study German" and
 * sees nothing to change — English keeps subject-verb after the comma. A
 * Bulgarian speaker reads „Когато имам време, уча немски" and sees the same.
 * Neither language inverts, so both paths get the news, but the Bulgarian path
 * can be shown why German has no choice: the clause is one unit occupying first
 * position, and verb-second is not negotiable.
 *
 * The future is the easy half of the unit and is presented as such: German
 * mostly uses the present tense with a time word, which is one fewer thing to
 * learn than either path expects.
 */

/* ------------------------------------------------------------------ *
 * dass
 * ------------------------------------------------------------------ */

const dassBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'dass means "that", and it does to the verb exactly what weil does: sends it to the end, with a comma in front. If you can use weil, you can already use dass.',
      'dass значи „че“ и прави с глагола точно каквото прави weil: праща го в края, със запетая отпред. Ако можеш да използваш weil, вече можеш и dass.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich glaube, dass Deutsch schwer ist.', 'Ich glaube, dass Deutsch schwer ist.'),
      bi('Ich denke, dass das gut ist.', 'Ich denke, dass das gut ist.'),
      bi('Ich weiß, dass du Deutsch lernst.', 'Ich weiß, dass du Deutsch lernst.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Three verbs that need it', 'Три глагола, които го изискват'),
    text: bi(
      'glauben, denken and wissen are what make dass necessary — you rarely say them without it. Learn the three together with the word.',
      'glauben, denken и wissen са това, което прави dass нужно — рядко ги казваш без него. Учи трите заедно с думата.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('dass or das?', 'dass или das?'),
    text: bi(
      'dass with ss is the conjunction; das with one s is the article or "that thing". "Ich glaube, dass das gut ist" contains both, and both are spelt correctly.',
      'dass с ss е съюзът; das с едно s е членът или „това“. „Ich glaube, dass das gut ist“ съдържа и двете и двете са изписани правилно.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English lets you drop it — "I think German is hard" is perfectly good. German does not: the dass has to be there, and once it is, the verb has to move. Leaving it out is the commonest English-speaker mistake in this unit.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българското „че“ е точното съответствие и, за разлика от английското „that“, също не се изпуска: „Мисля, че немският е труден“. Значи думата ти е позната и запетаята също. Единствената разлика е глаголът, който на немски отива в края — както след weil.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * wenn, and what happens to the main clause
 * ------------------------------------------------------------------ */

const wennBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'wenn covers both "if" and "when", and it moves the verb like the other two. What is new is where the clause sits.',
      'wenn покрива и „ако“, и „когато“, и мести глагола като другите две. Новото е къде стои изречението.',
    ),
  },
  {
    t: 'contrast',
    de: 'Ich lerne Deutsch, wenn ich Zeit habe. / Wenn ich Zeit habe, lerne ich Deutsch.',
    other: bi(
      'I study German when I have time. / When I have time, I study German.',
      'Уча немски, когато имам време. / Когато имам време, уча немски.',
    ),
    note: bi(
      'Both are correct. The second one is where German does something your language does not.',
      'И двете са правилни. При второто немският прави нещо, което твоят език не прави.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Wenn ich Zeit habe, lerne ich Deutsch.',
    parts: [
      { de: 'Wenn ich Zeit habe,', gloss: bi('the whole clause counts as ONE thing in first position', 'цялото изречение се брои за ЕДНО нещо на първа позиция') },
      { de: 'lerne', gloss: bi('so the verb of the main clause comes second — right after the comma', 'затова глаголът на главното изречение идва втори — веднага след запетаята') },
      { de: 'ich Deutsch', gloss: bi('and the subject follows it', 'а подлогът идва след него') },
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Verb, comma, verb', 'Глагол, запетая, глагол'),
    text: bi(
      'When the wenn-clause comes first, the two verbs end up next to each other with only a comma between them: "…habe, lerne ich…". It looks wrong and it is right. If you can see two verbs meeting at the comma, you have done it correctly.',
      'Когато изречението с wenn е отпред, двата глагола се оказват един до друг, само със запетая между тях: „…habe, lerne ich…“. Изглежда грешно и е вярно. Ако виждаш два глагола да се срещат на запетаята, значи си го направил правилно.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English does not do this', ''),
    text: bi(
      'English keeps subject-then-verb after the comma: "When I have time, **I study** German." German cannot, because the whole wenn-clause is already sitting in first position and the verb has to be second. "Wenn ich Zeit habe, ich lerne Deutsch" is the mistake, and it is the one English speakers make every time.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Защо немският няма избор'),
    text: bi(
      '',
      '„Когато имам време, уча немски“ — на български след запетаята идва глаголът, защото подлогът е изпуснат, и всичко е наред. Ако сложиш подлога — „когато имам време, аз уча немски“ — пак е наред.\n\nНа немски не е. Цялото изречение с wenn се брои за *едно нещо* на първа позиция, а правилото от Pre-A1 казва: глаголът е втори. Значи веднага след запетаята идва глаголът, а после подлогът.\n\n„Wenn ich Zeit habe, ich lerne Deutsch“ е грешката. Правилното е „Wenn ich Zeit habe, lerne ich Deutsch“ — и ако видиш два глагола да се срещат на запетаята, значи е вярно.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'The same happens after any first-position phrase, and you have been doing it since Pre-A1: "Am Montag arbeite ich." A wenn-clause is just a long version of "Am Montag".',
      'Същото става след всеки израз на първа позиция и го правиш още от Pre-A1: „Am Montag arbeite ich.“ Изречението с wenn е просто дълга версия на „Am Montag“.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The future
 * ------------------------------------------------------------------ */

const futureBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has a future tense and mostly does not use it. The present tense plus a time word does the job, and that is what people say.',
      'Немският има бъдеще време и в повечето случаи не го използва. Сегашното време плюс дума за време върши работата и това е, което хората казват.',
    ),
  },
  {
    t: 'table',
    headers: [bi('What you mean', 'Какво имаш предвид'), bi('What you say', 'Какво казваш')],
    rows: [
      [bi('I will study tomorrow', 'Утре ще уча'), 'Morgen lerne ich.'],
      [bi('Next year I will move', 'Догодина ще се преместя'), 'Nächstes Jahr ziehe ich um.'],
      [bi('Maybe I will do a course', 'Може би ще карам курс'), 'Vielleicht mache ich einen Kurs.'],
    ],
    caption: bi(
      'Present tense throughout. The time word carries the future, and the verb stays in second position.',
      'Навсякъде сегашно време. Думата за време носи бъдещето, а глаголът остава на второ място.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'There is a real future with werden, and it is worth recognising rather than using: "Ich werde Deutsch lernen." Keep it for emphasis and predictions.',
      'Има истинско бъдеще с werden и си струва да го разпознаваш, вместо да го използваш: „Ich werde Deutsch lernen.“ Пази го за подчертаване и предсказания.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('werden has a second job', 'werden има и втора работа'),
    text: bi(
      'It also means "to become": "Ich möchte Lehrer werden." That is the use you need most at A2 — and note there is still no article before a profession, exactly as in Pre-A1.',
      'То значи и „ставам“: „Ich möchte Lehrer werden.“ Това е употребата, която ти трябва най-много на A2 — и забележи, че пред професия пак няма член, точно както в Pre-A1.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има ясно бъдеще с „ще“ и го използва винаги. Немският има werden и почти не го използва. Това е рядък случай, в който немският иска по-малко от теб, а не повече: кажи го в сегашно време и добави „утре“.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English does this too — "I am flying to Berlin tomorrow" is a present form with a future meaning. German simply does it more, and with the plain present rather than a continuous form it does not have.',
      '',
    ),
  },
];

export const GRAMMAR_CONCEPTS_11: GrammarConcept[] = [
  {
    id: 'g-dass',
    title: bi('dass: saying what you think', 'dass: да кажеш какво мислиш'),
    level: 'a2',
    summary: bi(
      'The same word order as weil, after glauben, denken and wissen.',
      'Същият словоред като при weil, след glauben, denken и wissen.',
    ),
    tags: ['word-order', 'conjunctions'],
    blocks: dassBlocks,
  },
  {
    id: 'g-wenn',
    title: bi('wenn, and the verb after the comma', 'wenn и глаголът след запетаята'),
    level: 'a2',
    summary: bi(
      'if and when in one word — and when its clause comes first, the main verb follows the comma.',
      '„ако“ и „когато“ в една дума — а когато изречението ѝ е отпред, главният глагол идва след запетаята.',
    ),
    tags: ['word-order', 'conjunctions'],
    blocks: wennBlocks,
  },
  {
    id: 'g-futur',
    title: bi('Talking about the future', 'Говорене за бъдещето'),
    level: 'a2',
    summary: bi(
      'Usually the present tense with a time word; werden is for emphasis, and for becoming something.',
      'Обикновено сегашно време с дума за време; werden е за подчертаване и за „ставам нещо“.',
    ),
    tags: ['verbs', 'verb-tense'],
    blocks: futureBlocks,
  },
];
