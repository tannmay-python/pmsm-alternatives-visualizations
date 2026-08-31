import type { StageControls } from "../stage/controls";
import { Slider } from "./Controls";
import "./MotorInspector.css";

export type MotorComponentId = "all" | "housing" | "stator" | "rotor" | "shaft" | "air-gap";

type ComponentSpec = {
  id: Exclude<MotorComponentId, "all">;
  label: string;
  tag: string;
  material: string;
  description: string;
  insight: string;
  metricLabel?: string;
  metricValue?: string;
};

export const MOTOR_COMPONENTS: readonly ComponentSpec[] = [
  {
    id: "housing",
    label: "Casing & end caps",
    tag: "Stationary structural frame",
    material: "Die-cast A356 aluminum alloy with an integrated cooling jacket",
    description:
      "The outer aluminum housing seals the electromagnetic core against dirt and moisture. End caps clamp the assembly and support the shaft bearings.",
    insight:
      "Cooling passages in the casing carry heat away from the stator while the frame keeps the air gap aligned.",
    metricLabel: "Cooling medium",
    metricValue: "Water-glycol jacket",
  },
  {
    id: "stator",
    label: "Stator & copper coils",
    tag: "Stationary electromagnet ring",
    material: "Thin non-oriented silicon-steel laminations and OFHC copper magnet wire",
    description:
      "The stator is the stationary electromagnet that produces the rotating magnetic field. Laminated steel carries the flux and copper windings sit in the slots in three phase groups.",
    insight:
      "Thin insulated laminations reduce eddy-current loss; the three phase groups are offset electrically so their combined field can rotate.",
    metricLabel: "Winding layout",
    metricValue: "48 slots · 3 phases",
  },
  {
    id: "rotor",
    label: "Rotor & buried magnets",
    tag: "Rotating magnetic core",
    material: "Laminated electrical steel and sintered neodymium-iron-boron magnets",
    description:
      "The rotor is the spinning core that generates driving torque. In an interior permanent-magnet motor, NdFeB magnets sit inside V-shaped pockets in the steel.",
    insight:
      "Burying the magnets traps them against centrifugal force and makes the steel carry an additional reluctance-torque contribution.",
    metricLabel: "Maximum speed",
    metricValue: "18,000 RPM",
  },
  {
    id: "shaft",
    label: "Output shaft & bearings",
    tag: "Mechanical power output",
    material: "High-strength forged alloy steel and precision bearings",
    description:
      "The drive shaft is keyed to the rotor core and transfers its torque through supported bearings into the vehicle reduction gearbox.",
    insight:
      "Insulated or ceramic-hybrid bearings limit electrical discharge damage from high-frequency inverter currents.",
    metricLabel: "Keying",
    metricValue: "Splined drive fit",
  },
  {
    id: "air-gap",
    label: "Magnetic air gap",
    tag: "Electromagnetic interface",
    material: "Free air clearance between the stator teeth and rotor surface",
    description:
      "A narrow clearance separates the stationary stator teeth from the spinning rotor. There is no physical contact: torque crosses the gap as magnetic flux.",
    insight:
      "A smaller gap strengthens the magnetic pull, but tolerances, expansion and bearing deflection set the usable clearance.",
    metricLabel: "Radial clearance",
    metricValue: "Under 1 mm",
  },
];

export function MotorInspector({
  component,
  controls,
  setControls,
}: {
  component: MotorComponentId;
  controls: StageControls;
  setControls: (patch: Partial<StageControls>) => void;
}) {
  const selectedSpec = MOTOR_COMPONENTS.find((item) => item.id === component);

  return (
    <div className="motor-inspector">
      <div className="motor-inspector__step">
        <span className="motor-inspector__step-index">{component === "all" ? "01" : ""}</span>
        <span className="motor-inspector__step-label">
          {component === "all" ? "Assembly overview" : "Isolated automatically on the stage"}
        </span>
      </div>

      {component === "all" ? (
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
          </div>

          <div className="motor-inspector__spec-block">
            <div className="motor-inspector__spec-row">
              <span className="motor-inspector__spec-label">Material</span>
              <span className="motor-inspector__spec-val">{selectedSpec.material}</span>
            </div>
            {selectedSpec.metricLabel ? (
              <div className="motor-inspector__spec-row">
                <span className="motor-inspector__spec-label">{selectedSpec.metricLabel}</span>
                <span className="motor-inspector__spec-val motor-inspector__spec-val--accent">
                  {selectedSpec.metricValue}
                </span>
              </div>
            ) : null}
          </div>

          <Slider
            label="Explode motor assembly"
            value={controls.explode}
            onChange={(explode) => setControls({ explode })}
            low="assembled"
            high="apart"
            readout={`${Math.round(controls.explode * 100)}%`}
          />

          <p className="motor-inspector__desc">{selectedSpec.description}</p>
          <div className="motor-inspector__insight">
            <strong>Why it matters:</strong> {selectedSpec.insight}
          </div>
        </div>
      ) : null}
    </div>
  );
}
