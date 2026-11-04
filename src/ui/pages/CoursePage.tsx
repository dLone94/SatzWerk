import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CURRICULUM, LEVEL_OUTLINES, checkpointById, unitForLesson } from '../../content/browser.ts';
import type { CefrLevel, Level, Unit } from '../../content/types.ts';
import { isLessonComplete } from '../../core/progress/lesson.ts';
import { useApp } from '../../state/AppState.tsx';
import { Meter, StatusBadge } from '../components/bits.tsx';
import { Icon } from '../components/icons.tsx';
import { saveLevel } from '../../services/offline.ts';
import {
  buildLessonViews,
  checkpointLevel,
  checkpointToTake,
  lessonInProgress,
  nextAction,
  nextNewLesson,
  standingPlacement,
} from '../selectors.ts';
import { DackelScene } from '../components/Dackel.tsx';
import { WoodScene } from '../three/WoodScene.tsx';
import { pathBoard } from '../three/board.ts';

/**
 * The course, as a path.
 *
 * One level at a time: all five levels on one page came to 35,000 pixels of
 * scrolling on a phone. Each unit is a winding line of stops, the one you are
 * on is the one that stands out, and a planned lesson is plainly an outline
 * with nothing to click, as it always was.
 */
export function CoursePage() {
  const { t, say, lessons, reviewItems, mistakes, profile, checkpointResults } = useApp();
  const [params, setParams] = useSearchParams();

  // Where you are: the lesson Today would send you to, else the one in hand,
  // else the next new one (from the placed level, while a placement stands).
  // Its level opens by default.
  const views = buildLessonViews(lessons);
  const action = nextAction(lessons, reviewItems, mistakes, profile.onboarded, checkpointResults);
  const placed = standingPlacement(lessons, checkpointResults);
  const suggested = action.to.startsWith('/lesson/') ? action.to.slice('/lesson/'.length) : undefined;
  const current = (views.find(view => view.lesson.id === suggested) ?? lessonInProgress(views, placed) ??
    nextNewLesson(views, placed))?.lesson;
  // Today may send you to the checkpoint closing the unit just finished; then
  // its level opens and it comes before the next lesson here too. The next
  // lesson stays marked on the trail all the same, so where to go on after
  // the checkpoint is still plain.
  const checkpointFirst = action.kind === 'checkpoint' ? checkpointById(action.to.slice('/checkpoint/'.length)) : undefined;
  const firstLevel = (checkpointFirst ? checkpointLevel(checkpointFirst) : undefined) ?? current?.level;
  const chosen = CURRICULUM.find((level) => level.id === params.get('level'));
  const level = chosen ?? CURRICULUM.find((entry) => entry.id === firstLevel) ?? CURRICULUM[0]!;
  const [downloads, setDownloads] = useState<Record<string, 'saving' | 'saved' | 'failed'>>({});
  const download = downloads[level.id];
  const checkpointHere = checkpointFirst && checkpointLevel(checkpointFirst) === level.id ? checkpointFirst : undefined;
  const nextCheckpoint = checkpointHere ?? checkpointToTake(level, lessons, checkpointResults);
  const lessonFirst = Boolean(current && current.level === level.id && !checkpointHere);
  // Where you are, as a board game: the unit of the lesson in hand, its
  // lessons as they really stand. Decoration with a name; the trail below
  // is the way into each lesson.
  const boardUnit = current ? unitForLesson(current.id) : undefined;
  const board = boardUnit ? pathBoard(boardUnit.lessons.map((lesson) => ({
    available: lesson.status === 'available',
    complete: isLessonComplete(lesson, lessons[lesson.id] ?? empty(lesson.id)),
    current: lesson.id === current?.id,
  }))) : null;
  const pawnLesson = board && boardUnit ? boardUnit.lessons[board.current] : undefined;
  const dackel = <DackelScene className="course-welcome__scene hw-scene" />;

  return (
    <div className="page course">
      <div className="course-welcome"><div><p className="section-eyebrow">{t('playCourse')}</p>
        <h1 className="page__title">{t('courseTitle')}</h1>
      <p className="page__lede">
        {t('courseSubtitle')}{' '}
        <Link to="/placement" className="course__placement">
          {t('placementNav')}
        </Link>
      </p></div>{board && boardUnit ? (
        <WoodScene
          spec={board.spec}
          className="course-welcome__scene hw-scene"
          fallback={dackel}
          label={pawnLesson
            ? t('scenePathLabel', { unit: say(boardUnit.title), done: board.done, total: board.count, place: board.current + 1, lesson: say(pawnLesson.title) })
            : t('scenePathDoneLabel', { unit: say(boardUnit.title), total: board.count })}
        />
      ) : dackel}</div>

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

      {current && lessonFirst ? (
        <Link className="course-continue" to={`/lesson/${current.id}`}>
          <span className="course-continue__icon"><Icon name="play" /></span>
          <span><strong>{t('courseJump')}</strong><span>{say(current.title)}</span></span>
          <Icon name="arrow" />
        </Link>
      ) : nextCheckpoint ? <Link className="course-continue" to={`/checkpoint/${nextCheckpoint.id}`}>
        <span className="course-continue__icon"><Icon name="target" /></span>
        <span><strong>{t('courseJumpCheckpoint')}</strong><span>{say(nextCheckpoint.title)}</span></span>
        <Icon name="arrow" />
      </Link> : null}
      <LevelPath key={level.id} level={level} currentLessonId={current?.id}
        currentUnitId={nextCheckpoint?.scope === 'unit' ? nextCheckpoint.targetId : undefined}
        checkpointFirst={Boolean(checkpointHere)} />
      {'serviceWorker' in navigator ? <aside className="offline-level">
        <div><strong>{t('offlineLevel')}</strong><p>{t('offlineLevelNote')}</p></div>
        <button type="button" className="btn btn--secondary" disabled={download === 'saving'} onClick={async () => {
          const id = level.id;
          setDownloads(previous => ({ ...previous, [id]: 'saving' }));
          const saved = await saveLevel(id);
          setDownloads(previous => ({ ...previous, [id]: saved ? 'saved' : 'failed' }));
        }}>{t(download === 'saving' ? 'offlineSaving' : download === 'saved' ? 'offlineSaved' : 'offlineLevel')}</button>
        <span role="status">{download === 'failed' ? t('offlineFailed') : ''}</span>
      </aside> : null}
    </div>
  );
}

