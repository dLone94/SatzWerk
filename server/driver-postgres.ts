import { normaliseRow, toPositional, type Db, type Param, type Row } from './driver.ts';

/**
 * The Postgres driver: what runs when the app is hosted.
 *
 * A serverless function has no persistent disk, so the SQLite file the app
 * uses locally would be recreated empty on every cold start. Progress is the
 * one thing this app must not lose, so hosted deployments talk to Postgres.
 *
 * There are two transports, chosen by the connection string:
 *
 *  - **Neon** (`*.neon.tech`), over HTTP. A serverless function cannot hold a
 *    connection pool between invocations, and a pooled client would exhaust
 *    the database's connection limit under even light traffic. Neon's driver
 *    sidesteps that by speaking Postgres over HTTP, with no TCP handshake.
 *  - **Any other Postgres**, over TCP with `pg`. This is what a long-running
 *    server, another host, or a local database gets — and it is what lets the
 *    whole test suite run against a real Postgres rather than only SQLite.
 *
 * Both go through the same SQL. The queries are written in SQLite's `?`
 * placeholder style and rewritten to `$1, $2, ...` here, so nothing is
 * written twice.
 *
 * `SATZWERK_PG_TRANSPORT=tcp` overrides the choice and forces the TCP path
 * even for a Neon URL. That exists because the HTTP client is the one piece
 * here never run against a real database, so if it misbehaves the remedy is a
 * changed environment variable rather than a code change.
 */

interface QueryResult {
  rows: Row[];
  rowCount: number | null;
}

interface Session {
  query: (sql: string, params: unknown[]) => Promise<QueryResult>;
}

