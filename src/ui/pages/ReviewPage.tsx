import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { grammarById } from '../../content/index.ts';
import type { Exercise } from '../../content/types.ts';
import { summarizeQueue, type RecallGrade, type ReviewItem } from '../../core/srs/scheduler.ts';
import { UI, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, formatRelativeDate } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { buildQueue, reasonKey } from '../selectors.ts';
import { buildReviewExercises } from '../reviewBuilder.ts';

const GRADES: RecallGrade[] = ['again', 'hard', 'good', 'easy'];

/** The review queue: what is due, why, and typing it back. */
/** How many due items one review round takes. */
export const REVIEW_ROUND_SIZE = 20;

/** A round as it was when it started. */
interface Round {
  id: number;
  exercises: Exercise[];
  size: number;
  early: boolean;
}

export function ReviewPage() {
  const { t, say, lang, reviewItems, gradeReview } = useApp();
  /*
   * The round is fixed when it starts.
   *
   * Every answer moves its word's due date, so the queue below changes after
   * each one. Built live, the round lost the word just answered, shifted left
   * under the cursor and skipped the next: half the due words were never
   * asked, and a round of ten ended "5 of 5". SessionPage fixes its plan the
   * same way.
   */
  const [round, setRound] = useState<Round | null>(null);
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

  // One sitting at a time: a beginner's first bad day can make thirty words
  // due at once, and the most overdue come first, so the rest can wait.
  const dueItems = useMemo(() => queue.slice(0, REVIEW_ROUND_SIZE).map((entry) => entry.item), [queue]);
  const build = useMemo(() => buildReviewExercises(dueItems), [dueItems]);

  const start = (items: ReviewItem[], early: boolean) => {
    setSummary(null);
    setRound({ id: (round?.id ?? 0) + 1, exercises: buildReviewExercises(items).exercises, size: items.length, early });
  };

  if (round && round.exercises.length > 0) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{t('reviewTitle')}</p>
          <p className="player-header__phase">
            {round.early ? t('reviewPracticeEarly') : t('reviewRoundSize', { n: round.size })}
          </p>
        </header>
        <ExercisePlayer
          key={round.id}
          exercises={round.exercises}
          context="review"
          level="pre-a1"
          onFinish={(result) => {
            setSummary(result);
            setRound(null);
          }}
          onExit={() => setRound(null)}
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
                  onClick={() => start(earlyItems, true)}
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
              onClick={() => start(dueItems, false)}
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
                {/* Patterns are German sentences and get the same audio and
                    gloss as words, the gloss beside the pattern it translates
                    (it has the pattern's blank); a grammar item is named by
                    its title, in the teaching language, so it is not marked
                    as German. */}
                <span className="queue__label" lang={entry.german ? 'de' : undefined}>
                  {entry.title ? say(entry.title) : entry.label}
                  {entry.german ? <AudioButton text={entry.label} compact /> : null}
                </span>
                {entry.gloss ? (
                  <span className="queue__gloss">
                    {entry.template ? (
                      <>
                        <span lang="de">{entry.template}</span> —{' '}
                      </>
                    ) : null}
                    {say(entry.gloss)}
                  </span>
                ) : null}
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
