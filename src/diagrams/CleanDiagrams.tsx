import type { StageControls } from "../stage/controls";
import "./CleanDiagrams.css";

const W = 820;
const H = 420;

type ControlProps = {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
};

export function GripRuleDiagram({ controls, onPatchControls }: ControlProps) {
  const northUp = Math.cos(controls.angle) >= 0;
  const reverse = () => onPatchControls?.({ angle: northUp ? Math.PI : 0 });

  return (
    <button
      type="button"
      className="clean-diagram clean-diagram--pressable grip-rule"
      onClick={reverse}
      aria-label={`Reverse current direction. North currently points ${northUp ? "up" : "down"}.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Right-hand grip rule for an electromagnet">
        <defs>
          <marker id="clean-current-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--gold)" />
          </marker>
          <marker id="clean-field-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--wine)" />
          </marker>
        </defs>

        <text className="clean-kicker" x="34" y="34">THE RIGHT-HAND GRIP RULE</text>
        <g transform="translate(54 76)">
          <rect x="126" y="28" width="80" height="230" fill="var(--ink-10)" stroke="var(--ink-20)" />
          {[64, 104, 144, 184, 224].map((y) => (
            <ellipse key={y} cx="166" cy={y} rx="76" ry="17" fill="none" stroke="var(--cat-6)" strokeWidth="10" />
          ))}
          <path
            d={northUp ? "M102 244 C36 210 36 78 102 44" : "M230 44 C296 78 296 210 230 244"}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="5"
            markerEnd="url(#clean-current-arrow)"
          />
          <line
            x1="166"
            y1={northUp ? 262 : 24}
            x2="166"
            y2={northUp ? 8 : 280}
            stroke="var(--wine)"
            strokeWidth="6"
            markerEnd="url(#clean-field-arrow)"
          />
          <circle cx="166" cy={northUp ? 6 : 282} r="22" fill="var(--wine)" />
          <text x="166" y={northUp ? 11 : 287} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="15">N</text>
          <circle cx="166" cy={northUp ? 282 : 6} r="22" fill="var(--ink)" />
          <text x="166" y={northUp ? 287 : 11} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="15">S</text>
        </g>

        <g transform="translate(450 92)">
          <text className="clean-title" x="0" y="0">Curl your fingers with the current.</text>
          <text className="clean-copy" x="0" y="44">Your right-hand fingers follow the current</text>
          <text className="clean-copy" x="0" y="68">around the coil.</text>
          <line x1="0" y1="102" x2="306" y2="102" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="146">Your thumb points to North.</text>
          <text className="clean-copy" x="0" y="190">Reverse the current and the magnetic poles</text>
          <text className="clean-copy" x="0" y="214">reverse with it.</text>
          <text className="clean-hint" x="0" y="278">CLICK ANYWHERE TO REVERSE CURRENT</text>
        </g>
      </svg>
    </button>
  );
}

export function RotatingFieldDiagram({ controls }: ControlProps) {
  const angle = controls.angle;
  const phases = [
    { label: "A", angle: -Math.PI / 2, color: "var(--cat-6)" },
    { label: "B", angle: -Math.PI / 2 + (Math.PI * 2) / 3, color: "var(--cat-5)" },
    { label: "C", angle: -Math.PI / 2 + (Math.PI * 4) / 3, color: "var(--positive)" },
  ];
  const cx = 408;
  const cy = 218;
  const radius = 142;

  return (
    <div className="clean-diagram rotating-field" role="img" aria-label="Three stationary coil groups creating one rotating magnetic field">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="clean-resultant-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--wine)" />
          </marker>
        </defs>
        <text className="clean-kicker" x="34" y="34">THREE STATIONARY PHASES · ONE MOVING FIELD</text>
        <circle cx={cx} cy={cy} r={radius + 38} fill="none" stroke="var(--ink-10)" strokeWidth="28" />
        {phases.map((phase) => {
          const strength = (Math.cos(angle - phase.angle) + 1) / 2;
          const x = cx + Math.cos(phase.angle) * (radius + 38);
          const y = cy + Math.sin(phase.angle) * (radius + 38);
          return (
            <g key={phase.label}>
              <circle cx={x} cy={y} r={30} fill={phase.color} opacity={0.2 + strength * 0.8} />
              <text x={x} y={y + 6} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="16">{phase.label}</text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={112} fill="var(--deep)" stroke="var(--ink-20)" />
        <line
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(angle) * 92}
          y2={cy + Math.sin(angle) * 92}
          stroke="var(--wine)"
          strokeWidth="7"
          markerEnd="url(#clean-resultant-arrow)"
        />
        <circle cx={cx} cy={cy} r={7} fill="var(--wine)" />
        <text className="clean-title" x="34" y="354">The coils do not move.</text>
        <text className="clean-copy" x="34" y="382">The inverter changes which coil is strongest, so the combined field sweeps around the bore.</text>
      </svg>
    </div>
  );
}

export function TorqueCombinationDiagram() {
  return (
    <div className="clean-diagram" role="img" aria-label="Magnet pull and shaped steel alignment turning one shaft">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">ONE ROTOR · TWO SOURCES OF TORQUE</text>
        <g transform="translate(84 92)">
          <circle cx="150" cy="120" r="112" fill="var(--deep)" stroke="var(--ink-20)" strokeWidth="2" />
          <circle cx="150" cy="120" r="36" fill="var(--ink-20)" />
          {[0, 90, 180, 270].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 150 120)`}>
              <path d="M125 42 L143 84 L157 84 L175 42 Z" fill="var(--cat-5)" />
              <path d="M112 50 L127 91 L110 100 L88 64 Z" fill="none" stroke="var(--wine)" strokeWidth="4" />
            </g>
          ))}
        </g>
        <g transform="translate(420 90)">
          <rect x="0" y="0" width="330" height="92" fill="var(--deep)" stroke="var(--ink-10)" />
          <rect x="0" y="0" width="4" height="92" fill="var(--cat-5)" />
          <text className="clean-title" x="22" y="34">Magnet pull</text>
          <text className="clean-copy" x="22" y="62">Buried permanent magnets follow the stator field.</text>
          <rect x="0" y="116" width="330" height="92" fill="var(--deep)" stroke="var(--ink-10)" />
          <rect x="0" y="116" width="4" height="92" fill="var(--wine)" />
          <text className="clean-title" x="22" y="150">Steel alignment</text>
          <text className="clean-copy" x="22" y="178">Shaped steel also turns toward the easiest magnetic path.</text>
          <text className="clean-hint" x="0" y="266">BOTH TURN THE SAME SHAFT · LESS MAGNET IS NEEDED</text>
        </g>
      </svg>
    </div>
  );
}

