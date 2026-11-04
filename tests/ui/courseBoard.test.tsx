// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { allUnits, lessonsInOrder } from '../../src/content/browser.ts';
import { allStepIds, emptyLessonProgress, type LessonProgress } from '../../src/core/progress/lesson.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import type { SceneSpec } from '../../src/ui/three/sceneData.ts';
import { stubState } from './playerStub.tsx';

/**
 * The course's board game says where the learner stands. When the next step
 * is the checkpoint closing a unit, it showed the next unit's first lesson,
 * or a unit of the next level, while Today and the card under it said
 * "checkpoint".
 */

vi.mock('../../src/ui/three/WoodScene.tsx', () => ({
  WoodScene: ({ spec, label }: { spec: SceneSpec; label?: ReactNode }) => (
    <div data-testid="board" data-spec={JSON.stringify(spec)}>{label}</div>
  ),
  useSceneMode: () => 'static',
}));

const { CoursePage } = await import('../../src/ui/pages/CoursePage.tsx');

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

function mount(overrides: Partial<AppStateValue>) {
  return render(
    <AppStateContext.Provider value={stubState(overrides)}>
      <MemoryRouter initialEntries={['/course']}><CoursePage /></MemoryRouter>
    </AppStateContext.Provider>,
  );
}

describe('the course board', () => {
  it('stands the pawn at the gate of the unit whose checkpoint is next', () => {
    const unit = allUnits()[0]!;
    const lessons = Object.fromEntries(unit.lessons.filter((lesson) => lesson.status === 'available').map((lesson) => [lesson.id, completed(lesson.id)]));
    mount({ lessons, checkpointResults: [] });
    const board = screen.getByTestId('board');
    expect(board).toHaveTextContent(tr('scenePathDoneLabel', 'en', { unit: unit.title.en, total: unit.lessons.length }));
    const spec = JSON.parse(board.dataset.spec!) as Extract<SceneSpec, { scene: 'path' }>;
    expect(spec.current).toBe(unit.lessons.length);
    expect(spec.stations).toHaveLength(unit.lessons.length);
  });

  it('shows the unit of the lesson in hand otherwise', () => {
    const unit = allUnits()[0]!;
    mount({ lessons: {}, checkpointResults: [] });
    const board = screen.getByTestId('board');
    expect(board).toHaveTextContent(unit.title.en);
    expect((JSON.parse(board.dataset.spec!) as { current: number }).current).toBe(0);
  });
});
