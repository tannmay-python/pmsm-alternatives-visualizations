export const VEHICLE_JOURNEY_STEPS = [
  "location",
  "energy",
  "extract",
  "motor",
] as const;

export type VehicleJourneyStep = (typeof VEHICLE_JOURNEY_STEPS)[number];

export type VehiclePart =
  | "battery"
  | "inverter"
  | "motor"
  | "reduction"
  | "wheel";

export const ENERGY_PARTS: readonly VehiclePart[] = [
  "battery",
  "inverter",
  "motor",
  "reduction",
  "wheel",
];

export const PART_DETAILS: Record<VehiclePart, string> = {
  battery: "Stores electricity for the trip.",
  inverter: "Turns battery electricity into motor electricity.",
  motor: "Turns electricity into spin.",
  reduction: "Trades fast motor spin for wheel-turning force.",
  wheel: "Uses that force to move the car.",
};

export type ExtractionTransform = {
  x: number;
  y: number;
  opacity: number;
};

export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getExtractionTransform(progress: number): ExtractionTransform {
  const amount = clampUnit(progress);
  return {
    x: 104 * amount,
    y: 126 * amount,
    opacity: 1 - amount * 0.05,
  };
}

export function isActiveEnergyLink(
  activeIndex: number,
  linkIndex: number,
): boolean {
  const normalized = ((activeIndex % ENERGY_PARTS.length) + ENERGY_PARTS.length) % ENERGY_PARTS.length;
  return normalized === linkIndex;
}

export function getNextEnergyIndex(currentIndex: number): number {
  return (currentIndex + 1) % ENERGY_PARTS.length;
}

export function makeSvgId(base: string, reactId: string): string {
  return `${base}-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
