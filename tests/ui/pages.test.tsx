// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LEXICON, describeNoun } from '../../src/content/index.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { nullTtsProvider } from '../../src/services/tts/index.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { CheckpointPage } from '../../src/ui/pages/CheckpointPage.tsx';
import { CoachPage } from '../../src/ui/pages/CoachPage.tsx';
import { CoursePage } from '../../src/ui/pages/CoursePage.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { LessonPage } from '../../src/ui/pages/LessonPage.tsx';
import { MistakesPage } from '../../src/ui/pages/MistakesPage.tsx';
import { OnboardingPage } from '../../src/ui/pages/OnboardingPage.tsx';
import { RealLifePage } from '../../src/ui/pages/RealLifePage.tsx';
import { ReviewPage } from '../../src/ui/pages/ReviewPage.tsx';
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
    coach: { aiAvailable: false, provider: 'none', features: { writingReview: 'rule-based', conversation: 'planned' } },
    lang,
    t: (key, vars) => tr(key, lang, vars),
    say: (text) => (text ? text[lang] : ''),
    tts: nullTtsProvider,
    lexicon: LEXICON,
    describeNoun,
    reload: vi.fn(async () => undefined),
    setTeachingLanguage: vi.fn(async () => undefined),
    updateProfile: vi.fn(async () => undefined),
    submitAttempt: vi.fn(async () => undefined),
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
  });

  it('review', () => {
    mount(<ReviewPage />, lang);
    expect(screen.getByText(tr('reviewNothingDue', lang))).toBeInTheDocument();
  });

  it('vocabulary', () => {
    mount(<VocabularyPage />, lang);
    expect(screen.getByPlaceholderText(tr('vocabSearch', lang))).toBeInTheDocument();
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
    // Planned scenarios must be labelled as planned.
    expect(screen.getAllByText(tr('statusPlanned', lang)).length).toBeGreaterThan(5);
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
  });
});

describe('the dashboard never invents progress', () => {
  it('shows a dash instead of a percentage before anything is answered', () => {
    mount(<DashboardPage />, 'en');
    const accuracy = screen.getByText('First-try accuracy').closest('.stat');
    expect(accuracy).toHaveTextContent('—');
    expect(accuracy).toHaveTextContent('No data yet');
  });

  it('shows no streak before any study day exists', () => {
    mount(<DashboardPage />, 'en');
    expect(screen.getByText('Study streak').closest('.stat')).toHaveTextContent('—');
  });

  it('reports real figures once there is activity', () => {
    mount(<DashboardPage />, 'en', {
      stats: {
        totalAnswers: 20,
        correctAnswers: 15,
        accuracy: 0.75,
        totalStudySeconds: 900,
        studyDays: 3,
        streak: 3,
        categoryCounts: [{ category: 'article', count: 2 }],
        retypedCorrections: 4,
      },
    });
    expect(screen.getByText('First-try accuracy').closest('.stat')).toHaveTextContent('75%');
    expect(screen.getByText('Study streak').closest('.stat')).toHaveTextContent('3 days');
    expect(screen.getByText('Time studied').closest('.stat')).toHaveTextContent('15 min');
  });

  it('marks speaking as planned rather than showing a number', () => {
    mount(<DashboardPage />, 'en');
    expect(screen.getByText('Planned — not built yet')).toBeInTheDocument();
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
  it('labels unauthored levels as planned with an outline', () => {
    mount(<CoursePage />, 'en');
    // A2, B1 and B2 have nothing authored at all. A1 has its first unit, so it
    // is no longer advertised as planned wholesale.
    expect(screen.getAllByText(tr('plannedNotice', 'en')).length).toBe(3);
  });

  it('still lists what is missing from a level that has only started', () => {
    mount(<CoursePage />, 'en');
    // Three empty levels plus A1, which has one unit and five to come. Losing
    // this heading the moment a level's first unit landed would read as a
    // finished level.
    expect(screen.getAllByText(tr('plannedUnits', 'en')).length).toBe(4);
    expect(screen.getByText('Home and daily life')).toBeInTheDocument();
    // And the authored unit is not repeated in that list.
    expect(screen.queryAllByText('People and family')).toHaveLength(0);
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
