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
  it('uses TCP by default, including for Neon', () => {
    // Neon's HTTP driver was the default until it hung a real deployment: its
    // one-shot endpoint cannot run the migrations, so those fell through to a
    // WebSocket pool that never connected, and the app sat on "Loading"
    // forever. TCP is the path the parity tests cover against real Postgres.
    expect(chooseTransport(NEON, {})).toBe('tcp');
    expect(chooseTransport(NEON_POOLED, {})).toBe('tcp');
    expect(chooseTransport(LOCAL, {})).toBe('tcp');
    expect(chooseTransport(OTHER, {})).toBe('tcp');
  });

  it('does not throw on a URL it cannot parse', () => {
    expect(chooseTransport('not-a-url', {})).toBe('tcp');
  });

  it('lets the environment opt back into HTTP', () => {
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: 'http' } as NodeJS.ProcessEnv)).toBe('http');
    expect(chooseTransport(LOCAL, { SATZWERK_PG_TRANSPORT: 'http' } as NodeJS.ProcessEnv)).toBe('http');
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: 'tcp' } as NodeJS.ProcessEnv)).toBe('tcp');
    // Tolerant of the shape a copy-paste into a settings box tends to have.
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: ' HTTP ' } as NodeJS.ProcessEnv)).toBe('http');
  });

  it('refuses a misspelled override rather than silently ignoring it', () => {
    // Silently falling back would mean someone sets "postgres" as a value,
    // sees no change, and has no idea why.
    expect(() =>
      chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: 'postgres' } as NodeJS.ProcessEnv),
    ).toThrow(/must be "tcp" or "http"/);
  });

  it('ignores an empty value, so a blank settings box is not an error', () => {
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: '' } as NodeJS.ProcessEnv)).toBe('tcp');
    expect(chooseTransport(NEON, { SATZWERK_PG_TRANSPORT: '   ' } as NodeJS.ProcessEnv)).toBe('tcp');
  });
});
