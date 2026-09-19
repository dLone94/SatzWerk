import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { grammarById } from '../../content/index.ts';
import { summarizeQueue, type RecallGrade } from '../../core/srs/scheduler.ts';
import { UI, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, formatRelativeDate } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { buildQueue, reasonKey } from '../selectors.ts';
import { buildReviewExercises } from '../reviewBuilder.ts';

const GRADES: RecallGrade[] = ['again', 'hard', 'good', 'easy'];

/** The review queue: what is due, why, and typing it back. */
export function ReviewPage() {
  const { t, say, lang, reviewItems, gradeReview } = useApp();
  const [running, setRunning] = useState(false);
  const [early, setEarly] = useState(false);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  const queue = useMemo(() => buildQueue(reviewItems), [reviewItems]);
  const counts = summarizeQueue(reviewItems);

  // Practising early takes the soonest items that are not yet due.
  const earlyItems = useMemo(
    () =>
      [...reviewItems]
        .filter((item) => new Date(item.dueAt).getTime() > Date.now())
        .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
        .slice(0, 10),
    [reviewItems],
  );

  const activeItems = early ? earlyItems : queue.map((entry) => entry.item);
  const build = useMemo(() => buildReviewExercises(activeItems), [activeItems]);

  if (running && build.exercises.length > 0) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{t('reviewTitle')}</p>
          <p className="player-header__phase">
            {early ? t('reviewPracticeEarly') : t('reviewDueCount', { n: activeItems.length })}
          </p>
        </header>
        <ExercisePlayer
          exercises={build.exercises}
          context="review"
          level="pre-a1"
          onFinish={(result) => {
            setSummary(result);
            setRunning(false);
          }}
          onExit={() => setRunning(false)}
          exitLabel={t('cancel')}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page__title">{t('reviewTitle')}</h1>

      {summary ? (
        <Card tone="accent" title={t('exerciseDone')}>
          <p className="done-note">
            {t('exerciseScore', { correct: summary.firstTryCorrect, total: summary.total })}
          </p>
        </Card>
      ) : null}

      {counts.total === 0 ? (
        <Card>
          <EmptyState
            title={t('reviewNothingDue')}
            body={t('reviewNothingDueBody')}
            action={
              earlyItems.length > 0 ? (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setEarly(true);
                    setSummary(null);
                    setRunning(true);
                  }}
                >
                  {t('reviewPracticeEarly')}
                </button>
              ) : (
                <Link className="btn btn--primary" to="/course">
                  {t('navCourse')}
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <Card
          tone="accent"
          title={t('reviewDueCount', { n: counts.total })}
          subtitle={[
            `${counts.new} ${UI.reviewStateNew[lang]}`,
            `${counts.learning} ${UI.reviewStateLearning[lang]}`,
            `${counts.lapsed} ${UI.reviewStateLapsed[lang]}`,
            `${counts.known} ${UI.reviewStateKnown[lang]}`,
          ].join(' · ')}
        >
          <div className="section-nav">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              disabled={build.exercises.length === 0}
              onClick={() => {
                setEarly(false);
                setSummary(null);
                setRunning(true);
              }}
              autoFocus
            >
              {t('reviewStart')}
            </button>
          </div>
        </Card>
      )}

      {queue.length > 0 ? (
        <Card title={t('reviewWhyDue')}>
          <ul className="queue">
            {queue.slice(0, 25).map((entry) => (
              <li key={entry.item.id} className={`queue__row queue__row--${entry.item.state}`}>
                <span className="queue__label" lang="de">
                  {entry.label}
                  {entry.entry ? <AudioButton text={entry.entry.display} compact /> : null}
                </span>
                {entry.entry ? <span className="queue__gloss">{say(entry.entry.translation)}</span> : null}
                <span className="queue__reason">{UI[reasonKey(entry.reason)][lang]}</span>
                <span className="queue__meta">
                  {entry.item.successCount > 0
                    ? tr('wordSuccesses', lang, { n: entry.item.successCount })
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {build.conceptItems.length > 0 ? (
        <Card title={t('reviewGradePrompt')} subtitle={t('skillGrammar')}>
          <ul className="concepts">
            {build.conceptItems.map((item) => {
              const concept = grammarById(item.refId);
              return (
                <li key={item.id} className="concepts__row">
                  <div>
                    <p className="concepts__title">{concept ? say(concept.title) : item.refId}</p>
                    {concept ? <p className="concepts__summary">{say(concept.summary)}</p> : null}
                    <p className="concepts__due">
                      {t('reviewNext')}: {formatRelativeDate(item.dueAt, lang)}
                    </p>
                  </div>
                  <div className="grade-buttons">
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        className={`btn btn--sm btn--grade btn--grade-${grade}`}
                        onClick={() => void gradeReview(item.id, grade)}
                      >
                        {UI[gradeKey(grade)][lang]}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function gradeKey(grade: RecallGrade): keyof typeof UI {
  switch (grade) {
    case 'again':
      return 'reviewGradeAgain';
    case 'hard':
      return 'reviewGradeHard';
    case 'easy':
      return 'reviewGradeEasy';
    default:
      return 'reviewGradeGood';
  }
}
