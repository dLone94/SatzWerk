import pg from 'pg';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { unavailableProvider } from '../../server/ai.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';

/**
 * Input of the wrong shape, answered as a bad request rather than a crash.
 *
 * Each of these reached a query or a constraint unchecked and came back as a
 * 500 carrying the raw JavaScript or database error. A 500 is what the outbox
 * holds and retries and finally throws away, so an answer with a fractional
 * hint count or a NUL in it was lost on Postgres while SQLite kept it. The two
 * databases must agree, so this runs against SQLite always and against
 * Postgres too when TEST_DATABASE_URL is set.
 */

const databases: Array<[string, () => Promise<Db>]> = [['sqlite', () => openDatabase({ path: ':memory:' })]];
if (process.env.TEST_DATABASE_URL) {
  databases.push([
    'postgres',
    async () => {
      // A schema of its own, as in loginLimit.test.ts: the parity tests reset
      // `public` while other files run.
      const url = process.env.TEST_DATABASE_URL!;
      const admin = new pg.Client({ connectionString: url });
      await admin.connect();
      await admin.query('DROP SCHEMA IF EXISTS input_validation CASCADE; CREATE SCHEMA input_validation;');
      await admin.end();
      const separator = url.includes('?') ? '&' : '?';
      return openDatabase({ databaseUrl: `${url}${separator}options=-c%20search_path%3Dinput_validation` });
    },
  ]);
}

const opened: Db[] = [];
afterAll(async () => {
  for (const db of opened) await db.close();
});

const answer = { stepId: 's1', expected: 'Hallo', given: 'Hallo', verdict: 'correct', credit: 1, resolved: true };

describe.each(databases)('input of the wrong shape, on %s', (_name, open) => {
  let db: Db;

  beforeEach(async () => {
    db = await open();
    opened.push(db);
  });

  const call = (method: string, path: string, body?: unknown) =>
    handleRequest({ db, provider: unavailableProvider, auth: { hosted: false } }, { method, path, body });

  it('refuses review targets that are not targets', async () => {
    for (const targets of [
      [null],
      ['vocab:x'],
      [{ kind: 'vocab', refId: 'x', level: 'zz' }],
      [{ kind: 'nonsense', refId: 'x', level: 'a1' }],
      [{ kind: 'vocab', refId: 'x', level: 'a1', difficulty: 'NaN' }],
      [{ kind: 'vocab', refId: '', level: 'a1' }],
    ]) {
      const response = await call('POST', '/api/reviews/ensure', { targets });
      expect(response.status, JSON.stringify(targets)).toBe(400);
    }
    expect(await store.listReviewItems({ db, userId: 1 })).toEqual([]);
    // A real one still goes in.
    const fine = await call('POST', '/api/reviews/ensure', {
      targets: [{ kind: 'vocab', refId: 'v-hallo', level: 'pre-a1', difficulty: 2 }],
    });
    expect(fine.status).toBe(200);
  });

  it('keeps an answer whose review targets are malformed, without them', async () => {
    const response = await call('POST', '/api/attempts', {
      ...answer,
      reviewTargets: [null, { kind: 'vocab', refId: 'x', level: 'zz' }, { kind: 'vocab', refId: 'y', level: 'a1', difficulty: 'NaN' }],
    });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(1);
  });

  it('banks an answer with a fractional or huge hint count', async () => {
    for (const hintsUsed of [1.5, 1e12, -3, 'two']) {
      const response = await call('POST', '/api/attempts', { ...answer, stepId: `s-${String(hintsUsed)}`, hintsUsed });
      expect(response.status, String(hintsUsed)).toBe(200);
    }
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(4);
  });

  it('banks an answer with a NUL in it rather than losing it', async () => {
    const response = await call('POST', '/api/attempts', { ...answer, given: 'Hal\u0000lo', prompt: 'say\u0000 hello' });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const [recent] = await store.listRecentAttempts({ db, userId: 1 }, 1);
    expect(recent?.given).toBe('Hallo');
  });

  it('answers 400 to a NUL in an address', async () => {
    const response = await call('POST', '/api/lessons/pre-a1%00/sections/s1');
    expect(response.status).toBe(400);
  });

  it('refuses a display name that is not text', async () => {
    const response = await call('PUT', '/api/profile', { displayName: { toString: 1 } });
    expect(response.status).toBe(400);
    expect((await call('PUT', '/api/profile', { displayName: 'Teo' })).status).toBe(200);
    expect((await call('PUT', '/api/profile', { displayName: null })).status).toBe(200);
  });

  it('refuses a conversation run that is not one of the conversations, or not a count', async () => {
    for (const body of [
      { scriptId: 'x', turns: 4, firstTryCorrect: 3 },
      { scriptId: 'sc-bakery-pre-a1', turns: 1e300, firstTryCorrect: 0 },
      { scriptId: 'sc-bakery-pre-a1', turns: 1e12, firstTryCorrect: 0 },
      { scriptId: 'sc-bakery-pre-a1', turns: 2.5, firstTryCorrect: 1 },
      { scriptId: 'sc-bakery-pre-a1', turns: 4, firstTryCorrect: 9 },
    ]) {
      const response = await call('POST', '/api/scenario-runs', body);
      expect(response.status, JSON.stringify(body)).toBe(400);
    }
    expect(await store.listScenarioRuns({ db, userId: 1 })).toEqual([]);
  });

  it('refuses a learner id that cannot be one', async () => {
    for (const id of [1e30, 1.5, -1, 'one']) {
      const response = await call('POST', '/api/learners/select', { id });
      expect(response.status, String(id)).toBe(400);
    }
    expect((await call('PUT', '/api/learners/1e30', { name: 'Bob' })).status).toBe(404);
  });
});
