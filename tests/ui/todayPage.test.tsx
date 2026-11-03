// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { availableLessons, lessonsInOrder } from '../../src/content/browser.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import type { DailyRun } from '../../src/core/progress/daily.ts';
import { createReviewItem } from '../../src/core/srs/scheduler.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * Today as a learner sees it. It used to offer four starts of equal weight
 * (the daily practice, the lesson, the "daily round" and early review), and
 * its practice card said "Start today" after the practice was done. Now there
 * is one button, and once the day's goal is met there is none.
 */

afterEach(cleanup);

const LANGS = ['en', 'bg'] as const;
const first = lessonsInOrder().find((lesson) => availableLessons().includes(lesson))!;

function today(overrides: Partial<AppStateValue>, lang: 'en' | 'bg') {
  return render(
    <AppStateContext.Provider value={stubState(overrides, lang)}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </AppStateContext.Provider>,
  );
}

function run(stage: number, day = todayHere()): DailyRun {
  return { id: `run-${stage}`, day, scriptId: 'sc-bakery-pre-a1', goal: 'everyday', stage, total: 10, firstTryCorrect: 9,
    listeningCompleted: stage === 5, updatedAt: new Date().toISOString() };
}

/** Every solid button on the page: there should be one at most. */
const primaries = (container: HTMLElement) => [...container.querySelectorAll('.btn--primary')];

describe.each(LANGS)('Today in %s', (lang) => {
  it('leads a total beginner into German with one button, and names the lesson that follows', () => {
    const view = today({}, lang);
    const [only, ...others] = primaries(view.container);
    expect(others).toHaveLength(0);
    expect(only).toHaveAccessibleName(tr('todayPracticeStart', lang));
    expect(only).toHaveAttribute('href', '/daily');
    // What daily practice is, said where it first appears.
    expect(screen.getByText(tr('todayPracticeFirst', lang))).toBeInTheDocument();
    const plan = view.container.querySelector<HTMLElement>('.today-plan')!;
    expect(within(plan).getByRole('link', { name: first.title[lang] })).toHaveAttribute('href', `/lesson/${first.id}`);
    // Nothing waiting, so no round that would only say so.
    expect(screen.queryByText(tr('sessionTitle', lang))).toBeNull();
  });

  it('stops offering today\'s practice once it is done, and moves on to the course', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const before = today({ dailyRuns: [run(5, todayHere(yesterday))] }, lang);
    expect(primaries(before.container)[0]).toHaveAccessibleName(tr('todayPracticeStart', lang));
    before.unmount();

    const view = today({ dailyRuns: [run(5)] }, lang);
    expect(screen.queryByRole('link', { name: tr('todayPracticeStart', lang) })).toBeNull();
    expect(screen.getByText(new RegExp(tr('exerciseScore', lang, { correct: 9, total: 10 })))).toBeInTheDocument();
    const [only, ...others] = primaries(view.container);
    expect(others).toHaveLength(0);
    expect(only).toHaveAccessibleName(tr('dashboardStartLesson', lang));
    expect(only).toHaveAttribute('href', `/lesson/${first.id}`);
  });

  it('continues a practice begun today and says which part comes next', () => {
    const view = today({ dailyRuns: [run(2)] }, lang);
    expect(primaries(view.container)[0]).toHaveAccessibleName(tr('dailyResume', lang));
    expect(screen.getByText(tr('todayPracticeStep', lang, { n: 3, total: 5, stage: tr('dailyRecall', lang) }))).toBeInTheDocument();
  });

  it('is done for today once the daily goal is met: what was done, and more only if wanted', () => {
    const view = today({ studyDays: [{ day: todayHere(), secondsActive: 21 * 60, answers: 14, correct: 12 }],
      dailyRuns: [run(5)] }, lang);
    expect(screen.getByRole('heading', { name: tr('todayDoneGoal', lang) })).toBeInTheDocument();
    expect(primaries(view.container)).toHaveLength(0);
    expect(screen.getByText(tr('todayDoneMinutes', lang, { n: 21 }))).toBeInTheDocument();
    expect(screen.getByText(tr('todayDoneAnswers', lang, { n: 14 }))).toBeInTheDocument();
    const plan = view.container.querySelector<HTMLElement>('.today-plan')!;
    const keepGoing = within(plan).getByRole('link', { name: new RegExp(first.title[lang]) });
    expect(keepGoing).toHaveAttribute('href', `/lesson/${first.id}`);
    expect(keepGoing).toHaveClass('btn--ghost');
  });

  it('offers the mixed round below the one step once there is something to put in it, and says what it is', () => {
    const due = Array.from({ length: 3 }, (_, index) =>
      createReviewItem({ id: `vocab:v-${index}`, kind: 'vocab', refId: 'v-hallo', level: 'pre-a1', now: new Date(Date.now() - 86_400_000) }));
    const view = today({ reviewItems: due }, lang);
    const round = screen.getByRole('link', { name: new RegExp(tr('sessionTitle', lang)) });
    expect(round).toHaveAttribute('href', '/session');
    expect(round).toHaveTextContent(tr('todayRoundWhat', lang));
    expect(primaries(view.container)).toHaveLength(1);
  });
});
