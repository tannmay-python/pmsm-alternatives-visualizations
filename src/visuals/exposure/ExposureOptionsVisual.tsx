import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import {
  calculateBackEmfHeight,
  calculateFieldWeakeningVectors,
  MITIGATION_RUNGS,
  MOTOR_FAMILIES,
  type MitigationRung,
  type MotorFamilyKey,
  type ReeGroup,
} from "./exposureGeometry";
import "./exposureOptions.css";

export type ExposureStep =
  | "light-and-heavy-ree-supply"
  | "mitigation-ladder"
  | "back-emf-speed-sweep"
  | "field-weakening-current"
  | "sync-async-family-tree"
  | "inverter-fault-at-speed";

export type ExposureOptionsVisualProps = {
  stepId: ExposureStep;
  paused?: boolean;
  reducedMotion?: boolean;
  onSelectOptionalLab?: () => void;
  onReturnFromOptionalLab?: () => void;
};

type StageLabel = {
  text: string;
  tone: "violet" | "amber" | "cyan" | "steel";
  position: "top-left" | "top-right" | "upper-left" | "upper-right" | "mid-left" | "mid-right";
};

const labelByStep: Readonly<Record<ExposureStep, readonly StageLabel[]>> = {
  "light-and-heavy-ree-supply": [
    { text: "ND/PR", tone: "violet", position: "top-left" },
    { text: "DY/TB", tone: "amber", position: "top-right" },
  ],
  "mitigation-ladder": [
    { text: "KEEPS MORE", tone: "steel", position: "top-left" },
    { text: "CHANGES MORE", tone: "amber", position: "top-right" },
  ],
  "back-emf-speed-sweep": [
    { text: "BACK-EMF", tone: "cyan", position: "upper-right" },
    { text: "DC BUS CEILING", tone: "steel", position: "top-right" },
  ],
  "field-weakening-current": [
    { text: "MAGNET FLUX", tone: "violet", position: "upper-right" },
    { text: "COUNTER-FLUX CURRENT", tone: "cyan", position: "mid-right" },
  ],
  "inverter-fault-at-speed": [
    { text: "FIELD REMAINS", tone: "violet", position: "top-left" },
    { text: "FIELD FADES", tone: "cyan", position: "top-right" },
  ],
  "sync-async-family-tree": [
    { text: "IN STEP", tone: "cyan", position: "top-left" },
    { text: "SLIP", tone: "amber", position: "top-right" },
  ],
};

const partialTurn = (value: number) => Math.round(value * 0.72);

function FieldRotor({
  x,
  y,
  size,
  turn = 0,
  active = false,
  id,
  fieldKind = "permanent",
}: {
  x: number;
  y: number;
  size: number;
  turn?: number;
  active?: boolean;
  id?: string;
  fieldKind?: "permanent" | "wound";
}) {
  return (
    <g transform={`translate(${x} ${y})`} id={id}>
      <circle r={size} className="exposure-art__stator" />
      <circle r={size * 0.72} className="exposure-art__bore" />
      <g transform={`rotate(${turn})`}>
        <circle r={size * 0.45} className="exposure-art__rotor" />
        <rect x={-size * 0.39} y={-size * 0.09} width={size * 0.2} height={size * 0.18} rx="4" className={fieldKind === "permanent" ? "exposure-art__magnet" : "exposure-art__winding"} />
        <rect x={size * 0.19} y={-size * 0.09} width={size * 0.2} height={size * 0.18} rx="4" className={fieldKind === "permanent" ? "exposure-art__magnet" : "exposure-art__winding"} />
        <path d={`M ${-size * 0.39} 0 C ${-size * 0.5} ${-size * 0.28}, ${size * 0.5} ${-size * 0.28}, ${size * 0.39} 0`} className={fieldKind === "permanent" ? "exposure-art__permanent-arc" : "exposure-art__wound-arc"} />
        <path d={`M ${-size * 0.39} 0 C ${-size * 0.5} ${size * 0.28}, ${size * 0.5} ${size * 0.28}, ${size * 0.39} 0`} className={fieldKind === "permanent" ? "exposure-art__permanent-arc" : "exposure-art__wound-arc"} />
      </g>
      {active ? <circle r={size * 0.12} className="exposure-art__hub" /> : null}
    </g>
  );
}

