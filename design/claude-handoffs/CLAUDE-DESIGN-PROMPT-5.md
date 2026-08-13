# Claude Design Prompt 5

Design **Chapter 04: Reduce exposure—or replace the PMSM** for the established interactive PMSM learning experience.

This chapter should make a complicated choice feel baby-simple: first separate the two rare-earth problems; then show that smaller interventions preserve more of the existing drive unit; then reveal one permanent-magnet control limitation at high speed; finally place the motor families in two understandable groups.

The experience is for a curious beginner, not a motor engineer. Every state must teach **one visible mechanism**. The reader should never have to decode a dashboard, a dense chart, a chemistry diagram, or a wall of labels.

## Non-negotiable outcome

Create a responsive, implementation-ready desktop learning interface. Its proof viewport is **1280 × 720**, but it is a live layout, not a poster.

**Do not generate a fixed artboard.** Do not make a 1280px-wide canvas that clips, scales down, or merely happens to look correct in one screenshot. Specify a fluid implementation that works cleanly across ordinary desktop/laptop widths (roughly 1024–1440px), with 1280 × 720 as the required visual proof.

**Do not overlap labels.** No label may cross a leader, another label, the rail, the panel boundary, a control, or the edge of the viewport. If a label cannot fit in a clear zone, remove it. There are never more than **two on-stage labels** at once. Controls in the bottom dock are not on-stage labels, but they must still fit without wrapping or collision.

This is not a landing page, dashboard, generic science lab, or a new visual language. Extend the existing quiet dark editorial shell:

- Dark charcoal background; fine grey separators; no gradients, glossy cards, fake-device frames, or hero section.
- IBM Plex Sans for teaching copy and IBM Plex Mono for microcopy, controls, and labels.
- Existing notation colours only: steel grey, copper, magnet purple, flux/control cyan, heat red, restrained amber for the active chapter or protective material, and muted green only where a vehicle system changes.
- Small left chapter rail; central teaching stage; calm right learning panel.
- Click- and keyboard-based step progression. Do not turn this chapter into a long scroll story.
- Why and Evidence open only inside the right panel. The stage must remain visible and unchanged underneath.
- No cards-inside-cards, KPI tiles, gauges, equations, material recipes, atom balls, decorative legends, stock car renders, flags, maps, or company-logo collage.

## Responsive shell: use the Prompt 1 system, not a 1440px crop

At the required 1280 × 720 live viewport:

- Rail: 36px wide.
- Right learning panel: 360px wide, with a 1px divider and approximately 32px horizontal padding.
- Centre stage: the remaining 884px. Use `minmax(0, 1fr)` so the stage may shrink; never set a 1280px minimum width.
- Central stage padding: approximately 24px left/right and 20px top. Reserve a bottom control dock; it must not sit over the visual.
- Keep a large, uncluttered visual safe area above the dock. Treat it as a responsive SVG/viewBox region, not a pixel-locked illustration.
- The panel contains only: chapter/status line, short title, one learner question, one short visible takeaway, Why/Evidence tabs or disclosure, and Back/Next at the bottom. It must never force the page to scroll at 720px high.

At narrower desktop widths, reduce the rail to 32px and panel to about 300–310px before reducing the stage. Tighten only spacing and type size; do not let text overlap, crop, or hide behind the stage. No horizontal page scroll. Phone design is out of scope.

At wider desktop widths, preserve the same proportions and negative space rather than adding more labels or more chrome.

Use one shared stage coordinate system for all six states. All SVG geometry should be responsive and vector-native. Keep visual text outside SVG drawing groups as DOM labels, with explicit label-anchor positions and clear zones. Do not bake text into any asset.

## Chapter route: exact state count

The default main route is exactly **five** states. Its transport must read `1 OF 5` through `5 OF 5`.

