import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The caching rules, run rather than read.
 *
 * The worker decides whether a learner in a tunnel sees SatzWerk or the
 * browser's "No internet" page — and, more importantly, whether they are ever
 * shown a number the database has not confirmed. That second one is why this
 * worker cached nothing at all for most of the app's life, so the rule it now
 * rests on deserves a test that executes it: `/api` is never cached and never
 * served from a cache, whatever else happens.
 *
 * The file is plain browser JavaScript, so it is loaded into a stubbed worker
 * global rather than imported. That keeps `public/sw.js` the single copy of
 * these rules: a second one written for the test could agree with itself while
 * both disagreed with what ships.
 */

const SOURCE = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');

interface FetchEvent {
  request: { method: string; url: string; mode?: string };
  respondWith: (value: Promise<unknown>) => void;
  waitUntil: (value: Promise<unknown>) => void;
}

/** Enough CacheStorage to be wrong in the ways that matter. */
function cacheStorage(network: (url: string) => Response | Promise<Response>) {
  const stores = new Map<string, Map<string, Response>>();
  const key = (request: { url: string } | string) =>
    typeof request === 'string' ? new URL(request, 'https://satzwerk.test').toString() : request.url;

  const open = async (name: string) => {
    const store = stores.get(name) ?? new Map<string, Response>();
    stores.set(name, store);
    return {
      match: async (request: { url: string } | string) => store.get(key(request)),
      put: async (request: { url: string } | string, response: Response) => {
        store.set(key(request), response);
      },
      add: async (url: string) => {
        // The worker's own network, not the machine's: these URLs exist only
        // inside this test.
        const response = await network(new URL(url, 'https://satzwerk.test').toString());
        if (!response.ok) throw new Error(`add failed for ${url}`);
        store.set(key(url), response);
      },
      keys: async () => [...store.keys()].map((url) => ({ url })),
    };
  };

  return {
    stores,
    api: {
      open,
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
      match: async (request: { url: string } | string) => {
        for (const store of stores.values()) {
          const hit = store.get(key(request));
          if (hit) return hit;
        }
        return undefined;
      },
    },
  };
}

interface Harness {
  fire: (type: 'install' | 'activate') => Promise<void>;
  request: (
    input: { method?: string; url: string; mode?: string },
  ) => Promise<{ handled: boolean; response?: Response; error?: unknown }>;
  caches: ReturnType<typeof cacheStorage>;
  fetch: ReturnType<typeof vi.fn>;
  claimed: () => boolean;
}

function load(network: (url: string) => Response | Promise<Response> | Promise<never>): Harness {
  const listeners = new Map<string, (event: unknown) => void>();
  const store = cacheStorage(network as (url: string) => Response | Promise<Response>);
  let claimed = false;

  const fetchStub = vi.fn(async (input: string | { url: string }) => {
    const url = typeof input === 'string' ? new URL(input, 'https://satzwerk.test').toString() : input.url;
    return network(url);
  });

  const self = {
    addEventListener: (type: string, handler: (event: unknown) => void) => listeners.set(type, handler),
    skipWaiting: () => undefined,
    clients: {
      claim: async () => {
        claimed = true;
      },
      matchAll: async () => [],
      openWindow: async () => undefined,
    },
    location: { origin: 'https://satzwerk.test' },
    registration: { showNotification: async () => undefined },
  };

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function('self', 'caches', 'fetch', 'Response', 'URL', SOURCE)(
    self,
    store.api,
    fetchStub,
    Response,
    URL,
  );

  return {
    caches: store,
    fetch: fetchStub,
    claimed: () => claimed,
    async fire(type) {
      const waits: Array<Promise<unknown>> = [];
      listeners.get(type)?.({ waitUntil: (value: Promise<unknown>) => waits.push(value) });
      await Promise.all(waits);
    },
    async request({ method = 'GET', url, mode }) {
      let answered: Promise<unknown> | undefined;
      const event: FetchEvent = {
        request: { method, url: new URL(url, 'https://satzwerk.test').toString(), mode },
        respondWith: (value) => {
          answered = value;
        },
        waitUntil: () => undefined,
      };
      listeners.get('fetch')?.(event as unknown);
      if (answered === undefined) return { handled: false };
      try {
        return { handled: true, response: (await answered) as Response };
      } catch (error) {
        return { handled: true, error };
      }
    },
  };
}

const ok = (body: string) => new Response(body, { status: 200 });
const offline = () => Promise.reject(new TypeError('Failed to fetch'));

/** A build's own manifest, which is what the worker precaches from. */
const served = (files: string[]) => (url: string) => {
  if (url.endsWith('/asset-manifest.json')) return ok(JSON.stringify({ files }));
  return ok(`body of ${url}`);
};

