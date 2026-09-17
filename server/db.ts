import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * SatzWerk's durable store.
 *
 * SQLite through Node's built-in `node:sqlite` driver: a real database file on
 * disk, no native modules to compile. Progress therefore survives a refresh, a
 * restart and a browser cache clear, which browser storage would not.
 *
 * Migrations are plain numbered steps applied inside a transaction. `schema_version`
 * in `meta` records how far we have got.
 */

export type Db = DatabaseSync;

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

function currentVersion(db: Db): number {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meta'")
    .all();
  if (tables.length === 0) return 0;
  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('schema_version') as
    | { value: string }
    | undefined;
  return row ? Number(row.value) : 0;
}

export function migrate(db: Db): number {
  let version = currentVersion(db);
  for (const migration of MIGRATIONS) {
    if (migration.version <= version) continue;
    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(
        'schema_version',
        String(migration.version),
      );
      db.exec('COMMIT');
      version = migration.version;
    } catch (error) {
      db.exec('ROLLBACK');
      throw new Error(
        `Migration ${migration.version} (${migration.name}) failed: ${(error as Error).message}`,
      );
    }
  }
  return version;
}

export interface OpenOptions {
  /** A file path, or ':memory:' for tests. */
  path?: string;
}

export function openDatabase(options: OpenOptions = {}): Db {
  const path = options.path ?? process.env.SATZWERK_DB ?? 'data/satzwerk.db';
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  seedProfile(db);
  return db;
}

/** Ensure the single profile row exists, so reads never have to handle null. */
function seedProfile(db: Db): void {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO profile (id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
     VALUES (1, 'en', 20, 0, ?, ?)
     ON CONFLICT (id) DO NOTHING`,
  ).run(now, now);
}