1. `light-and-heavy-ree-supply` — **Split the supply problem**
2. `mitigation-ladder` — **Start with the smallest change**
3. `back-emf-speed-sweep` — **The magnet keeps generating**
4. `field-weakening-current` — **Pay current to cancel flux**
5. `sync-async-family-tree` — **Two families, not six boxes**

There is exactly one optional dive:

- `inverter-fault-at-speed` — **A field you cannot turn off**

The optional dive must be offered quietly after State 4, must not change `4 OF 5`, must not interrupt the main-route history, and must return to State 4 with its previous selected control state intact.

## Content and evidence rules

Use the wording and limits below. It is more important to be accurate than to sound comprehensive.

- A 4 April 2025 Chinese notice is a **dated export-control/licensing measure** for specified medium/heavy rare-earth related material forms, including Dy/Tb-related magnet materials. It is not a blanket ban.
- Nd and Pr were **not named in that specific announcement**. Never convert that omission into “secure supply”, “uncontrolled”, or a permanent claim.
- Dy/Tb supports coercivity and high-temperature resistance to reversal. It does not cool a magnet.
- HREE-free NdFeB means **Dy/Tb-free, not rare-earth-free**. The cited Proterial announcement is a pre-production/research-facility context, not a mass-production claim.
- Cooling and grain-boundary diffusion can be smaller changes than a complete motor-architecture swap, but “near-drop-in” still requires motor-specific validation.
- Any visual change map is qualitative. A motor change can affect motor, inverter/control, cooling, and validation work; it must not imply a universal list, duration, or that all other vehicle systems stay unchanged.
- The speed and family scenes are teaching models. Do not show vehicle-specific volts, rpm, losses, torque, efficiency, temperature, current values, or universal operating thresholds.
- Field weakening adds current that bucks fixed magnet flux and increases reactive-current/ohmic-loss burden. Do not say that all such current makes zero torque at every operating point.
- The fault comparison is safety-critical. Do not show a universal braking torque, DC-link spike, crash, shutdown outcome, or a vehicle fault procedure.

Every fact gets one job only:

- The stage shows the physical relationship.
- The panel title names the lesson.
- The learner question asks one clear question.
- Visible panel copy gives one causal takeaway.
- Why contains the formal mechanism or implication.
- Evidence contains source scope and the limit, not a repeated lesson.

Do not repeat a title, question, or complete factual sentence across those locations.

## Overall visual direction

The chapter should feel like a sequence of calm technical experiments, not six disconnected infographics. Keep a quiet ghosted e-axle / motor silhouette in the far background only where it helps establish scale. In each state, put one large teaching object in the foreground and remove everything that does not serve that state’s one mechanism.

Use geometry that reads at a glance:

- State 1: two material streams.
- State 2: one intervention ladder and one ghosted drive unit.
- State 3: one permanent-magnet rotor and one voltage ceiling.
- State 4: one flux relationship.
- State 5: two branches and a single slip marker.
- Optional fault dive: one matched before/after field comparison.

Do not force one literal object to persist when it would make the teaching dishonest. Continuity should come from the shell, colour grammar, motion language, and restrained background motor silhouette—not from reusing a diagram that no longer explains the mechanism.

## Main state 1 — Split the supply problem

**State ID:** `light-and-heavy-ree-supply`  
**Title:** `Split the supply problem`  
**Learner question:** `Which rare-earth exposure is this dated control notice actually about?`

**Visible beginner copy:**

`Nd/Pr gives a permanent magnet its main field. Dy/Tb helps it resist reversal when hot.`

**Why drawer:**

`These are different jobs. A heavy-rare-earth pressure can sometimes be reduced before replacing the whole motor.`

**Evidence drawer:**

`[Dated scope: the 4 Apr 2025 licensing notice covered specified Dy/Tb-related material forms. Nd/Pr were not named in that announcement; this is not a permanent supply-security claim.]`

### Stage

Show two large, simple material lanes arranged left-to-right inside one shared magnet silhouette or two matched magnet slices:

- A purple `Nd/Pr` lane feeds a single broad permanent-field lobe.
- A restrained amber `Dy/Tb` lane feeds a compact reversal-resistance boundary around the same field.
- A tiny, visually obvious licence-gate icon belongs only on the Dy/Tb route. It is a date-specific context marker, not a locked-door drama graphic.
- The selected lane brightens while the other lane quiets; no values, market shares, country flags, quantities, mine/refinery maps, or pie charts.

The only two possible on-stage labels are `ND/PR` and `DY/TB`. Put all role explanation in the panel, not next to the drawing. The gate has no prose label.

### Semantic interaction

Use one compact segmented control in the dock: `Nd/Pr` / `Dy/Tb`.

Selecting a group must reveal only its own role and relevant response path. It must not turn the stage into a detailed supply-chain map. Default state: both lanes visible, Dy/Tb subtly selected to make the dated-control distinction visible.

### Motion

On selection, one lane resolves in 350–500ms: its field or boundary draws once and holds. Do not animate global transport routes, shipping containers, flags, or a perpetual pulsing gate.

### Reduced-motion frame

Both lanes are visible: a broad purple field source for Nd/Pr and a small amber resistance boundary for Dy/Tb. The licence-gate context marker sits only on the Dy/Tb lane.

## Main state 2 — Start with the smallest change

**State ID:** `mitigation-ladder`  
**Title:** `Start with the smallest change`  
**Learner question:** `What is the smallest credible change an OEM can make first?`

**Visible beginner copy:**

`Not every supply response needs a new car. Smaller material or cooling changes can leave more of the drive unit in place.`

**Why drawer:**

`Move up the ladder only when the smaller response cannot meet the requirement. A full architecture change moves more engineering work.`

**Evidence drawer:**

`[Qualitative change map. HREE-free NdFeB removes Dy/Tb, not Nd/Pr; the cited 2025 announcement is pre-production. “Near-drop-in” still needs motor-specific validation. Do not infer a universal vehicle-change list or programme duration.]`

### Stage

Show one diagonal, five-rung intervention ladder beside a single ghosted e-axle silhouette. The ladder is the dominant object. It moves from a small close-to-the-magnet intervention to a full architecture change:

1. Rotor cooling
2. Grain-boundary diffusion
3. HREE-free NdFeB
4. Alternate magnet chemistry
5. New motor architecture

Do not write those five names on the rungs. They belong in the semantic control below the stage. On the visual, each rung is represented by a simple material/thermal/motor icon and a growing group of coloured parts in the ghosted drive unit.

At each selected rung:

- Unchanged modules stay neutral grey.
- The affected module(s) gain the active chapter accent.
- The active footprint grows only as needed: first a small rotor/magnet region, then more of the drive unit, then motor plus inverter/control/cooling/validation **as possible work**, never as a guaranteed universal checklist.

The two permissible on-stage labels are `KEEPS MORE` at the small-change end and `CHANGES MORE` at the architecture-change end. Do not label every hardware module.

### Semantic interaction

Use one five-position control called `Choose intervention`. The control labels may use the five exact intervention names above. A selection changes the highlighted physical footprint and the rung position; it must not launch a modal, card, or separate sub-flow.

Default selection: `Rotor cooling` so the reader begins at the smallest credible move.

### Motion

Moving up a rung should extend the active footprint through the ghosted unit with one controlled 500–700ms reveal. Moving down should retract it. No rising bar chart, score, cost estimate, calendar, or animated “disruption” meter.

### Reduced-motion frame

Show rung 3 (`HREE-free NdFeB`) selected: an active rotor/magnet region with the rest of the drive unit quiet. The two end labels remain clear and separated.

## Main state 3 — The magnet keeps generating

**State ID:** `back-emf-speed-sweep`  
**Title:** `The magnet keeps generating`  
**Learner question:** `Why does a permanent magnet limit high-speed voltage headroom?`

**Visible beginner copy:**

