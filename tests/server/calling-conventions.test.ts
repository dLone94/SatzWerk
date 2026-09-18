import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Both ways a platform can call the function.
 *
 * A Node function on Vercel is invoked either with a Web `Request`, expecting
 * a `Response` back, or with Node's `(req, res)` pair, expecting the answer to
 * be written to `res`. Which one arrives is the platform's choice.
 *
 * Getting this wrong fails in the least debuggable way there is. The handler
 * runs, does its work, returns a good `Response` — and if the platform was
 * waiting on `res`, nothing is ever sent. No error, no crash, no log: the
 * browser simply waits until it gives up, which is exactly what a hosted
 * SatzWerk did while every test here passed.
 *
 * So both conventions are tested, and neither is allowed to be the one that
 * only works by luck.
 */

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'satzwerk-calling-'));
  process.env.SATZWERK_DB = join(dir, 'fn.db');
  delete process.env.VERCEL;
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.SATZWERK_DB;
});

async function loadHandler(file: string) {
  vi.resetModules();
  const mod = (await import(file)) as {
    default: (request: unknown, response?: unknown) => Promise<Response | void> | Response | void;
  };
  return mod.default;
}

/** Enough of IncomingMessage for the adapter, and a readable body. */
function nodeRequest(method: string, url: string, body?: string) {
  const request = new EventEmitter() as EventEmitter & {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
  request.method = method;
  request.url = url;
  request.headers = { host: 'satzwerk.test' };
  if (body !== undefined) {
    // Emitted once something is listening, as a real stream would.
    queueMicrotask(() => {
      request.emit('data', Buffer.from(body));
      request.emit('end');
    });
  }
  return request;
}

/** Enough of ServerResponse to record what was written. */
function nodeResponse() {
  const written: { status?: number; headers?: Record<string, string>; body?: string } = {};
  return {
    written,
    setHeader: () => undefined,
    writeHead: (status: number, headers: Record<string, string>) => {
      written.status = status;
      written.headers = headers;
    },
    end: (body: string) => {
      written.body = body;
    },
  };
}

describe('the API function', () => {
  const file = '../../api/[[...path]].ts';

  it('answers a Web Request with a Response', async () => {
    const handler = await loadHandler(file);
    const result = (await handler(new Request('https://satzwerk.test/api/health'))) as Response;
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toMatchObject({ ok: true });
  });

  it('answers a Node request by writing to the response', async () => {
    const handler = await loadHandler(file);
    const response = nodeResponse();
    const returned = await handler(nodeRequest('GET', '/api/health'), response);

    // Nothing is returned: the answer went to `res`, which is the whole point.
    expect(returned).toBeUndefined();
    expect(response.written.status).toBe(200);
    expect(response.written.headers?.['content-type']).toContain('application/json');
    expect(JSON.parse(response.written.body ?? '{}')).toMatchObject({ ok: true });
  });

  it('reads a Node request body from the stream', async () => {
    const handler = await loadHandler(file);
    const response = nodeResponse();
    await handler(
      nodeRequest('PUT', '/api/profile', JSON.stringify({ teachingLanguage: 'bg', onboarded: true })),
      response,
    );
    expect(response.written.status).toBe(200);

    // And it really was stored, not merely accepted.
    const state = (await handler(new Request('https://satzwerk.test/api/state'))) as Response;
    await expect(state.json()).resolves.toMatchObject({ profile: { teachingLanguage: 'bg' } });
  });

  it('reads a Node request body the platform already parsed', async () => {
    const handler = await loadHandler(file);
    const response = nodeResponse();
    const request = nodeRequest('PUT', '/api/profile');
    (request as unknown as { body: unknown }).body = { teachingLanguage: 'bg', onboarded: true };
    await handler(request, response);
    expect(response.written.status).toBe(200);
  });

  it('still reports a malformed body rather than hanging', async () => {
    const handler = await loadHandler(file);
    const response = nodeResponse();
    await handler(nodeRequest('POST', '/api/attempts', '{not json'), response);
    expect(response.written.status).toBe(400);
  });
});

describe('the standalone health function', () => {
  const file = '../../api/health.ts';

  it('answers a Web Request', async () => {
    const handler = await loadHandler(file);
    const result = (await handler(new Request('https://satzwerk.test/api/health'))) as Response;
    expect(result.status).toBe(200);
    await expect(result.json()).resolves.toMatchObject({ ok: true, node: process.version });
  });

  it('answers a Node request', async () => {
    const handler = await loadHandler(file);
    const response = nodeResponse();
    await handler(nodeRequest('GET', '/api/health'), response);
    expect(response.written.status).toBe(200);
    expect(JSON.parse(response.written.body ?? '{}')).toMatchObject({ ok: true });
  });

  it('reports the shape of the configuration, never its contents', async () => {
    process.env.VERCEL = '1';
    process.env.VERCEL_ENV = 'preview';
    process.env.DATABASE_URL = 'postgresql://someone:hunter2@db.example.com/satzwerk';
    try {
      const handler = await loadHandler(file);
      const result = (await handler(new Request('https://satzwerk.test/api/health'))) as Response;
      const text = await result.text();
      expect(JSON.parse(text)).toMatchObject({
        platform: 'vercel:preview',
        databaseUrl: 'set',
      });
      // The value itself must never appear: this URL needs no password.
      expect(text).not.toContain('hunter2');
      expect(text).not.toContain('db.example.com');
    } finally {
      delete process.env.VERCEL_ENV;
      delete process.env.DATABASE_URL;
    }
  });

  it('imports nothing at all, so nothing it depends on can fail', () => {
    const source = readFileSync(new URL('../../api/health.ts', import.meta.url), 'utf8');
    // Not even a type import: this file's value is that it has no graph.
    expect(source).not.toMatch(/^\s*import\s/m);
  });
});


describe('what the health probe is allowed to say', () => {
  const file = '../../api/health.ts';

  /**
   * The probe reports every variable that looks database-shaped, which is the
   * point of it — an unexpected name is exactly what it exists to reveal. So
   * these tests cannot assert an exact list against the real environment,
   * which may hold TEST_DATABASE_URL or anything else the machine has. They
   * assert what it must contain and what it must never leak.
   */
  it('lists the names of database variables it can see, never their values', async () => {
    process.env.POSTGRES_URL = 'postgresql://someone:hunter2@db.example.com/satzwerk';
    process.env.PGHOST = 'db.example.com';
    process.env.SATZWERK_PASSWORD_HASH = 'scrypt$abc$def';
    try {
      const handler = await loadHandler(file);
      const result = (await handler(new Request('https://satzwerk.test/api/health'))) as Response;
      const text = await result.text();
      const payload = JSON.parse(text) as { databaseVariables: string[]; passwordHash: string };

      expect(payload.databaseVariables).toContain('POSTGRES_URL');
      expect(payload.databaseVariables).toContain('PGHOST');
      // Sorted, so the same deployment always reads the same way.
      expect(payload.databaseVariables).toEqual([...payload.databaseVariables].sort());
      expect(payload.passwordHash).toBe('set');

      // The reason this endpoint can be public: it reports that a thing
      // exists, never what it contains.
      for (const secret of ['hunter2', 'db.example.com', 'scrypt$abc$def']) {
        expect(text).not.toContain(secret);
      }
    } finally {
      delete process.env.POSTGRES_URL;
      delete process.env.PGHOST;
      delete process.env.SATZWERK_PASSWORD_HASH;
    }
  });

  it('ignores a variable that exists but is empty, which is how a half-saved setting looks', async () => {
    process.env.DATABASE_URL = '   ';
    try {
      const handler = await loadHandler(file);
      const result = (await handler(new Request('https://satzwerk.test/api/health'))) as Response;
      const payload = (await result.json()) as { databaseVariables: string[]; databaseUrl: string };
      expect(payload.databaseVariables).not.toContain('DATABASE_URL');
      // And called what it is. "set" would be a lie and "missing" would send
      // someone to add a variable that is already there.
      expect(payload.databaseUrl).toBe('blank');
    } finally {
      delete process.env.DATABASE_URL;
    }
  });
});
