import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { handleRequest } from './api.ts';
import { createProvider } from './ai.ts';
import { openDatabase } from './db.ts';

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

const db = openDatabase();
const provider = createProvider();

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

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function serveStatic(res: ServerResponse, urlPath: string): void {
  if (!existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
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
      { db, provider },
      { method: req.method ?? 'GET', path: url.pathname, body },
    );
    sendJson(res, response.status, response.body);
  } catch (error) {
    console.error('[satzwerk] request failed:', error);
    sendJson(res, 500, { error: (error as Error).message });
  }
});

server.listen(PORT, () => {
  const mode = existsSync(DIST) ? 'serving ./dist' : 'API only (run the Vite dev server for the UI)';
  console.log(`[satzwerk] listening on http://localhost:${PORT} — ${mode}`);
  console.log(`[satzwerk] database: ${process.env.SATZWERK_DB ?? 'data/satzwerk.db'}`);
  if (!provider.available) {
    console.log('[satzwerk] German Coach: rule-based checks only, no AI provider configured.');
  }
});

function shutdown(): void {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
