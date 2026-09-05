import type { StageControls } from "../stage/controls";
import type { Stop, StopState } from "../route/route";

/**
 * Controls are chosen by what the current state asks the reader to do, so the
 * panel never shows a slider with nothing to move.
 */

export function Slider({
  label,
  value,
  onChange,
  low,
  high,
  readout,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  low: string;
  high: string;
  readout?: string;
}) {
  return (
    <div className="control">
      <p className="control__label">
        <span>{label}</span>
        {readout && <span className="control__value num">{readout}</span>}
      </p>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <div className="control__ends">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="control">
      <p className="control__label">
        <span>{label}</span>
      </p>
      <div className="seg" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={option.id === value ? "is-on" : ""}
            aria-pressed={option.id === value}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

import { MotorInspector } from "./MotorInspector";
import type { MotorComponentId } from "./MotorInspector";

export function Controls({
  stop,
  state,
  controls,
  setControls,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  setControls: (patch: Partial<StageControls>) => void;
}) {
  const set = (patch: Partial<StageControls>) => setControls(patch);
  const pct = (value: number) => `${Math.round(value * 100)}%`;
  const inspectorComponent: MotorComponentId =
    state.id === "housing" || state.id === "stator" || state.id === "rotor" || state.id === "shaft" || state.id === "air-gap"
      ? state.id
      : "all";

  return (
    <div className="controls">

      {stop.id === "open-the-machine" && (
        <MotorInspector component={inspectorComponent} controls={controls} setControls={setControls} />
      )}

      {stop.id === "three-coils-one-field" && state.id === "one-phase" && (
        <Segmented
          label="Energise one coil group"
          value={String(controls.activePhase ?? 0) as "0" | "1" | "2"}
          onChange={(value) => set({ activePhase: Number(value) })}
          options={[
            { id: "0", label: "Phase A (0°)" },
            { id: "1", label: "Phase B (120°)" },
            { id: "2", label: "Phase C (240°)" },
          ]}
        />
      )}

      {stop.id === "three-coils-one-field" && state.id === "no-part-moves" && (
        <Slider
          label="Inverter AC frequency (Speed)"
          value={(((controls.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)}
          onChange={(value) => set({ angle: value * Math.PI * 2 })}
          low="low RPM"
          high="high RPM"
          readout={`${Math.round(50 + ((((controls.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2)) * 350)} Hz`}
        />
      )}

      {stop.id === "three-coils-one-field" && state.id === "rotor-locks" && (
        <Slider
          label="Shaft load angle (δ)"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="coasting (0°)"
          high="hard pull (45°)"
          readout={controls.load < 0.34 ? "light drag" : controls.load > 0.66 ? "heavy load" : "moderate load"}
        />
      )}

      {stop.id === "two-pulls-one-shaft" && state.id === "why-buried" && (
        <Slider
          label="Rotor rotational speed"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="idle (800 RPM)"
          high="redline (20,000 RPM)"
          readout={`${Math.round(800 + controls.load * 19200)} RPM`}
        />
      )}

      {stop.id === "two-pulls-one-shaft" && state.id === "already-both" && (
        <Slider
          label="Motor cutaway inspection"
          value={controls.explode}
          onChange={(explode) => set({ explode })}
          low="assembled"
          high="exploded"
          readout={`${Math.round(controls.explode * 100)}%`}
        />
      )}

      {stop.id === "strength-and-stubbornness" && (state.id === "remanence" || state.id === "coercivity") && (
        <Slider
          label="Opposing stator current"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="0% (Rest)"
          high="100% (Peak Current)"
          readout={`${Math.round(controls.load * 100)}%`}
        />
      )}

      {stop.id === "strength-and-stubbornness" && state.id === "anisotropy" && (
        <Slider
          label="Opposing stator push"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="0% (Rest)"
          high="100% (Full Throttle)"
          readout={`${Math.round(controls.load * 100)}%`}
        />
      )}

      {stop.id === "heat-and-the-patch" && (state.id === "hot-margin" || state.id === "dysprosium-tradeoff") && (
        <>
          <Slider
            label="Rotor temperature"
            value={controls.heat}
            onChange={(heat) => set({ heat })}
            low="20 °C"
            high="180 °C"
            readout={`${Math.round(20 + controls.heat * 160)} °C`}
          />
          {state.id === "dysprosium-tradeoff" ? (
            <Slider
              label="Dysprosium content (Dy/Tb)"
              value={controls.dysprosium}
              onChange={(dysprosium) => set({ dysprosium })}
              low="0% (Standard)"
              high="6% (Heavy Doping)"
              readout={`${Math.round(controls.dysprosium * 6)}% Dy`}
            />
          ) : (
            <Slider
              label="Opposing stator field"
              value={controls.load}
              onChange={(load) => set({ load })}
              low="0%"
              high="100%"
              readout={`${Math.round(controls.load * 100)}%`}
            />
          )}
        </>
      )}

      {stop.id === "heat-and-the-patch" && (state.id === "reversal-start" || state.id === "diffusion-evolution") && (
        <Slider
          label="GBD shell diffusion depth"
          value={controls.diffusion}
          onChange={(diffusion) => set({ diffusion })}
          low="thin surface (10%)"
          high="deep boundary (100%)"
          readout={`${Math.round(controls.diffusion * 100)}%`}
        />
      )}

      {stop.id === "which-rare-earth" && (
        <Slider
          label="Mitigation rung"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="cool the rotor"
          high="new architecture"
          readout={["cooling", "GBD", "HREE-free", "new magnet", "new architecture"][
            Math.round(controls.load * 4)
          ]}
        />
      )}

      {stop.id === "the-weakness" && (
        <>
          <Slider
            label="Motor speed"
            value={controls.load}
            onChange={(load) => set({ load })}
            low="0 RPM (0 km/h)"
            high="18,000 RPM (160 km/h)"
            readout={`${Math.round(controls.load * 18000)} RPM (${Math.round(controls.load * 160)} km/h)`}
          />
          {(state.id === "field-weakening" || state.id === "fault") && (
            <Slider
              label="Field weakening counter-current"
              value={controls.weakening}
              onChange={(weakening) => set({ weakening })}
              low="0% (No Tax)"
              high="100% (Full Highway Tax)"
              readout={`${Math.round(controls.weakening * 100)}%`}
            />
          )}
        </>
      )}

      {stop.id === "change-the-magnet" && state.id === "ferrite-limit" && (
        <Slider
          label="Explode motor assembly"
          value={controls.explode}
          onChange={(explode) => set({ explode })}
          low="assembled"
          high="apart"
          readout={pct(controls.explode)}
        />
      )}

      {stop.id === "change-the-magnet" &&
        (state.id === "compensate-geometry" || state.id === "independent-geometry") && (
          <Slider
            label="Separate the discs"
            value={controls.explode}
            onChange={(explode) => set({ explode })}
            low="assembled"
            high="apart"
            readout={pct(controls.explode)}
          />
        )}

      {stop.id === "swap-the-rotor" && state.id !== "family-tree" && (
        <>
          <Slider
            label="Explode motor assembly"
            value={controls.explode}
            onChange={(explode) => set({ explode })}
            low="assembled"
            high="apart"
            readout={pct(controls.explode)}
          />
          <Slider
            label="Shaft load / torque"
            value={controls.load}
            onChange={(load) => set({ load })}
            low="coasting"
            high="hard pull"
            readout={`${Math.round(controls.load * 100)}%`}
          />
          <Segmented
            label="Inverter power"
            value={controls.fieldLive ? "on" : "off"}
            onChange={(value) => set({ fieldLive: value === "on" })}
            options={[
              { id: "on", label: "Driving" },
              { id: "off", label: "Power cut" },
            ]}
          />
        </>
      )}
    </div>
  );
}
