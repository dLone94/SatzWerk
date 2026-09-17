/**
 * Speaking and pronunciation: interfaces only, deliberately.
 *
 * Milestone 1 ships no speech evaluation. These types exist so that the
 * exercise player, the review queue and the conversation mode can be written
 * against a stable shape, and so nothing in the UI has to be restructured when
 * a real recogniser is added.
 *
 * Nothing here claims to score pronunciation. `createSpeechServices` returns
 * implementations that report `available: false`, and the UI must label the
 * feature as planned rather than pretending.
 */

export interface Recording {
  blob: Blob;
  durationMs: number;
  mimeType: string;
}

export interface AudioRecorder {
  readonly available: boolean;
  start(): Promise<void>;
  stop(): Promise<Recording>;
  cancel(): void;
}

export interface TranscriptionResult {
  available: boolean;
  transcript?: string;
  confidence?: number;
}

export interface SpeechToText {
  readonly available: boolean;
  transcribe(recording: Recording, lang?: string): Promise<TranscriptionResult>;
}

export interface PronunciationFeedback {
  available: boolean;
  /** 0..1 overall similarity to the expected utterance. */
  score?: number;
  missingWords?: string[];
  extraWords?: string[];
  /** Words whose pronunciation needs work. */
  problemWords?: string[];
}

export interface PronunciationScorer {
  readonly available: boolean;
  score(input: { expected: string; recording: Recording }): Promise<PronunciationFeedback>;
}

export interface SpeechServices {
  recorder: AudioRecorder;
  stt: SpeechToText;
  scorer: PronunciationScorer;
}

const unavailableRecorder: AudioRecorder = {
  available: false,
  async start() {
    throw new Error('Recording is not implemented in this milestone.');
  },
  async stop() {
    throw new Error('Recording is not implemented in this milestone.');
  },
  cancel() {},
};

const unavailableStt: SpeechToText = {
  available: false,
  async transcribe() {
    return { available: false };
  },
};

const unavailableScorer: PronunciationScorer = {
  available: false,
  async score() {
    return { available: false };
  },
};

/**
 * A browser MediaRecorder implementation would slot in here. It is left out of
 * Milestone 1 on purpose: recording audio the app cannot yet evaluate would be
 * a feature that looks finished and is not.
 */
export function createSpeechServices(): SpeechServices {
  return { recorder: unavailableRecorder, stt: unavailableStt, scorer: unavailableScorer };
}

export const SPEECH_ROADMAP = {
  recording: 'planned',
  speechToText: 'planned',
  pronunciationScoring: 'planned',
  conversation: 'planned',
} as const;
