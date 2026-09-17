import { GRAMMAR_CONCEPTS_2 } from './grammar2.ts';
import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * Grammar concepts.
 *
 * Note how `only: ['bg']` and `only: ['en']` are used. The Bulgarian path gets
 * explanations built on Bulgarian grammar (the postfixed definite article, the
 * absence of a German-style case system), while the English path gets
 * explanations built on English (no gender at all, fixed subject-verb-object
 * order). They are not translations of each other.
 */

const articlesBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Every German noun belongs to one of three genders, and the gender shows up in the article: der, die or das.',
      'Всяко немско съществително има един от три рода и родът се вижда в члена: der, die или das.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('Article', 'Член'), bi('Example', 'Пример')],
    rows: [
      [bi('masculine', 'мъжки'), 'der', 'der Tisch'],
      [bi('feminine', 'женски'), 'die', 'die Tochter'],
      [bi('neuter', 'среден'), 'das', 'das Haus'],
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Български срещу немски'),
    text: bi(
      '',
      'Българският също има три рода, което е голямо предимство за теб. Разликата е в мястото на члена. Българският го слепва в края на думата, а немският го слага пред нея като отделна дума:',
    ),
  },
  {
    t: 'table',
    only: ['bg'],
    headers: [bi('', 'Български'), bi('', 'Немски')],
    rows: [
      ['къща', 'Haus'],
      ['къщата', 'das Haus'],
      ['маса', 'Tisch'],
      ['масата', 'der Tisch'],
    ],
    caption: bi('', 'Членът в българския е накрая, в немския — отпред и отделно.'),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    text: bi(
      '',
      'Внимание — това е най-важното: родът на българската дума НЕ предсказва рода на немската. „Къща“ е от женски род, но е das Haus. „Маса“ е от женски род, но е der Tisch. Затова в SatzWerk учиш „das Haus“, а не само „Haus“.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English versus German', ''),
    text: bi(
      'English has exactly one definite article, "the", and no grammatical gender at all. German has three, and there is no way to work out which one from the meaning of the word. A table is not more masculine than a house.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    only: ['en'],
    text: bi(
      'So treat the article as part of the word. Learn "das Haus" as a single unit, the way you learnt "a lot of" as a unit. SatzWerk will always ask you for the article with the noun.',
      '',
    ),
  },
  {
    t: 'p',
    text: bi(
      'There are a few reliable patterns. Nouns ending in -chen are always neuter (das Mädchen). Nouns ending in -ung, -heit, -keit or -schaft are always feminine (die Entschuldigung).',
      'Има няколко надеждни правила. Съществителните на -chen винаги са от среден род (das Mädchen). Тези на -ung, -heit, -keit и -schaft винаги са от женски род (die Entschuldigung).',
    ),
  },
];

