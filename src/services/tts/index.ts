/**
 * Text-to-speech, behind a provider interface.
 *
 * The app never talks to `window.speechSynthesis` directly. Swapping in a
 * higher-quality German voice later means writing one more class that
 * implements `TtsProvider` and returning it from `createTtsProvider`.
 */

import { RecordedTtsProvider } from './recorded.ts';

export interface SpeakOptions {
  /** 1 = normal. The UI offers a slow setting for dictation. */
  rate?: number;
  lang?: string;
  onEnd?: () => void;
}

export interface TtsProvider {
  readonly id: string;
  /** False when this environment cannot speak, so the UI can hide the button. */
  readonly available: boolean;
  /** Human-readable description of the voice actually in use. */
  describe(): string;
  speak(text: string, options?: SpeakOptions): void;
  cancel(): void;
  /** The German voices this device offers, best first. Optional: a test double need not have any. */
  voices?(): VoiceOption[];
  /** The id of the voice chosen by hand, or null when the app picks. */
  chosenVoice?(): string | null;
  /** Choose a voice by id, or null to let the app pick the best one again. */
  chooseVoice?(id: string | null): void;
  /** Voices arrive after the page loads on most browsers; this says when. */
  subscribe?(listener: () => void): () => void;
}

/** How good a voice is likely to sound, from what its name gives away. */
export type VoiceQuality = 'premium' | 'good' | 'basic';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  quality: VoiceQuality;
}

export const DEFAULT_LANG = 'de-DE';
export const SLOW_RATE = 0.65;
export const NORMAL_RATE = 0.95;

/** Used in tests, during SSR and when the browser has no speech support. */
export const nullTtsProvider: TtsProvider = {
  id: 'none',
  available: false,
  describe: () => 'No speech support in this browser',
  speak: (_text, options) => options?.onEnd?.(),
  cancel: () => undefined,
};

/*
 * Choosing a voice.
 *
 * The app used to take the first German voice the device listed. On an
 * iPhone that is as likely as not one of Apple's novelty voices (Eddy,
 * Grandma, Rocko...) or the compact Anna, which is where "the voice sounds
 * like a robot" came from — while a far better voice was often installed a
 * few rows further down. Voices say little about themselves, but their names
 * give the quality away, so they are ranked on that.
 */

/** Apple's joke and retro voices, which ship in every language. Never picked. */
const NOVELTY = new Set(
  [
    'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'eddy', 'flo', 'fred',
    'good news', 'grandma', 'grandpa', 'jester', 'junior', 'kathy', 'organ', 'ralph', 'reed',
    'rocko', 'sandy', 'shelley', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
  ],
);

interface VoiceLike {
  voiceURI: string;
  name: string;
  lang: string;
}

function baseName(name: string): string {
  // "Eddy (German (Germany))" and "Eddy" are the same voice.
  return name.replace(/\s*\(.*$/, '').trim().toLowerCase();
}

function score(voice: VoiceLike): { score: number; quality: VoiceQuality } {
  // Safari on an iPhone calls the compact and the downloaded Anna both just
  // "Anna"; which is which is only in the id (com.apple.voice.premium.de-DE.Anna).
  const name = `${voice.name} ${voice.voiceURI}`;
  let points = 0;
  let quality: VoiceQuality = 'basic';
  if (/premium/i.test(name)) {
    points = 100;
    quality = 'premium';
  } else if (/enhanced|verbessert|erweitert/i.test(name)) {
    points = 85;
    quality = 'premium';
  } else if (/natural|neural|online/i.test(name)) {
    points = 75;
    quality = 'premium';
  } else if (/google/i.test(name)) {
    points = 60;
    quality = 'good';
  }
  if (voice.lang.replace('_', '-') === DEFAULT_LANG) points += 3;
  return { score: points, quality };
}

/** German voices, best first, with the novelty ones left out entirely. */
export function rankVoices(voices: readonly VoiceLike[]): VoiceOption[] {
  return voices
    .filter((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith('de'))
    .filter((voice) => !NOVELTY.has(baseName(voice.name)))
    .map((voice) => ({ voice, ...score(voice) }))
    .sort((a, b) => b.score - a.score || a.voice.name.localeCompare(b.voice.name))
    .map(({ voice, quality }) => ({ id: voice.voiceURI, name: voice.name, lang: voice.lang, quality }));
}

/** The chosen voice belongs to this device, so it is kept on this device. */
const CHOICE_KEY = 'satzwerk.voice';

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(CHOICE_KEY);
  } catch {
    return null;
  }
}

function writeChoice(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(CHOICE_KEY, id);
    else window.localStorage.removeItem(CHOICE_KEY);
  } catch {
    // Private mode: the choice lasts until the page is closed, which is fine.
  }
}

class BrowserSpeechProvider implements TtsProvider {
  readonly id = 'browser-speech-synthesis';

  private voice: SpeechSynthesisVoice | null = null;
  private choice: string | null = readChoice();
  private readonly listeners = new Set<() => void>();

  constructor(private readonly synth: SpeechSynthesis) {
    this.pickVoice();
    // Voices often arrive asynchronously on first load.
    if ('onvoiceschanged' in synth) {
      synth.addEventListener('voiceschanged', () => {
        this.pickVoice();
        for (const listener of this.listeners) listener();
      });
    }
  }

  get available(): boolean {
    return true;
  }

  private pickVoice(): void {
    const all = this.synth.getVoices();
    const ranked = rankVoices(all);
    const id = ranked.some((option) => option.id === this.choice) ? this.choice : ranked[0]?.id;
    this.voice = all.find((voice) => voice.voiceURI === id) ?? null;
  }

  voices(): VoiceOption[] {
    return rankVoices(this.synth.getVoices());
  }

  chosenVoice(): string | null {
    return this.choice;
  }

  chooseVoice(id: string | null): void {
    this.choice = id;
    writeChoice(id);
    this.pickVoice();
    for (const listener of this.listeners) listener();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  describe(): string {
    if (this.voice) return `${this.voice.name} (${this.voice.lang})`;
    return 'Browser default voice, requested as de-DE';
  }

  speak(text: string, options: SpeakOptions = {}): void {
    if (!text.trim()) return;
    this.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? DEFAULT_LANG;
    utterance.rate = options.rate ?? NORMAL_RATE;
    if (this.voice) utterance.voice = this.voice;
    if (options.onEnd) {
      utterance.addEventListener('end', options.onEnd);
      utterance.addEventListener('error', options.onEnd);
    }
    this.synth.speak(utterance);
  }

  cancel(): void {
    this.synth.cancel();
  }
}

export function createTtsProvider(): TtsProvider {
  if (typeof window === 'undefined') return nullTtsProvider;
  const synth = window.speechSynthesis;
  const device =
    synth && typeof SpeechSynthesisUtterance !== 'undefined' ? new BrowserSpeechProvider(synth) : nullTtsProvider;
  // Recorded phrases first, wherever the browser can play audio at all.
  if (typeof Audio === 'undefined') return device;
  return new RecordedTtsProvider(device);
}
