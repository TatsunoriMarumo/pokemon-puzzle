import type { PuzzlePiece } from "../../types/puzzle";

type Props = {
  piece: PuzzlePiece;
  imageUrl: string;
  gridSize: number;
  isCompleted: boolean;
};

export function PuzzlePieceView({
  piece,
  imageUrl,
  gridSize,
  isCompleted,
}: Props) {
  const x = gridSize === 1 ? 0 : (piece.col / (gridSize - 1)) * 100;
  const y = gridSize === 1 ? 0 : (piece.row / (gridSize - 1)) * 100;

  return (
    <div
      className={`aspect-square bg-no-repeat ${
        isCompleted ? "border-0" : "border border-white"
      }`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
      }}
    />
  );
}
