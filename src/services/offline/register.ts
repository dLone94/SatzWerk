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
}
