import type { Bilingual, GrammarConcept } from './types.ts';

/**
 * Grammar concepts for Pre-A1 units 3 to 6.
 *
 * Same conventions as `grammar.ts`: German is written once, and `only: ['bg']`
 * or `only: ['en']` scopes an explanation to the path where it actually helps.
 * The Bulgarian blocks lean on what Bulgarian already gives the learner (three
 * genders, a person-marked verb, ти/Вие) and warn where it misleads (the
 * position of "не", the free word order, the missing "имам" + case).
 */

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

export const GRAMMAR_CONCEPTS_2: GrammarConcept[] = [
  {
    id: 'g-numbers',
    title: bi('How German builds numbers', 'Как немският изгражда числата'),
    level: 'pre-a1',
    summary: bi(
      'Regular from 13 up, but the tens and units are said back to front.',
      'Правилно от 13 нагоре, но десетиците и единиците се казват обратно.',
    ),
    tags: ['numbers'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'From 13 to 19 the pattern is simply the digit plus -zehn, with two small irregularities.',
          'От 13 до 19 моделът е просто цифрата плюс -zehn, с две малки изключения.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Number', 'Число'), bi('German', 'Немски'), bi('Note', 'Бележка')],
        rows: [
          ['13', 'dreizehn', bi('regular', 'правилно')],
          ['16', 'sechzehn', bi('sechs loses its s', 'sechs губи своето s')],
          ['17', 'siebzehn', bi('sieben loses its -en', 'sieben губи своето -en')],
          ['19', 'neunzehn', bi('regular', 'правилно')],
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        title: bi('The one that trips everyone up', 'Онова, което спъва всички'),
        text: bi(
          'From 21 onwards German says the unit first: einundzwanzig is literally "one-and-twenty". It is written as a single word, with no spaces and no hyphens.',
          'От 21 нагоре немският казва първо единицата: einundzwanzig е буквално „едно-и-двайсет“. Пише се като една дума, без интервали и тирета.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Number', 'Число'), bi('German', 'Немски'), bi('Literally', 'Буквално')],
        rows: [
          ['21', 'einundzwanzig', bi('one-and-twenty', 'едно-и-двайсет')],
          ['32', 'zweiunddreißig', bi('two-and-thirty', 'две-и-трийсет')],
          ['47', 'siebenundvierzig', bi('seven-and-forty', 'седем-и-четирийсет')],
          ['99', 'neunundneunzig', bi('nine-and-ninety', 'девет-и-деветдесет')],
        ],
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Тук българският НЕ помага: „двайсет и едно“ следва реда десетица-единица, а немският го обръща — einundzwanzig. Свиквай да чуваш първо единицата, което е особено важно при телефонни номера и цени.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English used to do this too — "four and twenty blackbirds" — and German simply never stopped. The practical consequence: when you hear a price, the first number you hear is the *last* digit.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'The ending -zig is pronounced "-tsikh", not "-zig". And 30 is the odd one out in spelling: dreißig, with ß.',
          'Окончанието -zig се изговаря „-цих“, не „-циг“. А 30 е изключение в правописа: dreißig, с ß.',
        ),
      },
    ],
  },

  {
    id: 'g-age-and-prices',
    title: bi('Age, prices and phone numbers', 'Възраст, цени и телефонни номера'),
    level: 'pre-a1',
    summary: bi(
      'German says "I am thirty years old" in full, and asks "how is" your number.',
      'Немският казва „аз съм на трийсет години“ изцяло и пита „как е“ номерът ти.',
    ),
    tags: ['numbers', 'phrases'],
    blocks: [
      { t: 'de', de: 'Ich bin dreißig Jahre alt.', gloss: bi('I am thirty years old.', 'Аз съм на трийсет години.'), audio: true },
      { t: 'de', de: 'Wie alt bist du?', gloss: bi('How old are you?', 'На колко години си?'), audio: true },
      { t: 'de', de: 'Das kostet drei Euro fünfzig.', gloss: bi('That costs three euros fifty.', 'Това струва три евро и петдесет.'), audio: true },
      { t: 'de', de: 'Wie ist deine Telefonnummer?', gloss: bi('What is your phone number?', 'Какъв е телефонният ти номер?'), audio: true },
      {
        t: 'p',
        text: bi(
          'Age uses "sein" (to be) and the full phrase "Jahre alt". In everyday speech people often shorten it to "Ich bin dreißig", but the full form is never wrong.',
          'Възрастта използва „sein“ (съм) и целия израз „Jahre alt“. В разговорния език често се съкращава до „Ich bin dreißig“, но пълната форма никога не е грешна.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Две разлики от българския. Първо: българският казва „Аз съм на трийсет“ с предлог „на“ и без „години“ — немският няма предлог, но иска „Jahre alt“. Второ: за номер немският пита „Wie ist ...?“ (как е), а не „Какъв е ...?“.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English asks "What is your number?"; German asks "Wie ist deine Nummer?" — literally "how is". Using "Was ist" here sounds wrong to a German ear.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'Phone numbers are read out in pairs, and "zwei" is often replaced by "zwo" so it cannot be heard as "drei".',
          'Телефонните номера се четат по двойки, а „zwei“ често се заменя със „zwo“, за да не се чуе като „drei“.',
        ),
      },
    ],
  },

  {
    id: 'g-no-article-profession',
    title: bi('No article with a profession', 'Без член при професия'),
    level: 'pre-a1',
    summary: bi(
      'Ich bin Lehrer — never "ein Lehrer".',
      'Ich bin Lehrer — никога „ein Lehrer“.',
    ),
    tags: ['articles', 'work'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'When you say what someone does for a living, German leaves the article out entirely.',
          'Когато казваш с какво се занимава някой, немският изпуска члена напълно.',
        ),
      },
      { t: 'de', de: 'Ich bin Lehrer.', gloss: bi('I am a teacher.', 'Аз съм учител.'), audio: true },
      { t: 'de', de: 'Sie ist Ärztin.', gloss: bi('She is a doctor.', 'Тя е лекарка.'), audio: true },
      { t: 'de', de: 'Er ist Student.', gloss: bi('He is a student.', 'Той е студент.'), audio: true },
      {
        t: 'callout',
        tone: 'warn',
        text: bi(
          'The same rule covers nationalities: "Ich bin Bulgare", not "Ich bin ein Bulgare".',
          'Същото правило важи и за националностите: „Ich bin Bulgare“, а не „Ich bin ein Bulgare“.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'This is one of the few places where German is simpler than English. English insists on "a teacher"; German just drops it. So the mistake English speakers make is adding an article that is not wanted.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Тук българският ти дава точния модел: „Аз съм учител“ също е без член. Просто следвай българската логика и ще е правилно.',
        ),
      },
      {
        t: 'p',
        text: bi(
          'One more thing worth getting right: professions and nationalities have a feminine form in -in, and it is not optional. A woman is Lehrerin, Ärztin, Bulgarin.',
          'Още нещо важно: професиите и националностите имат женска форма на -in и тя не е по избор. Жена е Lehrerin, Ärztin, Bulgarin.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Man', 'Мъж'), bi('Woman', 'Жена')],
        rows: [
          ['der Lehrer', 'die Lehrerin'],
          ['der Arzt', 'die Ärztin'],
          ['der Bulgare', 'die Bulgarin'],
          ['der Student', 'die Studentin'],
        ],
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Немското окончание -in прави почти същото като българското -ка: учител → учителка, Lehrer → Lehrerin. Логиката ти е позната.',
        ),
      },
    ],
  },

  {
    id: 'g-haben-accusative',
    title: bi('haben and the accusative', 'haben и винителният падеж'),
    level: 'pre-a1',
    summary: bi(
      'After haben, a masculine "ein" becomes "einen".',
      'След haben мъжкото „ein“ става „einen“.',
    ),
    tags: ['verbs', 'case', 'articles'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Person', 'Лице'), bi('Form', 'Форма')],
        rows: [
          ['ich', 'habe'],
          ['du', 'hast'],
          ['er / sie / es', 'hat'],
          ['wir', 'haben'],
          ['ihr', 'habt'],
          ['sie / Sie', 'haben'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'Now the part that is genuinely new. The thing you have is the *object* of the sentence, and German marks the object — but only in the masculine.',
          'Сега идва наистина новото. Нещото, което имаш, е допълнение в изречението, а немският маркира допълнението — но само в мъжки род.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Gender', 'Род'), bi('Subject form', 'Форма като подлог'), bi('After haben', 'След haben')],
        rows: [
          [bi('masculine', 'мъжки'), 'ein Bruder', 'einen Bruder'],
          [bi('feminine', 'женски'), 'eine Schwester', 'eine Schwester'],
          [bi('neuter', 'среден'), 'ein Kind', 'ein Kind'],
        ],
        caption: bi(
          'Only the masculine changes. Feminine and neuter stay exactly as they are.',
          'Само мъжкият род се мени. Женският и средният остават точно същите.',
        ),
      },
      { t: 'de', de: 'Ich habe einen Bruder.', gloss: bi('I have a brother.', 'Имам един брат.'), audio: true },
      { t: 'de', de: 'Ich habe eine Schwester.', gloss: bi('I have a sister.', 'Имам една сестра.'), audio: true },
      { t: 'de', de: 'Ich habe ein Kind.', gloss: bi('I have a child.', 'Имам едно дете.'), audio: true },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Това е първата ти истинска среща с падеж, а съвременният български няма такава система при съществителните. Добрата новина: тук трябва да запомниш само едно нещо — при мъжки род „ein“ става „einen“ след haben. Женският и средният не се менят. Останалите падежи идват в A1 и A2.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English lost its case endings on nouns centuries ago, but you still have a trace of this: "he" becomes "him" when it is the object. German does the same thing to articles, and at Pre-A1 only the masculine "ein → einen" matters.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'A memory hook: the masculine is the only gender that ever adds -n. der → den, ein → einen, mein → meinen.',
          'Опора за паметта: мъжкият род е единственият, който някога добавя -n. der → den, ein → einen, mein → meinen.',
        ),
      },
    ],
  },

  {
    id: 'g-plurals',
    title: bi('German plurals', 'Множествено число в немския'),
    level: 'pre-a1',
    summary: bi(
      'Five endings and an umlaut, and the article is always "die".',
      'Пет окончания и умлаут, а членът винаги е „die“.',
    ),
    tags: ['nouns', 'plural'],
    blocks: [
      {
        t: 'callout',
        tone: 'tip',
        title: bi('The good news first', 'Първо добрата новина'),
        text: bi(
          'Whatever the gender, every plural noun takes "die". der Tisch, das Haus and die Frau all become die Tische, die Häuser, die Frauen.',
          'Независимо от рода, всяко съществително в множествено число взима „die“. der Tisch, das Haus и die Frau стават die Tische, die Häuser, die Frauen.',
        ),
      },
      {
        t: 'p',
        text: bi(
          'The ending itself has to be learnt with the word. There are five common patterns:',
          'Самото окончание трябва да се учи заедно с думата. Има пет често срещани модела:',
        ),
      },
      {
        t: 'table',
        headers: [bi('Pattern', 'Модел'), bi('Singular', 'Единствено'), bi('Plural', 'Множествено')],
        rows: [
          ['-e', 'der Tisch', 'die Tische'],
          ['-er (+ umlaut)', 'das Haus', 'die Häuser'],
          ['-en / -n', 'die Frau', 'die Frauen'],
          ['-s', 'das Auto', 'die Autos'],
          [bi('no ending, umlaut only', 'без окончание, само умлаут'), 'die Mutter', 'die Mütter'],
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        text: bi(
          'The umlaut is not decoration. "die Mutter" is one mother and "die Mütter" is several — the only difference is the two dots.',
          'Умлаутът не е украса. „die Mutter“ е една майка, а „die Mütter“ са няколко — единствената разлика са двете точки.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският също има няколко модела за множествено число (маса → маси, град → градове, дете → деца), така че идеята ти е позната. Разликата: в немския множественото число често мени и гласната в корена, което българският прави рядко. Затова в SatzWerk множественото се учи заедно с думата.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English has a handful of these too — man/men, foot/feet, mouse/mice — and German simply has far more of them. That is why the plural is stored with the word in your vocabulary list rather than derived by a rule.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'Two reliable shortcuts: nouns ending in -in make -innen (die Lehrerin → die Lehrerinnen), and nouns ending in -chen never change (das Mädchen → die Mädchen).',
          'Две надеждни преки пътища: съществителните на -in правят -innen (die Lehrerin → die Lehrerinnen), а тези на -chen не се менят (das Mädchen → die Mädchen).',
        ),
      },
    ],
  },

  {
    id: 'g-negation',
    title: bi('Saying no: nicht and kein', 'Да кажеш „не“: nicht и kein'),
    level: 'pre-a1',
    summary: bi(
      'kein negates a noun, nicht negates everything else.',
      'kein отрича съществително, nicht отрича всичко останало.',
    ),
    tags: ['negation'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'German has two negation words, and choosing between them is easier than it looks: if you are cancelling a noun, use kein. Otherwise use nicht.',
          'Немският има две думи за отрицание и изборът между тях е по-лесен, отколкото изглежда: ако отричаш съществително, използвай kein. Иначе използвай nicht.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Negating', 'Отричаш'), bi('Word', 'Дума'), bi('Example', 'Пример')],
        rows: [
          [bi('a noun with ein', 'съществително с ein'), 'kein', 'Ich habe keine Schwester.'],
          [bi('a noun with no article', 'съществително без член'), 'kein', 'Ich bin kein Lehrer.'],
          [bi('a verb', 'глагол'), 'nicht', 'Ich arbeite nicht.'],
          [bi('an adjective', 'прилагателно'), 'nicht', 'Das ist nicht groß.'],
          [bi('a place or name', 'място или име'), 'nicht', 'Ich wohne nicht in Berlin.'],
        ],
      },
      {
        t: 'p',
        text: bi(
          '"kein" takes exactly the same endings as "ein", so you already know them: kein Bruder, keine Schwester, kein Kind, and keinen Bruder after haben.',
          '„kein“ взима точно същите окончания като „ein“, така че вече ги знаеш: kein Bruder, keine Schwester, kein Kind, а след haben — keinen Bruder.',
        ),
      },
      { t: 'de', de: 'Ich habe keine Kinder.', gloss: bi('I have no children.', 'Нямам деца.'), audio: true },
      { t: 'de', de: 'Ich spreche nicht Englisch.', gloss: bi('I do not speak English.', 'Не говоря английски.'), audio: true },
      {
        t: 'callout',
        tone: 'warn',
        title: bi('Where the word goes', 'Къде застава думата'),
        text: bi(
          'There is no "do not" helper in German. The verb stays in position two and nicht comes after it, usually near the end: Ich wohne nicht in Berlin.',
          'В немския няма помощно „do not“. Глаголът остава на второ място, а nicht идва след него, обикновено към края: Ich wohne nicht in Berlin.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Това е важна разлика. Българското „не“ стои ПРЕД глагола: „не живея в Берлин“. Немското „nicht“ стои СЛЕД глагола: „Ich wohne nicht in Berlin“. Ако сложиш nicht отпред, изречението звучи грешно.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English builds negation with a helper verb: "I do not live". German has no such helper — the main verb simply stays put and nicht is added. So "Ich tue nicht wohnen" is not a sentence.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'A quick answer to a yes/no question needs neither: "Nein, danke." does the whole job.',
          'Кратък отговор на въпрос с да/не не се нуждае от нито едно от двете: „Nein, danke.“ върши цялата работа.',
        ),
      },
    ],
  },

  {
    id: 'g-questions',
    title: bi('Asking questions', 'Да задаваш въпроси'),
    level: 'pre-a1',
    summary: bi(
      'Yes/no questions put the verb first; W-questions keep it second.',
      'Въпросите с да/не слагат глагола първи; въпросите с W го държат втори.',
    ),
    tags: ['word-order', 'questions'],
    blocks: [
      {
        t: 'p',
        text: bi(
          'There are exactly two question shapes in German, and both follow from the verb-second rule you already know.',
          'В немския има точно два вида въпроси и двата следват от правилото за глагола на второ място, което вече знаеш.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Type', 'Вид'), bi('Shape', 'Строеж'), bi('Example', 'Пример')],
        rows: [
          [bi('yes / no', 'да / не'), bi('verb first', 'глаголът първи'), 'Wohnst du in Hamburg?'],
          [bi('W-question', 'въпрос с W'), bi('question word, then verb', 'въпросителна дума, после глагол'), 'Wo wohnst du?'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'For a yes/no question, take the statement and move the verb to the front. Nothing else changes.',
          'За въпрос с да/не вземи съобщителното изречение и премести глагола отпред. Нищо друго не се мени.',
        ),
      },
      {
        t: 'table',
        headers: [bi('Statement', 'Съобщително'), bi('Question', 'Въпрос')],
        rows: [
          ['Du wohnst in Hamburg.', 'Wohnst du in Hamburg?'],
          ['Sie ist Ärztin.', 'Ist sie Ärztin?'],
          ['Du hast einen Bruder.', 'Hast du einen Bruder?'],
        ],
      },
      {
        t: 'p',
        text: bi(
          'The question words you now have:',
          'Въпросителните думи, които вече имаш:',
        ),
      },
      {
        t: 'table',
        headers: [bi('German', 'Немски'), bi('Meaning', 'Значение'), bi('Example', 'Пример')],
        rows: [
          ['wer', bi('who', 'кой'), 'Wer ist das?'],
          ['was', bi('what', 'какво'), 'Was machst du?'],
          ['wo', bi('where', 'къде'), 'Wo wohnst du?'],
          ['woher', bi('where from', 'откъде'), 'Woher kommst du?'],
          ['wann', bi('when', 'кога'), 'Wann kommst du?'],
          ['wie', bi('how', 'как'), 'Wie heißt du?'],
          ['warum', bi('why', 'защо'), 'Warum lernst du Deutsch?'],
          ['wie viel', bi('how much', 'колко'), 'Wie viel kostet das?'],
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        only: ['en'],
        text: bi(
          'Two traps for English speakers. "wer" means who, not where — "wo" is where. And German never uses a helper: "Do you live here?" is "Wohnst du hier?", never "Tust du wohnen hier?".',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Тук българският ти помага повече, отколкото очакваш. Българският също мести глагола за въпрос с да/не („Живееш ли в Хамбург?“) — само че използва частицата „ли“, а немският просто слага глагола отпред, без допълнителна дума. И внимавай: „wer“ значи „кой“, а „wo“ значи „къде“.',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'In speech, German often turns a statement into a question with intonation alone: "Du wohnst in Hamburg?" That is informal but very common.',
          'В говоримия език немският често превръща съобщително изречение във въпрос само с интонация: „Du wohnst in Hamburg?“ Неофициално, но много често.',
        ),
      },
    ],
  },

  {
    id: 'g-time-prepositions',
    title: bi('am, im, um', 'am, im, um'),
    level: 'pre-a1',
    summary: bi(
      'am for a day, im for a month, um for a clock time.',
      'am за ден, im за месец, um за точен час.',
    ),
    tags: ['prepositions', 'time'],
    blocks: [
      {
        t: 'table',
        headers: [bi('For', 'За'), bi('Preposition', 'Предлог'), bi('Example', 'Пример')],
        rows: [
          [bi('a day of the week', 'ден от седмицата'), 'am', 'am Montag'],
          [bi('the weekend', 'уикенда'), 'am', 'am Wochenende'],
          [bi('a month', 'месец'), 'im', 'im Januar'],
          [bi('a clock time', 'точен час'), 'um', 'um acht Uhr'],
        ],
      },
      { t: 'de', de: 'Am Montag arbeite ich.', gloss: bi('On Monday I work.', 'В понеделник работя.'), audio: true },
      { t: 'de', de: 'Im Mai habe ich Geburtstag.', gloss: bi('My birthday is in May.', 'През май имам рожден ден.'), audio: true },
      { t: 'de', de: 'Um acht Uhr beginnt die Arbeit.', gloss: bi('Work starts at eight.', 'В осем часа започва работата.'), audio: true },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'These three cover almost everything at this level. "am" and "im" are short forms of an dem and in dem — you do not need that yet, but it explains why they look odd.',
          'Тези три покриват почти всичко на това ниво. „am“ и „im“ са кратки форми на an dem и in dem — засега не ти трябва, но обяснява защо изглеждат странно.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският използва „в“ и „през“ за всичко това: „в понеделник“, „през май“, „в осем часа“. Немският иска три различни предлога и не ги разменя. Това е чиста памет, не логика — затова се учат заедно с израза.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English also splits these three ways — on Monday, in May, at eight — so the idea is familiar. The pairings just do not line up: German uses "am" where English uses "on", and "um" where English uses "at".',
          '',
        ),
      },
    ],
  },

  {
    id: 'g-telling-time',
    title: bi('Telling the time', 'Да кажеш колко е часът'),
    level: 'pre-a1',
    summary: bi(
      'German counts the half hour forward: halb acht is 7:30.',
      'Немският брои половин час напред: halb acht е 7:30.',
    ),
    tags: ['time', 'clock'],
    blocks: [
      {
        t: 'table',
        headers: [bi('Time', 'Час'), bi('German', 'Немски'), bi('Literally', 'Буквално')],
        rows: [
          ['8:00', 'acht Uhr', bi('eight o’clock', 'осем часа')],
          ['8:15', 'Viertel nach acht', bi('quarter after eight', 'четвърт след осем')],
          ['8:30', 'halb neun', bi('half to nine', 'половината до девет')],
          ['8:45', 'Viertel vor neun', bi('quarter before nine', 'четвърт преди девет')],
          ['8:10', 'zehn nach acht', bi('ten after eight', 'десет след осем')],
          ['8:50', 'zehn vor neun', bi('ten before nine', 'десет преди девет')],
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        title: bi('The half hour', 'Половиният час'),
        text: bi(
          'This one catches everyone. "halb neun" is 8:30, not 9:30. German is counting how far it is to the *coming* hour, so half of the way to nine is half past eight. Get this wrong and you arrive an hour late.',
          'Това спъва всички. „halb neun“ е 8:30, а не 9:30. Немският брои колко остава до ИДВАЩИЯ час, така че половината път до девет е осем и половина. Ако го объркаш, пристигаш с час закъснение.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският брои назад от изминалия час: „осем и половина“. Немският брои напред към следващия: „halb neun“. Същият момент, противоположна логика. Трик за запомняне: немското число винаги е с едно ПОВЕЧЕ от българското.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English says "half past eight" — looking back at the hour that has gone. German says "halb neun" — looking forward to the hour that is coming. Same moment, opposite reference point. The German number is always one higher than the English one.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'The safe way out: in official contexts — timetables, appointments, opening hours — Germans use the 24-hour clock and say "acht Uhr dreißig" (8:30). No ambiguity at all.',
          'Безопасният изход: в официален контекст — разписания, часове при лекар, работно време — немците използват 24-часовия формат и казват „acht Uhr dreißig“ (8:30). Никаква двусмислица.',
        ),
      },
      { t: 'de', de: 'Wie viel Uhr ist es?', gloss: bi('What time is it?', 'Колко е часът?'), audio: true },
      { t: 'de', de: 'Es ist halb acht.', gloss: bi('It is half past seven.', 'Часът е седем и половина.'), audio: true },
      { t: 'de', de: 'Der Termin ist um Viertel vor zehn.', gloss: bi('The appointment is at quarter to ten.', 'Часът е за девет и четирийсет и пет.'), audio: true },
    ],
  },

  {
    id: 'g-pronoun-table',
    title: bi('All the pronouns together', 'Всички местоимения заедно'),
    level: 'pre-a1',
    summary: bi(
      'Nine forms, and the three that mean "you".',
      'Девет форми и трите, които значат „ти/вие“.',
    ),
    tags: ['pronoun'],
    blocks: [
      {
        t: 'table',
        headers: [bi('German', 'Немски'), bi('Meaning', 'Значение'), bi('sein', 'sein'), bi('haben', 'haben')],
        rows: [
          ['ich', bi('I', 'аз'), 'bin', 'habe'],
          ['du', bi('you (one person, informal)', 'ти'), 'bist', 'hast'],
          ['er', bi('he / it (der-words)', 'той'), 'ist', 'hat'],
          ['sie', bi('she / it (die-words)', 'тя'), 'ist', 'hat'],
          ['es', bi('it (das-words)', 'то'), 'ist', 'hat'],
          ['wir', bi('we', 'ние'), 'sind', 'haben'],
          ['ihr', bi('you (several, informal)', 'вие (неофициално)'), 'seid', 'habt'],
          ['sie', bi('they', 'те'), 'sind', 'haben'],
          ['Sie', bi('you (formal)', 'Вие (учтиво)'), 'sind', 'haben'],
        ],
      },
      {
        t: 'callout',
        tone: 'warn',
        title: bi('Three words that all mean "you"', 'Три думи, които значат „ти/вие“'),
        text: bi(
          'du for one person you know, ihr for several people you know, Sie for anyone you are being formal with. Only Sie is capitalised.',
          'du за един познат човек, ihr за няколко познати, Sie за всеки, с когото си на „Вие“. Само Sie се пише с главна буква.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['bg'],
        text: bi(
          '',
          'Българският ти дава два от трите наготово: „ти“ = du, „Вие“ = Sie. Третото, „ihr“, е неофициалното „вие“ към няколко приятели — там, където българският също казва „вие“, но с малка буква. Забележи и че „sie“ (те) и „Sie“ (Вие) имат същите глаголни форми; различава ги само главната буква.',
        ),
      },
      {
        t: 'callout',
        tone: 'compare',
        only: ['en'],
        text: bi(
          'English has one word, "you", for all three. That is why English speakers forget "ihr" exists: there is nothing in your own language to remind you. Note too that "sie" (they) and "Sie" (you, formal) share their verb forms, so only the capital letter tells them apart in writing.',
          '',
        ),
      },
      {
        t: 'callout',
        tone: 'tip',
        text: bi(
          'Notice the pattern: wir, sie and Sie always share the same verb form, which is the infinitive. That is three of the nine forms you get for free.',
          'Забележи модела: wir, sie и Sie винаги имат същата глаголна форма, която е инфинитивът. Това са три от деветте форми, които получаваш безплатно.',
        ),
      },
    ],
  },
];
