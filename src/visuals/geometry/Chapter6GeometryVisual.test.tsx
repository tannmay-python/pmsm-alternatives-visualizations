import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Chapter6GeometryVisual } from "./Chapter6GeometryVisual";
import {
  createInitialChapter6State,
  getCalloutsForState,
  isProhibitedText,
} from "./chapter6Geometry";

describe("Chapter6GeometryVisual", () => {
  it("keeps ferrite on the chemistry layer while retaining the PMSM", () => {
    const markup = renderToStaticMarkup(
      <Chapter6GeometryVisual step="ferrite-material-not-architecture" />,
    );

    expect(markup).toContain("PMSM");
    expect(markup).toContain('id="ferrite_rotor_base"');
    expect(markup).toContain("Magnet chemistry");
    expect(markup).toContain("Compensate with");
    expect(markup).not.toContain("coercivity ratio");
  });

  it("keeps geometry and magnet chemistry independently selectable", () => {
    const markup = renderToStaticMarkup(
      <Chapter6GeometryVisual step="axial-flux-geometry" />,
    );

    expect(markup).toContain('id="radial_cylinder_stator"');
    expect(markup).toContain('id="chemistry_tiles_ndfeb"');
    expect(markup).toContain("Flux direction");
    expect(markup).toContain("Magnet chemistry");
  });

  it("renders iron nitride as a multi-property qualification question", () => {
    const markup = renderToStaticMarkup(
      <Chapter6GeometryVisual step="iron-nitride-property-board" reducedMotion />,
    );

    expect(markup).toContain('id="fe16n2_magnet_sample"');
    expect(markup).toContain('id="property_dial_saturation"');
    expect(markup).toContain('id="property_dial_thermal_margin"');
    expect(markup).toContain("Check drop-in claim");
    expect(markup).not.toContain("strongest magnet");
  });

  it("uses five stackable builder dimensions and classifies contactless as wound-field excitation", () => {
    const markup = renderToStaticMarkup(
      <Chapter6GeometryVisual step="stackable-motor-builder" />,
    );

    expect(markup).toContain('id="assembled_motor_cross_section"');
    expect(markup).toContain("Torque");
    expect(markup).toContain("Excitation");
    expect(markup).toContain("Chemistry");
    expect(markup).toContain("Geometry");
    expect(markup).toContain("Winding");
    expect(markup).toContain("Volektra contactless wound field");
  });

  it("only reveals the Proterial figures as their complete speed-paired comparison", () => {
    const state = createInitialChapter6State("proterial-power-speed");
    state.operatingCondition = "shown";
    const labels = getCalloutsForState("proterial-power-speed", state).map(({ label }) => label);

    expect(labels).toEqual(["102 kW at 15,000 rpm", "110 kW at 10,000 rpm"]);
    expect(isProhibitedText("Ferrite is a motor architecture")).toBe(true);
    expect(isProhibitedText("Axial flux is a geometry choice.")).toBe(false);
  });
});
