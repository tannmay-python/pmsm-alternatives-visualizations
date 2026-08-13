import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  applyHeatTest,
  chapter3Labs,
  closeLab,
  compareCoercivity,
  dyTbTradeoff,
  freshHeatTest,
  isLabCloseKey,
  isLabRouteNavigationKey,
  labelSpecsByView,
  openLab,
  type Chapter3Lab,
  type Chapter3MainStep,
} from "./chapter3MagnetModel";
import "./chapter3MagnetVisual.css";

type Chapter3MagnetVisualProps = {
  step: Chapter3MainStep;
  paused?: boolean;
  reducedMotion?: boolean;
  /** Test-only entry point for the reader-requested optional labs. */
  initialLab?: Chapter3Lab | null;
};

type FieldTone = "field" | "magnet" | "heat" | "steel" | "protection";

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 620;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const qualitativeField = (value: number) =>
  value < 34 ? "none" : value < 67 ? "gentle" : "hard";

const qualitativeHeat = (value: number) =>
  value < 34 ? "cool" : value < 67 ? "warm" : "hot";

const svgId = (value: string) => `chapter3-${value.replace(/[^a-zA-Z0-9_-]/g, "")}`;

const isChapter3Lab = (value: string | null): value is Chapter3Lab =>
  chapter3Labs.includes(value as Chapter3Lab);

