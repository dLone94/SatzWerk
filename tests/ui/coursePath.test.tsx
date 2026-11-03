// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { allUnits, lessonsInOrder } from '../../src/content/browser.ts';
import { allStepIds, emptyLessonProgress, type LessonProgress } from '../../src/core/progress/lesson.ts';
import { tr } from '../../src/i18n.ts';
import type { CheckpointResult } from '../../src/services/api/client.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { CoursePage } from '../../src/ui/pages/CoursePage.tsx';
import { PlacementPage } from '../../src/ui/pages/PlacementPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * Where the course sends a learner, and what the trail says about each stop.
 * Each case is a thing a learner ran into.
 */

function mount(node: ReactElement, overrides: Partial<AppStateValue> = {}, path = '/') {
  return render(
    <AppStateContext.Provider value={stubState(overrides)}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </AppStateContext.Provider>,
  );
}

const firstOf = (level: string) => lessonsInOrder().find((lesson) => lesson.level === level && lesson.status === 'available')!;

function completed(lessonId: string): LessonProgress {
  const lesson = lessonsInOrder().find((candidate) => candidate.id === lessonId)!;
  return {
    ...emptyLessonProgress(lessonId),
    sectionsSeen: lesson.sections.map((section) => section.id),
    practice: Object.fromEntries(allStepIds(lesson).map((stepId) => [stepId, {
      stepId, attempts: 1, firstTryCorrect: true, bestCredit: 1, resolved: true, hintsUsed: 0, revealed: false,
    }])),
    mastery: { attempts: 1, bestAccuracy: 1, passed: true },
    completedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('a placement result', () => {
  const placedAtB1: CheckpointResult = {
    checkpointId: 'placement',
    targetId: 'b1',
    accuracy: 0.6,
    passed: false,
    createdAt: '2026-05-01T10:00:00.000Z',
  };

  /*
   * Kept only on its own screen: "See the whole course" opened Pre-A1 with
   * "Continue your next lesson: Sounds and four extra letters", and coming
   * back to the check showed the introduction as if it had never been taken.
   */
  it('opens the course at the level it recommended', () => {
    mount(<CoursePage />, { checkpointResults: [placedAtB1] }, '/course');
    expect(screen.getByRole('button', { name: 'B1', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(tr('courseJump', 'en')) })).toHaveAttribute('href', `/lesson/${firstOf('b1').id}`);
  });

  it('is still there when the check is opened again', () => {
    mount(<PlacementPage />, { checkpointResults: [placedAtB1] }, '/placement');
    expect(screen.getByText(tr('placementLast', 'en', { level: 'B1' }), { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: tr('placementOpenFirstLesson', 'en') })).toHaveAttribute('href', `/lesson/${firstOf('b1').id}`);
  });
});

describe('the course trail', () => {
  const unit = allUnits()[0]!;
  const gate = (container: HTMLElement) => container.querySelector<HTMLElement>(`a[href="/checkpoint/${unit.checkpoint!.id}"]`)!;
  const tick = 'M5 12.5l4.5 4.5L19 7';

  /*
   * The checkpoint wore the tick of a finished lesson before it was ever
   * opened, and nothing on it said whether it had been taken.
   */
  it('shows a checkpoint not taken as not taken', () => {
    const view = mount(<CoursePage />, {}, '/course');
    expect(gate(view.container).textContent).toContain(tr('courseCheckpointNotTaken', 'en'));
    expect(gate(view.container).innerHTML).not.toContain(tick);
  });

  it('ticks it once it is passed, and gives the best score while it is not', () => {
    const result = (accuracy: number, passed: boolean): CheckpointResult => ({
      checkpointId: unit.checkpoint!.id, targetId: unit.id, accuracy, passed, createdAt: '2026-01-02T00:00:00.000Z',
    });
    const tried = mount(<CoursePage />, { checkpointResults: [result(0.4, false)] }, '/course');
    expect(gate(tried.container).textContent).toContain(tr('courseCheckpointBest', 'en', { n: 40 }));
    tried.unmount();
    const passed = mount(<CoursePage />, { checkpointResults: [result(0.4, false), result(0.9, true)] }, '/course');
    expect(gate(passed.container).textContent).toContain(tr('courseCheckpointDone', 'en'));
    expect(gate(passed.container).innerHTML).toContain(tick);
  });

  /*
   * After unit 1, the course page, Today and the lesson-complete card all
   * went on to unit 2; the unit's checkpoint was never suggested.
   */
  it('offers the checkpoint of the unit just finished before the next lesson', () => {
    const lessons = Object.fromEntries(unit.lessons.map((lesson) => [lesson.id, completed(lesson.id)]));
    const view = mount(<CoursePage />, { lessons }, '/course');
    expect(screen.getByRole('link', { name: new RegExp(tr('courseJumpCheckpoint', 'en')) })).toHaveAttribute('href', `/checkpoint/${unit.checkpoint!.id}`);
    expect(view.container.querySelector('.unit-path[open] h3')?.textContent).toContain(unit.title.en);
  });

  /*
   * A lesson never opened read "15 min · In progress" because it was the
   * one the learner was on, while Today's button for it said "Start the
   * lesson".
   */
  it('says a lesson is in progress only once it has been opened', () => {
    const lesson = unit.lessons[0]!;
    const meta = () => document.getElementById(`${lesson.id}-meta`)!.textContent!;
    const fresh = mount(<CoursePage />, {}, '/course');
    expect(meta()).not.toContain(tr('statusPartial', 'en'));
    expect(meta()).toContain(tr('todayUpNext', 'en'));
    fresh.unmount();
    mount(<CoursePage />, { lessons: { [lesson.id]: { ...emptyLessonProgress(lesson.id), sectionsSeen: [lesson.sections[0]!.id] } } }, '/course');
    expect(meta()).toContain(tr('statusPartial', 'en'));
  });
});
