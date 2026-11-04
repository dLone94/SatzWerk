/**
 * Whether the app is fetching code or content the learner is waiting for.
 *
 * The pages and the course's content arrive as chunks of their own. Things
 * that are only nice to have — the wooden scenes' 3D engine — wait until
 * none of these is on the line, so on a slow connection they never hold up
 * the lesson the learner just opened.
 */

let inFlight = 0;
let quietSince = typeof performance === 'undefined' ? 0 : performance.now();
const listeners = new Set<() => void>();

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

/** Count `work` as a download the learner is waiting for, until it settles. */
export function track<T>(work: Promise<T>): Promise<T> {
  inFlight++;
  const settle = () => {
    inFlight = Math.max(0, inFlight - 1);
    if (inFlight === 0) {
      quietSince = now();
      for (const listener of [...listeners]) listener();
    }
  };
  work.then(settle, settle);
  return work;
}

/**
 * Resolves once nothing tracked has been loading for `ms` milliseconds in a
 * row, counted from no earlier than the call: what is asked for straight
 * after the first screen often comes a moment later, as the learner taps on.
 * A new download in that time starts the wait again. `signal` gives up the
 * wait, as when the page that asked is left.
 */
export function whenQuiet(ms: number, signal?: AbortSignal): Promise<void> {
  const asked = now();
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => {
      if (timer !== undefined) clearTimeout(timer);
      listeners.delete(check);
      signal?.removeEventListener('abort', abort);
    };
    const abort = () => {
      stop();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    function check() {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      if (inFlight > 0) return;
      const left = ms - (now() - Math.max(quietSince, asked));
      if (left <= 0) {
        stop();
        resolve();
      } else {
        timer = setTimeout(check, left);
      }
    }
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    signal?.addEventListener('abort', abort);
    // A download that starts while waiting restarts the clock when it ends.
    listeners.add(check);
    check();
  });
}

/** For tests: how many tracked downloads are on the line. */
export function loadsInFlight(): number {
  return inFlight;
}
