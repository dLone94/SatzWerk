import { Link } from 'react-router-dom';
import { weeklyPractice } from '../../core/progress/daily.ts';
import { useApp } from '../../state/AppState.tsx';
import { practicalAbilities } from '../dailyBuilder.ts';
import { Icon } from './icons.tsx';

export function PracticalProgress() {
  const { t, say, scenarioRuns, profile, studyDays } = useApp();
  const week = weeklyPractice(studyDays, profile.weeklyTargetDays ?? 4);
  const abilities = practicalAbilities(scenarioRuns);
  return <section className="practical-progress" aria-labelledby="practical-progress-title">
    <div className="practical-progress__head"><div><p className="section-eyebrow">{t('dailyRealProgress')}</p>
      <h2 id="practical-progress-title">{t('dailyAbilitiesTitle')}</h2></div>
      <span className="weekly-goal">{t('dailyWeekProgress', { done: week.done, target: week.goal })}</span></div>
    <p className="muted">{week.left > 0 ? t('dailyWeekLeft', { n: week.left }) : t('dailyWeekDone')}</p>
    {abilities.length > 0 ? <ul className="ability-list">{abilities.slice(0, 4).map(({ script, scenario, run }) =>
      <li key={script.id}><span className="ability-list__icon"><Icon name={run.bestAccuracy >= 0.8 ? 'check' : 'chat'} size={20} /></span>
        <span><Link to={`/scenario/${script.id}`}>{say(scenario.title)}</Link>
          <span>{say(script.goal)}</span><small>{t(run.bestAccuracy >= 0.8 ? 'dailyAbilityConfident' : 'dailyAbilityPractised',
            { n: Math.round(run.bestAccuracy * 100) })}</small></span></li>)}</ul>
      : <p className="practical-progress__empty">{t('dailyAbilitiesEmpty')}</p>}
  </section>;
}
