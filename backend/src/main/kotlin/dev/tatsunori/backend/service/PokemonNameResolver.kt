package dev.tatsunori.backend.service

import dev.tatsunori.backend.client.PokeApiClient
import dev.tatsunori.backend.constants.MessageKeys
import dev.tatsunori.backend.constants.PokeApiConstants
import dev.tatsunori.backend.dto.pokeapi.LocalizedName
import dev.tatsunori.backend.dto.pokeapi.PokemonDetailResponse
import dev.tatsunori.backend.dto.pokeapi.PokemonFormResponse
import org.springframework.stereotype.Service

@Service
class PokemonNameResolver(
    private val pokeApiClient: PokeApiClient,
    private val messageService: MessageService
) {

    fun resolveJapaneseName(
        pokemonDetail: PokemonDetailResponse
    ): String {
        val formNameResult = resolveFormJapaneseName(pokemonDetail)

        if (formNameResult?.isMega == true) {
            return formNameResult.name
        }

        val speciesName = resolveSpeciesJapaneseName(pokemonDetail)

        return if (formNameResult == null) {
            speciesName
        } else {
            buildSpeciesWithFormName(
                speciesName = speciesName,
                formName = formNameResult.name
            )
        }
    }

    private fun resolveFormJapaneseName(
        pokemonDetail: PokemonDetailResponse
    ): FormJapaneseName? {
        val formUrl = pokemonDetail.forms.firstOrNull()?.url
            ?: return null

        val formResponse = pokeApiClient.fetchPokemonForm(formUrl)

        val formName = findJapaneseName(formResponse.formNames)
            ?: return null

        return FormJapaneseName(
            name = formName,
            isMega = formResponse.isMega
        )
    }

    private fun resolveSpeciesJapaneseName(
        pokemonDetail: PokemonDetailResponse
    ): String {
        val speciesResponse = pokeApiClient.fetchPokemonSpecies(
            pokemonDetail.species.url
        )

        return findJapaneseName(speciesResponse.names)
            ?: throw IllegalStateException(
                messageService.getMessage(MessageKeys.JAPANESE_NAME_NOT_FOUND)
            )
    }

    private fun findJapaneseName(
        names: List<LocalizedName>
    ): String? {
        return names
            .firstOrNull {
                it.language.name == PokeApiConstants.JAPANESE_LANGUAGE
            }
            ?.name
    }

    private fun buildSpeciesWithFormName(
        speciesName: String,
        formName: String
    ): String {
        return "$speciesName（$formName）"
    }

    private data class FormJapaneseName(
        val name: String,
        val isMega: Boolean
    )
}
