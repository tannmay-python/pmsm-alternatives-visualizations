/**
 * Geometry and state calculation helpers for Chapter 4 exposure visuals.
 */

export type ReeGroup = "Nd/Pr" | "Dy/Tb";

export type MitigationRung = 0 | 1 | 2 | 3 | 4;

export const MITIGATION_RUNGS = [
  { id: 0, label: "Rotor cooling", shortLabel: "Cooling", footprint: "rotor-cooling" },
  { id: 1, label: "Grain-boundary diffusion", shortLabel: "GBD", footprint: "gbd-boundary" },
  { id: 2, label: "HREE-free NdFeB", shortLabel: "HREE-free", footprint: "rotor-magnets" },
  { id: 3, label: "Alternate magnet chemistry", shortLabel: "Alt chem", footprint: "rotor-stator" },
  { id: 4, label: "New motor architecture", shortLabel: "New arch", footprint: "drive-unit-redesign" },
] as const;

export type MotorFamilyKey = "pmsm" | "wound" | "synrm" | "srm" | "induction";

export const MOTOR_FAMILIES: ReadonlyArray<{
  id: MotorFamilyKey;
  label: string;
  branch: "synchronous" | "asynchronous";
  rotorType: string;
  hasSlip: boolean;
}> = [
  { id: "pmsm", label: "PMSM", branch: "synchronous", rotorType: "Permanent magnet", hasSlip: false },
  { id: "wound", label: "Wound field", branch: "synchronous", rotorType: "Powered winding", hasSlip: false },
  { id: "synrm", label: "SynRM", branch: "synchronous", rotorType: "Shaped steel", hasSlip: false },
  { id: "srm", label: "SRM", branch: "synchronous", rotorType: "Salient pole", hasSlip: false },
  { id: "induction", label: "Induction", branch: "asynchronous", rotorType: "Induction cage", hasSlip: true },
];

/**
 * Calculates normalized back-EMF height relative to DC bus ceiling.
 * Speed: 0 to 100. Returns value between 0.15 (base) and 0.94 (ceiling limit).
 */
export function calculateBackEmfHeight(speed: number): {
  normalized: number;
  nearingCeiling: boolean;
} {
  const clamped = Math.max(0, Math.min(100, speed));
  // Non-linear approach to ceiling (ceiling at y=110, base at y=380, height=270)
  const factor = clamped / 100;
  // Approaches ceiling smoothly without crashing into it
  const normalized = 0.15 + 0.79 * (1 - Math.exp(-2.2 * factor));
  return {
    normalized,
    nearingCeiling: clamped >= 75,
  };
}

/**
 * Calculates vector components for field weakening:
 * - Fixed magnet flux (purple vector pointing right)
 * - Counter-flux current (cyan vector pointing left)
 * - Resultant net flux (shorter vector)
 * - Added reactive/ohmic loss burden indicator
 */
export function calculateFieldWeakeningVectors(weakening: number): {
  magnetFlux: number;
  counterFlux: number;
  netFlux: number;
  hasLossBurden: boolean;
} {
  const clamped = Math.max(0, Math.min(100, weakening));
  const magnetFlux = 160; // fixed magnet flux length
  const counterFlux = Math.round((clamped / 100) * 115);
  const netFlux = Math.max(45, magnetFlux - counterFlux);
  return {
    magnetFlux,
    counterFlux,
    netFlux,
    hasLossBurden: clamped > 0,
  };
}

/**
 * Qualitative description of active footprint for mitigation ladder.
 */
export function getMitigationFootprintInfo(rung: MitigationRung): {
  label: string;
  affectedModules: string[];
  retainedModules: string[];
} {
  switch (rung) {
    case 0:
      return {
        label: "Rotor cooling",
        affectedModules: ["Rotor cooling channel"],
        retainedModules: ["Stator", "Inverter", "Housing", "Transmission"],
      };
    case 1:
      return {
        label: "Grain-boundary diffusion",
        affectedModules: ["Magnet grain boundaries"],
        retainedModules: ["Stator", "Inverter", "Housing", "Transmission"],
      };
    case 2:
      return {
        label: "HREE-free NdFeB",
        affectedModules: ["Rotor magnet blocks"],
        retainedModules: ["Stator", "Inverter", "Housing", "Transmission"],
      };
    case 3:
      return {
        label: "Alternate magnet chemistry",
        affectedModules: ["Rotor magnets", "Stator winding tuning"],
        retainedModules: ["Inverter", "Housing", "Transmission"],
      };
    case 4:
      return {
        label: "New motor architecture",
        affectedModules: ["Motor architecture", "Inverter control", "Cooling system", "Validation runway"],
        retainedModules: ["Transmission housing layout"],
      };
  }
}
