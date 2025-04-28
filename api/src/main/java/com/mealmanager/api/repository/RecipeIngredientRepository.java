package com.mealmanager.api.repository;

import com.mealmanager.api.model.Ingredient;
import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    
    List<RecipeIngredient> findByRecipe(Recipe recipe);
    
    List<RecipeIngredient> findByIngredient(Ingredient ingredient);
    
    void deleteByRecipe(Recipe recipe);
    
    @Query("SELECT DISTINCT ri.recipe FROM RecipeIngredient ri WHERE ri.ingredient.id IN :ingredientIds")
    List<Recipe> findRecipesByIngredientIds(@Param("ingredientIds") List<Long> ingredientIds);
    
    @Query("SELECT ri.recipe FROM RecipeIngredient ri WHERE ri.ingredient.id = :ingredientId")
    List<Recipe> findRecipesByIngredientId(@Param("ingredientId") Long ingredientId);
    
    @Query("SELECT COUNT(DISTINCT ri1.ingredient.id) FROM RecipeIngredient ri1 " +
           "WHERE ri1.recipe = :recipe AND ri1.ingredient.id IN " +
           "(SELECT ri2.ingredient.id FROM RecipeIngredient ri2 WHERE ri2.recipe.id = :otherRecipeId)")
    int countCommonIngredients(@Param("recipe") Recipe recipe, @Param("otherRecipeId") Long otherRecipeId);
} 
