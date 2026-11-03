import { describe, expect, it } from 'vitest';
import { allLessons } from '../../src/content/index.ts';
import { nounWithArticle } from '../../src/content/authoring.ts';

const bi = (en: string, bg: string) => ({ en, bg });

/*
 * The noun drill asks for the bare noun, then for the noun with its article.
 * The second stage opened with "Correct." whatever happened in the first: a
 * learner told "Almost right." a moment before read "Correct." next, and one
 * picking up a half-done lesson met it as the very first word.
 */
describe('the second stage of the noun drill', () => {
  it('does not say the first stage was right', () => {
    const drill = nounWithArticle('nouns', bi('Nouns', 'Съществителни'), [
      { prompt: bi('dog', 'куче'), bare: 'Hund', withArticle: 'der Hund', vocabId: 'v-hund' },
    ]);
    const second = drill.steps[1]!;
    expect(second.instruction?.en).toBe('Now write the full noun with its article.');
    expect(second.instruction?.bg).toBe('Сега напиши цялото съществително с члена.');
  });

  it('holds for every noun drill in the course', () => {
    const steps = allLessons()
      .flatMap((lesson) => lesson.exercises)
      .filter((exercise) => exercise.kind === 'nounWithArticle')
      .flatMap((exercise) => exercise.steps);
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.instruction?.en ?? '', step.id).not.toMatch(/^Correct/);
      expect(step.instruction?.bg ?? '', step.id).not.toMatch(/^Вярно/);
    }
  });
});
