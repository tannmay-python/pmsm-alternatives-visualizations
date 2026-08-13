import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type WheelEvent,
} from "react";
import { SceneStage } from "./components/SceneStage";
import {
  createInitialStoryState,
  firstPosition,
  getCurrentChapter,
  getCurrentStep,
  getFlatPositions,
  getReducedMotion,
  hashToPosition,
  positionToHash,
  storyReducer,
} from "./state/story-reducer";
import { CHAPTERS, getScene } from "./story/storyRegistry";
import { evidenceCaveat, resolveEvidenceClaims } from "./story/evidence";
import type { ChapterId, StoryPosition } from "./types";

type PanelDrawer = "why" | "evidence" | null;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
};

const chapterLabel = (index: number) => `Chapter ${index + 1}: ${CHAPTERS[index].content.title}`;

function EvidenceLedger({
  claimIds,
  fallback,
}: {
  claimIds: readonly string[];
  fallback: string;
}) {
  const claims = resolveEvidenceClaims(claimIds);

  if (claims.length === 0) {
    return (
      <>
        <h2>Teaching model</h2>
        <p>
          {fallback}
        </p>
      </>
    );
  }

  return (
    <>
      <h2>Evidence ledger</h2>
      <p className="drawer-intro">Each statement carries its scope, status, caveat and source.</p>
      <ol className="evidence-ledger">
        {claims.map(({ claim, sources }) => (
          <li key={claim.id} className="evidence-claim">
            <p className="evidence-claim__statement">{claim.statement}</p>
            <dl className="evidence-claim__meta">
              <div>
                <dt>Status</dt>
                <dd>{claim.evidenceStatus.replaceAll("-", " ")}</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>{claim.qualifier ? `${claim.qualifier} · ` : ""}{claim.denominator}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{claim.date}</dd>
              </div>
              <div>
                <dt>Market</dt>
                <dd>{claim.market.replaceAll("-", " ")}</dd>
              </div>
              {claim.maturity && (
                <div>
                  <dt>Maturity</dt>
                  <dd>{claim.maturity.replaceAll("-", " ")}</dd>
                </div>
              )}
            </dl>
            <p className="evidence-claim__caveat">{evidenceCaveat(claim)}</p>
            {claim.conflict && <p className="evidence-claim__caveat">Correction: {claim.conflict}</p>}
            {claim.renderingPolicy === "show-with-condition" && (
              <p className="evidence-claim__condition">Read with the condition shown above.</p>
            )}
            <ul className="evidence-claim__sources" aria-label={`Sources for ${claim.statement}`}>
              {sources.map((source) => (
                <li key={source.id}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.organisation}: {source.title}
                    </a>
                  ) : (
                    <span>{source.organisation}: {source.title} (supplied notes)</span>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}

function App() {
  const [state, dispatch] = useReducer(
    storyReducer,
    undefined,
    () =>
      createInitialStoryState(
        typeof window === "undefined"
          ? firstPosition()
          : hashToPosition(window.location.hash) ?? firstPosition(),
        typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
  );
  const [panelDrawer, setPanelDrawer] = useState<PanelDrawer>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const wheelAccumulator = useRef(0);
  const wheelResetTimer = useRef<number | null>(null);
  const positions = useMemo(() => getFlatPositions(), []);

  const chapter = getCurrentChapter(state);
  const step = getCurrentStep(state);
  const scene = getScene(step.sceneId);
  const reducedMotion = getReducedMotion(state);
  const positionIndex = positions.findIndex(
    (position) =>
      position.chapterId === state.position.chapterId &&
      position.stepId === state.position.stepId,
  );
  const chapterIndex = CHAPTERS.findIndex((item) => item.id === chapter.id);
  const stepIndex = chapter.steps.findIndex((item) => item.id === step.id);
  const lastPosition = positions.at(-1);
  const hasPrevious = positionIndex > 0;
  const hasNext = positionIndex < positions.length - 1;

  const goTo = (position: StoryPosition) => {
    setPanelDrawer(null);
    dispatch({ type: "go-to", position });
  };

  const goToChapter = (chapterId: ChapterId) => {
    setPanelDrawer(null);
    dispatch({ type: "go-to-chapter", chapterId });
  };

  const goPrevious = () => {
    setPanelDrawer(null);
    dispatch({ type: "previous" });
  };

  const goNext = () => {
    setPanelDrawer(null);
    dispatch({ type: "next" });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      dispatch({ type: "set-system-reduced-motion", reduced: mediaQuery.matches });
    };

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
    return () => {
      delete document.documentElement.dataset.reducedMotion;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const nextHash = positionToHash(state.position);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
    document.title = `${step.content.title} | PMSM Alternatives`;
  }, [state.position, step.content.title]);

  useEffect(() => {
    const readLocation = () => {
      const position = hashToPosition(window.location.hash);
      if (position) {
        setPanelDrawer(null);
        dispatch({ type: "go-to", position });
      }
    };

    window.addEventListener("hashchange", readLocation);
    window.addEventListener("popstate", readLocation);
    return () => {
      window.removeEventListener("hashchange", readLocation);
      window.removeEventListener("popstate", readLocation);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) return;

      if (event.key === "Escape") {
        setPanelDrawer(null);
        return;
      }

      if (document.querySelector("[data-route-lock='true']")) return;

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        setPanelDrawer(null);
        dispatch({ type: "next" });
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setPanelDrawer(null);
        dispatch({ type: "previous" });
      }

      if (event.key === "Home") {
        event.preventDefault();
        setPanelDrawer(null);
        dispatch({ type: "go-to", position: firstPosition() });
      }

      if (event.key === "End" && lastPosition) {
        event.preventDefault();
        setPanelDrawer(null);
        dispatch({ type: "go-to", position: lastPosition });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lastPosition]);

  useEffect(
    () => () => {
      if (wheelResetTimer.current !== null) {
        window.clearTimeout(wheelResetTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (panelDrawer) drawerCloseRef.current?.focus();
  }, [panelDrawer]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (
      panelDrawer ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      window.matchMedia("(max-width: 960px)").matches
    ) {
      return;
    }

    event.preventDefault();
    wheelAccumulator.current += event.deltaY;

    if (wheelResetTimer.current !== null) {
      window.clearTimeout(wheelResetTimer.current);
    }
    wheelResetTimer.current = window.setTimeout(() => {
      wheelAccumulator.current = 0;
    }, 180);

    if (Math.abs(wheelAccumulator.current) < 72) return;

    const direction = wheelAccumulator.current > 0 ? 1 : -1;
    const nextChapter = CHAPTERS[chapterIndex + direction];
    wheelAccumulator.current = 0;

    if (nextChapter) goToChapter(nextChapter.id);
  };

  const drawerTitle = panelDrawer === "why" ? "Why this scene" : "Evidence";
  return (
    <div
      className="experience-shell"
      data-reduced-motion={reducedMotion || undefined}
      onWheel={handleWheel}
    >
      <a className="skip-link" href="#explanation-panel">
        Skip to the explanation
      </a>

      <main className="experience" aria-label="PMSM alternatives visual learning experience">
        <nav className="chapter-rail" aria-label="Chapters">
          <button
            className="rail-mark"
            type="button"
            aria-label="PMSM alternatives, return to the first scene"
            onClick={() => goTo(firstPosition())}
          >
            PM
          </button>

          <ol>
            {CHAPTERS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  title={chapterLabel(index)}
                  aria-label={chapterLabel(index)}
                  aria-current={item.id === chapter.id ? "page" : undefined}
                  onClick={() => goToChapter(item.id)}
                >
                  <i aria-hidden="true" />
                  <span className="sr-only">{chapterLabel(index)}</span>
                </button>
              </li>
            ))}
          </ol>

          <p className="rail-status" aria-live="polite">
            {String(chapterIndex + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
          </p>
        </nav>

        <SceneStage
          chapter={chapter}
          step={step}
          scene={scene}
          reducedMotion={reducedMotion}
          paused={state.stagePaused || reducedMotion}
          chapterNumber={chapterIndex + 1}
          stepNumber={stepIndex + 1}
          stepCount={chapter.steps.length}
          onTogglePause={() => dispatch({ type: "toggle-stage-paused" })}
          onNext={goNext}
        />

        <section
          id="explanation-panel"
          className="explanation-panel"
          aria-labelledby="step-title"
          tabIndex={-1}
        >
          <p className="panel-index" aria-live="polite">
            <span>CH {String(chapterIndex + 1).padStart(2, "0")}</span>
            <i aria-hidden="true" />
            <span>
              {String(stepIndex + 1).padStart(2, "0")} / {String(chapter.steps.length).padStart(2, "0")}
            </span>
          </p>

          <p className="panel-chapter">{chapter.content.title}</p>
          <h1 id="step-title">{step.content.title}</h1>
          <p className="step-question">{step.content.learnerQuestion}</p>
          <p className="step-goal">{step.content.copy.glance}</p>

          <div className="panel-actions" aria-label="Current scene details">
            <button
              type="button"
              aria-expanded={panelDrawer === "why"}
              onClick={() => setPanelDrawer("why")}
            >
              Why?
            </button>
            <button
              type="button"
              aria-expanded={panelDrawer === "evidence"}
              onClick={() => setPanelDrawer("evidence")}
            >
              Evidence
            </button>
          </div>

          <p className="panel-credit">
            Research and visualization by Tannmay Kumarr Baid and Shobhankita Reddy.
          </p>

          <div className="step-navigation" aria-label="Step navigation">
            <button type="button" disabled={!hasPrevious} onClick={goPrevious}>
              <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              Back
            </button>
            <button type="button" disabled={!hasNext} onClick={goNext}>
              Next
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </button>
          </div>

          {panelDrawer && (
            <aside
              className="panel-drawer"
              role="dialog"
              aria-label={`${drawerTitle} for ${step.content.title}`}
            >
              <div className="drawer-heading">
                <p>{drawerTitle}</p>
                <button
                  ref={drawerCloseRef}
                  type="button"
                  aria-label={`Close ${drawerTitle}`}
                  onClick={() => setPanelDrawer(null)}
                >
                  <X size={17} weight="bold" aria-hidden="true" />
                </button>
              </div>

              {panelDrawer === "why" ? (
                <>
                  <h2>Why this scene</h2>
                  <p>{step.content.copy.why}</p>
                </>
              ) : (
                <EvidenceLedger
                  claimIds={step.content.claimIds}
                  fallback={step.content.copy.evidence}
                />
              )}
            </aside>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
