export type MaterialId = "ndfeb" | "ferrite" | "iron-nitride";

export type MaterialCompanyLane = {
  name: string;
  scope: string;
  maturity:
    | "production vehicle"
    | "industrial product"
    | "vehicle pilot"
    | "announced development"
    | "prototype"
    | "materials scale-up"
    | "not evidenced";
};

export type MaterialRegionLanes = {
  region: "India" | "Abroad";
  records: readonly MaterialCompanyLane[];
};

export type MaterialProperty = {
  id: string;
  label: string;
  /** Relative teaching height against the strongest entry in the supplied ledger. */
  value: number;
  reading: string;
};

export type MaterialComparisonMetric = {
  label: string;
  /** 0–4 is an explicit teaching scale, not a measured universal score. */
  value: 0 | 1 | 2 | 3 | 4;
  note: string;
};

export type MaterialLab = {
  id: MaterialId;
  label: string;
  shortLabel: string;
  role: string;
  superpower: string;
  theCatch: string;
  badgeTags: readonly string[];
  adopters: readonly string[];
  definingMetric: {
    label: string;
    value: string;
    meaning: string;
  };
  properties: readonly MaterialProperty[];
  comparison: readonly MaterialComparisonMetric[];
  rareEarth: string;
  costStatus: string;
  costDrivers: readonly string[];
  trackThese: readonly string[];
  regions: readonly MaterialRegionLanes[];
  caveat: string;
};

const noIndiaPmLane = {
  name: "No named India material programme",
  scope: "in the supplied due-diligence ledger",
  maturity: "not evidenced" as const,
};

