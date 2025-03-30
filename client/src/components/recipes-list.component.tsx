import React, { useState } from "react";
import RecipeReadonly from "./recipe-readonly.component";
import {Search, XCircle} from 'react-bootstrap-icons';
import { Recipe } from "../models/recipe";


const RecipesList: React.FC<{ recipes: Recipe[], removeRecipe: (recipe: Recipe, index: number) => void }> = ({ recipes, removeRecipe }) => {
    const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const setActiveRecipe = (recipe: Recipe, index: number) => {
        setCurrentRecipe(recipe);
        setCurrentIndex(index);
    };

    const handleRemoveRecipe = (recipe: Recipe, index: number) => {
        removeRecipe(recipe, index);
    };

    return (
        <div className="list row">
            <div className="col-md-6">
                <ul className="list-group">
                    {recipes && recipes.map((recipe, index) => (
                        <li
                            className={
                                "list-group-item " +
                                (index === currentIndex ? "active" : "")
                            }

                            key={index}
                        >
                            <div className="d-flex justify-content-start align-items-stretch">
                                {recipe.name}
                                <div className="d-flex justify-content-end align-items-center flex-fill border-dark border-1">
                                    <Search onClick={() => setActiveRecipe(recipe, index)} className="ms-2 me-2" role="button"/>
                                    <XCircle onClick={() => handleRemoveRecipe(recipe, index)} className="text-danger ms-2 me-2" role="button"/>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="col-md-6">
                {currentRecipe ? (
                    <RecipeReadonly
                        name={currentRecipe.name}
                        description={currentRecipe.description}
                        id={currentRecipe.id}
                        recipeURL={currentRecipe.recipeURL}
                        disabled={false}
                    />
                ) : (
                    <div>
                        <br />
                        <p>Please select a Recipe...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecipesList;