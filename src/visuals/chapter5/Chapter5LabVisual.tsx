import { Drop, Pause, Play } from "@phosphor-icons/react";
import { useEffect, useId, useState } from "react";
import {
  CENTER,
  DEFAULT_CORE_ALTERNATIVE_STATE,
  MOTOR_RADIUS,
  ROTOR_RADIUS,
  describeArc,
  getCoreCallouts,
  isCoreAlternativeStepId,
  polarToCartesian,
  type CoreAlternativeStepId,
} from "./chapter5Geometry";
import "./chapter5Lab.css";

export type Chapter5LabVisualProps = {
  stepId: string;
  paused?: boolean;
  reducedMotion?: boolean;
  onNext?: () => void;
  onTogglePause?: () => void;
};

const normalizeStepId = (stepId: string): CoreAlternativeStepId =>
  isCoreAlternativeStepId(stepId) ? stepId : "induction-cage-lab";

const coilAngles = [0, 45, 90, 135, 180, 225, 270, 315];
const cageAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

function FieldArrow({ angle, colour = "cyan" }: { angle: number; colour?: "cyan" | "copper" }) {
  const end = polarToCartesian(CENTER.x, CENTER.y, 94, angle);
  return (
    <path
      className={`chapter5-lab__field-arrow chapter5-lab__field-arrow--${colour}`}
      d={`M ${CENTER.x} ${CENTER.y} L ${end.x} ${end.y}`}
      markerEnd={`url(#${colour}-arrow)`}
    />
  );
}

function InductionMechanism({ relativeSpeed, fieldAngle }: { relativeSpeed: number; fieldAngle: number }) {
  const lag = 18 + ((100 - relativeSpeed) * 0.26);
  const currentAngle = fieldAngle - lag;
  return (
    <g className="chapter5-lab__mechanism" data-mechanism="induction">
      <circle className="chapter5-lab__stator-shell" cx={CENTER.x} cy={CENTER.y} r={MOTOR_RADIUS} />
      <circle className="chapter5-lab__air-gap" cx={CENTER.x} cy={CENTER.y} r={164} />
      {coilAngles.map((angle) => {
        const point = polarToCartesian(CENTER.x, CENTER.y, 184, angle);
        return <circle key={angle} className="chapter5-lab__stator-coil" cx={point.x} cy={point.y} r="13" />;
      })}
      <circle className="chapter5-lab__rotor-surface" cx={CENTER.x} cy={CENTER.y} r={ROTOR_RADIUS} />
      {cageAngles.map((angle) => {
        const outer = polarToCartesian(CENTER.x, CENTER.y, 120, angle);
        const inner = polarToCartesian(CENTER.x, CENTER.y, 55, angle);
        return <path key={angle} className="chapter5-lab__cage-bar" d={`M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`} />;
      })}
      <circle className="chapter5-lab__shaft" cx={CENTER.x} cy={CENTER.y} r="31" />
      <path className="chapter5-lab__field-ring" d={describeArc(CENTER.x, CENTER.y, 148, fieldAngle - 46, fieldAngle + 46)} />
      <FieldArrow angle={fieldAngle} />
      <path
        className="chapter5-lab__induced-current"
        d={describeArc(CENTER.x, CENTER.y, 104, currentAngle - 38, currentAngle + 38)}
        markerEnd="url(#copper-arrow)"
      />
      <path
        className="chapter5-lab__torque-arc"
        d={describeArc(CENTER.x, CENTER.y, 83, fieldAngle + 66, fieldAngle + 135)}
        markerEnd="url(#cyan-arrow)"
      />
    </g>
  );
}

function WoundFieldMechanism({ excitation, oilCooling, fieldAngle }: { excitation: number; oilCooling: boolean; fieldAngle: number }) {
  const fieldLength = 42 + excitation * 0.72;
  const fieldEnd = polarToCartesian(CENTER.x, CENTER.y, fieldLength, fieldAngle);
  return (
    <g className="chapter5-lab__mechanism" data-mechanism="wound-field">
      <circle className="chapter5-lab__stator-shell" cx={CENTER.x} cy={CENTER.y} r={MOTOR_RADIUS} />
      <circle className="chapter5-lab__air-gap" cx={CENTER.x} cy={CENTER.y} r={164} />
      {coilAngles.map((angle) => {
        const point = polarToCartesian(CENTER.x, CENTER.y, 184, angle);
        return <circle key={angle} className="chapter5-lab__stator-coil" cx={point.x} cy={point.y} r="13" />;
      })}
      <circle className="chapter5-lab__rotor-surface" cx={CENTER.x} cy={CENTER.y} r={ROTOR_RADIUS} />
      <path className="chapter5-lab__winding" d="M404 248c30-42 72-58 96-58s66 16 96 58" />
      <path className="chapter5-lab__winding" d="M404 332c30 42 72 58 96 58s66-16 96-58" />
      <path className="chapter5-lab__winding" d="M458 176v228m84-228v228" />
      <rect className="chapter5-lab__dc-feed" x="480" y="242" width="40" height="96" rx="16" />
      <circle className="chapter5-lab__shaft" cx={CENTER.x} cy={CENTER.y} r="26" />
      <path className="chapter5-lab__field-ring" d={describeArc(CENTER.x, CENTER.y, 148, fieldAngle - 46, fieldAngle + 46)} />
      <path
        className="chapter5-lab__field-arrow chapter5-lab__field-arrow--copper"
        d={`M ${CENTER.x} ${CENTER.y} L ${fieldEnd.x} ${fieldEnd.y}`}
        markerEnd="url(#copper-arrow)"
      />
      <path className="chapter5-lab__cooling-channel" d="M500 128v324" />
      {oilCooling && [203, 253, 327, 377].map((cy) => <circle key={cy} className="chapter5-lab__oil-drop" cx="500" cy={cy} r="7" />)}
    </g>
  );
}

