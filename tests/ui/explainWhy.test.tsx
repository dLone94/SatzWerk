// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';

/**
 * "Why was this wrong?"
 *
 * The three promises worth pinning are not about the text that comes back —
 * that is the model's. They are about the frame around it: it does not exist
 * where no provider is configured, it is labelled as not being the course's
 * own voice, and a failure is visible rather than silent.
 */

const { explainMistake } = vi.hoisted(() => ({ explainMistake: vi.fn() }));

vi.mock('../../src/services/api/client.ts', () => ({
  api: { explainMistake },
  ApiError: class extends Error {},
}));

const { ExplainWhy } = await import('../../src/ui/components/ExplainWhy.tsx');

function stubState(aiAvailable: boolean, lang: TeachingLanguage = 'en'): AppStateValue {
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
    coach: { aiAvailable, provider: aiAvailable ? 'claude:test' : 'none', features: {} },
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

const mount = (aiAvailable: boolean, lang: TeachingLanguage = 'en') =>
  render(
    <AppStateContext.Provider value={stubState(aiAvailable, lang)}>
      <ExplainWhy
        expected="Ich komme aus Bulgarien."
        given="Ich komme von Bulgarien."
        categories={['preposition']}
        level="a1"
      />
    </AppStateContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('asking why an answer was wrong', () => {
  /**
   * A disabled button promising something the deployment cannot do takes up
   * room and teaches the learner to ignore that part of the screen.
   */
  it('renders nothing at all where no provider is configured', () => {
    const { container } = mount(false);
    expect(container).toBeEmptyDOMElement();
    expect(explainMistake).not.toHaveBeenCalled();
  });

  it('asks only when asked, and labels what comes back as not the course', async () => {
    explainMistake.mockResolvedValue({
      available: true,
      explanation: 'German uses aus for the country you come from.',
      language: 'en',
      generated: true,
    });

    mount(true);
    // Nothing is requested on render: a generated paragraph after every slip
    // would be noise, and would cost a request each time.
    expect(explainMistake).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: tr('explainAsk', 'en') }));

    expect(await screen.findByText(/German uses aus/)).toBeInTheDocument();
    // The label has to be there, and has to come before the text it is about.
    const label = screen.getByText(tr('explainGenerated', 'en'));
    const text = screen.getByText(/German uses aus/);
    expect(label.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('sends the learner’s own language and the validator’s verdict', async () => {
    explainMistake.mockResolvedValue({ available: true, explanation: 'нещо', language: 'bg' });
    mount(true, 'bg');
    await userEvent.click(screen.getByRole('button', { name: tr('explainAsk', 'bg') }));

    expect(explainMistake).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'bg', categories: ['preposition'], level: 'a1' }),
    );
  });

  it('says a failure happened instead of quietly showing nothing', async () => {
    explainMistake.mockResolvedValue({
      available: true,
      error: { en: 'The explanation service could not be reached.', bg: 'Не можа да бъде достигната.' },
    });

    mount(true);
    await userEvent.click(screen.getByRole('button', { name: tr('explainAsk', 'en') }));

    expect(await screen.findByText(/could not be reached/)).toBeInTheDocument();
    expect(screen.queryByText(tr('explainGenerated', 'en'))).not.toBeInTheDocument();
  });

  it('survives the request throwing outright', async () => {
    explainMistake.mockRejectedValue(new Error('network down'));
    mount(true);
    await userEvent.click(screen.getByRole('button', { name: tr('explainAsk', 'en') }));
    expect(await screen.findByText(/network down/)).toBeInTheDocument();
  });
});
