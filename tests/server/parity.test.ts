import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';

/**
 * Cross-dialect parity.
 *
 * The app runs on SQLite locally and on Postgres when hosted, so the two have
 * to agree. Anywhere they do not is a bug the SQLite tests cannot see, and
 * this is not hypothetical: writing this suite found a real one. The
 * `study_days` upserts said `seconds_active = seconds_active + ...`, which
 * SQLite quietly resolves to the target table and Postgres rejects as
 * ambiguous. Every answer recorded on the deployed app would have failed.
 *
 * Postgres is optional. Set TEST_DATABASE_URL to a throwaway database and
 * these run; leave it unset and they skip, so `npm test` needs no services.
 *
 *   TEST_DATABASE_URL=postgresql://postgres@127.0.0.1:5433/satzwerk_test npm test
 *
 * The database is dropped and recreated per run, so never point this at
 * anything you care about.
 */

const POSTGRES_URL = process.env.TEST_DATABASE_URL;
const describeParity = POSTGRES_URL ? describe : describe.skip;

const attempt = (over: Partial<store.AttemptInput> = {}): store.AttemptInput => ({
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
  ...over,
});

const day = (n: number) => new Date(`2026-03-0${n}T10:00:00Z`);

/**
 * Every write path that differs between the dialects: RETURNING, the
 * GREATEST upserts, ON CONFLICT with qualified columns, and the aggregates
 * Postgres returns as 64-bit integers.
 */
async function scenario(db: Db) {
  await store.recordAttempt(db, attempt({ hintsUsed: 1 }), day(1));
  await store.recordAttempt(
    db,
    attempt({ given: 'eine', verdict: 'correct', credit: 1, categories: [], hintsUsed: 3, resolved: true }),
    day(2),
  );
  await store.recordAttempt(db, attempt({ credit: 0.45 }), day(3));
  const outcome = (await store.getLessonProgress(db, 'pre-a1-u1-l2')).practice['u1l2-ex4-s2'];

  await store.recordAttempt(
    db,
    attempt({ given: 'eine', verdict: 'correct', credit: 1, categories: [], isRetype: true, resolved: true }),
    day(4),
  );
  const afterRetype = (await store.getLessonProgress(db, 'pre-a1-u1-l2')).practice['u1l2-ex4-s2'];

  await store.recordAttempt(
    db,
    attempt({ reviewTargets: [{ kind: 'vocab', refId: 'v-die-tochter', level: 'pre-a1', difficulty: 2 }] }),
    day(5),
  );

  await store.markSectionSeen(db, 'pre-a1-u1-l2', 'u1l2-intro');
  await store.markSectionSeen(db, 'pre-a1-u1-l2', 'u1l2-intro');
  await store.recordMastery(db, 'pre-a1-u1-l2', 0.9, 0.8);
  await store.recordMastery(db, 'pre-a1-u1-l2', 0.7, 0.8);
  await store.addStudyTime(db, 90, day(5));
  await store.addStudyTime(db, 30, day(5));
  await store.recordCheckpointResult(db, {
    checkpointId: 'pre-a1-u1-checkpoint',
    scope: 'unit',
    targetId: 'pre-a1-u1',
    accuracy: 0.9,
    passed: true,
  });
  await store.setFavorite(db, 'v-die-tochter', true);

  const progress = await store.getLessonProgress(db, 'pre-a1-u1-l2');
  const stats = await store.getStats(db);
  return {
    outcome,
    afterRetype,
    reviewItems: (await store.listReviewItems(db)).map((item) => ({
      id: item.id,
      state: item.state,
      lapses: item.lapses,
      successCount: item.successCount,
      failureCount: item.failureCount,
    })),
    mistakes: (await store.listMistakes(db)).map((m) => ({
      category: m.category,
      occurrences: m.occurrences,
      correctedCount: m.correctedCount,
    })),
    stats: {
      totalAnswers: stats.totalAnswers,
      correctAnswers: stats.correctAnswers,
      accuracy: Number(stats.accuracy.toFixed(6)),
      retypedCorrections: stats.retypedCorrections,
      studyDays: stats.studyDays,
      categoryCounts: stats.categoryCounts,
    },
    // Postgres hands back bigint and numeric as strings unless told otherwise,
    // and a string here would break arithmetic in the UI.
    types: {
      totalAnswers: typeof stats.totalAnswers,
      accuracy: typeof stats.accuracy,
      secondsStudied: typeof stats.totalStudySeconds,
    },
    sections: progress.sectionsSeen,
    mastery: progress.mastery,
    studyDays: await store.listStudyDays(db, 5),
    checkpoints: (await store.listCheckpointResults(db)).map((c) => ({
      checkpointId: c.checkpointId,
      passed: c.passed,
      accuracy: c.accuracy,
    })),
    favorites: await store.listFavorites(db),
  };
}

describeParity('SQLite and Postgres agree', () => {
  let sqlitePath: string;
  let postgres: Db;

  beforeAll(async () => {
    sqlitePath = join(tmpdir(), `satzwerk-parity-${Date.now()}.db`);
    // A clean schema on the Postgres side too, so neither run inherits state.
    const admin = await openDatabase({ databaseUrl: POSTGRES_URL! });
    await admin.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    await admin.close();
    postgres = await openDatabase({ databaseUrl: POSTGRES_URL! });
  }, 30_000);

  afterAll(async () => {
    await postgres?.close();
    rmSync(sqlitePath, { force: true });
    rmSync(`${sqlitePath}-wal`, { force: true });
    rmSync(`${sqlitePath}-shm`, { force: true });
  });

  it('produces the same results for the same writes', async () => {
    const sqlite = await openDatabase({ path: sqlitePath });
    const fromSqlite = await scenario(sqlite);
    await sqlite.close();

    const fromPostgres = await scenario(postgres);

    // Compared whole rather than field by field: a new field that diverges
    // should fail this test without anyone remembering to add an assertion.
    expect(fromPostgres).toEqual(fromSqlite);
  }, 60_000);

  it('applies the same schema on both', async () => {
    const sqlite = await openDatabase({ path: `${sqlitePath}.schema` });
    const sqliteTables = (
      await sqlite.all<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
      )
    ).map((row) => row.name);
    await sqlite.close();
    rmSync(`${sqlitePath}.schema`, { force: true });

    const postgresTables = (
      await postgres.all<{ name: string }>(
        `SELECT table_name AS name FROM information_schema.tables
         WHERE table_schema = current_schema() ORDER BY table_name`,
      )
    ).map((row) => row.name);

    expect(postgresTables).toEqual(sqliteTables);
  }, 30_000);

  it('rolls a failed transaction back on Postgres', async () => {
    const before = await store.getStats(postgres);
    await expect(
      postgres.transaction(async () => {
        await postgres.run(
          'INSERT INTO study_days (day, seconds_active, answers, correct) VALUES (?, 1, 1, 1)',
          '1999-01-01',
        );
        throw new Error('deliberate');
      }),
    ).rejects.toThrow('deliberate');

    const orphan = await postgres.get('SELECT day FROM study_days WHERE day = ?', '1999-01-01');
    expect(orphan).toBeUndefined();
    expect((await store.getStats(postgres)).totalAnswers).toBe(before.totalAnswers);
  }, 30_000);
});
