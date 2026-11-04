import { Color, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, RingGeometry, Vector3 } from 'three';
import type { SceneSpec } from '../../sceneData.ts';
import { C } from '../kit.ts';
import { bounce, clamp01, easeInQuad, squash } from '../motion.ts';
import { block, railView, layoutRow, motes, setSquash, toneColour, workbench } from '../pieces.ts';
import type { Stage } from '../stage.ts';

/**
 * A wrong answer that was one word off: the wrong block trembles, is flicked
 * off the bench and tumbles away, and the right one drops into its place in
 * a burst of sparkles. Both words are the learner's own and the course's
 * correction, which the feedback below already shows.
 */
export function feedback(s: Stage, spec: Extract<SceneSpec, { scene: 'feedback' }>): { replay(): void } {
  const wrong = block(s, spec.wrong, C.birch, { mat: { emissive: 0xff2a10 } });
  const right = block(s, spec.right, C.birch, { mat: { emissive: C.good } });
  const parts = [
    ...spec.before.map((b) => block(s, b.text, toneColour(b.tone))),
    wrong,
    ...spec.after.map((b) => block(s, b.text, toneColour(b.tone))),
  ];
  const at = spec.before.length;
  const gap = 0.18;
  // The slot is as wide as the wider of the two words.
  const widths = parts.map((b, i) => (i === at ? Math.max(wrong.w, right.w) : b.w));
  const xs = layoutRow(widths, gap);
  const total = widths.reduce((sum, w) => sum + w, 0) + gap * (parts.length - 1);
  const railTop = workbench(s, total, xs);
  // The rail and its blocks fill the slot, whatever its shape; the camera
  // looks down on them a little.
  railView(s, total);
  s.cam.parallax = 0.25;
  s.stillTime = 6;
  parts.forEach((b, i) => {
    b.group.position.set(xs[i]!, railTop, 0);
    s.scene.add(b.group);
  });
  const x = xs[at]!;
  right.group.position.set(x, 8, 0);
  s.scene.add(right.group);
  const ringMaterial = new MeshBasicMaterial({ color: C.good, transparent: true, opacity: 0, depthWrite: false });
  const ring = new Mesh(new RingGeometry(0.6, 0.72, 64), ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, railTop + 0.02, 0);
  s.scene.add(ring);
  motes(s, 50, [9, 4, 4]);
  // Colour management is on: these are sRGB and converted once, here.
  const tint = new Color(0xf0a89c);
  const base = new Color(C.birch);
  const wrongMaterial = wrong.body.material as MeshPhysicalMaterial;
  const rightMaterial = right.body.material as MeshPhysicalMaterial;
  /* Flicked up and right, two bounces on the bench top, then off the edge. */
  const path = (f: number) => {
    let y: number;
    if (f < 0.45) y = railTop + Math.sin((f / 0.45) * Math.PI) * 1.5;
    else if (f < 0.7) y = Math.sin(((f - 0.45) / 0.25) * Math.PI) * 0.45;
    else if (f < 0.85) y = Math.sin(((f - 0.7) / 0.15) * Math.PI) * 0.15;
    else y = -easeInQuad((f - 0.85) / 0.15) * 3;
    return new Vector3(x + f * 3.4, y, f * 1.2);
  };
  s.onFrame((t) => {
    if (t < 1.25) {
      const trembling = t > 0.25 ? 1 : 0;
      wrong.group.position.set(x + Math.sin(t * 46) * 0.05 * trembling, railTop + Math.abs(Math.sin(t * 23)) * 0.04 * trembling, 0);
      wrong.group.rotation.set(0, 0, Math.sin(t * 46) * 0.04 * trembling);
      wrongMaterial.color.copy(base).lerp(tint, clamp01((t - 0.2) / 0.4));
      wrongMaterial.emissiveIntensity = clamp01((t - 0.2) / 0.4) * (0.25 + Math.sin(t * 12) * 0.12);
      wrong.group.visible = true;
    } else {
      const f = clamp01((t - 1.25) / 1.4);
      wrong.group.position.copy(path(f));
      wrong.group.rotation.set(f * 3.2, f * 1.4, -f * 6.0);
      wrongMaterial.emissiveIntensity = 0.2 * (1 - f);
      wrong.group.visible = f < 1;
      s.once('bump', t, 1.25 + 1.4 * 0.45, () => {
        s.spawn(new Vector3(x + 1.5, 0.02, 0.55), { count: 8, color: 0xe8d6b6, opacity: 0.6, size: 0.15, grow: 2, life: 0.6, speed: 0.8, up: 0.2 });
      });
    }
    const dStart = 1.9;
    const d = clamp01((t - dStart) / 0.9);
    const landAt = dStart + 0.33;
    right.group.position.y = railTop + (1 - bounce(d)) * 7.5;
    setSquash(right, squash(t, landAt));
    s.once('land', t, landAt, () => {
      s.spawn(new Vector3(x, railTop + 0.5, 0.2), { count: 26, color: C.gold, additive: true, opacity: 1, size: 0.14, grow: 0.4, life: 1.1, speed: 2.2, up: 1.4, gravity: 2.5 });
      s.spawn(new Vector3(x, railTop + 0.05, 0.35), { count: 10, color: 0xe8d6b6, opacity: 0.7, size: 0.18, grow: 2.2, life: 0.7, speed: 1, up: 0.25 });
    });
    const gl = clamp01((t - landAt) / 1.3);
    ringMaterial.opacity = t > landAt ? 0.9 * (1 - gl) : 0;
    ring.scale.setScalar(1 + gl * 1.6);
    rightMaterial.emissiveIntensity = t > landAt ? 0.45 * (1 - gl) : 0;
    s.scene.rotation.y = Math.sin(t * 0.3) * 0.04;
  });
  return {
    replay() {
      wrong.group.visible = true;
      s.restart();
    },
  };
}
