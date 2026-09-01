/** Data and state helper for the Chapter 4 mitigation ladder. */

export const MITIGATION_RUNGS = [
  { id: 0, label: "Rotor cooling", shortLabel: "Cooling", footprint: "rotor-cooling" },
  { id: 1, label: "Grain-boundary diffusion", shortLabel: "GBD", footprint: "gbd-boundary" },
  { id: 2, label: "HREE-free NdFeB", shortLabel: "HREE-free", footprint: "rotor-magnets" },
  { id: 3, label: "Alternate magnet chemistry", shortLabel: "Alt chem", footprint: "rotor-stator" },
  { id: 4, label: "New motor architecture", shortLabel: "New arch", footprint: "drive-unit-redesign" },
] as const;

/**
 * Qualitative description of active footprint for mitigation ladder.
 */
export function getMitigationFootprintInfo(rung: 0 | 1 | 2 | 3 | 4): {
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
