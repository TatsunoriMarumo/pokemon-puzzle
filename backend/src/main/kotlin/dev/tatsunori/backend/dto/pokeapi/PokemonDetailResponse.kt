package dev.tatsunori.backend.dto.pokeapi

import com.fasterxml.jackson.annotation.JsonProperty

data class PokemonDetailResponse(
    val id: Int,
    val name: String,
    val forms: List<PokemonFormReference>,
    val species: PokemonSpeciesReference,
    val sprites: PokemonSprites,
    val cries: PokemonCries
)

data class PokemonFormReference(
    val url: String
)

data class PokemonSpeciesReference(
    val url: String
)

data class PokemonSprites(
    val other: PokemonOtherSprites
)

data class PokemonOtherSprites(
    @JsonProperty("official-artwork")
    val officialArtwork: PokemonArtwork
)

data class PokemonArtwork(
    @JsonProperty("front_default")
    val frontDefault: String?
)

data class PokemonCries(
    val latest: String?
)
