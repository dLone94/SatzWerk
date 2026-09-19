import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A2 Unit 1 grammar: the Perfekt, and the two Präteritum forms nobody avoids.
 *
 * This is the single most useful structure in A2 and the two paths need
 * genuinely different explanations, not a translated one.
 *
 * For a Bulgarian speaker the danger is not the idea — Bulgarian has more past
 * tenses than German does — but the auxiliary. Bulgarian forms its perfect with
 * съм for every verb without exception: „работил съм“, „ходил съм“. German
 * splits its verbs between haben and sein, so the Bulgarian instinct produces
 * *"Ich bin gearbeitet" every time, and it produces it confidently. That is
 * authored as a trap rather than left to be discovered.
 *
 * For an English speaker the danger is the opposite. English has exactly this
 * construction — "I have worked" — and uses it for something else: English
 * forbids "I have worked yesterday" and demands the past simple. German makes
 * no such distinction, so the English speaker's problem is not building the
 * Perfekt but believing they are allowed to use it.
 *
 * The word order is the one thing both paths already own, and both are told so:
 * the bracket in "Ich habe gestern Deutsch gelernt" is the same bracket as
 * "Ich stehe um sieben Uhr auf" from A1 Unit 2.
 */

/* ------------------------------------------------------------------ *
 * The Perfekt with haben
 * ------------------------------------------------------------------ */

const perfektHabenBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'To say what you did, German uses two words: a form of haben in second position, and the verb itself — as a participle — at the very end.',
      'За да кажеш какво си правил, немският използва две думи: форма на haben на второ място и самия глагол — като причастие — чак накрая.',
    ),
  },
  {
    t: 'breakdown',
    de: 'Ich habe gestern Deutsch gelernt.',
    parts: [
      { de: 'Ich', gloss: bi('the subject', 'подлогът') },
      { de: 'habe', gloss: bi('the helper, in second position as always', 'помощният глагол, на второ място както винаги') },
      { de: 'gestern Deutsch', gloss: bi('everything else', 'всичко останало') },
      { de: 'gelernt', gloss: bi('the verb that carries the meaning — last', 'глаголът, който носи значението — последен') },
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You have built this bracket before', 'Строил си тази рамка и преди'),
    text: bi(
      'Ich stehe um sieben Uhr auf. Ich muss heute arbeiten. Ich habe gestern Deutsch gelernt. Three different structures, one shape: the grammar sits in second position, the meaning waits at the end. Nothing new is being asked of your word order.',
      'Ich stehe um sieben Uhr auf. Ich muss heute arbeiten. Ich habe gestern Deutsch gelernt. Три различни конструкции, една форма: граматиката стои на второ място, значението чака накрая. Нищо ново не се иска от словореда ти.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Now', 'Сега'), bi('Then', 'Тогава')],
    rows: [
      ['Ich arbeite.', 'Ich habe gearbeitet.'],
      ['Ich mache Sport.', 'Ich habe Sport gemacht.'],
      ['Wir kochen.', 'Wir haben gekocht.'],
      ['Sie spielt Klavier.', 'Sie hat Klavier gespielt.'],
    ],
    caption: bi(
      'haben is conjugated normally — habe, hast, hat, haben, habt, haben — and the participle never changes.',
      'haben се спряга нормално — habe, hast, hat, haben, habt, haben — а причастието не се мени изобщо.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('It is not the English present perfect', ''),
    text: bi(
      'English will not allow "I have worked yesterday" — it demands "I worked yesterday". German has no such rule. "Ich habe gestern gearbeitet" is not only correct, it is what a German speaker would actually say. Spoken German uses this one form for the whole past, and the English distinction between "I worked" and "I have worked" simply does not exist here.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Внимавай с помощния глагол'),
    text: bi(
      '',
      'Българският прави перфекта със „съм“ при всеки глагол без изключение: „работил съм“, „ходил съм“, „ял съм“. Немският не прави така. Повечето глаголи взимат haben, а „съм“-то — sein — е запазено за малка група.\n\nЗатова първият инстинкт е капан: „работил съм“ води право към *„Ich bin gearbeitet“, което е грешно. Правилното е „Ich habe gearbeitet“.\n\nЗапомни го като едно изречение: немското „имам“, не немското „съм“.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'И още една разлика, по-лесна: българското „Вчера работих“ е една дума за глагола (аорист). Немското „Gestern habe ich gearbeitet“ е две, и те са на двата края на изречението. Немският няма аорист в говоримия език — този перфект върши цялата работа.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Building the participle
 * ------------------------------------------------------------------ */

const partizipBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Most participles are built the same way: ge- at the front, -t at the end, the verb in the middle.',
      'Повечето причастия се строят еднакво: ge- отпред, -t накрая, глаголът по средата.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Verb', 'Глагол'), bi('Participle', 'Причастие'), bi('Pattern', 'Модел')],
    rows: [
      ['machen', 'gemacht', bi('ge + mach + t', 'ge + mach + t')],
      ['spielen', 'gespielt', bi('ge + spiel + t', 'ge + spiel + t')],
      ['kaufen', 'gekauft', bi('ge + kauf + t', 'ge + kauf + t')],
      ['arbeiten', 'gearbeitet', bi('an extra e, because -t after -t is unsayable', 'допълнително e, защото -t след -t не се изговаря')],
    ],
  },
  {
    t: 'p',
    text: bi(
      'Then there are three groups that do something else — and all three are predictable once you know which group a verb is in.',
      'После има три групи, които правят нещо друго — и трите са предвидими, щом знаеш в коя група е глаголът.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Group', 'Група'), bi('What changes', 'Какво се променя'), bi('Example', 'Пример')],
    rows: [
      [
        bi('Strong verbs', 'Силни глаголи'),
        bi('-en instead of -t, often a new vowel', '-en вместо -t, често нова гласна'),
        'essen → gegessen, trinken → getrunken',
      ],
      [
        bi('Separable verbs', 'Делими глаголи'),
        bi('ge- goes in the middle, after the prefix', 'ge- влиза по средата, след представката'),
        'einkaufen → eingekauft, aufstehen → aufgestanden',
      ],
      [
        bi('No ge- at all', 'Изобщо без ge-'),
        bi('verbs in -ieren, and verbs starting be-, ver-, er-', 'глаголи на -ieren и глаголи, започващи с be-, ver-, er-'),
        'studieren → studiert, besuchen → besucht',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Learn it with the verb', 'Учи го заедно с глагола'),
    text: bi(
      'A strong verb\'s participle cannot be worked out, so it is part of the word. From now on the vocabulary page shows it: gehen — ist gegangen. Learn the two together and you will never need the rule.',
      'Причастието на силен глагол не може да се изведе, затова е част от думата. Оттук нататък речникът го показва: gehen — ist gegangen. Учи ги заедно и правилото няма да ти трябва.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Идеята за причастие ти е напълно позната — българското „работил“, „ходил“, „ял“ е точно това. Разликата е само в строежа: българското причастие се мени по род и число („работил“, „работила“, „работили“), а немското не се мени никога. gemacht си е gemacht, който и да го е направил.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English has the same three groups — worked, eaten, forgotten — and the same problem of having to learn the irregular ones one at a time. What English does not have is the ge-, or the habit of sending the participle to the end of the sentence.',
      '',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The Perfekt with sein
 * ------------------------------------------------------------------ */

const perfektSeinBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A small group of verbs builds the past with sein instead of haben. They are the verbs of going somewhere and of becoming something else.',
      'Малка група глаголи прави миналото със sein вместо с haben. Това са глаголите за отиване някъде и за превръщане в нещо друго.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich bin nach Berlin gefahren. — I went to Berlin.', 'Ich bin nach Berlin gefahren. — Отидох до Берлин.'),
      bi('Wir sind zu Fuß gegangen. — We walked.', 'Wir sind zu Fuß gegangen. — Отидохме пеша.'),
      bi('Sie ist nach Sofia geflogen. — She flew to Sofia.', 'Sie ist nach Sofia geflogen. — Тя отлетя за София.'),
      bi('Ich bin um sieben aufgestanden. — I got up at seven.', 'Ich bin um sieben aufgestanden. — Станах в седем.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The test', 'Проверката'),
    text: bi(
      'Did something move from one place to another, or change from one state to another? Then sein. Everything else — and it is most verbs — takes haben.',
      'Премести ли се нещо от едно място на друго, или се промени ли от едно състояние в друго? Тогава sein. Всичко останало — а то е повечето глаголи — взима haben.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Three that break the test', 'Три, които нарушават проверката'),
    text: bi(
      'sein, bleiben and werden take sein although nothing moves. "Ich bin in Berlin gewesen", "Ich bin zu Hause geblieben". Learn these three by name; there is no rule behind them.',
      'sein, bleiben и werden взимат sein, макар нищо да не се движи. „Ich bin in Berlin gewesen“, „Ich bin zu Hause geblieben“. Научи тези три по име; правило зад тях няма.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Тук инстинктът ти най-после работи — но само тук'),
    text: bi(
      '',
      'При тези глаголи българското „съм“ и немското sein съвпадат: „ходил съм“ и „ich bin gegangen“ имат един и същ помощен глагол. Приятно е — и точно затова е опасно.\n\nСъвпадението важи само за тази малка група. При всички останали глаголи българското „съм“ води до грешка, и именно защото при gehen и fahren е било вярно, лесно се пренася там, където не е.\n\nПравилото за запомняне е обратното на инстинкта: sein е изключението, не нормата.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English used to do this too — "he is risen", "the guests are arrived" — and lost it. Nothing in modern English predicts which German verbs take sein, so the list has to be learnt: the movement verbs, plus sein, bleiben and werden.',
      '',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * war, hatte, es gab
 * ------------------------------------------------------------------ */

const praeteritumBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has a second past tense, and in speech it is used for almost nothing — except for three verbs, where it is used for almost everything.',
      'Немският има второ минало време и в говоримия език то почти не се използва — освен при три глагола, където се използва почти винаги.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Instead of', 'Вместо'), bi('Germans say', 'Немците казват'), bi('Meaning', 'Значение')],
    rows: [
      ['Ich bin gewesen', 'Ich war', bi('I was', 'бях')],
      ['Ich habe gehabt', 'Ich hatte', bi('I had', 'имах')],
      ['Es hat gegeben', 'Es gab', bi('there was / there were', 'имаше')],
    ],
  },
  {
    t: 'p',
    text: bi(
      'The Perfekt forms are not wrong, but they sound heavy. war and hatte are what you will hear, and what you should use.',
      'Формите с Perfekt не са грешни, но звучат тежко. war и hatte са това, което ще чуеш и което трябва да използваш.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Person', 'Лице'), bi('sein', 'sein'), bi('haben', 'haben')],
    rows: [
      ['ich', 'war', 'hatte'],
      ['du', 'warst', 'hattest'],
      ['er / sie / es', 'war', 'hatte'],
      ['wir', 'waren', 'hatten'],
      ['ihr', 'wart', 'hattet'],
      ['sie / Sie', 'waren', 'hatten'],
    ],
    caption: bi(
      'Note that ich and er/sie/es are identical, exactly as they are in the present tense.',
      'Забележи, че ich и er/sie/es съвпадат, точно както в сегашно време.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'One sentence worth owning whole: "Letztes Wochenende war ich in Berlin. Es war super." Two past tenses, no participles, and it is how a real conversation about the weekend starts.',
      'Едно изречение, което си струва да се знае наизуст: „Letztes Wochenende war ich in Berlin. Es war super.“ Две минали времена, без причастия, и точно така започва истински разговор за уикенда.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има и аорист, и имперфект, и перфект — повече минали времена от немския. Така че идеята за избор между форми не е нова. Новото е кой избор: немският не избира по вид на действието, а по глагол. При sein, haben и es gibt се използва простата форма, при всичко останало — перфектът. Това е навик, не граматично решение.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'This is the one place German works like English: "I was", "I had", "there was" are simple past forms in both languages, and they are used the same way. Everywhere else in spoken German, the Perfekt does the job of the English past simple.',
      '',
    ),
  },
];

