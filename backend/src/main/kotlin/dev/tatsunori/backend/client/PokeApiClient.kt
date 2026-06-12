package dev.tatsunori.backend.client

import dev.tatsunori.backend.config.PokeApiProperties
import dev.tatsunori.backend.constants.MessageKeys
import dev.tatsunori.backend.constants.PokeApiConstants
import dev.tatsunori.backend.dto.pokeapi.PokemonDetailResponse
import dev.tatsunori.backend.dto.pokeapi.PokemonFormResponse
import dev.tatsunori.backend.dto.pokeapi.PokemonListResponse
import dev.tatsunori.backend.dto.pokeapi.PokemonSpeciesResponse
import dev.tatsunori.backend.service.MessageService
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class PokeApiClient(
    private val restClient: RestClient,
    private val pokeApiProperties: PokeApiProperties,
    private val messageService: MessageService
) {

    fun fetchPokemonList(): PokemonListResponse {
        return restClient.get()
            .uri { uriBuilder ->
                uriBuilder
                    .path(PokeApiConstants.POKEMON_ENDPOINT)
                    .queryParam(PokeApiConstants.LIMIT_QUERY_PARAM, pokeApiProperties.pokemon.limit)
                    .queryParam(PokeApiConstants.OFFSET_QUERY_PARAM, pokeApiProperties.pokemon.offset)
                    .build()
            }
            .retrieve()
            .body(PokemonListResponse::class.java)
            ?: throw IllegalStateException(
                messageService.getMessage(MessageKeys.POKEMON_LIST_EMPTY)
            )
    }

    fun fetchPokemonDetail(url: String): PokemonDetailResponse {
        return restClient.get()
            .uri(url)
            .retrieve()
            .body(PokemonDetailResponse::class.java)
        ?: throw IllegalStateException(
            messageService.getMessage(MessageKeys.POKEMON_DETAIL_EMPTY)
        )
    }

    fun fetchPokemonForm(url: String): PokemonFormResponse {
        return restClient.get()
            .uri(url)
            .retrieve()
            .body(PokemonFormResponse::class.java)
        ?: throw IllegalStateException(
            messageService.getMessage(MessageKeys.POKEMON_FORM_EMPTY)
        )
    }

    fun fetchPokemonSpecies(url: String): PokemonSpeciesResponse {
        return restClient.get()
            .uri(url)
            .retrieve()
            .body(PokemonSpeciesResponse::class.java)
        ?: throw IllegalStateException(
            messageService.getMessage(MessageKeys.POKEMON_SPECIES_EMPTY)
        )
    }
}

