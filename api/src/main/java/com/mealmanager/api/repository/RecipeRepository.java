package com.mealmanager.api.repository;

import com.mealmanager.api.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByNameContaining(String name);
    List<Recipe> findByDisabled(Boolean disabled);
}
