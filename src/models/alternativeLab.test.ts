import { describe, expect, it } from "vitest";
import { architectureLabById, architectureLabs } from "./alternativeLab";
import { rotorToAlternativeFamily } from "./alternativeLab";

describe("alternative selection", () => {
  it("maps every fitted rotor to its architecture lane", () => {
    expect(rotorToAlternativeFamily.srm).toBe("srm");
    expect(rotorToAlternativeFamily["pm-assisted-synrm"]).toBe("synrm");
  });
});

describe("alternative lab", () => {
  it("keeps one honest comparison lane per motor family", () => {
    expect(architectureLabs.map((item) => item.id)).toEqual([
      "pmsm",
      "induction",
      "wound",
      "synrm",
      "srm",
    ]);
    expect(architectureLabById.srm.label).toContain("Switched reluctance");
  });

  it("gives every family physical parameters, cost drivers and tracked metrics", () => {
    for (const lab of architectureLabs) {
      expect(lab.definingMetric.value.trim()).not.toBe("");
      expect(lab.costDrivers.length).toBeGreaterThan(2);
      expect(lab.trackThese.length).toBeGreaterThan(2);
      expect(lab.comparison).toHaveLength(5);
      expect(new Set(lab.comparison.map((metric) => metric.label)).size).toBe(5);
      for (const metric of lab.comparison) {
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.value).toBeLessThanOrEqual(4);
        expect(metric.note.trim()).not.toBe("");
      }
      expect(lab.regions.map((region) => region.region)).toEqual(["Abroad", "India"]);
    }
  });

  it("does not invent Indian examples where the supplied ledger has none", () => {
    for (const id of ["pmsm", "induction", "wound", "srm"] as const) {
      const india = architectureLabById[id].regions.find((region) => region.region === "India");
      expect(india?.records).toHaveLength(1);
      expect(india?.records[0].name).toBe("No named India programme");
    }
  });

  it("keeps rare-earth exposure and aluminium resistance explicit", () => {
    expect(architectureLabById.pmsm.rareEarth).toContain("Nd/Pr");
    expect(architectureLabById.induction.definingMetric.value).toContain("≈1.6× Cu");
    expect(architectureLabById.srm.definingMetric.value).toContain("Al ≈1.6× Cu");
  });
});
