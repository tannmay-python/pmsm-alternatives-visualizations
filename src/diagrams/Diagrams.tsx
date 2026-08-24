import { useEffect, useState } from "react";
import {
  MITIGATION_RUNGS,
  calculateBackEmfHeight,
  calculateFieldWeakeningVectors,
  getMitigationFootprintInfo,
} from "../models/exposure";
import { architectureLabs, rotorToAlternativeFamily } from "../models/alternativeLab";
import { materialIdForState, materialLabs } from "../models/materialLab";
import { burdenRoutes, architectureOptions, architectureStates, type ArchitectureId } from "../models/swapBurden";
import type { DiagramId } from "../route/route";
import type { StageControls } from "../stage/controls";
import { Axes, Leader, SegmentBar } from "./parts";
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

/* ── Act II: the two magnet properties ──────────────────────────────────── */

/**
 * The second-quadrant demagnetisation curve, which is where both magnet
 * properties live at once: where the curve meets the vertical axis is what the
 * magnet holds unaided, and where it turns down is what it takes to undo it.
 *
 * The alloys are drawn from the same curve function so the comparison is
 * structural rather than three unrelated drawings: iron has the strength and
 * nearly no resistance, neodymium metal has neither at temperature, and NdFeB
 * has both because each element supplies one of them.
 */
const ALLOYS = {
  ndfeb: { label: "NdFeB", br: 1, hc: 1 },
  iron: { label: "Iron alone", br: 0.94, hc: 0.04 },
  neodymium: { label: "Neodymium alone", br: 0.22, hc: 0.3 },
} as const;

type AlloyKey = keyof typeof ALLOYS;

