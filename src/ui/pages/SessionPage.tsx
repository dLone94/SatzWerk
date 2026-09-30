import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CefrLevel } from '../../content/types.ts';
import {
  ENOUGH_ANSWERS_TO_MEASURE,
  estimatedMinutes,
  planSession,
  secondsPerAnswer,
  type SessionPartKind,
  type SessionPlan,
} from '../../core/progress/session.ts';
import { UI, tr } from '../../i18n.ts';
import type { AttemptPayload } from '../../services/api/client.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, EmptyState, formatDuration } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { sessionBuild } from '../selectors.ts';

/**
 * The daily round.
 *
 * A lesson in this course is twenty-five to thirty minutes, which is right for
 * meeting something new and wrong for a Tuesday evening. Before this page, a
 * learner with ten minutes was handed a list of links to three different pages
 * and left to decide — and deciding is exactly the thing a tired person does
 * not do, so they closed the tab.
 *
 * So this is one round with one button. It is assembled from what is genuinely
 * most useful (review that is due, then mistakes that keep coming back, then
 * the lesson in progress), sized to the daily target in Settings, and estimated
 * from the learner's own recorded pace rather than from a number that sounded
 * about right.
 *
 * The parts are played as separate rounds of the same engine, because each one
 * has to be recorded as what it actually is: review answers move review items,
 * lesson answers move lesson progress, and pretending otherwise would put
 * wrong rows in the database to save one component.
 */

const PART_LABEL: Record<SessionPartKind, keyof typeof UI> = {
  review: 'sessionPartReview',
  mistakes: 'sessionPartMistakes',
  lesson: 'sessionPartLesson',
};

const PART_CONTEXT: Record<SessionPartKind, AttemptPayload['context']> = {
  review: 'review',
  mistakes: 'practice',
  lesson: 'lesson',
};

export function SessionPage() {
  const { t, say, lang, lessons, reviewItems, mistakes, stats, profile } = useApp();

  /*
   * The plan is frozen when the round starts. It has to be: every answer
   * changes the review queue and the mistake bank, so a live plan would
   * rebuild itself underneath the learner and the round would never end.
   */
  const [running, setRunning] = useState<SessionPlan | null>(null);
  const [partIndex, setPartIndex] = useState(0);
  const [summaries, setSummaries] = useState<PlayerSummary[] | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startedAt = useRef(0);
  const collected = useRef<PlayerSummary[]>([]);

  const build = useMemo(
    () => sessionBuild(lessons, reviewItems, mistakes, new Date(), lang),
    [lessons, reviewItems, mistakes, lang],
  );
  const preview = useMemo(
    () => planSession(build.sources, profile.dailyTargetMinutes, stats),
    [build, profile.dailyTargetMinutes, stats],
  );
  const pace = secondsPerAnswer(stats);
  const level: CefrLevel = build.lesson?.lesson.level ?? 'pre-a1';

  function start(plan: SessionPlan) {
    collected.current = [];
    startedAt.current = Date.now();
    setSummaries(null);
    setElapsed(null);
    setPartIndex(0);
    setRunning(plan);
  }

  function finishPart(summary: PlayerSummary, plan: SessionPlan) {
    collected.current = [...collected.current, summary];
    if (partIndex + 1 < plan.parts.length) {
      setPartIndex(partIndex + 1);
      return;
    }
    setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
    setSummaries(collected.current);
    setRunning(null);
  }

  const part = running?.parts[partIndex];
  if (running && part) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{t('sessionTitle')}</p>
          <p className="player-header__phase">
            {running.parts.length > 1
              ? `${t('sessionPartOf', { n: partIndex + 1, total: running.parts.length })} — ${t(PART_LABEL[part.kind])}`
              : t(PART_LABEL[part.kind])}
          </p>
        </header>
        <ExercisePlayer
          key={`${part.kind}-${partIndex}`}
          exercises={part.exercises}
          context={PART_CONTEXT[part.kind]}
          level={level}
          {...(part.kind === 'lesson' && build.lesson ? { lessonId: build.lesson.lesson.id } : {})}
          onFinish={(summary) => finishPart(summary, running)}
          onExit={() => {
            setRunning(null);
            setPartIndex(0);
          }}
          exitLabel={t('cancel')}
        />
      </div>
    );
  }

  const total = summaries?.reduce((sum, entry) => sum + entry.total, 0) ?? 0;
  const correct = summaries?.reduce((sum, entry) => sum + entry.firstTryCorrect, 0) ?? 0;

  return (
    <div className="page">
      <h1 className="page__title">{t('sessionTitle')}</h1>
      <p className="page__lede">{t('sessionLede')}</p>

      {summaries ? (
        <Card tone="accent" title={t('sessionFinished')}>
          <p className="done-note">{t('exerciseScore', { correct, total })}</p>
          {elapsed !== null ? (
            /* Measured, not estimated: this is the clock, after the fact. */
            <p className="session-took">{t('sessionTook', { time: formatDuration(elapsed, lang) })}</p>
          ) : null}
        </Card>
      ) : null}

      {preview.steps === 0 ? (
        <Card>
          <EmptyState
            title={t('sessionNothing')}
            body={build.lessonAwaitsMastery ? t('sessionMasteryLeft') : t('sessionNothingBody')}
            action={
              build.lesson ? (
                <Link className="btn btn--primary" to={`/lesson/${build.lesson.lesson.id}`}>
                  {t('sessionOpenLesson')}
                </Link>
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
          title={t('sessionWhatsIn')}
          subtitle={t('dashboardEstimate', { n: estimatedMinutes(preview) })}
        >
          <ol className="session-parts">
            {preview.parts.map((entry) => (
              <li key={entry.kind} className={`session-parts__row session-parts__row--${entry.kind}`}>
                <span className="session-parts__label">
                  {t(PART_LABEL[entry.kind])}
                  {entry.kind === 'lesson' && build.lesson ? (
                    <span className="session-parts__from">{say(build.lesson.lesson.title)}</span>
                  ) : null}
                </span>
                <span className="session-parts__n">{t('sessionAnswers', { n: entry.steps })}</span>
              </li>
            ))}
          </ol>

          <div className="section-nav">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => start(preview)}
              autoFocus
            >
              {summaries ? t('sessionAgain') : t('sessionStart')}
            </button>
          </div>

          {/*
            * The honest footnote. The app does not display invented statistics,
            * and a number of minutes on a button is a statistic — so it says
            * where the number came from, including when the answer is "not from
            * you yet".
            */}
          <p className="card__foot">
            {pace.measured
              ? t('sessionMeasured', { s: pace.seconds, n: stats.totalAnswers })
              : t('sessionDefault', { s: pace.seconds, n: ENOUGH_ANSWERS_TO_MEASURE })}
            {' '}
            {t('sessionTarget', {
              time: tr('settingsMinutes', lang, { n: profile.dailyTargetMinutes }),
            })}
          </p>
        </Card>
      )}

      {build.lessonAwaitsMastery && preview.steps > 0 && build.lesson ? (
        <Card title={say(build.lesson.lesson.title)}>
          <p>{t('sessionMasteryLeft')}</p>
          <Link className="btn btn--ghost" to={`/lesson/${build.lesson.lesson.id}`}>
            {t('sessionOpenLesson')}
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
