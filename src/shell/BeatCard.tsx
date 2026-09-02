import { ArrowRight } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { Page, Position } from "../route/structure";
import "./BeatCard.css";

export function BeatCard({
  page,
  positions,
  activeIndex,
  onSelect,
  onUserScroll,
  onNextChapter,
  hasNextChapter,
}: {
  page: Page;
  positions: readonly Position[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onUserScroll: () => void;
  onNextChapter: () => void;
  hasNextChapter: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});
  const lastSelected = useRef(activeIndex);
  const suppressScroll = useRef(false);
  const handleScroll = () => {
    if (suppressScroll.current) return;
    onUserScroll();
  };

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
    const root = scrollRef.current;
    if (root) root.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [positions]);

  useEffect(() => {
    lastSelected.current = activeIndex;
    const node = itemRefs.current[positions[activeIndex]?.beat.id ?? ""];
    if (!node) return;
    suppressScroll.current = true;
    node.scrollIntoView({ block: activeIndex === 0 ? "start" : "nearest" });
    const timer = window.setTimeout(() => { suppressScroll.current = false; }, 180);
    return () => window.clearTimeout(timer);
  }, [activeIndex, positions]);

  return (
    <aside className="beat-card beat-card--left" aria-label={page.title} data-page={page.id}>
      <div className="beat-card__scroll" ref={scrollRef} tabIndex={0} onScroll={handleScroll}>
        {positions.map((position, index) => {
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
              <p className="beat-card__scroll-hint" aria-hidden="true">Scroll to continue <span>↓</span></p>
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

    </aside>
  );
}
