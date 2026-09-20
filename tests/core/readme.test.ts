import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  allCheckpoints,
  availableLessons,
  contentStats,
  CURRICULUM,
  lessonExercises,
} from '../../src/content/index.ts';

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

  /**
   * Derived from the curriculum rather than pinned to a sentence.
   *
   * The earlier version asserted one fixed line, which was true until A1's
   * first unit landed and then became a claim the README was making about
   * content that had changed underneath it. This asks the content which levels
   * are empty and which have only started, and requires the prose to say so.
   */
  it('does not claim a level is finished while it is only planned', () => {
    const empty = CURRICULUM.filter((level) => level.units.length === 0);
    const started = CURRICULUM.filter(
      (level) => level.units.length > 0 && level.status === 'partial',
    );
    // Derived rather than pinned. This listed A2, B1 and B2 by name until A2's
    // first unit landed, at which point the test was asserting how far the
    // course had got rather than whether the README told the truth about it.
    // What has to hold is that the empty levels are the tail of the course and
    // that the README names exactly that range.
    expect(empty.length).toBeGreaterThan(0);
    expect(CURRICULUM.slice(-empty.length)).toEqual(empty);
    // The claim, not its exact wording. This used to pin the sentence
    // "Levels B1–B2 exist as structure and outline only", which stopped being
    // a sentence at all once only one level was left — "Levels B2–B2" is not
    // English. What has to hold is that the README says the phrase and names
    // every level it applies to.
    expect(README).toContain('exists as structure and outline only');
    for (const level of empty) {
      expect(README, `README does not name ${level.label} as unauthored`).toMatch(
        new RegExp(`${level.label}[^.]{0,200}?(outline only|not authored)`),
      );
    }

    // A level with some of its units written is neither finished nor planned,
    // and the README has to say which it is.
    for (const level of started) {
      expect(README, `README does not say ${level.label} has begun`).toContain(
        `${level.label} has begun`,
      );
    }
    expect(README).not.toContain('Levels A1–B2 exist as structure and outline only');
  });
});
