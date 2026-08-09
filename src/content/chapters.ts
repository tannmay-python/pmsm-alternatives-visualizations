import type { Chapter, ChapterId, SceneDefinition, SceneId, VisualState } from "../types";

export const SCENE_REGISTRY: Readonly<Record<SceneId, SceneDefinition>> = {
  "vehicle-overview": {
    id: "vehicle-overview",
    motif: "vehicle",
    legacyProgress: 0,
    accessibilityLabel: "A simplified electric vehicle with an energy path to its drive unit.",
    visualDirection: "Car location, power path, extracted unit, and isolated motor sequence.",
  },
  "pmsm-turn": {
    id: "pmsm-turn",
    motif: "motor",
    legacyProgress: 3,
    accessibilityLabel: "A motor cross-section with stator coils, a rotor, and a rotating field.",
    visualDirection: "Assembly, field rotation, torque angle, and IPM reluctance close-up.",
  },
  "magnet-material": {
    id: "magnet-material",
    motif: "grain",
    legacyProgress: 4,
    accessibilityLabel: "A magnet viewed as grains, with an outer shell around each grain.",
    visualDirection: "Magnetic strength, magnetic stability, heat, and grain-boundary diffusion.",
  },
  "exposure-options": {
    id: "exposure-options",
    motif: "flux",
    legacyProgress: 4,
    accessibilityLabel: "A magnetic flux path with a choice of lower-exposure routes.",
    visualDirection: "Cooling, reduced heavy rare earth use, field weakening, and motor families.",
  },
  "alternative-laboratory": {
    id: "alternative-laboratory",
    motif: "rotors",
    legacyProgress: 5,
    accessibilityLabel: "Four contrasting rotor principles arranged as a comparison laboratory.",
    visualDirection: "Induction, wound field, synchronous reluctance, and switched reluctance mechanisms.",
  },
  "magnet-geometry": {
    id: "magnet-geometry",
    motif: "materials",
    legacyProgress: 4,
    accessibilityLabel: "Magnet chemistry and motor geometry shown as separate, stackable choices.",
    visualDirection: "Ferrite, iron nitride, axial flux, and configurable motor layers.",
  },
  "vehicle-change": {
    id: "vehicle-change",
    motif: "vehicle-change",
    legacyProgress: 1,
    accessibilityLabel: "A vehicle silhouette separating unchanged vehicle systems from drive-unit changes.",
    visualDirection: "Swap burden, cooling, inverter, packaging, calibration, and validation.",
  },
  "market-evidence": {
    id: "market-evidence",
    motif: "evidence",
    legacyProgress: 5,
    accessibilityLabel: "Two market lanes and a dated evidence ladder for motor technologies.",
    visualDirection: "EV traction and industrial markets, evidence lanes, and India capability map.",
  },
};

