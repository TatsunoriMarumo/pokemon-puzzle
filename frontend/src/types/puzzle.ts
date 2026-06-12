export const DIFFICULTIES = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type DifficultyConfig = {
    gridSize: number;
}

export type PuzzlePiece = {
  id: string;
  correctIndex: number;
  currentIndex: number;
  row: number;
  col: number;
  isBlank: boolean;
};
