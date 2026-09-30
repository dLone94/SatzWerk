// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactNode } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { lessonById } from '../../src/content/index.ts';
import type { Lesson } from '../../src/content/types.ts';
import {
  applyCompletion,
  applyMastery,
  applyRecoveryRound,
  emptyLessonProgress,
  markSectionSeen,
  recordStepOutcome,
  type LessonProgress,
  type StepOutcome,
} from '../../src/core/progress/lesson.ts';
import { tr } from '../../src/i18n.ts';
import type { AttemptPayload } from '../../src/services/api/client.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { LessonPage } from '../../src/ui/pages/LessonPage.tsx';
import { play, stepIdOnScreen, stubState, type User } from './playerStub.tsx';

/**
 * A lesson played the whole way through, with the progress moving as the
 * learner answers — the way the real app moves it — rather than frozen in a
 * stub. The bugs here lived between the stages: what one round left behind
 * for the next.
 */

// Whole lessons typed key by key: seconds each, more on a busy machine.
vi.setConfig({ testTimeout: 30_000 });

const L1 = lessonById('pre-a1-u1-l1')!;
const L2 = lessonById('pre-a1-u1-l2')!;
const L3 = lessonById('pre-a1-u2-l1')!;

const NOW = '2026-09-30T10:00:00.000Z';

const outcome = (stepId: string, overrides: Partial<StepOutcome> = {}): StepOutcome => ({
  stepId,
  attempts: 1,
  firstTryCorrect: true,
  bestCredit: 1,
  resolved: true,
  hintsUsed: 0,
  revealed: false,
  ...overrides,
});

const practiceSteps = (lesson: Lesson) => lesson.exercises.flatMap((exercise) => exercise.steps);
const masterySteps = (lesson: Lesson) => lesson.mastery.exercises.flatMap((exercise) => exercise.steps);

/** Sections read, nothing else: the learner is about to start the exercises. */
function readOnly(lesson: Lesson, mastery = { attempts: 0, bestAccuracy: 0, passed: false }): LessonProgress {
  return { ...emptyLessonProgress(lesson.id), sectionsSeen: lesson.sections.map((s) => s.id), mastery };
}

/** Everything but the check done, and the check tried once before. */
function allButCheck(lesson: Lesson, open: string[] = []): LessonProgress {
  return {
    ...readOnly(lesson, { attempts: 1, bestAccuracy: 0.3, passed: false }),
    practice: Object.fromEntries(
      practiceSteps(lesson).map((step) => [
        step.id,
        open.includes(step.id) ? outcome(step.id, { firstTryCorrect: false, resolved: false, bestCredit: 0 }) : outcome(step.id),
      ]),
    ),
  };
}

interface Calls {
  attempts: AttemptPayload[];
  mastery: number[];
  completed: string[];
}

function Harness({
  lessonId,
  initial,
  overrides = {},
  calls,
  extra,
}: {
  lessonId: string;
  initial: LessonProgress;
  overrides?: Partial<AppStateValue>;
  calls: Calls;
  extra?: ReactNode;
}) {
  const [lessons, setLessons] = useState<Record<string, LessonProgress>>({ [initial.lessonId]: initial });
  const latest = useRef(lessons);
  latest.current = lessons;
  const of = (id: string) => latest.current[id] ?? emptyLessonProgress(id);
  const put = (next: LessonProgress) => {
    latest.current = { ...latest.current, [next.lessonId]: next };
    setLessons(latest.current);
  };
  const value = stubState({
    lessons,
    lessonProgress: (id) => lessons[id] ?? emptyLessonProgress(id),
    submitAttempt: async (payload) => {
      calls.attempts.push(payload);
      // As on the server: only a lesson's own practice moves its progress.
      if (payload.context !== 'lesson' || !payload.lessonId) return;
      put(
        recordStepOutcome(of(payload.lessonId), {
          stepId: payload.stepId,
          verdict: payload.verdict,
          credit: payload.credit,
          hintsUsed: payload.hintsUsed,
          revealed: payload.revealed,
          resolved: payload.resolved,
          now: NOW,
        }),
      );
    },
    recordMastery: async (id, accuracy, passAccuracy) => {
      calls.mastery.push(accuracy);
      const next = applyMastery(of(id), accuracy, passAccuracy, NOW);
      put(next);
      return next;
    },
    recordRecovery: async (id) => put(applyRecoveryRound(of(id), NOW)),
    markSectionSeen: async (id, sectionId) => put(markSectionSeen(of(id), sectionId)),
    completeLesson: async (id) => {
      calls.completed.push(id);
      put(applyCompletion(of(id), NOW));
    },
    ...overrides,
  });
  return (
    <AppStateContext.Provider value={value}>
      <MemoryRouter initialEntries={[`/lesson/${lessonId}`]}>
        {extra}
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>
    </AppStateContext.Provider>
  );
}

