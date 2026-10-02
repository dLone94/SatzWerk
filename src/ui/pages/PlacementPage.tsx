import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CURRICULUM, PLACEMENT_CHECKPOINT, lessonsInOrder } from '../../content/browser.ts';
import type { CefrLevel } from '../../content/types.ts';
import {
  placementResult,
  type PlacementAnswer,
  type PlacementResult,
} from '../../core/progress/placement.ts';
import { useApp } from '../../state/AppState.tsx';
import { ExercisePlayer } from '../components/ExercisePlayer.tsx';
import { Card } from '../components/bits.tsx';

/**
 * Where should I start?
 *
 * The result screen is the whole point, and it is deliberately not a grade.
 * It shows the bands — how many questions were asked at each level and how
 * many came back right first time — then one recommendation derived from
 * them, and then a way to disagree: the level above and the level below are
 * both one click away. Twenty questions cannot certify anybody, and the
 * screen says so in the learner's own language rather than implying a
 * precision it does not have.
 */
export function PlacementPage() {
  const { t, say, recordCheckpoint } = useApp();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const answers = useMemo(() => new Map<string, PlacementAnswer>(), []);

  /** Which level each placement step belongs to, taken from its exercise. */
  const levelOf = useMemo(() => {
    const map = new Map<string, CefrLevel>();
    for (const exercise of PLACEMENT_CHECKPOINT.exercises) {
      for (const step of exercise.steps) map.set(step.id, exercise.level);
    }
    return map;
  }, []);

  const levelsOffered = useMemo(
    () => CURRICULUM.filter((level) => level.units.length > 0).map((level) => level.id),
    [],
  );

  const firstLessonOf = (level: CefrLevel) =>
    lessonsInOrder().find((lesson) => lesson.level === level);

  if (running) {
    return (
      <div className="page page--player">
        <h1 className="page__title">{say(PLACEMENT_CHECKPOINT.title)}</h1>
        <ExercisePlayer
          exercises={PLACEMENT_CHECKPOINT.exercises}
          context="checkpoint"
          level="pre-a1"
          allowHints={false}
          allowSkip
          onStepDone={({ stepId, correct }) => {
            const level = levelOf.get(stepId);
            if (level) answers.set(stepId, { stepId, level, correct });
          }}
          onFinish={async () => {
            const scored = placementResult([...answers.values()], levelsOffered);
            setResult(scored);
            setRunning(false);
            await recordCheckpoint({
              checkpointId: PLACEMENT_CHECKPOINT.id,
              scope: 'placement',
              targetId: scored.startAt,
              accuracy: scored.asked > 0 ? scored.right / scored.asked : 0,
              passed: false,
            });
          }}
          onExit={() => setRunning(false)}
          exitLabel={t('cancel')}
        />
      </div>
    );
  }

  if (result) {
    const startLevel = CURRICULUM.find((level) => level.id === result.startAt);
    const startIndex = levelsOffered.indexOf(result.startAt);
    const below = startIndex > 0 ? levelsOffered[startIndex - 1] : undefined;
    const above = startIndex >= 0 ? levelsOffered[startIndex + 1] : undefined;
    const lesson = firstLessonOf(result.startAt);

    return (
      <div className="page page--player">
        <h1 className="page__title">{t('placementResultTitle')}</h1>

        <Card
          tone="accent"
          title={`${t('placementStartAt')}: ${startLevel?.label ?? result.startAt}`}
          subtitle={startLevel ? say(startLevel.title) : undefined}
        >
          <p className="placement__caveat">
            {result.toppedOut
              ? t('placementToppedOut')
              : t('placementCaveat', { asked: result.asked })}
          </p>

          <h3 className="mini-head">{t('placementBands')}</h3>
          <ul className="bands">
            {result.bands
              .filter((band) => band.asked > 0)
              .map((band) => {
                const label = CURRICULUM.find((level) => level.id === band.level)?.label ?? band.level;
                return (
                  <li key={band.level} className={band.passed ? 'bands__row--passed' : undefined}>
                    <span className="bands__level">{label}</span>
                    <span className="bands__score">
                      {band.right} / {band.asked}
                    </span>
                    {/*
                      * Only one band is "the first gap" — the one the
                      * recommendation is built on. Labelling the levels above
                      * it the same way would claim the check had found three
                      * gaps when it stopped looking after the first.
                      */}
                    <span className="bands__verdict">
                      {band.passed
                        ? t('placementBandKnown')
                        : band.level === result.startAt
                          ? t('placementBandGap')
                          : t('placementBandNotYet')}
                    </span>
                  </li>
                );
              })}
          </ul>

          <div className="section-nav">
            {lesson ? (
              <Link className="btn btn--primary btn--lg" to={`/lesson/${lesson.id}`}>
                {t('placementOpenFirstLesson')}
              </Link>
            ) : null}
            <button type="button" className="btn btn--ghost" onClick={() => navigate('/course')}>
              {t('placementSeeCourse')}
            </button>
          </div>

          {/*
            * The escape hatch, and it is not decoration.
            *
            * Twenty questions know less about the learner than the learner
            * does. Somebody who guessed two answers right, or who reads far
            * better than they write, should be able to overrule this in one
            * click rather than be told where they belong.
            */}
          <p className="placement__override">
            {t('placementDisagree')}{' '}
            {below ? (
              <Link to={`/lesson/${firstLessonOf(below)?.id ?? ''}`}>
                {CURRICULUM.find((level) => level.id === below)?.label}
              </Link>
            ) : null}
            {below && above ? ' · ' : null}
            {above ? (
              <Link to={`/lesson/${firstLessonOf(above)?.id ?? ''}`}>
                {CURRICULUM.find((level) => level.id === above)?.label}
              </Link>
            ) : null}
          </p>
        </Card>

        <div className="section-nav">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              answers.clear();
              setResult(null);
              setRunning(true);
            }}
          >
            {t('placementAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--player">
      <h1 className="page__title">{say(PLACEMENT_CHECKPOINT.title)}</h1>
      <Card tone="accent" title={t('placementIntroTitle')} subtitle={say(PLACEMENT_CHECKPOINT.description)}>
        <p className="placement__caveat">{t('placementHonesty')}</p>
        <div className="section-nav">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            autoFocus
            onClick={() => {
              answers.clear();
              setRunning(true);
            }}
          >
            {t('placementStart')}
          </button>
          <Link className="btn btn--ghost" to="/course">
            {t('placementSkip')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
