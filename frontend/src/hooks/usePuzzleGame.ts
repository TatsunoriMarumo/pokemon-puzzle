import { useCallback, useEffect, useRef, useState } from "react";
import { pokemonApi } from "../api/pokemonApi";
import { DIFFICULTY_CONFIGS } from "../constants/difficulty";
import { audioService, type AudioPlayer } from "../services/audioService";
import type { Pokemon } from "../types/pokemon";
import type { Difficulty, PuzzlePiece } from "../types/puzzle";
import { createPuzzlePiecesFromImage } from "../utils/puzzleImageAnalyzer";
import {
  isPuzzleCompleted,
  shufflePieces,
  swapPieces,
} from "../utils/puzzleUtils";

const DEFAULT_DIFFICULTY: Difficulty = "easy";

type PokemonClient = {
  getRandomPokemon(): Promise<Pokemon>;
};

type UsePuzzleGameOptions = {
  audioPlayer?: AudioPlayer;
  pokemonClient?: PokemonClient;
};

async function createShuffledPieces(
  imageUrl: string,
  difficulty: Difficulty
): Promise<PuzzlePiece[]> {
  const gridSize = DIFFICULTY_CONFIGS[difficulty].gridSize;
  const initialPieces = await createPuzzlePiecesFromImage(imageUrl, gridSize);

  return shufflePieces(initialPieces);
}

export function usePuzzleGame(options: UsePuzzleGameOptions = {}) {
  const audioPlayer = options.audioPlayer ?? audioService;
  const pokemonClient = options.pokemonClient ?? pokemonApi;

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const requestIdRef = useRef(0);
  const pokemonRef = useRef<Pokemon | null>(null);
  const difficultyRef = useRef<Difficulty>(DEFAULT_DIFFICULTY);
  const isCompletedRef = useRef(false);

  const gridSize = DIFFICULTY_CONFIGS[difficulty].gridSize;

  const applyGameState = useCallback(
    (
      nextPokemon: Pokemon,
      nextPieces: PuzzlePiece[],
      nextDifficulty: Difficulty
    ) => {
      pokemonRef.current = nextPokemon;
      difficultyRef.current = nextDifficulty;
      isCompletedRef.current = false;

      setPokemon(nextPokemon);
      setDifficulty(nextDifficulty);
      setPieces(nextPieces);
      setIsCompleted(false);

      void audioPlayer.preload(nextPokemon.cryUrl);
    },
    [audioPlayer]
  );

  const initializeGame = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      const nextPokemon = await pokemonClient.getRandomPokemon();
      const nextPieces = await createShuffledPieces(
        nextPokemon.imageUrl,
        DEFAULT_DIFFICULTY
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      applyGameState(nextPokemon, nextPieces, DEFAULT_DIFFICULTY);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [applyGameState, pokemonClient]);

  const loadNewPokemon = useCallback(
    async (selectedDifficulty: Difficulty = difficultyRef.current) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);

      try {
        const nextPokemon = await pokemonClient.getRandomPokemon();
        const nextPieces = await createShuffledPieces(
          nextPokemon.imageUrl,
          selectedDifficulty
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        applyGameState(nextPokemon, nextPieces, selectedDifficulty);
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [applyGameState, pokemonClient]
  );

  const changeDifficulty = useCallback(
    (nextDifficulty: Difficulty) => {
      difficultyRef.current = nextDifficulty;
      setDifficulty(nextDifficulty);
      void loadNewPokemon(nextDifficulty);
    },
    [loadNewPokemon]
  );

  const resetPuzzle = useCallback(async () => {
    const currentPokemon = pokemonRef.current;
    const currentDifficulty = difficultyRef.current;

    if (!currentPokemon) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);

    try {
      const nextPieces = await createShuffledPieces(
        currentPokemon.imageUrl,
        currentDifficulty
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      isCompletedRef.current = false;

      setPieces(nextPieces);
      setIsCompleted(false);

      void audioPlayer.preload(currentPokemon.cryUrl);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [audioPlayer]);

  const movePiece = useCallback(
    (activeId: string, overId: string) => {
      if (isCompletedRef.current) {
        return;
      }

      setPieces((currentPieces) => {
        const nextPieces = swapPieces(currentPieces, activeId, overId);
        const completed = isPuzzleCompleted(nextPieces);

        isCompletedRef.current = completed;
        setIsCompleted(completed);

        if (completed && pokemonRef.current) {
          void audioPlayer.play(pokemonRef.current.cryUrl);
        }

        return nextPieces;
      });
    },
    [audioPlayer]
  );

  useEffect(() => {
    void initializeGame();

    return () => {
      requestIdRef.current += 1;
    };
  }, [initializeGame]);

  return {
    pokemon,
    pieces,
    difficulty,
    gridSize,
    isCompleted,
    isLoading,
    loadNewPokemon,
    changeDifficulty,
    resetPuzzle,
    movePiece,
  };
}
