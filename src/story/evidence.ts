import { pmsmContent } from "../content/index";
import type { Claim, EvidenceSource } from "../content/schema";

export type RenderableClaim = {
  claim: Claim;
  sources: readonly EvidenceSource[];
};

const claimsById = new Map(pmsmContent.claims.map((claim) => [claim.id, claim]));
const sourcesById = new Map(pmsmContent.sources.map((source) => [source.id, source]));
const auditById = new Map(pmsmContent.audit.map((record) => [record.id, record]));

/** Every rendered qualified claim carries an explicit reading limit. */
export const evidenceCaveat = (claim: Claim) =>
  claim.caveat ??
  (claim.sourceType === "teaching-model"
    ? "Teaching model: it isolates the mechanism rather than representing every motor geometry or control detail."
    : claim.sourceType === "due-diligence"
      ? "Supplied due-diligence synthesis: confirm vehicle-specific implementation details against primary sources before treating this as a product claim."
      : "Read this statement with the stated operating condition and source scope.");

/**
 * The evidence drawer is a release surface, not a raw data dump. Claims marked
 * `hide` never reach it. When an audit bars a standalone number, its claim is
 * also kept off this surface rather than stripping context out of the sentence.
 */
export const resolveEvidenceClaims = (claimIds: readonly string[]): readonly RenderableClaim[] =>
  claimIds.flatMap((claimId) => {
    const claim = claimsById.get(claimId);
    if (!claim || claim.renderingPolicy === "hide") return [];

    const audit = claim.evidenceRecordId ? auditById.get(claim.evidenceRecordId) : undefined;
    if (claim.quantitative && audit && !audit.numbersMayBeShown) return [];

    return [{
      claim,
      sources: claim.sourceIds.flatMap((sourceId) => {
        const source = sourcesById.get(sourceId);
        return source ? [source] : [];
      }),
    }];
  });