/** Neon's HTTP endpoint is only worth using for Neon. */
function isNeon(url: string): boolean {
  try {
    return /(^|\.)neon\.tech$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export type PgTransport = 'http' | 'tcp';

/**
 * Which transport to use. TCP unless asked otherwise.
 *
 * Neon's HTTP driver is the usual advice for serverless, and it was the
 * default here until it hung a real deployment. Its one-shot query endpoint
 * cannot run multi-statement DDL or hold a transaction open, so those fall
 * back to its WebSocket `Pool`, which needs a WebSocket implementation wired
 * up explicitly in Node. Without it the first request — the one that runs the
 * migrations — never settles, and the app sits on "Loading" with nothing to
 * report, which is a far worse failure than an error.
 *
 * So the default is the path the parity tests actually cover against a real
 * Postgres. The reason to prefer HTTP is avoiding connection exhaustion, and
 * for a single learner that is not a real risk; where it is, Neon's pooler
 * endpoint solves it for TCP too.
 *
 * `SATZWERK_PG_TRANSPORT=http` opts back in.
 */
export function chooseTransport(url: string, env: NodeJS.ProcessEnv = process.env): PgTransport {
  const forced = env.SATZWERK_PG_TRANSPORT?.trim().toLowerCase();
  if (forced === 'tcp' || forced === 'http') return forced;
  if (forced) {
    throw new Error(
      `SATZWERK_PG_TRANSPORT must be "tcp" or "http", not ${JSON.stringify(forced)}.`,
    );
  }
  // `url` is unused now that TCP is the default, but the parameter stays: the
  // choice is a property of the connection, and hard-coding it here would be
  // the wrong shape the moment that changes.
  void url;
  return 'tcp';
}

export async function openPostgres(url: string): Promise<Db> {
  return chooseTransport(url) === 'http' ? openNeon(url) : openStandard(url);
}

/* ------------------------------------------------------------------ *
 * Neon, over HTTP
 * ------------------------------------------------------------------ */

async function openNeon(url: string): Promise<Db> {
  const { neon, neonConfig, Pool } = await import('@neondatabase/serverless');
  neonConfig.fetchConnectionCache = true;

  const http = neon(url, { fullResults: true }) as unknown as Session;

  // A transaction has to run on one session, and each HTTP query is its own.
  // Multi-statement DDL is the same story. Both go through a pool, created
  // only if something needs it.
  let pool: { session: Session; end: () => Promise<void> } | null = null;
  const pooled = async (): Promise<Session> => {
    if (!pool) {
      const created = new Pool({ connectionString: url });
      pool = { session: created as unknown as Session, end: () => created.end() };
    }
    return pool.session;
  };

  return build({
    oneOff: async () => http,
    session: pooled,
    close: async () => {
      if (pool) {
        await pool.end();
        pool = null;
      }
    },
  });
}

/* ------------------------------------------------------------------ *
 * Any Postgres, over TCP
 * ------------------------------------------------------------------ */

async function openStandard(url: string): Promise<Db> {
  const { Pool, types } = await import('pg');

  // `pg` returns bigint and numeric as strings to avoid silent precision loss.
  // Every such column here is a count, a sum or a credit that comfortably fits
  // in a double, and the rest of the app expects numbers, so parse them.
  types.setTypeParser(types.builtins.INT8, (value) => Number(value));
  types.setTypeParser(types.builtins.NUMERIC, (value) => Number(value));

  // Neon and most hosted Postgres require TLS, and the connection string says
  // so with sslmode=require. Being explicit avoids depending on how a given
  // `pg` version reads that parameter.
  const needsTls = /[?&]sslmode=(require|verify-ca|verify-full)/i.test(url) || isNeon(url);

  const pool = new Pool({
    connectionString: url,
    ...(needsTls ? { ssl: { rejectUnauthorized: false } } : {}),
    // A serverless invocation is short-lived, so a connection that cannot be
    // made must fail rather than hold the request open. Hanging is the worst
    // outcome: the app shows "Loading" forever and says nothing.
    // Must be comfortably inside the hosting platform's function limit, so a
    // refused or unroutable database produces an error we can show rather than
    // the function being killed mid-connect.
    connectionTimeoutMillis: 8_000,
    // One connection is plenty for one learner, and it keeps a cold start from
    // opening several against a database with a small connection limit.
    max: 1,
    idleTimeoutMillis: 10_000,
  });
  const session = pool as unknown as Session;

  return build({
    oneOff: async () => session,
    session: async () => session,
    close: () => pool.end(),
  });
}

/* ------------------------------------------------------------------ *
 * Shared behaviour
 * ------------------------------------------------------------------ */

interface Sessions {
  /** For a single statement, where a dedicated session is not needed. */
  oneOff: () => Promise<Session>;
  /** For DDL and transactions, which need one session throughout. */
  session: () => Promise<Session>;
  close: () => Promise<void>;
}

function build(transport: Sessions): Db {
  // Set while a transaction is open, so every query inside it goes to the same
  // session as the BEGIN.
  let active: Session | null = null;

  const run = async (sql: string, params: Param[]): Promise<QueryResult> => {
    const session = active ?? (await transport.oneOff());
    return session.query(toPositional(sql), params);
  };

  return {
    dialect: 'postgres',

    async all<T = Row>(sql: string, ...params: Param[]): Promise<T[]> {
      const result = await run(sql, params);
      return result.rows.map((row) => normaliseRow(row)) as T[];
    },

    async get<T = Row>(sql: string, ...params: Param[]): Promise<T | undefined> {
      const result = await run(sql, params);
      const row = result.rows[0];
      return row === undefined ? undefined : (normaliseRow(row) as T);
    },

    async run(sql: string, ...params: Param[]): Promise<{ changes: number }> {
      const result = await run(sql, params);
      return { changes: result.rowCount ?? 0 };
    },

    async exec(sql: string): Promise<void> {
      // Several statements in one string, which needs a real session.
      const session = active ?? (await transport.session());
      await session.query(sql, []);
    },

    async transaction<T>(body: () => Promise<T>): Promise<T> {
      if (active) throw new Error('transaction() cannot be nested');
      const session = await transport.session();
      active = session;
      await session.query('BEGIN', []);
      try {
        const result = await body();
        await session.query('COMMIT', []);
        return result;
      } catch (error) {
        await session.query('ROLLBACK', []);
        throw error;
      } finally {
        active = null;
      }
    },

    close: transport.close,
  };
}
