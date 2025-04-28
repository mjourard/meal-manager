import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useRecipesService } from '../../services/recipes.service';
import { Recipe } from '../../models/recipe';

const RecipeSelector: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [searchName, setSearchName] = useState<string>('');
  const recipesService = useRecipesService();

  useEffect(() => {
    retrieveRecipes();
  }, [recipesService]);

  const onChangeSearchName = (e: ChangeEvent<HTMLInputElement>) => {
    const searchName = e.target.value;
    setSearchName(searchName);
  };

  const retrieveRecipes = async () => {
    try {
      const data = await recipesService.getAll();
      setRecipes(data);
    } catch (error) {
      console.error('Error retrieving recipes:', error);
    }
  };

  const refreshList = () => {
    retrieveRecipes();
    setCurrentRecipe(null);
    setCurrentIndex(-1);
  };

  const setActiveRecipe = (recipe: Recipe, index: number) => {
    setCurrentRecipe(recipe);
    setCurrentIndex(index);
  };

  const removeAllRecipes = async () => {
    try {
      await recipesService.deleteAll();
      refreshList();
    } catch (error) {
      console.error('Error removing all recipes:', error);
    }
  };

  const findByName = async () => {
    try {
      const allRecipes = await recipesService.getAll();
      // Filter recipes by name if search term exists
      if (searchName) {
        const filteredRecipes = allRecipes.filter(recipe => 
          recipe.name.toLowerCase().includes(searchName.toLowerCase())
        );
        setRecipes(filteredRecipes);
      } else {
        setRecipes(allRecipes);
      }
    } catch (error) {
      console.error('Error finding recipes:', error);
    }
  };

  return (
    <div className="list row">
      <div className="col-md-8">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name"
            value={searchName}
            onChange={onChangeSearchName}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={findByName}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <h4>Recipes List</h4>

        <ul className="list-group">
          {recipes && recipes.map((recipe, index) => (
            <li
              className={
                "list-group-item " + (index === currentIndex ? "active" : "")
              }
              onClick={() => setActiveRecipe(recipe, index)}
              key={index}
            >
              {recipe.name}
            </li>
          ))}
        </ul>

        <button
          className="btn btn-sm btn-danger mt-3"
          onClick={removeAllRecipes}
        >
          Remove All
        </button>
      </div>
      <div className="col-md-6">
        {currentRecipe ? (
          <div>
            <h4>Recipe</h4>
            <div>
              <label>
                <strong>Name:</strong>
              </label>{" "}
              {currentRecipe.name}
            </div>
            <div>
              <label>
                <strong>Description:</strong>
              </label>{" "}
              {currentRecipe.description}
            </div>
            <div>
              <label>
                <strong>Recipe URL:</strong>
              </label>{" "}
              <a href={currentRecipe.recipeURL} target="_blank" rel="noopener noreferrer">
                {currentRecipe.recipeURL}
              </a>
            </div>
            <div>
              <label>
                <strong>Status:</strong>
              </label>{" "}
              {currentRecipe.disabled ? "Disabled" : "Active"}
            </div>

            <Link
              to={"/recipes/" + currentRecipe.id}
              className="btn btn-warning"
            >
              Edit
            </Link>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on a Recipe...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeSelector; 