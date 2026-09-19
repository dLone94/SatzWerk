import { describe, expect, it } from 'vitest';
import { firstLine, judge, probes, type Probe } from '../../scripts/smoke.ts';

/**
 * The judgement the smoke test makes.
 *
 * Its whole value is one distinction: did this answer come from our code, or
 * from the platform? Every hosting failure this project has actually had looked
 * like a plausible HTTP response and was in fact a crash page, a platform 404
 * or nothing at all. So the rule is tested against the real bodies those
 * failures produced.
 */

/** An answer from the app: it carries the app's own response header. */
const seen = (status: number, body: string) => ({
  status,
  body,
  headers: { 'x-satzwerk': 'api', 'content-type': 'application/json' },
});

/** An answer from something else: the header is what it cannot fake. */
const fromElsewhere = (status: number, body: string, headers: Record<string, string> = {}) => ({
  status,
  body,
  headers,
});
const probe = (expect: Probe['expect']): Probe => ({ path: '/api/x', expect, why: 'test' });

describe('judging a probe', () => {
  it('fails a body that is not JSON, however plausible the status', () => {
    // Vercel's crashed-function page, verbatim in shape.
    const outcome = judge(
      probe('reached'),
      fromElsewhere(500, 'A server error has occurred\n\nFUNCTION_INVOCATION_FAILED'),
    );
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.reason).toContain('A server error has occurred');
  });

  it('fails the platform 404 page — the failure that took two rounds to find', () => {
    const outcome = judge(
      probe('reached'),
      fromElsewhere(404, 'The page could not be found\n\nNOT_FOUND iad1::abc'),
    );
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.reason).toContain('NOT_FOUND');
  });

  it('fails an HTML page, which is what an SSO redirect or the SPA shell looks like', () => {
    const outcome = judge(
      probe('reached'),
      fromElsewhere(200, '<!doctype html><title>SatzWerk</title><body>…'),
    );
    expect(outcome.ok).toBe(false);
  });

  it('passes a refusal, because being guarded proves the router answered', () => {
    const outcome = judge(probe('reached'), seen(401, JSON.stringify({ error: 'Not signed in.' })));
    expect(outcome.ok).toBe(true);
  });

  it('fails a 404 from our own router when signed in, since the route should exist', () => {
    const outcome = judge(probe('routed'), seen(404, JSON.stringify({ error: 'Not found' })));
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.reason).toContain('router does not know');
  });

  it('fails a 5xx even though it is JSON, and quotes what the app said', () => {
    const outcome = judge(
      probe('reached'),
      seen(503, JSON.stringify({ error: 'The server cannot reach its database: timeout.' })),
    );
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.reason).toContain('cannot reach its database');
  });

  it('requires health to actually say it is healthy', () => {
    expect(judge(probe('health'), seen(200, JSON.stringify({ ok: true, node: 'v24.0.0' }))).ok).toBe(true);
    expect(judge(probe('health'), seen(200, JSON.stringify({ ok: false }))).ok).toBe(false);
    expect(judge(probe('health'), seen(503, JSON.stringify({ ok: true }))).ok).toBe(false);
  });

  it('reports what health said, so a passing run still shows the configuration', () => {
    const outcome = judge(
      probe('health'),
      seen(200, JSON.stringify({ ok: true, node: 'v24.20.0', platform: 'vercel:production', databaseUrl: 'set' })),
    );
    expect(outcome.ok === true && outcome.note).toContain('vercel:production');
    expect(outcome.ok === true && outcome.note).toContain('DATABASE_URL set');
  });
});

