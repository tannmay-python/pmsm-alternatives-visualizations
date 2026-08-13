export const finalDecisionStepIds = [
  "vehicle-survivors-and-changes",
  "swap-burden-spectrum",
  "india-capability-stack",
  "final-decision-map",
] as const;

export type FinalDecisionStep = (typeof finalDecisionStepIds)[number];

export const isFinalDecisionStep = (stepId: string): stepId is FinalDecisionStep =>
  finalDecisionStepIds.includes(stepId as FinalDecisionStep);

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

export const capabilityArchitectures = [
  { id: "pm-reduction", label: "PM reduction" },
  { id: "wound-field", label: "Wound field" },
  { id: "reluctance", label: "Reluctance" },
] as const;

export type CapabilityArchitectureId = (typeof capabilityArchitectures)[number]["id"];

export const capabilityLayers = [
  "Materials",
  "Machine",
  "Electronics / control",
  "Cooling / testing",
  "Manufacturing",
] as const;

export const capabilityPaths: Readonly<Record<CapabilityArchitectureId, readonly number[]>> = {
  "pm-reduction": [0, 1, 3, 4],
  "wound-field": [1, 2, 3, 4],
  reluctance: [0, 1, 2, 3, 4],
};

export const decisionQuestions = [
  {
    id: "hree-now",
    label: "Reduce Dy/Tb exposure now",
    mechanism: "Cooling or grain-boundary diffusion",
    burden: "Retain PM architecture; still validate",
    maturity: "Motor-specific evidence",
  },
  {
    id: "remove-rare-earths",
    label: "Remove all rare earths",
    mechanism: "Change rotor-field mechanism",
    burden: "Drive-unit redesign",
    maturity: "Architecture-specific",
  },
  {
    id: "high-speed",
    label: "Optimise high-speed control",
    mechanism: "Flux and rotor design",
    burden: "Inverter and thermal integration",
    maturity: "Design-specific",
  },
  {
    id: "industrial-induction",
    label: "Replace industrial induction",
    mechanism: "Efficiency and system fit",
    burden: "Different duty and incumbent",
    maturity: "Application-specific",
  },
  {
    id: "new-material",
    label: "Explore a new material",
    mechanism: "Material properties first",
    burden: "Motor and evidence work",
    maturity: "Research and validation",
  },
] as const;

export type DecisionQuestionId = (typeof decisionQuestions)[number]["id"];
