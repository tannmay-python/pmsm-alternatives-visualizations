# Claude Design Prompt 8

Design **Chapter 07: What the vehicle must change** for the established interactive PMSM learning experience.

This chapter should make a complex automotive integration problem baby-simple for a complete beginner: first separate the large vehicle systems that survive a motor swap from the drive unit that must change; then open the drive unit to show where different rotors move the engineering problem; then place the alternatives on a clear integration burden spectrum; then show that a new motor is also a multi-workstream validation runway; and finally demonstrate how OEMs can stage technologies across front and rear axles rather than forcing one motor architecture everywhere.

The experience is designed for a curious beginner who knows nothing about automotive motor engineering. Every state must teach **one visible mechanism**. The reader should never have to decode a dashboard, a dense KPI matrix, an engineering blueprint, or a wall of labels.

---

## 1. Non-negotiable outcome & hard lessons

Create a responsive, implementation-ready desktop learning interface. Its primary proof viewport is **1280 × 720**, but it is a live, fluid layout—not a static artboard or poster.

### Hard Lessons from Prompts 4 & 5:
1. **Do not generate a fixed artboard.** Do not build a pixel-locked 1280px or 1440px canvas that clips, scales down, or relies on `transform: scale()` to look correct. Specify a fluid box-sizing (`border-box`) implementation that works seamlessly across desktop/laptop viewports (1024px to 1440px+), using **1280 × 720** as the mandatory visual proof target.
2. **Do not overlap labels.** No label may cross a leader line, another label, the chapter rail, the learning panel boundary, a dock control, or the edge of the viewport. If an on-stage label cannot fit in a dedicated clear zone, remove it. There must be at most **two on-stage labels** visible at any given moment. Controls in the bottom dock are semantic UI elements, but must fit without line-wrapping or visual collisions.
3. **Keep the stage visible during deep dives and drawers.** Why and Evidence drawers belong exclusively inside the right learning panel. Opening a drawer must never obscure, shrink, or distort the central visual stage.
4. **Art Direction & Handoff Role**: The output of this prompt is a production-ready art direction spec and technical implementation handoff document (`Ch07 What the vehicle must change.dc.html`), not a slide deck or static mockup.

---

## 2. Visual design system & quiet editorial shell

Extend the established dark technical editorial shell from earlier chapters:

- **Background & Frames**: Quiet dark charcoal stage (`#0F1115` / `#16191E`) with fine separators (`#262A33`). Zero gradients, gloss cards, fake-device borders, or hero banners.
- **Typography**: IBM Plex Sans for teaching copy and section titles; IBM Plex Mono for microcopy, status indicators, vector labels, and control UI.
- **Color Notation Palette**:
  - Steel Grey (`#8E96A4`): Neutral vehicle chassis, common drive-unit housing, and retained structural systems.
  - Magnet Purple (`#A855F7`): Permanent magnet flux, PM rotor components, and PM field lobes.
  - Flux / Control Cyan (`#38BDF8`): Control fields, back-EMF, stator three-phase field, and primary interactive highlights.
  - Heat Red (`#EF4444`): Rotor losses, thermal hotspots, and cooling load indicators.
  - Restrained Amber (`#F59E0B`): Dy/Tb heavy-rare-earth boundaries, protective treatments, and active route highlights.
  - Muted System Green (`#10B981`): Drive-unit change footprint and vehicle system modification boundaries.
- **Prohibited Clichés**: No cards inside cards, no KPI tiles, no gauge dials, no mathematical equations, no stock car renders, no country flags, no corporate logo collages, and no glowing particle storms.

---

## 3. Responsive layout specification

### At the required 1280 × 720 live proof viewport:
- **Left Chapter Rail**: 36px wide, quiet charcoal border.
- **Right Learning Panel**: 360px wide, 1px solid separator, 32px horizontal inner padding.
- **Central Teaching Stage**: The remaining 884px. Implemented using CSS Grid with `minmax(0, 1fr)` so the stage adapts fluidly. Never set a 1280px minimum width.
- **Stage Interior**: 24px left/right padding, 20px top padding. Reserve a fixed 64px bottom control dock. The main visual safe area sits comfortably above the dock without vertical overlap.
- **Panel Content Stack**: Chapter/status line, short title, single learner question, short visible takeaway copy, Why/Evidence tabs/drawers, and sticky bottom transport (`Back` / `Next`). The panel must never trigger vertical scrollbars at 720px height.

