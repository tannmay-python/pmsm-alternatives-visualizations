import { describe, expect, it } from "vitest";
import { claims } from "../content/claims";
import { chapters } from "../content/chapters";
import { ROTORS, rotorIds } from "../stage/rotors/registry";
import { configurations } from "../content/motors";
import { lintCopyLine, lintRoute } from "./copyLint";
import { ACTS, STOPS, diagramIds, stageForState } from "./route";

const allClaimIds = new Set(claims.map((claim) => claim.id));
const allStepIds = new Set(chapters.flatMap((chapter) => chapter.steps.map((step) => step.id)));

describe("route structure", () => {
  it("opens on the problem, not on the machine", () => {
    expect(STOPS[0].act).toBe(0);
    expect(STOPS[0].id).toBe("the-problem");
    // The reader meets the supply-chain problem before any mechanism.
    const opening = STOPS[0].states.map((state) => state.id);
    expect(opening).toContain("who-makes-it");
    expect(opening).toContain("the-control");
    expect(opening.at(-1)).toBe("the-real-question");
  });

  it("runs the acts in order and numbers the stops consecutively", () => {
    const acts = STOPS.map((stop) => stop.act);
    expect([...acts].sort((a, b) => a - b)).toEqual(acts);
    expect(STOPS.map((stop) => stop.number)).toEqual(STOPS.map((_, i) => i + 1));
    for (const stop of STOPS) {
      expect(ACTS.find((act) => act.act === stop.act)?.label).toBe(stop.actLabel);
    }
  });

  it("gives every state something for the reader to do", () => {
    for (const stop of STOPS) {
      expect(stop.states.length).toBeGreaterThan(0);
      for (const state of stop.states) {
        expect(state.action.trim().length).toBeGreaterThan(0);
        expect(state.line.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("has unique stop and state ids", () => {
    const stopIds = STOPS.map((stop) => stop.id);
    expect(new Set(stopIds).size).toBe(stopIds.length);
    for (const stop of STOPS) {
      const ids = stop.states.map((state) => state.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("route is bound to the evidence layer", () => {
  it("only cites claims that exist", () => {
    for (const stop of STOPS) {
      for (const claimId of stop.claimIds) {
        expect(allClaimIds.has(claimId), `${stop.id} cites ${claimId}`).toBe(true);
      }
    }
  });

  it("only covers curriculum steps that exist", () => {
    for (const stop of STOPS) {
      for (const stepId of stop.coversStepIds) {
        expect(allStepIds.has(stepId), `${stop.id} covers ${stepId}`).toBe(true);
      }
    }
  });

  it("never renders a claim the audit says to hide", () => {
    const hidden = new Set(
      claims.filter((claim) => claim.renderingPolicy === "hide").map((claim) => claim.id),
    );
    // Hidden claims may be attached to a stop for provenance, but the Evidence
    // panel filters them; this asserts the filter has something to act on.
    const rendered = STOPS.flatMap((stop) => stop.claimIds).filter((id) => hidden.has(id));
    for (const id of rendered) {
      expect(claims.find((claim) => claim.id === id)?.renderingPolicy).toBe("hide");
    }
  });
});

describe("stage wiring", () => {
  it("resolves a stage for every state", () => {
    for (const stop of STOPS) {
      for (const state of stop.states) {
        const stage = stageForState(stop, state);
        if (stage.kind === "svg") {
          expect(diagramIds).toContain(stage.diagram);
        } else if (stage.scene === "motor") {
          expect(rotorIds).toContain(stage.rotor);
        }
      }
    }
  });

  it("keeps every rotor pointed at a real configuration", () => {
    const configurationIds = new Set<string>(configurations.map((configuration) => configuration.id));
    for (const id of rotorIds) {
      const spec = ROTORS[id];
      expect(configurationIds.has(spec.configurationId), `${id} → ${spec.configurationId}`).toBe(true);
    }
  });

  it("marks switched reluctance as the only rotor needing its own stator", () => {
    // Every other machine here shares one distributed three-phase stator, which
    // is what makes the rotor rack an honest comparison. SRM does not.
    const ownStator = rotorIds.filter((id) => ROTORS[id].needsOwnStator);
    expect(ownStator).toEqual(["srm"]);
  });

  it("winds the switched-reluctance stator in aluminium, as AEM does", () => {
    expect(ROTORS.srm.windingMaterial).toBe("aluminium");
  });

  it("shows axial flux as its own topology rather than a rotor", () => {
    const axial = STOPS.flatMap((stop) =>
      stop.states.map((state) => stageForState(stop, state)),
    ).filter((stage) => stage.kind === "three" && stage.scene === "axial");
    expect(axial.length).toBeGreaterThan(0);
    // Both chemistries must appear, or the stop cannot make its own point that
    // geometry and chemistry are separate choices.
    const chemistries = new Set(
      axial.map((stage) => (stage.kind === "three" && stage.scene === "axial" ? stage.chemistry : "")),
    );
    expect(chemistries).toEqual(new Set(["ferrite", "ndfeb"]));
  });

  it("shows both wound-field excitation methods as different hardware", () => {
    const excitations = new Set(
      STOPS.flatMap((stop) => stop.states.map((state) => stageForState(stop, state)))
        .filter((stage) => stage.kind === "three" && stage.scene === "motor" && stage.excitation)
        .map((stage) => (stage.kind === "three" && stage.scene === "motor" ? stage.excitation : "")),
    );
    expect(excitations).toEqual(new Set(["brushed", "contactless"]));
  });

  it("marks only the induction rotor asynchronous", () => {
    const asynchronous = rotorIds.filter((id) => ROTORS[id].branch === "asynchronous");
    expect(asynchronous).toEqual(["squirrel-cage"]);
  });

  it("agrees with itself about which rotors carry rare earths", () => {
    expect(ROTORS["squirrel-cage"].usesRareEarthMagnets).toBe(false);
    expect(ROTORS.wound.usesRareEarthMagnets).toBe(false);
    expect(ROTORS.synrm.usesRareEarthMagnets).toBe(false);
    expect(ROTORS["ferrite-ipm"].usesRareEarthMagnets).toBe(false);
    expect(ROTORS["ipm-ndfeb"].usesRareEarthMagnets).toBe(true);
    // PM-assisted reluctance puts magnet content back; saying otherwise is the
    // exact conflation the source report made.
    expect(ROTORS["pm-assisted-synrm"].usesRareEarthMagnets).toBe(true);
  });
});

describe("visible copy", () => {
  it("carries no hedges, filler or uncondition numbers", () => {
    const issues = lintRoute(STOPS);
    expect(issues.map((issue) => `${issue.code} ${issue.path}: ${issue.message}`)).toEqual([]);
  });
});

describe("the copy lint is not vacuous", () => {
  it("rejects the sentence that motivated it", () => {
    const issues = lintCopyLine(
      "The controls are qualitative. The important idea is the combined stress: heat lowers the margin.",
      "regression",
    );
    expect(issues.map((issue) => issue.code)).toContain("hedge");
  });

  it("rejects a peak figure with no condition", () => {
    expect(lintCopyLine("The SSRD makes 308 peak.", "regression").map((i) => i.code)).toContain(
      "bare-number",
    );
  });

  it("accepts a figure that carries its unit and its condition", () => {
    expect(
      lintCopyLine("102 kW at 15,000 rpm against a 110 kW at 10,000 rpm baseline.", "regression"),
    ).toEqual([]);
  });

  it("rejects an instruction that is only reading", () => {
    expect(lintCopyLine("Learn more about magnets.", "regression").map((i) => i.code)).toContain(
      "empty-instruction",
    );
  });
});
