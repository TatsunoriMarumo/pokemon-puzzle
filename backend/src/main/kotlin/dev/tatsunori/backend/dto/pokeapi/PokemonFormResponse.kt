package dev.tatsunori.backend.dto.pokeapi

import com.fasterxml.jackson.annotation.JsonProperty

data class PokemonFormResponse(
    @JsonProperty("names")
    val formNames: List<LocalizedName>
)

data class LocalizedName(
    val name: String,
    val language: Language
)

data class Language(
    val name: String
)
