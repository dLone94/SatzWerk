import { brotliCompressSync, brotliDecompressSync, constants } from 'node:zlib';
import type { ApiResponse } from './api.ts';
import type { Db } from './db.ts';

const PREFIX = 'br1:';
/** Lossless acknowledgement compaction. Keys and fingerprints never expire. */
export function encodeReceipt(response: ApiResponse): string {
  return compactReceipt(JSON.stringify(response));
}
export function compactReceipt(json: string): string {
  if (json.startsWith(PREFIX) || Buffer.byteLength(json) < 1024) return json;
  const encoded = PREFIX + brotliCompressSync(Buffer.from(json), { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } }).toString('base64');
  return Buffer.byteLength(encoded) < Buffer.byteLength(json) ? encoded : json;
}
export function decodeReceipt(stored: string): ApiResponse {
  return JSON.parse(stored.startsWith(PREFIX) ? brotliDecompressSync(Buffer.from(stored.slice(PREFIX.length), 'base64')).toString() : stored);
}
export async function receiptStorage(db: Db) {
  return await db.get<{ receipts: number; stored_characters: number; oldest: string | null }>(
    'SELECT COUNT(*) AS receipts, COALESCE(SUM(LENGTH(response)), 0) AS stored_characters, MIN(created_at) AS oldest FROM write_receipts',
  );
}
/** Explicit maintenance for older JSON receipts; repeatable and concurrent-safe. */
export async function compactStoredReceipts(db: Db): Promise<number> {
  let count = 0;
  // Only larger uncompressed JSON acknowledgements qualify. Small receipts
  // and compressed receipts are left alone; no retry protection is deleted.
  const rows = await db.all<{ user_id: number; write_id: string; response: string }>(
    "SELECT user_id, write_id, response FROM write_receipts WHERE LENGTH(response) >= 1024 AND response LIKE '{%'",
  );
  for (const row of rows) {
    const compacted = compactReceipt(row.response);
    if (compacted === row.response) continue;
    const result = await db.run('UPDATE write_receipts SET response = ? WHERE user_id = ? AND write_id = ? AND response = ?',
      compacted, row.user_id, row.write_id, row.response);
    count += Number(result.changes);
  }
  return count;
}
