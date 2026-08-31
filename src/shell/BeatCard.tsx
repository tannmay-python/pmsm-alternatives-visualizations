import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { Page, Position } from "../route/structure";
import { guideFor } from "../route/guide";
import "./BeatCard.css";

export function BeatCard({
  page,
  positions,
  activeIndex,
  onSelect,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  onNextChapter,
  hasNextChapter,
}: {
  page: Page;
  positions: readonly Position[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  onNextChapter: () => void;
  hasNextChapter: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastSelected = useRef(activeIndex);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.index);
        if (Number.isFinite(index) && index !== lastSelected.current) {
          lastSelected.current = index;
          onSelect(index);
        }
      },
      { root, threshold: [0.55, 0.8] },
    );
    Object.values(itemRefs.current).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [onSelect, positions]);

  useEffect(() => {
    lastSelected.current = activeIndex;
    const node = itemRefs.current[positions[activeIndex]?.beat.id ?? ""];
    if (node) node.scrollIntoView({ block: activeIndex === 0 ? "start" : "nearest" });
  }, [activeIndex, positions]);

  return (
    <aside className="beat-card beat-card--left" aria-label={page.title} data-page={page.id}>
      <div className="beat-card__scroll" ref={scrollRef}>
        {positions.map((position, index) => {
          const guide = guideFor(position.stop.sourceStopId, position.beat.sourceIds[0]);
          const isActive = index === activeIndex;
          return (
            <article
              className={`chapter-bite ${isActive ? "is-active" : ""}`}
              data-index={index}
              data-beat={position.beat.id}
              key={position.beat.id}
              ref={(node) => { itemRefs.current[position.beat.id] = node; }}
              onFocus={() => onSelect(index)}
            >
              <header className="beat-card__header">
                <h2 className="beat-card__question">{position.stop.question}</h2>
                <h3 className="beat-card__title">{position.beat.label}</h3>
              </header>
              <div className="beat-card__body">
                {position.beat.lines.map((line) => <p key={line}>{line}</p>)}
              </div>
              <div className="beat-card__takeaway">
                <span className="beat-card__guide-label">Takeaway</span>
                <p>{guide.takeaway}</p>
              </div>
            </article>
          );
        })}
        <div className="beat-card__chapter-end">
          <p className="beat-card__chapter-end-label">Chapter {page.number} complete</p>
          <button type="button" className="beat-card__chapter-next" onClick={onNextChapter}>
            {hasNextChapter ? "Next chapter" : "Finish the walkthrough"}
            <ArrowRight size={15} weight="bold" />
          </button>
        </div>
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
