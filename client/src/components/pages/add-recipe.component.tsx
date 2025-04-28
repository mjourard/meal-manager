import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipesService } from '../../services/recipes.service';
import { useCrawlerJobsService } from '../../services/crawler-jobs.service'; 
import { CreateRecipe } from '../../models/recipe';
import { InfoCircle, ChevronDown, ChevronUp } from 'react-bootstrap-icons';

const AddRecipe: React.FC = () => {
  const initialRecipeState: CreateRecipe = {
    name: '',
    description: '',
    recipeURL: '',
    disabled: false
  };

  const recipesService = useRecipesService();
  const crawlerJobsService = useCrawlerJobsService();

  const [recipe, setRecipe] = useState<CreateRecipe>(initialRecipeState);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batchSubmitted, setBatchSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // State for entry mode toggle
  const [entryMode, setEntryMode] = useState<'manual' | 'url'>('manual');
  
  // State for URL-based entry
  const [crawlerUrl, setCrawlerUrl] = useState<string>('');
  const [crawlDepth, setCrawlDepth] = useState<number>(1);
  const [forceOverrideValidation, setForceOverrideValidation] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [jobCreated, setJobCreated] = useState<boolean>(false);
  const [jobId, setJobId] = useState<number | null>(null);
  
  // State for expanded field descriptions
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({
    name: false,
    description: false,
    recipeURL: false,
    disabled: false,
    csvFile: false,
    entryMode: false,
    crawlerUrl: false,
    crawlDepth: false,
    forceOverrideValidation: false
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
      await recipesService.create(recipe);
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
    setJobCreated(false);
    setJobId(null);
    setCrawlerUrl('');
    setCrawlDepth(1);
    setForceOverrideValidation(false);
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
          // Instead of calling removed multiCreate method, show a message that CSV upload is not available
          setError('CSV upload is not available in the current version');
          console.warn('CSV upload functionality has been disabled');
          // The multi-create feature was removed due to build issues with PapaParse
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

  // Handle URL-based recipe creation
  const createCrawlerJob = async (e: FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);

    if (!crawlerUrl) {
      setError('Please enter a URL');
      setIsValidating(false);
      return;
    }

    if (!recipe.name) {
      setError('Please enter a recipe name');
      setIsValidating(false);
      return;
    }
    
    try {
      const response = await crawlerJobsService.createCrawlerJob({
        url: crawlerUrl,
        recipeName: recipe.name,
        recipeDescription: recipe.description || undefined,
        crawlDepth: crawlDepth,
        forceOverrideValidation: forceOverrideValidation
      });
      
      setJobCreated(true);
      setJobId(response.id);
      setMessage(`Crawler job created successfully! Job ID: ${response.id}`);
    } catch (error) {
      console.error('Error creating crawler job:', error);
      if (error instanceof Error && error.message.includes('400')) {
        setError('URL validation failed. You can force override validation if you believe the URL is correct.');
      } else if (error instanceof Error && error.message.includes('429')) {
        setError('Rate limit exceeded. Please try again later.');
      } else {
        setError('Failed to create crawler job');
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Navigate to job details
  const viewJobDetails = () => {
    if (jobId) {
      navigate(`/crawler-jobs/${jobId}`);
    }
  };

  return (
    <div className="add-recipe-container">
      {submitted || batchSubmitted || jobCreated ? (
        <div>
          <h4>
            {jobCreated 
              ? 'Recipe crawler job was submitted successfully!' 
              : `Recipe${batchSubmitted ? 's were' : ' was'} submitted successfully!`}
          </h4>
          {jobCreated && (
            <p className="text-info">
              The recipe URL is being processed. You can check the job status in the crawler jobs page.
            </p>
          )}
          <div className="mt-3">
            <button className="btn btn-success" onClick={newRecipe}>
              Add Another
            </button>
            {jobCreated && jobId && (
              <>
                <button className="btn btn-info ms-2" onClick={viewJobDetails}>
                  View Job Details
                </button>
                <button className="btn btn-secondary ms-2" onClick={() => navigate('/crawler-jobs')}>
                  View All Jobs
                </button>
              </>
            )}
            <button 
              className="btn btn-primary ms-2" 
              onClick={() => navigate('/recipes')}
            >
              Back to Recipes
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="entry-mode-toggle mb-4">
            <h4>Add Recipe</h4>
            <div className="form-text mb-2">
              <InfoCircle className="me-1" />
              Choose how you want to add a recipe: manually enter details or provide a URL to an online recipe.
            </div>
            <div className="btn-group" role="group" aria-label="Recipe entry mode">
              <button 
                type="button" 
                className={`btn ${entryMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setEntryMode('manual')}
              >
                Manual Entry
              </button>
              <button 
                type="button" 
                className={`btn ${entryMode === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setEntryMode('url')}
              >
                URL Entry
              </button>
            </div>
          </div>

          {entryMode === 'manual' ? (
            <div className="single-recipe-form mb-5">
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
          ) : (
            <div className="url-recipe-form mb-5">
              <form onSubmit={createCrawlerJob}>
                <div className="alert alert-info">
                  <InfoCircle className="me-2" />
                  When you submit a URL, a crawler job will be created to fetch and archive the recipe page.
                  The job will run in the background and you'll be notified when it's complete.
                </div>

                <div className="mb-3">
                  <label htmlFor="recipeName" className="form-label fw-bold text-start d-block">
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
                    id="recipeName"
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
                  <label htmlFor="recipeDescription" className="form-label fw-bold text-start d-block">
                    Description (Optional)
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
                    id="recipeDescription"
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
                  <label htmlFor="crawlerUrl" className="form-label fw-bold text-start d-block">
                    Recipe URL
                    <span 
                      className="ms-2 text-secondary" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleFieldDescription('crawlerUrl')}
                    >
                      <InfoCircle className="me-1" />
                      {expandedFields.crawlerUrl ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    id="crawlerUrl"
                    value={crawlerUrl}
                    onChange={(e) => setCrawlerUrl(e.target.value)}
                    required
                  />
                  {expandedFields.crawlerUrl && (
                    <div className="form-text mt-2">
                      Enter the URL of the recipe you want to save. The system will download and archive this page.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="crawlDepth" className="form-label fw-bold text-start d-block">
                    Crawl Depth
                    <span 
                      className="ms-2 text-secondary" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleFieldDescription('crawlDepth')}
                    >
                      <InfoCircle className="me-1" />
                      {expandedFields.crawlDepth ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  </label>
                  <select
                    className="form-select"
                    id="crawlDepth"
                    value={crawlDepth}
                    onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  >
                    <option value={0}>0 - Just the main page</option>
                    <option value={1}>1 - Main page and direct links</option>
                    <option value={2}>2 - Two levels deep</option>
                    <option value={3}>3 - Three levels deep</option>
                    <option value={4}>4 - Four levels deep</option>
                    <option value={5}>5 - Five levels deep (maximum)</option>
                  </select>
                  {expandedFields.crawlDepth && (
                    <div className="form-text mt-2">
                      Choose how many levels of links the crawler should follow from the main URL. Higher values will archive more content but take longer.
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="forceOverrideValidation"
                      checked={forceOverrideValidation}
                      onChange={(e) => setForceOverrideValidation(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold" htmlFor="forceOverrideValidation">
                      Override URL Validation
                      <span 
                        className="ms-2 text-secondary" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleFieldDescription('forceOverrideValidation')}
                      >
                        <InfoCircle className="me-1" />
                        {expandedFields.forceOverrideValidation ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </span>
                    </label>
                  </div>
                  {expandedFields.forceOverrideValidation && (
                    <div className="form-text mt-2">
                      Check this box to force the system to accept the URL even if it fails validation (e.g., if the site returns errors or is inaccessible).
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-success" disabled={isValidating}>
                  {isValidating ? 'Validating...' : 'Submit URL'}
                </button>
              </form>
            </div>
          )}

          {entryMode === 'manual' && (
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
          )}
          
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