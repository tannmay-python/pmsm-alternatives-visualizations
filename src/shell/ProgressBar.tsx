import type { Page } from "../route/structure";
import "./ProgressBar.css";

export function ProgressBar({
  pages,
  pageIndex,
}: {
  pages: readonly Page[];
  pageIndex: number;
}) {
  const overallProgress = ((pageIndex + 1) / pages.length) * 100;

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
        <span className="progress-bar__readout">Chapter {pageIndex + 1} of {pages.length}</span>
      </div>
    </div>
  );
}
