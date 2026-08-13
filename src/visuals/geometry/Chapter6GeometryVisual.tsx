import { useEffect, useId, useState, type Dispatch, type SetStateAction } from "react";
import {
  NAMED_EXAMPLE_PRESETS,
  PROPERTY_DEFINITIONS,
  createInitialChapter6State,
  getCalloutsForState,
  type BuilderChemistry,
  type BuilderExcitation,
  type BuilderGeometry,
  type BuilderTorquePrinciple,
  type BuilderWinding,
  type Chapter6StateTable,
  type Chapter6Step,
  type CompensationPath,
  type GeometryShape,
  type MagnetChemistry,
  type NamedExampleKey,
  type OperatingCondition,
  type SelectedProperty,
  type VFMSpeedMode,
  type VFMFluxControl,
} from "./chapter6Geometry";
import "./chapter6Geometry.css";

export type Chapter6GeometryVisualProps = {
  step: Chapter6Step;
  paused?: boolean;
  reducedMotion?: boolean;
};

const builderLabels: Readonly<Record<BuilderTorquePrinciple, string>> = {
  pm: "Permanent magnet",
  "wound-field": "Wound field",
  reluctance: "Reluctance",
  induction: "Induction",
  hybrid: "Hybrid",
};

const excitationLabels: Readonly<Record<BuilderExcitation, string>> = {
  ipm: "Buried magnets",
  spm: "Surface magnets",
  contactless: "Contactless field",
  brushed: "Brushed field",
  "salient-steel": "Salient steel",
};

const chemistryLabels: Readonly<Record<BuilderChemistry, string>> = {
  ndfeb: "NdFeB",
  ferrite: "Ferrite",
  "iron-nitride": "Iron nitride",
  none: "Magnet-free",
};

const geometryLabels: Readonly<Record<BuilderGeometry, string>> = {
  radial: "Radial flux",
  axial: "Axial flux",
};

const windingLabels: Readonly<Record<BuilderWinding, string>> = {
  copper: "Copper",
  aluminium: "Aluminium",
};

export function Chapter6GeometryVisual({
  step,
  paused = false,
  reducedMotion = false,
}: Chapter6GeometryVisualProps) {
  const [state, setState] = useState<Chapter6StateTable>(() =>
    createInitialChapter6State(step, reducedMotion),
  );
  const markerId = useId().replace(/:/g, "");

  useEffect(() => {
    setState((current) => ({ ...current, activeState: step, paused, reducedMotion }));
  }, [step, paused, reducedMotion]);

  const callouts = getCalloutsForState(state.activeState, state);
  const selectedProperty = PROPERTY_DEFINITIONS[state.selectedProperty];

  return (
    <section
      className={`ch6-stage ${state.reducedMotion || state.paused ? "is-still" : ""}`}
      data-step={state.activeState}
      aria-label="Chapter 6 interactive visual"
    >
      <header className="ch6-stage__header">
        <span>{state.activeState === "ferrite-material-not-architecture" ? "PMSM" : "Material and geometry"}</span>
        <span aria-live="polite">
          {state.activeState === "iron-nitride-property-board" ? selectedProperty.shortLabel : "Interactive model"}
        </span>
      </header>

      <div className="ch6-stage__scene">
        <svg
          className="ch6-stage__svg"
          viewBox="0 0 900 420"
          role="img"
          aria-label={sceneLabel(state.activeState, state)}
        >
          <defs>
            <marker id={`${markerId}-flux`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto">
              <path d="M0 0L8 4L0 8Z" className="ch6-arrow" />
            </marker>
          </defs>
          <g className="ch6-stage__grid" aria-hidden="true">
            {[120, 240, 360, 480, 600, 720, 840].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="420" />)}
            {[84, 168, 252, 336].map((y) => <line key={y} x1="0" y1={y} x2="900" y2={y} />)}
          </g>
          {state.activeState === "ferrite-material-not-architecture" ? <FerriteScene state={state} /> : null}
          {state.activeState === "axial-flux-geometry" ? <GeometryScene state={state} markerId={`${markerId}-flux`} /> : null}
          {state.activeState === "iron-nitride-property-board" ? <IronNitrideScene state={state} /> : null}
          {state.activeState === "stackable-motor-builder" ? <BuilderScene state={state} /> : null}
          {state.activeState === "proterial-power-speed" ? <ProterialScene state={state} /> : null}
          {state.activeState === "matter-variable-flux" ? <MatterScene state={state} markerId={`${markerId}-flux`} /> : null}
        </svg>

        <div className="ch6-stage__labels" aria-hidden="true">
          {callouts.map((callout) => (
            <span
              key={callout.label}
              className="ch6-stage__label"
              style={{ left: `${(callout.x / 900) * 100}%`, top: `${(callout.y / 420) * 100}%` }}
            >
              {callout.label}
            </span>
          ))}
        </div>
      </div>

      <div className="ch6-stage__dock">
        {state.activeState === "ferrite-material-not-architecture" ? (
          <FerriteControls state={state} onChange={setState} />
        ) : null}
        {state.activeState === "axial-flux-geometry" ? (
          <GeometryControls state={state} onChange={setState} />
        ) : null}
        {state.activeState === "iron-nitride-property-board" ? (
          <IronNitrideControls state={state} onChange={setState} />
        ) : null}
        {state.activeState === "stackable-motor-builder" ? (
          <BuilderControls state={state} onChange={setState} />
        ) : null}
        {state.activeState === "proterial-power-speed" ? (
          <ProterialControls state={state} onChange={setState} />
        ) : null}
        {state.activeState === "matter-variable-flux" ? (
          <MatterControls state={state} onChange={setState} />
        ) : null}
      </div>
    </section>
  );
}

