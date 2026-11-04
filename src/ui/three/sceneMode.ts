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
}

/**
 * The rule, in order:
 *
 *  - no WebGL → static;
 *  - Save-Data on → static (the 3D code is a download of its own);
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
  if (env.deviceMemory !== undefined && env.deviceMemory <= 2) return 'static';
  if (env.hardwareConcurrency !== undefined && env.hardwareConcurrency <= 2) return 'static';
  if (env.reducedMotion) return 'still';
  return 'animate';
}

let webglProbe: boolean | undefined;

/**
 * Whether this browser can make a WebGL context, asked once per page.
 *
 * The probe's context is given back at once: browsers allow only a handful
 * of live contexts, and a probe that held one would cost a scene its own.
 * Where WebGL does not exist at all (jsdom, an old browser) nothing is
 * created.
 */
export function canUseWebgl(): boolean {
  if (webglProbe !== undefined) return webglProbe;
  webglProbe = false;
  if (typeof document === 'undefined' || typeof WebGLRenderingContext === 'undefined') return webglProbe;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
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
  connection?: { saveData?: boolean };
}

/** What this browser says about itself, for `sceneMode`. */
export function readEnvironment(): SceneEnvironment {
  const hints = (typeof navigator === 'undefined' ? {} : navigator) as NavigatorHints;
  const reducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    webgl: canUseWebgl(),
    reducedMotion,
    deviceMemory: typeof hints.deviceMemory === 'number' ? hints.deviceMemory : undefined,
    hardwareConcurrency: typeof hints.hardwareConcurrency === 'number' && hints.hardwareConcurrency > 0 ? hints.hardwareConcurrency : undefined,
    saveData: hints.connection?.saveData === true,
  };
}
