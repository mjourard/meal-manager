import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipesDataService from '../../services/recipes.service';
import { CreateRecipe } from '../../models/recipe';

const AddRecipe: React.FC = () => {
  const initialRecipeState: CreateRecipe = {
    name: '',
    description: '',
    recipeURL: '',
    disabled: false
  };

  const [recipe, setRecipe] = useState<CreateRecipe>(initialRecipeState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batchSubmitted, setBatchSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setRecipe({ ...recipe, [name]: checked });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setCsvFile(event.target.files[0]);
    }
  };

  const saveRecipe = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Recipe is already properly typed as CreateRecipe
      await RecipesDataService.create(recipe);
      setSubmitted(true);
      setMessage('Recipe was created successfully!');
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError('Failed to create recipe');
    }
  };

  const newRecipe = () => {
    setRecipe(initialRecipeState);
    setSubmitted(false);
    setBatchSubmitted(false);
    setError(null);
    setMessage('');
  };

  const uploadCSV = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      setError('Please select a CSV file first');
      return;
    }

    try {
      // Read the CSV file content
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target && event.target.result) {
          const csvContent = event.target.result as string;
          
          try {
            await RecipesDataService.multiCreate(csvContent);
            setBatchSubmitted(true);
            setMessage('Recipes were uploaded successfully!');
          } catch (error) {
            console.error('Error creating recipes from CSV:', error);
            setError('Failed to create recipes from CSV');
          }
        }
      };
      
      reader.onerror = () => {
        setError('Error reading the CSV file');
      };
      
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setError('Failed to upload CSV');
    }
  };

  return (
    <div className="add-recipe-container">
      {submitted || batchSubmitted ? (
        <div>
          <h4>Recipe{batchSubmitted ? 's were' : ' was'} submitted successfully!</h4>
          <button className="btn btn-success" onClick={newRecipe}>
            Add Another
          </button>
          <button 
            className="btn btn-primary ms-2" 
            onClick={() => navigate('/recipes')}
          >
            Back to Recipes
          </button>
        </div>
      ) : (
        <div>
          <div className="single-recipe-form mb-5">
            <h4>Add Recipe</h4>
            <form onSubmit={saveRecipe}>
              <div className="form-group mb-3">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
                  name="name"
                  value={recipe.name}
                  onChange={handleInputChange}
              required
            />
          </div>

              <div className="form-group mb-3">
            <label htmlFor="description">Description</label>
                <textarea
              className="form-control"
              id="description"
                  name="description"
                  value={recipe.description || ''}
              onChange={handleInputChange}
            />
          </div>

              <div className="form-group mb-3">
                <label htmlFor="recipeURL">Recipe URL</label>
            <input
              type="text"
              className="form-control"
                  id="recipeURL"
                  name="recipeURL"
                  value={recipe.recipeURL || ''}
              onChange={handleInputChange}
            />
          </div>

              <div className="form-group mb-3">
                <div className="form-check">
            <input
                    type="checkbox"
                    className="form-check-input"
                    id="disabled"
                    name="disabled"
                    checked={recipe.disabled}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label" htmlFor="disabled">
                    Disabled
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-success">
                Submit
              </button>
            </form>
          </div>

          <div className="csv-upload-form">
            <h4>Bulk Add Recipes from CSV</h4>
            <form onSubmit={uploadCSV}>
              <div className="form-group mb-3">
                <label htmlFor="csvFile">CSV File</label>
            <input
                  type="file"
              className="form-control"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleFileChange}
              required
                />
                <small className="form-text text-muted">
                  CSV format: Name, Description, URL, Disabled (true/false)
                </small>
              </div>

              <button type="submit" className="btn btn-success">
                Upload
              </button>
            </form>
          </div>

          {message && (
            <div className="alert alert-success mt-3">
              {message}
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger mt-3">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddRecipe;