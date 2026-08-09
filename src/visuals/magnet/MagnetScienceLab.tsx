import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  Fan,
  Flame,
  Snowflake,
  Thermometer,
} from "@phosphor-icons/react";
import {
  type KeyboardEvent,
  type ReactNode,
  useId,
  useMemo,
  useState,
} from "react";
import {
  MAGNET_MODES,
  type MagnetMode,
  qualitativeDemagnetisationRisk,
  nextMagnetMode,
} from "./magnetScience";
import "./magnetScienceLab.css";

type ModeCopy = {
  label: string;
  title: string;
  summary: string;
  status: string;
};

const MODE_COPY: Record<MagnetMode, ModeCopy> = {
  properties: {
    label: "Two properties",
    title: "Strength left behind. Resistance to reversal.",
    summary:
      "Remanence is the flux a magnet retains after the helping field is removed. Coercivity is the reverse field needed to erase that direction.",
    status: "Comparing remanence and coercivity.",
  },
  alloy: {
    label: "An alloy with roles",
    title: "A strong moment needs a stubborn direction.",
    summary:
      "Iron-rich parts of NdFeB supply much of the magnetic moment. NdPr-rich crystal structure supplies high anisotropy, a preferred direction that resists rotation.",
    status: "Showing the alloy's complementary magnetic roles.",
  },
  heat: {
    label: "Heat and reversal",
    title: "Heat lowers the lock. The stator can push back.",
    summary:
      "As temperature rises, coercivity falls. A strong reverse field can then seed a reversed region at a vulnerable surface. If it grows, some lost magnetisation can remain lost after cooling.",
    status: "Showing qualitative thermal and reverse-field stress.",
  },
  heavyRareEarths: {
    label: "Dy and Tb",
    title: "More high-temperature resistance, with a tradeoff.",
    summary:
      "Dysprosium or terbium can raise high-temperature coercivity. Their moments couple antiparallel to iron, so adding more can reduce remanence.",
    status: "Showing the Dy and Tb coercivity-remanence tradeoff.",
  },
  diffusion: {
    label: "Grain-boundary diffusion",
    title: "Protect the likely starting point, not every atom equally.",
    summary:
      "Grain-boundary diffusion enriches vulnerable grain-boundary regions with heavy rare earths. It aims to stop reversal nuclei while using less Dy or Tb than a uniform bulk addition.",
    status: "Showing grain-boundary enrichment.",
  },
  cooling: {
    label: "Cool the rotor",
    title: "Lower temperature changes the material burden.",
    summary:
      "Direct rotor cooling can reduce the temperature a magnet experiences. That can reduce the high-temperature coercivity margin required from Dy or Tb, depending on the grade and duty cycle.",
    status: "Showing cooling as a way to reduce thermal material burden.",
  },
};

const MODE_ICONS: Record<MagnetMode, ReactNode> = {
  properties: <ArrowCounterClockwise size={17} aria-hidden="true" />,
  alloy: <span className="msl-atom-icon" aria-hidden="true" />,
  heat: <Flame size={17} aria-hidden="true" />,
  heavyRareEarths: <span className="msl-dy-icon" aria-hidden="true">Dy</span>,
  diffusion: <span className="msl-grain-icon" aria-hidden="true" />,
  cooling: <Snowflake size={17} aria-hidden="true" />,
};

export type MagnetScienceLabProps = {
  reducedMotion?: boolean;
};

/**
 * A compact, SVG-first material-science lesson. It is intentionally independent
 * of the host story shell so it can be mounted inside a chapter, modal, or route.
 */
