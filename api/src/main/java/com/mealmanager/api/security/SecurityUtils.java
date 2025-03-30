package com.mealmanager.api.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtils {

    /**
     * Get the Clerk user ID of the currently authenticated user
     * 
     * @return Optional containing the user ID, or empty if not authenticated
     */
    public Optional<String> getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return Optional.of(user.getUsername()); // Clerk user ID is stored as username
        }
        
        return Optional.empty();
    }
    
    /**
     * Check if the current request is authenticated
     * 
     * @return true if authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
               !(authentication.getPrincipal() instanceof String);
    }
} 