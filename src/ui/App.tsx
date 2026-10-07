import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { useApp } from '../state/AppState.tsx';

import { DashboardPage } from './pages/DashboardPage.tsx';

import { MorePage, MORE_ROUTES } from './pages/MorePage.tsx';
import { SyncBanner } from './components/SyncBanner.tsx';
import { Icon } from './components/icons.tsx';
import { learnerName } from './components/bits.tsx';
import { dueItems } from '../core/srs/scheduler.ts';
import { reviewItemsForPath } from './reviewBuilder.ts';
import { DackelMark } from './components/Dackel.tsx';
import { arrivedAt } from '../services/offline/register.ts';

import { RouteContent, RouteLoading } from './components/RouteContent.tsx';

const CoachPage = lazy(() => import('./pages/CoachPage.tsx').then(module => ({ default: module.CoachPage })));
const DailyPage = lazy(() => import('./pages/DailyPage.tsx').then(module => ({ default: module.DailyPage })));
const CheckpointPage = lazy(() => import('./pages/CheckpointPage.tsx').then(module => ({ default: module.CheckpointPage })));
const CoursePage = lazy(() => import('./pages/CoursePage.tsx').then(module => ({ default: module.CoursePage })));
const LessonPage = lazy(() => import('./pages/LessonPage.tsx').then(module => ({ default: module.LessonPage })));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx').then(module => ({ default: module.LoginPage })));
const MistakesPage = lazy(() => import('./pages/MistakesPage.tsx').then(module => ({ default: module.MistakesPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.tsx').then(module => ({ default: module.OnboardingPage })));
const PlacementPage = lazy(() => import('./pages/PlacementPage.tsx').then(module => ({ default: module.PlacementPage })));
const RealLifePage = lazy(() => import('./pages/RealLifePage.tsx').then(module => ({ default: module.RealLifePage })));
const ScenarioPage = lazy(() => import('./pages/ScenarioPage.tsx').then(module => ({ default: module.ScenarioPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage.tsx').then(module => ({ default: module.ReviewPage })));
const SessionPage = lazy(() => import('./pages/SessionPage.tsx').then(module => ({ default: module.SessionPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx').then(module => ({ default: module.SettingsPage })));
const SetupPage = lazy(() => import('./pages/SetupPage.tsx').then(module => ({ default: module.SetupPage })));
const VocabularyPage = lazy(() => import('./pages/VocabularyPage.tsx').then(module => ({ default: module.VocabularyPage })));
const WordPage = lazy(() => import('./pages/WordPage.tsx').then(module => ({ default: module.WordPage })));

/** How often the "No connection" screen tries again on its own. */
const OFFLINE_RETRY_MS = 15_000;

export function App() {
  const { ready, error, offline, sync, session, profile, reload, t, reviewItems, learners, studyingAs } =
    useApp();
  const location = useLocation();
  // A new build found while a checkpoint or conversation was open waits for
  // the learner to leave it; this is how the watcher hears that they have.
  useEffect(() => arrivedAt(location.pathname), [location.pathname]);

  /*
   * The "No connection" screen promises to load by itself once there is a
   * connection again, and nothing did: the listeners that notice the signal
   * coming back only start once progress has loaded. So while this screen is
   * up it listens itself — for the browser saying it is online, and for the
   * app being brought back to the front, which on an iPhone is often the
   * first sign the train is out of the tunnel.
   *
   * Neither comes when the phone never went offline: a server answering 503
   * while its database wakes, or wifi that holds every request. So it also
   * tries again on a timer, one attempt at a time.
   */
  const waitingForSignal = Boolean(error) && offline;
  const retrying = useRef(false);
  useEffect(() => {
    if (!waitingForSignal) return;
    const retry = () => {
      if (retrying.current) return;
      retrying.current = true;
      void reload().finally(() => {
        retrying.current = false;
      });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') retry();
    };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(retry, OFFLINE_RETRY_MS);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [waitingForSignal, reload]);

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
    return <Suspense fallback={<RouteLoading />}><SetupPage /></Suspense>;
  }
  if (session.required && !session.signedIn) {
    return <Suspense fallback={<RouteLoading />}><LoginPage /></Suspense>;
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
        {/* The server answered — with an error — so asking whether it is
            running was both a developer's question and the wrong one. */}
        <p>{t('errorServer')}</p>
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

  const dueCount = dueItems(reviewItemsForPath(reviewItems, profile.teachingLanguage)).length;
  const name = learnerName(learners.find(learner => learner.id === studyingAs)?.name ?? '', t);

  return (
    <div className={`shell${location.pathname === '/welcome' ? ' shell--welcome' : ''}`}>
      <ScrollToTop />
      <a className="skip-link" href="#main">
        {t('skipToContent')}
      </a>

      <header className="topbar">
        <Link to="/" className="topbar__brand" aria-label={t('appName')}>
          <span className="topbar__logo" aria-hidden="true">
            <DackelMark />
          </span>
          <div>
            <p className="topbar__name">{t('appName')}</p>
            <p className="topbar__tag">{t('tagline')}</p>
          </div>
        </Link>
        <div className="topbar__context"><p>{t('studioLabel')}</p><span>{t('tagline')}</span></div>
        <div className="topbar__right">
          <StudyIndicator />
          <NavLink to="/settings" className="topbar__who" title={t('learnersTitle')}>
            <span className="topbar__avatar" aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
            <span className="topbar__learner">{name}</span>
          </NavLink>
          <LanguageToggle />
        </div>
      </header>

      {/* The first-run question has the screen to itself: no tabs to wander
          off into before the app knows which language to explain in. */}
      <nav className="nav" aria-label={t('navMain')} hidden={location.pathname === '/welcome'}>
        <p className="nav__section">{t('studioLearn')}</p>
        <NavItem to="/" label={t('navToday')} icon="today" />
        <NavItem to="/daily" label={t('navDaily')} icon="round" />
        <NavItem to="/course" label={t('navCourse')} icon="course" />
        <NavItem to="/review" label={t('navReview')} icon="review" badge={dueCount > 0 ? dueCount : undefined} />
        {/* Wide screens: all of them. A phone hides these and shows More. */}
        <p className="nav__section nav__section--explore">{t('studioExplore')}</p>
        <NavItem to="/vocabulary" icon="book" label={t('navVocabulary')} secondary />
        <NavItem to="/mistakes" icon="target" label={t('navMistakes')} secondary />
        <NavItem to="/real-life" icon="chat" label={t('navRealLife')} secondary />
        <NavItem to="/coach" icon="pen" label={t('navCoach')} secondary />
        <NavItem to="/settings" icon="gear" label={t('navSettings')} secondary />
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
        <div className="nav__foot"><DackelMark /><span lang="de">Los geht’s!</span><p>{t('studioDaily')}</p></div>
      </nav>

      <SyncBanner />

      <main id="main" className="main">
        <RouteContent><Routes>
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/daily" element={<DailyPage />} />
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
        </Routes></RouteContent>
      </main>

    </div>
  );
}

function StudyIndicator() {
  const { t, studyStatus = 'ready' } = useApp();
  return <span className={`study-indicator study-indicator--${studyStatus}`} title={t('studyTimeNote')}>
    <span aria-hidden="true" />
    {t(studyStatus === 'active' ? 'studyActive' : studyStatus === 'paused' ? 'studyPaused' : 'studyReady')}
  </span>;
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
  icon?: import('./components/icons.tsx').IconName;
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

/**
 * A new page opens at its top. The router keeps the old scroll position, so a
 * word tapped far down the vocabulary list opened its own page part-way down,
 * the word and its audio above the screen. Back and forward are left alone:
 * there the browser's own position is the one the learner expects.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigation = useNavigationType();
  useEffect(() => {
    if (navigation !== 'POP') {
      window.scrollTo(0, 0);
      // A client-side route does not give keyboard or screen-reader users
      // the new-document focus a normal navigation would. Start at its title.
      const focusTitle = () => {
        const heading = document.querySelector<HTMLElement>('#main h1');
        if (!heading) return false;
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        return true;
      };
      if (!focusTitle()) {
        const observer = new MutationObserver(() => { if (focusTitle()) observer.disconnect(); });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
      }
    }
  }, [pathname, navigation]);
  return null;
}

function LanguageToggle() {
  const { profile, setTeachingLanguage, t } = useApp();
  return (
    <div className="lang-toggle" role="group" aria-label={t('settingsLanguage')}>
      {(['en', 'bg'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-toggle__btn${profile.teachingLanguage === code ? ' is-active' : ''}`}
          aria-pressed={profile.teachingLanguage === code}
          // Each language named in itself, as a language picker should be.
          aria-label={code === 'en' ? 'English' : 'Български'}
          lang={code}
          onClick={() => void setTeachingLanguage(code)}
        >
          {code === 'en' ? 'EN' : 'БГ'}
        </button>
      ))}
    </div>
  );
}
