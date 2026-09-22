import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkpointById, levelById, unitById } from '../../content/index.ts';
import type { CefrLevel } from '../../content/types.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, EmptyState, ScoreRing } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';

/** A checkpoint, unit or level: mixed skills, no hints, result stored. */
export function CheckpointPage() {
  const { checkpointId = '' } = useParams();
  const { t, say, recordCheckpoint, checkpointResults } = useApp();
  const checkpoint = checkpointById(checkpointId);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  if (!checkpoint) {
    return (
      <div className="page">
        <EmptyState
          title={t('checkpointMissing')}
          action={
            <Link className="btn btn--primary" to="/course">
              {t('navCourse')}
            </Link>
          }
        />
      </div>
    );
  }

  /*
   * The level the checkpoint belongs to, rather than "pre-a1" for every one of
   * them. It is what a review item falls back to and what an explanation of a
   * mistake is pitched at — so a B2 checkpoint was explaining its mistakes as
   * if to a beginner.
   */
  const level: CefrLevel =
    unitById(checkpoint.targetId)?.level ?? levelById(checkpoint.targetId)?.id ?? 'pre-a1';

  const history = checkpointResults.filter((result) => result.checkpointId === checkpoint.id);
  const best = history.reduce((max, result) => Math.max(max, result.accuracy), 0);
  const passed = history.some((result) => result.passed);

  const finish = async (result: PlayerSummary) => {
    setSummary(result);
    setRunning(false);
    await recordCheckpoint({
      checkpointId: checkpoint.id,
      scope: checkpoint.scope,
      targetId: checkpoint.targetId,
      accuracy: result.accuracy,
      passed: result.accuracy >= checkpoint.passAccuracy,
    });
  };

  if (running) {
    return (
      <div className="page page--player">
        <header className="player-header">
          <p className="player-header__lesson">{say(checkpoint.title)}</p>
          <p className="player-header__phase">{t('unitCheckpoint')}</p>
        </header>
        <ExercisePlayer
          exercises={checkpoint.exercises}
          context="checkpoint"
          level={level}
          allowHints={false}
          onFinish={(result) => void finish(result)}
          onExit={() => setRunning(false)}
          exitLabel={t('cancel')}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="crumbs">
        <Link to="/course">{t('navCourse')}</Link>
      </nav>
      <h1 className="page__title">{say(checkpoint.title)}</h1>

      {/*
        A level checkpoint called itself a unit checkpoint here, on both of the
        two that exist. The scope is already on the checkpoint; the page just
        was not asking.
      */}
      <Card
        tone="accent"
        title={checkpoint.scope === 'level' ? t('levelCheckpoint') : t('unitCheckpoint')}
        subtitle={say(checkpoint.description)}
      >
        <p className="card__foot">
          {t('lessonMasteryIntro')} {'·'} {Math.round(checkpoint.passAccuracy * 100)}%
        </p>

        {summary ? (
          <>
            <ScoreRing
              value={summary.accuracy}
              passed={summary.accuracy >= checkpoint.passAccuracy}
              caption={t('exerciseScore', { correct: summary.firstTryCorrect, total: summary.total })}
            />
            <p className={`done-note${summary.accuracy >= checkpoint.passAccuracy ? '' : ' done-note--warn'}`}>
              {summary.accuracy >= checkpoint.passAccuracy ? t('checkpointPassed') : t('checkpointFailed')}
            </p>
          </>
        ) : null}

        {history.length > 0 ? (
          <p className="card__foot">
            {history.length}
            {'×'} {'·'} {t('statAccuracy')}: {Math.round(best * 100)}%
            {passed ? ` · ${t('checkpointPassed')}` : ''}
          </p>
        ) : null}

        {/*
          * A way on, not only a way round again.
          *
          * The only button here used to be "Practise again" — after a pass as
          * much as after a fail — so a learner who had just passed a unit had
          * a finished screen whose one action was to sit the same test again,
          * and a small breadcrumb as the only way forward. A pass now leads to
          * Today, which knows what comes next; a fail still offers the retry
          * first, as the thing worth doing.
          */}
        <div className="section-nav">
          {!summary ? (
            <button type="button" className="btn btn--primary btn--lg" onClick={() => setRunning(true)} autoFocus>
              {t('lessonStart')}
            </button>
          ) : summary.accuracy >= checkpoint.passAccuracy ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setRunning(true)}>
                {t('checkpointAgain')}
              </button>
              <Link className="btn btn--primary btn--lg" to="/" autoFocus>
                {t('navToday')}
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/course">
                {t('navCourse')}
              </Link>
              <button type="button" className="btn btn--primary btn--lg" onClick={() => setRunning(true)} autoFocus>
                {t('checkpointAgain')}
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
