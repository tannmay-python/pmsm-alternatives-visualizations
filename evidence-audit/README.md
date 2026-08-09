# Evidence audit — PMSM Alternatives

This folder is a launch gate, not a bibliography. `registry.json` is designed to feed the site's evidence drawer and claim badges without letting a visual become more certain than its source.

## Rendering rules

- `verified`: source-linked concise claim; figures may be used only as written.
- `qualified`: preserve its condition, date, maturity label, and uncertainty in the scene.
- `unverified`: do not show it as a fact. Replace it with qualitative visual language or remove it.
- Never compare a peak motor figure against another motor's continuous figure.
- Never combine **architecture** (EESM, induction, SynRM), **excitation** (brushes/contactless), **magnet chemistry** (NdFeB, HREE-free NdFeB, ferrite, Fe16N2), **geometry** (axial/radial), and **end market** (EV/industrial) as mutually exclusive columns.

## Visual content taxonomy

| Layer | Examples | How to display it |
| --- | --- | --- |
| Rotor-field architecture | PM synchronous, wound-field synchronous, induction, SynRM | Main motor map |
| Excitation implementation | brushes/slip rings, rotating transformer, contactless MCT | EESM detail/maturity map |
| Magnet chemistry | conventional NdFeB, HREE-free NdFeB, ferrite, iron nitride | Material layer nested under PM routes |
| Geometry / packaging | radial flux, axial flux, in-wheel, e-axle | A composable attribute, not an alternative motor family |
| Market | passenger EV traction, two/three-wheelers, industrial/HVAC | Persistent scope filter |

## High-risk copy substitutions

| Do not say | Say instead |
| --- | --- |
| “5% of EV motors are rare-earth-free” | “Rare-earth-free traction remains an emerging, unevenly disclosed segment.” |
| “China banned rare earths” | “China's April 2025 notice imposed export controls on specified medium/heavy rare-earth items.” |
| “Dy/Tb cool the magnet” | “Dy/Tb help a magnet resist demagnetization at high temperature.” |
| “Ferrite has one-third the coercivity” | “Ferrite's lower remanence/energy product forces an architecture-level design trade-off.” |
| “Iron nitride is stronger than neodymium” | “High saturation magnetization is promising; product coercivity and thermal stability remain design gates.” |
| “Virtual magnet is a separate motor family” | “It is a contactless, electrically excited synchronous-machine implementation with a control/software layer.” |
| “All these motors are drop-ins” | “The amount of vehicle change depends on which layer changes.” |

## Recommended site mechanics

1. Give every fact card an `evidenceStatus`, `sourceUrl`, `sourceDate`, `marketScope`, and `maturity` field derived from `registry.json`.
2. For `qualified` cards, show a small “conditions apply” affordance that opens the full scope statement.
3. Keep a consistent source drawer with direct links. The visual itself should be quiet; the evidence is one click away.
4. Use the `safeForLaunch` and `requiresLaterFactCheck` arrays as release filters.
