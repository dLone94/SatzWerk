import { describe, expect, it } from 'vitest';
import { StudyClock } from '../../src/core/progress/studyClock.ts';

describe('active study time', () => {
  it('excludes non-learning screens and the background', () => {
    const clock = new StudyClock(0);
    expect(clock.sample(30_000)).toBe(0);
    clock.setEligible(true, 30_000);
    expect(clock.setEligible(false, 55_000)).toBe(25);
    expect(clock.sample(600_000)).toBe(0);
    clock.setEligible(true, 600_000);
    expect(clock.sample(610_000)).toBe(10);
  });
  it('caps idle time at two minutes, even after a suspended timer', () => {
    const clock = new StudyClock(0);
    clock.setEligible(true, 0);
    expect(clock.sample(30_000)).toBe(30);
    expect(clock.sample(600_000)).toBe(90);
    expect(clock.status(600_000)).toBe('paused');
    expect(clock.interact(610_000)).toBe(0);
    expect(clock.status(610_000)).toBe('active');
    expect(clock.sample(625_000)).toBe(15);
  });
  it('preserves fractional seconds across short visits', () => {
    const clock = new StudyClock(0);
    clock.setEligible(true, 0);
    expect(clock.setEligible(false, 450)).toBe(0.45);
    clock.setEligible(true, 500);
    expect(clock.sample(1100)).toBe(0.6);
  });
});
