import { useEffect, useMemo, useState } from "react";
import {
  MITIGATION_RUNGS,
  getMitigationFootprintInfo,
} from "../models/exposure";
import { architectureLabs, rotorToAlternativeFamily } from "../models/alternativeLab";
import { materialIdForState, materialLabs } from "../models/materialLab";
import { burdenRoutes, architectureOptions, architectureStates, type ArchitectureId } from "../models/swapBurden";
import type { DiagramId } from "../route/route";
import type { StageControls } from "../stage/controls";
import { Axes } from "./parts";
import {
  AlternativesMapDiagram,
  ChangeBurdenDiagram,
  DecisionSummaryDiagram,
  GripRuleDiagram,
  HeatProtectionDiagram,
  MagnetJobsDiagram,
  MitigationOptionsDiagram,
  RareEarthSplitDiagram,
  ReadinessMapDiagram,
  RotatingFieldDiagram,
  TorqueCombinationDiagram,
} from "./CleanDiagrams";
import "./Diagrams.css";

const W = 820;
const H = 440;

/* ── Act 0: why any of this matters ─────────────────────────────────────── */

/**
 * The cold open.
 *
 * The piece used to begin with a car, which asks the reader to care about a
 * mechanism before they have been given a reason to. This starts at the other
 * end: a chain with one narrow point in it, a date on which that point was
 * closed part-way, and the consequence downstream. Only after that is there a
 * reason to look at the motor at all.
 */
function WhyItMatters({ state }: { state: string }) {
  const stages = [
    { id: "mine", label: "Mine", detail: "ore out of the ground" },
    { id: "refine", label: "Separate", detail: "elements pulled apart" },
    { id: "magnet", label: "Sinter", detail: "NdFeB magnet blocks" },
    { id: "motor", label: "Motor", detail: "1–2 kg per traction motor" },
    { id: "car", label: "Car", detail: "the only part that turns" },
  ];

  const gated = state === "the-halt";
  const laneY = 208;
  const laneH = 58;
  const step = (W - 40) / stages.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The rare-earth magnet chain and where it narrows">
      <text className="d-axis-label" x={0} y={16}>
        From ore to the only part of the car that turns
      </text>

      {/* The chain itself. It narrows after the gate, which is the whole point. */}
      {stages.map((stage, i) => {
        const x = 8 + i * step;
        const past = i >= 2;
        const h = gated && past ? laneH * 0.42 : laneH;
        return (
          <g key={stage.id}>
            <rect
              className={gated && past ? "d-fill--warn-soft" : "d-fill--mute"}
              x={x}
              y={laneY + (laneH - h) / 2}
              width={step - 26}
              height={h}
            />
            <text className="d-label d-label--strong" x={x + 12} y={laneY + laneH + 26}>
              {stage.label}
            </text>
            <text className="d-label d-label--faint" x={x + 12} y={laneY + laneH + 44}>
              {stage.detail}
            </text>
            {i < stages.length - 1 && (
              <path
                className="d-rule"
                d={`M ${x + step - 24} ${laneY + laneH / 2} L ${x + step - 6} ${laneY + laneH / 2}`}
              />
            )}
          </g>
        );
      })}

      {/* The gate sits between separation and sintering, where the licence bites. */}
      <g transform={`translate(${8 + 2 * step - 15}, 0)`}>
        <path
          className={gated ? "d-curve--warn d-curve" : "d-rule d-rule--dash"}
          d={`M 0 ${laneY - 22} L 0 ${laneY + laneH + 8}`}
        />
        <text
          className={`d-label ${gated ? "d-label--warn" : "d-label--faint"}`}
          x={6}
          y={laneY - 30}
        >
          {gated ? "export licence required" : "one narrow point"}
        </text>
      </g>

      {state === "the-halt" ? (
        <g>
          <text className="d-value d-value--big d-label--warn" x={0} y={72}>
            4 April 2025
          </text>
          <text className="d-label d-label--strong" x={0} y={100}>
            China placed the listed medium and heavy rare earths under export licence.
          </text>
          <text className="d-label" x={0} y={122}>
            Carmakers holding no second source paused assembly while the paperwork caught up.
          </text>
          <text className="d-label d-label--faint" x={0} y={340}>
            A licence gate, not a ban — but a motor programme cannot wait on paperwork it does not control.
          </text>
        </g>
      ) : (
        <g>
          <text className="d-value d-value--big" x={0} y={72}>
            Every electric car sits at the end of this chain
          </text>
          <text className="d-label" x={0} y={100}>
            Around 70–80% of EV traction motors are permanent-magnet machines, as reported,
          </text>
          <text className="d-label" x={0} y={122}>
            and each one carries a magnet made from these elements.
          </text>
          <text className="d-label d-label--faint" x={0} y={340}>
            Which is why a change at one point in the chain reaches all the way to the wheels.
          </text>
        </g>
      )}
    </svg>
  );
}

/* ── Act 0: where the magnet comes from ─────────────────────────────────── */

function SupplyConcentration({ state }: { state: string }) {
  const showNotice = state === "the-control";
  const rows = [
    { label: "Mining", china: 60 },
    { label: "Refining", china: 92 },
    { label: "NdFeB traction magnets", china: 94 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Share of the rare-earth magnet supply chain concentrated in one country">
      <text className="d-axis-label" x={0} y={16}>Share of global output, by stage</text>
      {rows.map((row, i) => {
        const y = 60 + i * 82;
        return (
          <g key={row.label}>
            <text className="d-label d-label--strong" x={0} y={y - 8}>{row.label}</text>
            <rect className="d-fill--mute" x={0} y={y} width={W - 90} height={26} />
            <rect className="d-bar d-fill--accent" x={0} y={y} width={((W - 90) * row.china) / 100} height={26} />
            <text className="d-value" x={W - 74} y={y + 19}>{row.china}%</text>
          </g>
        );
      })}
      <text className="d-label d-label--faint" x={0} y={316}>
        The remaining share is spread across every other producer combined.
      </text>

      {showNotice && (
        <g>
          <rect className="d-fill--warn-soft" x={0} y={342} width={W} height={80} />
          <rect className="d-fill--warn" x={0} y={342} width={3} height={80} />
          <text className="d-label d-label--warn" x={16} y={366}>
            4 April 2025 — Announcement No. 18, Ministry of Commerce
          </text>
          <text className="d-label" x={16} y={388}>
            Listed medium and heavy rare-earth items placed under export licence.
          </text>
          <text className="d-label d-label--faint" x={16} y={408}>
            A licence requirement, not a removal from the market. Which elements it names matters — see stop 8.
          </text>
        </g>
      )}
    </svg>
  );
}

/* ── Act II Diagrams: The Magnet ────────────────────────────────────────── */

function DivisionOfLabourDiagram({
  onPatchControls,
}: {
  controls?: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const [selected, setSelected] = useState<"ndfeb" | "iron" | "neodymium">("ndfeb");

  const items = [
    {
      id: "iron" as const,
      name: "Iron Alone (Fe)",
      strength: 95,
      strengthLabel: "High Pull (1.4 T)",
      lock: 5,
      lockLabel: "No Lock (0.05 T)",
      lines: [
        "Massive electron pulling power,",
        "but zero directional grip.",
        "Flips instantly when pushed back.",
      ],
      verdict1: "The Muscle (Raw Pull)",
      verdict2: "Zero Directional Lock",
    },
    {
      id: "neodymium" as const,
      name: "Neodymium Alone (Nd)",
      strength: 15,
      strengthLabel: "Weak Pull (0.2 T)",
      lock: 85,
      lockLabel: "Strong Lock (1.2 T)",
      lines: [
        "Unbreakable atomic direction lock,",
        "providing permanent alignment,",
        "but almost no pull at room temp.",
      ],
      verdict1: "The Lock (Rigid Spine)",
      verdict2: "Nearly Zero Pull Alone",
    },
    {
      id: "ndfeb" as const,
      name: "Nd₂Fe₁₄B (The Team)",
      strength: 100,
      strengthLabel: "Peak Pull (1.4 T)",
      lock: 100,
      lockLabel: "Unbreakable (1.5 T)",
      lines: [
        "Iron supplies raw pulling power;",
        "Neodymium locks the direction.",
        "Together: the ideal EV motor magnet.",
      ],
      verdict1: "Peak Pulling Power",
      verdict2: "Unbreakable Atomic Lock",
    },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Division of labour between Iron and Neodymium in NdFeB">
      <text className="d-axis-label" x={24} y={22}>
        MAGNETIC CHEMISTRY · THE DIVISION OF LABOUR
      </text>

      {/* 3 Material Cards */}
      <g transform="translate(24, 44)">
        {items.map((item, idx) => {
          const isSelected = selected === item.id;
          const cardX = idx * 266;
          const cardW = 248;
          return (
            <g
              key={item.id}
              transform={`translate(${cardX}, 0)`}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelected(item.id);
                onPatchControls?.({
                  angle: item.id === "iron" ? Math.PI : 0,
                });
              }}
            >
              {/* Card background */}
              <rect
                x={0}
                y={0}
                width={cardW}
                height={306}
                rx={0}
                fill={isSelected ? "var(--paper)" : "var(--deep)"}
                stroke={isSelected ? "var(--wine)" : "rgba(23, 20, 19, 0.12)"}
                strokeWidth={isSelected ? 2 : 1}
              />

              {/* Title */}
              <text
                x={16}
                y={28}
                fontSize={12.5}
                fontFamily="var(--mono)"
                fontWeight="bold"
                fill={isSelected ? "var(--wine)" : "var(--ink)"}
              >
                {item.name}
              </text>

              {/* Metric 1: Pulling Power */}
              <text className="d-axis-label" x={16} y={60}>
                PULLING POWER (MAGNETIC STRENGTH)
              </text>
              <rect x={16} y={68} width={216} height={12} rx={0} fill="var(--ink-10)" />
              <rect
                x={16}
                y={68}
                width={(216 * item.strength) / 100}
                height={12}
                rx={0}
                fill={item.id === "neodymium" ? "var(--ink-50)" : "var(--cat-5)"}
              />
              <text x={232} y={78} textAnchor="end" fontSize={9} fontFamily="var(--mono)" fontWeight="bold" fill={item.id === "neodymium" ? "var(--ink-70)" : "var(--paper)"}>
                {item.strengthLabel}
              </text>

              {/* Metric 2: Directional Lock */}
              <text className="d-axis-label" x={16} y={106}>
                DIRECTIONAL GRIP (RESISTS REVERSAL)
              </text>
              <rect x={16} y={114} width={216} height={12} rx={0} fill="var(--ink-10)" />
              <rect
                x={16}
                y={114}
                width={(216 * item.lock) / 100}
                height={12}
                rx={0}
                fill={item.id === "iron" ? "var(--ink-50)" : "var(--cat-6)"}
              />
              <text
                x={item.id === "iron" ? 232 : 232}
                y={124}
                textAnchor="end"
                fontSize={9}
                fontFamily="var(--mono)"
                fontWeight="bold"
                fill={item.id === "iron" ? "var(--ink-70)" : "var(--paper)"}
              >
                {item.lockLabel}
              </text>

              {/* Description text */}
              <g transform="translate(16, 154)">
                {item.lines.map((line, lIdx) => (
                  <text
                    key={lIdx}
                    x={0}
                    y={lIdx * 17}
                    fontSize={10.5}
                    fontFamily="var(--sans)"
                    fill="var(--ink-70)"
                  >
                    {line}
                  </text>
                ))}
              </g>

              {/* Verdict Pill */}
              <rect
                x={16}
                y={234}
                width={216}
                height={50}
                rx={0}
                fill={isSelected ? "rgba(98, 13, 60, 0.08)" : "var(--deep)"}
              />
              <text
                x={124}
                y={254}
                textAnchor="middle"
                fontSize={10.5}
                fontFamily="var(--mono)"
                fontWeight="bold"
                fill={isSelected ? "var(--wine)" : "var(--ink-70)"}
              >
                {item.verdict1}
              </text>
              <text
                x={124}
                y={272}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--mono)"
                fill={isSelected ? "var(--wine)" : "var(--ink-70)"}
              >
                {item.verdict2}
              </text>
            </g>
          );
        })}
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={376}>
        Neither element can power a motor alone: iron gives magnetic pull,
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        and neodymium provides the lock that prevents demagnetisation.
      </text>
    </svg>
  );
}

function AnisotropyCrystalDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const pushPct = Math.round(controls.load * 100);
  const isHeavyPush = pushPct > 70;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Intuitive compass lock against opposing stator force">
      <defs>
        <marker id="arrowUpAccent" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--wine)" />
        </marker>
        <marker id="arrowDownWarn" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cat-6)" />
        </marker>
      </defs>

      <text className="d-axis-label" x={24} y={22}>
        MAGNETIC STUBBORNNESS · THE ATOMIC LOCK
      </text>

      {/* Left: The Atomic Compass Needle Lock */}
      <g transform="translate(24, 44)">
        <rect x={0} y={0} width={370} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />

        <text className="d-label d-label--strong" x={20} y={28}>
          The Atomic Compass Lock
        </text>

        {/* Compass Visual Stage */}
        <g transform="translate(185, 142)">
          {/* Status badge above dial */}
          <text
            x={0}
            y={-80}
            textAnchor="middle"
            fill={pushPct > 0 ? "var(--cat-6)" : "var(--ink-70)"}
            fontSize={10.5}
            fontFamily="var(--mono)"
            fontWeight="bold"
          >
            {pushPct > 0 ? `OPPOSING STATOR PUSH: ${pushPct}%` : "MOTOR RESTING (0% PUSH)"}
          </text>

          {/* Stator Push Downward Arrow pushing towards the N pole from outside */}
          {pushPct > 0 && (
            <line
              x1={0}
              y1={-72}
              x2={0}
              y2={-72 + Math.min(16, (pushPct / 100) * 16)}
              stroke="var(--cat-6)"
              strokeWidth={3}
              markerEnd="url(#arrowDownWarn)"
            />
          )}

          {/* Compass dial circle */}
          <circle cx={0} cy={0} r={56} fill="var(--deep)" stroke="var(--ink-10)" strokeWidth={1.5} />

          {/* North and South Labels with clear margins */}
          <text x={0} y={-40} textAnchor="middle" fill="var(--wine)" fontSize={12} fontFamily="var(--mono)" fontWeight="bold">N</text>
          <text x={0} y={48} textAnchor="middle" fill="var(--ink-70)" fontSize={11} fontFamily="var(--mono)" fontWeight="bold">S</text>

          {/* Dotted horizontal alignment line */}
          <line x1={-42} y1={0} x2={42} y2={0} stroke="var(--cat-5)" strokeWidth={1.5} strokeDasharray="2 2" />

          {/* Neodymium Atomic Clamp Badges (Equator) */}
          <rect x={-50} y={-10} width={20} height={20} rx={0} fill="var(--cat-5)" />
          <text x={-40} y={4} textAnchor="middle" fill="var(--paper)" fontSize={9.5} fontFamily="var(--mono)" fontWeight="bold">Nd</text>

          <rect x={30} y={-10} width={20} height={20} rx={0} fill="var(--cat-5)" />
          <text x={40} y={4} textAnchor="middle" fill="var(--paper)" fontSize={9.5} fontFamily="var(--mono)" fontWeight="bold">Nd</text>

          {/* Sleek Diamond Compass Needle (North in maroon, South in slate) */}
          {/* North Half: Points to y = -26 (Leaving 14px gap before the letter N at y = -40) */}
          <polygon points="0,-26 5,-2 0,0 -5,-2" fill="var(--wine)" />
          
          {/* South Half: Points to y = 26 (Leaving 22px gap before the letter S at y = 48) */}
          <polygon points="0,26 5,2 0,0 -5,2" fill="var(--ink-50)" />

          {/* Center Hub */}
          <circle cx={0} cy={0} r={4.5} fill="var(--paper)" stroke="var(--wine)" strokeWidth={2} />
        </g>

        <text className="d-label d-label--faint" x={20} y={268} fontSize={9.5}>
          • Iron creates the powerful forward magnetic moment.
        </text>
        <text className="d-label d-label--faint" x={20} y={284} fontSize={9.5}>
          • Neodymium atoms act as rigid clamps holding North locked.
        </text>
      </g>

      {/* Right: Interactive Stator Push Test */}
      <g transform="translate(414, 44)">
        <rect x={0} y={0} width={382} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />

        <text className="d-label d-label--strong" x={24} y={28}>
          Opposing Stator Push Test
        </text>

        <text className="d-label" x={24} y={52} fontSize={10.5}>
          During hard acceleration, the motor's coils push
        </text>
        <text className="d-label" x={24} y={68} fontSize={10.5}>
          an intense reverse electrical field against the magnet:
        </text>

        {/* Live Push Slider */}
        <g transform="translate(24, 94)">
          <text className="d-axis-label" x={0} y={10}>
            APPLY OPPOSING STATOR PUSH: {pushPct}%
          </text>
          <rect
            x={0}
            y={18}
            width={334}
            height={14}
            rx={0}
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ load: ratio });
            }}
          />
          <circle
            cx={(controls.load) * 334}
            cy={25}
            r={8}
            fill="var(--cat-6)"
            stroke="var(--paper)"
            strokeWidth={2}
            style={{ cursor: "ew-resize" }}
          />
        </g>

        {/* Holding Status Meter */}
        <g transform="translate(24, 160)">
          <text className="d-axis-label" x={0} y={0}>
            MAGNETIC LOCK STATUS:
          </text>
          <rect x={0} y={8} width={334} height={28} rx={0} fill={isHeavyPush ? "rgba(196, 118, 63, 0.1)" : "rgba(98, 13, 60, 0.08)"} stroke={isHeavyPush ? "var(--cat-6)" : "var(--wine)"} strokeWidth={1} />
          <text x={167} y={26} textAnchor="middle" fontSize={11} fontFamily="var(--mono)" fontWeight="bold" fill={isHeavyPush ? "var(--cat-6)" : "var(--wine)"}>
            {pushPct === 0
              ? "Resting: 100% Lock Intact"
              : isHeavyPush
              ? "High Acceleration: Holding Solid"
              : "Moderate Stator Push: Locked Forward"}
          </text>
        </g>

        {/* Takeaway Box */}
        <g transform="translate(24, 222)">
          <rect width={334} height={60} rx={0} fill="var(--deep)" stroke="rgba(23, 20, 19, 0.08)" />
          <text x={16} y={22} fontSize={10} fontFamily="var(--mono)" fill="var(--wine)" fontWeight="bold">
            Why Plain Iron Fails:
          </text>
          <text x={16} y={38} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            Plain iron flips backwards at 5% push. Neodymium holds
          </text>
          <text x={16} y={50} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            the field locked forward under 100% full motor current.
          </text>
        </g>
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={376}>
        Neodymium's atomic structure acts like a rigid clamp, preventing
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        stator current from flipping the magnet backwards at full throttle.
      </text>
    </svg>
  );
}

function DemagCurveDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const x0 = 64;
  const y0 = 48;
  const w = 680;
  const h = 230;

  const reverse = Math.max(0, Math.min(1, controls.load));

  // Generate curve path
  const pathData = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= w; x += 4) {
      const hNorm = x / w;
      let bNorm = 1.0;
      if (hNorm > 0.75) {
        const over = (hNorm - 0.75) / 0.25;
        bNorm = Math.max(0, 1.0 - over ** 2.2);
      }
      const y = y0 + h - bNorm * h;
      pts.push(`${x0 + x},${y}`);
    }
    return pts.join(" ");
  }, []);

  const cursorX = x0 + reverse * w;
  let currentBNorm = 1.0;
  if (reverse > 0.75) {
    const over = (reverse - 0.75) / 0.25;
    currentBNorm = Math.max(0, 1.0 - over ** 2.2);
  }
  const cursorY = y0 + h - currentBNorm * h;
  const isPastKnee = reverse > 0.78;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The Operating Cliff Demagnetisation Curve">
      <text className="d-axis-label" x={24} y={22}>
        THE OPERATING CLIFF · HOW HARD CAN YOU PUSH?
      </text>

      <Axes
        x={x0}
        y={y0}
        w={w}
        h={h}
      />

      {/* Axis Intercept Markers */}
      <text className="d-axis-label" x={x0 + 8} y={y0 + 16} textAnchor="start">
        Full Pull (1.4 T)
      </text>
      <text className="d-axis-label" x={x0 + w - 8} y={y0 + h + 16} textAnchor="end">
        Maximum Opposing Push
      </text>

      {/* Shaded Safe Operating Area */}
      <polygon
        points={`${x0},${y0 + h} ${x0},${y0} ${x0 + w * 0.75},${y0} ${x0 + w * 0.75},${y0 + h}`}
        fill="rgba(98, 13, 60, 0.05)"
      />
      <text x={x0 + w * 0.35} y={y0 + h / 2} textAnchor="middle" fill="var(--wine)" fontSize={11.5} fontFamily="var(--mono)" opacity={0.7}>
        Safe Motor Operating Zone (100% Torque Retained)
      </text>

      {/* The Cliff Annotation */}
      <text x={x0 + w * 0.76} y={y0 + 24} fill="var(--cat-6)" fontSize={11} fontFamily="var(--mono)" fontWeight="bold">
        ↓ The Cliff (Demagnetisation Knee)
      </text>

      {/* Curve */}
      <polyline
        points={pathData}
        fill="none"
        stroke={isPastKnee ? "var(--cat-6)" : "var(--wine)"}
        strokeWidth={3}
      />

      {/* Operating Point Cursor */}
      <line
        x1={cursorX}
        y1={y0}
        x2={cursorX}
        y2={y0 + h}
        stroke={isPastKnee ? "var(--cat-6)" : "var(--wine)"}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle
        cx={cursorX}
        cy={cursorY}
        r={6}
        fill={isPastKnee ? "var(--cat-6)" : "var(--wine)"}
        stroke="var(--paper)"
        strokeWidth={2}
      />

      {/* Status Badge */}
      <g transform={`translate(${Math.min(x0 + w - 260, Math.max(x0 + 10, cursorX - 120))}, ${y0 + 44})`}>
        <rect width={250} height={26} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.15)" strokeWidth={1} />
        <text x={125} y={17} textAnchor="middle" fontSize={10.5} fontFamily="var(--mono)" fill={isPastKnee ? "var(--cat-6)" : "var(--wine)"} fontWeight="bold">
          {isPastKnee ? "Cliff Crossed: Permanent Loss" : `Safe Operating: ${(currentBNorm * 1.4).toFixed(2)} T Pull`}
        </text>
      </g>

      {/* Drag Slider */}
      <g transform={`translate(${x0}, 312)`}>
        <text className="d-axis-label" x={0} y={10}>
          APPLY OPPOSING STATOR CURRENT: {Math.round(reverse * 100)}%
        </text>
        <rect
          x={0}
          y={18}
          width={w}
          height={14}
          rx={0}
          fill="var(--ink-10)"
          style={{ cursor: "ew-resize" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            onPatchControls?.({ load: ratio });
          }}
        />
        <circle
          cx={reverse * w}
          cy={25}
          r={8}
          fill="var(--wine)"
          stroke="var(--paper)"
          strokeWidth={2}
          style={{ cursor: "ew-resize" }}
        />
      </g>

      {/* Editorial Note */}
      <text className="d-label d-label--faint" x={24} y={376}>
        Inside the safe plateau, the magnet delivers 100% torque.
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        Pushing past the cliff permanently destroys the magnetic field.
      </text>
    </svg>
  );
}

function ThermalDemagDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const x0 = 64;
  const y0 = 48;
  const w = 680;
  const h = 230;

  const tempC = Math.round(20 + controls.heat * 160);
  const reverse = Math.max(0, Math.min(1, controls.load));
  const dy = controls.dysprosium;

  const hcThermal = Math.max(0.35, (1.0 - controls.heat * 0.55) * (1.0 + dy * 0.45));
  const brThermal = Math.max(0.8, 1.0 - controls.heat * 0.12 - dy * 0.08);

  const kneeXNorm = hcThermal * 0.78;
  const isDemagnetised = reverse > kneeXNorm;

  const hotPts: string[] = [];
  const coldGhostPts: string[] = [];

  for (let x = 0; x <= w; x += 4) {
    const hNorm = x / w;

    let bCold = 1.0;
    if (hNorm > 0.78) {
      const over = (hNorm - 0.78) / 0.22;
      bCold = Math.max(0, 1.0 - over ** 2.2);
    }
    coldGhostPts.push(`${x0 + x},${y0 + h - bCold * h}`);

    let bHot = brThermal;
    if (hNorm > kneeXNorm) {
      const over = (hNorm - kneeXNorm) / Math.max(0.05, 1.0 - kneeXNorm);
      bHot = Math.max(0, brThermal * (1.0 - over ** 2.2));
    }
    hotPts.push(`${x0 + x},${y0 + h - bHot * h}`);
  }

  const cursorX = x0 + reverse * w;
  const cursorY = y0 + h - (isDemagnetised ? 0.1 : brThermal) * h;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Thermal demagnetisation under rotor heat">
      <text className="d-axis-label" x={24} y={20}>
        THE HEAT THREAT · WHY ROTOR TEMPERATURE MATTERS
      </text>
      {/* The unit sits here rather than on the axis, whose rotated title ran
          off the top of the figure and rendered clipped. */}
      <text className="d-label d-label--faint" x={24} y={36}>
        Retained magnetic pull · against opposing stator current
      </text>

      <Axes
        x={x0}
        y={y0}
        w={w}
        h={h}
      />

      {/* Cold Ghost Reference */}
      <polyline points={coldGhostPts.join(" ")} fill="none" stroke="var(--ink-50)" strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={x0 + w - 6} y={y0 + 16} textAnchor="end" fill="var(--ink-50)" fontSize={10} fontFamily="var(--mono)">
        Cold reference · 20 °C
      </text>

      {/* Hot Active Curve */}
      <polyline
        points={hotPts.join(" ")}
        fill="none"
        stroke={isDemagnetised ? "var(--cat-6)" : "var(--wine)"}
        strokeWidth={3}
      />
      {/*
        Sits below the plateau it names rather than on top of it, and tracks
        the plateau as the temperature slider moves it. Anchored to the right
        and clamped so the text can never run out of the plot on either side.
      */}
      <text
        x={Math.max(x0 + 190, Math.min(x0 + w - 6, x0 + kneeXNorm * w - 10))}
        y={y0 + h - brThermal * h + 20}
        textAnchor="end"
        fill={isDemagnetised ? "var(--cat-6)" : "var(--wine)"}
        fontSize={11}
        fontFamily="var(--mono)"
      >
        Hot operating cliff · {tempC} °C
      </text>

      {/* Reverse Field Cursor */}
      <line
        x1={cursorX}
        y1={y0}
        x2={cursorX}
        y2={y0 + h}
        stroke={isDemagnetised ? "var(--cat-6)" : "var(--wine)"}
        strokeWidth={1.5}
        strokeDasharray="3 3"
      />
      <circle cx={cursorX} cy={cursorY} r={6} fill={isDemagnetised ? "var(--cat-6)" : "var(--wine)"} stroke="var(--paper)" strokeWidth={2} />

      {/* Status Warning Pill */}
      {/* Moved below the plot: floating over it, this pill covered whichever
          curve happened to be under the cursor. */}
      <g transform={`translate(${Math.min(x0 + w - 290, Math.max(x0, cursorX - 145))}, ${y0 + h + 4})`}>
        <rect width={290} height={26} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.16)" strokeWidth={1} />
        <text x={145} y={17} textAnchor="middle" fontSize={10.5} fontFamily="var(--mono)" fill={isDemagnetised ? "var(--cat-6)" : "var(--wine)"} fontWeight="bold">
          {isDemagnetised ? "WARNING: CROSSED THE CLIFF!" : `Safe Headroom: ${Math.round(((kneeXNorm - reverse) / kneeXNorm) * 100)}% remaining`}
        </text>
      </g>

      {/* Sliders Area */}
      <g transform={`translate(${x0}, 312)`}>
        {/* Slider 1: Temperature */}
        <g>
          <text className="d-axis-label" x={0} y={10}>ROTOR TEMPERATURE: {tempC} °C</text>
          <rect
            x={0}
            y={16}
            width={320}
            height={12}
            rx={0}
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ heat: ratio });
            }}
          />
          <circle cx={controls.heat * 320} cy={22} r={7} fill="var(--cat-6)" stroke="var(--paper)" strokeWidth={2} style={{ cursor: "ew-resize" }} />
        </g>

        {/* Slider 2: Stator Current */}
        <g transform="translate(360, 0)">
          <text className="d-axis-label" x={0} y={10}>STATOR ACCELERATION PUSH: {Math.round(reverse * 100)}%</text>
          <rect
            x={0}
            y={16}
            width={320}
            height={12}
            rx={0}
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ load: ratio });
            }}
          />
          <circle cx={reverse * 320} cy={22} r={7} fill="var(--wine)" stroke="var(--paper)" strokeWidth={2} style={{ cursor: "ew-resize" }} />
        </g>
      </g>

      {/* Editorial Footnote */}
      <text className="d-label d-label--faint" x={24} y={376}>
        Heat weakens the magnetic lock, pulling the cliff closer;
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        hard acceleration pushes the magnet over into permanent loss.
      </text>
    </svg>
  );
}

function GrainBoundaryDiffusionDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const gbd = controls.diffusion > 0.4;
  const shellDepth = 12 + controls.diffusion * 32;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grain Boundary Diffusion microstructure in NdFeB">
      <text className="d-axis-label" x={24} y={22}>
        GRAIN BOUNDARY DIFFUSION · MICROSCOPIC SHIELDING
      </text>

      {/* Left Card: Uniform Doping (Legacy) */}
      <g transform="translate(24, 44)">
        <rect x={0} y={0} width={370} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />
        <text className="d-label d-label--strong" x={20} y={28}>
          1. Legacy Bulk Doping (Pre-2015)
        </text>

        {/* Grain Circle with bulk Dy dots */}
        <g transform="translate(185, 112)">
          <circle cx={0} cy={0} r={62} fill="var(--deep)" stroke="var(--ink-50)" strokeWidth={2} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r = 14 + (i % 4) * 14;
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={3.5} fill="var(--cat-6)" />;
          })}
          {/* Below the grain, not through it: centred in the circle the caption
              was struck through by the very dots it describes. */}
          <text x={0} y={84} textAnchor="middle" fontSize={11} fontFamily="var(--mono)" fill="var(--ink-70)">
            8% Dy dispersed through the bulk
          </text>
        </g>

        <rect x={20} y={215} width={330} height={72} rx={0} fill="var(--deep)" />
        <text x={30} y={236} fontSize={10.5} fontFamily="var(--mono)" fill="var(--cat-6)" fontWeight="bold">
          Wasteful Core Doping:
        </text>
        <text x={30} y={254} fontSize={10} fontFamily="var(--sans)" fill="var(--ink-70)">
          Heavy Dy is wasted through the core,
        </text>
        <text x={30} y={270} fontSize={10} fontFamily="var(--sans)" fill="var(--ink-70)">
          diluting pure iron and cutting pull by 15%.
        </text>
      </g>

      {/* Right Card: Grain Boundary Diffusion (Modern) */}
      <g transform="translate(414, 44)">
        <rect
          x={0}
          y={0}
          width={382}
          height={306}
          rx={0}
          fill="var(--paper)"
          stroke={gbd ? "var(--wine)" : "rgba(23, 20, 19, 0.12)"}
          strokeWidth={gbd ? 2 : 1}
        />
        <text className="d-label d-label--strong" x={20} y={28} fill={gbd ? "var(--wine)" : "var(--ink)"}>
          2. Modern GBD (Surface Shield)
        </text>

        {/* Grain with distinct Dy Shell */}
        <g transform="translate(191, 112)">
          {/* Outer Shell */}
          <circle cx={0} cy={0} r={62} fill="var(--gold-soft)" stroke="var(--wine)" strokeWidth={2} />
          {/* Inner Iron-Rich Core */}
          <circle cx={0} cy={0} r={Math.max(14, 62 - shellDepth)} fill="var(--wine-soft)" stroke="var(--cat-5)" strokeWidth={1.5} />
          {/* Dy particles only on the outer rim */}
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * Math.PI * 2;
            const rr = 62 - Math.min(shellDepth, 44) / 2;
            return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={3.5} fill="var(--wine)" />;
          })}
          {/* Below the grain: this caption is wider than the circle, so inside
              it, it crossed both the rim particles and the outer edge. */}
          <text x={0} y={84} textAnchor="middle" fontSize={11} fontFamily="var(--mono)" fill="var(--cat-5)">
            Pure NdFeB core · zero flux loss
          </text>
        </g>

        <rect x={20} y={215} width={342} height={72} rx={0} fill="rgba(98, 13, 60, 0.05)" />
        <text x={30} y={236} fontSize={10.5} fontFamily="var(--mono)" fill="var(--wine)" fontWeight="bold">
          Targeted 200 nm Shell Shield:
        </text>
        <text x={30} y={254} fontSize={10} fontFamily="var(--sans)" fill="var(--ink-70)">
          Shields only the outer rim where heat attacks.
        </text>
        <text x={30} y={270} fontSize={10} fontFamily="var(--sans)" fill="var(--ink-70)">
          Cuts Heavy REE consumption by 75%!
        </text>
      </g>

      {/* Interactive Depth Slider at bottom */}
      <g transform="translate(24, 358)">
        <text className="d-axis-label" x={0} y={-6}>
          GBD SHIELD PENETRATION DEPTH: {Math.round(controls.diffusion * 100)}%
        </text>
        <rect
          x={0}
          y={4}
          width={772}
          height={12}
          rx={0}
          fill="var(--ink-10)"
          style={{ cursor: "ew-resize" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0.1, Math.min(1, clickX / rect.width));
            onPatchControls?.({ diffusion: ratio });
          }}
        />
        <circle cx={controls.diffusion * 772} cy={10} r={7} fill="var(--wine)" stroke="var(--paper)" strokeWidth={2} style={{ cursor: "ew-resize" }} />
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={400}>
        Magnetic reversal starts at grain boundaries; GBD shields only
      </text>
      <text className="d-label d-label--faint" x={24} y={416}>
        the outer skin, keeping the core 100% pure iron for maximum pull.
      </text>
    </svg>
  );
}

