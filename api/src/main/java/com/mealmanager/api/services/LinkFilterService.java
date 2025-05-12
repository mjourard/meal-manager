package com.mealmanager.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Service for filtering links to remove analytics, trackers, and other unwanted content
 */
@Service
public class LinkFilterService {

    private final Logger logger = LoggerFactory.getLogger(LinkFilterService.class);
    
    // List of domains to filter out
    private static final Set<String> FILTERED_DOMAINS = new HashSet<>(Arrays.asList(
        "googletagmanager.com",
        "google-analytics.com",
        "analytics.google.com",
        "doubleclick.net",
        "facebook.com/tr",
        "facebook.net",
        "twitter.com/i/jot",
        "connect.facebook.net",
        "stats.wp.com",
        "amazon-adsystem.com",
        "adservice.google.com"
    ));
    
    // List of URL patterns to filter out
    private static final Pattern[] FILTERED_PATTERNS = {
        Pattern.compile(".*\\.js\\?.*utm_.*"),
        Pattern.compile(".*\\.css\\?.*utm_.*"),
        Pattern.compile(".*\\?.*utm_source=.*"),
        Pattern.compile(".*\\?.*utm_medium=.*"),
        Pattern.compile(".*\\?.*utm_campaign=.*"),
        Pattern.compile(".*\\/pixel\\.gif.*"),
        Pattern.compile(".*\\/gtm\\.js.*"),
        Pattern.compile(".*\\/gtag\\/js.*")
    };

    /**
     * Checks if a URL should be filtered out
     * 
     * @param url The URL to check
     * @return true if the URL should be filtered out, false if it's safe to crawl
     */
    public boolean shouldFilter(String url) {
        if (url == null || url.isEmpty()) {
            return true;
        }
        
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            
            // Check if the domain is in the filtered list
            if (host != null) {
                for (String domain : FILTERED_DOMAINS) {
                    if (host.endsWith(domain)) {
                        return true;
                    }
                }
            }
            
            // Check if the URL matches any filtered pattern
            for (Pattern pattern : FILTERED_PATTERNS) {
                if (pattern.matcher(url).matches()) {
                    return true;
                }
            }
            
            return false;
        } catch (URISyntaxException e) {
            logger.debug("Invalid URL: {}", url);
            return true;
        }
    }

    /**
     * Clean query parameters from a URL
     * 
     * @param url The URL to clean
     * @return The cleaned URL
     */
    public String cleanUrl(String url) {
        if (url == null || url.isEmpty()) {
            return url;
        }
        
        try {
            URI uri = new URI(url);
            String query = uri.getQuery();
            
            // If there's no query, return the original URL
            if (query == null || query.isEmpty()) {
                return url;
            }
            
            // Remove any UTM parameters
            if (query.contains("utm_")) {
                String[] params = query.split("&");
                StringBuilder cleanQuery = new StringBuilder();
                
                for (String param : params) {
                    if (!param.startsWith("utm_")) {
                        if (cleanQuery.length() > 0) {
                            cleanQuery.append("&");
                        }
                        cleanQuery.append(param);
                    }
                }
                
                // Reconstruct the URL
                URI cleanUri = new URI(
                    uri.getScheme(),
                    uri.getUserInfo(),
                    uri.getHost(),
                    uri.getPort(),
                    uri.getPath(),
                    cleanQuery.length() > 0 ? cleanQuery.toString() : null,
                    uri.getFragment()
                );
                
                return cleanUri.toString();
            }
            
            return url;
        } catch (URISyntaxException e) {
            logger.debug("Invalid URL: {}", url);
            return url;
        }
    }
} 
