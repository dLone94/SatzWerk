import type { Bilingual, ErrorCategory, TeachingLanguage } from './content/types.ts';

/**
 * Interface strings.
 *
 * Lesson content lives in the content model; this file is only the chrome:
 * navigation, buttons, labels and status text. Both paths are authored, not
 * machine-translated, and there is exactly one component tree for both.
 */

const s = (en: string, bg: string): Bilingual => ({ en, bg });

export const UI = {
  appName: s('SatzWerk', 'SatzWerk'),
  tagline: s('Your personal German tutor', 'Твоят личен учител по немски'),

  // Navigation
  navToday: s('Today', 'Днес'),
  navCourse: s('Course', 'Курс'),
  navReview: s('Review', 'Повторение'),
  navVocabulary: s('Vocabulary', 'Речник'),
  navMistakes: s('Mistakes', 'Грешки'),
  navRealLife: s('Real life', 'Реален живот'),
  navCoach: s('Coach', 'Наставник'),
  navSettings: s('Settings', 'Настройки'),

  // Login, shown only when the app is hosted behind a password
  loginIntro: s(
    'This is a private copy of SatzWerk. Enter the password to carry on.',
    'Това е лично копие на SatzWerk. Въведи паролата, за да продължиш.',
  ),
  loginPassword: s('Password', 'Парола'),
  loginSubmit: s('Continue', 'Продължи'),
  loginWorking: s('Checking…', 'Проверява се…'),
  signOut: s('Sign out', 'Излез'),

  // First run on a hosted copy: choosing the password
  setupTitle: s('Set a password', 'Задай парола'),
  setupIntro: s(
    'This copy of SatzWerk is on the internet, so it needs a password before it will show you anything. Choose one now — you can change it later in Settings.',
    'Това копие на SatzWerk е в интернет, затова му трябва парола, преди да покаже каквото и да е. Избери една сега — можеш да я смениш по-късно в Настройки.',
  ),
  setupPassword: s('New password', 'Нова парола'),
  setupConfirm: s('Type it again', 'Напиши я отново'),
  setupSubmit: s('Set password and start', 'Задай паролата и започни'),
  setupTooShort: s(
    'At least 10 characters, please. This is the only thing guarding your progress.',
    'Поне 10 знака. Това е единственото, което пази напредъка ти.',
  ),
  setupMismatch: s('The two do not match yet.', 'Двете още не съвпадат.'),
  setupNote: s(
    'Only a hashed form is stored, never the password itself.',
    'Запазва се само хеширан вид, никога самата парола.',
  ),

  // Changing it later
  passwordChange: s('Change password', 'Смени паролата'),
  passwordCurrent: s('Current password', 'Текуща парола'),
  passwordNew: s('New password', 'Нова парола'),
  passwordChanged: s(
    'Password changed. Any other device that was signed in has been signed out.',
    'Паролата е сменена. Всяко друго устройство, което беше влязло, е излязло.',
  ),
  passwordFromEnv: s(
    'The password comes from an environment variable on the host, so it has to be changed there.',
    'Паролата идва от променлива на средата при хостинга, затова трябва да се смени там.',
  ),

  // Onboarding
  onboardingTitle: s('Welcome to SatzWerk', 'Добре дошъл в SatzWerk'),
  onboardingIntro: s(
    'SatzWerk teaches German by making you produce it: you read, you listen, and then you type German yourself. Choose the language you would like the explanations in.',
    'SatzWerk учи немски, като те кара да го произвеждаш: четеш, слушаш и после сам пишеш на немски. Избери на кой език искаш обясненията.',
  ),
  onboardingPathEn: s('Explain German to me in English', 'Обяснявай ми немския на английски'),
  onboardingPathBg: s('Explain German to me in Bulgarian', 'Обяснявай ми немския на български'),
  onboardingPathNote: s(
    'The two paths are written separately. The Bulgarian path explains German from a Bulgarian speaker’s point of view — grammatical gender, the position of the article, cases — rather than translating the English one.',
    'Двата пътя са написани отделно. Българският път обяснява немския от гледна точка на българския говорещ — род, място на члена, падежи — а не превежда английския.',
  ),
  onboardingTarget: s('How much do you want to study each day?', 'Колко искаш да учиш всеки ден?'),
  onboardingStart: s('Start learning', 'Започни да учиш'),
  onboardingChangeLater: s(
    'You can change this at any time in Settings without losing progress.',
    'Можеш да промениш това по всяко време в Настройки, без да загубиш напредъка си.',
  ),

  // Dashboard
  dashboardGreeting: s('Today’s study', 'Днешно учене'),
  dashboardNextAction: s('Your next useful step', 'Следващата ти полезна стъпка'),
  dashboardContinue: s('Continue the lesson', 'Продължи урока'),
  dashboardStartLesson: s('Start the lesson', 'Започни урока'),
  dashboardReviewDue: s('Review what is due', 'Повтори дължимото'),
  dashboardPracticeMistakes: s('Practise your mistakes', 'Упражнявай грешките си'),
  dashboardAllDone: s(
    'Nothing is due right now. Practising early is still an option.',
    'Нищо не е за повторение точно сега. Можеш да упражняваш и предварително.',
  ),
  dashboardPlan: s('Suggested sequence', 'Предложена последователност'),
  dashboardPlanEmpty: s('Finish onboarding to get a plan.', 'Завърши началната настройка, за да получиш план.'),
  dashboardEstimate: s('about {n} min', 'около {n} мин'),

  // Stats
  statAccuracy: s('First-try accuracy', 'Верни от първи опит'),
  statStreak: s('Study streak', 'Поредни дни'),
  statStreakDays: s('{n} days', '{n} дни'),
  statStreakDaysOne: s('{n} day', '{n} ден'),
  statStudyTime: s('Time studied', 'Учено време'),
  statAnswers: s('Answers typed', 'Написани отговори'),
  statWordsLearning: s('Words being learnt', 'Думи в процес на учене'),
  statWordsKnown: s('Words known', 'Научени думи'),
  statDue: s('Due for review', 'За повторение'),
  statLessonsDone: s('Lessons completed', 'Завършени урока'),
  statCorrections: s('Corrections retyped', 'Поправени и пренаписани'),
  statNoData: s('No data yet — answer something first.', 'Още няма данни — първо отговори на нещо.'),

  // Progress by skill
  skillsTitle: s('Progress by skill', 'Напредък по умение'),
  skillVocabulary: s('Vocabulary', 'Речник'),
  skillGrammar: s('Grammar', 'Граматика'),
  skillListening: s('Listening', 'Слушане'),
  skillWriting: s('Writing', 'Писане'),
  skillReading: s('Reading', 'Четене'),
  skillSpeaking: s('Speaking', 'Говорене'),
  skillSpeakingPlanned: s('Planned — not built yet', 'Планирано — още не е направено'),

  // Course / level map
  courseTitle: s('The course', 'Курсът'),
  courseSubtitle: s(
    'Pre-A1 to B2. Lessons marked as available are finished and playable; the rest is the planned outline.',
    'От Pre-A1 до B2. Отбелязаните като налични уроци са завършени и работят; останалото е планиран план.',
  ),
  statusAvailable: s('Available', 'Налично'),
  statusPartial: s('In progress', 'В процес'),
  statusPlanned: s('Planned', 'Планирано'),
  levelOutcomes: s('By the end of this level you can', 'В края на това ниво можеш'),
  levelCheckpoint: s('Level checkpoint', 'Проверка на нивото'),
  levelTopics: s('Topics', 'Теми'),
  levelGrammar: s('Grammar', 'Граматика'),
  plannedUnits: s('Planned units', 'Планирани раздели'),
  plannedNotice: s(
    'This level is outlined but not authored yet. Nothing here is playable.',
    'Това ниво е планирано, но още не е написано. Нищо тук не може да се играе.',
  ),
  unitCheckpoint: s('Unit checkpoint', 'Контролна проверка'),

  // Lesson
  lessonObjective: s('Lesson objective', 'Цел на урока'),
  lessonOutcomes: s('You will be able to', 'Ще можеш'),
  lessonMinutes: s('{n} min', '{n} мин'),
  lessonStart: s('Start', 'Започни'),
  lessonContinue: s('Continue', 'Продължи'),
  lessonReplay: s('Practise again', 'Упражнявай отново'),
  lessonRequirements: s('To complete this lesson', 'За да завършиш урока'),
  lessonCompleted: s('Lesson completed', 'Урокът е завършен'),
  lessonSections: s('Teaching sections', 'Учебни раздели'),
  lessonNextSection: s('Next', 'Напред'),
  lessonPrevSection: s('Back', 'Назад'),
  lessonToExercises: s('Start the exercises', 'Към упражненията'),
  lessonSectionRead: s('Read', 'Прочетено'),
  lessonWordList: s('Words in this section', 'Думи в този раздел'),
  lessonSummary: s('Summary', 'Резюме'),
  lessonMastery: s('Mastery check', 'Проверка за усвояване'),
  lessonMasteryIntro: s(
    'No hints are offered here. Type the German from memory.',
    'Тук няма подсказки. Напиши немския по памет.',
  ),
  lessonMasteryPassed: s('Mastery check passed', 'Проверката е издържана'),
  lessonMasteryFailed: s(
    'Not passed yet. Have another look at the material and try again — nothing is lost.',
    'Още не е издържана. Прегледай материала и опитай пак — нищо не е загубено.',
  ),
  lessonRecovery: s('Quick recovery round', 'Кратък възстановителен кръг'),
  lessonRecoveryIntro: s(
    'A few of these went wrong the first time. Let us go through just those before the mastery check.',
    'Няколко от тези не се получиха от първия път. Да минем само през тях преди проверката.',
  ),
  lessonPhasePractice: s('Practice', 'Упражнения'),
  lessonPhaseMastery: s('Mastery', 'Усвояване'),
  lessonBackToLesson: s('Back to the lesson', 'Обратно към урока'),

  // Exercise player
  exerciseProgress: s('{done} of {total}', '{done} от {total}'),
  exerciseSubmit: s('Check', 'Провери'),
  exerciseContinue: s('Continue', 'Напред'),
  exerciseHint: s('Hint', 'Подсказка'),
  exerciseHintCount: s('Hint {n} of {total}', 'Подсказка {n} от {total}'),
  exerciseNoMoreHints: s('No more hints', 'Няма повече подсказки'),
  exerciseReveal: s('Show the answer', 'Покажи отговора'),
  exerciseRevealWarning: s(
    'Showing the answer means no credit for this item, and it will come back soon.',
    'Показването на отговора значи нула точки за тази задача и тя ще се върне скоро.',
  ),
  exerciseRetype: s('Now type the correct German', 'Сега напиши правилния немски'),
  exerciseRetypeLocked: s(
    'Type the correction to continue.',
    'Напиши поправката, за да продължиш.',
  ),
  exerciseTypeAnswer: s('Type your answer in German', 'Напиши отговора си на немски'),
  exerciseEnterToSubmit: s('Enter to check', 'Enter за проверка'),
  // Free writing needs newlines, so Enter cannot submit there.
  exerciseCtrlEnterToSubmit: s('Ctrl+Enter to check', 'Ctrl+Enter за проверка'),
  exerciseEnterToContinue: s('Enter to continue', 'Enter за напред'),
  exercisePlayAudio: s('Play', 'Пусни'),
  exercisePlaySlow: s('Slow', 'Бавно'),
  exerciseAudioUnavailable: s(
    'This browser has no German speech voice, so audio is unavailable.',
    'Този браузър няма немски говорен глас, затова звукът не е достъпен.',
  ),
  exerciseWordBank: s('Tap the words in the right order', 'Докосни думите в правилния ред'),
  exerciseWordBankClear: s('Clear', 'Изчисти'),
  exerciseChoose: s('Choose one', 'Избери едно'),
  exerciseFreeWriting: s('Write freely', 'Пиши свободно'),
  exerciseFreeWritingNote: s(
    'There is no single right answer. SatzWerk checks that you used the target language, and the Coach can review it.',
    'Няма един правилен отговор. SatzWerk проверява дали си използвал целевите изрази, а Наставникът може да го прегледа.',
  ),
  exerciseFreeWritingMissing: s('Still missing: {words}', 'Все още липсва: {words}'),
  exerciseFreeWritingOk: s('That contains what the task asked for.', 'Това съдържа каквото задачата поиска.'),
  exerciseDone: s('Round finished', 'Кръгът е завършен'),
  exerciseScore: s('{correct} of {total} right first time', '{correct} от {total} верни от първи опит'),
  exerciseSpecialChars: s('Insert a German letter', 'Вмъкни немска буква'),
  exerciseShowTranslation: s('Show the explanation', 'Покажи обяснението'),
  exerciseHideTranslation: s('Hide the explanation', 'Скрий обяснението'),
  exerciseSupportAdded: s(
    'Adding a little support — you will come back to full recall.',
    'Добавям малко помощ — ще се върнеш към пълното припомняне.',
  ),
  exerciseSupportRemoved: s('Support removed — back to full recall.', 'Помощта е премахната — обратно към пълното припомняне.'),

  // Feedback
  feedbackYourAnswer: s('You wrote', 'Ти написа'),
  feedbackExpected: s('Expected', 'Очаквано'),
  feedbackWordByWord: s('Word by word', 'Дума по дума'),

  // Review
  reviewTitle: s('Review queue', 'Опашка за повторение'),
  reviewDueCount: s('{n} due now', '{n} за сега'),
  reviewNothingDue: s('Nothing is due', 'Нищо не е дължимо'),
  reviewNothingDueBody: s(
    'Your queue is empty. You can still practise early, or carry on with the course.',
    'Опашката ти е празна. Можеш да упражняваш предварително или да продължиш с курса.',
  ),
  reviewPracticeEarly: s('Practise early', 'Упражнявай предварително'),
  reviewStart: s('Start reviewing', 'Започни повторение'),
  reviewWhyDue: s('Why is this due?', 'Защо е за повторение?'),
  reviewReasonNew: s('New — just taught', 'Ново — току-що преподадено'),
  reviewReasonLearning: s('Still being learnt', 'Още се учи'),
  reviewReasonLapsed: s('Forgotten last time', 'Забравено последния път'),
  reviewReasonScheduled: s('Scheduled for today', 'Планирано за днес'),
  reviewReasonOverdue: s('Overdue', 'Просрочено'),
  reviewGradeAgain: s('Again', 'Отначало'),
  reviewGradeHard: s('Hard', 'Трудно'),
  reviewGradeGood: s('Good', 'Добре'),
  reviewGradeEasy: s('Easy', 'Лесно'),
  reviewGradePrompt: s('How did that feel?', 'Как ти се стори?'),
  reviewNext: s('Next review', 'Следващо повторение'),
  reviewStateNew: s('New', 'Ново'),
  reviewStateLearning: s('Learning', 'Учи се'),
  reviewStateKnown: s('Known', 'Научено'),
  reviewStateLapsed: s('Lapsed', 'Забравено'),

  // Vocabulary
  vocabTitle: s('Vocabulary', 'Речник'),
  vocabSearch: s('Search German, English or Bulgarian', 'Търси на немски, английски или български'),
  vocabAll: s('All words', 'Всички думи'),
  vocabLearning: s('Learning', 'Учи се'),
  vocabKnown: s('Known', 'Научени'),
  vocabDue: s('Due', 'За повторение'),
  vocabFavorites: s('Favourites', 'Любими'),
  vocabMistakes: s('Mistakes', 'Грешки'),
  vocabNew: s('Not started', 'Незапочнати'),
  vocabFilterLevel: s('Level', 'Ниво'),
  vocabFilterUnit: s('Unit', 'Раздел'),
  vocabFilterLesson: s('Lesson', 'Урок'),
  vocabFilterTopic: s('Topic', 'Тема'),
  vocabFilterType: s('Word type', 'Вид дума'),
  vocabFilterGender: s('Gender', 'Род'),
  vocabFilterAny: s('Any', 'Всички'),
  vocabEmpty: s('No words match those filters.', 'Няма думи, отговарящи на тези филтри.'),
  vocabCount: s('{n} words', '{n} думи'),
  vocabCountOne: s('{n} word', '{n} дума'),
  vocabFavorite: s('Add to favourites', 'Добави в любими'),
  vocabUnfavorite: s('Remove from favourites', 'Премахни от любими'),

  // Word detail
  wordArticle: s('Article', 'Член'),
  wordGender: s('Gender', 'Род'),
  wordPlural: s('Plural', 'Множествено число'),
  wordType: s('Word type', 'Вид дума'),
  wordPronunciation: s('Pronunciation', 'Изговор'),
  wordExamples: s('Example', 'Пример'),
  wordLevel: s('CEFR level', 'CEFR ниво'),
  wordGrammar: s('Grammatical notes', 'Граматични бележки'),
  wordRelated: s('Related words', 'Свързани думи'),
  wordCollocations: s('Common combinations', 'Чести съчетания'),
  wordLearningState: s('Learning state', 'Състояние на учене'),
  wordNextReview: s('Next review', 'Следващо повторение'),
  wordMistakeHistory: s('Your mistakes with this word', 'Твоите грешки с тази дума'),
  wordMasteryHistory: s('Recall history', 'История на припомнянето'),
  wordSuccesses: s('{n} successful recalls', '{n} успешни припомняния'),
  wordSuccessesOne: s('{n} successful recall', '{n} успешно припомняне'),
  wordFailures: s('{n} failed recalls', '{n} неуспешни припомняния'),
  wordFailuresOne: s('{n} failed recall', '{n} неуспешно припомняне'),
  wordNoHistory: s('Not practised yet.', 'Още не е упражнявана.'),
  wordNoMistakes: s('No mistakes recorded with this word.', 'Няма записани грешки с тази дума.'),
  wordGenderM: s('masculine', 'мъжки род'),
  wordGenderF: s('feminine', 'женски род'),
  wordGenderN: s('neuter', 'среден род'),

  // Mistakes
  mistakesTitle: s('Mistake bank', 'Банка с грешки'),
  mistakesSubtitle: s(
    'Everything here comes from your own answers. It exists so you can practise it, not to keep score against you.',
    'Всичко тук идва от твоите отговори. Съществува, за да го упражняваш, не за да ти се води сметка.',
  ),
  mistakesEmpty: s('No mistakes recorded yet.', 'Още няма записани грешки.'),
  mistakesOccurrences: s('{n}×', '{n}×'),
  mistakesCorrected: s('retyped correctly {n}×', 'пренаписано правилно {n}×'),
  mistakesPractise: s('Practise these', 'Упражнявай тези'),
  mistakesPractiseCategory: s('Practise this kind', 'Упражнявай този вид'),
  mistakesCategoryIntro: s(
    'Practice for a whole kind of mistake uses the course\u2019s own tasks for that skill, not a replay of the sentences you got wrong.',
    'Упражнението за цял вид грешка използва задачите на курса за това умение, а не повторение на изреченията, които си сбъркал.',
  ),
  mistakesResolve: s('Mark as sorted', 'Отбележи като решено'),
  mistakesByCategory: s('By kind of mistake', 'По вид грешка'),
  mistakesRecent: s('Most recent', 'Най-скорошни'),
  mistakesYouWrote: s('you wrote', 'ти написа'),
  mistakesCorrectIs: s('correct is', 'правилното е'),

  // Real life
  realLifeTitle: s('Real life', 'Реален живот'),
  realLifeSubtitle: s(
    'Scenarios planned for SatzWerk, each scaled across CEFR levels. None of these are playable yet — this is the roadmap, not a finished section.',
    'Сценарии, планирани за SatzWerk, всеки степенуван по CEFR нивата. Нито един още не може да се играе — това е пътната карта, не завършен раздел.',
  ),
  realLifeRegister: s('Register', 'Стил'),
  realLifeRelated: s('Language already covered in', 'Езикът вече е покрит в'),
  realLifeStages: s('By level', 'По ниво'),

  // Coach
  coachTitle: s('German Coach', 'Немски наставник'),
  coachSubtitle: s('Write German, get it checked.', 'Напиши немски и го провери.'),
  coachAiStatus: s('AI status', 'Състояние на AI'),
  coachNoAi: s(
    'No AI provider is connected, so there is no language model behind this. What you get instead is a set of deterministic checks, listed below, which are real.',
    'Няма свързан AI доставчик, така че зад това не стои езиков модел. Вместо това получаваш набор от детерминистични проверки, изброени по-долу, които са истински.',
  ),
  coachInput: s('Your German', 'Твоят немски'),
  coachCheck: s('Check my German', 'Провери немския ми'),
  coachChecksApplied: s('Checks applied', 'Приложени проверки'),
  coachFindings: s('Findings', 'Бележки'),
  coachNoFindings: s(
    'None of the checks found a problem. That is not the same as "this is perfect" — the checks are limited.',
    'Никоя от проверките не откри проблем. Това не значи „това е съвършено“ — проверките са ограничени.',
  ),
  coachUnknownWords: s('Words I do not know and did not judge', 'Думи, които не познавам и не съдя'),
  coachSuggestion: s('Suggested', 'Предложено'),
  coachPlannedTitle: s('Planned, not built', 'Планирано, но не направено'),
  coachPlannedBody: s(
    'Free conversation, model-written explanations, generated practice and pronunciation scoring all have interfaces in the codebase and no implementation. They are honestly marked as planned rather than shown as broken buttons.',
    'Свободният разговор, обясненията от модел, генерираните упражнения и оценяването на изговора имат интерфейси в кода, но няма реализация. Отбелязани са честно като планирани, а не показани като неработещи бутони.',
  ),

  // Settings
  settingsTitle: s('Settings', 'Настройки'),
  settingsLanguage: s('Teaching language', 'Език на обучение'),
  settingsLanguageNote: s(
    'German stays the target language. Switching does not affect your progress.',
    'Немският остава целевият език. Смяната не влияе на напредъка ти.',
  ),
  settingsDailyTarget: s('Daily target', 'Дневна цел'),
  settingsCustom: s('Custom', 'По избор'),
  settingsMinutes: s('{n} minutes', '{n} минути'),
  settingsMinutesOne: s('{n} minute', '{n} минута'),
  settingsAudio: s('Audio', 'Звук'),
  settingsVoice: s('Voice in use', 'Използван глас'),
  settingsData: s('Your data', 'Твоите данни'),
  settingsDataNote: s(
    'Progress is stored in a SQLite database on this machine, so it survives a refresh and a restart.',
    'Напредъкът се пази в база данни SQLite на тази машина, така че остава след презареждане и рестарт.',
  ),
  settingsReset: s('Delete all progress', 'Изтрий целия напредък'),
  settingsResetConfirm: s(
    'This permanently deletes every attempt, review item and mistake. Type DELETE to confirm.',
    'Това изтрива безвъзвратно всеки опит, елемент за повторение и грешка. Напиши DELETE за потвърждение.',
  ),
  settingsResetDone: s('Progress deleted.', 'Напредъкът е изтрит.'),
  settingsContent: s('What is actually built', 'Какво е наистина направено'),

  // Generic
  loading: s('Loading…', 'Зарежда…'),
  errorTitle: s('Something went wrong', 'Нещо се обърка'),
  errorOffline: s(
    'Could not reach the SatzWerk server. Is it running?',
    'Не може да се стигне до сървъра на SatzWerk. Работи ли?',
  ),
  retry: s('Try again', 'Опитай пак'),
  cancel: s('Cancel', 'Отказ'),
  close: s('Close', 'Затвори'),
  save: s('Save', 'Запази'),
  saved: s('Saved', 'Запазено'),
  yes: s('Yes', 'Да'),
  no: s('No', 'Не'),
  of: s('of', 'от'),
  minutesShort: s('min', 'мин'),
} as const;

