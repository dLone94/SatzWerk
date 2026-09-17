import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { checkpointById } from '../../content/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';

/** A unit checkpoint: mixed skills, no hints, result stored. */
export function CheckpointPage() {
  const { checkpointId = '' } = useParams();
  const { t, say, recordCheckpoint, checkpointResults } = useApp();
  const checkpoint = checkpointById(checkpointId);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<PlayerSummary | null>(null);

  if (!checkpoint) {
    return (
      <div className="page">
        <p>{t('errorTitle')}</p>
        <Link className="btn btn--ghost" to="/course">
          {t('navCourse')}
        </Link>
      </div>
    );
  }

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
          level="pre-a1"
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

      <Card tone="accent" title={t('unitCheckpoint')} subtitle={say(checkpoint.description)}>
        <p className="card__foot">
          {t('lessonMasteryIntro')} {'·'} {Math.round(checkpoint.passAccuracy * 100)}%
        </p>

        {summary ? (
          <p className={`done-note${summary.accuracy >= checkpoint.passAccuracy ? '' : ' done-note--warn'}`}>
            {t('exerciseScore', { correct: summary.firstTryCorrect, total: summary.total })}
            {' — '}
            {summary.accuracy >= checkpoint.passAccuracy ? t('lessonMasteryPassed') : t('lessonMasteryFailed')}
          </p>
        ) : null}

        {history.length > 0 ? (
          <p className="card__foot">
            {history.length}
            {'×'} {'·'} {t('statAccuracy')}: {Math.round(best * 100)}%
            {passed ? ` · ${t('lessonMasteryPassed')}` : ''}
          </p>
        ) : null}

        <div className="section-nav">
          <button type="button" className="btn btn--primary btn--lg" onClick={() => setRunning(true)} autoFocus>
            {summary ? t('lessonReplay') : t('lessonStart')}
          </button>
        </div>
      </Card>
    </div>
  );
}
