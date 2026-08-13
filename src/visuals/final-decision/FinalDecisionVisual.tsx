import { useState } from "react";
import "./finalDecision.css";
import {
  architectureOptions,
  architectureStates,
  burdenRoutes,
  capabilityArchitectures,
  capabilityLayers,
  capabilityPaths,
  decisionQuestions,
  type ArchitectureId,
  type BurdenRouteId,
  type CapabilityArchitectureId,
  type DecisionQuestionId,
  type FinalDecisionStep,
} from "./finalDecisionModel";

export type { FinalDecisionStep } from "./finalDecisionModel";

type FinalDecisionVisualProps = {
  step: FinalDecisionStep;
  paused?: boolean;
  reducedMotion?: boolean;
};

function VehicleSurvivorScene({ architecture }: { architecture: ArchitectureId }) {
  const state = architectureStates[architecture];
  const changed = (module: "motor" | "inverter" | "cooling" | "validation") =>
    state.changed.includes(module) ? "is-changed" : "";

  return (
    <>
      <svg
        className="final-decision__svg final-decision__svg--car"
        viewBox="0 0 1000 540"
        role="img"
        aria-label="A neutral vehicle outline with a selected drive-unit redesign footprint"
      >
        <path className="final-decision-car__ground" d="M104 431H896" />
        <path
          className="final-decision-car__body"
          d="M127 391 151 344c8-16 23-24 43-27l165-25 91-104c13-15 30-22 51-22h157c21 0 39 8 52 24l79 102 118 23c21 4 37 17 44 37l14 39Z"
        />
        <path className="final-decision-car__glass" d="m382 287 86-94c8-9 18-13 31-13h151c13 0 23 5 31 14l73 93Z" />
        <rect className="final-decision-car__battery" x="357" y="359" width="260" height="37" rx="5" />
        <circle className="final-decision-car__wheel" cx="266" cy="405" r="54" />
        <circle className="final-decision-car__wheel" cx="755" cy="405" r="54" />
        <circle className="final-decision-car__hub" cx="266" cy="405" r="8" />
        <circle className="final-decision-car__hub" cx="755" cy="405" r="8" />

        <g className="final-decision-car__drive-unit" transform="translate(686 326)">
          <rect className={`final-decision-car__module ${changed("inverter")}`} x="0" y="0" width="70" height="42" rx="5" />
          <circle className={`final-decision-car__module ${changed("motor")}`} cx="105" cy="22" r="33" />
          <path className={`final-decision-car__cooling ${changed("cooling")}`} d="M4 62h132m-120 11h108m-94 11h80" />
          <path className={`final-decision-car__validation ${changed("validation")}`} d="m154 4 22 18-22 18" />
        </g>
        <path className="final-decision-car__signal" d="M622 347h48m0 0-12-9m12 9-12 9" />
      </svg>
      <div className="final-decision__callout final-decision__callout--retained" aria-hidden="true">
        Vehicle stays neutral
      </div>
      <div className="final-decision__callout final-decision__callout--changed" aria-hidden="true">
        Drive unit changes
      </div>
    </>
  );
}

function BurdenSpectrumScene({ routeId }: { routeId: BurdenRouteId }) {
  const route = burdenRoutes.find((entry) => entry.id === routeId) ?? burdenRoutes[0];
  const markerX = 108 + route.position * 7.84;

  return (
    <>
      <svg
        className="final-decision__svg final-decision__svg--spectrum"
        viewBox="0 0 1000 540"
        role="img"
        aria-label="A qualitative spectrum from material adjustment to drive-unit redesign"
      >
        <path className="final-decision-spectrum__track" d="M108 275H892" />
        {burdenRoutes.map((entry) => {
          const x = 108 + entry.position * 7.84;
          const active = entry.id === routeId;
          return (
            <g key={entry.id} className={active ? "is-active" : ""}>
              <path className="final-decision-spectrum__tick" d={`M${x} 242v66`} />
              <circle className="final-decision-spectrum__node" cx={x} cy="275" r={active ? 15 : 8} />
            </g>
          );
        })}
        <path className="final-decision-spectrum__marker" d={`M${markerX} 192v56`} />
        <circle className="final-decision-spectrum__marker-dot" cx={markerX} cy="176" r="7" />
      </svg>
      <div className="final-decision__callout final-decision__callout--spectrum-start" aria-hidden="true">
        Material adjustment
      </div>
      <div className="final-decision__callout final-decision__callout--spectrum-end" aria-hidden="true">
        Drive-unit redesign
      </div>
    </>
  );
}

