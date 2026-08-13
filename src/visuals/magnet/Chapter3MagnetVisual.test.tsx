import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SceneStage } from "../../components/SceneStage";
import { CHAPTERS, getScene } from "../../story/storyRegistry";
import { Chapter3MagnetVisual } from "./Chapter3MagnetVisual";
import { chapter3MainRoute } from "./chapter3MagnetModel";

const chapterThree = CHAPTERS.find((chapter) => chapter.id === "why-the-magnet-needs-nd-dy-tb");

describe("Chapter3MagnetVisual", () => {
  it("binds each of the four main states to the dedicated native renderer", () => {
    expect(chapterThree?.steps.map((step) => step.id)).toEqual(chapter3MainRoute);

    for (const step of chapterThree?.steps ?? []) {
      const markup = renderToStaticMarkup(
        <SceneStage
          chapter={chapterThree!}
          step={step}
          scene={getScene(step.sceneId)}
          reducedMotion={false}
          paused={false}
          chapterNumber={3}
          stepNumber={chapterThree!.steps.indexOf(step) + 1}
          stepCount={chapterThree!.steps.length}
          onTogglePause={() => undefined}
        />,
      );

      expect(markup).toContain("visual-stage--chapter3");
      expect(markup).toContain("chapter3-magnet");
      expect(markup).not.toContain("scene-blueprint");
      expect(markup).not.toContain("webgl-canvas");
    }
  });

  it("uses DOM callouts and native qualitative controls instead of SVG text or numeric screen-reader values", () => {
    const markup = renderToStaticMarkup(<Chapter3MagnetVisual step="heat-demagnetisation" />);

    expect(markup).toContain("chapter3-callout");
    expect(markup).not.toContain("<text");
    expect(markup).toContain('type="range"');
    expect(markup).toContain('aria-valuetext="cool relative heat"');
    expect(markup).toContain('aria-valuetext="none opposing field"');
    expect(markup).not.toMatch(/aria-valuetext="[^"]*\d/);
  });

  it("renders two illustrative coercivity magnets and a live shared field control", () => {
    const markup = renderToStaticMarkup(<Chapter3MagnetVisual step="coercivity-lock" />);

    expect(markup).toContain('data-magnet="lower-coercivity"');
    expect(markup).toContain('data-magnet="higher-coercivity"');
    expect(markup).toContain("Opposing field");
    expect(markup).toContain("Turns first");
    expect(markup).toContain("Holds");
  });

  it("only names a reversed patch after damage has latched", () => {
    const normal = renderToStaticMarkup(<Chapter3MagnetVisual step="heat-demagnetisation" />);
    const reduced = renderToStaticMarkup(<Chapter3MagnetVisual step="heat-demagnetisation" reducedMotion />);

    expect(normal).toContain("Fresh magnet");
    expect(normal).not.toContain("Patch remains");
    expect(normal).not.toContain("chapter3-magnet-body__patch");
    expect(reduced).toContain("Patch remains");
    expect(reduced).toContain("chapter3-magnet-body__patch");
    expect(reduced).toContain("A cooled magnet keeps a reversed patch");
  });

  it("does not name the helper field after it has been removed for a reduced-motion endpoint", () => {
    const markup = renderToStaticMarkup(
      <Chapter3MagnetVisual step="remanence-strength" reducedMotion />,
    );

    expect(markup).toContain("Field remains");
    expect(markup).not.toContain("Helper field");
  });

  it("makes the trade-off explicit before optional labs are launched", () => {
    const markup = renderToStaticMarkup(<Chapter3MagnetVisual step="dy-tb-tradeoff" />);

    expect(markup).toContain("Fresh comparison sample");
    expect(markup).toContain("Dy/Tb protection");
    expect(markup).toContain("Reversal margin:");
    expect(markup).toContain("Retained strength:");
    expect(markup).toContain("More margin");
    expect(markup).toContain("Less field");
  });

  it("gives both reader-requested labs semantic controls, static reduced endpoints and a back action", () => {
    const grain = renderToStaticMarkup(
      <Chapter3MagnetVisual step="dy-tb-tradeoff" initialLab="grain-boundary-diffusion" reducedMotion />,
    );
    const cooling = renderToStaticMarkup(
      <Chapter3MagnetVisual step="dy-tb-tradeoff" initialLab="cooling-and-smco" reducedMotion />,
    );

    expect(grain).toContain('data-lab="grain-boundary-diffusion"');
    expect(grain).toContain('data-route-lock="true"');
    expect(grain).toContain("Uniform");
    expect(grain).toContain("Grain boundary");
    expect(grain).toContain("Run seed test");
    expect(grain).toContain("Back to magnet");
    expect(grain).toContain("chapter3-grain-cell__seed-test");
    expect(grain).toContain("is-selected");

    expect(cooling).toContain('data-lab="cooling-and-smco"');
    expect(cooling).toContain("Hot rotor");
    expect(cooling).toContain("Cooled rotor");
    expect(cooling).toContain("Show rotor oil cooling");
    expect(cooling).toContain('aria-pressed="false"');
    expect(cooling).toContain("Compare SmCo");
    expect(cooling).toContain("SmCo position");
    expect(cooling).toContain("does not prove Dy/Tb removal");
  });

  it("creates unique SVG ids when more than one renderer is mounted", () => {
    const markup = renderToStaticMarkup(
      <>
        <Chapter3MagnetVisual step="remanence-strength" />
        <Chapter3MagnetVisual step="coercivity-lock" />
      </>,
    );
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

    expect(ids.length).toBeGreaterThan(1);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("limits callouts to a maximum of 2 per view and wraps fieldset buttons cleanly", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(<Chapter3MagnetVisual step={step} />);
      const calloutCount = (markup.match(/class="chapter3-callout/g) || []).length;
      expect(calloutCount).toBeLessThanOrEqual(2);
    }

    const remanenceMarkup = renderToStaticMarkup(<Chapter3MagnetVisual step="remanence-strength" />);
    expect(remanenceMarkup).toContain('class="chapter3-choice__buttons"');

    const labMarkup = renderToStaticMarkup(
      <Chapter3MagnetVisual step="dy-tb-tradeoff" initialLab="grain-boundary-diffusion" />,
    );
    expect(labMarkup).toContain('data-route-lock="true"');
    expect(labMarkup).toContain('class="chapter3-choice__buttons"');
  });
});
