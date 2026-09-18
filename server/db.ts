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

export async function migrate(db: Db): Promise<number> {
  let version = await currentVersion(db);
  for (const migration of MIGRATIONS) {
    if (migration.version <= version) continue;
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
export async function openDatabase(options: OpenOptions = {}): Promise<Db> {
  const url = options.databaseUrl ?? (options.path ? undefined : findDatabaseUrl()?.url);
  const db = url ? await openPostgresDriver(url) : await openSqliteDriver(options.path);
  await migrate(db);
  await seedProfile(db);
  return db;
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
    `INSERT INTO profile (id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
     VALUES (1, 'en', 20, 0, ?, ?)
     ON CONFLICT (id) DO NOTHING`,
    now,
    now,
  );
}
