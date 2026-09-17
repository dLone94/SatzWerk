import { describe, expect, it } from 'vitest';
import { chooseTransport } from '../../server/driver-postgres.ts';

/**
 * Which wire protocol a Postgres URL gets.
 *
 * Neon's HTTP client is the only part of the storage layer never exercised
 * against a real database, so the override matters: if it misbehaves on a
 * deployment, the fix should be one environment variable rather than a code
 * change and a redeploy.
 */

const NEON = 'postgresql://user:pw@ep-cool-name-123456.eu-central-1.aws.neon.tech/db';
const NEON_POOLED = 'postgresql://user:pw@ep-cool-name-123456-pooler.eu-central-1.aws.neon.tech/db';
const LOCAL = 'postgresql://postgres@127.0.0.1:5432/satzwerk';
const OTHER = 'postgresql://user:pw@db.supabase.co:5432/postgres';

describe('choosing a transport', () => {
  it('uses HTTP for Neon, which is what a serverless function wants', () => {
    expect(chooseTransport(NEON, {})).toBe('http');
  });

  it('also uses HTTP for the pooler endpoint, which is still Neon', () => {
    // Worth pinning: the pooler hostname is easy to mistake for a way of
    // reaching the TCP path, and it is not one.
    expect(chooseTransport(NEON_POOLED, {})).toBe('http');
  });

  it('uses TCP for anything else', () => {
    expect(chooseTransport(LOCAL, {})).toBe('tcp');
    expect(chooseTransport(OTHER, {})).toBe('tcp');
  });

  it('is not fooled by a lookalike hostname', () => {
    expect(chooseTransport('postgresql://u@neon.tech.evil.example/db', {})).toBe('tcp');
    expect(chooseTransport('postgresql://u@notneon.tech/db', {})).toBe('tcp');
    // A genuine subdomain, and the bare domain, both count.
    expect(chooseTransport('postgresql://u@neon.tech/db', {})).toBe('http');
  });

  it('falls back to TCP when the URL cannot be parsed at all', () => {
    expect(chooseTransport('not-a-url', {})).toBe('tcp');
  });

  it('lets the environment force either transport', () => {
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: 'tcp' } as NodeJS.ProcessEnv)).toBe('tcp');
    expect(chooseTransport(LOCAL, { SATZWERK_PG_TRANSPORT: 'http' } as NodeJS.ProcessEnv)).toBe('http');
    // Tolerant of the shape a copy-paste into a settings box tends to have.
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: ' TCP ' } as NodeJS.ProcessEnv)).toBe('tcp');
  });

  it('refuses a misspelled override rather than silently ignoring it', () => {
    // Silently falling back would mean someone sets "postgres" as a value,
    // sees no change, and has no idea why.
    expect(() =>
      chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: 'postgres' } as NodeJS.ProcessEnv),
    ).toThrow(/must be "tcp" or "http"/);
  });

  it('ignores an empty value, so a blank settings box is not an error', () => {
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: '' } as NodeJS.ProcessEnv)).toBe('http');
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: '   ' } as NodeJS.ProcessEnv)).toBe('http');
  });
});
