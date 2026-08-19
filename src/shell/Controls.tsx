import { ROTORS, rotorList, type RotorId } from "../stage/rotors/registry";
import type { StageControls } from "../stage/controls";
import type { Stop, StopState } from "../route/route";

/**
 * Controls are chosen by what the current state asks the reader to do, so the
 * panel never shows a slider with nothing to move.
 */

function Slider({
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

export function RotorRack({
  rotor,
  onChange,
}: {
  rotor: RotorId;
  onChange: (id: RotorId) => void;
}) {
  const spec = ROTORS[rotor];
  return (
    <div className="control">
      <p className="control__label">
        <span>Fitted rotor</span>
        <span className="control__value">same housing, same stator</span>
      </p>
      <div className="rack" role="group" aria-label="Fitted rotor">
        {rotorList.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === rotor ? "is-on" : ""}
            aria-pressed={item.id === rotor}
            onClick={() => onChange(item.id)}
          >
            <span className="rack__name">{item.label}</span>
            <span className="rack__tag">
              {item.usesRareEarthMagnets ? "rare earth" : "none"}
            </span>
          </button>
        ))}
      </div>
      <dl className="rotor-facts">
        <div className="rotor-fact">
          <dt>Field</dt>
          <dd>{spec.howFieldIsMade}</dd>
        </div>
        <div className="rotor-fact">
          <dt>Power cut</dt>
          <dd>{spec.onPowerCut}</dd>
        </div>
        <div className="rotor-fact">
          <dt>Costs</dt>
          <dd>{spec.cost}</dd>
        </div>
      </dl>
    </div>
  );
}

export function Controls({
  stop,
  state,
  controls,
  setControls,
  rotor,
  setRotor,
}: {
  stop: Stop;
  state: StopState;
  controls: StageControls;
  setControls: (patch: Partial<StageControls>) => void;
  rotor: RotorId;
  setRotor: (id: RotorId) => void;
}) {
  const set = (patch: Partial<StageControls>) => setControls(patch);
  const pct = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="controls">
      {stop.id === "the-problem" && state.id === "the-motor-in-the-car" && (
        <Slider
          label="Pull the drive unit out"
          value={controls.extract}
          onChange={(extract) => set({ extract })}
          low="in the car"
          high="on the bench"
        />
      )}

      {stop.id === "where-the-motor-lives" && state.id === "drive-unit" && (
        <Slider
          label="Pull the drive unit out"
          value={controls.extract}
          onChange={(extract) => set({ extract })}
          low="in the car"
          high="on the bench"
        />
      )}

      {stop.id === "open-the-machine" && (
        <>
          <Slider
            label="Explode"
            value={controls.explode}
            onChange={(explode) => set({ explode })}
            low="assembled"
            high="apart"
            readout={pct(controls.explode)}
          />
          <Segmented
            label="Isolate"
            value={controls.isolate}
            onChange={(isolate) => set({ isolate })}
            options={[
              { id: "none", label: "Whole motor" },
              { id: "stator", label: "Stator only" },
              { id: "rotor", label: "Rotor only" },
            ]}
          />
        </>
      )}

      {stop.id === "three-coils-one-field" && (
        <>
          <Slider
            label="Electrical angle"
            value={controls.angle / (Math.PI * 2)}
            onChange={(value) => set({ angle: value * Math.PI * 2 })}
            low="0°"
            high="360°"
            readout={`${Math.round((controls.angle * 180) / Math.PI)}°`}
          />
          {state.id === "one-phase" && (
            <Segmented
              label="Energise one group"
              value={String(controls.activePhase ?? 0) as "0" | "1" | "2"}
              onChange={(value) => set({ activePhase: Number(value) })}
              options={[
                { id: "0", label: "Group A" },
                { id: "1", label: "Group B" },
                { id: "2", label: "Group C" },
              ]}
            />
          )}
        </>
      )}

      {stop.id === "two-pulls-one-shaft" && (
        <Slider
          label="Shaft load"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="coasting"
          high="hard pull"
          readout={controls.load < 0.34 ? "light" : controls.load > 0.66 ? "heavy" : "moderate"}
        />
      )}

      {(stop.id === "strength-and-stubbornness" || stop.id === "heat-and-the-patch") && (
        <>
          <Slider
            label="Rotor temperature"
            value={controls.heat}
            onChange={(heat) => set({ heat })}
            low="20 °C"
            high="180 °C"
            readout={`${Math.round(20 + controls.heat * 160)} °C`}
          />
          <Slider
            label="Opposing stator field"
            value={controls.load}
            onChange={(load) => set({ load })}
            low="cruising"
            high="hard acceleration"
          />
        </>
      )}

      {stop.id === "which-rare-earth" && (
        <Slider
          label="Mitigation rung"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="cool the rotor"
          high="new architecture"
          readout={`${Math.min(5, Math.round(controls.load * 4) + 1)} of 5`}
        />
      )}

      {stop.id === "the-weakness" && (
        <Slider
          label="Rotor speed"
          value={controls.load}
          onChange={(load) => set({ load })}
          low="standstill"
          high="motorway"
          readout={`${Math.round(controls.load * 100)}%`}
        />
      )}

      {stop.id === "swap-the-rotor" && (
        <>
          <RotorRack rotor={rotor} onChange={setRotor} />
          <Slider
            label="Shaft load"
            value={controls.load}
            onChange={(load) => set({ load })}
            low="coasting"
            high="hard pull"
          />
          <Segmented
            label="Inverter"
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
