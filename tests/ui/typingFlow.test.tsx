// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun, lessonById } from '../../src/content/index.ts';
import { dictation, exercise, freeWriting, typeIt } from '../../src/content/authoring.ts';
import type { Exercise, TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import type { AttemptPayload } from '../../src/services/api/client.ts';
import { nullTtsProvider, type TtsProvider } from '../../src/services/tts/index.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';

/**
 * The critical flow: type German, receive a specific correction, retype it, and
 * only then continue. This is the behaviour the whole product rests on, so it
 * is tested through the real component with the real validator.
 */

const attempts: AttemptPayload[] = [];

function stubState(lang: TeachingLanguage): AppStateValue {
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
    scenarioRuns: [],
    coach: null,
    lang,
    t: (key, vars) => tr(key, lang, vars),
    say: (text) => (text ? text[lang] : ''),
    tts: nullTtsProvider,
    // No browser recogniser in jsdom, which is the honest default: the speak
    // button is not rendered at all when there is nothing to listen with.
    recogniser: createSpeechRecogniser({}),
    lexicon: LEXICON,
    describeNoun,
    reload: async () => undefined,
    setTeachingLanguage: async () => undefined,
    updateProfile: async () => undefined,
    learners: [{ id: 1, name: 'me', createdAt: new Date().toISOString() }],
    studyingAs: 1,
    studyAs: async () => 'switched' as const,
    addLearner: async () => {},
    renameLearner: async () => {},
    offline: false,
    notice: null,
    dismissNotice: () => {},
    sync: { pending: 0, other: 0, refused: 0, atRisk: false, lost: 0 },
    syncAnswers: async () => {},
    dismissRefusedAnswers: () => {},
    submitAttempt: async (payload) => {
      attempts.push(payload);
    },
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
    recordScenarioRun: async () => undefined,
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

function mount(node: ReactElement, lang: TeachingLanguage = 'en') {
  return render(<AppStateContext.Provider value={stubState(lang)}>{node}</AppStateContext.Provider>);
}

const bi = (en: string, bg: string) => ({ en, bg });

/** The example from the product brief. */
const originExercise: Exercise = typeIt('t-origin', bi('Origin', 'Произход'), [
  {
    id: 't-origin-s1',
    prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
    answer: 'Ich komme aus Bulgarien.',
    traps: [
      {
        answer: 'Ich komme von Bulgarien.',
        category: 'preposition',
        feedback: bi(
          'For a country of origin German uses "aus".',
          'За държава на произход немският използва „aus“.',
        ),
      },
    ],
    hints: [bi('Four words.', 'Четири думи.'), bi('Ich komme ...', 'Ich komme ...')],
  },
  {
    id: 't-origin-s2',
    prompt: bi('I live in Hamburg.', 'Живея в Хамбург.'),
    answer: 'Ich wohne in Hamburg.',
    hints: [bi('Start with Ich.', 'Започни с Ich.')],
  },
]);

const field = () => screen.getByRole('textbox');

beforeEach(() => {
  attempts.length = 0;
});

describe('the typing and correction flow', () => {
  it('autofocuses the answer field so the learner can just type', () => {
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    expect(field()).toHaveFocus();
  });

  it('accepts a correct answer on Enter and advances on Enter again', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={onFinish} />);

    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    expect(await screen.findByText('Correct.')).toBeInTheDocument();

    // Enter again moves on, and the input is focused for the next task.
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByText(/I live in Hamburg/)).toBeInTheDocument());
    await waitFor(() => expect(field()).toHaveFocus());

    expect(attempts[0]).toMatchObject({
      stepId: 't-origin-s1',
      verdict: 'correct',
      credit: 1,
      isRetype: false,
      resolved: true,
    });
  });

  it('explains a preposition mistake and blocks progress until it is retyped', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={onFinish} />);

    await user.type(field(), 'Ich komme von Bulgarien.{Enter}');

    // The authored explanation, not a bare "wrong".
    expect(await screen.findByText(/For a country of origin German uses/)).toBeInTheDocument();
    expect(screen.getByText('Not quite.')).toBeInTheDocument();
    // The answer sits beside what was typed; it is not repeated as a sentence
    // under the explanation as well.
    expect(document.querySelector('.feedback__expected')?.textContent).toBe('Ich komme aus Bulgarien.');
    expect(document.querySelector('.feedback__lines')?.textContent).not.toContain('Ich komme aus Bulgarien.');
    expect(screen.queryByText(/The correct answer is/)).not.toBeInTheDocument();

    // A retype is demanded; there is no Continue button to escape with.
    expect(screen.getByText('Now type the correct German')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();

    expect(attempts[0]).toMatchObject({ verdict: 'incorrect', credit: 0, resolved: false, isRetype: false });
    expect(attempts[0]!.categories).toContain('preposition');

    // A second wrong attempt does not let the learner through.
    await user.clear(field());
    await user.type(field(), 'Ich komme von Bulgarien.{Enter}');
    await waitFor(() => expect(screen.getByText('Type the correction to continue.')).toBeInTheDocument());
    expect(screen.getByText('Now type the correct German')).toBeInTheDocument();

    // The correct retyping is accepted and only then can they continue.
    await user.clear(field());
    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    const continueButton = await screen.findByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();

    const retype = attempts.find((attempt) => attempt.isRetype);
    expect(retype).toMatchObject({ isRetype: true, resolved: true, verdict: 'correct' });
    // The retyping must not be recorded as a fresh mistake.
    expect(retype!.categories).toEqual([]);
  });

  it('marks a wrong article as a gender mistake and gives no credit', async () => {
    const user = userEvent.setup();
    const exercise = typeIt('t-article', bi('Article', 'Член'), [
      {
        id: 't-article-s1',
        prompt: bi('I have a daughter.', 'Имам една дъщеря.'),
        answer: 'Ich habe eine Tochter.',
        hints: [],
      },
    ]);
    mount(<ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.type(field(), 'Ich habe ein Tochter.{Enter}');
    expect(await screen.findByText(/is feminine: die Tochter/)).toBeInTheDocument();
    expect(attempts[0]).toMatchObject({ credit: 0 });
    expect(attempts[0]!.categories).toContain('gender');
  });

  it('accepts ss for the sharp s with a note, and still asks for the standard spelling', async () => {
    const user = userEvent.setup();
    const exercise = typeIt('t-sharp', bi('Spelling', 'Правопис'), [
      {
        id: 't-sharp-s1',
        prompt: bi('My name is Theo.', 'Казвам се Тео.'),
        answer: 'Ich heiße Theo.',
        hints: [],
      },
    ]);
    mount(<ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.type(field(), 'Ich heisse Theo.{Enter}');
    expect(await screen.findByText('Meaning is correct.')).toBeInTheDocument();
    expect(screen.getByText(/Standard spelling: Ich heiße Theo\./)).toBeInTheDocument();
    expect(screen.getByText('Now type the correct German')).toBeInTheDocument();
    expect(attempts[0]!.credit).toBeGreaterThan(0);
    expect(attempts[0]!.credit).toBeLessThan(1);
  });

  it('gives feedback in Bulgarian on the Bulgarian path', async () => {
    const user = userEvent.setup();
    mount(
      <ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />,
      'bg',
    );

    // The prompt is the authored Bulgarian one, in Cyrillic and in quotes.
    expect(screen.getByText(/Аз съм от България/)).toBeInTheDocument();

    await user.type(field(), 'Ich komme von Bulgarien.{Enter}');
    expect(await screen.findByText('Не съвсем.')).toBeInTheDocument();
    expect(screen.getByText(/немският използва/)).toBeInTheDocument();
  });

  it('reveals hints one at a time and never starts with the answer showing', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    expect(screen.queryByText('Four words.')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hint 1 of 2' }));
    expect(screen.getByText('Four words.')).toBeInTheDocument();
    expect(screen.queryByText('Ich komme ...')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hint 2 of 2' }));
    expect(screen.getByText('Ich komme ...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No more hints' })).toBeDisabled();
  });

  /*
   * Showing the answer used to type it in as well, so one press of Enter
   * passed the step without a German letter produced. The answer is shown now
   * and the typing stays the learner's.
   */
  it('shows the answer but leaves the typing to the learner', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    expect(screen.getByText('Ich komme aus Bulgarien.')).toBeInTheDocument();
    expect(field()).toHaveValue('');

    // Enter on an empty box passes nothing.
    await user.keyboard('{Enter}');
    expect(attempts).toHaveLength(0);
  });

  it('records zero credit when the answer was revealed, even once typed', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Show the answer' }));
    await user.type(field(), 'Ich komme aus Bulgarien.');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(attempts).toHaveLength(1));
    expect(attempts[0]).toMatchObject({ revealed: true, credit: 0, given: 'Ich komme aus Bulgarien.' });
  });

  it('hides hints entirely in a mastery check', () => {
    const lesson = lessonById('pre-a1-u2-l4')!;
    mount(
      <ExercisePlayer
        exercises={lesson.mastery.exercises}
        context="mastery"
        level="pre-a1"
        allowHints={false}
        onFinish={() => {}}
      />,
    );
    expect(screen.queryByRole('button', { name: /Hint/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Show the answer' })).not.toBeInTheDocument();
  });

  it('reports the round summary when the last step is finished', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={onFinish} />);

    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    await user.keyboard('{Enter}');
    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish).toHaveBeenCalledWith({ total: 2, firstTryCorrect: 2, accuracy: 1 });
  });
});