function DemagCurve({ controls, state }: { controls: StageControls; state: string }) {
  const x0 = 60;
  const y0 = 30;
  const w = 600;
  const h = 290;

  // Heat only enters the picture once the lesson is about heat.
  const heat =
    state === "hot-margin" || state === "dysprosium-tradeoff"
      ? controls.heat
      : 0;
  const reverse = state === "hot-margin" || state === "coercivity" ? controls.load : 0;
  const dysprosium = state === "dysprosium-tradeoff" ? controls.dysprosium : 0;

  const path = (br: number, hcInput: number) => {
    const top = y0 + h - br * h;
    const hc = Math.min(1.08, hcInput);
    const knee = x0 + Math.min(w, hc * w * 0.78);
    return `M ${x0} ${top} L ${knee} ${top - 4} Q ${x0 + hc * w} ${top} ${x0 + Math.min(w, hc * w)} ${y0 + h}`;
  };

  const compare = state === "division-of-labour";
  const shown: AlloyKey[] = compare ? ["ndfeb", "iron", "neodymium"] : ["ndfeb"];

  const br = Math.max(0.2, 1 - heat * 0.18 - dysprosium * 0.22);
  const hc = Math.min(1.08, (1 - heat * 0.55) * (1 + dysprosium * 0.45));
  const reverseX = x0 + reverse * w;
  const flipThreshold = hc * 0.78;
  const past = state !== "anisotropy" && reverse >= flipThreshold;
  const margin = Math.max(0, flipThreshold - reverse);

  const axisTurn = (controls.angle % (Math.PI / 2)) / (Math.PI / 2);
  const hardAxisEnergy = Math.sin(Math.min(Math.PI, Math.abs(controls.angle))) ** 2;
  const axisX = x0 + w - 92;
  const axisY = y0 + 74;
  const axisRadius = 34;
  const axisEnd = [axisX - Math.cos(axisTurn * Math.PI) * axisRadius, axisY - Math.sin(axisTurn * Math.PI) * axisRadius];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Demagnetisation curve showing remanence and coercivity">
      <Axes x={x0} y={y0} w={w} h={h} xLabel="reverse field applied →" yLabel="magnetisation held" />

      {/* The unheated reference, so any shift from heat is visible as a shift. */}
      {heat > 0.02 && <path className="d-curve d-curve--ghost" d={path(1, 1)} />}

      {shown.map((key) => {
        const alloy = ALLOYS[key];
        const main = key === "ndfeb";
        return (
          <g key={key}>
            <path
              className={`d-curve ${main ? (past ? "d-curve--warn" : "d-curve--accent") : ""}`}
              d={path(main ? br * alloy.br : alloy.br, main ? hc * alloy.hc : alloy.hc)}
              opacity={main ? 1 : 0.55}
            />
            {compare && (
              <text
                className={`d-label ${main ? "d-label--accent" : "d-label--faint"}`}
                x={x0 + 8}
                y={y0 + h - alloy.br * h - 6}
              >
                {alloy.label}
              </text>
            )}
          </g>
        );
      })}

      {/* The anisotropy lesson needs an orientation dial, not another curve. */}
      {state === "anisotropy" && (
        <g>
          <circle className="d-fill--mute" cx={axisX} cy={axisY} r={axisRadius} />
          <path className="d-curve d-curve--warn" d={`M ${axisX - 44} ${axisY} L ${axisX + 44} ${axisY}`} />
          <text className="d-label d-label--faint" x={axisX + 50} y={axisY + 4}>reverse field</text>
          <path
            className="d-rule"
            style={{ stroke: "var(--accent)" }}
            d={`M ${axisX} ${axisY} L ${axisEnd[0]} ${axisEnd[1]}`}
          />
          <circle className="d-fill--accent" cx={axisEnd[0]} cy={axisEnd[1]} r={3} />
          <text className="d-label" x={axisX - axisRadius - 8} y={axisY + axisRadius + 24}>
            easy axis · {Math.round(axisTurn * 180)}° from field
          </text>
          <rect className="d-fill--mute" x={axisX - axisRadius} y={axisY + axisRadius + 32} width={axisRadius * 2} height={7} />
          <rect className={`d-bar ${hardAxisEnergy > 0.72 ? "d-fill--warn" : "d-fill--accent"}`} x={axisX - axisRadius} y={axisY + axisRadius + 32} width={axisRadius * 2 * hardAxisEnergy} height={7} />
          <text className="d-label d-label--faint" x={axisX - axisRadius} y={axisY + axisRadius + 58}>
            energy cost of turning the easy axis away from the field
          </text>
        </g>
      )}

      {/* Each state points at the part of the curve it is actually about. */}
      {(state === "remanence" || state === "division-of-labour") && (
        <Leader from={[x0, y0 + h - br * h]} to={[x0 + w + 16, y0 + 20]} accent>
          remanence — what is left with no help
        </Leader>
      )}
      {(state === "coercivity" || state === "division-of-labour") && (
        <Leader from={[x0 + hc * w * 0.9, y0 + h]} to={[x0 + w + 16, y0 + h - 16]} accent>
          coercivity — what it takes to undo it
        </Leader>
      )}

      {reverse > 0.01 && (
        <g>
          <path className="d-rule d-rule--dash" d={`M ${reverseX} ${y0} L ${reverseX} ${y0 + h}`} />
          <text className={`d-label ${past ? "d-label--warn" : ""}`} x={reverseX + 6} y={y0 + 14}>
            {past
              ? "past the knee — this loss stays after cooling"
              : state === "coercivity"
                ? "pushing back against the magnet"
                : "stator pushing back"}
          </text>
        </g>
      )}

      {(state === "hot-margin" || state === "dysprosium-tradeoff") && !past && (
        <g>
          <path
            className="d-rule d-rule--dash"
            d={`M ${Math.min(x0 + w, x0 + flipThreshold * w)} ${y0 + h - 12} L ${Math.min(x0 + w, x0 + reverse * w)} ${y0 + h - 12}`}
          />
          <text className="d-label d-label--accent" x={x0 + 8} y={y0 + h - 20}>
            remaining margin before reversal: {Math.round((margin / flipThreshold) * 100)}%
          </text>
        </g>
      )}

      <text className="d-label d-label--faint" x={x0} y={y0 + h + 46}>
        {state === "anisotropy"
          ? "The green needle is the crystal's preferred magnetisation direction. Moving it away from the reverse field raises the energy needed to reverse the magnet."
          : state === "division-of-labour"
            ? "Iron supplies the height of the curve. Neodymium supplies its reach to the right. Neither element does both."
            : heat > 0.02
              ? `Rotor at ${Math.round(20 + heat * 160)} °C. Coercivity falls roughly 0.5% per degree; a traction rotor runs 150–180 °C.`
              : "A usable permanent magnet needs both: height on this axis, and reach along that one."}
      </text>
    </svg>
  );
}

