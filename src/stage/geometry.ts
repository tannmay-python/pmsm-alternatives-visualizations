import * as THREE from "three";

/**
 * Real machine profiles, built as extruded 2D contours rather than assembled
 * from primitives. A lamination stack is a stamped shape swept along the axis,
 * which is what it physically is, and it reads as a machine because of that.
 *
 * All dimensions are in stage units: 1 unit ≈ 100 mm on a ~220 mm stator.
 */

export const MOTOR = {
  statorOuter: 1.1,
  statorBore: 0.63,
  slotCount: 48,
  /** Fraction of each slot pitch taken by the tooth face rather than the opening. */
  toothFaceFraction: 0.52,
  slotDepth: 0.3,
  /** Radial thickness of the tooth tip that closes the slot over the copper. */
  slotLipDepth: 0.028,
  stackLength: 0.94,
  airGap: 0.012,
  rotorOuter: 0.618,
  shaftRadius: 0.15,
  housingOuter: 1.28,
  housingLength: 1.34,
  endCapLength: 0.1,
  phases: 3,
} as const;

const TAU = Math.PI * 2;

/** A point on a circle of the given radius. */
const polar = (radius: number, angle: number): [number, number] => [
  Math.cos(angle) * radius,
  Math.sin(angle) * radius,
];

const arcTo = (
  path: THREE.Path | THREE.Shape,
  radius: number,
  from: number,
  to: number,
  segments = 6,
) => {
  for (let i = 1; i <= segments; i += 1) {
    const angle = from + ((to - from) * i) / segments;
    const [x, y] = polar(radius, angle);
    path.lineTo(x, y);
  }
};

/**
 * The stator lamination: an annulus whose bore is interrupted by `slotCount`
 * open slots, each with a lip that partly closes it over the copper. This one
 * contour is what makes the part read as a stator instead of a ring.
 */
export function statorLaminationShape(): THREE.Shape {
  const {
    statorOuter,
    statorBore,
    slotCount,
    toothFaceFraction,
    slotDepth,
    slotLipDepth,
  } = MOTOR;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, statorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  const pitch = TAU / slotCount;
  const faceHalf = (pitch * toothFaceFraction) / 2;
  const slotHalf = (pitch * (1 - toothFaceFraction)) / 2;
  const slotOuter = statorBore + slotDepth;
  const lipRadius = statorBore + slotLipDepth;

  const [startX, startY] = polar(statorBore, -faceHalf);
  bore.moveTo(startX, startY);

  for (let slot = 0; slot < slotCount; slot += 1) {
    const centre = slot * pitch;
    // Tooth face, riding the bore.
    arcTo(bore, statorBore, centre - faceHalf, centre + faceHalf, 4);
    // Up the lip, out to the slot body, across its bottom, and back.
    const openHalf = slotHalf * 0.72;
    bore.lineTo(...polar(lipRadius, centre + faceHalf));
    bore.lineTo(...polar(lipRadius, centre + pitch / 2 - openHalf * 0.2));
    arcTo(bore, slotOuter, centre + pitch / 2 - openHalf, centre + pitch / 2 + openHalf, 3);
    bore.lineTo(...polar(lipRadius, centre + pitch - faceHalf + openHalf * 0.2));
    bore.lineTo(...polar(lipRadius, centre + pitch - faceHalf));
  }

  bore.closePath();
  shape.holes.push(bore);
  return shape;
}

/** Which of the three phase groups owns a given slot. */
export const slotPhase = (slot: number) => slot % MOTOR.phases;

/**
 * A hairpin conductor: down one slot, over the end turn, back up the slot a
 * pole pitch away. Swept as a tube, this is what gives the stator its woven
 * copper end windings instead of a torus.
 */
