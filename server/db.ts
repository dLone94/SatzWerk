import type { Db, Dialect } from './driver.ts';

/**
 * SatzWerk's schema.
 *
 * Progress survives a refresh, a restart and a browser cache clear, because it
 * lives in a real database rather than in browser storage. Which database
 * depends on where the app is running — see `driver.ts` — but the schema below
 * is written once.
 *
 * Migrations are plain numbered steps applied inside a transaction.
 * `schema_version` in `meta` records how far we have got.
 */

export type { Db } from './driver.ts';

interface Migration {
  version: number;
  name: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial schema',
    sql: `
      CREATE TABLE meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- A single local learner. Kept as a table (not a key-value blob) so that
      -- multi-user support later is an added column, not a rewrite.
      CREATE TABLE profile (
        id                   INTEGER PRIMARY KEY CHECK (id = 1),
        teaching_language    TEXT    NOT NULL DEFAULT 'en',
        daily_target_minutes INTEGER NOT NULL DEFAULT 20,
        display_name         TEXT,
        onboarded            INTEGER NOT NULL DEFAULT 0,
        created_at           TEXT    NOT NULL,
        updated_at           TEXT    NOT NULL
      );

      CREATE TABLE lesson_state (
        lesson_id             TEXT PRIMARY KEY,
        sections_seen         TEXT    NOT NULL DEFAULT '[]',
        mastery_attempts      INTEGER NOT NULL DEFAULT 0,
        mastery_best_accuracy REAL    NOT NULL DEFAULT 0,
        mastery_passed        INTEGER NOT NULL DEFAULT 0,
        recovery_rounds       INTEGER NOT NULL DEFAULT 0,
        started_at            TEXT,
        completed_at          TEXT,
        last_active_at        TEXT
      );

      CREATE TABLE step_outcomes (
        lesson_id         TEXT    NOT NULL,
        step_id           TEXT    NOT NULL,
        attempts          INTEGER NOT NULL DEFAULT 0,
        first_try_correct INTEGER NOT NULL DEFAULT 0,
        best_credit       REAL    NOT NULL DEFAULT 0,
        resolved          INTEGER NOT NULL DEFAULT 0,
        hints_used        INTEGER NOT NULL DEFAULT 0,
        revealed          INTEGER NOT NULL DEFAULT 0,
        updated_at        TEXT    NOT NULL,
        PRIMARY KEY (lesson_id, step_id)
      );

      CREATE TABLE review_items (
        id             TEXT PRIMARY KEY,
        kind           TEXT    NOT NULL,
        ref_id         TEXT    NOT NULL,
        lesson_id      TEXT,
        level          TEXT    NOT NULL,
        state          TEXT    NOT NULL,
        ease           REAL    NOT NULL,
        interval_days  REAL    NOT NULL,
        due_at         TEXT    NOT NULL,
        last_review_at TEXT,
        success_count  INTEGER NOT NULL DEFAULT 0,
        failure_count  INTEGER NOT NULL DEFAULT 0,
        lapses         INTEGER NOT NULL DEFAULT 0,
        learning_step  INTEGER NOT NULL DEFAULT 0,
        created_at     TEXT    NOT NULL
      );
      CREATE INDEX idx_review_due ON review_items (due_at);
      CREATE UNIQUE INDEX idx_review_ref ON review_items (kind, ref_id);

      -- Every single answer the learner submits, including retypings.
      CREATE TABLE attempts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL,
        context     TEXT    NOT NULL,
        lesson_id   TEXT,
        exercise_id TEXT,
        step_id     TEXT    NOT NULL,
        prompt      TEXT,
        expected    TEXT    NOT NULL,
        given       TEXT    NOT NULL,
        verdict     TEXT    NOT NULL,
        credit      REAL    NOT NULL,
        categories  TEXT    NOT NULL DEFAULT '[]',
        hints_used  INTEGER NOT NULL DEFAULT 0,
        revealed    INTEGER NOT NULL DEFAULT 0,
        is_retype   INTEGER NOT NULL DEFAULT 0,
        duration_ms INTEGER
      );
      CREATE INDEX idx_attempts_created ON attempts (created_at);
      CREATE INDEX idx_attempts_step ON attempts (step_id);

      -- The mistake bank. corrected_count is what keeps an original mistake
      -- distinguishable from the learner's successful retyping of it.
      CREATE TABLE mistakes (
        id              TEXT PRIMARY KEY,
        category        TEXT    NOT NULL,
        expected        TEXT    NOT NULL,
        last_given      TEXT    NOT NULL,
        step_id         TEXT,
        lesson_id       TEXT,
        occurrences     INTEGER NOT NULL DEFAULT 1,
        corrected_count INTEGER NOT NULL DEFAULT 0,
        first_seen_at   TEXT    NOT NULL,
        last_seen_at    TEXT    NOT NULL,
        resolved_at     TEXT
      );
      CREATE INDEX idx_mistakes_category ON mistakes (category);

      -- One row per calendar day the learner actually studied. The streak and
      -- the study-time figures are derived from this, never invented.
      CREATE TABLE study_days (
        day            TEXT PRIMARY KEY,
        seconds_active INTEGER NOT NULL DEFAULT 0,
        answers        INTEGER NOT NULL DEFAULT 0,
        correct        INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE checkpoint_results (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        checkpoint_id TEXT    NOT NULL,
        scope         TEXT    NOT NULL,
        target_id     TEXT    NOT NULL,
        accuracy      REAL    NOT NULL,
        passed        INTEGER NOT NULL,
        detail        TEXT    NOT NULL DEFAULT '{}',
        created_at    TEXT    NOT NULL
      );

      CREATE TABLE word_flags (
        vocab_id   TEXT PRIMARY KEY,
        favorite   INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT    NOT NULL
      );
    `,
  },
  {
    version: 2,
    name: 'accounts, so a second learner is a migration rather than a rewrite',
    sql: `
      -- One row today, matching the single profile. This exists so that adding
      -- a person later is an INSERT and a login screen, and so the session
      -- cookie has a real id to carry rather than a hard-coded 1.
      CREATE TABLE users (
        id         INTEGER PRIMARY KEY CHECK (id = 1),
        label      TEXT    NOT NULL DEFAULT 'me',
        created_at TEXT    NOT NULL
      );

      -- Attribute the existing data. The columns are added now rather than
      -- later because backfilling a live database is the awkward part; with
      -- them in place, supporting a second learner is a query change only.
      ALTER TABLE profile           ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE lesson_state      ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE step_outcomes     ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE review_items      ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE attempts          ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE mistakes          ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE study_days        ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE checkpoint_results ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE word_flags        ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;
    `,
  },
  {
    version: 3,
    name: 'credentials in the database, so no terminal is needed to set a password',
    sql: `
      -- The password hash lives with the account rather than only in an
      -- environment variable, so it can be set from the browser on first
      -- visit and changed later without any local tooling. An environment
      -- variable still overrides this when one is set.
      ALTER TABLE users ADD COLUMN password_hash TEXT;
      ALTER TABLE users ADD COLUMN password_set_at TEXT;
    `,
  },
  {
    version: 4,
    name: 'push subscriptions, so the app can say when review is actually due',
    sql: `
      -- One row per browser that agreed to be reminded. The endpoint is the
      -- identity: the same person on a phone and a laptop is two rows, and a
      -- re-subscription from the same browser returns the same endpoint, so it
      -- is the primary key rather than a generated id.
      --
      -- last_sent_at exists to stop a re-run of the sender from notifying
      -- twice on the same day. Nothing here stores what was sent; the message
      -- is computed from the review queue when it goes out.
      CREATE TABLE push_subscriptions (
        endpoint     TEXT    PRIMARY KEY,
        p256dh       TEXT    NOT NULL,
        auth         TEXT    NOT NULL,
        user_id      INTEGER NOT NULL DEFAULT 1,
        created_at   TEXT    NOT NULL,
        last_sent_at TEXT
      );
    `,
  },
  {
    version: 5,
    name: 'scenario runs, so Real Life reports what happened rather than what is possible',
    sql: `
      -- One row per script per learner, not one per run. What the Real Life
      -- page needs to say is "you have done this, twice, and the last time you
      -- got fourteen of sixteen first time" — a running tally answers that in
      -- one read, and the individual answers are already in the attempts table for
      -- anything finer.
      --
      -- best_accuracy is kept alongside last_accuracy on purpose: a scenario is
      -- meant to be replayed, and a learner who slips on a re-run should not
      -- watch their record disappear.
      CREATE TABLE scenario_runs (
        script_id         TEXT    NOT NULL,
        user_id           INTEGER NOT NULL DEFAULT 1,
        runs              INTEGER NOT NULL DEFAULT 0,
        turns             INTEGER NOT NULL DEFAULT 0,
        first_try_correct INTEGER NOT NULL DEFAULT 0,
        last_accuracy     REAL    NOT NULL DEFAULT 0,
        best_accuracy     REAL    NOT NULL DEFAULT 0,
        first_run_at      TEXT    NOT NULL,
        last_run_at       TEXT    NOT NULL,
        PRIMARY KEY (script_id, user_id)
      );
    `,
  },
  {
    version: 6,
    name: 'more than one learner, because a household is not one person',
    sql: `
      -- The people, kept apart from the household password.
      --
      -- \`users\` is the account: one row, one shared password, because everybody
      -- in this flat already shares the door key. Who is *studying* is a
      -- different question, and this is where the answer lives. Splitting them
      -- also avoids fighting the CHECK (id = 1) on \`users\`, which is still
      -- true of the account and now says nothing about the learners.
      --
      -- Every progress table already carries \`user_id\`, added in migration 2
      -- against exactly this day, so there is nothing to backfill: the rows
      -- that exist belong to learner 1, and learner 1 is created here from the
      -- label the account was already using.
      CREATE TABLE learners (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        created_at TEXT    NOT NULL
      );

      INSERT INTO learners (id, name, created_at)
      SELECT 1, COALESCE(NULLIF(label, ''), 'me'), created_at FROM users WHERE id = 1;

      -- And now the part migration 2 thought it had already solved.
      --
      -- Adding \`user_id\` to every table was necessary but not sufficient: the
      -- *keys* were still single-learner. \`profile\` refused a second row
      -- outright (CHECK (id = 1)); \`lesson_state\` keyed on lesson_id alone, so
      -- two people could not both be working on the same lesson; the same for
      -- step outcomes, review items, mistakes, study days and word flags. The
      -- second learner would have collided with the first on their first
      -- answer.
      --
      -- Widening a primary key means rebuilding the table in both dialects, so
      -- that is what this does: new table, copy the rows, drop, rename. The
      -- column lists are written out rather than SELECT *, because the order
      -- has to be pinned for the copy to mean anything.

      CREATE TABLE profile_v6 (
        user_id              INTEGER PRIMARY KEY,
        teaching_language    TEXT    NOT NULL DEFAULT 'en',
        daily_target_minutes INTEGER NOT NULL DEFAULT 20,
        display_name         TEXT,
        onboarded            INTEGER NOT NULL DEFAULT 0,
        created_at           TEXT    NOT NULL,
        updated_at           TEXT    NOT NULL
      );
      INSERT INTO profile_v6 (user_id, teaching_language, daily_target_minutes, display_name, onboarded, created_at, updated_at)
        SELECT user_id, teaching_language, daily_target_minutes, display_name, onboarded, created_at, updated_at FROM profile;
      DROP TABLE profile;
      ALTER TABLE profile_v6 RENAME TO profile;

      CREATE TABLE lesson_state_v6 (
        lesson_id             TEXT    NOT NULL,
        user_id               INTEGER NOT NULL DEFAULT 1,
        sections_seen         TEXT    NOT NULL DEFAULT '[]',
        mastery_attempts      INTEGER NOT NULL DEFAULT 0,
        mastery_best_accuracy REAL    NOT NULL DEFAULT 0,
        mastery_passed        INTEGER NOT NULL DEFAULT 0,
        recovery_rounds       INTEGER NOT NULL DEFAULT 0,
        started_at            TEXT,
        completed_at          TEXT,
        last_active_at        TEXT,
        PRIMARY KEY (lesson_id, user_id)
      );
      INSERT INTO lesson_state_v6 (lesson_id, user_id, sections_seen, mastery_attempts, mastery_best_accuracy, mastery_passed, recovery_rounds, started_at, completed_at, last_active_at)
        SELECT lesson_id, user_id, sections_seen, mastery_attempts, mastery_best_accuracy, mastery_passed, recovery_rounds, started_at, completed_at, last_active_at FROM lesson_state;
      DROP TABLE lesson_state;
      ALTER TABLE lesson_state_v6 RENAME TO lesson_state;

      CREATE TABLE step_outcomes_v6 (
        lesson_id         TEXT    NOT NULL,
        step_id           TEXT    NOT NULL,
        user_id           INTEGER NOT NULL DEFAULT 1,
        attempts          INTEGER NOT NULL DEFAULT 0,
        first_try_correct INTEGER NOT NULL DEFAULT 0,
        best_credit       REAL    NOT NULL DEFAULT 0,
        resolved          INTEGER NOT NULL DEFAULT 0,
        hints_used        INTEGER NOT NULL DEFAULT 0,
        revealed          INTEGER NOT NULL DEFAULT 0,
        updated_at        TEXT    NOT NULL,
        PRIMARY KEY (lesson_id, step_id, user_id)
      );
      INSERT INTO step_outcomes_v6 (lesson_id, step_id, user_id, attempts, first_try_correct, best_credit, resolved, hints_used, revealed, updated_at)
        SELECT lesson_id, step_id, user_id, attempts, first_try_correct, best_credit, resolved, hints_used, revealed, updated_at FROM step_outcomes;
      DROP TABLE step_outcomes;
      ALTER TABLE step_outcomes_v6 RENAME TO step_outcomes;

      CREATE TABLE review_items_v6 (
        id             TEXT    NOT NULL,
        user_id        INTEGER NOT NULL DEFAULT 1,
        kind           TEXT    NOT NULL,
        ref_id         TEXT    NOT NULL,
        lesson_id      TEXT,
        level          TEXT    NOT NULL,
        state          TEXT    NOT NULL,
        ease           REAL    NOT NULL,
        interval_days  REAL    NOT NULL,
        due_at         TEXT    NOT NULL,
        last_review_at TEXT,
        success_count  INTEGER NOT NULL DEFAULT 0,
        failure_count  INTEGER NOT NULL DEFAULT 0,
        lapses         INTEGER NOT NULL DEFAULT 0,
        learning_step  INTEGER NOT NULL DEFAULT 0,
        created_at     TEXT    NOT NULL,
        PRIMARY KEY (id, user_id)
      );
      INSERT INTO review_items_v6 (id, user_id, kind, ref_id, lesson_id, level, state, ease, interval_days, due_at, last_review_at, success_count, failure_count, lapses, learning_step, created_at)
        SELECT id, user_id, kind, ref_id, lesson_id, level, state, ease, interval_days, due_at, last_review_at, success_count, failure_count, lapses, learning_step, created_at FROM review_items;
      DROP TABLE review_items;
      ALTER TABLE review_items_v6 RENAME TO review_items;
      CREATE INDEX idx_review_due ON review_items (due_at);
      CREATE UNIQUE INDEX idx_review_ref ON review_items (kind, ref_id, user_id);

      CREATE TABLE mistakes_v6 (
        id              TEXT    NOT NULL,
        user_id         INTEGER NOT NULL DEFAULT 1,
        category        TEXT    NOT NULL,
        expected        TEXT    NOT NULL,
        last_given      TEXT    NOT NULL,
        step_id         TEXT,
        lesson_id       TEXT,
        occurrences     INTEGER NOT NULL DEFAULT 1,
        corrected_count INTEGER NOT NULL DEFAULT 0,
        first_seen_at   TEXT    NOT NULL,
        last_seen_at    TEXT    NOT NULL,
        resolved_at     TEXT,
        PRIMARY KEY (id, user_id)
      );
      INSERT INTO mistakes_v6 (id, user_id, category, expected, last_given, step_id, lesson_id, occurrences, corrected_count, first_seen_at, last_seen_at, resolved_at)
        SELECT id, user_id, category, expected, last_given, step_id, lesson_id, occurrences, corrected_count, first_seen_at, last_seen_at, resolved_at FROM mistakes;
      DROP TABLE mistakes;
      ALTER TABLE mistakes_v6 RENAME TO mistakes;
      CREATE INDEX idx_mistakes_category ON mistakes (category);

      CREATE TABLE study_days_v6 (
        day            TEXT    NOT NULL,
        user_id        INTEGER NOT NULL DEFAULT 1,
        seconds_active INTEGER NOT NULL DEFAULT 0,
        answers        INTEGER NOT NULL DEFAULT 0,
        correct        INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (day, user_id)
      );
      INSERT INTO study_days_v6 (day, user_id, seconds_active, answers, correct)
        SELECT day, user_id, seconds_active, answers, correct FROM study_days;
      DROP TABLE study_days;
      ALTER TABLE study_days_v6 RENAME TO study_days;

      CREATE TABLE word_flags_v6 (
        vocab_id   TEXT    NOT NULL,
        user_id    INTEGER NOT NULL DEFAULT 1,
        favorite   INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT    NOT NULL,
        PRIMARY KEY (vocab_id, user_id)
      );
      INSERT INTO word_flags_v6 (vocab_id, user_id, favorite, updated_at)
        SELECT vocab_id, user_id, favorite, updated_at FROM word_flags;
      DROP TABLE word_flags;
      ALTER TABLE word_flags_v6 RENAME TO word_flags;
    `,
  },
  {
    version: 7,
    name: 'receipts for retried learning writes',
    sql: `CREATE TABLE write_receipts (
      user_id INTEGER NOT NULL,
      write_id TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      response TEXT,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, write_id)
    );`,
  },
  {
    version: 8,
    name: 'personal learning goals and resumable daily practice',
    sql: `
      ALTER TABLE profile ADD COLUMN learning_goal TEXT NOT NULL DEFAULT 'everyday';
      ALTER TABLE profile ADD COLUMN practice_level TEXT;
      ALTER TABLE profile ADD COLUMN weekly_target_days INTEGER NOT NULL DEFAULT 4;
      CREATE TABLE daily_runs (
        user_id INTEGER NOT NULL,
        id TEXT NOT NULL,
        day TEXT NOT NULL,
        script_id TEXT NOT NULL,
        goal TEXT NOT NULL,
        stage INTEGER NOT NULL DEFAULT 0 CHECK (stage BETWEEN 0 AND 5),
        total INTEGER NOT NULL DEFAULT 0,
        first_try_correct INTEGER NOT NULL DEFAULT 0,
        listening_completed INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, id)
      );
      CREATE INDEX daily_runs_recent ON daily_runs (user_id, day, updated_at);
    `,
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1]!.version;

