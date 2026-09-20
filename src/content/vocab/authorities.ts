import type { VocabEntry } from '../types.ts';

/**
 * Authorities and paperwork (B1 Unit 2).
 *
 * The vocabulary of the German state, which is its own dialect. Official
 * German is written in a register almost nobody speaks — long compounds, the
 * passive everywhere, and nouns built out of verbs — and a letter from the
 * Bürgeramt is often the first German text a newcomer genuinely has to
 * understand rather than merely follow.
 *
 * So the words here are chosen to be recognisable on paper first and sayable
 * second. *Meldebescheinigung*, *Aufenthaltserlaubnis* and *Unterlagen* are
 * almost never said aloud in conversation, but they are printed on the
 * documents that decide whether you have a bank account, a phone contract and
 * a job — and a learner who can read them is a learner who can act.
 *
 * Several are compounds on purpose. By B1 the useful skill is not knowing
 * every long noun but taking one apart: Melde + Bescheinigung, Aufenthalt +
 * Erlaubnis, Bürger + Amt. The notes below do that out loud, and the gender
 * always comes from the last part.
 */

const U = 'b1-u2';
const L1 = 'b1-u2-l1';
const L2 = 'b1-u2-l2';
const L3 = 'b1-u2-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the Anmeldung
 * ------------------------------------------------------------------ */

