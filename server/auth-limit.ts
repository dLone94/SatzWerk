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
 *
 * A try is counted before its password is checked, with the count read and
 * written under a row lock. Checking first and counting afterwards let every
 * guess that arrived while the count was still under five through to the
 * check, and two misses written at the same moment, each from a count read
 * before the other wrote, counted as one — so on several instances at once the
 * limit was a suggestion. The everyone count therefore counts every password
 * checked, a right one included; a household signing in is a few tries a day
 * against fifty.
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

/** The tally after one more miss: the count, and the wait that follows it. */
function missed(
  tally: Tally,
  limits: { free: number; firstWaitMs: number; maxWaitMs: number },
  now: number,
): Tally {
  const count = tally.count + 1;
  // The wait starts with the miss that uses up the free tries, so the next
  // try after it is the one that is refused.
  const over = count - limits.free + 1;
  const wait = over > 0 ? Math.min(limits.firstWaitMs * 2 ** (over - 1), limits.maxWaitMs) : 0;
  return {
    count,
    lockedUntil: wait > 0 ? now + wait : 0,
    resetAt: Math.max(now + LOGIN_LIMITS.windowMs, now + wait),
  };
}

/**
 * Lock a count's row for the rest of the transaction, creating it first if it
 * is not there yet: a row that does not exist cannot be locked, and two first
 * misses would both start from nothing. On Postgres the lock is a SELECT …
 * FOR UPDATE rather than a write: a guess refused during a flood then writes
 * nothing at all, where an UPDATE to take the lock left a dead row version and
 * WAL behind every one. SQLite has no FOR UPDATE and needs none — its
 * transactions already run one at a time.
 */
async function lockRow(db: Db, key: string): Promise<void> {
  await db.run('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING', key, '');
  if (db.dialect === 'postgres') await db.get('SELECT key FROM meta WHERE key = ? FOR UPDATE', key);
}

/**
 * Claim one try for this client: 0 when it may check a password now — the try
 * is already counted as a miss — or how many ms it must wait first, in which
 * case nothing is counted.
 *
 * The client's row is locked before everybody's, by every caller, so two
 * claims can never each hold the row the other is waiting for.
 */
async function claimTry(db: Db, client: string | undefined, now: number): Promise<number> {
  const mineKey = keyFor(client);
  const wait = await db.transaction(async () => {
    await lockRow(db, mineKey);
    await lockRow(db, EVERYONE);
    const mine = await read(db, mineKey, now);
    const everyone = await read(db, EVERYONE, now);
    const waiting = Math.max(mine.lockedUntil - now, everyone.lockedUntil - now, 0);
    if (waiting > 0) return waiting;
    const save = (key: string, tally: Tally) => db.run('UPDATE meta SET value = ? WHERE key = ?', format(tally), key);
    await save(mineKey, missed(mine, LOGIN_LIMITS.perClient, now));
    await save(EVERYONE, missed(everyone, LOGIN_LIMITS.everyone, now));
    return 0;
  });
  // Rows whose window has passed are dead weight; the padded resetAt at the
  // front of the value makes them easy to find.
  await db.run(
    'DELETE FROM meta WHERE key LIKE ? AND key <> ? AND value < ?',
    `${PREFIX}%`,
    EVERYONE,
    String(now).padStart(15, '0'),
  );
  return wait;
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
  // A flood of parallel guesses would otherwise queue 64MB allocations behind
  // one another. Nobody signs in twice at the same moment, so a busy answer
  // costs a real person nothing — and it is given before anything is counted,
  // because it says nothing about this client's password.
  if (checking >= LOGIN_LIMITS.concurrent) return 'busy';
  checking += 1;
  try {
    const wait = await claimTry(db, client, now);
    if (wait > 0) return Math.ceil(wait / 1000);
    const right = password.length > 0 && (await verifyPassword(password, stored));
    // Counted as a miss already; a right one takes its address's count away.
    if (right) await clearLoginFailures(db, client);
    return right;
  } finally {
    checking -= 1;
  }
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