function LightHeavySplitDiagram() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Light vs Heavy rare earths in EV traction magnets">
      <text className="d-axis-label" x={24} y={22}>
        RARE-EARTH TAXONOMY · LIGHT VS HEAVY BREAKDOWN
      </text>

      {/* Composition Bar */}
      <g transform="translate(24, 60)">
        {/* Was translate(…, 44) with the caption at y=-10, which put it on the
            baseline of the figure title above it. */}
        <text className="d-label d-label--strong" x={0} y={-10}>
          Element Breakdown by Mass in an EV Traction Magnet
        </text>

        {/* Stack Bar */}
        <g>
          {/* Iron */}
          <rect x={0} y={0} width={515} height={34} rx={0} fill="var(--ink-50)" />
          <text x={257} y={21} textAnchor="middle" fill="var(--paper)" fontSize={11.5} fontFamily="var(--mono)" fontWeight="bold">
            Iron (Fe) ≈ 68% · Main Body
          </text>

          {/* Light REE (Nd/Pr) */}
          <rect x={521} y={0} width={224} height={34} rx={0} fill="var(--cat-5)" />
          <text x={633} y={21} textAnchor="middle" fill="var(--paper)" fontSize={11} fontFamily="var(--mono)" fontWeight="bold">
            Nd/Pr ≈ 29% (Light)
          </text>

          {/* Heavy REE (Dy/Tb) */}
          <rect x={749} y={0} width={23} height={34} rx={0} fill="var(--cat-6)" />
        </g>
      </g>

      {/* Comparison Columns */}
      <g transform="translate(24, 100)">
        {/* Left Column: Light Rare Earths */}
        <g transform="translate(0, 0)">
          <rect x={0} y={0} width={370} height={240} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />
          <rect x={0} y={0} width={370} height={36} rx={0} fill="var(--deep)" />
          <text x={16} y={23} fontSize={12} fontFamily="var(--mono)" fontWeight="bold" fill="var(--cat-5)">
            Light Rare Earths (Neodymium, Praseodymium)
          </text>

          <text x={16} y={64} className="d-label" fontSize={11}>
            • Share: <tspan className="d-label--strong">≈ 29–30% of total magnet mass</tspan>
          </text>
          <text x={16} y={92} className="d-label" fontSize={11}>
            • Mines: USA (Mountain Pass), Australia, China
          </text>
          <text x={16} y={120} className="d-label" fontSize={11}>
            • Status: <tspan className="d-label--strong" fill="var(--positive)">100% UNRESTRICTED (Not on licence list)</tspan>
          </text>
          <text x={16} y={154} className="d-label d-label--faint" fontSize={10.5}>
            The bulk magnet material, mined globally.
          </text>
        </g>

        {/* Right Column: Heavy Rare Earths */}
        <g transform="translate(414, 0)">
          <rect x={0} y={0} width={382} height={240} rx={0} fill="var(--paper)" stroke="var(--cat-6)" strokeWidth={1.5} />
          <rect x={0} y={0} width={382} height={36} rx={0} fill="rgba(196, 118, 63, 0.12)" />
          <text x={16} y={23} fontSize={12} fontFamily="var(--mono)" fontWeight="bold" fill="var(--cat-6)">
            Heavy Rare Earths (Dysprosium, Terbium)
          </text>

          <text x={16} y={64} className="d-label" fontSize={11}>
            • Share: <tspan className="d-label--strong">Only 1–2% of magnet mass</tspan> (Heat shield)
          </text>
          <text x={16} y={92} className="d-label" fontSize={11}>
            • Global Sources: 99% ionic clays in S. China/Myanmar
          </text>
          <text x={16} y={120} className="d-label" fontSize={11}>
            • Status: <tspan className="d-label--strong" fill="var(--cat-6)">SUBJECT TO APRIL 2025 EXPORT LICENCE</tspan>
          </text>
          <text x={16} y={154} className="d-label d-label--faint" fontSize={10.5}>
            The specific 2% heat additive that was controlled.
          </text>
        </g>
      </g>

      {/* Editorial Footnote */}
      <text className="d-label d-label--faint" x={24} y={368}>
        The April 2025 controls targeted the 1–2% heavy rare earths (Dy/Tb),
      </text>
      <text className="d-label d-label--faint" x={24} y={384}>
        not the bulk neodymium (Nd/Pr) that makes up 95% of REE content.
      </text>
    </svg>
  );
}

function MitigationLadderDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const rung = Math.min(4, Math.round(controls.load * 4));
  const active = getMitigationFootprintInfo(rung as 0 | 1 | 2 | 3 | 4);

  // The detail card is laid out from its own content: the retained list sets
  // where the second heading starts, and both lists set the card's height.
  const changesY = 82 + active.retainedModules.length * 18 + 14;
  const cardHeight = Math.max(
    222,
    changesY + 18 + active.affectedModules.length * 18 + 8,
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mitigation ladder to eliminate heavy rare earths">
      <text className="d-axis-label" x={24} y={22}>
        THE MITIGATION LADDER · FIXING THE SUPPLY RISK
      </text>

      {/* 5 Rung Cards */}
      <g transform="translate(24, 44)">
        {MITIGATION_RUNGS.map((item, i) => {
          const isSelected = i === rung;
          const y = i * 44;
          return (
            <g
              key={item.id}
              style={{ cursor: "pointer" }}
              onClick={() => onPatchControls?.({ load: i / 4 })}
            >
              <rect
                x={0}
                y={y}
                width={370}
                height={38}
                rx={0}
                fill={isSelected ? "var(--wine)" : "var(--paper)"}
                stroke={isSelected ? "var(--wine)" : "rgba(23, 20, 19, 0.12)"}
                strokeWidth={1}
              />
              <text
                x={16}
                y={y + 24}
                fontSize={11.5}
                fontFamily="var(--mono)"
                fontWeight="bold"
                fill={isSelected ? "var(--paper)" : "var(--ink)"}
              >
                Rung {i + 1}: {item.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Right Detail Card for Active Rung */}
      <g transform="translate(414, 44)">
        <rect x={0} y={0} width={382} height={cardHeight} rx={0} fill="var(--paper)" stroke="var(--wine)" strokeWidth={1.5} />

        <rect x={0} y={0} width={382} height={36} rx={0} fill="rgba(98, 13, 60, 0.06)" />
        <text x={16} y={23} fontSize={12} fontFamily="var(--mono)" fontWeight="bold" fill="var(--wine)">
          Rung {rung + 1}: {active.label}
        </text>

        <text className="d-axis-label" x={16} y={64}>CARRIES OVER 100% (UNTOUCHED):</text>
        {active.retainedModules.map((mod, idx) => (
          <text key={mod} x={16} y={82 + idx * 18} className="d-label" fontSize={10.5}>
            ✓ {mod}
          </text>
        ))}

        {/*
          The second heading follows the first list rather than sitting at a
          fixed y: with a fixed 146 a five-item list ran straight through it.
        */}
        <text className="d-axis-label" x={16} y={changesY}>WHAT CHANGES:</text>
        {active.affectedModules.map((mod, idx) => (
          <text
            key={mod}
            x={16}
            y={changesY + 18 + idx * 18}
            className="d-label d-label--strong"
            fill="var(--wine)"
            fontSize={10.5}
          >
            • {mod}
          </text>
        ))}
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={368}>
        Rungs 1–3 keep the proven PMSM motor and car platform untouched,
      </text>
      <text className="d-label d-label--faint" x={24} y={384}>
        eliminating heavy rare earths via oil cooling and grain shielding.
      </text>
    </svg>
  );
}

/* ── Act III Diagrams: The Ceiling & The Alternatives ──────────────────── */

function BackEmfCeiling({
  controls,
  state,
  onPatchControls,
}: {
  controls: StageControls;
  state: string;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const isWeakeningView = state === "field-weakening" || state === "fault" || state === "the-obvious-fix";
  const speedRatio = Math.max(0, Math.min(1, controls.load));
  const rpm = Math.round(speedRatio * 18000);
  const kmh = Math.round(speedRatio * 160);

  const backEmfVolts = Math.round(speedRatio * 380);
  const dcBusVolts = 400;
  const headroomVolts = Math.max(0, dcBusVolts - backEmfVolts);
  const isNearCeiling = speedRatio >= 0.65;
  const isAtCeiling = speedRatio >= 0.88;

  // Dynamic color transition based on voltage severity
  const voltageColor =
    backEmfVolts >= 330 ? "var(--cat-6)" : backEmfVolts >= 200 ? "var(--cat-6)" : "var(--wine)";

  const weakeningRatio = Math.max(0, Math.min(1, controls.weakening || speedRatio));
  const counterPct = Math.round(weakeningRatio * 42);
  const torquePct = 100 - counterPct;
  const highwayKmh = Math.round(80 + weakeningRatio * 80);
  const isFault = state === "fault";

  return isWeakeningView ? (
    /* ── Stop 2 View: Field Weakening & Inverter Fault ──────────────────────── */
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Field weakening highway tax and inverter cutoff fault">
      <text className="d-axis-label" x={24} y={22}>
        FIELD WEAKENING · THE HIGHWAY TAX & THE INVERTER FAULT
      </text>

      {/* Left Card: The Highway Inverter Tax */}
      <g transform="translate(24, 44)">
        <rect x={0} y={0} width={370} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />

        <text className="d-label d-label--strong" x={20} y={28}>
          1. The Highway Inverter Tax
        </text>

        <text className="d-label" x={20} y={50} fontSize={10.5}>
          To push past the voltage ceiling at highway speed,
        </text>
        <text className="d-label" x={20} y={66} fontSize={10.5}>
          the inverter injects reverse current to cancel magnet flux:
        </text>

        {/* Highway Speed Scrub Slider */}
        <g transform="translate(20, 84)">
          <text className="d-axis-label" x={0} y={10}>
            HIGHWAY SPEED: {highwayKmh} km/h
          </text>
          <rect
            x={0}
            y={18}
            width={330}
            height={14}
            rx={0}
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ weakening: ratio, load: ratio });
            }}
          />
          <circle
            cx={weakeningRatio * 330}
            cy={25}
            r={8}
            fill="var(--cat-6)"
            stroke="var(--paper)"
            strokeWidth={2}
            style={{ cursor: "ew-resize" }}
          />
        </g>

        {/* Stacked Battery Current Meter */}
        <g transform="translate(20, 140)">
          <text className="d-axis-label" x={0} y={0}>
            BATTERY CURRENT BREAKDOWN AT {highwayKmh} km/h:
          </text>

          {/* Stats Row above the bar */}
          <text x={0} y={18} fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill="var(--cat-5)">
            ✓ Drives Wheels: {torquePct}%
          </text>
          <text x={330} y={18} textAnchor="end" fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill="var(--cat-6)">
            ✕ Cancels Magnet: {counterPct}%
          </text>

          {/* Stack track */}
          <rect x={0} y={26} width={330} height={16} rx={0} fill="var(--ink-10)" />
          {/* Useful Torque Current (Blue) */}
          <rect x={0} y={26} width={(330 * torquePct) / 100} height={16} rx={0} fill="var(--cat-5)" />
          {/* Wasted Counter-Current (Orange) */}
          <rect x={(330 * torquePct) / 100} y={26} width={(330 * counterPct) / 100} height={16} rx={0} fill="var(--cat-6)" />
        </g>

        {/* Paradox Box */}
        <g transform="translate(20, 224)">
          <rect width={330} height={62} rx={0} fill="rgba(196, 118, 63, 0.06)" stroke="var(--cat-6)" strokeWidth={0.5} />
          <text x={14} y={20} fontSize={10} fontFamily="var(--mono)" fill="var(--cat-6)" fontWeight="bold">
            The Permanent Magnet Highway Paradox:
          </text>
          <text x={14} y={36} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            At 150 km/h, up to 40% of battery power is burned purely
          </text>
          <text x={14} y={50} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            fighting the very magnet you paid to put in the vehicle.
          </text>
        </g>
      </g>

      {/* Right Card: The Inverter Fault & The Solution */}
      <g transform="translate(414, 44)">
        <rect x={0} y={0} width={382} height={306} rx={0} fill="var(--paper)" stroke={isFault ? "var(--cat-6)" : "rgba(23, 20, 19, 0.12)"} strokeWidth={isFault ? 2 : 1} />

        <text className="d-label d-label--strong" x={24} y={28}>
          2. Inverter Fault & The Alternative Fix
        </text>

        {/* Fault Status Banner */}
        <g transform="translate(24, 46)">
          <rect width={334} height={68} rx={0} fill={isFault ? "rgba(196, 118, 63, 0.1)" : "rgba(98, 13, 60, 0.05)"} stroke={isFault ? "var(--cat-6)" : "var(--wine)"} strokeWidth={1} />
          <text x={16} y={22} fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill={isFault ? "var(--cat-6)" : "var(--wine)"}>
            {isFault ? "⚠ INVERTER CUTOFF FAULT AT SPEED" : "✓ INVERTER ACTIVE (CRUISING)"}
          </text>
          <text x={16} y={40} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            {isFault
              ? "Inverter shuts off, but spinning magnets keep generating"
              : "Counter-current suppresses Back-EMF. Drive is stable."}
          </text>
          <text x={16} y={54} fontSize={9.5} fontFamily="var(--sans)" fill={isFault ? "var(--cat-6)" : "var(--ink-70)"} fontWeight={isFault ? "bold" : "normal"}>
            {isFault
              ? "650 V+ uncontrolled voltage spikes into the drive unit!"
              : "Safe operation within DC bus voltage limits."}
          </text>
        </g>

        {/* The Solution / Bridge Box */}
        <g transform="translate(24, 126)">
          <rect width={334} height={160} rx={0} fill="var(--deep)" stroke="rgba(23, 20, 19, 0.1)" />
          <text x={16} y={24} fontSize={11} fontFamily="var(--mono)" fontWeight="bold" fill="var(--wine)">
            The Obvious Fix: Rotors You Can Turn Off!
          </text>
          <text x={16} y={44} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            Replace permanent magnets with controllable rotors:
          </text>
          <text x={16} y={64} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink)" fontWeight="bold">
            • BMW & Renault (Wound Rotor / EESM):
          </text>
          <text x={26} y={78} fontSize={9} fontFamily="var(--sans)" fill="var(--ink-70)">
            Turns off rotor current on the highway for 0% drag.
          </text>
          <text x={16} y={98} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink)" fontWeight="bold">
            • Tesla & Audi (Induction Motor / IM):
          </text>
          <text x={26} y={112} fontSize={9} fontFamily="var(--sans)" fill="var(--ink-70)">
            No magnets in rotor; coasts with zero drag on the highway.
          </text>
          <text x={16} y={136} fontSize={9.5} fontFamily="var(--mono)" fontWeight="bold" fill="var(--wine)">
            Outcome: Zero counter-current tax at high speed!
          </text>
        </g>
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={376}>
        To cruise at top speed, PMSMs burn extra battery power fighting their own magnets;
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        magnet-free rotors turn the field off, eliminating the highway penalty.
      </text>
    </svg>
  ) : (
    /* ── Stop 1 View: Back-EMF Generator & Voltage Ceiling ─────────────────── */
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Back-EMF generator effect and DC bus voltage ceiling">
      <text className="d-axis-label" x={24} y={22}>
        BACK-EMF · THE VOLTAGE CEILING
      </text>

      {/* Left Card: The Spinning Generator Effect */}
      <g transform="translate(24, 44)">
        <rect x={0} y={0} width={370} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />

        <text className="d-label d-label--strong" x={20} y={28}>
          1. The Spinning Generator Effect
        </text>

        <text className="d-label" x={20} y={50} fontSize={10.5}>
          Spinning permanent magnets induce a reverse
        </text>
        <text className="d-label" x={20} y={66} fontSize={10.5}>
          voltage (Back-EMF) that grows with rotor speed:
        </text>

        {/* Rotor Generator Graphic */}
        <g transform="translate(185, 140)">
          {/* Stator Ring */}
          <circle cx={0} cy={0} r={52} fill="var(--deep)" stroke="var(--ink-10)" strokeWidth={1.5} />
          
          {/* 4 Stator Pole Teeth */}
          <rect x={-8} y={-52} width={16} height={12} rx={0} fill="var(--ink-50)" />
          <rect x={-8} y={40} width={16} height={12} rx={0} fill="var(--ink-50)" />
          <rect x={-52} y={-8} width={12} height={16} rx={0} fill="var(--ink-50)" />
          <rect x={40} y={-8} width={12} height={16} rx={0} fill="var(--ink-50)" />

          {/* Rotating 4-Pole Rotor in Center */}
          <g transform={`rotate(${speedRatio * 180})`}>
            {/* North Poles (Dynamic color matching speed/voltage) */}
            <circle cx={0} cy={-24} r={10} fill={voltageColor} />
            <text x={0} y={-20} textAnchor="middle" fill="var(--paper)" fontSize={9} fontFamily="var(--mono)" fontWeight="bold">N</text>
            <circle cx={0} cy={24} r={10} fill={voltageColor} />
            <text x={0} y={28} textAnchor="middle" fill="var(--paper)" fontSize={9} fontFamily="var(--mono)" fontWeight="bold">N</text>

            {/* South Poles (Slate) */}
            <circle cx={-24} cy={0} r={10} fill="var(--ink-70)" />
            <text x={-24} y={4} textAnchor="middle" fill="var(--paper)" fontSize={9} fontFamily="var(--mono)" fontWeight="bold">S</text>
            <circle cx={24} cy={0} r={10} fill="var(--ink-70)" />
            <text x={24} y={4} textAnchor="middle" fill="var(--paper)" fontSize={9} fontFamily="var(--mono)" fontWeight="bold">S</text>

            {/* Shaft */}
            <circle cx={0} cy={0} r={6} fill="var(--ink)" />
          </g>
        </g>

        {/* Motor Speed Slider */}
        <g transform="translate(20, 218)">
          <text className="d-axis-label" x={0} y={10} fill={voltageColor}>
            MOTOR SPEED: {rpm.toLocaleString()} RPM ({kmh} km/h)
          </text>
          <rect
            x={0}
            y={18}
            width={330}
            height={14}
            rx={0}
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ load: ratio });
            }}
          />
          <circle
            cx={speedRatio * 330}
            cy={25}
            r={8}
            fill={voltageColor}
            stroke="var(--paper)"
            strokeWidth={2}
            style={{ cursor: "ew-resize" }}
          />
        </g>

        {/* Speed Callout Notes */}
        <text className="d-label d-label--faint" x={20} y={276} fontSize={9.5}>
          • Low RPM: Magnet delivers peak launch torque.
        </text>
        <text className="d-label d-label--faint" x={20} y={292} fontSize={9.5}>
          • High RPM: Spinning magnet generates 350+ V pushback.
        </text>
      </g>

      {/* Right Card: The Battery Voltage Ceiling */}
      <g transform="translate(414, 44)">
        <rect x={0} y={0} width={382} height={306} rx={0} fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth={1} />

        <text className="d-label d-label--strong" x={24} y={28}>
          2. The Battery Voltage Ceiling (DC Bus)
        </text>

        <text className="d-label" x={24} y={50} fontSize={10.5}>
          The battery sets an absolute voltage limit.
        </text>
        <text className="d-label" x={24} y={66} fontSize={10.5}>
          When Back-EMF matches it, torque drops to zero:
        </text>

        {/* Voltage Headroom Meter with Clean Non-Overlapping Labels Above Bar */}
        <g transform="translate(24, 84)">
          <text className="d-axis-label" x={0} y={0}>
            DC BUS CEILING: 400 V (BATTERY MAXIMUM)
          </text>
          
          {/* Dynamic Stats Row above the bar */}
          <text x={0} y={18} fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill={voltageColor}>
            Back-EMF: {backEmfVolts} V
          </text>
          <text x={334} y={18} textAnchor="end" fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill={isNearCeiling ? "var(--cat-6)" : "var(--ink-70)"}>
            {headroomVolts > 0 ? `Headroom: ${headroomVolts} V` : "0 V Headroom"}
          </text>

          {/* Meter track */}
          <rect x={0} y={26} width={334} height={16} rx={0} fill="var(--deep)" stroke="var(--ink-10)" strokeWidth={1} />
          {/* Back-EMF Fill Bar with dynamic color */}
          <rect x={0} y={26} width={Math.max(12, Math.min(334, (334 * backEmfVolts) / 400))} height={16} rx={0} fill={voltageColor} />
        </g>

        {/* Status Warning Pill with dynamic color matching */}
        <g transform="translate(24, 156)">
          <rect
            width={334}
            height={32}
            rx={0}
            fill={isAtCeiling ? "rgba(196, 118, 63, 0.12)" : isNearCeiling ? "rgba(217, 119, 6, 0.08)" : "rgba(98, 13, 60, 0.05)"}
            stroke={voltageColor}
            strokeWidth={1}
          />
          <text x={167} y={20} textAnchor="middle" fontSize={10.5} fontFamily="var(--mono)" fontWeight="bold" fill={voltageColor}>
            {isAtCeiling
              ? "CEILING HIT: Battery cannot push more torque!"
              : isNearCeiling
              ? "Approaching Ceiling: Voltage Margin Shrinking"
              : "Safe Drive Zone: 100% Torque Voltage Available"}
          </text>
        </g>

        {/* Takeaway Box */}
        <g transform="translate(24, 206)">
          <rect width={334} height={80} rx={0} fill="var(--deep)" stroke="rgba(23, 20, 19, 0.08)" />
          <text x={16} y={22} fontSize={10.5} fontFamily="var(--mono)" fill="var(--wine)" fontWeight="bold">
            Why Permanent Magnet Motors Hit a Wall:
          </text>
          <text x={16} y={40} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            When Back-EMF equals battery voltage, current flow
          </text>
          <text x={16} y={54} fontSize={9.5} fontFamily="var(--sans)" fill="var(--ink-70)">
            stops and the motor cannot accelerate further on torque.
          </text>
          <text x={16} y={68} fontSize={9.5} fontFamily="var(--sans)" fill="var(--wine)" fontWeight="bold">
            To go faster, the inverter must weaken the magnet.
          </text>
        </g>
      </g>

      {/* Footnote */}
      <text className="d-label d-label--faint" x={24} y={376}>
        A permanent magnet cannot be switched off: as motor RPM climbs,
      </text>
      <text className="d-label d-label--faint" x={24} y={392}>
        its spinning field generates counter-voltage that hits the battery ceiling.
      </text>
    </svg>
  );
}

