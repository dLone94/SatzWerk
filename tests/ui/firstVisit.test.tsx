// @vitest-environment jsdom
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider } from '../../src/state/AppState.tsx';
import { App } from '../../src/ui/App.tsx';

/**
 * A first visit: a new learner on a fresh profile, sent from / to the welcome
 * screen before they have touched anything.
 *
 * The app notices the learner's first key, tap or click once per page load,
 * so the test that needs a page nobody has touched runs first, in a file of
 * its own.
 */

let profile = { teachingLanguage: 'en' as 'en' | 'bg', onboarded: false };
const profileWrites: Record<string, unknown>[] = [];
/** When set, a profile write waits for this before it is answered; 'fail' answers 500. */
let profileWriteGate: Promise<void> | 'fail' | null = null;
const originalFetch = globalThis.fetch;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const fullProfile = () => ({ ...profile, dailyTargetMinutes: 20, displayName: null, createdAt: new Date().toISOString() });

beforeEach(() => {
  outbox.reset();
  localStorage.clear();
  document.documentElement.lang = 'en';
  profile = { teachingLanguage: 'en', onboarded: false };
  profileWrites.length = 0;
  profileWriteGate = null;
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/profile') && init?.method === 'PUT') {
      const patch = JSON.parse(String(init.body)) as Record<string, unknown>;
      profileWrites.push(patch);
      if (profileWriteGate === 'fail') return json({ error: 'database unavailable' }, 500);
      if (profileWriteGate) await profileWriteGate;
      profile = { ...profile, ...(patch as Partial<typeof profile>) };
      return json(fullProfile());
    }
    if (url.endsWith('/api/state')) {
      return json({
        profile: fullProfile(),
        lessons: [],
        reviewItems: [],
        mistakes: [],
        favorites: [],
        stats: { totalAnswers: 0, correctAnswers: 0, accuracy: 0, totalStudySeconds: 0, studyDays: 0, streak: 0, categoryCounts: [], retypedCorrections: 0 },
        studyDays: [],
        checkpointResults: [],
        scenarioRuns: [],
        serverTime: new Date().toISOString(),
      });
    }
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

const visit = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </MemoryRouter>,
  );

describe('the welcome screen on a first visit', () => {
  /*
   * The redirect from / to /welcome counted as a navigation, so the welcome
   * title took focus before the learner had touched anything — and a browser
   * draws the keyboard ring for focus moved like that. Every new learner's
   * first screen opened with a thick blue box round "Welcome to SatzWerk",
   * like a selected text field.
   */
  it('leaves focus where the page load put it, and moves it once the learner moves on', async () => {
    visit('/');
    const welcome = await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'en') });
    // The title is looked for again whenever the page changes; give that a moment.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(welcome).not.toHaveFocus();
    expect(document.body).toHaveFocus();

    // Their own step onward is a navigation like any other: the new page
    // starts at its title, for a keyboard or a screen reader.
    await userEvent.click(screen.getByRole('button', { name: tr('onboardingStart', 'en') }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus());
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent(tr('onboardingTitle', 'en'));
  });
});

describe('the language of a first visit', () => {
  /*
   * A new profile is created with English, which nobody chose. On a phone
   * set to Bulgarian — or for a learner added from the Bulgarian app — the
   * loading screen spoke Bulgarian, then the welcome screen opened in English
   * with English selected, and the device's own memory of its language was
   * overwritten with that English before anyone had picked anything.
   */
  it('starts in the language this device was using, and keeps that memory', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    visit('/');
    expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'bg') })).toBeInTheDocument();
    // The path card, not the switch in the top bar.
    expect(within(screen.getByRole('main')).getByRole('button', { name: /Български/ })).toHaveAttribute('aria-pressed', 'true');
    expect(profileWrites).toContainEqual({ teachingLanguage: 'bg' });
    expect(localStorage.getItem('satzwerk.lang')).toBe('bg');
  });

  it('starts in the phone\u2019s own language when this device has none remembered', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('bg-BG');
    visit('/');
    expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'bg') })).toBeInTheDocument();
  });

  it('remembers a language the learner picks there, so a reload keeps it', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    visit('/');
    await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'bg') });
    await userEvent.click(within(screen.getByRole('main')).getByRole('button', { name: /^English/ }));
    expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'en') })).toBeInTheDocument();
    expect(localStorage.getItem('satzwerk.lang')).toBe('en');
  });

  /*
   * The language used to be switched by the welcome screen itself, after it
   * had appeared: it showed English until the save came back, and a tap on
   * English or Start in that moment raced the save still in flight.
   */
  it('never shows the welcome in English while the device\u2019s language is being saved', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    let land = () => {};
    profileWriteGate = new Promise<void>((resolve) => (land = resolve));
    const titles: string[] = [];
    const watch = new MutationObserver(() => {
      for (const title of document.querySelectorAll('h1')) titles.push(title.textContent ?? '');
    });
    watch.observe(document.body, { childList: true, subtree: true, characterData: true });
    try {
      visit('/');
      await waitFor(() => expect(profileWrites).toEqual([{ teachingLanguage: 'bg' }]));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      // Still loading, and saying so in Bulgarian: there is nothing to tap yet.
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(document.documentElement.lang).toBe('bg');

      land();
      expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'bg') })).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('bg');
      expect(titles).not.toContain(tr('onboardingTitle', 'en'));
    } finally {
      watch.disconnect();
    }
  });

  it('shows what was saved when the device\u2019s language could not be', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    profileWriteGate = 'fail';
    visit('/');
    // The server still holds English, so the screen says so, and the
    // learner's own tap on Български is the next try.
    expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'en') })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('button', { name: /^English/ })).toHaveAttribute('aria-pressed', 'true');
  });

  /*
   * Only English is the server's default. A profile in Bulgarian was set by
   * somebody, on the welcome screen, perhaps on another phone, and stopping
   * there must not cost them that choice on a device that guesses English.
   */
  it('keeps a language somebody already chose for a profile not yet set up', async () => {
    localStorage.setItem('satzwerk.lang', 'en');
    profile = { teachingLanguage: 'bg', onboarded: false };
    visit('/');
    expect(await screen.findByRole('heading', { level: 1, name: tr('onboardingTitle', 'bg') })).toBeInTheDocument();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(profileWrites).toEqual([]);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(tr('onboardingTitle', 'bg'));
  });

  it('leaves alone a profile that is already set up', async () => {
    localStorage.setItem('satzwerk.lang', 'bg');
    profile = { teachingLanguage: 'en', onboarded: true };
    visit('/');
    await screen.findByRole('navigation');
    await waitFor(() => expect(localStorage.getItem('satzwerk.lang')).toBe('en'));
    expect(profileWrites).toEqual([]);
  });
});
