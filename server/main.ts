import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { handleRequest } from './api.ts';
import { createProvider } from './ai.ts';
import { openDatabase } from './db.ts';
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
    ...SECURITY_HEADERS,
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
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No build found. Run "npm run build", or use "npm run dev" for development.');
    return;
  }

  // Resolve inside dist only. normalize() strips any ".." traversal attempt.
  const requested = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(DIST, requested);
  if (!filePath.startsWith(DIST)) filePath = DIST;

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
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
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': type,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return;
    }
    serveStatic(res, url.pathname);
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
    console.error('[satzwerk] request failed:', error);
    sendJson(res, 500, { error: (error as Error).message });
  }
});

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
