# Where rare-earth magnets could lose ground

Review note — 10 September 2026

The comparison is about replacing rare-earth magnets, including through ferrite permanent-magnet motors. It is not a forecast of PMSM market share. Vehicle requirements change which alternative is most attractive.

## Application judgements

| Application | Stronger near-term cases | Main constraint |
|---|---|---|
| Passenger cars | Wound field for main drives; induction for selected roles | Range, refinement, cooling and packaging |
| Two- and three-wheelers | Ferrite has scooter certification evidence; synchronous reluctance has supplier offerings | Affordable compact drives, range, low-speed torque and service support |
| Trucks and buses | Induction has direct light-commercial product evidence; other routes need duty-specific validation | Continuous power, payload, cooling and fleet uptime |

These are editorial judgements from the cited examples and engineering constraints, not measured probabilities. Equal bands are allowed. An induction auxiliary axle paired with a PM main drive only partly removes a vehicle’s magnets.

## Motor-by-motor considerations

### Wound field

| Attribute | Consideration |
|---|---|
| Physical size | Rotor windings, excitation hardware and cooling all occupy space. Compare their combined envelope, especially in a scooter. |
| Maintenance and repair | Brushes, where fitted, are wear components. Contactless excitation avoids brush wear but adds power-transfer electronics; bearings, insulation and cooling still need servicing. |
| Replacement | The replacement drive must match the rotor supply, inverter and control calibration as well as mounting and gearing. |
| Technology readiness | Established in production passenger-car main drives. Contactless excitation has a different development and validation path. |
| Control and safety | Controls manage stator torque and rotor excitation together. Fault handling must cover both electrical circuits. |
| Market readiness — cars | BMW’s Gen6 announcement retains the wound-field approach used in its Gen5 cars. |
| Market readiness — light | Car deployment does not establish a scooter service network or a competitive small-vehicle package. |
| Market readiness — commercial | Car experience is useful, but continuous truck-duty operation and fleet servicing need separate validation. |

### Induction

| Attribute | Consideration |
|---|---|
| Physical size | Rotor losses add cooling demand under load. Overall size depends on the motor, inverter and cooling sized for continuous duty. |
| Maintenance and repair | No rotor brushes or magnets. Bearings, winding insulation, cooling and inverter electronics remain service items. |
| Replacement | Requires compatible voltage, mounting, gearing, inverter capacity and control software; not a direct substitute for a different motor family. |
| Technology readiness | Established in road vehicles and industrial drives. |
| Control and safety | Mature variable-frequency control must regulate current and account for slip. Torque monitoring and fault handling remain essential. |
| Market readiness — cars | The original Roadster used it as the propulsion motor. Audi’s front-axle use supplements a permanent-magnet rear drive. |
| Market readiness — light | Small-vehicle adoption depends on efficiency and cooling at the chosen voltage and load; car examples do not establish that fit. |
| Market readiness — commercial | ZF offers CeTrax lite for light commercial vehicles. This does not establish suitability for every bus or heavy truck. |

### Ferrite magnets

| Attribute | Consideration |
|---|---|
| Physical size | Weaker magnets can require more magnet volume, different geometry or higher speed and gearing changes. Redesign can trade these against one another. |
| Maintenance and repair | No rotor excitation wear parts. Magnet demagnetisation, bearings, insulation and cooling still require protection and diagnosis. |
| Replacement | Ferrite cannot simply replace NdFeB in an unchanged rotor. Motor geometry, gearing and controller calibration may need revision. |
| Technology readiness | Ferrite magnets are established materials; traction designs range from prototypes to vehicle certification. |
| Control and safety | Uses permanent-magnet drive control, with current limits and demagnetisation protection matched to the ferrite design. |
| Market readiness — cars | Proterial demonstrated a car-scale prototype; this is not evidence of broad passenger-car production. |
| Market readiness — light | Ola announced scooter ferrite-motor certification in October 2025, a concrete vehicle-specific milestone. |
| Market readiness — commercial | Continuous torque and payload-preserving packaging need application-specific validation; a car prototype does not establish fleet readiness. |

### Synchronous reluctance

| Attribute | Consideration |
|---|---|
| Physical size | Lower power factor can require a larger inverter and more cooling. Rotor simplicity alone does not make the complete drive smaller. |
| Maintenance and repair | No rotor windings, magnets or brushes. Bearings, stator insulation, cooling and controller diagnostics still matter. |
| Replacement | Requires a matched inverter, current rating and control map, plus compatible mechanical mounting and gearing. |
| Technology readiness | Established industrial products; vehicle integration is a distinct development task. |
| Control and safety | Field-oriented control regulates current and torque; current demand and rotor-position sensing or estimation must work across the duty cycle. |
| Market readiness — cars | Industrial sales demonstrate the technology, while compact traction torque density remains a hurdle. |
| Market readiness — light | Chara lists motor-and-controller systems for scooters and passenger/cargo three-wheelers. Supplier availability is distinct from a fleet service record. |
| Market readiness — commercial | Industrial continuous-duty experience is relevant, but road-duty overloads, packaging and service support need validation. |