function FieldLobes({
  centerX,
  centerY,
  width,
  height,
  scale = 1,
  tone,
  className = "",
  markerId,
  shortenedRight = false,
}: {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  scale?: number;
  tone: FieldTone;
  className?: string;
  markerId: string;
  shortenedRight?: boolean;
}) {
  const top = centerY - height / 2 + 10;
  const bottom = centerY + height / 2 - 10;
  const rightScale = shortenedRight ? scale * 0.58 : scale;

  return (
    <g className={`chapter3-field chapter3-field--${tone} ${className}`}>
      {[0, 1, 2].map((index) => {
        const offset = (118 + index * 64) * scale;
        const rightOffset = (118 + index * 64) * rightScale;
        return (
          <g key={index}>
            <path
              d={`M ${centerX - width / 2 + 8} ${top} C ${centerX - offset} ${top - 54} ${centerX - offset} ${bottom + 54} ${centerX - width / 2 + 8} ${bottom}`}
              markerEnd={`url(#${markerId})`}
            />
            <path
              d={`M ${centerX + width / 2 - 8} ${bottom} C ${centerX + rightOffset} ${bottom + 54} ${centerX + rightOffset} ${top - 54} ${centerX + width / 2 - 8} ${top}`}
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      })}
    </g>
  );
}

function MagnetBody({
  centerX,
  centerY,
  width = 220,
  height = 290,
  patch = false,
  protection = 0,
  reversed = false,
  markerId,
  className = "",
}: {
  centerX: number;
  centerY: number;
  width?: number;
  height?: number;
  patch?: boolean;
  protection?: number;
  reversed?: boolean;
  markerId: string;
  className?: string;
}) {
  const startX = centerX - width / 2;
  const startY = centerY - height / 2;
  const grainColumns = 3;
  const grainRows = 4;

  return (
    <g className={`chapter3-magnet-body ${className}`}>
      <rect
        className="chapter3-magnet-body__shell"
        x={startX}
        y={startY}
        width={width}
        height={height}
        rx="16"
      />
      {Array.from({ length: grainRows * grainColumns }, (_, index) => {
        const row = Math.floor(index / grainColumns);
        const column = index % grainColumns;
        const grainX = startX + 22 + column * ((width - 44) / (grainColumns - 1));
        const grainY = startY + 42 + row * ((height - 84) / (grainRows - 1));
        const flipped = reversed || (patch && row >= grainRows - 2 && column === grainColumns - 1);
        const lineDirection = flipped ? 20 : -20;

        return (
          <g key={index} className={flipped ? "is-reversed" : ""}>
            <path
              className="chapter3-magnet-body__grain"
              d={`M ${grainX} ${grainY - 24} l 23 17 l -8 29 l -28 9 l -19 -22 l 10 -29 Z`}
            />
            <line
              className="chapter3-magnet-body__domain"
              x1={grainX}
              y1={grainY + lineDirection}
              x2={grainX}
              y2={grainY - lineDirection}
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      })}
      {patch ? (
        <rect
          className="chapter3-magnet-body__patch"
          x={centerX + width * 0.12}
          y={centerY + height * 0.1}
          width={width * 0.36}
          height={height * 0.36}
          rx="12"
        />
      ) : null}
      {protection > 0
        ? Array.from({ length: protection * 6 }, (_, index) => {
            const angle = (index / (protection * 6)) * Math.PI * 2;
            const radiusX = width * 0.42;
            const radiusY = height * 0.4;
            const x = centerX + Math.cos(angle) * radiusX;
            const y = centerY + Math.sin(angle) * radiusY;
            return (
              <rect
                key={index}
                className="chapter3-magnet-body__protection"
                x={x - 4}
                y={y - 4}
                width="8"
                height="8"
                rx="1"
                transform={`rotate(45 ${x} ${y})`}
              />
            );
          })
        : null}
    </g>
  );
}

function MarginRing({
  centerX,
  centerY,
  width,
  height,
  scale,
}: {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  scale: number;
}) {
  const margin = 28 + scale * 62;
  return (
    <rect
      className="chapter3-margin-ring"
      x={centerX - width / 2 - margin}
      y={centerY - height / 2 - margin}
      width={width + margin * 2}
      height={height + margin * 2}
      rx={16 + margin / 2}
    />
  );
}

function IncomingField({
  markerId,
  yValues = [232, 284, 336, 388],
  reach = 676,
}: {
  markerId: string;
  yValues?: readonly number[];
  reach?: number;
}) {
  return (
    <g className="chapter3-incoming-field">
      {yValues.map((y) => (
        <path key={y} d={`M 940 ${y} H ${reach}`} markerEnd={`url(#${markerId})`} />
      ))}
    </g>
  );
}

function SceneCallout({
  text,
  position,
  tone = "steel",
}: {
  text: string;
  position: string;
  tone?: FieldTone;
}) {
  return (
    <span className={`chapter3-callout chapter3-callout--${position} chapter3-callout--${tone}`} data-anchor={position}>
      <i aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

function RemanenceScene({
  helperField,
  comparison,
  markerId,
  reducedMotion,
}: {
  helperField: boolean;
  comparison: "weaker" | "stronger";
  markerId: string;
  reducedMotion: boolean;
}) {
  const helperOn = reducedMotion ? false : helperField;
  const retainedScale = comparison === "stronger" || reducedMotion ? 1 : 0.72;
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="A simple magnet keeps a retained field after its helper field is removed."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <FieldLobes
          centerX={500}
          centerY={310}
          width={220}
          height={290}
          scale={1.27}
          tone="field"
          markerId={markerId}
          className={helperOn ? "is-helper-on" : "is-helper-off"}
        />
        <FieldLobes
          centerX={500}
          centerY={310}
          width={220}
          height={290}
          scale={retainedScale}
          tone="magnet"
          markerId={markerId}
          className="is-retained"
        />
        <MagnetBody centerX={500} centerY={310} markerId={markerId} />
      </svg>
      {helperOn ? <SceneCallout text="Helper field" position="remanence-helper" tone="field" /> : null}
      <SceneCallout text="Field remains" position="remanence-retained" tone="magnet" />
      <div className="chapter3-retained-comparison" aria-hidden="true">
        <div className="chapter3-retained-comparison__sample is-weaker">
          <i />
          <b />
          <i />
        </div>
        <div className={`chapter3-retained-comparison__sample is-stronger ${comparison === "stronger" ? "is-selected" : ""}`}>
          <i />
          <b />
          <i />
        </div>
      </div>
    </>
  );
}

function ComparisonMagnet({
  centerX,
  reversed,
  markerId,
  kind,
}: {
  centerX: number;
  reversed: boolean;
  markerId: string;
  kind: "lower" | "higher";
}) {
  return (
    <g data-magnet={`${kind}-coercivity`} className={`chapter3-comparison-magnet ${reversed ? "is-reversed" : ""}`}>
      <MarginRing centerX={centerX} centerY={310} width={146} height={204} scale={kind === "lower" ? 0.34 : 0.76} />
      <MagnetBody
        centerX={centerX}
        centerY={310}
        width={146}
        height={204}
        markerId={markerId}
        reversed={reversed}
      />
    </g>
  );
}

function CoercivityScene({
  opposingField,
  markerId,
  reducedMotion,
}: {
  opposingField: number;
  markerId: string;
  reducedMotion: boolean;
}) {
  const comparison = compareCoercivity(reducedMotion ? 62 : opposingField);
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Two illustrative magnets respond to the same opposing field. The lower-coercivity example reverses first."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <IncomingField markerId={markerId} yValues={[242, 288, 332, 378]} reach={642} />
        <ComparisonMagnet
          centerX={320}
          reversed={comparison.lowerCoercivityReversed}
          markerId={markerId}
          kind="lower"
        />
        <ComparisonMagnet
          centerX={574}
          reversed={comparison.higherCoercivityReversed}
          markerId={markerId}
          kind="higher"
        />
      </svg>
      <SceneCallout text="Turns first" position="coercivity-lower" tone="heat" />
      <SceneCallout text="Holds" position="coercivity-higher" tone="magnet" />
    </>
  );
}

function HeatScene({
  heat,
  opposingField,
  demagLatched,
  markerId,
  reducedMotion,
}: {
  heat: number;
  opposingField: number;
  demagLatched: boolean;
  markerId: string;
  reducedMotion: boolean;
}) {
  const displayHeat = reducedMotion ? 0 : heat;
  const displayDamage = reducedMotion || demagLatched;
  const fieldScale = displayDamage ? 0.7 : 0.94;
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={displayDamage ? "A cooled magnet keeps a reversed patch and a weaker retained field." : "Relative heat and an opposing field test one magnet."}
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <g className={`chapter3-heat-aura ${displayHeat > 0 ? "is-visible" : ""}`} style={{ opacity: Math.max(0, displayHeat / 100) }}>
          {[42, 72, 102].map((margin) => (
            <rect
              key={margin}
              x={500 - 110 - margin}
              y={310 - 145 - margin}
              width={220 + margin * 2}
              height={290 + margin * 2}
              rx={16 + margin / 2}
            />
          ))}
        </g>
        <FieldLobes
          centerX={500}
          centerY={310}
          width={220}
          height={290}
          scale={fieldScale}
          shortenedRight={displayDamage}
          tone="magnet"
          markerId={markerId}
        />
        <IncomingField markerId={markerId} reach={670 - clamp(opposingField) * 0.32} />
        <MarginRing centerX={500} centerY={310} width={220} height={290} scale={displayDamage ? 0.26 : 0.48} />
        <MagnetBody centerX={500} centerY={310} markerId={markerId} patch={displayDamage} />
      </svg>
      <SceneCallout text="Heat" position="heat-top" tone="heat" />
      {displayDamage ? <SceneCallout text="Patch remains" position="heat-patch" tone="heat" /> : null}
    </>
  );
}

function TradeoffScene({
  level,
  markerId,
  reducedMotion,
}: {
  level: number;
  markerId: string;
  reducedMotion: boolean;
}) {
  const tradeoff = dyTbTradeoff(reducedMotion ? 2 : level);
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="A fresh comparison magnet shows a wider reversal margin and a shorter retained field as Dy and Tb protection increases."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <FieldLobes
          centerX={500}
          centerY={310}
          width={220}
          height={290}
          scale={tradeoff.retainedLength}
          tone="magnet"
          markerId={markerId}
        />
        <MarginRing centerX={500} centerY={310} width={220} height={290} scale={tradeoff.marginLength} />
        <MagnetBody centerX={500} centerY={310} markerId={markerId} protection={tradeoff.level + 1} />
      </svg>
      <SceneCallout text="More margin" position="tradeoff-margin" tone="protection" />
      <SceneCallout text="Less field" position="tradeoff-field" tone="magnet" />
    </>
  );
}

