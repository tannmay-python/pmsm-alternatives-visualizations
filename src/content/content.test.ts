import { describe, expect, it } from "vitest";
import { pmsmContent } from "./index.ts";
import { validateContent } from "./validation.ts";

const expectIssue = (code: string, content: typeof pmsmContent, message: string) => {
  const issues = validateContent(content);
  expect(issues.some((issue) => issue.code === code), `${message}\nFound:\n${issues.map((issue) => `${issue.code}: ${issue.path}`).join("\n")}`).toBe(true);
};

describe("PMSM curriculum content contracts", () => {
  it("keeps the granular, validated eight-chapter curriculum", () => {
    const baselineIssues = validateContent(pmsmContent);
    expect(baselineIssues).toHaveLength(0);
    expect(pmsmContent.chapters).toHaveLength(8);
    expect(pmsmContent.chapters.flatMap((chapter) => chapter.steps).length).toBeGreaterThanOrEqual(26);
    expect(pmsmContent.coverage.length).toBeGreaterThanOrEqual(30);
    expect(new Set(pmsmContent.coverage.map((topic) => topic.dueDiligencePoint)).size).toBe(16);
    expect(pmsmContent.chapters.every((chapter) => chapter.steps.some((step) => step.placement === "main"))).toBe(true);
    expect(
      pmsmContent.chapters[0].steps.filter((step) => step.placement === "main").map((step) => step.id),
    ).toEqual(["car-transparent-cutaway", "power-path-flow", "drive-unit-extract", "motor-isolation"]);
  });

  it("does not conflate architecture, chemistry and geometry", () => {
    const badAxis = {
      ...pmsmContent,
      configurations: [
        { ...pmsmContent.configurations[0], torquePrinciple: "ferrite" },
        ...pmsmContent.configurations.slice(1),
      ] as unknown as typeof pmsmContent.configurations,
    };
    expectIssue("layer-conflation", badAxis, "Ferrite must never be accepted as a torque principle.");
  });

  it("keeps the Chapter 2 two-pull scene beginner-first", () => {
    const twoPullStep = pmsmContent.chapters
      .flatMap((chapter) => chapter.steps)
      .find((step) => step.id === "ipm-reluctance-overlay");

    expect(twoPullStep?.title).toBe("One rotor, two pulls");
    expect(twoPullStep?.learnerQuestion).toBe("Is the magnet doing all the turning?");
    expect(twoPullStep?.copy.glance).toBe(
      "The magnet pulls, and the shaped steel also tries to line up. Both turn the same shaft.",
    );
    expect(twoPullStep?.copy.why).toContain("reluctance torque");
    expect(twoPullStep?.copy.evidence).toContain("IPM-SynRM");
    expect(twoPullStep?.copy.glance).not.toContain("reluctance torque");
    expect(twoPullStep?.copy.glance).not.toContain("IPM-SynRM");
  });

  it("requires provenance for performance and market claims", () => {
    const badQuantity = {
      ...pmsmContent,
      claims: pmsmContent.claims.map((claim) =>
        claim.id === "proterial-power-speed-pair" ? { ...claim, sourceIds: [] } : claim,
      ),
    };
    expectIssue("missing-provenance", badQuantity, "A quantitative claim without a source must fail.");

    const unsafeMarketNumber = {
      ...pmsmContent,
      claims: pmsmContent.claims.map((claim) =>
        claim.id === "market-rare-earth-free-share-small" ? { ...claim, renderingPolicy: "show" as const } : claim,
      ),
    };
    expectIssue("unsafe-rendering-policy", unsafeMarketNumber, "Unsupported market-share claims must remain hidden.");
  });

  it("requires a continuous pair and visual teaching evidence", () => {
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
    expectIssue("prose-only-coverage", proseOnly, "Teaching coverage must not fall back to prose-only.");

    const missingTopic = {
      ...pmsmContent,
      coverage: pmsmContent.coverage.filter((topic) => topic.id !== "dd-10-iron-nitride-physics"),
    };
    expectIssue("missing-coverage", missingTopic, "Removing a required due-diligence topic must fail.");
  });
});
