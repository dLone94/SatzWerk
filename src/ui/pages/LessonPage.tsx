import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lessonById, sectionBlocks, unitForLesson, vocabById } from '../../content/index.ts';
import type { Lesson, TeachingSection } from '../../content/types.ts';
import {
  allStepIds,
  isLessonComplete,
  masteryPassMark,
  lessonRequirements,
  needsRecovery,
  recoveryStepIds,
} from '../../core/progress/lesson.ts';
import { useApp } from '../../state/AppState.tsx';
import { nextAction } from '../selectors.ts';
import { Blocks, Card, EmptyState, Meter, ScoreRing, VocabRow } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';

type Stage = 'overview' | 'sections' | 'practice' | 'recovery' | 'mastery' | 'saving' | 'done';

/*
 * One page per lesson.
 *
 * The router keeps the same component when only the id in the address
 * changes, so "Up next" used to open the next lesson with this one's state:
 * the celebration, the score and all. Keying by the id starts every lesson
 * from its own overview.
 */
export function LessonPage() {
  const { lessonId = '' } = useParams();
  return <LessonView key={lessonId} />;
}

/**
 * A lesson, start to finish.
 *
 * The stages mirror the lesson flow from the brief: objective, teaching
 * sections, guided and free practice, an automatic recovery round when the
 * practice went badly, and a mastery check with no hints.
 */
