import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 1 grammar: relative clauses, and adjective endings after ein.
 *
 * This is the unit where the two teaching paths diverge most sharply anywhere
 * in the course, because the two starting languages are on opposite sides of
 * both topics.
 *
 * **Relative clauses.** English has quietly dismantled its relative pronoun
 * system: *who* and *whom* have collapsed into one, *that* covers everything,
 * and English drops the pronoun altogether whenever it is an object — "the
 * flat I saw" has no relative word in it at all. An English speaker therefore
 * has to learn three things: that German never drops it, that it agrees in
 * gender, and that it takes its case from its job inside the clause rather
 * than from the noun it points back to.
 *
 * Bulgarian, by contrast, has kept the whole system. *който / която / което /
 * които* agrees in gender and number exactly as German does, and *когото*
 * exists for the accusative. A Bulgarian speaker already thinks in these
 * terms, and should be told so rather than made to discover it. What is
 * genuinely new for them is the one thing Bulgarian does not do: send the verb
 * to the very end of the clause.
 *
 * **Adjective endings after ein.** A2 taught the endings after *der/die/das*
 * and said out loud that it was one corner of the system. This is the other
 * corner, and it is the one with a reason behind it rather than a table:
 * *ein* does not show gender, so the adjective has to. *ein guter Mann*, *ein
 * gutes Kind* — the -er and the -es are the der and the das, moved one word to
 * the right.
 *
 * That reason lands very differently in the two paths. An English speaker has
 * no experience of an adjective changing at all. A Bulgarian speaker has
 * something remarkably close: in Bulgarian the definite article itself moves
 * onto the adjective when the adjective comes first — *апартамент* → *големият
 * апартамент*, not *голям апартаментът*. The idea that an ending on the
 * adjective can carry what the noun's own marker would have carried is already
 * theirs; only the particular endings are new.
 */

/* ------------------------------------------------------------------ *
 * Relative clauses, nominative and accusative
 * ------------------------------------------------------------------ */

const relativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A relative clause adds information about a noun you have just named, without starting a new sentence.',
      'Относителното изречение добавя информация за съществително, което току-що си назовал, без да започваш ново изречение.',
    ),
  },
  {
    t: 'list',
    items: [
      bi(
        'Das ist die Wohnung. Sie hat einen Balkon. → Das ist die Wohnung, die einen Balkon hat.',
        'Das ist die Wohnung. Sie hat einen Balkon. → Das ist die Wohnung, die einen Balkon hat.',
      ),
      bi(
        'Das ist der Vermieter. Ich habe ihn angerufen. → Das ist der Vermieter, den ich angerufen habe.',
        'Das ist der Vermieter. Ich habe ihn angerufen. → Das ist der Vermieter, den ich angerufen habe.',
      ),
    ],
  },
  {
    t: 'p',
    text: bi(
      'Two things decide the relative pronoun, and they come from different places. The gender comes from the noun in front. The case comes from the job the pronoun does inside its own clause.',
      'Две неща определят относителното местоимение и те идват от различни места. Родът идва от съществителното отпред. Падежът идва от ролята, която местоимението изпълнява вътре в своето изречение.',
    ),
  },
  {
    t: 'table',
    headers: [
      bi('Its job in the clause', 'Роля в изречението'),
      bi('masculine', 'мъжки род'),
      bi('feminine', 'женски род'),
      bi('neuter', 'среден род'),
      bi('plural', 'мн. число'),
    ],
    rows: [
      [bi('subject (nominative)', 'подлог (Nominativ)'), 'der', 'die', 'das', 'die'],
      [bi('object (accusative)', 'допълнение (Akkusativ)'), 'den', 'die', 'das', 'die'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You already know this table', 'Тази таблица вече я знаеш'),
    text: bi(
      'It is the definite article, unchanged. der, die, das, den — the same six forms you have been using since Pre-A1. Only one of them differs from the article, and it is not in this table yet.',
      'Това е определителният член, непроменен. der, die, das, den — същите форми, които използваш още от Pre-A1. Само една се различава от члена и тя още не е в тази таблица.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The verb goes to the very end', 'Глаголът отива най-накрая'),
    text: bi(
      'A relative clause is a subordinate clause, so the conjugated verb stands last — exactly as after weil, dass and wenn. "…, die einen Balkon hat." "…, den ich angerufen habe."\n\nAnd the comma is not optional in German. Every relative clause has one.',
      'Относителното изречение е подчинено, затова спрегнатият глагол стои последен — точно както след weil, dass и wenn. „…, die einen Balkon hat.“ „…, den ich angerufen habe.“\n\nИ запетаята на немски не е по избор. Всяко относително изречение има такава.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English drops it. German never does.', ''),
    text: bi(
      'English lets you leave the relative pronoun out whenever it is the object: "the flat I saw", "the landlord I called". Both are perfectly good English with nothing where the pronoun would be.\n\nGerman cannot do this. *die Wohnung ich gesehen habe* is not a sentence — it is die Wohnung, **die** ich gesehen habe. The pronoun is compulsory, every time, and leaving it out is the single most common English-speaker error in this whole topic.\n\nThe second thing English no longer does is agree. "That" covers a man, a flat and a set of keys alike. German picks der, die or das from the gender of the noun in front, then changes it again for the case — so one English word becomes a choice between four.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['bg'],
    title: bi('', 'Тук българският ти дава голямо предимство'),
    text: bi(
      '',
      'Българският има точно тази система и я е запазил цяла. „който, която, което, които“ се съгласува по род и число със съществителното отпред — точно както немското der, die, das. А за винителен при лица имаш и „когото“.\n\nЗначи идеята, която на англичанина се обяснява от нулата — че местоимението взима рода от едно място, а формата си от друго — ти вече я мислиш всеки ден:\n\n• Това е апартаментът, **който** има балкон. → Das ist die Wohnung, **die** einen Balkon hat.\n• Това е наемодателят, **когото** потърсих. → Das ist der Vermieter, **den** ich angerufen habe.\n\nНовото е едно-единствено нещо: в немското относително изречение спрегнатият глагол отива най-накрая. Българският го оставя на мястото му („който **има** балкон“), немският го изпраща в края („die einen Balkon **hat**“). Това е цялата нова работа тук — останалото вече е твое.\n\nВнимавай само с едно: разговорното „дето“ няма немски еквивалент. Немският има само пълната форма и никога не я пропуска.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The trap: taking the case from the wrong clause', 'Капанът: падеж от грешното изречение'),
    text: bi(
      'In "Das ist der Vermieter, den ich angerufen habe", der Vermieter is the subject of the main sentence — but inside the relative clause he is the one being called, so the pronoun is den, not der. The noun in front gives you the gender and nothing else.',
      'В „Das ist der Vermieter, den ich angerufen habe“ der Vermieter е подлог на главното изречение — но вътре в относителното него го търсят по телефона, затова местоимението е den, а не der. Съществителното отпред ти дава рода и нищо повече.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Adjective endings after ein, kein and the possessives
 * ------------------------------------------------------------------ */

const adjEinBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A2 taught the endings after der, die and das. After ein, kein and mein they are slightly different, and there is a reason rather than a rule to memorise.',
      'На ниво A2 научи окончанията след der, die и das. След ein, kein и mein те са малко различни и зад това стои причина, а не правило за наизустяване.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The whole idea in one line', 'Цялата идея в един ред'),
    text: bi(
      'der, die and das show the gender. ein does not — ein Mann and ein Kind look identical. So when the article cannot show it, the adjective does.',
      'der, die и das показват рода. ein не го показва — ein Mann и ein Kind изглеждат еднакво. Затова, когато членът не може да го покаже, прилагателното го прави.',
    ),
  },
  {
    t: 'table',
    headers: [
      bi('Gender and job', 'Род и роля'),
      bi('with der/die/das', 'с der/die/das'),
      bi('with ein/kein/mein', 'с ein/kein/mein'),
    ],
    rows: [
      [bi('masculine, subject', 'мъжки род, подлог'), 'der helle Raum', 'ein hell**er** Raum'],
      [bi('feminine', 'женски род'), 'die helle Wohnung', 'eine helle Wohnung'],
      [bi('neuter', 'среден род'), 'das helle Zimmer', 'ein hell**es** Zimmer'],
      [bi('masculine, object', 'мъжки род, допълнение'), 'den hellen Raum', 'einen hellen Raum'],
    ],
  },
  {
    t: 'p',
    text: bi(
      'Only two forms are new: -er for the masculine subject and -es for the neuter. Everywhere else the ending is the one you already learnt. Those two are exactly the two places where ein hides a gender that der and das showed.',
      'Само две форми са нови: -er за мъжки род подлог и -es за среден род. Навсякъде другаде окончанието е това, което вече си научил. А тези две са точно местата, където ein скрива род, който der и das показваха.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English adjectives never move', ''),
    text: bi(
      'In English "a bright room", "a bright flat" and "bright rooms" all use the same word. Nothing about the noun reaches the adjective, ever.\n\nSo in German the whole idea is new, not just the endings — and the useful way to hold it is not as a table but as a job. The ending is doing work: it is telling you the gender that *ein* refused to tell you. ein heller Raum has -er because der Raum is masculine and ein could not say so.\n\nOne practical comfort: flat advertisements are written in exactly this structure and nothing else. "Helle 2-Zimmer-Wohnung mit großem Balkon in ruhiger Lage" is four endings in one line, and reading a dozen adverts teaches them faster than any table.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Българският прави нещо изненадващо подобно'),
    text: bi(
      '',
      'В българския прилагателното също се променя по род: голям апартамент, голяма къща, голямо жилище. Дотук нищо ново — това вече го умееш и за немския трябва само да научиш кои са окончанията.\n\nНо има и втора, по-дълбока прилика. Когато в българския определителността се появи, тя се мести върху прилагателното, ако то е отпред:\n\n• апартамент → апартамент**ът**\n• голям апартамент → голям**ият** апартамент, а не *голям апартаментът*\n\nТоест българският вече прави точно това, което немският прави тук: слага върху прилагателното знака, който иначе стои при съществителното. Немското „ein heller Raum“ е същата идея — членът не може да покаже рода, затова прилагателното го показва вместо него.\n\nРазликата е коя информация се мести. В българския се мести определителността. В немския се мести родът (и падежът). Механизмът обаче ти е познат, което прави тези окончания въпрос на запомняне, а не на нов начин на мислене.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Two spelling traps', 'Два правописни капана'),
    text: bi(
      'dunkel loses its -e- when an ending is added: ein dunkles Zimmer, not *dunkeles*. teuer does the same: eine teure Wohnung. hoch goes further and changes its consonant: ein hohes Haus.',
      'dunkel губи своето -e-, когато се добави окончание: ein dunkles Zimmer, не *dunkeles*. teuer прави същото: eine teure Wohnung. hoch отива по-далеч и сменя съгласната: ein hohes Haus.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Relative clauses in the dative, and after a preposition
 * ------------------------------------------------------------------ */

const relativeDativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'The relative pronoun takes whatever case its job inside the clause demands — including the dative, and including the case a preposition imposes.',
      'Относителното местоимение взима падежа, който изисква ролята му вътре в изречението — включително дателен и включително падежа, който налага предлогът.',
    ),
  },
  {
    t: 'table',
    headers: [
      bi('Its job in the clause', 'Роля в изречението'),
      bi('masculine', 'мъжки род'),
      bi('feminine', 'женски род'),
      bi('neuter', 'среден род'),
      bi('plural', 'мн. число'),
    ],
    rows: [
      [bi('subject', 'подлог'), 'der', 'die', 'das', 'die'],
      [bi('object', 'допълнение'), 'den', 'die', 'das', 'die'],
      [bi('dative', 'дателен'), 'dem', 'der', 'dem', 'denen'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('denen is the one word that is not an article', 'denen е единствената дума, която не е член'),
    text: bi(
      'Every other form in the table is the definite article you already know. The dative plural is denen, not den — it is the only form you have to learn separately, so it is worth learning once, properly.',
      'Всяка друга форма в таблицата е определителният член, който вече знаеш. Дателен множествено число е denen, а не den — това е единствената форма, която трябва да се научи отделно, затова си струва да се научи веднъж и както трябва.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'When a preposition belongs to the relative pronoun, it goes in front of it and the clause starts with the pair.',
      'Когато предлог принадлежи на относителното местоимение, той застава пред него и изречението започва с двойката.',
    ),
  },
  {
    t: 'list',
    items: [
      bi(
        'Das ist die Wohnung, in der ich wohne. — the flat I live in',
        'Das ist die Wohnung, in der ich wohne. — апартаментът, в който живея',
      ),
      bi(
        'Der Nachbar, mit dem ich gesprochen habe, war sehr nett.',
        'Der Nachbar, mit dem ich gesprochen habe, war sehr nett.',
      ),
      bi(
        'Die Leute, mit denen wir im Haus wohnen, sind ruhig.',
        'Die Leute, mit denen wir im Haus wohnen, sind ruhig.',
      ),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('The preposition cannot go to the end', ''),
    text: bi(
      'English happily strands a preposition at the end: "the flat I live in", "the neighbour I spoke to". German cannot. The preposition moves to the front of the clause and drags the relative pronoun with it: in der ich wohne, mit dem ich gesprochen habe.\n\nIf you find yourself with a spare preposition at the end of a German relative clause, it belongs at the start.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['bg'],
    title: bi('', 'Тук българският отново е на твоя страна'),
    text: bi(
      '',
      'Българският прави точно същото: предлогът стои пред относителното местоимение, не в края.\n\n• апартаментът, **в който** живея → die Wohnung, **in der** ich wohne\n• съседът, **с когото** говорих → der Nachbar, **mit dem** ich gesprochen habe\n\nАнглийският тук греши системно („the flat I live in“ — предлогът увисва в края), а ти нямаш този навик. Единственото, което трябва да следиш, е кой падеж иска предлогът: in при „къде“ иска Dativ, mit винаги иска Dativ — и оттам се избира формата.\n\nИ пак: глаголът отива в края. Това остава единствената наистина нова стъпка.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_14: GrammarConcept[] = [
  {
    id: 'g-relativsatz',
    title: bi('Relative clauses: der, die, das, den', 'Относителни изречения: der, die, das, den'),
    level: 'b1',
    summary: bi(
      'Gender from the noun in front, case from the job inside the clause, verb at the end — and the pronoun is never dropped.',
      'Родът идва от съществителното отпред, падежът — от ролята вътре в изречението, глаголът отива в края — а местоимението никога не се пропуска.',
    ),
    tags: ['word-order', 'case', 'pronoun'],
    blocks: relativeBlocks,
  },
  {
    id: 'g-adjektiv-ein',
    title: bi('Adjective endings after ein', 'Окончания на прилагателните след ein'),
    level: 'b1',
    summary: bi(
      'ein cannot show the gender, so the adjective does: ein heller Raum, ein helles Zimmer.',
      'ein не може да покаже рода, затова прилагателното го прави: ein heller Raum, ein helles Zimmer.',
    ),
    tags: ['adjective-ending', 'gender', 'case'],
    blocks: adjEinBlocks,
  },
  {
    id: 'g-relativsatz-dativ',
    title: bi('Relative clauses in the dative and after prepositions', 'Относителни изречения в дателен и след предлог'),
    level: 'b1',
    summary: bi(
      'dem, der, dem, denen — and the preposition stands in front of the pronoun, never at the end.',
      'dem, der, dem, denen — а предлогът стои пред местоимението, никога в края.',
    ),
    tags: ['case', 'preposition', 'word-order'],
    blocks: relativeDativeBlocks,
  },
];
