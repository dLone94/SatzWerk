import { createProvider } from '../server/ai.ts';
import { handleRequest, resolveAuth } from '../server/api.ts';
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

export const config = { runtime: 'nodejs' };

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

    const db = await database();
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
