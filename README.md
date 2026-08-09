# PMSM alternatives visualizations

This is the canonical working copy for a visual explanation of permanent-magnet
synchronous motors, magnet materials, and alternative traction-motor routes.

## Phase 1 foundation

- One Vite, React, and TypeScript runtime. The old generated component runtime,
  CDN imports, and `support.js` entry are removed.
- Eight short, click-led chapters are represented by a typed chapter registry.
  The main path is intentionally one cause-and-effect visual at a time; deep
  and evidence layers are structured as optional supporting material.
- Every chapter step must include a concrete `visualState`: visual mode, primary
  interaction, visible elements, and visual change. `validateVisualContract()`
  rejects prose-only additions at runtime and in tests.
- Back and Next controls, the chapter rail map, arrow-key navigation, hash routes,
  reduced-motion behavior, skip link, and WebGL fallback all live in the app
  shell.
- The reusable procedural Three.js stage is lazy-loaded behind an accessible
  visual-guide fallback. Future visual scenes can be added through the scene
  registry without changing navigation or routing.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## GitHub Pages base path

The existing route remains the development default:

```text
/PMSM-Visualizations/
```

For the final repository, set the desired path when building:

```bash
VITE_BASE_PATH=/pmsm-alternatives-visualizations/ npm run build
```

## Integration hooks

- `src/content/chapters.ts`: approved chapter copy, scene registry, main-path
  sequencing, optional deep/evidence layers, and visual contract.
- `src/state/story-reducer.ts`: routes, Back and Next behavior, chapter jumps,
  and reduced-motion state.
- `src/components/SceneStage.tsx`: WebGL loading and fallback boundary plus the
  scene blueprint interface.
- `src/components/StoryCanvas.tsx`: reusable procedural car, motor, field,
  magnet, and rotor geometry from the previous implementation.
- Each `SceneDefinition` accepts an optional primary and reduced-motion asset;
  add approved Claude Design output there and the persistent stage will use it
  without shell changes.
- `design/references/`: legacy visual references only. New Claude Design assets
  should enter a dedicated `src/assets/scenes/` folder with an asset manifest.
