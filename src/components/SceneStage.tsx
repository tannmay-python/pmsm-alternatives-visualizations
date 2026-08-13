import { Pause, Play } from "@phosphor-icons/react";
import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";
import type {
  SceneDefinition,
  StoryChapter,
  StorySignal,
  StoryStep,
  VisualMode,
} from "../types";
import {
  VehicleJourneyVisual,
  type VehicleJourneyStep,
} from "../visuals/vehicle/VehicleJourneyVisual";
import {
  PmsmTurnVisual,
  type PmsmTurnStep,
} from "../visuals/pmsm/PmsmTurnVisual";
import { Chapter3MagnetVisual } from "../visuals/magnet/Chapter3MagnetVisual";
import { chapter3MainRoute } from "../visuals/magnet/chapter3MagnetModel";
import {
  ExposureOptionsVisual,
  type ExposureStep,
} from "../visuals/exposure/ExposureOptionsVisual";
import { Chapter5LabVisual } from "../visuals/chapter5/Chapter5LabVisual";
import { isCoreAlternativeStepId } from "../visuals/chapter5/chapter5Geometry";

const LazyStoryCanvas = lazy(async () => {
  const module = await import("./StoryCanvas");
  return { default: module.StoryCanvas };
});

const vehicleJourneyStepByStoryId: Readonly<Record<string, VehicleJourneyStep>> = {
  "car-transparent-cutaway": "location",
  "power-path-flow": "energy",
  "drive-unit-extract": "extract",
  "motor-isolation": "motor",
};

const pmsmTurnStepByStoryId: Readonly<Record<string, PmsmTurnStep>> = {
  "pmsm-assemble-stator": "assemble",
  "pmsm-three-phase-field": "field",
  "pmsm-rotor-lock": "sync",
  "ipm-rotor-cutaway": "buried",
  "ipm-reluctance-overlay": "torques",
};

const isChapter3MagnetStep = (stepId: string): stepId is (typeof chapter3MainRoute)[number] =>
  chapter3MainRoute.includes(stepId as (typeof chapter3MainRoute)[number]);

const exposureStepByStoryId: Readonly<Record<string, ExposureStep>> = {
  "light-and-heavy-ree-supply": "light-and-heavy-ree-supply",
  "mitigation-ladder": "mitigation-ladder",
  "back-emf-speed-sweep": "back-emf-speed-sweep",
  "field-weakening-current": "field-weakening-current",
  "sync-async-family-tree": "sync-async-family-tree",
  "inverter-fault-at-speed": "inverter-fault-at-speed",
};

type CanvasState = "checking" | "loading" | "ready" | "fallback";

type SceneStageProps = {
  chapter: StoryChapter;
  step: StoryStep;
  scene: SceneDefinition;
  reducedMotion: boolean;
  paused: boolean;
  chapterNumber: number;
  stepNumber: number;
  stepCount: number;
  onTogglePause: () => void;
  onNext: () => void;
};

type CanvasErrorBoundaryProps = {
  children: ReactNode;
  onFailure: () => void;
};

type CanvasErrorBoundaryState = {
  failed: boolean;
};

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  public state: CanvasErrorBoundaryState = { failed: false };

  public static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { failed: true };
  }

  public componentDidCatch() {
    this.props.onFailure();
  }

  public render() {
    return this.state.failed ? null : this.props.children;
  }
}

const supportsWebGl = () => {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
};

const modeLabel: Readonly<Record<VisualMode, string>> = {
  "spatial-map": "Spatial map",
  "exploded-assembly": "Exploded assembly",
  "field-simulation": "Field simulation",
  "material-cross-section": "Material cross-section",
  "causal-flow": "Causal flow",
  "mechanism-lab": "Mechanism laboratory",
  "configuration-builder": "Configuration builder",
  "swap-impact-map": "Swap impact map",
  "evidence-lanes": "Evidence lanes",
};

const stageLens: Readonly<Record<VisualMode, string>> = {
  "spatial-map": "view: system map",
  "exploded-assembly": "view: separated assembly",
  "field-simulation": "view: rotating field",
  "material-cross-section": "view: material section",
  "causal-flow": "view: causal path",
  "mechanism-lab": "view: mechanism comparison",
  "configuration-builder": "view: stackable layers",
  "swap-impact-map": "view: vehicle impact",
  "evidence-lanes": "view: evidence lanes",
};