/**
 * The three places the two dialects genuinely disagree.
 *
 * Everything else in the schema above — TEXT, INTEGER, CHECK, REFERENCES, and
 * the eight ON CONFLICT clauses — means the same thing in both, so the schema
 * is not written twice. Booleans stay INTEGER 0/1 in Postgres too, which keeps
 * the row shapes identical and the reading code unchanged.
 */
function forDialect(sql: string, dialect: Dialect): string {
  if (dialect === 'sqlite') return sql;
  return sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'BIGSERIAL PRIMARY KEY');
}

/** Does the `meta` table exist yet? Asked differently by each dialect. */
async function metaExists(db: Db): Promise<boolean> {
  const sql =
    db.dialect === 'sqlite'
      ? "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meta'"
      : "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'meta'";
  const row = await db.get<{ name: string }>(sql);
  return row !== undefined;
}

async function currentVersion(db: Db): Promise<number> {
  if (!(await metaExists(db))) return 0;
  const row = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'schema_version');
  return row ? Number(row.value) : 0;
}

/** Record the version reached. SQLite and Postgres spell an upsert differently. */
async function recordVersion(db: Db, version: number): Promise<void> {
  const sql =
    db.dialect === 'sqlite'
      ? 'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)'
      : `INSERT INTO meta (key, value) VALUES (?, ?)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value`;
  await db.run(sql, 'schema_version', String(version));
}

