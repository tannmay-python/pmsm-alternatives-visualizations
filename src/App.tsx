import { X } from "@phosphor-icons/react";
import { Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Diagram } from "./diagrams/Diagrams";
import { TakshashilaLogo } from "./components/TakshashilaLogo";
import { BeatCard } from "./shell/BeatCard";
import { ProgressBar } from "./shell/ProgressBar";
import { Landing } from "./pages/Landing";
import { STOPS, type Stop, type StopState } from "./route/route";
import { BEATS, PAGE_LIST } from "./route/structure";
import { presetFor } from "./route/presets";
import { DEFAULT_CONTROLS, type StageControls } from "./stage/controls";
import type { RotorId } from "./stage/rotors/registry";
import type { ArchitectureId } from "./models/swapBurden";
import "./design/tokens.css";
import "./shell/Shell.css";

const Stage = lazy(() => import("./stage/Stage").then((m) => ({ default: m.Stage })));

type Screen = "landing" | "tour" | "close";
type Action = { type: "next" } | { type: "prev" } | { type: "go"; index: number };

const positionFromHash = (hash: string): number | "close" | null => {
  const clean = hash.replace(/^#/, "");
  if (!clean || clean === "landing") return null;
  if (clean === "close") return "close";
  const index = BEATS.findIndex((b) => b.beat.id === clean || b.beat.sourceIds.includes(clean));
  if (index !== -1) return index;
  const pageIndex = PAGE_LIST.findIndex((p) => p.id === clean);
  if (pageIndex !== -1) return BEATS.findIndex((b) => b.pageIndex === pageIndex);
  return 0;
};

const initialFromHash = (): { screen: Screen; index: number } => {
  const target = typeof window !== "undefined" ? positionFromHash(window.location.hash) : null;
  if (target === null) return { screen: "landing", index: 0 };
  if (target === "close") return { screen: "close", index: BEATS.length - 1 };
  return { screen: "tour", index: target };
};

const sourceOf = (index: number): { sourceStop: Stop; sourceState: StopState } => {
  const pos = BEATS[index];
  const sourceStop = STOPS.find((s) => s.id === pos.stop.sourceStopId) ?? STOPS[0];
  const sourceState = sourceStop.states.find((s) => s.id === pos.beat.sourceIds[0]) ?? sourceStop.states[0];
  return { sourceStop, sourceState };
};

function TourEnd({ onRestart, onBack }: { onRestart: () => void; onBack: () => void }) {
  const finalState = STOPS.find((stop) => stop.id === "what-must-change")?.states.at(-1);
  return (
    <main className="tour-end" aria-labelledby="tour-end-title">
      <div className="tour-end__content">
        <p className="eyebrow">End of the walkthrough · {PAGE_LIST.length} of {PAGE_LIST.length} chapters</p>
        <h1 id="tour-end-title">You have seen the whole argument</h1>
        <p>{finalState?.line}</p>
        <div className="tour-end__actions">
          <button type="button" className="tour-end__restart" onClick={onRestart}>Start again</button>
          <button type="button" className="tour-end__back" onClick={onBack}>← Back</button>
        </div>
      </div>
    </main>
  );
}

function ContentsOverlay({
  pageIndex,
  onClose,
  onJump,
}: {
  pageIndex: number;
  onClose: () => void;
  onJump: (index: number) => void;
}) {
  return (
    <div className="contents-overlay" role="dialog" aria-modal="true" aria-labelledby="contents-title">
      <div className="contents-overlay__panel">
        <header>
          <div>
            <p className="eyebrow">The walkthrough</p>
            <h2 id="contents-title">Contents</h2>
          </div>
          <button type="button" className="contents-overlay__close" onClick={onClose}>Close <X size={14} /></button>
        </header>
        <div className="contents-overlay__chapters">
          {PAGE_LIST.map((page, index) => {
            const status = index < pageIndex ? "Read" : index === pageIndex ? "You are here" : "Ahead";
            return (
              <button
                key={page.id}
                type="button"
                className={`contents-overlay__chapter ${index === pageIndex ? "is-current" : ""}`}
                onClick={() => onJump(index)}
              >
                <span className="contents-overlay__chapter-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="contents-overlay__chapter-copy">
                  <strong>{page.title}</strong>
                  <span>{page.stops.flatMap((stop) => stop.beats.map((beat) => beat.label)).join(" · ")}</span>
                </span>
                <span className="contents-overlay__status">{status}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const initial = useMemo(initialFromHash, []);
  const [screen, setScreen] = useState<Screen>(initial.screen);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [cursor, move] = useReducer((state: number, action: Action) => {
    if (action.type === "next") return Math.min(BEATS.length - 1, state + 1);
    if (action.type === "prev") return Math.max(0, state - 1);
    return Math.max(0, Math.min(BEATS.length - 1, action.index));
  }, initial.index);
  const [controls, patchControls] = useReducer(
    (state: StageControls, patch: Partial<StageControls> | ((c: StageControls) => StageControls)) =>
      typeof patch === "function" ? patch(state) : { ...state, ...patch },
    DEFAULT_CONTROLS,
  );
  const [rotor, setRotor] = useState<RotorId>("ipm-ndfeb");
  const [architecture, setArchitecture] = useState<ArchitectureId>("reduced-hree");
  const [reducedMotion, setReducedMotion] = useState(false);
  const autoplayToken = useRef(0);
  const userInteracted = useRef(false);

  const position = BEATS[cursor];
  const { page, stop, beat, pageIndex } = position;
  const { sourceStop, sourceState } = useMemo(() => sourceOf(cursor), [cursor]);
  const chapterBeats = useMemo(() => BEATS.filter((item) => item.pageIndex === pageIndex), [pageIndex]);
  const chapterBeatIndex = Math.max(0, chapterBeats.findIndex((item) => item.beat.id === beat.id));
  const selectChapterBeat = useCallback((index: number) => {
    const target = chapterBeats[index];
    const globalIndex = target ? BEATS.indexOf(target) : -1;
    if (globalIndex >= 0 && globalIndex !== cursor) move({ type: "go", index: globalIndex });
  }, [chapterBeats, cursor]);

  const setControls = useCallback((patch: Partial<StageControls>) => {
    userInteracted.current = true;
    autoplayToken.current += 1;
    patchControls((current) => ({ ...current, ...patch }));
  }, []);

  const markUserScroll = useCallback(() => {
    userInteracted.current = true;
    autoplayToken.current += 1;
  }, []);

  useEffect(() => {
    document.title = "The rare-earth question, inside one motor";
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (screen !== "tour") return undefined;
    autoplayToken.current += 1;
    const token = autoplayToken.current;
    const target = presetFor(sourceStop.id, sourceState.id);
    if (reducedMotion || userInteracted.current) {
      patchControls(target);
      return undefined;
    }
    // Discrete scene choices land immediately; numeric values then travel
    // through the six-second demo so the frame starts on the right lesson.
    patchControls({
      ...DEFAULT_CONTROLS,
      isolate: target.isolate,
      activePhase: target.activePhase,
      fieldLive: target.fieldLive,
      extract: target.extract,
    });
    const numericKeys: Array<keyof StageControls> = ["angle", "load", "heat", "dysprosium", "diffusion", "nucleation", "weakening", "explode"];
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (autoplayToken.current !== token) return;
      const t = Math.min(1, (now - started) / 6000);
      const eased = 1 - Math.pow(1 - t, 3);
      const patch = Object.fromEntries(numericKeys.map((key) => [key, Number(DEFAULT_CONTROLS[key] ?? 0) + (Number(target[key] ?? 0) - Number(DEFAULT_CONTROLS[key] ?? 0)) * eased])) as Partial<StageControls>;
      patchControls(patch);
      if (t < 1) frame = requestAnimationFrame(tick);
      else patchControls(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [screen, sourceStop.id, sourceState.id, reducedMotion]);

  useEffect(() => {
    if (screen === "landing") window.history.replaceState(null, "", window.location.pathname);
    else if (screen === "close") window.history.replaceState(null, "", "#close");
    else if (window.location.hash !== `#${beat.id}`) window.history.replaceState(null, "", `#${beat.id}`);
  }, [screen, beat.id]);

  const goBack = useCallback(() => {
    if (contentsOpen) { setContentsOpen(false); return; }
    if (screen === "close") { setScreen("tour"); return; }
    if (cursor === 0) { setScreen("landing"); return; }
    move({ type: "prev" });
  }, [contentsOpen, cursor, screen]);

  const goNext = useCallback(() => {
    if (cursor === BEATS.length - 1) { setScreen("close"); return; }
    move({ type: "next" });
  }, [cursor]);

  const goNextChapter = useCallback(() => {
    userInteracted.current = false;
    const next = BEATS.findIndex((item) => item.pageIndex === pageIndex + 1);
    if (next >= 0) move({ type: "go", index: next });
    else setScreen("close");
  }, [pageIndex]);

  const goToPage = useCallback((targetPage: number) => {
    const index = BEATS.findIndex((item) => item.pageIndex === targetPage);
    if (index < 0) return;
    setContentsOpen(false);
    setScreen("tour");
    userInteracted.current = false;
    move({ type: "go", index });
  }, []);

  useEffect(() => {
    if (screen !== "tour") return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.key === "ArrowRight" || event.key === "Enter") { event.preventDefault(); goNext(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goBack(); }
      if (event.key === "Escape") setContentsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goNext, screen]);

  if (screen === "landing") {
    return <Landing onEnter={() => { userInteracted.current = false; move({ type: "go", index: 0 }); setScreen("tour"); }} />;
  }

  if (screen === "close") {
    return <TourEnd onRestart={() => { setScreen("landing"); move({ type: "go", index: 0 }); }} onBack={() => setScreen("tour")} />;
  }

  const stage = beat.stage;
  return (
    <div className="app" data-side="left">
      <a className="skip-link" href="#stage">Skip to the stage</a>
      <header className="topbar">
        <a className="topbar__brand" href="https://takshashila.org.in/" target="_blank" rel="noreferrer" aria-label="The Takshashila Institution">
          <TakshashilaLogo className="topbar__logo" height={65} />
        </a>
        <div className="topbar__progress">
          <ProgressBar pages={PAGE_LIST} pageIndex={pageIndex} />
          <button type="button" className="contents-button" onClick={() => setContentsOpen(true)}>Contents</button>
        </div>
      </header>

      {contentsOpen ? <ContentsOverlay pageIndex={pageIndex} onClose={() => setContentsOpen(false)} onJump={goToPage} /> : null}

      <section className="stage-layer" id="stage" aria-label={stop.title}>
        {stage.kind === "three" ? (
          <Suspense fallback={<div className="stage stage--loading"><p>{beat.label}</p></div>}>
            <Stage
              stop={sourceStop}
              state={sourceState}
              controls={controls}
              rotor={rotor}
              paused={false}
              reducedMotion={reducedMotion}
              side="left"
            />
          </Suspense>
        ) : (
          <div className="stage-diagram stage-diagram--left">
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
                const map: Record<string, RotorId> = { pmsm: "ipm-ndfeb", induction: "squirrel-cage", wound: "wound", synrm: "synrm", srm: "srm" };
                if (map[id]) setRotor(map[id]);
              }}
            />
          </div>
        )}
      </section>

      <BeatCard
        key={page.id}
        page={page}
        positions={chapterBeats}
        activeIndex={chapterBeatIndex}
        onSelect={selectChapterBeat}
        onUserScroll={markUserScroll}
        onNextChapter={goNextChapter}
        hasNextChapter={pageIndex < PAGE_LIST.length - 1}
      />
    </div>
  );
}
