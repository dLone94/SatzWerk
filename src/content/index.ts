import { createBaseLexicon, extendLexicon, type GermanLexicon } from '../core/validation/lexicon.ts';
import { A1_U1_PATTERNS, A1_UNIT_1 } from './a1/unit1.ts';
import { A1_U2_PATTERNS, A1_UNIT_2 } from './a1/unit2.ts';
import { A1_U3_PATTERNS, A1_UNIT_3 } from './a1/unit3.ts';
import { A1_U4_PATTERNS, A1_UNIT_4 } from './a1/unit4.ts';
import { A1_U5_PATTERNS, A1_UNIT_5 } from './a1/unit5.ts';
import { A1_U6_PATTERNS, A1_UNIT_6 } from './a1/unit6.ts';
import { A1_LEVEL_CHECKPOINT } from './a1/levelCheckpoint.ts';
import { A2_U1_PATTERNS, A2_UNIT_1 } from './a2/unit1.ts';
import { A2_U2_PATTERNS, A2_UNIT_2 } from './a2/unit2.ts';
import { A2_U3_PATTERNS, A2_UNIT_3 } from './a2/unit3.ts';
import { A2_U4_PATTERNS, A2_UNIT_4 } from './a2/unit4.ts';
import { A2_U5_PATTERNS, A2_UNIT_5 } from './a2/unit5.ts';
import { B1_U1_PATTERNS, B1_UNIT_1 } from './b1/unit1.ts';
import { B1_U2_PATTERNS, B1_UNIT_2 } from './b1/unit2.ts';
import { A2_LEVEL_CHECKPOINT } from './a2/levelCheckpoint.ts';
import { GRAMMAR_CONCEPTS, grammarById } from './grammar.ts';
import { LEVEL_OUTLINES } from './outline/levelOutlines.ts';
import { PRE_A1_PATTERNS, PRE_A1_UNIT_2 } from './pre-a1/unit2.ts';
import { PRE_A1_U3_PATTERNS, PRE_A1_UNIT_3 } from './pre-a1/unit3.ts';
import { PRE_A1_U4_PATTERNS, PRE_A1_UNIT_4 } from './pre-a1/unit4.ts';
import { PRE_A1_U5_PATTERNS, PRE_A1_UNIT_5 } from './pre-a1/unit5.ts';
import { PRE_A1_U6_PATTERNS, PRE_A1_UNIT_6 } from './pre-a1/unit6.ts';
import { PRE_A1_LEVEL_CHECKPOINT } from './pre-a1/levelCheckpoint.ts';
import { PRE_A1_UNIT_1 } from './pre-a1/unit1.ts';
import type {
  CefrLevel,
  Checkpoint,
  ErrorCategory,
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
  ...levelFromOutline(
    'pre-a1',
    [PRE_A1_UNIT_1, PRE_A1_UNIT_2, PRE_A1_UNIT_3, PRE_A1_UNIT_4, PRE_A1_UNIT_5, PRE_A1_UNIT_6],
    'available',
  ),
  checkpoint: PRE_A1_LEVEL_CHECKPOINT,
};

/**
 * A1 is finished: all six units and the level checkpoint that draws on them.
 */
export const A1: Level = {
  ...levelFromOutline(
    'a1',
    [A1_UNIT_1, A1_UNIT_2, A1_UNIT_3, A1_UNIT_4, A1_UNIT_5, A1_UNIT_6],
    'available',
  ),
  checkpoint: A1_LEVEL_CHECKPOINT,
};

/**
 * A2 is finished: all five units and the level checkpoint that draws on them.
 */
export const A2: Level = {
  ...levelFromOutline(
    'a2',
    [A2_UNIT_1, A2_UNIT_2, A2_UNIT_3, A2_UNIT_4, A2_UNIT_5],
    'available',
  ),
  checkpoint: A2_LEVEL_CHECKPOINT,
};

/**
 * B1 has begun: the units below are authored and playable, and the rest of the
 * level is still an outline. The level's status says `partial` rather than
 * `available` so that the course map cannot claim more than exists.
 */
export const B1: Level = levelFromOutline('b1', [B1_UNIT_1, B1_UNIT_2], 'partial');

export const CURRICULUM: Level[] = [
  PRE_A1,
  A1,
  A2,
  B1,
  levelFromOutline('b2', [], 'planned'),
];

export const SENTENCE_PATTERNS: SentencePattern[] = [
  ...PRE_A1_PATTERNS,
  ...PRE_A1_U3_PATTERNS,
  ...PRE_A1_U4_PATTERNS,
  ...PRE_A1_U5_PATTERNS,
  ...PRE_A1_U6_PATTERNS,
  ...A1_U1_PATTERNS,
  ...A1_U2_PATTERNS,
  ...A1_U3_PATTERNS,
  ...A1_U4_PATTERNS,
  ...A1_U5_PATTERNS,
  ...A1_U6_PATTERNS,
  ...A2_U1_PATTERNS,
  ...A2_U2_PATTERNS,
  ...A2_U3_PATTERNS,
  ...A2_U4_PATTERNS,
  ...A2_U5_PATTERNS,
  ...B1_U1_PATTERNS,
  ...B1_U2_PATTERNS,
];