export const GRAMMAR_CONCEPTS_9: GrammarConcept[] = [
  {
    id: 'g-perfekt-haben',
    title: bi('The Perfekt: haben plus a participle', 'Perfekt: haben плюс причастие'),
    level: 'a2',
    summary: bi(
      'haben in second position, the participle at the end — the bracket you already know.',
      'haben на второ място, причастието накрая — рамката, която вече познаваш.',
    ),
    tags: ['verbs', 'verb-tense', 'word-order'],
    blocks: perfektHabenBlocks,
  },
  {
    id: 'g-partizip-2',
    title: bi('Building the participle', 'Строеж на причастието'),
    level: 'a2',
    summary: bi(
      'ge- … -t for most verbs, with three groups that do it differently.',
      'ge- … -t за повечето глаголи, с три групи, които го правят другояче.',
    ),
    tags: ['verbs', 'verb-tense'],
    blocks: partizipBlocks,
  },
  {
    id: 'g-perfekt-sein',
    title: bi('The verbs that take sein', 'Глаголите, които взимат sein'),
    level: 'a2',
    summary: bi(
      'Movement and change of state — plus sein, bleiben and werden, which have no reason.',
      'Движение и промяна на състояние — плюс sein, bleiben и werden, които нямат обяснение.',
    ),
    tags: ['verbs', 'verb-tense', 'auxiliary-verb'],
    blocks: perfektSeinBlocks,
  },
  {
    id: 'g-praeteritum-war-hatte',
    title: bi('war, hatte, es gab', 'war, hatte, es gab'),
    level: 'a2',
    summary: bi(
      'The three verbs where spoken German keeps the simple past.',
      'Трите глагола, при които говоримият немски запазва простото минало.',
    ),
    tags: ['verbs', 'verb-tense'],
    blocks: praeteritumBlocks,
  },
];