export function MagnetScienceLab({ reducedMotion = false }: MagnetScienceLabProps) {
  const [mode, setMode] = useState<MagnetMode>("properties");
  const [thermalStress, setThermalStress] = useState(66);
  const [reverseField, setReverseField] = useState(70);
  const tabPrefix = useId();
  const activeIndex = MAGNET_MODES.indexOf(mode);
  const copy = MODE_COPY[mode];
  const risk = useMemo(
    () => qualitativeDemagnetisationRisk(thermalStress, reverseField),
    [thermalStress, reverseField],
  );

  const selectMode = (nextMode: MagnetMode) => setMode(nextMode);
  const move = (direction: -1 | 1) => setMode((current) => nextMagnetMode(current, direction));

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % MAGNET_MODES.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + MAGNET_MODES.length) % MAGNET_MODES.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = MAGNET_MODES.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextMode = MAGNET_MODES[nextIndex];
    selectMode(nextMode);
    document.getElementById(`${tabPrefix}-${nextMode}`)?.focus();
  };

  return (
    <section
      className={`magnet-science-lab ${reducedMotion ? "is-reduced-motion" : ""}`}
      aria-label="How a traction-motor magnet handles heat and reverse fields"
    >
      <div className="msl-heading">
        <div>
          <p className="msl-kicker">Inside the magnet</p>
          <h2>{copy.title}</h2>
        </div>
        <p>{copy.summary}</p>
      </div>

      <div className="msl-exhibit">
        <div className="msl-stage" aria-describedby={`${tabPrefix}-status`}>
          <MagnetVisual
            mode={mode}
            thermalStress={thermalStress}
            reverseField={reverseField}
            risk={risk}
            reducedMotion={reducedMotion}
          />
          <p className="msl-live-status" id={`${tabPrefix}-status`} aria-live="polite">
            {copy.status}
          </p>
        </div>

        <div className="msl-controls">
          <div className="msl-tabs" role="tablist" aria-label="Magnet science views">
            {MAGNET_MODES.map((item, index) => {
              const tabId = `${tabPrefix}-${item}`;
              return (
                <button
                  key={item}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={mode === item}
                  aria-controls={`${tabPrefix}-panel`}
                  tabIndex={mode === item ? 0 : -1}
                  className={mode === item ? "is-active" : ""}
                  onClick={() => selectMode(item)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  {MODE_ICONS[item]}
                  <span>{MODE_COPY[item].label}</span>
                </button>
              );
            })}
          </div>

          <div
            className="msl-detail"
            id={`${tabPrefix}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabPrefix}-${mode}`}
          >
            {mode === "properties" && <PropertyLegend />}
            {mode === "alloy" && <AlloyLegend />}
            {mode === "heat" && (
              <HeatControls
                thermalStress={thermalStress}
                reverseField={reverseField}
                risk={risk}
                onThermalStress={setThermalStress}
                onReverseField={setReverseField}
              />
            )}
            {mode === "heavyRareEarths" && <HeavyRareEarthLegend />}
            {mode === "diffusion" && <DiffusionLegend />}
            {mode === "cooling" && <CoolingLegend />}
          </div>

          <div className="msl-pagination" aria-label="Move through magnet science views">
            <button type="button" onClick={() => move(-1)} aria-label="Previous magnet science view">
              <ArrowLeft size={17} weight="bold" aria-hidden="true" />
              Previous
            </button>
            <span aria-hidden="true">{activeIndex + 1} / {MAGNET_MODES.length}</span>
            <button type="button" onClick={() => move(1)} aria-label="Next magnet science view">
              Next
              <ArrowRight size={17} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className="msl-method-note">
        Conceptual visual. Real magnet performance depends on grade, microstructure, geometry, current, cooling, and duty cycle.
      </p>
    </section>
  );
}

function PropertyLegend() {
  return (
    <div className="msl-copy-block">
      <span className="msl-term">Remanence</span>
      <p>How much flux remains when the external field returns to zero.</p>
      <span className="msl-term">Coercivity</span>
      <p>How much reverse field is needed to drive that remaining flux back to zero.</p>
    </div>
  );
}

function AlloyLegend() {
  return (
    <div className="msl-copy-block">
      <span className="msl-term">Magnetic moment</span>
      <p>Iron-rich regions contribute strongly to the magnetisation available to the machine.</p>
      <span className="msl-term">Anisotropy</span>
      <p>The NdPr-rich crystal phase makes one magnetisation direction energetically preferred.</p>
    </div>
  );
}

