import * as THREE from "three";

/**
 * One material set for the whole machine, matched to the studio references in
 * design/references. Everything is a grey machined surface except the single
 * part currently under discussion, which takes the accent.
 */

/**
 * Values are the base colours of real machined parts under studio light, which
 * is what the reference renders show: cast aluminium is bright, not charcoal.
 * Reading them as dark greys is what made an earlier build look like plastic.
 *
 * The cool steel, copper and magnet blue below are ported from the first
 * version of this piece. The lime that replaced them was the single loudest
 * complaint of the 26 August review — "that dirty green just changes the whole
 * thing", "if you want to show a casing don't show it in that horrible green"
 * — and it is gone. What reads as "look here" is now the copper the windings
 * are already made of, which is warm enough to lead the eye without turning a
 * machined part a colour no machined part is.
 *
 * These are deliberately not the Takshashila brand colours. Wine and marigold
 * are the page; steel and copper are the machine. Painting the model in brand
 * colours was tried and rejected: "that feels a little too branded… it's like
 * you were asked to use three colours so now you're just going to paint
 * randomly in these three colours."
 */
export const PALETTE = {
  /** The "look at this part" colour. Copper, because the motor is full of it. */
  accent: "#c4763f",
  accentDim: "#a75c2c",
  warn: "#d9531c",
  copper: "#c4763f",
  copperLit: "#dd9046",
  /** Housing, ribs and cooling fins: cool light steel. */
  castAluminium: "#cdd0d8",
  housingRib: "#bcbfc8",
  housingFin: "#b6bac4",
  /** End caps, bosses and bolts sit a step darker than the shell. */
  steelMid: "#9fa2ac",
  steelLight: "#c3c7d0",
  /** Electrical steel laminations: darker and bluer than the castings. */
  laminate: "#b7bcc6",
  laminateRing: "#656b76",
  /** Magnet poles. The blue pair is what makes polarity readable at a glance. */
  magnet: "#4a6792",
  magnetSouth: "#2c384e",
  magnetEdge: "#e3e8f2",
  ferrite: "#4a4d56",
  aluminium: "#aeb6b3",
  shaft: "#7f818a",
  bearing: "#656a74",
  seal: "#282a31",
} as const;

const cast = (color: string, roughness: number, metalness: number) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

export const makeMaterials = () => ({
  /** Sand-cast aluminium: rough, low specular. */
  housing: cast(PALETTE.castAluminium, 0.6, 0.55),
  endCap: cast(PALETTE.steelMid, 0.54, 0.62),
  /** Lamination stacks read as stacked steel, not polished metal. */
  laminate: cast(PALETTE.steelLight, 0.46, 0.84),
  rotorLaminate: cast(PALETTE.laminate, 0.42, 0.86),
  /** Ground shaft and bearing races: the only near-mirror surfaces. */
  shaft: cast(PALETTE.shaft, 0.18, 0.95),
  bearing: cast(PALETTE.bearing, 0.24, 0.9),
  copper: cast(PALETTE.copper, 0.38, 0.72),
  aluminium: cast(PALETTE.aluminium, 0.34, 0.88),
  magnet: cast(PALETTE.magnet, 0.28, 0.82),
  magnetSouth: cast(PALETTE.magnetSouth, 0.32, 0.78),
  ferrite: cast(PALETTE.ferrite, 0.78, 0.12),
});

export type MotorMaterials = ReturnType<typeof makeMaterials>;
