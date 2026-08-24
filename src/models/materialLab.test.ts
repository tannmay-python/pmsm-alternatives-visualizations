import { describe, expect, it } from "vitest";
import { claims } from "../content/claims";
import { materialIdForState, materialLabById, materialLabs } from "./materialLab";

describe("material lab", () => {
  it("compares the incumbent with two rare-earth-free chemistries", () => {
    expect(materialLabs.map((item) => item.id)).toEqual(["ndfeb", "ferrite", "iron-nitride"]);
    expect(materialLabById.ferrite.rareEarth).toContain("No rare earths");
    expect(materialLabById["iron-nitride"].rareEarth).toContain("None");
  });

  it("gives every material cost drivers and measurable company-level signals", () => {
    for (const material of materialLabs) {
      expect(material.properties).toHaveLength(4);
      expect(material.comparison).toHaveLength(5);
      expect(new Set(material.comparison.map((metric) => metric.label)).size).toBe(5);
      for (const metric of material.comparison) {
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.value).toBeLessThanOrEqual(4);
        expect(metric.note.trim()).not.toBe("");
      }
      expect(material.costDrivers.length).toBeGreaterThan(2);
      expect(material.trackThese.some((item) => /cost|price/i.test(item))).toBe(true);
      expect(material.regions.map((region) => region.region)).toEqual(["Abroad", "India"]);
    }
  });

  it("does not pretend missing India records are R&D programmes", () => {
    const india = materialLabById.ndfeb.regions.find((region) => region.region === "India");
    expect(india?.records[0].name).toBe("No named India material programme");
  });

  it("keeps route states and the selected material aligned", () => {
    expect(materialIdForState("ferrite-limit")).toBe("ferrite");
    expect(materialIdForState("proterial-numbers")).toBe("ferrite");
    expect(materialIdForState("iron-nitride-gates")).toBe("iron-nitride");
    expect(materialIdForState("stackable-layers")).toBe("ndfeb");
  });

  it("only anchors lessons to claims present in the evidence layer", () => {
    const claimIds = new Set(claims.map((claim) => claim.id));
    const anchoredClaimIds = [
      "ferrite-is-chemistry",
      "ferrite-remanence-energy-product",
      "proterial-power-speed-pair",
      "iron-nitride-is-chemistry",
      "niron-material-range",
      "matter-variable-flux-fit",
    ];
    for (const id of anchoredClaimIds) expect(claimIds.has(id)).toBe(true);
  });
});
