import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * The self-hosted server, run as `npm start` runs it: its own process, serving
 * a built app from ./dist beside the API.
 *
 * One GET with broken percent-encoding outside /api — a mistyped link such as
 * /lesson/100% is enough — used to throw inside the request handler, outside
 * the only try/catch, and Node ended the process. No password was needed, and
 * the app and the API stayed down until somebody restarted it.
 */

const MAIN = resolve('server/main.ts');

function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const probe = createServer();
    probe.once('error', fail);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      probe.close(() => done(port));
    });
  });
}

describe('the self-hosted server', () => {
  let dir: string;
  let child: ChildProcess;
  let base: string;
  let output = '';

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), 'satzwerk-main-'));
    mkdirSync(join(dir, 'dist'));
    writeFileSync(join(dir, 'dist', 'index.html'), '<!doctype html><title>SatzWerk</title>');
    const port = await freePort();
    base = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, [MAIN], {
      cwd: dir,
      env: { ...process.env, PORT: String(port), SATZWERK_DB: join(dir, 'app.db'), DATABASE_URL: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout!.on('data', (chunk: Buffer) => (output += chunk.toString()));
    child.stderr!.on('data', (chunk: Buffer) => (output += chunk.toString()));
    await new Promise<void>((done, fail) => {
      const timer = setTimeout(() => fail(new Error(`server did not start:\n${output}`)), 15_000);
      child.stdout!.on('data', () => {
        if (output.includes('listening on')) {
          clearTimeout(timer);
          done();
        }
      });
      child.once('exit', (code) => {
        clearTimeout(timer);
        fail(new Error(`server exited with ${code}:\n${output}`));
      });
    });
  }, 20_000);

  afterAll(() => {
    child?.kill();
    rmSync(dir, { recursive: true, force: true });
  });

  it('answers 400 to a path with broken percent-encoding, and keeps running', async () => {
    for (const path of ['/%E0%A4%A', '/lesson/100%']) {
      const response = await fetch(`${base}${path}`);
      expect(response.status, path).toBe(400);
    }
    expect(child.exitCode).toBeNull();
    const health = await fetch(`${base}/api/health`);
    expect(health.status).toBe(200);
  });

  it('still serves the app for an ordinary path', async () => {
    const response = await fetch(`${base}/lesson/pre-a1-u1-l1`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('SatzWerk');
  });

  it('does not serve or cache HTML as a missing asset', async () => {
    for (const path of ['/assets/old-build.js', '/audio/de/missing.mp3', '/missing.css', '/sw.js',
      '/assets/missing.woff2', '/asset-manifest.json', '/illustrations/missing.webp', '/missing.webp']) {
      const response = await fetch(`${base}${path}`);
      expect(response.status, path).toBe(404);
      expect(response.headers.get('content-type')).toContain('text/plain');
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
  });

  it('forwards retry IDs to the API instead of duplicating HTTP writes', async () => {
    const send = () => fetch(`${base}/api/study`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-requested-with': 'SatzWerk', 'idempotency-key': 'http-study' },
      body: JSON.stringify({ seconds: 20 }),
    });
    const first = await (await send()).json();
    expect(await (await send()).json()).toEqual(first);
    expect(first.stats.totalStudySeconds).toBe(20);
  });
});
