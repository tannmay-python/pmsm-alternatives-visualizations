import { useState, type ReactNode } from "react";
import "./DisplacementDiagram.css";

type Route = {
  name: string;
  prospect: string;
  band: "strongest" | "strong" | "promising" | "developing" | "longer";
  reason: string;
  benefit: string;
  size: string;
  maintenance: string;
  replacement: string;
  control: string;
  technology: string;
  market: Record<Application, string>;
  evidence: ReactNode;
};

type Application = "cars" | "light" | "commercial";
type Assessment = { band: Route["band"]; prospect: string; reason: string; benefit: string };
const applications: { id: Application; name: string; needs: string }[] = [
  { id: "cars", name: "Passenger cars", needs: "Range, quiet operation and power within the available space. A main drive and an occasional-use second axle have different jobs." },
  { id: "light", name: "2 & 3 wheelers", needs: "Scooters need a compact, affordable drive. Passenger and cargo three-wheelers also need sustained torque under load, dependable servicing and low downtime." },
  { id: "commercial", name: "Trucks & buses", needs: "Continuous power, cooling, payload and service uptime matter more than a brief peak-power rating. A delivery truck and a long-haul truck need different duty-cycle tests." },
];
const assessments: Record<Application, Assessment[]> = {
  cars: [
    { band: "strongest", prospect: "Strong case for main drives", reason: "Production experience supports replacing the main motor, with excitation and cooling already engineered into cars.", benefit: "Wound field leads this comparison because vehicle production has demonstrated a complete main drive without rotor magnets. Adjustable excitation helps across a wide speed range; the extra hardware is the trade-off." },
    { band: "strong", prospect: "Strong case for selected roles", reason: "Established propulsion technology; particularly attractive for an axle used only when extra power is needed.", benefit: "Induction has powered complete cars, including the original Tesla Roadster. Audi’s front-axle example supports a narrower case: low drag when inactive and extra drive when needed. Its permanent-magnet rear motor remains, so that layout only partly displaces magnets." },
    { band: "promising", prospect: "Promising with redesign", reason: "Avoids a rotor excitation system, but matching car performance requires a redesigned motor and drive.", benefit: "Ferrite retains permanent-magnet operation without rare earths. That gives it an adoption path through familiar drive technology, but weaker magnets make torque density and vehicle packaging central hurdles. Prototype results support development, not production parity." },
    { band: "developing", prospect: "Developing traction case", reason: "Industrial efficiency is established; compact, high-output vehicle integration is the harder step.", benefit: "A rotor without magnets or windings offers a simple construction. The case ranks below established car drives because achieving useful torque density and power factor can demand more inverter current or magnet assistance. Industrial adoption alone does not settle those vehicle requirements." },
    { band: "longer", prospect: "More refinement needed", reason: "Rotor simplicity is attractive, but torque ripple and noise raise the work needed for a refined car drive.", benefit: "Switched reluctance could remove magnets with a robust rotor. It ranks lower here because smooth acceleration and quiet operation require coordinated motor and control development. That is a refinement and validation challenge, not evidence that the motor is inherently unsafe." },
  ],
  light: [
    { band: "longer", prospect: "Less compelling for scooters", reason: "Rotor excitation and cooling add hardware to a tightly packaged, price-sensitive drive.", benefit: "Wound field is technically possible in a scooter, but its car-production advantage does not establish a scooter advantage. The excitation supply, rotor losses and packaging must earn their place against simpler drives. Better batteries do not automatically solve those constraints." },
    { band: "developing", prospect: "Application-dependent", reason: "A magnet-free, brushless rotor is useful; low-voltage efficiency and heat under load decide the fit.", benefit: "Induction avoids both magnets and a separate rotor supply. For a small scooter, rotor losses compete with limited battery energy and cooling capacity. A cargo three-wheeler needs a separate assessment of hill starts, payload and sustained operation; car adoption cannot decide it." },
    { band: "strong", prospect: "Strong emerging scooter case", reason: "Ola’s certification provides a scooter-specific step toward deployment without rotor excitation hardware.", benefit: "Ferrite has the clearest scooter-specific milestone among the examples here. It keeps permanent-magnet control while eliminating rare-earth magnets. Certification strengthens the adoption case; wider adoption also depends on range, hill-climbing performance and durability at scale." },
    { band: "promising", prospect: "Promising for small vehicles", reason: "Supplier systems target scooters and three-wheelers, bringing the evidence closer to this application.", benefit: "Chara’s small-vehicle motor-and-controller offerings make this more than an industrial analogy. The absence of rotor windings and magnets is attractive for compact drives, but inverter size, efficiency under load and vehicle-level durability determine the benefit. A supplier offering is a different milestone from fleet deployment." },
    { band: "developing", prospect: "Potential in utility roles", reason: "Simple rotor construction is attractive; current shaping must still deliver smooth low-speed drive.", benefit: "Utility vehicles may value rotor robustness and material availability, but passengers and cargo still need controlled torque at low speed. The adoption case depends on demonstrating quiet, efficient drive with affordable electronics; ventilation products do not establish road-vehicle readiness." },
  ],
  commercial: [
    { band: "promising", prospect: "Candidate for sustained drive", reason: "Adjustable excitation is useful, but passenger-car experience needs truck-duty validation.", benefit: "Wound field offers a magnet-free main drive, with control over the rotor field. In a truck, continuous rotor heat, cooling capacity and excitation-system durability must be proven over the working day. Car production is a foundation, not a truck readiness rating." },
    { band: "strong", prospect: "Strong in selected vehicles", reason: "Commercial-vehicle products provide direct evidence, particularly for lighter delivery applications.", benefit: "ZF’s CeTrax lite gives induction a concrete commercial-vehicle route. The adoption case combines an established drive with no rotor excitation hardware. Extending that case to heavy trucks depends on continuous efficiency, cooling and payload over the intended route." },
    { band: "developing", prospect: "Packaging-dependent", reason: "Abundant magnet material helps supply resilience; continuous torque and drive volume set the hurdle.", benefit: "Ferrite avoids a rotor supply, but recovering torque from its weaker magnetic field can require more material or different speed and gearing. Commercial adoption depends on fitting the complete drive without sacrificing payload, cooling capacity or energy efficiency." },
    { band: "developing", prospect: "Candidate with drive redesign", reason: "Industrial use supports sustained operation; road-duty torque density and inverter demand still matter.", benefit: "Industrial synchronous-reluctance drives demonstrate useful efficiency in continuous operation. Truck and bus adoption additionally requires compact traction packaging, overload capability and a suitable inverter. Factory motor maturity is not the same as a vehicle service record." },
    { band: "developing", prospect: "Candidate for selected duties", reason: "Rotor robustness is attractive for working vehicles; torque control, noise and durability need validation.", benefit: "Commercial vehicles can give rotor simplicity more weight than a premium passenger car does. Even so, buses need passenger comfort and trucks need precise torque delivery. The case rests on a validated motor-and-controller system, not the steel rotor alone." },
  ],
};
const routes: Route[] = [
  {
    name: "Wound field", ...assessments.cars[0],
    size: "Rotor windings, excitation hardware and cooling all occupy space. Compare their combined envelope, especially in a scooter.",
    maintenance: "Brushes, where fitted, are wear components. Contactless excitation avoids brush wear but adds power-transfer electronics; bearings, insulation and cooling still need servicing.",
    replacement: "The replacement drive must match the rotor supply, inverter and control calibration as well as mounting and gearing.",
    control: "Controls manage stator torque and rotor excitation together. Fault handling must cover both electrical circuits.",
    technology: "Established in production passenger-car main drives. Contactless excitation has a different development and validation path.",
    market: {"cars": "BMW’s Gen6 announcement retains the wound-field approach used in its Gen5 cars.", "light": "Car deployment does not establish a scooter service network or a competitive small-vehicle package.", "commercial": "Car experience is useful, but continuous truck-duty operation and fleet servicing need separate validation."},
    evidence: <><a href="https://www.press.bmwgroup.com/global/article/detail/T0448099EN/charge-faster-drive-further-bmw-group-reveals-revolutionary-electric-drive-concept-with-800v">BMW</a> uses wound field for its Gen6 rear drive. Supplier <a href="https://www.zf.com/products/en/cars/products_77186.html">ZF</a> offers a contactless excitation concept. These establish car experience and a development path for the rotor supply.</>,
  },
  {
    name: "Induction", ...assessments.cars[1],
    size: "Rotor losses add cooling demand under load. Overall size depends on the motor, inverter and cooling sized for continuous duty.",
    maintenance: "No rotor brushes or magnets. Bearings, winding insulation, cooling and inverter electronics remain service items.",
    replacement: "Requires compatible voltage, mounting, gearing, inverter capacity and control software; not a direct substitute for a different motor family.",
    control: "Mature variable-frequency control must regulate current and account for slip. Torque monitoring and fault handling remain essential.",
    technology: "Established in road vehicles and industrial drives.",
    market: {"cars": "The original Roadster used it as the propulsion motor. Audi’s front-axle use supplements a permanent-magnet rear drive.", "light": "Small-vehicle adoption depends on efficiency and cooling at the chosen voltage and load; car examples do not establish that fit.", "commercial": "ZF offers CeTrax lite for light commercial vehicles. This does not establish suitability for every bus or heavy truck."},
    evidence: <>The original <a href="https://service.tesla.com/docs/Public/Roadster/TheoryOp/1.2.5/do/40.html">Tesla Roadster</a> used induction as its propulsion motor. <a href="https://www.audi.com/en/the-audi-q6-e-tron-electric-mobility-on-a-new-level-15929/sporty-performance-powerful-drives-15932">Audi’s Q6 e-tron quattro</a> combines front induction with a permanent-magnet rear motor. <a href="https://www.zf.com/products/en/cv/products_76428.html">ZF’s CeTrax lite</a> uses induction for light commercial vehicles.</>,
  },
  {
    name: "Ferrite magnets", ...assessments.cars[2],
    size: "Weaker magnets can require more magnet volume, different geometry or higher speed and gearing changes. Redesign can trade these against one another.",
    maintenance: "No rotor excitation wear parts. Magnet demagnetisation, bearings, insulation and cooling still require protection and diagnosis.",
    replacement: "Ferrite cannot simply replace NdFeB in an unchanged rotor. Motor geometry, gearing and controller calibration may need revision.",
    control: "Uses permanent-magnet drive control, with current limits and demagnetisation protection matched to the ferrite design.",
    technology: "Ferrite magnets are established materials; traction designs range from prototypes to vehicle certification.",
    market: {"cars": "Proterial demonstrated a car-scale prototype; this is not evidence of broad passenger-car production.", "light": "Ola announced scooter ferrite-motor certification in October 2025, a concrete vehicle-specific milestone.", "commercial": "Continuous torque and payload-preserving packaging need application-specific validation; a car prototype does not establish fleet readiness."},
    evidence: <><a href="https://cdn.olaelectric.com/sites/evdp/pages/investor/announcement/Intimation_of_Press_Release_titled_Ola_Electric_Becomes_India_First_Automotive_OEM_to_Get_Government_Certification_For_its_In-House_Developed_Ferrite_Motor_dated_October_06_2025.pdf">Ola Electric</a> announced ferrite-motor certification in October 2025. <a href="https://www.proterial.com/e/press/2023/pdf/20230724en.pdf">Proterial</a> demonstrated a car-scale prototype. The two examples represent different vehicles and different readiness milestones.</>,
  },
  {
    name: "Synchronous reluctance", ...assessments.cars[3],
    size: "Lower power factor can require a larger inverter and more cooling. Rotor simplicity alone does not make the complete drive smaller.",
    maintenance: "No rotor windings, magnets or brushes. Bearings, stator insulation, cooling and controller diagnostics still matter.",
    replacement: "Requires a matched inverter, current rating and control map, plus compatible mechanical mounting and gearing.",
    control: "Field-oriented control regulates current and torque; current demand and rotor-position sensing or estimation must work across the duty cycle.",
    technology: "Established industrial products; vehicle integration is a distinct development task.",
    market: {"cars": "Industrial sales demonstrate the technology, while compact traction torque density remains a hurdle.", "light": "Chara lists motor-and-controller systems for scooters and passenger/cargo three-wheelers. Supplier availability is distinct from a fleet service record.", "commercial": "Industrial continuous-duty experience is relevant, but road-duty overloads, packaging and service support need validation."},
    evidence: <><a href="https://www.chara.co.in/solutions">Chara Technologies</a> lists systems for scooters, passenger and cargo three-wheelers. <a href="https://new.abb.com/news/detail/80775/ie5-synchronous-reluctance-motors">ABB</a> sells industrial drives. <a href="https://ieeexplore.ieee.org/document/7542569/">Traction research</a> identifies torque density and power factor as reasons to add magnet assistance; ferrite assistance is included in the ferrite route.</>,
  },
  {
    name: "Switched reluctance", ...assessments.cars[4],
    size: "Count the inverter, cooling and noise-control measures alongside the simple rotor. The smallest rotor is not necessarily the smallest drive.",
    maintenance: "No rotor windings, magnets or brushes. Dedicated power electronics, sensors and software still need parts and diagnostic support.",
    replacement: "Requires a compatible switched-reluctance power stage and control software; an ordinary PM-drive replacement is insufficient.",
    control: "Precise current timing and shaping limit torque ripple and noise. Vehicle testing must validate smooth torque delivery and fault handling.",
    technology: "Commercial ventilation products and traction research establish different stages of maturity.",
    market: {"cars": "Refined passenger-car integration needs further motor and control development. Ventilation sales are not automotive deployment evidence.", "light": "Utility applications are candidates; smooth low-speed torque, cost and durability need vehicle-level demonstration.", "commercial": "Rotor robustness is attractive, but bus comfort, truck torque delivery and fleet durability still require validation."},
    evidence: <><a href="https://support.turntide.com/hc/en-us/article_attachments/45903905133332">Turntide</a> sells ventilation systems. <a href="https://impact.ornl.gov/en/publications/a-framework-for-multiple-objective-co-optimization-of-switched-re/">Oak Ridge National Laboratory</a> studies motor design and current control together to reduce torque ripple. These support the mechanism and engineering challenge, rather than a claim of broad vehicle deployment.</>,
  },
];

