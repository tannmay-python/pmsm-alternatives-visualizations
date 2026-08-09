import { pmsmContent } from "./index.ts";
import { validateContent } from "./validation.ts";

const expect = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const expectIssue = (code: string, content: typeof pmsmContent, message: string) => {
  const issues = validateContent(content);
  expect(issues.some((issue) => issue.code === code), `${message}\nFound:\n${issues.map((issue) => `${issue.code}: ${issue.path}`).join("\n")}`);
};

const baselineIssues = validateContent(pmsmContent);
expect(baselineIssues.length === 0, `Baseline content must validate:\n${baselineIssues.map((issue) => `${issue.code}: ${issue.path}`).join("\n")}`);
expect(pmsmContent.chapters.length === 8, "The curriculum must have exactly eight chapters.");
expect(pmsmContent.chapters.flatMap((chapter) => chapter.steps).length >= 26, "The curriculum must retain at least 26 granular visual steps.");
expect(pmsmContent.coverage.length >= 30, "The coverage matrix must remain granular rather than collapsing due-diligence topics.");
expect(new Set(pmsmContent.coverage.map((topic) => topic.dueDiligencePoint)).size === 16, "Every numbered due-diligence point must remain represented.");
const mainSteps = pmsmContent.chapters.flatMap((chapter) => chapter.steps).filter((step) => step.placement === "main");
expect(mainSteps.length >= 26, "The beginner route must remain substantial enough to teach every core mechanism.");
expect(
  JSON.stringify(pmsmContent.chapters[0].steps.filter((step) => step.placement === "main").map((step) => step.id)) ===
    JSON.stringify(["car-transparent-cutaway", "power-path-flow", "drive-unit-extract", "motor-isolation"]),
  "Chapter 1's default route must stay car → power path → opened drive unit → isolated motor.",
);

const badAxis = {
  ...pmsmContent,
  configurations: [
    { ...pmsmContent.configurations[0], torquePrinciple: "ferrite" },
    ...pmsmContent.configurations.slice(1),
  ] as unknown as typeof pmsmContent.configurations,
};
expectIssue("layer-conflation", badAxis, "Ferrite must never be accepted as a torque principle.");

const badQuantity = {
  ...pmsmContent,
  claims: pmsmContent.claims.map((claim) =>
    claim.id === "proterial-power-speed-pair" ? { ...claim, sourceIds: [] } : claim,
  ),
};
expectIssue("missing-provenance", badQuantity, "A quantitative claim without a source must fail.");

const peakOnly = {
  ...pmsmContent,
  performance: pmsmContent.performance.map((record) =>
    record.id === "aem-ssrd-power" ? { ...record, continuous: undefined } : record,
  ),
};
expectIssue("peak-without-continuous", peakOnly, "AEM peak output must not render without its continuous rating.");

const proseOnly = {
  ...pmsmContent,
  coverage: pmsmContent.coverage.map((topic) =>
    topic.id === "dd-02-car-to-stator" ? { ...topic, visual: { ...topic.visual, device: "text" } } : topic,
  ) as unknown as typeof pmsmContent.coverage,
};
expectIssue("prose-only-coverage", proseOnly, "Prose-only due-diligence coverage must fail.");

const missingTopic = {
  ...pmsmContent,
  coverage: pmsmContent.coverage.filter((topic) => topic.id !== "dd-10-iron-nitride-physics"),
};
expectIssue("missing-coverage", missingTopic, "Removing a required due-diligence topic must fail.");

const unsafeMarketNumber = {
  ...pmsmContent,
  claims: pmsmContent.claims.map((claim) =>
    claim.id === "market-rare-earth-free-share-small" ? { ...claim, renderingPolicy: "show" as const } : claim,
  ),
};
expectIssue("unsafe-rendering-policy", unsafeMarketNumber, "Unsupported market-share claims must remain hidden.");

console.info(`Content validation passed: ${pmsmContent.chapters.length} chapters, ${mainSteps.length} main-path steps, ${pmsmContent.chapters.flatMap((chapter) => chapter.steps).length} visual steps, ${pmsmContent.coverage.length} coverage topics.`);
