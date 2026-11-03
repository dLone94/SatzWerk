// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { allUnits, lessonsInOrder, practiceForCategory, vocabById } from '../../src/content/browser.ts';
import { allStepIds, emptyLessonProgress, type LessonProgress } from '../../src/core/progress/lesson.ts';
import { tr } from '../../src/i18n.ts';
import type { MistakeRecord } from '../../src/services/api/client.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { MistakesPage } from '../../src/ui/pages/MistakesPage.tsx';
import { PlacementPage } from '../../src/ui/pages/PlacementPage.tsx';
import { authoredStep, buildMistakePractice } from '../../src/ui/reviewBuilder.ts';
import { stubState } from './playerStub.tsx';

/**
 * What the mistake bank asks, checked against the real course: the defects
 * were in what a learner could see on the card, and in where the tasks came
 * from.
 */

function mistake(id: string, expected: string, lastGiven: string, extra: Partial<MistakeRecord> = {}): MistakeRecord {
  return {
    id,
    category: 'article',
    expected,
    lastGiven,
    stepId: null,
    lessonId: null,
    occurrences: 1,
    correctedCount: 0,
    firstSeenAt: '2026-01-01T00:00:00.000Z',
    lastSeenAt: '2026-01-01T00:00:00.000Z',
    resolvedAt: null,
    ...extra,
  };
}

function mount(node: ReactElement, overrides: Partial<AppStateValue> = {}, path = '/') {
  return render(
    <AppStateContext.Provider value={stubState(overrides)}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </AppStateContext.Provider>,
  );
}

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

describe('practising the mistake bank', () => {
  /*
   * Every card read 'You wrote "der" here. Type the correct German.' and
   * nothing else: no noun, no meaning. Three answers of "ich weiß nicht"
   * gave three cards worded the same with three different answers, and the
   * only hint, 'It starts with "die"', was the whole answer.
   */
  it('asks the question that went wrong, with what was answered last time beside it', () => {
    const original = authoredStep('u1l2-ex2-3')!;
    const [card] = buildMistakePractice([
      mistake('aaaaaaaaaaaaaaaa', 'die', 'der', { stepId: 'u1l2-ex2-3', lessonId: 'pre-a1-u1-l2' }),
    ]);
    const step = card!.steps[0]!;
    expect(step.id).toBe('u1l2-ex2-3');
    expect(step.prompt).toEqual(original.step.prompt);
    expect(step.scaffold).toBe(original.step.scaffold);
    expect(step.scaffold).toContain('Tochter');
    expect(step.instruction!.en).toContain('"der"');
    expect(step.answer.accepted).toContain('die');
    // The mistake bank is not the review schedule.
    expect(step.reviewTargets).toBeUndefined();
    // The server reads the mistake back from the card's id.
    expect(card!.id).toBe('mp-aaaaaaaaaaaaaaaa');
    expect(card!.kind).toBe(original.exercise.kind);
  });

  it('tells apart two mistakes that were answered the same way', () => {
    const cards = buildMistakePractice([
      mistake('aaaaaaaaaaaaaaaa', 'Guten Morgen', 'ich weiß nicht', { stepId: 'u2l1-ex2-s1', category: 'vocabulary' }),
      mistake('bbbbbbbbbbbbbbbb', 'Wiedersehen', 'ich weiß nicht', { stepId: 'u2l1-ex4-s1', category: 'vocabulary' }),
    ]);
    const asked = cards.map((card) => JSON.stringify([card.steps[0]!.prompt, card.steps[0]!.scaffold, card.steps[0]!.promptDe]));
    expect(new Set(asked).size).toBe(2);
  });

  it('calls a mistake made once a mistake to fix, and only one made twice recurring', () => {
    const [once, twice] = buildMistakePractice([
      mistake('aaaaaaaaaaaaaaaa', 'die', 'der', { stepId: 'u1l2-ex2-3' }),
      mistake('bbbbbbbbbbbbbbbb', 'das', 'der', { stepId: 'u1l2-ex2-2', occurrences: 2 }),
    ]);
    expect(once!.objective.en).toBe('Fix a mistake');
    expect(twice!.objective.en).toBe('Practise a recurring mistake');
  });

  it('rebuilds a review card from the word it asked for', () => {
    const word = vocabById('v-die-tochter')!;
    const [card] = buildMistakePractice([mistake('aaaaaaaaaaaaaaaa', word.display, 'der Tochter', { stepId: 'rv-v-die-tochter-s1' })]);
    expect(card!.steps[0]!.prompt).toEqual(word.translation);
    expect(card!.steps[0]!.id).toBe('rv-v-die-tochter-s1');
  });

  it('does not hand over a short answer whole when nothing else is known', () => {
    const [card] = buildMistakePractice([mistake('aaaaaaaaaaaaaaaa', 'die', 'der', { stepId: 'not-a-step' })]);
    const hints = card!.steps[0]!.hints.map((hint) => hint.en).join(' ');
    expect(hints).not.toContain('"die"');
    expect(hints).toContain('"d"');
  });

  it('makes one card of one question filed under two categories', () => {
    const cards = buildMistakePractice([
      mistake('aaaaaaaaaaaaaaaa', 'die', 'der', { stepId: 'u1l2-ex2-3' }),
      mistake('bbbbbbbbbbbbbbbb', 'die', 'das', { stepId: 'u1l2-ex2-3', category: 'gender' }),
    ]);
    expect(cards).toHaveLength(1);
  });
});

