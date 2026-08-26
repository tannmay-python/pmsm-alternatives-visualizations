import {
  Eye,
  EyeSlash,
  SlidersHorizontal,
  ShieldCheck,
  Lightning,
  Magnet,
  Gear,
  ArrowsInLineHorizontal,
} from "@phosphor-icons/react";
import type { StageControls } from "../stage/controls";
import { Slider } from "./Controls";
import "./MotorInspector.css";

export type MotorComponentId = "all" | "housing" | "stator" | "rotor" | "shaft" | "air-gap";

type ComponentSpec = {
  id: MotorComponentId;
  label: string;
  shortLabel: string;
  tag: string;
  material: string;
  description: string;
  insight: string;
  metricLabel?: string;
  metricValue?: string;
};

const MOTOR_COMPONENTS: ComponentSpec[] = [
  {
    id: "housing",
    label: "Casing & End Caps",
    shortLabel: "Casing",
    tag: "Stationary Structural Frame",
    material: "Die-cast A356 aluminum alloy with integrated helical cooling jacket",
    description:
      "The outer aluminum housing seals the electromagnetic core against dirt and moisture while providing high structural rigidity. End caps clamp the assembly tightly and support the shaft bearings.",
    insight:
      "Traction motors produce significant heat in the stator windings. Liquid cooling channels cast directly into the outer housing carry water-glycol coolant to keep the internal temperature below 150 °C.",
    metricLabel: "Cooling Medium",
    metricValue: "Water-Glycol Jacket",
  },
  {
    id: "stator",
    label: "Stator & Copper Coils",
    shortLabel: "Stator",
    tag: "Stationary Electromagnet Ring",
    material: "0.25 mm non-oriented silicon electrical steel laminations + OFHC copper magnet wire",
    description:
      "The stator is the stationary electromagnet that produces the rotating magnetic field. It consists of hundreds of ultra-thin steel laminations stacked together, with insulated copper wire wound through 48 internal slots.",
    insight:
      "Laminating the steel into ultra-thin sheets separated by insulating varnish prevents eddy currents from circulating, stopping parasitic heat losses. The copper windings are divided into three phase groups (U, V, W) offset by 120°.",
    metricLabel: "Windings Layout",
    metricValue: "48 Slots · 3 Phases",
  },
  {
    id: "rotor",
    label: "Rotor & Buried Magnets",
    shortLabel: "Rotor",
    tag: "Rotating Magnetic Core",
    material: "Laminated electrical steel + sintered Neodymium-Iron-Boron (NdFeB) permanent magnets",
    description:
      "The rotor is the rotating core that generates driving torque. In an Interior Permanent Magnet (IPM) motor, high-energy NdFeB permanent magnets are embedded inside V-shaped slots within the laminated steel core.",
    insight:
      "Burying the magnets inside the steel (rather than gluing them to the surface) physically traps them against extreme centrifugal forces at 18,000 RPM. The steel bridges between magnets also create reluctance torque.",
    metricLabel: "Max Speed",
    metricValue: "18,000 RPM",
  },
  {
    id: "shaft",
    label: "Output Shaft & Bearings",
    shortLabel: "Shaft",
    tag: "Mechanical Power Output",
    material: "High-strength forged alloy steel (4340/8620) + precision deep-groove ball bearings",
    description:
      "The drive shaft is rigidly keyed to the rotor core, transferring high-speed rotational torque from the motor directly into the vehicle reduction gearbox.",
    insight:
      "Ceramic hybrid bearings or insulated steel bearings prevent high-frequency electrical discharge machining (EDM) currents from the inverter from pitting the bearing races.",
    metricLabel: "Keying",
    metricValue: "Splined Drive Fit",
  },
  {
    id: "air-gap",
    label: "Magnetic Air Gap",
    shortLabel: "Air Gap",
    tag: "Electromagnetic Interface",
    material: "Free air clearance (< 1.0 mm radial width)",
    description:
      "A sub-millimetre clearance separates the stationary stator teeth from the spinning rotor. There is zero physical contact — 100% of the motor's driving torque crosses this empty space purely as magnetic flux.",
    insight:
      "The smaller the air gap, the stronger the magnetic pull and the higher the motor efficiency. However, mechanical tolerances, thermal expansion, and bearing deflection limit minimum clearance to ~0.7–1.0 mm.",
    metricLabel: "Radial Clearance",
    metricValue: "< 1.0 mm",
  },
];

