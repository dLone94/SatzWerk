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

const env = vi.hoisted(() => ({ webgl: false, reducedMotion: false }));
const engine = vi.hoisted(() => ({
  mounted: [] as Array<{ spec: unknown; still: boolean; disposed: boolean; ghosts: string[]; replays: number; lose: () => void }>,
  fail: false,
}));

// Loading three at all here is the bug.
vi.mock('three', () => {
  throw new Error('three was loaded outside the scene chunk');
});

vi.mock('../../src/ui/three/sceneMode.ts', async (original) => ({
  ...(await original<typeof import('../../src/ui/three/sceneMode.ts')>()),
  readEnvironment: () => ({ ...env }),
}));

vi.mock('../../src/ui/three/engine/index.ts', () => ({
  mountScene: (host: HTMLElement, spec: unknown, options: { still: boolean; ghost?: string; onReady: () => void; onLost: () => void }) => {
    if (engine.fail) throw new Error('no context');
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    const record = { spec, still: options.still, disposed: false, ghosts: [options.ghost ?? ''], replays: 0, lose: options.onLost };
    engine.mounted.push(record);
    options.onReady();
    return {
      setGhost: (text: string) => { record.ghosts.push(text); },
      replay: () => { record.replays++; },
      dispose: () => { record.disposed = true; canvas.remove(); },
    };
  },
}));

const { WoodScene } = await import('../../src/ui/three/WoodScene.tsx');

const town: SceneSpec = { scene: 'today', bubble: 'Hallo!', sign: 'house', done: false };
const rail: SceneSpec = { scene: 'question', before: [{ text: 'Ich', tone: 'birch' }, { text: 'komme', tone: 'birch' }], after: [{ text: 'Bulgarien.', tone: 'birch' }], tail: '' };
const live = () => engine.mounted.filter((record) => !record.disposed);

beforeEach(() => {
  env.webgl = false;
  env.reducedMotion = false;
  engine.mounted = [];
  engine.fail = false;
});
afterEach(cleanup);

describe('a wooden scene without WebGL', () => {
  it('shows the picture that was there, exactly, and nothing more', async () => {
    const onStatic = vi.fn();
    const { container } = render(
      <WoodScene spec={town} label="A town" fallback={<p className="dackel">Dackel</p>} onStatic={onStatic}>
        <span>chip</span>
      </WoodScene>,
    );
    expect(container.innerHTML).toBe('<p class="dackel">Dackel</p>');
    expect(screen.queryByRole('img')).toBeNull();
    expect(onStatic).toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(engine.mounted).toHaveLength(0);
  });

  it('leaves no empty box where there was nothing before', () => {
    const { container } = render(<WoodScene spec={rail} ghost="?" />);
    expect(container.innerHTML).toBe('');
  });
});

describe('a wooden scene with WebGL', () => {
  beforeEach(() => {
    env.webgl = true;
  });

  it('draws after the page, then names the picture and lays its overlay over it', async () => {
    render(
      <WoodScene spec={town} label="A small wooden town" fallback={<p>Dackel</p>}>
        <span className="chip">Next stop</span>
      </WoodScene>,
    );
    // Before the first frame: the picture, hidden from assistive technology like it always was.
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Dackel')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('img', { name: 'A small wooden town' })).toBeInTheDocument());
    expect(engine.mounted).toHaveLength(1);
    expect(engine.mounted[0]!.still).toBe(false);
    expect(screen.getByText('Next stop')).toBeInTheDocument();
    // Nothing in the picture can be focused.
    expect(screen.getByRole('img').querySelector('button, a, input, [tabindex]')).toBeNull();
  });

  it('is hidden from assistive technology when it has no label of its own', async () => {
    const { container } = render(<WoodScene spec={rail} ghost="?" />);
    await waitFor(() => expect(live()).toHaveLength(1));
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('.wood-scene__stage')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws once, standing still, under reduced motion', async () => {
    env.reducedMotion = true;
    render(<WoodScene spec={town} label="A town" />);
    await waitFor(() => expect(engine.mounted).toHaveLength(1));
    expect(engine.mounted[0]!.still).toBe(true);
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
