import { describe, expect, it } from "vitest";
import {
  qualitativeDemagnetisationRisk,
  nextMagnetMode,
} from "./magnetScience";

describe("magnet science helpers", () => {
  it("keeps qualitative risk low when heat and opposing field are both low", () => {
    expect(qualitativeDemagnetisationRisk(15, 20)).toBe("low");
  });

  it("raises risk only when combined thermal and reverse-field stress rises", () => {
    expect(qualitativeDemagnetisationRisk(60, 45)).toBe("watch");
    expect(qualitativeDemagnetisationRisk(85, 90)).toBe("high");
  });

  it("cycles modes in both directions", () => {
    expect(nextMagnetMode("properties", -1)).toBe("cooling");
    expect(nextMagnetMode("cooling", 1)).toBe("properties");
  });
});
