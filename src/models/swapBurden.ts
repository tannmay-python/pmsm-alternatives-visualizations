export const architectureOptions = [
  { id: "reduced-hree", label: "Reduce Dy/Tb" },
  { id: "ferrite", label: "Ferrite PM" },
  { id: "induction", label: "Induction" },
  { id: "wound-field", label: "Wound field" },
  { id: "synrm", label: "SynRM" },
  { id: "srm", label: "SRM" },
] as const;

export type ArchitectureId = (typeof architectureOptions)[number]["id"];

export const architectureStates: Readonly<Record<ArchitectureId, {
  accent: "amber" | "copper" | "blue" | "violet";
  changed: readonly ("motor" | "inverter" | "cooling" | "validation")[];
  summary: string;
}>> = {
  "reduced-hree": {
    accent: "amber",
    changed: ["motor", "validation"],
    summary: "Retains the permanent-magnet architecture; motor-specific validation still applies.",
  },
  ferrite: {
    accent: "copper",
    changed: ["motor", "inverter", "cooling", "validation"],
    summary: "A magnet-chemistry change reaches beyond the chassis shell into the drive unit.",
  },
  induction: {
    accent: "blue",
    changed: ["motor", "inverter", "cooling", "validation"],
    summary: "The drive-unit design must account for a different rotor and thermal path.",
  },
  "wound-field": {
    accent: "violet",
    changed: ["motor", "inverter", "cooling", "validation"],
    summary: "Rotor excitation, heat, cooling hardware and controls become part of the architecture.",
  },
  synrm: {
    accent: "blue",
    changed: ["motor", "inverter", "cooling", "validation"],
    summary: "A pure SynRM can shift demand into the inverter and cooling system.",
  },
  srm: {
    accent: "copper",
    changed: ["motor", "inverter", "cooling", "validation"],
    summary: "The motor and its control system need to be considered together.",
  },
};

export const burdenRoutes = [
  {
    id: "hree",
    label: "Reduce Dy/Tb",
    position: 17,
    scope: "Retain the permanent-magnet architecture",
  },
  {
    id: "chemistry",
    label: "Change magnet chemistry",
    position: 47,
    scope: "Redesign the motor around a different material choice",
  },
  {
    id: "architecture",
    label: "Change rotor-field architecture",
    position: 82,
    scope: "Rework the motor with its inverter, cooling and validation scope",
  },
] as const;

export type BurdenRouteId = (typeof burdenRoutes)[number]["id"];
