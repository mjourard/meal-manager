import React, { useState, useEffect, useCallback } from "react";
import RecipesDataService from "../../services/recipes.service";
import RecipesList from "../recipes-list.component";
import { Recipe } from "../../models/recipe";

const DisplayRecipes: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const retrieveRecipes = useCallback(async () => {
            const recipes = await RecipesDataService.getAll();
            setRecipes(recipes);
    }, []);

    const refreshList = useCallback(() => {
        retrieveRecipes();
    }, [retrieveRecipes]);

    const disableRecipe = useCallback(async (recipe: Recipe) => {
        await RecipesDataService.disable(recipe.id);
        refreshList();    
    }, [refreshList]);

    const removeAllRecipes = useCallback(async () => {
        await RecipesDataService.deleteAll();
        refreshList();
    }, [refreshList]);

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
