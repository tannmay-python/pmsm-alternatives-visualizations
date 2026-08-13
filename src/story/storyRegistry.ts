import { pmsmContent } from "../content/index";
import type { ChapterManifest, ChapterStep, VisualDevice } from "../content/schema";
import type {
  AlternativeKey,
  ChapterId,
  SceneDefinition,
  SceneId,
  StoryChapter,
  StoryStep,
  VisualMode,
  VisualMotif,
  VisualState,
} from "../types";

/**
 * This is deliberately a thin rendering adapter, not a second curriculum.
 * `pmsmContent` owns all learner copy, evidence references and interactions.
 * The stage owns only stable scene identity and the visual-mode vocabulary it
 * needs for its SVG/WebGL fallbacks.
 */
const sceneByChapter: Readonly<Record<ChapterId, SceneId>> = {
  "where-the-motor-lives": "vehicle-overview",
  "how-a-pmsm-turns": "pmsm-turn",
  "why-the-magnet-needs-nd-dy-tb": "magnet-material",
  "reduce-exposure-or-replace-pmsm": "exposure-options",
  "alternative-motor-laboratory": "alternative-laboratory",
  "change-the-magnet-or-geometry": "magnet-geometry",
  "what-the-vehicle-must-change": "vehicle-change",
  "what-is-real-and-indias-opening": "market-evidence",
};

const modeByDevice: Readonly<Record<VisualDevice, VisualMode>> = {
  "exploded-model": "exploded-assembly",
  "transparent-cutaway": "spatial-map",
  "animated-field": "field-simulation",
  "animated-flow": "causal-flow",
  "microscopic-cutaway": "material-cross-section",
  "before-after-comparison": "mechanism-lab",
  "parameter-slider": "field-simulation",
  "rotor-morph": "mechanism-lab",
  "force-vector-overlay": "field-simulation",
  "thermal-map": "material-cross-section",
  "configuration-builder": "configuration-builder",
  "vehicle-impact-map": "swap-impact-map",
  matrix: "evidence-lanes",
  timeline: "evidence-lanes",
  "evidence-lane": "evidence-lanes",
  "capability-stack": "spatial-map",
};

const motifByScene: Readonly<Record<SceneId, VisualMotif>> = {
  "vehicle-overview": "vehicle",
  "pmsm-turn": "motor",
  "magnet-material": "grain",
  "exposure-options": "flux",
  "alternative-laboratory": "rotors",
  "magnet-geometry": "materials",
  "vehicle-change": "vehicle-change",
  "market-evidence": "evidence",
};

const legacyProgressByScene: Readonly<Record<SceneId, number>> = {
  "vehicle-overview": 0,
  "pmsm-turn": 3,
  "magnet-material": 4,
  "exposure-options": 4,
  "alternative-laboratory": 5,
  "magnet-geometry": 4,
  "vehicle-change": 1,
  "market-evidence": 5,
};

const accessibilityByScene: Readonly<Record<SceneId, string>> = {
  "vehicle-overview": "A simplified electric vehicle and its axle drive unit.",
  "pmsm-turn": "A motor cross-section with stator coils and a rotor.",
  "magnet-material": "Magnet grains and material-property layers.",
  "exposure-options": "A magnetic flux path and the choices that alter it.",
  "alternative-laboratory": "Contrasting rotor mechanisms arranged for comparison.",
  "magnet-geometry": "Separate motor architecture, magnet-chemistry and geometry layers.",
  "vehicle-change": "A vehicle showing the boundary between common vehicle systems and the drive unit.",
  "market-evidence": "Separate market and evidence lanes for motor alternatives.",
};

const directionByScene: Readonly<Record<SceneId, string>> = {
  "vehicle-overview": "Car location, energy path, extracted drive unit and isolated motor.",
  "pmsm-turn": "Stator, rotating field, torque angle and IPM rotor close-up.",
  "magnet-material": "Magnetic strength, resistance to reversal, thermal stress and grain-boundary diffusion.",
  "exposure-options": "Supply exposure, back-EMF, field weakening and motor-family decisions.",
  "alternative-laboratory": "Induction, wound-field and reluctance mechanisms.",
  "magnet-geometry": "Ferrite, iron nitride, axial flux and stackable motor choices.",
  "vehicle-change": "Drive-unit changes, common vehicle systems and validation work.",
  "market-evidence": "EV and industrial markets, evidence lanes and capability relationships.",
};

