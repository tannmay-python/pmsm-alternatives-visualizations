export const PMSM_TURN_STEPS = [
  "assemble",
  "field",
  "sync",
  "buried",
  "torques",
] as const;

export type PmsmTurnStep = (typeof PMSM_TURN_STEPS)[number];

export type StatorFocus = "stator" | "rotor" | "both";
export type FieldSpeed = "slow" | "faster";
export type LoadLevel = "light" | "higher";
export type BuriedFocus = "retention" | "paths";
export type TorqueFocus = "magnet" | "steel" | "both";

export const PHASE_ANGLES = [0, -120, 120] as const;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * A frozen, balanced three-phase snapshot. The values deliberately sum to
 * zero: they model timing, not a measured current waveform.
 */
export function getBalancedPhaseStrengths(angleDegrees = 0): readonly number[] {
  return PHASE_ANGLES.map((phaseAngle) =>
    Math.cos(toRadians(angleDegrees + phaseAngle)),
  );
}

export function phaseVisualOpacity(strength: number): number {
  return 0.28 + Math.abs(strength) * 0.72;
}

export function fieldDuration(speed: FieldSpeed): number {
  return speed === "faster" ? 2.8 : 5.6;
}

/**
 * The angle is intentionally enlarged so a first-time learner can see it.
 * Both values remain inside the stable, synchronised teaching range.
 */
export function loadAngle(load: LoadLevel): number {
  return load === "higher" ? 38 : 18;
}

export function torqueIsVisible(
  focus: TorqueFocus,
  contribution: Exclude<TorqueFocus, "both">,
): boolean {
  return focus === "both" || focus === contribution;
}

export function stableSyncNote(load: LoadLevel): string {
  return load === "higher"
    ? "A larger fixed gap is shown. This view stops before loss of synchronism."
    : "Stable synchronous range shown. The field and rotor keep the same speed.";
}