const UNIT_1_2_CONCEPTS: GrammarConcept[] = [
  {
    id: 'g-noun-capitals',
    title: bi('Nouns are written with a capital letter', 'Съществителните се пишат с главна буква'),
    level: 'pre-a1',
    summary: bi(
      'In German every noun starts with a capital letter, anywhere in the sentence.',
      'В немския всяко съществително започва с главна буква, където и да е в изречението.',
    ),
    tags: ['orthography'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'This is the first thing you notice when you look at German writing, and it is a rule with almost no exceptions: nouns get a capital letter wherever they appear.',
          'Това е първото, което се забелязва в немския текст, и е правило почти без изключения: съществителните се пишат с главна буква, където и да се появят.',
        ),
      },
      { t: 'de', de: 'Der Hund ist groß.', gloss: bi('The dog is big.', 'Кучето е голямо.'), audio: true },
      { t: 'de', de: 'Ich habe eine Tochter.', gloss: bi('I have a daughter.', 'Имам една дъщеря.'), audio: true },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English capitalises only proper nouns — London, Monday, Anna. German capitalises all of them: der Tisch, die Stadt, das Wasser. If a word has der, die or das in front of it, it gets a capital.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'В българския главна буква се пише само в началото на изречението и при собствени имена. В немския е различно: всяко съществително е с главна буква, дори в средата на изречението — der Tisch, die Stadt, das Wasser.',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'This is genuinely useful, not just decoration: the capital letter tells you instantly which word in a long sentence is the noun.',
          'Това наистина помага, а не е просто украса: главната буква ти казва веднага коя дума в дългото изречение е съществителното.',
        ),
      },
    ],
  },
  {
    id: 'g-articles',
    title: bi('der, die, das', 'der, die, das'),
    level: 'pre-a1',
    summary: bi(
      'German nouns have one of three genders, shown by the article in front of them.',
      'Немските съществителни са от един от три рода, който се показва от члена пред тях.',
    ),
    tags: ['articles', 'gender'],
    blocks: articlesBlocks,
  },
  {
    id: 'g-ein-eine',
    title: bi('ein and eine', 'ein и eine'),
    level: 'pre-a1',
    summary: bi(
      'The indefinite article follows the same gender: ein for der/das words, eine for die words.',
      'Неопределителният член следва същия род: ein за думите с der/das, eine за думите с die.',
    ),
    tags: ['articles', 'gender'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Definite', 'Определен'), bi('Indefinite', 'Неопределен')],
        rows: [
          ['der Tisch', 'ein Tisch'],
          ['das Haus', 'ein Haus'],
          ['die Tochter', 'eine Tochter'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'So there are only two forms to choose from in the nominative: eine for feminine nouns, ein for masculine and neuter ones.',
          'Значи в именителен падеж избираш само между две форми: eine за женски род и ein за мъжки и среден род.',
        ),
      },
      { t: 'de', de: 'Ich habe eine Tochter.', gloss: bi('I have a daughter.', 'Имам една дъщеря.'), audio: true },
      { t: 'de', de: 'Ich habe einen Sohn.', gloss: bi('I have a son.', 'Имам един син.'), audio: true },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'You may have spotted "einen" in the second sentence. That is the accusative form of ein for masculine nouns. Unit 4 comes back to it properly — for now just notice that masculine words change more than the others.',
          'Забеляза ли „einen“ във второто изречение? Това е винителната форма на ein при мъжки род. Раздел 4 се връща към нея подробно — засега само забележи, че думите от мъжки род се менят повече от останалите.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският няма истински неопределителен член — „една дъщеря“ използва числителното „една“. В немския ein/eine е задължителен там, където българският може да мине и без него.',
        ),
      },
    ],
  },
  {
    id: 'g-present-endings',
    title: bi('Present tense endings', 'Окончания в сегашно време'),
    level: 'pre-a1',
    summary: bi(
      'Regular German verbs take -e, -st, -t, -en, -t, -en.',
      'Правилните немски глаголи взимат -e, -st, -t, -en, -t, -en.',
    ),
    tags: ['verbs'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'Take the verb, remove -en, and add the ending for the person. Here is wohnen (to live):',
          'Взимаш глагола, махаш -en и добавяш окончанието за лицето. Ето wohnen (живея):',
        ),
      },
      {
        t: 'table',
        headers: [bi('Person', 'Лице'), bi('Form', 'Форма'), bi('Meaning', 'Значение')],
        rows: [
          ['ich', 'wohne', bi('I live', 'аз живея')],
          ['du', 'wohnst', bi('you live', 'ти живееш')],
          ['er / sie / es', 'wohnt', bi('he / she / it lives', 'той / тя / то живее')],
          ['wir', 'wohnen', bi('we live', 'ние живеем')],
          ['ihr', 'wohnt', bi('you live (plural)', 'вие живеете')],
          ['sie / Sie', 'wohnen', bi('they live / you live (formal)', 'те живеят / Вие живеете')],
        ],
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Това ще ти се стори познато: българският също сменя окончанието за всяко лице — живея, живееш, живее, живеем, живеете, живеят. Немският прави същото, само че има по-малко различни форми: wohnen се повтаря при wir и sie/Sie, а wohnt се повтаря при er и ihr.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English only marks one person: I live, you live, but he lives. German marks nearly all of them, so the ending is not optional decoration — it is how the listener knows who you are talking about.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'warn',
        text: bi(
          'Verbs whose stem ends in -t or -d add an extra e before the ending, so that the word stays pronounceable: du arbeitest, er arbeitet.',
          'Глаголите, чиято основа завършва на -t или -d, добавят допълнително e преди окончанието, за да остане думата изговорима: du arbeitest, er arbeitet.',
        ),
      },
    ],
  },
  {
    id: 'g-verb-second',
    title: bi('The verb comes second', 'Глаголът е на второ място'),
    level: 'pre-a1',
    summary: bi(
      'In a German statement the conjugated verb is always the second element.',
      'В немското съобщително изречение спрегнатият глагол винаги е вторият елемент.',
    ),
    tags: ['word-order'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'This is the single most important structural rule in German. In a normal statement, the conjugated verb sits in position two — not necessarily as the second word, but as the second building block.',
          'Това е най-важното структурно правило в немския. В нормално съобщително изречение спрегнатият глагол стои на позиция две — не непременно втората дума, а вторият градивен блок.',
        ),
      },
      {
        t: 'table',
        headers: [bi('1', '1'), bi('2 — verb', '2 — глагол'), bi('3 ...', '3 ...')],
        rows: [
          ['Ich', 'wohne', 'in Hamburg.'],
          ['Heute', 'arbeite', 'ich zu Hause.'],
          ['In Hamburg', 'wohne', 'ich seit 2019.'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'Look at the second row carefully. Because "Heute" took position one, the subject "ich" had to move behind the verb. German does not allow "Heute ich arbeite".',
          'Погледни внимателно втория ред. Тъй като „Heute“ зае позиция едно, подлогът „ich“ трябваше да мине след глагола. Немският не допуска „Heute ich arbeite“.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският е много по-свободен: „Днес работя вкъщи“, „Работя днес вкъщи“ и „Вкъщи работя днес“ са все приемливи. Немският не е свободен по този начин. Каквото и да сложиш отпред, глаголът остава втори и подлогът се мести след него.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English keeps the subject before the verb almost everywhere: "Today I work from home". German swaps them as soon as something else opens the sentence: "Heute arbeite ich zu Hause". Getting used to that swap is most of what makes your German sound German.',
          '',
        ),
      },
      {
        t: 'p',
        text: bi(
          'In a yes/no question the verb moves all the way to the front: Wohnst du in Hamburg? In a W-question the question word is first and the verb is still second: Wo wohnst du?',
          'При въпрос с да/не глаголът минава напред: Wohnst du in Hamburg? При въпрос с W въпросителната дума е първа, а глаголът пак е втори: Wo wohnst du?',
        ),
      },
    ],
  },
  {
    id: 'g-du-sie',
    title: bi('du or Sie?', 'du или Sie?'),
    level: 'pre-a1',
    summary: bi(
      'German has an informal "you" (du) and a formal one (Sie), always capitalised.',
      'Немският има неофициално „ти“ (du) и учтиво „Вие“ (Sie), което винаги се пише с главна буква.',
    ),
    tags: ['register'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Informal', 'Неофициално'), bi('Formal', 'Учтиво')],
        rows: [
          ['Wie heißt du?', 'Wie heißen Sie?'],
          ['Woher kommst du?', 'Woher kommen Sie?'],
          ['Wo wohnst du?', 'Wo wohnen Sie?'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'Use du with friends, family, children and people who offer it. Use Sie with strangers, at the Amt, at the doctor, in shops and with colleagues you have just met. When in doubt, use Sie — nobody is offended by it.',
          'Използвай du с приятели, семейство, деца и хора, които сами ти го предложат. Използвай Sie с непознати, в Amt, при лекар, в магазин и с колеги, които току-що си срещнал. При съмнение избирай Sie — никого не обижда.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Това е почти същото като българското „ти“ и „Вие“, така че вече знаеш кога да го използваш. Две технически разлики: (1) Sie винаги е с главна буква, и (2) Sie взима формата за множествено число на глагола — Sie wohnen, също като „те живеят“.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English lost this distinction centuries ago — "you" covers everything. In German, choosing the wrong one is noticeable: du with an official sounds rude, Sie with a friend sounds cold.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'warn',
        text: bi(
          'Capitalisation carries meaning here. "Sie" is formal you; "sie" is she or they. Only the capital letter separates them in writing.',
          'Главната буква тук носи значение. „Sie“ е учтивото Вие; „sie“ е тя или те. В писмен вид ги различава само главната буква.',
        ),
      },
    ],
  },
  {
    id: 'g-special-letters',
    title: bi('ä, ö, ü and ß', 'ä, ö, ü и ß'),
    level: 'pre-a1',
    summary: bi(
      'Four extra letters, four distinct sounds. They are not decorated versions of a, o, u.',
      'Четири допълнителни букви, четири отделни звука. Те не са украсени a, o, u.',
    ),
    tags: ['orthography', 'pronunciation'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Letter', 'Буква'), bi('Sound', 'Звук'), bi('Example', 'Пример')],
        rows: [
          ['ä', bi('like "e" in bed', 'като българското „е“'), 'die Städte'],
          ['ö', bi('round your lips and say "e"', 'кажи „е“ със закръглени устни'), 'die Töchter'],
          ['ü', bi('round your lips and say "ee"', 'кажи „и“ със закръглени устни'), 'Tschüss'],
          ['ß', bi('always a sharp "s"', 'винаги остро „с“'), 'heißen'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'These letters change meaning, so they are not optional. der Bruder is the brother; die Brüder is the brothers.',
          'Тези букви променят значението, така че не са по избор. der Bruder е братът; die Brüder са братята.',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'If your keyboard has no umlauts, you may type ae, oe, ue and ss. SatzWerk accepts that, tells you the standard spelling and asks you to type it properly — and there are buttons under every input that insert the real letters.',
          'Ако клавиатурата ти няма тези букви, можеш да пишеш ae, oe, ue и ss. SatzWerk ще го приеме, ще ти покаже стандартния правопис и ще поиска да го напишеш правилно — а под всяко поле има бутони, които вписват истинските букви.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Добра новина: „ü“ не съществува в българския, но е много близо до това да кажеш „и“ с устни, нагласени за „у“. А „ß“ е просто остро „с“ — никога „з“.',
        ),
      },
      {
        t: 'callout',
        tone: 'warn',
        only: ['en'],
        text: bi(
          'One more: German "s" between vowels sounds like English "z" (lesen = LAY-zen), and "w" sounds like English "v" (wohnen = VOH-nen). "v" usually sounds like "f".',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'warn',
        only: ['bg'],
        text: bi(
          '',
          'Още нещо важно: немското „w“ се чете като българско „в“ (wohnen = ВО-нен), а немското „v“ обикновено като „ф“. Немското „s“ между гласни звучи като „з“ (lesen = ЛЕ-зен).',
        ),
      },
    ],
  },
  {
    id: 'g-sein',
    title: bi('sein — to be', 'sein — съм'),
    level: 'pre-a1',
    summary: bi('The most irregular and most used verb in German.', 'Най-неправилният и най-използван глагол в немския.'),
    tags: ['verbs', 'irregular'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Person', 'Лице'), bi('Form', 'Форма')],
        rows: [
          ['ich', 'bin'],
          ['du', 'bist'],
          ['er / sie / es', 'ist'],
          ['wir', 'sind'],
          ['ihr', 'seid'],
          ['sie / Sie', 'sind'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'There is no pattern to derive here. These six forms simply have to be known, and they are worth knowing first because they appear in every other sentence.',
          'Тук няма правило за извеждане. Тези шест форми просто трябва да се знаят и си заслужава да са първите, защото се появяват във всяко второ изречение.',
        ),
      },
      { t: 'de', de: 'Ich bin Teo.', gloss: bi('I am Teo.', 'Аз съм Тео.'), audio: true },
      { t: 'de', de: 'Das ist meine Tochter.', gloss: bi('This is my daughter.', 'Това е дъщеря ми.'), audio: true },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Важна разлика: българският често пропуска глагола — „Аз съм Тео“ може да стане просто „Тео съм“, а „Това е хубаво“ понякога е „Хубаво е“. Немският никога не пропуска глагола. „Ich Teo“ не е изречение.',
        ),
      },
    ],
  },
];

export const GRAMMAR_CONCEPTS: GrammarConcept[] = [...UNIT_1_2_CONCEPTS, ...GRAMMAR_CONCEPTS_2];

const BY_ID = new Map(GRAMMAR_CONCEPTS.map((concept) => [concept.id, concept]));

export function grammarById(id: string): GrammarConcept | undefined {
  return BY_ID.get(id);
}
