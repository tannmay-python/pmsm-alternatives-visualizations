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

export function RotorFollowsFieldDiagram({ controls }: ControlProps) {
  const cx = 244;
  const cy = 218;
  const fieldDegrees = (controls.angle * 180) / Math.PI;
  const loadAngle = 26;
  const rotorDegrees = fieldDegrees - loadAngle;

  return (
    <div className="clean-diagram clean-diagram--mechanism" role="img" aria-label="A permanent-magnet rotor following a rotating stator field at a small constant angle">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="clean-stator-field-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--wine)" />
          </marker>
          <marker id="clean-rotor-axis-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--gold)" />
          </marker>
        </defs>
        <text className="clean-kicker" x="34" y="34">THE FIELD LEADS · THE ROTOR FOLLOWS</text>
        <circle cx={cx} cy={cy} r="154" fill="none" stroke="var(--ink-10)" strokeWidth="28" />
        {[0, 60, 120, 180, 240, 300].map((degree) => (
          <rect
            key={degree}
            x={cx - 18}
            y={cy - 164}
            width="36"
            height="34"
            fill="var(--cat-6)"
            opacity="0.72"
            transform={`rotate(${degree} ${cx} ${cy})`}
          />
        ))}
        <g transform={`rotate(${rotorDegrees} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r="92" fill="var(--deep)" stroke="var(--ink-20)" strokeWidth="2" />
          <rect x={cx - 62} y={cy - 17} width="124" height="34" fill="var(--gold)" />
          <rect x={cx - 62} y={cy - 17} width="62" height="34" fill="var(--wine)" />
          <text x={cx - 38} y={cy + 6} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="14">S</text>
          <text x={cx + 38} y={cy + 6} textAnchor="middle" fill="var(--ink)" fontFamily="var(--mono)" fontWeight="700" fontSize="14">N</text>
          <line x1={cx} y1={cy} x2={cx + 122} y2={cy} stroke="var(--gold)" strokeWidth="5" markerEnd="url(#clean-rotor-axis-arrow)" />
        </g>
        <g transform={`rotate(${fieldDegrees} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx + 142} y2={cy} stroke="var(--wine)" strokeWidth="7" markerEnd="url(#clean-stator-field-arrow)" />
        </g>
        <circle cx={cx} cy={cy} r="8" fill="var(--ink)" />
        <path
          d={`M ${cx + 116 * Math.cos((rotorDegrees * Math.PI) / 180)} ${cy + 116 * Math.sin((rotorDegrees * Math.PI) / 180)} A 116 116 0 0 1 ${cx + 116 * Math.cos((fieldDegrees * Math.PI) / 180)} ${cy + 116 * Math.sin((fieldDegrees * Math.PI) / 180)}`}
          fill="none"
          stroke="var(--ink-50)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        <g transform="translate(468 100)">
          <text className="clean-title" x="0" y="0">Stator field</text>
          <line x1="0" y1="18" x2="54" y2="18" stroke="var(--wine)" strokeWidth="6" />
          <text className="clean-copy" x="72" y="23">moves slightly ahead</text>
          <text className="clean-title" x="0" y="86">Rotor magnetic axis</text>
          <line x1="0" y1="104" x2="54" y2="104" stroke="var(--gold)" strokeWidth="6" />
          <text className="clean-copy" x="72" y="109">follows at the same speed</text>
          <line x1="0" y1="148" x2="298" y2="148" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="190">A small angle stays between them.</text>
          <text className="clean-copy" x="0" y="226">That steady offset keeps pulling the rotor</text>
          <text className="clean-copy" x="0" y="250">forward and produces shaft torque.</text>
        </g>
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
        <text className="clean-kicker" x="34" y="34">NEODYMIUM–IRON–BORON · Nd₂Fe₁₄B</text>
        <g transform="translate(54 92)">
          <rect x="0" y="0" width="214" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol" x="28" y="62">Fe</text>
          <text className="clean-title" x="28" y="108">Strength</text>
          <text className="clean-copy" x="28" y="144">Iron provides most of the</text>
          <text className="clean-copy" x="28" y="168">magnetic pulling power.</text>
          <rect x="242" y="0" width="214" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol clean-symbol--wine" x="270" y="62">Nd/Pr</text>
          <text className="clean-title" x="270" y="108">Direction</text>
          <text className="clean-copy" x="270" y="144">Rare-earth chemistry helps the</text>
          <text className="clean-copy" x="270" y="168">field resist being reversed.</text>
          <rect x="484" y="0" width="214" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol" x="512" y="62">B</text>
          <text className="clean-title" x="512" y="108">Structure</text>
          <text className="clean-copy" x="512" y="144">Boron stabilises the crystal</text>
          <text className="clean-copy" x="512" y="168">structure of the alloy.</text>
          <text className="clean-title" x="349" y="276" textAnchor="middle">Together they make a strong, compact permanent magnet.</text>
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
          <rect x="506" y="0" width="168" height="66" fill="var(--wine)" />
          <rect x="680" y="0" width="50" height="66" fill="var(--gold)" />
          <text x="250" y="40" textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="13">IRON · MAIN BODY</text>
          <text x="590" y="40" textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="12">Nd / Pr</text>
          <text x="705" y="40" textAnchor="middle" fill="var(--ink)" fontFamily="var(--mono)" fontSize="12" fontWeight="700">Dy/Tb</text>
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
          <text className="clean-hint" x="0" y="316">SCHEMATIC COMPOSITION · NOT TO SCALE</text>
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
          <text className="clean-copy" x="0" y="326">Dy/Tb protects the magnet against reversal at high temperature.</text>
        </g>
      </svg>
    </div>
  );
}

export function MitigationOptionsDiagram() {
  const rows = [
    ["1", "Cool the rotor", "Lower the temperature the magnet must survive", "adds cooling hardware"],
    ["2", "Protect only the grain edge", "Use Dy/Tb where reversal begins instead of through the whole magnet", "new magnet process"],
    ["3", "Qualify HREE-free NdFeB", "Keep the PMSM architecture and remove heavy rare earths", "long qualification"],
  ];
  return (
    <div className="clean-diagram clean-list-board" role="img" aria-label="Three low-disruption ways to reduce heavy rare earths">
      <p className="clean-kicker-html">THREE WAYS TO KEEP THE MOTOR AND REDUCE THE EXPOSURE</p>
      <div className="clean-list-board__rows">
        {rows.map(([n, title, copy, burden]) => (
          <div className="clean-list-row" key={n}>
            <span className="clean-list-row__number">{n}</span>
            <strong>{title}</strong>
            <span>{copy}</span>
            <em>{burden}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlternativesMapDiagram() {
  const families = [
    ["PM MOTOR", "Permanent magnet follows the stator field", "Rare-earth magnet supply"],
    ["INDUCTION", "Current induced in a rotor cage", "Slip creates rotor heat"],
    ["WOUND FIELD", "A powered rotor electromagnet", "Power feed and cooling"],
    ["SynRM", "Shaped steel aligns with the field", "Larger motor or inverter"],
    ["SRM", "Stator pulls one rotor tooth at a time", "Uneven torque and noise"],
  ];
  return (
    <div className="clean-diagram clean-family-map" role="img" aria-label="Five traction motor families and how each creates rotor torque">
      <p className="clean-kicker-html">FIVE WAYS TO MAKE THE ROTOR TURN</p>
      <div className="clean-family-map__grid">
        {families.map(([name, principle, trade]) => (
          <div className={`clean-family ${name === "PM MOTOR" ? "is-reference" : ""}`} key={name}>
            <span className="clean-family__mark" aria-hidden="true" />
            <strong>{name}</strong>
            <span>{principle}</span>
            <em>{trade}</em>
          </div>
        ))}
      </div>
      <p className="clean-board-note">The next frames show the mechanism first, then the rare-earth exposure and the engineering cost.</p>
    </div>
  );
}

export function SynRMMechanismDiagram({ controls }: ControlProps) {
  const cx = 246;
  const cy = 220;
  const fieldDegrees = (controls.angle * 180) / Math.PI;
  const rotorDegrees = fieldDegrees - 32;

  return (
    <div className="clean-diagram clean-diagram--mechanism" role="img" aria-label="A synchronous reluctance rotor turning to align its easy magnetic path with the stator field">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="synrm-field-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,1 L10,5 L0,9 z" fill="var(--wine)" />
          </marker>
        </defs>
        <text className="clean-kicker" x="34" y="34">SYNCHRONOUS RELUCTANCE MOTOR · SynRM</text>
        <circle cx={cx} cy={cy} r="156" fill="none" stroke="var(--ink-10)" strokeWidth="28" />
        <g transform={`rotate(${rotorDegrees} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r="100" fill="var(--cat-5)" stroke="var(--ink-20)" strokeWidth="2" />
          {[-42, -14, 14, 42].map((offset) => (
            <path key={offset} d={`M ${cx - 74} ${cy + offset} Q ${cx} ${cy + offset * 0.35} ${cx + 74} ${cy + offset}`} fill="none" stroke="var(--deep)" strokeWidth="11" strokeLinecap="round" />
          ))}
          <line x1={cx - 116} y1={cy} x2={cx + 116} y2={cy} stroke="var(--gold)" strokeWidth="4" strokeDasharray="7 5" />
        </g>
        <g transform={`rotate(${fieldDegrees} ${cx} ${cy})`}>
          <line x1={cx} y1={cy} x2={cx + 146} y2={cy} stroke="var(--wine)" strokeWidth="7" markerEnd="url(#synrm-field-arrow)" />
        </g>
        <circle cx={cx} cy={cy} r="8" fill="var(--ink)" />

        <g transform="translate(468 94)">
          <text className="clean-title" x="0" y="0">What turns the rotor</text>
          <text className="clean-copy" x="0" y="34">Air barriers shape an easy path for flux.</text>
          <text className="clean-copy" x="0" y="58">The stator field pulls that path into line.</text>
          <line x1="0" y1="88" x2="300" y2="88" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="128">Rare-earth exposure</text>
          <text className="clean-copy" x="0" y="162">None in the rotor.</text>
          <line x1="0" y1="192" x2="300" y2="192" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="232">Engineering cost</text>
          <text className="clean-copy" x="0" y="266">More inverter capability or a larger motor</text>
          <text className="clean-copy" x="0" y="290">may be needed for the same vehicle duty.</text>
        </g>
      </svg>
    </div>
  );
}

export function SRMMechanismDiagram({ controls }: ControlProps) {
  const cx = 246;
  const cy = 220;
  const normalized = ((controls.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const active = Math.floor(normalized / (Math.PI / 3)) % 6;
  const fieldDegrees = active * 60 - 90;
  const rotorDegrees = fieldDegrees - 22;

  return (
    <div className="clean-diagram clean-diagram--mechanism" role="img" aria-label="A switched reluctance motor energising stator poles in sequence to pull rotor teeth into alignment">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">SWITCHED RELUCTANCE MOTOR · SRM</text>
        <circle cx={cx} cy={cy} r="158" fill="none" stroke="var(--ink-10)" strokeWidth="20" />
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const isActive = index === active || index === (active + 3) % 6;
          return (
            <g key={index} transform={`rotate(${index * 60} ${cx} ${cy})`}>
              <rect x={cx - 24} y={cy - 166} width="48" height="54" fill={isActive ? "var(--wine)" : "var(--cat-6)"} opacity={isActive ? 1 : 0.28} />
            </g>
          );
        })}
        <g transform={`rotate(${rotorDegrees} ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r="62" fill="var(--cat-5)" />
          {[0, 90, 180, 270].map((degree) => (
            <rect key={degree} x={cx - 25} y={cy - 108} width="50" height="66" fill="var(--cat-5)" transform={`rotate(${degree} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r="16" fill="var(--ink)" />
        </g>
        <path d={`M ${cx + 116 * Math.cos(((fieldDegrees - 22) * Math.PI) / 180)} ${cy + 116 * Math.sin(((fieldDegrees - 22) * Math.PI) / 180)} A 116 116 0 0 1 ${cx + 116 * Math.cos((fieldDegrees * Math.PI) / 180)} ${cy + 116 * Math.sin((fieldDegrees * Math.PI) / 180)}`} fill="none" stroke="var(--gold)" strokeWidth="5" />

        <g transform="translate(468 94)">
          <text className="clean-title" x="0" y="0">What turns the rotor</text>
          <text className="clean-copy" x="0" y="34">The active stator poles pull the nearest</text>
          <text className="clean-copy" x="0" y="58">steel tooth into line, then the next pair fires.</text>
          <line x1="0" y1="88" x2="300" y2="88" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="128">Rare-earth exposure</text>
          <text className="clean-copy" x="0" y="162">None in the rotor.</text>
          <line x1="0" y1="192" x2="300" y2="192" stroke="var(--ink-10)" />
          <text className="clean-title" x="0" y="232">Engineering cost</text>
          <text className="clean-copy" x="0" y="266">The separate pulls make torque less even.</text>
          <text className="clean-copy" x="0" y="290">Control and acoustic work become important.</text>
        </g>
      </svg>
    </div>
  );
}

export function FerriteComparisonDiagram() {
  const motors = [
    { cx: 210, r: 98, magnet: "var(--wine)", label: "NdFeB PMSM", note: "strong field · compact rotor", slots: 4 },
    { cx: 600, r: 128, magnet: "var(--gold)", label: "Ferrite PMSM", note: "weaker field · more material and space", slots: 8 },
  ];

  return (
    <div className="clean-diagram clean-diagram--mechanism" role="img" aria-label="Side-by-side comparison of a compact NdFeB permanent-magnet motor and a larger ferrite permanent-magnet motor">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <text className="clean-kicker" x="34" y="34">SAME MOTOR PRINCIPLE · DIFFERENT MAGNET STRENGTH</text>
        {motors.map((motor) => (
          <g key={motor.label}>
            <circle cx={motor.cx} cy="208" r={motor.r + 28} fill="none" stroke="var(--ink-10)" strokeWidth="22" />
            <circle cx={motor.cx} cy="208" r={motor.r} fill="var(--cat-5)" stroke="var(--ink-20)" strokeWidth="2" />
            {Array.from({ length: motor.slots }, (_, index) => (
              <rect
                key={index}
                x={motor.cx - 9}
                y={208 - motor.r + 18}
                width="18"
                height={motor.slots === 4 ? 38 : 56}
                fill={motor.magnet}
                transform={`rotate(${(360 / motor.slots) * index} ${motor.cx} 208)`}
              />
            ))}
            <circle cx={motor.cx} cy="208" r="20" fill="var(--ink)" />
            <text className="clean-title" x={motor.cx} y="370" textAnchor="middle">{motor.label}</text>
            <text className="clean-copy" x={motor.cx} y="396" textAnchor="middle">{motor.note}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function ChangeBurdenDiagram() {
  const routes = [
    ["KEEP THE MOTOR", "Reduce Dy/Tb", "Gain: lower heavy-rare-earth exposure", "Work: cooling or magnet qualification"],
    ["REDESIGN THE MOTOR", "Ferrite PMSM", "Gain: no rare earths in the magnet", "Work: more size, speed or new geometry"],
    ["REDESIGN THE DRIVE UNIT", "Induction · wound field · reluctance", "Gain: no permanent magnet", "Work: motor, inverter, cooling and controls"],
  ];
  return (
    <div className="clean-diagram clean-burden" role="img" aria-label="Implementation burden from material change to new motor architecture">
      <p className="clean-kicker-html">IMPLEMENTATION BURDEN GROWS FROM MAGNET TO DRIVE UNIT</p>
      <div className="clean-burden__axis" aria-hidden="true" />
      <div className="clean-burden__routes">
        {routes.map(([level, title, gain, burden], index) => (
          <div className="clean-burden__route" key={level}>
            <span className="clean-burden__dot" style={{ left: `${index * 50}%` }} />
            <small>{level}</small>
            <strong>{title}</strong>
            <span>{gain}</span>
            <span>{burden}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReadinessMapDiagram() {
  const routes = [
    ["Reduced-Dy/Tb NdFeB", "Permanent magnet", "Lower HREE", "Cooling and qualification", "In production"],
    ["Ferrite PMSM", "Permanent magnet", "No rare earths", "More size or speed", "Vehicle prototypes"],
    ["Induction", "Induced cage current", "No rotor rare earths", "Slip loss and rotor heat", "In production"],
    ["Wound field", "Powered rotor coil", "No rotor rare earths", "Power feed and cooling", "In production"],
    ["SynRM", "Shaped steel alignment", "No rotor rare earths", "Inverter or motor size", "Limited passenger-EV use"],
    ["SRM", "Sequential tooth pull", "No rotor rare earths", "Noise and uneven torque", "Limited passenger-EV use"],
  ];
  return (
    <div className="clean-diagram clean-readiness" role="img" aria-label="Readiness categories for rare-earth reduction and alternative motor routes">
      <p className="clean-kicker-html">THE SAME FOUR QUESTIONS FOR EVERY ROUTE</p>
      <div className="clean-readiness__table">
        <div className="clean-readiness__head" aria-hidden="true">
          <span>Route</span><span>What turns the rotor</span><span>REE exposure</span><span>Main penalty</span><span>Automotive state</span>
        </div>
        {routes.map(([name, mechanism, exposure, penalty, state]) => (
          <div className="clean-readiness__row" key={name}>
            <strong>{name}</strong><span>{mechanism}</span><span>{exposure}</span><span>{penalty}</span><em>{state}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DecisionSummaryDiagram() {
  const points = [
    ["NOW", "Use better rotor cooling, grain-boundary diffusion and lower-HREE magnets in current PMSM programmes."],
    ["NEXT VEHICLE PLATFORM", "Consider ferrite, induction or wound field when the vehicle can absorb a redesigned drive unit."],
    ["TARGETED R&D", "Develop SynRM and SRM where their inverter, size, noise and control penalties fit the vehicle duty."],
  ];
  return (
    <div className="clean-diagram clean-summary" role="img" aria-label="Three conclusions from the permanent magnet motor alternatives walkthrough">
      <p className="clean-kicker-html">THREE IMPLEMENTATION HORIZONS</p>
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