function LessonView() {
  const { lessonId = '' } = useParams();
  const {
    t,
    say,
    lang,
    lessons,
    reviewItems,
    mistakes,
    lessonProgress,
    markSectionSeen,
    recordMastery,
    recordRecovery,
    completeLesson,
  } = useApp();

  const lesson = lessonById(lessonId);
  const progress = lessonProgress(lessonId);
  const [stage, setStage] = useState<Stage>('overview');
  /** The steps this practice run covers: the unfinished ones when resuming. */
  const [resumeSteps, setResumeSteps] = useState<string[] | undefined>(undefined);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [lastSummary, setLastSummary] = useState<PlayerSummary | null>(null);
  const [masteryPassed, setMasteryPassed] = useState<boolean | null>(null);
  /** Passed and every other requirement met: the lesson is really done. */
  const [finished, setFinished] = useState(false);
  /** The Quick redo's questions, fixed when it starts. */
  const [recoverySteps, setRecoverySteps] = useState<string[]>([]);
  /** A result is being saved; a second one must not be sent meanwhile. */
  const saving = useRef(false);
  /**
   * This practice run is to finish what a passed check left open. Decided
   * when the run starts: replaying a lesson that was already complete still
   * ends with the check.
   */
  const finishingOpen = useRef(false);
  /** The sections are being read to finish a lesson whose check is passed. */
  const [readingToFinish, setReadingToFinish] = useState(false);

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
    async (summary: PlayerSummary) => {
      setLastSummary(summary);
      if (!lesson) return;
      const latest = lessonProgress(lesson.id);
      /*
       * The check is already passed and this run was to finish what was left
       * open. Finishing it finishes the lesson; sitting the same check again
       * would prove nothing new.
       */
      if (finishingOpen.current && latest.mastery.passed) {
        const done = isLessonComplete(lesson, latest);
        setMasteryPassed(true);
        setFinished(done);
        if (done) {
          setStage('saving');
          await completeLesson(lesson.id);
        }
        setStage('done');
        return;
      }
      if (needsRecovery(lesson, latest)) {
        void recordRecovery(lesson.id);
        // Fixed here, not worked out on every render while the round runs.
        const stepIds = recoveryStepIds(lesson, latest);
        if (stepIds.length > 0) {
          setRecoverySteps(stepIds);
          setStage('recovery');
          return;
        }
      }
      setStage('mastery');
    },
    [lesson, lessonProgress, recordRecovery, completeLesson],
  );

  const onMasteryFinish = useCallback(
    async (summary: PlayerSummary) => {
      if (!lesson || saving.current) return;
      saving.current = true;
      setLastSummary(summary);
      // Off the question at once: the result can take seconds to save, and
      // the last question must not sit there answerable meanwhile.
      setStage('saving');
      try {
        const updated = await recordMastery(
          lesson.id,
          summary.accuracy,
          masteryPassMark(lesson.mastery.passAccuracy, summary.total),
        );
        const passed = updated.mastery.passed;
        const done = passed && isLessonComplete(lesson, updated);
        setMasteryPassed(passed);
        setFinished(done);
        if (done) {
          await completeLesson(lesson.id);
        }
        setStage('done');
      } finally {
        saving.current = false;
      }
    },
    [lesson, recordMastery, completeLesson],
  );

  /** The last unread section is read, and the check was passed before. */
  const onReadingFinish = useCallback(async () => {
    if (!lesson || saving.current) return;
    const done = isLessonComplete(lesson, lessonProgress(lesson.id));
    setReadingToFinish(false);
    setFinished(done);
    if (done) {
      saving.current = true;
      setStage('saving');
      try {
        await completeLesson(lesson.id);
      } finally {
        saving.current = false;
      }
    }
    setStage('done');
  }, [lesson, lessonProgress, completeLesson]);

  if (!lesson) {
    return (
      <div className="page">
        <EmptyState
          title={t('lessonMissing')}
          action={
            <Link className="btn btn--primary" to="/course">
              {t('navCourse')}
            </Link>
          }
        />
      </div>
    );
  }

  const unit = unitForLesson(lesson.id);
  const complete = isLessonComplete(lesson, progress);

  /*
   * A lesson on a phone is done in pieces. Coming back to one half-finished
   * picks up at the first unfinished question instead of question one; a
   * finished or untouched practice runs whole. Fixed when the run starts, so
   * the list does not shrink under the learner as they answer.
   */
  const startPractice = () => {
    const all = allStepIds(lesson);
    const open = all.filter((id) => !progress.practice[id]?.resolved);
    setResumeSteps(open.length > 0 && open.length < all.length ? open : undefined);
    finishingOpen.current = progress.mastery.passed && !complete;
    setReadingToFinish(false);
    setStage('practice');
  };
  const allSectionsSeen = lesson.sections.every((item) => progress.sectionsSeen.includes(item.id));
  const practiceUnderway = Object.keys(progress.practice).length > 0;
  const started = progress.sectionsSeen.length > 0 || practiceUnderway;
  const allResolved = allStepIds(lesson).every((id) => progress.practice[id]?.resolved);
  // Each button says where it goes: "Start" and "Start the exercises" side by
  // side, halfway through a lesson, told the learner neither.
  const exercisesLabel = allResolved
    ? t('lessonReplay')
    : practiceUnderway
      ? t('lessonContinueExercises')
      : t('lessonToExercises');
  const mainGoesToPractice = allSectionsSeen && practiceUnderway && !complete;
  const mainLabel = complete
    ? t('lessonReadAgain')
    : !started
      ? t('lessonStart')
      : mainGoesToPractice
        ? exercisesLabel
        : t('lessonContinueReading');

  if (stage === 'practice') {
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonPhasePractice')} />
        {/* Each stage keys its own player, so no round inherits the last
            one's position or score. */}
        <ExercisePlayer
          key="practice"
          exercises={lesson.exercises}
          onlyStepIds={resumeSteps}
          context="lesson"
          level={lesson.level}
          lessonId={lesson.id}
          onFinish={(summary) => void onPracticeFinish(summary)}
          onExit={() => setStage('overview')}
        />
      </div>
    );
  }

  if (stage === 'recovery') {
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonRecovery')} />
        <p className="page__lede">{t('lessonRecoveryIntro')}</p>
        <ExercisePlayer
          key="recovery"
          exercises={lesson.exercises}
          onlyStepIds={recoverySteps}
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
          key="mastery"
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

  if (stage === 'saving') {
    return (
      <div className="page page--player">
        <PlayerHeader lesson={lesson} phase={t('lessonMastery')} />
        <p className="page__lede" role="status">
          {t('lessonSavingResult')}
        </p>
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
          ) : readingToFinish ? (
            <button type="button" className="btn btn--primary" onClick={() => void onReadingFinish()} autoFocus>
              {t('lessonFinishLesson')}
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={startPractice} autoFocus>
              {exercisesLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    // The celebration is for a finished lesson, not only a passed check: the
    // two can differ, and confetti over "not finished yet" contradicts itself.
    if (masteryPassed && finished && lastSummary) {
      // Where to go from here: the same next step Today would offer, unless
      // the app has not caught up with this lesson being finished yet (offline,
      // say) and would send you straight back into it.
      const next = nextAction(lessons, reviewItems, mistakes, true);
      const onward = next.to !== `/lesson/${lesson.id}` && next.kind !== 'idle' ? next : null;
      return (
        <div className="page">
          <section className="done-hero" aria-labelledby="done-hero-title">
            <Confetti />
            <ScoreRing
              value={lastSummary.accuracy}
              passed
              caption={t('exerciseScore', { correct: lastSummary.firstTryCorrect, total: lastSummary.total })}
            />
            <p className="done-hero__de" lang="de">
              {lastSummary.accuracy >= 0.8 ? 'Gut gemacht!' : 'Geschafft!'}
            </p>
            <h1 className="done-hero__title" id="done-hero-title">
              {t('lessonDoneTitle')}
              <span>{say(lesson.title)}</span>
            </h1>
            {lesson.vocabIds.length > 0 ? (
              <p className="done-hero__fact">{t('lessonNewWords', { n: lesson.vocabIds.length })}</p>
            ) : null}
            <div className="done-hero__actions">
              {onward ? (
                <Link className="done-hero__next" to={onward.to}>
                  <span className="done-hero__next-label">{t('lessonUpNext')}</span>
                  <span className="done-hero__next-title">{say(onward.title)}</span>
                </Link>
              ) : null}
              <div className="done-hero__more">
                <Link className="btn btn--on-hero" to="/">
                  {t('navToday')}
                </Link>
                <Link className="btn btn--on-hero" to="/course">
                  {t('navCourse')}
                </Link>
              </div>
            </div>
          </section>

          {lesson.summary ? (
            <Card title={t('lessonMasteryPassed')}>
              <Blocks blocks={lesson.summary} />
            </Card>
          ) : null}
          <Card>
            <Requirements lesson={lesson} />
          </Card>
        </div>
      );
    }

    // Passed, but something else is still open: usually a question or two
    // left unfinished. Say how many, and lead straight to them.
    const openSteps = allStepIds(lesson).filter((id) => !progress.practice[id]?.resolved).length;
    const finishOpen = Boolean(masteryPassed) && !complete && openSteps > 0;
    // Or, with every exercise done, a teaching section never opened: the
    // screen used to say nothing and offer only the way to Today.
    const unreadSections = lesson.sections.filter((item) => !progress.sectionsSeen.includes(item.id)).length;
    const firstUnread = sections.findIndex((item) => !progress.sectionsSeen.includes(item.id));
    const finishReading = Boolean(masteryPassed) && !complete && !finishOpen && unreadSections > 0 && firstUnread >= 0;
    return (
      <div className="page">
        <Card title={t('lessonMastery')} tone="accent">
          {lastSummary ? (
            <ScoreRing
              value={lastSummary.accuracy}
              passed={Boolean(masteryPassed)}
              caption={t('exerciseScore', {
                correct: lastSummary.firstTryCorrect,
                total: lastSummary.total,
              })}
            />
          ) : null}

          {masteryPassed ? (
            complete ? (
              <p className="done-note">{t('lessonCompleted')}</p>
            ) : finishOpen ? (
              <p className="done-note done-note--warn">{t('lessonStepsLeft', { n: openSteps })}</p>
            ) : finishReading ? (
              <p className="done-note done-note--warn">{t('lessonSectionsLeft', { n: unreadSections })}</p>
            ) : null
          ) : (
            <p className="done-note done-note--warn">{t('lessonMasteryFailed')}</p>
          )}

          <Requirements lesson={lesson} />

          <div className="section-nav">
            <Link className="btn btn--ghost" to="/course">
              {t('navCourse')}
            </Link>
            {finishOpen ? (
              <button type="button" className="btn btn--primary" onClick={startPractice} autoFocus>
                {t('lessonFinishRemaining', { n: openSteps })}
              </button>
            ) : finishReading ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  setSectionIndex(firstUnread);
                  setReadingToFinish(true);
                  setStage('sections');
                }}
                autoFocus
              >
                {t('lessonReadRemaining', { n: unreadSections })}
              </button>
            ) : masteryPassed ? (
              <Link className="btn btn--primary" to="/">
                {t('navToday')}
              </Link>
            ) : (
              <>
                {/*
                  * Two ways back, not one. Practising again is still the
                  * suggestion, so it stays primary — but it used to be the
                  * only door, and it led through every teaching section and
                  * all the exercises again to reach a five-question check.
                  * Somebody who scored three of five and knows which two they
                  * fumbled can now simply try again; the overview already
                  * offered this, the screen that needed it did not.
                  *
                  * "Practise again" goes to the practice. It used to open the
                  * teaching section last on screen, usually the Summary.
                  */}
                <button type="button" className="btn btn--ghost" onClick={() => setStage('mastery')}>
                  {t('lessonMasteryRetry')}
                </button>
                <button type="button" className="btn btn--primary" onClick={startPractice}>
                  {t('lessonReplay')}
                </button>
              </>
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
              // Back where the learner stopped: in the exercises if the reading
              // is done, otherwise at the first section not yet read.
              if (mainGoesToPractice) {
                startPractice();
                return;
              }
              const unread = lesson.sections.findIndex((item) => !progress.sectionsSeen.includes(item.id));
              setSectionIndex(unread > 0 && !complete ? unread : 0);
              setReadingToFinish(false);
              setStage('sections');
            }}
            autoFocus
          >
            {mainLabel}
          </button>
          {practiceUnderway && !mainGoesToPractice ? (
            <button type="button" className="btn btn--ghost" onClick={startPractice}>
              {exercisesLabel}
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
          {/* A share reads as a share ("40%", not "40 / 100"), and not at all
              before there is anything to measure. */}
          {requirement.id === 'accuracy' ? (
            requirement.done ? <span className="requirements__count">{requirement.done}%</span> : null
          ) : requirement.total !== undefined ? (
            <span className="requirements__count">
              {requirement.done} / {requirement.total}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * A handful of paper scraps that fall once when a lesson is finished. Pure
 * CSS, over in about a second, and gone entirely under reduced motion: the
 * score and the words already say it, this only makes it land.
 */
function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index} style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  );
}
