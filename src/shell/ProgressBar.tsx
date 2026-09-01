import type { Page } from "../route/structure";
import "./ProgressBar.css";

export function ProgressBar({
  pages,
  pageIndex,
  onSelectPage,
}: {
  pages: readonly Page[];
  pageIndex: number;
  onSelectPage: (index: number) => void;
}) {
  const overallProgress = ((pageIndex + 1) / pages.length) * 100;

  return (
    <nav className="progress-bar" aria-label="Walkthrough chapters">
      <span className="progress-bar__hairline" aria-hidden="true">
        <span style={{ width: `${overallProgress}%` }} />
      </span>
      <div className="progress-bar__meta">
        <div className="progress-bar__marks">
          {pages.map((page, index) => (
            <button
              type="button"
              key={page.id}
              className={`progress-bar__mark ${index < pageIndex ? "is-done" : ""} ${index === pageIndex ? "is-current" : ""}`}
              onClick={() => onSelectPage(index)}
              aria-label={`Go to chapter ${index + 1}: ${page.title}`}
              aria-current={index === pageIndex ? "page" : undefined}
            />
          ))}
        </div>
        <span className="progress-bar__readout">Chapter {pageIndex + 1} of {pages.length}</span>
      </div>
    </nav>
  );
}
