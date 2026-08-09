import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VehicleJourneyVisual } from "./VehicleJourneyVisual";

describe("VehicleJourneyVisual extraction control", () => {
  it("uses one semantic button instead of an unreliable native range inside SVG", () => {
    const markup = renderToStaticMarkup(
      <VehicleJourneyVisual step="extract" showCopy={false} />,
    );

    expect(markup).toContain("Open drive unit");
    expect(markup).toContain('aria-pressed="false"');
    expect(markup).not.toContain('type="range"');
  });

  it("keeps the static reduced-motion extraction open and non-interactive", () => {
    const markup = renderToStaticMarkup(
      <VehicleJourneyVisual step="extract" reducedMotion showCopy={false} />,
    );

    expect(markup).toContain("Close drive unit");
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("disabled=\"\"");
  });
});