/* ------------------------------------------------------------------ *
 * Indexes
 * ------------------------------------------------------------------ */

const LEVEL_BY_ID = new Map(CURRICULUM.map((level) => [level.id, level]));
const UNITS = CURRICULUM.flatMap((level) => level.units);
const UNIT_BY_ID = new Map(UNITS.map((unit) => [unit.id, unit]));
const LESSONS = UNITS.flatMap((unit) => unit.lessons);
const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
const PATTERN_BY_ID = new Map(SENTENCE_PATTERNS.map((pattern) => [pattern.id, pattern]));
const CHECKPOINTS = [
  ...UNITS.map((unit) => unit.checkpoint),
  ...CURRICULUM.map((level) => level.checkpoint),
].filter((cp): cp is Checkpoint => Boolean(cp));
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
 * Targeted practice by error category
 * ------------------------------------------------------------------ */

/**
 * Find the authored tasks that drill one kind of mistake.
 *
 * Every `trapAnswer` in the course names the category it catches, which makes
 * the content itself an index of what each task teaches. So a learner who keeps
 * missing articles gets the tasks whose authors anticipated an article mistake
 * — with their specific explanations — rather than a replay of the individual
 * sentences they happened to get wrong.
 *
 * Step ids are preserved on purpose: an attempt here counts towards the same
 * review item and the same mistake as the original task.
 */
export function practiceForCategory(category: ErrorCategory, limit = 10): Exercise[] {
  const sources: Exercise[] = [
    ...availableLessons().flatMap(lessonExercises),
    ...CHECKPOINTS.flatMap((checkpoint) => checkpoint.exercises),
  ];
  const wanted = new Set<ErrorCategory>([category, ...(RELATED_CATEGORIES[category] ?? [])]);

  // Exact matches first, then the related skill, so a round is never thin.
  const collect = (accept: (trapCategory: ErrorCategory) => boolean, out: Exercise[], taken: Set<string>) => {
    for (const exercise of sources) {
      const matching = exercise.steps.filter(
        (step) =>
          !taken.has(step.id) && step.answer.trapAnswers?.some((trap) => accept(trap.category)),
      );
      if (matching.length === 0) continue;
      const budget = limit - [...taken].length;
      if (budget <= 0) return;
      const take = matching.slice(0, budget);
      for (const step of take) taken.add(step.id);
      out.push({ ...exercise, id: `cat-${category}-${exercise.id}`, steps: take });
    }
  };

  const out: Exercise[] = [];
  const taken = new Set<string>();
  collect((trapCategory) => trapCategory === category, out, taken);
  collect((trapCategory) => wanted.has(trapCategory), out, taken);
  return out;
}

/**
 * Categories that are really the same skill from the learner's point of view.
 * Choosing the wrong article and choosing the wrong gender are one mistake with
 * two names, so practising either should bring up both.
 */
const RELATED_CATEGORIES: Partial<Record<ErrorCategory, ErrorCategory[]>> = {
  article: ['gender', 'case'],
  gender: ['article', 'case'],
  case: ['article', 'gender'],
  'verb-conjugation': ['verb-tense', 'auxiliary-verb'],
  'verb-tense': ['verb-conjugation'],
  'auxiliary-verb': ['verb-conjugation'],
  plural: ['gender'],
  umlaut: ['spelling'],
  spelling: ['umlaut', 'capitalization'],
  capitalization: ['spelling'],
  'missing-word': ['word-order'],
  'extra-word': ['word-order'],
};

/** How many authored tasks exist for each category, for an honest UI. */
export function categoryPracticeCounts(): Map<ErrorCategory, number> {
  const counts = new Map<ErrorCategory, number>();
  const sources: Exercise[] = [
    ...availableLessons().flatMap(lessonExercises),
    ...CHECKPOINTS.flatMap((checkpoint) => checkpoint.exercises),
  ];
  for (const exercise of sources) {
    for (const step of exercise.steps) {
      for (const trap of step.answer.trapAnswers ?? []) {
        counts.set(trap.category, (counts.get(trap.category) ?? 0) + 1);
      }
    }
  }
  return counts;
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
    participle: entry.perfect?.participle,
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

/**
 * The levels that exist as an outline but have no lessons in them yet.
 *
 * Derived, never written down: the moment a level's units are authored it
 * drops out of this list on its own. A hard-coded sentence about what is
 * missing goes stale the day after it is written, and a course that claims
 * less than it has is the same kind of lie as one that claims more.
 */
export function unauthoredLevels(): Level[] {
  return CURRICULUM.filter((level) => level.units.length === 0);
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
