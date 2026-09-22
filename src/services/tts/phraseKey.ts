/**
 * The name of a recorded phrase.
 *
 * The recording script and the app must arrive at the same name for the same
 * German text, without either keeping a list the other has to read first, so
 * the name is a hash of the text itself. The text is tidied first — spacing
 * only; case and punctuation change how a sentence is spoken and stay as they
 * are.
 */

/** Played on the Settings page to try the voice; recorded like every other phrase. */
export const SAMPLE_PHRASE = 'Guten Tag! Ich heiße SatzWerk.';

export function normalizePhrase(text: string): string {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim();
}

/** cyrb53: small, fast, and with no collisions in practice at a few thousand phrases. */
function cyrb53(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function phraseKey(text: string): string {
  return cyrb53(normalizePhrase(text));
}
