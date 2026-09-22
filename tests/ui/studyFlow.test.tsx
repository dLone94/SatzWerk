// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun, lessonById } from '../../src/content/index.ts';
import { tr, type UiKey } from '../../src/i18n.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import type { LessonProgress } from '../../src/core/progress/lesson.ts';
import { LessonPage } from '../../src/ui/pages/LessonPage.tsx';
import { MorePage, MORE_ROUTES } from '../../src/ui/pages/MorePage.tsx';
import { CoachPage } from '../../src/ui/pages/CoachPage.tsx';
import { ScenarioPage } from '../../src/ui/pages/ScenarioPage.tsx';
import { CheckpointPage } from '../../src/ui/pages/CheckpointPage.tsx';
import { WordPage } from '../../src/ui/pages/WordPage.tsx';
import { CoursePage } from '../../src/ui/pages/CoursePage.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { CURRICULUM } from '../../src/content/index.ts';
import { todayHere } from '../../src/core/progress/days.ts';
import { ExercisePlayer, type PlayerSummary } from '../../src/ui/components/ExercisePlayer.tsx';

// The scenario test only needs the end screen, so the conversation itself
// finishes at once with whatever result the test sets.
const scenarioResult: { next: PlayerSummary } = { next: { total: 4, firstTryCorrect: 4, accuracy: 1 } };
vi.mock('../../src/ui/components/ScenarioPlayer.tsx', () => ({
  ScenarioPlayer: ({ onFinish }: { onFinish: (summary: PlayerSummary) => void }) => (
    <button type="button" onClick={() => onFinish(scenarioResult.next)}>
      finish
    </button>
  ),
}));

/**
 * Two ways the app made studying harder than it had to be, found by using it
 * on a phone-sized screen rather than by reading it.
 */

const LESSON = 'pre-a1-u1-l2';

function progress(overrides: Partial<LessonProgress> = {}): LessonProgress {
  return {
    lessonId: LESSON,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 1, bestAccuracy: 0.4, passed: false },
    recoveryRounds: 0,
    ...overrides,
  };
}

function state(overrides: Partial<AppStateValue> = {}): AppStateValue {
  const lang = 'en';
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
    recordMastery: async () => progress({ mastery: { attempts: 2, bestAccuracy: 0.4, passed: false } }),
    recordRecovery: async () => undefined,
    completeLesson: async () => undefined,
    ensureReviewItems: async () => undefined,
    gradeReview: async () => undefined,
    resolveMistake: async () => undefined,
    toggleFavorite: async () => undefined,
    recordCheckpoint: async () => undefined,
    recordScenarioRun: async () => undefined,
    resetAll: async () => undefined,
    lessonProgress: () => progress(),
    ...overrides,
  };
}

/** Answer every step of whatever player is on screen wrongly, then correct it. */
async function failEveryStep(user: ReturnType<typeof userEvent.setup>) {
  for (let i = 0; i < 40; i++) {
    if (screen.queryByRole('button', { name: tr('lessonMasteryRetry', 'en') })) return;
    const cont = screen.queryByRole('button', { name: tr('exerciseContinue', 'en') });
    if (cont) {
      await user.click(cont);
      continue;
    }
    const box = screen.queryByRole('textbox');
    if (!box) return;
    const retyping = document.querySelector('.feedback__retype-label');
    const stepId = document.querySelector('[data-step-id]')?.getAttribute('data-step-id') ?? '';
    const step = lessonById(LESSON)!.mastery.exercises.flatMap((e) => e.steps).find((s) => s.id === stepId);
    await user.clear(box);
    await user.type(box, retyping ? step!.answer.accepted[0]! : 'völlig falsch');
    await user.keyboard('{Enter}');
  }
}