export type UiKey = keyof typeof UI;

/**
 * Look up an interface string and fill in any {placeholders}.
 *
 * Counters are pluralised by convention: when a key has a sibling named
 * `<key>One` and the {n} placeholder is filled with 1, the singular form is
 * used instead. Bulgarian and English both need this ("1 ден", not "1 дни"),
 * and keeping it here means no call site has to remember.
 */
export function tr(key: UiKey, lang: TeachingLanguage, vars?: Record<string, string | number>): string {
  const singular = `${key}One`;
  const resolved =
    Number(vars?.n) === 1 && singular in UI ? (singular as UiKey) : key;
  let text = UI[resolved][lang];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Human-readable names for the error categories, in both paths. */
export const CATEGORY_LABELS: Record<ErrorCategory, Bilingual> = {
  spelling: s('Spelling', 'Правопис'),
  capitalization: s('Capital letters', 'Главни букви'),
  article: s('Article', 'Член'),
  gender: s('Gender', 'Род'),
  case: s('Case', 'Падеж'),
  'verb-conjugation': s('Verb ending', 'Окончание на глагола'),
  'verb-tense': s('Tense', 'Време'),
  'auxiliary-verb': s('Auxiliary verb', 'Спомагателен глагол'),
  'word-order': s('Word order', 'Словоред'),
  preposition: s('Preposition', 'Предлог'),
  vocabulary: s('Vocabulary', 'Речник'),
  plural: s('Plural', 'Множествено число'),
  'adjective-ending': s('Adjective ending', 'Окончание на прилагателното'),
  pronoun: s('Pronoun', 'Местоимение'),
  punctuation: s('Punctuation', 'Пунктуация'),
  'missing-word': s('Missing word', 'Липсваща дума'),
  'extra-word': s('Extra word', 'Излишна дума'),
  umlaut: s('Special letters', 'Специални букви'),
  unknown: s('Other', 'Друго'),
};

export const WORD_TYPE_LABELS: Record<string, Bilingual> = {
  noun: s('noun', 'съществително'),
  verb: s('verb', 'глагол'),
  adjective: s('adjective', 'прилагателно'),
  adverb: s('adverb', 'наречие'),
  pronoun: s('pronoun', 'местоимение'),
  article: s('article', 'член'),
  preposition: s('preposition', 'предлог'),
  conjunction: s('conjunction', 'съюз'),
  numeral: s('numeral', 'числително'),
  phrase: s('phrase', 'израз'),
  interjection: s('interjection', 'междуметие'),
  particle: s('particle', 'частица'),
};
