import type { Page } from "../route/structure";
import "./ProgressBar.css";

export function ProgressBar({
  pages,
  pageIndex,
  beatIndex,
  beatTotal,
}: {
  pages: readonly Page[];
  pageIndex: number;
  beatIndex: number;
  beatTotal: number;
}) {
  const currentPage = pages[pageIndex];
  const chapterProgress = currentPage ? (beatIndex + 1) / currentPage.beatCount : 0;
  const overallProgress = ((pageIndex + chapterProgress) / pages.length) * 100;

  return (
    <div className="progress-bar" aria-label="Walkthrough progress">
      <span className="progress-bar__hairline" aria-hidden="true">
        <span style={{ width: `${overallProgress}%` }} />
      </span>
      <div className="progress-bar__meta">
        <div className="progress-bar__marks" aria-hidden="true">
          {pages.map((page, index) => (
            <span
              key={page.id}
              className={`progress-bar__mark ${index < pageIndex ? "is-done" : ""} ${index === pageIndex ? "is-current" : ""}`}
            />
          ))}
        </div>
        <span className="progress-bar__readout">
          Chapter {pageIndex + 1} of {pages.length} · Step {beatIndex + 1} of {beatTotal}
        </span>
      </div>
    </div>
  );
}
