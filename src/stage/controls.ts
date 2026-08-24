/**
 * Every value a stop can hand the stage. Keeping these on one object means a
 * control added for one stop cannot leave stale state behind in the next.
 */
export type StageControls = {
  /** 0 = assembled, 1 = fully apart. One scalar drives every part. */
  explode: number;
  /** Electrical angle, radians. */
  angle: number;
  /** Shaft load, reverse field, speed or ladder rung, depending on the stop. */
  load: number;
  /** Rotor temperature, 0 = 20 °C, 1 = 180 °C. */
  heat: number;
  /** Dysprosium lesson, normalised for the teaching curve. */
  dysprosium: number;
  /** Depth of the grain-boundary diffusion shell. */
  diffusion: number;
  /** Progress of surface-nucleated demagnetisation through a grain. */
  nucleation: number;
  /** Counter-current spent to weaken a permanent-magnet field. */
  weakening: number;
  isolate: "none" | "stator" | "rotor";
  activePhase: number | null;
  /** False models the inverter gated off at speed. */
  fieldLive: boolean;
  /** 0–1, pulls the drive unit out of the car. */
  extract: number;
};

export const DEFAULT_CONTROLS: StageControls = {
  explode: 0,
  angle: 0,
  load: 0.35,
  heat: 0.2,
  dysprosium: 0,
  diffusion: 0,
  nucleation: 0,
  weakening: 0,
  isolate: "none",
  activePhase: null,
  fieldLive: true,
  extract: 0,
};
