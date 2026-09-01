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
