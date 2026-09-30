import pg from 'pg';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRequest, resolveAuth } from '../../server/api.ts';
import { unavailableProvider } from '../../server/ai.ts';
import * as auth from '../../server/auth.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';

/**
 * Guessing the password.
 *
 * Login used to take guesses without limit: nothing counted failures, nothing
 * slowed down, and the right password was accepted straight after any number
 * of wrong ones. Each guess also ran a 64MB scrypt synchronously on the event
 * loop, so twenty wrong passwords sent at once froze every other request on the
 * process for over four seconds.
 *
 * The count is kept in the database because a hosted deployment runs as
 * short-lived functions that share nothing in memory. So these run against
 * SQLite always, and against Postgres too when TEST_DATABASE_URL is set.
 */

vi.mock('../../server/auth.ts', async (original) => {
  const real = await original<typeof import('../../server/auth.ts')>();
  return { ...real, verifyPassword: vi.fn(real.verifyPassword) };
});

const PASSWORD = 'a-long-enough-password';
const HASH = auth.hashPassword(PASSWORD);
const ENV = { DATABASE_URL: 'postgresql://x' } as NodeJS.ProcessEnv;

const databases: Array<[string, () => Promise<Db>]> = [['sqlite', () => openDatabase({ path: ':memory:' })]];
if (process.env.TEST_DATABASE_URL) {
  databases.push([
    'postgres',
    async () => {
      // A schema of its own: the parity tests drop and recreate `public` while
      // other files run, and would pull the tables out from under this one.
      // A plain client for that, since openDatabase would migrate `public` too.
      const url = process.env.TEST_DATABASE_URL!;
      const admin = new pg.Client({ connectionString: url });
      await admin.connect();
      await admin.query('DROP SCHEMA IF EXISTS login_limit CASCADE; CREATE SCHEMA login_limit;');
      await admin.end();
      const separator = url.includes('?') ? '&' : '?';
      return openDatabase({ databaseUrl: `${url}${separator}options=-c%20search_path%3Dlogin_limit` });
    },
  ]);
}

const opened: Db[] = [];
afterAll(async () => {
  for (const db of opened) await db.close();
});

describe.each(databases)('signing in, on %s', (_name, open) => {
  let db: Db;

  beforeEach(async () => {
    db = await open();
    opened.push(db);
    await store.setPasswordHash(db, HASH);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T12:00:00Z'));
    vi.mocked(auth.verifyPassword).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function login(password: string, clientIp = '203.0.113.7') {
    const ctx = { db, provider: unavailableProvider, auth: await resolveAuth(db, ENV) };
    return handleRequest(ctx, { method: 'POST', path: '/api/login', body: { password }, clientIp });
  }

  it('makes a client wait after five wrong passwords, without checking the sixth', async () => {
    for (let i = 1; i <= 5; i += 1) {
      expect((await login(`guess-number-${i}`)).status).toBe(401);
    }
    expect(auth.verifyPassword).toHaveBeenCalledTimes(5);

    // Even the right password is not looked at while the wait is on.
    const refused = await login(PASSWORD);
    expect(refused.status).toBe(429);
    expect(Number(refused.headers?.['retry-after'])).toBe(30);
    expect(refused.body).toMatchObject({ error: expect.stringContaining('Try again in 30 seconds') });
    expect(auth.verifyPassword).toHaveBeenCalledTimes(5);

    // Somebody else, from another address, is not affected.
    expect((await login(PASSWORD, '198.51.100.20')).status).toBe(200);

    // Once the wait is over, the right password works — and clears the count.
    vi.setSystemTime(new Date('2026-09-30T12:00:31Z'));
    expect((await login(PASSWORD)).status).toBe(200);
    expect((await login('one-more-typo')).status).toBe(401);
    expect((await login(PASSWORD)).status).toBe(200);
  });

  it('doubles the wait with every further miss', async () => {
    for (let i = 1; i <= 5; i += 1) await login(`guess-${i}`);
    const waits: number[] = [];
    for (let round = 0; round < 3; round += 1) {
      const refused = await login('still-guessing');
      const seconds = Number(refused.headers?.['retry-after']);
      waits.push(seconds);
      vi.setSystemTime(new Date(Date.now() + seconds * 1000));
      expect((await login('still-guessing')).status).toBe(401);
    }
    expect(waits).toEqual([30, 60, 120]);
  });

  it('forgets old misses after a quiet quarter of an hour', async () => {
    for (let i = 1; i <= 4; i += 1) await login(`guess-${i}`);
    vi.setSystemTime(new Date('2026-09-30T12:16:00Z'));
    for (let i = 1; i <= 4; i += 1) expect((await login(`guess-${i}`)).status).toBe(401);
    expect((await login(PASSWORD)).status).toBe(200);
  });

  it('slows everybody down when guesses come from many addresses', async () => {
    // Fifty real scrypt runs would take longer than the point needs; a wrong
    // guess is a wrong guess.
    for (let i = 1; i <= 50; i += 1) {
      vi.mocked(auth.verifyPassword).mockImplementationOnce(async () => false);
      await login(`guess-${i}`, `192.0.2.${i}`);
    }
    const refused = await login(PASSWORD, '198.51.100.99');
    expect(refused.status).toBe(429);
    // A short wait, never a lockout: the real learner gets in a minute later.
    expect(Number(refused.headers?.['retry-after'])).toBeLessThanOrEqual(60);
    vi.setSystemTime(new Date(Date.now() + 61_000));
    expect((await login(PASSWORD, '198.51.100.99')).status).toBe(200);
  });

  it('counts wrong current passwords when changing it, too', async () => {
    const ctx = { db, provider: unavailableProvider, auth: await resolveAuth(db, ENV) };
    const signedIn = await login(PASSWORD, '203.0.113.50');
    const cookie = String(signedIn.headers?.['set-cookie']).split(';')[0];
    const change = (current: string) =>
      handleRequest(ctx, {
        method: 'POST',
        path: '/api/password',
        body: { currentPassword: current, newPassword: 'another-long-password' },
        headers: { cookie },
        clientIp: '203.0.113.50',
      });
    for (let i = 1; i <= 5; i += 1) expect((await change(`wrong-${i}`)).status).toBe(401);
    expect((await change(PASSWORD)).status).toBe(429);
  });
});

describe('checking a password', () => {
  it('does not hold up the rest of the server while it works', async () => {
    const real = (await vi.importActual<typeof import('../../server/auth.ts')>('../../server/auth.ts'))
      .verifyPassword;
    const started = performance.now();
    const checks = Promise.all([real(PASSWORD, HASH), real('wrong-password', HASH)]);
    // Anything else waiting on the event loop gets its turn straight away.
    await new Promise((resolve) => setImmediate(resolve));
    const waited = performance.now() - started;
    expect(await checks).toEqual([true, false]);
    expect(waited).toBeLessThan(50);
  });
});
