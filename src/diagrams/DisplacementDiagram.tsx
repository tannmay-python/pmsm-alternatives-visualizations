import type { ReactNode } from "react";
import "./DisplacementDiagram.css";

type Route = {
  name: string;
  prospect: string;
  band: "strongest" | "strong" | "promising" | "developing" | "longer";
  reason: string;
  benefit: string;
  cost: string;
  evidence: ReactNode;
};

const routes: Route[] = [
  {
    name: "Wound field",
    prospect: "Strongest near-term prospect",
    band: "strongest",
    reason: "Production experience and an adjustable rotor field support wider use.",
    benefit: "Removes rotor magnets entirely. Adjusting the rotor current lets the motor match its field to the load and reduce it at high speed.",
    cost: "Rotor windings consume power and generate heat. The drive needs an excitation supply, power-transfer hardware and rotor cooling. Brushes require wear management; contactless excitation adds different hardware.",
    evidence: <><a href="https://www.press.bmwgroup.com/global/article/detail/T0448099EN/charge-faster-drive-further-bmw-group-reveals-revolutionary-electric-drive-concept-with-800v">BMW</a> retained wound field for its Gen6 rear drive. Automotive supplier <a href="https://www.zf.com/products/en/cars/products_77186.html">ZF</a> is developing compact, contactless excitation. Production use makes this the clearest path to wider adoption in main drives.</>,
  },
  {
    name: "Induction",
    prospect: "Strong in established applications",
    band: "strong",
    reason: "A proven magnet-free drive, particularly useful for an additional axle.",
    benefit: "Uses aluminium or copper rotor bars, with no magnets or separate rotor power supply. When unpowered, the induced field fades, allowing low-drag operation.",
    cost: "Current in the rotor bars produces heat and energy losses. Sustained driving calls for effective cooling; efficiency across everyday driving affects vehicle range and battery requirements.",
    evidence: <><a href="https://www.audi.com/en/the-audi-q6-e-tron-electric-mobility-on-a-new-level-15929/sporty-performance-powerful-drives-15932">Audi</a> uses induction on the Q6 e-tron quattro’s front axle for extra power and all-wheel drive. Its ability to run only when needed helps explain this choice alongside a permanent-magnet rear motor.</>,
  },
  {
    name: "Ferrite magnets",
    prospect: "Promising with motor redesign",
    band: "promising",
    reason: "Replaces rare-earth magnets while retaining a permanent-magnet motor.",
    benefit: "Ferrite offers inexpensive magnet material without rare earths. The rotor needs no electrical excitation supply. Ferrite can also assist a reluctance rotor.",
    cost: "The weaker field requires changes to rotor geometry, magnet volume or operating speed. Higher speed affects gearing and mechanical loads; a larger motor affects packaging. New tooling and demagnetisation tests add development work.",
    evidence: <>Materials maker <a href="https://www.proterial.com/e/press/2023/pdf/20230724en.pdf">Proterial</a> tested a prototype with a maximum output of 102 kW and a maximum speed of 15,000 rpm, compared with 110 kW and 10,000 rpm for its NdFeB reference. In two-wheelers, <a href="https://cdn.olaelectric.com/sites/evdp/pages/investor/announcement/Intimation_of_Press_Release_titled_Ola_Electric_Becomes_India_First_Automotive_OEM_to_Get_Government_Certification_For_its_In-House_Developed_Ferrite_Motor_dated_October_06_2025.pdf">Ola Electric</a> announced ferrite-motor certification in October 2025. These are useful steps toward broader vehicle use.</>,
  },
  {
    name: "Synchronous reluctance",
    prospect: "Developing for wider car use",
    band: "developing",
    reason: "A simple rotor shifts more of the engineering demand to the inverter.",
    benefit: "Shaped steel replaces magnets and rotor windings, avoiding rotor-winding losses and excitation hardware. Industrial products demonstrate the efficiency potential of this approach.",
    cost: "Lower power factor can mean more inverter current for the same useful output, increasing semiconductor and cooling requirements. Rotor design must deliver enough torque within the car’s available space.",
    evidence: <>Industrial supplier <a href="https://new.abb.com/news/detail/80775/ie5-synchronous-reluctance-motors">ABB</a> sells these drives; Indian developer <a href="https://www.chara.co.in/technology">Chara Technologies</a> offers motor-and-controller systems. <a href="https://ieeexplore.ieee.org/document/7542569/">Traction research</a> identifies torque density and power factor as reasons to add magnet assistance. Ferrite assistance belongs to the ferrite route above.</>,
  },
  {
    name: "Switched reluctance",
    prospect: "Longer path to broad car use",
    band: "longer",
    reason: "Smooth, quiet propulsion needs substantial design and control work.",
    benefit: "A steel rotor needs neither magnets nor windings. Keeping the windings on the stationary stator simplifies access for cooling and avoids a rotor power supply.",
    cost: "Current timing and shaping must limit torque pulses. The motor, power electronics and control software need development together, followed by noise, vibration and vehicle testing. Simple rotor construction does not remove these system costs.",
    evidence: <>Motor supplier <a href="https://support.turntide.com/hc/en-us/article_attachments/45903905133332">Turntide</a> sells switched-reluctance systems for ventilation. <a href="https://impact.ornl.gov/en/publications/a-framework-for-multiple-objective-co-optimization-of-switched-re/">Oak Ridge National Laboratory</a> studies motor design and current control together to reduce torque ripple. Refinement for passenger cars gives this route the most demanding near-term path of the five.</>,
  },
];

export function DisplacementDiagram() {
  return (
    <section className="clean-diagram displacement" aria-label="Rare-earth magnet displacement prospects">
      <div className="displacement__scroll" data-scrolls tabIndex={0} aria-label="Five alternatives: scroll to compare and open each for details">
        <header className="displacement__header">
          <p>Passenger-car traction · near-term prospects</p>
          <span>Longer bar · stronger prospect for wider adoption</span>
        </header>
        <div className="displacement__routes">
          {routes.map((route) => (
            <details className="displacement__route" key={route.name}>
              <summary>
                <span className="displacement__name">{route.name}</span>
                <span className="displacement__assessment">
                  <span className={`displacement__bar displacement__bar--${route.band}`} aria-hidden="true"><i /></span>
                  <span className="displacement__prospect">{route.prospect}</span>
                </span>
                <span className="displacement__toggle" aria-hidden="true" />
                <span className="displacement__reason">{route.reason}</span>
              </summary>
              <div className="displacement__detail">
                <div><h3>What it offers</h3><p>{route.benefit}</p></div>
                <div><h3>Engineering cost</h3><p>{route.cost}</p></div>
                <div className="displacement__evidence"><h3>Where it stands</h3><p>{route.evidence}</p></div>
              </div>
            </details>
          ))}
        </div>
        <p className="displacement__hint">Open a route for benefits, costs and examples.</p>
        <aside className="displacement__partial">
          <strong>Using less is another route.</strong> Low-dysprosium grades reduce heavy-rare-earth use but retain neodymium and praseodymium. <a href="https://www.proterial.com/e/press/2025/n0722b.html">Proterial</a> makes reduced-heavy-rare-earth grades and has developed heavy-rare-earth-free traction grades. Carmakers still need to qualify the magnet’s heat tolerance and resistance to demagnetisation.
        </aside>
      </div>
    </section>
  );
}
