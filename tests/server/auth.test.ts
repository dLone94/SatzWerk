import { describe, expect, it } from 'vitest';
import {
  authState,
  clearedCookie,
  createSession,
  hashPassword,
  parseCookies,
  readAuthConfig,
  readSession,
  isSecureRequest,
  sessionCookie,
  verifyPassword,
} from '../../server/auth.ts';
import { handleRequest, resolveAuth } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import { unavailableProvider } from '../../server/ai.ts';
import * as store from '../../server/store.ts';

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

  it('is HttpOnly and SameSite, and only Secure over HTTPS', () => {
    const secure = sessionCookie('t', true);
    expect(secure).toContain('HttpOnly');
    expect(secure).toContain('SameSite=Lax');
    expect(secure).toContain('Secure');
    // A browser silently discards a Secure cookie sent over plain http, and
    // the resulting failure is invisible: the login succeeds and nothing
    // happens. So it is left off when the request was not HTTPS.
    expect(sessionCookie('t', false)).not.toContain('Secure');
    expect(clearedCookie(false)).toContain('Max-Age=0');
  });

  it('reads the protocol from the forwarded headers', () => {
    expect(isSecureRequest({ 'x-forwarded-proto': 'https' })).toBe(true);
    expect(isSecureRequest({ 'x-forwarded-proto': 'http' })).toBe(false);
    // Several hops leave a list, and only the first entry is the client's.
    expect(isSecureRequest({ 'x-forwarded-proto': 'https, http' })).toBe(true);
    expect(isSecureRequest({ 'x-forwarded-proto': ' HTTPS ' })).toBe(true);
    expect(isSecureRequest({ 'x-forwarded-ssl': 'on' })).toBe(true);
    expect(isSecureRequest({})).toBe(false);
    expect(isSecureRequest()).toBe(false);
  });

  it('marks the cookie Secure when the request says HTTPS, not when hosted', async () => {
    const db = await openDatabase({ path: ':memory:' });
    await store.setPasswordHash(db, hashPassword(PASSWORD));
    const auth = await resolveAuth(db, { DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv);
    const ctx = { db, provider: unavailableProvider, auth };

    const overHttps = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/login',
      body: { password: PASSWORD },
      headers: { 'x-forwarded-proto': 'https' },
    });
    expect(overHttps.headers!['set-cookie']).toContain('Secure');

    // Same hosted deployment, request over plain http: no Secure, because the
    // browser would throw the cookie away and the login would appear to hang.
    const overHttp = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/login',
      body: { password: PASSWORD },
      headers: { 'x-forwarded-proto': 'http' },
    });
    expect(overHttp.headers!['set-cookie']).not.toContain('Secure');
    await db.close();
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

  it('is in setup when hosted without a password, never open', () => {
    // The important half of this: hosted plus no password must never come out
    // as `open`, whichever piece is missing.
    expect(authState({ hosted: true })).toBe('setup');
    expect(authState({ hosted: true, passwordHash: 'h' })).toBe('setup');
    expect(authState({ hosted: true, sessionSecret: 's' })).toBe('setup');
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

  it('serves only setup when hosted without a password, never the app', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const ctx = { db, provider: unavailableProvider, auth: { hosted: true, sessionSecret: SECRET } };

    // Nothing private, so the app is not readable in the window between
    // deploying and choosing a password.
    for (const [method, path] of [
      ['GET', '/api/state'],
      ['GET', '/api/profile'],
      ['POST', '/api/reset'],
    ] as const) {
      expect((await handleRequest(ctx, { method, path })).status, path).toBe(401);
    }

    // The session route says which screen to show.
    const session = await handleRequest(ctx, { method: 'GET', path: '/api/session' });
    expect(session.body).toMatchObject({ needsSetup: true, signedIn: false });

    // Logging in is meaningless before a password exists.
    const login = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/login',
      body: { password: 'anything' },
    });
    expect(login.status).toBe(409);
    await db.close();
  });

  it('sets the password from the browser, then requires it', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const setupCtx = { db, provider: unavailableProvider, auth: { hosted: true, sessionSecret: SECRET } };

    const tooShort = await handleRequest(setupCtx, {
      method: 'POST',
      path: '/api/setup',
      body: { password: 'short' },
    });
    expect(tooShort.status).toBe(400);

    const created = await handleRequest(setupCtx, {
      method: 'POST',
      path: '/api/setup',
      body: { password: PASSWORD },
    });
    expect(created.status).toBe(200);
    expect(created.headers?.['set-cookie']).toContain('satzwerk_session=');

    // The password is stored as a hash, not as itself.
    const stored = await store.getPasswordHash(db);
    expect(stored).toBeTruthy();
    expect(stored).not.toContain(PASSWORD);
    expect(verifyPassword(PASSWORD, stored!)).toBe(true);

    // And now the deployment behaves like any password-protected one.
    const resolved = await resolveAuth(db, { DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv);
    expect(authState(resolved)).toBe('required');
    const locked = { db, provider: unavailableProvider, auth: resolved };
    expect((await handleRequest(locked, { method: 'GET', path: '/api/state' })).status).toBe(401);

    const good = await handleRequest(locked, {
      method: 'POST',
      path: '/api/login',
      body: { password: PASSWORD },
    });
    expect(good.status).toBe(200);

    // Setting it twice is refused: that would be a way to take over.
    const again = await handleRequest(locked, {
      method: 'POST',
      path: '/api/setup',
      body: { password: 'another-long-password' },
    });
    expect(again.status).toBe(409);
    await db.close();
  });

  it('sees a password set after startup, rather than a stale view of it', async () => {
    // server/main.ts used to resolve the credentials once at boot and reuse
    // that object for every request. After the setup screen stored a password,
    // the server carried on believing there was none: setup never completed
    // and nothing was ever protected. Only the real server showed it, because
    // every test constructed its own auth per call.
    const db = await openDatabase({ path: ':memory:' });
    const env = { DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv;

    const before = await resolveAuth(db, env);
    expect(authState(before)).toBe('setup');

    // Something else sets the password — the setup route, or another instance.
    await store.setPasswordHash(db, hashPassword(PASSWORD));

    // Resolving again must reflect it.
    const after = await resolveAuth(db, env);
    expect(authState(after)).toBe('required');
    expect(after.passwordSource).toBe('database');
    expect(verifyPassword(PASSWORD, after.passwordHash!)).toBe(true);

    // And the session secret is stable across resolves, or every resolve would
    // silently sign the learner out.
    expect(after.sessionSecret).toBe(before.sessionSecret);
    await db.close();
  });

  it('changes the password, and only with the current one', async () => {
    const db = await openDatabase({ path: ':memory:' });
    await store.setPasswordHash(db, hashPassword(PASSWORD));
    const env = { DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv;
    const auth = await resolveAuth(db, env);
    const ctx = { db, provider: unavailableProvider, auth };

    const token = /satzwerk_session=([^;]+)/.exec(
      (
        await handleRequest(ctx, { method: 'POST', path: '/api/login', body: { password: PASSWORD } })
      ).headers!['set-cookie']!,
    )![1]!;
    const cookie = `satzwerk_session=${token}`;

    // A borrowed session cannot change the password without knowing it.
    const wrong = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/password',
      body: { currentPassword: 'not-it', newPassword: 'a-brand-new-password' },
      headers: { cookie },
    });
    expect(wrong.status).toBe(401);

    const changed = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/password',
      body: { currentPassword: PASSWORD, newPassword: 'a-brand-new-password' },
      headers: { cookie },
    });
    expect(changed.status).toBe(200);

    // The old password no longer works, the new one does.
    const after = await resolveAuth(db, env);
    const next = { db, provider: unavailableProvider, auth: after };
    expect(
      (await handleRequest(next, { method: 'POST', path: '/api/login', body: { password: PASSWORD } })).status,
    ).toBe(401);
    expect(
      (
        await handleRequest(next, {
          method: 'POST',
          path: '/api/login',
          body: { password: 'a-brand-new-password' },
        })
      ).status,
    ).toBe(200);

    // And the old session is dead, because changing the password rotates the
    // signing secret. Anything else that was signed in is signed out.
    expect((await handleRequest(next, { method: 'GET', path: '/api/state', headers: { cookie } })).status).toBe(401);
    await db.close();
  });

  it('refuses to change a password that comes from the environment', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const auth = {
      hosted: true,
      passwordHash: hashPassword(PASSWORD),
      sessionSecret: SECRET,
      passwordSource: 'env' as const,
    };
    const ctx = { db, provider: unavailableProvider, auth };
    const token = /satzwerk_session=([^;]+)/.exec(
      (
        await handleRequest(ctx, { method: 'POST', path: '/api/login', body: { password: PASSWORD } })
      ).headers!['set-cookie']!,
    )![1]!;
    const response = await handleRequest(ctx, {
      method: 'POST',
      path: '/api/password',
      body: { currentPassword: PASSWORD, newPassword: 'a-brand-new-password' },
      headers: { cookie: `satzwerk_session=${token}` },
    });
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: expect.stringContaining('SATZWERK_PASSWORD_HASH') });
    await db.close();
  });

  it('keeps one session secret when two cold starts race for it', async () => {
    const db = await openDatabase({ path: ':memory:' });
    // Two serverless invocations can reach this at the same moment. They must
    // agree on one secret, or each would invalidate the other's sessions.
    const [a, b, c] = await Promise.all([
      store.getOrCreateSessionSecret(db),
      store.getOrCreateSessionSecret(db),
      store.getOrCreateSessionSecret(db),
    ]);
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(a).toHaveLength(64);
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
