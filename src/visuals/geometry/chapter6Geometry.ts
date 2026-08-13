export const CHAPTER6_MAIN_STEPS = [
  "ferrite-material-not-architecture",
  "axial-flux-geometry",
  "iron-nitride-property-board",
  "stackable-motor-builder",
] as const;

export const CHAPTER6_OPTIONAL_STEPS = [
  "proterial-power-speed",
  "matter-variable-flux",
] as const;

export const CHAPTER6_STEPS = [
  ...CHAPTER6_MAIN_STEPS,
  ...CHAPTER6_OPTIONAL_STEPS,
] as const;

export type Chapter6Step = (typeof CHAPTER6_STEPS)[number];

export type MagnetChemistry = "ndfeb" | "ferrite";
export type CompensationPath = "diameter" | "length" | "speed";
export type GeometryShape = "radial" | "axial";
export type OperatingCondition = "hidden" | "shown";
export type SelectedProperty =
  | "saturation"
  | "remanence"
  | "coercivity"
  | "energy-product"
  | "thermal-margin";
export type VFMSpeedMode = "launch" | "cruise";
export type VFMFluxControl = "fixed" | "variable";

export type BuilderTorquePrinciple =
  | "pm"
  | "wound-field"
  | "reluctance"
  | "induction"
  | "hybrid";
export type BuilderExcitation =
  | "ipm"
  | "spm"
  | "contactless"
  | "brushed"
  | "salient-steel";
export type BuilderChemistry = "ndfeb" | "ferrite" | "iron-nitride" | "none";
export type BuilderGeometry = "radial" | "axial";
export type BuilderWinding = "copper" | "aluminium";

export type NamedExampleKey =
  | "tesla-ipm-synrm"
  | "conifer-ferrite-axial"
  | "aem-aluminium-srm"
  | "volektra-contactless-wound-field";

export type NamedExamplePreset = {
  id: NamedExampleKey;
  label: string;
  torquePrinciple: BuilderTorquePrinciple;
  excitation: BuilderExcitation;
  chemistry: BuilderChemistry;
  geometry: BuilderGeometry;
  winding: BuilderWinding;
  caveat: string;
};

/**
 * These are configuration examples, not performance comparisons or product
 * endorsements. The final entry intentionally stays inside the wound-field
 * family: contactless excitation is not a new motor physics category.
 */
export const NAMED_EXAMPLE_PRESETS: Record<NamedExampleKey, NamedExamplePreset> = {
  "tesla-ipm-synrm": {
    id: "tesla-ipm-synrm",
    label: "Tesla IPM-SynRM",
    torquePrinciple: "hybrid",
    excitation: "ipm",
    chemistry: "ndfeb",
    geometry: "radial",
    winding: "copper",
    caveat: "A stacked permanent-magnet and reluctance configuration.",
  },
  "conifer-ferrite-axial": {
    id: "conifer-ferrite-axial",
    label: "Conifer ferrite axial",
    torquePrinciple: "pm",
    excitation: "spm",
    chemistry: "ferrite",
    geometry: "axial",
    winding: "copper",
    caveat: "Ferrite chemistry and axial packaging are separate choices.",
  },
  "aem-aluminium-srm": {
    id: "aem-aluminium-srm",
    label: "AEM aluminium SRM",
    torquePrinciple: "reluctance",
    excitation: "salient-steel",
    chemistry: "none",
    geometry: "radial",
    winding: "aluminium",
    caveat: "A magnet-free reluctance stack with aluminium windings.",
  },
  "volektra-contactless-wound-field": {
    id: "volektra-contactless-wound-field",
    label: "Volektra contactless wound field",
    torquePrinciple: "wound-field",
    excitation: "contactless",
    chemistry: "none",
    geometry: "radial",
    winding: "copper",
    caveat: "Contactless excitation remains a wound-field route.",
  },
};

export type PropertyDefinition = {
  id: SelectedProperty;
  label: string;
  shortLabel: string;
  detail: string;
};

export const PROPERTY_DEFINITIONS: Record<SelectedProperty, PropertyDefinition> = {
  saturation: {
    id: "saturation",
    label: "Saturation (Ms)",
    shortLabel: "Saturation",
    detail: "Theoretical magnetic limit. It is not a usable-magnet score on its own.",
  },
  remanence: {
    id: "remanence",
    label: "Remanence (Br)",
    shortLabel: "Remanence",
    detail: "How much flux remains after magnetising help is removed.",
  },
  coercivity: {
    id: "coercivity",
    label: "Coercivity (Hcj)",
    shortLabel: "Coercivity",
    detail: "Resistance to reversal. A published iron-nitride patent specifies 2,000-4,000 Oe.",
  },
  "energy-product": {
    id: "energy-product",
    label: "Energy product (BHmax)",
    shortLabel: "Energy product",
    detail: "The magnet energy available per volume.",
  },
  "thermal-margin": {
    id: "thermal-margin",
    label: "Thermal margin",
    shortLabel: "Thermal margin",
    detail: "Fe16N2 literature reports decomposition around 500 K. That is a material gate, not a vehicle rating.",
  },
};

