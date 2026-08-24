export type AlternativeFamilyId = "pmsm" | "induction" | "wound" | "synrm" | "srm";

export type CompanyLane = {
  name: string;
  scope: string;
  maturity:
    | "production vehicle"
    | "industrial product"
    | "vehicle pilot"
    | "announced development"
    | "prototype"
    | "not evidenced";
};

export type ComparisonMetric = {
  label: string;
  /** 0–4 is an explicit teaching scale, not a measured universal score. */
  value: 0 | 1 | 2 | 3 | 4;
  note: string;
};

export type RegionLanes = {
  region: "India" | "Abroad";
  records: readonly CompanyLane[];
};

export type ArchitectureLab = {
  id: AlternativeFamilyId;
  label: string;
  shortLabel: string;
  principle: string;
  rotorField: string;
  rareEarth: string;
  /** A physical parameter that changes the design before any market trade-off. */
  definingMetric: {
    label: string;
    value: string;
    meaning: string;
  };
  costDrivers: readonly string[];
  trackThese: readonly string[];
  comparison: readonly ComparisonMetric[];
  regions: readonly RegionLanes[];
  caveat: string;
};

const noIndiaRecord = {
  name: "No named India programme",
  scope: "in the supplied due-diligence ledger",
  maturity: "not evidenced" as const,
};

