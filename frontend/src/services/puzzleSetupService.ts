import { DIFFICULTY_CONFIGS } from "../constants/difficulty";
import type { Pokemon } from "../types/pokemon";
import type { Difficulty, PuzzlePiece } from "../types/puzzle";
import { createPuzzlePiecesFromImage } from "../utils/puzzleImageAnalyzer";
import { shufflePieces } from "../utils/puzzleUtils";

export type PokemonClient = {
  getRandomPokemon(): Promise<Pokemon>;
};

export type PuzzleSetupResult = {
  pokemon: Pokemon;
  pieces: PuzzlePiece[];
  difficulty: Difficulty;
};

export interface PuzzleSetupService {
  setupPuzzle(difficulty: Difficulty): Promise<PuzzleSetupResult>;
  resetPuzzle(pokemon: Pokemon, difficulty: Difficulty): Promise<PuzzlePiece[]>;
}

export class DefaultPuzzleSetupService implements PuzzleSetupService {
  private readonly pokemonClient: PokemonClient;

  constructor(pokemonClient: PokemonClient) {
    this.pokemonClient = pokemonClient;
  }

  async setupPuzzle(difficulty: Difficulty): Promise<PuzzleSetupResult> {
    const pokemon = await this.pokemonClient.getRandomPokemon();
    const pieces = await createShuffledPieces(pokemon.imageUrl, difficulty);

    return {
      pokemon,
      pieces,
      difficulty,
    };
  }

  async resetPuzzle(
    pokemon: Pokemon,
    difficulty: Difficulty
  ): Promise<PuzzlePiece[]> {
    return createShuffledPieces(pokemon.imageUrl, difficulty);
  }
}

async function createShuffledPieces(
  imageUrl: string,
  difficulty: Difficulty
): Promise<PuzzlePiece[]> {
  const gridSize = DIFFICULTY_CONFIGS[difficulty].gridSize;
  const initialPieces = await createPuzzlePiecesFromImage(imageUrl, gridSize);

  return shufflePieces(initialPieces);
}
