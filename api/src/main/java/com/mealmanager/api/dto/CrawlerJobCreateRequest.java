package com.mealmanager.api.dto;

/**
 * Request DTO for creating crawler jobs
 */
public class CrawlerJobCreateRequest {
    
    private String url;
    private Integer crawlDepth;
    private String recipeName;
    private String recipeDescription;
    private boolean forceOverrideValidation;
    
    public CrawlerJobCreateRequest() {
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getCrawlDepth() {
        return crawlDepth;
    }

    public void setCrawlDepth(Integer crawlDepth) {
        this.crawlDepth = crawlDepth;
    }

    public String getRecipeName() {
        return recipeName;
    }

    public void setRecipeName(String recipeName) {
        this.recipeName = recipeName;
    }

    public String getRecipeDescription() {
        return recipeDescription;
    }

    public void setRecipeDescription(String recipeDescription) {
        this.recipeDescription = recipeDescription;
    }

    public boolean isForceOverrideValidation() {
        return forceOverrideValidation;
    }

    public void setForceOverrideValidation(boolean forceOverrideValidation) {
        this.forceOverrideValidation = forceOverrideValidation;
    }
} 
