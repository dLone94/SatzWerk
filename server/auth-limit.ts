import { verifyPassword } from './auth.ts';
import type { Db } from './db.ts';

/**
 * How many wrong passwords somebody gets.
 *
 * The password is the only thing between a public URL and the learner's data,
 * and login used to take guesses without limit: no count, no delay, the right
 * password accepted straight after any number of wrong ones. Each guess also
 * cost the server a 64MB, ~200ms scrypt run, so a burst of them was a way to
 * stall it as well.
 *
 * The count lives in the database, in the `meta` table, because on Vercel
 * every request may land on a different short-lived instance and a counter in
 * memory would reset whenever it pleased. It is kept two ways:
 *
 *  - per client address: five free tries (typos happen), then a wait that
 *    doubles with each further miss, from 30 seconds up to 15 minutes;
 *  - for everybody together, because an attacker can change address. That one
 *    starts later and each wait is at most a minute. It is not a promise that
 *    the real learner gets in soon, though: one wrong password a minute keeps
 *    it going for as long as the sender likes. That is the price of the limit
 *    meaning anything against many addresses, and it is bearable because a
 *    device that is already signed in is not affected at all — its cookie
 *    never comes here.
 *
 * While a wait is in force the password is not even checked, so a blocked
 * guess costs no scrypt. A right password clears its address's count.
 */

export const LOGIN_LIMITS = {
  /** A quiet spell this long forgets the misses before it. */
  windowMs: 15 * 60_000,
  perClient: { free: 5, firstWaitMs: 30_000, maxWaitMs: 15 * 60_000 },
  everyone: { free: 50, firstWaitMs: 5_000, maxWaitMs: 60_000 },
  /** Checks running at once in one process. Each one holds 64MB. */
  concurrent: 2,
} as const;

const PREFIX = 'login_fail:';
const EVERYONE = `${PREFIX}*`;

interface Tally {
  /** When the misses are forgotten. First, zero-padded, so rows sort by it. */
  resetAt: number;
  count: number;
  lockedUntil: number;
}

function keyFor(client: string | undefined): string {
  return `${PREFIX}${(client ?? '').trim().toLowerCase() || 'unknown'}`;
}

function parse(value: string | undefined, now: number): Tally {
  const [resetAt, count, lockedUntil] = (value ?? '').split(':').map(Number);
  if (!resetAt || !Number.isFinite(resetAt) || resetAt <= now) return { resetAt: 0, count: 0, lockedUntil: 0 };
  return { resetAt, count: count || 0, lockedUntil: lockedUntil || 0 };
}

function format(tally: Tally): string {
  return `${String(tally.resetAt).padStart(15, '0')}:${tally.count}:${tally.lockedUntil}`;
}

async function read(db: Db, key: string, now: number): Promise<Tally> {
  const row = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return parse(row?.value, now);
}

async function miss(
  db: Db,
  key: string,
  limits: { free: number; firstWaitMs: number; maxWaitMs: number },
  now: number,
): Promise<void> {
  const tally = await read(db, key, now);
  const count = tally.count + 1;
  // The wait starts with the miss that uses up the free tries, so the next
  // try after it is the one that is refused.
  const over = count - limits.free + 1;
  const wait = over > 0 ? Math.min(limits.firstWaitMs * 2 ** (over - 1), limits.maxWaitMs) : 0;
  const next: Tally = {
    count,
    lockedUntil: wait > 0 ? now + wait : 0,
    resetAt: Math.max(now + LOGIN_LIMITS.windowMs, now + wait),
  };
  await db.run(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value',
    key,
    format(next),
  );
}

/** How long this client must wait before its next try, in ms; 0 when it may try now. */
export async function loginWait(db: Db, client: string | undefined, now = Date.now()): Promise<number> {
  const [mine, everyone] = await Promise.all([read(db, keyFor(client), now), read(db, EVERYONE, now)]);
  return Math.max(mine.lockedUntil - now, everyone.lockedUntil - now, 0);
}

export async function recordLoginFailure(db: Db, client: string | undefined, now = Date.now()): Promise<void> {
  await miss(db, keyFor(client), LOGIN_LIMITS.perClient, now);
  await miss(db, EVERYONE, LOGIN_LIMITS.everyone, now);
  // Rows whose window has passed are dead weight; the padded resetAt at the
  // front of the value makes them easy to find.
  await db.run(
    'DELETE FROM meta WHERE key LIKE ? AND key <> ? AND value < ?',
    `${PREFIX}%`,
    EVERYONE,
    String(now).padStart(15, '0'),
  );
}

export async function clearLoginFailures(db: Db, client: string | undefined): Promise<void> {
  await db.run('DELETE FROM meta WHERE key = ?', keyFor(client));
}

let checking = 0;

/**
 * Check a password on behalf of a client, within the limits above.
 *
 * `true` or `false` is the verdict; a number is how many seconds to wait
 * before trying again, and `'busy'` means other checks were running — both
 * answered without looking at the password.
 */
export async function checkPassword(
  db: Db,
  client: string | undefined,
  password: string,
  stored: string,
  now = Date.now(),
): Promise<boolean | number | 'busy'> {
  const wait = await loginWait(db, client, now);
  if (wait > 0) return Math.ceil(wait / 1000);
  // A flood of parallel guesses would otherwise queue 64MB allocations behind
  // one another. Nobody signs in twice at the same moment, so a busy answer
  // costs a real person nothing.
  if (checking >= LOGIN_LIMITS.concurrent) return 'busy';
  checking += 1;
  let right: boolean;
  try {
    right = password.length > 0 && (await verifyPassword(password, stored));
  } finally {
    checking -= 1;
  }
  if (right) await clearLoginFailures(db, client);
  else await recordLoginFailure(db, client, now);
  return right;
}

/** The answer for a client that has to wait. */
export function tooManyTries(wait: number | 'busy'): {
  status: number;
  body: { error: string; retryAfter: number };
  headers: Record<string, string>;
} {
  // Being busy says nothing about this client's password, so it must not be
  // answered as if it had been wrong: it may well have been the right one.
  if (wait === 'busy') {
    return {
      status: 429,
      body: { error: 'Another sign-in is being checked. Try again in a second.', retryAfter: 1 },
      headers: { 'retry-after': '1' },
    };
  }
  const seconds = wait;
  const minutes = Math.ceil(seconds / 60);
  return {
    status: 429,
    body: {
      error:
        seconds < 60
          ? `Too many wrong passwords. Try again in ${seconds} second${seconds === 1 ? '' : 's'}.`
          : `Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      retryAfter: seconds,
    },
    headers: { 'retry-after': String(seconds) },
  };
}
