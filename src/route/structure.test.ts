import { describe, expect, it } from "vitest";
import { STOPS } from "./route";
import {
  BEATS,
  CLOSE_STOP_ID,
  LANDING_STOP_ID,
  PAGE_LIST,
  PAGES,
  buildPages,
} from "./structure";
import { frameKey } from "./presets";

/**
 * The restructure's one promise: fewer beats, none of the words. These tests
 * are what make that checkable rather than asserted.
 */

const tourStops = STOPS.filter((s) => s.id !== LANDING_STOP_ID && s.id !== CLOSE_STOP_ID);

describe("page structure", () => {
  it("builds without dropping or repeating a state", () => {
    expect(() => buildPages()).not.toThrow();
  });

  it("keeps every line from every tour state", () => {
    const before = tourStops.flatMap((stop) => stop.states.map((s) => s.line)).sort();
    const after = BEATS.flatMap((p) => p.beat.lines).sort();
    expect(after).toEqual(before);
  });

  it("keeps every tour state reachable through some beat", () => {
    const before = tourStops.flatMap((stop) => stop.states.map((s) => `${stop.id}/${s.id}`)).sort();
    const after = BEATS.flatMap((p) =>
      p.beat.sourceIds.map((id) => `${p.stop.sourceStopId}/${id}`),
    ).sort();
    expect(after).toEqual(before);
  });

  it("shortens the tour rather than lengthening it", () => {
    const stateCount = tourStops.reduce((n, s) => n + s.states.length, 0);
    expect(BEATS.length).toBeLessThan(stateCount);
    // Every merged beat has to earn its merge by carrying more than one line.
    for (const { beat } of BEATS) {
      expect(beat.lines.length).toBe(beat.sourceIds.length);
    }
  });

  it("gives every page two or three stops, and every stop at most five beats", () => {
    for (const page of PAGE_LIST) {
      expect(page.stops.length).toBeGreaterThanOrEqual(2);
      expect(page.stops.length).toBeLessThanOrEqual(3);
      for (const stop of page.stops) {
        expect(stop.beats.length).toBeGreaterThan(0);
        expect(stop.beats.length).toBeLessThanOrEqual(5);
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