describe('practising a kind of mistake', () => {
  /*
   * A beginner three lessons in who tapped "Practise this kind" got ten tasks
   * from lessons never taken, A1 and A2 among them ("Die Lampe steht in der
   * Ecke"), and none from the three lessons actually done.
   */
  it('draws only on the lessons already taught', () => {
    const taught = new Set(['pre-a1-u1-l1', 'pre-a1-u1-l2', 'pre-a1-u2-l1']);
    const steps = practiceForCategory('article', 10, taught).flatMap((exercise) => exercise.steps.map((step) => step.id));
    expect(steps.length).toBeGreaterThan(0);
    for (const id of steps) {
      expect(id, `${id} comes from a lesson not taught`).toMatch(/^u1l[12]-|^u2l1-/);
    }
    expect(practiceForCategory('vocabulary', 10, new Set())).toEqual([]);
  });

  it('takes a unit checkpoint once every lesson in the unit is taught', () => {
    // The first unit whose checkpoint has a task for some kind of mistake.
    const unit = allUnits().find((candidate) =>
      candidate.checkpoint?.exercises.some((exercise) => exercise.steps.some((step) => step.answer.trapAnswers?.length)))!;
    const exercise = unit.checkpoint!.exercises.find((candidate) => candidate.steps.some((step) => step.answer.trapAnswers?.length))!;
    const category = exercise.steps.find((step) => step.answer.trapAnswers?.length)!.answer.trapAnswers![0]!.category;
    const lessons = unit.lessons.filter((lesson) => lesson.status === 'available').map((lesson) => lesson.id);
    const fromCheckpoint = (taught: Set<string>) =>
      practiceForCategory(category, 500, taught).some((candidate) => candidate.id === `cat-${category}-${exercise.id}`);
    expect(fromCheckpoint(new Set(lessons))).toBe(true);
    expect(fromCheckpoint(new Set(lessons.slice(1)))).toBe(false);
  });

  const taken = ['pre-a1-u1-l1', 'pre-a1-u1-l2', 'pre-a1-u2-l1'];
  const lessons = Object.fromEntries(taken.map((id) => [id, completed(id)]));
  const practise = async (mistakes: MistakeRecord[], label: string) => {
    const stats = { ...stubState().stats, categoryCounts: [{ category: mistakes[0]!.category, count: 1 }] };
    const user = userEvent.setup();
    mount(<MistakesPage />, { lessons, mistakes, stats }, '/mistakes');
    await user.click(screen.getByRole('button', { name: `${tr('mistakesPractiseCategory', 'en')}: ${label}` }));
    return [...document.querySelectorAll('[data-step-id]')].map((node) => node.getAttribute('data-step-id')!);
  };

  it('practises from the lessons already taken on the mistakes page', async () => {
    const [step] = await practise([mistake('aaaaaaaaaaaaaaaa', 'die', 'der', { stepId: 'u1l2-ex2-3' })], 'Article');
    expect(step).toMatch(/^u1l[12]-|^u2l1-/);
  });

  it('replays the learner’s own mistakes of that kind when those lessons have no task for it', async () => {
    const [step] = await practise(
      [mistake('aaaaaaaaaaaaaaaa', 'Gute Nacht', 'Gute Nahct', { stepId: 'u2l1-ex2-s4', category: 'vocabulary' })],
      'Vocabulary',
    );
    expect(step).toBe('u2l1-ex2-s4');
  });
});

describe('the placement check and the mistake bank', () => {
  /*
   * Played as a checkpoint, every wrong guess above the learner's level was
   * filed in the mistake bank and shown on a new learner's Today.
   */
  it('is played as a placement, not a checkpoint', async () => {
    const submitAttempt = vi.fn(async () => undefined);
    const user = userEvent.setup();
    mount(<PlacementPage />, { submitAttempt }, '/placement');
    await user.click(screen.getByRole('button', { name: tr('placementStart', 'en') }));
    await user.click(screen.getByRole('button', { name: tr('exerciseSkip', 'en') }));
    expect(submitAttempt).toHaveBeenCalledWith(expect.objectContaining({ context: 'placement' }));
  });
});
