import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  crossSiteRefusal,
  isLoopbackAddress,
  isLoopbackHost,
  SECURITY_HEADERS,
} from '../../server/security.ts';

/**
 * Requests from somewhere other than the app.
 *
 * The API parsed any body as JSON whatever its Content-Type and never looked at
 * the Origin, so an ordinary HTML form on any web page could POST to it with no
 * CORS preflight: set a password on a local, passwordless SatzWerk and lock its
 * owner out, or wipe the learner's progress. And no response carried a
 * Content-Security-Policy or anything else that stops the app being framed.
 */

describe('where a write came from', () => {
  const ok = (method: string, path: string, headers: Record<string, string>) =>
    crossSiteRefusal(method, path, { host: 'satzwerk.test', ...headers });

  it("lets through the app's own requests", () => {
    // The header the client sends on every request, with or without a body.
    expect(ok('POST', '/api/reset', { 'x-requested-with': 'SatzWerk' })).toBeNull();
    expect(
      ok('PUT', '/api/profile', { 'x-requested-with': 'SatzWerk', 'content-type': 'application/json' }),
    ).toBeNull();
    // A same-origin browser request, by its Origin, or its Referer when there is no Origin.
    expect(ok('POST', '/api/reset', { origin: 'https://satzwerk.test' })).toBeNull();
    expect(ok('POST', '/api/reset', { referer: 'https://satzwerk.test/settings' })).toBeNull();
    // Behind a proxy that says which host the browser asked for.
    expect(
      crossSiteRefusal('POST', '/api/reset', {
        host: 'internal:8787',
        'x-forwarded-host': 'satzwerk.test',
        origin: 'https://satzwerk.test',
      }),
    ).toBeNull();
  });

  it('refuses a form post, and a write from another origin', () => {
    // enctype=text/plain, the form that smuggles JSON.
    expect(ok('POST', '/api/password', { 'content-type': 'text/plain;charset=UTF-8', origin: 'https://evil.example' }))
      .toMatchObject({ status: 415 });
    expect(ok('POST', '/api/reset', { 'content-type': 'application/x-www-form-urlencoded' })).toMatchObject({
      status: 415,
    });
    expect(ok('POST', '/api/reset', { origin: 'https://evil.example' })).toMatchObject({ status: 403 });
    // A sandboxed frame or a data: page sends "null".
    expect(ok('POST', '/api/reset', { origin: 'null' })).toMatchObject({ status: 403 });
    // An Origin wins over a Referer that happens to look right.
    expect(
      ok('POST', '/api/reset', { origin: 'https://evil.example', referer: 'https://satzwerk.test/' }),
    ).toMatchObject({ status: 403 });
    // And a write that says nothing about where it came from.
    expect(ok('DELETE', '/api/learners/2', {})).toMatchObject({ status: 403 });
  });

  it('leaves reads and the reminder job alone', () => {
    expect(ok('GET', '/api/state', { origin: 'https://evil.example' })).toBeNull();
    // The scheduler is not a browser and proves itself with its own secret.
    expect(ok('POST', '/api/push/run', { authorization: 'Bearer x' })).toBeNull();
  });
});

describe('loopback', () => {
  it('knows a loopback address', () => {
    for (const address of ['127.0.0.1', '127.1.2.3', '::1', '::ffff:127.0.0.1']) {
      expect(isLoopbackAddress(address), address).toBe(true);
    }
    for (const address of ['192.0.2.2', '10.0.0.1', '::ffff:192.168.1.5', 'fe80::1', '', undefined]) {
      expect(isLoopbackAddress(address), String(address)).toBe(false);
    }
  });

  it('knows a loopback Host header', () => {
    for (const host of ['localhost:8787', 'localhost', '127.0.0.1:8787', '[::1]:8787', 'app.localhost:5173']) {
      expect(isLoopbackHost(host), host).toBe(true);
    }
    for (const host of ['rebound.example:8787', '192.0.2.2:8787', 'localhost.evil.example', '', undefined]) {
      expect(isLoopbackHost(host), String(host)).toBe(false);
    }
  });
});

describe('the headers every response carries', () => {
  it('keeps the app out of other sites’ frames and off anything it did not load itself', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy']!;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    // Recordings the learner just made play from a blob: URL.
    expect(csp).toMatch(/media-src 'self' blob:/);
    // The favicon is an inline SVG data: URL in index.html.
    expect(csp).toMatch(/img-src 'self' data:/);
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
  });

  it('are the same ones vercel.json gives the hosted app', () => {
    // The static files on Vercel never pass through the function, so the
    // platform has to add the headers itself. Written twice, so checked here.
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
      headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };
    const all = config.headers?.find((entry) => entry.source === '/(.*)');
    expect(all).toBeDefined();
    const sent = Object.fromEntries(all!.headers.map(({ key, value }) => [key, value]));
    expect(sent).toEqual(SECURITY_HEADERS);
  });
});

describe('the Vercel function', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'satzwerk-security-'));
    process.env.SATZWERK_DB = join(dir, 'fn.db');
    delete process.env.VERCEL;
    delete process.env.DATABASE_URL;
    delete process.env.SATZWERK_PASSWORD_HASH;
    delete process.env.SATZWERK_SESSION_SECRET;
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.SATZWERK_DB;
  });

  async function loadHandler() {
    vi.resetModules();
    const mod = await import('../../server/vercel.ts');
    return mod.default as (request: Request) => Promise<Response>;
  }

  it('refuses a cross-site form post before it reaches the router', async () => {
    const handler = await loadHandler();
    const form = await handler(
      new Request('https://satzwerk.test/api/password', {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=UTF-8', origin: 'https://evil.example' },
        body: '{"newPassword":"chosen-by-a-website","x":"="}',
      }),
    );
    expect(form.status).toBe(415);
    // Still the app's own answer, with the headers.
    expect(form.headers.get('x-satzwerk')).toBe('api');

    const reset = await handler(
      new Request('https://satzwerk.test/api/reset', { method: 'POST', headers: { origin: 'https://evil.example' } }),
    );
    expect(reset.status).toBe(403);

    const session = await handler(new Request('https://satzwerk.test/api/session'));
    expect(await session.json()).toMatchObject({ required: false });
    expect(session.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
    expect(session.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it("takes the app's own bodyless write", async () => {
    const handler = await loadHandler();
    const reset = await handler(
      new Request('https://satzwerk.test/api/reset', { method: 'POST', headers: { 'x-requested-with': 'SatzWerk' } }),
    );
    expect(reset.status).toBe(200);
  });
});
