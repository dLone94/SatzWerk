/**
 * Every German phrase the app can read aloud, with its recording name.
 *
 *   node scripts/audio/phrases.ts > phrases.json
 *
 * The voice workflow records whatever this lists and deletes recordings of
 * anything it no longer lists. It errs on the side of listing too much: a
 * spare recording costs a few kilobytes, a missing one falls back to the
 * phone's voice.
 */
import {
  PLACEMENT_CHECKPOINT,
  allCheckpoints,
  allLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import { SCENARIO_SCRIPTS } from '../../src/content/scenarios/index.ts';
import { VOCABULARY } from '../../src/content/vocabulary.ts';
import { SAMPLE_PHRASE, normalizePhrase, phraseKey } from '../../src/services/tts/phraseKey.ts';

/** Fields whose string value is German that a button may read out. */
const SPOKEN_FIELDS = new Set(['de', 'promptDe', 'display', 'plural']);

export function collectPhrases(): Map<string, string> {
  const phrases = new Map<string, string>();
  const add = (text: unknown) => {
    if (typeof text !== 'string') return;
    const clean = normalizePhrase(text);
    if (clean) phrases.set(phraseKey(clean), clean);
  };

  const seen = new Set<object>();
  const walk = (value: unknown): void => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const record = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(record)) {
      if (typeof child === 'string' && SPOKEN_FIELDS.has(key)) add(child);
      else walk(child);
    }
    // A dictation's hidden sentence, and the answer shown back after a
    // mistake (feedback, the mistake bank) — both read out.
    if (record.audio && typeof record.audio === 'object') add((record.audio as { text?: unknown }).text);
    if (record.answer && typeof record.answer === 'object') {
      for (const accepted of (record.answer as { accepted?: unknown[] }).accepted ?? []) add(accepted);
    }
  };

  for (const lesson of allLessons()) {
    walk(lesson);
    lessonExercises(lesson).forEach(walk);
  }
  allCheckpoints().forEach(walk);
  walk(PLACEMENT_CHECKPOINT);
  walk(SCENARIO_SCRIPTS);
  for (const entry of VOCABULARY) {
    walk(entry);
    // The word page reads the perfect as one phrase: "hat gemacht".
    if (entry.perfect) add(`${entry.perfect.auxiliary === 'sein' ? 'ist' : 'hat'} ${entry.perfect.participle}`);
  }
  add(SAMPLE_PHRASE);
  return phrases;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = [...collectPhrases()].map(([key, text]) => ({ key, text })).sort((a, b) => a.key.localeCompare(b.key));
  process.stdout.write(`${JSON.stringify(list, null, 1)}\n`);
}