export function DisplacementDiagram() {
  const [application, setApplication] = useState<Application>("cars");
  const current = applications.find((item) => item.id === application)!;
  const ranked = routes.map((route, index) => ({ ...route, ...assessments[application][index] })).sort((a, b) => ["strongest", "strong", "promising", "developing", "longer"].indexOf(a.band) - ["strongest", "strong", "promising", "developing", "longer"].indexOf(b.band));
  return (
    <section className="clean-diagram displacement" aria-label="Rare-earth magnet displacement prospects">
      <div className="displacement__scroll" data-scrolls tabIndex={0} aria-label="Five alternatives: scroll to compare and open each for details">
        <header className="displacement__header">
          <p>Rare-earth magnet displacement · near-term prospects</p>
          <label className="displacement__select">Vehicle type
            <select value={application} onChange={(event) => setApplication(event.target.value as Application)}>
              {applications.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <span>Longer bar · stronger adoption case</span>
          <details className="displacement__criteria" key={application}>
            <summary>What matters for this vehicle</summary>
            <p className="displacement__needs">{current.needs}</p>
            <p className="displacement__basis">The judgement weighs vehicle readiness, space, efficiency, servicing and control demands. Equal bars indicate a similar case, not a forecast of market share.</p>
          </details>
        </header>
        <div className="displacement__routes">
          {ranked.map((route) => (
            <details className="displacement__route" key={`${application}-${route.name}`}>
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
                <div className="displacement__logic"><h3>Why this position</h3><p>{route.benefit}</p></div>
                <table className="displacement__table">
                  <caption>{route.name}: practical considerations for {current.name.toLowerCase()}</caption>
                  <tbody>
                    <tr><th scope="row">Physical size</th><td>{route.size}</td></tr>
                    <tr><th scope="row">Maintenance &amp; repair</th><td>{route.maintenance}</td></tr>
                    <tr><th scope="row">Replacement</th><td>{route.replacement}</td></tr>
                    <tr><th scope="row">Technology readiness</th><td>{route.technology}</td></tr>
                    <tr><th scope="row">Market readiness</th><td>{route.market[application]}</td></tr>
                    <tr><th scope="row">Control &amp; safety</th><td>{route.control}</td></tr>
                  </tbody>
                </table>
                <div className="displacement__evidence"><h3>Evidence and readiness</h3><p>{route.evidence}</p></div>
              </div>
            </details>
          ))}
        </div>
        <p className="displacement__hint">Open a route for the reasoning, practical constraints and supporting evidence.</p>
        <details className="displacement__context">
          <summary>Why vehicle type changes the answer</summary>
          <p>The <a href="https://www.iea.org/reports/global-ev-outlook-2026/executive-summary">IEA’s 2026 outlook</a> reports that electric two- and three-wheeler sales grew more than 30% year-on-year in India in the first quarter of 2026. Globally, electric car sales exceeded 20 million in 2025, while electric truck sales more than doubled. Vehicle volume matters, alongside magnet mass per drive and the number of drives per vehicle.</p>
          <p>For high-performance cars, power density and repeated acceleration make packaging and cooling especially demanding. Permanent magnets are attractive, but the induction-powered Roadster shows they are not essential for every sports car.</p>
          <p>For factory drives and ventilation, ABB and Turntide already offer reluctance systems. Their operating conditions differ from road vehicles. Across all applications, compare dimensions and mass at the same continuous torque, speed and cooling conditions. Better batteries do not remove motor-space or heat constraints.</p>
          <p>Repairability depends on the supplier’s parts, diagnostics and service network. A simple rotor does not guarantee a repairable drive. Changing motor family requires matching the inverter, mounting, cooling, gearing and software. Every traction drive needs validated torque control and fault handling.</p>
        </details>
        <aside className="displacement__partial">
          <strong>Using less is another route.</strong> Low-dysprosium grades reduce heavy-rare-earth use but retain neodymium and praseodymium. <a href="https://www.proterial.com/e/press/2025/n0722b.html">Proterial</a> makes reduced-heavy-rare-earth grades and has developed heavy-rare-earth-free traction grades. Carmakers still need to qualify the magnet’s heat tolerance and resistance to demagnetisation.
        </aside>
      </div>
    </section>
  );
}