function MagnetComposition({ controls, state }: { controls: StageControls; state: string }) {
  const gbd = state === "diffusion-evolution";

  if (state === "reversal-start") {
    const progress = Math.max(0, Math.min(1, controls.nucleation));
    const inward = progress ** 0.85;
    const reversalRadius = 12 + inward * 112;
    const centreX = 410 + 170 * (1 - inward);
    const phase =
      progress < 0.06
        ? "healthy grain under stress"
        : progress < 0.72
          ? "reversed region sweeping inward"
          : "cooled magnet with permanent loss";

    return (
      <svg viewBox="0 0 820 520" role="img" aria-label="Surface-nucleated demagnetisation progressing through one NdFeB grain">
        <text className="d-axis-label" x={0} y={16}>One grain under combined thermal and reverse-field stress</text>
        <text className="d-value d-value--big" x={0} y={58}>{phase}</text>

        <g>
          <circle className="d-fill--warn-soft" cx={410} cy={270} r={170} />
          <circle className="d-fill--mute" cx={410} cy={270} r={170} opacity={0.55} />
          {Array.from({ length: 64 }, (_, i) => {
            const a = (i / 64) * Math.PI * 2;
            const ring = i % 4;
            const radius = 24 + ring * 42;
            return (
              <circle
                key={i}
                className="d-fill--warn"
                cx={410 + Math.cos(a) * radius}
                cy={270 + Math.sin(a) * radius}
                r={3.2}
              />
            );
          })}

          {progress > 0.04 && (
            <>
              <circle
                className="d-fill--warn"
                cx={centreX}
                cy={270}
                r={reversalRadius}
                opacity={progress > 0.72 ? 0.72 : 0.88}
              />
              <path
                className="d-rule"
                d={`M ${centreX} ${270 - reversalRadius} L ${centreX} 112`}
              />
              <text
                className={`d-label ${progress > 0.72 ? "d-label--warn" : ""}`}
                x={centreX + 8}
                y={106}
              >
                {progress > 0.72 ? "loss remains after cooling" : "reversed region"}
              </text>
            </>
          )}
          <circle className="d-fill--accent" cx={580} cy={270} r={4} />
          <path className="d-rule d-rule--dash" d="M 580 270 L 668 352 L 724 352" />
          <text className="d-label d-label--strong" x={730} y={356}>surface</text>
        </g>

        <g transform="translate(0, 480)">
          <rect className="d-fill--warn-soft" width={820} height={30} />
          <rect className="d-fill--warn" width={3} height={30} />
          <text className="d-label d-label--warn" x={18} y={20}>
            Reversal begins where the crystal boundary meets the highest local field. It does not require the whole grain to flip at once.
          </text>
        </g>
      </svg>
    );
  }

  const shellDepth = 18 + controls.diffusion * 38;
  return (
    <svg viewBox="0 0 820 520" role="img" aria-label="NdFeB magnet composition by mass and where dysprosium sits in the grain">
      <text className="d-axis-label" x={0} y={16}>By mass, an illustrative traction-grade NdFeB magnet</text>
      <SegmentBar
        x={0}
        y={34}
        w={W}
        h={34}
        segments={[
          { id: "fe", value: 69, label: "≈69% iron — carries the strength" },
          { id: "ndpr", value: 30, label: "≈30% Nd/Pr — holds the direction", tone: "accent" },
          { id: "dy", value: 3, label: "1–4% Dy", tone: "warn" },
        ]}
      />
      <text className="d-label d-label--faint" x={0} y={104}>
        Composition varies by grade and duty. Dysprosium is the smallest share and the only one under the April 2025 licence.
      </text>

      {/* One grain, in section: where the dysprosium actually sits. */}
      <g transform="translate(90, 150)">
        <text className="d-axis-label" x={0} y={-12}>Uniform doping</text>
        <circle className="d-fill--warn-soft" cx={110} cy={110} r={104} />
        <circle className="d-fill--mute" cx={110} cy={110} r={104} opacity={0.5} />
        {Array.from({ length: 26 }, (_, i) => {
          const a = (i / 26) * Math.PI * 2;
          const r = 26 + (i % 4) * 24;
          return <circle key={i} className="d-fill--warn" cx={110 + Math.cos(a) * r} cy={110 + Math.sin(a) * r} r={3.4} />;
        })}
        <text className="d-label" x={0} y={242}>Dysprosium everywhere, including the</text>
        <text className="d-label d-label--faint" x={0} y={260}>core where it is not needed.</text>
      </g>

      <g transform="translate(450, 150)">
        <text className={`d-axis-label ${gbd ? "d-label--accent" : ""}`} x={0} y={-12}>
          Grain-boundary diffusion
        </text>
        <circle className="d-fill--mute" cx={110} cy={110} r={104} />
        <circle className="d-fill--warn-soft" cx={110} cy={110} r={104} />
        <circle className="d-fill--mute" cx={110} cy={110} r={104 - shellDepth} />
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 2;
          return <circle key={i} className="d-fill--warn" cx={110 + Math.cos(a) * 95} cy={110 + Math.sin(a) * 95} r={3.4} />;
        })}
        <text className="d-label d-label--strong" x={70} y={114}>NdFeB core</text>
        <text className="d-label" x={0} y={242}>
          Dysprosium only in the outer shell, where reversal starts.
        </text>
        <text className="d-label d-label--faint" x={0} y={260}>
          Same protection, far less of it.
        </text>
      </g>

      <g transform="translate(0, 470)">
        <rect className="d-fill--mute" width={340} height={36} />
        <text className="d-label d-label--strong" x={12} y={23}>
          Shell depth: {Math.round(controls.diffusion * 100)}% · Dy inventory lower than uniform doping
        </text>
      </g>
    </svg>
  );
}

