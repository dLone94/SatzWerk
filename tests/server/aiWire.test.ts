import { createServer, type Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CLAUDE_EFFORT, CLAUDE_MODEL, ClaudeFailure, createClaudeCaller } from '../../server/ai-claude.ts';

/**
 * What actually goes on the wire.
 *
 * Every other test in this area drives the provider through its stub seam,
 * which is the right way to test policy and says nothing at all about the one
 * request that policy eventually turns into. A wrong model id, a missing beta
 * flag or a malformed `output_config` would pass all of those and fail the
 * first time a learner pressed the button.
 *
 * So: a real SDK client, a real HTTP request, and a local server standing in
 * for the API. No credit is spent and no network is left, but the request is
 * the genuine article.
 */

let server: Server;
let received: { headers: Record<string, string | string[] | undefined>; body: Record<string, unknown> };
let reply: { status: number; body: unknown };

beforeEach(async () => {
  reply = {
    status: 200,
    body: {
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: CLAUDE_MODEL,
      content: [{ type: 'text', text: '{"explanation":"Because aus marks origin."}' }],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 10 },
    },
  };

  server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => chunks.push(chunk));
    request.on('end', () => {
      received = {
        headers: request.headers,
        body: JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>,
      };
      response.writeHead(reply.status, { 'content-type': 'application/json' });
      response.end(JSON.stringify(reply.body));
    });
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as { port: number }).port;
  // The SDK reads this itself, so the production code needs no test-only seam.
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
});

afterEach(async () => {
  delete process.env.ANTHROPIC_BASE_URL;
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const ask = () =>
  createClaudeCaller({ apiKey: 'sk-test', model: CLAUDE_MODEL })({
    system: 'You are explaining German.',
    user: 'Why is "von Bulgarien" wrong?',
    schema: { type: 'object', required: ['explanation'], properties: { explanation: { type: 'string' } } },
  });

describe('the request this app actually sends', () => {
  it('names the model, the effort and the schema it was configured with', async () => {
    expect(await ask()).toBe('{"explanation":"Because aus marks origin."}');

    expect(received.body.model).toBe(CLAUDE_MODEL);
    expect(received.body.system).toBe('You are explaining German.');
    expect(received.body.messages).toEqual([
      { role: 'user', content: 'Why is "von Bulgarien" wrong?' },
    ]);

    const outputConfig = received.body.output_config as Record<string, unknown>;
    expect(outputConfig.effort).toBe(CLAUDE_EFFORT);
    expect(outputConfig.format).toMatchObject({ type: 'json_schema' });

    // Server-side fallback needs both halves — the flag and the parameter —
    // and the flag has to be the one that matches the scalar form. Sending
    // the parameter with the wrong header is a 400, not a silent no-op.
    expect(received.body.fallbacks).toBe('default');
    expect(String(received.headers['anthropic-beta'])).toContain('server-side-fallback-2026-07-01');

    // The key travels in the header the API expects, and nowhere else.
    expect(received.headers['x-api-key']).toBe('sk-test');
    expect(JSON.stringify(received.body)).not.toContain('sk-test');
  });

  it('treats a refusal as a failure rather than reading the content anyway', async () => {
    reply.body = {
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: CLAUDE_MODEL,
      content: [{ type: 'text', text: 'I cannot help with that.' }],
      stop_reason: 'refusal',
      stop_details: { type: 'refusal', category: 'cyber', explanation: 'declined' },
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 10 },
    };

    // The content of a refusal is not an answer to the question that was
    // asked, so handing it to a learner as an explanation would be worse than
    // showing nothing.
    await expect(ask()).rejects.toMatchObject({ reason: 'refused' });
  });

  it('turns an API error into a failure the caller can report', async () => {
    reply = { status: 401, body: { type: 'error', error: { type: 'authentication_error', message: 'bad key' } } };
    await expect(ask()).rejects.toBeInstanceOf(ClaudeFailure);
    await expect(ask()).rejects.toMatchObject({ reason: 'unreachable' });
  });

  it('refuses an empty answer instead of passing an empty explanation on', async () => {
    reply.body = {
      id: 'msg_test',
      type: 'message',
      role: 'assistant',
      model: CLAUDE_MODEL,
      content: [],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: { input_tokens: 10, output_tokens: 0 },
    };
    await expect(ask()).rejects.toMatchObject({ reason: 'malformed' });
  });
});
