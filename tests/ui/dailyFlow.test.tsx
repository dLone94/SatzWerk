// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { useState } from 'react';
import { SCENARIO_SCRIPTS } from '../../src/content/browser.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { mergeDailyRun, type DailyRunInput } from '../../src/core/progress/daily.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DailyPage } from '../../src/ui/pages/DailyPage.tsx';
import { LearningPreferences } from '../../src/ui/components/LearningPreferences.tsx';
import { dailyListening, phraseRecall } from '../../src/ui/dailyBuilder.ts';
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
