import { MathUtils, Vector3, type PerspectiveCamera } from 'three';

/**
 * Where to put `camera`, looking along `tilt` (from the target towards the
 * camera), so that every point is in view with a margin, centred: the
 * points' largest extent on screen, across or up, is `fill` of the view.
 *
 * Worked out by trying: perspective makes the near side larger than the
 * far, and a box drawn on the table does not say how it will look on a
 * slot of this shape. Plain three.js maths on a copy of the camera, with no
 * renderer, so it can be tested without WebGL.
 */
export function frameView(camera: PerspectiveCamera, points: Vector3[], tilt: Vector3, fill = 0.86): { look: Vector3; pos: Vector3 } {
  const probe = camera.clone();
  const look = points.reduce((sum, p) => sum.add(p), new Vector3()).multiplyScalar(1 / points.length);
  const dir = tilt.clone().normalize();
  let distance = 10;
  const right = new Vector3();
  const up = new Vector3();
  const ndc = new Vector3();
  for (let i = 0; i < 40; i++) {
    probe.position.copy(look).addScaledVector(dir, distance);
    probe.lookAt(look);
    probe.updateMatrixWorld(true);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      ndc.copy(p).project(probe);
      minX = Math.min(minX, ndc.x);
      maxX = Math.max(maxX, ndc.x);
      minY = Math.min(minY, ndc.y);
      maxY = Math.max(maxY, ndc.y);
    }
    const extent = Math.max(maxX - minX, maxY - minY) / 2;
    const halfH = distance * Math.tan(MathUtils.degToRad(probe.fov / 2));
    const halfW = halfH * probe.aspect;
    right.setFromMatrixColumn(probe.matrixWorld, 0);
    up.setFromMatrixColumn(probe.matrixWorld, 1);
    look.addScaledVector(right, ((minX + maxX) / 2) * halfW * 0.8);
    look.addScaledVector(up, ((minY + maxY) / 2) * halfH * 0.8);
    distance *= 0.3 + 0.7 * (extent / fill);
  }
  return { look, pos: look.clone().addScaledVector(dir, distance) };
}
