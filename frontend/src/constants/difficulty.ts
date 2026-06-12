import type { Difficulty, DifficultyConfig } from "../types/puzzle";

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
    easy: {
        gridSize: 3,
    },
    normal: {
        gridSize: 4,
    },
    hard: {
        gridSize: 5,
    },
};
