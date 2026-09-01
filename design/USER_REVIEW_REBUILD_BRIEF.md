# PMSM walkthrough rebuild brief

This is the durable implementation brief for the September 2026 rebuild. It records the user-review findings and the constraints that must survive context compaction.

## Audience and outcome

The core user is a smart, time-poor IAS/IPS/Ministry of Mines bureaucrat with limited electrical-engineering knowledge.

The walkthrough has only three required learning outcomes:

1. Understand what a permanent-magnet motor is, where it sits in an EV, and broadly how it works.
2. Understand the main alternatives and the different physical principle each uses.
3. Understand the trade-offs, commercial maturity, and implementation burden of those alternatives.

If a frame does not materially improve one of those outcomes, it does not belong in the core walkthrough.

## Non-negotiable design rules

- Preserve the current Takshashila visual theme, typography, palette, split-stage layout, whitespace, and restrained character.
- Cleanliness takes priority. Do not add optional “go deeper” drawers, replay/pause controls, extra menus, tooltips, accordions, or additional reading layers.
- Do not add buttons or controls unless they are indispensable. The right-hand grip rule is the one explicitly requested interaction and must remain.
- Keep the core course to 20–22 frames maximum.
- Each frame should teach one idea with one clear visual change.
- Autoplay explanatory motion should run once for roughly 4–6 seconds and then settle.
- User scrolling must take priority over animation and retarget or stop motion cleanly.
- No callout may leave the visible stage.
- Do not change the theme to solve content problems. Reduce and clarify the content instead.
- The final pass must be reviewed from start to finish as the target bureaucrat, not merely checked as code.

## Current-state diagnosis

The deployed walkthrough has 51 frames across 7 chapters:

- Chapter 1: 8
- Chapter 2: 8
- Chapter 3: 10
- Chapter 4: 4
- Chapter 5: 7
- Chapter 6: 8
- Chapter 7: 6

The first alternative does not appear until frame 31. The walkthrough therefore spends 30 frames on context, motor anatomy, magnet physics, and high-speed behaviour before reaching the user's second required takeaway.

### Blocking visual errors

- Chapter 5 frames explaining induction, wound-field, pure reluctance, contactless wound-field, and switched reluctance reuse a permanent-magnet rotor and show an “NdFeB magnets” callout. The visual contradicts the lesson.
- Chapter 6 ferrite frames also reuse an NdFeB-labelled rotor in some states.
- The Chapter 3 grain-surface frame prematurely shows the later grain-boundary-diffusion solution.
- The Chapter 3 “This is not hypothetical” frame leaves the previous diffusion rung selected instead of selecting HREE-free NdFeB.
- Chapter 7 repeats essentially the same “Reduce Dy/Tb” comparison state across all six frames.
- Several labels clip outside the stage, including drive-unit, exploded-motor, rotor, and axial-flux callouts.
- The final “Almost none of this has shipped” claim conflicts with earlier frames that describe induction and externally excited wound-field traction hardware in production.

### Interaction and motion findings

- Chapter progress marks work and are clickable.
- “Next chapter” correctly opens the next chapter at the top.
- A desktop Page Down during a camera move scrolled immediately without a visible jump in the tested state.
- The camera generally moves smoothly, but explanatory motion often continues while the user reads instead of settling.
- The diagram controls are SVG click targets rather than normal semantic buttons/sliders.
- There is no need to add replay, pause, “Try it yourself,” or optional-reading UI in this rebuild.
- Chapter 7 requires real visual progression instead of six narration changes over one static diagram.

## Frame-by-frame disposition of the 51-frame version

### Chapter 1 — Where the Motor Lives: 8 to 3–4

1. The path — merge with “Inside the drive unit.”
2. Inside the drive unit — keep; fix clipped reduction-gear label.
3. Seven parts pulled apart — keep and simplify to stator, rotor, magnets, shaft.
4. The casing holds the system — remove as a standalone frame.
5. The stator stays still — merge into motor anatomy.
6. The rotor turns — merge into motor anatomy; make buried magnets visually obvious.
7. The shaft carries the torque — remove as a standalone frame.
8. They never touch — merge into the operating-principle animation.

