import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openDatabase, type Db } from '../../server/db.ts';
import * as push from '../../server/push.ts';
import * as store from '../../server/store.ts';
import { handleRequest, resolveAuth } from '../../server/api.ts';

/** Every store call belongs to somebody; in these tests it is the first learner. */
const scopeOf = (db: Db): store.Scope => ({ db, userId: 1 });


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

describeParity('audit fixes across two Postgres instances', () => {
  let first: Db;
  let second: Db;
  beforeAll(async () => {
    const admin = await openDatabase({ databaseUrl: POSTGRES_URL! });
    await admin.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await admin.close();
    first = await openDatabase({ databaseUrl: POSTGRES_URL! });
    second = await openDatabase({ databaseUrl: POSTGRES_URL! });
  }, 30_000);
  afterAll(async () => { await first?.close(); await second?.close(); });

  it('banks a retried answer once across different processes', async () => {
    const request = {
      method: 'POST', path: '/api/attempts', headers: { 'idempotency-key': 'cross-instance-answer' },
      body: { stepId: 'cross-instance', expected: 'Hallo', given: 'Hallo', verdict: 'correct', credit: 1, resolved: true },
    };
    const replies = await Promise.all([handleRequest({ db: first }, request), handleRequest({ db: second }, request)]);
    expect(replies[0]).toEqual(replies[1]);
    expect((await store.getStats(scopeOf(first))).totalAnswers).toBe(1);
  });

  it('preserves independent settings from different instances', async () => {
    await Promise.all([
      store.updateProfile(scopeOf(first), { teachingLanguage: 'bg' }),
      store.updateProfile(scopeOf(second), { dailyTargetMinutes: 30 }),
    ]);
    expect(await store.getProfile(scopeOf(first))).toMatchObject({ teachingLanguage: 'bg', dailyTargetMinutes: 30 });
  });

  it('allows only one first password across instances', async () => {
    const auth = { ...(await resolveAuth(first)), hosted: true };
    const replies = await Promise.all([first, second].map((db, index) => handleRequest({ db, auth }, {
      method: 'POST', path: '/api/setup', body: { password: `audit-password-${index}` },
    })));
    expect(replies.map(reply => reply.status).sort()).toEqual([200, 409]);
  });

  it('keeps every grade when two instances update the same item', async () => {
    await store.ensureReviewItems(scopeOf(first), [{ kind: 'vocab', refId: 'audit-word', level: 'a1' }]);
    await Promise.all(Array.from({ length: 6 }, (_, index) =>
      store.gradeReviewItem(scopeOf(index % 2 ? first : second), 'vocab:audit-word', 'good')));
    expect((await store.getReviewItem(scopeOf(first), 'vocab:audit-word'))!.successCount).toBe(6);
  });
});

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
  await store.recordAttempt(scopeOf(db), attempt({ hintsUsed: 1 }), day(1));
  await store.recordAttempt(
    scopeOf(db),
    attempt({ given: 'eine', verdict: 'correct', credit: 1, categories: [], hintsUsed: 3, resolved: true }),
    day(2),
  );
  await store.recordAttempt(scopeOf(db), attempt({ credit: 0.45 }), day(3));
  const outcome = (await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2')).practice['u1l2-ex4-s2'];

  await store.recordAttempt(
    scopeOf(db),
    attempt({ given: 'eine', verdict: 'correct', credit: 1, categories: [], isRetype: true, resolved: true }),
    day(4),
  );
  const afterRetype = (await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2')).practice['u1l2-ex4-s2'];

  await store.recordAttempt(
    scopeOf(db),
    attempt({ reviewTargets: [{ kind: 'vocab', refId: 'v-die-tochter', level: 'pre-a1', difficulty: 2 }] }),
    day(5),
  );

  await store.markSectionSeen(scopeOf(db), 'pre-a1-u1-l2', 'u1l2-intro');
  await store.markSectionSeen(scopeOf(db), 'pre-a1-u1-l2', 'u1l2-intro');
  await store.recordMastery(scopeOf(db), 'pre-a1-u1-l2', 0.9, 0.8);
  await store.recordMastery(scopeOf(db), 'pre-a1-u1-l2', 0.7, 0.8);
  await store.addStudyTime(scopeOf(db), 90, day(5));
  await store.addStudyTime(scopeOf(db), 30, day(5));
  await store.recordCheckpointResult(scopeOf(db), {
    checkpointId: 'pre-a1-u1-checkpoint',
    scope: 'unit',
    targetId: 'pre-a1-u1',
    accuracy: 0.9,
    passed: true,
  });
  await store.setFavorite(scopeOf(db), 'v-die-tochter', true);

  /*
   * Push subscriptions, which are stored with an ON CONFLICT upsert keyed on
   * the endpoint. A browser that re-subscribes returns the same endpoint with
   * fresh keys, so the second save has to update rather than duplicate — and
   * an upsert is exactly the shape that has already diverged between these two
   * dialects once, in the study_days columns above.
   */
  await push.saveSubscription(scopeOf(db), { endpoint: 'https://push.example/abc', p256dh: 'k1', auth: 'a1' });
  await push.saveSubscription(scopeOf(db), { endpoint: 'https://push.example/abc', p256dh: 'k2', auth: 'a2' });
  await push.saveSubscription(scopeOf(db), { endpoint: 'https://push.example/def', p256dh: 'k3', auth: 'a3' });
  await push.deleteSubscription(scopeOf(db), 'https://push.example/def');

  /*
   * Scenario runs, whose upsert is keyed on two columns rather than one. The
   * first version of it named a single column in ON CONFLICT and was rejected
   * by SQLite at runtime with nothing failing until a conversation was
   * actually finished in a browser; the replay below is what makes the
   * conflict branch — and Postgres's agreement with it — part of the test.
   *
   * The explicit clocks are not decoration either. Without them each database
   * gets its own wall clock, three writes inside one millisecond tie while
   * three that straddle a boundary do not, and the two runs come back in
   * different orders for a reason that has nothing to do with the dialects.
   * Fixed instants make the comparison mean what it claims: the bakery is
   * replayed on day 3 so it sorts ahead of the doctor on day 2.
   */
  await store.recordScenarioRun(scopeOf(db), { scriptId: 'sc-bakery-a1', turns: 5, firstTryCorrect: 5 }, day(1));
  await store.recordScenarioRun(scopeOf(db), { scriptId: 'sc-bakery-a1', turns: 5, firstTryCorrect: 2 }, day(3));
  await store.recordScenarioRun(scopeOf(db), { scriptId: 'sc-doctor-a2', turns: 4, firstTryCorrect: 3 }, day(2));

  const progress = await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2');
  const stats = await store.getStats(scopeOf(db));
  return {
    outcome,
    afterRetype,
    reviewItems: (await store.listReviewItems(scopeOf(db))).map((item) => ({
      id: item.id,
      state: item.state,
      lapses: item.lapses,
      successCount: item.successCount,
      failureCount: item.failureCount,
    })),
    mistakes: (await store.listMistakes(scopeOf(db))).map((m) => ({
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
    studyDays: await store.listStudyDays(scopeOf(db), 5),
    studyDaysForStreak: await store.listStudyDaysForStreak(scopeOf(db), 1),
    checkpoints: (await store.listCheckpointResults(scopeOf(db))).map((c) => ({
      checkpointId: c.checkpointId,
      passed: c.passed,
      accuracy: c.accuracy,
    })),
    favorites: await store.listFavorites(scopeOf(db)),
    scenarioRuns: (await store.listScenarioRuns(scopeOf(db))).map((run) => ({
      scriptId: run.scriptId,
      runs: run.runs,
      turns: run.turns,
      firstTryCorrect: run.firstTryCorrect,
      lastAccuracy: Number(run.lastAccuracy.toFixed(6)),
      bestAccuracy: Number(run.bestAccuracy.toFixed(6)),
      // Postgres returns REAL as a string unless coerced; a string here would
      // print "0.4%" as NaN on the Real Life page.
      accuracyType: typeof run.bestAccuracy,
    })),
    subscriptions: (await push.listSubscriptions(scopeOf(db))).map((row) => ({
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      lastSentAt: row.lastSentAt,
    })),
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

  it('saves personal goals and resumable daily sessions the same way in both databases', async () => {
    const sqlite = await openDatabase({ path: ':memory:' });
    async function daily(db: Db) {
      const learner = await store.createLearner(db, 'daily-learner');
      const scope = { db, userId: learner.id };
      await store.updateProfile(scope, { learningGoal: 'work', practiceLevel: 'a2', weeklyTargetDays: 3 });
      const input = { id: 'daily-parity', day: '2026-10-07', scriptId: 'sc-work-a2', goal: 'work' as const,
        stage: 0, total: 0, firstTryCorrect: 0, listeningCompleted: false };
      await store.recordDailyRun(scope, input);
      await store.recordDailyRun(scope, { ...input, stage: 5, total: 12, firstTryCorrect: 9, listeningCompleted: true });
      await store.recordDailyRun(scope, { ...input, stage: 2 });
      const profile = await store.getProfile(scope);
      const runs = (await store.listDailyRuns(scope)).map(({ updatedAt: _, ...run }) => run);
      return { goal: profile.learningGoal, level: profile.practiceLevel, target: profile.weeklyTargetDays, runs };
    }
    try { expect(await daily(postgres)).toEqual(await daily(sqlite)); }
    finally { await sqlite.close(); }
  }, 30_000);

  it('rolls a failed transaction back on Postgres', async () => {
    const before = await store.getStats(scopeOf(postgres));
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
    expect((await store.getStats(scopeOf(postgres))).totalAnswers).toBe(before.totalAnswers);
  }, 30_000);
});

/**
 * The upgrade path on Postgres: a database that already holds progress.
 *
 * Every other migration test runs on SQLite, and CI only ever migrates an
 * empty Postgres. That gap hid a real bug. Migration 6 seeds the first
 * learner with an explicit `id = 1` — it has to, because every existing
 * progress row already says `user_id = 1` — and an explicit id does not
 * advance a BIGSERIAL sequence. So the next learner was handed id 1 too and
 * the insert died on the primary key. SQLite's AUTOINCREMENT takes max + 1,
 * so the whole suite stayed green while "Add somebody" would have thrown on
 * the hosted copy.
 *
 * Hence both halves below: the data survives the seven-table rebuild, *and*
 * somebody else can still be added afterwards.
 */
describeParity('upgrading a Postgres database that already has progress in it', () => {
  let db: Db;

  beforeAll(async () => {
    const admin = await openDatabase({ databaseUrl: POSTGRES_URL! });
    await admin.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
    await admin.close();

    // Stop the migrations at 5 and write the rows by hand: that is the
    // database the version before learners left behind. Winding a current one
    // back instead would mean a list of columns to maintain, and the day
    // someone forgot to extend it this test would pass while testing nothing.
    const at = '2026-09-20T09:00:00.000Z';
    const before = await openDatabase({ databaseUrl: POSTGRES_URL! }, 5);
    await before.run("INSERT INTO users (id, label, created_at) VALUES (1, 'Teo', ?)", at);
    await before.run(
      `INSERT INTO profile (id, teaching_language, daily_target_minutes, display_name, onboarded, created_at, updated_at)
       VALUES (1, 'bg', 30, 'Teo', 1, ?, ?)`,
      at,
      at,
    );
    await before.run(
      `INSERT INTO lesson_state (lesson_id, sections_seen, mastery_attempts, mastery_best_accuracy, mastery_passed,
                                 recovery_rounds, started_at, completed_at, last_active_at)
       VALUES ('pre-a1-u1-l1', '["u1l1-intro"]', 2, 1, 1, 1, ?, ?, ?)`,
      at,
      at,
      at,
    );
    await before.run(
      `INSERT INTO step_outcomes (lesson_id, step_id, attempts, first_try_correct, best_credit, resolved,
                                  hints_used, revealed, updated_at)
       VALUES ('pre-a1-u1-l1', 'u1l1-ex1-s1', 3, 1, 1, 1, 0, 0, ?)`,
      at,
    );
    await before.run(
      `INSERT INTO review_items (id, kind, ref_id, lesson_id, level, state, ease, interval_days, due_at,
                                 success_count, failure_count, lapses, learning_step, created_at)
       VALUES ('vocab:v-der-tisch', 'vocab', 'v-der-tisch', 'pre-a1-u1-l1', 'pre-a1', 'known', 2.5, 6, ?, 4, 1, 0, 0, ?)`,
      at,
      at,
    );
    await before.run(
      `INSERT INTO attempts (created_at, context, step_id, expected, given, verdict, credit, categories,
                             hints_used, revealed, is_retype)
       VALUES (?, 'lesson', 'u1l1-ex1-s1', 'der Tisch', 'die Tisch', 'incorrect', 0, '["article"]', 0, 0, 0)`,
      at,
    );
    await before.run(
      `INSERT INTO mistakes (id, category, expected, last_given, step_id, lesson_id, occurrences,
                             corrected_count, first_seen_at, last_seen_at)
       VALUES ('article:der Tisch:u1l1-ex1-s1', 'article', 'der Tisch', 'die Tisch', 'u1l1-ex1-s1',
               'pre-a1-u1-l1', 5, 2, ?, ?)`,
      at,
      at,
    );
    await before.run(
      "INSERT INTO study_days (day, seconds_active, answers, correct) VALUES ('2026-09-20', 900, 40, 33)",
    );
    await before.run(
      `INSERT INTO checkpoint_results (checkpoint_id, scope, target_id, accuracy, passed, detail, created_at)
       VALUES ('cp-pre-a1-u1', 'unit', 'pre-a1-u1', 0.9, 1, '{}', ?)`,
      at,
    );
    await before.run("INSERT INTO word_flags (vocab_id, favorite, updated_at) VALUES ('v-der-tisch', 1, ?)", at);
    await before.run(
      `INSERT INTO scenario_runs (script_id, user_id, runs, turns, first_try_correct, last_accuracy,
                                  best_accuracy, first_run_at, last_run_at)
       VALUES ('sc-bakery-pre-a1', 1, 3, 4, 4, 1, 1, ?, ?)`,
      at,
      at,
    );
    await before.close();

    // The upgrade itself, exactly as a deployment runs it on its next boot.
    db = await openDatabase({ databaseUrl: POSTGRES_URL! });
  }, 60_000);

  afterAll(async () => {
    await db?.close();
  });

  it('keeps every table it rebuilds', async () => {
    const scope = scopeOf(db);
    const lesson = await store.getLessonProgress(scope, 'pre-a1-u1-l1');
    const stats = await store.getStats(scope);

    expect(await store.getProfile(scope)).toMatchObject({
      teachingLanguage: 'bg',
      dailyTargetMinutes: 30,
      displayName: 'Teo',
    });
    expect(lesson.mastery).toMatchObject({ attempts: 2, passed: true });
    expect(lesson.sectionsSeen).toEqual(['u1l1-intro']);
    expect(Object.keys(lesson.practice)).toEqual(['u1l1-ex1-s1']);
    expect(await store.getReviewItem(scope, 'vocab:v-der-tisch')).toMatchObject({
      state: 'known',
      intervalDays: 6,
      successCount: 4,
    });
    expect((await store.listMistakes(scope)).map((m) => m.occurrences)).toEqual([5]);
    expect(stats.totalAnswers).toBe(1);
    expect(stats.totalStudySeconds).toBe(900);
    expect((await store.listStudyDays(scope, 5)).map((d) => d.answers)).toEqual([40]);
    expect((await store.listCheckpointResults(scope)).map((c) => c.passed)).toEqual([true]);
    expect(await store.listFavorites(scope)).toEqual(['v-der-tisch']);
    expect((await store.listScenarioRuns(scope)).map((r) => r.runs)).toEqual([3]);
  }, 30_000);

  it('carries the account name over as the first learner', async () => {
    expect(await store.listLearners(db)).toMatchObject([{ id: 1, name: 'Teo' }]);
  }, 30_000);

  it('can still add somebody else afterwards', async () => {
    // The assertion that would have failed: an id of its own, not a clash.
    const papa = await store.createLearner(db, 'Papa');
    expect(papa.id).toBeGreaterThan(1);

    // And the two of them keep their progress apart, which is the whole point
    // of the migration that nearly broke here.
    await store.recordMastery({ db, userId: papa.id }, 'pre-a1-u1-l1', 0, 0.67);
    expect((await store.getLessonProgress({ db, userId: papa.id }, 'pre-a1-u1-l1')).mastery.passed).toBe(false);
    expect((await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l1')).mastery.passed).toBe(true);
  }, 30_000);
});

/**
 * A connection Postgres drops while it sits idle in the pool.
 *
 * A restart, a failover, Neon's maintenance or an administrator can close a
 * pooled connection nobody is using. `pg` reports that as an 'error' event on
 * the pool, and with nothing listening Node treats it as uncaught and exits:
 * `npm start` went down until somebody restarted it, and a warm Vercel
 * instance died under the next request.
 */
/**
 * Two instances marking sections of one lesson at the same moment. Each read
 * the list, added its section and wrote the whole list back, so the later
 * write dropped the other's section — 17 times in 40 in a measured run. An
 * in-process lock cannot cover this, because on Vercel the two requests can
 * land on different instances; only the database can.
 */
describeParity('two instances marking sections at once', () => {
  it('keeps every section', async () => {
    const one = await openDatabase({ databaseUrl: POSTGRES_URL! });
    const two = await openDatabase({ databaseUrl: POSTGRES_URL! });
    try {
      for (let round = 0; round < 10; round += 1) {
        const lesson = `race-${Date.now()}-${round}`;
        await Promise.all([
          store.markSectionSeen(scopeOf(one), lesson, 'a'),
          store.markSectionSeen(scopeOf(two), lesson, 'b'),
        ]);
        const seen = (await store.getLessonProgress(scopeOf(one), lesson)).sectionsSeen;
        expect([...seen].sort(), `round ${round}`).toEqual(['a', 'b']);
      }
    } finally {
      await one.close();
      await two.close();
    }
  }, 60_000);
});

describeParity('a pooled connection that Postgres closes', () => {
  it('is dropped quietly, and the next query opens a fresh one', async () => {
    const db = await openDatabase({ databaseUrl: POSTGRES_URL! });
    const admin = await openDatabase({ databaseUrl: POSTGRES_URL! });
    const uncaught: unknown[] = [];
    const listener = (error: unknown) => uncaught.push(error);
    process.on('uncaughtException', listener);
    try {
      const own = await db.get<{ pid: number }>('SELECT pg_backend_pid() AS pid');
      await admin.get('SELECT pg_terminate_backend(?)', own!.pid);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(uncaught).toEqual([]);
      expect(await db.get<{ one: number }>('SELECT 1 AS one')).toEqual({ one: 1 });
    } finally {
      process.off('uncaughtException', listener);
      await admin.close();
      await db.close();
    }
  }, 30_000);
});