function HeatControls({
  thermalStress,
  reverseField,
  risk,
  onThermalStress,
  onReverseField,
}: {
  thermalStress: number;
  reverseField: number;
  risk: "low" | "watch" | "high";
  onThermalStress: (value: number) => void;
  onReverseField: (value: number) => void;
}) {
  const readableRisk = risk === "watch" ? "watch closely" : risk;
  return (
    <div className="msl-heat-control">
      <label>
        <span><Thermometer size={16} aria-hidden="true" /> Thermal stress</span>
        <input
          type="range"
          min="0"
          max="100"
          value={thermalStress}
          aria-valuetext={`${thermalStress} of 100, qualitative thermal stress`}
          onChange={(event) => onThermalStress(Number(event.target.value))}
        />
      </label>
      <label>
        <span><ArrowCounterClockwise size={16} aria-hidden="true" /> Reverse stator field</span>
        <input
          type="range"
          min="0"
          max="100"
          value={reverseField}
          aria-valuetext={`${reverseField} of 100, qualitative reverse field`}
          onChange={(event) => onReverseField(Number(event.target.value))}
        />
      </label>
      <div className={`msl-risk is-${risk}`} aria-live="polite">
        <span>Qualitative risk</span>
        <strong>{readableRisk}</strong>
      </div>
    </div>
  );
}

function HeavyRareEarthLegend() {
  return (
    <div className="msl-split-copy">
      <div>
        <span className="msl-term">Gain</span>
        <p>More coercivity margin when the motor is hot.</p>
      </div>
      <div>
        <span className="msl-term">Cost</span>
        <p>Less remanence when more Dy or Tb replaces magnetic volume.</p>
      </div>
    </div>
  );
}

function DiffusionLegend() {
  return (
    <div className="msl-copy-block">
      <span className="msl-term">Bulk addition</span>
      <p>Heavy rare earth spreads through more of the grain than is needed to protect a likely reversal starting point.</p>
      <span className="msl-term">Boundary diffusion</span>
      <p>Enrichment is concentrated near boundaries and outer regions, where nucleation can begin.</p>
    </div>
  );
}

function CoolingLegend() {
  return (
    <div className="msl-copy-block">
      <span className="msl-term">Material lever</span>
      <p>Use a higher-coercivity magnet grade to tolerate more heat.</p>
      <span className="msl-term">Thermal lever</span>
      <p>Move heat away from the rotor so the grade does not need the same margin.</p>
    </div>
  );
}

function MagnetVisual({
  mode,
  thermalStress,
  reverseField,
  risk,
  reducedMotion,
}: {
  mode: MagnetMode;
  thermalStress: number;
  reverseField: number;
  risk: "low" | "watch" | "high";
  reducedMotion: boolean;
}) {
  const title = MODE_COPY[mode].label;
  return (
    <svg className="msl-svg" viewBox="0 0 760 500" role="img" aria-labelledby="msl-visual-title msl-visual-desc">
      <title id="msl-visual-title">{title}</title>
      <desc id="msl-visual-desc">A simplified technical diagram explaining {title.toLowerCase()} in a neodymium iron boron traction-motor magnet.</desc>
      <defs>
        <marker id="msl-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L6,3 z" className="msl-arrowhead" />
        </marker>
        <pattern id="msl-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" className="msl-hatch-line" />
        </pattern>
        <filter id="msl-soften" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect className="msl-stage-backdrop" x="1" y="1" width="758" height="498" rx="18" />
      {mode === "properties" && <PropertiesVisual />}
      {mode === "alloy" && <AlloyVisual reducedMotion={reducedMotion} />}
      {mode === "heat" && (
        <HeatVisual
          thermalStress={thermalStress}
          reverseField={reverseField}
          risk={risk}
          reducedMotion={reducedMotion}
        />
      )}
      {mode === "heavyRareEarths" && <HeavyRareEarthVisual />}
      {mode === "diffusion" && <DiffusionVisual reducedMotion={reducedMotion} />}
      {mode === "cooling" && <CoolingVisual reducedMotion={reducedMotion} />}
    </svg>
  );
}

