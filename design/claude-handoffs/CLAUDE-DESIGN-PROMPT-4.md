# Claude Design Prompt 4

Design **Chapter 03: Why the magnet needs Nd, Dy and Tb** for an existing interactive PMSM learning experience.

This is not a landing page, dashboard, or a new visual language. Extend the established shell from Chapters 01 and 02 exactly:

- Dark charcoal stage with fine separators and a quiet, technical editorial feel.
- IBM Plex Sans and IBM Plex Mono.
- Existing visual vocabulary: steel grey, copper, magnet purple, flux cyan, heat red, restrained amber for the active chapter or protective material.
- At 1440 × 900: 44px chapter rail, central visual stage, 404px right learning panel.
- At 1280 × 720: 36px rail, 884px stage, 360px panel.
- Keep the stage visible when Why or Evidence opens. Drawers belong only inside the right panel.
- Keep click-based progression. Do not turn this into a long scroll story.
- No cards inside cards, no dashboard gauges, no equations, no molecular ball diagrams, no decorative legend, no generic science-lab UI.

The outcome must feel beautiful, minimal, physical, and immediately understandable to someone who has never studied magnets.

## Core teaching idea

Use **one persistent magnet object** for the entire chapter.

It begins as one large, tactile magnet cross-section in the centre of the stage. It should feel like a real physical object, not a graph. The magnet has a quiet purple body with only a few large internal grain shapes visible beneath the surface. Across the four main states, the same object transforms. The camera never jumps to an unrelated diagram.

A reader should understand the whole chapter visually:

1. Some magnetic pull remains after outside help disappears.
2. A magnet also needs to resist being pushed backwards.
3. Heat plus a hard opposing push can leave a permanently weakened patch.
4. Dy and Tb give more room before that reversal, but the trade-off is real.

Use no values, temperatures, percentages, equations, alloy recipes, chemistry formulas, or universal material claims.

## Main route: exactly four states

The main chapter transport is exactly `1 OF 4` through `4 OF 4`. The optional deep dives do not enter this count.

### State 1: First: strength

Right panel:

- Title: `First: strength`
- Learner question: `What stays after help disappears?`
- Visible beginner copy: `When outside help goes away, some magnetic pull remains.`
- Why drawer: `Engineers call that retained pull remanence.`
- Evidence placeholder: `[Conceptual teaching model. No material grade or value is shown.]`

Stage:

- Show the single purple magnet with a larger cyan helper field around it.
- The only active control is `Remove helper field`.
- When pressed, the cyan helper field fades away but a smaller, calm purple field remains.
- The visual lesson is immediate: outside help disappears, something remains.
- Do not use a chart or numeric strength meter.
- Keep labels sparse, for example only `helper field` before interaction and `field remains` after it.

Reduced-motion frame:

- One static before/after composition: faint cyan helper ghost, then the retained purple field as the clear final state.

### State 2: Second: stubbornness

Right panel:

- Title: `Second: stubbornness`
- Learner question: `Can a magnet be pushed backwards?`
- Visible beginner copy: `An opposite magnetic push can try to turn the magnet around.`
- Why drawer: `Engineers call resistance to that reversal coercivity.`
- Evidence placeholder: `[Qualitative reversal model. No universal threshold is shown.]`

Stage:

- Transform the same magnet in place.
- A cyan opposing field enters from the right, clearly separate from the magnet's retained purple field.
- Use one simple two-stop or three-stop control named `Push back`.
- At the gentle setting, the magnet holds its direction.
- At the hard setting, show the pressure reaching a visible resistance boundary. Do not flip the entire magnet dramatically. The visual should show the idea of resistance first.
- Use a simple physical barrier or tension line around the magnet, not a padlock icon or technical chart.
- The main visual should remain one magnet, not a side-by-side product comparison.

Reduced-motion frame:

- The opposing cyan arrow held just before the resistance boundary, with the magnet still aligned.

### State 3: Heat makes reversal easier

Right panel:

- Title: `Heat makes reversal easier`
- Learner question: `What happens when heat and a hard push arrive together?`
- Visible beginner copy: `A hot magnet can lose part of its pull. Cooling later may not bring that part back.`
- Why drawer: `Heat can reduce the room before reversal. A patch that flips does not necessarily reset after cooling.`
- Evidence placeholder: `[Relative heat and opposing field only. No generic temperature, temperature slope, or grade-specific claim.]`

Stage:

- Preserve the same magnet and same opposing-field direction from State 2.
- Give the reader exactly two compact controls:
  - `Warm magnet`
  - `Push back`
- When both are active, a restrained red heat aura appears and a small corner or edge patch of the magnet visibly reverses direction.
- This patch must be visibly different from the rest of the magnet: reversed internal arrow orientation, dimmer retained field, or a small field lobe facing the wrong way.
- When the reader turns `Warm magnet` off, the red heat aura fades away but the reversed patch remains. This is the essential irreversible-demagnetisation lesson.
- Do not show a thermometer, degrees Celsius, a generic traction temperature range, or a temperature coefficient.
- Do not imply that every hot magnet fails or that the visual represents a universal threshold.

Important transition rule:

- State 4 must begin with a fresh, untested teaching sample. Do not make the damaged magnet appear to repair itself. Use a quiet replacement transition that is visually obvious but does not add explanatory clutter.

Reduced-motion frame:

- A cooled magnet with one persistent reversed edge patch and a visibly weaker field on that side.

### State 4: Dy/Tb gives more room before a flip

Right panel:

- Title: `Dy/Tb gives more room`
- Learner question: `Why add Dy or Tb?`
- Visible beginner copy: `Dy and Tb help a magnet resist reversal when it is hot. They do not cool it.`
- Why drawer: `More thermal protection can also reduce magnetic pull and increase supply exposure.`
- Evidence placeholder: `[Verified material role: improves high-temperature resistance to reversal. No universal alloy recipe is shown.]`

Stage:

- Begin with the fresh version of the same magnet.
- Use one compact three-stop control named `Thermal protection`, not `Dy/Tb content`.
- Increasing protection should create two visual consequences at once:
  - the visible reversal boundary moves outward, meaning more room before a flip
  - the retained purple field becomes slightly shorter or quieter, meaning a real strength trade-off
- Use a few restrained amber flecks or an abstract protective overlay inside the magnet. Do not draw a literal edge shell in the main route. The shell belongs only in the grain-boundary-diffusion deep dive.
- Make this a physical trade-off, not a bar chart. One object should visually become harder to flip while giving up a little pull.
- No composition percentages, no mass fractions, and no claim that more Dy/Tb is always better.

Reduced-motion frame:

- Fresh magnet with thermal protection active, a wider reversal boundary, and slightly shorter retained-field lobes.

## Optional deep dives

Both deep dives are one-click optional expansions. They must not add steps to the four-state main route, alter transport progress, or interrupt the next chapter.

Show them only after State 4 as two quiet, clearly optional actions:

- `See inside a grain`
- `Explore cooling and SmCo`

When opened, each deep dive transforms the existing central object in the same stage. Include a clear `Back to magnet` action. Do not create a new page, modal maze, or parallel scroll sequence.

### Optional deep dive A: Grain-boundary diffusion

Purpose: explain why protection can be placed near grain edges rather than spread everywhere.

Stage:

- Zoom into the same magnet's few large internal grains.
- Keep it visually simple: three or four large purple grain shapes, not atoms or a detailed micrograph.
- Use one toggle: `Mixed through` / `Protect edge`.
- In `Mixed through`, amber protection appears broadly distributed.
- In `Protect edge`, amber moves to thin grain-edge shells while more purple interior remains visible.
- A restrained red reversal seed can begin at an edge during a short `Run test` animation.
- In the edge-protection state, the amber shell blocks or slows the edge-starting reversal seed.

Safe drawer copy:

- `A reversed patch can begin near a grain edge. Grain-boundary diffusion aims to focus scarce protection near those edges.`
- `[Mechanism view. Do not imply every commercial magnet uses the same pattern or a universal heavy-rare-earth reduction.]`

Do not use the words `nucleation`, `anisotropy`, or `NdFeB` in the main visible stage. Those may appear only in Why or Evidence.

### Optional deep dive B: Cooling and SmCo

Purpose: distinguish thermal management from a different high-temperature magnet route.

Stage:

- Return to the same whole magnet, now inside a quiet rotor cross-section.
- Use one toggle: `Run oil cooling`.
- When active, calm cyan oil-flow paths reach the rotor-magnet region and the red heat aura recedes.
- The visual must state only that cooling manages magnet temperature. It must not imply that cooling removes Dy or Tb.
- Use a second toggle: `Show SmCo position`.
- When active, add one compact adjacent material position object, not a comparison dashboard:
  - `SmCo`
  - `higher-temperature permanent-magnet route`
  - `more expensive`
