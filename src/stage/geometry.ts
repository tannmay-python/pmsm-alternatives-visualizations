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

/** The full drive shaft, as fitted: it runs out past both end caps. */
export const SHAFT_LENGTH = MOTOR.housingLength * 1.85;
/**
 * The stub of shaft drawn when the rotor is shown on its own. The full shaft
 * is two and a half times the rotor's length, and framing it would shrink the
 * part the frame is actually about.
 */
export const ROTOR_SHAFT_LENGTH = MOTOR.stackLength * 1.5;

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
/**
 * One leg of a V: the centreline of a magnet pocket, from its inner end near
 * the shaft to its outer end near the rim. Both the lamination holes and the
 * magnets that sit in them are built from this, so they cannot disagree.
 */
export function ipmMagnetPlacements(poles: number, thickness: number) {
  const { rotorOuter, shaftRadius } = MOTOR;
  const pitch = TAU / poles;
  const inner = shaftRadius + (rotorOuter - shaftRadius) * 0.4;
  const outer = rotorOuter * 0.84;
  // The two inner ends of a V must clear each other by at least a pocket.
  const nearAngle = Math.max(pitch * 0.14, Math.asin((thickness / 2 + 0.02) / inner));
  const farAngle = pitch * 0.31;

  const items: {
    key: string;
    pole: number;
    side: -1 | 1;
    centre: [number, number];
    /** Rotation about z that lays the magnet's long side along the pocket. */
    rotation: number;
    length: number;
    isNorth: boolean;
    start: [number, number];
    end: [number, number];
  }[] = [];

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    for (const side of [-1, 1] as const) {
      const start = polar(inner, centre + side * nearAngle);
      const end = polar(outer, centre + side * farAngle);
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      items.push({
        key: `${pole}-${side}`,
        pole,
        side,
        centre: [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
        rotation: Math.atan2(dy, dx),
        length: Math.hypot(dx, dy),
        isNorth: pole % 2 === 0,
        start,
        end,
      });
    }
  }
  return items;
}

export function rotorLaminationShape(
  poles: number,
  options: { magnetThickness?: number; barrier?: boolean } = {},
): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const { magnetThickness = 0.05, barrier = true } = options;

  const shape = new THREE.Shape();
  shape.absarc(0, 0, rotorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);

  // A pocket is a rectangle around the magnet, plus a short air barrier that
  // carries on past its outer end toward the rim.
  const half = magnetThickness / 2 + 0.008;
  for (const { start, end, rotation, side } of ipmMagnetPlacements(poles, magnetThickness)) {
    const nx = -Math.sin(rotation) * half;
    const ny = Math.cos(rotation) * half;
    const ex = Math.cos(rotation);
    const ey = Math.sin(rotation);
    const pocket = new THREE.Path();
    pocket.moveTo(start[0] - nx, start[1] - ny);
    pocket.lineTo(end[0] - nx, end[1] - ny);
    if (barrier) {
      const reach = 0.05;
      // The barrier leans outward, following the V, so the bridge to the rim
      // stays a bridge and the steel stays lopsided.
      const bx = end[0] + ex * reach * 0.6 - side * ey * reach * 0.5;
      const by = end[1] + ey * reach * 0.6 + side * ex * reach * 0.5;
      pocket.lineTo(bx - nx * 0.5, by - ny * 0.5);
      pocket.lineTo(bx + nx * 0.5, by + ny * 0.5);
    }
    pocket.lineTo(end[0] + nx, end[1] + ny);
    pocket.lineTo(start[0] + nx, start[1] + ny);
    pocket.closePath();
    shape.holes.push(pocket);
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

/** Wound-field rotor proportions: a salient pole with a shoe, and a coil under it. */
export const WOUND = {
  poles: 4,
  /** Radius of the round core the poles grow out of. */
  coreRadius: 0.33,
  /** Underside of the pole shoe: the coil sits between here and the core. */
  shoeInner: 0.5,
  /** Half-width of the straight pole body the coil is wound around. */
  bodyHalf: 0.11,
  /** Half-angle of the pole shoe at the rim. */
  shoeHalfAngle: (TAU / 4) * 0.27,
} as const;

/**
 * A wound-field rotor: salient poles with shoes on a round core, exactly the
 * shape a coil can be wound around. Drawing it as a slotted drum hides the
 * one thing this rotor has that a magnet rotor lacks — a bobbin of copper.
 */
export function woundRotorShape(poles = WOUND.poles): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const { coreRadius, shoeInner, bodyHalf, shoeHalfAngle } = WOUND;
  const shape = new THREE.Shape();
  const pitch = TAU / poles;
  const rootAngle = Math.asin(bodyHalf / coreRadius);
  const rootX = Math.sqrt(coreRadius * coreRadius - bodyHalf * bodyHalf);
  const shoeChord = shoeInner * Math.sin(shoeHalfAngle);
  const shoeX = shoeInner * Math.cos(shoeHalfAngle);

  // Local pole coordinates: x radial, y tangential, counter-clockwise order.
  const local = (angle: number, x: number, y: number): [number, number] => [
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle),
  ];

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    const p1 = local(centre, rootX, -bodyHalf);
    if (pole === 0) shape.moveTo(...p1);
    else shape.lineTo(...p1);
    shape.lineTo(...local(centre, shoeInner - 0.02, -bodyHalf));
    shape.lineTo(...local(centre, shoeX, -shoeChord));
    arcTo(shape, rotorOuter, centre - shoeHalfAngle, centre + shoeHalfAngle, 6);
    shape.lineTo(...local(centre, shoeX, shoeChord));
    shape.lineTo(...local(centre, shoeInner - 0.02, bodyHalf));
    shape.lineTo(...local(centre, rootX, bodyHalf));
    arcTo(shape, coreRadius, centre + rootAngle, centre + pitch - rootAngle, 8);
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);
  return shape;
}

