import type { VocabEntry } from '../types.ts';

/**
 * Work and applications (B1 Unit 4).
 *
 * A2 taught the words for having a job: *arbeiten*, *die Firma*, *der Chef*,
 * *verdienen*. This unit is about getting one, and then about the contract you
 * sign — which in Germany is a document with a vocabulary of its own.
 *
 * Two things shape the choices here.
 *
 * First, the German application is a fixed genre. A *Bewerbung* is a
 * *Lebenslauf* plus an *Anschreiben* plus certificates, laid out the way
 * everyone lays them out, and a learner who knows those three words knows what
 * is being asked for. The adjectives — *zuverlässig*, *belastbar*,
 * *teamfähig* — are the ones that actually appear in German job adverts and in
 * the letters written back at them; they are worth knowing because they are
 * formulaic, not despite it.
 *
 * Second, German employment has terms that decide real things and have no
 * one-word English or Bulgarian equivalent: *Probezeit*, *befristet* against
 * *unbefristet*, *die Kündigungsfrist*. Whether a contract says *befristet*
 * changes whether a landlord will rent to you. These are worth more than any
 * amount of office small talk.
 */

const U = 'b1-u4';
const L1 = 'b1-u4-l1';
const L2 = 'b1-u4-l2';
const L3 = 'b1-u4-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the advert and the application
 * ------------------------------------------------------------------ */

