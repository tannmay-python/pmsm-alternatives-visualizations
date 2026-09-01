/**
 * Every rotor is a drop-in for the same housing, stator and shaft. That is the
 * whole point of the stage: the reader pulls one rotor out and puts another in
 * without the machine around it changing, so what they see change is only ever
 * caused by the rotor.
 *
 * `configurationId` points at the composable entry in content/motors.ts, which
 * keeps torque principle, excitation, magnet chemistry, geometry and winding
 * material on independent axes.
 */

export const rotorIds = [
  "ipm-ndfeb",
  "squirrel-cage",
  "wound",
  "synrm",
  "pm-assisted-synrm",
  "ferrite-ipm",
  "srm",
] as const;

export type RotorId = (typeof rotorIds)[number];

export type RotorSpec = {
  id: RotorId;
  label: string;
  /** Matching id in content/motors.ts. */
  configurationId: string;
  branch: "synchronous" | "asynchronous";
  /** How the rotor's own magnetic field comes into existence. */
  howFieldIsMade: string;
  /** What the rotor field does the instant the inverter stops driving it. */
  onPowerCut: string;
  /** The engineering price this rotor charges. */
  cost: string;
  /** Does the rotor carry current, and therefore heat, of its own? */
  rotorCarriesCurrent: boolean;
  /** Rare-earth magnet content. */
  usesRareEarthMagnets: boolean;
  /**
   * True when this rotor also requires a different stator. Only switched
   * reluctance does: it needs concentrated coils on salient poles rather than
   * the distributed three-phase winding the others share.
   */
  needsOwnStator?: boolean;
  /** Stator winding material, where it is part of the claim. */
  windingMaterial?: "copper" | "aluminium";
};

export const ROTORS: Record<RotorId, RotorSpec> = {
  "ipm-ndfeb": {
    id: "ipm-ndfeb",
    label: "NdFeB IPM",
    configurationId: "ndfeb-ipm-synrm",
    branch: "synchronous",
    howFieldIsMade: "Permanently, by the magnet material itself.",
    onPowerCut: "Stays on. The rotor keeps generating while it turns.",
    cost: "Neodymium and praseodymium, plus dysprosium or terbium for heat, and field-weakening current at speed.",
    rotorCarriesCurrent: false,
    usesRareEarthMagnets: true,
  },
  "squirrel-cage": {
    id: "squirrel-cage",
    label: "Squirrel cage",
    configurationId: "induction-cage-traction",
    branch: "asynchronous",
    howFieldIsMade: "Induced. The sweeping stator field drives current in shorted bars, and that current makes the field.",
    onPowerCut: "Dies instantly. Nothing is left to drag.",
    cost: "Rotor current flows through resistance, so the rotor heats and part-load efficiency falls short of a magnet rotor.",
    rotorCarriesCurrent: true,
    usesRareEarthMagnets: false,
  },
  wound: {
    id: "wound",
    label: "Wound field",
    configurationId: "wound-field-production-traction",
    branch: "synchronous",
    howFieldIsMade: "Deliberately, by feeding current into rotor windings.",
    onPowerCut: "Dies with the excitation. The field is an input.",
    cost: "A second supply to feed the rotor, and a rotor that heats and usually needs oil through a hollow shaft.",
    rotorCarriesCurrent: true,
    usesRareEarthMagnets: false,
  },
  synrm: {
    id: "synrm",
    label: "Reluctance",
    configurationId: "pure-synrm-light-traction",
    branch: "synchronous",
    howFieldIsMade: "Not made at all. Shaped steel is pulled toward the easy magnetic route.",
    onPowerCut: "Nothing to switch off.",
    cost: "Poor power factor, so the inverter carries more current for the same wheel power.",
    rotorCarriesCurrent: false,
    usesRareEarthMagnets: false,
  },
  "pm-assisted-synrm": {
    id: "pm-assisted-synrm",
    label: "PM-assisted reluctance",
    configurationId: "pm-assisted-synrm",
    branch: "synchronous",
    howFieldIsMade: "Mostly shaped steel, with small magnets seated in the flux barriers.",
    onPowerCut: "The magnet share stays on.",
    cost: "Repairs the power factor and speed range by putting some magnet content back.",
    rotorCarriesCurrent: false,
    usesRareEarthMagnets: true,
  },
  srm: {
    id: "srm",
    label: "Switched reluctance",
    configurationId: "aem-aluminium-srm",
    branch: "synchronous",
    howFieldIsMade: "Not made at all. Stator poles are energised in sequence and the rotor lumps chase them.",
    onPowerCut: "Nothing to switch off.",
    cost: "A different stator with concentrated coils, high speed to make up for having no magnets, and torque ripple to control.",
    rotorCarriesCurrent: false,
    usesRareEarthMagnets: false,
    needsOwnStator: true,
    windingMaterial: "aluminium",
  },
  "ferrite-ipm": {
    id: "ferrite-ipm",
    label: "Ferrite IPM",
    configurationId: "ferrite-radial-pm-prototype",
    branch: "synchronous",
    howFieldIsMade: "Permanently, by ferrite magnets in enlarged pockets.",
    onPowerCut: "Stays on, as with any permanent magnet.",
    cost: "About a third of NdFeB remanence, so the motor grows or spins faster, and coercivity falls when cold.",
    rotorCarriesCurrent: false,
    usesRareEarthMagnets: false,
  },
};
