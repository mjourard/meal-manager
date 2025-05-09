import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipesService } from '../../services/recipes.service';
import { useSysUsersService } from '../../services/sys-users.service';
import { useRecipeOrdersService } from '../../services/recipe-orders.service';
import { useLoggingService, LogLevel } from '../../services/logging.service';
import { Recipe } from '../../models/recipe';
import { DisplaySysUser } from '../../models/sys-user';
import { CreateRecipeOrderDetails } from '../../models/recipe-order-details';

const COMPONENT_NAME = 'CreateOrder';

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const recipesService = useRecipesService();
  const usersService = useSysUsersService();
  const recipeOrdersService = useRecipeOrdersService();
  
  // Call the hook at the top level
  const logger = useLoggingService({
    minLevel: LogLevel.DEBUG,
    includeCorrelationId: true
  });
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<DisplaySysUser[]>([]);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchRecipe, setSearchRecipe] = useState<string>('');
  
  // Create a data loading function outside of useEffect to avoid dependencies
  const loadData = async () => {
    const sessionId = Date.now().toString();
    
    logger.info(`Fetching initial data for order creation [Session: ${sessionId}]`, COMPONENT_NAME);
    
    setLoading(true);
    try {
      logger.debug(`Fetching recipes, users, and default users [Session: ${sessionId}]`, COMPONENT_NAME);
      
      const [recipesData, usersData, defaultUsers] = await Promise.all([
        recipesService.getAll(),
        usersService.getAll(),
        usersService.getDefaultChecked()
      ]);
      
      logger.debug(
        `Retrieved ${recipesData.length} recipes, ${usersData.length} users, ${defaultUsers.length} default users`, 
        COMPONENT_NAME
      );
      
      setRecipes(recipesData);
      setUsers(usersData);
      
      // Pre-select default users
      const defaultUserIds = defaultUsers.map(user => user.id);
      setSelectedUserIds(defaultUserIds);
      
      logger.debug(`Pre-selected ${defaultUserIds.length} default users`, COMPONENT_NAME);
    } catch (error) {
      logger.error('Failed to load data for order creation', error, COMPONENT_NAME);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      logger.info(`Initial data loading completed ${error ? 'with errors' : 'successfully'}`, COMPONENT_NAME);
    }
  };
  
  // Fetch recipes and users on component mount
  useEffect(() => {
    // Only load data once when the component mounts
    loadData();
    
    // Empty dependency array means this only runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleRecipeToggle = (recipeId: number) => {
    setSelectedRecipeIds(prevSelected => {
      const isCurrentlySelected = prevSelected.includes(recipeId);
      const newSelected = isCurrentlySelected
        ? prevSelected.filter(id => id !== recipeId)
        : [...prevSelected, recipeId];
      
      const recipe = recipes.find(r => r.id === recipeId);
      
      logger.debug(
        `Recipe ${recipe?.name || recipeId} ${isCurrentlySelected ? 'deselected' : 'selected'}. Total selected: ${newSelected.length}`, 
        COMPONENT_NAME
      );
      
      return newSelected;
    });
  };
  
  const handleUserToggle = (userId: number) => {
    setSelectedUserIds(prevSelected => {
      const isCurrentlySelected = prevSelected.includes(userId);
      const newSelected = isCurrentlySelected
        ? prevSelected.filter(id => id !== userId)
        : [...prevSelected, userId];
      
      const user = users.find(u => u.id === userId);
      const userName = user ? `${user.firstName} ${user.lastName}` : `User ${userId}`;
      
      logger.debug(
        `User ${userName} ${isCurrentlySelected ? 'deselected' : 'selected'}. Total selected: ${newSelected.length}`, 
        COMPONENT_NAME
      );
      
      return newSelected;
    });
  };
  
  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    if (newMessage.length > 0 && newMessage.length % 50 === 0) {
      logger.debug(`Message updated with ${newMessage.length} characters`, COMPONENT_NAME);
    }
  };
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchRecipe(searchTerm);
    
    logger.debug(`Search query updated to "${searchTerm}"`, COMPONENT_NAME);
  };
  
  const filteredRecipes = searchRecipe
    ? recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchRecipe.toLowerCase())
      )
    : recipes;
    
  useEffect(() => {
    if (searchRecipe) {
      const filterRatio = filteredRecipes.length / Math.max(recipes.length, 1);
      logger.debug(
        `Search "${searchRecipe}" returned ${filteredRecipes.length}/${recipes.length} recipes (${(filterRatio * 100).toFixed(1)}%)`, 
        COMPONENT_NAME
      );
    }
  // Remove logger from dependency array to prevent re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRecipe, filteredRecipes.length, recipes.length]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderSessionId = `order-${Date.now()}`;
    
    logger.info(`Order submission initiated [Session: ${orderSessionId}] with ${selectedRecipeIds.length} recipes and ${selectedUserIds.length} users`, COMPONENT_NAME);
    
    if (selectedRecipeIds.length === 0) {
      logger.warn('Submission failed: No recipes selected', COMPONENT_NAME);
      setError('Please select at least one recipe.');
      return;
    }
    
    if (selectedUserIds.length === 0) {
      logger.warn('Submission failed: No users selected', COMPONENT_NAME);
      setError('Please select at least one recipient.');
      return;
    }
    
    setError(null);
    setSubmitting(true);
    
    try {
      // Get names for logging
      const recipeNames = selectedRecipeIds.map(id => {
        const recipe = recipes.find(r => r.id === id);
        return recipe ? recipe.name : `Unknown (${id})`;
      });
      
      const userNames = selectedUserIds.map(id => {
        const user = users.find(u => u.id === id);
        return user ? `${user.firstName} ${user.lastName}` : `Unknown (${id})`;
      });
      
      logger.info(
        `Creating order with recipes: ${recipeNames.join(', ')} for users: ${userNames.join(', ')}`, 
        COMPONENT_NAME
      );
      
      const orderData: CreateRecipeOrderDetails = {
        selectedRecipes: selectedRecipeIds,
        selectedUserIds: selectedUserIds,
        message: message
      };
      
      const response = await recipeOrdersService.create(orderData);
      
      logger.info(`Order #${response.id} created successfully`, COMPONENT_NAME);
      setSuccess(`Order #${response.id} created successfully!`);
      
      // Wait briefly then redirect to the orders page
      setTimeout(() => {
        logger.info(`Redirecting to orders page`, COMPONENT_NAME);
        navigate('/orders');
      }, 1500);
    } catch (error) {
      logger.error(
        `Failed to create order with ${selectedRecipeIds.length} recipes and ${selectedUserIds.length} users`, 
        error, 
        COMPONENT_NAME
      );
      
      setError('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSelectAll = (type: 'recipes' | 'users') => {
    if (type === 'recipes') {
      const allRecipeIds = recipes.map(recipe => recipe.id);
      setSelectedRecipeIds(allRecipeIds);
      
      logger.debug(`Selected all ${allRecipeIds.length} recipes`, COMPONENT_NAME);
    } else {
      const allUserIds = users.map(user => user.id);
      setSelectedUserIds(allUserIds);
      
      logger.debug(`Selected all ${allUserIds.length} users`, COMPONENT_NAME);
    }
  };
  
  const handleDeselectAll = (type: 'recipes' | 'users') => {
    if (type === 'recipes') {
      const count = selectedRecipeIds.length;
      logger.debug(`Deselected all ${count} recipes`, COMPONENT_NAME);
      setSelectedRecipeIds([]);
    } else {
      const count = selectedUserIds.length;
      logger.debug(`Deselected all ${count} users`, COMPONENT_NAME);
      setSelectedUserIds([]);
    }
  };
  
  // Log component render and cleanup
  useEffect(() => {
    logger.info('CreateOrder component mounted', COMPONENT_NAME);
    
    return () => {
      logger.info('CreateOrder component unmounting', COMPONENT_NAME);
    };
  // Empty dependency array means this only runs once on mount/unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h2 className="mb-4">Create New Order</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Select Recipes</h4>
                <div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleSelectAll('recipes')}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleDeselectAll('recipes')}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search recipes..."
                    value={searchRecipe}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="recipe-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredRecipes.length === 0 ? (
                    <p className="text-muted">No recipes found.</p>
                  ) : (
                    filteredRecipes.map(recipe => (
                      <div className="form-check mb-2" key={recipe.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`recipe-${recipe.id}`}
                          checked={selectedRecipeIds.includes(recipe.id)}
                          onChange={() => handleRecipeToggle(recipe.id)}
                        />
                        <label className="form-check-label" htmlFor={`recipe-${recipe.id}`}>
                          {recipe.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card-footer text-muted">
                {selectedRecipeIds.length} recipes selected
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Select Recipients</h4>
                <div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleSelectAll('users')}
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleDeselectAll('users')}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="user-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {users.length === 0 ? (
                    <p className="text-muted">No users found.</p>
                  ) : (
                    users.map(user => (
                      <div className="form-check mb-2" key={user.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                        />
                        <label className="form-check-label" htmlFor={`user-${user.id}`}>
                          {user.firstName} {user.lastName} ({user.email})
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card-footer text-muted">
                {selectedUserIds.length} recipients selected
              </div>
            </div>
          </div>
          
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header">
                <h4 className="mb-0">Additional Message</h4>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Add a message to include with this order (optional)"
                  value={message}
                  onChange={handleMessageChange}
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex justify-content-between mb-5">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || selectedRecipeIds.length === 0 || selectedUserIds.length === 0}
          >
            {submitting ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder; 