/**
 * One level's trail. The unit holding the current lesson is open; when the
 * checkpoint closing a unit comes first (`checkpointFirst`), that unit opens
 * too, and with no current lesson in this level the next checkpoint's unit
 * stands in for it.
 */
function LevelPath({ level, currentLessonId, currentUnitId, checkpointFirst = false }: {
  level: Level;
  currentLessonId?: string;
  currentUnitId?: string;
  checkpointFirst?: boolean;
}) {
  const { t, say, lessons } = useApp();
  const authored = level.units.flatMap((unit) => unit.lessons).filter((lesson) => lesson.status === 'available');
  const complete = authored.filter((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? empty(lesson.id)));
  const currentUnit = level.units.find(unit => unit.lessons.some(lesson => lesson.id === currentLessonId)) ?? level.units.find(unit => unit.id === currentUnitId) ??
    level.units.find(unit => unit.lessons.some(lesson => !isLessonComplete(lesson, lessons[lesson.id] ?? empty(lesson.id)))) ?? level.units[0];
  const open = new Set([currentUnit?.id, checkpointFirst ? currentUnitId : undefined]);
  const outline = LEVEL_OUTLINES[level.id as Exclude<CefrLevel, 'c1' | 'c2'>];
  const gate = useCheckpointStanding(level.checkpoint?.id);

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
        <UnitPath key={unit.id} unit={unit} currentLessonId={currentLessonId} defaultOpen={open.has(unit.id)} />
      ))}

      {/* Like a unit's: a target until passed, and it says how it stands. */}
      {level.checkpoint ? (
        <Link
          className="level-gate"
          to={`/checkpoint/${level.checkpoint.id}`}
          aria-labelledby={`${level.checkpoint.id}-title`}
          aria-describedby={`${level.checkpoint.id}-desc ${level.checkpoint.id}-meta`}
        >
          <span className="level-gate__icon">
            <Icon name={gate.passed ? 'check' : 'target'} />
          </span>
          <span className="level-gate__text">
            <span className="level-gate__title" id={`${level.checkpoint.id}-title`}>{t('levelCheckpoint')}</span>
            <span className="level-gate__desc" id={`${level.checkpoint.id}-desc`}>{say(level.checkpoint.description)}</span>
            <span className="level-gate__status" id={`${level.checkpoint.id}-meta`}>{gate.status}</span>
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

type Stop =
  | { kind: 'lesson'; id: string; state: 'done' | 'now' | 'started' | 'todo' | 'planned'; started: boolean }
  | { kind: 'checkpoint'; id: string };

function UnitPath({ unit, currentLessonId, defaultOpen }: { unit: Unit; currentLessonId?: string; defaultOpen: boolean }) {
  const { t, say, lessons } = useApp();
  const [open, setOpen] = useState(defaultOpen);
  const { passed, status } = useCheckpointStanding(unit.checkpoint?.id);

  const stops: Stop[] = unit.lessons.map((lesson) => {
    if (lesson.status !== 'available') return { kind: 'lesson', id: lesson.id, state: 'planned', started: false };
    const progress = lessons[lesson.id] ?? empty(lesson.id);
    const started = progress.sectionsSeen.length > 0 || Object.keys(progress.practice).length > 0;
    const state = isLessonComplete(lesson, progress)
      ? 'done'
      : lesson.id === currentLessonId
        ? 'now'
        : started
          ? 'started'
          : 'todo';
    return { kind: 'lesson', id: lesson.id, state, started };
  });
  if (unit.checkpoint) stops.push({ kind: 'checkpoint', id: unit.checkpoint.id });

  const done = stops.filter((stop) => stop.kind === 'lesson' && stop.state === 'done').length;
  const lessonCount = unit.lessons.length;
  return (
    <details className="unit-path" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary className="unit-path__banner" aria-labelledby={`unit-${unit.id}`}>
        <h3 className="unit-path__title" id={`unit-${unit.id}`}>
          <span className="unit-path__n">{unit.order}</span>
          <span className="unit-path__heading"><span>{say(unit.title)}</span><span className="unit-path__sub">{t('courseUnitProgress', { done, total: lessonCount })}{passed ? ` · ${t('courseCheckpointDone')}` : ''}</span></span>
        </h3>
        {unit.status === 'available' ? (
          <span className="unit-path__count">
            {done} / {lessonCount}
          </span>
        ) : (
          <StatusBadge status={unit.status} />
        )}
        <Icon name="chevron" size={18} className="unit-path__chevron" />
      </summary>
      <div className="unit-path__body"><p className="unit-path__summary">{say(unit.summary)}</p>

      <div className="unit-path__trail">
        <ol className="unit-path__stops">
          {stops.map((stop, index) => {
            if (stop.kind === 'checkpoint') {
              // The tick is earned, as it is on a lesson: the gate wore one
              // before it was ever opened, the same tick as a finished lesson.
              // Until it is passed it is a target, and says whether it has
              // been tried.
              return (
                <li key={stop.id} className="trail-stop trail-stop--gate">
                  <Link
                    to={`/checkpoint/${stop.id}`}
                    className="trail-stop__link"
                    aria-labelledby={`${stop.id}-title`}
                    aria-describedby={`${stop.id}-meta`}
                  >
                    <span className="trail-stop__dot">
                      <Icon name={passed ? 'check' : 'target'} size={20} />
                    </span>
                    <span className="trail-stop__label">
                      <span className="trail-stop__title" id={`${stop.id}-title`}>{say(unit.checkpoint!.title)}</span>
                      <span className="trail-stop__meta" id={`${stop.id}-meta`}>{status}</span>
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
                  {/* "In progress" only for a lesson that has been opened: the
                      one you are on, never touched, is next, not under way. */}
                  {stop.state === 'planned'
                    ? t('statusPlanned')
                    : `${t('lessonMinutes', { n: lesson.estimatedMinutes })}${
                        stop.state === 'done'
                          ? ` · ${t('lessonCompleted')}`
                          : stop.started
                            ? ` · ${t('statusPartial')}`
                            : stop.state === 'now'
                              ? ` · ${t('todayUpNext')}`
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
              <li key={stop.id} className={`trail-stop trail-stop--${stop.state}`}>
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
      </div>
    </details>
  );
}

/** How a checkpoint stands: passed, the best score so far, or not taken yet. */
function useCheckpointStanding(checkpointId?: string): { passed: boolean; status: string } {
  const { t, checkpointResults } = useApp();
  const results = checkpointResults.filter((result) => result.checkpointId === checkpointId);
  const passed = results.some((result) => result.passed);
  const best = Math.round(Math.max(0, ...results.map((result) => result.accuracy)) * 100);
  return {
    passed,
    status: passed
      ? t('courseCheckpointDone')
      : results.length > 0
        ? t('courseCheckpointBest', { n: best })
        : t('courseCheckpointNotTaken'),
  };
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
