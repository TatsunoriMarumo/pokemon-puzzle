import type { CSSProperties, PointerEvent } from "react";
import type { PuzzlePiece, PuzzlePieceGroup } from "../../types/puzzle";
import {
  getPuzzlePieceBorderVisibility,
  getPuzzlePiecePosition,
} from "../../utils/puzzleUtils";
import { PuzzlePieceView } from "./PuzzlePiece";

type DragVisualOffset = {
  x: number;
  y: number;
};

type Props = {
  group: PuzzlePieceGroup;
  imageUrl: string;
  gridSize: number;
  isCompleted: boolean;
  dragVisualOffset: DragVisualOffset | null;
  onStartDrag: (group: PuzzlePieceGroup, clientX: number, clientY: number) => void;
  onMoveDrag: (clientX: number, clientY: number) => void;
  onEndDrag: (clientX: number, clientY: number) => void;
  onCancelDrag: () => void;
};

export function DraggablePuzzlePieceGroup({
  group,
  imageUrl,
  gridSize,
  isCompleted,
  dragVisualOffset,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onCancelDrag,
}: Props) {
  const cellSize = 100 / gridSize;

  const groupStyle: CSSProperties = {
    top: `${group.minRow * cellSize}%`,
    left: `${group.minCol * cellSize}%`,
    width: `${group.colSpan * cellSize}%`,
    height: `${group.rowSpan * cellSize}%`,
    transform:
      dragVisualOffset === null
        ? undefined
        : `translate(${dragVisualOffset.x}px, ${dragVisualOffset.y}px)`,
    zIndex: dragVisualOffset === null ? 1 : 20,
  };

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (isCompleted || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onStartDrag(group, event.clientX, event.clientY);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragVisualOffset === null) {
      return;
    }

    event.preventDefault();
    onMoveDrag(event.clientX, event.clientY);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragVisualOffset === null) {
      return;
    }

    event.preventDefault();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onEndDrag(event.clientX, event.clientY);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onCancelDrag();
  }

  return (
    <div
      className="pointer-events-none absolute"
      style={groupStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="pointer-events-none grid h-full w-full"
        style={{
          gridTemplateColumns: `repeat(${group.colSpan}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${group.rowSpan}, minmax(0, 1fr))`,
        }}
      >
        {group.pieces.map((piece) => (
          <PuzzlePieceCell
            key={piece.id}
            piece={piece}
            group={group}
            imageUrl={imageUrl}
            gridSize={gridSize}
            isCompleted={isCompleted}
          />
        ))}
      </div>
    </div>
  );
}

type PuzzlePieceCellProps = {
  piece: PuzzlePiece;
  group: PuzzlePieceGroup;
  imageUrl: string;
  gridSize: number;
  isCompleted: boolean;
};

function PuzzlePieceCell({
  piece,
  group,
  imageUrl,
  gridSize,
  isCompleted,
}: PuzzlePieceCellProps) {
  const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);
  const borderVisibility = getPuzzlePieceBorderVisibility(
    piece,
    group.pieces,
    gridSize
  );

  return (
    <div
      className={
        isCompleted
          ? "pointer-events-none min-h-0 min-w-0"
          : "pointer-events-auto min-h-0 min-w-0 cursor-grab touch-none select-none active:cursor-grabbing"
      }
      style={{
        gridRowStart: position.row - group.minRow + 1,
        gridColumnStart: position.col - group.minCol + 1,
      }}
    >
      <PuzzlePieceView
        piece={piece}
        imageUrl={imageUrl}
        gridSize={gridSize}
        isCompleted={isCompleted}
        borderVisibility={borderVisibility}
      />
    </div>
  );
}
