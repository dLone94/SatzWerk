import { Link } from 'react-router-dom';
import { contentStats } from '../../content/index.ts';
import { summarizeQueue } from '../../core/srs/scheduler.ts';
import { UI } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, EmptyState, Meter, Stat, formatDuration } from '../components/bits.tsx';
import { buildLessonViews, buildVocabViews, nextAction, skillProgress, studyPlan } from '../selectors.ts';

/** Today: what is true right now, and the one thing worth doing next. */
export function DashboardPage() {
  const { t, say, lang, lessons, reviewItems, mistakes, favorites, stats, profile } = useApp();

  const action = nextAction(lessons, reviewItems, mistakes, profile.onboarded);
  const plan = studyPlan(lessons, reviewItems, mistakes, profile.dailyTargetMinutes);
  const queue = summarizeQueue(reviewItems);
  const lessonViews = buildLessonViews(lessons);
  const vocab = buildVocabViews(reviewItems, mistakes, favorites);
  const skills = skillProgress(lessons, reviewItems);
  const content = contentStats();

  const completed = lessonViews.filter((view) => view.complete).length;
  const learning = vocab.filter((view) => view.state === 'learning' || view.state === 'lapsed').length;
  const known = vocab.filter((view) => view.state === 'known').length;
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
              : t('navCourse');

  return (
    <div className="page">
      <h1 className="page__title">{t('dashboardGreeting')}</h1>

      <Card title={t('dashboardNextAction')} tone="accent">
        <div className="next-action">
          <div>
            <p className="next-action__title">{say(action.title)}</p>
            <p className="next-action__detail">{say(action.detail)}</p>
            {action.estimatedMinutes > 0 ? (
              <p className="next-action__time">{t('dashboardEstimate', { n: action.estimatedMinutes })}</p>
            ) : null}
          </div>
          {action.kind === 'idle' ? (
            <Link className="btn btn--primary btn--lg" to="/review">
              {t('reviewPracticeEarly')}
            </Link>
          ) : (
            <Link className="btn btn--primary btn--lg" to={action.to}>
              {actionLabel}
            </Link>
          )}
        </div>
      </Card>

      <div className="grid grid--2">
        <Card title={t('dashboardPlan')}>
          {plan.length === 0 ? (
            <EmptyState title={t('dashboardAllDone')} />
          ) : (
            <ol className="plan">
              {plan.map((item, index) => (
                <li key={`${item.to}-${index}`} className="plan__item">
                  <span className="plan__n">{index + 1}</span>
                  <Link to={item.to} className="plan__label">
                    {say(item.label)}
                  </Link>
                  <span className="plan__time">{t('dashboardEstimate', { n: item.minutes })}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="card__foot">
            {lang === 'bg'
              ? `Дневна цел: ${profile.dailyTargetMinutes} мин`
              : `Daily target: ${profile.dailyTargetMinutes} min`}
          </p>
        </Card>

        <Card title={t('skillsTitle')}>
          <ul className="skills">
            {skills.map((skill) => {
              const label = UI[skillKey(skill.key)][lang];
              return (
                <li key={skill.key} className="skills__row">
                  <span className="skills__label">{label}</span>
                  {skill.value === null ? (
                    <span className="skills__planned">{t('skillSpeakingPlanned')}</span>
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
        </Card>
      </div>

      <Card title={t('navToday')}>
        <div className="stats">
          <Stat
            label={t('statAccuracy')}
            value={hasActivity ? `${Math.round(stats.accuracy * 100)}%` : '—'}
            hint={hasActivity ? undefined : t('statNoData')}
            emphasis
          />
          <Stat label={t('statDue')} value={queue.total} hint={`${queue.new} ${t('reviewStateNew').toLowerCase()}`} />
          <Stat label={t('statWordsLearning')} value={learning} />
          <Stat label={t('statWordsKnown')} value={`${known} / ${content.vocabulary}`} />
          <Stat label={t('statLessonsDone')} value={`${completed} / ${content.lessons}`} />
          <Stat label={t('statAnswers')} value={stats.totalAnswers} />
          <Stat
            label={t('statStudyTime')}
            value={stats.totalStudySeconds > 0 ? formatDuration(stats.totalStudySeconds, lang) : '—'}
          />
          <Stat
            label={t('statStreak')}
            value={stats.streak > 0 ? t('statStreakDays', { n: stats.streak }) : '—'}
          />
          <Stat label={t('statCorrections')} value={stats.retypedCorrections} />
        </div>
      </Card>

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
    </div>
  );
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