/*
 * A forgotten full stop is "a small thing" everywhere else in the app, but in
 * a final check it counted as a wrong answer, and with three questions that
 * was the whole check failed.
 */
describe('a small slip in a final check', () => {
  it('counts an answer without its full stop as right', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    mount(<ExercisePlayer exercises={[originExercise]} context="mastery" allowHints={false} level="pre-a1" onFinish={onFinish} />);

    await user.type(field(), 'Ich komme aus Bulgarien{Enter}');
    await user.keyboard('{Enter}');
    await user.type(field(), 'Ich wohne in Hamburg{Enter}');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish).toHaveBeenCalledWith({ total: 2, firstTryCorrect: 2, accuracy: 1 });
  });
});

/*
 * The player counted an answer without its full stop as right, but the server
 * could not tell that note from one asking for a retype (ae for ä), because
 * the attempt did not say which it was. It counted both as wrong, so the
 * lesson's first-try figure fell and a "Quick redo" followed for answers the
 * learner had got right.
 */
describe('what the server is told about a note', () => {
  it('says a forgotten full stop asks for no retype', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), 'Ich komme aus Bulgarien{Enter}');
    await waitFor(() => expect(attempts).toHaveLength(1));
    expect(attempts[0]).toMatchObject({ verdict: 'accepted-with-note', requireRetype: false });
  });

  it('says a spelled-out umlaut does', async () => {
    const user = userEvent.setup();
    const bye = typeIt('t-bye', bi('Bye', 'Чао'), [
      { id: 't-bye-s1', prompt: bi('bye', 'чао'), answer: 'Tschüss', hints: [] },
    ]);
    mount(<ExercisePlayer exercises={[bye]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), 'Tschuess{Enter}');
    await waitFor(() => expect(attempts).toHaveLength(1));
    expect(attempts[0]).toMatchObject({ requireRetype: true });
  });
});

