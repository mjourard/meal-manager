package com.mealmanager.api.repository;

import com.mealmanager.api.model.Equipment;
import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.RecipeEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeEquipmentRepository extends JpaRepository<RecipeEquipment, Long> {
    
    List<RecipeEquipment> findByRecipe(Recipe recipe);
    
    List<RecipeEquipment> findByEquipment(Equipment equipment);
    
    void deleteByRecipe(Recipe recipe);
    
    @Query("SELECT DISTINCT re.recipe FROM RecipeEquipment re WHERE re.equipment.id IN :equipmentIds")
    List<Recipe> findRecipesByEquipmentIds(@Param("equipmentIds") List<Long> equipmentIds);
    
    @Query("SELECT re.recipe FROM RecipeEquipment re WHERE re.equipment.id = :equipmentId")
    List<Recipe> findRecipesByEquipmentId(@Param("equipmentId") Long equipmentId);
} 
