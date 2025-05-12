import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeOrdersService } from '../../services/recipe-orders.service';
import { useRecipesService } from '../../services/recipes.service';
import { useSysUsersService } from '../../services/sys-users.service';
import { RecipeOrderDetails } from '../../models/recipe-order-details';
import { DisplayRecipe } from '../../models/recipe';
import { DisplaySysUser } from '../../models/sys-user';

const EditOrder: React.FC = () => {
  const initialOrderState: RecipeOrderDetails = {
    id: 0,
    selectedRecipes: [],
    selectedUsers: [],
    message: ''
  };

  // Services
  const recipeOrdersService = useRecipeOrdersService();
  const recipesService = useRecipesService();
  const sysUsersService = useSysUsersService();

  const [currentOrder, setCurrentOrder] = useState<RecipeOrderDetails>(initialOrderState);
  const [availableRecipes, setAvailableRecipes] = useState<DisplayRecipe[]>([]);
  const [availableUsers, setAvailableUsers] = useState<DisplaySysUser[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number>(0);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewOrder = id === 'new';

  const loadRecipesAndUsers = useCallback(async () => {
    try {
      const recipesData = await recipesService.getAll();
      setAvailableRecipes(recipesData.filter((recipe: DisplayRecipe) => !recipe.disabled));
      
      const usersData = await sysUsersService.getAll();
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load recipes or users');
    }
  }, [recipesService, sysUsersService]);

  const getOrder = useCallback(async (id: number) => {
    try {
      const orderData = await recipeOrdersService.get(id);
      setCurrentOrder(orderData);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving order:', error);
      setError('Error retrieving order');
      setLoading(false);
    }
  }, [recipeOrdersService]);

  useEffect(() => {
    loadRecipesAndUsers();
    if (!isNewOrder && id) {
      getOrder(parseInt(id, 10));
    } else {
      setLoading(false);
    }
  }, [id, isNewOrder, loadRecipesAndUsers, getOrder]);

  const handleRecipeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipeId(parseInt(e.target.value, 10));
  };

  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(parseInt(e.target.value, 10));
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentOrder({
      ...currentOrder,
      message: e.target.value
    });
  };

  const addRecipe = () => {
    if (!selectedRecipeId) {
      setMessage('Please select a recipe to add');
      return;
    }

    const recipeToAdd = availableRecipes.find(r => r.id === selectedRecipeId);
    if (!recipeToAdd) return;

    // Check if recipe is already in the list
    if (currentOrder.selectedRecipes.some(r => r.id === selectedRecipeId)) {
      setMessage('This recipe is already added to the order');
      return;
    }

    setCurrentOrder({
      ...currentOrder,
      selectedRecipes: [...currentOrder.selectedRecipes, recipeToAdd]
    });
    setSelectedRecipeId(0); // Reset selection
  };

  const addUser = () => {
    if (!selectedUserId) {
      setMessage('Please select a user to add');
      return;
    }

    const userToAdd = availableUsers.find(u => u.id === selectedUserId);
    if (!userToAdd) return;

    // Check if user is already in the list
    if (currentOrder.selectedUsers.some(u => u.id === selectedUserId)) {
      setMessage('This user is already added to the order');
      return;
    }

    setCurrentOrder({
      ...currentOrder,
      selectedUsers: [...currentOrder.selectedUsers, userToAdd]
    });
    setSelectedUserId(0); // Reset selection
  };

  const removeRecipe = (recipeId: number) => {
    setCurrentOrder({
      ...currentOrder,
      selectedRecipes: currentOrder.selectedRecipes.filter(r => r.id !== recipeId)
    });
  };

  const removeUser = (userId: number) => {
    setCurrentOrder({
      ...currentOrder,
      selectedUsers: currentOrder.selectedUsers.filter(u => u.id !== userId)
    });
  };

  const saveOrder = async (e: FormEvent) => {
    e.preventDefault();
    
    if (currentOrder.selectedRecipes.length === 0) {
      setMessage('Please add at least one recipe to the order');
      return;
    }

    if (currentOrder.selectedUsers.length === 0) {
      setMessage('Please add at least one recipient to the order');
      return;
    }

    try {
      // Prepare data for API
      const orderData = {
        selectedRecipes: currentOrder.selectedRecipes.map(r => r.id),
        selectedUserIds: currentOrder.selectedUsers.map(u => u.id),
        message: currentOrder.message || ''
      };

      if (isNewOrder) {
        await recipeOrdersService.create(orderData);
        setMessage('Order created successfully');
      } else {
        // If you implement update functionality in the future
        setMessage('Order updated successfully');
      }
      
      // Navigate back to orders list after a short delay
      setTimeout(() => navigate('/orders'), 1500);
    } catch (error) {
      console.error('Error saving order:', error);
      setMessage('Error saving order');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="edit-order-container">
      <h4>{isNewOrder ? 'New Order' : `Edit Order #${currentOrder.id}`}</h4>
      
      <form onSubmit={saveOrder}>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Order Message</label>
          <textarea
            className="form-control"
            id="message"
            name="message"
            rows={3}
            value={currentOrder.message || ''}
            onChange={handleMessageChange}
            placeholder="Add a message for this order (optional)"
          />
        </div>
        
        <div className="row mb-4">
          <div className="col-md-6">
            <h5>Recipes</h5>
            <div className="input-group mb-3">
              <select
                className="form-control"
                onChange={handleRecipeChange}
                value={selectedRecipeId}
              >
                <option value="0">Select a recipe</option>
                {availableRecipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                type="button"
                onClick={addRecipe}
              >
                Add Recipe
              </button>
            </div>
            
            <ul className="list-group">
              {currentOrder.selectedRecipes.map((recipe) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={recipe.id}>
                  {recipe.name}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeRecipe(recipe.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="col-md-6">
            <h5>Recipients</h5>
            <div className="input-group mb-3">
              <select
                className="form-control"
                onChange={handleUserChange}
                value={selectedUserId}
              >
                <option value="0">Select a user</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                type="button"
                onClick={addUser}
              >
                Add User
              </button>
            </div>
            
            <ul className="list-group">
              {currentOrder.selectedUsers.map((user) => (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={user.id}>
                  {user.firstName} {user.lastName}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeUser(user.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-success"
          >
            {isNewOrder ? 'Create Order' : 'Update Order'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </button>
        </div>
      </form>
      
      {message && (
        <div className="alert alert-info mt-3">
          {message}
        </div>
      )}
    </div>
  );
};

export default EditOrder; 