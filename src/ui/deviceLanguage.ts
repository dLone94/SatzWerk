import type { TeachingLanguage } from '../content/types.ts';

/**
 * The teaching language, remembered on this device.
 *
 * The language lives in the learner's profile on the server, so until that
 * profile has loaded the app did not know it and spoke English: the loading
 * line, the "No connection" screen — exactly when a Bulgarian learner most
 * needs to read that their answers are safe — and the password prompt. The
 * last language used here is kept so those screens can speak it too. The
 * server's profile stays the truth once it arrives.
 *
 * Storage can throw (Safari's private mode) or come back empty; either way the
 * browser's own language is the guess, and English after that.
 */

const KEY = 'satzwerk.lang';

export function deviceLanguage(): TeachingLanguage {
  try {
    const stored = globalThis.localStorage?.getItem(KEY);
    if (stored === 'en' || stored === 'bg') return stored;
  } catch {
    // No storage: fall through to the browser's language.
  }
  const browser = typeof navigator === 'undefined' ? '' : (navigator.language ?? '');
  return browser.toLowerCase().startsWith('bg') ? 'bg' : 'en';
}

export function rememberLanguage(lang: TeachingLanguage): void {
  try {
    globalThis.localStorage?.setItem(KEY, lang);
  } catch {
    // Not remembered; the next cold start guesses from the browser instead.
  }
}

/**
 * The page's language, for VoiceOver's voice, hyphenation and the Cyrillic
 * letter shapes: every Bulgarian string used to inherit lang="en" from the
 * page. German keeps its own lang="de" where it appears.
 */
export function markPageLanguage(lang: TeachingLanguage): void {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}
