import type { VocabEntry } from '../types.ts';

/**
 * Formal written German (B2 Unit 4).
 *
 * B1 Unit 6 taught the shape of a formal letter — the salutation, the comma,
 * the small letter after it, *Hiermit teile ich Ihnen mit*. This unit is what
 * goes inside one when the letter has to achieve something: a complaint, a
 * deadline, a demand for a remedy.
 *
 * The words below are chosen for a specific reason: almost none of them can be
 * guessed from the spoken language the learner already has. *Mangel*,
 * *Rückerstattung*, *fristgerecht*, *umgehend* and *beiliegend* belong to
 * written German only, and a learner who writes *Das Ding ist kaputt und ich
 * will mein Geld zurück* will be understood, ignored, and quietly filed.
 *
 * Three groups:
 *
 * **The complaint itself** (lesson 1): der Mangel, die Reklamation, beheben,
 * die Rückerstattung. These are the nouns the Funktionsverbgefüge attach to —
 * *in Anspruch nehmen*, *Bezug nehmen auf* — which is why the noun-heavy
 * vocabulary arrives with the noun-heavy grammar.
 *
 * **The apparatus of a letter** (lesson 2): der Betreff, das Schreiben, der
 * Anhang, der Eingang. Words for the parts of the document rather than for
 * anything in the world.
 *
 * **Politeness at a distance** (lesson 3): hinweisen, um etwas bitten,
 * umgehend, fristgerecht. The vocabulary of asking firmly without ever raising
 * your voice — which is what German officialdom expects and what gets an
 * answer.
 */

const U = 'b2-u4';
const L1 = 'b2-u4-l1';
const L2 = 'b2-u4-l2';
const L3 = 'b2-u4-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the complaint
 * ------------------------------------------------------------------ */

