import type { RotorId } from "../stage/rotors/registry";

/**
 * The tour opens on the problem, not on the machine.
 *
 * Motors today use rare-earth magnets; those magnets are concentrated in one
 * supply chain; that supply chain was placed under export licence in April
 * 2025. Only once the reader owns that problem is there a reason to open the
 * motor, and only once they can see what the magnet is doing in there can they
 * judge any proposed alternative. Acts II–IV pay the opening question back.
 */

export type StageKind =
  | { kind: "three"; scene: "car" }
  | { kind: "three"; scene: "motor"; rotor: RotorId; excitation?: "brushed" | "contactless" }
  /** Axial flux is a topology, not a rotor, so it gets its own scene. */
  | { kind: "three"; scene: "axial"; chemistry: "ferrite" | "ndfeb" }
  | { kind: "svg"; diagram: DiagramId };

export const diagramIds = [
  "why-it-matters",
  "supply-concentration",
  "electromagnet-coil",
  "three-phase-superposition",
  "dual-torque-split",
  "division-of-labour",
  "anisotropy-crystal",
  "demag-curve",
  "hot-margin",
  "grain-diffusion",
  "magnet-composition",
  "light-heavy-split",
  "mitigation-ladder",
  "back-emf-ceiling",
  "family-tree",
  "property-board",
  "swap-burden",
] as const;
export type DiagramId = (typeof diagramIds)[number];

/** One touchable state within a stop. The reader always has something to do. */
export type StopState = {
  id: string;
  /** Shown on the stage as the current sub-heading. */
  label: string;
  /** One sentence, mechanism-first. No hedges — see validation.ts copy lint. */
  line: string;
  /** The concrete reader action available here. */
  action: string;
  /** Stage override for this state, when it differs from the stop default. */
  stage?: StageKind;
};

export type Stop = {
  id: string;
  act: 0 | 1 | 2 | 3 | 4;
  actLabel: string;
  number: number;
  title: string;
  /** Exactly one question, carried over from the curriculum in content/chapters.ts. */
  question: string;
  stage: StageKind;
  states: readonly StopState[];
  /** Claim ids in content/claims.ts that this stop is allowed to render. */
  claimIds: readonly string[];
  /** Step ids in content/chapters.ts this stop covers, for the coverage check. */
  coversStepIds: readonly string[];
};

export const ACTS = [
  { act: 0, label: "The problem" },
  { act: 1, label: "The machine" },
  { act: 2, label: "The magnet" },
  { act: 3, label: "The alternatives" },
  { act: 4, label: "The decision" },
] as const;

