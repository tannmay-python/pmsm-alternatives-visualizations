export type StateGuide = {
  /** What the reader should locate in this exact scene, not a restatement of the title. */
  lookFor: string;
  /** The mechanism or evidence rule the scene establishes. */
  takeaway: string;
  /** The specific question the next scene is set up to answer. */
  next: string;
};

/**
 * A guide entry exists for every (stop, state) pair. The route test fails if a
 * new scene is added without saying what to see, why it matters, and where the
 * argument goes next.
 */
export const stateGuides: Record<string, StateGuide> = {
  "the-problem/the-halt": {
    lookFor: "Watch the chain thin after separation and sintering, then read the date at the gate.",
    takeaway: "A licence requirement can hold vehicle production even when the material itself has not disappeared.",
    next: "Trace which industrial stage made that gate effective.",
  },
  "the-problem/the-chain": {
    lookFor: "Follow ore, separation, magnet, motor and car as one route rather than five unrelated boxes.",
    takeaway: "A reported permanent-magnet share of 70–80% puts most EV traction programmes at the end of this chain.",
    next: "See which stage is owned most narrowly.",
  },
  "the-problem/the-chokepoint": {
    lookFor: "Compare mining, refining and magnet output; refining and finished magnets are the tall bars.",
    takeaway: "Separating chemically similar rare earths is the scarce midstream capability behind the upstream headline.",
    next: "Find the one car assembly that depends on it.",
  },
  "the-problem/one-part": {
    lookFor: "Let the body fade and inspect the battery floor, drive unit and driven wheel.",
    takeaway: "Most of the vehicle carries over; the exposed dependency sits in a small traction-drive volume.",
    next: "Open that unit far enough to see its rotor.",
  },
  "the-problem/one-kilogram": {
    lookFor: "Look down the rotor bore for V-shaped magnet pockets rather than treating it as a grey cylinder.",
    takeaway: "Roughly 1–2 kg of engineered magnet can decide whether an otherwise complete motor design remains buildable.",
    next: "Ask what would actually have to change to remove that dependency.",
  },
  "the-problem/the-real-question": {
    lookFor: "Keep three questions separate: how the machine turns, what the magnet does, and which elements were named.",
    takeaway: "Judging an alternative requires mechanism, material property and supply scope together.",
    next: "Start with the energy path from battery to road.",
  },

  "where-the-motor-lives/power-path": {
    lookFor: "Track one pulse from DC pack, through the inverter's three phases, into rotation at the wheel.",
    takeaway: "The inverter converts stored DC into timed AC; the motor converts that timing into torque.",
    next: "Zoom into the housing where those functions are packaged.",
  },
  "where-the-motor-lives/drive-unit": {
    lookFor: "Use the callouts to separate inverter, motor barrel and reduction gear from the wheel shaft.",
    takeaway: "A traction motor is designed inside a thermal, electrical and mechanical package, not as a standalone component.",
    next: "Open the machine to find its stationary and rotating members.",
  },

  "open-the-machine/explode": {
    lookFor: "Drag the Explode slider to separate the outer aluminum housing, stationary stator, spinning rotor, output shaft, and bearings.",
    takeaway: "The motor splits into a stationary electromagnetic system (stator) and a spinning permanent magnet assembly (rotor).",
    next: "Inspect the stationary stator ring first.",
  },
  "open-the-machine/stator": {
    lookFor: "Follow the copper winding coils distributed inside the slots of the laminated silicon steel ring.",
    takeaway: "The stator is the stationary electromagnet: steel laminations channel magnetic flux, and 3-phase copper coils carry AC current.",
    next: "Compare it with the rotating magnet assembly.",
  },
  "open-the-machine/rotor": {
    lookFor: "Find the V-shaped pockets inside the spinning rotor steel where NdFeB permanent magnets are buried.",
    takeaway: "Burying magnets inside the rotor steel (IPM) keeps them structurally secure at 18,000 RPM and produces reluctance torque.",
    next: "Inspect the narrow air gap where the two magnetic systems interact.",
  },
  "open-the-machine/air-gap": {
    lookFor: "Look down the bore at the tiny sub-millimetre clearance between the stationary stator teeth and the spinning rotor surface.",
    takeaway: "There is zero mechanical contact: 100% of the vehicle's driving torque crosses this sub-millimetre gap purely through magnetic flux lines.",
    next: "See how three still coils create a rotating magnetic field.",
  },

  "three-coils-one-field/electromagnet-rule": {
    lookFor: "Toggle current direction and observe the magnetic field vector point along the coil axis toward North.",
    takeaway: "Curling your right-hand fingers with coil current gives its North direction; one fixed coil makes one stationary pole.",
    next: "Inspect this single coil group inside the physical stator.",
  },
  "three-coils-one-field/one-phase": {
    lookFor: "Find Phase A at the top of the bore and observe its fixed vertical magnetic field vector.",
    takeaway: "One stationary coil group makes one fixed magnetic pole that cannot travel on its own.",
    next: "Combine three coil groups with timed electrical phase offsets.",
  },
  "three-coils-one-field/three-phase-math": {
    lookFor: "Scrub electrical angle and follow the three AC current waveforms summing into one rotating resultant field vector.",
    takeaway: "Currents offset by one third of a cycle sum into a constant-magnitude field vector that sweeps around the bore.",
    next: "Look at the rotating magnetic field inside the 3D motor bore.",
  },
  "three-coils-one-field/no-part-moves": {
    lookFor: "Observe the field vector rotating continuously while every copper coil remains stationary in its slot.",
    takeaway: "The inverter creates rotational motion through electronic AC phase frequency without moving a single wire.",
    next: "Put a permanent magnet rotor into that rotating magnetic field.",
  },
  "three-coils-one-field/rotor-locks": {
    lookFor: "Watch the rotor's permanent magnets lock onto the sweeping stator field and trail at a fixed load angle.",
    takeaway: "The rotor synchronises with the rotating stator field, maintaining exact speed matching at the inverter frequency.",
    next: "Examine why magnets are buried in V-slots and how steel geometry adds reluctance torque.",
  },

  "two-pulls-one-shaft/why-buried": {
    lookFor: "Inspect the laminated steel bridges retaining buried magnets against centrifugal load at speed.",
    takeaway: "Interior placement retains magnets mechanically against extreme centrifugal forces at high RPM.",
    next: "Explore how buried magnets create magnetic asymmetry and reluctance torque.",
  },
  "two-pulls-one-shaft/reluctance-split": {
    lookFor: "Compare the magnet-pull contribution with the steel-alignment reluctance torque on the decomposition graph.",
    takeaway: "Interior magnet placement forces flux through steel paths, generating 30–40% reluctance torque alongside magnet pull.",
    next: "Inspect the complete production IPM-SynRM machine in 3D.",
  },
  "two-pulls-one-shaft/already-both": {
    lookFor: "Read IPM-SynRM as one rotor using both buried permanent magnets and reluctance flux paths.",
    takeaway: "Production machines already harvest steel reluctance torque to reduce expensive rare-earth magnet content.",
    next: "Examine the magnet properties those buried magnets must supply.",
  },

  "strength-and-stubbornness/division-of-labour": {
    lookFor: "Compare iron's high pulling power with neodymium's rigid direction lock.",
    takeaway: "Pulling power (muscle) and resistance to flipping (grip) are different jobs; an EV magnet needs both.",
    next: "Test what happens when the motor's coils push back against the magnet.",
  },
  "strength-and-stubbornness/anisotropy": {
    lookFor: "Slide the stator push slider and observe the atomic compass lock holding firm.",
    takeaway: "Neodymium's atomic structure acts like a clamp, keeping the magnetic field pointing forward during full throttle.",
    next: "See where the operating cliff lies on the demagnetisation curve.",
  },
  "strength-and-stubbornness/remanence": {
    lookFor: "Read the 1.4 T magnetic pull delivered at rest with zero opposing current.",
    takeaway: "Iron supplies massive raw magnetic pull, giving the motor its intense low-end torque.",
    next: "Push opposing current from the right to test when the magnet falls off the cliff.",
  },
  "strength-and-stubbornness/coercivity": {
    lookFor: "Slide the opposing stator push until the operating cursor reaches the cliff (the knee).",
    takeaway: "Inside the flat plateau, the magnet delivers 100% torque; past the cliff, magnetic pull collapses permanently.",
    next: "Test how heat moves the cliff and shrinks the motor's safety headroom.",
  },

  "heat-and-the-patch/hot-margin": {
    lookFor: "Raise rotor temperature to 160 °C and apply full acceleration to see the safety headroom shrink.",
    takeaway: "Heat weakens the magnetic lock, so hard acceleration risks permanently destroying hot magnets.",
    next: "See how heavy rare earths restore thermal resistance.",
  },
  "heat-and-the-patch/dysprosium-tradeoff": {
    lookFor: "Increase dysprosium content and watch the hot cliff move outward to restore safety headroom.",
    takeaway: "Dysprosium restores high-temperature protection, but dilutes iron and concentrates supply chain exposure.",
    next: "Look inside one magnet grain to see where heat and magnetic reversal attack.",
  },
  "heat-and-the-patch/reversal-start": {
    lookFor: "Watch magnetic reversal attack the outer grain boundary shell first before penetrating the core.",
    takeaway: "Demagnetisation attacks vulnerable grain surfaces; cooling down does not restore the lost magnetic power.",
    next: "Target the heavy rare-earth protective layer only at the surface.",
  },
  "heat-and-the-patch/diffusion-evolution": {
    lookFor: "Compare modern grain-boundary diffusion (outer skin shield) with legacy bulk core doping.",
    takeaway: "Shielding only the outer 200 nm skin protects the magnet against heat while cutting Dysprosium use by 75%.",
    next: "Split light and heavy rare-earth supply exposures explicitly.",
  },

  "which-rare-earth/the-split": {
    lookFor: "Separate the 30% Nd/Pr light rare-earth bulk from the 1–2% Dy/Tb heavy rare-earth additive.",
    takeaway: "The April 2025 licence controls targeted scarce heavy elements, not widely mined light rare earths.",
    next: "Check whether the notice was a blanket ban or an administrative gate.",
  },
  "which-rare-earth/licence-not-ban": {
    lookFor: "Read licence required, not banned, on the control boundary.",
    takeaway: "Approval time and licence certainty become programme risks even when trade remains legally possible.",
    next: "Rank engineering responses from least to most disruptive.",
  },
  "which-rare-earth/the-cheapest-move": {
    lookFor: "Climb cooling, diffusion, HREE-free material, alternate chemistry and new architecture in order.",
    takeaway: "The first credible move eliminates heavy-REE need while retaining the proven PMSM architecture.",
    next: "See thermal management as another way to reduce that need.",
  },
  "which-rare-earth/cool-it-instead": {
    lookFor: "Cool the rotor with direct oil injection and observe required thermal margin drop.",
    takeaway: "Direct rotor oil cooling can reduce heavy-REE pressure by reducing operating heat below 120 °C.",
    next: "Check whether heavy-REE-free traction magnets already exist in production.",
  },
  "which-rare-earth/already-happened": {
    lookFor: "Inspect commercial heavy-rare-earth-free NdFeB magnet grades developed during the controls.",
    takeaway: "HREE-free NdFeB moved from research into motor qualification during the 2025 trade controls.",
    next: "Turn to the fundamental electrical ceiling of permanent magnets.",
  },

  "the-weakness/always-on": {
    lookFor: "Try to reduce the permanent field and observe that no excitation control exists.",
    takeaway: "A permanent rotor field is always present whenever the rotor turns, including fault and high-speed cases.",
    next: "Follow that field into the stator electrical circuit.",
  },
  "the-weakness/back-emf": {
    lookFor: "Sweep speed and watch induced voltage climb along the curve toward the bus line.",
    takeaway: "Rotor motion induces a back voltage proportional to flux and speed, opposing the inverter's ability to push current.",
    next: "Identify the voltage ceiling created by the DC bus.",
  },
  "the-weakness/ceiling": {
    lookFor: "Bring the operating point near the dashed DC-bus line.",
    takeaway: "When available voltage headroom disappears, torque-producing current becomes limited by physics and hardware.",
    next: "See what current the controller spends to keep operating above that point.",
  },
  "the-weakness/field-weakening": {
    lookFor: "Increase counter-current and compare the shrinking net-flux marker with the growing non-torque burden.",
    takeaway: "Field weakening buys speed range by spending current to cancel part of the magnet's own flux.",
    next: "Gate the inverter and ask what remains.",
  },
  "the-weakness/fault": {
    lookFor: "Set counter-current to zero in the fault overlay; the magnet-induced voltage warning stays on.",
    takeaway: "Gating off controls does not switch off permanent-magnet generation, so protection hardware must address the case.",
    next: "Consider rotors whose field source can be changed.",
  },
  "the-weakness/the-obvious-fix": {
    lookFor: "Move from the always-on PM field to the family of controllable or absent rotor fields.",
    takeaway: "Removing supply exposure begins with changing how the rotor field is produced.",
    next: "Compare induction, wound-field and reluctance routes.",
  },

  "swap-the-rotor/family-tree": {
    lookFor: "Select PM, induction, wound, SynRM and SRM; compare exposure, rotor loss, control burden, change burden and cost pressure.",
    takeaway: "No alternative wins every metric; each relocates cost and complexity to a different subsystem.",
    next: "Open the induction cage to see how a rotor field can be induced.",
  },
  "swap-the-rotor/induction-principle": {
    lookFor: "Identify the shorted cage, then load the shaft and keep the green field pointer ahead of the rotor.",
    takeaway: "Relative motion induces rotor current; slip is therefore the operating principle, not a defect.",
    next: "Weigh that principle against loss, coasting and axle-level duty.",
  },
  "swap-the-rotor/induction-duty": {
    lookFor: "Cut inverter power to see the cage field die, then read induction as the unused-axle strategy.",
    takeaway: "Cage resistance makes torque and heat together, but an unpowered induction axle avoids the drag of always-on PM magnets.",
    next: "Replace induced current with deliberately fed rotor current.",
  },
  "swap-the-rotor/wound-control": {
    lookFor: "Fit copper rotor coils, then lower excitation while the green stator-field pointer sweeps at speed.",
    takeaway: "A wound rotor makes field strength an input, so high-speed weakening becomes control rather than cancellation loss.",
    next: "Trace the hardware that supplies and cools that spinning winding.",
  },
  "swap-the-rotor/wound-hardware": {
    lookFor: "Follow the second electrical supply into the rotor and separate production EESM evidence from transfer-hardware claims.",
    takeaway: "Renault, Nissan and BMW prove externally excited traction in production; their sources do not establish one shared brush design.",
    next: "Inspect the contactless rotating-transformer lane separately.",
  },
  "swap-the-rotor/contactless-frontier": {
    lookFor: "Replace brushes with a rotating transformer and read each programme's development status.",
    takeaway: "ZF I2SM, Mahle MCT and Valeo/Mahle iBEE are wound-field machines with contactless excitation, not verified series-production cars.",
    next: "Remove the rotor winding altogether with shaped steel.",
  },
  "swap-the-rotor/reluctance-spectrum": {
    lookFor: "Compare the flux-barrier steel rotor with small magnets added back into those barriers.",
    takeaway: "Pure reluctance deletes magnets and windings; poor power factor can require inverter burden, which PM assistance repairs.",
    next: "Go further by changing the stator topology too.",
  },
  "swap-the-rotor/srm-aluminium": {
    lookFor: "Fit the salient-pole machine, then pair SSRD peak power with continuous power and maximum speed.",
    takeaway: "Switched reluctance needs its own stator; aluminium coils support recyclability but ratings and thermal duty determine usability.",
    next: "Keep the same architecture and change only magnet chemistry.",
  },

  "change-the-magnet/a-different-layer": {
    lookFor: "Select NdFeB, ferrite and iron nitride while the underlying PMSM architecture remains identifiable.",
    takeaway: "Magnet chemistry is a layer stacked onto motor architecture; it is not a competing rotor principle.",
    next: "Start with ferrite's mature low-cost penalty.",
  },
  "change-the-magnet/ferrite-limit": {
    lookFor: "Compare ferrite's short remanence bar and enlarged magnet pockets with the NdFeB rotor, then run its cold-start case.",
    takeaway: "Ferrite removes rare-earth exposure but supplies about one third of NdFeB remanence; cold demagnetisation is its automotive guard.",
    next: "See how geometry compensates for that weak field.",
  },
  "change-the-magnet/compensate-geometry": {
    lookFor: "Grow, speed up or axialise the machine; watch active volume and packaging change.",
    takeaway: "Lower magnet strength is paid in steel, copper, diameter, stack length or higher rotational speed.",
    next: "Separate that geometry decision from chemistry.",
  },
  "change-the-magnet/independent-geometry": {
    lookFor: "Switch the axial disc between ferrite and NdFeB while its along-shaft flux path stays unchanged.",
    takeaway: "Axial flux describes geometry; ferrite describes chemistry. Conifer stacks both rather than conflating them.",
    next: "Read Proterial's prototype numbers with their speed conditions.",
  },
  "change-the-magnet/proterial-numbers": {
    lookFor: "Hold 102 kW with 15,000 rpm beside 110 kW with 10,000 rpm; do not compare power alone.",
    takeaway: "The ferrite prototype reports lower power at half again as much speed, so it is not demonstrated parity.",
    next: "Move from mature ferrite to proposed iron nitride.",
  },
  "change-the-magnet/iron-nitride-gates": {
    lookFor: "Read saturation, remanence, hardness, coercivity and thermal margin as separate gates on one material board.",
    takeaway: "High saturation does not make Fe16N2 drop-in; low hardness, limited coercivity and thermal stability remain development gates.",
    next: "Find the application where easy rewriting is useful.",
  },
  "change-the-magnet/variable-flux-fit": {
    lookFor: "Rewrite magnetisation in service and connect low coercivity to variable-flux control.",
    takeaway: "Matter's prototype treats adjustable magnetisation as a feature, so the best chemistry depends on the machine's goal.",
    next: "Assemble the layers without pretending they compete.",
  },
  "change-the-magnet/stackable-layers": {
    lookFor: "Build Conifer as ferrite plus axial flux, or IPM-SynRM as permanent magnet plus reluctance.",
    takeaway: "Chemistry, geometry, excitation and torque principle are independent axes; combinations are normal.",
    next: "Translate those combinations into vehicle-level work.",
  },

  "what-must-change/survivors": {
    lookFor: "Keep body, crash structure, interior, battery and suspension highlighted while the drive unit changes.",
    takeaway: "Architecture choice is concentrated in the drive unit, even though its consequences spread into controls and thermal systems.",
    next: "Map exactly where engineering burden lands.",
  },
  "what-must-change/burden": {
    lookFor: "Toggle architectures and watch motor, inverter, cooling and software panels change independently.",
    takeaway: "Every route moves cost somewhere: magnets, rotor excitation, inverter current, cooling or calibration.",
    next: "Order the routes by integration size.",
  },
  "what-must-change/spectrum": {
    lookFor: "Read Dy-lean, ferrite, induction, SynRM/SRM and wound-field positions from smallest to largest platform change.",
    takeaway: "Material reduction can be nearly invisible to the vehicle; new rotor excitation or topology is platform work.",
    next: "Add validation and homologation time to the comparison.",
  },
  "what-must-change/validation": {
    lookFor: "Light up control software, NVH, durability and homologation after hardware selection.",
    takeaway: "Validation length is architecture- and OEM-specific, but software and safety work rarely stops at the motor drawing.",
    next: "Separate EV traction from industrial-motor motives.",
  },
  "what-must-change/two-markets": {
    lookFor: "Switch between EV traction and industrial drives; incumbents and reasons to change swap.",
    takeaway: "EV replacement is largely a supply-risk story; industrial SynRM adoption is largely an efficiency-regulation story.",
    next: "State honestly how much has shipped.",
  },
  "what-must-change/where-we-are": {
    lookFor: "Read rare-earth-free traction as early and unevenly disclosed rather than as a settled market share.",
    takeaway: "The useful decision is problem-first: reduce Dy/Tb now, remove rare earths, improve high-speed control or serve a different market.",
    next: "Choose the metric that matches the problem instead of declaring one universal winner.",
  },
};

export function guideFor(stopId: string, stateId: string): StateGuide {
  return (
    stateGuides[`${stopId}/${stateId}`] ?? {
      lookFor: "",
      takeaway: "",
      next: "",
    }
  );
}