function GrainCell({
  centerX,
  edgeProtected,
  selected,
  testComplete,
  markerId,
}: {
  centerX: number;
  edgeProtected: boolean;
  selected: boolean;
  testComplete: boolean;
  markerId: string;
}) {
  const seedEnd = edgeProtected ? centerX + 58 : centerX + 112;
  return (
    <g className={`chapter3-grain-cell ${edgeProtected ? "is-edge-protected" : "is-uniform"} ${selected ? "is-selected" : "is-quiet"}`}>
      <path className="chapter3-grain-cell__body" d={`M ${centerX - 126} 202 l 106 -54 l 118 42 l 16 118 l -94 92 l -132 -30 l -48 -102 Z`} />
      {edgeProtected ? (
        <path className="chapter3-grain-cell__shell" d={`M ${centerX - 116} 209 l 96 -49 l 107 38 l 14 104 l -86 84 l -121 -27 l -43 -91 Z`} />
      ) : (
        <path className="chapter3-grain-cell__uniform" d={`M ${centerX - 116} 209 l 96 -49 l 107 38 l 14 104 l -86 84 l -121 -27 l -43 -91 Z`} />
      )}
      {[0, 1, 2, 3].map((index) => {
        const x = centerX - 58 + (index % 2) * 92;
        const y = 244 + Math.floor(index / 2) * 84;
        return <line key={index} className="chapter3-grain-cell__domain" x1={x} y1={y + 20} x2={x} y2={y - 20} markerEnd={`url(#${markerId})`} />;
      })}
      {testComplete ? (
        <g className="chapter3-grain-cell__seed-test">
          <path d={`M ${centerX - 176} 390 C ${centerX - 116} 372 ${centerX - 34} 365 ${seedEnd} 334`} />
          <circle cx={seedEnd} cy="334" r="10" />
        </g>
      ) : null}
    </g>
  );
}

