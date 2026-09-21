import { describe, expect, it } from 'vitest';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';

/**
 * Two answers at the same moment.
 *
 * `recordAttempt` wraps six writes in a transaction, and the driver used to
 * answer a second concurrent one with `transaction() cannot be nested` — which
 * it was not; it was simply a second transaction. Measured against a real
 * Postgres before the fix: fourteen answers sent in overlapping batches, three
 * banked, eleven lost with HTTP 500. The browser treats a 500 as a refusal
 * rather than as "hold this and send it later", so those sentences were gone
 * for good.
 *
 * Two phones in one household is the case, and a warm serverless instance
 * handed two requests is the other. Nothing here needs a network to show it:
 * `Promise.all` is enough, because the collision is between two promises and
 * not between two machines.
 */

const scopeOf = (db: Db, userId = 1): store.Scope => ({ db, userId });

const attempt = (stepId: string, over: Partial<store.AttemptInput> = {}): store.AttemptInput => ({
  context: 'lesson',
  lessonId: 'pre-a1-u1-l1',
  stepId,
  expected: 'der Tisch',
  given: 'der Tisch',
  verdict: 'correct',
  credit: 1,
  categories: [],
  hintsUsed: 0,
  revealed: false,
  isRetype: false,
  resolved: true,
  ...over,
});

describe('answers arriving at the same moment', () => {
  it('banks every one of them', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const scope = scopeOf(db);

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, (_, i) => store.recordAttempt(scope, attempt(`step-${i}`))),
    );
    const refused = results.filter((r) => r.status === 'rejected');
    expect(
      refused.map((r) => (r as PromiseRejectedResult).reason?.message),
      'no answer may be refused for arriving at a busy moment',
    ).toEqual([]);

    // Not just "no error": the rows are actually there, with distinct ids.
    const stats = await store.getStats(scope);
    expect(stats.totalAnswers).toBe(8);
    const ids = new Set(results.map((r) => (r as PromiseFulfilledResult<store.AttemptResult>).value.attemptId));
    expect(ids.size).toBe(8);
    await db.close();
  });

  it('keeps two learners\u2019 answers apart when they arrive together', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const papa = await store.createLearner(db, 'Papa');

    await Promise.all([
      store.recordAttempt(scopeOf(db, 1), attempt('same-step')),
      store.recordAttempt(scopeOf(db, papa.id), attempt('same-step')),
      store.recordAttempt(scopeOf(db, 1), attempt('same-step')),
    ]);

    expect((await store.getStats(scopeOf(db, 1))).totalAnswers).toBe(2);
    expect((await store.getStats(scopeOf(db, papa.id))).totalAnswers).toBe(1);
    await db.close();
  });

  /**
   * The quieter half of the same bug. A statement issued from anywhere else
   * must not land between somebody's BEGIN and COMMIT, or it is rolled back
   * with them — a lost write with no error anywhere to say so.
   */
  it('does not roll somebody else\u2019s work back with a failed transaction', async () => {
    const db = await openDatabase({ path: ':memory:' });
    const scope = scopeOf(db);

    const doomed = db.transaction(async () => {
      await db.run(
        `INSERT INTO study_days (day, user_id, seconds_active, answers, correct)
         VALUES ('1999-01-01', ?, 1, 1, 1)`,
        scope.userId,
      );
      throw new Error('deliberate');
    });
    // Started while that transaction is open, exactly as a second request
    // would. It is nobody's business but its own whether the other one fails.
    const bystander = store.setFavorite(scope, 'v-der-tisch', true);

    await expect(doomed).rejects.toThrow('deliberate');
    await bystander;

    expect(await store.listFavorites(scope), 'the favourite was rolled back with a stranger').toEqual([
      'v-der-tisch',
    ]);
    // And the transaction's own write is gone, which is what a rollback is for.
    expect(await db.get('SELECT day FROM study_days WHERE day = ?', '1999-01-01')).toBeUndefined();
    await db.close();
  });

  it('still refuses a transaction opened inside a transaction', async () => {
    const db = await openDatabase({ path: ':memory:' });
    await expect(
      db.transaction(async () => {
        // A genuine nesting, which would need savepoints to do properly and
        // silently half-commits without them.
        await db.transaction(async () => undefined);
      }),
    ).rejects.toThrow('cannot be nested');
    // And the database is still usable afterwards, rather than stuck behind a
    // gate nobody opened again.
    await store.recordAttempt(scopeOf(db), attempt('after-the-refusal'));
    expect((await store.getStats(scopeOf(db))).totalAnswers).toBe(1);
    await db.close();
  });
});
