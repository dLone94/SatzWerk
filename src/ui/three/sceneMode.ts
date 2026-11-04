/**
 * Whether a wooden scene is drawn in 3D, drawn once, or not at all.
 *
 * The scenes are decoration. A phone that would struggle with them, or a
 * learner who asked for less motion, loses nothing the page says: the
 * picture that stood there before stays, or nothing does.
 */

export type SceneMode =
  /** The full scene, moving. */
  | 'animate'
  /** The scene's finished pose, drawn once: no loop, no particles. */
  | 'still'
  /** No WebGL at all: the static picture, or nothing. */
  | 'static';

export interface SceneEnvironment {
  /** A WebGL context could be created. */
  webgl: boolean;
  /** prefers-reduced-motion: reduce. */
  reducedMotion: boolean;
  /** navigator.deviceMemory, in GB, where the browser says. */
  deviceMemory?: number;
  /** navigator.hardwareConcurrency, where the browser says. */
  hardwareConcurrency?: number;
  /** The Save-Data hint: the learner asked the browser to spare their data. */
  saveData?: boolean;
  /** The browser's estimate of the line: 'slow-2g', '2g', '3g' or '4g'. */
  effectiveType?: string;
}

/** What the browser says about itself without being asked to make anything: everything but a WebGL context. */
export type SceneHints = Omit<SceneEnvironment, 'webgl'> & {
  /** False where the browser has no WebGL at all to ask (an old browser, jsdom). */
  webglApi?: boolean;
};

/**
 * The rule, in order:
 *
 *  - no WebGL → static;
 *  - Save-Data on, or a line the browser rates 3G or slower → static: the
 *    3D code is a download of its own, and on such a line it would hold up
 *    the lesson the learner opens next;
 *  - 2 GB of memory or less, or two cores or fewer → static: the town is a
 *    few thousand triangles with shadows, and on such a phone the frame rate
 *    and battery go before the decoration earns its keep;
 *  - reduced motion → still;
 *  - otherwise → animate.
 *
 * A hint the browser does not give is not held against it.
 */
export function sceneMode(env: SceneEnvironment): SceneMode {
  if (!env.webgl) return 'static';
  if (env.saveData) return 'static';
  if (env.effectiveType !== undefined && SLOW_LINES.has(env.effectiveType)) return 'static';
  if (env.deviceMemory !== undefined && env.deviceMemory <= 2) return 'static';
  if (env.hardwareConcurrency !== undefined && env.hardwareConcurrency <= 2) return 'static';
  if (env.reducedMotion) return 'still';
  return 'animate';
}

const SLOW_LINES = new Set(['slow-2g', '2g', '3g']);

/**
 * The rule without WebGL: whether a scene may be drawn at all, before
 * anything is made to find out. Cheap, so a component can ask it while it
 * renders; WebGL itself is asked later, by `canUseWebgl`, once the page has
 * painted, and only where this does not already say static.
 */
export function hintMode({ webglApi, ...hints }: SceneHints): SceneMode {
  return sceneMode({ ...hints, webgl: webglApi !== false });
}

let webglProbe: boolean | undefined;

/**
 * Whether this browser can make a WebGL context, asked once per page.
 *
 * The probe's context is given back at once: browsers allow only a handful
 * of live contexts, and a probe that held one would cost a scene its own.
 * Where WebGL does not exist at all (jsdom, an old browser) nothing is
 * created. A renderer the browser itself calls a major performance caveat —
 * WebGL drawn in software on the processor — counts as none: the scene is
 * decoration, and the learner's battery is not.
 */
export function canUseWebgl(): boolean {
  if (webglProbe !== undefined) return webglProbe;
  webglProbe = false;
  if (typeof document === 'undefined' || typeof WebGLRenderingContext === 'undefined') return webglProbe;
  try {
    const canvas = document.createElement('canvas');
    const attributes = { failIfMajorPerformanceCaveat: true };
    const gl = (canvas.getContext('webgl2', attributes) ?? canvas.getContext('webgl', attributes)) as WebGLRenderingContext | null;
    if (gl) {
      webglProbe = true;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

interface NavigatorHints {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * What this browser says about itself, for `hintMode`. Nothing is made to
 * find it out: no canvas, no context. WebGL is `canUseWebgl`, asked later.
 */
export function readHints(): SceneHints {
  const hints = (typeof navigator === 'undefined' ? {} : navigator) as NavigatorHints;
  const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    webglApi: typeof WebGLRenderingContext !== 'undefined',
    reducedMotion,
    deviceMemory: typeof hints.deviceMemory === 'number' ? hints.deviceMemory : undefined,
    hardwareConcurrency: typeof hints.hardwareConcurrency === 'number' && hints.hardwareConcurrency > 0 ? hints.hardwareConcurrency : undefined,
    saveData: hints.connection?.saveData === true,
    effectiveType: typeof hints.connection?.effectiveType === 'string' ? hints.connection.effectiveType : undefined,
  };
}
