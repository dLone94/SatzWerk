import type { AnswerSpec, Bilingual, ErrorCategory } from '../../content/types.ts';
import { isFunctionWord, verbLemmas, type GermanLexicon } from './lexicon.ts';
import {
  compareUmlauts,
  editDistance,
  isReordering,
  lower,
  shapeKey,
  stripPunctuation,
  tidy,
  tokenize,
} from './text.ts';

export type Verdict =
  /** Exactly the taught answer. */
  | 'correct'
  /** Different but genuinely valid German for this prompt. Full credit. */
  | 'accepted-variant'
  /** Right words, minor orthographic issue. Credit reduced, standard form shown. */
  | 'accepted-with-note'
  /** Recognisable attempt with a real slip. Partial credit, retyping required. */
  | 'almost'
  /** A grammar or vocabulary mistake. No credit, retyping required. */
  | 'incorrect'
  | 'empty';

export type DiffStatus = 'same' | 'changed' | 'missing' | 'extra' | 'case';

export interface TokenDiffEntry {
  status: DiffStatus;
  expected?: string;
  given?: string;
}

export interface ValidationResult {
  verdict: Verdict;
  /** Mastery credit for a *first* attempt, before any hint penalty. 0..1 */
  credit: number;
  /** The answer the learner should end up producing. */
  target: string;
  /** Which accepted answer we compared against (best match). */
  matched?: string;
  /** Mistakes that cost credit. */
  categories: ErrorCategory[];
  /** Observations on an otherwise accepted answer. */
  notes: ErrorCategory[];
  /** Must the learner retype the correct German before continuing? */
  requireRetype: boolean;
  diff: TokenDiffEntry[];
  /** Authored explanation for a known wrong turn. */
  trapFeedback?: Bilingual;
}

export interface ValidateOptions {
  lexicon: GermanLexicon;
  /**
   * Beginner convenience: accept the digraphs ae/oe/ue/ss where the answer has
   * the German special letters, with a note and a retype. Default true.
   */
  acceptDigraphs?: boolean;
}

/** Categories that are never forgiven: they are grammar, not typing. */
const HARD_CATEGORIES: ReadonlySet<ErrorCategory> = new Set<ErrorCategory>([
  'article',
  'gender',
  'case',
  'verb-conjugation',
  'verb-tense',
  'auxiliary-verb',
  'word-order',
  'preposition',
  'vocabulary',
  'plural',
  'adjective-ending',
  'pronoun',
  'missing-word',
  'extra-word',
]);

const SOFT_CREDIT: Partial<Record<ErrorCategory, number>> = {
  punctuation: 0.95,
  umlaut: 0.75,
  capitalization: 0.5,
  spelling: 0.45,
};

function emptyResult(target: string): ValidationResult {
  return {
    verdict: 'empty',
    credit: 0,
    target,
    categories: [],
    notes: [],
    requireRetype: false,
    diff: [],
  };
}

/** Rank results so the best interpretation of the learner's answer wins. */
const VERDICT_RANK: Record<Verdict, number> = {
  correct: 5,
  'accepted-variant': 4,
  'accepted-with-note': 3,
  almost: 2,
  incorrect: 1,
  empty: 0,
};

function better(a: ValidationResult, b: ValidationResult): ValidationResult {
  if (VERDICT_RANK[a.verdict] !== VERDICT_RANK[b.verdict]) {
    return VERDICT_RANK[a.verdict] > VERDICT_RANK[b.verdict] ? a : b;
  }
  if (a.credit !== b.credit) return a.credit > b.credit ? a : b;
  return a.categories.length <= b.categories.length ? a : b;
}

/**
 * Check a typed German answer.
 *
 * The contract the rest of the app relies on:
 *   - A grammar mistake never receives credit, however close the spelling is.
 *   - A typing slip is separated from a grammar mistake and still costs credit.
 *   - Authored alternatives are accepted at full credit.
 */
