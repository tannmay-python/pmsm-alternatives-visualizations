
/**
 * How the tour is arranged, kept separate from what it says.
 *
 * route.ts owns the prose and is not edited here. This file owns three
 * decisions about presentation, all of which came out of the 26 August review:
 *
 *  1. Which stops share a chapter, so the reader meets seven chapters rather than one
 *     rail of thirty-odd stops. "Don't have 30 — no one's starting the
 *     walkthrough. Club it into five six pages."
 *
 *  2. Which consecutive beats collapse into one. Resolving every state's stage
 *     against route.ts, the control presets and the camera shot, the old tour's
 *     62 beats produced only about 26 distinct pictures: `what-must-change`
 *     rendered one diagram six times unchanged, `change-the-magnet` showed
 *     `property-board` four times in a row. A beat now exists only where the
 *     picture changes. No prose is dropped — merged beats carry every line
 *     they came from, which is also what fixes the thinness of one sentence
 *     per screen.
 *
 *  3. Which feature each figure points at, so that beats sharing a figure
 *     still differ: the annotation moves even when the drawing does not.
 *
 * The opening stop is absorbed into the landing page. `what-must-change` is
 * kept in the route as the ordinary seventh chapter so the tour has one spine
 * and an explicit end screen.
 */

export const LANDING_STOP_ID = "the-problem";
export const CLOSE_STOP_ID = "what-must-change";

/**
 * The interstitial shown on the way into a chapter.
 *
 * These were hardcoded against cursor indices, so only three of the five
 * chapter boundaries had one and the rest of the tour cut straight from a
 * closing beat into an unrelated opening frame. Declaring them next to the
 * page they introduce means every boundary gets one by construction, and a
 * test can check that.
 */
export type PageTransition = {
  /** Mono, uppercase. Where the reader is in the argument. */
  act: string;
  title: string;
  lede: string;
  /** Mono, uppercase button label. */
  nextLabel: string;
};

export type PageSpec = {
  id: string;
  /** Mono, uppercase. Positional metadata. */
  eyebrow: string;
  /** Inter, Title Case. This is a destination, so it is never mono. */
  title: string;
  /** Which side the reading box sits on; the scene shifts the other way. */
  side: "left" | "right";
  /**
   * Shown when arriving at this page from the one before. The first page has
   * none: the landing already hands the reader in.
   */
  transition?: PageTransition;
  stops: readonly StopSpec[];
};

/**
 * A merge of states that do NOT draw the same frame.
 *
 * The plain array form is checked: if the states in it differ in stage,
 * control preset, camera shot, cutaway, field lesson or figure branch, the
 * build refuses it. That check exists because the first pass of this table was
 * wrong — it would have folded the dysprosium shift into the beat before it
 * and quietly lost the shift.
 *
 * This form is the deliberate exception, and it has to say why. It is for the
 * cases where the second state is a conclusion drawn on the first state's
 * frame, or where the merged frame is simply the better one.
 */
export type DeliberateMerge = {
  ids: readonly string[];
  /** Which state's frame the merged beat shows. Defaults to the first. */
  frame?: string;
  why: string;
};

export type BeatGroup = readonly string[] | DeliberateMerge;

export type StopSpec = {
  /** A stop id from route.ts, or a slice of one that has been split in two. */
  from: string;
  /** Set when one route.ts stop supplies more than one page stop. */
  id?: string;
  title?: string;
  /**
   * Ordered beat groups. Each group becomes one beat carrying every line in
   * it. Groups also fix the order, which is how `heat-and-the-patch` stops
   * alternating between two figures and reads as two figures instead.
   */
  groups: readonly BeatGroup[];
};