function sceneLabel(step: Chapter6Step, state: Chapter6StateTable) {
  if (step === "ferrite-material-not-architecture") {
    return `${state.magnetChemistry === "ferrite" ? "Ferrite" : "NdFeB"} magnet blocks in the same PMSM rotor, with ${state.compensationPath} selected as a qualitative trade-off.`;
  }
  if (step === "axial-flux-geometry") {
    return `${state.geometryShape === "axial" ? "Axial disc" : "Radial cylinder"} geometry with independently selected ${state.magnetChemistry} magnets.`;
  }
  if (step === "iron-nitride-property-board") return "Iron nitride shown against five separate material qualification gates.";
  if (step === "stackable-motor-builder") return "A motor cross-section assembled from independent torque, excitation, chemistry, geometry, and winding choices.";
  if (step === "proterial-power-speed") return "Prototype power comparison, with speed conditions revealed only as a pair.";
  return "Exploratory variable-flux rotor model.";
}

function FerriteScene({ state }: { state: Chapter6StateTable }) {
  const ferrite = state.magnetChemistry === "ferrite";
  const expanded = state.compensationPath === "diameter";
  const rotorRadius = expanded ? 132 : 112;
  const statorRadius = expanded ? 180 : 155;

  return (
    <g id="ferrite_rotor_base" className="ch6-motor" transform="translate(450 218)">
      <circle r={statorRadius} className="ch6-steel ch6-steel--stator" />
      <circle r={rotorRadius} className="ch6-steel ch6-steel--rotor" />
      <circle r="34" className="ch6-shaft" />
      <g id={ferrite ? "magnet_blocks_ferrite" : "magnet_blocks_ndfeb"} className={ferrite ? "ch6-magnets is-ferrite" : "ch6-magnets"}>
        {[0, 90, 180, 270].map((rotation) => (
          <rect key={rotation} x="-22" y={-rotorRadius + 18} width="44" height="20" rx="3" transform={`rotate(${rotation})`} />
        ))}
      </g>
      <g id={ferrite ? "flux_lines_thin" : "flux_lines_dense"} className={ferrite ? "ch6-flux is-thin" : "ch6-flux"}>
        {[90, 112, 134].map((radius) => <circle key={radius} r={radius} />)}
      </g>
      {state.compensationPath === "diameter" ? (
        <g id="compensation_ghost_diameter" className="ch6-ghost"><circle r="194" /><line x1="-194" y1="0" x2="194" y2="0" /></g>
      ) : null}
      {state.compensationPath === "length" ? (
        <g id="compensation_ghost_length" className="ch6-ghost"><rect x="-160" y="-42" width="320" height="84" rx="10" /><line x1="-160" y1="66" x2="160" y2="66" /></g>
      ) : null}
      {state.compensationPath === "speed" ? (
        <g id="speed_marker" className="ch6-speed"><path d="M-145 -100A175 175 0 0 1 144 -100" />{[-132, -88, -44, 0, 44, 88, 132].map((x) => <line key={x} x1={x * 0.94} y1="-116" x2={x} y2="-132" />)}</g>
      ) : null}
    </g>
  );
}

