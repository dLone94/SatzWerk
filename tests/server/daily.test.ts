import { afterEach, beforeEach, expect, it } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';
import type { DailyRunInput } from '../../src/core/progress/daily.ts';

let db: Db;
beforeEach(async () => { db = await openDatabase({ path: ':memory:' }); });
afterEach(async () => { await db.close(); });
const request = (body: unknown, key?: string, learner = 1) => handleRequest({ db }, {
  method: 'POST', path: '/api/daily-runs', body,
  headers: { cookie: `satzwerk_learner=${learner}`, ...(key ? { 'idempotency-key': key } : {}) },
});
const run: DailyRunInput = { id: 'daily-first', day: '2026-10-07', scriptId: 'sc-bakery-pre-a1',
  goal: 'everyday', stage: 0, total: 0, firstTryCorrect: 0, listeningCompleted: false };

it('saves a session, resumes it from the snapshot, and never rewinds its score', async () => {
  expect((await request(run)).status).toBe(200);
  expect((await request({ ...run, stage: 5, total: 8, firstTryCorrect: 6, listeningCompleted: true })).status).toBe(200);
  await request({ ...run, stage: 1 });
  const response = await handleRequest({ db }, { method: 'GET', path: '/api/state' });
  expect((response.body as { dailyRuns: unknown[] }).dailyRuns).toEqual([expect.objectContaining({
    stage: 5, total: 8, firstTryCorrect: 6, listeningCompleted: true,
  })]);
  expect((await store.getStats({ db, userId: 1 })).totalAnswers).toBe(0);
});

it('deduplicates retries and rejects reusing a run ID for a different conversation', async () => {
  const first = await request(run, 'same-ack');
  expect(await request(run, 'same-ack')).toEqual(first);
  expect(await store.listDailyRuns({ db, userId: 1 })).toHaveLength(1);
  expect((await request({ ...run, scriptId: 'sc-bakery-a1' }, 'new-ack')).status).toBe(409);
});

it('isolates goals and daily practice across learners and resets only the current learner', async () => {
  const other = await store.createLearner(db, 'second');
  await request(run);
  await request({ ...run, goal: 'travel', stage: 2, total: 3, firstTryCorrect: 2 }, undefined, other.id);
  expect((await store.listDailyRuns({ db, userId: 1 }))[0]!.goal).toBe('everyday');
  expect((await store.listDailyRuns({ db, userId: other.id }))[0]!.goal).toBe('travel');
  await store.resetAll({ db, userId: 1 });
  expect(await store.listDailyRuns({ db, userId: 1 })).toHaveLength(0);
  expect(await store.listDailyRuns({ db, userId: other.id })).toHaveLength(1);
});

it('persists learning preferences and rejects invalid values', async () => {
  const patch = (body: unknown) => handleRequest({ db }, { method: 'PATCH', path: '/api/profile', body });
  expect((await patch({ learningGoal: 'work', practiceLevel: 'b1', weeklyTargetDays: 3 })).status).toBe(200);
  expect(await store.getProfile({ db, userId: 1 })).toMatchObject({ learningGoal: 'work', practiceLevel: 'b1', weeklyTargetDays: 3 });
  for (const body of [{ learningGoal: 'unknown' }, { practiceLevel: 'c2' }, { weeklyTargetDays: 0 }, { weeklyTargetDays: 2.5 }]) {
    expect((await patch(body)).status).toBe(400);
  }
});

it.each([
  { stage: -1 }, { stage: 6 }, { total: 2, firstTryCorrect: 3 }, { total: -1 },
  { day: '2026-02-30' }, { scriptId: 'not-a-script' }, { listeningCompleted: 'true' },
])('rejects malformed session progress %j', async patch => {
  expect((await request({ ...run, ...patch })).status).toBe(400);
});
