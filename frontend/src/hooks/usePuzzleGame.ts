import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { pokemonApi } from "../api/pokemonApi";
import { DIFFICULTY_CONFIGS } from "../constants/difficulty";
import {
  INITIAL_PUZZLE_BOARD_STATE,
  movePuzzlePieceGroup,
  puzzleBoardReducer,
} from "../reducers/puzzleBoardReducer";
import { audioService, type AudioPlayer } from "../services/audioService";
import {
  DefaultPuzzleSetupService,
  type PokemonClient,
  type PuzzleSetupService,
} from "../services/puzzleSetupService";
import type { Pokemon } from "../types/pokemon";
import type { Difficulty, PuzzlePiece, PuzzlePiecePosition } from "../types/puzzle";
import { resolveErrorMessage } from "../utils/errorMessageResolver";

const DEFAULT_DIFFICULTY: Difficulty = "easy";

type UsePuzzleGameOptions = {
  audioPlayer?: AudioPlayer;
  pokemonClient?: PokemonClient;
  puzzleSetupService?: PuzzleSetupService;
};

export function usePuzzleGame(options: UsePuzzleGameOptions = {}) {
  const audioPlayer = options.audioPlayer ?? audioService;
  const pokemonClient = options.pokemonClient ?? pokemonApi;

  const puzzleSetupService = useMemo(() => {
    return (
      options.puzzleSetupService ??
      new DefaultPuzzleSetupService(pokemonClient)
    );
  }, [options.puzzleSetupService, pokemonClient]);

  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [puzzleBoardState, dispatchPuzzleBoard] = useReducer(
    puzzleBoardReducer,
    INITIAL_PUZZLE_BOARD_STATE
  );

  const requestIdRef = useRef(0);
  const pokemonRef = useRef<Pokemon | null>(null);
  const difficultyRef = useRef<Difficulty>(DEFAULT_DIFFICULTY);
  const completionAudioPlayedRef = useRef(false);

  const { pieces, isCompleted } = puzzleBoardState;
  const gridSize = DIFFICULTY_CONFIGS[difficulty].gridSize;

  const setGameError = useCallback((error: unknown) => {
    setErrorMessage(resolveErrorMessage(error));
  }, []);

  const clearGameError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const prepareAudio = useCallback(() => {
    void audioPlayer.prepare().catch(setGameError);
  }, [audioPlayer, setGameError]);

  const preloadCry = useCallback(
    (cryUrl: string) => {
      void audioPlayer.preload(cryUrl).catch(setGameError);
    },
    [audioPlayer, setGameError]
  );

  const playCry = useCallback(
    (cryUrl: string) => {
      void audioPlayer.play(cryUrl).catch(setGameError);
    },
    [audioPlayer, setGameError]
  );

  const applyGameState = useCallback(
    (
      nextPokemon: Pokemon,
      nextDifficulty: Difficulty,
      piecesForPuzzle: PuzzlePiece[]
    ) => {
      pokemonRef.current = nextPokemon;
      difficultyRef.current = nextDifficulty;
      completionAudioPlayedRef.current = false;

      setPokemon(nextPokemon);
      setDifficulty(nextDifficulty);
      clearGameError();

      dispatchPuzzleBoard({
        type: "replacePieces",
        pieces: piecesForPuzzle,
      });

      preloadCry(nextPokemon.cryUrl);
    },
    [clearGameError, preloadCry]
  );

  const loadInitialPokemon = useCallback(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    puzzleSetupService
      .setupPuzzle(DEFAULT_DIFFICULTY)
      .then((result) => {
        if (requestIdRef.current !== requestId) {
          return;
        }

        applyGameState(result.pokemon, result.difficulty, result.pieces);
      })
      .catch((error: unknown) => {
        if (requestIdRef.current === requestId) {
          setGameError(error);
        }
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      });
  }, [applyGameState, puzzleSetupService, setGameError]);

  const loadNewPokemon = useCallback(
    async (selectedDifficulty: Difficulty = difficultyRef.current) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      clearGameError();

      try {
        const result = await puzzleSetupService.setupPuzzle(selectedDifficulty);

        if (requestIdRef.current !== requestId) {
          return;
        }

        applyGameState(result.pokemon, result.difficulty, result.pieces);
      } catch (error) {
        if (requestIdRef.current === requestId) {
          setGameError(error);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [applyGameState, clearGameError, puzzleSetupService, setGameError]
  );

  const changeDifficulty = useCallback(
    async (nextDifficulty: Difficulty) => {
      const currentPokemon = pokemonRef.current;
      const currentDifficulty = difficultyRef.current;

      if (!currentPokemon || nextDifficulty === currentDifficulty) {
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      setIsLoading(true);
      clearGameError();

      try {
        const nextPieces = await puzzleSetupService.resetPuzzle(
          currentPokemon,
          nextDifficulty
        );

        if (requestIdRef.current !== requestId) {
          return;
        }

        difficultyRef.current = nextDifficulty;
        completionAudioPlayedRef.current = false;

        setDifficulty(nextDifficulty);

        dispatchPuzzleBoard({
          type: "replacePieces",
          pieces: nextPieces,
        });

        preloadCry(currentPokemon.cryUrl);
      } catch (error) {
        if (requestIdRef.current === requestId) {
          setGameError(error);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [clearGameError, preloadCry, puzzleSetupService, setGameError]
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
    clearGameError();

    try {
      const nextPieces = await puzzleSetupService.resetPuzzle(
        currentPokemon,
        currentDifficulty
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      completionAudioPlayedRef.current = false;

      dispatchPuzzleBoard({
        type: "replacePieces",
        pieces: nextPieces,
      });

      preloadCry(currentPokemon.cryUrl);
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setGameError(error);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [clearGameError, preloadCry, puzzleSetupService, setGameError]);

  const movePiece = useCallback(
    (activePieceId: string, destination: PuzzlePiecePosition) => {
      if (puzzleBoardState.isCompleted) {
        return;
      }

      prepareAudio();

      const nextPuzzleBoardState = movePuzzlePieceGroup(
        puzzleBoardState,
        activePieceId,
        destination
      );

      const completedByThisMove =
        !puzzleBoardState.isCompleted && nextPuzzleBoardState.isCompleted;

      dispatchPuzzleBoard({
        type: "movePieceGroup",
        activePieceId,
        destination,
      });

      if (!completedByThisMove) {
        return;
      }

      if (completionAudioPlayedRef.current) {
        return;
      }

      completionAudioPlayedRef.current = true;

      const currentPokemon = pokemonRef.current;

      if (!currentPokemon) {
        return;
      }

      playCry(currentPokemon.cryUrl);
    },
    [playCry, prepareAudio, puzzleBoardState]
  );

  useEffect(() => {
    loadInitialPokemon();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadInitialPokemon]);

  useEffect(() => {
    const handlePointerDown = () => {
      prepareAudio();
    };

    const handleKeyDown = () => {
      prepareAudio();
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      once: true,
      passive: true,
      capture: true,
    });

    window.addEventListener("keydown", handleKeyDown, {
      once: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });

      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    };
  }, [prepareAudio]);

  return {
    pokemon,
    pieces,
    difficulty,
    gridSize,
    isCompleted,
    isLoading,
    errorMessage,
    loadNewPokemon,
    changeDifficulty,
    resetPuzzle,
    movePiece,
  };
}
