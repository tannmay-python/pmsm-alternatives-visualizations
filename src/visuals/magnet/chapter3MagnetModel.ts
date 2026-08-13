export const chapter3MainRoute = [
  "remanence-strength",
  "coercivity-lock",
  "heat-demagnetisation",
  "dy-tb-tradeoff",
] as const;

export type Chapter3MainStep = (typeof chapter3MainRoute)[number];

export const chapter3Labs = [
  "grain-boundary-diffusion",
  "cooling-and-smco",
] as const;

export type Chapter3Lab = (typeof chapter3Labs)[number];

export type HeatTestState = {
  heat: number;
  opposingField: number;
  demagLatched: boolean;
};

export type CoercivityComparison = {
  lowerCoercivityReversed: boolean;
  higherCoercivityReversed: boolean;
};

export type DyTbTradeoff = {
  level: 0 | 1 | 2;
  reversalMargin: "baseline" | "more" | "most";
  retainedStrength: "full" | "reduced" | "lower";
  marginLength: number;
  retainedLength: number;
};

export type LabSession = {
  activeLab: Chapter3Lab | null;
  restoreFocusTo: string | null;
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

/**
 * These are illustrative comparison gates, not material-grade thresholds.
 * They only make the causal ordering visible: the lower-coercivity example
 * reverses before the higher-coercivity example under the same input.
 */
export const compareCoercivity = (opposingField: number): CoercivityComparison => {
  const stress = clamp(opposingField);
  return {
    lowerCoercivityReversed: stress >= 48,
    higherCoercivityReversed: stress >= 84,
  };
};

/** A reversed patch stays latched until the reader chooses a fresh magnet. */
export const applyHeatTest = (
  previous: HeatTestState,
  heat: number,
  opposingField: number,
): HeatTestState => {
  const nextHeat = clamp(heat);
  const nextField = clamp(opposingField);
  const combinedStressCreatesPatch = nextHeat >= 64 && nextField >= 70;

  return {
    heat: nextHeat,
    opposingField: nextField,
    demagLatched: previous.demagLatched || combinedStressCreatesPatch,
  };
};

export const freshHeatTest = (): HeatTestState => ({
  heat: 24,
  opposingField: 28,
  demagLatched: false,
});

export const dyTbTradeoff = (value: number): DyTbTradeoff => {
  const level = Math.max(0, Math.min(2, Math.round(value))) as 0 | 1 | 2;
  const options: readonly DyTbTradeoff[] = [
    {
      level: 0,
      reversalMargin: "baseline",
      retainedStrength: "full",
      marginLength: 0.54,
      retainedLength: 1,
    },
    {
      level: 1,
      reversalMargin: "more",
      retainedStrength: "reduced",
      marginLength: 0.72,
      retainedLength: 0.84,
    },
    {
      level: 2,
      reversalMargin: "most",
      retainedStrength: "lower",
      marginLength: 0.9,
      retainedLength: 0.7,
    },
  ];

  return options[level];
};

export const openLab = (lab: Chapter3Lab, triggerId: string): LabSession => ({
  activeLab: lab,
  restoreFocusTo: triggerId,
});

export const closeLab = (): LabSession => ({
  activeLab: null,
  restoreFocusTo: null,
});

export const isLabCloseKey = (key: string) => key === "Escape";

/** Main-route keys are held while a reader is working inside an optional lab. */
export const isLabRouteNavigationKey = (key: string) =>
  ["ArrowRight", "ArrowLeft", "PageDown", "PageUp", "Home", "End"].includes(key);

export type Chapter3LabelSpec = {
  text: string;
  words: number;
};

/** Keep labels brief enough to stay in the stage's collision-safe bands. */
export const labelSpecsByView: Readonly<Record<Chapter3MainStep | Chapter3Lab, readonly Chapter3LabelSpec[]>> = {
  "remanence-strength": [
    { text: "Helper field", words: 2 },
    { text: "Field remains", words: 2 },
  ],
  "coercivity-lock": [
    { text: "Turns first", words: 2 },
    { text: "Holds", words: 1 },
  ],
  "heat-demagnetisation": [
    { text: "Heat", words: 1 },
    { text: "Patch remains", words: 2 },
  ],
  "dy-tb-tradeoff": [
    { text: "More margin", words: 2 },
    { text: "Less field", words: 2 },
  ],
  "grain-boundary-diffusion": [
    { text: "Uniform mix", words: 2 },
    { text: "Edge shell", words: 2 },
  ],
  "cooling-and-smco": [
    { text: "Hot rotor", words: 2 },
    { text: "Cooled rotor", words: 2 },
  ],
};