function LightHeavySplit() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Light and heavy rare earths in the magnet, and which the export notice names">
      <text className="d-axis-label" x={0} y={16}>The rare earths in one traction magnet</text>

      <g transform="translate(0, 46)">
        <rect className="d-fill--accent" x={0} y={0} width={520} height={54} />
        <text className="d-label--strong d-label" x={16} y={24} style={{ fill: "#0b0d0c" }}>
          Neodymium · Praseodymium
        </text>
        <text className="d-label" x={16} y={42} style={{ fill: "#1c2415" }}>
          Light rare earths · ≈30% of magnet mass · more widely mined
        </text>
      </g>

      <g transform="translate(540, 46)">
        <rect className="d-fill--warn" x={0} y={0} width={130} height={54} />
        <text className="d-label d-label--strong" x={12} y={24} style={{ fill: "#140a06" }}>
          Dy · Tb
        </text>
        <text className="d-label" x={12} y={42} style={{ fill: "#2a1409" }}>
          Heavy · 1–4%
        </text>
      </g>

      <path className="d-rule" d="M 605 100 L 605 150" />
      <path className="d-rule" d="M 260 100 L 260 150" />

      <g transform="translate(0, 160)">
        <rect className="d-fill--warn-soft" x={520} y={0} width={150} height={78} />
        <text className="d-label d-label--warn" x={534} y={24}>Named in the</text>
        <text className="d-label d-label--warn" x={534} y={42}>April 2025 notice</text>
        <text className="d-label d-label--faint" x={534} y={64}>licence required</text>

        <rect className="d-fill--mute" x={140} y={0} width={240} height={78} />
        <text className="d-label d-label--strong" x={156} y={24}>Not named in it</text>
        <text className="d-label" x={156} y={46}>Supply is broader and</text>
        <text className="d-label" x={156} y={64}>less concentrated than Dy/Tb.</text>
      </g>

      <text className="d-label d-label--strong" x={0} y={300}>
        The controlled element is the 1–4% one.
      </text>
      <text className="d-label" x={0} y={324}>
        Grain-boundary diffusion already existed to use less of it, and cutting it costs temperature range, not the motor.
      </text>
      <text className="d-label d-label--faint" x={0} y={352}>
        Removing Dy/Tb keeps the inverter, the calibration, the control software and the safety case. Nothing else in the car changes.
      </text>
    </svg>
  );
}

