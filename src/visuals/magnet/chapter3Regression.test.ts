import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
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
import { Chapter3MagnetVisual } from "./Chapter3MagnetVisual";

/* ─── Route ─── */

describe("route and binding", () => {
  it("four main states and two labs, no overlap", () => {
    expect(chapter3MainRoute).toHaveLength(4);
    expect(chapter3Labs).toHaveLength(2);
    for (const lab of chapter3Labs) {
      expect(chapter3MainRoute as readonly string[]).not.toContain(lab);
    }
  });

  it("renders each main step without throwing", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(markup).toContain("chapter3-magnet");
      expect(markup).toContain(`data-step="${step}"`);
    }
  });

  it("labs launch only from dy-tb-tradeoff step", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "dy-tb-tradeoff" }),
    );
    expect(markup).toContain("Explore grain edge");
    expect(markup).toContain("Compare cooling");

    for (const step of chapter3MainRoute.filter((state) => state !== "dy-tb-tradeoff")) {
      const other = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(other).not.toContain("Explore grain edge");
      expect(other).not.toContain("Compare cooling");
    }
  });
});

/* ─── Qualitative controls ─── */

describe("qualitative controls", () => {
  it("aria-valuetext never contains raw numbers", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      const valueTexts = [...markup.matchAll(/aria-valuetext="([^"]*)"/g)].map(
        (match) => match[1],
      );
      for (const text of valueTexts) {
        expect(text).not.toMatch(/\d/);
      }
    }
  });

  it("reduced-motion markup has no raw numeric aria-valuetext", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step, reducedMotion: true }),
      );
      const valueTexts = [...markup.matchAll(/aria-valuetext="([^"]*)"/g)].map(
        (match) => match[1],
      );
      for (const text of valueTexts) {
        expect(text).not.toMatch(/\d/);
      }
    }
  });
});

/* ─── Latching and sample reset ─── */

describe("latching and sample reset", () => {
  it("high heat + high field latches damage", () => {
    const fresh = freshHeatTest();
    const damaged = applyHeatTest(fresh, 82, 78);
    expect(damaged.demagLatched).toBe(true);
  });

  it("lowering heat does not unlatch damage", () => {
    const damaged = applyHeatTest(freshHeatTest(), 82, 78);
    const cooled = applyHeatTest(damaged, 0, 0);
    expect(cooled.demagLatched).toBe(true);
    expect(cooled.heat).toBe(0);
    expect(cooled.opposingField).toBe(0);
  });

  it("fresh magnet clears latched damage", () => {
    const fresh = freshHeatTest();
    expect(fresh.demagLatched).toBe(false);
    expect(fresh.heat).toBeLessThan(50);
    expect(fresh.opposingField).toBeLessThan(50);
  });

  it("moderate heat alone does not latch", () => {
    const result = applyHeatTest(freshHeatTest(), 62, 90);
    expect(result.demagLatched).toBe(false);
  });

  it("moderate field alone does not latch", () => {
    const result = applyHeatTest(freshHeatTest(), 90, 68);
    expect(result.demagLatched).toBe(false);
  });
});

/* ─── Trade-off ─── */

describe("tradeoff", () => {
  it("three stops with monotonically increasing margin and decreasing retained field", () => {
    const levels = [0, 1, 2].map(dyTbTradeoff);
    for (let index = 1; index < levels.length; index++) {
      expect(levels[index].marginLength).toBeGreaterThan(levels[index - 1].marginLength);
      expect(levels[index].retainedLength).toBeLessThan(levels[index - 1].retainedLength);
    }
  });

  it("renders fresh comparison sample label at state 4", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "dy-tb-tradeoff" }),
    );
    expect(markup).toContain("Fresh comparison sample");
  });
});

/* ─── Finite motion ─── */