describe('the keyboard on a phone', () => {
  it('capitalises the first letter of a sentence answer', () => {
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    expect(field().getAttribute('autocapitalize')).toBe('sentences');
  });

  // A disabled field drops focus, and on an iPhone that shuts the keyboard:
  // every question needed another tap on the field before typing.
  it('keeps the field focusable while an answer is judged, and focuses it in the Continue tap', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    const continueButton = await screen.findByRole('button', { name: tr('exerciseContinue', 'en') });
    expect(field()).not.toBeDisabled();
    expect(field()).toHaveAttribute('readonly');
    await user.click(continueButton);
    expect(document.activeElement).toBe(field());
    expect(field()).not.toHaveAttribute('readonly');
  });

  it('leaves a single word alone, so "das" is not turned into "Das"', () => {
    const single = typeIt('t-word', bi('Word', 'Дума'), [
      { id: 't-word-s1', prompt: bi('the (neuter)', 'членът (среден род)'), answer: 'das', shape: 'word' },
    ]);
    mount(<ExercisePlayer exercises={[single]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    expect(field().getAttribute('autocapitalize')).toBe('off');
  });
});

describe('German special characters', () => {
  it('inserts a special letter at the caret, not at the end', async () => {
    const user = userEvent.setup();
    const exercise = typeIt('t-chars', bi('Chars', 'Букви'), [
      { id: 't-chars-s1', prompt: bi('bye', 'чао'), answer: 'Tschüss', hints: [] },
    ]);
    mount(<ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    const input = field() as HTMLInputElement;
    await user.type(input, 'Tschss');
    // Put the caret between "Tsch" and "ss".
    input.setSelectionRange(4, 4);
    await user.click(screen.getByRole('button', { name: /Insert a German letter: ü/ }));

    await waitFor(() => expect(input).toHaveValue('Tschüss'));
  });

  it('offers all four special letters', () => {
    const exercise = typeIt('t-chars2', bi('Chars', 'Букви'), [
      { id: 't-chars2-s1', prompt: bi('bye', 'чао'), answer: 'Tschüss', hints: [] },
    ]);
    mount(<ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    for (const character of ['ä', 'ö', 'ü', 'ß']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`Insert a German letter: ${character}`) }),
      ).toBeInTheDocument();
    }
  });

  it('inserts a special letter from the keyboard with Alt', async () => {
    const user = userEvent.setup();
    const exercise = typeIt('t-chars3', bi('Chars', 'Букви'), [
      { id: 't-chars3-s1', prompt: bi('big', 'голям'), answer: 'groß', hints: [] },
    ]);
    mount(<ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.type(field(), 'gro');
    await user.keyboard('{Alt>}s{/Alt}');
    await waitFor(() => expect(field()).toHaveValue('groß'));
  });
});

