import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeOrdersDataService from '../../services/recipe-orders.service';
import RecipesDataService from '../../services/recipes.service';
import SysUsersDataService from '../../services/sys-users.service';
import { RecipeOrder } from '../../models/recipe-order';
import { RecipeOrderItem } from '../../models/recipe-order-item';
import { RecipeOrderRecipient } from '../../models/recipe-order-recipient';
import { Recipe } from '../../models/recipe';
import { SysUser } from '../../models/sys-user';

const EditOrder: React.FC = () => {
  const initialOrderState: RecipeOrder = {
    id: 0,
    createdAt: new Date(),
    fulfilled: false
  };

  const [currentOrder, setCurrentOrder] = useState<RecipeOrder>(initialOrderState);
  const [orderItems, setOrderItems] = useState<RecipeOrderItem[]>([]);
  const [orderRecipients, setOrderRecipients] = useState<RecipeOrderRecipient[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SysUser[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewOrder = id === 'new';

  useEffect(() => {
    loadRecipesAndUsers();
    if (!isNewOrder && id) {
      getOrder(parseInt(id, 10));
    } else {
      setLoading(false);
    }
  }, [id, isNewOrder]);

  const loadRecipesAndUsers = async () => {
    try {
      const recipesData = await RecipesDataService.getAll();
      setAvailableRecipes(recipesData.filter(recipe => !recipe.disabled));
      
      const usersData = await SysUsersDataService.getAll();
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load recipes or users');
    }
  };

  const getOrder = async (id: number) => {
    try {
      const orderData = await RecipeOrdersDataService.get(id);
      setCurrentOrder(orderData);
      
      const items = await RecipeOrdersDataService.getItems(id);
      setOrderItems(items);
      
      const recipients = await RecipeOrdersDataService.getRecipients(id);
      setOrderRecipients(recipients);
      
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving order:', error);
      setError('Error retrieving order');
      setLoading(false);
    }
  };

  const handleRecipeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipe(parseInt(e.target.value, 10));
  };

  const handleUserChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUser(parseInt(e.target.value, 10));
  };

  const addRecipe = async () => {
    if (!selectedRecipe) {
      setMessage('Please select a recipe to add');
      return;
    }

    // If it's a new order, we need to create the order first
    if (isNewOrder && currentOrder.id === 0) {
      try {
        const newOrder = await RecipeOrdersDataService.create({
          createdAt: new Date(),
          fulfilled: false
        } as RecipeOrder);
        
        setCurrentOrder(newOrder);
        
        // Now add the item to the new order
        const newItem: RecipeOrderItem = {
          id: 0,
          recipeId: selectedRecipe,
          recipeOrderId: newOrder.id
        };
        
        await RecipeOrdersDataService.addItem(newOrder.id, newItem);
        
        // Refresh items list
        const items = await RecipeOrdersDataService.getItems(newOrder.id);
        setOrderItems(items);
        
        setMessage('Recipe added to new order successfully');
      } catch (error) {
        console.error('Error creating new order:', error);
        setMessage('Error creating new order');
      }
    } else {
      // Add item to existing order
      try {
        const newItem: RecipeOrderItem = {
          id: 0,
          recipeId: selectedRecipe,
          recipeOrderId: currentOrder.id
        };
        
        await RecipeOrdersDataService.addItem(currentOrder.id, newItem);
        
        // Refresh items list
        const items = await RecipeOrdersDataService.getItems(currentOrder.id);
        setOrderItems(items);
        
        setMessage('Recipe added successfully');
      } catch (error) {
        console.error('Error adding recipe to order:', error);
        setMessage('Error adding recipe to order');
      }
    }
  };

  const addUser = async () => {
    if (!selectedUser) {
      setMessage('Please select a user to add');
      return;
    }

    // If it's a new order, we need to create the order first
    if (isNewOrder && currentOrder.id === 0) {
      try {
        const newOrder = await RecipeOrdersDataService.create({
          createdAt: new Date(),
          fulfilled: false
        } as RecipeOrder);
        
        setCurrentOrder(newOrder);
        
        // Now add the recipient to the new order
        const newRecipient: RecipeOrderRecipient = {
          id: 0,
          userId: selectedUser,
          recipeOrderId: newOrder.id
        };
        
        await RecipeOrdersDataService.addRecipient(newOrder.id, newRecipient);
        
        // Refresh recipients list
        const recipients = await RecipeOrdersDataService.getRecipients(newOrder.id);
        setOrderRecipients(recipients);
        
        setMessage('User added to new order successfully');
      } catch (error) {
        console.error('Error creating new order:', error);
        setMessage('Error creating new order');
      }
    } else {
      // Add recipient to existing order
      try {
        const newRecipient: RecipeOrderRecipient = {
          id: 0,
          userId: selectedUser,
          recipeOrderId: currentOrder.id
        };
        
        await RecipeOrdersDataService.addRecipient(currentOrder.id, newRecipient);
        
        // Refresh recipients list
        const recipients = await RecipeOrdersDataService.getRecipients(currentOrder.id);
        setOrderRecipients(recipients);
        
        setMessage('User added successfully');
      } catch (error) {
        console.error('Error adding user to order:', error);
        setMessage('Error adding user to order');
      }
    }
  };

  const removeRecipe = async (itemId: number) => {
    try {
      await RecipeOrdersDataService.removeItem(currentOrder.id, itemId);
      
      // Refresh items list
      const items = await RecipeOrdersDataService.getItems(currentOrder.id);
      setOrderItems(items);
      
      setMessage('Recipe removed successfully');
    } catch (error) {
      console.error('Error removing recipe from order:', error);
      setMessage('Error removing recipe from order');
    }
  };

  const removeUser = async (recipientId: number) => {
    try {
      await RecipeOrdersDataService.removeRecipient(currentOrder.id, recipientId);
      
      // Refresh recipients list
      const recipients = await RecipeOrdersDataService.getRecipients(currentOrder.id);
      setOrderRecipients(recipients);
      
      setMessage('User removed successfully');
    } catch (error) {
      console.error('Error removing user from order:', error);
      setMessage('Error removing user from order');
    }
  };

  const fulfillOrder = async () => {
    try {
      await RecipeOrdersDataService.fulfill(currentOrder.id);
      setCurrentOrder({ ...currentOrder, fulfilled: true });
      setMessage('Order marked as fulfilled');
    } catch (error) {
      console.error('Error fulfilling order:', error);
      setMessage('Error fulfilling order');
    }
  };

  const deleteOrder = async () => {
    try {
      await RecipeOrdersDataService.delete(currentOrder.id);
      navigate('/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      setMessage('Error deleting order');
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
      
      {!isNewOrder && currentOrder.id ? (
        <div className="order-status mb-3">
          <strong>Status:</strong> {currentOrder.fulfilled ? 'Fulfilled' : 'Pending'}
          {!currentOrder.fulfilled && (
            <button
              className="btn btn-success ms-3"
              onClick={fulfillOrder}
            >
              Mark as Fulfilled
            </button>
          )}
        </div>
      ) : null}
      
      <div className="row mb-4">
        <div className="col-md-6">
          <h5>Recipes</h5>
          <div className="input-group mb-3">
            <select
              className="form-control"
              onChange={handleRecipeChange}
              value={selectedRecipe}
            >
              <option value="0">Select a recipe</option>
              {availableRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={addRecipe}
              >
                Add Recipe
              </button>
            </div>
          </div>
          
          <ul className="list-group">
            {orderItems.map((item) => {
              const recipe = availableRecipes.find(r => r.id === item.recipeId);
              return (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                  {recipe ? recipe.name : `Recipe #${item.recipeId}`}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeRecipe(item.id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="col-md-6">
          <h5>Recipients</h5>
          <div className="input-group mb-3">
            <select
              className="form-control"
              onChange={handleUserChange}
              value={selectedUser}
            >
              <option value="0">Select a user</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <div className="input-group-append">
              <button
                className="btn btn-primary"
                type="button"
                onClick={addUser}
              >
                Add User
              </button>
            </div>
          </div>
          
          <ul className="list-group">
            {orderRecipients.map((recipient) => {
              const user = availableUsers.find(u => u.id === recipient.userId);
              return (
                <li className="list-group-item d-flex justify-content-between align-items-center" key={recipient.id}>
                  {user ? `${user.firstName} ${user.lastName}` : `User #${recipient.userId}`}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeUser(recipient.id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </button>
        
        {!isNewOrder && (
          <button
            className="btn btn-danger ms-2"
            onClick={deleteOrder}
          >
            Delete Order
          </button>
        )}
      </div>
      
      {message && (
        <div className="alert alert-info mt-3">
          {message}
        </div>
      )}
    </div>
  );
};

export default EditOrder; 