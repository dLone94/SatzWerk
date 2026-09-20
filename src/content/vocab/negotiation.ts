import type { VocabEntry } from '../types.ts';

/**
 * Argument and negotiation (B2 Unit 2).
 *
 * Unit 1 was about reporting work. This is about disagreeing about it, which
 * needs a different vocabulary and a much more careful one: at B1 a learner
 * could say *Ich bin nicht einverstanden* and be understood; at B2 the
 * question is whether the room still wants to work with them afterwards.
 *
 * Three groups, one per lesson.
 *
 * **Reporting what other people said** (lesson 1) is the vocabulary of
 * attribution — behaupten, zugeben, bestreiten, laut. These are the verbs that
 * carry Konjunktiv I, and several of them already contain a judgement:
 * *behaupten* is not a neutral "say", it marks the claim as unproven, which is
 * exactly why a report uses it.
 *
 * **Arguing** (lesson 2) is the machinery of a position: das Argument the
 * learner already has from B1, and now der Standpunkt, überzeugen, abwägen,
 * der Kompromiss.
 *
 * **Softening** (lesson 3) is the smallest group and the one that decides how
 * the disagreement lands: Bedenken, der Vorbehalt, einräumen, nachgeben.
 *
 * The modal particles — doch, mal, ja, eben, halt — are deliberately *not*
 * here. They have no translation to put in a vocabulary card; they are taught
 * in the grammar, where the explanation can be about what they do to a
 * sentence rather than what they mean.
 */

const U = 'b2-u2';
const L1 = 'b2-u2-l1';
const L2 = 'b2-u2-l2';
const L3 = 'b2-u2-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — reporting what someone else said
 * ------------------------------------------------------------------ */

