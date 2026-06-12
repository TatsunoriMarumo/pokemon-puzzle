import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import type { PuzzlePiece } from "../../types/puzzle";
import { DraggablePuzzlePiece } from "./DraggablePuzzlePiece";

type Props = {
  imageUrl: string;
  pieces: PuzzlePiece[];
  gridSize: number;
  isCompleted: boolean;
  onMovePiece: (activeId: string, overId: string) => void;
};

export function PuzzleBoard({
  imageUrl,
  pieces,
  gridSize,
  isCompleted,
  onMovePiece,
}: Props) {
  const sortedPieces = [...pieces].sort(
    (a, b) => a.currentIndex - b.currentIndex
  );

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      return;
    }

    const { source, target } = event.operation;

    if (!source || !target) {
      return;
    }

    const activeId = String(source.id);
    const overId = String(target.id);

    if (activeId === overId) {
      return;
    }

    onMovePiece(activeId, overId);
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div
        className={`mx-auto grid aspect-square w-full max-w-xl overflow-hidden rounded-2xl bg-slate-300 ${isCompleted ? "gap-0" : "gap-1 p-1"
          }`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {sortedPieces.map((piece) => (
          <DraggablePuzzlePiece
            key={piece.id}
            piece={piece}
            imageUrl={imageUrl}
            gridSize={gridSize}
            isCompleted={isCompleted}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
