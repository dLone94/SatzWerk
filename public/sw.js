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
 * new names rather than new contents under old names.
 *
 * This file is the same from one deploy to the next, so a deploy does not
 * install a new worker, and a new cache name would not help: it would also
 * throw away every recording the phone has downloaded. Instead each fresh
 * page tells the worker which build is current, and the files of any other
 * build are swept out of this one cache (see `refreshBuild`).
 */
const CACHE = 'satzwerk-app-v1';

/*
 * How long a page waits for the network before the copy held here is used.
 * With bars on the phone and no data arriving — the U-Bahn, a captive wifi —
 * the network does not fail, it just never answers, and waiting for it left
 * the Home Screen app blank. Long enough for a slow but working connection
 * to win; short enough that a dead one is not noticed.
 */
const PAGE_DEADLINE_MS = 3000;

/** The one key every route's page is kept under: they are the same document. */
const PAGE_KEY = '/index.html';

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
      // And any files of a build that is no longer the current one.
      await refreshBuild();
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
    event.respondWith(networkFirstPage(event));
    return;
  }
  event.respondWith(networkFirst(request));
});

/**
 * A hashed asset cannot have changed, so asking the network about it is a
 * round trip that can only return what is already held.
 */
async function cacheFirst(request) {
  const range = request.headers && request.headers.get('range');
  if (range) return fromWholeFile(request.url, range);
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
 * never visited online still opens offline: the held page is served and the
 * router takes it from there.
 *
 * The network is asked first, so a deploy is picked up on the next open — but
 * only for a few seconds. After that the held page is used, and the network's
 * answer, when it comes, is kept for the next open instead.
 */
async function networkFirstPage(event) {
  const request = event.request;
  const network = fetch(request);
  // Kept, and the build brought up to date, after the page has its answer —
  // and the worker must live until that is done, even when the held copy
  // answered long before. The copy is taken at once, before the page reads
  // the body.
  event.waitUntil(
    network
      .then((response) => {
        if (!isWhole(response)) return undefined;
        const copy = response.clone();
        return keepPage(copy).then(refreshBuild);
      })
      .catch(() => undefined),
  );

  try {
    const response = await Promise.race([network, deadline(PAGE_DEADLINE_MS)]);
    if (response) return response;
  } catch {
    // No network at all: the held page, below.
  }

  const held = await heldPage();
  if (held) return held;
  // Nothing held — a first visit on a slow line. Waiting is all there is.
  try {
    return await network;
  } catch {
    return Response.error();
  }
}

function deadline(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(undefined), ms));
}

async function heldPage() {
  return (await caches.match(PAGE_KEY)) ?? (await caches.match('/')) ?? undefined;
}

/**
 * The page, under one key for every route. It used to be kept once per URL
 * visited, each copy pointing at the build of its day, while the offline
 * fallback stayed the copy from install — so offline, the app could start a
 * version weeks old.
 */
async function keepPage(response) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(PAGE_KEY, response.clone());
    await cache.put('/', response.clone());
  } catch {
    // Keeping a copy is a bonus, not a reason to fail the page.
  }
}

/**
 * Bring the cache to the current build: fetch whatever of it is missing, and
 * delete the files of every other build and the per-route page copies older
 * versions of this worker kept. Recordings are left alone — they are named by
 * what they say, not by build.
 *
 * Nothing is deleted unless the current build's list was read: offline, or on
 * a dev server with no list, sweeping could remove the only copy of the app.
 */
async function refreshBuild() {
  const files = await builtAssets();
  if (files.length === 0) return;
  try {
    const cache = await caches.open(CACHE);
    const current = new Set([...SHELL, ...files]);
    const held = new Set();
    for (const key of await cache.keys()) {
      const path = new URL(key.url).pathname;
      held.add(path);
      if (current.has(path) || path.startsWith('/audio/')) continue;
      if (path.startsWith('/assets/') || (await isPage(cache, key))) await cache.delete(key);
    }
    // So the next time there is no signal the whole build is here, not only
    // the parts this visit happened to load.
    await Promise.all(
      files.filter((path) => !held.has(path)).map((path) => cache.add(path).catch(() => undefined)),
    );
  } catch {
    // A sweep that fails leaves the cache as it was, which still works.
  }
}

async function isPage(cache, key) {
  const response = await cache.match(key);
  const type = response && response.headers ? response.headers.get('Content-Type') : null;
  return Boolean(type && type.includes('text/html'));
}

function isWhole(response) {
  return Boolean(response) && response.status === 200 && response.type === 'basic';
}

/** Keep a good response. A redirect or an error page is not worth holding. */
async function keep(request, response) {
  // Only a whole, successful answer. A 206 cannot be stored at all, and
  // trying used to throw and fail the very request it was answering.
  if (!isWhole(response)) return;
  try {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  } catch {
    // Out of space, or anything else: keeping a copy is a bonus, not a reason
    // to fail the request.
  }
}

/*
 * Audio asked for in pieces.
 *
 * Safari plays a clip by asking for byte ranges ("bytes=0-1", then the rest),
 * and the server answers each with a 206. Those cannot be cached, and this
 * worker used to fail the request trying, so on an iPhone every recording
 * errored and the app fell back to the phone's own voice. Now the whole clip
 * is fetched once and kept, and each piece is cut from it — which also means
 * a clip heard once plays offline, as it always meant to.
 */
async function fromWholeFile(url, range) {
  let whole = await caches.match(url);
  if (!whole) {
    whole = await fetch(url);
    await keep(url, whole);
  }
  if (whole.status !== 200) return whole;
  const bytes = await whole.clone().arrayBuffer();
  return piece(bytes, range, whole.headers.get('Content-Type'));
}

function piece(bytes, range, type) {
  const size = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start;
  let end;
  if (match && match[1] !== '') {
    start = Number(match[1]);
    end = match[2] !== '' ? Math.min(Number(match[2]), size - 1) : size - 1;
  } else if (match && match[2] !== '') {
    // "bytes=-500": the last 500.
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  }
  if (start === undefined || start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': type || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
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
