import type {
  PieceBorderVisibility,
  PuzzlePiece,
  PuzzlePieceGroup,
  PuzzlePiecePosition,
} from "../types/puzzle";

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

  if (activePiece.id === overPiece.id) {
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

export function moveConnectedPuzzleGroupToPosition(
  pieces: PuzzlePiece[],
  activePieceId: string,
  destination: PuzzlePiecePosition
): PuzzlePiece[] {
  const gridSize = getPuzzleGridSize(pieces);
  const groups = createConnectedPieceGroups(pieces, gridSize);

  const activeGroup = groups.find((group) =>
    group.pieceIds.includes(activePieceId)
  );

  if (!activeGroup) {
    return pieces;
  }

  if (activeGroup.pieces.length === 1) {
    return moveSinglePuzzlePieceToPosition(
      pieces,
      activePieceId,
      destination,
      gridSize
    );
  }

  const safeDestination = clampGroupDestination(
    destination,
    activeGroup,
    gridSize
  );

  if (
    activeGroup.minRow === safeDestination.row &&
    activeGroup.minCol === safeDestination.col
  ) {
    return pieces;
  }

  const rowOffset = safeDestination.row - activeGroup.minRow;
  const colOffset = safeDestination.col - activeGroup.minCol;

  const destinationIndexByActivePieceId = buildDestinationIndexMap(
    activeGroup,
    rowOffset,
    colOffset,
    gridSize
  );

  if (!destinationIndexByActivePieceId) {
    return pieces;
  }

  const activePieceIds = new Set(activeGroup.pieceIds);
  const sourceIndices = new Set(
    activeGroup.pieces.map((piece) => piece.currentIndex)
  );

  const destinationIndices = new Set(destinationIndexByActivePieceId.values());

  const displacedPieces = getDisplacedPieces(
    pieces,
    activePieceIds,
    destinationIndices
  );

  const vacatedSourceIndices = getVacatedSourceIndices(
    sourceIndices,
    destinationIndices
  );

  const preservedGroupMove = tryMoveDisplacedGroupWithoutBreaking({
    pieces,
    groups,
    activeGroup,
    displacedPieces,
    vacatedSourceIndices,
    rowOffset,
    colOffset,
    destinationIndexByActivePieceId,
    gridSize,
  });

  if (preservedGroupMove) {
    return preservedGroupMove;
  }

  return moveActiveGroupWithPriority({
    pieces,
    activePieceIds,
    displacedPieces,
    vacatedSourceIndices,
    destinationIndexByActivePieceId,
  });
}

export function createConnectedPieceGroups(
  pieces: PuzzlePiece[],
  gridSize: number
): PuzzlePieceGroup[] {
  const visitedPieceIds = new Set<string>();
  const groups: PuzzlePieceGroup[] = [];

  for (const piece of pieces) {
    if (visitedPieceIds.has(piece.id)) {
      continue;
    }

    const groupPieces: PuzzlePiece[] = [];
    const stack: PuzzlePiece[] = [piece];

    visitedPieceIds.add(piece.id);

    while (stack.length > 0) {
      const currentPiece = stack.pop();

      if (!currentPiece) {
        continue;
      }

      groupPieces.push(currentPiece);

      for (const candidatePiece of pieces) {
        if (visitedPieceIds.has(candidatePiece.id)) {
          continue;
        }

        if (
          areCorrectNeighborsInCurrentBoard(
            currentPiece,
            candidatePiece,
            gridSize
          )
        ) {
          visitedPieceIds.add(candidatePiece.id);
          stack.push(candidatePiece);
        }
      }
    }

    const sortedGroupPieces = [...groupPieces].sort(
      (a, b) => a.currentIndex - b.currentIndex
    );

    groups.push(createPuzzlePieceGroup(sortedGroupPieces, gridSize));
  }

  return groups;
}

export function getPuzzlePieceBorderVisibility(
  piece: PuzzlePiece,
  groupPieces: PuzzlePiece[],
  gridSize: number
): PieceBorderVisibility {
  const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);

  return {
    top: !hasGroupPieceAt(groupPieces, position.row - 1, position.col, gridSize),
    right: !hasGroupPieceAt(
      groupPieces,
      position.row,
      position.col + 1,
      gridSize
    ),
    bottom: !hasGroupPieceAt(
      groupPieces,
      position.row + 1,
      position.col,
      gridSize
    ),
    left: !hasGroupPieceAt(
      groupPieces,
      position.row,
      position.col - 1,
      gridSize
    ),
  };
}

