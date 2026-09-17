/**
 * Text utilities for German answer checking.
 *
 * Everything here is pure and side-effect free so it can be unit tested and
 * reused by the server (mistake bank analysis) as well as the browser.
 */

/** Characters we treat as sentence punctuation and may forgive. */
const PUNCTUATION = /[.,!?;:…„“”‚‘’"'«»()[\]]/g;

/** Unicode-normalise and collapse whitespace. Never changes letters. */
export function tidy(input: string): string {
  return input.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export function stripPunctuation(input: string): string {
  // Keep hyphens and apostrophes inside words (e.g. "E-Mail"), drop the rest.
  return input.replace(PUNCTUATION, '').replace(/\s+/g, ' ').trim();
}

export function tokenize(input: string): string[] {
  const cleaned = stripPunctuation(tidy(input));
  return cleaned.length === 0 ? [] : cleaned.split(' ');
}

/** Lowercase in a way that is safe for German (no locale surprises). */
export function lower(input: string): string {
  return input.toLowerCase();
}

/**
 * The canonical "shape" of an answer: no punctuation, no case, single spaces.
 * Used to decide whether two answers are the *same words* before we look at
 * how they differ.
 */
export function shapeKey(input: string): string {
  return lower(stripPunctuation(tidy(input)));
}

/** Umlaut to digraph: a-umlaut becomes ae, sharp s becomes ss, and so on. */
export function toDigraphs(input: string): string {
  return input
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss');
}

const UMLAUT_DIGRAPH: Record<string, string> = {
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue',
  'ß': 'ss',
};

export type UmlautDiff =
  /** Identical (ignoring case). */
  | 'identical'
  /** The learner wrote a digraph exactly where the answer has a special letter. */
  | 'digraph-for-umlaut'
  /** The learner added a special letter the answer does not have, or something else differs. */
  | 'other';

/**
 * Decide whether `given` differs from `expected` *only* by writing the German
 * special characters as digraphs.
 *
 * This is deliberately a precise scan rather than a blanket `toDigraphs()`
 * comparison. Folding both sides would also make the noun pair "Masse" and
 * "Ma(sharp-s)e" look the same, which would hide a genuine spelling
 * distinction. Here the special letter has to be on the *expected* side and
 * the digraph on the learner's side.
 */
export function compareUmlauts(given: string, expected: string): UmlautDiff {
  const g = lower(tidy(given));
  const e = lower(tidy(expected));
  if (g === e) return 'identical';

  let gi = 0;
  let ei = 0;
  let sawDigraphSubstitution = false;

  while (gi < g.length && ei < e.length) {
    const gc = g[gi]!;
    const ec = e[ei]!;
    if (gc === ec) {
      gi += 1;
      ei += 1;
      continue;
    }
    const digraph = UMLAUT_DIGRAPH[ec];
    if (digraph && g.slice(gi, gi + 2) === digraph) {
      sawDigraphSubstitution = true;
      gi += 2;
      ei += 1;
      continue;
    }
    return 'other';
  }

  if (gi !== g.length || ei !== e.length) return 'other';
  return sawDigraphSubstitution ? 'digraph-for-umlaut' : 'other';
}

/** Levenshtein distance with an early exit once `max` is exceeded. */
export function editDistance(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) prev[j] = j;

  for (let i = 1; i <= m; i += 1) {
    curr[0] = i;
    let rowMin = curr[0]!;
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
      if (curr[j]! < rowMin) rowMin = curr[j]!;
    }
    if (rowMin > max) return max + 1;
    const swap = prev;
    prev = curr;
    curr = swap;
  }
  return prev[n]!;
}

/** True when the two strings differ only in letter case. */
export function differsOnlyByCase(given: string, expected: string): boolean {
  return given !== expected && lower(given) === lower(expected);
}

/** True when the two strings are equal once punctuation is removed. */
export function differsOnlyByPunctuation(given: string, expected: string): boolean {
  const g = tidy(given);
  const e = tidy(expected);
  return g !== e && stripPunctuation(g) === stripPunctuation(e);
}

/** Positions (token indices) where two token lists differ. */
export function differingIndices(a: string[], b: string[]): number[] {
  const out: number[] = [];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if (a[i] !== b[i]) out.push(i);
  }
  return out;
}

const SORT_SEP = String.fromCharCode(1);

/** Same words in a different order? */
export function isReordering(a: string[], b: string[]): boolean {
  if (a.length !== b.length || a.length < 2) return false;
  const norm = (xs: string[]) => xs.map(lower).slice().sort().join(SORT_SEP);
  return norm(a) === norm(b) && a.map(lower).join(' ') !== b.map(lower).join(' ');
}

/** Insert `text` into `value` at `[start, end)`, returning the new value and caret. */
export function insertAt(
  value: string,
  start: number,
  end: number,
  text: string,
): { value: string; caret: number } {
  const next = value.slice(0, start) + text + value.slice(end);
  return { value: next, caret: start + text.length };
}

/**
 * Turn a scaffold such as "Ich ___ in Hamburg." into its display parts.
 * A scaffold may pre-seed letters ("Ich w___ in Hamburg.") for partial recall.
 */
export function splitScaffold(scaffold: string): { before: string; after: string; seed: string } {
  const match = /(\S*?)_{2,}(\S*)/.exec(scaffold);
  if (!match) return { before: scaffold, after: '', seed: '' };
  const whole = match[0];
  const seedRaw = match[1] ?? '';
  const tailRaw = match[2] ?? '';
  const idx = match.index;
  return {
    before: scaffold.slice(0, idx),
    after: tailRaw + scaffold.slice(idx + whole.length),
    seed: seedRaw,
  };
}
