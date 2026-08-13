# Claude Design Prompt 9

Design **Chapter 08: What is real—and India’s opening** for the established interactive PMSM learning experience.

This final chapter brings the entire story together for a curious beginner: market context, evidence maturity, claim conditions, industrial capability building, and a final problem-first decision framework. It translates complex due-diligence data, company evidence cards, and policy paths into a clean, physical, and immediately understandable visual sequence.

The experience is designed for someone who knows nothing about electric motor engineering. Every state must present **one clear teaching visual** with zero dashboard clutter, zero nested card mazes, zero generic infographics, and zero unverified market-share hype.

---

## Non-Negotiable Outcome & Implementation Target

Create a responsive, implementation-ready desktop learning interface deliverable. The primary visual proof target is **1280 × 720**, but the output must be a live, fluid layout, not a fixed presentation slide or static poster.

- **Explicit Output Purpose**: The output generated from this prompt is an **art direction blueprint and production handoff document** (`Ch08 What is real and Indias opening.dc.html`). It is NOT a fixed presentation document or static mockup.
- **Do NOT generate a fixed artboard canvas**: Do not create a rigid 1280px-wide canvas that clips, scales down, or relies on `transform: scale()`. Implement a fluid CSS `border-box` layout that functions cleanly across standard desktop/laptop screens (1024px to 1440px+), with 1280 × 720 as the verified proof viewport.
- **Do NOT overlap labels**: No on-stage label may cross a leader line, another label, the chapter rail, panel boundaries, dock controls, or the viewport edges under any control state or panel mode. If a label cannot fit within its reserved clear zone, omit it. There are **never more than two on-stage labels** visible at any given moment.
- **Extend the established quiet dark technical editorial shell**:
  - Dark charcoal stage background (`#0f1115`); fine 1px neutral separators; no bright gradients, gloss, glassmorphism, glowing borders, hero banners, or fake laptop/device frames.
  - Typography: **IBM Plex Sans** for editorial and panel copy; **IBM Plex Mono** for technical labels, microcopy, and control states.
  - Existing notation palette ONLY: steel grey (`#8a95a5`), copper (`#d97736`), magnet purple (`#8b5cf6`), flux/control cyan (`#06b6d4`), heat red (`#ef4444`), restrained amber (`#f59e0b`) for active steps or protective layers, and muted green (`#10b981`) where system changes or verified states occur.
  - Layout structure: 36px left chapter rail + central visual stage + 360px right learning panel at 1280 × 720 (44px + 992px + 404px at 1440 × 900).
  - Navigation: Click- and keyboard-driven step transport (`1 OF 5` to `5 OF 5`). No long vertical scrolling.
  - Why & Evidence drawers open exclusively inside the right panel. The stage underneath remains fully visible and undisturbed.
  - Strictly forbidden cliché tropes: No cards-inside-cards, KPI tiles, gauges, equations, molecular ball models, decorative legends, stock vehicle renders, flags, maps, or company logo collages.

---

## Responsive Shell Architecture

At the required **1280 × 720** live proof viewport:
- **Left Rail**: 36px fixed width.
- **Right Learning Panel**: 360px fixed width with a 1px border divider and 24–32px horizontal padding. Contains only chapter status, title, learner question, glance takeaway, Why/Evidence disclosure buttons, and bottom Back/Next transport. It must never trigger vertical scrollbar overflow at 720px height.
- **Central Stage**: Takes remaining `minmax(0, 1fr)` space (884px width). Never set a fixed minimum pixel width on the stage.
- **Stage Interior**: 20px top padding, 24px side padding, and a reserved 56px bottom dock for native semantic controls.
- **Visual Safe Area**: A responsive SVG viewport above the bottom dock. All SVG geometry is vector-native and fluid. Text nodes are kept OUTSIDE SVG drawing groups as DOM overlay labels with explicit anchor coordinates.

At **1440 × 900** desktop viewport:
- Rail expands to 44px; panel expands to 404px; stage occupies remaining 992px. Proportions and negative space scale naturally without adding extra labels or visual chrome.

---

