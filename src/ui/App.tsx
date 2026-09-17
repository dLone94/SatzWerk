import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from '../state/AppState.tsx';
import { CoachPage } from './pages/CoachPage.tsx';
import { CheckpointPage } from './pages/CheckpointPage.tsx';
import { CoursePage } from './pages/CoursePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LessonPage } from './pages/LessonPage.tsx';
import { MistakesPage } from './pages/MistakesPage.tsx';
import { OnboardingPage } from './pages/OnboardingPage.tsx';
import { RealLifePage } from './pages/RealLifePage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { VocabularyPage } from './pages/VocabularyPage.tsx';
import { WordPage } from './pages/WordPage.tsx';
import { dueItems } from '../core/srs/scheduler.ts';

export function App() {
  const { ready, error, profile, reload, t, reviewItems } = useApp();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="boot">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="boot boot--error">
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
        <LanguageToggle />
      </header>

      <nav className="nav" aria-label={t('navCourse')}>
        <NavItem to="/" label={t('navToday')} />
        <NavItem to="/course" label={t('navCourse')} />
        <NavItem to="/review" label={t('navReview')} badge={dueCount > 0 ? dueCount : undefined} />
        <NavItem to="/vocabulary" label={t('navVocabulary')} />
        <NavItem to="/mistakes" label={t('navMistakes')} />
        <NavItem to="/real-life" label={t('navRealLife')} />
        <NavItem to="/coach" label={t('navCoach')} />
        <NavItem to="/settings" label={t('navSettings')} />
      </nav>

      <main id="main" className="main">
        <Routes>
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
          <Route path="/checkpoint/:checkpointId" element={<CheckpointPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/vocabulary" element={<VocabularyPage />} />
          <Route path="/vocabulary/:wordId" element={<WordPage />} />
          <Route path="/mistakes" element={<MistakesPage />} />
          <Route path="/real-life" element={<RealLifePage />} />
          <Route path="/coach" element={<CoachPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>
          SatzWerk {'·'} {t('tagline')}
        </p>
      </footer>
    </div>
  );
}

function NavItem({ to, label, badge }: { to: string; label: string; badge?: number }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav__item${isActive ? ' is-active' : ''}`}>
      {label}
      {badge ? <span className="nav__badge">{badge}</span> : null}
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
