import type { Page } from "../route/structure";
import "./ProgressBar.css";

/**
 * The per-page progress bar.
 *
 * The old tour put all 62 beats on one rail, which the review read correctly
 * as a deterrent: "don't have 30 — no one's starting the walkthrough. Club it
 * into five six pages, each with two three on top… and that progress bar can
 * be clicked on."
 *
 * So the bar shows only the current page's stops. Each segment fills tick by
 * tick as Next walks that stop's beats, and clicking a segment jumps to it.
 * Reaching the end of the last segment advances to the next page.
 */
export function ProgressBar({
  page,
  stopIndex,
  beatIndex,
  onJump,
}: {
  page: Page;
  stopIndex: number;
  beatIndex: number;
  onJump: (stopIndex: number, beatIndex: number) => void;
}) {
  return (
    <div className="progress" role="group" aria-label={`${page.title} progress`}>
      {page.stops.map((stop, i) => {
        const current = i === stopIndex;
        const done = i < stopIndex;
        return (
          <button
            key={stop.id}
            type="button"
            className={`progress__stop ${current ? "is-current" : ""} ${done ? "is-done" : ""}`}
            aria-current={current ? "step" : undefined}
            onClick={() => onJump(i, 0)}
          >
            <span className="progress__label">{stop.title}</span>
            <span className="progress__ticks">
              {stop.beats.map((beat, j) => {
                const on = current && j === beatIndex;
                const past = done || (current && j < beatIndex);
                return (
                  <span
                    key={beat.id}
                    className={`progress__tick ${on ? "is-on" : ""} ${past ? "is-past" : ""}`}
                  />
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