function MitigationLadder({ controls }: { controls: StageControls }) {
  const rung = Math.min(4, Math.round(controls.load * 4));
  const active = getMitigationFootprintInfo(rung as 0 | 1 | 2 | 3 | 4);
  const detail = [
    "Direct rotor-oil cooling lowers magnet temperature. It does not remove dysprosium by itself.",
    "Dysprosium migrates to grain boundaries, where reversal begins. The core remains NdFeB.",
    "The magnet keeps the NdFeB architecture while deleting the controlled heavy rare earths.",
    "A weaker or cheaper magnet may require more mass, higher speed or a different geometry.",
    "The rotor mechanism changes, and so do excitation, inverter control, cooling and validation.",
  ][rung];

  return (
    <svg viewBox="0 0 820 560" role="img" aria-label="Mitigation ladder from rotor cooling to a new motor architecture">
      <text className="d-axis-label" x={0} y={16}>Smallest credible change first</text>
      {MITIGATION_RUNGS.map((item, i) => {
        const y = 40 + i * 58;
        const isActive = i === rung;
        return (
          <g key={item.id}>
            <rect className={`d-node ${isActive ? "is-on" : "is-off"}`} x={0} y={y} width={610} height={46} />
            <text className={`d-label ${isActive ? "d-label--accent" : ""}`} x={16} y={y + 21}>
              {i + 1}. {item.label}
            </text>
            <text className={`d-label ${isActive ? "d-label--strong" : "d-label--faint"}`} x={630} y={y + 28}>
              {["cooling", "material", "material", "motor", "platform"][i]}
            </text>
          </g>
        );
      })}

      <g transform="translate(0, 345)">
        <rect className="d-fill--warn-soft" width={820} height={195} />
        <rect className="d-fill--warn" width={3} height={195} />
        <text className="d-label d-label--warn" x={18} y={26}>{rung + 1}. {active.label}</text>
        <text className="d-label d-label--strong" x={18} y={56}>What it changes</text>
        {active.affectedModules.map((module, index) => (
          <text key={module} className="d-label d-label--warn" x={18} y={82 + index * 22}>· {module}</text>
        ))}
        <text className="d-label d-label--strong" x={430} y={56}>What carries over</text>
        {active.retainedModules.map((module, index) => (
          <text key={module} className="d-label" x={430} y={82 + index * 22}>· {module}</text>
        ))}
        <text className="d-label d-label--faint" x={18} y={180}>{detail}</text>
      </g>
    </svg>
  );
}

/* ── Act III: the weakness, the family, the properties ──────────────────── */

