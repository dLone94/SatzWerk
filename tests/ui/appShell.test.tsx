// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp } from '../../src/state/AppState.tsx';
import { App, ScrollToTop } from '../../src/ui/App.tsx';

/**
 * The frame around every page: the screens shown before progress has loaded,
 * the language the page says it is in, and where a new page starts.
 */

const snapshot = (lang: 'en' | 'bg') => ({
  profile: {
    teachingLanguage: lang,
    dailyTargetMinutes: 20,
    displayName: null,
    onboarded: true,
    createdAt: new Date().toISOString(),
  },
  lessons: [],
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
  serverTime: new Date().toISOString(),
});

/** How the server behaves: absent, present and unhappy, or fine. */
let mode: 'unreachable' | 'waking' | 'broken' | 'fine' = 'unreachable';
let profileLang: 'en' | 'bg' = 'en';
let session: Record<string, unknown> = { required: false, signedIn: true };
const originalFetch = globalThis.fetch;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  outbox.reset();
  localStorage.clear();
  document.documentElement.lang = 'en';
  mode = 'unreachable';
  profileLang = 'en';
  session = { required: false, signedIn: true };
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    if (mode === 'unreachable') throw new TypeError('Failed to fetch');
    if (mode === 'waking') return json({ error: 'The database is waking up.' }, 503);
    if (url.endsWith('/api/session')) return json(session);
    if (url.endsWith('/api/login') && method === 'POST') return json({ error: 'That password is not right.' }, 401);
    if (mode === 'broken') return json({ error: 'the database is on fire' }, 500);
    if (url.endsWith('/api/state')) return json(snapshot(profileLang));
    if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
    if (url.endsWith('/api/learners')) {
      return json({ learners: [{ id: 1, name: 'me', createdAt: new Date().toISOString() }], studyingAs: 1 });
    }
    return json({});
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
  vi.restoreAllMocks();
});

const mount = () =>
  render(
    <MemoryRouter>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MemoryRouter>,
  );

describe('the offline start screen', () => {
  /*
   * It says it will load by itself once there is a connection again, and it
   * never did: the listeners for the signal coming back only started once
   * progress had loaded, so the learner sat on "No connection" until they
   * noticed the button.
   */
  it('loads by itself when the connection comes back', async () => {
    mount();
    await screen.findByText(tr('offlineTitle', 'en'));
    mode = 'fine';
    // The screen starts listening in an effect, which may run just after it
    // first appears, so the signal is given until it is heard.
    await waitFor(() => {
      window.dispatchEvent(new Event('online'));
      expect(screen.queryByText(tr('offlineTitle', 'en'))).not.toBeInTheDocument();
    });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  /*
   * A server that answers 503 while its database wakes, or wifi that holds
   * every request, also shows "No connection" — and there the phone never
   * went offline, so no "online" event ever came and the screen waited for
   * ever. It now also tries again every little while.
   */
  it('tries again by itself when the phone never went offline', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    try {
      mode = 'waking';
      mount();
      await screen.findByText(tr('offlineTitle', 'en'));
      mode = 'fine';
      // Let the effect install its interval and finish the retry's asynchronous
      // state updates before checking. Advancing inside waitFor repeatedly
      // raced those updates on a busy runner.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(15_000);
      });
      expect(await screen.findByRole('navigation')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('the language before progress has loaded', () => {
  /*
   * The teaching language lived only in the server's profile, so everything
   * shown before it arrived — the loading line, "No connection", the password
   * prompt — was English for a Bulgarian learner, and the page was marked
   * lang="en" throughout.
   */
  it('is the one last used on this device', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    mount();
    expect(await screen.findByText(tr('offlineTitle', 'bg'))).toBeInTheDocument();
    expect(screen.getByText(tr('offlineBody', 'bg'))).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('bg');
  });

  it('is remembered from the profile once it has loaded, and marks the page', async () => {
    mode = 'fine';
    profileLang = 'bg';
    mount();
    await screen.findByRole('navigation');
    // The language is written by an effect, which can run just after the
    // navigation first appears.
    await waitFor(() => {
      expect(localStorage.getItem('satzwerk.lang')).toBe('bg');
      expect(document.documentElement.lang).toBe('bg');
    });
  });

  /*
   * The language before progress loads was read once, when the app started.
   * Signing out clears the progress, so the password screen went back to the
   * language of that start: English for a learner who had since switched the
   * app to Bulgarian.
   */
  it('is the one last used after signing out, not the one the app started in', async () => {
    mode = 'fine';
    profileLang = 'bg';
    session = { required: true, signedIn: true };
    function SignOut() {
      const { signOut } = useApp();
      return (
        <button type="button" onClick={() => void signOut()}>
          sign out
        </button>
      );
    }
    render(
      <MemoryRouter>
        <AppStateProvider>
          <App />
          <SignOut />
        </AppStateProvider>
      </MemoryRouter>,
    );
    await screen.findByRole('navigation');
    await waitFor(() => expect(localStorage.getItem('satzwerk.lang')).toBe('bg'));
    await userEvent.click(screen.getByRole('button', { name: 'sign out' }));
    expect(await screen.findByText(tr('loginIntro', 'bg'))).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('bg');
  });

  it('asks for the password in that language, and says it is wrong in it too', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    mode = 'fine';
    session = { required: true, signedIn: false };
    mount();
    expect(await screen.findByText(tr('loginIntro', 'bg'))).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(tr('loginPassword', 'bg')), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: tr('loginSubmit', 'bg') }));
    expect(await screen.findByRole('alert')).toHaveTextContent(tr('loginWrong', 'bg'));
  });
});

