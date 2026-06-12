package dev.tatsunori.backend.service

import org.springframework.context.MessageSource
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.stereotype.Service

@Service
class MessageService(
    private val messageSource: MessageSource
) {

    fun getMessage(key: String): String? {
        return messageSource.getMessage(
            key,
            null,
            LocaleContextHolder.getLocale()
        )
    }
}
