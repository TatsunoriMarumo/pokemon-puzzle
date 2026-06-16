export const DIFFICULTIES = ["easy", "normal", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export type DifficultyConfig = {
  gridSize: number;
};

export type PuzzlePiece = {
  id: string;
  correctIndex: number;
  currentIndex: number;
  row: number;
  col: number;
  isBlank: boolean;
};

export type PuzzlePiecePosition = {
  row: number;
  col: number;
};

export type PuzzlePieceGroup = {
  id: string;
  anchorPieceId: string;
  pieceIds: string[];
  pieces: PuzzlePiece[];
  minRow: number;
  minCol: number;
  rowSpan: number;
  colSpan: number;
};

export type PieceBorderVisibility = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};