function GrainBoundaryLab({
  mode,
  testComplete,
  markerId,
  reducedMotion,
}: {
  mode: "uniform" | "edge";
  testComplete: boolean;
  markerId: string;
  reducedMotion: boolean;
}) {
  const finalTest = reducedMotion || testComplete;
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="An illustrative comparison of uniform protection and grain-boundary protection near an edge where reversal can begin."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <GrainCell
          centerX={300}
          edgeProtected={false}
          selected={reducedMotion || mode === "uniform"}
          testComplete={finalTest && (reducedMotion || mode === "uniform")}
          markerId={markerId}
        />
        <GrainCell
          centerX={684}
          edgeProtected
          selected={reducedMotion || mode === "edge"}
          testComplete={finalTest && (reducedMotion || mode === "edge")}
          markerId={markerId}
        />
      </svg>
      <SceneCallout text="Uniform mix" position="grain-uniform" tone="steel" />
      <SceneCallout text="Edge shell" position="grain-edge" tone="protection" />
    </>
  );
}

function RotorComparison({
  centerX,
  cooled,
  markerId,
  showFlow,
}: {
  centerX: number;
  cooled: boolean;
  markerId: string;
  showFlow: boolean;
}) {
  return (
    <g className={`chapter3-rotor-comparison ${cooled ? "is-cooled" : "is-hot"}`}>
      <circle className="chapter3-rotor-comparison__ring" cx={centerX} cy="310" r="138" />
      {!cooled ? (
        <g className="chapter3-rotor-comparison__heat">
          {[166, 196, 226].map((radius) => <circle key={radius} cx={centerX} cy="310" r={radius} />)}
        </g>
      ) : null}
      <MagnetBody centerX={centerX} centerY={310} width={118} height={186} markerId={markerId} />
      {cooled && showFlow ? (
        <path className="chapter3-rotor-comparison__flow" d={`M ${centerX - 136} 190 C ${centerX - 66} 145 ${centerX - 28} 184 ${centerX} 144 C ${centerX + 42} 184 ${centerX + 72} 146 ${centerX + 142} 190`} markerEnd={`url(#${markerId})`} />
      ) : null}
    </g>
  );
}