function PropertiesVisual() {
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">Conceptual magnetic response</text>
      <line className="msl-axis" x1="90" y1="390" x2="670" y2="390" markerEnd="url(#msl-arrow)" />
      <line className="msl-axis" x1="208" y1="432" x2="208" y2="78" markerEnd="url(#msl-arrow)" />
      <text className="msl-axis-label" x="620" y="424">reverse field</text>
      <text className="msl-axis-label" x="144" y="100">flux left in magnet</text>
      <path className="msl-hysteresis" d="M120 345 C166 200 320 126 538 150 C615 160 650 210 638 250 C620 312 456 350 322 298 C247 270 248 190 353 150" />
      <circle className="msl-point-remanence" cx="208" cy="250" r="7" />
      <path className="msl-measure" d="M184 390 L184 250" />
      <text className="msl-callout-title" x="92" y="233">Remanence</text>
      <text className="msl-callout-copy" x="92" y="254">field removed, flux remains</text>
      <circle className="msl-point-coercivity" cx="444" cy="390" r="7" />
      <path className="msl-measure" d="M208 415 L444 415" />
      <text className="msl-callout-title" x="366" y="452">Coercivity</text>
      <text className="msl-callout-copy" x="366" y="472">reverse field needed to erase it</text>
      <g className="msl-mini-magnet" transform="translate(548 83)">
        <rect x="0" y="0" width="114" height="42" rx="7" />
        <text x="18" y="27">N</text><text x="86" y="27">S</text>
        <path d="M18 52 C40 67 75 67 97 52" markerEnd="url(#msl-arrow)" />
      </g>
    </g>
  );
}

function AlloyVisual({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">A useful engineering model</text>
      <g transform="translate(78 104)">
        <rect className="msl-alloy-panel" x="0" y="0" width="274" height="296" rx="14" />
        <text className="msl-callout-title" x="26" y="40">Magnetic moment</text>
        <text className="msl-callout-copy" x="26" y="62">iron-rich structure</text>
        {Array.from({ length: 20 }, (_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const x = 47 + col * 45;
          const y = 120 + row * 48;
          return (
            <g key={`fe-${index}`} className={reducedMotion ? "" : "msl-moment"} style={{ animationDelay: `${(index % 5) * 120}ms` }}>
              <circle className="msl-fe-dot" cx={x} cy={y} r="13" />
              <line className="msl-moment-line" x1={x} y1={y + 7} x2={x} y2={y - 9} markerEnd="url(#msl-arrow)" />
            </g>
          );
        })}
      </g>
      <g transform="translate(410 104)">
        <rect className="msl-alloy-panel" x="0" y="0" width="274" height="296" rx="14" />
        <text className="msl-callout-title" x="26" y="40">Preferred direction</text>
        <text className="msl-callout-copy" x="26" y="62">NdPr-rich crystal phase</text>
        <path className="msl-anisotropy-well" d="M44 224 C78 130 104 130 137 224 C170 318 201 318 233 224" />
        <line className="msl-easy-axis" x1="137" y1="100" x2="137" y2="284" />
        <circle className={reducedMotion ? "msl-ndpr-dot" : "msl-ndpr-dot msl-roll"} cx="137" cy="224" r="18" />
        <text className="msl-axis-label" x="158" y="122">easy axis</text>
        <text className="msl-axis-label" x="152" y="257">energetically preferred</text>
      </g>
      <path className="msl-connector" d="M360 252 L400 252" markerEnd="url(#msl-arrow)" />
      <text className="msl-small-note" x="195" y="447">Not a literal atom-by-atom split. The alloy works as one coupled magnetic material.</text>
    </g>
  );
}

