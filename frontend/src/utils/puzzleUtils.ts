import type { PuzzlePiece } from "../types/puzzle";

export function shufflePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  const shuffledPieces = [...pieces];

  for (let index = shuffledPieces.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffledPieces[index], shuffledPieces[randomIndex]] = [
      shuffledPieces[randomIndex],
      shuffledPieces[index],
    ];
  }

  return shuffledPieces.map((piece, index) => ({
    ...piece,
    currentIndex: index,
  }));
}

export function swapPieces(
  pieces: PuzzlePiece[],
  activeId: string,
  overId: string
): PuzzlePiece[] {
  const activePiece = pieces.find((piece) => piece.id === activeId);
  const overPiece = pieces.find((piece) => piece.id === overId);

  if (!activePiece || !overPiece) {
    return pieces;
  }

  return pieces.map((piece) => {
    if (piece.id === activePiece.id) {
      return {
        ...piece,
        currentIndex: overPiece.currentIndex,
      };
    }

    if (piece.id === overPiece.id) {
      return {
        ...piece,
        currentIndex: activePiece.currentIndex,
      };
    }

    return piece;
  });
}

export function isPuzzleCompleted(pieces: PuzzlePiece[]): boolean {
  const correctPiecesByIndex = new Map<number, PuzzlePiece>();

  pieces.forEach((piece) => {
    correctPiecesByIndex.set(piece.correctIndex, piece);
  });

  return pieces.every((piece) => {
    if (piece.currentIndex === piece.correctIndex) {
      return true;
    }

    const correctPieceForCurrentPosition = correctPiecesByIndex.get(
      piece.currentIndex
    );

    if (!correctPieceForCurrentPosition) {
      return false;
    }

    return piece.isBlank && correctPieceForCurrentPosition.isBlank;
  });
}
