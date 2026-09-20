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
  /**
   * The Perfekt, for verbs.
   *
   * Carried on the verb rather than derived, because German participles cannot
   * be derived reliably — gemacht is regular, gegangen is not, studiert has no
   * ge- at all, and eingekauft puts it in the middle. From A2 on this is part
   * of what it means to know the verb, so the word page shows it and the
   * validator counts the participle as a word the course teaches.
   */
  perfect?: { auxiliary: 'haben' | 'sein'; participle: string };
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
  /**
   * Text spoken by the TTS provider. `hideText` powers dictation.
   *
   * `replays` is how many times a dictation line may be heard *again* after
   * the automatic first play. Unlimited replay turns dictation into
   * transcription with a scrub bar: you stop listening and start sampling the
   * audio until the words resolve. A budget makes it a listening task again.
   * It applies only where the text is hidden — audio beside a visible German
   * sentence is pronunciation help, not a test, and stays unlimited.
   */
  audio?: { text: string; hideText?: boolean; replays?: number };
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
  /** A checkpoint spanning the whole level, taken after its units. */
  checkpoint?: Checkpoint;
  /** Topic / grammar outline for levels that are not authored yet. */
  outline?: {
    topics: Bilingual[];
    grammar: Bilingual[];
  };
}

/* ------------------------------------------------------------------ *
 * Real Life scenarios
 * ------------------------------------------------------------------ */

/**
 * A scenario is a conversation, not a quiz.
 *
 * The difference matters pedagogically: in a lesson the prompt tells you what
 * to say, and in a conversation the *other person's line* decides it. That is
 * the one thing eighty-four lessons cannot practise, because a lesson never
 * surprises you. So a script is a list of beats played in order — their line,
 * then yours — and your turn is an ordinary `Exercise`, which means the same
 * validator, the same hints and the same mandatory retyping as everywhere else.
 * There is no second marking engine hiding in here.
 */
export type ScenarioBeat =
  /** What the other person says. German first; the meaning is behind a reveal. */
  | ({ who: 'them'; de: string; gloss: Bilingual; note?: Bilingual } & PathScoped)
  /** Stage direction: what just happened, or what you can see. */
  | ({ who: 'narrator'; text: Bilingual } & PathScoped)
  /** Your turn. One exercise, usually one step, played by the exercise engine. */
  | { who: 'you'; exercise: Exercise };

/** One playable conversation: one scenario, at one level. */
export interface ScenarioScript {
  id: string;
  /** The `Scenario` in the Real Life outline this belongs to. */
  scenarioId: string;
  level: CefrLevel;
  /**
   * Which register this whole conversation is in.
   *
   * Fixed for the script rather than chosen turn by turn, because that is how
   * it works in a room: you decide once, at the door, and then you are stuck
   * with it. Getting it wrong is the mistake this mode is best placed to catch,
   * so the scripts carry authored traps for the other form.
   */
  register: 'du' | 'Sie';
  /** Who you are talking to: "the baker", "the receptionist". */
  partner: Bilingual;
  /** What you want out of this conversation, in one line. */
  goal: Bilingual;
  beats: ScenarioBeat[];
  /** What you have just proved you can do. Shown at the end. */
  outro: Bilingual;
  /** Lessons that teach the language this uses. */
  lessonIds?: string[];
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
