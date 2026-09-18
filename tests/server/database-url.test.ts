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