describe('a server that answers with an error', () => {
  /*
   * It said "Could not reach the SatzWerk server. Is it running?" — a
   * developer's question, and false: the server had answered.
   */
  it('says the server answered with an error', async () => {
    mode = 'broken';
    mount();
    expect(await screen.findByText(tr('errorServer', 'en'))).toBeInTheDocument();
    expect(screen.queryByText(/Is it running/)).not.toBeInTheDocument();
  });
});

describe('the frame on the Bulgarian path', () => {
  /*
   * The skip link said "Skip to content", the language switch was named
   * "Teaching language", the main navigation was named after its "Course" tab,
   * and the first learner was shown as "me".
   */
  it('names the skip link, the navigation and the language switch in Bulgarian', async () => {
    mode = 'fine';
    profileLang = 'bg';
    mount();
    const nav = await screen.findByRole('navigation');
    expect(nav).toHaveAccessibleName(tr('navMain', 'bg'));
    expect(screen.getByText(tr('skipToContent', 'bg'))).toBeInTheDocument();
    expect(screen.getByRole('group', { name: tr('settingsLanguage', 'bg') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Български' })).toHaveAttribute('lang', 'bg');
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute('lang', 'en');
  });
});

describe('where a new page starts', () => {
  /*
   * The router kept the old scroll position, so a word tapped far down the
   * vocabulary list opened its page part-way down, the word itself above the
   * screen.
   */
  function Go({ to }: { to: string }) {
    const navigate = useNavigate();
    return (
      <>
        <button type="button" onClick={() => navigate(to)}>
          go
        </button>
        <button type="button" onClick={() => navigate(-1)}>
          back
        </button>
      </>
    );
  }

  it('is the top, except on Back', async () => {
    render(
      <MemoryRouter initialEntries={['/vocabulary']}>
        <ScrollToTop />
        <Go to="/vocabulary/v-hallo" />
      </MemoryRouter>,
    );
    const scrollTo = vi.mocked(window.scrollTo);
    scrollTo.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    scrollTo.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'back' }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('moves keyboard focus to the page title after navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/vocabulary']}>
        <ScrollToTop />
        <Go to="/course" />
        <main id="main"><h1>Course</h1></main>
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByRole('heading', { name: 'Course' })).toHaveFocus();
  });
});
