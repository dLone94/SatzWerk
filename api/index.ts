/**
 * The same API, reached by an explicit rewrite rather than by a filename.
 *
 * `vercel.json` sends anything under /api/ that no other route claims here,
 * passing the original path in `__path`. That is the one routing mechanism in
 * this project that does not depend on how a platform interprets brackets in
 * a filename, which is why it exists: a 404 from the router is invisible to
 * every test, because tests call the handler directly.
 */
export { default } from '../server/vercel.ts';

export const config = { maxDuration: 30 };
