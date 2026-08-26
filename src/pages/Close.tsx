import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react";
import { Diagram } from "../diagrams/Diagrams";
import { DEFAULT_CONTROLS } from "../stage/controls";
import { closeStop } from "../route/structure";
import { BYLINE, DASHBOARD_URL, PUBLISHED, PUBLISHER } from "../meta";
import { sources } from "../content/sources";
import type { EvidenceSource } from "../content/schema";
import "./Editorial.css";
import "./Close.css";

/**
 * The close.
 *
 * `what-must-change` drew the same `swap-burden` figure six times without
 * changing it, which is the clearest case in the old tour of a beat existing
 * because there was another sentence rather than another picture. It reads far
 * better as an editorial close: one figure, the argument in full, and the
 * sources under it.
 */
export function Close({ onBack, onRestart }: { onBack: () => void; onRestart: () => void }) {
  const stop = closeStop();
  const [survivors, burden, spectrum, validation, twoMarkets, whereWeAre] = stop.states;

  // Only sources a reader can actually follow. The internal due-diligence
  // notes stay in the evidence drawer, where they are labelled as such.
  // `sources` is declared `as const`, so it widens here to reach the optional
  // url field the literal type drops.
  const cited = (sources as readonly EvidenceSource[]).filter((s) => s.url).slice(0, 8);

  return (
    <main className="editorial">
      <header className="editorial__masthead">
        <div className="editorial__container">
          <p className="eyebrow">{PUBLISHER} · Conclusion</p>
          <h1 className="editorial__display">
            What actually has to <em>change</em>
          </h1>
          <p className="editorial__lede">{stop.question}</p>
        </div>
      </header>

      <section className="editorial__band">
        <div className="editorial__container">
          <div className="editorial__split">
            <div>
              <p className="eyebrow">01 · What carries over</p>
              <h2 className="editorial__heading">{survivors.label}</h2>
              <p className="editorial__prose">{survivors.line}</p>
              <p className="editorial__prose">{spectrum.line}</p>
            </div>
            <aside className="editorial__aside">
              <p>{burden.line}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="editorial__band editorial__band--deep">
        <div className="editorial__container">
          <p className="eyebrow">02 · How much has to change</p>
          <h2 className="editorial__heading">Not all swaps are the same size</h2>
          <figure className="editorial__figure">
            <Diagram
              id="swap-burden"
              stateId={spectrum.id}
              controls={DEFAULT_CONTROLS}
              architecture="reduced-hree"
            />
            <figcaption>
              Change burden by architecture, on a teaching scale rather than a measured index.
              Source: Takshashila due-diligence assessment, August 2026.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="editorial__band">
        <div className="editorial__container">
          <div className="editorial__split">
            <div>
              <p className="eyebrow">03 · The runway</p>
              <h2 className="editorial__heading">{validation.label}</h2>
              <p className="editorial__prose">{validation.line}</p>
            </div>
            <aside className="editorial__aside">
              <p>{twoMarkets.line}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="editorial__band editorial__band--invert">
        <div className="editorial__container">
          <p className="eyebrow">04 · Where this stands</p>
          <h2 className="editorial__heading editorial__heading--feature">{whereWeAre.label}</h2>
          <p className="editorial__prose editorial__prose--wide">{whereWeAre.line}</p>
          <div className="close__actions">
            <button type="button" className="btn btn--accent" onClick={onRestart}>
              Start again
            </button>
            <button type="button" className="btn btn--ghost close__ghost" onClick={onBack}>
              <ArrowLeft size={13} weight="bold" /> Back to the tour
            </button>
          </div>
        </div>
      </section>

      <footer className="close__footer">
        <div className="editorial__container">
          <div className="close__footer-grid">
            <div>
              <p className="close__wordmark">{PUBLISHER}</p>
              <p className="close__tagline">
                Independent research on India&rsquo;s strategic and technology policy.
              </p>
              <a className="close__dashboard" href={DASHBOARD_URL} target="_blank" rel="noreferrer">
                India Critical Minerals Dashboard <ArrowUpRight size={12} weight="bold" />
              </a>
            </div>
            <div>
              <p className="close__col-head">Authors</p>
              <p className="close__col-item">{BYLINE}</p>
              <p className="close__col-head close__col-head--spaced">Published</p>
              <p className="close__col-item">{PUBLISHED}</p>
            </div>
            <div className="close__sources">
              <p className="close__col-head">Selected sources</p>
              <ol>
                {cited.map((source) => (
                  <li key={source.id}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}
                    {source.organisation ? <span>, {source.organisation}</span> : null}
                    {source.date ? <span>, {source.date}</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
