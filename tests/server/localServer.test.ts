import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * The real local server, started the way `npm start` starts it.
 *
 * With no password the app is 'open': every request counts as signed in. That
 * is only safe while nobody but the person at this machine can send one, and
 * two things broke it. The server listened on every network interface, so
 * anyone on the same Wi-Fi could read, wipe or password-lock the learner's
 * data. And it accepted a `text/plain` POST from any web page, so a site the
 * learner merely visited could do the same with an ordinary HTML form.
 */

let dir: string;
let child: ChildProcess;
let port: number;

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => resolve(typeof address === 'object' && address ? address.port : 0));
    });
  });
}

/** An address of this machine that is not loopback, if it has one. */
function lanAddress(): string | undefined {
  for (const list of Object.values(networkInterfaces())) {
    for (const entry of list ?? []) {
      if (entry.family === 'IPv4' && !entry.internal) return entry.address;
    }
  }
  return undefined;
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'satzwerk-local-'));
  port = await freePort();
  const env: NodeJS.ProcessEnv = { ...process.env, SATZWERK_DB: join(dir, 'app.db'), PORT: String(port) };
  for (const name of ['HOST', 'VERCEL', 'DATABASE_URL', 'POSTGRES_URL', 'SATZWERK_PASSWORD_HASH', 'SATZWERK_SESSION_SECRET']) {
    delete env[name];
  }
  child = spawn(process.execPath, ['server/main.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not start')), 15_000);
    child.stdout!.on('data', (chunk: Buffer) => {
      if (chunk.toString().includes('listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once('exit', (code) => reject(new Error(`server exited with ${code}`)));
  });
}, 20_000);

afterAll(() => {
  child?.kill();
  rmSync(dir, { recursive: true, force: true });
});

const local = (path: string) => `http://127.0.0.1:${port}${path}`;

describe('the local server', () => {
  it('cannot be reached from another machine unless HOST says so', async () => {
    const lan = lanAddress();
    if (!lan) return; // Nothing but loopback here, so there is nothing to reach it from.
    await expect(fetch(`http://${lan}:${port}/api/session`)).rejects.toThrow();
    // And the same machine still reaches it.
    expect((await fetch(local('/api/session'))).status).toBe(200);
  });

  it('refuses a form post from another web page', async () => {
    await fetch(local('/api/profile'), {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-requested-with': 'SatzWerk' },
      body: JSON.stringify({ onboarded: true }),
    });

    // What an HTML form with enctype=text/plain sends.
    const password = await fetch(local('/api/password'), {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=UTF-8', origin: 'https://evil.example' },
      body: '{"newPassword":"chosen-by-a-website","x":"="}',
    });
    expect(password.status).toBe(415);

    // A bodyless one, which carries no Content-Type at all.
    const reset = await fetch(local('/api/reset'), {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    });
    expect(reset.status).toBe(403);

    // Nothing changed: still open, still onboarded.
    expect(await (await fetch(local('/api/session'))).json()).toMatchObject({ required: false, signedIn: true });
    expect(await (await fetch(local('/api/state'))).json()).toMatchObject({ profile: { onboarded: true } });
  });

  it("still takes the app's own writes, with or without a body", async () => {
    // Bodyless, the way api.reset() sends it: no Content-Type, but the app's header.
    const reset = await fetch(local('/api/reset'), {
      method: 'POST',
      headers: { 'x-requested-with': 'SatzWerk' },
    });
    expect(reset.status).toBe(200);
    // A same-origin browser request without the header is fine too.
    const profile = await fetch(local('/api/profile'), {
      method: 'PUT',
      headers: { 'content-type': 'application/json', origin: `http://127.0.0.1:${port}` },
      body: JSON.stringify({ onboarded: true }),
    });
    expect(profile.status).toBe(200);
  });

  it('answers only to a loopback name while it has no password', async () => {
    // DNS rebinding: a web page points its own name at 127.0.0.1, and the
    // browser then treats this server as that page's origin. The Host header
    // still carries the page's name, and that gets the setup screen, not the data.
    const { request } = await import('node:http');
    const status = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const req = request(
        { host: '127.0.0.1', port, path: '/api/state', headers: { host: `rebound.example:${port}` } },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
        },
      );
      req.on('error', reject);
      req.end();
    });
    expect(status.status).toBe(401);
    expect(JSON.parse(status.body)).toMatchObject({ needsSetup: true });
  });

  it('sends the security headers with the app and with the API', async () => {
    for (const path of ['/', '/api/session']) {
      const response = await fetch(local(path));
      expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      expect(response.headers.get('x-frame-options')).toBe('DENY');
      expect(response.headers.get('referrer-policy')).toBe('same-origin');
    }
  });
});
