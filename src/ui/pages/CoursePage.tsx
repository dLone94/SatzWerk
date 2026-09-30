import { Link, useSearchParams } from 'react-router-dom';
import { CURRICULUM, LEVEL_OUTLINES } from '../../content/index.ts';
import type { CefrLevel, Level, Unit } from '../../content/types.ts';
import { isLessonComplete } from '../../core/progress/lesson.ts';
import { useApp } from '../../state/AppState.tsx';
import { Meter, StatusBadge } from '../components/bits.tsx';
import { Icon } from '../components/icons.tsx';
import { buildLessonViews } from '../selectors.ts';

/**
 * The course, as a path.
 *
 * One level at a time: all five levels on one page came to 35,000 pixels of
 * scrolling on a phone. Each unit is a winding line of stops, the one you are
 * on is the one that stands out, and a planned lesson is plainly an outline
 * with nothing to click, as it always was.
 */
export function CoursePage() {
  const { t, lessons } = useApp();
  const [params, setParams] = useSearchParams();

  // Where you are: the first lesson not finished. Its level opens by default.
  const views = buildLessonViews(lessons);
  const current = views.find((view) => !view.complete)?.lesson;
  const chosen = CURRICULUM.find((level) => level.id === params.get('level'));
  const level = chosen ?? CURRICULUM.find((entry) => entry.id === current?.level) ?? CURRICULUM[0]!;

  return (
    <div className="page course">
      <h1 className="page__title">{t('courseTitle')}</h1>
      <p className="page__lede">
        {t('courseSubtitle')}{' '}
        <Link to="/placement" className="course__placement">
          {t('placementNav')}
        </Link>
      </p>

      <nav className="levels" aria-label={t('courseTitle')}>
        {CURRICULUM.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`levels__item${entry.id === level.id ? ' is-active' : ''}`}
            aria-pressed={entry.id === level.id}
            onClick={() => setParams({ level: entry.id }, { replace: true })}
          >
            {entry.label}
          </button>
        ))}
      </nav>

      <LevelPath level={level} currentLessonId={current?.id} />
    </div>
  );
}

