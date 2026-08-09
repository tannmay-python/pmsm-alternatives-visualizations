/**
 * Framework-neutral editorial contracts for the PMSM visualisation.
 *
 * Keep the axes separate. A ferrite rotor is still a permanent-magnet motor;
 * axial flux is a geometry, not a magnet chemistry; and the EV-traction and
 * industrial-drive markets have different incumbents and reasons to change.
 */

export const torquePrinciples = [
  "permanent-magnet",
  "wound-field",
  "induction",
  "synchronous-reluctance",
  "switched-reluctance",
] as const;

export type TorquePrinciple = (typeof torquePrinciples)[number];

export const excitationMethods = [
  "permanent",
  /** Externally powered rotor field where the public source does not establish the transfer hardware. */
  "externally-excited",
  "brushed",
  "contactless",
  "induced",
  "none",
] as const;

export type ExcitationMethod = (typeof excitationMethods)[number];

export const magnetChemistries = [
  "ndfeb",
  "reduced-hree-ndfeb",
  "hree-free-ndfeb",
  "ferrite",
  "iron-nitride",
  "smco",
  "none",
] as const;

export type MagnetChemistry = (typeof magnetChemistries)[number];

export const fluxGeometries = ["radial", "axial"] as const;
export type FluxGeometry = (typeof fluxGeometries)[number];

export const windingMaterials = ["copper", "aluminium", "none"] as const;
export type WindingMaterial = (typeof windingMaterials)[number];

export const markets = [
  "ev-traction",
  "light-mobility",
  "industrial-drive",
  "appliance",
  "materials-scale-up",
] as const;
export type Market = (typeof markets)[number];

export const maturities = [
  "volume-production",
  "production-vehicle",
  "industrial-product",
  "vehicle-pilot",
  "announced-development",
  "prototype",
  "materials-scale-up",
  "research",
] as const;
export type Maturity = (typeof maturities)[number];

export const sourceTypes = [
  "due-diligence",
  "primary",
  "company-claim",
  "teaching-model",
  "secondary",
] as const;
export type SourceType = (typeof sourceTypes)[number];

export const evidenceQualifiers = [
  "peak",
  "continuous",
  "target",
  "prototype",
  "tested",
  "simulated",
  "reported",
] as const;
export type EvidenceQualifier = (typeof evidenceQualifiers)[number];

export const evidenceStatuses = [
  "verified",
  "qualified",
  "unverified",
  "contradicted",
] as const;
export type EvidenceStatus = (typeof evidenceStatuses)[number];

/** Release rule derived from the evidence audit. */
export type RenderingPolicy = "show" | "show-with-condition" | "hide";

export type QuantitativeValue = {
  label: string;
  value: number | readonly [number, number];
  unit: string;
  /** The exact population or operating condition to which the number applies. */
  denominator: string;
};

export type EvidenceSource = {
  id: string;
  title: string;
  organisation: string;
  sourceType: SourceType;
  /** Publication date or the date on which the supplied note was made. */
  date: string;
  url?: string;
  note?: string;
};

/** A compact, app-local release gate distilled from the evidence audit. */
export type EvidenceAuditRecord = {
  id: string;
  status: EvidenceStatus;
  numbersMayBeShown: boolean;
  visualRule: string;
};

export type Claim = {
  id: string;
  statement: string;
  sourceIds: readonly string[];
  sourceType: SourceType;
  evidenceStatus: EvidenceStatus;
  renderingPolicy: RenderingPolicy;
  /** ID of the launch-gate record reproduced in `evidenceAudit.ts`, if audited. */
  evidenceRecordId?: string;
  date: string;
  market: Market;
  maturity?: Maturity;
  qualifier?: EvidenceQualifier;
  denominator?: string;
  quantitative?: QuantitativeValue;
  caveat?: string;
  /** A concise record of a disagreement with the original report or another source. */
  conflict?: string;
  /** True means the UI must show this as a claim awaiting primary-source confirmation. */
  needsVerification: boolean;
};

export type CopyLayers = {
  /** On-stage copy: short enough to coexist with the visual. */
  glance: string;
  /** Expandable, mechanism-first explanation. */
  why: string;
  /** What the reader should be told about the supporting evidence and caveats. */
  evidence: string;
};