export function hairpinCurve(slot: number, span: number): THREE.CatmullRomCurve3 {
  const { slotCount, statorBore, slotDepth, stackLength } = MOTOR;
  const pitch = TAU / slotCount;
  const radius = statorBore + slotDepth * 0.55;
  const half = stackLength / 2;
  const a = slot * pitch;
  const b = (slot + span) * pitch;
  const noseA = a + pitch * span * 0.28;
  const noseB = a + pitch * span * 0.72;
  const lift = 0.16;

  const at = (angle: number, z: number, r = radius) =>
    new THREE.Vector3(...polar(r, angle), z);

  return new THREE.CatmullRomCurve3(
    [
      at(a, -half - 0.11),
      at(a, -half + 0.02),
      at(a, half - 0.02),
      at(a, half + 0.07),
      at(noseA, half + 0.07 + lift, radius + 0.02),
      at(noseB, half + 0.07 + lift, radius + 0.02),
      at(b, half + 0.07),
      at(b, half - 0.02),
      at(b, -half + 0.02),
      at(b, -half - 0.11),
    ],
    false,
    "catmullrom",
    0.18,
  );
}

/**
 * The IPM rotor lamination. Magnets sit in V-shaped pockets under steel
 * bridges, and each pocket carries air barriers at its ends. Those barriers
 * are what make the steel magnetically lopsided, so this contour is the
 * geometric reason reluctance torque exists at all.
 */
export function rotorLaminationShape(
  poles: number,
  options: { pocketWidth?: number; barrier?: boolean } = {},
): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const { pocketWidth = 0.3, barrier = true } = options;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, rotorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);

  const pitch = TAU / poles;
  const vHalfAngle = pitch * 0.19;
  const inner = rotorOuter * 0.5;
  const outer = rotorOuter * 0.82;

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    for (const side of [-1, 1] as const) {
      const pocket = new THREE.Path();
      const near = centre + side * vHalfAngle * 0.35;
      const far = centre + side * vHalfAngle * 1.55;
      const w = pocketWidth * 0.06;

      pocket.moveTo(...polar(inner, near - side * w));
      pocket.lineTo(...polar(outer, far - side * w));
      if (barrier) {
        // The air barrier that runs past the magnet toward the rim.
        pocket.lineTo(...polar(outer + 0.055, far + side * w * 0.4));
      }
      pocket.lineTo(...polar(outer, far + side * w));
      pocket.lineTo(...polar(inner, near + side * w));
      pocket.closePath();
      shape.holes.push(pocket);
    }
  }

  return shape;
}

/** A pure reluctance rotor: no pockets for magnets, only nested flux barriers. */
export function reluctanceLaminationShape(poles = 4, layers = 3): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rotorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);

  const pitch = TAU / poles;

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    for (let layer = 0; layer < layers; layer += 1) {
      const t = (layer + 1) / (layers + 1);
      const depth = shaftRadius + (rotorOuter - shaftRadius) * t;
      const spanAngle = pitch * (0.42 - layer * 0.055);
      const thickness = 0.05;

      const barrier = new THREE.Path();
      const [sx, sy] = polar(depth, centre - spanAngle);
      barrier.moveTo(sx, sy);
      arcTo(barrier, depth, centre - spanAngle, centre + spanAngle, 10);
      arcTo(barrier, depth + thickness, centre + spanAngle, centre - spanAngle, 10);
      barrier.closePath();
      shape.holes.push(barrier);
    }
  }

  return shape;
}

/** A squirrel-cage rotor lamination: closed steel with slots for the bars. */
export function cageLaminationShape(bars = 34): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rotorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);

  const pitch = TAU / bars;
  const radius = rotorOuter - 0.075;

  for (let bar = 0; bar < bars; bar += 1) {
    const angle = bar * pitch;
    const [cx, cy] = polar(radius, angle);
    const slot = new THREE.Path();
    slot.absarc(cx, cy, 0.033, 0, TAU, true);
    shape.holes.push(slot);
  }

  return shape;
}

/** Bar centres for the cage conductors, matching `cageLaminationShape`. */
export function cageBarPositions(bars = 34) {
  const radius = MOTOR.rotorOuter - 0.075;
  return Array.from({ length: bars }, (_, bar) => {
    const angle = (bar / bars) * TAU;
    return { angle, position: polar(radius, angle) };
  });
}

