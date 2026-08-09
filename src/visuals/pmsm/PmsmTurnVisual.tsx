import { useEffect, useId, useMemo, useRef, useState } from "react";
import "./pmsmTurn.css";
import {
  fieldDuration,
  getBalancedPhaseStrengths,
  loadAngle,
  phaseVisualOpacity,
  stableSyncNote,
  torqueIsVisible,
  type BuriedFocus,
  type FieldSpeed,
  type LoadLevel,
  type PmsmTurnStep,
  type StatorFocus,
  type TorqueFocus,
} from "./pmsmTurnGeometry";

export type { PmsmTurnStep } from "./pmsmTurnGeometry";

type PmsmTurnVisualProps = {
  step: PmsmTurnStep;
  paused?: boolean;
  reducedMotion?: boolean;
};

type Tone = "field" | "copper" | "magnet" | "steel" | "amber";

type MarkerIds = Record<Tone, string>;

const CENTER = { x: 500, y: 340 };
const MOTOR_RADIUS = 248;

const COLORS: Record<Tone, string> = {
  field: "#4fa3be",
  copper: "#c4763f",
  magnet: "#7e7bd8",
  steel: "#c9d0d4",
  amber: "#e3b34c",
};

const polar = (radius: number, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: CENTER.x + Math.cos(radians) * radius,
    y: CENTER.y + Math.sin(radians) * radius,
  };
};

function ArrowMarkers({ ids }: { ids: MarkerIds }) {
  return (
    <defs>
      {(Object.keys(ids) as Tone[]).map((tone) => (
        <marker
          key={tone}
          id={ids[tone]}
          markerWidth="9"
          markerHeight="9"
          refX="7.4"
          refY="4.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0 0 L 8 4.5 L 0 9 z" fill={COLORS[tone]} />
        </marker>
      ))}
    </defs>
  );
}

function Callout({
  label,
  target,
  labelAt,
  tone = "steel",
  align = "start",
}: {
  label: string;
  target: { x: number; y: number };
  labelAt: { x: number; y: number };
  tone?: Tone;
  align?: "start" | "middle" | "end";
}) {
  const direction = labelAt.x >= target.x ? 1 : -1;
  const elbowX = target.x + direction * Math.min(64, Math.abs(labelAt.x - target.x) * 0.48);
  const labelEdge = align === "end" ? labelAt.x - 7 : align === "start" ? labelAt.x + 7 : labelAt.x;

  return (
    <g className={`pmsm-turn__callout is-${tone}`} aria-hidden="true">
      <circle cx={target.x} cy={target.y} r="3.5" />
      <path d={`M ${target.x} ${target.y} L ${elbowX} ${target.y} L ${elbowX} ${labelAt.y - 6} L ${labelEdge} ${labelAt.y - 6}`} />
      <text x={labelAt.x} y={labelAt.y} textAnchor={align}>
        {label}
      </text>
    </g>
  );
}

/**
 * A small fixed colour key for a moving scene. Unlike a leader line it never
 * loses its subject as the vectors rotate around the motor.
 */
function KeyLabel({
  label,
  at,
  tone,
}: {
  label: string;
  at: { x: number; y: number };
  tone: Tone;
}) {
  return (
    <g className={`pmsm-turn__key-label is-${tone}`} aria-hidden="true">
      <circle cx={at.x} cy={at.y - 5} r="4" />
      <text x={at.x + 12} y={at.y}>
        {label}
      </text>
    </g>
  );
}

function StageControl({
  label,
  value,
  options,
  onChange,
  note,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  note?: string;
}) {
  return (
    <div className="pmsm-turn__control-wrap">
      <div className="pmsm-turn__control" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              className={selected ? "is-selected" : undefined}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {note ? <p>{note}</p> : null}
    </div>
  );
}