function SupplyArt({ selected, frozen }: { selected: ReeGroup; frozen: boolean }) {
  const showNdPr = frozen || selected === "Nd/Pr";
  const showDyTb = frozen || selected === "Dy/Tb";

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="A shared permanent magnet showing a purple main-field source and an amber reversal-resistance boundary.">
      <g className="exposure-art__ghost">
        <path d="M 190 315 H 810" />
        <circle cx="500" cy="315" r="188" />
      </g>
      <g id="supply_main_field" className={showNdPr ? "is-emphasised" : "is-muted"}>
        <path d="M 390 192 C 516 130, 625 200, 625 315 C 625 430, 516 500, 390 438 C 443 389, 443 241, 390 192 Z" className="exposure-art__field-lobe" />
        <path d="M 426 232 C 510 190, 578 243, 578 315 C 578 387, 510 440, 426 398" className="exposure-art__field-line" />
      </g>
      <g id="supply_reversal_boundary" className={showDyTb ? "is-emphasised" : "is-muted"}>
        <path d="M 648 178 C 758 245, 758 385, 648 452" className="exposure-art__resistance-boundary" />
        <path d="M 672 201 C 748 258, 748 372, 672 429" className="exposure-art__resistance-boundary is-inner" />
      </g>
      <g id="supply_ndpr" className={showNdPr ? "is-emphasised" : "is-muted"}>
        <path d="M 110 315 H 368" className="exposure-art__supply-line is-violet" />
        <path d="M 350 300 L 380 315 L 350 330 Z" className="exposure-art__violet-fill" />
        <circle cx="240" cy="315" r="35" className="exposure-art__supply-node is-violet" />
      </g>
      <g id="supply_dytb" className={showDyTb ? "is-emphasised" : "is-muted"}>
        <path d="M 890 315 H 732" className="exposure-art__supply-line is-amber" />
        <path d="M 750 300 L 720 315 L 750 330 Z" className="exposure-art__amber-fill" />
        <circle cx="820" cy="315" r="35" className="exposure-art__supply-node is-amber" />
      </g>
      <g id="supply_license_gate" className={showDyTb ? "is-emphasised" : "is-muted"} aria-label="Dated licensing context on the Dy and Tb route">
        <path d="M 760 236 V 272 M 791 236 V 272 M 752 236 H 799 M 752 272 H 799" className="exposure-art__gate" />
        <circle cx="775" cy="254" r="4" className="exposure-art__amber-fill" />
      </g>
    </svg>
  );
}

function LadderArt({ rung, frozen }: { rung: MitigationRung; frozen: boolean }) {
  const activeRung = frozen ? 2 : rung;
  const footprintClass = `exposure-art__footprint exposure-art__footprint--${activeRung}`;

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="A five-rung intervention ladder beside a ghosted electric drive unit. The highlighted footprint grows with the selected intervention.">
      <g id="mitigation_ladder" className="exposure-art__ladder">
        <path d="M 150 472 L 390 112 M 230 472 L 470 112" />
        {MITIGATION_RUNGS.map((item) => {
          const offset = item.id * 60;
          const y = 438 - offset * 1.16;
          const x = 171 + offset * 0.67;
          const chosen = item.id === activeRung;
          return (
            <g key={item.id} className={chosen ? "is-selected" : undefined}>
              <path d={`M ${x} ${y} L ${x + 80} ${y}`} />
              <circle cx={x + 40} cy={y} r={chosen ? 13 : 8} />
            </g>
          );
        })}
      </g>
      <g id="drive_unit_ghost" className="exposure-art__drive-unit">
        <rect x="568" y="140" width="292" height="286" rx="26" />
        <circle cx="680" cy="283" r="86" />
        <circle cx="680" cy="283" r="49" />
        <rect x="780" y="204" width="54" height="78" rx="10" />
        <path d="M 782 338 H 822 V 380" />
        <path d="M 605 372 H 746" />
      </g>
      <g id="change_footprint" className={footprintClass}>
        <circle className="exposure-art__impact-ring" cx="680" cy="283" r="60" />
        <path className="exposure-art__impact-channel" d="M 680 215 V 351" />
        <rect className="exposure-art__impact-inverter" x="770" y="194" width="74" height="98" rx="13" />
        <path className="exposure-art__impact-cooling" d="M 774 338 H 832 V 395" />
        <rect className="exposure-art__impact-frame" x="552" y="124" width="324" height="318" rx="32" />
      </g>
    </svg>
  );
}

