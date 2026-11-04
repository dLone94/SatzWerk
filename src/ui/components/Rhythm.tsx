import { useId, type CSSProperties } from 'react';
import { todayHere } from '../../core/progress/days.ts';
import { practiceWeek, weeklyPractice } from '../../core/progress/daily.ts';
import { useApp } from '../../state/AppState.tsx';
import { Icon } from './icons.tsx';

/**
 * The day's goal and the week's practice days, together.
 *
 * Today used to measure the same effort three ways in three places: a ring
 * of minutes against the daily goal, bars of minutes for the last seven days,
 * and "0 / 4 practice days this week" at the foot of the page, each counted
 * differently. Now there are two measures, side by side and named: today's
 * active minutes against the daily goal, and this week's practice days
 * against the weekly goal, Monday to Sunday as that goal counts them. The
 * finished daily practice shows the same widget, so the day's dot filling in
 * there is the dot Today shows afterwards.
 */
export function Rhythm({ celebrate = false }: { celebrate?: boolean }) {
  const { t, lang, studyDays, profile } = useApp();
  const titleId = useId();
  const now = new Date();
  const minutes = Math.floor((studyDays.find((day) => day.day === todayHere(now))?.secondsActive ?? 0) / 60);
  const target = Math.max(1, profile.dailyTargetMinutes);
  const left = Math.max(0, target - minutes);
  const week = weeklyPractice(studyDays, profile.weeklyTargetDays ?? 4, now);
  const days = practiceWeek(studyDays, now);
  const locale = lang === 'bg' ? 'bg-BG' : 'en-GB';
  const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  return (
    <section className={`rhythm${celebrate ? ' rhythm--celebrate' : ''}`} aria-labelledby={titleId}>
      <h2 className="rhythm__title" id={titleId}>{t('studioRhythm')}</h2>
      <div className="rhythm__body">
        <div className="rhythm__today">
          <GoalRing done={minutes} target={target} />
          <div>
            <p className="rhythm__label">{t('settingsDailyTarget')}</p>
            <p className="rhythm__main">{t('todayGoal', { target })}</p>
            <p className={`rhythm__note${left === 0 ? ' rhythm__note--done' : ''}`}>
              {left === 0 ? <><Icon name="check" size={14} />{t('todayGoalDone')}</> : t('todayGoalLeft', { n: left })}
            </p>
          </div>
        </div>
        <div className="rhythm__week">
          <p className="rhythm__label">
            {t('rhythmWeek')}
            <strong className={week.left === 0 ? 'is-done' : undefined}>
              {t('rhythmWeekDays', { done: week.done, target: week.goal })}
            </strong>
          </p>
          <ol className="rhythm__days">
            {days.map((day) => {
              const name = long.format(day.date);
              const state = day.practised ? 'practised' : day.ahead ? 'ahead' : 'rest';
              return (
                <li key={day.day} className={`rhythm__day rhythm__day--${state}`} aria-current={day.today ? 'date' : undefined}>
                  <span className="rhythm__dot" aria-hidden="true">
                    {day.practised ? <Icon name="check" size={14} /> : null}
                  </span>
                  <span aria-hidden="true">{short.format(day.date)}</span>
                  <span className="visually-hidden">
                    {t(state === 'practised' ? 'rhythmDayPractised' : state === 'ahead' ? 'rhythmDayAhead' : 'rhythmDayRest',
                      { day: name })}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="rhythm__note">
            {week.done === 0 ? t('studioWeekEmpty') : week.left > 0 ? t('dailyWeekLeft', { n: week.left }) : t('dailyWeekDone')}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Minutes studied today against the daily goal, as a ring. A met goal is
 * drawn as met, with a tick that lands once, so the ring says it before the
 * words under it are read.
 */
export function GoalRing({ done, target }: { done: number; target: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const share = Math.min(1, done / target);
  const style = { '--ring-c': circumference, '--ring-target': circumference * (1 - share) } as CSSProperties;
  return (
    <div className={`goal-ring${share >= 1 ? ' goal-ring--done' : ''}`} style={style}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="goal-ring__track" cx="32" cy="32" r={r} />
        <circle className="goal-ring__value" cx="32" cy="32" r={r} />
      </svg>
      <span className="goal-ring__num">{done}</span>
      {share >= 1 ? <span className="goal-ring__badge" aria-hidden="true"><Icon name="check" size={12} /></span> : null}
    </div>
  );
}