function Stator({
  focus = "both",
  phases = false,
  speed = "slow",
  animatePhases = true,
}: {
  focus?: StatorFocus;
  phases?: boolean;
  speed?: FieldSpeed;
  animatePhases?: boolean;
}) {
  const strengths = useMemo(() => getBalancedPhaseStrengths(18), []);
  const duration = fieldDuration(speed);
  const statorOpacity = focus === "rotor" ? 0.16 : 1;

  return (
    <g className="pmsm-turn__stator" opacity={statorOpacity}>
      <circle cx={CENTER.x} cy={CENTER.y} r={MOTOR_RADIUS} className="pmsm-turn__stator-outer" />
      <circle cx={CENTER.x} cy={CENTER.y} r="190" className="pmsm-turn__stator-inner" />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index * 30;
        const phase = index % 3;
        const strength = strengths[phase];
        const phaseDelay = -(phase * duration) / 3;
        return (
          <g key={angle} transform={`rotate(${angle} ${CENTER.x} ${CENTER.y})`}>
            <g
              transform={`translate(${CENTER.x} ${CENTER.y - 218})`}
              className={phases ? `pmsm-turn__phase pmsm-turn__phase--${phase}` : undefined}
            >
              <rect x="-18" y="-22" width="36" height="44" rx="5" className="pmsm-turn__coil" />
              {phases ? (
                <PhaseMark
                  strength={strength}
                  animate={animatePhases}
                  duration={duration}
                  delay={phaseDelay}
                />
              ) : null}
            </g>
          </g>
        );
      })}
      <circle cx={CENTER.x} cy={CENTER.y} r="164" className="pmsm-turn__air-gap" />
      {Array.from({ length: 12 }, (_, index) => {
        const pointA = polar(190, index * 30);
        const pointB = polar(205, index * 30);
        return (
          <line
            key={`tooth-${index}`}
            x1={pointA.x}
            y1={pointA.y}
            x2={pointB.x}
            y2={pointB.y}
            className="pmsm-turn__tooth"
          />
        );
      })}
    </g>
  );
}

function PhaseMark({
  strength,
  animate,
  duration,
  delay,
}: {
  strength: number;
  animate: boolean;
  duration: number;
  delay: number;
}) {
  const staticPositive = strength >= 0;
  const timing = {
    dur: `${duration}s`,
    begin: `${delay}s`,
    repeatCount: "indefinite",
    calcMode: "spline" as const,
    keyTimes: "0;0.17;0.33;0.5;0.67;0.83;1",
    keySplines: "0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1",
  };

  return (
    <g className="pmsm-turn__phase-mark">
      <circle r="5.6" opacity={staticPositive ? phaseVisualOpacity(strength) : 0}>
        {animate ? (
          <animate
            attributeName="opacity"
            values="1;0.74;0.25;0;0.25;0.74;1"
            {...timing}
          />
        ) : null}
      </circle>
      <g opacity={staticPositive ? 0 : phaseVisualOpacity(strength)}>
        {animate ? (
          <animate
            attributeName="opacity"
            values="0;0;0.25;1;0.25;0;0"
            {...timing}
          />
        ) : null}
        <line x1="-6" y1="-6" x2="6" y2="6" />
        <line x1="6" y1="-6" x2="-6" y2="6" />
      </g>
    </g>
  );
}

