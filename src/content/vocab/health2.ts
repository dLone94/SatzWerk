import type { VocabEntry } from '../types.ts';

/**
 * Health and insurance (B1 Unit 3).
 *
 * A2 Unit 4 taught how to say you feel ill: *Ich habe Fieber*, *mein Hals tut
 * weh*, *ich habe mich erkältet*. None of that is repeated here. What is new
 * is the machinery around being ill in Germany — which is where the language
 * stops being about your body and starts being about a system.
 *
 * The distinctive thing about German healthcare, linguistically, is that it
 * runs on referrals and pieces of paper. You do not simply go to a specialist:
 * your *Hausarzt* writes an *Überweisung*. You do not simply stay off work:
 * you bring your employer a *Krankmeldung*. Half of these words exist because
 * that system exists, and a learner who knows them can navigate it.
 *
 * The other half are what a doctor actually says back — *Beschwerden*,
 * *Untersuchung*, *Diagnose*, *behandeln* — because the hard part of a German
 * doctor's appointment is rarely describing the symptom. It is understanding
 * the reply.
 */

const U = 'b1-u3';
const L1 = 'b1-u3-l1';
const L2 = 'b1-u3-l2';
const L3 = 'b1-u3-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the appointment
 * ------------------------------------------------------------------ */

const APPOINTMENT: VocabEntry[] = [
  {
    id: 'v-der-hausarzt',
    german: 'Hausarzt',
    display: 'der Hausarzt',
    article: 'der',
    gender: 'm',
    plural: 'die Hausärzte',
    wordType: 'noun',
    translation: { en: 'family doctor, GP', bg: 'личен лекар' },
    pronunciation: { en: 'HOWS-artst', bg: 'ХАУС-арцт' },
    example: {
      de: 'Ich hätte gern einen Termin beim Hausarzt.',
      gloss: {
        en: 'I would like an appointment with the family doctor.',
        bg: 'Бих искал час при личния лекар.',
      },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-facharzt', 'v-der-arzt'],
    notes: {
      en: 'The door to everything else. In Germany you normally go to your Hausarzt first, and they decide whether you see a specialist — walking straight into a specialist’s practice usually means being sent back.',
      bg: 'Вратата към всичко останало. В Германия обикновено първо отиваш при своя Hausarzt и той решава дали ще видиш специалист — да влезеш директно при специалист обикновено значи да те върнат.',
    },
  },
  {
    id: 'v-der-facharzt',
    german: 'Facharzt',
    display: 'der Facharzt',
    article: 'der',
    gender: 'm',
    plural: 'die Fachärzte',
    wordType: 'noun',
    translation: { en: 'specialist', bg: 'специалист' },
    pronunciation: { en: 'FAKH-artst', bg: 'ФАХ-арцт' },
    example: {
      de: 'Für den Facharzt brauchen Sie eine Überweisung.',
      gloss: {
        en: 'For the specialist you need a referral.',
        bg: 'За специалиста ти трябва направление.',
      },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-der-hausarzt', 'v-die-ueberweisung'],
  },
  {
    id: 'v-die-ueberweisung',
    german: 'Überweisung',
    display: 'die Überweisung',
    article: 'die',
    gender: 'f',
    plural: 'die Überweisungen',
    wordType: 'noun',
    translation: { en: 'referral', bg: 'направление' },
    pronunciation: { en: 'ue-ber-VY-zoong', bg: 'ю-бер-ВАЙ-зунг' },
    example: {
      de: 'Könnten Sie mir eine Überweisung geben?',
      gloss: { en: 'Could you give me a referral?', bg: 'Бихте ли ми дали направление?' },
    },
    tags: ['health', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-der-facharzt'],
    notes: {
      en: 'The same word also means a bank transfer, which is a genuinely useful coincidence to know about: context decides. At the doctor it is a referral; at the bank it is money moving.',
      bg: 'Същата дума значи и банков превод, което наистина е полезно да се знае: контекстът решава. При лекаря е направление; в банката са пари, които се местят.',
    },
  },
  {
    id: 'v-die-krankenkasse',
    german: 'Krankenkasse',
    display: 'die Krankenkasse',
    article: 'die',
    gender: 'f',
    plural: 'die Krankenkassen',
    wordType: 'noun',
    translation: { en: 'health insurance fund', bg: 'здравна каса' },
    pronunciation: { en: 'KRAN-ken-kah-suh', bg: 'КРАН-кен-ка-се' },
    example: {
      de: 'Das zahlt die Krankenkasse nicht.',
      gloss: {
        en: 'The health insurance does not pay for that.',
        bg: 'Това здравната каса не го покрива.',
      },
    },
    tags: ['health', 'insurance'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-versichert'],
    notes: {
      en: 'Health insurance is compulsory in Germany, and it is one of these funds rather than a company you choose freely. "Das zahlt die Kasse nicht" is the sentence that decides whether something costs you money.',
      bg: 'Здравната осигуровка в Германия е задължителна и минава през такава каса, а не през фирма, която избираш свободно. „Das zahlt die Kasse nicht“ е изречението, което решава дали нещо ще ти струва пари.',
    },
  },
  {
    id: 'v-versichert',
    german: 'versichert',
    display: 'versichert',
    wordType: 'adjective',
    translation: { en: 'insured', bg: 'осигурен' },
    pronunciation: { en: 'fer-ZIKH-ert', bg: 'фер-ЗИХ-ерт' },
    example: {
      de: 'Sind Sie gesetzlich oder privat versichert?',
      gloss: {
        en: 'Are you insured publicly or privately?',
        bg: 'Осигурен ли си държавно или частно?',
      },
    },
    tags: ['health', 'insurance'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-die-krankenkasse'],
    notes: {
      en: 'The first question at any German reception desk, and the answer changes everything from waiting times to what you pay. "Gesetzlich" is the public system; "privat" is private.',
      bg: 'Първият въпрос на всяка немска рецепция, а отговорът променя всичко — от времето за чакане до това какво плащаш. „Gesetzlich“ е държавната система; „privat“ е частната.',
    },
  },
  {
    id: 'v-die-beschwerden',
    german: 'Beschwerden',
    display: 'die Beschwerden',
    article: 'die',
    gender: 'f',
    plural: 'die Beschwerden',
    wordType: 'noun',
    translation: { en: 'symptoms, complaints', bg: 'оплаквания' },
    pronunciation: { en: 'buh-SHVAIR-den', bg: 'бе-ШВЕР-ден' },
    example: {
      de: 'Seit wann haben Sie diese Beschwerden?',
      gloss: { en: 'How long have you had these symptoms?', bg: 'Откога имаш тези оплаквания?' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-sich-beschweren'],
    notes: {
      en: 'The medical word, and it is the one the doctor will use. Note it is the same root as sich beschweren (to complain) — but Beschwerden are symptoms, not grievances.',
      bg: 'Медицинската дума и точно тя ще се използва от лекаря. Същият корен като sich beschweren (оплаквам се) — но Beschwerden са симптоми, а не недоволство.',
    },
  },
  {
    id: 'v-die-untersuchung',
    german: 'Untersuchung',
    display: 'die Untersuchung',
    article: 'die',
    gender: 'f',
    plural: 'die Untersuchungen',
    wordType: 'noun',
    translation: { en: 'examination', bg: 'преглед' },
    pronunciation: { en: 'oon-ter-ZOO-khoong', bg: 'ун-тер-ЗУ-хунг' },
    example: {
      de: 'Die Untersuchung dauert etwa zwanzig Minuten.',
      gloss: {
        en: 'The examination takes about twenty minutes.',
        bg: 'Прегледът трае около двайсет минути.',
      },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — advice, and what you would do
 * ------------------------------------------------------------------ */

const ADVICE: VocabEntry[] = [
  {
    id: 'v-die-diagnose',
    german: 'Diagnose',
    display: 'die Diagnose',
    article: 'die',
    gender: 'f',
    plural: 'die Diagnosen',
    wordType: 'noun',
    translation: { en: 'diagnosis', bg: 'диагноза' },
    pronunciation: { en: 'dee-ag-NOH-zuh', bg: 'диаг-НО-зе' },
    example: {
      de: 'Die Diagnose steht noch nicht fest.',
      gloss: { en: 'The diagnosis is not certain yet.', bg: 'Диагнозата още не е сигурна.' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-behandeln',
    german: 'behandeln',
    display: 'behandeln',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'behandelt' },
    translation: { en: 'to treat', bg: 'лекувам' },
    pronunciation: { en: 'buh-HAN-deln', bg: 'бе-ХАН-делн' },
    example: {
      de: 'Das wird mit Tabletten behandelt.',
      gloss: { en: 'That is treated with tablets.', bg: 'Това се лекува с таблетки.' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-die-behandlung'],
  },
  {
    id: 'v-die-behandlung',
    german: 'Behandlung',
    display: 'die Behandlung',
    article: 'die',
    gender: 'f',
    plural: 'die Behandlungen',
    wordType: 'noun',
    translation: { en: 'treatment', bg: 'лечение' },
    pronunciation: { en: 'buh-HAND-loong', bg: 'бе-ХАНД-лунг' },
    example: {
      de: 'Die Behandlung wird von der Kasse bezahlt.',
      gloss: {
        en: 'The treatment is paid for by the insurance.',
        bg: 'Лечението се плаща от касата.',
      },
    },
    tags: ['health', 'insurance'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-behandeln'],
  },
  {
    id: 'v-das-rezept',
    german: 'Rezept',
    display: 'das Rezept',
    article: 'das',
    gender: 'n',
    plural: 'die Rezepte',
    wordType: 'noun',
    translation: { en: 'prescription', bg: 'рецепта' },
    pronunciation: { en: 'ray-TSEPT', bg: 'ре-ЦЕПТ' },
    example: {
      de: 'Ich hätte gern ein Rezept für das Medikament.',
      gloss: {
        en: 'I would like a prescription for the medicine.',
        bg: 'Бих искал рецепта за лекарството.',
      },
    },
    tags: ['health', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: 'Also the word for a cooking recipe, exactly as in Bulgarian and unlike English. Which one is meant is never unclear in context.',
      bg: 'Същата дума и за готварска рецепта, точно както в българския и за разлика от английския. От контекста винаги е ясно коя се има предвид.',
    },
  },
  {
    id: 'v-die-krankmeldung',
    german: 'Krankmeldung',
    display: 'die Krankmeldung',
    article: 'die',
    gender: 'f',
    plural: 'die Krankmeldungen',
    wordType: 'noun',
    translation: { en: 'sick note', bg: 'болничен' },
    pronunciation: { en: 'KRANK-mel-doong', bg: 'КРАНК-мел-дунг' },
    example: {
      de: 'Ich brauche eine Krankmeldung für meinen Arbeitgeber.',
      gloss: {
        en: 'I need a sick note for my employer.',
        bg: 'Трябва ми болничен за работодателя ми.',
      },
    },
    tags: ['health', 'work', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Officially an Arbeitsunfähigkeitsbescheinigung — a real word, abbreviated AU on the form. Most employers want it from the third day of illness; some from the first, and the contract says which.',
      bg: 'Официално Arbeitsunfähigkeitsbescheinigung — истинска дума, съкратена AU във формуляра. Повечето работодатели я искат от третия ден на болестта; някои от първия, а договорът казва кое.',
    },
  },
  {
    id: 'v-sich-ausruhen-b1',
    german: 'sich schonen',
    display: 'sich schonen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'geschont' },
    translation: { en: 'to take it easy, to rest up', bg: 'пазя се, щадя се' },
    pronunciation: { en: 'zikh SHOH-nen', bg: 'зих ШО-нен' },
    example: {
      de: 'An Ihrer Stelle würde ich mich ein paar Tage schonen.',
      gloss: {
        en: 'If I were you I would take it easy for a few days.',
        bg: 'На твое място бих се пазил няколко дни.',
      },
    },
    tags: ['health', 'advice'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    notes: {
      en: 'The doctor’s standard advice, and stronger than sich ausruhen: it means not just resting but avoiding anything that would strain you.',
      bg: 'Стандартният съвет на лекаря и по-силен от sich ausruhen: значи не просто да почиваш, а да избягваш всичко, което би те натоварило.',
    },
  },
  {
    id: 'v-der-notfall',
    german: 'Notfall',
    display: 'der Notfall',
    article: 'der',
    gender: 'm',
    plural: 'die Notfälle',
    wordType: 'noun',
    translation: { en: 'emergency', bg: 'спешен случай' },
    pronunciation: { en: 'NOHT-fal', bg: 'НОТ-фал' },
    example: {
      de: 'Im Notfall rufen Sie bitte die 112.',
      gloss: { en: 'In an emergency please call 112.', bg: 'При спешен случай звъни на 112.' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    notes: {
      en: '112 is the ambulance and fire service everywhere in the EU and needs no area code. 116 117 is the out-of-hours doctor for things that are urgent but not emergencies.',
      bg: '112 е линейка и пожарна навсякъде в ЕС и не иска код за район. 116 117 е дежурният лекар за спешни, но не животозастрашаващи случаи.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — the pharmacy and what is covered
 * ------------------------------------------------------------------ */

const PHARMACY: VocabEntry[] = [
  {
    id: 'v-die-versicherung',
    german: 'Versicherung',
    display: 'die Versicherung',
    article: 'die',
    gender: 'f',
    plural: 'die Versicherungen',
    wordType: 'noun',
    translation: { en: 'insurance', bg: 'застраховка, осигуровка' },
    pronunciation: { en: 'fer-ZIKH-er-oong', bg: 'фер-ЗИХ-ер-унг' },
    example: {
      de: 'Könnten Sie mir sagen, ob die Versicherung das zahlt?',
      gloss: {
        en: 'Could you tell me whether the insurance pays for that?',
        bg: 'Бихте ли ми казали дали осигуровката го покрива?',
      },
    },
    tags: ['health', 'insurance'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-die-krankenkasse', 'v-versichert'],
  },
  {
    id: 'v-die-zuzahlung',
    german: 'Zuzahlung',
    display: 'die Zuzahlung',
    article: 'die',
    gender: 'f',
    plural: 'die Zuzahlungen',
    wordType: 'noun',
    translation: { en: 'co-payment, excess', bg: 'доплащане' },
    pronunciation: { en: 'TSOO-tsah-loong', bg: 'ЦУ-ца-лунг' },
    example: {
      de: 'Die Zuzahlung beträgt fünf Euro.',
      gloss: { en: 'The co-payment is five euros.', bg: 'Доплащането е пет евро.' },
    },
    tags: ['health', 'insurance', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'zu + Zahlung, "payment on top". Prescription medicines usually carry five to ten euros of it even when the insurance covers the rest.',
      bg: 'zu + Zahlung, „плащане отгоре“. Лекарствата по рецепта обикновено носят пет до десет евро доплащане дори когато осигуровката покрива останалото.',
    },
  },
  {
    id: 'v-rezeptfrei',
    german: 'rezeptfrei',
    display: 'rezeptfrei',
    wordType: 'adjective',
    translation: { en: 'available without prescription', bg: 'без рецепта' },
    pronunciation: { en: 'ray-TSEPT-fry', bg: 'ре-ЦЕПТ-фрай' },
    example: {
      de: 'Ist das Medikament rezeptfrei?',
      gloss: { en: 'Is the medicine available without a prescription?', bg: 'Лекарството без рецепта ли е?' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-das-rezept'],
    notes: {
      en: 'The -frei ending means "free of", not "free of charge": rezeptfrei still costs money. Compare zuckerfrei, alkoholfrei, kostenlos — only the last one means free.',
      bg: 'Окончанието -frei значи „без“, а не „безплатно“: rezeptfrei пак струва пари. Сравни zuckerfrei, alkoholfrei и kostenlos — само последното значи безплатно.',
    },
  },
  {
    id: 'v-die-nebenwirkung',
    german: 'Nebenwirkung',
    display: 'die Nebenwirkung',
    article: 'die',
    gender: 'f',
    plural: 'die Nebenwirkungen',
    wordType: 'noun',
    translation: { en: 'side effect', bg: 'странично действие' },
    pronunciation: { en: 'NAY-ben-veer-koong', bg: 'НЕ-бен-вир-кунг' },
    example: {
      de: 'Welche Nebenwirkungen hat das Medikament?',
      gloss: { en: 'What side effects does the medicine have?', bg: 'Какви странични действия има лекарството?' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'neben (beside) + Wirkung (effect). You will hear it in the line every German pharmacy advert ends with: "Zu Risiken und Nebenwirkungen fragen Sie Ihren Arzt oder Apotheker."',
      bg: 'neben (до) + Wirkung (действие). Ще я чуеш в изречението, с което завършва всяка немска реклама на лекарство: „Zu Risiken und Nebenwirkungen fragen Sie Ihren Arzt oder Apotheker.“',
    },
  },
  {
    id: 'v-einnehmen',
    german: 'einnehmen',
    display: 'einnehmen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'eingenommen' },
    translation: { en: 'to take (medicine)', bg: 'приемам (лекарство)' },
    pronunciation: { en: 'EYN-nay-men', bg: 'АЙН-не-мен' },
    example: {
      de: 'Die Tabletten sollten Sie dreimal täglich einnehmen.',
      gloss: {
        en: 'You should take the tablets three times a day.',
        bg: 'Таблетките трябва да се приемат три пъти дневно.',
      },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Medicine is einnehmen, not nehmen — the plain verb is for taking a bus or a seat. On a packet you will see "Einnahme" for the dose instructions.',
      bg: 'Лекарство се einnehmen, не nehmen — простият глагол е за автобус или място. На опаковката ще видиш „Einnahme“ за указанията за дозата.',
    },
  },
  {
    id: 'v-die-impfung',
    german: 'Impfung',
    display: 'die Impfung',
    article: 'die',
    gender: 'f',
    plural: 'die Impfungen',
    wordType: 'noun',
    translation: { en: 'vaccination', bg: 'ваксина' },
    pronunciation: { en: 'IMP-foong', bg: 'ИМП-фунг' },
    example: {
      de: 'Ich wollte fragen, wann die nächste Impfung fällig ist.',
      gloss: {
        en: 'I wanted to ask when the next vaccination is due.',
        bg: 'Исках да попитам кога е следващата ваксина.',
      },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
  },
  {
    id: 'v-der-apotheker',
    german: 'Apotheker',
    display: 'der Apotheker',
    article: 'der',
    gender: 'm',
    plural: 'die Apotheker',
    wordType: 'noun',
    translation: { en: 'pharmacist', bg: 'фармацевт' },
    pronunciation: { en: 'ah-poh-TAY-ker', bg: 'апо-ТЕ-кер' },
    example: {
      de: 'Fragen Sie am besten den Apotheker.',
      gloss: { en: 'It is best to ask the pharmacist.', bg: 'Най-добре питай фармацевта.' },
    },
    tags: ['health'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'German pharmacists give real advice, and a Notdienst pharmacy is open through the night in every district — the rota is posted on the door of the closed ones.',
      bg: 'Немските фармацевти дават истински съвети, а аптека с Notdienst работи през нощта във всеки район — графикът е закачен на вратата на затворените.',
    },
  },
];

export const HEALTH2_VOCAB: VocabEntry[] = [...APPOINTMENT, ...ADVICE, ...PHARMACY];
