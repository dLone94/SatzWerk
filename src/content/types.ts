/**
 * SatzWerk content model.
 *
 * Design rules that the rest of the app depends on:
 *
 *  1. German content is stored ONCE. Teaching-language text (English / Bulgarian)
 *     lives in `Bilingual` fields beside it.
 *  2. The English and Bulgarian paths are allowed to be pedagogically *different*,
 *     not merely translated. Any block, section or exercise may carry `only: ['bg']`
 *     (or `['en']`) so that, for example, the Bulgarian path can compare German
 *     articles with the Bulgarian postfixed definite article while the English path
 *     talks about noun capitalisation instead.
 *  3. Levels are open-ended: `CefrLevel` already contains 'c1' | 'c2' so those can be
 *     added later as pure content, with no change to these structures.
 *  4. Exercises are modelled as a list of answer *steps*. That single shape covers
 *     full production, fill-in-the-blank, conjugation tables (6 steps), progressive
 *     sentence building (4 steps) and the "noun, then noun + article" drill, so the
 *     exercise engine, the validator and the review scheduler only ever deal with steps.
 */

export type TeachingLanguage = 'en' | 'bg';

export const TEACHING_LANGUAGES: TeachingLanguage[] = ['en', 'bg'];

/** CEFR levels. c1/c2 are declared so later content needs no structural change. */
export type CefrLevel = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';

export const CEFR_ORDER: CefrLevel[] = ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

/** A string authored separately for each teaching path. */
export interface Bilingual {
  en: string;
  bg: string;
}

/** Content availability, so the UI never pretends planned material is finished. */
export type ContentStatus = 'available' | 'partial' | 'planned';

export type WordType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'article'
  | 'preposition'
  | 'conjunction'
  | 'numeral'
  | 'phrase'
  | 'interjection'
  | 'particle';

export type Gender = 'm' | 'f' | 'n';

export type DefiniteArticle = 'der' | 'die' | 'das';

/** Error categories used by the validator, the mistake bank and targeted practice. */
export type ErrorCategory =
  | 'spelling'
  | 'capitalization'
  | 'article'
  | 'gender'
  | 'case'
  | 'verb-conjugation'
  | 'verb-tense'
  | 'auxiliary-verb'
  | 'word-order'
  | 'preposition'
  | 'vocabulary'
  | 'plural'
  | 'adjective-ending'
  | 'pronoun'
  | 'punctuation'
  | 'missing-word'
  | 'extra-word'
  | 'umlaut'
  | 'unknown';

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export interface Collocation {
  de: string;
  gloss?: Bilingual;
}

export interface VocabEntry {
  id: string;
  /** Head word, without article: "Haus", "wohnen", "Guten Morgen". */
  german: string;
  /** Canonical teaching form. For nouns this is article + noun: "das Haus". */
  display: string;
  article?: DefiniteArticle;
  gender?: Gender;
  /** Plural including its article where it exists: "die Häuser". */
  plural?: string;
  wordType: WordType;
  translation: Bilingual;
  /** Lightweight respelling shown next to the word, not IPA. */
  pronunciation?: Bilingual;
  example: { de: string; gloss: Bilingual };
  tags: string[];
  level: CefrLevel;
  unitId?: string;
  lessonId?: string;
  /** 1 = easy for a beginner, 5 = hard. Feeds the initial SRS difficulty. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  related?: string[];
  collocations?: Collocation[];
  /** Path-specific note, e.g. a Bulgarian-speaker warning about gender mismatch. */
  notes?: Partial<Record<TeachingLanguage, string>>;
}

/** A reusable sentence pattern, e.g. "Ich wohne in ___". */
export interface SentencePattern {
  id: string;
  template: string;
  example: string;
  gloss: Bilingual;
  level: CefrLevel;
  grammarIds?: string[];
}

/* ------------------------------------------------------------------ *
 * Teaching blocks
 * ------------------------------------------------------------------ */

/** Restrict a block / section / exercise to one teaching path. */
export interface PathScoped {
  only?: TeachingLanguage[];
}

export type Block =
  | ({ t: 'p'; text: Bilingual } & PathScoped)
  | ({ t: 'list'; items: Bilingual[]; ordered?: boolean } & PathScoped)
  /** A German example line, optionally glossed in the teaching language. */
  | ({ t: 'de'; de: string; gloss?: Bilingual; audio?: boolean } & PathScoped)
  /** German on one side, the learner's language on the other. */
  | ({ t: 'contrast'; de: string; other: Bilingual; note?: Bilingual } & PathScoped)
  | ({ t: 'table'; headers: Bilingual[]; rows: Array<Array<string | Bilingual>>; caption?: Bilingual } & PathScoped)
  | ({ t: 'callout'; tone: 'tip' | 'warn' | 'compare'; title?: Bilingual; text: Bilingual } & PathScoped)
  /** Word-by-word breakdown used in Stage 1 of the scaffolding ladder. */
  | ({ t: 'breakdown'; de: string; parts: Array<{ de: string; gloss: Bilingual }> } & PathScoped);

export type SectionKind =
  | 'intro'
  | 'vocabulary'
  | 'pronunciation'
  | 'grammar'
  | 'examples'
  | 'contrast'
  | 'culture'
  | 'summary';

export interface TeachingSection extends PathScoped {
  id: string;
  kind: SectionKind;
  title: Bilingual;
  blocks: Block[];
  /** Vocabulary introduced/listed here; rendered as an audio-enabled word list. */
  vocabIds?: string[];
  /**
   * Pull in a shared grammar concept's blocks. Keeps one explanation in one
   * place while still letting a lesson add its own framing around it.
   */
  grammarId?: string;
}