function CoolingLab({
  showFlow,
  markerId,
  reducedMotion,
}: {
  showFlow: boolean;
  markerId: string;
  reducedMotion: boolean;
}) {
  return (
    <>
      <svg
        className="chapter3-magnet__svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="A hot rotor and a cooled rotor are shown side by side as a thermal-management comparison."
      >
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path className="chapter3-arrowhead" d="M 0 0 L 8 4 L 0 8 Z" />
          </marker>
        </defs>
        <RotorComparison centerX={310} cooled={false} markerId={markerId} showFlow={false} />
        <RotorComparison centerX={690} cooled markerId={markerId} showFlow={reducedMotion || showFlow} />
      </svg>
      <SceneCallout text="Hot rotor" position="cooling-hot" tone="heat" />
      <SceneCallout text="Cooled rotor" position="cooling-cooled" tone="field" />
    </>
  );
}

function MainControls({
  step,
  helperField,
  comparison,
  opposingField,
  heatState,
  protectionLevel,
  reducedMotion,
  onHelperChange,
  onComparisonChange,
  onOpposingChange,
  onHeatChange,
  onFreshMagnet,
  onProtectionChange,
  onOpenLab,
  launchRefs,
}: {
  step: Chapter3MainStep;
  helperField: boolean;
  comparison: "weaker" | "stronger";
  opposingField: number;
  heatState: ReturnType<typeof freshHeatTest>;
  protectionLevel: number;
  reducedMotion: boolean;
  onHelperChange: (value: boolean) => void;
  onComparisonChange: (value: "weaker" | "stronger") => void;
  onOpposingChange: (value: number) => void;
  onHeatChange: (heat: number, opposing: number) => void;
  onFreshMagnet: () => void;
  onProtectionChange: (value: number) => void;
  onOpenLab: (lab: Chapter3Lab) => void;
  launchRefs: MutableRefObject<Partial<Record<Chapter3Lab, HTMLButtonElement | null>>>;
}) {
  const coercivity = compareCoercivity(opposingField);
  const tradeoff = dyTbTradeoff(protectionLevel);

  if (step === "remanence-strength") {
    return (
      <>
        <button
          type="button"
          className="chapter3-control-button"
          aria-pressed={!helperField}
          disabled={reducedMotion}
          onClick={() => onHelperChange(!helperField)}
        >
          {helperField ? "Remove helper field" : "Restore helper field"}
        </button>
        <fieldset className="chapter3-choice" disabled={reducedMotion}>
          <legend>Retained field comparison</legend>
          <div className="chapter3-choice__buttons">
            <button type="button" aria-pressed={comparison === "weaker"} onClick={() => onComparisonChange("weaker")}>Weaker</button>
            <button type="button" aria-pressed={comparison === "stronger"} onClick={() => onComparisonChange("stronger")}>Stronger</button>
          </div>
        </fieldset>
        <p className="chapter3-magnet__status" role="status">A helper field can be removed while retained field remains.</p>
      </>
    );
  }

  if (step === "coercivity-lock") {
    return (
      <>
        <label className="chapter3-range-control">
          <span>Opposing field</span>
          <input
            type="range"
            min="0"
            max="100"
            value={reducedMotion ? 62 : opposingField}
            disabled={reducedMotion}
            aria-valuetext={`${qualitativeField(reducedMotion ? 62 : opposingField)} opposing field`}
            onChange={(event) => onOpposingChange(Number(event.target.value))}
          />
        </label>
        <p className="chapter3-magnet__status" role="status">
          {coercivity.lowerCoercivityReversed
            ? coercivity.higherCoercivityReversed
              ? "Both illustrative magnets have reversed under this strong comparison input."
              : "The lower-coercivity example flips first."
            : "Both illustrative magnets still hold direction."}
        </p>
      </>
    );
  }

  if (step === "heat-demagnetisation") {
    return (
      <>
        <label className="chapter3-range-control">
          <span>Relative heat</span>
          <input
            type="range"
            min="0"
            max="100"
            value={reducedMotion ? 0 : heatState.heat}
            disabled={reducedMotion}
            aria-valuetext={`${qualitativeHeat(reducedMotion ? 0 : heatState.heat)} relative heat`}
            onChange={(event) => onHeatChange(Number(event.target.value), heatState.opposingField)}
          />
        </label>
        <label className="chapter3-range-control">
          <span>Opposing field</span>
          <input
            type="range"
            min="0"
            max="100"
            value={reducedMotion ? 76 : heatState.opposingField}
            disabled={reducedMotion}
            aria-valuetext={`${qualitativeField(reducedMotion ? 76 : heatState.opposingField)} opposing field`}
            onChange={(event) => onHeatChange(heatState.heat, Number(event.target.value))}
          />
        </label>
        <button type="button" className="chapter3-control-button" disabled={reducedMotion} onClick={onFreshMagnet}>Fresh magnet</button>
        <p className="chapter3-magnet__status" role="status">
          {heatState.demagLatched ? "Patch remains after cooling until a fresh magnet is chosen." : "Use heat and opposing field together to test the reversal margin."}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="chapter3-fresh-sample">Fresh comparison sample</p>
      <label className="chapter3-range-control chapter3-range-control--tradeoff">
        <span>Dy/Tb protection</span>
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={reducedMotion ? 2 : protectionLevel}
          disabled={reducedMotion}
          aria-valuetext={`${["None", "Some", "More"][reducedMotion ? 2 : protectionLevel]} Dy/Tb protection`}
          onChange={(event) => onProtectionChange(Number(event.target.value))}
        />
      </label>
      <p className="chapter3-magnet__status" role="status">Reversal margin: {tradeoff.reversalMargin}. Retained strength: {tradeoff.retainedStrength}.</p>
      <button
        ref={(element) => { launchRefs.current["grain-boundary-diffusion"] = element; }}
        type="button"
        className="chapter3-control-button chapter3-control-button--quiet"
        onClick={() => onOpenLab("grain-boundary-diffusion")}
      >
        Explore grain edge
      </button>
      <button
        ref={(element) => { launchRefs.current["cooling-and-smco"] = element; }}
        type="button"
        className="chapter3-control-button chapter3-control-button--quiet"
        onClick={() => onOpenLab("cooling-and-smco")}
      >
        Compare cooling
      </button>
    </>
  );
}

function LabControls({
  lab,
  reducedMotion,
  grainMode,
  grainTest,
  showCoolingFlow,
  showSmCo,
  onGrainMode,
  onRunGrainTest,
  onToggleCoolingFlow,
  onToggleSmCo,
  onClose,
  closeRef,
}: {
  lab: Chapter3Lab;
  reducedMotion: boolean;
  grainMode: "uniform" | "edge";
  grainTest: boolean;
  showCoolingFlow: boolean;
  showSmCo: boolean;
  onGrainMode: (mode: "uniform" | "edge") => void;
  onRunGrainTest: () => void;
  onToggleCoolingFlow: () => void;
  onToggleSmCo: () => void;
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  if (lab === "grain-boundary-diffusion") {
    return (
      <>
        <fieldset className="chapter3-choice" disabled={reducedMotion}>
          <legend>Protection placement</legend>
          <div className="chapter3-choice__buttons">
            <button type="button" aria-pressed={grainMode === "uniform"} onClick={() => onGrainMode("uniform")}>Uniform</button>
            <button type="button" aria-pressed={grainMode === "edge"} onClick={() => onGrainMode("edge")}>Grain boundary</button>
          </div>
        </fieldset>
        <button type="button" className="chapter3-control-button" disabled={reducedMotion} onClick={onRunGrainTest}>
          {grainTest ? "Test shown" : "Run seed test"}
        </button>
        <p className="chapter3-magnet__status" role="status">
          {grainMode === "edge"
            ? "Edge shell is emphasized near a grain edge where reversal can begin."
            : "Uniform mix is emphasized across the illustrative grain."} The seed path is illustrative, not a guaranteed stop.
        </p>
        <button ref={closeRef} type="button" className="chapter3-control-button chapter3-control-button--quiet" onClick={onClose}>Back to magnet</button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className="chapter3-control-button"
        disabled={reducedMotion}
        aria-pressed={showCoolingFlow}
        onClick={onToggleCoolingFlow}
      >
        {showCoolingFlow ? "Hide rotor oil cooling" : "Show rotor oil cooling"}
      </button>
      <p className="chapter3-magnet__status" role="status">Cooling is thermal management. It does not prove Dy/Tb removal.</p>
      <button
        type="button"
        className="chapter3-control-button chapter3-control-button--quiet"
        disabled={reducedMotion}
        aria-pressed={showSmCo}
        onClick={onToggleSmCo}
      >
        {showSmCo ? "Hide SmCo" : "Compare SmCo"}
      </button>
      {showSmCo || reducedMotion ? (
        <article className="chapter3-smco-card" aria-label="SmCo position">
          <strong>SmCo position</strong>
          <span>A qualified, more expensive route for some higher-temperature applications.</span>
        </article>
      ) : null}
      <button ref={closeRef} type="button" className="chapter3-control-button chapter3-control-button--quiet" onClick={onClose}>Back to magnet</button>
    </>
  );
}

export function Chapter3MagnetVisual({
  step,
  paused = false,
  reducedMotion = false,
  initialLab = null,
}: Chapter3MagnetVisualProps) {
  const rawId = useId();
  const markerId = useMemo(() => svgId(`arrow-${rawId}`), [rawId]);
  const [helperField, setHelperField] = useState(true);
  const [comparison, setComparison] = useState<"weaker" | "stronger">("stronger");
  const [opposingField, setOpposingField] = useState(38);
  const [heatState, setHeatState] = useState(freshHeatTest);
  const [protectionLevel, setProtectionLevel] = useState(1);
  const [activeLab, setActiveLab] = useState<Chapter3Lab | null>(initialLab);
  const [grainMode, setGrainMode] = useState<"uniform" | "edge">("edge");
  const [grainTest, setGrainTest] = useState(false);
  const [showCoolingFlow, setShowCoolingFlow] = useState(false);
  const [showSmCo, setShowSmCo] = useState(false);
  const launchRefs = useRef<Partial<Record<Chapter3Lab, HTMLButtonElement | null>>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastLab = useRef<Chapter3Lab | null>(null);

  const closeOptionalLab = useCallback(() => {
    const restoreLab = lastLab.current;
    setActiveLab(closeLab().activeLab);
    if (restoreLab) {
      window.requestAnimationFrame(() => launchRefs.current[restoreLab]?.focus());
    }
  }, []);

  const openOptionalLab = useCallback((lab: Chapter3Lab) => {
    const session = openLab(lab, `chapter3-${lab}`);
    lastLab.current = lab;
    setActiveLab(session.activeLab);
  }, []);

  useEffect(() => {
    if (step !== "dy-tb-tradeoff" && activeLab) {
      setActiveLab(null);
    }
  }, [activeLab, step]);

  useEffect(() => {
    if (!activeLab) return;
    window.requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (isLabCloseKey(event.key)) {
        event.preventDefault();
        closeOptionalLab();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeLab, closeOptionalLab]);

  const updateHeatTest = (heat: number, field: number) => {
    setHeatState((current) => applyHeatTest(current, heat, field));
  };

  const mainScene = (() => {
    if (step === "remanence-strength") {
      return <RemanenceScene helperField={helperField} comparison={comparison} markerId={markerId} reducedMotion={reducedMotion} />;
    }
    if (step === "coercivity-lock") {
      return <CoercivityScene opposingField={opposingField} markerId={markerId} reducedMotion={reducedMotion} />;
    }
    if (step === "heat-demagnetisation") {
      return <HeatScene heat={heatState.heat} opposingField={heatState.opposingField} demagLatched={heatState.demagLatched} markerId={markerId} reducedMotion={reducedMotion} />;
    }
    return <TradeoffScene level={protectionLevel} markerId={markerId} reducedMotion={reducedMotion} />;
  })();

  const activeLabIsValid = isChapter3Lab(activeLab);
  const blockMainRouteWhileLabOpen = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const editable = Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
    if (activeLabIsValid && !editable && isLabRouteNavigationKey(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  const labScene = activeLab === "grain-boundary-diffusion"
    ? <GrainBoundaryLab mode={grainMode} testComplete={grainTest} markerId={markerId} reducedMotion={reducedMotion} />
    : activeLab === "cooling-and-smco"
      ? <CoolingLab showFlow={showCoolingFlow} markerId={markerId} reducedMotion={reducedMotion} />
      : null;

  return (
    <div
      className={`chapter3-magnet ${paused ? "is-paused" : ""} ${reducedMotion ? "is-reduced-motion" : ""} ${activeLabIsValid ? "has-open-lab" : ""}`}
      data-step={step}
      data-lab={activeLab ?? undefined}
      data-route-lock={activeLabIsValid || undefined}
      data-label-count={labelSpecsByView[activeLab ?? step].length}
      onKeyDownCapture={blockMainRouteWhileLabOpen}
    >
      <div className="chapter3-magnet__scene">
        {activeLabIsValid ? labScene : mainScene}
      </div>
      <div className="chapter3-magnet__controls" aria-label={activeLabIsValid ? "Optional magnet lab controls" : "Magnet scene controls"}>
        {activeLabIsValid ? (
          <LabControls
            lab={activeLab}
            reducedMotion={reducedMotion}
            grainMode={grainMode}
            grainTest={grainTest}
            showCoolingFlow={showCoolingFlow}
            showSmCo={showSmCo}
            onGrainMode={setGrainMode}
            onRunGrainTest={() => setGrainTest(true)}
            onToggleCoolingFlow={() => setShowCoolingFlow((visible) => !visible)}
            onToggleSmCo={() => setShowSmCo((visible) => !visible)}
            onClose={closeOptionalLab}
            closeRef={closeRef}
          />
        ) : (
          <MainControls
            step={step}
            helperField={helperField}
            comparison={comparison}
            opposingField={opposingField}
            heatState={heatState}
            protectionLevel={protectionLevel}
            reducedMotion={reducedMotion}
            onHelperChange={setHelperField}
            onComparisonChange={setComparison}
            onOpposingChange={setOpposingField}
            onHeatChange={updateHeatTest}
            onFreshMagnet={() => setHeatState(freshHeatTest())}
            onProtectionChange={setProtectionLevel}
            onOpenLab={openOptionalLab}
            launchRefs={launchRefs}
          />
        )}
      </div>
    </div>
  );
}
