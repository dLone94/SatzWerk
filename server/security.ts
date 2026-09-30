/**
 * What stops somebody else's web page, or somebody else on the same Wi-Fi,
 * from acting as the learner.
 *
 * Shared by both adapters (`main.ts` locally, `vercel.ts` hosted), so the two
 * cannot drift apart. `handleRequest` never sees a request these refuse.
 */

/**
 * The header the app puts on every request it makes.
 *
 * A web page on another origin cannot send it: a custom header turns a
 * cross-origin request into one that needs a CORS preflight, this server never
 * answers a preflight, and an HTML form cannot set headers at all. So a request
 * carrying it came from the app itself, or from a script that is not a browser
 * — which is not what cross-site request forgery is about.
 */
export const CLIENT_HEADER = 'x-requested-with';
export const CLIENT_HEADER_VALUE = 'SatzWerk';

/** Only the request headers the checks below read, lower-cased. */
export type GuardHeaders = Record<string, string | undefined>;

const WRITES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function hostOf(url: string | undefined): string | null {
  if (!url || url === 'null') return null;
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Why a state-changing request is refused, or null when it may go ahead.
 *
 * The API used to accept any POST: a `text/plain` body was parsed as JSON and
 * the Origin never looked at. So an ordinary HTML form on any web page could
 * set a password on a local, passwordless SatzWerk (locking its owner out) or
 * wipe the learner's progress, without the learner doing anything but opening
 * that page. On the hosted app only the SameSite cookie stood in the way.
 *
 * A write now has to prove where it came from: either the app's own header, or
 * an Origin (or, failing that, a Referer) naming this very host. A request with
 * neither is refused too, which costs nothing, because every browser sends
 * Origin on a POST and the app sends its header besides. The reminder job is
 * the one exception: it is not a browser, and it carries its own secret.
 */
export function crossSiteRefusal(
  method: string,
  path: string,
  headers: GuardHeaders,
): { status: number; error: string } | null {
  if (!WRITES.has(method.toUpperCase())) return null;
  if (path.replace(/\/+$/, '') === '/api/push/run') return null;

  // A form can only send these three types, and the app only ever sends JSON.
  // Refused before anything else, so a form post is turned away however it
  // arrived.
  const type = (headers['content-type'] ?? '').split(';')[0]!.trim().toLowerCase();
  if (type && type !== 'application/json') {
    return { status: 415, error: 'Send JSON: this API only accepts application/json.' };
  }

  if (headers[CLIENT_HEADER]) return null;

  const own = new Set(
    [headers.host, headers['x-forwarded-host']?.split(',')[0]]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim().toLowerCase()),
  );
  const origin = headers.origin;
  const from = origin !== undefined ? hostOf(origin) : hostOf(headers.referer);
  if (from && own.has(from)) return null;

  return { status: 403, error: 'This request did not come from the app, so it was refused.' };
}

/**
 * Sent with every response, from both adapters and from `vercel.json`.
 *
 * The app loads nothing from anywhere else: its scripts, styles and fonts are
 * built into /assets, the recordings are under /audio, and speech is the
 * browser's own. So the policy can be `'self'` throughout, with three
 * exceptions that are really needed:
 *  - `img-src data:` for the favicon, which is an inline SVG in index.html;
 *  - `media-src blob:` for playing back a recording the learner just made;
 *  - `font-src data:` in case the bundler inlines a small font file.
 * React's `style={...}` props are set through the CSSOM, which `style-src
 * 'self'` allows, so no `'unsafe-inline'` is needed.
 *
 * `frame-ancestors 'none'` (and X-Frame-Options for older browsers) keeps
 * another site from framing the app and tricking a tap onto "Reset".
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  // The microphone is used for speaking practice; nothing else is.
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), payment=()',
};

/* ------------------------------------------------------------------ *
 * Loopback
 * ------------------------------------------------------------------ */

/** 127.0.0.0/8, ::1, and IPv4 loopback written as IPv6. */
export function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) return false;
  const bare = address.toLowerCase().replace(/^::ffff:/, '');
  return bare === '::1' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(bare);
}

/**
 * Whether a Host header names this machine.
 *
 * Checked as well as the socket's address because of DNS rebinding: a web page
 * can point its own name at 127.0.0.1, and the browser then treats the local
 * app as that page's own origin. The Host header still says the page's name,
 * so a passwordless app answers only to `localhost` and loopback addresses.
 */
export function isLoopbackHost(host: string | undefined): boolean {
  if (!host) return false;
  let name: string;
  try {
    name = new URL(`http://${host}`).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (name === 'localhost' || name.endsWith('.localhost')) return true;
  return isLoopbackAddress(name.replace(/^\[|\]$/g, ''));
}
