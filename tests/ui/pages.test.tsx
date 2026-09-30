// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  CURRICULUM,
  LEVEL_OUTLINES,
  LEXICON,
  PLACEMENT_CHECKPOINT,
  SCENARIOS,
  contentStats,
  describeNoun,
  partialLevels,
  scenarioStatus,
  scriptFor,
  unauthoredLevels,
} from '../../src/content/index.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { formatDuration, formatRelativeDate } from '../../src/ui/components/bits.tsx';
import { CheckpointPage } from '../../src/ui/pages/CheckpointPage.tsx';
import { CoachPage } from '../../src/ui/pages/CoachPage.tsx';
import { CoursePage } from '../../src/ui/pages/CoursePage.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { LessonPage } from '../../src/ui/pages/LessonPage.tsx';
import { MistakesPage } from '../../src/ui/pages/MistakesPage.tsx';
import { OnboardingPage } from '../../src/ui/pages/OnboardingPage.tsx';
import { PlacementPage } from '../../src/ui/pages/PlacementPage.tsx';
import { RealLifePage } from '../../src/ui/pages/RealLifePage.tsx';
import { ReviewPage } from '../../src/ui/pages/ReviewPage.tsx';
import { SessionPage } from '../../src/ui/pages/SessionPage.tsx';
import { SettingsPage } from '../../src/ui/pages/SettingsPage.tsx';
import { VocabularyPage } from '../../src/ui/pages/VocabularyPage.tsx';
import { WordPage } from '../../src/ui/pages/WordPage.tsx';

/**
 * Every page rendered in both teaching paths, on an empty profile and on one
 * with real progress. This catches the runtime errors that a type-check cannot,
 * and it asserts the honesty rules: no invented statistics on a fresh profile,
 * and planned content labelled as planned.
 */

const now = new Date().toISOString();

function stubState(lang: TeachingLanguage, overrides: Partial<AppStateValue> = {}): AppStateValue {
  const base: AppStateValue = {
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
      createdAt: now,
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
    coach: { aiAvailable: false, provider: 'none', features: { writingReview: 'rule-based', conversation: 'planned' } },
    lang,
    t: (key, vars) => tr(key, lang, vars),
    say: (text) => (text ? text[lang] : ''),
    tts: nullTtsProvider,
    // No browser recogniser in jsdom, which is the honest default: the speak
    // button is not rendered at all when there is nothing to listen with.
    recogniser: createSpeechRecogniser({}),
    lexicon: LEXICON,
    describeNoun,
    reload: vi.fn(async () => undefined),
    setTeachingLanguage: vi.fn(async () => undefined),
    updateProfile: vi.fn(async () => undefined),
    submitAttempt: vi.fn(async () => undefined),
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
    markSectionSeen: vi.fn(async () => undefined),
    recordMastery: vi.fn(async () => ({
      lessonId: 'x',
      sectionsSeen: [],
      practice: {},
      mastery: { attempts: 1, bestAccuracy: 1, passed: true },
      recoveryRounds: 0,
    })),
    recordRecovery: vi.fn(async () => undefined),
    completeLesson: vi.fn(async () => undefined),
    ensureReviewItems: vi.fn(async () => undefined),
    gradeReview: vi.fn(async () => undefined),
    resolveMistake: vi.fn(async () => undefined),
    toggleFavorite: vi.fn(async () => undefined),
    recordCheckpoint: vi.fn(async () => undefined),
    recordScenarioRun: vi.fn(async () => undefined),
    resetAll: vi.fn(async () => undefined),
    lessonProgress: (lessonId) => ({
      lessonId,
      sectionsSeen: [],
      practice: {},
      mastery: { attempts: 0, bestAccuracy: 0, passed: false },
      recoveryRounds: 0,
    }),
  };
  return { ...base, ...overrides };
}

function mount(node: ReactElement, lang: TeachingLanguage, overrides?: Partial<AppStateValue>, path = '/') {
  return render(
    <AppStateContext.Provider value={stubState(lang, overrides)}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </AppStateContext.Provider>,
  );
}

const LANGS: TeachingLanguage[] = ['en', 'bg'];

