import { EXPLODE_OFFSETS, MOTOR } from "./geometry";

/**
 * Camera framing, solved analytically rather than by measuring the scene graph.
 *
 * Reading the bounds off the live scene means the answer depends on when the
 * render loop happens to run, which parts have streamed in, and whether the
 * controls object exists yet. The machine's extent is fully determined by its
 * own constants and the explode scalar, so it can be computed directly — which
 * makes the framing deterministic, unit-testable, and correct on the first
 * frame instead of some frame.
 */

export type Bounds = {
  /** Half-extent along each axis, from the centre. */
  half: [number, number, number];
  centre: [number, number, number];
};

export type Shot = {
  /** Direction from subject to camera; normalised here. */
  dir: [number, number, number];
  /** Above 1 leaves more air around the subject. */
  margin?: number;
};

export const SHOTS = {
  /** Three-quarter from the front, the way a car is normally photographed. */
  car: { dir: [0.86, 0.36, 0.9], margin: 0.98 },
  "car-close": { dir: [0.74, 0.3, 0.78], margin: 0.86 },
  /** Near-perpendicular to the axis, so an exploded row reads left to right. */
  motor: { dir: [-0.86, 0.32, 0.4], margin: 1.02 },
  "motor-exploded": { dir: [-0.95, 0.26, 0.2], margin: 0.94 },
  /** Down the bore, for anything about the rotating field. */
  "motor-face": { dir: [0.1, 0.2, 1], margin: 1.15 },
  rotor: { dir: [-0.82, 0.32, 0.56], margin: 0.92 },
} as const satisfies Record<string, Shot>;

export type ShotName = keyof typeof SHOTS;

/**
 * Axial extent of the motor at a given explode value, including the parts that
 * travel furthest in each direction. The radial extent is the housing, except
 * once the rotor and shaft have left it.
 */
export function motorBounds(explode: number): Bounds {
  const halfHousing = MOTOR.housingLength / 2;
  const halfShaft = (MOTOR.housingLength * 1.85) / 2;

  const frontZ = Math.min(
    -halfHousing + EXPLODE_OFFSETS.frontCap * explode - MOTOR.endCapLength,
    -halfShaft + EXPLODE_OFFSETS.shaft * explode,
    -halfHousing,
  );
  const backZ = Math.max(
    halfHousing + EXPLODE_OFFSETS.rearCap * explode + MOTOR.endCapLength,
    halfShaft + EXPLODE_OFFSETS.shaft * explode,
    halfHousing,
  );

  const radius = MOTOR.housingOuter + 0.06;

  return {
    half: [radius, radius, (backZ - frontZ) / 2],
    centre: [0, 0, (backZ + frontZ) / 2],
  };
}

/** The car, sized from the body profile in Car.tsx. */
export function carBounds(extract: number): Bounds {
  const backZ = 1.5 + extract * 2.4;
  return {
    half: [3.4, 1.35, Math.max(1.5, backZ)],
    centre: [0, -0.35, 0],
  };
}

const cross = (a: readonly number[], b: readonly number[]): [number, number, number] => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const norm = (v: readonly number[]): [number, number, number] => {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};

const dot = (a: readonly number[], b: readonly number[]) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Where to put the camera so the subject fills the frame from `shot`.
 *
 * A bounding-sphere fit wastes most of the frame on a long thin subject, and an
 * exploded motor is roughly four times longer than it is wide. This projects
 * the box corners onto the camera's own basis and solves the horizontal and
 * vertical fits separately, taking whichever binds.
 */
export function cameraFor(
  shotName: ShotName,
  bounds: Bounds,
  aspect: number,
  fovDegrees: number,
): { position: [number, number, number]; target: [number, number, number] } {
  const shot: Shot = SHOTS[shotName];
  const dir = norm(shot.dir);
  const margin = shot.margin ?? 1;

  const worldUp: [number, number, number] = [0, 1, 0];
  let right = cross(worldUp, dir);
  if (Math.hypot(...right) < 1e-6) right = [1, 0, 0];
  right = norm(right);
  const up = norm(cross(dir, right));

  const vFov = (fovDegrees * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(0.2, aspect));

  let halfWidth = 0;
  let halfHeight = 0;
  let halfDepth = 0;

  for (let i = 0; i < 8; i += 1) {
    const corner = [
      (i & 1 ? 1 : -1) * bounds.half[0],
      (i & 2 ? 1 : -1) * bounds.half[1],
      (i & 4 ? 1 : -1) * bounds.half[2],
    ];
    halfWidth = Math.max(halfWidth, Math.abs(dot(corner, right)));
    halfHeight = Math.max(halfHeight, Math.abs(dot(corner, up)));
    halfDepth = Math.max(halfDepth, Math.abs(dot(corner, dir)));
  }

  const distance =
    (Math.max(halfWidth / Math.tan(hFov / 2), halfHeight / Math.tan(vFov / 2)) +
      halfDepth) *
    margin;

  return {
    position: [
      bounds.centre[0] + dir[0] * distance,
      bounds.centre[1] + dir[1] * distance,
      bounds.centre[2] + dir[2] * distance,
    ],
    target: bounds.centre,
  };
}
