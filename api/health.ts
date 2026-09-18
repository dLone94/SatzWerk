/**
 * The smallest possible proof that this deployment runs code at all.
 *
 * This file imports nothing. Not the router, not the database, not a type from
 * another module — nothing that a bundler could hoist, nothing that could
 * throw while loading, nothing that could wait on a network. If a request to
 * /api/health does not come back, the fault is not in SatzWerk's code, because
 * there is no SatzWerk code in the path: it is the deployment itself — the
 * route not reaching a function, or protection sitting in front of it, or the
 * runtime failing to boot.
 *
 * That distinction is the entire point. "The app shows Loading forever" is
 * indistinguishable from the outside between a dead function and a live
 * function that cannot reach its database, and those have nothing in common as
 * fixes. One request here separates them.
 *
 * It is public on purpose, so it can be opened in a browser with no session,
 * and it therefore reports only the *shape* of the configuration: whether the
 * variables exist, never what is in them. No connection string, no secret.
 *
 * Duplicating the two calling conventions from `[[...path]].ts` instead of
 * sharing them is deliberate, and is the only duplication here worth having:
 * an import would be a dependency, and having no dependencies is the feature.
 */

interface MinimalServerResponse {
  writeHead: (status: number, headers: Record<string, string>) => unknown;
  end: (body: string) => unknown;
  setHeader: (name: string, value: string) => unknown;
}

export const config = { maxDuration: 10 };

export default function handler(_request: unknown, response?: unknown): Response | void {
  const env = process.env;

  /**
   * The *names* of the variables here that could hold a database connection,
   * and nothing else about them.
   *
   * "DATABASE_URL is not set" is true but incomplete, and the difference
   * matters: a variable saved for Production only, a typo in the name, and a
   * database added through Vercel's dashboard (which creates POSTGRES_URL or
   * DATABASE_URL_UNPOOLED instead) all produce that same sentence, and have
   * three different fixes. A list of what is actually visible tells them
   * apart at a glance.
   *
   * Names only. A connection string is a live password, and this URL needs
   * none to open, so no value from the environment is ever reported here.
   */
  const databaseVariables = Object.keys(env)
    .filter((name) => /DATABASE|POSTGRES|NEON|^PG[A-Z]*$/.test(name))
    .filter((name) => (env[name] ?? '').trim().length > 0)
    .sort();

  const body = JSON.stringify({
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    // Set by Vercel itself. Its absence means this is not running where we
    // think it is.
    platform: env.VERCEL ? `vercel:${env.VERCEL_ENV ?? 'unknown'}` : 'other',
    // The variable people most often set for only one environment. Preview and
    // Production are configured separately, and a missing one looks exactly
    // like a broken database from the browser. "blank" is its own answer
    // because a variable saved with an empty value is not the same mistake as
    // one that was never saved, and reporting it as set would be a lie.
    databaseUrl:
      env.DATABASE_URL === undefined
        ? 'missing'
        : env.DATABASE_URL.trim().length > 0
          ? 'set'
          : 'blank',
    databaseVariables,
    passwordHash: env.SATZWERK_PASSWORD_HASH ? 'set' : 'not set',
  });
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  };

  const node = response as MinimalServerResponse | undefined;
  if (node && typeof node.setHeader === 'function') {
    node.writeHead(200, headers);
    node.end(body);
    return;
  }
  return new Response(body, { status: 200, headers });
}
