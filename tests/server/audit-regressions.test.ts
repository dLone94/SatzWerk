import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleRequest, resolveAuth, LEARNER_COOKIE, type ApiRequest } from '../../server/api.ts';
import { verifyPassword } from '../../server/auth.ts';
import { openDatabase, SCHEMA_VERSION, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';

let db: Db;
beforeEach(async () => { db = await openDatabase({ path: ':memory:' }); });
afterEach(async () => { await db.close(); });

const attempt: ApiRequest = {
  method: 'POST', path: '/api/attempts',
  headers: { 'idempotency-key': 'held-answer-1' },
  body: {
    context: 'lesson', lessonId: 'pre-a1-u1-l1', stepId: 'audit-step',
    expected: 'Hallo', given: 'Hallo', verdict: 'correct', credit: 1,
    categories: [], resolved: true,
  },
};

describe('writes arriving together', () => {
  it('accepts only one initial password and keeps that session valid', async () => {
    const auth = { ...(await resolveAuth(db)), hosted: true };
    const passwords = ['audit-password-first', 'audit-password-second'];
    const results = await Promise.all(passwords.map(password => handleRequest({ db, auth }, {
      method: 'POST', path: '/api/setup', body: { password },
    })));
    expect(results.map(result => result.status).sort()).toEqual([200, 409]);
    const winner = results.findIndex(result => result.status === 200);
    const stored = (await store.getPasswordHash(db))!;
    expect(await verifyPassword(passwords[winner]!, stored)).toBe(true);
    expect(await verifyPassword(passwords[1 - winner]!, stored)).toBe(false);
    const session = await handleRequest({ db }, {
      method: 'GET', path: '/api/session',
      headers: { cookie: results[winner]!.headers!['set-cookie']!.split(';')[0] },
    });
    expect(session.body).toMatchObject({ signedIn: true });
  });

  it('preserves independent profile patches', async () => {
    const scope = { db, userId: 1 };
    await Promise.all([
      store.updateProfile(scope, { teachingLanguage: 'bg' }),
      store.updateProfile(scope, { dailyTargetMinutes: 30 }),
      store.updateProfile(scope, { displayName: 'Teo', onboarded: true }),
    ]);
    expect(await store.getProfile(scope)).toMatchObject({
      teachingLanguage: 'bg', dailyTargetMinutes: 30, displayName: 'Teo', onboarded: true,
    });
    await store.updateProfile(scope, { displayName: null });
    expect(await store.getProfile(scope)).toMatchObject({ displayName: null, teachingLanguage: 'bg' });
  });

  it('keeps every simultaneous grade of a review item', async () => {
    const scope = { db, userId: 1 };
    await store.ensureReviewItems(scope, [{ refId: 'audit-word', kind: 'vocab', level: 'a1' }]);
    await Promise.all(Array.from({ length: 6 }, () => store.gradeReviewItem(scope, 'vocab:audit-word', 'good')));
    expect((await store.getReviewItem(scope, 'vocab:audit-word'))!.successCount).toBe(6);
  });
});

describe('a learning write whose acknowledgement was lost', () => {
  it('returns the same acknowledgement and saves the answer once', async () => {
    const responses = await Promise.all(Array.from({ length: 5 }, () => handleRequest({ db }, attempt)));
    for (const response of responses) expect(response).toEqual(responses[0]);
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(1);
    expect((await store.getLessonProgress({ db, userId: 1 }, 'pre-a1-u1-l1')).practice['audit-step']!.attempts).toBe(1);
  });

  it.each([
    ['/api/study', { seconds: 20 }],
    ['/api/lessons/pre-a1-u1-l1/recovery', undefined],
    ['/api/lessons/pre-a1-u1-l1/mastery', { accuracy: 1, passAccuracy: 0.8 }],
    ['/api/checkpoints', { checkpointId: 'audit-check', accuracy: 1, passed: true }],
  ])('does not repeat the side effects of %s', async (path, body) => {
    const request = { method: 'POST', path, body, headers: { 'idempotency-key': 'held-write' } };
    const first = await handleRequest({ db }, request);
    expect(first.status).toBe(200);
    const state = await handleRequest({ db }, { method: 'GET', path: '/api/state' });
    expect(await handleRequest({ db }, request)).toEqual(first);
    const after = await handleRequest({ db }, { method: 'GET', path: '/api/state' });
    // The server clock is expected to move; the learner's work is not.
    expect({ ...after.body as object, serverTime: null }).toEqual({ ...state.body as object, serverTime: null });
  });

  it('rejects a reused key for different work', async () => {
    await handleRequest({ db }, attempt);
    expect((await handleRequest({ db }, { ...attempt, body: { ...attempt.body as object, given: 'Guten Tag' } })).status).toBe(409);
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(1);
  });

  it('keeps keys separate for different learners', async () => {
    const learner = await store.createLearner(db, 'Papa');
    await handleRequest({ db }, attempt);
    const response = await handleRequest({ db }, { ...attempt, headers: {
      ...attempt.headers, cookie: `${LEARNER_COOKIE}=${learner.id}`,
    } });
    expect(response.status).toBe(200);
    expect((await store.getStats({ db, userId: learner.id })).totalAnswers).toBe(1);
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(1);
  });

  it('does not cache failures and can retry after a rolled-back write', async () => {
    const failing: Db = { ...db, run: async (sql, ...params) => {
      if (sql.includes('INSERT INTO study_days')) throw new Error('temporary failure');
      return db.run(sql, ...params);
    } };
    await expect(handleRequest({ db: failing }, attempt)).rejects.toThrow('temporary failure');
    expect(await db.all('SELECT * FROM attempts')).toHaveLength(0);
    expect(await db.all('SELECT * FROM write_receipts')).toHaveLength(0);
    expect((await handleRequest({ db }, attempt)).status).toBe(200);
    expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(1);
  });

  it('rejects invalid keys before changing progress', async () => {
    for (const key of ['', 'invalid key', 'a'.repeat(129)]) {
      expect((await handleRequest({ db }, { ...attempt, headers: { 'idempotency-key': key } })).status).toBe(400);
    }
    expect(await db.all('SELECT * FROM attempts')).toHaveLength(0);
  });

  it('preserves receipts across reopening a populated version-6 database', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'satzwerk-receipts-'));
    const path = join(dir, 'app.db');
    try {
      const old = await openDatabase({ path }, 6);
      await old.close();
      const first = await openDatabase({ path });
      expect(Number((await first.get<{ value: string }>("SELECT value FROM meta WHERE key = 'schema_version'"))!.value)).toBe(SCHEMA_VERSION);
      const saved = await handleRequest({ db: first }, attempt);
      await first.close();
      const restored = await openDatabase({ path });
      expect(await handleRequest({ db: restored }, attempt)).toEqual(saved);
      expect((await store.getStats({ db: restored, userId: 1 })).totalAnswers).toBe(1);
      await restored.close();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