## Canonical Main Route: Exactly Five States

The main chapter route consists of **exactly five main states**. Transport progress reads `1 OF 5` through `5 OF 5`. There are **zero optional deep dives** in this chapter.

1. `two-markets-switch` — **Do not mix the markets**
2. `evidence-maturity-lanes` — **Status is not a single word**
3. `claim-condition-checker` — **Make the condition visible**
4. `india-capability-stack` — **The opening is a capability stack**
5. `final-decision-map` — **Choose the question before the technology**

---

## Evidence & Provenance Discipline

All copy, claims, and visual representations MUST strictly comply with the evidence audit registry (`pmsm-evidence-work/evidence-audit/registry.json`). Every fact has exactly ONE job and ONE home:

- **Visual Stage**: Displays the physical mechanism, structural alignment, or status relationship.
- **Panel Title**: Names the core lesson.
- **Learner Question**: Asks one direct question.
- **Glance Copy**: Gives one plain-language causal takeaway.
- **Why Drawer**: Contains formal mechanism terms, engineering trade-offs, or structural implications.
- **Evidence Drawer**: Contains source provenance, date, maturity level, and strict caveat limits.

### Prohibited Claims & Mandatory Caveats

1. **NO Unsupported Market Share Numbers**: Never display a "5% rare-earth-free share" or any unverified market-share forecast. Render the adoption context strictly as a qualitative, labelled "illustrative emerging segment".
2. **NO Permanent Supply-Security Claims**: China's 4 April 2025 notice is a dated licensing/export control on specified Dy/Tb material forms. Nd/Pr were not named in that notice. Do not turn omission from one notice into a permanent "secure supply" assertion for Nd/Pr.
3. **NO Universal Motor Drop-in / Parity Claims**: Ferrite is magnet chemistry, axial flux is geometry, EESM is excitation, and IPM-SynRM is a stacked configuration. Never represent any alternative as a universal, 1:1 drop-in replacement without platform validation.
4. **NO Decontextualized Prototype Performance**: Proterial's ferrite prototype figure (102 kW) MUST always be paired with its 15,000 rpm test speed, actual vs simulated status, and its 110 kW / 10,000 rpm NdFeB comparator.
5. **NO Isolated Peak Power Ratings**: AEM's SSRD CV3 prototype ratings (308 kW peak at 8,000 rpm) MUST always be paired with its 138 kW continuous power rating and development status.
6. **NO Unverified Target-to-Production Dates**: Valeo/MAHLE iBEE (220–350 kW peak target) is an announced development prototype; do not display an unverified 2028 series production date.
7. **NO Universal Program Durations**: Do not display a generic "3-to-5 year validation program" time bar across all motor swaps. Use qualitative integration workstreams.
8. **NO False Category Mergers**: Do not merge Vimag and Volektra into a single legal entity without corporate proof; represent them as sharing public patent provenance under contactless EESM excitation.
9. **NO Policy-to-Market Leadership Conversion**: Policy support and capability building (such as PM-E-DRIVE or domestic manufacturing initiatives) must be presented strictly as industrial capability building, never as a prediction of market leadership, guaranteed commercial success, or unsupported market share.

---

## State-by-State Visual & Interaction Specifications

### State 1: Do not mix the markets

- **State ID**: `two-markets-switch`
- **Title**: `Do not mix the markets`
- **Learner Question**: `Why are EV traction and industrial-motor comparisons different?`
- **Glance Copy**: `EV traction and industrial motors start from different incumbents and solve different problems.`
- **Why Drawer**: `An industrial SynRM can be an efficiency replacement for an induction motor even though it has little to do with replacing rare-earth magnets in an EV.`
- **Evidence Drawer**: `Company cards are filtered by declared market to stop appliance, industrial and vehicle evidence being blended.`

#### Stage Visual Architecture
- Display two large, distinct market lanes side-by-side inside the main visual stage:
  - **Left Lane (`EV Traction`)**: Dominant incumbent is `NdFeB PMSM`. Primary driver is `Rare-earth supply & thermal risk`. Package constraint is `Compact axle e-unit`.
  - **Right Lane (`Industrial Drives`)**: Dominant incumbent is `Induction Motor (IE2/IE3)`. Primary driver is `IE4/IE5 efficiency regulation & electricity cost`. Package constraint is `Standard frame size`.
