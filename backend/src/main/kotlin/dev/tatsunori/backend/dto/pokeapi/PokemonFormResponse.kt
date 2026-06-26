package dev.tatsunori.backend.dto.pokeapi

import com.fasterxml.jackson.annotation.JsonProperty

data class PokemonFormResponse(
    @JsonProperty("form_names")
    val formNames: List<LocalizedName>,

    @JsonProperty("is_mega")
    val isMega: Boolean
)

data class LocalizedName(
    val name: String,
    val language: Language
)

data class Language(
    val name: String
)
