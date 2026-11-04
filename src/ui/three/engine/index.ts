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
 * same component twice in a row. A scene whose layout depends on the slot's
 * shape (the board lies across a wide slot) asks to be built again when the
 * slot changes shape past that point, and gets a fresh canvas the same way.
 */
export function mountScene(host: HTMLElement, spec: SceneSpec, options: MountOptions): SceneHandle {
  let disposed = false;
  let ghost = options.ghost ?? '?';
  let built = build();

  function build(): { stage: Stage; canvas: HTMLCanvasElement; setGhost(text: string): void; replay(): void } {
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
        // Once this frame is done with: never from inside the stage's own callbacks.
        rebuild: () => queueMicrotask(rebuild),
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
        case 'question': ({ setGhost } = question(stage, spec, ghost)); break;
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
    return { stage, canvas, setGhost, replay };
  }

  function rebuild(): void {
    if (disposed) return;
    built.stage.dispose();
    built.canvas.remove();
    try {
      built = build();
    } catch {
      options.onLost();
    }
  }

  /*
   * Typing reaches the slot at most once a frame, and after the keystroke
   * rather than inside it: a fast typist's letters are painted once, the
   * last one, and the field never waits for the picture.
   */
  let ghostFrame = 0;
  return {
    setGhost: (text) => {
      if (disposed) return;
      ghost = text;
      if (ghostFrame) return;
      ghostFrame = requestAnimationFrame(() => {
        ghostFrame = 0;
        if (!disposed) built.setGhost(ghost);
      });
    },
    replay: () => { if (!disposed) built.replay(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (ghostFrame) cancelAnimationFrame(ghostFrame);
      built.stage.dispose();
      built.canvas.remove();
    },
  };
}
