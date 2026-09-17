import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allCheckpoints, availableLessons, contentStats, lessonExercises } from '../../src/content/index.ts';

/**
 * The README is the only description of this project anyone reads before
 * running it, and it drifted once already: it advertised unit 3 and 4 lessons
 * ("Saying how old you are", "Asking how much and how many") that do not
 * exist. These checks tie the prose to the content it describes.
 */

const README = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');

describe('the README describes the content that exists', () => {
  it('names every authored lesson', () => {
    const missing = availableLessons()
      .map((lesson) => lesson.title.en)
      .filter((title) => !README.includes(title));
    expect(missing).toEqual([]);
  });

  it('quotes the real totals', () => {
    const stats = contentStats();
    // The README counts exercises and answer tasks across the lessons *and* the
    // checkpoints, and says so; contentStats().exercises is lessons only.
    const exercises = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ];
    const steps = exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0);
    for (const figure of [
      `${stats.lessons} lessons`,
      `${stats.vocabulary} vocabulary entries`,
      `${stats.grammarConcepts} grammar concepts`,
      `${exercises.length} exercises`,
      `${steps}\nanswer tasks`,
    ]) {
      expect(README, `README does not say "${figure}"`).toContain(figure);
    }
  });

  it('does not claim a level is finished while it is only planned', () => {
    // A1-B2 are outlines. If that ever changes, this line has to change with it.
    expect(README).toContain('Levels A1–B2 exist as structure and outline only');
  });
});
