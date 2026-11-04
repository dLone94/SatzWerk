// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { availableLessons, lessonsInOrder, SCENARIO_SCRIPTS, scriptAnswerCount } from '../../src/content/browser.ts';
import type { ScenarioScript } from '../../src/content/types.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { mergeDailyRun, type DailyRunInput } from '../../src/core/progress/daily.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DailyPage } from '../../src/ui/pages/DailyPage.tsx';
import { LearningPreferences } from '../../src/ui/components/LearningPreferences.tsx';
import { chooseDailyScript, dailyListening, dailyPhrases, goalScripts, phraseRecall } from '../../src/ui/dailyBuilder.ts';
import { tr } from '../../src/i18n.ts';
import { dailyPatternId } from '../../src/content/dailyPatterns.ts';
import { createReviewItem, scheduleReview } from '../../src/core/srs/scheduler.ts';
import { play, silentVoice, stubState } from './playerStub.tsx';
import type { AttemptPayload, Profile } from '../../src/services/api/client.ts';

/*
 * The day's conversation turns with the date. Tests that read its cards
 * passed on a bakery day and failed on the next two, so these pin the clock
 * to a day on which each everyday Pre-A1 conversation comes up, and run once
 * for each of them.
 */
const EVERYDAY = goalScripts('everyday', 'pre-a1');
function dayOf(script: ScenarioScript) {
  for (let n = 0; n < 28; n++) {
    const day = new Date(Date.UTC(2026, 10, 2 + n)).toISOString().slice(0, 10);
    if (chooseDailyScript('everyday', 'pre-a1', [], day).id === script.id) return day;
  }
  throw new Error(`${script.id} never comes up for everyday Pre-A1`);
}
function onDayOf(script: ScenarioScript) {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${dayOf(script)}T10:00:00`));
    expect(chooseDailyScript('everyday', 'pre-a1', [], todayHere()).id).toBe(script.id);
  });
  afterEach(() => { vi.useRealTimers(); });
}
/** The card's own line, not a frame example that may say the same words. */
const cardLine = (german: string) => screen.findByText(german, { selector: '.phrase-card__german' });

describe.each(EVERYDAY.map(script => [script.id, script] as const))('on a day of %s', (_id, script) => {
  onDayOf(script);

  it.each(['en', 'bg'] as const)('completes the daily journey and banks actual answers and parts in %s', async lang => {
    const attempts = vi.fn(async (_payload: AttemptPayload) => undefined);
    const conversations = vi.fn(async () => undefined);
    const progress = vi.fn(async (_: DailyRunInput) => undefined);
    function Harness() {
      const [runs, setRuns] = useState<AppStateValue['dailyRuns']>([]);
      const value = stubState({ dailyRuns: runs, tts: silentVoice, submitAttempt: attempts,
        recordScenarioRun: conversations, recordDailyRun: async payload => {
          await progress(payload);
          setRuns(runs => mergeDailyRun(runs, { ...payload, updatedAt: new Date().toISOString() }));
        } }, lang);
      return <AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>;
    }
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyStart', lang) }));
    for (let index = 0; index < 2; index++) await user.click(await screen.findByRole('button', { name: tr('dailyNextPhrase', lang) }));
    await user.click(screen.getByRole('button', { name: tr('dailyPutToUse', lang) }));
    const recall = [...phraseRecall(script, lang), ...dailyListening(script, lang)];
    const answers = scriptAnswerCount(script, lang) + recall.length;
    const exercises = [...phraseRecall(script, lang), ...script.beats.flatMap(beat => beat.who === 'you' ? [beat.exercise] : []), ...dailyListening(script, lang)];
    // The shared helper uses English continuation labels; play through that
    // helper in English, and use the same authored answers in Bulgarian below.
    if (lang === 'en') await play(user, exercises, { right: () => true, done: () => Boolean(screen.queryByRole('button', { name: tr('dailyFinish', lang) })) });
    else {
      const map = new Map(exercises.flatMap(exercise => exercise.steps.map(step => [step.id, step])));
      for (let count = 0; count < 100; count++) {
        if (screen.queryByRole('button', { name: tr('dailyFinish', lang) })) break;
        const button = screen.queryByRole('button', { name: tr('exerciseContinue', lang) });
        if (button) { await user.click(button); continue; }
        const id = document.querySelector('[data-step-id]')?.getAttribute('data-step-id');
        const step = id ? map.get(id) : undefined;
        expect(step).toBeDefined();
        const box = screen.getByRole('textbox');
        await user.type(box, step!.answer.accepted[0]!);
        await user.keyboard('{Enter}');
        await waitFor(() => expect(screen.getByRole('button', { name: tr('exerciseContinue', lang) })).toBeInTheDocument());
      }
    }
    await user.click(await screen.findByRole('button', { name: tr('dailyFinish', lang) }));
    expect(await screen.findByRole('heading', { name: tr('dailyFinished', lang) })).toBeInTheDocument();
    expect(conversations).toHaveBeenCalledOnce();
    const final = progress.mock.calls.at(-1)![0];
    expect(final).toMatchObject({ stage: 5, listeningCompleted: true, total: answers, firstTryCorrect: answers });
    expect(attempts).toHaveBeenCalledTimes(answers);
    expect(attempts.mock.calls.some(call => (call[0] as { reviewTargets?: unknown[] })?.reviewTargets?.length)).toBe(true);
  });

  it('a learner handover clears the open daily round', async () => {
    const first = stubState();
    const result = render(<AppStateContext.Provider value={first}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    const phrase = dailyPhrases(script, 'en')[0]!.german;
    expect(await cardLine(phrase)).toBeInTheDocument();
    result.rerender(<AppStateContext.Provider value={stubState({ studyingAs: 2 })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByRole('button', { name: tr('dailyStart', 'en') })).toBeInTheDocument();
    expect(screen.queryByText(phrase)).not.toBeInTheDocument();
  });

  /*
   * The first "new" phrase of a Pre-A1 round was "Guten Morgen!", already in
   * review since the greetings lesson, and the same three came every time.
   */
  it('shows lines not met yet first, and marks a phrase met before', async () => {
    const first = dailyPhrases(script, 'en');
    // Every line met but the first card's, and one line more that was never a card.
    const lines = script.beats.flatMap(beat => beat.who === 'you' && !beat.exercise.only?.includes('bg') ? beat.exercise.steps : []);
    const yesterday = new Date(Date.now() - 86_400_000);
    const reviewItems = lines.filter(step => step.id !== first[0]!.step.id).map(step => createReviewItem({ id: step.id,
      kind: 'pattern', refId: dailyPatternId(step.id), level: 'pre-a1', now: yesterday }));
    const expected = dailyPhrases(script, 'en', reviewItems);
    expect(expected.map(card => card.again)).toEqual([false, true, true]);
    render(<AppStateContext.Provider value={stubState({ reviewItems })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    for (const [index, card] of expected.entries()) {
      expect(await cardLine(card.german)).toBeInTheDocument();
      expect(Boolean(screen.queryByText(tr('dailyPhraseAgain', 'en')))).toBe(card.again);
      if (index + 1 < expected.length) await user.click(screen.getByRole('button', { name: tr('dailyNextPhrase', 'en') }));
    }
  });

  // Answering today's recall puts the phrases in review; reopened, the round keeps its cards.
  it('keeps the day’s phrases when today’s answers reach review', async () => {
    const first = dailyPhrases(script, 'en');
    const today = first.map(card => createReviewItem({ id: card.step.id, kind: 'pattern',
      refId: dailyPatternId(card.step.id), level: 'pre-a1' }));
    // Counted, they would have changed the cards.
    expect(dailyPhrases(script, 'en', today).some(card => card.again)).toBe(true);
    render(<AppStateContext.Provider value={stubState({ reviewItems: today })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    expect(await cardLine(first[0]!.german)).toBeInTheDocument();
    expect(screen.queryByText(tr('dailyPhraseAgain', 'en'))).not.toBeInTheDocument();
  });

  /*
   * A returning learner's cards were the met lines reviewed longest ago, and
   * the review part of the same round reviews them. Reopened after that, the
   * round showed other cards, then asked to recall phrases it had not shown.
   */
  it('keeps the met phrases on its cards after the round reviews them', async () => {
    const lines = script.beats.flatMap(beat => beat.who === 'you' && !beat.exercise.only?.includes('bg') ? beat.exercise.steps : []);
    const days = (n: number) => new Date(Date.now() - n * 86_400_000);
    const before = lines.map((step, index) => scheduleReview(createReviewItem({ id: step.id, kind: 'pattern',
      refId: dailyPatternId(step.id), level: 'pre-a1', now: days(10) }), 'good', days(1 + index)));
    const expected = dailyPhrases(script, 'en', before);
    expect(expected.every(card => card.again)).toBe(true);
    const shown = new Set(expected.map(card => dailyPatternId(card.step.id)));
    const reviewed = before.map(item => shown.has(item.refId) ? scheduleReview(item, 'good') : item);
    // Opened afresh, as after a reload, with this round's review already answered.
    render(<AppStateContext.Provider value={stubState({ reviewItems: reviewed })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    for (const [index, card] of expected.entries()) {
      expect(await cardLine(card.german)).toBeInTheDocument();
      // The frame's examples are other sentences, never the card's own line again.
      expect(screen.getAllByText(card.german)).toHaveLength(1);
      if (index + 1 < expected.length) await user.click(screen.getByRole('button', { name: tr('dailyNextPhrase', 'en') }));
    }
  });
});

it('resumes a saved part and does not falsely record listening on a device without audio', async () => {
  const progress = vi.fn(async (_: DailyRunInput) => undefined);
  const value = stubState({ dailyRuns: [{ id: 'resume', day: todayHere(), scriptId: 'sc-bakery-pre-a1', goal: 'everyday',
    stage: 4, total: 7, firstTryCorrect: 5, listeningCompleted: false, updatedAt: new Date().toISOString() }], recordDailyRun: progress });
  render(<AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
  expect(await screen.findByText(tr('dailyAudioUnavailable', 'en'))).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: tr('dailyFinish', 'en') }));
  expect(progress.mock.calls.at(-1)![0]).toMatchObject({ stage: 5, total: 7, listeningCompleted: false });
});

it('persists a selected goal, level and forgiving weekly rhythm', async () => {
  const update = vi.fn(async (_patch: Partial<Profile>) => undefined);
  render(<AppStateContext.Provider value={stubState({ updateProfile: update })}><LearningPreferences /></AppStateContext.Provider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Work' }));
  await user.selectOptions(screen.getByLabelText(tr('dailyLevelLabel', 'en')), 'a2');
  await user.selectOptions(screen.getByLabelText(tr('dailyWeeklyLabel', 'en')), '3');
  expect(update.mock.calls).toEqual([[{ learningGoal: 'work' }], [{ practiceLevel: 'a2' }], [{ weeklyTargetDays: 3 }]]);
});

it('retries a failed part save without counting its conversation twice', async () => {
  const script = SCENARIO_SCRIPTS.find(script => script.id === 'sc-bakery-pre-a1')!;
  const conversations = vi.fn(async () => undefined);
  let failed = false;
  const progress = vi.fn(async (payload: DailyRunInput) => {
    if (payload.stage === 4 && !failed) {
      failed = true;
      throw new Error('Queue storage is full');
    }
  });
  const value = stubState({ dailyRuns: [{ id: 'retry-part', day: todayHere(), scriptId: script.id,
    goal: 'everyday', stage: 3, total: 4, firstTryCorrect: 4, listeningCompleted: false,
    updatedAt: new Date().toISOString() }], recordScenarioRun: conversations, recordDailyRun: progress });
  render(<AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
  await play(user, script.beats.flatMap(beat => beat.who === 'you' ? [beat.exercise] : []), { right: () => true });
  await user.click(await screen.findByRole('button', { name: tr('retry', 'en') }));
  expect(await screen.findByText(tr('dailyAudioUnavailable', 'en'))).toBeInTheDocument();
  expect(conversations).toHaveBeenCalledOnce();
  expect(progress.mock.calls.at(-1)![0]).toMatchObject({ stage: 4, total: 8, firstTryCorrect: 8 });
});

/*
 * "Next phrase" swapped the card in place and left focus on the button, so a
 * screen reader heard nothing of "Phrase 2 of 3" or the new German.
 */
it('takes focus to each new phrase by its title', async () => {
  render(<AppStateContext.Provider value={stubState()}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
  await user.click(await screen.findByRole('button', { name: tr('dailyNextPhrase', 'en') }));
  expect(screen.getByRole('heading', { level: 2, name: /^Phrase 2 of/ })).toHaveFocus();
});

/*
 * Pre-A1 had one conversation, so "Try another practice" brought back the one
 * just finished, and choosing Work or Exam practice changed only the tag.
 */
describe('what the next practice really is', () => {
  const finishing = (scriptId: string) => ({ id: 'finishing', day: todayHere(), scriptId, goal: 'everyday' as const,
    stage: 4, total: 8, firstTryCorrect: 8, listeningCompleted: false, updatedAt: new Date().toISOString() });
  const profile = (learningGoal: Profile['learningGoal'], practiceLevel: Profile['practiceLevel']) => ({ teachingLanguage: 'en' as const,
    dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '', learningGoal, practiceLevel });
  async function finish(overrides: Partial<AppStateValue>, scriptId: string) {
    // Saved parts reach the state, as they do in the app.
    function Harness() {
      const [runs, setRuns] = useState<AppStateValue['dailyRuns']>([finishing(scriptId)]);
      const value = stubState({ ...overrides, dailyRuns: runs, recordDailyRun: async payload => {
        setRuns(runs => mergeDailyRun(runs, { ...payload, updatedAt: new Date().toISOString() }));
      } });
      return <AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>;
    }
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyFinish', 'en') }));
    await screen.findByRole('heading', { name: tr('dailyFinished', 'en') });
    return user;
  }

  // Until the finished conversation reaches the saved runs, the plan is still that one.
  it('offers the same conversation again as itself, not as another practice', async () => {
    const same = chooseDailyScript('everyday', 'pre-a1', [], todayHere());
    const user = await finish({ profile: profile('everyday', 'pre-a1') }, same.id);
    expect(screen.queryByRole('button', { name: tr('dailyAnother', 'en') })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tr('dailyAgain', 'en') }));
    expect(screen.getByRole('heading', { name: same.goal.en })).toBeInTheDocument();
  });

  it.each(['pre-a1', 'a1'] as const)('offers another practice at %s once one is done', async level => {
    const done = chooseDailyScript('everyday', level, [], todayHere());
    const runs = [{ scriptId: done.id, runs: 1, turns: 4, firstTryCorrect: 4, lastAccuracy: 1, bestAccuracy: 1,
      firstRunAt: new Date().toISOString(), lastRunAt: new Date().toISOString() }];
    const next = chooseDailyScript('everyday', level, runs, todayHere());
    expect(next.id).not.toBe(done.id);
    const user = await finish({ profile: profile('everyday', level), scenarioRuns: runs }, done.id);
    await user.click(screen.getByRole('button', { name: tr('dailyAnother', 'en') }));
    expect(screen.getByRole('heading', { name: next.goal.en })).toBeInTheDocument();
  });

  /*
   * Travel has one conversation at B2. It takes turns with the rest of the
   * level rather than coming back every day, and the day it rests says so.
   */
  it('says why a conversation from outside the goal is today’s', () => {
    const [only] = goalScripts('travel', 'b2');
    expect(goalScripts('travel', 'b2')).toHaveLength(1);
    const rested = [{ scriptId: only!.id, runs: 1, turns: 4, firstTryCorrect: 4, lastAccuracy: 1, bestAccuracy: 1,
      firstRunAt: new Date().toISOString(), lastRunAt: new Date().toISOString() }];
    const view = render(<AppStateContext.Provider value={stubState({ profile: profile('travel', 'b2'), scenarioRuns: rested })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByText(tr('dailyGoalResting', 'en'))).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: only!.goal.en })).not.toBeInTheDocument();
    view.rerender(<AppStateContext.Provider value={stubState({ profile: profile('travel', 'b2') })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByRole('heading', { name: only!.goal.en })).toBeInTheDocument();
    expect(screen.queryByText(tr('dailyGoalResting', 'en'))).not.toBeInTheDocument();
    for (const goal of ['work', 'exams'] as const) {
      view.rerender(<AppStateContext.Provider value={stubState({ profile: profile(goal, 'pre-a1') })}>
        <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
      expect(screen.queryByText(tr('dailyGoalResting', 'en'))).not.toBeInTheDocument();
      expect(screen.queryByText(tr('dailyGoalElsewhere', 'en'))).not.toBeInTheDocument();
    }
  });
});

/*
 * A goal or level chosen while today's round was open changed nothing: the
 * card kept the old round, offered only to continue it, and showed the time
 * of the new plan beside it.
 */
describe('a new goal or level while a round is open', () => {
  const saved = { id: 'open-round', day: todayHere(), scriptId: 'sc-bakery-pre-a1', goal: 'everyday' as const,
    stage: 2, total: 0, firstTryCorrect: 0, listeningCompleted: false, updatedAt: new Date().toISOString() };
  const profile = { teachingLanguage: 'en' as const, dailyTargetMinutes: 20, displayName: null, onboarded: true,
    createdAt: '', learningGoal: 'travel' as const, practiceLevel: 'b2' as const };
  const estimateOnScreen = () => document.querySelector('.daily-plan__estimate')!.textContent;

  it('offers the new plan first, with its own estimate, and starts it as a new round', async () => {
    const fresh = chooseDailyScript('travel', 'b2', [], todayHere());
    render(<AppStateContext.Provider value={stubState({ profile })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const expected = estimateOnScreen();
    cleanup();

    const progress = vi.fn(async (_: DailyRunInput) => undefined);
    render(<AppStateContext.Provider value={stubState({ profile, dailyRuns: [saved], recordDailyRun: progress })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByRole('heading', { name: fresh.goal.en })).toBeInTheDocument();
    expect(screen.getByText('Travel · B2')).toBeInTheDocument();
    expect(estimateOnScreen()).toBe(expected);
    expect(screen.queryByRole('button', { name: tr('dailyResume', 'en') })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: tr('dailyResumeEarlier', 'en', { plan: 'Everyday life · PRE-A1' }) })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    expect(progress.mock.calls[0]![0]).toMatchObject({ scriptId: fresh.id, goal: 'travel', stage: 0 });
    expect(progress.mock.calls[0]![0].id).not.toBe(saved.id);
  });

  it('keeps the round already begun one tap away', async () => {
    const progress = vi.fn(async (_: DailyRunInput) => undefined);
    render(<AppStateContext.Provider value={stubState({ profile, dailyRuns: [saved], recordDailyRun: progress })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyResumeEarlier', 'en', { plan: 'Everyday life · PRE-A1' }) }));
    expect(await screen.findByRole('heading', { name: tr('dailyRecall', 'en') })).toBeInTheDocument();
    expect(progress.mock.calls[0]![0]).toMatchObject({ id: saved.id, scriptId: saved.scriptId, stage: 2 });
  });

  it('does the same for a round paused on this screen', async () => {
    const everyday = { ...profile, learningGoal: 'everyday' as const, practiceLevel: 'pre-a1' as const };
    const view = render(<AppStateContext.Provider value={stubState({ profile: everyday })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyNextPhrase', 'en') }));
    await user.click(screen.getByRole('button', { name: tr('dailyPause', 'en') }));
    view.rerender(<AppStateContext.Provider value={stubState({ profile })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByText('Travel · B2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tr('dailyResumeEarlier', 'en', { plan: 'Everyday life · PRE-A1' }) }));
    expect(await screen.findByText(tr('dailyPhraseCount', 'en', { n: 2, total: 3 }))).toBeInTheDocument();
  });

  it('just continues when the new goal brings the same conversation', () => {
    // The round under way is the very conversation the new goal brings: starting over would only lose the parts done.
    const shared = chooseDailyScript('work', 'pre-a1', [], todayHere());
    render(<AppStateContext.Provider value={stubState({ profile: { ...profile, learningGoal: 'work', practiceLevel: 'pre-a1' },
      dailyRuns: [{ ...saved, scriptId: shared.id }] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByRole('button', { name: tr('dailyResume', 'en') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: tr('dailyResumeEarlier', 'en', { plan: 'Everyday life · PRE-A1' }) })).not.toBeInTheDocument();
  });

  it('estimates the round the card shows, not the one a fresh plan would pick', async () => {
    const answers = (script: ScenarioScript) => scriptAnswerCount(script, 'en') + phraseRecall(script, 'en').length + dailyListening(script, 'en').length;
    const fresh = chooseDailyScript('everyday', 'a1', [], todayHere());
    // A round begun earlier today on a conversation of a different length.
    const other = SCENARIO_SCRIPTS.filter(script => script.level === 'a1')
      .find(script => (answers(script) >= 10) !== (answers(fresh) >= 10))!;
    const sameProfile = { ...profile, learningGoal: 'everyday' as const, practiceLevel: 'a1' as const };
    render(<AppStateContext.Provider value={stubState({ profile: sameProfile })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const freshEstimate = estimateOnScreen();
    cleanup();

    render(<AppStateContext.Provider value={stubState({ profile: sameProfile, dailyRuns: [{ ...saved, scriptId: other.id }] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByRole('heading', { name: other.goal.en })).toBeInTheDocument();
    const shown = estimateOnScreen();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyPause', 'en') }));
    // Paused, the round in hand is estimated from its own script.
    expect(estimateOnScreen()).toBe(shown);
    expect(shown).not.toBe(freshEstimate);
  });

  /*
   * Trying B2 and going back left two rounds open, and the page only looked
   * at the latest: going back offered "Start today" and stranded the parts
   * already done in the round that fitted.
   */
  it('continues the round that fits the plan when another was begun later', async () => {
    const travel = { ...saved, id: 'travel-round', scriptId: chooseDailyScript('travel', 'b2', [], todayHere()).id,
      goal: 'travel' as const, stage: 1, updatedAt: new Date(Date.now() + 60_000).toISOString() };
    for (const [chosen, round, part] of [
      [{ ...profile, learningGoal: 'everyday' as const, practiceLevel: 'pre-a1' as const }, saved, 'dailyRecall'],
      [profile, travel, 'dailyReview'],
    ] as const) {
      const progress = vi.fn(async (_: DailyRunInput) => undefined);
      const view = render(<AppStateContext.Provider value={stubState({ profile: chosen, dailyRuns: [travel, saved], recordDailyRun: progress })}>
        <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
      expect(screen.queryByRole('button', { name: tr('dailyStart', 'en') })).not.toBeInTheDocument();
      expect(document.querySelector('.daily-plan__earlier')).toBeNull();
      await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
      expect(await screen.findByRole('heading', { name: tr(part, 'en') })).toBeInTheDocument();
      expect(progress.mock.calls[0]![0]).toMatchObject({ id: round.id, stage: round.stage });
      view.unmount();
    }
  });

  it('does the same when the round set aside is the one paused on this screen', async () => {
    const recorded: DailyRunInput[] = [];
    // Saved parts reach the state, as they do in the app.
    function Mirrored({ chosen }: { chosen: Profile }) {
      const [runs, setRuns] = useState<AppStateValue['dailyRuns']>([saved]);
      return <AppStateContext.Provider value={stubState({ profile: chosen, dailyRuns: runs, recordDailyRun: async payload => {
        recorded.push(payload);
        setRuns(runs => mergeDailyRun(runs, { ...payload, updatedAt: new Date().toISOString() }));
      } })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>;
    }
    const everyday = { ...profile, learningGoal: 'everyday' as const, practiceLevel: 'pre-a1' as const };
    const view = render(<Mirrored chosen={profile} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyPause', 'en') }));
    const travel = recorded[0]!;
    expect(travel).toMatchObject({ goal: 'travel', stage: 0 });

    view.rerender(<Mirrored chosen={everyday} />);
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    expect(await screen.findByRole('heading', { name: tr('dailyRecall', 'en') })).toBeInTheDocument();
    expect(recorded.at(-1)).toMatchObject({ id: saved.id, stage: 2 });

    // And back again: the B2 round is still there, not begun a third time.
    await user.click(screen.getByRole('button', { name: tr('dailyPause', 'en') }));
    view.rerender(<Mirrored chosen={profile} />);
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    expect(await screen.findByText(tr('dailyPhraseCount', 'en', { n: 1, total: 3 }))).toBeInTheDocument();
    expect(recorded.at(-1)).toMatchObject({ id: travel.id, stage: 0 });
    expect(new Set(recorded.map(round => round.id))).toEqual(new Set([saved.id, travel.id]));
  });

  // Only a chosen level is a new plan. The level read from the lessons moved
  // as soon as a lesson of the next level was opened, and set the round aside.
  it('keeps the round under way when the level was only inferred from the lessons', () => {
    const next = lessonsInOrder().find(lesson => lesson.level === 'a1' && lesson.status === 'available')!;
    const lessons = { [next.id]: { lessonId: next.id, sectionsSeen: [next.sections[0]!.id], practice: {},
      mastery: { attempts: 0, bestAccuracy: 0, passed: false }, recoveryRounds: 0 } };
    const unchosen = { ...profile, learningGoal: 'everyday' as const, practiceLevel: undefined };
    const view = render(<AppStateContext.Provider value={stubState({ profile: unchosen, lessons, dailyRuns: [saved] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByText('Everyday life · PRE-A1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: tr('dailyResume', 'en') })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: tr('dailyStart', 'en') })).not.toBeInTheDocument();

    // Chosen, the same level is a new plan.
    view.rerender(<AppStateContext.Provider value={stubState({ profile: { ...unchosen, practiceLevel: 'a1' }, lessons, dailyRuns: [saved] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByText('Everyday life · A1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: tr('dailyStart', 'en') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: tr('dailyResumeEarlier', 'en', { plan: 'Everyday life · PRE-A1' }) })).toBeInTheDocument();
  });
});

/*
 * With nothing due the review part was jumped over, and the track then ticked
 * "Strengthen what you know" as done although it never happened.
 */
it('says the review is clear rather than ticking a review that never happened', async () => {
  const runs: DailyRunInput[] = [];
  render(<AppStateContext.Provider value={stubState({ recordDailyRun: async run => { runs.push(run); } })}>
    <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
  for (let index = 0; index < 2; index++) await user.click(await screen.findByRole('button', { name: tr('dailyNextPhrase', 'en') }));
  await user.click(screen.getByRole('button', { name: tr('dailyPutToUse', 'en') }));
  expect(await screen.findByText(tr('dailyReviewClearNote', 'en'))).toBeInTheDocument();
  const reviewStep = () => screen.getByRole('list', { name: tr('dailyPlanProgress', 'en') }).children[1]!;
  expect(reviewStep()).toHaveAttribute('aria-current', 'step');
  expect(reviewStep()).not.toHaveClass('is-done');
  await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));
  expect(await screen.findByRole('heading', { name: tr('dailyRecall', 'en') })).toBeInTheDocument();
  expect(reviewStep()).toHaveClass('is-done');
  expect(runs.map(run => run.stage)).toEqual([0, 1, 2]);
});

/*
 * The parts swap in place under the same address, and the page kept the
 * scroll of the one before: on a phone Finish sits under a long card, and the
 * celebration opened with its picture and tick above the screen.
 */
it('opens each part and the finish at the top, before the conversation scrolls to its line', async () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  try {
    const run = { id: 'scroll', day: todayHere(), scriptId: 'sc-bakery-pre-a1', goal: 'everyday' as const,
      total: 4, firstTryCorrect: 4, listeningCompleted: false, updatedAt: new Date().toISOString() };
    const conversation = render(<AppStateContext.Provider value={stubState({ dailyRuns: [{ ...run, stage: 3 }] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(scrollTo).not.toHaveBeenCalled();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    await screen.findByText(tr('dailyConversationNote', 'en'));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(scrollIntoView).toHaveBeenCalled();
    // The conversation's own scroll to its first line comes last and stays.
    expect(scrollTo.mock.invocationCallOrder.at(-1)!).toBeLessThan(scrollIntoView.mock.invocationCallOrder.at(-1)!);
    conversation.unmount();

    render(<AppStateContext.Provider value={stubState({ dailyRuns: [{ ...run, stage: 4 }] })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    await user.click(screen.getByRole('button', { name: tr('dailyResume', 'en') }));
    await user.click(await screen.findByRole('button', { name: tr('dailyFinish', 'en') }));
    expect(await screen.findByRole('heading', { name: tr('dailyFinished', 'en') })).toHaveFocus();
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
    expect(scrollTo.mock.invocationCallOrder.at(-1)!).toBeGreaterThan(scrollIntoView.mock.invocationCallOrder.at(-1)!);
  } finally {
    scrollTo.mockRestore();
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  }
});

/*
 * Finishing the daily practice was a flat card: a score, a sentence and two
 * buttons of equal weight, one back to Today and one to do it again. Lessons
 * had confetti; the practice a learner does every day had none, no day
 * counted and nothing said what came next. Now it celebrates with what was
 * really done, and offers the one next step Today would offer.
 */
describe.each(['en', 'bg'] as const)('the finish of the daily practice in %s', lang => {
  const script = EVERYDAY[0]!;
  onDayOf(script);
  const first = lessonsInOrder().find(lesson => availableLessons().includes(lesson))!;
  const profile = { teachingLanguage: lang, dailyTargetMinutes: 10, displayName: null, onboarded: true, createdAt: '',
    learningGoal: 'everyday' as const, practiceLevel: 'pre-a1' as const, weeklyTargetDays: 4 };

  async function finish(overrides: Partial<AppStateValue> = {}) {
    function Harness() {
      const [runs, setRuns] = useState<AppStateValue['dailyRuns']>([{ id: 'finishing', day: todayHere(), scriptId: script.id,
        goal: 'everyday', stage: 4, total: 9, firstTryCorrect: 8, listeningCompleted: false, updatedAt: new Date().toISOString() }]);
      const value = stubState({ profile, ...overrides, dailyRuns: runs, recordDailyRun: async payload => {
        setRuns(runs => mergeDailyRun(runs, { ...payload, updatedAt: new Date().toISOString() }));
      } }, lang);
      return <AppStateContext.Provider value={value}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>;
    }
    const view = render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: tr('dailyResume', lang) }));
    await user.click(await screen.findByRole('button', { name: tr('dailyFinish', lang) }));
    await screen.findByRole('heading', { level: 1, name: tr('dailyFinished', lang) });
    return view;
  }
  const studied = (minutes: number) => ({ studyDays: [{ day: todayHere(), secondsActive: minutes * 60, answers: 9, correct: 8 }] });

  it('celebrates with what was really done today', async () => {
    const view = await finish({ ...studied(7), stats: { ...stubState().stats, streak: 3 } });
    const finished = view.container.querySelector<HTMLElement>('.daily-finished')!;
    expect(finished.querySelector('.confetti')).toHaveAttribute('aria-hidden', 'true');
    expect(within(finished).getByText('Geschafft!')).toHaveAttribute('lang', 'de');
    const wins = within(within(finished).getByRole('list', { name: tr('dailyWinsTitle', lang) }));
    expect(wins.getByText(tr('dailyWinNewPhrases', lang, { n: 3 }))).toBeInTheDocument();
    expect(wins.getByText(tr('exerciseScore', lang, { correct: 8, total: 9 }))).toBeInTheDocument();
    expect(wins.getByText(tr('todayStreak', lang, { n: 3 }))).toBeInTheDocument();
    // The phrases themselves, to hear again.
    const said = within(within(finished).getByRole('list', { name: tr('dailyPhrasesTitle', lang) }));
    for (const card of dailyPhrases(script, lang, [], todayHere())) {
      expect(said.getByText(card.german)).toHaveAttribute('lang', 'de');
    }
    // The day's goal and the week, with today's dot filled in.
    const rhythm = within(finished).getByRole('region', { name: tr('studioRhythm', lang) });
    expect(within(rhythm).getByText(tr('todayGoalLeft', lang, { n: 3 }))).toBeInTheDocument();
    expect(rhythm.querySelector('[aria-current="date"]')).toHaveClass('rhythm__day--practised');
  });

  it('counts no streak it does not have', async () => {
    await finish({ ...studied(7), stats: { ...stubState().stats, streak: 1 } });
    expect(screen.queryByText(tr('todayStreak', lang, { n: 1 }))).not.toBeInTheDocument();
  });

  it('offers the next step Today would offer as its one button', async () => {
    const view = await finish(studied(7));
    const [only, ...others] = [...view.container.querySelectorAll('.btn--primary')];
    expect(others).toHaveLength(0);
    expect(only).toHaveAccessibleName(`${tr('dashboardStartLesson', lang)}: ${first.title[lang]}`);
    expect(only).toHaveAttribute('href', `/lesson/${first.id}`);
    // Doing it again is still there, and quieter.
    expect(screen.getByRole('button', { name: tr('dailyAgain', lang) })).not.toHaveClass('btn--primary');
  });

  it('sends the learner back to Today once the day’s goal is met', async () => {
    const view = await finish(studied(11));
    const [only, ...others] = [...view.container.querySelectorAll('.btn--primary')];
    expect(others).toHaveLength(0);
    expect(only).toHaveAccessibleName(tr('navToday', lang));
    expect(only).toHaveAttribute('href', '/');
    expect(screen.getByText(tr('todayDoneGoal', lang))).toBeInTheDocument();
    expect(view.container.querySelector('.goal-ring')).toHaveClass('goal-ring--done');
  });
});