describe("finite motion", () => {
  it("CSS animations use 'forwards' fill and run once", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "remanence-strength" }),
    );
    // No perpetual animation indicators in the rendered output
    expect(markup).not.toContain("animation-iteration-count: infinite");
  });

  it("pause class is applied when paused", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "remanence-strength", paused: true }),
    );
    expect(markup).toContain("is-paused");
  });

  it("reduced-motion class disables all transitions", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "remanence-strength", reducedMotion: true }),
    );
    expect(markup).toContain("is-reduced-motion");
  });
});

/* ─── Labs ─── */

describe("labs", () => {
  it("GBD lab renders uniform and edge selection", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, {
        step: "dy-tb-tradeoff",
        initialLab: "grain-boundary-diffusion",
      }),
    );
    expect(markup).toContain("Uniform");
    expect(markup).toContain("Grain boundary");
    expect(markup).toContain("Run seed test");
    expect(markup).toContain("Back to magnet");
    expect(markup).toContain('data-lab="grain-boundary-diffusion"');
  });

  it("GBD reduced-motion shows both cells selected with seed tests", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, {
        step: "dy-tb-tradeoff",
        initialLab: "grain-boundary-diffusion",
        reducedMotion: true,
      }),
    );
    expect(markup).toContain("chapter3-grain-cell__seed-test");
    // Both cells should have is-selected class
    const selectedCount = (markup.match(/is-selected/g) ?? []).length;
    expect(selectedCount).toBeGreaterThanOrEqual(2);
  });

  it("cooling lab renders oil toggle, SmCo toggle, and qualified card", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, {
        step: "dy-tb-tradeoff",
        initialLab: "cooling-and-smco",
      }),
    );
    expect(markup).toContain("Show rotor oil cooling");
    expect(markup).toContain("Compare SmCo");
    expect(markup).toContain("does not prove Dy/Tb removal");
    expect(markup).toContain("Back to magnet");
    expect(markup).toContain('data-lab="cooling-and-smco"');
  });

  it("cooling lab reduced-motion shows SmCo card", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, {
        step: "dy-tb-tradeoff",
        initialLab: "cooling-and-smco",
        reducedMotion: true,
      }),
    );
    expect(markup).toContain("SmCo position");
    expect(markup).toContain("qualified");
    expect(markup).toContain("higher-temperature");
  });

  it("labs never change main progress", () => {
    for (const lab of chapter3Labs) {
      const opened = openLab(lab, "test");
      expect(opened.activeLab).toBe(lab);
      const closed = closeLab();
      expect(closed.activeLab).toBeNull();
    }
  });
});

/* ─── Key gate and focus ─── */

describe("key gate and focus", () => {
  it("Escape is a lab close key", () => {
    expect(isLabCloseKey("Escape")).toBe(true);
  });

  it("route navigation keys are blocked in labs", () => {
    expect(isLabRouteNavigationKey("ArrowRight")).toBe(true);
    expect(isLabRouteNavigationKey("ArrowLeft")).toBe(true);
    expect(isLabRouteNavigationKey("PageDown")).toBe(true);
    expect(isLabRouteNavigationKey("PageUp")).toBe(true);
    expect(isLabRouteNavigationKey("Home")).toBe(true);
    expect(isLabRouteNavigationKey("End")).toBe(true);
  });

  it("range input arrows are not blocked", () => {
    expect(isLabRouteNavigationKey("ArrowUp")).toBe(false);
    expect(isLabRouteNavigationKey("ArrowDown")).toBe(false);
  });

  it("Escape and Tab are not route navigation keys", () => {
    expect(isLabRouteNavigationKey("Escape")).toBe(false);
    expect(isLabRouteNavigationKey("Tab")).toBe(false);
  });

  it("data-route-lock is set when a lab is open", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, {
        step: "dy-tb-tradeoff",
        initialLab: "grain-boundary-diffusion",
      }),
    );
    expect(markup).toContain('data-route-lock="true"');
  });
});

/* ─── Hidden claims ─── */

