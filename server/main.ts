import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { handleRequest } from './api.ts';
import { createProvider } from './ai.ts';
import { openDatabase } from './db.ts';
import { isDatabaseUnavailable, RETRY_AFTER_SECONDS } from './driver.ts';
import { authState } from './auth.ts';
import { resolveAuth } from './api.ts';

/**
 * The SatzWerk server.
 *
 * In development Vite serves the app on 5173 and proxies /api here.
 * In production (`npm start`) this process also serves the built files from
 * ./dist, so the whole app is one command and one port.
 */

const PORT = Number(process.env.PORT ?? 8787);
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
  '.mp3': 'audio/mpeg',
  '.map': 'application/json; charset=utf-8',
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolvePromise(Buffer.concat(chunks).toString('utf8')));
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
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // Matches the hosted adapter, so a check behaves the same either side.
    'X-SatzWerk': 'api',
    ...headers,
  });
  res.end(payload);
}

function serveStatic(res: ServerResponse, urlPath: string): void {
  if (!existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No build found. Run "npm run build", or use "npm run dev" for development.');
    return;
  }

  // A path with broken percent-encoding (a mistyped /lesson/100%) cannot be
  // decoded, and the URIError used to end the whole process.
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  // Resolve inside dist only. normalize() strips any ".." traversal attempt.
  const requested = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST, requested);
  if (!filePath.startsWith(DIST)) filePath = DIST;

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // Single-page app: unknown paths fall back to index.html.
    filePath = join(DIST, 'index.html');
  }
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const type = MIME[extname(filePath)] ?? 'application/octet-stream';
  const immutable = filePath.includes(`${join(DIST, 'assets')}`);
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
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
  handle(req, res).catch((error: unknown) => {
    console.error('[satzwerk] request failed:', error);
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
    serveStatic(res, url.pathname);
    return;
  }

  try {
    let body: unknown;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const raw = await readBody(req);
      if (raw.length > 0) {
        try {
          body = JSON.parse(raw);
        } catch {
          sendJson(res, 400, { error: 'Request body is not valid JSON' });
          return;
        }
      }
    }

    const response = await handleRequest(
      { db, provider, auth: await resolveAuth(db) },
      {
        method: req.method ?? 'GET',
        path: url.pathname,
        body,
        headers: {
          cookie: req.headers.cookie,
          'x-forwarded-proto': req.headers['x-forwarded-proto'] as string | undefined,
          // The reminder job carries a bearer token rather than a cookie.
          authorization: req.headers.authorization,
        },
        // True when this process itself terminates TLS; otherwise the header
        // above is what a proxy in front of it says.
        ...(('encrypted' in req.socket && req.socket.encrypted) ? { secure: true } : {}),
      },
    );
    sendJson(res, response.status, response.body, response.headers ?? {});
  } catch (error) {
    console.error('[satzwerk] request failed:', error);
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

server.listen(PORT, () => {
  const mode = existsSync(DIST) ? 'serving ./dist' : 'API only (run the Vite dev server for the UI)';
  console.log(`[satzwerk] listening on http://localhost:${PORT} — ${mode}`);
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
    console.log('[satzwerk] no password set — fine on localhost, setup screen if hosted.');
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
