import { useEffect, useState } from "react";
import "./Opening.css";

const PANELS = [
  {
    eyebrow: "The constraint",
    title: "A car can be finished except for one small part",
    body: "Most EV traction motors are permanent-magnet machines. The reported share is 70–80%, and the magnets on each rotor weigh roughly 1–2 kg. That is the point where a materials decision becomes a factory decision.",
    figure: { value: "70–80%", condition: "of EV traction motors, reported permanent-magnet share" },
  },
  {
    eyebrow: "The bottleneck",
    title: "The hard part starts after the mine",
    body: "Rare earths occur together and behave alike. Separating them takes multi-stage solvent extraction, then sintering into NdFeB magnets. That midstream capability, not ore in the ground, is the narrow part of the chain.",
    figure: { value: ">90%", condition: "reported Chinese share of rare-earth refining" },
  },
  {
    eyebrow: "Dashboard Group 2",
    title: "These are among the hardest minerals to diversify",
    body: "The India Critical Minerals Dashboard places heavy rare earths in Group 2 because reserve concentration, refining concentration and extraction complexity all sit near the top of its scale. Substitution usually means redesigning the product.",
    figure: { value: "Group 2", condition: "highest-constraint minerals in the India Critical Minerals Dashboard" },
  },
  {
    eyebrow: "The active gate",
    title: "In April 2025, paperwork became the constraint",
    body: "China placed listed medium and heavy rare-earth items under export licence. The dashboard records Western prices tripling within weeks and Indian automotive and EV manufacturers among the first licence refusals.",
    figure: { value: "4 Apr 2025", condition: "China Announcement No. 18 export-licence requirement" },
  },
] as const;

export function Opening({ onEnter }: { onEnter: () => void }) {
  const [panel, setPanel] = useState(0);
  const current = PANELS[panel];
  const isLast = panel === PANELS.length - 1;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLast) onEnter();
        else setPanel((value) => Math.min(PANELS.length - 1, value + 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPanel((value) => Math.max(0, value - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLast, onEnter]);

  return (
    <main className="opening" aria-label="Why this motor matters">
      <section className="opening__story">
        <p className="opening__eyebrow">The rare-earth question</p>
        <h1 className="opening__title">
          One kilogram of material sits between a finished EV and a stopped line.
        </h1>
        <p className="opening__summary">
          This is not a story about every mineral. It is about the small magnet that makes a
          traction motor compact, responsive and efficient — and the unusually narrow supply
          chain that makes it.
        </p>

        <a
          className="opening__dashboard"
          href="https://indiacriticalminerals.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open the India Critical Minerals Dashboard
        </a>
      </section>

      <section className="opening__panel" aria-live="polite">
        <p className="opening__panel-eyebrow">{current.eyebrow}</p>
        <h2 className="opening__panel-title">{current.title}</h2>
        <p className="opening__body">{current.body}</p>

        <div className="opening__figure">
          <strong className="num">{current.figure.value}</strong>
          <span>{current.figure.condition}</span>
          <span className="opening__source">
            Framing and figures: India Critical Minerals Dashboard
          </span>
        </div>

        <div className="opening__navigation">
          <div className="opening__dots" role="tablist" aria-label="Opening argument">
            {PANELS.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                role="tab"
                aria-selected={index === panel}
                className={index === panel ? "is-on" : ""}
                onClick={() => setPanel(index)}
              >
                <span className="sr-only">{item.eyebrow}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="opening__next"
            onClick={() => (isLast ? onEnter() : setPanel(panel + 1))}
          >
            {isLast ? "Open the motor question" : "Next"}
          </button>
        </div>
      </section>
    </main>
  );
}
