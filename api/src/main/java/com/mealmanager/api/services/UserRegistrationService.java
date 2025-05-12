package com.mealmanager.api.services;

import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.SysUserRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

/**
 * Service for user registration and management within the app
 */
@Service
public class UserRegistrationService {
    private static final Logger logger = LoggerFactory.getLogger(UserRegistrationService.class);

    @Autowired
    private SysUserRepository sysUserRepository;

    @Autowired
    private ClerkApiService clerkApiService;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Register the currently authenticated user in the system
     * 
     * @return The registered SysUser or null if registration failed
     */
    public SysUser registerCurrentUser() {
        // Get the current Clerk user ID from the security context
        Optional<String> currentUserIdOpt = securityUtils.getCurrentUserId();
        
        if (currentUserIdOpt.isEmpty()) {
            logger.error("No authenticated user found");
            return null;
        }
        
        String clerkUserId = currentUserIdOpt.get();
        
        // Check if user already exists
        Optional<SysUser> existingUser = sysUserRepository.findByClerkUserId(clerkUserId);
        if (existingUser.isPresent()) {
            logger.info("User already registered with Clerk ID: {}", clerkUserId);
            return existingUser.get();
        }
        
        // Fetch user details from Clerk
        Map<String, Object> userDetails = clerkApiService.getUserById(clerkUserId);
        if (userDetails.isEmpty()) {
            logger.error("Failed to fetch user details from Clerk for ID: {}", clerkUserId);
            return null;
        }
        
        // Create a new SysUser with the Clerk data
        SysUser newUser = new SysUser(
            (String) userDetails.getOrDefault("firstName", ""),
            (String) userDetails.getOrDefault("lastName", ""),
            (String) userDetails.getOrDefault("email", ""),
            true, // defaultChecked is true by default
            clerkUserId
        );
        
        try {
            // Save the new user to the database
            SysUser savedUser = sysUserRepository.save(newUser);
            logger.info("Successfully registered user with Clerk ID: {}", clerkUserId);
            return savedUser;
        } catch (Exception e) {
            logger.error("Error saving new user with Clerk ID: {}", clerkUserId, e);
            return null;
        }
    }
} 