let sw: Harness;

beforeEach(() => {
  sw = load(served(['/assets/app-abc123.js', '/assets/app-abc123.css']));
});

describe('what the worker keeps', () => {
  it('precaches the app, including the files this build actually emitted', async () => {
    await sw.fire('install');
    const held = [...sw.caches.stores.values()].flatMap((store) => [...store.keys()]).map((url) => new URL(url).pathname);
    expect(held).toContain('/index.html');
    expect(held).toContain('/');
    // The names carry a content hash, so they cannot be written in the worker.
    expect(held).toContain('/assets/app-abc123.js');
    expect(held).toContain('/assets/app-abc123.css');
  });

  it('still installs when a file is missing, rather than caching nothing', async () => {
    const patchy = load((url) =>
      url.endsWith('/icon-512.png') ? Promise.reject(new Error('gone')) : served([])(url),
    );
    await patchy.fire('install');
    const held = [...patchy.caches.stores.values()].flatMap((s) => [...s.keys()]);
    expect(held.length).toBeGreaterThan(0);
  });

  it('sweeps the caches an older set of rules left behind', async () => {
    await sw.fire('install');
    await sw.caches.api.open('satzwerk-app-v0');
    await sw.caches.api.open('something-else');
    await sw.fire('activate');
    expect([...sw.caches.stores.keys()]).toEqual(['satzwerk-app-v1']);
    expect(sw.claimed()).toBe(true);
  });
});

describe('what the worker refuses to touch', () => {
  /**
   * The rule the whole feature rests on. A cached answer here would be a
   * statement about somebody's progress that the database never made.
   */
  it.each(['/api/state', '/api/session', '/api/learners', '/api'])(
    'leaves %s to the network entirely',
    async (path) => {
      await sw.fire('install');
      const result = await sw.request({ url: path });
      expect(result.handled, `${path} was intercepted`).toBe(false);
    },
  );

  it('does not answer an API request from the cache even when one was somehow stored', async () => {
    // Belt and braces: put a stale answer in by hand and check it is ignored.
    const cache = await sw.caches.api.open('satzwerk-app-v1');
    await cache.put({ url: 'https://satzwerk.test/api/state' }, ok('{"stats":{"streak":99}}'));
    const result = await sw.request({ url: '/api/state' });
    expect(result.handled).toBe(false);
  });

  it('ignores anything that is not a GET', async () => {
    expect((await sw.request({ method: 'POST', url: '/api/attempts' })).handled).toBe(false);
    expect((await sw.request({ method: 'POST', url: '/index.html' })).handled).toBe(false);
  });

  it('ignores another origin', async () => {
    expect((await sw.request({ url: 'https://example.invalid/thing.js' })).handled).toBe(false);
  });
});

describe('what the worker serves when there is no signal', () => {
  it('opens the app from the cache', async () => {
    await sw.fire('install');
    const dark = load(offline as unknown as (url: string) => Promise<never>);
    // Same cache contents, new network conditions.
    dark.caches.stores.set('satzwerk-app-v1', sw.caches.stores.get('satzwerk-app-v1')!);

    const result = await dark.request({ url: '/', mode: 'navigate' });
    expect(result.handled).toBe(true);
    expect(result.error).toBeUndefined();
    expect(await result.response!.text()).toContain('body of');
  });

  it('opens a route nobody visited while online', async () => {
    await sw.fire('install');
    const dark = load(offline as unknown as (url: string) => Promise<never>);
    dark.caches.stores.set('satzwerk-app-v1', sw.caches.stores.get('satzwerk-app-v1')!);

    // Never requested before, and the router is what resolves it once the
    // cached document is running.
    const result = await dark.request({ url: '/lesson/pre-a1-u1-l2', mode: 'navigate' });
    expect(result.handled).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('serves a hashed asset without asking the network at all', async () => {
    await sw.fire('install');
    sw.fetch.mockClear();
    const result = await sw.request({ url: '/assets/app-abc123.js' });
    expect(result.handled).toBe(true);
    expect(await result.response!.text()).toContain('body of');
    // A content-hashed file cannot have changed, so the round trip is waste.
    expect(sw.fetch).not.toHaveBeenCalled();
  });
});

describe('what the worker declines to keep', () => {
  it('does not cache a failed response', async () => {
    const failing = load((url) =>
      url.endsWith('/asset-manifest.json')
        ? ok(JSON.stringify({ files: [] }))
        : new Response('nope', { status: 500 }),
    );
    await failing.request({ url: '/something.js' });
    const held = [...failing.caches.stores.values()].flatMap((s) => [...s.keys()]);
    expect(held).toEqual([]);
  });
});
