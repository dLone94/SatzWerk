import { describe, expect, it } from 'vitest';
import { DATABASE_URL_VARIABLES, findDatabaseUrl } from '../../server/db.ts';

/**
 * Which environment variable holds the connection string.
 *
 * `DATABASE_URL` is the documented name. The others exist because Vercel's own
 * Neon and Postgres integrations create their own names when you add a
 * database from the dashboard — and someone who did that has configured a
 * database, whatever it ended up being called. Reading only one name meant the
 * app could sit in front of a working database insisting none was set.
 */
describe('finding the connection string', () => {
  it('prefers DATABASE_URL, the name the project documents', () => {
    expect(
      findDatabaseUrl({
        DATABASE_URL: 'postgresql://a/one',
        POSTGRES_URL: 'postgresql://b/two',
      }),
    ).toEqual({ name: 'DATABASE_URL', url: 'postgresql://a/one' });
  });

  it('accepts the names Vercel’s database integrations create', () => {
    for (const name of DATABASE_URL_VARIABLES.slice(1)) {
      expect(findDatabaseUrl({ [name]: 'postgresql://host/db' })).toEqual({
        name,
        url: 'postgresql://host/db',
      });
    }
  });

  it('prefers a pooled endpoint over an unpooled one', () => {
    const found = findDatabaseUrl({
      DATABASE_URL_UNPOOLED: 'postgresql://direct/db',
      POSTGRES_URL: 'postgresql://pooled/db',
    });
    expect(found?.name).toBe('POSTGRES_URL');
  });

  it('treats blank and whitespace as unset, and trims what it returns', () => {
    expect(findDatabaseUrl({ DATABASE_URL: '' })).toBeUndefined();
    expect(findDatabaseUrl({ DATABASE_URL: '   ' })).toBeUndefined();
    expect(findDatabaseUrl({ DATABASE_URL: ' postgresql://host/db ' })?.url).toBe(
      'postgresql://host/db',
    );
  });

  it('finds nothing when there is nothing', () => {
    expect(findDatabaseUrl({})).toBeUndefined();
  });
});

/**
 * Names nobody listed.
 *
 * Vercel prefixes the variables it creates with the store's name, so the same
 * database arrives under a different name depending on what it was called when
 * it was added. A fixed list cannot keep up, and the cost of missing one is
 * the app insisting no database is configured while a perfectly good one sits
 * in front of it.
 */
describe('a connection string under an unlisted name', () => {
  it('is found by its shape when the name says Postgres or Neon', () => {
    expect(findDatabaseUrl({ MY_STORE_POSTGRES_URL: 'postgresql://host/db' })).toEqual({
      name: 'MY_STORE_POSTGRES_URL',
      url: 'postgresql://host/db',
    });
    expect(findDatabaseUrl({ SATZWERK_NEON_DB_URL: 'postgres://host/db' })?.name).toBe(
      'SATZWERK_NEON_DB_URL',
    );
  });

  it('prefers a pooled endpoint here too', () => {
    const found = findDatabaseUrl({
      STORE_POSTGRES_URL_UNPOOLED: 'postgresql://direct/db',
      STORE_POSTGRES_URL: 'postgresql://pooled/db',
    });
    expect(found?.name).toBe('STORE_POSTGRES_URL');
  });

  it('takes a direct connection when that is the only one', () => {
    const found = findDatabaseUrl({ STORE_POSTGRES_URL_UNPOOLED: 'postgresql://direct/db' });
    expect(found?.name).toBe('STORE_POSTGRES_URL_UNPOOLED');
  });

  it('never mistakes the test database for the app database', () => {
    // This project's own suite sets TEST_DATABASE_URL to a real Postgres. If
    // that counted, running the tests would quietly point the app at it.
    expect(findDatabaseUrl({ TEST_DATABASE_URL: 'postgresql://localhost:5433/satzwerk_test' })).toBeUndefined();
  });

  it('ignores a matching name whose value is not a connection string', () => {
    expect(findDatabaseUrl({ POSTGRES_HOST_URL: 'db.example.com' })).toBeUndefined();
    expect(findDatabaseUrl({ NEON_API_URL: 'https://console.neon.tech' })).toBeUndefined();
  });

  it('still prefers a name the project documents over a guessed one', () => {
    const found = findDatabaseUrl({
      STORE_POSTGRES_URL: 'postgresql://guessed/db',
      DATABASE_URL: 'postgresql://documented/db',
    });
    expect(found).toEqual({ name: 'DATABASE_URL', url: 'postgresql://documented/db' });
  });
});