export const CHAPTERS: readonly Chapter[] = [
  {
    id: "where-the-motor-lives",
    title: "Where the motor lives",
    shortTitle: "The car",
    learningGoal: "Locate the drive unit and follow energy from the battery to the road.",
    steps: [
      {
        id: "motor-locations",
        title: "Motor locations",
        question: "Where does the traction motor sit in this car?",
        learningGoal: "Find the drive unit at the axle before following anything else.",
        sceneId: "vehicle-overview",
        visualState: {
          mode: "spatial-map",
          primaryAction: "Locate the drive unit.",
          visibleElements: ["car", "axle", "drive unit"],
          visualChange: "The drive unit lights up at the axle.",
        },
      },
      {
        id: "power-path",
        title: "The power path",
        question: "How does battery energy reach the wheel?",
        learningGoal: "Follow one line from battery to inverter, motor, and wheel.",
        sceneId: "vehicle-overview",
        visualState: {
          mode: "causal-flow",
          primaryAction: "Advance the energy path.",
          visibleElements: ["battery", "inverter", "motor", "wheel"],
          visualChange: "One connection lights at a time from stored energy to wheel motion.",
        },
      },
      {
        id: "extract-and-open-unit",
        title: "Extract and open the unit",
        question: "Which systems sit inside a drive unit?",
        learningGoal: "Pull out the unit, then open its inverter, motor, and gearbox.",
        sceneId: "vehicle-overview",
        visualState: {
          mode: "exploded-assembly",
          primaryAction: "Extract the drive unit.",
          visibleElements: ["drive unit", "inverter", "motor", "gearbox"],
          visualChange: "The unit leaves the car and opens into three named systems.",
        },
      },
      {
        id: "isolate-the-motor",
        title: "Isolate the motor",
        question: "What remains when the rest of the drive unit falls away?",
        learningGoal: "Leave only the motor, ready to inspect one layer at a time.",
        sceneId: "pmsm-turn",
        visualState: {
          mode: "exploded-assembly",
          primaryAction: "Isolate the motor.",
          visibleElements: ["motor housing", "stator", "rotor"],
          visualChange: "Everything else fades away, leaving the motor at the centre of the stage.",
        },
        legacyAlternative: "pmsm",
      },
    ],
  },
  {
    id: "how-a-pmsm-turns",
    title: "How a PMSM turns",
    shortTitle: "The PMSM",
    learningGoal: "See how timed electrical currents become synchronous torque.",
    steps: [
      {
        id: "assemble-the-motor",
        title: "Assemble the motor",
        question: "What sits inside a permanent-magnet synchronous motor?",
        learningGoal: "Place the housing, stator, air gap, rotor, and shaft in their working order.",
        sceneId: "pmsm-turn",
        visualState: {
          mode: "exploded-assembly",
          primaryAction: "Assemble the motor.",
          visibleElements: ["housing", "stator", "air gap", "rotor", "shaft"],
          visualChange: "Parts move from an exploded arrangement into a working cross-section.",
        },
        legacyAlternative: "pmsm",
      },
      {
        id: "rotate-the-field",
        title: "Rotate the field",
        question: "How can three electrical phases create one rotating field?",
        learningGoal: "Watch three timed currents create one magnetic direction that moves around the stator.",
        sceneId: "pmsm-turn",
        visualState: {
          mode: "field-simulation",
          primaryAction: "Play the three phases.",
          visibleElements: ["phase A", "phase B", "phase C", "field vector"],
          visualChange: "Three offset currents combine into one rotating field vector.",
        },
        legacyAlternative: "pmsm",
      },
      {
        id: "hold-the-torque-angle",
        title: "Hold the torque angle",
        question: "Why does the rotor stay just behind the rotating field?",
        learningGoal: "See why the rotor follows the field at the same speed while staying slightly behind it.",
        sceneId: "pmsm-turn",
        visualState: {
          mode: "field-simulation",
          primaryAction: "Increase shaft load.",
          visibleElements: ["field vector", "rotor pole", "torque angle", "shaft"],
          visualChange: "The gap between field and rotor grows while both continue together.",
        },
        legacyAlternative: "pmsm",
      },
      {
        id: "reveal-reluctance-torque",
        title: "Reveal reluctance torque",
        question: "What extra torque comes from the rotor’s steel shape?",
        learningGoal: "Open the rotor to see how steel paths contribute torque alongside its magnets.",
        sceneId: "pmsm-turn",
        visualState: {
          mode: "material-cross-section",
          primaryAction: "Open the rotor pockets.",
          visibleElements: ["buried magnets", "steel bridges", "flux paths", "rotor"],
          visualChange: "Flux separates into magnet torque and reluctance torque paths.",
        },
        legacyAlternative: "pmsm",
      },
    ],
  },
  {
    id: "why-the-magnet-needs-nd-dy-and-tb",
    title: "Why the magnet needs Nd, Dy, and Tb",
    shortTitle: "The magnet",
    learningGoal: "Separate magnetic strength, magnetic stability, temperature, and material use.",
    steps: [
      {
        id: "two-magnetic-jobs",
        title: "Two magnetic jobs",
        question: "What makes a permanent magnet strong and hard to reverse?",
        learningGoal: "Distinguish how much field a magnet holds from how strongly it resists reversal.",
        sceneId: "magnet-material",
        visualState: {
          mode: "material-cross-section",
          primaryAction: "Compare the two properties.",
          visibleElements: ["magnet grain", "field strength", "reversal barrier", "crystal direction"],
          visualChange: "The view splits magnetic strength from resistance to reversal.",
        },
      },
      {
        id: "heat-and-opposing-fields",
        title: "Heat and opposing fields",
        question: "Why can heat and an opposing field permanently weaken a magnet?",
        learningGoal: "Watch temperature and stator force make demagnetisation a material problem.",
        sceneId: "magnet-material",
        visualState: {
          mode: "field-simulation",
          primaryAction: "Raise temperature.",
          visibleElements: ["temperature", "opposing field", "grain orientation", "reversal front"],
          visualChange: "Heat lowers the reversal barrier until an opposing field can start a flip.",
        },
      },
      {
        id: "protect-the-grain-edge",
        title: "Protect the grain edge",
        question: "Why protect a magnet grain at its edge rather than throughout?",
        learningGoal: "Use the grain boundary to explain why a small protective shell can matter.",
        sceneId: "magnet-material",
        visualState: {
          mode: "material-cross-section",
          primaryAction: "Add the protective shell.",
          visibleElements: ["grain core", "grain edge", "protective shell", "reversal seed"],
          visualChange: "A thin outer layer appears where reversal is most likely to begin.",
        },
      },
    ],
  },
  {
    id: "reduce-exposure-or-replace-the-pmsm",
    title: "Reduce exposure, or replace the PMSM",
    shortTitle: "The choices",
    learningGoal: "Compare the lowest-change ways to reduce exposure with a complete architecture swap.",
    steps: [
      {
        id: "lower-change-path",
        title: "A lower-change path",
        question: "How can heavy-rare-earth exposure fall without replacing the whole motor?",
        learningGoal: "Arrange cooling, grain-boundary diffusion, and lower-heavy-rare-earth magnets as separate options.",
        sceneId: "exposure-options",
        visualState: {
          mode: "causal-flow",
          primaryAction: "Choose a reduction route.",
          visibleElements: ["cooling", "grain boundary", "magnet", "motor"],
          visualChange: "The route shows which parts can remain in place for each intervention.",
        },
      },
      {
        id: "permanent-field-at-speed",
        title: "Permanent field at speed",
        question: "Why does a permanent magnet create a high-speed electrical constraint?",
        learningGoal: "See why a permanent field creates back-EMF and field-weakening work at high speed.",
        sceneId: "exposure-options",
        visualState: {
          mode: "field-simulation",
          primaryAction: "Increase rotor speed.",
          visibleElements: ["rotor magnet", "back-EMF", "battery voltage", "field-weakening current"],
          visualChange: "The opposing voltage grows until added current redirects flux instead of making torque.",
        },
      },
      {
        id: "motor-families",
        title: "Motor families",
        question: "Which traction motors are synchronous and which rely on slip?",
        learningGoal: "Place synchronous and asynchronous machines in one clear family map.",
        sceneId: "exposure-options",
        visualState: {
          mode: "spatial-map",
          primaryAction: "Open a motor family.",
          visibleElements: ["synchronous", "asynchronous", "rotor field", "slip"],
          visualChange: "The family tree expands from shared stator physics to distinct rotor behavior.",
        },
      },
    ],
  },
  {
    id: "alternative-motor-laboratory",
    title: "Alternative motor laboratory",
    shortTitle: "The laboratory",
    learningGoal: "Compare the mechanisms that create rotor field or torque without a conventional rare-earth rotor.",
    steps: [
      {
        id: "induction",
        title: "Induction",
        question: "How does a squirrel cage create its own rotor field?",
        learningGoal: "See a squirrel cage make its own rotor field through slip and induced current.",
        sceneId: "alternative-laboratory",
        visualState: {
          mode: "mechanism-lab",
          primaryAction: "Increase load.",
          visibleElements: ["squirrel cage", "induced current", "slip", "rotor heat"],
          visualChange: "More load increases slip and induced rotor current.",
        },
        legacyAlternative: "induction",
      },
      {
        id: "wound-field",
        title: "Wound field",
        question: "What changes when rotor magnets become controllable windings?",
        learningGoal: "Replace magnets with controlled rotor windings, excitation hardware, and rotor cooling.",
        sceneId: "alternative-laboratory",
        visualState: {
          mode: "mechanism-lab",
          primaryAction: "Adjust rotor excitation.",
          visibleElements: ["rotor winding", "excitation path", "rotor field", "cooling path"],
          visualChange: "The rotor field turns up, down, or off under electrical control.",
        },
        legacyAlternative: "wound",
      },
      {
        id: "synchronous-reluctance",
        title: "Synchronous reluctance",
        question: "How can shaped steel make torque without a rotor winding?",
        learningGoal: "Use flux barriers to show how shaped steel creates reluctance torque and inverter demand.",
        sceneId: "alternative-laboratory",
        visualState: {
          mode: "mechanism-lab",
          primaryAction: "Rotate the stator field.",
          visibleElements: ["flux barriers", "easy axis", "stator field", "inverter current"],
          visualChange: "The shaped steel turns to align its easier magnetic path with the field.",
        },
        legacyAlternative: "synrm",
      },
      {
        id: "switched-reluctance",
        title: "Switched reluctance",
        question: "How do switched stator poles pull a toothed rotor forward?",
        learningGoal: "Sequence stator poles around a toothed rotor and make torque ripple visible.",
        sceneId: "alternative-laboratory",
        visualState: {
          mode: "mechanism-lab",
          primaryAction: "Sequence the poles.",
          visibleElements: ["stator poles", "toothed rotor", "torque pulse", "sound wave"],
          visualChange: "Successive poles pull the rotor forward in visible pulses.",
        },
        legacyAlternative: "srm",
      },
    ],
  },
  {
    id: "change-the-magnet-geometry-or-both",
    title: "Change the magnet, geometry, or both",
    shortTitle: "The layers",
    learningGoal: "Keep motor architecture, magnet chemistry, and geometry as separate design choices.",
    steps: [
      {
        id: "ferrite",
        title: "Ferrite",
        question: "What must change when a motor uses a weaker permanent magnet?",
        learningGoal: "See why a weaker magnet asks for a different motor size, speed, or geometry.",
        sceneId: "magnet-geometry",
        visualState: {
          mode: "configuration-builder",
          primaryAction: "Trade material for geometry.",
          visibleElements: ["ferrite magnet", "motor diameter", "motor length", "axial flux"],
          visualChange: "The machine resizes or changes shape as the magnet changes.",
        },
      },
      {
        id: "iron-nitride",
        title: "Iron nitride",
        question: "Why is high magnetic saturation not enough on its own?",
        learningGoal: "Separate magnetic saturation from the properties that make a practical permanent magnet.",
        sceneId: "magnet-geometry",
        visualState: {
          mode: "material-cross-section",
          primaryAction: "Compare material properties.",
          visibleElements: ["magnetic strength", "reversal barrier", "thermal margin", "variable flux"],
          visualChange: "The comparison separates high magnetic output from magnetic stability.",
        },
      },
      {
        id: "stack-the-choices",
        title: "Stack the choices",
        question: "Which design choices can stack in one motor?",
        learningGoal: "Build combinations from torque principle, excitation, magnet chemistry, geometry, and winding material.",
        sceneId: "magnet-geometry",
        visualState: {
          mode: "configuration-builder",
          primaryAction: "Build a motor stack.",
          visibleElements: ["torque principle", "excitation", "magnet chemistry", "geometry", "windings"],
          visualChange: "Selected layers combine into one named motor configuration.",
        },
      },
    ],
  },
  {
    id: "what-the-vehicle-must-change",
    title: "What the vehicle must change",
    shortTitle: "The vehicle",
    learningGoal: "Make the boundary between a motor swap and a vehicle redesign visible.",
    steps: [
      {
        id: "what-stays",
        title: "What stays",
        question: "What survives a motor change elsewhere in the vehicle?",
        learningGoal: "Keep vehicle structure, cabin, battery, and suspension distinct from the drive unit.",
        sceneId: "vehicle-change",
        visualState: {
          mode: "swap-impact-map",
          primaryAction: "Reveal vehicle boundaries.",
          visibleElements: ["body", "cabin", "battery", "suspension", "drive unit"],
          visualChange: "The whole vehicle fades while the drive unit remains active.",
        },
      },
      {
        id: "drive-unit-changes",
        title: "What the drive unit must change",
        question: "Which drive-unit systems must change for each motor route?",
        learningGoal: "Highlight the inverter, cooling route, package, controls, and safety work that can change.",
        sceneId: "vehicle-change",
        visualState: {
          mode: "swap-impact-map",
          primaryAction: "Select a motor route.",
          visibleElements: ["inverter", "cooling", "package", "controls", "safety case"],
          visualChange: "Changed systems illuminate according to the selected motor route.",
        },
      },
      {
        id: "validation",
        title: "Validation",
        question: "Why does a changed drive unit need a full validation programme?",
        learningGoal: "Place integration and validation on the path from a motor concept to a production vehicle.",
        sceneId: "vehicle-change",
        visualState: {
          mode: "causal-flow",
          primaryAction: "Advance the programme.",
          visibleElements: ["design", "integration", "calibration", "validation", "vehicle"],
          visualChange: "The drive-unit change expands into a visible validation sequence.",
        },
      },
    ],
  },
  {
    id: "what-is-real-and-indias-opening",
    title: "What is real and India’s opening",
    shortTitle: "The evidence",
    learningGoal: "Separate markets, maturity, and capability so the strategic picture remains honest.",
    steps: [
      {
        id: "two-markets",
        title: "Two different markets",
        question: "Why should EV traction and industrial motors not be treated as one market?",
        learningGoal: "Keep EV traction and industrial motors separate because their incumbents and motives differ.",
        sceneId: "market-evidence",
        visualState: {
          mode: "evidence-lanes",
          primaryAction: "Switch market lane.",
          visibleElements: ["EV traction", "industrial motors", "incumbent", "motivation"],
          visualChange: "The selected lane retains its own baseline and decision context.",
        },
      },
      {
        id: "evidence-lanes",
        title: "Evidence lanes",
        question: "How should production, pilot, prototype, and scale-up evidence be separated?",
        learningGoal: "Read production, pilot, prototype, and material scale-up as different kinds of evidence.",
        sceneId: "market-evidence",
        visualState: {
          mode: "evidence-lanes",
          primaryAction: "Filter by evidence stage.",
          visibleElements: ["production", "pilot", "prototype", "scale-up"],
          visualChange: "Technology examples settle into evidence lanes rather than a single ranking.",
        },
      },
      {
        id: "capability-stack",
        title: "Capability stack",
        question: "Which capabilities connect a material idea to a manufactured motor?",
        learningGoal: "Connect materials, laminations, windings, electronics, controls, cooling, testing, and manufacturing.",
        sceneId: "market-evidence",
        visualState: {
          mode: "spatial-map",
          primaryAction: "Trace a capability path.",
          visibleElements: ["materials", "laminations", "windings", "electronics", "testing", "manufacturing"],
          visualChange: "A selected capability connects to the adjacent work needed to make a motor.",
        },
      },
    ],
  },
] as const;

