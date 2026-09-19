import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 6 grammar: how a German argument is built.
 *
 * The last grammar of the level, and it is deliberately not a new structure.
 * By this point the learner has every clause type German uses; what they do
 * not have is the *shape* of an argument — the fixed phrases that signal
 * "here comes my position", "here comes the other side", "here comes my
 * conclusion".
 *
 * Three things are taught:
 *
 * **Stating a position.** *Meiner Meinung nach* is a fixed phrase with a
 * preposition standing behind its noun, which German almost never does
 * otherwise; it has to be learnt whole rather than built. *Ich finde, dass …*
 * is its everyday equivalent and far commoner in speech. Both paths need the
 * same warning here, and it is a word-order one: *Meiner Meinung nach* takes
 * position one, so the verb comes second.
 *
 * **Weighing two sides.** *einerseits … andererseits* is the same adverb rule
 * from Unit 4 wearing a new coat, and saying so out loud is more useful than
 * presenting it as a new pattern.
 *
 * **Written register.** German formal writing is more fixed than English or
 * Bulgarian formal writing: there are phrases everyone uses, in the same
 * places, and reproducing them is expected rather than lazy. That is worth
 * saying plainly, because a learner from either background tends to translate
 * their own politeness instead — and translated politeness reads as odd in a
 * language where the formula exists.
 *
 * The one genuinely new grammatical point is small: the comma after the
 * salutation, and the small letter that follows it. It is the single most
 * visible marker of someone who has learnt to write German properly.
 */

/* ------------------------------------------------------------------ *
 * Stating a position
 * ------------------------------------------------------------------ */

const opinionBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has a small set of fixed openings for an opinion. They are formulaic, and that is the point — a listener recognises instantly that a position is coming.',
      'Немският има малък набор устойчиви начала за мнение. Те са шаблонни и точно това е смисълът — слушателят веднага разбира, че следва позиция.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Phrase', 'Израз'), bi('Register', 'Регистър'), bi('Example', 'Пример')],
    rows: [
      ['Ich finde, dass …', bi('everyday, spoken', 'всекидневен, говорим'), 'Ich finde, dass wir mehr tun sollten.'],
      ['Meiner Meinung nach …', bi('neutral to formal', 'неутрален до официален'), 'Meiner Meinung nach ist das keine gute Idee.'],
      ['Ich bin der Meinung, dass …', bi('formal, written', 'официален, писмен'), 'Ich bin der Meinung, dass sich etwas ändern muss.'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Meiner Meinung nach takes position one', 'Meiner Meinung nach заема първа позиция'),
    text: bi(
      'It is a phrase standing in the first slot, so the verb comes second and the subject moves behind it: **Meiner Meinung nach ist das** keine gute Idee — not *Meiner Meinung nach das ist*.\n\nThis is the same rule as heute, trotzdem and deshalb. It has held since Pre-A1 and it holds here.',
      'Това е израз в първия слот, затова глаголът идва втори, а подлогът минава зад него: **Meiner Meinung nach ist das** keine gute Idee — а не *Meiner Meinung nach das ist*.\n\nСъщото правило като при heute, trotzdem и deshalb. Валидно е още от Pre-A1 и важи и тук.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The preposition is behind the noun', 'Предлогът е зад съществителното'),
    text: bi(
      'nach normally stands in front of its noun — nach Hause, nach dem Essen. In this one phrase it stands behind: meiner Meinung **nach**. Learn the phrase whole; do not build it from parts.',
      'nach обикновено стои пред съществителното — nach Hause, nach dem Essen. В този единствен израз стои зад него: meiner Meinung **nach**. Научи израза наведнъж; не го сглобявай от части.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Agreeing takes the dative, with no preposition', 'Съгласяването иска дателен, без предлог'),
    text: bi(
      'ich stimme **dir** zu — not *mit dir*. English "agree with" and Bulgarian „съгласен с“ both invite a preposition that German does not want here. The alternative, *ich bin **mit dir** einverstanden*, does take mit — so the two have to be kept apart.',
      'ich stimme **dir** zu — а не *mit dir*. Английското „agree with“ и българското „съгласен с“ и двете подсказват предлог, който немският тук не иска. Другият вариант, *ich bin **mit dir** einverstanden*, взима mit — затова двата трябва да се държат отделно.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Weighing both sides
 * ------------------------------------------------------------------ */

const balanceBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A B1 argument is expected to look at both sides before it lands. German has a matched pair for exactly this.',
      'От аргумент на ниво B1 се очаква да погледне и двете страни, преди да заключи. Немският има точно за това готова двойка.',
    ),
  },
  {
    t: 'de',
    de: 'Einerseits ist es praktisch, andererseits ist es teuer.',
    gloss: bi(
      'On the one hand it is practical, on the other it is expensive.',
      'От една страна е практично, от друга е скъпо.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You already know this word order', 'Този словоред вече го знаеш'),
    text: bi(
      'einerseits and andererseits are adverbs, like trotzdem and deshalb from Unit 4. Both take position one, so both push the verb to second place: einerseits **ist** es …, andererseits **ist** es …\n\nNothing new — the same rule, a different pair of words.',
      'einerseits и andererseits са наречия, като trotzdem и deshalb от раздел 4. И двете заемат първа позиция, затова и двете бутат глагола на второ място: einerseits **ist** es …, andererseits **ist** es …\n\nНищо ново — същото правило, друга двойка думи.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'The useful vocabulary for it is a matched pair too: der Vorteil and der Nachteil.',
      'Полезната лексика за това също е двойка: der Vorteil и der Nachteil.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Der größte Vorteil ist die Flexibilität.', 'Der größte Vorteil ist die Flexibilität.'),
      bi('Ein Nachteil ist, dass man weniger Kontakt hat.', 'Ein Nachteil ist, dass man weniger Kontakt hat.'),
      bi('Es gibt mehrere Gründe dafür.', 'Es gibt mehrere Gründe dafür.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The shape of a B1 written argument', 'Формата на писмен аргумент на ниво B1'),
    text: bi(
      'Position, one side, the other side, conclusion. Four paragraphs and four phrases: Meiner Meinung nach … / Einerseits … / Andererseits … / Zusammenfassend kann man sagen, dass …\n\nThat skeleton is what an examiner is looking for, and it is what a German reader expects.',
      'Позиция, едната страна, другата страна, заключение. Четири абзаца и четири израза: Meiner Meinung nach … / Einerseits … / Andererseits … / Zusammenfassend kann man sagen, dass …\n\nТози скелет е това, което търси изпитващият, и това, което очаква немският читател.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The written register
 * ------------------------------------------------------------------ */

const formalWritingBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A formal German letter or email is more fixed than you may expect. There are phrases everyone uses, in the same places, and using them is expected rather than unimaginative.',
      'Официалното немско писмо или имейл е по-стандартизирано, отколкото може да очакваш. Има изрази, които всички използват, на едни и същи места, и използването им се очаква, а не се смята за липса на въображение.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Where', 'Къде'), bi('What to write', 'Какво да напишеш')],
    rows: [
      [bi('Opening, named person', 'Начало, познат адресат'), 'Sehr geehrte Frau Weber,'],
      [bi('Opening, unknown', 'Начало, непознат адресат'), 'Sehr geehrte Damen und Herren,'],
      [bi('Announcing the point', 'Обявяване на темата'), 'Hiermit teile ich Ihnen mit, dass …'],
      [bi('Offering to answer questions', 'Готовност за въпроси'), 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.'],
      [bi('Closing', 'Завършек'), 'Mit freundlichen Grüßen'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The comma, and the small letter after it', 'Запетаята и малката буква след нея'),
    text: bi(
      'German puts a comma after the salutation, and the next line begins with a **small** letter, because the sentence has not started yet:\n\nSehr geehrte Frau Weber,\n**ich** schreibe Ihnen wegen …\n\nThis is the single most visible sign of someone who has learnt to write German properly, and it is one keystroke.',
      'Немският слага запетая след обръщението, а следващият ред започва с **малка** буква, защото изречението още не е започнало:\n\nSehr geehrte Frau Weber,\n**ich** schreibe Ihnen wegen …\n\nТова е най-видимият знак за човек, който се е научил да пише немски както трябва, а е един клавиш.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('Do not translate your own politeness', ''),
    text: bi(
      'English formal writing rewards variation — "I hope this finds you well", "I would be grateful if", "please do not hesitate to contact me" — and a good English letter sounds like a person writing it.\n\nGerman formal writing does not work that way. The phrases are standard, everybody uses them, and reproducing them is correct rather than lazy. "Für Rückfragen stehe ich Ihnen gern zur Verfügung" is not one option among many; it is *the* sentence for that slot.\n\nTranslating an English formula usually produces something that is grammatical and subtly wrong — "Ich hoffe, es geht Ihnen gut" at the top of a letter to an office reads as oddly personal. Use the German formula instead.\n\nAnd note the capital letter rule is the reverse of English: after "Dear Ms Weber," English capitalises the next word. German does not.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Не превеждай своята учтивост'),
    text: bi(
      '',
      'Българското официално писмо оставя повече свобода: „Уважаеми господин Вебер,“ може да бъде последвано от най-различни неща и добре написаното писмо звучи като конкретен човек.\n\nНемското не работи така. Изразите са стандартни, всички ги ползват и възпроизвеждането им е правилно, а не мързеливо. „Für Rückfragen stehe ich Ihnen gern zur Verfügung“ не е една от много възможности — това е *изречението* за това място.\n\nДве конкретни разлики, които си струва да се запомнят:\n\n• След обръщението се слага **запетая**, а следващият ред започва с **малка** буква: „Sehr geehrte Frau Weber,“ и после „**ich** schreibe Ihnen …“. В българския след „Уважаеми господин Вебер,“ пишеш с главна буква. В немския — не.\n• Завършекът е „Mit freundlichen Grüßen“ без запетая след него, а името идва на нов ред.\n\nИ още нещо за внимание: „С уважение“ се превежда като „Mit freundlichen Grüßen“, а не буквално. Буквалният превод не е употребяван израз в немския.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_19: GrammarConcept[] = [
  {
    id: 'g-meinung-aeussern',
    title: bi('Stating a position', 'Изразяване на позиция'),
    level: 'b1',
    summary: bi(
      'Ich finde, dass … in speech; Meiner Meinung nach … in writing — and it takes position one, so the verb comes second.',
      'Ich finde, dass … в говор; Meiner Meinung nach … в писане — и заема първа позиция, затова глаголът е втори.',
    ),
    tags: ['word-order', 'vocabulary'],
    blocks: opinionBlocks,
  },
  {
    id: 'g-einerseits',
    title: bi('Weighing both sides', 'Претегляне на двете страни'),
    level: 'b1',
    summary: bi(
      'einerseits … andererseits, which is the Unit 4 adverb rule with a new pair of words.',
      'einerseits … andererseits — правилото за наречията от раздел 4 с нова двойка думи.',
    ),
    tags: ['word-order'],
    blocks: balanceBlocks,
  },
  {
    id: 'g-formeller-brief',
    title: bi('The formal letter', 'Официалното писмо'),
    level: 'b1',
    summary: bi(
      'Fixed phrases in fixed places — and a comma after the salutation, followed by a small letter.',
      'Устойчиви изрази на определени места — и запетая след обръщението, следвана от малка буква.',
    ),
    tags: ['punctuation', 'vocabulary'],
    blocks: formalWritingBlocks,
  },
];
