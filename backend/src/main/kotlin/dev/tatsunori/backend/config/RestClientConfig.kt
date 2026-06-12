package dev.tatsunori.backend.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class RestClientConfig(
    private val pokeApiProperties: PokeApiProperties
) {

    @Bean
    fun restClient(): RestClient {
        return RestClient.builder()
            .baseUrl(pokeApiProperties.baseUrl)
            .build()
    }
}