export const SCENE_REGISTRY: Readonly<Record<SceneId, SceneDefinition>> = Object.fromEntries(
  (Object.keys(motifByScene) as SceneId[]).map((id) => [
    id,
    {
      id,
      motif: motifByScene[id],
      legacyProgress: legacyProgressByScene[id],
      accessibilityLabel: accessibilityByScene[id],
      visualDirection: directionByScene[id],
    },
  ]),
) as Readonly<Record<SceneId, SceneDefinition>>;

const alternativeByStep: Readonly<Record<string, AlternativeKey>> = {
  "pmsm-assemble-stator": "pmsm",
  "pmsm-three-phase-field": "pmsm",
  "pmsm-rotor-lock": "pmsm",
  "ipm-rotor-cutaway": "pmsm",
  "ipm-reluctance-overlay": "pmsm",
  "induction-cage-lab": "induction",
  "induction-slip-heat-coast": "induction",
  "induction-mixed-axle": "induction",
  "wound-field-lab": "wound",
  "brushed-contactless-status": "wound",
  "pure-synrm-lab": "synrm",
  "pm-assisted-synrm-lab": "synrm",
  "srm-aem-lab": "srm",
};

const sceneState = (step: ChapterStep): VisualState => ({
  mode: modeByDevice[step.visual.device],
  primaryAction: step.visual.interaction,
  // The control labels are concise stage annotations, while the editorial
  // visual contract remains the detailed source for what visibly changes.
  visibleElements: step.controls
    .filter((control) => control.kind !== "next" && control.kind !== "back")
    .map((control) => control.label)
    .slice(0, 4),
  visualChange: step.visual.visibleConsequence,
});

const asChapterId = (id: string): ChapterId => {
  if (!(id in sceneByChapter)) {
    throw new Error(`No scene binding exists for content chapter: ${id}`);
  }
  return id as ChapterId;
};

const bindStep = (sourceChapterId: ChapterId, step: ChapterStep): StoryStep => ({
  id: step.id,
  content: step,
  // A beginner-facing group may gather steps from several source manifests.
  // Keep the visual context owned by the source manifest, not by its new place
  // in the condensed route.
  sceneId: sceneByChapter[sourceChapterId],
  visualState: sceneState(step),
  legacyAlternative: alternativeByStep[step.id],
});

type BeginnerChapterSpec = {
  id: ChapterId;
  title: string;
  stepIds: readonly string[];
};

const beginnerCurriculum: readonly BeginnerChapterSpec[] = [
  {
    id: "where-the-motor-lives",
    title: "Find the motor",
    stepIds: [
      "car-transparent-cutaway",
      "power-path-flow",
      "drive-unit-extract",
      "motor-isolation",
    ],
  },
  {
    id: "how-a-pmsm-turns",
    title: "How it turns—and why rare earths matter",
    stepIds: [
      "pmsm-three-phase-field",
      "pmsm-rotor-lock",
      "remanence-strength",
      "heat-demagnetisation",
      "dy-tb-tradeoff",
    ],
  },
  {
    id: "reduce-exposure-or-replace-pmsm",
    title: "Use less before replacing it",
    stepIds: [
      "light-and-heavy-ree-supply",
      "mitigation-ladder",
      "back-emf-speed-sweep",
    ],
  },
  {
    id: "alternative-motor-laboratory",
    title: "Meet the alternatives",
    stepIds: [
      "induction-cage-lab",
      "wound-field-lab",
      "pure-synrm-lab",
      "stackable-motor-builder",
    ],
  },
  {
    id: "what-is-real-and-indias-opening",
    title: "Choose what is realistic",
    stepIds: [
      "vehicle-survivors-and-changes",
      "india-capability-stack",
      "final-decision-map",
    ],
  },
];

type SourcedStep = {
  sourceChapter: ChapterManifest;
  step: ChapterStep;
};

const sourceStepById = new Map<string, SourcedStep>(
  pmsmContent.chapters.flatMap((sourceChapter) =>
    sourceChapter.steps.map((step) => [step.id, { sourceChapter, step }] as const),
  ),
);

const sourceStep = (stepId: string): SourcedStep => {
  const result = sourceStepById.get(stepId);
  if (!result) throw new Error(`No source content step exists for curriculum step: ${stepId}`);
  return result;
};