- Keep it qualitative. No temperature limits, price figures, performance parity, or implication that SmCo is rare-earth-free.

Safe drawer copy:

- `Cooling reduces thermal burden. It does not itself prove a particular Dy/Tb reduction.`
- `SmCo is a more expensive permanent-magnet route for higher-temperature needs.`
- `[OEM cooling source is thermal-management evidence only. Do not make an Audi-to-Dy/Tb claim.]`

## Exact no-duplication rule

Each fact must have one job and one home.

- Stage labels name only physical objects, current conditions, or actions. Maximum three labels at once. Maximum three words per label.
- The panel title names the lesson.
- The learner question asks one question.
- The visible panel copy gives one causal takeaway.
- Why contains the formal mechanism term.
- Evidence contains source scope and caveat only.

Do not repeat a title, question, sentence, or complete factual claim across the stage, panel, Why, and Evidence. Do not place a stage heading that repeats the panel title. Controls may name only an action, never restate the explanation.

## Motion and interaction

Motion must teach causality, never decorate.

- Default scene state is calm. No perpetual loops.
- `Play` runs one short causal sequence and settles on an inspectable end frame.
- State changes use transform and opacity only.
- State 1: helper field fades, retained field remains.
- State 2: opposing field enters and presses toward the resistance boundary.
- State 3: heat appears, opposing field presses, a small edge patch flips, heat fades, patch remains.
- State 4: amber protection appears, reversal boundary expands, retained field subtly shortens.
- Optional GBD: amber material moves from broad distribution to grain edges, then the reversal seed test runs once.
- Optional cooling: oil path draws once, heat aura recedes and holds.
- Use one consistent easing family and restrained durations around 500-900 ms. Do not use sci-fi pulses, particles, lens flares, or large glow effects.
- Preserve stage geometry across controls. A control changes what the reader sees, not where the magnet jumps.
- Keyboard:
  - Right or Down and Next: advance main state
  - Left or Up and Back: previous main state
  - Space: play or pause
  - Tab order: state control, transport, Why, Evidence, optional deep dive, Next
  - Visible cyan focus ring with generous offset
- Touch targets must remain comfortable and obvious.

## Reduced motion

Create one static, fully understandable final frame for each of the four main states and both deep dives.

- No looping fields.
- No animated rotation.
- No fading critical evidence out of the frame.
- State 3 must retain the reversed patch after the heat aura disappears.
- State 4 must show both sides of the trade-off at once.
- Deep dives must remain readable without motion.

## Shell constraints

- Preserve the existing rail, panel proportions, transport, typography, and restrained dark theme.
- No nested frames or fake application windows inside the stage.
- No top hero, no large chapter manifesto, no new navigation system.
- The stage must contain one dominant magnet object with generous negative space.
- The right panel must stay breathable, with short copy and room for the bottom transport.
- Use a single shared coordinate space for all states. The magnet centre and overall silhouette stay anchored.
- At 1280 × 720, test the busiest main state and one optional deep dive. Nothing may collide, clip, overlap the rail, or intrude into the right panel.
- Keep labels outside the SVG groups. The SVG itself should contain only visual layers, never text nodes.

## Production handoff required

Return one implementation-ready design document named:

`Ch03 Why the magnet needs Nd Dy Tb.dc.html`

Include:

1. Four complete 1440 × 900 main-state frames.
2. Two complete optional deep-dive frames.
3. One 1280 × 720 frame for the busiest state.
4. A reduced-motion strip showing all six static end frames.
5. A motion and interaction sheet.
6. A copy and evidence slot sheet.
7. A production asset handoff with stable vector layer IDs, including:

```text
#magnet_body
#magnet_grains
#helper_field
#retained_field
#opposing_field
#reversal_boundary
#thermal_aura
#reversed_patch
#thermal_protection
#grain_zoom
#grain_edge_shell
#reversal_seed
#rotor_context
#cooling_path
#smco_position
```

8. A state table for:

```text
helperField
opposingField
warmMagnet
demagTriggered
thermalProtection
grainProtectionMode
coolingOn
showSmCo
paused
reducedMotion
```

9. Label-anchor positions for desktop and 1280 × 720.
10. A short list of teaching simplifications and evidence limits.

Use code-native SVG or Canvas-ready geometry, not raster images or a generic static mockup. Do not invent sources, technical measurements, vendor claims, or material recipes.
