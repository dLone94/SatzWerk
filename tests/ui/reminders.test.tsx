// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import { tr } from '../../src/i18n.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';

/**
 * The reminders card, and specifically what it does when the browser says no.
 *
 * Every other state here is a message chosen from a status the service
 * reports. The one that is not is a thrown error: a service worker that will
 * not register, a push service that cannot be reached, a private window where
 * the API is present but refuses. That rejected out of the click handler
 * uncaught, so the tap left the card exactly as it was — the single most
 * misleading outcome for a switch whose whole job is to be switched on.
 */

const { enablePush, disablePush, readPushStatus } = vi.hoisted(() => ({
  enablePush: vi.fn(),
  disablePush: vi.fn(),
  readPushStatus: vi.fn(),
}));

vi.mock('../../src/services/push/index.ts', () => ({
  enablePush,
  disablePush,
  readPushStatus,
}));

// Imported after the mock is registered, since the page imports the service.
const { SettingsPage } = await import('../../src/ui/pages/SettingsPage.tsx');

function stubState(): AppStateValue {
  const lang = 'en' as const;
  return {
    ready: true,
    session: { required: false, signedIn: true },
    signIn: async () => {},
    choosePassword: async () => {},
    changePassword: async () => {},
    signOut: async () => {},
    error: null,
    profile: {
      teachingLanguage: lang,
      dailyTargetMinutes: 20,
      displayName: null,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    lessons: {},
    reviewItems: [],
    mistakes: [],
    favorites: [],
    stats: {
      totalAnswers: 0,
      correctAnswers: 0,
      accuracy: 0,
      totalStudySeconds: 0,
      studyDays: 0,
      streak: 0,
      categoryCounts: [],
      retypedCorrections: 0,
    },
    studyDays: [],
    checkpointResults: [],
    coach: null,
    lang,
    t: (key, vars) => tr(key, lang, vars),
    say: (text) => (text ? text[lang] : ''),
    tts: nullTtsProvider,
    recogniser: createSpeechRecogniser({}),
    lexicon: LEXICON,
    describeNoun,
    reload: async () => undefined,
    setTeachingLanguage: async () => undefined,
    updateProfile: async () => undefined,
    submitAttempt: async () => undefined,
    markSectionSeen: async () => undefined,
    recordMastery: async () => ({
      lessonId: 'x',
      sectionsSeen: [],
      practice: {},
      mastery: { attempts: 1, bestAccuracy: 1, passed: true },
      recoveryRounds: 0,
    }),
    recordRecovery: async () => undefined,
    completeLesson: async () => undefined,
    ensureReviewItems: async () => undefined,
    gradeReview: async () => undefined,
    resolveMistake: async () => undefined,
    toggleFavorite: async () => undefined,
    recordCheckpoint: async () => undefined,
    resetAll: async () => undefined,
    lessonProgress: (lessonId) => ({
      lessonId,
      sectionsSeen: [],
      practice: {},
      mastery: { attempts: 0, bestAccuracy: 0, passed: false },
      recoveryRounds: 0,
    }),
  };
}

const mount = () =>
  render(<AppStateContext.Provider value={stubState()}>{<SettingsPage />}</AppStateContext.Provider>);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('the reminders card', () => {
  it('says what went wrong when the browser refuses to set it up', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    enablePush.mockRejectedValue(new Error('Registration failed - permission denied'));

    mount();
    const button = await screen.findByRole('button', { name: tr('remindersEnable', 'en') });
    await userEvent.click(button);

    await waitFor(() =>
      expect(
        screen.getByText(
          tr('remindersFailed', 'en', { reason: 'Registration failed - permission denied' }),
        ),
      ).toBeInTheDocument(),
    );
    // And the switch is usable again rather than stuck mid-flight.
    expect(screen.getByRole('button', { name: tr('remindersEnable', 'en') })).toBeEnabled();
  });

  it('offers no switch at all when the server has no keys', async () => {
    readPushStatus.mockResolvedValue({ state: 'not-configured' });
    mount();

    expect(await screen.findByText(tr('remindersNotConfigured', 'en'))).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: tr('remindersEnable', 'en') }),
    ).not.toBeInTheDocument();
    expect(enablePush).not.toHaveBeenCalled();
  });

  it('turns on and back off without inventing a state in between', async () => {
    readPushStatus.mockResolvedValue({ state: 'off' });
    enablePush.mockResolvedValue({ state: 'on', endpoint: 'https://push.test/abc' });
    disablePush.mockResolvedValue({ state: 'off' });

    mount();
    await userEvent.click(await screen.findByRole('button', { name: tr('remindersEnable', 'en') }));
    expect(await screen.findByText(tr('remindersOn', 'en'))).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: tr('remindersDisable', 'en') }));
    expect(await screen.findByText(tr('remindersOff', 'en'))).toBeInTheDocument();
    expect(disablePush).toHaveBeenCalledTimes(1);
  });
});

describe('the deadline on the push service', () => {
  it('gives up rather than hanging when the push service never answers', async () => {
    const { withTimeout } = await vi.importActual<typeof import('../../src/services/push/index.ts')>(
      '../../src/services/push/index.ts',
    );
    // A promise that never settles is exactly what a blocked push host
    // produces: not a rejection, not a slow answer, simply nothing.
    vi.useFakeTimers();
    const never = new Promise<string>(() => {});
    const bounded = withTimeout(never, 20_000, 'The push service');
    const seen = bounded.catch((error: Error) => error.message);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(await seen).toBe('The push service did not answer within 20s.');
    vi.useRealTimers();
  });

  it('lets a normal answer through untouched', async () => {
    const { withTimeout } = await vi.importActual<typeof import('../../src/services/push/index.ts')>(
      '../../src/services/push/index.ts',
    );
    await expect(withTimeout(Promise.resolve('fine'), 20_000, 'The push service')).resolves.toBe(
      'fine',
    );
  });
});