function QuietRotor({
  angle = 0,
  opacity = 1,
  showPole = false,
  animate = false,
  duration = 6,
}: {
  angle?: number;
  opacity?: number;
  showPole?: boolean;
  animate?: boolean;
  duration?: number;
}) {
  return (
    <g transform={`rotate(${angle} ${CENTER.x} ${CENTER.y})`} opacity={opacity}>
      <g className={animate ? "pmsm-turn__rotor-motion" : undefined}>
        {animate ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${CENTER.x} ${CENTER.y}`}
            to={`360 ${CENTER.x} ${CENTER.y}`}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        ) : null}
        <circle cx={CENTER.x} cy={CENTER.y} r="138" className="pmsm-turn__rotor-core" />
        <circle cx={CENTER.x} cy={CENTER.y} r="40" className="pmsm-turn__shaft" />
        {Array.from({ length: 4 }, (_, index) => (
          <g key={index} transform={`rotate(${index * 90} ${CENTER.x} ${CENTER.y})`}>
            <path
              d={`M ${CENTER.x - 34} ${CENTER.y - 127} Q ${CENTER.x} ${CENTER.y - 158} ${CENTER.x + 34} ${CENTER.y - 127} L ${CENTER.x + 50} ${CENTER.y - 76} Q ${CENTER.x} ${CENTER.y - 58} ${CENTER.x - 50} ${CENTER.y - 76} Z`}
              className="pmsm-turn__rotor-lobe"
            />
          </g>
        ))}
        <line
          x1={CENTER.x}
          y1={CENTER.y - 125}
          x2={CENTER.x}
          y2={CENTER.y - 76}
          className={showPole ? "pmsm-turn__pole-mark is-visible" : "pmsm-turn__pole-mark"}
        />
      </g>
    </g>
  );
}

function FieldArrow({
  angle,
  markerId,
  animate = false,
  duration = 5.6,
  className,
}: {
  angle: number;
  markerId: string;
  animate?: boolean;
  duration?: number;
  className?: string;
}) {
  const end = polar(170, angle);
  return (
    <g className={className}>
      {animate ? (
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${CENTER.x} ${CENTER.y}`}
          to={`360 ${CENTER.x} ${CENTER.y}`}
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      ) : null}
      <line
        x1={CENTER.x}
        y1={CENTER.y}
        x2={end.x}
        y2={end.y}
        className="pmsm-turn__field-vector"
        markerEnd={`url(#${markerId})`}
      />
      <circle cx={CENTER.x} cy={CENTER.y} r="7" className="pmsm-turn__field-origin" />
    </g>
  );
}

function PoleVector({ angle, markerId }: { angle: number; markerId: string }) {
  const end = polar(142, angle);
  return (
    <line
      x1={CENTER.x}
      y1={CENTER.y}
      x2={end.x}
      y2={end.y}
      className="pmsm-turn__pole-vector"
      markerEnd={`url(#${markerId})`}
    />
  );
}