`As a permanent-magnet rotor spins faster, it generates more back-EMF. Eventually it approaches the available DC-bus voltage.`

**Why drawer:**

`The rotor field is still present at high speed, so the inverter cannot simply keep increasing speed in the same way.`

**Evidence drawer:**

`[Idealised teaching sweep. It explains the causal voltage limit; it is not a vehicle-specific voltage, rpm, torque, or calibration chart.]`

### Stage

Use one large simplified rotor/stator cross-section as the primary object. A permanent purple field is visibly attached to the rotor throughout. Beside it, show one clean vertical voltage corridor, not a conventional x/y graph:

- A thin cyan back-EMF trace rises as the rotor-speed control rises.
- A quiet fixed horizontal cap at the top is the available DC-bus ceiling.
- When the trace approaches the cap, it slows and holds at the near-ceiling region. Do not show a dangerous-looking collision or an error state.

The two permissible on-stage labels are `BACK-EMF` and `DC BUS CEILING`. The persistent rotor field is self-evident through colour and geometry, not another label.

### Semantic interaction

Use one slider: `Motor speed` with low / high endpoints only. Do not show rpm values. As the reader raises it, the rotor makes one partial visual rotation and the back-EMF trace rises. The slider is about cause and effect, not a simulation control panel.

### Motion

The rotor should rotate only while the speed slider changes or when a short `Play` sequence is invoked. Back-EMF climbs in the same direction, then settles. No perpetual spinning. No neon waveforms, gauge needles, or live oscilloscope.

### Reduced-motion frame

Show a still rotor with its purple permanent field and a cyan trace resting just below the labelled DC-bus ceiling.

## Main state 4 — Pay current to cancel flux

**State ID:** `field-weakening-current`  
**Title:** `Pay current to cancel flux`  
**Learner question:** `Why does a PMSM spend current to cancel its own flux?`

**Visible beginner copy:**

`Beyond base speed, the inverter uses some current to push back against the permanent field.`

**Why drawer:**

`That counter-flux current is an added reactive-current and loss burden. It is not a universal zero-torque claim.`

**Evidence drawer:**

`[Verified field-weakening mechanism. Show added counter-flux current and a qualitative loss burden only; no universal current split, loss figure, or operating-point claim.]`

### Stage

Keep the same central rotor silhouette and permanent purple field from State 3, but remove the voltage corridor. State 4 teaches one thing only: a new cyan current component pushes against the fixed purple field.

- Purple magnet flux points in one unmistakable direction.
- Cyan counter-flux current enters directly against it.
- Their overlap resolves to a shorter, quieter net-field shape.
- A small restrained red/orange resistance mark may appear in the bottom dock only to denote added loss burden. It must not become a heat simulation or a numeric meter.

The only two possible on-stage labels are `MAGNET FLUX` and `COUNTER-FLUX CURRENT`. Do not label the net field; the shorter resultant is visually clear.

### Semantic interaction

Use one slider named `Go beyond base speed`. Its low position shows the fixed field alone. Its high position introduces the cyan counter-flux component and shortens the net field. It must preserve the motor’s geometry; the control changes flux relationship, not camera position.

### Motion

Run a single 500–700ms sequence: cyan component enters, net field shortens, and a tiny dock burden mark appears. It settles on an inspectable final frame. No force-field pulse, glow storm, particle field, or field lines endlessly chasing each other.

### Reduced-motion frame

Show the purple field, the opposing cyan component, and the shortened net field simultaneously. It must remain understandable without motion.

## Optional dive — A field you cannot turn off

**State ID:** `inverter-fault-at-speed`  
**Title:** `A field you cannot turn off`  
**Learner question:** `What remains active when a permanent-magnet inverter is gated off?`

This is available only as a quiet action after State 4: `Compare fault fields`. It does not become State 5, does not change main-route progress, and must have a clear `Back to field weakening` return action.

**Visible beginner copy:**

`A permanent magnet cannot be commanded off. A powered rotor field can.`

