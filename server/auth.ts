import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Keeping a hosted SatzWerk private.
 *
 * On your own machine there is nothing to protect: the app listens on
 * localhost and the database is a file you own. Hosted, it is a public URL,
 * and `POST /api/reset` deletes everything — so a hosted deployment with no
 * password is not a smaller version of this app, it is a broken one.
 *
 * The rule is therefore: **local runs open, hosted runs fail closed.** If the
 * app can tell it is hosted and no password is configured, it serves 503 and
 * says why, rather than quietly letting anyone in.
 *
 * Your password never reaches this file, the repository or the logs. You hash
 * it yourself with `npm run hash-password` and set the hash as an environment
 * variable, which stays server-side and never enters the client bundle.
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
  /** `scrypt$salt$hash`, from SATZWERK_PASSWORD_HASH. */
  passwordHash?: string;
  /** HMAC key for session cookies, from SATZWERK_SESSION_SECRET. */
  sessionSecret?: string;
  /** Whether this looks like a hosted deployment rather than a local run. */
  hosted: boolean;
}

/**
 * `open`          — no password, and not hosted. Local development.
 * `required`      — a password and a session secret are configured.
 * `misconfigured` — hosted, but the secrets are missing. Refuse to serve.
 */
export type AuthState = 'open' | 'required' | 'misconfigured';

export function readAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  return {
    passwordHash: env.SATZWERK_PASSWORD_HASH || undefined,
    sessionSecret: env.SATZWERK_SESSION_SECRET || undefined,
    // Vercel sets VERCEL=1. A Postgres URL is the other reliable tell, since
    // nothing local needs one.
    hosted: Boolean(env.VERCEL || env.DATABASE_URL),
  };
}

export function authState(config: AuthConfig): AuthState {
  if (config.passwordHash && config.sessionSecret) return 'required';
  if (config.hosted) return 'misconfigured';
  return 'open';
}

/** What is missing, so the 503 can say something useful. */
export function missingSecrets(config: AuthConfig): string[] {
  const missing: string[] = [];
  if (!config.passwordHash) missing.push('SATZWERK_PASSWORD_HASH');
  if (!config.sessionSecret) missing.push('SATZWERK_SESSION_SECRET');
  return missing;
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
 * is not sent on cross-site requests, and Secure whenever the deployment is
 * hosted — local http would reject a Secure cookie outright.
 */
export function sessionCookie(token: string, hosted: boolean): string {
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (hosted) attributes.push('Secure');
  return attributes.join('; ');
}

export function clearedCookie(hosted: boolean): string {
  const attributes = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (hosted) attributes.push('Secure');
  return attributes.join('; ');
}
