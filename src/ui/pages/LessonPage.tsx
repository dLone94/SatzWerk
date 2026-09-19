import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonById, sectionBlocks, unitForLesson, vocabById } from '../../content/index.ts';
import type { Lesson, TeachingSection } from '../../content/types.ts';
import {
  isLessonComplete,
  lessonRequirements,
  needsRecovery,
  recoveryStepIds,
} from '../../core/progress/lesson.ts';
import { useApp } from '../../state/AppState.tsx';
import { Blocks, Card, Meter, ScoreRing, VocabRow } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';

type Stage = 'overview' | 'sections' | 'practice' | 'recovery' | 'mastery' | 'done';

/**
 * A lesson, start to finish.
 *
 * The stages mirror the lesson flow from the brief: objective, teaching
 * sections, guided and free practice, an automatic recovery round when the
 * practice went badly, and a mastery check with no hints.
 */
export function LessonPage() {
  const { lessonId = '' } = useParams();
  const { t, say, lang, lessonProgress, markSectionSeen, recordMastery, recordRecovery, completeLesson } = useApp();

  const lesson = lessonById(lessonId);
  const progress = lessonProgress(lessonId);
  const [stage, setStage] = useState<Stage>('overview');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [lastSummary, setLastSummary] = useState<PlayerSummary | null>(null);
  const [masteryPassed, setMasteryPassed] = useState<boolean | null>(null);

  const sections = useMemo<TeachingSection[]>(
    () => (lesson ? lesson.sections.filter((section) => !section.only || section.only.includes(lang)) : []),
    [lesson, lang],
  );

  const section = sections[sectionIndex];

  // Mark a section as read once it is actually on screen.
  useEffect(() => {
    if (stage !== 'sections' || !section || !lesson) return;
    if (progress.sectionsSeen.includes(section.id)) return;
    void markSectionSeen(lesson.id, section.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, section?.id, lesson?.id]);

  const onPracticeFinish = useCallback(
    (summary: PlayerSummary) => {
      setLastSummary(summary);
      if (!lesson) return;
      const latest = lessonProgress(lesson.id);
      if (needsRecovery(lesson, latest)) {
        void recordRecovery(lesson.id);
        setStage('recovery');
      } else {
        setStage('mastery');
      }
    },
    [lesson, lessonProgress, recordRecovery],
  );

  const onMasteryFinish = useCallback(
    async (summary: PlayerSummary) => {
      if (!lesson) return;
      setLastSummary(summary);
      const updated = await recordMastery(lesson.id, summary.accuracy, lesson.mastery.passAccuracy);
      const passed = updated.mastery.passed;
      setMasteryPassed(passed);
      if (passed && isLessonComplete(lesson, updated)) {
        await completeLesson(lesson.id);
      }
      setStage('done');
    },
    [lesson, recordMastery, completeLesson],
  );

  if (!lesson) {
    return (
      <div className="page">
        <p>{t('errorTitle')}</p>
        <Link className="btn btn--ghost" to="/course">
          {t('navCourse')}
        </Link>
      </div>
    );
  }

  const unit = unitForLesson(lesson.id);
  const requirements = lessonRequirements(lesson, progress);
  const satisfied = requirements.filter((requirement) => requirement.satisfied).length;
  const complete = isLessonComplete(lesson, progress);

  if (stage === 'practice') {
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonPhasePractice')} />
        <ExercisePlayer
          exercises={lesson.exercises}
          context="lesson"
          level={lesson.level}
          lessonId={lesson.id}
          onFinish={onPracticeFinish}
          onExit={() => setStage('overview')}
        />
      </div>
    );
  }

  if (stage === 'recovery') {
    const stepIds = recoveryStepIds(lesson, lessonProgress(lesson.id));
    if (stepIds.length === 0) {
      setStage('mastery');
      return null;
    }
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonRecovery')} />
        <p className="page__lede">{t('lessonRecoveryIntro')}</p>
        <ExercisePlayer
          exercises={lesson.exercises}
          onlyStepIds={stepIds}
          context="practice"
          level={lesson.level}
          lessonId={lesson.id}
          onFinish={() => setStage('mastery')}
          onExit={() => setStage('overview')}
        />
      </div>
    );
  }

  if (stage === 'mastery') {
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonMastery')} />
        <p className="page__lede">{t('lessonMasteryIntro')}</p>
        <ExercisePlayer
          exercises={lesson.mastery.exercises}
          context="mastery"
          level={lesson.level}
          lessonId={lesson.id}
          allowHints={false}
          onFinish={(summary) => void onMasteryFinish(summary)}
          onExit={() => setStage('overview')}
        />
      </div>
    );
  }

  if (stage === 'sections' && section) {
    return (
      <div className="page">
        <PlayerHeader lesson={lesson} phase={t('lessonSections')} />
        <div className="section-progress">
          <Meter value={sectionIndex + 1} max={sections.length} label={t('lessonSections')} />
          <span>
            {sectionIndex + 1} / {sections.length}
          </span>
        </div>

        <Card title={say(section.title)}>
          <Blocks blocks={sectionBlocks(section, lang)} />

          {section.vocabIds && section.vocabIds.length > 0 ? (
            <div className="word-list">
              <h4 className="mini-head">{t('lessonWordList')}</h4>
              {section.vocabIds.map((id) => {
                const entry = vocabById(id);
                return entry ? <VocabRow key={id} entry={entry} /> : null;
              })}
            </div>
          ) : null}
        </Card>

        <div className="section-nav">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((index) => index - 1)}
          >
            {t('lessonPrevSection')}
          </button>
          {sectionIndex + 1 < sections.length ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setSectionIndex((index) => index + 1)}
              autoFocus
            >
              {t('lessonNextSection')}
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={() => setStage('practice')} autoFocus>
              {t('lessonToExercises')}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="page">
        <Card
          title={masteryPassed ? t('lessonMasteryPassed') : t('lessonMastery')}
          tone="accent"
          subtitle={
            lastSummary
              ? t('exerciseScore', { correct: lastSummary.firstTryCorrect, total: lastSummary.total })
              : undefined
          }
        >
          {lastSummary ? (
            <ScoreRing
              value={lastSummary.accuracy}
              passed={masteryPassed === true}
              caption={t('exerciseScore', {
                correct: lastSummary.firstTryCorrect,
                total: lastSummary.total,
              })}
            />
          ) : null}

          {masteryPassed ? (
            <>
              {complete ? <p className="done-note">{t('lessonCompleted')}</p> : null}
              {lesson.summary ? <Blocks blocks={lesson.summary} /> : null}
            </>
          ) : (
            <p className="done-note">{t('lessonMasteryFailed')}</p>
          )}

          <Requirements lesson={lesson} />

          <div className="section-nav">
            <Link className="btn btn--ghost" to="/course">
              {t('navCourse')}
            </Link>
            {masteryPassed ? (
              <Link className="btn btn--primary" to="/">
                {t('navToday')}
              </Link>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setStage('sections')}>
                {t('lessonReplay')}
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Overview
  return (
    <div className="page">
      <nav className="crumbs">
        <Link to="/course">{t('navCourse')}</Link>
        {unit ? <span>{say(unit.title)}</span> : null}
      </nav>

      <h1 className="page__title">{say(lesson.title)}</h1>

      <Card title={t('lessonObjective')} tone="accent">
        <p className="objective">{say(lesson.objective)}</p>
        <h4 className="mini-head">{t('lessonOutcomes')}</h4>
        <ul className="outcomes__list">
          {lesson.outcomes.map((outcome, index) => (
            <li key={index}>{say(outcome)}</li>
          ))}
        </ul>
        <p className="card__foot">{t('lessonMinutes', { n: lesson.estimatedMinutes })}</p>
      </Card>

      <Card title={t('lessonRequirements')}>
        <Requirements lesson={lesson} />
        <div className="section-nav">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => {
              setSectionIndex(0);
              setStage('sections');
            }}
            autoFocus
          >
            {satisfied > 0 ? t('lessonContinue') : t('lessonStart')}
          </button>
          {Object.keys(progress.practice).length > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={() => setStage('practice')}>
              {t('lessonToExercises')}
            </button>
          ) : null}
          {progress.mastery.attempts > 0 || complete ? (
            <button type="button" className="btn btn--ghost" onClick={() => setStage('mastery')}>
              {t('lessonMastery')}
            </button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

function PlayerHeader({ lesson, phase }: { lesson: Lesson; phase: string }) {
  const { say } = useApp();
  return (
    <header className="player-header">
      <p className="player-header__lesson">{say(lesson.title)}</p>
      <p className="player-header__phase">{phase}</p>
    </header>
  );
}

function Requirements({ lesson }: { lesson: Lesson }) {
  const { say, lessonProgress } = useApp();
  const requirements = lessonRequirements(lesson, lessonProgress(lesson.id));
  return (
    <ul className="requirements">
      {requirements.map((requirement) => (
        <li key={requirement.id} className={requirement.satisfied ? 'is-done' : ''}>
          <span className="requirements__mark" aria-hidden="true">
            {requirement.satisfied ? '✓' : '○'}
          </span>
          <span className="requirements__label">{say(requirement.label)}</span>
          {requirement.total !== undefined ? (
            <span className="requirements__count">
              {requirement.done} / {requirement.total}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
