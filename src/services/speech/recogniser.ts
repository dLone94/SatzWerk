/**
 * Speech recognition in the browser.
 *
 * This is the one speech feature that can be honest without a server: iOS
 * Safari and Chrome both ship a recogniser, and it returns a transcript rather
 * than audio. That shape does not fit the AudioRecorder / SpeechToText pair in
 * `index.ts` — those describe a record-then-send-somewhere design, which is
 * what a server-side recogniser would need — so this gets its own interface
 * instead of being forced into theirs.
 *
 * What this is NOT: a pronunciation score. A recogniser tells you whether a
 * machine trained on native speech understood you, which is a real and useful
 * signal, and it is not the same as a phoneme-level assessment of your accent.
 * It can also mishear you for reasons that are its fault rather than yours.
 * The UI says so, because a number that looked like an accent score would be
 * exactly the kind of invented statistic this app refuses to display.
 */

export type RecognitionError =
  | 'unsupported'
  | 'denied'
  | 'no-speech'
  | 'no-match'
  | 'network'
  | 'aborted'
  | 'failed';

export interface RecognitionResult {
  transcript?: string;
  /** The recogniser's own confidence, 0..1, when it reports one. */
  confidence?: number;
  error?: RecognitionError;
}

export interface SpeechRecogniser {
  readonly available: boolean;
  /** Listen once and resolve when the speaker stops. */
  listen(options?: ListenOptions): Promise<RecognitionResult>;
  /** Stop listening early; the promise from `listen` still resolves. */
  stop(): void;
}

export interface ListenOptions {
  /** BCP-47 tag. German content is always recognised as German. */
  lang?: string;
  /** Called with the running transcript, so the UI can show words as they land. */
  onPartial?: (text: string) => void;
}

/* ------------------------------------------------------------------ *
 * The browser API, typed narrowly
 *
 * SpeechRecognition is not in the DOM lib under the prefix Safari uses, and
 * the standard type is not present in every TypeScript version. Only the parts
 * this module touches are declared, so nothing here depends on a lib change.
 * ------------------------------------------------------------------ */

interface BrowserRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface BrowserRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: BrowserRecognitionAlternative;
}

interface BrowserRecognitionResultList {
  readonly length: number;
  [index: number]: BrowserRecognitionResult;
}

interface BrowserRecognitionEvent {
  resultIndex: number;
  results: BrowserRecognitionResultList;
}

interface BrowserRecognitionErrorEvent {
  error: string;
}

interface BrowserRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: BrowserRecognitionEvent) => void) | null;
  onerror: ((event: BrowserRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => BrowserRecognition;

function constructorFor(scope: unknown): RecognitionConstructor | undefined {
  const w = scope as Record<string, unknown> | undefined;
  if (!w) return undefined;
  // Safari, including on iOS, only exposes the prefixed name.
  const found = w['SpeechRecognition'] ?? w['webkitSpeechRecognition'];
  return typeof found === 'function' ? (found as RecognitionConstructor) : undefined;
}

/** The errors the API reports, mapped to the ones this app can explain. */
function mapError(raw: string): RecognitionError {
  switch (raw) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'denied';
    case 'no-speech':
      return 'no-speech';
    case 'aborted':
      return 'aborted';
    case 'network':
      return 'network';
    case 'audio-capture':
      return 'denied';
    default:
      return 'failed';
  }
}

const unavailable: SpeechRecogniser = {
  available: false,
  async listen() {
    return { error: 'unsupported' };
  },
  stop() {},
};

/**
 * A recogniser, or an honest stand-in that says it is not available.
 *
 * `scope` is injectable so the tests can drive a fake without a browser.
 */
export function createSpeechRecogniser(scope: unknown = globalThis): SpeechRecogniser {
  const Recognition = constructorFor(scope);
  if (!Recognition) return unavailable;

  let active: BrowserRecognition | null = null;

  return {
    available: true,

    stop() {
      active?.stop();
    },

    listen(options: ListenOptions = {}): Promise<RecognitionResult> {
      // One listener at a time: a second start() on a live recogniser throws in
      // Chrome and silently does nothing in Safari.
      active?.abort();

      const recognition = new Recognition();
      active = recognition;
      recognition.lang = options.lang ?? 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = Boolean(options.onPartial);
      recognition.maxAlternatives = 1;

      return new Promise<RecognitionResult>((resolve) => {
        let best: RecognitionResult = {};
        let settled = false;

        const finish = (result: RecognitionResult) => {
          if (settled) return;
          settled = true;
          active = null;
          resolve(result);
        };

        recognition.onresult = (event) => {
          let text = '';
          let confidence: number | undefined;
          for (let i = 0; i < event.results.length; i += 1) {
            const alternative = event.results[i]?.[0];
            if (!alternative) continue;
            text += alternative.transcript;
            if (event.results[i]?.isFinal) confidence = alternative.confidence;
          }
          const trimmed = text.trim();
          if (!trimmed) return;
          best = { transcript: trimmed, ...(confidence === undefined ? {} : { confidence }) };
          options.onPartial?.(trimmed);
        };

        recognition.onerror = (event) => {
          const error = mapError(event.error);
          // A no-speech error after something was heard is not a failure: the
          // speaker simply stopped. Keep what was already recognised.
          if (best.transcript && (error === 'no-speech' || error === 'aborted')) {
            finish(best);
            return;
          }
          finish({ error });
        };

        recognition.onend = () => {
          finish(best.transcript ? best : { error: 'no-match' });
        };

        try {
          recognition.start();
        } catch {
          finish({ error: 'failed' });
        }
      });
    },
  };
}
