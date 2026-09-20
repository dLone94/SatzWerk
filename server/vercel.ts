import type { IncomingMessage, ServerResponse } from 'node:http';
import { createProvider } from './ai.ts';
import { handleRequest, healthReport, resolveAuth } from './api.ts';
import { openDatabase, type Db } from './db.ts';

/**
 * The whole API as one Vercel function.
 *
 * This lives in `server/` rather than `api/` deliberately. The files in `api/`
 * are routes, and their *names* decide which URLs reach them — a decision the
 * platform makes, not this code. Keeping the implementation outside that
 * directory means the entrypoints there can be two lines each, and which URLs
 * they answer is a separate question from what they do.
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
  /**
   * Carried because the scheduled reminder job authenticates with it and has
   * no cookie to offer. Dropping it here was not a missing feature but a dead
   * one: the endpoint answered every cron with 401.
   */
  authorization?: string;
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
      cached = undefined;
      console.error('[satzwerk] database unavailable:', error);
      return reply(503, { error: explain(error as Error) });
    }

    provider ??= createProvider();
    const response = await handleRequest(
      { db, provider, auth: await resolveAuth(db) },
      {
        method: request.method,
        path: request.path,
        body,
        headers: {
          cookie: request.cookie,
          'x-forwarded-proto': request.forwardedProto,
          authorization: request.authorization,
        },
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

/**
 * Why the database could not be opened, in one sentence a person can act on.
 *
 * A misconfigured deployment already knows what is wrong and says so — that
 * message names DATABASE_URL and what to do about it. Wrapping guidance around
 * guidance produced a paragraph that said "Preview and Production are
 * separate" twice, which reads like a machine and buries the one useful line.
 *
 * So the advice is added only where it is missing: to the driver's own
 * failures, which are accurate about what happened ("connection timeout") and
 * silent about what to do.
 */
function explain(error: Error): string {
  const message = error.message.replace(/\s*\.?\s*$/, '.');
  if (/DATABASE_URL/.test(message)) return message;
  return `The server cannot reach its database: ${message} Check that DATABASE_URL is correct for this deployment — Preview and Production are set separately — and that the database is awake and accepting connections. /api/health answers without the database.`;
}

function reply(status: number, body: unknown): Answer {
  return { status, body, headers: {} };
}

/**
 * `x-satzwerk` is a signature, and it exists because "is the body JSON?" turned
 * out not to answer the question it was standing in for.
 *
 * A hosting platform's own responses can be JSON too — an access-control
 * refusal especially — so a JSON answer does not prove the request reached
 * this app. Two smoke probes passed on that reasoning while the deployment was
 * serving a login page. Only this code sets this header, so a response
 * carrying it came from here and nothing else can claim otherwise.
 */
const BASE_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-satzwerk': 'api',
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

/**
 * The path this request is really about.
 *
 * A rewrite sends `/api/anything` to one function, and a rewritten request
 * does not necessarily arrive carrying the URL the browser asked for. So the
 * rewrite passes the original path along in `__path`, and it wins when it is
 * there. Without a rewrite in play the parameter is absent and the URL is used
 * as it stands, which is the local case and every test.
 *
 * Only a value that looks like one of our own API paths is honoured, so a
 * crafted `?__path=` cannot point the router somewhere it would not otherwise
 * go.
 */
function requestedPath(url: URL): string {
  const override = url.searchParams.get('__path');
  if (override && /^\/api(\/|$)/.test(override) && !override.includes('..')) return override;
  return url.pathname;
}

async function fromWeb(request: Request): Promise<Incoming> {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  return {
    method,
    path: requestedPath(url),
    // Vercel serves over HTTPS, and the request URL says so directly.
    secure: url.protocol === 'https:',
    cookie: request.headers.get('cookie') ?? undefined,
    forwardedProto: request.headers.get('x-forwarded-proto') ?? undefined,
    authorization: request.headers.get('authorization') ?? undefined,
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
    path: requestedPath(new URL(request.url ?? '/', 'http://localhost')),
    secure: (forwardedProto ?? '').split(',')[0]?.trim().toLowerCase() === 'https',
    cookie: header('cookie'),
    forwardedProto,
    authorization: header('authorization'),
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
