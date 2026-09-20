import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B2 Unit 1 grammar: the voice professional German is written in.
 *
 * B1 taught the passive in the present — *das Formular wird ausgefüllt* — and
 * stopped there, which is enough to read a letter from an Amt and not enough
 * to report on work. A status report is almost entirely about things that were
 * done, by nobody in particular, before now.
 *
 * Four concepts, and they are deliberately one argument rather than four
 * topics:
 *
 * **The passive across the tenses.** Only *werden* moves; the participle never
 * does. The one genuinely new form is the Perfekt, where *geworden* loses its
 * ge- and becomes **worden** — the single most recognisable B2 error when it
 * goes wrong.
 *
 * **Vorgangspassiv against Zustandspassiv.** *wird erledigt* is a thing
 * happening; *ist erledigt* is a state it is in afterwards. Both paths lose
 * this distinction in translation and they lose it in different places, which
 * is why each gets its own warning rather than a shared one.
 *
 * **The connectors of professional speech.** allerdings, dennoch and folglich
 * are not new grammar at all — they are the adverbial family from B1 Unit 4
 * with a better suit on. Saying that plainly is more useful than presenting a
 * new rule, and it lets the lesson spend its time on the error that actually
 * happens: the English "However, we should …" comma, which produces
 * *Allerdings wir sollten*.
 *
 * **Nominalisation.** The reason German reports read the way they do. A verb
 * becomes a noun, the noun takes the genitive, and a sentence that named an
 * actor stops naming one. Here the paths diverge again: English nominalises
 * just as heavily but joins with *of*, so the English instinct is sound and
 * only the genitive is new; Bulgarian joins with „на“, which maps onto *von* —
 * grammatically fine, and the wrong register in a report.
 */

/* ------------------------------------------------------------------ *
 * The passive in every tense
 * ------------------------------------------------------------------ */

const passivZeitenBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'You already build the present passive: werden plus the participle. Every other tense is the same sentence with werden in a different form. The participle never moves and never changes.',
      'Сегашният страдателен залог вече ти е познат: werden плюс причастие. Всички останали времена са същото изречение с werden в друга форма. Причастието не се мести и не се променя.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Tense', 'Време'), bi('German', 'Немски'), bi('Meaning', 'Значение')],
    rows: [
      [
        bi('Present', 'Сегашно'),
        'Der Bericht wird geschrieben.',
        bi('The report is being written.', 'Докладът се пише.'),
      ],
      [
        bi('Präteritum', 'Претеритум'),
        'Der Bericht wurde geschrieben.',
        bi('The report was written.', 'Докладът беше написан.'),
      ],
      [
        bi('Perfekt', 'Перфект'),
        'Der Bericht ist geschrieben worden.',
        bi('The report has been written.', 'Докладът е бил написан.'),
      ],
      [
        bi('With a modal', 'С модален глагол'),
        'Der Bericht muss geschrieben werden.',
        bi('The report has to be written.', 'Докладът трябва да бъде написан.'),
      ],
      [
        bi('Modal, in the past', 'Модален, в миналото'),
        'Der Bericht musste geschrieben werden.',
        bi('The report had to be written.', 'Докладът трябваше да бъде написан.'),
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('worden, not geworden', 'worden, не geworden'),
    text: bi(
      'In the Perfekt passive, werden appears as **worden** with no ge-: *Der Bericht ist geschrieben **worden***.\n\n*geworden* is the participle of the other werden — the one that means "became": *Er ist Ingenieur geworden.* Using geworden in a passive is the clearest single marker of a learner at this level.',
      'В перфекта на страдателния залог werden се явява като **worden**, без ge-: *Der Bericht ist geschrieben **worden***.\n\n*geworden* е причастието на другото werden — това, което значи „стана“: *Er ist Ingenieur geworden.* Употребата на geworden в страдателен залог е най-ясният белег за учещ на това ниво.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    title: bi('Where the written past goes', 'Къде отива писменото минало'),
    text: bi(
      'B1 Unit 5 taught that spoken German tells a story in the Perfekt and written German uses the Präteritum. The passive follows that rule and then leans harder: **wurde geschrieben** is what a report says, and *ist geschrieben worden* is what somebody says out loud.\n\nSo in a written status update, reach for wurde first.',
      'B1, раздел 5, показа, че говоримият немски разказва в перфект, а писменият използва претеритум. Страдателният залог следва това правило и дори го засилва: **wurde geschrieben** е за доклад, а *ist geschrieben worden* се казва на глас.\n\nЗатова в писмен отчет посягай първо към wurde.',
    ),
  },
  {
    t: 'de',
    de: 'Der Auftrag wurde gestern bearbeitet.',
    gloss: bi('The order was processed yesterday.', 'Поръчката беше обработена вчера.'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Die Besprechung musste verschoben werden.',
    gloss: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
    audio: true,
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English hides two verbs in one word', 'English hides two verbs in one word'),
    text: bi(
      'English builds the passive with *be*: "is written", "was written", "has been written". German uses **werden** for all of those, and keeps *sein* for something else entirely — a state, which the next concept covers.\n\nSo translating "is written" word for word gives *ist geschrieben*, which is real German and a different sentence.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['bg'],
    title: bi('Your instinct for wurde is right', 'Усетът ти за wurde е верен'),
    text: bi(
      '',
      'Българският „беше написан“ е построен точно като *wurde geschrieben*: помощен глагол в минало време плюс страдателно причастие. Тази част не е нова за теб.\n\nНовото е перфектът — *ist geschrieben **worden*** — където българският използва същото „беше/е бил написан“ и не прави разлика. Немският прави, и то само чрез тази една дума.',
    ),
  },
];

const PASSIV_ZEITEN: GrammarConcept = {
  id: 'g-passiv-zeiten',
  title: bi('The passive in every tense', 'Страдателният залог във всички времена'),
  level: 'b2',
  summary: bi(
    'Only werden changes: wird, wurde, ist … worden, muss … werden. The participle stays where it is.',
    'Само werden се променя: wird, wurde, ist … worden, muss … werden. Причастието си остава на мястото.',
  ),
  blocks: passivZeitenBlocks,
  tags: ['passive', 'tense', 'register'],
};

/* ------------------------------------------------------------------ *
 * Vorgangspassiv against Zustandspassiv
 * ------------------------------------------------------------------ */

const zustandspassivBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German draws a line that most languages leave blurred: between something happening to a thing, and the state the thing is in afterwards.',
      'Немският прекарва граница, която повечето езици оставят размита: между нещо, което се случва с даден обект, и състоянието, в което обектът е след това.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Form', 'Форма'), bi('German', 'Немски'), bi('What it says', 'Какво казва')],
    rows: [
      [
        bi('Vorgangspassiv — the event', 'Vorgangspassiv — събитието'),
        'Die Tür wird geschlossen.',
        bi('Someone is closing it right now.', 'В момента някой я затваря.'),
      ],
      [
        bi('Zustandspassiv — the state', 'Zustandspassiv — състоянието'),
        'Die Tür ist geschlossen.',
        bi('It is shut. Nothing is happening.', 'Тя е затворена. Нищо не се случва.'),
      ],
      [
        bi('Vorgangspassiv, past', 'Vorgangspassiv, минало'),
        'Der Auftrag wurde erledigt.',
        bi('It got dealt with, at some point.', 'Поръчката беше свършена, по някое време.'),
      ],
      [
        bi('Zustandspassiv, past', 'Zustandspassiv, минало'),
        'Der Auftrag war erledigt.',
        bi('It was already off the list.', 'Поръчката вече беше приключена.'),
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The test that works', 'Проверката, която върши работа'),
    text: bi(
      'Ask whether you could add **gerade** — "right now". If you can, it is werden. If the sentence is about how things stand, it is sein.\n\n*Die Tür wird gerade geschlossen* works. *Die Tür ist gerade geschlossen* does not.',
      'Питай се дали можеш да добавиш **gerade** — „точно сега“. Ако можеш, глаголът е werden. Ако изречението е за това как стоят нещата, глаголът е sein.\n\n*Die Tür wird gerade geschlossen* върви. *Die Tür ist gerade geschlossen* — не.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English cannot hear this difference', 'English cannot hear this difference'),
    text: bi(
      '"The door is closed" is both sentences at once, and which one it means depends on context that English speakers supply without noticing. That is why the German pair feels like a subtlety rather than a distinction — and why the mistake is invisible from the inside.\n\nIn an office it matters: **Das wird erledigt** is a promise, and **Das ist erledigt** is a result. Saying the second when you mean the first is claiming credit for work you have not done yet.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('Bulgarian makes the same cut, elsewhere', 'Българският прави същото разграничение, но другаде'),
    text: bi(
      '',
      'Българският различава процес от състояние, но го прави с вида на глагола, не с помощния: „вратата се затваря“ срещу „вратата е затворена“. Усетът ти за разликата е налице.\n\nВнимавай обаче с „се“: немският не образува страдателен залог с рефлексив. *Die Tür schließt sich* значи, че вратата се затваря сама, което почти никога не е това, което искаш да кажеш.',
    ),
  },
  {
    t: 'de',
    de: 'Das Protokoll wird gerade geschrieben.',
    gloss: bi('The minutes are being written right now.', 'Протоколът се пише точно сега.'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Das Protokoll ist schon geschrieben.',
    gloss: bi('The minutes are already written.', 'Протоколът вече е написан.'),
    audio: true,
  },
];

const ZUSTANDSPASSIV: GrammarConcept = {
  id: 'g-zustandspassiv',
  title: bi('wird erledigt against ist erledigt', 'wird erledigt срещу ist erledigt'),
  level: 'b2',
  summary: bi(
    'werden is the event, sein is the state it leaves behind. If gerade fits, use werden.',
    'werden е събитието, sein е състоянието след него. Ако gerade пасва, използвай werden.',
  ),
  blocks: zustandspassivBlocks,
  tags: ['passive', 'aspect'],
};

/* ------------------------------------------------------------------ *
 * The connectors of a meeting
 * ------------------------------------------------------------------ */

const konnektorenBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Nothing here is a new rule. These are the adverbial connectors from B1 Unit 4 — the family that takes the first slot and pushes the verb to second — in the register a meeting uses.',
      'Тук няма ново правило. Това са наречните свързващи думи от B1, раздел 4 — семейството, което заема първия слот и избутва глагола на второ място — в регистъра на работната среща.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Connector', 'Свързваща дума'), bi('Everyday cousin', 'Всекидневен вариант'), bi('Example', 'Пример')],
    rows: [
      ['zunächst', bi('erst, zuerst', 'erst, zuerst'), 'Zunächst schauen wir uns die Zahlen an.'],
      ['außerdem', bi('und, auch', 'und, auch'), 'Außerdem fehlt uns noch das Protokoll.'],
      ['allerdings', bi('aber', 'aber'), 'Allerdings ist der Zeitplan sehr eng.'],
      ['dennoch', bi('trotzdem', 'trotzdem'), 'Dennoch halten wir an dem Termin fest.'],
      ['folglich', bi('deshalb', 'deshalb'), 'Folglich muss der Bericht neu geschrieben werden.'],
      ['abschließend', bi('zum Schluss', 'zum Schluss'), 'Abschließend fasse ich die Ergebnisse zusammen.'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('First slot means the verb comes second', 'Първи слот значи глаголът е втори'),
    text: bi(
      'Each of these occupies position one on its own, so the conjugated verb follows immediately and the subject moves behind it:\n\n**Allerdings ist** der Zeitplan eng. — not *Allerdings der Zeitplan ist eng.*',
      'Всяка от тези думи сама заема първа позиция, затова спрегнатият глагол идва веднага след нея, а подлогът минава зад него:\n\n**Allerdings ist** der Zeitplan eng. — а не *Allerdings der Zeitplan ist eng.*',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('The "However," comma is the trap', 'The "However," comma is the trap'),
    text: bi(
      'English writes "However, we should check the figures" — connector, comma, subject, verb. Copying that shape into German gives *Allerdings, wir sollten …*, which is wrong twice over: the comma does not belong there and the verb has to come second.\n\nGerman: **Allerdings sollten wir die Zahlen prüfen.**',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('„Обаче“ обича средата', '„Обаче“ обича средата'),
    text: bi(
      '',
      'На български „обаче“ най-често стои след първия елемент: „Ние обаче трябва да проверим числата.“ Немският също позволява allerdings по средата, така че този усет работи.\n\nКапанът е, че българският няма правило за глагол на второ място. Щом сложиш allerdings отпред, глаголът трябва да го последва веднага: **Allerdings sollten wir** die Zahlen prüfen.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'Two phrases are worth learning whole, because they are what people actually say when they want the floor without being rude.',
      'Два израза си струва да се научат наведнъж, защото точно с тях хората вземат думата, без да прозвучат грубо.',
    ),
  },
  {
    t: 'de',
    de: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
    gloss: bi('I would suggest that we check the figures first.', 'Бих предложил първо да проверим числата.'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Wenn ich das richtig verstehe, geht es um den Zeitplan.',
    gloss: bi('If I understand correctly, this is about the schedule.', 'Ако разбирам правилно, става дума за графика.'),
    audio: true,
  },
];

const KONNEKTOREN_B2: GrammarConcept = {
  id: 'g-konnektoren-b2',
  title: bi('Saying something in a meeting', 'Да вземеш думата на среща'),
  level: 'b2',
  summary: bi(
    'zunächst, außerdem, allerdings, dennoch, folglich: the B1 adverbial family in a suit, with the verb still second.',
    'zunächst, außerdem, allerdings, dennoch, folglich: наречното семейство от B1 с костюм, а глаголът пак е втори.',
  ),
  blocks: konnektorenBlocks,
  tags: ['connectors', 'word-order', 'register'],
};

/* ------------------------------------------------------------------ *
 * Nominalisation
 * ------------------------------------------------------------------ */

const nominalisierungBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Professional German turns verbs into nouns and then builds the sentence around them. This is why a German report reads as heavy — and why writing one without this habit reads as a school essay.',
      'Професионалният немски превръща глаголите в съществителни и после строи изречението около тях. Затова немският доклад звучи тежко — и затова доклад, писан без този навик, звучи като училищно съчинение.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Verb', 'Глагол'), bi('Noun', 'Съществително'), bi('Ending', 'Окончание')],
    rows: [
      ['durchführen', 'die Durchführung', '-ung'],
      ['umsetzen', 'die Umsetzung', '-ung'],
      ['entscheiden', 'die Entscheidung', '-ung'],
      ['zusammenarbeiten', 'die Zusammenarbeit', bi('compound', 'сложна дума')],
      ['arbeiten', 'das Arbeiten', bi('infinitive as a noun', 'инфинитив като съществително')],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two free gender rules', 'Две безплатни правила за рода'),
    text: bi(
      'Every noun ending in **-ung** is feminine. Every infinitive used as a noun is **neuter** and is written with a capital letter: *das Arbeiten*, *beim Lesen*.\n\nGerman gender is mostly memorisation. These two rules are exceptions to that, and they cover a large part of professional vocabulary.',
      'Всяко съществително на **-ung** е от женски род. Всеки инфинитив, употребен като съществително, е от **среден** род и се пише с главна буква: *das Arbeiten*, *beim Lesen*.\n\nРодът в немския най-често се помни наизуст. Тези две правила са изключение и покриват голяма част от професионалната лексика.',
    ),
  },
  {
    t: 'contrast',
    de: 'Wir haben das Projekt durchgeführt. → die Durchführung des Projekts',
    other: bi(
      'The verb becomes a noun and what was its object takes the genitive.',
      'Глаголът става съществително, а това, което беше негово допълнение, минава в родителен падеж.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English does this too — with "of"', 'English does this too — with "of"'),
    text: bi(
      '"The implementation of the project", "the processing of the order": English nominalises just as heavily, so the instinct is already right. The only new part is that German uses the genitive where English uses *of*.\n\nOne warning in the other direction: German has **-ung** where English often has *-ing*, and *das Durchführen* is not what a report says. When a -ung noun exists, use it.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('„на“ води към von, а докладът иска родителен падеж', '„на“ води към von, а докладът иска родителен падеж'),
    text: bi(
      '',
      'Българският също номинализира — „провеждане“, „обработване“ — и свързва с „на“: провеждането **на** проекта. Най-близкото немско съответствие на „на“ е von, затова инстинктът дава *die Durchführung von dem Projekt*.\n\nТова е разбираем немски и грешен регистър — същото разграничение като при родителния падеж в B1, раздел 4. В доклад се пише **die Durchführung des Projekts**.',
    ),
  },
  {
    t: 'de',
    de: 'Die Umsetzung der Anforderungen dauert länger als geplant.',
    gloss: bi(
      'Implementing the requirements is taking longer than planned.',
      'Реализацията на изискванията отнема повече време от планираното.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Nach der Prüfung des Berichts treffen wir eine Entscheidung.',
    gloss: bi(
      'After checking the report we will take a decision.',
      'След проверката на доклада ще вземем решение.',
    ),
    audio: true,
  },
];

const NOMINALISIERUNG: GrammarConcept = {
  id: 'g-nominalisierung',
  title: bi('Turning verbs into nouns', 'Превръщане на глаголи в съществителни'),
  level: 'b2',
  summary: bi(
    'durchführen → die Durchführung des Projekts. Every -ung is feminine; every infinitive-as-noun is neuter.',
    'durchführen → die Durchführung des Projekts. Всяко -ung е от женски род; всеки инфинитив-съществително е от среден.',
  ),
  blocks: nominalisierungBlocks,
  tags: ['nominalisation', 'genitive', 'register'],
};

export const GRAMMAR_CONCEPTS_20: GrammarConcept[] = [
  PASSIV_ZEITEN,
  ZUSTANDSPASSIV,
  KONNEKTOREN_B2,
  NOMINALISIERUNG,
];
