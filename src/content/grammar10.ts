import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A2 Unit 2 grammar: the two-way prepositions, the verb pairs, and weil.
 *
 * The two-way prepositions are where the two paths differ most usefully in the
 * whole level, because English already makes this distinction and Bulgarian
 * does not make it at all.
 *
 * An English speaker says "in the room" and "into the room" — two words for
 * what German does with one word and two cases. So the English path is told
 * they already own the idea and only have to move it from the preposition onto
 * the article. That turns the hardest table in A2 into a relabelling exercise.
 *
 * A Bulgarian speaker has no such pair. „в стаята" is „в стаята" whether you
 * are sitting in it or walking into it, and the direction comes from the verb
 * or from nothing at all. So the Bulgarian path gets the honest version: this
 * is a distinction your language does not draw, German draws it every time, and
 * the question to ask is wo or wohin.
 *
 * weil is the other way round: neither language moves the verb, so both paths
 * get the same news. What differs is the framing. Bulgarian word order is free,
 * so a Bulgarian speaker is used to moving words around for emphasis — and the
 * useful warning is that this one is not a choice.
 */

/* ------------------------------------------------------------------ *
 * Two-way prepositions
 * ------------------------------------------------------------------ */

const wechselBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Nine prepositions take either the dative or the accusative, and the case is not decoration: it changes what the sentence means.',
      'Девет предлога взимат или дателен, или винителен падеж, и падежът не е украса: той променя какво значи изречението.',
    ),
  },
  {
    t: 'contrast',
    de: 'Die Lampe steht in der Ecke. / Ich stelle die Lampe in die Ecke.',
    other: bi(
      'The lamp is in the corner. / I am putting the lamp into the corner.',
      'Лампата е в ъгъла. / Слагам лампата в ъгъла.',
    ),
    note: bi(
      'Same preposition, different case, different meaning: one says where it is, the other says where it is going.',
      'Един и същ предлог, различен падеж, различно значение: едното казва къде е, другото — накъде отива.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Question', 'Въпрос'), bi('Case', 'Падеж'), bi('Example', 'Пример')],
    rows: [
      [bi('wo? — where is it?', 'wo? — къде е?'), bi('dative', 'дателен'), 'Das Buch liegt auf dem Tisch.'],
      [bi('wohin? — where to?', 'wohin? — накъде?'), bi('accusative', 'винителен'), 'Ich lege das Buch auf den Tisch.'],
    ],
    caption: bi(
      'Ask the question before you choose the article. wo takes dem/der, wohin takes den/die/das.',
      'Задай въпроса, преди да избереш члена. wo взима dem/der, wohin взима den/die/das.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('The nine: in, an, auf, über, unter, vor, hinter, neben, zwischen.', 'Деветте: in, an, auf, über, unter, vor, hinter, neben, zwischen.'),
      bi('You already met neben in A1, answering wo.', 'Вече срещна neben в A1, отговарящо на wo.'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You already make this distinction', ''),
    text: bi(
      'English has two words where German has two cases: "the book is **in** the box" against "I put the book **into** the box". "On" and "onto" work the same way. So the idea is not new — German just marks it on the article instead of on the preposition, and uses the same word for both.\n\nWhen you are unsure, translate yourself into the clumsy English: if "into" or "onto" would fit, German wants the accusative.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Разлика, която българският изобщо не прави'),
    text: bi(
      '',
      'На български „в стаята“ е „в стаята“ — и когато седиш вътре, и когато влизаш. Предлогът не се мени, членът не се мени, нищо не се мени. Посоката идва от глагола („влизам“ срещу „съм“) или просто от контекста.\n\nНемският я прави всеки път и я прави върху члена. Това не е нюанс, който можеш да пропуснеш: „in der Ecke“ и „in die Ecke“ са две различни изречения.\n\nЗатова свикни да задаваш въпроса, преди да напишеш члена: wo (къде е?) или wohin (накъде?). Това е единственото решение, но се взима всеки път.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('in dem and in das are shortened', 'in dem и in das се съкращават'),
    text: bi(
      'im = in dem, ins = in das, am = an dem, ans = an das. You already know im from "im Mai" and am from "am Montag" — the same contraction, doing a different job.',
      'im = in dem, ins = in das, am = an dem, ans = an das. Вече знаеш im от „im Mai“ и am от „am Montag“ — същото сливане, друга работа.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * stellen / stehen, legen / liegen
 * ------------------------------------------------------------------ */

const verbPairBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has two verbs where English and Bulgarian have one. One verb puts something somewhere; the other says it is there.',
      'Немският има два глагола там, където английският и българският имат един. Единият слага нещо някъде; другият казва, че то е там.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Putting (wohin? + accusative)', 'Слагане (wohin? + винителен)'), bi('Being (wo? + dative)', 'Намиране (wo? + дателен)'), bi('For things that are…', 'За неща, които са…')],
    rows: [
      ['stellen', 'stehen', bi('upright', 'изправени')],
      ['legen', 'liegen', bi('flat', 'легнали')],
      ['hängen', 'hängen', bi('hanging', 'закачени')],
    ],
    caption: bi(
      'The putting verbs are regular; the being verbs are not. And hängen is both, which is why the case matters so much with it.',
      'Глаголите за слагане са правилни; тези за намиране — не. А hängen е и двете, затова падежът при него е особено важен.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich stelle die Lampe in die Ecke. → Die Lampe steht in der Ecke.', 'Ich stelle die Lampe in die Ecke. → Die Lampe steht in der Ecke.'),
      bi('Ich lege das Buch auf den Tisch. → Das Buch liegt auf dem Tisch.', 'Ich lege das Buch auf den Tisch. → Das Buch liegt auf dem Tisch.'),
      bi('Ich hänge das Bild an die Wand. → Das Bild hängt an der Wand.', 'Ich hänge das Bild an die Wand. → Das Bild hängt an der Wand.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The pair carries the case', 'Двойката носи падежа'),
    text: bi(
      'You never have to decide the case separately. stellen, legen and "hängen something" always take the accusative; stehen, liegen and "hängen (be hanging)" always take the dative. Learn the pairs and the grammar comes free.',
      'Никога не решаваш падежа отделно. stellen, legen и „hängen нещо“ винаги взимат винителен; stehen, liegen и „hängen (вися)“ винаги взимат дателен. Научи двойките и граматиката идва наготово.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има „слагам“ и „стоя/лежа/вися“, така че двойката не ти е чужда — само дето на български избираш по смисъл, а не по граматика, и никога не трябва да мислиш за падеж. На немски изборът на глагол ти казва падежа, което всъщност е добра новина: реши глагола и падежът е решен.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English has "lay" and "lie" and gets them wrong constantly — "I was laying on the beach". German keeps them strictly apart and adds a second pair for upright things, which English does not have at all: a lamp in English simply "is" in the corner.',
      '',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * weil
 * ------------------------------------------------------------------ */

const weilBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'weil means because — and it does something no word you have met so far does: it sends the verb to the end of its own half of the sentence.',
      'weil значи „защото“ — и прави нещо, което никоя дума досега не е правила: праща глагола в края на своята половина от изречението.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Ich rufe an, weil die Heizung kaputt ist.',
    parts: [
      { de: 'Ich rufe an,', gloss: bi('an ordinary main clause, verb second', 'обикновено главно изречение, глаголът втори') },
      { de: 'weil', gloss: bi('the word that changes everything after it', 'думата, която променя всичко след себе си') },
      { de: 'die Heizung kaputt', gloss: bi('subject and the rest, in the usual order', 'подлог и останалото, в обичайния ред') },
      { de: 'ist', gloss: bi('the verb, pushed to the very end', 'глаголът, изтласкан чак накрая') },
    ],
  },
  {
    t: 'contrast',
    de: 'Die Heizung ist kaputt. → …, weil die Heizung kaputt ist.',
    other: bi(
      'The heating is broken. → …, because the heating is broken.',
      'Отоплението е счупено. → …, защото отоплението е счупено.',
    ),
    note: bi(
      'Nothing moves in your language. In German the verb travels to the end.',
      'На твоя език нищо не се мести. На немски глаголът пътува до края.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The comma is not optional', 'Запетаята не е по избор'),
    text: bi(
      'German puts a comma before weil every time. It is a rule, not a matter of rhythm as it is in English.',
      'Немският слага запетая преди weil всеки път. Това е правило, а не въпрос на ритъм.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Свободният словоред тук не важи'),
    text: bi(
      '',
      'Българският словоред е свободен: „защото отоплението е счупено“ и „защото е счупено отоплението“ и двете минават, а разликата е в ударението. Свикнал си да местиш думи по усет.\n\nТук усетът не помага. След weil глаголът отива в края и това не е стилистичен избор — всичко друго е грешка. „…, weil die Heizung ist kaputt“ звучи на немско ухо точно толкова сбъркано, колкото „…, защото отоплението счупено е“ на българско.\n\nДобрата новина: правилото е едно и няма изключения.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English "because" changes nothing at all — "because the heating is broken" has exactly the order of the plain sentence. German has no equivalent of that, so this is a structure with nothing to hang it on: it has to be practised rather than understood.\n\nOne thing does help. You already push verbs to the end in German — after a modal ("Ich muss arbeiten") and in the Perfekt ("Ich habe gearbeitet"). weil sends the *conjugated* verb there too, so the end of the clause is a place you have been sending verbs since A1.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'A useful habit: say the main clause, pause at the comma, then think of the rest as a small sentence you are going to say backwards.',
      'Полезен навик: кажи главното изречение, спри на запетаята и мисли за останалото като за малко изречение, което ще кажеш отзад напред.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_10: GrammarConcept[] = [
  {
    id: 'g-wechselpraepositionen',
    title: bi('wo or wohin: the two-way prepositions', 'wo или wohin: двупосочните предлози'),
    level: 'a2',
    summary: bi(
      'Nine prepositions take the dative for where something is and the accusative for where it is going.',
      'Девет предлога взимат дателен за това къде е нещо и винителен за това накъде отива.',
    ),
    tags: ['case', 'prepositions'],
    blocks: wechselBlocks,
  },
  {
    id: 'g-stellen-legen',
    title: bi('stellen and stehen, legen and liegen', 'stellen и stehen, legen и liegen'),
    level: 'a2',
    summary: bi(
      'Two verbs where your language has one — and the pair decides the case for you.',
      'Два глагола там, където твоят език има един — и двойката решава падежа вместо теб.',
    ),
    tags: ['verbs', 'case'],
    blocks: verbPairBlocks,
  },
  {
    id: 'g-weil',
    title: bi('weil, and the verb at the end', 'weil и глаголът в края'),
    level: 'a2',
    summary: bi(
      'The first word that rearranges a clause: after weil, the verb goes last.',
      'Първата дума, която пренарежда изречението: след weil глаголът отива последен.',
    ),
    tags: ['word-order', 'conjunctions'],
    blocks: weilBlocks,
  },
];
