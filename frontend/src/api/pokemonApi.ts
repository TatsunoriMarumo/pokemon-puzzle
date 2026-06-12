import { apiClient } from "./client";
import type { Pokemon } from "../types/pokemon";

export const pokemonApi = {
    getRandomPokemon(): Promise<Pokemon> {
        return apiClient.get<Pokemon>("/api/pokemon/random")
    }
}
