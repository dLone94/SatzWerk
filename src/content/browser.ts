import data from './catalog.generated.json' with { type: 'json' };
import { createRegistry } from './registry.ts';
import { SCENARIOS } from './outline/realLife.ts';
import type { Checkpoint, Exercise, GrammarConcept, Level, ScenarioScript, SentencePattern, TeachingLanguage, CefrLevel, VocabEntry } from './types.ts';

/** Generated metadata only. Call ensureContent before mounting a learning route. */
export const VOCABULARY = data.vocabulary as unknown as VocabEntry[];
export const vocabById = (id: string) => VOCABULARY.find(entry => entry.id === id);
export const vocabByGerman = (german: string) => VOCABULARY.find(entry => entry.german.toLowerCase() === german.toLowerCase());
export const vocabForLesson = (id: string) => VOCABULARY.filter(entry => entry.lessonId === id);
export const CURRICULUM = data.curriculum as unknown as Level[];
export const SENTENCE_PATTERNS = data.patterns as unknown as SentencePattern[];
export const GRAMMAR_CONCEPTS = data.grammar as unknown as GrammarConcept[];
export const PLACEMENT_CHECKPOINT = data.placement as unknown as Checkpoint;
export const SCENARIO_SCRIPTS = data.scripts as unknown as ScenarioScript[];
export const { levelById, unitById, lessonById, checkpointById, patternById, allLessons, allUnits,
  allCheckpoints, availableLessons, lessonsInOrder, unitForLesson, lessonExercises, practiceForCategory,
  categoryPracticeCounts, resolveTarget, contentStats, unauthoredLevels, partialLevels, sectionBlocks,
  grammarById } = createRegistry(CURRICULUM, SENTENCE_PATTERNS, GRAMMAR_CONCEPTS, PLACEMENT_CHECKPOINT, VOCABULARY);

import { createContentLexicon } from './lexicon.ts';
export const { LEXICON, describeNoun } = createContentLexicon(VOCABULARY);
export { LEVEL_OUTLINES } from './outline/levelOutlines.ts';
export { SCENARIOS, scenariosForLevel } from './outline/realLife.ts';
export type { Scenario, ScenarioStage } from './outline/realLife.ts';
export type { ContentStats, ResolvedTarget, ReviewTargetKind } from './registry.ts';

export const scriptById = (id: string) => SCENARIO_SCRIPTS.find(script => script.id === id);
export const scriptsForScenario = (id: string) => SCENARIO_SCRIPTS.filter(script => script.scenarioId === id);
export const scriptFor = (id: string, level: CefrLevel) => scriptsForScenario(id).find(script => script.level === level);
export const scenarioStatus = (scenario: typeof SCENARIOS[number]) => {
  const written = scenario.stages.filter(stage => scriptFor(scenario.id, stage.level)).length;
  return written === 0 ? 'planned' : written === scenario.stages.length ? 'available' : 'partial';
};
export const playableScenarios = () => SCENARIOS.filter(scenario => scenarioStatus(scenario) !== 'planned');
export const scriptAnswerCount = (script: ScenarioScript, lang: TeachingLanguage) => script.beats.reduce((count, beat) =>
  beat.who !== 'you' || (beat.exercise.only && !beat.exercise.only.includes(lang)) ? count : count +
    beat.exercise.steps.filter(step => !step.only || step.only.includes(lang)).length, 0);

const levelImports = {
  'pre-a1': () => import('./levels/pre-a1.ts'), a1: () => import('./levels/a1.ts'),
  a2: () => import('./levels/a2.ts'), b1: () => import('./levels/b1.ts'), b2: () => import('./levels/b2.ts'),
};
const loading = new Map<string, Promise<void>>();
function once(key: string, work: () => Promise<void>) {
  let result = loading.get(key);
  if (!result) {
    result = work().catch(error => { loading.delete(key); throw error; });
    loading.set(key, result);
  }
  return result;
}

async function loadVocabulary() {
  return once('vocabulary', async () => {
    for (const entry of (await import('./vocabulary.ts')).VOCABULARY) Object.assign(vocabById(entry.id)!, entry);
  });
}

async function loadGrammar() {
  return once('grammar', async () => {
    const full = await import('./grammar.ts');
    for (const concept of full.GRAMMAR_CONCEPTS) Object.assign(grammarById(concept.id)!, concept);
  });
}

function hydrateExercises(catalog: Exercise[], authored: Exercise[]): Exercise[] {
  return authored.map(exercise => {
    const target = catalog.find(item => item.id === exercise.id)!;
    const steps = exercise.steps.map(step => Object.assign(target.steps.find(item => item.id === step.id)!, step));
    return Object.assign(target, exercise, { steps });
  });
}

function hydrateCheckpoint(authored: Checkpoint) {
  const target = checkpointById(authored.id)!;
  const exercises = hydrateExercises(target.exercises, authored.exercises);
  Object.assign(target, authored, { exercises });
}

/** In-place hydration preserves every catalog index and progress reference. */
export async function loadLevel(id: string): Promise<void> {
  if (!(id in levelImports)) return;
  return once(id, async () => {
    const { LEVEL, PATTERNS } = await levelImports[id as keyof typeof levelImports]();
    for (const unit of LEVEL.units) {
      for (const lesson of unit.lessons) {
        const target = lessonById(lesson.id)!;
        const exercises = hydrateExercises(target.exercises, lesson.exercises);
        const mastery = { ...lesson.mastery, exercises: hydrateExercises(target.mastery.exercises, lesson.mastery.exercises) };
        Object.assign(target, lesson, { exercises, mastery });
      }
      if (unit.checkpoint) hydrateCheckpoint(unit.checkpoint);
    }
    if (LEVEL.checkpoint) hydrateCheckpoint(LEVEL.checkpoint);
    for (const pattern of PATTERNS) Object.assign(patternById(pattern.id)!, pattern);
  });
}

export async function ensureContent(path: string): Promise<void> {
  const [route, id] = path.split('/').filter(Boolean);
  if (route === 'vocabulary' || route === 'word') {
    await loadVocabulary();
  } else if (route === 'lesson') {
    const lesson = lessonById(id ?? '');
    if (lesson) await Promise.all([loadLevel(lesson.level), loadGrammar(), loadVocabulary()]);
  } else if (route === 'checkpoint') {
    const checkpoint = checkpointById(id ?? '');
    const level = unitById(checkpoint?.targetId ?? '')?.level ?? levelById(checkpoint?.targetId ?? '')?.id;
    if (level) await Promise.all([loadLevel(level), loadGrammar(), loadVocabulary()]);
  } else if (route === 'placement') {
    await once('placement', async () => {
      hydrateCheckpoint((await import('./placement/checkpoint.ts')).PLACEMENT_CHECKPOINT);
    });
  } else if (route === 'scenario' || route === 'daily') {
    await once('scenarios', async () => {
      for (const script of (await import('./scenarios/index.ts')).SCENARIO_SCRIPTS) {
        Object.assign(scriptById(script.id)!, script);
      }
    });
    if (route === 'daily') await Promise.all([loadGrammar(), loadVocabulary(), ...CURRICULUM.map(level => loadLevel(level.id))]);
  } else if (['review', 'mistakes', 'session'].includes(route ?? '')) {
    // These rounds can mix any level, including old mistakes from a lower one.
    await Promise.all([loadGrammar(), loadVocabulary(), ...CURRICULUM.map(level => loadLevel(level.id))]);
  }
}
