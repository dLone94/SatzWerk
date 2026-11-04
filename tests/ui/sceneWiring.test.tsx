// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lessonById, vocabById } from '../../src/content/index.ts';
import type { Exercise, Lesson } from '../../src/content/types.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { mergeDailyRun } from '../../src/core/progress/daily.ts';
import {
  applyCompletion,
  applyMastery,
  emptyLessonProgress,
  recordStepOutcome,
  type LessonProgress,
} from '../../src/core/progress/lesson.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { nounArticle } from '../../src/ui/components/Gender.tsx';
import { chooseDailyScript, dailyPhrases, goalScripts, phraseNewWords } from '../../src/ui/dailyBuilder.ts';
import { DailyPage } from '../../src/ui/pages/DailyPage.tsx';
import { LessonPage } from '../../src/ui/pages/LessonPage.tsx';
import type { SceneSpec } from '../../src/ui/three/sceneData.ts';
import { play, silentVoice, stubState } from './playerStub.tsx';

/**
 * Where the pages put the wooden scenes, with the scene itself stood in for:
 * which picture each page asks for, with what, and when. The scene's own
 * behaviour is tested in woodScene.test.tsx and finishTower.test.tsx.
 */

vi.setConfig({ testTimeout: 30_000 });

interface SceneCall { spec: SceneSpec; replay?: number; ghost?: string; fallback?: ReactNode; placeholder?: ReactNode; className?: string }
const scenes = vi.hoisted(() => ({ mode: 'animate' as 'animate' | 'still' | 'static', calls: [] as unknown[] }));

vi.mock('../../src/ui/three/WoodScene.tsx', async () => {
  const { createElement, Fragment } = await import('react');
  return {
    WoodScene: (props: SceneCall & { children?: ReactNode; label?: ReactNode; after?: ReactNode }) => {
      scenes.calls.push(props);
      return createElement(Fragment, null,
        createElement('div', { className: `stub-scene stub-scene--${props.spec.scene} ${props.className ?? ''}`, 'data-replay': props.replay ?? '' },
          props.label ? createElement('p', { className: 'stub-scene__label' }, props.label) : null,
          props.children),
        props.after);
    },
    useSceneMode: () => scenes.mode,
  };
});

const calls = () => scenes.calls as SceneCall[];
const last = (scene: SceneSpec['scene']) => calls().filter((call) => call.spec.scene === scene).at(-1);

beforeEach(() => {
  scenes.mode = 'animate';
  scenes.calls = [];
});
afterEach(cleanup);

/** Two sentences with a gap each, a word to type in it. */
const gaps: Exercise = {
  id: 'ex-gaps',
  kind: 'fillBlank',
  level: 'pre-a1',
  objective: { en: 'Where from, where', bg: 'Откъде, къде' },
  steps: [
    { id: 'gap-1', prompt: { en: 'I come from Bulgaria.', bg: 'Идвам от България.' }, scaffold: 'Ich komme ___ Bulgarien.', answer: { accepted: ['aus'], shape: 'word' }, hints: [] },
    { id: 'gap-2', prompt: { en: 'I live in Sofia.', bg: 'Живея в София.' }, scaffold: 'Ich wohne ___ Sofia.', answer: { accepted: ['in'], shape: 'word' }, hints: [] },
  ],
} as unknown as Exercise;

function player(exercise: Exercise) {
  return render(
    <AppStateContext.Provider value={stubState({ tts: silentVoice })}>
      <MemoryRouter><ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} /></MemoryRouter>
    </AppStateContext.Provider>,
  );
}

async function answer(user: ReturnType<typeof userEvent.setup>, text: string) {
  const box = screen.getByRole('textbox');
  await user.clear(box);
  await user.type(box, `${text}{Enter}`);
}

/** Retype the correction a wrong answer asks for, then go on. */
async function retypeAndGoOn(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(document.querySelector('#player-retype-target')).not.toBeNull());
  const target = document.querySelector('#player-retype-target')!.textContent!;
  await answer(user, target);
  await user.click(await screen.findByRole('button', { name: tr('exerciseContinue', 'en') }));
}

describe('the question\'s rail', () => {
  it('stands over a sentence with a gap while it is being answered, and only then', async () => {
    const user = userEvent.setup();
    const { container } = player(gaps);
    expect(container.querySelector('.stub-scene--question')).not.toBeNull();
    const rail = last('question')!.spec as Extract<SceneSpec, { scene: 'question' }>;
    expect(rail.before.map((block) => block.text)).toEqual(['Ich', 'komme']);
    expect(rail.after.map((block) => block.text)).toEqual(['Bulgarien.']);
    // The slot holds what is typed, never the answer.
    await user.type(screen.getByRole('textbox'), 'au');
    expect(last('question')!.ghost).toBe('au');
    expect(JSON.stringify(calls().map((call) => call.spec))).not.toContain('"aus"');
    await user.keyboard('s{Enter}');
    await screen.findByRole('button', { name: tr('exerciseContinue', 'en') });
    expect(container.querySelector('.stub-scene--question')).toBeNull();
  });

  it('is not drawn for a choice, a word drill or a translation', () => {
    const lesson = lessonById('pre-a1-u2-l4')!;
    const others = [...lesson.exercises, ...lesson.mastery.exercises].filter((exercise) => !['fillBlank', 'partialRecall'].includes(exercise.kind));
    expect(others.length).toBeGreaterThan(0);
    for (const exercise of others) {
      const { container, unmount } = player(exercise);
      expect(container.querySelector('.stub-scene--question'), exercise.kind).toBeNull();
      unmount();
    }
  });
});

