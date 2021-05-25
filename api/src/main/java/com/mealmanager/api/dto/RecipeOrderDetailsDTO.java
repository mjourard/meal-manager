package com.mealmanager.api.dto;

import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.SysUser;

import java.util.ArrayList;
import java.util.List;

public class RecipeOrderDetailsDTO {
    private Long orderId;
    private final List<Recipe> selectedRecipes;
    private final List<SysUser> selectedUsers;
    private String message;

    public RecipeOrderDetailsDTO() {
        this.selectedRecipes = new ArrayList<>();
        this.selectedUsers = new ArrayList<>();
    }

    public RecipeOrderDetailsDTO(long orderId) {
        this();
        setOrderId(orderId);
    }

    public List<Recipe> getSelectedRecipes() {
        return this.selectedRecipes;
    }

    public void addSelectedRecipe(Recipe recipe) {
        this.selectedRecipes.add(recipe);
    }

    public void addSelectedUser(SysUser user) {
        this.selectedUsers.add(user);
    }

    public List<SysUser> getSelectedUsers() {
        return this.selectedUsers;
    }

    public String getMessage() {
        if (this.message == null) {
            return "";
        }
        return this.message;
    }

    public void setOrderId(long id) { this.orderId = id;}

    public void setMessage(String message) { this.message = message;}
}
