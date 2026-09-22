import { AsyncLocalStorage } from 'node:async_hooks';

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
 * One transaction at a time, and nobody else's statement inside it.
 *
 * Both drivers need this and neither can do without it. `recordAttempt` wraps
 * six writes in a transaction, and two answers arriving at the same moment —
 * two phones in one household, or one warm serverless instance handed two
 * requests — used to meet a bare `if (depth > 0) throw`. Measured against a
 * real Postgres that lost eleven of fourteen answers with HTTP 500, and the
 * browser treats a 500 as a refusal rather than as "hold this and retry", so
 * the sentences were gone. SQLite never showed it: `node:sqlite` is
 * synchronous, so its transaction body never yields and nothing can interleave.
 *
 * So a second transaction waits rather than failing, and a statement issued
 * from anywhere else waits too — otherwise it would land between somebody
 * else's BEGIN and COMMIT and be rolled back with them, which is the quieter
 * and worse version of the same bug.
 *
 * The transaction's *own* statements must not wait for it: they are the one
 * caller that would deadlock. `AsyncLocalStorage` is what tells them apart,
 * because "am I inside this transaction?" is a question about the call stack
 * and not about time — a flag set around an `await` cannot answer it.
 */
export interface Gate {
  /** A single statement. Waits while somebody else's transaction is open. */
  statement<T>(work: () => Promise<T>): Promise<T>;
  /** `body` with the database to itself. Still throws on a genuine nesting. */
  exclusive<T>(body: () => Promise<T>): Promise<T>;
}

export function createGate(): Gate {
  const inside = new AsyncLocalStorage<symbol>();
  let open: symbol | null = null;
  let freed = deferred();

  /** True when this call is one of the open transaction's own statements. */
  const mine = () => open !== null && inside.getStore() === open;

  return {
    async statement<T>(work: () => Promise<T>): Promise<T> {
      if (mine()) return work();
      // The loop is written out here rather than called, because the check has
      // to be the last thing that happens before the work starts. Hidden
      // behind `await someHelper()` there is a tick between the two, and a
      // transaction opening in it would have this statement inside it.
      while (open !== null) await freed.promise;
      return work();
    },

    async exclusive<T>(body: () => Promise<T>): Promise<T> {
      if (mine()) throw new Error('transaction() cannot be nested');
      const token = Symbol('transaction');
      // Same rule, and here it is not a nicety but the whole mechanism: the
      // claim must follow the check with no suspension point between them.
      // Written as `await waitForGap(); open = token;` it does not — an async
      // call yields even when its body never awaits — so two callers that
      // arrive together both pass the check, both claim, and each then holds
      // what the other is waiting for. That deadlocked until `pg` gave up
      // eight seconds later, which is how this comment came to be here.
      while (open !== null) await freed.promise;
      open = token;
      freed = deferred();
      try {
        return await inside.run(token, body);
      } finally {
        open = null;
        freed.resolve();
      }
    },
  };
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

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
