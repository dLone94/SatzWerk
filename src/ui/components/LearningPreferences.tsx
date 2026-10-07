import { GOAL_LABELS, LEARNING_GOALS, PRACTICE_LEVELS } from '../../core/progress/daily.ts';
import type { CefrLevel } from '../../content/types.ts';
import { useApp } from '../../state/AppState.tsx';
import { buildLessonViews } from '../selectors.ts';

export function inferredPracticeLevel(lessons: ReturnType<typeof useApp>['lessons']): CefrLevel {
  return buildLessonViews(lessons).filter(view => view.started || view.complete).at(-1)?.lesson.level ?? 'pre-a1';
}

export function LearningPreferences() {
  const { t, say, profile, lessons, updateProfile } = useApp();
  const selected = profile.practiceLevel ?? inferredPracticeLevel(lessons);
  return <div className="learning-preferences">
    <fieldset><legend>{t('dailyGoalLabel')}</legend><div className="goal-options">
      {LEARNING_GOALS.map(goal => <button key={goal} type="button"
        className={`goal-option${(profile.learningGoal ?? 'everyday') === goal ? ' is-active' : ''}`}
        aria-pressed={(profile.learningGoal ?? 'everyday') === goal}
        onClick={() => void updateProfile({ learningGoal: goal })}>{say(GOAL_LABELS[goal])}</button>)}
    </div></fieldset>
    <div className="learning-preferences__row">
      <label><span>{t('dailyLevelLabel')}</span><select value={selected}
        onChange={event => void updateProfile({ practiceLevel: event.target.value as CefrLevel })}>
        {PRACTICE_LEVELS.map(level => <option key={level} value={level}>{level === 'pre-a1' ? t('dailyBeginner') : level.toUpperCase()}</option>)}
      </select></label>
      <label><span>{t('dailyWeeklyLabel')}</span><select value={profile.weeklyTargetDays ?? 4}
        onChange={event => void updateProfile({ weeklyTargetDays: Number(event.target.value) })}>
        {[1, 2, 3, 4, 5, 6, 7].map(days => <option key={days} value={days}>{t('dailyDays', { n: days })}</option>)}
      </select></label>
    </div>
    <p className="learning-preferences__note">{t('dailyWeeklyNote')}</p>
  </div>;
}