function BackEmfCeiling({ controls, state }: { controls: StageControls; state: string }) {
  const x0 = 60;
  const y0 = 30;
  const w = 600;
  const h = 290;
  const speed = controls.load * 100;
  const { normalized, nearingCeiling } = calculateBackEmfHeight(speed);
  const weakening = state === "field-weakening" || state === "fault";
  const rawCurrent = calculateFieldWeakeningVectors(controls.weakening * 100);
  const current =
    state === "fault"
      ? { ...rawCurrent, counterFlux: 0, netFlux: rawCurrent.magnetFlux }
      : rawCurrent;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Induced voltage rising toward the DC bus ceiling with speed">
      <Axes x={x0} y={y0} w={w} h={h} xLabel="rotor speed →" yLabel="voltage" />
      <path className="d-rule d-rule--dash" d={`M ${x0} ${y0 + 26} L ${x0 + w} ${y0 + 26}`} />
      <text className="d-label d-label--faint" x={x0 + w + 8} y={y0 + 30}>DC bus</text>

      <path
        className={`d-curve ${nearingCeiling ? "d-curve--warn" : "d-curve--accent"}`}
        d={`M ${x0} ${y0 + h} L ${x0 + w * (speed / 100)} ${y0 + h - normalized * (h - 26)}`}
      />
      <circle
        className={nearingCeiling ? "d-fill--warn" : "d-fill--accent"}
        cx={x0 + w * (speed / 100)}
        cy={y0 + h - normalized * (h - 26)}
        r={4}
      />
      <text className={`d-label ${nearingCeiling ? "d-label--warn" : ""}`} x={x0 + 8} y={y0 + h - normalized * (h - 26) - 12}>
        induced voltage from the magnet
      </text>

      {nearingCeiling && !weakening && (
        <text className="d-label d-label--warn" x={x0} y={y0 + h + 46}>
          At the ceiling no more current can be pushed in. The motor cannot go faster on torque alone.
        </text>
      )}

      {weakening && (
        <g transform={`translate(${x0}, ${y0 + h + 40})`}>
          <text className="d-axis-label" x={0} y={0}>Stator current, at this speed</text>
          <rect className="d-fill--accent" x={0} y={12} width={Math.max(1, current.magnetFlux)} height={20} />
          <rect className="d-fill--warn" x={Math.max(1, current.magnetFlux) + 8} y={12} width={Math.max(1, current.counterFlux)} height={20} />
          <path className="d-rule" d={`M ${current.netFlux} 6 L ${current.netFlux} 38`} />
          <text className="d-label d-label--faint" x={current.netFlux + 5} y={4}>net flux</text>
          <text className="d-label d-label--accent" x={0} y={50}>makes torque</text>
          <text className="d-label d-label--warn" x={222} y={50}>
            cancels the magnet's own flux — makes no torque, and is spent only because the magnets are there
          </text>
          {state === "fault" && (
            <>
              <rect className="d-fill--warn-soft" x={0} y={62} width={520} height={34} />
              <text className="d-label d-label--warn" x={12} y={84}>
                Inverter gated off: counter-current stops, but the magnet's induced voltage remains.
              </text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}

function FamilyTree({ onPick, rotor }: { onPick?: (id: string) => void; rotor?: string }) {
  const familyId = rotorToAlternativeFamily[(rotor ?? "ipm-ndfeb") as keyof typeof rotorToAlternativeFamily];
  const active = architectureLabs.find((item) => item.id === familyId) ?? architectureLabs[0];

  return (
    <div className="alt-lab" aria-label="Interactive comparison of traction-motor alternatives">
      <div className="alt-lab__tabs" role="group" aria-label="Choose a motor family">
        {architectureLabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lab-tab ${item.id === active.id ? "is-on" : ""}`}
            aria-pressed={item.id === active.id}
            onClick={() => onPick?.(item.id)}
          >
            {item.shortLabel}
          </button>
        ))}
      </div>

      <div className="alt-compare" aria-label="Relative teaching-scale comparison across motor families">
        <div className="alt-compare__row alt-compare__row--head">
          <span>Metric</span>
          {architectureLabs.map((item) => (
            <span key={item.id} className={item.id === active.id ? "is-active" : ""}>{item.shortLabel}</span>
          ))}
        </div>

        {architectureLabs[0].comparison.map((metric, metricIndex) => (
          <div key={metric.label} className="alt-compare__row">
            <span>{metric.label}</span>
            {architectureLabs.map((item) => {
              const cell = item.comparison[metricIndex];
              return (
                <div
                  key={`${item.id}-${metric.label}`}
                  className={`alt-compare__cell ${item.id === active.id ? "is-active" : ""}`}
                  title={cell.note}
                >
                  {Array.from({ length: 4 }, (_, dot) => (
                    <i key={dot} className={dot < cell.value ? "is-on" : ""} />
                  ))}
                  <small>{cell.value}</small>
                </div>
              );
            })}
          </div>
        ))}
        <p>0–4 is a teaching scale for comparing mechanisms. It is not a measured score.</p>
      </div>

      <div className="alt-lab__head">
        <div>
          <p className="eyebrow">Defining parameter</p>
          <h3>{active.label}</h3>
          <p>{active.principle}</p>
        </div>
        <div className="alt-lab__metric">
          <span>{active.definingMetric.label}</span>
          <strong>{active.definingMetric.value}</strong>
          <small>{active.definingMetric.meaning}</small>
        </div>
      </div>

      <div className="alt-lab__grid">
        <section className="alt-lab__panel">
          <h4>What changes</h4>
          <dl>
            <div>
              <dt>Rotor field</dt>
              <dd>{active.rotorField}</dd>
            </div>
            <div>
              <dt>Rare earths</dt>
              <dd>{active.rareEarth}</dd>
            </div>
            <div>
              <dt>Cost drivers</dt>
              <dd>{active.costDrivers.join(" · ")}</dd>
            </div>
          </dl>
        </section>

        <section className="alt-lab__panel">
          <h4>Track these</h4>
          <ul>
            {active.trackThese.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {active.regions.map((region) => (
          <section key={region.region} className="alt-lab__panel">
            <h4>{region.region}</h4>
            <ul className="company-list">
              {region.records.map((record) => (
                <li key={`${region.region}-${record.name}`}>
                  <strong>{record.name}</strong>
                  <span>{record.scope}</span>
                  <em>{record.maturity}</em>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="conductor-reference" aria-label="Conductor reference for winding cost and resistance">
        <h4>Conductor reference</h4>
        <div className="conductor-reference__grid">
          <div>
            <strong>Copper</strong>
            <span>Relative resistance 1.0× · compact windings · higher raw-material exposure</span>
          </div>
          <div>
            <strong>Aluminium</strong>
            <span>≈1.6× resistance · lower raw-material cost and density · larger conductor for the same resistance</span>
          </div>
        </div>
        <p>
          Resistance is a physical design constraint. Cost is a market and system question: aluminium can lower
          conductor spend while adding loss, volume or inverter duty.
        </p>
      </section>

      <p className="alt-lab__note">{active.caveat}</p>
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
    <div className="material-lab" aria-label="Interactive comparison of permanent-magnet materials">
      <div className="lab-tab-row" role="group" aria-label="Choose a magnet chemistry">
        {materialLabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`lab-tab ${item.id === active.id ? "is-on" : ""}`}
            aria-pressed={item.id === active.id}
            onClick={() => setSelected(item.id)}
          >
            {item.shortLabel}
          </button>
        ))}
      </div>

      <div className="alt-compare" aria-label="Relative teaching-scale comparison across magnet chemistries">
        <div className="material-compare__row material-compare__row--head">
          <span>Metric</span>
          {materialLabs.map((item) => (
            <span key={item.id} className={item.id === active.id ? "is-active" : ""}>{item.shortLabel}</span>
          ))}
        </div>

        {materialLabs[0].comparison.map((metric, metricIndex) => (
          <div key={metric.label} className="material-compare__row">
            <span>{metric.label}</span>
            {materialLabs.map((item) => {
              const cell = item.comparison[metricIndex];
              return (
                <div
                  key={`${item.id}-${metric.label}`}
                  className={`material-compare__cell ${item.id === active.id ? "is-active" : ""}`}
                  title={cell.note}
                >
                  {Array.from({ length: 4 }, (_, dot) => (
                    <i key={dot} className={dot < cell.value ? "is-on" : ""} />
                  ))}
                  <small>{cell.value}</small>
                </div>
              );
            })}
          </div>
        ))}
        <p>0–4 compares teaching mechanisms. It is not a measured universal score.</p>
      </div>

      <div className="alt-lab__head">
        <div>
          <p className="eyebrow">Defining gate</p>
          <h3>{active.label}</h3>
          <p>{active.role}</p>
        </div>
        <div className="alt-lab__metric">
          <span>{active.definingMetric.label}</span>
          <strong>{active.definingMetric.value}</strong>
          <small>{active.definingMetric.meaning}</small>
        </div>
      </div>

      <div className="alt-lab__grid">
        <section className="alt-lab__panel">
          <h4>Magnet properties</h4>
          <dl className="property-list">
            {active.properties.map((property) => (
              <div key={property.id}>
                <dt>{property.label}</dt>
                <dd>
                  <span className="meter" aria-hidden="true">
                    <i style={{ width: `${Math.max(2, Math.min(100, property.value * 100))}%` }} />
                  </span>
                  {property.reading}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="alt-lab__panel">
          <h4>Supply and cost</h4>
          <dl>
            <div>
              <dt>Rare earths</dt>
              <dd>{active.rareEarth}</dd>
            </div>
            <div>
              <dt>Cost baseline</dt>
              <dd>{active.costStatus}</dd>
            </div>
            <div>
              <dt>Cost drivers</dt>
              <dd>{active.costDrivers.join(" · ")}</dd>
            </div>
          </dl>
        </section>

        <section className="alt-lab__panel">
          <h4>Track these</h4>
          <ul>
            {active.trackThese.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {active.regions.map((region) => (
          <section key={region.region} className="alt-lab__panel">
            <h4>{region.region}</h4>
            <ul className="company-list">
              {region.records.map((record) => (
                <li key={`${region.region}-${record.name}`}>
                  <strong>{record.name}</strong>
                  <span>{record.scope}</span>
                  <em>{record.maturity}</em>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="alt-lab__note">{active.caveat}</p>
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

/* ── Router ─────────────────────────────────────────────────────────────── */

export function Diagram({
  id,
  stateId,
  controls,
  architecture,
  onPickArchitecture,
  rotor,
  onPickFamily,
}: {
  id: DiagramId;
  stateId: string;
  controls: StageControls;
  architecture: ArchitectureId;
  onPickArchitecture?: (id: ArchitectureId) => void;
  rotor?: string;
  onPickFamily?: (id: string) => void;
}) {
  return (
    <div className="diagram">
      {id === "why-it-matters" && <WhyItMatters state={stateId} />}
      {id === "supply-concentration" && <SupplyConcentration state={stateId} />}
      {id === "demag-curve" && <DemagCurve controls={controls} state={stateId} />}
      {id === "magnet-composition" && <MagnetComposition controls={controls} state={stateId} />}
      {id === "light-heavy-split" && <LightHeavySplit />}
      {id === "mitigation-ladder" && <MitigationLadder controls={controls} />}
      {id === "back-emf-ceiling" && <BackEmfCeiling controls={controls} state={stateId} />}
      {id === "family-tree" && <FamilyTree rotor={rotor} onPick={onPickFamily} />}
      {id === "property-board" && <MaterialLab state={stateId} />}
      {id === "swap-burden" && <SwapBurden architecture={architecture} onPick={onPickArchitecture} />}
    </div>
  );
}
