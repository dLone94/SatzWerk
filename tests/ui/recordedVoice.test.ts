import { describe, expect, it, vi } from 'vitest';
import { collectPhrases } from '../../scripts/audio/phrases.ts';
import { SCENARIO_SCRIPTS } from '../../src/content/scenarios/index.ts';
import { lessonById } from '../../src/content/index.ts';
import { VOCABULARY } from '../../src/content/vocabulary.ts';
import { NORMAL_RATE, SLOW_RATE, type TtsProvider } from '../../src/services/tts/index.ts';
import { SAMPLE_PHRASE, phraseKey } from '../../src/services/tts/phraseKey.ts';
import { RECORDED_VOICE_ID, RecordedTtsProvider } from '../../src/services/tts/recorded.ts';

/**
 * Recorded German, played before the device voice, and the device voice for
 * anything without a recording, so a button never stays silent.
 */

class FakeAudio {
  static made: FakeAudio[] = [];
  playbackRate = 1;
  preservesPitch?: boolean;
  paused = false;
  private listeners: Record<string, Array<() => void>> = {};
  constructor(
    public src: string,
    private readonly fails = false,
  ) {
    FakeAudio.made.push(this);
  }
  play() {
    return this.fails ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  addEventListener(type: string, listener: () => void) {
    (this.listeners[type] ??= []).push(listener);
  }
  fire(type: string) {
    for (const listener of this.listeners[type] ?? []) listener();
  }
}

function device(chosen: string | null = null) {
  const spoken: string[] = [];
  let choice = chosen;
  const tts: TtsProvider = {
    id: 'device',
    available: true,
    describe: () => 'Anna',
    speak: (text, options) => {
      spoken.push(text);
      options?.onEnd?.();
    },
    cancel: () => {},
    voices: () => [{ id: 'anna', name: 'Anna', lang: 'de-DE', quality: 'basic' }],
    chosenVoice: () => choice,
    chooseVoice: (id) => {
      choice = id;
    },
  };
  return { tts, spoken };
}

async function recorded(keys: string[], chosen: string | null = null, fails = false) {
  FakeAudio.made = [];
  const fallback = device(chosen);
  const provider = new RecordedTtsProvider(
    fallback.tts,
    async () => ({ voice: 'Thorsten (Piper)', keys }),
    (src) => new FakeAudio(src, fails),
  );
  await Promise.resolve();
  await Promise.resolve();
  return { provider, spoken: fallback.spoken };
}

describe('the recorded voice', () => {
  it('plays the recording of a phrase that has one', async () => {
    const { provider, spoken } = await recorded([phraseKey('Guten Tag')]);
    provider.speak('Guten Tag');
    expect(FakeAudio.made).toHaveLength(1);
    expect(FakeAudio.made[0]!.src).toBe(`/audio/de/${phraseKey('Guten Tag')}.mp3`);
    expect(spoken).toEqual([]);
  });

  it('hands a phrase without a recording to the device voice', async () => {
    const { provider, spoken } = await recorded([phraseKey('Guten Tag')]);
    provider.speak('Ein ganz neuer Satz.');
    expect(FakeAudio.made).toHaveLength(0);
    expect(spoken).toEqual(['Ein ganz neuer Satz.']);
  });

  it('still says it when the recording will not play', async () => {
    const { provider, spoken } = await recorded([phraseKey('Guten Tag')], null, true);
    provider.speak('Guten Tag');
    await vi.waitFor(() => expect(spoken).toEqual(['Guten Tag']));
  });

  it('slows down in proportion for the slow button', async () => {
    const { provider } = await recorded([phraseKey('Guten Tag')]);
    provider.speak('Guten Tag', { rate: SLOW_RATE });
    expect(FakeAudio.made[0]!.playbackRate).toBeCloseTo(SLOW_RATE / NORMAL_RATE);
    expect(FakeAudio.made[0]!.preservesPitch).toBe(true);
  });

  it('says when it has finished', async () => {
    const { provider } = await recorded([phraseKey('Guten Tag')]);
    const onEnd = vi.fn();
    provider.speak('Guten Tag', { onEnd });
    FakeAudio.made[0]!.fire('ended');
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('stops the one playing when another starts', async () => {
    const { provider } = await recorded([phraseKey('Guten Tag'), phraseKey('der Tisch')]);
    provider.speak('Guten Tag');
    provider.speak('der Tisch');
    expect(FakeAudio.made[0]!.paused).toBe(true);
  });

  it('steps aside when a device voice was chosen by hand', async () => {
    const { provider, spoken } = await recorded([phraseKey('Guten Tag')], 'anna');
    provider.speak('Guten Tag');
    expect(FakeAudio.made).toHaveLength(0);
    expect(spoken).toEqual(['Guten Tag']);
  });

  it('is offered first in the voice list, and chosen by default', async () => {
    const { provider } = await recorded([phraseKey('Guten Tag')]);
    expect(provider.voices()[0]).toMatchObject({ id: RECORDED_VOICE_ID, quality: 'premium' });
    expect(provider.describe()).toBe('Thorsten (Piper)');
  });

  it('is simply absent before the first recording run', async () => {
    FakeAudio.made = [];
    const fallback = device();
    const provider = new RecordedTtsProvider(fallback.tts, async () => null, (src) => new FakeAudio(src));
    await Promise.resolve();
    provider.speak('Guten Tag');
    expect(fallback.spoken).toEqual(['Guten Tag']);
    expect(provider.voices().map((voice) => voice.id)).toEqual(['anna']);
  });
});

describe('the phrases sent for recording', () => {
  const phrases = new Set(collectPhrases().values());

  it('include what a lesson reads out and expects as an answer', () => {
    const lesson = lessonById('pre-a1-u2-l4')!;
    const answer = lesson.mastery.exercises[0]!.steps[0]!.answer.accepted[0]!;
    expect(phrases.has(answer)).toBe(true);
  });

  it('include every line the other person says in a scenario', () => {
    const lines = SCENARIO_SCRIPTS.flatMap((script) => script.beats)
      .filter((beat) => beat.who === 'them')
      .map((beat) => (beat as { de: string }).de);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) expect(phrases.has(line.replace(/\s+/g, ' ').trim()), line).toBe(true);
  });

  it('include every word, its plural and its perfect', () => {
    for (const entry of VOCABULARY) {
      expect(phrases.has(entry.display), entry.display).toBe(true);
      if (entry.plural) expect(phrases.has(entry.plural), entry.plural).toBe(true);
      if (entry.perfect) {
        const perfect = `${entry.perfect.auxiliary === 'sein' ? 'ist' : 'hat'} ${entry.perfect.participle}`;
        expect(phrases.has(perfect), perfect).toBe(true);
      }
    }
  });

  it('include the sample on the Settings page', () => {
    expect(phrases.has(SAMPLE_PHRASE)).toBe(true);
  });

  it('name each phrase the same way the app looks it up', () => {
    // Extra spaces must not make a recording unfindable.
    expect(phraseKey('Guten  Tag ')).toBe(phraseKey('Guten Tag'));
    expect(phraseKey('Guten Tag.')).not.toBe(phraseKey('Guten Tag'));
  });
});
