import { describe, expect, it } from "vitest";
import { STOPS } from "./route";
import { lintCopyLine } from "./copyLint";
import { stateGuides } from "./guide";

describe("state guide", () => {
  it("guides every stop-state pair", () => {
    const missing: string[] = [];
    for (const stop of STOPS) {
      for (const state of stop.states) {
        if (!stateGuides[`${stop.id}/${state.id}`]) missing.push(`${stop.id}/${state.id}`);
      }
    }
    expect(missing).toEqual([]);
    expect(Object.keys(stateGuides)).toHaveLength(
      STOPS.reduce((sum, stop) => sum + stop.states.length, 0),
    );
  });

  it("gives concrete visual, causal and forward guidance", () => {
    const issues: string[] = [];
    for (const [key, guide] of Object.entries(stateGuides)) {
      for (const [field, text] of Object.entries(guide)) {
        if (text.trim().length < 24 || text.trim().endsWith("?")) {
          issues.push(`${key}.${field} is not explanatory prose`);
        }
        issues.push(...lintCopyLine(text, `${key}.${field}`).map((issue) => `${key}.${field}: ${issue.code}`));
      }
    }
    expect(issues).toEqual([]);
  });
});