function PureSynrmMechanism({ powerFactor, fieldAngle }: { powerFactor: number; fieldAngle: number }) {
  const burden = Math.round(44 + ((1 - powerFactor) / 0.4) * 48);
  return (
    <g className="chapter5-lab__mechanism" data-mechanism="pure-synrm">
      <circle className="chapter5-lab__stator-shell" cx={CENTER.x} cy={CENTER.y} r={MOTOR_RADIUS} />
      <circle className="chapter5-lab__air-gap" cx={CENTER.x} cy={CENTER.y} r={164} />
      {coilAngles.map((angle) => {
        const point = polarToCartesian(CENTER.x, CENTER.y, 184, angle);
        return <circle key={angle} className="chapter5-lab__stator-coil" cx={point.x} cy={point.y} r="13" />;
      })}
      <path className="chapter5-lab__synrm-rotor" d="M398 290c0-70 45-123 102-123s102 53 102 123-45 123-102 123-102-53-102-123Z" />
      <path className="chapter5-lab__flux-barrier" d="M420 238c43 18 117 18 160 0" />
      <path className="chapter5-lab__flux-barrier" d="M420 290c43 18 117 18 160 0" />
      <path className="chapter5-lab__flux-barrier" d="M420 342c43 18 117 18 160 0" />
      <path className="chapter5-lab__easy-axis" d="M500 174v232" markerEnd="url(#cyan-arrow)" />
      <FieldArrow angle={fieldAngle} />
      <path className="chapter5-lab__field-ring" d={describeArc(CENTER.x, CENTER.y, 148, fieldAngle - 46, fieldAngle + 46)} />
      <g className="chapter5-lab__burden" aria-hidden="true">
        <rect x="745" y="235" width="126" height="28" rx="6" />
        <rect className="chapter5-lab__burden-fill" x="745" y="235" width={burden} height="28" rx="6" />
        <rect x="745" y="317" width="126" height="28" rx="6" />
        <rect className="chapter5-lab__wheel-output" x="745" y="317" width="72" height="28" rx="6" />
      </g>
    </g>
  );
}

