import type { Stop, StopState } from "../route/route";
import { stageForState } from "../route/route";
import type { ShotName } from "./framing";

/**
 * States whose subject is the air gap: what the stator field does, and how the
 * rotor answers it. The housing and end caps hide exactly that, so they come off.
 */
export const CUTAWAY_STATES: ReadonlySet<string> = new Set([
  "air-gap",
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
export function shotFor(
  stop: Stop,
  state: StopState,
  explode: number,
  isolate: string = "none",
): ShotName {
  const stage = stageForState(stop, state);
  if (stage.kind !== "three") return "motor";
  if (stage.scene === "axial") return "axial";
  if (stage.scene === "car") {
    return state.id === "one-part" || state.id === "drive-unit" ? "car-close" : "car";
  }
  if (isolate === "air-gap") return "motor-face";
  if (isolate === "rotor" || isolate === "shaft") return "rotor";
  if (explode > 0.15 && isolate === "none") return "motor-exploded";
  // Anything about the rotating field or air gap is read down the bore, not side-on.
  if ([
    "air-gap",
    "one-phase",
    "three-phases",
    "no-part-moves",
    "rotor-locks",
    "lopsided",
    "reluctance",
    "reluctance-spectrum",
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
 * This controls the field lines and the green resultant-flux arrow in the bore.
 */
export function fieldLessonFor(
  stop: Stop,
  state: StopState,
): "none" | "fixed" | "sweep" | "lock" {
  if (stop.id === "three-coils-one-field") {
    if (state.id === "one-phase") return "fixed";
    if (state.id === "three-phases" || state.id === "no-part-moves") return "sweep";
    if (state.id === "rotor-locks") return "lock";
  }
  if (stop.id === "rotor-locks-to-field") {
    return "lock";
  }
  return "none";
}