export function MotorInspector({
  controls,
  setControls,
}: {
  controls: StageControls;
  setControls: (patch: Partial<StageControls>) => void;
}) {
  const currentIsolated = controls.isolate;
  const selectedId: MotorComponentId = currentIsolated === "none" ? "all" : currentIsolated;

  const handleSelect = (id: MotorComponentId) => {
    if (id === "all") {
      setControls({ isolate: "none" });
    } else {
      setControls({ isolate: id });
    }
  };

  const toggleIsolate = (id: MotorComponentId) => {
    if (id === "all" || controls.isolate === id) {
      setControls({ isolate: "none" });
    } else {
      setControls({ isolate: id });
    }
  };

  const selectedSpec = MOTOR_COMPONENTS.find((c) => c.id === selectedId);

  return (
    <div className="motor-inspector">
      <div className="motor-inspector__tabs-label eyebrow">Inspect Component:</div>

      <nav className="motor-inspector__tabs" aria-label="Motor components">
        <button
          type="button"
          className={`motor-inspector__tab ${selectedId === "all" ? "is-active" : ""}`}
          onClick={() => handleSelect("all")}
        >
          <SlidersHorizontal size={13} weight="bold" />
          <span>All Parts</span>
        </button>

        {MOTOR_COMPONENTS.map((item) => {
          const isActive = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`motor-inspector__tab ${isActive ? "is-active" : ""}`}
              onClick={() => handleSelect(item.id)}
            >
              {item.id === "housing" && <ShieldCheck size={13} weight="bold" />}
              {item.id === "stator" && <Lightning size={13} weight="bold" />}
              {item.id === "rotor" && <Magnet size={13} weight="bold" />}
              {item.id === "shaft" && <Gear size={13} weight="bold" />}
              {item.id === "air-gap" && <ArrowsInLineHorizontal size={13} weight="bold" />}
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      {selectedId === "all" ? (
        <div className="motor-inspector__overview">
          <Slider
            label="Explode motor assembly"
            value={controls.explode}
            onChange={(explode) => setControls({ explode })}
            low="assembled"
            high="apart"
            readout={`${Math.round(controls.explode * 100)}%`}
          />
        </div>
      ) : selectedSpec ? (
        <div className="motor-inspector__detail">
          <div className="motor-inspector__detail-header">
            <div>
              <span className="motor-inspector__tag eyebrow">{selectedSpec.tag}</span>
              <h4 className="motor-inspector__name">{selectedSpec.label}</h4>
            </div>

            <button
              type="button"
              className={`btn btn--ghost motor-inspector__isolate-btn ${controls.isolate === selectedSpec.id ? "is-isolated" : ""}`}
              onClick={() => toggleIsolate(selectedSpec.id)}
              title={controls.isolate === selectedSpec.id ? "Show full motor" : "Hide other parts"}
            >
              {controls.isolate === selectedSpec.id ? (
                <>
                  <EyeSlash size={13} weight="bold" /> Isolated
                </>
              ) : (
                <>
                  <Eye size={13} weight="bold" /> Isolate in 3D
                </>
              )}
            </button>
          </div>

          <div className="motor-inspector__spec-block">
            <div className="motor-inspector__spec-row">
              <span className="motor-inspector__spec-label">Material</span>
              <span className="motor-inspector__spec-val">{selectedSpec.material}</span>
            </div>
            {selectedSpec.metricLabel && (
              <div className="motor-inspector__spec-row">
                <span className="motor-inspector__spec-label">{selectedSpec.metricLabel}</span>
                <span className="motor-inspector__spec-val motor-inspector__spec-val--accent">
                  {selectedSpec.metricValue}
                </span>
              </div>
            )}
          </div>

          {selectedSpec.id !== "air-gap" && (
            <Slider
              label={
                selectedSpec.id === "stator"
                  ? "Explode copper windings from core"
                  : selectedSpec.id === "rotor"
                    ? "Explode magnets & shaft from core"
                    : selectedSpec.id === "housing"
                      ? "Explode end caps & bearings"
                      : "Explode bearings from shaft"
              }
              value={controls.explode}
              onChange={(explode) => setControls({ explode })}
              low="fitted"
              high="separated"
              readout={`${Math.round(controls.explode * 100)}%`}
            />
          )}

          <p className="motor-inspector__desc">{selectedSpec.description}</p>
          <div className="motor-inspector__insight">
            <strong>Why it matters:</strong> {selectedSpec.insight}
          </div>

          <div className="motor-inspector__detail-footer">
            <button
              type="button"
              className="motor-inspector__back-link"
              onClick={() => handleSelect("all")}
            >
              ← Back to all components
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
