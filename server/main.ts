import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { handleRequest } from './api.ts';
import { createProvider } from './ai.ts';
import { openDatabase } from './db.ts';
import { isDatabaseUnavailable, RETRY_AFTER_SECONDS } from './driver.ts';
import { traceRequest, diagnose } from './diagnostics.ts';
import { authState } from './auth.ts';
import { resolveAuth } from './api.ts';
import {
  crossSiteRefusal,
  isLoopbackAddress,
  isLoopbackHost,
  SECURITY_HEADERS,
} from './security.ts';

/**
 * The SatzWerk server.
 *
 * In development Vite serves the app on 5173 and proxies /api here.
 * In production (`npm start`) this process also serves the built files from
 * ./dist, so the whole app is one command and one port.
 */

const PORT = Number(process.env.PORT ?? 8787);
/**
 * This machine only, unless HOST says otherwise.
 *
 * Listening on every interface put a passwordless app on the local network:
 * anyone on the same café or university Wi-Fi could read the learner's
 * progress, wipe it, or set a password and lock the owner out. HOST=0.0.0.0
 * opts in, for reaching the app from a phone; a request from another machine
 * then gets the password setup screen rather than the open app (see below).
 */
const HOST = process.env.HOST?.trim() || '127.0.0.1';
const DIST = resolve('dist');
const MAX_BODY_BYTES = 256 * 1024;

const db = await openDatabase();
const provider = createProvider();
/**
 * Read once at startup purely for the log line below.
 *
 * Every request resolves its own, because the password can be set or changed
 * while the process is running. Holding one resolved copy meant that after the
 * setup screen wrote a password, the server carried on believing there was
 * none — so nothing was ever protected and setup never completed.
 */
const startupAuth = await resolveAuth(db);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.mp3': 'audio/mpeg',
  '.map': 'application/json; charset=utf-8',
};

class BodyTooLarge extends Error {}

/**
 * The request's body, or a BodyTooLarge once it has all arrived.
 *
 * Past the limit the rest is read and thrown away rather than the socket
 * destroyed. A destroyed socket reaches the browser as a reset connection with
 * no status at all, which the outbox rightly reads as "offline" — so an
 * accidental paste of a few hundred kilobytes sat at the front of the queue
 * for good, with every later answer waiting behind it. Draining it means the
 * 413 below actually arrives, and a 4xx is a refusal the outbox reports and
 * moves past.
 */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    let size = 0;
    let chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) chunks = [];
      else chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) reject(new BodyTooLarge());
      else resolvePromise(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // Matches the hosted adapter, so a check behaves the same either side.
    'X-SatzWerk': 'api',
    ...headers,
  });
  res.end(payload);
}

/**
 * Whether the copy the browser already holds is this file. An ETag decides
 * when one was sent; the date only when none was (RFC 9110, 13.1.3).
 */
function unchanged(req: IncomingMessage, etag: string, modified: Date): boolean {
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch) {
    const opaque = (tag: string) => tag.trim().replace(/^W\//, '');
    return ifNoneMatch.split(',').some((tag) => tag.trim() === '*' || opaque(tag) === opaque(etag));
  }
  const since = Date.parse(req.headers['if-modified-since'] ?? '');
  // HTTP dates have whole seconds; the file's time has fractions.
  return Number.isFinite(since) && Math.floor(modified.getTime() / 1000) * 1000 <= since;
}

function serveStatic(req: IncomingMessage, res: ServerResponse, urlPath: string): void {
  if (!existsSync(DIST)) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No build found. Run "npm run build", or use "npm run dev" for development.');
    return;
  }

  // A path with broken percent-encoding (a mistyped /lesson/100%) cannot be
  // decoded, and the URIError used to end the whole process.
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  // Resolve inside dist only. normalize() strips any ".." traversal attempt.
  const requested = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST, requested);
  if (!filePath.startsWith(DIST)) filePath = DIST;

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // A removed bundle or recording is a missing file, not an app route.
    // Returning HTML with 200 let the worker cache it forever as JavaScript
    // or audio after a deployment.
    if (urlPath.startsWith('/assets/') || urlPath.startsWith('/audio/') || urlPath.startsWith('/illustrations/') ||
        /\.(?:js|css|json|png|jpg|webp|svg|ico|woff2|mp3|webmanifest|map)$/.test(urlPath)) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not found');
      return;
    }
    // Single-page app: unknown paths fall back to index.html.
    filePath = join(DIST, 'index.html');
  }
  if (!existsSync(filePath)) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const type = MIME[extname(filePath)] ?? 'application/octet-stream';
  const immutable = filePath.includes(`${join(DIST, 'assets')}`);
  /*
   * `no-cache` means "ask before using what you have", and asking needs
   * something to ask with. Without these the answer was always the whole
   * file: the half-megabyte illustration on Today came down again on every
   * app open. Size and modification time change with every build of a file.
   */
  const stats = statSync(filePath);
  const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  const headers = {
    ...SECURITY_HEADERS,
    'Content-Type': type,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    ETag: etag,
    'Last-Modified': stats.mtime.toUTCString(),
  };
  if (unchanged(req, etag, stats.mtime)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }
  res.writeHead(200, headers);
  // A file removed mid-read (a rebuild of dist, say) ends this response
  // rather than surfacing as an unhandled 'error' event.
  createReadStream(filePath)
    .on('error', () => res.destroy())
    .pipe(res);
}

/*
 * Nothing a request does may end the process. Every request goes through
 * handle(), and anything it throws that was not answered already becomes a
 * 500 here — the self-hosted server is one process for the app and the API,
 * so an uncaught rejection took both down until somebody restarted it.
 */
