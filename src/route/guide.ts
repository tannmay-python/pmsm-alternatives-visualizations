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
    lookFor: "Move the slider until housing, stator, rotor, shaft, bearing and end cap occupy separate positions.",
    takeaway: "The interfaces matter: bore clearance, shaft keying and bearing location define how the parts work together.",
    next: "Inspect the stationary ring first.",
  },
  "open-the-machine/stator": {
    lookFor: "With the rotor hidden, follow copper groups around the laminated steel ring.",
    takeaway: "The stator is the fixed electromagnet system: steel carries flux and phase groups carry current.",
    next: "Compare it with the rotating assembly alone.",
  },
  "open-the-machine/rotor": {
    lookFor: "Face the rotor cross-section and find magnets in pockets, keyed to the central shaft.",
    takeaway: "The rotor carries the field that the stator field pulls; in this reference machine that field is buried NdFeB.",
    next: "Measure the narrow region where the two fields meet.",
  },
  "open-the-machine/air-gap": {
    lookFor: "Locate the small radial clearance between stator teeth and rotor surface.",
    takeaway: "No mechanical contact transmits torque; flux density across that tight gap does.",
    next: "See how still coils make their pull travel around the gap.",
  },

  "three-coils-one-field/one-phase": {
    lookFor: "Find groups A, B and C around the bore, then energise A and watch its green field pointer hold one angle.",
    takeaway: "Curling your right-hand fingers with a group's current gives its north direction; one fixed pole does not travel.",
    next: "Add the other two groups with timed offsets.",
  },
  "three-coils-one-field/three-phases": {
    lookFor: "Scrub electrical angle and follow the green resultant pointer against the three labelled phase groups.",
    takeaway: "Currents offset by one third of a cycle sum into one field vector whose angle follows the electrical input.",
    next: "Distinguish the travelling pull from the copper that remains bolted in place.",
  },
  "three-coils-one-field/no-part-moves": {
    lookFor: "Keep the green field pointer sweeping while every copper conductor stays fixed in its slot.",
    takeaway: "The inverter chooses field speed through frequency; no winding needs to physically circulate.",
    next: "Put a rotor with its own poles into that moving pull.",
  },
  "three-coils-one-field/rotor-locks": {
    lookFor: "Watch the orange rotor-magnet axis chase the green stator-field axis along the orange latch arc.",
    takeaway: "The rotor latches to the sweeping field with a small load-dependent trail while both turn at the same average rate.",
    next: "Separate the buried-magnet pull from shaped-steel alignment torque.",
  },

  "two-pulls-one-shaft/why-buried": {
    lookFor: "Inspect bridges over magnet pockets and imagine centrifugal load at speed.",
    takeaway: "Interior placement retains magnets mechanically and lets steel shape the magnetic circuit.",
    next: "See what that asymmetric magnetic path adds.",
  },
  "two-pulls-one-shaft/lopsided": {
    lookFor: "Contrast the easy path through laminated steel with the harder path through magnet material.",
    takeaway: "Deliberate magnetic asymmetry gives the rotor a preferred orientation relative to stator flux.",
    next: "Turn that preference into measurable alignment torque.",
  },
  "two-pulls-one-shaft/reluctance": {
    lookFor: "Separate the magnet-pull contribution from the steel-alignment contribution at the same shaft.",
    takeaway: "An interior-magnet machine makes reluctance torque without adding a second rotor field source.",
    next: "Load the shaft and watch both contributions respond.",
  },
  "two-pulls-one-shaft/load-angle": {
    lookFor: "Increase load and compare the field direction with the rotor's trailing direction.",
    takeaway: "More torque demand opens the load angle until the available electromagnetic pull reaches its limit.",
    next: "Connect this geometry to mainstream traction naming.",
  },
  "two-pulls-one-shaft/already-both": {
    lookFor: "Read IPM-SynRM as one rotor using both buried magnets and reluctance paths.",
    takeaway: "Production machines already combine effects, so exclusive technology labels hide real design choices.",
    next: "Examine the magnet properties those buried magnets must supply.",
  },

  "strength-and-stubbornness/remanence": {
    lookFor: "Read where the curve meets the vertical axis after external help is removed.",
    takeaway: "Remanence measures retained magnetisation; iron supplies much of NdFeB's strength.",
    next: "Push from the right to test how hard that state is to undo.",
  },
  "strength-and-stubbornness/coercivity": {
    lookFor: "Slide reverse field until the vertical marker reaches the curve's knee.",
    takeaway: "Coercivity is the reverse-field margin before magnetisation collapses; plain iron has almost none.",
    next: "Rotate a crystal axis to see where that resistance originates.",
  },
  "strength-and-stubbornness/anisotropy": {
    lookFor: "Turn the easy-axis needle away from the applied field and read the rising energy-cost bar.",
    takeaway: "Neodymium's spin-orbit-coupled crystal structure supplies directional preference, not raw magnetic strength.",
    next: "Assign each element's role in the alloy.",
  },
  "strength-and-stubbornness/division-of-labour": {
    lookFor: "Compare iron's height with neodymium's horizontal reach and NdFeB's combined curve.",
    takeaway: "Strength and reversal resistance are different material jobs; a viable magnet needs both.",
    next: "Test the combined margin as a traction rotor heats.",
  },

  "heat-and-the-patch/hot-margin": {
    lookFor: "Raise temperature first, then opposing field; compare the solid curve's knee with the cold ghost.",
    takeaway: "Traction design is a combined-stress problem: heat shrinks coercive margin while acceleration supplies reverse field.",
    next: "Look inside one grain to see where local reversal begins.",
  },
  "heat-and-the-patch/reversal-start": {
    lookFor: "Drive the orange reversed region from the grain surface inward, then read its state after cooling.",
    takeaway: "Demagnetisation nucleates at a vulnerable surface and grows inward; cooling does not restore the reversed volume.",
    next: "Add the element that can protect that vulnerable edge.",
  },
  "heat-and-the-patch/dysprosium-tradeoff": {
    lookFor: "Increase dysprosium and watch the knee move right while the curve's height falls.",
    takeaway: "Dy/Tb restores high-temperature lock but reduces remanence and concentrates supply exposure in a small additive.",
    next: "Ask how much of the grain actually needs that protective element.",
  },
  "heat-and-the-patch/diffusion-evolution": {
    lookFor: "Change shell depth beside uniform doping; the Dy-rich boundary moves inward while the core remains visible.",
    takeaway: "Grain-boundary diffusion evolved the alloy from distributed Dy to edge-targeted protection with far less controlled material.",
    next: "Split light and heavy rare-earth exposure explicitly.",
  },

  "which-rare-earth/the-split": {
    lookFor: "Separate the wide Nd/Pr block from the small Dy/Tb block marked by the notice.",
    takeaway: "The April 2025 action targets medium/heavy items; treating every rare earth as identical obscures the actual exposure.",
    next: "Check whether the action removed supply or gated it.",
  },
  "which-rare-earth/licence-not-ban": {
    lookFor: "Read licence required, not banned, on the control boundary.",
    takeaway: "Approval time and approval certainty become programme risks even when trade remains legally possible.",
    next: "Rank responses from least to most disruptive.",
  },
  "which-rare-earth/the-cheapest-move": {
    lookFor: "Climb cooling, diffusion, HREE-free material, alternate chemistry and new architecture in order.",
    takeaway: "The first credible move attacks heavy-REE need while retaining the motor architecture.",
    next: "See thermal management as another way to reduce that need.",
  },
  "which-rare-earth/cool-it-instead": {
    lookFor: "Cool the rotor and watch required thermal margin fall without changing magnet chemistry.",
    takeaway: "Direct rotor oil cooling can reduce heavy-REE pressure by reducing heat, not by removing dysprosium.",
    next: "Check whether a heavy-REE-free magnet had already been announced.",
  },
  "which-rare-earth/already-happened": {
    lookFor: "Place Proterial's July 2025 announcement inside the control period.",
    takeaway: "HREE-free NdFeB moved from concept toward motor-use development during the policy event.",
    next: "Turn to the engineering reason a magnet may still be replaced.",
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
