// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { SCENARIO_SCRIPTS, scriptAnswerCount } from '../../src/content/browser.ts';
import type { ScenarioScript } from '../../src/content/types.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { mergeDailyRun, type DailyRunInput } from '../../src/core/progress/daily.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DailyPage } from '../../src/ui/pages/DailyPage.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { LearningPreferences } from '../../src/ui/components/LearningPreferences.tsx';
import { chooseDailyScript, dailyListening, phraseRecall } from '../../src/ui/dailyBuilder.ts';
import { tr } from '../../src/i18n.ts';
import { play, silentVoice, stubState } from './playerStub.tsx';
import type { AttemptPayload, Profile } from '../../src/services/api/client.ts';

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
  const script = SCENARIO_SCRIPTS.find(script => script.level === 'pre-a1')!;
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
  expect(final).toMatchObject({ stage: 5, listeningCompleted: true, total: 10, firstTryCorrect: 10 });
  expect(attempts).toHaveBeenCalledTimes(10);
  expect(attempts.mock.calls.some(call => (call[0] as { reviewTargets?: unknown[] })?.reviewTargets?.length)).toBe(true);
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

it('a learner handover clears the open daily round', async () => {
  const first = stubState();
  const result = render(<AppStateContext.Provider value={first}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  await userEvent.setup().click(screen.getByRole('button', { name: tr('dailyStart', 'en') }));
  expect(await screen.findByText('Guten Morgen!')).toBeInTheDocument();
  result.rerender(<AppStateContext.Provider value={stubState({ studyingAs: 2 })}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
  expect(screen.getByRole('button', { name: tr('dailyStart', 'en') })).toBeInTheDocument();
  expect(screen.queryByText('Guten Morgen!')).not.toBeInTheDocument();
});

/*
 * Pre-A1 has one conversation, so "Try another practice" brought back the one
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

  it('offers the only beginner conversation again as itself, not as another practice', async () => {
    const user = await finish({ profile: profile('everyday', 'pre-a1') }, 'sc-bakery-pre-a1');
    expect(screen.queryByRole('button', { name: tr('dailyAnother', 'en') })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tr('dailyAgain', 'en') }));
    expect(screen.getByRole('heading', { name: SCENARIO_SCRIPTS.find(script => script.id === 'sc-bakery-pre-a1')!.goal.en })).toBeInTheDocument();
  });

  it('still offers another practice where there is one', async () => {
    const done = chooseDailyScript('everyday', 'a1', [], todayHere());
    const runs = [{ scriptId: done.id, runs: 1, turns: 4, firstTryCorrect: 4, lastAccuracy: 1, bestAccuracy: 1,
      firstRunAt: new Date().toISOString(), lastRunAt: new Date().toISOString() }];
    const next = chooseDailyScript('everyday', 'a1', runs, todayHere());
    expect(next.id).not.toBe(done.id);
    const user = await finish({ profile: profile('everyday', 'a1'), scenarioRuns: runs }, done.id);
    await user.click(screen.getByRole('button', { name: tr('dailyAnother', 'en') }));
    expect(screen.getByRole('heading', { name: next.goal.en })).toBeInTheDocument();
  });

  it('says when a goal has no conversation of its own at this level', () => {
    const view = render(<AppStateContext.Provider value={stubState({ profile: profile('work', 'pre-a1') })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.getByText(tr('dailyGoalElsewhere', 'en'))).toBeInTheDocument();
    view.rerender(<AppStateContext.Provider value={stubState({ profile: profile('travel', 'pre-a1') })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.queryByText(tr('dailyGoalElsewhere', 'en'))).not.toBeInTheDocument();
    view.rerender(<AppStateContext.Provider value={stubState({ profile: profile('work', 'a1') })}>
      <MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    expect(screen.queryByText(tr('dailyGoalElsewhere', 'en'))).not.toBeInTheDocument();
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
    // Pre-A1 has one conversation for every goal: starting it over would only lose the parts done.
    render(<AppStateContext.Provider value={stubState({ profile: { ...profile, learningGoal: 'work', practiceLevel: 'pre-a1' }, dailyRuns: [saved] })}>
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
});

/*
 * Today's main card never looked at the day's practice, and went on saying
 * "Start today" after it was finished.
 */
it.each(['en', 'bg'] as const)('says on Today that today\'s practice is done in %s', lang => {
  const run = { id: 'done', scriptId: 'sc-bakery-pre-a1', goal: 'everyday' as const, stage: 5, total: 10,
    firstTryCorrect: 9, listeningCompleted: true, updatedAt: new Date().toISOString() };
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const before = render(<AppStateContext.Provider value={stubState({ dailyRuns: [{ ...run, day: todayHere(yesterday) }] }, lang)}>
    <MemoryRouter><DashboardPage /></MemoryRouter></AppStateContext.Provider>);
  expect(screen.getByRole('heading', { name: tr('dailyDashboardTitle', lang) })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: tr('dailyStart', lang) })).toHaveAttribute('href', '/daily');
  before.unmount();

  render(<AppStateContext.Provider value={stubState({ dailyRuns: [{ ...run, day: todayHere() }] }, lang)}>
    <MemoryRouter><DashboardPage /></MemoryRouter></AppStateContext.Provider>);
  expect(screen.getByRole('heading', { name: tr('dailyDashboardDone', lang) })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(tr('exerciseScore', lang, { correct: 9, total: 10 })))).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: tr('dailyStart', lang) })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: tr('dailyPractiseAgain', lang) })).toHaveAttribute('href', '/daily');
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
