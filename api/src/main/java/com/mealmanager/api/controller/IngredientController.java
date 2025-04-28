package com.mealmanager.api.controller;

import com.mealmanager.api.model.Ingredient;
import com.mealmanager.api.repository.IngredientRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class IngredientController {

    private final Logger logger = LoggerFactory.getLogger(IngredientController.class);

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all ingredients
     * 
     * @param name Optional name filter
     * @return List of ingredients
     */
    @GetMapping("/ingredients")
    public ResponseEntity<List<Ingredient>> getAllIngredients(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String foodGroup) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Ingredient> ingredients = new ArrayList<>();

            if (name != null && !name.isEmpty()) {
                ingredients.addAll(ingredientRepository.findByNameContainingIgnoreCase(name));
            } else if (foodGroup != null && !foodGroup.isEmpty()) {
                ingredients.addAll(ingredientRepository.findByFoodGroupIgnoreCase(foodGroup));
            } else {
                ingredients.addAll(ingredientRepository.findAll());
            }

            if (ingredients.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(ingredients, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving ingredients", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get an ingredient by ID
     * 
     * @param id Ingredient ID
     * @return Ingredient
     */
    @GetMapping("/ingredients/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable("id") long id) {
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<Ingredient> ingredientData = ingredientRepository.findById(id);

        if (ingredientData.isPresent()) {
            return new ResponseEntity<>(ingredientData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Create a new ingredient
     * 
     * @param ingredient Ingredient to create
     * @return Created ingredient
     */
    @PostMapping("/ingredients")
    public ResponseEntity<Ingredient> createIngredient(@RequestBody Ingredient ingredient) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Check if ingredient with same name already exists
            Optional<Ingredient> existingIngredient = ingredientRepository.findByNameIgnoreCase(ingredient.getName());
            if (existingIngredient.isPresent()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            // Set creation timestamps
            LocalDateTime now = LocalDateTime.now();
            ingredient.setCreatedAt(now);
            ingredient.setUpdatedAt(now);

            Ingredient savedIngredient = ingredientRepository.save(ingredient);
            return new ResponseEntity<>(savedIngredient, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating ingredient", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing ingredient
     * 
     * @param id Ingredient ID
     * @param ingredient Ingredient data to update
     * @return Updated ingredient
     */
    @PutMapping("/ingredients/{id}")
    public ResponseEntity<Ingredient> updateIngredient(
            @PathVariable("id") long id, 
            @RequestBody Ingredient ingredient) {
        
        if (!securityUtils.isAuthenticated()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Optional<Ingredient> ingredientData = ingredientRepository.findById(id);

        if (ingredientData.isPresent()) {
            Ingredient existingIngredient = ingredientData.get();
            
            // Update fields
            if (ingredient.getName() != null) {
                existingIngredient.setName(ingredient.getName());
            }
            
            if (ingredient.getFoodGroup() != null) {
                existingIngredient.setFoodGroup(ingredient.getFoodGroup());
            }
            
            existingIngredient.setProteinPer100g(ingredient.getProteinPer100g());
            existingIngredient.setFatPer100g(ingredient.getFatPer100g());
            existingIngredient.setCarbsPer100g(ingredient.getCarbsPer100g());
            existingIngredient.setCaloriesPer100g(ingredient.getCaloriesPer100g());
            existingIngredient.setVegetarian(ingredient.isVegetarian());
            existingIngredient.setVegan(ingredient.isVegan());
            existingIngredient.setContainsDairy(ingredient.isContainsDairy());
            existingIngredient.setContainsNuts(ingredient.isContainsNuts());
            
            // Update timestamp
            existingIngredient.setUpdatedAt(LocalDateTime.now());
            
            return new ResponseEntity<>(ingredientRepository.save(existingIngredient), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete an ingredient
     * 
     * @param id Ingredient ID
     * @return Status
     */
    @DeleteMapping("/ingredients/{id}")
    public ResponseEntity<HttpStatus> deleteIngredient(@PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // TODO: Check if ingredient is used in any recipes before allowing deletion

            ingredientRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error deleting ingredient", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search for ingredients by dietary preferences
     * 
     * @param isVegetarian Filter for vegetarian ingredients
     * @param isVegan Filter for vegan ingredients
     * @param isDairyFree Filter for dairy-free ingredients
     * @param isNutFree Filter for nut-free ingredients
     * @return List of matching ingredients
     */
    @GetMapping("/ingredients/dietary")
    public ResponseEntity<List<Ingredient>> findByDietaryRestrictions(
            @RequestParam(required = false, defaultValue = "false") boolean isVegetarian,
            @RequestParam(required = false, defaultValue = "false") boolean isVegan,
            @RequestParam(required = false, defaultValue = "false") boolean isDairyFree,
            @RequestParam(required = false, defaultValue = "false") boolean isNutFree) {
        
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Ingredient> ingredients = ingredientRepository.findByDietaryRestrictions(
                    isVegetarian, isVegan, isDairyFree, isNutFree);

            if (ingredients.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            return new ResponseEntity<>(ingredients, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching ingredients by dietary restrictions", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