- Two additional quiet sub-lanes (`Light Mobility` and `Appliance`) sit below as secondary filters.
- Selecting a market lane dims the irrelevant market context and highlights ONLY company/product tokens that belong to that market (e.g., Tesla, Renault, Audi in EV Traction; ABB, EKMO in Industrial Drives; Gati in Appliance).

#### On-Stage Labels (Max 2)
1. `EV TRACTION` (left lane header, cyan accent)
2. `INDUSTRIAL DRIVES` (right lane header, steel grey accent)

#### Native Semantic Control
- **Dock Control**: Segmented Select named `Choose market`: `EV Traction` | `Industrial Drives` | `Light Mobility` | `Appliance`.
- **Consequence**: Switches highlighted market lane, rewrites contextual constraints, and filters visible tokens.

#### Motion & Reduced-Motion Frame
- **Motion**: 400ms smooth transition; non-selected lane dims to 25% opacity while target lane expands slightly and highlights its incumbent icon.
- **Reduced-Motion Frame**: Both EV Traction and Industrial Drives cards sit side-by-side with clear, non-overlapping headers and distinct incumbent badges.

---

### State 2: Status is not a single word

- **State ID**: `evidence-maturity-lanes`
- **Title**: `Status is not a single word`
- **Learner Question**: `What does a maturity label actually prove?`
- **Glance Copy**: `A production vehicle, a target, a pilot, a prototype and material scale-up are not interchangeable proof.`
- **Why Drawer**: `The visual gives status as much prominence as performance, so the reader can see what is actually shipping and what still needs validation.`
- **Evidence Drawer**: `Every named record carries a source type, date, market, maturity, qualifier, caveat and verification flag.`

#### Stage Visual Architecture
- Display a clean six-lane horizontal evidence maturity board. Lanes are ordered strictly by evidence weight:
  1. `Production Vehicle` (e.g., Renault Zoe/E7A, Nissan Ariya, BMW eDrive, Tesla Model 3)
  2. `Industrial Product` (e.g., ABB SynRM, Conifer NEMA)
  3. `Vehicle Pilot` (e.g., Chara, Viridian, Naxatra, Vimag/Volektra)
  4. `Announced Development` (e.g., ZF I2SM, Valeo/MAHLE iBEE, AEM SSRD, Proterial HREE-free)
  5. `Prototype` (e.g., Proterial Ferrite, Matter/Niron VFM)
  6. `Materials Scale-Up` (e.g., Niron Magnetics Fe16N2)
- Each entity is represented as a clean vector token on its maturity lane.
- Unverified or caveat-heavy items carry a distinct visual badge (`Needs verification` border dot).
- Clicking a token expands a compact inline inspector detailing source date, qualifier, market, and caveat scope.

#### On-Stage Labels (Max 2)
1. `PRODUCTION` (top-left maturity anchor)
2. `CONCEPT / SCALE-UP` (bottom-right maturity anchor)

#### Native Semantic Controls
- **Control 1**: Select dropdown `Filter records`: `All Markets` | `EV Traction Only` | `Industrial Only`.
- **Control 2**: Hotspot toggle `Open record`: Selects specific token to reveal provenance details.

#### Motion & Reduced-Motion Frame
- **Motion**: Filtering moves tokens along horizontal tracks in 450ms; selected token elevates with a subtle cyan outline.
- **Reduced-Motion Frame**: All six labelled maturity lanes are displayed simultaneously with tokens locked in static positions and visual badges intact.

---

### State 3: Make the condition visible

- **State ID**: `claim-condition-checker`
- **Title**: `Make the condition visible`
- **Learner Question**: `What information must travel with a technical claim?`
- **Glance Copy**: `A number without a condition can make a prototype look like parity or a target look like a product.`
- **Why Drawer**: `Power needs speed and duty. Efficiency needs an operating condition. A company claim needs market, maturity, date and source.`
- **Evidence Drawer**: `The content system rejects quantitative records missing the provenance needed to interpret them.`

