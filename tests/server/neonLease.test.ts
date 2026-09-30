import { EventEmitter } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * A connection Neon's WebSocket pool has lent out, dropped mid-transaction.
 *
 * The pool stops listening to a client while it is checked out, so an 'error'
 * on it then had no listener, and Node treats that as uncaught: on a warm
 * Vercel instance the whole function died. The TCP path already listened to
 * its leased client; the Neon one did not. Section marks, final checks,
 * recovery rounds and completions all run as transactions, so this is the
 * path they take on Neon over HTTP.
 *
 * Neon itself cannot run here, so its module is replaced with a pool whose
 * clients are plain event emitters.
 */

const clients: FakeClient[] = [];

class FakeClient extends EventEmitter {
  released = false;
  async query(): Promise<{ rows: []; rowCount: number }> {
    return { rows: [], rowCount: 0 };
  }
  release(): void {
    this.released = true;
  }
}

vi.mock('@neondatabase/serverless', () => {
  class Pool extends EventEmitter {
    async connect(): Promise<FakeClient> {
      const client = new FakeClient();
      clients.push(client);
      return client;
    }
    async end(): Promise<void> {}
  }
  return {
    neonConfig: {},
    neon: () => ({ query: async () => ({ rows: [], rowCount: 0 }) }),
    Pool,
  };
});

const { openPostgres } = await import('../../server/driver-postgres.ts');

describe('a Neon connection dropped while a transaction holds it', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    clients.length = 0;
  });

  it('is reported, not thrown, and the listener goes when the client is returned', async () => {
    vi.stubEnv('SATZWERK_PG_TRANSPORT', 'http');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const db = await openPostgres('postgresql://user:pw@ep-x.eu-central-1.aws.neon.tech/db');
    await db.transaction(async () => {
      const [client] = clients;
      // With no listener, emit() throws the error straight back at the caller.
      expect(() => client!.emit('error', new Error('Connection terminated unexpectedly'))).not.toThrow();
    });
    const [client] = clients;
    expect(client!.released).toBe(true);
    // Back in the pool, the pool's own listener is the one that should hear it.
    expect(client!.listenerCount('error')).toBe(0);
    await db.close();
  });
});
