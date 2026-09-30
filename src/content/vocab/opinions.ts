import type { VocabEntry } from '../types.ts';

/**
 * Opinions and written German (B1 Unit 6).
 *
 * The last B1 unit, and the only one whose subject is not a situation. Every
 * other unit taught a place to go and a thing to get done; this one teaches
 * how to have a position and defend it, which is the skill B1 is actually
 * defined by.
 *
 * The vocabulary is therefore abstract in a way nothing before it has been.
 * *Meiner Meinung nach*, *einerseits*, *der Vorteil*, *der Nachteil*, *das
 * Argument* — these are not words for ordering coffee. They are the scaffolding
 * of an argument, and they are worth learning as fixed phrases rather than as
 * individual words, because that is how they are used.
 *
 * The topics they attach to are the ones Germans actually argue about in
 * everyday life and which turn up in every B1 exam: the environment, screen
 * time, working from home, whether a city needs more cars or fewer. Nothing
 * here is decorative — a learner who can say *einerseits … andererseits* about
 * *die Umwelt* can hold up their end of a conversation at a German dinner
 * table, which is where B1 stops being a certificate and starts being useful.
 */

const U = 'b1-u6';
const L1 = 'b1-u6-l1';
const L2 = 'b1-u6-l2';
const L3 = 'b1-u6-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — having an opinion
 * ------------------------------------------------------------------ */

