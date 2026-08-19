export const MAGNET_MODES = [
  "properties",
  "alloy",
  "heat",
  "heavyRareEarths",
  "diffusion",
  "cooling",
] as const;

export type MagnetMode = (typeof MAGNET_MODES)[number];

export type MagnetRisk = "low" | "watch" | "high";

export function clampUnit(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * A qualitative teaching aid, not a motor material model. Both heat and the
 * reverse stator field have to be considered when assessing demagnetisation
 * risk.
 */
export function qualitativeDemagnetisationRisk(
  thermalStress: number,
  reverseField: number,
): MagnetRisk {
  const combinedStress = clampUnit(thermalStress) * 0.55 + clampUnit(reverseField) * 0.45;

  if (combinedStress >= 68) return "high";
  if (combinedStress >= 35) return "watch";
  return "low";
}

export function nextMagnetMode(mode: MagnetMode, direction: -1 | 1): MagnetMode {
  const current = MAGNET_MODES.indexOf(mode);
  const next = (current + direction + MAGNET_MODES.length) % MAGNET_MODES.length;
  return MAGNET_MODES[next];
}