function GeometryScene({ state, markerId }: { state: Chapter6StateTable; markerId: string }) {
  const axial = state.geometryShape === "axial";
  const ferrite = state.magnetChemistry === "ferrite";
  const tileClass = ferrite ? "ch6-chemistry-tile is-ferrite" : "ch6-chemistry-tile";

  return axial ? (
    <g className="ch6-geometry" transform="translate(450 210)">
      <ellipse id="axial_disc_stator" rx="212" ry="96" className="ch6-steel ch6-steel--stator" />
      <ellipse id="axial_disc_rotor" cy="-24" rx="170" ry="74" className="ch6-steel ch6-steel--rotor" />
      <circle r="29" className="ch6-shaft" />
      <g id="flux_vectors_axial" className="ch6-flux-vector" markerEnd={`url(#${markerId})`}>
        <line x1="-102" y1="-55" x2="-102" y2="53" /><line x1="102" y1="-55" x2="102" y2="53" />
      </g>
      <g id={ferrite ? "chemistry_tiles_ferrite" : "chemistry_tiles_ndfeb"} className={tileClass}><rect x="-94" y="-70" width="34" height="20" rx="3" /><rect x="60" y="-70" width="34" height="20" rx="3" /></g>
    </g>
  ) : (
    <g className="ch6-geometry" transform="translate(450 210)">
      <circle id="radial_cylinder_stator" r="160" className="ch6-steel ch6-steel--stator" />
      <circle id="radial_cylinder_rotor" r="110" className="ch6-steel ch6-steel--rotor" />
      <circle r="29" className="ch6-shaft" />
      <g id="flux_vectors_radial" className="ch6-flux-vector" markerEnd={`url(#${markerId})`}><line x1="0" y1="0" x2="138" y2="0" /><line x1="0" y1="0" x2="-138" y2="0" /></g>
      <g id={ferrite ? "chemistry_tiles_ferrite" : "chemistry_tiles_ndfeb"} className={tileClass}><rect x="-18" y="-96" width="36" height="22" rx="3" /><rect x="-18" y="74" width="36" height="22" rx="3" /></g>
    </g>
  );
}

function IronNitrideScene({ state }: { state: Chapter6StateTable }) {
  const selectedIndex = Object.keys(PROPERTY_DEFINITIONS).indexOf(state.selectedProperty);
  return (
    <g className="ch6-property-board">
      <rect id="fe16n2_magnet_sample" x="354" y="138" width="192" height="104" rx="9" className="ch6-iron-nitride" />
      <g className="ch6-property-gates" transform="translate(190 310)">
        {Object.keys(PROPERTY_DEFINITIONS).map((property, index) => {
          const x = index * 130;
          const active = index === selectedIndex;
          return <g key={property} id={`property_dial_${property.replace("-", "_")}`} className={active ? "is-active" : undefined}><circle cx={x} cy="0" r="29" /><line x1={x - 13} y1="0" x2={x + 13} y2="0" /></g>;
        })}
      </g>
      {state.dropInCheck ? (
        <g id="qualification_gate_checklist" className="ch6-qualification" transform="translate(190 350)">
          {[0, 1, 2, 3, 4].map((index) => <rect key={index} x={index * 130} y="0" width="58" height="18" rx="3" />)}
        </g>
      ) : null}
    </g>
  );
}

function BuilderScene({ state }: { state: Chapter6StateTable }) {
  const magnetClass = state.builderChemistry === "ferrite" ? "ch6-magnets is-ferrite" : state.builderChemistry === "iron-nitride" ? "ch6-magnets is-iron-nitride" : "ch6-magnets";
  const axial = state.builderGeometry === "axial";
  return (
    <g id="assembled_motor_cross_section" className="ch6-builder" transform="translate(450 208)">
      {axial ? <ellipse id="layer_geometry_shape" rx="174" ry="82" className="ch6-steel ch6-steel--stator" /> : <circle id="layer_geometry_shape" r="154" className="ch6-steel ch6-steel--stator" />}
      {axial ? <ellipse id="layer_stator_winding" rx="140" ry="62" className={state.builderWinding === "copper" ? "ch6-winding is-copper" : "ch6-winding"} /> : <circle id="layer_stator_winding" r="126" className={state.builderWinding === "copper" ? "ch6-winding is-copper" : "ch6-winding"} />}
      {axial ? <ellipse id="layer_rotor_excitation" rx="94" ry="39" className="ch6-steel ch6-steel--rotor" /> : <circle id="layer_rotor_excitation" r="88" className="ch6-steel ch6-steel--rotor" />}
      <circle id="layer_torque_principle" r="28" className="ch6-shaft" />
      {state.builderChemistry !== "none" ? <g id="layer_magnet_chemistry" className={magnetClass}><rect x="-18" y={axial ? "-40" : "-75"} width="36" height="19" rx="3" /><rect x="-18" y={axial ? "21" : "56"} width="36" height="19" rx="3" /></g> : <g id="layer_magnet_chemistry" className="ch6-no-magnet"><circle r="56" /></g>}
      <g className="ch6-builder-layer-key" aria-hidden="true"><line x1="-238" y1="-128" x2="-188" y2="-128" /><line x1="188" y1="128" x2="238" y2="128" /></g>
    </g>
  );
}