export const materialLabs: readonly MaterialLab[] = [
  {
    id: "ndfeb",
    label: "NdFeB reference",
    shortLabel: "NdFeB",
    role: "The incumbent traction magnet: strong and hard to reverse.",
    superpower: "Highest magnetic strength (Remanence Br) and thermal coercivity; powers 90%+ of modern EVs.",
    theCatch: "100% rare-earth supply risk, mining price volatility, and heavy Dysprosium/Terbium reliance.",
    badgeTags: ["100% REE Risk", "Maximum Strength", "Global EV Standard"],
    adopters: ["Tesla Model 3/Y", "BYD Seal / Blade", "Hyundai Ioniq 5", "Porsche Taycan"],
    definingMetric: {
      label: "Viability gate",
      value: "Br × Hcj",
      meaning: "Strength and reversal resistance together make the useful energy product.",
    },
    properties: [
      { id: "saturation", label: "Saturation", value: 0.64, reading: "high, but saturation alone is not viability" },
      { id: "remanence", label: "Remanence", value: 1, reading: "the reference magnet" },
      { id: "coercivity", label: "Coercivity", value: 1, reading: "high, with Dy/Tb used for heat margin" },
      { id: "hardness", label: "Hardness", value: 1, reading: "above the permanent-magnet threshold" },
    ],
    comparison: [
      { label: "Rare-earth exposure", value: 4, note: "Nd/Pr; Dy/Tb in many traction grades" },
      { label: "Magnetic strength", value: 4, note: "the remanence reference" },
      { label: "Reversal resistance", value: 4, note: "high coercivity, tuned for heat" },
      { label: "Traction readiness", value: 4, note: "production-vehicle incumbent" },
      { label: "Cost-baseline maturity", value: 3, note: "grade-specific costs exist, but no universal price" },
    ],
    rareEarth: "Contains Nd/Pr; grades may add Dy/Tb for thermal margin.",
    costStatus: "Production cost structures exist by grade, but no universal $/kg applies to every motor.",
    costDrivers: ["Magnet mass", "Grade and HREE share", "Refining availability", "Licence delay risk"],
    trackThese: ["Magnet mass", "Dy/Tb mass", "Grade price", "Rotor temperature", "Export lead time"],
    regions: [
      {
        region: "Abroad",
        records: [
          { name: "Tesla", scope: "IPM-SynRM traction architecture", maturity: "production vehicle" },
          { name: "Mahle", scope: "SCT permanently excited, oil-cooled motor", maturity: "announced development" },
          { name: "Proterial", scope: "heavy-rare-earth-free NdFeB material announcement", maturity: "announced development" },
        ],
      },
      {
        region: "India",
        records: [noIndiaPmLane],
      },
    ],
    caveat: "Proterial's route removes Dy/Tb, not all rare earths; Nd/Pr remains central to the magnet.",
  },
  {
    id: "ferrite",
    label: "Ferrite PM",
    shortLabel: "Ferrite",
    role: "A mature low-cost chemistry that needs a larger or faster machine.",
    superpower: "Abundant, dirt-cheap ceramic iron oxide; 100% free of rare earths and supply restrictions.",
    theCatch: "Weak field (~1/3 strength) forces motor to spin 50% faster, grow larger, or use axial flux.",
    badgeTags: ["Zero Rare Earths", "1/3 Strength", "Dirt Cheap Material"],
    adopters: ["Proterial (102 kW @ 15,000 RPM prototype)", "Conifer (Axial Flux)", "Gati Drives (India)"],
    definingMetric: {
      label: "Field penalty",
      value: "≈⅓ of NdFeB Br",
      meaning: "Lower remanence squares into roughly an order-of-magnitude energy-product penalty before geometry compensation.",
    },
    properties: [
      { id: "saturation", label: "Saturation", value: 0.19, reading: "low" },
      { id: "remanence", label: "Remanence", value: 0.33, reading: "about one third of the NdFeB reference" },
      { id: "coercivity", label: "Coercivity", value: 0.25, reading: "limited, especially when cold" },
      { id: "hardness", label: "Hardness", value: 1, reading: "viable, but the field is weak" },
    ],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "iron oxide with Sr/Ba additions" },
      { label: "Magnetic strength", value: 1, note: "about one third of NdFeB remanence" },
      { label: "Reversal resistance", value: 2, note: "usable, but cold starts need margin" },
      { label: "Traction readiness", value: 3, note: "industrial production plus a traction prototype" },
      { label: "Cost-baseline maturity", value: 3, note: "low material cost; system cost is design-specific" },
    ],
    rareEarth: "No rare earths; commonly iron oxide with strontium or barium.",
    costStatus: "Raw-material cost is mature and low, but the relevant number is system cost after growing or speeding up the motor.",
    costDrivers: ["More active material volume", "Steel and copper", "Higher-speed inverter duty", "Cold-start protection"],
    trackThese: ["Motor mass and volume", "System cost per kW", "Cold-start demagnetisation margin", "Measured power at rpm"],
    regions: [
      {
        region: "Abroad",
        records: [
          { name: "Proterial", scope: "102 kW at 15,000 rpm ferrite prototype versus 110 kW at 10,000 rpm baseline", maturity: "prototype" },
          { name: "EKMO", scope: "industrial ferrite drive products/licensing", maturity: "industrial product" },
          { name: "Conifer", scope: "0.5–7.5 kW ferrite axial-flux applications", maturity: "industrial product" },
        ],
      },
      {
        region: "India",
        records: [{ name: "Gati Drives", scope: "appliance and HVAC motors, not EV traction", maturity: "industrial product" }],
      },
    ],
    caveat: "Power figures without speed misrepresent the prototype; appliance and industrial products are not passenger-car proof points.",
  },
  {
    id: "iron-nitride",
    label: "Iron nitride",
    shortLabel: "Fe₁₆N₂",
    role: "A promising rare-earth-free chemistry still crossing materials-scale-up gates.",
    superpower: "High theoretical saturation from abundant iron and nitrogen without any rare-earth elements.",
    theCatch: "Low magnetic hardness, stated 4,000–5,000 Oe coercivity limit, and thermal limits (>220°C).",
    badgeTags: ["Zero Rare Earths", "High Lab Potential", "Materials Scale-Up"],
    adopters: ["Niron Magnetics (Materials Scale-Up)", "Matter (Variable-Flux EV Prototype)"],
    definingMetric: {
      label: "Current blocker",
      value: "hardness below 1",
      meaning: "High theoretical saturation does not help if the magnetisation is too easy to reverse for a hot traction duty.",
    },
    properties: [
      { id: "saturation", label: "Saturation", value: 1, reading: "around 2.5 T in cited material work" },
      { id: "remanence", label: "Remanence", value: 0.72, reading: "reported near 1 T in Niron material records" },
      { id: "coercivity", label: "Coercivity", value: 0.36, reading: "low relative to NdFeB" },
      { id: "hardness", label: "Hardness", value: 0.6, reading: "below the permanent-magnet threshold" },
    ],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "iron and nitrogen chemistry" },
      { label: "Magnetic strength", value: 3, note: "high saturation and reported ~1 T remanence" },
      { label: "Reversal resistance", value: 1, note: "hardness remains below the threshold" },
      { label: "Traction readiness", value: 1, note: "materials scale-up and a light-mobility prototype" },
      { label: "Cost-baseline maturity", value: 0, note: "yield and qualification costs are unsettled" },
    ],
    rareEarth: "None in the magnet chemistry.",
    costStatus: "No mature automotive cost baseline; scale-up yield and qualification dominate the uncertainty.",
    costDrivers: ["Powder/process yield", "Capital equipment", "Thermal qualification", "Automotive volume scaling"],
    trackThese: ["Coercivity at temperature", "Energy product", "Process yield", "Cost per qualified kg"],
    regions: [
      {
        region: "Abroad",
        records: [{ name: "Niron Magnetics", scope: "iron-nitride material development and patent records", maturity: "materials scale-up" }],
      },
      {
        region: "India",
        records: [{ name: "Matter", scope: "variable-flux light-mobility prototype with Niron", maturity: "prototype" }],
      },
    ],
    caveat: "A material patent or prototype does not establish a qualified production traction motor or a stable unit cost.",
  },
] as const;

export const materialLabById = Object.fromEntries(
  materialLabs.map((item) => [item.id, item]),
) as Record<MaterialId, MaterialLab>;

/** Keep route navigation and manual exploration pointed at the same lesson. */
export function materialIdForState(stateId: string): MaterialId {
  if (
    stateId.startsWith("ferrite") ||
    ["proterial-numbers"].includes(stateId)
  ) {
    return "ferrite";
  }
  if (
    ["iron-nitride-gates", "variable-flux-fit"].includes(stateId)
  ) {
    return "iron-nitride";
  }
  return "ndfeb";
}
