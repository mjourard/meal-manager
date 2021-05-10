package com.mealmanager.api.dto;

import java.util.List;

public class RecipeOrderDTO {
    private List<Long> selectedRecipes;
    private List<Long> selectedUserIds;
    private String message;

    public List<Long> getSelectedRecipes() {
        return this.selectedRecipes;
    }

    public List<Long> getSelectedUserIds() {
        return this.selectedUserIds;
    }

    public String getMessage() {
        if (this.message == null) {
            return "";
        }
        return this.message;
    }
}
