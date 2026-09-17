import { createBaseLexicon, extendLexicon, type GermanLexicon } from '../core/validation/lexicon.ts';
import { GRAMMAR_CONCEPTS, grammarById } from './grammar.ts';
import { LEVEL_OUTLINES } from './outline/levelOutlines.ts';
import { PRE_A1_PATTERNS, PRE_A1_UNIT_2 } from './pre-a1/unit2.ts';
import { PRE_A1_UNIT_1 } from './pre-a1/unit1.ts';
import type {
  CefrLevel,
  Checkpoint,
  Exercise,
  GrammarConcept,
  Lesson,
  Level,
  SentencePattern,
  TeachingLanguage,
  Unit,
  VocabEntry,
} from './types.ts';
import { VOCABULARY, vocabById } from './vocabulary.ts';

/**
 * The curriculum.
 *
 * Levels Pre-A1 to B2 all exist as structure. Only the units listed in
 * `units` are authored; everything else is carried as an outline and marked
 * `planned`, so the level map can be honest about what is finished.
 */

function levelFromOutline(
  id: Exclude<CefrLevel, 'c1' | 'c2'>,
  units: Unit[],
  status: Level['status'],
): Level {
  const outline = LEVEL_OUTLINES[id];
  return {
    id,
    label: outline.label,
    title: outline.title,
    description: outline.description,
    status,
    outcomes: outline.outcomes,
    units,
    outline: { topics: outline.topics, grammar: outline.grammar },
  };
}

export const PRE_A1: Level = {
  ...levelFromOutline('pre-a1', [PRE_A1_UNIT_1, PRE_A1_UNIT_2], 'partial'),
};

export const CURRICULUM: Level[] = [
  PRE_A1,
  levelFromOutline('a1', [], 'planned'),
  levelFromOutline('a2', [], 'planned'),
  levelFromOutline('b1', [], 'planned'),
  levelFromOutline('b2', [], 'planned'),
];

export const SENTENCE_PATTERNS: SentencePattern[] = [...PRE_A1_PATTERNS];

/* ------------------------------------------------------------------ *
 * Indexes
 * ------------------------------------------------------------------ */

const LEVEL_BY_ID = new Map(CURRICULUM.map((level) => [level.id, level]));
const UNITS = CURRICULUM.flatMap((level) => level.units);
const UNIT_BY_ID = new Map(UNITS.map((unit) => [unit.id, unit]));
const LESSONS = UNITS.flatMap((unit) => unit.lessons);
const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
const PATTERN_BY_ID = new Map(SENTENCE_PATTERNS.map((pattern) => [pattern.id, pattern]));
const CHECKPOINTS = UNITS.map((unit) => unit.checkpoint).filter((cp): cp is Checkpoint => Boolean(cp));
const CHECKPOINT_BY_ID = new Map(CHECKPOINTS.map((cp) => [cp.id, cp]));

export function levelById(id: string): Level | undefined {
  return LEVEL_BY_ID.get(id as CefrLevel);
}

export function unitById(id: string): Unit | undefined {
  return UNIT_BY_ID.get(id);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}

export function checkpointById(id: string): Checkpoint | undefined {
  return CHECKPOINT_BY_ID.get(id);
}

export function patternById(id: string): SentencePattern | undefined {
  return PATTERN_BY_ID.get(id);
}

export function allLessons(): Lesson[] {
  return LESSONS;
}

export function allUnits(): Unit[] {
  return UNITS;
}

export function allCheckpoints(): Checkpoint[] {
  return CHECKPOINTS;
}

export function availableLessons(): Lesson[] {
  return LESSONS.filter((lesson) => lesson.status === 'available');
}

export function lessonsInOrder(): Lesson[] {
  const levelRank = new Map(CURRICULUM.map((level, index) => [level.id, index]));
  return [...LESSONS].sort((a, b) => {
    const levelDiff = (levelRank.get(a.level) ?? 0) - (levelRank.get(b.level) ?? 0);
    if (levelDiff !== 0) return levelDiff;
    const unitA = UNIT_BY_ID.get(a.unitId)?.order ?? 0;
    const unitB = UNIT_BY_ID.get(b.unitId)?.order ?? 0;
    if (unitA !== unitB) return unitA - unitB;
    return a.order - b.order;
  });
}

export function unitForLesson(lessonId: string): Unit | undefined {
  const lesson = LESSON_BY_ID.get(lessonId);
  return lesson ? UNIT_BY_ID.get(lesson.unitId) : undefined;
}