export function validateAnswer(
  given: string,
  spec: AnswerSpec,
  options: ValidateOptions,
): ValidationResult {
  const target = spec.accepted[0] ?? '';
  const raw = tidy(given);
  if (raw.length === 0) return emptyResult(target);

  // An exact match with a taught answer always wins. This has to come before
  // the trap check: a trap that differs from the correct answer only in case
  // (for example "Wie heissen sie?" for "Wie heissen Sie?") has the same
  // case-insensitive shape as the answer itself, and would otherwise swallow it.
  for (const accepted of spec.accepted) {
    if (raw === tidy(accepted)) {
      return {
        verdict: 'correct',
        credit: 1,
        target,
        matched: accepted,
        categories: [],
        notes: [],
        requireRetype: false,
        diff: buildDiff(tokenize(raw), tokenize(accepted)),
      };
    }
  }

  // Authored wrong turns win over any heuristic, so the learner gets the
  // specific explanation the lesson author wrote.
  const acceptedShapes = new Set(spec.accepted.map((answer) => shapeKey(answer)));
  for (const trap of spec.trapAnswers ?? []) {
    // A trap that only re-cases a correct answer must be matched exactly,
    // otherwise it would also match the correct answer.
    const collidesWithAnswer = acceptedShapes.has(shapeKey(trap.answer));
    const matchesTrap = collidesWithAnswer
      ? stripPunctuation(raw) === stripPunctuation(tidy(trap.answer))
      : shapeKey(raw) === shapeKey(trap.answer);
    if (matchesTrap) {
      return {
        verdict: 'incorrect',
        credit: 0,
        target,
        categories: [trap.category],
        notes: [],
        requireRetype: true,
        diff: buildDiff(tokenize(raw), tokenize(target)),
        trapFeedback: trap.feedback,
      };
    }
  }

  let best: ValidationResult | null = null;
  for (const accepted of spec.accepted) {
    const result = compareAgainst(raw, accepted, spec, options, false);
    best = best ? better(best, result) : result;
  }
  for (const alt of spec.alternatives ?? []) {
    const result = compareAgainst(raw, alt, spec, options, true);
    best = best ? better(best, result) : result;
  }

  const result = best ?? emptyResult(target);
  // Always steer the learner to the taught form, even after an accepted variant.
  return { ...result, target };
}

function compareAgainst(
  raw: string,
  expected: string,
  spec: AnswerSpec,
  options: ValidateOptions,
  isVariant: boolean,
): ValidationResult {
  const { lexicon } = options;
  const acceptDigraphs = options.acceptDigraphs ?? true;
  const expectedTidy = tidy(expected);
  const gTokens = tokenize(raw);
  const eTokens = tokenize(expectedTidy);

  const base = {
    target: expected,
    matched: expected,
    notes: [] as ErrorCategory[],
    categories: [] as ErrorCategory[],
    diff: buildDiff(gTokens, eTokens),
  };

  if (raw === expectedTidy) {
    return {
      ...base,
      verdict: isVariant ? 'accepted-variant' : 'correct',
      credit: 1,
      requireRetype: false,
    };
  }

  const gNoP = stripPunctuation(raw);
  const eNoP = stripPunctuation(expectedTidy);

  // Punctuation only.
  if (gNoP === eNoP) {
    return {
      ...base,
      verdict: isVariant ? 'accepted-variant' : 'accepted-with-note',
      credit: isVariant ? 1 : SOFT_CREDIT.punctuation!,
      notes: ['punctuation'],
      requireRetype: false,
    };
  }

  // Case only.
  if (lower(gNoP) === lower(eNoP)) {
    const cased = classifyCase(gTokens, eTokens, lexicon, spec);
    if (cased.some((c) => HARD_CATEGORIES.has(c))) {
      return { ...base, verdict: 'incorrect', credit: 0, categories: cased, requireRetype: true };
    }
    if (spec.enforceCapitalization === false) {
      return {
        ...base,
        verdict: 'accepted-with-note',
        credit: 0.9,
        notes: cased,
        requireRetype: false,
      };
    }
    return {
      ...base,
      verdict: 'almost',
      credit: SOFT_CREDIT.capitalization!,
      categories: cased,
      requireRetype: true,
    };
  }

  // German special letters written as digraphs.
  if (acceptDigraphs && compareUmlauts(gNoP, eNoP) === 'digraph-for-umlaut') {
    return {
      ...base,
      verdict: 'accepted-with-note',
      credit: SOFT_CREDIT.umlaut!,
      notes: ['umlaut'],
      requireRetype: true,
    };
  }

  // Same words, wrong order.
  if (isReordering(gTokens, eTokens)) {
    return {
      ...base,
      verdict: 'incorrect',
      credit: 0,
      categories: ['word-order'],
      requireRetype: true,
    };
  }

  const analysis = classifyTokens(gTokens, eTokens, lexicon);
  const categories = analysis.categories;

  if (categories.length === 0) {
    // Words line up but the strings differ: treat as a spelling slip.
    return {
      ...base,
      diff: analysis.diff,
      verdict: 'almost',
      credit: SOFT_CREDIT.spelling!,
      categories: ['spelling'],
      requireRetype: true,
    };
  }

  const hard = categories.filter((c) => HARD_CATEGORIES.has(c));
  if (hard.length > 0) {
    return {
      ...base,
      diff: analysis.diff,
      verdict: 'incorrect',
      credit: 0,
      categories,
      requireRetype: true,
    };
  }

  // Only soft categories left (spelling / umlaut / capitalisation).
  const credit = Math.min(...categories.map((c) => SOFT_CREDIT[c] ?? 0.4));
  return {
    ...base,
    diff: analysis.diff,
    verdict: 'almost',
    credit,
    categories,
    requireRetype: true,
  };
}

