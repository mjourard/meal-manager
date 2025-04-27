package com.mealmanager.api.controller;

import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.RecipeRepository;
import com.mealmanager.api.repository.SysUserRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RecipeController {

    private final Logger logger = LoggerFactory.getLogger(RecipeController.class);

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private SysUserRepository sysUserRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all recipes with filtering and pagination
     *
     * @param title Optional title filter
     * @param page Page number
     * @param size Page size
     * @param sort Sort field
     * @return List of recipes
     */
    @GetMapping("/recipes")
    public ResponseEntity<Map<String, Object>> getAllRecipes(
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort) {

        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Create Pageable object for pagination
            Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
            Page<Recipe> recipePage;

            // Apply filters
            if (title != null && !title.isEmpty()) {
                recipePage = recipeRepository.findByOwnerOrPublic(currentUser, title, pageable);
            } else {
                recipePage = recipeRepository.findByOwnerOrPublic(currentUser, pageable);
            }

            // Extract content and create response
            Map<String, Object> response = new HashMap<>();
            response.put("recipes", recipePage.getContent());
            response.put("currentPage", recipePage.getNumber());
            response.put("totalItems", recipePage.getTotalElements());
            response.put("totalPages", recipePage.getTotalPages());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving recipes", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a recipe by ID
     *
     * @param id Recipe ID
     * @return Recipe
     */
    @GetMapping("/recipes/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable("id") long id) {
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(id);

            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the recipe is private and the current user is not the owner
                if (recipe.isPrivate() && (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId())) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                return new ResponseEntity<>(recipe, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error retrieving recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new recipe
     *
     * @param recipe Recipe to create
     * @return Created recipe
     */
    @PostMapping("/recipes")
    public ResponseEntity<Recipe> createRecipe(@RequestBody Recipe recipe) {
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Set owner
            recipe.setOwner(currentUser);
            
            // Set defaults
            // Since disabled is a primitive boolean, it defaults to false already
            // No need for null check

            Recipe savedRecipe = recipeRepository.save(recipe);
            return new ResponseEntity<>(savedRecipe, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing recipe
     *
     * @param id Recipe ID
     * @param recipe Recipe data to update
     * @return Updated recipe
     */
    @PutMapping("/recipes/{id}")
    public ResponseEntity<Recipe> updateRecipe(
            @PathVariable("id") long id, 
            @RequestBody Recipe recipe) {
        
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(id);

            if (recipeData.isPresent()) {
                Recipe existingRecipe = recipeData.get();
                
                // Check if the current user is the owner
                if (existingRecipe.getOwner() == null || existingRecipe.getOwner().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                // Update fields
                if (recipe.getName() != null) {
                    existingRecipe.setName(recipe.getName());
                }
                
                if (recipe.getDescription() != null) {
                    existingRecipe.setDescription(recipe.getDescription());
                }
                
                if (recipe.getInstructions() != null) {
                    existingRecipe.setInstructions(recipe.getInstructions());
                }
                
                if (recipe.getPortionCount() != null) {
                    existingRecipe.setPortionCount(recipe.getPortionCount());
                }
                
                if (recipe.getPrepTimeMinutes() != null) {
                    existingRecipe.setPrepTimeMinutes(recipe.getPrepTimeMinutes());
                }
                
                if (recipe.getCookTimeMinutes() != null) {
                    existingRecipe.setCookTimeMinutes(recipe.getCookTimeMinutes());
                }
                
                // These are booleans, not Booleans, so no null check needed
                existingRecipe.setVegetarian(recipe.isVegetarian());
                existingRecipe.setVegan(recipe.isVegan());
                existingRecipe.setDairyFree(recipe.isDairyFree());
                existingRecipe.setNutFree(recipe.isNutFree());
                existingRecipe.setPrivate(recipe.isPrivate());
                existingRecipe.setDisabled(recipe.getDisabled());
                
                if (recipe.getIngredients() != null) {
                    existingRecipe.setIngredients(recipe.getIngredients());
                }
                
                return new ResponseEntity<>(recipeRepository.save(existingRecipe), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error updating recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a recipe
     *
     * @param id Recipe ID
     * @return Status
     */
    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<HttpStatus> deleteRecipe(@PathVariable("id") long id) {
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Recipe> recipeData = recipeRepository.findById(id);
            
            if (recipeData.isPresent()) {
                Recipe recipe = recipeData.get();
                
                // Check if the current user is the owner
                if (recipe.getOwner() == null || recipe.getOwner().getId() != currentUser.getId()) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                
                recipeRepository.deleteById(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error deleting recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get own recipes
     *
     * @return List of own recipes
     */
    @GetMapping("/recipes/my")
    public ResponseEntity<List<Recipe>> getMyRecipes() {
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Recipe> recipes = recipeRepository.findByOwner(currentUser);
            
            if (recipes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving own recipes", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get public recipes
     *
     * @return List of public recipes
     */
    @GetMapping("/recipes/public")
    public ResponseEntity<List<Recipe>> getPublicRecipes() {
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Recipe> recipes = recipeRepository.findByIsPrivateFalseAndDisabledFalse();
            
            if (recipes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving public recipes", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search for recipes by dietary preferences
     *
     * @param isVegetarian Filter for vegetarian recipes
     * @param isVegan Filter for vegan recipes
     * @param isDairyFree Filter for dairy-free recipes
     * @param isNutFree Filter for nut-free recipes
     * @return List of matching recipes
     */
    @GetMapping("/recipes/dietary")
    public ResponseEntity<List<Recipe>> findByDietaryPreferences(
            @RequestParam(required = false, defaultValue = "false") boolean isVegetarian,
            @RequestParam(required = false, defaultValue = "false") boolean isVegan,
            @RequestParam(required = false, defaultValue = "false") boolean isDairyFree,
            @RequestParam(required = false, defaultValue = "false") boolean isNutFree) {
        
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Recipe> recipes = recipeRepository.findByOwnerAndDietaryPreferences(
                    currentUser, isVegetarian, isVegan, isDairyFree, isNutFree);
            
            List<Recipe> publicRecipes = recipeRepository.findPublicByDietaryPreferences(
                    isVegetarian, isVegan, isDairyFree, isNutFree);
            
            // Combine both lists but avoid duplicates
            for (Recipe recipe : publicRecipes) {
                if (!recipes.contains(recipe)) {
                    recipes.add(recipe);
                }
            }
            
            if (recipes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(recipes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching recipes by dietary preferences", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search for recipes by time limits
     *
     * @param maxTotalTime Maximum total time (prep + cook) in minutes
     * @return List of matching recipes
     */
    @GetMapping("/recipes/quick")
    public ResponseEntity<List<Recipe>> findQuickRecipes(
            @RequestParam(required = true) Integer maxTotalTime) {
        
        try {
            // Check if user is authenticated
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            List<Recipe> recipes = recipeRepository.findByTotalTimeLessThanEqual(maxTotalTime);
            
            // Filter recipes to include only user's own recipes and public recipes
            List<Recipe> filteredRecipes = new ArrayList<>();
            for (Recipe recipe : recipes) {
                if (!recipe.isPrivate() || (recipe.getOwner() != null && recipe.getOwner().getId() == currentUser.getId())) {
                    filteredRecipes.add(recipe);
                }
            }
            
            if (filteredRecipes.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            
            return new ResponseEntity<>(filteredRecipes, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error searching quick recipes", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
