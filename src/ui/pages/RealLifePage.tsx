import { Link } from 'react-router-dom';
import { CURRICULUM, SCENARIOS, lessonById } from '../../content/index.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, StatusBadge } from '../components/bits.tsx';

/**
 * Real Life.
 *
 * This is the roadmap, presented as a roadmap. Nothing here is playable in
 * Milestone 1, and the page says so rather than offering buttons that do
 * nothing. Where a scenario's language is already taught, it links to the
 * lesson that teaches it, which is real.
 */
export function RealLifePage() {
  const { t, say, lang } = useApp();
  const levelLabels = new Map(CURRICULUM.map((level) => [level.id, level.label]));

  return (
    <div className="page">
      <h1 className="page__title">{t('realLifeTitle')}</h1>
      <p className="page__lede">{t('realLifeSubtitle')}</p>

      <div className="grid grid--2">
        {SCENARIOS.map((scenario) => (
          <Card
            key={scenario.id}
            title={say(scenario.title)}
            subtitle={say(scenario.setting)}
            actions={<StatusBadge status={scenario.status} />}
          >
            <p className="scenario__register">
              {t('realLifeRegister')}:{' '}
              <strong lang="de">
                {scenario.register === 'both' ? 'du / Sie' : scenario.register}
              </strong>
            </p>

            <h4 className="mini-head">{t('realLifeStages')}</h4>
            <ul className="stages">
              {scenario.stages.map((stage, index) => (
                <li key={index}>
                  <span className="stages__level">{levelLabels.get(stage.level) ?? stage.level}</span>
                  <span>{say(stage.task)}</span>
                </li>
              ))}
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
        ))}
      </div>
    </div>
  );
}
