import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeOrdersService } from '../../services/recipe-orders.service';
import { RecipeOrder } from '../../models/recipe-order';
import { DisplayRecipeOrderDetails } from '../../models/recipe-order-details';

const DisplayOrders: React.FC = () => {
  const [orders, setOrders] = useState<RecipeOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<RecipeOrder | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<DisplayRecipeOrderDetails | null>(null);

  const recipeOrdersService = useRecipeOrdersService();

  const retrieveOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await recipeOrdersService.getAll();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      setError('Failed to load orders');
      setLoading(false);
    }
  }, [recipeOrdersService]);

  useEffect(() => {
    retrieveOrders();
  }, [retrieveOrders]);

  const handleSetActiveOrder = async (order: RecipeOrder, index: number) => {
    try {
      setActiveOrder(order);
      setActiveIndex(index);
      
      // Fetch order details using the correct endpoint and interface
      const orderDetails = await recipeOrdersService.get(order.id);
      setCurrentOrderDetails(orderDetails);
    } catch (error) {
      console.error('Error retrieving order details:', error);
      setError('Failed to load order details');
    }
  };

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) {
      return "No date available";
    }
    try {
      const date = new Date(dateString);
      // Check if date is valid (Invalid Date is not equal to itself in JavaScript)
      if (date.toString() === 'Invalid Date') {
        return "No date available";
      }
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return "No date available";
    }
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
                "list-group-item " + (index === activeIndex ? "active" : "")
              }
              onClick={() => handleSetActiveOrder(order, index)}
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
        {activeOrder && currentOrderDetails ? (
          <div>
            <h4>Order #{activeOrder.id}</h4>
            {currentOrderDetails.message && (
              <div>
                <label><strong>Message:</strong></label>{" "}
                {currentOrderDetails.message}
              </div>
            )}
            
            <h5 className="mt-3">Recipients</h5>
            <ul className="list-group mb-3">
              {currentOrderDetails.selectedUsers.map((user, index) => (
                <li className="list-group-item" key={index}>
                  {user.firstName} {user.lastName}
                </li>
              ))}
            </ul>
            
            <h5>Order Items</h5>
            <ul className="list-group mb-3">
              {currentOrderDetails.selectedRecipes.map((recipe, index) => (
                <li className="list-group-item" key={index}>
                  {recipe.name}
                </li>
              ))}
            </ul>

            <Link
              to={"/orders/" + activeOrder.id}
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