describe('a failed mastery check', () => {
  const mount = (value: AppStateValue) =>
    render(
      <AppStateContext.Provider value={value}>
        <MemoryRouter initialEntries={[`/lesson/${LESSON}`]}>
          <Routes>
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>
      </AppStateContext.Provider>,
    );

  /*
   * The only way on used to be "Practise again", which went back through every
   * teaching section and all the exercises to reach a five-question check. The
   * overview offered a straight retry; the screen that needed it did not.
   */
  it('can be tried again straight away', async () => {
    const user = userEvent.setup();
    const recordMastery = vi.fn(async () => progress({ mastery: { attempts: 2, bestAccuracy: 0, passed: false } }));
    mount(state({ recordMastery }));

    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await failEveryStep(user);

    const retry = await screen.findByRole('button', { name: tr('lessonMasteryRetry', 'en') });
    expect(recordMastery).toHaveBeenCalledTimes(1);
    // Going over the material is still offered, and still the suggestion.
    expect(screen.getByRole('button', { name: tr('lessonReplay', 'en') })).toBeInTheDocument();

    await user.click(retry);
    // Straight into the check: a question, not a teaching section.
    await waitFor(() => expect(document.querySelector('[data-step-id]')).not.toBeNull());
    const first = document.querySelector('[data-step-id]')!.getAttribute('data-step-id')!;
    const masterySteps = lessonById(LESSON)!.mastery.exercises.flatMap((e) => e.steps.map((s) => s.id));
    expect(masterySteps).toContain(first);
  });

  it('says the score once, not twice', async () => {
    const user = userEvent.setup();
    mount(state());
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await failEveryStep(user);
    await screen.findByRole('button', { name: tr('lessonMasteryRetry', 'en') });

    const total = lessonById(LESSON)!.mastery.exercises.reduce((n, e) => n + e.steps.length, 0);
    const line = tr('exerciseScore', 'en', { correct: 0, total });
    expect(screen.getAllByText(line)).toHaveLength(1);
  });
});

describe('every page can be reached on a phone', () => {
  /*
   * Nine destinations shared one tab bar that scrolled sideways with nothing
   * to say it did. On every iPhone size measured, the last four — Settings
   * among them, and with it the switch for who is studying — were off the
   * screen. A phone now gets four tabs and More.
   *
   * Derived from the router rather than listed here, so a page added later is
   * checked the day it is added: every top-level route is either a tab a phone
   * shows, or one of the entries on More.
   */
  const PHONE_TABS = ['/', '/session', '/course', '/review', '/more'];
  const app = readFileSync('src/ui/App.tsx', 'utf8');
  const routes = [...app.matchAll(/<Route path="([^"]+)"/g)]
    .map((match) => match[1]!)
    // Pages reached from inside another page, not from the bar.
    .filter((path) => !path.includes(':') && path !== '*' && path !== '/welcome' && path !== '/placement');

  it('finds the routes it is meant to check', () => {
    expect(routes.length).toBeGreaterThan(8);
  });

  it.each(routes)('%s is a phone tab or on More', (route) => {
    expect(PHONE_TABS.includes(route) || MORE_ROUTES.includes(route)).toBe(true);
  });

  it('marks every secondary tab so a phone hides it', () => {
    const secondary = [...app.matchAll(/<NavItem to="([^"]+)"[^>]*secondary/g)].map((m) => m[1]);
    const shown = [...app.matchAll(/<NavItem to="([^"]+)"/g)].map((m) => m[1]);
    for (const to of shown) {
      if (!PHONE_TABS.includes(to!)) expect(secondary, `${to} would crowd the phone bar`).toContain(to);
    }
  });

  it('lists each of them on More, with what it is for', () => {
    render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter>
          <MorePage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    for (const key of ['navVocabulary', 'navMistakes', 'navRealLife', 'navCoach', 'navSettings'] as UiKey[]) {
      expect(screen.getByRole('link', { name: new RegExp(tr(key, 'en')) })).toBeInTheDocument();
    }
  });
});