function CapabilityStackScene({ architecture }: { architecture: CapabilityArchitectureId }) {
  const activeLayers = capabilityPaths[architecture];
  const points = [116, 305, 500, 695, 884];

  return (
    <>
      <svg
        className="final-decision__svg final-decision__svg--capability"
        viewBox="0 0 1000 540"
        role="img"
        aria-label="Connected capability path from materials through manufacturing"
      >
        {points.slice(0, -1).map((point, index) => (
          <path
            key={`link-${point}`}
            className={`final-decision-capability__link ${
              activeLayers.includes(index) && activeLayers.includes(index + 1) ? "is-active" : ""
            }`}
            d={`M${point + 26} 256H${points[index + 1] - 26}`}
          />
        ))}
        {points.map((point, index) => (
          <circle
            key={`node-${point}`}
            className={`final-decision-capability__node ${activeLayers.includes(index) ? "is-active" : ""}`}
            cx={point}
            cy="256"
            r="25"
          />
        ))}
      </svg>
      <ol className="final-decision__capability-labels" aria-label="India capability chain">
        {capabilityLayers.map((layer, index) => (
          <li className={activeLayers.includes(index) ? "is-active" : ""} key={layer}>
            {layer}
          </li>
        ))}
      </ol>
    </>
  );
}

function DecisionMapScene({ questionId }: { questionId: DecisionQuestionId }) {
  const route = decisionQuestions.find((entry) => entry.id === questionId) ?? decisionQuestions[0];

  return (
    <div className="final-decision__decision-map">
      <svg
        className="final-decision__decision-wires"
        viewBox="0 0 1000 540"
        role="img"
        aria-label="A problem-first decision route to a mechanism, vehicle burden and maturity check"
      >
        <circle className="final-decision-map__origin" cx="166" cy="270" r="24" />
        <path className="final-decision-map__wire" d="M190 270H317V142H394" />
        <path className="final-decision-map__wire" d="M190 270H394" />
        <path className="final-decision-map__wire" d="M190 270H317v128h77" />
        <circle className="final-decision-map__endpoint" cx="414" cy="142" r="8" />
        <circle className="final-decision-map__endpoint" cx="414" cy="270" r="8" />
        <circle className="final-decision-map__endpoint" cx="414" cy="398" r="8" />
      </svg>
      <ol className="final-decision__route-lines" aria-label="Selected decision route">
        <li>
          <span>Mechanism</span>
          <strong>{route.mechanism}</strong>
        </li>
        <li>
          <span>Vehicle burden</span>
          <strong>{route.burden}</strong>
        </li>
        <li>
          <span>Maturity</span>
          <strong>{route.maturity}</strong>
        </li>
      </ol>
    </div>
  );
}

export function FinalDecisionVisual({
  step,
  paused = false,
  reducedMotion = false,
}: FinalDecisionVisualProps) {
  const [architecture, setArchitecture] = useState<ArchitectureId>("reduced-hree");
  const [burdenRoute, setBurdenRoute] = useState<BurdenRouteId>("hree");
  const [capabilityArchitecture, setCapabilityArchitecture] =
    useState<CapabilityArchitectureId>("pm-reduction");
  const [question, setQuestion] = useState<DecisionQuestionId>("hree-now");
  const architectureState = architectureStates[architecture];
  const burden = burdenRoutes.find((entry) => entry.id === burdenRoute) ?? burdenRoutes[0];

  return (
    <section
      className={`final-decision ${paused || reducedMotion ? "is-still" : ""}`}
      data-step={step}
      data-accent={architectureState.accent}
      data-reduced-motion={reducedMotion || undefined}
      aria-label="Final decision visual"
    >
      <div className="final-decision__stage">
        {step === "vehicle-survivors-and-changes" && (
          <VehicleSurvivorScene architecture={architecture} />
        )}
        {step === "swap-burden-spectrum" && <BurdenSpectrumScene routeId={burdenRoute} />}
        {step === "india-capability-stack" && (
          <CapabilityStackScene architecture={capabilityArchitecture} />
        )}
        {step === "final-decision-map" && <DecisionMapScene questionId={question} />}
      </div>

      <div className="final-decision__dock">
        {step === "vehicle-survivors-and-changes" && (
          <fieldset className="final-decision__control">
            <legend>Choose architecture</legend>
            <select value={architecture} onChange={(event) => setArchitecture(event.target.value as ArchitectureId)}>
              {architectureOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <p>{architectureState.summary}</p>
          </fieldset>
        )}

        {step === "swap-burden-spectrum" && (
          <fieldset className="final-decision__control">
            <legend>Choose route</legend>
            <select value={burdenRoute} onChange={(event) => setBurdenRoute(event.target.value as BurdenRouteId)}>
              {burdenRoutes.map((route) => (
                <option key={route.id} value={route.id}>{route.label}</option>
              ))}
            </select>
            <p>{burden.scope}</p>
          </fieldset>
        )}

        {step === "india-capability-stack" && (
          <fieldset className="final-decision__control">
            <legend>Choose architecture</legend>
            <select
              value={capabilityArchitecture}
              onChange={(event) => setCapabilityArchitecture(event.target.value as CapabilityArchitectureId)}
            >
              {capabilityArchitectures.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <p>Opportunity, not guaranteed leadership: the capabilities are complementary paths.</p>
          </fieldset>
        )}

        {step === "final-decision-map" && (
          <fieldset className="final-decision__control">
            <legend>Start with a question</legend>
            <select value={question} onChange={(event) => setQuestion(event.target.value as DecisionQuestionId)}>
              {decisionQuestions.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.label}</option>
              ))}
            </select>
            <p>No universal winner: the problem determines the route to inspect.</p>
          </fieldset>
        )}
      </div>
    </section>
  );
}