const newCalls = (): Calls => ({ attempts: [], mastery: [], completed: [] });
const phase = () => document.querySelector('.player-header__phase')?.textContent ?? '';
const count = () => document.querySelector('.player__count')?.textContent ?? '';

/** From the overview, through the teaching sections, into the exercises. */
async function readIntoPractice(user: User) {
  await user.click(screen.getByRole('button', { name: tr('lessonContinueReading', 'en') }));
  for (let i = 0; i < 20; i++) {
    const next = screen.queryByRole('button', { name: tr('lessonNextSection', 'en') });
    if (!next) break;
    await user.click(next);
  }
  await user.click(screen.getByRole('button', { name: tr('lessonToExercises', 'en') }));
}

describe('a final check after a Quick redo', () => {
  /*
   * The redo round and the final check sat at the same place in the tree, so
   * React kept one player for both. The check inherited the redo's cursor and
   * score: a redo longer than the check opened it on a bare "Round finished"
   * with no button and the tab bar hidden, and a shorter one started the check
   * at its last question and could record "4 of 3 right first time".
   */
  it('starts at its first question, with a score of its own', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    render(<Harness lessonId={L1.id} initial={readOnly(L1)} calls={calls} />);

    await readIntoPractice(user);
    await play(user, L1.exercises, { right: () => false, done: () => phase() === tr('lessonRecovery', 'en') });
    expect(phase()).toBe(tr('lessonRecovery', 'en'));
    await play(user, L1.exercises, { right: () => true, done: () => phase() === tr('lessonMastery', 'en') });
    expect(phase()).toBe(tr('lessonMastery', 'en'));

    const checkSteps = masterySteps(L1);
    expect(count()).toBe(tr('exerciseProgress', 'en', { done: 1, total: checkSteps.length }));
    expect(checkSteps.map((step) => step.id)).toContain(stepIdOnScreen());

    const asked = await play(user, L1.mastery.exercises, { right: () => true, done: () => calls.mastery.length > 0 });
    expect(asked).toEqual(checkSteps.map((step) => step.id));
    await waitFor(() => expect(document.querySelector('.done-hero')).not.toBeNull());
    expect(calls.mastery).toEqual([1]);
    expect(screen.getByText(tr('exerciseScore', 'en', { correct: checkSteps.length, total: checkSteps.length }))).toBeInTheDocument();
  });
});

describe('the end of a final check', () => {
  /*
   * After the last Continue the player cleared the answer and showed the last
   * question again, blank and answerable, for as long as the result took to
   * save — seconds on a phone waking the database. Answering it again
   * recorded the check twice, with an accuracy above 100%.
   */
  it('leaves nothing to answer while the result is saved, and records it once', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    const recordMastery = vi.fn((_id: string, _accuracy: number, _pass: number) => new Promise<LessonProgress>(() => {}));
    render(<Harness lessonId={L1.id} initial={allButCheck(L1)} calls={calls} overrides={{ recordMastery }} />);

    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L1.mastery.exercises, { right: () => true, done: () => recordMastery.mock.calls.length > 0 });
    expect(recordMastery).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: tr('exerciseSubmit', 'en') })).toBeNull();

    // Whatever is still on screen, pressing it does not record the check again.
    await play(user, L1.mastery.exercises, { right: () => true, max: 10 });
    expect(recordMastery).toHaveBeenCalledTimes(1);
    expect(recordMastery.mock.calls[0]![1]).toBeLessThanOrEqual(1);
  });
});