describe('robustness of the input', () => {
  it('does not treat an empty submission as a mistake', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);

    await user.keyboard('{Enter}');
    expect(await screen.findByText('Have a go first.')).toBeInTheDocument();
    // Nothing recorded, and the learner is still on the same task.
    expect(attempts).toHaveLength(0);
    expect(field()).toHaveFocus();
  });

  it('survives repeated Enter on an empty field', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.keyboard('{Enter}{Enter}{Enter}');
    expect(attempts).toHaveLength(0);
    expect(screen.getByText('Have a go first.')).toBeInTheDocument();
  });

  it('ignores leading and trailing whitespace', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), '   Ich komme aus Bulgarien.   {Enter}');
    expect(await screen.findByText('Correct.')).toBeInTheDocument();
  });

  it('handles a very long answer without breaking', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), `${'Ich komme aus Bulgarien '.repeat(12)}{Enter}`);
    expect(await screen.findByText('Not quite.')).toBeInTheDocument();
    expect(attempts[0]!.given.length).toBeLessThanOrEqual(500);
  });
});

/**
 * The verdict has to be on screen to be read.
 *
 * On a phone the feedback often opens below the fold: the answer is judged,
 * the explanation is written, and nothing appears to happen. The player
 * scrolls it into view — and has to survive a browser that cannot, which jsdom
 * is, and which took the whole player down with it the first time.
 */
describe('the verdict is brought into view', () => {
  it('scrolls the feedback into view when an answer is judged', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    // jsdom does not implement it at all, so this adds it for the test.
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: scrollIntoView,
    });
    try {
      mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
      expect(scrollIntoView).not.toHaveBeenCalled();
      await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
      expect(await screen.findByText('Correct.')).toBeInTheDocument();
      expect(scrollIntoView).toHaveBeenCalled();
      // `nearest` so a verdict already on screen does not jump under the reader.
      expect(scrollIntoView.mock.calls.at(-1)?.[0]).toMatchObject({ block: 'nearest' });
    } finally {
      delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    }
  });

  it('judges the answer anyway in a browser that cannot scroll', async () => {
    const user = userEvent.setup();
    // This is jsdom's own state: no scrollIntoView on Element at all.
    expect('scrollIntoView' in Element.prototype).toBe(false);
    mount(<ExercisePlayer exercises={[originExercise]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    expect(await screen.findByText('Correct.')).toBeInTheDocument();
  });
});

/**
 * The support ladder gives a struggling learner a word bank built from the
 * answer, which is real help on a sentence that has one right answer.
 *
 * Open writing has no single right answer — the task says so on screen, and it
 * is checked for the words it must contain rather than against a model. Laying
 * the model answer's words out as chips would quietly replace "write what you
 * want to say" with "unscramble what we had in mind".
 */
