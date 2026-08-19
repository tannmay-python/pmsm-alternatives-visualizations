import * as THREE from "three";

/**
 * One material set for the whole machine, matched to the studio references in
 * design/references. Everything is a grey machined surface except the single
 * part currently under discussion, which takes the accent.
 */

/**
 * Values are the base colours of real machined parts under studio light, which
 * is what the reference renders show: cast aluminium is bright, not charcoal.
 * Reading them as dark greys is what made the earlier build look like plastic.
 */
export const PALETTE = {
  accent: "#a8d82b",
  accentDim: "#6f9414",
  warn: "#d9531c",
  copper: "#b26c33",
  copperLit: "#dd9046",
  /** Sand-cast aluminium housing. */
  castAluminium: "#a6afac",
  steelMid: "#8f9997",
  steelLight: "#c9d0cd",
  /** Electrical steel laminations: darker and bluer than the castings. */
  laminate: "#6b7573",
  magnet: "#4a5250",
  ferrite: "#4e5457",
  aluminium: "#aeb6b3",
} as const;

const cast = (color: string, roughness: number, metalness: number) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

export const makeMaterials = () => ({
  /** Sand-cast aluminium: rough, low specular. */
  housing: cast(PALETTE.castAluminium, 0.66, 0.5),
  endCap: cast(PALETTE.steelMid, 0.54, 0.62),
  /** Lamination stacks read as stacked steel, not polished metal. */
  laminate: cast("#78827f", 0.46, 0.84),
  rotorLaminate: cast("#818b88", 0.42, 0.86),
  /** Ground shaft and bearing races: the only near-mirror surfaces. */
  shaft: cast(PALETTE.steelLight, 0.18, 0.95),
  bearing: cast(PALETTE.steelLight, 0.24, 0.9),
  copper: cast(PALETTE.copper, 0.38, 0.72),
  aluminium: cast(PALETTE.aluminium, 0.34, 0.88),
  magnet: cast(PALETTE.magnet, 0.4, 0.35),
  ferrite: cast(PALETTE.ferrite, 0.78, 0.12),
});

export type MotorMaterials = ReturnType<typeof makeMaterials>;

/** The accent material, used for exactly one part at a time. */
export const highlightMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: PALETTE.accent,
    roughness: 0.42,
    metalness: 0.3,
    emissive: PALETTE.accentDim,
    emissiveIntensity: 0.22,
  });

export const thermalMaterial = () =>
  new THREE.MeshStandardMaterial({
    color: PALETTE.warn,
    roughness: 0.5,
    metalness: 0.2,
    emissive: PALETTE.warn,
    emissiveIntensity: 0.3,
  });
