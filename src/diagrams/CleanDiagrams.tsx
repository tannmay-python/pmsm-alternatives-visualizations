import type { ReactNode } from "react";
import type { StageControls } from "../stage/controls";
import "./CleanDiagrams.css";

const W = 820;
const H = 420;

type ControlProps = {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
};

/* ── Shared vocabulary ──────────────────────────────────────────────────
 *
 * Every motor cross-section is built from the same three pieces so a reader
 * who has decoded one frame has decoded them all: a grey StatorRing with six
 * copper coil slots labelled A B C A B C, a RotorDisc in --deep, and V-pairs
 * of magnets in --wine. Steel is always --cat-5, the stator field arrow is
 * always --wine, the rotor's own axis is always --gold.
 *
 * Screen rotation is counter-clockwise (the positive mathematical sense) so
 * that the coils, read clockwise as A B C, take turns in alphabetical order.
 */

const FIG = 440;
const C = FIG / 2;
const RING_R = 150;
const RING_W = 30;
const ROTOR_R = 104;
const COIL_ANGLES = [0, 1, 2, 3, 4, 5].map((k) => -90 + k * 60);
const COIL_LABELS = ["A", "B", "C", "A", "B", "C"];

const toScreenDeg = (radians: number) => (-radians * 180) / Math.PI;
const rad = (deg: number) => (deg * Math.PI) / 180;
const polar = (cx: number, cy: number, r: number, deg: number) =>
  [cx + Math.cos(rad(deg)) * r, cy + Math.sin(rad(deg)) * r] as const;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** Coil brightness for a field pointing at `fieldDeg`: bright along its axis, dim across it. */
const coilStrengths = (fieldDeg: number) =>
  COIL_ANGLES.map((deg) => {
    const s = Math.abs(Math.cos(rad(fieldDeg - deg)));
    return s * s;
  });

