package com.project.ivr.ivr;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class IVRPromptService {

    private static final Logger log = LoggerFactory.getLogger(IVRPromptService.class);
    private final ReloadableResourceBundleMessageSource messageSource;

    public IVRPromptService() {
        this.messageSource = new ReloadableResourceBundleMessageSource();
        this.messageSource.setBasename("classpath:i18n/messages");
        this.messageSource.setDefaultEncoding("UTF-8");
        this.messageSource.setFallbackToSystemLocale(false);
    }

    public String getPrompt(String key, String langCode, Object... args) {
        Locale locale = resolveLocale(langCode);
        try {
            return messageSource.getMessage(key, args, locale);
        } catch (Exception e) {
            log.warn("Could not find message for key '{}' in locale '{}': {}", key, locale, e.getMessage());
            // Fallback to English
            try {
                return messageSource.getMessage(key, args, Locale.ENGLISH);
            } catch (Exception ex2) {
                return key;
            }
        }
    }

    public String getTwilioVoiceLanguage(String langCode) {
        if ("ta".equalsIgnoreCase(langCode)) {
            return "ta-IN";
        } else if ("hi".equalsIgnoreCase(langCode)) {
            return "hi-IN";
        } else {
            return "en-IN";
        }
    }

    public Locale resolveLocale(String langCode) {
        if (langCode == null) return Locale.ENGLISH;
        return switch (langCode.toLowerCase()) {
            case "ta" -> Locale.forLanguageTag("ta");
            case "hi" -> Locale.forLanguageTag("hi");
            default -> Locale.ENGLISH;
        };
    }
}
