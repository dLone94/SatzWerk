import type { IncomingMessage, ServerResponse } from 'node:http';
import { createProvider } from '../server/ai.ts';
import { handleRequest, healthReport, resolveAuth } from '../server/api.ts';
import { openDatabase, type Db } from '../server/db.ts';

/**
 * The whole API as one Vercel function.
 *
 * `server/api.ts` is already a pure function of (method, path, body), so there
 * is nothing to re-route here: this file is the adapter between the platform's
 * idea of a request and that function, and nothing else. The same router is
 * what `server/main.ts` serves locally and what the tests exercise directly,
 * so there is one API rather than two that can drift.
 *
 * ## Why this answers to two different calling conventions
 *
 * A Node function on Vercel may be invoked either with a Web `Request` (and
 * expected to return a `Response`) or with Node's `(req, res)` pair (and
 * expected to write to `res`). Which one you get is decided by the platform,
 * not by you. Guess wrong and the failure is silent in the worst way: the
 * handler runs, does its work, returns a perfectly good `Response` — and
 * nobody ever sends it, so the browser waits until it gives up. No error, no
 * log, nothing to read.
 *
 * So this handler does not guess. It accepts both shapes, answers in whichever
 * one it was given, and the router underneath never learns the difference.
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

/**
 * Created on first use rather than at module scope. Anything that runs while
 * the module is loading turns a fault into a platform crash page, which the
 * client cannot parse and which says nothing about what went wrong.
 */
let provider: ReturnType<typeof createProvider> | undefined;

/**
 * `maxDuration` matters more than it looks. The platform default is short, and
 * the database timeouts below have to fire *inside* it — otherwise the
 * function is killed mid-connect and the caller gets a platform error page or
 * nothing at all, instead of a sentence saying what failed. It is set in
 * `vercel.json` as well, which is the setting the platform certainly reads.
 */
export const config = { maxDuration: 30 };

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

interface Answer {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

interface Incoming {
  method: string;
  path: string;
  secure: boolean;
  cookie?: string;
  forwardedProto?: string;
  /** The raw body, already read. Empty for GET and HEAD. */
  text: string;
}

/**
 * The actual work: one request in, one answer out, with no knowledge of how it
 * arrived or how it will be sent.
 */
async function answer(request: Incoming): Promise<Answer> {
  try {
    let body: unknown;
    if (request.text.length > 0) {
      try {
        body = JSON.parse(request.text);
      } catch {
        return reply(400, { error: 'Request body is not valid JSON' });
      }
    }

    // Answered before the database is touched, and deliberately so. When the
    // app hangs, this is the URL that says whether the function itself is
    // alive — a health check that needs the database cannot tell you that.
    if (request.method === 'GET' && request.path.replace(/\/+$/, '') === '/api/health') {
      return reply(200, healthReport());
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
      return reply(503, {
        error: `The server cannot reach its database: ${reason} Check that DATABASE_URL is set for this deployment — Preview and Production are separate — and that the database is awake and accepting connections. /api/health answers without the database.`,
      });
    }

    provider ??= createProvider();
    const response = await handleRequest(
      { db, provider, auth: await resolveAuth(db) },
      {
        method: request.method,
        path: request.path,
        body,
        headers: { cookie: request.cookie, 'x-forwarded-proto': request.forwardedProto },
        secure: request.secure,
      },
    );
    return { status: response.status, body: response.body, headers: response.headers ?? {} };
  } catch (error) {
    // A failed open would otherwise be cached as a rejected promise and every
    // later request would fail with it, including after the fault is fixed.
    cached = undefined;
    console.error('[satzwerk] request failed:', error);
    return reply(500, { error: (error as Error).message });
  }
}

function reply(status: number, body: unknown): Answer {
  return { status, body, headers: {} };
}

const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

/* ------------------------------------------------------------------ *
 * The two calling conventions
 * ------------------------------------------------------------------ */

function isNodeResponse(value: unknown): value is ServerResponse {
  return typeof (value as ServerResponse | undefined)?.setHeader === 'function';
}

function isWebRequest(value: unknown): value is Request {
  // A Web Request has an absolute url and Headers; IncomingMessage has neither.
  const candidate = value as Request | undefined;
  return typeof candidate?.url === 'string' && typeof candidate.headers?.get === 'function';
}

async function fromWeb(request: Request): Promise<Incoming> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  return {
    method,
    path: url.pathname,
    // Vercel serves over HTTPS, and the request URL says so directly.
    secure: url.protocol === 'https:',
    cookie: request.headers.get('cookie') ?? undefined,
    forwardedProto: request.headers.get('x-forwarded-proto') ?? undefined,
    text: method === 'GET' || method === 'HEAD' ? '' : await request.text(),
  };
}

async function fromNode(request: IncomingMessage): Promise<Incoming> {
  const method = (request.method ?? 'GET').toUpperCase();
  const header = (name: string): string | undefined => {
    const value = request.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const forwardedProto = header('x-forwarded-proto');
  // The platform parses JSON bodies onto `req.body` before calling a Node
  // handler; when it has not, the stream is still there to read.
  const parsed = (request as IncomingMessage & { body?: unknown }).body;
  let text = '';
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof parsed === 'string') text = parsed;
    else if (parsed !== undefined && parsed !== null) text = JSON.stringify(parsed);
    else text = await readStream(request);
  }
  return {
    method,
    path: new URL(request.url ?? '/', 'http://localhost').pathname,
    secure: (forwardedProto ?? '').split(',')[0]?.trim().toLowerCase() === 'https',
    cookie: header('cookie'),
    forwardedProto,
    text,
  };
}

function readStream(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

/**
 * Both shapes, one handler.
 *
 * Declaring two parameters is deliberate: a platform that chooses by arity
 * sees a Node handler and gets one, and a platform that hands over a Web
 * `Request` gets a `Response` back. Neither can leave the caller waiting.
 */
export default async function handler(
  request: Request | IncomingMessage,
  response?: ServerResponse,
): Promise<Response | void> {
  const incoming = isWebRequest(request)
    ? await fromWeb(request)
    : await fromNode(request as IncomingMessage);
  const result = await answer(incoming);

  if (isNodeResponse(response)) {
    response.writeHead(result.status, { ...BASE_HEADERS, ...result.headers });
    response.end(JSON.stringify(result.body));
    return;
  }

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { ...BASE_HEADERS, ...result.headers },
  });
}
