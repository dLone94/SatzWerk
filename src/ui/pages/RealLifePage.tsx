import { Link } from 'react-router-dom';
import {
  CURRICULUM,
  SCENARIOS,
  lessonById,
  scenarioStatus,
  scriptFor,
} from '../../content/browser.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, StatusBadge } from '../components/bits.tsx';

/**
 * Real Life.
 *
 * Every stage is either playable or it is not, and the page says which — the
 * status comes from whether a script exists, so it cannot drift from the truth.
 * Where a conversation has been played, what is shown is what happened: how
 * many times, and the best share of answers right at the first attempt. There
 * is no completion percentage for a scenario nobody has opened.
 */
export function RealLifePage() {
  const { t, say, lang, scenarioRuns } = useApp();
  const levelLabels = new Map(CURRICULUM.map((level) => [level.id, level.label]));
  const runFor = (scriptId: string) => scenarioRuns.find((run) => run.scriptId === scriptId);

  return (
    <div className="page">
      <h1 className="page__title">{t('realLifeTitle')}</h1>
      <p className="page__lede">{t('realLifeSubtitle')}</p>

      <div className="grid grid--2">
        {SCENARIOS.map((scenario) => {
          const status = scenarioStatus(scenario);
          return (
            <Card
              key={scenario.id}
              title={say(scenario.title)}
              subtitle={say(scenario.setting)}
              actions={<StatusBadge status={status} />}
            >
              <p className="scenario__register">
                {t('realLifeRegister')}:{' '}
                <strong lang="de">
                  {scenario.register === 'both' ? 'du / Sie' : scenario.register}
                </strong>
              </p>

              <h3 className="mini-head">{t('realLifeStages')}</h3>
              <ul className="stages">
                {scenario.stages.map((stage) => {
                  const script = scriptFor(scenario.id, stage.level);
                  const run = script ? runFor(script.id) : undefined;
                  return (
                    <li key={stage.level} className={script ? 'stages__row--playable' : undefined}>
                      <span className="stages__level">
                        {levelLabels.get(stage.level) ?? stage.level}
                      </span>
                      <span className="stages__task">
                        {say(stage.task)}
                        {run ? (
                          <span className="stages__run">
                            {t('realLifeDoneTimes', { n: run.runs })} {'·'}{' '}
                            {t('realLifeBest', { percent: Math.round(run.bestAccuracy * 100) })}
                          </span>
                        ) : null}
                      </span>
                      {script ? (
                        <Link className="btn btn--primary btn--sm" to={`/scenario/${script.id}`}>
                          {run ? t('realLifeReplay') : t('realLifePlay')}
                        </Link>
                      ) : (
                        <span className="stages__pending">{t('realLifeNotWritten')}</span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {scenario.relatedLessonIds && scenario.relatedLessonIds.length > 0 ? (
                <p className="scenario__related">
                  {t('realLifeRelated')}:{' '}
                  {scenario.relatedLessonIds.map((id, index) => {
                    const lesson = lessonById(id);
                    if (!lesson) return null;
                    return (
                      <span key={id}>
                        {index > 0 ? ', ' : ''}
                        <Link to={`/lesson/${lesson.id}`}>{lesson.title[lang]}</Link>
                      </span>
                    );
                  })}
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