export function MagnetJobsDiagram() {
  return (
    <div className="clean-diagram" role="img" aria-label="Iron provides magnetic strength while neodymium helps lock the field direction">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">WHY NdFeB WORKS IN A TRACTION MOTOR</text>
        <g transform="translate(54 92)">
          <rect x="0" y="0" width="274" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol" x="28" y="62">Fe</text>
          <text className="clean-title" x="28" y="108">Strength</text>
          <text className="clean-copy" x="28" y="144">Iron provides most of the</text>
          <text className="clean-copy" x="28" y="168">magnetic pulling power.</text>
          <rect x="328" y="0" width="274" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol clean-symbol--wine" x="356" y="62">Nd/Pr</text>
          <text className="clean-title" x="356" y="108">Direction</text>
          <text className="clean-copy" x="356" y="144">Rare-earth chemistry helps the</text>
          <text className="clean-copy" x="356" y="168">field resist being reversed.</text>
          <path d="M278 106 H324" stroke="var(--wine)" strokeWidth="2" />
          <circle cx="301" cy="106" r="18" fill="var(--wine)" />
          <text x="301" y="111" textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="14">+</text>
          <text className="clean-title" x="301" y="276" textAnchor="middle">Together: a strong, compact permanent magnet.</text>
        </g>
      </svg>
    </div>
  );
}

