package com.mealmanager.api.controller;

import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.SysUserRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    @Autowired
    private SysUserRepository sysUserRepository;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    @GetMapping
    public ResponseEntity<?> getCurrentUserProfile() {
        Optional<String> currentUserId = securityUtils.getCurrentUserId();
        
        if (currentUserId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        
        Optional<SysUser> userOpt = sysUserRepository.findByClerkUserId(currentUserId.get());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }
        
        return ResponseEntity.ok(userOpt.get());
    }
    
    @PostMapping
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody SysUser userProfile) {
        Optional<String> currentUserId = securityUtils.getCurrentUserId();
        
        if (currentUserId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        
        String clerkUserId = currentUserId.get();
        
        // Find existing profile
        Optional<SysUser> existingUser = sysUserRepository.findByClerkUserId(clerkUserId);
        
        SysUser user;
        if (existingUser.isPresent()) {
            // Update existing profile
            user = existingUser.get();
            user.setFirstName(userProfile.getFirstName());
            user.setLastName(userProfile.getLastName());
            user.setEmail(userProfile.getEmail());
            user.setDefaultChecked(userProfile.getDefaultChecked());
        } else {
            // Create new profile
            user = new SysUser(
                userProfile.getFirstName(),
                userProfile.getLastName(),
                userProfile.getEmail(),
                userProfile.getDefaultChecked(),
                clerkUserId
            );
        }
        
        SysUser savedUser = sysUserRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getUserStatus() {
        Map<String, Object> response = new HashMap<>();
        
        Optional<String> currentUserId = securityUtils.getCurrentUserId();
        response.put("authenticated", currentUserId.isPresent());
        
        if (currentUserId.isPresent()) {
            String clerkUserId = currentUserId.get();
            Optional<SysUser> userOpt = sysUserRepository.findByClerkUserId(clerkUserId);
            response.put("profileExists", userOpt.isPresent());
            
            if (userOpt.isPresent()) {
                SysUser user = userOpt.get();
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getFirstName() + " " + user.getLastName());
            }
        }
        
        return ResponseEntity.ok(response);
    }
} 