describe('the swap after a wrong answer', () => {
  it('shows the one word swapped when the answer was one word off', async () => {
    const user = userEvent.setup();
    const { container } = player(gaps);
    await answer(user, 'von');
    await waitFor(() => expect(container.querySelector('.stub-scene--feedback')).not.toBeNull());
    const swap = last('feedback')!.spec as Extract<SceneSpec, { scene: 'feedback' }>;
    expect([swap.wrong, swap.right]).toEqual(['von', 'aus']);
  });

  it('shows nothing for a right answer, or one wrong in more than one word', async () => {
    const user = userEvent.setup();
    const { container } = player(gaps);
    await answer(user, 'aus');
    await screen.findByRole('button', { name: tr('exerciseContinue', 'en') });
    expect(container.querySelector('.stub-scene--feedback')).toBeNull();
    await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));
    await answer(user, 'völlig falsch');
    await waitFor(() => expect(document.querySelector('.feedback')).not.toBeNull());
    expect(container.querySelector('.stub-scene--feedback')).toBeNull();
  });

  it('offers "Show again" only where the scene moves', async () => {
    const user = userEvent.setup();
    scenes.mode = 'still';
    const { container } = player(gaps);
    await answer(user, 'von');
    await waitFor(() => expect(container.querySelector('.stub-scene--feedback')).not.toBeNull());
    expect(screen.queryByRole('button', { name: tr('sceneShowAgainLabel', 'en') })).toBeNull();
    cleanup();
    scenes.mode = 'animate';
    const moving = player(gaps);
    await answer(user, 'von');
    await waitFor(() => expect(moving.container.querySelector('.stub-scene--feedback')).not.toBeNull());
    const again = screen.getByRole('button', { name: tr('sceneShowAgainLabel', 'en') });
    // A target a thumb can hit: its height is in the stylesheet (44px), its name says what it does.
    expect(again).toHaveAccessibleName(tr('sceneShowAgainLabel', 'en'));
  });

  it('counts "Show again" afresh for every question', async () => {
    const user = userEvent.setup();
    const { container } = player(gaps);
    await answer(user, 'von');
    await waitFor(() => expect(container.querySelector('.stub-scene--feedback')).not.toBeNull());
    expect(last('feedback')!.replay).toBe(0);
    await user.click(screen.getByRole('button', { name: tr('sceneShowAgainLabel', 'en') }));
    await user.click(screen.getByRole('button', { name: tr('sceneShowAgainLabel', 'en') }));
    expect(last('feedback')!.replay).toBe(2);
    await retypeAndGoOn(user);
    // The next question: its own rail, and its own swap from nought.
    await waitFor(() => expect(last('question')!.spec).toMatchObject({ after: [{ text: 'Sofia.' }] }));
    await answer(user, 'an');
    await waitFor(() => expect((last('feedback')!.spec as Extract<SceneSpec, { scene: 'feedback' }>).right).toBe('in'));
    expect(last('feedback')!.replay).toBe(0);
  });
});

