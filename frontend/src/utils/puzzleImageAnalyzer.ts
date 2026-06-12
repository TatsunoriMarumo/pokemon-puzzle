import type { PuzzlePiece } from "../types/puzzle";

const CANVAS_SIZE = 500;

const BLANK_ALPHA_THRESHOLD = 10;
const STRONG_ALPHA_THRESHOLD = 40;

const BLANK_TRANSPARENT_RATIO = 0.99;
const BLANK_OPACITY_MASS_RATIO = 0.006;
const BLANK_STRONG_PIXEL_RATIO = 0.001;

export async function createPuzzlePiecesFromImage(
  imageUrl: string,
  gridSize: number
): Promise<PuzzlePiece[]> {
  const image = await loadImage(imageUrl);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is not available.");
  }

  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const pieceSize = CANVAS_SIZE / gridSize;
  const pieces: PuzzlePiece[] = [];

  for (let index = 0; index < gridSize * gridSize; index++) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const imageData = context.getImageData(
      col * pieceSize,
      row * pieceSize,
      pieceSize,
      pieceSize
    );

    pieces.push({
      id: crypto.randomUUID(),
      correctIndex: index,
      currentIndex: index,
      row,
      col,
      isBlank: isBlankPiece(imageData),
    });
  }

  return pieces;
}

function isBlankPiece(imageData: ImageData): boolean {
  const data = imageData.data;
  const totalPixels = data.length / 4;

  let transparentPixels = 0;
  let opacityMass = 0;
  let strongPixels = 0;

  for (let index = 3; index < data.length; index += 4) {
    const alpha = data[index];

    if (alpha <= BLANK_ALPHA_THRESHOLD) {
      transparentPixels++;
    }

    opacityMass += alpha / 255;

    if (alpha >= STRONG_ALPHA_THRESHOLD) {
      strongPixels++;
    }
  }

  const transparentRatio = transparentPixels / totalPixels;
  const opacityMassRatio = opacityMass / totalPixels;
  const strongPixelRatio = strongPixels / totalPixels;

  return (
    transparentRatio >= BLANK_TRANSPARENT_RATIO &&
    opacityMassRatio <= BLANK_OPACITY_MASS_RATIO &&
    strongPixelRatio <= BLANK_STRONG_PIXEL_RATIO
  );
}

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
  });
}
