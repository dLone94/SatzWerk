import type { VocabEntry } from '../types.ts';

/**
 * Numbers and money (Pre-A1 Unit 3).
 *
 * Numbers are stored as vocabulary so they take part in the review queue and
 * the vocabulary browser like any other word. The pronunciation fields matter
 * more here than anywhere else: "zwei" and "drei" are easy to confuse on the
 * phone, which is why German often says "zwo" for two.
 */

type Init = {
  id: string;
  de: string;
  en: string;
  bg: string;
  pronEn: string;
  pronBg: string;
  lesson: string;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  note?: { en?: string; bg?: string };
  /** Override the generated age example where it would be bad German. */
  example?: { de: string; en: string; bg: string };
};

/** Numerals share almost all their metadata, so they are built from a table. */
function numeral(init: Init): VocabEntry {
  return {
    id: init.id,
    german: init.de,
    display: init.de,
    wordType: 'numeral',
    translation: { en: init.en, bg: init.bg },
    pronunciation: { en: init.pronEn, bg: init.pronBg },
    example: init.example
      ? { de: init.example.de, gloss: { en: init.example.en, bg: init.example.bg } }
      : {
          de: `Ich bin ${init.de} Jahre alt.`,
          gloss: {
            en: `I am ${init.en} years old.`,
            bg: `Аз съм на ${init.bg} години.`,
          },
        },
    tags: ['numbers'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: init.lesson,
    difficulty: init.difficulty ?? 1,
    ...(init.note ? { notes: init.note } : {}),
  };
}

const L1 = 'pre-a1-u3-l1';
const L2 = 'pre-a1-u3-l2';
const L3 = 'pre-a1-u3-l3';

const ONES: VocabEntry[] = [
  numeral({ id: 'v-null', de: 'null', en: 'zero', bg: 'нула', pronEn: 'nool', pronBg: 'нул', lesson: L1,
    example: {
      de: 'Meine Nummer beginnt mit null.',
      en: 'My number starts with zero.',
      bg: 'Номерът ми започва с нула.',
    } }),
  numeral({ id: 'v-eins', de: 'eins', en: 'one', bg: 'едно', pronEn: 'eyns', pronBg: 'айнс', lesson: L1,
    example: {
      de: 'Ich habe ein Kind.',
      en: 'I have one child.',
      bg: 'Имам едно дете.',
    },
    note: {
      en: 'Standing alone it is "eins", but before a noun it becomes ein/eine: ein Kind, eine Frau.',
      bg: 'Самостоятелно е „eins“, но пред съществително става ein/eine: ein Kind, eine Frau.',
    } }),
  numeral({ id: 'v-zwei', de: 'zwei', en: 'two', bg: 'две', pronEn: 'tsvy', pronBg: 'цвай', lesson: L1,
    note: {
      en: 'On the phone Germans often say "zwo" instead, so it cannot be confused with "drei".',
      bg: 'По телефона немците често казват „zwo“, за да не се обърка с „drei“.',
    } }),
  numeral({ id: 'v-drei', de: 'drei', en: 'three', bg: 'три', pronEn: 'dry', pronBg: 'драй', lesson: L1 }),
  numeral({ id: 'v-vier', de: 'vier', en: 'four', bg: 'четири', pronEn: 'feer', pronBg: 'фир', lesson: L1,
    note: {
      en: 'Remember: "ie" says "ee", and "v" says "f". So it is FEER, not "vire".',
      bg: 'Помни: „ie“ се чете „и“, а „v“ се чете „ф“. Значи ФИР, а не „виер“.',
    } }),
  numeral({ id: 'v-fuenf', de: 'fünf', en: 'five', bg: 'пет', pronEn: 'fuenf', pronBg: 'фюнф', lesson: L1, difficulty: 2 }),
  numeral({ id: 'v-sechs', de: 'sechs', en: 'six', bg: 'шест', pronEn: 'zeks', pronBg: 'зекс', lesson: L1, difficulty: 2 }),
  numeral({ id: 'v-sieben', de: 'sieben', en: 'seven', bg: 'седем', pronEn: 'ZEE-ben', pronBg: 'ЗИ-бен', lesson: L1 }),
  numeral({ id: 'v-acht', de: 'acht', en: 'eight', bg: 'осем', pronEn: 'akht', pronBg: 'ахт', lesson: L1 }),
  numeral({ id: 'v-neun', de: 'neun', en: 'nine', bg: 'девет', pronEn: 'noyn', pronBg: 'нойн', lesson: L1 }),
  numeral({ id: 'v-zehn', de: 'zehn', en: 'ten', bg: 'десет', pronEn: 'tsayn', pronBg: 'цейн', lesson: L1 }),
];

const TEENS: VocabEntry[] = [
  numeral({ id: 'v-elf', de: 'elf', en: 'eleven', bg: 'единайсет', pronEn: 'elf', pronBg: 'елф', lesson: L1 }),
  numeral({ id: 'v-zwoelf', de: 'zwölf', en: 'twelve', bg: 'дванайсет', pronEn: 'tsvoelf', pronBg: 'цвьолф', lesson: L1, difficulty: 2 }),
  numeral({ id: 'v-dreizehn', de: 'dreizehn', en: 'thirteen', bg: 'тринайсет', pronEn: 'DRY-tsayn', pronBg: 'ДРАЙ-цейн', lesson: L1,
    note: {
      en: 'From 13 upwards the pattern is regular: the digit plus -zehn.',
      bg: 'От 13 нагоре моделът е правилен: цифрата плюс -zehn.',
    } }),
  numeral({ id: 'v-vierzehn', de: 'vierzehn', en: 'fourteen', bg: 'четиринайсет', pronEn: 'FEER-tsayn', pronBg: 'ФИР-цейн', lesson: L1 }),
  numeral({ id: 'v-fuenfzehn', de: 'fünfzehn', en: 'fifteen', bg: 'петнайсет', pronEn: 'FUENF-tsayn', pronBg: 'ФЮНФ-цейн', lesson: L1, difficulty: 2 }),
  numeral({ id: 'v-sechzehn', de: 'sechzehn', en: 'sixteen', bg: 'шестнайсет', pronEn: 'ZEKH-tsayn', pronBg: 'ЗЕХ-цейн', lesson: L1, difficulty: 3,
    note: {
      en: 'Irregular: "sechs" loses its s here — sechzehn, not "sechszehn".',
      bg: 'Неправилно: „sechs“ губи своето s — sechzehn, а не „sechszehn“.',
    } }),
  numeral({ id: 'v-siebzehn', de: 'siebzehn', en: 'seventeen', bg: 'седемнайсет', pronEn: 'ZEEP-tsayn', pronBg: 'ЗИП-цейн', lesson: L1, difficulty: 3,
    note: {
      en: 'Irregular: "sieben" loses its -en — siebzehn, not "siebenzehn".',
      bg: 'Неправилно: „sieben“ губи своето -en — siebzehn, а не „siebenzehn“.',
    } }),
  numeral({ id: 'v-achtzehn', de: 'achtzehn', en: 'eighteen', bg: 'осемнайсет', pronEn: 'AKHT-tsayn', pronBg: 'АХТ-цейн', lesson: L1 }),
  numeral({ id: 'v-neunzehn', de: 'neunzehn', en: 'nineteen', bg: 'деветнайсет', pronEn: 'NOYN-tsayn', pronBg: 'НОЙН-цейн', lesson: L1 }),
  numeral({ id: 'v-zwanzig', de: 'zwanzig', en: 'twenty', bg: 'двайсет', pronEn: 'TSVAN-tsikh', pronBg: 'ЦВАН-цих', lesson: L1,
    note: {
      en: 'The ending -ig is said "-ikh" in standard German, not "-ig".',
      bg: 'Окончанието -ig в стандартния немски се чете „-их“, а не „-иг“.',
    } }),
];

const TENS: VocabEntry[] = [
  numeral({ id: 'v-dreissig', de: 'dreißig', en: 'thirty', bg: 'трийсет', pronEn: 'DRY-sikh', pronBg: 'ДРАЙ-сих', lesson: L2, difficulty: 2,
    note: {
      en: 'The only ten written with ß instead of -zig.',
      bg: 'Единственото десетично число, писано с ß вместо -zig.',
    } }),
  numeral({ id: 'v-vierzig', de: 'vierzig', en: 'forty', bg: 'четирийсет', pronEn: 'FEER-tsikh', pronBg: 'ФИР-цих', lesson: L2, difficulty: 2 }),
  numeral({ id: 'v-fuenfzig', de: 'fünfzig', en: 'fifty', bg: 'петдесет', pronEn: 'FUENF-tsikh', pronBg: 'ФЮНФ-цих', lesson: L2, difficulty: 2 }),
  numeral({ id: 'v-sechzig', de: 'sechzig', en: 'sixty', bg: 'шейсет', pronEn: 'ZEKH-tsikh', pronBg: 'ЗЕХ-цих', lesson: L2, difficulty: 3 }),
  numeral({ id: 'v-siebzig', de: 'siebzig', en: 'seventy', bg: 'седемдесет', pronEn: 'ZEEP-tsikh', pronBg: 'ЗИП-цих', lesson: L2, difficulty: 3 }),
  numeral({ id: 'v-achtzig', de: 'achtzig', en: 'eighty', bg: 'осемдесет', pronEn: 'AKHT-tsikh', pronBg: 'АХТ-цих', lesson: L2, difficulty: 2 }),
  numeral({ id: 'v-neunzig', de: 'neunzig', en: 'ninety', bg: 'деветдесет', pronEn: 'NOYN-tsikh', pronBg: 'НОЙН-цих', lesson: L2, difficulty: 2 }),
  numeral({ id: 'v-hundert', de: 'hundert', en: 'a hundred', bg: 'сто', pronEn: 'HOON-dert', pronBg: 'ХУН-дерт', lesson: L2 }),
  numeral({ id: 'v-einundzwanzig', de: 'einundzwanzig', en: 'twenty-one', bg: 'двайсет и едно', pronEn: 'EYN-oont-tsvan-tsikh', pronBg: 'АЙН-унт-цван-цих', lesson: L2, difficulty: 4,
    note: {
      en: 'Said back to front: literally "one-and-twenty", written as one word.',
      bg: 'Казва се обратно: буквално „едно-и-двайсет“, изписано като една дума.',
    } }),
  numeral({ id: 'v-zweiunddreissig', de: 'zweiunddreißig', en: 'thirty-two', bg: 'трийсет и две', pronEn: 'TSVY-oont-dry-sikh', pronBg: 'ЦВАЙ-унт-драй-сих', lesson: L2, difficulty: 4 }),
];

const MONEY_AND_QUANTITY: VocabEntry[] = [
  {
    id: 'v-das-jahr',
    german: 'Jahr',
    display: 'das Jahr',
    article: 'das',
    gender: 'n',
    plural: 'die Jahre',
    wordType: 'noun',
    translation: { en: 'the year', bg: 'годината' },
    pronunciation: { en: 'YAHR', bg: 'ЯР' },
    example: {
      de: 'Ich bin dreißig Jahre alt.',
      gloss: { en: 'I am thirty years old.', bg: 'Аз съм на трийсет години.' },
    },
    tags: ['numbers', 'time'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 2,
    collocations: [
      { de: 'Jahre alt', gloss: { en: 'years old', bg: 'години (за възраст)' } },
    ],
    notes: {
      en: 'German says "dreißig Jahre alt", with the plural Jahre. In speech the phrase is often shortened to just "Ich bin dreißig", but write it out in full while you are learning it.',
      bg: 'Немският казва „dreißig Jahre alt“ с множествено число, докато българският казва просто „на трийсет“. В говора немците често съкращават на „Ich bin dreißig“, но докато учиш, пиши целия израз.',
    },
  },
  {
    id: 'v-alt',
    german: 'alt',
    display: 'alt',
    wordType: 'adjective',
    translation: { en: 'old', bg: 'стар; на (възраст)' },
    pronunciation: { en: 'ahlt', bg: 'алт' },
    example: {
      de: 'Wie alt bist du?',
      gloss: { en: 'How old are you?', bg: 'На колко години си?' },
    },
    tags: ['numbers', 'adjective'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 1,
  },
  {
    id: 'v-wie-alt-bist-du',
    german: 'Wie alt bist du?',
    display: 'Wie alt bist du?',
    wordType: 'phrase',
    translation: { en: 'How old are you? (informal)', bg: 'На колко години си?' },
    pronunciation: { en: 'vee AHLT bist doo', bg: 'ви АЛТ бист ду' },
    example: {
      de: 'Wie alt bist du? — Ich bin zweiunddreißig.',
      gloss: { en: 'How old are you? — I am thirty-two.', bg: 'На колко години си? — На трийсет и две.' },
    },
    tags: ['numbers', 'question'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 2,
    collocations: [{ de: 'Wie alt sind Sie?', gloss: { en: 'How old are you? (formal)', bg: 'На колко години сте? (учтиво)' } }],
  },
  {
    id: 'v-die-telefonnummer',
    german: 'Telefonnummer',
    display: 'die Telefonnummer',
    article: 'die',
    gender: 'f',
    plural: 'die Telefonnummern',
    wordType: 'noun',
    translation: { en: 'the phone number', bg: 'телефонният номер' },
    pronunciation: { en: 'te-le-FOHN-noo-mer', bg: 'те-ле-ФОН-ну-мер' },
    example: {
      de: 'Wie ist deine Telefonnummer?',
      gloss: { en: 'What is your phone number?', bg: 'Какъв е телефонният ти номер?' },
    },
    tags: ['numbers', 'personal'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 3,
    notes: {
      bg: 'Родът не съвпада: die Telefonnummer е от женски род, а българското „номер“ е от мъжки род.',
      en: 'German asks "Wie ist ...?" (how is) for a number, not "What is ...?".',
    },
  },
  {
    id: 'v-der-euro',
    german: 'Euro',
    display: 'der Euro',
    article: 'der',
    gender: 'm',
    plural: 'die Euro',
    wordType: 'noun',
    translation: { en: 'the euro', bg: 'еврото' },
    pronunciation: { en: 'OY-ro', bg: 'ОЙ-ро' },
    example: {
      de: 'Das kostet drei Euro.',
      gloss: { en: 'That costs three euros.', bg: 'Това струва три евро.' },
    },
    tags: ['numbers', 'money'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Note: "eu" is said "oy", so it is OY-ro. The plural stays "Euro" after a number.',
      bg: 'Внимание: „eu“ се чете „ой“, значи ОЙ-ро. След число множественото остава „Euro“.',
    },
  },
  {
    id: 'v-kosten',
    german: 'kosten',
    display: 'kosten',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gekostet' },
    translation: { en: 'to cost', bg: 'струвам' },
    pronunciation: { en: 'KOS-ten', bg: 'КОС-тен' },
    example: {
      de: 'Wie viel kostet das?',
      gloss: { en: 'How much does that cost?', bg: 'Колко струва това?' },
    },
    tags: ['numbers', 'money', 'verb'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-wie-viel',
    german: 'Wie viel?',
    display: 'Wie viel?',
    wordType: 'phrase',
    translation: { en: 'How much?', bg: 'Колко?' },
    pronunciation: { en: 'vee FEEL', bg: 'ви ФИЛ' },
    example: {
      de: 'Wie viel kostet ein Kaffee?',
      gloss: { en: 'How much does a coffee cost?', bg: 'Колко струва едно кафе?' },
    },
    tags: ['numbers', 'question'],
    level: 'pre-a1',
    unitId: 'pre-a1-u3',
    lessonId: L3,
    difficulty: 2,
    collocations: [
      { de: 'Wie viele?', gloss: { en: 'How many? (with countable things)', bg: 'Колко? (при броими неща)' } },
    ],
    notes: {
      en: '"Wie viel" for amounts, "Wie viele" for countable things: Wie viele Kinder hast du?',
      bg: '„Wie viel“ за количество, „Wie viele“ за броими неща: Wie viele Kinder hast du?',
    },
  },
];

export const NUMBER_VOCAB: VocabEntry[] = [...ONES, ...TEENS, ...TENS, ...MONEY_AND_QUANTITY];