export const getChapter = (chapterId: ChapterId) =>
  CHAPTERS.find((chapter) => chapter.id === chapterId);

export const getScene = (sceneId: SceneId) => SCENE_REGISTRY[sceneId];

/**
 * The narrative is not allowed to grow prose-only screens. Every step must name
 * the visual mechanism that teaches it and the state change a learner can cause.
 */
const visualStateErrors = (visualState: VisualState | undefined) => [
  !visualState?.mode && "visual mode",
  !visualState?.primaryAction && "primary action",
  !visualState?.visualChange && "visual change",
  !visualState?.visibleElements?.length && "visible elements",
].filter(Boolean);

export const validateVisualContract = () => {
  const errors = CHAPTERS.flatMap((chapter) =>
    chapter.steps.flatMap((step) => {
      const missing = [
        !SCENE_REGISTRY[step.sceneId] && "scene",
        !step.question && "question",
        ...visualStateErrors(step.visualState),
      ].filter(Boolean);

      const layerErrors = (step.supportingLayers ?? []).flatMap((layer) => {
        const layerMissing = [
          !layer.id && "layer id",
          !layer.title && "layer title",
          !layer.content && "layer content",
          ...visualStateErrors(layer.visualState),
        ].filter(Boolean);

        return layerMissing.length
          ? [`${chapter.id}/${step.id}/${layer.kind}: ${layerMissing.join(", ")}`]
          : [];
      });

      return missing.length
        ? [`${chapter.id}/${step.id}: ${missing.join(", ")}`, ...layerErrors]
        : layerErrors;
    }),
  );

  if (errors.length) {
    throw new Error(`Visual contract failed:\n${errors.join("\n")}`);
  }
};

validateVisualContract();