### Switched reluctance

| Attribute | Consideration |
|---|---|
| Physical size | Count the inverter, cooling and noise-control measures alongside the simple rotor. The smallest rotor is not necessarily the smallest drive. |
| Maintenance and repair | No rotor windings, magnets or brushes. Dedicated power electronics, sensors and software still need parts and diagnostic support. |
| Replacement | Requires a compatible switched-reluctance power stage and control software; an ordinary PM-drive replacement is insufficient. |
| Technology readiness | Commercial ventilation products and traction research establish different stages of maturity. |
| Control and safety | Precise current timing and shaping limit torque ripple and noise. Vehicle testing must validate smooth torque delivery and fault handling. |
| Market readiness — cars | Refined passenger-car integration needs further motor and control development. Ventilation sales are not automotive deployment evidence. |
| Market readiness — light | Utility applications are candidates; smooth low-speed torque, cost and durability need vehicle-level demonstration. |
| Market readiness — commercial | Rotor robustness is attractive, but bus comfort, truck torque delivery and fleet durability still require validation. |

## Volume, performance and displacement

The IEA’s 2026 outlook reports Indian electric two- and three-wheeler sales growth above 30% year-on-year in Q1 2026, global electric car sales above 20 million in 2025, and more than a doubling of global electric truck sales in 2025. These are different markets and periods, so they are not directly comparable growth rates.

To estimate mineral displacement, combine vehicles adopting each route with motors replaced per vehicle and magnet mass per replaced motor. Do not multiply the indicative bars by vehicle sales.

High-performance cars put more weight on power density and repeated acceleration. This supports segmenting the comparison, not declaring permanent magnets essential. Tesla’s original induction-powered Roadster provides a counterexample.

Improved batteries may change vehicle design choices, but do not automatically compensate for motor volume, rotor losses or cooling hardware. No matched-output dataset here supports assigning one universal dimension, repair bill or service interval to each motor family.

## Sources

- [www.press.bmwgroup.com](https://www.press.bmwgroup.com/global/article/detail/T0448099EN/charge-faster-drive-further-bmw-group-reveals-revolutionary-electric-drive-concept-with-800v)
- [www.zf.com](https://www.zf.com/products/en/cars/products_77186.html)
- [service.tesla.com](https://service.tesla.com/docs/Public/Roadster/TheoryOp/1.2.5/do/40.html)
- [www.audi.com](https://www.audi.com/en/the-audi-q6-e-tron-electric-mobility-on-a-new-level-15929/sporty-performance-powerful-drives-15932)
- [www.zf.com](https://www.zf.com/products/en/cv/products_76428.html)
- [cdn.olaelectric.com](https://cdn.olaelectric.com/sites/evdp/pages/investor/announcement/Intimation_of_Press_Release_titled_Ola_Electric_Becomes_India_First_Automotive_OEM_to_Get_Government_Certification_For_its_In-House_Developed_Ferrite_Motor_dated_October_06_2025.pdf)
- [www.proterial.com](https://www.proterial.com/e/press/2023/pdf/20230724en.pdf)
- [www.chara.co.in](https://www.chara.co.in/solutions)
- [new.abb.com](https://new.abb.com/news/detail/80775/ie5-synchronous-reluctance-motors)
- [ieeexplore.ieee.org](https://ieeexplore.ieee.org/document/7542569/)
- [support.turntide.com](https://support.turntide.com/hc/en-us/article_attachments/45903905133332)
- [impact.ornl.gov](https://impact.ornl.gov/en/publications/a-framework-for-multiple-objective-co-optimization-of-switched-re/)
- [www.iea.org](https://www.iea.org/reports/global-ev-outlook-2026/executive-summary)
- [www.proterial.com](https://www.proterial.com/e/press/2025/n0722b.html)

## Follow-up verification — 10 September 2026

All 14 links in the section were clicked again. The 11 HTML destinations were readable in the browser, including the IEEE abstract and the IEA executive summary after loading. The three PDF files (Ola, Proterial and Turntide) returned valid documents and were downloaded and text-checked. IEA blocks some automated HTTP requests; IEEE initially returns an intermediate response. Neither was a broken browser destination during this check. IEEE full text may require subscription access; its abstract supports the cited finding.

Corrections: BMW's linked February 2025 announcement supports Gen6 architecture and continuity with Gen5, rather than independently proving a production-start date. Indian Q1 2026 sales growth is explicitly year-on-year. Rotor position can be sensed or estimated. Ola certification is a historical milestone; the text does not assert that subsequent deployment has not occurred.

The attribute tables describe engineering implications, not measured dimensions, repair costs or safety rankings. The relative adoption bands are the authors' application-specific synthesis of readiness and integration constraints. Sources support the underlying examples, not a published ranking of these five technologies.
