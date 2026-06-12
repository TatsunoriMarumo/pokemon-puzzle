export const en = {
  app: {
    title: "Pokemon Puzzle",
  },

  difficulty: {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
  },

  game: {
    loading: "Loading...",
    reset: "Reset",
    nextPokemon: "Next Pokemon",
    completed: "Completed!",
    instruction: "Drag pieces to rearrange them.",
  },

  error: {
    apiRequestFailed: "Failed to load Pokemon.",
    apiBaseUrlMissing: "API base URL is missing.",
    audioContextNotSupported: "Audio playback is not supported in this browser.",
    audioFetchFailed: "Failed to load Pokemon cry.",
    audioDecodeFailed: "Failed to prepare Pokemon cry.",
    unexpectedError: "Unexpected error occurred.",
  },
} as const;