const server = createServer((req, res) => {
  void traceRequest(req.method ?? 'GET', async id => {
    res.setHeader('X-Request-Id', id);
    await handle(req, res);
  }, () => res.statusCode).catch(() => {
    if (!res.headersSent) sendJson(res, 500, { error: 'Internal error' });
    else res.destroy();
  });
});

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    serveStatic(req, res, url.pathname);
    return;
  }

  const header = (name: string): string | undefined => {
    const value = req.headers[name];
    return Array.isArray(value) ? value[0] : value;
  };
  const refusal = crossSiteRefusal(req.method ?? 'GET', url.pathname, {
    'content-type': header('content-type'),
    'x-requested-with': header('x-requested-with'),
    origin: header('origin'),
    referer: header('referer'),
    host: header('host'),
  });
  if (refusal) {
    // Drained, so the connection can be reused; the body itself is not read.
    req.resume();
    sendJson(res, refusal.status, { error: refusal.error });
    return;
  }

  try {
    let body: unknown;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      let raw: string;
      try {
        raw = await readBody(req);
      } catch (error) {
        if (!(error instanceof BodyTooLarge)) throw error;
        sendJson(res, 413, { error: `That is more than the server takes in one request (${MAX_BODY_BYTES / 1024} KB).` });
        return;
      }
      if (raw.length > 0) {
        try {
          body = JSON.parse(raw);
        } catch {
          sendJson(res, 400, { error: 'Request body is not valid JSON' });
          return;
        }
      }
    }

    const auth = await resolveAuth(db);
    /*
     * Open (no password, everyone signed in) only for this machine.
     *
     * Anything else is answered as a hosted app with no password yet: the
     * setup screen and no data. That covers another machine reaching an
     * explicit HOST=0.0.0.0, and a web page that has rebound its own name to
     * 127.0.0.1 — whose requests arrive from loopback but name that page as
     * their Host.
     */
    const local = isLoopbackAddress(req.socket.remoteAddress) && isLoopbackHost(header('host'));
    /*
     * But the setup screen must not be able to finish from there. Setup takes
     * the first password anybody sends, and a rebound page counts as same-origin
     * to the browser, so it can send the app's header too: it would choose the
     * password, lock the owner out on this machine, and then sign in with it.
     * With no password yet, the password is chosen here (Settings), and other
     * devices sign in with it afterwards.
     */
    if (
      !local &&
      authState(auth) === 'open' &&
      req.method === 'POST' &&
      url.pathname.replace(/\/+$/, '') === '/api/setup'
    ) {
      sendJson(res, 403, {
        error: 'Choose a password on the computer that runs SatzWerk first (Settings), then sign in here.',
      });
      return;
    }
    const response = await handleRequest(
      { db, provider, auth: local ? auth : { ...auth, hosted: true } },
      {
        method: req.method ?? 'GET',
        path: url.pathname,
        body,
        headers: {
          cookie: req.headers.cookie,
          'x-forwarded-proto': req.headers['x-forwarded-proto'] as string | undefined,
          // The reminder job carries a bearer token rather than a cookie.
          authorization: req.headers.authorization,
          'idempotency-key': header('idempotency-key'),
          // Which learner the tab is showing; see LEARNER_HEADER.
          'x-satzwerk-learner': header('x-satzwerk-learner'),
        },
        // The socket's own address. Forwarded headers are not trusted here:
        // anyone can send them to a server with no proxy in front of it.
        clientIp: req.socket.remoteAddress,
        // True when this process itself terminates TLS; otherwise the header
        // above is what a proxy in front of it says.
        ...(('encrypted' in req.socket && req.socket.encrypted) ? { secure: true } : {}),
      },
    );
    sendJson(res, response.status, response.body, response.headers ?? {});
  } catch (error) {
    diagnose(isDatabaseUnavailable(error) ? 'database_unavailable' : 'request_failed');
    if (isDatabaseUnavailable(error)) {
      // Held and sent again by the browser, where a 500 would be dropped.
      sendJson(
        res,
        503,
        { error: `The server cannot reach its database: ${(error as Error).message}` },
        { 'Retry-After': String(RETRY_AFTER_SECONDS) },
      );
      return;
    }
    sendJson(res, 500, { error: (error as Error).message });
  }
}

server.listen(PORT, HOST, () => {
  const mode = existsSync(DIST) ? 'serving ./dist' : 'API only (run the Vite dev server for the UI)';
  const shown = HOST === '127.0.0.1' ? 'localhost' : HOST.includes(':') ? `[${HOST}]` : HOST;
  console.log(`[satzwerk] listening on http://${shown}:${PORT} — ${mode}`);
  console.log(
    `[satzwerk] database: ${
      db.dialect === 'postgres' ? 'postgres (DATABASE_URL)' : (process.env.SATZWERK_DB ?? 'data/satzwerk.db')
    }`,
  );
  const state = authState(startupAuth);
  if (state === 'required') {
    console.log(
      `[satzwerk] password required (${startupAuth.passwordSource === 'env' ? 'from the environment' : 'set in the app'}).`,
    );
  } else if (state === 'setup') {
    console.log('[satzwerk] hosted with no password yet — serving only the setup screen.');
  } else {
    console.log(
      '[satzwerk] no password set — open on this machine only; choose one in Settings before other devices can sign in.',
    );
  }
  if (!provider.available) {
    console.log('[satzwerk] German Coach: rule-based checks only, no AI provider configured.');
  }
});

function shutdown(): void {
  server.close(() => {
    void db.close().finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
