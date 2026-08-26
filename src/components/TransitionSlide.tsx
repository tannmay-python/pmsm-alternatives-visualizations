import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import "./TransitionSlide.css";

export type TransitionSlideProps = {
  actLabel?: string;
  title?: string;
  lede?: string;
  onNext: () => void;
  onPrev?: () => void;
  nextLabel?: string;
};

export function TransitionSlide({
  actLabel = "Act I · The Machine",
  title = "Now, let's open the motor.",
  lede = "Seven parts convert three-phase electricity into mechanical rotation.",
  onNext,
  nextLabel = "Open the machine",
}: TransitionSlideProps) {
  const [exiting, setExiting] = useState(false);

  const handleProceed = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      onNext();
    }, 280);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleProceed();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      className={`transition-slide ${exiting ? "transition-slide--exiting" : ""}`}
      onClick={handleProceed}
      role="button"
      tabIndex={0}
      aria-label="Click to open the machine"
    >
      <div className="transition-slide__content" onClick={(e) => e.stopPropagation()}>
        <p className="transition-slide__act eyebrow">{actLabel}</p>
        <h2 className="transition-slide__title">{title}</h2>
        <p className="transition-slide__lede">{lede}</p>

        <div className="transition-slide__action">
          <button
            type="button"
            className="transition-slide__btn"
            onClick={handleProceed}
          >
            {nextLabel} <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
