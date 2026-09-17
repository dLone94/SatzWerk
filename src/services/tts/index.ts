/**
 * Text-to-speech, behind a provider interface.
 *
 * The app never talks to `window.speechSynthesis` directly. Swapping in a
 * higher-quality German voice later means writing one more class that
 * implements `TtsProvider` and returning it from `createTtsProvider`.
 */

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

class BrowserSpeechProvider implements TtsProvider {
  readonly id = 'browser-speech-synthesis';

  private voice: SpeechSynthesisVoice | null = null;

  constructor(private readonly synth: SpeechSynthesis) {
    this.pickVoice();
    // Voices often arrive asynchronously on first load.
    if ('onvoiceschanged' in synth) {
      synth.addEventListener('voiceschanged', () => this.pickVoice());
    }
  }

  get available(): boolean {
    return true;
  }

  private pickVoice(): void {
    const voices = this.synth.getVoices();
    this.voice =
      voices.find((voice) => voice.lang === DEFAULT_LANG) ??
      voices.find((voice) => voice.lang.startsWith('de')) ??
      null;
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
  if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return nullTtsProvider;
  return new BrowserSpeechProvider(synth);
}