#### Stage Visual Architecture
- Display one large central claim card object that begins in an **"Incomplete / Misleading"** red/amber state:
  - Example raw headline: *"308 kW rare-earth-free motor!"* or *"93% efficiency motor!"*
- Below the card, five modular **Provenance Condition Slots** are displayed as unlit circuit nodes:
  1. `Peak vs Continuous`
  2. `RPM / Operating Speed`
  3. `Test vs Target Status`
  4. `Market & Vehicle Application`
  5. `Primary Source & Date`
- Toggling condition layers ON connects the nodes one-by-one. As conditions light up, the claim card transforms into a **"Fully Qualified / Interpretable"** green/steel state:
  - Fully qualified claim: *"AEM SSRD CV3 Prototype: 308 kW peak at 8,000 rpm (138 kW continuous), in-development datasheet (Nov 2025)."*

#### On-Stage Labels (Max 2)
1. `UNQUALIFIED HEADLINE` (initial top label, amber)
2. `QUALIFIED EVIDENCE` (final resolved label, muted green)

#### Native Semantic Control
- **Dock Control**: Multi-step Toggle / Slider `Add condition`: Step 1 (Raw) → Step 2 (+Speed/Duty) → Step 3 (+Status/Market) → Step 4 (Fully Qualified).

#### Motion & Reduced-Motion Frame
- **Motion**: Node lines light up sequentially in 350ms steps; claim card text updates with a calm fade transition.
- **Reduced-Motion Frame**: Side-by-side comparison of the raw headline card (struck through) next to the fully qualified evidence card with all 5 provenance slots checked.

---

### State 4: The opening is a capability stack

- **State ID**: `india-capability-stack`
- **Title**: `The opening is a capability stack`
- **Learner Question**: `What capabilities can India build alongside motor choices?`
- **Glance Copy**: `India's opening is the ability to build a whole motor-and-drive capability stack while the market is still early.`
- **Why Drawer**: `Different alternatives shift value into different places: steel, winding, power electronics, software, cooling, testing and manufacturing all become part of the answer.`
- **Evidence Drawer**: `This is a strategic interpretation of the supplied due diligence, not a forecast of guaranteed market share.`

#### Stage Visual Architecture
- Display a vertical, connected industrial capability stack with seven distinct layers:
  1. `Manufacturing & Assembly` (top layer)
  2. `Testing & Validation`
  3. `Thermal & Cooling Integration`
  4. `Control Software & Inverter Hardware`
  5. `Precision Stator Coils & Windings`
  6. `Electrical Steel & Laminations`
  7. `Raw Materials & REPM Supply` (bottom foundation layer)
- Selecting a specific motor route (e.g., `Wound-Field EESM`, `Ferrite Axial-Flux`, `Pure SynRM`, `Domestic REPM PMSM`) highlights the exact domestic capability path required by that architecture.
- For example: Wound-Field highlights Inverter/Rotor Power Electronics + Coils + Steel, while Domestic REPM highlights REPM Supply + Laminations.

#### On-Stage Labels (Max 2)
1. `DRIVE SYSTEM CAPABILITIES` (top stack header)
2. `MATERIAL FOUNDATION` (bottom stack header)

#### Native Semantic Controls
- **Control 1**: Select dropdown `Choose architecture`: `Wound-Field EESM` | `Ferrite Axial-Flux` | `Pure SynRM` | `Switched Reluctance` | `Domestic REPM PMSM`.
- **Control 2**: Hotspot `Inspect capability node`: Reveals upstream material inputs and downstream vehicle manufacturing consequences.

#### Motion & Reduced-Motion Frame
- **Motion**: Active capability nodes light up with cyan connectors in 500ms, while inactive nodes dim.
- **Reduced-Motion Frame**: Complete 7-layer stack with the selected architecture's path highlighted by solid outline borders and distinct node shading.

---

### State 5: Choose the question before the technology

