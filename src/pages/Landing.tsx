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
          These minerals sit together because refining, reserves and extraction are concentrated at the same time.
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
          <h1 id="landing-title">The EV motor’s <span className="landing__highlight">rare-earth</span> problem</h1>
          <p className="landing__paragraph">
            Take an electric car apart and most of it is ordinary: steel, glass, a big battery. One part is not. The motor that turns the wheels is built around a fist-sized set of magnets, and those magnets need two elements, dysprosium and terbium, that almost all come from one country. In April 2025 China put them under export licence.
          </p>
          <p className="landing__paragraph">
            This walkthrough is about that magnet: what it does inside the motor, what could replace it, and what each replacement would cost. It takes about fifteen minutes. The elements involved are the ones we grouped as Group 2 of the <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">India Critical Minerals Dashboard</a>.
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
            View more on the <a href={`${DASHBOARD_URL}#groups`} target="_blank" rel="noreferrer">dashboard</a>.
          </figcaption>
        </figure>
      </div>
    </main>
  );
}