const REPORTING: VocabEntry[] = [
  {
    id: 'v-behaupten',
    german: 'behaupten',
    display: 'behaupten',
    wordType: 'verb',
    translation: { en: 'to claim, to assert', bg: 'да твърдя' },
    pronunciation: { en: 'buh-HOWP-ten', bg: 'бе-ХАУП-тен' },
    example: {
      de: 'Er behauptet, er habe die E-Mail nie bekommen.',
      gloss: {
        en: 'He claims he never received the email.',
        bg: 'Той твърди, че никога не е получил имейла.',
      },
    },
    tags: ['argument', 'reporting'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'behauptet' },
    notes: {
      en: 'Not a neutral "say". behaupten marks the claim as unproven, and possibly as untrue — which is why it is the verb a report reaches for when it is not taking sides.',
      bg: 'Не е неутрално „казвам“. behaupten маркира твърдението като недоказано, а понякога и като невярно — затова докладът посяга към него, когато не взема страна.',
    },
  },
  {
    id: 'v-zugeben',
    german: 'zugeben',
    display: 'zugeben',
    wordType: 'verb',
    translation: { en: 'to admit', bg: 'да призная' },
    pronunciation: { en: 'TSOO-gay-ben', bg: 'ЦУ-ге-бен' },
    example: {
      de: 'Ich gebe zu, dass ich mich geirrt habe.',
      gloss: {
        en: 'I admit that I was wrong.',
        bg: 'Признавам, че съм сгрешил.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'zugegeben' },
  },
  {
    id: 'v-bestreiten',
    german: 'bestreiten',
    display: 'bestreiten',
    wordType: 'verb',
    translation: { en: 'to deny, to dispute', bg: 'да оспоря, да отрека' },
    pronunciation: { en: 'buh-SHTRY-ten', bg: 'бе-ЩРАЙ-тен' },
    example: {
      de: 'Die Firma bestreitet, dass es eine Verzögerung gab.',
      gloss: {
        en: 'The company denies that there was a delay.',
        bg: 'Фирмата отрича, че е имало забавяне.',
      },
    },
    tags: ['argument', 'reporting'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'bestritten' },
  },
  {
    id: 'v-laut',
    german: 'laut',
    display: 'laut',
    wordType: 'preposition',
    translation: { en: 'according to', bg: 'според' },
    pronunciation: { en: 'lowt', bg: 'лаут' },
    example: {
      de: 'Laut dem Bericht ist alles rechtzeitig fertig geworden.',
      gloss: {
        en: 'According to the report, everything was finished in good time.',
        bg: 'Според доклада всичко е било готово навреме.',
      },
    },
    tags: ['argument', 'reporting'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'A different word from the adjective laut meaning "loud" — same spelling, unrelated job. This one takes the dative in speech and the genitive in careful writing: laut dem Bericht, laut des Berichts.',
      bg: 'Различна дума от прилагателното laut със значение „силен, шумен“ — еднакъв правопис, различна роля. Тази се използва с дателен падеж в речта и с родителен в грижливото писане: laut dem Bericht, laut des Berichts.',
    },
  },
  {
    id: 'v-die-aussage',
    german: 'Aussage',
    display: 'die Aussage',
    article: 'die',
    gender: 'f',
    plural: 'die Aussagen',
    wordType: 'noun',
    translation: { en: 'statement', bg: 'изказване, твърдение' },
    pronunciation: { en: 'OWS-zah-guh', bg: 'АУС-за-ге' },
    example: {
      de: 'Seine Aussage widerspricht dem Protokoll.',
      gloss: {
        en: 'His statement contradicts the minutes.',
        bg: 'Изказването му противоречи на протокола.',
      },
    },
    tags: ['argument', 'reporting'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
  },
  {
    id: 'v-widersprechen',
    german: 'widersprechen',
    display: 'widersprechen',
    wordType: 'verb',
    translation: { en: 'to contradict', bg: 'да противореча' },
    pronunciation: { en: 'VEE-der-shpreh-khen', bg: 'ВИ-дер-шпре-хен' },
    example: {
      de: 'Ich möchte Ihnen da widersprechen.',
      gloss: {
        en: 'I would like to disagree with you there.',
        bg: 'Тук бих искал да ви възразя.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'widersprochen' },
    notes: {
      en: 'Takes the dative — you contradict *to* someone: Ich widerspreche Ihnen. And wider- is inseparable here, so the participle has no ge-: widersprochen.',
      bg: 'Изисква дателен падеж — противоречиш „на“ някого: Ich widerspreche Ihnen. А wider- тук е неразделима, затова причастието е без ge-: widersprochen.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — holding a position
 * ------------------------------------------------------------------ */

const ARGUING: VocabEntry[] = [
  {
    id: 'v-der-standpunkt',
    german: 'Standpunkt',
    display: 'der Standpunkt',
    article: 'der',
    gender: 'm',
    plural: 'die Standpunkte',
    wordType: 'noun',
    translation: { en: 'point of view, position', bg: 'гледна точка, позиция' },
    pronunciation: { en: 'SHTANT-poonkt', bg: 'ЩАНТ-пункт' },
    example: {
      de: 'Ich kann Ihren Standpunkt nachvollziehen.',
      gloss: {
        en: 'I can follow your point of view.',
        bg: 'Мога да разбера вашата гледна точка.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-ueberzeugen',
    german: 'überzeugen',
    display: 'überzeugen',
    wordType: 'verb',
    translation: { en: 'to convince', bg: 'да убедя' },
    pronunciation: { en: 'ue-ber-TSOY-gen', bg: 'юбер-ЦОЙ-ген' },
    example: {
      de: 'Das Argument hat mich nicht überzeugt.',
      gloss: {
        en: 'The argument did not convince me.',
        bg: 'Аргументът не ме убеди.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'überzeugt' },
    notes: {
      en: 'über- is inseparable here, so no ge- in the participle: überzeugt, not *übergezeugt*.',
      bg: 'Тук über- е неразделима, затова причастието е без ge-: überzeugt, а не *übergezeugt*.',
    },
  },
  {
    id: 'v-abwaegen',
    german: 'abwägen',
    display: 'abwägen',
    wordType: 'verb',
    translation: { en: 'to weigh up', bg: 'да преценя, да претегля' },
    pronunciation: { en: 'AHP-vay-gen', bg: 'АП-ве-ген' },
    example: {
      de: 'Wir müssen Vorteile und Nachteile abwägen.',
      gloss: {
        en: 'We have to weigh up the advantages and disadvantages.',
        bg: 'Трябва да преценим предимствата и недостатъците.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'abgewogen' },
  },
  {
    id: 'v-der-kompromiss',
    german: 'Kompromiss',
    display: 'der Kompromiss',
    article: 'der',
    gender: 'm',
    plural: 'die Kompromisse',
    wordType: 'noun',
    translation: { en: 'compromise', bg: 'компромис' },
    pronunciation: { en: 'kom-pro-MISS', bg: 'ком-про-МИС' },
    example: {
      de: 'Wir haben einen Kompromiss gefunden.',
      gloss: {
        en: 'We found a compromise.',
        bg: 'Намерихме компромис.',
      },
    },
    tags: ['argument', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    collocations: [
      { de: 'einen Kompromiss schließen', gloss: { en: 'to reach a compromise', bg: 'да постигна компромис' } },
    ],
  },
  {
    id: 'v-die-verhandlung',
    german: 'Verhandlung',
    display: 'die Verhandlung',
    article: 'die',
    gender: 'f',
    plural: 'die Verhandlungen',
    wordType: 'noun',
    translation: { en: 'negotiation', bg: 'преговори' },
    pronunciation: { en: 'fair-HAND-lung', bg: 'фер-ХАНД-лунг' },
    example: {
      de: 'Die Verhandlungen dauern schon drei Wochen.',
      gloss: {
        en: 'The negotiations have been going on for three weeks.',
        bg: 'Преговорите вървят вече три седмици.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-verhandeln'],
    notes: {
      en: 'German counts negotiations: die Verhandlungen, plural, where English says "the negotiation" as often as not.',
      bg: 'Немският брои преговорите: die Verhandlungen, множествено число, също както българското „преговори“.',
    },
  },
  {
    id: 'v-verhandeln',
    german: 'verhandeln',
    display: 'verhandeln',
    wordType: 'verb',
    translation: { en: 'to negotiate', bg: 'да преговарям' },
    pronunciation: { en: 'fair-HAN-deln', bg: 'фер-ХАН-делн' },
    example: {
      de: 'Über den Preis lässt sich verhandeln.',
      gloss: {
        en: 'The price is negotiable.',
        bg: 'Цената подлежи на договаряне.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'verhandelt' },
    related: ['v-die-verhandlung'],
  },
  {
    id: 'v-die-bedingung',
    german: 'Bedingung',
    display: 'die Bedingung',
    article: 'die',
    gender: 'f',
    plural: 'die Bedingungen',
    wordType: 'noun',
    translation: { en: 'condition, term', bg: 'условие' },
    pronunciation: { en: 'buh-DING-ung', bg: 'бе-ДИН-гунг' },
    example: {
      de: 'Unter dieser Bedingung stimmen wir zu.',
      gloss: {
        en: 'On that condition we agree.',
        bg: 'При това условие сме съгласни.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-der-aufwand',
    german: 'Aufwand',
    display: 'der Aufwand',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'effort, expenditure of time or money', bg: 'усилие, разход на време или средства' },
    pronunciation: { en: 'OWF-vant', bg: 'АУФ-ванд' },
    example: {
      de: 'Je größer der Aufwand, desto höher die Kosten.',
      gloss: {
        en: 'The greater the effort, the higher the costs.',
        bg: 'Колкото по-голямо е усилието, толкова по-високи са разходите.',
      },
    },
    tags: ['argument', 'work'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'One word for what English splits between "effort", "outlay" and "overhead" — how much of anything a thing costs you to do.',
      bg: 'Една дума за това, което българският дели между „усилие“, „разход“ и „натоварване“ — колко ти струва нещо, за да го направиш.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — softening the disagreement
 * ------------------------------------------------------------------ */

const SOFTENING: VocabEntry[] = [
  {
    id: 'v-das-bedenken',
    german: 'Bedenken',
    display: 'das Bedenken',
    article: 'das',
    gender: 'n',
    plural: 'die Bedenken',
    wordType: 'noun',
    translation: { en: 'reservations, misgivings', bg: 'съмнения, резерви' },
    pronunciation: { en: 'buh-DENK-en', bg: 'бе-ДЕН-кен' },
    example: {
      de: 'Da hätte ich Bedenken.',
      gloss: {
        en: 'I would have reservations about that.',
        bg: 'Тук бих имал резерви.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Neuter in the singular, but you will almost always meet it in the plural: *Ich habe Bedenken* is the mildest way German has of saying no to a plan without attacking it.',
      bg: 'В единствено число е от среден род, но почти винаги ще го срещаш в множествено: *Ich habe Bedenken* е най-мекият начин, по който немският отказва план, без да го атакува.',
    },
  },
  {
    id: 'v-einraeumen',
    german: 'einräumen',
    display: 'einräumen',
    wordType: 'verb',
    translation: { en: 'to concede, to grant (a point)', bg: 'да призная, да отстъпя (по точка)' },
    pronunciation: { en: 'INE-roy-men', bg: 'АЙН-рой-мен' },
    example: {
      de: 'Ich räume ein, dass der Zeitplan knapp ist.',
      gloss: {
        en: 'I concede that the schedule is tight.',
        bg: 'Признавам, че графикът е стегнат.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'eingeräumt' },
  },
  {
    id: 'v-nachgeben',
    german: 'nachgeben',
    display: 'nachgeben',
    wordType: 'verb',
    translation: { en: 'to give way, to yield', bg: 'да отстъпя' },
    pronunciation: { en: 'NAHKH-gay-ben', bg: 'НАХ-ге-бен' },
    example: {
      de: 'In diesem Punkt können wir nachgeben.',
      gloss: {
        en: 'On this point we can give way.',
        bg: 'По тази точка можем да отстъпим.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'nachgegeben' },
  },
  {
    id: 'v-der-vorbehalt',
    german: 'Vorbehalt',
    display: 'der Vorbehalt',
    article: 'der',
    gender: 'm',
    plural: 'die Vorbehalte',
    wordType: 'noun',
    translation: { en: 'reservation, proviso', bg: 'уговорка, резерва' },
    pronunciation: { en: 'FOR-buh-halt', bg: 'ФОР-бе-халт' },
    example: {
      de: 'Wir stimmen unter Vorbehalt zu.',
      gloss: {
        en: 'We agree with reservations.',
        bg: 'Съгласяваме се с уговорка.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
  },
  {
    id: 'v-sich-durchsetzen',
    german: 'sich durchsetzen',
    display: 'sich durchsetzen',
    wordType: 'verb',
    translation: { en: 'to get one’s way, to prevail', bg: 'да наложа позицията си' },
    pronunciation: { en: 'zikh DOORKH-zets-en', bg: 'зих ДУРХ-зец-ен' },
    example: {
      de: 'Am Ende hat sich sein Vorschlag durchgesetzt.',
      gloss: {
        en: 'In the end his proposal prevailed.',
        bg: 'Накрая неговото предложение надделя.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    perfect: { auxiliary: 'haben', participle: 'durchgesetzt' },
  },
  {
    id: 'v-die-mehrheit',
    german: 'Mehrheit',
    display: 'die Mehrheit',
    article: 'die',
    gender: 'f',
    plural: 'die Mehrheiten',
    wordType: 'noun',
    translation: { en: 'majority', bg: 'мнозинство' },
    pronunciation: { en: 'MARE-hite', bg: 'МЕР-хайт' },
    example: {
      de: 'Die Mehrheit war für den Kompromiss.',
      gloss: {
        en: 'The majority was in favour of the compromise.',
        bg: 'Мнозинството беше за компромиса.',
      },
    },
    tags: ['argument'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Another free gender rule: every noun ending in -heit or -keit is feminine, like every -ung from Unit 1.',
      bg: 'Още едно безплатно правило за рода: всяко съществително на -heit или -keit е от женски род, както всяко -ung от раздел 1.',
    },
  },
];

export const NEGOTIATION_VOCAB: VocabEntry[] = [...REPORTING, ...ARGUING, ...SOFTENING];
