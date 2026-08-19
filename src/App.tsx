import { ArrowLeft, ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Diagram } from "./diagrams/Diagrams";
import { Controls } from "./shell/Controls";
import { Evidence } from "./shell/Evidence";
import { ACTS, STOPS, stageForState, type Stop, type StopState } from "./route/route";
/*
 * three.js and its helpers are three quarters of the payload. Loading them
 * behind a boundary lets the shell, the copy and the rail paint immediately,
 * and means the SVG stops never block on a renderer they do not use. The
 * component stays mounted once loaded, so the WebGL context is still created
 * exactly once for the session.
 */
const Stage = lazy(() => import("./stage/Stage").then((m) => ({ default: m.Stage })));
import { DEFAULT_CONTROLS, type StageControls } from "./stage/controls";
import type { RotorId } from "./stage/rotors/registry";
import type { ArchitectureId } from "./models/swapBurden";
import "./design/tokens.css";
import "./shell/Shell.css";

/** Flat list of every (stop, state) pair, which is what Back and Next walk. */
const POSITIONS = STOPS.flatMap((stop, stopIndex) =>
  stop.states.map((state, stateIndex) => ({ stop, state, stopIndex, stateIndex })),
);

const indexOf = (stopId: string, stateId: string) =>
  Math.max(
    0,
    POSITIONS.findIndex((p) => p.stop.id === stopId && p.state.id === stateId),
  );

const hashFor = (stop: Stop, state: StopState) => `#${stop.id}/${state.id}`;

