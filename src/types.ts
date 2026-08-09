export type AlternativeKey = "pmsm" | "wound" | "induction" | "synrm" | "srm";

export type StorySignal = {
  progress: number;
  activeChapter: number;
  reducedMotion: boolean;
  fieldPaused: boolean;
  load: number;
  alternative: AlternativeKey;
};

export type ChapterId =
  | "where-the-motor-lives"
  | "how-a-pmsm-turns"
  | "why-the-magnet-needs-nd-dy-and-tb"
  | "reduce-exposure-or-replace-the-pmsm"
  | "alternative-motor-laboratory"
  | "change-the-magnet-geometry-or-both"
  | "what-the-vehicle-must-change"
  | "what-is-real-and-indias-opening";

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

export type ChapterStep = {
  id: string;
  title: string;
  question: string;
  learningGoal: string;
  sceneId: SceneId;
  visualState: VisualState;
  supportingLayers?: readonly SupportingLayer[];
  legacyAlternative?: AlternativeKey;
};

export type Chapter = {
  id: ChapterId;
  title: string;
  shortTitle: string;
  learningGoal: string;
  steps: readonly ChapterStep[];
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