### At wider desktop viewports (1440 × 900):
- Rail: 44px wide.
- Central Stage: 992px wide.
- Right Learning Panel: 404px wide.
- Preserves identical spatial proportions, generous negative space, and visual hierarchy without inflating font sizes or duplicating visual elements.

### At narrower desktop viewports (~1024 × 640):
- Rail: 32px wide; panel shrinks to ~308px. Stage absorbs the remaining space (~684px).
- Tighten spacing and font sizes gracefully. No text truncation, no horizontal page scroll, and no label-control collisions.

---

## 4. Main route state breakdown: exactly five states

The default main route is strictly **five** states. The bottom transport must display `1 OF 5` through `5 OF 5`.

1. `vehicle-survivors-and-changes` — **What survives the swap?**
2. `inverter-and-cooling-burden` — **The change is inside the drive unit**
3. `swap-burden-spectrum` — **From material adjustment to platform change**
4. `validation-runway` — **The calendar is part of the technology**
5. `mixed-axle-revisit` — **Do not force one answer everywhere**

There are **zero optional deep dives** in this chapter. All five visual steps represent the canonical main learning route.

---

## 5. Content, claim boundaries & evidence rules

All teaching copy and visual models must strictly respect the evidence boundaries in `claims.ts` and `evidenceAudit.ts`. Do not invent company facts, universal values, maturity levels, guaranteed timelines, or exclusive performance claims.

### Prohibited Claims & Registry Boundaries:
1. **No Universal Validation Timeline**: Do NOT claim a universal 3-to-5-year motor swap duration (`vehicle-validation-window` is unverified and hidden). Frame validation workstreams qualitatively.
2. **No Drop-In Blanket Claim**: Do NOT claim that all alternative motor architectures (ferrite PM, induction, SynRM, wound field) are "true drop-in replacements" simply because the chassis shell survives (`reduced-hree-near-drop-in` vs `vehicle-swap-burden`).
3. **No Universal Induction Penalty**: Do NOT display a generic 3% efficiency or range penalty for induction motors (`induction-ev-efficiency-tradeoff` is unverified and hidden). Efficiency depends on vehicle weight, drive cycle, and axle role.
4. **No Heavy-to-Light REE Confusion**: Do NOT claim that Dy/Tb reduction removes Nd/Pr (`proterial-hree-free-ndfeb`). Dy/Tb provides coercivity/heat resistance; Nd/Pr provides main magnetic flux.
5. **No Universal OEM Generalisation**: Do NOT claim that Audi or BMW use a single motor setup across all models (`induction-mixed-axle-use`). Always attribute specific layouts to named platforms/models (e.g. Audi Q6 e-tron PSM+ASM, BMW Gen6 EESM+ASM).

### Exact No-Duplication Rule:
- **Stage Labels**: Name physical objects, current conditions, or spatial regions only. Maximum 2 labels at once, maximum 3 words per label.
- **Panel Title**: Names the core lesson.
- **Learner Question**: Asks one clear question.
- **Visible Panel Copy**: Gives one direct causal takeaway.
- **Why Drawer**: Explains the formal engineering mechanism.
- **Evidence Drawer**: Contains source scope, caveats, and evidence limits.

---

## 6. Detailed state specifications

### Main State 1 — What survives the swap?

- **State ID**: `vehicle-survivors-and-changes`
- **Panel Title**: `What survives the swap?`
- **Learner Question**: `What stays the same when you swap the motor architecture?`
- **Visible Beginner Copy**: `The body, cabin, battery and suspension can often remain. The drive unit cannot be treated as unchanged.`
- **Why Drawer**: `The scale of the engineering job depends sharply on whether you changed only heavy-rare-earth use, a magnet chemistry or the whole rotor-field architecture.`
- **Evidence Drawer**: `[This is a comparative integration model; each programme requires its own package and safety review.]`

#### Stage Visualization:
- Show a large, quiet full-vehicle chassis silhouette in the central stage (`#car_chassis_ghost`).
- Retained major systems—body shell, interior cabin, crash structure, high-voltage battery pack, and front/rear suspension—remain quiet neutral steel grey (`#8E96A4`).
- The drive-unit region (e-axle enclosure, motor, inverter, cooling lines) is highlighted as an active focal zone.
- As the user changes the motor architecture selector, only the drive-unit region changes color/footprint (e.g., quiet green for reduced-HREE near-drop-in, expanding amber/red overlay for full wound-field or SynRM redesign).
- **On-Stage Labels (Max 2)**: `RETAINED SYSTEMS` (pointing to body/battery) and `DRIVE UNIT REDESIGN` (pointing to e-axle region).

