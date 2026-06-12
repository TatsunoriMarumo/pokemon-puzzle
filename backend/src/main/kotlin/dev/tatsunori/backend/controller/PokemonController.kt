package dev.tatsunori.backend.controller

import dev.tatsunori.backend.dto.response.RandomPokemonResponse
import dev.tatsunori.backend.service.PokemonService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class PokemonController(
    private val pokemonService: PokemonService
) {

    @GetMapping("/api/pokemon/random")
    fun getRandomPokemon(): RandomPokemonResponse {
        return pokemonService.getRandomPokemon()
    }
}
