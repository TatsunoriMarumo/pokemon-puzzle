package dev.tatsunori.backend.service

import dev.tatsunori.backend.client.PokeApiClient
import dev.tatsunori.backend.config.PokeApiProperties
import dev.tatsunori.backend.constants.MessageKeys
import dev.tatsunori.backend.constants.PokeApiConstants
import dev.tatsunori.backend.dto.pokeapi.LocalizedName
import dev.tatsunori.backend.dto.pokeapi.PokemonDetailResponse
import dev.tatsunori.backend.dto.response.RandomPokemonResponse
import org.springframework.stereotype.Service

@Service
class PokemonService(
    private val pokeApiClient: PokeApiClient,
    private val pokeApiProperties: PokeApiProperties,
    private val messageService: MessageService
) {
    private val cachedPokemonList by lazy {
        pokeApiClient.fetchPokemonList().results
    }

    fun getRandomPokemon(): RandomPokemonResponse {
        repeat(pokeApiProperties.pokemon.maxRetryCount) {
            val selectedPokemon = cachedPokemonList.random()
            val pokemonDetail = pokeApiClient.fetchPokemonDetail(selectedPokemon.url)

            val imageUrl = extractOfficialArtworkUrl(pokemonDetail)
            val cryUrl = pokemonDetail.cries.latest

            if (!imageUrl.isNullOrBlank() && !cryUrl.isNullOrBlank()) {
                return RandomPokemonResponse(
                    id = pokemonDetail.id,
                    englishName = pokemonDetail.name,
                    japaneseName = resolveJapaneseName(pokemonDetail),
                    imageUrl = imageUrl,
                    cryUrl = cryUrl
                )
            }
        }

        throw IllegalStateException(
            messageService.getMessage(MessageKeys.RANDOM_POKEMON_NOT_FOUND)
        )
    }

    private fun extractOfficialArtworkUrl(
        pokemonDetail: PokemonDetailResponse
    ): String? {
        return pokemonDetail.sprites
            .other
            .officialArtwork
            .frontDefault
    }

    private fun resolveJapaneseName(
        pokemonDetail: PokemonDetailResponse
    ): String {
        val formUrl = pokemonDetail.forms.firstOrNull()?.url

        if (!formUrl.isNullOrBlank()) {
            val formResponse = pokeApiClient.fetchPokemonForm(formUrl)
            val formName = findJapaneseName(formResponse.formNames)

            if (!formName.isNullOrBlank()) {
                return formName
            }
        }

        val speciesResponse = pokeApiClient.fetchPokemonSpecies(
            pokemonDetail.species.url
        )

        return findJapaneseName(speciesResponse.names)
            ?: throw IllegalStateException(
                messageService.getMessage(MessageKeys.JAPANESE_NAME_NOT_FOUND)
            )
    }

    private fun findJapaneseName(names: List<LocalizedName>): String? {
        return names
            .firstOrNull {
                it.language.name == PokeApiConstants.JAPANESE_LANGUAGE
            }
            ?.name
    }
}