function classifyCase(
  gTokens: string[],
  eTokens: string[],
  lexicon: GermanLexicon,
  _spec: AnswerSpec,
): ErrorCategory[] {
  const categories = new Set<ErrorCategory>();
  for (let i = 0; i < eTokens.length; i += 1) {
    const e = eTokens[i];
    const g = gTokens[i];
    if (!e || !g || e === g) continue;
    // "Sie" (formal you) versus "sie" (she / they) is a meaning change, not a typo.
    if (lower(e) === 'sie') {
      categories.add('pronoun');
      continue;
    }
    categories.add('capitalization');
    if (lexicon.nounGender.has(lower(e)) && /^[a-zäöüß]/.test(g)) {
      categories.add('capitalization');
    }
  }
  if (categories.size === 0) categories.add('capitalization');
  return [...categories];
}

interface TokenAnalysis {
  categories: ErrorCategory[];
  diff: TokenDiffEntry[];
}

/** Longest-common-subsequence alignment over lowercased tokens. */
function alignTokens(given: string[], expected: string[]): TokenDiffEntry[] {
  const g = given.map(lower);
  const e = expected.map(lower);
  const n = g.length;
  const m = e.length;
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      table[i]![j] = g[i] === e[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }

  const out: TokenDiffEntry[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (g[i] === e[j]) {
      const same = given[i] === expected[j];
      out.push({ status: same ? 'same' : 'case', given: given[i]!, expected: expected[j]! });
      i += 1;
      j += 1;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      // The learner's token does not appear in the answer at this point.
      out.push({ status: 'extra', given: given[i]! });
      i += 1;
    } else {
      out.push({ status: 'missing', expected: expected[j]! });
      j += 1;
    }
  }
  while (i < n) {
    out.push({ status: 'extra', given: given[i]! });
    i += 1;
  }
  while (j < m) {
    out.push({ status: 'missing', expected: expected[j]! });
    j += 1;
  }

  // Collapse an adjacent extra+missing pair into a single substitution, which
  // is what a learner actually did when they used the wrong word.
  const merged: TokenDiffEntry[] = [];
  for (let k = 0; k < out.length; k += 1) {
    const cur = out[k]!;
    const next = out[k + 1];
    if (cur.status === 'extra' && next?.status === 'missing') {
      merged.push({ status: 'changed', given: cur.given, expected: next.expected });
      k += 1;
    } else if (cur.status === 'missing' && next?.status === 'extra') {
      merged.push({ status: 'changed', given: next.given, expected: cur.expected });
      k += 1;
    } else {
      merged.push(cur);
    }
  }
  return merged;
}

function buildDiff(given: string[], expected: string[]): TokenDiffEntry[] {
  return alignTokens(given, expected);
}

function classifyTokens(
  gTokens: string[],
  eTokens: string[],
  lexicon: GermanLexicon,
): TokenAnalysis {
  const diff = alignTokens(gTokens, eTokens);
  const categories = new Set<ErrorCategory>();

  diff.forEach((entry, index) => {
    if (entry.status === 'same') return;
    if (entry.status === 'case') {
      if (lower(entry.expected ?? '') === 'sie') categories.add('pronoun');
      else categories.add('capitalization');
      return;
    }
    if (entry.status === 'missing') {
      categories.add('missing-word');
      return;
    }
    if (entry.status === 'extra') {
      categories.add('extra-word');
      return;
    }
    const nextExpected = findNextExpected(diff, index);
    for (const category of categorizePair(entry.expected!, entry.given!, lexicon, nextExpected)) {
      categories.add(category);
    }
  });

  return { categories: [...categories], diff };
}

