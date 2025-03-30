import React, { useState, useEffect, useCallback } from "react";
import { useRecipesService } from "../../services/recipes.service";
import RecipesList from "../recipes-list.component";
import { Recipe } from "../../models/recipe";

const DisplayRecipes: React.FC = () => {
    const recipesService = useRecipesService();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const retrieveRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const recipes = await recipesService.getAll();
            setRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    }, [recipesService]);

    const refreshList = useCallback(() => {
        retrieveRecipes();
    }, [retrieveRecipes]);

    const disableRecipe = useCallback(async (recipe: Recipe) => {
        try {
            await recipesService.update(recipe.id, { ...recipe, disabled: !recipe.disabled });
            await retrieveRecipes();
        } catch (error) {
            console.error('Error toggling recipe disabled state:', error);
        }
    }, [recipesService, retrieveRecipes]);

    const removeAllRecipes = useCallback(async () => {
        try {
            await recipesService.deleteAll();
            refreshList();
        } catch (error) {
            console.error("Error removing all recipes:", error);
        }
    }, [refreshList, recipesService]);

    // Use useEffect with an empty dependency array to fetch data only once when the component mounts
    useEffect(() => {
        retrieveRecipes();
        // Don't include retrieveRecipes in the dependency array to prevent continuous calls
        // We only want to fetch recipes once when the component mounts
    }, []);

    return (
        <div className="list row">
            <div className="col-md-12">
                <h4>Recipes List</h4>
                {loading ? (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <RecipesList
                        recipes={recipes}
                        removeRecipe={disableRecipe}
                    />
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