export const STOPS: readonly Stop[] = [
  // ── Act 0 ───────────────────────────────────────────────────────────────
  {
    id: "the-problem",
    act: 0,
    actLabel: "The problem",
    number: 1,
    title: "One kilogram decides the car",
    question: "Why is a small mass of magnet a supply-chain problem?",
    /*
     * Sequencing matters more here than anywhere else in the piece. The reader
     * meets the stakes before the machine: what happened, why it could happen,
     * and only then where in a car the affected part actually sits. Opening on
     * a car asks someone to care about a mechanism before they have been given
     * a reason to.
     */
    stage: { kind: "svg", diagram: "why-it-matters" },
    claimIds: [
      "hree-controls-distinct-from-ndpr",
      "supply-concentration-reported",
      "pmsm-share-of-traction",
      "illustrative-magnet-composition",
      "market-rare-earth-free-share-small",
    ],
    coversStepIds: ["car-transparent-cutaway", "market-early-share"],
    states: [
      {
        id: "the-halt",
        label: "In April 2025, the supply was gated",
        line: "China placed the listed medium and heavy rare earths under export licence, and carmakers holding no second source paused assembly while the paperwork caught up.",
        action: "Follow the chain to the point that closed.",
      },
      {
        id: "the-chain",
        label: "Every electric car sits at the end of that chain",
        line: "Around 70–80% of EV traction motors are permanent-magnet machines, as reported, and each one carries a magnet made from those elements.",
        action: "Read the chain end to end.",
      },
      {
        id: "the-chokepoint",
        label: "And the chain has one owner",
        line: "China is reported to hold roughly 60% of mining, over 90% of refining, and about 94% of the high-performance magnets traction motors need.",
        action: "Compare the three stages.",
        stage: { kind: "svg", diagram: "supply-concentration" },
      },
      {
        id: "one-part",
        label: "All of it lands on one part of the car",
        line: "Battery, body, suspension and interior are unaffected. The exposure sits entirely in the drive unit near the axle.",
        action: "Find the drive unit.",
        stage: { kind: "three", scene: "car" },
      },
      {
        id: "one-kilogram",
        label: "One to two kilograms of it",
        line: "Inside that unit, on the spinning rotor, sits the magnet the whole dependency is about. It weighs about as much as a laptop.",
        action: "Look at the rotor.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
      {
        id: "the-real-question",
        label: "So what can actually be changed?",
        line: "Answering that needs three things: what the motor does, what the magnet does inside it, and which rare earth the notice actually named.",
        action: "Open the machine.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
    ],
  },

  // ── Act I ───────────────────────────────────────────────────────────────
  {
    id: "where-the-motor-lives",
    act: 1,
    actLabel: "The machine",
    number: 2,
    title: "Battery to road",
    question: "How does battery electricity reach the wheels?",
    stage: { kind: "three", scene: "car" },
    claimIds: [],
    coversStepIds: ["power-path-flow", "drive-unit-extract"],
    states: [
      {
        id: "power-path",
        label: "The path",
        line: "The pack holds direct current. The inverter turns it into three alternating phases. The motor turns those phases into rotation.",
        action: "Scrub the pulse from pack to wheel.",
      },
      {
        id: "drive-unit",
        label: "Inside the drive unit",
        line: "Three parts share one housing: the inverter, motor and reduction gear. The gear lowers motor speed and increases wheel torque.",
        action: "Inspect the drive unit layout in the car.",
      },
    ],
  },
  {
    id: "open-the-machine",
    act: 1,
    actLabel: "The machine",
    number: 3,
    title: "Open the machine",
    question: "What are the moving and stationary parts inside the motor?",
    stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
    claimIds: ["ipm-magnets-buried"],
    coversStepIds: ["motor-isolation", "pmsm-assemble-stator"],
    states: [
      {
        id: "explode",
        label: "Seven parts pulled apart",
        line: "Pulled apart, the motor shows a stationary housing, end caps and stator, plus a rotor, magnets and shaft that spin on bearings.",
        action: "Drag the explode slider to separate the parts.",
      },
      {
        id: "housing",
        label: "The casing holds the system",
        line: "The casing and end caps seal the core, carry coolant around the stator and hold the shaft bearings.",
        action: "Inspect the stationary casing and its cooling path.",
      },
      {
        id: "stator",
        label: "The stator stays still",
        line: "The stator stays still. Thin silicon-steel sheets hold copper windings in slots, arranged as three electrical phases.",
        action: "Inspect the stationary laminated core and copper windings.",
      },
      {
        id: "rotor",
        label: "The rotor turns",
        line: "The rotor spins inside the stator. Steel laminations hold NdFeB permanent magnets in V-shaped pockets around the shaft.",
        action: "Inspect the buried magnets inside the spinning rotor core.",
      },
      {
        id: "shaft",
        label: "The shaft carries the torque",
        line: "The shaft is keyed to the rotor and carries its torque through the bearings to the reduction gear.",
        action: "Follow the shaft from the rotor to the gearbox connection.",
      },
      {
        id: "air-gap",
        label: "They never touch",
        line: "Less than one millimetre separates stator and rotor. Magnetic forces cross that gap without the parts touching.",
        action: "Look down the bore at the sub-millimetre magnetic air gap.",
      },
    ],
  },
  {
    id: "three-coils-one-field",
    act: 1,
    actLabel: "The machine",
    number: 4,
    title: "Three coils, one moving field",
    question: "How can three still coils make one field rotate?",
    stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
    claimIds: ["pmsm-stator-three-phase-field", "pmsm-synchronous-torque-angle"],
    coversStepIds: ["pmsm-three-phase-field", "pmsm-rotor-lock"],
    states: [
      {
        id: "electromagnet-rule",
        label: "The Electromagnet & Grip Rule",
        line: "Current through a copper coil creates fixed North and South poles. One coil cannot make that field travel on its own.",
        action: "Toggle current direction to flip the North and South magnetic poles.",
        stage: { kind: "svg", diagram: "electromagnet-coil" },
      },
      {
        id: "one-phase",
        label: "One coil group inside the stator",
        line: "Inside the stator, energising Phase A creates one fixed magnetic pole at the top of the bore.",
        action: "Switch between the three fixed coil groups.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
      {
        id: "three-phase-math",
        label: "Three AC phases offset in time",
        line: "The inverter feeds three coil groups with currents offset by one third of a cycle. Their fields add up to one pole that sweeps around the bore.",
        action: "Scrub the electrical angle to watch the three AC waveforms sum into one rotating vector.",
        stage: { kind: "svg", diagram: "three-phase-superposition" },
      },
      {
        id: "no-part-moves",
        label: "The rotating field inside the bore",
        line: "The field rotates at the inverter's frequency while every copper coil stays fixed in its slot.",
        action: "Adjust inverter AC frequency to change field rotation speed.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
      {
        id: "rotor-locks",
        label: "The rotor locks in step",
        line: "The rotor magnets lock onto the sweeping stator field and follow it at synchronous speed, with a small load angle behind it.",
        action: "Adjust shaft load to watch the synchronous load angle open.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
    ],
  },
  {
    id: "two-pulls-one-shaft",
    act: 1,
    actLabel: "The machine",
    number: 5,
    title: "Two pulls, one shaft",
    question: "Is the magnet doing all of the turning?",
    stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
    claimIds: ["ipm-magnets-buried", "ipm-reluctance-torque", "pm-assisted-synrm-stack"],
    coversStepIds: ["ipm-rotor-cutaway", "ipm-reluctance-overlay"],
    states: [
      {
        id: "why-buried",
        label: "Why the magnets are buried",
        line: "Surface magnets would be thrown off by centrifugal force at speed. Steel bridges over the pockets hold them mechanically in place.",
        action: "Scrub rotor rotational speed to inspect centrifugal retention bridges.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
      {
        id: "reluctance-split",
        label: "Two pulls on one shaft",
        line: "Buried magnets force flux through steel paths, adding 30–40% reluctance torque to the magnet's pull.",
        action: "Switch between Cruise and Full Acceleration to compare torque contributions.",
        stage: { kind: "svg", diagram: "dual-torque-split" },
      },
      {
        id: "already-both",
        label: "The IPM-SynRM traction motor",
        line: "Many EV traction motors use both magnet pull and steel alignment, which reduces the rare-earth magnet needed.",
        action: "Inspect the integrated dual-torque machine.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
    ],
  },

  // ── Act II ──────────────────────────────────────────────────────────────
  {
    id: "strength-and-stubbornness",
    act: 2,
    actLabel: "The magnet",
    number: 6,
    title: "Strength and stubbornness",
    question: "What actually makes neodymium worth using?",
    stage: { kind: "svg", diagram: "demag-curve" },
    claimIds: [
      "magnet-remanence-definition",
      "magnet-coercivity-definition",
      "ndfeb-division-of-labour",
    ],
    coversStepIds: ["remanence-strength", "coercivity-lock"],
    states: [
      {
        id: "division-of-labour",
        label: "A division of labour",
        line: "In NdFeB the iron supplies the strength and the neodymium holds the direction. Neither element does the job alone.",
        action: "Toggle each element out of the alloy.",
        stage: { kind: "svg", diagram: "division-of-labour" },
      },
      {
        id: "anisotropy",
        label: "Where the stubbornness comes from",
        line: "Neodymium's atomic structure holds the field in one direction, even when stator current pushes against it.",
        action: "Apply opposing stator push to test the atomic lock.",
        stage: { kind: "svg", diagram: "anisotropy-crystal" },
      },
      {
        id: "remanence",
        label: "Remanence: what is left",
        line: "Remanence is the flux the magnet still holds with nothing helping it, and it comes mostly from iron's large magnetic moment.",
        action: "Remove the applied field and read what remains.",
        stage: { kind: "svg", diagram: "demag-curve" },
      },
      {
        id: "coercivity",
        label: "Coercivity: what it takes to undo it",
        line: "Coercivity is the reverse field needed to erase a magnet. Iron has little of it, so iron alone cannot be a traction magnet.",
        action: "Push the reverse field until it flips.",
        stage: { kind: "svg", diagram: "demag-curve" },
      },
    ],
  },
  {
    id: "heat-and-the-patch",
    act: 2,
    actLabel: "The magnet",
    number: 7,
    title: "Heat, and the patch that stays",
    question: "Why does a hot motor need dysprosium?",
    stage: { kind: "svg", diagram: "hot-margin" },
    claimIds: [
      "traction-temperature-range",
      "coercivity-temperature-sensitivity",
      "dy-tb-thermal-role",
      "dy-strength-tradeoff",
      "gbd-grain-shell",
      "illustrative-magnet-composition",
      "smco-temperature-position",
    ],
    coversStepIds: ["heat-demagnetisation", "dy-tb-tradeoff", "grain-boundary-diffusion"],
    states: [
      {
        id: "hot-margin",
        label: "Heat and reverse field spend the same margin",
        line: "A traction rotor can reach 150–180 °C, where its resistance to reversal has fallen. Hard acceleration then pushes the stator field back against the magnet and toward the knee.",
        action: "Raise temperature and opposing field independently, then together.",
        stage: { kind: "svg", diagram: "hot-margin" },
      },
      {
        id: "reversal-start",
        label: "Reversal starts at a grain surface",
        line: "A grain flips from its outer surface inward when the local limit is crossed. The lost magnetisation remains after the rotor cools.",
        action: "Drive surface reversal inward, then read the cooled loss.",
        stage: { kind: "svg", diagram: "grain-diffusion" },
      },
      {
        id: "dysprosium-tradeoff",
        label: "Dysprosium restores the lock, but costs strength",
        line: "Dy and Tb keep the magnet from reversing at higher temperature. They also oppose iron's magnetic moment, so protection lowers strength and concentrates supply exposure.",
        action: "Add dysprosium and watch coercivity rise while remanence falls.",
        stage: { kind: "svg", diagram: "hot-margin" },
      },
      {
        id: "diffusion-evolution",
        label: "Put the patch only at the vulnerable edge",
        line: "Grain-boundary diffusion puts a Dy-rich shell at the surface where reversal starts instead of filling the whole core. The magnet remains about 69% iron, 30% Nd/Pr and 1–4% Dy by mass.",
        action: "Change shell depth and compare it with uniform doping.",
        stage: { kind: "svg", diagram: "grain-diffusion" },
      },
    ],
  },
  {
    id: "which-rare-earth",
    act: 2,
    actLabel: "The magnet",
    number: 8,
    title: "Which rare earth was actually controlled",
    question: "Which rare-earth exposure is that dated notice really about?",
    stage: { kind: "svg", diagram: "light-heavy-split" },
    claimIds: [
      "hree-controls-distinct-from-ndpr",
      "reduced-hree-near-drop-in",
      "proterial-hree-free-ndfeb",
      "rotor-oil-cooling-reduces-hree",
    ],
    coversStepIds: ["light-and-heavy-ree-supply", "mitigation-ladder"],
    states: [
      {
        id: "the-split",
        label: "Light and heavy are not one problem",
        line: "Neodymium and praseodymium are light rare earths and were not named in the April 2025 announcement. Dysprosium and terbium are heavier, scarcer and were covered by the notice.",
        action: "Split the magnet by element and mark what the notice names.",
      },
      {
        id: "licence-not-ban",
        label: "A licence gate, not a ban",
        line: "The announcement made listed heavy rare-earth items require an export licence. It did not remove them from the market.",
        action: "Read the scope of the notice.",
      },
      {
        id: "the-cheapest-move",
        label: "The smallest credible change",
        line: "Dysprosium is only 1–4% of the magnet, and diffusion already uses less of it. Cut it and the motor still runs, but with less temperature headroom.",
        action: "Climb the mitigation ladder one rung at a time.",
        stage: { kind: "svg", diagram: "mitigation-ladder" },
      },
      {
        id: "cool-it-instead",
        label: "Or take the heat away",
        line: "Cooling the rotor lowers the thermal margin the magnet needs. Audi's direct rotor oil cooling on the Q6 e-tron attacks the same problem from the other side.",
        action: "Cool the rotor and watch the required dysprosium fall.",
        stage: { kind: "svg", diagram: "mitigation-ladder" },
      },
      {
        id: "already-happened",
        label: "This is not hypothetical",
        line: "Proterial announced heavy-rare-earth-free NdFeB magnets for motor use in July 2025, during the controls.",
        action: "Compare what changes in the car for each rung.",
        stage: { kind: "svg", diagram: "mitigation-ladder" },
      },
    ],
  },

  // ── Act III ─────────────────────────────────────────────────────────────
  {
    id: "the-weakness",
    act: 3,
    actLabel: "The alternatives",
    number: 9,
    title: "The weakness magnets cannot fix",
    question: "Is there an engineering reason to drop magnets, not just a supply one?",
    stage: { kind: "svg", diagram: "back-emf-ceiling" },
    claimIds: [
      "back-emf-constraint",
      "field-weakening-no-torque",
      "pmsm-inverter-failure-risk",
    ],
    coversStepIds: ["back-emf-speed-sweep", "field-weakening-current", "inverter-fault-at-speed"],
    states: [
      {
        id: "always-on",
        label: "A permanent magnet cannot be switched off",
        line: "The rotor field is a property of the material. There is no input that turns it down.",
        action: "Try to reduce the rotor field.",
      },
      {
        id: "back-emf",
        label: "Speed pushes voltage back",
        line: "The turning magnet induces a voltage back into the stator windings that rises with speed and opposes the supply.",
        action: "Sweep speed and watch the induced voltage climb toward the bus.",
      },
      {
        id: "ceiling",
        label: "The bus sets a ceiling",
        line: "When the induced voltage approaches the DC bus, no more current can be pushed in and the motor cannot go faster on torque alone.",
        action: "Reach the ceiling.",
      },
      {
        id: "field-weakening",
        label: "Paying current to cancel your own magnet",
        line: "To go faster the inverter injects current that cancels part of the magnet's flux. That current makes no torque and is spent purely because the magnets are there.",
        action: "Enter field weakening and watch the loss.",
      },
      {
        id: "fault",
        label: "The field is still on when the inverter is not",
        line: "Gate the inverter off at speed and a permanent-magnet rotor keeps generating, so the drive needs hardware to handle that case.",
        action: "Cut the inverter at speed.",
      },
      {
        id: "the-obvious-fix",
        label: "The obvious fix",
        line: "Replace the permanent magnet with something you can turn off. That is a rotor change, and there is more than one way to make it.",
        action: "Go to the rotors.",
      },
    ],
  },
  {
    id: "swap-the-rotor",
    act: 3,
    actLabel: "The alternatives",
    number: 10,
    title: "Swap the rotor",
    question: "Which motors keep pace with the field, and what does each rotor cost?",
    stage: { kind: "svg", diagram: "family-tree" },
    claimIds: [
      "motor-family-sync-async",
      "induction-squirrel-cage",
      "induction-slip-range",
      "induction-rotor-loss-and-coast",
      "induction-ev-efficiency-tradeoff",
      "induction-mixed-axle-use",
      "wound-field-principle",
      "wound-field-advantages-costs",
      "wound-field-production-brushes",
      "contactless-wound-field-status",
      "vimag-volektra-same-company",
      "virtual-magnet-is-contactless-wound-field",
      "synrm-principle",
      "synrm-inverter-power-factor",
      "pm-assisted-synrm-stack",
      "india-reluctance-development-lane",
      "aem-srm-principle",
      "aem-peak-continuous-gap",
    ],
    coversStepIds: [
      "sync-async-family-tree",
      "induction-cage-lab",
      "induction-slip-heat-coast",
      "wound-field-lab",
      "brushed-contactless-status",
      "pure-synrm-lab",
      "pm-assisted-synrm-lab",
      "srm-aem-lab",
    ],
    states: [
      {
        id: "family-tree",
        label: "One question splits the family",
        line: "Permanent-magnet, wound-field and reluctance rotors keep pace with the stator field. Induction runs behind it.",
        action: "Compare exposure, loss, control, change and cost pressure.",
      },
      {
        id: "induction-principle",
        label: "Induction creates its own rotor field",
        line: "Shorted bars make a rotor field only when the stator's sweep induces current in them. The cage runs 1–3% behind under load because no relative motion means no induced current.",
        action: "Load the shaft and watch the cage trail the field.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "induction-duty",
        label: "The same principle sets the duty",
        line: "Rotor current meets resistance, so slip makes torque and heat together. An induction axle can coast when unused, while a PM axle remains more efficient in the Audi Q6 e-tron's mixed layout.",
        action: "Cut inverter power, then compare a mixed-axle strategy.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "wound-control",
        label: "Wound field turns the magnet into an input",
        line: "Copper on the rotor replaces the permanent magnet with a controllable electromagnet. Reducing excitation at speed avoids much of the field-weakening penalty.",
        action: "Fit the wound rotor, then reduce excitation at cruise.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "wound-hardware",
        label: "Production hardware already exists",
        line: "The trade is a second supply, rotor heating and transfer hardware, often oil through a hollow shaft. Renault, Nissan and BMW show externally excited traction in production.",
        action: "Trace the rotor supply and separate production evidence.",
        stage: { kind: "three", scene: "motor", rotor: "wound", excitation: "brushed" },
      },
      {
        id: "contactless-frontier",
        label: "Contactless excitation is the new lane",
        line: "ZF I2SM, Mahle MCT and Valeo/Mahle iBEE pass field power across a rotating transformer instead of brushes. They are development paths; virtual-magnet machines are the same wound-field family.",
        action: "Swap brushes for the rotating transformer.",
        stage: { kind: "three", scene: "motor", rotor: "wound", excitation: "contactless" },
      },
      {
        id: "reluctance-spectrum",
        label: "Reluctance spans clean and assisted rotors",
        line: "Flux barriers let shaped steel follow the easiest magnetic route without magnets or windings. Poor power factor can demand more inverter current, so small magnets can repair it, as in IPM-SynRM.",
        action: "Compare pure reluctance with PM-assisted reluctance.",
        stage: { kind: "three", scene: "motor", rotor: "pm-assisted-synrm" },
      },
      {
        id: "srm-aluminium",
        label: "Switched reluctance changes the stator too",
        line: "A salient-pole stator energises coils in sequence around a toothed steel rotor. Advanced Electric Machines uses compressed aluminium windings and reports continuous power beside peak power.",
        action: "Read peak beside continuous and maximum speed.",
        stage: { kind: "three", scene: "motor", rotor: "srm" },
      },
    ],
  },
  {
    id: "change-the-magnet",
    act: 3,
    actLabel: "The alternatives",
    number: 11,
    title: "Change the magnet, not the machine",
    question: "Why is saturation alone not enough to judge a magnet?",
    stage: { kind: "svg", diagram: "property-board" },
    claimIds: [
      "ferrite-is-chemistry",
      "ferrite-remanence-energy-product",
      "ferrite-cold-constraint",
      "axial-flux-is-geometry",
      "proterial-power-speed-pair",
      "iron-nitride-is-chemistry",
      "iron-nitride-saturation-not-hardness",
      "niron-material-range",
      "iron-nitride-thermal-margin",
      "matter-variable-flux-fit",
      "named-company-corrections",
      "stackable-technologies",
    ],
    coversStepIds: [
      "ferrite-material-not-architecture",
      "axial-flux-geometry",
      "proterial-power-speed",
      "iron-nitride-property-board",
      "matter-variable-flux",
      "stackable-motor-builder",
    ],
    states: [
      {
        id: "a-different-layer",
        label: "This is a layer, not a branch",
        line: "A ferrite or iron-nitride motor is still a PMSM. Change the magnet chemistry and the architecture stays; Niron's automotive work is with carmakers rather than a motor of its own.",
        action: "Separate chemistry from architecture.",
      },
      {
        id: "ferrite-limit",
        label: "Ferrite trades supply risk for a weak field",
        line: "Strontium or barium ferrite is abundant and uncontrolled, but supplies roughly one third of NdFeB remanence. Its automotive risk is cold-start demagnetisation.",
        action: "Fit the ferrite rotor and compare the pockets.",
        stage: { kind: "three", scene: "motor", rotor: "ferrite-ipm" },
      },
      {
        id: "compensate-geometry",
        label: "Weak magnets force geometry work",
        line: "The design compensates by growing, spinning faster or going axial. In an axial motor the field runs along the shaft, so torque comes from a large mean radius.",
        action: "Pull the axial machine apart.",
        stage: { kind: "three", scene: "axial", chemistry: "ferrite" },
      },
      {
        id: "independent-geometry",
        label: "Which is a second, separate choice",
        line: "Axial flux is a geometry; ferrite is a chemistry. Conifer uses both, so they are not competing options.",
        action: "Switch the axial machine's magnets to neodymium.",
        stage: { kind: "three", scene: "axial", chemistry: "ndfeb" },
      },
      {
        id: "proterial-numbers",
        label: "Read both numbers together",
        line: "Proterial's ferrite prototype makes 102 kW at 15,000 rpm against a 110 kW at 10,000 rpm neodymium baseline: lower power at 50% more speed, not parity.",
        action: "Show power with its speed.",
      },
      {
        id: "iron-nitride-gates",
        label: "Iron nitride must clear four gates",
        line: "Fe16N2 offers about 2.5 T saturation and reported 1 T remanence. Hardness below one, a stated 4,000–5,000 Oe coercivity ceiling and 216–250 °C decomposition work remain development gates, not a drop-in traction claim.",
        action: "Compare saturation, hardness, coercivity and thermal margin together.",
      },
      {
        id: "variable-flux-fit",
        label: "Where low coercivity is the point",
        line: "A variable-flux motor deliberately weakens and re-magnetises its magnets in service, so it needs a magnet that is easy to rewrite. Matter's prototype is built around that property.",
        action: "Rewrite the magnet mid-drive.",
      },
      {
        id: "stackable-layers",
        label: "These stack rather than compete",
        line: "Conifer is ferrite and axial flux at once. PM-assisted SynRM and IPM-SynRM combine reluctance with magnets. These layers can coexist.",
        action: "Build a configuration across all five axes.",
      },
    ],
  },

  // ── Act IV ──────────────────────────────────────────────────────────────
  {
    id: "what-must-change",
    act: 4,
    actLabel: "The decision",
    number: 12,
    title: "What actually has to change",
    question: "Which problem are you trying to solve first?",
    stage: { kind: "svg", diagram: "swap-burden" },
    claimIds: [
      "vehicle-swap-burden",
      "vehicle-validation-window",
      "industrial-induction-incumbent",
      "named-company-corrections",
      "ibee-target-status",
      "renault-efficiency-condition",
      "market-rare-earth-free-share-small",
      "india-opportunity-capabilities",
    ],
    coversStepIds: [
      "vehicle-survivors-and-changes",
      "inverter-and-cooling-burden",
      "swap-burden-spectrum",
      "validation-runway",
      "two-markets-switch",
      "india-capability-stack",
      "final-decision-map",
    ],
    states: [
      {
        id: "survivors",
        label: "What survives any of this",
        line: "The body, battery and suspension can carry over. The drive unit is what changes.",
        action: "Change the architecture and watch the car.",
      },
      {
        id: "burden",
        label: "Where the burden lands",
        line: "Wound field needs a second rotor supply. Reluctance may need a larger inverter. PMSM heat stays in the stator; wound-field heat spins with the rotor and needs oil through a hollow shaft.",
        action: "Compare inverter and cooling per architecture.",
      },
      {
        id: "spectrum",
        label: "Not all swaps are the same size",
        line: "Dy-lean NdFeB changes little. Ferrite keeps the controls but grows the motor. Induction is well understood but changes part-load efficiency. Wound field is a platform, which is why BMW designed around it.",
        action: "Order the routes by how much has to change.",
      },
      {
        id: "validation",
        label: "Then the clock",
        line: "Every architecture change brings new control software, noise and vibration tuning, validation and homologation. That work takes years, not quarters.",
        action: "Add the validation runway to each route.",
      },
      {
        id: "two-markets",
        label: "Two markets, two reasons",
        line: "In EV traction, supply is the reason to look beyond the NdFeB motor. In industrial drives, induction already avoids neodymium; efficiency regulation is the reason to change. ABB sells reluctance there for energy savings.",
        action: "Switch the market filter.",
      },
      {
        id: "where-we-are",
        label: "Almost none of this has shipped",
        line: "Rare-earth-free traction is early and unevenly disclosed. Most routes in this tour are pre-market, so their remaining validation work is substantial.",
        action: "Read the evidence lane for each name.",
      },
    ],
  },
];

export const stageForState = (stop: Stop, state: StopState): StageKind =>
  state.stage ?? stop.stage;
