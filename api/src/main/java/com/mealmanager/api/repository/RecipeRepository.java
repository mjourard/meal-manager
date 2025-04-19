package com.mealmanager.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mealmanager.api.model.Recipe;

/**
 * Repository interface for Recipe entities.
 * Provides methods for accessing recipe data from the database.
 */
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
  
  /**
   * Finds recipes whose names contain the given string.
   *
   * @param name The name substring to search for
   * @return A list of matching recipes
   */
  List<Recipe> findByNameContaining(String name);
  
  /**
   * Finds recipes by their disabled status.
   *
   * @param disabled Whether to find disabled or enabled recipes
   * @return A list of recipes matching the disabled status
   */
  List<Recipe> findByDisabled(Boolean disabled);
}
