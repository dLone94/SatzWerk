import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ClaudeFailure, CLAUDE_MODEL, createClaudeCaller } from '../../server/ai-claude.ts';

/**
 * The one retry a coach call keeps.
 *
 * Retries were turned off so a model that never answers is given up on inside
 * the hosted function's 30 seconds. That also gave up on the failures a second
 * try a moment later gets past — the API overloaded or rate-limited for a
 * second — so one retry came back, inside the same deadline. These run the
 * real SDK against a stand-in for the API on this machine.
 */

let server: Server;
/** What the stand-in answers to each request, in order; the last repeats. */
let script: Array<'overloaded' | 'answer'>;
let requests = 0;
const previousBaseUrl = process.env.ANTHROPIC_BASE_URL;

beforeAll(async () => {
  server = createServer((request, response) => {
    request.resume();
    request.on('end', () => {
      const step = script[Math.min(requests, script.length - 1)];
      requests += 1;
      if (step === 'overloaded') {
        // Told to come back almost at once, so the test does not wait out the
        // SDK's own back-off.
        response.writeHead(529, { 'content-type': 'application/json', 'retry-after-ms': '10' });
        response.end(JSON.stringify({ type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }));
        return;
      }
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          model: CLAUDE_MODEL,
          content: [{ type: 'text', text: '{"explanation":"aus, not von"}' }],
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
      );
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (previousBaseUrl === undefined) delete process.env.ANTHROPIC_BASE_URL;
  else process.env.ANTHROPIC_BASE_URL = previousBaseUrl;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  requests = 0;
});

const ask = () =>
  createClaudeCaller({ apiKey: 'test-key', model: CLAUDE_MODEL })({ system: 's', user: 'u', schema: {} });

describe('a coach call that meets a passing failure', () => {
  it('tries once more and answers', async () => {
    script = ['overloaded', 'answer'];
    await expect(ask()).resolves.toBe('{"explanation":"aus, not von"}');
    expect(requests).toBe(2);
  });

  it('gives up after the second try, and says the model could not be reached', async () => {
    script = ['overloaded'];
    const failure = await ask().catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(ClaudeFailure);
    expect((failure as InstanceType<typeof ClaudeFailure>).reason).toBe('unreachable');
    expect(requests).toBe(2);
  });
});