/** Every teaching point must have a visible, manipulable consequence. */
export const visualDevices = [
  "exploded-model",
  "transparent-cutaway",
  "animated-field",
  "animated-flow",
  "microscopic-cutaway",
  "before-after-comparison",
  "parameter-slider",
  "rotor-morph",
  "force-vector-overlay",
  "thermal-map",
  "configuration-builder",
  "vehicle-impact-map",
  "matrix",
  "timeline",
  "evidence-lane",
  "capability-stack",
] as const;
export type VisualDevice = (typeof visualDevices)[number];

export type VisualTeaching = {
  device: VisualDevice;
  /** The object or state which visibly changes when the reader acts. */
  visibleConsequence: string;
  /** A concrete reader action: not simply “read more”. */
  interaction: string;
  /** A non-animated but still visual representation for reduced motion/WebGL fallback. */
  fallback: string;
};

/** How much of the research belongs in a beginner's first pass. */
export const contentPlacements = [
  "main",
  "optional-deep-dive",
  "evidence-only",
  "omit",
] as const;
export type ContentPlacement = (typeof contentPlacements)[number];

export type VisualControl = {
  id: string;
  label: string;
  kind: "next" | "back" | "play" | "scrub" | "toggle" | "slider" | "select" | "hotspot";
  consequence: string;
};

export type ChapterStep = {
  id: string;
  title: string;
  /** Exactly one concise question shown in the persistent right-hand learning panel. */
  learnerQuestion: string;
  /** Main steps are the short beginner route. Optional steps are reader-invoked labs. */
  placement: Extract<ContentPlacement, "main" | "optional-deep-dive">;
  learningGoal: string;
  visual: VisualTeaching;
  controls: readonly VisualControl[];
  claimIds: readonly string[];
  copy: CopyLayers;
  reducedMotionState: string;
};

/** A stable bridge between the editorial curriculum and the story router. */
export const chapterIds = [
  "where-the-motor-lives",
  "how-a-pmsm-turns",
  "why-the-magnet-needs-nd-dy-tb",
  "reduce-exposure-or-replace-pmsm",
  "alternative-motor-laboratory",
  "change-the-magnet-or-geometry",
  "what-the-vehicle-must-change",
  "what-is-real-and-indias-opening",
] as const;

export type ContentChapterId = (typeof chapterIds)[number];

export type ChapterManifest = {
  id: ContentChapterId;
  number: number;
  title: string;
  premise: string;
  steps: readonly ChapterStep[];
};

export type MotorConfiguration = {
  id: string;
  label: string;
  torquePrinciple: TorquePrinciple;
  excitation: ExcitationMethod;
  magnetChemistry: MagnetChemistry;
  geometry: FluxGeometry;
  windingMaterial: WindingMaterial;
  market: Market;
  maturity: Maturity;
  claimIds: readonly string[];
  notes: string;
};

export type PerformanceRecord = {
  id: string;
  subject: string;
  market: Market;
  maturity: Maturity;
  sourceIds: readonly string[];
  sourceType: SourceType;
  date: string;
  qualifier: EvidenceQualifier;
  requiresContinuousPair: boolean;
  peak?: QuantitativeValue;
  continuous?: QuantitativeValue;
  speed?: QuantitativeValue;
  caveat?: string;
  needsVerification: boolean;
};

export type CompanyExample = {
  id: string;
  organisation: string;
  product?: string;
  configurationId?: string;
  market: Market;
  maturity: Maturity;
  claimIds: readonly string[];
  performanceIds?: readonly string[];
  correction?: string;
  needsVerification: boolean;
};

export type CoverageTopic = {
  id: string;
  label: string;
  dueDiligencePoint: string;
  placement: ContentPlacement;
  /** Main/optional items teach through this visual. Evidence-only/omitted items may not. */
  visual?: VisualTeaching;
  stepIds: readonly string[];
  claimIds: readonly string[];
  reason: string;
};

export type ContentModel = {
  sources: readonly EvidenceSource[];
  audit: readonly EvidenceAuditRecord[];
  claims: readonly Claim[];
  configurations: readonly MotorConfiguration[];
  performance: readonly PerformanceRecord[];
  examples: readonly CompanyExample[];
  chapters: readonly ChapterManifest[];
  coverage: readonly CoverageTopic[];
  /** Master editorial checklist. Validation fails if any mandated topic disappears. */
  requiredCoverageTopicIds: readonly string[];
};
