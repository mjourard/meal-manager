package com.mealmanager.api.repository;

import com.mealmanager.api.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByNameIgnoreCase(String name);

    List<Ingredient> findByNameContainingIgnoreCase(String name);

    @Query("SELECT i FROM Ingredient i WHERE " +
            "(:isVegetarian = false OR i.vegetarian = true) AND " +
            "(:isVegan = false OR i.vegan = true) AND " +
            "(:isDairyFree = false OR i.containsDairy = false) AND " +
            "(:isNutFree = false OR i.containsNuts = false)")
    List<Ingredient> findByDietaryRestrictions(
            @Param("isVegetarian") boolean isVegetarian,
            @Param("isVegan") boolean isVegan,
            @Param("isDairyFree") boolean isDairyFree,
            @Param("isNutFree") boolean isNutFree);

    List<Ingredient> findByFoodGroupIgnoreCase(String foodGroup);
}
