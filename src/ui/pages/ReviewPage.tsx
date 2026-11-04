import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { grammarById } from '../../content/browser.ts';
import type { Exercise } from '../../content/types.ts';
import { summarizeQueue, type RecallGrade } from '../../core/srs/scheduler.ts';
import { UI, tr } from '../../i18n.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton, Card, EmptyState, formatRelativeDate } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { REVIEW_ROUND_SIZE, buildQueue, catchUpExercises, earlyReviewExercises, reasonKey } from '../selectors.ts';
import { buildReviewExercises, reviewItemsForPath } from '../reviewBuilder.ts';

const GRADES: RecallGrade[] = ['again', 'hard', 'good', 'easy'];

/** A round as it was when it started. */
interface Round {
  id: number;
  exercises: Exercise[];
  size: number;
  early: boolean;
  /**
   * The warm-up Today offers after a break: how many are still due once it
   * is done, as it was when it started. Undefined for any other round.
   */
  catchUp?: number;
}

/** The review queue: what is due, why, and typing it back. */

export function ReviewPage() {
  const { t, say, lang, reviewItems, gradeReview } = useApp();
  const [params, setParams] = useSearchParams();
  /*
   * The round is fixed when it starts.
   *
   * Every answer moves its word's due date, so the queue below changes after
   * each one. Built live, the round lost the word just answered, shifted left
   * under the cursor and skipped the next: half the due words were never
   * asked, and a round of ten ended "5 of 5". SessionPage fixes its plan the
   * same way.
   *
   * The warm-up after a break starts as the page opens: Today's button said
   * "Start the warm-up", and a second button here to start it again was one
   * more thing between the learner and their first answer back.
   */
  const [round, setRound] = useState<Round | null>(() => {
    if (!params.has('catch-up')) return null;
    const path = reviewItemsForPath(reviewItems, lang);
    const exercises = catchUpExercises(path, lang);
    // Every warm-up item is due, one exercise each, so this is what is left.
    const left = summarizeQueue(path).total - exercises.length;
    return exercises.length > 0 ? { id: 1, exercises, size: exercises.length, early: false, catchUp: left } : null;
  });
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  /*
   * After the warm-up, how many are still waiting; null after any other round.
   *
   * Counted from the start of the warm-up as well as from the queue: an
   * answer given offline waits in the outbox, and until it is sent its item
   * is still due here, so the queue alone said the twelve just answered were
   * still waiting.
   */
  const [caughtUp, setCaughtUp] = useState<number | null>(null);
  /*
   * The summary's one way on takes the focus, as the round's last answer
   * leaves it nowhere. Not with autoFocus: React only focuses form controls
   * for it, and on a link it did nothing.
   */
  const onward = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (summary && caughtUp !== null) onward.current?.focus();
  }, [summary, caughtUp]);
  // Taken once: reloading the page, or coming back to it, is the review page.
  useEffect(() => {
    if (params.has('catch-up')) setParams({}, { replace: true });
  }, [params, setParams]);

  const onPath = useMemo(() => reviewItemsForPath(reviewItems, lang), [reviewItems, lang]);
  const queue = useMemo(() => buildQueue(onPath), [onPath]);
  const counts = summarizeQueue(onPath);
  const waiting = Math.max(0, Math.min(counts.total, caughtUp ?? 0));

  // Practising early takes the soonest items that are not yet due.
  const early = useMemo(() => earlyReviewExercises(onPath), [onPath]);

  /*
   * One sitting at a time: a beginner's first bad day can make thirty words
   * due at once, and the most overdue come first, so the rest can wait.
   *
   * The round is cut from what can be typed, due grammar included: it is
   * asked as one of the course's own steps, in the learner's path. Only a
   * concept with no such step is left to the card below, and taken into the
   * twenty first those made "20 in this round" a round of 17 and left typable
   * words for the next one.
   */
  const build = useMemo(() => buildReviewExercises(queue.map((entry) => entry.item), lang), [queue, lang]);

  const start = (exercises: Exercise[], isEarly: boolean) => {
    setSummary(null);
    setCaughtUp(null);
    setRound({ id: (round?.id ?? 0) + 1, exercises, size: exercises.length, early: isEarly });
  };

  if (round && round.exercises.length > 0) {
    return (
      <div className="page page--player">
        <header className="player-header">
          {/* The page's title while it plays, as the lesson's is. The warm-up
              opens straight into the round, and with no title on the page
              the focus a new page gives its title waited for the summary and
              took the focus from the summary's own button. */}
          <h1 className="player-header__lesson">{t('reviewTitle')}</h1>
          <p className="player-header__phase">
            {round.catchUp !== undefined
              ? t('catchUpRound', { n: round.size })
              : round.early
                ? t('reviewPracticeEarly')
                : t('reviewRoundSize', { n: round.size })}
          </p>
        </header>
        <ExercisePlayer
          key={round.id}
          exercises={round.exercises}
          context="review"
          level="pre-a1"
          onFinish={(result) => {
            setSummary(result);
            setCaughtUp(round.catchUp ?? null);
            setRound(null);
            // The summary is at the top of the page, and the player had
            // scrolled down to its last feedback: the result was out of view.
            if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
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
      <p className="page__lede">{t('reviewLede')}</p>

      {/* After the warm-up the rest of the pile is not the next thing to do:
          it is said how much waits and that it comes back over the next days,
          and the one button goes back to the day. */}
      {summary && caughtUp !== null ? (
        <Card tone="accent" title={t('catchUpDone')}>
          <p className="done-note">
            {t('exerciseScore', { correct: summary.firstTryCorrect, total: summary.total })}
          </p>
          <p>{waiting === 1 ? t('catchUpRestOne', { n: waiting }) : waiting > 0 ? t('catchUpRest', { n: waiting }) : t('catchUpClear')}</p>
          <div className="section-nav">
            <Link className="btn btn--primary btn--lg" to="/" ref={onward}>
              {t('catchUpOnward')}
            </Link>
          </div>
        </Card>
      ) : summary ? (
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
            body={early.length > 0 ? t('reviewNothingDueBody') : t('reviewNothingYetBody')}
            action={
              // After the warm-up the summary's way on is the one button.
              early.length > 0 ? (
                <button
                  type="button"
                  className={`btn ${caughtUp !== null ? 'btn--ghost' : 'btn--primary'}`}
                  onClick={() => start(early, true)}
                >
                  {t('reviewPracticeEarly')}
                </button>
              ) : (
                <Link className={`btn ${caughtUp !== null ? 'btn--ghost' : 'btn--primary'}`} to="/course">
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
              className={`btn ${caughtUp !== null ? 'btn--ghost' : 'btn--primary'} btn--lg`}
              disabled={build.exercises.length === 0}
              onClick={() => start(build.exercises.slice(0, REVIEW_ROUND_SIZE), false)}
              autoFocus={caughtUp === null}
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
