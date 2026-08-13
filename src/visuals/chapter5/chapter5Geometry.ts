export const coreAlternativeStepIds = [
  "induction-cage-lab",
  "wound-field-lab",
  "pure-synrm-lab",
] as const;

export type CoreAlternativeStepId = (typeof coreAlternativeStepIds)[number];

export const isCoreAlternativeStepId = (stepId: string): stepId is CoreAlternativeStepId =>
  coreAlternativeStepIds.some((id) => id === stepId);

export interface CoreAlternativeState {
  activeStateId: CoreAlternativeStepId;
  relativeSpeed: number;
  rotorExcitation: number;
  woundOilCooling: boolean;
  powerFactor: number;
}

export const DEFAULT_CORE_ALTERNATIVE_STATE: CoreAlternativeState = {
  activeStateId: "induction-cage-lab",
  relativeSpeed: 50,
  rotorExcitation: 75,
  woundOilCooling: true,
  powerFactor: 0.85,
};

export const CENTER = { x: 500, y: 290 };
export const MOTOR_RADIUS = 210;
export const ROTOR_RADIUS = 135;

export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(" ");
};

export type CoreCallout = {
  id: string;
  label: string;
  target: { x: number; y: number };
  labelAt: { x: number; y: number };
  tone: "cyan" | "copper" | "steel";
  align: "start" | "end";
};

export const getCoreCallouts = (stepId: CoreAlternativeStepId): readonly CoreCallout[] => {
  switch (stepId) {
    case "induction-cage-lab":
      return [
        {
          id: "stator-field",
          label: "STATOR FIELD",
          target: { x: 500, y: 115 },
          labelAt: { x: 300, y: 47 },
          tone: "cyan",
          align: "end",
        },
        {
          id: "induced-current",
          label: "INDUCED CURRENT",
          target: { x: 606, y: 234 },
          labelAt: { x: 700, y: 47 },
          tone: "copper",
          align: "start",
        },
      ];
    case "wound-field-lab":
      return [
        {
          id: "rotor-winding",
          label: "ROTOR WINDING",
          target: { x: 588, y: 222 },
          labelAt: { x: 700, y: 47 },
          tone: "copper",
          align: "start",
        },
        {
          id: "shaft-cooling",
          label: "SHAFT COOLING",
          target: { x: 500, y: 290 },
          labelAt: { x: 300, y: 47 },
          tone: "cyan",
          align: "end",
        },
      ];
    case "pure-synrm-lab":
      return [
        {
          id: "flux-barriers",
          label: "FLUX BARRIERS",
          target: { x: 433, y: 228 },
          labelAt: { x: 300, y: 47 },
          tone: "steel",
          align: "end",
        },
        {
          id: "easy-axis",
          label: "EASY AXIS",
          target: { x: 562, y: 210 },
          labelAt: { x: 700, y: 47 },
          tone: "cyan",
          align: "start",
        },
      ];
  }
};