/**
 * Bring a database up to date, or up to `upTo` if an older schema is wanted.
 *
 * `upTo` exists for the tests: the upgrade path can only be exercised honestly
 * against a database that really was built by an older version of this file,
 * and the only way to build one of those is to run the migrations of that time
 * and stop. Winding a current database back by hand would mean a list of drops
 * that has to grow with every migration added here — a list nobody remembers
 * until the day it silently stops testing anything.
 */
export async function migrate(db: Db, upTo: number = SCHEMA_VERSION): Promise<number> {
  let version = await currentVersion(db);
  for (const migration of MIGRATIONS) {
    if (migration.version <= version) continue;
    if (migration.version > upTo) break;
    try {
      await db.transaction(async () => {
        await db.exec(forDialect(migration.sql, db.dialect));
        await recordVersion(db, migration.version);
      });
      version = migration.version;
    } catch (error) {
      throw new Error(
        `Migration ${migration.version} (${migration.name}) failed: ${(error as Error).message}`,
      );
    }
  }
  return version;
}

export interface OpenOptions {
  /** A file path, or ':memory:' for tests. Ignored when a Postgres URL is set. */
  path?: string;
  /** A Postgres connection string. Defaults to the environment when present. */
  databaseUrl?: string;
}

/**
 * Where a Postgres connection string may be found, in order of preference.
 *
 * `DATABASE_URL` is the name this project documents and the one to set by
 * hand. The others are not alternatives invented here — they are the names
 * that Vercel's own Neon and Postgres integrations create when you add a
 * database to a project from the dashboard. Someone who connects a database
 * that way has genuinely configured one, and refusing to look at the variable
 * it created would be this app being pedantic about a name while sitting in
 * front of a perfectly good database.
 *
 * The unpooled variants come last: they work, but a pooled endpoint is the
 * better default for a function that may be started many times.
 */
