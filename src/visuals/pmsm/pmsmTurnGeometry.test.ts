import { describe, expect, it } from "vitest";
import {
  PMSM_TURN_STEPS,
  getBalancedPhaseStrengths,
  loadAngle,
  torqueIsVisible,
} from "./pmsmTurnGeometry";

describe("PMSM turn teaching geometry", () => {
  it("keeps the chapter mapped to the five intended visual states", () => {
    expect(PMSM_TURN_STEPS).toEqual([
      "assemble",
      "field",
      "sync",
      "buried",
      "torques",
    ]);
  });

  it("uses a balanced three-phase timing model", () => {
    for (const angle of [0, 18, 90, 180, 271]) {
      const sum = getBalancedPhaseStrengths(angle).reduce((total, value) => total + value, 0);
      expect(sum).toBeCloseTo(0, 10);
    }
  });

  it("makes the higher stable load angle visibly larger", () => {
    expect(loadAngle("higher")).toBeGreaterThan(loadAngle("light"));
  });

  it("isolates qualitative torque contributions without inventing a split", () => {
    expect(torqueIsVisible("magnet", "magnet")).toBe(true);
    expect(torqueIsVisible("magnet", "steel")).toBe(false);
    expect(torqueIsVisible("steel", "steel")).toBe(true);
    expect(torqueIsVisible("both", "magnet")).toBe(true);
    expect(torqueIsVisible("both", "steel")).toBe(true);
  });
});
