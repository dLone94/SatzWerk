// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { createTtsProvider, rankVoices } from '../../src/services/tts/index.ts';

/**
 * The app used to take the first German voice a device listed. On an iPhone
 * that is often a novelty voice or the compact Anna, while a far better one
 * sits further down the list.
 */
const voice = (name: string, lang = 'de-DE') => ({ voiceURI: `uri:${name}`, name, lang });

// Roughly what an iPhone with one premium voice downloaded reports.
const IPHONE = [
  voice('Eddy (German (Germany))'),
  voice('Flo (German (Germany))'),
  voice('Grandma (German (Germany))'),
  voice('Anna'),
  voice('Helena'),
  voice('Rocko (German (Germany))'),
  voice('Anna (Premium)'),
  voice('Samantha', 'en-US'),
];

describe('picking a German voice', () => {
  it('puts a premium voice first', () => {
    expect(rankVoices(IPHONE)[0]!.name).toBe('Anna (Premium)');
    expect(rankVoices(IPHONE)[0]!.quality).toBe('premium');
  });

  it('never offers the novelty voices', () => {
    const names = rankVoices(IPHONE).map((option) => option.name);
    for (const joke of ['Eddy', 'Flo', 'Grandma', 'Rocko']) {
      expect(names.some((name) => name.startsWith(joke))).toBe(false);
    }
  });

  it('offers only German voices', () => {
    expect(rankVoices(IPHONE).every((option) => option.lang.startsWith('de'))).toBe(true);
  });

  it('prefers enhanced, natural and Google voices over the compact ones', () => {
    const ranked = rankVoices([
      voice('Anna'),
      voice('Google Deutsch'),
      voice('Microsoft Katja Online (Natural) - German (Germany)'),
      voice('Petra (Enhanced)'),
    ]).map((option) => option.name);
    expect(ranked).toEqual([
      'Petra (Enhanced)',
      'Microsoft Katja Online (Natural) - German (Germany)',
      'Google Deutsch',
      'Anna',
    ]);
  });

  it('still speaks German when only a basic voice is there', () => {
    const ranked = rankVoices([voice('Eddy (German (Germany))'), voice('Anna')]);
    expect(ranked.map((option) => option.name)).toEqual(['Anna']);
    expect(ranked[0]!.quality).toBe('basic');
  });
});

describe('the voice the app actually speaks with', () => {
  const spoken: Array<{ voice: { name: string } | null }> = [];

  function fakeDevice() {
    spoken.length = 0;
    const synth = {
      getVoices: () => IPHONE,
      speak: (utterance: { voice: { name: string } | null }) => spoken.push(utterance),
      cancel: () => {},
      addEventListener: () => {},
      onvoiceschanged: null,
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
    (globalThis as Record<string, unknown>).SpeechSynthesisUtterance = class {
      voice: unknown = null;
      lang = '';
      rate = 1;
      constructor(public text: string) {}
      addEventListener() {}
    };
  }

  afterEach(() => window.localStorage.clear());

  it('is the best one, not the first one listed', () => {
    fakeDevice();
    createTtsProvider().speak('Guten Tag');
    expect(spoken[0]!.voice!.name).toBe('Anna (Premium)');
  });

  it('is the one chosen in Settings, on this device, from then on', () => {
    fakeDevice();
    createTtsProvider().chooseVoice!('uri:Helena');
    createTtsProvider().speak('Guten Tag');
    expect(spoken[0]!.voice!.name).toBe('Helena');
  });

  it('goes back to the best one when set to automatic', () => {
    fakeDevice();
    const tts = createTtsProvider();
    tts.chooseVoice!('uri:Helena');
    tts.chooseVoice!(null);
    tts.speak('Guten Tag');
    expect(spoken[0]!.voice!.name).toBe('Anna (Premium)');
  });
});
