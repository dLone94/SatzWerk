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
  request: { method: string; url: string; mode?: string; headers: Headers };
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
      // A fresh copy each time, as a real cache hands back.
      match: async (request: { url: string } | string) => store.get(key(request))?.clone(),
      put: async (request: { url: string } | string, response: Response) => {
        // As a real browser does: a partial response cannot be stored.
        if (response.status === 206) throw new TypeError('Partial response (status code 206) is unsupported');
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
      delete: async (request: { url: string } | string) => store.delete(key(request)),
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
          if (hit) return hit.clone();
        }
        return undefined;
      },
    },
  };
}

interface Harness {
  message: (data: unknown) => Promise<unknown>;
  fire: (type: 'install' | 'activate') => Promise<void>;
  request: (
    input: { method?: string; url: string; mode?: string; headers?: Record<string, string> },
  ) => Promise<{ handled: boolean; response?: Response; error?: unknown }>;
  /** Everything the worker asked to be kept alive for after answering. */
  background: () => Promise<unknown>;
  caches: ReturnType<typeof cacheStorage>;
  fetch: ReturnType<typeof vi.fn>;
  claimed: () => boolean;
}

function load(
  network: (url: string, headers?: Headers) => Response | Promise<Response> | Promise<never>,
): Harness {
  const listeners = new Map<string, (event: unknown) => void>();
  const store = cacheStorage(network as (url: string) => Response | Promise<Response>);
  let claimed = false;
  const kept: Array<Promise<unknown>> = [];

  const fetchStub = vi.fn(async (input: string | { url: string; headers?: Headers }) => {
    const url = typeof input === 'string' ? new URL(input, 'https://satzwerk.test').toString() : input.url;
    const response = await network(url, typeof input === 'string' ? undefined : input.headers);
    // What a browser reports for a same-origin fetch; a bare Response says
    // "default", and the worker would never keep anything at all.
    Object.defineProperty(response, 'type', { value: 'basic' });
    return response;
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
    async message(data) {
      let result: unknown;
      const waits: Promise<unknown>[] = [];
      listeners.get('message')?.({ data, ports: [{ postMessage: (reply: unknown) => { result = reply; } }], waitUntil: (work: Promise<unknown>) => waits.push(work) });
      await Promise.all(waits);
      return result;
    },
    caches: store,
    fetch: fetchStub,
    claimed: () => claimed,
    background: () => Promise.all(kept),
    async fire(type) {
      const waits: Array<Promise<unknown>> = [];
      listeners.get(type)?.({ waitUntil: (value: Promise<unknown>) => waits.push(value) });
      await Promise.all(waits);
    },
    async request({ method = 'GET', url, mode, headers = {} }) {
      let answered: Promise<unknown> | undefined;
      const event: FetchEvent = {
        request: { method, url: new URL(url, 'https://satzwerk.test').toString(), mode, headers: new Headers(headers) },
        respondWith: (value) => {
          answered = value;
        },
        waitUntil: (value) => {
          kept.push(value);
        },
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
  it('automatically downloads only startup assets and saves one level on request', async () => {
    const manifest = { files: ['/assets/start.js', '/assets/a1.js', '/assets/b2.js'], precache: ['/assets/start.js'],
      groups: { a1: { files: ['/assets/a1.js'] }, unsafe: { files: ['/api/state'] } } };
    const worker = load(url => url.endsWith('/asset-manifest.json') ? ok(JSON.stringify(manifest)) : ok('asset'));
    await worker.fire('install');
    await worker.fire('activate');
    expect(await heldPaths(worker)).toContain('/assets/start.js');
    expect(await heldPaths(worker)).not.toContain('/assets/a1.js');
    expect(await worker.message({ type: 'SAVE_LEVEL', level: 'a1' })).toEqual({ ok: true });
    expect(await heldPaths(worker)).toContain('/assets/a1.js');
    expect(await heldPaths(worker)).not.toContain('/assets/b2.js');
    expect(await worker.message({ type: 'SAVE_LEVEL', level: 'unsafe' })).toEqual({ ok: false });
    expect(await heldPaths(worker)).not.toContain('/api/state');
    expect(await worker.message({ type: 'SAVE_LEVEL', level: 'missing' })).toEqual({ ok: false });
  });
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

/*
 * Safari plays audio by asking for it in byte ranges, and the server answers
 * 206 Partial Content. The worker tried to store that 206, which a browser
 * refuses, so the whole request failed: every recording errored and the app
 * quietly fell back to the phone's own voice. On an iPhone, "Thorsten" was
 * never heard at all.
 */
describe('a recording asked for in pieces, as Safari does', () => {
  const CLIP = 'ABCDEFGHIJ';
  const byteServer = (url: string, headers?: Headers) => {
    if (url.endsWith('/asset-manifest.json')) return ok(JSON.stringify({ files: [] }));
    const range = headers?.get('range');
    if (range) {
      const [, from, to] = /bytes=(\d+)-(\d*)/.exec(range)!;
      const end = to ? Number(to) : CLIP.length - 1;
      return new Response(CLIP.slice(Number(from), end + 1), {
        status: 206,
        headers: { 'Content-Range': `bytes ${from}-${end}/${CLIP.length}`, 'Content-Type': 'audio/mpeg' },
      });
    }
    return new Response(CLIP, { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
  };

  it('plays the piece that was asked for', async () => {
    const worker = load(byteServer);
    const result = await worker.request({ url: '/audio/de/abc.mp3', headers: { range: 'bytes=0-1' } });
    expect(result.error).toBeUndefined();
    expect(result.response!.status).toBe(206);
    expect(result.response!.headers.get('Content-Range')).toBe('bytes 0-1/10');
    expect(await result.response!.text()).toBe('AB');
  });

  it('keeps the whole clip, so the next piece comes from the phone even offline', async () => {
    let online = true;
    const worker = load((url, headers) => (online ? byteServer(url, headers) : offline()));
    await worker.request({ url: '/audio/de/abc.mp3', headers: { range: 'bytes=0-1' } });
    online = false;
    const later = await worker.request({ url: '/audio/de/abc.mp3', headers: { range: 'bytes=2-' } });
    expect(later.error).toBeUndefined();
    expect(later.response!.status).toBe(206);
    expect(await later.response!.text()).toBe('CDEFGHIJ');
  });

  it('never lets a partial answer break a request it cannot store', async () => {
    const worker = load((url) =>
      url.endsWith('/asset-manifest.json')
        ? ok(JSON.stringify({ files: [] }))
        : new Response('part', { status: 206, headers: { 'Content-Range': 'bytes 0-3/10' } }),
    );
    const result = await worker.request({ url: '/assets/app-abc123.js' });
    expect(result.error).toBeUndefined();
    expect(result.response!.status).toBe(206);
  });
});


/** Every key the worker holds, as paths. */
async function heldPaths(worker: Harness): Promise<string[]> {
  return [...worker.caches.stores.values()].flatMap((store) => [...store.keys()]).map((url) => new URL(url).pathname);
}

/*
 * A weak signal opened a blank screen.
 *
 * Pages were network-first with no deadline. With bars on the phone but no
 * data arriving — the U-Bahn, a captive wifi — the worker's fetch just waited,
 * and the Home Screen app showed no document at all for as long as the
 * network took to give up.
 */
describe('opening the app on a signal that carries nothing', () => {
  it('answers from the cache after a short wait, and updates it when the network answers', async () => {
    await sw.fire('install');
    let answer: (response: Response) => void = () => {};
    const stalled = load((url) => {
      if (url.endsWith('/asset-manifest.json')) return ok(JSON.stringify({ files: ['/assets/app-abc123.js'] }));
      return new Promise<Response>((resolve) => {
        answer = resolve;
      });
    });
    stalled.caches.stores.set('satzwerk-app-v1', sw.caches.stores.get('satzwerk-app-v1')!);

    vi.useFakeTimers();
    try {
      const pending = stalled.request({ url: '/lesson/pre-a1-u1-l1', mode: 'navigate' });
      await vi.advanceTimersByTimeAsync(3_500);
      const result = await pending;
      expect(result.error).toBeUndefined();
      expect(await result.response!.text()).toContain('/index.html');
    } finally {
      vi.useRealTimers();
    }

    // The network answers late; the next open gets what it said.
    answer(ok('the new shell'));
    await stalled.background();
    const shell = await stalled.caches.api.match('/index.html');
    expect(await shell!.text()).toBe('the new shell');
  });

  it('still waits for the network on a first visit, when nothing is held', async () => {
    const slow = load(
      (url) => new Promise<Response>((resolve) => setTimeout(() => resolve(served([])(url)), 3_200)),
    );
    vi.useFakeTimers();
    try {
      const pending = slow.request({ url: '/', mode: 'navigate' });
      await vi.advanceTimersByTimeAsync(4_000);
      const result = await pending;
      expect(result.error).toBeUndefined();
      expect(result.response!.status).toBe(200);
    } finally {
      vi.useRealTimers();
    }
  });
});

/*
 * Old builds were never removed, and offline the app could open a weeks-old
 * version.
 *
 * sw.js does not change between deploys, so the cache was never replaced:
 * every deploy's bundle stayed in it, each visited route kept its own copy of
 * the page, and the offline fallback '/index.html' was the copy from the day
 * the worker was installed — which loaded the old bundle, still in the cache.
 */
describe('a new deploy', () => {
  const deploy = (files: string[], shell: string) => (url: string) => {
    if (url.endsWith('/asset-manifest.json')) return ok(JSON.stringify({ files }));
    if (new URL(url).pathname.startsWith('/assets/') || url.endsWith('.png') || url.endsWith('.webmanifest')) {
      return ok(`body of ${url}`);
    }
    return new Response(shell, { status: 200, headers: { 'Content-Type': 'text/html' } });
  };

  it('keeps one copy of the page, the newest, for every route', async () => {
    let network = deploy(['/assets/app-abc123.js'], 'shell one');
    const worker = load((url) => network(url));
    await worker.fire('install');

    network = deploy(['/assets/app-def456.js'], 'shell two');
    await worker.request({ url: '/lesson/pre-a1-u1-l1', mode: 'navigate' });
    await worker.background();

    expect(await heldPaths(worker)).not.toContain('/lesson/pre-a1-u1-l1');
    expect(await (await worker.caches.api.match('/index.html'))!.text()).toBe('shell two');

    // Offline, a route nobody visited opens the newest page.
    const dark = load(offline as unknown as (url: string) => Promise<never>);
    dark.caches.stores.set('satzwerk-app-v1', worker.caches.stores.get('satzwerk-app-v1')!);
    const result = await dark.request({ url: '/vocabulary', mode: 'navigate' });
    expect(await result.response!.text()).toBe('shell two');
  });

  it('sweeps the old build and fetches the whole new one, and leaves recordings alone', async () => {
    let network = deploy(['/assets/app-abc123.js', '/assets/app-abc123.css'], 'shell one');
    const worker = load((url) => network(url));
    await worker.fire('install');
    const cache = await worker.caches.api.open('satzwerk-app-v1');
    await cache.put({ url: 'https://satzwerk.test/audio/de/abc.mp3' }, ok('clip'));
    // A page copy an older worker kept per route.
    await cache.put(
      { url: 'https://satzwerk.test/review' },
      new Response('old shell', { status: 200, headers: { 'Content-Type': 'text/html' } }),
    );

    network = deploy(['/assets/app-def456.js', '/assets/app-def456.css'], 'shell two');
    await worker.request({ url: '/', mode: 'navigate' });
    await worker.background();

    const held = await heldPaths(worker);
    expect(held).not.toContain('/assets/app-abc123.js');
    expect(held).not.toContain('/assets/app-abc123.css');
    expect(held).not.toContain('/review');
    // The new build is all there for the next time there is no signal.
    expect(held).toContain('/assets/app-def456.js');
    expect(held).toContain('/assets/app-def456.css');
    expect(held).toContain('/audio/de/abc.mp3');
  });

  it('sweeps nothing when it cannot read the new build\'s list', async () => {
    let manifestUp = true;
    const worker = load((url) => {
      if (url.endsWith('/asset-manifest.json') && !manifestUp) return Promise.reject(new TypeError('offline'));
      return served(['/assets/app-abc123.js'])(url);
    });
    await worker.fire('install');
    manifestUp = false;
    await worker.request({ url: '/', mode: 'navigate' });
    await worker.background();
    expect(await heldPaths(worker)).toContain('/assets/app-abc123.js');
  });

  it('sweeps old files when a worker activates', async () => {
    const worker = load(served(['/assets/app-def456.js']));
    const cache = await worker.caches.api.open('satzwerk-app-v1');
    await cache.put({ url: 'https://satzwerk.test/assets/app-abc123.js' }, ok('old'));
    await worker.fire('activate');
    expect(await heldPaths(worker)).not.toContain('/assets/app-abc123.js');
  });
});