export function Chapter5LabVisual({
  stepId,
  paused = false,
  reducedMotion = false,
  onNext,
  onTogglePause,
}: Chapter5LabVisualProps) {
  const activeStateId = normalizeStepId(stepId);
  const [relativeSpeed, setRelativeSpeed] = useState(DEFAULT_CORE_ALTERNATIVE_STATE.relativeSpeed);
  const [rotorExcitation, setRotorExcitation] = useState(DEFAULT_CORE_ALTERNATIVE_STATE.rotorExcitation);
  const [woundOilCooling, setWoundOilCooling] = useState(DEFAULT_CORE_ALTERNATIVE_STATE.woundOilCooling);
  const [powerFactor, setPowerFactor] = useState(DEFAULT_CORE_ALTERNATIVE_STATE.powerFactor);
  const [fieldAngle, setFieldAngle] = useState(0);
  const uid = useId().replace(/:/g, "");
  const isFrozen = reducedMotion || paused;
  const callouts = getCoreCallouts(activeStateId);

  useEffect(() => {
    setFieldAngle(0);
  }, [activeStateId]);

  const advanceField = () => {
    if (!reducedMotion) setFieldAngle((angle) => (angle + 72) % 360);
  };

  const playOrStep = () => {
    if (isFrozen && !reducedMotion) onTogglePause?.();
    advanceField();
  };

  const title = {
    "induction-cage-lab": "Induction motor: the lag makes rotor current",
    "wound-field-lab": "Wound-field EESM: current builds the rotor field",
    "pure-synrm-lab": "Pure SynRM: flux seeks the easy axis",
  }[activeStateId];

  return (
    <div className="chapter5-lab" data-core-alternative-state={activeStateId} data-reduced-motion={reducedMotion || undefined}>
      <div className="chapter5-lab__plot" role="group" aria-label={title} aria-describedby={`${uid}-summary`}>
        <svg className="chapter5-lab__svg" viewBox="0 0 1000 580" role="img" aria-label={title}>
          <defs>
            <marker id="cyan-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L8 4.5 0 9Z" /></marker>
            <marker id="copper-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L8 4.5 0 9Z" /></marker>
          </defs>
          {activeStateId === "induction-cage-lab" && <InductionMechanism relativeSpeed={relativeSpeed} fieldAngle={fieldAngle} />}
          {activeStateId === "wound-field-lab" && <WoundFieldMechanism excitation={rotorExcitation} oilCooling={woundOilCooling} fieldAngle={fieldAngle} />}
          {activeStateId === "pure-synrm-lab" && <PureSynrmMechanism powerFactor={powerFactor} fieldAngle={fieldAngle} />}
          {callouts.map((callout) => (
            <path
              key={callout.id}
              className={`chapter5-lab__callout-line chapter5-lab__callout-line--${callout.tone}`}
              d={`M ${callout.target.x} ${callout.target.y} L ${callout.target.x} 83 L ${callout.labelAt.x} 83`}
            />
          ))}
        </svg>
        <div className="chapter5-lab__callouts" aria-hidden="true">
          {callouts.map((callout) => (
            <span
              key={callout.id}
              className={`chapter5-lab__callout chapter5-lab__callout--${callout.tone}`}
              style={{ left: `${callout.labelAt.x / 10}%`, top: `${callout.labelAt.y / 5.8}%`, textAlign: callout.align }}
            >
              {callout.label}
            </span>
          ))}
        </div>
      </div>

      <div className="chapter5-lab__controls" aria-label="Mechanism controls">
        <button
          type="button"
          className="chapter5-lab__step-button"
          aria-label={isFrozen ? "Show the next field position" : "Advance field position"}
          disabled={reducedMotion}
          onClick={playOrStep}
        >
          {isFrozen ? <Play size={15} weight="fill" aria-hidden="true" /> : <Pause size={15} weight="fill" aria-hidden="true" />}
          <span>{isFrozen ? "Step field" : "Advance field"}</span>
        </button>

        {activeStateId === "induction-cage-lab" && (
          <label className="chapter5-lab__range-control">
            <span>Relative rotor speed</span>
            <input
              type="range"
              min="0"
              max="100"
              value={relativeSpeed}
              aria-valuetext={relativeSpeed < 35 ? "large relative speed" : relativeSpeed > 75 ? "small relative speed" : "medium relative speed"}
              onChange={(event) => setRelativeSpeed(Number(event.target.value))}
            />
          </label>
        )}

        {activeStateId === "wound-field-lab" && (
          <>
            <label className="chapter5-lab__range-control">
              <span>Rotor-field current</span>
              <input
                type="range"
                min="15"
                max="100"
                value={rotorExcitation}
                aria-valuetext={rotorExcitation < 45 ? "smaller rotor field" : rotorExcitation > 80 ? "stronger rotor field" : "medium rotor field"}
                onChange={(event) => setRotorExcitation(Number(event.target.value))}
              />
            </label>
            <button type="button" className="chapter5-lab__cooling-toggle" aria-pressed={woundOilCooling} onClick={() => setWoundOilCooling((value) => !value)}>
              <Drop size={16} weight="fill" aria-hidden="true" />
              <span>Oil cooling {woundOilCooling ? "on" : "off"}</span>
            </button>
          </>
        )}

        {activeStateId === "pure-synrm-lab" && (
          <label className="chapter5-lab__range-control">
            <span>Power factor</span>
            <input
              type="range"
              min="60"
              max="100"
              value={Math.round(powerFactor * 100)}
              aria-valuetext={powerFactor < 0.75 ? "lower power factor, more inverter and cooling burden for the same output" : "higher power factor, less inverter and cooling burden for the same output"}
              onChange={(event) => setPowerFactor(Number(event.target.value) / 100)}
            />
          </label>
        )}

        {onNext && <button type="button" className="chapter5-lab__next" onClick={onNext}>Next mechanism</button>}
      </div>

      <p className="sr-only" id={`${uid}-summary`}>
        {activeStateId === "induction-cage-lab" && "A rotating stator field lags a conductive cage, inducing rotor current and torque."}
        {activeStateId === "wound-field-lab" && "Current in rotor windings builds the field; the shaft can carry cooling oil."}
        {activeStateId === "pure-synrm-lab" && "Flux seeks the rotor easy axis through shaped barriers. Lower power factor can increase inverter and cooling burden for the same output."}
      </p>
    </div>
  );
}

export const AlternativeMotorCoreVisual = Chapter5LabVisual;