#### Semantic Control:
- Segmented selector in dock: `Choose architecture` (`Reduced-HREE PM` | `Ferrite PM` | `Induction` | `Wound Field` | `SynRM` | `SRM`).
- Default selection: `Reduced-HREE PM` (showing minimal drive-unit footprint change).

#### Motion & Settling:
- 400ms smooth color transition over the drive-unit region. No vehicle movement, bouncing wheels, or flying parts. Settles immediately.

#### Reduced-Motion Frame:
- Static full-vehicle outline with grey retained systems and a single highlighted drive-unit footprint for the selected architecture.

---

### Main State 2 — The change is inside the drive unit

- **State ID**: `inverter-and-cooling-burden`
- **Panel Title**: `The change is inside the drive unit`
- **Learner Question**: `Where do different motor choices shift the engineering problem?`
- **Visible Beginner Copy**: `Different rotors move the problem to different places: power supply, inverter sizing, rotor heat, cooling, package or controls.`
- **Why Drawer**: `A PMSM mostly puts losses where a stator water jacket can reach. A wound field puts important heat on a spinning rotor. A pure SynRM can change inverter demand.`
- **Evidence Drawer**: `[The visual models causal architecture changes rather than quoting unsupported universal component dimensions.]`

#### Stage Visualization:
- Zoom into the drive unit itself. Present an exploded drive-unit assembly in shared coordinate space:
  - Stator housing & water jacket (`#exploded_stator_housing`)
  - Rotor shaft & core (`#exploded_rotor_shaft`)
  - Inverter power electronics module (`#exploded_inverter`)
  - Rotor excitation / slip-ring or brushless supply (`#excitation_supply`)
  - Hollow-shaft / rotor oil cooling loop (`#hollow_rotor_cooling`)
- Selecting an architecture illuminates the exact sub-modules undergoing redesign:
  - **Wound Field (EESM)**: Highlights `#excitation_supply` (brush/brushless rotor power) and `#hollow_rotor_cooling` (rotor heat management).
  - **SynRM**: Highlights `#exploded_inverter` (increased kVA rating for lower power factor) and stator cooling.
  - **Induction (ASM)**: Highlights `#exploded_rotor_shaft` (induced rotor heat) and cooling loop.
  - **Reduced-HREE PM**: Highlights minor rotor magnet slot geometry while keeping inverter/supply unchanged.
- **On-Stage Labels (Max 2)**: `COMMON MODULES` (grey housing) and `REDESIGN HOTSPOT` (colored module).

#### Semantic Controls:
- Dock Selector 1: `Compare drive unit` (`Reduced-HREE` | `Ferrite PM` | `Induction` | `Wound Field` | `SynRM` | `SRM`).
- Dock Selector 2 (Hotspot Toggle): `Why changed?` (`Inverter kVA` | `Rotor Supply` | `Rotor Heat` | `Coolant Loop`).

#### Motion & Settling:
- 500ms gentle axial separation of the exploded modules when switching architectures. Settles into an inspectable exploded state.

#### Reduced-Motion Frame:
- Static exploded drive unit with active redesign callout highlights on affected modules.

---

### Main State 3 — From material adjustment to platform change

- **State ID**: `swap-burden-spectrum`
- **Panel Title**: `From material adjustment to platform change`
- **Learner Question**: `Are all motor alternatives equal integration burdens?`
- **Visible Beginner Copy**: `Dy/Tb reduction is not the same size of change as a wound-field redesign.`
- **Why Drawer**: `A useful map says what really changes. It does not call ferrite, induction, SynRM and wound field all 'true drop-ins' because the chassis shell can survive.`
- **Evidence Drawer**: `[The spectrum is comparative and qualitative; it directs the reader to the system-specific evidence cards.]`

#### Stage Visualization:
- Display a clean horizontal integration burden spectrum (`#burden_spectrum_track`) spanning six motor routes from left (lowest integration burden) to right (highest platform change burden):
  1. `Reduced-HREE PM` (Material adjustment)
  2. `Ferrite PM` (Magnet chemistry & package growth)
  3. `Induction (ASM)` (Rotor heat & inverter tuning)
  4. `Wound Field (EESM)` (Excitation supply & rotor cooling)
  5. `SynRM` (Inverter sizing & power factor burden)
  6. `SRM` (Acoustic NVH & power electronics redesign)