function HeatVisual({
  thermalStress,
  reverseField,
  risk,
  reducedMotion,
}: {
  thermalStress: number;
  reverseField: number;
  risk: "low" | "watch" | "high";
  reducedMotion: boolean;
}) {
  const nucleusRadius = risk === "high" ? 44 : risk === "watch" ? 26 : 12;
  const gradientStop = 302 - thermalStress * 1.35;
  const reverseLength = 74 + reverseField * 1.2;
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">Temperature and opposing field, qualitatively</text>
      <g transform="translate(90 95)">
        <rect className="msl-magnet-block" x="0" y="0" width="430" height="300" rx="16" />
        <rect className="msl-hot-overlay" x="0" y={gradientStop} width="430" height={395 - gradientStop} rx="16" />
        <text className="msl-magnet-word" x="24" y="43">NdFeB magnet</text>
        {Array.from({ length: 18 }, (_, index) => {
          const row = Math.floor(index / 6);
          const col = index % 6;
          const x = 48 + col * 65;
          const y = 103 + row * 75;
          const rotation = risk === "high" && col > 3 && row === 1 ? 180 : 0;
          return (
            <g key={`grain-${index}`} transform={`rotate(${rotation} ${x} ${y})`}>
              <polygon className="msl-grain" points={`${x},${y - 25} ${x + 30},${y - 4} ${x + 19},${y + 28} ${x - 22},${y + 23} ${x - 30},${y - 6}`} />
              <line className="msl-grain-arrow" x1={x} y1={y + 11} x2={x} y2={y - 12} markerEnd="url(#msl-arrow)" />
            </g>
          );
        })}
        <circle
          className={reducedMotion || risk === "low" ? "msl-nucleus" : "msl-nucleus msl-nucleus-pulse"}
          cx="489"
          cy="247"
          r={nucleusRadius}
          transform="translate(-104 0)"
        />
        {risk !== "low" && <path className="msl-reversal-front" d="M359 198 C318 232 318 274 359 306" />}
      </g>
      <g transform="translate(570 105)">
        <text className="msl-callout-title" x="0" y="0">Stator pushes back</text>
        {Array.from({ length: 4 }, (_, index) => {
          const y = 52 + index * 56;
          return <line key={`reverse-${index}`} className="msl-reverse-field" x1={reverseLength} y1={y} x2="8" y2={y} markerEnd="url(#msl-arrow)" />;
        })}
        <text className="msl-callout-title" x="0" y="290">Heat weakens coercivity</text>
        <text className="msl-callout-copy" x="0" y="312">then a surface nucleus can grow</text>
      </g>
      <g transform="translate(90 432)">
        <rect className="msl-stress-scale" x="0" y="0" width="430" height="10" rx="5" />
        <rect className={`msl-stress-fill is-${risk}`} x="0" y="0" width={Math.max(22, (thermalStress * 0.55 + reverseField * 0.45) * 4.3)} height="10" rx="5" />
        <text className="msl-axis-label" x="0" y="35">low combined stress</text>
        <text className="msl-axis-label" x="330" y="35">high</text>
      </g>
    </g>
  );
}

function HeavyRareEarthVisual() {
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">A material tradeoff, not a free upgrade</text>
      <g transform="translate(100 112)">
        <rect className="msl-tradeoff-column" x="0" y="0" width="220" height="260" rx="15" />
        <text className="msl-callout-title" x="26" y="40">NdFeB baseline</text>
        <rect className="msl-magnet-slab" x="30" y="74" width="160" height="72" rx="10" />
        <text className="msl-slab-letter" x="53" y="118">N</text><text className="msl-slab-letter" x="151" y="118">S</text>
        <line className="msl-remanence-arrow" x1="46" y1="190" x2="174" y2="190" markerEnd="url(#msl-arrow)" />
        <text className="msl-axis-label" x="30" y="228">higher remanence</text>
        <text className="msl-axis-label" x="30" y="246">lower hot coercivity margin</text>
      </g>
      <g transform="translate(440 112)">
        <rect className="msl-tradeoff-column" x="0" y="0" width="220" height="260" rx="15" />
        <text className="msl-callout-title" x="26" y="40">Dy/Tb-modified grade</text>
        <rect className="msl-magnet-slab" x="30" y="74" width="160" height="72" rx="10" />
        {Array.from({ length: 7 }, (_, index) => {
          const x = 44 + (index % 4) * 35;
          const y = 88 + Math.floor(index / 4) * 30;
          return <circle key={`dy-${index}`} className="msl-dy-dot" cx={x} cy={y} r="8" />;
        })}
        <line className="msl-remanence-arrow is-short" x1="46" y1="190" x2="142" y2="190" markerEnd="url(#msl-arrow)" />
        <path className="msl-coercivity-bracket" d="M48 223 L48 244 L174 244 L174 223" />
        <text className="msl-axis-label" x="30" y="270">more hot coercivity margin</text>
      </g>
      <path className="msl-connector" d="M334 244 L421 244" markerEnd="url(#msl-arrow)" />
      <text className="msl-small-note" x="141" y="433">Dy/Tb moments couple antiparallel to Fe. That stabilises direction while reducing net magnetisation.</text>
    </g>
  );
}

