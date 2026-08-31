import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useState, type ReactNode } from "react";
import type { Beat, Page, PageStop } from "../route/structure";
import { guideFor } from "../route/guide";
import "./BeatCard.css";

const DEMO_DURATION_MS = 6000;

const SECTION_CONTEXT: Record<string, string> = {
  "where-the-motor-lives": "Macro view · Vehicle drivetrain",
  "open-the-machine": "Micro view · Inside the motor",
  "three-coils-one-field": "Electromagnetic physics · Stator",
  "rotor-locks-to-field": "Torque physics · Rotor lock",
  "two-pulls-one-rotor": "Torque physics · Dual torque",
  "heat-and-the-patch": "Materials & limits · Dy / Tb",
  "swap-the-rotor": "Alternatives · Rotor topologies",
  "change-the-magnet": "Alternatives · Magnet chemistries",
  "what-must-change": "Strategic synthesis · EV segments",
};

export function BeatCard({
  page,
  stop,
  beat,
  beatNumber,
  beatTotal,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  controls,
  hasControls,
  aside,
  reducedMotion = false,
}: {
  page: Page;
  stop: PageStop;
  beat: Beat;
  beatNumber: number;
  beatTotal: number;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  controls?: ReactNode;
  hasControls?: boolean;
  aside?: ReactNode;
  reducedMotion?: boolean;
}) {
  const guide = guideFor(stop.sourceStopId, beat.sourceIds[0]);
  const [settled, setSettled] = useState(reducedMotion);
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    setControlsOpen(false);
    if (reducedMotion) {
      setSettled(true);
      return undefined;
    }
    setSettled(false);
    const timer = window.setTimeout(() => setSettled(true), DEMO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [beat.id, reducedMotion]);

  return (
    <aside className="beat-card beat-card--left" aria-label={stop.title} data-page={page.id}>
      <div className="beat-card__scroll">
      <header className="beat-card__header">
        <div className="beat-card__eyebrow-row">
          <span className="beat-card__view-tag">{SECTION_CONTEXT[stop.sourceStopId] ?? stop.title}</span>
          <span className="beat-card__counter">
            {String(beatNumber).padStart(2, "0")} / {String(beatTotal).padStart(2, "0")}
          </span>
        </div>
        <h2 className="beat-card__question">{stop.question}</h2>
        <h3 className="beat-card__title">{beat.label}</h3>
      </header>

      <div className="beat-card__body">
        {beat.lines.map((line) => <p key={line}>{line}</p>)}
      </div>

      <div className={`beat-card__guide ${settled ? "is-settled" : "is-watching"}`}>
        {settled ? (
          <div className="beat-card__takeaway">
            <span className="beat-card__guide-label">Takeaway</span>
            <p>{guide.takeaway}</p>
          </div>
        ) : (
          <div className="beat-card__watch">
            <span className="beat-card__guide-label">Watch</span>
            <p>{guide.lookFor}</p>
            <span className="beat-card__watch-line" aria-hidden="true"><span /></span>
          </div>
        )}
      </div>

      {aside ? <aside className="beat-card__aside">{aside}</aside> : null}

      {hasControls && controls ? (
        <div className="beat-card__controls">
          <button
            type="button"
            className="beat-card__controls-toggle"
            aria-expanded={controlsOpen}
            onClick={() => setControlsOpen((open) => !open)}
          >
            {controlsOpen ? "Hide controls" : "Try it yourself"}
          </button>
          {controlsOpen ? <div className="beat-card__controls-panel">{controls}</div> : null}
        </div>
      ) : null}

      </div>
      <div className="beat-card__edge-nav" aria-label="Beat navigation">
        <button type="button" className="beat-card__edge beat-card__edge--prev" onClick={onBack} disabled={!canGoBack} aria-label="Previous beat">
          <ArrowLeft size={16} weight="bold" />
        </button>
        <button type="button" className="beat-card__edge beat-card__edge--next" onClick={onNext} disabled={!canGoNext} aria-label="Next beat">
          <ArrowRight size={16} weight="bold" />
        </button>
      </div>
    </aside>
  );
}
