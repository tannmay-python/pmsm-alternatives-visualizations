import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { TakshashilaLogo } from "../components/TakshashilaLogo";
import { AUTHORS, DASHBOARD_URL, MINERALPOLITIK_URL } from "../meta";
import "./Landing.css";

const GROUP_TWO_ROWS = [
  { label: "Mining", value: 60 },
  { label: "Refining", value: 92 },
  { label: "NdFeB traction magnets", value: 94 },
] as const;

function GroupTwoDashboard() {
  return (
    <div className="group-two-dashboard" role="img" aria-label="Group 2 supply concentration: 60 percent mining, 92 percent refining, and 94 percent NdFeB traction magnets">
      <div className="group-two-dashboard__header">
        <span>India critical minerals dashboard</span>
        <span>Group 2</span>
      </div>
      <p className="group-two-dashboard__axis">Share of global output, by stage</p>
      <div className="group-two-dashboard__rows">
        {GROUP_TWO_ROWS.map((row) => (
          <div className="group-two-dashboard__row" key={row.label}>
            <div className="group-two-dashboard__row-meta">
              <span>{row.label}</span>
              <span className="group-two-dashboard__value">{row.value}%</span>
            </div>
            <div className="group-two-dashboard__track" aria-hidden="true">
              <span className="group-two-dashboard__fill" style={{ width: `${row.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="group-two-dashboard__note">The remaining share is spread across every other producer combined.</p>
    </div>
  );
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="landing">
      <header className="landing__masthead">
        <a className="landing__logo" href="https://takshashila.org.in/" target="_blank" rel="noreferrer">
          <TakshashilaLogo height={48} />
        </a>
        <a className="landing__research-link" href={MINERALPOLITIK_URL} target="_blank" rel="noreferrer">
          Critical minerals research <ArrowUpRight size={13} weight="bold" />
        </a>
      </header>

      <div className="landing__grid">
        <section className="landing__copy" aria-labelledby="landing-title">
          <p className="eyebrow">The Takshashila Institution · Mineralpolitik</p>
          <h1 id="landing-title">The rare-earth question, inside <em>one motor</em></h1>
          <p className="landing__paragraph">
            One of the things that makes EVs such a critical technology is the motor. Most EV traction motors use permanent magnets that contain rare earths, especially the heavy rare earths dysprosium and terbium. Their presence creates a supply-chain vulnerability inside the drive unit.
          </p>
          <p className="landing__paragraph">
            We will look at which rare earths a motor uses, what a permanent magnet is, and why 70–80% of EV traction motors are reported to use permanent-magnet machines. The refining bottleneck is concentrated in the same minerals we grouped in Group 2 of the <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">India Critical Minerals Dashboard</a>; China’s April 2025 export controls showed that this is not a problem of the future. We will then see how the motor works and what can lessen the dependency.
          </p>
          <p className="landing__authors" aria-label="Authors">
            <span>By </span>
            {AUTHORS.map((author, index) => (
              <span key={author.name}>
                <a href={author.url} target="_blank" rel="noreferrer">{author.name}</a>
                {index < AUTHORS.length - 2 ? ", " : index === AUTHORS.length - 2 ? ", and " : ""}
              </span>
            ))}
          </p>
          <button type="button" className="landing__cta" onClick={onEnter}>
            Open the motor <ArrowRight size={15} weight="bold" />
          </button>
        </section>

        <figure className="landing__dashboard" aria-labelledby="dashboard-caption">
          <div className="landing__dashboard-frame">
            <GroupTwoDashboard />
          </div>
          <figcaption id="dashboard-caption">
            Group 2 is the tightest group in the dashboard: refining concentration, reserve concentration and extraction complexity all sit near the maximum.
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
