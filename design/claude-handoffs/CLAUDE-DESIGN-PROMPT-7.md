# Claude Design Prompt 7

Design **Chapter 06: Change the magnet—or the geometry** for the established interactive PMSM learning site.

This chapter makes a fundamental distinction crystal clear to a beginner who knows nothing about motors: **magnet chemistry, packaging geometry, and motor torque principle are separate, stackable decisions**. 

The reader should never fall into category errors—such as treating ferrite as a motor architecture or axial flux as a magnet material. Every state must teach **one visible physical mechanism** with a single dominant teaching object. The reader must never have to decode dense dashboards, cluttered cards, complex equations, or walls of text.

---

## Non-Negotiable Visual & Architecture Constraints

1. **Art Direction & Handoff Target**: Output from Claude Design is an implementation-ready art direction document and production handoff (`Ch06 Change the magnet or the geometry.dc.html`). It is NOT a static slides deck or fixed presentation image.
2. **Responsive Live Shell (1280 × 720 Proof)**:
   - **Primary Proof Viewport**: **1280 × 720** live responsive shell.
   - **No Fixed Canvas / Artboard**: Do NOT output a hardcoded pixel artboard that crops, scales down, or overflows. Use CSS `box-sizing: border-box` and fluid container layouts.
   - **Viewport Geometry at 1280 × 720**:
     - Left Chapter Rail: `36px` wide.
     - Centre Teaching Stage: `884px` wide (fluid via `minmax(0, 1fr)`).
     - Right Learning Panel: `360px` wide, with a `1px` subtle divider line and `32px` padding.
   - **Viewport Geometry at 1440 × 900**:
     - Left Rail: `44px` wide | Stage: `992px` wide | Right Panel: `404px` wide.
   - **Overflow**: Absolutely zero horizontal or vertical window scroll. Panel content must fit comfortably without internal scrollbars at 720px height.
3. **Strict Stage Labeling & Collision Discipline**:
   - **Maximum TWO on-stage labels per state** at any moment.
   - **Sentence-case, max 3 words per label** (e.g., `NdFeB magnet`, `Diameter expansion`).
   - **No Baked-in SVG Text**: SVG drawing groups must contain only vector geometry (`path`, `rect`, `circle`, `g`). All labels must be DOM text elements placed in dedicated, reserved label gutters outside the graphic drawing bounds.
   - **No Leader Line Crossing**: Leaders must be 1px axis-aligned lines with clean 4px anchor dots. Leaders must never cross each other, cross stage controls, or touch panel/rail borders.
   - **Collision-Free Safe Zones**: Explicit collision test required for every state across Evidence-open, Why-open, and reduced-motion states at 1280 × 720.
4. **Editorial Visual Vocabulary**:
   - Quiet dark charcoal stage (`#0F1115` / `#16191E`), fine grey separators (`#2A2F38`), quiet IBM Plex Sans for teaching copy and IBM Plex Mono for microcopy/labels.
   - Restricted notation palette: Steel grey (`#8A94A6`), Copper (`#D97706`), Magnet Purple (`#8B5CF6`), Flux Cyan (`#06B6D4`), Heat Red (`#EF4444`), Restrained Amber (`#F59E0B`) for protective/compensation layers.

---

## Canonical Chapter Transport & State Structure

The main route transport is **EXACTLY FOUR STATES** (`1 OF 4` through `4 OF 4`). 

The two optional deep dives do NOT increment the main transport counter, do NOT alter history navigation, and must offer a clear `Back to chapter` return action.

```
Main Route State 1 (1 OF 4): ferrite-material-not-architecture
Main Route State 2 (2 OF 4): axial-flux-geometry
   └─ [Optional Deep Dive A]: proterial-power-speed (Offered after State 2)
Main Route State 3 (3 OF 4): iron-nitride-property-board
   └─ [Optional Deep Dive B]: matter-variable-flux (Offered after State 3)
Main Route State 4 (4 OF 4): stackable-motor-builder
```

