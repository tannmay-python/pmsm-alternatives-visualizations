import {
  evidenceStatuses,
  contentPlacements,
  excitationMethods,
  fluxGeometries,
  magnetChemistries,
  markets,
  maturities,
  sourceTypes,
  torquePrinciples,
  visualDevices,
  windingMaterials,
  type ContentModel,
  type MotorConfiguration,
} from "./schema.ts";

export type ValidationIssue = {
  code:
    | "duplicate-id"
    | "missing-reference"
    | "missing-provenance"
    | "unsafe-rendering-policy"
    | "peak-without-continuous"
    | "layer-conflation"
    | "missing-copy-layer"
    | "invalid-glance-copy"
    | "missing-learner-question"
    | "prose-only-coverage"
    | "invalid-visual-device"
    | "missing-interaction"
    | "missing-fallback"
    | "missing-coverage";
  path: string;
  message: string;
};

const asSet = (values: readonly string[]) => new Set(values);

const known = {
  torquePrinciples: asSet(torquePrinciples),
  excitationMethods: asSet(excitationMethods),
  magnetChemistries: asSet(magnetChemistries),
  fluxGeometries: asSet(fluxGeometries),
  windingMaterials: asSet(windingMaterials),
  markets: asSet(markets),
  maturities: asSet(maturities),
  sourceTypes: asSet(sourceTypes),
  evidenceStatuses: asSet(evidenceStatuses),
  contentPlacements: asSet(contentPlacements),
  visualDevices: asSet(visualDevices),
};

const sentenceCount = (copy: string) =>
  copy
    .trim()
    .split(/[.!?]+(?:\s|$)/)
    .filter((sentence) => sentence.trim().length > 0).length;

const pushIf = (
  issues: ValidationIssue[],
  condition: boolean,
  code: ValidationIssue["code"],
  path: string,
  message: string,
) => {
  if (condition) issues.push({ code, path, message });
};

const validateConfiguration = (
  configuration: MotorConfiguration,
  path: string,
  issues: ValidationIssue[],
) => {
  pushIf(issues, !known.torquePrinciples.has(configuration.torquePrinciple), "layer-conflation", path, "Torque principle must be one of the architecture axis values; magnet chemistry is not an architecture.");
  pushIf(issues, !known.excitationMethods.has(configuration.excitation), "layer-conflation", path, "Excitation must be a dedicated excitation value.");
  pushIf(issues, !known.magnetChemistries.has(configuration.magnetChemistry), "layer-conflation", path, "Magnet chemistry must remain on the chemistry axis.");
  pushIf(issues, !known.fluxGeometries.has(configuration.geometry), "layer-conflation", path, "Geometry must remain radial or axial, not a motor-family label.");
  pushIf(issues, !known.windingMaterials.has(configuration.windingMaterial), "layer-conflation", path, "Winding material must be copper, aluminium or none.");

  const invalidInduction =
    configuration.torquePrinciple === "induction" &&
    (configuration.excitation !== "induced" || configuration.magnetChemistry !== "none");
  const invalidWound =
    configuration.torquePrinciple === "wound-field" &&
    (configuration.magnetChemistry !== "none" ||
      !["externally-excited", "brushed", "contactless"].includes(configuration.excitation));
  const invalidSr =
    configuration.torquePrinciple === "switched-reluctance" &&
    (configuration.magnetChemistry !== "none" || configuration.excitation !== "none");
  const invalidPm =
    configuration.torquePrinciple === "permanent-magnet" && configuration.excitation !== "permanent";

  pushIf(issues, invalidInduction || invalidWound || invalidSr || invalidPm, "layer-conflation", path, "Rotor-field architecture conflicts with its declared excitation or magnet chemistry.");
};

/**
 * Validation is deliberately content-domain aware. This protects the visual
 * from common report mistakes before any component receives the records.
 */
export const validateContent = (content: ContentModel): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const sourceIds = new Set<string>();
  const auditIds = new Set<string>();
  const claimIds = new Set<string>();
  const configurationIds = new Set<string>();
  const performanceIds = new Set<string>();
  const stepIds = new Set<string>();
  const mainStepIds = new Set<string>();

  for (const source of content.sources) {
    pushIf(issues, sourceIds.has(source.id), "duplicate-id", `sources.${source.id}`, "Duplicate source ID.");
    sourceIds.add(source.id);
  }

  for (const record of content.audit) {
    pushIf(issues, auditIds.has(record.id), "duplicate-id", `audit.${record.id}`, "Duplicate audit record ID.");
    auditIds.add(record.id);
    pushIf(issues, !known.evidenceStatuses.has(record.status), "missing-provenance", `audit.${record.id}`, "Audit record has an unknown evidence status.");
    pushIf(issues, !record.visualRule, "missing-provenance", `audit.${record.id}`, "Audit record needs a visual rendering rule.");
  }

  for (const claim of content.claims) {
    const path = `claims.${claim.id}`;
    pushIf(issues, claimIds.has(claim.id), "duplicate-id", path, "Duplicate claim ID.");
    claimIds.add(claim.id);
    pushIf(issues, !known.sourceTypes.has(claim.sourceType), "missing-provenance", path, "Claim has an unknown source type.");
    pushIf(issues, !known.evidenceStatuses.has(claim.evidenceStatus), "missing-provenance", path, "Claim has an unknown evidence status.");
    pushIf(issues, !known.markets.has(claim.market), "missing-provenance", path, "Claim has no recognised market scope.");
    pushIf(issues, !claim.date || !claim.denominator, "missing-provenance", path, "Claim needs a date and denominator/scope.");
    if (claim.evidenceRecordId) {
      const audit = content.audit.find((record) => record.id === claim.evidenceRecordId);
      pushIf(issues, !audit, "missing-reference", path, `Claim references missing audit record: ${claim.evidenceRecordId}.`);
      pushIf(issues, Boolean(audit && audit.status !== claim.evidenceStatus), "missing-provenance", path, "Claim evidence status must match its audit record.");
      pushIf(issues, Boolean(audit && !audit.numbersMayBeShown && claim.quantitative && claim.renderingPolicy !== "hide"), "unsafe-rendering-policy", path, "Audit forbids numeric rendering for this claim.");
    }
    pushIf(issues, claim.sourceIds.length === 0, "missing-provenance", path, "Claim has no sources.");
    for (const sourceId of claim.sourceIds) {
      pushIf(issues, !sourceIds.has(sourceId), "missing-reference", path, `Claim references missing source: ${sourceId}.`);
    }
    pushIf(
      issues,
      (claim.evidenceStatus === "unverified" || claim.evidenceStatus === "contradicted") && claim.renderingPolicy !== "hide",
      "unsafe-rendering-policy",
      path,
      "Unverified or contradicted claims must be hidden from public factual rendering.",
    );
    if (claim.quantitative) {
      const hasPublicSource = claim.sourceType === "teaching-model" || claim.sourceIds.some((id) => content.sources.find((source) => source.id === id)?.url);
      pushIf(
        issues,
        !claim.qualifier || !claim.quantitative.denominator || !hasPublicSource,
        "missing-provenance",
        path,
        "Quantitative claims require qualifier, denominator and a public source (unless explicitly a teaching model).",
      );
    }
  }

  for (const configuration of content.configurations) {
    const path = `configurations.${configuration.id}`;
    pushIf(issues, configurationIds.has(configuration.id), "duplicate-id", path, "Duplicate configuration ID.");
    configurationIds.add(configuration.id);
    validateConfiguration(configuration, path, issues);
    for (const claimId of configuration.claimIds) {
      pushIf(issues, !claimIds.has(claimId), "missing-reference", path, `Configuration references missing claim: ${claimId}.`);
    }
  }

  for (const record of content.performance) {
    const path = `performance.${record.id}`;
    pushIf(issues, performanceIds.has(record.id), "duplicate-id", path, "Duplicate performance record ID.");
    performanceIds.add(record.id);
    pushIf(issues, !record.date || !record.qualifier || record.sourceIds.length === 0, "missing-provenance", path, "Performance record lacks date, qualifier or source.");
    for (const sourceId of record.sourceIds) {
      const source = content.sources.find((candidate) => candidate.id === sourceId);
      pushIf(issues, !source, "missing-reference", path, `Performance record references missing source: ${sourceId}.`);
      pushIf(issues, Boolean(source && !source.url), "missing-provenance", path, `Performance record source requires a direct URL: ${sourceId}.`);
    }
    pushIf(issues, record.requiresContinuousPair && Boolean(record.peak) && !record.continuous, "peak-without-continuous", path, "Peak output requires a continuous counterpart for this record.");
  }

  for (const chapter of content.chapters) {
    for (const step of chapter.steps) {
      const path = `chapters.${chapter.id}.${step.id}`;
      pushIf(issues, stepIds.has(step.id), "duplicate-id", path, "Duplicate chapter-step ID.");
      stepIds.add(step.id);
      if (step.placement === "main") mainStepIds.add(step.id);
      pushIf(issues, !step.title || !step.learnerQuestion.trim().endsWith("?"), "missing-learner-question", path, "Every panel needs exactly one concise learner question.");
      pushIf(issues, !step.copy.glance || !step.copy.why || !step.copy.evidence, "missing-copy-layer", path, "Every step needs glance, why and evidence copy.");
      pushIf(issues, sentenceCount(step.copy.glance) > 2, "invalid-glance-copy", path, "Glance copy must contain no more than two sentences.");
      pushIf(issues, !known.visualDevices.has(step.visual.device), "invalid-visual-device", path, "Step visual must be a recognised visual teaching device.");
      pushIf(issues, !step.visual.visibleConsequence || !step.visual.interaction, "missing-interaction", path, "Every step needs a visible consequence and a real reader interaction.");
      pushIf(issues, !step.visual.fallback || !step.reducedMotionState, "missing-fallback", path, "Every step needs a non-motion visual fallback.");
      const hasMeaningfulControl = step.controls.some((control) =>
        ["play", "scrub", "toggle", "slider", "select", "hotspot"].includes(control.kind),
      );
      pushIf(issues, !hasMeaningfulControl, "missing-interaction", path, "A step may not be advanced through prose-only navigation.");
      for (const claimId of step.claimIds) {
        pushIf(issues, !claimIds.has(claimId), "missing-reference", path, `Step references missing claim: ${claimId}.`);
      }
    }
  }

  for (const example of content.examples) {
    const path = `examples.${example.id}`;
    if (example.configurationId) {
      pushIf(issues, !configurationIds.has(example.configurationId), "missing-reference", path, `Example references missing configuration: ${example.configurationId}.`);
    }
    for (const claimId of example.claimIds) {
      pushIf(issues, !claimIds.has(claimId), "missing-reference", path, `Example references missing claim: ${claimId}.`);
    }
    for (const performanceId of example.performanceIds ?? []) {
      pushIf(issues, !performanceIds.has(performanceId), "missing-reference", path, `Example references missing performance record: ${performanceId}.`);
    }
  }

  const coveredTopics = new Set<string>();
  for (const topic of content.coverage) {
    const path = `coverage.${topic.id}`;
    pushIf(issues, coveredTopics.has(topic.id), "duplicate-id", path, "Duplicate coverage topic ID.");
    coveredTopics.add(topic.id);
    pushIf(issues, !known.contentPlacements.has(topic.placement), "missing-coverage", path, "Coverage topic needs a recognised placement classification.");
    pushIf(issues, !topic.reason, "missing-coverage", path, "Coverage topic needs an editorial-placement reason.");
    const needsTeachingStep = topic.placement === "main" || topic.placement === "optional-deep-dive";
    const needsEvidence = topic.placement === "main" || topic.placement === "optional-deep-dive" || topic.placement === "evidence-only";
    pushIf(issues, needsTeachingStep && topic.stepIds.length === 0, "missing-coverage", path, "Main and optional teaching topics require a linked visual step.");
    pushIf(issues, needsEvidence && topic.claimIds.length === 0, "missing-coverage", path, "Non-omitted topics require an evidence claim.");
    for (const stepId of topic.stepIds) {
      pushIf(issues, !stepIds.has(stepId), "missing-reference", path, `Coverage topic references missing step: ${stepId}.`);
    }
    for (const claimId of topic.claimIds) {
      pushIf(issues, !claimIds.has(claimId), "missing-reference", path, `Coverage topic references missing claim: ${claimId}.`);
    }
    if (needsTeachingStep) {
      pushIf(issues, !topic.visual || !known.visualDevices.has(topic.visual.device), "prose-only-coverage", path, "Teaching coverage cannot be prose-only; it needs an allowed visual device.");
      pushIf(issues, !topic.visual?.visibleConsequence || !topic.visual.interaction, "prose-only-coverage", path, "Teaching coverage needs an interaction and visible consequence.");
      pushIf(issues, !topic.visual?.fallback, "missing-fallback", path, "Teaching coverage needs a visual fallback.");
    }
    if (topic.placement === "main") {
      pushIf(issues, !topic.stepIds.some((stepId) => mainStepIds.has(stepId)), "missing-coverage", path, "Main-path topic must link to at least one main-path visual step.");
    }
  }

  for (const requiredTopicId of content.requiredCoverageTopicIds) {
    pushIf(
      issues,
      !coveredTopics.has(requiredTopicId),
      "missing-coverage",
      `coverage.${requiredTopicId}`,
      "A required due-diligence topic is missing from the coverage matrix.",
    );
  }

  return issues;
};

export const assertValidContent = (content: ContentModel) => {
  const issues = validateContent(content);
  if (issues.length) {
    throw new Error(issues.map((issue) => `${issue.code}: ${issue.path} — ${issue.message}`).join("\n"));
  }
};
