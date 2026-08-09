import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PmsmTurnVisual } from "./PmsmTurnVisual";

describe("PmsmTurnVisual", () => {
  it("starts with the stator and rotor, without prematurely revealing buried magnets", () => {
    const markup = renderToStaticMarkup(<PmsmTurnVisual step="assemble" />);

    expect(markup).toContain("Stator stays still");
    expect(markup).toContain("Rotor turns");
    expect(markup).toContain("Isolate a motor part");
    expect(markup).not.toContain("pmsm-turn__magnet-pair");
    expect(markup).not.toContain("animateTransform");
  });

  it("shows the moving field in an empty bore rather than making the rotor move", () => {
    const markup = renderToStaticMarkup(<PmsmTurnVisual step="field" />);

    expect(markup).toContain("Copper stays still");
    expect(markup).toContain("Magnetic push moves");
    expect(markup).toContain("pmsm-turn__empty-bore");
    expect(markup).not.toContain("pmsm-turn__rotor-core");
    expect(markup).toContain("attributeName=\"opacity\"");
  });

  it("keeps the stable synchronous scene qualitative and makes its moving labels fixed keys", () => {
    const markup = renderToStaticMarkup(<PmsmTurnVisual step="sync" />);

    expect(markup).toContain("Field leads");
    expect(markup).toContain("Rotor follows");
    expect(markup).toContain("Stable synchronous range shown");
    expect(markup).toContain("pmsm-turn__key-label");
    expect(markup).not.toContain("never slows down");
  });

  it("offers both truthful buried-magnet views", () => {
    const markup = renderToStaticMarkup(<PmsmTurnVisual step="buried" />);

    expect(markup).toContain("High speed");
    expect(markup).toContain("Flux paths");
    expect(markup).toContain("Steel bridge holds it in");
    expect(markup).not.toContain("Flux takes the steel path");
  });

  it("keeps torque modes qualitative and frozen for comprehension", () => {
    const markup = renderToStaticMarkup(<PmsmTurnVisual step="torques" />);

    expect(markup).toContain("Magnet pull");
    expect(markup).toContain("Steel alignment");
    expect(markup).toContain("Together");
    expect(markup).toContain("Arrow size is not a torque split.");
    expect(markup).not.toContain("animateTransform");
    expect(markup).not.toContain("pmsm-turn__hard-axis");
  });

  it("uses deliberate ghost snapshots only for reduced-motion field scenes", () => {
    const reducedMarkup = renderToStaticMarkup(
      <PmsmTurnVisual step="field" reducedMotion />,
    );
    const pausedMarkup = renderToStaticMarkup(
      <PmsmTurnVisual step="field" paused />,
    );

    expect(reducedMarkup).toContain("pmsm-turn__field-ghosts");
    expect(reducedMarkup).not.toContain("animateTransform");
    expect(pausedMarkup).toContain("animateTransform");
  });
});
