# PMSM curriculum and evidence subsystem

This folder is deliberately framework-neutral. It contains no React component,
canvas scene, CSS, or design asset. It gives the visual application a stable
editorial contract instead.

## Entry point

Import `pmsmContent` from `src/content/index.ts`. It contains:

- eight preserved source chapter manifests;
- 46 granular, visually distinct teaching steps;
- the 35-row due-diligence coverage matrix;
- claim/source/audit records suitable for an evidence drawer;
- composable motor configurations and named example records;
- power and speed records with peak/continuous safeguards.

Each step exposes precisely what the approved visual stage needs:

```ts
step.title;            // one concise title
step.learnerQuestion;  // one concise question ending in ?
step.copy.glance;      // max two on-stage sentences
step.copy.why;         // expandable mechanism explanation
step.copy.evidence;    // expandable evidence/caveat explanation
step.visual;           // device, visible consequence, interaction, fallback
step.controls;         // implementation-ready reader controls
```

`step.placement` is either `main` or `optional-deep-dive`. The application
must open on the main route and reveal optional labs only when the reader asks.
The rendering adapter composes a five-group, nineteen-step beginner route from
those source manifests without rewriting their steps or evidence records.
Chapter 1's main route is fixed as: whole car → power path → extract and open
drive unit → isolate motor. The earlier market context is optional; it must not
block a beginner from reaching the machine.

The visual stage must remain visible when opening Why or Evidence. Drawers
belong to the right panel; they never replace or dim the technical scene.

## Taxonomy contract

Never render these as one mutually exclusive category list:

| Independent axis | Examples |
| --- | --- |
| Torque principle | permanent magnet, wound field, induction, SynRM, SRM |
| Rotor excitation | permanent, externally excited, brushed, contactless, induced |
| Magnet chemistry | NdFeB, reduced-HREE NdFeB, HREE-free NdFeB, ferrite, iron nitride |
| Geometry | radial, axial |
| Winding material | copper, aluminium |
| Market and maturity | EV traction, industrial, appliance; production through material scale-up |

This allows legitimate combinations such as PM-assisted SynRM, ferrite axial
flux and aluminium-wound SRM without category errors.

## Evidence release gate

The app-local `evidenceAudit.ts` mirrors the launch rules distilled from the
full audit at `pmsm-evidence-work/evidence-audit/registry.json` (2026-08-09).

- `verified`: may render with its date, market, condition and source.
- `qualified`: render only with its condition/caveat visible in Evidence.
- `unverified` or `contradicted`: `renderingPolicy` is `hide`; never promote
  the claim or its number into the stage.

This specifically suppresses the unsupported 5% adoption figure, generic
induction slip/range figures, universal motor-temperature/composition figures,
Audi-cooling-to-Dy conclusions, universal brush assertions, iBEE 2028 series
production, Vimag/Volektra legal-entity assertions, and universal three-to-five
year validation timelines.

## Validation

Run:

```bash
npm run test:content
```

The tests reject:

- architecture/material/geometry layer conflation;
- missing source/date/market/qualifier/denominator on quantitative claims;
- unverified public claim rendering;
- peak-only performance records that require a continuous counterpart;
- blank, prose-only, or non-interactive due-diligence coverage;
- absent learner questions, overlong on-stage copy, and missing visual fallback;
- removal of any topic from the fixed coverage checklist.

The coverage ledger also classifies every item as `main`,
`optional-deep-dive`, `evidence-only`, or `omit`. Only main-path topics must
appear in the default learning journey. `evidence-only` records remain in the
drawer and maturity board; `omit` keeps incidental funding/location corrections
in the research audit rather than forcing them into the learning experience.

`npm run build` includes TypeScript validation of the module.

## Merge boundary

The foundation application should import this folder but should not duplicate
claims in component files. It can bind the active `ChapterStep` to its existing
chapter state machine and use `step.visual.device` to select a Three.js, SVG or
2D fallback implementation. Use `claimIds` for the step Evidence drawer and
keep any record with `renderingPolicy: "hide"` out of public factual copy.
