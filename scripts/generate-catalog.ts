import { writeFile } from 'node:fs/promises';
import { CURRICULUM, SENTENCE_PATTERNS, GRAMMAR_CONCEPTS, PLACEMENT_CHECKPOINT, SCENARIO_SCRIPTS, VOCABULARY } from '../src/content/index.ts';
import type { Checkpoint, Exercise, Lesson } from '../src/content/types.ts';

// The startup catalog carries progress and navigation metadata, not teaching
// text or playable answers. Learning routes hydrate their content first.
const empty = { en: '', bg: '' };
const exercise = (item: Exercise) => ({
  id: item.id, kind: item.kind, level: item.level, only: item.only, objective: empty,
  steps: item.steps.map(step => ({
    id: step.id, only: step.only, prompt: null, hints: [], reviewTargets: step.reviewTargets,
    answer: { shape: step.answer.shape, accepted: [], trapAnswers: step.answer.trapAnswers?.map(trap =>
      ({ category: trap.category, answer: '', feedback: empty })) },
  })),
});
const checkpoint = (item: Checkpoint | undefined) => item && ({ ...item, exercises: item.exercises.map(exercise) });
const lesson = (item: Lesson) => ({
  ...item, outcomes: [], summary: undefined, patterns: undefined,
  sections: item.sections.map(section => ({ id: section.id, kind: section.kind, only: section.only, title: empty, blocks: [] })),
  exercises: item.exercises.map(exercise),
  mastery: { ...item.mastery, exercises: item.mastery.exercises.map(exercise) },
});
const catalog = {
  vocabulary: VOCABULARY.map(({ pronunciation, example, notes, collocations, related, ...entry }) =>
    ({ ...entry, example: { de: '', gloss: empty } })),
  curriculum: CURRICULUM.map(level => ({ ...level,
    checkpoint: checkpoint(level.checkpoint),
    units: level.units.map(unit => ({ ...unit, lessons: unit.lessons.map(lesson), checkpoint: checkpoint(unit.checkpoint) })),
  })),
  patterns: SENTENCE_PATTERNS,
  grammar: GRAMMAR_CONCEPTS.map(concept => ({ ...concept, blocks: [] })),
  placement: checkpoint(PLACEMENT_CHECKPOINT),
  scripts: SCENARIO_SCRIPTS.map(script => ({ ...script, beats: script.beats.map(beat =>
    beat.who === 'you' ? { ...beat, exercise: exercise(beat.exercise) } : { ...beat, de: '', text: empty }) })),
};
await writeFile(new URL('../src/content/catalog.generated.json', import.meta.url), JSON.stringify(catalog));

