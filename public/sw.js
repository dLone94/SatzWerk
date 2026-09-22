/*
 * The service worker: push notifications, and opening the app without a
 * connection.
 *
 * ## Why this now caches, when it deliberately did not before
 *
 * The original rule here was that nothing would be cached, because an offline
 * cache for an app whose every answer goes to a database would mean showing a
 * learner stale progress. That reasoning was right about progress and wrong
 * about the app.
 *
 * This app is for a phone: a queue at the bakery, the U-Bahn, a flat whose
 * signal dies at the kitchen table. The outbox holds an answer typed in any of
 * those places — but only if the app is already open. Opened fresh with no
 * signal, SatzWerk did not appear at all; the browser showed its own "No
 * internet" page. Every one of the places this app was built for was a place
 * it could not be started. That was measured in a browser, not assumed.
 *
 * So the line is drawn between the app and the learner's data, not between
 * caching and not caching:
 *
 *  - **The app is cached.** The HTML, the JavaScript, the stylesheet, the
 *    icons. They are the same for everybody and they change only on a deploy,
 *    so serving them from the cache is not staleness, it is the app.
 *  - **`/api` is never cached.** Not the state, not the profile, not one
 *    answer. Offline, those requests fail exactly as they did before and the
 *    app says so. Nothing is invented, and no number appears that the database
 *    has not confirmed.
 *
 * Which means a learner with no signal gets the app and an honest "the server
 * cannot be reached" — instead of a dead browser page.
 */

/*
 * Bumped when the caching rules change, never for a content change. The
 * filenames under /assets/ carry their own content hash, so a deploy brings
 * new names rather than new contents under old names — and the old ones are
 * swept below.
 */
const CACHE = 'satzwerk-app-v1';

/** The pages the app is entered through, which must exist offline. */
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/icon-180.png'];

/**
 * The built files, whose names carry a content hash and so cannot be written
 * here. The build writes them down instead; see `assetManifest` in
 * vite.config.ts.
 *
 * Without this the app was openable offline only by the grace of the browser's
 * HTTP cache: the worker does not control the page that registered it, so the
 * very fetches that load the app happen before it can see them, and they were
 * never cached. That worked until a phone evicted them, which is exactly the
 * moment somebody is on a train.
 */
async function builtAssets() {
  try {
    const response = await fetch('/asset-manifest.json', { cache: 'no-cache' });
    if (!response.ok) return [];
    const manifest = await response.json();
    return Array.isArray(manifest.files) ? manifest.files : [];
  } catch {
    // A dev server has no manifest, and that is not an error there.
    return [];
  }
}

self.addEventListener('install', (event) => {
  // Take over immediately rather than waiting for every tab to close.
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const urls = [...SHELL, ...(await builtAssets())];
      // Individually, because one missing icon must not leave the whole app
      // uncached — the point of this is that opening it works.
      await Promise.all(urls.map((url) => cache.add(url).catch(() => undefined)));
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Sweep the caches a previous version of these rules left behind.
      const names = await caches.keys();
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

/** Anything under this is the learner's data and belongs to the server alone. */
function isApi(url) {
  return url.pathname === '/api' || url.pathname.startsWith('/api/');
}

/**
 * A built asset: its name contains its content hash, so it never changes. A
 * recorded phrase is the same: its name is a hash of the German it says, so
 * once heard it is kept and plays offline. (The recordings' manifest is not
 * one of these; it changes when phrases are added, so it is fetched fresh.)
 */
function isImmutable(url) {
  return url.pathname.startsWith('/assets/') || (url.pathname.startsWith('/audio/') && url.pathname.endsWith('.mp3'));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The one thing that is never cached, and never served from a cache. A stale
  // answer here would be a lie about somebody's progress, which is the whole
  // reason this worker used to cache nothing at all.
  if (isApi(url)) return;

  if (isImmutable(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigations and everything else: the network when there is one, so a
  // deploy is picked up on the next open, and the cache when there is not.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }
  event.respondWith(networkFirst(request));
});

/**
 * A hashed asset cannot have changed, so asking the network about it is a
 * round trip that can only return what is already held.
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await keep(request, response);
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await keep(request, response);
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

/**
 * Every route of a single-page app is the same document, so a URL that was
 * never visited online still opens offline: the cached page is served and the
 * router takes it from there.
 */
async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    await keep(request, response);
    return response;
  } catch (error) {
    return (
      (await caches.match(request)) ??
      (await caches.match('/index.html')) ??
      (await caches.match('/')) ??
      Response.error()
    );
  }
}

/** Keep a good response. A redirect or an error page is not worth holding. */
async function keep(request, response) {
  if (!response || !response.ok || response.type !== 'basic') return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
}

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A push with no readable body still means something is due; the app is a
    // better place to find out what than a notification that fails to appear.
    payload = {};
  }

  const title = payload.title || 'SatzWerk';
  const body = payload.body || '';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      // The app's own icon, so the notification is recognisable on a lock
      // screen rather than showing a generic browser badge.
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      // One reminder replaces the previous one instead of stacking up: two
      // notifications saying different counts would be worse than one saying
      // the current one.
      tag: 'satzwerk-review-due',
      renotify: false,
      data: { url: payload.url || '/session' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/session';

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Reuse a window that is already open rather than stacking another copy
      // of the app on top of it.
      for (const client of clientList) {
        if ('focus' in client) {
          await client.focus();
          if ('navigate' in client) await client.navigate(target).catch(() => {});
          return;
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target);
    })(),
  );
});
