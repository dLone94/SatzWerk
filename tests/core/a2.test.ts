import { describe, expect, it } from 'vitest';
import {
  LEVEL_OUTLINES,
  LEXICON,
  allCheckpoints,
  availableLessons,
  checkpointById,
  levelById,
} from '../../src/content/index.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * A2 is finished: five units, fifteen lessons, and a level checkpoint.
 *
 * The same questions the Pre-A1 and A1 tests ask, asked of the third level. A
 * finished level has to be provably finished, or the course map is making a
 * claim nobody checked.
 */

const opts = { lexicon: LEXICON };
const a2 = () => levelById('a2')!;

describe('A2 is complete', () => {
  it('has all five units authored, with no planned units left over', () => {
    const level = a2();
    expect(level.units).toHaveLength(5);
    expect(level.units.every((unit) => unit.status === 'available')).toBe(true);
    expect(level.status).toBe('available');
    expect(LEVEL_OUTLINES.a2.plannedUnits).toEqual([]);
  });

  it('has fifteen lessons, each with sections and a mastery check', () => {
    const lessons = availableLessons().filter((lesson) => lesson.level === 'a2');
    expect(lessons).toHaveLength(15);
    for (const lesson of lessons) {
      expect(lesson.mastery.exercises.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.sections.length, lesson.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives every unit a checkpoint that points at itself', () => {
    for (const unit of a2().units) {
      expect(unit.checkpoint, unit.id).toBeDefined();
      expect(unit.checkpoint!.scope).toBe('unit');
      expect(unit.checkpoint!.targetId).toBe(unit.id);
    }
  });

  it('covers the grammar the level promises', () => {
    const covered = new Set(
      availableLessons()
        .filter((lesson) => lesson.level === 'a2')
        .flatMap((lesson) => lesson.grammarIds),
    );
    for (const id of [
      'g-perfekt-haben',
      'g-partizip-2',
      'g-perfekt-sein',
      'g-praeteritum-war-hatte',
      'g-wechselpraepositionen',
      'g-stellen-legen',
      'g-weil',
      'g-dass',
      'g-wenn',
      'g-futur',
      'g-reflexive',
      'g-sollen',
      'g-imperativ-du',
      'g-komparativ',
      'g-superlativ',
      'g-adjektivendungen',
    ]) {
      expect(covered.has(id), `${id} is not taught by any A2 lesson`).toBe(true);
    }
  });
});

describe('the A2 level checkpoint', () => {
  const checkpoint = checkpointById('a2-level-checkpoint');

  it('exists, is scoped to the level, and is harder than a unit checkpoint', () => {
    expect(checkpoint).toBeDefined();
    expect(checkpoint!.scope).toBe('level');
    expect(checkpoint!.targetId).toBe('a2');
    const unitPass = Math.max(
      ...allCheckpoints()
        .filter((cp) => cp.scope === 'unit' && cp.targetId.startsWith('a2-'))
        .map((cp) => cp.passAccuracy),
    );
    expect(checkpoint!.passAccuracy).toBeGreaterThan(unitPass);
    expect(a2().checkpoint?.id).toBe('a2-level-checkpoint');
  });

  it('runs without hints', () => {
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
    expect(kinds.has('fillBlank')).toBe(true);
    const steps = checkpoint!.exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0);
    expect(steps).toBeGreaterThanOrEqual(25);
  });

  /**
   * The two decisions A2 exists to make automatic. B1 assumes both silently, so
   * a checkpoint that let either slide would be lying about what the level was
   * for — and both are asked as single words, where there is nowhere to hide
   * behind a sentence that happens to sound right.
   */
  it('tests both auxiliaries and both cases after a two-way preposition', () => {
    const gaps = checkpoint!.exercises.find((exercise) => exercise.kind === 'fillBlank');
    expect(gaps).toBeDefined();
    const answers = gaps!.steps.flatMap((step) => step.answer.accepted);
    expect(answers).toContain('habe');
    expect(answers).toContain('bin');
    expect(answers).toContain('der');
    expect(answers).toContain('die');
    expect(answers).toContain('sich');
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
