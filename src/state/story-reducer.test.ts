import { describe, expect, it } from "vitest";
import { pmsmContent } from "../content";
import { evidenceCaveat, resolveEvidenceClaims } from "../story/evidence";
import { CHAPTERS, validateStoryRegistry } from "../story/storyRegistry";
import {
  createInitialStoryState,
  firstPosition,
  getCurrentStep,
  getFlatPositions,
  hashToPosition,
  positionToHash,
  storyReducer,
} from "./story-reducer";

describe("story reducer", () => {
  it("binds only main-path content into the default route", () => {
    expect(() => validateStoryRegistry()).not.toThrow();
    expect(CHAPTERS).toHaveLength(8);
    expect(CHAPTERS.flatMap((chapter) => chapter.steps)).toHaveLength(31);
    expect(CHAPTERS.flatMap((chapter) => chapter.steps).every((step) => step.content.placement === "main")).toBe(true);
  });

  it("keeps the opening chapter to four simple visual states", () => {
    expect(CHAPTERS[0].steps.map((step) => step.id)).toEqual([
      "car-transparent-cutaway",
      "power-path-flow",
      "drive-unit-extract",
      "motor-isolation",
    ]);
  });

  it("keeps every main step visually actionable, with a visible consequence and fallback", () => {
    for (const step of CHAPTERS.flatMap((chapter) => chapter.steps)) {
      expect(step.visualState.mode).toBeTruthy();
      expect(step.visualState.primaryAction).toBe(step.content.visual.interaction);
      expect(step.visualState.visualChange).toBe(step.content.visual.visibleConsequence);
      expect(step.content.visual.fallback).toBeTruthy();
      expect(step.content.reducedMotionState).toBeTruthy();
    }
  });

  it("keeps hidden claims out of the evidence surface and resolves qualified claims", () => {
    const defaultClaimIds = CHAPTERS.flatMap((chapter) => chapter.steps.flatMap((step) => step.content.claimIds));
    const resolved = resolveEvidenceClaims(defaultClaimIds);

    expect(resolved.every(({ claim }) => claim.renderingPolicy !== "hide")).toBe(true);

    const qualified = resolved.filter(({ claim }) => claim.renderingPolicy === "show-with-condition");
    expect(qualified.length).toBeGreaterThan(0);
    for (const { claim, sources } of qualified) {
      expect(evidenceCaveat(claim)).toBeTruthy();
      expect(sources.length).toBe(claim.sourceIds.length);
      expect(sources.every((source) => source.url || source.sourceType === "due-diligence")).toBe(true);
    }

    const hiddenIds = new Set(
      pmsmContent.claims.filter((claim) => claim.renderingPolicy === "hide").map((claim) => claim.id),
    );
    expect(resolved.some(({ claim }) => hiddenIds.has(claim.id))).toBe(false);

    const heatStep = pmsmContent.chapters
      .find((chapter) => chapter.id === "why-the-magnet-needs-nd-dy-tb")
      ?.steps.find((step) => step.id === "heat-demagnetisation");
    expect(resolveEvidenceClaims(heatStep?.claimIds ?? [])).toEqual([]);
    expect(heatStep?.copy.evidence).toBe("Relative heat and reversal margin only; no universal threshold shown.");
  });

  it("covers every configured chapter step through next navigation", () => {
    let state = createInitialStoryState();
    const visited = [state.position];

    for (let index = 1; index < getFlatPositions().length; index += 1) {
      state = storyReducer(state, { type: "next" });
      visited.push(state.position);
    }

    expect(visited).toEqual(getFlatPositions());
    expect(getCurrentStep(state).id).toBe(CHAPTERS.at(-1)?.steps.at(-1)?.id);
  });

  it("does not move before the first or after the last step", () => {
    let state = createInitialStoryState(firstPosition());
    state = storyReducer(state, { type: "previous" });
    expect(state.position).toEqual(firstPosition());

    const lastPosition = getFlatPositions().at(-1);
    state = createInitialStoryState(lastPosition);
    state = storyReducer(state, { type: "next" });
    expect(state.position).toEqual(lastPosition);
  });

  it("round-trips valid hash deep links and rejects invalid routes", () => {
    const position = getFlatPositions()[5];
    expect(hashToPosition(positionToHash(position))).toEqual(position);
    expect(hashToPosition("#not-a-chapter/not-a-step")).toBeNull();
  });

  it("opens a selected chapter at its first main step", () => {
    const chapter = CHAPTERS[4];
    const state = storyReducer(createInitialStoryState(), {
      type: "go-to-chapter",
      chapterId: chapter.id,
    });

    expect(state.position).toEqual({
      chapterId: chapter.id,
      stepId: chapter.steps[0].id,
    });
  });

  it("keeps physical scene motion in a single pause state", () => {
    const initial = createInitialStoryState();
    const paused = storyReducer(initial, { type: "toggle-stage-paused" });
    const resumed = storyReducer(paused, { type: "toggle-stage-paused" });

    expect(paused.stagePaused).toBe(true);
    expect(resumed.stagePaused).toBe(false);
  });
});
