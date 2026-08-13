import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Chapter5LabVisual } from "./Chapter5LabVisual";

describe("Chapter5LabVisual", () => {
  it.each([
    ["induction-cage-lab", "induction"],
    ["wound-field-lab", "wound-field"],
    ["pure-synrm-lab", "pure-synrm"],
  ])("renders the focused %s mechanism", (stepId, mechanism) => {
    const markup = renderToStaticMarkup(<Chapter5LabVisual stepId={stepId} />);
    expect(markup).toContain(`data-mechanism="${mechanism}"`);
    expect(markup).toMatch(/data-core-alternative-state=/);
  });

  it("keeps the visual labels in the DOM and limits the scene to two", () => {
    const markup = renderToStaticMarkup(<Chapter5LabVisual stepId="induction-cage-lab" />);
    expect(markup).not.toContain("<text");
    expect((markup.match(/class="chapter5-lab__callout /g) ?? []).length).toBe(2);
    expect(markup).toContain("STATOR FIELD");
    expect(markup).toContain("INDUCED CURRENT");
  });

  it("uses causal controls without unsupported slip or efficiency figures", () => {
    const markup = renderToStaticMarkup(<Chapter5LabVisual stepId="induction-cage-lab" />);
    expect(markup).toContain("Relative rotor speed");
    expect(markup).not.toMatch(/slip[^<]{0,24}%|efficiency[^<]{0,24}%/i);
  });

  it("makes wound-field current, shaft cooling, and SynRM power factor controllable", () => {
    const wound = renderToStaticMarkup(<Chapter5LabVisual stepId="wound-field-lab" />);
    const synrm = renderToStaticMarkup(<Chapter5LabVisual stepId="pure-synrm-lab" />);
    expect(wound).toContain("Rotor-field current");
    expect(wound).toContain("Oil cooling on");
    expect(synrm).toContain("Power factor");
    expect(synrm).toContain("can increase inverter and cooling burden");
  });

  it("offers an informative reduced-motion state without animated SVG elements", () => {
    const markup = renderToStaticMarkup(<Chapter5LabVisual stepId="pure-synrm-lab" reducedMotion />);
    expect(markup).toContain("Step field");
    expect(markup).not.toContain("animateTransform");
    expect(markup).not.toContain("requestAnimationFrame");
  });
});