function IPMRotor({
  focus,
  torqueFocus,
  markerIds,
}: {
  focus?: BuriedFocus;
  torqueFocus?: TorqueFocus;
  markerIds: MarkerIds;
}) {
  const showRetention = focus === "retention";
  const showPaths = focus === "paths";
  const showMagnet = torqueFocus ? torqueIsVisible(torqueFocus, "magnet") : true;
  const showSteel = torqueFocus ? torqueIsVisible(torqueFocus, "steel") : true;
  const rotorOpacity = torqueFocus === "magnet" ? 0.64 : 1;
  const useSinglePairFocus = showRetention || showPaths;

  return (
    <g className="pmsm-turn__ipm-rotor" opacity={rotorOpacity}>
      <circle cx={CENTER.x} cy={CENTER.y} r="238" className="pmsm-turn__ipm-shell" />
      <circle cx={CENTER.x} cy={CENTER.y} r="44" className="pmsm-turn__shaft" />
      {Array.from({ length: 4 }, (_, index) => (
        <g
          key={index}
          transform={`rotate(${index * 90} ${CENTER.x} ${CENTER.y})`}
          opacity={useSinglePairFocus && index !== 0 ? 0.22 : 1}
        >
          <path
            d={`M ${CENTER.x - 128} ${CENTER.y - 187} Q ${CENTER.x} ${CENTER.y - 237} ${CENTER.x + 128} ${CENTER.y - 187} L ${CENTER.x + 104} ${CENTER.y - 76} Q ${CENTER.x} ${CENTER.y - 101} ${CENTER.x - 104} ${CENTER.y - 76} Z`}
            className={showPaths && index === 0 ? "pmsm-turn__ipm-steel is-path-focus" : "pmsm-turn__ipm-steel"}
          />
          <path
            d={`M ${CENTER.x - 88} ${CENTER.y - 174} Q ${CENTER.x} ${CENTER.y - 207} ${CENTER.x + 88} ${CENTER.y - 174}`}
            className="pmsm-turn__flux-barrier"
          />
          <g opacity={showMagnet ? 1 : 0.12} className="pmsm-turn__magnet-pair">
            <rect
              x={CENTER.x - 64}
              y={CENTER.y - 170}
              width="28"
              height="92"
              rx="5"
              transform={`rotate(-24 ${CENTER.x - 50} ${CENTER.y - 124})`}
            />
            <rect
              x={CENTER.x + 36}
              y={CENTER.y - 170}
              width="28"
              height="92"
              rx="5"
              transform={`rotate(24 ${CENTER.x + 50} ${CENTER.y - 124})`}
            />
          </g>
          <rect
            x={CENTER.x - 48}
            y={CENTER.y - 239}
            width="96"
            height="22"
            rx="5"
            className={showRetention && index === 0 ? "pmsm-turn__steel-bridge is-highlighted" : "pmsm-turn__steel-bridge"}
          />
          {showRetention && index === 0 ? (
            <g className="pmsm-turn__centrifugal" aria-hidden="true">
              <line
                x1={CENTER.x - 54}
                y1={CENTER.y - 121}
                x2={CENTER.x - 89}
                y2={CENTER.y - 196}
                markerEnd={`url(#${markerIds.amber})`}
              />
              <line
                x1={CENTER.x + 54}
                y1={CENTER.y - 121}
                x2={CENTER.x + 89}
                y2={CENTER.y - 196}
                markerEnd={`url(#${markerIds.amber})`}
              />
            </g>
          ) : null}
        </g>
      ))}
      {showPaths ? (
        <g className="pmsm-turn__path-view" opacity={showSteel ? 1 : 0.16}>
          <line x1="500" y1="146" x2="500" y2="530" className="pmsm-turn__easy-axis" />
        </g>
      ) : null}
    </g>
  );
}

function TorqueVector({
  kind,
  markerId,
  visible,
}: {
  kind: "magnet" | "steel";
  markerId: string;
  visible: boolean;
}) {
  const isMagnet = kind === "magnet";
  const path = isMagnet
    ? "M 626 202 C 630 264 586 315 540 334"
    : "M 374 202 C 370 264 414 315 460 334";

  return (
    <path
      d={path}
      className={`pmsm-turn__torque-vector pmsm-turn__torque-vector--${kind}`}
      markerEnd={`url(#${markerId})`}
      opacity={visible ? 1 : 0.12}
    />
  );
}

function AssembleScene({
  markerIds,
  focus,
}: {
  markerIds: MarkerIds;
  focus: StatorFocus;
}) {
  const rotorOpacity = focus === "stator" ? 0.16 : 1;
  const labels =
    focus === "stator"
      ? [
          <Callout key="stator" label="Stator stays still" target={polar(235, -112)} labelAt={{ x: 300, y: 96 }} align="end" />,
          <Callout key="gap" label="Air gap" target={polar(165, 20)} labelAt={{ x: 757, y: 314 }} tone="amber" />,
        ]
      : focus === "rotor"
        ? [
            <Callout key="rotor" label="Rotor turns" target={polar(128, 10)} labelAt={{ x: 738, y: 458 }} align="start" tone="steel" />,
            <Callout key="shaft" label="Shaft" target={{ x: CENTER.x, y: CENTER.y + 39 }} labelAt={{ x: 502, y: 585 }} align="middle" />,
          ]
        : [
            <Callout key="stator" label="Stator stays still" target={polar(235, -112)} labelAt={{ x: 300, y: 96 }} align="end" />,
            <Callout key="rotor" label="Rotor turns" target={polar(128, 10)} labelAt={{ x: 738, y: 458 }} tone="steel" />,
          ];

  return (
    <>
      <Stator focus={focus} />
      <QuietRotor opacity={rotorOpacity} />
      <path
        d="M 392 475 A 128 128 0 0 0 582 462"
        className="pmsm-turn__rotation-hint"
        markerEnd={`url(#${markerIds.steel})`}
        opacity={rotorOpacity}
      />
      {labels}
    </>
  );
}

