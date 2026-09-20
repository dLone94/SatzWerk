import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 2 grammar: the passive, and the infinitive with zu.
 *
 * Unit 1 gave the Bulgarian path a large head start on relative clauses. This
 * unit reverses it, and says so — a course that only ever tells one learner
 * they are lucky is not being honest with the other.
 *
 * **The passive.** Both starting languages have one, so neither meets a new
 * idea, but they build it differently and each difference produces its own
 * predictable error.
 *
 * English forms the passive with *be*: "the form is filled in". German uses
 * **werden**, and *sein* + participle means something else entirely — a
 * finished state rather than an action. So an English speaker writing
 * *Das Formular ist ausgefüllt* has said "the form is (already) filled in",
 * which is true German and the wrong sentence.
 *
 * Bulgarian mostly avoids the construction altogether and uses the reflexive:
 * *формулярът се попълва*. There is no German equivalent to that «се» here, so
 * the Bulgarian instinct produces *Das Formular füllt sich aus*, which is not
 * German at all. On the other hand, Bulgarian's «от» maps exactly onto German
 * *von* for the agent, which English's "by" also does — so that half is free
 * for both.
 *
 * **The infinitive with zu.** Here the advantage flips hard. English has
 * almost exactly this construction — "I hope to come", "it is important to
 * register" — so an English speaker needs only the word order. Bulgarian has
 * no infinitive at all; it lost it centuries ago and uses «да» plus a
 * conjugated verb: *надявам се да дойда*. A Bulgarian speaker's instinct is
 * therefore to conjugate the second verb too, and to reach for *dass* where
 * German wants a bare infinitive. That is a genuinely deep structural
 * difference, not a vocabulary one, and the Bulgarian path is given the most
 * space in this unit because it needs it.
 */

/* ------------------------------------------------------------------ *
 * The present passive
 * ------------------------------------------------------------------ */

const passiveBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'The passive says what happens to something without saying who does it. German builds it with werden plus the participle you already know from the Perfekt.',
      'Страдателният залог казва какво се случва с нещо, без да казва кой го прави. Немският го строи с werden плюс причастието, което вече знаеш от Perfekt.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Active', 'Деятелен'), bi('Passive', 'Страдателен')],
    rows: [
      ['Der Beamte füllt das Formular aus.', 'Das Formular **wird** ausgefüllt.'],
      ['Die Behörde prüft den Antrag.', 'Der Antrag **wird** geprüft.'],
      ['Man schickt die Bescheinigung per Post.', 'Die Bescheinigung **wird** per Post geschickt.'],
    ],
  },
  {
    t: 'p',
    text: bi(
      'The recipe is short: werden conjugated in second position, participle at the end. Nothing else moves.',
      'Рецептата е кратка: werden, спрегнато на второ място, причастие в края. Нищо друго не се мести.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('ich werde … / du wirst … / er wird …', 'ich werde … / du wirst … / er wird …'),
      bi('Das Formular wird ausgefüllt. — The form is filled in.', 'Das Formular wird ausgefüllt. — Формулярът се попълва.'),
      bi('Die Unterlagen werden geprüft. — The documents are checked.', 'Die Unterlagen werden geprüft. — Документите се проверяват.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Why official German is full of it', 'Защо официалният немски е пълен с него'),
    text: bi(
      'A letter from an Amt almost never says who does anything. "Der Antrag wird geprüft" — by whom? It does not say, and that is the point: the office speaks as an institution rather than as a person.\n\nThis is why reading the passive matters more here than producing it. You will meet ten of these for every one you write.',
      'Писмо от Amt почти никога не казва кой какво прави. „Der Antrag wird geprüft“ — от кого? Не се казва, и точно това е смисълът: службата говори като институция, не като човек.\n\nЗатова тук е по-важно да разпознаваш страдателния залог, отколкото сам да го образуваш. Ще срещнеш по десет такива изречения за всяко, което ще напишеш.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'If you do want to name who does it, German uses von plus the dative.',
      'Ако все пак искаш да кажеш кой го прави, немският използва von плюс дателен падеж.',
    ),
  },
  {
    t: 'de',
    de: 'Der Antrag wird von der Behörde geprüft.',
    gloss: bi(
      'The application is checked by the authority.',
      'Заявлението се проверява от ведомството.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('werden, not sein — and the difference is real', ''),
    text: bi(
      'English builds the passive with "be": the form **is** filled in. German uses **werden**, and this is the one place where translating the English word gets you a grammatical sentence that means something else.\n\n• Das Formular **wird** ausgefüllt. — The form is being filled in. Something is happening.\n• Das Formular **ist** ausgefüllt. — The form is (already) filled in. Nothing is happening; this describes a finished state.\n\nBoth are correct German. Only the first is the passive. If you are reporting an action, it is werden — every time.\n\nThe agent is the easy half: von is "by", it behaves exactly as you expect, and it takes the dative.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Тук „се“ няма къде да отиде'),
    text: bi(
      '',
      'Българският най-често избягва страдателния залог и ползва възвратна форма: формулярът **се** попълва, заявлението **се** проверява, документите **се** изпращат.\n\nНемският няма такъв изход. Това „се“ няма немски еквивалент в тази конструкция, а буквалният превод дава нещо, което изобщо не е немски:\n\n• *Das Formular füllt sich aus* — не значи нищо. Звучи, все едно формулярът се попълва сам.\n• Das Formular **wird** ausgefüllt. — това е правилното.\n\nЗапомни го като размяна: където българският слага „се“, немският слага **werden** плюс причастие. Това е цялата операция.\n\nЕдно нещо обаче ти е подарък: „от“ при деятеля е точно **von** — Der Antrag wird **von der Behörde** geprüft. Тук нищо не се променя освен падежа, а von винаги иска дателен.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('With a modal verb', 'С модален глагол'),
    text: bi(
      'Official German constantly says what must be done. The modal is conjugated, and werden goes to the end as an infinitive, behind the participle.\n\n• Der Antrag **muss** bis Freitag eingereicht **werden**.\n• Die Unterlagen **können** auch später abgegeben **werden**.',
      'Официалният немски постоянно казва какво трябва да се направи. Модалният глагол се спряга, а werden отива в края като инфинитив, зад причастието.\n\n• Der Antrag **muss** bis Freitag eingereicht **werden**.\n• Die Unterlagen **können** auch später abgegeben **werden**.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The infinitive with zu
 * ------------------------------------------------------------------ */

const zuInfinitiveBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Many German verbs and expressions are followed by a second verb in the infinitive, with zu in front of it — and the whole thing sits at the end of the sentence.',
      'Много немски глаголи и изрази се следват от втори глагол в инфинитив със zu пред него — и цялото нещо стои в края на изречението.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich hoffe, bald einen Termin zu bekommen.', 'Ich hoffe, bald einen Termin zu bekommen.'),
      bi('Es ist wichtig, sich rechtzeitig anzumelden.', 'Es ist wichtig, sich rechtzeitig anzumelden.'),
      bi('Ich habe vergessen, das Formular mitzubringen.', 'Ich habe vergessen, das Formular mitzubringen.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('A separable verb swallows the zu', 'Отделяемият глагол поглъща zu'),
    text: bi(
      'With a separable verb the zu goes **inside**, between the prefix and the stem, and it is written as one word: anmelden → an**zu**melden, mitbringen → mit**zu**bringen, ausfüllen → aus**zu**füllen.\n\nAn inseparable verb keeps zu in front, separately: zu beantragen, zu bekommen.',
      'При отделяем глагол zu отива **вътре**, между представката и основата, и се пише слято: anmelden → an**zu**melden, mitbringen → mit**zu**bringen, ausfüllen → aus**zu**füllen.\n\nПри неотделяем глагол zu стои отпред, отделно: zu beantragen, zu bekommen.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'For a purpose — in order to do something — German uses um … zu.',
      'За цел — за да направиш нещо — немският използва um … zu.',
    ),
  },
  {
    t: 'de',
    de: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
    gloss: bi(
      'I am going to the citizens’ office in order to register.',
      'Отивам в гражданската служба, за да се регистрирам.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['en'],
    title: bi('This one is nearly free', ''),
    text: bi(
      'English has this construction almost exactly: "I hope to get an appointment", "it is important to register", "I forgot to bring the form". Same idea, same verbs, same meaning.\n\nThree small things to add:\n\n• The infinitive goes to the **end**: Ich hoffe, bald einen Termin **zu bekommen**.\n• A separable verb swallows the zu: an**zu**melden, not "zu anmelden".\n• "in order to" is um … zu, and the German is not optional the way the English is. English lets you say "I went to the office to register"; German wants um … zu.\n\nAfter relative clauses, this should feel like a rest.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Тук българският не може да ти помогне — и си струва да се каже защо'),
    text: bi(
      '',
      'Българският няма инфинитив. Изгубил го е преди векове и на негово място използва „да“ плюс **спрегнат** глагол:\n\n• надявам се **да получа** час\n• важно е **да се регистрираш**\n• забравих **да донеса** формуляра\n\nЗабележи, че във всеки от тези примери вторият глагол се мени по лице: получа, регистрираш, донеса. Точно този навик създава грешката на немски — второто глаголно лице се спряга и вместо инфинитив излиза изречение с dass:\n\n• *Ich hoffe, dass ich bald einen Termin bekomme* — граматично вярно, но тежко и почти никога не се казва така.\n• Ich hoffe, bald einen Termin **zu bekommen**. — това е естественото.\n\nПравилото за превод е просто и работи почти винаги: **където българският казва „да“ + глагол и двете части имат едно и също подлежащо лице, немският казва zu + инфинитив.** Глаголът не се мени изобщо — оставаш го в речниковата му форма и го слагаш най-накрая.\n\nКогато лицата са различни („искам ти да дойдеш“), тогава наистина трябва dass: Ich möchte, dass du kommst. Това е границата между двете конструкции.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The comma', 'Запетаята'),
    text: bi(
      'German puts a comma before a zu-infinitive group when it has more than just the zu and the verb — which is nearly always in practice. Ich hoffe, bald einen Termin zu bekommen.',
      'Немският слага запетая пред групата със zu, когато тя съдържа нещо повече от zu и глагола — тоест почти винаги на практика. Ich hoffe, bald einen Termin zu bekommen.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_15: GrammarConcept[] = [
  {
    id: 'g-passiv',
    title: bi('The passive: werden plus the participle', 'Страдателен залог: werden плюс причастие'),
    level: 'b1',
    summary: bi(
      'werden in second position, participle at the end — and sein plus a participle means something different.',
      'werden на второ място, причастие в края — а sein плюс причастие значи друго.',
    ),
    tags: ['verb-conjugation', 'word-order'],
    blocks: passiveBlocks,
  },
  {
    id: 'g-zu-infinitiv',
    title: bi('The infinitive with zu, and um … zu', 'Инфинитив със zu и um … zu'),
    level: 'b1',
    summary: bi(
      'zu plus the infinitive at the end of the sentence — inside a separable verb, and um … zu for a purpose.',
      'zu плюс инфинитив в края на изречението — вътре при отделяем глагол и um … zu за цел.',
    ),
    tags: ['word-order', 'verb-conjugation'],
    blocks: zuInfinitiveBlocks,
  },
];
