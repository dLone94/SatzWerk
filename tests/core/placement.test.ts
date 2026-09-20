import { describe, expect, it } from 'vitest';
import { PASS_SHARE, placementResult, type PlacementAnswer } from '../../src/core/progress/placement.ts';
import type { CefrLevel } from '../../src/content/types.ts';

const LEVELS: CefrLevel[] = ['pre-a1', 'a1', 'a2', 'b1', 'b2'];

/** n answers at one level, `right` of them correct. */
function band(level: CefrLevel, asked: number, right: number): PlacementAnswer[] {
  return Array.from({ length: asked }, (_, index) => ({
    stepId: `${level}-${index}`,
    level,
    correct: index < right,
  }));
}

describe('placement scoring', () => {
  it('starts a complete beginner at the bottom', () => {
    const answers = LEVELS.flatMap((level) => band(level, 4, 0));
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('pre-a1');
    expect(result.highestPassed).toBeNull();
    expect(result.toppedOut).toBe(false);
  });

  it('starts at the first level that was not passed', () => {
    const answers = [
      ...band('pre-a1', 4, 4),
      ...band('a1', 4, 4),
      ...band('a2', 4, 1),
      ...band('b1', 4, 0),
      ...band('b2', 4, 0),
    ];
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('a2');
    expect(result.highestPassed).toBe('a1');
  });

  it('recommends the first gap rather than the level above the best band', () => {
    /*
     * Somebody who picked German up by ear: fluent-ish sentences at B1, no
     * article table at A2. Sending them to B2 on the strength of the good band
     * would skip the thing they came for.
     */
    const answers = [
      ...band('pre-a1', 4, 4),
      ...band('a1', 4, 4),
      ...band('a2', 4, 1),
      ...band('b1', 4, 4),
      ...band('b2', 4, 0),
    ];
    const result = placementResult(answers, LEVELS);
    expect(result.startAt).toBe('a2');
    expect(result.highestPassed).toBe('b1');
  });

  it('tops out when every band passes, and points at the last level', () => {
    const answers = LEVELS.flatMap((level) => band(level, 4, 4));
    const result = placementResult(answers, LEVELS);
    expect(result.toppedOut).toBe(true);
    expect(result.startAt).toBe('b2');
    expect(result.highestPassed).toBe('b2');
  });

  it('passes a band at exactly the threshold and fails it just below', () => {
    expect(placementResult(band('a1', 3, 2), ['a1']).bands[0]!.passed).toBe(true);
    expect(placementResult(band('a1', 3, 1), ['a1']).bands[0]!.passed).toBe(false);
    expect(placementResult(band('a1', 4, 3), ['a1']).bands[0]!.passed).toBe(true);
    expect(placementResult(band('a1', 4, 2), ['a1']).bands[0]!.passed).toBe(false);
    expect(PASS_SHARE).toBeGreaterThan(0.5);
  });

  it('never counts a level it did not ask about as passed', () => {
    // Only A1 was asked. B1 must not be treated as known just because nothing
    // contradicted it.
    const result = placementResult(band('a1', 4, 4), LEVELS);
    expect(result.bands.find((entry) => entry.level === 'b1')).toMatchObject({
      asked: 0,
      right: 0,
      passed: false,
    });
    // Asked only about A1 and passed it: the honest next step is the level
    // above the highest one it actually tested, and it must not claim to have
    // topped out when it never asked a B2 question.
    expect(result.startAt).toBe('a2');
    expect(result.toppedOut).toBe(false);
  });

  it('reports the bands in course order whatever order the answers arrive in', () => {
    const shuffled = [...band('b1', 2, 2), ...band('pre-a1', 2, 2), ...band('a2', 2, 0)];
    const result = placementResult(shuffled, ['b1', 'pre-a1', 'a2']);
    expect(result.bands.map((entry) => entry.level)).toEqual(['pre-a1', 'a2', 'b1']);
  });

  it('counts the totals it was given', () => {
    const result = placementResult([...band('a1', 4, 3), ...band('a2', 4, 1)], LEVELS);
    expect(result.asked).toBe(8);
    expect(result.right).toBe(4);
  });

  it('falls back to the bottom when it was asked nothing at all', () => {
    const result = placementResult([], LEVELS);
    expect(result.startAt).toBe('pre-a1');
    expect(result.toppedOut).toBe(false);
    expect(result.highestPassed).toBeNull();
  });
});
