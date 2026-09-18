import { createProvider } from '../server/ai.ts';
import { handleRequest, healthReport, resolveAuth } from '../server/api.ts';
import { openDatabase, type Db } from '../server/db.ts';

/**
 * The whole API as one Vercel function.
 *
 * `server/api.ts` is already a pure function of (method, path, body), so there
 * is nothing to re-route here: this file is the adapter between Vercel's
 * Request/Response and that function, and nothing else. The same router is
 * what `server/main.ts` serves locally and what the tests exercise directly,
 * so there is one API rather than two that can drift.
 *
 * The database handle is cached across invocations. A warm function reuses it;
 * a cold start opens it once and runs any pending migrations.
 */

let cached: Promise<Db> | undefined;

function database(): Promise<Db> {
  // Assigned before awaiting, so two concurrent cold requests share one open
  // rather than racing to migrate the same database twice.
  cached ??= openDatabase();
  return cached;
}

const provider = createProvider();

/**
 * `maxDuration` matters more than it looks. The platform default is short, and
 * the database timeouts below have to fire *inside* it — otherwise the
 * function is killed mid-connect and the caller gets a platform error page or
 * nothing at all, instead of a sentence saying what failed.
 */
export const config = { runtime: 'nodejs', maxDuration: 30 };

/** Opening the database must not outlast the function. */
const DB_OPEN_TIMEOUT_MS = 12_000;

function withTimeout<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `${what} did not finish within ${ms / 1000} seconds. The database is unreachable from this deployment — check that DATABASE_URL is set for this environment and that the database accepts connections.`,
            ),
          ),
        ms,
      ).unref?.(),
    ),
  ]);
}

export default async function handler(request: Request): Promise<Response> {
  // Everything is inside the try, including reading the body. Anything that
  // escapes this function is reported by the platform as a generic crash page,
  // which the client then cannot parse — so nothing is left outside it.
  try {
    const url = new URL(request.url);

    let body: unknown;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const text = await request.text();
      if (text.length > 0) {
        try {
          body = JSON.parse(text);
        } catch {
          return json(400, { error: 'Request body is not valid JSON' });
        }
      }
    }

    // Answered before the database is touched, and deliberately so. When the
    // app hangs, this is the URL that says whether the function itself is
    // alive — a health check that needs the database cannot tell you that.
    if (request.method === 'GET' && url.pathname.replace(/\/+$/, '') === '/api/health') {
      return json(200, healthReport());
    }

    let db: Db;
    try {
      db = await withTimeout(database(), DB_OPEN_TIMEOUT_MS, 'Opening the database');
    } catch (error) {
      // The driver's own words are accurate but say nothing about what to do.
      // This is the single most likely thing to be wrong with a fresh
      // deployment, so the answer names the setting that fixes it.
      cached = undefined;
      console.error('[satzwerk] database unavailable:', error);
      const reason = (error as Error).message.replace(/\s*\.?\s*$/, '.');
      return json(503, {
        error: `The server cannot reach its database: ${reason} Check that DATABASE_URL is set for this deployment — Preview and Production are separate — and that the database is awake and accepting connections. /api/health answers without the database.`,
      });
    }

    const response = await handleRequest(
      { db, provider, auth: await resolveAuth(db) },
      {
        method: request.method,
        path: url.pathname,
        body,
        headers: {
          cookie: request.headers.get('cookie') ?? undefined,
          'x-forwarded-proto': request.headers.get('x-forwarded-proto') ?? undefined,
        },
        // Vercel serves over HTTPS, and the request URL says so directly.
        secure: url.protocol === 'https:',
      },
    );
    return json(response.status, response.body, response.headers);
  } catch (error) {
    // A failed open would otherwise be cached as a rejected promise and every
    // later request would fail with it, including after the fault is fixed.
    cached = undefined;
    console.error('[satzwerk] request failed:', error);
    return json(500, { error: (error as Error).message });
  }
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });
}
