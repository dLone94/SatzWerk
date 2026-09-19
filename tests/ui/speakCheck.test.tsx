// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import type { RecognitionResult, SpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { SpeakCheck } from '../../src/ui/components/SpeakCheck.tsx';

/**
 * The speaking control, driven through a stub recogniser.
 *
 * The behaviour worth pinning is not the happy path — it is the three promises
 * the component makes: it renders nothing at all where there is no recogniser,
 * it never shows a score, and it reports what was heard even when that is
 * wrong, so a mishearing is visible as a mishearing rather than as a failure
 * the learner has to take on trust.
 */

function stubRecogniser(result: RecognitionResult): SpeechRecogniser {
  return {
    available: true,
    listen: vi.fn(async () => result),
    stop: vi.fn(),
  };
}

function stubState(recogniser: SpeechRecogniser, lang: TeachingLanguage = 'en'): AppStateValue {
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
    recogniser,
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

function mount(node: ReactElement, recogniser: SpeechRecogniser, lang: TeachingLanguage = 'en') {
  return render(
    <AppStateContext.Provider value={stubState(recogniser, lang)}>{node}</AppStateContext.Provider>,
  );
}

describe('the speaking check', () => {
  /**
   * A disabled button that says "coming soon" is worse than nothing: it takes
   * up room and promises something the browser cannot do.
   */
  it('renders nothing at all where the browser has no recogniser', () => {
    const { container } = mount(
      <SpeakCheck target="Ich komme aus Bulgarien." />,
      createSpeechRecogniser({}),
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('offers the control where there is one', () => {
    mount(<SpeakCheck target="Ich komme aus Bulgarien." />, stubRecogniser({ transcript: '' }));
    expect(screen.getByRole('button', { name: tr('speakTry', 'en') })).toBeInTheDocument();
  });

  it('says the words were understood when the recogniser heard the sentence', async () => {
    const user = userEvent.setup();
    mount(
      <SpeakCheck target="Ich komme aus Bulgarien." />,
      // Lowercase and unpunctuated, exactly as a recogniser returns it.
      stubRecogniser({ transcript: 'ich komme aus bulgarien' }),
    );
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'en') }));
    expect(await screen.findByText(tr('speakUnderstood', 'en'))).toBeInTheDocument();
  });

  it('shows what it heard when that was not the sentence', async () => {
    const user = userEvent.setup();
    mount(
      <SpeakCheck target="Ich komme aus Bulgarien." />,
      stubRecogniser({ transcript: 'ich komme aus Deutschland' }),
    );
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'en') }));
    expect(await screen.findByText(tr('speakNotQuite', 'en'))).toBeInTheDocument();
    // The learner can see the mishearing rather than having to trust a verdict.
    expect(screen.getByText('ich komme aus Deutschland')).toBeInTheDocument();
  });

  /**
   * The honesty rule this whole feature rests on. A percentage next to a
   * spoken sentence would read as an accent score, which is not what a
   * recogniser measures.
   */
  it('never shows a score, and says what it is actually checking', async () => {
    const user = userEvent.setup();
    const { container } = mount(
      <SpeakCheck target="Ich komme aus Bulgarien." />,
      stubRecogniser({ transcript: 'ich komme aus bulgarien', confidence: 0.91 }),
    );
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'en') }));
    await screen.findByText(tr('speakUnderstood', 'en'));
    expect(screen.getByText(tr('speakWhatItMeans', 'en'))).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\d+\s?%/);
    expect(container.textContent).not.toContain('0.91');
  });

  it('explains a blocked microphone instead of failing silently', async () => {
    const user = userEvent.setup();
    mount(<SpeakCheck target="Es regnet." />, stubRecogniser({ error: 'denied' }));
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'en') }));
    expect(await screen.findByText(tr('speakDenied', 'en'))).toBeInTheDocument();
  });

  it('speaks Bulgarian to a Bulgarian learner', async () => {
    const user = userEvent.setup();
    mount(
      <SpeakCheck target="Es regnet." />,
      stubRecogniser({ transcript: 'es regnet' }),
      'bg',
    );
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'bg') }));
    expect(await screen.findByText(tr('speakUnderstood', 'bg'))).toBeInTheDocument();
  });

  it('waits for the recogniser without blocking the page', async () => {
    const user = userEvent.setup();
    let release: (value: RecognitionResult) => void = () => {};
    const pending = new Promise<RecognitionResult>((resolve) => {
      release = resolve;
    });
    mount(<SpeakCheck target="Es regnet." />, {
      available: true,
      listen: () => pending,
      stop: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: tr('speakTry', 'en') }));
    expect(screen.getByRole('button', { name: tr('speakStop', 'en') })).toBeInTheDocument();
    release({ transcript: 'es regnet' });
    await waitFor(() => expect(screen.getByText(tr('speakUnderstood', 'en'))).toBeInTheDocument());
  });
});
