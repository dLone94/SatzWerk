import type { VocabEntry } from '../types.ts';

/**
 * Natural spoken German (B2 Unit 5).
 *
 * The last unit of the course, and the one that admits something the previous
 * eighty lessons could not: a learner who has done all of them will still miss
 * half of what a colleague says at lunch.
 *
 * Not because the grammar is different — it is the same grammar — but because
 * the *words* are. Spoken German quietly replaces a set of perfectly good
 * textbook verbs with shorter ones, and nobody ever announces it. bekommen
 * becomes kriegen, sehen becomes gucken, funktionieren becomes klappen, and a
 * learner who says the textbook version is understood immediately and marked
 * as a learner just as fast.
 *
 * So this vocabulary is deliberately the opposite of Unit 4's. Almost nothing
 * here belongs in writing, and the entries say so.
 *
 * Three groups:
 *
 * **The replacements** (lesson 1): kriegen, gucken, klappen, hinkriegen. Each
 * one is listed beside the word it replaces, because the pair is the lesson.
 *
 * **The small talk** (lesson 2): Bescheid sagen, keine Ahnung, Lust haben,
 * sich melden. Fixed phrases that carry an enormous amount of ordinary German
 * and cannot be assembled from their parts.
 *
 * **The intensifiers and the filler** (lesson 3): echt, ziemlich, total, der
 * Quatsch. These are what make speech sound like speech, and leaving them out
 * is what makes a fluent learner sound like a manual.
 */

const U = 'b2-u5';
const L1 = 'b2-u5-l1';
const L2 = 'b2-u5-l2';
const L3 = 'b2-u5-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the words that replace the words you know
 * ------------------------------------------------------------------ */

