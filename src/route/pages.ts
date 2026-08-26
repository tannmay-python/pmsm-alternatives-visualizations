
/**
 * How the tour is arranged, kept separate from what it says.
 *
 * route.ts owns the prose and is not edited here. This file owns three
 * decisions about presentation, all of which came out of the 26 August review:
 *
 *  1. Which stops share a page, so the reader meets six pages rather than one
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
 * The opening and closing stops are not tour pages at all. `the-problem` is
 * absorbed into the landing page — it duplicated the old four-panel intro, and
 * the tour's entry point skipped past it anyway — and `what-must-change`
 * becomes the editorial close.
 */

export const LANDING_STOP_ID = "the-problem";
export const CLOSE_STOP_ID = "what-must-change";

export type PageSpec = {
  id: string;
  /** Mono, uppercase. Positional metadata. */
  eyebrow: string;
  /** Inter, Title Case. This is a destination, so it is never mono. */
  title: string;
  /** Which side the reading box sits on; the scene shifts the other way. */
  side: "left" | "right";
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
        groups: [
          {
            ids: ["explode", "stator", "rotor", "air-gap"],
            why: "The interactive Motor Inspector lets the reader explore all components, inspect their materials, and isolate each part in 3D directly on a single unified teardown stage.",
          },
        ],
      },
    ],
  },
  {
    id: "how-it-turns",
    eyebrow: "Page 02",
    title: "How It Turns",
    side: "right",
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