/**
 * The housing profile: a cast shell with cooling ribs and mounting bosses
 * around it. Extruding this rather than stacking boxes is what stops the
 * outside of the motor reading as a cylinder with decoration.
 */
export function housingShape(): THREE.Shape {
  const { housingOuter } = MOTOR;
  const shape = new THREE.Shape();
  const ribs = 36;
  const pitch = TAU / ribs;

  for (let rib = 0; rib < ribs; rib += 1) {
    const base = rib * pitch;
    const outer = housingOuter + 0.05;
    if (rib === 0) shape.moveTo(...polar(housingOuter, base));
    arcTo(shape, housingOuter, base, base + pitch * 0.42, 2);
    shape.lineTo(...polar(outer, base + pitch * 0.5));
    arcTo(shape, outer, base + pitch * 0.5, base + pitch * 0.62, 1);
    shape.lineTo(...polar(housingOuter, base + pitch * 0.7));
    arcTo(shape, housingOuter, base + pitch * 0.7, base + pitch, 2);
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, MOTOR.statorOuter + 0.02, 0, TAU, true);
  shape.holes.push(bore);
  return shape;
}

/**
 * The end cap, as a real casting: a bolt flange, a bearing boss and lightening
 * holes between the spokes. The holes matter for more than accuracy — a solid
 * disc hides the machine behind it the moment the view is exploded.
 */
export function endCapShape(spokes = 6): THREE.Shape {
  const { housingOuter, shaftRadius } = MOTOR;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, housingOuter, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius + 0.11, 0, TAU, true);
  shape.holes.push(bore);

  const pitch = TAU / spokes;
  const inner = shaftRadius + 0.2;
  const outer = housingOuter - 0.19;
  const spokeHalf = pitch * 0.13;

  for (let i = 0; i < spokes; i += 1) {
    const centre = i * pitch + pitch / 2;
    const hole = new THREE.Path();
    const from = centre - pitch / 2 + spokeHalf;
    const to = centre + pitch / 2 - spokeHalf;
    hole.moveTo(...polar(inner, from));
    arcTo(hole, inner, from, to, 8);
    arcTo(hole, outer, to, from, 8);
    hole.closePath();
    shape.holes.push(hole);
  }

  return shape;
}

/** Mounting boss positions around the end cap. */
export const boltCircle = (count = 8, radius = MOTOR.housingOuter - 0.08) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * TAU + TAU / (count * 2);
    return { angle, position: polar(radius, angle) };
  });

const extrude = (shape: THREE.Shape, depth: number, bevel = 0.006) =>
  new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
    curveSegments: 16,
    steps: 1,
  });

/** Extrude a lamination contour along the axis and centre it on the origin. */
export function laminationGeometry(shape: THREE.Shape, length: number, bevel = 0.006) {
  const geometry = extrude(shape, length, bevel);
  geometry.translate(0, 0, -length / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Axial offsets for the exploded view, as a fraction of the explode scalar.
 * One number drives every part, so the control works identically whichever
 * rotor is currently fitted.
 */
/**
 * At full explode the parts lay out along the axis in assembly order, left to
 * right, with gaps wide enough to see each one whole — the arrangement in
 * design/references/03-exploded-motor.png. Housing holds station at zero so
 * the reader keeps a fixed reference while the rest moves.
 */
export const EXPLODE_OFFSETS = {
  frontCap: -2.05,
  frontBearing: -1.7,
  housing: 0,
  statorCore: 1.95,
  windings: 1.95,
  rotor: 3.4,
  rearBearing: 4.75,
  rearCap: 5.1,
  shaft: 6.5,
} as const;

export type ExplodePart = keyof typeof EXPLODE_OFFSETS;

export const explodeZ = (part: ExplodePart, explode: number) =>
  EXPLODE_OFFSETS[part] * explode;