function BackEmfArt({ speed, frozen }: { speed: number; frozen: boolean }) {
  const currentSpeed = frozen ? 88 : speed;
  const { normalized, nearingCeiling } = calculateBackEmfHeight(currentSpeed);
  const traceY = 438 - normalized * 290;
  const turn = frozen ? 38 : partialTurn(currentSpeed);

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="A permanent-magnet rotor beside a qualitative back-EMF corridor rising toward a fixed DC-bus ceiling.">
      <FieldRotor x={315} y={300} size={172} turn={turn} active id="pmsm_rotor" />
      <g id="permanent_flux" aria-hidden="true">
        <path d="M 193 300 H 437" className="exposure-art__flux-axis" />
      </g>
      <g className="exposure-art__corridor">
        <rect x="650" y="104" width="188" height="348" rx="18" />
        <g id="dc_bus_ceiling">
          <path d="M 650 150 H 838" />
          <circle cx="744" cy="150" r="4" />
        </g>
        <g id="back_emf_trace" className={nearingCeiling ? "is-near" : undefined}>
          <path d={`M 700 438 H 790 V ${traceY} H 816`} />
          <circle cx="816" cy={traceY} r="8" />
        </g>
      </g>
    </svg>
  );
}

function FieldWeakeningArt({ strength, frozen }: { strength: number; frozen: boolean }) {
  const currentStrength = frozen ? 74 : strength;
  const { magnetFlux, counterFlux, netFlux } = calculateFieldWeakeningVectors(currentStrength);
  const counterStart = 748;
  const permanentEnd = 472 + magnetFlux;

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="A permanent field and an opposing counter-flux current resolve to a shorter net field.">
      <FieldRotor x={258} y={300} size={148} active id="pmsm_rotor" />
      <g id="permanent_flux">
        <path d={`M 430 230 H ${permanentEnd}`} className="exposure-art__vector is-violet" />
        <path d={`M ${permanentEnd} 230 L ${permanentEnd - 18} 220 L ${permanentEnd - 18} 240 Z`} className="exposure-art__violet-fill" />
      </g>
      <g id="counter_flux_current" className={counterFlux === 0 ? "is-quiet" : undefined}>
        <path d={`M ${counterStart} 308 H ${counterStart - counterFlux}`} className="exposure-art__vector is-cyan" />
        <path d={`M ${counterStart - counterFlux} 308 L ${counterStart - counterFlux + 18} 298 L ${counterStart - counterFlux + 18} 318 Z`} className="exposure-art__cyan-fill" />
      </g>
      <g id="net_flux">
        <path d={`M 430 390 H ${430 + netFlux}`} className="exposure-art__vector is-net" />
        <path d={`M ${430 + netFlux} 390 L ${420 + netFlux} 384 L ${420 + netFlux} 396 Z`} className="exposure-art__net-fill" />
      </g>
      <path d="M 430 260 H 780 M 430 338 H 780 M 430 420 H 780" className="exposure-art__vector-guide" />
    </svg>
  );
}

function FaultArt({ faulted, frozen }: { faulted: boolean; frozen: boolean }) {
  const displayFault = frozen || faulted;

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="Matched permanent-magnet and wound-field rotor comparison showing persistent permanent field and controllable excitation.">
      <g className="exposure-art__comparison-side">
        <FieldRotor x={282} y={300} size={138} active id="pmsm_rotor" />
        <g id="fault_pm_field">
          <circle cx="282" cy="300" r="92" className="exposure-art__fault-field is-persistent" />
          <path d="M 190 300 C 214 216, 350 216, 374 300 C 350 384, 214 384, 190 300" className="exposure-art__fault-loop is-persistent" />
        </g>
        <g id="fault_generator_arrow" opacity={displayFault ? 1 : 0.25}>
          <path d="M 228 435 C 265 472, 323 470, 350 430" className="exposure-art__generator-arrow" />
          <path d="M 350 430 L 330 436 L 342 450 Z" className="exposure-art__red-fill" />
        </g>
      </g>
      <path d="M 500 118 V 442" className="exposure-art__comparison-divider" />
      <g className={displayFault ? "exposure-art__wound is-faded" : "exposure-art__wound"}>
        <FieldRotor x={718} y={300} size={138} active fieldKind="wound" />
        <g id="fault_wound_field">
          <circle cx="718" cy="300" r="92" className="exposure-art__fault-field is-commanded" />
          <path d="M 626 300 C 650 216, 786 216, 810 300 C 786 384, 650 384, 626 300" className="exposure-art__fault-loop is-commanded" />
        </g>
      </g>
    </svg>
  );
}

