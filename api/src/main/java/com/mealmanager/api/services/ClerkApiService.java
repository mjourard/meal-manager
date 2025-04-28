package com.mealmanager.api.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service to interact with Clerk's API for user management
 */
@Service
public class ClerkApiService {
    private static final Logger logger = LoggerFactory.getLogger(ClerkApiService.class);
    
    @Value("${clerk.api.base-url:https://api.clerk.dev/v1}")
    private String clerkApiBaseUrl;
    
    @Value("${clerk.api.key}")
    private String clerkApiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public ClerkApiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Fetch user details from Clerk by ID
     * 
     * @param userId The Clerk user ID
     * @return A map of user details
     */
    public Map<String, Object> getUserById(String userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + clerkApiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            String url = clerkApiBaseUrl + "/users/" + userId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                Map<String, Object> userDetails = new HashMap<>();
                
                // Extract relevant user information
                if (root.has("first_name")) {
                    userDetails.put("firstName", root.get("first_name").asText(""));
                }
                
                if (root.has("last_name")) {
                    userDetails.put("lastName", root.get("last_name").asText(""));
                }
                
                if (root.has("email_addresses") && root.get("email_addresses").isArray() && 
                    root.get("email_addresses").size() > 0) {
                    userDetails.put("email", 
                        root.get("email_addresses").get(0).get("email_address").asText(""));
                }
                
                userDetails.put("clerkUserId", userId);
                
                return userDetails;
            } else {
                logger.error("Failed to fetch user from Clerk API: {}", response.getStatusCode());
                return Map.of();
            }
        } catch (Exception e) {
            logger.error("Error calling Clerk API", e);
            return Map.of();
        }
    }
} 