export const DATABASE_URL_VARIABLES = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'NEON_DATABASE_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_URL_NO_SSL',
] as const;

/**
 * Does this look like a Postgres connection string?
 *
 * The value is the reliable signal. A name can be anything; a connection
 * string always starts the same way.
 */
function isPostgresUrl(value: string): boolean {
  return /^postgres(?:ql)?:\/\//i.test(value);
}

/**
 * A variable that was clearly meant to hold a Postgres connection, under a
 * name this project has not thought of.
 *
 * Vercel prefixes the variables it creates with the store's name, so the same
 * database can arrive as `POSTGRES_URL`, `MY_STORE_POSTGRES_URL` or
 * `NEON_DATABASE_URL` depending on what it was called when it was added. There
 * is no list that stays complete, so the last resort is to recognise the
 * shape: a name that says Postgres or Neon and ends in URL, holding a value
 * that begins postgres:// or postgresql://.
 *
 * The name must mention Postgres or Neon, which is deliberately narrow.
 * `TEST_DATABASE_URL` is a real variable in this project's own test runs and
 * must never be mistaken for the app's database, so "ends in DATABASE_URL" is
 * not good enough.
 */
function findByShape(env: NodeJS.ProcessEnv): { name: string; url: string } | undefined {
  const candidates = Object.keys(env)
    // URL need not end the name: Vercel's unpooled variants put the qualifier
    // after it, as in POSTGRES_URL_NON_POOLING.
    .filter((name) => /^[A-Z0-9_]*(POSTGRES|NEON)[A-Z0-9_]*URL(_[A-Z0-9_]+)?$/.test(name))
    .filter((name) => isPostgresUrl((env[name] ?? '').trim()))
    .sort();
  // A pooled endpoint suits a function that may be started many times, so a
  // direct connection is only used when it is all there is.
  const pooled = candidates.find((name) => !/UNPOOLED|NON_POOLING|NO_SSL/.test(name));
  const name = pooled ?? candidates[0];
  return name === undefined ? undefined : { name, url: (env[name] ?? '').trim() };
}

