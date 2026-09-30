import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { openDatabase } from '../../server/db.ts';
import * as push from '../../server/push.ts';
import * as store from '../../server/store.ts';

/**
 * The evening job, with several learners.
 *
 * Each learner's reminder may take up to the five-second send deadline, and
 * the job went through learners one after another. Six learners who each had a
 * device that never answered added up to the 30-second function limit, and the
 * job was killed before the rest got theirs.
 */

vi.mock('../../server/push.ts', async (original) => {
  const real = await original<typeof import('../../server/push.ts')>();
  return { ...real, sendDueReminder: vi.fn(real.sendDueReminder) };
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('the reminder job', () => {
  it('sends to every learner at the same time, not one after another', async () => {
    vi.stubEnv('CRON_SECRET', 'cron-secret-for-the-test');
    const db = await openDatabase({ path: ':memory:' });
    for (const name of ['Ana', 'Boris', 'Cveta', 'Dimo', 'Elena']) await store.createLearner(db, name);
    const learners = (await store.listLearners(db)).length;

    // Each learner's send waits as long as a device that never answers would,
    // scaled down; what matters is how many are waiting at once.
    let inFlight = 0;
    let most = 0;
    vi.mocked(push.sendDueReminder).mockImplementation(async () => {
      inFlight += 1;
      most = Math.max(most, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 20));
      inFlight -= 1;
      return { configured: true, dueCount: 1, sent: 0, skipped: 0, removed: 0, errors: ['did not answer'] };
    });

    const response = await handleRequest(
      { db },
      { method: 'POST', path: '/api/push/run', headers: { authorization: 'Bearer cron-secret-for-the-test' } },
    );
    expect(response.status).toBe(200);
    expect((response.body as { learners: unknown[] }).learners).toHaveLength(learners);
    expect(push.sendDueReminder).toHaveBeenCalledTimes(learners);
    expect(most).toBe(learners);
    await db.close();
  });
});