const REGISTERING: VocabEntry[] = [
  {
    id: 'v-das-amt',
    german: 'Amt',
    display: 'das Amt',
    article: 'das',
    gender: 'n',
    plural: 'die Ämter',
    wordType: 'noun',
    translation: { en: 'public office, authority', bg: 'служба, ведомство' },
    pronunciation: { en: 'amt', bg: 'амт' },
    example: {
      de: 'Das Amt ist nur bis zwölf Uhr geöffnet.',
      gloss: { en: 'The office is only open until twelve.', bg: 'Службата е отворена само до дванайсет.' },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-das-buergeramt', 'v-die-behoerde'],
    notes: {
      en: 'The building block of dozens of others: Bürgeramt, Finanzamt, Jugendamt, Ausländeramt. Find the -amt and you know it is a government office; the word in front tells you which one.',
      bg: 'Градивният елемент на десетки други: Bürgeramt, Finanzamt, Jugendamt, Ausländeramt. Намериш ли -amt, знаеш, че е държавна служба; думата отпред казва коя.',
    },
  },
  {
    id: 'v-das-buergeramt',
    german: 'Bürgeramt',
    display: 'das Bürgeramt',
    article: 'das',
    gender: 'n',
    plural: 'die Bürgerämter',
    wordType: 'noun',
    translation: { en: 'citizens’ registration office', bg: 'гражданска служба' },
    pronunciation: { en: 'BUER-ger-amt', bg: 'БЮР-гер-амт' },
    example: {
      de: 'Die Anmeldung wird beim Bürgeramt gemacht.',
      gloss: {
        en: 'The registration is done at the citizens’ office.',
        bg: 'Регистрацията се прави в гражданската служба.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-das-amt'],
    notes: {
      en: 'Bürger + Amt, "citizen office". Called Bürgeramt, Bürgerbüro, Einwohnermeldeamt or KVR depending on the city — all the same thing, and all of them need an appointment booked weeks ahead.',
      bg: 'Bürger + Amt, „служба за гражданите“. Нарича се Bürgeramt, Bürgerbüro, Einwohnermeldeamt или KVR според града — все едно и също, и навсякъде трябва час, запазен седмици предварително.',
    },
  },
  {
    id: 'v-die-anmeldung',
    german: 'Anmeldung',
    display: 'die Anmeldung',
    article: 'die',
    gender: 'f',
    plural: 'die Anmeldungen',
    wordType: 'noun',
    translation: { en: 'registration (of address)', bg: 'адресна регистрация' },
    pronunciation: { en: 'AN-mel-doong', bg: 'АН-мел-дунг' },
    example: {
      de: 'Ohne Anmeldung bekommt man kein Konto.',
      gloss: {
        en: 'Without registration you cannot get a bank account.',
        bg: 'Без адресна регистрация не можеш да откриеш сметка.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-sich-anmelden'],
    notes: {
      en: 'The single most important piece of paper in German life. It is legally required within two weeks of moving in, and almost everything else — bank account, tax number, health insurance, phone contract — asks for it first.',
      bg: 'Най-важният лист хартия в немския живот. Задължителна е по закон до две седмици след нанасянето и почти всичко останало — банкова сметка, данъчен номер, здравна осигуровка, телефонен договор — я иска първо.',
    },
  },
  {
    id: 'v-sich-anmelden',
    german: 'sich anmelden',
    display: 'sich anmelden',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'angemeldet' },
    translation: { en: 'to register (oneself)', bg: 'регистрирам се' },
    pronunciation: { en: 'zikh AN-mel-den', bg: 'зих АН-мел-ден' },
    example: {
      de: 'Ich muss mich innerhalb von zwei Wochen anmelden.',
      gloss: {
        en: 'I have to register within two weeks.',
        bg: 'Трябва да се регистрирам до две седмици.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-die-anmeldung'],
  },
  {
    id: 'v-das-formular',
    german: 'Formular',
    display: 'das Formular',
    article: 'das',
    gender: 'n',
    plural: 'die Formulare',
    wordType: 'noun',
    translation: { en: 'form', bg: 'формуляр' },
    pronunciation: { en: 'for-moo-LAHR', bg: 'фор-му-ЛАР' },
    example: {
      de: 'Das Formular wird am Schalter ausgefüllt.',
      gloss: { en: 'The form is filled in at the counter.', bg: 'Формулярът се попълва на гишето.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-ausfuellen'],
  },
  {
    id: 'v-ausfuellen',
    german: 'ausfüllen',
    display: 'ausfüllen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'ausgefüllt' },
    translation: { en: 'to fill in', bg: 'попълвам' },
    pronunciation: { en: 'OWS-fue-len', bg: 'АУС-фю-лен' },
    example: {
      de: 'Bitte füllen Sie das Formular vollständig aus.',
      gloss: { en: 'Please fill in the form completely.', bg: 'Моля, попълнете формуляра изцяло.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-das-formular'],
    notes: {
      en: 'Separable: the aus- goes to the end — "Ich fülle das Formular aus" — and into the middle of the participle: ausgefüllt.',
      bg: 'Отделяем: aus- отива в края — „Ich fülle das Formular aus“ — и в средата на причастието: ausgefüllt.',
    },
  },
  {
    id: 'v-die-unterlagen',
    german: 'Unterlagen',
    display: 'die Unterlagen',
    article: 'die',
    gender: 'f',
    plural: 'die Unterlagen',
    wordType: 'noun',
    translation: { en: 'documents, paperwork', bg: 'документи' },
    pronunciation: { en: 'OON-ter-lah-gen', bg: 'УН-тер-ла-ген' },
    example: {
      de: 'Bringen Sie bitte alle Unterlagen mit.',
      gloss: { en: 'Please bring all the documents with you.', bg: 'Моля, донесете всички документи.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Plural only, like Nebenkosten. It is the word every official letter uses for "the things you must bring", and it is worth recognising on sight.',
      bg: 'Само в множествено число, като Nebenkosten. Това е думата, която всяко официално писмо използва за „нещата, които трябва да донесете“, и си струва да се разпознава веднага.',
    },
  },
  {
    id: 'v-der-ausweis',
    german: 'Ausweis',
    display: 'der Ausweis',
    article: 'der',
    gender: 'm',
    plural: 'die Ausweise',
    wordType: 'noun',
    translation: { en: 'identity card', bg: 'лична карта' },
    pronunciation: { en: 'OWS-vice', bg: 'АУС-вайс' },
    example: {
      de: 'Ihr Ausweis wird am Schalter kontrolliert.',
      gloss: { en: 'Your ID is checked at the counter.', bg: 'Личната ти карта се проверява на гишето.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-reisepass'],
  },
  {
    id: 'v-der-reisepass',
    german: 'Reisepass',
    display: 'der Reisepass',
    article: 'der',
    gender: 'm',
    plural: 'die Reisepässe',
    wordType: 'noun',
    translation: { en: 'passport', bg: 'паспорт' },
    pronunciation: { en: 'RY-zuh-pass', bg: 'РАЙ-зе-пас' },
    example: {
      de: 'Der Reisepass muss noch gültig sein.',
      gloss: { en: 'The passport still has to be valid.', bg: 'Паспортът трябва още да е валиден.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-ausweis', 'v-gueltig'],
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — saying what has to be done
 * ------------------------------------------------------------------ */

const APPLYING: VocabEntry[] = [
  {
    id: 'v-beantragen',
    german: 'beantragen',
    display: 'beantragen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'beantragt' },
    translation: { en: 'to apply for', bg: 'кандидатствам за, подавам заявление за' },
    pronunciation: { en: 'buh-AN-trah-gen', bg: 'бе-АН-тра-ген' },
    example: {
      de: 'Ich möchte eine Aufenthaltserlaubnis beantragen.',
      gloss: {
        en: 'I would like to apply for a residence permit.',
        bg: 'Бих искал да подам заявление за разрешение за пребиваване.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-der-antrag'],
    notes: {
      en: 'Takes a direct object with no preposition: etwas beantragen. English needs "apply *for*"; German does not, and *beantragen für* is the mistake that follows from it.',
      bg: 'Взима пряко допълнение без предлог: etwas beantragen. Българското „подавам заявление **за**“ има предлог, немското няма — *beantragen für* е грешката, която следва от това.',
    },
  },
  {
    id: 'v-der-antrag',
    german: 'Antrag',
    display: 'der Antrag',
    article: 'der',
    gender: 'm',
    plural: 'die Anträge',
    wordType: 'noun',
    translation: { en: 'application', bg: 'заявление' },
    pronunciation: { en: 'AN-trahk', bg: 'АН-траг' },
    example: {
      de: 'Der Antrag muss bis Freitag eingereicht werden.',
      gloss: {
        en: 'The application has to be submitted by Friday.',
        bg: 'Заявлението трябва да бъде подадено до петък.',
      },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-beantragen', 'v-einreichen'],
    collocations: [
      { de: 'einen Antrag stellen', gloss: { en: 'to submit an application', bg: 'да подам заявление' } },
    ],
  },
  {
    id: 'v-einreichen',
    german: 'einreichen',
    display: 'einreichen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'eingereicht' },
    translation: { en: 'to submit, to hand in', bg: 'подавам, внасям' },
    pronunciation: { en: 'EYN-ry-khen', bg: 'АЙН-рай-хен' },
    example: {
      de: 'Die Unterlagen müssen bis Montag eingereicht werden.',
      gloss: {
        en: 'The documents have to be submitted by Monday.',
        bg: 'Документите трябва да бъдат подадени до понеделник.',
      },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
  },
  {
    id: 'v-die-frist',
    german: 'Frist',
    display: 'die Frist',
    article: 'die',
    gender: 'f',
    plural: 'die Fristen',
    wordType: 'noun',
    translation: { en: 'deadline', bg: 'срок' },
    pronunciation: { en: 'frist', bg: 'фрист' },
    example: {
      de: 'Die Frist läuft am 31. März ab.',
      gloss: { en: 'The deadline expires on 31 March.', bg: 'Срокът изтича на 31 март.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'German deadlines are not soft. A missed Frist usually means starting the whole application again, and "Die Frist ist abgelaufen" is a sentence with real consequences behind it.',
      bg: 'Немските срокове не са пожелателни. Пропуснат Frist обикновено означава цялата процедура отначало, а „Die Frist ist abgelaufen“ е изречение с реални последици.',
    },
  },
  {
    id: 'v-die-bescheinigung',
    german: 'Bescheinigung',
    display: 'die Bescheinigung',
    article: 'die',
    gender: 'f',
    plural: 'die Bescheinigungen',
    wordType: 'noun',
    translation: { en: 'certificate, confirmation', bg: 'удостоверение' },
    pronunciation: { en: 'buh-SHY-ni-goong', bg: 'бе-ШАЙ-ни-гунг' },
    example: {
      de: 'Die Bescheinigung wird Ihnen per Post geschickt.',
      gloss: {
        en: 'The certificate will be sent to you by post.',
        bg: 'Удостоверението ще ти бъде изпратено по пощата.',
      },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Another building block: Meldebescheinigung (proof of address), Arbeitsbescheinigung, Verdienstbescheinigung. Whatever comes before it, it is a piece of paper confirming something is true.',
      bg: 'Още един градивен елемент: Meldebescheinigung (удостоверение за адрес), Arbeitsbescheinigung, Verdienstbescheinigung. Каквото и да стои отпред, това е лист, който удостоверява, че нещо е вярно.',
    },
  },
  {
    id: 'v-die-aufenthaltserlaubnis',
    german: 'Aufenthaltserlaubnis',
    display: 'die Aufenthaltserlaubnis',
    article: 'die',
    gender: 'f',
    plural: 'die Aufenthaltserlaubnisse',
    wordType: 'noun',
    translation: { en: 'residence permit', bg: 'разрешение за пребиваване' },
    pronunciation: { en: 'OWF-ent-halts-er-lowp-nis', bg: 'АУФ-ент-халтс-ер-лаубнис' },
    example: {
      de: 'Die Aufenthaltserlaubnis wird für zwei Jahre erteilt.',
      gloss: {
        en: 'The residence permit is granted for two years.',
        bg: 'Разрешението за пребиваване се издава за две години.',
      },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'Aufenthalt (stay) + s + Erlaubnis (permission). The -s- in the middle is glue, not a plural. Long, but take it apart once and it stops being frightening — and this is the skill that unlocks official German generally.',
      bg: 'Aufenthalt (престой) + s + Erlaubnis (разрешение). Средното -s- е спойка, не множествено число. Дълга е, но щом я разглобиш веднъж, престава да плаши — а точно това умение отключва официалния немски изобщо.',
    },
  },
  {
    id: 'v-gueltig',
    german: 'gültig',
    display: 'gültig',
    wordType: 'adjective',
    translation: { en: 'valid', bg: 'валиден' },
    pronunciation: { en: 'GUEL-tikh', bg: 'ГЮЛ-тих' },
    example: {
      de: 'Der Ausweis ist noch zwei Jahre gültig.',
      gloss: { en: 'The ID is valid for another two years.', bg: 'Личната карта е валидна още две години.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — at the counter, and the letter that follows
 * ------------------------------------------------------------------ */

const AT_THE_OFFICE: VocabEntry[] = [
  {
    id: 'v-die-behoerde',
    german: 'Behörde',
    display: 'die Behörde',
    article: 'die',
    gender: 'f',
    plural: 'die Behörden',
    wordType: 'noun',
    translation: { en: 'authority, government body', bg: 'ведомство, институция' },
    pronunciation: { en: 'buh-HER-duh', bg: 'бе-ХЬОР-де' },
    example: {
      de: 'Der Antrag wurde an die zuständige Behörde weitergeleitet.',
      gloss: {
        en: 'The application was forwarded to the responsible authority.',
        bg: 'Заявлението беше препратено на компетентното ведомство.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    related: ['v-das-amt'],
  },
  {
    id: 'v-der-schalter',
    german: 'Schalter',
    display: 'der Schalter',
    article: 'der',
    gender: 'm',
    plural: 'die Schalter',
    wordType: 'noun',
    translation: { en: 'counter, service window', bg: 'гише' },
    pronunciation: { en: 'SHAL-ter', bg: 'ШАЛ-тер' },
    example: {
      de: 'Gehen Sie bitte zu Schalter drei.',
      gloss: { en: 'Please go to counter three.', bg: 'Моля, елате на гише три.' },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-zustaendig',
    german: 'zuständig',
    display: 'zuständig',
    wordType: 'adjective',
    translation: { en: 'responsible, in charge', bg: 'компетентен, отговорен' },
    pronunciation: { en: 'TSOO-shten-dikh', bg: 'ЦУ-щен-дих' },
    example: {
      de: 'Dafür bin ich leider nicht zuständig.',
      gloss: {
        en: 'I am unfortunately not responsible for that.',
        bg: 'За това за съжаление не съм компетентен.',
      },
    },
    tags: ['authorities'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'The sentence you will hear most often at a German counter, and it does not mean the person is unhelpful — it means there is another desk. The useful follow-up is "Wer ist dafür zuständig?"',
      bg: 'Изречението, което ще чуеш най-често на немско гише, и то не значи, че човекът не иска да помогне — значи, че има друго бюро. Полезното продължение е „Wer ist dafür zuständig?“',
    },
  },
  {
    id: 'v-der-stempel',
    german: 'Stempel',
    display: 'der Stempel',
    article: 'der',
    gender: 'm',
    plural: 'die Stempel',
    wordType: 'noun',
    translation: { en: 'stamp', bg: 'печат' },
    pronunciation: { en: 'SHTEM-pel', bg: 'ЩЕМ-пел' },
    example: {
      de: 'Ohne Stempel ist das Dokument nicht gültig.',
      gloss: { en: 'Without a stamp the document is not valid.', bg: 'Без печат документът не е валиден.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
  },
  {
    id: 'v-abgeben',
    german: 'abgeben',
    display: 'abgeben',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'abgegeben' },
    translation: { en: 'to hand in, to drop off', bg: 'предавам' },
    pronunciation: { en: 'AP-gay-ben', bg: 'АП-ге-бен' },
    example: {
      de: 'Sie können das Formular auch später abgeben.',
      gloss: { en: 'You can also hand the form in later.', bg: 'Можеш да предадеш формуляра и по-късно.' },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-einreichen'],
    notes: {
      en: 'The everyday word where einreichen is the official one. You hand a form in at a counter (abgeben); an application is submitted (eingereicht) in a letter.',
      bg: 'Всекидневната дума там, където einreichen е официалната. Формуляр се предава на гише (abgeben); заявление се внася (eingereicht) с писмо.',
    },
  },
  {
    id: 'v-die-gebuehr',
    german: 'Gebühr',
    display: 'die Gebühr',
    article: 'die',
    gender: 'f',
    plural: 'die Gebühren',
    wordType: 'noun',
    translation: { en: 'fee', bg: 'такса' },
    pronunciation: { en: 'guh-BUER', bg: 'ге-БЮР' },
    example: {
      de: 'Die Gebühr beträgt fünfzehn Euro.',
      gloss: { en: 'The fee is fifteen euros.', bg: 'Таксата е петнайсет евро.' },
    },
    tags: ['authorities', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'German offices often take cash only, and sometimes only EC-Karte — not credit cards. "Nur Barzahlung" on the letter means bring notes.',
      bg: 'Немските служби често приемат само в брой, а понякога само EC-Karte — не кредитни карти. „Nur Barzahlung“ в писмото значи да носиш банкноти.',
    },
  },
  {
    id: 'v-der-nachweis',
    german: 'Nachweis',
    display: 'der Nachweis',
    article: 'der',
    gender: 'm',
    plural: 'die Nachweise',
    wordType: 'noun',
    translation: { en: 'proof, evidence', bg: 'доказателство, документ за' },
    pronunciation: { en: 'NAHKH-vice', bg: 'НАХ-вайс' },
    example: {
      de: 'Ein Nachweis über das Einkommen wird verlangt.',
      gloss: {
        en: 'Proof of income is required.',
        bg: 'Изисква се документ за доходите.',
      },
    },
    tags: ['authorities', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'Pairs with über: ein Nachweis über das Einkommen. Another compound builder — Einkommensnachweis, Versicherungsnachweis, Wohnungsgeberbestätigung is its cousin.',
      bg: 'Върви с über: ein Nachweis über das Einkommen. Още един градивен елемент — Einkommensnachweis, Versicherungsnachweis, а Wohnungsgeberbestätigung му е братовчед.',
    },
  },
];

export const AUTHORITIES_VOCAB: VocabEntry[] = [...REGISTERING, ...APPLYING, ...AT_THE_OFFICE];
