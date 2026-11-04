// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { VOCABULARY, availableLessons, lessonsInOrder } from '../../src/content/browser.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import type { DailyRun } from '../../src/core/progress/daily.ts';
import { emptyLessonProgress } from '../../src/core/progress/lesson.ts';
import { createReviewItem } from '../../src/core/srs/scheduler.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { CATCH_UP_SIZE } from '../../src/ui/selectors.ts';
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

  /*
   * Five days away, a lesson left part-done and twenty words waiting: Today
   * looked as it did on any other day, and the four-day run before the break
   * had gone without a word.
   */
  describe('back after a break', () => {
    const DAY = 86_400_000;
    const ago = (days: number) => todayHere(new Date(Date.now() - days * DAY));
    const before = [5, 6, 7, 8].map((days) => ({ day: ago(days), secondsActive: 900, answers: 30, correct: 26 }));
    const waiting = VOCABULARY.filter((entry) => entry.level === 'pre-a1').slice(0, 20).map((entry) =>
      createReviewItem({ id: `vocab:${entry.id}`, kind: 'vocab', refId: entry.id, level: 'pre-a1', now: new Date(Date.now() - 6 * DAY) }));
    const plan = (container: HTMLElement) => container.querySelector<HTMLElement>('.today-plan')!;

    it('welcomes the learner back with one warm-up, says plainly what happened, then names the lesson', () => {
      const view = today({ studyDays: before, reviewItems: waiting, lessons: { [first.id]: { ...emptyLessonProgress(first.id), sectionsSeen: [first.sections[0]!.id] } } }, lang);
      const [only, ...others] = primaries(view.container);
      expect(others).toHaveLength(0);
      expect(only).toHaveAccessibleName(tr('welcomeBackStart', lang));
      expect(only).toHaveAttribute('href', '/review?catch-up');
      const card = plan(view.container);
      expect(within(card).getByRole('heading', { name: tr('welcomeBackTitle', lang) })).toBeInTheDocument();
      expect(card).toHaveTextContent(tr('welcomeBackEyebrow', lang));
      expect(card).toHaveTextContent(tr('welcomeBackAway', lang, { n: 5 }));
      expect(card).toHaveTextContent(tr('welcomeBackWaiting', lang, { n: 20, k: CATCH_UP_SIZE }));
      // Twelve answers at the default twenty seconds: four minutes.
      expect(card).toHaveTextContent(tr('dashboardEstimate', lang, { n: 4 }));
      expect(card).toHaveTextContent(tr('welcomeBackRun', lang, { n: 4 }));
      expect(card).not.toHaveTextContent(lang === 'en' ? /missed|lost|broke|behind|again\?/i : /пропусн|загуб|изгуб|изостан/i);
      expect(within(card).getByRole('link', { name: first.title[lang] })).toHaveAttribute('href', `/lesson/${first.id}`);
    });

    it('says nothing of a run of one day, and warms up with all of it when little is waiting', () => {
      const view = today({ studyDays: before.slice(0, 1), reviewItems: waiting.slice(0, 5) }, lang);
      const card = plan(view.container);
      expect(card).toHaveTextContent(tr('welcomeBackAll', lang, { n: 5 }));
      expect(card.querySelector('.today-plan__what')).toBeNull();
    });

    it('goes on as usual once something is answered today, with new material ahead of the pile', () => {
      const back = [{ day: todayHere(), secondsActive: 300, answers: 12, correct: 10 }, ...before];
      const view = today({ studyDays: back, reviewItems: waiting.slice(0, 15) }, lang);
      const card = plan(view.container);
      expect(card).not.toHaveTextContent(tr('welcomeBackEyebrow', lang));
      expect(primaries(view.container)[0]).toHaveAccessibleName(tr('todayPracticeStart', lang));
      expect(within(card).getByRole('link', { name: first.title[lang] })).toHaveAttribute('href', `/lesson/${first.id}`);
    });
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