- Below the spectrum, six impact columns depict affected engineering domains: `Inverter`, `Cooling`, `Package`, `Controls`, `Safety Case`, `Validation`.
- Selecting a route paints a clear qualitative impact strip across its affected domain columns.
- **On-Stage Labels (Max 2)**: `NEAR DROP-IN` (left anchor) and `FULL REDESIGN` (right anchor).

#### Semantic Controls:
- Dock Selector 1: `Select route` (`Reduced-HREE` | `Ferrite PM` | `Induction` | `Wound Field` | `SynRM` | `SRM`).
- Dock Selector 2: `Sort by subsystem` (`All Domains` | `Inverter` | `Cooling` | `Package` | `Controls`).

#### Motion & Settling:
- 450ms horizontal highlight sweep across affected domain blocks. Settles on active route selection.

#### Reduced-Motion Frame:
- Static 6-route spectrum with clear left (`NEAR DROP-IN`) and right (`FULL REDESIGN`) endpoints and illuminated domain blocks for the default route (`Wound Field`).

---

### Main State 4 — The calendar is part of the technology

- **State ID**: `validation-runway`
- **Panel Title**: `The calendar is part of the technology`
- **Learner Question**: `Why does a motor change take years even if the chassis remains?`
- **Visible Beginner Copy**: `A new motor architecture is also a validation programme.`
- **Why Drawer**: `Cooling, control calibration, NVH, functional safety and homologation take time even when the rest of the vehicle can remain familiar.`
- **Evidence Drawer**: `[The visual deliberately has no universal duration. Actual programmes depend on platform reuse, architecture and regulatory scope.]`

#### Stage Visualization:
- Show a multi-lane validation runway (`#validation_workstreams`) displaying six parallel engineering workstreams:
  1. `Package & CAD Integration`
  2. `Inverter & Control Calibration`
  3. `Thermal & NVH Validation`
  4. `Functional Safety (ISO 26262)`
  5. `Durability & Bench Testing`
  6. `Vehicle Homologation`
- An interactive vertical scrubber gate (`#timeline_scrubber_gate`) moves across qualitative development phases: `Concept` → `Bench` → `Vehicle Test` → `Homologation`.
- Selecting an architecture lights up the specific workstream lanes that require major added engineering effort.
- **On-Stage Labels (Max 2)**: `PARALLEL WORKSTREAMS` and `HOMOLOGATION GATE`.

#### Semantic Controls:
- Dock Selector 1: `Choose route` (`Reduced-HREE` | `Ferrite PM` | `Induction` | `Wound Field` | `SynRM`).
- Dock Slider: `Programme time` (Scrub from 0% to 100% phase progression).

#### Motion & Settling:
- Scrubber line moves smoothly as slider is adjusted. Workstream lanes light up in sequence. Stops immediately when slider is released.

#### Reduced-Motion Frame:
- Static multi-lane workstream chart showing active engineering lanes for the selected motor route with labelled qualitative gates.

---

### Main State 5 — Do not force one answer everywhere

- **State ID**: `mixed-axle-revisit`
- **Panel Title**: `Do not force one answer everywhere`
- **Learner Question**: `How can OEMs combine motor types to balance efficiency and cost?`
- **Visible Beginner Copy**: `An OEM can mix motor types across axles and operating modes.`
- **Why Drawer**: `That may be more realistic than waiting for one architecture to match every duty at once.`
- **Evidence Drawer**: `[Named axle examples are kept in the evidence lane, with current implementation status marked for verification.]`

#### Stage Visualization:
- Show a top-down dual-axle vehicle layout (`#dual_axle_chassis`) with distinct front (`#front_axle_module`) and rear (`#rear_axle_module`) drive units.
- The user can independently select front and rear motor types (e.g. PMSM rear + Induction front).
- An interactive duty-mode switcher (`City` | `Motorway` | `Coasting`) updates the visual field overlays (`#duty_flux_overlay`):
  - **City Mode**: Rear motor active (high efficiency at low/medium load).
  - **Motorway Mode**: Both motors active for peak power output.
  - **Coasting Mode**: Front induction motor de-excited (de-energised field without significant drag losses), rear PM motor idling.
- **On-Stage Labels (Max 2)**: `FRONT AXLE` and `REAR AXLE`.

#### Semantic Controls:
- Dock Selector 1: `Front axle` (`Induction (ASM)` | `PMSM` | `Wound Field`).
- Dock Selector 2: `Rear axle` (`PMSM` | `Wound Field` | `Induction`).
- Dock Selector 3: `Duty mode` (`City` | `Motorway` | `Coasting`).

