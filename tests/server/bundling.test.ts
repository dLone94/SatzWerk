import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * What the hosted function is allowed to load at module scope.
 *
 * This exists because of a real failure. `server/db.ts` reached the SQLite
 * driver through `await import('./driver-sqlite.ts')`, which looks lazy — but
 * a bundler hoists the `import 'node:sqlite'` inside that module to a
 * top-level static import, because ESM imports are always hoisted. Vercel
 * bundles, so a hosted deployment loaded `node:sqlite` on every cold start
 * despite never using it. On a Node older than 22.5 that module does not
 * exist, the import threw before any of our code ran, the platform answered
 * with its own crash page, and the app showed the learner
 * `Unexpected token 'A', "A server e"... is not valid JSON`.
 *
 * The fix is a computed module specifier, which a bundler cannot resolve. The
 * checks below are on the source, so they run without a bundler, and they are
 * about the shape that made the fix necessary.
 */

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('the hosted function does not drag in SQLite', () => {
  it('imports node:sqlite through a variable, never a literal specifier', () => {
    const source = read('server/driver-sqlite.ts');
    // A static import, or a dynamic one with a literal specifier, would both
    // be hoisted. `typeof import('node:sqlite')` is a TypeScript type query,
    // erased before anything runs, so it is deliberately not matched here.
    expect(source).not.toMatch(/import\s[^;]*from\s*['"]node:sqlite['"]/);
    expect(source).not.toMatch(/(?<!typeof\s)import\(\s*['"]node:sqlite['"]\s*\)/);
    expect(source).toMatch(/const SQLITE_MODULE = 'node:sqlite'/);
    expect(source).toMatch(/await import\(SQLITE_MODULE\)/);
  });

  it('never reaches the SQLite driver from a static import', () => {
    // db.ts is what the Vercel function imports. If it names the driver in a
    // static import, everything above is undone.
    const source = read('server/db.ts');
    expect(source).not.toMatch(/^import[^;]*driver-sqlite/m);
    expect(source).toMatch(/await import\('\.\/driver-sqlite\.ts'\)/);
  });

  it('keeps the Postgres driver dynamic too, so local runs never load pg', () => {
    const source = read('server/db.ts');
    expect(source).not.toMatch(/^import[^;]*driver-postgres/m);
    expect(source).toMatch(/await import\('\.\/driver-postgres\.ts'\)/);
  });

  it('pins a Node version that actually has the features this uses', () => {
    // Without this the platform picks its own default, which is how an older
    // Node came to be running code that needs node:sqlite and native
    // TypeScript.
    const pkg = JSON.parse(read('package.json')) as { engines?: { node?: string } };
    expect(pkg.engines?.node).toBe('>=22.18');
  });
});

describe('a hosted deployment with no database says so', () => {
  it('names DATABASE_URL rather than failing on a read-only disk', async () => {
    const { openDatabase } = await import('../../server/db.ts');
    const saved = { vercel: process.env.VERCEL, db: process.env.SATZWERK_DB };
    process.env.VERCEL = '1';
    delete process.env.SATZWERK_DB;
    try {
      await expect(openDatabase()).rejects.toThrow(/DATABASE_URL is not set/);
      // And it points at the thing people actually get wrong.
      await expect(openDatabase()).rejects.toThrow(/Preview and Production are separate/);
    } finally {
      if (saved.vercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = saved.vercel;
      if (saved.db !== undefined) process.env.SATZWERK_DB = saved.db;
    }
  });

  it('still honours an explicit SATZWERK_DB, which is a deliberate choice', async () => {
    const { openDatabase } = await import('../../server/db.ts');
    const saved = process.env.VERCEL;
    process.env.VERCEL = '1';
    try {
      const db = await openDatabase({ path: ':memory:' });
      expect(db.dialect).toBe('sqlite');
      await db.close();
    } finally {
      if (saved === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = saved;
    }
  });
});

describe('the API function is named something Vercel will route to', () => {
  /**
   * A real failure, and an expensive one to diagnose.
   *
   * The catch-all was called `[[...path]].ts`, which is Next.js's
   * optional-catch-all syntax. A plain Vercel Functions directory wants
   * `[...path].ts`. The difference is invisible for a single segment —
   * /api/session worked perfectly — and fatal for a deep one:
   * /api/lessons/<id>/sections/<id> never reached the function at all, and
   * Vercel answered with its own NOT_FOUND page. So the app signed in, loaded
   * its state, and then broke the moment a lesson was opened, with a 404 that
   * looked like a missing route in our own router.
   *
   * Nothing in the source says which form is correct, so the filename is
   * checked here instead.
   */
  it('uses a single-bracket catch-all, not the optional double-bracket form', () => {
    const files = readdirSync(new URL('../../api', import.meta.url));
    expect(files).toContain('[...path].ts');
    expect(files.some((name) => name.startsWith('[['))).toBe(false);
  });

  it('keeps the standalone health function beside it', () => {
    // A more specific route than the catch-all, and it must stay that way:
    // it is the one thing that answers when everything else is broken.
    const files = readdirSync(new URL('../../api', import.meta.url));
    expect(files).toContain('health.ts');
  });
});
