import { Link } from 'react-router-dom';
import { SCENARIOS, checkpointById, contentStats, scriptById, unitForLesson } from '../../content/browser.ts';
import { todayHere } from '../../core/progress/days.ts';
import { estimatedMinutes, planSession, secondsPerAnswer } from '../../core/progress/session.ts';
import { summarizeQueue } from '../../core/srs/scheduler.ts';
import { UI, type UiKey } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, Meter, Stat, formatDuration } from '../components/bits.tsx';
import { Icon } from '../components/icons.tsx';
import { inferredPracticeLevel } from '../components/LearningPreferences.tsx';
import { PracticalProgress } from '../components/PracticalProgress.tsx';
import { Rhythm } from '../components/Rhythm.tsx';
import { DackelScene } from '../components/Dackel.tsx';
import { WoodScene } from '../three/WoodScene.tsx';
import { todayTown } from '../three/sceneData.ts';
import { chooseDailyScript } from '../dailyBuilder.ts';
import { reviewItemsForPath } from '../reviewBuilder.ts';
import {
  DAILY_STAGES,
  buildLessonViews,
  buildVocabViews,
  earlyReviewExercises,
  sessionBuild,
  skillProgress,
  fitsDailyPlan,
  todayStep,
  type NextAction,
} from '../selectors.ts';

/**
 * Today: the one thing worth doing next, and nothing that competes with it.
 *
 * The page said so here for a long time while opening on four starts of equal
 * weight: the daily practice, the next lesson, the round and early review, and
 * the practice card said "Start today" after the practice was done. Now one
 * card at the top holds the day's one step, chosen by todayStep from what the
 * learner has really done, with one quiet link to what follows it. Once the
 * daily goal is met the card says so, says what was done, and offers more
 * without asking for it. Everything below it is a tile or a link, never a
 * second button of the same weight. On the day back from a break, the card
 * welcomes the learner back with a short warm-up before the day goes on.
 */