export type Chapter6StateTable = {
  activeState: Chapter6Step;
  magnetChemistry: MagnetChemistry;
  compensationPath: CompensationPath;
  geometryShape: GeometryShape;
  operatingCondition: OperatingCondition;
  selectedProperty: SelectedProperty;
  dropInCheck: boolean;
  vfmSpeedMode: VFMSpeedMode;
  vfmFluxControl: VFMFluxControl;
  builderTorquePrinciple: BuilderTorquePrinciple;
  builderExcitation: BuilderExcitation;
  builderChemistry: BuilderChemistry;
  builderGeometry: BuilderGeometry;
  builderWinding: BuilderWinding;
  selectedNamedExample: NamedExampleKey | null;
  paused: boolean;
  reducedMotion: boolean;
};

export function createInitialChapter6State(
  step: Chapter6Step = "ferrite-material-not-architecture",
  reducedMotion = false,
): Chapter6StateTable {
  return {
    activeState: step,
    magnetChemistry: "ndfeb",
    compensationPath: "diameter",
    geometryShape: "radial",
    operatingCondition: "hidden",
    selectedProperty: "saturation",
    dropInCheck: false,
    vfmSpeedMode: "launch",
    vfmFluxControl: "variable",
    builderTorquePrinciple: "pm",
    builderExcitation: "ipm",
    builderChemistry: "ndfeb",
    builderGeometry: "radial",
    builderWinding: "copper",
    selectedNamedExample: null,
    paused: false,
    reducedMotion,
  };
}

export type Chapter6Callout = {
  label: string;
  x: number;
  y: number;
};

/** Exactly two short, DOM-rendered labels are returned for every stage. */
export function getCalloutsForState(
  state: Chapter6Step,
  stateTable: Chapter6StateTable,
): readonly Chapter6Callout[] {
  switch (state) {
    case "ferrite-material-not-architecture":
      return [
        {
          label: stateTable.magnetChemistry === "ferrite" ? "Ferrite magnet" : "NdFeB magnet",
          x: 160,
          y: 78,
        },
        {
          label:
            stateTable.compensationPath === "diameter"
              ? "Diameter grows"
              : stateTable.compensationPath === "length"
                ? "Stack length"
                : "Higher speed",
          x: 726,
          y: 78,
        },
      ];
    case "axial-flux-geometry":
      return [
        {
          label: stateTable.geometryShape === "axial" ? "Axial flux" : "Radial flux",
          x: 160,
          y: 78,
        },
        {
          label: stateTable.geometryShape === "axial" ? "Disc package" : "Cylinder package",
          x: 726,
          y: 78,
        },
      ];
    case "iron-nitride-property-board":
      return [
        { label: "Iron nitride", x: 160, y: 78 },
        { label: stateTable.dropInCheck ? "Five gates" : "One property", x: 726, y: 78 },
      ];
    case "stackable-motor-builder":
      return [
        { label: "Independent layers", x: 160, y: 78 },
        { label: "Stacked motor", x: 726, y: 78 },
      ];
    case "proterial-power-speed":
      return stateTable.operatingCondition === "shown"
        ? [
            { label: "102 kW at 15,000 rpm", x: 206, y: 78 },
            { label: "110 kW at 10,000 rpm", x: 663, y: 78 },
          ]
        : [
            { label: "Prototype comparison", x: 184, y: 78 },
            { label: "Speed required", x: 716, y: 78 },
          ];
    case "matter-variable-flux":
      return [
        { label: stateTable.vfmSpeedMode === "cruise" ? "Weakened flux" : "Launch flux", x: 160, y: 78 },
        { label: "Prototype study", x: 726, y: 78 },
      ];
  }
}

export function isProhibitedText(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "ferrite is a motor architecture",
    "axial flux is a magnet material",
    "axial flux is a magnet chemistry",
    "coercivity ratio",
    "all ferrite motors fail in cold",
    "every ferrite motor fails at low temperature",
    "vastly stronger than ndfeb",
    "drop-in traction magnet based on saturation",
    "commercial vehicle launch for matter",
    "production car with iron nitride",
  ].some((prohibited) => lower.includes(prohibited));
}