export function RareEarthSplitDiagram() {
  return (
    <div className="clean-diagram" role="img" aria-label="Light and heavy rare earth roles in an NdFeB traction magnet">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">THE MAGNET CONTAINS TWO DIFFERENT SUPPLY PROBLEMS</text>
        <g transform="translate(54 88)">
          <rect x="0" y="0" width="500" height="66" fill="var(--cat-5)" />
          <rect x="506" y="0" width="184" height="66" fill="var(--wine)" />
          <rect x="696" y="0" width="34" height="66" fill="var(--gold)" />
          <text x="250" y="40" textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="13">IRON · MAIN BODY</text>
          <text x="598" y="40" textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="12">Nd / Pr</text>
          <text x="713" y="40" textAnchor="middle" fill="var(--ink)" fontFamily="var(--mono)" fontSize="11">Dy/Tb</text>
          <rect x="0" y="116" width="350" height="168" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-title" x="24" y="154">Light rare earths</text>
          <text className="clean-copy" x="24" y="194">Neodymium and praseodymium make up</text>
          <text className="clean-copy" x="24" y="218">most of the rare-earth content.</text>
          <text className="clean-hint" x="24" y="260">NOT NAMED IN THE APRIL 2025 NOTICE</text>
          <rect x="380" y="116" width="350" height="168" fill="var(--deep)" stroke="var(--wine)" />
          <text className="clean-title" x="404" y="154">Heavy rare earths</text>
          <text className="clean-copy" x="404" y="194">A small Dy/Tb addition protects the magnet</text>
          <text className="clean-copy" x="404" y="218">when the rotor is hot.</text>
          <text className="clean-hint clean-hint--wine" x="404" y="260">SUBJECT TO THE APRIL 2025 LICENCE GATE</text>
        </g>
      </svg>
    </div>
  );
}

export function HeatProtectionDiagram({ controls }: ControlProps) {
  const heat = Math.max(0, Math.min(1, controls.heat));
  const protection = Math.max(0, Math.min(1, controls.dysprosium * 2.5));
  const unprotected = Math.max(12, 100 - heat * 86);
  const protectedMargin = Math.min(100, unprotected + protection * 42);

  return (
    <div className="clean-diagram" role="img" aria-label="Heat reduces a magnet's reversal margin while dysprosium and terbium restore protection">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">WHY A HOT ROTOR NEEDS Dy OR Tb</text>
        <g transform="translate(70 94)">
          <text className="clean-title" x="0" y="0">Heat weakens resistance to reversal.</text>
          <rect x="0" y="38" width="660" height="34" fill="var(--ink-10)" />
          <rect x="0" y="38" width={660 * (unprotected / 100)} height="34" fill="var(--cat-6)" />
          <text className="clean-hint" x="0" y="94">HOT NdFeB · SHRINKING SAFETY MARGIN</text>
          <text className="clean-title" x="0" y="154">A small Dy/Tb addition restores protection.</text>
          <rect x="0" y="192" width="660" height="34" fill="var(--ink-10)" />
          <rect x="0" y="192" width={660 * (protectedMargin / 100)} height="34" fill="var(--wine)" />
          <text className="clean-hint clean-hint--wine" x="0" y="248">HIGH-TEMPERATURE PROTECTION · GREATER SUPPLY EXPOSURE</text>
          <line x1="0" y1="292" x2="660" y2="292" stroke="var(--ink-10)" />
          <text className="clean-copy" x="0" y="326">The engineering value is thermal protection—not extra torque.</text>
        </g>
      </svg>
    </div>
  );
}

