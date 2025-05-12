package com.mealmanager.api.security;

import java.util.Optional;

import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.SysUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

/**
 * Utility class for handling security-related operations.
 */
@Component
public class SecurityUtils {

    @Autowired
    private SysUserRepository sysUserRepository;

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
     * Get the currently authenticated user
     * 
     * @return SysUser object or null if not authenticated
     */
    public SysUser getCurrentUser() {
        Optional<String> currentUserId = getCurrentUserId();
        if (currentUserId.isPresent()) {
            return sysUserRepository.findByClerkUserId(currentUserId.get()).orElse(null);
        }
        return null;
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
