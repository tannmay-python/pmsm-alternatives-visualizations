import {
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import "./vehicleJourney.css";
import {
  getExtractionTransform,
  getNextEnergyIndex,
  isActiveEnergyLink,
  makeSvgId,
  PART_DETAILS,
  toggleExtraction,
  type VehicleJourneyStep,
  type VehiclePart,
} from "./vehicleGeometry";

export type { VehicleJourneyStep } from "./vehicleGeometry";

type VehicleJourneyVisualProps = {
  step: VehicleJourneyStep;
  paused?: boolean;
  reducedMotion?: boolean;
  showCopy?: boolean;
};

type CalloutProps = {
  label: string;
  target: [number, number];
  labelAt: [number, number];
  align?: "start" | "middle" | "end";
  tone?: "muted" | "signal" | "copper" | "cooling";
};

type InteractivePartProps = {
  part: VehiclePart;
  selected?: boolean;
  onSelect?: (part: VehiclePart) => void;
  children: React.ReactNode;
};

const STEP_COPY: Record<VehicleJourneyStep, { eyebrow: string; title: string; body: string }> = {
  location: {
    eyebrow: "Inside an electric car",
    title: "The motor lives at an axle.",
    body: "The battery sits between the wheels. The motor turns the nearby driven wheels.",
  },
  energy: {
    eyebrow: "Follow the energy",
    title: "Electricity becomes wheel movement.",
    body: "Follow one link at a time. Select any part to see its one job.",
  },
  extract: {
    eyebrow: "One compact system",
    title: "The motor is part of a drive unit.",
    body: "Pull the unit out, then open it to see what travels with the motor.",
  },
  motor: {
    eyebrow: "Now look inside",
    title: "A motor has a still outside and a spinning inside.",
    body: "The stator stays still. The rotor and shaft spin in the middle.",
  },
};

const PART_LABELS: Record<VehiclePart, string> = {
  battery: "Battery",
  inverter: "Inverter",
  motor: "Motor",
  reduction: "Reduction gear",
  wheel: "Driven wheel",
};

function keySelect(
  event: KeyboardEvent<SVGGElement>,
  onSelect: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  onSelect();
}

function InteractivePart({
  part,
  selected = false,
  onSelect,
  children,
}: InteractivePartProps) {
  if (!onSelect) return <g>{children}</g>;

  return (
    <g
      className={`vehicle-journey__part ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Select ${PART_LABELS[part]}`}
      aria-pressed={selected}
      onClick={() => onSelect(part)}
      onKeyDown={(event) => keySelect(event, () => onSelect(part))}
    >
      {children}
    </g>
  );
}

function Callout({
  label,
  target,
  labelAt,
  align = "middle",
  tone = "muted",
}: CalloutProps) {
  const [targetX, targetY] = target;
  const [labelX, labelY] = labelAt;
  const elbowY = targetY < labelY ? labelY - 16 : labelY + 16;

  return (
    <g className={`vehicle-journey__callout is-${tone}`} aria-hidden="true">
      <circle cx={targetX} cy={targetY} r="3.25" />
      <path d={`M ${targetX} ${targetY} L ${targetX} ${elbowY} L ${labelX} ${elbowY}`} />
      <text x={labelX} y={labelY} textAnchor={align}>
        {label}
      </text>
    </g>
  );
}

function Grid() {
  const vertical = Array.from({ length: 15 }, (_, index) => 60 + index * 80);
  const horizontal = Array.from({ length: 8 }, (_, index) => 48 + index * 76);

  return (
    <g className="vehicle-journey__grid" aria-hidden="true">
      {vertical.map((x) => (
        <line key={`vertical-${x}`} x1={x} x2={x} y1="38" y2="640" />
      ))}
      {horizontal.map((y) => (
        <line key={`horizontal-${y}`} x1="38" x2="1162" y1={y} y2={y} />
      ))}
    </g>
  );
}

function Wheel({
  x,
  y,
  spinning = false,
  faded = false,
}: {
  x: number;
  y: number;
  spinning?: boolean;
  faded?: boolean;
}) {
  return (
    <g opacity={faded ? 0.34 : 1} transform={`translate(${x} ${y})`}>
      <g className={`vehicle-journey__wheel ${spinning ? "is-spinning" : ""}`}>
        <circle r="69" className="vehicle-journey__wheel-tyre" />
        <circle r="46" className="vehicle-journey__wheel-rim" />
        <circle r="8" className="vehicle-journey__wheel-hub" />
        {Array.from({ length: 8 }, (_, index) => {
          const angle = index * 45;
          return (
            <line
              key={angle}
              x1="10"
              y1="0"
              x2="41"
              y2="0"
              transform={`rotate(${angle})`}
            />
          );
        })}
      </g>
    </g>
  );
}

function Battery({
  selected,
  onSelect,
}: {
  selected?: boolean;
  onSelect?: (part: VehiclePart) => void;
}) {
  return (
    <InteractivePart part="battery" selected={selected} onSelect={onSelect}>
      <rect x="338" y="421" width="402" height="55" rx="4" className="vehicle-journey__battery" />
      {Array.from({ length: 13 }, (_, index) => (
        <line
          key={index}
          x1={360 + index * 28}
          x2={360 + index * 28}
          y1="428"
          y2="469"
          className="vehicle-journey__battery-cell"
        />
      ))}
    </InteractivePart>
  );
}

function MotorCrossSection({
  x,
  y,
  radius,
  active = false,
  running = false,
}: {
  x: number;
  y: number;
  radius: number;
  active?: boolean;
  running?: boolean;
}) {
  const coils = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index * 30),
    [],
  );

  return (
    <g transform={`translate(${x} ${y})`} className={active ? "is-active" : ""}>
      <circle r={radius} className="vehicle-journey__motor-shell" />
      <circle r={radius * 0.72} className="vehicle-journey__stator-ring" />
      {coils.map((angle) => (
        <rect
          key={angle}
          x={radius * 0.49}
          y={-radius * 0.09}
          width={radius * 0.2}
          height={radius * 0.18}
          rx={radius * 0.025}
          className="vehicle-journey__copper-coil"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={radius * 0.39} className="vehicle-journey__air-gap" />
      <g className={running ? "vehicle-journey__rotor is-running" : "vehicle-journey__rotor"}>
        <circle r={radius * 0.31} className="vehicle-journey__rotor-core" />
        <rect
          x={-radius * 0.29}
          y={-radius * 0.09}
          width={radius * 0.58}
          height={radius * 0.18}
          className="vehicle-journey__shaft"
        />
        <circle r={radius * 0.1} className="vehicle-journey__shaft-cap" />
      </g>
    </g>
  );
}

function Inverter({
  x,
  y,
  selected = false,
  onSelect,
}: {
  x: number;
  y: number;
  selected?: boolean;
  onSelect?: (part: VehiclePart) => void;
}) {
  return (
    <InteractivePart part="inverter" selected={selected} onSelect={onSelect}>
      <g transform={`translate(${x} ${y})`}>
        <rect x="-45" y="-32" width="90" height="64" rx="4" className="vehicle-journey__inverter" />
        <line x1="-37" y1="-9" x2="37" y2="-9" className="vehicle-journey__inverter-detail" />
        {[-20, 0, 20].map((offset) => (
          <line
            key={offset}
            x1={offset}
            x2={offset}
            y1="32"
            y2="43"
            className="vehicle-journey__inverter-terminal"
          />
        ))}
      </g>
    </InteractivePart>
  );
}

function ReductionGear({
  x,
  y,
  selected = false,
  onSelect,
}: {
  x: number;
  y: number;
  selected?: boolean;
  onSelect?: (part: VehiclePart) => void;
}) {
  return (
    <InteractivePart part="reduction" selected={selected} onSelect={onSelect}>
      <g transform={`translate(${x} ${y})`}>
        <circle r="30" className="vehicle-journey__gear" />
        <circle r="12" className="vehicle-journey__gear-inner" />
        {Array.from({ length: 12 }, (_, index) => (
          <line
            key={index}
            x1="30"
            x2="36"
            y1="0"
            y2="0"
            transform={`rotate(${index * 30})`}
            className="vehicle-journey__gear-tooth"
          />
        ))}
      </g>
    </InteractivePart>
  );
}

function DriveUnit({
  x,
  y,
  selectedPart,
  onSelect,
  expanded = false,
  running = false,
}: {
  x: number;
  y: number;
  selectedPart?: VehiclePart;
  onSelect?: (part: VehiclePart) => void;
  expanded?: boolean;
  running?: boolean;
}) {
  const spacing = expanded ? 1.55 : 1;

  return (
    <g transform={`translate(${x} ${y})`} className="vehicle-journey__drive-unit">
      <Inverter
        x={-74 * spacing}
        y={-56}
        selected={selectedPart === "inverter"}
        onSelect={onSelect}
      />
      <InteractivePart
        part="motor"
        selected={selectedPart === "motor"}
        onSelect={onSelect}
      >
        <MotorCrossSection x={0} y={0} radius={44} active={selectedPart === "motor"} running={running} />
      </InteractivePart>
      <ReductionGear
        x={71 * spacing}
        y={0}
        selected={selectedPart === "reduction"}
        onSelect={onSelect}
      />
      <g className="vehicle-journey__differential" transform={`translate(${111 * spacing} 16)`}>
        <circle r="17" />
        <line x1="-34" x2="-17" y1="0" y2="0" />
        <line x1="17" x2="48" y1="0" y2="0" />
      </g>
      {expanded ? (
        <path
          d={`M ${-113 * spacing} 82 C ${-48 * spacing} 112, ${34 * spacing} 112, ${123 * spacing} 70`}
          className="vehicle-journey__cooling-path"
        />
      ) : null}
    </g>
  );
}

function VehicleModel({
  twoMotors,
  mode = "location",
  activeEnergyIndex = 0,
  selectedPart,
  onSelect,
  spinning = false,
  showAllEnergyLinks = false,
}: {
  twoMotors?: boolean;
  mode?: "location" | "energy";
  activeEnergyIndex?: number;
  selectedPart?: VehiclePart;
  onSelect?: (part: VehiclePart) => void;
  spinning?: boolean;
  showAllEnergyLinks?: boolean;
}) {
  const energy = mode === "energy";
  const linkClass = (index: number) =>
    `vehicle-journey__energy-link ${showAllEnergyLinks || isActiveEnergyLink(activeEnergyIndex, index) ? "is-active" : ""}`;

  return (
    <>
      <path
        d="M 131 471 L 137 406 Q 140 387 166 382 L 304 366 L 397 277 Q 417 258 457 257 L 686 257 Q 724 259 751 288 L 822 360 L 1008 383 Q 1034 390 1038 418 L 1040 471"
        className="vehicle-journey__car-body"
      />
      <path
        d="M 404 291 Q 423 273 461 272 L 680 272 Q 711 276 732 303 L 761 342 L 348 342 Z"
        className="vehicle-journey__car-glass"
      />
      <line x1="87" y1="540" x2="1104" y2="540" className="vehicle-journey__ground" />
      <Wheel x={270} y={471} faded={energy} />
      <InteractivePart part="wheel" selected={selectedPart === "wheel"} onSelect={onSelect}>
        <Wheel x={956} y={471} spinning={spinning} />
      </InteractivePart>
      <Battery selected={selectedPart === "battery"} onSelect={onSelect} />
      {twoMotors ? (
        <g className="vehicle-journey__front-unit" aria-hidden="true">
          <MotorCrossSection x={280} y={431} radius={27} />
          <line x1="307" y1="431" x2="326" y2="431" className="vehicle-journey__half-shaft" />
        </g>
      ) : null}
      <DriveUnit
        x={839}
        y={430}
        selectedPart={selectedPart}
        onSelect={onSelect}
        running={spinning}
      />
      <line x1="890" y1="446" x2="956" y2="446" className="vehicle-journey__half-shaft" />
      {energy ? (
        <g aria-hidden="true">
          <path d="M 740 446 L 768 446 L 768 372" className={linkClass(0)} />
          <path d="M 814 396 L 829 410" className={linkClass(1)} />
          <path d="M 883 430 L 910 430" className={linkClass(2)} />
          <path d="M 940 446 L 963 446" className={linkClass(3)} />
          <text x="575" y="400" className="vehicle-journey__flow-caption">ELECTRICAL</text>
          <text x="991" y="404" className="vehicle-journey__flow-caption">MECHANICAL</text>
        </g>
      ) : (
        <>
          <Callout label="BATTERY" target={[540, 448]} labelAt={[540, 583]} />
          <Callout label="MOTOR" target={[839, 430]} labelAt={[839, 583]} tone="signal" />
          <Callout label="DRIVEN WHEELS" target={[956, 471]} labelAt={[1016, 589]} align="end" />
        </>
      )}
    </>
  );
}

function LocationStage({
  twoMotors,
  setTwoMotors,
}: {
  twoMotors: boolean;
  setTwoMotors: (value: boolean) => void;
}) {
  return (
    <>
      <VehicleModel twoMotors={twoMotors} />
      <foreignObject x="74" y="76" width="254" height="42">
        <div className="vehicle-journey__layout-toggle">
          <span>Layout</span>
          <button
            type="button"
            className={!twoMotors ? "is-selected" : ""}
            onClick={() => setTwoMotors(false)}
            aria-pressed={!twoMotors}
          >
            One motor
          </button>
          <button
            type="button"
            className={twoMotors ? "is-selected" : ""}
            onClick={() => setTwoMotors(true)}
            aria-pressed={twoMotors}
          >
            Two motors
          </button>
        </div>
      </foreignObject>
    </>
  );
}

function EnergyStage({
  activeEnergyIndex,
  selectedPart,
  setSelectedPart,
  spinning,
  showAllEnergyLinks,
  showSelectedStatus,
}: {
  activeEnergyIndex: number;
  selectedPart: VehiclePart;
  setSelectedPart: (part: VehiclePart) => void;
  spinning: boolean;
  showAllEnergyLinks: boolean;
  showSelectedStatus: boolean;
}) {
  const selectedLabel = PART_LABELS[selectedPart].toUpperCase();

  return (
    <>
      <VehicleModel
        mode="energy"
        activeEnergyIndex={activeEnergyIndex}
        selectedPart={selectedPart}
        onSelect={setSelectedPart}
        spinning={spinning}
        showAllEnergyLinks={showAllEnergyLinks}
      />
      {showSelectedStatus ? (
        <g className="vehicle-journey__selected-status" aria-hidden="true">
          <rect x="74" y="76" width="286" height="58" rx="3" />
          <text x="90" y="99" className="vehicle-journey__selected-status-label">SELECTED PART</text>
          <text x="90" y="120" className="vehicle-journey__selected-status-value">{selectedLabel}</text>
        </g>
      ) : null}
    </>
  );
}

function ExtractStage({
  progress,
  setProgress,
  spinning,
  reducedMotion,
}: {
  progress: number;
  setProgress: (value: number) => void;
  spinning: boolean;
  reducedMotion: boolean;
}) {
  const transform = getExtractionTransform(progress);
  const isOpen = progress > 0.88;

  return (
    <>
      <path
        d="M 142 470 L 150 407 Q 153 389 181 385 L 305 370 L 393 289 Q 415 271 459 270 L 685 270 Q 721 272 748 301 L 817 365 L 1006 386 Q 1032 392 1036 419 L 1038 470"
        className="vehicle-journey__car-body is-ghost"
      />
      <Wheel x={270} y={470} faded />
      <Wheel x={956} y={470} faded />
      <Battery />
      <line x1="87" y1="540" x2="1104" y2="540" className="vehicle-journey__ground" />
      {progress > 0.03 ? (
        <g className="vehicle-journey__drive-origin" aria-hidden="true">
          <circle cx="839" cy="430" r="51" />
          <rect x="720" y="340" width="92" height="65" rx="4" />
          <circle cx="912" cy="430" r="33" />
          <path d={`M 839 430 L ${839 + transform.x} ${430 + transform.y}`} />
        </g>
      ) : null}
      <g
        transform={`translate(${839 + transform.x} ${430 + transform.y})`}
        opacity={transform.opacity}
        className="vehicle-journey__extracted-unit"
      >
        <DriveUnit x={0} y={0} expanded={isOpen} running={spinning} />
      </g>
      {isOpen ? (
        <>
          <Callout label="INVERTER" target={[725 + transform.x, 374 + transform.y]} labelAt={[620, 118]} align="end" />
          <Callout label="MOTOR" target={[839 + transform.x, 430 + transform.y]} labelAt={[842, 154]} tone="signal" />
          <Callout label="REDUCTION + DIFFERENTIAL" target={[949 + transform.x, 446 + transform.y]} labelAt={[1150, 210]} align="end" />
          <Callout label="COOLING PATH" target={[855 + transform.x, 518 + transform.y]} labelAt={[856, 601]} tone="cooling" />
        </>
      ) : (
        <Callout label="DRIVE UNIT" target={[839 + transform.x, 430 + transform.y]} labelAt={[839, 587]} tone="signal" />
      )}
      <foreignObject x="76" y="70" width="220" height="44">
        <button
          type="button"
          className="vehicle-journey__extract-control"
          aria-pressed={isOpen}
          onClick={() => setProgress(toggleExtraction(progress))}
          disabled={reducedMotion}
        >
          {isOpen ? "Close drive unit" : "Open drive unit"}
        </button>
      </foreignObject>
    </>
  );
}

function MotorStage({ spinning }: { spinning: boolean }) {
  return (
    <>
      <line x1="164" y1="340" x2="1036" y2="340" className="vehicle-journey__axis" />
      <line x1="600" y1="84" x2="600" y2="600" className="vehicle-journey__axis" />
      <MotorCrossSection x={600} y={340} radius={190} running={spinning} />
      <Callout label="STATOR - STAYS STILL" target={[600, 161]} labelAt={[600, 104]} />
      <Callout label="COPPER WINDINGS" target={[767, 340]} labelAt={[1053, 305]} align="end" tone="copper" />
      <Callout label="ROTOR - SPINS" target={[600, 340]} labelAt={[600, 584]} tone="signal" />
    </>
  );
}

export function VehicleJourneyVisual({
  step,
  paused = false,
  reducedMotion = false,
  showCopy = false,
}: VehicleJourneyVisualProps) {
  const reactId = useId();
  const titleId = makeSvgId("vehicle-journey-title", reactId);
  const descriptionId = makeSvgId("vehicle-journey-description", reactId);
  const [twoMotors, setTwoMotors] = useState(false);
  const [selectedPart, setSelectedPart] = useState<VehiclePart>("inverter");
  const [energyIndex, setEnergyIndex] = useState(0);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const isStill = paused || reducedMotion;
  const copy = STEP_COPY[step];
  const status = step === "energy"
    ? `${PART_LABELS[selectedPart]}. ${PART_DETAILS[selectedPart]}`
    : copy.body;

  useEffect(() => {
    if (step !== "energy" || isStill) return undefined;
    const interval = window.setInterval(() => {
      setEnergyIndex((current) => getNextEnergyIndex(current));
    }, 1450);
    return () => window.clearInterval(interval);
  }, [isStill, step]);

  useEffect(() => {
    if (step !== "energy") return;
    setEnergyIndex(0);
  }, [step]);

  return (
    <section
      className={`vehicle-journey ${isStill ? "is-still" : ""}`}
      aria-labelledby={`${titleId}-heading`}
    >
      {showCopy ? (
        <div className="vehicle-journey__copy">
          <p className="vehicle-journey__eyebrow">{copy.eyebrow}</p>
          <h2 id={`${titleId}-heading`}>{copy.title}</h2>
          <p className="vehicle-journey__status" aria-live="polite">{status}</p>
        </div>
      ) : (
        <div className="vehicle-journey__sr-only" aria-live="polite">
          <h2 id={`${titleId}-heading`}>{copy.title}</h2>
          <p>{status}</p>
        </div>
      )}
      <div className="vehicle-journey__stage">
        <svg
          viewBox="0 0 1200 680"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <title id={titleId}>{copy.title}</title>
          <desc id={descriptionId}>{status}</desc>
          <Grid />
          {step === "location" ? (
            <LocationStage twoMotors={twoMotors} setTwoMotors={setTwoMotors} />
          ) : null}
          {step === "energy" ? (
            <EnergyStage
              activeEnergyIndex={energyIndex}
              selectedPart={selectedPart}
              setSelectedPart={setSelectedPart}
              spinning={!isStill}
              showAllEnergyLinks={reducedMotion}
              showSelectedStatus={!showCopy}
            />
          ) : null}
          {step === "extract" ? (
            <ExtractStage
              progress={reducedMotion ? 1 : extractionProgress}
              setProgress={setExtractionProgress}
              spinning={!isStill}
              reducedMotion={reducedMotion}
            />
          ) : null}
          {step === "motor" ? <MotorStage spinning={!isStill} /> : null}
        </svg>
      </div>
    </section>
  );
}
