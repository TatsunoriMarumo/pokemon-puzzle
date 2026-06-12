package dev.tatsunori.backend.dto.response

data class RandomPokemonResponse(
    val id: Int,
    val englishName: String,
    val japaneseName: String,
    val imageUrl: String,
    val cryUrl: String,
)
