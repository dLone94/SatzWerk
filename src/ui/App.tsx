import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppState.tsx';
import { CoachPage } from './pages/CoachPage.tsx';
import { CheckpointPage } from './pages/CheckpointPage.tsx';
import { CoursePage } from './pages/CoursePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LessonPage } from './pages/LessonPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { MistakesPage } from './pages/MistakesPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { PlacementPage } from './pages/PlacementPage.tsx';
import { RealLifePage } from './pages/RealLifePage.tsx';
import { ScenarioPage } from './pages/ScenarioPage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';
import { SessionPage } from './pages/SessionPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { SetupPage } from './pages/SetupPage.tsx';
import { VocabularyPage } from './pages/VocabularyPage.tsx';
import { WordPage } from './pages/WordPage.tsx';
import { MorePage, MORE_ROUTES } from './pages/MorePage.tsx';
import { SyncBanner } from './components/SyncBanner.tsx';
import { Icon } from './components/icons.tsx';
import { dueItems } from '../core/srs/scheduler.ts';

export function App() {
  const { ready, error, offline, sync, session, profile, reload, t, reviewItems, learners, studyingAs } =
    useApp();
  const location = useLocation();

  if (!ready) {
    // Three shimmering lines rather than the word "Loading" alone: on a phone
    // waking a sleeping database, the wait is real, and a screen that is
    // visibly working reads as working rather than as stuck.
    return (
      <div className="boot">
        <span className="boot__mark" aria-hidden="true">
          SW
        </span>
        <p>{t('loading')}</p>
        <div className="boot__skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  }

  // A hosted deployment deals with the password before anything else. Checked
  // before `error` so that a 401 shows the right screen rather than a failure
  // page. Setup comes first: until a password exists there is nothing to log
  // in to.
  if (session.needsSetup) {
    return <SetupPage />;
  }
  if (session.required && !session.signedIn) {
    return <LoginPage />;
  }

  /*
   * No signal, which is not a fault.
   *
   * The app itself is here — the service worker keeps it, so a train going
   * underground no longer replaces SatzWerk with the browser's error page.
   * What is missing is the progress, which lives in the database and is not
   * guessed at: no streak, no counts, nothing invented to fill the screen.
   * Only what is true, and what is waiting.
   */
  if (error && offline) {
    return (
      <div className="boot boot--offline">
        <span className="boot__icon" aria-hidden="true">
          <Icon name="offline" size={30} />
        </span>
        <h1>{t('offlineTitle')}</h1>
        <p>{t('offlineBody')}</p>
        {/* Answers are counted as answers, and nothing else is: a lesson
            result is named for what it is, and study minutes are not the
            learner's work at all, so they are not counted here. */}
        {sync.pending > 0 ? <p className="boot__waiting">{t('offlineWaiting', { n: sync.pending })}</p> : null}
        {sync.other > 0 ? <p className="boot__waiting">{t('offlineOther', { n: sync.other })}</p> : null}
        <button type="button" className="btn btn--primary" onClick={() => void reload()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="boot boot--error">
        <span className="boot__icon boot__icon--bad" aria-hidden="true">
          <Icon name="alert" size={30} />
        </span>
        <h1>{t('errorTitle')}</h1>
        <p>{t('errorOffline')}</p>
        <pre className="boot__detail">{error}</pre>
        <button type="button" className="btn btn--primary" onClick={() => void reload()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  // First run: one question before anything else.
  if (!profile.onboarded && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  const dueCount = dueItems(reviewItems).length;

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="topbar">
        <div className="topbar__brand">
          <span className="topbar__logo" aria-hidden="true">
            SW
          </span>
          <div>
            <p className="topbar__name">{t('appName')}</p>
            <p className="topbar__tag">{t('tagline')}</p>
          </div>
        </div>
        <div className="topbar__right">
          {/* Only once there is somebody to be confused with. */}
          {learners.length > 1 ? (
            <NavLink to="/settings" className="topbar__who" title={t('learnersTitle')}>
              {learners.find((learner) => learner.id === studyingAs)?.name ?? ''}
            </NavLink>
          ) : null}
          <LanguageToggle />
        </div>
      </header>

      {/* The first-run question has the screen to itself: no tabs to wander
          off into before the app knows which language to explain in. */}
      <nav className="nav" aria-label={t('navCourse')} hidden={location.pathname === '/welcome'}>
        <NavItem to="/" label={t('navToday')} icon="today" />
        <NavItem to="/session" label={t('navSession')} icon="round" />
        <NavItem to="/course" label={t('navCourse')} icon="course" />
        <NavItem to="/review" label={t('navReview')} icon="review" badge={dueCount > 0 ? dueCount : undefined} />
        {/* Wide screens: all of them. A phone hides these and shows More. */}
        <NavItem to="/vocabulary" label={t('navVocabulary')} secondary />
        <NavItem to="/mistakes" label={t('navMistakes')} secondary />
        <NavItem to="/real-life" label={t('navRealLife')} secondary />
        <NavItem to="/coach" label={t('navCoach')} secondary />
        <NavItem to="/settings" label={t('navSettings')} secondary />
        <NavLink
          to="/more"
          className={() =>
            `nav__item nav__item--more${
              MORE_ROUTES.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`))
                ? ' is-active'
                : ''
            }`
          }
        >
          <span className="nav__icon">
            <Icon name="more" size={20} />
          </span>
          <span className="nav__label">{t('navMore')}</span>
        </NavLink>
      </nav>

      <SyncBanner />

      <main id="main" className="main">
        <Routes>
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/checkpoint/:checkpointId" element={<CheckpointPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/vocabulary/:wordId" element={<WordPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/placement" element={<PlacementPage />} />
          <Route path="/real-life" element={<RealLifePage />} />
          <Route path="/scenario/:scriptId" element={<ScenarioPage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    </div>
  );
}

function NavItem({
  to,
  label,
  badge,
  icon,
  secondary = false,
}: {
  to: string;
  label: string;
  badge?: number;
  /** Shown on a phone, where the tabs sit under the thumb. */
  icon?: 'today' | 'round' | 'course' | 'review';
  /** Folded into More on a phone. */
  secondary?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `nav__item${secondary ? ' nav__item--secondary' : ''}${isActive ? ' is-active' : ''}`
      }
    >
      {icon ? (
        <span className="nav__icon">
          <Icon name={icon} size={20} />
          {badge ? <span className="nav__badge">{badge}</span> : null}
        </span>
      ) : null}
      <span className="nav__label">{label}</span>
      {badge && !icon ? <span className="nav__badge">{badge}</span> : null}
    </NavLink>
  );
}

function LanguageToggle() {
  const { profile, setTeachingLanguage } = useApp();
  return (
    <div className="lang-toggle" role="group" aria-label="Teaching language">
      {(['en', 'bg'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-toggle__btn${profile.teachingLanguage === code ? ' is-active' : ''}`}
          aria-pressed={profile.teachingLanguage === code}
          onClick={() => void setTeachingLanguage(code)}
        >
          {code === 'en' ? 'EN' : 'БГ'}
        </button>
      ))}
    </div>
  );
}
