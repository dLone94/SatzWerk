import { SpotLight, Vector3 } from 'three';
import type { SceneSpec } from '../../sceneData.ts';
import { C } from '../kit.ts';
import { bounce, clamp01, easeOutCubic, squash } from '../motion.ts';
import { block, railView, blockWidth, layoutRow, motes, setSquash, toneColour, workbench, type Block } from '../pieces.ts';
import type { Stage } from '../stage.ts';

const EMPTY_INK = '#6E604D';

/**
 * A sentence on a workbench rail: the blocks drop in, and the missing slot
 * waits under a spotlight. The slot shows what the learner types and
 * nothing else — the scene is never told the answer.
 */
export function question(s: Stage, spec: Extract<SceneSpec, { scene: 'question' }>, ghost: string): { setGhost(text: string): void } {
  const ghostMaterial = s.kit.lacquer(0xffffff, { noGrain: true, transparent: true, opacity: 0.42, clearcoat: 1, roughness: 0.15, env: 1.2 });
  const slotW = 1.3;
  const slot = block(s, ghost, 0xffffff, { w: slotW, ink: ghost === '?' ? EMPTY_INK : '#1E1B17', material: ghostMaterial });
  const blocks: Block[] = [
    ...spec.before.map((b) => block(s, b.text, toneColour(b.tone))),
    slot,
    ...spec.after.map((b) => block(s, b.text, toneColour(b.tone))),
  ];
  const at = spec.before.length;
  const gap = 0.18;
  const xs = layoutRow(blocks.map((b) => b.w), gap);
  const total = blocks.reduce((sum, b) => sum + b.w, 0) + gap * (blocks.length - 1);
  const railTop = workbench(s, total, xs);
  // The rail and its blocks fill the slot, whatever its shape; the camera
  // looks down on them a little.
  railView(s, total);
  s.cam.parallax = 0.25;
  s.stillTime = 4;
  const spot = new SpotLight(0xfff0c8, 0, 9, 0.32, 0.6, 1.5);
  spot.position.set(xs[at]!, 5, 1.5);
  spot.target.position.set(xs[at]!, 0, 0);
  s.scene.add(spot);
  s.scene.add(spot.target);
  const timing = blocks.map((b, i) => {
    b.group.position.set(xs[i]!, 7, 0);
    s.scene.add(b.group);
    const delay = 0.15 + i * 0.28;
    return { delay, landAt: delay + 0.36, spin: (s.rand() - 0.5) * 1.6 };
  });
  motes(s, 60, [9, 4, 4]);
  let scale = 1;
  let target = 1;
  s.onFrame((t, dt) => {
    blocks.forEach((b, i) => {
      const { delay, landAt, spin } = timing[i]!;
      const k = clamp01((t - delay) / 0.9);
      b.group.position.y = railTop + (1 - bounce(k)) * 6.6;
      b.group.rotation.z = (1 - easeOutCubic(k)) * spin;
      setSquash(b, squash(t, landAt));
      s.once(`land${i}`, t, landAt, () => {
        s.spawn(new Vector3(xs[i]!, railTop + 0.05, 0.35), { count: 9, color: 0xe8d6b6, opacity: 0.7, size: 0.16, grow: 2.2, life: 0.7, speed: 0.9, up: 0.25 });
      });
    });
    spot.intensity = clamp01((t - 1.4) / 0.6) * (1.3 + Math.sin(t * 2.4) * 0.25) * Math.PI * 4;
    scale += (target - scale) * Math.min(1, dt * 10);
    if (t > timing[at]!.delay + 0.9) {
      const q = 1 + Math.sin(t * 3) * 0.025;
      slot.pivot.scale.set(scale * q, q, q);
      slot.group.position.y = railTop + 0.04 + Math.sin(t * 3) * 0.04;
    }
    s.scene.rotation.y = Math.sin(t * 0.3) * 0.05;
  });
  let shown = ghost;
  return {
    setGhost(text: string) {
      if (text === shown || !slot.face) return;
      shown = text;
      const material = slot.face.material;
      if (material.map) s.kit.dropLabel(material.map);
      material.map = s.kit.label(text, slot.w, slot.h, text === '?' ? EMPTY_INK : '#1E1B17');
      material.needsUpdate = true;
      // The slot widens for a long word, but never over its neighbours.
      target = Math.min(1 + (2 * gap) / slot.w, Math.max(1, blockWidth(text) / slot.w));
      scale = s.still ? target : target * 1.12;
      s.spawn(new Vector3(slot.group.position.x, railTop + 0.6, 0.5), { count: 4, color: C.gold, additive: true, opacity: 0.9, size: 0.1, grow: 0.5, life: 0.5, speed: 0.8, up: 0.8 });
      if (s.still) slot.pivot.scale.set(target, 1, 1);
      s.redraw();
    },
  };
}