**Why drawer:**

`This changes fault handling and high-speed control before supply-chain questions even enter the picture.`

**Evidence drawer:**

`[Safety-critical teaching comparison. A spinning PMSM field remains active after drive gating; do not imply a universal braking torque, DC-link spike, crash state, or vehicle-fault outcome.]`

### Stage

Show one matched, sparse comparison at the same implied wheel speed:

- Left: permanent-magnet rotor. After `Inverter fault`, the purple rotor field remains visible and a small generator-direction arrow persists.
- Right: wound-field teaching example. When excitation is removed, its cyan commanded field fades to a quiet off state.

Use equal geometry and scale. This is a one-mechanism comparison—field persistence versus controllable excitation—not a safety dashboard, an electrical schematic, or a failure animation.

The only two possible on-stage labels are `FIELD REMAINS` and `FIELD FADES`.

### Semantic interaction and reduced motion

Use one reversible control: `Inverter fault` / `Reset`. The final reduced-motion frame is the fault comparison itself: PM field remains, wound-field excitation fades. Do not make either machine visually explode, skid, spark, or show a warning stack.

## Main state 5 — Two families, not six boxes

**State ID:** `sync-async-family-tree`  
**Title:** `Two families, not six boxes`  
**Learner question:** `Which motors keep pace with the field, and which need slip?`

**Visible beginner copy:**

`Synchronous machines keep their rotor field in step. Induction needs slip to make rotor current.`

**Why drawer:**

`PMSM, wound field, SynRM and SRM sit in the synchronous teaching branch. Induction is asynchronous. The branches do not make every motor choice an exclusive competitor.`

**Evidence drawer:**

`[Teaching taxonomy. It describes rotor-field source and speed relationship, not product maturity, performance, market share, or an exclusive technology ranking.]`

### Stage

Use a very sparse two-branch family tree rather than six equal comparison cards:

- One large left branch represents synchronous behaviour: a stator field and rotor field move in step.
- One large right branch represents asynchronous induction: the stator field leads a small rotor/cage response by a visible gap.
- Small unlabeled icon nodes live inside the branches. Their names appear only in the semantic selector below the stage or the panel’s Why drawer, not as stage labels.
- The rotor-field source changes visually when a node is selected: permanent magnet, powered winding, shaped steel, salient pole, or induction cage. Keep the unselected icons quiet.

The two permissible on-stage labels are `IN STEP` and `SLIP`. There is no legend, comparison matrix, performance score, or six-box dashboard.

### Semantic interaction

Use a selector named `Inspect motor family` with these values:

- PMSM
- Wound field
- SynRM
- SRM
- Induction

Selecting a value illuminates only its corresponding icon node and the one relevant speed/field relationship. Default to `Induction` so the slip lesson is first visible. The selector must not rearrange the tree or create a carousel.

### Motion

Synchronous selection: the two simple field markers advance in lockstep once, then stop. Induction selection: the stator marker advances slightly ahead of the cage response once, making the small gap visible. No continuously spinning motor family tree.

### Reduced-motion frame

Show the two branches simultaneously: left field markers aligned, right markers separated by a small slip gap. The visual must work with no selected-node animation.

## Label, copy, and layout discipline

Apply these rules to every state, including the optional dive:

- Maximum two on-stage labels at any moment. Maximum three words per label.
- No floating stage title, scene subtitle, paragraph, legend, source line, tooltip, or instructional sentence.
- A leader is optional. If used: 1px line, one anchor dot, 34–64px length, axis-aligned where possible, and entirely inside a dedicated label gutter.
- Labels use the colour of the thing they identify; neutral grey if no notation colour applies.
- Do not repeat panel copy in a label or control. A control names an action or selection only.
- Do not place labels on top of a drawing. Reserve clear top and side zones before drawing the visual.
- **Do not overlap labels.** Test all selected states, Evidence-open panel, Why-open panel, and reduced-motion states at 1280 × 720.
- Use the right panel to carry all explanatory language. It must remain spacious enough for the long Evidence caveat without clipping or a nested scroll area.

