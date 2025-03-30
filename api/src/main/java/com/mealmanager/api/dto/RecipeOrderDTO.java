package com.mealmanager.api.dto;

import java.util.List;

public class RecipeOrderDTO {
    private List<Long> selectedRecipes;
    private List<Long> selectedUserIds;
    private String message;

    public List<Long> getSelectedRecipes() {
        return this.selectedRecipes;
    }

    public void setSelectedRecipes(List<Long> selectedRecipes) {
        this.selectedRecipes = selectedRecipes;
    }

    public List<Long> getSelectedUserIds() {
        return this.selectedUserIds;
    }

    public void setSelectedUserIds(List<Long> selectedUserIds) {
        this.selectedUserIds = selectedUserIds;
    }

    public String getMessage() {
        if (this.message == null) {
            return "";
        }
        return this.message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