function GeometryLabels({ elements }: { elements: readonly string[] }) {
  return (
    <div className="geometry-labels" aria-hidden="true">
      {elements.slice(0, 4).map((element, index) => (
        <span key={element} className={`geometry-label geometry-label--${index + 1}`}>
          <i />
          {element}
        </span>
      ))}
    </div>
  );
}

function Blueprint({ scene }: { scene: SceneDefinition }) {
  const common = {
    className: "scene-blueprint",
    viewBox: "0 0 1000 620",
    role: "img",
    "aria-label": scene.accessibilityLabel,
  };

  switch (scene.motif) {
    case "vehicle":
      return (
        <svg {...common}>
          <path className="blueprint-line" d="M116 395C163 278 258 218 390 212h190c127 4 219 53 289 144l-28 57H143z" />
          <path className="blueprint-muted" d="M294 212l67-102h242l93 102" />
          <rect className="blueprint-surface" x="357" y="354" width="282" height="58" rx="8" />
          <circle className="blueprint-ring" cx="258" cy="419" r="74" />
          <circle className="blueprint-ring" cx="742" cy="419" r="74" />
          <circle className="blueprint-copper" cx="269" cy="395" r="28" />
          <circle className="blueprint-copper" cx="731" cy="395" r="28" />
          <path className="blueprint-signal" d="M498 382H681" />
          <path className="blueprint-signal" d="M681 382l-24-16m24 16l-24 16" />
        </svg>
      );
    case "motor":
      return (
        <svg {...common}>
          <circle className="blueprint-ring" cx="500" cy="310" r="202" />
          <circle className="blueprint-muted" cx="500" cy="310" r="154" />
          <circle className="blueprint-surface" cx="500" cy="310" r="108" />
          <circle className="blueprint-ring" cx="500" cy="310" r="66" />
          <path className="blueprint-copper" d="M500 108v70m143-11-45 54m103 89-68 0m10 143-45-54m-98 113v-70m-143 11 45-54m-103-89h68m-10-143 45 54" />
          <path className="blueprint-signal" d="M500 310l116-69" />
          <path className="blueprint-signal" d="M616 241l-17 34m17-34l-39 2" />
          <path className="blueprint-line" d="M470 310h60" />
        </svg>
      );
    case "grain":
      return (
        <svg {...common}>
          <path className="blueprint-grain-shell" d="M222 144l130-48 112 80-13 138-122 61-117-82z" />
          <path className="blueprint-surface" d="M246 160l100-36 88 63-10 108-98 49-91-64z" />
          <path className="blueprint-grain-shell" d="M551 116l132 34 48 124-74 108-132-34-48-124z" />
          <path className="blueprint-surface" d="M565 145l101 26 36 95-56 82-101-26-36-95z" />
          <path className="blueprint-grain-shell" d="M430 366l132-43 107 88-25 135-132 43-107-88z" />
          <path className="blueprint-surface" d="M448 389l101-33 82 67-19 103-101 33-82-67z" />
          <path className="blueprint-signal" d="M217 310h116m328-106 90 88m-294 182 127-43" />
        </svg>
      );
    case "flux":
      return (
        <svg {...common}>
          <path className="blueprint-line" d="M150 310h700" />
          <path className="blueprint-muted" d="M260 310c0-122 130-159 222-159m-222 159c0 122 130 159 222 159" />
          <path className="blueprint-muted" d="M518 151c93 0 222 37 222 159m-222 159c93 0 222-37 222-159" />
          <circle className="blueprint-surface" cx="500" cy="310" r="88" />
          <path className="blueprint-copper" d="M486 236h28v148h-28z" />
          <path className="blueprint-signal" d="M312 310h142m92 0h142" />
          <path className="blueprint-signal" d="M454 310l-22-14m22 14l-22 14m234-14-22-14m22 14l-22 14" />
        </svg>
      );
    case "rotors":
      return (
        <svg {...common}>
          {[210, 410, 610, 810].map((x, index) => (
            <g key={x} transform={`translate(${x} 305)`}>
              <circle className="blueprint-ring" r="105" />
              <circle className={index === 1 ? "blueprint-copper" : "blueprint-surface"} r="66" />
              {index === 0 && <path className="blueprint-copper" d="M-75 0h150M0-75v150" />}
              {index === 1 && <path className="blueprint-line" d="M-42-42L42 42m42-84L-42 42" />}
              {index === 2 && <path className="blueprint-muted" d="M-56-36h112M-56 36h112M-16-64v128" />}
              {index === 3 && <path className="blueprint-line" d="M-70-22h140M-22-70v140" />}
            </g>
          ))}
          <path className="blueprint-signal" d="M145 505h130m70 0h130m70 0h130m70 0h130" />
        </svg>
      );
    case "materials":
      return (
        <svg {...common}>
          <ellipse className="blueprint-ring" cx="500" cy="306" rx="278" ry="118" />
          <ellipse className="blueprint-muted" cx="500" cy="306" rx="210" ry="86" />
          <ellipse className="blueprint-surface" cx="500" cy="306" rx="138" ry="54" />
          <path className="blueprint-copper" d="M322 262l74 37-74 37m356-74-74 37 74 37" />
          <path className="blueprint-signal" d="M500 128v102m0 152v102" />
          <path className="blueprint-line" d="M252 446h496" />
        </svg>
      );
    case "vehicle-change":
      return (
        <svg {...common}>
          <path className="blueprint-muted" d="M119 395C166 278 261 218 390 212h190c126 4 217 53 288 144l-28 57H145z" />
          <rect className="blueprint-muted" x="342" y="355" width="316" height="58" rx="8" />
          <rect className="blueprint-surface" x="690" y="330" width="119" height="86" rx="10" />
          <path className="blueprint-copper" d="M675 353h-93m0 0-30-26m30 26-30 26" />
          <path className="blueprint-signal" d="M709 437v62m33-62v62m33-62v62" />
          <path className="blueprint-line" d="M192 500h616" />
        </svg>
      );
    case "evidence":
      return (
        <svg {...common}>
          <path className="blueprint-line" d="M152 190h696M152 310h696M152 430h696" />
          <path className="blueprint-muted" d="M222 130v360m173-360v360m173-360v360m173-360v360" />
          <circle className="blueprint-surface" cx="282" cy="190" r="20" />
          <circle className="blueprint-copper" cx="466" cy="310" r="20" />
          <circle className="blueprint-signal" cx="645" cy="430" r="20" />
          <path className="blueprint-signal" d="M282 190L466 310 645 430" />
        </svg>
      );
  }
}

