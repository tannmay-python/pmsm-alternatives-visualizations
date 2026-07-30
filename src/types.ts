export type AlternativeKey = "pmsm" | "wound" | "induction" | "synrm" | "srm";

export type StorySignal = {
  progress: number;
  activeChapter: number;
  reducedMotion: boolean;
  fieldPaused: boolean;
  load: number;
  alternative: AlternativeKey;
};

export type Alternative = {
  key: AlternativeKey;
  shortName: string;
  name: string;
  principle: string;
  magnet: string;
  strength: string;
  cost: string;
  evidence: string;
};
