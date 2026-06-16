import type { CSSProperties } from "react";
import type { PieceBorderVisibility, PuzzlePiece } from "../../types/puzzle";

type Props = {
  piece: PuzzlePiece;
  imageUrl: string;
  gridSize: number;
  isCompleted: boolean;
  borderVisibility?: PieceBorderVisibility;
};

export function PuzzlePieceView({
  piece,
  imageUrl,
  gridSize,
  isCompleted,
  borderVisibility,
}: Props) {
  const x = gridSize === 1 ? 0 : (piece.col / (gridSize - 1)) * 100;
  const y = gridSize === 1 ? 0 : (piece.row / (gridSize - 1)) * 100;

  const borderStyle: CSSProperties = isCompleted
    ? {}
    : {
        borderTop:
          borderVisibility?.top === false ? "0" : "1px solid white",
        borderRight:
          borderVisibility?.right === false ? "0" : "1px solid white",
        borderBottom:
          borderVisibility?.bottom === false ? "0" : "1px solid white",
        borderLeft:
          borderVisibility?.left === false ? "0" : "1px solid white",
      };

  return (
    <div
      className="h-full w-full bg-no-repeat"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
        ...borderStyle,
      }}
    />
  );
}