### Chapter 2 — How It Turns: 8 to 4

1. Electromagnet and Grip Rule — keep because the user explicitly requires it; redesign for intuitive clarity.
2. One coil group — merge into the rotating-field sequence.
3. Three AC phases offset in time — replace the technical sinusoidal/vector graph with a simpler timed three-phase visual.
4. Rotating field inside the bore — keep.
5. Rotor locks in step — merge with the rotating-field frame.
6. Why the magnets are buried — merge into anatomy or the combined-torque frame.
7. Two pulls on one shaft — keep the magnet-pull plus steel-alignment idea; remove the torque-angle graph.
8. IPM-SynRM traction motor — merge into the previous frame; do not use the acronym as the headline.

### Chapter 3 — The Magnet: 10 to 3–4

1. A division of labour — keep and simplify the strength-versus-grip metaphor.
2. Where the stubbornness comes from — remove as a standalone frame.
3. Remanence: what is left — remove the terms from the core narrative.
4. Heat and reverse field spend the same margin — keep as the core reason Dy/Tb is used.
5. Reversal starts at a grain surface — merge into the mitigation explanation; do not preview the solution early.
6. Dysprosium restores the lock — merge with heat vulnerability.
7. Put the patch only at the vulnerable edge — keep as a simple targeted-diffusion mitigation.
8. Light and heavy are not one problem — keep and move earlier in the rare-earth story.
9. The smallest credible change — merge cooling, diffusion, and HREE-free NdFeB.
10. This is not hypothetical — use as maturity evidence, not a separate frame; fix the selected visual state.

### Chapter 4 — The Ceiling: 4 to 1

1. A permanent magnet cannot be switched off — keep as the setup.
2. The bus sets a ceiling — remove “DC bus” detail from the core.
3. Paying current to cancel your own magnet — keep the plain-language high-speed trade-off.
4. The field is still on when the inverter is not — remove fault-engineering detail from the core.

Core statement: a permanent magnet is always on; that gives compact performance but creates a high-speed control penalty that a controllable rotor field can avoid.

### Chapter 5 — Swap the Rotor: 7 to 4–5

1. One question splits the family — keep as a clean architecture map, not a dense dashboard.
2. Induction creates its own rotor field — keep; show an actual conductive rotor cage and no magnets.
3. Wound field turns the magnet into an input — keep; show rotor windings/electrical excitation and no permanent magnets.
4. Production hardware already exists — merge into wound-field maturity evidence.
5. Contactless excitation is the new lane — merge into wound-field maturity, not a separate motor family.
6. Reluctance spans clean and assisted rotors — keep; show shaped steel flux barriers and explain the inverter/size trade-off plainly.
7. Switched reluctance changes the stator too — either merge with reluctance or keep as a short separate frame if the total remains under 22.

### Chapter 6 — Change the Magnet: 8 to 2–3

1. This is a layer, not a branch — retain as one sentence: magnet chemistry can change without changing the PMSM principle.
2. Ferrite trades supply risk for a weak field — keep; show ferrite rather than NdFeB.
3. Weak magnets force geometry work — merge with ferrite.
4. Which is a second, separate choice — merge the chemistry-versus-geometry distinction.
5. Read both numbers together — use as ferrite maturity evidence, not a standalone frame.
6. Iron nitride must clear four gates — reduce to a future-materials maturity statement; remove detailed material units.
7. Where low coercivity is the point — remove as a standalone frame.
8. These stack rather than compete — use as the closing taxonomy sentence, not a full frame.

### Chapter 7 — What Has to Change: 6 to 3

1. What survives any of this — merge into the implementation-burden comparison.
2. Where the burden lands — keep as part of the trade-off matrix.
3. Not all swaps are the same size — keep.
4. Then the clock — keep, but use maturity and implementation categories rather than vague “years, not quarters.”
5. Two markets, two reasons — remove the industrial-drive detour from the EV-focused course.
6. Almost none of this has shipped — rewrite to distinguish production-proven motor types, vehicle-platform integration, pilot routes, and materials R&D.

