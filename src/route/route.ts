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
  | { kind: "three"; scene: "car"; }
  | { kind: "three"; scene: "motor"; rotor: RotorId }
  | { kind: "svg"; diagram: DiagramId };

export const diagramIds = [
  "supply-concentration",
  "demag-curve",
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
    stage: { kind: "three", scene: "car" },
    claimIds: [
      "illustrative-magnet-composition",
      "hree-controls-distinct-from-ndpr",
      "market-rare-earth-free-share-small",
    ],
    coversStepIds: ["car-transparent-cutaway", "market-early-share"],
    states: [
      {
        id: "the-motor-in-the-car",
        label: "The part that moves the car",
        line: "One drive unit near an axle turns the wheels. Everything else in the car exists to feed it or carry it.",
        action: "Rotate the car. Tap the drive unit.",
      },
      {
        id: "the-magnet-inside",
        label: "One to two kilograms of magnet",
        line: "Roughly 70% of EV traction motors put permanent magnets on the spinning rotor, and those magnets are neodymium-iron-boron.",
        action: "Zoom into the rotor.",
      },
      {
        id: "who-makes-it",
        label: "Where that magnet comes from",
        line: "China refines over 90% of rare earths and makes about 94% of the high-performance NdFeB magnets traction motors need.",
        action: "Follow the supply bar.",
        stage: { kind: "svg", diagram: "supply-concentration" },
      },
      {
        id: "the-control",
        label: "April 2025",
        line: "China's Announcement No. 18 placed medium and heavy rare earths under export licence, and assembly lines that had no second source stopped.",
        action: "Read the notice scope.",
        stage: { kind: "svg", diagram: "supply-concentration" },
      },
      {
        id: "the-real-question",
        label: "So what can actually be changed?",
        line: "Answering that needs three things: what the motor does, what the magnet does inside it, and which rare earth the notice actually named.",
        action: "Open the machine.",
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
        line: "Three parts share one housing: inverter, motor, reduction gear. The gear trades motor speed for wheel torque.",
        action: "Pull the drive unit out of the car.",
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
        label: "Seven parts",
        line: "Housing, end cap, bearing, stator, air gap, rotor, shaft. Only the rotor and shaft turn.",
        action: "Drag the explode slider.",
      },
      {
        id: "stator",
        label: "The stator stays still",
        line: "A stack of steel laminations carries copper in slots, wound as three separate groups spaced around the ring.",
        action: "Isolate the stator. Highlight one phase group.",
      },
      {
        id: "rotor",
        label: "The rotor turns",
        line: "Steel laminations with magnets buried in pockets inside them, keyed to the shaft.",
        action: "Isolate the rotor.",
      },
      {
        id: "air-gap",
        label: "They never touch",
        line: "A gap under a millimetre separates them. All the force crosses that gap magnetically.",
        action: "Measure the gap.",
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
        id: "one-phase",
        label: "One group at a time",
        line: "Current in one coil group makes a north pole at a fixed place on the ring. That pole does not move.",
        action: "Energise group A alone.",
      },
      {
        id: "three-phases",
        label: "Three groups, offset in time",
        line: "The inverter feeds each group a current one third of a cycle behind the last, so the three fields sum to one pole that sweeps around the bore.",
        action: "Scrub the electrical angle. Watch the three traces and the sum.",
      },
      {
        id: "no-part-moves",
        label: "Nothing physical travels",
        line: "The copper is bolted down. What travels is the position of the strongest pull, and its speed is the frequency the inverter chooses.",
        action: "Slow the frequency down.",
      },
      {
        id: "rotor-locks",
        label: "The rotor keeps pace",
        line: "The rotor's own poles are pulled toward the sweeping pole and settle just behind it, turning at exactly the fed frequency. That is what synchronous means.",
        action: "Release the rotor into the field.",
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
        line: "Surface magnets would be thrown off by rotation and by the stator's pull. Steel bridges over the pockets hold them in.",
        action: "Cut the rotor open.",
      },
      {
        id: "lopsided",
        label: "Burying them makes the steel lopsided",
        line: "A magnet carries flux about as badly as air, so the route through a magnet is magnetically hard and the steel route between magnets is easy.",
        action: "Trace both routes.",
      },
      {
        id: "reluctance",
        label: "Lopsided steel makes its own torque",
        line: "The rotor twists to line its easy route up with the field, adding torque that costs no extra magnet.",
        action: "Show magnet torque and steel torque separately.",
      },
      {
        id: "load-angle",
        label: "Load opens the angle",
        line: "Heavier load makes the rotor sit further behind the field. Both pulls grow together and the rotor stays in step.",
        action: "Drag the load. Watch the torque split.",
      },
      {
        id: "already-both",
        label: "This is not a separate motor",
        line: "Mainstream traction motors already run both effects at once; Tesla names its machine IPM-SynRM for exactly this reason.",
        action: "Compare the two contributions at cruise and at launch.",
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
        id: "remanence",
        label: "Remanence: what is left",
        line: "Remanence is the flux the magnet still holds with nothing helping it, and it comes mostly from iron's large magnetic moment.",
        action: "Remove the applied field and read what remains.",
      },
      {
        id: "coercivity",
        label: "Coercivity: what it takes to undo it",
        line: "Coercivity is the reverse field needed to push the magnetisation back to zero. Iron alone has almost none, so plain iron cannot be a motor magnet.",
        action: "Push the reverse field until it flips.",
      },
      {
        id: "anisotropy",
        label: "Where the stubbornness comes from",
        line: "Neodymium's tightly bound, strongly spin-orbit-coupled electrons make the crystal strongly prefer one magnetisation axis, and that preference is what resists reversal.",
        action: "Rotate the crystal axis against the field.",
      },
      {
        id: "division-of-labour",
        label: "A division of labour",
        line: "In NdFeB the iron supplies the strength and the neodymium holds the direction. Neither element does the job alone.",
        action: "Toggle each element out of the alloy.",
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
    stage: { kind: "svg", diagram: "magnet-composition" },
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
        id: "heat-cuts-coercivity",
        label: "Heat spends the margin",
        line: "Coercivity falls as the magnet heats, and a traction rotor runs at 150–180 °C.",
        action: "Raise rotor temperature and watch the curve shift.",
        stage: { kind: "svg", diagram: "demag-curve" },
      },
      {
        id: "two-stresses",
        label: "Heat alone is survivable",
        line: "Hard acceleration drives the stator field back against the magnet. Heat and that reverse field together are what cross the line.",
        action: "Raise heat and reverse field independently, then together.",
        stage: { kind: "svg", diagram: "demag-curve" },
      },
      {
        id: "nucleation",
        label: "Reversal starts at the surface",
        line: "A grain does not flip all at once; a small reversed region forms at the grain's outer surface and sweeps inward. That loss stays after cooling.",
        action: "Trigger a reversal and then cool the magnet.",
      },
      {
        id: "dysprosium",
        label: "Dysprosium holds the lock hotter",
        line: "Dysprosium keeps its magnetisation locked to a higher temperature than neodymium, so a little of it restores the margin heat took away.",
        action: "Add dysprosium and re-run the heat test.",
      },
      {
        id: "the-cost",
        label: "Why not use more of it",
        line: "Dysprosium's magnetic moment opposes iron's, so every atom added subtracts from the magnet's strength.",
        action: "Push dysprosium high and watch remanence fall.",
      },
      {
        id: "gbd",
        label: "Put it only where it is needed",
        line: "Grain-boundary diffusion leaves NdFeB in the grain core and concentrates dysprosium in the outer shell, protecting the surface where reversal starts while using far less of it.",
        action: "Switch from uniform doping to a diffused shell.",
      },
      {
        id: "composition",
        label: "What the magnet actually is",
        line: "By weight: about 69% iron for strength, about 30% neodymium and praseodymium to hold direction, and 1–4% dysprosium so the lock survives heat.",
        action: "Break the magnet down by mass.",
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
        line: "Neodymium and praseodymium are light rare earths, more widely mined and not named in the April 2025 announcement. Dysprosium and terbium are heavy, scarcer, and are what the notice covers.",
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
        line: "The controlled element is the 1–4% one, and grain-boundary diffusion already existed to use less of it. Cut the dysprosium and the motor still runs with a lower temperature ceiling.",
        action: "Climb the mitigation ladder one rung at a time.",
        stage: { kind: "svg", diagram: "mitigation-ladder" },
      },
      {
        id: "cool-it-instead",
        label: "Or take the heat away",
        line: "Needing less thermal margin means needing less dysprosium, so Audi's direct rotor oil cooling on the Q6 e-tron attacks the same problem from the other side.",
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
        line: "Does the rotor keep pace with the stator field or not? Permanent-magnet, wound-field and reluctance rotors all keep pace; only induction runs behind.",
        action: "Pick a branch.",
      },
      {
        id: "cage",
        label: "Induction: the rotor makes its own field",
        line: "Bare steel with aluminium or copper bars shorted by end rings. The sweeping field induces current in those bars, and that current makes the rotor field the stator then pulls on.",
        action: "Drop the squirrel cage in.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "slip",
        label: "Slip is the operating principle",
        line: "If the rotor ever caught the field nothing would be changing and no current would be induced, so it must run 1–3% behind under load. Load it harder and it slips more, induces more, and makes more torque.",
        action: "Load the shaft and watch the gap open.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "cage-tradeoff",
        label: "What the cage costs and what it wins",
        line: "That rotor current flows through resistance, so the rotor heats and part-load efficiency falls short of a magnet rotor. Cut the power, though, and the rotor field dies instantly and nothing drags.",
        action: "Cut power to the cage and to the magnet rotor.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "mixed-axle",
        label: "Which is why some cars use both",
        line: "Audi puts an induction motor on the front axle of the Q6 e-tron and a permanent-magnet motor on the rear, so the unused axle costs nothing to carry. BMW splits the same way.",
        action: "Assign a motor to each axle.",
        stage: { kind: "three", scene: "motor", rotor: "squirrel-cage" },
      },
      {
        id: "wound",
        label: "Wound field: put the magnet under control",
        line: "Wrap the rotor in copper and feed it current deliberately. It is a PMSM with an electromagnet in place of the permanent magnet, and no neodymium anywhere.",
        action: "Drop the wound rotor in.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "wound-wins",
        label: "Turn the field down at speed",
        line: "The field is an input, so it can be reduced or switched off at motorway speed. The field-weakening loss from the previous stop disappears.",
        action: "Cruise, and turn the rotor field down.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "wound-costs",
        label: "What it costs",
        line: "A second supply is needed just to feed the rotor, and the rotor now carries current and heats, which usually means oil fed through a hollow shaft.",
        action: "Turn the rotor cooling on and off.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "brushes-ship",
        label: "The supposed blocker already ships",
        line: "Getting current onto a spinning rotor is usually called the blocker, but BMW's fifth-generation eDrive has used brushes since 2020 across the i4, iX, i7 and i5, the Nissan Ariya does the same, and Renault has shipped this since the 2012 Zoe.",
        action: "Separate production evidence from development.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "contactless",
        label: "Contactless excitation is the new part",
        line: "ZF's I2SM, Mahle's MCT and Valeo's iBEE pass the field power through a rotating transformer instead of brushes. None is in a production car yet, and the 'virtual magnet' machines are this same architecture.",
        action: "Swap brushes for the rotating transformer.",
        stage: { kind: "three", scene: "motor", rotor: "wound" },
      },
      {
        id: "synrm",
        label: "Reluctance: no magnet, no winding",
        line: "Shaped steel with air barriers cut into it, turning because steel is pulled toward the easy magnetic route. It is the same effect already at work inside the IPM rotor.",
        action: "Drop the reluctance rotor in.",
        stage: { kind: "three", scene: "motor", rotor: "synrm" },
      },
      {
        id: "power-factor",
        label: "The inverter pays for it",
        line: "A pure reluctance machine has a poor power factor, so the same wheel power needs more inverter current, more silicon and more cooling — which eats into the bill-of-materials saving the missing magnets bought.",
        action: "Compare inverter sizing against the magnet saving.",
        stage: { kind: "three", scene: "motor", rotor: "synrm" },
      },
      {
        id: "pm-assisted",
        label: "The textbook fix puts magnets back",
        line: "Small magnets in the flux barriers repair the power factor and the speed range. That is PM-assisted SynRM, which is what the mainstream IPM-SynRM already was.",
        action: "Add magnets back into the barriers.",
        stage: { kind: "three", scene: "motor", rotor: "pm-assisted-synrm" },
      },
      {
        id: "srm",
        label: "Or delete the copper too",
        line: "Advanced Electric Machines runs switched reluctance with compressed aluminium windings at 30,000 rpm, with no rare earths and no copper, so the motor goes through the standard steel recycling route.",
        action: "Read peak beside continuous.",
        stage: { kind: "three", scene: "motor", rotor: "synrm" },
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
        line: "A ferrite motor is still a PMSM and an iron-nitride motor is still a PMSM. Changing the magnet chemistry leaves the architecture in place, which is why Niron's automotive work is with carmakers rather than a motor of its own.",
        action: "Separate chemistry from architecture.",
      },
      {
        id: "ferrite",
        label: "Ferrite is cheap and weak",
        line: "Iron oxide with strontium or barium: abundant, uncontrolled, and roughly a third of neodymium's remanence — which squares to about a ninth of the useful energy product.",
        action: "Swap NdFeB for ferrite at the same size.",
      },
      {
        id: "ferrite-fix",
        label: "So the motor has to change shape",
        line: "The design compensates by growing in diameter or length, spinning faster, or moving to axial flux, where the field runs along the axis and torque density rises over a shorter package.",
        action: "Choose a compensation route.",
      },
      {
        id: "ferrite-cold",
        label: "Ferrite's risk is the cold end",
        line: "Ferrite coercivity falls as temperature drops, so cold-start demagnetisation is the automotive constraint, not overheating.",
        action: "Run the cold-start case.",
      },
      {
        id: "proterial-numbers",
        label: "Read both numbers together",
        line: "Proterial's ferrite prototype makes 102 kW at 15,000 rpm against a 110 kW at 10,000 rpm neodymium baseline: lower power at 50% more speed, not parity.",
        action: "Show power with its speed.",
      },
      {
        id: "iron-nitride",
        label: "Iron nitride has strength, not stubbornness",
        line: "Its saturation magnetisation of about 2.5 T beats neodymium's, but saturation is only the remanence side of the ledger and its magnetocrystalline anisotropy is low.",
        action: "Plot both axes from stop 6.",
      },
      {
        id: "hardness",
        label: "The number that decides it",
        line: "Magnetic hardness must exceed 1 for a viable permanent magnet. NdFeB sits at 1.54; iron nitride sits below the threshold.",
        action: "Compare hardness, not saturation.",
      },
      {
        id: "niron-actual",
        label: "What the material actually is",
        line: "Niron's material is around 1 T remanence and 10 MGOe energy product, with a stated coercivity ceiling of 4,000–5,000 Oe against neodymium's 12,000 Oe. That places it between ferrite and neodymium, and Niron says it is not a drop-in replacement.",
        action: "Place it on the board.",
      },
      {
        id: "thermal",
        label: "And it comes apart at temperature",
        line: "Iron nitride decomposes somewhere around 216–250 °C against a traction duty of 150–180 °C with transients above that.",
        action: "Overlay the duty band.",
      },
      {
        id: "variable-flux",
        label: "Where low coercivity is the point",
        line: "A variable flux motor deliberately weakens and re-magnetises its magnets in service, so it wants a magnet that is easy to rewrite. Matter's prototype is built around the property the material is usually criticised for.",
        action: "Rewrite the magnet mid-drive.",
      },
      {
        id: "stackable",
        label: "These stack rather than compete",
        line: "Conifer is ferrite and axial flux at once; PM-assisted SynRM is reluctance plus magnets; IPM-SynRM is the same. Exclusive categories misrepresent all three.",
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
        line: "Body, crash structure, interior, battery and suspension carry over unchanged. The drive unit does not.",
        action: "Change the architecture and watch the car.",
      },
      {
        id: "burden",
        label: "Where the burden lands",
        line: "Wound field needs a second supply for the rotor field; reluctance needs an oversized inverter for power factor; PMSM losses land in the stator where a water jacket handles them, wound-field losses land in a spinning rotor and need oil through a hollow shaft.",
        action: "Compare inverter and cooling per architecture.",
      },
      {
        id: "spectrum",
        label: "Not all swaps are the same size",
        line: "Dy-lean NdFeB changes nothing in the vehicle. Ferrite keeps the control and failure modes but grows the motor. Induction is well understood and roughly interchangeable at a few points of part-load efficiency. Wound field is a platform, which is why BMW designed one around it rather than retrofitting.",
        action: "Order the routes by how much has to change.",
      },
      {
        id: "validation",
        label: "Then the clock",
        line: "New control software and NVH calibration follow every architecture change, and validation and homologation take years, not quarters.",
        action: "Add the validation runway to each route.",
      },
      {
        id: "two-markets",
        label: "Two markets, two reasons",
        line: "In EV traction the incumbent is the NdFeB magnet motor and the reason to change is supply. In industrial drives the incumbent is the induction motor, which never had neodymium, and the reason to change is efficiency regulation. ABB sells reluctance into the second on energy savings.",
        action: "Switch the market filter.",
      },
      {
        id: "where-we-are",
        label: "Almost none of this has shipped",
        line: "Rare-earth-free traction is an early, unevenly disclosed segment. Most of what this tour covered is pre-market, which means the share still to be won is nearly all of it.",
        action: "Read the evidence lane for each name.",
      },
    ],
  },
];

export const stopById = (id: string) => STOPS.find((stop) => stop.id === id);

export const flatPositions = STOPS.flatMap((stop) =>
  stop.states.map((state) => ({ stopId: stop.id, stateId: state.id })),
);

export const stageForState = (stop: Stop, state: StopState): StageKind =>
  state.stage ?? stop.stage;
