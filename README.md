# The rare-earth question, inside one motor

A guided, interactive explanation of why EV traction motors depend on rare-earth
magnets, what those magnets actually do, and what the alternatives cost.

The tour opens with a distinct editorial brief on the constraint — refining,
dashboard Group 2 exposure and China's April 2025 Announcement No. 18 — then
moves into the guided machine tour. None of the proposed alternatives can be
judged without knowing what the magnet is doing in there.

## Structure

Twelve stops in four acts, each holding several touchable states:

| Act | Stops |
|---|---|
| The problem | One kilogram decides the car |
| The machine | Battery to road · Open the machine · Three coils, one moving field · Two pulls, one shaft |
| The magnet | Strength and stubbornness · Heat, and the patch that stays · Which rare earth was actually controlled |
| The alternatives | The weakness magnets cannot fix · Swap the rotor · Change the magnet, not the machine |
| The decision | What actually has to change |

## Architecture

The editorial layer and the presentation layer are deliberately separate.

- `src/content/` — the evidence layer. 58 atomic claims with sources, scope,
  denominators and caveats (`claims.ts`), per-claim display rules
  (`evidenceAudit.ts`), composable motor configurations on five independent axes
  (`schema.ts`, `motors.ts`), and a validator (`validation.ts`). Nothing reaches
  the page without provenance, and a claim marked `renderingPolicy: "hide"`
  never renders.
- `src/route/` — the twelve stops, their states, and the copy lint. `copyLint.ts`
  rejects hedges, empty instructions and figures without their condition; it runs
  in the test suite, so slop fails the build rather than a review.
- `src/route/guide.ts` — one look-for, takeaway and forward handoff per stop
  state. A route test fails if a new scene is added without tour guidance.
- `src/stage/` — one persistent WebGL canvas for the whole tour. The motor is a
  parametric assembly built from extruded profiles (`geometry.ts`), not
  primitives: a 48-slot lamination stack with swept hairpin windings, a cast
  housing, a spoked end cap. `rotors/` holds seven rotors sharing one interface,
  each keyed to an entry in `content/motors.ts`.
- `src/stage/framing.ts` — camera framing solved analytically from the machine's
  own constants, so it is deterministic and unit-tested rather than measured off
  the live scene.
- `src/diagrams/` — the SVG kit for the abstract stops, in the same tokens.
- `src/models/alternativeLab.ts` — the five-route architecture comparison,
  including physical cost drivers, company evidence lanes and India/abroad
  presence drawn from the supplied ledger.
- `src/models/materialLab.ts` — the NdFeB/ferrite/iron-nitride comparison,
  material gates, supply-cost questions and named R&D records.
- `src/models/` — pure state and physics helpers, testable without a renderer.

### Narrative density

The route favours fewer, denser scenes over fragmented slides. Stop 7 combines
thermal stress, nucleation, the dysprosium trade-off and grain-boundary
diffusion into four states. Stop 10 compares five rotor routes in eight states;
stop 11 compares material chemistries in eight. Each state carries a tested
"look for / takeaway / next" guide so interaction explains mechanism rather than
pacing the reader through fragments.

### Where the "just swap the rotor" model stops being true

Six of the seven rotors really are drop-ins: permanent magnet, ferrite, squirrel
cage, wound field and both reluctance variants all share one distributed
three-phase stator, so showing them as swaps into a single housing is honest.

Two cases are not, and both are modelled rather than glossed:

- **Switched reluctance** needs its own stator — a few salient poles with
  concentrated coils, energised in sequence, wound in aluminium in Advanced
  Electric Machines' case. `SalientStator.tsx` draws that machine, and the rotor
  registry flags it with `needsOwnStator` so the interface says so too.
- **Axial flux** is a topology, not a rotor. The field runs along the shaft, so
  the machine becomes a disc stack. `AxialFlux.tsx` is its own scene, shown with
  both ferrite and neodymium magnets to make the point that chemistry and
  geometry are separate choices that can stack.

Wound-field excitation is likewise drawn, not just described: slip rings and
brushes for the machines in production, a rotating transformer for the
contactless designs still in development.

### Why one canvas

Mounting a `<Canvas>` per 3D stop creates a new WebGL context each time.
Browsers cap those, and past the cap the stage silently goes blank. The canvas
stays mounted for the whole session; SVG stops render on top of it.

## Run locally

```bash
npm install && npm run dev
```

## Verify

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Deploy

Pushing to `main` publishes to GitHub Pages at
`/pmsm-alternatives-visualizations/`. Override the base path with
`VITE_BASE_PATH` for another target.