function FieldScene({
  markerIds,
  speed,
  still,
}: {
  markerIds: MarkerIds;
  speed: FieldSpeed;
  still: boolean;
}) {
  const duration = fieldDuration(speed);
  return (
    <>
      <Stator phases speed={speed} animatePhases={!still} />
      <circle cx={CENTER.x} cy={CENTER.y} r="145" className="pmsm-turn__empty-bore" />
      <circle cx={CENTER.x} cy={CENTER.y} r="183" className="pmsm-turn__field-track" />
      <FieldArrow
        angle={-48}
        markerId={markerIds.field}
        animate={!still}
        duration={duration}
        className="pmsm-turn__field-motion"
      />
      {still ? (
        <g className="pmsm-turn__field-ghosts" aria-hidden="true">
          <FieldArrow angle={-112} markerId={markerIds.field} />
          <FieldArrow angle={-80} markerId={markerIds.field} />
        </g>
      ) : null}
      <Callout label="Copper stays still" target={polar(221, 154)} labelAt={{ x: 218, y: 488 }} align="end" tone="copper" />
      <Callout label="Magnetic push moves" target={polar(172, -48)} labelAt={{ x: 724, y: 162 }} tone="field" />
    </>
  );
}

function SyncScene({
  markerIds,
  load,
  still,
}: {
  markerIds: MarkerIds;
  load: LoadLevel;
  still: boolean;
}) {
  const lag = loadAngle(load);
  const fieldAngle = -48;
  const rotorAngle = fieldAngle + lag;
  const fieldEnd = polar(174, fieldAngle);
  const rotorEnd = polar(141, rotorAngle);
  // The rotor group below already carries the fixed load-angle rotation.
  // Keep this arrow in the field frame so it is rotated exactly once.
  const loadStart = polar(156, fieldAngle + 90);
  const loadEnd = polar(198, fieldAngle + 90);

  return (
    <>
      <Stator phases speed="slow" animatePhases={!still} />
      <g>
        {!still ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${CENTER.x} ${CENTER.y}`}
            to={`360 ${CENTER.x} ${CENTER.y}`}
            dur="5.6s"
            repeatCount="indefinite"
          />
        ) : null}
        <FieldArrow angle={fieldAngle} markerId={markerIds.field} />
        <path
          d={`M ${CENTER.x} ${CENTER.y} L ${fieldEnd.x} ${fieldEnd.y} A 98 98 0 0 1 ${rotorEnd.x} ${rotorEnd.y} Z`}
          className="pmsm-turn__load-gap"
        />
      </g>
      <g transform={`rotate(${lag} ${CENTER.x} ${CENTER.y})`}>
        <g>
          {!still ? (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CENTER.x} ${CENTER.y}`}
              to={`360 ${CENTER.x} ${CENTER.y}`}
              dur="5.6s"
              repeatCount="indefinite"
            />
          ) : null}
          <QuietRotor angle={fieldAngle} showPole />
          <PoleVector angle={fieldAngle} markerId={markerIds.magnet} />
          <line
            x1={loadStart.x}
            y1={loadStart.y}
            x2={loadEnd.x}
            y2={loadEnd.y}
            className="pmsm-turn__load-arrow"
            markerEnd={`url(#${markerIds.amber})`}
          />
        </g>
      </g>
      <KeyLabel label="Field leads" at={{ x: 716, y: 158 }} tone="field" />
      <KeyLabel label="Rotor follows" at={{ x: 716, y: 188 }} tone="magnet" />
    </>
  );
}