const COMPLAINT: VocabEntry[] = [
  {
    id: 'v-der-mangel',
    german: 'Mangel',
    display: 'der Mangel',
    article: 'der',
    gender: 'm',
    plural: 'die Mängel',
    wordType: 'noun',
    translation: { en: 'defect, fault', bg: 'дефект, недостатък' },
    pronunciation: { en: 'MANG-el', bg: 'МАН-гел' },
    example: {
      de: 'Der Mangel wurde bereits bei der Lieferung festgestellt.',
      gloss: {
        en: 'The defect was noticed on delivery.',
        bg: 'Дефектът беше установен още при доставката.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'The legal word. *kaputt* is what you say to a friend; *ein Mangel* is what you write to a company, because it is the word a warranty is written in.',
      bg: 'Юридическата дума. *kaputt* се казва на приятел; *ein Mangel* се пише на фирма, защото с тази дума е написана гаранцията.',
    },
  },
  {
    id: 'v-die-reklamation',
    german: 'Reklamation',
    display: 'die Reklamation',
    article: 'die',
    gender: 'f',
    plural: 'die Reklamationen',
    wordType: 'noun',
    translation: { en: 'complaint about goods, claim', bg: 'рекламация' },
    pronunciation: { en: 'rek-lah-mah-TSYOHN', bg: 'рек-ла-ма-ЦИОН' },
    example: {
      de: 'Ich möchte eine Reklamation einreichen.',
      gloss: {
        en: 'I would like to submit a complaint.',
        bg: 'Бих искал да подам рекламация.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'A Reklamation is about a product or a service. A Beschwerde is about treatment or behaviour. Germans do not mix them, and using the wrong one sends your letter to the wrong desk.',
      bg: 'Reklamation е за стока или услуга. Beschwerde е за отношение или поведение. Германците не ги смесват, а сгрешената дума праща писмото ти на грешното бюро.',
    },
  },
  {
    id: 'v-beheben',
    german: 'beheben',
    display: 'beheben',
    wordType: 'verb',
    translation: { en: 'to remedy, to fix (a fault)', bg: 'да отстраня (повреда)' },
    pronunciation: { en: 'buh-HAY-ben', bg: 'бе-ХЕ-бен' },
    example: {
      de: 'Bitte beheben Sie den Mangel bis zum 15. März.',
      gloss: {
        en: 'Please remedy the defect by 15 March.',
        bg: 'Моля, отстранете дефекта до 15 март.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'behoben' },
    notes: {
      en: 'reparieren is what a mechanic does to a car. beheben is what a company does to a Mangel, a Störung or a Fehler — it removes the problem rather than mending the object.',
      bg: 'reparieren е това, което механикът прави с колата. beheben е това, което фирмата прави с Mangel, Störung или Fehler — премахва проблема, а не поправя предмета.',
    },
  },
  {
    id: 'v-die-rueckerstattung',
    german: 'Rückerstattung',
    display: 'die Rückerstattung',
    article: 'die',
    gender: 'f',
    plural: 'die Rückerstattungen',
    wordType: 'noun',
    translation: { en: 'refund, reimbursement', bg: 'възстановяване на сума' },
    pronunciation: { en: 'RUEK-air-shtat-ung', bg: 'РЮК-ер-щат-унг' },
    example: {
      de: 'Ich bitte um die Rückerstattung des Kaufpreises.',
      gloss: {
        en: 'I request a refund of the purchase price.',
        bg: 'Моля за възстановяване на покупната цена.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
  },
  {
    id: 'v-die-lieferung',
    german: 'Lieferung',
    display: 'die Lieferung',
    article: 'die',
    gender: 'f',
    plural: 'die Lieferungen',
    wordType: 'noun',
    translation: { en: 'delivery, consignment', bg: 'доставка' },
    pronunciation: { en: 'LEE-fuh-rung', bg: 'ЛИ-фе-рунг' },
    example: {
      de: 'Die Lieferung ist beschädigt bei mir angekommen.',
      gloss: {
        en: 'The delivery arrived damaged.',
        bg: 'Доставката пристигна повредена.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
  },
  {
    id: 'v-die-gewaehrleistung',
    german: 'Gewährleistung',
    display: 'die Gewährleistung',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'statutory warranty', bg: 'законова гаранция' },
    pronunciation: { en: 'guh-VAIR-lyst-ung', bg: 'ге-ВЕР-лайст-унг' },
    example: {
      de: 'Die Gewährleistung beträgt zwei Jahre.',
      gloss: {
        en: 'The statutory warranty is two years.',
        bg: 'Законовата гаранция е две години.',
      },
    },
    tags: ['formal', 'complaint'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 5,
    notes: {
      en: 'A legal object before it is a word, like Kaution at B1. Gewährleistung is the two years the law gives you; Garantie is whatever the manufacturer promises on top, voluntarily. Germans keep them apart and so do their letters.',
      bg: 'Юридически обект, преди да е дума, също като Kaution в B1. Gewährleistung са двете години, които законът ти дава; Garantie е онова, което производителят обещава допълнително и доброволно. Германците ги разграничават — и писмата им също.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the apparatus of a letter
 * ------------------------------------------------------------------ */

const LETTER: VocabEntry[] = [
  {
    id: 'v-der-betreff',
    german: 'Betreff',
    display: 'der Betreff',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'subject line', bg: 'относно (тема на писмо)' },
    pronunciation: { en: 'buh-TREFF', bg: 'бе-ТРЕФ' },
    example: {
      de: 'Betreff: Reklamation zur Bestellung 4711',
      gloss: {
        en: 'Subject: complaint regarding order 4711',
        bg: 'Относно: рекламация по поръчка 4711',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The line is written without a verb and without an article: *Betreff: Reklamation zur Bestellung 4711*. A German subject line names the matter; it does not make a sentence.',
      bg: 'Редът се пише без глагол и без член: *Betreff: Reklamation zur Bestellung 4711*. Немското „относно“ назовава въпроса, а не образува изречение.',
    },
  },
  {
    id: 'v-das-schreiben',
    german: 'Schreiben',
    display: 'das Schreiben',
    article: 'das',
    gender: 'n',
    plural: 'die Schreiben',
    wordType: 'noun',
    translation: { en: 'letter (formal), written communication', bg: 'писмо (официално)' },
    pronunciation: { en: 'SHRY-ben', bg: 'ШРАЙ-бен' },
    example: {
      de: 'Bezug nehmend auf Ihr Schreiben vom 3. Mai …',
      gloss: {
        en: 'With reference to your letter of 3 May …',
        bg: 'Във връзка с Вашето писмо от 3 май …',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'An infinitive used as a noun, so neuter — the rule from B2 Unit 1. der Brief is the physical letter; das Schreiben is the official one, and it is what an authority calls its own.',
      bg: 'Инфинитив, употребен като съществително, затова е от среден род — правилото от B2, раздел 1. der Brief е физическото писмо; das Schreiben е официалното и точно така институцията нарича своето.',
    },
  },
  {
    id: 'v-der-anhang',
    german: 'Anhang',
    display: 'der Anhang',
    article: 'der',
    gender: 'm',
    plural: 'die Anhänge',
    wordType: 'noun',
    translation: { en: 'attachment, appendix', bg: 'приложение, прикачен файл' },
    pronunciation: { en: 'AN-hang', bg: 'АН-ханг' },
    example: {
      de: 'Die Rechnung finden Sie im Anhang.',
      gloss: {
        en: 'You will find the invoice attached.',
        bg: 'Фактурата ще намерите в приложението.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-beiliegend',
    german: 'beiliegend',
    display: 'beiliegend',
    wordType: 'adjective',
    translation: { en: 'enclosed, attached', bg: 'приложен, приложено' },
    pronunciation: { en: 'BY-lee-gend', bg: 'БАЙ-ли-генд' },
    example: {
      de: 'Beiliegend erhalten Sie eine Kopie der Rechnung.',
      gloss: {
        en: 'Please find enclosed a copy of the invoice.',
        bg: 'Приложено получавате копие от фактурата.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'A Partizip I used as an adverb, exactly the form from Unit 3. It opens the sentence, so the verb comes second: **Beiliegend erhalten Sie** …',
      bg: 'Partizip I, употребено като наречие — точно формата от раздел 3. Стои в началото, затова глаголът е втори: **Beiliegend erhalten Sie** …',
    },
  },
  {
    id: 'v-der-eingang',
    german: 'Eingang',
    display: 'der Eingang',
    article: 'der',
    gender: 'm',
    plural: 'die Eingänge',
    wordType: 'noun',
    translation: { en: 'receipt (of a document); entrance', bg: 'получаване (на документ); вход' },
    pronunciation: { en: 'INE-gang', bg: 'АЙН-ганг' },
    example: {
      de: 'Bitte bestätigen Sie den Eingang dieses Schreibens.',
      gloss: {
        en: 'Please confirm receipt of this letter.',
        bg: 'Моля, потвърдете получаването на това писмо.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'The same word as the door you walk through. In a letter it means the arrival of the document, and *den Eingang bestätigen* is a fixed phrase worth learning whole.',
      bg: 'Същата дума като входа, през който минаваш. В писмо означава постъпването на документа, а *den Eingang bestätigen* е устойчив израз, който се учи наведнъж.',
    },
  },
  {
    id: 'v-die-bestaetigung',
    german: 'Bestätigung',
    display: 'die Bestätigung',
    article: 'die',
    gender: 'f',
    plural: 'die Bestätigungen',
    wordType: 'noun',
    translation: { en: 'confirmation', bg: 'потвърждение' },
    pronunciation: { en: 'buh-SHTET-ig-ung', bg: 'бе-ЩЕ-ти-гунг' },
    example: {
      de: 'Eine schriftliche Bestätigung wäre hilfreich.',
      gloss: {
        en: 'A written confirmation would be helpful.',
        bg: 'Писмено потвърждение би било полезно.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — firm, and never loud
 * ------------------------------------------------------------------ */

const POLITE: VocabEntry[] = [
  {
    id: 'v-hinweisen',
    german: 'hinweisen',
    display: 'hinweisen',
    wordType: 'verb',
    translation: { en: 'to point out', bg: 'да обърна внимание, да посоча' },
    pronunciation: { en: 'HIN-vy-zen', bg: 'ХИН-вай-зен' },
    example: {
      de: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
      gloss: {
        en: 'I would like to point out that the deadline has passed.',
        bg: 'Бих искал да Ви обърна внимание, че срокът е изтекъл.',
      },
    },
    tags: ['formal', 'politeness'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'hingewiesen' },
    collocations: [
      { de: 'auf etwas hinweisen', gloss: { en: 'to point something out', bg: 'да посоча нещо' } },
    ],
    notes: {
      en: 'The polite way to say "you have got this wrong". *Ich möchte Sie darauf hinweisen, dass …* is a warning shot delivered with impeccable manners.',
      bg: 'Учтивият начин да кажеш „тук грешите“. *Ich möchte Sie darauf hinweisen, dass …* е предупредителен изстрел с безупречни маниери.',
    },
  },
  {
    id: 'v-bitten-um',
    german: 'bitten um',
    display: 'bitten um',
    wordType: 'phrase',
    translation: { en: 'to request (something)', bg: 'да помоля за (нещо)' },
    pronunciation: { en: 'BIT-en oom', bg: 'БИ-тен ум' },
    example: {
      de: 'Ich bitte um eine schriftliche Bestätigung.',
      gloss: {
        en: 'I request a written confirmation.',
        bg: 'Моля за писмено потвърждение.',
      },
    },
    tags: ['formal', 'politeness'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Takes the accusative after um, and it is the formal register’s standard request. *Ich will* never appears in such a letter; *ich bitte um* does the same work and gets answered.',
      bg: 'След um иска винителен падеж и е стандартната молба в официалния регистър. *Ich will* никога не се появява в такова писмо; *ich bitte um* върши същата работа и получава отговор.',
    },
  },
  {
    id: 'v-umgehend',
    german: 'umgehend',
    display: 'umgehend',
    wordType: 'adjective',
    translation: { en: 'immediate, without delay', bg: 'незабавен, незабавно' },
    pronunciation: { en: 'OOM-gay-end', bg: 'УМ-ге-енд' },
    example: {
      de: 'Ich bitte um eine umgehende Antwort.',
      gloss: {
        en: 'I request an immediate reply.',
        bg: 'Моля за незабавен отговор.',
      },
    },
    tags: ['formal', 'politeness'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
  },
  {
    id: 'v-fristgerecht',
    german: 'fristgerecht',
    display: 'fristgerecht',
    wordType: 'adjective',
    translation: { en: 'within the deadline', bg: 'в срок' },
    pronunciation: { en: 'FRIST-guh-rekht', bg: 'ФРИСТ-ге-рехт' },
    example: {
      de: 'Die Kündigung ist fristgerecht eingegangen.',
      gloss: {
        en: 'The notice was received within the deadline.',
        bg: 'Предизвестието е постъпило в срок.',
      },
    },
    tags: ['formal', 'politeness'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    related: ['v-rechtzeitig'],
  },
  {
    id: 'v-die-angelegenheit',
    german: 'Angelegenheit',
    display: 'die Angelegenheit',
    article: 'die',
    gender: 'f',
    plural: 'die Angelegenheiten',
    wordType: 'noun',
    translation: { en: 'matter, affair', bg: 'въпрос, случай' },
    pronunciation: { en: 'AN-guh-lay-gen-hite', bg: 'АН-ге-ле-ген-хайт' },
    example: {
      de: 'Ich hoffe auf eine rasche Klärung der Angelegenheit.',
      gloss: {
        en: 'I hope for a swift resolution of the matter.',
        bg: 'Надявам се на бързо изясняване на въпроса.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: '-heit, so feminine. It is the word a letter uses instead of naming the problem again, once the Betreff has already named it.',
      bg: '-heit, значи женски род. Това е думата, която писмото използва вместо да назове проблема повторно, след като Betreff вече го е назовал.',
    },
  },
  {
    id: 'v-die-klaerung',
    german: 'Klärung',
    display: 'die Klärung',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'clarification, resolution', bg: 'изясняване' },
    pronunciation: { en: 'KLAIR-ung', bg: 'КЛЕ-рунг' },
    example: {
      de: 'Die Klärung des Falls dauert noch an.',
      gloss: {
        en: 'The clarification of the case is still ongoing.',
        bg: 'Изясняването на случая още продължава.',
      },
    },
    tags: ['formal', 'letter'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    related: ['v-die-angelegenheit'],
  },
];

export const FORMAL_VOCAB: VocabEntry[] = [...COMPLAINT, ...LETTER, ...POLITE];
