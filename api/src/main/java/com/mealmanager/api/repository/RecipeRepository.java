package com.mealmanager.api.repository;

import com.mealmanager.api.model.Recipe;
import com.mealmanager.api.model.SysUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Recipe entities.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
  
    /**
     * Finds recipes whose names contain the given string.
     *
     * @param name The name substring to search for
     * @return A list of matching recipes
     */
    List<Recipe> findByNameContaining(String name);
    
    /**
     * Finds recipes whose names contain the given string (case insensitive).
     *
     * @param name The name substring to search for
     * @return A list of matching recipes
     */
    List<Recipe> findByNameContainingIgnoreCase(String name);
  
    /**
     * Finds recipes by their disabled status.
     *
     * @param disabled Whether to find disabled or enabled recipes
     * @return A list of recipes matching the disabled status
     */
    List<Recipe> findByDisabled(Boolean disabled);
    
    /**
     * Finds recipes by owner.
     *
     * @param owner The recipe owner
     * @return A list of recipes owned by the specified user
     */
    List<Recipe> findByOwner(SysUser owner);
    
    /**
     * Finds paginated recipes by owner.
     *
     * @param owner The recipe owner
     * @param pageable Pagination information
     * @return A page of recipes owned by the specified user
     */
    Page<Recipe> findByOwner(SysUser owner, Pageable pageable);
    
    /**
     * Finds recipes by owner and disabled status.
     *
     * @param owner The recipe owner
     * @param disabled Whether to find disabled or enabled recipes
     * @return A list of recipes owned by the specified user with the given disabled status
     */
    List<Recipe> findByOwnerAndDisabled(SysUser owner, Boolean disabled);
    
    /**
     * Finds recipes by owner and private status.
     *
     * @param owner The recipe owner
     * @param isPrivate Whether to find private or public recipes
     * @return A list of recipes owned by the specified user with the given private status
     */
    List<Recipe> findByOwnerAndIsPrivate(SysUser owner, Boolean isPrivate);
    
    /**
     * Finds recipes belonging to the specified owner or public recipes.
     *
     * @param owner The recipe owner
     * @param pageable Pagination information
     * @return A page of recipes owned by the specified user or public recipes
     */
    @Query("SELECT r FROM Recipe r WHERE r.owner = :owner OR r.isPrivate = false")
    Page<Recipe> findByOwnerOrPublic(@Param("owner") SysUser owner, Pageable pageable);
    
    /**
     * Finds recipes by name containing the provided string, belonging to the specified owner or public.
     *
     * @param owner The recipe owner
     * @param name The name substring to search for
     * @param pageable Pagination information
     * @return A page of recipes owned by the specified user or public recipes matching the name
     */
    @Query("SELECT r FROM Recipe r WHERE (r.owner = :owner OR r.isPrivate = false) AND LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Recipe> findByOwnerOrPublic(@Param("owner") SysUser owner, @Param("name") String name, Pageable pageable);
    
    /**
     * Finds recipes by dietary preferences.
     *
     * @param isVegetarian Whether recipes should be vegetarian
     * @param isVegan Whether recipes should be vegan
     * @param isDairyFree Whether recipes should be dairy-free
     * @param isNutFree Whether recipes should be nut-free
     * @return A list of recipes matching the dietary preferences
     */
    @Query("SELECT r FROM Recipe r WHERE " +
           "(:isVegetarian = false OR r.vegetarian = true) AND " +
           "(:isVegan = false OR r.vegan = true) AND " +
           "(:isDairyFree = false OR r.dairyFree = true) AND " +
           "(:isNutFree = false OR r.nutFree = true)")
    List<Recipe> findByDietaryPreferences(
        @Param("isVegetarian") boolean isVegetarian,
        @Param("isVegan") boolean isVegan,
        @Param("isDairyFree") boolean isDairyFree,
        @Param("isNutFree") boolean isNutFree
    );
    
    /**
     * Finds recipes by owner and dietary preferences.
     *
     * @param owner The recipe owner
     * @param isVegetarian Whether recipes should be vegetarian
     * @param isVegan Whether recipes should be vegan
     * @param isDairyFree Whether recipes should be dairy-free
     * @param isNutFree Whether recipes should be nut-free
     * @return A list of recipes owned by the specified user and matching the dietary preferences
     */
    @Query("SELECT r FROM Recipe r WHERE r.owner = :owner AND " +
           "(:isVegetarian = false OR r.vegetarian = true) AND " +
           "(:isVegan = false OR r.vegan = true) AND " +
           "(:isDairyFree = false OR r.dairyFree = true) AND " +
           "(:isNutFree = false OR r.nutFree = true)")
    List<Recipe> findByOwnerAndDietaryPreferences(
        @Param("owner") SysUser owner,
        @Param("isVegetarian") boolean isVegetarian,
        @Param("isVegan") boolean isVegan,
        @Param("isDairyFree") boolean isDairyFree,
        @Param("isNutFree") boolean isNutFree
    );
    
    /**
     * Finds public recipes matching dietary preferences.
     *
     * @param isVegetarian Whether recipes should be vegetarian
     * @param isVegan Whether recipes should be vegan
     * @param isDairyFree Whether recipes should be dairy-free
     * @param isNutFree Whether recipes should be nut-free
     * @return A list of public recipes matching the dietary preferences
     */
    @Query("SELECT r FROM Recipe r WHERE r.isPrivate = false AND " +
           "(:isVegetarian = false OR r.vegetarian = true) AND " +
           "(:isVegan = false OR r.vegan = true) AND " +
           "(:isDairyFree = false OR r.dairyFree = true) AND " +
           "(:isNutFree = false OR r.nutFree = true)")
    List<Recipe> findPublicByDietaryPreferences(
        @Param("isVegetarian") boolean isVegetarian,
        @Param("isVegan") boolean isVegan,
        @Param("isDairyFree") boolean isDairyFree,
        @Param("isNutFree") boolean isNutFree
    );
    
    /**
     * Finds all public recipes.
     *
     * @return A list of all public recipes
     */
    List<Recipe> findByIsPrivateFalseAndDisabledFalse();
    
    /**
     * Finds all recipes with cook time less than or equal to specified minutes.
     *
     * @param minutes Maximum cook time in minutes
     * @return A list of recipes with cook time less than or equal to specified minutes
     */
    List<Recipe> findByCookTimeMinutesLessThanEqual(Integer minutes);
    
    /**
     * Finds all recipes with prep time less than or equal to specified minutes.
     *
     * @param minutes Maximum prep time in minutes
     * @return A list of recipes with prep time less than or equal to specified minutes
     */
    List<Recipe> findByPrepTimeMinutesLessThanEqual(Integer minutes);
    
    /**
     * Finds all recipes with total time (prep + cook) less than or equal to specified minutes.
     *
     * @param minutes Maximum total time in minutes
     * @return A list of recipes with total time less than or equal to specified minutes
     */
    @Query("SELECT r FROM Recipe r WHERE (r.prepTimeMinutes + r.cookTimeMinutes) <= :minutes")
    List<Recipe> findByTotalTimeLessThanEqual(@Param("minutes") Integer minutes);
}