export function getPuzzlePiecePosition(
  index: number,
  gridSize: number
): PuzzlePiecePosition {
  return {
    row: Math.floor(index / gridSize),
    col: index % gridSize,
  };
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

function moveSinglePuzzlePieceToPosition(
  pieces: PuzzlePiece[],
  activePieceId: string,
  destination: PuzzlePiecePosition,
  gridSize: number
): PuzzlePiece[] {
  const activePiece = pieces.find((piece) => piece.id === activePieceId);

  if (!activePiece) {
    return pieces;
  }

  const safeDestination = {
    row: clampNumber(destination.row, 0, gridSize - 1),
    col: clampNumber(destination.col, 0, gridSize - 1),
  };

  const destinationIndex = toPuzzleIndex(
    safeDestination.row,
    safeDestination.col,
    gridSize
  );

  if (activePiece.currentIndex === destinationIndex) {
    return pieces;
  }

  const destinationPiece = pieces.find(
    (piece) => piece.currentIndex === destinationIndex
  );

  if (!destinationPiece) {
    return pieces;
  }

  return swapPieces(pieces, activePiece.id, destinationPiece.id);
}

function buildDestinationIndexMap(
  activeGroup: PuzzlePieceGroup,
  rowOffset: number,
  colOffset: number,
  gridSize: number
): Map<string, number> | null {
  const destinationIndexByActivePieceId = new Map<string, number>();

  for (const piece of activeGroup.pieces) {
    const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);
    const nextRow = position.row + rowOffset;
    const nextCol = position.col + colOffset;

    if (!isInsideGrid(nextRow, nextCol, gridSize)) {
      return null;
    }

    destinationIndexByActivePieceId.set(
      piece.id,
      toPuzzleIndex(nextRow, nextCol, gridSize)
    );
  }

  return destinationIndexByActivePieceId;
}

function getDisplacedPieces(
  pieces: PuzzlePiece[],
  activePieceIds: Set<string>,
  destinationIndices: Set<number>
): PuzzlePiece[] {
  return pieces
    .filter(
      (piece) =>
        !activePieceIds.has(piece.id) &&
        destinationIndices.has(piece.currentIndex)
    )
    .sort((a, b) => a.currentIndex - b.currentIndex);
}

function getVacatedSourceIndices(
  sourceIndices: Set<number>,
  destinationIndices: Set<number>
): number[] {
  return [...sourceIndices]
    .filter((index) => !destinationIndices.has(index))
    .sort((a, b) => a - b);
}

type TryMoveDisplacedGroupWithoutBreakingParams = {
  pieces: PuzzlePiece[];
  groups: PuzzlePieceGroup[];
  activeGroup: PuzzlePieceGroup;
  displacedPieces: PuzzlePiece[];
  vacatedSourceIndices: number[];
  rowOffset: number;
  colOffset: number;
  destinationIndexByActivePieceId: Map<string, number>;
  gridSize: number;
};

