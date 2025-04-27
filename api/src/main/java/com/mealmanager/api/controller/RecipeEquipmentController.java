package com.mealmanager.api.controller;

import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.Equipment;
import com.mealmanager.api.model.RecipeEquipment;
import com.mealmanager.api.model.SysUser;
import com.mealmanager.api.repository.RecipeRepository;
import com.mealmanager.api.repository.EquipmentRepository;
import com.mealmanager.api.repository.RecipeEquipmentRepository;
import com.mealmanager.api.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class RecipeEquipmentController {

    private final Logger logger = LoggerFactory.getLogger(RecipeEquipmentController.class);

    @Autowired
    private RecipeEquipmentRepository recipeEquipmentRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get all equipment for a recipe
     * 
     * @param recipeId Recipe ID
     * @return List of recipe equipment
     */
    @GetMapping("/recipes/{recipeId}/equipment")
    public ResponseEntity<List<RecipeEquipment>> getRecipeEquipment(@PathVariable("recipeId") long recipeId) {
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
                
                List<RecipeEquipment> equipment = recipeEquipmentRepository.findByRecipe(recipe);
                
                if (equipment.isEmpty()) {
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                }
                
                return new ResponseEntity<>(equipment, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error retrieving recipe equipment", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Add equipment to a recipe
     * 
     * @param recipeId Recipe ID
     * @param recipeEquipment Recipe equipment to add
     * @return Added recipe equipment
     */
    @PostMapping("/recipes/{recipeId}/equipment")
    public ResponseEntity<RecipeEquipment> addEquipmentToRecipe(
            @PathVariable("recipeId") long recipeId,
            @RequestBody RecipeEquipment recipeEquipment) {
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
                
                // Validate equipment exists
                Long equipmentId = recipeEquipment.getEquipment() != null ? 
                    recipeEquipment.getEquipment().getId() : null;
                
                if (equipmentId == null) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                Optional<Equipment> equipmentData = equipmentRepository.findById(equipmentId);
                if (!equipmentData.isPresent()) {
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                }
                
                // Check if the equipment is already added to the recipe
                List<RecipeEquipment> existingEquipment = recipeEquipmentRepository.findByRecipe(recipe);
                boolean alreadyExists = existingEquipment.stream()
                    .anyMatch(re -> re.getEquipment().getId() != null && 
                                    re.getEquipment().getId() == equipmentId);
                
                if (alreadyExists) {
                    return new ResponseEntity<>(HttpStatus.CONFLICT);
                }
                
                // Create the recipe equipment
                RecipeEquipment newRecipeEquipment = new RecipeEquipment(
                    recipe,
                    equipmentData.get()
                );
                
                RecipeEquipment savedRecipeEquipment = recipeEquipmentRepository.save(newRecipeEquipment);
                return new ResponseEntity<>(savedRecipeEquipment, HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error adding equipment to recipe", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a recipe equipment
     * 
     * @param recipeId Recipe ID
     * @param id Recipe equipment ID
     * @return Status
     */
    @DeleteMapping("/recipes/{recipeId}/equipment/{id}")
    public ResponseEntity<HttpStatus> deleteRecipeEquipment(
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
                
                Optional<RecipeEquipment> recipeEquipmentData = recipeEquipmentRepository.findById(id);
                
                if (recipeEquipmentData.isPresent()) {
                    RecipeEquipment recipeEquipment = recipeEquipmentData.get();
                    
                    // Verify the recipe equipment belongs to the specified recipe
                    if (recipeEquipment.getRecipe().getId() != recipeId) {
                        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
                    }
                    
                    recipeEquipmentRepository.deleteById(id);
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                } else {
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error deleting recipe equipment", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Find recipes by equipment
     * 
     * @param equipmentId Equipment ID
     * @return List of recipes that use the equipment
     */
    @GetMapping("/equipment/{equipmentId}/recipes")
    public ResponseEntity<List<Recipe>> findRecipesByEquipment(@PathVariable("equipmentId") long equipmentId) {
        try {
            if (!securityUtils.isAuthenticated()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            SysUser currentUser = securityUtils.getCurrentUser();
            if (currentUser == null) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            Optional<Equipment> equipmentData = equipmentRepository.findById(equipmentId);
            
            if (equipmentData.isPresent()) {
                List<Recipe> recipes = recipeEquipmentRepository.findRecipesByEquipmentId(equipmentId);
                
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
            logger.error("Error finding recipes by equipment", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 
