// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SceneSpec } from '../../src/ui/three/sceneData.ts';

/**
 * The wooden scene component, where there is no WebGL (jsdom has none): it
 * shows what stood there before, and three.js is never even loaded. With a
 * stand-in engine it is also held to its promises about WebGL contexts: one
 * live scene per mount, every one given back, under StrictMode's double
 * mount and on a quick way off the page.
 */

const env = vi.hoisted(() => ({ webgl: false, reducedMotion: false, probes: 0, cores: undefined as number | undefined }));
const engine = vi.hoisted(() => ({
  mounted: [] as Array<{ spec: unknown; still: boolean; settled: number; disposed: boolean; ghosts: string[]; replays: number; lose: () => void }>,
  fail: false,
}));

// Loading three at all here is the bug.
vi.mock('three', () => {
  throw new Error('three was loaded outside the scene chunk');
});

vi.mock('../../src/ui/three/sceneMode.ts', async (original) => ({
  ...(await original<typeof import('../../src/ui/three/sceneMode.ts')>()),
  readHints: () => ({ reducedMotion: env.reducedMotion, hardwareConcurrency: env.cores }),
  canUseWebgl: () => {
    env.probes++;
    return env.webgl;
  },
}));

// The line is always quiet here; the wait itself is tested on its own.
vi.mock('../../src/services/loading.ts', () => ({ whenQuiet: () => Promise.resolve(), track: <T,>(work: Promise<T>) => work }));

vi.mock('../../src/ui/three/engine/index.ts', () => ({
  mountScene: (host: HTMLElement, spec: unknown, options: { still: boolean; ghost?: string; onReady: () => void; onLost: () => void }) => {
    if (engine.fail) throw new Error('no context');
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    const record = { spec, still: options.still, settled: 0, disposed: false, ghosts: [options.ghost ?? ''], replays: 0, lose: options.onLost };
    engine.mounted.push(record);
    options.onReady();
    return {
      setGhost: (text: string) => { record.ghosts.push(text); },
      replay: () => { record.replays++; },
      settle: () => { record.settled++; },
      dispose: () => { record.disposed = true; canvas.remove(); },
    };
  },
}));

const { WoodScene, useSceneMode } = await import('../../src/ui/three/WoodScene.tsx');

/*
 * The browser's prefers-reduced-motion, as a query that can be changed while
 * a scene runs, the way a learner changes it in the system's settings.
 */
const motion = {
  listeners: new Set<(event: MediaQueryListEvent) => void>(),
  set(reduce: boolean) {
    env.reducedMotion = reduce;
    act(() => { for (const listener of [...motion.listeners]) listener({ matches: reduce } as MediaQueryListEvent); });
  },
};
function stubMatchMedia() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() { return query.includes('reduced-motion') && env.reducedMotion; },
    media: query,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => { motion.listeners.add(listener); },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => { motion.listeners.delete(listener); },
  }));
}

const town: SceneSpec = { scene: 'today', bubble: 'Hallo!', sign: 'house', done: false };
const rail: SceneSpec = { scene: 'question', before: [{ text: 'Ich', tone: 'birch' }, { text: 'komme', tone: 'birch' }], after: [{ text: 'Bulgarien.', tone: 'birch' }], tail: '' };
const live = () => engine.mounted.filter((record) => !record.disposed);

