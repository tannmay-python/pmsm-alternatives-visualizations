import { describe, expect, it } from "vitest";
import {
  applyHeatTest,
  chapter3Labs,
  chapter3MainRoute,
  closeLab,
  compareCoercivity,
  dyTbTradeoff,
  freshHeatTest,
  isLabCloseKey,
  isLabRouteNavigationKey,
  labelSpecsByView,
  openLab,
} from "./chapter3MagnetModel";

describe("Chapter 3 magnet model", () => {
  it("keeps the main route to exactly four states and keeps labs outside it", () => {
    expect(chapter3MainRoute).toEqual([
      "remanence-strength",
      "coercivity-lock",
      "heat-demagnetisation",
      "dy-tb-tradeoff",
    ]);
    expect(chapter3MainRoute).not.toContain("grain-boundary-diffusion");
    expect(chapter3MainRoute).not.toContain("cooling-and-smco");
    expect(chapter3Labs).toEqual(["grain-boundary-diffusion", "cooling-and-smco"]);
  });

  it("makes the lower-coercivity illustration turn first under one qualitative field", () => {
    const middleStress = compareCoercivity(62);
    const highStress = compareCoercivity(90);

    expect(middleStress).toEqual({ lowerCoercivityReversed: true, higherCoercivityReversed: false });
    expect(highStress).toEqual({ lowerCoercivityReversed: true, higherCoercivityReversed: true });
  });

  it("latches heat damage after cooling until a fresh magnet is chosen", () => {
    const damaged = applyHeatTest(freshHeatTest(), 82, 78);
    const cooled = applyHeatTest(damaged, 12, 18);

    expect(damaged.demagLatched).toBe(true);
    expect(cooled).toMatchObject({ heat: 12, opposingField: 18, demagLatched: true });
    expect(freshHeatTest().demagLatched).toBe(false);
  });

  it("pairs added Dy/Tb protection with more reversal margin and less retained field", () => {
    const baseline = dyTbTradeoff(0);
    const protectedSample = dyTbTradeoff(2);

    expect(protectedSample.marginLength).toBeGreaterThan(baseline.marginLength);
    expect(protectedSample.retainedLength).toBeLessThan(baseline.retainedLength);
    expect(protectedSample.reversalMargin).toBe("most");
    expect(protectedSample.retainedStrength).toBe("lower");
  });

  it("models optional-lab open, close and Escape semantics without changing main progress", () => {
    expect(openLab("grain-boundary-diffusion", "open-grain")).toEqual({
      activeLab: "grain-boundary-diffusion",
      restoreFocusTo: "open-grain",
    });
    expect(closeLab()).toEqual({ activeLab: null, restoreFocusTo: null });
    expect(isLabCloseKey("Escape")).toBe(true);
    expect(isLabCloseKey("Enter")).toBe(false);
    expect(isLabRouteNavigationKey("ArrowRight")).toBe(true);
    expect(isLabRouteNavigationKey("PageDown")).toBe(true);
    expect(isLabRouteNavigationKey("Tab")).toBe(false);
    expect(isLabRouteNavigationKey("Escape")).toBe(false);
  });

  it("keeps every on-stage label short and collision-budgeted", () => {
    for (const labels of Object.values(labelSpecsByView)) {
      expect(labels.length).toBeLessThanOrEqual(2);
      for (const label of labels) {
        expect(label.words).toBeLessThanOrEqual(2);
        expect(label.text.length).toBeLessThanOrEqual(14);
      }
    }
  });
});
