import { useRef, useState } from "react";
import type { PuzzlePiece, PuzzlePieceGroup, PuzzlePiecePosition } from "../../types/puzzle";
import { createConnectedPieceGroups } from "../../utils/puzzleUtils";
import { DraggablePuzzlePieceGroup } from "./DraggablePuzzlePieceGroup";

type Props = {
  imageUrl: string;
  pieces: PuzzlePiece[];
  gridSize: number;
  isCompleted: boolean;
  onMovePiece: (activePieceId: string, destination: PuzzlePiecePosition) => void;
};

type DragState = {
  groupId: string;
  anchorPieceId: string;
  startClientX: number;
  startClientY: number;
  currentClientX: number;
  currentClientY: number;
  startMinRow: number;
  startMinCol: number;
  rowSpan: number;
  colSpan: number;
  boardWidth: number;
  boardHeight: number;
};

type DragVisualOffset = {
  x: number;
  y: number;
};

export function PuzzleBoard({
  imageUrl,
  pieces,
  gridSize,
  isCompleted,
  onMovePiece,
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const connectedGroups = createConnectedPieceGroups(pieces, gridSize);

  function handleStartDrag(
    group: PuzzlePieceGroup,
    clientX: number,
    clientY: number
  ) {
    const boardElement = boardRef.current;

    if (!boardElement) {
      return;
    }

    const boardRect = boardElement.getBoundingClientRect();

    const nextDragState: DragState = {
      groupId: group.id,
      anchorPieceId: group.anchorPieceId,
      startClientX: clientX,
      startClientY: clientY,
      currentClientX: clientX,
      currentClientY: clientY,
      startMinRow: group.minRow,
      startMinCol: group.minCol,
      rowSpan: group.rowSpan,
      colSpan: group.colSpan,
      boardWidth: boardRect.width,
      boardHeight: boardRect.height,
    };

    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function handleMoveDrag(clientX: number, clientY: number) {
    const currentDragState = dragStateRef.current;

    if (!currentDragState) {
      return;
    }

    const nextDragState = {
      ...currentDragState,
      currentClientX: clientX,
      currentClientY: clientY,
    };

    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }

  function handleEndDrag(clientX: number, clientY: number) {
    const currentDragState = dragStateRef.current;

    if (!currentDragState) {
      return;
    }

    const finishedDragState = {
      ...currentDragState,
      currentClientX: clientX,
      currentClientY: clientY,
    };

    const destination = calculateDestinationPosition(
      finishedDragState,
      gridSize
    );

    clearDragState();

    onMovePiece(finishedDragState.anchorPieceId, destination);
  }

  function handleCancelDrag() {
    clearDragState();
  }

  function clearDragState() {
    dragStateRef.current = null;
    setDragState(null);
  }

  function getDragVisualOffset(groupId: string): DragVisualOffset | null {
    if (!dragState || dragState.groupId !== groupId) {
      return null;
    }

    return {
      x: dragState.currentClientX - dragState.startClientX,
      y: dragState.currentClientY - dragState.startClientY,
    };
  }

  return (
    <div
      ref={boardRef}
      className={`relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-2xl bg-slate-300 ${
        isCompleted ? "" : "outline outline-4 outline-slate-300"
      }`}
    >
      {connectedGroups.map((group) => (
        <DraggablePuzzlePieceGroup
          key={group.id}
          group={group}
          imageUrl={imageUrl}
          gridSize={gridSize}
          isCompleted={isCompleted}
          dragVisualOffset={getDragVisualOffset(group.id)}
          onStartDrag={handleStartDrag}
          onMoveDrag={handleMoveDrag}
          onEndDrag={handleEndDrag}
          onCancelDrag={handleCancelDrag}
        />
      ))}
    </div>
  );
}

function calculateDestinationPosition(
  dragState: DragState,
  gridSize: number
): PuzzlePiecePosition {
  const cellWidth = dragState.boardWidth / gridSize;
  const cellHeight = dragState.boardHeight / gridSize;

  const movedCols = Math.round(
    (dragState.currentClientX - dragState.startClientX) / cellWidth
  );

  const movedRows = Math.round(
    (dragState.currentClientY - dragState.startClientY) / cellHeight
  );

  return {
    row: clampNumber(
      dragState.startMinRow + movedRows,
      0,
      gridSize - dragState.rowSpan
    ),
    col: clampNumber(
      dragState.startMinCol + movedCols,
      0,
      gridSize - dragState.colSpan
    ),
  };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
