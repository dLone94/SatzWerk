import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  LEVEL_OUTLINES,
  LEXICON,
  allCheckpoints,
  availableLessons,
  checkpointById,
  levelById,
} from '../../src/content/index.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * A1 is finished: six units, eighteen lessons, and a level checkpoint that
 * draws on all of them.
 *
 * These are the same questions the Pre-A1 tests ask, asked of the level that
 * came after it — a finished level has to be provably finished, or the course
 * map is making a claim nobody checked.
 */

const opts = { lexicon: LEXICON };
const a1 = () => levelById('a1')!;

describe('A1 is complete', () => {
  it('has all six units authored, with no planned units left over', () => {
    const level = a1();
    expect(level.units).toHaveLength(6);
    expect(level.units.every((unit) => unit.status === 'available')).toBe(true);
    expect(level.status).toBe('available');
    expect(LEVEL_OUTLINES.a1.plannedUnits).toEqual([]);
  });

  it('has eighteen lessons, each with sections and a mastery check', () => {
    const lessons = availableLessons().filter((lesson) => lesson.level === 'a1');
    expect(lessons).toHaveLength(18);
    for (const lesson of lessons) {
      expect(lesson.mastery.exercises.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives every unit a checkpoint that points at itself', () => {
    for (const unit of a1().units) {
      expect(unit.checkpoint, unit.id).toBeDefined();
      expect(unit.checkpoint!.scope).toBe('unit');
      expect(unit.checkpoint!.targetId).toBe(unit.id);
    }
  });

  it('covers the grammar the level promises', () => {
    const covered = new Set(
      availableLessons()
        .filter((lesson) => lesson.level === 'a1')
        .flatMap((lesson) => lesson.grammarIds),
    );
    for (const id of [
      'g-possessives',
      'g-accusative',
      'g-separable-verbs',
      'g-modal-verbs',
      'g-es-gibt',
      'g-moechten',
      'g-imperative-sie',
      'g-conjunctions',
      'g-dative-basics',
      'g-zum-zur',
      'g-impersonal-es',
      'g-bei',
    ]) {
      expect(covered.has(id), `${id} is not taught by any A1 lesson`).toBe(true);
    }
  });
});

describe('the A1 level checkpoint', () => {
  const checkpoint = checkpointById('a1-level-checkpoint');

  it('exists, is scoped to the level, and is harder than a unit checkpoint', () => {
    expect(checkpoint).toBeDefined();
    expect(checkpoint!.scope).toBe('level');
    expect(checkpoint!.targetId).toBe('a1');
    // Against A1's own unit checkpoints: another level's are calibrated on
    // different material, so mixing them in would test the course's shape
    // rather than this ladder.
    const unitPass = Math.max(
      ...allCheckpoints()
        .filter((cp) => cp.scope === 'unit' && cp.targetId.startsWith('a1-'))
        .map((cp) => cp.passAccuracy),
    );
    expect(checkpoint!.passAccuracy).toBeGreaterThan(unitPass);
    expect(a1().checkpoint?.id).toBe('a1-level-checkpoint');
  });

  it('runs without hints, the way a real test would', () => {
    for (const exercise of checkpoint!.exercises) {
      for (const step of exercise.steps) {
        expect(step.hints, step.id).toEqual([]);
      }
    }
  });

  it('draws on every unit and every skill', () => {
    const kinds = new Set(checkpoint!.exercises.map((exercise) => exercise.kind));
    expect(kinds.has('type')).toBe(true);
    expect(kinds.has('dictation')).toBe(true);
    expect(kinds.has('freeWriting')).toBe(true);
    expect(kinds.has('articleRecall')).toBe(true);
    const steps = checkpoint!.exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0);
    expect(steps).toBeGreaterThanOrEqual(25);
  });

  it('tests the accusative and the dative next to each other', () => {
    // The one distinction A1 cannot leave vague. Both have to be asked for in
    // the same exercise, or the checkpoint is only testing recall of a lesson.
    const articles = checkpoint!.exercises.find((exercise) => exercise.kind === 'articleRecall');
    expect(articles).toBeDefined();
    const answers = articles!.steps.flatMap((step) => step.answer.accepted);
    expect(answers).toContain('den');
    expect(answers).toContain('dem');
    expect(answers).toContain('zur');
    expect(answers).toContain('beim');
  });

  it('accepts every one of its own answers', () => {
    for (const exercise of checkpoint!.exercises) {
      for (const step of exercise.steps) {
        for (const accepted of step.answer.accepted) {
          const result = validateAnswer(accepted, step.answer, opts);
          expect(result.verdict, `${step.id}: ${accepted}`).toBe('correct');
        }
      }
    }
  });
});

describe('the course is honest about what comes next', () => {
  /**
   * Derived, not pinned. This test named A2 as authored and B1–B2 as empty,
   * which was a statement about how far the course had got — it broke the day
   * B1's first unit landed, having caught nothing. Twice now. What actually
   * has to hold is the honesty rule, in both directions: a level with units in
   * it is never advertised as planned, and a level with none is never
   * advertised as anything else.
   */
  it('never calls a level planned once it has units, or available while it has none', () => {
    for (const level of CURRICULUM) {
      if (level.units.length > 0) {
        expect(level.status, `${level.id} has units but says planned`).not.toBe('planned');
      } else {
        expect(level.status, `${level.id} has no units`).toBe('planned');
      }
    }
    // And the empty ones are the tail of the course: levels are authored in
    // order, so a gap in the middle would mean something had gone wrong.
    const empty = CURRICULUM.filter((level) => level.units.length === 0);
    expect(CURRICULUM.slice(CURRICULUM.length - empty.length)).toEqual(empty);
  });
});
