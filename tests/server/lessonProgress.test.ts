import pg from 'pg';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { unavailableProvider } from '../../server/ai.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';
import { availableLessons } from '../../src/content/index.ts';

/**
 * Opening the app reads the progress of every lesson the learner has touched.
 *
 * It used to ask lesson by lesson, two statements each, so a learner far into
 * the course opened the app with over a hundred and seventy statements — and
 * the hosted database's pool has one connection, so they went one after
 * another. Nothing showed locally, where SQLite answers in microseconds; it
 * cost seconds on a database across the ocean.
 *
 * Run against SQLite always, and against Postgres too when TEST_DATABASE_URL
 * is set.
 */

const databases: Array<[string, () => Promise<Db>]> = [['sqlite', () => openDatabase({ path: ':memory:' })]];
if (process.env.TEST_DATABASE_URL) {
  databases.push([
    'postgres',
    async () => {
      // A schema of its own, as in loginLimit.test.ts: the parity tests drop
      // and recreate `public` while other files run.
      const url = process.env.TEST_DATABASE_URL!;
      const admin = new pg.Client({ connectionString: url });
      await admin.connect();
      await admin.query('DROP SCHEMA IF EXISTS lesson_progress CASCADE; CREATE SCHEMA lesson_progress;');
      await admin.end();
      const separator = url.includes('?') ? '&' : '?';
      return openDatabase({ databaseUrl: `${url}${separator}options=-c%20search_path%3Dlesson_progress` });
    },
  ]);
}

/** The same database, keeping a list of every statement sent to it. */
function counting(inner: Db): { db: Db; sent: string[] } {
  const sent: string[] = [];
  const db = {
    dialect: inner.dialect,
    all: (sql: string, ...params: never[]) => (sent.push(sql), inner.all(sql, ...params)),
    get: (sql: string, ...params: never[]) => (sent.push(sql), inner.get(sql, ...params)),
    run: (sql: string, ...params: never[]) => (sent.push(sql), inner.run(sql, ...params)),
    exec: (sql: string) => (sent.push(sql), inner.exec(sql)),
    transaction: <T>(body: () => Promise<T>) => inner.transaction(body),
    close: () => inner.close(),
  } as Db;
  return { db, sent };
}

/** One wrong answer in each of the first `count` lessons, read and checked in every third. */
async function touch(scope: store.Scope, count: number, from = 0) {
  for (const [index, lesson] of availableLessons().slice(from, from + count).entries()) {
    const exercise = lesson.exercises[0]!;
    await store.recordAttempt(scope, {
      context: 'lesson',
      lessonId: lesson.id,
      exerciseId: exercise.id,
      stepId: exercise.steps[0]!.id,
      expected: 'eine',
      given: 'ein',
      verdict: 'incorrect',
      credit: 0,
      categories: ['article'],
      hintsUsed: index % 2,
      revealed: false,
      isRetype: false,
      resolved: false,
    });
    if (index % 3 === 0) {
      await store.markSectionSeen(scope, lesson.id, lesson.sections[0]!.id);
      await store.recordMastery(scope, lesson.id, 0.9, 0.8);
    }
  }
}

const opened: Db[] = [];
afterAll(async () => {
  for (const db of opened) await db.close();
});

describe.each(databases)('reading every lesson at once, on %s', (_name, open) => {
  let db: Db;

  beforeEach(async () => {
    db = await open();
    opened.push(db);
  });

  async function statementsForState(): Promise<string[]> {
    const { db: watched, sent } = counting(db);
    const response = await handleRequest({ db: watched, provider: unavailableProvider }, { method: 'GET', path: '/api/state' });
    expect(response.status).toBe(200);
    return sent;
  }

  it('asks the same number of questions for one lesson as for forty', async () => {
    const scope = { db, userId: 1 };
    await touch(scope, 1);
    const few = await statementsForState();
    await touch(scope, 39, 1);
    const many = await statementsForState();

    expect((await store.getAllLessonProgress(scope)).length).toBe(40);
    expect(many.length, `GET /api/state sent ${many.length} statements for 40 lessons`).toBe(few.length);
  });

  it('reads each lesson as reading it alone does, and only the learner’s own', async () => {
    const scope = { db, userId: 1 };
    const other = { db, userId: (await store.createLearner(db, 'Papa')).id };
    await touch(scope, 12);
    await touch(other, 6, 3);
    // Outcomes with no lesson row of their own, as older rows can be.
    await db.run(
      `INSERT INTO step_outcomes (lesson_id, step_id, user_id, attempts, first_try_correct, best_credit, resolved, hints_used, revealed, updated_at)
       VALUES ('legacy-lesson', 'legacy-step', 1, 2, 0, 0.5, 1, 1, 0, '2026-01-01T00:00:00.000Z')`,
    );

    for (const who of [scope, other]) {
      const all = await store.getAllLessonProgress(who);
      const alone = await Promise.all(all.map((lesson) => store.getLessonProgress(who, lesson.lessonId)));
      expect(all).toEqual(alone);
    }

    const mine = await store.getAllLessonProgress(scope);
    expect(mine.map((lesson) => lesson.lessonId).sort()).toEqual(
      [...availableLessons().slice(0, 12).map((lesson) => lesson.id), 'legacy-lesson'].sort(),
    );
    expect(mine.find((lesson) => lesson.lessonId === 'legacy-lesson')).toMatchObject({
      sectionsSeen: [],
      practice: { 'legacy-step': { attempts: 2, bestCredit: 0.5, resolved: true, hintsUsed: 1 } },
    });
    const first = mine.find((lesson) => lesson.lessonId === availableLessons()[0]!.id)!;
    expect(first.mastery.passed).toBe(true);
    expect(first.sectionsSeen).toHaveLength(1);
    expect(Object.keys(first.practice)).toHaveLength(1);

    const theirs = await store.getAllLessonProgress(other);
    expect(theirs.map((lesson) => lesson.lessonId).sort()).toEqual(
      availableLessons().slice(3, 9).map((lesson) => lesson.id).sort(),
    );
  });
});
