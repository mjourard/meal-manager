package com.mealmanager.api.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Service for parsing robots.txt files and checking if a URL is allowed to be crawled
 */
@Service
public class RobotsTxtParser {

    private final Logger logger = LoggerFactory.getLogger(RobotsTxtParser.class);
    private static final String USER_AGENT = "MealManagerBot";
    private static final Map<String, RobotsTxtRules> robotsTxtCache = new HashMap<>();

    /**
     * Checks if a URL is allowed to be crawled based on robots.txt rules
     * 
     * @param url The URL to check
     * @return true if the URL is allowed to be crawled, false otherwise
     */
    public boolean isAllowed(String url) {
        try {
            URL urlObj = new URL(url);
            String robotsTxtUrl = getRobotsTxtUrl(urlObj);
            
            RobotsTxtRules rules = robotsTxtCache.computeIfAbsent(
                robotsTxtUrl, k -> parseRobotsTxt(robotsTxtUrl));
            
            // If no rules were found or could be parsed, allow crawling by default
            if (rules == null) {
                return true;
            }
            
            // Check if URL path is allowed
            String pathToCheck = urlObj.getPath();
            if (pathToCheck.isEmpty()) {
                pathToCheck = "/";
            }
            
            return rules.isAllowed(pathToCheck);
            
        } catch (MalformedURLException e) {
            logger.warn("Invalid URL: {}", url);
            return false;
        }
    }

    /**
     * Constructs the robots.txt URL for a given URL
     * 
     * @param url The URL to get robots.txt for
     * @return The robots.txt URL
     */
    private String getRobotsTxtUrl(URL url) {
        return url.getProtocol() + "://" + url.getHost() + 
               (url.getPort() > 0 ? ":" + url.getPort() : "") + "/robots.txt";
    }

    /**
     * Parses a robots.txt file
     * 
     * @param robotsTxtUrl The URL of the robots.txt file
     * @return The parsed rules
     */
    private RobotsTxtRules parseRobotsTxt(String robotsTxtUrl) {
        try {
            URL url = new URL(robotsTxtUrl);
            RobotsTxtRules rules = new RobotsTxtRules();
            boolean isRelevantUserAgent = false;
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // Skip comments and empty lines
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    
                    // Split by colon
                    String[] parts = line.split(":", 2);
                    if (parts.length != 2) {
                        continue;
                    }
                    
                    String directive = parts[0].trim().toLowerCase();
                    String value = parts[1].trim();
                    
                    // Parse user-agent directive
                    if ("user-agent".equals(directive)) {
                        isRelevantUserAgent = "*".equals(value) || USER_AGENT.equals(value);
                        continue;
                    }
                    
                    // Only process rules for our user agent
                    if (!isRelevantUserAgent) {
                        continue;
                    }
                    
                    // Parse allow and disallow directives
                    if ("allow".equals(directive)) {
                        rules.addAllowRule(value);
                    } else if ("disallow".equals(directive)) {
                        rules.addDisallowRule(value);
                    }
                }
            }
            
            return rules;
        } catch (IOException e) {
            // If we can't access robots.txt, assume crawling is allowed
            logger.info("Could not access robots.txt at {}: {}", robotsTxtUrl, e.getMessage());
            return null;
        }
    }

    /**
     * Inner class to represent robots.txt rules
     */
    private static class RobotsTxtRules {
        private final List<PathRule> allowRules = new ArrayList<>();
        private final List<PathRule> disallowRules = new ArrayList<>();
        
        void addAllowRule(String path) {
            allowRules.add(new PathRule(path));
        }
        
        void addDisallowRule(String path) {
            disallowRules.add(new PathRule(path));
        }
        
        boolean isAllowed(String path) {
            // If there are no rules, allow everything
            if (disallowRules.isEmpty() && allowRules.isEmpty()) {
                return true;
            }
            
            // Check if path matches any allow rule (allow rules take precedence)
            for (PathRule rule : allowRules) {
                if (rule.matches(path)) {
                    return true;
                }
            }
            
            // Check if path matches any disallow rule
            for (PathRule rule : disallowRules) {
                if (rule.matches(path)) {
                    return false;
                }
            }
            
            // If no rules matched, crawling is allowed
            return true;
        }
    }

    /**
     * Inner class to represent a single path rule from robots.txt
     */
    private static class PathRule {
        private final Pattern pattern;
        
        PathRule(String path) {
            // Convert robots.txt pattern to regex
            String regex = Pattern.quote(path);
            
            // Replace * wildcard
            regex = regex.replace("\\*", ".*");
            
            // Add $ at the end if the path doesn't end with a wildcard
            if (!path.endsWith("*")) {
                regex += "$";
            }
            
            pattern = Pattern.compile(regex);
        }
        
        boolean matches(String path) {
            return pattern.matcher(path).matches();
        }
    }
} 