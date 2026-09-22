import { NORMAL_RATE, type SpeakOptions, type TtsProvider, type VoiceOption } from './index.ts';
import { phraseKey } from './phraseKey.ts';

/**
 * Recorded German, played before any device voice is asked.
 *
 * Every phrase in the course is recorded ahead of time with an open-source
 * voice (see scripts/audio), so it sounds the same, and human, on every
 * phone. The recordings are fetched one at a time as they are played and the
 * service worker keeps them, so a phrase heard once is there offline.
 *
 * Anything without a recording — a phrase added since the last recording
 * run, or a clip that fails to load — is handed to the device voice, so the
 * button always says something.
 */

export const RECORDED_VOICE_ID = 'recorded';
export const AUDIO_BASE = '/audio/de';

export interface RecordingManifest {
  voice: string;
  keys: string[];
}

interface PlayableAudio {
  playbackRate: number;
  preservesPitch?: boolean;
  play(): Promise<void>;
  pause(): void;
  addEventListener(type: 'ended' | 'error', listener: () => void): void;
}

export async function fetchManifest(): Promise<RecordingManifest | null> {
  try {
    const response = await fetch(`${AUDIO_BASE}/manifest.json`);
    if (!response.ok) return null;
    // Before the first recording run the host answers with the app's own page
    // instead, which is not JSON: that simply means there are no recordings.
    const body = (await response.json()) as Partial<RecordingManifest>;
    if (!Array.isArray(body.keys) || typeof body.voice !== 'string') return null;
    return { voice: body.voice, keys: body.keys.filter((key): key is string => typeof key === 'string') };
  } catch {
    return null;
  }
}

export class RecordedTtsProvider implements TtsProvider {
  readonly id: string;
  private keys: Set<string> | null = null;
  private voiceLabel = '';
  private current: PlayableAudio | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly fallback: TtsProvider,
    load: () => Promise<RecordingManifest | null> = fetchManifest,
    private readonly makeAudio: (src: string) => PlayableAudio = (src) => new Audio(src),
  ) {
    this.id = `recorded+${fallback.id}`;
    void load().then((manifest) => {
      if (!manifest || manifest.keys.length === 0) return;
      this.keys = new Set(manifest.keys);
      this.voiceLabel = manifest.voice;
      this.notify();
    });
  }

  get available(): boolean {
    return this.fallback.available || (this.keys?.size ?? 0) > 0;
  }

  /** Recordings are used unless a device voice was chosen by hand. */
  private useRecordings(): boolean {
    if (!this.keys) return false;
    const chosen = this.fallback.chosenVoice?.() ?? null;
    return chosen === null || chosen === RECORDED_VOICE_ID;
  }

  voices(): VoiceOption[] {
    const device = this.fallback.voices?.() ?? [];
    if (!this.keys) return device;
    return [{ id: RECORDED_VOICE_ID, name: this.voiceLabel, lang: 'de-DE', quality: 'premium' }, ...device];
  }

  chosenVoice(): string | null {
    return this.fallback.chosenVoice?.() ?? null;
  }

  chooseVoice(id: string | null): void {
    // The device voice keeps the choice. "recorded" is not one of its voices,
    // so for anything without a recording it simply uses its best one.
    this.fallback.chooseVoice?.(id);
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    const off = this.fallback.subscribe?.(listener);
    return () => {
      this.listeners.delete(listener);
      off?.();
    };
  }

  describe(): string {
    return this.useRecordings() ? this.voiceLabel : this.fallback.describe();
  }

  speak(text: string, options: SpeakOptions = {}): void {
    if (!text.trim()) return;
    this.cancel();
    const key = phraseKey(text);
    if (!this.useRecordings() || !this.keys!.has(key)) {
      this.fallback.speak(text, options);
      return;
    }

    const audio = this.makeAudio(`${AUDIO_BASE}/${key}.mp3`);
    // The recordings are made at a learner's pace; "slow" slows them further
    // by the same proportion the device voice would be slowed.
    audio.playbackRate = (options.rate ?? NORMAL_RATE) / NORMAL_RATE;
    audio.preservesPitch = true;
    this.current = audio;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (this.current === audio) this.current = null;
      options.onEnd?.();
    };
    // A clip that will not load or play still gets said, by the device voice.
    const fallBack = () => {
      if (settled || this.current !== audio) return;
      settled = true;
      this.current = null;
      this.fallback.speak(text, options);
    };
    audio.addEventListener('ended', finish);
    audio.addEventListener('error', fallBack);
    audio.play().catch(fallBack);
  }

  cancel(): void {
    this.current?.pause();
    this.current = null;
    this.fallback.cancel();
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}
