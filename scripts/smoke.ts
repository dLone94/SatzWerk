/**
 * Does the *deployed* app actually work?
 *
 * Every test in this repo calls the code directly. That is fast and it is
 * where the logic belongs — but it means the platform is never in the picture,
 * and the platform is what broke. In one afternoon a hosted SatzWerk failed
 * four separate ways while the whole suite stayed green:
 *
 *   1. the function crashed on boot, because a bundler hoisted an import of
 *      `node:sqlite` that the code was careful to load lazily;
 *   2. it hung forever, because the Neon HTTP driver's pool never settled;
 *   3. it could not find its database, because the connection string arrived
 *      under a variable name the code did not read;
 *   4. it answered `/api/session` perfectly and returned the platform's own
 *      404 page for `/api/lessons/<id>/sections/<id>`, because the function's
 *      *filename* only captured one path segment.
 *
 * None of those are visible from inside a unit test. All four are visible in
 * one HTTP request to the real thing, which is what this does.
 *
 * The interesting check is not "did it return 200" — an unauthenticated probe
 * is *supposed* to be refused. It is "did the answer come from our code at
 * all": a JSON body means the request reached the router, and the platform's
 * error pages are HTML or plain text. That distinction is exactly what was
 * missing.
 *
 * Usage:
 *   npm run smoke -- https://example.vercel.app
 *   SMOKE_PASSWORD=… npm run smoke -- https://example.vercel.app
 *
 * With a password it signs in and additionally proves the deep routes exist,
 * rather than only that they are guarded. Without one it still catches all
 * four failures above, which is why it needs no secret to be worth running.
 */

export interface Probe {
  path: string;
  method?: 'GET' | 'POST';
  /**
   * `health`   — must be our health payload.
   * `reached`  — any JSON answer proves the request got to our router.
   * `routed`   — must be a route we recognise, so 404 is a failure. Only
   *              meaningful once signed in.
   */
  expect: 'health' | 'reached' | 'routed';
  why: string;
}

export interface Seen {
  status: number;
  body: string;
  /** Lower-cased response headers. `x-satzwerk` is the one that matters. */
  headers: Record<string, string>;
}

export type Outcome =
  | { ok: true; note: string }
  | { ok: false; reason: string; blocked?: true };

/** The first readable line of a non-JSON body, for the failure message. */
export function firstLine(body: string): string {
  return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) || '(empty)';
}

/**
 * Vercel's access-control wall, which answers in place of the app.
 *
 * Worth naming specially. It is not a bug in the deployment — it is a setting
 * — and it looks like nothing else: an HTTP 200 carrying Vercel's own login
 * page, or a refusal on an endpoint that has no password of its own. Reported
 * as "not JSON" it sends you hunting for a fault that does not exist.
 */
function looksProtected(seen: Seen): boolean {
  if (seen.headers['x-vercel-protection'] || seen.headers['x-robots-tag'] === 'noindex') return true;
  return /zeit-theme|_vercel_sso|Vercel Authentication|vercel\.com\/sso/i.test(seen.body);
}

/**
 * `blocked` is not `failed`, and conflating them would make this check a liar.
 *
 * A deployment behind access control has not told us anything about the app —
 * the request never reached it. Reporting that as a failure blames code for a
 * setting, and it would go on doing so on every deployment until someone
 * changed the setting, which is how a check stops being read at all.
 *
 * So without a bypass token it is reported as "could not check", loudly and
 * with the remedy. *With* a token, hitting the wall anyway is a genuine
 * failure: the token is wrong, and the check really cannot do its job.
 */
export function judge(
  probe: Probe,
  seen: Seen,
  options: { bypassConfigured?: boolean } = {},
): Outcome {
  // The signature comes first, because everything else can be imitated. Only
  // this app sets it, so its absence means the answer is not the app's —
  // whatever the status code says and whether or not the body parses as JSON.
  if (seen.headers['x-satzwerk'] !== 'api') {
    if (looksProtected(seen)) {
      const reason =
        'answered by Vercel\'s access control, not the app. This deployment has Deployment Protection on, so it is only reachable by someone signed in to Vercel — a phone or another browser will meet the same wall. Turn it off for this environment, or set VERCEL_BYPASS_TOKEN here (Project Settings, Protection Bypass for Automation).';
      return options.bypassConfigured
        ? { ok: false, reason: `${reason} A bypass token is set here, so it is being rejected.` }
        : { ok: false, reason, blocked: true };
    }
    return {
      ok: false,
      reason: `HTTP ${seen.status} without the app's own response header, so this did not come from the app: ${firstLine(seen.body)}`,
    };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(seen.body) as unknown;
  } catch {
    return {
      ok: false,
      reason: `HTTP ${seen.status} and the body is not JSON: ${firstLine(seen.body)}`,
    };
  }

  const record = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

  if (probe.expect === 'health') {
    if (seen.status !== 200) return { ok: false, reason: `HTTP ${seen.status}, expected 200` };
    if (record.ok !== true) return { ok: false, reason: `answered JSON without ok:true` };
    return { ok: true, note: describeHealth(record) };
  }

  if (probe.expect === 'routed' && seen.status === 404) {
    return { ok: false, reason: 'our router does not know this path' };
  }

  // A 5xx is our code reporting a fault — reached, but not working.
  if (seen.status >= 500) {
    return { ok: false, reason: `HTTP ${seen.status}: ${String(record.error ?? firstLine(seen.body))}` };
  }

  return { ok: true, note: `HTTP ${seen.status} from the app` };
}

function describeHealth(record: Record<string, unknown>): string {
  const parts = [`node ${String(record.node ?? '?')}`, String(record.platform ?? 'unknown platform')];
  if (record.databaseUrl !== undefined) parts.push(`DATABASE_URL ${String(record.databaseUrl)}`);
  if (record.database !== undefined) parts.push(`database ${String(record.database)}`);
  return parts.join(', ');
}

