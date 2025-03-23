import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipesDataService from '../../services/recipes.service';
import { CreateRecipe } from '../../models/recipe';
import { InfoCircle, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

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
  
  // State for expanded field descriptions
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({
    name: false,
    description: false,
    recipeURL: false,
    disabled: false,
    csvFile: false
  });
  
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

  const toggleFieldDescription = (field: string) => {
    setExpandedFields({
      ...expandedFields,
      [field]: !expandedFields[field]
    });
  };

  const saveRecipe = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
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
              <div className="mb-3">
                <label htmlFor="name" className="form-label fw-bold text-start d-block">
                  Recipe Name
                  <span 
                    className="ms-2 text-secondary" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFieldDescription('name')}
                  >
                    <InfoCircle className="me-1" />
                    {expandedFields.name ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={recipe.name}
                  onChange={handleInputChange}
                  required
                />
                {expandedFields.name && (
                  <div className="form-text mt-2">
                    Enter the full name of the recipe. This will be displayed in the recipe list and used for searching.
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label fw-bold text-start d-block">
                  Description
                  <span 
                    className="ms-2 text-secondary" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFieldDescription('description')}
                  >
                    <InfoCircle className="me-1" />
                    {expandedFields.description ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={recipe.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                />
                {expandedFields.description && (
                  <div className="form-text mt-2">
                    Provide a brief description of the recipe, including key ingredients or special preparation notes.
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="recipeURL" className="form-label fw-bold text-start d-block">
                  Recipe URL
                  <span 
                    className="ms-2 text-secondary" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFieldDescription('recipeURL')}
                  >
                    <InfoCircle className="me-1" />
                    {expandedFields.recipeURL ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="recipeURL"
                  name="recipeURL"
                  value={recipe.recipeURL || ''}
                  onChange={handleInputChange}
                />
                {expandedFields.recipeURL && (
                  <div className="form-text mt-2">
                    Paste the full URL to the online recipe, if available. A snapshot of the page will be taken and archived for later viewing.
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="disabled"
                    name="disabled"
                    checked={recipe.disabled}
                    onChange={handleCheckboxChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="disabled">
                    Disabled
                    <span 
                      className="ms-2 text-secondary" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleFieldDescription('disabled')}
                    >
                      <InfoCircle className="me-1" />
                      {expandedFields.disabled ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  </label>
                </div>
                {expandedFields.disabled && (
                  <div className="form-text mt-2">
                    Check this box if you want to temporarily disable this recipe from appearing in searches or being selected for orders.
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-success">
                Submit
              </button>
            </form>
          </div>

          <div className="csv-upload-form">
            <h4>Bulk Add Recipes from CSV</h4>
            <form onSubmit={uploadCSV}>
              <div className="mb-3">
                <label htmlFor="csvFile" className="form-label fw-bold text-start d-block">
                  CSV File
                  <span 
                    className="ms-2 text-secondary" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFieldDescription('csvFile')}
                  >
                    <InfoCircle className="me-1" />
                    {expandedFields.csvFile ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
                {expandedFields.csvFile && (
                  <div className="form-text mt-2">
                    Upload a CSV file with the following columns: Name, Description, URL, Disabled (true/false).
                    Each row will create a new recipe. The first column (Name) is required, all others are optional.
                  </div>
                )}
                <small className="text-muted d-block mt-2">
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