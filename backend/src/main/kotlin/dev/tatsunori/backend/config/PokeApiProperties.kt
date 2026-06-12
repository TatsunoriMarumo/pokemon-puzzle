package dev.tatsunori.backend.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "pokeapi")
data class PokeApiProperties(
    val baseUrl: String,
    val pokemon: PokemonProperties
)

data class PokemonProperties(
    val limit: Int,
    val offset: Int,
    val maxRetryCount: Int,
)
