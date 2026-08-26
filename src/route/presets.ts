import { DEFAULT_CONTROLS, type StageControls } from "../stage/controls";
import { CUTAWAY_STATES, fieldLessonFor, shotFor } from "../stage/shots";
import type { Stop, StopState } from "./route";

/**
 * The control values each beat is written for, so nothing is ever left
 * mid-drag from the beat before it.
 *
 * This lives here rather than inside the shell because the structure module
 * has to be able to ask whether two states actually drew the same picture.
 * Two states can share a stage and still differ completely once the preset is
 * applied — `hot-margin` and `dysprosium-tradeoff` are both the demagnetisation
 * curve, but one of them moves the curve, which is the entire point of it.
 */
export const presetFor = (stopId: string, stateId: string): StageControls => ({
  ...DEFAULT_CONTROLS,
  explode:
    stopId === "open-the-machine"
      ? stateId === "explode"
        ? 0.55
        : 0
      : stateId === "compensate-geometry" || stateId === "independent-geometry"
        ? 0.6
        : 0,
  isolate: stateId === "stator" ? "stator" : stateId === "rotor" ? "rotor" : "none",
  activePhase: stateId === "one-phase" ? 0 : null,
  extract: 0,
  dysprosium: stateId === "dysprosium-tradeoff" ? 0.35 : 0,
  diffusion: stateId === "diffusion-evolution" ? 0.55 : 0,
  nucleation: stateId === "reversal-start" ? 0.25 : 0,
  weakening: stateId === "field-weakening" ? 0.45 : stateId === "fault" ? 0.75 : 0,
  fieldLive: true,
  angle: stateId === "anisotropy" ? (Math.PI / 2) * 0.35 : 0,
  load:
    stateId === "load-angle" || stateId === "induction-principle" || stateId === "induction-duty" ? 0.6
    : stateId === "hot-margin" ? 0.3
    : stateId === "ceiling" || stateId === "field-weakening" ? 0.85
    : stateId === "coercivity" || stateId === "anisotropy" ? 0.5
    : DEFAULT_CONTROLS.load,
  heat:
    stateId === "hot-margin" ? 0.5
    : stateId === "reversal-start" || stateId === "dysprosium-tradeoff" ? 0.5
    : 0.15,
});

/**
 * States that the SVG figures branch on by name.
 *
 * Derived from the `state === "…"` tests in diagrams/Diagrams.tsx and the
 * state-to-column map in models/materialLab.ts. A merge keeps the first
 * state's id, so folding one of these in as a later member would silently
 * drop whatever it draws.
 */
const DIAGRAM_BRANCHES: ReadonlySet<string> = new Set([
  // Diagrams.tsx
  "anisotropy",
  "coercivity",
  "diffusion-evolution",
  "division-of-labour",
  "dysprosium-tradeoff",
  "fault",
  "reversal-start",
  "the-halt",
  // materialLab.ts picks a different column of the property board per state
  "a-different-layer",
  "ferrite-limit",
  "proterial-numbers",
  "iron-nitride-gates",
  "variable-flux-fit",
  "stackable-layers",
]);

/**
 * Everything that decides what a beat actually looks like.
 *
 * Two states can share a stage and still draw completely different frames once
 * the control preset lands — `hot-margin` and `dysprosium-tradeoff` are both
 * the demagnetisation curve, but one of them moves the curve, which is the
 * whole point of it. Comparing stage alone is what made the first pass of the
 * merge table wrong, so the key resolves the preset, the camera shot, the
 * cutaway and the field lesson too.
 */
export const frameKey = (stop: Stop, state: StopState): string => {
  const stage = state.stage ?? stop.stage;
  const preset = presetFor(stop.id, state.id);
  const parts: Record<string, unknown> = { stage, preset };

  if (stage.kind === "three") {
    parts.shot = shotFor(stop, state, preset.explode);
    parts.cutaway = CUTAWAY_STATES.has(state.id);
    parts.lesson = fieldLessonFor(stop, state);
  } else {
    parts.branch = DIAGRAM_BRANCHES.has(state.id) ? state.id : "-";
  }

  return JSON.stringify(parts);
};