export const PAGES: readonly PageSpec[] = [
  {
    id: "where-the-motor-lives",
    eyebrow: "Page 01",
    title: "Where the Motor Lives",
    side: "left",
    stops: [
      {
        from: "where-the-motor-lives",
        groups: [["power-path"], ["drive-unit"]],
      },
      {
        from: "open-the-machine",
        groups: [["explode"], ["housing"], ["stator"], ["rotor"], ["shaft"], ["air-gap"]],
      },
    ],
  },
  {
    id: "how-it-turns",
    eyebrow: "Page 02",
    title: "How It Turns",
    side: "right",
    transition: {
      act: "Act I · The Machine",
      title: "From stationary parts to a turning field",
      lede: "You have seen the seven parts and where each one sits. What follows is how three coils that never move produce a field that does, and why the rotor keeps pace with it.",
      nextLabel: "See how it turns",
    },
    stops: [
      {
        from: "three-coils-one-field",
        groups: [
          ["electromagnet-rule"],
          ["one-phase"],
          ["three-phase-math"],
          ["no-part-moves"],
          ["rotor-locks"],
        ],
      },
      {
        from: "two-pulls-one-shaft",
        groups: [
          ["why-buried"],
          ["reluctance-split"],
          ["already-both"],
        ],
      },
    ],
  },
  {
    id: "the-magnet",
    eyebrow: "Page 03",
    title: "The Magnet",
    side: "left",
    transition: {
      act: "Act II · The Material",
      title: "Why neodymium, and not something cheaper",
      lede: "The rotor is pulled by a magnet whose strength comes from one alloy. This chapter looks at what that alloy does, what heat costs it, and which rare earth the April 2025 notice actually named.",
      nextLabel: "Open the magnet",
    },
    stops: [
      {
        from: "strength-and-stubbornness",
        groups: [
          ["division-of-labour"],
          ["anisotropy"],
          {
            ids: ["remanence", "coercivity"],
            frame: "coercivity",
            why: "The two numbers form the two orthogonal axes of the B-H curve: vertical remanence and horizontal coercivity.",
          },
        ],
      },
      {
        from: "heat-and-the-patch",
        groups: [
          ["hot-margin"],
          ["reversal-start"],
          ["dysprosium-tradeoff"],
          ["diffusion-evolution"],
        ],
      },
      {
        from: "which-rare-earth",
        groups: [
          ["the-split", "licence-not-ban"],
          ["the-cheapest-move", "cool-it-instead"],
          ["already-happened"],
        ],
      },
    ],
  },
  {
    id: "the-ceiling",
    eyebrow: "Page 04",
    title: "The Ceiling",
    side: "right",
    transition: {
      act: "Act III · The Limit",
      title: "A magnet you cannot switch off",
      lede: "A permanent magnet is always on. That helps at low speed and constrains at high speed, and the constraint is an engineering reason to look at alternatives rather than only a supply one.",
      nextLabel: "Find the ceiling",
    },
    stops: [
      {
        from: "the-weakness",
        id: "always-on",
        title: "A magnet you cannot switch off",
        groups: [["always-on", "back-emf"], ["ceiling"]],
      },
      {
        from: "the-weakness",
        id: "paying-to-cancel",
        title: "Paying current to cancel your own magnet",
        groups: [
          ["field-weakening"],
          {
            ids: ["fault", "the-obvious-fix"],
            why: "`the-obvious-fix` states the conclusion of the fault frame and returns the plot to rest; the point lands better read against the fault it answers.",
          },
        ],
      },
    ],
  },
  {
    id: "swap-the-rotor",
    eyebrow: "Page 05",
    title: "Swap the Rotor",
    side: "left",
    transition: {
      act: "Act IV · The Alternatives",
      title: "Change the rotor, keep the machine",
      lede: "The first way out is to change what the rotor does. Induction, wound-field and reluctance rotors each keep pace with the stator field by a different mechanism, and each moves the cost somewhere else.",
      nextLabel: "Compare the rotors",
    },
    stops: [
      {
        from: "swap-the-rotor",
        id: "which-rotors-keep-pace",
        title: "Which rotors keep pace",
        groups: [["family-tree"], ["induction-principle", "induction-duty"]],
      },
      {
        from: "swap-the-rotor",
        id: "rotors-without-magnets",
        title: "Rotors that need no magnet",
        groups: [
          ["wound-control"],
          ["wound-hardware"],
          ["contactless-frontier"],
          ["reluctance-spectrum"],
          ["srm-aluminium"],
        ],
      },
    ],
  },
  {
    id: "change-the-magnet",
    eyebrow: "Page 06",
    title: "Change the Magnet",
    side: "right",
    transition: {
      act: "Act IV · The Alternatives",
      title: "Change the magnet, not the machine",
      lede: "Rotor architecture and magnet chemistry are separate choices, and the evidence audit is explicit that they must not be presented as one column. This chapter holds the machine still and changes only what the magnet is made of.",
      nextLabel: "Compare the magnets",
    },
    stops: [
      {
        from: "change-the-magnet",
        id: "ferrite-and-its-cost",
        title: "Ferrite, and what it costs",
        groups: [
          ["a-different-layer"],
          ["ferrite-limit"],
          ["compensate-geometry"],
          ["independent-geometry"],
        ],
      },
      {
        from: "change-the-magnet",
        id: "reading-the-numbers",
        title: "Reading both numbers together",
        // Four consecutive identical `property-board` frames became two.
        // Not merged: each of these selects a different column of the
        // property board, so merging would drop three of the four materials.
        groups: [
          ["proterial-numbers"],
          ["iron-nitride-gates"],
          ["variable-flux-fit"],
          ["stackable-layers"],
        ],
      },
    ],
  },
  {
    id: "what-has-to-change",
    eyebrow: "Page 07",
    title: "What Has to Change",
    side: "left",
    transition: {
      act: "Act V · The Decision",
      title: "The decision is problem-first",
      lede: "The alternatives are not one ladder. Each route keeps some parts of the vehicle and rewrites others, so the useful comparison is the problem each route solves and the burden it adds.",
      nextLabel: "Make the comparison",
    },
    stops: [
      {
        from: "what-must-change",
        groups: [["survivors"], ["burden"], ["spectrum"], ["validation"], ["two-markets"], ["where-we-are"]],
      },
    ],
  },
];

/**
 * Which feature of a figure carries the annotation, per beat.
 *
 * This is what lets beats share a drawing without repeating themselves: the
 * wine leader line and its note move even when the plot does not. Keyed
 * `pageStopId/beatId`. Absent means the figure draws unannotated.
 */
export const EMPHASIS: Readonly<Record<string, string>> = {
  // The merged remanence + coercivity beat shows the coercivity frame, so it
  // has to be told to draw both leaders rather than just the one.
  "strength-and-stubbornness/remanence": "remanence-and-coercivity",
  "strength-and-stubbornness/anisotropy": "energy-product",
};
