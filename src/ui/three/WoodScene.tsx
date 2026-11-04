import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SceneHandle } from './engine/index.ts';
import type { SceneSpec } from './sceneData.ts';
import { readEnvironment, sceneMode, type SceneMode } from './sceneMode.ts';

/**
 * One of the wooden toy scenes, or what stood there before it.
 *
 * three.js is never imported here, only fetched: the first time a scene is
 * about to be shown, by a dynamic import that makes it a chunk of its own.
 * The first screen does not wait for it, and a phone that cannot or should
 * not draw it (see `sceneMode`) never downloads it.
 *
 * Until the first frame is drawn — and for good, if WebGL is missing, the
 * phone is a slow one, the download fails or the browser takes the context
 * away — the `fallback` is shown exactly as it was: the dachshund on Today
 * and the course, or nothing at all where there was nothing before.
 *
 * The scene is a picture. Once drawn, it is an image named by `label`, built
 * from the same real data the page shows; with no label (it repeats what is
 * written beside it) it is hidden from assistive technology. Nothing in it
 * can be clicked or focused. `children` are laid over it and are ordinary
 * page content: a chip, or the feedback's "Show again".
 */
export function WoodScene({
  spec,
  label,
  className = '',
  fallback = null,
  ghost,
  replay = 0,
  onStatic,
  children,
}: {
  spec: SceneSpec;
  label?: string;
  className?: string;
  fallback?: ReactNode;
  /** The question's slot: the learner's typing, or "?". */
  ghost?: string;
  /** Bumped to play the feedback scene again. */
  replay?: number;
  /** Called once the fallback is final: no scene will be drawn here. */
  onStatic?: () => void;
  children?: ReactNode;
}) {
  const [mode, setMode] = useState<SceneMode>(() => sceneMode(readEnvironment()));
  const [live, setLive] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);
  const handle = useRef<SceneHandle | null>(null);
  // A new scene only when what it shows changes, not on every render.
  const key = useMemo(() => JSON.stringify(spec), [spec]);
  const ghostRef = useRef(ghost);
  ghostRef.current = ghost;
  const onStaticRef = useRef(onStatic);
  onStaticRef.current = onStatic;

  useEffect(() => {
    if (mode === 'static') onStaticRef.current?.();
  }, [mode]);

  useEffect(() => {
    if (mode === 'static' || !host.current) return;
    const target = host.current;
    let cancelled = false;
    let mounted: SceneHandle | null = null;
    const drawn: SceneSpec = JSON.parse(key) as SceneSpec;
    const begin = () => {
      import('./engine/index.ts')
        .then(({ mountScene }) => {
          if (cancelled) return;
          mounted = mountScene(target, drawn, {
            still: mode === 'still',
            ghost: ghostRef.current,
            onReady: () => { if (!cancelled) setLive(true); },
            onLost: () => {
              if (cancelled) return;
              mounted?.dispose();
              mounted = null;
              setLive(false);
              setMode('static');
            },
          });
          handle.current = mounted;
        })
        .catch(() => {
          // Offline before the scenes were ever fetched, or WebGL refused:
          // the picture that was there stays.
          if (!cancelled) setMode('static');
        });
    };
    // After the page has painted and settled: the scene is never in the way
    // of the first screen.
    const idle = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(begin, { timeout: 1200 })
      : window.setTimeout(begin, 150);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      mounted?.dispose();
      handle.current = null;
      setLive(false);
    };
  }, [key, mode]);

  useEffect(() => {
    if (live && ghost !== undefined) handle.current?.setGhost(ghost);
  }, [ghost, live]);

  useEffect(() => {
    if (live && replay > 0) handle.current?.replay();
  }, [replay, live]);

  if (mode === 'static') return <>{fallback}</>;
  const named = live && Boolean(label);
  return (
    <div className={`wood-scene wood-scene--${spec.scene} ${live ? 'is-live' : 'is-waiting'} ${className}`}>
      {fallback ? <div className="wood-scene__fallback">{fallback}</div> : null}
      <div
        ref={host}
        className="wood-scene__stage"
        role={named ? 'img' : undefined}
        aria-label={named ? label : undefined}
        aria-hidden={named ? undefined : true}
      />
      {live ? children : null}
    </div>
  );
}

/** Whether this browser will draw the scenes at all, decided without fetching them. */
export function useSceneMode(): SceneMode {
  const [mode] = useState<SceneMode>(() => sceneMode(readEnvironment()));
  return mode;
}
