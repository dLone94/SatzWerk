import { openDatabase } from '../server/db.ts';
import { compactStoredReceipts, receiptStorage } from '../server/receipts.ts';

const db = await openDatabase();
try {
  if (process.argv.includes('--compact')) console.log(JSON.stringify({ compacted: await compactStoredReceipts(db) }));
  console.log(JSON.stringify(await receiptStorage(db)));
} finally {
  await db.close();
}
