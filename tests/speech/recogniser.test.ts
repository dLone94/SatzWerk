import { describe, expect, it, vi } from 'vitest';
import { createSpeechRecogniser } from '../../src/services/speech/recogniser.ts';

/**
 * The recogniser is driven through a fake that behaves like the browser API,
 * because the real one needs a microphone and a user gesture. What is tested
 * here is the wiring the app owns: that a missing API is reported honestly
 * rather than thrown, that a refused microphone is distinguished from silence,
 * and that speech already heard is not thrown away when the recogniser ends
 * with an error.
 */

type Handler = ((event: never) => void) | null;

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  started = false;
  aborted = false;
  onresult: Handler = null;
  onerror: Handler = null;
  onend: Handler = null;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started = true;
  }
  stop() {
    this.emitEnd();
  }
  abort() {
    this.aborted = true;
  }

  /** Feed a final result, the way the browser does. */
  hear(transcript: string, confidence = 0.9) {
    (this.onresult as ((event: unknown) => void) | null)?.({
      resultIndex: 0,
      results: { length: 1, 0: { length: 1, isFinal: true, 0: { transcript, confidence } } },
    });
  }

  fail(error: string) {
    (this.onerror as ((event: unknown) => void) | null)?.({ error });
  }

  emitEnd() {
    (this.onend as (() => void) | null)?.();
  }
}

function scopeWith(name: 'SpeechRecognition' | 'webkitSpeechRecognition') {
  FakeRecognition.instances = [];
  return { [name]: FakeRecognition } as unknown;
}

describe('the speech recogniser', () => {
  it('reports itself unavailable where the browser has no recogniser', async () => {
    const recogniser = createSpeechRecogniser({});
    expect(recogniser.available).toBe(false);
    await expect(recogniser.listen()).resolves.toEqual({ error: 'unsupported' });
  });

  it('finds the prefixed constructor Safari uses', () => {
    expect(createSpeechRecogniser(scopeWith('webkitSpeechRecognition')).available).toBe(true);
    expect(createSpeechRecogniser(scopeWith('SpeechRecognition')).available).toBe(true);
  });

  it('listens in German unless told otherwise, and resolves with the transcript', async () => {
    const scope = scopeWith('SpeechRecognition');
    const recogniser = createSpeechRecogniser(scope);
    const pending = recogniser.listen();
    const instance = FakeRecognition.instances[0]!;
    expect(instance.lang).toBe('de-DE');
    expect(instance.started).toBe(true);
    instance.hear('Ich komme aus Bulgarien', 0.82);
    instance.emitEnd();
    await expect(pending).resolves.toEqual({
      transcript: 'Ich komme aus Bulgarien',
      confidence: 0.82,
    });
  });

  it('reports partial results while the speaker is still talking', async () => {
    const onPartial = vi.fn();
    const recogniser = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const pending = recogniser.listen({ onPartial });
    const instance = FakeRecognition.instances[0]!;
    expect(instance.interimResults).toBe(true);
    instance.hear('Ich komme');
    expect(onPartial).toHaveBeenCalledWith('Ich komme');
    instance.emitEnd();
    await pending;
  });

  it('tells a refused microphone apart from silence', async () => {
    const recogniser = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const denied = recogniser.listen();
    FakeRecognition.instances[0]!.fail('not-allowed');
    await expect(denied).resolves.toEqual({ error: 'denied' });

    const silent = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const quiet = silent.listen();
    FakeRecognition.instances[0]!.fail('no-speech');
    await expect(quiet).resolves.toEqual({ error: 'no-speech' });
  });

  /**
   * Safari ends a recognition with a no-speech error once the speaker pauses,
   * even when it heard the whole sentence. Discarding that would throw away a
   * correct answer the learner had already given.
   */
  it('keeps what it heard when the recogniser ends with a pause error', async () => {
    const recogniser = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const pending = recogniser.listen();
    const instance = FakeRecognition.instances[0]!;
    instance.hear('Es regnet');
    instance.fail('no-speech');
    await expect(pending).resolves.toMatchObject({ transcript: 'Es regnet' });
  });

  it('says so when it heard nothing at all', async () => {
    const recogniser = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const pending = recogniser.listen();
    FakeRecognition.instances[0]!.emitEnd();
    await expect(pending).resolves.toEqual({ error: 'no-match' });
  });

  it('abandons a previous listener rather than starting two', async () => {
    const recogniser = createSpeechRecogniser(scopeWith('SpeechRecognition'));
    const first = recogniser.listen();
    recogniser.listen();
    expect(FakeRecognition.instances[0]!.aborted).toBe(true);
    FakeRecognition.instances[0]!.emitEnd();
    await first;
  });
});
