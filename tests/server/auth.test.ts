import { describe, expect, it } from 'vitest';
import {
  authState,
  clearedCookie,
  createSession,
  hashPassword,
  parseCookies,
  readAuthConfig,
  readSession,
  sessionCookie,
  verifyPassword,
} from '../../server/auth.ts';
import { handleRequest } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import { unavailableProvider } from '../../server/ai.ts';

/**
 * Hosting the app puts it on a public URL where POST /api/reset deletes
 * everything, so these are the checks that matter most: that a hosted
 * deployment without a password refuses to serve, and that nothing behind the
 * login answers without one.
 */

const PASSWORD = 'a-long-enough-password';
const SECRET = 'test-session-secret';

describe('password hashing', () => {
  it('accepts the right password and rejects everything else', () => {
    const stored = hashPassword(PASSWORD);
    expect(verifyPassword(PASSWORD, stored)).toBe(true);
    expect(verifyPassword('wrong', stored)).toBe(false);
    expect(verifyPassword('', stored)).toBe(false);
    expect(verifyPassword(PASSWORD + ' ', stored)).toBe(false);
  });

  it('never stores the password itself, and salts each hash', () => {
    const a = hashPassword(PASSWORD);
    const b = hashPassword(PASSWORD);
    expect(a).not.toContain(PASSWORD);
    expect(a).not.toBe(b);
    expect(verifyPassword(PASSWORD, b)).toBe(true);
  });

  it('rejects a malformed stored hash instead of throwing', () => {
    for (const bad of ['', 'nonsense', 'scrypt$only-two', 'bcrypt$salt$hash']) {
      expect(verifyPassword(PASSWORD, bad)).toBe(false);
    }
  });
});

describe('sessions', () => {
  it('round-trips a user id', () => {
    expect(readSession(SECRET, createSession(SECRET, 1))).toBe(1);
  });

  it('rejects a token signed with a different secret', () => {
    const token = createSession(SECRET, 1);
    expect(readSession('another-secret', token)).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const token = createSession(SECRET, 1);
    const [body, signature] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ userId: 2, exp: 9999999999 })).toString('base64url');
    expect(readSession(SECRET, `${forged}.${signature}`)).toBeNull();
    expect(readSession(SECRET, `${body}.deadbeef`)).toBeNull();
    expect(readSession(SECRET, 'not-a-token')).toBeNull();
  });

  it('rejects an expired token', () => {
    const issued = new Date('2026-01-01T00:00:00Z');
    const token = createSession(SECRET, 1, issued);
    // Inside the window.
    expect(readSession(SECRET, token, new Date('2026-01-20T00:00:00Z'))).toBe(1);
    // Past it.
    expect(readSession(SECRET, token, new Date('2026-06-01T00:00:00Z'))).toBeNull();
  });
});

describe('cookies', () => {
  it('parses a cookie header and ignores junk', () => {
    expect(parseCookies('a=1; satzwerk_session=xyz; b=2')).toMatchObject({
      a: '1',
      satzwerk_session: 'xyz',
      b: '2',
    });
    expect(parseCookies(undefined)).toEqual({});
    expect(parseCookies('novalue')).toEqual({});
  });

  it('is HttpOnly and SameSite, and only Secure when hosted', () => {
    const hosted = sessionCookie('t', true);
    expect(hosted).toContain('HttpOnly');
    expect(hosted).toContain('SameSite=Lax');
    expect(hosted).toContain('Secure');
    // Secure would be rejected over local http, so it is left off there.
    expect(sessionCookie('t', false)).not.toContain('Secure');
    expect(clearedCookie(false)).toContain('Max-Age=0');
  });
});

