import type { VocabEntry } from '../types.ts';

/**
 * At work: meetings and projects (B2 Unit 1).
 *
 * B1 taught the learner how to *get* a job — a CV, a cover letter, an
 * interview. B2 starts on the day after: this is the language of being in the
 * room once you already work there, where the problem is no longer being
 * understood but being taken seriously.
 *
 * Three groups, one per lesson.
 *
 * **Reporting on work** (lesson 1) is deliberately noun-heavy — Besprechung,
 * Protokoll, Bericht, Auftrag — because that is what the passive is for. A
 * status report almost never names who did anything: *der Bericht wurde
 * eingereicht*, not *ich habe ihn eingereicht*.
 *
 * **Meeting language** (lesson 2) is where the connectors live. allerdings,
 * dennoch and folglich are listed here as vocabulary rather than left to the
 * grammar, because a learner meets them as words first and only then
 * discovers what they do to the verb.
 *
 * **Nominalisations** (lesson 3) are given as the nouns they are, next to the
 * verbs they came from: durchführen → die Durchführung, umsetzen → die
 * Umsetzung, entscheiden → die Entscheidung. Seeing the pair is the whole
 * lesson in miniature.
 *
 * One pair is worth the space it takes: **die Verspätung** (A2, a train) and
 * **die Verzögerung** (here, a project). Both are "delay" in English and
 * „закъснение“ in Bulgarian, and using the train one about a deadline is the
 * kind of mistake that makes a fluent speaker sound careless rather than
 * foreign.
 */

const U = 'b2-u1';
const L1 = 'b2-u1-l1';
const L2 = 'b2-u1-l2';
const L3 = 'b2-u1-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — reporting on work that was done
 * ------------------------------------------------------------------ */

