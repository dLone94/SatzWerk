import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { whenQuiet } from '../../services/loading.ts';
import type { SceneHandle } from './engine/index.ts';
import type { SceneSpec } from './sceneData.ts';
import { canUseWebgl, hintMode, readHints, reducedMotionNow, watchReducedMotion, type SceneMode } from './sceneMode.ts';

type Engine = typeof import('./engine/index.ts');

/**
 * How long nothing the learner waits for — a page, a level's content — must
 * have been on the line before the 3D engine is first fetched. On a slow
 * connection the engine would otherwise share it with the lesson the
 * learner opens next.
 */
const QUIET_BEFORE_ENGINE_MS = 2000;

let engine: Promise<Engine> | undefined;

/** The page has finished loading what it started with. */
function pageLoaded(signal: AbortSignal): Promise<void> {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => { signal.removeEventListener('abort', stop); resolve(); };
    const stop = () => { window.removeEventListener('load', done); reject(new DOMException('Aborted', 'AbortError')); };
    window.addEventListener('load', done, { once: true });
    signal.addEventListener('abort', stop, { once: true });
  });
}

/**
 * three.js and the scenes. Fetched once, the first time a scene is about to
 * be drawn and the line is quiet; after that every scene has it at once.
 */
function loadEngine(signal: AbortSignal): Promise<Engine> {
  if (engine) return engine;
  return pageLoaded(signal)
    .then(() => whenQuiet(QUIET_BEFORE_ENGINE_MS, signal))
    .then(() => {
      engine ??= import('./engine/index.ts').catch((error: unknown) => {
        engine = undefined;
        throw error;
      });
      return engine;
    });
}

/**
 * Run `fn` once the page has painted and is idle. Returns how to call it
 * off — with the same scheduler that took it: an idle callback's number and
 * a timer's are counted separately, and clearing a timer by an idle
 * callback's number stops whichever of the app's own timers has it.
 */
export function afterPaint(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 150);
  return () => window.clearTimeout(id);
}

/** Whether the layout gives this element a box at all: not inside something hidden. */
function hasBox(element: HTMLElement): boolean {
  return element.getClientRects().length > 0 && element.clientWidth > 0 && element.clientHeight > 0;
}

/**
 * One of the wooden toy scenes, or what stood there before it.
 *
 * three.js is never imported here, only fetched: the first time a scene is
 * about to be shown, by a dynamic import that makes it a chunk of its own.
 * The first screen does not wait for it — not even to ask whether WebGL
 * exists, which is asked after the page has painted — and a phone that
 * cannot or should not draw it (see `sceneMode`) never downloads it. A slot
 * the layout hides (the question's rail on a short screen) starts nothing
 * until it is shown.
 *
 * Until the first frame is drawn — and for good, if WebGL is missing, the
 * phone is a slow one, the download fails or the browser takes the context
 * away — the `fallback` is shown exactly as it was: the dachshund on Today
 * and the course, or nothing at all where there was nothing before.
 *
 * The scene is a picture, and the canvas is hidden from assistive
 * technology. Once drawn, `label` describes it as text beside it, so the
 * German words in it can carry their own language; with no label (it
 * repeats what is written beside it) nothing is said at all. Nothing in it
 * can be clicked or focused. `children` are laid over it and are ordinary
 * page content (a chip); `after` follows the box in the page, shown only
 * once the scene is drawn (the feedback's "Show again", which over the
 * picture would hide the very swap it replays).
 */