/** The first database variable that is actually set, with its name. */
export function findDatabaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): { name: string; url: string } | undefined {
  for (const name of DATABASE_URL_VARIABLES) {
    const url = env[name]?.trim();
    if (url) return { name, url };
  }
  return findByShape(env);
}

/**
 * Open the database, run the migrations and make sure the profile row exists.
 *
 * A Postgres URL wins when one is given or set in the environment, because
 * that is the signal that this is a hosted deployment. Otherwise it is SQLite,
 * so local development and the tests need no configuration at all.
 */
/**
 * `upTo` stops the migrations early, which is only ever wanted by a test that
 * needs a database genuinely built by an older version of this file. Seeding is
 * skipped then too, because the rows it writes may not have their columns yet.
 */
export async function openDatabase(options: OpenOptions = {}, upTo?: number): Promise<Db> {
  const url = options.databaseUrl ?? (options.path ? undefined : findDatabaseUrl()?.url);
  const db = url ? await openPostgresDriver(url) : await openSqliteDriver(options.path);
  await migrate(db, upTo);
  if (upTo === undefined) {
    await seedProfile(db);
    await alignLearnerIds(db);
  }
  return db;
}

/**
 * Teach Postgres where the learner ids have got to.
 *
 * Migration 6 inserts the first learner with an explicit id — it has to be 1,
 * because every existing progress row already says `user_id = 1`. An explicit
 * id does not advance a BIGSERIAL sequence, so the *next* learner is handed
 * id 1 as well and the insert dies on the primary key. SQLite does not have
 * this problem (AUTOINCREMENT takes max + 1), which is exactly why it took a
 * rehearsal against a populated Postgres to find: every test passed, and
 * adding a second learner on the hosted copy would have thrown.
 *
 * Run on every open, because it is cheap, idempotent, and the alternative is
 * remembering to run it after the one migration that seeds a row by hand.
 */