function LevelPath({ level, currentLessonId }: { level: Level; currentLessonId?: string }) {
  const { t, say, lessons } = useApp();
  const authored = level.units.flatMap((unit) => unit.lessons).filter((lesson) => lesson.status === 'available');
  const complete = authored.filter((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? empty(lesson.id)));
  const outline = LEVEL_OUTLINES[level.id as Exclude<CefrLevel, 'c1' | 'c2'>];

  return (
    <section className="level" aria-labelledby={`level-${level.id}`}>
      <header className="level__head">
        <h2 className="level__title" id={`level-${level.id}`}>
          <span className="level__label">{level.label}</span>
          <span>{say(level.title)}</span>
        </h2>
        {level.status !== 'available' ? <StatusBadge status={level.status} /> : null}
      </header>
      <p className="level__desc">{say(level.description)}</p>

      {authored.length > 0 ? (
        <div className="level-progress">
          <Meter value={complete.length} max={authored.length} label={level.label} />
          <span>
            {t('levelLessonsDone', { done: complete.length, total: authored.length })}
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
        <UnitPath key={unit.id} unit={unit} currentLessonId={currentLessonId} />
      ))}

      {level.checkpoint ? (
        <Link className="level-gate" to={`/checkpoint/${level.checkpoint.id}`}>
          <span className="level-gate__icon">
            <Icon name="check" />
          </span>
          <span className="level-gate__text">
            <span className="level-gate__title">{t('levelCheckpoint')}</span>
            <span className="level-gate__desc">{say(level.checkpoint.description)}</span>
          </span>
          <Icon name="arrow" size={20} />
        </Link>
      ) : null}

      {level.units.length === 0 ? (
        <div className="card">
          <p className="planned-notice">{t('plannedNotice')}</p>
          <div className="grid grid--2">
            <div>
              <h3 className="mini-head">{t('levelTopics')}</h3>
              <ul className="pill-list">
                {level.outline?.topics.map((topic, index) => (
                  <li key={index}>{say(topic)}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mini-head">{t('levelGrammar')}</h3>
              <ul className="pill-list">
                {level.outline?.grammar.map((item, index) => (
                  <li key={index}>{say(item)}</li>
                ))}
              </ul>
            </div>
          </div>
          {outline ? (
            <>
              <h3 className="mini-head">{t('plannedUnits')}</h3>
              <ol className="planned-units">
                {outline.plannedUnits.map((unit, index) => (
                  <li key={index}>{say(unit)}</li>
                ))}
              </ol>
            </>
          ) : null}
        </div>
      ) : null}

      {/*
        A level that is partly authored still owes the learner the rest of the
        picture: the units that do not exist yet stay listed, so a partly
        written level never reads as a finished one.
      */}
      {level.units.length > 0 && (outline?.plannedUnits.length ?? 0) > 0 ? (
        <div className="planned-rest">
          <h3 className="mini-head">{t('plannedUnits')}</h3>
          <ol className="planned-units" start={level.units.length + 1}>
            {outline!.plannedUnits.map((unit, index) => (
              <li key={index}>{say(unit)}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

/** How far each stop leans right, in turn: the line winds instead of dropping. */
const SWAY = [0, 40, 80, 40];
const ROW = 92;
const NODE_X = 30;

type Stop =
  | { kind: 'lesson'; id: string; state: 'done' | 'now' | 'started' | 'todo' | 'planned' }
  | { kind: 'checkpoint'; id: string };

function UnitPath({ unit, currentLessonId }: { unit: Unit; currentLessonId?: string }) {
  const { t, say, lessons } = useApp();

  const stops: Stop[] = unit.lessons.map((lesson) => {
    if (lesson.status !== 'available') return { kind: 'lesson', id: lesson.id, state: 'planned' };
    const progress = lessons[lesson.id] ?? empty(lesson.id);
    const started = progress.sectionsSeen.length > 0 || Object.keys(progress.practice).length > 0;
    const state = isLessonComplete(lesson, progress)
      ? 'done'
      : lesson.id === currentLessonId
        ? 'now'
        : started
          ? 'started'
          : 'todo';
    return { kind: 'lesson', id: lesson.id, state };
  });
  if (unit.checkpoint) stops.push({ kind: 'checkpoint', id: unit.checkpoint.id });

  const done = stops.filter((stop) => stop.kind === 'lesson' && stop.state === 'done').length;
  const lessonCount = unit.lessons.length;
  const points = stops.map((_, index) => ({ x: NODE_X + SWAY[index % SWAY.length]!, y: index * ROW + ROW / 2 }));
  const line = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1]!;
      const mid = (prev.y + point.y) / 2;
      return `C ${prev.x} ${mid}, ${point.x} ${mid}, ${point.x} ${point.y}`;
    })
    .join(' ');

  return (
    <section className="unit-path" aria-labelledby={`unit-${unit.id}`}>
      <header className="unit-path__banner">
        <h3 className="unit-path__title" id={`unit-${unit.id}`}>
          <span className="unit-path__n">{unit.order}</span>
          {say(unit.title)}
        </h3>
        {unit.status === 'available' ? (
          <span className="unit-path__count">
            {done} / {lessonCount}
          </span>
        ) : (
          <StatusBadge status={unit.status} />
        )}
      </header>
      <p className="unit-path__summary">{say(unit.summary)}</p>

      <div className="unit-path__trail" style={{ height: stops.length * ROW }}>
        <svg
          className="unit-path__line"
          width={NODE_X * 2 + Math.max(...SWAY)}
          height={stops.length * ROW}
          aria-hidden="true"
        >
          <path d={line} />
        </svg>
        <ol className="unit-path__stops">
          {stops.map((stop, index) => {
            const style = { top: points[index]!.y, left: points[index]!.x };
            if (stop.kind === 'checkpoint') {
              return (
                <li key={stop.id} className="trail-stop trail-stop--gate" style={style}>
                  <Link to={`/checkpoint/${stop.id}`} className="trail-stop__link">
                    <span className="trail-stop__dot">
                      <Icon name="check" size={20} />
                    </span>
                    <span className="trail-stop__label">
                      <span className="trail-stop__title">{say(unit.checkpoint!.title)}</span>
                    </span>
                  </Link>
                </li>
              );
            }
            const lesson = unit.lessons[index]!;
            // Named by its title alone; the time and state are its description,
            // so a screen reader says "Introducing yourself" and then the rest.
            const label = (
              <span className="trail-stop__label">
                <span className="trail-stop__title" id={`${lesson.id}-title`}>
                  {say(lesson.title)}
                </span>
                <span className="trail-stop__meta" id={`${lesson.id}-meta`}>
                  {stop.state === 'planned'
                    ? t('statusPlanned')
                    : `${t('lessonMinutes', { n: lesson.estimatedMinutes })}${
                        stop.state === 'done'
                          ? ` · ${t('lessonCompleted')}`
                          : stop.state === 'started' || stop.state === 'now'
                            ? ` · ${t('statusPartial')}`
                            : ''
                      }`}
                </span>
              </span>
            );
            const dot = (
              <span className="trail-stop__dot">
                {stop.state === 'done' ? (
                  <Icon name="check" size={20} />
                ) : stop.state === 'now' ? (
                  <Icon name="play" size={20} />
                ) : stop.state === 'planned' ? (
                  <Icon name="lock" size={18} />
                ) : (
                  index + 1
                )}
              </span>
            );
            return (
              <li key={stop.id} className={`trail-stop trail-stop--${stop.state}`} style={style}>
                {stop.state === 'planned' ? (
                  <span className="trail-stop__link">
                    {dot}
                    {label}
                  </span>
                ) : (
                  <Link
                    to={`/lesson/${lesson.id}`}
                    className="trail-stop__link"
                    aria-labelledby={`${lesson.id}-title`}
                    aria-describedby={`${lesson.id}-meta`}
                    aria-current={stop.state === 'now' ? 'step' : undefined}
                  >
                    {dot}
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {unit.plannedLessons && unit.plannedLessons.length > 0 ? (
        <ul className="pill-list pill-list--muted">
          {unit.plannedLessons.map((planned, index) => (
            <li key={index}>{say(planned)}</li>
          ))}
        </ul>
      ) : null}
    </section>
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
