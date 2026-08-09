import { chapters } from "./chapters.ts";
import { claims } from "./claims.ts";
import { coverageMatrix, requiredCoverageTopicIds } from "./coverage.ts";
import { evidenceAudit } from "./evidenceAudit.ts";
import { configurations, examples, performance } from "./motors.ts";
import type { ContentModel } from "./schema.ts";
import { sources } from "./sources.ts";

/** The single framework-neutral content entry point for the React application. */
export const pmsmContent: ContentModel = {
  sources,
  audit: evidenceAudit,
  claims,
  configurations,
  performance,
  examples,
  chapters,
  coverage: coverageMatrix,
  requiredCoverageTopicIds,
};

export * from "./schema.ts";
export { chapters } from "./chapters.ts";
export { claims } from "./claims.ts";
export { coverageMatrix, expectedCoverageTopicIds, requiredCoverageTopicIds } from "./coverage.ts";
export { evidenceAudit } from "./evidenceAudit.ts";
export { configurations, examples, performance } from "./motors.ts";
export { sources } from "./sources.ts";