const APPLYING: VocabEntry[] = [
  {
    id: 'v-die-stellenanzeige',
    german: 'Stellenanzeige',
    display: 'die Stellenanzeige',
    article: 'die',
    gender: 'f',
    plural: 'die Stellenanzeigen',
    wordType: 'noun',
    translation: { en: 'job advertisement', bg: 'обява за работа' },
    pronunciation: { en: 'SHTEL-en-an-tsy-guh', bg: 'ЩЕЛ-ен-ан-цай-ге' },
    example: {
      de: 'Ich habe Ihre Stellenanzeige im Internet gelesen.',
      gloss: {
        en: 'I read your job advertisement on the internet.',
        bg: 'Прочетох обявата ви за работа в интернет.',
      },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-die-stelle', 'v-die-anzeige'],
    notes: {
      en: 'Stelle + Anzeige, and it is the standard first line of a German cover letter: say where you saw the advert before you say anything about yourself.',
      bg: 'Stelle + Anzeige, и това е стандартният първи ред на немското мотивационно писмо: кажи къде си видял обявата, преди да кажеш каквото и да е за себе си.',
    },
  },
  {
    id: 'v-der-lebenslauf',
    german: 'Lebenslauf',
    display: 'der Lebenslauf',
    article: 'der',
    gender: 'm',
    plural: 'die Lebensläufe',
    wordType: 'noun',
    translation: { en: 'CV, résumé', bg: 'автобиография, CV' },
    pronunciation: { en: 'LAY-bens-lowf', bg: 'ЛЕ-бенс-лауф' },
    example: {
      de: 'Der Lebenslauf des Bewerbers ist vollständig.',
      gloss: {
        en: 'The applicant’s CV is complete.',
        bg: 'Автобиографията на кандидата е пълна.',
      },
    },
    tags: ['work', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Leben + Lauf, "the course of a life". German CVs are tabular, in reverse order, and traditionally carry a photo — though asking for one is no longer legal, so it is now optional.',
      bg: 'Leben + Lauf, „ходът на един живот“. Немските CV-та са таблични, в обратен ред и по традиция със снимка — макар че вече е незаконно да се изисква, затова е по избор.',
    },
  },
  {
    id: 'v-das-anschreiben',
    german: 'Anschreiben',
    display: 'das Anschreiben',
    article: 'das',
    gender: 'n',
    plural: 'die Anschreiben',
    wordType: 'noun',
    translation: { en: 'cover letter', bg: 'мотивационно писмо' },
    pronunciation: { en: 'AN-shry-ben', bg: 'АН-шрай-бен' },
    example: {
      de: 'Das Anschreiben sollte nicht länger als eine Seite sein.',
      gloss: {
        en: 'The cover letter should not be longer than one page.',
        bg: 'Мотивационното писмо не бива да е по-дълго от една страница.',
      },
    },
    tags: ['work', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'A verb turned into a noun, which is why it is neuter and has no plural ending — das Anschreiben, die Anschreiben. German does this constantly: das Essen, das Leben, das Schreiben.',
      bg: 'Глагол, превърнат в съществително — затова е среден род и няма окончание за множествено число: das Anschreiben, die Anschreiben. Немският прави това постоянно: das Essen, das Leben, das Schreiben.',
    },
  },
  {
    id: 'v-sich-bewerben',
    german: 'sich bewerben',
    display: 'sich bewerben',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'beworben' },
    translation: { en: 'to apply (for a job)', bg: 'кандидатствам' },
    pronunciation: { en: 'zikh buh-VAIR-ben', bg: 'зих бе-ВЕР-бен' },
    example: {
      de: 'Ich möchte mich um die Stelle bewerben.',
      gloss: { en: 'I would like to apply for the position.', bg: 'Бих искал да кандидатствам за позицията.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 4,
    related: ['v-die-bewerbung'],
    notes: {
      en: 'The preposition is **um**, not für — sich um eine Stelle bewerben. Both English "apply for" and Bulgarian „кандидатствам за“ point at für, and both are wrong here.',
      bg: 'Предлогът е **um**, а не für — sich um eine Stelle bewerben. И английското „apply for“, и българското „кандидатствам за“ сочат към für и двете грешат тук.',
    },
  },
  {
    id: 'v-die-kenntnisse',
    german: 'Kenntnisse',
    display: 'die Kenntnisse',
    article: 'die',
    gender: 'f',
    plural: 'die Kenntnisse',
    wordType: 'noun',
    translation: { en: 'skills, knowledge', bg: 'знания, умения' },
    pronunciation: { en: 'KENT-nis-suh', bg: 'КЕНТ-ни-се' },
    example: {
      de: 'Gute Deutschkenntnisse sind erforderlich.',
      gloss: { en: 'Good German skills are required.', bg: 'Изискват се добри познания по немски.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-kennen'],
    notes: {
      en: 'Almost always plural, and almost always in a compound: Deutschkenntnisse, Englischkenntnisse, EDV-Kenntnisse. "Deutschkenntnisse: B1" is a line you will write about yourself.',
      bg: 'Почти винаги в множествено число и почти винаги в сложна дума: Deutschkenntnisse, Englischkenntnisse, EDV-Kenntnisse. „Deutschkenntnisse: B1“ е ред, който ще напишеш за себе си.',
    },
  },
  {
    id: 'v-der-arbeitgeber',
    german: 'Arbeitgeber',
    display: 'der Arbeitgeber',
    article: 'der',
    gender: 'm',
    plural: 'die Arbeitgeber',
    wordType: 'noun',
    translation: { en: 'employer', bg: 'работодател' },
    pronunciation: { en: 'AR-bite-gay-ber', bg: 'АР-байт-ге-бер' },
    example: {
      de: 'Mein früherer Arbeitgeber hat mir ein Zeugnis geschrieben.',
      gloss: {
        en: 'My former employer wrote me a reference.',
        bg: 'Бившият ми работодател ми написа препоръка.',
      },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-arbeitnehmer'],
    notes: {
      en: 'Arbeit + Geber, "work giver" — and the employee is the Arbeitnehmer, the "work taker". Once you see the pair, both are unforgettable.',
      bg: 'Arbeit + Geber, „даващ работа“ — а служителят е Arbeitnehmer, „вземащ работа“. Щом видиш двойката, и двете се помнят завинаги.',
    },
  },
  {
    id: 'v-der-arbeitnehmer',
    german: 'Arbeitnehmer',
    display: 'der Arbeitnehmer',
    article: 'der',
    gender: 'm',
    plural: 'die Arbeitnehmer',
    wordType: 'noun',
    translation: { en: 'employee', bg: 'служител, работник' },
    pronunciation: { en: 'AR-bite-nay-mer', bg: 'АР-байт-не-мер' },
    example: {
      de: 'Die Rechte des Arbeitnehmers sind gesetzlich geschützt.',
      gloss: {
        en: 'The employee’s rights are protected by law.',
        bg: 'Правата на служителя са защитени от закона.',
      },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-der-arbeitgeber'],
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — the contract, and saying although
 * ------------------------------------------------------------------ */

const CONTRACT: VocabEntry[] = [
  {
    id: 'v-der-arbeitsvertrag',
    german: 'Arbeitsvertrag',
    display: 'der Arbeitsvertrag',
    article: 'der',
    gender: 'm',
    plural: 'die Arbeitsverträge',
    wordType: 'noun',
    translation: { en: 'employment contract', bg: 'трудов договор' },
    pronunciation: { en: 'AR-bites-fer-trahk', bg: 'АР-байтс-фер-траг' },
    example: {
      de: 'Im Arbeitsvertrag steht eine Probezeit von sechs Monaten.',
      gloss: {
        en: 'The employment contract states a probation period of six months.',
        bg: 'В трудовия договор пише изпитателен срок от шест месеца.',
      },
    },
    tags: ['work', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-der-mietvertrag'],
  },
  {
    id: 'v-die-probezeit',
    german: 'Probezeit',
    display: 'die Probezeit',
    article: 'die',
    gender: 'f',
    plural: 'die Probezeiten',
    wordType: 'noun',
    translation: { en: 'probation period', bg: 'изпитателен срок' },
    pronunciation: { en: 'PROH-buh-tsite', bg: 'ПРО-бе-цайт' },
    example: {
      de: 'Während der Probezeit beträgt die Kündigungsfrist zwei Wochen.',
      gloss: {
        en: 'During probation the notice period is two weeks.',
        bg: 'По време на изпитателния срок предизвестието е две седмици.',
      },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Usually six months, and during it either side can end the contract with two weeks’ notice. After it, German dismissal protection is genuinely strong — which is why the date matters.',
      bg: 'Обикновено шест месеца и през тях всяка страна може да прекрати договора с две седмици предизвестие. След него немската защита срещу уволнение е наистина силна — затова датата има значение.',
    },
  },
  {
    id: 'v-befristet',
    german: 'befristet',
    display: 'befristet',
    wordType: 'adjective',
    translation: { en: 'fixed-term, temporary', bg: 'срочен' },
    pronunciation: { en: 'buh-FRIS-tet', bg: 'бе-ФРИС-тет' },
    example: {
      de: 'Der Vertrag ist auf zwei Jahre befristet.',
      gloss: { en: 'The contract is limited to two years.', bg: 'Договорът е срочен, за две години.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    related: ['v-die-frist'],
    notes: {
      en: 'From Frist, a deadline. Its opposite, unbefristet, is the word people actually want to see — a permanent contract makes renting a flat and getting a loan dramatically easier.',
      bg: 'От Frist, срок. Обратното, unbefristet, е думата, която хората наистина искат да видят — безсрочният договор прави наемането на жилище и вземането на кредит драстично по-лесни.',
    },
  },
  {
    id: 'v-das-gehalt',
    german: 'Gehalt',
    display: 'das Gehalt',
    article: 'das',
    gender: 'n',
    plural: 'die Gehälter',
    wordType: 'noun',
    translation: { en: 'salary', bg: 'заплата' },
    pronunciation: { en: 'guh-HALT', bg: 'ге-ХАЛТ' },
    example: {
      de: 'Das Gehalt wird monatlich überwiesen.',
      gloss: { en: 'The salary is transferred monthly.', bg: 'Заплатата се превежда месечно.' },
    },
    tags: ['work', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'German job talk distinguishes brutto (before tax) from netto (after). An advert quotes brutto, and the gap is large — roughly a third goes to tax and social contributions.',
      bg: 'Немският разговор за работа различава brutto (преди данъци) от netto (след). Обявата посочва brutto, а разликата е голяма — около една трета отива за данъци и осигуровки.',
    },
  },
  {
    id: 'v-die-kuendigungsfrist',
    german: 'Kündigungsfrist',
    display: 'die Kündigungsfrist',
    article: 'die',
    gender: 'f',
    plural: 'die Kündigungsfristen',
    wordType: 'noun',
    translation: { en: 'notice period', bg: 'срок на предизвестие' },
    pronunciation: { en: 'KUEN-di-goongs-frist', bg: 'КЮН-ди-гунгс-фрист' },
    example: {
      de: 'Die Kündigungsfrist beträgt drei Monate zum Quartalsende.',
      gloss: {
        en: 'The notice period is three months to the end of the quarter.',
        bg: 'Срокът на предизвестие е три месеца към края на тримесечието.',
      },
    },
    tags: ['work', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 4,
    related: ['v-kuendigen', 'v-die-frist'],
  },
  {
    id: 'v-die-abteilung',
    german: 'Abteilung',
    display: 'die Abteilung',
    article: 'die',
    gender: 'f',
    plural: 'die Abteilungen',
    wordType: 'noun',
    translation: { en: 'department', bg: 'отдел' },
    pronunciation: { en: 'ap-TY-loong', bg: 'ап-ТАЙ-лунг' },
    example: {
      de: 'Der Leiter der Abteilung heißt Herr Weber.',
      gloss: {
        en: 'The head of the department is called Mr Weber.',
        bg: 'Ръководителят на отдела се казва господин Вебер.',
      },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
  {
    id: 'v-die-fortbildung',
    german: 'Fortbildung',
    display: 'die Fortbildung',
    article: 'die',
    gender: 'f',
    plural: 'die Fortbildungen',
    wordType: 'noun',
    translation: { en: 'further training', bg: 'квалификация, обучение' },
    pronunciation: { en: 'FORT-bil-doong', bg: 'ФОРТ-бил-дунг' },
    example: {
      de: 'Trotzdem möchte ich eine Fortbildung machen.',
      gloss: { en: 'All the same I would like to do further training.', bg: 'Въпреки това искам да мина квалификация.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — the interview
 * ------------------------------------------------------------------ */

const INTERVIEW: VocabEntry[] = [
  {
    id: 'v-das-vorstellungsgespraech',
    german: 'Vorstellungsgespräch',
    display: 'das Vorstellungsgespräch',
    article: 'das',
    gender: 'n',
    plural: 'die Vorstellungsgespräche',
    wordType: 'noun',
    translation: { en: 'job interview', bg: 'интервю за работа' },
    pronunciation: { en: 'FOR-shtel-oongs-guh-shpraikh', bg: 'ФОР-щел-унгс-ге-шпрех' },
    example: {
      de: 'Ich freue mich auf das Vorstellungsgespräch.',
      gloss: { en: 'I am looking forward to the interview.', bg: 'Очаквам с нетърпение интервюто.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'Vorstellung (introduction) + Gespräch (conversation). German interviews are usually punctual to the minute, formal in address, and end with the candidate asking questions — not asking any is read as lack of interest.',
      bg: 'Vorstellung (представяне) + Gespräch (разговор). Немските интервюта обикновено са точни до минутата, на „Вие“, и завършват с въпроси от кандидата — да не зададеш никакви, се чете като липса на интерес.',
    },
  },
  {
    id: 'v-zuverlaessig',
    german: 'zuverlässig',
    display: 'zuverlässig',
    wordType: 'adjective',
    translation: { en: 'reliable', bg: 'надежден' },
    pronunciation: { en: 'TSOO-fer-les-ikh', bg: 'ЦУ-фер-лес-их' },
    example: {
      de: 'Ich arbeite selbstständig und zuverlässig.',
      gloss: { en: 'I work independently and reliably.', bg: 'Работя самостоятелно и надеждно.' },
    },
    tags: ['work', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'One of the three or four adjectives every German job advert asks for, alongside teamfähig and belastbar. They are formulaic, and that is exactly why they are worth knowing.',
      bg: 'Едно от трите-четири прилагателни, които всяка немска обява иска, заедно с teamfähig и belastbar. Те са шаблонни и точно затова си струва да се знаят.',
    },
  },
  {
    id: 'v-teamfaehig',
    german: 'teamfähig',
    display: 'teamfähig',
    wordType: 'adjective',
    translation: { en: 'a good team worker', bg: 'работещ добре в екип' },
    pronunciation: { en: 'TEEM-fay-ikh', bg: 'ТИМ-фе-их' },
    example: {
      de: 'Wir suchen eine teamfähige Person.',
      gloss: { en: 'We are looking for a team player.', bg: 'Търсим човек, който работи добре в екип.' },
    },
    tags: ['work', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'The -fähig ending means "capable of", and it builds endlessly: teamfähig, kritikfähig, belastbar is its cousin. English needs a whole phrase for each one.',
      bg: 'Окончанието -fähig значи „способен на“ и строи безкрайно: teamfähig, kritikfähig, а belastbar му е братовчед. Английският има нужда от цял израз за всяко.',
    },
  },
  {
    id: 'v-die-staerke',
    german: 'Stärke',
    display: 'die Stärke',
    article: 'die',
    gender: 'f',
    plural: 'die Stärken',
    wordType: 'noun',
    translation: { en: 'strength', bg: 'силна страна' },
    pronunciation: { en: 'SHTAIR-kuh', bg: 'ЩЕР-ке' },
    example: {
      de: 'Was sind Ihre Stärken und Schwächen?',
      gloss: { en: 'What are your strengths and weaknesses?', bg: 'Какви са силните и слабите ти страни?' },
    },
    tags: ['work', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-die-schwaeche'],
  },
  {
    id: 'v-die-schwaeche',
    german: 'Schwäche',
    display: 'die Schwäche',
    article: 'die',
    gender: 'f',
    plural: 'die Schwächen',
    wordType: 'noun',
    translation: { en: 'weakness', bg: 'слаба страна' },
    pronunciation: { en: 'SHVEKH-uh', bg: 'ШВЕ-хе' },
    example: {
      de: 'Meine größte Schwäche ist Ungeduld.',
      gloss: { en: 'My biggest weakness is impatience.', bg: 'Най-слабата ми страна е нетърпението.' },
    },
    tags: ['work', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-die-staerke'],
  },
  {
    id: 'v-sich-interessieren',
    german: 'sich interessieren für',
    display: 'sich interessieren für',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'interessiert' },
    translation: { en: 'to be interested in', bg: 'интересувам се от' },
    pronunciation: { en: 'zikh in-ter-es-SEE-ren fuer', bg: 'зих ин-те-ре-СИ-рен фюр' },
    example: {
      de: 'Ich interessiere mich für diese Stelle.',
      gloss: { en: 'I am interested in this position.', bg: 'Интересувам се от тази позиция.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'für plus the accusative, and the preposition is fixed. English "interested in" and Bulgarian „интересувам се от“ both point somewhere else — the German one simply has to be learnt with the verb.',
      bg: 'für плюс винителен, и предлогът е закован. Английското „interested in“ и българското „интересувам се от“ сочат другаде — немският предлог просто се учи заедно с глагола.',
    },
  },
  {
    id: 'v-sich-freuen-auf',
    german: 'sich freuen auf',
    display: 'sich freuen auf',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gefreut' },
    translation: { en: 'to look forward to', bg: 'очаквам с нетърпение' },
    pronunciation: { en: 'zikh FROY-en owf', bg: 'зих ФРОЙ-ен ауф' },
    example: {
      de: 'Ich freue mich auf Ihre Antwort.',
      gloss: { en: 'I look forward to your reply.', bg: 'Очаквам отговора ви с нетърпение.' },
    },
    tags: ['work'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'auf plus the accusative for something still to come; über plus the accusative for something that has happened. "Ich freue mich auf Ihre Antwort" is the standard closing line of a German cover letter.',
      bg: 'auf плюс винителен за нещо предстоящо; über плюс винителен за нещо, което вече е станало. „Ich freue mich auf Ihre Antwort“ е стандартният завършек на немско мотивационно писмо.',
    },
  },
];

export const WORK3_VOCAB: VocabEntry[] = [...APPLYING, ...CONTRACT, ...INTERVIEW];
