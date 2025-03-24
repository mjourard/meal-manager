import React, { useState, useEffect, useCallback } from "react";
import { useRecipesService } from "../../services/recipes.service";
import RecipesList from "../recipes-list.component";
import { Recipe } from "../../models/recipe";

const DisplayRecipes: React.FC = () => {
    const recipesService = useRecipesService();
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const retrieveRecipes = useCallback(async () => {
            const recipes = await recipesService.getAll();
            setRecipes(recipes);
    }, [recipesService]);

    const refreshList = useCallback(() => {
        retrieveRecipes();
    }, [retrieveRecipes]);

    const disableRecipe = useCallback(async (recipe: Recipe) => {
        await recipesService.disable(recipe.id);
        refreshList();    
    }, [refreshList, recipesService]);

    const removeAllRecipes = useCallback(async () => {
        await recipesService.deleteAll();
        refreshList();
    }, [refreshList, recipesService]);

    useEffect(() => {
        retrieveRecipes();
    }, [retrieveRecipes]);

    return (
        <div className="list row">
            <div className="col-md-12">
                <h4>Recipes List</h4>
                <RecipesList
                    recipes={recipes}
                    removeRecipe={disableRecipe}
                />
                <button
                    className="m-3 btn btn-sm btn-danger"
                    onClick={removeAllRecipes}
                >
                    Remove All
                </button>
            </div>
        </div>
    );
};

export default DisplayRecipes;
