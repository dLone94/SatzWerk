import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { contentStats, unitForLesson } from '../../content/index.ts';
import { todayHere } from '../../core/progress/days.ts';
import { estimatedMinutes, planSession } from '../../core/progress/session.ts';
import { summarizeQueue } from '../../core/srs/scheduler.ts';
import { UI } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, Meter, Stat, formatDuration } from '../components/bits.tsx';
import { Icon } from '../components/icons.tsx';
import { buildLessonViews, buildVocabViews, nextAction, sessionBuild, skillProgress } from '../selectors.ts';

/**
 * Today: the one thing worth doing next, and nothing that competes with it.
 *
 * The page used to open on two cards of equal weight, a plan that repeated
 * them, and nine stat tiles that were all zero on the first day. Now the next
 * step is the only dark thing on the page, the two numbers that change what
 * you do today sit under it, and the rest of the statistics wait behind "Your
 * progress" until there is something in them.
 */
export function DashboardPage() {
  const { t, say, lang, lessons, reviewItems, mistakes, favorites, stats, studyDays, profile } = useApp();

  const action = nextAction(lessons, reviewItems, mistakes, profile.onboarded);
  // The same plan the round itself will build, so the two never disagree.
  const round = planSession(
    sessionBuild(lessons, reviewItems, mistakes).sources,
    profile.dailyTargetMinutes,
    stats,
  );
  const queue = summarizeQueue(reviewItems);
  const lessonViews = buildLessonViews(lessons);
  const hasActivity = stats.totalAnswers > 0;

  const actionLabel =
    action.kind === 'continue-lesson'
      ? t('dashboardContinue')
      : action.kind === 'start-lesson'
        ? t('dashboardStartLesson')
        : action.kind === 'review'
          ? t('dashboardReviewDue')
          : action.kind === 'mistakes'
            ? t('dashboardPracticeMistakes')
            : action.kind === 'checkpoint'
              ? t('unitCheckpoint')
              : t('reviewPracticeEarly');
  const actionTo = action.kind === 'idle' ? '/review' : action.to;

  // The lesson the next step is about, or failing that the first one not done:
  // its unit is the strip of stops under the two tiles.
  const actionLessonId = action.to.startsWith('/lesson/') ? action.to.slice('/lesson/'.length) : undefined;
  const focus =
    lessonViews.find((view) => view.lesson.id === actionLessonId) ?? lessonViews.find((view) => !view.complete);
  const unit = focus ? unitForLesson(focus.lesson.id) : undefined;
  const unitViews = unit ? lessonViews.filter((view) => unitForLesson(view.lesson.id)?.id === unit.id) : [];

  const secondsToday = studyDays.find((day) => day.day === todayHere())?.secondsActive ?? 0;
  const minutesToday = Math.floor(secondsToday / 60);
  const target = Math.max(1, profile.dailyTargetMinutes);
  const minutesLeft = Math.max(0, target - minutesToday);

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
        </div>
        {stats.streak > 0 ? (
          <p className="today__streak" aria-label={t('todayStreak', { n: stats.streak })}>
            <Icon name="flame" size={18} />
            <span aria-hidden="true">{stats.streak}</span>
          </p>
        ) : null}
      </header>

      <section className="today-hero" aria-labelledby="today-hero-title">
        <p className="today-hero__eyebrow">
          {action.kind === 'continue-lesson' || action.kind === 'start-lesson'
            ? `${t('todayUpNext')} · ${unit ? say(unit.title) : ''}`
            : t('dashboardNextAction')}
        </p>
        <h2 className="today-hero__title" id="today-hero-title">
          {say(action.title)}
        </h2>
        <p className="today-hero__detail">
          {say(action.detail)}
          {action.estimatedMinutes > 0 ? (
            <span className="today-hero__time"> {t('dashboardEstimate', { n: action.estimatedMinutes })}</span>
          ) : null}
        </p>
        {action.kind === 'continue-lesson' && focus ? (
          <div className="today-hero__progress">
            <Meter value={focus.readiness} label={say(focus.lesson.title)} />
            <span>{Math.round(focus.readiness * 100)}%</span>
          </div>
        ) : null}
        <Link className="today-hero__cta" to={actionTo}>
          <span>{actionLabel}</span>
          <Icon name="arrow" />
        </Link>
      </section>

      <div className="today-tiles">
        <div className="today-tile">
          <GoalRing done={minutesToday} target={target} />
          <p className="today-tile__main">{t('todayGoal', { target })}</p>
          <p className="today-tile__note">
            {minutesLeft > 0 ? t('todayGoalLeft', { n: minutesLeft }) : t('todayGoalDone')}
          </p>
        </div>
        <Link className="today-tile today-tile--review" to="/review">
          <span className="today-tile__icon">
            <Icon name="review" />
          </span>
          <p className="today-tile__main">
            {queue.total > 0 ? t('todayDue', { n: queue.total }) : t('todayNothingDue')}
          </p>
          <p className="today-tile__note">
            {queue.total > 0
              ? `${t('todayReviewNote')} · ${t('dashboardEstimate', { n: Math.max(1, Math.round(queue.total * 0.4)) })}`
              : t('reviewPracticeEarly')}
          </p>
        </Link>
      </div>

      {/*
        * The round stays one tap away. The next step above is right about what
        * is most useful, but it hands you a lesson; most evenings the real
        * question is "I have ten minutes", and this is the answer to that.
        */}
      <Link className="today-round" to="/session">
        <span className="today-round__icon">
          <Icon name="round" />
        </span>
        <span className="today-round__text">
          <span className="today-round__title">{t('sessionTitle')}</span>
          <span className="today-round__note">
            {round.steps > 0
              ? `${t('sessionAnswers', { n: round.steps })} · ${t('dashboardEstimate', { n: estimatedMinutes(round) })}`
              : t('todayRoundEmpty')}
          </span>
        </span>
        <Icon name="arrow" size={20} />
      </Link>

      {unit && unitViews.length > 0 ? (
        <section className="today-unit" aria-labelledby="today-unit-title">
          <div className="today-unit__head">
            <h2 className="today-unit__title" id="today-unit-title">
              {say(unit.title)}
            </h2>
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

/** Minutes studied today against the daily target, as a ring. */
function GoalRing({ done, target }: { done: number; target: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const share = Math.min(1, done / target);
  const style = { '--ring-c': circumference, '--ring-target': circumference * (1 - share) } as CSSProperties;
  return (
    <div className="goal-ring" style={style}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="goal-ring__track" cx="32" cy="32" r={r} />
        <circle className="goal-ring__value" cx="32" cy="32" r={r} />
      </svg>
      <span className="goal-ring__num">{done}</span>
    </div>
  );
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

function skillKey(key: string): keyof typeof UI {
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
