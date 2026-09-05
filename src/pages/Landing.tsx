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
        </div>
      </header>

      <div className="landing__grid">
        <section className="landing__copy" aria-labelledby="landing-title">
          <h1 id="landing-title">The EV motor’s <span className="landing__highlight">rare-earth</span> problem</h1>
          <p className="landing__paragraph">
            On 4 April 2025, China placed seven medium and heavy rare earths, and the magnets made from them, under export licence. Within weeks, carmakers holding no second source were pausing assembly while the paperwork caught up. The exposure sits in one component: the permanent magnet inside the traction motor, one to two kilograms of it per car, of which 1 to 4 per cent by mass is the dysprosium and terbium the notice actually covered.
          </p>
          <p className="landing__paragraph">
            This walkthrough is an explainer of that component. It answers three questions in order: what a permanent-magnet motor is and where it sits in the car; what can turn a rotor instead of a magnet; and what each alternative costs in efficiency, size, cooling and engineering time, and how close it is to a showroom. The elements involved are Group 2 of the <a href={DASHBOARD_URL} target="_blank" rel="noreferrer">India Critical Minerals Dashboard</a>.
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
          <button type="button" className="landing__cta" onClick={onEnter}>Start the walkthrough <ArrowRight size={16} weight="bold" /></button>
        </section>

        <figure className="landing__dashboard">
          <div className="landing__dashboard-frame">
            <GroupTwoDashboard />
          </div>
        </figure>
      </div>
    </main>
  );
}