const positionFromHash = (hash: string) => {
  const [stopId, stateId] = hash.replace(/^#/, "").split("/");
  const found = POSITIONS.findIndex(
    (p) => p.stop.id === stopId && (!stateId || p.state.id === stateId),
  );
  return found >= 0 ? found : null;
};

type Move = { type: "go"; index: number } | { type: "step"; by: -1 | 1 };

const cursorReducer = (index: number, move: Move) => {
  const next = move.type === "go" ? move.index : index + move.by;
  return Math.max(0, Math.min(POSITIONS.length - 1, next));
};

export default function App() {
  const [cursor, move] = useReducer(cursorReducer, 0, () =>
    positionFromHash(window.location.hash) ?? 0,
  );
  const [controls, patchControls] = useState<StageControls>(DEFAULT_CONTROLS);
  const [rotor, setRotor] = useState<RotorId>("ipm-ndfeb");
  const [architecture, setArchitecture] = useState<ArchitectureId>("reduced-hree");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { stop, state } = POSITIONS[cursor];

  const setControls = useCallback(
    (patch: Partial<StageControls>) => patchControls((current) => ({ ...current, ...patch })),
    [],
  );

  useEffect(() => {
    document.title = "The rare-earth question, inside one motor";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Each state gets the control values it was written for, so nothing is ever
  // left mid-drag from a previous stop.
  useEffect(() => {
    window.history.replaceState(null, "", hashFor(stop, state));
    patchControls((current) => ({
      ...current,
      explode:
        stop.id === "open-the-machine"
          ? state.id === "explode"
            ? 0.55
            : 0
          : state.id === "ferrite-fix" || state.id === "axial-is-geometry"
            ? 0.6
            : 0,
      isolate:
        state.id === "stator" ? "stator" : state.id === "rotor" ? "rotor" : "none",
      activePhase: state.id === "one-phase" ? 0 : null,
      extract: state.id === "drive-unit" ? 0.6 : state.id === "one-part" ? 0.25 : 0,
      fieldLive: true,
      load:
        state.id === "load-angle" || state.id === "slip" ? 0.6
        : state.id === "two-stresses" ? 0.3
        : state.id === "ceiling" || state.id === "field-weakening" ? 0.85
        : state.id === "coercivity" || state.id === "anisotropy" ? 0.5
        : DEFAULT_CONTROLS.load,
      heat: state.id === "heat-cuts-coercivity" || state.id === "two-stresses" ? 0.5 : 0.15,
    }));
  }, [stop, state]);

  // The rotor rack drives the machine, but a few states name their own rotor.
  useEffect(() => {
    const stage = stageForState(stop, state);
    if (stage.kind === "three" && stage.scene === "motor") setRotor(stage.rotor);
  }, [stop, state]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight") { event.preventDefault(); move({ type: "step", by: 1 }); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move({ type: "step", by: -1 }); }
      if (event.key === " ") { event.preventDefault(); setPaused((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stage = stageForState(stop, state);
  const actIndex = useMemo(() => ACTS.findIndex((a) => a.act === stop.act), [stop.act]);

  return (
    <div className="app">
      <a className="skip-link" href="#stage">Skip to the stage</a>

      <header className="topbar">
        <div className="topbar__title">
          <h1 className="topbar__name">The rare-earth question, inside one motor</h1>
        </div>
        <nav className="topbar__acts" aria-label="Acts">
          {ACTS.map((act, i) => {
            const first = STOPS.find((s) => s.act === act.act);
            return (
              <button
                key={act.act}
                type="button"
                className={`act-tab ${i === actIndex ? "is-current" : ""}`}
                aria-current={i === actIndex ? "step" : undefined}
                onClick={() => first && move({ type: "go", index: indexOf(first.id, first.states[0].id) })}
              >
                {act.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="body">
        <section className="stage-column" id="stage" aria-label={stop.title}>
          <div className="stage-overlay">
            <p className="stage-overlay__label">{state.label}</p>
            <p className="stage-overlay__action">{state.action}</p>
          </div>

          {/*
            The 3D stage stays mounted for the whole tour. SVG stops render on
            top of it rather than replacing it, so the WebGL context is created
            once instead of once per stop.
          */}
          <Suspense
            fallback={
              <div className="stage stage--loading">
                <p>{state.label}</p>
              </div>
            }
          >
            <Stage
              stop={stop}
              state={state}
              controls={controls}
              rotor={rotor}
              paused={paused}
              reducedMotion={reducedMotion}
              hidden={stage.kind !== "three"}
            />
          </Suspense>

          {stage.kind === "three" ? (
            <p className="stage-hint">Drag to orbit · scroll to zoom</p>
          ) : (
            <div className="stage-diagram">
              <Diagram
                id={stage.diagram}
                stateId={state.id}
                controls={controls}
                architecture={architecture}
                onPickArchitecture={setArchitecture}
                rotor={rotor}
                onPickFamily={(id) => {
                  const map: Record<string, RotorId> = {
                    pmsm: "ipm-ndfeb",
                    induction: "squirrel-cage",
                    wound: "wound",
                    synrm: "synrm",
                    srm: "synrm",
                  };
                  if (map[id]) setRotor(map[id]);
                }}
              />
            </div>
          )}
        </section>

        <aside className="panel" aria-label="Explanation and controls">
          <div className="panel__head">
            <p className="panel__number num">
              {String(stop.number).padStart(2, "0")} / {String(STOPS.length).padStart(2, "0")} · {stop.actLabel}
            </p>
            <h2 className="panel__title">{stop.title}</h2>
            <p className="panel__question">{stop.question}</p>
          </div>

          <p className="panel__line">{state.line}</p>

          <Controls
            stop={stop}
            state={state}
            controls={controls}
            setControls={setControls}
            rotor={rotor}
            setRotor={setRotor}
          />

          <Evidence stop={stop} />
        </aside>
      </div>

      <footer className="rail">
        <div className="rail__stops" role="group" aria-label="Tour progress">
          {STOPS.map((item) => {
            const current = item.id === stop.id;
            const done = item.number < stop.number;
            return (
              <button
                key={item.id}
                type="button"
                className={`seg-stop ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}
                aria-current={current ? "step" : undefined}
                title={`${item.number}. ${item.title}`}
                onClick={() => move({ type: "go", index: indexOf(item.id, item.states[0].id) })}
              >
                <span className="seg-stop__label">
                  {item.number}. {item.title}
                </span>
                <span className="seg-stop__bar" />
                <span className="seg-stop__ticks">
                  {item.states.map((itemState, i) => (
                    <span
                      key={itemState.id}
                      className={`seg-stop__tick ${
                        current && itemState.id === state.id
                          ? "is-on"
                          : current && i < POSITIONS[cursor].stateIndex
                            ? "is-past"
                            : done
                              ? "is-past"
                              : ""
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="nav">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            disabled={reducedMotion}
            aria-pressed={paused}
          >
            {paused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
            {paused ? "Play" : "Pause"}
          </button>
          <span className="rail__count num">
            {POSITIONS[cursor].stateIndex + 1} / {stop.states.length}
          </span>
          <button type="button" onClick={() => move({ type: "step", by: -1 })} disabled={cursor === 0}>
            <ArrowLeft size={14} /> Back
          </button>
          <button
            type="button"
            className="is-primary"
            onClick={() => move({ type: "step", by: 1 })}
            disabled={cursor === POSITIONS.length - 1}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
}
