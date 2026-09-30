/**
 * Registering the service worker, so the app can be opened without a signal.
 *
 * It used to be registered only when somebody switched reminders on, because
 * pushes were the only thing it did. That left the worker absent for anyone
 * who had not — which is most people, and it meant SatzWerk could not be
 * opened in the places it was built for: fresh with no signal, the browser
 * showed its own "No internet" page and the app never ran.
 *
 * So it is registered on every start now. Nothing about the push flow changes:
 * `enablePush` still calls `register` and gets the same worker back, because
 * registering the same script at the same scope twice is one registration.
 */

/** Left alone in a browser without service workers, and in the tests. */
export function registerServiceWorker(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  // Not over plain http from another machine: a browser refuses the
  // registration there, and the thrown error is noise rather than news.
  if (!globalThis.isSecureContext) return;

  // After load, so fetching the worker never competes with the app's own
  // first paint — the thing this whole feature exists to make faster.
  const start = () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // A failed registration costs the offline open and nothing else. The app
      // is already running by the time this happens.
    });
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });

  watchForNewBuild();
}

/**
 * Long enough away that reloading interrupts nothing: the learner put the
 * phone down, not glanced at a message. A lesson left half-way resumes at its
 * first unfinished step, and anything unsent is in the outbox, so a reload
 * after this long costs nothing.
 */
const AWAY_MS = 10 * 60_000;

/**
 * Pick up a new build when an app left open comes back to the front.
 *
 * The worker's file is the same from deploy to deploy, so nothing ever told a
 * running page there was a new version, and iOS keeps a Home Screen app in
 * memory for days: it went on running the build it started with. So when the
 * app comes back after a while away, the current build's file list is asked
 * for, and if the script this page is running is no longer in it, the page
 * reloads. Without a signal nothing happens; the old build still works.
 *
 * Returns a function that stops watching (for tests).
 */
export function watchForNewBuild(reload: () => void = () => window.location.reload()): () => void {
  let hiddenAt = 0;
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
      return;
    }
    if (hiddenAt === 0 || Date.now() - hiddenAt < AWAY_MS) return;
    hiddenAt = 0;
    void newBuildIsOut().then((changed) => {
      if (changed) reload();
    });
  };
  document.addEventListener('visibilitychange', onVisibility);
  return () => document.removeEventListener('visibilitychange', onVisibility);
}

async function newBuildIsOut(): Promise<boolean> {
  const running = [...document.querySelectorAll<HTMLScriptElement>('script[src]')]
    .map((script) => new URL(script.src, window.location.href).pathname)
    .filter((path) => path.startsWith('/assets/'));
  // A dev server serves source files, not a build: nothing to compare.
  if (running.length === 0) return false;
  try {
    const response = await fetch('/asset-manifest.json', { cache: 'no-store' });
    if (!response.ok) return false;
    const manifest = (await response.json()) as { files?: unknown };
    if (!Array.isArray(manifest.files) || manifest.files.length === 0) return false;
    const current = new Set(manifest.files);
    return running.some((path) => !current.has(path));
  } catch {
    return false;
  }
}