function BuriedScene({
  markerIds,
  focus,
}: {
  markerIds: MarkerIds;
  focus: BuriedFocus;
}) {
  const retention = focus === "retention";
  return (
    <>
      <IPMRotor focus={focus} markerIds={markerIds} />
      <circle cx={CENTER.x} cy={CENTER.y} r="270" className="pmsm-turn__cutaway-frame" />
      {retention ? (
        <>
          <Callout label="Steel bridge holds it in" target={{ x: 500, y: 101 }} labelAt={{ x: 500, y: 58 }} align="middle" tone="steel" />
          <Callout label="Force pushes out" target={{ x: 450, y: 206 }} labelAt={{ x: 228, y: 206 }} align="end" tone="amber" />
        </>
      ) : (
        <>
          <Callout label="Steel is the easier route" target={{ x: 414, y: 195 }} labelAt={{ x: 218, y: 218 }} align="end" tone="field" />
          <Callout
            label="Shape makes an easy direction"
            target={{ x: 598, y: 175 }}
            labelAt={{ x: 660, y: 54 }}
            align="middle"
            tone="steel"
          />
        </>
      )}
    </>
  );
}

function TorqueScene({
  markerIds,
  focus,
}: {
  markerIds: MarkerIds;
  focus: TorqueFocus;
}) {
  const showMagnet = torqueIsVisible(focus, "magnet");
  const showSteel = torqueIsVisible(focus, "steel");
  return (
    <>
      <IPMRotor focus="paths" torqueFocus={focus} markerIds={markerIds} />
      <FieldArrow angle={-52} markerId={markerIds.field} />
      {showMagnet ? <PoleVector angle={-82} markerId={markerIds.magnet} /> : null}
      <TorqueVector kind="magnet" markerId={markerIds.magnet} visible={showMagnet} />
      <TorqueVector kind="steel" markerId={markerIds.field} visible={showSteel} />
      <circle cx={CENTER.x} cy={CENTER.y} r="54" className="pmsm-turn__shaft is-main" />
      {showMagnet ? (
        <Callout label="Magnet direction" target={polar(140, -82)} labelAt={{ x: 742, y: 264 }} tone="magnet" />
      ) : null}
      {showSteel ? (
        <Callout label="Easy steel direction" target={{ x: 500, y: 188 }} labelAt={{ x: 224, y: 438 }} align="end" tone="field" />
      ) : null}
    </>
  );
}

function sceneDescription(step: PmsmTurnStep, load: LoadLevel, focus: TorqueFocus): string {
  switch (step) {
    case "assemble":
      return "A motor cross-section with a stationary stator ring, air gap and quiet rotor.";
    case "field":
      return "An empty stator ring where three copper winding groups vary together and a magnetic field rotates.";
    case "sync":
      return `${stableSyncNote(load)} The illustrated motor is inside the stable range.`;
    case "buried":
      return "An enlarged interior permanent magnet rotor showing retention bridges and shaped magnetic paths.";
    case "torques":
      return focus === "both"
        ? "Magnet pull and steel alignment are both shown acting on one shaft."
        : `${focus === "magnet" ? "Magnet pull" : "Steel alignment"} is isolated on the same shaft.`;
  }
}