describe('which state the app is in', () => {
  it('is open locally with no password', () => {
    expect(authState({ hosted: false })).toBe('open');
  });

  it('requires a password once both secrets are set', () => {
    expect(authState({ hosted: false, passwordHash: 'h', sessionSecret: 's' })).toBe('required');
    expect(authState({ hosted: true, passwordHash: 'h', sessionSecret: 's' })).toBe('required');
  });

  it('is misconfigured when hosted without them, never open', () => {
    expect(authState({ hosted: true })).toBe('misconfigured');
    expect(authState({ hosted: true, passwordHash: 'h' })).toBe('misconfigured');
    expect(authState({ hosted: true, sessionSecret: 's' })).toBe('misconfigured');
  });

  it('treats a Postgres URL or Vercel as hosted', () => {
    expect(readAuthConfig({} as NodeJS.ProcessEnv).hosted).toBe(false);
    expect(readAuthConfig({ VERCEL: '1' } as NodeJS.ProcessEnv).hosted).toBe(true);
    expect(readAuthConfig({ DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv).hosted).toBe(true);
  });
});

describe('the API behind the login', () => {
  const locked = { passwordHash: hashPassword(PASSWORD), sessionSecret: SECRET, hosted: true };

  const open = async (db: Db, path: string, method = 'GET', body?: unknown, cookie?: string) =>
    handleRequest(
      { db, provider: unavailableProvider, auth: locked },
      { method, path, body, headers: cookie ? { cookie } : undefined },
    );

  it('refuses everything private without a session', async () => {
    const db = await openDatabase({ path: ':memory:' });
    for (const [method, path] of [
      ['GET', '/api/state'],
      ['GET', '/api/profile'],
      ['POST', '/api/attempts'],
      ['POST', '/api/reset'],
    ] as const) {
      const response = await open(db, path, method);
      expect(response.status, `${method} ${path}`).toBe(401);
    }
    await db.close();
  });

  it('lets health and session through, so a login screen can be shown', async () => {
    const db = await openDatabase({ path: ':memory:' });
    expect((await open(db, '/api/health')).status).toBe(200);
    const session = await open(db, '/api/session');
    expect(session.status).toBe(200);
    expect(session.body).toMatchObject({ required: true, signedIn: false });
    await db.close();
  });

  it('signs in with the right password and then allows the app', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const bad = await open(db, '/api/login', 'POST', { password: 'nope' });
    expect(bad.status).toBe(401);
    expect(bad.headers?.['set-cookie']).toBeUndefined();

    const good = await open(db, '/api/login', 'POST', { password: PASSWORD });
    expect(good.status).toBe(200);
    const cookie = good.headers!['set-cookie']!;
    expect(cookie).toContain('satzwerk_session=');

    const token = /satzwerk_session=([^;]+)/.exec(cookie)![1]!;
    const state = await open(db, '/api/state', 'GET', undefined, `satzwerk_session=${token}`);
    expect(state.status).toBe(200);
    expect(state.body).toMatchObject({ profile: { teachingLanguage: 'en' } });
    await db.close();
  });

  it('refuses to serve at all when hosted without secrets', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const ctx = { db, provider: unavailableProvider, auth: { hosted: true } };
    const response = await handleRequest(ctx, { method: 'GET', path: '/api/state' });
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      missing: ['SATZWERK_PASSWORD_HASH', 'SATZWERK_SESSION_SECRET'],
    });
    // Even the login route stays shut: there is nothing to check against.
    expect((await handleRequest(ctx, { method: 'POST', path: '/api/login', body: {} })).status).toBe(503);
    await db.close();
  });

  it('still runs with no password at all on localhost', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const ctx = { db, provider: unavailableProvider, auth: { hosted: false } };
    const response = await handleRequest(ctx, { method: 'GET', path: '/api/state' });
    expect(response.status).toBe(200);
    const session = await handleRequest(ctx, { method: 'GET', path: '/api/session' });
    expect(session.body).toMatchObject({ required: false, signedIn: true });
    await db.close();
  });

  it('signs out by clearing the cookie', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const response = await open(db, '/api/logout', 'POST');
    expect(response.status).toBe(200);
    expect(response.headers!['set-cookie']).toContain('Max-Age=0');
    await db.close();
  });
});
