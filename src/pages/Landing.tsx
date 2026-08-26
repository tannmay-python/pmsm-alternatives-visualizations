import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Diagram } from "../diagrams/Diagrams";
import { DEFAULT_CONTROLS } from "../stage/controls";
import { TakshashilaLogo } from "../components/TakshashilaLogo";
import {
  AUTHORS,
  DASHBOARD_URL,
  MINERALPOLITIK_URL,
} from "../meta";
import "./Landing.css";

const SLIDE_COUNT = 6;

const SLIDE_TITLES = [
  "Premise",
  "Magnets",
  "Policy Group",
  "Refining",
  "Export Controls",
  "Open Motor",
] as const;

function AuthorList() {
  return (
    <p className="opening__authors" aria-label="Authors">
      <span className="opening__by">By</span>{" "}
      {AUTHORS.map((author, index) => (
        <span key={author.name} className="opening__author">
          <a href={author.url} target="_blank" rel="noreferrer">
            {author.name}
          </a>
          {index < AUTHORS.length - 2 ? ", " : index === AUTHORS.length - 2 ? ", and " : ""}
        </span>
      ))}
    </p>
  );
}

function PremiseSlide() {
  return (
    <section className="opening__slide opening__slide--premise" aria-labelledby="opening-title">
      <div className="opening__copy">
        <p className="eyebrow">The Takshashila Institution · Mineralpolitik</p>
        <h1 id="opening-title" className="opening__title">
          The rare-earth question, inside <em>one motor</em>
        </h1>
        <p className="opening__lead">
          An electric vehicle depends on its traction motor to turn electricity into movement.
          Most EV traction motors use permanent magnets that contain rare earths. Some magnet
          grades also use the heavy rare earths dysprosium and terbium.
        </p>
        <p className="opening__body">
          That puts a supply-chain vulnerability inside the drive unit. This visualisation
          explains which rare earths are used, why the motor needs them, how the magnet works
          inside the motor, and what can reduce the dependency.
        </p>
        <AuthorList />
      </div>

      <div className="opening__formula-card" aria-label="NdFeB Chemical Formulation">
        <div className="opening__card-header">
          <span className="opening__card-tag">Chemical Formulation</span>
          <span className="opening__formula-notation">Nd₂Fe₁₄B</span>
        </div>

        <div className="opening__formula-grid">
          <div className="opening__element-tile">
            <span className="opening__element-num">60</span>
            <strong className="opening__element-sym">Nd</strong>
            <span className="opening__element-name">Neodymium</span>
            <span className="opening__element-role">Light Rare Earth · Magnetic Flux</span>
          </div>
          <div className="opening__element-tile">
            <span className="opening__element-num">26</span>
            <strong className="opening__element-sym">Fe</strong>
            <span className="opening__element-name">Iron</span>
            <span className="opening__element-role">Transition Metal · Matrix Body</span>
          </div>
          <div className="opening__element-tile">
            <span className="opening__element-num">5</span>
            <strong className="opening__element-sym">B</strong>
            <span className="opening__element-name">Boron</span>
            <span className="opening__element-role">Metalloid · Lattice Stability</span>
          </div>
        </div>

        <div className="opening__dopants-strip">
          <div className="opening__dopants-badge">High-Temp Dopants</div>
          <div className="opening__dopants-info">
            <p>
              <strong>Dy (66) &amp; Tb (65)</strong> · Heavy Rare Earths
            </p>
            <p className="opening__dopants-sub">
              Added in high-temperature grades (up to 4–9%) to preserve magnetic coercivity and prevent demagnetisation under operating heat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MagnetSlide() {
  return (
    <section className="opening__slide" aria-labelledby="magnet-title">
      <div className="opening__copy">
        <p className="eyebrow">The material inside the motor</p>
        <h2 id="magnet-title" className="opening__heading">Which rare earths are in the motor?</h2>
        <p className="opening__lead">
          A permanent magnet produces and retains its own magnetic field without needing a
          continuous electrical supply to create that field.
        </p>
        <p className="opening__body">
          EV traction motors commonly use neodymium-iron-boron, or NdFeB, magnets. Neodymium and
          praseodymium form the main rare-earth input. Dysprosium and terbium are used in some
          high-temperature grades to help the magnet resist demagnetisation.
        </p>
      </div>

      <div className="opening__magnet-card" aria-label="Reported permanent-magnet share and rare-earth roles">
        <div className="opening__stat-banner">
          <span className="opening__card-tag">Market Adoption</span>
          <div className="opening__stat-main">
            <strong className="opening__stat-num num">70–80%</strong>
            <span className="opening__stat-desc">
              reported share of passenger EV traction motors that use permanent-magnet machines (PMSMs)
            </span>
          </div>
        </div>

        <div className="opening__role-grid">
          <div className="opening__role-item">
            <div className="opening__role-head">
              <strong className="opening__role-sym">Nd / Pr</strong>
              <span className="opening__role-class">Light REEs</span>
            </div>
            <p className="opening__role-label">Neodymium &amp; Praseodymium</p>
            <p className="opening__role-text">
              The primary magnetic input providing high flux density and compact motor packaging.
            </p>
          </div>

          <div className="opening__role-item">
            <div className="opening__role-head">
              <strong className="opening__role-sym">Dy / Tb</strong>
              <span className="opening__role-class">Heavy REEs</span>
            </div>
            <p className="opening__role-label">Dysprosium &amp; Terbium</p>
            <p className="opening__role-text">
              Critical dopants used to preserve coercivity and prevent demagnetisation above 150°C.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function GroupSlide() {
  return (
    <section className="opening__slide" aria-labelledby="group-title">
      <div className="opening__copy">
        <p className="eyebrow">India Critical Minerals Dashboard · Group 2</p>
        <h2 id="group-title" className="opening__heading">Why these minerals sit together</h2>
        <p className="opening__lead">
          In the India Critical Minerals Dashboard, we assessed each mineral separately. The rare
          earths used in EV magnets, especially dysprosium and terbium, repeatedly showed the same
          pattern of exposure. That is why they can be treated as one policy group.
        </p>
        <p className="opening__body">
          This is the tightest group in the dataset, and the one where India&apos;s exposure is most
          acute and its options fewest. Every member scores at or near the maximum on refining
          concentration, reserve concentration and extraction complexity.
        </p>
        <a className="opening__text-link" href={DASHBOARD_URL} target="_blank" rel="noreferrer">
          Open the mineral-by-mineral dashboard <ArrowUpRight size={14} weight="bold" />
        </a>
      </div>

      <figure className="opening__diagram">
        <Diagram
          id="supply-concentration"
          stateId="the-chokepoint"
          controls={DEFAULT_CONTROLS}
          architecture="reduced-hree"
        />
        <figcaption>Reported share of global output at each stage of the rare-earth magnet chain.</figcaption>
      </figure>
    </section>
  );
}

function RefiningSlide() {
  return (
    <section className="opening__slide" aria-labelledby="refining-title">
      <div className="opening__copy">
        <p className="eyebrow">The bottleneck</p>
        <h2 id="refining-title" className="opening__heading">Refining is the hardest part to replace</h2>
        <p className="opening__lead">
          Reserves are concentrated in ion-adsorption clay deposits in southern China and Myanmar.
          Refining requires multi-stage solvent extraction of chemically near-identical elements.
        </p>
        <p className="opening__body">
          The dashboard assessment found that no Western or Indian facility possesses this
          capability at commercial scale. Substitution is either technically impossible or
          requires a fundamental product redesign that takes years.
        </p>
        <p className="opening__note">
          Tellurium is not a rare earth, but it belongs in Group 2 because its refining is
          monopolised, its recycling negligible and its substitution limited.
        </p>
        <a className="opening__text-link" href={MINERALPOLITIK_URL} target="_blank" rel="noreferrer">
          Takshashila&apos;s critical minerals research <ArrowUpRight size={14} weight="bold" />
        </a>
      </div>

      <div className="opening__flow-card" aria-label="The rare-earth refining bottleneck stages">
        <div className="opening__flow-step">
          <div className="opening__step-indicator">
            <span className="opening__step-index">01</span>
            <div className="opening__step-line" />
          </div>
          <div className="opening__step-content">
            <span className="opening__step-tag">Raw Ore Extraction</span>
            <h3 className="opening__step-title">Ion-adsorption clays</h3>
            <p className="opening__step-desc">Heavy rare-earth mining concentrated in southern China &amp; Myanmar</p>
          </div>
        </div>

        <div className="opening__flow-step opening__flow-step--chokepoint">
          <div className="opening__step-indicator">
            <span className="opening__step-index">02</span>
            <div className="opening__step-line" />
          </div>
          <div className="opening__step-content">
            <span className="opening__step-tag is-bottleneck">The Chokepoint · 90%+ Global Refining</span>
            <h3 className="opening__step-title">Multi-stage solvent extraction</h3>
            <p className="opening__step-desc">100+ stages of chemical separation for chemically near-identical lanthanides</p>
          </div>
        </div>

        <div className="opening__flow-step">
          <div className="opening__step-indicator">
            <span className="opening__step-index">03</span>
          </div>
          <div className="opening__step-content">
            <span className="opening__step-tag">Refined Metal &amp; Alloy</span>
            <h3 className="opening__step-title">Separated Dy / Tb &amp; Nd / Pr</h3>
            <p className="opening__step-desc">High-purity metals ready for strip casting into NdFeB permanent magnets</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlsSlide() {
  return (
    <section className="opening__slide" aria-labelledby="control-title">
      <div className="opening__copy">
        <p className="eyebrow">A present vulnerability</p>
        <h2 id="control-title" className="opening__heading">This has already happened</h2>
        <p className="opening__lead">
          In April 2025, China placed specified medium and heavy rare-earth items under export
          controls. Dysprosium- and terbium-containing NdFeB magnet materials were among the items
          covered.
        </p>
        <p className="opening__body">
          China&apos;s monopoly in these minerals is the hardest to dent in the immediate term. The
          dashboard analysis records Western market prices tripling within weeks and Indian
          automotive and EV manufacturers among the first firms denied licences.
        </p>
        <p className="opening__note">
          The measure required export licences rather than removing the materials from the market.
          A manufacturer can still lose production time while a licence is withheld.
        </p>
      </div>

      <div className="opening__event-card" aria-label="April 2025 Rare Earth Export Controls Overview">
        <div className="opening__card-header">
          <span className="opening__card-tag">Policy Milestone · April 2025</span>
          <span className="opening__event-badge">Export Licensing Action</span>
        </div>

        <div className="opening__event-body">
          <h3 className="opening__event-title">China Imposes Heavy Rare-Earth Export Controls</h3>
          <p className="opening__event-summary">
            Medium and heavy rare earths, including dysprosium- and terbium-doped NdFeB magnets, placed under stringent export licensing.
          </p>

          <div className="opening__event-impacts">
            <div className="opening__impact-item">
              <strong className="opening__impact-stat num">3×</strong>
              <div className="opening__impact-text">
                <strong>Price Surge</strong>
                <span>Western market spot prices tripled within weeks of the licensing mandate</span>
              </div>
            </div>

            <div className="opening__impact-item">
              <strong className="opening__impact-stat">Dy / Tb</strong>
              <div className="opening__impact-text">
                <strong>Specific Targeting</strong>
                <span>High-temperature EV magnet grades faced acute supply friction</span>
              </div>
            </div>

            <div className="opening__impact-item">
              <strong className="opening__impact-stat">OEMs</strong>
              <div className="opening__impact-text">
                <strong>Licence Delays</strong>
                <span>Indian and global automakers experienced direct supply-chain bottlenecks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandoffSlide({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="opening__slide" aria-labelledby="handoff-title">
      <div className="opening__copy">
        <p className="eyebrow">Interactive Motor Tour</p>
        <h2 id="handoff-title" className="opening__heading">
          Now, let&apos;s open the motor
        </h2>
        <p className="opening__lead">
          Now that the context is set, let&apos;s understand how these magnets and motors work in
          cars, where the rare earths sit, and what we can do about this vulnerability.
        </p>
        <p className="opening__body">
          You will step inside an interactive 3D model of an EV traction drive unit, inspect the
          electromagnetic fields in real time, and compare permanent-magnet machines against
          rare-earth-free alternatives.
        </p>
        <button type="button" className="btn btn--accent opening__motor-cta" onClick={onEnter}>
          Open the motor <ArrowRight size={15} weight="bold" />
        </button>
      </div>

      <div className="opening__tour-preview-card" aria-label="Interactive Tour Overview">
        <div className="opening__card-header">
          <span className="opening__card-tag">Interactive Tour Roadmap</span>
          <span className="opening__tour-badge">6 Chapters</span>
        </div>

        <div className="opening__tour-list">
          <div className="opening__tour-item">
            <span className="opening__tour-num">01</span>
            <div className="opening__tour-text">
              <strong>Where the Motor Lives &amp; Exploded 3D View</strong>
              <span>Drivetrain packaging, stator windings, rotor core, and buried magnet slots</span>
            </div>
          </div>

          <div className="opening__tour-item">
            <span className="opening__tour-num">02</span>
            <div className="opening__tour-text">
              <strong>Rotating Fields &amp; Reluctance Torque</strong>
              <span>Interactive 3-phase stator field animation, load angle, and magnetic alignment</span>
            </div>
          </div>

          <div className="opening__tour-item">
            <span className="opening__tour-num">03</span>
            <div className="opening__tour-text">
              <strong>Thermal Stress &amp; Dysprosium Trap</strong>
              <span>Demagnetisation curves, coercivity preservation, and grain-boundary diffusion</span>
            </div>
          </div>

          <div className="opening__tour-item">
            <span className="opening__tour-num">04</span>
            <div className="opening__tour-text">
              <strong>Rare-Earth-Free Alternatives</strong>
              <span>Induction, Wound-Rotor (EESM), and SynRM architectures with redesign burdens</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  const [slide, setSlide] = useState(0);

  const goBack = () => setSlide((current) => Math.max(0, current - 1));
  const goNext = () => setSlide((current) => Math.min(SLIDE_COUNT - 1, current + 1));
  const goToSlide = (index: number) => setSlide(index);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && slide < SLIDE_COUNT - 1) {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowLeft" && slide > 0) {
        event.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slide]);

  const content = [
    <PremiseSlide key="premise" />,
    <MagnetSlide key="magnet" />,
    <GroupSlide key="group" />,
    <RefiningSlide key="refining" />,
    <ControlsSlide key="controls" />,
    <HandoffSlide key="handoff" onEnter={onEnter} />,
  ][slide];

  return (
    <main className="opening">
      <header className="opening__topbar">
        <a
          href="https://takshashila.org.in"
          target="_blank"
          rel="noreferrer"
          className="opening__logo-link"
          aria-label="The Takshashila Institution"
        >
          <TakshashilaLogo className="opening__logo-img" textColor="#620d3c" />
        </a>
        <a href={MINERALPOLITIK_URL} target="_blank" rel="noreferrer" className="opening__top-link">
          Critical minerals research <ArrowUpRight size={13} weight="bold" />
        </a>
      </header>

      <div className="opening__viewport" aria-live="polite" key={slide}>
        {content}
      </div>

      <nav className="opening__nav" aria-label="Introduction slides">
        <button
          type="button"
          className="opening__back"
          onClick={goBack}
          disabled={slide === 0}
        >
          <ArrowLeft size={14} weight="bold" /> Back
        </button>

        <div className="opening__progress" role="tablist" aria-label="Slide progression">
          <span className="opening__counter num">{String(slide + 1).padStart(2, "0")}</span>
          <div className="opening__pills">
            {SLIDE_TITLES.map((title, index) => (
              <button
                key={title}
                type="button"
                role="tab"
                aria-selected={index === slide}
                aria-label={`Slide ${index + 1}: ${title}`}
                className={`opening__pill ${index === slide ? "is-current" : ""} ${index < slide ? "is-passed" : ""}`}
                onClick={() => goToSlide(index)}
              >
                <span className="opening__pill-bar" />
                <span className="opening__pill-text">{title}</span>
              </button>
            ))}
          </div>
          <span className="opening__counter num">{String(SLIDE_COUNT).padStart(2, "0")}</span>
        </div>

        {slide < SLIDE_COUNT - 1 ? (
          <button type="button" className="opening__next" onClick={goNext}>
            Next <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <button type="button" className="opening__next opening__next--enter" onClick={onEnter}>
            Open Motor <ArrowRight size={14} weight="bold" />
          </button>
        )}
      </nav>
    </main>
  );
}
