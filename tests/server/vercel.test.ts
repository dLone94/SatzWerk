import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The Vercel adapter.
 *
 * It is a thin shim over `handleRequest`, but it is the only code path the
 * hosted app actually runs, and it is the one place that cannot be exercised
 * by the existing API tests. It caches the database handle across
 * invocations, which is where a serverless-specific bug would live.
 *
 * Imported dynamically per test so the module-level cache starts empty, with a
 * fresh database each time.
 */

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'satzwerk-vercel-'));
  process.env.SATZWERK_DB = join(dir, 'fn.db');
  delete process.env.VERCEL;
  delete process.env.DATABASE_URL;
  delete process.env.SATZWERK_PASSWORD_HASH;
  delete process.env.SATZWERK_SESSION_SECRET;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.SATZWERK_DB;
});

/**
 * A fresh copy of the handler, with its own empty handle cache. The module
 * registry is reset first: the point of these tests is the caching, so each
 * one has to start from a cold function.
 */
async function loadHandler() {
  vi.resetModules();
  const mod = await import('../../api/[[...path]].ts');
  return mod.default as (request: Request) => Promise<Response>;
}

const get = (path: string, cookie?: string) =>
  new Request(`https://satzwerk.test${path}`, cookie ? { headers: { cookie } } : undefined);

const send = (method: string, path: string, body: unknown) =>
  new Request(`https://satzwerk.test${path}`, {
    method,
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

describe('the Vercel function', () => {
  it('answers health without touching the database', async () => {
    const handler = await loadHandler();
    const response = await handler(get('/api/health'));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it('reads and writes, and the write survives the next invocation', async () => {
    const handler = await loadHandler();
    const before = await (await handler(get('/api/state'))).json();
    expect(before).toMatchObject({ profile: { teachingLanguage: 'en', onboarded: false } });

    const updated = await handler(send('PUT', '/api/profile', { teachingLanguage: 'bg', onboarded: true }));
    expect(updated.status).toBe(200);

    // A separate invocation, reusing the cached handle the way a warm
    // function does.
    const after = await (await handler(get('/api/state'))).json();
    expect(after).toMatchObject({ profile: { teachingLanguage: 'bg', onboarded: true } });
  });

  it('records an attempt and its mistake', async () => {
    const handler = await loadHandler();
    const response = await handler(
      send('POST', '/api/attempts', {
        context: 'lesson',
        lessonId: 'pre-a1-u1-l2',
        exerciseId: 'u1l2-ex4',
        stepId: 'u1l2-ex4-s2',
        expected: 'eine',
        given: 'ein',
        verdict: 'incorrect',
        credit: 0,
        categories: ['article', 'gender'],
        hintsUsed: 0,
        revealed: false,
        isRetype: false,
        resolved: false,
      }),
    );
    expect(response.status).toBe(200);
    const mistakes = (await (await handler(get('/api/mistakes'))).json()) as unknown[];
    expect(mistakes).toHaveLength(1);
  });

  it('rejects a malformed body rather than throwing', async () => {
    const handler = await loadHandler();
    const response = await handler(
      new Request('https://satzwerk.test/api/attempts', {
        method: 'POST',
        body: '{not json',
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining('JSON') });
  });

  it('404s an unknown route', async () => {
    const handler = await loadHandler();
    expect((await handler(get('/api/nope'))).status).toBe(404);
  });

  it('serves only setup when hosted without a password', async () => {
    process.env.VERCEL = '1';
    const handler = await loadHandler();
    expect((await handler(get('/api/health'))).status).toBe(200);

    // The session route is public, so the app knows to show the setup screen.
    const session = await handler(get('/api/session'));
    expect(session.status).toBe(200);
    await expect(session.json()).resolves.toMatchObject({ needsSetup: true, signedIn: false });

    // Nothing private, so there is no window in which a fresh deployment is
    // readable by whoever finds the URL first.
    for (const path of ['/api/state', '/api/profile', '/api/reset']) {
      expect((await handler(get(path))).status, path).toBe(401);
    }
    // And logging in is meaningless before a password exists.
    expect((await handler(send('POST', '/api/login', { password: 'x' }))).status).toBe(409);
  });

  it('takes a password through the browser and then enforces it', async () => {
    process.env.VERCEL = '1';
    const handler = await loadHandler();

    const created = await handler(send('POST', '/api/setup', { password: 'a-long-enough-password' }));
    expect(created.status).toBe(200);
    const setCookie = created.headers.get('set-cookie');
    expect(setCookie).toContain('satzwerk_session=');
    // Hosted, so it has to be Secure.
    expect(setCookie).toContain('Secure');

    // That session works straight away, with no second round trip.
    const token = /satzwerk_session=([^;]+)/.exec(setCookie!)![1]!;
    expect((await handler(get('/api/state', `satzwerk_session=${token}`))).status).toBe(200);

    // And without it, the app is shut.
    expect((await handler(get('/api/state'))).status).toBe(401);
  });

  it('passes the session cookie through in both directions', async () => {
    const { hashPassword } = await import('../../server/auth.ts');
    process.env.VERCEL = '1';
    process.env.SATZWERK_PASSWORD_HASH = hashPassword('a-long-enough-password');
    process.env.SATZWERK_SESSION_SECRET = 'vercel-test-secret';
    const handler = await loadHandler();

    expect((await handler(get('/api/state'))).status).toBe(401);

    const login = await handler(send('POST', '/api/login', { password: 'a-long-enough-password' }));
    expect(login.status).toBe(200);
    const setCookie = login.headers.get('set-cookie');
    expect(setCookie).toContain('satzwerk_session=');
    // Hosted, so the cookie has to be Secure.
    expect(setCookie).toContain('Secure');

    const token = /satzwerk_session=([^;]+)/.exec(setCookie!)![1]!;
    const allowed = await handler(get('/api/state', `satzwerk_session=${token}`));
    expect(allowed.status).toBe(200);
  });
});
