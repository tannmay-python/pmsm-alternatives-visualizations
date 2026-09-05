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
        line: "A battery-electric drivetrain has four parts. The battery pack under the floor stores electricity as direct current. The inverter converts it to three-phase alternating current, and software decides the timing. The motor converts that current into rotation, and a single-speed reduction gear brings the motor's speed down to the wheels'. In most cars the inverter, motor and gear share one housing on the driven axle, which the industry calls the drive unit.",
        action: "Follow the path from stored electricity to wheel torque.",
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
        line: "This rotor carries sixteen strips of magnet in V-shaped pockets, and steel bridges over each pocket hold them in against the forces at 15,000 rpm. The material is neodymium-iron-boron, written NdFeB. It stays magnetised with no electrical input, which is what a permanent magnet is, and the machine built around it is a permanent-magnet synchronous motor, PMSM in the industry's shorthand.",
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
        line: "The stator and the rotor do not touch. An air gap of under a millimetre separates them, and the torque that turns the wheels crosses it as magnetic force. The question for the rest of this walkthrough is what produces the magnetic field on the rotor side of that gap, since a permanent magnet is only one of the ways to do it.",
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
        line: "The stator carries three groups of coils, spaced evenly around the ring, and the inverter feeds them alternating currents a third of a cycle apart. At any instant one group carries the most current, and the combined north pole sits there. As the currents rise and fall in turn, that pole moves around the bore while every coil stays in its slot. The inverter sets how fast the field turns by setting the frequency.",
        action: "Watch the strongest coil and the combined field move around the bore.",
        stage: { kind: "svg", diagram: "rotating-field-clean" },
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
        label: "Synchronous",
        line: "Put a permanent-magnet rotor inside that turning field and it turns with it at the same speed, which is why the motor is called synchronous. The rotor trails the field by a small, steady angle, and the size of that angle sets the torque: a heavier load pulls the rotor further behind. When the driver presses the accelerator, the inverter raises the frequency and the rotor keeps pace.",
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
        line: "Steel on its own is pulled toward the position where magnetic flux passes through it most easily, in the same way a nail turns toward a magnet. Rotor designers shape the steel around the magnet pockets so that this pull adds to the magnets', and in a typical traction rotor it contributes something like a third of the total torque. This is also why the magnets are buried rather than glued to the surface: the steel around them is doing work.",
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
        line: "NdFeB is neodymium, iron and boron, and in practice praseodymium is used alongside the neodymium. Iron supplies most of the magnetic strength. Neodymium and praseodymium supply the coercivity, the resistance to being demagnetised when the stator's field pushes against the magnet. Boron stabilises the crystal structure that lets iron and neodymium coexist. No other commercial material gives as much field from as small a block, and that is why it is in the car.",
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
        label: "Why the heavy pair is there",
        line: "A magnet can be demagnetised. A strong enough opposing field flips part of it, and the loss is permanent. Heat reduces the field needed to do that, and a traction rotor runs at 150–180 °C under full load, which is also when the stator pushes hardest. Dysprosium and terbium raise the temperature at which the magnet holds. A motor without them either has to run cooler or has to be rated for less.",
        action: "Watch protection return to a hot magnet.",
        stage: { kind: "svg", diagram: "heat-protection-clean" },
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
        line: "By mass a traction magnet is roughly 69 per cent iron, 30 per cent neodymium and praseodymium, and 1 to 4 per cent dysprosium and terbium. Neodymium and praseodymium are light rare earths, mined in several countries. Dysprosium and terbium are heavy rare earths, added for heat resistance, and almost all of the world's supply is refined in China. The April 2025 notice covered dysprosium and terbium. It did not cover neodymium.",
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
        label: "Three ways to use less",
        line: "Three measures reduce heavy-rare-earth content without changing the motor. Cooling the rotor directly with oil lowers the temperature the magnet has to survive; Audi does this on the Q6 e-tron. Grain-boundary diffusion places dysprosium only at the crystal edges, where demagnetisation starts, instead of through the whole block. Dysprosium-free NdFeB grades exist and are going through qualification. None of the three is a drop-in, and each takes years of validation before a carmaker will fit it.",
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
        line: "Every traction motor needs something on the rotor for the stator's field to pull on. A permanent magnet is one option. A cage of conducting bars, in which the field induces its own current, is a second. A coil on the rotor fed with current from outside is a third. Steel shaped so that the field pulls it into alignment is the fourth, and steel pulled by one stator pole at a time is the fifth. Each removes some rare-earth exposure and adds an engineering cost somewhere else.",
        action: "Compare where each motor family gets its rotor field.",
        stage: { kind: "svg", diagram: "alternatives-map-clean" },
      },
      {
        id: "induction-principle",
        label: "Induction",
        line: "An induction motor replaces the magnets with a cage of aluminium or copper bars. The stator field runs slightly faster than the rotor, and the difference, called slip, induces current in the bars, which makes the rotor magnetic for as long as the slip continues. There are no rare earths in it. Because current flows in the rotor, heat is generated in the rotor, and efficiency at part load is a few points lower than a magnet machine's. Audi uses one on the front axle of the Q6 e-tron.",
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
        line: "A wound-field motor replaces the magnets with copper windings on the rotor and feeds them current through slip rings and brushes, or through a rotating transformer. The rotor becomes an electromagnet that the inverter can turn down at motorway speed, which a permanent magnet cannot do. It needs a second power supply, its own cooling, and a brush assembly that has to be maintained. BMW, Renault and Nissan all sell cars with wound-field motors.",
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
        line: "ZF I2SM, Mahle MCT and Valeo/Mahle iBEE pass field power across a rotating transformer instead of brushes. They are development paths; virtual-magnet machines are the same wound-field family.",
        action: "Swap brushes for the rotating transformer.",
        stage: { kind: "three", scene: "motor", rotor: "wound", excitation: "contactless" },
      },
      {
        id: "reluctance-spectrum",
        label: "Synchronous reluctance",
        line: "A synchronous reluctance motor has neither magnets nor rotor windings. Air barriers are cut into the rotor steel so that flux passes easily along one axis and poorly along the other, and the rotating field pulls the easy axis into line. The rotor is the cheapest of the five to make. The drawback is a poor power factor, which means the inverter carries more current for the same output, and a larger machine for the same torque. ABB sells these for industrial drives; they are rare in cars.",
        action: "Inspect the shaped steel paths inside a pure reluctance rotor.",
        stage: { kind: "svg", diagram: "synrm-mechanism-clean" },
      },
      {
        id: "srm-aluminium",
        label: "Switched reluctance",
        line: "A switched reluctance motor energises one pair of stator poles at a time, and the nearest rotor tooth is pulled into line before the next pair fires. The rotor is a stamped steel star with no magnets and no windings. Because the torque arrives in pulses it is uneven and noisy, and the control electronics have more work to do. Advanced Electric Machines in the UK builds them for trucks, with aluminium windings; passenger-car use is limited so far.",
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
        line: "A ferrite or iron-nitride motor is still a PMSM. Change the magnet chemistry and the architecture stays; Niron's automotive work is with carmakers rather than a motor of its own.",
        action: "Separate chemistry from architecture.",
      },
      {
        id: "ferrite-limit",
        label: "Ferrite",
        line: "Ferrite is iron oxide. It is cheap, mined everywhere, and contains no rare earths, and its remanence is about a third of NdFeB's. Put it in the same PMSM and the motor works at a third of the field, so recovering the output means more magnet, a larger rotor, a higher speed or a different geometry. Proterial's prototype makes 102 kW at 15,000 rpm against a 110 kW NdFeB baseline at 10,000 rpm. No production car uses a ferrite traction motor yet.",
        action: "Compare enlarged ferrite pockets with the NdFeB rotor.",
        stage: { kind: "svg", diagram: "ferrite-comparison-clean" },
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
        line: "A low-dysprosium magnet changes a supplier and a qualification file, and nothing else in the car. Ferrite changes the motor. Induction, wound field and reluctance change the whole drive unit: the motor, the inverter, the cooling circuit and the control software have to be redesigned together. Each step down that list removes more rare-earth exposure and costs more engineering, and the second fact is the one procurement decisions usually underweight.",
        action: "Order the routes from supplier qualification to platform work.",
        stage: { kind: "svg", diagram: "change-burden-clean" },
      },
      {
        id: "validation",
        label: "What is on the road",
        line: "Four of the six routes are in production somewhere. Low-dysprosium NdFeB is standard practice across the industry. Wound-field motors are in BMW, Renault and Nissan cars today. Induction motors run most industrial machinery and the front axle of the Audi Q6 e-tron. Ferrite has driven prototypes. The two reluctance machines run factories and trucks. Fitting any of them to a particular car is still a new drive-unit programme, and those run for years whether or not the motor type is proven elsewhere.",
        action: "Compare mechanism, rare-earth exposure, penalty and automotive state.",
        stage: { kind: "svg", diagram: "readiness-map-clean" },
      },
      {
        id: "two-markets",
        label: "Two markets, two reasons",
        line: "In EV traction, supply is the reason to look beyond the NdFeB motor. In industrial drives, induction already avoids neodymium; efficiency regulation is the reason to change. ABB sells reluctance there for energy savings.",
        action: "Switch the market filter.",
      },
      {
        id: "where-we-are",
        label: "What to do, and when",
        line: "For vehicles already in production, specify low-dysprosium grades and oil-cooled rotors. Nothing else in the car has to change. For the next platform, a wound-field or induction drive unit is proven abroad and would be a multi-year programme here. Ferrite and the two reluctance machines belong in test fleets and funded research at this stage, and we would not put them in a procurement specification yet.",
        action: "Review the three decisions the walkthrough has established.",
        stage: { kind: "svg", diagram: "decision-summary-clean" },
      },
    ],
  },
];

export const stageForState = (stop: Stop, state: StopState): StageKind =>
  state.stage ?? stop.stage;
