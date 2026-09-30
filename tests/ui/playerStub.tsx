import { screen } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import type { Exercise, ExerciseStep, TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { nullTtsProvider, type TtsProvider } from '../../src/services/tts/index.ts';
import type { AppStateValue } from '../../src/state/AppState.tsx';
import { emptyLessonProgress } from '../../src/core/progress/lesson.ts';

/**
 * A stand-in for the app state, shared by the player tests.
 *
 * Everything is inert unless a test overrides it; the tests that need the
 * state to move as the learner answers keep their own copy in React state and
 * pass the moving parts in as overrides.
 */
export function stubState(overrides: Partial<AppStateValue> = {}, lang: TeachingLanguage = 'en'): AppStateValue {
  return {
    ready: true,
    error: null,
    offline: false,
    session: { required: false, signedIn: true },
    signIn: async () => {},
    choosePassword: async () => {},
    changePassword: async () => {},
    signOut: async () => {},
    profile: { teachingLanguage: lang, dailyTargetMinutes: 20, displayName: null, onboarded: true, createdAt: '' },
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
    scenarioRuns: [],
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
    learners: [{ id: 1, name: 'me', createdAt: '' }],
    studyingAs: 1,
    studyAs: async () => 'switched' as const,
    addLearner: async () => {},
    renameLearner: async () => {},
    notice: null,
    dismissNotice: () => {},
    sync: { pending: 0, other: 0, refused: 0, atRisk: false, lost: 0 },
    syncAnswers: async () => {},
    dismissRefusedAnswers: () => {},
    markSectionSeen: async () => undefined,
    recordMastery: async (lessonId) => emptyLessonProgress(lessonId),
    recordRecovery: async () => undefined,
    completeLesson: async () => undefined,
    ensureReviewItems: async () => undefined,
    gradeReview: async () => undefined,
    resolveMistake: async () => undefined,
    toggleFavorite: async () => undefined,
    recordCheckpoint: async () => undefined,
    recordScenarioRun: async () => undefined,
    resetAll: async () => undefined,
    lessonProgress: (lessonId) => emptyLessonProgress(lessonId),
    ...overrides,
  };
}

/** A voice that says nothing but admits to existing, so play buttons render. */
export const silentVoice: TtsProvider = {
  id: 'silent',
  available: true,
  describe: () => 'silent',
  speak: () => undefined,
  cancel: () => undefined,
};

export type User = ReturnType<typeof userEvent.setup>;

export const stepIdOnScreen = () => document.querySelector('[data-step-id]')?.getAttribute('data-step-id') ?? null;

/**
 * Play whatever player is on screen, one action at a time, until `done` says
 * stop or nothing is left to press.
 *
 * `right` decides, per step, whether the first answer is the right one. A
 * wrong typed answer is then retyped from the correction, the way a learner
 * would. Returns the step ids in the order they were first asked.
 */
export async function play(
  user: User,
  exercises: Exercise[],
  options: { right: (step: ExerciseStep) => boolean; done?: () => boolean; max?: number },
): Promise<string[]> {
  const steps = new Map(exercises.flatMap((exercise) => exercise.steps).map((step) => [step.id, step]));
  const kinds = new Map(exercises.flatMap((exercise) => exercise.steps.map((step) => [step.id, exercise.kind])));
  const asked: string[] = [];
  for (let i = 0; i < (options.max ?? 200); i++) {
    if (options.done?.()) break;
    const cont = screen.queryByRole('button', { name: tr('exerciseContinue', 'en') });
    if (cont) {
      await user.click(cont);
      continue;
    }
    const id = stepIdOnScreen();
    if (!id) break;
    const step = steps.get(id);
    if (!step) break;
    const retyping = Boolean(document.querySelector('.feedback__retype-label'));
    if (!retyping && asked[asked.length - 1] !== id) asked.push(id);
    const box = screen.queryByRole('textbox');
    if (retyping && box) {
      await user.clear(box);
      await user.type(box, step.answer.accepted[0]!);
      await user.keyboard('{Enter}');
      continue;
    }
    const goRight = kinds.get(id) === 'freeWriting' || options.right(step);
    if (box) {
      await user.clear(box);
      await user.type(box, goRight ? step.answer.accepted[0]! : 'völlig falsch');
      await user.keyboard('{Enter}');
      continue;
    }
    const choice = step.choices?.find((candidate) =>
      goRight ? candidate.id === step.correctChoiceId : candidate.id !== step.correctChoiceId,
    );
    if (!choice) break;
    await user.click(screen.getByText(choice.de));
  }
  return asked;
}
