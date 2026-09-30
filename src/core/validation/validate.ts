import type { AnswerSpec, Bilingual, ErrorCategory, ExerciseKind } from '../../content/types.ts';
import { FREE_VARIANTS, isFunctionWord, isNoun, verbLemmas, type GermanLexicon } from './lexicon.ts';
import {
  compareUmlauts,
  editDistance,
  isReordering,
  lower,
  shapeKey,
  splitScaffold,
  stripPunctuation,
  tidy,
  toDigraphs,
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
  /**
   * The step's scaffold ("___ Montag arbeite ich."), when the answer fills a
   * gap. It says where the answer stands in its sentence, which decides
   * whether the case of its first letter is German or only the keyboard.
   * Without one the answer stands on its own.
   */
  scaffold?: string;
  /**
   * The kind of exercise the answer belongs to. In a dictation the recording
   * fixes the exact words, and in the word-order drills the order is the task.
   */
  exerciseKind?: ExerciseKind;
}

/** Where the answer stands, as far as the first letter's case is concerned. */
interface AnswerPlace {
  /** The answer begins a sentence (or stands alone), so its first capital is not a rule of its own. */
  opensSentence: boolean;
  /** No scaffold at all: the answer is the whole thing the learner typed. */
  standalone: boolean;
}

function answerPlace(scaffold: string | undefined): AnswerPlace {
  if (scaffold === undefined) return { opensSentence: true, standalone: true };
  const { before, seed } = splitScaffold(scaffold);
  // A seeded gap ("F___") shows the first letter already.
  if (seed) return { opensSentence: false, standalone: false };
  const lead = before.trim();
  return { opensSentence: lead === '' || /[.!?:]$/.test(lead), standalone: false };
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
    // A trap that only re-cases or re-punctuates a correct answer must be
    // matched on its case and its inner punctuation, otherwise it would also
    // match the correct answer. Only the final full stop is let go: stripping
    // every mark removed the very comma ("an, weil") or apostrophe ("Peter's")
    // the trap is about, and the right sentence without its full stop fell in.
    const collidesWithAnswer = acceptedShapes.has(shapeKey(trap.answer));
    const matchesTrap = collidesWithAnswer
      ? trapKey(raw) === trapKey(trap.answer)
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

  // "gerne" where the lesson says "gern" is the same word: good German, at
  // full credit, with the taught form shown. Not in a dictation, where the
  // recording says which one.
  if (best && VERDICT_RANK[best.verdict] < VERDICT_RANK['accepted-variant'] && options.exerciseKind !== 'dictation') {
    for (const answer of [...spec.accepted, ...(spec.alternatives ?? [])]) {
      for (const variant of freeVariantsOf(answer)) {
        best = better(best, compareAgainst(raw, variant, spec, options, true));
      }
    }
  }

  const result = best ?? emptyResult(target);
  // Always steer the learner to the taught form, even after an accepted variant.
  return { ...result, target };
}

/** The answer with each word of a FREE_VARIANTS pair swapped for its partner. */
function freeVariantsOf(answer: string): string[] {
  const out: string[] = [];
  for (const pair of FREE_VARIANTS) {
    for (const [from, to] of [pair, [pair[1], pair[0]]] as const) {
      // Whole words only: "gern" inside "gernen" or "Gernot" is not the word.
      const word = new RegExp(`(?<![\\p{L}])${from}(?![\\p{L}])`, 'giu');
      if (!word.test(answer)) continue;
      out.push(answer.replace(word, (found) => (found[0] === found[0]!.toUpperCase() ? to[0]!.toUpperCase() + to.slice(1) : to)));
    }
  }
  return out;
}

/**
 * The form a trap that collides with a correct answer is compared in: case
 * and inner punctuation kept, the curly apostrophe an iPhone types made
 * straight, and the sentence's closing mark dropped.
 */
