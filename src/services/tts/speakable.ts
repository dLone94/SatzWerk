/**
 * The part of a German table cell worth saying aloud: the word before any
 * respelling ("wohnen — VOH-nen"), and nothing for an ending ("-st") or a
 * single letter, which a voice would read out as the letter's name.
 *
 * Its own module, not a helper inside the component that draws the tables,
 * because the list of phrases sent for recording (scripts/audio/phrases.ts)
 * runs under plain Node and has to ask exactly the same question. When the two
 * disagreed, half the play buttons in grammar tables had no recording and
 * spoke in the phone's voice instead.
 */
export function speakable(cell: string): string | null {
  const said = cell.split(/\s+[—–]\s+/)[0]!.replace(/[*_`]/g, '').trim();
  if (said.startsWith('-') || said.startsWith('…')) return null;
  if ((said.match(/\p{L}/gu) ?? []).length < 2) return null;
  // A letter group ("sch", "st, sp") is not a word a voice can say.
  const parts = said.split(/[\s,/]+/).filter(Boolean);
  if (parts.some((part) => !/[aeiouyäöü]/i.test(part))) return null;
  // Nor are vowels alone ("ei", "eu, äu"): a voice says them as a word or
  // spells them, and "ae", "oe", "ue" are how to type ä, ö, ü, not sounds.
  // The example beside each one is the word to hear.
  if (parts.every((part) => /^[aeiouyäöü]+$/i.test(part))) return null;
  return said;
}

/**
 * The German examples in a table cell written for both teaching paths, such
 * as "wohnen — VOH-nen" and "wohnen — „ВО-нен“": the words before each dash.
 *
 * Only where the two paths agree on them, which is what says they are German.
 * An explanation ("at the doctor's — no contraction") differs between the
 * paths and has none. The sounds lesson writes its examples this way so each
 * can carry a respelling for its reader, and they had no play button at all.
 */
export function examplesIn(cell: { en: string; bg: string }): string[] {
  const en = splitExamples(cell.en)?.map((example) => example.de);
  const bg = splitExamples(cell.bg)?.map((example) => example.de);
  if (!en || !bg || en.join('\n') !== bg.join('\n')) return [];
  return en;
}

/** "lesen — LAY-zen, sieben — ZEE-ben" as its examples, or null if it is not a list of them. */
export function splitExamples(text: string): Array<{ de: string; rest: string }> | null {
  const examples: Array<{ de: string; rest: string }> = [];
  for (const part of text.split(/,\s+/)) {
    const match = /^(.+?)\s+[—–]\s+(.+)$/s.exec(part);
    if (!match) return null;
    examples.push({ de: match[1]!.trim(), rest: match[2]! });
  }
  return examples;
}