export const architectureLabs: readonly ArchitectureLab[] = [
  {
    id: "pmsm",
    label: "Permanent-magnet synchronous",
    shortLabel: "PM",
    principle: "A permanent rotor field pulls in step with the stator's moving field.",
    rotorField: "Always on; made by NdFeB magnets.",
    rareEarth: "Nd/Pr always present; Dy/Tb added for thermal margin.",
    definingMetric: {
      label: "Magnet energy",
      value: "Br × Hcj",
      meaning: "Strength without coercivity flips under stress; coercivity without strength makes a large motor.",
    },
    costDrivers: ["Magnet mass", "Dy/Tb share", "Thermal margin", "Field-weakening current"],
    trackThese: ["Magnet mass", "Dy/Tb mass", "Peak and continuous efficiency", "Rotor temperature"],
    comparison: [
      { label: "Rare-earth exposure", value: 4, note: "Nd/Pr plus Dy/Tb thermal margin" },
      { label: "Rotor current loss", value: 0, note: "the magnet provides the rotor field" },
      { label: "Control/electronics burden", value: 2, note: "field weakening rises with speed" },
      { label: "Architecture-change burden", value: 0, note: "this is the incumbent route" },
      { label: "Parts-cost pressure", value: 4, note: "NdFeB mass and Dy/Tb dominate the supply exposure" },
    ],
    regions: [
      {
        region: "Abroad",
        records: [
          { name: "Tesla", scope: "IPM-SynRM traction architecture", maturity: "production vehicle" },
          { name: "Mahle", scope: "SCT is permanently excited and oil-cooled", maturity: "announced development" },
        ],
      },
      { region: "India", records: [noIndiaRecord] },
    ],
    caveat: "Mahle SCT must stay in the PM lane; oil cooling does not make it magnet-free.",
  },
  {
    id: "induction",
    label: "Squirrel-cage induction",
    shortLabel: "Induction",
    principle: "Relative motion induces rotor current; the rotor runs slightly behind the field.",
    rotorField: "Made on demand by induced cage current.",
    rareEarth: "None.",
    definingMetric: {
      label: "Cage resistance",
      value: "Al ≈1.6× Cu resistivity",
      meaning: "At 20 °C, aluminium's higher resistivity lowers cage cost but raises the loss that produces torque.",
    },
    costDrivers: ["Cage metal", "Part-load efficiency", "Mixed-axle duty", "Coast/downhill behaviour"],
    trackThese: ["Slip under load", "Part-load efficiency", "Cage temperature", "Unpowered drag"],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "steel cage; no magnets" },
      { label: "Rotor current loss", value: 3, note: "cage resistance makes torque and heat" },
      { label: "Control/electronics burden", value: 2, note: "slip control is mature" },
      { label: "Architecture-change burden", value: 3, note: "different efficiency and coast behaviour" },
      { label: "Parts-cost pressure", value: 2, note: "no magnet premium, but losses cost energy over life" },
    ],
    regions: [
      {
        region: "Abroad",
        records: [
          { name: "Audi", scope: "Q6 e-tron front axle", maturity: "production vehicle" },
          { name: "BMW Group", scope: "mixed-axle strategy referenced in due diligence", maturity: "production vehicle" },
        ],
      },
      { region: "India", records: [noIndiaRecord] },
    ],
    caveat: "The named axle layouts are platform-specific; do not generalise them to every Audi or BMW vehicle.",
  },
  {
    id: "wound",
    label: "Wound-field synchronous",
    shortLabel: "Wound",
    principle: "Fed rotor current creates a controllable electromagnet that stays synchronised.",
    rotorField: "An input: excite it, weaken it or switch it off.",
    rareEarth: "None.",
    definingMetric: {
      label: "Excitation burden",
      value: "rotor copper loss + transfer hardware",
      meaning: "Control over the field costs a second supply, rotor heating and usually oil through a hollow shaft.",
    },
    costDrivers: ["Rotor copper", "Brushes or rotating transformer", "Rotor cooling", "Excitation controller"],
    trackThese: ["Excitation power", "Rotor temperature", "Brush/service interval or transfer efficiency", "Production versus target status"],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "rotor electromagnet replaces magnets" },
      { label: "Rotor current loss", value: 3, note: "excitation current heats the rotor" },
      { label: "Control/electronics burden", value: 3, note: "a second controlled supply is needed" },
      { label: "Architecture-change burden", value: 4, note: "cooling, transfer hardware and controls change" },
      { label: "Parts-cost pressure", value: 3, note: "rotor copper, exciter and rotor cooling replace the magnet" },
    ],
    regions: [
      {
        region: "Abroad",
        records: [
          { name: "Renault", scope: "Zoe through E7A wound-field programmes", maturity: "production vehicle" },
          { name: "BMW Group", scope: "Gen5/Gen6 EESM programmes", maturity: "production vehicle" },
          { name: "Nissan", scope: "Ariya EESM", maturity: "production vehicle" },
          { name: "ZF", scope: "I2SM contactless path", maturity: "announced development" },
          { name: "Valeo / Mahle", scope: "iBEE brushless joint development", maturity: "announced development" },
          { name: "Vimag / Volektra", scope: "rotating-transformer family", maturity: "vehicle pilot" },
        ],
      },
      { region: "India", records: [noIndiaRecord] },
    ],
    caveat: "Production EESM is real; contactless transfer is a separate, mostly pre-production lane.",
  },
  {
    id: "synrm",
    label: "Synchronous reluctance",
    shortLabel: "SynRM",
    principle: "Shaped steel follows the easiest magnetic route through the rotor.",
    rotorField: "Not made; shaped steel is pulled into alignment.",
    rareEarth: "None unless small PM assists are added.",
    definingMetric: {
      label: "Power factor",
      value: "lower than PM machines",
      meaning: "The same wheel power needs more inverter current, silicon and cooling than the rotor's missing parts imply.",
    },
    costDrivers: ["Inverter current", "Motor volume", "Control calibration", "Optional magnet assists"],
    trackThese: ["Power factor", "Inverter rating", "Torque ripple/NVH", "Drive-cycle efficiency"],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "zero for pure SynRM; assists add some back" },
      { label: "Rotor current loss", value: 0, note: "shaped steel carries no rotor winding" },
      { label: "Control/electronics burden", value: 4, note: "poor power factor inflates inverter current" },
      { label: "Architecture-change burden", value: 3, note: "same housing family, different calibration" },
      { label: "Parts-cost pressure", value: 2, note: "cheap steel rotor, but more inverter silicon may be needed" },
    ],
    regions: [
      {
        region: "Abroad",
        records: [{ name: "ABB", scope: "industrial SynRM products", maturity: "industrial product" }],
      },
      {
        region: "India",
        records: [
          { name: "Chara Technologies", scope: "light-mobility reluctance drives", maturity: "vehicle pilot" },
          { name: "Viridian Ingni Propulsion", scope: "reluctance / hybrid-ferrite motors", maturity: "vehicle pilot" },
          { name: "Matel Motion and Energy Solutions", scope: "industrial automation / HVAC work", maturity: "vehicle pilot" },
        ],
      },
    ],
    caveat: "Industrial SynRM and light-mobility pilots solve different problems from full passenger-car traction.",
  },
  {
    id: "srm",
    label: "Switched reluctance",
    shortLabel: "SRM",
    principle: "Sequentially energised stator poles pull toothed steel lumps into alignment.",
    rotorField: "None; torque comes from varying magnetic reluctance.",
    rareEarth: "None.",
    definingMetric: {
      label: "Winding choice",
      value: "AEM uses Al ≈1.6× Cu resistivity",
      meaning: "Aluminium reduces precious-metal content and aids recycling, but needs a design that manages the extra loss.",
    },
    costDrivers: ["Simple rotor", "Concentrated stator coils", "Power electronics", "High-speed mechanics"],
    trackThese: ["Peak beside continuous power", "Maximum speed", "Torque ripple/NVH", "Winding temperature"],
    comparison: [
      { label: "Rare-earth exposure", value: 0, note: "toothed steel and stator coils only" },
      { label: "Rotor current loss", value: 0, note: "the rotor carries no winding or cage" },
      { label: "Control/electronics burden", value: 4, note: "sequential switching and ripple control" },
      { label: "Architecture-change burden", value: 4, note: "its salient-pole stator changes too" },
      { label: "Parts-cost pressure", value: 2, note: "simple rotor and aluminium coils, with power-electronics cost" },
    ],
    regions: [
      {
        region: "Abroad",
        records: [{ name: "Advanced Electric Machines", scope: "SSRD aluminium-wound drive", maturity: "announced development" }],
      },
      { region: "India", records: [noIndiaRecord] },
    ],
    caveat: "Read SSRD's peak rating with its continuous rating and maximum speed; none proves everyday traction parity.",
  },
] as const;

export const architectureLabById = Object.fromEntries(
  architectureLabs.map((item) => [item.id, item]),
) as Record<AlternativeFamilyId, ArchitectureLab>;

export const rotorToAlternativeFamily = {
  "ipm-ndfeb": "pmsm",
  "ferrite-ipm": "pmsm",
  "squirrel-cage": "induction",
  wound: "wound",
  synrm: "synrm",
  "pm-assisted-synrm": "synrm",
  srm: "srm",
} as const;
