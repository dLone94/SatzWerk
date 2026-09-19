/**
 * Asking to be reminded, from the browser's side.
 *
 * Three things have to be true before a reminder can arrive, and all three can
 * fail for reasons the app does not control:
 *
 *  1. The browser has to support push at all. iOS only does so for a web app
 *     that has been added to the Home Screen — in a Safari tab the API is not
 *     there, and no amount of asking will change that.
 *  2. The person has to grant permission, from a real tap. A permission prompt
 *     fired on page load is both bad manners and, in Safari, ignored.
 *  3. The server has to have VAPID keys, or there is nothing to subscribe to.
 *
 * Each failure is reported as itself rather than as a generic "couldn't turn
 * on notifications", because the fixes are completely different: install the
 * app, change a setting, or configure the server.
 */

export type PushState =
  | 'unsupported'
  | 'needs-install'
  | 'not-configured'
  | 'denied'
  | 'off'
  | 'on';

export interface PushStatus {
  state: PushState;
  /** The endpoint this browser is subscribed with, when it is. */
  endpoint?: string;
}

/** Is this a web app running from the Home Screen rather than a browser tab? */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayMode = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
  // iOS predates the standard property and still reports it on navigator.
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return displayMode || iosStandalone;
}

function pushApiPresent(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * iOS is the case worth distinguishing.
 *
 * Safari on iOS exposes no PushManager in a normal tab, so a learner who has
 * not installed the app sees the feature as simply missing. Telling them to
 * add it to the Home Screen is the only useful thing to say.
 */
function looksLikeIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
}

async function serverKey(): Promise<string | null> {
  try {
    const response = await fetch('/api/push/status');
    if (!response.ok) return null;
    const body = (await response.json()) as { configured?: boolean; publicKey?: string };
    return body.configured && body.publicKey ? body.publicKey : null;
  } catch {
    return null;
  }
}

export async function readPushStatus(): Promise<PushStatus> {
  if (!pushApiPresent()) {
    return { state: looksLikeIos() && !isStandalone() ? 'needs-install' : 'unsupported' };
  }
  if (!(await serverKey())) return { state: 'not-configured' };
  if (Notification.permission === 'denied') return { state: 'denied' };

  const registration = await navigator.serviceWorker.getRegistration();
  const existing = await registration?.pushManager.getSubscription();
  return existing ? { state: 'on', endpoint: existing.endpoint } : { state: 'off' };
}

/**
 * base64url, which is how a VAPID key travels, to the bytes the API wants.
 *
 * The buffer is allocated explicitly rather than letting `new Uint8Array(n)`
 * infer one, because `PushManager.subscribe` will not take a view whose buffer
 * might be shared.
 */
export function decodeKey(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const withPadding = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  const raw = atob(withPadding);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * How long to wait for the browser to arrange a subscription before giving up.
 *
 * `pushManager.subscribe` talks to the browser vendor's push service, and when
 * that host is unreachable — a captive portal, a firewall, a network that
 * blocks it — the promise never settles at all. It does not reject; it simply
 * never returns. Without a deadline the switch sits disabled forever and the
 * card says nothing, which is indistinguishable from the app being broken.
 *
 * Twenty seconds is far longer than the round trip ever takes when it works,
 * so nothing legitimate is cut off; it only bounds the case that would
 * otherwise hang until the page is closed.
 */
export const SUBSCRIBE_TIMEOUT_MS = 20_000;

export function withTimeout<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${what} did not answer within ${ms / 1000}s.`)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (cause: unknown) => {
        clearTimeout(timer);
        reject(cause instanceof Error ? cause : new Error(String(cause)));
      },
    );
  });
}

/**
 * Turn reminders on. Must be called from a user gesture.
 */
export async function enablePush(): Promise<PushStatus> {
  if (!pushApiPresent()) {
    return { state: looksLikeIos() && !isStandalone() ? 'needs-install' : 'unsupported' };
  }
  const key = await serverKey();
  if (!key) return { state: 'not-configured' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { state: permission === 'denied' ? 'denied' : 'off' };

  const registration = await navigator.serviceWorker.register('/sw.js');
  await withTimeout(navigator.serviceWorker.ready, SUBSCRIBE_TIMEOUT_MS, 'The service worker');

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await withTimeout(
      registration.pushManager.subscribe({
        // Required by every browser: a push that cannot be shown to the user is
        // not allowed, which suits an app that only sends when something is due.
        userVisibleOnly: true,
        applicationServerKey: decodeKey(key),
      }),
      SUBSCRIBE_TIMEOUT_MS,
      'The push service',
    ));

  const json = subscription.toJSON() as { endpoint?: string; keys?: Record<string, string> };
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
  if (!response.ok) return { state: 'off' };

  return { state: 'on', endpoint: subscription.endpoint };
}

/** Turn reminders off, in the browser and on the server. */
export async function disablePush(): Promise<PushStatus> {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe().catch(() => undefined);
  }
  return { state: 'off' };
}
