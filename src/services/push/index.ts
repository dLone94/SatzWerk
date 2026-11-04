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

import { CLIENT_HEADERS } from '../api/client.ts';

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
  /**
   * The hour, in UTC, at which the server sends reminders, when it knows.
   * One daily job sends them all, so this is a fact to tell the learner in
   * their own time, not a setting.
   */
  sendHourUtc?: number;
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

async function serverPush(): Promise<{ publicKey: string; sendHourUtc?: number } | null> {
  try {
    const response = await fetch('/api/push/status');
    if (!response.ok) return null;
    const body = (await response.json()) as { configured?: boolean; publicKey?: string; sendHourUtc?: number };
    if (!body.configured || !body.publicKey) return null;
    return {
      publicKey: body.publicKey,
      ...(Number.isInteger(body.sendHourUtc) ? { sendHourUtc: body.sendHourUtc } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * The endpoint this browser already holds a subscription with, if any.
 *
 * Sent with a switch of learner so the phone's reminders follow whoever is
 * studying on it now. Asks the person nothing: reading an existing
 * subscription needs no prompt and no tap, and any failure is simply "none".
 */
export async function existingPushEndpoint(): Promise<string | undefined> {
  if (!pushApiPresent()) return undefined;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return (await registration?.pushManager.getSubscription())?.endpoint ?? undefined;
  } catch {
    return undefined;
  }
}

export async function readPushStatus(): Promise<PushStatus> {
  if (!pushApiPresent()) {
    return { state: looksLikeIos() && !isStandalone() ? 'needs-install' : 'unsupported' };
  }
  const server = await serverPush();
  if (!server) return { state: 'not-configured' };
  if (Notification.permission === 'denied') return { state: 'denied' };
  const hour = server.sendHourUtc === undefined ? {} : { sendHourUtc: server.sendHourUtc };

  const registration = await navigator.serviceWorker.getRegistration();
  const existing = await registration?.pushManager.getSubscription();
  return existing ? { state: 'on', endpoint: existing.endpoint, ...hour } : { state: 'off', ...hour };
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
  const server = await serverPush();
  if (!server) return { state: 'not-configured' };
  const key = server.publicKey;
  const hour = server.sendHourUtc === undefined ? {} : { sendHourUtc: server.sendHourUtc };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { state: permission === 'denied' ? 'denied' : 'off', ...hour };

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
    headers: { ...CLIENT_HEADERS, 'content-type': 'application/json' },
    // Where this device is, so the reminder job knows which day it is here:
    // nothing goes out on a day already studied, and study days are filed on
    // the learner's own calendar.
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      tzOffsetMinutes: -new Date().getTimezoneOffset(),
    }),
  });
  if (!response.ok) return { state: 'off', ...hour };

  return { state: 'on', endpoint: subscription.endpoint, ...hour };
}

/** Turn reminders off, in the browser and on the server. */
export async function disablePush(): Promise<PushStatus> {
  const registration = await navigator.serviceWorker?.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { ...CLIENT_HEADERS, 'content-type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe().catch(() => undefined);
  }
  return { state: 'off' };
}

/**
 * The send hour as a clock time where the learner is: "20:00" in Sofia in
 * summer for an 18:00 UTC job. Read off today's date, so it follows the
 * clocks changing.
 */
export function reminderClockTime(hourUtc: number, lang: 'en' | 'bg', now = new Date()): string {
  const at = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc));
  return new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-GB', { hour: '2-digit', minute: '2-digit' }).format(at);
}

/**
 * The invitation to turn reminders on, and the iPhone install hint, are each
 * offered once on a device. Remembered in the browser because what they are
 * about belongs to the browser too: a subscription, an installed app.
 */
export type ReminderInvite = 'enable' | 'install';

const INVITE_KEY = 'satzwerk.reminderInvite.';

export function inviteOffered(kind: ReminderInvite): boolean {
  try {
    return (globalThis.localStorage?.getItem(INVITE_KEY + kind) ?? null) !== null;
  } catch {
    // Storage refused (a private window). It is offered again next time,
    // which is the most a page that cannot remember anything can do.
    return false;
  }
}

export function rememberInviteOffered(kind: ReminderInvite): void {
  try {
    globalThis.localStorage?.setItem(INVITE_KEY + kind, new Date().toISOString());
  } catch {
    // As above: nothing to remember it in.
  }
}