- **State ID**: `final-decision-map`
- **Title**: `Choose the question before the technology`
- **Learner Question**: `Which problem are you actually trying to solve first?`
- **Glance Copy**: `There is no single post-rare-earth motor. There are different problems, mechanisms, time horizons and integration burdens.`
- **Why Drawer**: `Start with the question you need to solve. Then inspect the machine, the material, the vehicle change and the evidence state together.`
- **Evidence Drawer**: `Research and visualization by Tannmay Kumarr Baid and Shobhankita Reddy.`

#### Stage Visual Architecture
- Display an interactive synthesis decision map. Entry begins with **Five Primary Engineering Questions** (left side):
  1. *"Reduce Dy/Tb supply risk immediately with minimal vehicle change?"*
  2. *"Remove all permanent magnets for a high-performance passenger EV?"*
  3. *"Eliminate high-speed field-weakening drag on a secondary axle?"*
  4. *"Replace an industrial induction motor with higher efficiency?"*
  5. *"Explore novel magnet chemistry for light mobility / variable flux?"*
- Selecting a question draws a clear vector path connecting:
  `Problem Question` → `Optimal Motor Architecture` → `Vehicle Integration Burden` → `Evidence Maturity State`.
- Example path for Q1: *Reduce Dy/Tb immediately* → `Reduced-HREE / GBD / Oil Cooling` → `Near-drop-in (Requires motor validation)` → `Production Verified`.
- Example path for Q2: *Remove all magnets for EV* → `Wound-Field EESM / Induction` → `Drive-unit redesign + Inverter/Rotor Supply` → `Production (EESM) / Development (Contactless)`.

#### On-Stage Labels (Max 2)
1. `START WITH THE PROBLEM` (left entry header)
2. `RECOMMENDED ROUTE` (right outcome header)

#### Native Semantic Controls
- **Control 1**: Select dropdown `Start with a question`: Options Q1 through Q5.
- **Control 2**: Play button `Replay journey`: Cycles through keyframe summaries of all 8 site chapters with captions; pausable at any time.

#### Motion & Reduced-Motion Frame
- **Motion**: Vector flow path draws from left to right in 600ms, highlighting the exact sequence of choices.
- **Reduced-Motion Frame**: Static decision matrix displaying all 5 problem routes with distinct colored flow lines and destination badges.

---

## Label Anchors, Leader Lines, & Collision Management

To guarantee zero visual collision at the **1280 × 720** proof viewport:

1. **Strict 2-Label Ceiling**: Never render more than two on-stage labels simultaneously in any state.
2. **Reserved Clear Gutters**:
   - Top Label Gutter: `y: 24px` to `y: 52px` (height 28px).
   - Bottom Dock Gutter: `y: 644px` to `y: 700px` (height 56px).
   - Stage Visual Safe Bounds: `x: 60px` to `x: 824px`, `y: 60px` to `y: 620px`.
3. **DOM Label Placement**: All visual labels are rendered as absolute DOM elements over the stage SVG with `pointer-events: none;`, using IBM Plex Mono 11px/12px uppercase or sentence-case.
4. **Leader Line Specification**: 1px solid stroke (`#475569`), single 3px anchor dot, 32px–56px length, strictly axis-aligned (0° or 90° angles). Leaders must NEVER cross each other or pass beneath dock controls.

### Explicit Label Anchor Coordinates (1280 × 720 Viewport)

| State ID | Label 1 Text | Label 1 Anchor (x, y) | Label 2 Text | Label 2 Anchor (x, y) |
|---|---|---|---|---|
| `two-markets-switch` | `EV TRACTION` | (120px, 40px) | `INDUSTRIAL DRIVES` | (540px, 40px) |
| `evidence-maturity-lanes` | `PRODUCTION` | (80px, 40px) | `CONCEPT / SCALE-UP` | (700px, 40px) |
| `claim-condition-checker` | `UNQUALIFIED HEADLINE` | (100px, 40px) | `QUALIFIED EVIDENCE` | (520px, 40px) |
| `india-capability-stack` | `DRIVE SYSTEM CAPABILITIES` | (100px, 40px) | `MATERIAL FOUNDATION` | (100px, 580px) |
| `final-decision-map` | `START WITH THE PROBLEM` | (80px, 40px) | `RECOMMENDED ROUTE` | (560px, 40px) |

