import { describe, expect, it } from "vitest";
import { CHAPTERS, validateVisualContract } from "../content/chapters";
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
  it("requires a concrete visual state for every narrative step", () => {
    expect(() => validateVisualContract()).not.toThrow();
    expect(CHAPTERS.flatMap((chapter) => chapter.steps)).toHaveLength(27);
  });

  it("keeps the opening chapter to four simple visual states", () => {
    expect(CHAPTERS[0].steps.map((step) => step.id)).toEqual([
      "motor-locations",
      "power-path",
      "extract-and-open-unit",
      "isolate-the-motor",
    ]);
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

  it("opens a selected chapter at its first step", () => {
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
