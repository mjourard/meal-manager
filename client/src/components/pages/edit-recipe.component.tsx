import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipesService } from '../../services/recipes.service';
import { Recipe } from '../../models/recipe';

const EditRecipe: React.FC = () => {
  const initialRecipeState: Recipe = {
    id: 0,
    name: '',
    description: '',
    recipeURL: '',
    disabled: false
  };

  const recipesService = useRecipesService();

  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(initialRecipeState);
  const [message, setMessage] = useState<string>('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getRecipe = useCallback(async (id: number) => {
    try {
      const response = await recipesService.get(id);
      setCurrentRecipe(response);
    } catch (error) {
      console.error('Error retrieving recipe:', error);
      setMessage('Error retrieving recipe');
    }
  }, [recipesService]);

  useEffect(() => {
    if (id) {
      getRecipe(parseInt(id, 10));
    }
  }, [id, getRecipe]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCurrentRecipe({ ...currentRecipe, [name]: value });
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCurrentRecipe({ ...currentRecipe, [name]: checked });
  };

  const updateRecipe = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await recipesService.update(currentRecipe.id, currentRecipe);
      setMessage('The recipe was updated successfully!');
    } catch (error) {
      console.error('Error updating recipe:', error);
      setMessage('Error updating recipe');
    }
  };

  const deleteRecipe = async () => {
    try {
      await recipesService.delete(currentRecipe.id);
      navigate('/recipes');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setMessage('Error deleting recipe');
    }
  };

  return (
    <div className="edit-recipe-container">
      {currentRecipe.id ? (
        <div className="edit-form">
          <h4>Recipe</h4>
          <form onSubmit={updateRecipe}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={currentRecipe.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={currentRecipe.description || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipeURL">Recipe URL</label>
              <input
                type="text"
                className="form-control"
                id="recipeURL"
                name="recipeURL"
                value={currentRecipe.recipeURL || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="disabled"
                  name="disabled"
                  checked={currentRecipe.disabled}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="disabled">
                  Disabled
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Update
            </button>
            <button
              type="button" 
              className="btn btn-danger ms-2"
              onClick={deleteRecipe}
            >
              Delete
            </button>
          </form>

          <p className="mt-3">{message}</p>
        </div>
      ) : (
        <div>
          <p>Please select a Recipe...</p>
        </div>
      )}
    </div>
  );
};

export default EditRecipe; 