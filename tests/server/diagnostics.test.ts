import { describe, expect, it, vi } from 'vitest';
import { compactReceipt, compactStoredReceipts, decodeReceipt, encodeReceipt, receiptStorage } from '../../server/receipts.ts';
import { diagnose, traceRequest } from '../../server/diagnostics.ts';
import { openDatabase } from '../../server/db.ts';

describe('durable compact acknowledgements', () => {
  it('preserves Unicode and the complete response while reducing storage', () => {
    const response = { status: 200, body: { lesson: { text: 'Уча немски. Grüße! '.repeat(2000) } } };
    const compacted = encodeReceipt(response);
    expect(compacted.length).toBeLessThan(JSON.stringify(response).length / 4);
    expect(decodeReceipt(compacted)).toEqual(response);
    expect(decodeReceipt(JSON.stringify(response))).toEqual(response);
    expect(compactReceipt(compacted)).toBe(compacted);
  });
  it('compacts old receipts without removing retry protection', async () => {
    const db = await openDatabase({ path: ':memory:' });
    try {
      const response = { status: 200, body: { result: 'Antwort '.repeat(1000) } };
      await db.run('INSERT INTO write_receipts (user_id, write_id, fingerprint, response, created_at) VALUES (?, ?, ?, ?, ?)',
        1, 'old-key', 'original-fingerprint', JSON.stringify(response), '2025-01-01');
      const before = await receiptStorage(db);
      expect(await compactStoredReceipts(db)).toBe(1);
      expect(await compactStoredReceipts(db)).toBe(0);
      const row = (await db.get<{ fingerprint: string; response: string }>('SELECT fingerprint, response FROM write_receipts'))!;
      expect(row.fingerprint).toBe('original-fingerprint');
      expect(decodeReceipt(row.response)).toEqual(response);
      expect((await receiptStorage(db))!.stored_characters).toBeLessThan(before!.stored_characters);
    } finally { await db.close(); }
  });
});

it('correlates concurrent requests without logging private inputs', async () => {
  const log = vi.spyOn(console, 'info').mockImplementation(() => {});
  try {
    const results = await Promise.all(['POST', 'PATCH'].map(method => traceRequest(method, async id => {
      await Promise.resolve();
      diagnose('write_replayed');
      return { id, status: 409, body: 'private-answer-and-password' };
    }, result => result.status)));
    expect(results[0]!.id).not.toBe(results[1]!.id);
    const events = log.mock.calls.map(([value]) => JSON.parse(value as string));
    for (const result of results) expect(events.filter(event => event.requestId === result.id)).toHaveLength(2);
    expect(JSON.stringify(events)).not.toContain('private-answer-and-password');
  } finally { log.mockRestore(); }
});