const REPLACEMENTS: VocabEntry[] = [
  {
    id: 'v-kriegen',
    german: 'kriegen',
    display: 'kriegen',
    wordType: 'verb',
    translation: { en: 'to get (spoken for bekommen)', bg: 'да получа (разговорно вместо bekommen)' },
    pronunciation: { en: 'KREE-gen', bg: 'КРИ-ген' },
    example: {
      de: 'Hast du meine Nachricht gekriegt?',
      gloss: {
        en: 'Did you get my message?',
        bg: 'Получи ли съобщението ми?',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'gekriegt' },
    notes: {
      en: 'Exactly bekommen in meaning and far commoner in speech. Not for a letter: a formal email says *Ich habe Ihre Nachricht erhalten*, never gekriegt.',
      bg: 'По значение е точно bekommen и е много по-често в речта. Не става за писмо: официалният имейл казва *Ich habe Ihre Nachricht erhalten*, никога gekriegt.',
    },
  },
  {
    id: 'v-gucken',
    german: 'gucken',
    display: 'gucken',
    wordType: 'verb',
    translation: { en: 'to look, to watch (spoken)', bg: 'да гледам (разговорно)' },
    pronunciation: { en: 'GOOK-en', bg: 'ГУ-кен' },
    example: {
      de: 'Ich guck mal kurz, ob das geht.',
      gloss: {
        en: 'I will just have a quick look at whether that works.',
        bg: 'Само ще погледна набързо дали става.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'geguckt' },
    notes: {
      en: 'Northern and central Germany say gucken; the south says schauen. Both mean sehen, and which you hear tells you where you are.',
      bg: 'В Северна и Централна Германия казват gucken; на юг — schauen. И двете значат sehen, а това коя чуваш ти подсказва къде се намираш.',
    },
  },
  {
    id: 'v-klappen',
    german: 'klappen',
    display: 'klappen',
    wordType: 'verb',
    translation: { en: 'to work out, to go smoothly', bg: 'да се получи, да стане' },
    pronunciation: { en: 'KLAP-en', bg: 'КЛА-пен' },
    example: {
      de: 'Hat mit dem Termin alles geklappt?',
      gloss: {
        en: 'Did everything work out with the appointment?',
        bg: 'Всичко ли се получи с часа?',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'geklappt' },
    notes: {
      en: 'funktionieren is for machines. klappen is for plans, appointments and arrangements — and it is what people actually say about both.',
      bg: 'funktionieren е за машини. klappen е за планове, срещи и уговорки — и точно него хората използват и в двата случая.',
    },
  },
  {
    id: 'v-hinkriegen',
    german: 'hinkriegen',
    display: 'hinkriegen',
    wordType: 'verb',
    translation: { en: 'to manage it, to pull it off', bg: 'да се справя, да го докарам' },
    pronunciation: { en: 'HIN-kree-gen', bg: 'ХИН-кри-ген' },
    example: {
      de: 'Kriegst du das bis morgen hin?',
      gloss: {
        en: 'Can you manage that by tomorrow?',
        bg: 'Ще се справиш ли с това до утре?',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'hingekriegt' },
    notes: {
      en: 'Separable, so the prefix lands at the end: *Kriegst du das hin?* It is the everyday way to ask whether somebody can get something done at all.',
      bg: 'Разделим е, затова представката отива накрая: *Kriegst du das hin?* Това е всекидневният начин да попиташ дали някой изобщо ще се справи.',
    },
  },
  {
    id: 'v-nerven',
    german: 'nerven',
    display: 'nerven',
    wordType: 'verb',
    translation: { en: 'to annoy, to get on someone’s nerves', bg: 'да дразня, да лазя по нервите' },
    pronunciation: { en: 'NAIR-ven', bg: 'НЕР-вен' },
    example: {
      de: 'Das nervt mich total.',
      gloss: {
        en: 'That really annoys me.',
        bg: 'Това страшно ме дразни.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'genervt' },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the fixed phrases of ordinary talk
 * ------------------------------------------------------------------ */

const SMALL_TALK: VocabEntry[] = [
  {
    id: 'v-bescheid-sagen',
    german: 'Bescheid sagen',
    display: 'Bescheid sagen',
    wordType: 'phrase',
    translation: { en: 'to let someone know', bg: 'да съобщя, да кажа (на някого)' },
    pronunciation: { en: 'buh-SHITE zah-gen', bg: 'бе-ШАЙД за-ген' },
    example: {
      de: 'Sag mir einfach Bescheid, wenn du so weit bist.',
      gloss: {
        en: 'Just let me know when you are ready.',
        bg: 'Просто ми кажи, като си готов.',
      },
    },
    tags: ['spoken', 'phrases'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'A fixed phrase with a capital Bescheid and the dative person: *Ich sage dir Bescheid.* It is everywhere in ordinary German and cannot be assembled from its parts.',
      bg: 'Устойчив израз с главно Bescheid и лице в дателен падеж: *Ich sage dir Bescheid.* Среща се навсякъде във всекидневния немски и не може да се сглоби от частите му.',
    },
  },
  {
    id: 'v-die-ahnung',
    german: 'Ahnung',
    display: 'die Ahnung',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'idea, clue', bg: 'представа, идея' },
    pronunciation: { en: 'AH-nung', bg: 'А-нунг' },
    example: {
      de: 'Keine Ahnung, ob das klappt.',
      gloss: {
        en: 'No idea whether that will work out.',
        bg: 'Нямам представа дали ще се получи.',
      },
    },
    tags: ['spoken', 'phrases'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: '*Keine Ahnung* — without a verb, without a subject — is a complete German sentence and one of the commonest answers there is.',
      bg: '*Keine Ahnung* — без глагол и без подлог — е завършено немско изречение и един от най-честите отговори изобщо.',
    },
  },
  {
    id: 'v-die-lust',
    german: 'Lust',
    display: 'die Lust',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'inclination, being in the mood', bg: 'желание, настроение (за нещо)' },
    pronunciation: { en: 'loost', bg: 'луст' },
    example: {
      de: 'Hast du Lust, morgen vorbeizukommen?',
      gloss: {
        en: 'Do you fancy coming round tomorrow?',
        bg: 'Имаш ли желание да наминеш утре?',
      },
    },
    tags: ['spoken', 'phrases'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    collocations: [
      { de: 'Lust haben auf etwas', gloss: { en: 'to fancy something', bg: 'да ми се иска нещо' } },
    ],
    notes: {
      en: 'The German invitation. *Hast du Lust …?* is how people ask, and answering *Ich möchte* to it sounds like a form being filled in.',
      bg: 'Немската покана. *Hast du Lust …?* е начинът, по който хората канят, а отговор с *Ich möchte* звучи като попълване на формуляр.',
    },
  },
  {
    id: 'v-sich-melden',
    german: 'sich melden',
    display: 'sich melden',
    wordType: 'verb',
    translation: { en: 'to get in touch', bg: 'да се обадя, да се свържа' },
    pronunciation: { en: 'zikh MEL-den', bg: 'зих МЕЛ-ден' },
    example: {
      de: 'Ich melde mich nächste Woche.',
      gloss: {
        en: 'I will be in touch next week.',
        bg: 'Ще се обадя другата седмица.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'gemeldet' },
    notes: {
      en: 'Covers calling, writing and messaging at once — it means "make contact somehow", and it is the standard way to end a German conversation that is not finished.',
      bg: 'Покрива едновременно обаждане, писане и съобщение — значи „ще се свържа по някакъв начин“ и е стандартният начин да завършиш немски разговор, който не е приключил.',
    },
  },
  {
    id: 'v-vorbeikommen',
    german: 'vorbeikommen',
    display: 'vorbeikommen',
    wordType: 'verb',
    translation: { en: 'to come round, to drop by', bg: 'да намина, да се отбия' },
    pronunciation: { en: 'for-BY-kom-en', bg: 'фор-БАЙ-ко-мен' },
    example: {
      de: 'Komm doch einfach mal vorbei.',
      gloss: {
        en: 'Just drop by some time.',
        bg: 'Просто намини някой път.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'sein', participle: 'vorbeigekommen' },
  },
  {
    id: 'v-der-feierabend',
    german: 'Feierabend',
    display: 'der Feierabend',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'the end of the working day', bg: 'краят на работния ден' },
    pronunciation: { en: 'FY-er-ah-bent', bg: 'ФАЙ-ер-а-бенд' },
    example: {
      de: 'Ich mache jetzt Feierabend.',
      gloss: {
        en: 'I am finishing work now.',
        bg: 'Приключвам работа за днес.',
      },
    },
    tags: ['spoken', 'work'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'There is no English or Bulgarian word for this. It is not "evening" and not "finishing time": it is the state of the day being over and being yours, and Germans defend it seriously.',
      bg: 'Няма българска или английска дума за това. Не е „вечер“ и не е „край на работното време“: това е състоянието, в което денят е свършил и вече е твой — и германците го защитават сериозно.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — what makes speech sound like speech
 * ------------------------------------------------------------------ */

const FLAVOUR: VocabEntry[] = [
  {
    id: 'v-echt',
    german: 'echt',
    display: 'echt',
    wordType: 'adverb',
    translation: { en: 'really, genuinely (spoken)', bg: 'наистина, много (разговорно)' },
    pronunciation: { en: 'ekht', bg: 'ехт' },
    example: {
      de: 'Das war echt gut.',
      gloss: {
        en: 'That was really good.',
        bg: 'Това беше наистина добро.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Also a one-word question: **Echt?** — "really?" It is the spoken sehr and wirklich at once, and it is everywhere.',
      bg: 'Може и да е въпрос от една дума: **Echt?** — „наистина ли?“. Това е говоримото sehr и wirklich едновременно и се среща навсякъде.',
    },
  },
  {
    id: 'v-ziemlich',
    german: 'ziemlich',
    display: 'ziemlich',
    wordType: 'adverb',
    translation: { en: 'fairly, pretty', bg: 'доста' },
    pronunciation: { en: 'TSEEM-likh', bg: 'ЦИМ-лих' },
    example: {
      de: 'Das ist ziemlich kompliziert.',
      gloss: {
        en: 'That is pretty complicated.',
        bg: 'Това е доста сложно.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-total',
    german: 'total',
    display: 'total',
    wordType: 'adverb',
    translation: { en: 'totally, completely (spoken)', bg: 'напълно, страшно (разговорно)' },
    pronunciation: { en: 'to-TAHL', bg: 'то-ТАЛ' },
    example: {
      de: 'Ich habe das total vergessen.',
      gloss: {
        en: 'I completely forgot that.',
        bg: 'Напълно го забравих.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-der-quatsch',
    german: 'Quatsch',
    display: 'der Quatsch',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'nonsense, rubbish', bg: 'глупости' },
    pronunciation: { en: 'kvatch', bg: 'кватш' },
    example: {
      de: 'Ach Quatsch, das macht doch nichts.',
      gloss: {
        en: 'Oh nonsense, it does not matter.',
        bg: 'Ама глупости, няма нищо.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Friendly rather than rude — often used to wave away somebody’s apology. *Quatsch, kein Problem.*',
      bg: 'По-скоро дружелюбно, отколкото грубо — често се използва, за да отхвърлиш нечие извинение. *Quatsch, kein Problem.*',
    },
  },
  {
    id: 'v-das-zeug',
    german: 'Zeug',
    display: 'das Zeug',
    article: 'das',
    gender: 'n',
    wordType: 'noun',
    translation: { en: 'stuff', bg: 'нещата, вещи' },
    pronunciation: { en: 'tsoyk', bg: 'цойг' },
    example: {
      de: 'Nimm dein Zeug bitte mit.',
      gloss: {
        en: 'Take your stuff with you, please.',
        bg: 'Вземи си нещата, моля.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-der-typ',
    german: 'Typ',
    display: 'der Typ',
    article: 'der',
    gender: 'm',
    plural: 'die Typen',
    wordType: 'noun',
    translation: { en: 'guy, bloke', bg: 'тип, пич' },
    pronunciation: { en: 'tueep', bg: 'тюп' },
    example: {
      de: 'Der Typ von der Hausverwaltung hat angerufen.',
      gloss: {
        en: 'The guy from the property management called.',
        bg: 'Типът от домоуправлението се обади.',
      },
    },
    tags: ['spoken'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Neutral to mildly dismissive depending on tone, and never for somebody present. In a meeting, use der Kollege or der Herr.',
      bg: 'Неутрално до леко пренебрежително според тона и никога за присъстващ. На работна среща използвай der Kollege или der Herr.',
    },
  },
];

export const SPOKEN_VOCAB: VocabEntry[] = [...REPLACEMENTS, ...SMALL_TALK, ...FLAVOUR];