export function MitigationOptionsDiagram() {
  const rows = [
    ["1", "Cool the rotor", "Lower the temperature the magnet must survive"],
    ["2", "Protect only the grain edge", "Use Dy/Tb where reversal begins, not through the whole magnet"],
    ["3", "Qualify HREE-free NdFeB", "Keep the proven PMSM architecture and remove heavy rare earths"],
  ];
  return (
    <div className="clean-diagram clean-list-board" role="img" aria-label="Three low-disruption ways to reduce heavy rare earths">
      <p className="clean-kicker-html">THREE WAYS TO KEEP THE MOTOR AND REDUCE THE EXPOSURE</p>
      <div className="clean-list-board__rows">
        {rows.map(([n, title, copy]) => (
          <div className="clean-list-row" key={n}>
            <span className="clean-list-row__number">{n}</span>
            <strong>{title}</strong>
            <span>{copy}</span>
            <em>same PMSM</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlternativesMapDiagram() {
  const families = [
    ["PM", "Permanent field", "Rare-earth exposure"],
    ["INDUCTION", "Induced cage current", "Rotor heat / slip"],
    ["WOUND", "Powered rotor coil", "Excitation hardware"],
    ["SynRM", "Shaped steel", "Inverter / size"],
    ["SRM", "Toothed steel", "Noise / ripple"],
  ];
  return (
    <div className="clean-diagram clean-family-map" role="img" aria-label="Five traction motor families and how each creates rotor torque">
      <p className="clean-kicker-html">THE ROTOR FIELD CAN COME FROM FIVE DIFFERENT PLACES</p>
      <div className="clean-family-map__grid">
        {families.map(([name, principle, trade]) => (
          <div className={`clean-family ${name === "PM" ? "is-reference" : ""}`} key={name}>
            <span className="clean-family__mark" aria-hidden="true" />
            <strong>{name}</strong>
            <span>{principle}</span>
            <em>{trade}</em>
          </div>
        ))}
      </div>
      <p className="clean-board-note">No alternative wins every measure. Each removes one burden and creates another.</p>
    </div>
  );
}

export function ChangeBurdenDiagram() {
  const routes = [
    ["LOWEST CHANGE", "Reduce Dy/Tb", "Magnet supply and qualification"],
    ["MOTOR REDESIGN", "Ferrite", "Larger or faster machine"],
    ["PLATFORM WORK", "Induction · Wound field · Reluctance", "Motor, inverter, cooling and controls"],
  ];
  return (
    <div className="clean-diagram clean-burden" role="img" aria-label="Implementation burden from material change to new motor architecture">
      <p className="clean-kicker-html">NOT ALL SUBSTITUTIONS ARE THE SAME SIZE</p>
      <div className="clean-burden__axis" aria-hidden="true" />
      <div className="clean-burden__routes">
        {routes.map(([level, title, copy], index) => (
          <div className="clean-burden__route" key={level}>
            <span className="clean-burden__dot" style={{ left: `${index * 50}%` }} />
            <small>{level}</small>
            <strong>{title}</strong>
            <span>{copy}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadinessMapDiagram() {
  const lanes = [
    ["LOW-DISRUPTION QUALIFICATION", "Cooling · grain-boundary diffusion · HREE-free NdFeB", "Keep the PMSM architecture"],
    ["PRODUCTION-CAPABLE ARCHITECTURES", "Induction · externally excited wound field", "Proven motor types; new vehicle integration"],
    ["PILOT OR MATERIALS DEVELOPMENT", "Ferrite traction · contactless wound field · SRM · iron nitride", "Evidence and maturity differ by programme"],
  ];
  return (
    <div className="clean-diagram clean-readiness" role="img" aria-label="Readiness categories for rare-earth reduction and alternative motor routes">
      <p className="clean-kicker-html">TECHNOLOGY READINESS IS NOT THE SAME AS SUBSTITUTION EASE</p>
      {lanes.map(([label, names, note], index) => (
        <div className="clean-readiness__lane" key={label}>
          <span className="clean-readiness__index">0{index + 1}</span>
          <div>
            <small>{label}</small>
            <strong>{names}</strong>
            <span>{note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DecisionSummaryDiagram() {
  const points = [
    ["UNDERSTAND", "A PMSM uses a rotating stator field to pull a permanent-magnet rotor."],
    ["COMPARE", "Alternative rotors use induced current, powered coils or shaped steel."],
    ["DECIDE", "Judge supply exposure together with efficiency, size, controls and integration burden."],
  ];
  return (
    <div className="clean-diagram clean-summary" role="img" aria-label="Three conclusions from the permanent magnet motor alternatives walkthrough">
      <p className="clean-kicker-html">THE WHOLE ARGUMENT</p>
      <div className="clean-summary__grid">
        {points.map(([label, copy], index) => (
          <div className="clean-summary__point" key={label}>
            <span>0{index + 1}</span>
            <small>{label}</small>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
