import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { Diagram } from "../diagrams/Diagrams";
import { DEFAULT_CONTROLS } from "../stage/controls";
import { landingStop } from "../route/structure";
import { BYLINE, PUBLISHED, PUBLISHER } from "../meta";
import "./Editorial.css";

/**
 * The opening, as one page.
 *
 * This replaces the four-panel carousel that used to run inside a 430px box
 * beside a static hero. The review was unambiguous: "that tiny window where
 * that next next next happens — it's just a poor experience. That can all just
 * be translated into the main content and you just open the dashboard."
 *
 * It also absorbs the six beats of `the-problem`, which said the same four
 * things a second time and which the tour's own entry point skipped past
 * anyway — the old shell jumped straight to the car, so that act was
 * unreachable unless a reader happened to find the act tab.
 */

const FIGURES = [
  {
    value: "70–80%",
    label: "Permanent-magnet share",
    condition: "of EV traction motors, reported",
  },
  {
    value: ">90%",
    label: "Refining concentration",
    condition: "reported Chinese share of rare-earth refining",
  },
  {
    value: "Group 2",
    label: "Dashboard classification",
    condition: "highest-constraint tier, India Critical Minerals Dashboard",
  },
  {
    value: "4 Apr 2025",
    label: "The active gate",
    condition: "China Announcement No. 18 export-licence requirement",
  },
] as const;

export function Landing({ onEnter }: { onEnter: () => void }) {
  const stop = landingStop();
  const [halt, chain, chokepoint, onePart, oneKilogram, realQuestion] = stop.states;

  return (
    <main className="editorial">
      <header className="editorial__masthead">
        <div className="editorial__container">
          <p className="eyebrow">{PUBLISHER}</p>
          <h1 className="editorial__display">
            The rare-earth question, inside <em>one motor</em>
          </h1>
          <p className="editorial__lede">
            An electric car can be finished except for one part of it. This is a walk through that
            part — what the motor does, what the magnet does inside it, which rare earth the April
            2025 notice actually named, and which of the proposed alternatives change the machine
            rather than the marketing.
          </p>
          <dl className="editorial__byline">
            <div>
              <dt>Authors</dt>
              <dd>{BYLINE}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{PUBLISHED}</dd>
            </div>
          </dl>
          <a
            className="editorial__source-link"
            href="https://indiacriticalminerals.com/"
            target="_blank"
            rel="noreferrer"
          >
            Built on the India Critical Minerals Dashboard <ArrowUpRight size={13} weight="bold" />
          </a>
        </div>
      </header>

      {/* Gapless ruled grid — cells carry right and bottom rules, edges stripped. */}
      <section className="editorial__band editorial__band--deep">
        <div className="editorial__container">
          <div className="kpi-grid">
            {FIGURES.map((figure) => (
              <div className="kpi" key={figure.label}>
                <p className="kpi__value num">{figure.value}</p>
                <p className="kpi__label">{figure.label}</p>
                <p className="kpi__condition">{figure.condition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial__band">
        <div className="editorial__container">
          <div className="editorial__split">
            <div>
              <p className="eyebrow">01 · What happened</p>
              <h2 className="editorial__heading">{halt.label}</h2>
              <p className="editorial__prose">{halt.line}</p>
              <p className="editorial__prose">{chain.line}</p>
            </div>
            <aside className="editorial__aside">
              <p>
                The material did not disappear. A licence requirement was enough to hold vehicle
                production on its own, which is what makes this a process dependency rather than a
                reserves problem.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="editorial__band editorial__band--deep">
        <div className="editorial__container">
          <p className="eyebrow">02 · Where the chain narrows</p>
          <h2 className="editorial__heading">{chokepoint.label}</h2>
          <p className="editorial__prose editorial__prose--wide">{chokepoint.line}</p>
          <figure className="editorial__figure">
            <Diagram
              id="supply-concentration"
              stateId={chokepoint.id}
              controls={DEFAULT_CONTROLS}
              architecture="reduced-hree"
            />
            <figcaption>
              Reported shares by industrial stage. Source: India Critical Minerals Dashboard,
              Group 2 assessment.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="editorial__band">
        <div className="editorial__container">
          <div className="editorial__split">
            <div>
              <p className="eyebrow">03 · Where it lands</p>
              <h2 className="editorial__heading">{onePart.label}</h2>
              <p className="editorial__prose">{onePart.line}</p>
              <p className="editorial__prose">{oneKilogram.line}</p>
            </div>
            <aside className="editorial__aside">
              <p>
                Separating chemically similar rare earths is the scarce midstream capability behind
                the upstream headline. Substitution here usually means redesigning the product, not
                changing a supplier.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="editorial__band editorial__band--invert">
        <div className="editorial__container">
          <p className="eyebrow">04 · The question</p>
          <h2 className="editorial__heading editorial__heading--feature">{realQuestion.label}</h2>
          <p className="editorial__prose editorial__prose--wide">{realQuestion.line}</p>
          <button type="button" className="btn btn--accent editorial__cta" onClick={onEnter}>
            Open the motor <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </section>
    </main>
  );
}
