import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { TakshashilaLogo } from "../components/TakshashilaLogo";
import { AUTHORS, DASHBOARD_URL, MINERALPOLITIK_URL } from "../meta";
import "./Landing.css";

const GROUP_TWO_MEMBERS = [
  "Tellurium",
  "Terbium",
  "Yttrium",
  "Dysprosium",
  "Erbium",
  "Holmium",
  "Ytterbium",
  "Lutetium",
  "Thulium",
] as const;

const GROUP_TWO_VECTORS = [
  ["Refining concentration", "Near maximum"],
  ["Reserve concentration", "Near maximum"],
  ["Extraction complexity", "Near maximum"],
] as const;

function GroupTwoDashboard() {
  return (
    <div className="group-two-dashboard" aria-labelledby="group-two-title">
      <div className="group-two-dashboard__header">
        <span>India critical minerals dashboard</span>
        <span>Group 2 · 9 minerals</span>
      </div>
      <div className="group-two-dashboard__intro">
        <p className="group-two-dashboard__kicker">Heavy rare earths + Tellurium</p>
        <h2 id="group-two-title">One shared bottleneck</h2>
        <p>
          These minerals sit together because refining, reserves and extraction are concentrated at the same time. Tellurium is not a rare earth, but it faces the same tight refining and substitution problem.
        </p>
      </div>
      <ul className="group-two-dashboard__members" aria-label="Minerals in Group 2">
        {GROUP_TWO_MEMBERS.map((member) => <li key={member}>{member}</li>)}
      </ul>
      <div className="group-two-dashboard__vectors" aria-label="Shared risk characteristics">
        {GROUP_TWO_VECTORS.map(([label, value]) => (
          <div className="group-two-dashboard__vector" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <p className="group-two-dashboard__detail">
        Reserves sit in ion-adsorption clay deposits in southern China and Myanmar. Separating near-identical elements needs capability no Western or Indian facility has at commercial scale. China’s April 2025 export controls caused Western prices to triple within weeks; Tellurium is included here because its refining is monopolised, recycling negligible and substitution limited.
      </p>
      <p className="group-two-dashboard__note">Source: <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">India Critical Minerals Dashboard</a>, Group 2.</p>
      <details className="group-two-dashboard__embed">
        <summary>Open embedded dashboard</summary>
        <iframe
          title="India Critical Minerals Dashboard"
          src={`${DASHBOARD_URL}#groups`}
          loading="lazy"
        />
      </details>
    </div>
  );
}

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="landing">
      <header className="landing__masthead">
        <a className="landing__logo" href="https://takshashila.org.in/" target="_blank" rel="noreferrer">
          <TakshashilaLogo height={65} />
        </a>
        <div className="landing__masthead-actions">
          <a className="landing__research-link" href={MINERALPOLITIK_URL} target="_blank" rel="noreferrer">
            Critical minerals research <ArrowUpRight size={13} weight="bold" />
          </a>
          <button type="button" className="landing__masthead-cta" onClick={onEnter}>Open the motor <ArrowRight size={14} weight="bold" /></button>
        </div>
      </header>

      <div className="landing__grid">
        <section className="landing__copy" aria-labelledby="landing-title">
          <p className="eyebrow">The Takshashila Institution · Mineralpolitik</p>
          <h1 id="landing-title">The rare-earth question, inside <em>one motor</em></h1>
          <p className="landing__paragraph">
            One of the things that makes EVs such a critical technology is the motor. Most EV traction motors use permanent magnets that contain rare earths, especially the heavy rare earths dysprosium and terbium. Their presence creates a supply-chain vulnerability inside the drive unit.
          </p>
          <p className="landing__paragraph">
            We will look at which rare earths a motor uses, what a permanent magnet is—a material that holds its field without a continuous electrical input—and why 70–80% of EV traction motors are reported to use permanent-magnet machines. The refining bottleneck is concentrated in the same minerals we grouped in Group 2 of the <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">India Critical Minerals Dashboard</a>.
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
        </section>

        <figure className="landing__dashboard" aria-labelledby="dashboard-caption">
          <div className="landing__dashboard-frame">
            <GroupTwoDashboard />
          </div>
          <figcaption id="dashboard-caption">
            Group 2 is the tightest group in the dashboard. The preview above is rendered in code; <a href={`${DASHBOARD_URL}#groups`} target="_blank" rel="noreferrer">open the source dashboard</a> for the full group view.
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
