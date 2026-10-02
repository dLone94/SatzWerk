import type { CefrLevel, Checkpoint, ErrorCategory, Exercise, GrammarConcept, Lesson, Level, SentencePattern, TeachingLanguage, Unit, VocabEntry } from './types.ts';
import { LEVEL_OUTLINES } from './outline/levelOutlines.ts';

export type ReviewTargetKind = 'vocab' | 'pattern' | 'grammar';

export interface ResolvedTarget {
  id: string;
  kind: ReviewTargetKind;
  label: string;
  level: CefrLevel;
  difficulty: number;
}

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

/** Shared indexes for authored content and the browser's lightweight catalog.
 * Records are hydrated in place before a learning route renders, so these maps
 * keep stable references while a level's full text is loaded on demand. */
export function createRegistry(CURRICULUM: Level[], SENTENCE_PATTERNS: SentencePattern[], GRAMMAR_CONCEPTS: GrammarConcept[], PLACEMENT_CHECKPOINT: Checkpoint, VOCABULARY: VocabEntry[]) {
  const vocabulary = new Map(VOCABULARY.map(entry => [entry.id, entry]));
  const vocabById = (id: string) => vocabulary.get(id);
  const grammar = new Map(GRAMMAR_CONCEPTS.map(entry => [entry.id, entry]));
  const grammarById = (id: string) => grammar.get(id);
  const LEVEL_BY_ID = new Map(CURRICULUM.map((level) => [level.id, level]));
  const UNITS = CURRICULUM.flatMap((level) => level.units);
  const UNIT_BY_ID = new Map(UNITS.map((unit) => [unit.id, unit]));
  const LESSONS = UNITS.flatMap((unit) => unit.lessons);
  const LESSON_BY_ID = new Map(LESSONS.map((lesson) => [lesson.id, lesson]));
  const PATTERN_BY_ID = new Map(SENTENCE_PATTERNS.map((pattern) => [pattern.id, pattern]));
  const CHECKPOINTS = [
    ...UNITS.map((unit) => unit.checkpoint),
    ...CURRICULUM.map((level) => level.checkpoint),
    // The placement check belongs to no unit and no level: it spans all of them.
    // It is listed here so that every guard the other checkpoints get — answers
    // that validate, both paths filled in, ids that are unique — covers it too.
    PLACEMENT_CHECKPOINT,
  ].filter((cp): cp is Checkpoint => Boolean(cp));
  const CHECKPOINT_BY_ID = new Map(CHECKPOINTS.map((cp) => [cp.id, cp]));

  function levelById(id: string): Level | undefined {
    return LEVEL_BY_ID.get(id as CefrLevel);
  }

  function unitById(id: string): Unit | undefined {
    return UNIT_BY_ID.get(id);
  }

  function lessonById(id: string): Lesson | undefined {
    return LESSON_BY_ID.get(id);
  }

  function checkpointById(id: string): Checkpoint | undefined {
    return CHECKPOINT_BY_ID.get(id);
  }

  function patternById(id: string): SentencePattern | undefined {
    return PATTERN_BY_ID.get(id);
  }

  function allLessons(): Lesson[] {
    return LESSONS;
  }

  function allUnits(): Unit[] {
    return UNITS;
  }

  function allCheckpoints(): Checkpoint[] {
    return CHECKPOINTS;
  }

  function availableLessons(): Lesson[] {
    return LESSONS.filter((lesson) => lesson.status === 'available');
  }

  function lessonsInOrder(): Lesson[] {
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

  function unitForLesson(lessonId: string): Unit | undefined {
    const lesson = LESSON_BY_ID.get(lessonId);
    return lesson ? UNIT_BY_ID.get(lesson.unitId) : undefined;
  }

  /** Every exercise in a lesson, practice phase then mastery check. */
  function lessonExercises(lesson: Lesson): Exercise[] {
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
  function practiceForCategory(category: ErrorCategory, limit = 10): Exercise[] {
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
  function categoryPracticeCounts(): Map<ErrorCategory, number> {
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

  /**
   * Review targets are authored as plain ids. This resolves an id to the thing it
   * points at, so the scheduler can create an item with a sensible difficulty and
   * the review screen can render something meaningful.
   */
  function resolveTarget(id: string): ResolvedTarget | undefined {
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

  function contentStats(): ContentStats {
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
  function unauthoredLevels(): Level[] {
    return CURRICULUM.filter((level) => level.units.length === 0);
  }

  /**
   * Levels that have been started and are not finished.
   *
   * Kept separate from `unauthoredLevels` because the two are different
   * promises: a level with nothing in it is an outline, and a level with two of
   * its five units written is a level you can already study. Saying "every level
   * is authored" while one of them is a third done would be the kind of quiet
   * overstatement this app is built not to make.
   */
  function partialLevels(): Array<{ level: Level; written: number; planned: number }> {
    return CURRICULUM.filter((level) => level.units.length > 0 && level.status === 'partial').map(
      (level) => ({
        level,
        written: level.units.length,
        planned: LEVEL_OUTLINES[level.id as keyof typeof LEVEL_OUTLINES].plannedUnits.length,
      }),
    );
  }

  /** Blocks for a section, including a referenced grammar concept's blocks. */
  function sectionBlocks(
    section: { blocks: unknown[]; grammarId?: string },
    _lang: TeachingLanguage,
  ): GrammarConcept['blocks'] {
    const own = section.blocks as GrammarConcept['blocks'];
    if (!section.grammarId) return own;
    const concept = grammarById(section.grammarId);
    return concept ? [...own, ...concept.blocks] : own;
  }

  return { levelById, unitById, lessonById, checkpointById, patternById, allLessons, allUnits, allCheckpoints, availableLessons, lessonsInOrder, unitForLesson, lessonExercises, practiceForCategory, categoryPracticeCounts, resolveTarget, contentStats, unauthoredLevels, partialLevels, sectionBlocks, grammarById };
}
