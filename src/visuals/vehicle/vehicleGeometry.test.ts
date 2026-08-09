import { describe, expect, it } from "vitest";
import {
  ENERGY_PARTS,
  getExtractionTransform,
  getNextEnergyIndex,
  isActiveEnergyLink,
  makeSvgId,
  toggleExtraction,
} from "./vehicleGeometry";

describe("vehicle journey geometry", () => {
  it("keeps the drive-unit extraction within its intended travel", () => {
    expect(getExtractionTransform(-1)).toEqual({ x: 0, y: 0, opacity: 1 });
    expect(getExtractionTransform(0.5)).toEqual({ x: 52, y: 63, opacity: 0.975 });
    expect(getExtractionTransform(2)).toEqual({ x: 104, y: 126, opacity: 0.95 });
  });

  it("moves through each energy link in order and wraps", () => {
    expect(getNextEnergyIndex(0)).toBe(1);
    expect(getNextEnergyIndex(ENERGY_PARTS.length - 1)).toBe(0);
    expect(isActiveEnergyLink(-1, ENERGY_PARTS.length - 1)).toBe(true);
    expect(isActiveEnergyLink(2, 1)).toBe(false);
  });

  it("creates safe ids for multiple mounted SVG instances", () => {
    expect(makeSvgId("vehicle-title", ":r0:")).toBe("vehicle-title-r0");
  });

  it("keeps the drive-unit action as one clear open or close state", () => {
    expect(toggleExtraction(0)).toBe(1);
    expect(toggleExtraction(0.88)).toBe(1);
    expect(toggleExtraction(0.89)).toBe(0);
    expect(toggleExtraction(2)).toBe(0);
  });
});