/**
 * The probes.
 *
 * Deliberately includes paths of one, two, three and four segments. Depth is
 * what the filename bug turned on, and a suite of one-segment probes would
 * have passed happily while the app was unusable.
 */
export function probes(signedIn: boolean): Probe[] {
  const deep: Probe['expect'] = signedIn ? 'routed' : 'reached';
  return [
    { path: '/api/health', expect: 'health', why: 'the function runs at all' },
    { path: '/api/session', expect: 'reached', why: 'one segment, public' },
    { path: '/api/state', expect: deep, why: 'one segment, private' },
    { path: '/api/coach/status', expect: deep, why: 'two segments' },
    { path: '/api/lessons/pre-a1-u1-l1', expect: deep, why: 'two segments with an id' },
    {
      path: '/api/lessons/pre-a1-u1-l1/sections/u1l1-s1',
      method: 'POST',
      expect: deep,
      why: 'four segments — the shape that was returning a platform 404',
    },
    {
      path: '/api/reviews/ensure',
      method: 'POST',
      expect: deep,
      why: 'two segments, POST',
    },
  ];
}

/* ------------------------------------------------------------------ *
 * The runner
 * ------------------------------------------------------------------ */

const TIMEOUT_MS = 25_000;

/**
 * Getting past Deployment Protection, when it is on.
 *
 * Vercel protects preview deployments by default, which means an anonymous
 * check sees its login page rather than the app. The documented way through
 * for automation is this header, with a secret from the project's settings. No
 * token, no header: the check then reports the wall plainly instead of
 * pretending the app is broken.
 */
function bypassToken(): string | undefined {
  return (
    process.env.VERCEL_BYPASS_TOKEN?.trim() ||
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() ||
    undefined
  );
}

function bypassHeaders(): Record<string, string> {
  const token = bypassToken();
  return token ? { 'x-vercel-protection-bypass': token, 'x-vercel-set-bypass-cookie': 'false' } : {};
}

function readHeaders(response: Response): Record<string, string> {
  const out: Record<string, string> = {};
  response.headers.forEach((value, name) => {
    out[name.toLowerCase()] = value;
  });
  return out;
}

async function fetchProbe(base: string, probe: Probe, cookie?: string): Promise<Seen> {
  const response = await fetch(`${base}${probe.path}`, {
    method: probe.method ?? 'GET',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      ...bypassHeaders(),
      ...(cookie ? { cookie } : {}),
      ...(probe.method === 'POST' ? { 'content-type': 'application/json' } : {}),
    },
    // `targets` keeps /api/reviews/ensure from failing validation before it has
    // proved the point, which is that the request arrived.
    ...(probe.method === 'POST' ? { body: JSON.stringify({ targets: [] }) } : {}),
  });
  return { status: response.status, body: await response.text(), headers: readHeaders(response) };
}

/** Sign in, if a password was provided, and return the session cookie. */
async function signIn(base: string, password: string): Promise<string | undefined> {
  const response = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...bypassHeaders() },
    body: JSON.stringify({ password }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const cookie = response.headers.get('set-cookie');
  if (!response.ok || !cookie) return undefined;
  return cookie.split(';')[0];
}

async function main(): Promise<void> {
  const base = (process.argv[2] ?? process.env.SMOKE_URL ?? '').replace(/\/+$/, '');
  if (!base) {
    console.error('Usage: npm run smoke -- <base url>');
    process.exit(2);
  }

  const password = process.env.SMOKE_PASSWORD;
  let cookie: string | undefined;
  if (password) {
    cookie = await signIn(base, password);
    if (!cookie) {
      console.error('Could not sign in with SMOKE_PASSWORD, so the deep routes can only be checked as guarded.');
    }
  }

  console.log(`Smoke-testing ${base}${cookie ? ' (signed in)' : ''}`);
  const bypassConfigured = Boolean(bypassToken());
  let failed = 0;
  let blocked = 0;
  let blockedReason: string | undefined;
  for (const probe of probes(Boolean(cookie))) {
    let outcome: Outcome;
    try {
      outcome = judge(probe, await fetchProbe(base, probe, cookie), { bypassConfigured });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
      outcome = {
        ok: false,
        reason: timedOut
          ? `no answer within ${TIMEOUT_MS / 1000}s`
          : `could not be reached: ${(error as Error).message}`,
      };
    }
    const label = `${probe.method ?? 'GET'} ${probe.path}`;
    if (outcome.ok) {
      console.log(`  ok    ${label} — ${outcome.note}`);
    } else if (outcome.blocked) {
      blocked += 1;
      // The remedy is the same for all of them, so it is printed once below
      // rather than once per probe.
      blockedReason ??= outcome.reason;
      console.error(`  ??    ${label} — answered by access control, not the app`);
    } else {
      failed += 1;
      console.error(`  FAIL  ${label} (${probe.why})\n        ${outcome.reason}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} probe${failed === 1 ? '' : 's'} failed. The deployment is not serving the app.`);
    process.exit(1);
  }
  if (blocked > 0) {
    // Not a pass and not a failure. Nothing was learned about the app, which
    // is worth saying in as many words rather than implying either verdict.
    console.error(
      `\nCould not check this deployment: all ${blocked} probe${blocked === 1 ? '' : 's'} were answered before reaching the app. Nothing here says whether the app works.\n\n${blockedReason ?? ''}`,
    );
    return;
  }
  console.log('\nAll probes answered from the app.');
}

// Only when run directly, so the tests can import the pure parts above.
if (process.argv[1]?.endsWith('smoke.ts')) await main();
