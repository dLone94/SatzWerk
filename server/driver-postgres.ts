import { normaliseRow, toPositional, type Db, type Param, type Row } from './driver.ts';

/**
 * The Postgres driver: what runs on Vercel.
 *
 * A serverless function has no persistent disk, so the SQLite file the app
 * uses locally would be recreated empty on every cold start. Progress is the
 * one thing this app must not lose, so hosted deployments talk to Postgres
 * instead.
 *
 * `@neondatabase/serverless` is used rather than `pg` because it speaks
 * Postgres over HTTP and WebSocket. A serverless function cannot hold a
 * connection pool between invocations, and a pooled client would exhaust the
 * database's connection limit under even light traffic.
 *
 * SQL arrives in SQLite's `?` placeholder style and is rewritten here.
 */

type SqlClient = {
  query: (sql: string, params: unknown[]) => Promise<{ rows: Row[]; rowCount: number | null }>;
};

export async function openPostgres(url: string): Promise<Db> {
  const { neon, neonConfig } = await import('@neondatabase/serverless');
  // Cache the connection negotiation across queries within one invocation.
  neonConfig.fetchConnectionCache = true;

  const sql = neon(url, { fullResults: true }) as unknown as SqlClient;

  // A transaction has to run on one session, and each `neon()` call over HTTP
  // is its own. Transactions therefore go through a pooled client, created only
  // when one is needed.
  let pooled: { client: SqlClient; end: () => Promise<void> } | null = null;
  const pooledClient = async () => {
    if (!pooled) {
      const { Pool } = await import('@neondatabase/serverless');
      const pool = new Pool({ connectionString: url });
      pooled = {
        client: pool as unknown as SqlClient,
        end: () => pool.end(),
      };
    }
    return pooled.client;
  };

  let active: SqlClient | null = null;
  const client = async (): Promise<SqlClient> => active ?? sql;

  const query = async (text: string, params: Param[]) => {
    const target = await client();
    return target.query(toPositional(text), params);
  };

  return {
    dialect: 'postgres',

    async all<T = Row>(text: string, ...params: Param[]): Promise<T[]> {
      const result = await query(text, params);
      return result.rows.map((row) => normaliseRow(row)) as T[];
    },

    async get<T = Row>(text: string, ...params: Param[]): Promise<T | undefined> {
      const result = await query(text, params);
      const row = result.rows[0];
      return row === undefined ? undefined : (normaliseRow(row) as T);
    },

    async run(text: string, ...params: Param[]): Promise<{ changes: number }> {
      const result = await query(text, params);
      return { changes: result.rowCount ?? 0 };
    },

    async exec(text: string): Promise<void> {
      // DDL comes as several statements in one string, which the HTTP endpoint
      // will not take, so it runs on the pooled client where multi-statement
      // SQL is allowed.
      const target = active ?? (await pooledClient());
      await target.query(text, []);
    },

    async transaction<T>(body: () => Promise<T>): Promise<T> {
      if (active) throw new Error('transaction() cannot be nested');
      const target = await pooledClient();
      active = target;
      await target.query('BEGIN', []);
      try {
        const result = await body();
        await target.query('COMMIT', []);
        return result;
      } catch (error) {
        await target.query('ROLLBACK', []);
        throw error;
      } finally {
        active = null;
      }
    },

    async close(): Promise<void> {
      if (pooled) {
        await pooled.end();
        pooled = null;
      }
    },
  };
}
