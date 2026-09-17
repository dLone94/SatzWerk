import { openSqlite } from './driver-sqlite.ts';
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
  /** A Postgres connection string. Defaults to DATABASE_URL when present. */
  databaseUrl?: string;
}

/**
 * Open the database, run the migrations and make sure the profile row exists.
 *
 * A Postgres URL wins when one is given or set in the environment, because
 * that is the signal that this is a hosted deployment. Otherwise it is SQLite,
 * so local development and the tests need no configuration at all.
 */
export async function openDatabase(options: OpenOptions = {}): Promise<Db> {
  const url = options.databaseUrl ?? (options.path ? undefined : process.env.DATABASE_URL);
  const db = url ? await openPostgresDriver(url) : openSqlite({ path: options.path });
  await migrate(db);
  await seedProfile(db);
  return db;
}

/**
 * Loaded on demand so that the Postgres driver — and its dependency — are
 * never touched locally or by the tests.
 */
async function openPostgresDriver(url: string): Promise<Db> {
  const { openPostgres } = await import('./driver-postgres.ts');
  return openPostgres(url);
}

/** Ensure the single profile row exists, so reads never have to handle null. */
async function seedProfile(db: Db): Promise<void> {
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO profile (id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
     VALUES (1, 'en', 20, 0, ?, ?)
     ON CONFLICT (id) DO NOTHING`,
    now,
    now,
  );
}
