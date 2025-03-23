import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeOrdersDataService from '../../services/recipe-orders.service';
import SysUsersDataService from '../../services/sys-users.service';
import RecipesDataService from '../../services/recipes.service';
import { RecipeOrder } from '../../models/recipe-order';
import { RecipeOrderItem } from '../../models/recipe-order-item';
import { RecipeOrderRecipient } from '../../models/recipe-order-recipient';
import { Recipe } from '../../models/recipe';
import { SysUser } from '../../models/sys-user';

const DisplayOrders: React.FC = () => {
  const [orders, setOrders] = useState<RecipeOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<RecipeOrder | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [orderItems, setOrderItems] = useState<RecipeOrderItem[]>([]);
  const [orderRecipients, setOrderRecipients] = useState<RecipeOrderRecipient[]>([]);
  const [recipes, setRecipes] = useState<Record<number, Recipe>>({});
  const [users, setUsers] = useState<Record<number, SysUser>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    retrieveOrders();
    retrieveRecipes();
    retrieveUsers();
  }, []);

  const retrieveOrders = async () => {
    try {
      setLoading(true);
      const data = await RecipeOrdersDataService.getAll();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  };

  const retrieveRecipes = async () => {
    try {
      const data = await RecipesDataService.getAll();
      const recipeMap: Record<number, Recipe> = {};
      data.forEach((recipe) => {
        recipeMap[recipe.id] = recipe;
      });
      setRecipes(recipeMap);
    } catch (error) {
      console.error('Error retrieving recipes:', error);
      setError('Failed to load recipes');
    }
  };

  const retrieveUsers = async () => {
    try {
      const data = await SysUsersDataService.getAll();
      const userMap: Record<number, SysUser> = {};
      data.forEach((user) => {
        userMap[user.id] = user;
      });
      setUsers(userMap);
    } catch (error) {
      console.error('Error retrieving users:', error);
      setError('Failed to load users');
    }
  };

  const refreshList = () => {
    retrieveOrders();
    setCurrentOrder(null);
    setCurrentIndex(-1);
    setOrderItems([]);
    setOrderRecipients([]);
  };

  const setActiveOrder = async (order: RecipeOrder, index: number) => {
    try {
      setCurrentOrder(order);
      setCurrentIndex(index);
      
      // Fetch order items and recipients
      const items = await RecipeOrdersDataService.getItems(order.id);
      setOrderItems(items);
      
      const recipients = await RecipeOrdersDataService.getRecipients(order.id);
      setOrderRecipients(recipients);
    } catch (error) {
      console.error('Error retrieving order details:', error);
      setError('Failed to load order details');
    }
  };

  const fulfillOrder = async (id: number) => {
    try {
      await RecipeOrdersDataService.fulfill(id);
      refreshList();
    } catch (error) {
      console.error('Error fulfilling order:', error);
      setError('Failed to fulfill order');
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserName = (userId: number) => {
    const user = users[userId];
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Unknown User';
  };

  const getRecipeName = (recipeId: number) => {
    const recipe = recipes[recipeId];
    if (recipe) {
      return recipe.name;
    }
    return 'Unknown Recipe';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="list row">
      <div className="col-md-6">
        <h4>Orders List</h4>

        <ul className="list-group">
          {orders && orders.map((order, index) => (
            <li
              className={
                "list-group-item " + (index === currentIndex ? "active" : "")
              }
              onClick={() => setActiveOrder(order, index)}
              key={index}
            >
              Order #{order.id} ({formatDate(order.createdAt)}) - 
              {order.fulfilled ? " Fulfilled" : " Pending"}
            </li>
          ))}
        </ul>

        <Link to="/orders/new" className="btn btn-primary mt-3">
          New Order
        </Link>
      </div>
      <div className="col-md-6">
        {currentOrder ? (
          <div>
            <h4>Order #{currentOrder.id}</h4>
            <div>
              <label>
                <strong>Created Date:</strong>
              </label>{" "}
              {formatDate(currentOrder.createdAt)}
            </div>
            <div>
              <label>
                <strong>Status:</strong>
              </label>{" "}
              {currentOrder.fulfilled ? "Fulfilled" : "Pending"}
            </div>
            
            <h5 className="mt-3">Recipients</h5>
            <ul className="list-group mb-3">
              {orderRecipients.map((recipient, index) => (
                <li className="list-group-item" key={index}>
                  {getUserName(recipient.userId)}
                </li>
              ))}
            </ul>
            
            <h5>Order Items</h5>
            <ul className="list-group mb-3">
              {orderItems.map((item, index) => (
                <li className="list-group-item" key={index}>
                  {getRecipeName(item.recipeId)}
                </li>
              ))}
            </ul>

            {!currentOrder.fulfilled && (
              <button
                className="btn btn-success"
                onClick={() => fulfillOrder(currentOrder.id)}
              >
                Mark as Fulfilled
              </button>
            )}
            <Link
              to={"/orders/" + currentOrder.id}
              className="btn btn-warning ms-2"
            >
              Edit
            </Link>
          </div>
        ) : (
          <div>
            <br />
            <p>Please click on an Order...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayOrders; 