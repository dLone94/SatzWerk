import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

/**
 * How long one coach call may take, end to end.
 *
 * The SDK was built with a 30-second timeout and its default of two retries,
 * and it retries a timeout. A model that never answered held the request for
 * 91 seconds: three times the hosted function's limit and the browser's. The
 * learner saw a message blaming the database, the coach's own "could not be
 * reached" note and the writing review's rule-based result came back to nobody,
 * and the daily allowance was spent all the same.
 */

const made: Array<Record<string, unknown>> = [];
/** What each call was given besides the request: its deadline. */
const asked: Array<{ signal?: AbortSignal } | undefined> = [];

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    beta = {
      messages: {
        create: async (_body: unknown, options?: { signal?: AbortSignal }) => {
          asked.push(options);
          throw new Error('Request timed out.');
        },
      },
    };
    constructor(options: Record<string, unknown>) {
      made.push(options);
    }
  },
}));

const { createClaudeCaller, ClaudeFailure, CLAUDE_MODEL, CLAUDE_DEADLINE_MS } = await import('../../server/ai-claude.ts');

const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')) as {
  functions: Record<string, { maxDuration: number }>;
};

describe('a coach call against a model that does not answer', () => {
  it('gives up once, well inside the function limit, and says why', async () => {
    const call = createClaudeCaller({ apiKey: 'test-key', model: CLAUDE_MODEL });
    await expect(call({ system: 's', user: 'u', schema: {} })).rejects.toBeInstanceOf(ClaudeFailure);

    const options = made[0]!;
    // Undefined would mean the SDK's default of two retries; one is kept, for
    // failures that come back fast, and only inside the call's deadline.
    expect(options.maxRetries).toBe(1);
    expect(Number(options.timeout)).toBeLessThanOrEqual(CLAUDE_DEADLINE_MS);
    expect(asked[0]?.signal).toBeInstanceOf(AbortSignal);
    const limit = vercel.functions['api/**/*.ts']!.maxDuration * 1000;
    // Room is left for a cold start, which opens the database first.
    expect(CLAUDE_DEADLINE_MS).toBeLessThanOrEqual(limit - 10_000);
  });
});
