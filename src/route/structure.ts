import { STOPS, type StageKind, type Stop, type StopState } from "./route";
import { frameKey } from "./presets";
import {
  CLOSE_STOP_ID,
  EMPHASIS,
  LANDING_STOP_ID,
  PAGES,
  type BeatGroup,
  type StopSpec,
} from "./pages";

/**
 * Turns the page table in pages.ts into the beats the shell walks, and refuses
 * to do it if the table would drop a state or merge two different pictures.
 */

export { CLOSE_STOP_ID, EMPHASIS, LANDING_STOP_ID, PAGES } from "./pages";
export type { BeatGroup, DeliberateMerge, PageSpec, StopSpec } from "./pages";

/* ------------------------------------------------------------------------ */

/** One beat: a picture, and everything the tour has to say while it is up. */
export type Beat = {
  id: string;
  label: string;
  /** One line per source state. Merged beats carry several. */
  lines: readonly string[];
  /** The concrete reader action, taken from the first source state. */
  action: string;
  /** Every state id folded into this beat, for guide lookup and deep links. */
  sourceIds: readonly string[];
  /**
   * The state whose frame this beat shows. The same as sourceIds[0] except
   * where a deliberate merge names a different one.
   */
  frameStateId: string;
  stage: StageKind;
  emphasis?: string;
};

export type PageStop = {
  id: string;
  title: string;
  question: string;
  /** The route.ts stop this came from, for claims and coverage. */
  sourceStopId: string;
  beats: readonly Beat[];
};

export type Page = {
  id: string;
  number: number;
  eyebrow: string;
  title: string;
  side: "left" | "right";
  stops: readonly PageStop[];
  /** Flat beat list for the page, which is what Back and Next walk. */
  beatCount: number;
};

const stopById = (id: string): Stop => {
  const found = STOPS.find((s) => s.id === id);
  if (!found) throw new Error(`structure.ts references unknown stop "${id}"`);
  return found;
};

const stateById = (stop: Stop, id: string): StopState => {
  const found = stop.states.find((s) => s.id === id);
  if (!found) throw new Error(`structure.ts references unknown state "${stop.id}/${id}"`);
  return found;
};

/**
 * Whether two states really drew the same frame. See presets.ts/frameKey for
 * what that includes — it is a good deal more than the stage.
 */
const sameFrame = (stop: Stop, a: StopState, b: StopState) =>
  frameKey(stop, a) === frameKey(stop, b);

/** Normalises either group form to ids plus the state that defines the frame. */
const readGroup = (group: BeatGroup) =>
  Array.isArray(group)
    ? { ids: group as readonly string[], frame: undefined, why: undefined }
    : {
        ids: (group as Exclude<BeatGroup, readonly string[]>).ids,
        frame: (group as Exclude<BeatGroup, readonly string[]>).frame,
        why: (group as Exclude<BeatGroup, readonly string[]>).why,
      };

const buildStop = (spec: StopSpec, source: Stop): PageStop => {
  const id = spec.id ?? source.id;
  const beats = spec.groups.map((rawGroup) => {
    const group = readGroup(rawGroup);
    const states = group.ids.map((stateId) => stateById(source, stateId));
    const frameState = group.frame ? stateById(source, group.frame) : states[0];
    const stage = frameState.stage ?? source.stage;

    // A plain group is only honest when every state in it drew the same frame.
    // If this throws, the group is a content decision rather than a
    // de-duplication: either give it its own beat, or say so with the
    // deliberate-merge form and record why.
    if (!group.why) {
      states.slice(1).forEach((other) => {
        if (!sameFrame(source, states[0], other)) {
          throw new Error(
            `Beat group [${group.ids.join(", ")}] in "${source.id}": "${other.id}" draws ` +
              `a different frame from "${states[0].id}". Merge only identical pictures — ` +
              `give it its own beat, or use the deliberate-merge form and say why.`,
          );
        }
      });
    }

    return {
      id: states[0].id,
      label: states[0].label,
      lines: states.map((s) => s.line),
      action: states[0].action,
      sourceIds: group.ids,
      frameStateId: frameState.id,
      stage,
      emphasis: EMPHASIS[`${id}/${states[0].id}`],
    } satisfies Beat;
  });

  return {
    id,
    title: spec.title ?? source.title,
    question: source.question,
    sourceStopId: source.id,
    beats,
  };
};

/** Every state of a stop must be placed exactly once across that stop's groups. */
const assertComplete = () => {
  const placed = new Map<string, string[]>();
  for (const page of PAGES) {
    for (const spec of page.stops) {
      const list = placed.get(spec.from) ?? [];
      list.push(...spec.groups.flatMap((g) => readGroup(g).ids));
      placed.set(spec.from, list);
    }
  }
  for (const stop of STOPS) {
    if (stop.id === LANDING_STOP_ID || stop.id === CLOSE_STOP_ID) continue;
    const seen = placed.get(stop.id) ?? [];
    const expected = stop.states.map((s) => s.id);
    const missing = expected.filter((id) => !seen.includes(id));
    const duplicated = seen.filter((id, i) => seen.indexOf(id) !== i);
    if (missing.length) {
      throw new Error(`Stop "${stop.id}" drops states: ${missing.join(", ")}. No content is cut.`);
    }
    if (duplicated.length) {
      throw new Error(`Stop "${stop.id}" repeats states: ${duplicated.join(", ")}.`);
    }
  }
};

export const buildPages = (): readonly Page[] => {
  assertComplete();
  return PAGES.map((spec, i) => {
    const stops = spec.stops.map((s) => buildStop(s, stopById(s.from)));
    return {
      id: spec.id,
      number: i + 1,
      eyebrow: spec.eyebrow,
      title: spec.title,
      side: spec.side,
      stops,
      beatCount: stops.reduce((n, s) => n + s.beats.length, 0),
    };
  });
};

export const PAGE_LIST = buildPages();

/** Flat list of every beat in tour order. Back and Next walk this. */
export const BEATS = PAGE_LIST.flatMap((page, pageIndex) =>
  page.stops.flatMap((stop, stopIndex) =>
    stop.beats.map((beat, beatIndex) => ({
      page,
      pageIndex,
      stop,
      stopIndex,
      beat,
      beatIndex,
    })),
  ),
);

export type Position = (typeof BEATS)[number];

export const landingStop = () => stopById(LANDING_STOP_ID);
export const closeStop = () => stopById(CLOSE_STOP_ID);
