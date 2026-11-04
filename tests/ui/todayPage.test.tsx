// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('names review by what is waiting when it follows the step, never as "items are due"', () => {
    // Seven due: the course's next step is review, though not a backlog that
    // leads the day, so it is what follows today's practice.
    const due = Array.from({ length: 7 }, (_, index) =>
      createReviewItem({ id: `vocab:v-${index}`, kind: 'vocab', refId: 'v-hallo', level: 'pre-a1', now: new Date(Date.now() - 86_400_000) }));
    const waiting = tr('todayReviewTitle', lang, { n: 7 });
    const before = today({ reviewItems: due }, lang);
    const plan = before.container.querySelector<HTMLElement>('.today-plan')!;
    expect(primaries(before.container)[0]).toHaveAccessibleName(tr('todayPracticeStart', lang));
    expect(within(plan).getByRole('link', { name: waiting })).toHaveAttribute('href', '/review');
    expect(plan).not.toHaveTextContent(lang === 'en' ? 'items are due' : 'елемента');
    before.unmount();

    // The goal met and the practice done: review is the way to keep going.
    const done = today({ reviewItems: due, dailyRuns: [run(5)],
      studyDays: [{ day: todayHere(), secondsActive: 25 * 60, answers: 20, correct: 18 }] }, lang);
    const card = done.container.querySelector<HTMLElement>('.today-plan')!;
    expect(primaries(done.container)).toHaveLength(0);
    const keepGoing = within(card).getByRole('link', { name: waiting });
    expect(keepGoing).toHaveAttribute('href', '/review');
    expect(keepGoing).toHaveClass('btn--ghost');
    expect(card).not.toHaveTextContent(tr('dashboardReviewDue', lang));
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

/*
 * Today measured the same effort three ways in three places: a ring of
 * minutes against the daily goal, bars of minutes for the last seven days,
 * and "0 / 4 practice days this week" at the foot of the page. Now one
 * widget holds the day's goal and the week's practice days, counted as the
 * weekly goal counts them, Monday to Sunday.
 */
describe.each(LANGS)('the rhythm on Today in %s', (lang) => {
  // A Wednesday: Monday and Tuesday are behind it, and four days are still ahead.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 4, 10));
  });
  afterEach(() => { vi.useRealTimers(); });

  const profile = { teachingLanguage: lang, dailyTargetMinutes: 10, displayName: null, onboarded: true, createdAt: '',
    weeklyTargetDays: 4 };
  const weekday = (day: number) =>
    new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', { weekday: 'long' }).format(new Date(2026, 10, day, 12));
  const rhythm = () => screen.getByRole('region', { name: tr('studioRhythm', lang) });

  it('shows the day\'s goal and the week\'s practice days in one place', () => {
    const view = today({ profile, studyDays: [
      { day: '2026-11-02', secondsActive: 9 * 60, answers: 12, correct: 10 },
      // Last week does not count towards this one.
      { day: '2026-11-01', secondsActive: 600, answers: 8, correct: 8 },
      { day: '2026-11-04', secondsActive: 4 * 60 + 50, answers: 5, correct: 5 },
    ] }, lang);
    const widget = within(rhythm());
    expect(widget.getByText(tr('todayGoal', lang, { target: 10 }))).toBeInTheDocument();
    expect(widget.getByText(tr('todayGoalLeft', lang, { n: 6 }))).toBeInTheDocument();
    expect(widget.getByText(tr('rhythmWeekDays', lang, { done: 2, target: 4 }))).toBeInTheDocument();
    expect(widget.getByText(tr('dailyWeekLeft', lang, { n: 2 }))).toBeInTheDocument();
    const days = widget.getAllByRole('listitem');
    const said = [
      tr('rhythmDayPractised', lang, { day: weekday(2) }),
      tr('rhythmDayRest', lang, { day: weekday(3) }),
      tr('rhythmDayPractised', lang, { day: weekday(4) }),
      ...[5, 6, 7, 8].map((day) => tr('rhythmDayAhead', lang, { day: weekday(day) })),
    ];
    expect(days).toHaveLength(7);
    days.forEach((day, index) => expect(day).toHaveTextContent(said[index]!));
    expect(days[2]).toHaveAttribute('aria-current', 'date');
    // Nothing else on the page counts the week again.
    expect(view.container).not.toHaveTextContent(tr('dailyWeekProgress', lang, { done: 2, target: 4 }));
    expect(view.container.querySelectorAll('.goal-ring')).toHaveLength(1);
  });

  it('completes the ring where it can be seen once the goal is met', () => {
    const view = today({ profile, studyDays: [{ day: '2026-11-04', secondsActive: 12 * 60, answers: 30, correct: 28 }] }, lang);
    expect(within(rhythm()).getByText(tr('todayGoalDone', lang))).toBeInTheDocument();
    expect(view.container.querySelector('.goal-ring')).toHaveClass('goal-ring--done');
  });

  it('greets a week with nothing in it without counting what is missing', () => {
    today({ profile }, lang);
    expect(within(rhythm()).getByText(tr('studioWeekEmpty', lang))).toBeInTheDocument();
    expect(within(rhythm()).getByText(tr('todayGoalLeft', lang, { n: 10 }))).toBeInTheDocument();
  });
});