/** Cage proportions: bars lie in open grooves so they show along the rotor's length. */
export const CAGE = {
  bars: 34,
  barRadius: 0.034,
  /** Radius of the bar centres. */
  barCentre: MOTOR.rotorOuter - 0.06,
  /** Floor of the groove each bar sits in. */
  grooveFloor: MOTOR.rotorOuter - 0.105,
  /** Half-angle of the groove opening at the rim. */
  grooveHalf: 0.045 / MOTOR.rotorOuter,
} as const;

/**
 * A squirrel-cage rotor lamination: steel with an open groove for every bar.
 * Real cages bury the bars under a thin bridge, which is exactly why a reader
 * has never seen one; here the grooves are open so the bars read from outside.
 */
export function cageLaminationShape(bars = CAGE.bars): THREE.Shape {
  const { rotorOuter, shaftRadius } = MOTOR;
  const { grooveFloor, grooveHalf } = CAGE;
  const shape = new THREE.Shape();
  const pitch = TAU / bars;

  for (let bar = 0; bar < bars; bar += 1) {
    const a = bar * pitch;
    const [sx, sy] = polar(rotorOuter, a + grooveHalf);
    if (bar === 0) shape.moveTo(sx, sy);
    else shape.lineTo(sx, sy);
    // Rim between this groove and the next.
    arcTo(shape, rotorOuter, a + grooveHalf, a + pitch - grooveHalf, 3);
    // Down into the next groove, across its floor, and back up.
    shape.lineTo(...polar(grooveFloor, a + pitch - grooveHalf * 0.9));
    arcTo(shape, grooveFloor, a + pitch - grooveHalf * 0.9, a + pitch + grooveHalf * 0.9, 2);
    shape.lineTo(...polar(rotorOuter, a + pitch + grooveHalf));
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);
  return shape;
}

/** Bar centres for the cage conductors, matching `cageLaminationShape`. */
export function cageBarPositions(bars = CAGE.bars) {
  return Array.from({ length: bars }, (_, bar) => {
    const angle = (bar / bars) * TAU;
    return { angle, position: polar(CAGE.barCentre, angle) };
  });
}

/**
 * A salient-pole stator, for switched reluctance.
 *
 * This is the one place the stator genuinely differs. An SRM does not use the
 * 48-slot distributed winding every other machine here shares: it has a small
 * number of chunky inward poles, each carrying its own concentrated coil, and
 * the machine works by energising opposite pairs in sequence. Drawing it with
 * the distributed stator would show the wrong machine.
 */
