import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDatabase, SCHEMA_VERSION, type Db } from '../../server/db.ts';
import { openSqlite } from '../../server/driver-sqlite.ts';
import { toPositional } from '../../server/driver.ts';

/**
 * Migrations normally run from zero in the tests, which leaves the upgrade
 * path — the one that runs against a database with data already in it —
 * completely unexercised. That is exactly where a migration bug hides.
 */

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'satzwerk-migrations-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('migrating an existing database', () => {
  it('upgrades a database that stopped at version 1, keeping its data', async () => {
    const path = join(dir, 'v1.db');

    // Build a genuine version-1 database: run migration 1 and stop, which is
    // exactly the database an older build of this app left behind. Winding a
    // current one back by hand would mean a list of drops to maintain per
    // migration, and the day someone forgot to extend it the test would pass
    // while testing nothing.
    const first = await openSqlite({ path });
    expect(await migrate(first, 1)).toBe(1);
    // There is no accounts table yet, and no user_id anywhere — that is what
    // migration 2 onwards is for.
    const users = await first.all(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'",
    );
    expect(users).toHaveLength(0);

    // migrate() creates the schema; seeding the profile row is openDatabase's
    // job, so a database built this way has none yet. Insert it by hand, with
    // data worth preserving across the upgrade.
    const now = new Date().toISOString();
    await first.run(
      `INSERT INTO profile (id, teaching_language, daily_target_minutes, onboarded, created_at, updated_at)
       VALUES (1, ?, 25, 1, ?, ?)`,
      'bg',
      now,
      now,
    );
    await first.close();

    // Reopen: the pending migration should run and the data should survive.
    const second = await openDatabase({ path });
    const version = await second.get<{ value: string }>(
      'SELECT value FROM meta WHERE key = ?',
      'schema_version',
    );
    expect(Number(version!.value)).toBe(SCHEMA_VERSION);

    const profile = await second.get<{ teaching_language: string; user_id: number }>(
      'SELECT teaching_language, user_id FROM profile WHERE id = 1',
    );
    expect(profile!.teaching_language).toBe('bg');
    expect(profile!.user_id).toBe(1);

    const user = await second.get<{ id: number; label: string }>('SELECT id, label FROM users');
    expect(user).toMatchObject({ id: 1, label: 'me' });
    await second.close();
  });

  it('is idempotent: opening twice changes nothing', async () => {
    const path = join(dir, 'twice.db');
    const first = await openDatabase({ path });
    await first.run('UPDATE profile SET display_name = ? WHERE id = 1', 'Teo');
    await first.close();

    const second = await openDatabase({ path });
    const version = await second.get<{ value: string }>(
      'SELECT value FROM meta WHERE key = ?',
      'schema_version',
    );
    expect(Number(version!.value)).toBe(SCHEMA_VERSION);
    const profile = await second.get<{ display_name: string }>(
      'SELECT display_name FROM profile WHERE id = 1',
    );
    expect(profile!.display_name).toBe('Teo');
    // Exactly one account, not one per open.
    const users = await second.all('SELECT id FROM users');
    expect(users).toHaveLength(1);
    await second.close();
  });

  it('attributes every progress table to a learner', async () => {
    const db: Db = await openDatabase({ path: ':memory:' });
    for (const table of [
      'profile',
      'lesson_state',
      'step_outcomes',
      'review_items',
      'attempts',
      'mistakes',
      'study_days',
      'checkpoint_results',
      'word_flags',
    ]) {
      const columns = await db.all<{ name: string }>(`SELECT name FROM pragma_table_info('${table}')`);
      expect(
        columns.map((column) => column.name),
        `${table} has no user_id`,
      ).toContain('user_id');
    }
    await db.close();
  });
});

describe('the placeholder rewrite the Postgres driver relies on', () => {
  it('numbers each placeholder in order', () => {
    expect(toPositional('SELECT * FROM t WHERE a = ? AND b = ?')).toBe(
      'SELECT * FROM t WHERE a = $1 AND b = $2',
    );
  });

  it('leaves a question mark inside a quoted literal alone', () => {
    expect(toPositional("SELECT * FROM t WHERE a LIKE '%?%' AND b = ?")).toBe(
      "SELECT * FROM t WHERE a LIKE '%?%' AND b = $1",
    );
    expect(toPositional('SELECT "odd?column" FROM t WHERE a = ?')).toBe(
      'SELECT "odd?column" FROM t WHERE a = $1',
    );
  });

  it('handles an escaped quote inside a literal', () => {
    expect(toPositional("SELECT 'it''s ? fine' , x FROM t WHERE a = ?")).toBe(
      "SELECT 'it''s ? fine' , x FROM t WHERE a = $1",
    );
  });

  it('leaves SQL with no placeholders untouched', () => {
    expect(toPositional('SELECT 1')).toBe('SELECT 1');
  });
});
