import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Keeping a hosted SatzWerk private.
 *
 * On your own machine there is nothing to protect: the app listens on
 * localhost and the database is a file you own. Hosted, it is a public URL,
 * and `POST /api/reset` deletes everything — so a hosted deployment with no
 * password is not a smaller version of this app, it is a broken one.
 *
 * The rule is therefore: **local runs open, hosted runs never open.** A hosted
 * deployment with no password does not serve the app; it serves a one-time
 * setup screen and nothing else.
 *
 * The password is chosen in the browser and its hash is stored in the
 * database, because requiring a terminal to set a password is a bad
 * constraint for something you are meant to just open. An environment
 * variable still works and takes precedence, for anyone who would rather
 * configure it that way.
 *
 * Either way the password itself is never stored, never logged, and never
 * reaches the client bundle — only a salted scrypt hash of it.
 */

const SCRYPT_KEYLEN = 64;
/**
 * One definition, used by both hashing and verification. If these ever
 * disagreed, every login would fail against an already-stored hash, so they
 * are deliberately not written twice.
 *
 * N = 2^16 takes roughly 100ms, which is the point. It also needs about
 * 128 * N * r bytes — 64MB here — which is over Node's default 32MB scrypt
 * budget, so maxmem has to be raised explicitly or the call throws.
 */
const SCRYPT_PARAMS = { N: 2 ** 16, r: 8, p: 1, maxmem: 192 * 1024 * 1024 } as const;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const SESSION_COOKIE = 'satzwerk_session';

export interface AuthConfig {
  /** `scrypt$salt$hash`, from the environment or the database. */
  passwordHash?: string;
  /** HMAC key for session cookies. Generated and stored on first run. */
  sessionSecret?: string;
  /** Whether this looks like a hosted deployment rather than a local run. */
  hosted: boolean;
  /** Where the password came from, so the UI can say whether it is changeable. */
  passwordSource?: 'env' | 'database';
}

/**
 * `open`     — no password, and not hosted. Local development.
 * `setup`    — hosted, but no password chosen yet. Only the setup screen.
 * `required` — a password is set. Everything private needs a session.
 */
export type AuthState = 'open' | 'setup' | 'required';

export function authState(config: AuthConfig): AuthState {
  if (config.passwordHash && config.sessionSecret) return 'required';
  if (config.hosted) return 'setup';
  return 'open';
}

/** Vercel sets VERCEL=1; a Postgres URL is the other tell, since nothing local needs one. */
export function isHosted(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.VERCEL || env.DATABASE_URL);
}

/** The environment-only view, for callers with no database to hand. */
export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const passwordHash = env.SATZWERK_PASSWORD_HASH || undefined;
  return {
    passwordHash,
    sessionSecret: env.SATZWERK_SESSION_SECRET || undefined,
    hosted: isHosted(env),
    ...(passwordHash ? { passwordSource: 'env' as const } : {}),
  };
}

/** A password has to be worth something as the only thing guarding the URL. */
export const MIN_PASSWORD_LENGTH = 10;

export function passwordProblem(password: string): string | null {
  if (password.trim().length === 0) return 'Enter a password.';
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters. This is the only thing guarding your learning data.`;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Passwords
 * ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expected] = parts as [string, string, string];
  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  } catch {
    return false;
  }
  const expectedBuffer = Buffer.from(expected, 'hex');
  // Compared with a constant-time function, and only once the lengths match,
  // because timingSafeEqual throws on a length mismatch.
  if (expectedBuffer.length !== derived.length) return false;
  return timingSafeEqual(expectedBuffer, derived);
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

interface SessionPayload {
  userId: number;
  exp: number;
}

function sign(secret: string, data: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function createSession(secret: string, userId: number, now = new Date()): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(secret, body)}`;
}

/** The user id carried by a valid, unexpired token, or null. */
export function readSession(secret: string, token: string, now = new Date()): number | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(secret, body);
  // Constant-time, and length-checked first for the same reason as above.
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.userId !== 'number' || typeof payload.exp !== 'number') return null;
  if (payload.exp * 1000 <= now.getTime()) return null;
  return payload.userId;
}

/* ------------------------------------------------------------------ *
 * Cookies
 * ------------------------------------------------------------------ */

/**
 * Did this request arrive over HTTPS?
 *
 * `x-forwarded-proto` is what a proxy or platform sets, and it can carry a
 * list when there were several hops, so only the first entry is meaningful.
 */
export function isSecureRequest(headers: Record<string, string | undefined> = {}): boolean {
  const forwarded = headers['x-forwarded-proto'];
  if (forwarded) return forwarded.split(',')[0]!.trim().toLowerCase() === 'https';
  return (headers['x-forwarded-ssl'] ?? '').toLowerCase() === 'on';
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (name) out[name] = decodeURIComponent(value);
  }
  return out;
}

/**
 * HttpOnly so the token is not reachable from JavaScript, SameSite=Lax so it
 * is not sent on cross-site requests, and Secure whenever the request arrived
 * over HTTPS.
 *
 * Keyed on the request's own protocol rather than on whether the deployment
 * looks hosted, because a browser silently discards a Secure cookie delivered
 * over plain http. Getting that wrong does not fail loudly: the login succeeds,
 * the cookie vanishes, and the app sits there saying nothing. On Vercel every
 * request is HTTPS, so Secure is set; behind a TLS-terminating proxy the
 * forwarded protocol says so; over plain http it is left off, because a cookie
 * that is dropped protects nobody.
 */
export function sessionCookie(token: string, secure: boolean): string {
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearedCookie(secure: boolean): string {
  const attributes = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}
