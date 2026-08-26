import { ArrowRight, Cube, Pause, Play } from "@phosphor-icons/react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Diagram } from "./diagrams/Diagrams";
import { Controls } from "./shell/Controls";
import { Evidence } from "./shell/Evidence";
import { BeatCard } from "./shell/BeatCard";
import { ProgressBar } from "./shell/ProgressBar";
import { Landing } from "./pages/Landing";
import { RightHandRule } from "./stage/RightHandRule";
import { Close } from "./pages/Close";
import { PUBLISHER } from "./meta";
import { STOPS, type Stop, type StopState } from "./route/route";
import { BEATS, PAGE_LIST } from "./route/structure";
import { presetFor } from "./route/presets";
/*
 * three.js and its helpers are three quarters of the payload. Loading them
 * behind a boundary lets the shell and the card paint immediately, and means
 * the SVG beats never block on a renderer they do not use. The component stays
 * mounted once loaded, so the WebGL context is created exactly once.
 */
const Stage = lazy(() => import("./stage/Stage").then((m) => ({ default: m.Stage })));
import { DEFAULT_CONTROLS, type StageControls } from "./stage/controls";
import type { RotorId } from "./stage/rotors/registry";
import type { ArchitectureId } from "./models/swapBurden";
import "./design/tokens.css";
import "./shell/Shell.css";

/**
 * The tour is three screens: an editorial landing, six tour pages, and an
 * editorial close. Only the middle one carries tour chrome.
 */
type Screen = "landing" | "tour" | "close";

const hashFor = (index: number) => {
  const { page, stop, beat } = BEATS[index];
  return `#${page.id}/${stop.id}/${beat.id}`;
};

