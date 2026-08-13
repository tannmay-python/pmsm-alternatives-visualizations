import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SceneStage } from "../../components/SceneStage";
import { CHAPTERS, getScene } from "../../story/storyRegistry";
import { FinalDecisionVisual } from "./FinalDecisionVisual";
import {
  finalDecisionStepIds,
  isFinalDecisionStep,
} from "./finalDecisionModel";

describe("FinalDecisionVisual", () => {
  it("owns the three visible decision IDs without a WebGL fallback", () => {
    expect(finalDecisionStepIds).toEqual([
      "vehicle-survivors-and-changes",
      "swap-burden-spectrum",
      "india-capability-stack",
      "final-decision-map",
    ]);

    const visibleDecisionStepIds = finalDecisionStepIds.filter(
      (stepId) => stepId !== "swap-burden-spectrum",
    );

    for (const stepId of visibleDecisionStepIds) {
      const chapter = CHAPTERS.find((candidate) =>
        candidate.steps.some((candidateStep) => candidateStep.id === stepId),
      );
      const step = chapter?.steps.find((candidate) => candidate.id === stepId);

      expect(chapter).toBeDefined();
      expect(step).toBeDefined();

      const markup = renderToStaticMarkup(
        <SceneStage
          chapter={chapter!}
          step={step!}
          scene={getScene(step!.sceneId)}
          reducedMotion={false}
          paused={false}
          chapterNumber={5}
          stepNumber={1}
          stepCount={4}
          onTogglePause={() => undefined}
        />,
      );

      expect(markup).toContain("visual-stage--final-decision");
      expect(markup).toContain('class="final-decision');
      expect(markup).not.toContain("scene-blueprint");
      expect(markup).not.toContain("webgl-canvas");
    }
  });

  it("uses native controls and DOM labels rather than SVG text or gradients", () => {
    for (const step of finalDecisionStepIds) {
      const markup = renderToStaticMarkup(<FinalDecisionVisual step={step} />);
      expect(markup).toContain("<select");
      expect(markup).not.toContain("<text");
      expect(markup).not.toContain("linearGradient");
      expect(markup).not.toContain("animate");
    }
  });

  it("keeps each visual mechanism sparse and carries its two required cautions", () => {
    const car = renderToStaticMarkup(<FinalDecisionVisual step="vehicle-survivors-and-changes" />);
    const spectrum = renderToStaticMarkup(<FinalDecisionVisual step="swap-burden-spectrum" />);
    const capability = renderToStaticMarkup(<FinalDecisionVisual step="india-capability-stack" />);
    const map = renderToStaticMarkup(<FinalDecisionVisual step="final-decision-map" />);

    expect((car.match(/class="final-decision__callout /g) ?? []).length).toBe(2);
    expect(car).toContain("Vehicle stays neutral");
    expect(car).toContain("Drive unit changes");
    expect((spectrum.match(/class="final-decision__callout /g) ?? []).length).toBe(2);
    expect(spectrum).toContain("Material adjustment");
    expect(spectrum).toContain("Drive-unit redesign");
    expect(capability).toContain("Materials");
    expect(capability).toContain("Manufacturing");
    expect(capability).toContain("Opportunity, not guaranteed leadership");
    expect(map).toContain("Mechanism");
    expect(map).toContain("Vehicle burden");
    expect(map).toContain("No universal winner");
  });

  it("recognises no unlisted story IDs as final decision scenes", () => {
    expect(isFinalDecisionStep("vehicle-survivors-and-changes")).toBe(true);
    expect(isFinalDecisionStep("inverter-and-cooling-burden")).toBe(false);
    expect(isFinalDecisionStep("two-markets-switch")).toBe(false);
  });
});
