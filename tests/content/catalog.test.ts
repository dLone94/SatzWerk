import { expect, it, vi } from 'vitest';
import * as full from '../../src/content/index.ts';
import catalog from '../../src/content/catalog.generated.json';
import { createRegistry } from '../../src/content/registry.ts';
import type { Checkpoint, GrammarConcept, Level, SentencePattern, VocabEntry } from '../../src/content/types.ts';

it('keeps startup counts, ordering and review targeting identical to authored content', () => {
  const data = structuredClone(catalog);
  const thin = createRegistry(data.curriculum as unknown as Level[], data.patterns as SentencePattern[],
    data.grammar as unknown as GrammarConcept[], data.placement as unknown as Checkpoint, data.vocabulary as unknown as VocabEntry[]);
  expect(thin.contentStats()).toEqual(full.contentStats());
  expect(thin.lessonsInOrder().map(item => item.id)).toEqual(full.lessonsInOrder().map(item => item.id));
  for (const lesson of full.allLessons()) {
    const metadata = thin.lessonById(lesson.id)!;
    expect(metadata.sections.map(section => [section.id, section.only])).toEqual(lesson.sections.map(section => [section.id, section.only]));
    expect(thin.lessonExercises(metadata).flatMap(item => item.steps.map(step => step.id))).toEqual(full.lessonExercises(lesson).flatMap(item => item.steps.map(step => step.id)));
  }
  for (const word of full.VOCABULARY) expect(thin.resolveTarget(word.id)).toEqual(full.resolveTarget(word.id));
  expect(thin.categoryPracticeCounts()).toEqual(full.categoryPracticeCounts());
});

it('hydrates a cold learning route in place before its answers can be played', async () => {
  vi.resetModules();
  const browser = await import('../../src/content/browser.ts');
  const lesson = browser.allLessons()[0]!;
  const step = lesson.exercises[0]!.steps[0]!;
  expect(step.answer.accepted).toEqual([]);
  await browser.ensureContent(`/lesson/${lesson.id}`);
  expect(browser.lessonById(lesson.id)!.exercises[0]!.steps[0]).toBe(step);
  expect(step.answer.accepted).toEqual(full.lessonById(lesson.id)!.exercises[0]!.steps[0]!.answer.accepted);
  expect(lesson.sections.some(section => section.blocks.length)).toBe(true);
  expect(browser.vocabById(full.VOCABULARY[0]!.id)).toEqual(full.VOCABULARY[0]);
});