/** Every exercise in a lesson, practice phase then mastery check. */
export function lessonExercises(lesson: Lesson): Exercise[] {
  return [...lesson.exercises, ...lesson.mastery.exercises];
}

/* ------------------------------------------------------------------ *
 * Review targets
 * ------------------------------------------------------------------ */

export type ReviewTargetKind = 'vocab' | 'pattern' | 'grammar';

export interface ResolvedTarget {
  id: string;
  kind: ReviewTargetKind;
  label: string;
  level: CefrLevel;
  difficulty: number;
}

/**
 * Review targets are authored as plain ids. This resolves an id to the thing it
 * points at, so the scheduler can create an item with a sensible difficulty and
 * the review screen can render something meaningful.
 */
export function resolveTarget(id: string): ResolvedTarget | undefined {
  const vocab = vocabById(id);
  if (vocab) {
    return { id, kind: 'vocab', label: vocab.display, level: vocab.level, difficulty: vocab.difficulty };
  }
  const pattern = PATTERN_BY_ID.get(id);
  if (pattern) {
    return { id, kind: 'pattern', label: pattern.example, level: pattern.level, difficulty: 3 };
  }
  const grammar = grammarById(id);
  if (grammar) {
    return { id, kind: 'grammar', label: grammar.title.en, level: grammar.level, difficulty: 3 };
  }
  return undefined;
}

/* ------------------------------------------------------------------ *
 * Vocabulary and lexicon
 * ------------------------------------------------------------------ */

export { VOCABULARY, vocabById, vocabByGerman, vocabForLesson } from './vocabulary.ts';
export { GRAMMAR_CONCEPTS, grammarById } from './grammar.ts';
export { LEVEL_OUTLINES } from './outline/levelOutlines.ts';
export { SCENARIOS, scenariosForLevel } from './outline/realLife.ts';
export type { Scenario, ScenarioStage } from './outline/realLife.ts';

/**
 * The validator's lexicon, extended with everything the course teaches.
 *
 * Built once and shared: it is pure data, and building it from the vocabulary
 * means the validator's diagnosis improves automatically as content is added.
 */
export const LEXICON: GermanLexicon = extendLexicon(
  createBaseLexicon(),
  VOCABULARY.map((entry) => ({
    german: entry.german,
    wordType: entry.wordType,
    gender: entry.gender,
    plural: entry.plural,
    display: entry.display,
  })),
);

/** Noun description used by the feedback builder for gender explanations. */
export function describeNoun(noun: string):
  | { display: string; gender: NonNullable<VocabEntry['gender']>; plural?: string }
  | undefined {
  const entry = VOCABULARY.find(
    (candidate) => candidate.german.toLowerCase() === noun.toLowerCase() && candidate.gender,
  );
  if (!entry?.gender) return undefined;
  return { display: entry.display, gender: entry.gender, plural: entry.plural };
}

/* ------------------------------------------------------------------ *
 * Content statistics, for an honest dashboard
 * ------------------------------------------------------------------ */

export interface ContentStats {
  levels: number;
  authoredLevels: number;
  units: number;
  authoredUnits: number;
  lessons: number;
  exercises: number;
  answerSteps: number;
  vocabulary: number;
  grammarConcepts: number;
  checkpoints: number;
}

export function contentStats(): ContentStats {
  const lessons = availableLessons();
  const exercises = lessons.flatMap(lessonExercises);
  return {
    levels: CURRICULUM.length,
    authoredLevels: CURRICULUM.filter((level) => level.units.length > 0).length,
    units: UNITS.length,
    authoredUnits: UNITS.filter((unit) => unit.status === 'available').length,
    lessons: lessons.length,
    exercises: exercises.length,
    answerSteps: exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0),
    vocabulary: VOCABULARY.length,
    grammarConcepts: GRAMMAR_CONCEPTS.length,
    checkpoints: CHECKPOINTS.length,
  };
}

/** Blocks for a section, including a referenced grammar concept's blocks. */
export function sectionBlocks(
  section: { blocks: unknown[]; grammarId?: string },
  _lang: TeachingLanguage,
): GrammarConcept['blocks'] {
  const own = section.blocks as GrammarConcept['blocks'];
  if (!section.grammarId) return own;
  const concept = grammarById(section.grammarId);
  return concept ? [...own, ...concept.blocks] : own;
}
