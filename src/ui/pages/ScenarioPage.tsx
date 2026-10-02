import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CURRICULUM, SCENARIOS, lessonById, scriptAnswerCount, scriptById } from '../../content/browser.ts';
import { useApp } from '../../state/AppState.tsx';
import { ScenarioPlayer } from '../components/ScenarioPlayer.tsx';
import type { PlayerSummary } from '../components/ExercisePlayer.tsx';
import { Card, EmptyState, ScoreRing } from '../components/bits.tsx';

type Stage = 'intro' | 'playing' | 'done';

/**
 * One scenario conversation, start to finish.
 *
 * The score at the end is the same number the lesson player reports: answers
 * right at the first attempt, out of answers asked. Nothing here invents a
 * grade for "handled the situation well", because nothing here can measure
 * that.
 */
/*
 * One page per conversation: keyed by the script, so moving from one to
 * another starts at the new one's introduction, not at the old one's result.
 */
export function ScenarioPage() {
  const { scriptId } = useParams();
  return <ScenarioView key={scriptId} />;
}

function ScenarioView() {
  const { scriptId } = useParams();
  const navigate = useNavigate();
  const { t, say, lang, recordScenarioRun } = useApp();
  const [stage, setStage] = useState<Stage>('intro');
  const [summary, setSummary] = useState<PlayerSummary | null>(null);
  const [runId, setRunId] = useState(0);

  const script = scriptId ? scriptById(scriptId) : undefined;
  const scenario = useMemo(
    () => SCENARIOS.find((entry) => entry.id === script?.scenarioId),
    [script],
  );
  const levelLabel = CURRICULUM.find((level) => level.id === script?.level)?.label ?? script?.level;

  if (!script || !scenario) {
    return (
      <div className="page">
        <EmptyState
          title={t('scenarioMissing')}
          action={
            <Link className="btn btn--primary" to="/real-life">
              {t('scenarioBackToList')}
            </Link>
          }
        />
      </div>
    );
  }

  const turns = scriptAnswerCount(script, lang);

  if (stage === 'playing') {
    return (
      <div className="page page--player" data-study-active="true">
        <h1 className="page__title">{say(scenario.title)}</h1>
        <ScenarioPlayer
          key={runId}
          script={script}
          onExit={() => setStage('intro')}
          onFinish={async (result) => {
            setSummary(result);
            setStage('done');
            await recordScenarioRun(script.id, result.total, result.firstTryCorrect);
          }}
        />
      </div>
    );
  }

  if (stage === 'done' && summary) {
    const clean = summary.total > 0 && summary.firstTryCorrect === summary.total;
    return (
      <div className="page page--player">
        <h1 className="page__title">{t('scenarioFinishedTitle')}</h1>
        <Card title={say(scenario.title)} subtitle={`${levelLabel} · ${say(script.partner)}`}>
          <ScoreRing
            value={summary.accuracy}
            passed={clean}
            caption={t('scenarioScore', { correct: summary.firstTryCorrect, total: summary.total })}
          />
          <p className="scenario__outro">{say(script.outro)}</p>
          {/* A clean run is finished: the way on is out. A run with slips is
              not, so another go is the obvious next step. */}
          <div className="section-nav">
            <button
              type="button"
              className={`btn ${clean ? 'btn--ghost' : 'btn--primary'}`}
              onClick={() => {
                setSummary(null);
                setRunId((id) => id + 1);
                setStage('playing');
              }}
            >
              {t('scenarioAgain')}
            </button>
            <button
              type="button"
              className={`btn ${clean ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => navigate('/real-life')}
            >
              {t('scenarioBackToList')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page page--player">
      <h1 className="page__title">{say(scenario.title)}</h1>
      <p className="page__lede">{say(scenario.setting)}</p>

      <Card title={say(script.goal)} subtitle={`${levelLabel} · ${t('scenarioTurns', { n: turns })}`}>
        <dl className="facts">
          <div>
            <dt>{t('scenarioPartner')}</dt>
            <dd>{say(script.partner)}</dd>
          </div>
          <div>
            <dt>{t('realLifeRegister')}</dt>
            <dd lang="de">{script.register}</dd>
          </div>
        </dl>
        <p className="scenario__register-note">
          {script.register === 'Sie' ? t('scenarioRegisterSie') : t('scenarioRegisterDu')}
        </p>

        {script.lessonIds && script.lessonIds.length > 0 ? (
          <p className="scenario__related">
            {t('realLifeRelated')}:{' '}
            {script.lessonIds.map((id, index) => {
              const lesson = lessonById(id);
              if (!lesson) return null;
              return (
                <span key={id}>
                  {index > 0 ? ', ' : ''}
                  <Link to={`/lesson/${lesson.id}`}>{say(lesson.title)}</Link>
                </span>
              );
            })}
          </p>
        ) : null}

        <button type="button" className="btn btn--primary" autoFocus onClick={() => setStage('playing')}>
          {t('scenarioStart')}
        </button>
      </Card>
    </div>
  );
}
