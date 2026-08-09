import { CHAPTERS, getChapter } from "../content/chapters";
import type {
  Chapter,
  ChapterStep,
  StoryAction,
  StoryPosition,
  StoryState,
} from "../types";

export const firstPosition = (): StoryPosition => ({
  chapterId: CHAPTERS[0].id,
  stepId: CHAPTERS[0].steps[0].id,
});

export const createInitialStoryState = (
  position: StoryPosition = firstPosition(),
  systemReducedMotion = false,
): StoryState => ({
  position: isValidPosition(position) ? position : firstPosition(),
  stagePaused: false,
  systemReducedMotion,
  motionOverride: null,
});

export const isValidPosition = (position: StoryPosition) => {
  const chapter = getChapter(position.chapterId);
  return Boolean(chapter?.steps.some((step) => step.id === position.stepId));
};

export const getCurrentChapter = (state: StoryState): Chapter =>
  getChapter(state.position.chapterId) ?? CHAPTERS[0];

export const getCurrentStep = (state: StoryState): ChapterStep => {
  const chapter = getCurrentChapter(state);
  return chapter.steps.find((step) => step.id === state.position.stepId) ?? chapter.steps[0];
};

export const getFlatPositions = (): StoryPosition[] =>
  CHAPTERS.flatMap((chapter) =>
    chapter.steps.map((step) => ({ chapterId: chapter.id, stepId: step.id })),
  );

export const getReducedMotion = (state: StoryState) =>
  state.motionOverride ?? state.systemReducedMotion;

export const positionToHash = (position: StoryPosition) =>
  `#${position.chapterId}/${position.stepId}`;

export const hashToPosition = (hash: string): StoryPosition | null => {
  const [chapterId, stepId] = hash.replace(/^#/, "").split("/");
  const chapter = CHAPTERS.find((item) => item.id === chapterId);

  if (!chapter) return null;

  if (!stepId) {
    return { chapterId: chapter.id, stepId: chapter.steps[0].id };
  }

  return chapter.steps.some((step) => step.id === stepId)
    ? { chapterId: chapter.id, stepId }
    : null;
};

const getAdjacentPosition = (state: StoryState, direction: -1 | 1) => {
  const positions = getFlatPositions();
  const activeIndex = positions.findIndex(
    (position) =>
      position.chapterId === state.position.chapterId &&
      position.stepId === state.position.stepId,
  );
  const nextIndex = Math.max(0, Math.min(positions.length - 1, activeIndex + direction));
  return positions[nextIndex];
};

export const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
  switch (action.type) {
    case "go-to":
      return isValidPosition(action.position)
        ? { ...state, position: action.position }
        : state;
    case "go-to-chapter": {
      const chapter = getChapter(action.chapterId);
      return chapter
        ? {
            ...state,
            position: { chapterId: chapter.id, stepId: chapter.steps[0].id },
          }
        : state;
    }
    case "next":
      return { ...state, position: getAdjacentPosition(state, 1) };
    case "previous":
      return { ...state, position: getAdjacentPosition(state, -1) };
    case "toggle-stage-paused":
      return { ...state, stagePaused: !state.stagePaused };
    case "set-system-reduced-motion":
      return { ...state, systemReducedMotion: action.reduced };
    case "toggle-motion-override":
      return {
        ...state,
        motionOverride: !(state.motionOverride ?? state.systemReducedMotion),
      };
    default:
      return state;
  }
};
