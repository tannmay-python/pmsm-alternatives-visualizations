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
        <span>9 minerals</span>
      </div>
      <div className="group-two-dashboard__intro">
        <p className="group-two-dashboard__kicker">Group 2 · Heavy rare earths + tellurium</p>
        <h2 id="group-two-title">Substitution sometime away</h2>
        <p>
          This is the tightest group in the dataset, and the one where India's exposure is most acute and its options fewest. Every member scores at or near the maximum on three vectors simultaneously: refining concentration, reserve concentration, and extraction complexity. The April 2025 export controls caused Western market prices to triple within weeks, and Indian automotive and EV manufacturers were among the first firms denied licences. The dashboard's third recommendation for this group is to make these minerals obsolete through motors that do not use rare-earth permanent magnets, and this walkthrough works through that recommendation.
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
            China placed seven medium and heavy rare earths, and the magnets made from them, under export licence on 4 April 2025. Carmakers in Europe and India that had no second source paused assembly lines within weeks while licence applications worked through the Ministry of Commerce in Beijing. The part that stopped those lines is a set of permanent magnets inside the traction motor, roughly one to two kilograms per car. Dysprosium and terbium, the elements the notice covered, are 1 to 4 per cent of that mass.
          </p>
          <p className="landing__paragraph">
            We wrote this walkthrough for colleagues in government who need to hold the motor question correctly before a procurement or industrial-policy decision. It explains what a permanent-magnet motor is and where it sits in the car, what else can turn a rotor, and what each alternative costs a manufacturer in efficiency, size, cooling and engineering time. The minerals involved are the dashboard's Group 2, shown alongside.
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