async function alignLearnerIds(db: Db): Promise<void> {
  if (db.dialect !== 'postgres') return;
  await db.run(
    `SELECT setval(
       pg_get_serial_sequence('learners', 'id'),
       GREATEST((SELECT MAX(id) FROM learners), 1)
     )`,
  );
}

/**
 * Both drivers load on demand, and that is not a nicety.
 *
 * `driver-sqlite.ts` imports `node:sqlite`, which only exists from Node 22.5.
 * Importing it eagerly meant a hosted deployment loaded it on every cold start
 * even though it never uses it — and on an older Node the import throws at
 * module load, before any code of ours runs, so the platform reports a generic
 * crash rather than anything diagnosable. Loading each driver only when it is
 * the one in use keeps that dependency where it belongs.
 */
async function openPostgresDriver(url: string): Promise<Db> {
  const { openPostgres } = await import('./driver-postgres.ts');
  return openPostgres(url);
}

async function openSqliteDriver(path?: string): Promise<Db> {
  // A hosted deployment has no writable disk, so falling back to SQLite there
  // would fail confusingly a moment later. Say what is actually wrong instead.
  // SATZWERK_DB is an explicit choice to use SQLite — someone running on a
  // platform with a mounted disk means it — so it is honoured either way.
  if (!path && !process.env.SATZWERK_DB && process.env.VERCEL) {
    throw new Error(
      `DATABASE_URL is not set. A hosted deployment needs Postgres, because a serverless function has no disk to keep a SQLite file on. Set DATABASE_URL in the project settings, for the environment this deployment belongs to (Preview and Production are separate). These names are also accepted, since Vercel's database integrations create them: ${DATABASE_URL_VARIABLES.slice(1).join(', ')}. /api/health lists which database variables this deployment can see.`,
    );
  }
  const { openSqlite } = await import('./driver-sqlite.ts');
  return openSqlite({ path });
}

/**
 * Ensure the single account and profile rows exist, so reads never have to
 * handle null.
 *
 * Note what this does *not* do: the queries in `store.ts` do not filter by
 * `user_id` yet, because there is exactly one learner and threading it through
 * 35 queries would be churn with no present benefit. The column and the table
 * are here so that the day a second person is added, it is a query pass rather
 * than a schema migration over live data. Until that pass happens, a second
 * row in `users` would share one set of progress — which is why nothing
 * creates one.
 */
async function seedProfile(db: Db): Promise<void> {
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO users (id, label, created_at) VALUES (1, 'me', ?)
     ON CONFLICT (id) DO NOTHING`,
    now,
  );
  await db.run(
    `INSERT INTO profile (user_id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
     VALUES (1, 'en', 20, 0, ?, ?)
     ON CONFLICT (user_id) DO NOTHING`,
    now,
    now,
  );
  // The first learner. On an upgraded database migration 6 has already
  // created this row from the account's label; on a fresh one there was
  // nothing to copy, so it is created here beside the profile it owns.
  await db.run(
    `INSERT INTO learners (id, name, created_at) VALUES (1, 'me', ?)
     ON CONFLICT (id) DO NOTHING`,
    now,
  );
}
