import { Link } from 'react-router-dom';
import { CURRICULUM, LEVEL_OUTLINES } from '../../content/index.ts';
import type { CefrLevel, Level, Unit } from '../../content/types.ts';
import { isLessonComplete, lessonRequirements } from '../../core/progress/lesson.ts';
import { useApp } from '../../state/AppState.tsx';
import { Card, Meter, StatusBadge } from '../components/bits.tsx';

/**
 * The level map.
 *
 * The important property here is honesty: an authored lesson is a link, and a
 * planned one is plainly labelled as an outline with nothing to click.
 */
export function CoursePage() {
  const { t } = useApp();

  return (
    <div className="page">
      <h1 className="page__title">{t('courseTitle')}</h1>
      <p className="page__lede">{t('courseSubtitle')}</p>

      {CURRICULUM.map((level) => (
        <LevelCard key={level.id} level={level} />
      ))}
    </div>
  );
}

function LevelCard({ level }: { level: Level }) {
  const { t, say, lessons } = useApp();
  const authored = level.units.flatMap((unit) => unit.lessons).filter((lesson) => lesson.status === 'available');
  const complete = authored.filter((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? empty(lesson.id)));
  const outline = LEVEL_OUTLINES[level.id as Exclude<CefrLevel, 'c1' | 'c2'>];

  return (
    <Card
      title={
        <span className="level-title">
          <span className="level-title__label">{level.label}</span>
          <span>{say(level.title)}</span>
        </span>
      }
      subtitle={say(level.description)}
      actions={<StatusBadge status={level.status} />}
    >
      {authored.length > 0 ? (
        <div className="level-progress">
          <Meter value={complete.length} max={authored.length} label={level.label} />
          <span>
            {complete.length} / {authored.length} {t('of')} {t('statLessonsDone').toLowerCase()}
          </span>
        </div>
      ) : null}

      <details className="outcomes">
        <summary>{t('levelOutcomes')}</summary>
        <ul className="outcomes__list">
          {level.outcomes.map((outcome, index) => (
            <li key={index}>{say(outcome)}</li>
          ))}
        </ul>
      </details>

      {level.units.map((unit) => (
        <UnitBlock key={unit.id} unit={unit} />
      ))}

      {level.checkpoint ? (
        <div className="checkpoint-row checkpoint-row--level">
          <div>
            <p className="checkpoint-row__title">{say(level.checkpoint.title)}</p>
            <p className="checkpoint-row__desc">{say(level.checkpoint.description)}</p>
          </div>
          <Link className="btn btn--primary" to={`/checkpoint/${level.checkpoint.id}`}>
            {t('levelCheckpoint')}
          </Link>
        </div>
      ) : null}

      {level.units.length === 0 ? (
        <>
          <p className="planned-notice">{t('plannedNotice')}</p>
          <div className="grid grid--2">
            <div>
              <h4 className="mini-head">{t('levelTopics')}</h4>
              <ul className="pill-list">
                {level.outline?.topics.map((topic, index) => (
                  <li key={index}>{say(topic)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mini-head">{t('levelGrammar')}</h4>
              <ul className="pill-list">
                {level.outline?.grammar.map((item, index) => (
                  <li key={index}>{say(item)}</li>
                ))}
              </ul>
            </div>
          </div>
          {outline ? (
            <>
              <h4 className="mini-head">{t('plannedUnits')}</h4>
              <ol className="planned-units">
                {outline.plannedUnits.map((unit, index) => (
                  <li key={index}>{say(unit)}</li>
                ))}
              </ol>
            </>
          ) : null}
        </>
      ) : null}

      {/*
        A level that is partly authored still owes the learner the rest of the
        picture. Before this, a level showed what is planned only while it was
        completely empty — so the moment its first unit landed, the five units
        that do not exist yet silently disappeared from the page, which reads as
        a finished level.
      */}
      {level.units.length > 0 && (outline?.plannedUnits.length ?? 0) > 0 ? (
        <div className="planned-rest">
          <h4 className="mini-head">{t('plannedUnits')}</h4>
          <ol className="planned-units" start={level.units.length + 1}>
            {outline!.plannedUnits.map((unit, index) => (
              <li key={index}>{say(unit)}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </Card>
  );
}

function UnitBlock({ unit }: { unit: Unit }) {
  const { t, say, lessons } = useApp();

  return (
    <div className="unit">
      <header className="unit__head">
        <h3 className="unit__title">
          {unit.order}. {say(unit.title)}
        </h3>
        <StatusBadge status={unit.status} />
      </header>
      <p className="unit__summary">{say(unit.summary)}</p>

      <ol className="lesson-list">
        {unit.lessons.map((lesson) => {
          const progress = lessons[lesson.id] ?? empty(lesson.id);
          const requirements = lessonRequirements(lesson, progress);
          const done = requirements.filter((requirement) => requirement.satisfied).length;
          const complete = isLessonComplete(lesson, progress);
          const started = progress.sectionsSeen.length > 0 || Object.keys(progress.practice).length > 0;

          if (lesson.status !== 'available') {
            return (
              <li key={lesson.id} className="lesson-row lesson-row--planned">
                <span className="lesson-row__title">{say(lesson.title)}</span>
                <StatusBadge status={lesson.status} />
              </li>
            );
          }

          return (
            <li key={lesson.id} className={`lesson-row${complete ? ' is-complete' : ''}`}>
              <Link to={`/lesson/${lesson.id}`} className="lesson-row__title">
                {say(lesson.title)}
              </Link>
              <span className="lesson-row__meta">
                <span className="lesson-row__time">{t('lessonMinutes', { n: lesson.estimatedMinutes })}</span>
                <span className="lesson-row__req">
                  {done} / {requirements.length}
                </span>
                {complete ? (
                  <span className="badge badge--available">{t('lessonCompleted')}</span>
                ) : started ? (
                  <span className="badge badge--partial">{t('statusPartial')}</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>

      {unit.checkpoint ? (
        <div className="checkpoint-row">
          <div>
            <p className="checkpoint-row__title">{say(unit.checkpoint.title)}</p>
            <p className="checkpoint-row__desc">{say(unit.checkpoint.description)}</p>
          </div>
          <Link className="btn btn--ghost" to={`/checkpoint/${unit.checkpoint.id}`}>
            {t('unitCheckpoint')}
          </Link>
        </div>
      ) : null}

      {unit.plannedLessons && unit.plannedLessons.length > 0 ? (
        <ul className="pill-list pill-list--muted">
          {unit.plannedLessons.map((planned, index) => (
            <li key={index}>{say(planned)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function empty(lessonId: string) {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}
