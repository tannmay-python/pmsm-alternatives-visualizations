/**
 * The public walkthrough spine.
 *
 * route.ts keeps the full research and engineering source material. This file
 * deliberately selects a 21-frame course that answers only the three questions
 * the reader needs: what a permanent-magnet motor is and how it works, what can
 * replace it, and what each replacement costs in engineering effort.
 */

export const LANDING_STOP_ID = "the-problem";

export type PageTransition = {
  act: string;
  title: string;
  lede: string;
  nextLabel: string;
};

export type PageSpec = {
  id: string;
  eyebrow: string;
  title: string;
  side: "left" | "right";
  transition?: PageTransition;
  stops: readonly StopSpec[];
};

export type DeliberateMerge = {
  ids: readonly string[];
  frame?: string;
  why: string;
};

export type BeatGroup = readonly string[] | DeliberateMerge;

export type StopSpec = {
  from: string;
  id?: string;
  title?: string;
  groups: readonly BeatGroup[];
};

export const PAGES: readonly PageSpec[] = [
  {
    id: "the-motor-in-the-car",
    eyebrow: "Chapter 01",
    title: "The Motor in the Car",
    side: "left",
    stops: [
      {
        from: "where-the-motor-lives",
        groups: [["power-path"]],
      },
      {
        from: "open-the-machine",
        groups: [["explode"], ["rotor"], ["air-gap"]],
      },
    ],
  },
  {
    id: "how-it-turns",
    eyebrow: "Chapter 02",
    title: "How It Turns",
    side: "right",
    transition: {
      act: "The mechanism",
      title: "Make a magnetic field move",
      lede: "Nothing in the outer ring moves. Switch its coils on in the right order and the magnetism goes round anyway, and the rotor chases it.",
      nextLabel: "See how it turns",
    },
    stops: [
      {
        from: "three-coils-one-field",
        groups: [["electromagnet-rule"], ["three-phase-math"], ["rotor-locks"]],
      },
      {
        from: "two-pulls-one-shaft",
        groups: [["already-both"]],
      },
    ],
  },
  {
    id: "why-the-rare-earths",
    eyebrow: "Chapter 03",
    title: "Why the Rare Earths",
    side: "left",
    transition: {
      act: "The material",
      title: "Why this magnet creates a supply risk",
      lede: "Neodymium gives the magnet its pull. A pinch of dysprosium and terbium lets it survive a hot rotor. That pinch is the part that was restricted.",
      nextLabel: "Look inside the magnet",
    },
    stops: [
      {
        from: "strength-and-stubbornness",
        groups: [["division-of-labour"]],
      },
      {
        from: "which-rare-earth",
        groups: [["the-split"]],
      },
      {
        from: "heat-and-the-patch",
        groups: [["dysprosium-tradeoff"]],
      },
      {
        from: "which-rare-earth",
        id: "reduce-the-exposure",
        title: "Reduce the exposure",
        groups: [["already-happened"]],
      },
    ],
  },
  {
    id: "the-alternatives",
    eyebrow: "Chapter 04",
    title: "The Alternatives",
    side: "right",
    transition: {
      act: "The alternatives",
      title: "Change what turns the rotor",
      lede: "A cage of bars, a coil you power, shaped steel or a cheaper magnet can all turn the rotor. Each one removes some rare earth and moves the cost somewhere else.",
      nextLabel: "Meet the alternatives",
    },
    stops: [
      {
        from: "swap-the-rotor",
        groups: [
          ["family-tree"],
          ["induction-principle"],
          ["wound-control"],
          ["reluctance-spectrum"],
          ["srm-aluminium"],
        ],
      },
      {
        from: "change-the-magnet",
        groups: [["ferrite-limit"]],
      },
    ],
  },
  {
    id: "tradeoffs-and-readiness",
    eyebrow: "Chapter 05",
    title: "Trade-offs and Readiness",
    side: "left",
    transition: {
      act: "The decision",
      title: "How much of the car must change?",
      lede: "Several of these already drive cars. The question is how much of the car has to change to fit one, and how long that takes.",
      nextLabel: "Weigh them up",
    },
    stops: [
      {
        from: "what-must-change",
        groups: [["spectrum"], ["validation"], ["where-we-are"]],
      },
    ],
  },
];

export const EMPHASIS: Record<string, string> = {};
