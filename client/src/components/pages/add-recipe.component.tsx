import React, { useState } from 'react';
// TODO: Migrate the recipe service to TypeScript
// For now, we'll import from the JS file
import RecipeDataService from '../../services/recipes.service';

// Define interfaces for the recipe data
interface RecipeData {
  id: number | null;
  name: string;
  description: string;
  ingredients: string;
  instructions: string;
  servings: number;
  published: boolean;
}

interface RecipeFormState extends RecipeData {
  submitted: boolean;
}

const AddRecipe: React.FC = () => {
  // Convert class state to useState hook
  const [formState, setFormState] = useState<RecipeFormState>({
    id: null,
    name: '',
    description: '',
    ingredients: '',
    instructions: '',
    servings: 1,
    published: false,
    submitted: false
  });

  // Convert class methods to regular functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: name === 'servings' ? Number(value) : value
    }));
  };

  const saveRecipe = async () => {
    const data: Omit<RecipeData, 'id' | 'published'> = {
      name: formState.name,
      description: formState.description,
      ingredients: formState.ingredients,
      instructions: formState.instructions,
      servings: formState.servings
    };

    try {
      const response = await RecipeDataService.create(data);
      setFormState({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        ingredients: response.data.ingredients,
        instructions: response.data.instructions,
        servings: response.data.servings,
        published: response.data.published,
        submitted: true
      });
      console.log(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const newRecipe = () => {
    setFormState({
      id: null,
      name: '',
      description: '',
      ingredients: '',
      instructions: '',
      servings: 1,
      published: false,
      submitted: false
    });
  };

  return (
    <div className="submit-form">
      {formState.submitted ? (
        <div>
          <h4>You submitted successfully!</h4>
          <button className="btn btn-success" onClick={newRecipe}>
            Add
          </button>
        </div>
      ) : (
        <div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              required
              value={formState.name}
              onChange={handleInputChange}
              name="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              className="form-control"
              id="description"
              required
              value={formState.description}
              onChange={handleInputChange}
              name="description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredients</label>
            <input
              type="text"
              className="form-control"
              id="ingredients"
              required
              value={formState.ingredients}
              onChange={handleInputChange}
              name="ingredients"
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions</label>
            <input
              type="text"
              className="form-control"
              id="instructions"
              required
              value={formState.instructions}
              onChange={handleInputChange}
              name="instructions"
            />
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings</label>
            <input
              type="number"
              className="form-control"
              id="servings"
              required
              value={formState.servings}
              onChange={handleInputChange}
              name="servings"
            />
          </div>

          <button onClick={saveRecipe} className="btn btn-success">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default AddRecipe;