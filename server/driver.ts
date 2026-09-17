/**
 * The storage driver.
 *
 * SatzWerk runs in two places, and they cannot use the same database:
 *
 *  - On your own machine and in the tests: SQLite through Node's built-in
 *    `node:sqlite`. A real file on disk, no native modules, no network, no
 *    setup. `npm run dev` and `npm test` work offline.
 *  - On Vercel: Postgres, because a serverless function has no persistent
 *    disk. A SQLite file there would be recreated empty on every cold start,
 *    and progress is the one thing this app must not lose.
 *
 * Everything above this file is written against `Db` and never learns which
 * one it got. The interface is async because a hosted database is, even though
 * `node:sqlite` underneath is synchronous.
 *
 * SQL is written once, in SQLite's `?` placeholder style. The Postgres driver
 * rewrites `?` to `$1, $2, ...` on the way through, so no query has to be
 * written twice. Where the two dialects genuinely differ — identity columns,
 * upserts, catalogue lookups — `db.dialect` and the helpers in `db.ts` decide.
 */

export type Param = string | number | bigint | null;

export type Dialect = 'sqlite' | 'postgres';

export interface Db {
  readonly dialect: Dialect;
  /** Every matching row. */
  all<T = Row>(sql: string, ...params: Param[]): Promise<T[]>;
  /** The first matching row, or undefined. */
  get<T = Row>(sql: string, ...params: Param[]): Promise<T | undefined>;
  /** A write. `changes` is the number of rows affected. */
  run(sql: string, ...params: Param[]): Promise<{ changes: number }>;
  /** Run one or more statements with no parameters, for DDL. */
  exec(sql: string): Promise<void>;
  /**
   * Run `body` inside a transaction, committing on return and rolling back if
   * it throws. Not reentrant: callers never nest these.
   */
  transaction<T>(body: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export type Row = Record<string, unknown>;

/**
 * Rewrite SQLite's `?` placeholders as Postgres's `$1, $2, ...`.
 *
 * Quoted regions are skipped so that a `?` inside a string literal or an
 * identifier is left alone. No query in this project has one today, but a
 * translator that corrupts SQL the moment somebody writes `LIKE '%?%'` is a
 * trap worth closing now rather than debugging later.
 */
export function toPositional(sql: string): string {
  let out = '';
  let index = 0;
  let quote: "'" | '"' | null = null;
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]!;
    if (quote) {
      out += char;
      // '' and "" are escaped quotes inside a quoted region, not the end of it.
      if (char === quote) {
        if (sql[i + 1] === quote) {
          out += sql[i + 1];
          i++;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      out += char;
      continue;
    }
    if (char === '?') {
      index++;
      out += `$${index}`;
      continue;
    }
    out += char;
  }
  return out;
}

/**
 * Postgres returns 64-bit integers — which is what `COUNT(*)` and `SUM(...)`
 * produce — as BigInt or as a string, depending on the driver. The rest of the
 * app expects plain numbers, so normalise here rather than at every call site.
 */
export function normaliseRow(row: Row): Row {
  let changed = false;
  const out: Row = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      out[key] = Number(value);
      changed = true;
    } else {
      out[key] = value;
    }
  }
  return changed ? out : row;
}
