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
  if (said.split(/[\s,/]+/).some((part) => part && !/[aeiouyäöü]/i.test(part))) return null;
  return said;
}