describe('the word bank on an open-writing task', () => {
  // Six wrong first attempts: the ladder costs two mistakes per rung, and the
  // word bank is three rungs below where a learner starts.
  const ROUNDS = 6;
  const struggle = typeIt(
    'wb-warmup',
    { en: 'Warm up', bg: 'Загряване' },
    Array.from({ length: ROUNDS + 1 }, () => ({
      prompt: { en: 'I come from Bulgaria.', bg: 'Аз съм от България.' },
      answer: 'Ich komme aus Bulgarien.',
      hints: [],
    })),
  );

  const open = freeWriting('wb-open', { en: 'Write freely', bg: 'Пиши свободно' }, [
    {
      prompt: { en: 'Write two sentences about where you live.', bg: 'Напиши две изречения къде живееш.' },
      answer: 'Ich wohne in Hamburg und die Wohnung ist sehr hell.',
      requiredTokens: ['wohne'],
      shape: 'sentence',
      hints: [],
    },
  ]);

  /** Answer wrong twice, which is what drops the ladder one rung. */
  async function struggleThrough(user: ReturnType<typeof userEvent.setup>) {
    for (let i = 0; i < ROUNDS; i += 1) {
      await user.type(field(), 'völlig falsch{Enter}');
      // The retype gate: the player will not move on until the correct
      // sentence has been typed out.
      await waitFor(() =>
        expect(document.querySelector('.feedback__retype-target')).not.toBeNull(),
      );
      await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
      await waitFor(() =>
        expect(screen.getByRole('button', { name: tr('exerciseContinue', 'en') })).toBeEnabled(),
      );
      await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));
    }
  }

  it('offers one on a normal sentence once the learner is struggling', async () => {
    const user = userEvent.setup();
    mount(<ExercisePlayer exercises={[struggle]} context="lesson" level="pre-a1" onFinish={() => {}} />);
    await struggleThrough(user);
    // Now well down the ladder: the bank is the help it exists to be.
    await waitFor(() => expect(screen.getByText(tr('exerciseWordBank', 'en'))).toBeInTheDocument());
  });

  it('never builds one out of the answer to an open-writing task', async () => {
    const user = userEvent.setup();
    mount(
      <ExercisePlayer exercises={[struggle, open]} context="lesson" level="pre-a1" onFinish={() => {}} />,
    );
    await struggleThrough(user);
    // Clear the last warm-up step so the open-writing task comes up, at the
    // same lowered support level that produced a bank a moment ago.
    await user.type(field(), 'Ich komme aus Bulgarien.{Enter}');
    await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));

    expect(await screen.findByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByText(tr('exerciseWordBank', 'en'))).not.toBeInTheDocument();
    // And specifically none of the model answer's words as chips.
    expect(screen.queryByRole('button', { name: 'Hamburg' })).not.toBeInTheDocument();
  });
});

