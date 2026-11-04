/**
 * The wooden scenes' engine: three.js and everything drawn with it.
 *
 * This module is only ever reached through a dynamic import from WoodScene,
 * so three and the scenes are a chunk of their own, fetched the first time a
 * scene is shown and never on the way to the first screen.
 */
import type { SceneSpec } from '../sceneData.ts';
import { complete } from './scenes/complete.ts';
import { feedback } from './scenes/feedback.ts';
import { path } from './scenes/path.ts';
import { question } from './scenes/question.ts';
import { today } from './scenes/today.ts';
import { Stage } from './stage.ts';

export interface SceneHandle {
  /** The question's slot shows this (the learner's typing, or "?"). */
  setGhost(text: string): void;
  /** Play the feedback's swap again. */
  replay(): void;
  dispose(): void;
}

export interface MountOptions {
  still: boolean;
  ghost?: string;
  onReady: () => void;
  onLost: () => void;
}

/**
 * Draw `spec` in a fresh canvas inside `host`.
 *
 * A canvas of its own every time, removed again by `dispose`: a canvas whose
 * context was given back cannot be drawn on again, and React may mount the
 * same component twice in a row.
 */
export function mountScene(host: HTMLElement, spec: SceneSpec, options: MountOptions): SceneHandle {
  const canvas = document.createElement('canvas');
  canvas.className = 'wood-scene__canvas';
  host.appendChild(canvas);
  let stage: Stage;
  try {
    stage = new Stage(canvas, {
      mood: spec.scene === 'today' ? 'evening' : 'day',
      still: options.still,
      onReady: options.onReady,
      onLost: options.onLost,
    });
  } catch (error) {
    canvas.remove();
    throw error;
  }
  let setGhost = (_text: string) => {};
  let replay = () => {};
  try {
    switch (spec.scene) {
      case 'today': today(stage, spec); break;
      case 'question': ({ setGhost } = question(stage, spec, options.ghost ?? '?')); break;
      case 'feedback': ({ replay } = feedback(stage, spec)); break;
      case 'complete': complete(stage, spec); break;
      case 'path': path(stage, spec); break;
    }
    stage.start();
  } catch (error) {
    stage.dispose();
    canvas.remove();
    throw error;
  }
  let disposed = false;
  return {
    setGhost: (text) => { if (!disposed) setGhost(text); },
    replay: () => { if (!disposed) replay(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      stage.dispose();
      canvas.remove();
    },
  };
}