const REPORTING: VocabEntry[] = [
  {
    id: 'v-die-besprechung',
    german: 'Besprechung',
    display: 'die Besprechung',
    article: 'die',
    gender: 'f',
    plural: 'die Besprechungen',
    wordType: 'noun',
    translation: { en: 'meeting (work)', bg: 'работна среща' },
    pronunciation: { en: 'buh-SHPREH-khung', bg: 'бе-ШПРЕ-хунг' },
    example: {
      de: 'Die Besprechung wurde auf Montag verschoben.',
      gloss: {
        en: 'The meeting was postponed to Monday.',
        bg: 'Срещата беше отложена за понеделник.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    collocations: [
      { de: 'eine Besprechung ansetzen', gloss: { en: 'to schedule a meeting', bg: 'да насроча среща' } },
      { de: 'in einer Besprechung sein', gloss: { en: 'to be in a meeting', bg: 'да съм на среща' } },
    ],
    notes: {
      en: 'Das Meeting is used too, especially in international offices — but Besprechung is what appears in a calendar invitation from a German company.',
      bg: 'Използва се и das Meeting, особено в международни фирми — но Besprechung е думата в календарната покана от немска компания.',
    },
  },
  {
    id: 'v-das-protokoll',
    german: 'Protokoll',
    display: 'das Protokoll',
    article: 'das',
    gender: 'n',
    plural: 'die Protokolle',
    wordType: 'noun',
    translation: { en: 'minutes, written record', bg: 'протокол' },
    pronunciation: { en: 'pro-to-KOLL', bg: 'про-то-КОЛ' },
    example: {
      de: 'Das Protokoll wird nach der Besprechung verschickt.',
      gloss: {
        en: 'The minutes are sent out after the meeting.',
        bg: 'Протоколът се изпраща след срещата.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    collocations: [
      { de: 'das Protokoll führen', gloss: { en: 'to take the minutes', bg: 'да водя протокола' } },
    ],
  },
  {
    id: 'v-der-bericht',
    german: 'Bericht',
    display: 'der Bericht',
    article: 'der',
    gender: 'm',
    plural: 'die Berichte',
    wordType: 'noun',
    translation: { en: 'report', bg: 'доклад' },
    pronunciation: { en: 'buh-RIKHT', bg: 'бе-РИХТ' },
    example: {
      de: 'Der Bericht wurde gestern eingereicht.',
      gloss: {
        en: 'The report was submitted yesterday.',
        bg: 'Докладът беше подаден вчера.',
      },
    },
    tags: ['work'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-einreichen'],
  },
  {
    id: 'v-der-auftrag',
    german: 'Auftrag',
    display: 'der Auftrag',
    article: 'der',
    gender: 'm',
    plural: 'die Aufträge',
    wordType: 'noun',
    translation: { en: 'order, assignment, commission', bg: 'поръчка, възлагане' },
    pronunciation: { en: 'OWF-trahk', bg: 'АУФ-траг' },
    example: {
      de: 'Der Auftrag muss bis Freitag bearbeitet werden.',
      gloss: {
        en: 'The order has to be processed by Friday.',
        bg: 'Поръчката трябва да бъде обработена до петък.',
      },
    },
    tags: ['work'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    collocations: [
      { de: 'einen Auftrag erteilen', gloss: { en: 'to place an order', bg: 'да възложа поръчка' } },
      { de: 'im Auftrag von', gloss: { en: 'on behalf of', bg: 'от името на' } },
    ],
  },
  {
    id: 'v-erledigen',
    german: 'erledigen',
    display: 'erledigen',
    wordType: 'verb',
    translation: { en: 'to get done, to deal with, to complete', bg: 'да свърша, да уредя' },
    pronunciation: { en: 'air-LAY-dig-en', bg: 'ер-ЛЕ-ди-ген' },
    example: {
      de: 'Ich habe die Aufgabe schon erledigt.',
      gloss: {
        en: 'I have already dealt with the task.',
        bg: 'Вече свърших задачата.',
      },
    },
    tags: ['work'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'erledigt' },
    collocations: [
      { de: 'Das ist erledigt.', gloss: { en: 'That is done.', bg: 'Това е готово.' } },
    ],
    notes: {
      en: 'erledigt is the single most useful word in a German office: it means the thing is finished and off your list, which is why it turns up as a state — Das ist erledigt.',
      bg: 'erledigt е най-полезната дума в немски офис: значи, че нещото е приключено и отпада от списъка ти — затова се среща като състояние: Das ist erledigt.',
    },
  },
  {
    id: 'v-durchfuehren',
    german: 'durchführen',
    display: 'durchführen',
    wordType: 'verb',
    translation: { en: 'to carry out, to conduct', bg: 'да проведа, да осъществя' },
    pronunciation: { en: 'DOORKH-fyoo-ren', bg: 'ДУРХ-фю-рен' },
    example: {
      de: 'Wir führen das Projekt in drei Phasen durch.',
      gloss: {
        en: 'We are carrying the project out in three phases.',
        bg: 'Провеждаме проекта на три етапа.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'durchgeführt' },
    related: ['v-die-durchfuehrung'],
    notes: {
      en: 'Separable, and that is not obvious: durch- is fixed on some verbs and splits on others. Here it splits — wir führen … durch — and the participle puts ge- in the middle: durchgeführt.',
      bg: 'Разделим е, а това не е очевидно: durch- при някои глаголи е неразделим, при други се отделя. Тук се отделя — wir führen … durch — и в причастието ge- застава в средата: durchgeführt.',
    },
  },
  {
    id: 'v-die-verzoegerung',
    german: 'Verzögerung',
    display: 'die Verzögerung',
    article: 'die',
    gender: 'f',
    plural: 'die Verzögerungen',
    wordType: 'noun',
    translation: { en: 'delay (to a process or a project)', bg: 'забавяне (на процес или проект)' },
    pronunciation: { en: 'fair-TSER-guh-rung', bg: 'фер-ЦЬО-ге-рунг' },
    example: {
      de: 'Es kam zu einer Verzögerung bei der Lieferung.',
      gloss: {
        en: 'There was a delay in the delivery.',
        bg: 'Възникна забавяне на доставката.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-die-verspaetung'],
    notes: {
      en: 'Not die Verspätung. A train has a Verspätung; a project, a delivery or a decision has a Verzögerung. English uses "delay" for both, so this pair has to be learnt as a pair.',
      bg: 'Не е die Verspätung. Влакът има Verspätung; проектът, доставката или решението имат Verzögerung. И на български, и на английски думата е една, затова двойката се учи наведнъж.',
    },
  },
  {
    id: 'v-rechtzeitig',
    german: 'rechtzeitig',
    display: 'rechtzeitig',
    wordType: 'adjective',
    translation: { en: 'in good time, on time', bg: 'навреме, своевременно' },
    pronunciation: { en: 'REKHT-tsy-tikh', bg: 'РЕХТ-цай-тих' },
    example: {
      de: 'Der Antrag wurde rechtzeitig eingereicht.',
      gloss: {
        en: 'The application was submitted in good time.',
        bg: 'Заявлението беше подадено навреме.',
      },
    },
    tags: ['work', 'time'],
    level: 'b2',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-puenktlich'],
    notes: {
      en: 'pünktlich is about a clock — arriving at nine. rechtzeitig is about a deadline — early enough for the thing to still work.',
      bg: 'pünktlich е за часа — идваш в девет. rechtzeitig е за срока — достатъчно рано, че нещото още да е възможно.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — saying something in the meeting
 * ------------------------------------------------------------------ */

const MEETING: VocabEntry[] = [
  {
    id: 'v-der-vorschlag',
    german: 'Vorschlag',
    display: 'der Vorschlag',
    article: 'der',
    gender: 'm',
    plural: 'die Vorschläge',
    wordType: 'noun',
    translation: { en: 'suggestion, proposal', bg: 'предложение' },
    pronunciation: { en: 'FOR-shlahk', bg: 'ФОР-шлаг' },
    example: {
      de: 'Ich hätte einen Vorschlag.',
      gloss: {
        en: 'I would have a suggestion.',
        bg: 'Аз бих имал едно предложение.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    related: ['v-vorschlagen'],
    collocations: [
      { de: 'einen Vorschlag machen', gloss: { en: 'to make a suggestion', bg: 'да направя предложение' } },
    ],
  },
  {
    id: 'v-vorschlagen',
    german: 'vorschlagen',
    display: 'vorschlagen',
    wordType: 'verb',
    translation: { en: 'to suggest, to propose', bg: 'да предложа' },
    pronunciation: { en: 'FOR-shlah-gen', bg: 'ФОР-шла-ген' },
    example: {
      de: 'Ich würde vorschlagen, dass wir zuerst die Zahlen prüfen.',
      gloss: {
        en: 'I would suggest that we check the figures first.',
        bg: 'Бих предложил първо да проверим числата.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'vorgeschlagen' },
    related: ['v-der-vorschlag'],
  },
  {
    id: 'v-der-einwand',
    german: 'Einwand',
    display: 'der Einwand',
    article: 'der',
    gender: 'm',
    plural: 'die Einwände',
    wordType: 'noun',
    translation: { en: 'objection', bg: 'възражение' },
    pronunciation: { en: 'INE-vant', bg: 'АЙН-ванд' },
    example: {
      de: 'Gegen diesen Plan habe ich einen Einwand.',
      gloss: {
        en: 'I have an objection to this plan.',
        bg: 'Имам възражение срещу този план.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-ablehnen',
    german: 'ablehnen',
    display: 'ablehnen',
    wordType: 'verb',
    translation: { en: 'to reject, to turn down', bg: 'да отхвърля, да откажа' },
    pronunciation: { en: 'AHP-lay-nen', bg: 'АП-ле-нен' },
    example: {
      de: 'Der Vorschlag wurde abgelehnt.',
      gloss: {
        en: 'The proposal was rejected.',
        bg: 'Предложението беше отхвърлено.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    perfect: { auxiliary: 'haben', participle: 'abgelehnt' },
    related: ['v-zustimmen'],
  },
  {
    id: 'v-die-tagesordnung',
    german: 'Tagesordnung',
    display: 'die Tagesordnung',
    article: 'die',
    gender: 'f',
    plural: 'die Tagesordnungen',
    wordType: 'noun',
    translation: { en: 'agenda', bg: 'дневен ред' },
    pronunciation: { en: 'TAH-guhs-ord-nung', bg: 'ТА-гес-орд-нунг' },
    example: {
      de: 'Der Punkt steht nicht auf der Tagesordnung.',
      gloss: {
        en: 'The item is not on the agenda.',
        bg: 'Точката не е в дневния ред.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-sich-einigen',
    german: 'sich einigen',
    display: 'sich einigen',
    wordType: 'verb',
    translation: { en: 'to come to an agreement', bg: 'да се споразумеем' },
    pronunciation: { en: 'zikh INE-ig-en', bg: 'зих АЙ-ни-ген' },
    example: {
      de: 'Wir haben uns auf einen neuen Termin geeinigt.',
      gloss: {
        en: 'We agreed on a new date.',
        bg: 'Споразумяхме се за нова дата.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'geeinigt' },
    collocations: [
      { de: 'sich auf etwas einigen', gloss: { en: 'to agree on something', bg: 'да се споразумеем за нещо' } },
    ],
    notes: {
      en: 'zustimmen is one person agreeing to something; sich einigen is a group arriving at one answer together.',
      bg: 'zustimmen е един човек, който се съгласява с нещо; sich einigen е група, която стига заедно до един отговор.',
    },
  },
  {
    id: 'v-der-zeitplan',
    german: 'Zeitplan',
    display: 'der Zeitplan',
    article: 'der',
    gender: 'm',
    plural: 'die Zeitpläne',
    wordType: 'noun',
    translation: { en: 'schedule, timeline', bg: 'график' },
    pronunciation: { en: 'TSYTE-plahn', bg: 'ЦАЙТ-план' },
    example: {
      de: 'Der Zeitplan muss angepasst werden.',
      gloss: {
        en: 'The schedule has to be adjusted.',
        bg: 'Графикът трябва да бъде коригиран.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-allerdings',
    german: 'allerdings',
    display: 'allerdings',
    wordType: 'adverb',
    translation: { en: 'however, admittedly', bg: 'обаче, наистина' },
    pronunciation: { en: 'AH-ler-dings', bg: 'А-лер-дингс' },
    example: {
      de: 'Der Plan ist gut. Allerdings ist er teuer.',
      gloss: {
        en: 'The plan is good. However, it is expensive.',
        bg: 'Планът е добър. Обаче е скъп.',
      },
    },
    tags: ['connectors', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'It concedes as it objects — closer to "admittedly, though" than to a flat "but". In first position it is a slot, so the verb comes second: Allerdings ist er teuer.',
      bg: 'Едновременно отстъпва и възразява — по-близо до „наистина, но“, отколкото до просто „но“. На първа позиция заема слот, затова глаголът е втори: Allerdings ist er teuer.',
    },
  },
  {
    id: 'v-dennoch',
    german: 'dennoch',
    display: 'dennoch',
    wordType: 'adverb',
    translation: { en: 'nevertheless, even so', bg: 'въпреки това, все пак' },
    pronunciation: { en: 'DEN-nokh', bg: 'ДЕ-нох' },
    example: {
      de: 'Die Kosten sind hoch. Dennoch halten wir an dem Plan fest.',
      gloss: {
        en: 'The costs are high. Even so, we are sticking to the plan.',
        bg: 'Разходите са високи. Въпреки това се придържаме към плана.',
      },
    },
    tags: ['connectors', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The written cousin of trotzdem, which you learnt at B1. Same job, same word order, more formal room.',
      bg: 'Писменият братовчед на trotzdem от B1. Същата роля, същият словоред, по-официална обстановка.',
    },
  },
  {
    id: 'v-folglich',
    german: 'folglich',
    display: 'folglich',
    wordType: 'adverb',
    translation: { en: 'consequently, therefore', bg: 'следователно' },
    pronunciation: { en: 'FOLK-likh', bg: 'ФОЛК-лих' },
    example: {
      de: 'Die Frist ist abgelaufen. Folglich müssen wir neu beantragen.',
      gloss: {
        en: 'The deadline has passed. Consequently we have to apply again.',
        bg: 'Срокът изтече. Следователно трябва да подадем ново заявление.',
      },
    },
    tags: ['connectors', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'The formal deshalb. It draws a conclusion rather than giving a reason, which is why it belongs in a report and sounds stiff in a kitchen.',
      bg: 'Официалното deshalb. Извежда извод, а не изтъква причина — затова е за доклад и звучи сковано в кухнята.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — the nouns professional German is built from
 * ------------------------------------------------------------------ */

const NOMINALISATIONS: VocabEntry[] = [
  {
    id: 'v-die-durchfuehrung',
    german: 'Durchführung',
    display: 'die Durchführung',
    article: 'die',
    gender: 'f',
    plural: 'die Durchführungen',
    wordType: 'noun',
    translation: { en: 'carrying out, execution', bg: 'провеждане, осъществяване' },
    pronunciation: { en: 'DOORKH-fyoo-rung', bg: 'ДУРХ-фю-рунг' },
    example: {
      de: 'Die Durchführung des Projekts dauert drei Monate.',
      gloss: {
        en: 'Carrying the project out takes three months.',
        bg: 'Провеждането на проекта отнема три месеца.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-durchfuehren'],
  },
  {
    id: 'v-die-umsetzung',
    german: 'Umsetzung',
    display: 'die Umsetzung',
    article: 'die',
    gender: 'f',
    plural: 'die Umsetzungen',
    wordType: 'noun',
    translation: { en: 'implementation', bg: 'реализация, прилагане' },
    pronunciation: { en: 'OOM-zets-ung', bg: 'УМ-зец-унг' },
    example: {
      de: 'Die Umsetzung der Idee war schwieriger als erwartet.',
      gloss: {
        en: 'Implementing the idea was harder than expected.',
        bg: 'Реализацията на идеята беше по-трудна от очакваното.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-die-entscheidung',
    german: 'Entscheidung',
    display: 'die Entscheidung',
    article: 'die',
    gender: 'f',
    plural: 'die Entscheidungen',
    wordType: 'noun',
    translation: { en: 'decision', bg: 'решение' },
    pronunciation: { en: 'ent-SHY-dung', bg: 'ент-ШАЙ-дунг' },
    example: {
      de: 'Die Entscheidung wurde in der Besprechung getroffen.',
      gloss: {
        en: 'The decision was taken in the meeting.',
        bg: 'Решението беше взето на срещата.',
      },
    },
    tags: ['work'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    related: ['v-entscheiden'],
    collocations: [
      { de: 'eine Entscheidung treffen', gloss: { en: 'to take a decision', bg: 'да взема решение' } },
    ],
    notes: {
      en: 'German takes a decision with treffen, not with machen. eine Entscheidung treffen — the verb is part of the noun.',
      bg: 'На немски решението се „среща“ — eine Entscheidung treffen, не machen. Глаголът е част от израза.',
    },
  },
  {
    id: 'v-die-anforderung',
    german: 'Anforderung',
    display: 'die Anforderung',
    article: 'die',
    gender: 'f',
    plural: 'die Anforderungen',
    wordType: 'noun',
    translation: { en: 'requirement', bg: 'изискване' },
    pronunciation: { en: 'AN-for-duh-rung', bg: 'АН-фор-де-рунг' },
    example: {
      de: 'Die Anforderungen des Kunden haben sich geändert.',
      gloss: {
        en: "The client's requirements have changed.",
        bg: 'Изискванията на клиента се промениха.',
      },
    },
    tags: ['work', 'projects'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-die-zusammenarbeit',
    german: 'Zusammenarbeit',
    display: 'die Zusammenarbeit',
    article: 'die',
    gender: 'f',
    wordType: 'noun',
    translation: { en: 'cooperation, working together', bg: 'сътрудничество' },
    pronunciation: { en: 'tsoo-ZAH-men-ar-bite', bg: 'цу-ЗА-мен-ар-байт' },
    example: {
      de: 'Die Zusammenarbeit mit der Abteilung läuft gut.',
      gloss: {
        en: 'The cooperation with the department is going well.',
        bg: 'Сътрудничеството с отдела върви добре.',
      },
    },
    tags: ['work'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'A compound with no plural in normal use, and the standard closing line of a German work email: Vielen Dank für die gute Zusammenarbeit.',
      bg: 'Сложна дума, която на практика няма множествено число, и стандартен завършек на немски служебен имейл: Vielen Dank für die gute Zusammenarbeit.',
    },
  },
  {
    id: 'v-beschliessen',
    german: 'beschließen',
    display: 'beschließen',
    wordType: 'verb',
    translation: { en: 'to resolve, to decide (formally)', bg: 'да реша официално, да постановя' },
    pronunciation: { en: 'buh-SHLEE-sen', bg: 'бе-ШЛИ-сен' },
    example: {
      de: 'Das Team hat beschlossen, den Zeitplan zu ändern.',
      gloss: {
        en: 'The team decided to change the schedule.',
        bg: 'Екипът реши да промени графика.',
      },
    },
    tags: ['work', 'meetings'],
    level: 'b2',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    perfect: { auxiliary: 'haben', participle: 'beschlossen' },
    related: ['v-entscheiden'],
    notes: {
      en: 'entscheiden is a person making up their mind; beschließen is a body resolving something — a team, a committee, a parliament.',
      bg: 'entscheiden е човек, който взема решение; beschließen е орган, който постановява — екип, комисия, парламент.',
    },
  },
];

export const WORK4_VOCAB: VocabEntry[] = [...REPORTING, ...MEETING, ...NOMINALISATIONS];