describe('feedback on a tapped choice', () => {
  /*
   * "You wrote: Guten Morgen", on an answer that was a tap on a card. Small,
   * and exactly the kind of thing that makes an app feel as if nobody used it.
   */
  it('says what was chosen, not what was written', async () => {
    const lesson = lessonById('pre-a1-u2-l1')!;
    const choiceExercise = lesson.exercises.find(
      (exercise) => exercise.kind === 'listenChoose' || exercise.kind === 'multipleChoice',
    )!;
    const step = choiceExercise.steps[0]!;
    const wrong = step.choices!.find((choice) => choice.id !== step.correctChoiceId)!;

    const user = userEvent.setup();
    render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter>
          <ExercisePlayer
            exercises={[{ ...choiceExercise, steps: [step] }]}
            context="lesson"
            level="pre-a1"
            onFinish={() => {}}
          />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );

    await user.click(screen.getByText(wrong.de));
    expect(await screen.findByText(tr('feedbackYourChoice', 'en'))).toBeInTheDocument();
    expect(screen.queryByText(tr('feedbackYourAnswer', 'en'))).not.toBeInTheDocument();
  });
});

describe('the tab bar never covers what it sits over', () => {
  /*
   * Measured in a phone-sized browser: after a wrong answer to a choice
   * question, Continue came to rest under the fixed tab bar, and a tap on its
   * middle landed on the bar — a tap on Course or Review, and a lesson left
   * half-way. jsdom has no layout to measure that with, so this guards the
   * rule that fixed it: on a phone, scrolling stops above the bar.
   */
  const css = readFileSync('src/styles.css', 'utf8');
  const phoneBlocks = [...css.matchAll(/@media \(max-width: 46rem\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]!);

  it('pads the scroll area by the bar on a phone', () => {
    expect(phoneBlocks.some((block) => /html\s*\{[^}]*scroll-padding-bottom/.test(block))).toBe(true);
  });

  it('drops the Alt-key hint where the umlaut row stops wrapping', () => {
    // Measured: 397px of page on a 390px window with a mouse, on every answer.
    const nowrap = phoneBlocks.find((block) => /\.answer__chars\s*\{[^}]*flex-wrap:\s*nowrap/.test(block));
    expect(nowrap).toMatch(/\.answer__hintkeys\s*\{[^}]*display:\s*none/);
  });

  it('keeps the verdict itself clear of the bar when it is scrolled to', () => {
    expect(phoneBlocks.some((block) => /\.feedback\s*\{[^}]*scroll-margin-bottom/.test(block))).toBe(true);
  });
});

describe('the coach says what it can do, in words a learner reads', () => {
  /*
   * The card was titled "Planned, not built" and listed code identifiers
   * (speechToText, pronunciationScoring) with raw status strings. It called
   * speech recognition planned while the app already listens to you, called
   * conversation planned while the server says it is a deliberate no, and gave
   * the AI-backed writing review a grey "planned" badge.
   */
  const rows = () =>
    Object.fromEntries(
      screen.getAllByRole('listitem').map((item) => {
        const [label, badge] = [...item.querySelectorAll('span')].map((span) => span.textContent);
        return [label, badge];
      }),
    );

  function mountCoach(features: Record<string, string>, speech: boolean) {
    const recogniser = { available: speech, listen: async () => ({}), stop: () => {} };
    render(
      <AppStateContext.Provider value={state({ coach: { aiAvailable: true, provider: 'x', features }, recogniser })}>
        <MemoryRouter>
          <CoachPage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
  }

  it('shows no code identifiers', () => {
    mountCoach({ writingReview: 'rule-based', conversation: 'not-generated' }, true);
    expect(document.querySelector('code')).toBeNull();
    expect(screen.queryByText('speechToText')).not.toBeInTheDocument();
  });

  it('says speaking works where the browser can listen, and not where it cannot', () => {
    mountCoach({}, true);
    expect(rows()[tr('coachAbilitySpeaking', 'en')]).toBe(tr('coachCanYes', 'en'));
  });

  it('says speaking is missing from this browser rather than from the app', () => {
    mountCoach({}, false);
    expect(rows()[tr('coachAbilitySpeaking', 'en')]).toBe(tr('coachCanNotHere', 'en'));
  });

  it('marks deliberate refusals as refusals, not as a backlog', () => {
    mountCoach({ generatePractice: 'not-generated', conversation: 'not-generated' }, true);
    expect(rows()[tr('coachAbilityConversation', 'en')]).toBe(tr('coachCanNever', 'en'));
    expect(rows()[tr('coachAbilityPractice', 'en')]).toBe(tr('coachCanNever', 'en'));
    expect(rows()[tr('coachAbilityPronunciation', 'en')]).toBe(tr('coachCanNotYet', 'en'));
  });

  it('shows the AI-backed writing review as available', () => {
    mountCoach({ writingReview: 'rule-based+ai', explainMistake: 'ai' }, true);
    expect(rows()[tr('coachAbilityWriting', 'en')]).toBe(tr('coachCanYesAi', 'en'));
    expect(rows()[tr('coachAbilityExplain', 'en')]).toBe(tr('coachCanYes', 'en'));
  });
});

describe('the end of a scenario points somewhere', () => {
  /*
   * Driven in the browser: the only primary button after a scenario was "Play
   * it again", even after a clean run, so following the obvious button looped
   * the same conversation for ever.
   */
  async function finishWith(summary: PlayerSummary) {
    scenarioResult.next = summary;
    const user = userEvent.setup();
    render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter initialEntries={['/scenario/sc-bakery-pre-a1']}>
          <Routes>
            <Route path="/scenario/:scriptId" element={<ScenarioPage />} />
          </Routes>
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    await user.click(screen.getByRole('button', { name: tr('scenarioStart', 'en') }));
    await user.click(screen.getByRole('button', { name: 'finish' }));
  }

  const primary = () => document.querySelector('.section-nav .btn--primary')?.textContent;

  it('leads back out after a clean run', async () => {
    await finishWith({ total: 4, firstTryCorrect: 4, accuracy: 1 });
    expect(primary()).toBe(tr('scenarioBackToList', 'en'));
    expect(screen.getByRole('button', { name: tr('scenarioAgain', 'en') })).toBeInTheDocument();
  });

  it('offers another go first when something slipped', async () => {
    await finishWith({ total: 4, firstTryCorrect: 2, accuracy: 0.5 });
    expect(primary()).toBe(tr('scenarioAgain', 'en'));
  });
});

describe('a link to something that is not there says so', () => {
  /*
   * An old bookmark or reminder can point at a lesson id that no longer exists.
   * These pages said "Something went wrong", which reads like a crash.
   */
  const cases: [string, string, ReactElement, UiKey, string][] = [
    ['/lesson/:lessonId', '/lesson/nope', <LessonPage />, 'lessonMissing', '/course'],
    ['/checkpoint/:checkpointId', '/checkpoint/nope', <CheckpointPage />, 'checkpointMissing', '/course'],
    ['/vocabulary/:wordId', '/vocabulary/nope', <WordPage />, 'wordMissing', '/vocabulary'],
  ];

  it.each(cases)('%s', (path, url, element, key, back) => {
    render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={path} element={element} />
          </Routes>
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    expect(screen.getByText(tr(key, 'en'))).toBeInTheDocument();
    expect(screen.queryByText(tr('errorTitle', 'en'))).not.toBeInTheDocument();
    expect(screen.getByRole('link').getAttribute('href')).toBe(back);
  });
});

/** Answer every step of whatever player is on screen correctly. */
async function passEveryStep(user: ReturnType<typeof userEvent.setup>, lessonId: string) {
  const steps = lessonById(lessonId)!.mastery.exercises.flatMap((e) => e.steps);
  for (let i = 0; i < 60; i++) {
    if (document.querySelector('.done-hero')) return;
    const cont = screen.queryByRole('button', { name: tr('exerciseContinue', 'en') });
    if (cont) {
      await user.click(cont);
      continue;
    }
    const stepId = document.querySelector('[data-step-id]')?.getAttribute('data-step-id');
    if (!stepId) return;
    const step = steps.find((candidate) => candidate.id === stepId)!;
    const box = screen.queryByRole('textbox');
    if (box) {
      await user.clear(box);
      await user.type(box, step.answer.accepted[0]!);
      await user.keyboard('{Enter}');
    } else {
      const right = step.choices!.find((choice) => choice.id === step.correctChoiceId)!;
      await user.click(screen.getByText(right.de));
    }
  }
}

describe('the redesign', () => {
  it('celebrates a passed lesson and points at the next step', async () => {
    const user = userEvent.setup();
    const recordMastery = vi.fn(async () => progress({ mastery: { attempts: 1, bestAccuracy: 1, passed: true } }));
    render(
      <AppStateContext.Provider value={state({ recordMastery })}>
        <MemoryRouter initialEntries={[`/lesson/${LESSON}`]}>
          <Routes>
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
          </Routes>
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    await user.click(screen.getByRole('button', { name: tr('lessonMastery', 'en') }));
    await passEveryStep(user, LESSON);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(tr('lessonDoneTitle', 'en'));
    expect(screen.getByText('Gut gemacht!')).toBeInTheDocument();
    const next = screen.getByText(tr('lessonUpNext', 'en')).closest('a')!;
    expect(next.getAttribute('href')).toMatch(/^\/(lesson|review|checkpoint|mistakes)/);
    // Never straight back into the lesson that was just finished.
    expect(next.getAttribute('href')).not.toBe(`/lesson/${LESSON}`);
  });

  it('clears the tab bar away while a question is on screen, and only then', () => {
    const lesson = lessonById(LESSON)!;
    const view = render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter>
          <ExercisePlayer exercises={lesson.mastery.exercises} context="lesson" level="pre-a1" onFinish={() => {}} />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    expect(document.documentElement.classList.contains('is-playing')).toBe(true);
    view.unmount();
    expect(document.documentElement.classList.contains('is-playing')).toBe(false);
  });

  it('shows the course one level at a time, opening where you are', async () => {
    const user = userEvent.setup();
    render(
      <AppStateContext.Provider value={state()}>
        <MemoryRouter>
          <CoursePage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    const [preA1, a1] = [CURRICULUM[0]!, CURRICULUM[1]!];
    // Nothing done yet, so the first level is open and the next is not.
    expect(screen.getByText(preA1.units[0]!.title.en)).toBeInTheDocument();
    expect(screen.queryByText(a1.units[0]!.title.en)).toBeNull();
    await user.click(screen.getByRole('button', { name: a1.label }));
    expect(screen.getByText(a1.units[0]!.title.en)).toBeInTheDocument();
    expect(screen.queryByText(preA1.units[0]!.title.en)).toBeNull();
  });

  it('counts today\'s minutes against the daily target', () => {
    render(
      <AppStateContext.Provider
        value={state({ studyDays: [{ day: todayHere(), secondsActive: 600, answers: 12, correct: 10 }] })}
      >
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    expect(document.querySelector('.goal-ring__num')).toHaveTextContent('10');
    expect(screen.getByText(tr('todayGoalLeft', 'en', { n: 10 }))).toBeInTheDocument();
  });

  it('ships its fonts with the app, Cyrillic included', () => {
    // A font fetched from a font service is a font that is missing offline, and
    // the whole interface can be Bulgarian.
    const css = readFileSync('src/fonts.css', 'utf8');
    expect(css).not.toMatch(/https?:/);
    for (const family of ['Onest', 'Geologica']) {
      const faces = [...css.matchAll(/@font-face \{[^}]*\}/g)].map((m) => m[0]).filter((f) => f.includes(`'${family}'`));
      expect(faces.some((face) => face.includes('U+0400-045F')), family).toBe(true);
    }
  });
});
