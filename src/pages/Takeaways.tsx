import { ArrowLeft, ArrowRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { TakshashilaLogo } from "../components/TakshashilaLogo";
import "./Takeaways.css";

const assessment = [
  ["China is a separate case in the global outlook.", "Other countries are looking for alternatives because they depend on China for rare-earth magnets. China does not face that same vulnerability: any switch there is more likely to be driven by cost or technology. As the world’s largest electric-car market, it must be considered separately when judging how far this shift could go globally."],
  ["Ferrite has the strongest case in India.", "India’s large electric two- and three-wheeler market gives it the biggest opening. Ferrite keeps a permanent magnetic field without the extra equipment needed to power a wound rotor. Its weaker magnets are easier to accommodate in these lower-power vehicles, though the motor still needs redesigning."],
  ["Outside China, wound field is most likely to replace rare-earth magnets in cars.", "Outside China, cars play a larger role in the electric-vehicle market than they do in India, shifting the opportunity towards wound field. It provides the strong, controllable magnetic field a car’s main drive needs and already powers production cars. Cars also have more room than scooters for the equipment that powers and cools the rotor."],
  ["Induction is likely to gain where ruggedness or occasional extra power matters.", "It is a proven option for commercial vehicles and an extra driven axle. But we expect less replacement of car main motors than with wound field: the energy lost as heat in its rotor can make it harder to preserve range without adding battery capacity."],
  ["Switched reluctance is the least likely to spread widely in passenger vehicles.", "Getting smooth acceleration with low noise and vibration takes substantial control and design work. With other magnet-free motors already doing that job, there is less reason to take on this work. Its better openings are industrial uses where those demands are less strict."],
];

export function Takeaways({ outlook, onNext, onBack, onRestart }: {
  outlook: boolean; onNext: () => void; onBack: () => void; onRestart: () => void;
}) {
  return (
    <main className="takeaways" aria-labelledby="takeaways-title">
      <div className="takeaways__sheet">
        <header className="takeaways__masthead">
          <a href="https://takshashila.org.in/" aria-label="The Takshashila Institution"><TakshashilaLogo height={48} /></a>
          <span>Takeaways <b>{outlook ? "02" : "01"}</b> / 02</span>
        </header>
        <h1 id="takeaways-title">{outlook ? "Where adoption could grow" : "What the alternatives change"}</h1>
        {outlook ? (
          <>
            <ul className="takeaways__points">
              {assessment.map(([title, text]) => <li key={title}><h2>{title}</h2><p>{text}</p></li>)}
            </ul>

          </>
        ) : (
          <ul className="takeaways__points takeaways__points--summary">
            <li><h2>The motor.</h2><p>A PMSM turns because the inverter makes the stator’s field rotate and a magnet rotor follows it. Dysprosium and terbium can help its magnets resist demagnetisation when hot. Changes to magnet grades and motor design can reduce or avoid these elements.</p></li>
            <li><h2>The alternatives.</h2><p>Induction motors use currents induced in aluminium or copper rotor bars. Wound-field motors supply current to rotor coils, while reluctance motors use shaped steel. Each can turn the wheels without rare-earth magnets, with different cooling, power-supply and control requirements.</p></li>
            <li><h2>The outlook.</h2><p>Induction and wound-field motors already power production cars. Ferrite and reluctance designs are opening further options as testing and development advance. Technology substitution will be a key way to diversify away from rare earths; the choice of motor depends on what each application needs.</p></li>
          </ul>
        )}
        {outlook && (
            <aside className="takeaways__india" aria-labelledby="india-title">
              <h2 id="india-title">Development in India</h2>
              <p>Indian developers pursuing alternatives include <a href="https://www.chara.co.in/technology">Chara Technologies</a>, <a href="https://vi-mag.com/">Vimag Labs</a> and <a href="https://viridianingnipropulsion.com/">Viridian Ingni Propulsion</a>. <a href="https://cdn.olaelectric.com/sites/evdp/pages/investor/announcement/Intimation_of_Press_Release_titled_Ola_Electric_Becomes_India_First_Automotive_OEM_to_Get_Government_Certification_For_its_In-House_Developed_Ferrite_Motor_dated_October_06_2025.pdf">Ola Electric</a> announced certification of a rare-earth-free ferrite motor in October 2025; <a href="https://media.atherenergy.com/Deferring-claims-PM-E-DRIVE-scheme-Sep-25-2025.pdf">Ather</a> announced type approval for a heavy-rare-earth-free motor in September 2025. Ather’s route retains light rare earths.</p>
            </aside>
        )}
        <nav className="takeaways__nav" aria-label="Takeaway navigation">
          <button type="button" onClick={onBack}><ArrowLeft size={17} /> {outlook ? "Technology summary" : "Back to the walkthrough"}</button>
          <button type="button" className="takeaways__next" onClick={outlook ? onRestart : onNext}>{outlook ? "Start again" : "Where adoption could grow"} {outlook ? <ArrowCounterClockwise size={17} /> : <ArrowRight size={17} />}</button>
        </nav>
      </div>
    </main>
  );
}
