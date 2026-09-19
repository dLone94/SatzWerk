/**
 * Every API URL, by file-system routing.
 *
 * Two lines on purpose. The implementation is in `server/vercel.ts`; this file
 * exists only to claim a set of URLs, and its name is the only thing here that
 * does any work.
 *
 * `api/index.ts` claims the same handler by a different route, because which
 * URLs a filename actually captures is the platform's decision and has been
 * wrong once already: named `[[...path]].ts` — Next.js's syntax — it answered
 * /api/session and silently matched nothing at all for
 * /api/lessons/<id>/sections/<id>. Two entrypoints and one rewrite mean no
 * single guess about that has to be right.
 */
export { default } from '../server/vercel.ts';

/**
 * `maxDuration` matters more than it looks. The platform default is short, and
 * the database timeouts inside have to fire *within* it — otherwise the
 * function is killed mid-connect and the caller gets a platform error page or
 * nothing at all, instead of a sentence saying what failed. Also set in
 * `vercel.json`, which is the setting the platform certainly reads.
 */
export const config = { maxDuration: 30 };
