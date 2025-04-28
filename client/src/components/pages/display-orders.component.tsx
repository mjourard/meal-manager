import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeOrdersService } from '../../services/recipe-orders.service';
import { RecipeOrder } from '../../models/recipe-order';
import { DisplayRecipeOrderDetails } from '../../models/recipe-order-details';

const DisplayOrders: React.FC = () => {
  // Use the hook for recipe orders service
  const recipeOrdersService = useRecipeOrdersService();
  
  const [orders, setOrders] = useState<RecipeOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<RecipeOrder | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<DisplayRecipeOrderDetails | null>(null);

  useEffect(() => {
    retrieveOrders();
  }, [recipeOrdersService]);

  const retrieveOrders = async () => {
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
  };

  const setActiveOrder = async (order: RecipeOrder, index: number) => {
    try {
      setCurrentOrder(order);
      setCurrentIndex(index);
      
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
        {currentOrder && currentOrderDetails ? (
          <div>
            <h4>Order #{currentOrder.id}</h4>
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