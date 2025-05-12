package com.mealmanager.api.dto;

/**
 * Request DTO for performing actions on crawler jobs
 */
public class CrawlerJobActionRequest {
    
    private String action;
    
    public CrawlerJobActionRequest() {
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
} 
