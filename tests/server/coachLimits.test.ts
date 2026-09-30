import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { createClaudeProvider, type ClaudeRequest } from '../../server/ai-claude.ts';
import { openDatabase, type Db } from '../../server/db.ts';

/**
 * What one coach request can cost.
 *
 * The coach trimmed `expected` and `given` to 500 characters and `text` to
 * 4000, to keep each model call to about half a cent. `level` and `categories`
 * went into the prompt untouched, so one request could carry a 200,000
 * character "level" or twenty thousand categories — a thousand times the
 * intended size, at a thousand times the price. And nothing limited how many
 * calls a signed-in script could make.
 */

let db: Db;
let prompts: ClaudeRequest[];

beforeEach(async () => {
  db = await openDatabase({ path: ':memory:' });
  prompts = [];
});

afterEach(async () => {
  vi.useRealTimers();
  delete process.env.SATZWERK_AI_DAILY_LIMIT;
  await db.close();
});

function ctx() {
  const provider = createClaudeProvider({ apiKey: 'x', model: 'm' }, async (request) => {
    prompts.push(request);
    return request.user.includes('The learner wrote:')
      ? '{"findings":[]}'
      : '{"explanation":"Because bin goes with ich."}';
  });
  return { db, provider };
}

const size = (request: ClaudeRequest) => request.system.length + request.user.length;

describe('the size of a coach prompt', () => {
  it('ignores a level that is not a level, and categories the app does not have', async () => {
    const explain = await handleRequest(ctx(), {
      method: 'POST',
      path: '/api/coach/explain',
      body: {
        expected: 'Ich bin',
        given: 'Ich bist',
        level: 'A'.repeat(200_000),
        categories: [...Array(20_000).fill('word-order-and-then-some'), 'verb-conjugation', 'verb-conjugation'],
      },
    });
    expect(explain.status).toBe(200);
    const writing = await handleRequest(ctx(), {
      method: 'POST',
      path: '/api/coach/writing',
      body: { text: 'Ich bin hier.', level: 'A'.repeat(200_000) },
    });
    expect(writing.status).toBe(200);

    expect(prompts).toHaveLength(2);
    for (const prompt of prompts) expect(size(prompt)).toBeLessThan(6_000);
    expect(prompts[0]!.user).toContain('Level: PRE-A1');
    expect(prompts[0]!.user).toContain('classified the error as: verb-conjugation\n');
    expect(prompts[1]!.user).toContain('Level: PRE-A1');
  });

  it('keeps a real level', async () => {
    await handleRequest(ctx(), {
      method: 'POST',
      path: '/api/coach/explain',
      body: { expected: 'Ich bin', given: 'Ich bist', level: 'b1', categories: ['verb-conjugation'] },
    });
    expect(prompts[0]!.user).toContain('Level: B1');
  });
});

describe('how many coach calls a day', () => {
  it('stops calling the model at the daily limit, and says why in both languages', async () => {
    process.env.SATZWERK_AI_DAILY_LIMIT = '3';
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T10:00:00Z'));
    const explain = () =>
      handleRequest(ctx(), {
        method: 'POST',
        path: '/api/coach/explain',
        body: { expected: 'Ich bin', given: 'Ich bist', level: 'a1', categories: [] },
      });

    for (let i = 0; i < 3; i += 1) {
      expect((await explain()).body).toMatchObject({ explanation: expect.any(String) });
    }
    const fourth = await explain();
    expect(prompts).toHaveLength(3);
    expect(fourth.status).toBe(200);
    expect(fourth.body).toMatchObject({
      available: true,
      error: { en: expect.stringContaining('tomorrow'), bg: expect.stringContaining('утре') },
    });

    // Writing still gets the rule-based review, which costs nothing.
    const writing = await handleRequest(ctx(), {
      method: 'POST',
      path: '/api/coach/writing',
      body: { text: 'Ich bin hier.', level: 'a1' },
    });
    expect(writing.body).toMatchObject({ engine: 'rules' });
    expect(prompts).toHaveLength(3);

    // A new day, a new allowance.
    vi.setSystemTime(new Date('2026-10-01T00:30:00Z'));
    expect((await explain()).body).toMatchObject({ explanation: expect.any(String) });
    expect(prompts).toHaveLength(4);
  });
});
