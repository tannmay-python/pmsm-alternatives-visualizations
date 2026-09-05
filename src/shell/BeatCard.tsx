import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { Page, PageTransition, Position } from "../route/structure";
import "./BeatCard.css";

/**
 * One frame at a time. A wheel tick or a swipe moves exactly one frame, so
 * a trackpad flick cannot skip a frame and the reader never has to find the
 * "right" scroll position. The card holds only the active frame's words.
 */

const STEP_THRESHOLD = 90;
const STEP_COOLDOWN = 650;
const SWIPE_THRESHOLD = 48;

export function BeatCard({
  page,
  positions,
  activeIndex,
  onPrev,
  onNext,
  onNextChapter,
  nextTransition,
  hasNextChapter,
}: {
  page: Page;
  positions: readonly Position[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onNextChapter: () => void;
  nextTransition?: PageTransition;
  hasNextChapter: boolean;
}) {
  const position = positions[activeIndex] ?? positions[0];
  const isLast = activeIndex === positions.length - 1;
  const cardRef = useRef<HTMLElement>(null);
  const wheelSum = useRef(0);
  const lastStep = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const handlers = useRef({ onPrev, onNext });
  handlers.current = { onPrev, onNext };

  useEffect(() => {
    const step = (direction: 1 | -1) => {
      const now = performance.now();
      if (now - lastStep.current < STEP_COOLDOWN) return;
      lastStep.current = now;
      wheelSum.current = 0;
      if (direction > 0) handlers.current.onNext();
      else handlers.current.onPrev();
    };

    const onWheel = (event: WheelEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("[data-scrolls]")) return;
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      event.preventDefault();
      // Within the cooldown the trackpad is still coasting: swallow it.
      if (performance.now() - lastStep.current < STEP_COOLDOWN) return;
      wheelSum.current += event.deltaY;
      if (Math.abs(wheelSum.current) >= STEP_THRESHOLD) step(wheelSum.current > 0 ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStartY.current;
      touchStartY.current = null;
      if (start === null) return;
      const end = event.changedTouches[0]?.clientY ?? start;
      const delta = start - end;
      if (Math.abs(delta) >= SWIPE_THRESHOLD) step(delta > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    const card = cardRef.current;
    card?.addEventListener("touchstart", onTouchStart, { passive: true });
    card?.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      card?.removeEventListener("touchstart", onTouchStart);
      card?.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    // A frame change from any source (wheel, keys, contents) restarts the cooldown
    // so the coasting trackpad cannot immediately push a second step.
    lastStep.current = performance.now();
    wheelSum.current = 0;
  }, [activeIndex, page.id]);

  const nextNumber = String(page.number + 1).padStart(2, "0");

  return (
    <aside className="beat-card" aria-label={page.title} data-page={page.id} ref={cardRef}>
      <article className="chapter-bite" key={position.beat.id} data-beat={position.beat.id}>
        <header className="beat-card__header">
          <h2 className="beat-card__question">{position.stop.question}</h2>
          <h3 className="beat-card__title">{position.beat.label}</h3>
        </header>
        <div className="beat-card__body">
          {position.beat.lines.map((line) => <p key={line}>{line}</p>)}
        </div>
        {isLast ? (
          <div className="beat-card__chapter-end">
            {hasNextChapter && nextTransition ? (
              <>
                <p className="beat-card__chapter-end-label">Next · Chapter {nextNumber}</p>
                <p className="beat-card__chapter-end-lede">{nextTransition.lede}</p>
                <button type="button" className="beat-card__chapter-next" onClick={onNextChapter}>
                  {nextTransition.nextLabel}
                  <ArrowRight size={15} weight="bold" />
                </button>
              </>
            ) : (
              <button type="button" className="beat-card__chapter-next" onClick={onNextChapter}>
                {hasNextChapter ? "Next chapter" : "Finish the walkthrough"}
                <ArrowRight size={15} weight="bold" />
              </button>
            )}
          </div>
        ) : (
          <p className="beat-card__scroll-hint" aria-hidden="true">Scroll to continue <span>↓</span></p>
        )}
      </article>
    </aside>
  );
}
