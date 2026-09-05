import * as THREE from "three";

/**
 * One material set for the whole machine.
 *
 * The stage sits on an off-white page, so the four structural materials have
 * to be separable from each other *and* from the ground at a glance, without
 * any of them turning a colour a machined part is not:
 *
 *   housing   — cast aluminium, a light warm grey (the lightest thing on stage)
 *   stator    — the lamination stack, a distinctly darker blue-grey steel
 *   rotor     — mid grey steel, between the two
 *   copper    — warm, and the only "look here" colour apart from the magnets
 *
 * Permanent magnets take one saturated colour used nowhere else: a deep
 * cobalt. North and south are two close shades of it, so polarity is readable
 * without introducing a second hue. Ferrite is a dark charcoal, because it is.
 * Cage bars are cast aluminium and read as pale silver, not copper.
 *
 * These are deliberately not the Takshashila brand colours. Wine and marigold
 * are the page; steel, copper and cobalt are the machine.
 */
export const PALETTE = {
  /** The "look at this part" colour. Copper, because the motor is full of it. */
  accent: "#c4763f",
  accentDim: "#a75c2c",
  warn: "#d9531c",
  copper: "#c97a3e",
  copperLit: "#e39449",
  /** Housing, ribs and cooling fins: light warm cast aluminium. */
  castAluminium: "#d9d5cc",
  housingRib: "#c9c5bc",
  housingFin: "#c2beb5",
  /** End caps, bosses and bolts sit a step darker and warmer than the shell. */
  steelMid: "#aaa69e",
  steelLight: "#cbc7bf",
  /** Stator electrical steel: dark blue-grey, the darkest big surface on stage. */
  laminate: "#5f6a7a",
  laminateRing: "#4a5362",
  /** Rotor steel: a mid grey between the housing and the stator. */
  rotorSteel: "#9a9ea6",
  /** Magnet poles. Deep cobalt, used for nothing but permanent magnets. */
  magnet: "#1f3fbf",
  magnetSouth: "#2b56d6",
  magnetEdge: "#e3e8f2",
  ferrite: "#2c2d31",
  /** Cast-aluminium cage bars and end rings: pale silver. */
  aluminium: "#dde1e4",
  shaft: "#75787f",
  bearing: "#63676f",
  seal: "#282a31",
} as const;

const cast = (color: string, roughness: number, metalness: number) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

export const makeMaterials = () => ({
  /** Sand-cast aluminium: rough, low specular. */
  housing: cast(PALETTE.castAluminium, 0.62, 0.5),
  endCap: cast(PALETTE.steelMid, 0.56, 0.58),
  /** Lamination stacks read as stacked steel, not polished metal. */
  laminate: cast(PALETTE.laminate, 0.5, 0.72),
  rotorLaminate: cast(PALETTE.rotorSteel, 0.44, 0.8),
  /** Ground shaft and bearing races: the only near-mirror surfaces. */
  shaft: cast(PALETTE.shaft, 0.2, 0.95),
  bearing: cast(PALETTE.bearing, 0.24, 0.9),
  copper: cast(PALETTE.copper, 0.38, 0.72),
  aluminium: cast(PALETTE.aluminium, 0.3, 0.9),
  magnet: cast(PALETTE.magnet, 0.3, 0.6),
  magnetSouth: cast(PALETTE.magnetSouth, 0.32, 0.6),
  ferrite: cast(PALETTE.ferrite, 0.8, 0.1),
});

export type MotorMaterials = ReturnType<typeof makeMaterials>;
