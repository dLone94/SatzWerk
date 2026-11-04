import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadsInFlight, track, whenQuiet } from '../../src/services/loading.ts';

/**
 * The 3D engine waits for a quiet line: on a slow connection its download
 * used to share the line with the lesson the learner had just opened, and
 * the lesson took seconds longer.
 */

afterEach(() => {
  vi.useRealTimers();
});

describe('waiting for a quiet line', () => {
  it('waits until nothing tracked has been loading for the whole time asked', async () => {
    vi.useFakeTimers();
    let release!: () => void;
    const page = track(new Promise<void>((resolve) => { release = resolve; }));
    expect(loadsInFlight()).toBe(1);
    let quiet = false;
    void whenQuiet(2000).then(() => { quiet = true; });
    await vi.advanceTimersByTimeAsync(5000);
    expect(quiet).toBe(false);
    release();
    await page;
    await vi.advanceTimersByTimeAsync(1500);
    expect(quiet).toBe(false);
    // Another download in the meantime starts the wait again.
    await track(Promise.resolve());
    await vi.advanceTimersByTimeAsync(1500);
    expect(quiet).toBe(false);
    await vi.advanceTimersByTimeAsync(600);
    expect(quiet).toBe(true);
    expect(loadsInFlight()).toBe(0);
  });

  it('waits the whole time even when the line was already quiet', async () => {
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(10_000);
    let quiet = false;
    void whenQuiet(2000).then(() => { quiet = true; });
    await vi.advanceTimersByTimeAsync(1900);
    expect(quiet).toBe(false);
    await vi.advanceTimersByTimeAsync(200);
    expect(quiet).toBe(true);
  });

  it('counts a failed download as over, and can be given up', async () => {
    await track(Promise.reject(new Error('offline'))).catch(() => undefined);
    await Promise.resolve();
    expect(loadsInFlight()).toBe(0);
    const abort = new AbortController();
    const waiting = whenQuiet(60_000, abort.signal);
    abort.abort();
    await expect(waiting).rejects.toThrow();
  });
});