function tryMoveDisplacedGroupWithoutBreaking({
  pieces,
  groups,
  activeGroup,
  displacedPieces,
  vacatedSourceIndices,
  rowOffset,
  colOffset,
  destinationIndexByActivePieceId,
  gridSize,
}: TryMoveDisplacedGroupWithoutBreakingParams): PuzzlePiece[] | null {
  if (displacedPieces.length === 0) {
    return moveActiveGroupOnly(
      pieces,
      new Set(activeGroup.pieceIds),
      destinationIndexByActivePieceId
    );
  }

  const displacedPieceIds = new Set(displacedPieces.map((piece) => piece.id));

  const displacedGroup = groups.find((group) =>
    group.pieceIds.some((pieceId) => displacedPieceIds.has(pieceId))
  );

  if (!displacedGroup) {
    return null;
  }

  const isWholeGroupDisplaced =
    displacedGroup.pieces.length === displacedPieces.length &&
    displacedGroup.pieces.every((piece) => displacedPieceIds.has(piece.id));

  if (!isWholeGroupDisplaced) {
    return null;
  }

  const displacedDestinationIndices = getTranslatedIndices(
    displacedGroup.pieces,
    -rowOffset,
    -colOffset,
    gridSize
  );

  if (!displacedDestinationIndices) {
    return null;
  }

  const vacatedSourceIndexSet = new Set(vacatedSourceIndices);

  const canDisplacedGroupMoveToVacatedCells =
    displacedDestinationIndices.length === vacatedSourceIndexSet.size &&
    displacedDestinationIndices.every((index) =>
      vacatedSourceIndexSet.has(index)
    );

  if (!canDisplacedGroupMoveToVacatedCells) {
    return null;
  }

  const activePieceIds = new Set(activeGroup.pieceIds);
  const displacedGroupPieceIds = new Set(displacedGroup.pieceIds);

  return pieces.map((piece) => {
    if (activePieceIds.has(piece.id)) {
      const nextIndex = destinationIndexByActivePieceId.get(piece.id);

      if (nextIndex === undefined) {
        return piece;
      }

      return {
        ...piece,
        currentIndex: nextIndex,
      };
    }

    if (displacedGroupPieceIds.has(piece.id)) {
      const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);

      return {
        ...piece,
        currentIndex: toPuzzleIndex(
          position.row - rowOffset,
          position.col - colOffset,
          gridSize
        ),
      };
    }

    return piece;
  });
}

type MoveActiveGroupWithPriorityParams = {
  pieces: PuzzlePiece[];
  activePieceIds: Set<string>;
  displacedPieces: PuzzlePiece[];
  vacatedSourceIndices: number[];
  destinationIndexByActivePieceId: Map<string, number>;
};

function moveActiveGroupWithPriority({
  pieces,
  activePieceIds,
  displacedPieces,
  vacatedSourceIndices,
  destinationIndexByActivePieceId,
}: MoveActiveGroupWithPriorityParams): PuzzlePiece[] {
  if (displacedPieces.length !== vacatedSourceIndices.length) {
    return pieces;
  }

  const nextIndexByDisplacedPieceId = new Map<string, number>();

  displacedPieces.forEach((piece, index) => {
    const nextIndex = vacatedSourceIndices[index];

    if (nextIndex !== undefined) {
      nextIndexByDisplacedPieceId.set(piece.id, nextIndex);
    }
  });

  return pieces.map((piece) => {
    if (activePieceIds.has(piece.id)) {
      const nextIndex = destinationIndexByActivePieceId.get(piece.id);

      if (nextIndex === undefined) {
        return piece;
      }

      return {
        ...piece,
        currentIndex: nextIndex,
      };
    }

    const displacedNextIndex = nextIndexByDisplacedPieceId.get(piece.id);

    if (displacedNextIndex !== undefined) {
      return {
        ...piece,
        currentIndex: displacedNextIndex,
      };
    }

    return piece;
  });
}

function moveActiveGroupOnly(
  pieces: PuzzlePiece[],
  activePieceIds: Set<string>,
  destinationIndexByActivePieceId: Map<string, number>
): PuzzlePiece[] {
  return pieces.map((piece) => {
    if (!activePieceIds.has(piece.id)) {
      return piece;
    }

    const nextIndex = destinationIndexByActivePieceId.get(piece.id);

    if (nextIndex === undefined) {
      return piece;
    }

    return {
      ...piece,
      currentIndex: nextIndex,
    };
  });
}