function FamiliesArt({ family, frozen }: { family: MotorFamilyKey; frozen: boolean }) {
  const chosen = frozen ? "induction" : family;
  const syncSelected = MOTOR_FAMILIES.filter((item) => item.branch === "synchronous").findIndex((item) => item.id === chosen);
  const selectedIndex = syncSelected < 0 ? 0 : syncSelected;

  return (
    <svg className="exposure-art" viewBox="0 0 1000 560" role="img" aria-label="A sparse two-branch motor-family tree. The synchronous branch has aligned field markers and the induction branch has a visible slip gap.">
      <g id="family_nodes">
      <g id="sync_branch" className={chosen === "induction" ? "is-muted" : "is-emphasised"}>
        <path d="M 130 168 H 430 V 430" className="exposure-art__branch is-violet" />
        <path d="M 250 168 V 242 M 370 168 V 242" className="exposure-art__branch is-violet" />
        <g>
          {[0, 1, 2, 3].map((index) => {
            const positions: [number, number][] = [[250, 265], [370, 265], [310, 342], [430, 342]];
            const [x, y] = positions[index];
            return <circle key={index} cx={x} cy={y} r={index === selectedIndex && chosen !== "induction" ? 18 : 11} className={index === selectedIndex && chosen !== "induction" ? "exposure-art__family-node is-selected" : "exposure-art__family-node"} />;
          })}
        </g>
        <path d="M 190 438 H 390" className="exposure-art__sync-track" />
        <circle cx="274" cy="438" r="10" className="exposure-art__stator-marker" />
        <circle cx="274" cy="438" r="17" className="exposure-art__rotor-marker" />
      </g>
      <g id="async_branch" className={chosen === "induction" ? "is-emphasised" : "is-muted"}>
        <path d="M 610 168 H 850 V 276" className="exposure-art__branch is-amber" />
        <g>
          <circle cx="730" cy="302" r={chosen === "induction" ? 18 : 11} className={chosen === "induction" ? "exposure-art__family-node is-selected is-amber" : "exposure-art__family-node is-amber"} />
        </g>
        <path d="M 630 438 H 838" className="exposure-art__async-track" />
        <circle cx="770" cy="438" r="10" className="exposure-art__stator-marker" />
        <circle cx="694" cy="438" r="10" className="exposure-art__cage-marker" />
        <g id="slip_marker">
          <path d="M 708 408 H 756" className="exposure-art__slip-gap" />
          <path d="M 756 408 L 744 400 L 744 416 Z" className="exposure-art__amber-fill" />
        </g>
      </g>
      </g>
    </svg>
  );
}