describe('the lesson\'s finish', () => {
  const L2: Lesson = lessonById('pre-a1-u1-l2')!;
  const NOW = '2026-09-30T10:00:00.000Z';

  function Harness() {
    const steps = L2.exercises.flatMap((exercise) => exercise.steps);
    const ready: LessonProgress = {
      ...emptyLessonProgress(L2.id),
      sectionsSeen: L2.sections.map((section) => section.id),
      mastery: { attempts: 1, bestAccuracy: 0.3, passed: false },
      practice: Object.fromEntries(steps.map((step) => [step.id, { stepId: step.id, attempts: 1, firstTryCorrect: true, bestCredit: 1, resolved: true, hintsUsed: 0, revealed: false }])),
    };
    const [lessons, setLessons] = useState<Record<string, LessonProgress>>({ [L2.id]: ready });
    const latest = useRef(lessons);
    latest.current = lessons;
    const of = (id: string) => latest.current[id] ?? emptyLessonProgress(id);
    const put = (next: LessonProgress) => { latest.current = { ...latest.current, [next.lessonId]: next }; setLessons(latest.current); };
    const value = stubState({
      lessons,
      lessonProgress: of,
      submitAttempt: async (payload) => {
        if (payload.context !== 'lesson' || !payload.lessonId) return;
        put(recordStepOutcome(of(payload.lessonId), { stepId: payload.stepId, verdict: payload.verdict, credit: payload.credit, hintsUsed: payload.hintsUsed,
          revealed: payload.revealed, resolved: payload.resolved, requireRetype: payload.requireRetype, now: NOW }));
      },
      recordMastery: async (id, accuracy, passAccuracy) => { const next = applyMastery(of(id), accuracy, passAccuracy, NOW); put(next); return next; },
      completeLesson: async (id) => put(applyCompletion(of(id), NOW)),
    });
    return (
      <AppStateContext.Provider value={value}>
        <MemoryRouter initialEntries={[`/lesson/${L2.id}`]}>
          <Routes><Route path="/lesson/:lessonId" element={<LessonPage />} /></Routes>
        </MemoryRouter>
      </AppStateContext.Provider>
    );
  }

  it('stacks the lesson\'s own new words, nouns in their gender\'s colour, with a drawing until it is drawn', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await play(user, L2.mastery.exercises, { right: () => true, done: () => Boolean(document.querySelector('.done-hero')) });
    await waitFor(() => expect(document.querySelector('.done-hero .stub-scene--complete')).not.toBeNull());
    const tower = last('complete')!;
    expect(tower.className).toBe('done-hero__tower');
    const taught = L2.vocabIds.map((id) => vocabById(id)!).map((entry) => ({ text: entry.display, tone: nounArticle(entry) ?? 'birch' }));
    expect((tower.spec as Extract<SceneSpec, { scene: 'complete' }>).words).toEqual(taught.slice(0, 6));
    expect(taught.some((word) => word.tone !== 'birch')).toBe(true);
    // No dachshund here. Until the first frame the box holds the plinth the
    // blocks are about to fall onto; where no tower is drawn, a flat drawing
    // of the same tower, described as the scene would be.
    expect(tower.placeholder).toBeTruthy();
    expect(tower.fallback).toBeTruthy();
    const waiting = render(<>{tower.placeholder}</>).container;
    expect(waiting.querySelector('.tower-sketch--bare')).not.toBeNull();
    expect(waiting.querySelectorAll('.tower-sketch__block')).toHaveLength(0);
    const { container } = render(<>{tower.fallback}</>);
    expect(container.querySelectorAll('.tower-sketch__block')).toHaveLength(Math.min(6, taught.length));
    expect(container.querySelectorAll('.wood-scene__label [lang="de"]')).toHaveLength(Math.min(6, taught.length));
    // Said in words beside the picture, the German marked as German.
    const label = document.querySelector('.done-hero .stub-scene__label')!;
    expect(label.querySelectorAll('[lang="de"]').length).toBe(Math.min(6, taught.length));
  });
});

describe('the day\'s finish', () => {
  const script = goalScripts('everyday', 'pre-a1')[0]!;
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    for (let n = 0; n < 28; n++) {
      const day = new Date(Date.UTC(2026, 10, 2 + n)).toISOString().slice(0, 10);
      if (chooseDailyScript('everyday', 'pre-a1', [], day).id === script.id) {
        vi.setSystemTime(new Date(`${day}T10:00:00`));
        break;
      }
    }
  });
  afterEach(() => { vi.useRealTimers(); });

  it('stacks the new words of the day\'s new phrases, with the dachshund where no tower is drawn', async () => {
    const profile = { teachingLanguage: 'en' as const, dailyTargetMinutes: 10, displayName: null, onboarded: true, createdAt: '',
      learningGoal: 'everyday' as const, practiceLevel: 'pre-a1' as const, weeklyTargetDays: 4 };
    function Harness() {
      const [runs, setRuns] = useState<AppStateValue['dailyRuns']>([{ id: 'finishing', day: todayHere(), scriptId: script.id,
        goal: 'everyday', stage: 4, total: 9, firstTryCorrect: 8, listeningCompleted: false, updatedAt: new Date().toISOString() }]);
      const value = stubState({ profile, dailyRuns: runs, recordDailyRun: async (payload) => {
        setRuns((current) => mergeDailyRun(current, { ...payload, updatedAt: new Date().toISOString() }));
      } });
      return <AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>;
    }
    const view = render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyFinish', 'en') }));
    await screen.findByRole('heading', { level: 1, name: tr('dailyFinished', 'en') });
    const expected = phraseNewWords(dailyPhrases(script, 'en', [], todayHere()).filter((card) => !card.again), new Set())
      .map((entry) => ({ text: entry.display, tone: nounArticle(entry) ?? 'birch' }));
    const finished = view.container.querySelector<HTMLElement>('.daily-finished')!;
    expect(expected.length).toBeGreaterThan(0);
    expect(finished.querySelector('.stub-scene--complete')).not.toBeNull();
    const tower = last('complete')!;
    expect(tower.className).toBe('daily-finished__tower');
    expect((tower.spec as Extract<SceneSpec, { scene: 'complete' }>).words).toEqual(expected.slice(0, 6));
    // The dachshund stands in, while it is fetched and where it is not drawn.
    const { container } = render(<>{tower.fallback}</>);
    expect(within(container).getByText('Geschafft!')).toHaveAttribute('lang', 'de');
    expect(tower.placeholder).toBeUndefined();
  });
});