#### Motion & Settling:
- 500ms flux vector pulse showing energy flow and magnetic excitation across the two axles when changing duty modes. Settles into calm static vectors.

#### Reduced-Motion Frame:
- Static dual-axle layout with labelled axle motor types (e.g. Rear PSM, Front ASM) and quiet static duty flux arrows.

---

---

## 7. Motion, keyboard & accessibility discipline

- **Motion Principles**: Motion must teach physical causality and settle immediately. Duration: 400–700ms using `cubic-bezier(0.16, 1, 0.3, 1)`. No infinite loops, floating particles, sci-fi glows, or decorative spinning.
- **Keyboard Navigation**:
  - `ArrowRight` / `ArrowDown`: Advance main state (`1 OF 5` → `5 OF 5`).
  - `ArrowLeft` / `ArrowUp`: Previous main state.
  - `Space`: Play/Pause short causal sequence.
  - `Tab` Focus Order: Dock controls → Transport buttons → Why drawer toggle → Evidence drawer toggle → Optional deep dive link → Next chapter button.
  - Focus Ring: 2px solid cyan (`#38BDF8`) with generous 3px offset (`outline-offset: 3px`).
- **Contrast & Legibility**: All text nodes must meet WCAG AAA contrast against `#0F1115`. High contrast visible vector strokes for dark mode readability.

---

## 8. Technical handoff requirements

The implementation deliverable must be named:

`Ch07 What the vehicle must change.dc.html`

### Required Package Artifacts:
1. Five complete main-route frames at the live responsive 1280 × 720 proof viewport.
2. Responsive proof layouts at 1440 × 900 and 1024 × 640.
3. Reduced-motion strip with all five static end frames.
5. Interaction and motion specification sheet.
6. Exact panel copy and evidence slot sheet.
7. Label-anchor positions and collision-safe zones for desktop viewports.
8. Vector Asset Handoff with stable layer IDs:

```text
#car_chassis_ghost
#retained_body_systems
#drive_unit_highlight
#exploded_inverter
#exploded_stator_housing
#exploded_rotor_shaft
#excitation_supply
#hollow_rotor_cooling
#burden_spectrum_track
#spectrum_route_nodes
#validation_workstreams
#timeline_scrubber_gate
#dual_axle_chassis
#front_axle_module
#rear_axle_module
#duty_flux_overlay
```

9. State Table Schema:

```text
activeState (1..5)
architectureSelect ('reduced-hree', 'ferrite', 'induction', 'eesm', 'synrm', 'srm')
explodedHotspot ('none', 'inverter', 'rotor-supply', 'rotor-heat', 'cooling')
burdenSortKey ('route', 'subsystem')
validationRoute ('reduced-hree', 'ferrite', 'induction', 'eesm', 'synrm', 'srm')
validationScrubTime (0..100%)
frontAxleType ('pmsm', 'induction', 'eesm')
rearAxleType ('pmsm', 'induction', 'eesm')
dutyMode ('city', 'motorway', 'coasting')
whyOpen (boolean)
evidenceOpen (boolean)
paused (boolean)
reducedMotion (boolean)
```

---

## 9. Final acceptance checklist

Before declaring completion, verify that the design output fulfills every constraint:

- [ ] Main route consists of **exactly 5 states** (`1 OF 5` to `5 OF 5`); zero optional deep dives in Chapter 7.
- [ ] Responsive proof is anchored at **1280 × 720** live shell with fluid CSS grid (`minmax(0, 1fr)` stage width).
- [ ] No fixed artboards, scaling hacks, or horizontal/vertical window scrolling.
- [ ] Stage stays visible and unobstructed when Why or Evidence drawers are open.
- [ ] Maximum **two on-stage labels** per state; no leader line crossings or text collisions across all control states.
- [ ] All text is rendered in DOM overlay or clean SVG text nodes with dedicated safe zones; zero text baked into drawing layers.
- [ ] Strictly respects all evidence audit rules: no unverified 3-5 year validation numbers, no drop-in blanket claims, no generic 3% induction penalties, and no Dy/Tb vs Nd/Pr confusion.
- [ ] Native semantic HTML controls with full keyboard accessibility and high-contrast cyan focus indicators.
- [ ] Design maintains quiet dark editorial aesthetic (IBM Plex Sans / IBM Plex Mono, dark charcoal background, restrained color notation).