beforeEach(() => {
  env.webgl = false;
  env.reducedMotion = false;
  env.probes = 0;
  env.cores = undefined;
  engine.mounted = [];
  engine.fail = false;
  motion.listeners.clear();
  stubMatchMedia();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('a wooden scene without WebGL', () => {
  it('shows the picture that was there, exactly, and nothing more', async () => {
    const onStatic = vi.fn();
    const { container } = render(
      <WoodScene spec={town} label="A town" fallback={<p className="dackel">Dackel</p>} onStatic={onStatic}>
        <span>chip</span>
      </WoodScene>,
    );
    await waitFor(() => expect(onStatic).toHaveBeenCalled());
    expect(container.innerHTML).toBe('<p class="dackel">Dackel</p>');
    expect(screen.queryByText('A town')).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(engine.mounted).toHaveLength(0);
  });

  it('leaves no empty box where there was nothing before', async () => {
    const { container } = render(<WoodScene spec={rail} ghost="?" />);
    await waitFor(() => expect(container.innerHTML).toBe(''));
  });

  /*
   * Asking for a context takes the main thread, and Today's first paint
   * waited for it. It is asked after the page has painted, never while it
   * renders.
   */
  it('asks about WebGL only after the page has painted', async () => {
    render(<WoodScene spec={town} label="A town" fallback={<p>Dackel</p>} />);
    expect(env.probes).toBe(0);
    await waitFor(() => expect(env.probes).toBe(1));
  });

  it('asks nothing at all where the hints already rule the scene out', async () => {
    env.webgl = true;
    env.cores = 2;
    const onStatic = vi.fn();
    const { container } = render(<WoodScene spec={town} label="A town" fallback={<p>Dackel</p>} onStatic={onStatic} />);
    expect(container.innerHTML).toBe('<p>Dackel</p>');
    expect(onStatic).toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(env.probes).toBe(0);
    expect(engine.mounted).toHaveLength(0);
  });
});

describe('a wooden scene with WebGL', () => {
  beforeEach(() => {
    env.webgl = true;
  });

  it('draws after the page, then describes the picture and lays its overlay over it', async () => {
    const { container } = render(
      <WoodScene spec={town} label={<>Blocks: <span lang="de">das Brot</span></>} fallback={<p>Dackel</p>}>
        <span className="chip">Next stop</span>
      </WoodScene>,
    );
    // Before the first frame: the picture, and no description yet.
    expect(screen.queryByText(/Blocks/)).toBeNull();
    expect(screen.getByText('Dackel')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Blocks/)).toBeInTheDocument());
    expect(engine.mounted).toHaveLength(1);
    expect(engine.mounted[0]!.still).toBe(false);
    expect(screen.getByText('Next stop')).toBeInTheDocument();
    // The description is text, so the German in it says which language it is
    // in — an aria-label has one language for all of it. The canvas is hidden.
    const description = container.querySelector('.wood-scene__label')!;
    expect(description).toHaveClass('visually-hidden');
    expect(description.querySelector('[lang="de"]')).toHaveTextContent('das Brot');
    expect(container.querySelector('.wood-scene__stage')).toHaveAttribute('aria-hidden', 'true');
    // Nothing in the picture can be focused.
    expect(container.querySelector('.wood-scene__stage')!.querySelector('button, a, input, [tabindex]')).toBeNull();
  });

  it('is hidden from assistive technology when it has no label of its own', async () => {
    const { container } = render(<WoodScene spec={rail} ghost="?" />);
    await waitFor(() => expect(live()).toHaveLength(1));
    expect(container.querySelector('.wood-scene__label')).toBeNull();
    expect(container.querySelector('.wood-scene__stage')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws once, standing still, under reduced motion', async () => {
    env.reducedMotion = true;
    render(<WoodScene spec={town} label="A town" />);
    await waitFor(() => expect(engine.mounted).toHaveLength(1));
    expect(engine.mounted[0]!.still).toBe(true);
  });

  /*
   * Reduced motion turned on in the system's settings while a scene plays:
   * it used to play on until the page was left.
   */
  it('settles a running scene into its finished pose when reduced motion is turned on', async () => {
    render(<WoodScene spec={town} label="A town" />);
    await waitFor(() => expect(live()).toHaveLength(1));
    expect(engine.mounted[0]!.still).toBe(false);
    motion.set(true);
    // The same scene, on the same canvas, told to stand still: nothing new is made.
    expect(engine.mounted).toHaveLength(1);
    expect(engine.mounted[0]!.settled).toBe(1);
    expect(live()).toHaveLength(1);
  });

  it('draws the scene moving again when reduced motion is turned off', async () => {
    env.reducedMotion = true;
    render(<WoodScene spec={town} label="A town" />);
    await waitFor(() => expect(live()).toHaveLength(1));
    expect(engine.mounted[0]!.still).toBe(true);
    motion.set(false);
    await waitFor(() => expect(live()).toHaveLength(1));
    await waitFor(() => expect(live()[0]!.still).toBe(false));
    // The still one was given back.
    expect(engine.mounted[0]!.disposed).toBe(true);
  });

  it('settles once only, and stops listening when it goes', async () => {
    const { unmount } = render(<WoodScene spec={town} label="A town" />);
    await waitFor(() => expect(live()).toHaveLength(1));
    expect(motion.listeners.size).toBeGreaterThan(0);
    motion.set(true);
    motion.set(true);
    expect(engine.mounted[0]!.settled).toBe(1);
    unmount();
    expect(motion.listeners.size).toBe(0);
  });

  it('tells the page the scene no longer moves, so "Show again" can go', async () => {
    function Mode() {
      return <p>{useSceneMode()}</p>;
    }
    render(<Mode />);
    expect(screen.getByText('animate')).toBeInTheDocument();
    motion.set(true);
    expect(screen.getByText('still')).toBeInTheDocument();
    motion.set(false);
    expect(screen.getByText('animate')).toBeInTheDocument();
  });

  it('keeps one scene alive under StrictMode, and gives every one back on unmount', async () => {
    const { unmount } = render(<StrictMode><WoodScene spec={town} label="A town" /></StrictMode>);
    await waitFor(() => expect(live()).toHaveLength(1));
    // StrictMode's first mount was undone before it ever reached the engine,
    // or was disposed straight after.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(live()).toHaveLength(1);
    unmount();
    expect(live()).toHaveLength(0);
    expect(document.querySelectorAll('canvas')).toHaveLength(0);
  });

  it('starts nothing for a page left before the scene began', async () => {
    const { unmount } = render(<WoodScene spec={town} label="A town" />);
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(engine.mounted).toHaveLength(0);
  });

  it('does not pile up contexts across quick route changes', async () => {
    for (let visit = 0; visit < 20; visit++) {
      const { unmount } = render(<WoodScene spec={town} label="A town" />);
      if (visit % 2) await waitFor(() => expect(live()).toHaveLength(1));
      unmount();
      expect(live()).toHaveLength(0);
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(live()).toHaveLength(0);
  });

  it('passes typing to the slot and a replay to the scene, without starting it again', async () => {
    const { rerender } = render(<WoodScene spec={rail} ghost="?" replay={0} />);
    await waitFor(() => expect(live()).toHaveLength(1));
    rerender(<WoodScene spec={{ ...rail }} ghost="aus" replay={0} />);
    rerender(<WoodScene spec={{ ...rail }} ghost="aus" replay={1} />);
    expect(engine.mounted).toHaveLength(1);
    expect(engine.mounted[0]!.ghosts).toContain('aus');
    expect(engine.mounted[0]!.replays).toBe(1);
  });

  /*
   * After one "Show again", every later feedback scene used to replay itself
   * the moment it was drawn: the count it was born with is not a request.
   */
  it('replays only when asked after it was drawn, not for the count it was born with', async () => {
    const { rerender } = render(<WoodScene spec={rail} replay={3} />);
    await waitFor(() => expect(live()).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(engine.mounted[0]!.replays).toBe(0);
    rerender(<WoodScene spec={rail} replay={4} />);
    expect(engine.mounted[0]!.replays).toBe(1);
  });

  /*
   * The question's rail is hidden by the layout on a short screen. Hidden,
   * it used to fetch the engine, make a context and draw a frame nobody saw.
   */
  it('starts nothing while the layout hides it, and draws once it is shown', async () => {
    const observers: Array<() => void> = [];
    let shown = false;
    vi.stubGlobal('ResizeObserver', class {
      constructor(private readonly callback: () => void) { observers.push(() => this.callback()); }
      observe() {}
      disconnect() {}
    });
    const rects = vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(() => (shown ? [{}] : []) as unknown as DOMRectList);
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => (shown ? 300 : 0));
    const height = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => (shown ? 140 : 0));
    try {
      render(<WoodScene spec={rail} ghost="?" />);
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(env.probes).toBe(0);
      expect(engine.mounted).toHaveLength(0);
      shown = true;
      act(() => observers.forEach((notify) => notify()));
      await waitFor(() => expect(live()).toHaveLength(1));
    } finally {
      rects.mockRestore();
      width.mockRestore();
      height.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  /*
   * The browser numbers idle callbacks and timers separately, from 1 each.
   * Clearing a timer by an idle callback's number stopped whichever of the
   * app's timers had it: the study clock, the minute's flush of study time,
   * the retry of answers saved offline.
   */
  it('never cancels one of the app\'s own timers on the way out', async () => {
    let ticks = 0;
    const interval = window.setInterval(() => { ticks++; }, 20);
    vi.stubGlobal('requestIdleCallback', () => interval);
    vi.stubGlobal('cancelIdleCallback', vi.fn());
    try {
      const { unmount } = render(<WoodScene spec={town} label="A town" />);
      unmount();
      expect(window.cancelIdleCallback).toHaveBeenCalledWith(interval);
      const before = ticks;
      await new Promise((resolve) => setTimeout(resolve, 120));
      expect(ticks).toBeGreaterThan(before);
    } finally {
      window.clearInterval(interval);
      vi.unstubAllGlobals();
    }
  });

  it('falls back to the picture when the browser takes the context away', async () => {
    const onStatic = vi.fn();
    render(<WoodScene spec={town} label="A town" fallback={<p>Dackel</p>} onStatic={onStatic} />);
    await waitFor(() => expect(live()).toHaveLength(1));
    act(() => engine.mounted[0]!.lose());
    expect(live()).toHaveLength(0);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Dackel')).toBeInTheDocument();
    expect(onStatic).toHaveBeenCalled();
  });

  it('falls back to the picture when the scene cannot start', async () => {
    engine.fail = true;
    const onStatic = vi.fn();
    const { container } = render(<WoodScene spec={town} label="A town" fallback={<p>Dackel</p>} onStatic={onStatic} />);
    await waitFor(() => expect(onStatic).toHaveBeenCalled());
    expect(container.innerHTML).toBe('<p>Dackel</p>');
  });
});