describe('the probes', () => {
  it('covers one, two and four path segments', () => {
    // Depth is the point. A suite of one-segment probes passed while the app
    // was unusable, because the filename only captured one segment.
    const depths = probes(false).map((p) => p.path.split('/').filter(Boolean).length - 1);
    expect(depths).toContain(1);
    expect(depths).toContain(2);
    expect(Math.max(...depths)).toBeGreaterThanOrEqual(4);
  });

  it('demands real routes only once signed in, and guarded ones otherwise', () => {
    expect(probes(false).some((p) => p.expect === 'routed')).toBe(false);
    expect(probes(true).some((p) => p.expect === 'routed')).toBe(true);
    // Health never depends on a session either way.
    for (const signedIn of [true, false]) {
      expect(probes(signedIn)[0]).toMatchObject({ path: '/api/health', expect: 'health' });
    }
  });
});

describe('firstLine', () => {
  it('strips tags and collapses whitespace, so a page becomes one readable line', () => {
    expect(firstLine('<html>\n  <body>  Nope   </body>\n</html>')).toBe('Nope');
  });

  it('says so rather than nothing when the body is empty', () => {
    expect(firstLine('   ')).toBe('(empty)');
  });
});

/**
 * The flaw this check had on its very first real run.
 *
 * It probed a protected deployment, got Vercel's login page, and reported
 * five failures as "not JSON" — while two probes *passed*, because the wall's
 * own refusal happened to be JSON and the check had no way to tell whose JSON
 * it was. A platform can produce anything a server can, so the test is no
 * longer "does this look like an answer" but "is this answer ours".
 */
describe('telling our answer from the platform’s', () => {
  it('fails a JSON refusal that is not ours, however convincing', () => {
    // Exactly the shape that slipped through: right status, valid JSON, wrong
    // author.
    const outcome = judge(probe('reached'), fromElsewhere(401, JSON.stringify({ error: 'Unauthorized' })));
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.reason).toContain("without the app's own response header");
  });

  it('reports protection as unable-to-check, not as a failing app', () => {
    // The app never saw the request, so neither verdict would be honest. On
    // every future deployment this would otherwise cry wolf about a setting.
    const page = '<html><script>(function ar(a,b){localStorage.getItem("zeit-theme")})</script>';
    const outcome = judge(probe('health'), fromElsewhere(200, page));
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.blocked).toBe(true);
  });

  it('calls it a failure when a bypass token is set and still rejected', () => {
    const page = '<html><script>(function ar(a,b){localStorage.getItem("zeit-theme")})</script>';
    const outcome = judge(probe('health'), fromElsewhere(200, page), { bypassConfigured: true });
    expect(outcome.ok === false && outcome.blocked).toBeUndefined();
    expect(outcome.ok === false && outcome.reason).toContain('being rejected');
  });

  it('never calls an ordinary platform error merely unable-to-check', () => {
    // A crash page is a failure. Only access control is inconclusive.
    const outcome = judge(probe('reached'), fromElsewhere(500, 'A server error has occurred'));
    expect(outcome.ok === false && outcome.blocked).toBeUndefined();
  });

  it('names Deployment Protection rather than blaming the app', () => {
    // Vercel's login page, identified by its own theme script.
    const page = '<html><script>(function ar(a,b){localStorage.getItem("zeit-theme")})</script>';
    const outcome = judge(probe('health'), fromElsewhere(200, page));
    expect(outcome.ok).toBe(false);
    const reason = outcome.ok === false ? outcome.reason : '';
    expect(reason).toContain('Deployment Protection');
    // And says what to do about it, both ways.
    expect(reason).toContain('VERCEL_BYPASS_TOKEN');
    expect(reason).toMatch(/phone|another browser/);
  });

  it('recognises the wall by header as well as by page content', () => {
    const outcome = judge(probe('reached'), fromElsewhere(401, '{}', { 'x-robots-tag': 'noindex' }));
    expect(outcome.ok === false && outcome.reason).toContain('Deployment Protection');
  });

  it('accepts an answer that carries the signature, refusal and all', () => {
    expect(judge(probe('reached'), seen(401, JSON.stringify({ error: 'Not signed in.' }))).ok).toBe(true);
  });
});
