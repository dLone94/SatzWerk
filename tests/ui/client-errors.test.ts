import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api/client.ts';

/**
 * What an API failure tells whoever is looking at it.
 *
 * This is not cosmetic. A hosted deployment answered a deep path with the
 * platform's own 404 page, and the app reported "The server failed with HTTP
 * 404" — true, and useless, because the one fact needed to fix it was *which*
 * request failed. That fact lived only in the browser's network panel, so the
 * person hitting the error could not report it, and two rounds of diagnosis
 * went on guessing which call it was.
 *
 * So every failure names the method and path.
 */

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function answerWith(body: string, init: ResponseInit) {
  globalThis.fetch = vi.fn(async () => new Response(body, init)) as unknown as typeof fetch;
}

describe('an API error', () => {
  it('names the request when the platform answers with its own error page', async () => {
    answerWith('The page could not be found\n\nNOT_FOUND', { status: 404 });
    await expect(api.markSectionSeen('pre-a1-u1-l1', 'u1l1-s2')).rejects.toThrow(
      /POST \/api\/lessons\/pre-a1-u1-l1\/sections\/u1l1-s2 failed with HTTP 404/,
    );
  });

  it('names the request when the server answers with JSON', async () => {
    answerWith(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
    // A message from our own server is used as written — it is already about
    // this request, and prefixing it would read like a machine.
    await expect(api.state()).rejects.toThrow('Not found');
  });

  it('names the request when the body is not JSON but the status is fine', async () => {
    answerWith('<!doctype html><title>index</title>', { status: 200 });
    await expect(api.session()).rejects.toThrow(
      /GET \/api\/session returned something that is not JSON/,
    );
  });

  it('names the request when the server cannot be reached', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch;
    await expect(api.state()).rejects.toThrow(
      /Could not reach the server for GET \/api\/state: Failed to fetch/,
    );
  });

  it('reports the status alongside the message, so callers can branch on 401', async () => {
    answerWith(JSON.stringify({ error: 'Sign in first.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
    await expect(api.state()).rejects.toMatchObject({ status: 401 });
  });
});
