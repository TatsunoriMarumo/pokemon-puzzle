import type { PuzzlePiece } from "../types/puzzle";
import { isPuzzleCompleted, swapPieces } from "../utils/puzzleUtils";

export type PuzzleBoardState = {
  pieces: PuzzlePiece[];
  isCompleted: boolean;
};

export type PuzzleBoardAction =
  | {
      type: "replacePieces";
      pieces: PuzzlePiece[];
    }
  | {
      type: "movePiece";
      activeId: string;
      overId: string;
    };

export const INITIAL_PUZZLE_BOARD_STATE: PuzzleBoardState = {
  pieces: [],
  isCompleted: false,
};

export function movePuzzlePiece(
  state: PuzzleBoardState,
  activeId: string,
  overId: string
): PuzzleBoardState {
  if (state.isCompleted) {
    return state;
  }

  const nextPieces = swapPieces(state.pieces, activeId, overId);

  return {
    pieces: nextPieces,
    isCompleted: isPuzzleCompleted(nextPieces),
  };
}

export function puzzleBoardReducer(
  state: PuzzleBoardState,
  action: PuzzleBoardAction
): PuzzleBoardState {
  switch (action.type) {
    case "replacePieces":
      return {
        pieces: action.pieces,
        isCompleted: false,
      };

    case "movePiece":
      return movePuzzlePiece(state, action.activeId, action.overId);

    default:
      return state;
  }
}
