import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExposureOptionsVisual } from "./ExposureOptionsVisual";

const render = (stepId: Parameters<typeof ExposureOptionsVisual>[0]["stepId"], reducedMotion = false) =>
  renderToStaticMarkup(
    <ExposureOptionsVisual
      stepId={stepId}
      reducedMotion={reducedMotion}
      onSelectOptionalLab={() => {}}
      onReturnFromOptionalLab={() => {}}
    />,
  );

const expectTwoStageLabels = (markup: string) => {
  expect((markup.match(/data-stage-label="true"/g) ?? [])).toHaveLength(2);
  expect(markup).not.toContain("<text");
  expect(markup).not.toContain("linearGradient");
};

describe("ExposureOptionsVisual", () => {
  it("renders the supply split as two labelled lanes and a visual-only dated gate", () => {
    const markup = render("light-and-heavy-ree-supply");
    expect(markup).toContain('id="supply_ndpr"');
    expect(markup).toContain('id="supply_dytb"');
    expect(markup).toContain('id="supply_license_gate"');
    expect(markup).toContain('id="supply_main_field"');
    expect(markup).toContain('id="supply_reversal_boundary"');
    expect(markup).toContain("ND/PR");
    expect(markup).toContain("DY/TB");
    expect(markup).toContain("Select material group");
    expectTwoStageLabels(markup);
  });

  it("renders the intervention ladder with a qualitative drive-unit footprint", () => {
    const markup = render("mitigation-ladder");
    expect(markup).toContain('id="mitigation_ladder"');
    expect(markup).toContain('id="drive_unit_ghost"');
    expect(markup).toContain('id="change_footprint"');
    expect(markup).toContain("KEEPS MORE");
    expect(markup).toContain("CHANGES MORE");
    expect(markup).toContain("Choose intervention");
    expect(markup).toContain("HREE-free");
    expectTwoStageLabels(markup);
  });

  it("renders a qualitative back-EMF corridor without vehicle-specific units", () => {
    const markup = render("back-emf-speed-sweep");
    expect(markup).toContain('id="pmsm_rotor"');
    expect(markup).toContain('id="permanent_flux"');
    expect(markup).toContain('id="back_emf_trace"');
    expect(markup).toContain('id="dc_bus_ceiling"');
    expect(markup).toContain("BACK-EMF");
    expect(markup).toContain("DC BUS CEILING");
    expect(markup).toContain("Motor speed");
    expect(markup).not.toContain("RPM");
    expect(markup).not.toContain("Volts");
    expectTwoStageLabels(markup);
  });

  it("renders field weakening as an opposing vector relationship and quiet lab action", () => {
    const markup = render("field-weakening-current");
    expect(markup).toContain('id="pmsm_rotor"');
    expect(markup).toContain('id="permanent_flux"');
    expect(markup).toContain('id="counter_flux_current"');
    expect(markup).toContain('id="net_flux"');
    expect(markup).toContain("MAGNET FLUX");
    expect(markup).toContain("COUNTER-FLUX CURRENT");
    expect(markup).toContain("Go beyond base speed");
    expect(markup).toContain("Compare fault fields");
    expectTwoStageLabels(markup);
  });

  it("keeps the fault comparison optional, matched, and without a claimed fault outcome", () => {
    const markup = render("inverter-fault-at-speed");
    expect(markup).toContain('id="fault_pm_field"');
    expect(markup).toContain('id="fault_wound_field"');
    expect(markup).toContain('id="fault_generator_arrow"');
    expect(markup).toContain("FIELD REMAINS");
    expect(markup).toContain("FIELD FADES");
    expect(markup).toContain("Inverter fault");
    expect(markup).toContain("Back to field weakening");
    expect(markup).not.toContain("DC-link");
    expect(markup).not.toContain("braking torque");
    expectTwoStageLabels(markup);
  });

  it("renders a sparse, two-branch family tree with one unique node layer", () => {
    const markup = render("sync-async-family-tree");
    expect(markup).toContain('id="sync_branch"');
    expect(markup).toContain('id="async_branch"');
    expect((markup.match(/id="family_nodes"/g) ?? [])).toHaveLength(1);
    expect(markup).toContain('id="slip_marker"');
    expect(markup).toContain("IN STEP");
    expect(markup).toContain("SLIP");
    expect(markup).toContain("Inspect motor family");
    expect(markup).toContain("Induction");
    expectTwoStageLabels(markup);
  });

  it("supplies a fixed end frame in reduced-motion mode", () => {
    const markup = render("mitigation-ladder", true);
    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain("exposure-art__footprint--2");
    expect(markup).toContain("KEEPS MORE");
    expectTwoStageLabels(markup);
  });
});
