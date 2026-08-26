import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import type { Beat, Page, PageStop } from "../route/structure";
import { guideFor } from "../route/guide";
import "./BeatCard.css";

/**
 * The reading box.
 *
 * This replaces the fixed 372px side rail. The rail put the machine in a
 * chunky square with dead space beside it and split the reader's attention in
 * two; the review was blunt about it — "this side panel is a poor idea", and
 * of the old build, "it's only the motor on the page, nothing else, just the
 * motor and the labels, the side panel disappears entirely, so that gives a
 * lot more focus."
 *
 * So the scene is full-bleed and this floats over it, alternating sides page
 * to page while the canvas shifts the other way. Takshashila-corrected from
 * the old build's frosted panel: same translucency and blur, but a hairline
 * border and no radius, because the design language draws structure with rules
 * rather than rounded cards.
 */
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
  /** Sliders and pickers for this beat, when it has any. */
  controls?: ReactNode;
  /** A how-to-read note, for beats whose figure needs one. */
  aside?: ReactNode;
  evidence?: ReactNode;
}) {
  // Merged beats fold several states into one, so the guide is looked up
  // against the first source state — the one whose label the beat carries.
  const guide = guideFor(stop.sourceStopId, beat.sourceIds[0]);

  return (
    <aside className={`beat-card beat-card--${page.side}`} aria-label={stop.title}>
      <p className="beat-card__eyebrow eyebrow">
        {stop.title} · {String(beatNumber).padStart(2, "0")}/{String(beatTotal).padStart(2, "0")}
      </p>

      <h2 className="beat-card__title">{beat.label}</h2>

      {/*
        Merged beats carry every line they came from. This is what fixes the
        thinness the review flagged — "too little content per beat, it feels
        very stretched out" — without cutting a word.
      */}
      <div className="beat-card__body">
        {beat.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      {/* Controls renders an empty container on beats that have none; the
          stylesheet hides it rather than drawing a rule around nothing. */}
      {controls}

      {aside ? <aside className="beat-card__aside">{aside}</aside> : null}

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

      <div className="beat-card__foot">
        <p className="beat-card__question">{stop.question}</p>
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
            Next <ArrowRight size={13} weight="bold" />
          </button>
        </div>
      </div>

      {evidence ? <div className="beat-card__evidence">{evidence}</div> : null}
    </aside>
  );
}