const OPINION: VocabEntry[] = [
  {
    id: 'v-die-meinung',
    german: 'Meinung',
    display: 'die Meinung',
    article: 'die',
    gender: 'f',
    plural: 'die Meinungen',
    wordType: 'noun',
    translation: { en: 'opinion', bg: 'мнение' },
    pronunciation: { en: 'MY-noong', bg: 'МАЙ-нунг' },
    example: {
      de: 'Meiner Meinung nach ist das keine gute Idee.',
      gloss: {
        en: 'In my opinion that is not a good idea.',
        bg: 'По мое мнение това не е добра идея.',
      },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    collocations: [
      { de: 'meiner Meinung nach', gloss: { en: 'in my opinion', bg: 'по мое мнение' } },
      { de: 'die Meinung ändern', gloss: { en: 'to change one’s mind', bg: 'да си променя мнението' } },
    ],
    notes: {
      en: '"Meiner Meinung nach" is a fixed phrase and the preposition comes **after** the noun, which is unusual — nach normally stands in front. Learn the whole phrase; do not build it.',
      bg: '„Meiner Meinung nach“ е устойчив израз и предлогът стои **след** съществителното, което е необичайно — nach обикновено е отпред. Научи целия израз; не го сглобявай.',
    },
  },
  {
    id: 'v-der-vorteil',
    german: 'Vorteil',
    display: 'der Vorteil',
    article: 'der',
    gender: 'm',
    plural: 'die Vorteile',
    wordType: 'noun',
    translation: { en: 'advantage', bg: 'предимство' },
    pronunciation: { en: 'FOR-tile', bg: 'ФОР-тайл' },
    example: {
      de: 'Der größte Vorteil ist die Flexibilität.',
      gloss: { en: 'The biggest advantage is the flexibility.', bg: 'Най-голямото предимство е гъвкавостта.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-nachteil'],
    notes: {
      en: 'vor (before) + Teil (part) — and the opposite is Nachteil, nach (after) + Teil. The pair is the backbone of every German pros-and-cons discussion.',
      bg: 'vor (пред) + Teil (част) — а обратното е Nachteil, nach (след) + Teil. Двойката е гръбнакът на всяко немско обсъждане „за и против“.',
    },
  },
  {
    id: 'v-der-nachteil',
    german: 'Nachteil',
    display: 'der Nachteil',
    article: 'der',
    gender: 'm',
    plural: 'die Nachteile',
    wordType: 'noun',
    translation: { en: 'disadvantage', bg: 'недостатък' },
    pronunciation: { en: 'NAHKH-tile', bg: 'НАХ-тайл' },
    example: {
      de: 'Ein Nachteil ist, dass man weniger Kontakt hat.',
      gloss: {
        en: 'One disadvantage is that you have less contact.',
        bg: 'Един недостатък е, че има по-малко контакт.',
      },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-vorteil'],
  },
  {
    id: 'v-der-grund',
    german: 'Grund',
    display: 'der Grund',
    article: 'der',
    gender: 'm',
    plural: 'die Gründe',
    wordType: 'noun',
    translation: { en: 'reason', bg: 'причина' },
    pronunciation: { en: 'groont', bg: 'грунд' },
    example: {
      de: 'Es gibt mehrere Gründe dafür.',
      gloss: { en: 'There are several reasons for it.', bg: 'Има няколко причини за това.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'Also the word for the ground you stand on, and for the bottom of something. "Aus diesem Grund" — for this reason — is the phrase you will use in writing.',
      bg: 'Същата дума и за земята, на която стоиш, и за дъното на нещо. „Aus diesem Grund“ — поради тази причина — е изразът, който ще ползваш в писмен текст.',
    },
  },
  {
    id: 'v-der-meinung-sein',
    german: 'finden',
    // display is spoken, recorded and checked against what the learner says,
    // so it is German only; "to think" is in the translation.
    display: 'finden',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gefunden' },
    translation: { en: 'to think, to find (an opinion)', bg: 'смятам, намирам (за мнение)' },
    pronunciation: { en: 'FIN-den', bg: 'ФИН-ден' },
    example: {
      de: 'Ich finde, dass wir mehr tun sollten.',
      gloss: { en: 'I think we should do more.', bg: 'Смятам, че трябва да правим повече.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'The everyday way to give an opinion, and much more common in speech than "meiner Meinung nach". "Ich finde, dass …" or simply "Ich finde es gut."',
      bg: 'Всекидневният начин да изразиш мнение и много по-чест в говора от „meiner Meinung nach“. „Ich finde, dass …“ или просто „Ich finde es gut.“',
    },
  },
  {
    id: 'v-zustimmen',
    german: 'zustimmen',
    display: 'zustimmen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'zugestimmt' },
    translation: { en: 'to agree', bg: 'съгласявам се' },
    pronunciation: { en: 'TSOO-shtim-en', bg: 'ЦУ-щим-ен' },
    example: {
      de: 'Da stimme ich dir zu.',
      gloss: { en: 'I agree with you on that.', bg: 'Тук съм съгласен с теб.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    notes: {
      en: 'Separable, and the person you agree with is in the dative with no preposition: ich stimme **dir** zu. Not *mit dir*, which is the mistake both English "agree with" and Bulgarian „съгласен с“ invite.',
      bg: 'Отделяем, а човекът, с когото си съгласен, е в дателен без предлог: ich stimme **dir** zu. Не *mit dir* — грешката, към която водят и английското „agree with“, и българското „съгласен с“.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — weighing both sides
 * ------------------------------------------------------------------ */

const WEIGHING: VocabEntry[] = [
  {
    id: 'v-einerseits',
    german: 'einerseits',
    display: 'einerseits … andererseits',
    wordType: 'adverb',
    translation: { en: 'on the one hand … on the other', bg: 'от една страна … от друга' },
    pronunciation: { en: 'EYE-ner-zites', bg: 'АЙ-нер-зайтс' },
    example: {
      de: 'Einerseits ist es praktisch, andererseits ist es teuer.',
      gloss: {
        en: 'On the one hand it is practical, on the other it is expensive.',
        bg: 'От една страна е практично, от друга е скъпо.',
      },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'Both halves are adverbs in position one, so both push the verb to second place: einerseits **ist** es …, andererseits **ist** es … That is the same rule as trotzdem and deshalb from Unit 4.',
      bg: 'И двете части са наречия на първа позиция, затова и двете бутат глагола на второ място: einerseits **ist** es …, andererseits **ist** es … Същото правило като при trotzdem и deshalb от раздел 4.',
    },
  },
  {
    id: 'v-die-umwelt',
    german: 'Umwelt',
    display: 'die Umwelt',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'environment', bg: 'околна среда' },
    pronunciation: { en: 'OOM-velt', bg: 'УМ-велт' },
    example: {
      de: 'Das ist besser für die Umwelt.',
      gloss: { en: 'That is better for the environment.', bg: 'Това е по-добре за околната среда.' },
    },
    tags: ['environment', 'opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'um (around) + Welt (world) — the world around you. It builds: Umweltschutz, umweltfreundlich, Umweltverschmutzung. Environmental argument is a German national pastime and this is its root word.',
      bg: 'um (около) + Welt (свят) — светът около теб. Строи нататък: Umweltschutz, umweltfreundlich, Umweltverschmutzung. Спорът за околната среда е немско национално занимание, а това е коренната дума.',
    },
  },
  {
    id: 'v-der-verkehr',
    german: 'Verkehr',
    display: 'der Verkehr',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'traffic', bg: 'движение, трафик' },
    pronunciation: { en: 'fer-KAIR', bg: 'фер-КЕР' },
    example: {
      de: 'In der Stadt gibt es zu viel Verkehr.',
      gloss: { en: 'There is too much traffic in the city.', bg: 'В града има твърде много движение.' },
    },
    tags: ['environment', 'opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'Public transport is öffentliche Verkehrsmittel, usually shortened to "die Öffis" in speech. Worth recognising both.',
      bg: 'Градският транспорт е öffentliche Verkehrsmittel, съкратено в говора до „die Öffis“. Струва си да разпознаваш и двете.',
    },
  },
  {
    id: 'v-das-homeoffice',
    german: 'Homeoffice',
    display: 'das Homeoffice',
    article: 'das',
    gender: 'n',
    wordType: 'noun',
    translation: { en: 'working from home', bg: 'работа от вкъщи' },
    pronunciation: { en: 'HOHM-off-iss', bg: 'ХОУМ-офис' },
    example: {
      de: 'Ich arbeite zweimal pro Woche im Homeoffice.',
      gloss: {
        en: 'I work from home twice a week.',
        bg: 'Работя от вкъщи два пъти седмично.',
      },
    },
    tags: ['work', 'opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'An English word that does not mean this in English — a "home office" in Britain is a room, and the Home Office is a government department. German borrowed the words and gave them a meaning of their own, as it did with Handy.',
      bg: 'Английска дума, която на английски не значи това — „home office“ в Британия е стая, а Home Office е министерство. Немският е взел думите и им е дал собствено значение, както с Handy.',
    },
  },
  {
    id: 'v-sparen',
    german: 'sparen',
    display: 'sparen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gespart' },
    translation: { en: 'to save (money, energy)', bg: 'спестявам' },
    pronunciation: { en: 'SHPAH-ren', bg: 'ШПА-рен' },
    example: {
      de: 'So kann man viel Energie sparen.',
      gloss: { en: 'That way you can save a lot of energy.', bg: 'Така може да се спести много енергия.' },
    },
    tags: ['environment', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-vermeiden',
    german: 'vermeiden',
    display: 'vermeiden',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'vermieden' },
    translation: { en: 'to avoid', bg: 'избягвам' },
    pronunciation: { en: 'fer-MY-den', bg: 'фер-МАЙ-ден' },
    example: {
      de: 'Man sollte unnötige Fahrten vermeiden.',
      gloss: { en: 'One should avoid unnecessary journeys.', bg: 'Трябва да се избягват ненужни пътувания.' },
    },
    tags: ['environment'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-die-moeglichkeit',
    german: 'Möglichkeit',
    display: 'die Möglichkeit',
    article: 'die',
    gender: 'f',
    plural: 'die Möglichkeiten',
    wordType: 'noun',
    translation: { en: 'possibility, option', bg: 'възможност' },
    pronunciation: { en: 'MER-glikh-kite', bg: 'МЬОГ-лих-кайт' },
    example: {
      de: 'Es gibt mehrere Möglichkeiten.',
      gloss: { en: 'There are several options.', bg: 'Има няколко възможности.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'möglich + -keit. Like -heit, the -keit ending makes an abstract noun and is always feminine: die Möglichkeit, die Schwierigkeit, die Gelegenheit.',
      bg: 'möglich + -keit. Както -heit, окончанието -keit прави абстрактно съществително и винаги е от женски род: die Möglichkeit, die Schwierigkeit, die Gelegenheit.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — writing it down
 * ------------------------------------------------------------------ */

const WRITING: VocabEntry[] = [
  {
    id: 'v-die-anrede',
    german: 'Anrede',
    display: 'die Anrede',
    article: 'die',
    gender: 'f',
    plural: 'die Anreden',
    wordType: 'noun',
    translation: { en: 'form of address, salutation', bg: 'обръщение' },
    pronunciation: { en: 'AN-ray-duh', bg: 'АН-ре-де' },
    example: {
      de: 'Die richtige Anrede ist „Sehr geehrte Damen und Herren“.',
      gloss: {
        en: 'The correct salutation is "Sehr geehrte Damen und Herren".',
        bg: 'Правилното обръщение е „Sehr geehrte Damen und Herren“.',
      },
    },
    tags: ['writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'German letter-writing is more fixed than English. "Sehr geehrte Frau Weber," for a named person, "Sehr geehrte Damen und Herren," when you do not know, and the next line always starts with a small letter — the comma does not end the sentence.',
      bg: 'Немското писмо е по-стандартизирано от английското. „Sehr geehrte Frau Weber,“ за познат адресат, „Sehr geehrte Damen und Herren,“ когато не знаеш, а следващият ред винаги започва с малка буква — запетаята не завършва изречението.',
    },
  },
  {
    id: 'v-mitteilen',
    german: 'mitteilen',
    display: 'mitteilen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'mitgeteilt' },
    translation: { en: 'to inform, to let someone know', bg: 'съобщавам' },
    pronunciation: { en: 'MIT-ty-len', bg: 'МИТ-тай-лен' },
    example: {
      de: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
      gloss: {
        en: 'I hereby inform you that I have to cancel the appointment.',
        bg: 'С настоящото ви съобщавам, че трябва да отменя часа.',
      },
    },
    tags: ['writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'The formal register, and the person told is in the dative: ich teile **Ihnen** mit. "Hiermit teile ich Ihnen mit, dass …" is a complete formal opening you can reuse for anything.',
      bg: 'Официалният регистър, а човекът, на когото съобщаваш, е в дателен: ich teile **Ihnen** mit. „Hiermit teile ich Ihnen mit, dass …“ е готово официално начало, което става за всичко.',
    },
  },
  {
    id: 'v-die-ruecksprache',
    german: 'Rückfrage',
    display: 'die Rückfrage',
    article: 'die',
    gender: 'f',
    plural: 'die Rückfragen',
    wordType: 'noun',
    translation: { en: 'query, follow-up question', bg: 'допълнителен въпрос' },
    pronunciation: { en: 'RUEK-frah-guh', bg: 'РЮК-фра-ге' },
    example: {
      de: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.',
      gloss: {
        en: 'I am happy to answer any questions.',
        bg: 'На разположение съм за допълнителни въпроси.',
      },
    },
    tags: ['writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: '"Für Rückfragen stehe ich Ihnen gern zur Verfügung" is the standard closing line of a formal German letter. It is entirely formulaic and expected — reproduce it rather than translating from your own language.',
      bg: '„Für Rückfragen stehe ich Ihnen gern zur Verfügung“ е стандартният завършек на официално немско писмо. Напълно шаблонно е и се очаква — възпроизведи го, вместо да превеждаш от своя език.',
    },
  },
  {
    id: 'v-das-argument',
    german: 'Argument',
    display: 'das Argument',
    article: 'das',
    gender: 'n',
    plural: 'die Argumente',
    wordType: 'noun',
    translation: { en: 'argument (point made)', bg: 'аргумент' },
    pronunciation: { en: 'ar-goo-MENT', bg: 'аргу-МЕНТ' },
    example: {
      de: 'Das ist ein gutes Argument.',
      gloss: { en: 'That is a good point.', bg: 'Това е добър аргумент.' },
    },
    tags: ['opinion', 'writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'A point in a discussion, not a quarrel. The English "we had an argument" is "wir hatten Streit" — a false friend worth knowing.',
      bg: 'Довод в дискусия, а не свада. Английското „we had an argument“ е „wir hatten Streit“ — лъжлив приятел, който си струва да се знае.',
    },
  },
  {
    id: 'v-zusammenfassen',
    german: 'zusammenfassen',
    display: 'zusammenfassen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'zusammengefasst' },
    translation: { en: 'to summarise', bg: 'обобщавам' },
    pronunciation: { en: 'tsoo-ZAM-en-fas-sen', bg: 'цу-ЗАМ-ен-фасен' },
    example: {
      de: 'Zusammenfassend kann man sagen, dass beides Vorteile hat.',
      gloss: {
        en: 'In summary, one can say that both have advantages.',
        bg: 'В обобщение може да се каже, че и двете имат предимства.',
      },
    },
    tags: ['opinion', 'writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: '"Zusammenfassend kann man sagen, dass …" is the standard way to begin the last paragraph of a German argumentative text. Learn it whole.',
      bg: '„Zusammenfassend kann man sagen, dass …“ е стандартният начин да започнеш последния абзац на немски аргументативен текст. Научи го наведнъж.',
    },
  },
  {
    id: 'v-schliesslich',
    german: 'schließlich',
    display: 'schließlich',
    wordType: 'adverb',
    translation: { en: 'finally, after all', bg: 'накрая, в крайна сметка' },
    pronunciation: { en: 'SHLEES-likh', bg: 'ШЛИС-лих' },
    example: {
      de: 'Schließlich muss jeder selbst entscheiden.',
      gloss: { en: 'In the end everyone has to decide for themselves.', bg: 'В крайна сметка всеки решава сам.' },
    },
    tags: ['opinion', 'writing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-entscheiden',
    german: 'entscheiden',
    display: 'entscheiden',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'entschieden' },
    translation: { en: 'to decide', bg: 'решавам' },
    pronunciation: { en: 'ent-SHY-den', bg: 'ент-ШАЙ-ден' },
    example: {
      de: 'Ich habe mich noch nicht entschieden.',
      gloss: { en: 'I have not decided yet.', bg: 'Още не съм решил.' },
    },
    tags: ['opinion'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Reflexive when it is you making up your mind: sich entscheiden. Plain entscheiden is deciding a matter — "das entscheidet der Chef".',
      bg: 'Възвратен, когато ти вземаш решение: sich entscheiden. Обикновеното entscheiden е да се реши въпрос — „das entscheidet der Chef“.',
    },
  },
];

export const OPINIONS_VOCAB: VocabEntry[] = [...OPINION, ...WEIGHING, ...WRITING];