---

## Motion, Interaction, & Accessibility Specification

- **Causal Motion Principle**: Motion exists strictly to demonstrate cause-and-effect transitions. Default scene state is completely calm. Motion duration is capped at 350ms–700ms using a single cubic-bezier easing curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Keyboard Navigation**:
  - `Right Arrow` / `Down Arrow`: Advance to next state (`Next`).
  - `Left Arrow` / `Up Arrow`: Return to previous state (`Back`).
  - `Spacebar`: Toggle Play/Pause for demonstration sequences.
  - `Tab` / `Shift+Tab`: Cycle focus sequentially through Dock Controls → Transport (Back/Next) → Why Tab → Evidence Tab.
- **Focus Indicator**: Custom 2px solid cyan focus ring (`#06b6d4`) with 3px offset on all interactive controls.
- **Touch & Click Accessibility**: Minimum touch target dimensions 36px × 36px (44px target padded). High contrast ratio (minimum 4.5:1 for body copy, 3:1 for large headers).

---

## Production Handoff Deliverables Checklist

The output file generated MUST be named:

`Ch08 What is real and Indias opening.dc.html`

It must contain the following complete production sections:

### 1. Visual Frames Engine
- Complete, fully rendered 1280 × 720 proof viewports for all five main states (`1 OF 5` through `5 OF 5`).
- One responsive layout proof showing the shell adapting cleanly at a narrower 1024px width without text wrapping or clipping.

### 2. Stable Vector Layer IDs Registry
```text
#market_switch_matrix
#market_ev_lane
#market_industrial_lane
#market_light_mobility_lane
#market_appliance_lane
#maturity_board
#maturity_lanes
#maturity_company_tokens
#claim_card_frame
#condition_layers
#provenance_slots
#capability_stack
#capability_nodes
#capability_connections
#decision_map
#decision_problem_nodes
#decision_routes
```

### 3. State Table Schema
```text
activeState: "two-markets-switch" | "evidence-maturity-lanes" | "claim-condition-checker" | "india-capability-stack" | "final-decision-map"
marketLane: "ev-traction" | "industrial-drive" | "light-mobility" | "appliance"
evidenceFilter: "all" | "ev-only" | "industrial-only"
selectedTokenId: string | null
conditionLayersMask: number (0 to 5)
selectedCapabilityArch: "eesm" | "ferrite-axial" | "synrm" | "srm" | "repm"
selectedCapabilityNode: string | null
selectedDecisionQuestion: "q1" | "q2" | "q3" | "q4" | "q5" | null
whyOpen: boolean
evidenceOpen: boolean
paused: boolean
reducedMotion: boolean
```

### 4. Reduced-Motion Strip
A dedicated visual strip showing the static end-state compositions for all 5 main states, verifying that every visual lesson is 100% understandable without animation.

### 5. Interaction & Keyboard Sheet
Detailed mapping of all controls, keyboard handlers, ARIA labels, and focus states.

### 6. Copy & Evidence Slot Sheet
Verbatim reproduction of all panel glance copy, learner questions, Why drawer explanations, Evidence drawer caveats, and prohibited claim flags as defined in this prompt.

---

## Final Acceptance Checklist

Before completing the handoff, confirm that:
- [x] Main route contains EXACTLY 5 states matching canonical content; 0 optional deep dives.
- [x] Proof viewport is live responsive 1280 × 720 with no artboard scaling or overflow.
- [x] Maximum 2 on-stage labels per state; zero label collisions or leader line crossings.
- [x] No text is baked into SVG graphics.
- [x] All prohibited claims and numbers (e.g., 5% market share, 2028 iBEE production, 3-5 yr validation) are strictly excluded or appropriately qualified.
- [x] Establishes a true problem-first synthesis for Chapter 8 and closes the visual learning experience with precision.