## Motion, interaction, and access

Motion teaches a causal change and then stops. Default scenes are quiet.

- Use one consistent easing family; state changes take roughly 450–800ms.
- A slider or selector changes only the relevant mechanism. Do not move the entire camera, rebuild the layout, or reflow the panel.
- No perpetual loops. A short `Play` control may demonstrate a sequence only where it adds comprehension, then settle on the final causal frame.
- Use transform and opacity for state transitions; keep shared geometry stable.
- Right/Down and Next advance main states. Left/Up and Back go back. Space plays/pauses a short available demonstration.
- Tab order: state control, transport/play if present, Why, Evidence, optional action, Back, Next.
- Every control receives a visible cyan focus ring with generous offset. Controls must remain legible and at least 36px high at 1280 × 720.
- Never rely on colour alone: purple/cyan field direction, amber intervention extent, and the induction slip gap must have distinct shape or position as well.

### Reduced motion

Provide a static, fully understandable end frame for all five main states and the optional fault dive:

- State 1: two roles and the dated-context gate visible.
- State 2: selected intervention footprint visible.
- State 3: back-EMF trace just below the DC-bus ceiling.
- State 4: fixed flux, counter-flux current, and shortened net field visible together.
- Optional: persistent PM field beside faded wound-field excitation.
- State 5: in-step branch and slip branch visible together.

No looping fields, rotation, fading essential information, or non-static explanation is allowed in reduced motion.

## Production handoff required

Return one implementation-ready design document named:

`Ch04 Reduce exposure or replace PMSM.dc.html`

It must include:

1. Five complete main-route frames at the live 1280 × 720 viewport.
2. One complete optional fault-comparison frame at 1280 × 720.
3. One responsive-layout proof showing the same shell at a narrower desktop width; do not create a phone redesign.
4. A reduced-motion strip with all six static end frames.
5. A compact interaction and motion sheet with control semantics, keyboard behaviour, and end states.
6. A copy/evidence slot sheet containing the exact panel copy above and every evidence limitation.
7. Desktop label-anchor positions and collision-clear zones for every state.
8. A production asset handoff with stable vector layer IDs. Use code-native SVG or Canvas-ready geometry, never raster images.

Use these stable layer IDs where relevant:

```text
#supply_ndpr
#supply_dytb
#supply_license_gate
#supply_main_field
#supply_reversal_boundary
#mitigation_ladder
#drive_unit_ghost
#change_footprint
#pmsm_rotor
#permanent_flux
#back_emf_trace
#dc_bus_ceiling
#counter_flux_current
#net_flux
#fault_pm_field
#fault_wound_field
#fault_generator_arrow
#sync_branch
#async_branch
#family_nodes
#slip_marker
```

9. A state table for:

```text
activeState
reeGroup
mitigationRung
motorSpeed
fieldWeakening
inverterFault
selectedFamily
whyOpen
evidenceOpen
paused
reducedMotion
```

10. A short “teaching simplifications and evidence limits” list that makes clear which scenes are idealised explanations.

## Final acceptance checklist

Before returning, verify the design satisfies all of the following:

- The main route is exactly five states; the inverter-fault comparison is optional and never changes main transport.
- Every state has one clear mechanism, one semantic control, and one calm final frame.
- The 1280 × 720 layout is a responsive implementation proof, not a fixed artboard or a cropped 1440px design.
- The stage, dock, rail, and right panel never collide or overflow.
- There are never more than two on-stage labels.
- **Do not overlap labels.** Remove a label rather than squeezing it into the stage.
- No text is baked into the SVG.
- All copy avoids unqualified supply-security, mass-production, numerical, temperature, speed, loss, fault-outcome, or vehicle-integration claims.
- The visual language remains the existing understated PMSM learning shell: dark, physical, sparse, and easy to understand at first glance.
