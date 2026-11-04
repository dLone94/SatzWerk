/** Easing and timing for the wooden scenes. Plain numbers in, plain numbers out. */

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeInQuad = (t: number) => t * t;

/** A drop with two small bounces, 0 → 1. */
export function bounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
  if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
  t -= 2.625 / d1;
  return n1 * t * t + 0.984375;
}

/** Squash after a landing at time `at`: a damped wobble around 1. */
export function squash(t: number, at: number): number {
  const k = t - at;
  if (k < 0 || k > 0.7) return 1;
  return 1 - Math.sin(k * 22) * Math.exp(-k * 7) * 0.22;
}

/**
 * A seeded random sequence, one per scene, so a scene looks the same every
 * time it is drawn: the trees lean the same way on every visit.
 */
export function seeded(seed = 7): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
