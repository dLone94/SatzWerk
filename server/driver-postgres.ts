import { createGate, normaliseRow, toPositional, type Db, type Param, type Row } from './driver.ts';

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

/**
 * A pooled connection the database closed while nobody was using it.
 *
 * A restart, a failover, Neon's maintenance or an administrator can end an
 * idle connection, and the pool reports it as an 'error' event. With no
 * listener Node treats that event as uncaught and the whole process exits.
 * The pool has already thrown the dead client away by the time it says so,
 * and the next query opens a new one, so there is nothing to do but note it.
 */
function idleConnectionLost(error: Error): void {
  console.error('[satzwerk] idle database connection lost:', error.message);
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
  let pool: { checkout: () => Promise<Lease>; end: () => Promise<void> } | null = null;
  const pooled = async (): Promise<Lease> => {
    if (!pool) {
      const created = new Pool({ connectionString: url });
      created.on('error', idleConnectionLost);
      pool = {
        checkout: async () => {
          const client = (await created.connect()) as unknown as Session &
            Pick<import('node:events').EventEmitter, 'on' | 'off'> & { release: () => void };
          // As with `pg` below: a checked-out client is not the pool's to
          // watch, and a transaction holds one across several statements.
          client.on('error', idleConnectionLost);
          return {
            session: client,
            release: () => {
              client.off('error', idleConnectionLost);
              client.release();
            },
          };
        },
        end: () => created.end(),
      };
    }
    return pool.checkout();
  };

  return build({
    oneOff: async () => http,
    lease: pooled,
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
  pool.on('error', idleConnectionLost);
  return build({
    // A single statement is what `pool.query` is for: it checks a connection
    // out, runs the statement and gives it straight back.
    oneOff: async () => pool as unknown as Session,
    /*
     * A transaction is not.
     *
     * `pool.query` releases the connection after every statement, so a BEGIN
     * sent that way is handed back to the pool immediately and the COMMIT can
     * land on a different connection entirely — a transaction in name only.
     * `max: 1` hid that by making "a different connection" impossible, which
     * is not a guarantee, it is a coincidence one config change away from
     * silent data loss. So anything that needs one session throughout checks
     * a client out and holds it.
     */
    lease: async () => {
      const client = await pool.connect();
      // The pool stops listening to a client while it is checked out, so a
      // connection dropped between two statements of a transaction would be
      // an uncaught 'error' too. The statement in flight still fails with it.
      client.on('error', idleConnectionLost);
      return {
        session: client as unknown as Session,
        release: () => {
          client.off('error', idleConnectionLost);
          client.release();
        },
      };
    },
    close: () => pool.end(),
  });
}

/* ------------------------------------------------------------------ *
 * Shared behaviour
 * ------------------------------------------------------------------ */

/** A session borrowed for as long as one caller needs it, and then returned. */
interface Lease {
  session: Session;
  release: () => void;
}

interface Sessions {
  /** For a single statement, where a dedicated session is not needed. */
  oneOff: () => Promise<Session>;
  /** For DDL and transactions, which need one session throughout. */
  lease: () => Promise<Lease>;
  close: () => Promise<void>;
}

function build(transport: Sessions): Db {
  // Set while a transaction is open, so every query inside it goes to the same
  // session as the BEGIN. The gate is what keeps anybody else's query out of
  // it — and what makes a second transaction wait rather than fail.
  const gate = createGate();
  let active: Session | null = null;

  const run = async (sql: string, params: Param[]): Promise<QueryResult> => {
    const session = active ?? (await transport.oneOff());
    return session.query(toPositional(sql), params);
  };

  return {
    dialect: 'postgres',

    all<T = Row>(sql: string, ...params: Param[]): Promise<T[]> {
      return gate.statement(async () => {
        const result = await run(sql, params);
        return result.rows.map((row) => normaliseRow(row)) as T[];
      });
    },

    get<T = Row>(sql: string, ...params: Param[]): Promise<T | undefined> {
      return gate.statement(async () => {
        const result = await run(sql, params);
        const row = result.rows[0];
        return row === undefined ? undefined : (normaliseRow(row) as T);
      });
    },

    run(sql: string, ...params: Param[]): Promise<{ changes: number }> {
      return gate.statement(async () => {
        const result = await run(sql, params);
        return { changes: result.rowCount ?? 0 };
      });
    },

    exec(sql: string): Promise<void> {
      return gate.statement(async () => {
        // Several statements in one string, which needs a real session.
        if (active) {
          await active.query(sql, []);
          return;
        }
        const lease = await transport.lease();
        try {
          await lease.session.query(sql, []);
        } finally {
          lease.release();
        }
      });
    },

    transaction<T>(body: () => Promise<T>): Promise<T> {
      return gate.exclusive(async () => {
        const lease = await transport.lease();
        active = lease.session;
        try {
          await lease.session.query('BEGIN', []);
          try {
            const result = await body();
            await lease.session.query('COMMIT', []);
            return result;
          } catch (error) {
            // A rollback that itself fails must not replace the real error:
            // the reason the transaction failed is the one worth reporting.
            await lease.session.query('ROLLBACK', []).catch(() => undefined);
            throw error;
          }
        } finally {
          active = null;
          lease.release();
        }
      });
    },

    close: transport.close,
  };
}