function ProterialScene({ state }: { state: Chapter6StateTable }) {
  const conditioned = state.operatingCondition === "shown";
  return (
    <g className="ch6-power-scene">
      <g id="power_bar_ferrite" transform="translate(250 286)"><rect x="0" y="-172" width="132" height="172" rx="6" className="ch6-power-frame" /><rect x="25" y="-132" width="82" height="132" rx="4" className="ch6-power-fill is-ferrite" />{conditioned ? <line id="rpm_scale_ferrite" x1="-22" y1="-132" x2="-22" y2="0" className="ch6-condition" /> : null}</g>
      <g id="power_bar_ndfeb" transform="translate(518 286)"><rect x="0" y="-172" width="132" height="172" rx="6" className="ch6-power-frame" /><rect x="25" y="-142" width="82" height="142" rx="4" className="ch6-power-fill" />{conditioned ? <line id="rpm_scale_ndfeb" x1="154" y1="-142" x2="154" y2="0" className="ch6-condition" /> : null}</g>
      <g id="condition_lock_icon" className={conditioned ? "ch6-condition-lock is-locked" : "ch6-condition-lock"} transform="translate(450 230)"><circle r="22" /><path d="M-8 0V-8a8 8 0 0 1 16 0V0M-10 0h20v16h-20z" /></g>
    </g>
  );
}

function MatterScene({ state, markerId }: { state: Chapter6StateTable; markerId: string }) {
  const cruise = state.vfmSpeedMode === "cruise";
  const variable = state.vfmFluxControl === "variable";
  return (
    <g transform="translate(450 210)">
      <circle id="vfm_rotor_core" r="142" className="ch6-steel ch6-steel--rotor" />
      <circle r="32" className="ch6-shaft" />
      <g id="vfm_magnet_domains" className={cruise ? "ch6-vfm-domains is-weakened" : "ch6-vfm-domains"}><rect x="-26" y="-108" width="52" height="24" rx="3" /><rect x="-26" y="84" width="52" height="24" rx="3" /></g>
      {cruise && variable ? <circle id="magnetizing_current_pulse" r="168" className="ch6-pulse" /> : null}
      {!variable ? <circle id="fixed_pmsm_contrast_ghost" r="174" className="ch6-fixed-ghost" /> : null}
      <g className="ch6-flux-vector" markerEnd={`url(#${markerId})`}><line x1="0" y1="-64" x2="0" y2={cruise ? "-34" : "-102"} /></g>
    </g>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return <fieldset className="ch6-control-group"><legend>{label}</legend><div className="ch6-segmented">{options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div></fieldset>;
}

function FerriteControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  return <div className="ch6-controls ch6-controls--simple"><Segmented<MagnetChemistry> label="Magnet chemistry" value={state.magnetChemistry} options={[{ value: "ndfeb", label: "NdFeB" }, { value: "ferrite", label: "Ferrite" }]} onChange={(magnetChemistry) => onChange((current) => ({ ...current, magnetChemistry }))} /><Segmented<CompensationPath> label="Compensate with" value={state.compensationPath} options={[{ value: "diameter", label: "Diameter" }, { value: "length", label: "Length" }, { value: "speed", label: "Speed" }]} onChange={(compensationPath) => onChange((current) => ({ ...current, compensationPath }))} /></div>;
}

function GeometryControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  return <div className="ch6-controls ch6-controls--simple"><Segmented<GeometryShape> label="Flux direction" value={state.geometryShape} options={[{ value: "radial", label: "Radial" }, { value: "axial", label: "Axial" }]} onChange={(geometryShape) => onChange((current) => ({ ...current, geometryShape }))} /><Segmented<MagnetChemistry> label="Magnet chemistry" value={state.magnetChemistry} options={[{ value: "ndfeb", label: "NdFeB" }, { value: "ferrite", label: "Ferrite" }]} onChange={(magnetChemistry) => onChange((current) => ({ ...current, magnetChemistry }))} /></div>;
}

function IronNitrideControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  return <div className="ch6-controls ch6-controls--simple"><label className="ch6-select-control"><span>Select property</span><select value={state.selectedProperty} onChange={(event) => onChange((current) => ({ ...current, selectedProperty: event.target.value as SelectedProperty }))}>{Object.values(PROPERTY_DEFINITIONS).map((property) => <option key={property.id} value={property.id}>{property.label}</option>)}</select></label><button type="button" className="ch6-qualification-toggle" aria-pressed={state.dropInCheck} onClick={() => onChange((current) => ({ ...current, dropInCheck: !current.dropInCheck }))}>{state.dropInCheck ? "Show one property" : "Check drop-in claim"}</button></div>;
}

function BuilderControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  const update = <Key extends keyof Chapter6StateTable>(key: Key, value: Chapter6StateTable[Key]) => onChange((current) => ({ ...current, [key]: value, selectedNamedExample: null }));
  const loadExample = (value: string) => {
    if (!value) return;
    const preset = NAMED_EXAMPLE_PRESETS[value as NamedExampleKey];
    onChange((current) => ({ ...current, builderTorquePrinciple: preset.torquePrinciple, builderExcitation: preset.excitation, builderChemistry: preset.chemistry, builderGeometry: preset.geometry, builderWinding: preset.winding, selectedNamedExample: preset.id }));
  };
  return <div className="ch6-builder-controls"><label className="ch6-select-control ch6-select-control--example"><span>Load a stack</span><select value={state.selectedNamedExample ?? ""} onChange={(event) => loadExample(event.target.value)}><option value="">Custom build</option>{Object.values(NAMED_EXAMPLE_PRESETS).map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}</select></label><div className="ch6-builder-grid"><CompactSelect label="Torque" value={state.builderTorquePrinciple} options={builderLabels} onChange={(value) => update("builderTorquePrinciple", value as BuilderTorquePrinciple)} /><CompactSelect label="Excitation" value={state.builderExcitation} options={excitationLabels} onChange={(value) => update("builderExcitation", value as BuilderExcitation)} /><CompactSelect label="Chemistry" value={state.builderChemistry} options={chemistryLabels} onChange={(value) => update("builderChemistry", value as BuilderChemistry)} /><CompactSelect label="Geometry" value={state.builderGeometry} options={geometryLabels} onChange={(value) => update("builderGeometry", value as BuilderGeometry)} /><CompactSelect label="Winding" value={state.builderWinding} options={windingLabels} onChange={(value) => update("builderWinding", value as BuilderWinding)} /></div></div>;
}

function CompactSelect({ label, value, options, onChange }: { label: string; value: string; options: Readonly<Record<string, string>>; onChange: (value: string) => void }) {
  return <label className="ch6-select-control"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{Object.entries(options).map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function ProterialControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  return <div className="ch6-controls ch6-controls--simple"><Segmented<OperatingCondition> label="Operating condition" value={state.operatingCondition} options={[{ value: "hidden", label: "Hide conditions" }, { value: "shown", label: "Show conditions" }]} onChange={(operatingCondition) => onChange((current) => ({ ...current, operatingCondition }))} /></div>;
}

function MatterControls({ state, onChange }: { state: Chapter6StateTable; onChange: Dispatch<SetStateAction<Chapter6StateTable>> }) {
  return <div className="ch6-controls ch6-controls--simple"><Segmented<VFMSpeedMode> label="Operating mode" value={state.vfmSpeedMode} options={[{ value: "launch", label: "Launch" }, { value: "cruise", label: "Cruise" }]} onChange={(vfmSpeedMode) => onChange((current) => ({ ...current, vfmSpeedMode }))} /><Segmented<VFMFluxControl> label="Control type" value={state.vfmFluxControl} options={[{ value: "fixed", label: "Fixed PMSM" }, { value: "variable", label: "Variable flux" }]} onChange={(vfmFluxControl) => onChange((current) => ({ ...current, vfmFluxControl }))} /></div>;
}
