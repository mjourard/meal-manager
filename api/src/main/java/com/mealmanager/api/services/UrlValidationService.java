package com.mealmanager.api.services;

import org.apache.commons.validator.routines.UrlValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Service for validating URLs before crawling
 */
@Service
public class UrlValidationService {

    private final Logger logger = LoggerFactory.getLogger(UrlValidationService.class);
    private final UrlValidator urlValidator;

    public UrlValidationService() {
        String[] schemes = {"http", "https"};
        this.urlValidator = new UrlValidator(schemes);
    }

    /**
     * Validates if a URL has a valid format
     * 
     * @param url URL to validate
     * @return true if the URL has a valid format, false otherwise
     */
    public boolean isValidFormat(String url) {
        return urlValidator.isValid(url);
    }

    /**
     * Validates if a URL is accessible by performing a HEAD request
     * 
     * @param url URL to validate
     * @return true if the URL is accessible, false otherwise
     */
    public boolean isAccessible(String url) {
        if (!isValidFormat(url)) {
            return false;
        }

        try {
            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            
            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 400;
        } catch (IOException e) {
            logger.debug("Error validating URL accessibility: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Full validation including format and accessibility
     * 
     * @param url URL to validate
     * @return true if the URL is valid and accessible, false otherwise
     */
    public boolean validate(String url) {
        return isValidFormat(url) && isAccessible(url);
    }
} 