function findNextExpected(diff: TokenDiffEntry[], from: number): string | undefined {
  for (let i = from + 1; i < diff.length; i += 1) {
    const expected = diff[i]?.expected;
    if (expected) return expected;
  }
  return undefined;
}

/** Decide what kind of mistake turning `expected` into `given` represents. */
export function categorizePair(
  expected: string,
  given: string,
  lexicon: GermanLexicon,
  nextExpected?: string,
): ErrorCategory[] {
  const le = lower(expected);
  const lg = lower(given);
  if (le === lg) return [];

  const eVerb = verbLemmas(lexicon, le);
  const gVerb = verbLemmas(lexicon, lg);

  // Articles and determiners.
  if (lexicon.articles.has(le) && lexicon.articles.has(lg)) {
    const noun = nextExpected ? lower(nextExpected) : undefined;
    const gender = noun ? lexicon.nounGender.get(noun) : undefined;
    const givenMarks = lexicon.articleGender.get(lg) ?? [];
    if (gender && !givenMarks.includes(gender)) return ['article', 'gender'];
    return ['article'];
  }
  if (
    lexicon.articles.has(le) !== lexicon.articles.has(lg) &&
    eVerb.length === 0 &&
    gVerb.length === 0
  ) {
    // An article swapped for a non-article, or dropped in favour of a word.
    return ['article'];
  }

  if (eVerb.length > 0 && gVerb.length > 0) {
    const sharedLemma = eVerb.some((a) => gVerb.some((b) => a.lemma === b.lemma));
    if (sharedLemma) {
      const tenseClash = eVerb.some((a) =>
        gVerb.some((b) => a.lemma === b.lemma && a.tense !== b.tense && b.tense !== 'infinitive'),
      );
      const personClash = eVerb.some((a) =>
        gVerb.some((b) => a.lemma === b.lemma && a.tense === b.tense && a.person !== b.person),
      );
      if (personClash || !tenseClash) return ['verb-conjugation'];
      return ['verb-tense'];
    }
    const auxiliaries = new Set(['sein', 'haben']);
    if (eVerb.some((a) => auxiliaries.has(a.lemma)) || gVerb.some((b) => auxiliaries.has(b.lemma))) {
      return ['auxiliary-verb'];
    }
    return ['vocabulary'];
  }

  // Prepositions and pronouns.
  if (lexicon.prepositions.has(le) && lexicon.prepositions.has(lg)) return ['preposition'];
  if (lexicon.pronouns.has(le) && lexicon.pronouns.has(lg)) return ['pronoun'];

  // Number.
  if (lexicon.pluralOf.get(le) === lg || lexicon.singularOf.get(le) === lg) return ['plural'];

  // German special letters typed as digraphs inside one word.
  if (compareUmlauts(given, expected) === 'digraph-for-umlaut') return ['umlaut'];

  // Anything that is a grammatical choice is never downgraded to a typo.
  if (isFunctionWord(lexicon, expected) || isFunctionWord(lexicon, given)) return ['vocabulary'];

  // A real, different German word is a vocabulary mistake, not a typo.
  if (lexicon.knownWords.has(lg)) return ['vocabulary'];

  if (isTypo(le, lg)) return ['spelling'];
  return ['vocabulary'];
}

/**
 * Typo tolerance, deliberately narrow.
 *
 * Short words are excluded because at that length almost every German function
 * word is one edit from another. Longer words get two edits.
 */
export function isTypo(expected: string, given: string): boolean {
  if (expected.length < 4) return false;
  const budget = expected.length >= 8 ? 2 : 1;
  return editDistance(given, expected, budget) <= budget;
}

/* ------------------------------------------------------------------ *
 * Free writing
 * ------------------------------------------------------------------ */

export interface FreeWritingResult {
  wordCount: number;
  missingRequired: string[];
  /** True when the response is long enough and contains the required elements. */
  satisfied: boolean;
}

/**
 * Open writing is never marked simply "wrong". We check only that the learner
 * actually produced German and used the elements the task asked for; judging
 * the content itself is the German Coach's job (see services/ai).
 */
export function checkFreeWriting(given: string, spec: AnswerSpec, minWords = 3): FreeWritingResult {
  const tokens = tokenize(given);
  const lowered = tokens.map(lower);
  const missingRequired = (spec.requiredTokens ?? []).filter(
    (req) => !lowered.some((tok) => tok === lower(req) || tok.startsWith(lower(req))),
  );
  return {
    wordCount: tokens.length,
    missingRequired,
    satisfied: tokens.length >= minWords && missingRequired.length === 0,
  };
}
