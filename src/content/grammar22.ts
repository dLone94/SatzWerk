import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B2 Unit 3 grammar: how written German packs a paragraph.
 *
 * This unit is about reading rather than speaking, and the three structures
 * below are why a B1 learner can follow a conversation and still bounce off
 * the front page of a newspaper.
 *
 * **The extended participial attribute** — *die von der Regierung geplante
 * Reform* — is the flagship. German can put a whole clause's worth of
 * information *in front of* the noun, between the article and the noun itself,
 * and news German does it constantly.
 *
 * The paths diverge sharply, and this time Bulgarian has the advantage.
 * Bulgarian builds exactly this: „планираната от правителството реформа“ —
 * participle first, agent inside, noun last. A Bulgarian speaker recognises
 * the shape immediately and only has to learn where German puts the article.
 * English cannot do it at all: it has to unpack the block into a relative
 * clause or a postpositive participle ("the reform planned by the
 * government"), and the English path is therefore taught a reading strategy —
 * find the article, jump to the noun, then read the middle — rather than a
 * production rule.
 *
 * **The language of statistics** is small but unforgiving: *um* for the size
 * of a change and *auf* for the level it reaches. Getting them the wrong way
 * round reverses the fact.
 *
 * **The passive substitutes** — *sein* + *zu* + infinitive, *sich lassen*,
 * and the *-bar* adjective — are three ways German says "can be done" without
 * a passive. English has one of them (*-able*) and Bulgarian has one of them
 * („-им“), so each path gets one free and two new.
 */

/* ------------------------------------------------------------------ *
 * The extended participial attribute
 * ------------------------------------------------------------------ */

const partizipBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German can put a whole clause in front of a noun, between its article and the noun itself. Written German does this constantly; spoken German almost never does.',
      'Немският може да сложи цяло изречение пред съществителното — между члена и самото съществително. Писменият немски го прави постоянно; говоримият почти никога.',
    ),
  },
  {
    t: 'contrast',
    de: 'die Reform, die von der Regierung geplant wurde',
    other: bi(
      'A relative clause. Correct, and longer than a newspaper wants.',
      'Относително изречение. Правилно и по-дълго, отколкото вестникът иска.',
    ),
  },
  {
    t: 'de',
    de: 'die von der Regierung geplante Reform',
    gloss: bi(
      'the reform planned by the government',
      'планираната от правителството реформа',
    ),
    audio: true,
  },
  {
    t: 'breakdown',
    de: 'die von der Regierung geplante Reform',
    parts: [
      { de: 'die', gloss: bi('the article — it belongs to Reform', 'членът — принадлежи на Reform') },
      { de: 'von der Regierung', gloss: bi('by whom', 'от кого') },
      { de: 'geplante', gloss: bi('the participle, with an adjective ending', 'причастието, с окончание като на прилагателно') },
      { de: 'Reform', gloss: bi('the noun, at the very end', 'съществителното, най-накрая') },
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two participles, two meanings', 'Две причастия, две значения'),
    text: bi(
      '**Partizip II** is passive — the noun has it done to it: *die geplante Reform* (the reform that is planned).\n\n**Partizip I** is active — the noun does it: *die steigenden Mieten* (the rising rents). Partizip I is the infinitive plus -d, plus the adjective ending: steigen → steigend → steigende.',
      '**Partizip II** е страдателно — нещо се прави на съществителното: *die geplante Reform* (реформата, която се планира).\n\n**Partizip I** е деятелно — съществителното само върши действието: *die steigenden Mieten* (покачващите се наеми). Partizip I е инфинитив плюс -d, плюс окончанието за прилагателно: steigen → steigend → steigende.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('Read it backwards', 'Read it backwards'),
    text: bi(
      'English has no way to build this. "The by the government planned reform" is not English, and the closest it gets is a relative clause or a participle *after* the noun: "the reform planned by the government".\n\nSo for reading, use a strategy rather than a rule:\n\n1. Spot the article — **die** … and then no noun where you expect one.\n2. Jump to the end of the block: that is the noun. **Reform**.\n3. Now read the middle as a description of it.\n\nFor writing, you may keep using relative clauses. They are correct everywhere. This structure is one you need to understand at speed, not one you must produce.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('Българският прави точно това', 'Българският прави точно това'),
    text: bi(
      '',
      '„Планираната от правителството реформа“ — причастие отпред, деятелят вътре, съществителното накрая. Структурата ти е позната дума по дума.\n\nЕдинствената разлика е къде стои членът. Българският лепи члена за причастието: планиран**ата**. Немският слага отделен член в началото на целия блок: **die** von der Regierung geplante Reform.\n\nЗатова тук не учиш нова конструкция, а само това подреждане — и можеш спокойно да го използваш и в писане, не само да го разчиташ.',
    ),
  },
  {
    t: 'de',
    de: 'Die gestern veröffentlichte Studie zeigt ein anderes Bild.',
    gloss: bi(
      'The study published yesterday shows a different picture.',
      'Публикуваното вчера изследване показва друга картина.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Die in den letzten Jahren stark gestiegenen Mieten sind das Hauptthema.',
    gloss: bi(
      'Rents, which have risen sharply in recent years, are the main topic.',
      'Силно покачилите се през последните години наеми са основната тема.',
    ),
    audio: true,
  },
];

const PARTIZIPIALATTRIBUT: GrammarConcept = {
  id: 'g-partizipialattribut',
  title: bi('die von der Regierung geplante Reform', 'die von der Regierung geplante Reform'),
  level: 'b2',
  summary: bi(
    'A whole clause between the article and the noun. Article, then the block, then the noun at the end.',
    'Цяло изречение между члена и съществителното. Член, после блокът, накрая съществителното.',
  ),
  blocks: partizipBlocks,
  tags: ['participles', 'reading', 'register'],
};

/* ------------------------------------------------------------------ *
 * Statistics
 * ------------------------------------------------------------------ */

const statistikBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Two prepositions carry almost every statistic in German: um for the size of the change, auf for the level it reaches.',
      'Два предлога носят почти всяка статистика в немския: um за размера на промяната и auf за нивото, до което се стига.',
    ),
  },
  {
    t: 'table',
    headers: [bi('German', 'Немски'), bi('Means', 'Значение'), bi('Not', 'Не значи')],
    rows: [
      [
        'Die Mieten sind um 10 % gestiegen.',
        bi('They went up by 10%.', 'Покачиха се с 10%.'),
        bi('They reached 10%.', 'Достигнаха 10%.'),
      ],
      [
        'Die Miete ist auf 900 Euro gestiegen.',
        bi('It reached 900 euros.', 'Достигна 900 евро.'),
        bi('It went up by 900 euros.', 'Покачи се с 900 евро.'),
      ],
      [
        'Der Anteil beträgt 30 %.',
        bi('It is 30%, flat statement.', 'Възлиза на 30%, просто твърдение.'),
        bi('It changed.', 'Че се е променил.'),
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Prozent and Prozentpunkt', 'Prozent и Prozentpunkt'),
    text: bi(
      'From 4% to 6% is **zwei Prozentpunkte** and **fünfzig Prozent** more. German keeps the two words strictly apart, and a newspaper that mixes them is making a mistake, not a simplification.',
      'От 4% на 6% е **zwei Prozentpunkte** и **fünfzig Prozent** повече. Немският разграничава строго двете думи и вестник, който ги смесва, греши, а не опростява.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The counting phrases', 'Изразите за броене'),
    text: bi(
      '**die Zahl der** + genitive plural: *die Zahl der Anträge*. **jeder dritte**: *jeder dritte Haushalt* — one in three households. **doppelt so viele wie**: twice as many as.\n\nAll three take the singular verb they look like they should not: *Die Zahl der Anträge **ist** gesunken.*',
      '**die Zahl der** + родителен падеж, мн. ч.: *die Zahl der Anträge*. **jeder dritte**: *jeder dritte Haushalt* — всяко трето домакинство. **doppelt so viele wie**: двойно повече от.\n\nИ трите искат глагол в единствено число, макар да изглежда обратното: *Die Zahl der Anträge **ist** gesunken.*',
    ),
  },
  {
    t: 'de',
    de: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
    gloss: bi(
      'The number of applications has fallen by twelve percent.',
      'Броят на заявленията е намалял с дванайсет процента.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Laut einer Umfrage arbeitet jeder dritte Beschäftigte im Homeoffice.',
    gloss: bi(
      'According to a survey, one in three employees works from home.',
      'Според анкета всеки трети служител работи от вкъщи.',
    ),
    audio: true,
  },
];

const STATISTIK: GrammarConcept = {
  id: 'g-statistik',
  title: bi('um and auf: the grammar of a number', 'um и auf: граматиката на едно число'),
  level: 'b2',
  summary: bi(
    'um is how much it changed, auf is where it arrived. die Zahl der + genitive takes a singular verb.',
    'um е с колко се е променило, auf е докъде е стигнало. die Zahl der + родителен падеж иска глагол в единствено число.',
  ),
  blocks: statistikBlocks,
  tags: ['numbers', 'prepositions', 'reading'],
};

/* ------------------------------------------------------------------ *
 * Passive substitutes
 * ------------------------------------------------------------------ */

const passivErsatzBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has three ways of saying "can be done" without using a passive at all. Headlines love them, because each is shorter than the passive it replaces.',
      'Немският има три начина да каже „може да бъде направено“, без изобщо да използва страдателен залог. Заглавията ги обожават, защото всеки е по-кратък от страдателния залог, който замества.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Form', 'Форма'), bi('Example', 'Пример'), bi('Means', 'Значение')],
    rows: [
      [
        'sein + zu + Infinitiv',
        'Das ist nicht zu ändern.',
        bi('That cannot be changed.', 'Това не може да се промени.'),
      ],
      [
        'sich lassen',
        'Das lässt sich machen.',
        bi('That can be done.', 'Това може да се направи.'),
      ],
      [
        '-bar',
        'Der Zeitplan ist machbar.',
        bi('The schedule is doable.', 'Графикът е осъществим.'),
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('All three mean können + Passiv', 'И трите значат können + страдателен залог'),
    text: bi(
      '*Das kann nicht geändert werden* is the long form, and all three of these replace it. **sein + zu** leans formal and often carries a hint of obligation as well; **sich lassen** is the everyday one; **-bar** turns the whole idea into an adjective you can put in front of a noun.',
      '*Das kann nicht geändert werden* е дългата форма и трите конструкции я заместват. **sein + zu** клони към официалното и често носи и оттенък на задължение; **sich lassen** е всекидневната; **-bar** превръща цялата идея в прилагателно, което можеш да сложиш пред съществително.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You already own one of the three', 'You already own one of the three'),
    text: bi(
      '**-bar** is English *-able*: machbar/doable, lesbar/readable, bezahlbar/affordable. That one transfers.\n\nThe other two do not. *sich lassen* has no English shape at all — "that lets itself do" is nonsense — and it has to be learnt as a frame: **Das lässt sich** + infinitive.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('И ти имаш едната от трите', 'И ти имаш едната от трите'),
    text: bi(
      '',
      '**-bar** е българското „-им“: machbar/осъществим, lesbar/четим, bezahlbar/поносим (за цена). Това пренасяне работи.\n\n**sich lassen** също има близък еквивалент — възвратното „това се прави“, „това може да се направи“. Внимавай само да не го построиш с werden: *Das lässt sich machen*, а не *Das wird sich machen*.\n\nНовото за теб е **sein + zu + Infinitiv** — *Das ist nicht zu ändern* — където българският би казал „това не може да се промени“ и няма отделна конструкция.',
    ),
  },
  {
    t: 'de',
    de: 'Die Folgen sind noch nicht absehbar.',
    gloss: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Über den Zeitplan lässt sich reden.',
    gloss: bi('The schedule is open to discussion.', 'За графика може да се говори.'),
    audio: true,
  },
];

const PASSIV_ERSATZ: GrammarConcept = {
  id: 'g-passiv-ersatz',
  title: bi('Three ways to say "can be done"', 'Три начина да кажеш „може да се направи“'),
  level: 'b2',
  summary: bi(
    'sein + zu + Infinitiv, sich lassen, and the -bar adjective: all three replace können + Passiv.',
    'sein + zu + Infinitiv, sich lassen и прилагателното на -bar: и трите заместват können + страдателен залог.',
  ),
  blocks: passivErsatzBlocks,
  tags: ['passive', 'register', 'reading'],
};

export const GRAMMAR_CONCEPTS_22: GrammarConcept[] = [
  PARTIZIPIALATTRIBUT,
  STATISTIK,
  PASSIV_ERSATZ,
];