function DiffusionVisual({ reducedMotion }: { reducedMotion: boolean }) {
  const grains = [
    [174, 203, 71], [321, 192, 78], [467, 204, 72], [239, 333, 72], [395, 330, 83], [540, 333, 68],
  ] as const;
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">Where a reversal is likely to begin matters</text>
      <rect className="msl-diffusion-box" x="78" y="96" width="604" height="316" rx="18" />
      {grains.map(([x, y, radius], index) => (
        <g key={`diffusion-grain-${index}`}>
          <circle className="msl-diffusion-boundary" cx={x} cy={y} r={radius} />
          <circle className="msl-diffusion-core" cx={x} cy={y} r={radius - 15} />
          {Array.from({ length: 7 }, (_, dotIndex) => {
            const angle = (dotIndex / 7) * Math.PI * 2 + index * 0.36;
            return (
              <circle
                key={`shell-${index}-${dotIndex}`}
                className={reducedMotion ? "msl-diffusion-dot" : "msl-diffusion-dot msl-diffusion-breathe"}
                style={{ animationDelay: `${(dotIndex + index) * 75}ms` }}
                cx={x + Math.cos(angle) * (radius - 7)}
                cy={y + Math.sin(angle) * (radius - 7)}
                r="5"
              />
            );
          })}
        </g>
      ))}
      <line className="msl-annotation-line" x1="610" y1="120" x2="551" y2="165" />
      <text className="msl-callout-title" x="504" y="108">enriched boundary</text>
      <line className="msl-annotation-line" x1="112" y1="378" x2="166" y2="335" />
      <text className="msl-callout-title" x="86" y="402">NdFeB-rich core</text>
      <text className="msl-small-note" x="96" y="455">Boundary enrichment is a simplified picture. Actual diffusion profiles and grains are more complex.</text>
    </g>
  );
}

function CoolingVisual({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <g>
      <text className="msl-figure-label" x="70" y="63">Two ways to preserve coercivity margin</text>
      <g transform="translate(74 118)">
        <rect className="msl-cooling-panel" x="0" y="0" width="276" height="250" rx="16" />
        <text className="msl-callout-title" x="26" y="40">Material lever</text>
        <text className="msl-callout-copy" x="26" y="62">more high-temperature coercivity</text>
        <rect className="msl-hot-rotor" x="52" y="100" width="170" height="80" rx="40" />
        <rect className="msl-rotor-core" x="82" y="120" width="110" height="40" rx="20" />
        <g className={reducedMotion ? "" : "msl-heat-waves"}>
          <path d="M75 92 C62 76 95 72 82 52" /><path d="M139 92 C126 76 159 72 146 52" /><path d="M203 92 C190 76 223 72 210 52" />
        </g>
        <text className="msl-axis-label" x="54" y="218">magnet must tolerate more heat</text>
      </g>
      <g transform="translate(412 118)">
        <rect className="msl-cooling-panel" x="0" y="0" width="276" height="250" rx="16" />
        <text className="msl-callout-title" x="26" y="40">Thermal lever</text>
        <text className="msl-callout-copy" x="26" y="62">remove heat from the rotor</text>
        <rect className="msl-cooled-rotor" x="52" y="100" width="170" height="80" rx="40" />
        <rect className="msl-rotor-core" x="82" y="120" width="110" height="40" rx="20" />
        <path className={reducedMotion ? "msl-coolant" : "msl-coolant msl-coolant-flow"} d="M30 140 C64 90 83 202 116 140 S169 80 194 140 S248 196 253 136" />
        <Fan className={reducedMotion ? "" : "msl-fan"} x="220" y="189" size="28" aria-hidden="true" />
        <text className="msl-axis-label" x="54" y="218">less temperature burden on magnet</text>
      </g>
      <path className="msl-connector" d="M356 242 L397 242" markerEnd="url(#msl-arrow)" />
      <text className="msl-small-note" x="126" y="432">Cooling does not turn a permanent magnet off. It changes the temperature at which it must hold its direction.</text>
    </g>
  );
}