describe("hidden claims", () => {
  it("no percentages in any scene markup", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(markup).not.toMatch(/\d+(?:\.\d+)?\s*%/);
    }
  });

  it("no universal threshold language", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(markup).not.toMatch(/universal threshold/i);
      expect(markup).not.toMatch(/150\s*[–-]\s*180/);
      expect(markup).not.toMatch(/0\.5\s*%/);
    }
  });

  it("no Audi-to-Dy inference in any scene", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(markup).not.toMatch(/Audi/i);
    }
    for (const lab of chapter3Labs) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, {
          step: "dy-tb-tradeoff",
          initialLab: lab,
        }),
      );
      expect(markup).not.toMatch(/Audi/i);
    }
  });

  it("no recipe or alloy percentages in lab markup", () => {
    for (const lab of chapter3Labs) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, {
          step: "dy-tb-tradeoff",
          initialLab: lab,
        }),
      );
      expect(markup).not.toMatch(/\d+(?:\.\d+)?\s*%/);
      expect(markup).not.toMatch(/recipe/i);
    }
  });
});

/* ─── Reduced motion ─── */

describe("reduced motion", () => {
  it("remanence reduced-motion shows helper removed and retained field end state", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "remanence-strength", reducedMotion: true }),
    );
    expect(markup).toContain("is-helper-off");
    expect(markup).toContain("is-retained");
    expect(markup).toContain("is-reduced-motion");
  });

  it("coercivity reduced-motion shows lower reversed", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "coercivity-lock", reducedMotion: true }),
    );
    expect(markup).toContain("is-reversed");
    const comparison = compareCoercivity(62);
    expect(comparison.lowerCoercivityReversed).toBe(true);
    expect(comparison.higherCoercivityReversed).toBe(false);
  });

  it("heat reduced-motion shows damage patch without aura", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "heat-demagnetisation", reducedMotion: true }),
    );
    expect(markup).toContain("chapter3-magnet-body__patch");
    expect(markup).toContain("A cooled magnet keeps a reversed patch");
  });

  it("tradeoff reduced-motion shows highest protection", () => {
    const markup = renderToStaticMarkup(
      createElement(Chapter3MagnetVisual, { step: "dy-tb-tradeoff", reducedMotion: true }),
    );
    expect(markup).toContain("chapter3-magnet-body__protection");
    expect(markup).toContain("More margin");
    expect(markup).toContain("Less field");
  });

  it("all controls disabled under reduced motion", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step, reducedMotion: true }),
      );
      // Range inputs should be disabled
      const rangeInputs = [...markup.matchAll(/<input[^>]*type="range"[^>]*>/g)];
      for (const input of rangeInputs) {
        expect(input[0]).toContain("disabled");
      }
    }
  });
});

/* ─── Unique SVG ids ─── */

describe("unique SVG ids", () => {
  it("creates unique marker IDs across multiple instances", () => {
    const markup = renderToStaticMarkup(
      createElement("div", null,
        createElement(Chapter3MagnetVisual, { step: "remanence-strength" }),
        createElement(Chapter3MagnetVisual, { step: "coercivity-lock" }),
        createElement(Chapter3MagnetVisual, { step: "heat-demagnetisation" }),
      ),
    );
    const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids.length).toBeGreaterThan(2);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* ─── No SVG text ─── */

describe("no SVG text", () => {
  it("no <text> elements in any scene SVG", () => {
    for (const step of chapter3MainRoute) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, { step }),
      );
      expect(markup).not.toContain("<text");
    }
    for (const lab of chapter3Labs) {
      const markup = renderToStaticMarkup(
        createElement(Chapter3MagnetVisual, {
          step: "dy-tb-tradeoff",
          initialLab: lab,
        }),
      );
      expect(markup).not.toContain("<text");
    }
  });
});

/* ─── Label budget ─── */

describe("label budget", () => {
  it("maximum two callouts per view", () => {
    for (const labels of Object.values(labelSpecsByView)) {
      expect(labels.length).toBeLessThanOrEqual(2);
    }
  });

  it("every label is short enough to avoid collision", () => {
    for (const labels of Object.values(labelSpecsByView)) {
      for (const label of labels) {
        expect(label.words).toBeLessThanOrEqual(2);
        expect(label.text.length).toBeLessThanOrEqual(14);
      }
    }
  });
});
