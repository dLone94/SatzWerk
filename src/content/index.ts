import { VOCABULARY } from './vocabulary.ts';
import { createRegistry } from './registry.ts';
import type { Level, SentencePattern } from './types.ts';
import { GRAMMAR_CONCEPTS } from './grammar.ts';
import { PLACEMENT_CHECKPOINT } from './placement/checkpoint.ts';
import { LEVEL as PRE_A1, PATTERNS as PRE_A1_PATTERNS } from './levels/pre-a1.ts';
import { LEVEL as A1, PATTERNS as A1_PATTERNS } from './levels/a1.ts';
import { LEVEL as A2, PATTERNS as A2_PATTERNS } from './levels/a2.ts';
import { LEVEL as B1, PATTERNS as B1_PATTERNS } from './levels/b1.ts';
import { LEVEL as B2, PATTERNS as B2_PATTERNS } from './levels/b2.ts';
import { SCENARIO_SCRIPTS } from './scenarios/index.ts';
import { scenarioPhrasePatterns } from './dailyPatterns.ts';

export { PRE_A1, A1, A2, B1, B2 };
export const CURRICULUM: Level[] = [PRE_A1, A1, A2, B1, B2];
export const SENTENCE_PATTERNS: SentencePattern[] = [...PRE_A1_PATTERNS, ...A1_PATTERNS, ...A2_PATTERNS, ...B1_PATTERNS, ...B2_PATTERNS, ...scenarioPhrasePatterns(SCENARIO_SCRIPTS)];
export const { levelById, unitById, lessonById, checkpointById, patternById, allLessons, allUnits, allCheckpoints, availableLessons, lessonsInOrder, unitForLesson, lessonExercises, practiceForCategory, categoryPracticeCounts, resolveTarget, contentStats, unauthoredLevels, partialLevels, sectionBlocks, grammarById } = createRegistry(CURRICULUM, SENTENCE_PATTERNS, GRAMMAR_CONCEPTS, PLACEMENT_CHECKPOINT, VOCABULARY);
export type { ContentStats, ResolvedTarget, ReviewTargetKind } from './registry.ts';
import { createContentLexicon } from './lexicon.ts';
export const { LEXICON, describeNoun } = createContentLexicon(VOCABULARY);
export { VOCABULARY, vocabById, vocabByGerman, vocabForLesson } from './vocabulary.ts';
export { GRAMMAR_CONCEPTS } from './grammar.ts';
export { LEVEL_OUTLINES } from './outline/levelOutlines.ts';
export { PLACEMENT_CHECKPOINT } from './placement/checkpoint.ts';
export { SCENARIOS, scenariosForLevel } from './outline/realLife.ts';
export type { Scenario, ScenarioStage } from './outline/realLife.ts';
export {
  SCENARIO_SCRIPTS,
  playableScenarios,
  scenarioStatus,
  scriptAnswerCount,
  scriptById,
  scriptFor,
  scriptsForScenario,
} from './scenarios/index.ts';
