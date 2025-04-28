package com.mealmanager.api.dto;

/**
 * Response object for user registration endpoint
 */
public class UserRegistrationResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String clerkUserId;
    private Boolean isNewUser;
    
    public UserRegistrationResponse() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getClerkUserId() {
        return clerkUserId;
    }
    
    public void setClerkUserId(String clerkUserId) {
        this.clerkUserId = clerkUserId;
    }
    
    public Boolean getIsNewUser() {
        return isNewUser;
    }
    
    public void setIsNewUser(Boolean isNewUser) {
        this.isNewUser = isNewUser;
    }
} 