export function salientStatorShape(poles = 12): THREE.Shape {
  const { statorOuter } = MOTOR;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, statorOuter, 0, TAU, false);

  const bore = new THREE.Path();
  const pitch = TAU / poles;
  const poleHalf = pitch * 0.28;
  const backIron = statorOuter - 0.16;
  const poleTip = SRM.statorPoleTip;

  const [sx, sy] = polar(poleTip, -poleHalf);
  bore.moveTo(sx, sy);

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    // Pole face, riding the bore.
    arcTo(bore, poleTip, centre - poleHalf, centre + poleHalf, 5);
    // Out along the pole flank, across the slot, and back down the next flank.
    bore.lineTo(...polar(backIron, centre + poleHalf));
    arcTo(bore, backIron, centre + poleHalf, centre + pitch - poleHalf, 5);
    bore.lineTo(...polar(poleTip, centre + pitch - poleHalf));
  }

  bore.closePath();
  shape.holes.push(bore);
  return shape;
}

/** A salient-pole rotor: plain steel lumps, no magnets, no windings, no cage. */
export function salientRotorShape(poles = 8): THREE.Shape {
  const { shaftRadius } = MOTOR;
  const shape = new THREE.Shape();

  const pitch = TAU / poles;
  const poleHalf = pitch * 0.3;
  const root = SRM.rotorRoot;
  const tip = SRM.rotorTip;

  const [sx, sy] = polar(tip, -poleHalf);
  shape.moveTo(sx, sy);

  for (let pole = 0; pole < poles; pole += 1) {
    const centre = pole * pitch;
    arcTo(shape, tip, centre - poleHalf, centre + poleHalf, 5);
    shape.lineTo(...polar(root, centre + poleHalf));
    arcTo(shape, root, centre + poleHalf, centre + pitch - poleHalf, 5);
    shape.lineTo(...polar(tip, centre + pitch - poleHalf));
  }
  shape.closePath();

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius, 0, TAU, true);
  shape.holes.push(bore);
  return shape;
}

/** Switched-reluctance proportions, kept together so the pair stays consistent. */
export const SRM = {
  statorPoles: 12,
  rotorPoles: 8,
  statorPoleTip: 0.66,
  rotorTip: 0.648,
  rotorRoot: 0.44,
} as const;

/**
 * Axial flux is a topology, not a rotor swap.
 *
 * The field runs along the shaft rather than across a radial air gap, so the
 * machine is a stack of discs rather than a barrel. None of the radial parts
 * apply, which is exactly the point worth showing: a ferrite axial motor is
 * both a different chemistry and a different geometry at once.
 */
export const AXIAL = {
  outerRadius: 1.16,
  innerRadius: 0.42,
  discThickness: 0.11,
  coilCount: 12,
  magnetCount: 16,
  gap: 0.075,
} as const;

/** Magnet positions on one axial rotor disc face. */
export function axialMagnetPositions(count = AXIAL.magnetCount) {
  const radius = (AXIAL.outerRadius + AXIAL.innerRadius) / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * TAU;
    return { angle, position: polar(radius, angle), polarity: i % 2 === 0 ? 1 : -1 };
  });
}

/** Coil positions on the axial stator ring, sitting between the two rotors. */
export function axialCoilPositions(count = AXIAL.coilCount) {
  const radius = (AXIAL.outerRadius + AXIAL.innerRadius) / 2;
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * TAU;
    return { angle, position: polar(radius, angle), phase: i % MOTOR.phases };
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

/** The end cap sits inside the housing's rib line, a step smaller than the shell. */
export const END_CAP_RADIUS = MOTOR.housingOuter - 0.1;

/**
 * The end cap: a plain cast disc with a bearing boss, sized a step inside the
 * housing. An earlier spoked version read as a bicycle wheel one frame after
 * the car, and a solid disc hides nothing once the row is seen from the side.
 */
export function endCapShape(): THREE.Shape {
  const { shaftRadius } = MOTOR;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, END_CAP_RADIUS, 0, TAU, false);

  const bore = new THREE.Path();
  bore.absarc(0, 0, shaftRadius + 0.11, 0, TAU, true);
  shape.holes.push(bore);

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
  frontCap: -2.0,
  frontBearing: -1.6,
  housing: 0,
  statorCore: 1.95,
  windings: 1.95,
  /** Far enough that at the tour's 0.55 the rotor clears the stator's end turns. */
  rotor: 4.2,
  rearBearing: 5.5,
  rearCap: 5.9,
  shaft: 7.5,
} as const;

export type ExplodePart = keyof typeof EXPLODE_OFFSETS;

export const explodeZ = (part: ExplodePart, explode: number) =>
  EXPLODE_OFFSETS[part] * explode;