export function PmsmTurnVisual({
  step,
  paused = false,
  reducedMotion = false,
}: PmsmTurnVisualProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const markerIds = useMemo<MarkerIds>(
    () => ({
      field: `pmsm-field-arrow-${uniqueId}`,
      copper: `pmsm-copper-arrow-${uniqueId}`,
      magnet: `pmsm-magnet-arrow-${uniqueId}`,
      steel: `pmsm-steel-arrow-${uniqueId}`,
      amber: `pmsm-amber-arrow-${uniqueId}`,
    }),
    [uniqueId],
  );
  const [statorFocus, setStatorFocus] = useState<StatorFocus>("stator");
  const [speed, setSpeed] = useState<FieldSpeed>("slow");
  const [load, setLoad] = useState<LoadLevel>("light");
  const [buriedFocus, setBuriedFocus] = useState<BuriedFocus>("retention");
  const [torqueFocus, setTorqueFocus] = useState<TorqueFocus>("both");
  const svgRef = useRef<SVGSVGElement>(null);
  const previousStep = useRef<PmsmTurnStep>(step);
  const reducedOnly = reducedMotion;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (previousStep.current !== step || reducedMotion) {
      svg.setCurrentTime(0);
      previousStep.current = step;
    }

    if (paused || reducedMotion) {
      svg.pauseAnimations();
      return;
    }

    svg.unpauseAnimations();
  }, [paused, reducedMotion, step]);

  const scene = (() => {
    switch (step) {
      case "assemble":
        return <AssembleScene markerIds={markerIds} focus={statorFocus} />;
      case "field":
        return <FieldScene markerIds={markerIds} speed={speed} still={reducedOnly} />;
      case "sync":
        return <SyncScene markerIds={markerIds} load={load} still={reducedOnly} />;
      case "buried":
        return <BuriedScene markerIds={markerIds} focus={buriedFocus} />;
      case "torques":
        return <TorqueScene markerIds={markerIds} focus={torqueFocus} />;
    }
  })();

  return (
    <div
      className={`pmsm-turn pmsm-turn--${step} ${paused ? "is-paused" : ""} ${reducedMotion ? "is-reduced" : ""}`}
      data-step={step}
    >
      <svg
        className="pmsm-turn__svg"
        ref={svgRef}
        viewBox="0 0 1000 720"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={sceneDescription(step, load, torqueFocus)}
      >
        <ArrowMarkers ids={markerIds} />
        <g className="pmsm-turn__grid" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <line key={`vertical-${index}`} x1={50 + index * 100} x2={50 + index * 100} y1="34" y2="686" />
          ))}
          {Array.from({ length: 7 }, (_, index) => (
            <line key={`horizontal-${index}`} x1="32" x2="968" y1={52 + index * 92} y2={52 + index * 92} />
          ))}
        </g>
        {scene}
      </svg>

      {step === "assemble" ? (
        <StageControl
          label="Isolate a motor part"
          value={statorFocus}
          onChange={(value) => setStatorFocus(value as StatorFocus)}
          options={[
            { value: "stator", label: "Stator" },
            { value: "rotor", label: "Rotor" },
            { value: "both", label: "Both" },
          ]}
        />
      ) : null}

      {step === "field" ? (
        <StageControl
          label="Field speed"
          value={speed}
          onChange={(value) => setSpeed(value as FieldSpeed)}
          options={[
            { value: "slow", label: "Slow field" },
            { value: "faster", label: "Faster field" },
          ]}
        />
      ) : null}

      {step === "sync" ? (
        <StageControl
          label="Shaft load"
          value={load}
          onChange={(value) => setLoad(value as LoadLevel)}
          note={stableSyncNote(load)}
          options={[
            { value: "light", label: "Light load" },
            { value: "higher", label: "Higher load" },
          ]}
        />
      ) : null}

      {step === "buried" ? (
        <StageControl
          label="Why magnets are buried"
          value={buriedFocus}
          onChange={(value) => setBuriedFocus(value as BuriedFocus)}
          options={[
            { value: "retention", label: "High speed" },
            { value: "paths", label: "Flux paths" },
          ]}
        />
      ) : null}

      {step === "torques" ? (
        <StageControl
          label="Torque contribution"
          value={torqueFocus}
          onChange={(value) => setTorqueFocus(value as TorqueFocus)}
          note="Qualitative view. Arrow size is not a torque split."
          options={[
            { value: "magnet", label: "Magnet pull" },
            { value: "steel", label: "Steel alignment" },
            { value: "both", label: "Together" },
          ]}
        />
      ) : null}

      <p className="pmsm-turn__status" aria-live="polite">
        {sceneDescription(step, load, torqueFocus)}
      </p>
    </div>
  );
}
