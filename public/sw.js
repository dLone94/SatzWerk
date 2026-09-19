/*
 * The service worker exists for one reason: iOS will not deliver a push
 * notification to a web app without one.
 *
 * It deliberately does not cache anything. An offline cache for an app whose
 * every answer goes to a database would mean showing a learner stale progress,
 * or silently dropping work they had done — and a half-working offline mode is
 * the kind of feature that looks finished and is not. So this handles pushes
 * and nothing else.
 */

self.addEventListener('install', () => {
  // Take over immediately rather than waiting for every tab to close; there is
  // no cached asset that an old worker could be mid-way through serving.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

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
      data: { url: payload.url || '/review' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/review';

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