describe('moving from one lesson to the next', () => {
  /*
   * The router kept the same page when only the lesson id changed, so "Up
   * next" opened the next lesson as an already-finished celebration, with the
   * previous lesson's score.
   */
  it('opens the next lesson at its own start', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    render(
      <Harness
        lessonId={L2.id}
        initial={allButCheck(L2)}
        calls={calls}
        extra={<Link to={`/lesson/${L3.id}`}>elsewhere</Link>}
      />,
    );
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, { right: () => true, done: () => Boolean(document.querySelector('.done-hero')) });
    expect(document.querySelector('.done-hero')).not.toBeNull();

    await user.click(screen.getByRole('link', { name: 'elsewhere' }));
    expect(document.querySelector('.done-hero')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(L3.title.en);
    expect(screen.getByRole('button', { name: tr('lessonStart', 'en') })).toBeInTheDocument();
  });
});

describe('a failed final check', () => {
  /*
   * The result said "not passed" in the green, bold style used for success,
   * and "Practise again" opened whichever teaching section was last on screen
   * (usually the Summary) instead of the practice.
   */
  it('says so in the warning colour', async () => {
    const user = userEvent.setup();
    render(<Harness lessonId={L2.id} initial={allButCheck(L2)} calls={newCalls()} />);
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, {
      right: () => false,
      done: () => Boolean(screen.queryByRole('button', { name: tr('lessonMasteryRetry', 'en') })),
    });
    const note = screen.getByText(tr('lessonMasteryFailed', 'en'));
    expect(note).toHaveClass('done-note--warn');
  });

  it('goes to the practice when it says "Practise again"', async () => {
    const user = userEvent.setup();
    const tried = readOnly(L2, { attempts: 1, bestAccuracy: 0.3, passed: false });
    render(<Harness lessonId={L2.id} initial={tried} calls={newCalls()} />);
    // Read the lesson to its last section first, so a stale position would show.
    await readIntoPractice(user);
    await user.click(screen.getByRole('button', { name: tr('lessonBackToLesson', 'en') }));
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, {
      right: () => false,
      done: () => Boolean(screen.queryByRole('button', { name: tr('lessonMasteryRetry', 'en') })),
    });
    await user.click(screen.getByRole('button', { name: tr('lessonReplay', 'en') }));
    expect(practiceSteps(L2).map((step) => step.id)).toContain(stepIdOnScreen());
  });
});