describe('dictation has a replay budget', () => {
  /*
   * Unlimited replay turns dictation into transcription with a scrub bar: you
   * stop listening and start sampling the audio until the words resolve. The
   * budget makes it a listening task again — and must never make it a dead
   * end, which is the failure this app has now shipped twice.
   */
  function countingTts() {
    const spoken: string[] = [];
    const provider: TtsProvider = {
      id: 'test',
      available: true,
      describe: () => 'test',
      speak: (text, options) => {
        spoken.push(text);
        options?.onEnd?.();
      },
      cancel: () => undefined,
    };
    return { spoken, provider };
  }

  function mountWithTts(node: ReactElement, provider: TtsProvider) {
    return render(
      <AppStateContext.Provider value={{ ...stubState('en'), tts: provider }}>
        {node}
      </AppStateContext.Provider>,
    );
  }

  const heard = dictation('dict', bi('Listen and type', 'Слушай и напиши'), [
    { id: 'dict-1', prompt: null, answer: 'Ich wohne in Hamburg.' },
    { id: 'dict-2', prompt: null, answer: 'Ich komme aus Bulgarien.' },
  ]);

  it('speaks once on its own, then spends the budget and stops', async () => {
    const user = userEvent.setup();
    const { spoken, provider } = countingTts();
    mountWithTts(
      <ExercisePlayer exercises={[heard]} context="lesson" level="a1" onFinish={() => {}} />,
      provider,
    );

    // The automatic first play is the question being asked; it is not a replay.
    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(screen.getByText(tr('exerciseReplaysLeft', 'en', { n: 2 }))).toBeInTheDocument();

    const play = () => screen.getAllByRole('button', { name: /Play|Slower/ })[0]!;
    await user.click(play());
    expect(screen.getByText(tr('exerciseReplaysLeftOne', 'en', { n: 1 }))).toBeInTheDocument();
    await user.click(play());
    expect(screen.getByText(tr('exerciseReplaysGone', 'en'))).toBeInTheDocument();
    expect(spoken).toHaveLength(3);

    // Spent means spent, for the slow button too — a budget you can dodge by
    // always pressing the snail is not a budget.
    for (const button of screen.getAllByRole('button', { name: /Play|Slower/ })) {
      expect(button).toBeDisabled();
    }
    await user.click(play()).catch(() => {});
    expect(spoken).toHaveLength(3);
  });

  /*
   * Someone in their first week has never heard most of these words; two
   * replays is a budget for a learner who knows what to listen for.
   */
  it('gives a beginner twice the replays', async () => {
    const { spoken, provider } = countingTts();
    mountWithTts(
      <ExercisePlayer exercises={[heard]} context="lesson" level="pre-a1" onFinish={() => {}} />,
      provider,
    );
    await waitFor(() => expect(spoken).toHaveLength(1));
    expect(screen.getByText(tr('exerciseReplaysLeft', 'en', { n: 4 }))).toBeInTheDocument();
  });

  it('is never a dead end: the answer still goes through with the budget spent', async () => {
    const user = userEvent.setup();
    const { provider } = countingTts();
    const finished = vi.fn();
    mountWithTts(
      <ExercisePlayer exercises={[heard]} context="lesson" level="a1" onFinish={finished} />,
      provider,
    );

    const play = () => screen.getAllByRole('button', { name: /Play|Slower/ })[0]!;
    await user.click(play());
    await user.click(play());
    expect(screen.getByText(tr('exerciseReplaysGone', 'en'))).toBeInTheDocument();

    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: tr('exerciseContinue', 'en') })).toBeInTheDocument(),
    );
  });

  it('gives the next line its own budget', async () => {
    const user = userEvent.setup();
    const { provider } = countingTts();
    mountWithTts(
      <ExercisePlayer exercises={[heard]} context="lesson" level="a1" onFinish={() => {}} />,
      provider,
    );

    const play = () => screen.getAllByRole('button', { name: /Play|Slower/ })[0]!;
    await user.click(play());
    await user.click(play());
    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    await user.click(await screen.findByRole('button', { name: tr('exerciseContinue', 'en') }));

    await waitFor(() =>
      expect(screen.getByText(tr('exerciseReplaysLeft', 'en', { n: 2 }))).toBeInTheDocument(),
    );
  });

  it('does not ration a first hearing', async () => {
    /*
     * `listenChoose` hides its text too, but the model calls it first
     * listening exposure and means it: the learner is meeting the sound for
     * the first time and choosing between options they can see. The browser
     * run caught this — the budget was counting down on one of these before
     * the learner had ever heard the word.
     */
    const { provider } = countingTts();
    const firstHearing = exercise({
      id: 'listen',
      kind: 'listenChoose',
      objective: bi('Which word?', 'Коя дума?'),
      steps: [
        {
          id: 'listen-1',
          prompt: null,
          answer: 'die Tochter',
          audio: { text: 'die Tochter', hideText: true },
          choices: [
            { id: 'a', de: 'die Tochter' },
            { id: 'b', de: 'der Sohn' },
          ],
          correct: 'a',
        },
      ],
    });
    mountWithTts(
      <ExercisePlayer exercises={[firstHearing]} context="lesson" level="pre-a1" onFinish={() => {}} />,
      provider,
    );

    expect(screen.queryByText(tr('exerciseReplaysGone', 'en'))).not.toBeInTheDocument();
    expect(screen.queryByText(tr('exerciseReplaysLeft', 'en', { n: 2 }))).not.toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: /Play|Slower/ })) {
      expect(button).not.toBeDisabled();
    }
  });

  it('does not budget audio that sits beside visible German', async () => {
    // Pronunciation help on a prompt you can already read is not a test, so it
    // stays unlimited.
    const { provider } = countingTts();
    const spoken = typeIt('spoken', bi('Say it', 'Кажи го'), [
      { id: 'spoken-1', prompt: bi('I live in Hamburg.', 'Живея в Хамбург.'), answer: 'Ich wohne in Hamburg.', audio: 'Ich wohne in Hamburg.' },
    ]);
    mountWithTts(
      <ExercisePlayer exercises={[spoken]} context="lesson" level="pre-a1" onFinish={() => {}} />,
      provider,
    );
    expect(screen.queryByText(tr('exerciseReplaysGone', 'en'))).not.toBeInTheDocument();
    expect(screen.queryByText(tr('exerciseReplaysLeft', 'en', { n: 2 }))).not.toBeInTheDocument();
    for (const button of screen.getAllByRole('button', { name: /Play|Slower/ })) {
      expect(button).not.toBeDisabled();
    }
  });
});
