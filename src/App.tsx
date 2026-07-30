import {
  ArrowRight,
  Moon,
  Pause,
  Play,
  Sun,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StoryCanvas } from "./components/StoryCanvas";
import type {
  Alternative,
  AlternativeKey,
  StorySignal,
} from "./types";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  "The car",
  "The drive unit",
  "The machine",
  "The field",
  "The material",
  "The alternatives",
];

const ALTERNATIVES: Alternative[] = [
  {
    key: "pmsm",
    shortName: "Magnets",
    name: "Permanent-magnet synchronous",
    principle: "A permanent field inside the rotor follows the stator field.",
    magnet: "NdFeB magnets",
    strength: "Compact and efficient",
    cost: "Rare-earth exposure",
    evidence: "Widely used in production EVs",
  },
  {
    key: "wound",
    shortName: "Wound field",
    name: "Wound-field synchronous",
    principle: "Current in a rotor winding creates a controllable magnetic field.",
    magnet: "Copper rotor winding",
    strength: "Controllable at high speed",
    cost: "Rotor heat and excitation hardware",
    evidence: "Used by Renault and BMW",
  },
  {
    key: "induction",
    shortName: "Induction",
    name: "Induction motor",
    principle: "The moving stator field induces current inside a conductive cage.",
    magnet: "Copper or aluminium cage",
    strength: "Mature and robust",
    cost: "Rotor heat and slip",
    evidence: "Used in production EVs",
  },
  {
    key: "synrm",
    shortName: "SynRM",
    name: "Synchronous reluctance",
    principle: "Shaped air barriers make the rotor prefer one magnetic direction.",
    magnet: "Laminated steel and air",
    strength: "Low rotor loss",
    cost: "Lower power factor",
    evidence: "Established in industrial drives",
  },
  {
    key: "srm",
    shortName: "SRM",
    name: "Switched reluctance",
    principle: "A toothed steel rotor follows stator poles switched in sequence.",
    magnet: "Salient steel rotor",
    strength: "Simple, heat-tolerant rotor",
    cost: "Noise and torque ripple",
    evidence: "Commercial in selected applications",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function App() {
  const storyRoot = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [fieldPaused, setFieldPaused] = useState(false);
  const [load, setLoad] = useState(36);
  const [alternative, setAlternative] = useState<AlternativeKey>("wound");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const storySignal = useRef<StorySignal>({
    progress: 0,
    activeChapter: 0,
    reducedMotion,
    fieldPaused,
    load,
    alternative,
  });

  useEffect(() => {
    storySignal.current.fieldPaused = fieldPaused;
  }, [fieldPaused]);

  useEffect(() => {
    storySignal.current.load = load;
  }, [load]);

  useEffect(() => {
    storySignal.current.alternative = alternative;
  }, [alternative]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    if (!storyRoot.current) return;

    const root = storyRoot.current;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-chapter]"),
    );
    let chapterCenters = sections.map(
      (section) => section.offsetTop + section.offsetHeight / 2,
    );

    const refreshCenters = () => {
      chapterCenters = sections.map(
        (section) => section.offsetTop + section.offsetHeight / 2,
      );
    };

    const syncStoryToReadingLine = () => {
      const readingLine = window.scrollY + window.innerHeight / 2;
      let progress = 0;

      if (readingLine <= chapterCenters[0]) {
        progress = 0;
      } else if (readingLine >= chapterCenters[chapterCenters.length - 1]) {
        progress = CHAPTERS.length - 1;
      } else {
        for (let index = 0; index < chapterCenters.length - 1; index += 1) {
          const start = chapterCenters[index];
          const end = chapterCenters[index + 1];
          if (readingLine >= start && readingLine <= end) {
            progress = index + (readingLine - start) / (end - start);
            break;
          }
        }
      }

      const chapter = clamp(Math.round(progress), 0, CHAPTERS.length - 1);
      storySignal.current.progress = reducedMotion ? chapter : progress;
      if (storySignal.current.activeChapter !== chapter) {
        storySignal.current.activeChapter = chapter;
        setActiveChapter(chapter);
      }
    };

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: reducedMotion ? false : 0.65,
        invalidateOnRefresh: true,
        onUpdate: syncStoryToReadingLine,
      });

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 58%",
          end: "bottom 58%",
          toggleClass: { targets: section, className: "is-active" },
          onEnter: () => {
            storySignal.current.activeChapter = index;
            setActiveChapter(index);
            if (reducedMotion) storySignal.current.progress = index;
          },
          onEnterBack: () => {
            storySignal.current.activeChapter = index;
            setActiveChapter(index);
            if (reducedMotion) storySignal.current.progress = index;
          },
        });
      });
    }, root);

    const refresh = window.setTimeout(() => {
      refreshCenters();
      ScrollTrigger.refresh();
      syncStoryToReadingLine();
    }, 80);
    return () => {
      window.clearTimeout(refresh);
      context.revert();
    };
  }, [reducedMotion]);

  const selectedAlternative =
    ALTERNATIVES.find((item) => item.key === alternative) ?? ALTERNATIVES[1];

  return (
    <>
      <a className="skip-link" href="#story">
        Skip to the visual story
      </a>
      <header className="site-header">
        <a className="brand" href="#story" aria-label="PMSM Visualizations home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>PMSM Visualizations</span>
        </a>
        <div className="header-status" aria-live="polite">
          <span>{String(activeChapter + 1).padStart(2, "0")}</span>
          <b>{CHAPTERS[activeChapter]}</b>
        </div>
        <nav className="site-nav" aria-label="Story chapters">
          <a href="#inside">Inside the car</a>
          <a href="#materials">Materials</a>
          <a href="#alternatives">Alternatives</a>
        </nav>
        <button
          className="icon-button"
          type="button"
          onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <main id="story" ref={storyRoot} className="story">
        <div
          className={`scene-shell chapter-${activeChapter} ${sceneReady ? "is-ready" : ""}`}
        >
          <img
            className="scene-poster"
            src={`${import.meta.env.BASE_URL}car-hero.jpg`}
            alt=""
          />
          <StoryCanvas
            signal={storySignal}
            onReady={() => setSceneReady(true)}
          />
          <div className="scene-vignette" />
          <div className="scene-loader" role="status" aria-live="polite">
            <span>Building the motor</span>
            <i />
          </div>
          <div className="scene-progress" aria-hidden="true">
            {CHAPTERS.map((chapter, index) => (
              <i
                key={chapter}
                className={index <= activeChapter ? "is-passed" : ""}
              />
            ))}
          </div>
        </div>

        <section id="inside" className="chapter chapter-hero" data-chapter="0">
          <div className="chapter-copy hero-copy">
            <p className="eyebrow">A visual answer</p>
            <h1>Inside the electric car</h1>
            <p className="hero-line">
              One car. Two motors. A supply-chain question.
            </p>
            <a className="primary-link" href="#drive-unit">
              Open the car <ArrowRight size={18} weight="bold" />
            </a>
          </div>
          <div className="hero-fact" aria-label="Vehicle motor count">
            <span>2</span>
            <p>
              traction motors in this all-wheel-drive example
              <small>Many EVs use one. Some performance vehicles use more.</small>
            </p>
          </div>
        </section>

        <section
          id="drive-unit"
          className="chapter chapter-right"
          data-chapter="1"
        >
          <div className="chapter-copy">
            <h2>The motor lives here</h2>
            <p>
              Between the wheels, beside the gearbox. A compact machine turns
              battery power into axle torque.
            </p>
            <div className="scale-readout">
              <span>about 30 cm</span>
              <i />
              <small>visual scale, representative motor package</small>
            </div>
          </div>
        </section>

        <section className="chapter chapter-left" data-chapter="2">
          <div className="chapter-copy">
            <h2>Open the machine</h2>
            <p>Housing. Copper. Steel. Magnets. Each layer has a job.</p>
            <dl className="part-list">
              <div>
                <dt>Stator</dt>
                <dd>Timed current builds a moving magnetic field.</dd>
              </div>
              <div>
                <dt>Air gap</dt>
                <dd>A few millimetres separate still from spinning.</dd>
              </div>
              <div>
                <dt>Rotor</dt>
                <dd>Embedded magnets pull the shaft around.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="field" className="chapter chapter-field" data-chapter="3">
          <div className="chapter-copy">
            <h2>Make the field move</h2>
            <p>
              Three timed currents create one magnetic direction that keeps
              turning. The permanent-magnet rotor follows it.
            </p>
            <div className="causal-chain" aria-label="Electricity becomes motion">
              <span>Electricity</span>
              <i />
              <span>Field</span>
              <i />
              <span>Motion</span>
            </div>
            <div className="field-controls">
              <button
                type="button"
                className="play-control"
                onClick={() => setFieldPaused((value) => !value)}
                aria-pressed={fieldPaused}
              >
                {fieldPaused ? <Play size={18} weight="fill" /> : <Pause size={18} weight="fill" />}
                {fieldPaused ? "Run field" : "Pause field"}
              </button>
              <label className="load-control">
                <span>
                  Shaft load <b>{load}%</b>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={load}
                  style={{ "--load": load } as CSSProperties}
                  onChange={(event) => setLoad(Number(event.target.value))}
                />
              </label>
            </div>
          </div>
        </section>

        <section id="materials" className="chapter chapter-materials" data-chapter="4">
          <div className="chapter-copy material-copy">
            <p className="material-number">1-2 kg</p>
            <h2>Small mass. Large dependency.</h2>
            <p>
              A typical EV motor uses 1-2 kg of permanent-magnet material. In this
              dual-motor example, that is roughly 2-4 kg if both motors use NdFeB.
            </p>
            <div className="chemistry-line">
              <span>Neodymium</span>
              <span>Praseodymium</span>
              <small>with dysprosium or terbium in some high-temperature grades</small>
            </div>
            <a
              className="source-link"
              href="https://www.energy.gov/sites/default/files/2024-12/Neodymium%2520Magnets%2520Supply%2520Chain%2520Report%2520-%2520Final%5B1%5D.pdf"
              target="_blank"
              rel="noreferrer"
            >
              US Department of Energy source <ArrowRight size={15} />
            </a>
          </div>
          <aside className="supply-callout">
            <span>94%</span>
            <p>of sintered permanent magnets were produced in China in 2024</p>
            <a
              href="https://www.iea.org/reports/rare-earth-elements/executive-summary"
              target="_blank"
              rel="noreferrer"
            >
              IEA source
            </a>
          </aside>
        </section>

        <section
          id="alternatives"
          className="chapter chapter-alternatives"
          data-chapter="5"
        >
          <div className="alternative-ui">
            <div className="alternative-heading">
              <h2>
                Yes. The field can come from <em>somewhere else.</em>
              </h2>
              <p>Rare-earth-free changes the tradeoffs, not the purpose.</p>
            </div>

            <div className="alternative-panel">
              <div className="alternative-tabs" role="tablist" aria-label="Motor architectures">
                {ALTERNATIVES.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="tab"
                    aria-selected={alternative === item.key}
                    className={alternative === item.key ? "is-selected" : ""}
                    onClick={() => setAlternative(item.key)}
                  >
                    {item.shortName}
                  </button>
                ))}
              </div>
              <div className="alternative-detail" role="tabpanel">
                <div>
                  <span>Selected architecture</span>
                  <h3>{selectedAlternative.name}</h3>
                  <p>{selectedAlternative.principle}</p>
                </div>
                <dl>
                  <div>
                    <dt>Rotor</dt>
                    <dd>{selectedAlternative.magnet}</dd>
                  </div>
                  <div>
                    <dt>Strength</dt>
                    <dd>{selectedAlternative.strength}</dd>
                  </div>
                  <div>
                    <dt>Tradeoff</dt>
                    <dd>{selectedAlternative.cost}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{selectedAlternative.evidence}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <footer className="sources">
          <div>
            <p>The visual answer</p>
            <h2>
              The rotor can lose its rare-earth magnets. The engineering challenge
              moves into copper, steel, heat, controls, and package size.
            </h2>
          </div>
          <div className="source-list">
            <a
              href="https://www.iea.org/reports/rare-earth-elements/executive-summary"
              target="_blank"
              rel="noreferrer"
            >
              IEA: Rare Earth Elements
            </a>
            <a
              href="https://www.energy.gov/cmei/vehicles/electric-motors-research-and-development"
              target="_blank"
              rel="noreferrer"
            >
              DOE: Electric Motor R&amp;D
            </a>
            <a
              href="https://www.renaultgroup.com/en/magazine/energy-and-motorization/all-about-electric-motors-with-no-rare-earths/"
              target="_blank"
              rel="noreferrer"
            >
              Renault: Rare-earth-free motors
            </a>
            <a
              href="https://www.abb.com/global/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/synchronous-reluctance-motors"
              target="_blank"
              rel="noreferrer"
            >
              ABB: Synchronous reluctance
            </a>
          </div>
          <p className="footer-note">
            Built as a visual companion to the PMSM alternatives issue brief.
            Values are representative and motor-specific designs vary.
          </p>
        </footer>
      </main>
    </>
  );
}

export default App;
