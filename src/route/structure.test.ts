import { describe, expect, it } from "vitest";
import { STOPS } from "./route";
import {
  BEATS,
  PAGE_LIST,
  PAGES,
  buildPages,
} from "./structure";
import { frameKey } from "./presets";

const requiredSpine = [
  "where-the-motor-lives/power-path",
  "open-the-machine/explode",
  "open-the-machine/rotor",
  "open-the-machine/air-gap",
  "three-coils-one-field/electromagnet-rule",
  "three-coils-one-field/three-phase-math",
  "three-coils-one-field/rotor-locks",
  "two-pulls-one-shaft/already-both",
  "strength-and-stubbornness/division-of-labour",
  "which-rare-earth/the-split",
  "heat-and-the-patch/dysprosium-tradeoff",
  "which-rare-earth/already-happened",
  "swap-the-rotor/family-tree",
  "swap-the-rotor/induction-principle",
  "swap-the-rotor/wound-control",
  "swap-the-rotor/reluctance-spectrum",
  "swap-the-rotor/srm-aluminium",
  "change-the-magnet/ferrite-limit",
  "what-must-change/spectrum",
  "what-must-change/validation",
  "what-must-change/where-we-are",
];

describe("page structure", () => {
  it("uses five chapters for the guided spine", () => {
    expect(PAGE_LIST).toHaveLength(5);
  });

  it("builds without repeating a selected state", () => {
    expect(() => buildPages()).not.toThrow();
  });

  it("keeps the complete 21-frame learning spine", () => {
    const selected = BEATS.flatMap((p) =>
      p.beat.sourceIds.map((id) => `${p.stop.sourceStopId}/${id}`),
    ).sort();
    expect(selected).toEqual([...requiredSpine].sort());
  });

  it("holds the public course to 20–22 frames", () => {
    expect(BEATS.length).toBeGreaterThanOrEqual(20);
    expect(BEATS.length).toBeLessThanOrEqual(22);
    for (const { beat } of BEATS) {
      expect(beat.lines.length).toBe(beat.sourceIds.length);
    }
  });

  it("gives every chapter a bounded number of stops and beats", () => {
    for (const page of PAGE_LIST) {
      expect(page.stops.length).toBeGreaterThanOrEqual(1);
      expect(page.stops.length).toBeLessThanOrEqual(4);
      for (const stop of page.stops) {
        expect(stop.beats.length).toBeGreaterThan(0);
        expect(stop.beats.length).toBeLessThanOrEqual(6);
      }
    }
  });

  it("gives every beat a unique id within its stop", () => {
    for (const page of PAGE_LIST) {
      for (const stop of page.stops) {
        const ids = stop.beats.map((b) => b.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    }
  });

  it("only merges identical frames unless the merge says why", () => {
    for (const page of PAGES) {
      for (const spec of page.stops) {
        const stop = STOPS.find((s) => s.id === spec.from)!;
        for (const group of spec.groups) {
          const deliberate = !Array.isArray(group);
          const ids = deliberate
            ? (group as { ids: readonly string[] }).ids
            : (group as readonly string[]);
          if (ids.length < 2) continue;

          if (deliberate) {
            // A merge that changes what the reader sees has to be argued for.
            const why = (group as { why: string }).why;
            expect(why.length, `[${ids.join(" + ")}] needs a reason`).toBeGreaterThan(40);
            continue;
          }

          const states = ids.map((id) => stop.states.find((s) => s.id === id)!);
          for (const other of states.slice(1)) {
            expect(
              frameKey(stop, other),
              `[${ids.join(" + ")}]: "${other.id}" draws a different frame`,
            ).toBe(frameKey(stop, states[0]));
          }
        }
      }
    }
  });

  it("gives every chapter boundary an interstitial", () => {
    // The first page needs none: the landing hands the reader in. Every
    // boundary after it does, or the tour cuts from a closing beat straight
    // into an unrelated opening frame.
    PAGE_LIST.forEach((page, i) => {
      if (i === 0) return;
      expect(page.transition, `page "${page.id}" has no transition`).toBeDefined();
      expect(page.transition!.act.length).toBeGreaterThan(0);
      expect(page.transition!.title.length).toBeGreaterThan(0);
      expect(page.transition!.lede.length).toBeGreaterThan(40);
      expect(page.transition!.nextLabel.length).toBeGreaterThan(0);
    });
  });
});
