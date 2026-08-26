/**
 * The original visualisation failed not because the research was thin but
 * because the visible copy hedged: "The controls are qualitative. The important
 * idea is the combined stress." That sentence names no mechanism and tells the
 * reader nothing they can act on.
 *
 * This lint is the guard. It runs over every line the tour puts on screen, and
 * it fails the test suite rather than a review.
 */

export type CopyIssue = {
  code: "hedge" | "filler" | "empty-instruction" | "bare-number" | "too-long";
  path: string;
  message: string;
};

/**
 * Constructions that announce significance instead of stating a mechanism.
 * Matched case-insensitively as whole phrases.
 */
const HEDGES = [
  "the important idea",
  "the key thing",
  "the key idea",
  "it is worth noting",
  "worth noting",
  "it should be noted",
  "in essence",
  "essentially",
  "basically",
  "fundamentally",
  "at its core",
  "simply put",
  "in other words",
  "arguably",
  "somewhat",
  "quite simply",
  "the controls are qualitative",
  "this is a teaching model",
  "kind of",
  "sort of",
  "a bit of a",
  "revolutionary",
  "game-changing",
  "cutting-edge",
  "state-of-the-art",
  "seamless",
  "robust solution",
  "leverage",
  "unlock",
  "delve",
];

/** Instructions that ask the reader to read rather than to do something. */
const EMPTY_INSTRUCTIONS = ["read more", "learn more", "find out more", "explore more", "click here"];

/**
 * A number that appears with no unit and no condition attached is how "102 kW"
 * ends up reading as parity with a 110 kW baseline. This grabs whole numeric
 * tokens — commas and decimals included — so it cannot report a fragment of a
 * figure that is in fact correctly qualified.
 */
const NUMBER_TOKEN = /(?<![\w.,])\d(?:[\d,]*\d)?(?:\.\d+)?(?![\d,.])/g;

/** Units and qualifiers that count as a condition following the figure. */
const UNIT_AFTER =
  /^\s*(?:%|°\s*C|°|kW|kWh|Nm|rpm|MGOe|Oe|T\b|G\b|kg|g\b|mm|cm|km|nm|µm|um|V\b|A\b|Hz|units?\b)/;

/** Ranges: the condition may sit after the far end of the range. */
const RANGE_AFTER = /^\s*(?:–|—|-|to)\s*\d/;

/** Contexts where a bare integer is an identifier, not a quantity. */
const IDENTIFIER_BEFORE = /(?:no\.|number|announcement|section|stop|act|figure|gen(?:eration)?|i)\s*$/i;

const isYear = (value: string) => /^(19|20)\d{2}$/.test(value);

function lintNumbers(text: string, path: string): CopyIssue[] {
  const issues: CopyIssue[] = [];

  for (const match of text.matchAll(NUMBER_TOKEN)) {
    const value = match[0];
    const index = match.index ?? 0;
    const before = text.slice(Math.max(0, index - 16), index);
    const after = text.slice(index + value.length);

    if (isYear(value)) continue;
    // Small counts read as counts, not measurements: "three groups", "1 of 5".
    if (Number(value.replace(/,/g, "")) <= 10 && !value.includes(".")) continue;
    if (IDENTIFIER_BEFORE.test(before)) continue;
    if (UNIT_AFTER.test(after)) continue;
    // A range carries its unit at the far end: "150–180 °C", "1–4% Dy".
    if (RANGE_AFTER.test(after)) continue;
    // A figure immediately introduced by a named quantity is already qualified:
    // "magnetic hardness of 1.54", "coercivity ceiling of 4,000–5,000 Oe".
    if (/\b(?:of|at|around|about|roughly|over|under|above|below)\s*$/i.test(before)) continue;

    issues.push({
      code: "bare-number",
      path,
      message: `"${value}" appears with no unit or condition. A figure without its condition misleads.`,
    });
  }

  return issues;
}

export function lintCopyLine(text: string, path: string): CopyIssue[] {
  const issues: CopyIssue[] = [];
  const lower = text.toLowerCase();

  for (const hedge of HEDGES) {
    if (lower.includes(hedge)) {
      issues.push({
        code: "hedge",
        path,
        message: `Hedge or filler phrase "${hedge}". State the mechanism instead.`,
      });
    }
  }

  for (const empty of EMPTY_INSTRUCTIONS) {
    if (lower.includes(empty)) {
      issues.push({
        code: "empty-instruction",
        path,
        message: `"${empty}" is not a reader action. Name what they manipulate.`,
      });
    }
  }

  issues.push(...lintNumbers(text, path));

  if (text.length > 320) {
    issues.push({
      code: "too-long",
      path,
      message: `On-stage line is ${text.length} characters. Keep it under 320 so it coexists with the visual.`,
    });
  }

  return issues;
}

/** Lint every visible string in the route. */
export function lintRoute(
  stops: readonly {
    id: string;
    title: string;
    question: string;
    states: readonly { id: string; label: string; line: string; action: string }[];
  }[],
): CopyIssue[] {
  const issues: CopyIssue[] = [];
  for (const stop of stops) {
    issues.push(...lintCopyLine(stop.title, `${stop.id}.title`));
    issues.push(...lintCopyLine(stop.question, `${stop.id}.question`));
    for (const state of stop.states) {
      issues.push(...lintCopyLine(state.label, `${stop.id}.${state.id}.label`));
      issues.push(...lintCopyLine(state.line, `${stop.id}.${state.id}.line`));
      issues.push(...lintCopyLine(state.action, `${stop.id}.${state.id}.action`));
    }
  }
  return issues;
}
