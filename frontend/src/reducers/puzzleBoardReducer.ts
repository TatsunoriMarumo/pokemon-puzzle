import type { PuzzlePiece, PuzzlePiecePosition } from "../types/puzzle";
import {
  isPuzzleCompleted,
  moveConnectedPuzzleGroupToPosition,
} from "../utils/puzzleUtils";

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
      type: "movePieceGroup";
      activePieceId: string;
      destination: PuzzlePiecePosition;
    };

export const INITIAL_PUZZLE_BOARD_STATE: PuzzleBoardState = {
  pieces: [],
  isCompleted: false,
};

export function movePuzzlePieceGroup(
  state: PuzzleBoardState,
  activePieceId: string,
  destination: PuzzlePiecePosition
): PuzzleBoardState {
  if (state.isCompleted) {
    return state;
  }

  const nextPieces = moveConnectedPuzzleGroupToPosition(
    state.pieces,
    activePieceId,
    destination
  );

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

    case "movePieceGroup":
      return movePuzzlePieceGroup(
        state,
        action.activePieceId,
        action.destination
      );

    default:
      return state;
  }
}