function FamilyTree({ onPick, rotor }: { onPick?: (id: string) => void; rotor?: string }) {
  const familyId = rotorToAlternativeFamily[(rotor ?? "ipm-ndfeb") as keyof typeof rotorToAlternativeFamily];
  const active = architectureLabs.find((item) => item.id === familyId) ?? architectureLabs[0];

  return (
    <div className="alt-lab" aria-label="Interactive comparison of traction-motor alternatives">
      {/* 1. Selector Tab Pills */}
      <div className="alt-lab__tabs" role="group" aria-label="Choose a motor family">
        {architectureLabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lab-tab ${item.id === active.id ? "is-on" : ""}`}
            aria-pressed={item.id === active.id}
            onClick={() => onPick?.(item.id)}
          >
            <span className="lab-tab__name">{item.shortLabel}</span>
            <small className="lab-tab__tag">{item.badgeTags[0]}</small>
          </button>
        ))}
      </div>

      {/* 2. High-Contrast Comparative Trade-Off Matrix */}
      <div className="alt-matrix-wrap">
        <table className="alt-matrix" aria-label="5-Way Motor Architecture Trade-Off Matrix">
          <thead>
            <tr>
              <th scope="col" className="matrix-metric-col">Architecture Dimension</th>
              {architectureLabs.map((item) => (
                <th
                  key={item.id}
                  scope="col"
                  className={`matrix-col-head ${item.id === active.id ? "is-active" : ""}`}
                  onClick={() => onPick?.(item.id)}
                >
                  {item.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Rare-Earth Exposure */}
            <tr>
              <th scope="row">Rare-Earth Exposure</th>
              {architectureLabs.map((item) => {
                const isPM = item.id === "pmsm";
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${isPM ? "pill--danger" : "pill--success"}`}>
                      {isPM ? "100% REE" : "0% Magnets"}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Highway Cruising Efficiency */}
            <tr>
              <th scope="row">Highway Cruising</th>
              {architectureLabs.map((item) => {
                let badge = "Free Coasting";
                let type = "pill--success";
                if (item.id === "pmsm") {
                  badge = "Highway Drag";
                  type = "pill--danger";
                } else if (item.id === "wound") {
                  badge = "Field Off (0 Drag)";
                  type = "pill--success";
                } else if (item.id === "synrm") {
                  badge = "Zero Drag";
                  type = "pill--success";
                } else if (item.id === "srm") {
                  badge = "Zero Drag";
                  type = "pill--success";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Rotor Moving Parts / Complexity */}
            <tr>
              <th scope="row">Rotor Hardware</th>
              {architectureLabs.map((item) => {
                let badge = "Standard";
                let type = "pill--neutral";
                if (item.id === "pmsm") {
                  badge = "Embedded Magnets";
                  type = "pill--neutral";
                } else if (item.id === "induction") {
                  badge = "Solid Cage";
                  type = "pill--success";
                } else if (item.id === "wound") {
                  badge = "Slip Rings";
                  type = "pill--warn";
                } else if (item.id === "synrm") {
                  badge = "Pure Steel";
                  type = "pill--success";
                } else if (item.id === "srm") {
                  badge = "Toothed Steel";
                  type = "pill--success";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Inverter & Silicon Burden */}
            <tr>
              <th scope="row">Inverter & Control</th>
              {architectureLabs.map((item) => {
                let badge = "Standard";
                let type = "pill--success";
                if (item.id === "pmsm") {
                  badge = "Standard Drive";
                  type = "pill--success";
                } else if (item.id === "induction") {
                  badge = "Standard Drive";
                  type = "pill--success";
                } else if (item.id === "wound") {
                  badge = "Dual Supply";
                  type = "pill--warn";
                } else if (item.id === "synrm") {
                  badge = "Larger Silicon";
                  type = "pill--warn";
                } else if (item.id === "srm") {
                  badge = "Ripple Tuning";
                  type = "pill--warn";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Active Contender Profile Spotlight */}
      <div className="alt-spotlight">
        <div className="alt-spotlight__header">
          <div>
            <h3 className="alt-spotlight__title">{active.label}</h3>
            <p className="alt-spotlight__principle">{active.principle}</p>
          </div>
          <div className="alt-spotlight__tags">
            {active.badgeTags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        </div>

        <div className="alt-spotlight__grid">
          {/* Green Card: The Superpower */}
          <div className="spotlight-card spotlight-card--superpower">
            <h4>✓ THE SUPERPOWER (WHY ADOPT IT)</h4>
            <p>{active.superpower}</p>
          </div>

          {/* Amber Card: The Catch */}
          <div className="spotlight-card spotlight-card--catch">
            <h4>✕ THE CATCH (ENGINEERING TRADE-OFF)</h4>
            <p>{active.theCatch}</p>
          </div>
        </div>

        {/* Real-World Production Fleet */}
        <div className="alt-spotlight__fleet">
          <span className="fleet-label">PRODUCTION & PILOT FLEET:</span>
          <div className="fleet-pills">
            {active.productionCars.map((car) => (
              <span key={car} className="car-pill">{car}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialLab({ state }: { state: string }) {
  const [selected, setSelected] = useState(materialIdForState(state));

  useEffect(() => {
    setSelected(materialIdForState(state));
  }, [state]);

  const active = materialLabs.find((item) => item.id === selected) ?? materialLabs[0];

  return (
    <div className="material-lab alt-lab" aria-label="Interactive comparison of permanent-magnet materials">
      {/* 1. Selector Tabs */}
      <div className="alt-lab__tabs" role="group" aria-label="Choose a magnet chemistry">
        {materialLabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lab-tab ${item.id === active.id ? "is-on" : ""}`}
            aria-pressed={item.id === active.id}
            onClick={() => setSelected(item.id)}
          >
            <span className="lab-tab__name">{item.shortLabel}</span>
            <small className="lab-tab__tag">{item.badgeTags[0]}</small>
          </button>
        ))}
      </div>

      {/* 2. High-Contrast Comparative Trade-Off Matrix */}
      <div className="alt-matrix-wrap">
        <table className="alt-matrix" aria-label="3-Way Magnet Chemistry Trade-Off Matrix">
          <thead>
            <tr>
              <th scope="col" className="matrix-metric-col">Chemistry Dimension</th>
              {materialLabs.map((item) => (
                <th
                  key={item.id}
                  scope="col"
                  className={`matrix-col-head ${item.id === active.id ? "is-active" : ""}`}
                  onClick={() => setSelected(item.id)}
                >
                  {item.shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Rare-Earth Supply Exposure */}
            <tr>
              <th scope="row">Rare-Earth Exposure</th>
              {materialLabs.map((item) => {
                const isNd = item.id === "ndfeb";
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${isNd ? "pill--danger" : "pill--success"}`}>
                      {isNd ? "100% Nd/Dy" : "0% Magnets"}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Magnetic Strength (Br) */}
            <tr>
              <th scope="row">Magnetic Strength (Br)</th>
              {materialLabs.map((item) => {
                let badge = "Reference (100%)";
                let type = "pill--success";
                if (item.id === "ferrite") {
                  badge = "Weak (~33%)";
                  type = "pill--warn";
                } else if (item.id === "iron-nitride") {
                  badge = "High (~75%)";
                  type = "pill--success";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: Reversal & Thermal Limits */}
            <tr>
              <th scope="row">Thermal & Coercivity Gate</th>
              {materialLabs.map((item) => {
                let badge = "High Coercivity";
                let type = "pill--success";
                if (item.id === "ferrite") {
                  badge = "Cold-Start Risk";
                  type = "pill--warn";
                } else if (item.id === "iron-nitride") {
                  badge = "Decomposes >220°C";
                  type = "pill--danger";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>

            {/* Row 4: Traction Readiness */}
            <tr>
              <th scope="row">Traction Production Status</th>
              {materialLabs.map((item) => {
                let badge = "Production Vehicle";
                let type = "pill--success";
                if (item.id === "ferrite") {
                  badge = "Axial / EV Pilot";
                  type = "pill--warn";
                } else if (item.id === "iron-nitride") {
                  badge = "Materials Scale-Up";
                  type = "pill--neutral";
                }
                return (
                  <td key={item.id} className={item.id === active.id ? "is-active" : ""}>
                    <span className={`pill ${type}`}>{badge}</span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Active Chemistry Spotlight */}
      <div className="alt-spotlight">
        <div className="alt-spotlight__header">
          <div>
            <h3 className="alt-spotlight__title">{active.label}</h3>
            <p className="alt-spotlight__principle">{active.role}</p>
          </div>
          <div className="alt-spotlight__tags">
            {active.badgeTags.map((tag) => (
              <span key={tag} className="tag-pill">{tag}</span>
            ))}
          </div>
        </div>

        <div className="alt-spotlight__grid">
          {/* Green Card: The Superpower */}
          <div className="spotlight-card spotlight-card--superpower">
            <h4>✓ THE SUPERPOWER (WHY ADOPT IT)</h4>
            <p>{active.superpower}</p>
          </div>

          {/* Amber Card: The Catch */}
          <div className="spotlight-card spotlight-card--catch">
            <h4>✕ THE CATCH (ENGINEERING TRADE-OFF)</h4>
            <p>{active.theCatch}</p>
          </div>
        </div>

        {/* Real-World Production & Pilot Fleet */}
        <div className="alt-spotlight__fleet">
          <span className="fleet-label">REAL-WORLD ADOPTERS & PROGRAMMES:</span>
          <div className="fleet-pills">
            {active.adopters.map((car) => (
              <span key={car} className="car-pill">{car}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Act IV: what has to change ─────────────────────────────────────────── */

const SURVIVORS = ["Body", "Crash structure", "Interior", "Battery", "Suspension"];

/**
 * Each item is tied to the system whose change actually forces it. Control
 * software follows the inverter and excitation; NVH calibration follows the
 * cooling and mechanical package. Tying everything to "validation" would have
 * claimed a Dy-lean magnet swap needs new control software, which it does not.
 */
const CHANGERS = [
  { label: "Motor", key: "motor" },
  { label: "Inverter", key: "inverter" },
  { label: "Cooling", key: "cooling" },
  { label: "Control software", key: "inverter" },
  { label: "NVH calibration", key: "cooling" },
  { label: "Validation", key: "validation" },
] as const;

function SwapBurden({
  architecture,
  onPick,
}: {
  architecture: ArchitectureId;
  onPick?: (id: ArchitectureId) => void;
}) {
  const active = architectureStates[architecture];
  const changed = new Set<string>(active.changed);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="What changes in the vehicle for each alternative architecture">
      <text className="d-axis-label" x={0} y={14}>Choose a route</text>
      {architectureOptions.map((option, i) => (
        <g key={option.id} className="d-hit" onClick={() => onPick?.(option.id)}>
          <rect
            className={`d-node ${option.id === architecture ? "is-on" : ""}`}
            x={i * 138}
            y={26}
            width={128}
            height={34}
          />
          <text
            className={`d-label ${option.id === architecture ? "d-label--accent" : ""}`}
            x={i * 138 + 64}
            y={48}
            textAnchor="middle"
          >
            {option.label}
          </text>
        </g>
      ))}

      <g transform="translate(0, 96)">
        <text className="d-axis-label" x={0} y={0}>Carries over unchanged</text>
        {SURVIVORS.map((item, i) => (
          <g key={item}>
            <rect className="d-fill--mute" x={0} y={14 + i * 32} width={300} height={24} />
            <text className="d-label d-label--faint" x={12} y={31 + i * 32}>{item}</text>
          </g>
        ))}
      </g>

      <g transform="translate(360, 96)">
        <text className="d-axis-label d-label--warn" x={0} y={0}>Has to be redone</text>
        {CHANGERS.map((item, i) => {
          const on = changed.has(item.key);
          return (
            <g key={item.label}>
              <rect className={on ? "d-fill--warn-soft" : "d-fill--mute"} x={0} y={14 + i * 32} width={300} height={24} />
              {on && <rect className="d-fill--warn" x={0} y={14 + i * 32} width={3} height={24} />}
              <text className={`d-label ${on ? "d-label--warn" : "d-label--faint"}`} x={12} y={31 + i * 32}>
                {item.label}
              </text>
              <text className="d-label d-label--faint" x={288} y={31 + i * 32} textAnchor="end">
                {on ? "redo" : "carries over"}
              </text>
            </g>
          );
        })}
      </g>


      <g transform="translate(0, 336)">
        <text className="d-axis-label" x={0} y={0}>How much has to change</text>
        <text className="d-label d-label--faint" x={W - 40} y={0} textAnchor="end">
          {active.summary}
        </text>
        <path className="d-axis" d={`M 0 34 L ${W - 40} 34`} />
        {burdenRoutes.map((route) => (
          <g key={route.id}>
            <circle className="d-fill--accent" cx={((W - 40) * route.position) / 100} cy={34} r={4} />
            <text
              className="d-label"
              x={((W - 40) * route.position) / 100}
              y={56}
              textAnchor={route.position < 25 ? "start" : route.position > 75 ? "end" : "middle"}
            >
              {route.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ── Act I Diagrams: How It Turns ───────────────────────────────────────── */

function ElectromagnetCoilDiagram({
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const [ccw, setCcw] = useState(true);

  const toggle = (val: boolean) => {
    setCcw(val);
    onPatchControls?.({ angle: val ? 0 : Math.PI });
  };

  const isNorthUp = ccw;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Electromagnet coil and magnetic field vector diagram">
      <defs>
        <linearGradient id="coilCopperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--cat-6)" />
          <stop offset="50%" stopColor="var(--cat-6)" />
          <stop offset="100%" stopColor="var(--cat-6)" />
        </linearGradient>
        <marker id="fluxArrowUp" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cat-5)" />
        </marker>
        <marker id="fluxArrowDown" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--cat-5)" />
        </marker>
      </defs>

      <text className="d-axis-label" x={0} y={16}>
        ELECTROMAGNETIC FORCE · AMPÈRE&apos;S LAW &amp; RIGHT-HAND RULE
      </text>

      {/* Left: Physical Coil & Flux Stage */}
      <g transform="translate(40, 30)">
        {/* Exterior Flux Loops */}
        <path
          d="M 180 50 C 60 20, 20 180, 20 180 C 20 180, 60 340, 180 310"
          fill="none"
          stroke="var(--cat-5)"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          opacity="0.45"
        />
        <path
          d="M 180 50 C 300 20, 340 180, 340 180 C 340 180, 300 340, 180 310"
          fill="none"
          stroke="var(--cat-5)"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          opacity="0.45"
        />

        {/* Steel core */}
        <rect x="135" y="60" width="90" height="240" rx="8" fill="var(--ink-20)" stroke="var(--ink-50)" strokeWidth="1.5" />

        {/* Magnetic Vector Arrow */}
        {isNorthUp ? (
          <line
            x1="180"
            y1="300"
            x2="180"
            y2="36"
            stroke="var(--cat-5)"
            strokeWidth="5"
            markerEnd="url(#fluxArrowUp)"
          />
        ) : (
          <line
            x1="180"
            y1="60"
            x2="180"
            y2="324"
            stroke="var(--cat-5)"
            strokeWidth="5"
            markerEnd="url(#fluxArrowDown)"
          />
        )}

        {/* 5 Copper Wire Loops */}
        {[85, 135, 185, 235, 285].map((y) => (
          <g key={y}>
            <ellipse
              cx="180"
              cy={y}
              rx="55"
              ry="14"
              fill="none"
              stroke="url(#coilCopperGrad)"
              strokeWidth="10"
            />
            {/* Current direction particle */}
            <circle
              cx={isNorthUp ? 232 : 128}
              cy={y}
              r="4"
              fill="var(--paper)"
            />
          </g>
        ))}

        {/* Polarity Badges */}
        <g transform={`translate(180, ${isNorthUp ? 32 : 328})`}>
          <circle r="16" fill="var(--cat-5)" />
          <text textAnchor="middle" dominantBaseline="central" fill="var(--paper)" fontSize="13" fontWeight="bold" fontFamily="var(--mono)">
            N
          </text>
        </g>

        <g transform={`translate(180, ${isNorthUp ? 328 : 32})`}>
          <circle r="16" fill="var(--ink)" />
          <text textAnchor="middle" dominantBaseline="central" fill="var(--paper)" fontSize="13" fontWeight="bold" fontFamily="var(--mono)">
            S
          </text>
        </g>

        {/* Floating Labels */}
        <text x="180" y={isNorthUp ? 8 : 362} textAnchor="middle" className="d-label d-label--accent" fontSize="11">
          {isNorthUp ? "Magnetic North (B ↑)" : "Magnetic North (B ↓)"}
        </text>
        <text x="245" y="190" className="d-label" fill="var(--cat-6)" fontSize="11" fontWeight="bold">
          Current (I) →
        </text>
      </g>

      {/* Right: Right-Hand Rule Explanation & Interactive Toggle Card */}
      <g transform="translate(440, 50)">
        <rect x="0" y="0" width="360" height="340" rx="8" fill="var(--paper)" stroke="rgba(23, 20, 19, 0.12)" strokeWidth="1" />

        <text className="d-label d-label--strong" x="24" y="36" fontSize="14">
          The Right-Hand Grip Rule
        </text>

        <text className="d-label" x="24" y="70" fontSize="12">
          1. Curl the four fingers of your right hand in the direction
        </text>
        <text className="d-label" x="24" y="90" fontSize="12">
          of electric current flowing through the wire coil.
        </text>

        <text className="d-label" x="24" y="125" fontSize="12">
          2. Your outstretched thumb points directly along the
        </text>
        <text className="d-label" x="24" y="145" fontSize="12">
          coil axis toward the concentrated North Pole (N).
        </text>

        <line x1="24" y1="170" x2="336" y2="170" stroke="rgba(23, 20, 19, 0.08)" strokeWidth="1" />

        <text className="d-axis-label" x="24" y="196">
          SELECT CURRENT DIRECTION (FLIP POLARITY):
        </text>

        {/* Button 1: Counter-Clockwise (North Up) */}
        <g
          style={{ cursor: "pointer" }}
          onClick={() => toggle(true)}
          role="button"
          tabIndex={0}
        >
          <rect
            x="24"
            y="212"
            width="312"
            height="44"
            rx="6"
            fill={isNorthUp ? "var(--wine)" : "var(--deep)"}
            stroke={isNorthUp ? "var(--wine)" : "rgba(23, 20, 19, 0.18)"}
            strokeWidth="1"
          />
          <text
            x="40"
            y="238"
            fill={isNorthUp ? "var(--paper)" : "var(--ink)"}
            fontSize="12"
            fontFamily="var(--mono)"
            fontWeight="bold"
          >
            Counter-Clockwise Current  →  North UP
          </text>
        </g>

        {/* Button 2: Clockwise (North Down) */}
        <g
          style={{ cursor: "pointer" }}
          onClick={() => toggle(false)}
          role="button"
          tabIndex={0}
        >
          <rect
            x="24"
            y="268"
            width="312"
            height="44"
            rx="6"
            fill={!isNorthUp ? "var(--wine)" : "var(--deep)"}
            stroke={!isNorthUp ? "var(--wine)" : "rgba(23, 20, 19, 0.18)"}
            strokeWidth="1"
          />
          <text
            x="40"
            y="294"
            fill={!isNorthUp ? "var(--paper)" : "var(--ink)"}
            fontSize="12"
            fontFamily="var(--mono)"
            fontWeight="bold"
          >
            Clockwise Current  →  North DOWN
          </text>
        </g>
      </g>
    </svg>
  );
}

// Waveform plot geometry
const THREE_PHASE_PLOT_X = 40;
const THREE_PHASE_PLOT_Y = 80;
const THREE_PHASE_PLOT_W = 400;
const THREE_PHASE_PLOT_H = 180;
const THREE_PHASE_MID_Y = THREE_PHASE_PLOT_Y + THREE_PHASE_PLOT_H / 2;
const THREE_PHASE_AMP = 70;

function ThreePhaseSuperpositionDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const normAngle = ((controls.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const angleDeg = Math.round((normAngle * 180) / Math.PI);

  const iA = Math.cos(normAngle);
  const iB = Math.cos(normAngle - (Math.PI * 2) / 3);
  const iC = Math.cos(normAngle + (Math.PI * 2) / 3);

  const pointsA = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= THREE_PHASE_PLOT_W; x += 4) {
      const rad = (x / THREE_PHASE_PLOT_W) * Math.PI * 2;
      const y = THREE_PHASE_MID_Y - Math.cos(rad) * THREE_PHASE_AMP;
      pts.push(`${THREE_PHASE_PLOT_X + x},${y}`);
    }
    return pts.join(" ");
  }, []);

  const pointsB = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= THREE_PHASE_PLOT_W; x += 4) {
      const rad = (x / THREE_PHASE_PLOT_W) * Math.PI * 2;
      const y = THREE_PHASE_MID_Y - Math.cos(rad - (Math.PI * 2) / 3) * THREE_PHASE_AMP;
      pts.push(`${THREE_PHASE_PLOT_X + x},${y}`);
    }
    return pts.join(" ");
  }, []);

  const pointsC = useMemo(() => {
    const pts: string[] = [];
    for (let x = 0; x <= THREE_PHASE_PLOT_W; x += 4) {
      const rad = (x / THREE_PHASE_PLOT_W) * Math.PI * 2;
      const y = THREE_PHASE_MID_Y - Math.cos(rad + (Math.PI * 2) / 3) * THREE_PHASE_AMP;
      pts.push(`${THREE_PHASE_PLOT_X + x},${y}`);
    }
    return pts.join(" ");
  }, []);

  const scrubX = THREE_PHASE_PLOT_X + (normAngle / (Math.PI * 2)) * THREE_PHASE_PLOT_W;

  // Phasor Circle Geometry
  const circleX = 640;
  const circleY = 170;
  const circleR = 100;

  // Resultant vector coordinates (constant length = circleR * 0.9)
  const resX = circleX + Math.cos(normAngle) * (circleR * 0.9);
  const resY = circleY - Math.sin(normAngle) * (circleR * 0.9);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="3-Phase AC Superposition diagram">
      <defs>
        <marker id="phasorArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--wine)" />
        </marker>
      </defs>

      <text className="d-axis-label" x={0} y={16}>
        STATOR SUPERPOSITION · THREE-PHASE AC TO ROTATING FIELD
      </text>

      {/* Left: Waveforms */}
      <g>
        <text className="d-label d-label--strong" x={THREE_PHASE_PLOT_X} y={56}>
          Three AC Sinusoids Offset by 120°
        </text>

        {/* Zero Axis */}
        <line x1={THREE_PHASE_PLOT_X} y1={THREE_PHASE_MID_Y} x2={THREE_PHASE_PLOT_X + THREE_PHASE_PLOT_W} y2={THREE_PHASE_MID_Y} stroke="rgba(23,20,19,0.15)" strokeWidth="1" strokeDasharray="3 3" />

        {/* 3 Curves */}
        <polyline points={pointsA} fill="none" stroke="var(--cat-6)" strokeWidth="2.5" />
        <polyline points={pointsB} fill="none" stroke="var(--cat-5)" strokeWidth="2.5" />
        <polyline points={pointsC} fill="none" stroke="var(--positive)" strokeWidth="2.5" />

        {/* Vertical Scrubber */}
        <line x1={scrubX} y1={THREE_PHASE_PLOT_Y} x2={scrubX} y2={THREE_PHASE_PLOT_Y + THREE_PHASE_PLOT_H} stroke="var(--wine)" strokeWidth="2" />
        <circle cx={scrubX} cy={THREE_PHASE_MID_Y - iA * THREE_PHASE_AMP} r="4.5" fill="var(--cat-6)" stroke="var(--paper)" strokeWidth="1.5" />
        <circle cx={scrubX} cy={THREE_PHASE_MID_Y - iB * THREE_PHASE_AMP} r="4.5" fill="var(--cat-5)" stroke="var(--paper)" strokeWidth="1.5" />
        <circle cx={scrubX} cy={THREE_PHASE_MID_Y - iC * THREE_PHASE_AMP} r="4.5" fill="var(--positive)" stroke="var(--paper)" strokeWidth="1.5" />

        {/* Readouts below waveforms */}
        <g transform={`translate(${THREE_PHASE_PLOT_X}, 280)`}>
          <circle cx="6" cy="6" r="5" fill="var(--cat-6)" />
          <text x="18" y="10" className="d-label" fontSize="11">Phase A: <tspan className="d-label--strong">{iA >= 0 ? `+${iA.toFixed(2)}` : iA.toFixed(2)}</tspan></text>

          <circle cx="146" cy="6" r="5" fill="var(--cat-5)" />
          <text x="158" y="10" className="d-label" fontSize="11">Phase B: <tspan className="d-label--strong">{iB >= 0 ? `+${iB.toFixed(2)}` : iB.toFixed(2)}</tspan></text>

          <circle cx="286" cy="6" r="5" fill="var(--positive)" />
          <text x="298" y="10" className="d-label" fontSize="11">Phase C: <tspan className="d-label--strong">{iC >= 0 ? `+${iC.toFixed(2)}` : iC.toFixed(2)}</tspan></text>
        </g>

        {/* Interactive angle scrub track in SVG */}
        <g transform={`translate(${THREE_PHASE_PLOT_X}, 310)`}>
          <text className="d-axis-label" x="0" y="12">SCRUB ELECTRICAL ANGLE (θ): {angleDeg}°</text>
          <rect
            x="0"
            y="20"
            width={THREE_PHASE_PLOT_W}
            height="16"
            rx="8"
            fill="var(--ink-10)"
            style={{ cursor: "ew-resize" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onPatchControls?.({ angle: ratio * Math.PI * 2 });
            }}
          />
          <circle
            cx={THREE_PHASE_PLOT_X + (normAngle / (Math.PI * 2)) * THREE_PHASE_PLOT_W}
            cy="28"
            r="9"
            fill="var(--wine)"
            stroke="var(--paper)"
            strokeWidth="2"
            style={{ cursor: "ew-resize" }}
          />
        </g>
      </g>

      {/* Right: Vector Sum Phasor Circle */}
      <g>
        <text className="d-label d-label--strong" x={circleX - circleR} y={56}>
          Resultant Rotating Field Vector (B_net)
        </text>

        {/* Circle Track */}
        <circle cx={circleX} cy={circleY} r={circleR} fill="var(--deep)" stroke="rgba(23,20,19,0.15)" strokeWidth="1.5" />

        {/* 3 Coil Axes */}
        <line x1={circleX} y1={circleY} x2={circleX + circleR} y2={circleY} stroke="var(--cat-6)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={circleX} y1={circleY} x2={circleX + Math.cos((Math.PI * 2) / 3) * circleR} y2={circleY - Math.sin((Math.PI * 2) / 3) * circleR} stroke="var(--cat-5)" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1={circleX} y1={circleY} x2={circleX + Math.cos((Math.PI * 4) / 3) * circleR} y2={circleY - Math.sin((Math.PI * 4) / 3) * circleR} stroke="var(--positive)" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Resultant Vector */}
        <line
          x1={circleX}
          y1={circleY}
          x2={resX}
          y2={resY}
          stroke="var(--wine)"
          strokeWidth="3.5"
          markerEnd="url(#phasorArrow)"
        />
        <circle cx={circleX} cy={circleY} r="4" fill="var(--wine)" />

        {/* Takeaway badge */}
        <rect x={circleX - 110} y={300} width="220" height="52" rx="6" fill="var(--deep)" stroke="rgba(23,20,19,0.08)" />
        <text x={circleX} y="322" textAnchor="middle" className="d-label d-label--strong" fontSize="11">
          |B_net| = 1.5 · B_max = CONSTANT
        </text>
        <text x={circleX} y="340" textAnchor="middle" className="d-label d-label--faint" fontSize="10">
          Smooth continuous rotation at frequency f
        </text>
      </g>
    </svg>
  );
}

function DualTorqueSplitDiagram({
  controls,
  onPatchControls,
}: {
  controls: StageControls;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  const x0 = 60;
  const y0 = 48;
  const w = 680;
  const h = 240;

  const deltaRad = (controls.load * 0.9 * Math.PI) / 2;
  const deltaDeg = Math.round((deltaRad * 180) / Math.PI);

  const tMag = Math.sin(deltaRad);
  const tRel = 0.5 * Math.sin(2 * deltaRad);
  const tTotal = tMag + tRel;

  const totalSafe = Math.max(0.01, tTotal);
  const pctMag = Math.round((tMag / totalSafe) * 100);
  const pctRel = 100 - pctMag;

  const maxTotal = 1.35;

  const ptsMag: string[] = [];
  const ptsRel: string[] = [];
  const ptsTotal: string[] = [];

  for (let x = 0; x <= w; x += 4) {
    const d = (x / w) * (Math.PI / 2);
    const mag = Math.sin(d);
    const rel = 0.5 * Math.sin(2 * d);
    const tot = mag + rel;

    const yMag = y0 + h - (mag / maxTotal) * h;
    const yRel = y0 + h - (rel / maxTotal) * h;
    const yTot = y0 + h - (tot / maxTotal) * h;

    ptsMag.push(`${x0 + x},${yMag}`);
    ptsRel.push(`${x0 + x},${yRel}`);
    ptsTotal.push(`${x0 + x},${yTot}`);
  }

  const cursorX = x0 + (deltaRad / (Math.PI / 2)) * w;
  const cursorY = y0 + h - (tTotal / maxTotal) * h;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dual torque decomposition diagram">
      <text className="d-axis-label" x={0} y={14}>
        TORQUE DECOMPOSITION · PERMANENT MAGNET VS RELUCTANCE
      </text>
      {/* The unit lives here rather than on the axis, where its title landed
          on top of the right-hand tick. */}
      <text className="d-label d-label--faint" x={0} y={30}>
        Shaft torque, normalised · by load angle δ in degrees
      </text>

      <Axes
        x={x0}
        y={y0}
        w={w}
        h={h}
      />

      {/* Axis Degree Markers */}
      <text className="d-axis-label" x={x0} y={y0 + h + 14} textAnchor="start">0°</text>
      <text className="d-axis-label" x={x0 + w / 2} y={y0 + h + 14} textAnchor="middle">45° · peak reluctance</text>
      <text className="d-axis-label" x={x0 + w} y={y0 + h + 14} textAnchor="end">90° · peak magnet</text>

      {/* Component Curves */}
      <polyline points={ptsMag.join(" ")} fill="none" stroke="var(--cat-5)" strokeWidth="1.75" strokeDasharray="4 3" />
      <polyline points={ptsRel.join(" ")} fill="none" stroke="var(--cat-6)" strokeWidth="1.75" strokeDasharray="4 3" />
      <polyline points={ptsTotal.join(" ")} fill="none" stroke="var(--wine)" strokeWidth="3" />

      {/* Inline Curve Annotations */}
      {/*
        Direct labels, placed in the gaps between the curves rather than on
        them. Each y is derived from the curve it names, so the label tracks
        the drawing instead of being pinned to a guessed coordinate.
      */}
      <text
        x={x0 + w * 0.5}
        y={y0 + h - (0.5 / maxTotal) * h + 22}
        textAnchor="middle"
        fill="var(--cat-6)"
        fontSize="11"
        fontFamily="var(--mono)"
      >
        Reluctance
      </text>
      <text
        x={x0 + w * 0.93}
        y={y0 + h - (Math.sin(0.93 * (Math.PI / 2)) / maxTotal) * h + 24}
        textAnchor="end"
        fill="var(--cat-5)"
        fontSize="11"
        fontFamily="var(--mono)"
      >
        Magnet
      </text>
      <text
        x={x0 + w * 0.93}
        y={y0 + h - ((Math.sin(0.93 * (Math.PI / 2)) + 0.5 * Math.sin(2 * 0.93 * (Math.PI / 2))) / maxTotal) * h - 12}
        textAnchor="end"
        fill="var(--wine)"
        fontSize="11.5"
        fontFamily="var(--mono)"
      >
        Combined
      </text>

      {/* Cursor Leader & Dot */}
      <line
        x1={cursorX}
        y1={y0}
        x2={cursorX}
        y2={y0 + h}
        stroke="var(--wine)"
        strokeWidth="1.25"
        strokeDasharray="3 3"
      />
      <circle cx={cursorX} cy={cursorY} r="5" fill="var(--wine)" stroke="var(--paper)" strokeWidth="2" />

      {/* Cursor Readout Badge */}
      <g transform={`translate(${Math.min(x0 + w - 220, Math.max(x0, cursorX - 110))}, ${y0 + h + 24})`}>
        <rect width="220" height="26" rx="0" fill="var(--paper)" stroke="rgba(23, 20, 19, 0.16)" strokeWidth="1" />
        <text x="110" y="17" textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill="var(--ink)">
          δ = {deltaDeg}°: <tspan fill="var(--cat-5)" fontWeight="bold">{pctMag}% Mag</tspan> + <tspan fill="var(--cat-6)" fontWeight="bold">{pctRel}% Rel</tspan>
        </text>
      </g>

      {/* Clean Drag Slider at Bottom */}
      <g transform={`translate(${x0}, 352)`}>
        <text className="d-axis-label" x="0" y="10">SCRUB LOAD ANGLE (δ): {deltaDeg}°</text>
        <rect
          x="0"
          y="18"
          width={w}
          height="14"
          rx="7"
          fill="var(--ink-10)"
          style={{ cursor: "ew-resize" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0.05, Math.min(1, clickX / rect.width));
            onPatchControls?.({ load: ratio });
          }}
        />
        <circle
          cx={(deltaRad / (Math.PI / 2)) * w}
          cy="25"
          r="8"
          fill="var(--wine)"
          stroke="var(--paper)"
          strokeWidth="2"
          style={{ cursor: "ew-resize" }}
        />
      </g>

      {/* Editorial Note */}
      <text className="d-label d-label--faint" x={x0} y={408}>
        Interior magnet placement forces flux through steel paths, adding 30–40% reluctance torque without extra NdFeB magnets.
      </text>
    </svg>
  );
}

/* ── Router ─────────────────────────────────────────────────────────────── */

export function Diagram({
  id,
  stateId,
  controls,
  architecture,
  onPickArchitecture,
  rotor,
  onPickFamily,
  onPatchControls,
}: {
  id: DiagramId;
  stateId: string;
  /**
   * Which feature of the figure to point at. This is what lets beats share a
   * drawing without repeating themselves — the annotation moves even when the
   * plot does not. Set per beat in route/pages.ts.
   */
  emphasis?: string;
  controls: StageControls;
  architecture: ArchitectureId;
  onPickArchitecture?: (id: ArchitectureId) => void;
  rotor?: string;
  onPickFamily?: (id: string) => void;
  onPatchControls?: (patch: Partial<StageControls>) => void;
}) {
  return (
    <div className="diagram">
      {id === "why-it-matters" && <WhyItMatters state={stateId} />}
      {id === "supply-concentration" && <SupplyConcentration state={stateId} />}
      {id === "electromagnet-coil" && (
        <ElectromagnetCoilDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "three-phase-superposition" && (
        <ThreePhaseSuperpositionDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "dual-torque-split" && (
        <DualTorqueSplitDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "division-of-labour" && (
        <DivisionOfLabourDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "anisotropy-crystal" && (
        <AnisotropyCrystalDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "demag-curve" && (
        <DemagCurveDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "hot-margin" && (
        <ThermalDemagDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "grain-diffusion" && (
        <GrainBoundaryDiffusionDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "magnet-composition" && (
        <GrainBoundaryDiffusionDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "light-heavy-split" && <LightHeavySplitDiagram />}
      {id === "mitigation-ladder" && (
        <MitigationLadderDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "back-emf-ceiling" && (
        <BackEmfCeiling controls={controls} state={stateId} onPatchControls={onPatchControls} />
      )}
      {id === "family-tree" && <FamilyTree rotor={rotor} onPick={onPickFamily} />}
      {id === "property-board" && <MaterialLab state={stateId} />}
      {id === "swap-burden" && <SwapBurden architecture={architecture} onPick={onPickArchitecture} />}
      {id === "grip-rule-clean" && (
        <GripRuleDiagram controls={controls} onPatchControls={onPatchControls} />
      )}
      {id === "rotating-field-clean" && <RotatingFieldDiagram controls={controls} />}
      {id === "torque-combination-clean" && <TorqueCombinationDiagram />}
      {id === "magnet-jobs-clean" && <MagnetJobsDiagram />}
      {id === "rare-earth-split-clean" && <RareEarthSplitDiagram />}
      {id === "heat-protection-clean" && <HeatProtectionDiagram controls={controls} />}
      {id === "mitigation-options-clean" && <MitigationOptionsDiagram />}
      {id === "alternatives-map-clean" && <AlternativesMapDiagram />}
      {id === "change-burden-clean" && <ChangeBurdenDiagram />}
      {id === "readiness-map-clean" && <ReadinessMapDiagram />}
      {id === "decision-summary-clean" && <DecisionSummaryDiagram />}
    </div>
  );
}
