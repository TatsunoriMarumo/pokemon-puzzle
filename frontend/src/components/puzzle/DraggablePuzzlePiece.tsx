import { useDraggable, useDroppable } from "@dnd-kit/react";
import type { PuzzlePiece } from "../../types/puzzle";
import { PuzzlePieceView } from "./PuzzlePiece";

type Props = {
  piece: PuzzlePiece;
  imageUrl: string;
  gridSize: number;
  isCompleted: boolean;
};

export function DraggablePuzzlePiece({
  piece,
  imageUrl,
  gridSize,
  isCompleted,
}: Props) {
  const { ref: draggableRef, isDragging } = useDraggable({
    id: piece.id,
    disabled: isCompleted,
  });

  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: piece.id,
    disabled: isCompleted,
  });

  return (
    <div
      ref={droppableRef}
      className={`aspect-square ${
        isDropTarget && !isCompleted ? "ring-2 ring-yellow-300" : ""
      }`}
    >
      <div
        ref={draggableRef}
        className={
          isCompleted
            ? "cursor-default"
            : "cursor-grab touch-none active:cursor-grabbing"
        }
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <PuzzlePieceView
          piece={piece}
          imageUrl={imageUrl}
          gridSize={gridSize}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}