const bindBeginnerChapter = (spec: BeginnerChapterSpec, index: number): StoryChapter => {
  const anchor = pmsmContent.chapters.find((chapter) => chapter.id === spec.id);
  if (!anchor) throw new Error(`No source chapter exists for curriculum group: ${spec.id}`);

  const sourcedSteps = spec.stepIds.map(sourceStep);
  const id = asChapterId(spec.id);

  return {
    id,
    // The source manifest remains unchanged; this small composite record is
    // only the title and ordered step list presented by the beginner route.
    content: {
      ...anchor,
      number: index + 1,
      title: spec.title,
      steps: sourcedSteps.map(({ step }) => step),
    },
    steps: sourcedSteps.map(({ sourceChapter, step }) => bindStep(asChapterId(sourceChapter.id), step)),
  };
};

/** Five concise, click-first groups built from the complete source curriculum. */
export const CHAPTERS: readonly StoryChapter[] = beginnerCurriculum.map(bindBeginnerChapter);

const allBoundSteps: ReadonlyMap<string, StoryStep> = new Map(
  pmsmContent.chapters.flatMap((ch) =>
    ch.steps.map((step) => [step.id, bindStep(asChapterId(ch.id), step)])
  )
);

export const getStepById = (stepId: string): StoryStep | undefined => allBoundSteps.get(stepId);

export const getChapter = (chapterId: ChapterId) =>
  CHAPTERS.find((chapter) => chapter.id === chapterId);

export const getScene = (sceneId: SceneId) => SCENE_REGISTRY[sceneId];

export const validateStoryRegistry = () => {
  const errors: string[] = [];
  const mainSteps = CHAPTERS.flatMap((chapter) => chapter.steps);
  const allSteps = pmsmContent.chapters.flatMap((chapter) => chapter.steps);

  if (CHAPTERS.length !== 5) errors.push("The default story must expose exactly five beginner chapters.");
  if (mainSteps.length !== 19) errors.push("The default story must expose exactly nineteen main steps.");
  if (CHAPTERS.some((chapter) => chapter.steps.length === 0)) {
    errors.push("Every chapter needs at least one main-path step.");
  }
  if (mainSteps.some((step) => step.content.placement !== "main")) {
    errors.push("The default story may not expose optional or evidence-only steps.");
  }
  if (mainSteps.length >= allSteps.length) {
    errors.push("Optional deep-dive steps must remain available outside the default route.");
  }

  const chapterOne = CHAPTERS[0]?.steps.map((step) => step.id);
  const expectedChapterOne = [
    "car-transparent-cutaway",
    "power-path-flow",
    "drive-unit-extract",
    "motor-isolation",
  ];
  if (JSON.stringify(chapterOne) !== JSON.stringify(expectedChapterOne)) {
    errors.push("Chapter 1 must stay car → power path → drive unit → isolated motor.");
  }

  for (const [index, spec] of beginnerCurriculum.entries()) {
    const chapter = CHAPTERS[index];
    if (!chapter || chapter.id !== spec.id || chapter.content.title !== spec.title) {
      errors.push(`Curriculum chapter ${index + 1} must keep its specified id and title.`);
      continue;
    }
    if (JSON.stringify(chapter.steps.map((step) => step.id)) !== JSON.stringify(spec.stepIds)) {
      errors.push(`${spec.title}: steps must stay in the specified beginner order.`);
    }
  }

  for (const step of mainSteps) {
    const source = sourceStep(step.id);
    if (step.content !== source.step) {
      errors.push(`${step.id}: the route must retain its original source step object.`);
    }
    if (step.sceneId !== sceneByChapter[asChapterId(source.sourceChapter.id)]) {
      errors.push(`${step.id}: the route must retain its source chapter scene id.`);
    }
  }

  for (const step of mainSteps) {
    const missing = [
      !step.content.visual.device && "visual device",
      !step.visualState.mode && "visual mode",
      !step.visualState.primaryAction && "interaction",
      !step.visualState.visualChange && "visible consequence",
      !step.content.visual.fallback && "fallback",
      !step.content.reducedMotionState && "reduced-motion state",
    ].filter(Boolean);
    if (missing.length) errors.push(`${step.id}: missing ${missing.join(", ")}`);
  }

  if (errors.length) throw new Error(`Story registry failed:\n${errors.join("\n")}`);
};

validateStoryRegistry();