function Arrowheads({ id }: { id: string }) {
  return (
    <defs>
      {[
        ["wine", "var(--wine)"],
        ["gold", "var(--gold)"],
        ["ink", "var(--ink-50)"],
      ].map(([name, fill]) => (
        <marker key={name} id={`${id}-${name}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,1 L10,5 L0,9 z" fill={fill} />
        </marker>
      ))}
    </defs>
  );
}

function StatorRing({
  cx = C,
  cy = C,
  r = RING_R,
  strengths,
  labels = true,
}: {
  cx?: number;
  cy?: number;
  r?: number;
  /** Six values 0–1; omitted means every coil is drawn at rest. */
  strengths?: number[];
  labels?: boolean;
}) {
  const k = r / RING_R;
  const w = RING_W * k;
  const bw = 38 * k;
  const bh = 20 * k;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-10)" strokeWidth={w} />
      {COIL_ANGLES.map((deg, index) => {
        const s = strengths ? strengths[index] : 0.55;
        const [x, y] = polar(cx, cy, r, deg);
        const [lx, ly] = polar(cx, cy, r + w / 2 + 20 * k, deg);
        return (
          <g key={deg}>
            <g transform={`rotate(${deg + 90} ${x} ${y})`}>
              <rect x={x - bw / 2} y={y - bh / 2} width={bw} height={bh} rx={2 * k} fill="var(--cat-6)" opacity={0.22 + s * 0.78} />
              {[-0.25, 0, 0.25].map((t) => (
                <line key={t} x1={x + bw * t} y1={y - bh / 2 + 3 * k} x2={x + bw * t} y2={y + bh / 2 - 3 * k} stroke="var(--paper)" strokeOpacity="0.55" strokeWidth={1.5 * k} />
              ))}
            </g>
            {labels ? (
              <text x={lx} y={ly + 4 * k} textAnchor="middle" fill="var(--ink-50)" fontFamily="var(--mono)" fontSize={11 * k}>
                {COIL_LABELS[index]}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function RotorDisc({
  cx = C,
  cy = C,
  r = ROTOR_R,
  rotate = 0,
  fill = "var(--deep)",
  children,
}: {
  cx?: number;
  cy?: number;
  r?: number;
  rotate?: number;
  fill?: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke="var(--ink-20)" strokeWidth="2" />
      {children}
    </g>
  );
}

/** A V-pair of buried magnets, apex toward the shaft, opening toward the air gap. */
function VPair({
  cx,
  cy,
  r,
  angle,
  color,
  thick = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  angle: number;
  color: string;
  thick?: number;
}) {
  const len = r * 0.46;
  const wid = r * 0.105 * thick;
  const bx = cx + r * 0.6;
  const off = r * 0.19;
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <rect x={bx - len / 2} y={cy - off - wid / 2} width={len} height={wid} fill={color} transform={`rotate(-32 ${bx} ${cy - off})`} />
      <rect x={bx - len / 2} y={cy + off - wid / 2} width={len} height={wid} fill={color} transform={`rotate(32 ${bx} ${cy + off})`} />
    </g>
  );
}

function FieldArrow({ deg, id, length = 126, cx = C, cy = C }: { deg: number; id: string; length?: number; cx?: number; cy?: number }) {
  const [x, y] = polar(cx, cy, length, deg);
  return <line x1={cx} y1={cy} x2={x} y2={y} stroke="var(--wine)" strokeWidth="6" strokeLinecap="round" markerEnd={`url(#${id}-wine)`} />;
}

function AxisArrow({ deg, id, from = 0, length = 126, cx = C, cy = C }: { deg: number; id: string; from?: number; length?: number; cx?: number; cy?: number }) {
  const [x0, y0] = polar(cx, cy, from, deg);
  const [x, y] = polar(cx, cy, length, deg);
  return <line x1={x0} y1={y0} x2={x} y2={y} stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" markerEnd={`url(#${id}-gold)`} />;
}

/** Fixed curved arrow in the upper-right of the rotor: which way everything turns. */
function TurnArrow({ id, r = 90 }: { id: string; r?: number }) {
  const [x0, y0] = polar(C, C, r, -18);
  const [x1, y1] = polar(C, C, r, -72);
  return <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1} ${y1}`} fill="none" stroke="var(--ink-50)" strokeWidth="2" markerEnd={`url(#${id}-ink)`} />;
}

/** Dashed arc between the leading field and the following rotor axis. */
function LagArc({ from, to, r = 112 }: { from: number; to: number; r?: number }) {
  const [x0, y0] = polar(C, C, r, from);
  const [x1, y1] = polar(C, C, r, to);
  return <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`} fill="none" stroke="var(--ink-50)" strokeWidth="2" strokeDasharray="4 4" />;
}

function Aside({ children }: { children: ReactNode }) {
  return <div className="clean-mech__aside" data-scrolls>{children}</div>;
}

/* ── 5 · Grip rule ──────────────────────────────────────────────────────── */

export function GripRuleDiagram({ controls, onPatchControls }: ControlProps) {
  const northUp = Math.cos(controls.angle) >= 0;
  const reverse = () => onPatchControls?.({ angle: northUp ? Math.PI : 0 });
  const cx = 200;
  const cy = 230;

  return (
    <button
      type="button"
      className="clean-diagram clean-mech clean-diagram--pressable grip-rule"
      onClick={reverse}
      aria-label={`Reverse current direction. North currently points ${northUp ? "up" : "down"}.`}
    >
      <div className="clean-mech__figure">
        <svg viewBox="0 0 400 460" role="img" aria-label="A right hand gripping an electromagnet coil, fingers along the current, thumb toward north">
          <Arrowheads id="grip" />

          {/* Core, winding and the field axis, all behind the hand */}
          <rect x={cx - 40} y={cy - 122} width="80" height="244" fill="var(--ink-10)" stroke="var(--ink-20)" />
          {[-100, -60, -20, 20, 60, 100].map((dy) => (
            <ellipse key={dy} cx={cx} cy={cy + dy} rx="76" ry="16" fill="none" stroke="var(--cat-6)" strokeWidth="9" />
          ))}
          <line x1={cx} y1={northUp ? cy + 130 : cy - 130} x2={cx} y2={northUp ? cy - 150 : cy + 150} stroke="var(--wine)" strokeWidth="5" markerEnd="url(#grip-wine)" />

          {/* Right hand, drawn for north-up. A half turn keeps it a right hand for north-down. */}
          <g transform={northUp ? undefined : `rotate(180 ${cx} ${cy})`} fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            {/* thumb, pointing along the axis toward N */}
            <path d={`M ${cx - 118} ${cy - 56} C ${cx - 128} ${cy - 90} ${cx - 120} ${cy - 132} ${cx - 102} ${cy - 154} C ${cx - 92} ${cy - 166} ${cx - 74} ${cy - 160} ${cx - 76} ${cy - 144} C ${cx - 80} ${cy - 118} ${cx - 82} ${cy - 90} ${cx - 78} ${cy - 60}`} />
            {/* palm */}
            <path d={`M ${cx - 128} ${cy - 58} C ${cx - 142} ${cy - 30} ${cx - 144} ${cy + 36} ${cx - 130} ${cy + 88} C ${cx - 122} ${cy + 108} ${cx - 84} ${cy + 108} ${cx - 74} ${cy + 88} L ${cx - 74} ${cy - 62} C ${cx - 84} ${cy - 76} ${cx - 116} ${cy - 76} ${cx - 128} ${cy - 58} Z`} />
            {/* four fingers curling across the front of the coil */}
            {[-56, -22, 12, 46].map((t, i) => {
              const h = 26;
              const sag = 9 + i * 1.5;
              const x0 = cx - 76;
              const x1 = cx + 70;
              return (
                <path
                  key={t}
                  d={`M ${x0} ${cy + t} C ${cx - 30} ${cy + t + sag} ${cx + 30} ${cy + t + sag} ${x1} ${cy + t + sag / 2} C ${x1 + 18} ${cy + t + sag / 2} ${x1 + 18} ${cy + t + h - sag / 2} ${x1} ${cy + t + h - sag / 2} C ${cx + 30} ${cy + t + h + sag} ${cx - 30} ${cy + t + h + sag} ${x0} ${cy + t + h}`}
                />
              );
            })}
            {/* current, running along the middle finger toward the fingertips */}
            <path
              d={`M ${cx - 62} ${cy - 6} C ${cx - 24} ${cy + 4} ${cx + 24} ${cy + 4} ${cx + 58} ${cy - 2}`}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="4"
              markerEnd="url(#grip-gold)"
            />
          </g>

          {/* Poles */}
          <circle cx={cx} cy={northUp ? cy - 176 : cy + 176} r="20" fill="var(--wine)" />
          <text x={cx} y={northUp ? cy - 171 : cy + 181} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="14">N</text>
          <circle cx={cx} cy={northUp ? cy + 176 : cy - 176} r="20" fill="var(--ink)" />
          <text x={cx} y={northUp ? cy + 181 : cy - 171} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="14">S</text>
        </svg>
        <p className="clean-hint-html">Tap the coil to reverse the current</p>
      </div>
      <Aside>
        <h4 className="clean-aside__title">Curl your fingers with the current.</h4>
        <p className="clean-aside__copy">Your right-hand fingers follow the current around the coil.</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">Your thumb points to North.</h4>
        <p className="clean-aside__copy">Reverse the current and the magnetic poles reverse with it.</p>
      </Aside>
    </button>
  );
}

/* ── 6 · Rotating field ─────────────────────────────────────────────────── */

export function RotatingFieldDiagram({ controls }: ControlProps) {
  const field = toScreenDeg(controls.angle);
  const strengths = coilStrengths(field);
  const phases = ["A", "B", "C"].map((label, p) => ({ label, s: strengths[p] }));
  const [nx, ny] = polar(C, C, 88, field);
  const [tx, ty] = polar(C, C, 76, field);

  return (
    <div className="clean-diagram clean-mech" role="img" aria-label="Three stationary coil groups creating one rotating magnetic field">
      <div className="clean-mech__figure">
        <svg viewBox={`0 0 ${FIG} ${FIG + 44}`}>
          <Arrowheads id="rot" />
          <StatorRing strengths={strengths} />
          <RotorDisc />
          <line x1={C} y1={C} x2={nx} y2={ny} stroke="var(--wine)" strokeWidth="6" strokeLinecap="round" markerEnd="url(#rot-wine)" />
          <circle cx={C} cy={C} r="6" fill="var(--wine)" />
          <text x={tx - Math.sin(rad(field)) * 16} y={ty + Math.cos(rad(field)) * 16 + 4} textAnchor="middle" fill="var(--wine)" fontFamily="var(--mono)" fontWeight="700" fontSize="13">N</text>
          {phases.map((phase, index) => {
            const x = C - 66 + index * 44;
            return (
              <g key={phase.label}>
                <rect x={x} y={FIG + 14} width="40" height="18" fill="var(--cat-6)" opacity={0.22 + phase.s * 0.78} />
                <text x={x + 20} y={FIG + 27} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="10" fontWeight="700">{phase.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <Aside>
        <h4 className="clean-aside__title">The coils do not move.</h4>
        <p className="clean-aside__copy">The inverter changes which coil is strongest, so the combined field sweeps around the bore.</p>
      </Aside>
    </div>
  );
}

/* ── 7 · Rotor follows the field ────────────────────────────────────────── */

export function RotorFollowsFieldDiagram({ controls }: ControlProps) {
  const field = toScreenDeg(controls.angle);
  const rotor = field + 26;

  return (
    <div className="clean-diagram clean-mech" role="img" aria-label="A permanent-magnet rotor following a rotating stator field at a small constant angle">
      <div className="clean-mech__figure">
        <svg viewBox={`0 0 ${FIG} ${FIG}`}>
          <Arrowheads id="fol" />
          <StatorRing strengths={coilStrengths(field)} />
          <RotorDisc rotate={rotor}>
            <rect x={C - 48} y={C - 14} width="48" height="28" fill="var(--wine)" opacity="0.45" />
            <rect x={C} y={C - 14} width="48" height="28" fill="var(--wine)" />
            <text x={C - 24} y={C + 5} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="13">S</text>
            <text x={C + 24} y={C + 5} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontWeight="700" fontSize="13">N</text>
          </RotorDisc>
          <TurnArrow id="fol" />
          <AxisArrow deg={rotor} id="fol" from={54} />
          <FieldArrow deg={field} id="fol" />
          <LagArc from={field} to={rotor} />
          <circle cx={C} cy={C} r="6" fill="var(--ink)" />
        </svg>
      </div>
      <Aside>
        <h4 className="clean-aside__title"><i className="clean-swatch clean-swatch--wine" />Stator field</h4>
        <p className="clean-aside__copy">moves slightly ahead</p>
        <h4 className="clean-aside__title"><i className="clean-swatch clean-swatch--gold" />Rotor magnetic axis</h4>
        <p className="clean-aside__copy">follows at the same speed</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">A small angle stays between them.</h4>
        <p className="clean-aside__copy">That steady offset keeps pulling the rotor forward and produces shaft torque.</p>
      </Aside>
    </div>
  );
}

/* ── 8 · Torque combination ─────────────────────────────────────────────── */

export function TorqueCombinationDiagram({ controls }: ControlProps) {
  const field = toScreenDeg(controls.angle);
  const rotor = field + 20;

  return (
    <div className="clean-diagram clean-mech" role="img" aria-label="Magnet pull and shaped steel alignment turning one shaft">
      <div className="clean-mech__figure">
        <svg viewBox={`0 0 ${FIG} ${FIG}`}>
          <Arrowheads id="tor" />
          <StatorRing strengths={coilStrengths(field)} />
          <RotorDisc rotate={rotor}>
            {[45, 135, 225, 315].map((deg) => {
              const [x0, y0] = polar(C, C, 40, deg - 14);
              const [x1, y1] = polar(C, C, 96, deg - 14);
              const [x2, y2] = polar(C, C, 96, deg + 14);
              const [x3, y3] = polar(C, C, 40, deg + 14);
              return <path key={deg} d={`M ${x0} ${y0} L ${x1} ${y1} A 96 96 0 0 1 ${x2} ${y2} L ${x3} ${y3} A 40 40 0 0 0 ${x0} ${y0} Z`} fill="var(--cat-5)" opacity="0.55" />;
            })}
            {[0, 90, 180, 270].map((deg) => (
              <VPair key={deg} cx={C} cy={C} r={ROTOR_R} angle={deg} color="var(--wine)" />
            ))}
          </RotorDisc>
          <TurnArrow id="tor" />
          <AxisArrow deg={rotor} id="tor" from={0} />
          <FieldArrow deg={field} id="tor" />
          <circle cx={C} cy={C} r="6" fill="var(--ink)" />
        </svg>
      </div>
      <Aside>
        <div className="clean-pull">
          <h4 className="clean-aside__title">Magnet pull</h4>
          <span className="clean-pull__bar"><i style={{ width: "100%", background: "var(--wine)" }} /></span>
          <p className="clean-aside__copy">Buried magnets follow the stator field.</p>
        </div>
        <div className="clean-pull">
          <h4 className="clean-aside__title">Steel alignment</h4>
          <span className="clean-pull__bar"><i style={{ width: "50%", background: "var(--cat-5)" }} /></span>
          <p className="clean-aside__copy">Shaped steel turns toward the easiest magnetic path.</p>
        </div>
      </Aside>
    </div>
  );
}

/* ── 9 · Magnet jobs ────────────────────────────────────────────────────── */

export function MagnetJobsDiagram() {
  return (
    <div className="clean-diagram" role="img" aria-label="Iron provides magnetic strength while neodymium helps lock the field direction">
      <svg viewBox={`0 0 ${W} ${H}`}>
        <g transform="translate(49 72)">
          <rect x="0" y="0" width="226" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol" x="28" y="62">Fe</text>
          <text className="clean-title" x="28" y="108">Strength</text>
          <text className="clean-copy" x="28" y="144">Iron provides most of the</text>
          <text className="clean-copy" x="28" y="168">magnetic pulling power.</text>
          <rect x="248" y="0" width="226" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol clean-symbol--wine" x="276" y="62">Nd/Pr</text>
          <text className="clean-title" x="276" y="108">Direction</text>
          <text className="clean-copy" x="276" y="144">Rare-earth chemistry helps the</text>
          <text className="clean-copy" x="276" y="168">field resist being reversed.</text>
          <rect x="496" y="0" width="226" height="214" fill="var(--deep)" stroke="var(--ink-10)" />
          <text className="clean-symbol" x="524" y="62">B</text>
          <text className="clean-title" x="524" y="108">Structure</text>
          <text className="clean-copy" x="524" y="144">Boron stabilises the crystal</text>
          <text className="clean-copy" x="524" y="168">structure of the alloy.</text>
          <text className="clean-title" x="361" y="276" textAnchor="middle">Together they make a strong, compact permanent magnet.</text>
        </g>
      </svg>
    </div>
  );
}

/* ── 10 · Rare-earth split ──────────────────────────────────────────────── */

export function RareEarthSplitDiagram() {
  return (
    <div className="clean-diagram clean-split" role="img" aria-label="Light and heavy rare earth shares of an NdFeB traction magnet: about 69 percent iron, 30 percent neodymium and praseodymium, one to four percent dysprosium and terbium">
      <div className="clean-split__bar" aria-hidden="true">
        <span className="clean-split__seg clean-split__seg--iron" style={{ flexBasis: "67%" }}>Iron <b>≈69%</b></span>
        <span className="clean-split__seg clean-split__seg--nd" style={{ flexBasis: "29%" }}>Nd/Pr <b>≈30%</b></span>
        <span className="clean-split__seg clean-split__seg--dy" style={{ flexBasis: "4%" }} />
      </div>
      <div className="clean-split__leader" aria-hidden="true">
        <span>Dy/Tb <b>1–4%</b></span>
      </div>
      <div className="clean-split__notes">
        <div className="clean-split__note">
          <h4 className="clean-aside__title">Light rare earths</h4>
          <p className="clean-aside__copy">Neodymium and praseodymium make up most of the rare-earth content.</p>
        </div>
        <div className="clean-split__note clean-split__note--heavy">
          <h4 className="clean-aside__title">Heavy rare earths</h4>
          <p className="clean-aside__copy">A small Dy/Tb addition protects the magnet when the rotor is hot.</p>
        </div>
      </div>
    </div>
  );
}

/* ── 11 · Heat and protection ───────────────────────────────────────────── */

const AXIS_MIN = 20;
const AXIS_MAX = 180;
const axisPercent = (celsius: number) => ((celsius - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

export function HeatProtectionDiagram({ controls }: ControlProps) {
  const heat = clamp01(controls.heat);
  const dysprosium = clamp01(controls.dysprosium);
  const unprotected = 150 - 70 * heat;
  const safeUpTo = Math.round(unprotected + (AXIS_MAX - unprotected) * dysprosium);
  const rotorToday = 160;
  const rotorShown = heat >= 0.5;

  return (
    <div className="clean-diagram clean-heat" role="img" aria-label={`Magnet temperature axis from 20 to 180 degrees. Safe up to ${safeUpTo} degrees.${rotorShown ? " Rotor today at 160 degrees." : ""}`}>
      <p className="clean-axis__label">magnet temperature, °C</p>
      <div className="clean-axis">
        <div className={`clean-axis__flag clean-axis__flag--safe ${axisPercent(safeUpTo) > 62 ? "is-right" : ""}`} style={{ left: `${axisPercent(safeUpTo)}%` }}>
          <span>safe up to · {safeUpTo} °C</span>
          <i />
        </div>
        <div className="clean-axis__line">
          {[20, 60, 100, 140, 180].map((t) => (
            <span key={t} className="clean-axis__tick" style={{ left: `${axisPercent(t)}%` }}><b>{t}</b></span>
          ))}
        </div>
        <div className="clean-axis__flag clean-axis__flag--rotor is-right" style={{ left: `${axisPercent(rotorToday)}%` }} hidden={!rotorShown}>
          <i />
          <span>rotor today · {rotorToday} °C</span>
        </div>
      </div>
      <div className="clean-heat__copy">
        <p className="clean-aside__copy">Heat lowers the temperature a magnet can survive.</p>
        <p className="clean-aside__copy">A little Dy/Tb raises it again.</p>
      </div>
    </div>
  );
}

/* ── 12 · Mitigation options ────────────────────────────────────────────── */

export function MitigationOptionsDiagram() {
  const rows = [
    ["1", "Cool the rotor", "Keep the magnet cooler so it needs less protection", "adds oil cooling"],
    ["2", "Put Dy/Tb only where damage starts", "Coat the grain edges instead of doping the whole magnet", "new magnet process"],
    ["3", "Prove a Dy-free magnet survives", "Same motor, no heavy rare earths, years of testing", "long testing"],
  ];
  return (
    <div className="clean-diagram clean-list-board" role="img" aria-label="Three low-disruption ways to reduce heavy rare earths">
      <div className="clean-list-board__rows" data-scrolls>
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

/* ── 13 · Alternatives map ──────────────────────────────────────────────── */

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
      <div className="clean-family-map__grid" data-scrolls>
        {families.map(([name, principle, trade], index) => (
          <div className={`clean-family ${name === "PM MOTOR" ? "is-reference" : ""}`} key={name}>
            <span className="clean-family__index" aria-hidden="true">0{index + 1}</span>
            <strong>{name}</strong>
            <span>{principle}</span>
            <em>{trade}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 16 · SynRM ─────────────────────────────────────────────────────────── */

export function SynRMMechanismDiagram({ controls }: ControlProps) {
  const field = toScreenDeg(controls.angle);
  const rotor = field + 32;

  return (
    <div className="clean-diagram clean-mech" role="img" aria-label="A synchronous reluctance rotor turning to align its easy magnetic path with the stator field">
      <div className="clean-mech__figure">
        <svg viewBox={`0 0 ${FIG} ${FIG}`}>
          <Arrowheads id="syn" />
          <StatorRing strengths={coilStrengths(field)} />
          <RotorDisc rotate={rotor} fill="var(--cat-5)">
            {[-42, 0, 42].map((offset) => (
              <path key={offset} d={`M ${C - 78} ${C + offset} Q ${C} ${C + offset * 0.35} ${C + 78} ${C + offset}`} fill="none" stroke="var(--deep)" strokeWidth="12" strokeLinecap="round" />
            ))}
            <text x={C} y={C - 28 + 3.5} textAnchor="middle" fill="var(--ink-70)" fontFamily="var(--mono)" fontSize="11">air</text>
            <text x={C} y={C - 14 + 3.5} textAnchor="middle" fill="white" fontFamily="var(--mono)" fontSize="11">steel</text>
            <line x1={C - 118} y1={C} x2={C + 118} y2={C} stroke="var(--gold)" strokeWidth="3" strokeDasharray="7 5" />
          </RotorDisc>
          <TurnArrow id="syn" r={122} />
          <FieldArrow deg={field} id="syn" />
          <circle cx={C} cy={C} r="6" fill="var(--ink)" />
        </svg>
      </div>
      <Aside>
        <h4 className="clean-aside__title">What turns the rotor</h4>
        <p className="clean-aside__copy">Air barriers shape an easy path for flux. The stator field pulls that path into line.</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">Rare-earth exposure</h4>
        <p className="clean-aside__copy">None in the rotor.</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">Engineering cost</h4>
        <p className="clean-aside__copy">More inverter capability or a larger motor may be needed for the same vehicle duty.</p>
      </Aside>
    </div>
  );
}

/* ── 17 · SRM ───────────────────────────────────────────────────────────── */

export function SRMMechanismDiagram({ controls }: ControlProps) {
  const normalized = ((controls.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const step = Math.floor(normalized / (Math.PI / 3)) % 6;
  // Poles fire counter-clockwise on screen, the same sense every other frame turns.
  const active = (6 - step) % 6;
  const fieldDegrees = COIL_ANGLES[active];
  const rotorDegrees = toScreenDeg(controls.angle) + 22;
  // Short-path arc between the smooth rotor and the stepped field: with the
  // rotor gliding and the field snapping pole-to-pole, a fixed sweep flag
  // would draw the arc the long way round half the time.
  const deltaDeg = ((fieldDegrees - rotorDegrees) % 360 + 360) % 360;
  const arcSweep = deltaDeg <= 180 ? 1 : 0;
  const [ax, ay] = polar(C, C, 118, rotorDegrees);
  const [bx, by] = polar(C, C, 118, fieldDegrees);

  return (
    <div className="clean-diagram clean-mech" role="img" aria-label="A switched reluctance motor energising stator poles in sequence to pull rotor teeth into alignment">
      <div className="clean-mech__figure">
        <svg viewBox={`0 0 ${FIG} ${FIG}`}>
          <circle cx={C} cy={C} r={RING_R} fill="none" stroke="var(--ink-10)" strokeWidth={RING_W} />
          {COIL_ANGLES.map((deg, index) => {
            const isActive = index === active || index === (active + 3) % 6;
            const [lx, ly] = polar(C, C, RING_R + RING_W / 2 + 20, deg);
            return (
              <g key={deg}>
                <g transform={`rotate(${deg + 90} ${C} ${C})`}>
                  <rect x={C - 20} y={C - RING_R - RING_W / 2 + 4} width="40" height="56" rx="2" fill={isActive ? "var(--wine)" : "var(--cat-6)"} opacity={isActive ? 1 : 0.3} />
                </g>
                <text x={lx} y={ly + 4} textAnchor="middle" fill="var(--ink-50)" fontFamily="var(--mono)" fontSize="11">{COIL_LABELS[index]}</text>
              </g>
            );
          })}
          <g transform={`rotate(${rotorDegrees} ${C} ${C})`}>
            <circle cx={C} cy={C} r="60" fill="var(--cat-5)" />
            {[0, 90, 180, 270].map((degree) => (
              <rect key={degree} x={C - 24} y={C - 106} width="48" height="66" fill="var(--cat-5)" transform={`rotate(${degree} ${C} ${C})`} />
            ))}
          </g>
          <path d={`M ${ax} ${ay} A 118 118 0 0 ${arcSweep} ${bx} ${by}`} fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round" />
          <circle cx={C} cy={C} r="6" fill="var(--ink)" />
        </svg>
      </div>
      <Aside>
        <h4 className="clean-aside__title">What turns the rotor</h4>
        <p className="clean-aside__copy">The active stator poles pull the nearest steel tooth into line, then the next pair fires.</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">Rare-earth exposure</h4>
        <p className="clean-aside__copy">None in the rotor.</p>
        <hr className="clean-aside__rule" />
        <h4 className="clean-aside__title">Engineering cost</h4>
        <p className="clean-aside__copy">The separate pulls make torque less even. Control and acoustic work become important.</p>
      </Aside>
    </div>
  );
}

/* ── 18 · Ferrite comparison ────────────────────────────────────────────── */

export function FerriteComparisonDiagram() {
  const FW = 920;
  const cy = 250;
  const motors = [
    { cx: 230, r: 92, magnet: "var(--wine)", thick: 1, label: "NdFeB PMSM", note: "strong field · compact rotor" },
    { cx: 690, r: 140, magnet: "var(--gold)", thick: 1.6, label: "Ferrite PMSM", note: "weaker field · more material and space" },
  ];

  return (
    <div className="clean-diagram clean-compare" role="img" aria-label="Side-by-side comparison of a compact NdFeB permanent-magnet motor and a larger ferrite permanent-magnet motor">
      <svg viewBox={`0 0 ${FW} 500`}>
        {motors.map((motor) => (
          <g key={motor.label}>
            <StatorRing cx={motor.cx} cy={cy} r={motor.r * (RING_R / ROTOR_R)} />
            <RotorDisc cx={motor.cx} cy={cy} r={motor.r}>
              {[0, 90, 180, 270].map((deg) => (
                <VPair key={deg} cx={motor.cx} cy={cy} r={motor.r} angle={deg} color={motor.magnet} thick={motor.thick} />
              ))}
              <circle cx={motor.cx} cy={cy} r={motor.r * 0.16} fill="var(--ink)" />
            </RotorDisc>
          </g>
        ))}
      </svg>
      <div className="clean-compare__captions">
        {motors.map((motor) => (
          <div key={motor.label}>
            <h4 className="clean-aside__title">{motor.label}</h4>
            <p className="clean-aside__copy">{motor.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 19 · Change burden ─────────────────────────────────────────────────── */

export function ChangeBurdenDiagram() {
  const routes = [
    ["KEEP THE MOTOR", "Reduce Dy/Tb", "Gain: lower heavy-rare-earth exposure", "Work: cooling or magnet qualification"],
    ["REDESIGN THE MOTOR", "Ferrite PMSM", "Gain: no rare earths in the magnet", "Work: more size, speed or new geometry"],
    ["REDESIGN THE DRIVE UNIT", "Induction · wound field · reluctance", "Gain: no permanent magnet", "Work: motor, inverter, cooling and controls"],
  ];
  return (
    <div className="clean-diagram clean-burden" role="img" aria-label="Implementation burden from material change to new motor architecture">
      <div className="clean-burden__axis" data-scrolls aria-hidden="true" />
      <div className="clean-burden__routes" data-scrolls>
        {routes.map(([level, title, gain, burden], index) => (
          <div className="clean-burden__route" data-scrolls key={level}>
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

/* ── 20 · Readiness map ─────────────────────────────────────────────────── */

const READINESS_HEAD = ["Route", "What turns the rotor", "Who ships it", "What it costs you", "When it matters"];

export function ReadinessMapDiagram() {
  const routes = [
    ["Reduced-Dy/Tb NdFeB", "Permanent magnet", "Most carmakers, in production", "Needs rotor cooling and a re-qualified magnet supplier", "Now, this platform"],
    ["Ferrite PMSM", "Permanent magnet", "Proterial prototype; no showroom car yet", "Bigger or faster-spinning motor for the same power", "Next platform"],
    ["Induction", "Current induced in a cage", "Audi Q6 e-tron front axle; most factory motors", "A few percent less range; heat in the rotor", "Now, on a second axle"],
    ["Wound field", "Powered rotor coil", "BMW, Renault, Nissan, in production", "Brushes or a transformer to feed the rotor; oil through the shaft", "Next platform"],
    ["SynRM", "Shaped steel", "ABB factory drives; rare in cars", "Bigger inverter or motor", "Targeted R&D"],
    ["SRM", "Poles pull one tooth at a time", "Advanced Electric Machines pilots", "Noisier, less smooth", "Targeted R&D"],
  ];
  return (
    <div className="clean-diagram clean-readiness" role="img" aria-label="Who ships each motor route, what it costs, and when it matters">
      <div className="clean-readiness__table" data-scrolls>
        <div className="clean-readiness__head" data-scrolls aria-hidden="true">
          {READINESS_HEAD.map((label) => <span key={label}>{label}</span>)}
        </div>
        {routes.map(([name, mechanism, ships, cost, when]) => (
          <div className="clean-readiness__row" data-scrolls key={name}>
            <strong>{name}</strong>
            {[mechanism, ships, cost].map((value, index) => (
              <span key={index}><small>{READINESS_HEAD[index + 1]}</small>{value}</span>
            ))}
            <em><small>{READINESS_HEAD[4]}</small>{when}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 21 · Decision summary ──────────────────────────────────────────────── */

export function DecisionSummaryDiagram() {
  const points = [
    ["NOW", "Ask suppliers for low-dysprosium magnets and oil-cooled rotors. The car does not change."],
    ["NEXT PLATFORM", "A wound-field or induction drive unit. Proven abroad; a new drive-unit programme here."],
    ["TARGETED R&D", "Ferrite, SynRM, SRM. Fund test fleets, not procurement."],
  ];
  return (
    <div className="clean-diagram clean-summary" role="img" aria-label="Three conclusions from the permanent magnet motor alternatives walkthrough">
      <div className="clean-summary__grid" data-scrolls>
        {points.map(([label, copy], index) => (
          <div className="clean-summary__point" data-scrolls key={label}>
            <span>0{index + 1}</span>
            <small>{label}</small>
            <p>{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
