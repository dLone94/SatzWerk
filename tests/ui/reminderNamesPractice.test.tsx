// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { practiceReminderText } from '../../server/push.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { chooseDailyScript } from '../../src/ui/dailyBuilder.ts';
import { DailyPage } from '../../src/ui/pages/DailyPage.tsx';
import { inferredPracticeLevel } from '../../src/ui/selectors.ts';
import { stubState } from './playerStub.tsx';

/**
 * The first weeks' reminder has to be about something the learner can find.
 *
 * It named the scenario ("Neighbours and the phone"), which the practice page
 * does not show until the end, so the learner tapped a name and met a heading
 * in other words. It now quotes the page's heading, and this holds the two
 * together: the words after the colon are the words the page opens on.
 */

vi.mock('../../src/services/push/index.ts', async (original) => ({
  ...(await original<typeof import('../../src/services/push/index.ts')>()),
  readPushStatus: async () => ({ state: 'on' }),
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-03-10T10:00:00'));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('the practice the reminder names', () => {
  it.each(['en', 'bg'] as const)('is the heading the practice page opens on, in %s', (lang) => {
    const state = stubState({}, lang);
    // The rows the server reads, put through the same choice it makes.
    const level = state.profile.practiceLevel ?? inferredPracticeLevel(state.lessons, state.checkpointResults);
    const script = chooseDailyScript(state.profile.learningGoal ?? 'everyday', level, state.scenarioRuns, todayHere(),
      -new Date().getTimezoneOffset());
    const note = practiceReminderText(script.goal, lang).body;

    render(<AppStateContext.Provider value={state}><MemoryRouter><DailyPage /></MemoryRouter></AppStateContext.Provider>);
    const heading = document.getElementById('daily-plan-title')!.textContent!;
    expect(note.endsWith(`: ${heading}`)).toBe(true);
  });
});
