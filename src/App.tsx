import { ArrowRight, Pause, Play } from "@phosphor-icons/react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Diagram } from "./diagrams/Diagrams";
import { Controls } from "./shell/Controls";
import { Evidence } from "./shell/Evidence";
import { BeatCard } from "./shell/BeatCard";
import { ProgressBar } from "./shell/ProgressBar";
import { Landing } from "./pages/Landing";

import { Close } from "./pages/Close";
import { TransitionSlide } from "./components/TransitionSlide";
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

type Action =
  | { type: "next" }
  | { type: "prev" }
  | { type: "go"; index: number };

const positionFromHash = (hash: string): number | "close" | null => {
  const clean = hash.replace(/^#/, "");
  if (!clean || clean === "landing") return null;
  if (clean === "close") return "close";
  const index = BEATS.findIndex((b) => b.beat.id === clean || b.beat.sourceIds.includes(clean));
  if (index !== -1) return index;
  const pageIndex = PAGE_LIST.findIndex((p) => p.id === clean);
  if (pageIndex !== -1) {
    const firstBeat = BEATS.findIndex((b) => b.pageIndex === pageIndex);
    return firstBeat !== -1 ? firstBeat : 0;
  }
  return 0;
};

const initialFromHash = (): { screen: Screen; index: number } => {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const target = positionFromHash(hash);
  if (target === null) return { screen: "landing", index: 0 };
  if (target === "close") return { screen: "close", index: BEATS.length - 1 };
  return { screen: "tour", index: target };
};

const initial = initialFromHash();

const sourceOf = (index: number): { sourceStop: Stop; sourceState: StopState } => {
  const pos = BEATS[index];
  const sourceStop = STOPS.find((s) => s.id === pos.stop.sourceStopId) ?? STOPS[0];
  const sourceState =
    sourceStop.states.find((s) => s.id === pos.beat.sourceIds[0]) ?? sourceStop.states[0];
  return { sourceStop, sourceState };
};

export default function App() {
  const [screen, setScreen] = useState<Screen>(initial.screen);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
  const [cursor, move] = useReducer((state: number, action: Action) => {
    switch (action.type) {
      case "next":
        return Math.min(BEATS.length - 1, state + 1);
      case "prev":
        return Math.max(0, state - 1);
      case "go":
        return Math.max(0, Math.min(BEATS.length - 1, action.index));
    }
  }, initial.index);

  const [controls, patchControls] = useReducer(
    (state: StageControls, patch: Partial<StageControls> | ((c: StageControls) => StageControls)) =>
      typeof patch === "function" ? patch(state) : { ...state, ...patch },
    DEFAULT_CONTROLS,
  );
  const [rotor, setRotor] = useState<RotorId>("ipm-ndfeb");
  const [architecture, setArchitecture] = useState<ArchitectureId>("reduced-hree");
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

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
    patchControls(presetFor(sourceStop.id, sourceState.id));
  }, [cursor, sourceStop.id, sourceState.id]);

  useEffect(() => {
    if (screen === "landing") {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    if (screen === "close") {
      window.history.replaceState(null, "", "#close");
      return;
    }
    const hash = `#${beat.id}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [screen, beat.id]);

  const goBack = useCallback(() => {
    if (transitionTarget !== null) {
      setTransitionTarget(null);
      return;
    }
    if (cursor === 0) {
      setScreen("landing");
      window.history.replaceState(null, "", " ");
      return;
    }
    move({ type: "prev" });
  }, [cursor, transitionTarget]);

  const goNext = useCallback(() => {
    if (transitionTarget !== null) {
      setTransitionTarget(null);
      move({ type: "next" });
      return;
    }
    // Interstitial transition when crossing from vehicle drivetrain to motor teardown
    if (cursor === 1 && BEATS[1]?.stop.sourceStopId === "where-the-motor-lives") {
      setTransitionTarget("open-the-machine");
      return;
    }
    // Interstitial transition when crossing from motor teardown to how it turns
    if (cursor === 2 && BEATS[2]?.stop.sourceStopId === "open-the-machine") {
      setTransitionTarget("how-it-turns");
      return;
    }
    // Interstitial transition when crossing from how it turns to the magnet
    if (BEATS[cursor]?.pageIndex === 1 && BEATS[cursor + 1]?.pageIndex === 2) {
      setTransitionTarget("the-magnet");
      return;
    }
    if (cursor === BEATS.length - 1) {
      setScreen("close");
      window.history.replaceState(null, "", "#close");
      return;
    }
    move({ type: "next" });
  }, [cursor, transitionTarget]);

  const skipPage = useCallback(() => {
    setTransitionTarget(null);
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
      setTransitionTarget(null);
      const index = BEATS.findIndex(
        (p) =>
          p.pageIndex === pageIndex && p.stopIndex === targetStop && p.beatIndex === targetBeat,
      );
      if (index >= 0) move({ type: "go", index });
    },
    [pageIndex],
  );

  const goToPage = useCallback((targetPage: number) => {
    setTransitionTarget(null);
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, goNext, goBack]);

  // In-app moves use replaceState; browser back/forward raises hashchange.
  useEffect(() => {
    const syncFromHash = () => {
      setTransitionTarget(null);
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
          setTransitionTarget(null);
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
          setTransitionTarget(null);
          move({ type: "go", index: BEATS.length - 1 });
          setScreen("tour");
        }}
        onRestart={() => {
          setTransitionTarget(null);
          setScreen("landing");
          window.history.replaceState(null, "", " ");
        }}
      />
    );
  }

  const stage = beat.stage;

  return (
    <div className="app" data-side={page.side}>
      <a className="skip-link" href="#stage">Skip to the stage</a>

      <header className="topbar">
        <div className="topbar__brand">
          <p className="topbar__publisher eyebrow">{PUBLISHER}</p>
          <button
            type="button"
            className="topbar__title nav-link"
            onClick={() => {
              setTransitionTarget(null);
              setScreen("landing");
              window.history.replaceState(null, "", " ");
            }}
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

      {transitionTarget === "open-the-machine" ? (
        <TransitionSlide
          actLabel="Act I · The Machine"
          title="Now, let's open the motor."
          lede="Seven parts convert three alternating phases into pure magnetic rotation."
          onNext={() => {
            setTransitionTarget(null);
            move({ type: "go", index: 2 });
          }}
          nextLabel="Open the machine"
        />
      ) : null}

      {transitionTarget === "how-it-turns" ? (
        <TransitionSlide
          actLabel="Act I · The Machine"
          title="From stationary parts to invisible magnetic forces."
          lede="We've explored every physical part inside the motor. Now let's see how electricity flowing through stationary copper coils makes the rotor turn."
          onNext={() => {
            setTransitionTarget(null);
            move({ type: "go", index: 3 });
          }}
          nextLabel="Enter How It Turns"
        />
      ) : null}

      {transitionTarget === "the-magnet" ? (
        <TransitionSlide
          actLabel="Act II · The Material Core"
          title="Why Neodymium? Opening the Rare-Earth Magnet"
          lede="We saw that permanent magnets pull the rotor with immense torque. But why do EV motors rely on rare-earth elements in the first place? Let's zoom into the crystal lattice of Nd₂Fe₁₄B to see how Iron and Neodymium divide the labour of magnetic power."
          onNext={() => {
            const nextIdx = BEATS.findIndex((b) => b.pageIndex === 2);
            setTransitionTarget(null);
            if (nextIdx >= 0) move({ type: "go", index: nextIdx });
            else move({ type: "next" });
          }}
          nextLabel="Enter The Magnet Lab"
        />
      ) : null}

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
              paused={paused}
              reducedMotion={reducedMotion}
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
              onPatchControls={setControls}
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