export function WoodScene({
  spec,
  label,
  className = '',
  fallback = null,
  placeholder,
  ghost,
  replay = 0,
  onStatic,
  children,
  after,
}: {
  spec: SceneSpec;
  label?: ReactNode;
  className?: string;
  fallback?: ReactNode;
  /**
   * What stands in the scene's box until its first frame, where that is not
   * the `fallback`: a light picture of the same thing, so the box is never
   * empty while three.js is fetched. Defaults to the fallback.
   */
  placeholder?: ReactNode;
  /** The question's slot: the learner's typing, or "?". */
  ghost?: string;
  /** Bumped to play the feedback scene again. */
  replay?: number;
  /** Called once the fallback is final: no scene will be drawn here. */
  onStatic?: () => void;
  children?: ReactNode;
  /** Page content under the scene, shown once it is drawn. */
  after?: ReactNode;
}) {
  const [mode, setMode] = useState<SceneMode>(() => hintMode(readHints()));
  const [live, setLive] = useState(false);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  /** The scene on the canvas is drawn still: from the start, or since it settled. */
  const drawnStill = useRef(false);
  /** It began moving and was settled mid-way: it can pick up its motion where it stood. */
  const settledLive = useRef(false);
  /** Bumped to draw a scene that began still moving once reduced motion is turned off. */
  const [moving, setMoving] = useState(0);
  const host = useRef<HTMLDivElement | null>(null);
  const handle = useRef<SceneHandle | null>(null);
  // A new scene only when what it shows changes, not on every render.
  const key = useMemo(() => JSON.stringify(spec), [spec]);
  const ghostRef = useRef(ghost);
  ghostRef.current = ghost;
  const onStaticRef = useRef(onStatic);
  onStaticRef.current = onStatic;
  const replayRef = useRef(replay);
  replayRef.current = replay;
  /** The replay count this scene has already played: a new scene starts from the count it was born with. */
  const played = useRef(replay);

  useEffect(() => {
    if (mode === 'static') onStaticRef.current?.();
  }, [mode]);

  useEffect(() => {
    if (mode === 'static' || !host.current) return;
    const target = host.current;
    const abort = new AbortController();
    const stops: Array<() => void> = [];
    let mounted: SceneHandle | null = null;
    const drawn: SceneSpec = JSON.parse(key) as SceneSpec;
    played.current = replayRef.current;
    const draw = ({ mountScene }: Engine) => {
      if (abort.signal.aborted) return;
      const still = mode === 'still' || reducedRef.current;
      drawnStill.current = still;
      settledLive.current = false;
      mounted = mountScene(target, drawn, {
        still,
        ghost: ghostRef.current,
        onReady: () => { if (!abort.signal.aborted) setLive(true); },
        onLost: () => {
          if (abort.signal.aborted) return;
          mounted?.dispose();
          mounted = null;
          handle.current = null;
          setLive(false);
          setMode('static');
        },
      });
      handle.current = mounted;
    };
    const begin = () => {
      if (abort.signal.aborted) return;
      // Asked only now, after the page has painted: making a context takes
      // the main thread for a moment, and the first screen never waits for it.
      if (!canUseWebgl()) {
        setMode('static');
        return;
      }
      loadEngine(abort.signal)
        .then(draw)
        .catch(() => {
          // Offline before the scenes were ever fetched, or WebGL refused:
          // the picture that was there stays.
          if (!abort.signal.aborted) setMode('static');
        });
    };
    if (hasBox(target) || typeof ResizeObserver === 'undefined') {
      stops.push(afterPaint(begin));
    } else {
      // Hidden by the layout for now: nothing is fetched, made or drawn
      // until it has a box to draw in.
      const watch = new ResizeObserver(() => {
        if (!hasBox(target)) return;
        watch.disconnect();
        stops.push(afterPaint(begin));
      });
      watch.observe(target);
      stops.push(() => watch.disconnect());
    }
    return () => {
      abort.abort();
      for (const stop of stops) stop();
      mounted?.dispose();
      handle.current = null;
      setLive(false);
    };
  }, [key, mode, moving]);

  /*
   * Reduced motion turned on mid-scene: the scene settles at once into its
   * finished pose, on the canvas it has. Turned off again, a scene that had
   * been moving takes up only its ambient motion from that pose — its story
   * is not told twice (the die is not rolled again as if the learner had
   * moved). A scene that began still has told no story yet: it is drawn
   * afresh, moving, where the browser would have drawn it moving.
   */
  useEffect(() => {
    if (reduced) {
      if (live && !drawnStill.current) {
        drawnStill.current = true;
        settledLive.current = true;
        handle.current?.settle();
      }
    } else if (mode === 'still') {
      // Drawn still because reduced motion was on when it began.
      setMode('animate');
    } else if (live && settledLive.current) {
      drawnStill.current = false;
      settledLive.current = false;
      handle.current?.resume();
    } else if (live && drawnStill.current && mode === 'animate') {
      setMoving((count) => count + 1);
    }
  }, [reduced, live, mode]);

  useEffect(() => {
    if (live && ghost !== undefined) handle.current?.setGhost(ghost);
  }, [ghost, live]);

  useEffect(() => {
    if (!live || replay <= played.current) return;
    played.current = replay;
    handle.current?.replay();
  }, [replay, live]);

  if (mode === 'static') return <>{fallback}</>;
  const named = live && label !== undefined && label !== null && label !== '';
  const waiting = placeholder ?? fallback;
  return (
    <>
      <div className={`wood-scene wood-scene--${spec.scene} ${live ? 'is-live' : 'is-waiting'} ${className}`}>
        {waiting ? <div className="wood-scene__fallback">{waiting}</div> : null}
        <div ref={host} className="wood-scene__stage" aria-hidden="true" />
        {named ? <p className="visually-hidden wood-scene__label">{label}</p> : null}
        {live ? children : null}
      </div>
      {live ? after : null}
    </>
  );
}

/**
 * Whether this browser would draw the scenes moving, decided from what it
 * says about itself, without making anything. Anything that depends on a
 * scene actually being drawn is shown only once it is (WoodScene's
 * `children`), so this need not ask WebGL.
 */
export function useSceneMode(): SceneMode {
  const [mode] = useState<SceneMode>(() => hintMode(readHints()));
  const reduced = useReducedMotion();
  return mode === 'animate' && reduced ? 'still' : mode;
}

/** prefers-reduced-motion as it is now, following the learner's changes to it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(reducedMotionNow);
  useEffect(() => {
    // Changed between the first render and now: caught up here.
    setReduced(reducedMotionNow());
    return watchReducedMotion(setReduced);
  }, []);
  return reduced;
}