function getTranslatedIndices(
  pieces: PuzzlePiece[],
  rowOffset: number,
  colOffset: number,
  gridSize: number
): number[] | null {
  const translatedIndices: number[] = [];

  for (const piece of pieces) {
    const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);
    const nextRow = position.row + rowOffset;
    const nextCol = position.col + colOffset;

    if (!isInsideGrid(nextRow, nextCol, gridSize)) {
      return null;
    }

    translatedIndices.push(toPuzzleIndex(nextRow, nextCol, gridSize));
  }

  return translatedIndices;
}

function clampGroupDestination(
  destination: PuzzlePiecePosition,
  group: PuzzlePieceGroup,
  gridSize: number
): PuzzlePiecePosition {
  return {
    row: clampNumber(destination.row, 0, gridSize - group.rowSpan),
    col: clampNumber(destination.col, 0, gridSize - group.colSpan),
  };
}

function getPuzzleGridSize(pieces: PuzzlePiece[]): number {
  const gridSize = Math.sqrt(pieces.length);

  if (!Number.isInteger(gridSize)) {
    throw new Error("Puzzle pieces must form a square grid.");
  }

  return gridSize;
}

function createPuzzlePieceGroup(
  pieces: PuzzlePiece[],
  gridSize: number
): PuzzlePieceGroup {
  const positions = pieces.map((piece) =>
    getPuzzlePiecePosition(piece.currentIndex, gridSize)
  );

  const rows = positions.map((position) => position.row);
  const cols = positions.map((position) => position.col);

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  return {
    id: pieces.map((piece) => piece.id).sort().join(":"),
    anchorPieceId: pieces[0].id,
    pieceIds: pieces.map((piece) => piece.id),
    pieces,
    minRow,
    minCol,
    rowSpan: maxRow - minRow + 1,
    colSpan: maxCol - minCol + 1,
  };
}

function areCorrectNeighborsInCurrentBoard(
  firstPiece: PuzzlePiece,
  secondPiece: PuzzlePiece,
  gridSize: number
): boolean {
  if (firstPiece.isBlank || secondPiece.isBlank) {
    return false;
  }

  const firstCorrectPosition = getPuzzlePiecePosition(
    firstPiece.correctIndex,
    gridSize
  );

  const secondCorrectPosition = getPuzzlePiecePosition(
    secondPiece.correctIndex,
    gridSize
  );

  const firstCurrentPosition = getPuzzlePiecePosition(
    firstPiece.currentIndex,
    gridSize
  );

  const secondCurrentPosition = getPuzzlePiecePosition(
    secondPiece.currentIndex,
    gridSize
  );

  const correctRowDiff = secondCorrectPosition.row - firstCorrectPosition.row;
  const correctColDiff = secondCorrectPosition.col - firstCorrectPosition.col;

  const currentRowDiff = secondCurrentPosition.row - firstCurrentPosition.row;
  const currentColDiff = secondCurrentPosition.col - firstCurrentPosition.col;

  const isCorrectlyAdjacent =
    Math.abs(correctRowDiff) + Math.abs(correctColDiff) === 1;

  return (
    isCorrectlyAdjacent &&
    correctRowDiff === currentRowDiff &&
    correctColDiff === currentColDiff
  );
}

function hasGroupPieceAt(
  groupPieces: PuzzlePiece[],
  row: number,
  col: number,
  gridSize: number
): boolean {
  return groupPieces.some((piece) => {
    const position = getPuzzlePiecePosition(piece.currentIndex, gridSize);

    return position.row === row && position.col === col;
  });
}

function isInsideGrid(row: number, col: number, gridSize: number): boolean {
  return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

function toPuzzleIndex(row: number, col: number, gridSize: number): number {
  return row * gridSize + col;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