## Target 20–22-frame structure

The implementation may adjust exact grouping, but must remain within this budget and preserve the three-outcome order.

### Chapter 1 — The motor in the car (4 frames)

1. Why the motor matters: permanent-magnet prevalence and rare-earth vulnerability.
2. Battery → inverter → motor → reduction gear → wheels.
3. Exploded motor: stator, rotor, buried magnets, shaft, air gap.
4. Permanent magnet definition and what remains magnetised without external power.

### Chapter 2 — How a PMSM turns (4 frames)

5. Right-hand grip rule: current direction determines the coil’s north/south poles.
6. Three stationary coil groups are energised in sequence to create a rotating field.
7. The permanent-magnet rotor follows that rotating field across the air gap.
8. Buried magnets plus shaped steel produce torque together, reducing magnet demand.

### Chapter 3 — Why the rare earths are there (3 frames)

9. NdFeB division of labour: compact magnetic strength and resistance to reversal.
10. Heat and opposing fields create the need for Dy/Tb; distinguish light from heavy rare earths.
11. Lowest-disruption mitigation: cooling, grain-boundary diffusion, and HREE-free NdFeB.

### Chapter 4 — Ways to remove or change the magnets (5–6 frames)

12. Clean alternative map: reduce HREE, change magnet chemistry, or change motor architecture.
13. Induction: induced current in a rotor cage; no permanent magnets.
14. Wound field: a controllable rotor electromagnet; extra supply and cooling hardware.
15. Synchronous reluctance: shaped steel aligns to the field; no/few magnets, inverter/size trade-off.
16. Switched reluctance: stator poles pull a toothed steel rotor; noise/ripple and control trade-offs.
17. Ferrite and future magnet materials: same broad PMSM principle, weaker field or lower maturity.

If necessary for pacing, merge frames 15 and 16 into one reluctance-family frame to keep the course at 21 frames.

### Chapter 5 — Trade-offs and readiness (4 frames)

18. One clean comparison: supply risk, efficiency, size/power density, controls, heat, and manufacturing burden.
19. Lowest-disruption/near-term routes: cooling, diffusion, HREE-free NdFeB.
20. Production-capable architectures versus pilot and materials-R&D routes.
21. Decision summary and the three required takeaways.

## Required readiness model

Do not collapse “commercial today” and “easy to substitute” into one idea.

- Lowest disruption: reduced Dy/Tb, rotor cooling, grain-boundary diffusion, HREE-free NdFeB. These retain the PMSM architecture but still require supplier qualification and validation.
- Production-capable architecture alternatives: induction and externally excited wound-field systems. The motor principle is proven; using one in a specific vehicle is a drive-unit/platform programme, not a component swap.
- Pilot/early traction integration: ferrite traction designs, contactless wound-field excitation, and some SRM applications.
- Materials R&D: iron nitride and variable-flux material systems.

Use exact maturity claims only where the project’s evidence registry supports them.

## Final verification checklist

- 20–22 frames total.
- The right-hand grip rule remains and is easier to understand.
- No new optional-reading, replay, pause, “Try it yourself,” or clutter-producing UI.
- Induction visual contains no permanent magnets or NdFeB labels.
- Wound-field visual contains rotor windings/excitation and no permanent-magnet label.
- SynRM visual shows shaped steel barriers and no permanent-magnet label unless explicitly explaining PM-assisted SynRM.
- SRM visual shows its distinct toothed rotor and salient stator.
- Ferrite visual is labelled ferrite, not NdFeB.
- Chapter 7/trade-off sequence changes the selected route and affected systems on every frame.
- Every callout remains inside the visible stage at the tested desktop and narrow layouts.
- Autoplay motion settles after the explanatory reveal.
- Scrolling during motion remains smooth and takes control immediately.
- “Next chapter” opens at the top.
- The final screen recaps the three required outcomes rather than repeating a vague pre-market claim.
- Start-to-finish review confirms a non-engineer can explain the PMSM, the alternatives, the trade-offs, and maturity categories.
- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`.
- Commit and push directly to `main`, then verify the GitHub Pages workflow and deployed site.