export function ExposureOptionsVisual({
  stepId,
  paused = false,
  reducedMotion = false,
  onSelectOptionalLab,
  onReturnFromOptionalLab,
}: ExposureOptionsVisualProps) {
  const [reeGroup, setReeGroup] = useState<ReeGroup>("Dy/Tb");
  const [mitigationRung, setMitigationRung] = useState<MitigationRung>(0);
  const [motorSpeed, setMotorSpeed] = useState(34);
  const [fieldWeakening, setFieldWeakening] = useState(0);
  const [inverterFault, setInverterFault] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<MotorFamilyKey>("induction");
  const [isChanging, setIsChanging] = useState(false);
  const settleTimer = useRef<number | undefined>(undefined);

  const frozen = reducedMotion || paused;
  const triggerChange = (update: () => void) => {
    update();
    if (frozen) return;
    setIsChanging(true);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setIsChanging(false), 620);
  };

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const stage = (() => {
    switch (stepId) {
      case "light-and-heavy-ree-supply":
        return <SupplyArt selected={reeGroup} frozen={frozen} />;
      case "mitigation-ladder":
        return <LadderArt rung={mitigationRung} frozen={frozen} />;
      case "back-emf-speed-sweep":
        return <BackEmfArt speed={motorSpeed} frozen={frozen} />;
      case "field-weakening-current":
        return <FieldWeakeningArt strength={fieldWeakening} frozen={frozen} />;
      case "inverter-fault-at-speed":
        return <FaultArt faulted={inverterFault} frozen={frozen} />;
      case "sync-async-family-tree":
        return <FamiliesArt family={selectedFamily} frozen={frozen} />;
    }
  })();

  const dock = (() => {
    switch (stepId) {
      case "light-and-heavy-ree-supply":
        return (
          <fieldset className="exposure-dock__group">
            <legend>Select material group</legend>
            <div className="exposure-dock__choices" role="radiogroup" aria-label="Select material group">
              {(["Nd/Pr", "Dy/Tb"] as const).map((group) => (
                <button key={group} type="button" role="radio" aria-checked={reeGroup === group} className={reeGroup === group ? `is-selected is-${group === "Nd/Pr" ? "violet" : "amber"}` : undefined} onClick={() => triggerChange(() => setReeGroup(group))}>
                  {group}
                </button>
              ))}
            </div>
          </fieldset>
        );
      case "mitigation-ladder":
        return (
          <fieldset className="exposure-dock__group exposure-dock__group--rungs">
            <legend>Choose intervention</legend>
            <div className="exposure-dock__choices" role="radiogroup" aria-label="Choose intervention">
              {MITIGATION_RUNGS.map((rung) => (
                <button key={rung.id} type="button" role="radio" aria-checked={mitigationRung === rung.id} className={mitigationRung === rung.id ? "is-selected is-amber" : undefined} onClick={() => triggerChange(() => setMitigationRung(rung.id))}>
                  {rung.shortLabel}
                </button>
              ))}
            </div>
          </fieldset>
        );
      case "back-emf-speed-sweep":
        return (
          <label className="exposure-dock__range">
            <span>Motor speed</span>
            <span className="exposure-dock__endpoint">Low</span>
            <input type="range" min="0" max="100" value={motorSpeed} aria-label="Motor speed" aria-valuetext={motorSpeed > 75 ? "Near the DC-bus ceiling" : motorSpeed > 40 ? "Medium speed" : "Low speed"} onChange={(event) => triggerChange(() => setMotorSpeed(Number(event.target.value)))} />
            <span className="exposure-dock__endpoint">High</span>
          </label>
        );
      case "field-weakening-current": {
        const lossVisible = frozen || fieldWeakening > 0;
        return (
          <>
            <label className="exposure-dock__range">
              <span>Go beyond base speed</span>
              <span className="exposure-dock__endpoint">Base</span>
              <input type="range" min="0" max="100" value={fieldWeakening} aria-label="Go beyond base speed" aria-valuetext={fieldWeakening > 50 ? "High counter-flux current" : fieldWeakening > 0 ? "Counter-flux current added" : "No counter-flux current"} onChange={(event) => triggerChange(() => setFieldWeakening(Number(event.target.value)))} />
              <span className="exposure-dock__endpoint">Beyond</span>
            </label>
            <span className={lossVisible ? "exposure-dock__burden is-visible" : "exposure-dock__burden"}>Added loss burden</span>
            {onSelectOptionalLab ? <button id="chapter4-fault-launch" type="button" className="exposure-dock__lab" onClick={onSelectOptionalLab}>Compare fault fields <ArrowRight size={15} weight="bold" aria-hidden="true" /></button> : null}
          </>
        );
      }
      case "inverter-fault-at-speed":
        return (
          <>
            <button type="button" className={inverterFault ? "exposure-dock__fault is-selected" : "exposure-dock__fault"} aria-pressed={inverterFault} onClick={() => triggerChange(() => setInverterFault((value) => !value))}>
              {inverterFault ? "Reset field comparison" : "Inverter fault"}
            </button>
            {onReturnFromOptionalLab ? <button type="button" className="exposure-dock__return" onClick={onReturnFromOptionalLab}><ArrowLeft size={15} weight="bold" aria-hidden="true" /> Back to field weakening</button> : null}
          </>
        );
      case "sync-async-family-tree":
        return (
          <fieldset className="exposure-dock__group exposure-dock__group--families">
            <legend>Inspect motor family</legend>
            <div className="exposure-dock__choices" role="radiogroup" aria-label="Inspect motor family">
              {MOTOR_FAMILIES.map((family) => (
                <button key={family.id} type="button" role="radio" aria-checked={selectedFamily === family.id} className={selectedFamily === family.id ? `is-selected is-${family.branch === "synchronous" ? "violet" : "amber"}` : undefined} onClick={() => triggerChange(() => setSelectedFamily(family.id))}>
                  {family.label}
                </button>
              ))}
            </div>
          </fieldset>
        );
    }
  })();

  return (
    <div className={`exposure-visual ${isChanging ? "is-changing" : ""} ${frozen ? "is-frozen" : ""}`} data-step-id={stepId} data-reduced-motion={reducedMotion || undefined}>
      <div className="exposure-visual__stage">
        {stage}
        <div className="exposure-visual__labels" aria-hidden="true">
          {labelByStep[stepId].map((label) => <span key={label.text} data-stage-label="true" className={`exposure-visual__label is-${label.tone} is-${label.position}`}>{label.text}</span>)}
        </div>
      </div>
      <div className="exposure-dock">{dock}</div>
    </div>
  );
}
