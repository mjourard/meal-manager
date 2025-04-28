package com.mealmanager.api.controller;

import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.Ingredient;
import com.mealmanager.api.model.RecipeIngredient;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.model.MeasurementUnit;
import com.mealmanager.api.repository.RecipeRepository;
import com.mealmanager.api.repository.IngredientRepository;
import com.mealmanager.api.repository.RecipeIngredientRepository;
import com.mealmanager.api.repository.MeasurementUnitRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RecipeIngredientController {

    private final Logger logger = LoggerFactory.getLogger(RecipeIngredientController.class);

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private MeasurementUnitRepository measurementUnitRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all ingredients for a recipe
     * 
     * @param recipeId Recipe ID
     * @return List of recipe ingredients
     */
    @GetMapping("/recipes/{recipeId}/ingredients")
    public ResponseEntity<List<RecipeIngredient>> getRecipeIngredients(@PathVariable("recipeId") long recipeId) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
            
            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the recipe is private and the current user is not the owner
                if (recipe.isPrivate() && (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId())) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipe(recipe);
                
                if (ingredients.isEmpty()) {
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                }
                
                return new ResponseEntity<>(ingredients, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error retrieving recipe ingredients", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Add an ingredient to a recipe
     * 
     * @param recipeId Recipe ID
     * @param recipeIngredient Recipe ingredient to add
     * @return Added recipe ingredient
     */
    @PostMapping("/recipes/{recipeId}/ingredients")
    public ResponseEntity<RecipeIngredient> addIngredientToRecipe(
            @PathVariable("recipeId") long recipeId,
            @RequestBody RecipeIngredient recipeIngredient) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
            
            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the current user is the owner of the recipe
                if (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                // Validate ingredient exists
                Long ingredientId = recipeIngredient.getIngredient() != null ? 
                    recipeIngredient.getIngredient().getId() : null;
                
                if (ingredientId == null) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                Optional<Ingredient> ingredientData = ingredientRepository.findById(ingredientId);
                if (!ingredientData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate measurement unit exists
                Long unitId = recipeIngredient.getMeasurementUnit() != null ? 
                    recipeIngredient.getMeasurementUnit().getId() : null;
                
                if (unitId == null) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                Optional<MeasurementUnit> unitData = measurementUnitRepository.findById(unitId);
                if (!unitData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Validate quantity is positive
                if (recipeIngredient.getQuantity() == null || 
                    recipeIngredient.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Get display order
                Integer displayOrder = recipeIngredient.getDisplayOrder();
                if (displayOrder == null) {
                    // Find the highest existing display order and add 1
                    List<RecipeIngredient> existingIngredients = recipeIngredientRepository.findByRecipe(recipe);
                    displayOrder = existingIngredients.stream()
                                    .map(RecipeIngredient::getDisplayOrder)
                                    .filter(order -> order != null)
                                    .max(Integer::compareTo)
                                    .orElse(0) + 1;
                }
                
                // Create the recipe ingredient
                RecipeIngredient newRecipeIngredient = new RecipeIngredient(
                    recipe,
                    ingredientData.get(),
                    recipeIngredient.getQuantity(),
                    unitData.get(),
                    displayOrder
                );
                
                if (recipeIngredient.getPreparationNote() != null) {
                    newRecipeIngredient.setPreparationNote(recipeIngredient.getPreparationNote());
                }
                
                RecipeIngredient savedRecipeIngredient = recipeIngredientRepository.save(newRecipeIngredient);
                return new ResponseEntity<>(savedRecipeIngredient, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error adding ingredient to recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update a recipe ingredient
     * 
     * @param recipeId Recipe ID
     * @param id Recipe ingredient ID
     * @param recipeIngredient Recipe ingredient data to update
     * @return Updated recipe ingredient
     */
    @PutMapping("/recipes/{recipeId}/ingredients/{id}")
    public ResponseEntity<RecipeIngredient> updateRecipeIngredient(
            @PathVariable("recipeId") long recipeId,
            @PathVariable("id") long id,
            @RequestBody RecipeIngredient recipeIngredient) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
            
            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the current user is the owner of the recipe
                if (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                Optional<RecipeIngredient> recipeIngredientData = recipeIngredientRepository.findById(id);
                
                if (recipeIngredientData.isPresent()) {
                    RecipeIngredient existingRecipeIngredient = recipeIngredientData.get();
                    
                    // Verify the recipe ingredient belongs to the specified recipe
                    if (existingRecipeIngredient.getRecipe().getId() != recipeId) {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                    
                    // Update ingredient if specified
                    if (recipeIngredient.getIngredient() != null && recipeIngredient.getIngredient().getId() != null) {
                        Optional<Ingredient> ingredientData = ingredientRepository.findById(recipeIngredient.getIngredient().getId());
                        if (ingredientData.isPresent()) {
                            existingRecipeIngredient.setIngredient(ingredientData.get());
                        }
                    }
                    
                    // Update measurement unit if specified
                    if (recipeIngredient.getMeasurementUnit() != null && 
                        recipeIngredient.getMeasurementUnit().getId() != null) {
                        Optional<MeasurementUnit> unitData = measurementUnitRepository
                            .findById(recipeIngredient.getMeasurementUnit().getId());
                        if (unitData.isPresent()) {
                            existingRecipeIngredient.setMeasurementUnit(unitData.get());
                        }
                    }
                    
                    // Update quantity if specified and valid
                    if (recipeIngredient.getQuantity() != null && recipeIngredient.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                        existingRecipeIngredient.setQuantity(recipeIngredient.getQuantity());
                    }
                    
                    // Update preparation note if specified
                    if (recipeIngredient.getPreparationNote() != null) {
                        existingRecipeIngredient.setPreparationNote(recipeIngredient.getPreparationNote());
                    }
                    
                    // Update display order if specified
                    if (recipeIngredient.getDisplayOrder() != null) {
                        existingRecipeIngredient.setDisplayOrder(recipeIngredient.getDisplayOrder());
                    }
                    
                    RecipeIngredient updatedRecipeIngredient = recipeIngredientRepository.save(existingRecipeIngredient);
                    return new ResponseEntity<>(updatedRecipeIngredient, HttpStatus.OK);
                } else {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error updating recipe ingredient", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a recipe ingredient
     * 
     * @param recipeId Recipe ID
     * @param id Recipe ingredient ID
     * @return Status
     */
    @DeleteMapping("/recipes/{recipeId}/ingredients/{id}")
    public ResponseEntity<HttpStatus> deleteRecipeIngredient(
            @PathVariable("recipeId") long recipeId,
            @PathVariable("id") long id) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(recipeId);
            
            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the current user is the owner of the recipe
                if (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                Optional<RecipeIngredient> recipeIngredientData = recipeIngredientRepository.findById(id);
                
                if (recipeIngredientData.isPresent()) {
                    RecipeIngredient recipeIngredient = recipeIngredientData.get();
                    
                    // Verify the recipe ingredient belongs to the specified recipe
                    if (recipeIngredient.getRecipe().getId() != recipeId) {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                    
                    recipeIngredientRepository.deleteById(id);
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                } else {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error deleting recipe ingredient", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Find recipes by ingredient
     * 
     * @param ingredientId Ingredient ID
     * @return List of recipes containing the ingredient
     */
    @GetMapping("/ingredients/{ingredientId}/recipes")
    public ResponseEntity<List<Recipe>> findRecipesByIngredient(@PathVariable("ingredientId") long ingredientId) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Ingredient> ingredientData = ingredientRepository.findById(ingredientId);
            
            if (ingredientData.isPresent()) {
                List<Recipe> recipes = recipeIngredientRepository.findRecipesByIngredientId(ingredientId);
                
                // Filter recipes to only include those that the user has access to
                recipes.removeIf(recipe -> 
                    recipe.isPrivate() && 
                    (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId())
                );
                
                if (recipes.isEmpty()) {
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                }
                
                return new ResponseEntity<>(recipes, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error finding recipes by ingredient", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
