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
  navSession: s('Round', 'Кръг'),
  navCourse: s('Course', 'Курс'),
  navReview: s('Review', 'Повторение'),
  navVocabulary: s('Vocabulary', 'Речник'),
  navMistakes: s('Mistakes', 'Грешки'),
  navRealLife: s('Real life', 'Реален живот'),
  navCoach: s('Coach', 'Наставник'),
  navSettings: s('Settings', 'Настройки'),
  navMore: s('More', 'Още'),
  moreTitle: s('Everything else', 'Всичко останало'),
  moreVocabulary: s('Every word you have met, and how well you know it', 'Всяка дума, която си срещал, и колко добре я знаеш'),
  moreMistakes: s('What keeps going wrong, and practice aimed at it', 'Какво все се обърква, и упражнения точно за него'),
  moreRealLife: s('Conversations at the bakery, the doctor, the Bürgeramt', 'Разговори в пекарната, при лекаря, в Bürgeramt'),
  moreCoach: s('Check a piece of your own writing', 'Провери нещо, което си написал сам'),
  moreSettings: s('Teaching path, daily target, who is studying', 'Път на обучение, дневна цел, кой учи'),

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
    'SatzWerk teaches German step by step, from the very first letters — no German needed to start. You read a little, listen, and then type German yourself. Choose the language for the explanations.',
    'SatzWerk учи немски стъпка по стъпка, от първите букви — не ти трябва немски, за да започнеш. Четеш малко, слушаш и после сам пишеш на немски. Избери езика на обясненията.',
  ),
  onboardingPathEn: s('Explain German to me in English', 'Обяснявай ми немския на английски'),
  onboardingPathBg: s('Explain German to me in Bulgarian', 'Обяснявай ми немския на български'),
  onboardingPathNote: s(
    'The two paths are written separately: the Bulgarian one compares German with Bulgarian wherever that helps, rather than translating the English.',
    'Двата пътя са написани отделно: българският сравнява немския с българския, където това помага, а не превежда английския.',
  ),
  onboardingTarget: s('How much do you want to study each day?', 'Колко искаш да учиш всеки ден?'),
  onboardingStart: s('Start learning', 'Започни да учиш'),
  onboardingChangeLater: s(
    'You can change this at any time in Settings without losing progress.',
    'Можеш да промениш това по всяко време в Настройки, без да загубиш напредъка си.',
  ),

  // Dashboard
  dashboardGreeting: s('Today’s study', 'Днешно учене'),
  todayUpNext: s('Up next', 'Следва'),
  todayGoal: s('of {target} min today', 'от {target} мин днес'),
  todayGoalLeft: s('{n} more to your goal', 'още {n} до целта'),
  todayGoalDone: s('Goal reached', 'Целта е постигната'),
  todayDue: s('{n} due for review', '{n} за повторение'),
  todayNothingDue: s('Nothing due', 'Нищо за повторение'),
  todayReviewNote: s('Review', 'Повторение'),
  todayRoundEmpty: s('Nothing waiting yet', 'Още нищо не чака'),
  todaySeePath: s('See path', 'Виж пътя'),
  todayProgress: s('Your progress', 'Твоят напредък'),
  todayStreak: s('Study streak: {n} days', 'Поредни дни учене: {n}'),
  todayStreakOne: s('Study streak: {n} day', 'Поредни дни учене: {n}'),
  todayLessonDone: s('done', 'готово'),
  todayLessonNow: s('now', 'сега'),
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

  dashboardRound: s('Do the daily round', 'Направи дневния кръг'),

  /*
   * The daily round.
   *
   * A lesson is half an hour; most days are not. The round is the answer to
   * "I have ten minutes" — and because it puts a number of minutes on a
   * button, that number has to be earned rather than guessed, which is what
   * sessionMeasured and sessionDefault are for.
   */
  sessionTitle: s('Daily round', 'Дневен кръг'),
  sessionLede: s(
    'One short round: what is due, what keeps going wrong, and the lesson you are in the middle of.',
    'Един кратък кръг: дължимото, това, което постоянно се обърква, и урокът, който си започнал.',
  ),
  sessionWhatsIn: s('What is in this round', 'Какво има в този кръг'),
  sessionStart: s('Start the round', 'Започни кръга'),
  sessionPartReview: s('Due for review', 'За повторение'),
  sessionPartMistakes: s('Mistakes that keep coming back', 'Повтарящи се грешки'),
  sessionPartLesson: s('From your lesson', 'От твоя урок'),
  sessionAnswers: s('{n} answers', '{n} отговора'),
  sessionAnswersOne: s('{n} answer', '{n} отговор'),
  sessionPartOf: s('Part {n} of {total}', 'Част {n} от {total}'),
  sessionMeasured: s(
    'Estimated at {s}s an answer, which is your own average over {n} answers.',
    'Оценката е по {s} сек. на отговор — това е твоята средна стойност от {n} отговора.',
  ),
  sessionDefault: s(
    'Estimated at {s}s an answer. That is a stated default, not your pace — it becomes yours after {n} answers.',
    'Оценката е по {s} сек. на отговор. Това е предварително зададена стойност, не твоето темпо — става твое след {n} отговора.',
  ),
  sessionTarget: s('Your daily target is {time}. Change it in Settings.', 'Дневната ти цел е {time}. Можеш да я смениш в Настройки.'),
  sessionNothing: s('There is nothing to put in a round', 'Няма какво да се сложи в кръг'),
  sessionNothingBody: s(
    'Nothing is due, no mistake has come back twice, and no lesson is half-finished. Start a lesson, or practise ahead of schedule.',
    'Нищо не е за повторение, нито една грешка не се е повторила, и няма недовършен урок. Започни урок или упражнявай предварително.',
  ),
  sessionMasteryLeft: s(
    'Your lesson has only its final check left. That is taken in one sitting on the lesson page, so it is not in the round.',
    'От урока ти е останала само финалната проверка. Тя се прави наведнъж на страницата на урока, затова не е в кръга.',
  ),
  sessionFinished: s('Round finished', 'Кръгът е завършен'),
  sessionTook: s('It took {time}.', 'Отне ти {time}.'),
  sessionAgain: s('Another round', 'Още един кръг'),
  sessionOpenLesson: s('Open the lesson', 'Отвори урока'),

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
  /*
   * This said "Planned — not built yet" until speaking was built, at which
   * point it became false in the other direction. Speaking is real; what does
   * not exist is a count of it, because saying a sentence aloud happens after
   * the answer is already right and would distort accuracy if folded in. So
   * the row describes what is there and claims no progress.
   */
  skillSpeakingUncounted: s(
    'Say it — after a correct answer. Not counted as progress.',
    'Кажи го — след верен отговор. Не се брои като напредък.',
  ),

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
  lessonContinueReading: s('Continue reading', 'Продължи с четенето'),
  lessonContinueExercises: s('Continue the exercises', 'Продължи с упражненията'),
  lessonReadAgain: s('Read the lesson again', 'Прочети урока отново'),
  lessonReplay: s('Practise again', 'Упражнявай отново'),
  lessonMasteryRetry: s('Try the check again', 'Опитай проверката отново'),
  checkpointPassed: s('Checkpoint passed', 'Контролната точка е взета'),
  checkpointFailed: s(
    'Not passed yet. Nothing is lost — go over the unit again, or try it once more.',
    'Още не е взета. Нищо не е загубено — прегледай раздела отново или опитай пак.',
  ),
  checkpointAgain: s('Try it again', 'Опитай отново'),
  lessonRequirements: s('To complete this lesson', 'За да завършиш урока'),
  lessonCompleted: s('Lesson completed', 'Урокът е завършен'),
  lessonSections: s('Teaching sections', 'Учебни раздели'),
  lessonNextSection: s('Next', 'Напред'),
  lessonPrevSection: s('Back', 'Назад'),
  lessonToExercises: s('Start the exercises', 'Към упражненията'),
  lessonSectionRead: s('Read', 'Прочетено'),
  lessonWordList: s('Words in this section', 'Думи в този раздел'),
  lessonSummary: s('Summary', 'Резюме'),
  lessonMastery: s('Final check', 'Финална проверка'),
  lessonMasteryIntro: s(
    'A few questions from this lesson, without hints. One slip is allowed.',
    'Няколко въпроса от урока, без подсказки. Една грешка е позволена.',
  ),
  lessonDoneTitle: s('Lesson complete', 'Урокът е завършен'),
  lessonNewWords: s('{n} new words', '{n} нови думи'),
  lessonNewWordsOne: s('{n} new word', '{n} нова дума'),
  lessonFirstTry: s('right first time', 'верни от първи опит'),
  lessonUpNext: s('Next', 'Следва'),
  lessonMasteryPassed: s('Final check passed', 'Финалната проверка е издържана'),
  lessonMasteryFailed: s(
    'Not passed yet. Have another look at the material and try again — nothing is lost.',
    'Още не е издържана. Прегледай материала и опитай пак — нищо не е загубено.',
  ),
  lessonRecovery: s('Quick redo', 'Бързо повторение'),
  lessonRecoveryIntro: s(
    'These were tricky the first time. One more go at just these, then the final check.',
    'Тези бяха трудни от първия път. Още веднъж само тях, после финалната проверка.',
  ),
  lessonPhasePractice: s('Practice', 'Упражнения'),
  lessonPhaseMastery: s('Final check', 'Финална проверка'),
  lessonBackToLesson: s('Back to the lesson', 'Обратно към урока'),

  // Exercise player
  exerciseProgress: s('{done} of {total}', '{done} от {total}'),
  exerciseSubmit: s('Check', 'Провери'),
  exerciseContinue: s('Continue', 'Напред'),
  exerciseHint: s('Hint', 'Подсказка'),
  exerciseHintCount: s('Hint {n} of {total}', 'Подсказка {n} от {total}'),
  exerciseNoMoreHints: s('No more hints', 'Няма повече подсказки'),
  exerciseSkip: s('I do not know this one', 'Не знам това'),
  exerciseReplaysLeft: s('{n} replays left', 'остават {n} повторения'),
  exerciseReplaysLeftOne: s('{n} replay left', 'остава {n} повторение'),
  exerciseReplaysGone: s('No replays left — answer what you heard', 'Няма повече повторения — напиши каквото чу'),
  // Answers typed while the server could not be reached
  syncTitle: s('Not saved yet', 'Още не са запазени'),
  syncPending: s('{n} answers are waiting', 'Чакат {n} отговора'),
  syncPendingOne: s('{n} answer is waiting', 'Чака {n} отговор'),
  syncExplain: s(
    'They were checked the moment you typed them. They reach the database as soon as there is a connection again.',
    'Проверени са още щом ги написа. Ще стигнат до базата веднага щом има връзка.',
  ),
  syncOther: s(
    '{n} finished pieces of work are waiting too — a lesson result, a round, a conversation.',
    'Чакат и {n} завършени неща — резултат от урок, кръг или разговор.',
  ),
  syncOtherOne: s(
    '{n} finished piece of work is waiting too — a lesson result, a round or a conversation.',
    'Чака и {n} завършено нещо — резултат от урок, кръг или разговор.',
  ),
  syncNow: s('Try now', 'Опитай сега'),
  syncWorking: s('Sending…', 'Изпраща се…'),
  syncAtRisk: s(
    'This browser is not storing them, so closing the app would lose them.',
    'Този браузър не ги запазва — ако затвориш приложението, ще се загубят.',
  ),
  syncRefused: s(
    'The server refused {n} answers or results, so they cannot be saved.',
    'Сървърът отказа {n} отговора или резултата и те не могат да бъдат запазени.',
  ),
  syncRefusedOne: s(
    'The server refused {n} answer or result, so it cannot be saved.',
    'Сървърът отказа {n} отговор или резултат и той не може да бъде запазен.',
  ),
  syncLost: s(
    '{n} answers or results could not be kept — there was no room left.',
    'Не успяхме да запазим {n} отговора или резултата — нямаше повече място.',
  ),
  syncLostOne: s(
    '{n} answer or result could not be kept — there was no room left.',
    'Не успяхме да запазим {n} отговор или резултат — нямаше повече място.',
  ),
  syncDismiss: s('Understood', 'Разбрах'),

  /*
   * Writes nobody holds a queue for.
   *
   * A typed answer waits in the outbox, because losing one would lose work.
   * A preference is different: it is cheap to set again, and holding it would
   * mean the app quietly disagreeing with the database about what the daily
   * target is. So these are not held — but they are not swallowed either.
   * Before this, going offline and tapping the star threw an uncaught error
   * into the console, the star stayed empty, and the app said nothing at all.
   */
  notSavedTitle: s('That did not save', 'Това не се запази'),
  notSavedReason: s(
    'The server could not be reached, so nothing was changed. Try again in a moment.',
    'Сървърът е недостъпен, така че нищо не беше променено. Опитай пак след малко.',
  ),
  notSavedFavorite: s('The word was not starred.', 'Думата не беше отбелязана.'),
  notSavedProfile: s('The setting was not changed.', 'Настройката не беше променена.'),
  notSavedMistake: s('The mistake was not put away.', 'Грешката не беше отметната.'),
  notSavedLearner: s('The learner list was not changed.', 'Списъкът с учащи не беше променен.'),
  notSavedReset: s('Nothing was deleted.', 'Нищо не беше изтрито.'),
  notSavedReviews: s('The review items were not created.', 'Повторенията не бяха създадени.'),

  exerciseReveal: s('Show the answer', 'Покажи отговора'),
  exerciseRevealType: s(
    'Now type it yourself — typing it is what makes it stay.',
    'Сега го напиши сам — писането е това, което го запомня.',
  ),
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

  // Reminders. Every state is named separately because the fixes are
  // completely different: install the app, change a browser setting, or
  // configure the server. "Couldn't turn on notifications" would help nobody.
  remindersTitle: s('Reminders', 'Напомняния'),
  remindersWhat: s(
    'A notification when review is actually due — and nothing on the days when it is not.',
    'Известие, когато наистина има какво да повториш — и нищо в дните, когато няма.',
  ),
  remindersOn: s('Reminders are on', 'Напомнянията са включени'),
  remindersOff: s('Reminders are off', 'Напомнянията са изключени'),
  remindersEnable: s('Turn on reminders', 'Включи напомнянията'),
  remindersDisable: s('Turn off', 'Изключи'),
  remindersNeedsInstall: s(
    'Add SatzWerk to your Home Screen first — on iPhone, notifications only work for an installed app.',
    'Първо добави SatzWerk към началния екран — на iPhone известията работят само за инсталирано приложение.',
  ),
  remindersUnsupported: s(
    'This browser cannot receive notifications.',
    'Този браузър не може да получава известия.',
  ),
  remindersNotConfigured: s(
    'Not configured on the server, so there is nothing to switch on yet.',
    'Не е настроено на сървъра, така че още няма какво да се включи.',
  ),
  remindersDenied: s(
    'Notifications are blocked for this app. Allow them in your device settings, then come back.',
    'Известията са блокирани за това приложение. Разреши ги в настройките на устройството и се върни.',
  ),
  remindersHonest: s(
    'One a day at most, only when something is due. No streaks, no nagging.',
    'Най-много едно на ден и само когато има какво да се повтаря. Без серии, без досаждане.',
  ),
  // Shown when the browser refuses the subscription outright. Without it a tap
  // on "Turn on reminders" left the card exactly as it was, which reads as the
  // app being broken rather than the browser saying no.
  remindersWorking: s('Setting up…', 'Настройва се…'),
  remindersFailed: s(
    'Your browser would not set this up: {reason}',
    'Браузърът ти отказа да го настрои: {reason}',
  ),

  // Asking why an answer was wrong. The label is not decoration: a generated
  // explanation sitting unlabelled beside an authored one would make the
  // authored one worth less, because the learner could no longer tell which
  // is which.
  explainAsk: s('Why was this wrong?', 'Защо това е грешно?'),
  explainAsking: s('Asking…', 'Пита се…'),
  explainGenerated: s(
    'Written by a language model, not by the course. It can be wrong.',
    'Написано от езиков модел, не от курса. Може да е грешно.',
  ),
  explainFailed: s(
    'No explanation came back. Your answer and your progress are unaffected.',
    'Не се върна обяснение. Отговорът и напредъкът ти не са засегнати.',
  ),

  // Speaking. The wording is careful on purpose: the app checks whether a
  // recogniser understood the words, which is not the same as scoring an
  // accent, and it says so rather than implying more than it can do.
  speakTry: s('Say it', 'Кажи го'),
  speakAgain: s('Say it again', 'Кажи го пак'),
  speakListening: s('Listening…', 'Слушам…'),
  speakSay: s('Say it', 'Кажи го'),
  speakSayHint: s(
    'That is what the recogniser heard. Read it, fix anything it got wrong, and send it — a machine mishearing you should never be marked against you.',
    'Това чу разпознавателят. Прочети го, оправи каквото е разбрал грешно и го изпрати — грешка на машината не трябва да се пише на твоя сметка.',
  ),
  speakStop: s('Stop', 'Спри'),
  speakHeard: s('Heard', 'Чух'),
  speakUnderstood: s('Understood — that is the sentence.', 'Разбрано — това е изречението.'),
  speakNotQuite: s('That is not the sentence yet.', 'Това още не е изречението.'),
  speakWhatItMeans: s(
    'This checks whether a speech recogniser understood your words. It is not a score for your accent, and it can mishear you.',
    'Това проверява дали програмата за разпознаване е разбрала думите ти. Не е оценка на произношението и може да те чуе погрешно.',
  ),
  speakDenied: s(
    'The microphone is blocked. Allow it for this site and try again.',
    'Микрофонът е блокиран. Разреши го за този сайт и опитай пак.',
  ),
  speakNoSpeech: s('Nothing was heard. Try again.', 'Нищо не се чу. Опитай пак.'),
  speakNoMatch: s('Nothing was recognised. Try again.', 'Нищо не беше разпознато. Опитай пак.'),
  speakNetwork: s(
    'The recogniser could not be reached. It needs a connection.',
    'Разпознаването не можа да се свърже. Нужен е интернет.',
  ),
  speakFailed: s('The recogniser stopped. Try again.', 'Разпознаването спря. Опитай пак.'),
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
  // A tapped card was chosen, not written.
  feedbackYourChoice: s('You chose', 'Ти избра'),
  feedbackExpected: s('Expected', 'Очаквано'),
  feedbackWordByWord: s('Word by word', 'Дума по дума'),

  // Review
  reviewTitle: s('Review', 'Преговор'),
  reviewDueCount: s('{n} due now', '{n} за сега'),
  reviewNothingDue: s('Nothing is due', 'Нищо не е дължимо'),
  reviewRoundSize: s('{n} in this round', '{n} в този кръг'),
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
  reviewStateLapsed: s('Forgotten', 'Забравено'),

  // Vocabulary
  vocabTitle: s('Vocabulary', 'Речник'),
  vocabFilters: s('Filters', 'Филтри'),
  vocabShowMore: s('Show {n} more', 'Покажи още {n}'),
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
  wordPerfect: s('Perfekt', 'Perfekt (минало време)'),
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

  onboardingKnowSome: s(
    'Already speak some German?',
    'Вече говориш малко немски?',
  ),

  // Placement: where should I start?
  placementNav: s('Where to start', 'Откъде да започна'),
  placementIntroTitle: s('Twenty questions, four per level', 'Двайсет въпроса, по четири на ниво'),
  placementHonesty: s(
    'This is not an exam and it does not certify anything. Twenty questions can tell you roughly which level will not bore you and will not drown you, and the result shows you the working so you can disagree with it.',
    'Това не е изпит и не удостоверява нищо. Двайсет въпроса могат да ти подскажат приблизително кое ниво няма да те отегчи и няма да те удави, а резултатът ти показва сметката, за да можеш да не се съгласиш с нея.',
  ),
  placementStart: s('Start the check', 'Започни проверката'),
  placementSkip: s('Skip it, I will choose myself', 'Пропусни, ще избера сам'),
  placementResultTitle: s('What the answers suggest', 'Какво подсказват отговорите'),
  placementStartAt: s('Start at', 'Започни от'),
  placementBands: s('By level', 'По ниво'),
  placementBandKnown: s('you had this', 'това го имаш'),
  placementBandGap: s('the first gap', 'първата дупка'),
  placementBandNotYet: s('not yet', 'още не'),
  placementCaveat: s(
    'Derived from {asked} answers, which is enough to point at a level and not enough to be sure of one.',
    'Изведено от {asked} отговора — достатъчно, за да посочи ниво, но не и за да бъде сигурно в него.',
  ),
  placementToppedOut: s(
    'You answered every level, including B2. The check has nothing harder to ask, which means it cannot tell you where you are — only that it is at or above the top of this course.',
    'Отговори на всички нива, включително B2. Проверката няма какво по-трудно да пита, тоест не може да ти каже къде си — само че е на върха на този курс или над него.',
  ),
  placementOpenFirstLesson: s('Open the first lesson', 'Отвори първия урок'),
  placementSeeCourse: s('See the whole course', 'Виж целия курс'),
  placementDisagree: s('Not right? Start here instead:', 'Не е вярно? Започни оттук:'),
  placementAgain: s('Take it again', 'Направи я пак'),

  // Real life
  realLifeTitle: s('Real life', 'Реален живот'),
  realLifeSubtitle: s(
    'One room, one conversation, and someone who answers back. A lesson tells you what to say; here the other person decides it.',
    'Една стая, един разговор и някой, който ти отговаря. Урокът ти казва какво да кажеш; тук другият човек го решава.',
  ),
  realLifeRegister: s('Register', 'Стил'),
  realLifeRelated: s('Language already covered in', 'Езикът вече е покрит в'),
  realLifeStages: s('By level', 'По ниво'),
  realLifePlayable: s('Playable now', 'Може да се играе'),
  realLifeOutlineOnly: s('Designed, not written yet', 'Проектирано, още не написано'),
  realLifePlay: s('Play', 'Играй'),
  realLifeReplay: s('Play again', 'Играй пак'),
  realLifeNotWritten: s('Not written yet', 'Още не е написано'),
  realLifeDoneTimes: s('Played {n} times', 'Изигран {n} пъти'),
  realLifeDoneTimesOne: s('Played {n} time', 'Изигран {n} път'),
  realLifeBest: s('best {percent}% first time', 'най-добре {percent}% от първи опит'),
  realLifeNothingPlayed: s(
    'You have not played any of these yet.',
    'Още не си играл нито един от тези.',
  ),

  // A scenario, played
  scenarioPartner: s('You are talking to', 'Говориш с'),
  scenarioGoal: s('What you want', 'Какво искаш'),
  scenarioRegisterSie: s(
    'This whole conversation is in Sie. You decide that once, at the door.',
    'Целият разговор е на „Sie“. Решаваш го веднъж, на вратата.',
  ),
  scenarioRegisterDu: s(
    'This whole conversation is in du.',
    'Целият разговор е на „du“.',
  ),
  scenarioTurns: s('{n} things to say', '{n} реплики'),
  scenarioTurnsOne: s('{n} thing to say', '{n} реплика'),
  scenarioStart: s('Start the conversation', 'Започни разговора'),
  scenarioMeaning: s('What did that mean?', 'Какво значеше това?'),
  scenarioYou: s('You', 'Ти'),
  scenarioNarrator: s('Meanwhile', 'Междувременно'),
  scenarioLeave: s('Walk out', 'Излез'),
  scenarioFinishedTitle: s('You got through it', 'Мина през него'),
  scenarioScore: s(
    '{correct} of {total} said right first time.',
    '{correct} от {total} казани правилно от първи опит.',
  ),
  scenarioAgain: s('Play it again', 'Изиграй го пак'),
  scenarioBackToList: s('Back to Real life', 'Обратно към Реален живот'),
  lessonMissing: s('That lesson is not in the course. The link may be from an older version.', 'Този урок не е в курса. Връзката може да е от по-стара версия.'),
  checkpointMissing: s('That check is not in the course. The link may be from an older version.', 'Тази проверка не е в курса. Връзката може да е от по-стара версия.'),
  wordMissing: s('That word is not in the vocabulary. The link may be from an older version.', 'Тази дума не е в речника. Връзката може да е от по-стара версия.'),
  scenarioMissing: s('That conversation is not written yet.', 'Този разговор още не е написан.'),

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
  coachAbilitiesTitle: s('What the coach can do', 'Какво може наставникът'),
  coachAbilityWriting: s('Check sentences you write', 'Проверява изречения, които пишеш'),
  coachAbilityExplain: s('Explain a mistake in more depth', 'Обяснява грешка по-подробно'),
  coachAbilitySpeaking: s('Hear you say a sentence', 'Чува те, когато кажеш изречение'),
  coachAbilityPronunciation: s('Score your accent', 'Оценява акцента ти'),
  coachAbilityPractice: s('Make up new practice sentences', 'Измисля нови изречения за упражнение'),
  coachAbilityConversation: s('Hold a free conversation', 'Води свободен разговор'),
  coachCanYes: s('Yes', 'Да'),
  coachCanYesAi: s('Yes, with AI', 'Да, с ИИ'),
  coachCanNotYet: s('Not yet', 'Още не'),
  coachCanNotHere: s('Not in this browser', 'Не в този браузър'),
  coachCanNever: s('No, on purpose', 'Не, нарочно'),
  coachAbilitiesBody: s(
    'Every German sentence in this app has been read by a person. Invented sentences could teach you a mistake without you noticing, so the coach does not make them up.',
    'Всяко немско изречение в приложението е прочетено от човек. Измислените изречения могат да те научат на грешка, без да забележиш, затова наставникът не ги измисля.',
  ),

  // Settings
  settingsTitle: s('Settings', 'Настройки'),
  // Who is studying — a household switch, not a second password
  learnersTitle: s('Who is studying?', 'Кой учи?'),
  learnersNote: s(
    'Each person keeps their own progress, their own reviews and their own teaching path. This device remembers who you are, so you only pick once.',
    'Всеки пази своя напредък, своите повторения и своя път на преподаване. Това устройство помни кой си, така че избираш само веднъж.',
  ),
  learnersNotAWall: s(
    'This is not a lock. Anybody who can open the app can switch between you — it keeps your work apart, not private.',
    'Това не е ключалка. Всеки, който може да отвори приложението, може да сменя между вас — разделя работата, не я скрива.',
  ),
  learnersStudying: s('studying now', 'учи сега'),
  learnersSwitch: s('Hand over', 'Подай нататък'),
  learnersAdd: s('Add somebody', 'Добави някого'),
  learnersName: s('Their name', 'Името им'),
  learnersSave: s('Add', 'Добави'),
  learnersRename: s('Rename', 'Преименувай'),
  learnersWaiting: s(
    'Not yet — {n} answers are still waiting to be saved, and they belong to whoever typed them. Try again once they are in.',
    'Още не — {n} отговора чакат да бъдат запазени и принадлежат на онзи, който ги е написал. Опитай пак, щом влязат.',
  ),
  learnersWaitingOne: s(
    'Not yet — {n} answer is still waiting to be saved, and it belongs to whoever typed it. Try again once it is in.',
    'Още не — {n} отговор чака да бъде запазен и принадлежи на онзи, който го е написал. Опитай пак, щом влезе.',
  ),
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
  voiceAutomatic: s('Automatic: {name}', 'Автоматично: {name}'),
  voiceQualityPremium: s('natural', 'естествен'),
  voiceQualityGood: s('good', 'добър'),
  voiceSample: s('Play a sample', 'Пусни пример'),
  voiceTipTitle: s('A better German voice, free', 'По-добър немски глас, безплатно'),
  voiceTipIphone: s(
    'iPhone: Settings → Accessibility → Spoken Content (Read & Speak) → Voices → German → download “Anna (Premium)” or “Helena (Premium)”. Then reopen the app.',
    'iPhone: Настройки → Достъпност → Изговорено съдържание (Четене и говорене) → Гласове → Немски → изтегли „Anna (Premium)“ или „Helena (Premium)“. След това отвори приложението отново.',
  ),
  voiceTipAndroid: s(
    'Android: Settings → System → Languages → Text-to-speech → Speech Services by Google → Install voice data → German.',
    'Android: Настройки → Система → Езици → Синтезиран говор → Услуги за говор от Google → Инсталиране на гласови данни → Немски.',
  ),
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
  /*
   * No signal is not a fault.
   *
   * Opened in a tunnel, the app used to show "Something went wrong" over a
   * developer's question — "Is it running?" — about a server the learner has
   * never thought about. Nothing has gone wrong when a train goes underground,
   * and the app now says the true thing instead: it is here, it cannot reach
   * the progress, and nothing typed will be lost.
   */
  offlineTitle: s('No connection', 'Няма връзка'),
  offlineBody: s(
    'SatzWerk is here, but it cannot reach your progress right now. It will load by itself as soon as there is a connection again.',
    'SatzWerk е тук, но в момента не може да стигне до напредъка ти. Ще се зареди сам, щом има връзка.',
  ),
  offlineWaiting: s(
    '{n} answers are waiting to be saved. They are kept and will be sent when there is a connection.',
    '{n} отговора чакат да бъдат запазени. Пазят се и ще бъдат изпратени, щом има връзка.',
  ),
  offlineWaitingOne: s(
    '{n} answer is waiting to be saved. It is kept and will be sent when there is a connection.',
    '{n} отговор чака да бъде запазен. Пази се и ще бъде изпратен, щом има връзка.',
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