function StageSkeleton() {
  return (
    <div className="stage-skeleton" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  );
}

export function SceneStage({
  chapter,
  step,
  scene,
  reducedMotion,
  paused,
  chapterNumber,
  stepNumber,
  stepCount,
  onTogglePause,
  onNext,
}: SceneStageProps) {
  const [canvasState, setCanvasState] = useState<CanvasState>("checking");
  const vehicleJourneyStep = vehicleJourneyStepByStoryId[step.id];
  const pmsmTurnStep = pmsmTurnStepByStoryId[step.id];
  const chapter3MagnetStep = isChapter3MagnetStep(step.id) ? step.id : null;
  const exposureStep = exposureStepByStoryId[step.id];
  const isCoreAlternative = chapter.id === "alternative-motor-laboratory" && isCoreAlternativeStepId(step.id);
  const hasOwnedVisual = Boolean(vehicleJourneyStep || pmsmTurnStep || chapter3MagnetStep || exposureStep || isCoreAlternative);
  const hidesStageChrome = Boolean(exposureStep || isCoreAlternative);
  const signal = useRef<StorySignal>({
    progress: scene.legacyProgress,
    activeChapter: 0,
    reducedMotion,
    fieldPaused: reducedMotion || paused,
    load: 36,
    alternative: step.legacyAlternative ?? "pmsm",
  });

  signal.current.progress = scene.legacyProgress;
  signal.current.activeChapter = Math.round(scene.legacyProgress);
  signal.current.reducedMotion = reducedMotion;
  signal.current.fieldPaused = reducedMotion || paused;
  signal.current.alternative = step.legacyAlternative ?? "pmsm";

  useEffect(() => {
    if (hasOwnedVisual) {
      setCanvasState("fallback");
      return undefined;
    }

    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) setCanvasState(supportsWebGl() ? "loading" : "fallback");
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [hasOwnedVisual]);

  return (
    <section
      className={`visual-stage ${chapter3MagnetStep ? "visual-stage--chapter3" : ""}`}
      data-canvas-state={canvasState}
      data-reduced-motion={reducedMotion || undefined}
      aria-label={`${chapter.content.title}: ${step.content.title}`}
    >
      {isCoreAlternative ? (
        <div className="visual-stage__chapter5-lab">
          <Chapter5LabVisual
            stepId={step.id}
            paused={paused}
            reducedMotion={reducedMotion}
            onNext={onNext}
            onTogglePause={onTogglePause}
          />
        </div>
      ) : vehicleJourneyStep ? (
        <div className="visual-stage__vehicle-journey">
          <VehicleJourneyVisual
            step={vehicleJourneyStep}
            paused={paused}
            reducedMotion={reducedMotion}
            showCopy={false}
          />
        </div>
      ) : pmsmTurnStep ? (
        <div className="visual-stage__pmsm-turn">
          <PmsmTurnVisual
            step={pmsmTurnStep}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        </div>
      ) : chapter3MagnetStep ? (
        <Chapter3MagnetVisual
          step={chapter3MagnetStep}
          paused={paused}
          reducedMotion={reducedMotion}
        />
      ) : exposureStep ? (
        <div className="visual-stage__exposure-options">
          <ExposureOptionsVisual
            stepId={exposureStep}
            paused={paused}
            reducedMotion={reducedMotion}
          />
        </div>
      ) : (
        <>
          <div className="visual-stage__canvas" aria-hidden="true">
            {(canvasState === "checking" || canvasState === "loading") && <StageSkeleton />}
            {canvasState !== "fallback" && (
              <CanvasErrorBoundary onFailure={() => setCanvasState("fallback")}>
                <Suspense fallback={<StageSkeleton />}>
                  <LazyStoryCanvas
                    signal={signal}
                    onReady={() => setCanvasState("ready")}
                  />
                </Suspense>
              </CanvasErrorBoundary>
            )}
          </div>

          <div className="visual-stage__blueprint">
            {scene.asset ? (
              <img
                className="scene-asset"
                src={reducedMotion ? scene.asset.reducedMotionSrc ?? scene.asset.src : scene.asset.src}
                alt={scene.asset.alt}
              />
            ) : (
              <Blueprint scene={scene} />
            )}
          </div>
        </>
      )}

      {!hidesStageChrome && (
        <div className="visual-stage__meta">
          <span>Scene {String(chapterNumber).padStart(2, "0")}.{stepNumber} · {step.content.title}</span>
          <span>{stageLens[step.visualState.mode]}</span>
        </div>
      )}

      {!hasOwnedVisual && <GeometryLabels elements={step.visualState.visibleElements} />}

      {!hidesStageChrome && (
        <div className="visual-stage__transport">
          <button
            type="button"
            className="transport-toggle"
            aria-label={paused ? "Play physical scene" : "Pause physical scene"}
            aria-pressed={paused}
            disabled={reducedMotion}
            onClick={onTogglePause}
          >
            {paused ? <Play size={14} weight="fill" aria-hidden="true" /> : <Pause size={14} weight="fill" aria-hidden="true" />}
          </button>
          <div className="transport-readout">
            <span>{reducedMotion ? "motion frozen" : paused ? "paused" : "playing"}</span>
            <i aria-hidden="true"><b style={{ width: `${(stepNumber / stepCount) * 100}%` }} /></i>
          </div>
          <span className="transport-step">{stepNumber} / {stepCount}</span>
        </div>
      )}

      <p className="sr-only">
        Current visual mode: {modeLabel[step.visualState.mode]}. {step.visualState.visualChange}
      </p>
      {canvasState === "fallback" && !hasOwnedVisual && (
        <p className="visual-stage__fallback-note" role="status">
          WebGL is unavailable. The visual guide remains available.
        </p>
      )}
    </section>
  );
}