const positionFromHash = (hash: string) => {
  const raw = hash.replace(/^#/, "");
  if (!raw) return null;
  if (raw === "close") return "close" as const;
  const [pageId, stopId, beatId] = raw.split("/");
  const found = BEATS.findIndex(
    (p) =>
      p.page.id === pageId &&
      (!stopId || p.stop.id === stopId) &&
      (!beatId || p.beat.id === beatId),
  );
  return found >= 0 ? found : null;
};

type Move = { type: "go"; index: number } | { type: "step"; by: -1 | 1 };

const cursorReducer = (index: number, move: Move) => {
  const next = move.type === "go" ? move.index : index + move.by;
  return Math.max(0, Math.min(BEATS.length - 1, next));
};

/**
 * The route.ts stop and state whose frame a beat shows, which the stage and
 * the per-beat controls are still written against. Usually the beat's first
 * source state; a deliberate merge may name a different one.
 */
const sourceOf = (index: number) => {
  const { stop, beat } = BEATS[index];
  const sourceStop = STOPS.find((s) => s.id === stop.sourceStopId) as Stop;
  const sourceState = sourceStop.states.find((s) => s.id === beat.frameStateId) as StopState;
  return { sourceStop, sourceState };
};

export default function App() {
  const initialHash = typeof window === "undefined" ? "" : window.location.hash;
  const initial = positionFromHash(initialHash);

  const [screen, setScreen] = useState<Screen>(
    initial === null ? "landing" : initial === "close" ? "close" : "tour",
  );
  const [cursor, move] = useReducer(
    cursorReducer,
    typeof initial === "number" ? initial : 0,
  );
  const [controls, patchControls] = useState<StageControls>(DEFAULT_CONTROLS);
  const [rotor, setRotor] = useState<RotorId>("ipm-ndfeb");
  const [architecture, setArchitecture] = useState<ArchitectureId>("reduced-hree");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  /*
   * The camera rides scripted stations so that hand-placed labels stay valid.
   * Explore is the deliberate escape hatch: "you can obviously pause the tour
   * at any time and play around with it if you want to."
   */
  const [explore, setExplore] = useState(false);

  const position = BEATS[cursor];
  const { page, stop, beat, stopIndex, beatIndex, pageIndex } = position;
  const { sourceStop, sourceState } = useMemo(() => sourceOf(cursor), [cursor]);

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

  // Each beat gets the control values it was written for, so nothing is ever
  // left mid-drag from the beat before it.
  useEffect(() => {
    if (screen !== "tour") return;
    window.history.replaceState(null, "", hashFor(cursor));
    // The preset lives in route/presets.ts because the structure module needs
    // it too: it is part of what decides whether two beats drew the same frame.
    patchControls(presetFor(sourceStop.id, sourceState.id));

    // Leaving a beat drops the reader back onto its scripted angle.
    setExplore(false);
  }, [cursor, screen, sourceStop, sourceState]);

  // The rotor rack drives the machine, but a few beats name their own rotor.
  useEffect(() => {
    if (beat.stage.kind === "three" && beat.stage.scene === "motor") setRotor(beat.stage.rotor);
  }, [beat]);

  const goNext = useCallback(() => {
    if (cursor === BEATS.length - 1) {
      setScreen("close");
      window.history.replaceState(null, "", "#close");
      return;
    }
    move({ type: "step", by: 1 });
  }, [cursor]);

  const goBack = useCallback(() => {
    if (cursor === 0) {
      setScreen("landing");
      window.history.replaceState(null, "", " ");
      return;
    }
    move({ type: "step", by: -1 });
  }, [cursor]);

  /** Skip the rest of this page. "There should be an option to skip that
   *  complete page and go to the next page if the person wants." */
  const skipPage = useCallback(() => {
    const next = BEATS.findIndex((p) => p.pageIndex === pageIndex + 1);
    if (next === -1) {
      setScreen("close");
      window.history.replaceState(null, "", "#close");
      return;
    }
    move({ type: "go", index: next });
  }, [pageIndex]);

  const jumpWithinPage = useCallback(
    (targetStop: number, targetBeat: number) => {
      const index = BEATS.findIndex(
        (p) =>
          p.pageIndex === pageIndex && p.stopIndex === targetStop && p.beatIndex === targetBeat,
      );
      if (index >= 0) move({ type: "go", index });
    },
    [pageIndex],
  );

  const goToPage = useCallback((targetPage: number) => {
    const index = BEATS.findIndex((p) => p.pageIndex === targetPage);
    if (index >= 0) {
      move({ type: "go", index });
      setScreen("tour");
    }
  }, []);

  useEffect(() => {
    if (screen !== "tour") return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight") { event.preventDefault(); goNext(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goBack(); }
      if (event.key === " ") { event.preventDefault(); setPaused((p) => !p); }
      if (event.key === "Escape") setExplore(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, goNext, goBack]);

  // In-app moves use replaceState; browser back/forward raises hashchange.
  useEffect(() => {
    const syncFromHash = () => {
      const next = positionFromHash(window.location.hash);
      if (next === null) { setScreen("landing"); return; }
      if (next === "close") { setScreen("close"); return; }
      setScreen("tour");
      move({ type: "go", index: next });
    };
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  if (screen === "landing") {
    return (
      <Landing
        onEnter={() => {
          move({ type: "go", index: 0 });
          setScreen("tour");
        }}
      />
    );
  }

  if (screen === "close") {
    return (
      <Close
        onBack={() => {
          move({ type: "go", index: BEATS.length - 1 });
          setScreen("tour");
        }}
        onRestart={() => {
          setScreen("landing");
          window.history.replaceState(null, "", " ");
        }}
      />
    );
  }

  // A local const so the union narrows inside the branch below.
  const stage = beat.stage;
  const isThree = stage.kind === "three";

  return (
    <div className="app" data-side={page.side}>
      <a className="skip-link" href="#stage">Skip to the stage</a>

      <header className="topbar">
        <div className="topbar__brand">
          <p className="topbar__publisher eyebrow">{PUBLISHER}</p>
          <button
            type="button"
            className="topbar__title nav-link"
            onClick={() => { setScreen("landing"); window.history.replaceState(null, "", " "); }}
          >
            The rare-earth question, inside one motor
          </button>
        </div>

        {/* Destinations, so Inter and Title Case — never mono, never uppercase. */}
        <nav className="topbar__pages" aria-label="Pages">
          {PAGE_LIST.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={`page-tab nav-link ${i === pageIndex ? "is-current" : ""}`}
              aria-current={i === pageIndex ? "page" : undefined}
              onClick={() => goToPage(i)}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </header>

      <div className="progress-strip">
        <ProgressBar
          page={page}
          stopIndex={stopIndex}
          beatIndex={beatIndex}
          onJump={jumpWithinPage}
        />
        <button type="button" className="progress-strip__skip" onClick={skipPage}>
          Skip page <ArrowRight size={12} weight="bold" />
        </button>
      </div>

      {/*
        The scene is full-bleed and everything else floats over it. The card
        sits on one side and the canvas shifts the other way, which is how the
        machine keeps the page without the card ever covering it.
      */}
      <section className="stage-layer" id="stage" aria-label={stop.title}>
        {stage.kind === "three" ? (
          <Suspense
            fallback={
              <div className="stage stage--loading">
                <p>{beat.label}</p>
              </div>
            }
          >
            <Stage
              stop={sourceStop}
              state={sourceState}
              controls={controls}
              rotor={rotor}
              paused={paused || explore}
              reducedMotion={reducedMotion}
              explore={explore}
              side={page.side}
            />
          </Suspense>
        ) : (
          <div className={`stage-diagram stage-diagram--${page.side}`}>
            <Diagram
              id={stage.diagram}
              stateId={sourceState.id}
              emphasis={beat.emphasis}
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
                  srm: "srm",
                };
                if (map[id]) setRotor(map[id]);
              }}
            />
          </div>
        )}
        {/*
          The rule is explained where the field first appears, on the
          visualisation, and it is gone the moment you press Next.
        */}
        {sourceState.id === "one-phase" && (
          <RightHandRule side={page.side} paused={paused || reducedMotion} />
        )}
      </section>

      <BeatCard
        page={page}
        stop={stop}
        beat={beat}
        beatNumber={beatIndex + 1}
        beatTotal={stop.beats.length}
        onBack={goBack}
        onNext={goNext}
        canGoBack
        canGoNext
        controls={
          <Controls
            stop={sourceStop}
            state={sourceState}
            controls={controls}
            setControls={setControls}
            rotor={rotor}
            setRotor={setRotor}
          />
        }
        aside={
          /*
           * The right-hand rule itself is now drawn on the stage, so the card
           * carries only the note that the drawing cannot make: which of the
           * two axes on screen is which.
           */
          sourceState.id === "rotor-locks" ? (
            <>
              <strong>Two axes, one speed</strong>
              <p>
                The stator field leads and the rotor magnet axis trails, but both turn at the same
                rate. The gap between them is the load angle.
              </p>
            </>
          ) : null
        }
        evidence={<Evidence stop={sourceStop} />}
      />

      <div className="stage-tools">
        <button
          type="button"
          className={`stage-tool ${explore ? "is-on" : ""}`}
          onClick={() => setExplore((e) => !e)}
          disabled={!isThree}
          aria-pressed={explore}
          title={isThree ? "Pause the tour and turn the machine yourself" : "Only on 3D beats"}
        >
          <Cube size={13} weight={explore ? "fill" : "regular"} />
          {explore ? "Exit explore" : "Explore"}
        </button>
        <button
          type="button"
          className="stage-tool"
          onClick={() => setPaused((p) => !p)}
          disabled={reducedMotion}
          aria-pressed={paused}
        >
          {paused ? <Play size={13} weight="fill" /> : <Pause size={13} weight="fill" />}
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}
