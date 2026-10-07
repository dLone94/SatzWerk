import { createHash } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './api.ts';
import type { Db } from './db.ts';
import type { Scope } from './store.ts';
import { decodeReceipt, encodeReceipt } from './receipts.ts';
import { diagnose } from './diagnostics.ts';

/** Only the learning writes that the outbox may replay. */
export function isLearningWrite(method: string, path: string): boolean {
  return method === 'POST' && (
    /^\/api\/(attempts|study|checkpoints|scenario-runs|daily-runs)$/.test(path) ||
    /^\/api\/lessons\/[^/]+\/(sections\/[^/]+|mastery|recovery|complete)$/.test(path) ||
    /^\/api\/reviews\/[^/]+\/grade$/.test(path)
  );
}

/** Save the acknowledgement in the same transaction as the learner's work. */
export async function once(
  { db, userId }: Scope,
  key: string,
  request: ApiRequest,
  work: (transaction: Db) => Promise<ApiResponse>,
): Promise<ApiResponse> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(key)) {
    return { status: 400, body: { error: 'Idempotency-Key must be 1–128 letters, digits, underscores or hyphens.' } };
  }
  const fingerprint = createHash('sha256')
    .update(JSON.stringify([request.method, request.path, request.body ?? null]))
    .digest('hex');

  return db.transaction(async () => {
    // A conflicting INSERT waits for the other instance's transaction to
    // commit before the receipt is read. No process-local cache or lock.
    await db.run(`INSERT INTO write_receipts (user_id, write_id, fingerprint, created_at)
      VALUES (?, ?, ?, ?) ON CONFLICT (user_id, write_id) DO NOTHING`,
    userId, key, fingerprint, new Date().toISOString());
    const receipt = (await db.get<{ fingerprint: string; response: string | null }>(
      'SELECT fingerprint, response FROM write_receipts WHERE user_id = ? AND write_id = ?', userId, key,
    ))!;
    if (receipt.fingerprint !== fingerprint) {
      diagnose('write_conflict');
      return { status: 409, body: { error: 'This write ID was already used for different work.' } };
    }
    if (receipt.response !== null) {
      diagnose('write_replayed');
      return decodeReceipt(receipt.response);
    }

    // Store functions may declare their own transaction. Here they join this
    // request's existing transaction so the work and receipt commit together.
    // The ordinary driver's nesting guard stays intact elsewhere.
    const transaction: Db = { ...db, transaction: (body) => body() };
    const response = await work(transaction);
    if (response.status >= 400) {
      diagnose('write_refused', { status: response.status });
      await db.run('DELETE FROM write_receipts WHERE user_id = ? AND write_id = ?', userId, key);
    } else {
      await db.run('UPDATE write_receipts SET response = ? WHERE user_id = ? AND write_id = ?',
        encodeReceipt(response), userId, key);
    }
    return response;
  });
}
