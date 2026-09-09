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
  "grip-rule-clean",
  "rotating-field-clean",
  "rotor-follows-field-clean",
  "torque-combination-clean",
  "magnet-jobs-clean",
  "rare-earth-split-clean",
  "heat-protection-clean",
  "mitigation-options-clean",
  "alternatives-map-clean",
  "displacement-prospects",
  "synrm-mechanism-clean",
  "srm-mechanism-clean",
  "ferrite-comparison-clean",
  "change-burden-clean",
  "readiness-map-clean",
  "decision-summary-clean",
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
    question: "Where does the motor sit, and how does battery power reach the wheels?",
    stage: { kind: "three", scene: "car" },
    claimIds: [],
    coversStepIds: ["power-path-flow", "drive-unit-extract"],
    states: [
      {
        id: "power-path",
        label: "Battery, inverter, motor, gear",
        line: "A battery-electric drivetrain has four parts. The battery pack under the floor stores chemical energy and supplies direct current. The inverter converts this direct current into three-phase alternating current, with software controlling the timing. The motor turns electrical energy into rotation, and a reduction gear lowers the motor's speed to suit the wheels. The motor, inverter and gear are often integrated into a drive unit on the driven axle.",
        action: "Follow the path from chemical energy to wheel torque.",
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
    question: "What stays still, what rotates, and where are the magnets?",
    stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
    claimIds: ["ipm-magnets-buried"],
    coversStepIds: ["motor-isolation", "pmsm-assemble-stator"],
    states: [
      {
        id: "explode",
        label: "Stator and rotor",
        line: "Two parts do most of the work. The stator is a ring of stacked steel sheets with copper windings in its slots; it is bolted to the housing and does not move. The rotor is a steel cylinder fixed to the output shaft, and it turns inside the stator. The permanent magnets are set into the rotor's steel, so an assembled motor, or even an opened one, shows no magnet from the outside.",
        action: "Watch the assembly separate into its stationary and rotating parts.",
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
        label: "The magnets",
        line: "This rotor carries sixteen strips of magnet in V-shaped pockets, and steel bridges over each pocket hold them in against the forces of high-speed rotation. The material is neodymium-iron-boron, written NdFeB. It stays magnetised with no electrical input, which is what a permanent magnet is, and the machine built around it is a permanent-magnet synchronous motor, PMSM in the industry's shorthand.",
        action: "Locate the permanent magnets inside the spinning rotor.",
      },
      {
        id: "shaft",
        label: "The shaft carries the torque",
        line: "The shaft is keyed to the rotor and carries its torque through the bearings to the reduction gear.",
        action: "Follow the shaft from the rotor to the gearbox connection.",
      },
      {
        id: "air-gap",
        label: "The air gap",
        line: "The stator and the rotor do not touch. A narrow air gap separates them, and the torque that turns the wheels crosses it as magnetic force. The question for the rest of this walkthrough is what produces the magnetic field on the rotor side of that gap, since a permanent magnet is only one of the ways to do it.",
        action: "Look down the bore at the gap where the magnetic fields meet.",
      },
    ],
  },
  {
    id: "three-coils-one-field",
    act: 1,
    actLabel: "The machine",
    number: 4,
    title: "Three coils, one moving field",
    question: "How do stationary coils produce a rotating field?",
    stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
    claimIds: ["pmsm-stator-three-phase-field", "pmsm-synchronous-torque-angle"],
    coversStepIds: ["pmsm-three-phase-field", "pmsm-rotor-lock"],
    states: [
      {
        id: "electromagnet-rule",
        label: "The right-hand grip rule",
        line: "A coil with current flowing through it is an electromagnet. To find its north pole, curl the fingers of the right hand in the direction the current travels around the coil; the thumb then points north. Reversing the current reverses the poles. The motor relies on this because it means a magnet's direction can be set electrically, and changed as often as the electronics can switch.",
        action: "Reverse the current and watch North and South exchange places.",
        stage: { kind: "svg", diagram: "grip-rule-clean" },
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
        label: "Three coil groups",
        line: "The stator has three coil groups. Their alternating currents are a third of a cycle apart. Each produces a magnetic field along its own axis; these fields add as vectors, so both strength and direction matter. Their sum rotates smoothly while the coils stay fixed. The inverter sets the electrical supply frequency; this and the number of pole pairs determine the field's synchronous speed.",
        action: "Watch the three field vectors combine into one rotating field.",
        stage: { kind: "svg", diagram: "rotating-field-clean" },
      },
      {
        id: "no-part-moves",
        label: "The rotating field inside the bore",
        line: "Every copper coil stays fixed. The inverter's electrical supply frequency and the motor's number of pole pairs determine the rotating field's synchronous speed.",
        action: "Adjust inverter AC frequency to change field rotation speed.",
        stage: { kind: "three", scene: "motor", rotor: "ipm-ndfeb" },
      },
      {
        id: "rotor-locks",
        label: "Synchronous",
        line: "The permanent-magnet rotor turns at the same speed as the stator's rotating field. This is why the motor is called synchronous. The inverter controls current to produce the turning force, or torque, the driver requests.",
        action: "Watch the stator field pull the rotor around the air gap.",
        stage: { kind: "svg", diagram: "rotor-follows-field-clean" },
      },
    ],
  },
  {
    id: "two-pulls-one-shaft",
    act: 1,
    actLabel: "The machine",
    number: 5,
    title: "Two pulls, one shaft",
    question: "Where does the rest of the torque come from?",
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
        label: "Reluctance torque",
        line: "Shaped steel also turns toward the position where magnetic flux passes through it most easily. This produces reluctance torque, which adds to the magnets' turning force. Reluctance motors use this effect to turn the rotor without permanent magnets.",
        action: "Compare magnet pull with steel alignment.",
        stage: { kind: "svg", diagram: "torque-combination-clean" },
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
    question: "Why does the industry use this particular magnet?",
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
        label: "Neodymium, iron, boron",
        line: "NdFeB is neodymium, iron and boron, and in practice praseodymium is used alongside the neodymium. Iron supplies most of the magnetic strength. Neodymium and praseodymium help the crystal favour one direction of magnetisation. This, together with the magnet's microstructure, helps it resist demagnetisation. Boron stabilises the crystal structure. Together they make a strong, compact permanent magnet suited to traction motors.",
        action: "Compare the two jobs inside one magnet.",
        stage: { kind: "svg", diagram: "magnet-jobs-clean" },
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
    question: "Why is that small addition so hard to remove?",
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
        line: "Heat reduces a magnet's resistance to reversal. A sufficiently strong opposing stator field can then push its operating point beyond the knee, causing irreversible demagnetisation.",
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
        label: "Why the heavy pair is there",
        line: "A strong opposing field can leave a magnet permanently weaker. Heat makes this easier by reducing its resistance to demagnetisation. Dysprosium and terbium improve that resistance. Better control of the magnet's grain structure and effective rotor cooling can also help, allowing some designs to use less of these elements or avoid them. The magnet grade must suit the motor's temperatures and opposing fields.",
        action: "Watch protection return to a hot magnet.",
        stage: { kind: "svg", diagram: "heat-protection-clean" },
      },
      {
        id: "diffusion-evolution",
        label: "Put the patch only at the vulnerable edge",
        line: "Grain-boundary diffusion puts a Dy-rich shell at the surface where reversal starts instead of filling the whole core. The amount required depends on the magnet grade and processing method.",
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
    question: "Which rare earths were actually restricted?",
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
        label: "What the notice covered",
        line: "An NdFeB magnet is mostly iron, with neodymium, praseodymium and a small amount of boron. Some grades also contain dysprosium or terbium to improve resistance to demagnetisation when hot. The proportions vary by grade. The April 2025 notice covered these two heavy rare earths and NdFeB magnets containing them. It did not cover neodymium or praseodymium themselves.",
        action: "Separate the magnet by material role and control exposure.",
        stage: { kind: "svg", diagram: "rare-earth-split-clean" },
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
        line: "Dysprosium content varies by grade, and diffusion can reduce the amount needed. Reducing it requires checking the magnet’s resistance to demagnetisation in the intended motor.",
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
        label: "Three ways to use less",
        line: "Three approaches reduce heavy-rare-earth use while keeping a permanent-magnet motor. Direct rotor oil cooling lowers the temperature the magnets face; Audi uses it on the Q6 e-tron. Grain-boundary diffusion concentrates dysprosium near crystal edges, where demagnetisation starts. Heavy-rare-earth-free grades offer another route. Each approach needs checks for the intended vehicle, and some need cooling or manufacturing changes before deployment.",
        action: "Compare three low-disruption mitigation routes.",
        stage: { kind: "svg", diagram: "mitigation-options-clean" },
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
    question: "What can turn a rotor instead of a permanent magnet?",
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
        label: "Five kinds of rotor",
        line: "These five motor families compete in different markets. Audi combines a permanent-magnet rear motor with an induction front motor; BMW uses wound field. Reluctance has commercial uses in industry and ventilation, with companies also developing mobility applications. Compactness, efficiency, intermittent use and noise requirements help explain these choices. A motor sold for a factory is not automatically ready for a passenger car.",
        action: "Compare where each motor family gets its rotor field.",
        stage: { kind: "svg", diagram: "alternatives-map-clean" },
      },
      {
        id: "induction-principle",
        label: "Induction",
        line: "An induction motor uses aluminium or copper rotor bars instead of magnets. The field turns faster than the rotor; this difference, called slip, induces current in the bars. That current creates the rotor's magnetic field and also produces heat that must be removed.\n\nAudi's Q6 e-tron quattro uses a front induction motor for additional power and all-wheel drive. It is inactive when not needed. The front motor adds performance when required, while the rear permanent-magnet motor handles most everyday driving.",
        action: "Watch the stator field induce current in the rotor cage.",
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
        label: "Wound field",
        line: "A wound-field motor feeds current into rotor coils instead of using magnets. Its field can be reduced at high speed. It needs a rotor power supply, transfer hardware and cooling.\n\nRenault used it in the 2012 Zoe model; Nissan's Ariya followed in 2022, and BMW also uses it. Renault is developing a new generation. Automotive suppliers ZF, Valeo and Mahle are developing brushless versions, with Valeo and Mahle working together.",
        action: "Trace the electrical supply into the rotor winding.",
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
        line: "Automotive suppliers ZF, Mahle and Valeo are developing I2SM, MCT and the joint Valeo/Mahle iBEE system. These pass field power across a rotating transformer instead of brushes. They are development paths; virtual-magnet machines are the same wound-field family.",
        action: "Swap brushes for the rotating transformer.",
        stage: { kind: "three", scene: "motor", rotor: "wound", excitation: "contactless" },
      },
      {
        id: "reluctance-spectrum",
        label: "Synchronous reluctance",
        line: "A synchronous reluctance motor uses shaped steel, without magnets or rotor windings. The stator field pulls its easy magnetic axis into line. Lower power factor can require a larger inverter.\n\nIndustrial motor supplier ABB sells these drives. Indian motor developer Chara Technologies offers motor-and-controller systems for mobility and industry.",
        action: "Inspect the shaped steel paths inside a pure reluctance rotor.",
        stage: { kind: "svg", diagram: "synrm-mechanism-clean" },
      },
      {
        id: "srm-aluminium",
        label: "Switched reluctance",
        line: "A switched reluctance motor pulls steel rotor teeth into alignment by switching stator currents in sequence. It needs no rotor magnets or windings. Smooth torque requires complex control of current timing and shape, plus vibration and noise testing.\n\nMotor-system supplier Turntide sells these motors for building ventilation. Cars require torque monitoring and fault protection against unintended torque changes, as with other traction drives. Adapting these systems for cars requires vehicle-specific validation.",
        action: "Watch the stator poles pull the toothed rotor into alignment.",
        stage: { kind: "svg", diagram: "srm-mechanism-clean" },
      },
    ],
  },
  {
    id: "change-the-magnet",
    act: 3,
    actLabel: "The alternatives",
    number: 11,
    title: "Change the magnet, not the machine",
    question: "Can the motor stay and the magnet change?",
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
        line: "A ferrite or iron-nitride motor is still a PMSM. Change the magnet chemistry and the architecture stays; magnet developer Niron Magnetics' automotive work is with carmakers rather than a motor of its own.",
        action: "Separate chemistry from architecture.",
      },
      {
        id: "ferrite-limit",
        label: "Ferrite",
        line: "Ferrite magnets use iron oxide and no rare earths. Their weaker field than NdFeB means recovering output through more magnet material, a larger rotor, higher speed or different geometry.\n\nProterial's ferrite prototype has a maximum output of 102 kW and maximum speed of 15,000 rpm; its NdFeB baseline has 110 kW and 10,000 rpm respectively. Magnet developer Niron Magnetics and Indian motorcycle maker Matter showed an iron-nitride prototype at CES 2026. These projects are steps toward commercial vehicle applications.",
        action: "Compare enlarged ferrite pockets with the NdFeB rotor.",
        stage: { kind: "svg", diagram: "ferrite-comparison-clean" },
      },
      {
        id: "rare-earth-displacement",
        label: "Where rare-earth magnets could lose ground",
        line: "Wound-field motors have the clearest near-term path to wider use in passenger cars: they already power main drives and their field is adjustable. Induction is also established, especially for an additional axle. Ferrite opens a route within the permanent-magnet family, while reluctance designs offer simpler rotors with more work in the inverter and controls. All five can remove rare-earth magnets; the difference is how readily they can meet the car’s performance, packaging and manufacturing needs.",
        action: "Open each route to compare its benefits, engineering costs and commercial progress.",
        stage: { kind: "svg", diagram: "displacement-prospects" },
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
        line: "Axial flux is a geometry; ferrite is a chemistry. Motor developer Conifer uses both, so they are not competing options.",
        action: "Switch the axial machine's magnets to neodymium.",
        stage: { kind: "three", scene: "axial", chemistry: "ndfeb" },
      },
      {
        id: "proterial-numbers",
        label: "Read both numbers together",
        line: "Japanese materials maker Proterial's ferrite prototype has a maximum output of 102 kW and a maximum speed of 15,000 rpm; its neodymium baseline has a maximum output of 110 kW and a maximum speed of 10,000 rpm.",
        action: "Show power with its speed.",
      },
      {
        id: "iron-nitride-gates",
        label: "Iron nitride must clear four gates",
        line: "Fe16N2 offers about 2.5 T saturation and reported 1 T remanence. Hardness below one, a stated 4,000–5,000 Oe coercivity ceiling and 216–250 °C decomposition work remain development gates, requiring further validation for vehicle use.",
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
        line: "Motor developer Conifer uses ferrite and axial flux at once. PM-assisted SynRM and IPM-SynRM combine reluctance with magnets. These layers can coexist.",
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
    question: "How much of the vehicle has to change?",
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
        label: "Three sizes of change",
        line: "Reducing rare-earth use can mean changing a magnet grade, redesigning the rotor or adopting another motor family. The table shows the engineering work each route involves. Carmakers and motor suppliers must also check how the change affects range, packaging, cooling, smooth torque and durability in the intended vehicle. A motor already proven in one application can still need substantial development for another. The engineering priorities depend on how the vehicle will be used.",
        action: "Order the routes from supplier qualification to platform work.",
        stage: { kind: "svg", diagram: "change-burden-clean" },
      },
      {
        id: "validation",
        label: "What is proven, and where",
        line: "Induction and wound-field motors already power production cars: Renault's Zoe from 2012, Nissan's Ariya from 2022 and BMW's fifth-generation eDrive are wound-field examples. Reluctance motors have industrial uses; ferrite traction motors have tested prototypes. What remains differs by design: proving range, sustained power, noise and durability in the intended vehicle, then repeatable manufacture. The table separates those stages. Its costs are hardware, losses and engineering work, not quoted prices.",
        action: "Compare mechanism, rare-earth exposure, penalty and automotive state.",
        stage: { kind: "svg", diagram: "readiness-map-clean" },
      },
      {
        id: "two-markets",
        label: "Two markets, two reasons",
        line: "In EV traction, supply is the reason to look beyond the NdFeB motor. In industrial drives, induction already avoids neodymium; efficiency regulation is the reason to change. Industrial motor supplier ABB sells reluctance there for energy savings.",
        action: "Switch the market filter.",
      },
      {
        id: "where-we-are",
        label: "Where the technology could go next",
        line: "Technology substitution is opening more ways to reduce rare-earth dependence. In India, automotive supplier Sona Comstar reports a tested and validated ferrite-assisted reluctance motor. Motor developer Chara Technologies offers reluctance systems for mobility and industry. This testing and product development is building a path to wider commercial use. As these approaches mature, they can help the world diversify away from rare-earth magnets while meeting vehicles' performance needs.",
        action: "Review the three decisions the walkthrough has established.",
        stage: { kind: "svg", diagram: "decision-summary-clean" },
      },
    ],
  },
];

export const stageForState = (stop: Stop, state: StopState): StageKind =>
  state.stage ?? stop.stage;