export interface GrammarConcept {
  id: string;
  title: Bilingual;
  level: CefrLevel;
  summary: Bilingual;
  blocks: Block[];
  tags?: string[];
}

/* ------------------------------------------------------------------ *
 * Exercises
 * ------------------------------------------------------------------ */

export type ExerciseKind =
  /** Full production: prompt in the teaching language, learner types the German. */
  | 'type'
  /** Guided typing: the sentence is shown with a gap. */
  | 'fillBlank'
  /** Partial recall: the gap is pre-seeded with the first letters. */
  | 'partialRecall'
  /** "___ Tisch" -> "der". */
  | 'articleRecall'
  /** Two stages: bare noun, then noun with its article. */
  | 'nounWithArticle'
  /** One step per person of the verb. */
  | 'conjugation'
  /** Arrange a word bank, then retype the sentence unaided. */
  | 'wordOrder'
  /** Build the sentence up one chunk at a time, then type the whole thing. */
  | 'sentenceBuild'
  /** Audio only, learner types what they hear. */
  | 'dictation'
  /** Audio, then a choice. Used for first listening exposure only. */
  | 'listenChoose'
  | 'multipleChoice'
  /** Open writing. Checked by rules for required elements, never silently "wrong". */
  | 'freeWriting';

export type AnswerShape = 'word' | 'phrase' | 'sentence';

export interface AnswerSpec {
  /** Canonical answer first. All entries get full credit. */
  accepted: string[];
  /**
   * Natural German that is also correct here but is not the form being taught.
   * Credited, but the learner is shown the target form.
   */
  alternatives?: string[];
  shape: AnswerShape;
  /**
   * Answers that are a known wrong turn, matched before fuzzy logic so the
   * learner gets the *specific* explanation instead of a generic one.
   */
  trapAnswers?: Array<{ answer: string; category: ErrorCategory; feedback: Bilingual }>;
  /** Require noun/sentence-initial capitals. Defaults to true for phrases/sentences. */
  enforceCapitalization?: boolean;
  /** Words that must appear (used by freeWriting). */
  requiredTokens?: string[];
}

export interface ExerciseStep extends PathScoped {
  id: string;
  /** Prompt in the teaching language. null when the prompt is German or audio only. */
  prompt: Bilingual | null;
  /** German prompt, used from A1 upward and for German-only mode. */
  promptDe?: string;
  instruction?: Bilingual;
  /** "Ich ___ in Hamburg." or "Ich w____ in Hamburg." `___` marks the gap. */
  scaffold?: string;
  /** Shuffled at render time. */
  wordBank?: string[];
  choices?: Array<{ id: string; de: string; gloss?: Bilingual }>;
  correctChoiceId?: string;
  answer: AnswerSpec;
  /** Revealed one at a time; the last hint may contain the answer. */
  hints: Bilingual[];
  /** Text spoken by the TTS provider. `hideText` powers dictation. */
  audio?: { text: string; hideText?: boolean };
  /** Review items this step feeds: vocab ids, pattern ids or grammar ids. */
  reviewTargets?: string[];
}

export interface Exercise extends PathScoped {
  id: string;
  kind: ExerciseKind;
  level: CefrLevel;
  objective: Bilingual;
  steps: ExerciseStep[];
  /**
   * When true, a meaningful mistake forces the learner to retype the correct
   * German before they can continue. Defaults to true for phrases and sentences.
   */
  mandatoryRetype?: boolean;
  grammarIds?: string[];
}

/* ------------------------------------------------------------------ *
 * Lessons, units, levels, checkpoints
 * ------------------------------------------------------------------ */

export interface MasteryCheck {
  /** Minimum share of first-attempt-correct answers, 0..1. */
  passAccuracy: number;
  exercises: Exercise[];
}

export interface Lesson {
  id: string;
  unitId: string;
  level: CefrLevel;
  order: number;
  title: Bilingual;
  /** "After this lesson you will be able to ..." */
  objective: Bilingual;
  /** CEFR-style "I can ..." outcomes. */
  outcomes: Bilingual[];
  estimatedMinutes: number;
  status: ContentStatus;
  sections: TeachingSection[];
  exercises: Exercise[];
  mastery: MasteryCheck;
  vocabIds: string[];
  grammarIds: string[];
  patterns?: SentencePattern[];
  summary?: Block[];
}

export type CheckpointScope = 'lesson' | 'unit' | 'level' | 'placement';

export interface Checkpoint {
  id: string;
  scope: CheckpointScope;
  /** Unit or level id this checkpoint closes. */
  targetId: string;
  title: Bilingual;
  description: Bilingual;
  passAccuracy: number;
  status: ContentStatus;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  level: CefrLevel;
  order: number;
  title: Bilingual;
  summary: Bilingual;
  status: ContentStatus;
  lessons: Lesson[];
  /** Outline of lessons that are designed but not authored yet. */
  plannedLessons?: Bilingual[];
  checkpoint?: Checkpoint;
}

export interface Level {
  id: CefrLevel;
  /** Display label: "Pre-A1", "A1", ... */
  label: string;
  title: Bilingual;
  description: Bilingual;
  status: ContentStatus;
  /** CEFR "I can ..." outcomes for the whole level. */
  outcomes: Bilingual[];
  units: Unit[];
  /** Topic / grammar outline for levels that are not authored yet. */
  outline?: {
    topics: Bilingual[];
    grammar: Bilingual[];
  };
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

export function t(text: Bilingual, lang: TeachingLanguage): string {
  return text[lang];
}

export function visibleFor<T extends PathScoped>(items: T[], lang: TeachingLanguage): T[] {
  return items.filter((item) => !item.only || item.only.includes(lang));
}

export function isVisible(item: PathScoped, lang: TeachingLanguage): boolean {
  return !item.only || item.only.includes(lang);
}