function trapKey(text: string): string {
  return tidy(text)
    .replace(/[’‘ʼ`´]/g, "'")
    .replace(/\s+([,;:])/g, '$1')
    .replace(/[\s.!?…]+$/u, '');
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

  const place = answerPlace(options.scaffold);

  // Case only.
  if (lower(gNoP) === lower(eNoP)) {
    if (onlyFirstLetterCase(gNoP, eNoP, eTokens, lexicon, place)) {
      return {
        ...base,
        verdict: isVariant ? 'accepted-variant' : 'accepted-with-note',
        credit: isVariant ? 1 : SOFT_CREDIT.punctuation!,
        notes: ['capitalization'],
        requireRetype: false,
      };
    }
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
    // The comparison ignores case, so a lowercase noun or "sie" for "Sie"
    // would slip through with it ("der tisch ist gross"). Look again.
    const gDigraphs = toDigraphs(gNoP);
    const eDigraphs = toDigraphs(eNoP);
    const caseOnlyAtStart = onlyFirstLetterCase(gDigraphs, eDigraphs, eTokens, lexicon, place);
    if (gDigraphs !== eDigraphs && !caseOnlyAtStart) {
      const cased = classifyCase(tokenize(gDigraphs), tokenize(eDigraphs), lexicon, spec);
      if (cased.some((c) => HARD_CATEGORIES.has(c))) {
        return { ...base, verdict: 'incorrect', credit: 0, categories: cased, notes: ['umlaut'], requireRetype: true };
      }
      return {
        ...base,
        verdict: 'almost',
        credit: SOFT_CREDIT.capitalization!,
        categories: cased,
        notes: ['umlaut'],
        requireRetype: true,
      };
    }
    return {
      ...base,
      verdict: 'accepted-with-note',
      credit: SOFT_CREDIT.umlaut!,
      // The first letter's case was let go too; say so, as a sentence would.
      notes: gDigraphs !== eDigraphs ? ['umlaut', 'capitalization'] : ['umlaut'],
      requireRetype: true,
    };
  }

  // The dots left off altogether ("Tschuss"): name the letter rather than
  // calling it a vague spelling slip. Not when the plain form is a word of
  // its own, as "Tochter" is beside "Töchter".
  if (acceptDigraphs && dropsUmlauts(gTokens, eTokens, lexicon)) {
    return {
      ...base,
      verdict: 'almost',
      credit: SOFT_CREDIT.spelling!,
      categories: ['umlaut'],
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

/** Pronouns whose capital is their meaning: Sie is "you", sie is "she". */
const CASE_MEANS_PERSON = new Set(['sie', 'ihr', 'ihre', 'ihren', 'ihrem', 'ihrer', 'ihres', 'ihnen']);

/**
 * True when the only difference is the case of the answer's first letter, and
 * the answer opens a sentence, so that case is not a rule the learner broke.
 *
 * A lowercase first letter is the capital a phone keyboard did not add — the
 * field turns the phone's capitals off for a word, so "tschüss" or "am" in
 * "___ Montag arbeite ich." is what an iPhone types. An added capital is how
 * German writes a word that stands on its own ("Der Tisch", "Zwei"). Neither
 * is forgiven on a noun, which keeps its capital anywhere, nor on a lone Sie
 * or Ihr, whose capital is the difference between "you" and "she".
 */
function onlyFirstLetterCase(
  given: string,
  expected: string,
  eTokens: string[],
  lexicon: GermanLexicon,
  place: AnswerPlace,
): boolean {
  if (!place.opensSentence || given === expected) return false;
  if (given.slice(1) !== expected.slice(1)) return false;
  const g = given[0]!;
  const e = expected[0]!;
  if (g === e || lower(g) !== lower(e)) return false;
  const first = lower(eTokens[0] ?? '');
  const single = eTokens.length < 2;
  const raised = e === lower(e);
  // At the start of a sentence "sie ist Ärztin" cannot say which it means, so
  // only a lone word, or a capital added to a lowercase one, is held to it.
  if (CASE_MEANS_PERSON.has(first) && (single || raised)) return false;
  // Nouns are never written in lower case, so an added capital cannot be one.
  if (raised) return true;
  if (isNoun(lexicon, first)) return false;
  // A word on its own could be a name the course has never listed; forgive
  // only a word it knows is not a noun.
  if (single && place.standalone) return lexicon.knownWords.has(first);
  return true;
}

const PLAIN_VOWEL: Record<string, string> = { 'ä': 'a', 'ö': 'o', 'ü': 'u', 'ß': 's' };

/**
 * True when the learner wrote a, o, u or s where the answer has ä, ö, ü or ß,
 * and nothing else is different — and the plain word is not a word of its own.
 */
function dropsUmlauts(gTokens: string[], eTokens: string[], lexicon: GermanLexicon): boolean {
  if (gTokens.length !== eTokens.length) return false;
  let dropped = false;
  for (let i = 0; i < eTokens.length; i += 1) {
    const g = lower(gTokens[i]!);
    const e = lower(eTokens[i]!);
    if (g === e) continue;
    const plain = e.replace(/[äöüß]/g, (letter) => PLAIN_VOWEL[letter]!);
    if (plain === e || g !== plain) return false;
    if (lexicon.nounGender.has(g)) return false;
    dropped = true;
  }
  return dropped;
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
    // "Sie" (formal you) versus "sie" (she / they) is a meaning change, not a
    // typo — except as the first word, where every sentence has a capital.
    if (lower(e) === 'sie' && i > 0) {
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
      // Only inside the sentence does the capital tell Sie from sie.
      const opens = diff.findIndex((d) => d.expected !== undefined) === index;
      if (lower(entry.expected ?? '') === 'sie' && !opens) categories.add('pronoun');
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
  // Special letters folded away on both sides: this only checks that the
  // word was used, and "heisse" or "heise" for "heiße" is a spelling matter
  // for the answer's feedback, not a reason to refuse the writing.
  const fold = (word: string) =>
    toDigraphs(lower(word)).replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/ss/g, 's');
  const folded = tokens.map(fold);
  // "heiße|Name|bin": any one of them will do, for tasks with more than one
  // right way to say it ("Ich heiße Teo", "Mein Name ist Teo", "Ich bin Teo").
  const missingRequired = (spec.requiredTokens ?? []).filter(
    (req) =>
      !req
        .split('|')
        .map(fold)
        .some((option) => folded.some((tok) => tok === option || tok.startsWith(option))),
  );
  return {
    wordCount: tokens.length,
    missingRequired,
    satisfied: tokens.length >= minWords && missingRequired.length === 0,
  };
}