export function DashboardPage() {
  const { t, say, lang, lessons, reviewItems, mistakes, favorites, stats, studyDays, profile, checkpointResults, dailyRuns,
    scenarioRuns } = useApp();
  const day = todayHere();
  const today = studyDays.find((entry) => entry.day === day);
  const minutesToday = Math.floor((today?.secondsActive ?? 0) / 60);
  const target = Math.max(1, profile.dailyTargetMinutes);

  const onPath = reviewItemsForPath(reviewItems, lang);
  // The conversation the practice page would offer, chosen the way that page
  // chooses it, and the open practice it would continue.
  const goal = profile.learningGoal ?? 'everyday';
  const planScript = chooseDailyScript(goal, profile.practiceLevel ?? inferredPracticeLevel(lessons, checkpointResults),
    scenarioRuns, day);
  const step = todayStep({ lessons, reviewItems: onPath, mistakes, onboarded: profile.onboarded, checkpointResults,
    dailyRuns, minutesToday, targetMinutes: target, studyDays, lang,
    fitsPlan: (run) => fitsDailyPlan(run, planScript.id, goal, profile.practiceLevel) });
  const action = step.course;
  // The same plan the round itself will build, so the two never disagree.
  const round = planSession(
    sessionBuild(lessons, reviewItems, mistakes, new Date(), lang).sources,
    profile.dailyTargetMinutes,
    stats,
  );
  const queue = summarizeQueue(onPath);
  const lessonViews = buildLessonViews(lessons);
  const hasActivity = stats.totalAnswers > 0;

  // Today's conversation: the one under way, or the one the practice page will offer.
  const script = (step.run && scriptById(step.run.scriptId)) || planScript;
  const scenario = SCENARIOS.find((candidate) => candidate.id === script.scenarioId);
  const finished = dailyRuns.find((run) => run.day === day && run.stage >= 5);
  // Nothing answered and no practice begun: the practice is this learner's first German.
  const firstTime = stats.totalAnswers === 0 && dailyRuns.length === 0;

  // A warm-up or a round after a break, timed at this learner's own pace.
  const minutesFor = (answers: number) => Math.max(1, Math.round((answers * secondsPerAnswer(stats).seconds) / 60));

  const courseLabel = (next: NextAction) =>
    next.kind === 'continue-lesson'
      ? t('dashboardContinue')
      : next.kind === 'start-lesson'
        ? t('dashboardStartLesson')
        : next.kind === 'review'
          ? t('dashboardReviewDue')
          : next.kind === 'mistakes'
            ? t('dashboardPracticeMistakes')
            : next.kind === 'checkpoint'
              ? t(checkpointById(next.to.slice('/checkpoint/'.length))?.scope === 'level' ? 'levelCheckpoint' : 'unitCheckpoint')
              : t('onboardingStart');
  /*
   * The course's next step named after the day's first one: as a link, its
   * name; as the keep-going button, what to do and to what. A review is named
   * by what is waiting, the way the card names it, because the course's own
   * title counts "items"; a mistakes practice already says what to do.
   */
  const courseName = (next: NextAction) =>
    next.kind === 'review' ? t('todayReviewTitle', { n: step.due }) : say(next.title);
  const courseOffer = (next: NextAction) =>
    next.kind === 'review' || next.kind === 'mistakes' ? courseName(next) : `${courseLabel(next)}: ${say(next.title)}`;

  // The lesson the course step is about, or failing that the first one not
  // done: its unit is the strip of stops further down.
  const actionLessonId = action.to.startsWith('/lesson/') ? action.to.slice('/lesson/'.length) : undefined;
  const focus =
    lessonViews.find((view) => view.lesson.id === actionLessonId) ?? lessonViews.find((view) => !view.complete);
  const unit = focus ? unitForLesson(focus.lesson.id) : undefined;
  const unitViews = unit ? lessonViews.filter((view) => unitForLesson(view.lesson.id)?.id === unit.id) : [];

  const practising = step.kind === 'daily' || step.kind === 'continue-daily';
  const lessonStep = step.kind === 'continue-lesson' || step.kind === 'start-lesson';
  const eyebrow = practising
    ? t('todayPracticeEyebrow')
    : lessonStep
      ? `${t('todayUpNext')} · ${unit ? say(unit.title) : ''}`
      : step.kind === 'review'
        ? t('todayReviewEyebrow')
        : step.kind === 'welcome-back'
          ? t('welcomeBackEyebrow')
          : step.kind === 'done'
          ? t('todayDoneEyebrow')
          : t('dashboardNextAction');
  const title = practising
    ? say(scenario?.title ?? script.goal)
    : step.kind === 'review'
      ? step.round
        ? t('catchUpRoundTitle', { k: step.round, n: step.due })
        : t('todayReviewTitle', { n: step.due })
      : step.kind === 'welcome-back'
        ? t('welcomeBackTitle')
        : step.kind === 'done'
        ? t(step.goalMet ? 'todayDoneGoal' : 'todayDoneAll')
        : say(action.title);
  const cta = step.kind === 'done'
    ? null
    : step.kind === 'daily'
      ? t('todayPracticeStart')
      : step.kind === 'continue-daily'
        ? t('dailyResume')
        : step.kind === 'review'
          ? t('dashboardReviewDue')
          : step.kind === 'welcome-back'
            ? t('welcomeBackStart')
            : courseLabel(action);
  const practiceLabel = t(step.practice === 'open' ? 'dailyResume' : 'todayPracticeName');
  const practiceDone = finished
    ? `${t('todayPracticeDone')}${finished.total > 0 ? ` · ${t('exerciseScore', { correct: finished.firstTryCorrect, total: finished.total })}` : ''}`
    : null;

  return (
    <div className="page today">
      <header className="today__head">
        <div>
          <p className="today__eyebrow">
            {t('dashboardGreeting')} · {formatToday(lang)}
          </p>
          <h1 className="today__greeting" lang="de">
            {germanGreeting()}
          </h1>
          <p className="today__welcome">{t('studioGreeting')}</p>
        </div>
        {stats.streak > 0 ? (
          // A paragraph cannot be named, so the label on it was never read:
          // the words are in the text, for a screen reader only.
          <p className="today__streak">
            <Icon name="flame" size={18} />
            <span aria-hidden="true">{stats.streak}</span>
            <span className="visually-hidden">{t('todayStreak', { n: stats.streak })}</span>
          </p>
        ) : null}
      </header>

      <section className={`today-plan today-plan--${step.kind}`} aria-labelledby="today-plan-title">
        <div className="today-plan__copy">
          <p className="today-plan__eyebrow">
            {step.kind === 'done' ? <Icon name="check" size={16} /> : null}
            {eyebrow}
          </p>
          <h2 className="today-plan__title" id="today-plan-title">
            {title}
          </h2>
          {practising ? (
            <>
              {/* On day one, what daily practice is matters more than this one's goal. */}
              {firstTime ? null : <p className="today-plan__detail">{say(script.goal)}</p>}
              {step.kind === 'continue-daily' && step.run ? (
                <div className="today-plan__progress">
                  <Meter value={step.run.stage / DAILY_STAGES.length} label={t('dailyPlanProgress')} />
                  <span>
                    {t('todayPracticeStep', {
                      n: step.run.stage + 1,
                      total: DAILY_STAGES.length,
                      stage: t(DAILY_STAGES[Math.min(step.run.stage, DAILY_STAGES.length - 1)]!),
                    })}
                  </span>
                </div>
              ) : (
                // Where daily practice first appears, it says what it is.
                <p className="today-plan__what">{t(firstTime ? 'todayPracticeFirst' : 'todayPracticeWhat')}</p>
              )}
            </>
          ) : step.kind === 'review' && step.round ? (
            // After a break, the day's one round is timed, not the whole pile.
            <p className="today-plan__detail">
              {t('catchUpRoundWhat')}
              <span className="today-plan__time"> {t('dashboardEstimate', { n: minutesFor(step.round) })}</span>
            </p>
          ) : step.kind === 'review' ? (
            <p className="today-plan__detail">
              {t('todayReviewWhat')}
              <span className="today-plan__time"> {t('dashboardEstimate', { n: Math.max(1, Math.round(step.due * 0.4)) })}</span>
            </p>
          ) : step.welcome ? (
            <>
              {/* What happened, plainly, and nothing about what was missed. */}
              <p className="today-plan__detail">{t('welcomeBackAway', { n: step.welcome.days })}</p>
              <p className="today-plan__detail">
                {step.due > step.welcome.warmUp
                  ? t('welcomeBackWaiting', { n: step.due, k: step.welcome.warmUp })
                  : t('welcomeBackAll', { n: step.due })}
                <span className="today-plan__time">
                  {' '}
                  {t('dashboardEstimate', { n: minutesFor(step.welcome.warmUp) })}
                </span>
              </p>
              {/* The run of days before the break is not lost from view: it
                  is named, and today is the first day of the next one. */}
              {step.welcome.run >= 2 ? <p className="today-plan__what">{t('welcomeBackRun', { n: step.welcome.run })}</p> : null}
            </>
          ) : step.kind === 'done' ? (
            <>
              <ul className="today-plan__achieved">
                {minutesToday > 0 ? <li><Icon name="check" size={16} />{t('todayDoneMinutes', { n: minutesToday })}</li> : null}
                {practiceDone ? <li><Icon name="check" size={16} />{practiceDone}</li> : null}
                {(today?.answers ?? 0) > 0 ? <li><Icon name="check" size={16} />{t('todayDoneAnswers', { n: today!.answers })}</li> : null}
              </ul>
              {step.then ? null : <p className="today-plan__detail">{t('todayDoneRest')}</p>}
            </>
          ) : (
            <>
              <p className="today-plan__detail">
                {say(action.detail)}
                {action.estimatedMinutes > 0 ? (
                  <span className="today-plan__time"> {t('dashboardEstimate', { n: action.estimatedMinutes })}</span>
                ) : null}
              </p>
              {step.kind === 'continue-lesson' && focus ? (
                <div className="today-plan__progress">
                  <Meter value={focus.readiness} label={say(focus.lesson.title)} />
                  <span>{Math.round(focus.readiness * 100)}%</span>
                </div>
              ) : null}
            </>
          )}
          {cta ? (
            <Link className="btn btn--primary today-plan__cta" to={step.to}>
              {cta}
              <Icon name="arrow" size={20} />
            </Link>
          ) : null}
          {/* Once the day is done, more is offered and never pressed: a quiet
              button, not the primary one. Before that, what follows the step
              is a link, so there is only ever one button to choose. */}
          {step.kind === 'done' && step.then ? (
            <div className="today-plan__more">
              <p>{t('todayKeepGoing')}</p>
              <Link className="btn btn--ghost today-plan__keep" to={step.then === 'daily' ? '/daily' : action.to}>
                {step.then === 'daily' ? practiceLabel : courseOffer(action)}
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          ) : step.then ? (
            <p className="today-plan__then">
              {t('todayThen')}:{' '}
              <Link to={step.then === 'daily' ? '/daily' : action.to}>
                {step.then === 'daily' ? practiceLabel : courseName(action)}
              </Link>
            </p>
          ) : practiceDone && step.kind !== 'done' ? (
            <p className="today-plan__then today-plan__then--done">
              <Icon name="check" size={16} />
              {practiceDone}
            </p>
          ) : null}
        </div>
        {/* The wooden town, its lit building today's step, named in its label
            from the same title as the card; the chip only repeats it for the
            eye. The dachshund stays wherever the town is not drawn. */}
        <WoodScene
          spec={todayTown({ step: step.kind, scenarioId: practising ? scenario?.id : undefined })}
          className="today-plan__scene hw-scene hw-scene--today"
          label={t(step.kind === 'done' ? 'sceneTodayDoneLabel' : 'sceneTodayLabel', { place: title })}
          fallback={<DackelScene className="today-plan__scene hw-scene hw-scene--today" />}
        >
          {step.kind === 'done' ? null : (
            <span className="wood-scene__chip" aria-hidden="true">
              {t('sceneNextStop')} · {title}
            </span>
          )}
        </WoodScene>
      </section>

      {/*
        * The day's goal and the week, in one widget, beside what is waiting
        * to be reviewed. There were three measures here, counted three ways:
        * the goal ring, bars of minutes for the last seven days, and the
        * week's practice days at the foot of the page.
        */}
      <div className="today-tiles">
        <Rhythm />
        <Link className="today-tile today-tile--review" to="/review">
          <Icon name="arrow" size={18} className="today-tile__arrow" />
          <span className="today-tile__eyebrow">{t('navReview')}</span>
          <span className="today-tile__icon">
            <Icon name="review" />
          </span>
          <p className="today-tile__main">
            {queue.total > 0 ? t(step.spread ? 'catchUpTileWaiting' : 'todayDue', { n: queue.total }) : t('todayNothingDue')}
          </p>
          {/* "Review early" only when there is something to review: a new
              learner was offered it and the review page had nothing to give.
              After a break the pile is not timed as one sitting: the card
              above says it comes back over the next days, and so does this. */}
          <p className="today-tile__note">
            {queue.total > 0 && step.spread
              ? t('catchUpTileSpread')
              : queue.total > 0
                ? t('dashboardEstimate', { n: Math.max(1, Math.round(queue.total * 0.4)) })
                : earlyReviewExercises(onPath, new Date(), 1).length > 0
                  ? t('reviewPracticeEarly')
                  : t('todayReviewLater')}
          </p>
        </Link>
      </div>

      {/*
        * The round stays one tap away for the evening with ten minutes, once
        * there is something to put in it. With nothing waiting it was a card
        * that said so: one more start that went nowhere.
        */}
      {round.steps > 0 ? (
        <Link className="today-round" to="/session">
          <span className="today-round__icon">
            <Icon name="round" />
          </span>
          <span className="today-round__text">
            <span className="today-round__title">{t('sessionTitle')}</span>
            <span className="today-round__note">{t('todayRoundWhat')}</span>
            <span className="today-round__note">
              {`${t('sessionAnswers', { n: round.steps })} · ${t('dashboardEstimate', { n: estimatedMinutes(round) })}`}
            </span>
          </span>
          <Icon name="arrow" size={20} />
        </Link>
      ) : null}

      {unit && unitViews.length > 0 ? (
        <section className="today-unit" aria-labelledby="today-unit-title">
          <div className="today-unit__head">
            <div><p className="section-eyebrow">{t('studioPath')}</p><h2 className="today-unit__title" id="today-unit-title">{say(unit.title)}</h2></div>
            <Link to="/course">{t('todaySeePath')}</Link>
          </div>
          <ol className="stops">
            {unitViews.map((view, index) => {
              const current = view.lesson.id === focus?.lesson.id;
              const state = view.complete ? 'done' : current ? 'now' : 'todo';
              return (
                <li key={view.lesson.id} className={`stops__stop stops__stop--${state}`}>
                  <Link
                    to={`/lesson/${view.lesson.id}`}
                    className="stops__dot"
                    aria-label={`${say(view.lesson.title)}${
                      state === 'done' ? ` (${t('todayLessonDone')})` : state === 'now' ? ` (${t('todayLessonNow')})` : ''
                    }`}
                    aria-current={current ? 'step' : undefined}
                  >
                    {view.complete ? <Icon name="check" size={18} /> : index + 1}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section className="studio-explore" aria-labelledby="studio-explore-title">
        <h2 id="studio-explore-title">{t('studioExploreTitle')}</h2>
        <div className="studio-explore__grid">
          <Link className="studio-explore__card studio-explore__card--conversation" to="/real-life">
            <span className="studio-explore__icon"><Icon name="chat" size={24} /></span>
            <span><strong>{t('navRealLife')}</strong><span>{t('studioRealLife')}</span></span><Icon name="arrow" size={20} />
          </Link>
          <Link className="studio-explore__card" to="/vocabulary">
            <span className="studio-explore__icon"><Icon name="book" size={24} /></span>
            <span><strong>{t('navVocabulary')}</strong><span>{t('studioWords')}</span></span><Icon name="arrow" size={20} />
          </Link>
        </div>
      </section>

      {mistakes.length > 0 ? (
        <Card
          title={t('mistakesTitle')}
          actions={
            <Link className="btn btn--ghost btn--sm" to="/mistakes">
              {t('mistakesPractise')}
            </Link>
          }
        >
          <ul className="mistake-mini">
            {mistakes.slice(0, 4).map((mistake) => (
              <li key={mistake.id}>
                <span className="mistake-mini__wrong" lang="de">
                  {mistake.lastGiven}
                </span>
                <span aria-hidden="true">{'→'}</span>
                <span className="mistake-mini__right" lang="de">
                  {mistake.expected}
                </span>
                <span className="mistake-mini__count">{t('mistakesOccurrences', { n: mistake.occurrences })}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* The week is counted in the rhythm above, not a second time here. */}
      <PracticalProgress week={false} />
      {hasActivity ? progress() : null}
    </div>
  );

  /** Everything that is measured, one tap away rather than in the way. A plain
   *  function, not a component: a component defined in here would be a new type
   *  on every render, and the open section would snap shut. */
  function progress() {
    const vocab = buildVocabViews(reviewItems, mistakes, favorites);
    const skills = skillProgress(lessons, reviewItems);
    const content = contentStats();
    const completed = lessonViews.filter((view) => view.complete).length;
    const learning = vocab.filter((view) => view.state === 'learning' || view.state === 'lapsed').length;
    const known = vocab.filter((view) => view.state === 'known').length;
    return (
      <details className="today-progress">
        <summary>{t('todayProgress')}</summary>
        <div className="today-progress__body">
          <ul className="skills">
            {skills.map((skill) => {
              const label = UI[skillKey(skill.key)][lang];
              return (
                <li key={skill.key} className="skills__row">
                  <span className="skills__label">{label}</span>
                  {skill.value === null ? (
                    <span className="skills__planned">{t('skillSpeakingUncounted')}</span>
                  ) : (
                    <>
                      <Meter value={skill.value} label={label} tone={skill.value >= 0.8 ? 'good' : 'accent'} />
                      <span className="skills__num">
                        {skill.done}/{skill.total}
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="stats">
            <Stat label={t('statAccuracy')} value={`${Math.round(stats.accuracy * 100)}%`} emphasis />
            <Stat label={t('statWordsLearning')} value={learning} />
            <Stat label={t('statWordsKnown')} value={`${known} / ${content.vocabulary}`} />
            <Stat label={t('statLessonsDone')} value={`${completed} / ${content.lessons}`} />
            <Stat label={t('statAnswers')} value={stats.totalAnswers} />
            <Stat
              label={t('statStudyTime')}
              value={stats.totalStudySeconds > 0 ? formatDuration(stats.totalStudySeconds, lang) : '—'}
            />
            <Stat label={t('statCorrections')} value={stats.retypedCorrections} />
          </div>
        </div>
      </details>
    );
  }
}

/** Greeted in German, by the hour where the learner is. */
function germanGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 11) return 'Guten Morgen.';
  if (hour >= 11 && hour < 18) return 'Guten Tag.';
  return 'Guten Abend.';
}

function formatToday(lang: 'en' | 'bg', now = new Date()): string {
  return new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}

function skillKey(key: string): UiKey {
  switch (key) {
    case 'vocabulary':
      return 'skillVocabulary';
    case 'grammar':
      return 'skillGrammar';
    case 'listening':
      return 'skillListening';
    case 'writing':
      return 'skillWriting';
    case 'reading':
      return 'skillReading';
    default:
      return 'skillSpeaking';
  }
}
