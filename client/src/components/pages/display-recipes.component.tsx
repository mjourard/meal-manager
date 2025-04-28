import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRecipesService } from "../../services/recipes.service";
import RecipesList from "../recipes-list.component";
import { Recipe } from "../../models/recipe";

/**
 * DisplayRecipes component shows the list of recipes and allows interaction with them.
 * 
 * Implementation notes:
 * - Uses a useRef to track if recipes have been loaded to prevent continuous API calls
 *   when no recipes exist (avoids infinite loading/flickering)
 * - Uses request tracking to prevent duplicate API calls
 * - Properly tracks component mounting state
 */
const DisplayRecipes: React.FC = () => {
    // Refs to prevent unnecessary API calls
    const recipesLoaded = useRef(false);
    const requestInProgress = useRef(false);
    const isMounted = useRef(false);
    // Stabilize the service reference
    const recipesServiceRef = useRef(useRecipesService());
    
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const retrieveRecipes = useCallback(async () => {
        // Skip if already loaded or request in progress or component not mounted
        if (recipesLoaded.current || requestInProgress.current || !isMounted.current) return;
        
        // Set flag to avoid concurrent requests
        requestInProgress.current = true;
        
        try {
            setLoading(true);
            const recipes = await recipesServiceRef.current.getAll();
            
            // Only update state if component is still mounted
            if (isMounted.current) {
                setRecipes(recipes);
                recipesLoaded.current = true;
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            
            // Only update state if component is still mounted
            if (isMounted.current) {
                setError('Failed to load recipes');
                recipesLoaded.current = true;
                setLoading(false);
            }
        } finally {
            requestInProgress.current = false;
        }
    }, []);

    const refreshList = useCallback(() => {
        // Reset the loaded flag to allow a new request
        recipesLoaded.current = false;
        retrieveRecipes();
    }, [retrieveRecipes]);

    const disableRecipe = useCallback(async (recipe: Recipe) => {
        try {
            await recipesServiceRef.current.update(recipe.id, { ...recipe, disabled: !recipe.disabled });
            refreshList();
        } catch (error) {
            console.error('Error toggling recipe disabled state:', error);
            if (isMounted.current) {
                setError('Failed to update recipe');
            }
        }
    }, [refreshList]);

    const removeAllRecipes = useCallback(async () => {
        try {
            await recipesServiceRef.current.deleteAll();
            refreshList();
        } catch (error) {
            console.error("Error removing all recipes:", error);
            if (isMounted.current) {
                setError('Failed to remove all recipes');
            }
        }
    }, [refreshList]);

    useEffect(() => {
        // Set mounted flag
        isMounted.current = true;
        
        // Call retrieveRecipes once
        retrieveRecipes();
        
        // Cleanup: reset mounted flag
        return () => {
            isMounted.current = false;
        };
    }, [retrieveRecipes]);

    return (
        <div className="list row">
            <div className="col-md-12">
                <h4>Recipes List</h4>
                {error && <div className="alert alert-danger">{error}</div>}
                
                {loading && !recipesLoaded.current ? (
                    <div className="d-flex justify-content-center mt-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {recipes.length === 0 ? (
                            <div className="alert alert-info">
                                No recipes found. Add a new recipe to get started.
                            </div>
                        ) : (
                            <RecipesList
                                recipes={recipes}
                                removeRecipe={disableRecipe}
                            />
                        )}
                    </>
                )}
                
                <button
                    className="m-3 btn btn-sm btn-danger"
                    onClick={removeAllRecipes}
                    disabled={loading}
                >
                    Remove All
                </button>
            </div>
        </div>
    );
};

export default DisplayRecipes;