---

## Evidence-Safe Registry & Explicit Prohibited Claims / Numbers

Every claim, number, and evidence statement must strictly match the project's evidence audit registry (`registry.json` & `evidenceAudit.ts`).

### Strict Prohibited Rules:
- **No Coercivity Mislabeling**: Do NOT describe the lower output of ferrite as a coercivity ratio or generic "field strength". DOE tables show typical Sr ferrite values sit below NdFeB in remanence and energy product; coercivity is a separate resistance property.
- **No Universal Cold Failure Claim**: Do NOT claim every ferrite motor fails at low temperature. Low-temperature demagnetisation is grade- and circuit-dependent (anisotropic ferrite with low permeance coefficient near −40°C).
- **No Unqualified Power Parity**: Do NOT state Proterial's ferrite power figure in isolation. You MUST pair **102 kW at 15,000 rpm** with the **110 kW at 10,000 rpm NdFeB baseline** and mark it as a prototype test (simulation reported 105 kW at 15,000 rpm).
- **No "Vastly Stronger" Saturation Narrative**: Do NOT crown Fe16N2 / Iron Nitride "vastly stronger" than NdFeB or a drop-in traction magnet based on theoretical 2.5 T saturation magnetisation. Coercivity (specified as **2,000–4,000 Oe** in Niron's published patent), energy product, and thermal margin (peer-reviewed literature reports decomposition near **500 K / ~227°C**) are separate design gates.
- **No Premature Product Launch Claim**: Do NOT portray Niron/Matter's VFM as a commercial vehicle product launch. It is a **CES 2026 prototype / exploratory integration** for electric motorcycles.
- **No Category Errors**: Never label ferrite as a motor architecture or axial flux as a magnet chemistry.
- **No Invented Numbers**: Do NOT invent motor efficiency percentages, vehicle ranges, market shares, or cost figures.

---

## Content Assignment & Exact No-Duplication Rule

Each factual piece of information has **exactly one home**:
- **Stage**: Shows the physical spatial/geometric mechanism only.
- **Panel Title**: Names the core lesson.
- **Learner Question**: Asks one clear beginner question.
- **Visible Beginner Copy**: Provides one direct causal takeaway.
- **Why Drawer**: Explains the formal engineering rationale.
- **Evidence Drawer**: Contains source scope, caveats, and evidence status.

Do NOT repeat titles, questions, or complete sentences across the stage, panel, Why, or Evidence views.

---

## Detailed State Specifications

### Main State 1 (1 OF 4): Ferrite changes the magnet, not the motor family

- **State ID**: `ferrite-material-not-architecture`
- **Panel Copy**:
  - **Title**: `Ferrite changes the magnet, not the motor family`
  - **Learner Question**: `What changes when only the permanent-magnet chemistry changes?`
  - **Visible Beginner Copy**: `A ferrite PMSM is still a PMSM. The material changed; the torque principle did not.`
  - **Why Drawer**: `Weaker remanence and energy product mean the motor usually pays somewhere else—in size, speed or geometry. Cold behaviour also belongs in the story.`
  - **Evidence Drawer**: `[Conceptual chemistry swap. Generic ferrite ratios are marked as verification-required and never relabelled as 'field strength' or universal coercivity. Cold demagnetisation risk is grade- and circuit-dependent.]`

- **Visual Stage**:
  - Dominant visual: One persistent rotor cross-section.
  - Initial state: Purple `NdFeB` magnet blocks generate a dense, broad purple magnetic field.
  - Interaction: Toggling `Magnet chemistry` to `Ferrite` changes the blocks to dark grey and thins the cyan flux lines, showing lower retained pull.
  - Operating `Compensation path` selector expands a ghosted overlay:
    - `Diameter`: Stator/rotor outer diameter visibly widens.
    - `Length`: Stack length extends depthwise with a dimension caliper.
    - `Speed`: Rotor spin tick marks expand to indicate higher operating rpm.
  - A subtle persistent label pill reads `PMSM (PERMANENT MAGNET SYNCHRONOUS MOTOR)` across all settings to emphasize that torque principle remains unchanged.

- **On-Stage Labels** (Max 2):
  1. `FERRITE BLOCK` (or `NDFEB BLOCK`)
  2. `DIAMETER EXPANSION` (or `STACK LENGTH` / `SPEED MARKER`)

- **Dock Controls**:
  - `Magnet chemistry`: `NdFeB` | `Ferrite` (Segmented control)
  - `Compensate with`: `Diameter` | `Length` | `Speed` (Segmented control)

- **Reduced-Motion Frame**:
  - Static side-by-side or stacked outline showing the ferrite rotor with thinner flux lines alongside a ghosted diameter expansion caliper.

---

### Main State 2 (2 OF 4): Axial flux is a shape choice

- **State ID**: `axial-flux-geometry`
- **Panel Copy**:
  - **Title**: `Axial flux is a shape choice`
  - **Learner Question**: `Why is axial flux a geometry, not a magnet chemistry?`
  - **Visible Beginner Copy**: `Axial flux describes where the field travels. It is not another magnet material.`
  - **Why Drawer**: `A designer can pair axial geometry with ferrite, NdFeB or another material. The interface must let those decisions stack.`
  - **Evidence Drawer**: `[Topology teaching model. Axial flux is a geometric layout, not a claim that geometry automatically erases material trade-offs.]`

- **Visual Stage**:
  - Dominant visual: A 3D-angled tactile motor rotor/stator topology view.
  - Morph animation:
    - `Radial flux`: Cylindrical rotor inside cylindrical stator; magnetic flux arrows travel outwards radially from shaft axis.
    - `Axial flux`: Disc-like pancake rotor parallel to disc stator; flux arrows turn 90° to travel axially along the shaft direction.
  - Independent chemistry toggle: Magnet tiles on either geometry can be independently set to `NdFeB` (Purple) or `Ferrite` (Dark Grey).
  - Demonstrates that geometry (radial vs axial) and chemistry (NdFeB vs ferrite) are orthogonal, stackable dimensions.

- **On-Stage Labels** (Max 2):
  1. `RADIAL FLUX` (or `AXIAL FLUX`)
  2. `DISC PANCAKE` (or `CYLINDER ROTOR`)

- **Dock Controls**:
  - `Flux direction`: `Radial` | `Axial` (Segmented control)
  - `Magnet chemistry`: `NdFeB` | `Ferrite` (Segmented control)

- **Reduced-Motion Frame**:
  - Static dual-diagram: Cylindrical radial-flux cross-section beside disc axial-flux cross-section, both displaying independent chemistry chips.

---

### Optional Deep Dive A: Power needs its operating condition

*(Offered quietly after State 2 via panel action: `Inspect Proterial prototype speed comparison`)*

- **State ID**: `proterial-power-speed`
- **Panel Copy**:
  - **Title**: `Power needs its operating condition`
  - **Learner Question**: `What makes two motor power figures comparable?`
  - **Visible Beginner Copy**: `102 kW at 15,000 rpm is not the same operating point as 110 kW at 10,000 rpm.`
  - **Why Drawer**: `Power numbers only become comparable when speed, duty and baseline are on stage with them.`
  - **Evidence Drawer**: `[Sourced prototype comparison: Proterial reported 102 kW at 15,000 rpm for its ferrite prototype against a 110 kW at 10,000 rpm NdFeB baseline (simulation: 105 kW at 15,000 rpm). Display prototype/actual status.]`

- **Visual Stage**:
  - Two matched vertical power corridor columns:
    - Left column: `Ferrite Prototype`
    - Right column: `NdFeB Baseline`
  - When `Show operating condition` is OFF: Both columns show raw power bars (~102 kW vs 110 kW), creating false equivalence.
  - When `Show operating condition` is ON: An attached RPM scale unlocks. The Ferrite bar reaches 102 kW only at **15,000 rpm**, whereas the NdFeB baseline achieves 110 kW at **10,000 rpm**. A clear lock icon links power to speed.

- **On-Stage Labels** (Max 2):
  1. `102 KW @ 15,000 RPM`
  2. `110 KW @ 10,000 RPM`

- **Dock Controls**:
  - `Operating condition`: `Hide speed` | `Show speed & baseline` (Segmented control)
  - `Back to chapter`: Returns to Main State 2.

- **Reduced-Motion Frame**:
  - Static aligned bar structure displaying both kW power and RPM speed values with a visible condition lock badge.

---

### Main State 3 (3 OF 4): Do not confuse saturation with a usable magnet

- **State ID**: `iron-nitride-property-board`
- **Panel Copy**:
  - **Title**: `Do not confuse saturation with a usable magnet`
  - **Learner Question**: `Why is saturation alone not enough to judge a permanent magnet?`
  - **Visible Beginner Copy**: `A high saturation figure is not the same as a high-coercivity, high-energy-product traction magnet.`
  - **Why Drawer**: `A permanent magnet needs both field strength and a reliable lock on that field, across a real thermal duty cycle.`
  - **Evidence Drawer**: `[Property qualification gate. Niron's published variable-flux patent specifies 2,000–4,000 Oe coercivity. Fe16N2 peer-reviewed literature reports decomposition around 500 K (~227°C). Theoretical 2.5 T saturation narrative is not a drop-in traction magnet claim.]`

- **Visual Stage**:
  - Dominant visual: A central tactile iron nitride (`Fe16N2`) magnet block.
  - Property ledger with five distinct property dials around the magnet:
    1. `Saturation (Ms)`: High theoretical magnetic limit.
    2. `Remanence (Br)`: Retained magnetic field.
    3. `Coercivity (Hcj)`: Resistance to reversal (2,000–4,000 Oe specified in patent).
    4. `Energy Product (BHmax)`: Overall magnet strength per volume.
    5. `Thermal Margin`: Decomposition threshold (~500 K / ~227°C).
  - Toggling `Check drop-in claim`: The initial headline "strongest magnet" bubble shatters into the five independent qualification gates, showing that coercivity and thermal stability remain active development challenges.

- **On-Stage Labels** (Max 2):
  1. `SATURATION LIMIT`
  2. `COERCIVITY LOCK` (or `500 K THERMAL MARGIN`)

- **Dock Controls**:
  - `Select property`: `Saturation` | `Remanence` | `Coercivity` | `Energy product` | `Thermal margin` (Segmented / Dropdown)
  - `Drop-in check`: `Single headline` | `Full qualification gate` (Toggle)

- **Reduced-Motion Frame**:
  - Static five-column property ledger highlighting all five distinct parameters with a clear "Not a single number" warning badge.

---

### Optional Deep Dive B: When weaker locking is useful

*(Offered quietly after State 3 via panel action: `Explore variable-flux VFM applications`)*

- **State ID**: `matter-variable-flux`
- **Panel Copy**:
  - **Title**: `When weaker locking is useful`
  - **Learner Question**: `When can deliberately adjustable flux be useful?`
  - **Visible Beginner Copy**: `A property that is a weakness for a fixed permanent magnet can be useful when the machine wants to vary its flux deliberately.`
  - **Why Drawer**: `The question is not whether low coercivity is simply good or bad. It is whether the architecture can control it safely for the intended job.`
  - **Evidence Drawer**: `[CES 2026 prototype context: Niron and Matter unveiled a Variable Flux Motor prototype for exploratory integration into electric motorcycles. Lower coercivity allows deliberate field adjustment.]`

- **Visual Stage**:
  - A Variable Flux Motor (VFM) rotor section showing an internal magnet block.
  - Operating mode slider (`Low-speed launch` ↔ `High-speed cruise`):
    - At low speed: High magnetic flux orientation provides heavy launch torque.
    - At high speed: A brief stator current pulse re-magnetises the magnet into a weakened flux state, eliminating the need for continuous field-weakening current losses.
  - Contrast toggle `Fixed PMSM vs VFM`: Shows how a fixed PMSM magnet would demagnetise accidentally, whereas a VFM magnet is re-aligned intentionally by design.

- **On-Stage Labels** (Max 2):
  1. `HIGH-TORQUE FLUX`
  2. `WEAKENED FLUX PULSE`

- **Dock Controls**:
  - `Operating mode`: `Low-speed launch` ↔ `High-speed cruise` (Slider)
  - `Control type`: `Fixed PMSM` | `Variable-flux VFM` (Toggle)
  - `Back to chapter`: Returns to Main State 3.

- **Reduced-Motion Frame**:
  - Dual static frame showing low-speed aligned flux domains alongside high-speed re-magnetised weakened flux domains.

---

### Main State 4 (4 OF 4): Build a motor without category errors

- **State ID**: `stackable-motor-builder`
- **Panel Copy**:
  - **Title**: `Build a motor without category errors`
  - **Learner Question**: `Which motor choices can stack instead of compete?`
  - **Visible Beginner Copy**: `A motor is a stack of choices, not one label.`
  - **Why Drawer**: `This builder prevents the report's category errors: ferrite is chemistry, axial flux is geometry, and contactless excitation is a way to power a wound rotor.`
  - **Evidence Drawer**: `[Stackable taxonomy model. Named examples (Tesla IPM-SynRM, Conifer ferrite axial, AEM aluminium SRM, Volektra VMSM contactless wound field) carry their maturity and caveat records.]`

- **Visual Stage**:
  - Dominant visual: A 5-tier modular motor architecture stack that dynamically builds a central responsive motor cross-section:
    1. **Torque Principle**: Permanent Magnet | Wound Field | Reluctance | Induction | Hybrid
    2. **Rotor Excitation**: Buried Magnets (IPM) | Surface Magnets (SPM) | Contactless / Brushed | Salient Steel
    3. **Magnet Chemistry**: NdFeB | Ferrite | Iron Nitride | None (Magnet-free)
    4. **Packaging Geometry**: Radial Flux | Axial Flux
    5. **Stator Winding Material**: Copper | Compressed Aluminium
  - Named Presets Loader (`Load named example`):
    - `Tesla IPM-SynRM`: Permanent Magnet + IPM + NdFeB + Radial + Copper
    - `Conifer Ferrite Axial`: Permanent Magnet + SPM + Ferrite + Axial + Copper
    - `AEM Aluminium SRM`: Reluctance + Salient Steel + None + Radial + Compressed Aluminium
    - `Volektra Contactless EESM`: Wound Field + Contactless + None + Radial + Copper
  - Selecting options rebuilds only the relevant layer, visually reinforcing that decisions stack across dimensions.

- **On-Stage Labels** (Max 2):
  1. `INDEPENDENT LAYERS`
  2. `STACKED ARCHITECTURE`

- **Dock Controls**:
  - Layer selectors: 5 independent semantic controls.
  - `Load named example`: Preset selector.

- **Reduced-Motion Frame**:
  - Static 5-row configuration cards illustrating stacked architectural layers with three named preset callouts.

---

## Production Handoff Specification

The production output file MUST be saved as:
`Ch06 Change the magnet or the geometry.dc.html`

### 1. Stable Vector Layer IDs
```text
#ferrite_rotor_base
#magnet_blocks_ndfeb
#magnet_blocks_ferrite
#flux_lines_dense
#flux_lines_thin
#compensation_ghost_diameter
#compensation_ghost_length
#speed_marker
#radial_cylinder_stator
#radial_cylinder_rotor
#axial_disc_stator
#axial_disc_rotor
#flux_vectors_radial
#flux_vectors_axial
#chemistry_tiles_ndfeb
#chemistry_tiles_ferrite
#power_bar_ferrite
#power_bar_ndfeb
#rpm_scale_ferrite
#rpm_scale_ndfeb
#condition_lock_icon
#fe16n2_magnet_sample
#property_dial_saturation
#property_dial_remanence
#property_dial_coercivity
#property_dial_energy_product
#property_dial_thermal_margin
#qualification_gate_checklist
#vfm_rotor_core
#vfm_magnet_domains
#magnetizing_current_pulse
#fixed_pmsm_contrast_ghost
#layer_torque_principle
#layer_rotor_excitation
#layer_magnet_chemistry
#layer_geometry_shape
#layer_stator_winding
#assembled_motor_cross_section
```

### 2. Complete State Table Schema
```text
activeState: "ferrite-material-not-architecture" | "axial-flux-geometry" | "proterial-power-speed" | "iron-nitride-property-board" | "matter-variable-flux" | "stackable-motor-builder"
magnetChemistry: "ndfeb" | "ferrite" | "iron-nitride" | "none"
compensationPath: "diameter" | "length" | "speed"
geometryShape: "radial" | "axial"
operatingCondition: "hidden" | "shown"
selectedProperty: "saturation" | "remanence" | "coercivity" | "energy-product" | "thermal-margin"
dropInCheck: boolean
vfmSpeedMode: "launch" | "cruise"
vfmFluxControl: "fixed" | "variable"
builderTorquePrinciple: "pm" | "reluctance" | "induction" | "hybrid"
builderExcitation: "ipm" | "spm" | "wound-field" | "salient-steel"
builderChemistry: "ndfeb" | "ferrite" | "iron-nitride" | "none"
builderGeometry: "radial" | "axial"
builderWinding: "copper" | "aluminium"
selectedNamedExample: string | null
whyOpen: boolean
evidenceOpen: boolean
paused: boolean
reducedMotion: boolean
```

### 3. Label Anchors & Collision-Free Safe Zones
- **Top Safe Zone**: `Y = 24px` to `Y = 72px` above stage visual.
- **Side Safe Zone**: Left `X = 24px` to `X = 64px`, Right `X = 780px` to `X = 860px`.
- **Bottom Dock Reserve**: `Y = 620px` to `Y = 700px` (reserved for controls; visual geometry must not extend into dock).

### 4. Teaching Simplifications & Evidence Limits
- **Idealised Geometry Models**: Geometry morphs and flux paths are qualitative teaching models, not finite-element analysis (FEA) simulations.
- **Proterial Figures**: 102 kW @ 15,000 rpm vs 110 kW @ 10,000 rpm represents a specific prototype test report, not a universal ferrite performance multiplier.
- **Material Gates**: Fe16N2 property values (2,000–4,000 Oe coercivity, 500 K decomposition) are material-level published data, not full vehicle-motor ratings.

---

## Final Acceptance Checklist

Verify before handoff:
1. [ ] Main route is **EXACTLY 4 states** (`1 OF 4` to `4 OF 4`). The 2 optional deep dives do not alter main transport.
2. [ ] Responsive proof target is **1280 × 720** live shell (`36px` rail, `884px` stage, `360px` panel). No hardcoded canvas artboard.
3. [ ] Maximum **TWO on-stage labels** per state. Sentence-case, max 3 words. No text inside SVG nodes. No leader line crossing.
4. [ ] Prohibited claims strictly enforced (no coercivity mislabeling, no single-figure power parity, no "vastly stronger" iron nitride claim, no unverified cold demagnetisation claims).
5. [ ] Native semantic controls with full keyboard accessibility and visible cyan focus ring.
6. [ ] Motion is finite, causal, and settles. Static end states provided for reduced motion.
7. [ ] All vector IDs, state table schema, and exact copy match canonical project sources.
