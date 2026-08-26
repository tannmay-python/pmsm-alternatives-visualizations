import type { Stop, StopState } from "../route/route";
import { stageForState } from "../route/route";
import type { ShotName } from "./framing";

/**
 * States whose subject is the air gap: what the stator field does, and how the
 * rotor answers it. The housing and end caps hide exactly that, so they come off.
 */
export const CUTAWAY_STATES: ReadonlySet<string> = new Set([
  "one-phase",
  "three-phases",
  "no-part-moves",
  "rotor-locks",
  "why-buried",
  "lopsided",
  "reluctance",
  "load-angle",
  "already-both",
  "induction-principle",
  "induction-duty",
  "wound-control",
  "wound-hardware",
  "contactless-frontier",
  "reluctance-spectrum",
  "srm-aluminium",
  "ferrite-limit",
  "one-kilogram",
]);

/** Which camera shot a given stop and state wants. */
export function shotFor(stop: Stop, state: StopState, explode: number): ShotName {
  const stage = stageForState(stop, state);
  if (stage.kind !== "three") return "motor";
  if (stage.scene === "axial") return "axial";
  if (stage.scene === "car") {
    return state.id === "one-part" || state.id === "drive-unit" ? "car-close" : "car";
  }
  if (explode > 0.15) return "motor-exploded";
  // Anything about the rotating field is read down the bore, not side-on.
  if ([
    "one-phase",
    "three-phases",
    "no-part-moves",
    "rotor-locks",
    "lopsided",
    "reluctance",
    "reluctance-spectrum",
    "rotor",
    "one-kilogram",
  ].includes(state.id)) {
    return "motor-face";
  }
  if (CUTAWAY_STATES.has(state.id)) return "rotor";
  if (stop.id === "swap-the-rotor") return "rotor";
  return "motor";
}

/**
 * Which field lesson a beat runs.
 *
 * Lifted out of the scene alongside the shot table so the route structure can
 * ask whether two states really produced the same frame before merging them.
 */
export function fieldLessonFor(stop: Stop, state: StopState): "fixed" | "lock" | "sweep" | "none" {
  return (
    stop.id === "three-coils-one-field"
      ? state.id === "one-phase"
        ? "fixed"
        : state.id === "rotor-locks"
          ? "lock"
          : "sweep"
      : stop.id === "two-pulls-one-shaft"
        ? state.id === "load-angle" || state.id === "already-both"
          ? "lock"
          : "sweep"
        : stop.id === "swap-the-rotor" && state.id !== "family-tree"
          ? "sweep"
          : "none"
  );
}
