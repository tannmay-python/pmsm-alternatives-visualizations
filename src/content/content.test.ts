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

  it("keeps the Chapter 2 stator scene aligned with its isolate control", () => {
    const statorStep = pmsmContent.chapters
      .flatMap((chapter) => chapter.steps)
      .find((step) => step.id === "pmsm-assemble-stator");

    expect(statorStep?.visual.interaction).toBe(
      "Choose Stator, Rotor or Both to isolate the part you want to inspect.",
    );
    expect(statorStep?.visual.visibleConsequence).toBe(
      "One motor cross-section keeps the stationary stator ring, air gap and quiet rotor visible for comparison.",
    );
    expect(statorStep?.controls).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "stator-isolate",
        label: "Stator / Rotor / Both",
        kind: "select",
        consequence: "Fades the other parts so the selected stator, rotor or both are easier to compare.",
      }),
    ]));
    expect(statorStep?.controls.map((control) => control.id)).not.toContain("stator-assemble");
    expect(statorStep?.controls.map((control) => control.id)).not.toContain("stator-hotspots");
  });

  it("keeps Chapter 3 as four simple main scenes with evidence-safe optional labs", () => {
    const chapter = pmsmContent.chapters.find((item) => item.id === "why-the-magnet-needs-nd-dy-tb");
    const mainSteps = chapter?.steps.filter((step) => step.placement === "main") ?? [];
    const optionalSteps = chapter?.steps.filter((step) => step.placement === "optional-deep-dive") ?? [];

    expect(mainSteps.map((step) => step.id)).toEqual([
      "remanence-strength",
      "coercivity-lock",
      "heat-demagnetisation",
      "dy-tb-tradeoff",
    ]);
    expect(optionalSteps.map((step) => step.id)).toEqual([
      "grain-boundary-diffusion",
      "cooling-and-smco",
    ]);

    const [remanence, coercivity, heat, tradeoff] = mainSteps;
    expect(remanence?.copy.glance).toBe("A magnet can hold some field after help is removed.");
    expect(remanence?.copy.why).toBe("Iron supplies much of the strength. Rare-earth chemistry helps resist reversal.");
    expect(coercivity?.copy.glance).toBe("An opposing field can try to turn a magnet backwards.");
    expect(heat?.copy.glance).toBe("Heat plus an opposing field can leave a magnet weaker, even after it cools.");
    expect(heat?.copy.evidence).toBe("Relative heat and reversal margin only; no universal threshold shown.");
    expect(heat?.controls.map((control) => control.label)).toEqual([
      "Relative heat",
      "Opposing field",
      "Fresh magnet",
      "Next",
    ]);
    expect(tradeoff?.copy.glance).toBe("Dy and Tb help a hot magnet resist reversal. They do not cool it.");
    expect(tradeoff?.copy.why).toContain("Fresh comparison sample");
    expect(tradeoff?.controls.map((control) => control.label)).toEqual([
      "Dy/Tb protection",
      "Explore grain edge",
      "Compare cooling",
      "Next",
    ]);

    const visibleChapterCopy = JSON.stringify(chapter);
    expect(visibleChapterCopy).not.toMatch(/150\s*[–-]\s*180|0\.5\s*%|Audi.*Dy|Dy.*Audi/i);
    expect(visibleChapterCopy).not.toMatch(/\d+(?:\.\d+)?\s*%/);

    const cooling = optionalSteps.find((step) => step.id === "cooling-and-smco");
    expect(cooling?.controls.map((control) => control.label)).toEqual([
      "Rotor oil cooling",
      "Compare SmCo",
      "Back",
    ]);
    expect(cooling?.copy.glance).toBe("Cooling is thermal management. It does not prove Dy/Tb removal.");
    expect(cooling?.copy.why).toContain("qualified position");
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
