import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { Beat, Page, PageStop } from "../route/structure";
import { guideFor } from "../route/guide";
import "./BeatCard.css";

const SECTION_CONTEXT: Record<string, string> = {
  "where-the-motor-lives": "Macro View · Vehicle Drivetrain",
  "open-the-machine": "Micro View · Inside the Motor",
  "three-coils-one-field": "Electromagnetic Physics · Stator",
  "rotor-locks-to-field": "Torque Physics · Rotor Lock",
  "two-pulls-one-rotor": "Torque Physics · Dual Torque",
  "heat-and-the-patch": "Materials & Limits · Dy / Tb",
  "swap-the-rotor": "Alternatives · Rotor Topologies",
  "change-the-magnet": "Alternatives · Magnet Chemistries",
  "the-shape-of-the-escape": "Strategic Synthesis · EV Segments",
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
  aside,
  evidence,
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
  aside?: ReactNode;
  evidence?: ReactNode;
}) {
  const guide = guideFor(stop.sourceStopId, beat.sourceIds[0]);
  const viewTag = SECTION_CONTEXT[stop.sourceStopId] ?? stop.title;
  const isLastBeatOfStop = beatNumber === beatTotal;

  return (
    <aside className={`beat-card beat-card--${page.side}`} aria-label={stop.title}>
      <header className="beat-card__header">
        <div className="beat-card__eyebrow-row">
          <span className="beat-card__view-tag">{viewTag}</span>
          <span className="beat-card__counter">
            {String(beatNumber).padStart(2, "0")}/{String(beatTotal).padStart(2, "0")}
          </span>
        </div>

        <h2 className="beat-card__question">{stop.question}</h2>
        <h3 className="beat-card__title">{beat.label}</h3>
      </header>

      <div className="beat-card__body">
        {stop.sourceStopId === "open-the-machine" ? (
          <p>
            Pulling the assembly apart reveals two systems: stationary parts (housing, end caps, stator) and rotating parts (rotor, magnets, shaft). Explore each component below to inspect its materials, function, and view it in 3D isolation.
          </p>
        ) : (
          beat.lines.map((line) => <p key={line}>{line}</p>)
        )}
      </div>

      {controls}

      {aside ? <aside className="beat-card__aside">{aside}</aside> : null}

      {stop.sourceStopId !== "open-the-machine" && (
        <dl className="beat-card__guide">
          <div>
            <dt>Look for</dt>
            <dd>{guide.lookFor}</dd>
          </div>
          <div>
            <dt>Takeaway</dt>
            <dd>{guide.takeaway}</dd>
          </div>
        </dl>
      )}

      <div className="beat-card__foot">
        <div className="beat-card__nav">
          <button
            type="button"
            className="btn btn--ghost beat-card__back"
            onClick={onBack}
            disabled={!canGoBack}
          >
            <ArrowLeft size={13} weight="bold" /> Back
          </button>
          <button type="button" className="btn beat-card__next" onClick={onNext} disabled={!canGoNext}>
            {isLastBeatOfStop && stop.sourceStopId === "where-the-motor-lives"
              ? "Open the motor"
              : "Next"}{" "}
            <ArrowRight size={13} weight="bold" />
          </button>
        </div>
      </div>

      {evidence ? <div className="beat-card__evidence">{evidence}</div> : null}
    </aside>
  );
}
