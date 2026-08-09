export type AlternativeKey = "pmsm" | "wound" | "induction" | "synrm" | "srm";

export type StorySignal = {
  progress: number;
  activeChapter: number;
  reducedMotion: boolean;
  fieldPaused: boolean;
  load: number;
  alternative: AlternativeKey;
};

/**
 * The content schema owns chapter identifiers. Keeping the route type derived
 * from it prevents the visual shell drifting from the editorial curriculum.
 */
export type ChapterId = import("./content/schema").ContentChapterId;

export type SceneId =
  | "vehicle-overview"
  | "pmsm-turn"
  | "magnet-material"
  | "exposure-options"
  | "alternative-laboratory"
  | "magnet-geometry"
  | "vehicle-change"
  | "market-evidence";

export type VisualMotif =
  | "vehicle"
  | "motor"
  | "grain"
  | "flux"
  | "rotors"
  | "materials"
  | "vehicle-change"
  | "evidence";

export type VisualMode =
  | "spatial-map"
  | "exploded-assembly"
  | "field-simulation"
  | "material-cross-section"
  | "causal-flow"
  | "mechanism-lab"
  | "configuration-builder"
  | "swap-impact-map"
  | "evidence-lanes";

export type VisualState = {
  mode: VisualMode;
  primaryAction: string;
  visibleElements: readonly string[];
  visualChange: string;
};

/**
 * Supporting material stays outside the one-idea main path. It can still
 * request a visual treatment when opened, rather than becoming a prose-only
 * appendix.
 */
export type SupportingLayer = {
  id: string;
  kind: "deep" | "evidence";
  title: string;
  content: string;
  visualState: VisualState;
};

export type SceneDefinition = {
  id: SceneId;
  motif: VisualMotif;
  legacyProgress: number;
  accessibilityLabel: string;
  visualDirection: string;
  asset?: {
    src: string;
    alt: string;
    reducedMotionSrc?: string;
  };
};

/**
 * Runtime-only scene binding. Editorial copy and evidence remain in
 * `src/content`; the renderer only adds the stable visual context it needs.
 */
export type StoryStep = {
  id: string;
  content: import("./content/schema").ChapterStep;
  sceneId: SceneId;
  visualState: VisualState;
  legacyAlternative?: AlternativeKey;
};

export type StoryChapter = {
  id: ChapterId;
  content: import("./content/schema").ChapterManifest;
  steps: readonly StoryStep[];
};

export type StoryPosition = {
  chapterId: ChapterId;
  stepId: string;
};

export type StoryState = {
  position: StoryPosition;
  stagePaused: boolean;
  systemReducedMotion: boolean;
  motionOverride: boolean | null;
};

export type StoryAction =
  | { type: "go-to"; position: StoryPosition }
  | { type: "go-to-chapter"; chapterId: ChapterId }
  | { type: "next" }
  | { type: "previous" }
  | { type: "toggle-stage-paused" }
  | { type: "set-system-reduced-motion"; reduced: boolean }
  | { type: "toggle-motion-override" };