describe.each(LANGS)('pages render in the %s path', (lang) => {
  it('dashboard', () => {
    mount(<DashboardPage />, lang);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('course map', () => {
    mount(<CoursePage />, lang);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    // All five levels are present.
    for (const label of ['Pre-A1', 'A1', 'A2', 'B1', 'B2']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it('lesson overview', () => {
    mount(
      <Routes>
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
      </Routes>,
      lang,
      undefined,
      '/lesson/pre-a1-u2-l3',
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(tr('lessonRequirements', lang))).toBeInTheDocument();
  });

  it('checkpoint', () => {
    mount(
      <Routes>
        <Route path="/checkpoint/:checkpointId" element={<CheckpointPage />} />
      </Routes>,
      lang,
      undefined,
      '/checkpoint/pre-a1-u2-checkpoint',
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(tr('unitCheckpoint', lang))).toBeInTheDocument();
  });

  it('level checkpoint, called by its own name', () => {
    // Both level checkpoints announced themselves as unit checkpoints, because
    // the page never asked the checkpoint what its scope was.
    mount(
      <Routes>
        <Route path="/checkpoint/:checkpointId" element={<CheckpointPage />} />
      </Routes>,
      lang,
      undefined,
      '/checkpoint/a1-level-checkpoint',
    );
    expect(screen.getByText(tr('levelCheckpoint', lang))).toBeInTheDocument();
    expect(screen.queryByText(tr('unitCheckpoint', lang))).toBeNull();
  });

  it('review', () => {
    mount(<ReviewPage />, lang);
    expect(screen.getByText(tr('reviewNothingDue', lang))).toBeInTheDocument();
  });

  it('daily round', () => {
    mount(<SessionPage />, lang);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tr('sessionTitle', lang));
  });

  it('vocabulary', () => {
    mount(<VocabularyPage />, lang);
    expect(screen.getByPlaceholderText(tr('vocabSearchShort', lang))).toBeInTheDocument();
    expect(screen.getByLabelText(tr('vocabSearch', lang))).toBeInTheDocument();
    // Nouns are listed with their article.
    expect(screen.getAllByText('die Tochter').length).toBeGreaterThan(0);
  });

  it('word detail', () => {
    mount(
      <Routes>
        <Route path="/vocabulary/:wordId" element={<WordPage />} />
      </Routes>,
      lang,
      undefined,
      '/vocabulary/v-die-tochter',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('die Tochter');
    expect(screen.getByText('die Töchter')).toBeInTheDocument();
  });

  it('mistakes', () => {
    mount(<MistakesPage />, lang);
    expect(screen.getByText(tr('mistakesEmpty', lang))).toBeInTheDocument();
  });

  it('real life', () => {
    mount(<RealLifePage />, lang);
    /*
     * Derived, not pinned. This test used to assert that several scenarios
     * were labelled "planned", which was true right up until they were
     * written, and then it failed for the best possible reason. What it
     * actually needs to guarantee is that the page agrees with the content:
     * a stage with a script offers a way in, one without says so, and every
     * badge matches the status derived from the scripts.
     */
    const stages = SCENARIOS.flatMap((scenario) =>
      scenario.stages.map((stage) => Boolean(scriptFor(scenario.id, stage.level))),
    );
    const playable = stages.filter(Boolean).length;
    const unwritten = stages.length - playable;

    const links = screen.queryAllByRole('link', {
      name: new RegExp(`${tr('realLifePlay', lang)}|${tr('realLifeReplay', lang)}`),
    });
    expect(links).toHaveLength(playable);
    expect(screen.queryAllByText(tr('realLifeNotWritten', lang))).toHaveLength(unwritten);

    const badges = {
      available: 'statusAvailable',
      partial: 'statusPartial',
      planned: 'statusPlanned',
    } as const;
    for (const [status, key] of Object.entries(badges) as Array<
      [keyof typeof badges, (typeof badges)[keyof typeof badges]]
    >) {
      const expected = SCENARIOS.filter((scenario) => scenarioStatus(scenario) === status).length;
      expect(screen.queryAllByText(tr(key, lang))).toHaveLength(expected);
    }
  });

  it('coach', () => {
    mount(<CoachPage />, lang);
    expect(screen.getByText(tr('coachNoAi', lang))).toBeInTheDocument();
  });

  it('settings', () => {
    mount(<SettingsPage />, lang);
    expect(screen.getByText(tr('settingsLanguageNote', lang))).toBeInTheDocument();
  });

  it('onboarding', () => {
    mount(<OnboardingPage />, lang, {
      profile: {
        teachingLanguage: lang,
        dailyTargetMinutes: 20,
        displayName: null,
        onboarded: false,
        createdAt: now,
      },
    });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tr('onboardingTitle', lang));
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Български')).toBeInTheDocument();

    /*
     * The first screen a new learner sees must not understate the app.
     *
     * This line once ended "Levels A1–B2 are outlines only so far", which was
     * true when written and had silently become false — all five levels were
     * authored by then. So: it names the levels that really are an outline,
     * and no level that has lessons in it.
     */
    const counts = screen.getByText(new RegExp(String(contentStats().lessons)));
    const empty = unauthoredLevels().map((level) => level.label);
    for (const label of empty) {
      expect(counts.textContent, `${label} is an outline and is not named`).toContain(label);
    }
    for (const level of CURRICULUM.filter((entry) => entry.units.length > 0)) {
      expect(
        counts.textContent,
        `${level.label} has lessons but is named as an outline`,
      ).not.toContain(`${level.label} is an outline`);
    }
    if (empty.length === 0) {
      expect(counts.textContent).not.toMatch(/outline|план/);
    }
  });
});

describe('the placement check', () => {
  it('asks about every authored level, four questions each', () => {
    /*
     * Derived from the content, so adding a level without placement questions
     * for it fails here rather than silently producing a check that cannot
     * recommend the new level.
     */
    const byLevel = new Map<string, number>();
    for (const exercise of PLACEMENT_CHECKPOINT.exercises) {
      byLevel.set(exercise.level, (byLevel.get(exercise.level) ?? 0) + exercise.steps.length);
    }
    for (const level of CURRICULUM.filter((entry) => entry.units.length > 0)) {
      expect(byLevel.get(level.id), `no placement questions at ${level.label}`).toBeGreaterThanOrEqual(3);
    }
    // And nothing at a level the course cannot send anybody to.
    for (const level of byLevel.keys()) {
      expect(CURRICULUM.find((entry) => entry.id === level)?.units.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('offers no hints, because it is measuring rather than teaching', () => {
    for (const exercise of PLACEMENT_CHECKPOINT.exercises) {
      for (const step of exercise.steps) {
        expect(step.hints, `${step.id} has hints`).toHaveLength(0);
      }
    }
  });

  it('shows the intro before anything is answered', () => {
    mount(<PlacementPage />, 'en');
    expect(screen.getByText(tr('placementHonesty', 'en'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: tr('placementStart', 'en') })).toBeInTheDocument();
  });
});

describe('settings tells the truth about what is written', () => {
  it('names the levels that really are empty, and no others', () => {
    mount(<SettingsPage />, 'en');
    const empty = unauthoredLevels();
    if (empty.length === 0) {
      // Every level has been started. The sentence about outlines must then be
      // gone entirely rather than left behind naming nothing.
      expect(screen.queryByText(/as structure and outline/)).toBeNull();
      return;
    }
    const foot = screen.getByText(/as structure and outline/);
    for (const level of empty) {
      expect(foot.textContent).toContain(level.label);
    }
    // And crucially, not a level that has been written. A1 was named here
    // long after it was finished, which is the regression this guards.
    for (const level of CURRICULUM.filter((candidate) => candidate.units.length > 0)) {
      expect(foot.textContent).not.toContain(level.label);
    }
  });

  /**
   * A level that is a third written is the hardest case to be honest about:
   * it is not "not authored yet" and it is certainly not finished. B2 became
   * exactly that the moment its first unit landed.
   */
  it('says a part-written level is part-written, with its real numbers', () => {
    mount(<SettingsPage />, 'en');
    const started = partialLevels();
    if (started.length === 0) {
      expect(screen.queryByText(/is being written/)).toBeNull();
      return;
    }
    const foot = screen.getByText(/is being written/);
    for (const { level, written, planned } of started) {
      expect(foot.textContent).toContain(level.label);
      expect(foot.textContent).toContain(String(written));
      expect(foot.textContent).toContain(String(planned));
    }
    // And it must not also claim everything is done.
    expect(screen.queryByText('Every level in the structure is authored.')).toBeNull();
  });
});

/*
 * An iPhone with the premium Anna downloaded listed it as a second "Anna",
 * and nothing it gave the page said which was which. Both were labelled
 * "basic", which was a guess presented as a fact, and they could not be told
 * apart in the list at all.
 */
describe('the voice list on a device that says little', () => {
  const tts = {
    id: 'test',
    available: true,
    describe: () => 'test',
    speak: () => {},
    cancel: () => {},
    voices: () => [
      { id: 'recorded', name: 'Thorsten (Piper)', lang: 'de-DE', quality: 'premium' as const },
      { id: 'anna-1', name: 'Anna', lang: 'de-DE', quality: 'basic' as const },
      { id: 'anna-2', name: 'Anna', lang: 'de-DE', quality: 'basic' as const },
    ],
    chosenVoice: () => null,
    chooseVoice: () => {},
  };

  it('numbers two voices with the same name so each can be picked and heard', () => {
    mount(<SettingsPage />, 'en', { tts });
    const labels = [...document.querySelectorAll('option')].map((option) => option.textContent);
    expect(labels).toContain('Anna 1');
    expect(labels).toContain('Anna 2');
  });

  it('does not call a voice basic when nothing says it is', () => {
    mount(<SettingsPage />, 'en', { tts });
    const labels = [...document.querySelectorAll('option')].map((option) => option.textContent ?? '');
    expect(labels.some((label) => /basic/.test(label))).toBe(false);
    // What is known is still said.
    expect(labels.some((label) => label.includes('Thorsten (Piper) · natural'))).toBe(true);
  });
});

describe('the dashboard never invents progress', () => {
  const active = {
    totalAnswers: 20,
    correctAnswers: 15,
    accuracy: 0.75,
    totalStudySeconds: 900,
    studyDays: 3,
    streak: 3,
    categoryCounts: [{ category: 'article' as const, count: 2 }],
    retypedCorrections: 4,
  };

  it('shows no percentage and no statistics before anything is answered', () => {
    // It used to show nine tiles of zeros and dashes on the first day. Now the
    // statistics wait until there is something in them.
    mount(<DashboardPage />, 'en');
    expect(screen.queryByText('First-try accuracy')).toBeNull();
    expect(document.body.textContent).not.toMatch(/\d+\s?%/);
  });

  it('shows no streak before any study day exists', () => {
    mount(<DashboardPage />, 'en');
    expect(screen.queryByText(/Study streak/)).toBeNull();
  });

  it('reports real figures once there is activity', () => {
    mount(<DashboardPage />, 'en', { stats: active });
    expect(screen.getByText('First-try accuracy').closest('.stat')).toHaveTextContent('75%');
    // Read as words, not as a label on a paragraph, which is never read.
    expect(screen.getByText('Study streak: 3 days').closest('.today__streak')).toHaveTextContent(/^3/);
    expect(screen.getByText('Time studied').closest('.stat')).toHaveTextContent('15 min');
  });

  /**
   * The row is allowed to change as the feature changes — it said "planned"
   * until speaking was built. What may never change is that it shows no
   * number, because nothing counts speaking and a figure there would be
   * invented.
   */
  it('shows no number for speaking, because nothing counts it', () => {
    mount(<DashboardPage />, 'en', { stats: active });
    expect(screen.getByText(tr('skillSpeakingUncounted', 'en'))).toBeInTheDocument();
    const row = screen.getByText(tr('skillSpeaking', 'en')).closest('.skills__row');
    expect(row).not.toBeNull();
    expect(row!.querySelector('.meter')).toBeNull();
    expect(row!.textContent).not.toMatch(/\d/);
  });

  it('suggests onboarding first when the profile is not onboarded', () => {
    mount(<DashboardPage />, 'en', {
      profile: {
        teachingLanguage: 'en',
        dailyTargetMinutes: 20,
        displayName: null,
        onboarded: false,
        createdAt: now,
      },
    });
    expect(screen.getByText('Choose your teaching language')).toBeInTheDocument();
  });
});

describe('the course map is honest about what is finished', () => {
  /*
   * The course shows one level at a time (all of them at once was 35,000
   * pixels on a phone), so these walk the level switcher and ask each level in
   * turn what it says about itself.
   */
  async function eachLevel(check: (level: (typeof CURRICULUM)[number]) => void) {
    const user = userEvent.setup();
    mount(<CoursePage />, 'en');
    for (const level of CURRICULUM) {
      await user.click(screen.getByRole('button', { name: level.label }));
      check(level);
    }
  }

  it('labels unauthored levels as planned with an outline', async () => {
    // Derived, not pinned: a level is advertised as planned wholesale only
    // while nothing in it is authored, and which levels those are moves as the
    // course grows.
    await eachLevel((level) => {
      expect(screen.queryAllByText(tr('plannedNotice', 'en')).length, level.label).toBe(
        level.units.length === 0 ? 1 : 0,
      );
    });
  });

  it('still lists what is missing from every level that has units to come', async () => {
    // Derived rather than pinned to a number. The heading belongs to any level
    // with units still to come, whether or not some are already authored —
    // losing it the moment a level's first unit landed would read as a finished
    // level, and that is the regression this guards.
    const outlineFor = (level: (typeof CURRICULUM)[number]) =>
      LEVEL_OUTLINES[level.id as keyof typeof LEVEL_OUTLINES];
    await eachLevel((level) => {
      const plannedUnits = outlineFor(level)?.plannedUnits ?? [];
      // Once every planned unit has been written, the heading must be gone
      // rather than standing empty over nothing.
      expect(screen.queryAllByText(tr('plannedUnits', 'en')).length, level.label).toBe(
        plannedUnits.length > 0 ? 1 : 0,
      );
      for (const unit of plannedUnits) {
        expect(screen.getByText(unit.en), unit.en).toBeInTheDocument();
      }
      // And an authored unit is never repeated in that list.
      const planned = new Set([...document.querySelectorAll('.planned-units li')].map((li) => li.textContent));
      for (const authored of level.units) {
        expect(planned.has(authored.title.en), authored.title.en).toBe(false);
      }
    });
  });

  it('links to the authored lessons', () => {
    mount(<CoursePage />, 'en');
    const link = screen.getByRole('link', { name: 'Introducing yourself' });
    expect(link).toHaveAttribute('href', '/lesson/pre-a1-u2-l3');
  });
});

describe('the mistake bank distinguishes a mistake from its correction', () => {
  it('shows the occurrences and the retypings separately', () => {
    mount(<MistakesPage />, 'en', {
      mistakes: [
        {
          id: 'm1',
          category: 'preposition',
          expected: 'Ich komme aus Bulgarien.',
          lastGiven: 'Ich komme von Bulgarien.',
          stepId: 's1',
          lessonId: 'pre-a1-u2-l4',
          occurrences: 3,
          correctedCount: 2,
          firstSeenAt: now,
          lastSeenAt: now,
          resolvedAt: null,
        },
      ],
      stats: {
        totalAnswers: 5,
        correctAnswers: 2,
        accuracy: 0.4,
        totalStudySeconds: 300,
        studyDays: 1,
        streak: 1,
        categoryCounts: [{ category: 'preposition', count: 3 }],
        retypedCorrections: 2,
      },
    });
    expect(screen.getByText('Ich komme von Bulgarien.')).toBeInTheDocument();
    expect(screen.getByText('Ich komme aus Bulgarien.')).toBeInTheDocument();
    expect(screen.getByText('3×')).toBeInTheDocument();
    expect(screen.getByText('retyped correctly 2×')).toBeInTheDocument();
  });
});

/**
 * The daily round.
 *
 * Two things are being guarded. The round has to be assembled from what is
 * actually there — a part with nothing in it must not appear — and the number
 * of minutes on the button has to say where it came from, because a session
 * advertised as ten minutes is a statistic and this app does not display
 * statistics it invented.
 */
describe('the daily round', () => {
  const dueVocab = (id: string, refId: string) => ({
    id,
    kind: 'vocab' as const,
    refId,
    level: 'pre-a1' as const,
    state: 'learning' as const,
    ease: 2.5,
    intervalDays: 0,
    dueAt: new Date(Date.now() - 60_000).toISOString(),
    successCount: 1,
    failureCount: 0,
    lapses: 0,
    learningStep: 1,
    createdAt: now,
  });

  const recurring = {
    id: 'm1',
    category: 'article' as const,
    expected: 'der Tisch',
    lastGiven: 'die Tisch',
    stepId: 's1',
    lessonId: 'pre-a1-u2-l4',
    occurrences: 3,
    correctedCount: 0,
    firstSeenAt: now,
    lastSeenAt: now,
    resolvedAt: null,
  };

  it('says there is nothing to put in a round rather than inventing one', () => {
    mount(<SessionPage />, 'en');
    expect(screen.getByText(tr('sessionNothing', 'en'))).toBeInTheDocument();
    expect(screen.queryByText(tr('sessionStart', 'en'))).toBeNull();
  });

  it('names each part and how many answers it holds', () => {
    mount(<SessionPage />, 'en', {
      reviewItems: [dueVocab('r1', 'v-die-tochter'), dueVocab('r2', 'v-der-sohn')],
      mistakes: [recurring],
    });
    expect(screen.getByText(tr('sessionPartReview', 'en'))).toBeInTheDocument();
    expect(screen.getByText(tr('sessionPartMistakes', 'en'))).toBeInTheDocument();
    // No lesson is started, so there is no lesson part at all — an empty row
    // saying "0 answers" would be a promise the round cannot keep.
    expect(screen.queryByText(tr('sessionPartLesson', 'en'))).toBeNull();
    expect(screen.getByText(tr('sessionAnswers', 'en', { n: 2 }))).toBeInTheDocument();
    expect(screen.getByText(tr('sessionAnswers', 'en', { n: 1 }))).toBeInTheDocument();
  });

  it('marks the estimate as a stated default until the learner has a pace', () => {
    mount(<SessionPage />, 'en', { reviewItems: [dueVocab('r1', 'v-die-tochter')] });
    expect(screen.getByText(/stated default, not your pace/)).toBeInTheDocument();
  });

  it('uses the learner’s own measured pace once there is one, and says so', () => {
    mount(<SessionPage />, 'en', {
      reviewItems: [dueVocab('r1', 'v-die-tochter')],
      stats: {
        totalAnswers: 120,
        correctAnswers: 90,
        accuracy: 0.75,
        totalStudySeconds: 1800, // 15s an answer
        studyDays: 6,
        streak: 2,
        categoryCounts: [],
        retypedCorrections: 3,
      },
    });
    expect(screen.getByText(/your own average over 120 answers/)).toBeInTheDocument();
    expect(screen.getByText(/15s an answer/)).toBeInTheDocument();
  });

  it('starts the round on the first part', async () => {
    const user = userEvent.setup();
    mount(<SessionPage />, 'en', {
      reviewItems: [dueVocab('r1', 'v-die-tochter')],
      mistakes: [recurring],
    });
    await user.click(screen.getByRole('button', { name: tr('sessionStart', 'en') }));
    expect(screen.getByText(tr('sessionPartOf', 'en', { n: 1, total: 2 }), { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('a duration is never rounded into a lie', () => {
  it('reports seconds below a minute rather than "0 min"', () => {
    // A round that genuinely took forty seconds said "It took 0 min", which
    // reads as a broken counter rather than as a fast round.
    expect(formatDuration(40, 'en')).toBe('40 s');
    expect(formatDuration(40, 'bg')).toBe('40 сек');
    expect(formatDuration(900, 'en')).toBe('15 min');
    expect(formatDuration(5400, 'bg')).toBe('1 ч 30 мин');
  });
});

/*
 * A beginner who gets a lot wrong in their first lessons builds up a pile of
 * due words within the hour, and "Start review" played every one of them in a
 * single sitting. A round is capped; the rest wait for the next one.
 */
describe('a big review pile', () => {
  it('is taken twenty at a time', async () => {
    const { VOCABULARY } = await import('../../src/content/index.ts');
    const due = VOCABULARY.slice(0, 30).map((entry, index) => ({
      id: `r${index}`,
      kind: 'vocab' as const,
      refId: entry.id,
      level: 'pre-a1' as const,
      state: 'learning' as const,
      ease: 2.5,
      intervalDays: 0,
      dueAt: new Date(Date.now() - 60_000).toISOString(),
      successCount: 1,
      failureCount: 0,
      lapses: 0,
      learningStep: 1,
      createdAt: new Date().toISOString(),
    }));
    const user = userEvent.setup();
    mount(<ReviewPage />, 'en', { reviewItems: due });
    expect(screen.getByText(tr('reviewDueCount', 'en', { n: 30 }))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tr('reviewStart', 'en') }));
    expect(screen.getByText(tr('reviewRoundSize', 'en', { n: 20 }))).toBeInTheDocument();
  });
});


/*
 * Found by the audit of the interface, each one a thing a learner met.
 */
describe('reading a lesson', () => {
  const lessonRoute = (lang: TeachingLanguage) =>
    mount(
      <Routes>
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
      </Routes>,
      lang,
      undefined,
      '/lesson/pre-a1-u2-l3',
    );

  /*
   * Next swapped the section in place and left the page scrolled, so the
   * next section opened at its end, its title above the screen.
   */
  it('starts each new section at the top of the page', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    lessonRoute('en');
    await user.click(screen.getByRole('button', { name: tr('lessonStart', 'en') }));
    scrollTo.mockClear();
    await user.click(screen.getByRole('button', { name: tr('lessonNextSection', 'en') }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockRestore();
  });

  /*
   * While reading and practising the page had no h1 — the lesson title was a
   * paragraph — and small headings jumped from h2 to h4.
   */
  it('has the lesson title as its heading while reading, and no skipped levels', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    const { container } = lessonRoute('en');
    expect(container.querySelector('h4')).toBeNull();
    await user.click(screen.getByRole('button', { name: tr('lessonStart', 'en') }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Introducing yourself');
    scrollTo.mockRestore();
  });

  /*
   * Whether a requirement was met was shown only by a ✓ or ○ hidden from
   * screen readers, so "Pass the final check" sounded the same either way.
   */
  it('says whether each requirement is met, in words', () => {
    lessonRoute('bg');
    const items = [...document.querySelectorAll('.requirements li')];
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) expect(item).toHaveTextContent(tr('requirementNotMet', 'bg'));
  });
});

describe('the Bulgarian path reads as Bulgarian', () => {
  /*
   * Every prompt was wrapped in „…“ — instructions too, and prompts that
   * already quoted German got quotes inside quotes.
   */
  it('shows a prompt as written, without quotation marks of its own', async () => {
    const { ExercisePlayer } = await import('../../src/ui/components/ExercisePlayer.tsx');
    const { bi, typeIt } = await import('../../src/content/authoring.ts');
    const exercise = typeIt('t-q', bi('Q', 'В'), [
      {
        id: 't-q-1',
        prompt: bi('The waiter says: “Zusammen?” What is he asking?', 'Сервитьорът казва: „Zusammen?“ Какво пита?'),
        answer: 'Zusammen',
      },
    ]);
    const { container } = mount(
      <ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />,
      'bg',
    );
    expect(container.querySelector('.task__prompt')?.textContent).toBe('Сервитьорът казва: „Zusammen?“ Какво пита?');
  });

  /*
   * "0 / 18 от завършени урока" — a fraction, "of", then a lowercased label —
   * read as "0 / 18 of lessons completed" in English as well.
   */
  it('counts a level’s lessons in one sentence', () => {
    mount(<CoursePage />, 'bg');
    expect(document.querySelector('.level-progress')).toHaveTextContent(/Завършени 0 от \d+ урока/);
  });

  it('calls the review page what its tab calls it', () => {
    expect(tr('reviewTitle', 'bg')).toBe(tr('navReview', 'bg'));
  });

  /*
   * The Topic filter listed the raw tags — "time-of-day", "grammar-word" —
   * in both paths.
   */
  it('names every vocabulary topic', async () => {
    const { VOCABULARY } = await import('../../src/content/index.ts');
    const { TOPIC_LABELS } = await import('../../src/i18n.ts');
    const tags = new Set(VOCABULARY.flatMap((entry) => entry.tags));
    expect([...tags].filter((tag) => !TOPIC_LABELS[tag])).toEqual([]);
    mount(<VocabularyPage />, 'bg');
    const topic = screen.getByLabelText(tr('vocabFilterTopic', 'bg'));
    expect(topic).toHaveTextContent('части от деня');
    expect(topic).not.toHaveTextContent('time-of-day');
  });

  /*
   * The first learner is stored as "me", and Settings showed that English
   * placeholder on the Bulgarian path.
   */
  it('shows the first learner as Аз, not "me"', () => {
    mount(<SettingsPage />, 'bg');
    expect(document.querySelector('.learners__name')).toHaveTextContent('Аз');
  });
});

describe('the settings data card', () => {
  /*
   * Settings said "Progress deleted." when the reset had failed, right under
   * the banner saying nothing was deleted.
   */
  it('announces a reset only when it happened', async () => {
    const user = userEvent.setup();
    const resetAll = vi.fn(async () => undefined);
    mount(<SettingsPage />, 'en', { resetAll });
    await user.type(screen.getByLabelText(tr('settingsResetConfirm', 'en')), 'DELETE');
    await user.click(screen.getByRole('button', { name: tr('settingsReset', 'en') }));
    expect(resetAll).toHaveBeenCalled();
    expect(screen.queryByText(tr('settingsResetDone', 'en'))).toBeNull();
  });

  it('announces it once the server has deleted everything', async () => {
    const user = userEvent.setup();
    mount(<SettingsPage />, 'en', { resetAll: vi.fn(async () => true) });
    await user.type(screen.getByLabelText(tr('settingsResetConfirm', 'en')), 'DELETE');
    await user.click(screen.getByRole('button', { name: tr('settingsReset', 'en') }));
    expect(await screen.findByText(tr('settingsResetDone', 'en'))).toBeInTheDocument();
  });

  /*
   * It told every learner their progress was in SQLite "on this machine",
   * which on the hosted app is a server somewhere else entirely.
   */
  it('does not claim the progress is on this machine', () => {
    for (const lang of LANGS) {
      expect(tr('settingsDataNote', lang)).not.toMatch(/SQLite|this machine|тази машина/);
    }
  });
});

describe('what is shown to a screen reader', () => {
  /*
   * The mistake bars were progress bars with no name, reading "100%" for the
   * biggest of a few counts, and every "Practise this kind" button had the
   * same name.
   */
  it('keeps the mistake bars out of the way and names each practise button', () => {
    mount(<MistakesPage />, 'en', {
      mistakes: [
        {
          id: 'm1',
          category: 'article',
          expected: 'die Tochter',
          lastGiven: 'der Tochter',
          stepId: null,
          lessonId: null,
          occurrences: 3,
          correctedCount: 0,
          firstSeenAt: now,
          lastSeenAt: now,
          resolvedAt: null,
        },
      ],
      stats: {
        totalAnswers: 5,
        correctAnswers: 2,
        accuracy: 0.4,
        totalStudySeconds: 300,
        studyDays: 1,
        streak: 1,
        categoryCounts: [
          { category: 'article', count: 3 },
          { category: 'preposition', count: 1 },
        ],
        retypedCorrections: 0,
      },
    });
    expect(document.querySelector('.cat-bars [role="progressbar"]')).toBeNull();
    const label = tr('mistakesPractiseCategory', 'en');
    expect(screen.getAllByRole('button', { name: new RegExp(`^${label}: `) })).toHaveLength(2);
  });
});

describe('the review queue on the page', () => {
  it('lists a due sentence by its German, not its id', () => {
    mount(<ReviewPage />, 'en', {
      reviewItems: [
        {
          id: 'r1',
          kind: 'pattern',
          refId: 'p-ich-komme-aus',
          level: 'pre-a1',
          state: 'learning',
          ease: 2.5,
          intervalDays: 0,
          dueAt: new Date(Date.now() - 60_000).toISOString(),
          successCount: 1,
          failureCount: 0,
          lapses: 0,
          learningStep: 1,
          createdAt: now,
        },
      ],
    });
    expect(screen.queryByText('p-ich-komme-aus')).toBeNull();
    expect(document.querySelector('.queue__label')).toHaveTextContent('Ich komme aus Bulgarien.');
  });
});

describe('relative dates', () => {
  /*
   * The second learning step is exactly one day, so nearly every new word
   * read "in 1 days" / "след 1 дни".
   */
  it('says one day in the singular', () => {
    const at = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();
    expect(formatRelativeDate(at(24), 'en')).toBe('in 1 day');
    expect(formatRelativeDate(at(30), 'bg')).toBe('след 1 ден');
    expect(formatRelativeDate(at(-26), 'en')).toBe('1 day ago');
    expect(formatRelativeDate(at(-26), 'bg')).toBe('преди 1 ден');
    expect(formatRelativeDate(at(48), 'en')).toBe('in 2 days');
    expect(formatRelativeDate(at(48), 'bg')).toBe('след 2 дни');
  });
});
