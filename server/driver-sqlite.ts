import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createGate, normaliseRow, type Db, type Param, type Row } from './driver.ts';

/**
 * The SQLite driver: what runs locally and in the tests.
 *
 * `node:sqlite` is synchronous, so every method here resolves immediately.
 * That is deliberate — the async interface exists for the hosted database, and
 * paying for it locally buys nothing. It does mean the tests never wait on a
 * network, which is why the whole suite still runs in about four seconds.
 */

export interface SqliteOptions {
  /** A file path, or ':memory:' for tests. */
  path?: string;
}

/**
 * SQLite has no GREATEST/LEAST. Its two-argument `max()` and `min()` are the
 * scalar equivalents, so the queries are written in the standard spelling and
 * downgraded here. Single-argument aggregates are untouched: the rewrite only
 * fires on the GREATEST/LEAST names, which SQLite does not define at all.
 */
function forSqlite(sql: string): string {
  return sql.replace(/\bGREATEST\s*\(/gi, 'max(').replace(/\bLEAST\s*\(/gi, 'min(');
}

/**
 * The module specifier is a variable, not a literal, and that is load-bearing.
 *
 * A bundler hoists `import 'node:sqlite'` to a top-level static import even
 * when the module is only reached through `await import('./driver-sqlite.ts')`,
 * because ESM imports are always hoisted. Vercel bundles, so the "lazy" import
 * became eager: a hosted deployment loaded `node:sqlite` on every cold start
 * despite never using it, and on a Node older than 22.5 that module does not
 * exist, so the import threw before any of our code ran. The platform then
 * reports a generic crash, the client cannot parse the error page, and the
 * learner sees `Unexpected token 'A'`.
 *
 * A computed specifier cannot be resolved statically, so it stays a genuine
 * runtime import and the dependency lives only where it is used.
 */
const SQLITE_MODULE = 'node:sqlite';

export async function openSqlite(options: SqliteOptions = {}): Promise<Db> {
  const { DatabaseSync } = (await import(SQLITE_MODULE)) as typeof import('node:sqlite');
  const path = options.path ?? process.env.SATZWERK_DB ?? 'data/satzwerk.db';
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');

  const gate = createGate();

  return {
    dialect: 'sqlite',

    all<T = Row>(sql: string, ...params: Param[]): Promise<T[]> {
      return gate.statement(async () => {
        const rows = db.prepare(forSqlite(sql)).all(...(params as never[])) as Row[];
        return rows.map((row) => normaliseRow(row)) as T[];
      });
    },

    get<T = Row>(sql: string, ...params: Param[]): Promise<T | undefined> {
      return gate.statement(async () => {
        const row = db.prepare(forSqlite(sql)).get(...(params as never[])) as Row | undefined;
        return row === undefined ? undefined : (normaliseRow(row) as T);
      });
    },

    run(sql: string, ...params: Param[]): Promise<{ changes: number }> {
      return gate.statement(async () => {
        const result = db.prepare(forSqlite(sql)).run(...(params as never[]));
        return { changes: Number(result.changes) };
      });
    },

    exec(sql: string): Promise<void> {
      return gate.statement(async () => {
        db.exec(forSqlite(sql));
      });
    },

    /**
     * Savepoints are still not emulated — nothing here nests, and a silent
     * partial rollback would be worse than the error. What changed is that a
     * *concurrent* transaction now waits its turn instead of being told it is
     * a nested one, which it never was.
     */
    transaction<T>(body: () => Promise<T>): Promise<T> {
      return gate.exclusive(async () => {
        db.exec('BEGIN');
        try {
          const result = await body();
          db.exec('COMMIT');
          return result;
        } catch (error) {
          db.exec('ROLLBACK');
          throw error;
        }
      });
    },

    async close(): Promise<void> {
      db.close();
    },
  };
}