describe('a step that does not ask for a retype', () => {
  const articleSteps = L2.exercises.filter((exercise) => exercise.kind === 'articleRecall').flatMap((e) => e.steps);

  /*
   * Article and conjugation drills skip the retype. A wrong answer there was
   * saved as unresolved and nothing in the flow ever resolved it, so a lesson
   * with one slipped article stayed unfinished after a perfect final check,
   * with nothing on screen saying why.
   */
  it('is put right in the run, so the lesson can finish', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    render(<Harness lessonId={L2.id} initial={readOnly(L2)} calls={calls} />);
    await readIntoPractice(user);
    const wrong = new Set(articleSteps.map((step) => step.id));
    await play(user, L2.exercises, { right: (step) => !wrong.has(step.id), done: () => phase() === tr('lessonMastery', 'en') });
    for (const id of wrong) {
      expect(calls.attempts.some((attempt) => attempt.stepId === id && attempt.isRetype && attempt.resolved)).toBe(true);
    }
    await play(user, L2.mastery.exercises, { right: () => true, done: () => Boolean(document.querySelector('.done-hero')) });
    expect(document.querySelector('.done-hero')).not.toBeNull();
    expect(calls.completed).toEqual([L2.id]);
  });

  /*
   * Learners who already have such a step left open: a passed check says
   * what is missing and leads straight to it, and finishing it finishes the
   * lesson without sitting the check again.
   */
  it('leaves a passed check with a way to finish what is open', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    const open = articleSteps[0]!.id;
    render(<Harness lessonId={L2.id} initial={allButCheck(L2, [open])} calls={calls} />);
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, { right: () => true, done: () => calls.mastery.length > 0 });

    await screen.findByText(tr('lessonStepsLeft', 'en', { n: 1 }));
    expect(document.querySelector('.done-hero')).toBeNull();
    expect(document.querySelector('.score-ring')).toHaveClass('score-ring--passed');
    await user.click(screen.getByRole('button', { name: tr('lessonFinishRemaining', 'en', { n: 1 }) }));
    expect(stepIdOnScreen()).toBe(open);

    await play(user, L2.exercises, { right: () => true, done: () => Boolean(document.querySelector('.done-hero')) });
    expect(document.querySelector('.done-hero')).not.toBeNull();
    expect(calls.mastery).toHaveLength(1);
    expect(calls.completed).toEqual([L2.id]);
  });
});

describe('replaying a finished lesson', () => {
  /*
   * Once a check had been passed, every later practice run took the "finish
   * what is open" way out. Replaying a lesson that was already complete then
   * skipped the final check and threw confetti over the practice score.
   */
  it('still ends with the final check', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    const complete = applyCompletion(
      { ...allButCheck(L1), mastery: { attempts: 1, bestAccuracy: 1, passed: true } },
      NOW,
    );
    render(<Harness lessonId={L1.id} initial={complete} calls={calls} />);
    await user.click(screen.getByRole('button', { name: tr('lessonReplay', 'en') }));
    await play(user, L1.exercises, {
      right: () => true,
      done: () => phase() === tr('lessonMastery', 'en') || Boolean(document.querySelector('.done-hero')),
    });
    expect(document.querySelector('.done-hero')).toBeNull();
    expect(phase()).toBe(tr('lessonMastery', 'en'));
    expect(calls.completed).toEqual([]);
  });
});

describe('a passed check with a teaching section unread', () => {
  /*
   * Every exercise answered and the check passed, but one section never
   * opened: the lesson was not finished, and the screen said nothing about
   * why and offered only the way to Today.
   */
  it('says so, and leads to the section and on to the finish', async () => {
    const user = userEvent.setup();
    const calls = newCalls();
    const unread = L2.sections[2]!;
    const initial = {
      ...allButCheck(L2),
      sectionsSeen: L2.sections.filter((section) => section.id !== unread.id).map((section) => section.id),
    };
    render(<Harness lessonId={L2.id} initial={initial} calls={calls} />);
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, { right: () => true, done: () => calls.mastery.length > 0 });

    await screen.findByText(tr('lessonSectionsLeft', 'en', { n: 1 }));
    expect(document.querySelector('.done-hero')).toBeNull();
    await user.click(screen.getByRole('button', { name: tr('lessonReadRemaining', 'en', { n: 1 }) }));
    expect(screen.getByText(unread.title.en)).toBeInTheDocument();

    for (let i = 0; i < 10; i++) {
      const next = screen.queryByRole('button', { name: tr('lessonNextSection', 'en') });
      if (!next) break;
      await user.click(next);
    }
    await user.click(screen.getByRole('button', { name: tr('lessonFinishLesson', 'en') }));
    await waitFor(() => expect(document.querySelector('.done-hero')).not.toBeNull());
    expect(calls.mastery).toHaveLength(1);
    expect(calls.completed).toEqual([L2.id]);
  });
});
