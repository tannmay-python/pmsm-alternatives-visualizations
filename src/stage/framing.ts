import { AXIAL, EXPLODE_OFFSETS, MOTOR, SHAFT_LENGTH } from "./geometry";

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
  /**
   * Still side-on enough for the row to read left to right, but turned far
   * enough toward the rotor's end face that the magnets sliding out of it show.
   */
  "motor-exploded": { dir: [-0.88, 0.3, 0.4], margin: 0.94 },
  /** Down the bore, for anything about the rotating field. */
  "motor-face": { dir: [0.1, 0.2, 1], margin: 1.0 },
  /** Three-quarter end-on: the end face carries the V pockets, so it leads. */
  rotor: { dir: [-0.5, 0.36, 0.85], margin: 0.86 },
  /** Axial machines are wide and shallow, so they are read from the front. */
  axial: { dir: [0.86, 0.34, 0.5], margin: 1.06 },
} as const satisfies Record<string, Shot>;

export type ShotName = keyof typeof SHOTS;

/**
 * Axial extent of the motor at a given explode value, including the parts that
 * travel furthest in each direction. The radial extent is the housing, except
 * once the rotor and shaft have left it.
 */
export function motorBounds(explode: number): Bounds {
  const halfHousing = MOTOR.housingLength / 2;
  const halfShaft = SHAFT_LENGTH / 2;

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

/**
 * The rotor on its own, with whatever shaft is drawn through it. Used whenever
 * the stator is off screen: the isolated rotor, and the alternative rotors
 * shown without their stator. Framing the housing there would leave the rotor
 * a small object in a large empty frame.
 */
export function rotorBounds(
  explode: number,
  shaftLength = SHAFT_LENGTH,
  /** Room for anything hung off the rotor — brush gear, for instance. */
  pad = 0,
): Bounds {
  const halfStack = MOTOR.stackLength / 2;
  const halfShaft = shaftLength / 2;
  // The magnets slide out of the +z face, and the shaft slides the same way.
  const frontZ = Math.min(-halfStack, -halfShaft + explode * 0.85);
  const backZ = Math.max(halfStack + explode * 0.3, halfShaft + explode * 0.85) + pad;
  const radius = MOTOR.rotorOuter + 0.04 + pad;
  return {
    half: [radius, radius, (backZ - frontZ) / 2],
    centre: [0, 0, (backZ + frontZ) / 2],
  };
}

/**
 * Looking down the bore at the gap. The subject is the bore, not the whole
 * lamination stack, so the outer ring is allowed to run to the frame edge.
 */
export function boreBounds(shaftLength = SHAFT_LENGTH): Bounds {
  const radius = MOTOR.statorOuter * 0.92;
  const halfDepth = Math.max(MOTOR.stackLength / 2 + 0.1, shaftLength / 2);
  return { half: [radius, radius, halfDepth], centre: [0, 0, 0] };
}

/** The axial stack: wide and shallow, and it grows along the axis when opened. */
export function axialBounds(exploded: number): Bounds {
  const halfDepth = AXIAL.discThickness * 1.5 + AXIAL.gap + exploded * 0.55 + 0.06;
  return {
    half: [AXIAL.outerRadius, AXIAL.outerRadius, Math.max(0.85, halfDepth)],
    centre: [0, 0, 0],
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
  /**
   * Fraction of the frame the subject may occupy, as [horizontal, vertical].
   *
   * The canvas is the whole viewport, but the reading card and the masthead
   * cover part of it, and the canvas is then translated into what is left.
   * Framing against the full frame and shifting afterwards is what pushed the
   * shaft of the exploded motor off the right edge. Each axis is solved
   * against its own budget: the subject only has to clear the one that binds,
   * and the camera distance keeps the shot's proportions either way.
   */
  fit: readonly [number, number] = [1, 1],
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

  const budgetX = Math.max(0.15, fit[0]);
  const budgetY = Math.max(0.15, fit[1]);

  const distance =
    (Math.max(
      halfWidth / Math.tan(hFov / 2) / budgetX,
      halfHeight / Math.tan(vFov / 2) / budgetY,
    ) +
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
